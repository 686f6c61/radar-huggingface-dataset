# achanu/mednli_laya

## Resumen

mednli_laya es un modelo de clasificación de texto obtenido por ajuste fino del checkpoint base `convaiinnovations/laya` sobre el conjunto de datos MedNLI (`presencesw/mednli`). Su tarea es la verificación de afirmaciones clínicas en tres clases: dada una afirmación y un fragmento de evidencia, el modelo decide si la evidencia la respalda (`supported`), no dice lo suficiente para confirmarla ni negarla (`unsupported`) o afirma lo contrario (`contradicted`). El ajuste lo firma Pavan Kumar Mantha y el modelo se distribuye con licencia Apache 2.0.

El modelo cuenta con 321.908.998 parámetros y un repositorio de 0,7 GB en formato safetensors. La librería de referencia es `laya`, que expone una API de preguntas y respuestas estructuradas (`agent.predict`) en lugar de una llamada clásica a `transformers`; el modelo se invoca con un diccionario de estado (`claim` y `evidence`) y un esquema de pregunta con criterios por etiqueta. Está entrenado y evaluado únicamente en inglés.

Su relevancia es doble: por un lado, ofrece una mejora sustancial frente al checkpoint original en MedNLI (exactitud de 0,7904 frente a 0,4494, con un McNemar exacto de p = 1,8e-85); por otro, la model card documenta con detalle inusual la calibración, la robustez al orden de opciones y el sesgo de artefactos del dataset, lo que facilita una evaluación realista antes de integrarlo en un pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `convaiinnovations/laya`; no se detalla en la informacion proporcionada) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de inferencia | laya |
| Pipeline | text-classification |
| Modelo base | convaiinnovations/laya (checkpoint multilingual) |
| Dataset de ajuste | presencesw/mednli (MedNLI) |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint base `convaiinnovations/laya`; solo se indica que el modelo resultante tiene 321,9 millones de parametros y que se carga mediante la libreria `laya`, que formula la tarea como una eleccion entre opciones con criterios textuales. El ajuste fino se realizo sobre MedNLI con 10.819 ejemplos de entrenamiento, 401 de calibracion y 1.395 de validacion; se descartaron 9 filas por etiquetas contradictorias y 3 por duplicados, y se conservaron los marcadores de desidentificacion del corpus original.

El entrenamiento uso entropia cruzada sobre etiquetas duras, con el orden de las opciones barajado y cuatro formulaciones de pregunta rotativas, lote efectivo de 64, tasas de aprendizaje de 2,5e-05 para el encoder y 1e-04 para la cabeza, sin label smoothing y semilla 0. Se aplico un aumento de datos con evidencia no emparejada en el 15 % de las filas por epoca. La mejor epoca fue la 2 de 6 (exactitud de validacion 0,8075, macro-F1 0,8074, NLL 0,4914); a partir de ahi el modelo sobreajusta (epoca 4: exactitud 0,7753, NLL 0,8555). La temperatura de eleccion se ajusto a 1,256 sobre 1.604 items de calibracion separados por premisa, lo que redujo la NLL de 0,4458 a 0,433 en ese subconjunto.

## Capacidades

- Verificacion de afirmaciones clinicas en tres clases (`supported`, `unsupported`, `contradicted`) a partir de una afirmacion y una evidencia.
- Clasificacion de texto con salida de etiqueta y confianza calibrada (ECE de 0,0424 en el split de test).
- Formulacion de la tarea mediante preguntas estructuradas con criterios por etiqueta, en lugar de prompt libre.
- Robustez al orden de las opciones: tasa de cambio de 0,0155 al invertir el orden de las opciones.
- Deteccion de evidencia no emparejada: responde `unsupported` en el 73,98 % de los casos con evidencia de premisa no relacionada.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; el modelo es un clasificador de eleccion, no un generador.

## Casos de uso

- Verificacion de notas clinicas frente a resumenes automaticos: dado un resumen generado y la nota original como evidencia, el modelo marca si el resumen esta respaldado, es incompleto o contradice el texto fuente. Su calibracion (ECE de 0,0424) permite fijar umbrales de confianza para revision humana.
- Control de calidad de datasets medicos: filtrar pares afirmacion-evidencia extraidos de literatura o notas para descartar contradicciones antes de usarlos en el entrenamiento de otros modelos.
- Asistencia a la codificacion clinica: comprobar si una afirmacion codificada (por ejemplo, un diagnostico) esta respaldada por el texto de la historia clinica, derivando los casos dudosos a revision.
- Auditoria de respuestas de sistemas de preguntas y respuestas medicas: usar el modelo como verificador de las citas que un sistema RAG devuelve junto a cada respuesta, etiquetando como `contradicted` o `unsupported` las citas que no sostienen la afirmacion.
- Deteccion de inconsistencias en historiales: comparar afirmaciones de distintas secciones de la nota (motivo de consulta, exploracion, laboratorio) y senalar contradicciones para el clinico.
- Evaluacion de robustez de pipelines NLI: el modelo sirve como referencia con metricas de calibracion, sesgo de orden de opciones y sensibilidad a evidencia no emparejada, utiles para comparar variantes de un sistema de verificacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (MedNLI test, n = 1422, azar 0,3333):

