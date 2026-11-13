# appmana/MAGI-2-preview-int8

## Resumen

MAGI-2 Preview int8 es una conversión cuantizada a int8 del modelo de generación de vídeo con audio `sand-ai/MAGI-2-preview`, publicada por el usuario appmana para su uso nativo en ComfyUI. No se trata de un modelo nuevo, sino de una derivada de formato: los pesos originales en bf16 se han remapeado a la disposición de claves de ComfyUI y se han cuantizado mediante el esquema propietario "ConvRot", que combina una rotación de Hadamard con escalas por canal de salida. El paquete incluye tanto el transformer de preview como el refiner para 1080p, además de dos VAE de vídeo (un decodificador turbo destilado y el VAE de Wan 2.2 en fp32).

La relevancia de esta ficha es doble: por un lado, documenta un pipeline image-text-to-video de gran escala (el transformer de preview ocupa 115,5 GB en int8) con soporte de audio; por otro, ilustra una estrategia de cuantización orientada a preservar la fidelidad numérica en modelos de difusión con mezcla de expertos. Según la model card, el error relativo medio frente a bf16 se mantiene por debajo del 1 % en las capas muestreadas, lo que sitúa esta conversión como una alternativa práctica para despliegues en ComfyUI con GPUs de gran memoria.

El modelo base procede de SandAI y se distribuye bajo licencia Apache-2.0. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada en la model card de esta conversión, por lo que varios campos de la ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con mezcla de expertos (MoE) para vídeo con audio; incluye transformer de preview, refiner 1080p y VAE de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE confirmada por la presencia de bancos de expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ConvRot (atención, proyecciones densas y bancos de expertos); bf16 para embeddings, norms, modulación, routers, hyper-connections, attention sinks y capas finales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sharded, con `.index.json` y `SHA256SUMS`) |
| Tamano del repositorio | 125,6 GB |
| Text encoder | Qwen3.5-27B (byte-idéntico, alojado en `appmana/Qwen3.5-27B-int8`) |
| VAE de audio | Stable Audio Open 1.0 repackaged (byte-idéntico, no duplicado) |
| VAE de vídeo | Turbo VAE destilado (TurboV3) y Wan 2.2 VAE en fp32 |
| Pipeline | image-text-to-video (también text-to-audio-video e image-to-audio-video) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un sistema de difusión de dos etapas: un transformer de preview (115,5 GB en int8) y un refiner para 1080p (6,8 GB en int8). La presencia de bancos de expertos enrutados (`W_gate`, `W_up`, `W_down`) y de parámetros de enrutamiento (`expert_bias_ema` usado como sesgo de routing) confirma una arquitectura de mezcla de expertos. El texto se codifica con Qwen3.5-27B y el audio se genera y decodifica mediante el VAE de Stable Audio Open 1.0. La decodificación de vídeo emplea un VAE turbo destilado, lo que sugiere un paso de destilación para reducir el coste de muestreo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación técnica documentada en esta conversión es el esquema de cuantización int8 ConvRot: se aplica una rotación de Hadamard con grupos de 256 (o la mayor potencia de 4 que divida el ancho de entrada; el refiner usa 4 en su proyección down de 10920) y escalas por canal de salida. Según las mediciones del autor sobre capas 0, 2, 20, 37 y 39 del preview y 0, 2 y 20 del refiner (16 expertos por banco), el error relativo medio es del 0,73 % en bancos de expertos y del 0,94 % en proyecciones densas, con un coseno mínimo de 0,99997 y 0,99985 respectivamente, frente al 0,83 % y 1,11 % de una cuantización int8 simple.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con pista de audio asociada.
- Generación de vídeo a partir de imagen (image-to-video) usando imágenes de referencia codificadas con el VAE de Wan 2.2 en fp32.
- Generación conjunta de vídeo y audio (text-to-audio-video, image-to-audio-video).
- Refinado a 1080p mediante un transformer refiner independiente.
- Decodificación de vídeo acelerada mediante VAE turbo destilado.
- Ejecución con samplers, gestión de memoria, pipeline parallelism y tensor parallelism nativos de ComfyUI.
- Carga de checkpoints sharded mediante el archivo `.index.json`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe explícito.

## Casos de uso

