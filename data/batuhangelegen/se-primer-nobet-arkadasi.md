# batuhangelegen/se-primer-nobet-arkadasi

## Resumen

SE Primer v2.0.0 (publicado como `batuhangelegen/se-primer-nobet-arkadasi`) es un clasificador tabular muy ligero desarrollado por batuhangelegen como componente de un juego educativo de ingeniería del software. No es un modelo de lenguaje: es un `Pipeline` de scikit-learn (transformación logarítmica, escalado estándar y regresión logística) exportado a ONNX que estima la probabilidad de que un jugador elija la opción rápida pero arriesgada (B) en la siguiente decisión del juego.

El modelo resuelve un problema muy acotado: dado el comportamiento previo del jugador en una partida (tiempos de lectura, número de decisiones arriesgadas anteriores, uso de pistas, etc.), predice si volverá a precipitarse. Si la probabilidad supera τ = 0,5, el juego muestra una tarjeta socrática que invita a reflexionar y activa una cuenta atrás de 60 segundos. Es relevante como ejemplo de integración de un modelo predictivo pequeño en el navegador mediante `onnxruntime-web`, con un contrato de entrada de 10 características float32.

El conjunto de datos es extremadamente reducido (180 filas de decisión, 60 sesiones reales) y todas las sesiones reales fueron generadas por un agente de IA (Claude), no por humanos. El propio autor advierte que el modelo no debe usarse para evaluar personas, en selección de personal ni en contextos clínicos u operativos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `log(1+x)` → `StandardScaler` → `LogisticRegression(C=1)`, exportado a ONNX (opset 17) |
| Parámetros totales | no disponible (modelo lineal; el número de coeficientes es 10 más intercepto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 10 características tabulares) |
| Tipos de cuantización | no disponible (exportación ONNX float32; no se documentan otras precisiones) |
| Idiomas soportados | turco (`tr`) en la documentación y la interfaz del juego; el modelo en sí procesa valores numéricos |
| Licencia | MIT |
| Formato de pesos | ONNX (entrada `input` float32 `[n, 10]`, salidas `probabilities` `[n, 2]` y `label`) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clásico, no una red neuronal profunda. El pipeline aplica una transformación logarítmica `log(1 + x)` a las características (integrada dentro del grafo ONNX mediante operaciones Add y Log), seguida de un `StandardScaler` y una `LogisticRegression` con `C=1`. El modelo se entrenó con Python 3.13, scikit-learn 1.9.1 y skl2onnx 1.20.0, con semilla 13 (candidato D6 según el registro `DENEYLER.md`).

Las 10 características de entrada son: nivel declarado (0-2), número de escena (1-3), si el objetivo corresponde a esa escena (0/1), tiempo de selección de perfil en segundos, tiempo de lectura del texto de crisis en segundos, número de elecciones arriesgadas previas, tiempo medio de decisiones previas en segundos, número de pistas vistas previamente, número de mensajes del tutor previos y número de veces que se agotó el tiempo anteriormente. Todas ellas se conocen en el momento en que se abre la pantalla de decisión; ni la duración ni la elección de la decisión actual forman parte de la entrada.

El conjunto de datos contiene 180 filas de decisión provenientes de 60 sesiones reales (0 sesiones sintéticas en el modelo publicado). Todas las sesiones reales fueron jugadas por un agente de IA (Claude) simulando 12 perspectivas de jugador distintas; el campo `oynayan = yz_ajan` lo registra. La tasa de elección arriesgada es 0,2833 tanto en el conjunto completo como en el real. No se documenta uso de RLHF, DPO ni ajuste por refuerzo.

## Capacidades

- Predicción binaria de probabilidad de elección arriesgada (opción B) en la siguiente decisión del juego, a partir de 10 características tabulares.
- Salida calibrada como probabilidad `[n, 2]` (columna 1 = elección arriesgada) más etiqueta predicha.
- Inferencia en navegador mediante `onnxruntime-web`, con paridad verificada frente a la referencia Python (`tests/parite.py`).
- Transformación logarítmica incorporada en el grafo ONNX, de modo que el contrato de entrada acepta valores crudos en segundos y recuentos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe: no aplica; el modelo opera sobre valores numéricos y la documentación está en turco.

## Casos de uso

