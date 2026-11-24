# Nabidnur/Lernaea-TS-Micro

## Resumen

Lernaea-TS-Micro es la variante "Micro" de Lernaea-TS, una familia de modelos fundacionales para series temporales desarrollada por Nabidnur. El modelo se presenta como una implementación de referencia en PyTorch (ejecutable en CPU) de la build plan v6 del proyecto, con un tamaño medido de 9.579.254 parámetros distribuidos en 13 bloques con un patrón de tronco RRRA y un factor de bucle K=2, lo que da una profundidad efectiva de 22.

La arquitectura combina parches adaptativos, un tronco basado en Gated DeltaNet con "Calendar-Rotor" (una rotación en bloque diagonal que codifica fases de calendario), profundidad por bucle con pesos atados (loop-transformer), capas FFN de tipo Mixture-of-Experts top-1 con experto compartido, y una cabeza de cuantiles monótona con "hurdle" para el suelo en cero. Además, incorpora una mezcla "Hydra" que combina las predicciones neuronales con expertos clásicos ajustados (seasonal-naive, SES-drift y Theta).

El modelo es relevante porque propone un diseño compacto (por debajo de los 10M de parámetros) con garantías matemáticas verificadas (equivarianza afín exacta, ausencia de cruce de cuantiles, CRPS en forma cerrada) y una hoja de ruta clara hacia un preentrenamiento de 25.000 millones de tokens en TPU/JAX. No obstante, en el momento de redactar esta ficha no se han publicado resultados de benchmarks en datos reales, y el checkpoint disponible es una prueba de vida ("proof-of-life") del modelo Nano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tronco Gated DeltaNet + Calendar-Rotor, bucle con pesos atados (loop depth), FFN MoE top-1 con experto compartido y cabeza de cuantiles monótona con mezcla Hydra de expertos clásicos |
| Parametros totales | 9.579.254 (medidos con `python -m lernaea.sizing`) |
| Parametros activos | No aplica de forma estricta: MoE top-1 con experto compartido; el número de parámetros activos por token no se detalla en la información disponible |
| Longitud de contexto | No disponible (el ejemplo de uso acepta series de 1024 pasos con horizonte de 96, pero no se especifica un límite formal) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint `checkpoints/nano/model.safetensors`); pesos PyTorch |

## Arquitectura y entrenamiento

El modelo se organiza en 13 bloques con patrón `RRRA RRRA RRRA R` (bloques de recurrencia R y bloques de atención A) y un factor de bucle K=2 con pesos atados y puertas aprendidas inicializadas a cero, de modo que la salida con K=2 es idéntica a K=1 al inicio del entrenamiento (superset estricto del modelo plano). El tronco usa una recurrencia Gated DeltaNet en forma de referencia (el kernel por chunks queda para la ruta TPU) y atención temporal con Calendar-RoPE. El "Calendar-Rotor" implementa una rotación en bloque diagonal exacta que codifica fases de calendario. La FFN es un MoE top-1 con SwiGLU, experto compartido y pérdida de balanceo de carga.

La cabeza de predicción es una cabeza de cuantiles monótona (sin cruce de cuantiles por construcción) con hurdle para el suelo exacto en cero y el techo en series con signo invertido. La mezcla Hydra combina las predicciones neuronales con tres expertos clásicos ajustados (seasonal-naive, SES-drift y Theta) mediante una puerta por token de horizonte y mezcla ponderada a nivel de cuantil. La pérdida es pinball más CRPS en forma cerrada con integrales de cola exactas, verificada contra una referencia Monte Carlo (error relativo del 1,1 %).

En cuanto al entrenamiento, la model card indica que el preentrenamiento de 25.000 millones de tokens sobre el corpus GIFT-Eval corresponde a la cadena de notebooks de Kaggle de la build plan v6 y que la implementación de referencia es la versión S0 en PyTorch. El único checkpoint incluido es el "proof-of-life" del modelo Nano (0,87M de parámetros), entrenado con `scripts/nano_train.py` sobre series sintéticas (loss 0,747 → 0,303 en 30 pasos). No se detalla la composición del dataset de preentrenamiento ni si hubo RLHF o DPO (no aplica en un modelo de series temporales).

## Capacidades

- Pronóstico probabilístico de series temporales: emite 9 cuantiles (τ = 0,1 … 0,9) para un horizonte de 96 pasos en el espacio original.
- Manejo de valores ausentes mediante máscara de observación (`mask` con 1 = observado).
- Escalado robusto por serie con equivarianza afín exacta (F(ax+b) = a·F(x)+b, error 1,1e-05).
- Antisimetrización verificada: F(−x) = −F_mirror(x) con error 0,0.
- "Span Guard": la predicción es invariante al contenido de la región de relleno (padding) con error 0,0.
- Mezcla adaptativa de expertos neuronales y clásicos (seasonal-naive, SES-drift, Theta) con puerta Hydra por token de horizonte.
- Cabeza de cuantiles monótona sin cruce de cuantiles por construcción.
- Soporte de hurdle para el suelo exacto en cero y techo en series con signo invertido.
- No se describe soporte de tool calling, agentes, visión, audio ni capacidades multilingües (no aplica a un modelo de series temporales).

## Casos de uso

