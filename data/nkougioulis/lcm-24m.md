# nkougioulis/LCM-24M

## Resumen

LCM-24M es un modelo de descubrimiento causal temporal publicado por Nikolaos Kougioulis y colaboradores (Universidad de Creta, entre otras instituciones) en el marco de la familia Large Causal Models (LCM). No es un modelo de lenguaje: es una red neuronal entrenada específicamente para inferir la estructura causal entre variables de una serie temporal, es decir, para producir una matriz de adyacencia con retardos (lagged adjacency) que indica qué variable influye sobre cuál y con qué desfase temporal.

El modelo resuelve un problema clásico de la estadística causal (descubrimiento de estructura a partir de datos observacionales) sustituyendo los algoritmos tradicionales por una red entrenada que generaliza entre distintos procesos generadores de datos. Con 24 millones de parámetros (23.770.544 según la model card; 24.035.760 según los pesos en safetensors) y una ventana de hasta 12 variables y 3 retardos sobre secuencias de hasta 500 pasos temporales, se sitúa en la gama "large" de su familia.

Es relevante porque aplica el paradigma de los modelos fundacionales a un dominio donde hasta ahora dominaban métodos algorítmicos frágiles ante ruido, no linealidades o muestras pequeñas. Su licencia Apache 2.0 y su empaquetado como módulo PyTorch (librería `lcm-pytorch`) facilitan su integración en pipelines de análisis, aunque su adopción real dependerá de la validación empírica frente a baselines clásicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda para descubrimiento causal temporal (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 23.770.544 (model card) / 24.035.760 (safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Secuencia temporal maxima de 500 pasos; 12 variables maximas; 3 retardos maximos |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo sobre series temporales, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch via `PyTorchModelHubMixin`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de capas, atencion, mecanismo de agregacion temporal, etc.). Lo que si se conoce es su interfaz funcional: recibe como entrada la serie temporal `X` con forma `(T, n_vars)` rellenada a `n_vars=12` y `T=500`, junto con una matriz de correlación cruzada con retardos (`lagged_batch_crosscorrelation(X, 3)`), y devuelve un tensor de adyacencia con retardos de forma `(1, 12, 12, 3)` que, tras aplicar sigmoide, representa la probabilidad de cada arco causal.

El modelo forma parte de la familia LCM descrita en el paper "Large Causal Models for Temporal Causal Discovery" (ECML PKDD 2026). El enfoque de la familia es entrenar un modelo sobre múltiples procesos generadores de datos sintéticos para que aprenda a inferir estructura causal de forma amortizada, en lugar de ejecutar un algoritmo de búsqueda por instancia. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si se empleó RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Descubrimiento causal temporal: infiere qué variables influyen sobre cuáles y con qué retardo (hasta 3 lags) en series temporales multivariantes de hasta 12 variables.
- Salida probabilística: devuelve un tensor de adyacencia con retardos que, tras sigmoide, da una probabilidad por arco, lo que permite umbralizar según el coste del falso positivo.
- Manejo de series de hasta 500 pasos temporales.
- Inferencia en GPU o CPU mediante PyTorch estándar.
- Integración con `transformers`/`huggingface_hub` a través de `PyTorchModelHubMixin` (`from_pretrained`).
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo especializado en un único tipo de tarea.

## Casos de uso

- Análisis de causalidad en datos de sensores industriales: dado un conjunto de hasta 12 sensores con 500 lecturas, el modelo produce un grafo causal con retardos que ayuda a identificar qué variable precede y desencadena una anomalía, útil para mantenimiento predictivo.
- Genómica y biología de sistemas: inferencia de redes de regulación génica a partir de series de expresión temporal, donde el límite de 12 variables encaja con experimentos de panel reducido.
- Series financieras multivariantes: análisis de propagación de shocks entre índices o activos (hasta 12 series) con retardos de hasta 3 periodos, para estudios de contagio.
- Monitorización de infraestructura TI: identificación de dependencias causales entre métricas (CPU, memoria, latencia, errores) para distinguir síntomas de causas raíz en incidentes.
- Investigación metodológica en causalidad: uso como baseline aprendido frente a algoritmos clásicos (PCMCI, Granger, etc.) en experimentos académicos.
- Análisis de datos clínicos longitudinales: detección de relaciones temporales entre variables fisiológicas de un paciente o cohorte reducida, con la cautela propia de datos observacionales.
- Prototipado en entornos con pocos recursos: al tener 24 M de parámetros, se puede ejecutar en una GPU de consumo o incluso en CPU para lotes pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de precisión, recall o F1 frente a baselines; habría que consultar el paper (ECML PKDD 2026) para obtener métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 100 MB en FP32 (24 M de parámetros × 4 bytes) más el overhead de activaciones para secuencias de longitud 500; en la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes.
- Cabe en GPU de consumo: sí, con holgura. También funciona en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo a través de la librería `lcm-pytorch` (instalable desde GitHub); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limites | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LCM-24M | 24 M | 12 variables, 3 lags, 500 pasos | Descubrimiento causal temporal | Apache 2.0 | Hugging Face + GitHub |
| PCMCI / PCMCI+ | No aplica (algoritmo) | Configurable | Descubrimiento causal temporal | Depende de implementación (p. ej. tigramite, GPL) | Software clásico |
| Granger causality | No aplica (estadístico) | Configurable | Causalidad temporal lineal | No aplica | Implementaciones múltiples |
| Modelos LCM de menor tamano (familia) | No disponible | No disponible | Descubrimiento causal temporal | Apache 2.0 (presumiblemente) | Hugging Face (no verificado) |

La comparación con algoritmos clásicos es la más informativa: LCM-24M aporta inferencia amortizada (una pasada por delante) frente a la búsqueda por instancia de PCMCI, a cambio de estar restringido a 12 variables y 3 lags y de requerir confianza en la distribución de entrenamiento.

## Limitaciones y advertencias

- Límite duro de 12 variables y 3 retardos: no escala a problemas de mayor dimensión sin reentrenamiento o adaptación.
- Ventana máxima de 500 pasos temporales; series más largas deben segmentarse, lo que puede romper dependencias de largo alcance.
- El modelo infiere estructura a partir de datos observacionales; no identifica efectos causales intervencionales sin supuestos adicionales (suficiencia causal, ausencia de confusores ocultos).
- No hay datos publicados de robustez ante ruido, no estacionariedad o datos faltantes en la informacion disponible.
- Riesgo de falsos positivos/negativos en los arcos: la salida es probabilística y requiere umbralización calibrada al caso de uso.
- Sesgos: al entrenarse sobre procesos generadores de datos sintéticos, puede tener sesgo hacia las familias de procesos incluidas en el entrenamiento y degradarse en dominios fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el paper y el repositorio para condiciones adicionales de citación.
- Advertencia de producción: validar el modelo frente a baselines en el dominio concreto antes de tomar decisiones basadas en sus grafos; no usar como única fuente para decisiones críticas.

## Enlaces

- Hugging Face: https://huggingface.co/nkougioulis/LCM-24M
- Paper (referencia en Hugging Face): https://huggingface.co/papers/2602.18662
- Repositorio de código: https://github.com/kougioulis/LCM
- README del repositorio: https://github.com/kougioulis/LCM (README.md)
- Cita: Kougioulis et al., "Large causal models for temporal causal discovery", ECML PKDD 2026, pp. 414–429, Springer.
