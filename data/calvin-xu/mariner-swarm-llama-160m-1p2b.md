# Calvin-Xu/mariner-swarm-llama-160m-1p2b

## Resumen

MARINER swarm checkpoints es una coleccion de 291 checkpoints finales de modelos Llama de 157,5 millones de parametros entrenados sobre 1.200 millones de tokens cada uno, publicados por el autor Calvin-Xu como material reproducible del articulo *MARINER: Measuring and Modeling Repetition Harm for Multi-Epoch Data Mixing*. No es un modelo pensado para uso en produccion, sino un artefacto de investigacion: cada checkpoint corresponde a una ejecucion independiente de preentrenamiento con una mezcla de datos distinta sobre una particion de 39 buckets de los corpus Dolma 3 y Dolmino.

El conjunto cubre 281 mezclas (238 disenos muestreados, 4 lineas base y 39 eliminaciones de un unico bucket) mas diez repeticiones de la mezcla proporcional con semillas distintas. Los fits del articulo usan 242 disenos muestreados y lineas base; las eliminaciones quedan como ejecuciones held-out. Cada carpeta se identifica por su `run_label` y el fichero `runs.csv` mapea cada carpeta con su `observation_id` en el dataset MARINER, que coincide con el id de ejecucion de W&B, el tipo de diseno y si los fits del articulo lo utilizan.

La relevancia es metodologica: el repositorio permite reproducir y auditar experimentalmente el efecto de la repeticion de datos en el preentrenamiento multi-epoca y el impacto de distintas mezclas sobre el rendimiento final, con 291 puntos de medida reales en lugar de simulaciones. El modelo base es un transformer denso tipo Llama, sin innovaciones arquitectonicas, guardado en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (familia Llama) |
| Parametros totales | 157,5 M por checkpoint |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Cada checkpoint es un Llama denso de 157,5 M de parametros entrenado durante 1.200 millones de tokens, es decir, aproximadamente 7,6 tokens por parametro. El entrenamiento se realizo sobre mezclas variables de una particion en 39 buckets de los pools Dolma 3 y Dolmino, con configuraciones de epochs distintas segun el diseno experimental. Los pesos se guardan en fp32, lo que explica el tamano del repositorio (68,1 GB para los 291 checkpoints, unos 630 MB por checkpoint en fp32).

