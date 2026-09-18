# kokuren/doku-chiwawa-ja-offensiveness-deberta-v2-small

## Resumen

Doku-Chiwawa Japanese Offensiveness DeBERTa-v2 Small es un modelo de clasificación de texto en japonés desarrollado por el usuario kokuren, pensado para estimar siete dimensiones continuas relacionadas con la ofensividad en publicaciones de redes sociales. No es un generador de texto: es un encoder DeBERTa-v2 con cabeza de clasificación que devuelve siete logits, a los que se aplica una sigmoide para obtener puntuaciones normalizadas entre 0.0 y 1.0. El modelo se ha afinado a partir de izumi-lab/deberta-v2-small-japanese.

El modelo ocupa un nicho muy concreto: análisis ligero de toxicidad que pueda ejecutarse íntegramente en el navegador. Con 17.868.807 parámetros según los pesos en safetensors y un artefacto ONNX FP32 de aproximadamente 69 MB, está diseñado para desplegarse con Transformers.js y ONNX Runtime Web, evitando dependencias de preprocesado externas como MeCab + UniDic gracias a un tokenizer SentencePiece estándar con tokenizer.json.

Su relevancia actual radica en dos factores. Por un lado, cubre la escasez de modelos de moderación específicos para japonés con salidas desagregadas (insulto, amenaza, ataque identitario, hostilidad indirecta, etc.) en lugar de una única etiqueta binaria. Por otro lado, su licencia CC BY-SA 4.0 y su formato ONNX lo hacen apto para prototipos, extensiones de navegador y análisis local sin enviar texto del usuario a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v2 con cabeza de clasificación/regresión de 7 salidas |
| Parametros totales | 17.868.807 (pesos safetensors del repositorio); la model card indica "aproximadamente 26M" para el modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como contexto nativo; longitud maxima de secuencia usada en entrenamiento: 192 tokens |
| Tipos de cuantizacion | FP32 (artefacto ONNX de referencia, ~69 MB). INT8 dinamico probado (~25 MB) y descartado por deriva inaceptable; FP16 no publicado por problemas de consistencia de tipos en ONNX |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (Transformers) y ONNX (onnx/model.onnx) |
| Pipeline | text-classification |
| Tokenizer | SentencePiece fast, con tokenizer.json incluido en el repositorio |
| Dimensiones de salida | 7 (insult, threat, obscene, identity_attack, sexual_explicit, targetedness, indirect_hostility) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v2 (variante small, en su version japonesa de izumi-lab) con una cabeza de clasificación que proyecta el estado del token [CLS] a 7 logits. La funcion de perdida declarada es BCE-with-logits sobre objetivos suaves continuos (soft targets), lo que convierte el problema en una regresion multi-etiqueta y multi-salida en lugar de una clasificacion discreta. El tokenizer es un SentencePiece fast con tokenizer.json estandar, una decision deliberada para que el modelo pueda ejecutarse en el navegador sin el preprocesado externo de MeCab + UniDic que usaba un prototipo anterior del mismo proyecto (Doku-Chiwawa).

Los datos de entrenamiento consisten en un corpus local de texto de redes sociales en japones, no distribuido en el repositorio. La supervision proviene de un pipeline de etiquetado automatico que genera siete dimensiones continuas; la propia model card aclara que estas etiquetas no son anotaciones humanas de referencia (gold standard). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni fases de RLHF o DPO (no aplicables en un encoder de clasificacion). La innovacion tecnica destacable es de despliegue: exportacion ONNX FP32 lista para navegador y un tokenizer sin dependencias externas.

## Capacidades

- Clasificacion multi-etiqueta con siete salidas continuas: insult (侮辱), threat (脅迫), obscene (卑俗・下品表现), identity_attack (属性集团への攻撃), sexual_explicit (露骨な性的表现), targetedness (対象指向性) e indirect_hostility (婉曲・間接的敵意).
- Puntuaciones calibradas por sigmoide en el rango 0.0-1.0, interpretables como intensidad estimada de cada dimension.
- Deteccion de hostilidad indirecta o encubierta (indirect_hostility), una dimension poco habitual en clasificadores de toxicidad.
- Deteccion de ataques a grupos identitarios (identity_attack), separada del insulto generico.
- Inferencia en navegador mediante ONNX / Transformers.js, con el modelo FP32 como artefacto soportado.
- Analisis local sin envio de texto a servidores externos, util para requisitos de privacidad.
- Analisis de texto seleccionado por el usuario y de publicaciones individuales de redes sociales.
- No soporta generacion de texto, tool calling, function calling, uso agentico, razonamiento multi-paso, vision ni audio.
- Multilingue: no, unicamente japones.

