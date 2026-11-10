# llmfan46/LongCat-Flash-Lite-Uncensored-Heretic-Native-MTP-Preserved-GGUF

## Resumen

LongCat-Flash-Lite-Uncensored-Heretic-Native-MTP-Preserved-GGUF es una cuantizacion GGUF del modelo LongCat-Flash-Lite, desarrollado originalmente por Meituan (equipo meituan-longcat), tras un proceso de "abliteration" o decensurado llevado a cabo por el contribuidor independiente llmfan46 mediante la herramienta Heretic v1.4.0. El modelo base es un transformer de aproximadamente 69.073 millones de parametros (69,07 B) orientado a generacion de texto conversacional, y esta version concreta elimina buena parte de los rechazos y filtros del modelo original.

La relevancia de esta ficha radica en que combina dos elementos poco habituales: por un lado, una variante "uncensored" obtenida mediante una ablacion ortogonal con preservacion de magnitud (MPOA) sobre las proyecciones `attn.o_proj` y `mlp.down_proj`; por otro, el empaquetado en GGUF para inferencia local. Segun la model card, el proceso reduce los rechazos de 100/100 a 9/100 en un conjunto de prueba de 100 prompts, con una divergencia KL de 0.1177 respecto al modelo original.

Es importante senalar que estos GGUF no funcionan con llama.cpp upstream: requieren un fork especifico del autor (`erm14254/llama.cpp-longcat-flash`) que soporta la arquitectura `longcat_flash_ngram` y el modulo MTP (Multi-Token Prediction) nativo preservado. La licencia declarada es MIT, lo que facilita el uso comercial, aunque las implicaciones del decensurado deben evaluarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LongCat-Flash-Lite, con modulo MTP nativo y `longcat_flash_ngram`) |
| Parametros totales | 69.073.335.552 (69,07 B) |
| Parametros activos | no disponible (no se indica que sea MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`, pero no se especifica el maximo oficial) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 562,3 GB); el modelo base del que deriva se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es LongCat-Flash-Lite, un transformer de gran escala (69,07 B de parametros) desarrollado por Meituan. La model card de esta version no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron fases de RLHF o DPO; tampoco describe innovaciones como atencion lineal o decodificacion especulativa mas alla de la mencion al modulo MTP (Multi-Token Prediction) nativo, que se ha preservado expresamente en esta variante (de ahi el sufijo "Native-MTP-Preserved"). El tag `longcat_flash_ngram` sugiere el uso de mecanismos n-gram especificos de la familia, pero no se aportan mas detalles tecnicos.

La innovacion principal de esta ficha no esta en el entrenamiento original, sino en el post-procesado: se ha aplicado Heretic v1.4.0 con una variante del metodo MPOA (Magnitude-Preserving Orthogonal Ablation) para eliminar direcciones de rechazo en las capas `attn.o_proj` y `mlp.down_proj`. Los parametros de ablacion publicados incluyen `direction_index` por capa, pesos maximos y minimos por componente (por ejemplo, `attn.o_proj.max_weight` = 2,13 en la posicion 9,66; `mlp.down_proj.max_weight` = 2,11 en la posicion 8,84) y distancias asociadas. El objetivo declarado es reducir rechazos manteniendo la calidad, con una divergencia KL de 0.1177 respecto al modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos abiertos.
- Reduccion drastica de rechazos: 9/100 frente a 100/100 del modelo original en el conjunto de prueba del autor, lo que permite respuestas a prompts que el modelo base rechazaria.
- Preservacion del modulo MTP (Multi-Token Prediction) nativo, lo que puede favorecer el throughput en decodificacion.
- Compatibilidad con el servidor `llama-server` del fork de llama.cpp del autor, incluyendo soporte de flags como `-fa on` (flash attention) y `-np 1` (un solo slot paralelo).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y decensurado: el modelo permite estudiar como la ablacion MPOA afecta al comportamiento de rechazo con una divergencia KL medida (0.1177), util para comparar tecnicas de abliteration en modelos de 69 B.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde el modelo original rechazaria el prompt, aprovechando la reduccion de rechazos al 9 %.
- Evaluacion de robustez de guardarrailes: usar la variante decensurada como contrapunto para probar clasificadores de contenido o sistemas de moderacion frente a un modelo que evade rechazos.
- Despliegue local en estaciones de trabajo con GPU de gran memoria: las cuantizaciones Q4_K_M o Q3_K_M permiten ejecutar un modelo de 69 B en hardware de gama alta consumer o profesional, con el fork especifico de llama.cpp.
- Experimentacion con MTP y n-gram: el sufijo "Native-MTP-Preserved" hace que esta variante sea adecuada para estudiar el impacto del Multi-Token Prediction en latencia y calidad dentro de la familia LongCat-Flash.
- Fine-tuning posterior sobre la base decensurada: al estar bajo licencia MIT y en formato GGUF, sirve como punto de partida para ajustes especificos de dominio una vez convertido a safetensors o mediante tecnicas compatibles con GGUF.
- Benchmarking de cuantizaciones: el repo ofrece 11 niveles de cuantizacion (de BF16 a Q2_K), lo que permite medir la degradacion de calidad y el ahorro de VRAM en un modelo de 69 B de forma sistematica.

## Benchmarks y rendimiento

La model card solo publica metricas del proceso de decensurado, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (LongCat-Flash-Lite) |
|---|---|---|
| Divergencia KL | 0.1177 | 0 (por definicion) |
| Rechazos | 9/100 | 100/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 69,07 B, BF16 requiere del orden de 138 GB solo en pesos, Q8_0 unos 69 GB, Q4_K_M unos 39-42 GB y Q2_K unos 20-22 GB (estimaciones orientativas por tamano, no confirmadas por el autor).
- GPU recomendadas: no especificadas en la model card; por tamano, se necesitarian GPU profesionales tipo A100 80 GB (Q8_0), H100 80 GB o configuraciones multi-GPU para BF16.
- Cabe en consumer GPU: Q2_K y Q3_K_S podrian caber en GPUs de 24 GB (RTX 3090/4090) con offload parcial; Q4_K_M requeriria 48 GB o reparto CPU/GPU.
- Opciones de despliegue: exclusivamente el fork `erm14254/llama.cpp-longcat-flash` (no funciona en llama.cpp upstream, ni por tanto en Ollama o vLLM sin adaptaciones).
- Latencia y throughput: no disponibles; el modulo MTP nativo y el flag `-fa on` pueden mejorar la decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (LongCat-Flash-Lite Uncensored Heretic GGUF) | 69,07 B | no disponible | MIT | GGUF | Requiere fork de llama.cpp; 9/100 rechazos; KL 0.1177 |
| meituan-longcat/LongCat-Flash-Lite (original) | 69,07 B | no disponible | no disponible en la informacion | safetensors | Modelo base sin decensurar; 100/100 rechazos en el test del autor |
| llmfan46/LongCat-Flash-Lite-Uncensored-Heretic-Native-MTP-Preserved (safetensors) | 69,07 B | no disponible | MIT | safetensors | Version intermedia sin cuantizar del mismo autor |

No se dispone de datos de benchmarks comparativos con otras familias (Llama, Qwen, Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: la reduccion de rechazos al 9 % implica que puede generar contenido que el modelo original bloquearia; requiere moderacion externa en produccion.
- La divergencia KL de 0.1177 indica cierta degradacion respecto al original; no es una copia exacta en comportamiento.
- Compatibilidad restringida: los GGUF solo funcionan con el fork de llama.cpp del autor, lo que limita el soporte, las actualizaciones y la integracion con herramientas estandar (Ollama, vLLM, TGI, LM Studio).
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Longitud de contexto maxima no documentada; el ejemplo usa 8192 tokens, pero no se confirma el limite real.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de esta escala sin benchmarks publicados.
- Licencia MIT declarada, lo que permite uso comercial; sin embargo, el contenido generado puede infringir normativas locales o las politicas de las plataformas donde se despliegue.
- El autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que podria afectar a la disponibilidad futura de los archivos.
- Sin datos de sesgos conocidos ni evaluaciones de seguridad independientes.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/llmfan46/LongCat-Flash-Lite-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Modelo base decensurado (safetensors): https://huggingface.co/llmfan46/LongCat-Flash-Lite-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original de Meituan: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite
- Organizacion Meituan en Hugging Face: https://huggingface.co/meituan-longcat
- Repositorio GitHub de LongCat-Flash: https://github.com/meituan-longcat/LongCat-Flash-Chat
- Fork de llama.cpp requerido: https://github.com/erm14254/llama.cpp-longcat-flash
- Heretic (herramienta de decensurado): https://heretic-project.org/
- Blog sobre ablacion ortogonal con preservacion de magnitud (MPOA): https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
