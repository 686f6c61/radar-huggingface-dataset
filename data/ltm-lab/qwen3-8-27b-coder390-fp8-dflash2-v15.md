# LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v15

## Resumen

LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v15 es un paquete de despliegue, no un modelo entrenado desde cero, que empaqueta los pesos FP8 del modelo Coder390 (27B) junto con su torre de visión, la cabeza MTP y el componente de decodificación especulativa DFlash2, todo ello dentro del servidor nativo NInfer V15. El modelo base es nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, un fine-tune derivado de la familia Qwen 3.8 orientado a código y razonamiento eficiente. El paquete añade una configuración V15 con almacén episódico persistente (memoria episódica basada en SQLite con formato FORMAT 6), pensada para recuperar información entre sesiones.

El problema que resuelve es la integración lista para producción de un stack de inferencia con decodificación especulativa, cuantización FP8 y memoria persistente en una sola imagen de contenedor, sobre una única GPU Blackwell con soporte `sm_120a`. El repositorio ocupa 30,3 GB y es byte-idéntico al artefacto FP8 upstream (SHA-256 `ebacda594ff7bdce5ab13eac88ea1b15dff0df0fffb4691c1b333a88a4baceb3`), por lo que su valor está en el runtime y la configuración, no en pesos nuevos.

Es relevante ahora porque demuestra un patrón de despliegue concreto: contexto de hasta 262 144 tokens, decodificación especulativa con DFlash2 o MTP, KV en FP8 y concurrencia de 8 peticiones, con mediciones publicadas de velocidad de decodificación y aceptación de borradores sobre una RTX PRO 6000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión, cabeza MTP y componente de decodificación especulativa DFlash2 (detalles internos no disponibles) |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (configurado con `--max-context 262144`) |
| Tipos de cuantizacion | FP8 (pesos y KV cache FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | artefacto nativo `.ninfer` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un derivado de Qwen 3.8 de 27B con torre de visión (pipeline `image-text-to-text`), una cabeza MTP (multi-token prediction) y un componente DFlash2 de decodificación especulativa. El paquete incluye pesos de texto FP8, torre de visión, cabeza MTP y DFlash2 empaquetados conjuntamente, junto con tokenizer, ajustes de processor y chat template extraídos del artefacto upstream.

No se han publicado en la información proporcionada datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. El nombre del modelo base sugiere etapas de SFT y RLOO (SFT-RLOO) y una orientación a "EfficientThink", pero no hay cifras verificables. La innovación técnica destacable del paquete es la integración de memoria episódica persistente (opción `recall_bridge_context`, que restaura un interlocutor elegible desde un enlace confirmado dentro del presupuesto de contexto restante) y la decodificación especulativa con dos backends alternativos: DFlash2 (7 tokens borrador) y MTP (3 tokens borrador).

## Capacidades

- Generación de texto y razonamiento en modo "thinking" eficiente (según la denominación EfficientThink del modelo base).
- Generación de código, dada la orientación Coder390 del modelo base.
- Visión e imagen-a-texto: pipeline `image-text-to-text` con torre de visión incluida.
- Decodificación especulativa con DFlash2 o MTP para acelerar la generación.
- Memoria episódica persistente mediante almacén SQLite (FORMAT 6) y segmentos, con recuperación entre sesiones.
- Servicio de chat compatible con la API `/v1/chat/completions`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistentes de código con memoria de proyecto: el almacén episódico persistente permite recordar decisiones y contexto de sesiones anteriores, útil en un IDE o CLI de desarrollo que retoma conversaciones largas sin repetir contexto.
- Análisis de imágenes en flujos de documentación técnica: la torre de visión permite procesar capturas de pantalla, diagramas o errores visuales y generar explicaciones o parches de código asociados.
- Servicio de chat de baja latencia en una sola GPU: con 106,6 tok/s de decodificación media y 0,39 s hasta el primer token (DFlash2), es adecuado para interfaces interactivas con concurrencia de 8 peticiones.
- Procesamiento de repositorios y documentos extensos: la ventana de 262 144 tokens permite ingerir ficheros grandes o varios documentos en una sola petición de análisis.
- Recuperación de contexto entre sesiones en soporte técnico: la memoria episódica con `recall_bridge_context` permite resolver consultas de dos saltos (por ejemplo, búsquedas de ciudad) recuperando información de interacciones previas.
- Evaluación de stacks de inferencia: sirve como banco de pruebas reproducible para comparar DFlash2 frente a MTP en términos de velocidad y aceptación de borradores antes de adoptar uno en producción.
- Despliegue en infraestructura Blackwell: al requerir `sm_120a`, encaja en entornos con RTX PRO 6000 u otras GPU Blackwell donde se quiera validar FP8 nativo con KV en FP8.

## Benchmarks y rendimiento

Mediciones publicadas por el autor sobre una RTX PRO 6000 (96 GB), una petición a la vez, KV en FP8, tres prompts fijos y 400 tokens de salida por prompt, con build nativo `77d3033`:

| Backend | Velocidad media de decodificación | Latencia media al primer token | Aceptación de borradores |
|---|---:|---:|---:|
| DFlash2, 7 tokens borrador | 106,6 tok/s | 0,39 s | 20,77% |
| MTP, 3 tokens borrador | 98,8 tok/s | 0,45 s | 45,97% |

Evaluación de memoria episódica: con el lector actualizado y el almacén post-sleep del propio modelo, Coder390 respondió correctamente 9 de 11 preguntas con DFlash2, frente a 8 de 11 con el lector anterior. La respuesta recuperada fue una búsqueda de ciudad de dos saltos. Ninguno de los dos builds produjo respuesta final en dos ítems dentro del presupuesto de 800 tokens.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 30,3 GB en FP8; se ha validado en una GPU de 96 GB con KV en FP8 y contexto de 262 144 tokens.
- GPU recomendadas: RTX PRO 6000 (96 GB) como referencia medida; se requiere arquitectura Blackwell con soporte `sm_120a`.
- Cabe en GPU consumer: no disponible; el requisito `sm_120a` y el tamaño del paquete limitan su uso a GPU Blackwell profesionales o de centro de datos.
- Opciones de despliegue: exclusivamente el servidor NInfer V15 mediante la imagen Docker `lovewin10/ninfer-v15:5a5c2c1-cu13-v15`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.ninfer`.
- Latencia y throughput: 106,6 tok/s de decodificación media y 0,39 s al primer token con DFlash2; 98,8 tok/s y 0,45 s con MTP, con concurrencia configurada de 8.
- Almacenamiento: volumen adicional para el almacén de memoria episódica (SQLite y segmentos).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada. A continuación se compara únicamente con el artefacto upstream del que deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v15 | 27B | 262 144 | `.ninfer` (FP8) + runtime NInfer V15 | Apache-2.0 | Hugging Face, 0 descargas |
| nerkyor/Qwen3.8-27B-Coder390-...-MTP-DFlash2 (upstream) | 27B | no disponible | artefacto FP8 upstream | Apache-2.0 | Hugging Face |

No se conocen modelos comparables adicionales de la misma categoría con datos verificables en la información disponible.

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos: es byte-idéntico al artefacto FP8 upstream, por lo que las mejoras de calidad dependen del modelo base, no de este repositorio.
- Dependencia de un runtime propietario: requiere la imagen NInfer V15 y GPU Blackwell con `sm_120a`; no es portable a otros motores de inferencia.
- La aceptación de borradores con DFlash2 es baja (20,77%) frente a MTP (45,97%), lo que puede limitar la ganancia real de la decodificación especulativa según la carga.
- En la evaluación de memoria episódica, 2 de 11 preguntas no obtuvieron respuesta dentro del presupuesto de 800 tokens, lo que indica límites del mecanismo de recuperación.
- Riesgo de alucinación: no hay datos publicados de evaluación de fidelidad; el modelo base es un fine-tune de la familia Qwen sin documentación de sesgos en esta ficha.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Sin datos de tool calling ni de uso agéntico; no conviene asumir su disponibilidad en producción.
- Licencia Apache-2.0 declarada por el publicador upstream, pero conviene verificar la cadena de licencias del modelo base y del parche NInfer antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-Coder390-FP8-DFlash2-v15
- Modelo base upstream: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Artefacto FP8 upstream: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2/blob/7eced947d7132dffbc2c0ea4db332081360afbf8/FP8/Qwen3.8-27B-Coder390-FP8-DFlash2.ninfer
- README del parche NInfer: ninfer-v15-patch/README.md (incluido en el repositorio)
- Imagen Docker: lovewin10/ninfer-v15:5a5c2c1-cu13-v15
