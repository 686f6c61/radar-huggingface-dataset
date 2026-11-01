# ODNus/haenam-timesfm-lora-v1

## Resumen

Haenam TimesFM native LoRA v1 es un adaptador LoRA de PyTorch nativo entrenado sobre el modelo base google/timesfm-2.5-200m-transformers, un modelo de series temporales de 200 millones de parámetros desarrollado por Google. El adaptador lo publica el usuario ODNus y está especializado en la predicción de series temporales de calidad del agua en la región de Haenam (Corea del Sur). No se trata de un modelo completo ni de un adaptador compatible con PEFT: requiere un cargador propio incluido en el repositorio.

El artefacto resuelve un problema de dominio muy concreto: adaptar un modelo fundacional de forecasting a series multivariadas de calidad del agua (temperatura, oxígeno disuelto, pH y salinidad) con una ventana de contexto de 128 horas y un horizonte de predicción de 12 horas. El adaptador añade 614.400 parámetros entrenables sobre las proyecciones q/v/o de las 20 capas de atención del modelo base, que permanece congelado.

La relevancia es limitada y experimental: se trata de un piloto acotado de 32 pasos de entrenamiento, con ocho dispositivos efectivos y sin garantía de mejora en precisión. Su interés principal es metodológico, como ejemplo de adaptación nativa (no PEFT) de TimesFM 2.5 y como plantilla de despliegue reproducible con validación de tensores y checksums.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA nativa sobre transformer TimesFM 2.5 (modelo base de series temporales) |
| Parametros totales | 614.400 parámetros entrenables en el adaptador (modelo base no incluido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 horas de entrada, 12 horas de horizonte de predicción |
| Tipos de cuantizacion | no disponible (ejemplo de inferencia en CPU float32) |
| Idiomas soportados | ko, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter.safetensors), más bias.json y código Python |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 4 y alpha 8 (escala 2) sobre las proyecciones q/v/o de las 20 capas de atención del modelo base TimesFM 2.5 de 200M parámetros, lo que suma 60 proyecciones y 614.400 parámetros entrenables. Los pesos base permanecen congelados durante el entrenamiento. El repositorio incluye 120 tensores A/B en formato safetensors, junto con un cargador nativo (`native_lora.py`) que valida claves, formas, dtypes y valores finitos antes de copiar los pesos. No es compatible con PEFT ni con `AutoModel`.

El entrenamiento se realizó sobre datos de calidad del agua de la región de Haenam entre el 31 de agosto y el 26 de octubre de 2026 (zona Asia/Seoul), con cortes de entrenamiento, calibración y test el 9 y el 17 de octubre. Se seleccionaron nueve dispositivos (ocho estaciones externas más la boya 08D1F91C8BB0), excluyendo el dispositivo terrestre 1534. La estación externa `aibp:OBS007:OBS_000035` no aportó ventanas por tener una racha continua de 131 horas, por debajo del mínimo de 140 requerido. El resultado fueron ocho dispositivos efectivos y 32 grupos dispositivo × métrica × unidad (temperatura en °C, oxígeno disuelto en mg/L, pH y salinidad en PSU externa y g/Kg en la boya interna, sin conversión entre unidades).

Se trata de un piloto acotado: 32 pasos de entrenamiento, una ventana muestreada por grupo de las 5.029 elegibles, batch size 1, AdamW con learning rate 0.0001, weight decay 0.01, semilla 42 y gradient clipping 1.0. No es un entrenamiento hasta convergencia. La inferencia reproduce los ajustes de evaluación (`forecast_context_len=128`, `force_flip_invariance=True`, `truncate_negative=False`), con normalización por desviación estándar poblacional y escala unitaria para contextos casi constantes. El repositorio incluye además una tabla de sesgo opcional (`bias.json`) que se aplica tras un paso de anchoring y que se ajustó solo con el split de calibración.

## Capacidades

