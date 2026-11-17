# myousaf6/freight-rate-model

## Resumen

El modelo `myousaf6/freight-rate-model` es un modelo de regresión tabular para predecir la tarifa publicada de un envío de carga completa por carretera (truckload) a partir de la geografía del corredor, la distancia, el tipo de equipo, el peso y la fecha. Lo desarrolla el usuario de Hugging Face `myousaf6` como proyecto de evaluación y se publica bajo la librería LightGBM con la etiqueta `tabular-regression`. No es un modelo de lenguaje ni un transformer: es un artefacto predictivo compuesto por un booster de árboles potenciado por gradiente más un componente de nivel de mercado.

La arquitectura es un modelo híbrido en dos partes: un LightGBM que modela el componente de corredor (lane) sobre `log(rate)` y un estimador de nivel de mercado calculado como media de tres estimadores (persistencia a 28 días, lineal sobre índice de mercado y lineal sobre índice de mercado más tendencia). Los coeficientes de la parte de nivel se almacenan en `artifacts/meta.json` y el booster en `artifacts/lane_model.txt`. El modelo se entrenó con unos 48.000 envíos de enero a octubre de 2025.

Su relevancia es acotada: se trata de un modelo de demostración con un rendimiento declarado de aproximadamente 3,0% de error absoluto porcentual mediano (MAE de unos 129 dólares) en una ventana temporal retenida de septiembre a octubre, frente al 6,8% de una línea base ingenua de dólares por milla. El autor lo describe explícitamente como modelo de evaluación, no apto para cotización en producción, y con una ventana de validez limitada a noviembre-diciembre de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosted trees) para el componente de corredor + estimador de nivel de mercado (media de tres estimadores lineales/persistencia) |
| Parametros totales | no disponible (modelo de árboles; no se publica recuento de hojas ni árboles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | artefactos propietarios de LightGBM: `artifacts/lane_model.txt` (booster de texto) y `artifacts/meta.json` (coeficientes) |

## Arquitectura y entrenamiento

El modelo descompone el logaritmo de la tarifa como `log(rate) = lane(...) + level(date)`. La parte de corredor es un booster LightGBM entrenado sobre variables de geografía del corredor, distancia, tipo de equipo, peso y fecha. La parte de nivel es una estimación de mercado que promedia tres estimadores: persistencia a 28 días, regresión lineal sobre el índice de mercado y regresión lineal sobre el índice de mercado más tendencia. Los coeficientes de esta segunda parte se guardan en `artifacts/meta.json` y el código de características está en el paquete `freight_rate/`.

El entrenamiento utilizó aproximadamente 48.000 cargas de enero a octubre de 2025, datos que no se incluyen en el repositorio. La evaluación es temporal: sobre una ventana retenida de septiembre-octubre se reporta un error absoluto porcentual mediano de aproximadamente 3,0% (MAE de unos 129 dólares), frente al 6,8% de una línea base de dólares por milla. La validación cruzada rodante arrojó aproximadamente 2,5%. El autor indica que alrededor del 1,5% de las etiquetas de entrenamiento parecían corruptas y se excluyeron del ajuste. No se documentan técnicas de regularización, búsqueda de hiperparámetros ni proceso de calibración más allá de lo descrito.

## Capacidades

- Predicción de tarifa publicada de carga completa por carretera a partir de variables tabulares de corredor, distancia, equipo, peso y fecha.
- Modelado explícito de estacionalidad de mercado mediante el componente de nivel (persistencia, índice y tendencia).
- Descomposición interpretable en dos términos aditivos sobre `log(rate)`, lo que facilita el diagnóstico por separado del efecto corredor y del efecto mercado.
- Inferencia ligera: el booster de LightGBM y los coeficientes en JSON se cargan desde `app.py` sin necesidad de GPU.
- Demostración interactiva mediante una interfaz Gradio (enlace temporal, solo activo mientras el autor mantiene la demo en ejecución).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Análisis exploratorio de tarifas de referencia: usar el booster y los coeficientes de nivel para generar una estimación de tarifa por corredor y fecha y contrastarla con tarifas observadas en un conjunto de validación interno.
- Evaluación de modelos de pricing: emplear el modelo como línea base tabular frente a alternativas más complejas (por ejemplo, gradient boosting con más features o modelos neuronales tabulares) en un pipeline de experimentación.
- Estudio de sensibilidad de mercado: manipular el índice de mercado y la tendencia en `meta.json` para analizar cómo cambia la predicción de nivel sin reentrenar el booster.
- Docencia y prototipado de descomposiciones aditivas: el esquema `lane + level` sirve como ejemplo didáctico de separación entre efecto estructural y efecto temporal en series económicas.
- Validación de calidad de datos: el filtrado del 1,5% de etiquetas corruptas documentado por el autor puede reutilizarse como referencia para auditorías de datasets de transporte.
- Demo interactiva en Gradio: presentar el modelo en un entorno controlado (charla, revisión interna) mientras el enlace temporal esté activo, sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Valor reportado | Referencia |
|---|---|---|
| Error absoluto porcentual mediano (ventana sep-oct retenida) | ~3,0% | Línea base $/milla: 6,8% |
| MAE (ventana sep-oct retenida) | ~129 USD | no disponible |
| Validación cruzada rodante | ~2,5% | no disponible |
| Incertidumbre del nivel de mercado extrapolado | ~±1,7% | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un booster de LightGBM y coeficientes JSON, ejecutable en CPU.
- GPU recomendadas: no aplica; no se requiere GPU para inferencia.
- Cabe en cualquier equipo consumer, incluidos portátiles sin GPU dedicada, siempre que se disponga de memoria suficiente para cargar el booster y las features.
- Opciones de despliegue: carga directa con la librería `lightgbm` desde `app.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput estimados: no disponibles; para un booster de este tamaño se espera latencia de milisegundos por petición en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| myousaf6/freight-rate-model | LightGBM + nivel de mercado | no disponible | no aplica | no disponible | Hugging Face (repo público) |
| Línea base $/milla (referencia del autor) | Regla heurística | no aplica | no aplica | no aplica | Definida en la model card |
| Alternativas de regresión tabular para pricing (p. ej. XGBoost, CatBoost) | Gradient boosting | no disponible | no aplica | depende del modelo | Ampliamente disponibles |

No se dispone de comparativas publicadas con otros modelos de tarifas de transporte en la información proporcionada.

## Limitaciones y advertencias

- Modelo de demostración y evaluación: el propio autor indica que no debe usarse para cotización en producción.
- Ventana de validez limitada a noviembre-diciembre de 2025; el nivel de mercado es una extrapolación con una incertidumbre de aproximadamente ±1,7%.
- No modela efectos de festivos, lo que puede sesgar predicciones en periodos con calendarios atípicos.
- Alrededor del 1,5% de las etiquetas de entrenamiento parecían corruptas y se excluyeron; el impacto residual en la calibración no se cuantifica.
- Licencia no disponible: no se puede asumir uso comercial sin confirmación del autor.
- Los datos de entrenamiento (unas 48.000 cargas de enero a octubre de 2025) no se incluyen en el repositorio, lo que impide reproducir el ajuste tal cual.
- La demo Gradio es un enlace temporal que solo funciona mientras el autor la mantiene activa; no es un servicio desplegado de forma estable.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni capacidades multilingües; cualquier uso fuera de regresión tabular de tarifas está fuera de su alcance.
- Riesgo de deriva de mercado: al depender del índice de mercado y de la tendencia, cambios estructurales en el sector invalidan rápidamente las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myousaf6/freight-rate-model
- Demo Gradio (temporal): https://47c7b2dc2a3283aca0.gradio.live/
- Repositorio del autor: no disponible
- Paper o blog técnico: no disponible
