# bcckfdn/minillama-test-v2-it-GGUF

## Resumen

`bcckfdn/minillama-test-v2-it-GGUF` es la version cuantizada en formato GGUF de `bcckfdn/minillama-test-v2-it`, un modelo de generacion de texto de arquitectura tipo Llama/SmolLM2 entrenado aparentemente desde cero por el usuario bcckfdn, con enfoque bilingue turco-ingles. Se trata de un modelo muy pequeno: la model card del autor lo describe como un "smollm2-135m-tr-v1", pero el recuento real de parametros publicado en el repositorio base (safetensors) es de 52.953.984 parametros, es decir, unos 53 millones, con 22 capas y una dimension oculta de 384.

El modelo esta pensado para ejecucion en llama.cpp, Ollama y LM Studio, con cuatro niveles de cuantizacion publicados que van de 43 MB a 103 MB. Su relevancia practica es la de un modelo de bolsillo: permite inferencia en CPU, dispositivos de borde o hardware muy limitado, y sirve como base para experimentacion, fine-tuning ligero y prototipado rapido en turco.

El autor declara un entrenamiento de 86.016 millones de tokens sobre una arquitectura decoder-only estilo Llama. No hay publicados datos sobre la composicion del dataset, el proceso de alineamiento (RLHF/DPO) ni la longitud de contexto soportada. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama/SmolLM2 (22 capas, hidden 384) |
| Parametros totales | 52.953.984 (~53 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

Detalle de los archivos publicados:

| Archivo | Tamano |
|---|---|
| `smollm2-135m-tr-v1-BF16.gguf` | 103 MB |
| `smollm2-135m-tr-v1-Q8_0.gguf` | 55 MB |
| `smollm2-135m-tr-v1-Q5_K_M.gguf` | 45 MB |
| `smollm2-135m-tr-v1-Q4_K_M.gguf` | 43 MB |

## Arquitectura y entrenamiento

La arquitectura declarada por el autor es la de SmolLM2 (familia Llama): un transformer decoder-only con 22 capas y dimension oculta de 384, entrenado desde cero. No se especifican el numero de cabezas de atencion, la dimension de la capa feed-forward, el tipo de normalizacion ni si emplea atencion con RoPE u otro esquema de posicionamiento. Tampoco se documenta si el vocabulario esta adaptado especificamente al turco o si reutiliza un tokenizador existente.

El volumen de entrenamiento declarado es de 86.016 millones de tokens, una cifra alta en relacion al tamano del modelo (ratio superior a 1.600 tokens por parametro). No hay informacion sobre la composicion del dataset, la mezcla de idiomas, el uso de datos sinteticos, ni sobre si se aplico instruction tuning, RLHF, DPO u otra tecnica de alineamiento, pese a que el sufijo "-it" del nombre y la etiqueta "conversational" sugieren un ajuste instruccional. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, MoE o arquitecturas hibridas).

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Conversacion multi-turno basica, segun la etiqueta "conversational" y el sufijo "-it" del modelo base.
- Ejecucion en llama.cpp con modo conversacional (`-cnv`), Ollama y LM Studio.
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible` en HuggingFace).
- Capacidad de razonamiento, matematicas y generacion de codigo: no documentada y, dado el tamano del modelo, previsiblemente muy limitada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Prototipado rapido de chatbots en turco: el modelo puede ejecutarse en un portatil sin GPU mediante llama.cpp u Ollama, lo que permite validar flujos conversacionales y prompts antes de escalar a un modelo mayor.
- Inferencia en dispositivos de borde: con 43 MB en Q4_K_M, cabe en Raspberry Pi, moviles con llama.cpp compilado o microcontroladores con suficiente RAM, para tareas de generacion de texto muy acotadas y sin conexion.
- Generacion de texto auxiliar offline: completado de frases cortas, respuestas plantilla o variaciones de texto en turco dentro de aplicaciones de escritorio sin acceso a internet.
- Base para fine-tuning ligero: al ser un modelo de 53 M de parametros con licencia Apache 2.0, es viable reentrenarlo o ajustarlo con LoRA en una unica GPU consumer para dominios concretos (atencion al cliente de nicho, terminologia sectorial).
- Experimentacion academica y docencia: util para ilustrar el pipeline completo de entrenamiento, cuantizacion GGUF y despliegue en llama.cpp sin requerir infraestructura de datacenter.
- Banco de pruebas de cuantizacion: los cuatro niveles publicados (BF16, Q8_0, Q5_K_M, Q4_K_M) permiten medir la degradacion de calidad frente a tamano en un modelo pequeno y extrapolar conclusiones metodologicas.
- Filtrado y clasificacion de texto en turco: con ajuste supervisado adicional podria emplearse como clasificador generativo de baja latencia, aunque no es su tarea nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y tampoco hay comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en BF16, 0,06 GB en Q8_0 y 0,05 GB en Q4_K_M, mas el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm o Metal sirve; el modelo no necesita aceleracion dedicada y puede ejecutarse integramente en CPU.
- Compatibilidad con GPU consumer: si, en cualquier GPU consumer moderna e incluso en iGPU integradas. El cuello de botella es la memoria del sistema, no la VRAM.
- Opciones de despliegue: llama.cpp (recomendado), Ollama, LM Studio y llama-cpp-python. vLLM no es una opcion natural para este tamano ni para GGUF.
- Latencia y throughput estimados: no disponibles. Dado el tamano, en CPU moderna se esperaria una latencia por token muy baja (orden de milisegundos a decenas de milisegundos) y throughput alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| bcckfdn/minillama-test-v2-it-GGUF | ~53 M | no disponible | tr, en | Apache 2.0 | GGUF |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8.192 tokens (segun ficha publica del modelo original) | en (multilingue limitado) | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (segun ficha publica) | multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1.100 M | 2.048 tokens | en | Apache 2.0 | safetensors, GGUF |

Nota: los datos de contexto y parametros de los modelos comparados provienen de sus fichas publicas y no de la informacion proporcionada sobre este modelo. No hay benchmarks publicados de `minillama-test-v2-it` que permitan una comparacion de rendimiento objetiva con estas alternativas. La ventaja diferencial de este modelo es su especializacion declarada en turco y su tamano extremadamente reducido; su desventaja es la falta total de documentacion tecnica y de evaluacion.

## Limitaciones y advertencias

- Con ~53 M de parametros, la capacidad de razonamiento, coherencia a largo plazo y conocimiento factual es muy limitada. Es previsible una tasa elevada de alucinacion, especialmente en preguntas factuales y en generacion de codigo.
- Existe una discrepancia notable entre el nombre de los archivos ("smollm2-135m-tr-v1") y el recuento real de parametros del modelo base (52.953.984). Conviene tratar la denominacion "135m" como no verificada.
- No se documenta la longitud de contexto soportada, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- No se documenta el proceso de alineamiento ni las medidas de seguridad aplicadas. No hay garantia de que el modelo rechace peticiones daninas, genere contenido sesgado o mantenga un tono adecuado en produccion.
- No se documenta la composicion del dataset de entrenamiento: se desconocen sesgos de genero, origen, religion o politicos, asi como la presencia de datos con derechos de terceros.
- El soporte multilingue se limita a turco e ingles segun las etiquetas del repositorio. El rendimiento en otros idiomas, incluido el castellano, no esta documentado y previsiblemente sera nulo o muy pobre.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial y modificacion sin restricciones adicionales, pero no exime al usuario de evaluar el modelo antes de desplegarlo.
- Las fechas de creacion y actualizacion del repositorio (2026-09-18) son posteriores a la fecha de consulta habitual, lo que sugiere un posible error de metadatos en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcckfdn/minillama-test-v2-it-GGUF
- Modelo base: https://huggingface.co/bcckfdn/minillama-test-v2-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Paper de SmolLM2 (arquitectura de referencia citada por el autor): https://arxiv.org/abs/2502.02737
- La busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos correspondian a paginas de soporte de YouTube y no guardan relacion con esta ficha.
