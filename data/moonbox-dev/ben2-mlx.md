# moonbox-dev/BEN2-MLX

## Resumen

BEN2-MLX es una conversión a formato MLX del modelo BEN2 Base (Background Erase Network) de PramaLLC, publicada por moonbox-dev para su ejecución nativa en Macs con Apple Silicon. No se trata de un modelo de lenguaje, sino de un modelo de segmentación de imagen especializado en eliminación de fondos y matting de primer plano, empaquetado con la librería MLX de Apple. El repositorio ofrece cinco precisiones distintas (fp16, bf16, 8bit, 6bit y 4bit) con pesos en safetensors y un script de inferencia en Python que solo requiere `mlx`, `numpy` y `pillow`.

El modelo subyacente, BEN2, se apoya en una arquitectura Swin-B que procesa cuatro recortes de 512 píxeles más la imagen completa, con un decodificador MCLM/MCRM y un refinador guiado por confianza (Confidence Guided Matting). La conversión mantiene fidelidad numérica alta respecto al original en PyTorch: incluso en 4 bits el MAE se mantiene por debajo de 0.0012 y el IoU de máscara por encima de 0.9923. El tamaño del repositorio completo es de 0.6 GB, y cada carpeta de precisión contiene únicamente los ficheros necesarios para cargar el modelo en MLX.

La relevancia de esta ficha radica en que permite ejecutar un modelo de segmentación de primer nivel en hardware consumer de Apple sin depender de PyTorch ni de CUDA, con un rendimiento declarado de aproximadamente 0.7 segundos por imagen en un Apple M5 a cualquier precisión. Es útil para desarrolladores que construyen pipelines de edición de imagen, generación de cutouts o preprocesado para modelos generativos en entornos macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-B (backbone) con decodificador MCLM/MCRM y refinador de matting guiado por confianza (CGM) |
| Parametros totales | no disponible (pesos fp16 de 188.3 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; entrada interna de 1024x1024) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta |

## Arquitectura y entrenamiento

La arquitectura del modelo original BEN2 se basa en un backbone Swin-B que procesa la imagen a través de cuatro recortes de 512 píxeles más la imagen completa, alimentando un decodificador con módulos MCLM y MCRM. Sobre esta base, el pipeline de Confidence Guided Matting (CGM) incorpora una red refinadora que actúa selectivamente sobre los píxeles donde el modelo base muestra baja confianza, mejorando la precisión del matting en bordes y zonas ambiguas. El modelo está diseñado específicamente para segmentación de primer plano y eliminación de fondos.

La conversión a MLX realizada por moonbox-dev parte de la revisión `e48a20765f` de PramaLLC/BEN2. Los pesos originales se cargan en MLX y se almacenan en bf16 o fp16, o bien se cuantizan con la cuantización afín de MLX (8bit, 6bit, 4bit, group size 64), manteniendo las convoluciones y normas en bf16 porque MLX no las cuantiza. Cada build fue verificado contra el original antes de la subida, con métricas de MAE y IoU de máscara documentadas. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Segmentación de primer plano y eliminación de fondo en imágenes RGB.
- Matting de alta precisión con canal alfa de salida (HxW uint8), preservando bordes finos como pelo o transparencias.
- Refinamiento guiado por confianza sobre píxeles ambiguos mediante la red CGM.
- Procesamiento interno a 1024x1024 píxeles, independientemente de la resolución de entrada.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de PyTorch ni CUDA.
- Cinco niveles de precisión intercambiables con degradación numérica mínima documentada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües al no ser un modelo de lenguaje.
- No incluye la descontaminación de color opcional `refine_foreground` del modelo original.

## Casos de uso

