# Mino1289/vmoe_s32_last2_224_randaug_medium

## Resumen
V-MoE (Vision Mixture of Experts) es una familia de modelos de vision por computadora desarrollada por Google Research que aplica una arquitectura de mezcla de expertos dispersa (sparse mixture of experts) sobre un transformer de vision (ViT). La version aqui descrita, `Mino1289/vmoe_s32_last2_224_randaug_medium`, es una conversion a timm de los pesos originales del checkpoint `vmoe_s32_last2_ilsvrc2012_randaug_medium` publicado por Google en su repositorio oficial de V-MoE.

El modelo cuenta con 56.999.400 parametros totales segun los pesos en safetensors, procesa imagenes de 224x224 pixeles y esta orientado a la clasificacion de imagenes sobre las 1000 clases de ImageNet-1k (ILSVRC2012), con aumento de datos RandAugment en su variante `medium`. Se distribuye con licencia Apache-2.0 en formato safetensors y se integra directamente en la libreria timm mediante una unica llamada a `create_model`.

Su relevancia actual radica en que ejemplifica el enfoque MoE aplicado a vision: incrementar la capacidad total del modelo manteniendo un coste de computo por token inferior al de un modelo denso equivalente, un patron que hoy domina el diseno de grandes modelos de lenguaje. Al ser un modelo relativamente pequeno (57M parametros), permite experimentar con enrutamiento de expertos en hardware modesto. La model card no incluye metricas de rendimiento ni detalles completos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (ViT) con mezcla de expertos dispersa (sparse MoE); familia V-MoE |
| Parametros totales | 56.999.400 |
| Parametros activos | no disponible (modelo MoE disperso; no se especifica el numero de parametros activos por token) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada fija de 224 x 224 |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos en FP32); al ser un modelo timm es cuantizable externamente a INT8/FP16 |
| Idiomas soportados | no aplica (clasificacion de imagenes); las 1000 etiquetas de ImageNet estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Resolucion de entrada | 224 x 224 pixeles |
| Numero de clases de salida | 1000 (ImageNet-1k / ILSVRC2012, segun la nomenclatura del checkpoint) |
| Preprocesamiento | normalizacion con mean=std=(0.5, 0.5, 0.5) sobre entradas en [0, 1] (equivalente a value_range=(-1, 1) en JAX) |
| Libreria de inferencia | timm (PyTorch) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento
La arquitectura es un transformer de vision con capas de mezcla de expertos dispersa. En lugar de una unica red densa de feed-forward, las capas MoE contienen varios expertos y un mecanismo de enrutamiento (routing) que asigna cada token a un subconjunto reducido de expertos, de modo que el coste de computo por token es inferior al de un modelo denso con la misma capacidad total. El sufijo `s32` y `last2` del nombre corresponden a la nomenclatura de configuracion de los checkpoints de Google; la informacion proporcionada no detalla su significado exacto ni el tamano de parche (patch size) empleado.

Segun la nomenclatura del checkpoint (`ilsvrc2012_randaug_medium`), los pesos estan asociados al entrenamiento o ajuste sobre el conjunto ILSVRC2012 (ImageNet-1k) con la politica de aumento de datos RandAugment en su variante medium. La model card no especifica el numero total de tokens de entrenamiento, la composicion del dataset de preentrenamiento, ni si se emplearon tecnicas de ajuste por preferencias (RLHF/DPO), que por otra parte no aplican a un modelo de clasificacion supervisada de imagenes.

## Capacidades
- Clasificacion de imagenes en 1000 categorias de ImageNet-1k (por ejemplo, razas de perro, especies de ave, objetos cotidianos).
- Extraccion de representaciones visuales: al ser un modelo timm, puede utilizarse como backbone para transfer learning (uso de los embeddings previos a la cabeza de clasificacion).
- Inferencia sobre imagenes RGB de 224 x 224 con el preprocesamiento especificado.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades conversacionales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de capacidades multimodales de entrada (no acepta texto, audio ni video); unicamente imagen de entrada y etiqueta de clase como salida.
- No dispone de modo de razonamiento (thinking mode) ni de vision generativa.

