# atdev-company/Qwen3.8-27B-atdev-c32

## Resumen

Qwen3.8-27B-atdev-c32 es un artefacto de cuantizacion de precisión reducida (W4A4) publicado por atdev-company para el modelo Qwen3.8-27B de Qwen. No es un modelo independiente: es un sidecar de pesos INT4 rotados con Hadamard que debe combinarse con el checkpoint base RedHatAI/Qwen3.8-27B-INT4 y con los kernels de activación correspondientes del framework atdev-serve. El perfil se denomina C32 porque está calibrado y optimizado para 32 clientes concurrentes sobre una única GPU A100 80GB (sm80) con vLLM 0.31.0.

El objetivo del artefacto es acelerar el throughput agregado de decodificación manteniendo la precisión del checkpoint INT4 original. Según el autor, en una ejecución de 96 prompts a concurrencia 32 alcanzó 2.688,13 tokens de salida por segundo agregados, lo que supone 1,53x frente al mejor resultado histórico con vLLM (1.757,1 tok/s) y aproximadamente 4,0x frente al valor por defecto en BF16 (671,8 tok/s). Estas cifras corresponden a una única ejecución, no a una media repetida.

El repositorio ocupa 12,5 GB e incluye únicamente los pesos rotados INT4 de las proyecciones (400 proyecciones, 800 tensores empaquetados y escalas BF16) junto con sumas de verificación, resultados de precisión y documentación de datos y licencias. No incorpora el modelo completo: embeddings, normalizaciones, cabezas y el resto de parámetros se leen del checkpoint INT4 base. La licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), cuantizacion GPTQ W4A4 con rotacion Hadamard128 block-diagonal en K |
| Parametros totales | No disponible en la informacion proporcionada (nombre comercial 27B; el repo contiene solo el overlay INT4 de 12,5 GB) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada; se reporta una evaluacion de contexto largo con 36/36 correctas |
| Tipos de cuantizacion | INT4 con group size 128, act-order GPTQ con damp 0.1; pesos empaquetados con escalas BF16 |
| Idiomas soportados | No disponible en la informacion proporcionada; la calibracion incluye datos en coreano (FineWeb-2 Korean) e ingles (FineWeb-Edu) |
| Licencia | Apache-2.0 (pesos y codigo), separada de las condiciones de los datasets de calibracion |
| Formato de pesos | safetensors (`hadamard/qwen38_27b_hadamard_gptq_d10.safetensors`, 12.543.701.944 bytes); requiere vLLM y kernels atdev-serve |
| SHA256 de pesos | `608aef5bf2569e183845cd61ecb783385f61b491603912002d753edcca14728b` |
| Modelo base | Qwen/Qwen3.8-27B y RedHatAI/Qwen3.8-27B-INT4 (relacion: quantized) |
| Libreria / runtime | vLLM 0.31.0, framework atdev-serve, perfil C32 (32 clientes concurrentes) |
| Hardware objetivo | 1x A100 80GB (sm80) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero ni un fine-tuning: es un proceso de calibracion GPTQ offline sobre el checkpoint INT4 de RedHatAI en el espacio suavizado por AWQ que dicho checkpoint requiere. La innovacion principal es la rotacion Hadamard128 block-diagonal aplicada sobre la dimension K de las proyecciones, que se materializa como un overlay INT4 rotado. Este overlay debe emparejarse obligatoriamente con la transformacion de activacion Hadamard del runtime; usar los pesos rotados con kernels sin rotar o con vLLM estándar produce resultados incorrectos. El perfil C32 conserva la cabeza MTP (multi-token prediction) integrada en el modelo objetivo y no anade un drafter externo.

