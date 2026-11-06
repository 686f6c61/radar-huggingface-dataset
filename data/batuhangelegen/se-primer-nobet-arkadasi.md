# batuhangelegen/se-primer-nobet-arkadasi

## Resumen

SE Primer · Nöbet Arkadaşı v2.0.0 es un clasificador tabular binario desarrollado por el usuario de Hugging Face batuhangelegen. No es un modelo de lenguaje: es un pipeline de scikit-learn (`log(1+x)` → `StandardScaler` → `LogisticRegression`) exportado a ONNX que predice la probabilidad de que un jugador elija la opción rápida pero arriesgada (opción B) en el siguiente turno de un juego educativo de ingeniería del software. El modelo se integra en la aplicación SE Primer, que se ejecuta en el navegador mediante `onnxruntime-web`, y su función es activar una intervención pedagógica (una pregunta socrática, una pista y un temporizador de 60 segundos) cuando la probabilidad estimada es igual o superior a τ = 0,5.

El modelo resuelve un problema muy acotado: estimar, a partir del comportamiento previo del jugador en la partida, si este va a precipitarse en la siguiente decisión. La entrada es un vector de 10 características float32 conocidas en el momento en que se abre la pantalla de decisión (nivel declarado, número de escena, tiempo de lectura de la crisis, número de elecciones arriesgadas previas, etc.), y la salida es una distribución de dos clases. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia es fundamentalmente metodológica y educativa: documenta de forma transparente un experimento de modelado con muy pocos datos (60 sesiones, 180 decisiones), advierte explícitamente de que todas las sesiones fueron generadas por un agente de IA y no por humanos, y publica los umbrales de validación junto con la confesión de que uno de ellos se rebajó después de ver los resultados. Es un ejemplo de model card honesta sobre las limitaciones de un clasificador de bajo rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `log(1+x)` → `StandardScaler` → `LogisticRegression(C=1)`, exportado a ONNX (opset 17) |
| Parametros totales | 10 coeficientes + 1 término independiente (regresión logística sobre 10 características); recuento exacto no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación tabular; entrada de 10 características por muestra) |
| Tipos de cuantizacion | No disponible (el modelo se distribuye como grafo ONNX en float32) |
| Idiomas soportados | Turco (`tr`) en la documentación y la interfaz del juego; el modelo en sí no procesa texto |
| Licencia | MIT |
| Formato de pesos | ONNX (`input` float32 `[n, 10]`, salidas `probabilities` `[n, 2]` y `label`); pipeline de referencia en scikit-learn |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística con transformación logarítmica previa de las características y estandarización posterior. La transformación `log(1+x)` está embebida dentro del grafo ONNX (operaciones Add + Log), de modo que el contrato de entrada son segundos y recuentos en bruto, sin preprocesado por parte del cliente. El entrenamiento se realizó con Python 3.13, scikit-learn 1.9.1 y skl2onnx 1.20.0, con semilla 13 (candidato D6 del registro de experimentos).

Los datos de entrenamiento son 180 filas de decisión provenientes de 60 sesiones reales, sin sesiones sintéticas en el modelo publicado (aunque se generaron y probaron durante la fase de experimentación con `tools/sentetik_uret.py`). Un dato crítico: las 60 sesiones fueron jugadas íntegramente por un agente de IA (Claude) simulando 12 perspectivas de jugador distintas, no por personas. La tasa de elección arriesgada es 0,2833 tanto en el conjunto total como en el real. La validación se hizo con validación cruzada de 5 pliegues agrupada por sesión, y el umbral de la puerta E1 se rebajó de 0,70 a 0,65 después de comprobar que ninguno de los siete candidatos lo superaba, tal como se documenta en `DENEYLER.md`.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de que el jugador elija la opción arriesgada en la siguiente decisión.
- Entrada de 10 características numéricas conocidas antes de la decisión: `seviye_no`, `sahne_no`, `hedef_bu_sahne`, `giris_suresi_sn`, `kriz_okuma_sn`, `onceki_riskli`, `onceki_ort_karar_sn`, `onceki_ipucu`, `onceki_tutor`, `onceki_sure_doldu`.
- Salida calibrada como distribución de dos clases (`probabilities`) más etiqueta (`label`), con la columna 1 correspondiendo a la elección arriesgada.
- Inferencia en navegador mediante `onnxruntime-web`, con una implementación de referencia en Python (`tests/parite.py`) que verifica la paridad con una diferencia máxima de 1,19e-07.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto. No es multilingüe en el sentido habitual: no procesa lenguaje.
- Capacidad especial: activación condicional de una intervención pedagógica (pregunta socrática, pista y temporizador de 60 s) cuando la probabilidad supera τ = 0,5.

## Casos de uso

