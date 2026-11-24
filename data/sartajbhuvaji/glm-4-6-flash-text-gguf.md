# sartajbhuvaji/GLM-4.6-Flash-text-GGUF

## Resumen

GLM-4.6-Flash-text-GGUF es una coleccion de cuantizaciones GGUF del modelo `sartajbhuvaji/unfuse-GLM-4.6-Flash-text`, una variante de texto puro obtenida a partir de `zai-org/GLM-4.6V-Flash` tras eliminar por completo su pila de vision de 892 millones de parametros. El modelo resultante conserva el decodificador GLM-4 con 9.400.279.040 parametros y una ventana de contexto de 131.072 tokens, y esta pensado para ejecutarse en llama.cpp y Ollama sobre hardware de consumo. La publicacion corre a cargo de sartajbhuvaji, que actua como autor de la extraccion y de las cuantizaciones, mientras que el modelo original pertenece a Z.ai (zai-org).

El interes practico de esta ficha es doble. Por un lado, ofrece un modelo de razonamiento de aproximadamente 9.400 millones de parametros en formato GGUF, con tamanos que van de 6,17 GB en Q4_K_M a 18,81 GB en F16, lo que permite desplegarlo en GPUs de consumo con 8-12 GB de VRAM. Por otro, documenta un proceso de cirugia de pesos que elimina la rama multimodal sin alterar el calculo de texto: el autor verifica la equivalencia bit a bit contra el modelo original (`max|d| = 0.000e+00`) en seis prompts y de nuevo a 1.207 tokens.

La relevancia actual radica en que el modelo es un razonador que emite un bloque de pensamiento antes de responder, a veces en chino independientemente del idioma del prompt, y en que la licencia MIT del modelo base se mantiene en esta redistribucion, lo que facilita su uso comercial. No obstante, las cuantizaciones no se han validado con perplexity ni con benchmarks frente a los pesos bf16, un caveat importante para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4 (transformer decoder, identificado como `glm4` en llama.cpp) |
| Parametros totales | 9.400.279.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es `zai-org/GLM-4.6V-Flash`, una implementacion `Glm4vForConditionalGeneration` compuesta por un ViT de 24 capas que inyecta tokens suaves en un decodificador GLM-4 mediante `masked_scatter`. La variante text-only elimina esa rama de vision: se pasa de 10.292.777.472 a 9.400.279.040 parametros (892.498.432 eliminados, un 8,671% del total) y de 704 a 523 tensores, con el tamano en bf16 reduciendose de 20,59 GB a 18,80 GB. El argumento del autor es que los tokens de texto nunca atraviesan un peso de vision, por lo que suprimir la rama no altera el calculo textual; la verificacion bit a bit contra el original respalda esta afirmacion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo original. Las cuantizaciones se generaron con llama.cpp en la rama master a partir de los pesos bf16 del repositorio padre. El autor indica que cada fichero se comprobo cargando y generando texto coherente bajo llama.cpp, con reconocimiento correcto de la arquitectura `glm4`, el recuento de parametros y la longitud de contexto, pero no se ejecuto ninguna comparacion de perplexity ni de benchmarks frente a bf16.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con soporte de modo interactivo en `llama-cli`.
- Razonamiento explicito: el modelo emite un bloque de pensamiento antes de la respuesta final, lo que exige presupuestos de generacion amplios (el autor recomienda 600 tokens o mas; 160 no bastan para superar el razonamiento).
- Capacidad multilingue limitada a ingles y chino; el bloque de razonamiento puede aparecer en chino aunque el prompt este en ingles.
- Ejecucion local mediante llama.cpp y Ollama, con compatibilidad declarada con endpoints.
- No dispone de vision: la rama multimodal fue eliminada en la extraccion.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la informacion disponible.
- No se documenta modo de audio ni otras modalidades.

## Casos de uso

