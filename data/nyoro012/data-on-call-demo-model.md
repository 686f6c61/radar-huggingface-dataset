# Nyoro012/data-on-call-demo-model

## Resumen

`Nyoro012/data-on-call-demo-model` es un artefacto demostrativo publicado en Hugging Face por el usuario Nyoro012 bajo el nombre "Data On-Call v2 Risk Predictor (DEMO)". No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de scikit-learn compuesto por un `StandardScaler` y una regresión logística (`C=1.0`, `max_iter=1000`, `random_state=42`), exportado a formato ONNX. Su función es predecir la probabilidad de que un jugador elija una opción arriesgada en una escena de decisión de un entorno educativo o de juego, a partir de siete características conocidas al inicio de la escena.

El modelo se ha entrenado exclusivamente con datos sintéticos (300 decisiones generadas por una regla matemática documentada con semilla 42), no con comportamiento real de jugadores. El autor declara explícitamente que un modelo entrenado con 54 filas reales de 3 participantes falló la puerta de evaluación pre-registrada (exactitud 0.444 frente a la línea base de mayoría 0.574, ROC AUC 0.42), por lo que no publica ningún modelo aprendido de jugadores reales. La relevancia de este artefacto es, por tanto, exclusivamente metodológica: demuestra el flujo completo de entrenamiento, serialización, exportación a ONNX, empaquetado, consumo en Node.js/web y verificación de paridad numérica de probabilidades entre entornos.

Se trata de un modelo tabular de 7 entradas y 1 salida de probabilidad, sin contexto conversacional, sin capacidades generativas y sin soporte multilingüe. Cualquier evaluación de su utilidad debe ceñirse a su propósito declarado: la verificación de integridad del pipeline, no la predicción de comportamiento humano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `LogisticRegression(C=1.0, max_iter=1000, random_state=42)` |
| Parámetros totales | 7 coeficientes + 1 término de intercepción (más parámetros de escalado); no disponible el recuento exacto |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | no disponible; el artefacto se distribuye en float32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`, entrada float32 `input` con forma `[1, 7]`, salida `probabilities`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline lineal clásico: estandarización de las siete características de entrada seguida de una regresión logística con regularización L2 por defecto. La entrada es un vector float32 de forma `[1, 7]` y la salida es un vector de probabilidades. El artefacto se exportó a ONNX runtime con SHA256 `91bca9e20ad87e43f5eec7b71356a4953feaef31c13ce129fd0665d078fb5c57` y marca de tiempo de empaquetado `2026-11-06T08:06:12.692774+00:00`, versión `v2.0-demo`.

El entrenamiento se realizó sobre 300 decisiones sintéticas correspondientes a 100 sesiones simuladas, generadas por `scripts/make_synthetic.py` con semilla 42. La regla generativa parte de un intercepto en log-odds de -0.85 (aproximadamente 46 % de tasa de riesgo) y modula la probabilidad al alza con el nivel Experienced (+1.3 log-odds), el recuento de elecciones arriesgadas previas (+0.9) y los timeouts previos (+1.1), y a la baja con las pistas solicitadas previamente (-1.3), todo ello con ruido gaussiano de media 0.0 y desviación típica 0.45. La etiqueta objetivo `chose_risky` vale 1 si el jugador simulado eligió la opción arriesgada o agotó el tiempo, y 0 en caso contrario. Las siete características (`level`, `goal`, `scene_no`, `prev_hints_used`, `prev_risky_count`, `prev_timeout_count`, `prev_decision_time_sec`) se conocen estrictamente al inicio de la escena; las métricas de interacción intra-escena (`hint_used_this_scene`, `decision_time_sec`) se excluyen por regla anti-fuga. La validación se realizó con `leave-one-session-out`, obteniendo una exactitud out-of-fold de 0.6600 frente a una línea base de mayoría de 0.5400, superando el umbral de sanidad de 0.60.

## Capacidades

- Predicción binaria de riesgo: estima \(P(\text{chose\_risky} = 1)\) a partir de siete características tabulares conocidas al inicio de la escena.
- Umbral de intervención: el autor define un disparador de tutoría proactiva cuando la probabilidad predicha es mayor o igual a 0.50.
- Inferencia en ONNX runtime: el artefacto puede ejecutarse en entornos Node.js y web, lo que habilita su consumo en el cliente.
- Paridad numérica entre frameworks: el pipeline verifica que las probabilidades calculadas en Python y en el runtime de destino coinciden.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo de pensamiento ni de ninguna capacidad especial más allá de la clasificación tabular.

## Casos de uso

- Verificación de integridad del pipeline de publicación: sirve como referencia para comprobar que un modelo exportado a ONNX produce las mismas probabilidades en Python y en Node.js, gracias al SHA256 documentado y a la marca de tiempo de empaquetado.
- Plantilla de empaquetado para modelos tabulares: equipos que necesiten publicar un clasificador scikit-learn en Hugging Face pueden replicar la estructura de artefacto, versión y metadatos descrita en la model card.
- Pruebas de integración en aplicaciones web: el modelo se puede cargar en el navegador mediante ONNX runtime web para validar el flujo de inferencia en el cliente con una entrada de forma `[1, 7]`.
- Docencia sobre fugas de datos: el ejemplo ilustra la regla anti-fuga que excluye las métricas intra-escena, útil para explicar cómo separar características disponibles en el momento de la decisión.
- Docencia sobre validación pre-registrada: el registro del fallo en la puerta de evaluación con datos reales (exactitud 0.444 frente a 0.574 de línea base) constituye un caso práctico de honestidad metodológica y de interpretación de líneas base.
- Prototipado de sistemas de tutoría con disparador de intervención: permite ensayar la lógica de activación de andamiaje cuando la probabilidad supera 0.50, siempre que se sustituya el modelo por uno validado antes de cualquier uso real.
- Pruebas de regresión numérica en CI/CD: la paridad de probabilidades entre el pipeline de Python y el artefacto ONNX puede integrarse como test automatizado en un pipeline de integración continua.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Exactitud out-of-fold (sintético) | 0.6600 | Validación `leave-one-session-out` sobre datos sintéticos |
| Línea base de mayoría (sintético) | 0.5400 | Mismo protocolo |
| Umbral de sanidad | 0.60 | Superado (PASSED) |
| Exactitud real | 0.4444 | `leave-one-participant-out`, 54 filas, 18 sesiones, 3 participantes |
| Línea base de mayoría (real) | 0.5741 | Mismo protocolo |
| ROC AUC real | 0.4215 | Mismo protocolo |
| Resultado de la puerta pre-registrada | FAIL | Registro en `docs/training_run1.txt` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a un modelo tabular de clasificación binaria.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el artefacto ONNX de una regresión logística de 7 características ocupa kilobytes, no gigabytes.
- GPU recomendadas: no requiere GPU; la inferencia puede ejecutarse en CPU sin penalización apreciable.
- Compatibilidad con GPU de consumo: irrelevante, dado que el modelo cabe holgadamente en cualquier CPU moderna e incluso en entornos de navegador.
- Opciones de despliegue: ONNX runtime (Python, Node.js, web), con integración directa en aplicaciones JavaScript según la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo (una multiplicación matricial de 7 dimensiones), la latencia será del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nyoro012/data-on-call-demo-model` | Regresión logística (scikit-learn) exportada a ONNX | Vector tabular `[1, 7]` | No aplica | no disponible | Hugging Face, 0 descargas, 0 likes |
| Clasificadores tabulares de scikit-learn (p. ej. `LogisticRegression` estándar) | Regresión logística | Vector tabular | No aplica | BSD-3-Clause (scikit-learn) | PyPI, ampliamente disponible |
| Otros demos ONNX de clasificación tabular | Variable (árboles, lineal) | Vector tabular | No aplica | Variable según autor | Hugging Face |

