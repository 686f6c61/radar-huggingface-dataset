# dfed24/SmolLM2-1.7B-Instruct-gptq-4bit-mlx

## Resumen

SmolLM2-1.7B-Instruct-gptq-4bit-mlx es una cuantizacion a 4 bits del modelo instructivo HuggingFaceTB/SmolLM2-1.7B-Instruct, publicada por el usuario dfed24 (Domenic Federico). El objetivo no es entrenar un modelo nuevo, sino producir una version comprimida de un transformer de 1.711.376.384 parametros que conserve mejor la calidad que la cuantizacion estandar de `mlx_lm convert -q`, que emplea redondeo al vecino mas cercano. El resultado se empaqueta en el formato afino de MLX y se carga con la libreria `mlx_lm`, de modo que solo es ejecutable de forma nativa en Apple Silicon.

La relevancia de esta ficha es metodologica: el autor sustituye el redondeo ingenuo por GPTQ (Frantar et al., 2022) con realimentacion de error y busqueda de rejilla de minimo error por grupo (tamano de grupo 64), ademas de mantener los embeddings atados en 8 bits y el resto en float16. Sobre el conjunto de test WikiText-2, la perplejidad baja de 10,537 (redondeo al vecino mas cercano, 922 MB) a 9,412 (esta version, 970 MB), frente a 8,939 del modelo original en fp16. Es decir, recupera buena parte de la degradacion a cambio de un 5 por ciento mas de tamano y un 5 por ciento mas de latencia de decodificacion.

Se trata, por tanto, de un artefacto de cuantizacion orientado a desarrolladores que quieran ejecutar un modelo conversacional pequeno en local en un Mac, con la licencia Apache 2.0 heredada del modelo base. No hay datos publicados de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni de idiomas soportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SmolLM2-1.7B-Instruct); pesos cuantizados a 4 bits en formato afino de MLX |
| Parametros totales | 1.711.376.384 (1,7 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card de esta cuantizacion no la especifica) |
| Tipos de cuantizacion | 4 bits con GPTQ y rejilla de minimo error por grupo, tamano de grupo 64, embeddings atados en 8 bits, resto en float16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, empaquetado en formato afino de MLX (libreria `mlx`) |
| Tamano del repositorio | 1,0 GB (fichero de pesos de 970 MB) |
| Modelo base | HuggingFaceTB/SmolLM2-1.7B-Instruct |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base SmolLM2-1.7B-Instruct, un transformer denso de 1,7 mil millones de parametros. Esta publicacion no reentrena ni modifica la arquitectura: aplica un proceso de cuantizacion post-entrenamiento sobre los pesos del modelo instructivo original. El detalle del preentrenamiento y del ajuste por instrucciones (composicion del dataset, numero de tokens, uso de RLHF o DPO) no se documenta en la informacion disponible de esta ficha.

La innovacion tecnica esta en el metodo de cuantizacion. Se usan 128 secuencias de calibracion de 512 tokens extraidas del conjunto de entrenamiento de WikiText-2. Para cada capa lineal se calcula la matriz de Hessiana H = XᵀX con un amortiguamiento del 1 por ciento, y las columnas se redondean en orden realimentando el error hacia las columnas restantes a traves del factor de Cholesky de H⁻¹, con un tamano de bloque de 128. Cada capa se calibra sobre las salidas de las capas ya cuantizadas que la preceden, y el rango de rejilla de cada grupo se busca minimizando el error cuadratico. Finalmente los pesos se empaquetan en el formato afino de MLX. El autor publica codigo y scripts reproducibles en github.com/dfed25/mlx-gptq e indica que el trabajo se desarrollo con Claude (Anthropic) como asistente de programacion e investigacion.

## Capacidades

- Generacion de texto y conversacion multi-turno: heredadas del modelo base instructivo, con el pipeline `text-generation` declarado en el repositorio.
- Ajuste a instrucciones: al derivar de SmolLM2-1.7B-Instruct, el comportamiento esperado es de asistente conversacional, si bien esta cuantizacion no incluye evaluaciones propias de instrucciones.
- Razonamiento y codigo: no se documentan evaluaciones especificas en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no documentadas. El repositorio no declara modulos multimodales.
- Ejecucion local en Apple Silicon: capacidad operativa destacada, al cargarse directamente con `mlx_lm`.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con `python -m mlx_lm generate --model dfed24/SmolLM2-1.7B-Instruct-gptq-4bit-mlx` y ocupa menos de 1 GB de pesos, por lo que es viable mantener un chat interactivo sin conexion a internet en equipos Apple Silicon de gama media.
- Prototipado rapido de aplicaciones de lenguaje: al ser una cuantizacion de 4 bits, permite iterar sobre prompts y flujos de generacion en un portatil antes de escalar a un modelo mayor, con una perplejidad de 9,412 en WikiText-2 que acota la degradacion esperada.
- Generacion de texto asistida en herramientas de escritorio: integrable en editores, gestores de notas o scripts de linea de comandos que requieran resumenes, reescritura o completado de parrafos cortos en local.
- Despliegue en entornos sin GPU dedicada: al depender solo de memoria unificada de Apple Silicon, encaja en puestos de trabajo corporativos o de investigacion donde no hay tarjetas NVIDIA disponibles.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye scripts reproducibles y mediciones de perplejidad, lo que lo convierte en un caso de referencia para comparar GPTQ frente a redondeo al vecino mas cercano en MLX.
- Procesamiento por lotes de textos cortos: tareas de clasificacion ligera, etiquetado o extraccion de informacion sobre documentos pequenos, ejecutadas de forma offline y con coste marginal nulo por token.
- Educacion e investigacion: uso como banco de pruebas para estudiar el efecto de la cuantizacion en modelos de 1,7 B, con la ventaja de que todos los numeros publicados son reproducibles con los scripts enlazados.

