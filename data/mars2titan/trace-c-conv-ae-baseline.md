# mars2titan/trace-c-conv-ae-baseline

## Resumen

`mars2titan/trace-c-conv-ae-baseline` es un autoencoder convolucional 1D para detección de anomalías en series temporales, desarrollado por Matthew Faucher (usuario mars2titan) como baseline de comparación para el detector TRACE-C. El propio autor advierte en la model card que **este modelo no es TRACE-C**, sino un baseline post-hoc portado del autoencoder de series temporales 1D de keras-io a PyTorch, con semilla 42, 40 épocas y pérdida MSE de reconstrucción. Se entrenó exclusivamente con flujos de datos de NESO (National Energy System Operator del Reino Unido) de enero a abril de 2019, con scoring causal. Su relevancia radica en servir como punto de comparación empírico para evaluar si TRACE-C, un detector calibrado por rangos sin entrenamiento, supera a un baseline clásico de reconstrucción. El repositorio incluye logs de TensorBoard y un JSON con el historial de entrenamiento, pero el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos del modelo podrían no estar publicados explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional 1D (portado de keras-io a PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (serie temporal numerica, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (serie temporal numerica) |
| Licencia | MIT |
| Formato de pesos | PyTorch; repo de 0.0 GB, incluye `ae-training-history.json` y tfevents de TensorBoard; no se confirma publicacion de pesos del modelo |

## Arquitectura y entrenamiento

El modelo es un autoencoder convolucional 1D basado en el tutorial de keras-io de autoencoders para series temporales, portado a PyTorch. La arquitectura típica de este tipo de modelos consiste en una pila de capas Conv1D en el encoder que comprimen la señal temporal en un espacio latente, y capas Conv1DTranspose en el decoder que reconstruyen la entrada original. La detección de anomalías se realiza mediante el error de reconstrucción: cuanto mayor es el error, más probable es que el punto sea anómalo. El entrenamiento se realizó con semilla 42, 40 épocas y pérdida MSE de reconstrucción, sobre flujos de datos de NESO del periodo enero a abril de 2019. El scoring es causal, es decir, no utiliza información futura para puntuar cada instante temporal. El protocolo del baseline difiere del de TRACE-C en dos aspectos clave: no aplica presupuesto diario y usa estandarización global en lugar del esquema de calibración por rangos de TRACE-C.

## Capacidades

- Detección de anomalías en series temporales univariantes o multivariantes mediante error de reconstrucción.
- Procesamiento causal de la señal temporal, sin fuga de información futura en la puntuación.
- Reconstrucción de series temporales energéticas (demanda y generación de electricidad del operador británico NESO).
- Generación de curvas de pérdida y histogramas de pesos para análisis de entrenamiento via TensorBoard.
- Reproducibilidad garantizada por semilla fija (42) y configuración documentada (40 épocas, MSE).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento multi-paso.

## Casos de uso

- Monitorización de la red eléctrica: el modelo puede detectar picos anómalos de demanda o generación en los flujos de NESO, aunque su ventana de entrenamiento se limita a cuatro meses de 2019, por lo que su despliegue en producción requeriría reentrenamiento con datos más recientes.
- Baseline de investigación para detección de anomalías: sirve como referencia clásica de reconstrucción para comparar contra detectores más sofisticados como TRACE-C, que no requiere entrenamiento.
- Validación de protocolos de evaluación: su scoring causal y su configuración documentada permiten reproducir experimentos y verificar si las mejoras de un detector propuesto son reales o se deben a fugas de información.
- Análisis post-hoc de series temporales energéticas: el JSON de historial de entrenamiento y los tfevents permiten inspeccionar la convergencia y la estabilidad del entrenamiento para estudios metodológicos.
- Enseñanza de detección de anomalías: su código simple y su licencia MIT lo hacen adecuado como ejemplo didáctico de autoencoder convolucional aplicado a series temporales.
- Comparación de protocolos de estandarización: al diferir del protocolo de TRACE-C (sin presupuesto diario, estandarización global), permite estudiar el impacto de estas decisiones metodológicas en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un `baselines-report.json` en el repositorio de datos (`mars2titan/trace-c-neso-benchmark`), pero no se incluyen métricas concretas (precision, recall, F1, AUC) en la documentación del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible, pero por tratarse de un autoencoder convolucional 1D de pequeña escala, se espera que sea muy ligero y ejecutable en CPU.
- GPU recomendada: no se requiere una GPU específica; cualquier GPU con al menos 2 GB de VRAM sería suficiente si se desea acelerar el entrenamiento.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna de consumo (serie RTX 30 o superior) puede ejecutar este modelo sin problemas.
- Opciones de despliegue: PyTorch nativo; los logs se visualizan con TensorBoard (`tensorboard --logdir runs/trace-c-baselines`). No se menciona soporte para vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; se espera latencia baja por el tamaño reducido del modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrenamiento | Protocolo | Licencia |
|---|---|---|---|---|
| `trace-c-conv-ae-baseline` | Conv-AE 1D (keras-io portado) | 40 épocas, MSE, seed 42 | Causal, sin presupuesto diario, estandarización global | MIT |
| TRACE-C (modelo principal) | Detector calibrado por rangos, sin entrenamiento | No entrenado | Presupuesto diario, calibración por rangos | MIT |
| Otros baselines de anomalías en series temporales | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento cuantitativo entre estos modelos en la información proporcionada. La comparación cualitativa se limita a las diferencias de protocolo y arquitectura descritas en la model card.

## Limitaciones y advertencias

- **No es TRACE-C**: el autor lo indica explícitamente; es un baseline de comparación, no el detector principal del proyecto.
- **Datos de entrenamiento limitados**: solo se usaron flujos de NESO de enero a abril de 2019; el modelo no ha visto datos posteriores y puede no generalizar a patrones estacionales o cambios de régimen posteriores.
- **Protocolo no idéntico al de TRACE-C**: sin presupuesto diario y con estandarización global, por lo que las comparaciones directas de rendimiento deben interpretarse con cautela.
- **Pesos posiblemente no publicados**: el tamaño del repositorio es de 0.0 GB y solo se mencionan tfevents y un JSON de entrenamiento; no se confirma que los pesos del modelo estén disponibles para descarga.
- **Datos bajo licencia NESO Open Data**: aunque el código es MIT, los datos subyacentes están sujetos a la licencia de datos abiertos de NESO, lo que puede imponer restricciones de redistribución.
- **Sin métricas de rendimiento publicadas**: no hay benchmarks ni resultados cuantitativos en la model card, lo que impide evaluar su eficacia real como detector de anomalías.
- **Sin soporte para datos no energéticos**: el modelo se entrenó exclusivamente con telemetría de NESO; su aplicación a otros dominios requeriría reentrenamiento y validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mars2titan/trace-c-conv-ae-baseline
- Repositorio GitHub de TRACE-C: https://github.com/mars-arch/trace-c
- Dataset de evaluación NESO: https://huggingface.co/datasets/mars2titan/trace-c-neso-benchmark
- Colección del autor en HuggingFace: https://huggingface.co/collections/mars2titan/a