- Pronóstico de demanda minorista: el modelo emite cuantiles por horizonte (96 pasos) que permiten dimensionar stock con intervalos de confianza; la mezcla Hydra con seasonal-naive y Theta aporta robustez en series con estacionalidad fuerte.
- Planificación de capacidad en infraestructura: con contexto de 1024 pasos y equivarianza afín exacta, las predicciones se mantienen estables ante cambios de escala (por ejemplo, migración de unidades), lo que facilita su integración en pipelines existentes.
- Predicción de series financieras con signo: la antisimetrización verificada garantiza que el modelo trata de forma consistente series positivas y negativas, útil en spreads o retornos.
- Monitorización industrial con datos faltantes: la máscara de observación permite pronosticar aunque haya huecos en la telemetría, y el "Span Guard" evita que el relleno contamine la predicción.
- Evaluación comparativa de modelos de series temporales: el harness `eval/` implementa un protocolo tipo GIFT-Eval con CRPS en forma cerrada, útil para reproducir comparativas contra expertos clásicos.
- Investigación y prototipado en CPU: al ser una implementación de referencia en PyTorch ejecutable en CPU, sirve para validar diseños (loop depth, MoE, Hydra) antes de portarlos a TPU/JAX.
- Benchmark en Kaggle: los kernels `lernaea-gpu-train-eval` (T4), `lernaea-tpu-train` (TPU v5e) y `lernaea-cpu-bench` permiten entrenar y evaluar Micro sobre datos reales de GIFT-Eval-pretrain con un presupuesto de 55 minutos en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un protocolo de evaluación tipo GIFT-Eval y un script `scripts/local_bench.py` que genera `checkpoints/nano/BENCH_LOCAL.md`, pero no incluye cifras de CRPS ni comparativas numéricas con TTM-R3, Chronos-Bolt, Timer/TiRex, Sundial o TimesFM. Las únicas métricas reportadas son de verificación interna: 18/18 tests unitarios superados, error de equivarianza afín de 1,1e-05, error de antisimetrización de 0,0, error del Span Guard de 0,0 y pérdida de 0,747 → 0,303 en 30 pasos de entrenamiento sintético.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,58M de parámetros, en fp32 los pesos ocupan aproximadamente 38 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el kernel de entrenamiento documentado usa una NVIDIA T4 (Kaggle); también se contempla TPU v5e para la ruta JAX y CPU para la evaluación.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM para inferencia en fp32; el entrenamiento en T4 está presupuestado en 55 minutos para el modelo Micro.
- Opciones de despliegue: PyTorch nativo (implementación de referencia), PyTorch/XLA para TPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El runbook de Kaggle incluye un informe de throughput para el modelo Nano en TPU v5e, pero no se publican cifras en la información disponible.

## Comparativa con modelos similares

La model card sitúa a Lernaea-TS frente a TTM-R3, Chronos-Bolt, Timer/TiRex y Sundial/TimesFM en una tabla de posicionamiento SOTA, pero no proporciona los valores de esa tabla ni métricas comparativas. A continuación se recoge lo que sí está documentado sobre el tamaño:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lernaea-TS-Micro | 9.579.254 (medidos) | No disponible | Apache-2.0 | Repo Hugging Face con implementación de referencia |
| Lernaea-TS-Small | 30.971.502 (medidos) | No disponible | Apache-2.0 | Definido en la familia, sin checkpoint publicado |
| Lernaea-TS-Base | 103.627.238 (medidos) | No disponible | Apache-2.0 | Definido en la familia, sin checkpoint publicado |
| TTM-R3, Chronos-Bolt, Timer/TiRex, Sundial/TimesFM | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento (CRPS, MASE, etc.) para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene un checkpoint entrenado del modelo Micro: el único checkpoint incluido es el "proof-of-life" del modelo Nano (0,87M), entrenado sobre series sintéticas. El modelo Micro de 9,58M está definido en configuración y dimensionado, pero su preentrenamiento de 25.000 millones de tokens queda pendiente de la cadena de notebooks de Kaggle.
- No hay resultados de benchmarks publicados sobre datos reales; las garantías documentadas son propiedades matemáticas verificadas en tests unitarios, no métricas de precisión predictiva.
- La implementación es una referencia en PyTorch para CPU; el kernel por chunks de DeltaNet y el port a TPU/JAX están pendientes, por lo que el rendimiento en producción no está caracterizado.
- La licencia del repositorio es Apache-2.0 según la model card, aunque el campo de licencia de Hugging Face aparece como "no disponible"; conviene verificar el archivo LICENSE antes de un uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas (no aplica a un modelo de series temporales), pero tampoco se detalla el dominio de datos de preentrenamiento, lo que limita la evaluación de posibles sesgos en las predicciones.
- El campo "Pipeline" de Hugging Face no está definido y el repo tiene 0 descargas y 0 likes, lo que indica que es un proyecto en fase temprana sin validación externa.
- La fecha de creación del repositorio (2026-11-24) es posterior a la fecha habitual de referencia; conviene tratar los metadatos con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nabidnur/Lernaea-TS-Micro
- Model card completa: https://huggingface.co/Nabidnur/Lernaea-TS-Micro/blob/main/MODELCARD.md
- Documentación de arquitectura y posicionamiento SOTA: https://huggingface.co/Nabidnur/Lernaea-TS-Micro/blob/main/ARCHITECTURE.md
- Runbook de Kaggle (GPU/TPU/CPU): https://huggingface.co/Nabidnur/Lernaea-TS-Micro/blob/main/KAGGLE.md
- Build plan v6 (referenciado en la model card): `../../Lernaea-TS-Plan-v6.md`
- Scripts de Kaggle: `scripts/push_kaggle.sh`, `scripts/poll_kaggle.sh`
- Scripts de entrenamiento y benchmark: `scripts/nano_train.py`, `scripts/local_bench.py`
- Tests unitarios: `tests/test_lernaea.py`
- Generación de diagramas: `scripts/make_diagrams.py`
