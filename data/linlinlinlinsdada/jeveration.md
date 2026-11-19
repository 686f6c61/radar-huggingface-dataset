# linlinlinlinsdada/Jeveration

## Resumen

Jeveration es un modelo vision-lenguaje congelado que genera una imagen completa de 512 x 512 píxeles como una única decisión conjunta en un solo paso hacia delante (single forward pass). Lo desarrollan Yuhe Liu, Qi Li, Shihua Zhang y Xinchao Wang, y se publica bajo licencia Apache 2.0. El modelo se construye sobre el backbone congelado Qwen3.5-4B, al que se le añaden adaptadores LoRA de rango 256, entradas de decision-token, una cabeza de imagen y cabezas densas. Un único checkpoint cubre text-to-image, image-to-image (mapa de bordes HED o mapa de profundidad a imagen, colorización y tres estilos) y predicción densa (segmentación de 13 clases, profundidad y normales de superficie).

La relevancia del modelo reside en su planteamiento "System One": en lugar de la decodificación iterativa típica de los modelos de difusión, Jeveration produce la imagen entera en una sola pasada, lo que simplifica la arquitectura y reduce la latencia de generación. El repositorio ocupa 6,5 GB e incluye los pesos en formato PyTorch state dictionary (tensores puros), no como checkpoint de `transformers` ni de `diffusers`.

El modelo está orientado a imágenes de 512 x 512 y a instrucciones en inglés. Las cabezas densas se entrenaron sobre NYUv2 (escenas de interior, imágenes 4:3), por lo que otros contenidos o formatos quedan fuera del alcance entrenado. El paper asociado es arXiv:2611.24738.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con backbone transformer congelado (Qwen3.5-4B) + adaptadores LoRA (rango 256) + cabeza de imagen + cabezas densas; decoder TA-TiTok text-aware |
| Parámetros totales | no disponible (backbone base de 4B más adaptadores y cabezas; el total no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos como state dictionaries PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (pesos y código); los modelos descargados en tiempo de ejecución mantienen sus propias licencias |
| Formato de pesos | PyTorch state dictionaries (`.pt`, cargados con `weights_only=True`); no compatible con `transformers` ni `diffusers` |

## Arquitectura y entrenamiento

Jeveration combina un backbone de lenguaje congelado (Qwen3.5-4B) con adaptadores LoRA de rango 256 y un conjunto de cabezas especializadas. La generación de imagen se realiza mediante un decoder TA-TiTok text-aware afinado para salida de 512 píxeles (`decoder512.pt`, 1,2 GB) y una variante con rama de fuente con compuerta (`source_decoder512.pt`, 1,3 GB) para tareas image-to-image. El fichero principal (`jeveration.pt`, 4,0 GB) contiene los adaptadores LoRA, las entradas de decision-token, la cabeza de imagen y las cabezas densas. La tokenización visual emplea el tokenizer `turkeyju/tokenizer_tatitok_bl128_vq` y la torre de texto es CLIP ViT-L/14-336 (`timm/vit_large_patch14_clip_336.openai`).

La innovación principal es la generación de la imagen completa como una única decisión en un solo forward pass, en lugar de un proceso iterativo de denoising. Las cabezas densas (segmentación de 13 clases, profundidad en metros y normales de superficie) se entrenaron sobre NYUv2. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto a imagen: produce imágenes de 512 x 512 a partir de prompts en inglés en un solo forward pass.
- Imagen a imagen con seis tareas entrenadas e instrucciones específicas: `hed` (mapa de bordes a imagen), `depth` (mapa de profundidad a imagen), `colorize` (colorización de imágenes en gris), `anime`, `ghibli` y `watercolor` (transferencia de estilo).
- Predicción densa: segmentación de 13 clases, profundidad en metros y normales de superficie por píxel.
- Procesamiento por lotes: las APIs aceptan listas de prompts e imágenes (`[B, 512, 512, 3]`).
- Control de generación mediante semilla (`pipe.generator(0)`).
- Interfaz de línea de comandos por tarea y demo web (`python app.py`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Generación de ilustraciones a partir de descripciones: el modelo produce una imagen de 512 x 512 en una sola pasada, adecuado para prototipado rápido de conceptos visuales donde la latencia de un pipeline de difusión resulta excesiva.
- Colorización de fotografías históricas o en blanco y negro: con la instrucción `colorize`, el modelo añade color a imágenes en gris de 512 x 512 sin necesidad de un pipeline separado.
- Transferencia de estilo artístico: las instrucciones `anime`, `ghibli` y `watercolor` permiten aplicar estilos predefinidos a fotografías, útil para previsualización de estilos en proyectos creativos.
- Reconstrucción a partir de mapas de estructura: a partir de un mapa de bordes HED o un mapa de profundidad y un caption, el modelo genera la imagen correspondiente, lo que sirve para control de composición en flujos de diseño.
- Segmentación y análisis de escenas de interior: las cabezas densas proporcionan segmentación de 13 clases, profundidad y normales de superficie sobre imágenes NYUv2, aplicable a robótica doméstica o análisis de interiores.
- Investigación en generación de una sola pasada: el checkpoint permite reproducir y extender el planteamiento "System One" del paper, comparando la calidad frente a modelos de difusión iterativos.
- Demo interactiva: la demo de Hugging Face Spaces y el script `app.py` permiten probar las tareas sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los pesos suman aproximadamente 6,5 GB en el repositorio (4,0 GB de adaptadores y cabezas, 1,2 GB del decoder y 1,3 GB del decoder con rama de fuente), a lo que hay que añadir el backbone Qwen3.5-4B y la torre CLIP ViT-L/14-336 descargados en tiempo de ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño conjunto de pesos y modelos auxiliares sugiere que se requiere una GPU con memoria suficiente para el backbone de 4B más los decoders, pero no se especifica.
- Opciones de despliegue: el modelo requiere el código del repositorio GitHub (`jeveration.JeverationPipeline`); no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de `transformers` ni de `diffusers`. Se ofrece una demo web mediante `python app.py`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de text-to-image o de predicción densa.

## Limitaciones y advertencias

- Resolución fija de 512 x 512: no se documenta soporte para otras resoluciones.
- Solo inglés: los prompts e instrucciones deben estar en inglés.
- Image-to-image limitado a las seis tareas entrenadas (`hed`, `depth`, `colorize`, `anime`, `ghibli`, `watercolor`); no se admite control libre por instrucción.
- Las cabezas densas se entrenaron exclusivamente sobre NYUv2 (escenas de interior, imágenes 4:3); otros contenidos o relaciones de aspecto quedan fuera del alcance entrenado.
- Los pesos son state dictionaries PyTorch y requieren el código del repositorio; no funcionan con `transformers` ni `diffusers`.
- Los modelos descargados en tiempo de ejecución (Qwen3.5-4B, tokenizer TA-TiTok, CLIP ViT-L/14-336) mantienen sus propias licencias, que pueden imponer restricciones adicionales al uso comercial.
- No se documentan sesgos conocidos, tasas de alucinación ni métricas de calidad; el modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la ficha, por lo que su validación por la comunidad es mínima.
- Licencia Apache 2.0 para pesos y código, lo que permite uso comercial de estos artefactos, sujeto a las licencias de los modelos auxiliares.

## Enlaces

- Hugging Face: https://huggingface.co/linlinlinlinsdada/Jeveration
- Paper: https://arxiv.org/abs/2611.24738
- Código y uso: https://github.com/Carol-lyh/Jeveration
- Página del proyecto: https://carol-lyh.github.io/Jeveration/
- Demo: https://huggingface.co/spaces/linlinlinlinsdada/Jeveration
