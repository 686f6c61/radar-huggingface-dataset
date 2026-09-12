# NAMAA-Space/araseg-e11-xlmr-nopnx-pa-w2

## Resumen

`NAMAA-Space/araseg-e11-xlmr-nopnx-pa-w2` es un modelo de clasificacion de tokens para segmentacion de texto arabe, desarrollado por NAMAA Community (organizacion NAMAA-Space) para la tarea compartida Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026), en la subtarea NoPnx-PA. Se trata de un ajuste fino completo (full fine-tune) de `FacebookAI/xlm-roberta-large`, del que hereda la arquitectura encoder y la licencia MIT, y cuya salida son probabilidades de frontera de palabra por token.

El modelo no es un segmentador autonomo: es uno de los ocho miembros que componen el sistema NoPnx-PA de NAMAA, combinados mediante un decodificador estructural MEMM ajustado con predicciones out-of-fold (OOF). Es la variante con peso de clase 2 (peso de decodificador -0.0080) y el sistema completo alcanza 87,82 de macro-F1 en el practice test y 89,9 en el conjunto ciego.

Su relevancia practica es doble: por un lado, documenta una estrategia de ensamblado con decodificador estructural para una tarea clasica de preprocesado del arabe; por otro, sirve como material reproducible para investigadores que quieran auditar o reutilizar el sistema completo. Usado de forma aislada no reproduce ninguna puntuacion publicada, ya que las probabilidades que emite no estan calibradas y el umbral (0,46) reside en el combinador, no en este miembro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large, heredada de `FacebookAI/xlm-roberta-large`) con cabeza de clasificacion de tokens para fronteras de palabra |
| Parametros totales | Aproximadamente 560M por la arquitectura del modelo base; el autor indica "560M" en la fila de entrenamiento sin desambiguar si se refiere a parametros o a tokens |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens, heredada de XLM-R large (no se explicita en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible; los pesos se publican como `state_dict` de PyTorch sin variantes cuantizadas |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_NoPnx_PA.pt`); no es un checkpoint en formato HuggingFace y `from_pretrained` no funciona |

Otros datos relevantes: tamano del repositorio 2,2 GB; pipeline declarado `token-classification`; identificadores de tarea `araseg-2026`, `arabicnlp2026`; fecha de creacion 2026-09-12.

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large (encoder transformer multilingue) con una cabeza de clasificacion de tokens anadida para la tarea, ajustada mediante full fine-tune sobre el checkpoint base `FacebookAI/xlm-roberta-large`. El entrenamiento indicado es de 560M con ajuste completo; la model card no aclara si esa cifra corresponde a tokens de entrenamiento o al numero de parametros actualizados (el modelo base tiene aproximadamente 560M parametros, lo que hace la cifra ambigua). No se documentan en la informacion disponible la composicion del dataset, el uso de RLHF/DPO ni tecnicas de regularizacion, lo cual es coherente con una tarea discriminativa de etiquetado y no generativa.

La innovacion tecnica del sistema no reside en el miembro individual, sino en el combinador: un decodificador estructural MEMM ajustado con predicciones OOF sobre ocho miembros, con umbral de sistema fijado en 0,46. Este miembro concreto es la variante de peso de clase 2, con peso de decodificador -0,0080. Los pesos publicados son un `state_dict` puro generado por el experimento, por lo que la arquitectura debe reconstruirse a partir del YAML de configuracion del repositorio de codigo antes de cargar el fichero. Cinco de los miembros del sistema son LoRA y requieren `transformers==5.12.1`; la pila completa esta fijada en `requirements-llm.txt`.

## Capacidades

- Segmentacion de texto arabe mediante clasificacion a nivel de token: emite probabilidades de frontera de palabra no calibradas.
- Deteccion de fronteras de palabra en texto arabe sin normalizar, como parte de un pipeline de preprocesado.
- Integracion como votante dentro de un ensemble combinado por un decodificador estructural MEMM.
- No es un modelo generativo: no produce texto, no razona de forma explicita, no genera codigo ni resuelve matematicas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio.
- Cobertura multilingue limitada al arabe (`ar`); no se documenta soporte de otras lenguas ni de variedades dialectales.
- Capacidad especial: forma parte de un sistema que alcanza 87,82 / 89,9 de macro-F1 (practice test / ciego), pero el miembro aislado no reproduce esa cifra.

## Casos de uso

- Preprocesado en pipelines de NLP arabe: situado antes de etapas de etiquetado POS, NER o analisis sintactico, corrige fronteras de palabra para que los tokenizadores posteriores trabajen sobre unidades correctas.
- Limpieza y normalizacion de corpus arabes: detecta palabras fusionadas o separadas de forma incorrecta en texto procedente de OCR, scraping o transcripciones, un problema frecuente en corpus arabes de gran escala.
- Reproduccion de resultados de investigacion: permite reconstruir el sistema NAMAA NoPnx-PA de AraSeg 2026 cargando el `state_dict` y el YAML de configuracion, util para auditar el ensemble miembro a miembro.
- Anotacion asistida de corpus: genera un pre-etiquetado probabilistico que los anotadores humanos revisan, reduciendo el coste de crear corpus de segmentacion anotados manualmente.
- Indexacion y busqueda en corpus arabes: al corregir fronteras de palabra antes de indexar, mejora la coincidencia de terminos en motores de busqueda internos o sistemas de recuperacion documental.
- Pipelines de voz para arabe: segmentacion de transcripciones ASR antes de alinearlas con audio o de alimentar un sistema TTS, donde las fronteras erroneas degradan la prosodia.
- Analisis de texto de redes sociales: separacion de palabras pegadas a signos de puntuacion, menciones o hashtags en texto arabe informal.
- Estudio de decodificadores estructurales: al ser un miembro documentado de un MEMM ajustado con OOF, sirve como caso de referencia para investigar combinacion de modelos en tareas de etiquetado secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks por miembro en la informacion disponible. Los unicos datos numericos facilitados corresponden al sistema completo (NoPnx-PA, ocho miembros), no a este modelo de forma aislada:

| Metrica | Conjunto | Resultado | Ambito |
|---|---|---|---|
| macro-F1 | Practice test | 87,82 | Sistema completo NoPnx-PA |
| macro-F1 | Blind | 89,9 | Sistema completo NoPnx-PA |

No hay resultados de MMLU, HumanEval, GSM8K ni de otras suites generativas, que ademas no aplican a un modelo discriminativo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 2,2-3 GB (el repositorio ocupa 2,2 GB); en fp16 o bf16, aproximadamente 1,2-2 GB con lotes pequenos; el consumo adicional depende de la longitud de las secuencias hasta 512 tokens.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. No requiere A100 ni H100; una RTX 3060, RTX 4060, RTX 4070 o RTX 4090 es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente toda la gama consumer actual y en muchas GPUs de portatil con 4-6 GB de VRAM. Tambien es viable en CPU para inferencia por lotes fuera de linea.
- Opciones de despliegue: no es adecuado para vLLM, Ollama o TGI, orientados a modelos generativos. El despliegue natural es `transformers` con PyTorch, o exportacion a ONNX Runtime / TorchScript, servido con FastAPI, TorchServe o similar. Requiere reconstruir la arquitectura desde el YAML de configuracion del repositorio antes de cargar el `state_dict`; `from_pretrained` no funciona.
- Latencia y throughput: no disponibles. Al ser un encoder de 24 capas sobre secuencias de hasta 512 tokens, la latencia por lote es del orden de milisegundos a decenas de milisegundos en GPU moderna, pero no hay cifras publicadas que confirmen este extremo.
- Restriccion de dependencias: los miembros LoRA del sistema requieren `transformers==5.12.1`; la pila completa esta fijada en `requirements-llm.txt` del repositorio de codigo.

## Comparativa con modelos similares

No hay datos de rendimiento individual publicados para este miembro, por lo que la comparacion con otros segmentadores arabes publicos (por ejemplo variantes basadas en AraBERT o CAMeL-BERT) queda como no disponible en la informacion proporcionada. La comparacion posible se limita al propio ecosistema del sistema:

| Modelo | Parametros | Contexto | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e11-xlmr-nopnx-pa-w2` (este miembro) | ~560M | 512 | No reportado individualmente | MIT | HuggingFace, como `state_dict` de PyTorch |
| Sistema completo NAMAA NoPnx-PA (8 miembros) | 8 x ~560M | 512 | 87,82 (practice test) / 89,9 (ciego) | No disponible | Coleccion de HuggingFace y repositorio de codigo |
| `FacebookAI/xlm-roberta-large` (modelo base) | ~560M | 512 | No aplica (no es un segmentador) | MIT | HuggingFace |
| Otros miembros del ensemble | No disponible | No disponible | No disponible | No disponible | Coleccion NAMAA |

## Limitaciones y advertencias

- No es un segmentador autonomo. Emite probabilidades de frontera no calibradas y, usado solo, no reproduce ninguna puntuacion publicada. El umbral de 0,46 pertenece al combinador del sistema, no a este modelo.
- `from_pretrained` no funciona: los pesos son un `state_dict` de PyTorch y la arquitectura debe construirse previamente desde el YAML de configuracion del experimento. Esto complica su adopcion por parte de terceros sin acceso al repositorio de codigo.
- Dependencias fragiles: cinco miembros del sistema exigen `transformers==5.12.1`; conviene fijar la pila completa con `requirements-llm.txt` para evitar incompatibilidades.
- Cobertura linguistica reducida al arabe. No se documenta rendimiento por dialecto, registro ni por tipo de texto (MSA frente a dialectal, texto formal frente a redes sociales).
- Ausencia de evaluacion publicada por miembro: no hay macro-F1, precision, recall ni analisis de errores individuales, lo que impide estimar su contribucion marginal dentro del ensemble.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de fronteras de palabra incorrectas en texto ruidoso, sin normalizar o con code-switching.
- Sesgos: no documentados. Al derivar de XLM-RoBERTa large, puede heredar sesgos de representacion del preentrenamiento del modelo base, aunque la tarea sea puramente estructural.
- Licencia MIT, heredada del modelo base: permite uso comercial y modificacion con atribucion. Conviene verificar los terminos del checkpoint `FacebookAI/xlm-roberta-large` del que deriva.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, creado el 2026-09-12. No hay validacion independiente por parte de la comunidad.
- Repositorio de 2,2 GB: hay que prever espacio y ancho de banda para la descarga del checkpoint completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e11-xlmr-nopnx-pa-w2
- Coleccion del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo (configs, `ensemble.py`, `verify_offcluster.py`, `requirements-llm.txt`): https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026 (BibTeX incluido en la model card).
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo; los enlaces obtenidos correspondian a dominios corporativos sin relacion con el proyecto.