- Generación de cutouts para diseño gráfico: el modelo produce un canal alfa limpio que puede componerse sobre nuevos fondos en herramientas de diseño, con 0.7 s por imagen en un M5.
- Preprocesado para modelos generativos de imagen: eliminar el fondo antes de aplicar inpainting, outpainting o composición, reduciendo artefactos en los bordes.
- Automatización de catálogos de producto: procesar lotes de fotos de producto para obtener imágenes con fondo transparente listas para e-commerce, usando la precisión 8bit como equilibrio entre tamaño (106 MB) y fidelidad (IoU 0.9983).
- Edición de vídeo o fotografía en macOS: integrar el modelo en aplicaciones nativas de Apple Silicon para sustituir fondos en tiempo casi real sin depender de servicios en la nube.
- Creación de avatares y retratos: el matting de alta precisión en pelo y bordes lo hace adecuado para separar sujetos en retratos y generar stickers o avatares.
- Pipelines de aumento de datos: generar máscaras de segmentación para entrenar otros modelos de visión, usando la versión fp16 como referencia de alta fidelidad (IoU 0.9996).
- Prototipado en local sin GPU dedicada: desarrolladores con Mac pueden validar flujos de segmentación antes de desplegar en infraestructura con CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no ser un modelo de lenguaje. La model card proporciona métricas de fidelidad de la conversión frente al original en PyTorch fp32:

| Precision | Tamano | MAE vs PyTorch fp32 (peor imagen) | Mask IoU (peor) |
|---|---|---|---|
| fp16 | 188 MB | 0.00003 | 0.9996 |
| bf16 | 188 MB | 0.0002 | 0.9987 |
| 8bit | 106 MB | 0.0003 | 0.9983 |
| 6bit | 84 MB | 0.0004 | 0.9966 |
| 4bit | 62 MB | 0.0012 | 0.9923 |

Rendimiento declarado: aproximadamente 0.7 segundos por imagen en un Apple M5 a cualquier precisión.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 62 MB (4bit) y 188 MB (fp16/bf16) para los pesos, más overhead de MLX y de la imagen de entrada a 1024x1024.
- GPU recomendadas: Apple Silicon (M1 en adelante); el rendimiento declarado se mide en un Apple M5. No está pensado para GPUs NVIDIA ni CUDA.
- Cabe en cualquier Mac con Apple Silicon, incluidas configuraciones con 8 GB de memoria unificada.
- Opciones de despliegue: MLX directamente en Python (`mlx`, `numpy`, `pillow`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: aproximadamente 0.7 s por imagen en Apple M5; no se proporcionan datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BEN2-MLX (este) | no disponible (188 MB fp16) | 1024x1024 interno | MIT | Hugging Face, MLX | Conversión MLX para Apple Silicon |
| PramaLLC/BEN2 (original) | no disponible | 1024x1024 interno | MIT | Hugging Face, PyTorch | Modelo base del que deriva esta conversión |
| Otros modelos de matting/segmentación | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, modelos de matting o segmentación de primer plano) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo ejecuta en Apple Silicon mediante MLX; no hay soporte para CUDA ni para GPUs NVIDIA en este repositorio.
- La descontaminación de color opcional `refine_foreground` del original no está portada, lo que puede afectar a bordes con sangrado de color del fondo.
- La cuantización a 4bit degrada ligeramente la fidelidad (IoU 0.9923, MAE 0.0012); para producción con bordes críticos se recomienda fp16 o 8bit.
- No se documentan sesgos específicos, pero como modelo de segmentación puede fallar en imágenes con fondos complejos, baja iluminación o sujetos poco definidos.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí puede producir máscaras incorrectas en escenas ambiguas.
- Licencia MIT: permite uso comercial, pero los ficheros son derivados del modelo original y heredan su licencia, que gobierna su uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y poco validada por la comunidad.
- No se dispone de información sobre el dataset de entrenamiento original ni sobre limitaciones idiomáticas o culturales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/BEN2-MLX
- Modelo base: https://huggingface.co/PramaLLC/BEN2
- Paper arXiv: https://arxiv.org/abs/2501.06230
- GitHub del proyecto original: https://github.com/PramaLLC/BEN2/
- Sitio web: https://backgrounderase.net