La calibracion utilizo un pool de captura de 1.024 filas, de las cuales se enviaron 512 filas limpias generadas por el modelo objetivo a partir de fuentes de entrenamiento UltraChat y GSM8K mas envoltorios del autor, 256 filas de FineWeb-2 Korean y 256 filas de FineWeb-Edu. Los prefijos se limitaron a 1.024 tokens (780.107 tokens enviados en total), con semilla 0 y un maximo de 16.384 filas de activacion muestreadas por capa lineal. Los identificadores de fila muestreados no se guardaron, por lo que no se garantiza que cada fila enviada contribuya a cada proyeccion. Este pool es distinto de la receta original de 400 filas limpias del perfil C1 W3.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B; el artefacto no anade ni retira capacidades, solo modifica la representacion numerica de los pesos.
- Generacion de codigo: se reportan resultados de HumanEval, HumanEval+, MBPP y MBPP+ en la evaluacion del perfil.
- Razonamiento matematico: se reporta GSM8K completo (1.319 preguntas) con 1.249 aciertos.
- Seguimiento de instrucciones: se reportan metricas IFEval en modalidad prompt e instruction, strict y loose.
- Conocimiento multilingue: se reporta KMMLU en coreano, con una caida de aproximadamente 1,78 puntos porcentuales frente a la referencia.
- Contexto largo: se reporta una evaluacion de 36/36 en la prueba de contexto largo incluida en el perfil.
- Decodificacion especulativa interna: conserva la cabeza MTP del modelo objetivo, sin drafter externo.
- Servido concurrente: el perfil esta disenado para 32 clientes simultaneos sobre una A100 80GB.
- Tool calling, function calling, agentes, vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia de alta concurrencia: el perfil C32 esta calibrado para 32 clientes simultaneos en una sola A100 80GB, lo que lo hace adecuado para endpoints de chat o API interna con carga sostenida y requisitos de throughput agregado.
- Generacion de codigo en produccion: los resultados de HumanEval (95,12%) y MBPP (92,06%) sugieren uso en asistentes de programacion y generacion de tests, siempre que se despliegue con los kernels Hadamard correspondientes.
- Razonamiento matematico y tutoria automatizada: GSM8K con 94,69% de aciertos permite su uso en sistemas de resolucion de problemas paso a paso y generacion de explicaciones educativas.
- Procesamiento de documentos largos: la evaluacion de contexto largo (36/36) respalda tareas de resumen, extraccion y question answering sobre documentos extensos dentro de la ventana soportada por el modelo base.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye `accuracy_results.json` y documentacion de receta, lo que lo convierte en un banco de pruebas reproducible para investigadores que comparan GPTQ, rotaciones Hadamard y precisiones W4A4 frente a W4A8.
- Despliegue en infraestructura con A100 existente: al reducir el peso a un overlay INT4 sobre un base ya cuantizado, permite aumentar la concurrencia servida sin cambiar de hardware ni adquirir GPUs de mayor capacidad.
- Localizacion al coreano: la calibracion incluye 256 filas de FineWeb-2 Korean y se reporta KMMLU, por lo que es utilizable en aplicaciones en ese idioma, con la advertencia de la caida de precision observada.

## Benchmarks y rendimiento

Resultados medidos por el autor. La referencia stock INT4 es la media de dos ejecuciones guardadas del checkpoint INT4 sin rotar.

| Metrica | Stock INT4 referencia | c32_hadamard_w4a4 |
|---|---:|---:|
| MMLU-Pro | 71,71% | 72,79% |
| KMMLU Korean | 66,84% | 65,07% |
| IFEval prompt strict | 82,90% | 82,44% |
| IFEval prompt loose | 86,60% | 86,51% |
| IFEval instruction strict | 87,89% | 88,01% |
| IFEval instruction loose | 90,89% | 91,01% |
| HumanEval | 95,73% | 95,12% |
| HumanEval+ | 90,85% | 89,63% |
| MBPP | 91,27% | 92,06% |
| MBPP+ | 76,46% | 78,04% |
| WikiText-2 PPL (menor es mejor) | 7,298721 | 7,209287 |
| GSM8K (full 1319) | 1248/1319 | 1249/1319 (94,69%) |

Throughput medido en una unica ejecucion de 96 prompts a concurrencia 32:

| Perfil | Tokens de salida agregados/s | Ratio frente a referencia |
|---|---:|---:|
| c32_hadamard_w4a4 | 2.688,13 | 1,53x vs. mejor vLLM historico; ~4,0x vs. BF16 por defecto |
| Mejor vLLM historico | 1.757,1 | 1,00x |
| BF16 por defecto historico | 671,8 | 0,38x |
| C32 sin rotar (antiguo, no comercializado) | 2.730,9 | no aplica a este perfil |

Notas del autor: el resultado de 2.688,13 tok/s es una sola ejecucion, no una media repetida ni una remedicion simultanea de todas las lineas base. El throughput agregado a C32 no equivale a la velocidad de decodificacion por peticion en C1. El titular de hasta 14,2x de velocidad maxima del proyecto corresponde al perfil separado C1 fast W3 y no aplica a este sidecar. El resultado final de KMMLU coreano es el valor repetido de 65,07% (inicial 66,04%). No se reclama equivalencia estadistica ni precision sin perdidas universal.

## Requisitos de hardware

