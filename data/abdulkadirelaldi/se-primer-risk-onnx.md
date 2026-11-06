# abdulkadirelaldi/se-primer-risk-onnx

## Resumen

SE Primer risk ONNX es un clasificador tabular binario exportado a ONNX que estima la probabilidad de que un jugador elija la opción arriesgada (opción B) en un juego-kitap educativo orientado a candidatos a ingeniero de software. Lo desarrolla abdulkadirelaldi como componente del proyecto SE Primer, un juego narrativo por teléfono en el que cada escena de decisión presenta alternativas con distinto perfil de riesgo. El modelo predice `p(riesgo)` a partir del comportamiento previo del jugador y, cuando supera el umbral de 0,5, el juego intercala una tarjeta socrática de "para y piensa" antes de mostrar las opciones.

Técnicamente es un modelo muy modesto: un clasificador lineal (regresión logística de scikit-learn) con 7 características de entrada y 2 clases de salida, serializado con skl2onnx. No es un modelo de lenguaje ni un transformer; es un artefacto de inferencia de baja latencia pensado para ejecutarse en el navegador del cliente. Su relevancia es fundamentalmente metodológica y educativa: documenta con rigor un caso de modelo en estado borrador (v2.0.0-rc1) que no supera su propia puerta de evaluación y que, por tanto, solo debe desplegarse en modo sombra.

El modelo se declara explícitamente no apto para producción: la condición E4 de su puerta de evaluación (al menos 15 sesiones reales) no se ha cumplido, con solo 5 sesiones y 15 filas reales frente a 1113 filas sintéticas. La model card es ejemplar en transparencia sobre limitaciones, sesgos de datos sintéticos y riesgo de bucles de retroalimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal (regresión logística de scikit-learn) exportado a ONNX con skl2onnx |
| Parametros totales | 8 coeficientes más intercepto (7 características estandarizadas + sesgo); no disponible el recuento exacto de parámetros del grafo ONNX |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular fija de 7 características) |
| Tipos de cuantizacion | No disponible; el artefacto distribuido es ONNX en precisión nativa (float32 en entrada y salida) |
| Idiomas soportados | Turco (tr); las características son numéricas y el modelo no procesa texto |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística estándar sobre 7 características numéricas estandarizadas: número de escena (2 o 3), nivel declarado del jugador (0 novel, 1 intermedio, 2 experimentado), partidas completadas previamente en el dispositivo, número de elecciones arriesgadas previas en la sesión (0-2), duración de la decisión anterior en segundos, tiempo de lectura del feedback anterior en segundos y número de mensajes o peticiones de pista al tutor. La entrada ONNX se denomina `input` con forma `[n, 7]` en float32 y la salida `probabilities` con forma `[n, 2]`, donde la segunda columna es `p(riesgo)`. El modelo solo opera en las decisiones 2 y 3; en la decisión 1 no hay historial observable y se aplica arranque en frío sin predicción.

El entrenamiento se realizó sobre `data/oturumlar.csv` (1128 filas, una por decisión), de las cuales 752 corresponden a las decisiones 2 y 3. Solo 15 filas provienen de datos reales (5 sesiones, 5 participantes, recogidas con el modo de recolección de datos de la aplicación y sin datos personales); las 1113 restantes son sintéticas, generadas con semilla 42 mediante reglas codificadas en `data/hazirla.py`. La partición es agrupada por participante con `GroupShuffleSplit` (test 25 %, semilla 42), garantizando que ninguna persona aparece simultáneamente en entrenamiento y test. El stack de entrenamiento es scikit-learn 1.9.1, skl2onnx 1.20.0 y Python 3.12.13. La discrepancia máxima entre la inferencia ONNX y la de scikit-learn es de 1,2e-07, muy por debajo del umbral de 1e-4 fijado en la especificación.

## Capacidades

- Clasificación binaria tabular: estima `p(riesgo)` para una decisión de juego a partir de 7 características numéricas.
- Inferencia en navegador: el artefacto ONNX está pensado para ejecutarse en el cliente, sin backend dedicado.
- Predicción condicionada al historial: solo emite predicción en las decisiones 2 y 3, cuando existe comportamiento previo observable.
- Umbralización configurable: el consumidor aplica el umbral de 0,5 para decidir si muestra la tarjeta socrática.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües en sentido estricto: no procesa lenguaje natural, solo valores numéricos.
- No dispone de modo de pensamiento ni de decodificación especulativa.

## Casos de uso

- Modo sombra en el juego SE Primer: el modelo predice y registra `p(riesgo)` sin alterar la partida, tal como exige la especificación en su revisión 3 mientras no se alcance la puerta E4. Es el único uso autorizado por el autor en el estado actual.
- Recolección de datos para la siguiente versión: ejecutar el modelo en sombra permite acumular etiquetas reales sin que la tarjeta socrática modifique el comportamiento del jugador y contamine la distribución.
- Intervención pedagógica opt-in: en una fase posterior a la validación, mostrar una tarjeta de "para y piensa" cuando `p(riesgo) ≥ 0,5`, como andamiaje socrático antes de presentar las opciones.
- Investigación educativa sobre comportamiento en juegos-kitap: usar las probabilidades como variable dependiente para estudiar correlaciones entre tiempo de lectura, uso del tutor y asunción de riesgos.
- Docencia de MLOps y model cards: el artefacto sirve como ejemplo completo de exportación ONNX, partición agrupada, puerta de evaluación previa y documentación de limitaciones.
- Prototipado de sistemas de recomendación adaptativa de bajo coste: la arquitectura lineal permite integrar el modelo en un servicio ligero o en un worker de navegador sin infraestructura GPU.
- Pruebas de integración de pipelines ONNX: validar la paridad entre scikit-learn y ONNX Runtime con una tolerancia de 1e-4 en un modelo pequeño y determinista.

