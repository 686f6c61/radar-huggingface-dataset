# gatilin/kanana-2-v-decide-3b-vision-encoder

## Resumen

Kanana-2-V-Decide-3B Vision Tower es la extraccion comunitaria del torre visual del modelo multimodal Kanana-2-V-Decide-3B desarrollado por Kakao. No se trata de un modelo autonomo: es un extractor de caracteristicas visuales que corresponde unicamente al componente `model.visual.*` del checkpoint original, con 484.793.968 parametros en bfloat16. El modelo de lenguaje original (unos 6,36 GB de pesos) y el modulo de similitud no estan incluidos, por lo que este repositorio no puede responder preguntas ni puntuar candidatos por si mismo.

Tecnicamente es un ViT de 27 capas con atencion con compuerta sigmoide (gated attention), tamano oculto 1152, 16 cabezas, patch size 16 y patch temporal 2, seguido de un merger que proyecta parches 2x2 fusionados al espacio de lenguaje de 2560 dimensiones. La extraccion se realizo mediante peticiones HTTP por rangos sobre una unica region contigua de bytes, sin descargar el checkpoint completo, y los tensores se han preservado sin conversion de dtype, cuantizacion ni reordenacion.

Su relevancia es practica: permite reutilizar el encoder visual de Kanana-2 de forma aislada para tareas de extraccion de caracteristicas de imagen, y sirve como referencia para quien necesite integrar el tower visual en pipelines propios sin cargar el modelo multimodal completo. La licencia es la Kanana Open License del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT con gated attention (subclase de los modulos de vision de Qwen3-VL) |
| Parametros totales | 484.793.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (es un encoder visual; la resolucion se controla por `min_pixels` 65536 y `max_pixels` 16777216) |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16; se puede ejecutar en float32 via `dtype=torch.float32`) |
| Idiomas soportados | no disponible (componente visual, sin capacidades linguisticas) |
| Licencia | kanana-open-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El componente es un Vision Transformer de 27 capas con tamano oculto 1152, 16 cabezas de atencion, MLP intermedio de 4304, patch size 16 y patch temporal 2. La innovacion principal frente a un ViT estandar es la atencion con compuerta: la proyeccion `qkv` genera `4 × hidden_size` y el resultado se divide en query, key, value y una compuerta por cabeza; la salida de atencion se multiplica por `sigmoid(gate)`. Este patron de atencion es completo (no sliding window), a diferencia de las variantes medium y tiny del mismo proyecto. El merger proyecta los parches 2x2 fusionados a un espacio de 2560 dimensiones, que es el que consume el modelo de lenguaje de Kanana-2-V-Decide.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion de datos ni si hubo RLHF o DPO en el modelo original. El repositorio es una extraccion de pesos ya entrenados: no ha habido entrenamiento, cuantizacion, conversion de dtype ni reordenacion de tensores. La implementacion oficial usa la interfaz de atencion de Transformers 5.x (`ALL_ATTENTION_FUNCTIONS.get_interface`, `is_flash_attention_requested`), no presente en 4.57.x. El codigo de modelado incluido (`modeling_kanana_v_decide.py`) subclasea los modulos de vision de Qwen3-VL e implementa la compuerta; el codigo estandar de Qwen3-VL espera `3 × hidden_size` y no carga estos pesos.

## Capacidades

- Extraccion de caracteristicas visuales a dos niveles: `last_hidden_state` con 1152 dimensiones por parche (antes del merger) y `pooler_output` con 2560 dimensiones en el espacio de lenguaje.
- Procesamiento de imagenes con el procesador oficial `KananaVImageProcessor` (redimensionado, reescalado y normalizacion con media y desviacion 0.5).
- Soporte de parches temporales (temporal patch size 2), lo que permite representar secuencias de frames.
- Seleccion de implementacion de atencion: `sdpa` por defecto o `eager` explicito.
- Ejecucion en bfloat16 (original) o float32 mediante el loader incluido.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es exclusivamente un encoder visual.
- No dispone de `deepstack_features` porque la configuracion original define `deepstack_visual_indexes` como lista vacia.

## Casos de uso