## Casos de uso

- Moderacion previa a la publicacion (pre-post checking): el modelo analiza el texto que un usuario esta a punto de enviar y devuelve siete puntuaciones que la interfaz puede agregar en avisos (por ejemplo, el maximo de insult, threat, identity_attack e indirect_hostility para el indicador "toxina" y el maximo de obscene y sexual_explicit para el indicador de contenido sexual). Al ejecutarse en ONNX FP32, puede hacerse en el cliente sin round-trip al servidor.
- Extension de navegador para analisis de texto seleccionado: una extension de Chrome puede cargar onnx/model.onnx con Transformers.js y puntuar el fragmento que el usuario seleccione, sin coste de inferencia en servidor ni envio de datos a terceros.
- Analisis de publicaciones en redes sociales a escala: procesamiento por lotes de posts japoneses para etiquetar y priorizar los que superen umbrales en insult, threat o identity_attack antes de una revision humana.
- Filtrado y curacion de corpus para entrenamiento de LLM: aplicar el modelo a datasets japoneses masivos para descartar o marcar documentos con alta puntuacion en obscene, sexual_explicit o identity_attack, reduciendo la presencia de contenido no deseado en el corpus final.
- Investigacion academica sobre hostilidad indirecta: la salida indirect_hostility permite estudiar formas de agresion encubierta (ironia, insinuacion, menosprecio velado) que los clasificadores binarios no separan.
- Soporte a equipos de Trust & Safety con umbrales configurables: usar targetedness como senal auxiliar para distinguir texto hostil dirigido a una persona concreta frente a hostilidad generica, y encaminar cada caso a un flujo de revision distinto.
- Prototipado rapido en aplicaciones de chat o foros: integrar el modelo en un servicio Python con transformers para obtener puntuaciones por mensaje y validar reglas de producto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de evaluacion son las metricas de regresion del propio modelo sobre su conjunto de test local (leidas de test_metrics.json), que se recogen a continuacion.

| Metrica global | Valor |
|---|---:|
| MAE medio | 0,051422 |
| RMSE medio | 0,089206 |
| Correlacion de Pearson media | 0,568901 |
| Correlacion de Spearman media | 0,605506 |

| Dimension | Japones | MAE | RMSE |
|---|---|---:|---:|
| insult | 侮辱 | 0,060970 | 0,106174 |
| threat | 脅迫 | 0,009144 | 0,027005 |
| obscene | 卑俗・下品表现 | 0,039123 | 0,074403 |
| identity_attack | 属性集团への攻撃 | 0,013566 | 0,045125 |
| sexual_explicit | 露骨な性的表现 | 0,051872 | 0,094074 |
| targetedness | 対象指向性 | 0,132556 | 0,183089 |
| indirect_hostility | 婉曲・間接的敵意 | 0,052722 | 0,094570 |

