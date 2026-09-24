# francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed455

## Resumen

`francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed455` es un modelo de generación de texto de tipo transformer decoder-only (etiquetado como `gpt2` en HuggingFace) con 86.508.288 parámetros, publicado por el usuario `francesca9805`. Se trata de un fine-tuning del modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingüe inglés de la familia Goldfish entrenado sobre aproximadamente 100 MB de texto. El ajuste se ha realizado mediante *supervised fine-tuning* (SFT) con la librería TRL, según indica la propia model card.

El modelo no resuelve un problema de producto concreto: por su nomenclatura (`ppt`, `wc-uniform`, `newlex`, `isl`, `seed455`) y por el contexto de publicación, parece un artefacto de investigación asociado a experimentos sobre tokenizadores, léxicos o currículos de datos, con una semilla concreta. No se documentan benchmarks, licencia, idiomas soportados ni composición del dataset de entrenamiento, y el repositorio acumula 0 descargas y 0 *likes* en el momento de redactar esta ficha.

Su relevancia es, por tanto, limitada y acotada al ámbito experimental: resulta útil como punto de partida reproducible para estudiar el efecto de un SFT ligero sobre un modelo base pequeño multilingüe/monolingüe, o como componente didáctico por su reducido tamaño (0,2 GB de repositorio). No debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 86.508.288 (≈86,5 M), dato real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base es `eng_latn_100mb`, orientado a inglés; la model card no declara idiomas) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido válido) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo de la familia GPT-2, heredada del modelo base `goldfish-models/eng_latn_100mb`. Con 86,5 M de parámetros, se sitúa en el rango de GPT-2 small (124 M) y ligeramente por encima de DistilGPT-2 (82 M). No se documentan innovaciones arquitectónicas propias: no hay mezcla de expertos (MoE), ni atención lineal, ni mecanismos híbridos SSM/transformer, ni decodificación especulativa declarada. El modelo se distribuye únicamente en `safetensors`, sin versión GGUF.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. Existe un registro del entrenamiento en Weights & Biases bajo el proyecto `new-tokenizers` del usuario `f-padovani-university-of-groningen`, lo que sugiere un contexto académico (Universidad de Groningen) centrado en experimentos con tokenizadores. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO; la model card únicamente menciona SFT.

## Capacidades

- Generación de texto autorregresiva, expuesta a través del pipeline `text-generation` de Transformers.
- Formato conversacional: el ejemplo de la model card invoca el pipeline con una lista de mensajes `[{"role": "user", "content": ...}]`, lo que sugiere la existencia de una plantilla de chat, aunque no se confirma explícitamente en la documentación.
- Compatibilidad declarada con text-generation-inference (`text-generation-inference` y `endpoints_compatible` entre las etiquetas), lo que permite desplegarlo como endpoint HTTP.
- Capacidad multilingüe: no declarada. El modelo base es de idioma inglés (`eng_latn`), por lo que el uso fiable en otros idiomas no está garantizado.
- Razonamiento, matemáticas, código, *tool calling*, uso de agentes, visión o audio: no documentados y poco probables con 86,5 M de parámetros y un SFT ligero.
- No se declara modo de pensamiento (*thinking*), *function calling* ni razonamiento multi-paso.

## Casos de uso

- Reproducción de experimentos académicos sobre tokenizadores: el nombre del modelo y el registro de W&B apuntan a estudios de tokenización o léxico; puede emplearse como réplica de una configuración concreta (semilla 455) para comparar con otras variantes del mismo autor.
- Ablaciones de SFT en modelos pequeños: sirve para medir cuánto cambia el comportamiento de un base GPT-2 de 100 MB tras un ajuste supervisado con una receta y semilla determinadas.
- Prototipado local en CPU: con ≈0,35 GB en fp32 y ≈0,17 GB en fp16, cabe en cualquier portátil y permite iterar en pipelines de Transformers sin GPU.
- Generación de datos sintéticos a pequeña escala: puede producir continuaciones de texto para *data augmentation* o pruebas de *smoke testing* de pipelines, siempre con revisión humana posterior.
- Docencia y demostraciones: su tamaño permite mostrar de forma práctica el ciclo completo de fine-tuning, evaluación y despliegue con TRL y Transformers en un aula o taller.
- Pruebas de integración de infraestructura: útil para validar *deployment* con TGI, endpoints compatibles o servidores de inferencia antes de migrar a modelos mayores, gracias a su huella de memoria mínima.
- *Baseline* en evaluaciones internas: como referencia de bajo coste frente a modelos base más grandes en tareas de generación en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplexity ni ninguna otra métrica, y no se ha localizado una evaluación independiente del modelo.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en cualquier precisión razonable. En fp32 el peso ocupa ≈346 MB; en fp16/bf16 ≈173 MB; en int8 ≈86 MB. A ello hay que sumar memoria para activaciones y caché KV, que en un modelo de este tamaño es marginal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090. También es viable en CPU (inferencia en decenas o centenas de milisegundos por *token* según hardware).
- Compatibilidad con GPU de consumo: sí, en todas las gamas actuales; incluso en iGPU y en ejecución exclusiva por CPU.
- Opciones de despliegue: Transformers (nativo), text-generation-inference (etiqueta `endpoints_compatible`), y previsiblemente vLLM. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed455`) | 86,5 M | no disponible | no disponible | HuggingFace, safetensors, 0 descargas | Fine-tuning SFT de un base GPT-2 de 100 MB |
| `goldfish-models/eng_latn_100mb` (base) | ≈86,5 M (derivado) | no disponible | no disponible | HuggingFace | Modelo monolingüe inglés entrenado con ~100 MB de texto |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT modificada | Ampliamente disponible | Referencia clásica de la misma familia; más parámetros y ecosistema maduro |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Ampliamente disponible | Destilado de GPT-2; menor coste de inferencia y documentación extensa |

La comparación es aproximada: no hay datos públicos de rendimiento de este modelo que permitan contrastarlo objetivamente con las alternativas.

## Limitaciones y advertencias

- Licencia no especificada: la model card contiene un campo `licence: license` sin valor válido. No se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, y con 86,5 M de parámetros el rendimiento en razonamiento, matemáticas o código será muy limitado en comparación con modelos actuales.
- Riesgo elevado de alucinación y de incoherencia en generaciones largas, especialmente fuera del dominio del corpus de ajuste.
- Sesgos: al derivar de un corpus de 100 MB en inglés, hereda los sesgos de esa fuente, sin que se documente ningún proceso de alineación o mitigación.
- Cobertura de idiomas: no declarada; el base es de inglés (`eng_latn`), por lo que el comportamiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se especifica en la model card, lo que impide planificar tareas que dependan de ventanas largas.
- Artefacto de investigación: el nombre sugiere una configuración concreta (semilla 455, tokenizador o léxico específicos) dentro de una serie de experimentos; no es un modelo mantenido ni pensado para producción.
- 0 descargas y 0 *likes*: sin validación por parte de la comunidad, no hay informes independientes de comportamiento.
- Ausencia de cuantizaciones publicadas (GGUF, AWQ, GPTQ): su uso en llama.cpp u Ollama requiere conversión manual previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/myn5ts0h
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de la librería Transformers (usada en el ejemplo rápido): https://huggingface.co/docs/transformers
