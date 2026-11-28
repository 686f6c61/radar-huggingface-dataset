# Omega-Factory/Qwen3.8-27B-Turbo-GGUF

## Resumen

Qwen3.8-27B-Turbo es una compilacion comprimida y cuantizada del modelo denso Qwen/Qwen3.8-27B, publicada por Omega-Factory bajo licencia Apache-2.0. El modelo base cuenta con 24.379.416.064 parametros reales (etiquetado comercialmente como "27B") y una ventana de contexto de 262.144 tokens. La innovacion de esta publicacion no reside en el entrenamiento, sino en la reduccion del espacio en disco y de la huella de memoria: pasa de unos 54,66 GB en BF16 a 18,03 GB en Q4_K_M, lo que permite ejecutarlo en una unica GPU de 24 GB.

La derivacion combina una poda estructural de las capas feed-forward del modelo denso original con una cuantizacion posterior. El autor declara explicitamente los costes de calidad medidos frente al modelo base, con intervalos de confianza al 95 %, y advierte de que se trata de compresion, no de mejora: no se anade ninguna capacidad nueva. El repositorio incluye tres niveles de cuantizacion (Q2_K, Q4_K_M y Q8_0) y un proyector multimodal `mmproj` en BF16 para su uso con llama.cpp.

Es relevante ahora porque demuestra una practica poco habitual en el ecosistema GGUF: publicar los artefactos junto con una tabla honesta de degradacion de capacidades y los hashes SHA-256 de cada fichero. Para desarrolladores con hardware limitado, ofrece una via de desplegar localmente un modelo denso de 24B con contexto muy largo y soporte multimodal sin recurrir a GPUs de 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5`), con proyector multimodal para vision |
| Parametros totales | 24.379.416.064 (modelo base); el artefacto Q4_K_M ocupa 18.028.549.632 bytes |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF Q2_K, Q4_K_M, Q8_0; proyector `mmproj` en BF16; base original en BF16 |
| Idiomas soportados | en (segun la model card; el modelo base Qwen suele ser multilingue, pero no se declara aqui) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q2_K, Q4_K_M, Q8_0, mmproj BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5, con 24,38 mil millones de parametros y una ventana de contexto de 262.144 tokens. Esta publicacion no entrena el modelo: parte de la revision `37561816e66b5b9153b1b64c10968c18c1e6f4a0` de Qwen/Qwen3.8-27B, aplica una poda estructural de las capas feed-forward y despues cuantiza el resultado a GGUF. El autor reconoce que el campo `base_model_relation` del Hub no contempla la relacion "pruned", por lo que lo marca como `quantized` y documenta la derivacion completa en la model card.

No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF o DPO), ni innovaciones de decodificacion como decodificacion especulativa o atencion lineal. Lo que si se documenta con rigor es el proceso de compresion: el fichero Q4_K_M pasa de 54,6577 GB a 18,0285 GB (un 67,0 % menos) y la memoria estimada de inferencia baja de unos 58 GB a unos 20 GB. Se incluye un proyector multimodal BF16 de 931.145.888 bytes que habilita el uso de imagenes mediante `llama-mtmd-cli`.

## Capacidades

- Generacion de texto conversacional y razonamiento: el modelo base es de tipo `text-generation` con tag `conversational`.
- Razonamiento matematico: evaluado en GSM8K y MATH-500 en la model card.
- Conocimiento general y respuesta a preguntas de opcion multiple: evaluado en ARC-Challenge.
- Vision multimodal: el repositorio incluye `Qwen3.8-27B-Turbo-mmproj-BF16.gguf`, lo que permite pasar imagenes al modelo con `llama.cpp`.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos o conversaciones multi-turno largas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructura de inferencia estandar.
- Uso con `llama.cpp`: los pesos estan pensados para `llama-mtmd-cli` y el ecosistema GGUF (Ollama, llama.cpp, etc.).
- No se declara soporte explicito de tool calling, function calling ni modos de agente multi-paso en la informacion proporcionada.

## Casos de uso

- Despliegue local en una GPU de 24 GB: con el fichero Q4_K_M (18,03 GB) y unos 20 GB de VRAM estimada, el modelo cabe en tarjetas como la RTX 4090 o la RTX 3090, lo que permite ejecutar un denso de 24B en estaciones de trabajo consumer.
- Analisis de documentos largos: la ventana de 262.144 tokens permite procesar contratos, informes o bases de codigo completas en una sola pasada, con el modelo cuantizado para reducir coste de memoria.
- Asistente conversacional autoalojado: el tag `conversational` y la licencia Apache-2.0 facilitan integrar el modelo en un chatbot interno sin dependencia de APIs externas.
- Procesamiento de imagenes con descripcion textual: usando el `mmproj` BF16 con `llama-mtmd-cli`, se pueden generar descripciones de fotos, extraer texto de imagenes o responder preguntas sobre contenido visual.
- Razonamiento matematico asistido: los resultados en GSM8K (83,50 %) y MATH-500 (49,50 %) lo hacen util para tutoria o resolucion de problemas de nivel escolar y preuniversitario, aceptando la degradacion de 2,5 y 3,5 puntos frente al base.
- Evaluacion y experimentacion en investigacion: al publicar los niveles Q2_K, Q4_K_M y Q8_0 junto con los deltas de calidad medidos, sirve como caso de estudio reproducible sobre el impacto de la poda y la cuantizacion en modelos densos.
- Prototipado en entornos con VRAM limitada: el Q2_K (14,34 GB) permite probar el modelo en GPUs de 16 GB, a costa de una mayor perdida de calidad no cuantificada en la model card.

## Benchmarks y rendimiento

Resultados medidos sobre `Qwen3.8-27B-Turbo-Q4_K_M.gguf` (SHA-256 `519766ba...e66ef63`) frente al modelo base:

| Benchmark | Base | Este build (Q4_K_M) | Cambio | IC 95 % |
|---|---:|---:|---:|---:|
| ARC-Challenge (MC) | 96,00 % | 95,50 % | -0,50 pp | [-2,70; 1,70] |
| GSM8K | 86,00 % | 83,50 % | -2,50 pp | [-7,40; 2,40] |
| MATH-500 | 53,00 % | 49,50 % | -3,50 pp | [-9,29; 2,29] |

El autor no publica ninguna capacidad que mejore respecto al base ni ninguna medicion no replicada. Los tres cambios caen dentro del intervalo de confianza, lo que el propio autor interpreta como "no resuelto", no como prueba de ausencia de cambio. No se han publicado resultados para MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: ~20 GB (frente a ~58 GB del base en BF16).
- VRAM estimada para Q2_K: no declarada explicitamente; el fichero ocupa 14.340.367.872 bytes (~14,34 GB), por lo que encaja en GPUs de 16 GB.
- VRAM estimada para Q8_0: no declarada; el fichero ocupa 25.921.889.792 bytes (~25,92 GB), lo que exige GPUs de 32 GB o superiores.
- GPU recomendada por el autor para Q4_K_M: clase 24 GB (por ejemplo, RTX 4090, RTX 3090, A10G de 24 GB, L4 de 24 GB).
- GPU para el modelo base en BF16: 2x48 GB o una GPU de 80 GB (A100 80 GB, H100 80 GB).
- Cabe en GPU consumer: si, en Q4_K_M y Q2_K; en Q8_0 requiere GPUs profesionales de 32 GB o mas.
- Opciones de despliegue: `llama.cpp` (incluido `llama-mtmd-cli` para multimodal), ecosistema GGUF como Ollama; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.8-27B-Turbo (este) | 24,38 B (podado) | 262.144 | GGUF Q2_K / Q4_K_M / Q8_0 | Apache-2.0 | Poda FF + cuantizacion; deltas medidos frente al base |
| Qwen/Qwen3.8-27B (base) | 24,38 B | 262.144 | BF16 (~54,66 GB) | Apache-2.0 | Referencia de calidad; requiere ~58 GB de VRAM |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- Es compresion, no mejora: el autor declara explicitamente que no se anade ninguna capacidad nueva y que no se reclama recuperacion de la capacidad perdida.
- Degradacion medible: GSM8K cae 2,5 pp y MATH-500 cae 3,5 pp en Q4_K_M; aunque los intervalos de confianza incluyen el cero, el autor advierte que un cambio dentro del IC esta "sin resolver", no descartado.
- Poda de capas feed-forward: la perdida de calidad puede ser mayor en tareas no evaluadas (codigo, multilingue, tool calling) para las que no se publican mediciones.
- Idiomas: la model card solo declara `en`; el comportamiento en castellano u otros idiomas no esta verificado en esta publicacion.
- Alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; es un riesgo inherente a los modelos generativos.
- Sesgos: no se publica ninguna evaluacion de sesgos en la informacion disponible.
- Tool calling y agentes: no se declara soporte explicito; conviene validarlo antes de usarlo en pipelines de agentes.
- Licencia: Apache-2.0 permite uso comercial, pero exige incluir el texto de la licencia del modelo base y atribuir a Qwen/Qwen3.8-27B indicando que los pesos estan modificados.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.
- Niveles Q2_K y Q8_0 sin mediciones de calidad publicadas; solo el Q4_K_M tiene deltas documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Omega-Factory/Qwen3.8-27B-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio de llama.cpp (uso con `llama-mtmd-cli`): https://github.com/ggerganov/llama.cpp
