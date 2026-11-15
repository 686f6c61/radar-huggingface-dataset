# M2LInES/Samudra2

## Resumen

Samudra 2 es un emulador neuronal del océano de tipo autorregresivo desarrollado por M2LInES (Multiscale Machine Learning In Coupled Earth System Modeling), un consorcio académico centrado en el modelado climático con aprendizaje automático. El modelo sustituye, a efectos prácticos de simulación, la componente oceánica del modelo GFDL OM4 y predice temperatura, salinidad, velocidades y altura de la superficie del mar a lo largo de distintos niveles de profundidad. No es un modelo de lenguaje: es un emulador científico de campos oceánicos.

La aportación principal de esta segunda versión es la escalabilidad en resolución: frente al Samudra original, que operaba a 1°, Samudra 2 genera rollouts globales estables durante múltiples años a 1°, 1/2° y 1/4°. Para ello emplea una columna vertebral ConvNeXt U-Net más ancha y una función de pérdida con ponderación dinámica por varianza que repondera cada canal de salida según su error de predicción, lo que mejora los campos del océano profundo.

El modelo se distribuye como un conjunto de checkpoints EMA (media móvil exponencial) en formato PyTorch (`.pt`), uno por resolución, con un tamaño total de repositorio de 7,2 GB. Su relevancia actual reside en la posibilidad de ejecutar simulaciones oceánicas de alta resolución a una fracción del coste computacional de un modelo físico completo, algo crítico para la investigación climática y la generación de ensembles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt U-Net (backbone convolucional) autorregresiva |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia de texto); rollout autorregresivo multi-anual |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en punto flotante PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo científico, sin interfaz de lenguaje natural) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`), checkpoints EMA por resolución |

Resoluciones disponibles y rutas de checkpoint:

| Resolucion | Ruta |
|---|---|
| 1° | `onedeg/ema_ckpt.pt` |
| 1/2° | `halfdeg/ema_ckpt.pt` |
| 1/4° | `quarterdeg/ema_ckpt.pt` |

## Arquitectura y entrenamiento

Samudra 2 es una red convolucional de tipo U-Net con bloques ConvNeXt como componente principal, más ancha que la del Samudra original. El modelo opera de forma autorregresiva sobre campos oceánicos en rejilla: recibe el estado del océano en un instante y predice el siguiente, permitiendo encadenar pasos y generar rollouts de varios años. Las variables de salida son temperatura, salinidad, componentes de velocidad y altura de la superficie del mar, distribuidas en los niveles de profundidad del modelo.

El entrenamiento se realiza sobre datos simulados del modelo oceánico GFDL OM4 (Geophysical Fluid Dynamics Laboratory), es decir, aprendizaje por emulación de un simulador físico de referencia. La innovación técnica central es una función de pérdida con ponderación dinámica por varianza, que reasigna el peso de cada canal de salida en función de su error de predicción; según el autor, esto mejora los campos del océano profundo y es lo que habilita rollouts estables a resoluciones más finas. No se documentan en la información disponible el número de tokens/pasos de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Emulación autorregresiva de la circulación oceánica global a tres resoluciones (1°, 1/2° y 1/4°).
- Predicción de temperatura, salinidad, velocidades (u, v) y altura de la superficie del mar en múltiples niveles de profundidad.
- Generación de rollouts multi-anuales estables a partir de un estado inicial.
- Reproducción del comportamiento estadístico del modelo físico GFDL OM4.
- Ejecución en GPU mediante PyTorch; integración con el repositorio de código Samudra y su documentación.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingües: su ámbito es exclusivamente la modelización científica.

## Casos de uso

- Investigación climática acelerada: sustituir el modelo oceánico OM4 por el emulador para generar simulaciones plurianuales a 1/4° con un coste computacional muy inferior al de la integración física completa.
- Generación de ensembles oceánicos: ejecutar múltiples rollouts desde distintas condiciones iniciales para estimar incertidumbre en variables como la temperatura superficial o la altura del mar.
- Estudio del océano profundo: aprovechar la mejora introducida por la pérdida ponderada por varianza para analizar campos en niveles profundos con menor error.
- Downscaling y comparación entre resoluciones: usar los checkpoints de 1°, 1/2° y 1/4° para estudiar cómo cambian los procesos simulados al aumentar la resolución.
- Acoplamiento con modelos atmosféricos o de hielo: emplear el emulador como componente oceánico rápido dentro de pipelines de modelado del sistema terrestre.
- Docencia y prototipado: cargar un checkpoint en una GPU de consumo para experimentar con emuladores neuronales del océano sin acceso a un clúster de simulación física.
- Validación de metodologías de emulación: servir de referencia para comparar técnicas de emulación neuronal de fluidos geofísicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona cualitativamente la estabilidad de los rollouts multi-anuales a 1°, 1/2° y 1/4° y la mejora en campos del océano profundo, sin cifras de error (RMSE, ACC u otras métricas) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 7,2 GB; cada checkpoint individual es una fracción de ese tamaño, pero no se documenta el número de parámetros ni la VRAM exacta por resolución.
- GPU recomendadas: no especificadas por el autor. Dado el carácter convolucional y científico del modelo, se recomienda GPU con soporte CUDA y suficiente memoria para el tamaño de rejilla de cada resolución; a mayor resolución (1/4°), mayor demanda de memoria por el tamaño de los campos.
- GPU de consumo: no se confirma compatibilidad con tarjetas consumer; la viabilidad depende de la resolución y del tamaño de lote, no documentados.
- Opciones de despliegue: PyTorch nativo mediante el repositorio `m2lines/Samudra` (clonado, `uv sync`, carga de checkpoint con `torch.load`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones | Licencia | Disponibilidad |
|---|---|---|---|---|
| Samudra 2 (M2LInES) | Emulador oceánico ConvNeXt U-Net | 1°, 1/2°, 1/4° | CC-BY-4.0 | Hugging Face + GitHub |
| Samudra (versión original, M2LInES) | Emulador oceánico | 1° | no disponible en la información | GitHub `m2lines/Samudra` |
| Modelo físico GFDL OM4 | Simulador oceánico físico | Resolución nativa OM4 | no disponible en la información | Referencia científica |

No se dispone en la información proporcionada de otros emuladores oceánicos comparables (por ejemplo, alternativas de la familia de emuladores neuronales de océano) con datos de parámetros, contexto o rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo emula un simulador concreto (GFDL OM4); sus predicciones heredan los sesgos y limitaciones del modelo físico de referencia y no equivalen a observaciones reales.
- Riesgo de deriva y acumulación de error en rollouts largos: la estabilidad multi-anual se declara por el autor, pero no se cuantifica en la información disponible.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni tareas de razonamiento general.
- No se documentan sesgos específicos, idiomas ni limitaciones de contexto en el sentido habitual de los LLM.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos exactos y las condiciones de citación exigidas por el autor.
- No se especifican los parámetros totales, la VRAM necesaria ni el rendimiento computacional, lo que dificulta planificar el despliegue en producción.
- Uso previsto de investigación científica; no validado para aplicaciones operativas de predicción oceánica en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/M2LInES/Samudra2
- Paper (arXiv): https://arxiv.org/abs/2606.02610
- Código: https://github.com/m2lines/Samudra
- Documentación: https://m2lines.github.io/Samudra/docs/
- Repositorio del Samudra original: https://github.com/m2lines/Samudra
