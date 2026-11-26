# credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswag

## Resumen

olmo2-1B-288domains-dirichlet-exponential-hellaswag es un modelo de lenguaje de 1.414.678.528 parámetros desarrollado por credible-ai, construido sobre la arquitectura OLMo 2 de AI2 y entrenado desde cero con 32.000 millones de tokens procedentes del corpus WebOrganizer. No es un modelo de propósito general: se trata de un artefacto de investigación diseñado para reproducir los experimentos del paper LinMix, que estudia la mezcla de datos de preentrenamiento como un problema de atribución lineal por dominio.

La particularidad del modelo reside en su dataset de entrenamiento. Los 32B de tokens no se han muestreado de forma uniforme, sino que se han mezclado a partir de 288 dominios definidos por la combinación de temática y formato del contenido web, con pesos optimizados mediante Olmix (un ajuste de sustituto exponencial sobre un enjambre de distribuciones de Dirichlet) para maximizar el rendimiento en el benchmark HellaSwag. El resultado es un modelo cuyo perfil de datos está sesgado deliberadamente hacia la tarea de evaluación.

Es relevante ahora porque ejemplifica una línea de trabajo creciente en la investigación de mezclas de datos: usar modelos proxy pequeños para estimar pesos de mezcla óptimos y transferirlos a modelos mayores. El modelo se publica con pesos en bfloat16, licencia MIT y el fichero `mix.json` con la mezcla exacta de datos, lo que facilita la reproducibilidad de los resultados del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 18 |
| Tamano oculto | 2048 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 32.000 millones |
| Framework de entrenamiento | OLMo-core |
| Tamano del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2, un transformer decoder-only con 18 capas y dimensión oculta de 2048, implementado en Transformers como `Olmo2ForCausalLM`. Usa el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 entradas, lo que lo alinea con el ecosistema de modelos OLMo y facilita la comparación directa con otras variantes de la familia. Los pesos se distribuyen en bfloat16.

El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens del corpus WebOrganizer, derivado del pool DCLM 1b-1x (CC-BY-4.0). La innovación técnica no está en la arquitectura sino en la estrategia de mezcla de datos: el corpus se particiona en 288 dominios (producto cartesiano de temática y formato), y los pesos de muestreo se optimizan con Olmix, que ajusta un sustituto exponencial sobre un enjambre de distribuciones de Dirichlet evaluadas con un modelo proxy de 60M parámetros (`olmo2-60M-288domains-dirichlet`). La mezcla final se selecciona para maximizar HellaSwag. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste fino posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, con el nivel de calidad esperable de un modelo de 1,4B entrenado con 32B de tokens.
- Razonamiento básico de sentido común, favorecido por la optimización explícita de la mezcla hacia HellaSwag.
- Modelado de lenguaje general sobre contenido web de múltiples temáticas y formatos (los 288 dominios del corpus).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Reproducción de experimentos de mezcla de datos: el modelo sirve para validar los resultados del paper LinMix cargando los pesos y el `mix.json` y comparando con otras mezclas del mismo corpus.
- Investigación sobre atribución de dominios: permite estudiar cómo la composición de la mezcla afecta al rendimiento en tareas concretas, aislando el efecto de los pesos por dominio.
- Baseline en estudios de scaling de mezclas: al compartir arquitectura y tokenizador con la familia OLMo 2, se puede comparar directamente con variantes entrenadas con mezclas uniformes o con otros optimizadores.
- Evaluación de metodologías de optimización de datos: útil como punto de referencia para contrastar Olmix frente a otras técnicas (por ejemplo, optimización basada en bandits o en gradientes de proxy).
- Docencia e investigación en data-centric AI: modelo pequeño (2,8 GB) que cabe en hardware modesto y permite experimentar con recetas de preentrenamiento sin grandes presupuestos de cómputo.
- Generación de texto en inglés para pruebas de integración: su tamaño reducido permite desplegarlo en entornos de desarrollo para validar pipelines de inferencia con Transformers antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la mezcla de datos se optimizó para HellaSwag, pero no reporta la puntuación obtenida ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV (estimación práctica de 4-6 GB según longitud de secuencia).
- VRAM en cuantización de 8 bits: en torno a 1,5 GB; en 4 bits, alrededor de 0,8-1 GB (estimaciones, ya que el autor no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). Cabe holgadamente en GPUs de consumo.
- Despliegue: compatible con Transformers de forma nativa; al ser un modelo OLMo 2, es susceptible de convertirse a GGUF para llama.cpp/Ollama y de servirse con vLLM o TGI, aunque el autor no publica artefactos para estas herramientas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-exponential-hellaswag | 1,41B | no disponible | MIT | Hugging Face | Mezcla optimizada para HellaSwag; artefacto de investigación |
| OLMo 2 1B (AI2) | ~1,4B | no disponible | Apache 2.0 | Hugging Face | Modelo base de propósito general sobre el que se inspira la arquitectura |
| olmo2-60M-288domains-dirichlet (credible-ai) | ~60M | no disponible | no disponible | Hugging Face | Proxy usado para optimizar la mezcla; mucho menor |
| Modelos densos ~1B de propósito general (p. ej. familia Llama 3.2 1B) | ~1,2-1,4B | hasta 128K en algunas variantes | licencia comunitaria | Hugging Face | Entrenados con más tokens y ajuste instructivo; no comparables en objetivos |

La comparación directa con modelos de propósito general no es del todo justa: este modelo está entrenado con 32B de tokens y sin fase instructiva, por lo que su rendimiento en tareas abiertas será inferior. Su valor está en la reproducibilidad de la receta de mezcla, no en la calidad absoluta.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación para reproducir LinMix.
- Entrenado únicamente con 32B de tokens, muy por debajo de los estándares actuales para modelos de 1B, lo que limita su calidad en generación abierta.
- Solo soporta inglés; no se documentan capacidades multilingües.
- La mezcla de datos está optimizada para HellaSwag, lo que puede introducir sesgo hacia el formato y los temas de ese benchmark y penalizar otras tareas.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, propio de un modelo base sin ajuste instructivo ni alineamiento.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- La licencia de los pesos es MIT, pero los datos de entrenamiento provienen de DCLM (CC-BY-4.0) y de Common Crawl, sujetos a sus propios términos de uso; conviene revisarlos antes de un uso comercial.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con secuencias largas.
- No hay versiones cuantizadas oficiales ni plantillas de chat publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswag
- Modelo proxy: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
