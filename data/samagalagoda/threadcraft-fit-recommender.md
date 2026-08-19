# SamaGalagoda/threadcraft-fit-recommender

## Resumen

ThreadCraft Fit Recommender es un clasificador de aprendizaje automático desarrollado por SamaGalagoda como parte de un proyecto de fin de grado en Ingeniería del Software. El modelo predice si una talla de prenda quedará pequeña, ajustada o grande para un cliente dado, basándose en sus medidas corporales y características de la prenda. Está diseñado para integrarse en ThreadCraft, una plataforma de diseño y pedido de ropa a medida asistida por IA.

El modelo emplea un `HistGradientBoostingClassifier` de scikit-learn (versión 1.6.1) entrenado sobre un conjunto de datos de transacciones de alquiler de ropa, predominantemente vestidos y trajes de ceremonia en Estados Unidos. Su propósito declarado es servir como asesor de riesgo de ajuste dentro de un flujo de pedido a medida, no como sustituto de la toma de medidas. La relevancia actual radica en abordar un problema práctico de comercio electrónico: reducir devoluciones por talla incorrecta mediante recomendaciones basadas en datos, aunque con un rendimiento modesto que obliga a tratarlo como una herramienta de apoyo y no como una fuente autoritativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingClassifier (scikit-learn) |
| Parametros totales | no disponible (modelo de boosting, sin parametros de red neuronal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto secuencial) |
| Tipos de cuantizacion | no aplica (modelo de arboles, no requiere cuantizacion) |
| Idiomas soportados | no disponible (el modelo trabaja con datos numericos y categoricos, no con texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | joblib (archivo `fit_recommender.joblib`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de gradient boosting basado en histogramas, implementado con `HistGradientBoostingClassifier` de scikit-learn. Utiliza 142 iteraciones de boosting con early stopping (paciencia 25), una tasa de aprendizaje de 0.08 y un máximo de 31 nodos hoja. Se aplicó una ponderación de clases de tipo raíz cuadrada (`sqrt`), seleccionada tras comparar varias configuraciones: sin ponderación, ponderación raíz y ponderación balanceada. La configuración `sqrt` ofrecía el mejor equilibrio entre accuracy y macro F1.

El entrenamiento se realizó sobre un conjunto de datos dividido en train (153.972 muestras), validación (19.246) y test (19.247). Las características incluyen `height_cm`, `weight_kg`, `bmi`, `bust_band`, `bust_cup`, `age`, `size`, `body_type`, `category` y `rented_for`. Los valores numéricos faltantes se manejan de forma nativa por el modelo, sin imputación, para no fabricar medidas corporales. Se excluyeron deliberadamente variables como `rating`, `review_text` y `review_summary` por estar registradas después del uso de la prenda (fuga de datos), así como `user_id` e `item_id`.

## Capacidades

- Clasificación de ajuste en tres clases: `small`, `fit`, `large`.
- Predicción de probabilidades por clase (`predict_proba`), lo que permite seleccionar la talla con mayor probabilidad de ajuste.
- Manejo nativo de valores numéricos faltantes.
- Codificación de variables categóricas mediante un encoder incluido en el artefacto.
- Integración sencilla en aplicaciones Python mediante `joblib` y `huggingface_hub`.
- Capacidad de recomendar una talla inicial barriendo tallas candidatas y eligiendo la de mayor `P(fit)`.
- No es un modelo generativo ni de lenguaje; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Asesor de talla en un flujo de pedido a medida: el modelo puede sugerir una talla inicial basada en las medidas del cliente, mostrándose como una recomendación superable y nunca como una orden definitiva.
- Reducción de devoluciones en plataformas de alquiler de ropa: al predecir el riesgo de que una talla quede pequeña o grande, se puede alertar al usuario antes de confirmar el pedido.
- Filtrado de catálogo en tiendas online: integrar el modelo para ordenar o filtrar prendas por probabilidad de ajuste según el perfil del cliente.
- Análisis de ajuste por categoría de prenda: el modelo identifica qué categorías (vestidos, etc.) tienen mayor riesgo de desajuste, útil para ajustar políticas de tallaje.
- Herramienta de soporte al cliente: los agentes pueden usar la predicción para recomendar tallas alternativas cuando un cliente reporta problemas de ajuste.
- Sistema de recomendación de talla en aplicaciones móviles de moda: el modelo puede ofrecer una talla sugerida en tiempo real a partir de las medidas introducidas por el usuario.

## Benchmarks y rendimiento

Resultados sobre la partición de test (n=19.247), comparados con la línea base de clase mayoritaria (siempre predecir `fit`):

| Metrica | Modelo | Linea base (mayoritaria) |
|---|---|---|
| Accuracy | 0.7140 | 0.7378 |
| Balanced accuracy | 0.3960 | 0.3333 |
| Macro F1 | 0.4051 | 0.2830 |
| Weighted F1 | 0.6623 | 0.6265 |

El macro F1 es un 43.1% relativo superior a la línea base. La precisión del recomendador (evaluada sobre 3.000 pedidos que el cliente reportó como ajustados) es modesta: coincidencia exacta de talla 0.036, dentro de ±1 talla 0.186, dentro de ±2 tallas 0.434. El autor advierte que el modelo debe usarse como punto de partida orientativo, no como talla autoritativa.

Se evaluaron también distintas configuraciones de ponderación de clases:

| Config | Accuracy | Balanced accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|---|
| baseline (siempre 'fit') | 0.7378 | 0.3333 | 0.2830 | 0.6265 |
| weighting = None | 0.7373 | 0.3409 | 0.3012 | 0.6331 |
| weighting = sqrt | 0.7140 | 0.3960 | 0.4051 | 0.6623 |
| weighting = balanced | 0.4001 | 0.4918 | 0.3684 | 0.4349 |

## Requisitos de hardware

- El modelo es un conjunto de árboles de decisión con boosting, de tamaño muy reducido (el repositorio ocupa 0.0 GB). No requiere GPU.
- Inferencia en CPU: tiempo de predicción del orden de milisegundos por muestra, incluso en lotes.
- Memoria RAM: menos de 100 MB para cargar el modelo y el encoder.
- Despliegue: se puede servir como microservicio con Flask/FastAPI, o integrarse directamente en aplicaciones Python. No requiere frameworks de inferencia especializados como vLLM o TGI.
- No hay latencia ni throughput estimados publicados, pero al ser un modelo tabular pequeño, la inferencia es prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de ajuste de talla basada en medidas corporales). La literatura mencionada por el autor (Misra et al., 2018) aborda factores latentes de prenda, pero no se proporcionan modelos concretos para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El predictor más fuerte del ajuste es la prenda específica, pero se excluye por diseño (al ser ropa a medida, no hay catálogo). Esto limita el rendimiento absoluto.
- Entrenado principalmente con transacciones de alquiler de vestidos y trajes de ceremonia (~70% de los datos) y una base de clientes mayoritariamente femenina de EE. UU. Aplicarlo a ropa masculina, pantalones o prendas del sur de Asia (kurtas, salwar kameez) es una extrapolación no recomendada.
- Las etiquetas de ajuste son auto-reportadas, por lo que incorporan preferencia subjetiva (algunas personas prefieren un ajuste holgado).
- Las medidas corporales también son auto-reportadas; el peso auto-reportado es conocido por tener sesgo.
- Las tallas son de alquiler estadounidense; el mapeo a especificaciones a medida se gestiona en la capa de aplicación.
- Aproximadamente el 16% de `weight_kg` y el 10% de `bust_band` faltan en los datos fuente; las predicciones para clientes con menos medidas son menos fiables.
- La precisión del recomendador es baja (coincidencia exacta del 3.6%), por lo que no debe presentarse como una talla autoritativa.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero debe revisarse el cumplimiento de la atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SamaGalagoda/threadcraft-fit-recommender
- Dataset utilizado: https://huggingface.co/datasets/SamaGalagoda/threadcraft-fit-cleaned
- Repositorio del proyecto ThreadCraft: https://github.com/Samandee-Galagoda/threadcraft
