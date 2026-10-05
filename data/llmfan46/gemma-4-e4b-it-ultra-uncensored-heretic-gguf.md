# llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF

## Resumen

Gemma-4-E4B-it-ultra-uncensored-heretic-GGUF es la version cuantizada en formato GGUF de un modelo multimodal derivado de `google/gemma-4-E4B-it`. El autor, el contribuyente independiente llmfan46, ha aplicado tecnicas de "abliteration" (eliminacion selectiva de direcciones de rechazo en el espacio de activaciones) para reducir drasticamente la tasa de negativas del modelo original, manteniendo al mismo tiempo la coherencia funcional. El resultado se distribuye bajo el pipeline `any-to-any`, con soporte declarado de entrada imagen-texto a texto.

El modelo parte de los 7.518.069.290 parametros reales (≈7,5 B) del checkpoint original en safetensors, aunque la nomenclatura "E4B" hace referencia a la convencion de parametros efectivos de la familia Gemma. La intervencion se realizo con la herramienta Heretic v1.2.0 empleando el metodo Arbitrary-Rank Ablation (ARA) sobre la capa de proyeccion de salida de atencion (`attn.o_proj`). Segun la model card, la tasa de rechazos pasa de 99/100 en el modelo original a 3/100 en esta version, con una divergencia KL de 0,0076 respecto al original.

Su relevancia actual radica en dos factores: por un lado, ofrece una alternativa de pesos abiertos (licencia declarada apache-2.0 en HuggingFace) para desarrolladores que necesitan un modelo multimodal ligero y desplegable en GPU de consumo; por otro, documenta un caso de estudio reproducible de ablacion de rechazos con metricas de degradacion (PIQA, MMLU) que permiten evaluar el coste real de este tipo de modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (variante de la familia Gemma 4; pipeline `any-to-any` / image-text-to-text) |
| Parametros totales | 7.518.069.290 (≈7,5 B, segun safetensors del modelo base) |
| Parametros activos | No confirmado como MoE. La nomenclatura "E4B" sugiere ~4B parametros efectivos (convencion Gemma), pero no hay datos explicitos en la informacion disponible. |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (metadatos HuggingFace); la model card enlaza a la licencia oficial de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license), lo que genera ambiguedad |
| Formato de pesos | GGUF (cuantizado); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