- VRAM estimada: 12,5 GB para el overlay INT4, mas el checkpoint INT4 base y las activaciones; el perfil esta validado en una A100 80GB, que es el hardware de referencia declarado.
- GPU recomendadas: NVIDIA A100 80GB (sm80) como plataforma objetivo validada. Otras GPUs no estan documentadas en la informacion proporcionada.
- GPU de consumo: no disponible en la informacion proporcionada; el artefacto depende de kernels Hadamard especificos de atdev-serve y no se ha validado en RTX 4090 u otras GPUs consumer.
- Despliegue: vLLM 0.31.0 con el framework atdev-serve. Instalacion mediante `./install.sh && source atdev-env.sh` y arranque con `./serve_c32.sh`; alternativa con Docker mediante `docker compose --profile c32 up --build`.
- Override de pesos: variable `HADW=/ruta/local/hadamard/qwen38_27b_hadamard_gptq_d10.safetensors ./serve_c32.sh`. Para modo offline, usar `MODEL=<directorio INT4 local>` y `HF_HUB_OFFLINE=1` con los ficheros precacheados.
- Latencia y throughput: throughput agregado medido de 2.688,13 tok/s de salida a concurrencia 32. Latencia por peticion no disponible en la informacion proporcionada.
- Restriccion critica: los pesos rotados y la transformacion de activacion Hadamard son un par indivisible. No deben usarse con kernels sin rotar ni con vLLM estandar, y no debe sustituirse silenciosamente por W4A8 tras un error de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Precisión reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-atdev-c32 | 27B nominal (overlay 12,5 GB) | No disponible | W4A4 GPTQ + Hadamard128 | MMLU-Pro 72,79%; HumanEval 95,12%; GSM8K 94,69% | Apache-2.0 | HuggingFace, requiere atdev-serve |
| RedHatAI/Qwen3.8-27B-INT4 (base) | 27B | No disponible | INT4 GPTQ | Referencia del perfil: MMLU-Pro 71,71%; HumanEval 95,73%; GSM8K 1248/1319 | No disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3.8-27B (BF16 original) | 27B | No disponible | BF16 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

La comparacion se limita a los tres modelos referenciados en la documentacion del autor. No se dispone de datos de benchmarks de terceros ni de alternativas de otros fabricantes para esta categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint INT4 base de RedHatAI y los kernels de activacion Hadamard de atdev-serve. Cargarlo con vLLM estándar o con kernels sin rotar produce resultados incorrectos.
- El perfil esta calibrado y validado exclusivamente para 32 clientes concurrentes en una A100 80GB (sm80). Su comportamiento en otras configuraciones de concurrencia o hardware no esta documentado.
- El throughput declarado proviene de una unica ejecucion de 96 prompts, no de una media repetida ni de una comparacion simultanea con las lineas base.
- Se observa una perdida de precision en coreano: KMMLU cae de 66,84% a 65,07% (aproximadamente 1,78 puntos porcentuales), con un resultado inicial de 66,04% antes de la repeticion.
- La calibracion no guardo los identificadores de fila muestreados; no se garantiza que cada fila enviada contribuya a cada proyeccion, lo que limita la reproducibilidad exacta del proceso.
- El pool de calibracion (1.024 filas, 512 limpias mas coreano e ingles) es distinto del usado en el perfil C1 W3, por lo que los resultados no son directamente trasladables entre perfiles.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este artefacto en la informacion proporcionada; deben evaluarse sobre el modelo base Qwen3.8-27B.
- La licencia Apache-2.0 de los pesos y el codigo es independiente de las condiciones de los datasets de calibracion (UltraChat y GSM8K con licencia MIT; FineWeb-2 y FineWeb-Edu con ODC-By 1.0 y terminos de Common Crawl). El texto crudo de calibracion y las etiquetas de benchmark no se redistribuyen en el repositorio.
- El titular de hasta 14,2x de velocidad pertenece al perfil C1 fast W3 y no debe atribuirse a este perfil C32.
- El resultado de 2.730,9 tok/s del C32 sin rotar no corresponde al perfil comercializado.

## Enlaces

- HuggingFace: https://huggingface.co/atdev-company/Qwen3.8-27B-atdev-c32
- Repositorio atdev-serve: https://github.com/atdev-company/atdev-serve
- Comparativa completa de perfiles de precision: https://github.com/atdev-company/atdev-serve/blob/main/docs/ACCURACY.md
- Manual de configuracion con IA: https://github.com/atdev-company/atdev-serve/blob/main/AI_SETUP.md
- Fichero de datos y licencias: `DATA_AND_LICENSES.md` en el repositorio del modelo
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint INT4 base: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