- Predicción de series temporales univariadas: cada métrica (temperatura, oxígeno disuelto, pH, salinidad) se procesa de forma independiente.
- Forecasting a 12 horas a partir de 128 horas consecutivas de observaciones horarias finitas.
- Anchoring opcional: desplaza la predicción para alinear el primer horizonte con el último valor observado.
- Corrección de sesgo opcional por dispositivo, métrica y unidad, ajustada en calibración y desactivada por defecto.
- Cargador nativo portable con validación de tensores y sin ejecución de código remoto ni carga de pickle.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es exclusivamente un modelo de forecasting.

## Casos de uso

- Monitorización de calidad del agua en estaciones de la región de Haenam: el adaptador predice las próximas 12 horas de temperatura, oxígeno disuelto, pH y salinidad a partir de las 128 horas previas, lo que permite anticipar episodios de hipoxia o cambios bruscos de salinidad.
- Investigación metodológica sobre adaptación nativa de TimesFM: sirve como plantilla reproducible para quienes necesiten aplicar LoRA fuera del ecosistema PEFT sobre modelos de series temporales.
- Prototipado de sistemas de alerta temprana en acuicultura: con el anchoring y la tabla de sesgo por dispositivo, se puede integrar en un pipeline que genere avisos cuando la predicción de oxígeno disuelto caiga por debajo de umbrales operativos.
- Evaluación comparativa de estrategias de calibración: el repositorio separa claramente LoRA, anchoring y corrección de sesgo, lo que facilita experimentos controlados sobre cada componente.
- Despliegue en entornos con CPU: el ejemplo de inferencia funciona en CPU float32, adecuado para estaciones remotas o entornos sin GPU.
- Docencia y reproducción de experimentos: los tests offline (`test_runtime.py`), el `verification.json` y el `MANIFEST.sha256` permiten verificar la integridad del artefacto en un entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el objetivo del release es el artefacto del adaptador y el código de inferencia portable, no una afirmación de mejora en la precisión del forecasting. No se proporcionan métricas como MAE, RMSE o MAPE frente al modelo base ni frente a alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 200M parámetros y el adaptador añade 614.400 parámetros, por lo que la inferencia en float32 requiere del orden de 1 GB o menos, aunque este dato no se confirma en la documentación.
- GPU recomendadas: no disponibles; el ejemplo oficial se ejecuta en CPU float32.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se documenta una configuración concreta.
- Opciones de despliegue: cargador nativo `native_lora.py` con `TimesFm2_5ModelForPrediction`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno recomendado: Python 3.12 en un entorno separado, con `requirements.txt` y tests offline mediante `python -m unittest test_runtime -v`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haenam TimesFM native LoRA v1 | 614.400 (adaptador) | 128 h entrada / 12 h salida | Calidad del agua (Haenam) | apache-2.0 | HuggingFace |
| google/timesfm-2.5-200m-transformers | 200M | no disponible en la información | Forecasting general | no disponible en la información | HuggingFace |
| Otros adaptadores LoRA de TimesFM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Piloto acotado: solo 32 pasos de entrenamiento y una ventana por grupo; no es un entrenamiento hasta convergencia y no garantiza mejora de precisión.
- No es un modelo completo ni un adaptador PEFT: requiere el cargador nativo incluido y el modelo base fijado en la revisión `5a9806b9b291fad9233b5249d88263f1846304d3`.
- Dominio muy restringido: ocho dispositivos de la región de Haenam y cuatro métricas de calidad del agua; no se debe esperar generalización a otras ubicaciones o variables.
- Unidades de salinidad no unificadas: PSU externa y g/Kg en la boya interna se tratan por separado, sin conversión.
- La corrección de sesgo es opcional y no se aplica implícitamente; puede desplazar el primer horizonte lejos de la última observación.
- No se interpolan huecos: se exigen exactamente 128 valores horarios consecutivos y finitos por serie.
- La model card declara explícitamente que no se garantiza la idoneidad para decisiones de seguridad en campo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de forecasting, el riesgo se traduce en predicciones inexactas más que en texto inventado.
- Licencia apache-2.0 en el adaptador, pero conviene verificar la licencia del modelo base de Google antes de uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/ODNus/haenam-timesfm-lora-v1
- Modelo base: https://huggingface.co/google/timesfm-2.5-200m-transformers
