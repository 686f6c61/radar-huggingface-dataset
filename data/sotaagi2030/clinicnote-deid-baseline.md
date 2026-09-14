# SOTAagi2030/ClinicNote-DeID-Baseline

## Resumen

ClinicNote-DeID-Baseline es un checkpoint de clasificación de tokens (token classification) publicado por el usuario SOTAagi2030 en HuggingFace, orientado a la desidentificación de notas clínicas ambulatorias. El modelo se distribuye como un baseline para eliminar identificadores directos (nombres, fechas, números de historia, etc.) de texto sanitario, siguiendo el enfoque clasico de etiquetado BIO sobre secuencias. La model card lo describe explicitamente como un "baseline" y limita su uso a investigacion y prototipado de pipelines con texto sintetico o debidamente gobernado.

El repositorio es minimo: incluye `model.safetensors`, `config.json`, `tokenizer.json` y un ejemplo de redaccion en `assets/redaction-example.txt`. No se publican detalles sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni los valores de las metricas obtenidas; unicamente se indica que el candidato seleccionado se eligio por F1 en un split de validacion de notas clinicas sinteticas reservado.

Su relevancia actual es limitada pero concreta: sirve como punto de partida reproducible para equipos que necesitan montar un pipeline de de-identificacion sobre texto clinico en ingles y comparar sus propios modelos contra una referencia publica con licencia Apache 2.0. No es un modelo generativo ni un asistente conversacional: es un extractor de entidades entrenado para una tarea acotada de privacidad de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (segun el tag `bert` del repositorio); detalle de capas y configuracion no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `safetensors`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), acompanado de `config.json` y `tokenizer.json` |

Otros datos del repositorio: pipeline `token-classification`, libreria `transformers`, tamano del repo 0.0 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-14 y actualizado el 2026-09-14.

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de clasificacion de tokens basado en un encoder de la familia BERT, con cabecera de etiquetado por token para reconocimiento de entidades (NER) orientado a identificadores directos en notas clinicas. El pipeline declarado en HuggingFace es `token-classification` y la tarea declarada es `de-identification`. No se especifica el numero de capas, la dimension oculta, el numero de cabezas de atencion, el vocabulario del tokenizer ni si se partio de un checkpoint preentrenado concreto (por ejemplo, un BERT-base generico o un modelo clinico tipo Bio_ClinicalBERT).

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el esquema de etiquetas utilizado, ni si se aplicaron tecnicas de ajuste adicionales como RLHF, DPO o destilacion. Lo unico documentado es que el candidato final se selecciono maximizando F1 sobre un split de validacion de notas clinicas sinteticas reservado, sin publicar el valor numerico de esa metrica ni el conjunto de etiquetas evaluadas.

## Capacidades

- Etiquetado de tokens para desidentificacion: el modelo asigna etiquetas a nivel de token, lo que permite localizar y marcar identificadores directos en texto clinico.
- Procesamiento de notas clinicas ambulatorias: la model card indica que el baseline se desarrollo sobre notas ambulatorias sinteticas, por lo que el dominio objetivo son informes de consulta externa.
- Salida compatible con pipelines de redaccion: el repositorio incluye un ejemplo de redaccion (`assets/redaction-example.txt`), lo que sugiere un flujo de deteccion seguido de sustitucion o eliminacion de los fragmentos identificados.
- Uso en modo inferencia con `transformers`: integrable mediante `pipeline("token-classification")` o `AutoModelForTokenClassification`.
- Idioma: unicamente ingles. No hay soporte multilingue declarado.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es un modelo discriminativo, no generativo.
- No se declara capacidad de generacion de texto, codigo ni matematicas.

## Casos de uso

- Construccion de corpus de investigacion anonimizados: el modelo se puede ejecutar sobre notas clinicas en ingles para detectar identificadores directos antes de compartir un dataset con terceros, reduciendo el trabajo manual de revision previo a la auditoria.
- Preanotacion en flujos de etiquetado humano: sirve como primer paso automatico en una herramienta de anotacion tipo Label Studio o Prodigy, de modo que los anotadores solo corrigen los tramos marcados por el modelo en lugar de revisar el documento completo.
- Prototipado rapido de pipelines de privacidad: dado que es un baseline ligero y con licencia Apache 2.0, permite validar la arquitectura de un sistema de redaccion (deteccion, sustitucion, registro de auditoria) antes de invertir en un modelo propio ajustado.
- Evaluacion comparativa interna: equipos que entrenan sus propios modelos de de-identificacion pueden usarlo como referencia de partida para medir si su ajuste fino aporta mejoras reales sobre un baseline publico.
- Filtrado previo en procesos ETL de datos sanitarios: integrado como etapa de preprocesamiento, puede marcar registros con alta densidad de identificadores para enviarlos a revision manual antes de persistirlos en un data lake.
- Docencia y experimentacion reproducible: al ser un checkpoint pequeno y con dependencias estandar de `transformers`, es adecuado para practicas sobre NER, esquemas de etiquetado y evaluacion de privacidad en cursos de PLN clinico.
- Generacion de datos sinteticos con control de fuga: al aplicarse sobre texto sintetico, permite verificar que las notas generadas no contienen identificadores residuales antes de usarlas en experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la seleccion del candidato se hizo maximizando F1 sobre un split de validacion de notas clinicas sinteticas reservado, pero no incluye el valor de F1, la matriz de confusion, el desglose por tipo de entidad ni comparaciones con otros sistemas. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de tareas estandar de NER clinico como i2b2/2014 o MIMIC-III.