- Razonamiento local en estaciones de trabajo sin GPU dedicada de gran capacidad: con Q4_K_M (6,17 GB) el modelo cabe en GPUs de consumo de 8 GB y permite resolver problemas de logica o matematicas paso a paso, aceptando el coste del bloque de pensamiento.
- Asistencia de programacion en el editor: al ser un modelo de 9.400 millones de parametros con contexto de 131.072 tokens, puede cargar ficheros completos y varios archivos de un repositorio pequeno para tareas de explicacion, refactorizacion o generacion de pruebas, siempre que se configure un limite de generacion suficiente.
- Procesamiento de documentos largos en ingles o chino: contratos, informes o articulos de decenas de miles de tokens caben en la ventana de contexto, lo que permite resumen y extraccion de datos sin trocear el documento.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del modelo base se mantiene, lo que facilita la integracion en productos comerciales sin obligaciones de atribucion mas alla de la propia MIT.
- Prototipado de pipelines de razonamiento en llama.cpp: util para comparar el comportamiento de un razonador de ~9.400 millones de parametros frente a alternativas mayores, con la ventaja de que el binario y los pesos caben en un portatil con GPU de 12 GB.
- Traduccion y generacion bilingue ingles-chino: el modelo soporta ambos idiomas de forma nativa, lo que sirve para tareas de traduccion tecnica o atencion a usuarios en esas dos lenguas, con la advertencia de que el razonamiento interno puede mezclar idiomas.
- Evaluacion de tecnicas de extraccion de pesos: el repositorio documenta el proceso de eliminar una rama multimodal con verificacion bit a bit, por lo que resulta un caso de referencia para investigadores que quieran aplicar cirugia similar a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto comparacion de perplexity ni de benchmarks frente a los pesos bf16, y que la equivalencia bit a bit verificada aplica solo a los pesos bf16 del repositorio padre, no a estas cuantizaciones con perdida.

## Requisitos de hardware

- VRAM estimada segun fichero: Q4_K_M 6,17 GB, Q5_K_M 7,05 GB, Q6_K 8,27 GB, Q8_0 10,00 GB, F16 18,81 GB (tamanos en GB decimales, tal como los reporta el Hub).
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4070 para Q4_K_M y Q5_K_M; RTX 4080 o RTX 4090 para Q6_K y Q8_0; A100 o H100 para F16 y para contextos muy largos con KV cache grande.
- Cabe en GPU de consumo: si, desde 8 GB de VRAM con Q4_K_M, siempre que se reserve memoria adicional para la cache KV, que crece con el contexto y puede ser considerable en ventanas cercanas a 131.072 tokens.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...`). No se documenta soporte verificado en vLLM ni TGI para este repositorio GGUF.
- Latencia y throughput: no disponible. El autor no publica mediciones de velocidad de generacion ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-4.6-Flash-text-GGUF | 9.400.279.040 | 131.072 | MIT | GGUF | Razonador text-only derivado de GLM-4.6V-Flash; sin benchmarks publicados |
| zai-org/GLM-4.6V-Flash | 10.292.777.472 | no disponible | MIT | safetensors | Modelo original con vision; 892M parametros mas; requiere bf16 (~20,59 GB) |
| sartajbhuvaji/unfuse-GLM-4.6-Flash-text | 9.400.279.040 | 131.072 | MIT | safetensors (bf16) | Version text-only sin cuantizar, base de estas GGUF; verificada bit a bit |

No se dispone de datos de benchmark que permitan comparar el rendimiento relativo con otras familias de modelos del mismo tamano.

## Limitaciones y advertencias

- Las cuantizaciones son con perdida y no se ha medido la degradacion de calidad frente a bf16; el autor recomienda calcularla por cuenta propia si se necesita un delta medido.
- El modelo emite un bloque de razonamiento antes de responder y puede hacerlo en chino aunque el prompt este en ingles, lo que complica el parseo automatico de la salida en produccion.
- Presupuesto de tokens: con menos de 600 tokens de generacion el modelo puede no llegar a la respuesta final, ya que consume tokens en el razonamiento.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano ni de otras lenguas, por lo que la calidad fuera de esos idiomas es incierta.
- Riesgo de alucionacion no cuantificado: no hay evaluaciones de factualidad publicadas para esta variante ni para el modelo base.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo.
- La ventana de 131.072 tokens exige planificar la cache KV; en GPUs de consumo con contextos largos la memoria adicional puede superar la del propio modelo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion ni sobre la validez de los pesos tras la extraccion.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad sin validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sartajbhuvaji/GLM-4.6-Flash-text-GGUF
- Modelo padre text-only (bf16): https://huggingface.co/sartajbhuvaji/unfuse-GLM-4.6-Flash-text
- Modelo original con vision: https://huggingface.co/zai-org/GLM-4.6V-Flash
