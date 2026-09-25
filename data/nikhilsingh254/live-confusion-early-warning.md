# nikhilsingh254/live-confusion-early-warning

## Resumen

Live Confusion: early-warning model es un clasificador binario tabular desarrollado por nikhilsingh254 que estima, con un minuto de antelación, si una clase alcanzará el umbral de alerta por confusión en el minuto siguiente. No es un modelo de lenguaje ni una red neuronal: se trata de una regresión logística sobre características estandarizadas, serializada como 1 KB de pesos en JSON y ejecutable con unas 30 líneas de Python basadas únicamente en la biblioteca estándar, sin frameworks de aprendizaje automático ni dependencias de serialización tipo pickle.

El problema que aborda es concreto y acotado al ámbito educativo. El sistema Live Confusion Tracker (del mismo autor) permite al alumnado pulsar un botón silencioso de «estoy perdido»; los pulsos se agregan por minuto como porcentaje de estudiantes presentes y, cuando esa tasa cruza el umbral de la clase (habitualmente entre el 8 % y el 12 %), se dispara una alerta en el reloj o la tableta del docente. El inconveniente es que esa alerta llega cuando la línea ya se ha cruzado, es decir, con al menos un minuto perdido y el profesor frecuentemente ya avanzando hacia el siguiente punto. Este modelo cubre ese hueco: al cierre de cada minuto lee la acumulación de confusión y emite un aviso silencioso («hint», cambio de color en la esfera del reloj) cuando la probabilidad supera 0,15, lo que permite frenar, pedir retroalimentación o añadir un ejemplo mientras el arreglo todavía es barato.

Su relevancia es la de un artefacto de despliegue en el borde (edge) para analítica del aprendizaje en tiempo real: 13 características de entrada, salida probabilística, umbral de decisión declarado y una huella de 1 KB que cabe en cualquier dispositivo con Python. El entrenamiento se realizó sobre 96 clases sintéticas (4.704 ejemplos minuto a minuto) y la evaluación sobre 24 clases no vistas (1.176 ejemplos), con un ROC AUC declarado de 0,849 y un PR AUC de 0,282.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística sobre características estandarizadas (modelo lineal, no red neuronal) |
| Parámetros totales | No disponible (no se declara el recuento; los pesos ocupan ~1 KB en JSON y la entrada consta de 13 características) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es un vector de 13 características numéricas agregadas del histórico minuto a minuto, no una secuencia de tokens |
| Tipos de cuantización | No disponible / no aplica: pesos en JSON en punto flotante, sin esquemas de cuantización publicados |
| Idiomas soportados | en (inglés en documentación y en el texto libre de las preguntas del alumnado; el modelo opera sobre números) |
| Licencia | MIT |
| Formato de pesos | JSON (`model.json`); explícitamente sin pickle y sin framework de ML |
| Entrada | 13 números calculados a partir de la confusión minuto a minuto de la clase hasta el momento |
| Salida | Probabilidad entre 0 y 1, más un punto de corte de aviso recomendado de 0,15 |
| Tarea | Clasificación binaria tabular (pipeline: `tabular-classification`) |
| Biblioteca | scikit-learn (para entrenamiento; la inferencia no requiere dependencias) |
| Dependencias de inferencia | Ninguna (solo biblioteca estándar de Python) |
| Autor | nikhilsingh254 |
| Fecha de creación / actualización | 2026-09-24 / 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística clásica aplicada sobre características estandarizadas. En cada cierre de minuto se calculan 13 variables numéricas a partir del histórico de pulsaciones agregadas, se estandarizan y se combinan linealmente para producir una probabilidad de que el minuto siguiente alcance el umbral de alerta específico de esa clase. No hay capas ocultas, atención, mecanismos recurrentes ni estados internos. El autor destaca una decisión de ingeniería poco habitual: la inferencia se distribuye como un JSON de pesos más un script de ~30 líneas de Python sin dependencias, de modo que el modelo se puede embeber en un dispositivo de borde sin instalar scikit-learn ni NumPy y sin recurrir a pickle.

