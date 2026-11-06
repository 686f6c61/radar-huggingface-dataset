# Einse57/semi-signals-detector-a

## Resumen

Detector A es un clasificador tabular basado en LightGBM que estima, segundo a segundo, la probabilidad de que se esté produciendo una crisis epileptica motora a partir unicamente del movimiento corporal captado en video. Lo desarrolla Einse57 como proyecto de investigacion independiente y se apoya en el metodo VSViG y en el dataset WU-SAHZU-EMU-Video publicados por Yankun Xu, Mohamad Sawan y colaboradores (ECCV 2024). No es un modelo neuronal: la parte de vision la resuelve RTMPose (extraccion de keypoints COCO-17 y 21 puntos por mano a 6 fps) y el aprendizaje se concentra en un LightGBM de 300 arboles y 15 hojas sobre 95 caracteristicas de movimiento disenadas a mano.

El modelo no procesa texto ni imagenes de forma generativa: recibe un vector de caracteristicas por segundo y devuelve una probabilidad. Su relevancia es acotada y muy especifica: demuestra que caracteristicas cinematicas causales (velocidades por region corporal, jerk, potencia ritmica en bandas de 0,5-1,5 Hz y 1,5-3 Hz, asimetria izquierda/derecha, visibilidad de keypoints) permiten detectar crisis con un clasificador ligero, sin necesidad de una red espaciotemporal profunda como la de VSViG.

