# Asher-1/SAM_3D_OBJECTS_GGUF

## Resumen

El repositorio Asher-1/SAM_3D_OBJECTS_GGUF contiene los pesos preconvertidos al formato GGUF del pipeline SAM 3D Objects, un modelo fundacional desarrollado por Meta (Facebook) que reconstruye la geometría 3D completa, la textura y la disposición de una escena a partir de una única imagen. La conversión ha sido realizada por el usuario Asher-1 para el motor de inferencia C++ `cpp_ggml`, cubriendo todas las etapas del pipeline de generación en tres cuantizaciones: f32, f16 y q8_0.

El modelo original, disponible como facebook/sam-3d-objects, destaca en escenarios del mundo real con oclusiones y desorden, superando a modelos anteriores de generación 3D en pruebas de preferencia humana. Esta versión GGUF permite ejecutar el pipeline localmente en CPU, CUDA o Vulkan mediante el motor ggml, sin depender de PyTorch. El repositorio incluye seis archivos GGUF correspondientes a las distintas etapas: generador de estructura dispersa, decodificador de ocupación, generador de latentes estructurados y dos decodificadores de gaussianas, además de un decodificador de mallas. El tamaño total en f16 es de aproximadamente 5,94 GiB, en f32 de 11,9 GiB y en q8_0 de 3,25 GiB.

Este proyecto es relevante para desarrolladores e investigadores que necesitan integrar generación 3D a partir de imágenes en aplicaciones locales, con control sobre la precisión y el consumo de recursos. La conversión es determinista y se puede regenerar mediante el script `convert_sam3d_to_gguf.py` incluido en el repositorio de GitHub asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para generacion 3D (condition embedder + DiT, U-Net 3D, decodificadores de gaussianas y mallas) |
| Parametros totales | 85.067.588 (suma de los checkpoints safetensors originales) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D) |
| Tipos de cuantizacion | f32, f16, q8_0 |
| Idiomas soportados | no aplica (modelo de vision 3D) |
| Licencia | Hereda la licencia del upstream facebook/sam-3d-objects (Meta) |
| Formato de pesos | GGUF (safetensors en el upstream) |

## Arquitectura y entrenamiento

El pipeline SAM 3D Objects se compone de varias etapas diferenciadas, cada una con su propia arquitectura. La primera etapa, `ss_generator`, combina un condition embedder (basado en DINO) con un DiT (Diffusion Transformer) de tipo MOT (Mixture-of-Transformers) que produce un latente de estructura dispersa de dimensiones 4096×8 a partir de una imagen y un timestep. El `ss_decoder` es un U-Net convolucional 3D que convierte ese latente en una ocupación voxelizada de resolución 64³. La segunda rama, `slat_generator`, utiliza también un condition embedder y un DiT disperso para generar un latente estructurado. A partir de este latente, dos decodificadores de gaussianas (`slat_decoder_gs` y su variante stride-4) generan representaciones de 3D Gaussians, mientras que `slat_decoder_mesh` produce mallas.

El entrenamiento del modelo original se realizó mediante un proceso progresivo con un data engine que incorpora retroalimentación humana, aunque no se proporcionan detalles específicos sobre el número de tokens o la composición del dataset en la información disponible. Los codificadores VAE (`ss_encoder` y `slat_encoder`) no se incluyen en esta conversión porque solo se usan durante el entrenamiento, no en el pipeline de generación.

## Capacidades

- Reconstruccion de geometria 3D completa a partir de una sola imagen, incluyendo forma, textura y disposicion espacial.
- Manejo de escenarios reales con oclusiones y desorden, gracias al entrenamiento con data engine y preferencia humana.
- Generacion de representaciones 3D en tres formatos de salida: ocupacion voxelizada (64³), 3D Gaussians y mallas.
- Inferencia local mediante el motor C++ `cpp_ggml` en CPU, CUDA o Vulkan, sin dependencia de PyTorch.
- Soporte de cuantizacion f16 (recomendada) y f32 (referencia), ademas de q8_0 para almacenamiento y experimentos.
- No incluye capacidades de generacion de texto, tool calling ni procesamiento de lenguaje natural; es un modelo puramente visual.

