# cftcimert/cifake-efficientnet-b0

## Resumen

cftcimert/cifake-efficientnet-b0 es un clasificador binario de imágenes que distingue fotografías reales de imágenes generadas por IA. Lo publica el usuario de Hugging Face cftcimert y se construye sobre EfficientNet-B0 preentrenado en ImageNet, ajustado por transfer learning con el conjunto de datos CIFAKE (60.000 imágenes reales procedentes de CIFAR-10 y 60.000 sintéticas generadas con Stable Diffusion v1.4). No es un modelo de lenguaje: es un modelo de visión con entrada RGB fija de 224x224 píxeles y una única salida logit sobre la que se aplica una sigmoid para obtener P(real).

El modelo resuelve un problema acotado pero de interés creciente: el triaje automático de contenido sintético. Declara una precisión de test del 97,85% sobre las 20.000 imágenes de test de CIFAKE (10.000 reales y 10.000 sintéticas), una cifra notable para una arquitectura de solo ~4 millones de parámetros. Se distribuye en formato ONNX (opset 17) con licencia MIT, lo que facilita su integración como microservicio de bajo coste en CPU o GPU.

Su relevancia práctica está en el coste: al ser un EfficientNet-B0 y no un transformer de gran tamaño, puede ejecutarse en hardware modesto y servir como primer filtro dentro de pipelines de moderación, verificación o limpieza de datasets. La contrapartida es que la validación es exclusivamente autoinformada por el autor (métrica marcada como no verificada), el repositorio no tiene descargas ni validación de la comunidad, y el dominio de entrenamiento (imágenes de baja resolución de CIFAR-10 y salidas de SD v1.4) limita seriamente su generalización a generadores actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con compound scaling), preentrenado en ImageNet |
| Parametros totales | Aproximadamente 4,02 millones (unos 4,0 M en el extractor de caracteristicas mas 1.281 en la cabeza binaria); calculado a partir de la configuracion estandar de EfficientNet-B0, el autor no publica el recuento exacto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada fija de 224x224 píxeles) |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye el grafo ONNX; no se documentan versiones cuantizadas (INT8, FP16 ni otras) |
| Idiomas soportados | No aplica / no disponible (no se declaran idiomas; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17). El entrenamiento original fue en PyTorch, pero no se publican pesos .pt/.safetensors |
| Tarea | Clasificacion binaria de imagenes (real vs. generada por IA) |
| Entrada | Tensor RGB `[batch, 3, 224, 224]`, normalizado con estadisticas de ImageNet (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) |
| Salida | Un unico logit; `sigmoid(logit) >= 0.5` -> REAL, `< 0.5` -> FAKE |
| Dataset de entrenamiento | CIFAKE (birdy654/cifake-real-and-ai-generated-synthetic-images): 100.000 imagenes de entrenamiento, 20.000 de test |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |
| Fecha de publicacion | Creado el 22 de septiembre de 2026, actualizado el mismo dia |

## Arquitectura y entrenamiento

La arquitectura es un EfficientNet-B0, una red convolucional que escala de forma compuesta profundidad, anchura y resolución mediante el coeficiente phi, y que aquí se inicializa con pesos de ImageNet. Sobre el extractor de características se coloca una cabeza de clasificación binaria que emite un único logit, entrenado con BCEWithLogitsLoss. El modelo final se exporta a ONNX en opset 17, con entrada fija de 224x224 píxeles y normalización ImageNet.

El entrenamiento sigue una estrategia de dos fases: 10 épocas de extracción de características con el backbone congelado y tasa de aprendizaje 3e-4, seguidas de 5 épocas de ajuste fino completo con tasa de aprendizaje 3e-5 y scheduler CosineAnnealingLR. Se usa el optimizador AdamW con weight_decay 1e-2, tamaño de lote 128 y precisión mixta FP16 mediante torch.autocast. No se menciona ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de visión.