## Requisitos de hardware

- Parametros totales: no disponibles, por lo que no se puede calcular un requisito de VRAM exacto. Si el checkpoint corresponde a un encoder tipo BERT-base (aproximadamente 110 millones de parametros, valor no confirmado en la informacion proporcionada), la inferencia en FP32 ocuparia del orden de 0,4-0,5 GB de VRAM unicamente para los pesos, mas el consumo del runtime.
- Cabe en GPU de consumo: con alta probabilidad si se confirma el orden de magnitud de un encoder tipo BERT-base; seria ejecutable en GPUs de 8 GB o menos (por ejemplo, RTX 3060, RTX 4060, RTX 2070) e incluso en CPU para volumenes moderados de documentos.
- GPUs de datacenter: no requiere aceleradores de gama alta como A100 o H100 para inferencia; serian utiles unicamente para procesar grandes volumenes en lote o para reentrenamiento.
- Opciones de despliegue: al ser un modelo `transformers` con pesos `safetensors`, es compatible con `transformers` (pipeline de token-classification), TorchServe o FastAPI con `transformers` como backend. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que no hay conversiones GGUF/ONNX publicadas en el repositorio.
- Latencia y throughput: no disponibles. Dependen del hardware y del tamano real del modelo, que no se ha publicado.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa, ya que no se conocen los parametros, el contexto ni los resultados de evaluacion de este checkpoint. A continuacion se indican alternativas de la misma categoria (desidentificacion de texto clinico en ingles) sobre las que habria que recabar informacion antes de comparar:

| Modelo | Categoria | Parametros | Licencia | Estado de la comparacion |
|---|---|---|---|---|
| SOTAagi2030/ClinicNote-DeID-Baseline | Token classification para de-identificacion | no disponible | apache-2.0 | Modelo de referencia de esta ficha |
| Modelos tipo Bio_ClinicalBERT ajustados a NER clinico | Encoder BERT + cabecera NER | aproximadamente 110 M (tipico) | habitualmente MIT o Apache 2.0 | No disponible la comparacion numerica: este repositorio no publica metricas |
| Modelos tipo DeBERTa/PubMEDBERT ajustados a i2b2 | Encoder + cabecera NER | no disponible para este caso | variable | No disponible |

En resumen: no disponible una comparativa cuantitativa fiable porque el autor no publica parametros, contexto ni resultados de evaluacion.

## Limitaciones y advertencias

- La propia model card restringe el uso a investigacion y prototipado con texto sintetico o debidamente gobernado, y exige revisar todas las salidas antes de cualquier uso posterior.
- No hay ninguna garantia de que el modelo funcione sobre notas clinicas reales: el desarrollo declarado se hizo sobre notas ambulatorias sinteticas, por lo que la generalizacion a datos de produccion es desconocida.
- Idiomas: solo ingles. No hay soporte para castellano ni otras lenguas, lo que limita su aplicacion directa en sistemas sanitarios hispanohablantes.
- Riesgo de fuga de identificadores: en tareas de privacidad, un falso negativo implica exponer datos personales. No se publican tasas de recall ni de precision, por lo que no es posible estimar ese riesgo a partir de la informacion disponible.
- Riesgo de sobre-redaccion: los falsos positivos pueden eliminar informacion clinicamente relevante y degradar la utilidad del documento resultante.
- Sin datos de sesgo: no hay informacion sobre el comportamiento diferencial por tipo de nombre, origen etnico, genero o variantes ortograficas.
- Sin informacion sobre alucinacion en sentido generativo, ya que el modelo no genera texto libre; el riesgo analogo es la asignacion erronea de etiquetas.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia y atribucion, pero la model card del autor anade una recomendacion de uso restringido a investigacion y prototipado que conviene respetar como expectativa del publicador.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin paper asociado, sin resultados de evaluacion publicados y con un tamano de repo reportado de 0.0 GB. La ausencia de validacion externa es un riesgo de adopcion relevante.
- Para cualquier uso en produccion sobre datos personales reales seria necesario cumplir con la normativa aplicable (RGPD en la Union Europea, HIPAA en Estados Unidos) y someter el sistema a evaluacion independiente, auditoria y supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SOTAagi2030/ClinicNote-DeID-Baseline
- Ejemplo de redaccion incluido en el repositorio: https://huggingface.co/SOTAagi2030/ClinicNote-DeID-Baseline/blob/main/assets/redaction-example.txt
- Pesos del modelo: https://huggingface.co/SOTAagi2030/ClinicNote-DeID-Baseline/blob/main/model.safetensors
- Configuracion: https://huggingface.co/SOTAagi2030/ClinicNote-DeID-Baseline/blob/main/config.json
- Tokenizer: https://huggingface.co/SOTAagi2030/ClinicNote-DeID-Baseline/blob/main/tokenizer.json
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
