# Kubra37/se-primer-zorluk

## Resumen

SE Primer v2 — zorluk modeli es un modelo de clasificación tabular muy ligero publicado por el usuario Kubra37 en Hugging Face. No es un modelo de lenguaje: se trata de un `Pipeline` de scikit-learn compuesto por un `StandardScaler` seguido de una `LogisticRegression` (seed 13), exportado también a ONNX. Su función dentro del sistema SE Primer es estimar la probabilidad `p(basari)` de que un estudiante responda con bajo riesgo una pregunta difícil de un tema concreto, y decidir así si la siguiente pregunta (la 1.ª o la 3.ª del flujo) debe ser fácil o difícil, con un umbral de 0.5.

El modelo consume siete variables numéricas conocidas antes de mostrar la pregunta (nivel del estudiante, puntuación de habilidad en el tema, número previo de preguntas y de elecciones de riesgo en ese tema, tiempo de decisión y longitud de la justificación de la pregunta anterior, y número de sesión). No procesa texto ni imágenes, y el autor advierte explícitamente que no debe usarse para calificar, ordenar o evaluar al estudiante.

La relevancia de esta ficha es limitada y muy acotada: es un artefacto educativo de un sistema propietario (SE Primer), entrenado con 418 filas de las que solo 26 son reales (7 jugadores) y 392 sintéticas generadas por un script con seed 13. Su rendimiento en validación cruzada agrupada por jugador es modesto (ROC-AUC medio 0.7693, con una caída hasta 0.6225 en el pliegue 5) y el propio autor reconoce que los coeficientes reflejan mayoritariamente las reglas del generador sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline sklearn: `StandardScaler` → `LogisticRegression` (regresión logística binaria) |
| Parametros totales | 7 coeficientes + 1 intercept (intercept = -0.0840); no disponible el recuento exacto en la información |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada fija de 7 características) |
| Tipos de cuantizacion | no disponible (se publica `model.onnx` en float32) |
| Idiomas soportados | no disponible (los nombres de las características están en turco; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | sklearn (serialización de la librería) y `model.onnx` (ONNX, entrada `input` float32 `[n, 7]`, salidas `label` y `probabilities`) |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística binaria precedida de estandarización de características. La entrada es un vector de 7 dimensiones con orden fijo: `seviye` (nivel: 0 = principiante, 1 = algo de experiencia, 2 = experimentado), `konu_beceri_puani` (puntuación de habilidad en el tema, 0–5), `konudaki_onceki_soru_sayisi` (preguntas previas en el tema), `konudaki_onceki_riskli_sayisi` (elecciones de riesgo medio/alto previas en el tema), `son_karar_suresi_sn` (tiempo de decisión en la pregunta anterior, en segundos), `son_gerekce_uzunlugu` (longitud de la justificación anterior, en caracteres) y `oturum_no` (número de sesión). Todas ellas se conocen antes de mostrar la pregunta; la respuesta, el tiempo o la justificación de la pregunta actual no son entradas.

El conjunto de entrenamiento contiene solo filas de dificultad alta: 418 filas y 52 grupos (`proje_id`), de las cuales 26 son reales (7 jugadores; 5 con `basari = 0` y 21 con `basari = 1`) y 392 sintéticas (45 jugadores falsos generados con `scripts/sentetik.py`, seed 13). El etiqueta `basari` vale 1 cuando en la pregunta difícil se elige la opción de bajo riesgo. La validación se hizo con `StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=13)` agrupando por `proje_id`, de modo que un mismo jugador nunca aparece a la vez en entrenamiento y test. El modelo publicado no es ninguno de los modelos de los pliegues, sino uno reentrenado con todos los datos (spec §10.6). La concordancia ONNX ↔ sklearn tiene un error máximo de 8.3e-08, por debajo del límite de 1e-4.

Los coeficientes (sobre entradas escaladas) son: `seviye` +0.1999, `konu_beceri_puani` +0.7239, `konudaki_onceki_soru_sayisi` +0.1219, `konudaki_onceki_riskli_sayisi` -0.7480, `son_karar_suresi_sn` -0.1640, `son_gerekce_uzunlugu` +0.3580 y `oturum_no` +0.0251. El autor advierte que estos coeficientes reflejan en gran medida la regla del generador sintético y no deben interpretarse como relaciones causales; en particular, el coeficiente de `son_karar_suresi_sn` no debe interpretarse, porque su efecto en la fórmula sintética es positivo y débil (media 0.066 logit, cero en 173 de las 392 filas sintéticas) y solo se vuelve negativo al añadir los datos reales (de -0.1081 a -0.1640).

## Capacidades

- Clasificación binaria tabular: estima `p(basari = 1)` a partir de 7 características numéricas.
- Decisión de dificultad con umbral fijo: `p >= 0.5` implica pregunta difícil; en caso contrario, fácil (spec §10.3). Solo interviene en la 1.ª y la 3.ª pregunta del flujo; no toca la 2.ª.
- Exportación a ONNX con salidas `label` y `probabilities` (`[n, 2]`, columna 1 = `p(basari = 1)`), apta para inferencia en runtime ONNX.
- Interpretabilidad directa mediante coeficientes log-odds sobre entradas estandarizadas (con las cautelas del autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.
- No tiene capacidades multilingües en el sentido habitual; los identificadores de características están en turco, pero el modelo no procesa lenguaje natural.

## Casos de uso

- Selección adaptativa de dificultad en SE Primer: dado el estado del estudiante en un tema, el modelo decide si la 1.ª o la 3.ª pregunta debe ser fácil o difícil aplicando el umbral 0.5 sobre `p(basari)`.
- Motor de reglas embebido en el backend de la aplicación: al ser un pipeline sklearn/ONNX de 7 entradas, se puede cargar en memoria y evaluar con latencia de microsegundos por petición, sin GPU.
- Ajuste de la curva de dificultad por tema: usando `konu_beceri_puani` (coeficiente +0.7239) y `konudaki_onceki_riskli_sayisi` (-0.7480), el sistema puede endurecer o suavizar las preguntas según el historial del estudiante en ese tema concreto.
- Análisis pedagógico agregado: los coeficientes permiten estudiar qué señales de comportamiento (tiempo de decisión, longitud de la justificación) se asocian con respuestas de bajo riesgo, siempre con la advertencia de que la asociación está contaminada por el generador sintético.
- Servicio de inferencia ONNX en producción: el archivo `model.onnx` puede desplegarse con ONNX Runtime en un contenedor ligero para servir predicciones a la app cliente.
- Prototipado educativo: útil como ejemplo didáctico de pipeline `StandardScaler` + `LogisticRegression`, validación agrupada con `StratifiedGroupKFold` y verificación de paridad ONNX/sklearn en un caso real de tamaño reducido.
- Integración en pipelines de evaluación con datos tabulares: como paso previo a la selección de ítems en un sistema de tests adaptativos, condicionado a que el banco de preguntas sea el de SE Primer.

## Benchmarks y rendimiento

Datos de validación cruzada agrupada por `proje_id` (5 pliegues) publicados por el autor:

| Metrica | Valor |
|---|---|
| ROC-AUC media 5 pliegues (puerta) | 0.7693 (umbral 0.65 → superado) |
| Desviación estándar del AUC | 0.0738 |
| AUC out-of-fold solo con filas reales (informativo) | 0.6 |

| Pliegue | Filas test | Grupos test | Filas reales test | Clase 0 / 1 | AUC |
|---|---|---|---|---|---|
| 1 | 85 | 9 | 0 | 43 / 42 | 0.7962 |
| 2 | 83 | 11 | 13 | 42 / 41 | 0.804 |
| 3 | 81 | 10 | 8 | 42 / 39 | 0.8181 |
| 4 | 87 | 12 | 0 | 46 / 41 | 0.8059 |
| 5 | 82 | 10 | 5 | 41 / 41 | 0.6225 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible; no aplican a un modelo tabular de este tipo. No hay comparación con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo es una regresión logística de 7 entradas y cabe en CPU. El archivo ONNX ocupa del orden de kilobytes (tamaño del repo reportado: 0.0 GB).
- GPU recomendadas: no requiere GPU; cualquier CPU sirve. Si se desea, puede ejecutarse en GPU mediante ONNX Runtime, sin beneficio práctico.
- Cabe en cualquier GPU de consumo y en entornos sin GPU (Raspberry Pi, contenedores de funciones serverless).
- Opciones de despliegue: ONNX Runtime (recomendado por la exportación incluida), scikit-learn en proceso Python, o serialización del pipeline en un servicio HTTP ligero. No aplican vLLM, llama.cpp, Ollama ni TGI, que están pensados para modelos generativos.
- Latencia y throughput estimados: no publicados en la información disponible; por la naturaleza del modelo, la latencia por muestra es de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No disponible. La model card no incluye comparación con otros modelos, y no se han identificado en la información proporcionada modelos tabulares comparables de la misma familia o propósito. Como referencia estructural, cualquier clasificador tabular binario (regresión logística, gradient boosting, random forest) con 7 características de entrada sería una alternativa metodológica, pero no hay datos de rendimiento de terceros en la información disponible para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Prohibición de uso explícita: el modelo no debe emplearse para calificar, ordenar ni evaluar al estudiante; su salida es una probabilidad para ajustar la dificultad de la siguiente pregunta, no una medida de éxito.
- No validado fuera de SE Primer: no se ha comprobado en otro banco de preguntas ni en otra población de estudiantes.
- Datos dominados por sintéticos: de 418 filas de entrenamiento, solo 26 son reales (7 jugadores); los coeficientes reflejan en gran medida la regla del generador sintético y no deben leerse como causales.
- Rendimiento inestable: el AUC cae a 0.6225 en el pliegue 5 y el AUC out-of-fold con solo filas reales es 0.6, lo que indica escasa capacidad de generalización a estudiantes reales.
- El coeficiente de `son_karar_suresi_sn` no es interpretable según el autor: su efecto en el generador sintético es positivo y débil, y solo se vuelve negativo al añadir los datos reales; con este volumen de datos no se distingue del ruido.
- Sesgos conocidos: no documentados explícitamente, pero la composición del dataset (mayoría de filas sintéticas y de etiquetas positivas: 21 de 26 reales con `basari = 1`) puede sesgar las predicciones hacia la clase positiva.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones mal calibradas fuera de la distribución de entrenamiento (por ejemplo, valores atípicos en tiempo de decisión o longitud de justificación).
- Limitaciones de idioma: no aplica, el modelo no procesa texto; los identificadores están en turco.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Ausencia de privacidad documentada más allá de la declaración del autor: la model card indica que no se guardan datos personales (nombre, correo, dispositivo, ubicación, texto libre), con detalles en `data/SOZLUK.md`, pero ese archivo no se ha podido verificar en la información disponible.
- Fecha de creación futura (2026-11-04): la model card indica fechas que no se corresponden con el momento de redacción; conviene verificar la vigencia del artefacto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kubra37/se-primer-zorluk
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