El entrenamiento utilizó exclusivamente datos sintéticos: 96 clases simuladas que generan 4.704 ejemplos a nivel de minuto. La evaluación se hizo sobre 24 clases que el modelo nunca vio, con 1.176 ejemplos. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por retroalimentación humana; tampoco se declara la composición detallada del generador sintético, el número de épocas, el esquema de regularización ni el procedimiento de búsqueda de hiperparámetros. La innovación reseñable no está en el algoritmo, sino en el planteamiento del problema (predicción una ventana por delante del umbral de alerta en lugar de detección del umbral ya cruzado) y en el formato de despliegue mínimo.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de que la tasa de confusión del minuto siguiente sea igual o superior al umbral de alerta de la clase.
- Predicción anticipada de una ventana: trabaja sobre la acumulación progresiva de confusión de los minutos previos, que es la señal que precede al cruce del umbral.
- Salida probabilística calibrable: devuelve un valor entre 0 y 1 junto con un punto de corte recomendado de 0,15, ajustable por el responsable de la implantación.
- Inferencia sin dependencias: ejecutable con la biblioteca estándar de Python, apta para dispositivos de borde y hardware muy limitado.
- Portabilidad de formato: al ser una combinación lineal con pesos en JSON, es reimplementable en cualquier lenguaje sin toolchain de ML.
- Operación en tiempo real: el coste computacional corresponde a 13 operaciones aritméticas y una función logística por minuto y clase.
- Integración con la infraestructura Live Confusion Tracker: consume las mismas métricas de pulsaciones que el sistema de alerta existente.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no; el modelo es numérico y la documentación está en inglés.
- Capacidades especiales (modo thinking, visión, audio, generación de texto): ninguna.

## Casos de uso

- Aviso temprano en el reloj del docente durante una clase magistral: al cierre de cada minuto el modelo evalúa la probabilidad de cruce del umbral y, si supera 0,15, cambia un color en la esfera del reloj en lugar de vibrar; el profesor puede reformular sin interrumpir el ritmo de la sesión.
- Ajuste dinámico del ritmo expositivo: en un tema con acumulación sostenida de confusión durante tres o cuatro minutos, el aviso permite insertar un ejemplo adicional o una pausa de preguntas antes de que la alerta formal se dispare y con ella la pérdida efectiva de una parte del aula.
- Paneles para ayudantes y personal de apoyo: los avisos agregados por clase permiten dirigir a un asistente hacia el grupo o el bloque temático con mayor probabilidad de conflicto cognitivo, usando la probabilidad como criterio de priorización.
- Analítica post-clase y mejora docente: al registrar las probabilidades minuto a minuto se obtiene una traza de los puntos del temario donde la confusión se construye, información utilizable en la revisión del material y en la formación del profesorado.
- Integración en plataformas de gestión del aprendizaje para sesiones síncronas o seminarios en línea: el modelo consume las pulsaciones ya agregadas por minuto, por lo que puede ejecutarse en el servidor de la plataforma y notificar al docente dentro del mismo flujo de videoconferencia.
- Implantación en borde con requisitos mínimos: al no tener dependencias ni necesidad de GPU, el modelo puede desplegarse en el propio dispositivo del docente, en una Raspberry Pi o en un servicio interno sin infraestructura de inferencia especializada.
- Investigación en analítica del aprendizaje: la separación explícita entre umbral de alerta y punto de corte de aviso permite estudiar experimentalmente el compromiso entre falsos positivos y detección temprana con métricas reproducibles (ROC AUC, PR AUC, precisión y exhaustividad).
- Validación previa a despliegues mayores: por su coste marginal nulo, sirve como línea base obligada frente a la que comparar modelos temporales más complejos (por ejemplo, secuenciales sobre la misma señal de pulsaciones).

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Todas las métricas figuran como `verified: false`, es decir, no verificadas de forma independiente. La evaluación se realizó sobre 24 clases no vistas (1.176 ejemplos a nivel de minuto) del conjunto Live Confusion Tracker (sintético).

| Métrica | Valor | Condición |
|---|---|---|
| ROC AUC | 0,849 | 24 clases reservadas |
| PR AUC (average precision) | 0,282 | 24 clases reservadas |
| Precisión | 0,281 | punto de corte 0,15 |
| Exhaustividad (recall) | 0,429 | punto de corte 0,15 |
| F1 | 0,34 | punto de corte 0,15 |
| Avisos emitidos un minuto antes de alertas reales | 36 % | según la model card |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; no requiere acelerador gráfico.
- GPU recomendadas: ninguna. El cálculo es una combinación lineal de 13 términos más una función logística.
- Compatibilidad con GPU de consumo: no aplica; funciona igualmente en CPU de un solo núcleo, microcontroladores con intérprete de Python o el propio dispositivo del docente.
- Opciones de despliegue: script de Python con la biblioteca estándar (opción documentada por el autor); reimplementación directa de los pesos JSON en cualquier lenguaje; inclusión como función dentro del servicio del Live Confusion Tracker. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible (no se publican medidas). El coste por inferencia es el de 13 multiplicaciones, 13 sumas y una sigmoide, ejecutado una vez por minuto y por clase.
- Memoria en disco: ~1 KB de pesos, más el código de inferencia de aproximadamente 30 líneas.

