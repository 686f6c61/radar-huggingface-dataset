# ajx91/BiRefNet_HR-matting-CoreML

## Resumen

BiRefNet_HR-matting-CoreML es la conversión a formato Core ML (ML Program en fp16) del modelo BiRefNet_HR-matting, desarrollado originalmente por Zheng Peng y colaboradores para segmentación dicotómica de imágenes de alta resolución y matting. Esta versión, publicada por el usuario ajx91, empaqueta el modelo para su ejecución nativa en macOS e iOS a través del framework Core ML de Apple, lo que permite integrar capacidades de eliminación de fondo y generación de mattes suaves en aplicaciones del ecosistema Apple sin depender de PyTorch en tiempo de inferencia.

El modelo resuelve el problema de separar el sujeto del fondo con precisión de matting (valores alfa continuos entre 0 y 1) sobre imágenes de 2048 × 2048 píxeles. La arquitectura subyacente es BiRefNet, una red de referencia bilateral diseñada específicamente para segmentación dicotómica de alta resolución, publicada en CAAI AIR 2024. La conversión mantiene la normalización ImageNet dentro del grafo y reimplementa la convolución deformable mediante `grid_sample`, con una diferencia media de matte respecto a PyTorch de aproximadamente 0,0003.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue en dispositivo (on-device) para tareas de segmentación y matting sin conexión; por otro, advierte de que se trata de una conversión de un modelo de terceros, con licencia MIT, cuyo rendimiento debe validarse contra el original antes de usarla en producción. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de referencia bilateral para segmentación dicotómica), convertida a Core ML ML Program |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 2048 × 2048) |
| Tipos de cuantizacion | fp16 (ML Program); no se documentan otras variantes |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | Core ML ML Program (`.mlpackage`, empaquetado en `.aar`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es BiRefNet, una red neuronal convolucional de referencia bilateral orientada a segmentación dicotómica de alta resolución. El modelo original BiRefNet_HR-matting se entrenó para producir mattes suaves (canal alfa continuo) en lugar de máscaras binarias, lo que lo hace adecuado para composición de imágenes y eliminación de fondo con bordes finos. Esta versión concreta no aporta información sobre el número de parámetros, la composición del dataset de entrenamiento ni el volumen de tokens o imágenes utilizadas; esos datos corresponden a la model card del modelo base, que no se ha incluido en la información proporcionada.

La innovación técnica de esta conversión reside en el proceso de traducción a Core ML: la convolución deformable del modelo original se reimplementa con la operación `grid_sample`, con una coincidencia respecto a torchvision de aproximadamente 1e-5 y una diferencia media de matte frente a PyTorch de aproximadamente 0,0003. La normalización ImageNet está integrada dentro del grafo, de modo que la entrada es una imagen RGB directa de 2048 × 2048. El modelo debe ejecutarse en el dispositivo con la configuración `.cpuAndGPU`; el Neural Engine no puede compilarlo, lo que condiciona el rendimiento en hardware Apple.

## Capacidades

- Segmentación de imágenes y generación de mattes suaves: produce un canal alfa de `[1, 1, 2048, 2048]` con valores entre 0 y 1.
- Eliminación de fondo de alta resolución: entrada RGB de 2048 × 2048 con normalización ImageNet incluida en el modelo.
- Matting de bordes finos: al generar valores alfa continuos, es adecuado para sujetos con contornos complejos (pelo, tejidos, transparencias parciales).
- Ejecución on-device en macOS e iOS mediante Core ML, sin dependencia de PyTorch en inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo exclusivamente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de fondo en aplicaciones de fotografía para iOS y macOS: el modelo se integra como `.mlpackage` en una app nativa y genera el matte en el dispositivo, sin enviar imágenes a un servidor, lo que reduce latencia y preserva la privacidad.
- Composición y retoque en editores de imagen: el canal alfa de 2048 × 2048 permite recortar sujetos y recomponerlos sobre nuevos fondos con bordes suaves, aprovechando la resolución nativa del modelo.
- Generación de avatares y retratos para videollamadas o streaming: el matte continuo facilita la sustitución de fondo en tiempo real en macOS, siempre que se acepte la ejecución en CPU y GPU y no en Neural Engine.
- Procesamiento por lotes de catálogos de producto: eliminación automatizada de fondos en imágenes de e-commerce a 2048 × 2048, con salida alfa lista para composición sobre fondos blancos o transparentes.
- Preprocesado para pipelines de visión por computador: generación de máscaras de sujeto que alimenten etapas posteriores (detección, segmentación semántica, edición) en flujos on-device.
- Herramientas de diseño y maquetación en iPad: integración en apps de edición gráfica que necesiten recortes precisos sin conexión a red, aprovechando el empaquetado Core ML.
- Automatización de flujos en macOS: uso del modelo desde scripts o apps de escritorio para separar sujetos en lotes de imágenes antes de tareas de clasificación o archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la conversión: coincidencia de la convolución deformable reimplementada con `grid_sample` respecto a torchvision de aproximadamente 1e-5, y diferencia media de matte frente a PyTorch de aproximadamente 0,0003. No se proporcionan métricas de calidad de segmentación (IoU, S-measure, MAE) ni comparativas con el modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,4 GB y el modelo se ejecuta en fp16, por lo que la huella de memoria es moderada, pero no se documenta una cifra concreta.
- GPU recomendadas: hardware Apple con soporte Core ML (Mac con GPU integrada o discreta, iPhone y iPad compatibles). El modelo debe ejecutarse con `.cpuAndGPU`; el Neural Engine no puede compilarlo.
- Cabe en GPU de consumo: sí, en el ecosistema Apple, al tratarse de un modelo on-device de 0,4 GB en fp16; no se documenta compatibilidad con GPU NVIDIA o AMD.
- Opciones de despliegue: Core ML en macOS e iOS; el paquete se distribuye como `.aar` y se extrae con `aa extract -i BiRefNetHRMatting-1.aar -d .`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ajx91/BiRefNet_HR-matting-CoreML | no disponible | Imagen 2048 × 2048 | Core ML (`.mlpackage` en `.aar`) | MIT | Hugging Face, 0 descargas |
| ZhengPeng7/BiRefNet_HR-matting | no disponible en la información proporcionada | Imagen de alta resolución | PyTorch (modelo base) | MIT (según la conversión) | Hugging Face |
| Otros modelos de matting/segmentación | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no incluye datos de alternativas equivalentes en formato Core ML ni métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Se trata de una conversión de terceros: el autor del repositorio no es el autor original del modelo, y no se documenta un proceso de validación exhaustivo más allá de la diferencia media de matte de 0,0003 frente a PyTorch.
- El Neural Engine no puede compilar el modelo; la inferencia queda restringida a CPU y GPU, lo que puede reducir el rendimiento y el ahorro energético en dispositivos Apple.
- No se dispone de información sobre sesgos del modelo original ni sobre su comportamiento en dominios específicos (retratos, productos, escenas naturales); deben evaluarse empíricamente antes de producción.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de errores de segmentación en sujetos con bordes ambiguos, transparencias o fondos de color similar al sujeto.
- La licencia MIT permite uso comercial, pero se recomienda citar el paper original de BiRefNet (Zheng et al., "Bilateral Reference for High-Resolution Dichotomous Image Segmentation", CAAI AIR 2024) y verificar los términos del modelo base.
- El repositorio no registra descargas ni likes, lo que sugiere poca validación por parte de la comunidad; conviene tratar la conversión como experimental.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; la entrada es exclusivamente una imagen RGB de 2048 × 2048.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajx91/BiRefNet_HR-matting-CoreML
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_HR-matting
- Paper de BiRefNet: Zheng et al., "Bilateral Reference for High-Resolution Dichotomous Image Segmentation", CAAI AIR 2024 (no se proporciona URL directa en la información disponible)
