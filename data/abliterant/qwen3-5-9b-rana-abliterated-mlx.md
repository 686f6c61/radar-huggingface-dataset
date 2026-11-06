# abliterant/Qwen3.5-9B-RANA-abliterated-MLX

## Resumen

Qwen3.5-9B-RANA-abliterated-MLX es una conversión a formato MLX del modelo abliterant/Qwen3.5-9B-RANA-abliterated, que a su vez deriva del Qwen/Qwen3.5-9B de Alibaba. La desarrolla el colectivo Abliterant y aplica una técnica de "ablación de rechazo" (refusal ablation) sobre los pesos del modelo base, eliminando el comportamiento de negativa ante peticiones consideradas dañinas. Está pensado para ejecutarse en Apple Silicon mediante la librería MLX y su extensión mlx-vlm.

El modelo es un vision-language de 9.409.813.744 parámetros con una ventana de contexto configurada de 262.144 tokens. Empaqueta la visión en todas sus compilaciones y ofrece cuantizaciones de 4, 5, 6 y 8 bits (afín, tamaño de grupo 64), además de una versión BF16 y un drafter MTP para decodificación especulativa. La arquitectura subyacente es un transformer de Qwen3.5 con capacidades multimodales (image-text-to-text).

Su relevancia radica en que combina tres elementos poco habituales en un mismo paquete: cuantización AWQ calibrada con pérdida de fidelidad medida frente al BF16, un rendimiento declarado superior a otras abliteraciones públicas y un formato nativo para el ecosistema Apple. No obstante, se trata de un modelo de investigación sin alineamiento de seguridad y su licencia, pese a ser Apache-2.0, no exime de responsabilidad sobre el uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text), con decodificación especulativa MTP opcional |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens configurados (no establecida para MLX según la model card) |
| Tipos de cuantizacion | 4, 5, 6 y 8 bits (afín, group size 64), BF16 y drafter MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); carpetas separadas por precisión; repo de 51,0 GB |

## Arquitectura y entrenamiento

El modelo es una conversión y cuantización del checkpoint BF16 de referencia, no un reentrenamiento adicional. La arquitectura es un transformer multimodal de la familia Qwen3.5 con torre de visión, capaz de procesar imagen y texto de forma conjunta. La abliteración se aplica sobre los pesos del modelo base para eliminar la dirección de rechazo, un procedimiento de modificación de pesos que no requiere fine-tuning supervisado ni RLHF adicional según la información disponible.

La innovación técnica más destacable del paquete es la cuantización AWQ calibrada con fidelidad medida frente al BF16: la divergencia KL es de 0,0009 en 8 bits, 0,0037 en 6 bits, 0,0129 en 5 bits y 0,0539 en 4 bits. Las precisiones de 8 y 6 bits se consideran prácticamente sin pérdida; la de 4 bits presenta un coste de calidad visible a cambio del menor tamaño. Se incluye además un drafter MTP en BF16 que permite decodificación especulativa para acelerar la generación. El modelo se ha probado con mlx-vlm 0.7.12 y MLX 0.32.4, incluso sobre el backend CUDA de MLX en una RTX 5090.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (262.144 tokens configurados).
- Razonamiento en modo "thinking" activable mediante `--enable-thinking`, con ajustes de muestreo recomendados (T=1,0, top_p=0,95, top_k=20).
- Comprensión de imágenes (vision-language): carga mediante `--image path/to/imagen.png`.
- Generación de código y respuestas técnicas extensas, con `--max-tokens` elevado.
- Decodificación especulativa mediante drafter MTP para reducir latencia.
- Comportamiento sin rechazo: produce contenido que el modelo base rechazaría.
- Servidor HTTP integrado mediante `python -m mlx_vlm.server`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad: análisis de la dirección de rechazo en modelos alineados comparando las activaciones del modelo abliterado con las del Qwen3.5-9B original, gracias a que se publica el BF16 de referencia.
- Red-teaming y evaluación de robustez: generación controlada de respuestas a peticiones dañinas para medir la eficacia de filtros y clasificadores de seguridad externos, con el modelo ejecutándose localmente en Apple Silicon.
- Análisis de sesgos y comportamiento: estudio de cómo la eliminación del rechazo afecta a la distribución de respuestas en distintos temas, usando el modo thinking para obtener trazas de razonamiento.
- Prototipado de asistentes multimodales en Mac: desarrollo de aplicaciones de descripción de imágenes o análisis de documentos escaneados con el servidor mlx-vlm, sin depender de servicios en la nube.
- Evaluación comparativa de cuantizaciones: uso de las cuatro precisiones (4 a 8 bits) para medir el impacto de la cuantización en tareas concretas antes de fijar una versión en producción.
- Investigación sobre decodificación especulativa: medición del speedup del drafter MTP frente a la generación estándar en hardware Apple, dado que el paquete incluye ambos.
- Experimentación con contexto largo: pruebas de recuperación de información en ventanas de hasta 262.144 tokens, con la advertencia de que la model card indica que este límite no está establecido para MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card aporta únicamente métricas comparativas de fidelidad y de comportamiento, medidas sobre la build BF16:

| Metrica | Qwen3.5-9B-RANA-abliterated | bowmanslayer/Qwen3.5-9B-Uncensored |
|---|---|---|
| Respuestas útiles a peticiones dañinas | 67,4 % | 52,5 % |
| Pérdida de capacidad | 0,79 pp | 3,31 pp |
| Divergencia KL frente al base | 0,109 | 0,294 |

Además, la fidelidad de cada cuantización frente al BF16 del propio modelo se mide con KL: 0,0009 (8 bits), 0,0037 (6 bits), 0,0129 (5 bits) y 0,0539 (4 bits).

## Requisitos de hardware

- VRAM/unificada estimada: entre 6,0 y 18,8 GB por carpeta según precisión (4 bits ~6 GB; BF16 ~18,8 GB).
- Hardware objetivo: Apple Silicon (MLX). Probado también con el backend CUDA de MLX en una RTX 5090.
- Cabe en GPU de consumo: sí, las builds de 4 a 6 bits caben en Mac con memoria unificada de 16 GB o superior; la de 8 bits y la BF16 requieren más memoria.
- Opciones de despliegue: mlx-vlm 0.7.12+ con MLX 0.32.4+ (CLI y servidor). Para otras plataformas existen builds GGUF (llama.cpp), AWQ 4-bit (vLLM), FP8 (vLLM, SGLang) y BF16 (Transformers, vLLM) en repositorios separados.
- Latencia y throughput: no disponibles en la información proporcionada. El drafter MTP está pensado para reducir la latencia mediante decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-RANA-abliterated-MLX | 9,41 B | 262.144 | Apache-2.0 | MLX (4-8 bits, BF16) | Abliteración con AWQ calibrada; +14,9 pp de respuestas útiles frente a Uncensored |
| bowmanslayer/Qwen3.5-9B-Uncensored | 9 B (aprox.) | no disponible | no disponible | no disponible | Pérdida de capacidad 3,31 pp; KL 0,294 frente al base |
| lukey03/Qwen3.5-9B-abliterated | 9 B (aprox.) | no disponible | no disponible | Transformers, GGUF, MLX | Build de abliteración de la comunidad |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | no disponible | BF16 | Modelo original alineado, del que derivan las abliteraciones |

## Limitaciones y advertencias

- Modelo de investigación con el alineamiento de seguridad eliminado: producirá contenido que el modelo base rechaza. La model card lo restringe explícitamente a investigación, interpretabilidad, red-teaming y evaluación de robustez.
- La responsabilidad de cumplir la normativa aplicable recae íntegramente en el usuario.
- Riesgo elevado de generar contenido dañino, ofensivo o ilegal; se recomienda encarecidamente filtrado externo en cualquier despliegue.
- La ventana de contexto de 262.144 tokens está configurada pero no validada para MLX según la model card.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero no exime de responsabilidad legal ni ética sobre el contenido generado.
- La build de 4 bits presenta un coste de calidad visible (KL 0,0539); para producción de investigación se recomienda 6 u 8 bits.
- El repositorio es de gran tamaño (51,0 GB) y no debe pasarse el ID del repo directamente a `--model` en mlx-vlm, ya que descargaría todas las carpetas.
- No hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-MLX
- Modelo base BF16: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Build FP8: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-FP8
- Build GGUF: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-GGUF
- Build AWQ 4-bit: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-AWQ
- Comparativa pública: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored
- Otra abliteración de la comunidad: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Ficha de abliteraciones: https://www.abliteratedmodels.org/qwen3.5-9b-abliterated/
- Notas de investigación: https://abliterant.ai/research/rana-refusal-ablation
- Chat de demostración: https://chat.abliterant.ai/
- Sitio del autor: https://abliterant.ai/
- Modelos del autor: https://abliterant.ai/models
- Hugging Face del autor: https://huggingface.co/abliterant