## Comparativa con modelos similares

No se han proporcionado datos comparativos con otros modelos en la información disponible. La comparación que sigue es cualitativa y se limita a la categoría y a los requisitos de despliegue; las celdas de rendimiento se marcan como no disponibles para no introducir cifras no respaldadas.

| Modelo | Categoría | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| live-confusion-early-warning | Regresión logística tabular | No disponible (~1 KB de pesos) | 13 características por minuto | ROC AUC 0,849; PR AUC 0,282 | MIT | HuggingFace (0 descargas); código en GitHub |
| Regresión logística de referencia sobre las mismas 13 características | Lineal tabular | No disponible | Igual | No disponible | No disponible | No disponible |
| Gradient boosting (XGBoost / LightGBM) sobre las mismas características | Conjunto de árboles | No disponible | Igual | No disponible | No disponible | No disponible |
| Modelo secuencial temporal (LSTM o transformer) sobre la serie de pulsaciones | Red neuronal recurrente o de atención | No disponible | Serie completa de minutos | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: los 96 escenarios de entrenamiento y las 24 clases de evaluación provienen de un generador, no de aulas reales; el comportamiento ante distribuciones reales de pulsaciones, curso, tamaño de aula y cultura de participación es desconocido.
- Métricas no verificadas: los cinco valores del `model-index` están marcados como `verified: false`; no hay evaluación por terceros.
- Desequilibrio de clases y precisión baja: un PR AUC de 0,282 y una precisión de 0,281 con punto de corte 0,15 implican que una mayoría de los avisos serán falsos positivos. El coste asumible es bajo (un cambio de color) siempre que no se transforme en una alerta adicional.
- Riesgo de fatiga de avisos: si el punto de corte se baja o se mantiene demasiado tiempo, el docente puede acabar ignorando el indicador, lo que anularía el beneficio del aviso temprano.
- Dependencia de la infraestructura Live Confusion Tracker: el modelo no observa el aula directamente; necesita que exista el botón silencioso de «estoy perdido» y que las pulsaciones se agreguen por minuto. Sin esa señal no hay entrada.
- Sensibilidad al umbral por clase: la alerta se define contra el umbral específico de cada clase (habitualmente 8-12 %), y el autor no documenta cómo se calibra ni qué ocurre cuando el umbral cambia durante el curso.
- Supervisión no verificada: la métrica de rendimiento depende de la tasa de pulsación, que puede no reflejar confusión real y es manipulable por el alumnado (pulsos estratégicos o ausencia de pulsos por inhibición social).
- Privacidad y ética: aunque las pulsaciones son silenciosas y agregadas, siguen constituyendo datos de comportamiento del alumnado; su tratamiento requiere base legal, información transparente y controles de agregación.
- Idioma: la documentación y el texto libre asociado están en inglés; no se declara soporte para otros idiomas.
- Licencia: MIT permite uso comercial, modificación y redistribución con atribución y sin garantía; no hay cláusulas de restricción de uso, pero tampoco responsabilidad del autor por decisiones docentes basadas en el aviso.
- Trazabilidad del modelo: 0 descargas y 0 likes en el momento de redactar la ficha; el artefacto es de publicación muy reciente y sin adopción documentada.
- Sesgos conocidos: no se documentan análisis de sesgo, ni por tipo de estudiantado, ni por tamaño de aula, ni por disciplina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikhilsingh254/live-confusion-early-warning
- Conjunto de datos asociado: https://huggingface.co/datasets/nikhilsingh254/live-confusion-tracker
- Código fuente: https://github.com/nikhilsingh-254/live-confusion-tracker
- Pesos: https://huggingface.co/nikhilsingh254/live-confusion-early-warning/blob/main/model.json
- Inferencia: https://huggingface.co/nikhilsingh254/live-confusion-early-warning/blob/main/predict.py
- Cálculo de características: https://huggingface.co/nikhilsingh254/live-confusion-early-warning/blob/main/features.py
- Entrenamiento: https://huggingface.co/nikhilsingh254/live-confusion-early-warning/blob/main/train.py
- Análisis: https://huggingface.co/nikhilsingh254/live-confusion-early-warning/blob/main/analysis.py
- Métricas: https://huggingface.co/nikhilsingh254/live-confusion-early-warning/blob/main/metrics.json
- Nota sobre la búsqueda web: los resultados devueltos (perfil de Google Scholar de un Nikhil Singh en Dartmouth College y artículos arXiv sobre sepsis, brotes epidémicos y vigilancia respiratoria) no guardan relación con este modelo ni con su autor, por lo que no se incluyen como enlaces relevantes. No se ha encontrado paper, blog o demo adicional asociado a este artefacto.
