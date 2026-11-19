# Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit

## Resumen

Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo multimodal NVIDIA Nemotron 3.5 Super VL 120B-A12B, desarrollado originalmente por NVIDIA y adaptado por el usuario Duckets para su ejecución nativa en Apple Silicon. El modelo combina un lenguaje híbrido Nemotron-H con una torre de visión C-RADIO, lo que permite entrada de texto e imágenes con salida de texto. La conversión parte del checkpoint BF16 original (no de un GGUF) y está pensada para usarse con la librería mlx-vlm y con LM Studio.

La relevancia de esta ficha radica en que hace accesible un modelo de 120 000 millones de parámetros totales (12 000 millones activos, al ser MoE) en hardware de consumo de Apple con 128 GB de memoria unificada, algo inviable con los pesos BF16. La cuantización affine de 4 bits con group size 64 reduce el peso en disco a unos 64,7 GiB y mantiene una longitud de contexto declarada de 1 048 576 tokens.

Es importante subrayar que esta es una conversión derivada: el modelo base, sus datos de entrenamiento y sus capacidades pertenecen a NVIDIA, y el uso se rige por la licencia OpenMDW 1.1 del modelo original. La model card del conversor no incluye resultados de benchmarks propios ni detalles adicionales de entrenamiento más allá de los del modelo upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida (capas intercaladas Mamba-2, atención y MoE; 512 expertos enrutados, top-22) + codificador de visión C-RADIO |
| Parámetros totales | 121 511 070 726 (~120B) |
| Parámetros activos | ~12B (MoE) |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantización | MLX affine 4-bit, group size 64, ~4,57 bits/peso |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (14 shards MLX), 64,7 GiB / 69,4 GB en disco |

## Arquitectura y entrenamiento

La arquitectura es la Nemotron-H híbrida de NVIDIA, que intercala capas de espacio de estados Mamba-2, capas de atención y capas de mezcla de expertos (MoE) con 512 expertos enrutados y enrutamiento top-22. A esto se añade una torre de visión C-RADIO que procesa imágenes de entrada; el modelo no incluye torre de audio (sound_config nulo en el checkpoint fuente). El resultado es un modelo omni de texto e imagen con salida exclusivamente textual.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO; esos datos corresponden al modelo upstream de NVIDIA y no se reproducen en la model card de esta conversión. La innovación técnica destacable de esta ficha es la propia conversión: cuantización affine 4-bit con group size 64, corrección de claves de configuración del processor (eliminación de `_downsample_factor` redundante, normalización del sentinel Infinity de `time_step_limit` a 1e30, adición de `max_position_embeddings` a 1048576) y endurecimiento del `chat_template.jinja` en 7 puntos para tolerar valores nulos en esquemas de herramientas. El razonamiento es configurable mediante `enable_thinking` en la plantilla de chat, igual que en la versión upstream.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`enable_thinking`).
- Comprensión de imágenes (image-text-to-text) mediante la torre C-RADIO; descripción de imágenes verificada por el autor.
- Entrada de vídeo por diseño upstream (frames), aunque no verificada en este port.
- Soporte multilingüe declarado en inglés, español, francés, alemán, italiano y japonés.
- Conversación multi-turno con contexto extremadamente largo (hasta 1 048 576 tokens).
- Soporte de tool calling / function calling a través de la plantilla de chat (con manejo robusto de esquemas con valores nulos).
- Ejecución nativa en Apple Silicon con mlx-vlm y despliegue en LM Studio con la API propia de este.
- No dispone de entrada ni salida de audio.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias al contexto de 1 048 576 tokens, se pueden procesar manuales, informes o expedientes completos con figuras y tablas incrustadas en una sola pasada, manteniendo coherencia entre texto e imagen.
- Descripción y etiquetado automático de imágenes en pipelines de accesibilidad: el modelo genera descripciones textuales de imágenes que pueden alimentar sistemas de texto alternativo o audiodescripción.
- Asistente de desarrollo en local sobre Mac: con tool calling y contexto largo, puede integrarse en flujos de revisión de código y documentación técnica sin enviar datos a la nube, aprovechando la ejecución en Apple Silicon.
- Atención al cliente multilingüe: cubre conversaciones en seis idiomas con historial largo, adecuado para soporte técnico donde el cliente adjunta capturas de pantalla o diagramas.
- Investigación y prototipado en visión-lenguaje: al ejecutarse en un Mac de 128 GB, permite experimentar con un modelo de 120B MoE sin infraestructura de datacenter, útil para pruebas de concepto y evaluación cualitativa.
- Extracción de información de documentos escaneados: combinación de OCR implícito por visión y razonamiento textual para convertir formularios o facturas en datos estructurados.
- Generación de resúmenes de vídeo por fotogramas: aunque no verificado en este port, el diseño upstream admite frames de vídeo, lo que habilita resúmenes de reuniones o material audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión remite a la model card upstream de NVIDIA para benchmarks y detalles de entrenamiento, pero no incluye cifras propias.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan unos 64,7 GiB; el autor recomienda un Mac con 128 GB de memoria unificada para cargar el modelo con holgura (los pesos residentes son ~65 GiB).
- GPU recomendadas: Apple Silicon con 128 GB de memoria unificada (verificado por el autor); no se documentan requisitos para GPU NVIDIA en esta conversión MLX.
- ¿Cabe en GPU de consumo? No en GPU discretas de consumo convencionales por el tamaño de pesos; sí en Mac de gama alta con 128 GB unificados.
- Tiempo de carga: aproximadamente 10 segundos en un Mac de 128 GB según el autor.
- Opciones de despliegue: mlx-vlm (librería principal) y LM Studio. En LM Studio debe cargarse con la cuantización de KV Cache desactivada, ya que con ella activada la ruta de visión por lotes de mlx-vlm rechaza la carga o ignora la longitud de contexto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit | 120B totales / 12B activos | 1 048 576 | OpenMDW 1.1 | Hugging Face (MLX 4-bit) |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (upstream) | 120B totales / 12B activos | 1 048 576 | OpenMDW 1.1 | Hugging Face (BF16) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otras alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit puede diferir ligeramente del original BF16 en salidas límite; para evaluación de precisión completa debe usarse el release BF16 upstream.
- La visión se verificó con imágenes; la entrada de vídeo sigue el diseño upstream pero no forma parte de la verificación de este port.
- No hay entrada ni salida de audio, ya que el modelo fuente carece de torre de audio.
- En LM Studio, algunas versiones del backend pueden no incluir el paquete `nemotron_h_omni` de mlx-vlm ni dos dependencias del processor, lo que puede impedir la carga por motivos del motor; no es un defecto de los pesos.
- Es obligatorio desactivar la cuantización de KV Cache en LM Studio para evitar fallos en la ruta de visión por lotes.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; deben asumirse los del modelo upstream de NVIDIA.
- Restricciones de licencia: el uso se rige por la OpenMDW License Agreement 1.1; conviene revisar sus términos para uso comercial.
- Al ser una conversión derivada, el soporte y la responsabilidad sobre capacidades y datos de entrenamiento recaen en NVIDIA, no en el conversor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Duckets/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
