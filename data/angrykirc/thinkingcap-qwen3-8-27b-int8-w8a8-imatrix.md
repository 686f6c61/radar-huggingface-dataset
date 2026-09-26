# angrykirc/ThinkingCap-Qwen3.8-27B-INT8-W8A8-imatrix

## Resumen

ThinkingCap-Qwen3.8-27B-INT8-W8A8-imatrix es una cuantización de 8 bits del modelo multimodal bottlecapai/ThinkingCap-Qwen3.8-27B, publicada por el usuario angrykirc. El checkpoint original en BF16 ocupa 55,6 GB y esta versión lo reduce a unos 30 GB (31,3 GB de repositorio) manteniendo 27.781.427.952 parámetros, mediante cuantización W8A8 (pesos y activaciones en int8) con `compressed-tensors` y el observador `imatrix_mse` para los pesos.

El interés practico del modelo esta en que reduce a la mitad el coste de memoria de un VLM de casi 28.000 millones de parámetros sin tocar el torre de visión, la `lm_head` ni el modulo MTP (multi-token prediction), que se conservan en BF16 para no degradar la generación especulativa. Está pensado para servir con vLLM o transformers en GPUs de 40-48 GB, un rango en el que el checkpoint BF16 no cabe.

Se distribuye bajo licencia Polyform Small Business 1.0.0, con soporte declarado de ingles y ruso, y no presenta resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (tag `qwen3_5`); incluye torre de visión y modulo MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8: pesos int8 simetricos per-channel estaticos (observador `imatrix_mse`), activaciones int8 simetricas per-token dinamicas; solo capas `Linear` |
| Idiomas soportados | en, ru |
| Licencia | polyform-small-business-1.0.0 |
| Formato de pesos | safetensors cuantizados (`compressed-tensors`, `int-quantized`), 15 shards + `model_mtp.safetensors` en BF16 + `recipe.yaml` |

## Arquitectura y entrenamiento

La ficha no documenta el entrenamiento del modelo base, solo el proceso de cuantización. El checkpoint es una derivación del modelo multimodal bottlecapai/ThinkingCap-Qwen3.8-27B (55,6 GB en BF16), etiquetado con `qwen3_5`, `image-text-to-text`, `multimodal` y `vlm`. La receta de cuantización excluye explícitamente todos los bloques `model.visual.*` (torre de visión), las proyecciones de las capas de atención lineal (`linear_attn.in_proj_a`, `linear_attn.in_proj_b` y sus normas), la `lm_head` y todos los tensores `mtp.*`, que permanecen en BF16. El resultado son 400 pesos `Linear` en int8 con 400 escalas per-channel, más el resto del grafo en BF16.

La calibración se hizo con `llmcompressor` 0.14.0 (transformers 5.17.0, torch 2.14.0+cu126) sobre 512 secuencias de unas 2000 tokens cada una, con longitud máxima de 2048 tokens y pipeline secuencial. El corpus de calibración es código Python de fuentes abiertas, la mitad de las muestras con llamadas a herramientas (tool calls), lo que orienta la cuantización hacia cargas de trabajo de código y agentes. La verificación reportada por el autor confirma que los 400 pesos cuantizados son `I8` y que los módulos ignorados siguen en BF16; se realizó un smoke test de generación greedy de 104 tokens.

## Capacidades

- Generación de texto conversacional en ingles y ruso.
- Comprensión de imagen y texto (`AutoModelForImageTextToText`), con torre de visión intacta en BF16.
- Tool calling / function calling: la calibración incluye un 50 % de muestras con llamadas a herramientas, y el repositorio esta marcado como `endpoints_compatible`.
- Decodificación especulativa mediante el modulo MTP incluido en `model_mtp.safetensors` (se carga con `load_mtp=True` en vLLM).
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible, aunque el nombre del modelo base y el corpus de calibración apuntan en esa dirección.
- Modo thinking o razonamiento explicito: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Extracción de datos de documentos con imagen: el modelo acepta pares imagen-texto, por lo que puede procesar facturas, tickets o capturas y devolver campos estructurados vía tool calling, con el ahorro de memoria que supone el checkpoint int8.
- Asistente de código autoalojado: al haberse calibrado con código Python y tool calls, es adecuado para autocompletado, revisión de parches y generación de tests dentro de un pipeline de CI/CD que invoque el endpoint de vLLM.
- Agentes que encadenan herramientas: la combinación de soporte de function calling y decodificación especulativa con MTP permite bucles de agente con varias llamadas por turno reduciendo la latencia de generación.
- Análisis de capturas de pantalla y UI: la torre de visión en BF16 conserva la precisión original para tareas de descripción de interfaces, detección de elementos o generación de pasos de reproducción.
- Atención al cliente en inglés y ruso: despliegue bilingüe en un único modelo, con contexto suficiente para conversaciones multi-turno (la longitud exacta de contexto no está publicada).
- Moderación y clasificación de contenido multimodal: revisión de imágenes acompañadas de texto con salida etiquetada mediante esquemas de función.
- Prototipado en una sola GPU de 48 GB: sustituye al checkpoint BF16 en entornos L40S o A6000 sin necesidad de tensor parallelism.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una verificación estructural (400 pesos `I8`, 400 escalas per-channel, módulos ignorados en BF16) y un smoke test de generación greedy de 104 tokens.

