# bshepp/umwelt-trek-carrier_C0.03

## Resumen

`bshepp/umwelt-trek-carrier_C0.03` es un modelo de clasificación de escenas por minuto desarrollado por Brian Sheppard (bshepp) dentro del proyecto de investigación de sensado Silicon Dreaming / umwelt-trek. No es un modelo de lenguaje: se trata de una regresión logística multiclase con balanceo de clases, implementada con scikit-learn, que opera sobre 478 columnas estandarizadas derivadas de los sensores de un portátil (espectros de micrófono, recuentos y conjuntos hasheados de dispositivos Bluetooth y WiFi, barridos de radio, calidad de GPS, una caja IMU y una placa de luz).

El modelo clasifica cada minuto de actividad en cuatro clases: `desk` (escritorio), `bag-carried` (bolsa en movimiento), `bag-at-rest` (bolsa en reposo) y `vehicle` (vehículo). Se evaluó con validación leave-one-local-day-out sobre 40.876 minutos y 36 días reservados, alcanzando una accuracy de 0,951 frente a una clase mayoritaria del 0,931, y un log-loss calibrado de 0,210 tras aplicar escalado de temperatura.

Su relevancia es acotada y de nicho: es un artefacto de investigación reproducible (un "seed packet" del zoo de modelos del proyecto) que resulta útil para estudiar fusión de sensores pasiva, calibración probabilística y clasificación de contexto con datos de sensado de bajo coste. El paquete solo es utilizable junto con el extractor de características del proyecto, que no se publica en este repositorio, y los datos de entrenamiento son privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística multiclase con balanceo de clases (scikit-learn) |
| Parametros totales | no disponible (coeficientes sobre 478 columnas de entrada; el número exacto de coeficientes no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre una fila de 478 características por minuto; no hay ventana de contexto) |
| Tipos de cuantizacion | no disponible (no aplica; modelo lineal en coma flotante) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (artefacto serializado de scikit-learn, presumiblemente joblib/pickle; no confirmado en la información) |

## Arquitectura y entrenamiento

El modelo es una regresión logística multiclase entrenada con scikit-learn sobre 478 columnas estandarizadas (la lista de nombres está en `model.json`). La inferencia se define explícitamente en la model card como `p = sigmoid(((x - mu) / sd) @ coef.T + intercept)` sobre las columnas nombradas, seguida de un mapa de calibración. La regularización empleada es C = 0,03, con banderas de presencia conservadas y un dropout de presencia de 0,0. No se excluyeron prefijos ni grupos de características.

El entrenamiento utilizó datos privados no publicados: 40.876 minutos puntuados y 36 días reservados para evaluación leave-one-local-day-out. La calibración se realizó mediante escalado de temperatura post-hoc con T = 1,7153917971817878, ajustado también leave-one-day-out sobre las creencias reservadas, lo que redujo el log-loss de 0,253 a 0,210 (frente a 0,299 del predictor constante). La generación del paquete está fechada el 2026-11-06T0815Z y el proyecto mantiene un fichero de linaje con padres y generaciones.

## Capacidades

- Clasificación de escena por minuto en cuatro clases: `desk`, `bag-carried`, `bag-at-rest` y `vehicle`.
- Fusión de sensores heterogéneos: espectros de audio, recuentos y conjuntos hasheados de Bluetooth/WiFi, barridos de radio, calidad de GPS, IMU y placa de luz.
- Salida probabilística calibrada (probabilidades por clase tras escalado de temperatura).
- Manejo de valores ausentes mediante banderas de presencia.
- Procesamiento de datos de sensado solo en recepción, sin identificadores personales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Clasificación de contexto de un portátil en investigación: etiquetar automáticamente cada minuto de un registro de sensores como escritorio, bolsa en movimiento, bolsa en reposo o vehículo, usando el extractor de características del proyecto y la fórmula de inferencia documentada.
- Estudio de calibración probabilística: el paquete incluye parámetros de escalado de temperatura ajustados leave-one-day-out, lo que lo convierte en un ejemplo reproducible para comparar calibración pre y post-hoc en clasificadores lineales.
- Experimentos de fusión de sensores pasiva: sirve como línea base para evaluar cuánta señal aportan conjuntamente audio, radio, GPS e IMU en una tarea de reconocimiento de contexto.
- Reproducción de protocolos de evaluación temporal: el esquema leave-one-local-day-out y las métricas por clase publicadas permiten replicar metodologías de validación que evitan fuga de información entre días.
- Docencia y divulgación sobre privacidad en sensado: el diseño (hashes salados, solo espectros y resúmenes de color, sin coordenadas ni audio) es un caso práctico para explicar minimización de datos en pipelines de sensado.
- Comparación con modelos del zoo de Silicon Dreaming: al ser un "seed packet" con linaje registrado, permite contrastar generaciones y padres dentro del mismo proyecto.

## Benchmarks y rendimiento

Resultados reservados publicados en la model card (40.876 minutos puntuados, 36 días reservados):

| Metrica | Valor |
|---|---|
| Accuracy global | 0,951 |
| Clase mayoritaria | 0,931 |
| Log-loss sin calibrar | 0,253 |
| Log-loss calibrado | 0,210 |
| Log-loss predictor constante | 0,299 |

| Clase | n | Precision | Recall |
|---|---|---|---|
| bag-at-rest | 880 | 0,07 | 0,06 |
| bag-carried | 1898 | 0,81 | 0,83 |
| desk | 38057 | 0,98 | 0,98 |
| vehicle | 41 | 0,23 | 0,34 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; un modelo lineal de scikit-learn sobre 478 características se ejecuta en CPU con huella de memoria mínima (del orden de kilobytes para los coeficientes).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier consumer GPU y en CPU convencional; no hay requisito de aceleración.
- Opciones de despliegue: inferencia directa con scikit-learn en Python, o reimplementación de la fórmula `sigmoid(((x - mu) / sd) @ coef.T + intercept)` más el mapa de calibración en cualquier lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo (producto matricial de 478 dimensiones) la latencia por fila es del orden de microsegundos en CPU, si bien no se publica una medición.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (clasificadores de escena por minuto con fusión de sensores de portátil) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: `bag-at-rest` (precision 0,07, recall 0,06) y `vehicle` (precision 0,23, recall 0,34) son prácticamente inútiles en la práctica, pese a la accuracy global alta, que está dominada por la clase `desk` (38.057 de 40.876 minutos).
- La accuracy global de 0,951 apenas supera la clase mayoritaria (0,931); conviene interpretar el resultado con cautela y atender a las métricas por clase.
- Los datos de entrenamiento, la tabla por minuto y las creencias son privados y no se publican; no es posible reentrenar ni auditar el modelo con datos independientes.
- El paquete solo es utilizable con el extractor de características del proyecto, que no está incluido en este repositorio; sin él, los 478 columnas de entrada no pueden generarse.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero la falta de datos y de extractor limita seriamente su aplicabilidad fuera del proyecto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza si se usa la salida sin la calibración de temperatura documentada.
- El sensado es solo en recepción y anonimizado (hashes salados, sin audio ni imágenes almacenadas, sin coordenadas), pero la model card no detalla el proceso de salado ni los posibles sesgos de los datos privados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bshepp/umwelt-trek-carrier_C0.03
- Perfil del autor en Hugging Face: https://huggingface.co/bshepp
- Repositorio del proyecto umwelt-trek: no disponible en la información proporcionada
- Paper o blog de Silicon Dreaming: no disponible en la información proporcionada
- Demo o Space asociado: no disponible en la información proporcionada
