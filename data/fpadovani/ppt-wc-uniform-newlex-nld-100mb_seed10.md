# fpadovani/ppt-wc-uniform-newlex-nld-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-wc-uniform-newlex-nld-100mb_seed10` es un ajuste fino (fine-tune) del modelo `goldfish-models/eng_latn_100mb`, un transformer causal de tipo GPT-2 entrenado por el autor con la libreria TRL mediante aprendizaje supervisado (SFT) sobre un dataset de formato conversacional. Cuenta con 86.508.288 parametros (86,5 M) y se publica en formato safetensors bajo la libreria transformers, con pipeline declarado de generacion de texto. El repositorio ocupa 1,4 GB.

Se trata de un artefacto de investigacion mas que de un modelo de produccion: el nombre del checkpoint sugiere un experimento sobre mezclas de datos o estrategias de prompting ("ppt-wc-uniform-newlex") con semilla 10, y el run de entrenamiento esta documentado en Weights & Biases. El propio autor no ha publicado model card extendida, benchmarks, licencia ni lista de idiomas, por lo que la informacion verificable es limitada.

Su relevancia actual es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de SFT con TRL sobre un modelo base multilingue pequeno (la familia Goldfish entrena modelos de 100 MB de texto por idioma), y como baseline de bajo coste computacional para experimentos de ajuste conversacional, destilacion o generacion de datos sinteticos. No compite con modelos de gran tamano ni esta pensado para ello.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (modelo causal de generacion de texto), segun los tags del repositorio |
| Parametros totales | 86.508.288 (86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se han publicado cuantizaciones oficiales; los pesos safetensors son convertibles a GGUF (llama.cpp/Ollama) o a 8/4 bits |
| Idiomas soportados | No disponible en los metadatos. El modelo base es `goldfish-models/eng_latn_100mb`, entrenado con 100 MB de texto en ingles; el nombre del fine-tune incluye la etiqueta "nld" (neerlandes), sin confirmacion documental |
| Licencia | No disponible (la model card incluye el marcador generico `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only con atencion causal, en la linea de GPT-2, segun los tags del repositorio (`gpt2`, `text-generation`). El modelo base, `goldfish-models/eng_latn_100mb`, pertenece a la familia Goldfish de modelos monolingues de 100 MB de corpus por idioma; el fine-tune conserva esa arquitectura y solo modifica los pesos mediante SFT. No hay informacion publicada sobre numero de capas, dimension oculta, cabezas de atencion ni longitud de contexto, aunque el recuento de 86,5 M de parametros indica una configuracion mas pequena que GPT-2 small (124 M).

El entrenamiento se realizo con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card indica explicitamente "This model was trained with SFT" y enlaza un run de Weights & Biases del grupo `f-padovani-university-of-groningen` (proyecto `white_cotterell`). No se documentan el volumen de tokens de entrenamiento, la composicion del dataset conversacional, ni si hubo etapas posteriores de DPO, RLHF o filtrado. El ejemplo oficial de uso emplea el formato de mensajes con roles (`{"role": "user", "content": ...}`), lo que confirma que el ajuste se hizo sobre datos con plantilla de chat.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma del modelo base), orientada a respuestas conversacionales de un unico turno o de pocos turnos.
- Seguimiento de una plantilla de chat con roles de usuario y asistente, tal como se muestra en el ejemplo de `pipeline("text-generation", ...)`.
- Generacion condicionada por prompt con control de `max_new_tokens` y `return_full_text`.
- Integracion con el ecosistema transformers: `pipeline`, `AutoModelForCausalLM` y servidores compatibles con text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`).
- Razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y uso agentico: no disponibles / no documentados.
- Capacidades multilingues: no documentadas; el modelo base es monolingue en ingles (`eng_latn`).
- Capacidad especial de "thinking mode": no disponible.

## Casos de uso

- Reproduccion de experimentos de SFT: el checkpoint permite replicar el pipeline de TRL 0.23.0 usado por el autor y comparar variantes de mezcla de datos frente al modelo base, dado que ambos comparten arquitectura y numero de parametros.
- Baseline de bajo coste en investigacion academica: util como referencia inferior de rendimiento en estudios sobre ajuste conversacional, destilacion o curricula de datos, ya que su huella de memoria (menos de 200 MB en fp16) permite ejecutar cientos de configuraciones en una sola GPU.
- Generacion de datos sinteticos para filtrado: al ser un modelo de 86,5 M, se puede usar para producir grandes volumenes de candidatos de texto que despues se filtran o puntuan con un modelo mayor, reduciendo el coste por token generado.
- Demostraciones docentes y prototipos de interfaz conversacional: cabe en cualquier portatil y permite ensenar el ciclo completo prompt, plantilla de chat, decodificacion y evaluacion sin depender de APIs externas.
- Pruebas de integracion de infraestructura: su compatibilidad declarada con text-generation-inference y endpoints permite validar pipelines de despliegue (contenedores, balanceo, metricas) antes de moverlos a modelos grandes.
- Experimentos de cuantizacion y conversion de formatos: al ser pequeno, es un banco de pruebas barato para validar conversiones safetensors a GGUF, comparaciones fp32/fp16/int8/int4 y su impacto en la perplejidad.
- Generacion de texto corto en entornos con recursos muy limitados (CPU, Raspberry Pi, dispositivos moviles) donde no es viable ejecutar modelos de miles de millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y los resultados de busqueda web recuperados no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV ni activaciones): aproximadamente 346 MB en fp32, 173 MB en fp16/bf16, 87 MB en int8 y 43 MB en int4.
- Cabe en cualquier GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4090, e incluso en GPUs integradas y en CPU sin acelerador dedicado.
- GPU de datacenter (A100, H100) innecesarias para uso individual; solo tendrian sentido para maximizar throughput con lotes muy grandes.
- Opciones de despliegue: `transformers` (pipeline y AutoModelForCausalLM), text-generation-inference y endpoints compatibles (declarados en los tags), vLLM, llama.cpp y Ollama previa conversion a GGUF, y exportacion a ONNX.
- Latencia y throughput: no se han publicado mediciones. Como estimacion orientativa no verificada, un modelo de 86,5 M de parametros en fp16 sobre una GPU de consumo moderna suele generar del orden de varios cientos de tokens por segundo, pero este dato no procede de ninguna prueba publicada del modelo.
- Almacenamiento: 1,4 GB de repositorio, previsiblemente por copias en fp32 y otros artefactos del trainer; los pesos en fp16 ocupan una fraccion de ese espacio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-uniform-newlex-nld-100mb_seed10` | 86,5 M | No disponible | 100 MB (heredados del modelo base) + SFT no documentado | No disponible | Hugging Face, 0 descargas, 0 likes |
| `goldfish-models/eng_latn_100mb` (modelo base) | Misma arquitectura GPT-2; recuento exacto no disponible | No disponible | 100 MB de texto en ingles | No disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | WebText (~40 GB) | MIT modificada | Pesos publicos en Hugging Face |
| TinyLlama-1.1B (variante Chat) | 1,1 B | 2048 tokens | 3 billones de tokens (aproximado, segun su documentacion) | Apache 2.0 | Hugging Face |

La comparacion es desigual por diseno: el modelo analizado es dos ordenes de magnitud menor que TinyLlama y no declara licencia, mientras que las alternativas si tienen terminos de uso claros. No se dispone de datos de rendimiento del modelo analizado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada de calidad de generacion, razonamiento o fidelidad factual.
- Licencia no especificada: la model card contiene el marcador `licence: license`, sin texto legal. Esto impide determinar si el uso comercial esta permitido; en la practica, tratarlo como no apto para produccion hasta que el autor aclare los terminos.
- Riesgo elevado de alucinacion y de incoherencia: con 86,5 M de parametros y un corpus base de 100 MB, la capacidad de retener conocimiento factual es muy limitada y la generacion larga tiende a degradarse.
- Base monolingue en ingles: el modelo base es `eng_latn`; no hay soporte multilingue documentado, pese a la etiqueta "nld" del nombre.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de contexto extendido.
- Datos de SFT no documentados: se desconoce la composicion del dataset, si hubo filtrado, y por tanto que sesgos puede haber absorbido, incluyendo sesgos de la fuente de datos conversacionales empleada.
- Ambiguedad de proposito: el nombre del checkpoint (`ppt-wc-uniform-newlex`, `seed10`) y la ausencia de documentacion sugieren un artefacto intermedio de un experimento de investigacion, no un modelo depurado para uso externo.
- Metadatos incompletos: 0 descargas y 0 likes, sin idiomas declarados, sin model card descriptiva; no hay senales de mantenimiento o soporte.
- Riesgo de sobreajuste al formato de chat concreto empleado en el entrenamiento; respuestas fuera de esa plantilla pueden degradarse notablemente.
- Para cualquier uso en produccion se recomienda evaluar alternativas con licencia explicita y benchmarks publicados, aunque impliquen mayor coste de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-nld-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/og18t77s
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de TRL (cita del framework): https://github.com/huggingface/trl
- No se han encontrado papers, blogs o demos adicionales asociados al modelo en los resultados de busqueda disponibles.