- Busqueda visual y recuperacion de imagenes: usar `pooler_output` (2560 dimensiones) como embedding de imagen para indexar y recuperar por similitud en un motor vectorial, ya que el merger produce representaciones alineadas con el espacio del modelo de lenguaje de Kanana-2.
- Clasificacion y etiquetado de imagenes: extraer `last_hidden_state` (1152 dimensiones por parche) y entrenar una cabeza ligera de clasificacion sobre las caracteristicas congeladas, apropiado porque el encoder ya esta preentrenado y no requiere ajuste del tower visual.
- Segmentacion densa y tareas por parche: las caracteristicas por parche permiten tareas que requieren resolucion espacial fina, con el grid controlado por `min_pixels` 65536 y `max_pixels` 16777216.
- Analisis de video o secuencias de frames: el patch temporal 2 permite procesar pares de frames y obtener representaciones con informacion temporal, util para deteccion de cambios o resumen visual.
- Integracion en pipelines multimodales propios: usar el tower como frontend visual de un LLM distinto, consumiendo `pooler_output` de 2560 dimensiones como tokens visuales, siempre que el LLM de destino acepte esa dimensionalidad.
- Investigacion y comparacion de encoders: al ser una extraccion aislada y verificada byte a byte, sirve para estudiar el efecto de la gated attention frente a encoders con atencion estandar (variantes medium y tiny del mismo proyecto).
- Validacion de reproducibilidad: el repositorio incluye `tensor_mapping.json` con shard, dtype, forma y offsets de cada tensor, lo que permite auditar la extraccion y comparar con el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es funcional: ejecucion en CPU con `transformers==5.5.3` y `torch==2.14.1` sobre tres imagenes reales de COCO128 (`000000000009`, `000000000030`, `000000000034`) pasadas por el `KananaVImageProcessor` oficial, con resultados en `validation.json` y una sonda de atencion por capa en `attention_path_probe.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 para los 484,8 millones de parametros (969.587.936 bytes de pesos), mas el espacio de activaciones, que depende de la resolucion de entrada (hasta `max_pixels` 16777216).
- En float32 los pesos ocupan aproximadamente el doble, unos 1,9 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para bfloat16 a resoluciones moderadas; para resoluciones altas y lotes grandes se recomienda una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) para una sola imagen en bfloat16.
- Opciones de despliegue: el repositorio esta pensado para `transformers==5.5.3` con el loader `component.py` incluido; requiere `torch`, `torchvision`, `accelerate`, `safetensors`, `pillow` y `einops`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La validacion reportada se realizo en CPU, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Capas | Hidden size | Cabezas | MLP intermedio | Patron de atencion | Compuerta | Salida | Licencia |
|---|---|---|---|---|---|---|---|---|
| Este componente (Kanana-2-V-Decide-3B) | 27 | 1152 | 16 | 4304 | full | sigmoide sobre salida de atencion | 2560 | kanana-open-license |
| Kanana-2 medium | 28 | 768 | 32 | 1792 | sliding + full | elementwise | no disponible | kanana-open-license |
| Kanana-2 tiny | 18 | 512 | 16 | 768 | sliding + full | elementwise | no disponible | kanana-open-license |

Las tres variantes son pesos distintos, no republicaciones del mismo encoder. No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera texto, no responde preguntas y no puntua candidatos; solo extrae caracteristicas visuales.
- Requiere `transformers==5.5.3`: la implementacion oficial usa la interfaz de atencion de Transformers 5.x, ausente en 4.57.x.
- El codigo de vision estandar de Qwen3-VL no carga estos pesos porque espera `3 × hidden_size` en `qkv` en lugar de `4 × hidden_size`; es obligatorio usar `modeling_kanana_v_decide.py`.
- El procesador oficial devuelve `{"pixel_values", "image_meta"}` en lugar de la interfaz habitual `images=`/`return_tensors=`, lo que rompe integraciones que asumen la API estandar.
- Licencia Kanana Open License: es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica a generacion de texto) ni limitaciones de idioma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y es una extraccion comunitaria no oficial de Kakao; conviene validar la integridad frente al checkpoint original usando los hashes SHA-256 documentados.
- El consumo de memoria de activaciones puede crecer de forma significativa con `max_pixels` 16777216 en entradas de alta resolucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/kanana-2-v-decide-3b-vision-encoder
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-v-decide-3b-2611
- Variante medium: https://huggingface.co/gatilin/kanana-2-vision-encoder-medium
- Variante tiny: https://huggingface.co/gatilin/kanana-2-vision-encoder-tiny