- Juego educativo de ingeniería del software: el modelo se ejecuta en el cliente al abrir cada pantalla de decisión y, si la probabilidad supera 0,5, muestra una tarjeta socrática con una pregunta, abre una pista y activa una cuenta atrás de 60 segundos para inducir reflexión.
- Investigación sobre andamiaje cognitivo en entornos educativos: permite estudiar si una intervención basada en el comportamiento previo reduce la tasa de decisiones impulsivas, comparando sesiones con y sin intervención del modelo.
- Ejemplo docente de despliegue de modelos tabulares en el navegador: sirve como referencia completa de pipeline scikit-learn exportado a ONNX, con verificación de paridad numérica (diferencia máxima de 1,19e-07) y contrato de entrada documentado.
- Prototipado de sistemas de recomendación adaptativa de ritmo: el patrón (probabilidad de riesgo → intervención condicional) es reutilizable en otros juegos o simuladores educativos que registren tiempos y elecciones previas.
- Análisis de comportamiento en partidas: las 10 características permiten instrumentar métricas de tempo (tiempo de lectura, tiempo medio de decisión, uso de pistas) y correlacionarlas con la precipitación.
- Evaluación de metodología de validación con datos escasos: el modelo documenta validación cruzada de 5 pliegues agrupada por sesión, umbrales de aceptación (E0-E4) y un caso explícito de cambio de umbral posterior a la observación de resultados, útil como material de estudio sobre pre-registro y sesgo de selección.

## Benchmarks y rendimiento

Resultados publicados por el autor con validación cruzada de 5 pliegues agrupada por sesión, umbral τ = 0,5:

| Métrica | Todos los datos | Solo datos reales |
|---|---|---|
| ROC-AUC | 0,68 | 0,68 |
| Accuracy | 0,7333 | 0,7333 |
| Precision (arriesgado) | 0,5517 | 0,5517 |
| Recall (arriesgado) | 0,3137 | 0,3137 |
| Línea base: solo `onceki_riskli` (AUC) | 0,5146 | no disponible |

| Puerta de aceptación | Valor | Umbral | Resultado |
|---|---|---|---|
| E0_gercek_oturum (sesiones reales) | 60 | ≥ 15 | superada |
| E1_auc_cv | 0,68 | ≥ 0,65 | superada |
| E2_auc_cv_gercek | 0,68 | ≥ 0,6 | superada |
| E3_taban_ustu | 0,68 | > 0,5146 | superada |
| E4_onnx_fark (diferencia ONNX vs. Python) | 1,19e-07 | ≤ 0,0001 | superada |

El autor advierte explícitamente que el umbral E1 se rebajó de 0,70 a 0,65 después de observar los resultados, por lo que la superación no constituye un test pre-registrado. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: despreciable; el modelo es un clasificador lineal con 10 características y cabe en unos pocos kilobytes.
- GPU recomendadas: no requiere GPU; la inferencia se ejecuta en CPU, incluido el navegador mediante `onnxruntime-web`.
- Cabe en cualquier GPU de consumo y en dispositivos móviles; también en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript/Web), `onnxruntime-web` en el navegador y la referencia Python con scikit-learn.
- Latencia y throughput: no se publican cifras concretas; por la naturaleza del modelo (una decena de operaciones sobre 10 valores float32), la latencia esperada es de microsegundos a milisegundos por inferencia.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. Como referencia estructural, este modelo se sitúa en la categoría de clasificadores tabulares lineales exportados a ONNX para inferencia en cliente, pero no se han identificado alternativas concretas con las que compararlo en parámetros, contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SE Primer v2.0.0 | no disponible (lineal, 10 características) | no aplica | ROC-AUC 0,68 | MIT | Hugging Face, ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de datos humanos: las 60 sesiones fueron jugadas por un agente de IA (Claude); el modelo aprende el tempo de un modelo de lenguaje simulando un humano, no el de personas reales. No se ha medido con jugadores humanos.
- Volumen de datos muy reducido: 180 filas de decisión y 60 sesiones implican intervalos de confianza amplios para el AUC de 0,68.
- No distingue intención: un jugador rápido que acierta deliberadamente, o que lee y elige B a propósito, contradice la heurística "prisa = riesgo".
- Bucle de retroalimentación: cuando el modelo interviene, el comportamiento del jugador cambia (se abre pista, se activa cuenta atrás); las filas con `model_mudahale = 1` deben evaluarse por separado.
- Uso prohibido por el autor: evaluar personas, calificar, selección de personal, decisiones clínicas u operativas reales, o cualquier contexto fuera del juego. La validez fuera del juego no se ha medido.
- Métricas modestas en la clase positiva: precision 0,5517 y recall 0,3137, lo que implica que se escapan aproximadamente dos tercios de las elecciones arriesgadas.
- Umbral modificado tras observar resultados (de 0,70 a 0,65), lo que introduce sesgo de selección en la validación reportada.
- Licencia MIT: permite uso comercial y modificación, pero el autor restringe explícitamente los usos sensibles descritos arriba.
- Idiomas: la documentación y el juego están en turco; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batuhangelegen/se-primer-nobet-arkadasi
- Repositorio del proyecto: https://github.com/bgelegen/se-primer
- Registro de experimentos: https://github.com/bgelegen/se-primer/blob/main/DENEYLER.md
