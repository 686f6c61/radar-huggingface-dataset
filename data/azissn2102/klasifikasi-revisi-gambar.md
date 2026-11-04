# azissn2102/klasifikasi-revisi-gambar

## Resumen

El modelo `azissn2102/klasifikasi-revisi-gambar` es un clasificador binario de imagenes orientado a detectar artefactos en imagenes generadas por IA (texto corrupto, disenos defectuosos) que requieren revision manual. Lo desarrolla el usuario independiente azissn2102 como componente interno de su pipeline de produccion en azissn2102.com, donde actua como primera capa de filtrado antes de invocar a Gemini, reduciendo asi el consumo de cuota de la API externa.

Tecnicamente no es un modelo neuronal entrenado de extremo a extremo, sino un clasificador lineal (regresion logistica) sobre embeddings congelados de `openai/clip-vit-base-patch32` (512 dimensiones, normalizados L2). La salida es una probabilidad escalar entre 0 y 1 que indica si la imagen necesita revision, con umbral operativo en 0.5.

Su relevancia es limitada: no es un modelo de proposito general ni compite en benchmarks publicos amplios. Su interes reside en el patron de arquitectura (CLIP congelado + cabeza lineal ligera) para tareas de triaje visual de bajo coste, y en que documenta metricas de validacion tanto en cross-validation como en despliegue real sobre VPS con cuantizacion q8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 congelado (encoder visual) + regresion logistica (512 coeficientes + intercept) |
| Parametros totales | No disponible (depende del backbone CLIP ViT-B/32, ~151 M; la cabeza lineal aporta 513 parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificacion, no generativo) |
| Tipos de cuantizacion | CLIP backbone ejecutado en q8 en produccion; la cabeza logistica es float |
| Idiomas soportados | No disponible (la salida es una probabilidad, no texto; los embeddings CLIP son multilingues de forma implicita) |
| Licencia | MIT |
| Formato de pesos | Pesos `coef` (512) e `intercept` exportados de forma plana; el backbone CLIP se carga por separado (no se indica el formato exacto del artefacto en el repositorio) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas. Primero, un encoder visual CLIP ViT-B/32 congelado extrae un vector de 512 dimensiones por imagen. Segundo, ese vector se normaliza en L2 y se pasa por una regresion logistica de 512 coeficientes mas intercept que produce la probabilidad de que la imagen necesite revision. La convencion de etiquetas es importante: en el snippet de la model card, `1 = LULUS` (pasa), por lo que la logica de negocio invierte la salida del sigmoide (`1 - sigmoid(z)`) para obtener la probabilidad de revision.

El conjunto de entrenamiento es muy reducido: 150 imagenes reales extraidas de un pipeline de produccion (291 ordenes) mas 5 augmentaciones por imagen, totalizando 750 vectores de 512 dimensiones. Las etiquetas provienen de un "tukang revisi otomatis" (revisor automatico) basado en Gemini, lo que introduce dependencia directa de las decisiones del modelo profesor. No se documenta uso de RLHF, DPO ni ajuste fino del backbone; el entrenamiento se limita al ajuste de la cabeza lineal, presumiblemente sobre GPU de Kaggle.

## Capacidades

- Clasificacion binaria de imagenes generadas por IA en dos clases: apta o pendiente de revision.
- Deteccion de texto corrupto o ilegible ("garbled text") y de disenos visualmente defectuosos en outputs generativos.
- Extraccion de embeddings visuales reutilizables mediante el backbone CLIP ViT-B/32, aprovechables para otras tareas de similitud o clustering.
- Inferencia de muy bajo coste computacional: una pasada CLIP mas una multiplicacion vectorial de 512 dimensiones.
- Integracion directa en servidores Node.js sin framework de deep learning, tal como se documenta en el snippet de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No soporta vision en el sentido de comprension semantica abierta: solo emite una etiqueta probabilistica.
- Capacidad multilingue no aplicable a la salida; el modelo no procesa ni genera lenguaje.

## Casos de uso