## Benchmarks y rendimiento

| Metrica | Test completo | Solo filas reales de test |
|---|---|---|
| Filas | 178 | 4 |
| ROC-AUC | 0,7632 | 0,0 |
| Exactitud balanceada | 0,7032 | 0,5 |
| Exactitud | 0,7079 | 0,75 |
| Línea base de clase mayoritaria | 0,6573 | 0,75 |
| Brier | 0,1981 | 0,2184 |

Puerta de aceptación definida antes del entrenamiento (spec.md §10): ROC-AUC ≥ 0,75, exactitud balanceada ≥ 0,7, diferencia ONNX frente a scikit-learn ≤ 0,0001 y al menos 15 sesiones reales. El modelo cumple las tres primeras condiciones en el test completo (diferencia máxima ONNX frente a scikit-learn de 1,2e-07), pero no la cuarta, por lo que el autor lo marca como borrador no publicable. En la medición de la revisión 2 con 30 particiones agrupadas distintas, la exactitud balanceada media fue 0,698 (rango 0,620-0,765) y el AUC medio 0,771, lo que indica que la superación del umbral depende de qué participantes caen en el conjunto de test.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el modelo es un clasificador lineal y el grafo ONNX ocupa una fracción mínima de ese espacio.
- GPU recomendadas: ninguna; no requiere aceleración por GPU.
- Cabe en cualquier GPU de consumo y también en CPU, incluidos dispositivos móviles y navegadores.
- Opciones de despliegue: ONNX Runtime (incluido onnxruntime-web para navegador), o cualquier runtime compatible con ONNX; no requiere vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo (7 características, 2 clases) se espera latencia de microsegundos a pocos milisegundos en CPU, sin que el autor aporte cifras medidas.
- El autor recomienda descargar el artefacto desde una URL fijada a un commit concreto (`resolve/<commit>/model.onnx`) en lugar de la rama `main`.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| abdulkadirelaldi/se-primer-risk-onnx | Regresión logística ONNX | 7 características tabulares | MIT | Borrador v2.0.0-rc1, solo modo sombra | Puerta E4 no superada (5 sesiones reales) |
| Yavuz111/se-primer-risk-model | Modelo de riesgo del mismo proyecto (variante) | No disponible | No disponible | No disponible | Repositorio en Hugging Face; sin datos públicos de métricas ni especificación en la información disponible |
| Clasificador tabular genérico (p. ej. XGBoost o LightGBM) | Árboles gradient boosting | Tabular | Según implementación | Producción | Mayor capacidad de capturar interacciones no lineales, a costa de mayor tamaño y menor interpretabilidad |
| Regresión logística de referencia (scikit-learn) | Lineal | Tabular | BSD-3 | Producción | Equivalente funcional al modelo; el valor añadido aquí es la exportación ONNX y la documentación de la puerta de evaluación |

## Limitaciones y advertencias

- Estado de borrador: la condición E4 (15 sesiones reales) no se cumple; el autor restringe el uso a modo sombra, sin modificar el juego.
- Datos reales insuficientes: solo 15 filas reales y 4 en el test real, con intervalos de confianza muy amplios; la columna de métricas reales es indicativa, no evidencia.
- Dominio sintético: el modelo aprende principalmente las reglas de `data/hazirla.py` (jugador impulsivo lee poco y asume riesgo); los jugadores reales pueden no seguir ese patrón.
- Exactitud balanceada en el límite: media de 0,698 en 30 particiones agrupadas, por debajo del umbral de 0,7; la superación depende de la partición.
- Arranque en frío: no hay predicción en la decisión 1; el primer intento con decisiones 1-3 fue rechazado con AUC 0,711 y AUC 0,574 en la decisión 1.
- Bucle de retroalimentación: mostrar la tarjeta reduce el riesgo del jugador y altera las etiquetas futuras; por eso la recolección se hace en modo sombra.
- Prohibición explícita de uso: no debe emplearse para calificar, clasificar ni medir la competencia de estudiantes, ni para decisiones en contextos reales (contratación, exámenes, guardias).
- Generalización limitada: no debe aplicarse a escenarios distintos de las tres escenas sin reentrenamiento.
- Licencia MIT: permite uso comercial, pero el estado de borrador y las advertencias del autor desaconsejan cualquier despliegue en producción.
- Modelo público: se ejecuta en el navegador y no es secreto; el autor lo considera aceptable porque no se entrenó con datos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdulkadirelaldi/se-primer-risk-onnx
- Descarga fijada a commit: https://huggingface.co/abdulkadirelaldi/se-primer-risk-onnx/resolve/<commit>/model.onnx
- Repositorio del proyecto: https://github.com/abdulkadirelaldi/se-primer
- Variante del mismo proyecto: https://huggingface.co/Yavuz111/se-primer-risk-model
