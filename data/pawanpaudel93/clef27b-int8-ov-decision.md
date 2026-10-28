# pawanpaudel93/clef27b-int8-ov-decision

## Resumen

`pawanpaudel93/clef27b-int8-ov-decision` es un árbol de decisión «listo para servir» construido con Cascadia sobre Cloudflare/clef, el modelo de decisión de 27B de Cloudflare liberado en octubre de 2026. El autor no entrena nada: toma los pesos del fine-tune completo de Clef, los inserta en el IR int8 de Intel de Qwen3.8-27B (`OpenVINO/Qwen3.8-27B-int8-ov`) y añade la cabeza de esquema conjunta de Clef como modelo OpenVINO dentro del directorio `decision/`. El resultado permite exponer los endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` sin tener que ejecutar el exportador.

La diferencia clave respecto a un modelo generativo al uso es la tarea: Clef no redacta texto, sino que recibe un estado (texto, JSON, imágenes o vídeo) y un esquema de preguntas tipadas, y devuelve una probabilidad para cada opción permitida de cada pregunta. Este repositorio distribuye únicamente pesos convertidos y cuantizados a int8, con un árbol de 2 etapas de unos 29 GB pensado para una pipeline de dos máquinas, ya que un solo host de 32 GB no puede ejecutar ambas etapas.

Es relevante ahora porque baja el coste de servir Clef a infraestructura CPU convencional: las mediciones publicadas se hicieron en dos Intel Core Ultra 7 258V con 32 GB cada uno, Windows 11 y OpenVINO GenAI 2026.4.1, con una paridad de 81/82 frente a la referencia fp32. El repositorio tiene 0 descargas y 0 likes, es de octubre de 2026 y no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.8-27B) con cabeza de esquema conjunta de Clef (`decision/`), empaquetado como árbol de decisión Cascadia de 2 etapas |
| Parámetros totales | 27B (heredados de Qwen3.8-27B) |
| Parámetros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | 16.384 tokens en el paso conjunto (joint pass) medido; ventana nativa del modelo base: no disponible |
| Tipos de cuantización | int8 (IR de OpenVINO); la requantización se hace por fila sobre [min(w, 0), max(w, 0)], como hace NNCF para el IR de Intel |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (árbol Cascadia de 2 etapas, ~29 GB; repositorio de 31,2 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 27B (Qwen3.8-27B) en su representación int8 de Intel, sobre el que se han sustituido las matrices del fine-tune de Cloudflare/clef. Encima se sitúa la cabeza de esquema conjunta de Clef, exportada como modelo OpenVINO bajo `decision/`, que es la que convierte un estado más un esquema de preguntas tipadas en una probabilidad por opción permitida. El empaquetado es un árbol Cascadia de dos etapas: el rank 1 ejecuta la cabeza conjunta y el rank 0 atiende la API, de modo que cada etapa vive en una máquina distinta. La conversión se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` del repositorio labscommunity/cascadia, partiendo de los ficheros upstream (55 GB en BF16 de Clef y el IR int8 de Qwen3.8-27B) y verificada en el head del PR `db44d59d`.

No se añade entrenamiento alguno: el repositorio redistribuye pesos convertidos. Por tanto no hay información pública en esta ficha sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO, ni para el fine-tune de Clef ni para Qwen3.8-27B. La innovación técnica destacable es la propia cadena de conversión: swap de pesos BF16 a IR int8 con requantización por fila, cabecera de decisión nativa en OpenVINO y particionado en dos ranks para caber en hosts de 32 GB, con decodificación determinista (chat a temperatura 0 byte-idéntico antes y después de una ejecución de decisión).

## Capacidades

- Evaluación de decisiones: dado un estado y un esquema de preguntas tipadas, devuelve una probabilidad para cada opción permitida de cada pregunta, en lugar de texto libre.
- Entrada multimodal: lee el estado como texto, JSON, imágenes o vídeo.
- Modo chat generativo: la model card verifica que la generación a temperatura 0 es byte-idéntica antes y después de ejecutar decisiones, lo que confirma que el modelo conserva la capacidad conversacional del base.
- API compatible con OpenAI Decisions en `/v1/decisions` y endpoint `/v1/systemone` (estados en cadena); ambos producen resultados idénticos (62/62 en la comprobación publicada).
- Salida estructurada con puntuaciones de confianza, adecuada para umbrales y para agregación posterior.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo «thinking» de la familia Qwen no está documentado en esta ficha.
- Cobertura multilingüe: no disponible.
- Capacidad especial: árbol de 2 etapas distribuido en dos hosts con memoria privada pico de ~21 GB en el último rank para un paso conjunto de 16.384 tokens.

