# Calvin-Xu/mariner-swarm-qwen3-360m-1p6b

## Resumen

MARINER swarm checkpoints: Qwen3 360M/1.6B es una coleccion de 290 checkpoints finales de modelos Qwen3 de 358,3 millones de parametros, publicados por Calvin-Xu como material de investigacion para el articulo *MARINER: Measuring and Modeling Repetition Harm for Multi-Epoch Data Mixing*. No se trata de un modelo unico entrenado para uso general, sino de un conjunto de ejecuciones experimentales que documentan como distintas mezclas de datos y distintos numeros de epocas afectan al rendimiento de un modelo pequeno durante el preentrenamiento.

Cada checkpoint corresponde a una ejecucion concreta: 280 mezclas disenadas (238 muestreos, 3 lineas base y 39 eliminaciones de un solo bucket) sobre una particion de 39 buckets de los pools Dolma 3 y Dolmino, mas diez repeticiones de la mezcla proporcional con semillas distintas. Cada ejecucion entrena un modelo Qwen3 de 358,3 M de parametros sobre 1,58 mil millones de tokens y se guarda en fp32.

Su relevancia es metodologica: sirve para estudiar el "dano por repeticion" en el entrenamiento multi-epoca y para ajustar modelos predictivos de mezcla de datos. El repositorio ocupa 12,9 GB y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 358,3 M por checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), cargable con `transformers` |

## Arquitectura y entrenamiento

Cada checkpoint es un modelo Qwen3 de 358,3 M de parametros en arquitectura transformer decoder-only. No hay innovaciones de arquitectura propias: el interes esta en el regimen de entrenamiento. Cada ejecucion consume 1,58 mil millones de tokens procedentes de mezclas sobre una particion de 39 buckets de los pools Dolma 3 y Dolmino, con distintos pesos de mezcla y numeros de epocas. Los pesos finales se guardan en fp32.

El conjunto cubre 290 ejecuciones: 238 disenos muestreados, 3 lineas base, 39 eliminaciones de un solo bucket y 10 repeticiones de la mezcla proporcional con semillas distintas. El articulo ajusta sus modelos predictivos usando las 280 mezclas (excluyendo, por tanto, las repeticiones con semilla). El fichero `runs.csv` mapea cada carpeta `run_label` con su `observation_id` del dataset MARINER, que coincide con el id de ejecucion de W&B, el tipo de diseno y si el ajuste del articulo lo utiliza. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo Qwen3 pequeno preentrenado.
- Razonamiento y conocimiento general limitados por su tamano (358,3 M de parametros) y por un presupuesto de entrenamiento de solo 1,58 B de tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades multimodales.

## Casos de uso

- Investigacion sobre mezcla de datos: reproducir los ajustes del articulo MARINER usando los 280 checkpoints y sus pesos de mezcla para validar modelos predictivos de rendimiento frente a composicion del corpus.
- Estudio del dano por repeticion multi-epoca: comparar checkpoints entrenados con distintas epocas sobre los mismos buckets para cuantificar la degradacion por repeticion.
- Ablacion de buckets del corpus: las 39 ejecuciones de eliminacion de un solo bucket permiten medir la contribucion marginal de cada porcion de Dolma 3 y Dolmino al rendimiento final.
- Analisis de sensibilidad a la semilla: las diez repeticiones de la mezcla proporcional con semillas distintas sirven para estimar la varianza del entrenamiento y calibrar intervalos de confianza en los ajustes.
- Prototipado rapido de pipelines de preentrenamiento: al ser modelos de 358,3 M en fp32 (aproximadamente 1,4 GB por checkpoint), permiten iterar sobre configuraciones de entrenamiento y evaluacion con coste computacional reducido.
- Docencia y experimentacion con `transformers`: cargar un checkpoint concreto mediante `subfolder` para inspeccionar pesos, tokenizer y comportamiento de un modelo Qwen3 pequeno sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el dataset MARINER contiene los resultados de evaluacion de cada ejecucion, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 3-4 GB son suficientes para un checkpoint individual.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para un checkpoint; para cargar y comparar varios checkpoints conviene una GPU con 24 GB o mas.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `AutoTokenizer` usando el parametro `subfolder` para seleccionar la ejecucion; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MARINER swarm Qwen3 360M/1.6B (este) | 358,3 M | no disponible | 1,58 B tokens, 290 ejecuciones de mezcla | Apache 2.0 | Hugging Face |
| Qwen3 base de 0.6B | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Modelos de ablacion de mezcla de datos (p. ej. suites tipo Data Mixing Laws) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo para produccion: son checkpoints de investigacion entrenados con 1,58 B tokens, muy por debajo de lo habitual en modelos desplegables, por lo que la calidad de generacion sera limitada.
- Riesgo elevado de alucinacion y de respuestas incoherentes por el bajo presupuesto de entrenamiento y el tamano reducido.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre Dolma 3 y Dolmino, hereda los sesgos de esos corpus.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue adecuado.
- No se documenta alineacion (RLHF, DPO) ni filtros de seguridad, por lo que no deberia usarse en aplicaciones orientadas a usuarios finales sin evaluacion adicional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para ello.
- El repositorio contiene 290 subcarpetas; es necesario seleccionar explicitamente el `subfolder` correcto y consultar `runs.csv` para interpretar cada ejecucion.
- No se documentan la longitud de contexto, los tipos de cuantizacion soportados ni el pipeline de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Calvin-Xu/mariner-swarm-qwen3-360m-1p6b
- Dataset MARINER (referenciado en la model card, sin URL directa en la informacion disponible): no disponible
- Articulo *MARINER: Measuring and Modeling Repetition Harm for Multi-Epoch Data Mixing*: no disponible
- Repositorio de codigo: no disponible
- Demos: no disponible
