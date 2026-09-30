# francesca9805/dan-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/dan-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/dan_latn_100mb`, un GPT-2 monolingüe de 124,77 millones de parámetros orientado a danés en escritura latina. Lo publica el usuario de HuggingFace `francesca9805` y se ha entrenado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1. Por el nombre del repositorio, el experimento parece corresponder a una ablación con 10 MB de datos empaquetados ("packed") y una semilla concreta (455), dentro de una familia de variantes con distintas semillas y tamaños de datos publicadas por el mismo autor.

Se trata, por tanto, de un modelo pequeño de investigación más que de un modelo de producción: el repositorio ocupa 0,3 GB, no acumula descargas ni valoraciones y no incluye información sobre el corpus de ajuste, el número de tokens vistos, la licencia ni los idiomas soportados más allá de lo que sugiere el identificador del modelo base. El pipeline declarado es `text-generation` y los tags incluyen `sft`, `trl`, `generated_from_trainer` y `endpoints_compatible`, lo que indica compatibilidad con Text Generation Inference.

Su relevancia es fundamentalmente metodológica: sirve para estudiar recetas de ajuste supervisado, tokenizadores y eficiencia de datos en lenguas de recursos medios como el danés, y para reproducir experimentos controlados comparando semillas y volúmenes de datos. No hay evidencia publicada de que se haya evaluado en benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (según tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (arquitectura GPT-2, típicamente 1024 tokens en el modelo base; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se ofrecen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible oficialmente; el identificador del modelo base (`dan_latn`) apunta a danés en escritura latina |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | goldfish-models/dan_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atención causal completa, normalización previa a la atención y embeddings de tokens y posiciones aprendidos. El tamaño declarado (124.770.816 parámetros) coincide con la escala de GPT-2 small (aproximadamente 124M), y el tag `gpt2` del repositorio confirma esa familia. El modelo parte de `goldfish-models/dan_latn_100mb`, un modelo monolingüe del proyecto Goldfish entrenado sobre 100 MB de texto en danés, por lo que la mayor parte del conocimiento lingüístico proviene de ese preentrenamiento y el ajuste posterior es de tipo instructivo/supervisado.

El entrenamiento se ha realizado con SFT mediante TRL, según la model card, con versiones de framework documentadas (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1). El autor enlaza una ejecución de Weights & Biases para los detalles de la curva de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de SFT, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El sufijo del nombre (`Dp-10mb-packed-bfdiso_seed455`) sugiere un experimento con 10 MB de datos empaquetados y la semilla 455, pero esto es una inferencia a partir de la nomenclatura y no un dato documentado.

## Capacidades

- Generación de texto autoregresiva en el estilo y la lengua del modelo base, presumiblemente danés.
- Respuesta a instrucciones en formato conversacional: la model card incluye un ejemplo con `pipeline("text-generation")` que pasa una lista de mensajes con `role` y `content`.
- Ajuste supervisado sobre pares instrucción-respuesta, lo que permite generar continuaciones condicionadas a una pregunta.
- Compatibilidad con Text Generation Inference y con el ecosistema `transformers` (tags `text-generation-inference` y `endpoints_compatible`).
- Capacidad multilingüe: no disponible; el modelo base es monolingüe de danés, por lo que se espera un rendimiento muy limitado fuera de esa lengua.
- Tool calling / function calling: no disponible; no hay evidencia de plantillas de herramientas ni de entrenamiento en ese formato.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; no hay indicios de ninguna de estas capacidades.
- Comportamiento como agente multi-paso: no disponible y poco probable dado el tamaño y el tipo de ajuste.

## Casos de uso

- Investigación sobre eficiencia de datos en ajuste supervisado: comparar esta variante (10 MB empaquetados, semilla 455) con las demás variantes del mismo autor permite aislar el efecto de la semilla y del volumen de datos en un presupuesto de cómputo mínimo.
- Experimentos de tokenización en lenguas de recursos medios: al derivar del proyecto Goldfish, el modelo sirve como punto de partida para medir cómo distintas tokenizaciones afectan a la generación en danés.
- Generación de texto corto en danés para prototipos: con 124M de parámetros puede producir frases y párrafos breves en una GPU de consumo, útil para maquetas de producto antes de invertir en modelos mayores.
- Generación de datos sintéticos de bajo coste: se puede usar para producir borradores en danés que después se filtren manualmente y alimenten otros pipelines de entrenamiento.
- Docencia y prácticas de ajuste fino: el tamaño del repositorio (0,3 GB) y su naturaleza autocontenida lo hacen adecuado para enseñar SFT con TRL de principio a fin en un portátil con GPU modesta.
- Investigación sobre olvido catastrófico: comparar el modelo ajustado con su base `goldfish-models/dan_latn_100mb` permite estudiar cuánta capacidad lingüística general se degrada tras un ajuste SFT con pocos datos.
- Despliegue en entornos con restricciones de memoria: cabe en GPUs integradas o en CPU con cuantización a int8, lo que permite demos locales sin conexión.
- Pruebas de reproducibilidad de recetas: la existencia de múltiples semillas publicadas facilita replicar resultados y auditar la varianza del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los resultados de búsqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K, evaluación en danés (por ejemplo, Danish Gigaword o ScaLA) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,5 GB solo para pesos, más activaciones y caché KV; en la práctica, menos de 1,5 GB para contextos cortos.
- VRAM estimada en bf16/fp16: alrededor de 0,25 GB de pesos; cómodo en cualquier GPU con 4 GB o más.
- VRAM estimada en int8: aproximadamente 0,13 GB de pesos; viable incluso en CPU.
- VRAM estimada en 4 bits: del orden de 0,07-0,08 GB de pesos, aunque no hay cuantizaciones publicadas por el autor y habría que generarlas.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090, A100 o H100 están sobradamente dimensionadas. El modelo también funciona en CPU y en GPUs integradas.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos años, y también en muchos sistemas embebidos con suficiente RAM.
- Opciones de despliegue: `transformers` (soporte confirmado), Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), y servicios de terceros como FriendliAI para variantes hermanas. No hay GGUF oficial, aunque la arquitectura GPT-2 es convertible con herramientas como llama.cpp o Ollama.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera un throughput alto y una latencia de milisegundos por token en GPU, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/dan-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455 | 124,77 M | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT del base Goldfish danés |
| goldfish-models/dan_latn_100mb | aproximadamente 124 M | no disponible | no disponible en la información proporcionada | HuggingFace | Modelo base preentrenado con 100 MB de danés |
| francesca9805/dan-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10 | no disponible (presumiblemente idéntico) | no disponible | no disponible | HuggingFace | Variante con otra semilla, mismo esquema experimental |
| francesca9805/dan-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455 | no disponible (presumiblemente idéntico) | no disponible | no disponible | HuggingFace y FriendliAI | Variante con 100 MB en lugar de 10 MB |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente a modelos daneses de mayor tamaño, por lo que la comparación se limita a parámetros, procedencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de un corpus de 100 MB en danés, hereda los sesgos de esa fuente, que no se describe.
- Riesgo de alucinación: alto. Con 124M de parámetros y un corpus de preentrenamiento pequeño, la generación factual fiable es muy limitada.
- Limitaciones de contexto: no se ha confirmado la ventana máxima; si se hereda la configuración estándar de GPT-2, estaría en torno a 1024 tokens, insuficiente para tareas de contexto largo.
- Limitaciones de idioma: el modelo base es monolingüe de danés; no hay evidencia de competencia en castellano ni en otras lenguas.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada. Antes de cualquier uso comercial es imprescindible consultar la licencia del modelo base y la del repositorio.
- Trazabilidad: no se documentan el dataset de SFT, el número de tokens de entrenamiento ni los criterios de filtrado, lo que dificulta auditar el modelo.
- Madurez: cero descargas y cero valoraciones, sin evaluación publicada. No es apto como componente crítico en producción sin una evaluación propia.
- Formato: solo hay safetensors; no hay versiones cuantizadas oficiales, por lo que cualquier despliegue en llama.cpp, Ollama o similar requiere una conversión y validación adicionales.
- Fecha de creación declarada (2026-09-29): conviene verificar la coherencia temporal de los metadatos antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/dan-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/dan_latn_100mb
- Variante con semilla 10: https://huggingface.co/francesca9805/dan-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante con 100 MB de datos: https://huggingface.co/francesca9805/dan-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/m6znnkbk
- Repositorio de TRL: https://github.com/huggingface/trl
- Ficha en Free2AITools: https://free2aitools.com/model/francesca9805/dan-latn-100mb-ppt-dp-10mb-packed-bfd_seed455
- Despliegue en FriendliAI (variante de 100 MB): https://friendli.ai/models/francesca9805/dan-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455
