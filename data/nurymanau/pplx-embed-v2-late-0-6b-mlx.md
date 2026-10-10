# Nurymanau/pplx-embed-v2-late-0.6b-MLX

## Resumen

pplx-embed-v2-late-0.6b-MLX es un runtime nativo para Apple Silicon (MLX) del modelo de embeddings perplexity-ai/pplx-embed-v2-late-0.6b, publicado por el usuario Nurymanau. Se trata de un modelo de recuperación de tipo interacción tardía (late interaction) con búsqueda MaxSim, en la línea de ColBERT, orientado a extracción de características y búsqueda semántica. No es un modelo generativo ni un checkpoint drop-in de `mlx_lm` o Sentence Transformers: importa un runtime MLX propio que no usa Torch ni Transformers durante la inferencia.

El paquete incluye varias variantes: el modelo base en FP16, una versión con las capas MLP en Q4 mixto, un adaptador pequeño ajustado al dataset PolyAI/banking77, un ajuste fino completo de texto sobre el mismo dataset y un estudiante destilado de seis capas. El ajuste completo sobre BANKING alcanza un nDCG@10 del 89,49% en la prueba de recuperación de ejemplos de intención descrita en la model card, frente al 74,05% del modelo base original.

Es relevante para quienes quieren ejecutar recuperación semántica densa sobre hardware Apple sin recurrir a CUDA, y para investigación de adaptación de modelos de embeddings a dominios concretos (en este caso, intenciones bancarias). La licencia es MIT y el repositorio ocupa 4,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings con interaccion tardia (late interaction) y recuperacion MaxSim a nivel de token; runtime nativo MLX propio |
| Parametros totales | no disponible (el modelo base se denomina 0.6b; en la variante de ajuste completo se entrenaron 493,86 M parametros de texto) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | limite de entrada por consulta: <=1024 tokens; por documento: <=4096 tokens (una entrada sin padding por llamada) |
| Tipos de cuantizacion | FP16 y MLP mixto Q4 (variante `base-mlp-q4`; no todo el modelo en 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX), mas adaptador de 65,6 KB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de interaccion tardia tipo ColBERT (referencia arXiv:2003.04807): genera embeddings a nivel de token y calcula la similitud mediante MaxSim entre consulta y documento, en lugar de comprimir cada texto en un unico vector. La base es el checkpoint perplexity-ai/pplx-embed-v2-late-0.6b en la revision fijada `8fc2de24534aa3610d85fa59c463313a5f096455`. El autor no reclama ser el primer port ni mantiene afiliacion con Perplexity.

El ajuste descrito en la model card se realizo sobre el dataset PolyAI/banking77. En la variante de ajuste completo de texto se entrenaron los 493,86 M parametros de texto; en el estudiante de seis capas, 374,14 M (un 24,2% menos de parametros de texto). El protocolo empleo dos semillas, dos tasas de aprendizaje y tres epocas por rama, con seleccion de checkpoints unicamente sobre datos de validacion separados. Tambien existe un estudiante historico de salida destilada (P8) que no supero la puerta de calidad. No se menciona uso de RLHF ni DPO; se trata de fine-tuning supervisado de recuperacion. La model card senala que no hay una ablacion emparejada de solo cabeza que aísle la contribucion de las capas internas.

## Capacidades

- Generacion de embeddings a nivel de token para recuperacion densa.
- Busqueda semantica mediante interaccion tardia y MaxSim (no similitud coseno de vector unico).
- Indexado y consulta a traves de una CLI propia (`index` y `search`) con `top-k` configurable.
- Soporte de documentos de texto e imagen en la variante `base-fp16` original (entrada `{"id":"...","image":"..."}`); las variantes entrenadas solo estan validadas para texto.
- Adaptacion de dominio a intenciones bancarias (BANKING) mediante adaptador o ajuste completo.
- Variante estudiante de seis capas orientada a menor huella de memoria y latencia.
- No realiza generacion de texto ni razonamiento generativo; su pipeline es `feature-extraction`.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documentan capacidades multilingues (idiomas: no disponible).