## Requisitos de hardware

- Peso de los tensores cuantizados: aproximadamente 30 GB, según el autor (frente a 55,6 GB en BF16).
- VRAM estimada para inferencia: del orden de 34-38 GB contando torre de visión, `lm_head` y modulo MTP en BF16, más la caché KV. Cifra estimada, no publicada por el autor.
- GPUs recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB, RTX PRO 6000. En configuraciones de 2x RTX 4090 (24 GB cada una) sería necesario tensor parallelism.
- No cabe en GPUs de consumo de 24 GB (RTX 4090, 3090, 5090 de 32 GB queda muy justa) sin offloading a CPU o particionado.
- Despliegue: vLLM (`vllm serve angrykirc/ThinkingCap-Qwen3.8-27B-INT8-W8A8-imatrix`) y transformers con `AutoModelForImageTextToText`. Para las capas de atención lineal conviene instalar `flash-linear-attention` y `causal_conv1d`; sin ellos transformers usa kernels de referencia.
- No hay ruta CPU ni llama.cpp/Ollama: no se publican pesos GGUF en esta ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Version int8 W8A8 publicada |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-INT8-W8A8-imatrix | 27,78 B | no disponible | Si (visión) | Polyform Small Business 1.0.0 | Si (esta ficha) |
| bottlecapai/ThinkingCap-Qwen3.8-27B (base) | 27,78 B | no disponible | Si (visión) | Polyform Small Business 1.0.0 | No |
| Qwen2.5-VL-32B | 32 B | no disponible | Si (visión) | Apache 2.0 | no disponible |
| Gemma 3 27B | 27 B | no disponible | Si (visión) | Gemma Terms | no disponible |

Los datos de los modelos comparativos proceden de documentación publica general y deben verificarse antes de tomar decisiones de producción; en esta ficha no se dispone de cifras de contexto ni de benchmarks verificados para ninguno de ellos.

## Limitaciones y advertencias

- La cuantización int8 introduce degradación respecto al checkpoint BF16; el autor no publica ninguna evaluación de calidad comparativa entre ambos.
- Los módulos `linear_attn.in_proj_a` / `in_proj_b`, la `lm_head`, el modulo MTP y la torre de visión permanecen en BF16, por lo que el ahorro de memoria es menor que el teórico 4x de un int8 completo.
- Idiomas declarados: solo ingles y ruso. No hay evidencia de soporte de castellano.
- Licencia Polyform Small Business 1.0.0: es una licencia source-available, no una licencia de código abierto aprobada por la OSI. Restringe el uso comercial a empresas que cumplan los umbrales de facturación y plantilla definidos en el texto de la licencia; conviene leer el enlace de licencia antes de cualquier despliegue comercial.
- Riesgo de alucinación: no evaluado en la información disponible; aplica el comportamiento habitual de los modelos generativos, especialmente en tareas de visión y OCR.
- Modelo recién publicado (creado el 26 de septiembre de 2026) con 0 descargas y 0 likes: no hay validación independiente de la comunidad.
- El repositorio es una cuantización, no un ajuste: no incorpora capacidades nuevas sobre el modelo base, y hereda sus sesgos y limitaciones.
- Sin soporte de llama.cpp/GGUF, no es desplegable en entornos sin GPU con soporte int8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/angrykirc/ThinkingCap-Qwen3.8-27B-INT8-W8A8-imatrix
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Texto de la licencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B/raw/main/LICENSE
- llmcompressor: https://github.com/vllm-project/llmcompressor
- vLLM: https://github.com/vllm-project/vllm
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
