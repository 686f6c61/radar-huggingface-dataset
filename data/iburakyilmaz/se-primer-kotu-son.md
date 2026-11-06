# iburakyilmaz/se-primer-kotu-son

## Resumen

SE Primer v2 es un modelo de clasificación tabular entrenado con scikit-learn que predice la probabilidad de que un jugador termine la partida del juego educativo SE Primer con un "mal final" (violación de datos o situación fuera de control). SE Primer es un juego de crisis y toma de decisiones por teléfono dirigido a ingenieros de software; el modelo actúa como componente interno del "Director de Escenas", ajustando la presentación de la siguiente escena según la probabilidad estimada (p ≥ 0,6 = Apoyo, p < 0,3 = Presión, intermedio = Normal). No es un modelo de lenguaje ni un transformer: es un pipeline clásico de `StandardScaler` seguido de `LogisticRegression` con `class_weight='balanced'`.

El modelo resuelve un problema muy acotado de diseño de juego adaptativo: estimar el riesgo de fracaso del jugador a partir de 11 características numéricas y binarias (nivel, rol, número de decisión, tiempo de decisión, búsquedas en consola, logs relevantes encontrados, acumulados de términos, tutor, insistencia, decisiones problemáticas y tiempo restante). Su relevancia no reside en capacidades generales, sino en la transparencia metodológica de su publicación: el autor documenta un proceso de validación con umbrales pre-registrados, un fallo inicial del umbral y una revisión posterior del mismo, además de las limitaciones del dataset.

