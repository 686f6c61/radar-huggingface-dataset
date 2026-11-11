# bindx-dev/stable_diffusion_v1_5

## Resumen

BindX QNN context para Stable Diffusion 1.5 es una conversión del modelo original runwayml/stable-diffusion-v1-5 realizada por bindx-dev, empaquetada como binarios de contexto QAIRT para el SoC Snapdragon 8 Elite (SM8750) con acelerador Hexagon HTP v79. No se trata de un modelo nuevo ni de un reentrenamiento: es una compilación de los pesos originales de SD 1.5 en formato ejecutable por el runtime de Qualcomm AI Runtime 2.50.0.260828221209, con cuantización W8A16, pensada para ejecutar text-to-image en la NPU del dispositivo en lugar de en CPU o GPU.

El repositorio contiene únicamente los binarios compilados (`text_encoder.bin`, `unet.bin`, `vae.bin`), un `metadata.json` con formas de tensor y escalas de cuantización, y un `bindx.json` de configuración. No incluye pesos en safetensors ni GGUF, ni código de inferencia, ni tokenizador. El tamaño del repo es de 1,1 GB, coherente con una cuantización a 8 bits de los tres componentes principales de SD 1.5.

La relevancia de esta ficha es acotada: el modelo hereda todas las capacidades y limitaciones de Stable Diffusion 1.5 (arquitectura latente de difusión con UNet, 860M parámetros en el UNet, contexto de texto CLIP de 77 tokens, resolución nativa 512x512), pero su utilidad práctica está restringida al hardware Snapdragon 8 Elite y a la cadena de herramientas BindX/QAIRT. Para cualquier otro entorno, la referencia canónica sigue siendo el modelo original de RunwayML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion latente (UNet + VAE + text encoder CLIP), compilada a contexto QNN |
| Parametros totales | no disponible (el modelo base SD 1.5 tiene ~983M entre UNet, VAE y text encoder; el repo no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder CLIP de SD 1.5 acepta 77 tokens; no declarado en la model card) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (el prompt se procesa con el text encoder CLIP original) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | binarios de contexto QNN (`.bin`) + `metadata.json` + `bindx.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un autoencoder variacional (VAE) que comprime imágenes a un espacio latente, una UNet que realiza el proceso de difusión denoising en ese espacio latente y un text encoder CLIP que convierte el prompt en embeddings de condicionamiento. Esta conversión concreta no modifica la arquitectura: compila los tres componentes a binarios de contexto QAIRT ejecutables en el Hexagon NPU del Snapdragon 8 Elite, con pesos cuantizados a 8 bits y activaciones a 16 bits (W8A16).

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO) en la información proporcionada, más allá de que el modelo deriva del checkpoint original de RunwayML. La innovación técnica de este repo no está en el entrenamiento sino en el despliegue: la UNet y el VAE se ejecutan en la NPU Hexagon (HTP v79) en lugar de la CPU, y el paquete incluye las escalas de cuantización necesarias para la inferencia. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a resolución nativa 512x512, heredada de SD 1.5.
- Condicionamiento por prompt de texto mediante el text encoder CLIP incluido en el paquete.
- Ejecución de UNet y VAE en la NPU Hexagon del Snapdragon 8 Elite, con el text encoder también empaquetado como binario.
- Cuantización W8A16 que reduce el espacio de pesos respecto al checkpoint original en fp16.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión de entrada, audio ni otras modalidades.
- El soporte multilingüe depende del text encoder CLIP original; no se declara en la model card.

## Casos de uso

- Generación de imágenes en dispositivo móvil con Snapdragon 8 Elite: integración en aplicaciones Android que necesiten crear imágenes a partir de texto sin conexión a la nube, aprovechando la ejecución en la NPU Hexagon.
- Prototipado de pipelines de difusión sobre QAIRT: uso de los binarios como referencia para validar la cadena de compilación BindX y el runtime Qualcomm AI Runtime 2.50.0 en el SoC SM8750.
- Aplicaciones de edición creativa offline: generación de bocetos o ilustraciones en apps de fotografía y diseño que requieran privacidad de los prompts al no enviarlos a servidores externos.
- Demostraciones de eficiencia energética: comparación de consumo y latencia entre ejecución en NPU y CPU/GPU en el mismo dispositivo, usando este paquete como baseline W8A16.
- Generación de assets para juegos o interfaces en dispositivos embebidos: creación de texturas o ilustraciones de 512x512 en el propio terminal.
- Investigación en cuantización: análisis del impacto de W8A16 en la calidad de imagen respecto al checkpoint fp16 original de SD 1.5, usando `metadata.json` para las escalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- SoC objetivo: Snapdragon 8 Elite (SM8750) con Hexagon HTP v79. No se declara compatibilidad con otros SoC.
- Runtime: Qualcomm AI Runtime 2.50.0.260828221209 (QAIRT). No se documentan otras versiones compatibles.
- VRAM/RAM: no disponible. El repo ocupa 1,1 GB, lo que da una cota inferior del espacio de almacenamiento necesario para los binarios.
- GPU de escritorio: no aplica; los binarios están compilados para la NPU Hexagon y no son ejecutables en A100, H100 ni RTX 4090.
- Despliegue: cadena BindX + QAIRT. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje, no para este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bindx-dev/stable_diffusion_v1_5 (esta ficha) | no disponible (base ~983M) | no disponible (CLIP 77 tokens en el original) | binarios QNN W8A16 | CreativeML OpenRAIL-M | Hugging Face, solo para Snapdragon 8 Elite |
| runwayml/stable-diffusion-v1-5 | ~983M | 77 tokens (CLIP) | safetensors | CreativeML OpenRAIL-M | Hugging Face, multiplataforma |
| Stable Diffusion 2.1 | no disponible en esta busqueda | 77 tokens (CLIP) | safetensors | CreativeML OpenRAIL++-M | Hugging Face, multiplataforma |

La comparación relevante es con el modelo original: esta conversión no añade capacidades y restringe el hardware, pero habilita la ejecución en NPU móvil con cuantización W8A16. Frente a SD 2.1, la diferencia principal es la licencia (OpenRAIL-M frente a OpenRAIL++-M) y el encoder de texto, aunque no se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Hardware restringido: los binarios solo están compilados para Snapdragon 8 Elite (SM8750, HTP v79) con QAIRT 2.50.0; no funcionan en otros dispositivos ni runtimes.
- No es un modelo autónomo: faltan tokenizador, código de inferencia y scheduler de difusión; el paquete solo contiene los binarios de red y metadatos.
- La cuantización W8A16 puede degradar la calidad de imagen respecto al checkpoint fp16 original; no se documenta la magnitud de la pérdida.
- Sesgos conocidos: hereda los sesgos del dataset de entrenamiento de SD 1.5 (LAION), no documentados en esta model card.
- Riesgo de alucinación visual y de generar contenido no solicitado, inherente a los modelos de difusión.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibición de generar contenido ilegal o dañino) que deben transmitirse al redistribuir los binarios, incluyendo el archivo `LICENSE`.
- El autor original no reclama derechos sobre las imágenes generadas, pero la responsabilidad de uso recae en el usuario.
- No se declaran idiomas soportados ni límites de contexto en la model card.
- Repo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bindx-dev/stable_diffusion_v1_5
- Modelo original: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Texto completo de la licencia: https://huggingface.co/spaces/CompVis/stable-diffusion-license
