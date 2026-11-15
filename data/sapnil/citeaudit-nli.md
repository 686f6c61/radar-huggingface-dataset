# Sapnil/citeaudit-nli

## Resumen

CiteAudit NLI es un clasificador de inferencia de lenguaje natural (NLI) especializado en verificar la integridad de citas bibliograficas en articulos biomedicos. Desarrollado por el usuario Sapnil, el modelo determina si la frase que cita un trabajo cientifico representa fielmente el contenido del articulo citado, o si por el contrario lo contradice, lo sobredimensiona, lo cita de forma incorrecta o lo usa para sostener un punto que el trabajo original solo atribuye a terceros. Es la mitad clasificadora del proyecto CiteAudit, cuyo otro componente es un reranker que localiza las frases mas relevantes del articulo citado.

Tecnicamente se trata de un fine-tuning de `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`, un modelo DeBERTa-v3-large (435 millones de parametros) preentrenado para NLI sobre multiples datasets. El ajuste se realizo sobre las 2141 citas de entrenamiento del Citation-Integrity dataset (Sarol et al., 2024), conservando la cabeza NLI original pero reetiquetando las clases: entailment pasa a ACCURATE, contradiction a NOT_ACCURATE y neutral a NOT ENOUGH INFO.

Su relevancia radica en que aborda un problema poco cubierto por los modelos generativos: la verificacion automatica de atribuciones cientificas a escala. Frente a la reproduccion de MultiVerS reportada por los autores del dataset (accuracy 0,584, macro-F1 0,524), este checkpoint alcanza 0,668 de accuracy y 0,556 de macro-F1 en el conjunto de test de Citation-Integrity, una mejora modesta pero medible en una tarea de clasificacion de tres clases con fuerte desbalance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabeza de clasificacion de secuencias |
| Parametros totales | 435.064.835 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncacion `longest_first` en la practica de uso) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser safetensors fp32 es convertible a int8/fp16 con herramientas estandar) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto (3 clases: ACCURATE, NOT_ACCURATE, NOT ENOUGH INFO) |
| Modelo base | MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli |
| Tamano del repositorio | 0,9 GB |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un DeBERTa-v3-large, un encoder transformer con atencion desacoplada y un mecanismo de embedding de posiciones relativas mejorado respecto a DeBERTa-v2. Sobre el checkpoint base, ya ajustado para NLI sobre MNLI, FEVER, ANLI y otros datasets, se aplico un fine-tuning supervisado con la cabeza de clasificacion original de tres clases, reetiquetadas semanticamente para la tarea de integridad de citas.

El entrenamiento utilizo las 2141 citas de entrenamiento del Citation-Integrity dataset (Sarol et al., 2024), con 3 epocas, learning rate 1e-5, batch efectivo de 8 y pesos de clase proporcionales a la raiz cuadrada de la frecuencia (`sqrt class weights`) para mitigar el desbalance entre clases. La seleccion del checkpoint final se hizo sobre el conjunto de desarrollo. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo encoder de clasificacion. La entrada se construye como par premisa-hipotesis: la premisa son las frases de evidencia del articulo citado ordenadas por relevancia, y la hipotesis es la frase citante sin los marcadores de cita.

## Capacidades

- Clasificacion de triple clase sobre pares (evidencia, frase citante): ACCURATE, NOT_ACCURATE y NOT ENOUGH INFO.
- Deteccion de cuatro tipos de cita incorrecta: contradiccion con la fuente, falta de soporte, sobresimplificacion o cita erronea, y atribucion de un punto que el trabajo original solo reporta de terceros.
- Verificacion de atribuciones cientificas en el dominio biomedico.
- Entrada de hasta 512 tokens de evidencia (aproximadamente 12 frases).
- Integracion con el pipeline CiteAudit mediante `citeaudit check`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Revision sistematica asistida: procesar lotes de articulos biomedicos y marcar automaticamente las citas que probablemente no representan fielmente el trabajo citado, para que un revisor humano las compruebe con prioridad. El modelo reduce el volumen de citas a inspeccionar manualmente.
- Control de calidad editorial en revistas: integrar el clasificador en el flujo de revision de manuscritos para detectar atribuciones erroneas antes de la publicacion, usando la salida NOT_ACCURATE como senal de alarma.
- Auditoria de literatura en revisiones narrativas: verificar que las afirmaciones de una revision se apoyan en las fuentes citadas, combinando el clasificador con el reranker de CiteAudit para localizar y evaluar la evidencia.
- Deteccion de citas de "terceros": identificar casos en los que un articulo cita un trabajo para sostener una conclusion que ese trabajo solo atribuye a otros autores, un patron frecuente de mala praxis en biomedicina.
- Investigacion sobre integridad cientifica: generar metricas agregadas de precision de citas en corpus biomedicos y estudiar patrones de error por revista, area tematica o antiguedad.
- Pre-filtrado en herramientas de escritura cientifica: avisar al autor, mientras redacta, de que la frase que esta construyendo podria no estar respaldada por la referencia seleccionada.
- Construccion de datasets de verificacion: usar las predicciones como etiquetas debiles para ampliar corpus de integridad de citas, con revision humana posterior.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de Citation-Integrity (606 citas, evidencia obtenida con el reranker de CiteAudit):