| Modelo | Accuracy (IC 95 %) | Macro-F1 | NLL | Brier | ECE | Confianza media | ms/decision |
|---|---|---|---|---|---|---|---|
| original | 0,4494 (0,4226-0,4761) | 0,4156 | 1,3686 | 0,7485 | 0,2610 | 0,7103 | 0,84 |
| este modelo | 0,7904 (0,7693-0,8129) | 0,7909 | 0,5039 | 0,2863 | 0,0424 | 0,8261 | 0,92 |

Pruebas de robustez:

| Modelo | Tasa de cambio por orden de opciones | Accuracy solo con afirmacion (IC 95 %) | Evidencia no emparejada respondida como `unsupported` | Accuracy con formulacion de entrenamiento |
|---|---|---|---|---|
| original | 0,0816 | 0,3361 (0,3101-0,3608) | 0,8509 | 0,4142 |
| este modelo | 0,0155 | 0,4114 (0,3861-0,4367) | 0,7398 | 0,7996 |

Resultados por clase (este modelo):

| Etiqueta | Precision | Recall | F1 |
|---|---|---|---|
| supported | 0,7810 | 0,7300 | 0,7546 |
| unsupported | 0,7215 | 0,7869 | 0,7528 |
| contradicted | 0,8766 | 0,8544 | 0,8654 |

Matriz de confusion (filas: etiqueta real; columnas: prediccion):

| | supported | unsupported | contradicted |
|---|---|---|---|
| supported | 346 | 98 | 30 |
| unsupported | 74 | 373 | 27 |
| contradicted | 23 | 46 | 405 |

Significacion: test exacto de McNemar frente al modelo original sobre los mismos items; este modelo corrige 581 errores e introduce 96 (p = 1,8e-85). Varianza entre semillas (2 semillas): accuracy 0,7904 +/- 0,0000, macro-F1 0,7911 +/- 0,0001, ECE 0,0367 +/- 0,0057.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 321,9 millones de parametros, en fp16 el peso ronda los 0,64 GB y en fp32 los 1,29 GB, pero no se confirma el soporte de estas precisiones ni de cuantizacion.
- GPU recomendadas: no disponible. El modelo es pequeno para los estandares actuales y cabria en GPU de consumo, pero no se documenta compatibilidad con CUDA ni con GPUs concretas.
- Cabe en GPU de consumo: previsiblemente si por tamano, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: la model card solo documenta la libreria `laya` (`laya.load` y `agent.predict`). No se confirma soporte de vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: la model card reporta 0,92 ms por decision en el entorno de evaluacion del autor; no se especifica el hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy MedNLI test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| achanu/mednli_laya | 321,9 M | no disponible | 0,7904 | apache-2.0 | Hugging Face |
| convaiinnovations/laya (original, sin ajuste) | no disponible | no disponible | 0,4494 | no disponible | Hugging Face |
| Otros modelos NLI medicos | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el checkpoint base sin ajustar. No se han publicado en la informacion disponible comparaciones con otros modelos de verificacion de afirmaciones medicas.

## Limitaciones y advertencias

- Entrenado con frases cortas de notas clinicas; la exactitud en pasajes largos de guias clinicas no se ha evaluado.
- Solo ingles; el resto de tipos de pregunta de Laya no se reevaluaron tras el ajuste fino.
- Los resultados se limitan a MedNLI; no se ha ejecutado ningun benchmark fuera de dominio.
- No es un dispositivo medico y no debe usarse para decisiones clinicas.
- Sesgo de artefactos del dataset: con la evidencia en blanco, el modelo acierta el 41,14 %, muy por encima del azar (33,33 %), lo que indica que puede explotar senales de la propia afirmacion.
- La tasa de `unsupported` ante evidencia no emparejada (73,98 %) es inferior a la del modelo original (85,09 %): es mas propenso a aceptar evidencia irrelevante como suficiente.
- La calibracion se ajusto sobre un conjunto de calibracion especifico; puede degradarse en distribuciones distintas.
- El ajuste se detuvo en la epoca 2 de 6 por sobreajuste posterior; entrenamientos con otras semillas o hiperparametros pueden variar.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza medica del dominio exige validacion propia antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/achanu/mednli_laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset MedNLI: https://huggingface.co/datasets/presencesw/mednli
