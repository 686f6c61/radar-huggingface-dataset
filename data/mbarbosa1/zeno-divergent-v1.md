# mbarbosa1/zeno-divergent-v1

## Resumen

Zeno Divergent v1 es un prototipo de investigación desarrollado por mbarbosa1 que aborda un problema distinto al de los detectores de anomalías convencionales: en lugar de responder si un punto de datos es inusual, responde si el modelo de referencia que se está utilizando está a punto de dejar de ser válido. Para ello, toma como entrada un conjunto de expectativas de referencia (predictores, simuladores, límites físicos, reglas de política) junto con sus residuos y validez, y produce un informe estructurado de sorpresa relativa al modelo. Está pensado como un "sidecar" que observa y supervisa stacks de forecasting o simulación existentes, sin reemplazarlos ni retrenarlos.

Con solo 69 082 parámetros, es un modelo extremadamente ligero que puede ejecutarse en cualquier máquina moderna, incluso en CPU. Su relevancia actual radica en que introduce una arquitectura de atención sobre modelos en lugar de sobre características, y en que ofrece un canal explícito de "ceguera" para datos no observados, evitando que la ausencia de evidencia se interprete como seguridad. No obstante, se trata de un prototipo de investigación: está entrenado exclusivamente con datos sintéticos y no ha sido validado en escenarios reales, por lo que no debe usarse para decisiones operativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la documentación; se describe como atención sobre modelos) |
| Parámetros totales | 69 082 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantización | no disponible (no se mencionan) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | research-preview (otra licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La documentación no proporciona detalles concretos sobre la arquitectura interna (tipo de red, número de capas, atención, etc.). Lo que se indica es que el modelo opera sobre un espacio latente de diez ejes (denominado `z^S`) y que la atención se ejecuta sobre los modelos de referencia y sus residencias, no sobre las características de los datos. La salida es un `SurpriseReport` con campos como `kind` (región del espacio latente), `potential_units` (una métrica de ranking), `blindness`, probabilidades de fallo del modelo por horizonte, contra-expectativas y una acción de admisión (`ignore`, `remember`, `open a regime`, `request information`, `rebuild`).

El entrenamiento se realizó exclusivamente sobre un corpus sintético, con un solo simulador y una sola semilla. No hay datos sobre número de tokens, composición del dataset ni uso de RLHF o DPO. El propio autor declara que no hay validación en datos reales ni test de transferencia. La innovación principal no está en la arquitectura, sino en el protocolo de evaluación y en el diseño de la entrada (referencias de expectativas y residencias) y la salida (informe de sorpresa con canal de ceguera).

## Capacidades

- Detección de sorpresa relativa al modelo: identifica cuándo las predicciones de un modelo dejan de ser válidas, en lugar de solo marcar puntos anómalos.
- Canal de ceguera explícito: distingue entre "no observado" y "no en riesgo", evitando falsas seguridades.
- Salida estructurada de `SurpriseReport` con múltiples campos: tipo de sorpresa, ranking de potencial, ceguera, probabilidades de fallo por horizonte, contraexpectaciones y acción de admisión.
- Acción de admisión `REQUEST_INFORMATION`: el modelo puede declinar emitir una afirmación de validez si no tiene suficiente evidencia.
- Diseñado para series temporales y para supervisión de modelos de forecasting o simulación.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes. No tiene capacidades de visión ni audio.

## Casos de uso

- Supervisión de modelos de predicción meteorológica: un equipo de observación de la Tierra puede usar Zeno Divergent como sidecar para detectar cuándo las salidas de un simulador meteorológico empiezan a divergir de las observaciones, activando una alerta de "cambio de régimen" antes de que el fallo se haga crítico.
- Vigilancia de modelos financieros de riesgo: en un sistema de gestión de riesgo, el modelo puede monitorear si las hipótesis de un modelo de valor en riesgo (VaR) siguen siendo válidas bajo condiciones de mercado cambiantes, solicitando información adicional o abriendo un régimen de alerta.
- Monitoreo de simuladores físicos en infraestructura crítica: para una planta de energía o una red de agua, el modelo puede detectar cuándo las simulaciones de comportamiento dejan de coincidir con los sensores reales, indicando que el modelo subyacente ya no es fiable.
- Control de calidad en pipelines de forecasting: integrado como etapa de validación, puede emitir un `REQUEST_INFORMATION` si los residuos de un modelo de predicción son ambiguos, evitando decisiones automáticas basadas en datos no confirmados.
- Evaluación de modelos en producción: como herramienta de investigación, permite comparar la validez de distintos modelos de referencia sobre un mismo conjunto de expectativas, priorizando los que presentan menos divergencia.
- Detección temprana de cambios de régimen en series temporales sintéticas o experimentales: útil en entornos de investigación para probar hipótesis sobre cuándo un modelo deja de ser válido.

## Benchmarks y rendimiento

El autor declara resultados en el protocolo `SurpriseBench/1.0.0` (conjunto de validación sintético) con métrica primaria AUPRC a prevalencia 0.399 y AUROC como métrica secundaria. Los intervalos son bootstrap de 95% sobre episodios completos. La tabla muestra los resultados del modelo frente a dos alternativas reportadas en la model card:

| Detector | AUPRC | AUPRC 95% CI | AUROC | AUROC 95% CI | Lead@FAR | step-FPR | FA(clean) | Detection | ECE |
|---|---|---|---|---|---|---|---|---|---|
| surprise_index (Zeno Divergent) | 0.990 | [0.988, 0.992] | 0.993 | [0.992, 0.995] | 7.25 | 0.10 | 0.26 | 1.00 | 0.030 |
| logistic_signals | 0.894 | [0.869, 0.916] | 0.921 | [0.906, 0.934] | 4.10 | 0.07 | 0.34 | 0.65 | 0.042 |
| conformal_width | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de la fila de conformal_width no se proporcionan en la información disponible. El autor advierte que estos números son evidencia de que la arquitectura y el protocolo de evaluación funcionan de extremo a extremo, pero no son evidencia sobre el mundo real.

## Requisitos de hardware

- Con 69 082 parámetros, el modelo es extremadamente ligero y puede ejecutarse en CPU, incluso en dispositivos de bajo consumo.
- No se requiere GPU para inferencia; cualquier máquina con suficiente memoria RAM (menos de 1 GB) es suficiente.
- Al ser un modelo de transformers, puede desplegarse con librerías estándar de Hugging Face (Transformers) o con ONNX Runtime para optimización en CPU.
- No se dispone de datos de latencia o throughput en la información proporcionada, pero dado el tamaño, la inferencia debería ser prácticamente instantánea en cualquier hardware moderno.
- No hay datos sobre despliegue en plataformas específicas como vLLM u Ollama; el modelo no está diseñado para generación de texto.

## Comparativa con modelos similares

No hay disponibles modelos comparables de la misma categoría (detección de validez de modelos) en la información proporcionada. La model card incluye una comparación con métodos de detección de anomalías y conformal prediction, pero no se proporcionan sus especificaciones técnicas ni sus pesos. Los resultados de SurpriseBench de la tabla anterior son la única comparación cuantitativa disponible. En ausencia de otras alternativas, se indica que no hay comparativa disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con un corpus sintético de un solo simulador y una sola semilla; no ha sido validado con datos reales ni con otros simuladores.
- No tiene test de transferencia; su comportamiento fuera del dominio sintético es desconocido.
- La licencia `research-preview` restringe el uso comercial y operativo; el autor indica explícitamente que no debe usarse para decisiones operativas.
- El modelo no es un detector de anomalías genérico: su salida es un informe de validez de modelos, no un score de anomalía.
- Riesgo de falsas alarmas o de solicitudes de información innecesarias en entornos con ruido; el umbral de tasa de falsos positivos está fijado a 0.10 en la validación, pero no se ha probado en escenarios reales.
- No hay información sobre sesgos de género, raza o lenguaje, ya que no es un modelo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/mbarbosa1/zeno-divergent-v1
- Demo Space: https://huggingface.co/spaces/mbarbosa1/zeno-divergent
- Sitio web del proyecto: https://zenodivergent.dev
- Benchmark.json: https://huggingface.co/mbarbosa1/zeno-divergent-v1/raw/main/benchmark.json
- Benchmark interactivo: https://zenodivergent.dev/app/benchmark