## Benchmarks y rendimiento

La model card solo publica perplejidad sobre WikiText-2 (conjunto de test, 20 ventanas de 2048 tokens, menor es mejor; medicion en un MacBook Pro M4 Pro con MLX 0.32):

| Modelo | Perplejidad WikiText-2 | Tamano |
|---|---|---|
| Original en fp16 | 8,939 | no disponible |
| 4 bits con redondeo al vecino mas cercano (`mlx_lm convert -q`, grupo 64, embedding de 4 bits) | 10,537 | 922 MB |
| Este modelo (GPTQ 4 bits, grupo 64, embedding de 8 bits) | 9,412 | 970 MB |

El autor indica ademas que el embedding de 8 bits es la causa de que este modelo sea aproximadamente un 5 por ciento mas grande y un 5 por ciento mas lento al decodificar que la version de redondeo al vecino mas cercano; con embedding de 4 bits la perplejidad sube alrededor de 0,5 puntos y el tamano y la velocidad se igualan.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: los pesos ocupan 970 MB; sumando cache KV y sobrecarga de ejecucion, la estimacion practica es de 1,5 a 2,5 GB de memoria unificada para contextos cortos y de algo mas en contextos largos (estimacion propia, no publicada por el autor).
- GPU compatibles: exclusivamente Apple Silicon (serie M), dado que el formato de pesos es afino de MLX y requiere la libreria `mlx`. No es ejecutable de forma nativa en CUDA con `mlx_lm`.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la familia M y 8 GB o mas de memoria unificada. En el hardware citado por el autor (MacBook Pro M4 Pro) se realizaron las mediciones de perplejidad.
- Opciones de despliegue: `mlx_lm` (generacion por linea de comandos y API en Python). No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama, TGI ni otros servidores, ya que el formato no es GGUF ni safetensors estandar de PyTorch.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo; el unico dato relativo es que la decodificacion es aproximadamente un 5 por ciento mas lenta que la cuantizacion de 4 bits con redondeo al vecino mas cercano, atribuido al embedding de 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Perplejidad WikiText-2 | Tamano | Licencia |
|---|---|---|---|---|---|
| dfed24/SmolLM2-1.7B-Instruct-gptq-4bit-mlx (este modelo) | 1,7 B | MLX afino, GPTQ 4 bits, grupo 64, embedding 8 bits | 9,412 | 970 MB | Apache 2.0 |
| HuggingFaceTB/SmolLM2-1.7B-Instruct en fp16 | 1,7 B | safetensors fp16 | 8,939 | no disponible | Apache 2.0 |
| Cuantizacion de 4 bits con redondeo al vecino mas cercano de `mlx_lm convert -q` | 1,7 B | MLX afino, 4 bits, grupo 64, embedding 4 bits | 10,537 | 922 MB | Apache 2.0 (heredada del base) |

No se dispone de datos en la informacion proporcionada para comparar con otras alternativas de la misma categoria, como cuantizaciones GGUF de llama.cpp o versiones de 1-2 B de otras familias, ya que no se han publicado mediciones equivalentes en este repositorio.

## Limitaciones y advertencias

- Es una cuantizacion de 4 bits: aunque reduce la perdida frente al redondeo al vecino mas cercano, sigue degradando la calidad respecto al modelo en fp16 (perplejidad 9,412 frente a 8,939), con el consiguiente riesgo de mayor tasa de error en tareas sensibles.
- Riesgo de alucinacion inherente a un modelo de 1,7 B de parametros; la cuantizacion puede acentuarlo. No se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada. Al no declararse la composicion del dataset de entrenamiento, no puede caracterizarse el sesgo de origen.
- Cobertura idiomatica: no se declaran idiomas soportados, por lo que no hay garantia de buen rendimiento en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto: no especificada en esta model card; debe consultarse la ficha del modelo base antes de disenar aplicaciones que dependan de ventanas largas.
- Restricciones de uso comercial: la licencia es Apache 2.0, heredada del modelo base, por lo que se permite uso comercial con las condiciones habituales de atribucion y aviso de licencia.
- Dependencia de plataforma: el formato MLX restringe la ejecucion a Apple Silicon; para CUDA o CPU x86 habria que reconvertir desde el modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni comunidad verificable; conviene tratar los artefactos como no auditados por terceros.
- El autor declara haber utilizado Claude (Anthropic) como asistente de programacion e investigacion, lo que no invalida los resultados pero conviene tener en cuenta al evaluar el codigo.
- No se documenta tool calling, agentes ni razonamiento multi-paso, por lo que no deberia asumirse su funcionamiento en pipelines que dependan de esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dfed24/SmolLM2-1.7B-Instruct-gptq-4bit-mlx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Codigo, scripts y mediciones del autor: https://github.com/dfed25/mlx-gptq
- Paper de GPTQ citado por el autor (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- La busqueda web realizada no devolvio enlaces tecnicos relevantes: todos los resultados correspondian a un comparador de vuelos sin relacion con el modelo.
