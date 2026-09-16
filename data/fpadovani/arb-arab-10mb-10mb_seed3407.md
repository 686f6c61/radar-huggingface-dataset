# fpadovani/arb-arab-10mb-10mb_seed3407

## Resumen

`fpadovani/arb-arab-10mb-10mb_seed3407` es un ajuste fino (SFT) del modelo base `goldfish-models/arb_arab_10mb`, un transformer de arquitectura GPT-2 con 39.087.104 parámetros entrenado originalmente sobre un corpus de 10 MB. El ajuste lo ha realizado el usuario fpadovani (Universidad de Groninga, segun la ruta del experimento en Weights & Biases) mediante la libreria TRL, y el repositorio se publica en formato safetensors listo para `transformers` y compatible con text-generation-inference.

Se trata de un modelo de investigacion de escala muy reducida (aproximadamente 39 millones de parametros, equivalente a un tercio de GPT-2 small), orientado a experimentos de ajuste supervisado y a la comparacion de tokenizadores y recetas de entrenamiento en el marco del proyecto Goldfish, que trabaja con lenguas de bajos recursos. El identificador sugiere arabe estandar (`arb` en ISO 639-3) con escritura arabe (`Arab`), aunque la model card no declara formalmente los idiomas soportados.

Su relevancia es acotada: no es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo. Su interes es metodologico, como punto de partida reproducible para estudiar el efecto del SFT sobre un checkpoint pequeno, comparar variantes con distintas semillas y validar pipelines de TRL. El repositorio no registra descargas ni "likes" en el momento de la consulta y la licencia aparece como placeholder sin definir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun los tags del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible oficialmente; al ser safetensors en FP32/FP16 es convertible a GGUF con cuantizaciones de 8 y 4 bits mediante llama.cpp u Ollama |
| Idiomas soportados | no disponible (el identificador apunta a arabe estandar en escritura arabe, sin confirmacion en la model card) |
| Licencia | no disponible (la model card contiene el placeholder `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | goldfish-models/arb_arab_10mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Tamano del repositorio | 0,9 GB |
| Version de transformers | 4.56.2 |
| Version de PyTorch | 2.11.0 |
| Version de tokenizers | 0.22.1 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-30 (segun el repositorio: 2026-09-16T15:34:30Z) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa, normalizacion previa a los bloques y embeddings de tokens y posiciones. El tag `gpt2` del repositorio es la unica fuente explicita sobre la arquitectura; no se detallan en la informacion proporcionada el numero de capas, la dimension oculta ni el numero de cabezas de atencion, aunque por el recuento de 39.087.104 parametros se trata de una configuracion muy compacta. El contexto maximo tampoco se declara.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el checkpoint `goldfish-models/arb_arab_10mb`, que a su vez se entreno con un corpus de 10 MB. El autor ejecuto el ajuste con TRL 0.23.0 (etiquetas `sft` y `generated_from_trainer`), y los unicos datos de composicion disponibles son la traza publica del experimento en Weights & Biases. No se especifica el numero de tokens de entrenamiento, la composicion del dataset de SFT, ni si hubo etapas posteriores de RLHF o DPO.

La innovacion tecnica destacable es el propio marco experimental: el proyecto Goldfish explora el entrenamiento de modelos pequenos por lengua y escritura, y esta variante concreta (sufijo `10mb_seed3407` frente a variantes `100mb`, `1000mb` y `arb_arab`) forma parte de una rejilla de experimentos con distintas semillas y tamanos de corpus, replicada en el espacio de trabajo `new_tokenizers` de W&B.

## Capacidades

- Generacion de texto autoregresiva en el dominio cubierto por el corpus de ajuste, con el ejemplo de uso conversacional que aparece en la model card (pipeline de `text-generation` con lista de mensajes y `max_new_tokens=128`).
- Ajuste al formato de instrucciones simple (`role: user` / `content`), derivado del SFT aplicado; no se documenta un formato de chat completo con roles de sistema y asistente.
- Capacidad multilingue: no disponible; el identificador apunta a arabe, pero no hay evaluacion publicada.
- Razonamiento, matematicas y generacion de codigo: no documentados y muy improbables a esta escala.
- Tool calling o function calling: no soportado ni documentado.
- Uso en agentes o razonamiento multi-paso: no soportado ni documentado.
- Vision, audio o modo "thinking": no soportados.
- Compatibilidad con text-generation-inference y endpoints compatibles (etiqueta `endpoints_compatible`).

## Casos de uso

- Prototipado de pipelines de generacion de texto: dado su tamano (39 M de parametros), permite validar codigo de inferencia, tokenizacion y formateo de prompts en segundos antes de escalar a modelos mayores.
- Investigacion sobre lenguas de bajos recursos: sirve como punto de comparacion reproducible dentro del proyecto Goldfish para medir el efecto del tamano de corpus y de la semilla en el ajuste de un idioma concreto.
- Ablaciones de SFT: al haberse entrenado con TRL 0.23.0 y con los hiperparametros registrados en W&B, es util para comparar recetas de ajuste supervisado manteniendo fijo el checkpoint base.
- Experimentos sobre tokenizadores: el espacio de trabajo de W&B asociado (`new_tokenizers`) indica que el modelo forma parte de una linea de trabajo centrada en comparar vocabularios y segmentaciones para arabe.
- Punto de partida para ajustes posteriores: su licencia no definida obliga a verificar condiciones antes de uso comercial, pero como base de investigacion se puede reentrenar con un corpus mayor en una sola GPU consumer.
- Docencia y practicas de ML: permite recorrer el ciclo completo de ajuste, publicacion en HuggingFace y despliegue con un coste de computo minimo, incluso en CPU.
- Despliegue en entornos con recursos muy limitados: con cuantizacion a 8 o 4 bits ocupa decenas de megabytes, lo que lo hace viable en dispositivos edge o en contenedores con memoria restringida para tareas de generacion de texto corto.
- Generacion de texto de relleno en pruebas de integracion: util para verificar latencia, throughput y manejo de errores en servicios de inferencia sin consumir presupuesto de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,16 GB en FP32 (156 MB de pesos), 0,08 GB en FP16/BF16 y 0,02-0,04 GB en cuantizacion de 4-8 bits, sin contar la memoria del contexto ni el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni modelos de datacenter. Una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutarlo.
- Compatibilidad con GPU consumer: si, cabe sobradamente en cualquier GPU consumer de los ultimos diez anos, y tambien en CPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (el repositorio esta etiquetado como `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama. No se documenta soporte especifico para vLLM o TGI mas alla de la compatibilidad generica declarada.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/arb-arab-10mb-10mb_seed3407 | 39,09 M | no disponible | SFT sobre goldfish-models/arb_arab_10mb | no disponible | HuggingFace, 0 descargas |
| goldfish-models/arb_arab_10mb (base) | no disponible (mismo orden de magnitud) | no disponible | Preentrenamiento con 10 MB de corpus | no disponible | HuggingFace |
| GPT-2 small (referencia de escala) | 124 M | 1.024 tokens | Preentrenamiento web en ingles | MIT | HuggingFace (openai-community/gpt2) |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de estos modelos entre si. La comparacion se limita a parametros, contexto declarado y licencia. Otras variantes del proyecto Goldfish (`arb_arab_100mb`, `arb_arab_1000mb`) existen como checkpoints hermanos, pero no se dispone de sus especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un corpus de 10 MB es demasiado pequeno para representar de forma equilibrada la variacion dialectal, de registro y de dominio del arabe.
- Riesgo de alucinacion: alto en terminos relativos; a esta escala el modelo carece de conocimiento factual fiable y tiende a producir texto fluido pero sin fundamento verificable.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y los idiomas soportados no estan confirmados, por lo que cualquier uso multilingue requiere validacion empirica previa.
- Restricciones de licencia: la model card contiene el valor `licence: license`, un placeholder sin contenido juridico. No se puede asumir permiso de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia de evaluacion: no hay benchmarks, no hay ficha de evaluacion de sesgos y no hay resultados de seguridad publicados.
- Adecuacion a produccion: no es un modelo apto para tareas de cara al usuario que exijan precision factual, razonamiento, codigo o tool calling; su uso razonable es experimental y educativo.
- Trazabilidad: el repositorio no tiene descargas ni interacciones registradas, lo que reduce las senales externas de validacion por parte de la comunidad.
- Fechas del repositorio: las marcas temporales indican 2026, posteriores a la mayoria de versiones de las librerias citadas; conviene verificar la coherencia del entorno de ejecucion al reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/arb-arab-10mb-10mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/arb_arab_10mb
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/rgbeglwo
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de TRL (referencia de SFT): https://huggingface.co/docs/trl
- Cita de TRL: von Werra et al., "TRL: Transformer Reinforcement Learning", GitHub, 2020.