- Intervención pedagógica en tiempo real dentro del juego SE Primer: cuando la probabilidad de elección arriesgada supera 0,5, la aplicación muestra la tarjeta "Nöbet Arkadaşı" con una pregunta socrática y una pista, y arranca un temporizador de 60 segundos. El modelo es adecuado porque su latencia es despreciable y se ejecuta en el propio navegador sin enviar datos a un servidor.
- Despliegue íntegramente en el cliente: al distribuirse como grafo ONNX de pequeño tamaño, puede cargarse con `onnxruntime-web` en una aplicación estática, lo que simplifica el alojamiento y evita costes de inferencia en servidor.
- Referencia de paridad para portabilidad de pipelines: el par `tests/parite.py` y el grafo ONNX sirven como plantilla para verificar que un pipeline de scikit-learn exportado produce resultados equivalentes en Python y en JavaScript.
- Docencia sobre evaluación honesta de modelos: el repositorio documenta umbrales de validación, la rebaja del umbral E1 y la naturaleza sintética de los datos, y puede usarse como caso de estudio sobre pre-registro y transparencia en experimentos de machine learning.
- Investigación sobre recogida de datos en modo sombra: el modelo está pensado para desplegarse primero en modo sombra y recoger datos humanos reales, de modo que sirve como punto de partida para un estudio de validación con jugadores humanos.
- Análisis de comportamiento en juegos educativos: las 10 características registradas (tiempos de lectura, uso de pistas, elecciones previas) permiten estudiar patrones de precipitación en entornos de aprendizaje, aunque los resultados solo son válidos dentro de este juego concreto.

## Benchmarks y rendimiento

Resultados publicados en la model card, con validación cruzada de 5 pliegues agrupada por sesión y umbral τ = 0,5:

| Metrica | Todos los datos | Solo datos reales |
|---|---|---|
| ROC-AUC | 0,68 | 0,68 |
| Accuracy | 0,7333 | 0,7333 |
| Precision (riesgo) | 0,5517 | 0,5517 |
| Recall (riesgo) | 0,3137 | 0,3137 |
| Línea base: solo `onceki_riskli` (AUC) | 0,5146 | no disponible |

| Puerta de validacion | Valor | Umbral | Resultado |
|---|---|---|---|
| E0_gercek_oturum | 60 | ≥ 15 | Superada |
| E1_auc_cv | 0,68 | ≥ 0,65 | Superada (umbral rebajado desde 0,70) |
| E2_auc_cv_gercek | 0,68 | ≥ 0,6 | Superada |
| E3_taban_ustu | 0,68 | > 0,5146 | Superada |
| E4_onnx_fark | 1,19e-07 | ≤ 0,0001 | Superada |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para el grafo ONNX en float32; el modelo cabe holgadamente en cualquier dispositivo.
- GPU recomendadas: no necesita GPU. Funciona en CPU y en el navegador mediante `onnxruntime-web`.
- Cabe en cualquier GPU de consumo, en CPU de portátil e incluso en dispositivos móviles; el cuello de botella es el motor de inferencia, no el modelo.
- Opciones de despliegue: `onnxruntime-web` (navegador), ONNX Runtime en Python, o reconstrucción del pipeline con scikit-learn 1.9.1.
- Latencia y throughput: no se han publicado mediciones. Por la naturaleza del modelo (una regresión logística sobre 10 características), la latencia esperada es del orden de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un clasificador tabular específico de un juego educativo, sin equivalentes públicos identificados en el material consultado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SE Primer · Nöbet Arkadaşı v2.0.0 | Regresión logística sobre 10 características | No aplica | MIT | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de datos humanos: las 60 sesiones fueron jugadas por un agente de IA (Claude). El modelo aprende el ritmo de un modelo de lenguaje que "juega como un humano", no el de personas reales, y no se ha validado con jugadores humanos.
- Volumen de datos muy reducido: 60 sesiones y 180 decisiones implican intervalos de confianza amplios para el AUC de 0,68.
- Recall bajo en la clase arriesgada (0,3137): el modelo deja pasar aproximadamente dos tercios de las elecciones arriesgadas, por lo que la intervención pedagógica se activa en pocas ocasiones.
- Incapacidad para distinguir intención: un jugador rápido pero deliberadamente correcto, o uno que lee y elige B a propósito, contradice la heurística "prisa = riesgo" del modelo.
- Bucle de retroalimentación: cuando el modelo interviene, el comportamiento del jugador cambia (se abre la pista, se elimina el temporizador); las filas con `model_mudahale = 1` deben evaluarse por separado en los datos de la v2.
- Uso prohibido explícito: el autor indica que el modelo no debe emplearse para evaluar personas, asignar notas, procesos de selección ni decisiones clínicas u operativas reales. Solo proporciona una probabilidad aproximada para la siguiente elección dentro de este juego.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no está entrenado con datos sensibles y su transparencia total implica que cualquiera puede inspeccionarlo.
- Idiomas: la documentación y la interfaz están en turco; el modelo no procesa texto y no tiene capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batuhangelegen/se-primer-nobet-arkadasi
- Repositorio del proyecto: https://github.com/bgelegen/se-primer
- Registro de experimentos: https://github.com/bgelegen/se-primer/blob/main/DENEYLER.md