La model card senala que, si las etiquetas se interpretan en una escala original de 0 a 4, un MAE normalizado puede multiplicarse por 4 para una conversion aproximada de escala; el modelo desplegado emite siempre puntuaciones normalizadas 0-1 tras la sigmoide. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks de toxicidad estandar (por ejemplo, Jigsaw) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 17.868.807 parametros, los pesos en FP32 ocupan aproximadamente 71 MB y en FP16 aproximadamente 36 MB. El consumo real de memoria es bajo incluso con lotes de tamano moderado; no requiere GPU.
- GPU recomendadas: no aplica ninguna GPU de gama alta. Cualquier GPU consumer reciente (por ejemplo, RTX 3060, RTX 4090) es mas que suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, e incluso en CPU sin aceleracion dedicada.
- Opciones de despliegue: transformers (PyTorch, con AutoModelForSequenceClassification), ONNX Runtime, Transformers.js en navegador (artefacto onnx/model.onnx), y servicio gestionado compatible con Hugging Face Inference Endpoints (el repositorio lleva las etiquetas text-embeddings-inference y endpoints_compatible). No es necesaria una pila de alto rendimiento como vLLM o TGI para este tamano.
- Latencia y throughput estimados: no disponible.
- Limitacion de despliegue a tener en cuenta: el artefacto INT8 dinamico (~25 MB) no se recomienda por deriva de salida frente a FP32 en una comparacion de 500 ejemplos, y la conversion FP16 a ONNX no se publica por problemas de consistencia de tipos. FP32 es la referencia soportada.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks en la informacion proporcionada. La unica comparacion verificable es con el modelo base del que deriva.

| Modelo | Parametros | Contexto / max. secuencia | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kokuren/doku-chiwawa-ja-offensiveness-deberta-v2-small | 17.868.807 (safetensors); ~26M indicados para el base | 192 tokens en entrenamiento | MAE medio 0,051422; Spearman medio 0,605506 (test local) | CC BY-SA 4.0 | HuggingFace, safetensors + ONNX FP32 |
| izumi-lab/deberta-v2-small-japanese (modelo base) | ~26M segun la model card | no disponible | no disponible (no es un clasificador de ofensividad) | no disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de toxicidad o de ofensividad en japones | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor declara que el modelo no es una autoridad de moderacion, ni un sistema de diagnostico, ni un clasificador juridico, ni un sustituto de la revision humana. Las puntuaciones son estimaciones y pueden ser erroneas.
- La supervision procede de un pipeline de etiquetado automatico y el repositorio no afirma que sean anotaciones humanas de referencia. La calidad y los sesgos de ese pipeline se heredan en el modelo.
- Riesgo elevado de error en casos de ironia, citas, lenguaje reclamado por la propia comunidad, ficcion, dialecto, ortografia inusual y expresiones dependientes de contexto.
- La dimension targetedness es la peor estimada (MAE 0,132556 y RMSE 0,183089, muy por encima del resto), por lo que no conviene apoyar decisiones criticas en ella.
- Todas las dimensiones tienen correlaciones medias moderadas (Pearson medio 0,568901; Spearman medio 0,605506): el modelo ordena mejor de lo que calibra valores absolutos.
- Ventana de 192 tokens, con la seccion de manejo de texto largo de la model card truncada en la informacion disponible. El modelo base no es de contexto ilimitado, por lo que los textos largos deben trocearse (chunking) y agregarse, con el coste de perder contexto entre fragmentos.
- Solo japones. El texto en otros idiomas, o el japonés con romanizacion o code-switching, queda fuera del dominio previsto.
- Licencia CC BY-SA 4.0: es una licencia copyleft que permite uso comercial, pero obliga a mantener la misma licencia y a atribuir en las obras derivadas. Conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Artefactos cuantizados no soportados: se desaconseja el INT8 dinamico y no se publica FP16, lo que limita la reduccion de tamano en despliegues con restricciones de ancho de banda.
- Como clasificador, no genera texto libre, por lo que el riesgo tipico de alucinacion generativa no aplica; el riesgo equivalente es el de falsos positivos y falsos negativos en las puntuaciones.
- El modelo no aprende las agrupaciones en dos indicadores que muestra la interfaz de Doku-Chiwawa; son reglas de presentacion a nivel de aplicacion (maximo de insult, threat, identity_attack e indirect_hostility, y maximo de obscene y sexual_explicit).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kokuren/doku-chiwawa-ja-offensiveness-deberta-v2-small
- Modelo base: https://huggingface.co/izumi-lab/deberta-v2-small-japanese
- Artefacto ONNX para navegador (ruta dentro del repositorio): onnx/model.onnx
- Metricas de evaluacion (ruta dentro del repositorio): test_metrics.json
- La busqueda web realizada no devolvio enlaces relevantes al modelo (unicamente servicios de traduccion genericos: Google Translate, DeepL, Microsoft Translator). No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
