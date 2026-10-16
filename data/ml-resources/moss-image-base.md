# ml-resources/MOSS-Image-Base

## Resumen

MOSS-Image-Base es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por OpenMOSS, la versión base de la familia MOSS-Image. El modelo acepta prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON, lo que permite controlar la colocación del texto y la disposición de los objetos dentro de la imagen. Su rasgo más destacado es la representación de texto legible dentro de la imagen generada, incluidos rótulos manuscritos, según el ejemplo incluido en la model card (una nota escrita a mano en chino sobre la puerta de un frigorífico).

Los pesos publicados suman 5.082.308.624 parámetros y el repositorio ocupa 27,2 GB, con licencia Apache 2.0 y soporte declarado para inglés y chino. La inferencia se realiza con difusión y muestreo flow-matching Euler (50 pasos, CFG 3, shift 5 por defecto), usando un transformer y un codificador de texto en bfloat16 y un VAE en float32 que emplea el decodificador pequeño de FLUX.2.

Es relevante ahora porque combina tres modos de control (texto libre, etiquetas y JSON estructurado) en un único modelo de 5.000 millones de parámetros con licencia permisiva, y porque existe una variante afinada (MOSS-Image-SFT) que mejora la agrupación de texto y la organización del layout. La ficha del identificador `ml-resources/MOSS-Image-Base` corresponde a un espejo del repositorio oficial `OpenMOSS-Team/MOSS-Image-Base`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con muestreo flow-matching; el pipeline integra un transformer, un codificador de texto y un VAE (detalle de bloques y atención: no disponible) |
| Parametros totales | 5.082.308.624 (según los pesos safetensors del repositorio) |
| Parametros activos | No aplica: no hay información que indique una arquitectura MoE |
| Longitud de contexto | No disponible (no se especifica la longitud máxima del prompt) |
| Tipos de cuantizacion | No disponible; los pesos se publican en bfloat16 (transformer y codificador de texto) y float32 (VAE y ruido inicial) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |
| Tarea | text-to-image |
| Resolución | Múltiplos de 16; el ejemplo de la model card usa 1024x1024 |
| Muestreador por defecto | Flow-matching Euler, 50 pasos, CFG 3, shift 5, salto de capa 22 en la rama negativa |
| Tamaño del repositorio | 27,2 GB |

## Arquitectura y entrenamiento

La información disponible describe un modelo de difusión que se muestrea con un integrador flow-matching Euler. El pipeline carga tres componentes diferenciados en precisión: transformer y codificador de texto en bfloat16, y VAE junto con el ruido inicial en float32. El VAE incluido utiliza el decodificador pequeño de FLUX.2. El mecanismo de guía por defecto aplica dos pasadas del transformer por paso de muestreo, con omisión de la capa 22 (índice base cero) en la rama negativa, lo que implica una red con al menos 23 bloques; el número exacto de capas, la dimensión del modelo y el mecanismo de atención no se detallan en la información proporcionada.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineación. La familia incluye una variante SFT (MOSS-Image-SFT) que, según la propia model card, produce una agrupación de texto más clara y un layout más ordenado que la versión base; esto sugiere que el modelo base se distribuye sin el ajuste supervisado final y que el SFT se aplicó como etapa posterior sobre el mismo punto de partida.

## Capacidades

- Generación de imágenes a partir de prompts en lenguaje natural en inglés y chino.
- Renderizado de texto dentro de la imagen, incluidos rótulos manuscritos y notas breves, como muestra el ejemplo de la model card.
- Control de la composición mediante secuencias de etiquetas (tag sequences).
- Control estructurado mediante layouts en JSON para determinar la posición de textos y la disposición de objetos.
- Dimensiones de salida configurables en múltiplos de 16, con ejemplo a 1024x1024.
- Control negativo mediante `negative_prompt`, o desactivación del salto de capa con `uncond_skip_layers=[]`.
- Integración con diffusers mediante `custom_pipeline="pipeline_moss_image"`.
- Integración con ComfyUI a través de un plugin nativo instalable desde ComfyUI Manager, con flujo de trabajo de ejemplo incluido.
- Interfaz Gradio, opciones de CPU offload y compilación.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica a un modelo text-to-image; no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de razonamiento: no disponibles.

## Casos de uso

