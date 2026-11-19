# paradoxailab/pwm-dyn-v0.7-pems-bay

## Resumen

PWM-Dyn v0.7 (PEMS-BAY) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab, enmarcado en su serie Paradox World Model (concretamente el modelo 18 de 56 publicados). Su tarea específica es la predicción de los siguientes 12 pasos temporales de tráfico en la red de sensores de PEMS-BAY (área de la bahía de San Francisco, 325 sensores), incluyendo el escenario de fallo parcial de sensores (outages). Con 336.932 parámetros, es un modelo extremadamente compacto orientado a un dominio muy concreto y no a propósito general.

La relevancia de esta versión radica en su enfoque en robustez ante caídas de sensores: según la model card, incorpora un "fallback base" y entrenamiento con outages reales, lo que reduce el error en escenarios de fallo entre un 11% y un 22% respecto a v0.6 en cinco redes, a costa de un incremento de solo 0,4–1,8% en el error en condiciones limpias. El modelo se distribuye como un checkpoint de PyTorch (`.pt`) con pesos, configuración y resultados registrados en el propio archivo.

Se trata de un modelo de investigación con licencia Apache-2.0, sin datos de entrenamiento incluidos (solo referencias a sus fuentes en el repositorio), y con métricas reportadas por el autor en su propio benchmark (ParadoxBench-1.2) en lugar de benchmarks académicos estándar. No dispone de soporte multilingüe ni de capacidades de generación de texto: es un modelo puramente numérico de forecasting espacio-temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espacio-temporal; código en repositorio GitHub del autor) |
| Parametros totales | 336.932 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predice los siguientes 12 pasos temporales) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict dentro de un archivo `.pt` (`18_pwm-dyn_v0.7_PEMS-BAY.pt`, 1.382.243 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de identificarla como parte de la familia PWM-Dyn y remitir al repositorio de GitHub `paradoxailab/paradox-world-model` para el código de la versión. El modelo opera sobre datos espacio-temporales de tráfico: 325 sensores de PEMS-BAY y una tarea de predicción de los 12 pasos siguientes. La configuración exacta de entrenamiento está almacenada en el propio checkpoint (`ck['cfg']`), pero no se reproduce en la información disponible.

El entrenamiento se realizó el 2026-11-04 mediante un notebook de Kaggle (identificador `8ffe55b5c8`, versión 365414722, commit b0f6a08) y se liberó el 2026-11-17. La innovación declarada de esta versión es la combinación de una "fallback base" con entrenamiento en condiciones de outages reales, lo que mejora la robustez ante fallos de sensores. Los datos de entrenamiento no se distribuyen; sus fuentes y términos se documentan en `DATA_SOURCES.md` del repositorio. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de forecasting numérico.

## Capacidades

- Predicción de los 12 pasos temporales siguientes de tráfico sobre la red de 325 sensores de PEMS-BAY.
- Forecasting espacio-temporal multivariante con dependencias entre sensores de la red.
- Robustez ante outages: entrenado explícitamente para mantener precisión cuando faltan datos de sensores (Track G de ParadoxBench-1.2).
- Inferencia determinista sobre series numéricas; no genera texto, código ni imágenes.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multilingües ni de razonamiento simbólico.
- No dispone de modo "thinking", visión ni audio.
- Checkpoint autocontenido: incluye metadatos, pesos, configuración y resultados registrados (`ck['meta']`, `ck['weights']`, `ck['cfg']`, `ck['results']`).

## Casos de uso

- Predicción de tráfico a corto plazo en PEMS-BAY: dado el histórico reciente de los 325 sensores, el modelo produce los 12 pasos siguientes de velocidad/flujo, adecuado para paneles de monitorización y sistemas de información al conductor en el área de la bahía de San Francisco.
- Gestión de incidencias con sensores caídos: al estar entrenado con outages reales, puede mantener predicciones útiles cuando parte de la red de sensores deja de reportar, reduciendo la necesidad de imputación manual previa.
- Alimentación de sistemas de control semafórico o de gestión de autopistas: las predicciones a 12 pasos sirven como entrada a políticas de control que necesitan estimaciones a corto plazo, con un coste computacional mínimo (menos de 0,4 M de parámetros).
- Investigación en robustez de modelos espacio-temporales: sirve como baseline reproducible para estudiar el efecto de fallos de sensores en forecasting, con resultados y logs incluidos en el propio checkpoint.
- Prototipado rápido y despliegue en edge: su tamaño (1,38 MB de archivo) permite ejecutarlo en CPU o dispositivos embebidos sin GPU, útil para pruebas de concepto en entornos con recursos limitados.
- Evaluación comparativa dentro de la serie PWM: permite contrastar la versión v0.7 frente a v0.6 y frente a las variantes de otras redes (METR-LA, Delhi) publicadas en la misma serie, usando el benchmark propio del autor.

## Benchmarks y rendimiento

Resultados reportados por el autor en ParadoxBench-1.2 (media de un ensemble de 3 semillas; este archivo corresponde a la semilla 200):

| Escenario | MAE |
|---|---|
| Test limpio (clean) | 1,533 |
| Outages reales (Track G) | 1,959 |

Mejoras declaradas respecto a v0.6: reducción del error en outages reales de entre el 11% y el 22% en cinco redes, con un incremento del error en condiciones limpias de entre el 0,4% y el 1,8%. No se han publicado resultados en benchmarks académicos estándar (METR-LA, PEMS-BAY con protocolos habituales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 1,38 MB y el modelo tiene 336.932 parámetros, por lo que cabe holgadamente en cualquier GPU, incluida una iGPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas, y también en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `hf_hub_download`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (PEMS-BAY) | 336.932 | 12 pasos | PEMS-BAY (325 sensores) | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.7 (METR-LA) | no disponible | 12 pasos | METR-LA | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.6 (PEMS-BAY) | no disponible | 12 pasos | PEMS-BAY | Apache-2.0 | Hugging Face (serie) |
| PWM-W Delhi v0.1 | no disponible | no disponible | Delhi | Apache-2.0 | Hugging Face |

No se dispone de comparación con modelos académicos de referencia (por ejemplo, Graph WaveNet, DCRNN o STGCN) en la información proporcionada; sus métricas no son directamente comparables al usar el autor su propio benchmark (ParadoxBench-1.2) en lugar de los protocolos estándar de la literatura.

## Limitaciones y advertencias

- Modelo específico de PEMS-BAY: no es transferible sin reentrenamiento a otras redes de tráfico ni a otros dominios de series temporales.
- Métricas autoinformadas: los resultados provienen de ParadoxBench-1.2, un benchmark propio del autor, y no de protocolos académicos estándar; la comparabilidad con la literatura es limitada.
- Sin datos de entrenamiento publicados: solo se referencian sus fuentes en `DATA_SOURCES.md`, lo que dificulta la auditoría y la reproducción completa.
- Repositorio de tamaño 0,0 GB y 0 descargas/likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.
- Riesgo de deriva en producción: al depender de la topología y el comportamiento de la red de PEMS-BAY, cambios en la infraestructura de sensores pueden degradar las predicciones.
- Sin información sobre sesgos: no se documentan análisis de sesgo ni de equidad, algo relevante si las predicciones se usan para decisiones de gestión de tráfico que afecten a distintas zonas.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no obstante, la falta de garantías y de validación independiente desaconseja su uso en producción crítica sin evaluación propia.
- No apto para tareas de lenguaje, visión ni agentes: cualquier uso fuera del forecasting numérico espacio-temporal es inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems-bay
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentación de la versión: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (METR-LA): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-metr-la
- Modelo siguiente (PWM-W Delhi v0.1): https://huggingface.co/paradoxailab/pwm-w-delhi-v0.1
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
