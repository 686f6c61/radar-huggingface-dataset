# manaladan6/CogVideoX1.5-5B-SAT

## Resumen

CogVideoX1.5-5B-SAT es un modelo de generación de vídeo de código abierto desarrollado por Zhipu AI (zai-org) y publicado en su versión SAT (el repositorio manaladan6 es un espejo). Se trata de la versión mejorada del modelo CogVideoX original, capaz de generar vídeos de hasta 10 segundos de duración con mayor resolución. La variante I2V (image-to-video) admite cualquier resolución de salida, mientras que la variante T2V (text-to-video) se centra en generación a partir de descripciones textuales. Este modelo se basa en una arquitectura de difusión con un transformer experto y utiliza un codificador de texto T5-XXL para el condicionamiento. Está disponible bajo la licencia CogVideoX, que permite uso comercial con restricciones específicas.

El repositorio contiene los pesos en formato SAT (checkpoint de entrenamiento) para el transformer, el VAE (idéntico al de CogVideoX-5B) y el codificador de texto. Al ser una versión SAT, su carga requiere el framework de entrenamiento SAT, lo que lo diferencia de las versiones en formato diffusers. El modelo está diseñado para tareas de generación de vídeo a partir de imágenes o texto, y es relevante para la comunidad de investigación y desarrollo que busca modelos de vídeo generativos de alta calidad con licencia abierta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (Expert Transformer) con VAE 3D y text encoder T5-XXL |
| Parametros totales | 5 mil millones (según nombre del modelo, no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica directamente; el modelo procesa secuencias de vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según metadata de HF) |
| Licencia | CogVideoX License (licencia propia, no OSI) |
| Formato de pesos | SAT (PyTorch, archivos .pt) y safetensors (para text encoder) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura presentada en el paper CogVideoX: Text-to-Video Diffusion Models with An Expert Transformer (arXiv:2408.06072). Combina un VAE 3D para comprimir el espacio vídeo, un codificador de texto T5-XXL para el condicionamiento y un transformer experto que procesa las representaciones latentes. La versión SAT almacena los pesos en formato de entrenamiento (mp_rank_00_model_states.pt), lo que facilita el ajuste fino con el framework SAT, pero requiere conversión para usarse con bibliotecas estándar como diffusers.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens o el proceso de alineación (RLHF, DPO, etc.) en la información disponible. El modelo es una mejora sobre CogVideoX-5B, que ya ofrecía generación de vídeo de alta calidad, y añade soporte para vídeos más largos (10 segundos) y mayor resolución.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y a partir de imagen (I2V).
- Soporte para vídeos de hasta 10 segundos de duración.
- La variante I2V permite cualquier resolución de salida, mientras que la T2V tiene resoluciones fijas predefinidas.
- Condicionamiento mediante texto en inglés (el codificador T5-XXL está entrenado principalmente en inglés).
- Incluye un VAE 3D que comprime el vídeo en latentes para la difusión.
- El formato SAT permite continuar el entrenamiento o ajuste fino con el framework SAT de Zhipu AI.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-step, ya que es un modelo de generación de vídeo, no de texto.

## Casos de uso

- **Generación de clips de vídeo para marketing**: el modelo puede crear vídeos de 10 segundos a partir de una imagen de producto y una descripción textual, útil para campañas publicitarias en redes sociales. Su alta resolución (variable en I2V) permite adaptar el formato a distintas plataformas.
- **Prototipado de escenas cinematográficas**: cineastas independientes pueden usar el modelo para previsualizar escenas con una imagen inicial y una descripción, acelerando el proceso de storyboard sin necesidad de equipos de producción.
- **Creación de contenido educativo**: generar vídeos explicativos cortos a partir de diagramas o ilustraciones, con narración textual que describe el concepto.
- **Desarrollo de fondos para videojuegos**: los diseñadores pueden generar fondos animados o cutscenes de corta duración a partir de imágenes conceptuales, reduciendo el coste de producción.
- **Investigación en modelos de difusión**: el formato SAT permite a investigadores ajustar el modelo con sus propios datos para explorar variaciones en la generación de vídeo, gracias a la licencia abierta (con condiciones).
- **Generación de memes o contenido viral**: la capacidad de crear vídeos de 10 segundos a partir de una imagen y texto es ideal para producir contenido humorístico o de actualidad en plataformas como TikTok o Instagram.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2408.06072) puede contener métricas de evaluación, pero no se incluyen en esta ficha. Se recomienda consultar la publicación para comparar con otros modelos de generación de vídeo.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la información. Sin embargo, al tratarse de un modelo de 5B parámetros con un text encoder T5-XXL (11B parámetros adicionales), se requiere hardware de gama alta.
- Estimación orientativa: la inferencia en formato FP16 puede requerir al menos 24 GB de VRAM para el transformer, más los pesos del T5 (alrededor de 22 GB) y el VAE. En total, se recomienda una GPU con 40 GB o más (por ejemplo, A100 o H100).
- En cuantización (no disponible) se podría reducir el consumo, pero no hay datos.
- Para uso interactivo, se recomienda usar el framework SAT con soporte para tensor parallelism.
- Opciones de despliegue: la documentación de Zhipu ofrece scripts de inferencia en el repositorio GitHub. No se menciona compatibilidad con vLLM, Ollama o llama.cpp, ya que es un modelo de vídeo, no de lenguaje.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de generación de vídeo en la información proporcionada. Modelos como Stable Video Diffusion o AnimateDiff podrían ser alternativas, pero no se han analizado en este contexto. El modelo se destaca por su licencia abierta y la capacidad de vídeo de 10 segundos, aunque su formato SAT puede limitar la interoperabilidad.

## Limitaciones y advertencias

- **Licencia**: la licencia CogVideoX no es OSI y puede imponer restricciones sobre el uso comercial o la redistribución. Es necesario revisar el texto completo de la licencia antes de usar en productos.
- **Idioma**: el modelo está optimizado para inglés; el uso en otros idiomas puede degradar la calidad de generación.
- **Alucinaciones**: como modelo generativo, puede producir vídeos con objetos o movimientos irreales, especialmente en escenas complejas.
- **Formato SAT**: los pesos en formato SAT no son compatibles con la mayoría de bibliotecas estándar (diffusers, etc.) y requieren el framework SAT para su carga, lo que limita su uso en entornos de producción.
- **No se proporcionan datos sobre sesgos**: no se ha evaluado el modelo para sesgos de género, etnia u otros en la generación de vídeo.
- **Tamaño del modelo**: el peso total es de 40.9 GB, lo que implica requisitos de almacenamiento y memoria considerables.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/manaladan6/CogVideoX1.5-5B-SAT
- Repositorio original en HuggingFace (zai-org): https://huggingface.co/zai-org/CogVideoX1.5-5B-SAT
- GitHub del proyecto: https://github.com/zai-org/CogVideo
- Paper arXiv: https://arxiv.org/pdf/2408.06072
- ModelScope (versión china): https://www.modelscope.cn/models/ZhipuAI/CogVideoX1.5-5b-SAT