## Casos de uso

- Enrutamiento y clasificación de tickets: se define un esquema con la categoría, la prioridad y la necesidad de escalado, y el modelo devuelve la probabilidad de cada opción; al ser un modelo de decisión, se puede fijar un umbral y derivar automáticamente a revisión humana los casos con probabilidad baja.
- Moderación de contenido con umbral configurable: el estado incluye el texto o la imagen y el esquema recoge las políticas aplicables; la salida probabilística permite ajustar el punto de corte sin reentrenar.
- Triaje de imágenes y vídeo en inspección: Clef acepta imágenes y vídeo como estado, de modo que un pipeline de control de calidad puede enviar un fotograma o clip con preguntas tipadas (defecto presente, tipo de defecto, severidad) y obtener puntuaciones por clase.
- Extracción estructurada con incertidumbre: en lugar de un parser determinista, se lanzan preguntas tipadas sobre un JSON o documento y se registra la probabilidad de cada campo, lo que facilita el control de calidad en ETL.
- Evaluación automática de respuestas: el modelo puntúa opciones sobre criterios definidos en el esquema (corrección, completitud), aprovechando la paridad de 25/25 medida en el chequeo de «score».
- Gate de agentes y sistemas de recomendación: uso como capa de decisión previa a una acción costosa (enviar un correo, ejecutar una compra, invocar otra herramienta), con probabilidad por opción y timeout de activación ajustable hasta 1.800 s para peticiones largas.
- Despliegue en infraestructura sin GPU: al estar medido en CPU (Core Ultra 7 258V) y no requerir CUDA, encaja en entornos Windows 11 con dos equipos de 32 GB, útil para pruebas de concepto o sedes sin aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni comparaciones de capacidad con modelos similares). Lo único publicado son comprobaciones de equivalencia de la conversión frente a la referencia fp32 en streaming (50 registros / 82 preguntas, un paso conjunto por registro), que no miden calidad del modelo sino fidelidad del proceso de exportación:

| Comprobación | Resultado |
|---|---|
| Paridad frente a fp32 | 81/82 PASS (choice 32/33, predicate 24/24, score 25/25); máximo \|Δp\| 0,0669 |
| Único desacuerdo (`r41.team`) | Empate técnico: margen de la referencia 0,048 |
| `/v1/decisions` frente a `/v1/systemone` | 62/62 idénticos (estados en cadena) |
| Chat a temperatura 0 antes/después de la ejecución de decisión | Byte-idéntico |
| Memoria privada pico (último rank, paso conjunto de 16.384 tokens) | ~21 GB |

## Requisitos de hardware

