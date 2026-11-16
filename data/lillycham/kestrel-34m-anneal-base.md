# lillycham/Kestrel-34M-anneal-base

## Resumen

Kestrel-34M-anneal-base es un modelo de lenguaje de pequeno tamano (SLM) de 34,26 millones de parametros desarrollado por el usuario lillycham. Se trata de la fase de annealing (cooldown) del modelo Kestrel-34M-base, un run de 5.000 pasos adicionales sobre una mezcla de datos que incluye un 20% de aritmetica sintetica paso a paso. El modelo emplea una arquitectura poco convencional: un transformer con bucles (looped transformer) basado en el diseno Titans-MAG, con un prelude, un core repetido en bucle y una coda.

El modelo es relevante como experimento de investigacion sobre arquitecturas eficientes en parametros: consigue un transformer de 34M de parametros con memoria asociativa (Titans-MAG) y atencion de ventana limitada (256 tokens), lo que lo aleja del transformer denso clasico. Su tamano lo hace adecuado para entornos con recursos muy limitados, prototipado rapido y estudio de tecnicas de entrenamiento (Muon + AdamW, annealing con datos sinteticos).

La licencia es MIT y los pesos estan en safetensors, pero requiere `trust_remote_code=True` por el uso de una arquitectura custom (`KestrelForCausalLM`). No se dispone de informacion sobre composicion completa del dataset, idiomas soportados ni datos de benchmarks mas alla de los reportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Titans-MAG (transformer con bucles y memoria asociativa), custom `KestrelForCausalLM` |
| Parametros totales | 34.262.272 (~34,3M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explicitamente; `attention_window=256`, entrenado con `sequence_length=1024` |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

Detalles de arquitectura reportados: `prelude=1`, `core=4 x 3 loops`, `coda=1`, `hidden_size=512`, `attention_window=256`, `memory_chunk_size=64`, `memory_heads=4`, `vocab_size=16384`.

## Arquitectura y entrenamiento

El modelo es un transformer con bucles (looped transformer) construido sobre el diseno Titans-MAG. La estructura se divide en un prelude de una capa, un core de cuatro capas repetido tres veces en bucle (12 pasos efectivos de core) y una coda de una capa. Incorpora un mecanismo de memoria asociativa con `memory_chunk_size=64` y `memory_heads=4`, y una atencion con ventana limitada de 256 tokens. El vocabulario es de 16.384 tokens, relativamente pequeno, coherente con el tamano del modelo y el objetivo de eficiencia.

El entrenamiento de esta version es una fase de annealing de 5.000 pasos inicializada desde Kestrel-34M-base, con una mezcla que incluye un 20% de aritmetica sintetica paso a paso. La configuracion usa batch size 8 con acumulacion de gradiente 4, longitud de secuencia 1024, precision bf16 sobre CUDA, y una combinacion de optimizadores Muon (lr=0,015) y AdamW (lr=0,00075) con weight decay 0,01. Las metricas finales reportadas son train loss 1,776 y val loss 2,045 en el paso 5.000.

## Capacidades

- Generacion de texto conversacional: la model card muestra uso con `apply_chat_template` y generacion con temperatura y top-p.
- Razonamiento aritmetico basico: el annealing incorpora un 20% de aritmetica sintetica paso a paso, orientado a mejorar el razonamiento numerico simple.
- Modelo base: no se indica un post-entrenamiento de instrucciones o preferencias (RLHF/DPO) en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el entrenamiento con pasos aritmeticos sugiere cierto razonamiento encadenado, pero no se documenta.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de arquitecturas experimentales: util para investigadores que quieran estudiar el comportamiento de un looped transformer con memoria Titans-MAG en un modelo de 34M de parametros, sin necesidad de grandes recursos de computo.
- Experimentos de razonamiento aritmetico en modelos pequenos: el 20% de datos sinteticos de aritmetica paso a paso permite evaluar hasta que punto un SLM puede aprender cadenas de razonamiento numerico con un vocabulario de 16K tokens.
- Educacion y docencia: modelo lo suficientemente pequeno (0,1 GB de repo) para ejecutarse en cualquier portatil y demostrar conceptos de entrenamiento, annealing y optimizadores (Muon + AdamW) en clase.
- Generacion de texto en entornos con recursos minimos: puede desplegarse en CPU o GPUs de gama baja para tareas de generacion corta donde el contexto no supere la ventana de atencion de 256 tokens.
- Investigacion sobre eficiencia de contexto: la ventana de 256 tokens y el chunking de memoria permiten estudiar el trade-off entre coste computacional y capacidad de retener informacion.
- Baseline para comparativas de SLM: sirve como referencia de arquitectura alternativa frente a transformers densos del mismo orden de parametros en estudios academicos.
- Fine-tuning ligero: al ser un modelo base de 34M con licencia MIT, es adecuado para experimentos de ajuste fino en tareas concretas con datasets pequenos.

## Benchmarks y rendimiento

Resultados reportados en la model card (Open SLM Eval):

| Benchmark | Resultado | Normalizado |
|---|---|---|
| Intelligence index | 8,78 | 9,36 |
| HellaSwag | 26,3% | 26,3% |
| ARC-easy | 41,7% | 38,7% |
| ARC-challenge | 19,5% | 22,2% |
| PIQA | 58,1% | 57,0% |
| ArithMark3 | 35,3% | 35,5% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 34,3M de parametros, en bf16 ocupa aproximadamente 68 MB de pesos; en fp32, unos 137 MB. El repo completo es de 0,1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM es suficiente; tambien cabe en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en iGPU y CPU.
- Opciones de despliegue: al requerir `trust_remote_code=True` y una arquitectura custom, el despliegue esta limitado a `transformers` con el codigo del repositorio. No se dispone de soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel-34M-anneal-base | 34,3M | ventana 256 (entrenado a 1024) | Looped Titans-MAG | MIT | Hugging Face |
| Kestrel-34M-base | 34,3M | no disponible | Looped Titans-MAG | MIT | Hugging Face |
| Modelos densos tipo GPT-2 small / Pythia-70M | 70M-124M | 1024-2048 | Transformer denso | MIT / Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo base sin post-entrenamiento de instrucciones: no se garantiza que siga instrucciones de forma fiable ni que mantenga conversaciones coherentes mas alla de turnos cortos.
- Ventana de atencion de 256 tokens: el contexto efectivo es muy limitado, lo que restringe tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Riesgo alto de alucinacion y de errores gramaticales: con 34M de parametros y un vocabulario de 16K, la calidad del texto generado sera limitada.
- Idiomas soportados no documentados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas distintos del ingles.
- Requiere `trust_remote_code=True`: ejecutar codigo custom del repositorio implica un riesgo de seguridad que debe evaluarse antes de usarlo en produccion.
- Sin soporte documentado en frameworks de inferencia estandar (vLLM, llama.cpp, Ollama): el despliegue en produccion requeriria trabajo adicional.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantias y con metricas de calidad muy bajas en benchmarks estandar (HellaSwag 26,3%, ARC-challenge 19,5%).
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo o toxicidad.

## Enlaces

- Hugging Face: https://huggingface.co/lillycham/Kestrel-34M-anneal-base
- Modelo base: https://huggingface.co/lillycham/Kestrel-34M-base
- Repositorio GitHub: https://github.com/lillycham/kestrel