- Triaje previo de imagenes generadas por IA en una plataforma de diseno: el clasificador filtra las imagenes con probabilidad alta de artefactos antes de enviarlas a un modelo multimodal caro (Gemini), reduciendo el numero de llamadas a la API externa. Es el caso de uso original documentado por el autor.
- Control de calidad en pipelines de generacion masiva: integrado como paso previo a la publicacion, marca automaticamente las imagenes que deben ir a revision humana, con umbral ajustable segun la tolerancia a falsos negativos.
- Reduccion de costes operativos en startups con cuota limitada de APIs: al ejecutarse en un VPS con CLIP cuantizado q8, el coste marginal por imagen es practicamente nulo frente al coste por token de un modelo multimodal.
- Pre-filtrado en sistemas de moderacion de contenido visual generado: descarta imagenes con texto ilegible o composicion defectuosa antes de un revisor humano o de un modelo mas potente.
- Prototipado rapido de clasificadores visuales con pocos datos: el patron CLIP congelado mas regresion logistica sirve como linea base de bajo coste para nuevas categorias de defecto, sustituyendo el clasificador por uno nuevo entrenado sobre embeddings.
- Investigacion y docencia sobre extraccion de caracteristicas: util como ejemplo reproducible de transferencia de CLIP con cabeza lineal y validacion en produccion con cuantizacion q8.
- Automatizacion en servidores Node.js sin stack Python: el calculo de la sigmoide sobre el vector de 512 dimensiones se implementa en JavaScript puro, lo que simplifica el despliegue en infraestructura ligera.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| ROC-AUC | 0.867 | 5-fold CV, GPU de Kaggle |
| F1 | 0.920 | 5-fold CV |
| Recall | 0.871 | 5-fold CV |
| Precision | 0.975 | 5-fold CV |
| ROC-AUC | 0.955 | Validacion en servidor de produccion, n=150, CLIP q8 |
| Recall | 0.933 | Validacion en produccion, n=150 |
| Accuracy | 0.88 | Validacion en produccion, n=150 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los resultados proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: el backbone CLIP ViT-B/32 ocupa aproximadamente 600 MB en fp32 y unos 150-200 MB en q8; la cabeza logistica anade unos pocos KB. El conjunto es desplegable en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volumenes moderados. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobrada. En produccion el autor lo ejecuta en un VPS, presumiblemente en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas.
- Opciones de despliegue: inferencia directa con CLIP (PyTorch o transformers) mas una multiplicacion matricial; el autor documenta una implementacion en Node.js con CLIP cuantizado q8. Compatible con ONNX Runtime y con llama.cpp solo en la medida en que este soporte encoders CLIP, aunque no es el caso de uso previsto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de una unica pasada CLIP ViT-B/32, la latencia esperada es del orden de milisegundos a decenas de milisegundos por imagen en GPU y de decenas a centenares de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| azissn2102/klasifikasi-revisi-gambar | CLIP congelado + regresion logistica | ~151 M (backbone) + 513 | No aplica | AUC 0.955 en produccion (n=150) | MIT | HuggingFace, 0 descargas |
| CLIP ViT-B/32 (OpenAI) | Encoder vision-lenguaje zero-shot | ~151 M | No aplica | No comparable directamente; clasificacion zero-shot sin entrenamiento especifico | MIT | Ampliamente disponible |
| Clasificadores VGG19 citados en la literatura | CNN supervisada de clasificacion de imagenes | ~143 M | No aplica | No disponible en la informacion proporcionada | No disponible | No disponible |

No se dispone de una comparacion directa con clasificadores especificos de deteccion de artefactos en imagenes generadas por IA; los articulos encontrados en la busqueda web abordan la deteccion de imagenes generadas artificialmente desde otra perspectiva y no ofrecen cifras equiparables.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (150 imagenes originales, 750 vectores con augmentacion), lo que limita la generalizacion a dominios visuales distintos del pipeline original.
- Etiquetas generadas por Gemini: el clasificador hereda los sesgos y errores del modelo profesor, sin verificacion humana documentada.
- Metricas autoinformadas por el autor, sin evaluacion independiente ni conjunto de test publico; el AUC de 0.955 en produccion se calcula sobre solo 150 muestras.
- La convencion de etiquetas (`1 = LULUS`, es decir, apta) puede inducir errores de integracion si se asume la convencion opuesta; el snippet de la model card invierte explicitamente la sigmoide.
- Alto riesgo de sobreajuste al estilo visual concreto de la plataforma azissn2102.com; no se documenta rendimiento fuera de ese dominio.
- Precision muy alta (0.975) con recall inferior (0.871): el modelo tiende a dejar pasar imagenes defectuosas como aptas, lo que puede ser inaceptable si el coste de un falso negativo es alto.
- No procesa texto ni mantiene conversacion: no es un modelo generativo ni un asistente; cualquier expectativa de uso como LLM o VLM es incorrecta.
- Licencia MIT permite uso comercial, pero al depender del backbone CLIP conviene verificar las condiciones de la licencia original de OpenAI para CLIP.
- Sin soporte documentado para idiomas ni localizacion; la salida es unicamente una probabilidad.
- Riesgo de deriva (drift): si el modelo generativo de imagenes subyacente cambia, la distribucion de artefactos variara y el clasificador requerira reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azissn2102/klasifikasi-revisi-gambar
- Backbone CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
- Articulo sobre clasificacion de imagenes generadas por IA (JTIIK, UB): https://jtiik.ub.ac.id/index.php/jtiik/en/article/download/8118/1324/42857
- Articulo sobre VGG19 y clasificacion de imagenes (Paradigma, UIBU): https://ejurnal.uibu.ac.id/index.php/paradigma/article/download/1284/1051