- Generación de clips publicitarios con audio sincronizado: el pipeline text-to-audio-video permite producir un vídeo corto con banda sonora en una sola pasada, adecuado para prototipos creativos y pruebas de concepto en estudios pequeños.
- Animación de ilustraciones o fotografías: la modalidad image-to-video, con la imagen de referencia codificada por el VAE de Wan 2.2, sirve para dar movimiento a material estático en flujos de previsualización.
- Refinado a 1080p de borradores generados: el refiner de 6,8 GB permite escalar la salida del preview a resolución completa sin regenerar desde cero, lo que reduce el coste computacional en iteraciones de producción.
- Investigación en cuantización de modelos de difusión: el esquema ConvRot y las mediciones de error publicadas lo convierten en un caso de estudio para evaluar la degradación de calidad al pasar de bf16 a int8 en arquitecturas MoE.
- Integración en pipelines de ComfyUI: al usar el layout nativo de claves y el formato de checkpoints sharded, encaja en flujos de trabajo existentes basados en nodos y en despliegues con pipeline o tensor parallelism.
- Evaluación comparativa de decodificadores VAE: la inclusión del turbo VAE y del VAE de Wan 2.2 en fp32 permite comparar calidad y velocidad de decodificación en un mismo entorno.
- Docencia y demostraciones de generación multimodal: el tamaño del repositorio y la naturaleza sharded del checkpoint facilitan explicar conceptos de cuantización, paralelismo y pipelines de difusión en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye métricas de fidelidad de la cuantización frente a bf16:

| Componente | Tensores | Error rel. medio | Error rel. máx. | Coseno mínimo | int8 simple (error medio) |
|---|---|---|---|---|---|
| Bancos de expertos | 9 | 0,73 % | 0,80 % | 0,99997 | 0,83 % |
| Proyecciones densas | 80 | 0,94 % | 1,73 % | 0,99985 | 1,11 % |

El autor indica que la implementación en ComfyUI coincide con el código de referencia de SandAI en pruebas de paridad: preview dentro del ruido de bf16, refiner dentro del 0,8 %, schedule del sampler bit-idéntico y entrada del decodificador turbo bit-idéntica. También señala que los resultados de generación a tamaño completo se añadirán cuando estén validados.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer de preview en int8 ocupa 115,5 GB y el refiner 6,8 GB, a los que se suman los VAE y el text encoder Qwen3.5-27B. Se requiere un entorno multi-GPU para el pipeline completo.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada; por volumen de pesos, el pipeline completo excede la memoria de cualquier GPU consumer individual.
- Cabe en GPU consumer: el refiner (6,8 GB) y los VAE podrían caber en GPUs consumer de gama alta, pero el transformer de preview no.
- Opciones de despliegue: ComfyUI (fork instalable vía pip/uv de hiddenswitch) con samplers nativos, pipeline parallelism y tensor parallelism; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAGI-2 Preview int8 (esta ficha) | no disponible | no disponible | vídeo + audio (text/image-to-video) | Apache-2.0 | Hugging Face, ComfyUI |
| sand-ai/MAGI-2-preview | no disponible | no disponible | vídeo + audio | Apache-2.0 | Hugging Face |
| Wan 2.2 (VAE referenciado) | no disponible | no disponible | vídeo | no disponible en la información | Hugging Face |
| Stable Audio Open 1.0 (VAE de audio referenciado) | no disponible | no disponible | audio | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato y una derivada cuantizada, no un modelo entrenado desde cero; su calidad depende enteramente del modelo base `sand-ai/MAGI-2-preview`.
- La cuantización int8 ConvRot introduce un error relativo medio de hasta el 1,73 % en algunas proyecciones densas; aunque el coseno se mantiene por encima de 0,9998 en las capas muestreadas, no se han publicado evaluaciones perceptuales a tamaño completo.
- El autor indica que los resultados de generación a tamaño completo aún no están validados.
- El repositorio ocupa 125,6 GB, lo que exige almacenamiento considerable y descarga por partes.
- El despliegue está ligado a un fork específico de ComfyUI; no se garantiza compatibilidad con otras herramientas de inferencia.
- No se documentan sesgos conocidos, riesgos de alucinación, limitaciones idiomáticas ni restricciones adicionales de licencia más allá de Apache-2.0.
- No se dispone de información sobre el dataset de entrenamiento, lo que impide evaluar sesgos de contenido o licencias de datos subyacentes.
- El uso comercial está permitido por Apache-2.0, pero conviene verificar las condiciones del modelo base y de los componentes referenciados (Qwen3.5-27B, Stable Audio Open 1.0, Wan 2.2).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appmana/MAGI-2-preview-int8
- Modelo base: https://huggingface.co/sand-ai/MAGI-2-preview
- Text encoder int8: https://huggingface.co/appmana/Qwen3.5-27B-int8
- VAE de audio: https://huggingface.co/Comfy-Org/stable-audio-open-1.0_repackaged
- Fork de ComfyUI: https://github.com/hiddenswitch/forks-pip-and-uv-installable-ComfyUI