## Casos de uso
- Clasificacion de imagenes a gran escala: desplegar el modelo para etiquetar catalogos de productos o bibliotecas de imagenes en 1000 categorias, con un coste de inferencia bajo al tratarse de un modelo de 57M parametros.
- Curacion y etiquetado automatico de datasets: preetiquetar imagenes con clases de ImageNet para acelerar el trabajo de anotacion humano en proyectos de vision por computadora.
- Moderacion y filtrado de contenido visual: usar la clasificacion para detectar categorias concretas (por ejemplo, objetos o escenas no permitidas) en pipelines de subida de contenido, filtrando por clase relevante.
- Backbone para transfer learning: aprovechar los pesos preentrenados en ImageNet como extractor de caracteristicas y anadir una cabeza especifica para tareas de dominio (medicina, industria, agricultura) con conjuntos de datos reducidos.
- Clasificacion en el borde (edge computing): el tamano reducido (0,2 GB de repositorio) permite ejecutar el modelo en dispositivos con recursos limitados mediante exportacion a ONNX u OpenVINO.
- Investigacion sobre MoE y enrutamiento de expertos: estudiar el comportamiento del routing, la carga de expertos y el equilibrio entre capacidad total y computo activo en un entorno de vision controlado.
- Punto de partida para experiments de cuantizacion: evaluar el impacto de la cuantizacion (INT8, FP16) en la precision de un modelo MoE pequeno antes de escalar a variantes mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de exactitud (top-1/top-5) sobre ImageNet-1k, ni datos de latencia, throughput, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia (derivada del numero de parametros, no medida): aproximadamente 228 MB en FP32, 114 MB en FP16 y 57 MB en INT8, sin contar activaciones ni overhead del framework. Cifras orientativas.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente. No requiere A100 ni H100; una NVIDIA T4, RTX 3060, RTX 4090 o similares son ampliamente suficientes para lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo, e incluso en CPU para inferencia por lotes pequenos o moderados.
- Opciones de despliegue: timm y PyTorch de forma nativa (`timm.create_model`); exportacion a ONNX o TorchScript para servir con ONNX Runtime u OpenVINO. No es un modelo de lenguaje, por lo que no aplican vLLM, Ollama, TGI ni llama.cpp (este ultimo solo soporta arquitecturas de lenguaje).
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 57M parametros y 224 x 224, se espera una latencia muy baja en GPU, pero no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Resolucion | Dataset de referencia | Licencia |
|---|---|---|---|---|---|
| V-MoE-S/32 (este modelo) | 56.999.400 | ViT con MoE dispersa | 224 | ImageNet-1k (ILSVRC2012) | Apache-2.0 |
| ViT-S/16 (Google) | ~22M (aproximado) | ViT densa | 224 | ImageNet-1k / JFT | Apache-2.0 / variada |
| DeiT-S (Meta) | ~22M (aproximado) | ViT densa con destilacion | 224 | ImageNet-1k | Apache-2.0 |

La diferencia principal frente a las alternativas densas es que este modelo reparte su capacidad en expertos con enrutamiento disperso, de modo que su numero total de parametros es mayor que el de un ViT-S denso manteniendo un computo por token inferior. No se dispone de datos de exactitud comparativos, por lo que no es posible establecer una comparacion de rendimiento cuantitativa con las alternativas. Los recuentos de parametros de las alternativas son aproximados y ampliamente conocidos en la literatura, no proceden de la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: al estar entrenado o ajustado sobre ImageNet-1k, hereda los sesgos de ese conjunto (representacion desigual de categorias, sesgos geograficos y culturales en las etiquetas, y taxonomia centrada en categorias occidentales). No se documentan analisis de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo; el modelo produce una distribucion de probabilidad sobre 1000 clases fijas y no genera texto libre. Si se usa con clases fuera de su vocabulario, las predicciones pueden ser erroneas o poco significativas.
- Limitaciones de contexto e idioma: resolucion de entrada fija de 224 x 224 y ausencia total de procesamiento de lenguaje; no soporta entradas de texto ni tareas multilingues.
- Restricciones de licencia: licencia Apache-2.0, que permite uso comercial y modificacion con atribucion; conviene verificar las condiciones del proyecto y del checkpoint original de Google.
- Caveats para produccion: repositorio con cero descargas y cero likes en el momento de la consulta, lo que implica poca adopcion y validacion por parte de la comunidad; no se aportan metricas de precision, por lo que su calidad real sobre ImageNet-1k no esta verificada en la informacion disponible. La conversion desde JAX a timm deberia validarse comparando salidas con el checkpoint original antes de un despliegue serio.
- Detalles de configuracion incompletos: no se especifican el tamano de parche, el numero de expertos por capa ni la politica de enrutamiento, lo que dificulta reproducir el comportamiento reportado por el paper original.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Mino1289/vmoe_s32_last2_224_randaug_medium
- Repositorio oficial de V-MoE (Google Research): https://github.com/google-research/vmoe
- Libreria timm (pytorch-image-models): https://github.com/huggingface/pytorch-image-models
- Paper de referencia de V-MoE, "Scaling Vision with Sparse Mixture of Experts": https://arxiv.org/abs/2106.05974