## Casos de uso

- Generacion de activos 3D para videojuegos: a partir de una fotografia o ilustracion de referencia, el modelo produce una malla o gaussianas que pueden integrarse en motores de juego como Unity o Unreal, acelerando el prototipado de assets.
- Realidad aumentada y virtual: reconstruccion de objetos reales a partir de una unica captura para colocarlos en entornos virtuales, util en aplicaciones de e-commerce o visualizacion arquitectonica.
- Diseño de producto e industrial: los equipos pueden generar modelos 3D preliminares de conceptos dibujados o fotografiados, reduciendo el tiempo de modelado manual en herramientas CAD.
- Robótica y simulacion: creacion de representaciones volumetricas de objetos para entornos de simulacion, facilitando el entrenamiento de agentes en tareas de manipulacion.
- Investigacion en vision por computador: el pipeline permite estudiar la generacion 3D condicionada por imagen, sirviendo como punto de partida para experimentos de few-shot o fine-tuning especifico.
- Digitalizacion de patrimonio o inventario: convertir fotografias de objetos en modelos 3D para catalogos digitales, con la ventaja de ejecutarse localmente sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo original supera a modelos anteriores en pruebas de preferencia humana, pero no ofrece cifras concretas de MMLU, HumanEval u otros indicadores, ya que se trata de un modelo de generacion 3D, no de un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto completo en f16 ocupa aproximadamente 5,94 GiB, por lo que se recomienda al menos 8 GB de VRAM para cargar todos los pesos simultaneamente. En f32 se necesitan unos 11,9 GiB y en q8_0 unos 3,25 GiB.
- GPU recomendadas: tarjetas con 8 GB o mas, como RTX 3060, RTX 3070, RTX 4060, RTX 4070, o GPUs profesionales como A100 o H100 para mayor velocidad. El motor soporta CUDA y Vulkan.
- En CPU: es posible ejecutar el pipeline con suficiente RAM (al menos 8 GB para f16), aunque la latencia sera mayor.
- Opciones de despliegue: el motor `cpp_ggml` ofrece un binario `sam3d-cli` que permite cargar y ejecutar los modelos. No se menciona compatibilidad con vLLM, Ollama o TGI, que estan orientados a LLMs.
- Latencia y throughput: no se proporcionan datos concretos en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (generacion 3D a partir de imagen) dentro de la informacion proporcionada. Se recomienda consultar el repositorio original de Meta para comparaciones con otros enfoques de generacion 3D.

## Limitaciones y advertencias

- La cuantizacion q8_0 no ha sido probada con los grafos de inferencia de C++; solo se ha verificado su carga, por lo que su uso en produccion no esta garantizado.
- Los codificadores VAE no estan incluidos, lo que limita la experimentacion en espacio latente o tareas de entrenamiento.
- La licencia del modelo original de Meta puede imponer restricciones de uso comercial; es obligatorio revisar los terminos del upstream facebook/sam-3d-objects antes de descargar y utilizar estos pesos.
- El repositorio tiene un numero muy bajo de descargas (271) y sin likes, lo que sugiere que aun no ha sido ampliamente validado por la comunidad.
- No se proporcionan garantias de paridad exacta con los checkpoints de PyTorch para todas las etapas; solo el `ss_decoder` ha sido verificado node-by-node con diferencias maximas de 0.035 en f32.
- El modelo esta orientado exclusivamente a la generacion 3D; no ofrece capacidades de lenguaje o razonamiento textual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Asher-1/SAM_3D_OBJECTS_GGUF
- Repositorio GitHub del proyecto: https://github.com/Asher-1/sam-3d-objects-ggml
- Upstream oficial de Meta: https://huggingface.co/facebook/sam-3d-objects