## Casos de uso

- Busqueda semantica local en macOS: indexar un corpus de documentos con la CLI y consultar por lenguaje natural, aprovechando el runtime MLX sobre Apple Silicon sin depender de CUDA.
- Clasificacion de intenciones en atencion al cliente bancaria: la variante `banking-full-p10-fp16` alcanza 87,01% de Hit@1 en la prueba de recuperacion de ejemplos de intencion, por lo que puede usarse para enrutar consultas a la intencion correcta.
- Recuperacion aumentada (RAG) ligera en equipos de desarrollo: usar los embeddings como recuperador sobre una base documental pequena o mediana en un Mac, reconstruyendo el indice al cambiar de variante.
- Deduplicacion y agrupamiento de documentos: los embeddings por token permiten medir similitud fina entre textos largos (hasta 4096 tokens por documento) para detectar duplicados o clusters tematicos.
- Busqueda multimodal texto-imagen: la variante `base-fp16` acepta documentos de imagen, util para indexar capturas de paginas o figuras junto a texto.
- Investigacion y evaluacion de adaptacion de dominio: el paquete incluye variantes con adaptador, ajuste completo y estudiante, lo que permite reproducir el efecto del ajuste (de 74,05% a 89,49% de nDCG@10) en un mismo marco.
- Recuperacion cientifica (con reservas): el autor reporta nDCG de 85,81% (teacher adaptado) y 84,62% (ajuste completo) en NanoSciFact, aunque el estudiante cae a 66,05%; usar solo como referencia, no como sustituto generico.

## Benchmarks y rendimiento

Resultados medidos en MLX FP16 sobre la prueba de recuperacion de ejemplos de intencion BANKING (770 consultas, 154 documentos, 77 intenciones). No es el benchmark oficial de clasificacion ni mide exactitud de respuesta.

| Variante | nDCG@10 | Hit@1 | Recall@10 |
|---|---:|---:|---:|
| Base original | 74,05% | 70,91% | 84,87% |
| Base + adaptador pequeno | 77,74% | 74,55% | 87,86% |
| Ajuste completo de texto (P10) | 89,49% | 87,01% | 95,26% |
| Estudiante de seis capas (P10) | 81,79% | 78,83% | 91,30% |

Diferencia ajuste completo frente a teacher adaptado: +11,75 puntos de nDCG (bootstrap de 77 intenciones, IC95% [+9,20, +14,53]).

Evaluacion cruzada en NanoSciFact (FP32 CUDA, 40 consultas sobre 2919 documentos):

| Variante | nDCG | Hit@1 | Recall |
|---|---:|---:|---:|
| Teacher adaptado | 85,81% | 80% (aprox.) | 92,5% |
| Ajuste completo | 84,62% | 75% (aprox.) | 92,5% |
| Estudiante de seis capas | 66,05% | no disponible | no disponible |

La cuantizacion MLP-Q4 mixta mantuvo el nDCG de NanoSciFact en 84,08% frente a 84,34% del original, con Recall del 92,5%. Los resultados P7/P8 usan un conjunto de 616 consultas distinto y no deben mezclarse con la tabla P10.

## Requisitos de hardware

- Requiere Apple Silicon; probado con Python 3.12, MLX 0.32.3 y macOS 26.6.2.
- Variante `base-fp16`: archivo de pesos de ~1,19 GB. Variante `base-mlp-q4`: 999 MB.
- Estudiante de seis capas: 749 MB (frente a 1189,3 MB del FP16 completo, un 24,2% menos de parametros de texto).
- Adaptador bancario: 65,6 KB (requiere `base-fp16`).
- Cabe en GPUs de consumo y en Macs con memoria unificada; el autor reporta pruebas en un Mac M3 con 16 GB.
- Latencia medida (medianas en caliente, 8 entradas fijas de validacion en un Mac M3/16 GB): 26,16 ms para el estudiante y 48,04 ms para el teacher (aproximadamente 1,84x). No es throughput de aplicacion ni una garantia general de velocidad.
- Despliegue unicamente mediante el runtime MLX propio del autor; no es compatible como checkpoint directo con vLLM, llama.cpp, Ollama, TGI ni Sentence Transformers.
- Se recomienda evitar trabajos de modelo en paralelo en Macs con poca memoria.
- Coste estimado de entrenamiento/evaluacion en GPU: 0,925 USD a 0,24 USD/hora, excluyendo almacenamiento; no es una factura real.

