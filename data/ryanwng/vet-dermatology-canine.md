# ryanWNG/vet-dermatology-canine

## Resumen

`ryanWNG/vet-dermatology-canine` es un clasificador de imágenes entrenado para identificar seis tipos de lesiones y afecciones cutáneas en perros: demodicosis, dermatitis, infecciones fúngicas, estado saludable, dermatitis alérgica por hipersensibilidad y tiña (*ringworm*). Lo desarrolla el usuario ryanWNG en el contexto del hackathon Gemma 4 Good, como parte del proyecto Howl Vision, y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es un cabezal de clasificación de 6 clases sobre un backbone convolucional EfficientNetV2-S preentrenado en ImageNet-21k y afinado en ImageNet-1k (`timm/tf_efficientnetv2_s.in21k_ft_in1k`), con entrada de 384x384 píxeles RGB y normalización ImageNet.

Su relevancia es práctica: la dermatología canina es una de las consultas más frecuentes en clínica veterinaria y el diagnóstico diferencial exige a menudo cultivos, raspados o citologías. Un clasificador con 94,0 % de accuracy y F1-macro de 0,923 sobre un conjunto de test reservado de 433 imágenes ofrece un punto de partida para triaje, prefiltrado de casos en telemedicina o cribado en refugios, siempre como apoyo y no como sustituto del criterio veterinario.