| Sistema | Accuracy | Macro-F1 |
|---|---|---|
| Sarol et al. 2024 (MultiVerS, BM25 + MonoT5), reproduccion de los autores | 0,584 | 0,524 |
| Este modelo, media de 3 semillas de entrenamiento | 0,668 ± 0,015 | 0,556 ± 0,015 |
| Este checkpoint (semilla 1, mejor en dev) | no disponible en la model card (remite a `test_metrics.json`) | no disponible |

La mejora respecto a la linea base reproducida es de aproximadamente 8,4 puntos de accuracy y 3,2 puntos de macro-F1. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,8-2,0 GB para los pesos (435 M de parametros) mas el overhead de activaciones, aproximadamente 2,5-3 GB en total.
- En fp16 o bf16: alrededor de 1,0-1,2 GB de pesos, con un total estimado de 1,5-2 GB.
- En int8: aproximadamente 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas ultimas el cuello de botella sera el throughput de batching, no la memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (referencia del autor), text-embeddings-inference (soportado segun los tags), endpoints compatibles, y conversion a ONNX o cuantizacion int8 con herramientas estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Resultado reportado |
|---|---|---|---|---|---|
| CiteAudit NLI (este modelo) | 435 M | 512 tokens | NLI de integridad de citas, 3 clases | MIT | Accuracy 0,668; macro-F1 0,556 (Citation-Integrity test) |
| MultiVerS (Sarol et al., 2024) | no disponible en la informacion | no disponible | Verificacion de atribuciones cientificas | no disponible | Accuracy 0,584; macro-F1 0,524 (reproduccion) |
| MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli | 435 M | 512 tokens | NLI generico (entailment, contradiction, neutral) | MIT | no disponible en la informacion |
| DeBERTa-v3-base NLI (variantes de la comunidad) | ~184 M | 512 tokens | NLI generico | MIT | no disponible en la informacion |

La comparacion directa con MultiVerS es la mas relevante porque comparte tarea y conjunto de evaluacion. Frente al modelo base, la diferencia es de especializacion: el checkpoint de MoritzLaurer ofrece NLI generico multilingue en varios datasets, mientras que este fine-tuning esta restringido al dominio biomedico y al ingles.

## Limitaciones y advertencias

- El propio autor advierte que aproximadamente un tercio de las decisiones son incorrectas: debe usarse para senalar citas a revision humana, nunca como veredicto automatico.
- Entrenado exclusivamente con 2141 citas de articulos biomedicos; la transferencia a otros campos (fisica, ciencias sociales, humanidades) no esta validada y probablemente sea deficiente.
- Solo procesa 512 tokens de evidencia, aproximadamente 12 frases; si la evidencia relevante esta mas alla de ese limite, el modelo no la vera.
- Solo considera la frase citante, no el parrafo circundante, por lo que pierde contexto discursivo que podria cambiar la interpretacion.
- Idioma limitado al ingles: citas en otros idiomas no estan soportadas.
- Riesgo de sesgo hacia las clases mayoritarias pese al uso de `sqrt class weights`; el macro-F1 de 0,556 indica un rendimiento desigual entre clases.
- Riesgo de alucinacion en sentido estricto no aplica (es un clasificador), pero si de falsos positivos y falsos negativos sistematicos en la deteccion de citas incorrectas.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base y del Citation-Integrity dataset para usos derivados.
- El checkpoint publicado corresponde a una sola semilla (la mejor en dev); el rendimiento en test de este checkpoint concreto no se detalla en la model card, solo se remite a un fichero `test_metrics.json`.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sapnil/citeaudit-nli
- Modelo base: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli
- Repositorio del proyecto CiteAudit: https://github.com/SapnilPatel/CiteAudit
- Dataset Citation-Integrity (Sarol et al., 2024): no disponible enlace directo en la informacion proporcionada
- Paper de referencia MultiVerS (Sarol et al., 2024): no disponible enlace directo en la informacion proporcionada
