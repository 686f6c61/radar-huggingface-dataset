# adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp4

## Resumen

Celerity 271M 8K es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de 271 millones de parámetros entrenado por Cerebras y publicado en Hugging Face por el usuario adpretko. Se trata de una ablación concreta dentro de un barrido de hiperparámetros sobre el régimen de tokens por parámetro (TPP), en este caso con un valor nominal de 4 TPP y un endpoint de attention dropout de 0. El modelo se distribuye como conversión del checkpoint original de Cerebras (`checkpoint_4722.mdl`) al formato de Hugging Face, con código personalizado bajo `trust_remote_code=True`.

El modelo está diseñado para secuencias de hasta 8192 tokens y emplea embeddings posicionales ALiBi, una elección que favorece la extrapolación de longitud de contexto respecto a alternativas absolutas. El entrenamiento se realizó sobre CommonPile, en concreto sobre el pool "corrected no-repeat TPP", con 4722 pasos y aproximadamente 1083 millones de tokens vistos en 2 sistemas CSX. Su interés es principalmente metodológico: permite estudiar el efecto del régimen TPP y de la schedule de dropout en modelos pequeños de contexto largo.

No obstante, conviene subrayar que se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card funcional más allá de los metadatos de entrenamiento, sin licencia declarada y sin idiomas especificados. No debe considerarse un modelo listo para producción, sino una pieza de un experimento reproducible de ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi (detalles de capas y cabezas no disponibles) |
| Parametros totales | 271M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (repositorio de 0.5 GB), con `custom_code` y carga mediante `trust_remote_code=True` |

## Arquitectura y entrenamiento

La información disponible confirma una arquitectura transformer con posición codificada mediante ALiBi (*Attention with Linear Biases*), lo que evita embeddings posicionales aprendidos y facilita la generalización a longitudes distintas de las vistas en entrenamiento. La longitud máxima de secuencia declarada es de 8192 tokens. No se especifican en la model card el número de capas, dimensión oculta, número de cabezas de atención ni el tipo exacto de normalización o activación, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se llevó a cabo con 2 sistemas CSX de Cerebras y el runtime `cbcore 2.6.0`, durante 4722 pasos con un batch global de 28, lo que arroja 1 083 113 472 tokens procesados (aproximadamente 4 tokens por parámetro nominal). Se usó el dataset CommonPile, restringido al pool "corrected no-repeat TPP". Los hiperparámetros documentados incluyen una tasa de aprendizaje pico de 0.15, weight decay de 0.003618281275599213 y un `tau_ema` de 0.39019386207371326. El endpoint de attention dropout es 0, con una schedule lineal dependiente de la capa; el autor aclara explícitamente que los valores no nulos de esta schedule no son probabilidades uniformes de dropout. El dropout residual, stochastic depth y LayerDrop son todos 0.0. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva a partir de un modelo de 271M de parámetros; no hay evidencia publicada de evaluaciones de calidad.
- Manejo de contextos de hasta 8192 tokens gracias a ALiBi, útil para tareas de contexto medio-largo en experimentación.
- Capacidad multilingüe: no disponible; no se declaran idiomas ni se documenta la composición lingüística del subconjunto de CommonPile utilizado.
- Tool calling / function calling: no disponible; no se documenta ningún formato de herramientas ni plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento específico para ello.
- Modo "thinking", visión o audio: no disponibles; el modelo es exclusivamente de texto según la información proporcionada.
- Uso como checkpoint de ablación: permite reproducir y comparar el efecto del régimen TPP y de la schedule de attention dropout en un mismo esqueleto de modelo.

## Casos de uso

