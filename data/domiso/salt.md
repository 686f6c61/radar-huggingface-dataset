# domiso/Salt

## Resumen

Salt es un método de destilación para generación de video texto-a-video con muy pocos pasos de inferencia (2-4 NFE), desarrollado por un equipo conjunto de la Hong Kong University of Science and Technology y Vivix Group Limited, y presentado en ECCV 2026. El problema que aborda es la dificultad de destilar modelos de difusión de video a presupuestos de inferencia extremadamente bajos: los métodos de destilación por consistencia de trayectoria tienden a producir apariencia sobre-suavizada y movimiento débil, mientras que la destilación por emparejamiento de distribuciones (DMD) sufre de deriva en la composición de los updates de denoising a lo largo de los pasos. Salt propone Self-Consistent Distribution Matching Distillation (SC-DMD), que regulariza explícitamente la composición consistente de updates consecutivos, y un entrenamiento consciente de la caché (cache-distribution-aware training) que trata la caché KV como una condición de calidad.

El modelo se construye sobre el backbone Wan 2.1 y se adapta a paradigmas de generación autoregresiva como Self Forcing, Causal Forcing y LongLive. Se liberan dos checkpoints: uno para Causal Forcing (soporta 2 y 4 pasos) y otro para LongLive (4 pasos). El repositorio de HuggingFace pesa 34.2 GB e incluye los pesos, la colección de prompts de entrenamiento y los archivos de configuración. No se especifican el número de parámetros, la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (método de destilación sobre backbone Wan 2.1, modelo de difusión de video) |
| Parametros totales | no disponible (repo de 34.2 GB con checkpoints en formato .pt) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación de video, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés, pero no se declara oficialmente) |
| Licencia | other (con restricciones; el backbone LongLive tiene licencia CC-BY-NC-SA-4.0 a nivel de archivo; los pesos pueden estar sujetos a licencias de los backbones upstream) |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

Salt no es un modelo base, sino un método de destilación que se aplica sobre un backbone de difusión de video existente, concretamente Wan 2.1. La innovación principal es SC-DMD, que añade una regularización explícita sobre la composición consistente de los updates de denoising consecutivos, evitando el drift en rollouts compuestos. Además, introduce cache-distribution-aware training: trata la caché KV como una condición parametrizada por calidad y aplica SC-DMD sobre rollouts de múltiples pasos, con un objetivo de alineación de características condicionado por la caché que dirige las salidas de baja calidad hacia referencias de alta calidad.

El entrenamiento no requiere un dataset de video: se utiliza una colección de prompts (incluida en el repo como `prompts/vidprom_filtered_extended.txt`) y se aplican recetas de pasos mixtos. Las recetas canónicas muestrean trayectorias de 8, 4 y 2 pasos con probabilidades 0.4 / 0.4 / 0.2. El repositorio de GitHub proporciona recetas para los baselines Self Forcing, Causal Forcing y LongLive, así como para SC-DMD con pasos mixtos y con alineación TRD. Para inferencia, se recomienda usar el generador EMA en el checkpoint de Causal Forcing y el generador regular en el de LongLive.

## Capacidades

- Generación de video texto-a-video con 2 o 4 pasos de inferencia (NFE), según el checkpoint.
- Compatibilidad con tres paradigmas de generación autoregresiva: Self Forcing, Causal Forcing y LongLive (aunque solo se liberan checkpoints para los dos últimos).
- Mejora de la calidad en regímenes de bajo NFE comparado con los baselines sin destilar, tanto en métricas de calidad como semánticas de VBench.
- Soporte para diferentes mecanismos de memoria de caché KV (LongLive, Causal Forcing, etc.).
- No se documentan capacidades de tool calling, agentes, visión multimodal ni razonamiento de texto.

## Casos de uso

- Generación de video en tiempo real para aplicaciones interactivas: con 2-4 NFE, Salt permite latencias suficientemente bajas para entornos de creación de contenido en vivo, donde el usuario ajusta prompts y recibe resultados casi instantáneos.
- Prototipado rápido de contenido visual: equipos de marketing o diseño pueden generar clips de baja fidelidad en segundos para validar conceptos antes de una producción completa.
- Integración en pipelines de edición de video: al ser un método de destilación sobre Wan 2.1, puede usarse como módulo de generación rápida dentro de flujos de postproducción que requieran múltiples iteraciones.
- Investigación en destilación de modelos de difusión: el código y los checkpoints permiten reproducir los experimentos de SC-DMD y comparar con otros métodos de destilación en video.
- Simulación de entornos para entrenamiento de agentes: la generación de video rápida y de bajo coste puede alimentar simuladores visuales para aprendizaje por refuerzo o planificación.
- Generación de video en dispositivos con recursos limitados: al reducir el número de pasos, se reduce el coste computacional total, lo que facilita el despliegue en GPUs de gama media o en entornos con presupuesto de cómputo restringido.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la evaluación en VBench para generación texto-a-video. Se comparan los baselines autoregresivos (Self Forcing, LongLive, Causal Forcing) con sus versiones destiladas con Salt.