El repositorio pesa 0,2 GB e incluye el checkpoint en PyTorch (`.pt`) con la clave `model_state_dict`, lo que permite cargarlo con `timm` y `torch.load` en pocas líneas. La model card no documenta el volumen ni la composición del conjunto de entrenamiento, ni el reparto por razas, dispositivos o condiciones de captura, lo que limita la evaluación de su robustez fuera del dominio de test declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S convolucional (`timm/tf_efficientnetv2_s.in21k_ft_in1k`) con cabezal de clasificación de 6 clases |
| Parametros totales | No disponible en la model card; la implementación de referencia de EfficientNetV2-S en `timm` ronda los 21,5 M de parámetros (dato externo, no confirmado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: clasificador de imágenes con entrada fija de 384x384 RGB |
| Tipos de cuantizacion | No disponible. El autor solo publica checkpoint PyTorch en precisión original; no se documentan versiones INT8, FP16, ONNX ni TorchScript |
| Idiomas soportados | No aplica (modelo de visión). Las etiquetas de clase están en inglés; no se documenta ningún soporte lingüístico |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` con diccionario `model_state_dict` (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es una CNN EfficientNetV2-S, en concreto la variante `tf_efficientnetv2_s.in21k_ft_in1k` de `timm`: un backbone preentrenado primero en ImageNet-21k (14,7 M imágenes, ~11 k clases) y afinado después en ImageNet-1k, sobre el que se sustituye la cabeza final por una capa densa de 6 salidas (`num_classes=6`). EfficientNetV2 combina bloques MBConv y Fused-MBConv con escalado compuesto y entrenamiento con aumento progresivo; es una elección coherente para un dataset pequeño o mediano por su buena relación accuracy/coste computacional frente a transformers de visión del mismo orden de magnitud.

El preprocesado es el estándar de ImageNet: redimensionado a 384x384, RGB y normalización con media y desviación típica de ImageNet. La model card no especifica el número de imágenes de entrenamiento, la composición del dataset, el reparto train/val/test ni si hubo aumento de datos, *class weighting* o *fine-tuning* parcial. Tampoco se documenta ningún tipo de alineamiento posterior (RLHF, DPO u otro), algo por otra parte ajeno a un clasificador supervisado. La única información de evaluación es la métrica sobre el conjunto de test reservado.

## Capacidades

- Clasificación de imágenes de piel canina en 6 clases cerradas: `demodicosis`, `Dermatitis`, `Fungal_infections`, `Healthy`, `Hypersensitivity_Allergic_Dermatitis` y `ringworm`.
- Salida de tipo *logits*/probabilidades por clase vía `image-classification`; no genera texto ni explicaciones.
- Inferencia sobre imágenes RGB individuales a 384x384 con normalización ImageNet.
- Integrable como componente de un pipeline multimodal: el proyecto Howl Vision lo plantea junto a modelos Gemma para construir una herramienta de apoyo veterinario.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni diálogo multi-turno.
- No soporta entrada de vídeo, audio ni texto; una imagen por inferencia (o lote de imágenes).
- Capacidad multilingüe: no aplica; las etiquetas están en inglés y el modelo no procesa lenguaje.

## Casos de uso

- **Triaje en clínica veterinaria**: el clínico fotografía la lesión con el móvil del centro y el modelo devuelve la distribución de probabilidad sobre las 6 clases; sirve para priorizar si conviene raspado cutáneo, citología o cultivo fúngico antes de la consulta.
- **Prefiltrado en servicios de telemedicina veterinaria**: integrado en el formulario de subida de fotos, clasifica el caso y lo enruta al veterinario especialista en dermatología o a consulta general según la clase predicha y la confianza, reduciendo el tiempo de respuesta en casos de tiña o demodicosis.
- **Cribado en refugios y protectoras**: con un móvil y el modelo ejecutándose en local (CPU o GPU de gama baja), se hace una pasada rápida sobre los animales recién llegados para detectar posibles infecciones fúngicas contagiosas y aislarlos preventivamente.
- **Aplicación móvil para tutores**: app que orienta sobre si la lesión del perro parece un cuadro alérgico, una infección o piel sana, con un mensaje explícito de que no sustituye la visita al veterinario; el tamaño del checkpoint (0,2 GB) permite despliegue en servidor con latencia baja.
- **Anotación asistida y curación de datasets**: usar las predicciones como preetiquetado en un flujo de revisión humana para acelerar la construcción de un corpus dermatológico mayor y más equilibrado por raza y tipo de pelaje.
- **Docencia y formación de auxiliares veterinarios**: herramienta de práctica que muestra la clase predicha sobre casos fotográficos y permite comparar con el diagnóstico confirmado, útil para ilustrar el solapamiento visual entre dermatitis alérgica y otras dermatitis.
- **Generación de informes asistida por LLM**: dentro del pipeline Howl Vision, la etiqueta y la confianza del clasificador se pasan a un modelo de lenguaje (familia Gemma) que redacta un resumen estructurado del caso para el historial clínico.

## Benchmarks y rendimiento

Evaluación sobre conjunto de test reservado, n = 433 imágenes (intervalo de confianza de Wilson al 95 % para accuracy):

| Metrica | Valor |
|---|---|
| Accuracy | 94,0 % [91,5 % – 95,8 %] |
| F1-macro | 0,923 |
| Tamano del conjunto de test | 433 imágenes |
| Numero de clases | 6 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estas dos métricas: no hay desglose de precisión y *recall* por clase, ni matriz de confusión, ni comparación con baselines o con otros modelos veterinarios.

## Requisitos de hardware

- **VRAM estimada para inferencia**: por debajo de 1 GB en FP32 para lote de tamaño 1 (un EfficientNetV2-S de ~21,5 M de parámetros ocupa del orden de 85-90 MB en pesos FP32; el resto es activación y overhead del runtime). Con lotes de 32-64 imágenes a 384x384 conviene reservar 4-8 GB. Estimaciones de orden de magnitud, no publicadas por el autor.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4060, RTX 4090 o superiores dan margen de sobra para servir en lote. En数据中心, A100/H100 o L4/T4 son válidas pero sobredimensionadas para este modelo.
- **Cabe en GPU consumer**: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, etc.). También es viable en CPU: unas decenas de milisegundos a pocos cientos por imagen en un x86 moderno, y ejecutable en dispositivos tipo Raspberry Pi 5 o Apple Silicon vía conversión a ONNX.
- **Opciones de despliegue**: PyTorch + `timm` (camino documentado por el autor), exportación a TorchScript u ONNX Runtime para producción, servidor de inferencia con Triton o BentoML, y contenedor FastAPI para una API HTTP sencilla. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones del autor; a modo orientativo, un EfficientNetV2-S a 384x384 procesa del orden de cientos de imágenes por segundo en una RTX 4090 con lotes grandes, pero es una estimación de la arquitectura, no un dato medido sobre este checkpoint.

## Comparativa con modelos similares

No se han publicado en la información disponible otros clasificadores de dermatología canina con los que comparar directamente. La comparación solo puede hacerse a nivel de arquitectura backbone:

| Modelo | Parametros (aprox.) | Entrada | Contexto/tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ryanWNG/vet-dermatology-canine` (EfficientNetV2-S, 6 clases) | No confirmado por el autor (~21,5 M en la referencia de `timm`) | 384x384 RGB | Clasificación dermatológica canina, 6 clases | Apache 2.0 | HuggingFace, 0 descargas |
| EfficientNetV2-S ImageNet-1k (`timm`) | ~21,5 M | 384x384 RGB | Clasificación genérica en 1000 clases | Apache 2.0 (pesos `timm`) | Ampliamente disponible |
| EfficientNet-B0 ImageNet-1k | ~5,3 M | 224x224 RGB | Clasificación genérica en 1000 clases | Apache 2.0 | Ampliamente disponible |
| ConvNeXt-Tiny / ViT-B/16 | ~28 M / ~86 M | 224x224 RGB | Clasificación genérica en 1000 clases | Apache 2.0 / varios | Ampliamente disponible |

Ninguno de los modelos genéricos de la tabla predice las clases veterinarias de este modelo; se incluyen solo como referencia de coste computacional y punto de partida del *fine-tuning*. Para una comparación real de rendimiento en dermatología canina haría falta un conjunto de test común, que no está disponible públicamente en la información consultada.

## Limitaciones y advertencias

- **No es un dispositivo médico ni un diagnóstico**: la salida es una distribución de probabilidad sobre 6 clases y no incorpora información clínica (raza, edad, localización de la lesión, historial, tratamientos previos). Cualquier uso debe ser de apoyo y con revisión veterinaria.
- **Riesgo de alucinación en sentido laxo**: el modelo siempre devuelve una de las 6 etiquetas, aunque la imagen no corresponda a ninguna (por ejemplo, una lesión en otra especie, una foto de mala calidad o una afección no incluida en el esquema). No se documenta ningún mecanismo de rechazo ni umbral de confianza calibrado.
- **Sesgos desconocidos**: no se publica la composición del dataset de entrenamiento (razas, tipos de pelaje, fototipos, iluminación, dispositivos de captura, distribución geográfica). Las razas de pelo corto o las pieles pigmentadas pueden estar infrarrepresentadas, y el rendimiento puede degradarse fuera del dominio de las 433 imágenes de test.
- **Clases solapadas**: "Dermatitis" y "Hypersensitivity_Allergic_Dermatitis" son categorías clínicamente relacionadas y visualmente próximas; no hay matriz de confusión ni F1 por clase para cuantificar la confusión entre ellas.
- **Riesgo sanitario en tiña**: `ringworm` es una infección zoonótica; un falso negativo en esta clase tiene consecuencias de contagio, por lo que este uso requiere especialmente confirmación por cultivo o lámpara de Wood.
- **Limitaciones de contexto e idioma**: entrada de una sola imagen fija a 384x384; no admite imágenes de alta resolución sin recorte previo, ni vídeo, ni texto, ni múltiples imágenes por caso. Las etiquetas están en inglés.
- **Licencia**: Apache 2.0 permite uso comercial y modificación con atribución y aviso de cambios; sin embargo, la licencia no cubre responsabilidad clínica ni garantiza la procedencia o los derechos del dataset de entrenamiento, que no se documenta.
- **Madurez del artefacto**: 0 descargas y 0 *likes* en el momento de la consulta, creado y actualizado el mismo día (2026-10-18); es un entregable de hackathon, sin mantenimiento ni versionado posteriores conocidos.
- **Reproducibilidad parcial**: no se documentan semillas, hiperparámetros, número de épocas ni el conjunto de datos, por lo que el 94,0 % de accuracy no es replicable a partir de la información publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryanWNG/vet-dermatology-canine
- Proyecto Howl Vision (repositorio citado en la model card): https://github.com/ikchain
- Arquitectura base en `timm` (referencia de la model card): https://huggingface.co/timm/tf_efficientnetv2_s.in21k_ft_in1k
- Gemma 4 Good Hackathon: no disponible en la información proporcionada (sin URL)
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo o Space: no disponible en la información proporcionada
