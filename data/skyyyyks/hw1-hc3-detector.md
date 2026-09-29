# skyyyyks/hw1-hc3-detector

## Resumen

El modelo `skyyyyks/hw1-hc3-detector`, publicado por el usuario skyyyyks, es un clasificador binario de texto en inglés que distingue respuestas escritas por humanos (etiqueta 0) de respuestas generadas por ChatGPT (etiqueta 1). Se trata de un fine-tuning completo (encoder más cabeza de clasificación) del encoder `sentence-transformers/all-MiniLM-L6-v2`, un transformer tipo BERT de 6 capas con 22.713.986 parámetros, sobre el corpus HC3 (Hello-SimpleAI), un benchmark de detección de texto generado por IA.

El modelo se entrenó cinco épocas con AdamW (lr 2e-05, batch 32) sobre 37.334 respuestas de entrenamiento, con particiones independientes de validación (4.666) y test (4.668), sin solapamiento de preguntas normalizadas entre splits. En el split de test retenido alcanza una exactitud de 0,990788 y un F1 macro de 0,990788, muy por encima de la línea base de MiniLM congelado más regresión logística (F1 macro 0,845096).

Su relevancia práctica es acotada y muy específica: por tamaño (23 millones de parámetros, repositorio de 0,1 GB) es un detector desplegable en CPU o en cualquier GPU de consumo, útil como línea base reproducible en investigación sobre detección de texto sintético y como filtro de bajo coste en pipelines de curación de datos. La model card advierte explícitamente de que sus métricas describen un benchmark histórico y equilibrado y no garantizan fiabilidad frente a generadores modernos, texto parafraseado o escritura mixta humano/IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, 6 capas) con cabeza de clasificacion de secuencia |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 256 tokens (truncacion en entrenamiento e inferencia); el encoder base admite hasta 512 posiciones |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors (precision original); no hay variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible: ni la model card ni los metadatos de HuggingFace especifican licencia |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional estilo BERT, concretamente la variante MiniLM-L6 de `sentence-transformers/all-MiniLM-L6-v2` (384 dimensiones ocultas, 6 capas, aproximadamente 22,7 millones de parametros), a la que se anade una cabeza de clasificacion sobre la representacion del token `[CLS]`. No emplea tecnicas de atencion lineal, decodificacion especulativa ni mezcla de expertos: es un clasificador denso estandar de `AutoModelForSequenceClassification`.

El entrenamiento parte del dataset HC3 en la revision `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`. De cada pregunta elegible se toma la primera respuesta humana no vacia y la primera respuesta de ChatGPT no vacia; se descartan preguntas vacias, pares ausentes o identicos y preguntas duplicadas tras normalizacion. La particion se hace 80/10/10 por pregunta con semilla 42 antes de aplanar las respuestas, lo que evita fugas entre splits. El optimizador es PyTorch AdamW con tasa de aprendizaje 2e-05, tamano de lote 32 y cinco epocas; se registran metricas de validacion en cada epoca y se guarda el modelo de la quinta. Solo se usa el texto de la respuesta, con truncacion a 256 tokens. No se documenta RLHF, DPO ni ajuste por preferencias, ni innovaciones tecnicas adicionales mas alla del fine-tuning supervisado.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve la etiqueta `human` (0) o `ChatGPT` (1) a partir del texto de una respuesta.
- Deteccion de texto generado por IA en el dominio concreto de respuestas a preguntas del corpus HC3.
- Inferencia ligera: 22,7 millones de parametros permiten ejecucion en CPU y en GPUs de gama baja con latencias de milisegundos.
- Integracion directa con la API de `transformers` (`AutoTokenizer` + `AutoModelForSequenceClassification`) y con `text-embeddings-inference` (la model card esta marcada como compatible con endpoints).
- Procesamiento por lotes de grandes volumenes de texto truncado a 256 tokens.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No es un modelo generativo: no produce texto, solo logits de clasificacion.

## Casos de uso

- Filtrado de contenido generado por IA en plataformas UGC: el modelo puede etiquetar respuestas de foros, comunidades de preguntas y respuestas o secciones de comentarios para marcar contenido sospechoso de ser sintetico antes de una revision humana.
- Curacion de corpus de entrenamiento: al detectar texto generado por ChatGPT, permite excluir muestras sinteticas de un dataset recolectado de internet y reducir el riesgo de contaminacion por datos generativos.
- Linea base de investigacion en deteccion de texto IA: sirve como referencia reproducible (metricas en `metrics.json`, semilla y revision del dataset documentadas) contra la que comparar detectores mas grandes o basados en perplexidad.
- Analisis retrospectivo de datasets: dado que HC3 es un corpus historico de ChatGPT, el modelo es adecuado para reproducir y auditar experimentos sobre ese benchmark concreto, no para auditar generadores actuales.
- Clasificacion masiva de bajo coste: con 22,7 millones de parametros puede ejecutarse en CPU sobre lotes de miles de respuestas, lo que lo hace viable para tareas de etiquetado offline sin GPU.
- Prototipado rapido de producto: integrarlo como primer filtro en una tuberia de moderacion que derive a revision humana los casos positivos, dado que su coste computacional es minimo.
- Investigacion sobre sesgos de detectores: el modelo permite estudiar atajos de formato o estilo aprendidos del dataset HC3 (por ejemplo, diferencias de longitud o estructura entre respuestas humanas y de ChatGPT en ese corpus).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test retenido de HC3 (mismo conjunto de 4.668 respuestas, balanceado):