## Comparativa con modelos similares

Comparativa entre las variantes incluidas en el propio paquete (misma categoria y mismo marco de evaluacion). No se dispone de cifras comparables de terceros en la informacion proporcionada.

| Variante | Rol | Peso aprox. | Vision | nDCG@10 BANKING |
|---|---|---:|---|---:|
| `base-fp16` | Modelo general por defecto; texto e imagen | 1,19 GB | Si | 74,05% |
| `base-mlp-q4` | Solo MLP en Q4 mixto | 999 MB | Si | no disponible |
| `banking-adapter` | Adaptador de 65,6 KB; requiere base | 65,6 KB | Hereda base | 77,74% |
| `banking-full-p10-fp16` | Ajuste completo de texto; investigacion BANKING | 1,19 GB | no validada tras ajuste | 89,49% |
| `banking-student6-p10` | Estudiante de seis capas; regresion en Nano | 749 MB | No | 81,79% |
| `student6-experimental` | Historial P8; no supero la puerta de calidad | 749 MB | No | no disponible |

Comparado con el modelo base original de Perplexity, esta version aporta un runtime MLX nativo para Apple Silicon y variantes ajustadas a dominio; el propio autor indica que el FP16 original sigue siendo el valor por defecto general. Frente a ColBERT clasico (arXiv:2003.04807) comparte el paradigma de interaccion tardia, pero no se dispone de una comparacion numerica directa.

## Limitaciones y advertencias

- Es un port no oficial: el autor declara no tener afiliacion ni respaldo de Perplexity, y no reclama ser el primer port.
- No es drop-in: no funciona con `mlx_lm` ni con Sentence Transformers, y la inferencia no usa Torch ni Transformers.
- El conjunto de evaluacion P10 es una prueba de recuperacion de ejemplos de intencion, no el benchmark oficial de clasificacion ni una medida de exactitud de respuesta.
- Riesgo de alucinacion no aplica como en modelos generativos, pero si existe riesgo de recuperacion erronea; el Hit@1 del base es 70,91%.
- El estudiante de seis capas es especifico de BANKING y sufre una regresion notable en NanoSciFact (66,05% de nDCG), por lo que no es un sustituto generico.
- El estudiante experimental P8 fallo la puerta de calidad y no deberia usarse en produccion.
- La calidad de imagen tras el ajuste completo de texto no esta validada; las variantes entrenadas solo se validan para texto y el estudiante carece de codificador visual.
- Limites de entrada estrictos: consulta <=1024 y documento <=4096 tokens; las entradas sobredimensionadas se rechazan y solo se procesa una entrada sin padding por llamada.
- No hay ablacion emparejada de solo cabeza; no se puede aislar la contribucion de las capas internas.
- Idiomas soportados no disponibles: no se documenta cobertura multilingue.
- La licencia MIT permite uso comercial, pero el modelo base upstream puede tener condiciones propias que conviene verificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nurymanau/pplx-embed-v2-late-0.6b-MLX
- Modelo base upstream: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Codigo en GitHub: https://github.com/Obscyra-app/pplx-embed-mlx
- Resultados detallados P10: P10_README.md (relativo al repositorio)
- Evidencia historica P1-P9: P1_P9_RESULTS.md (relativo al repositorio)
- Paper de referencia (ColBERT): arXiv:2003.04807
- Dataset de ajuste: PolyAI/banking77