El conjunto de datos es muy reducido: 898 filas (una por decisión), de las cuales solo 95 son reales (20 sesiones) y el resto sintéticas (150 sesiones generadas por reglas). El rendimiento medido con validación cruzada agrupada por sesión alcanza un ROC-AUC de 0,747 sobre las filas reales, con un intervalo de confianza del 95 % de [0,518, 0,923]. El modelo se distribuye en formato ONNX y está pensado exclusivamente para uso dentro del juego, no para evaluación de personas ni para intervención en incidentes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler → LogisticRegression (class_weight='balanced'), semilla 2026 |
| Parametros totales | 11 coeficientes + 11 medias y 11 desviaciones estándar del escalador (no disponible el recuento exacto de parámetros serializados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; entrada fija de 11 características) |
| Tipos de cuantizacion | No disponible (exportación ONNX en float32) |
| Idiomas soportados | No disponible (no procesa texto; las etiquetas de características están en turco) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`); pipeline sklearn original en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal binario sobre características estandarizadas. La entrada `input` es un tensor float32 de forma `[n, 11]` y la salida `probabilities` es float32 de forma `[n, 2]`, donde la clase 1 corresponde al mal final. Las 11 características incluyen variables binarias (`seviye`, `rol`), contadores de la escena (`karar_no`, `konsol_arama`, `bulunan_anlamli`), acumulados de sesión (`terim_toplam`, `tutor_toplam`, `israr_toplam`, `sorunlu_karar_toplam`) y temporales (`karar_suresi_sn`, `kalan_sure_dk`). Los coeficientes estandarizados con mayor peso son `sorunlu_karar_toplam` (+2,944) y `karar_no` (−1,972), seguidos de `kalan_sure_dk` (−0,611) y `seviye` (+0,437).

El entrenamiento usa 898 filas: 95 reales procedentes de 20 sesiones (7 con mal final y 13 con buen final, 20 de ellas jugadas por el propio desarrollador) y 803 sintéticas de 150 sesiones generadas mediante reglas documentadas en `data/SOZLUK.md`. La validación es un GroupKFold de 5 pliegues agrupado por sesión; el entrenamiento mezcla datos reales y sintéticos, pero la métrica se calcula únicamente sobre las predicciones fuera de pliegue de las filas reales. El entorno de entrenamiento declarado es Python 3.13.17, scikit-learn 1.9.1 y skl2onnx 1.20.0. No se menciona RLHF, DPO ni ningún proceso de ajuste por preferencias; tampoco innovaciones como decodificación especulativa o atención lineal, por no tratarse de un modelo generativo. El autor documenta explícitamente una revisión del umbral de aceptación (de ROC-AUC ≥ 0,75 a ≥ 0,70 más un límite inferior del intervalo de confianza > 0,50) realizada después de observar los resultados, sin ocultarlo.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de mal final a partir de 11 características numéricas y binarias.
- Salida de probabilidades calibradas por un modelo logístico, adecuada para umbrales de decisión configurables (0,6 y 0,3 en el juego).
- Integración como componente de decisión del "Director de Escenas": no modifica indicadores, reglas ni finales, y no puntúa al jugador.
- Exportación ONNX con paridad numérica verificada frente a scikit-learn (diferencia máxima de 1,5e-07, umbral ≤ 1e-04).
- Ejecución ligera en CPU, sin requisitos de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Ajuste adaptativo de dificultad en el juego SE Primer: el Director de Escenas consulta la probabilidad tras cada decisión y selecciona la presentación de la siguiente escena (Apoyo si p ≥ 0,6, Presión si p < 0,3, Normal en el resto). Es adecuado porque la latencia de un modelo logístico es despreciable y la salida es directamente un umbral de diseño.
- Telemetría de sesiones educativas: registrar la probabilidad estimada por decisión para analizar qué patrones (decisiones problemáticas acumuladas, tiempo restante) preceden a un mal final, sin puntuar a los jugadores.
- Investigación sobre juegos serios: servir como línea base reproducible (pipeline, semilla, hash del dataset SHA-256 `7456249619df0e1aef555d7eb2ac7fe6578ca96148d022cb1a618b998a18eb85`) para comparar futuros modelos de riesgo en el mismo escenario.
- Docencia de machine learning aplicado: ejemplo completo de pre-registro de umbrales, validación agrupada por sesión, comparación con una línea base (tiempo restante, ROC-AUC 0,575 frente a 0,747) y exportación ONNX con verificación de paridad.
- Despliegue embebido en el cliente del juego: al ser un ONNX de un modelo lineal, puede ejecutarse con onnxruntime en dispositivos modestos sin backend de inferencia dedicado.
- Modo sombra durante la recogida de datos: el autor indica que en fase de recolección el modelo opera solo como observador para evitar bucles de retroalimentación; este uso permite validar el sistema antes de activarlo.
- Prototipado de sistemas de decisión con retroalimentación: aunque limitado al dominio del juego, ilustra cómo separar la predicción (modelo) de la política de intervención (umbrales del Director de Escenas).

## Benchmarks y rendimiento

| Metrica | Resultado | Umbral o referencia |
|---|---|---|
| ROC-AUC (filas reales, GroupKFold 5 por sesión) | 0,747 | ≥ 0,70 (umbral revisado); el original de 0,75 no se alcanzó |
| IC 95 % de ROC-AUC (bootstrap por sesión) | [0,518, 0,923] | Límite inferior > 0,50 |
| Diferencia frente a la línea base de tiempo restante | +0,172 (base 0,575) | ≥ +0,03 |
| Sensibilidad a mal final (p ≥ 0,6) | 0,730 | ≥ 0,60 |
| Diferencia máxima ONNX ↔ sklearn | 1,5e-07 | ≤ 1e-04 |
| Accuracy (informativo) | 0,705 | Base de clase mayoritaria 0,611 |
| Brier score (informativo) | 0,221 | No disponible como umbral |

Historial de validación documentado por el autor: candidato 1 con 15 sesiones reales, ROC-AUC 0,692 (rechazado); candidato 2 con generador sintético recalibrado, 0,661 (rechazado y generador revertido); candidato 3 con 20 sesiones reales, 0,747 (rechazado por 0,003 frente al umbral original). Tras la revisión del umbral a 0,70 más el criterio de intervalo de confianza, se publicó este modelo. No hay comparación con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo es un pipeline lineal exportado a ONNX en float32 con una entrada de 11 valores.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; onnxruntime en CPU cubre la inferencia.
- GPU de consumo: irrelevante; el modelo cabe en cualquier entorno, incluido un dispositivo móvil o un navegador con onnxruntime-web.
- Opciones de despliegue: onnxruntime (recomendado por el formato publicado), scikit-learn si se reconstruye el pipeline, o cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (11 características, regresión logística), se espera un coste computacional mínimo, pero no se aportan cifras medidas.
- Descarga: el autor indica consumir el modelo desde una URL fijada a un commit (`/resolve/<commit>/model.onnx`), no desde la rama `main`.

## Comparativa con modelos similares

No se han proporcionado alternativas comparables en la información disponible. Como referencia interna, el propio autor compara el modelo con una línea base trivial basada en el tiempo restante (ROC-AUC 0,575) y con la predicción de la clase mayoritaria (accuracy 0,611), frente a las cuales el modelo mejora (0,747 y 0,705 respectivamente), aunque con un intervalo de confianza amplio.

| Modelo | Tipo | ROC-AUC | Accuracy | Licencia |
|---|---|---|---|---|
| SE Primer v2 | Regresión logística + escalado | 0,747 | 0,705 | MIT |
| Línea base tiempo restante | Regla simple | 0,575 | No disponible | No aplica |
| Clase mayoritaria | Regla trivial | No aplica | 0,611 | No aplica |

## Limitaciones y advertencias

- Entrenado con un único escenario ("Sabah Randevu Krizi"); es inválido para cualquier otro evento del juego o fuera de él.
- Dataset real muy pequeño (20 sesiones, 95 filas) y recogido por el propio desarrollador, que conocía el escenario; la diversidad de jugadores es limitada y el modelo no representa a estudiantes de ingeniería del software.
- Las primeras 4 sesiones se jugaron antes de añadir una cuarta opción a cada escena, lo que introduce heterogeneidad en los datos.
- El intervalo de confianza del ROC-AUC es amplio ([0,518, 0,923]); las métricas puntuales deben interpretarse con cautela.
- La etiqueta es el final de la sesión, por lo que la incertidumbre en decisiones tempranas es alta.
- Parte del modelo puede haber aprendido supuestos del generador sintético basado en reglas; por eso la evaluación se restringe a filas reales.
- Riesgo de bucle de retroalimentación: el modelo puede aprender el efecto de sus propias decisiones; en modo de recogida de datos solo debe operar en sombra.
- Uso prohibido explícito: evaluar la capacidad, calificaciones o idoneidad laboral de una persona; servir como apoyo a decisiones en una intervención real de incidentes; aplicarse a datos ajenos al juego.
- No hay información sobre sesgos demográficos porque no se recogen datos personales (identificador de sesión aleatorio; sin nombre, correo, dispositivo, ubicación ni texto libre).
- Licencia MIT: permite uso comercial y modificación, pero el alcance práctico del modelo queda limitado por las restricciones de dominio anteriores.
- El umbral de aceptación se revisó después de ver los resultados; el autor lo declara, pero conviene tenerlo en cuenta al interpretar el 0,747.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iburakyilmaz/se-primer-kotu-son
- Descarga fijada a commit (patrón indicado por el autor): https://huggingface.co/iburakyilmaz/se-primer-kotu-son/resolve/<commit>/model.onnx
- Referencia citada para el umbral de 0,70: Hosmer y Lemeshow (2000), guía sobre la bondad de ajuste en regresión logística (no se proporciona URL en la información disponible).
- Documentos internos citados en la model card, sin URL pública en la información disponible: `RELEASE.md`, `spec.md` §13.4 y §13.4.1, `data/SOZLUK.md`.
