# AT707/InferenceGuard-Roberta-Risk

## Resumen

InferenceGuard-Roberta-Risk es un clasificador de texto multi-tarea desarrollado por AT707 que estima el riesgo de privacidad inferencial en prompts enviados a modelos de lenguaje. Concretamente, predice si a partir de un texto es posible inferir cuatro atributos demograficos sensibles: edad, ubicacion, ocupacion y educacion. El modelo actua como motor principal de estimacion de riesgo dentro del framework de cortafuegos de privacidad InferenceGuard, y esta pensado para integrarse como filtro previo a la llamada a un LLM.

Tecnicamente se trata de un fine-tuning de `FacebookAI/roberta-base`, un transformer encoder de tipo BERT con 125 millones de parametros aproximadamente, adaptado a una tarea de clasificacion binaria multi-cabeza (una salida por atributo). Incluye calibracion mediante temperature scaling a nivel de atributo, un detalle relevante para produccion porque permite interpretar las probabilidades como estimaciones calibradas de riesgo y no solo como puntuaciones relativas.

Su relevancia actual radica en el auge de los despliegues de LLM en entornos regulados, donde la fuga de informacion personal a traves de inferencias (no solo de datos explicitos) es un vector de riesgo creciente bajo marcos como el RGPD. El modelo es pequeno, rapido y de licencia MIT, lo que lo hace desplegable como guardarrail de baja latencia, aunque su cobertura linguistica se limita al ingles y su adopcion publica es practicamente nula en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, fine-tuning) |
| Parametros totales | Aproximadamente 125 M (derivado de roberta-base; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de roberta-base; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch`); safetensors no confirmado |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder de 12 capas y 768 dimensiones de representacion ocultas, preentrenado sobre corpus en ingles. Sobre esa base se anade una cabeza de clasificacion multi-tarea que produce cuatro salidas binarias independientes, una por cada atributo objetivo (edad, ubicacion, ocupacion y educacion). La model card indica que se aplica calibracion mediante temperature scaling a nivel de atributo, lo que sugiere que las probabilidades de salida se ajustaron post-entrenamiento para mejorar su correspondencia con frecuencias empiricas.

No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, si hubo anotacion humana o generacion sintetica, ni si se aplicaron tecnicas de regularizacion como DPO o RLHF (no aplicables en un encoder de clasificacion). Tampoco se documentan innovaciones arquitectonicas mas alla del esquema multi-cabeza estandar. El repositorio ocupa 1.0 GB, un tamano considerable para un modelo de 125 M de parametros, lo que podria indicar la presencia de checkpoints adicionales, multiples cabezas guardadas por separado o artefactos de calibracion, aunque no se detalla su contenido.

## Capacidades

- Clasificacion binaria multi-tarea: predice inferabilidad de edad, ubicacion, ocupacion y educacion a partir de un texto.
- Estimacion calibrada de riesgo: devuelve probabilidades (`predict_proba`) ajustadas por temperature scaling por atributo.
- Deteccion de fuga de informacion implicita: no solo detecta datos explicitos, sino atributos inferibles a partir de contexto (por ejemplo, deducir ocupacion a partir de estudios y ciudad).
- Integracion como cortafuegos de LLM: disenado para ejecutarse como pre-filtro antes de enviar prompts a un modelo generativo.
- Clasificacion de texto general: al estar basado en RoBERTa, hereda la capacidad de procesar texto en ingles con contexto de hasta 512 tokens.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Cortafuegos de privacidad en produccion: interceptar cada prompt de usuario antes de enviarlo a un LLM, calcular las cuatro probabilidades de inferabilidad y aplicar politicas (bloqueo, redaccion o aviso) cuando el riesgo supera un umbral configurable. Su tamano reducido permite ejecutarlo en linea sin anadir latencia significativa.
- Cumplimiento del RGPD en asistentes conversacionales: auditar flujos de atencion al cliente para detectar prompts que revelen edad, ubicacion, ocupacion o nivel educativo, generando registros de tratamiento y evidencias de minimizacion de datos.
- Redaccion automatica de prompts (prompt sanitisation): usar las salidas del clasificador como senal para un modulo de reescritura que elimine o generalice los atributos inferibles antes de la llamada al LLM principal.
- Investigacion en privacidad inferencial: servir como baseline reproducible (licencia MIT, pesos publicos) para experimentos sobre que tipo de formulaciones filtran mas informacion demografica.
- Auditoria de datasets y logs: pasar conversaciones historicas o corpus anotados por el clasificador para cuantificar la densidad de atributos inferibles y priorizar su anonimizacion.
- Filtrado en pipelines de entrenamiento: descartar o marcar ejemplos de un corpus que permitan inferir atributos sensibles, reduciendo el riesgo de memorizacion en modelos posteriores.
- Modulo de evaluacion en sistemas de agentes: integrarse en frameworks de agentes como paso de validacion de las entradas del usuario antes de la planificacion multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni comparaciones con lineas base para ninguna de las cuatro tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0.5 GB para los pesos (125 M parametros) mas overhead de activaciones, en torno a 1-2 GB en total para batches pequenos.
- VRAM estimada en FP16: aproximadamente 0.25 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU con latencias aceptables para clasificacion de textos cortos.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (referencia en la model card), ONNX Runtime, TorchScript, y potencialmente vLLM o TGI para clasificacion (no confirmado). Para CPU, `optimum` con exportacion a ONNX es la via habitual.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por peticion en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AT707/InferenceGuard-Roberta-Risk | Aprox. 125 M | 512 tokens | Clasificacion multi-tarea de riesgo de privacidad | MIT | Hugging Face |
| FacebookAI/roberta-base | Aprox. 125 M | 512 tokens | Modelo base de lenguaje (encoder) | MIT | Hugging Face |
| Modelos de PII detection tipo `dslim/bert-base-NER` | Aprox. 110 M | 512 tokens | Reconocimiento de entidades nombradas (PII explicita) | MIT | Hugging Face |
| Guardarrailes de privacidad basados en LLM (p. ej. clasificadores con Llama) | 7 B o mas | 4k-8k tokens | Deteccion de riesgo en prompts | Variable | Variable |

La diferencia clave frente a los detectores de PII clasicos es que InferenceGuard no busca entidades explicitas, sino la inferibilidad de atributos demograficos, un objetivo mas cercano a la privacidad inferencial que a la redaccion de datos. Frente a guardarrailes basados en LLM, la ventaja es el coste y la latencia; la desventaja, la menor capacidad de razonamiento contextual y la cobertura limitada al ingles.

## Limitaciones y advertencias

- Cobertura linguistica limitada al ingles: prompts en castellano u otros idiomas no estan soportados de forma fiable.
- Contexto maximo de 512 tokens: prompts largos requieren truncado o segmentacion, lo que puede perder senal de riesgo distribuida a lo largo del texto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision, recall ni calibracion real, lo que impide evaluar su fiabilidad antes de desplegarlo.
- Riesgo de falsos positivos y falsos negativos: un clasificador de inferibilidad puede bloquear prompts legitimos o dejar pasar fugas sutiles; requiere umbrales ajustados por el integrador.
- Adopcion nula: 0 descargas y 0 likes en el momento de la ficha; sin validacion por parte de la comunidad ni issues documentados.
- Dependencia de codigo externo: el ejemplo de uso importa `src.risk_model.roberta_model.RobertaRiskClassifier`, una clase que no forma parte de `transformers` y que el usuario debe obtener del repositorio o del framework InferenceGuard; sin ese codigo, la carga con `AutoModelForSequenceClassification` puede no reproducir el comportamiento esperado.
- Sesgos potenciales: al entrenarse presumiblemente sobre datos en ingles, puede tener sesgos culturales y demograficos en la estimacion de inferibilidad para nombres, localizaciones o instituciones no anglosajonas.
- Licencia MIT: permite uso comercial sin restricciones, pero no exime de cumplir el RGPD ni otras normativas aplicables al tratamiento de datos personales.
- Fecha de creacion futura en los metadatos (2026-11-09): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AT707/InferenceGuard-Roberta-Risk
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Paper de RoBERTa (Liu et al., 2019): https://arxiv.org/abs/1907.11692
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion de Transformers: https://huggingface.co/docs/transformers