| Modelo | NFE | Total | Calidad | Semántica |
| --- | ---: | ---: | ---: | ---: |
| Self Forcing | 4 | 84.20 | 84.74 | 82.05 |
| Salt + Self Forcing | 4 | 84.47 | 85.27 | 81.28 |
| LongLive | 4 | 84.40 | 85.12 | 81.53 |
| Salt + LongLive | 4 | 84.93 | 85.41 | 83.00 |
| Causal Forcing | 4 | 84.62 | 85.41 | 81.47 |
| Salt + Causal Forcing | 4 | 85.08 | 85.96 | 81.59 |
| Salt + Causal Forcing | 2 | 84.80 | 85.63 | 81.49 |

Los resultados muestran que Salt mejora la puntuación total y de calidad en todos los casos, aunque en el caso de Self Forcing la puntuación semántica es ligeramente inferior al baseline. No se han publicado resultados en otros benchmarks (como UCF101, MSR-VTT o EvalCrafter) en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada. Dado que el repositorio pesa 34.2 GB y se basa en Wan 2.1, se estima que la inferencia requiere al menos 24 GB de VRAM en FP16, pero este dato no está confirmado.
- No se indican GPUs recomendadas específicas. Para generación de video con Wan 2.1, se suelen emplear GPUs como A100, H100 o RTX 4090, pero no hay confirmación oficial para Salt.
- No se documenta si es posible ejecutar el modelo en GPUs de consumo (por ejemplo, RTX 3090 o 4090) con cuantización, ya que no se proporcionan versiones cuantizadas.
- Opciones de despliegue: el repositorio de GitHub proporciona un script `inference.py` que carga los checkpoints y ejecuta la generación. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de difusión de video, no un LLM.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

Salt se compara directamente con los baselines autoregresivos sobre los que se aplica: Self Forcing, Causal Forcing y LongLive. Estos son métodos de generación de video autoregresiva con caché KV, y Salt actúa como una capa de destilación que reduce el número de pasos manteniendo o mejorando la calidad.

| Modelo | NFE | VBench Total | Licencia | Disponibilidad |
| --- | ---: | ---: | --- | --- |
| Self Forcing | 4 | 84.20 | no disponible | no disponible |
| Salt + Self Forcing | 4 | 84.47 | other | checkpoints no liberados |
| LongLive | 4 | 84.40 | CC-BY-NC-SA-4.0 (archivo) | no disponible |
| Salt + LongLive | 4 | 84.93 | other | checkpoint liberado |
| Causal Forcing | 4 | 84.62 | no disponible | no disponible |
| Salt + Causal Forcing | 4 | 85.08 | other | checkpoint liberado |

No se dispone de información sobre otros métodos de destilación de video comparables (como LCM, DMD genérico o métodos de consistencia) en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia es "other" y se advierte que el backbone LongLive tiene una licencia CC-BY-NC-SA-4.0 a nivel de archivo, lo que impide el uso comercial sin revisión cuidadosa. Los pesos pueden estar sujetos a las licencias de los backbones upstream (Wan 2.1).
- Solo se liberan dos checkpoints: uno para Causal Forcing y otro para LongLive. No se proporcionan pesos para la variante Self Forcing, a pesar de que se reportan resultados.
- Dependencia del backbone: Salt no es un modelo autónomo; requiere la instalación previa de Wan 2.1 y sus dependencias, lo que añade complejidad de despliegue.
- No se documentan sesgos ni riesgos de alucinación visual. Al ser un modelo de generación de video, puede producir contenido no deseado o inexacto, pero no hay evaluación de seguridad publicada.
- La información sobre idiomas es inexistente; los prompts de ejemplo están en inglés, pero no se garantiza el rendimiento en otros idiomas.
- No se proporcionan métricas de rendimiento en hardware específico, por lo que es difícil estimar la viabilidad en entornos de producción con requisitos de latencia estrictos.
- El repositorio de HuggingFace tiene 0 descargas y 1 like, lo que sugiere que el modelo es muy reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/domiso/Salt
- arXiv (paper): https://arxiv.org/abs/2604.03118
- Página del proyecto: https://xingtongge.github.io/Salt/
- Repositorio GitHub: https://github.com/XingtongGe/Salt