| Modelo | Accuracy | Precision macro | Recall macro | F1 macro |
|---|---|---|---|---|
| MiniLM congelado + regresion logistica | 0,845116 | 0,845294 | 0,845116 | 0,845096 |
| MiniLM fine-tuned (este modelo) | 0,990788 | 0,990955 | 0,990788 | 0,990788 |

Matrices de confusion (filas = etiqueta real, columnas = etiqueta predicha, orden `[human, ChatGPT]`): linea base `[[1946, 388], [335, 1999]]`; modelo fine-tuned `[[2291, 43], [0, 2334]]`. El modelo fine-tuned no produce ningun falso negativo sobre ChatGPT en este split y comete 43 falsos positivos sobre respuestas humanas. El historial de validacion completo, las metricas detalladas y las versiones de las librerias estan en `metrics.json` del repositorio. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y ninguno de ellos es aplicable a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 el checkpoint ocupa aproximadamente 91 MB; en fp16, unos 45 MB; en int8, unos 23 MB. Con activaciones y overhead de runtime, el consumo se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El modelo es funcional en RTX 3060, RTX 4090, T4, A10, A100 y H100, pero no necesita ninguna de las de gama alta; una T4 es sobradamente suficiente.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050 Ti en adelante). Tambien es viable en CPU, en dispositivos tipo Jetson y en hardware embebido.
- Opciones de despliegue: `transformers` en PyTorch, `text-embeddings-inference` (etiqueta presente en el repo), Text Generation Inference para la tarea de clasificacion, vLLM con soporte de clasificacion, ONNX Runtime y exportacion a TorchScript. GGUF y llama.cpp no estan disponibles para este checkpoint.
- Latencia y throughput: no disponible. No hay medidas publicadas para este checkpoint; por su clase de tamano (6 capas, 384 dimensiones ocultas) es esperable procesar lotes de cientos de secuencias por segundo en una GPU moderna y decenas por segundo en CPU, pero son estimaciones orientativas, no datos medidos.

## Comparativa con modelos similares

| Modelo | Arquitectura y parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skyyyyks/hw1-hc3-detector | MiniLM-L6, 22,7 M | 256 tokens | F1 macro 0,990788 en el test de HC3 de su propia particion | No disponible | safetensors en HuggingFace; 0 descargas |
| Hello-SimpleAI/chatgpt-detector-roberta | RoBERTa-base, aproximadamente 125 M | No disponible | No disponible en esta ficha; entrenado tambien sobre HC3, por lo que las cifras no son directamente comparables sin usar la misma particion | No disponible | Pesos publicos en HuggingFace |
| openai-community/roberta-base-openai-detector | RoBERTa-base, aproximadamente 125 M | No disponible | No disponible; orientado a salidas de GPT-2, no a ChatGPT | No disponible | Pesos publicos en HuggingFace |
| Detectores basados en perplexidad (por ejemplo, DetectGPT) | Sin parametros propios; requieren un modelo de lenguaje auxiliar | Depende del modelo base | No disponible | Depende del modelo auxiliar | Implementaciones de investigacion |

La comparacion cuantitativa entre estos modelos no es fiable con la informacion disponible: las cifras de este checkpoint proceden de una particion propia de HC3 y los otros detectores no publican resultados sobre esa misma particion en los datos consultados.

## Limitaciones y advertencias

- Las metricas describen un benchmark historico y equilibrado (HC3). No establecen fiabilidad frente a generadores modernos, dominios no vistos, texto parafraseado, respuestas editadas ni escritura mixta humano/IA.
- El modelo puede aprender atajos procedentes del formato y de las diferencias de fuente del dataset HC3 en lugar de senales semanticas de autoria, lo que infla las metricas en ese corpus y no se transfiere a produccion.
- Truncacion a 256 tokens: las respuestas largas pierden contenido y la prediccion se basa solo en el fragmento inicial.
- Se observan falsos positivos (43 respuestas humanas clasificadas como ChatGPT en el split de test). La model card indica explicitamente que las predicciones no deben usarse como evidencia de mala conducta academica.
- Sesgos potenciales: el clasificador esta entrenado sobre respuestas en ingles y sobre el estilo de una version concreta de ChatGPT; puede penalizar estilos de escritura formales o no nativos, y no se ha evaluado su comportamiento por subgrupos demograficos.
- Limitacion idiomatica: solo ingles. No se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Licencia no disponible: al no especificarse licencia en la model card ni en los metadatos de HuggingFace, no hay autorizacion explicita para uso comercial. Conviene contactar con el autor antes de cualquier despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion (2026-09-29) corresponden a un artefacto sin adopcion publica ni validacion externa; carece del respaldo de una evaluacion independiente.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador, no un generador), pero si existe riesgo de clasificacion erronea con alta confianza sobre texto fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skyyyyks/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper de HC3 (Guo et al., 2023): https://arxiv.org/abs/2301.07597