La innovacion no esta en la arquitectura sino en el diseno experimental: 238 mezclas muestreadas, 4 lineas base, 39 eliminaciones de un unico bucket (held-out respecto a los fits del articulo) y 10 repeticiones de la mezcla proporcional con semillas diferentes. Esta estructura permite separar el efecto de la composicion de la mezcla del de la repeticion multi-epoca y ajustar modelos predictivos del "repetition harm". No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (157,5 M de parametros) y por un preentrenamiento de solo 1.200 millones de tokens.
- Modelado de lenguaje causal para evaluacion de perplexity y metricas de validacion sobre los dominios de Dolma 3 y Dolmino.
- Reproduccion experimental de mezclas de datos: cada checkpoint permite medir el rendimiento asociado a una configuracion concreta de pesos de mezcla y epochs.
- Analisis de repeticion multi-epoca: las diez repeticiones con semillas distintas de la mezcla proporcional permiten estimar varianza entre ejecuciones.
- Evaluacion held-out: los 39 checkpoints de eliminacion de bucket sirven para validar los ajustes del articulo sobre datos no vistos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre mezclas de datos de preentrenamiento: cargar varios `run_label` con `subfolder` en `from_pretrained` y comparar la perdida de validacion entre mezclas para validar modelos predictivos de data mixing.
- Estudio del "repetition harm": usar las diez repeticiones con semillas distintas de la mezcla proporcional para cuantificar la varianza entre ejecuciones y aislar el efecto de la repeticion multi-epoca.
- Validacion held-out de ajustes: emplear los 39 checkpoints de eliminacion de bucket como conjunto de test para comprobar la generalizacion de los fits publicados en el articulo.
- Reproducibilidad de articulos: el mapeo `runs.csv` con `observation_id` y W&B run id permite reconstruir cada experimento y contrastar resultados publicados.
- Docencia y formacion en preentrenamiento: modelos de 157,5 M de parametros con contexto de entrenamiento conocido y pesos en fp32, utiles para ilustrar el efecto de la composicion del corpus en curvas de aprendizaje.
- Baseline para experimentos de mezcla a pequena escala: punto de partida barato para comparar nuevas estrategias de muestreo antes de escalar a modelos mayores.
- Analisis de sensibilidad por dominio: al partir de 39 buckets de Dolma 3 y Dolmino, permite medir que dominios degradan o mejoran el rendimiento cuando se eliminan de la mezcla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el dataset MARINER contiene los resultados de evaluacion de cada ejecucion, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 630 MB solo para pesos, mas overhead de activaciones y tokenizer; inferior a 2 GB en la practica para inferencia con lotes pequenos.
- VRAM estimada en fp16/bf16: unos 315 MB para pesos; cuantizaciones de 8 y 4 bits no estan publicadas pero serian del orden de 160 MB y 80 MB respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer, incluso en GPUs de portatil con 4-6 GB de VRAM.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM` con `subfolder`), y previsiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un modelo de 157,5 M de parametros, el throughput esperado es alto en GPU consumer, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MARINER swarm Llama 160M/1.2B | 157,5 M | no disponible | Investigacion de data mixing (291 checkpoints) | Apache 2.0 | Hugging Face (Calvin-Xu) |
| Llama 3.2 1B | 1,24 B | 128k | Modelo generalista pequeno | Llama 3.2 Community License | Hugging Face (Meta) |
| SmolLM2-135M | 135 M | 8k (entrenado hasta 2k en algunas variantes) | Modelo generalista pequeno | Apache 2.0 | Hugging Face (HuggingFaceTB) |
| Pythia-160M | 162 M | 2k | Investigacion de interpretabilidad y escalado | Apache 2.0 | Hugging Face (EleutherAI) |

La comparativa es orientativa: MARINER no compite en capacidad generalista sino en diseno experimental. Frente a Pythia-160M, el conjunto de Calvin-Xu ofrece 291 variantes de mezcla en lugar de una sola trayectoria de entrenamiento, lo que lo hace adecuado para estudiar el efecto de la composicion del corpus, no para tareas de generacion de calidad.

## Limitaciones y advertencias

- No es un modelo para produccion: 157,5 M de parametros y 1.200 millones de tokens de entrenamiento implican una capacidad de generacion y conocimiento factual muy limitada.
- Riesgo alto de alucinacion y de texto incoherente en tareas abiertas; no se ha aplicado alineacion (RLHF/DPO) segun la informacion disponible.
- No se documentan sesgos conocidos, pero al entrenarse sobre Dolma 3 y Dolmino hereda los sesgos de esos corpus.
- Idiomas soportados no documentados; el comportamiento multilingue no esta caracterizado.
- Longitud de contexto no disponible; no se debe asumir una ventana concreta sin consultar la configuracion de cada checkpoint.
- El repositorio ocupa 68,1 GB por los 291 checkpoints en fp32; descargar el repo completo es costoso, conviene usar `subfolder` para bajar solo las ejecuciones necesarias.
- La licencia Apache 2.0 permite uso comercial, pero el valor practico del modelo fuera de investigacion es marginal.
- Los resultados de evaluacion no estan incluidos en la model card; hay que consultar el dataset MARINER para obtener metricas por ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Calvin-Xu/mariner-swarm-llama-160m-1p2b
- Dataset MARINER (referenciado en la model card, con mezclas, epochs y resultados de evaluacion): no disponible como URL directa en la informacion proporcionada
- Articulo *MARINER: Measuring and Modeling Repetition Harm for Multi-Epoch Data Mixing*: no disponible como URL directa en la informacion proporcionada
- Repositorio de pesos: https://huggingface.co/Calvin-Xu/mariner-swarm-llama-160m-1p2b/tree/main (carpetas por `run_label` y `runs.csv`)