El conjunto de datos CIFAKE combina 60.000 imágenes reales procedentes de CIFAR-10 con 60.000 imágenes sintéticas generadas con Stable Diffusion v1.4, divididas en 100.000 para entrenamiento (50.000 por clase) y 20.000 para test (10.000 por clase). El preprocesado de inferencia es un resize bicúbico con antialias a 224x224 seguido de la normalización ImageNet. No se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa u otras), ya que se trata de un ajuste fino estándar por transfer learning.

## Capacidades

- Clasificación binaria de imágenes: devuelve una probabilidad de que la imagen sea real o generada por IA.
- Detección de imágenes sintéticas dentro del dominio de entrenamiento (salidas de Stable Diffusion v1.4 y fotografías de baja resolución tipo CIFAR-10).
- Inferencia portable mediante ONNX Runtime, con proveedores de ejecución en CPU, CUDA y otros backends compatibles.
- Procesamiento por lotes: la entrada admite dimensión de batch variable, lo que permite clasificar múltiples imágenes por llamada.
- Integración en pipelines como etapa de filtrado previo (pre-screening) antes de un revisor humano o de un modelo más costoso.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generación de texto, visión general, audio ni modo de pensamiento. Es exclusivamente un clasificador de imagen.

## Casos de uso

- Moderación de contenido en plataformas: como primera barrera para marcar imágenes potencialmente sintéticas en feeds o galerías, dado que el coste por inferencia de un EfficientNet-B0 es muy bajo y permite procesar volúmenes altos antes de recurrir a revisión humana.
- Verificación periodística: triaje automático de imágenes recibidas por una redacción para priorizar cuáles requieren verificación manual, usando la probabilidad de salida como señal de sospecha y no como veredicto final.
- Limpieza de datasets de visión: filtrar imágenes generadas por IA al construir corpus de entrenamiento, evitando contaminación de datasets con contenido sintético cuando el objetivo es entrenar modelos sobre fotografía real.
- Investigación sobre detección de deepfakes: servir como baseline reproducible y ligero (97,85% declarado en CIFAKE) frente al cual comparar arquitecturas más grandes o métodos de explicabilidad.
- Filtrado en marketplaces y comercio electrónico: detección de imágenes de producto generadas o retocadas sintéticamente antes de su publicación, integrada como microservicio ONNX dentro del flujo de subida.
- Despliegue en edge o en instalaciones sin GPU: al ser un modelo de ~4 millones de parámetros en ONNX, puede ejecutarse en CPU dentro del propio servidor de aplicaciones, sin depender de infraestructura de aceleradores.
- Prefiltro en sistemas antifraude: clasificar imágenes adjuntas en procesos de verificación documental o de identidad como señal auxiliar, siempre acompañada de otras comprobaciones, dado el riesgo de falsos positivos en dominios alejados del entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (metrica no verificada de forma independiente):

| Benchmark | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Clasificacion binaria real vs. IA | CIFAKE (birdy654/cifake-real-and-ai-generated-synthetic-images) | Test accuracy | 97,85% | No |

La evaluacion se realizo sobre 20.000 imagenes de test (10.000 reales y 10.000 generadas). No se han publicado en la informacion disponible resultados desglosados por clase, precision, recall, F1, AUC ni matrices de confusion, ni comparaciones con otros modelos sobre el mismo split. Tampoco se aportan resultados fuera del dominio CIFAKE.

## Requisitos de hardware