No se dispone de información sobre modelos comparables específicos de predicción de riesgo en entornos de juego educativo con los que establecer una comparación cuantitativa; los datos de benchmarks reales del modelo (exactitud 0.4444, ROC AUC 0.4215) no superan la línea base y no permiten una comparación favorable con alternativas.

## Limitaciones y advertencias

- Origen sintético: las etiquetas provienen exclusivamente de una regla matemática programada, por lo que el modelo solo puede reproducir esa regla y no refleja aprendizaje humano ni matices cognitivos reales.
- Etiqueta compuesta: `chose_risky` cuenta los timeouts como elecciones arriesgadas, de modo que la predicción refleja en parte la expiración del temporizador y no solo el riesgo intencional.
- Dependencia del modo de juego: los timeouts solo ocurren en nivel Experienced (`level = 1`) y las pistas solo varían en nivel Beginner (`level = 0`), lo que limita la variabilidad de las características según el modo.
- Muestra real insuficiente: el conjunto real de 54 filas y 3 participantes falló la puerta pre-registrada, lo que demuestra que un modelo lineal simple no puede predecir elecciones reales sin más datos e ingeniería de características.
- Prohibición explícita de uso: el autor prohíbe su uso para cualquier decisión adaptativa real en juego o producción, para cualquier afirmación sobre jugadores reales y para calificación de alto riesgo, evaluación formal de estudiantes o perfilado automatizado de usuarios.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el modelo puede producir probabilidades con apariencia de validez sobre datos fuera de la distribución sintética.
- Licencia no disponible: la ausencia de licencia declarada impide determinar las condiciones de uso comercial; debe consultarse al autor antes de cualquier reutilización.
- Sin soporte de idioma, contexto ni texto: no es adecuado para ninguna tarea de procesamiento de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nyoro012/data-on-call-demo-model
- Registro de auditoría del entrenamiento: `docs/training_run1.txt` (referenciado en la model card, no se proporciona URL absoluta)
- Script de generación de datos sintéticos: `scripts/make_synthetic.py` (referenciado en la model card, no se proporciona URL absoluta)
- Conjunto de datos sintético: `data/synthetic_dev.csv` (referenciado en la model card, no se proporciona URL absoluta)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
