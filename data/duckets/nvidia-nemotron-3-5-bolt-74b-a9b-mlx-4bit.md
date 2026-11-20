# Duckets/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por NVIDIA, distribuido originalmente en BF16 y aquí presentado como una conversión cuantizada a 4 bits en formato MLX a cargo del usuario Duckets. El modelo combina un núcleo lingüístico híbrido Nemotron-H (Mamba-2 con mezcla de expertos de geometría elástica, LatentMoE) con un codificador visual C-RADIO, lo que le permite procesar texto e imágenes y generar respuestas textuales. Con 74.885.081.094 parámetros totales y aproximadamente 9B activos por token, se posiciona en la franja de modelos MoE de gran tamaño pero coste de inferencia contenido.

La relevancia de esta ficha concreta reside en su empaquetado: una conversión MLX affine de 4 bits (grupo de 64, ~4,61 bits por peso, 40,2 GiB en disco, 9 shards safetensors) pensada para ejecutarse de forma nativa en Apple Silicon mediante mlx-vlm y LM Studio. Esto permite cargar un modelo de 74B con visión y 262.144 tokens de contexto en un Mac de 128 GB de memoria unificada en unos 10 segundos, algo impensable con los pesos BF16 originales.

El modelo deriva del checkpoint BF16 de NVIDIA, que a su vez fue comprimido y destilado desde Nemotron 3.5 Super VL mediante la técnica Star Elastic. No incluye torre de audio (`sound_config` es nulo en el origen) y el proyector visual final (`vision_projector`) está ausente por diseño en el checkpoint fuente, con el código del modelo protegiendo esa llamada. La licencia aplicable es la del upstream: OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida (Mamba-2 + LatentMoE) con codificador visual C-RADIO |
| Parametros totales | 74.885.081.094 |
| Parametros activos | ~9B (top-9 expertos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, ~4,61 bits/peso (solo esta variante en el repo) |
| Idiomas soportados | en, es, fr, de, it, ja (según model card) |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (9 shards, 40,2 GiB), librería mlx-vlm |
| Geometria MoE | Elástica (Star Elastic): 40 capas MoE con 240–496 expertos por capa (240×12, 304×6, 368×9, 432×10, 496×3), tamaños intermedios 1536–2560, top-9 |
| Entradas | Texto e imágenes (vídeo soportado upstream, no verificado en este port) |
| Salida | Texto |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 |

## Arquitectura y entrenamiento

La arquitectura es una Nemotron-H híbrida que combina capas Mamba-2 con capas de mezcla de expertos de tipo LatentMoE. La particularidad de esta variante Bolt es su geometría MoE elástica, resultado de la técnica Star Elastic aplicada por NVIDIA al destilar desde Nemotron 3.5 Super VL: en lugar de capas MoE uniformes, cada una de las 40 capas MoE tiene su propio número de expertos (entre 240 y 496) y tamaño intermedio (entre 1536 y 2560), con enrutamiento top-9. Esta geometría real queda registrada en `block_configs` dentro de `config.json`; los campos planos de expertos en `llm_config` son artefactos de exportación de Megatron y no la describen.

El componente visual es un codificador C-RADIO que proyecta representaciones de imagen al espacio del modelo lingüístico. El checkpoint fuente no incluye torre de audio ni los pesos del layernorm final del proyector visual, por lo que este módulo está ausente por diseño y el código lo omite cuando no existe. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El razonamiento es configurable mediante la variable `enable_thinking` del chat template, igual que en la release upstream.

La conversión a MLX 4-bit aplica cuantización affine con grupo de 64 sobre los pesos BF16 originales (no sobre GGUF) e incorpora varios arreglos de configuración: eliminación de la clave redundante `_downsample_factor` del processor, normalización del centinela Infinity de `time_step_limit` a `1e30`, adición de `max_position_embeddings` a nivel superior con valor 262144 y endurecimiento del `chat_template.jinja` frente a valores nulos en esquemas de herramientas. Además, se empleó un paquete `nemotron_h_omni` de mlx-vlm parcheado para construir cada capa MoE con su geometría propia, ya que el código estándar asume capas uniformes.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Comprensión de imágenes y descripción visual (pipeline image-text-to-text), verificado en mlx-vlm y LM Studio.
- Razonamiento configurable mediante modo thinking (`enable_thinking` en el chat template).
- Soporte de tool calling / function calling a través del chat template (endurecido para esquemas con valores nulos).
- Capacidades multilingües declaradas en inglés, español, francés, alemán, italiano y japonés.
- Procesamiento de fotogramas de vídeo según el diseño upstream (no verificado en este port).
- Integración con LM Studio mediante su API propia, con texto y visión verificados.
- Sin capacidades de audio: ni entrada ni salida, ya que el checkpoint fuente carece de torre de audio.

## Casos de uso

- Asistente local con visión en Apple Silicon: cargar el modelo en un Mac de 128 GB con LM Studio o mlx-vlm permite describir imágenes, responder preguntas sobre capturas o diagramas y mantener conversaciones largas sin salir del dispositivo, aprovechando los 262.144 tokens de contexto.
- Análisis de documentación técnica extensa: introducir manuales, especificaciones o repositorios completos en una sola ventana de contexto y hacer preguntas cruzadas, algo viable gracias a la ventana de 262k tokens y al coste de inferencia reducido de los ~9B parámetros activos.
- Automatización de atención al cliente con soporte visual: gestionar conversaciones multi-turno donde el usuario adjunta capturas de errores o facturas, combinando comprensión de imagen y contexto largo para resolver incidencias sin perder el hilo.
- Procesamiento por lotes de imágenes en local: clasificar, describir o extraer información de colecciones de imágenes (catálogos, archivos fotográficos) en un flujo offline con mlx-vlm, sin depender de APIs externas ni enviar datos a la nube.
- Prototipado de agentes con tool calling: usar el chat template para definir herramientas y encadenar pasos de razonamiento en un asistente que consulte APIs o bases de datos, aprovechando el modo thinking configurable para tareas de varios pasos.
- Evaluación e investigación en entornos con privacidad estricta: desplegar el modelo en estaciones de trabajo Mac para experimentos con datos sensibles (imágenes médicas anonimizadas, documentos internos) donde no se permite el envío a servicios cloud.
- Desarrollo multiplataforma con LM Studio: servir el modelo a través de la API local de LM Studio para integrarlo en aplicaciones de escritorio o scripts que necesiten texto e imagen sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión remite a la model card upstream de NVIDIA para benchmarks y detalles de entrenamiento, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM/memoria estimada: 40,2 GiB en disco para los pesos 4-bit; en ejecución se suma la caché KV, que con 262.144 tokens de contexto puede ser considerable y depende de la configuración del front-end.
- Hardware verificado: Mac Apple Silicon con 128 GB de memoria unificada; carga en aproximadamente 10 segundos.
- No cabe en GPUs consumer de 24 GB (RTX 4090) ni en Macs de 32/64 GB; requiere memoria unificada de gama alta (128 GB o más) o GPUs profesionales con suficiente VRAM.
- Opciones de despliegue: mlx-vlm (librería nativa del formato) y LM Studio. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos están en formato MLX y la arquitectura requiere el paquete `nemotron_h_omni`.
- En LM Studio debe cargarse con la cuantización de caché KV desactivada; con ella activa, la ruta de visión por lotes de mlx-vlm rechaza la carga o ignora el ajuste de longitud de contexto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B (esta conversión MLX 4-bit) | 74B totales / ~9B activos | 262.144 | Sí (C-RADIO) | OpenMDW 1.1 | Hugging Face, mlx-vlm, LM Studio |
| Nemotron 3.5 Bolt 74B-A9B BF16 (upstream NVIDIA) | 74B totales / ~9B activos | 262.144 | Sí (C-RADIO) | OpenMDW 1.1 | Hugging Face (formato BF16) |
| Nemotron 3.5 Super VL (origen de la destilación) | no disponible | no disponible | Sí | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit puede diferir ligeramente del original BF16 en salidas límite; para evaluación en precisión completa debe usarse la release BF16 upstream.
- La visión se verificó con imágenes; la entrada de vídeo sigue el diseño upstream pero no formó parte de la verificación de este port.
- Sin entrada ni salida de audio: el modelo fuente no tiene torre de audio.
- El módulo `vision_projector` (layernorm final) está ausente por diseño en el checkpoint fuente; el código lo omite, pero cualquier herramienta que asuma su presencia puede fallar.
- Reconvertir desde BF16 requiere el paquete `nemotron_h_omni` parcheado para geometría MoE elástica; los conversores estándar de mlx-lm/mlx-vlm asumen capas MoE uniformes y producirían un modelo incorrecto.
- Algunas versiones de LM Studio pueden carecer del paquete de modelo `nemotron_h_omni` y de dos dependencias del processor, provocando fallos de carga por motivos del motor, no de los pesos.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; son heredados del modelo base de NVIDIA y de sus datos de entrenamiento.
- Licencia OpenMDW 1.1: es responsabilidad del usuario revisar los términos completos antes de uso comercial; al ser una conversión derivada, los derechos del modelo, datos y capacidades pertenecen a NVIDIA.
- El contexto de 262.144 tokens exige gestión cuidadosa de la caché KV; en LM Studio con cuantización de caché activada el modelo no carga correctamente.
- No se documentan limitaciones específicas por idioma más allá de los seis declarados; el rendimiento en idiomas no listados no está verificado.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/Duckets/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX-4bit
- Modelo base BF16 upstream: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