- VRAM estimada: muy baja. Los pesos en FP32 ocupan aproximadamente 16 MB, por lo que la inferencia cabe holgadamente en menos de 1 GB de VRAM incluso con lotes grandes; la mayor parte del consumo proviene de las activaciones intermedias.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; no se necesita una A100 ni una H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes. El modelo esta pensado para escenarios donde el hardware no es el cuello de botella.
- CPU: es perfectamente viable como destino principal. La inferencia en CPU con ONNX Runtime es una opcion realista para despliegues de bajo volumen o en edge.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos diez anos, y tambien en dispositivos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (proveedores CPU, CUDA, TensorRT, DirectML, OpenVINO), y conversion desde ONNX a TensorFlow Lite, TensorRT o formatos de edge si se necesita. Al no publicarse pesos PyTorch, no hay ruta directa documentada hacia vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de clasificacion de imagen.
- Latencia y throughput: no disponibles. No se aportan mediciones de latencia ni de imagenes por segundo en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cftcimert/cifake-efficientnet-b0 | EfficientNet-B0 ajustado sobre CIFAKE, salida ONNX | ~4,02 M (calculado) | Imagen 224x224 | MIT | Hugging Face, 0 descargas |
| Baselines del paper CIFAKE (Bird y Lotfi, 2024) | CNN entrenadas sobre CIFAKE | No disponible | Imagen de baja resolucion | No disponible | Publicacion IEEE Access |
| Otros clasificadores real vs. IA en Hugging Face | Arquitecturas variadas (ResNet, ViT, CLIP-based) | No disponible | Variable | No disponible | No disponible en la informacion proporcionada |
| Detectores genericos de imagenes sinteticas (tipo UniversalFakeDetect o AIDE) | Caracteristicas de modelos grandes, deteccion cross-generador | No disponible | Variable | No disponible | No disponible en la informacion proporcionada |

No se dispone de cifras comparativas verificadas entre estas alternativas dentro de la informacion proporcionada. La unica comparacion defendible es cualitativa: este modelo es mucho mas ligero y barato de desplegar que los detectores basados en modelos grandes, pero tambien esta mas especializado en el dominio CIFAKE y no declara capacidades de generalizacion a generadores modernos.

## Limitaciones y advertencias

- Dominio de entrenamiento muy estrecho: las imagenes reales provienen de CIFAR-10 (32x32 píxeles) y las sinteticas de Stable Diffusion v1.4. El modelo puede estar detectando artefactos de resolucion, compresion o estilo propios de ese dataset en lugar de trazas generativas generales.
- Riesgo alto de degradacion fuera de dominio: ante imagenes de camara modernas de alta resolucion, generadores actuales (SDXL, Flux, Midjourney, DALL-E, modelos GAN) o imagenes con postprocesado, la precision declarada no es extrapolable.
- Sesgo de dataset: la procedencia CIFAR-10 implica categorias, resoluciones y distribuciones muy concretas; cualquier desviacion de esa distribucion puede introducir falsos positivos y falsos negativos sistematicos.
- Metrica no verificada: el 97,85% es una cifra autoinformada, sin evaluacion independiente ni resultados desglosados por clase o por tipo de generador.
- Sin validacion de la comunidad: 0 descargas y 1 like, repositorio de 0,0 GB, sin issues ni replicaciones conocidas. No hay evidencia externa de que el rendimiento se sostenga en uso real.
- Riesgo de alucinacion en sentido estricto: no aplica (no genera texto), pero si existe un riesgo analogo de falsa confianza, ya que la probabilidad de salida puede ser alta en imagenes que no pertenecen al dominio de entrenamiento.
- Preprocesado rigido: es obligatorio replicar exactamente el resize bicubico con antialias a 224x224 y la normalizacion ImageNet; cualquier desviacion altera la calibracion de la salida.
- Convencion de etiquetas: el modelo devuelve un logit crudo y requiere aplicar sigmoid manualmente. El orden de clases definido por el autor es 0 = FAKE, 1 = REAL.
- Licencia permisiva pero sin garantias: MIT permite uso comercial y modificacion, pero no ofrece ninguna garantia de idoneidad. El uso en decisiones con impacto (moderacion automatica sin revision, verificación de identidad, periodismo) es arriesgado sin validacion previa sobre datos propios.
- Las busquedas web realizadas no han devuelto resultados relacionados con el modelo; los unicos resultados obtenidos son paginas alemanas sobre tallas de ropa, por lo que no existe documentacion, paper, blog ni repositorio adicional localizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cftcimert/cifake-efficientnet-b0
- Dataset CIFAKE en Hugging Face: https://huggingface.co/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
- Dataset CIFAKE en Kaggle: https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
- Paper de CIFAKE: Bird, Jordan J. y Lotfi, Ahmad, "CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images", IEEE Access, 2024. DOI: https://doi.org/10.1109/ACCESS.2024.3356122
- Texto de la licencia MIT: https://opensource.org/licenses/MIT
