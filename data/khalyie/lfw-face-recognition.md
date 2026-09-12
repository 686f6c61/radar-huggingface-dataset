# Khalyie/lfw-face-recognition

## Resumen

lfw-face-recognition es un modelo de reconocimiento facial publicado por el usuario Khalyie en HuggingFace. Se trata de una red InceptionResnetV1 de la librería facenet-pytorch, preentrenada originalmente en VGGFace2 y afinada después sobre el conjunto de datos bitmind/lfw. El resultado es un extractor de embeddings faciales de 512 dimensiones, normalizados en L2, acompañado de una base de datos de 5749 identidades conocidas y de un clasificador de reconocimiento cerrado.

El modelo no es un LLM ni un modelo multimodal generativo: es un componente de visión por computador para identificación de personas (closed-set face identification). Su relevancia práctica es doble. Por un lado, sirve como referencia reproducible y ligera para experimentos de reconocimiento facial sobre LFW, ya que el autor publica el checkpoint junto con los embeddings de la base de datos, los nombres de identidad y los índices de los splits de entrenamiento, validación y prueba. Por otro lado, su tamaño reducido (repositorio de 0,1 GB) permite ejecutarlo en hardware modesto, incluso en CPU.

El rendimiento declarado por el autor es de un 89,31 % de precisión top-1 sobre imágenes de test reservadas, con 5749 identidades en la base de reconocimiento. El ajuste fino es muy conservador: solo se entrenaron la capa de embedding final (`last_linear`, `last_bn`) y una cabeza clasificadora, manteniendo congelado el resto del backbone. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado referencias externas ni publicaciones asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inception-ResNet-v1 (implementación `InceptionResnetV1` de facenet-pytorch) |
| Parametros totales | no disponible (el autor no publica el recuento; el tamaño del repositorio, 0,1 GB, es coherente con un checkpoint en fp32 del orden de 27 M de parametros, pero es una inferencia, no un dato declarado) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión; la entrada es una cara alineada y recortada, 160×160 píxeles en la configuración habitual de facenet-pytorch) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones ni exportaciones) |
| Idiomas soportados | no aplicable (reconocimiento facial; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt` con `state_dict`), más `.npy` (embeddings) y `.json` (nombres y metadatos) |
| Dimension de embedding | 512, normalizada en L2 |
| Identidades en la base de reconocimiento | 5749 |
| Precision declarada | 89,31 % top-1 sobre imágenes de test reservadas |
| Libreria | pytorch |
| Pipeline declarado en HuggingFace | no disponible |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 2026-09-12 (ambas; ver advertencias) |

## Arquitectura y entrenamiento

La arquitectura es Inception-ResNet-v1, la misma que emplea FaceNet y que facenet-pytorch distribuye como `InceptionResnetV1`. Combina bloques Inception con conexiones residuales y termina en una capa de embedding lineal de 512 dimensiones seguida de normalización batch. El punto de partida son los pesos preentrenados en VGGFace2 que ofrece la propia librería (`vgface2` en la API de facenet-pytorch).

El ajuste fino descrito en la model card es parcial y deliberadamente ligero: únicamente se entrenaron `last_linear`, `last_bn` y una cabeza clasificadora, mientras que el resto del backbone permaneció congelado. No se especifican en la información proporcionada el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de lote, la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta ningún uso de RLHF, DPO u otras técnicas de alineación, algo por otra parte esperable en un modelo discriminativo de visión.

El flujo de inferencia que describe el autor consiste en alinear la cara de entrada con MTCNN, calcular su embedding de 512 dimensiones y buscar la identidad más próxima en la base de datos mediante similitud coseno. El repositorio incluye el script complementario `predict_from_hub.py`, que descarga el checkpoint y la base de datos y ejecuta ese pipeline de extremo a extremo. Los tensores de caras alineadas, los embeddings por split y las predicciones del conjunto de test se publican en el repositorio de datos asociado, `Khalyie/lfw-face-recognition-data`.

## Capacidades

- Extracción de embeddings faciales de 512 dimensiones, normalizados en L2, a partir de imágenes alineadas.
- Identificación facial en conjunto cerrado (closed-set): asigna cada cara a una de las 5749 identidades de la base de datos.
- Búsqueda por similitud coseno sobre un índice de embeddings precalculados.
- Detección y alineación facial mediante MTCNN, integrada en el script de ejemplo del autor.
- Clasificación directa mediante la cabeza clasificadora añadida durante el ajuste fino.
- Generación de texto: no aplicable.
- Razonamiento, matemáticas, código: no aplicable.
- Tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no aplicable.
- Capacidades especiales (modo thinking, visión general, audio, vídeo): no disponible; el modelo está especializado en caras y no se documenta ninguna capacidad fuera de ese dominio.
- Rechazo de identidades desconocidas (open-set): no soportado de forma explícita; el clasificador siempre devuelve una de las 5749 clases y no se documenta un umbral de rechazo.

## Casos de uso

- Control de acceso en entornos cerrados: el modelo puede comparar la cara capturada por una cámara con la base de embeddings de empleados o usuarios registrados. Es adecuado cuando el conjunto de identidades es fijo, conocido y de tamaño moderado, y siempre con una base jurídica explícita y consentimiento.
- Organización automática de fototecas: indexar una colección de fotografías calculando embeddings y agrupando por similitud coseno permite etiquetar personas recurrentes sin necesidad de entrenamiento adicional.
- Búsqueda de similitud facial: cargar `database_embeddings.npy` en un índice vectorial (por ejemplo FAISS) y consultar con la cara de una foto nueva para recuperar las identidades más próximas.
- Detección de duplicados y cuentas repetidas: en una plataforma con verificación de identidad, los embeddings permiten señalar registros que corresponden a la misma persona mediante un umbral de distancia calibrado sobre datos propios.
- Investigación académica reproducible: el paquete incluye checkpoint, embeddings y splits de train/val/test, lo que facilita replicar el 89,31 % declarado y usarlo como línea base en experimentos de reconocimiento facial.
- Prototipado en hardware limitado: al tratarse de un backbone de unos 27 M de parámetros, se puede ejecutar en portátiles sin GPU dedicada o en dispositivos de borde para demos y pruebas de concepto.
- Preprocesado de datasets biométricos: extraer embeddings de un corpus de caras antes de entrenar un clasificador propio o de estudiar la calidad del conjunto (por ejemplo, detectar imágenes mal alineadas o etiquetas inconsistentes).
- Evaluación comparativa de pipelines de alineación: usar el modelo como componente fijo y variar el detector o el recorte para medir el impacto en la precisión top-1.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| LFW (bitmind/lfw), conjunto de test reservado | Precisión top-1 de identificación, conjunto cerrado, 5749 identidades | 89,31 % | Dato declarado por el autor en la model card |
| Otros benchmarks (MMLU, HumanEval, GSM8K, etc.) | no aplicable | no aplicable | El modelo no es un LLM |
| Verificación estándar de LFW (6000 pares) | no disponible | no disponible | El autor no reporta este protocolo |

No se han publicado otros resultados de benchmarks en la información disponible. Conviene subrayar que el 89,31 % corresponde a identificación en conjunto cerrado sobre 5749 clases, un protocolo distinto del de verificación por pares que se usa habitualmente para reportar resultados en LFW; la comparación directa con las cifras publicadas en ese otro protocolo no es válida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con pesos en fp32, un backbone de ~27 M de parámetros ocupa aproximadamente 110 MB; en fp16, unos 55 MB. Hay que sumar el detector MTCNN y las activaciones, lo que en cualquier caso mantiene el consumo por debajo de 1 GB para lotes pequeños. Es una estimación derivada del tamaño del repositorio y de la arquitectura, no una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4090, T4, A100 o H100 funcionan sin problema; las GPU grandes solo aportan ventaja en throughput por lotes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos diez años, e incluso en iGPU recientes. También es viable en CPU para inferencia puntual.
- Opciones de despliegue: script nativo de PyTorch con facenet-pytorch, exportación a TorchScript o a ONNX (no documentada por el autor, pero habitual en esta arquitectura), y servicio propio con FastAPI o similar. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de latencia ni de imágenes por segundo.
- Almacenamiento: el checkpoint y la base de datos ocupan 0,1 GB, por lo que el despliegue completo cabe en cualquier disco o contenedor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Embedding | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Khalyie/lfw-face-recognition | Inception-ResNet-v1 afinado en LFW | no disponible (del orden de 27 M, inferido) | 512 (L2) | Identificación cerrada sobre 5749 identidades | apache-2.0 | HuggingFace, 0 descargas |
| InceptionResnetV1 preentrenado en VGGFace2 (facenet-pytorch) | Inception-ResNet-v1 sin ajuste fino | del orden de 27 M en la implementación pública de facenet-pytorch | 512 (L2) | Verificación y extracción de embeddings genéricos | MIT en la librería (consultar condiciones de los pesos preentrenados) | Repositorio GitHub de facenet-pytorch |
| ArcFace / InsightFace | ResNet, MobileFaceNet y otras variantes | varía según el paquete | 512 típicamente | Verificación e identificación a gran escala | condiciones variables según el paquete de pesos; consultar antes de uso comercial | Repositorio InsightFace |
| dlib ResNet-29 v1 | ResNet-29 | no disponible | 128 | Verificación facial | licencia de dlib (Boost) para el código; condiciones del modelo preentrenado sujetas a revisión | dlib.net y repositorio GitHub |

La comparación cuantitativa con estas alternativas no es posible con la información disponible: el autor solo publica su propia métrica y no incluye resultados de los modelos de referencia sobre el mismo protocolo. Cualquier elección debería basarse en una evaluación propia sobre datos representativos del caso de uso real.

## Limitaciones y advertencias

- Ajuste fino muy restringido: solo se entrenaron `last_linear`, `last_bn` y la cabeza clasificadora, con el backbone congelado. La adaptación al dominio de LFW es por tanto limitada y puede no transferir bien a imágenes de cámaras de vigilancia, baja resolución, perfiles o iluminación adversa.
- Conjunto cerrado de 5749 identidades: el modelo devuelve siempre la identidad más próxima de su base de datos. Sin un umbral de rechazo calibrado externamente, no puede distinguir a una persona no registrada de una registrada, lo que genera falsos positivos en escenarios de acceso.
- Sesgos demográficos no evaluados: no hay ningún análisis de equidad por tono de piel, género, edad, gafas u otros atributos. LFW es un conjunto pequeño y poco diverso, por lo que el 89,31 % no garantiza un rendimiento homogéneo en poblaciones reales.
- Riesgo de degradación fuera de distribución: la precisión declarada corresponde a imágenes de test del propio dataset. En producción con datos propios la caída de rendimiento puede ser sustancial.
- Dependencia de la alineación: el pipeline descrito usa MTCNN; fallos de detección o un recorte incorrecto degradan directamente la calidad del embedding.
- Implicaciones legales y éticas: se trata de datos biométricos y de un sistema de identificación biométrica. Su uso en la Unión Europea está sujeto al RGPD y, según el caso, al régimen de alto riesgo del Reglamento de IA, con requisitos de base jurídica, evaluación de impacto y minimización de datos. En muchos contextos (identificación biométrica remota en espacios públicos, categorización por atributos sensibles) el uso está directamente prohibido o severamente restringido.
- Licencia: el checkpoint se publica bajo apache-2.0, pero la model card no aclara las condiciones de los pesos preentrenados en VGGFace2 ni del dataset LFW empleado. Conviene verificar esos términos antes de un uso comercial directo.
- Metadatos anómalos: las fechas de creación y actualización del repositorio figuran como 2026-09-12, lo que resulta inconsistente con la actividad del repositorio y con el recuento de descargas (0). Es un indicio de que los metadatos pueden no ser fiables.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes, sin issues ni publicaciones asociadas. No hay evidencia de soporte, versionado posterior ni validación independiente.
- Búsquedas web sin resultados relevantes: las consultas realizadas no han devuelto ningún artículo, blog o repositorio relacionado con este modelo; los resultados obtenidos eran contenido no relacionado. No existe por tanto validación externa del 89,31 % declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Khalyie/lfw-face-recognition
- Repositorio de datos asociado (citado en la model card): `Khalyie/lfw-face-recognition-data` — https://huggingface.co/datasets/Khalyie/lfw-face-recognition-data
- Dataset de entrenamiento y evaluación citado: bitmind/lfw — https://huggingface.co/datasets/bitmind/lfw
- Librería base facenet-pytorch: https://github.com/timesler/facenet-pytorch
- Script de ejemplo citado en la model card: `predict_from_hub.py` (incluido en el repositorio del modelo)
- Paper de referencia de la arquitectura FaceNet (Schroff et al., 2015): https://arxiv.org/abs/1503.03832
- Dataset VGGFace2 (origen de los pesos preentrenados del backbone): https://arxiv.org/abs/1710.08092
- No se han encontrado otros enlaces relevantes en la búsqueda web.
