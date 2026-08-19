# CodeDevX/future-prediction-multi-domain-lstm

## Resumen

El modelo `CodeDevX/future-prediction-multi-domain-lstm` es un sistema completo de predicción de series temporales multi-dominio desarrollado por CodeDevX. Para cada uno de los 7 temas (IA, economía, energía, finanzas, programación, deportes y clima), el sistema obtiene automáticamente un conjunto de datos reales, entrena una red LSTM de 2 capas, evalúa en un conjunto de prueba sin fuga de datos y genera predicciones futuras con formato de chat estilo ChatGPT. Está diseñado para ser un pipeline end-to-end que va desde la descarga de datos hasta la respuesta conversacional, con un CLI interactivo.

El modelo resuelve el problema de la predicción de series temporales en dominios heterogéneos con un enfoque unificado: una arquitectura LSTM simple, entrenamiento por tema y métricas de validación honestas (MAPE) comparadas con un baseline naive. Su relevancia radica en que ofrece un sistema reproducible y extensible para añadir nuevos dominios, con un código modular y licencia MIT. Aunque no es un modelo de lenguaje de gran escala, su enfoque en forecasting práctico y su transparencia en la evaluación lo hacen útil para desarrolladores que necesitan predicciones numéricas en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de 2 capas (por tema) |
| Parametros totales | no disponible (repo de 0.0 GB, tamaño reducido) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (series temporales, no texto) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante estándar de PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El sistema utiliza una arquitectura LSTM de 2 capas para cada uno de los 7 dominios. No se especifica el número de unidades ocultas ni otros hiperparámetros en la documentación disponible. El entrenamiento se realiza por tema con datos reales obtenidos de fuentes como Yahoo Finance, npm registry, Hugging Face tennis y Open-Meteo. Cada modelo se evalúa en un conjunto de prueba separado para evitar fugas de datos, y se reportan métricas MAPE (error absoluto medio porcentual) junto con una comparación frente a un baseline naive (predicción ingenua). No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo de lenguaje.

El pipeline completo incluye detección de intención, motor de predicción, formateador de respuesta y un CLI de chat. El motor devuelve métricas estructuradas como `net_change_pct`, `forecast_range_pct`, `current_to_forecast_pct` y `direction`, separadas de la respuesta natural. Los logs internos van a stderr y solo se muestran si se activa la variable de entorno `FORECAST_DEBUG=1`.

## Capacidades

- Predicción de series temporales en 7 dominios: IA (precio de NVIDIA), economía (S&P 500), energía (petróleo WTI), finanzas (Bitcoin), programación (descargas de npm), deportes (Elo del #1 ATP) y clima (temperatura media diaria).
- Generación de predicciones con formato de chat natural, similar a ChatGPT, a través del CLI `ask.py`.
- Comparación entre dominios mediante el comando `ask.py "compare all topics"`.
- Soporte para predicción meteorológica en cualquier ciudad especificando coordenadas de latitud y longitud.
- Extensibilidad: permite añadir nuevos dominios añadiendo una entrada en `TOPICS` y un fetcher correspondiente.
- Métricas de validación honestas: MAPE y comparación con baseline naive, sin exagerar la precisión (reconoce que los mercados son casi un paseo aleatorio).
- No es un modelo de lenguaje; no soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Análisis financiero personal: un usuario puede preguntar "¿qué hará Bitcoin la próxima semana?" y obtener una predicción numérica con rango y dirección, útil para decisiones informadas (no como consejo financiero).
- Monitorización de métricas de software: predecir descargas de paquetes npm como `react` para planificar capacidad o detectar tendencias de adopción.
- Planificación energética: estimar la evolución del precio del crudo WTI para presupuestos o análisis de mercado.
- Pronóstico meteorológico local: para una ciudad concreta (ej. Chennai, India) se puede obtener la temperatura prevista para el día siguiente, útil para agricultura o logística.
- Seguimiento deportivo: predecir el Elo del tenista número 1 del ranking ATP, útil para análisis de rendimiento o apuestas (con cautela).
- Sistema de alertas automatizado: integrar el pipeline en un script que ejecute predicciones periódicas y envíe notificaciones cuando la dirección prevista supere un umbral configurable.
- Investigación educativa: servir como ejemplo de un pipeline completo de forecasting reproducible, con código modular y métricas claras, para enseñar LSTM aplicado a series temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un LLM. Sin embargo, el modelo card incluye métricas de validación específicas para cada dominio:

| Tema | Activo | Fuente | MAPE (H1) | vs naive |
|---|---|---|---|---|
| IA | NVIDIA daily close | Yahoo Finance | 1.86% | ~naive |
| Economía | S&P 500 daily close | Yahoo Finance | 0.64% | beats naive 1.8% |
| Energía | WTI crude oil close | Yahoo Finance | 2.83% | ~naive |
| Finanzas | Bitcoin BTC-USD | Yahoo Finance | 1.52% | ~naive |
| Programación | `react` npm downloads | npm registry | 7.12% | **beats naive 77.5%** |
| Deportes | ATP world #1 Elo | Hugging Face tennis | 0.06% | ~naive |
| Clima | Daily mean temperature | Open-Meteo | 0.18% | beats naive 1.9% |

Estas métricas indican que el modelo tiene un rendimiento cercano al naive en la mayoría de los dominios financieros (lo cual es esperable por la naturaleza de los mercados), pero supera claramente al naive en el caso de descargas de npm y ligeramente en clima y economía.

## Requisitos de hardware

- Al ser un modelo LSTM pequeño (repo de 0.0 GB), se puede ejecutar en CPU sin problemas. No se especifican requisitos de VRAM.
- No se mencionan GPUs recomendadas; la inferencia es ligera y puede correr en cualquier máquina con Python y PyTorch instalados.
- Opciones de despliegue: el CLI `ask.py` es la interfaz principal; también se pueden usar los módulos `predict.py` y `model.py` para integración en otros scripts.
- No se dispone de datos de latencia o throughput; al ser un modelo pequeño, se espera una respuesta casi instantánea en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No hay referencias a otras arquitecturas de forecasting multi-dominio con las que comparar directamente. Por tanto, la comparativa se limita al baseline naive interno que ya reporta el propio modelo.

## Limitaciones y advertencias

- El modelo reconoce que los mercados financieros se comportan casi como un paseo aleatorio, por lo que las predicciones en esos dominios tienen una precisión limitada y no deben usarse como consejo financiero.
- No es un modelo de lenguaje; no puede generar texto libre ni responder preguntas fuera del ámbito de predicción de series temporales.
- Solo soporta el idioma inglés en su interfaz de chat.
- El modelo se entrena con datos históricos y no tiene en cuenta eventos no vistos (crisis, cambios de política, etc.), lo que puede afectar a la precisión en situaciones anómalas.
- No se especifican los hiperparámetros exactos del LSTM (número de unidades, tasa de aprendizaje, épocas), lo que dificulta la reproducibilidad exacta.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco difundido; no hay evidencia de uso en producción.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la precisión de las predicciones.

## Enlaces

- HuggingFace: https://huggingface.co/CodeDevX/future-prediction-multi-domain-lstm
- GitHub topics sobre future-prediction (referencia general): https://github.com/topics/future-prediction
- Paper FutureX (benchmark de predicción futura para agentes LLM, no relacionado directamente): https://arxiv.org/pdf/2508.11987