- Almacenamiento: 31,2 GB de repositorio; el árbol descargado ocupa unos 29 GB y debe estar en la misma ruta en ambos hosts.
- Topología obligatoria: dos máquinas. Un solo host de 32 GB no puede ejecutar las dos etapas; el rank 1 corre en el host B y el rank 0 con la API en el host A.
- RAM por host: 32 GB. El último rank alcanzó ~21 GB de memoria privada en un paso conjunto de 16.384 tokens, por lo que se recomienda dejar ese host sin otras cargas durante peticiones largas.
- VRAM estimada: no disponible; la model card solo reporta mediciones con `--device CPU`.
- GPU recomendadas: no disponible. No se ha validado en A100, H100 ni RTX 4090; el artefacto es un IR int8 de OpenVINO orientado a CPU.
- ¿Cabe en hardware de consumo? Sí, en dos equipos de consumo con 32 GB de RAM; la referencia medida son dos Intel Core Ultra 7 258V con Windows 11.
- Opciones de despliegue: exclusivamente Cascadia (`cascadia worker --engine qwen35 --device CPU --rank N --total 2`) con OpenVINO GenAI 2026.4.1. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este árbol.
- Latencia y throughput: no disponibles. El ejemplo de arranque fija `CASCADIA_ACTIVATION_TIMEOUT_SECS=1800`, lo que indica que las activaciones pueden tardar hasta 30 minutos en el peor caso; no se publican cifras de tokens/s ni de peticiones/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Etapas / tamaño | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `pawanpaudel93/clef27b-int8-ov-decision` (este) | 27B | 2 etapas, ~29 GB | OpenVINO IR int8 | Apache-2.0 | Requiere dos hosts de 32 GB; CPU-only medido |
| `pawanpaudel93/clef-flash-int8-ov-decision` | 9B (Qwen3.5-9B) | 1 etapa, ~10,7 GB | OpenVINO IR int8 | Apache-2.0 | Opción por defecto del exportador; cabe en una sola caja |
| `Cloudflare/clef` (original) | 27B | no disponible | BF16, 55 GB descargados | Apache-2.0 | Pesos sin cuantizar; no es un árbol Cascadia listo para servir |
| `OpenVINO/Qwen3.8-27B-int8-ov` | 27B | no disponible | OpenVINO IR int8 | Apache-2.0 | Base de la conversión, sin el fine-tune de Clef ni la cabeza de decisión |
| `Qwen/Qwen3.8-27B` | 27B | no disponible | no disponible | Apache-2.0 | Modelo generativo original; no realiza la tarea de decisión de Clef |

## Limitaciones y advertencias

- No es un modelo generativo de propósito general para producción de texto: su función es puntuar opciones de un esquema; el uso como chat queda como capacidad heredada del base.
- Paridad imperfecta: 1 de 82 preguntas cambia de opción respecto a fp32 (`r41.team`), aunque con margen de referencia 0,048 (empate técnico). Cualquier sistema con umbrales muy ajustados debe validarse con datos propios.
- Desviación máxima observada de 0,0669 en probabilidad frente a fp32; puede ser relevante en decisiones de consecuencias altas.
- Medido únicamente en CPU, Windows 11, OpenVINO GenAI 2026.4.1 y dos hosts concretos; no hay datos de otros sistemas operativos, GPUs ni versiones distintas.
- Requiere obligatoriamente dos máquinas con 32 GB cada una y el árbol en la misma ruta; no hay variante de un solo host para 27B (la de 9B sí es de una sola caja).
- El último rank llega a ~21 GB de memoria privada con contexto de 16.384 tokens: concurrencia alta o peticiones solapadas pueden agotar la memoria.
- Riesgo de alucinación: no evaluado en la información disponible; al emitir probabilidades sobre opciones cerradas el riesgo se traslada a calibración, no a texto inventado.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Sesgos: no documentados por el autor. El fine-tune procede de Cloudflare/clef y el base de Qwen3.8-27B, cuyos sesgos no se detallan aquí.
- Licencia Apache-2.0 permite uso comercial con atribución y conservación del aviso; el repositorio solo redistribuye pesos convertidos y no añade entrenamiento, por lo que las condiciones de los tres upstream aplican igualmente.
- Madurez: 0 descargas, 0 likes, creado y actualizado el 28 de octubre de 2026 (tres minutos entre ambos sellos), autor individual y dependencia de una rama no fusionada de Cascadia (`pawan/decisions-api`, PR `db44d59d`) para la exportación.
- Los formatos de petición y los límites de los endpoints están documentados en `docs/decisions.md` del repositorio de Cascadia, no en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pawanpaudel93/clef27b-int8-ov-decision
- Variante de 9B en una sola etapa: https://huggingface.co/pawanpaudel93/clef-flash-int8-ov-decision
- Fine-tune original: https://huggingface.co/Cloudflare/clef
- IR int8 base de Intel: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo base de Qwen: https://huggingface.co/Qwen
- Herramienta de conversión (Cascadia): https://github.com/labscommunity/cascadia
- Documentación de Clef en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/clef/
- Ficha y benchmarks de Clef: https://ai-tldr.dev/models/clef/
- Anuncio de Clef y Clef-flash: https://cryptobriefing.com/cloudflare-clef-decision-models-workers-ai/
- Perfil del autor: https://github.com/pawanpaudel93