La ficha debe leerse con la advertencia del propio autor: es material de investigacion, no un dispositivo medico, y no ha sido validado multicentro. Cualquier uso clinico, de monitorizacion o de alerta a personal queda explicitamente fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de arboles con boosting de gradiente (LightGBM), binario, sobre caracteristicas tabulares |
| Parametros totales | No disponible (300 arboles, 15 hojas por arbol; no se publica el numero de nodos ni de hojas totales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; ventana causal de 4 s y 10 s de video para calcular caracteristicas, con agregacion de 5 s de media movil |
| Tipos de cuantizacion | No disponible (modelo de arboles; se distribuye en `.txt` y `.json`, no en formatos de cuantizacion neuronal) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.txt` (modelo LightGBM) acompanado de `.json` con nombres y orden de columnas; `feature_spec.json` con la especificacion completa |

Variantes publicadas:

| Fichero | Variante | Caracteristicas | Umbral |
|---|---|---|---|
| `detector_a_all.txt` (+ `.json`) | Completa: cuerpo + manos + personas en plano | 95 | 0,95 |
| `detector_a_body.txt` (+ `.json`) | Solo cuerpo: articulaciones COCO-17, escala por bounding box de articulaciones | 91 | 0,95 |

## Arquitectura y entrenamiento

El pipeline tiene tres etapas. Primero, un detector de persona mas RTMPose (via `rtmlib`) extrae keypoints COCO-17 y 21 puntos por mano a 6 fps. Segundo, una vez por segundo se calculan caracteristicas causales usando solo datos anteriores al final de ese segundo, sobre ventanas de 4 s y 10 s: velocidades por region (cabeza, brazo izquierdo y derecho, mano y pierna, cuerpo completo) medidas en tamanos corporales por segundo, jerk, potencia ritmica en las bandas 0,5-1,5 Hz y 1,5-3 Hz, visibilidad de keypoints, asimetria izquierda/derecha, movimiento de dedos y numero de personas en el plano. Tercero, un LightGBM binario (300 arboles, 15 hojas) produce la probabilidad por segundo.

La regla de marcado es post-proceso, no parte del modelo: se toma la media movil de 5 s de la probabilidad, los segundos con valor igual o superior a 0,95 forman rachas, las rachas separadas por menos de 30 s se fusionan y una racha fusionada de al menos 3 s se reporta como segmento marcado.

El entrenamiento usa keypoints extraidos por el propio proyecto a partir del dataset WU-SAHZU-EMU-Video (14 pacientes en una unidad de monitorizacion de epilepsia, caras enmascaradas, etiquetas de inicio EEG y de inicio clinico en `Label.xlsx`). Se emplearon 35 de las 37 grabaciones: `pat04/no-Sz2P` se excluyo por prerregistro y `pat05/Sz4PG` no tiene fila en `Label.xlsx`. Las etiquetas por segundo son: ictal desde el inicio clinico hasta inicio clinico + 120 s; se excluyen del entrenamiento y del recuento de falsos positivos el intervalo entre inicio EEG e inicio clinico y todo lo posterior a inicio clinico + 120 s; el resto es no crisis. El desbalance se compensa con `scale_pos_weight` igual a la ratio entre segundos sin crisis y con crisis. No se reporta uso de RLHF ni de DPO (no aplica a este tipo de modelo).

## Capacidades

- Deteccion de crisis motoras por segundo a partir de movimiento corporal en video, con salida de probabilidad calibrada implicitamente por el umbral fijo de 0,95.
- Extraccion de caracteristicas cinematicas interpretables: velocidad por region corporal, jerk, potencia ritmica en dos bandas, asimetria, visibilidad y numero de personas.
- Explicabilidad mediante `pred_contrib` de LightGBM, que permite inspeccionar que caracteristicas empujan la puntuacion al alza o a la baja.
- Variante solo cuerpo aplicable a datos de esqueleto de otros rastreadores de pose, sin depender del detector de persona ni de las caracteristicas de manos.
- Procesamiento causal en tiempo real: cada segundo se puntua solo con informacion pasada, lo que permite integracion en un visor en vivo (semi-signals live viewer).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision generativa, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en deteccion de crisis basada en video: el modelo sirve como linea base ligera y reproducible frente a metodos espaciotemporales profundos como VSViG, con la ventaja de que el entrenamiento y la inferencia son baratos y las caracteristicas son auditables.
- Analisis de que patrones de movimiento discriminan crisis: usando `pred_contrib` se puede estudiar la contribucion de la potencia ritmica en 0,5-1,5 Hz, la asimetria o el jerk en segmentos concretos, lo que ayuda a formular hipotesis clinicas.
- Prototipado de visores en vivo en entornos de investigacion: al ser causal y muy ligero, puede ejecutarse junto a RTMPose en un equipo modesto y alimentar una interfaz que muestre la probabilidad por segundo.
- Evaluacion comparativa de rastreadores de pose: la variante body-only permite probar si un esqueleto externo (por ejemplo, de otro tracker) conserva senal suficiente, aunque el propio autor reporta que en MCEC no transfirio bien.
- Docencia y reproduccion de pipelines de vision aplicada a senales fisiologicas: el repositorio separa extraccion de pose, calculo de caracteristicas y clasificador, lo que facilita usar el proyecto como material didactico.
- Estudio de reglas de marcado y umbrales: la regla de media movil de 5 s, umbral 0,95, fusion de rachas a menos de 30 s y minimo de 3 s puede reutilizarse o compararse en experimentos de deteccion de eventos.
- Filtrado previo en anotacion offline de grabaciones de investigacion: para priorizar segmentos que un revisor humano examinara despues, siempre fuera de cualquier flujo clinico.

## Benchmarks y rendimiento

Evaluacion con validacion leave-one-patient-out anidada sobre VSViG (14 pacientes, 33 crisis, 3,73 horas sin crisis). El umbral se eligio solo en folds internos; el objetivo prerregistrado de como maximo 1 falso positivo por hora nunca se alcanzo en los folds internos, por lo que se uso el umbral de reserva de 0,95 en todos los folds. Una crisis cuenta como detectada si un segmento marcado solapa con [inicio clinico - 30 s, min(inicio clinico + 120 s, fin de grabacion) + 60 s].

| Medida | Detector A completo | Solo cuerpo |
|---|---|---|
| Crisis detectadas | 29/33 (Wilson 95%: 0,73-0,95) | 29/33 (0,73-0,95) |
| Falsos positivos | 16 en 3,73 h = 4,3/h (Poisson 95%: 2,5-7,0) | 14 = 3,75/h (Poisson 95%: 2,5-7,0, segun el dato truncado disponible) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de texto, que no aplican a este modelo. Tampoco se dispone de resultados comparativos directos con VSViG en esta ficha: el autor remite al paper de VSViG para sus cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al ser un LightGBM de 300 arboles y 15 hojas, el modelo ocupa del orden de kilobytes a pocos megabytes, muy por debajo de cualquier modelo neuronal. El coste real esta en RTMPose y el detector de persona.
- GPU recomendadas: no disponible en la informacion proporcionada. La inferencia del clasificador puede ejecutarse en CPU; RTMPose se acelera con GPU, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: si, el clasificador en cualquier GPU o incluso sin GPU; el cuello de botella es la extraccion de pose.
- Opciones de despliegue: libreria LightGBM nativa cargando `detector_a_all.txt` o `detector_a_body.txt` junto con el `.json` de nombres y orden de columnas; el proyecto de referencia es `Einse57/semi-signals` en GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de arboles.
- Latencia y throughput: no disponibles. El muestreo de pose es de 6 fps y la puntuacion se calcula una vez por segundo, lo que sugiere un coste por segundo de video dominado por la pose.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Detector A (este modelo) | LightGBM sobre caracteristicas de pose | 300 arboles, 15 hojas | Ventanas causales de 4 s y 10 s, media movil de 5 s | 29/33 crisis, 4,3 falsos positivos/h (LOPO VSViG) | MIT | Pesos `.txt` en Hugging Face |
| VSViG (Xu et al., ECCV 2024) | Red espaciotemporal sobre esqueletos (ViG) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha; consultar el paper | Apache-2.0 (codigo y dataset) | Codigo en GitHub `xuyankun/VSViG`; pesos no verificados en esta ficha |
| Alternativas comerciales de deteccion de crisis por video | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa con VSViG ni con otros sistemas; la comparacion anterior se limita a tipo de modelo, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un dispositivo medico. El autor prohibe explicitamente su uso para diagnostico, toma de decisiones clinicas, monitorizacion de pacientes o alerta a personal.
- Entrenado con datos de un unico hospital (14 pacientes, 35 grabaciones) y sin validacion multicentro; la generalizacion a otras camaras, habitaciones, poblaciones o protocolos es desconocida.
- Los resultados LOPO muestran 4,3 falsos positivos por hora, muy por encima del objetivo prerregistrado de 1 por hora; el umbral de 0,95 es una solucion de reserva, no un umbral validado.
- Las cifras de VSViG no son estrictamente held-out: ambos ficheros se ajustaron sobre los 14 pacientes, y los numeros reportados provienen de reentrenamiento leave-one-patient-out.
- La variante body-only no transfirio bien en MCEC, segun el propio autor; no debe asumirse equivalencia con la variante completa.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si hay riesgo de falsos positivos y falsos negativos con consecuencias si se usa fuera de investigacion.
- Sesgos conocidos: no documentados. Es plausible que el rendimiento dependa de la calidad de la pose, la oclusion, el numero de personas en el plano y las condiciones de iluminacion, pero no se aportan mediciones.
- Restricciones de licencia: MIT para los pesos; el dataset subyacente es Apache-2.0 y debe respetarse su atribucion. No se redistribuyen videos, imagenes ni keypoints.
- Uso sobre personas que no han consentido ser grabadas queda fuera de alcance.
- El repositorio no incluye datos ni el modelo de VSViG; cualquier reutilizacion debe citar el trabajo original de Xu, Sawan y colaboradores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Einse57/semi-signals-detector-a
- Repositorio del proyecto: https://github.com/Einse57/semi-signals
- Dataset WU-SAHZU-EMU-Video: https://huggingface.co/datasets/xuyankun/WU-SAHZU-EMU-Video
- Codigo de VSViG: https://github.com/xuyankun/VSViG
- Paper VSViG (arXiv 2303.07399): https://arxiv.org/abs/2303.07399
- RTMPose / rtmlib: https://github.com/Tau-J/rtmlib
