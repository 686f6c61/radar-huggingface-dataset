# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-sr30k` es un checkpoint de referencia publicado por la organizacion open-sci en Hugging Face. Se trata de un ajuste fino supervisado (SFT) completo sobre una base de aproximadamente 1.700 millones de parametros, entrenado con el framework LLaMA-Factory sobre un dataset derivado de Superior-Reasoning-SFT generado con gpt-oss-120b. El identificador del modelo y la model card apuntan a un experimento de reproducibilidad dentro de la iniciativa open-sci, no a un modelo de proposito general listo para produccion.

La relevancia de esta publicacion es fundamentalmente metodologica: sirve como referencia reproducible de un pipeline de SFT a gran escala (32 GPUs, batch total de 128, cinco epocas) y como punto de comparacion para otros experimentos de la misma organizacion. El nombre codifica decisiones de entrenamiento concretas (contexto de 4096 tokens, SFT largo de 16k, dataset Tulu3 decontaminado, submuestreo sr30k) que permiten rastrear la receta exacta utilizada.

Conviene subrayar que la model card esta generada automaticamente por el Trainer y no incluye descripcion de uso previsto, composicion del dataset, evaluacion ni limitaciones. La licencia es "other" y no se especifican idiomas soportados. Cualquier uso en produccion requeriria una evaluacion propia y la verificacion de los terminos de licencia con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Nemotron, segun el identificador); detalles no disponibles |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (segun el identificador del modelo); no confirmado en la model card |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados) |
| Formato de pesos | safetensors |
| Libreria | transformers (custom_code) |
| Pipeline declarado | feature-extraction |
| Tamano del repo | 3,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) de una base de 1,7B parametros que el identificador asocia a la familia Nemotron. No se dispone de la configuracion exacta de capas, dimensiones ocultas ni tipo de atencion; la model card no la documenta y el tag `custom_code` sugiere que la implementacion requiere codigo propio del repositorio. El contexto de entrenamiento declarado en el nombre es de 4096 tokens.

El entrenamiento se realizo con LLaMA-Factory sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, un conjunto de 30.000 muestras de razonamiento generadas con gpt-oss-120b en formato ShareGPT. Los hiperparametros documentados son: learning rate 4e-05, batch total 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion), optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10 %, 5 epocas y semilla 42. El framework utilizado fue Transformers 4.57.3 sobre PyTorch 2.10.0+cu128. El identificador menciona ademas variantes de la receta (contexto largo de 16k, dataset Tulu3 decontaminado y submuestreo sr30k) que no se detallan en la model card. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje, heredadas de la base de 1,7B parametros.
- Razonamiento de tipo cadena de pensamiento, inducido por el dataset de SFT derivado de gpt-oss-120b.
- Respuesta en formato ShareGPT multi-turno, coherente con el formato del dataset de entrenamiento.
- Extraccion de caracteristicas (pipeline declarado en Hugging Face: `feature-extraction`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el dataset de origen es de razonamiento, pero no hay evaluacion que lo confirme.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Reproducibilidad de experimentos de SFT: el checkpoint sirve como referencia fija para comparar recetas de ajuste fino (learning rate, epocas, composicion del dataset) dentro de la iniciativa open-sci, ya que todos los hiperparametros estan documentados.
- Investigacion sobre destilacion de razonamiento: permite estudiar como un modelo de 1,7B absorbe trazas de razonamiento generadas por un modelo mucho mayor (gpt-oss-120b) mediante SFT puro, sin RL.
- Base para experimentos de alineacion posteriores: al ser un SFT limpio y reproducible, es un punto de partida adecuado para aplicar DPO o RLHF y medir el delta respecto a la referencia.
- Evaluacion de contaminacion de datasets: el identificador menciona "decontaminated" y "Tulu3", lo que lo hace util para analizar el efecto de la decontaminacion en el rendimiento downstream.
- Extraccion de representaciones internas: con el pipeline `feature-extraction` puede emplearse para obtener embeddings de frases o analizar activaciones en estudios de interpretabilidad.
- Prototipado de bajo coste en una sola GPU: con 1,7B parametros y pesos safetensors de 3,4 GB, cabe en GPUs de consumo para pruebas de inferencia y validacion de pipelines antes de escalar a modelos mayores.
- Generacion de datos sinteticos a pequeña escala: puede utilizarse para producir borradores de respuestas de razonamiento que luego se filtran, dado su entrenamiento en ese formato.

## Benchmarks y rendimiento

La model-index oficial declara una unica entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__open-sci-re-77ccae92__sdpa-open-sci-steps`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 1,8 GB de pesos; a 4 bits, alrededor de 0,9 GB (no hay GGUF oficial publicado, requeriria conversion propia).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para inferencia, solo para reentrenamiento.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el repo usa `custom_code`); vLLM y TGI requeririan verificar compatibilidad con la implementacion custom; llama.cpp/Ollama solo tras conversion manual a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este) | 1,7B | 4096 (segun identificador) | other | Hugging Face, safetensors | Checkpoint de referencia SFT, sin benchmarks |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | Hugging Face, GGUF, vLLM | Modelo de proposito general con evaluacion publica |
| Llama 3.2-1B | 1,2B | 131.072 | Llama 3.2 Community License | Hugging Face, GGUF, vLLM | Modelo de proposito general con evaluacion publica |
| SmolLM2-1.7B | 1,7B | 8192 | Apache 2.0 | Hugging Face, GGUF | Modelo pequeño con benchmarks publicados |

La comparacion es orientativa por tamaño; este checkpoint no declara metricas que permitan una comparacion de rendimiento directa con las alternativas.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta usos previstos, composicion del dataset ni limitaciones; falta informacion critica para produccion.
- No se han publicado resultados de benchmarks; no hay evidencia cuantitativa de su calidad.
- Licencia "other" sin terminos especificados: el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- Riesgo de alucinacion inherente a un modelo de 1,7B entrenado sobre datos sinteticos de razonamiento; no hay evaluacion de fidelidad.
- El dataset de entrenamiento es sintetico (generado por gpt-oss-120b), lo que puede propagar sesgos y errores del modelo generador.
- Idiomas soportados no declarados; el rendimiento fuera del ingles es incierto.
- Contexto limitado a 4096 tokens segun el identificador, insuficiente para tareas de documento largo.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del repositorio; auditar antes de desplegar.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue eficiente exige conversion propia.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-sr30k
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