- Investigación sobre escalado de tokens por parámetro: el checkpoint forma parte de un barrido TPP con valor nominal 4, por lo que sirve para comparar curvas de pérdida y calidad frente a otros puntos del mismo experimento bajo idénticas condiciones de datos y hardware.
- Estudio de schedules de dropout en atención: al documentarse un endpoint de dropout 0 con schedule lineal por capa, el modelo permite aislar el efecto de esta decisión de diseño en modelos pequeños de contexto largo.
- Evaluación de ALiBi en contextos de 8K: útil para medir degradación de perplejidad al variar la longitud de entrada entre 512 y 8192 tokens en un modelo de 271M, un tamaño manejable para experimentos académicos.
- Reproducción de pipelines de conversión Cerebras a Hugging Face: el repositorio incluye el commit del conversor (`0e3d5d375695293479df9d2a3717f05f71a345b4`), lo que facilita validar el proceso de portabilidad de checkpoints `.mdl` a formato PyTorch.
- Baseline en estudios de eficiencia: con 0.5 GB de pesos, es adecuado como referencia de bajo coste para comparar técnicas de cuantización, destilación o poda en modelos de menos de 300M de parámetros.
- Docencia y experimentación con `trust_remote_code`: sirve para ilustrar el flujo de carga de modelos con código personalizado en Hugging Face, incluyendo la gestión de dependencias y la desactivación de dropout con `model.eval()`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1.1 GB solo para pesos (271M × 4 bytes), más activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en fp16/bf16: aproximadamente 0.55 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 0.3 GB para pesos; en 4 bits, en torno a 0.15 GB, aunque no se documentan artefactos GGUF ni recetas de cuantización oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o ajuste fino se recomiendan A100 o H100 por comodidad, aunque no son necesarias por tamaño.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 8 GB de VRAM, incluso en fp32.
- Opciones de despliegue: carga mediante `transformers` con `trust_remote_code=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la presencia de `custom_code` puede requerir adaptaciones para servidores de inferencia estándar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Celerity 271M 8K (este checkpoint) | 271M | 8192 | no disponible | Hugging Face, código personalizado | Ablación TPP=4, ALiBi, sin benchmarks |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face, transformers nativo | Referencia clásica de modelos pequeños; contexto muy inferior |
| Pythia 410M | 410M | 2048 | Apache 2.0 | Hugging Face, transformers nativo | Suite de investigación con checkpoints intermedios y benchmarks públicos |
| Cerebras-GPT 256M | 256M | 2048 | Apache 2.0 | Hugging Face | Familia de Cerebras con escalado Chinchilla documentado; contexto menor |

La comparación es aproximada: no se dispone de resultados de benchmarks del checkpoint Celerity que permitan contrastar calidad frente a estas alternativas. La principal diferencia práctica es el contexto de 8192 tokens y el uso de ALiBi, frente a los 1024-2048 tokens de los modelos de tamaño similar citados.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni tareas similares, por lo que no debe asumirse un rendimiento comparable a otros modelos de 271M.
- Licencia no declarada: no se especifican términos de uso comercial, lo que impide su adopción en producción sin aclaración previa del autor.
- Idiomas no declarados: se desconoce la cobertura lingüística real; el subconjunto de CommonPile utilizado no está documentado en la model card.
- Riesgo de alucinación: al ser un modelo pequeño preentrenado sin fases de alineamiento documentadas, la probabilidad de generar contenido factualmente incorrecto es alta.
- Sesgos: no se documenta ningún análisis de sesgos; los datos de CommonPile pueden arrastrar sesgos de las fuentes originales.
- Dependencia de `trust_remote_code=True`: la carga requiere ejecutar código del repositorio, lo que implica un riesgo de seguridad que debe evaluarse en entornos aislados.
- Naturaleza de ablación: el checkpoint corresponde a un punto concreto de un barrido de hiperparámetros y no a un modelo final optimizado; puede presentar un rendimiento inferior a otros puntos del mismo experimento.
- Sin plantilla de chat ni formato de instrucciones: no se documenta ningún formato conversacional, por lo que su uso en tareas de instrucción requeriría ajuste fino adicional.
- Fecha de creación futura (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp4
- Commit del conversor citado en la model card: `0e3d5d375695293479df9d2a3717f05f71a345b4` (repositorio de conversión no enlazado en la información disponible)
- Dataset CommonPile: no se proporciona enlace en la información disponible
- Paper o blog de la familia Celerity: no disponible
- Repositorio de código de Cerebras (cbcore): no disponible en la información proporcionada
