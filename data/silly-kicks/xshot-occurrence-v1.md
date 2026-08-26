# silly-kicks/xshot-occurrence-v1

## Resumen

xShotOccurrence v1 (variante `sc_extended`) es un clasificador tabular determinista basado en XGBoost, desarrollado por el equipo de silly-kicks, una librería Python de analítica de fútbol orientada a la valoración objetiva de acciones de juego. El modelo estima la probabilidad de que el equipo en posesión intente un tiro dentro de aproximadamente un segundo de un frame de datos de tracking, generando una superficie xS (expected Shot) en coordenadas relativas a la portería.

Esta variante concreta se publica exclusivamente en Hugging Face por una restricción de licencia: está entrenada sobre 115 partidos, de los cuales 98 corresponden a datos propietarios de nivel "owner-tier" de SkillCorner que no pueden redistribuirse dentro del paquete PyPI. Solo se publican los parámetros aprendidos, sin datos de entrenamiento crudos. El modelo usa un extractor de 27 características fiel al paper de referencia (TF-16), con filtro de dominio en balón vivo y tercio de ataque, y fue entrenado sobre 964.263 filas con una tasa positiva del 18,9%.

La relevancia actual del modelo reside en que ofrece una estimación de propensión de tiro reproducible y auditada, con guardas de integridad en la carga (verificación SHA256 y huella de quiralidad), pensada para integrarse en pipelines de analítica de fútbol profesional. No obstante, el autor advierte explícitamente de que el brazo de tiro no ha sido medido con la sonda de sustitución de portero (TF-19), por lo que su validación es parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting de arboles), clasificador binario determinista |
| Parametros totales | no disponible (modelo de arboles, no se publica el numero de hojas/arboles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (se distribuye como pesos de XGBoost, no como pesos de red neuronal) |
| Idiomas soportados | en (etiquetas y documentacion en ingles; el modelo opera sobre datos numericos de tracking) |
| Licencia | MIT |
| Formato de pesos | serializacion de XGBoost (bracketed-string en v3.x), con SHA256SUMS y huella de quiralidad |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost determinista que consume un vector de 27 características extraídas de cada frame de tracking en coordenadas relativas a la portería. Las características incluyen la posición del balón en coordenadas polares (r, θ, z), su velocidad, un término de obstrucción de la boca de portería (`openGoal`), la distancia y orientación del portero, y las distancias a los 5 defensores y 5 atacantes más cercanos. El extractor es fiel al paper de la línea de investigación GKDV (TF-16) y usa la versión corregida de transformación goal-relative-2, que resuelve un defecto de quiralidad detectado en la versión anterior (ADR-051).

El entrenamiento se realizó sobre 964.263 filas con 182.517 ejemplos positivos (tasa positiva del 18,9%), procedentes de 115 partidos: 7 de IDSSE y 108 de SkillCorner, de los cuales 98 son de nivel owner-tier. El corpus corresponde íntegramente a la variante `sc_extended`, por lo que no existe comparación pareada contra la variante pública. La validación se hizo con 5 pliegues fuera de muestra (out-of-fold), superando los cuatro umbrales de aceptación definidos por el proyecto. No se aplicaron técnicas de RLHF ni DPO, al tratarse de un modelo supervisado clásico.

## Capacidades

- Predicción de probabilidad de ocurrencia de tiro en fútbol a partir de datos de tracking (coordenadas de jugadores y balón).
- Clasificación binaria determinista: dado un frame, devuelve P(tiro en ~1 s) para el equipo en posesión.
- Filtro de dominio integrado: solo evalúa frames de balón vivo en el tercio de ataque.
- Soporte de dos variantes adicionales: `default` (pública, incluida en el wheel de PyPI) y `sc_extended_position_only` (26 características, sin velocidad, para frames congelados de StatsBomb-360).
- Guardas de integridad en carga: verificación SHA256SUMS, huella de quiralidad (ADR-040) y protección del `base_score` frente a cambios de serialización entre XGBoost 2.x y 3.x.
- Integración con la librería silly-kicks mediante `from_variant()` y `from_hub()`.

## Casos de uso

- Analítica de rendimiento de equipos profesionales: integrar la superficie xS en informes post-partido para cuantificar la calidad de las ocasiones generadas por un equipo, usando datos de tracking de SkillCorner o IDSSE.
- Scouting de jugadores y porteros: evaluar la propensión de tiro concedida por un portero o defensa en situaciones de balón vivo en el tercio de ataque, comparando la xS esperada contra los goles reales.
- Entrenamiento táctico: identificar patrones de generación de tiro en el equipo rival a partir de secuencias de frames donde la xS supera un umbral, para preparar estrategias defensivas.
- Validación de modelos de valoración de acciones (VAEP/xT): usar la xS como componente de recompensa en pipelines de valoración de pases y regates, complementando la valoración de eventos con datos de tracking.
- Investigación en analítica de fútbol: reproducir o extender los experimentos del paper GKDV (TF-16) sobre la superficie xS, aprovechando que el modelo es determinista y con guardas de integridad.
- Desarrollo de dashboards de analítica en tiempo real: desplegar el modelo en servicios de inferencia sobre streams de tracking para alimentar visualizaciones de probabilidad de tiro durante retransmisiones o análisis en vivo.

## Benchmarks y rendimiento

La información disponible solo incluye métricas de validación cruzada interna (5 pliegues, out-of-fold) para la variante `sc_extended`:

| Metrica | Valor | Linea base |
|---|---|---|
| PR-AUC | 0,5851 (± 0,0436) | tasa base 0,1893 |
| Brier | 0,1131 | Brier de tasa base 0,1534 |
| Log loss | 0,3671 | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos de predicción de tiro en la información disponible. El autor indica que las estimaciones son de validación cruzada, no del ajuste final distribuido, y que el brazo de tiro no ha sido sometido a la sonda de sustitución de portero (TF-19), por lo que no existe medición de su comportamiento bajo esa intervención.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un XGBoost tabular de 27 características, por lo que la inferencia es de microsegundos por frame en cualquier CPU moderna. No requiere GPU.
- Memoria: el peso del modelo es de pocos megabytes (no se publica el tamaño exacto, pero es despreciable frente a modelos de deep learning).
- Despliegue: se integra mediante la librería silly-kicks (`pip install silly-kicks[xshot]`, versión >= 4.74.0). No requiere vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia: no se publican cifras oficiales, pero al ser un solo árbol de boosting con 27 features, la latencia por frame es del orden de microsegundos en CPU.
- Throughput: puede procesar streams de tracking de alta frecuencia (múltiples frames por segundo) sin cuello de botella en hardware convencional.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de predicción de ocurrencia de tiro con datos de tracking en la documentación proporcionada. Dentro de la propia familia silly-kicks, la comparativa es la siguiente:

| Variante | Corpus | Caracteristicas | Disponibilidad |
|---|---|---|---|
| `default` (publica) | 17 partidos (SkillCorner + IDSSE), redistribuible | 27 features (faithful) | Incluida en el wheel de PyPI |
| `sc_extended` (este modelo) | 115 partidos (98 owner-tier SkillCorner) | 27 features (faithful) | Solo Hugging Face |
| `sc_extended_position_only` | Mismo corpus de 115 partidos | 26 features (sin velocidad) | Repo separado en Hugging Face |

No se dispone de comparativas con modelos de terceros (por ejemplo, otros xG basados en tracking) en la información disponible.

## Limitaciones y advertencias

- No es el modelo incluido por defecto en la librería: la variante `sc_extended` se distribuye solo en Hugging Face por restricciones de licencia sobre datos owner-tier de SkillCorner; no puede redistribuirse dentro del paquete PyPI.
- Confundimiento de club/estilo: los 98 partidos adicionales owner-tier pertenecen a un único club, por lo que el modelo puede estar sesgado hacia el estilo de juego de ese equipo. Este efecto no está cuantificado.
- Sin medición del brazo de tiro bajo sustitución de portero: la sonda TF-19 no se ha ejecutado contra este modelo, por lo que su comportamiento ante esa intervención es desconocido y no debe asumirse como validado.
- Requisito de versión estricto: se necesita silly-kicks >= 4.74.0; versiones anteriores rechazan los pesos con un `IntegrityError` debido al cambio de transformación geométrica (goal-relative-2). `from_hub()` no acepta un argumento `revision`, por lo que la versión de la librería actúa como pin.
- Sesgo de dominio: el modelo solo evalúa frames de balón vivo en el tercio de ataque; no es aplicable a otras zonas del campo ni a balón parado.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero como todo modelo estadístico puede producir probabilidades mal calibradas en escenarios fuera de la distribución de entrenamiento (por ejemplo, estilos de juego muy diferentes al club dominante en el corpus).
- Idioma: la documentación y las etiquetas están en inglés; no hay soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silly-kicks/xshot-occurrence-v1
- Organización silly-kicks en Hugging Face: https://huggingface.co/silly-kicks
- Repositorio GitHub (silly-kicks): https://github.com/karsten-s-nielsen/silly-kicks
- Paquete en PyPI: https://pypi.org/project/silly-kicks/
- Página del paquete en Libraries.io: https://libraries.io/pypi/silly-kicks
- Paper de referencia (GKDV, TF-16): arxiv:2512.00203 (mencionado en las etiquetas del modelo)