Se trata de una derivacion por ablacion de `google/gemma-4-E4B-it`, un transformer multimodal que acepta entradas combinadas de imagen y texto. No se ha reentrenado el modelo: en su lugar se aplico una tecnica de edicion de pesos conocida como abliteration o ablacion de direcciones de rechazo, en este caso mediante la implementacion Arbitrary-Rank Ablation (ARA) disponible en Heretic v1.2.0. Los parametros de la ablacion declarados son: `start_layer_index=7`, `end_layer_index=36`, `preserve_good_behavior_weight=0.5783`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.9986` y `neighbor_count=15`. El componente intervenido es unicamente `attn.o_proj`.

La motivacion del metodo es preservar el comportamiento util del modelo mientras se elimina la tendencia a rechazar peticiones (rechazos, objeciones, moralizacion, censura, suavizado o evasivas). El autor reporta una divergencia KL de 0,0076 frente al original, lo que indica una desviacion baja pero no nula de la distribucion de salida. No se documentan en la informacion disponible los datos de entrenamiento originales (numero de tokens, composicion del dataset, uso de RLHF/DPO) del modelo base Gemma 4, ni detalles de la tokenizacion o el mecanismo de atencion. Tampoco se especifica cuantas muestras ni que pipeline se uso para calibrar la ablacion.

## Capacidades

- Generacion de texto conversacional en modo chat (tag `conversational`).
- Procesamiento multimodal de entrada: el tag `image-text-to-text` y el pipeline `any-to-any` indican soporte de imagenes ademas de texto (incluye un "Vision Projector" en la model card, si bien el contenido esta truncado en la informacion proporcionada).
- Reduccion drastica de rechazos: 3 de cada 100 solicitudes generan negativa, frente a 99 de cada 100 en el modelo original.
- Razonamiento de sentido comun fisico y conocimiento general (validado en PIQA y MMLU, ver seccion de benchmarks).
- Se distribuye en multiples cuantizaciones GGUF, lo que amplia las opciones de despliegue en CPU/GPU.
- No hay datos explicitos sobre soporte de tool calling, function calling, agentes, multi-step reasoning ni thinking mode en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Generacion creativa sin restricciones: el modelo esta pensado para tareas de escritura donde el modelo original tenderia a rechazar peticiones (ficcion adulta, narrativa de genero, dialogos con contenido sensible), gracias a la reduccion de rechazos medida por el autor (3/100 frente a 99/100).
- Asistente conversacional multimodal: puede integrarse en aplicaciones que reciben imagenes y texto y devuelven texto, aprovechando la naturaleza `any-to-any` e `image-text-to-text` del pipeline.
- Despliegue en hardware de consumo: la disponibilidad de cuantizaciones Q4_K_M y Q5_K_S permite ejecutarlo en GPU con 6-8 GB de VRAM y en CPU via llama.cpp, algo inviable con la version BF16.
- Investigacion sobre alineacion y seguridad: sirve como caso de estudio reproducible de abliteration con metricas de coste (KL divergence, PIQA, MMLU) para comparar el impacto de distintas tecnicas de ablacion.
- Prototipado rapido de chatbots locales: al ser un GGUF ligero, se puede levantar con Ollama o LM Studio en un portatil para demos y pruebas internas.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye seis niveles de cuantizacion (BF16 a Q4_K_M) que permiten medir el trade-off entre calidad y consumo de memoria en un mismo modelo.
- Analisis de sesgos de rechazo: util para estudiar que tipo de peticiones deja de rechazar el modelo tras la ablacion y cuales sigue bloqueando, en el contexto de auditorias de seguridad.

## Benchmarks y rendimiento

El autor publica dos conjuntos de resultados comparando la version ablacionada con el modelo original.

| Benchmark | Modelo original (gemma-4-E4B-it) | Este modelo (Heretic/ARA) | Delta |
|---|---|---|---|
| PIQA (1838 preguntas, aciertos) | 1581 (86,02 %) | 1578 (85,85 %) | −0,17 pp |
| MMLU (14.042 preguntas, aciertos) | 9753 (69,46 %) | 9633 (68,60 %) | −0,86 pp |
| Rechazos | 99/100 | 3/100 | −96 pp |
| Divergencia KL (frente al original) | 0 (por definicion) | 0,0076 | — |

Desglose MMLU (original → Heretic): professional_law 52,87 % → 52,67 %; moral_scenarios 43,91 % → 41,23 %; miscellaneous 81,61 % → 82,12 %; professional_psychology 75,16 % → 73,86 %; high_school_psychology 89,17 % → 90,09 %; high_school_macroeconomics 72,82 % → 71,28 %; elementary_mathematics 65,87 % → 63,76 %; moral_disputes 68,21 % → 69,08 %; prehistory 75,31 % → 75,00 %; philosophy 70,74 % → 70,74 %.

No se han publicado en la informacion disponible resultados de otros benchmarks (HumanEval, GSM8K, MMBench, etc.) ni comparaciones con modelos de terceros.

## Requisitos de hardware

Estimaciones a partir del numero de parametros (≈7,5 B) y los tamanos GGUF publicados. No incluyen la huella del proyector de vision, que anade consumo adicional.

- Q4_K_M (≈4,7-5 GB en disco): cabe en GPU de 6 GB (RTX 3060 6 GB, GTX 1660 Super 6 GB) con contexto moderado; tambien fluido en CPU.
- Q5_K_S / Q5_K_M (≈5,3-5,7 GB): recomendable 8 GB de VRAM (RTX 3060 Ti, RTX 2070, RX 6600 XT).
- Q6_K (≈6,2 GB): 8-10 GB de VRAM (RTX 3070, RTX 4060 Ti 16 GB con margen).
- Q8_0 (≈8-8,5 GB): 10-12 GB de VRAM (RTX 3080, RTX 4070).
- BF16 (≈15 GB): 16-24 GB de VRAM (RTX 4090, RTX 3090, A100 40 GB); en GPU profesional se puede servir con mayor batch.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp), llama-cpp-python. Para vLLM o TGI el soporte de GGUF es parcial o requiere conversion; el modelo base en safetensors seria la via preferida para servidores de alto throughput.
- Latencia y throughput: no disponibles. Dependen en gran medida de la cuantizacion, la GPU y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (gemma-4-E4B-it-ultra-uncensored-heretic-GGUF) | ≈7,5 B | no disponible | Si (imagen-texto) | 3/100 | apache-2.0 (metadata) / Gemma 4 (model card) | GGUF |
| google/gemma-4-E4B-it (original) | ≈7,5 B | no disponible | Si | 99/100 | Gemma 4 license | safetensors |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic (base del GGUF) | ≈7,5 B | no disponible | Si | 3/100 | apache-2.0 (metadata) | safetensors |
| zecanard/gemma-4-E4B-it-uncensored-heretic-MLX-4bit-mixed_4_6 | no disponible | no disponible | Si | no disponible | no disponible | MLX (Apple Silicon) |
| FreedomAISVR/Gemma-4-E4B-it-... | no disponible | no disponible | Si | no disponible | no disponible | no disponible |

No hay informacion suficiente para comparar con modelos de otros autores de la misma categoria (por ejemplo, derivados abliterated de Llama o Qwen de tamano similar). Los datos de estos modelos comparables figuran como "no disponible" por no aparecer en la informacion proporcionada.

## Limitaciones y advertencias

- La reduccion de rechazos implica que el modelo puede generar contenido sensible, ofensivo o inapropiado sin filtros. No es apto para despliegues publicos sin moderacion adicional.
- La edicion por abliteration puede degradar sutilmente el comportamiento en tareas donde el rechazo actuaba como senal de seguridad. La caida de MMLU (−0,86 pp) y PIQA (−0,17 pp) es pequena pero real, y la divergencia KL de 0,0076 confirma que la distribucion de salida no es identica al original.
- Riesgo de alucinacion: no se documentan tasas de alucinacion especificas; al tratarse de un modelo de ~7,5 B, la tasa esperable es mayor que en modelos de mayor tamano.
- Ambiguedad de licencia: los metadatos de HuggingFace indican apache-2.0, pero la model card enlaza a la licencia oficial de Gemma 4, que impone restricciones de uso (incluidas clausulas de uso aceptable). Antes de un uso comercial es imprescindible verificar cual aplica realmente al modelo base.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto ni comportamiento multilingue; conviene validar estos extremos en el caso de uso concreto.
- El autor advierte en la propia model card que ha alcanzado el limite de almacenamiento gratuito de HuggingFace y que podria no publicar nuevos modelos; esto afecta a la sostenibilidad y al mantenimiento del repositorio.
- El modelo original Gemma 4 incorpora un proyector de vision, pero la informacion proporcionada esta truncada, por lo que no se puede confirmar el alcance exacto del soporte multimodal en esta version cuantizada.
- La fecha de actualizacion del repositorio (2026-05-28) y su elevado numero de descargas (65.217) sugieren cierta adopcion, pero no sustituyen una validacion propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta Heretic (v1.2.0): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Patreon del autor: https://patreon.com/LLMfan46
- Ko-fi del autor: https://ko-fi.com/llmfan46