- Carteles y material promocional con texto legible: el modelo puede generar una imagen 1024x1024 que incluya titulares o notas manuscritas en inglés o chino, evitando el posprocesado de tipografía en herramientas externas.
- Diseño de packaging y etiquetas: el layout en JSON permite fijar dónde va el nombre del producto y dónde la información secundaria, algo útil para iterar variantes de etiqueta antes de la producción.
- Prototipado de interfaces y wireframes: con layouts estructurados se pueden colocar bloques de texto y elementos en posiciones concretas para maquetas de baja fidelidad.
- Ilustración editorial y blogs: la entrada en lenguaje natural permite generar escenas coherentes con una descripción larga, útil para portadas y cabeceras de artículo.
- Material educativo e infografías: al soportar texto integrado, el modelo sirve para bocetos de diagramas anotados o pizarras con listas y rótulos.
- Localización de creatividades: la misma escena puede generarse con el texto en inglés o en chino, lo que simplifica la producción de variantes idiomáticas de una campaña.
- Generación por lotes en pipelines de contenido: la integración con ComfyUI y diffusers permite automatizar la producción de imágenes desde plantillas JSON o listas de etiquetas.
- Assets para escenas y fondos: el control por etiquetas facilita generar variaciones consistentes de un mismo entorno para catálogos o prototipos de videojuego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 5.082.308.624 parámetros, los pesos en bfloat16 ocupan aproximadamente 10,2 GB (cálculo a 2 bytes por parámetro). Sumando codificador de texto, VAE en float32 y activaciones, una estimación razonable para inferencia completa en bf16 se sitúa en el rango de 12 a 16 GB de VRAM. Es una estimación derivada del número de parámetros, no un dato publicado.
- El repositorio ocupa 27,2 GB, por encima del peso en bf16 de los parámetros, lo que indica que incluye componentes adicionales o ficheros auxiliares.
- GPU de consumo: cabe en tarjetas de 24 GB como RTX 3090 o RTX 4090. Con las opciones de CPU offload que menciona el proyecto, es probable que funcione en tarjetas de 12-16 GB (por ejemplo, RTX 4080 o RTX 4070 Ti), aunque esto no está confirmado con cifras en la información disponible.
- GPU de centro de datos: A100 (40/80 GB) y H100 son adecuadas; el modelo no requiere paralelismo multi-GPU.
- Entorno software: Python 3.10 o superior, PyTorch 2.9 o superior con CUDA, y las dependencias diffusers >= 0.38, transformers >= 5.3, accelerate >= 1.10, safetensors >= 0.6 y Pillow >= 10. Se requiere una GPU NVIDIA con soporte CUDA.
- Despliegue: pipeline personalizado de diffusers (`DiffusionPipeline.from_pretrained` con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`), interfaz Gradio del proyecto y plugin nativo para ComfyUI. No se menciona soporte para vLLM, TGI ni llama.cp, motores orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, la configuración por defecto ejecuta 50 pasos con dos pasadas del transformer por paso, es decir, del orden de 100 pasadas del transformer por imagen, más dos si se activa un prompt negativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Base | 5.082.308.624 | Resolución en múltiplos de 16; ejemplo a 1024x1024 | en, zh | Apache 2.0 | HuggingFace (OpenMOSS-Team y espejo ml-resources), ModelScope |
| MOSS-Image-SFT | No disponible | No disponible | en, zh (según la familia) | Apache 2.0 | HuggingFace (OpenMOSS-Team), ModelScope |
| Otras alternativas text-to-image de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se proporcionaron datos comparativos de otros modelos text-to-image (parámetros, benchmarks, licencia o contexto), por lo que la comparación con alternativas externas no está disponible. La única comparación documentada en la model card es interna, entre la versión base y la SFT, donde la SFT ofrece una agrupación de texto más clara y un layout de pizarra más organizado.

## Limitaciones y advertencias

- El identificador `ml-resources/MOSS-Image-Base` es un espejo con 0 descargas y 0 likes; el repositorio de referencia es `OpenMOSS-Team/MOSS-Image-Base`. Conviene usar el oficial.
- Es un modelo base, sin el ajuste supervisado final: la propia model card muestra que MOSS-Image-SFT produce mejor agrupación de texto y layout más ordenado.
- No hay resultados de benchmarks publicados en la información disponible, por lo que no es posible verificar la calidad frente a alternativas con datos objetivos.
- Idiomas declarados limitados a inglés y chino; el comportamiento con prompts en castellano no está documentado.
- Longitud máxima de prompt y comportamiento con entradas muy largas: no disponibles.
- Sesgos de los datos de entrenamiento: no documentados en la información proporcionada.
- Riesgo de errores en el texto renderizado dentro de la imagen (caracteres mal formados o ilegibles): no cuantificado en la documentación disponible.
- El uso del pipeline requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene revisarlo antes de desplegarlo en producción.
- Las dimensiones de imagen en la API de Python deben ser múltiplos positivos de 16.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales sobre los datos de entrenamiento ni sobre los componentes de terceros incluidos (por ejemplo, el decodificador del VAE procedente del ecosistema FLUX.2).
- Requiere PyTorch 2.9 o superior y CUDA, lo que puede limitar el despliegue en entornos con versiones antiguas del stack.

## Enlaces

- Repositorio de HuggingFace (espejo): https://huggingface.co/ml-resources/MOSS-Image-Base
- Repositorio oficial MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio oficial MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Código en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Documentación de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Flujo de trabajo de ejemplo en ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- ModelScope MOSS-Image-Base: https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope MOSS-Image-SFT: https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Cuenta de OpenMOSS en X: https://x.com/Open_MOSS

Las búsquedas web realizadas no devolvieron enlaces relevantes sobre el modelo: los resultados correspondían a páginas genéricas sobre "ML" (desambiguación de Wikipedia) y a contenido del videojuego Mobile Legends, sin relación con MOSS-Image.
