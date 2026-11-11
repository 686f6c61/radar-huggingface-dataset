# nace-ai/Qwen3.5-9B-MLX-q5-KQuant

## Resumen

Qwen3.5-9B-MLX-q5-KQuant es una cuantizacion de 5 bits del modelo Qwen/Qwen3.5-9B, publicada por nace-ai mediante su framework KQuant v0.2 para el ecosistema MLX de Apple. El pack contiene 9.409.813.744 parametros totales (incluida la torre de vision) y reduce los pesos del modelo de lenguaje a 6,21 GB con una media de 5,551 bits por peso, manteniendo la torre de vision del modelo base fijada por hash (333 tensores, 912.020.960 bytes). El repositorio completo ocupa 7,1 GB repartidos en tres ficheros safetensors.

El modelo hereda la pipeline image-text-to-text del base, por lo que admite entradas de imagen y texto, ademas de conversacion y tool calling. La relevancia de esta publicacion es practica: ofrece una version ejecutable en hardware Apple Silicon con MLX que conserva el tokenizador y la plantilla de chat del original byte a byte, lo que simplifica la sustitucion directa en pipelines ya montados sobre el modelo bf16.

La licencia es Apache 2.0, la misma del modelo base, y el autor documenta una evaluacion de calidad en terminos de divergencia KL frente al modelo bf16, junto con pruebas de tool calling. No se han publicado datos de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; transformer multimodal image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits MLX con KQuant v0.2 (media de 5,551 bits por peso) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pack MLX; 3 ficheros, 7.124.746.696 bytes) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentacion proporcionada. El pack es una cuantizacion, no un modelo entrenado desde cero: conserva la estructura del base, incluida su torre de vision (333 tensores, 912.020.960 bytes, fijada por hash) y sus ficheros de tokenizador y plantilla de chat sin modificaciones.

La innovacion tecnica del pack es el metodo de cuantizacion KQuant v0.2, que segun el autor ajusta cada grupo de pesos contra el comportamiento del modelo en texto real, y no solo contra los valores numericos de los pesos. El resultado son pesos del modelo de lenguaje de 6,21 GB a 5,551 bits por peso de media. La evaluacion se realizo comparando las distribuciones de siguiente token frente al modelo bf16 sobre texto original y sobre texto de chat y tool calls. No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, ni si hubo RLHF o DPO).

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat incluida en el pack.
- Entrada de imagen y texto (pipeline image-text-to-text), heredada de la torre de vision del modelo base.
- Tool calling y function calling: el autor reporta 20 de 20 ensayos con thinking desactivado que colocaron la llamada y completaron el ciclo de ida y vuelta.
- Razonamiento multi-step y uso como base para agentes, segun la evaluacion de tool calls del autor.
- Soporte multilingue limitado al ingles segun la etiqueta de idioma del repositorio.
- Ejecucion nativa en MLX sobre Apple Silicon (mlx 0.32.4, mlx-lm 0.32.2).

## Casos de uso

- Asistentes conversacionales locales en Mac: el pack esta pensado para MLX y se ejecuta con mlx-lm sobre Apple Silicon, lo que permite desplegar un asistente de 9B parametros en un portatil o Mac Studio sin GPU dedicada.
- Automatizacion de tool calling en flujos de agente: los ensayos del autor muestran que el modelo cuantizado coloca llamadas a funciones y completa el ciclo de ida y vuelta, lo que lo hace apto para orquestar APIs y scripts en local.
- Procesamiento de documentos con imagen: al conservar la torre de vision del base, puede recibir capturas, formularios escaneados o diagramas junto a instrucciones de texto para extraer informacion estructurada.
- Prototipado rapido de aplicaciones multimodales: al mantener el tokenizador y la plantilla de chat byte a byte, se puede sustituir el modelo bf16 por este pack en un pipeline existente sin cambiar el codigo de preprocesado.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye results.json con las metricas KL y los ensayos de herramientas, util para comparar KQuant con otros packs MLX del mismo modelo base.
- Inferencia en entornos con memoria unificada limitada: los 6,21 GB de pesos del modelo de lenguaje permiten cargar el modelo en equipos donde una version bf16 de 9B no cabria con holgura.
- Desarrollo offline y con privacidad de datos: al ejecutarse en local con MLX, las conversaciones y las imagenes no salen del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de la cuantizacion frente al modelo bf16:

| Prueba | KQuant (este repo) | Tokens evaluados |
|---|---:|---:|
| KL frente al modelo bf16, texto original (menor es mejor) | 0,0097 | 32.704 |
| KL frente al modelo bf16, texto de chat y tool calls (menor es mejor) | 0,0474 | 65.472 |
| Ensayos de tool calling con thinking desactivado | 20 de 20 completados | no disponible |

## Requisitos de hardware

- Pesos del modelo de lenguaje: 6,21 GB (6.212.567.552 bytes); repositorio completo de 7,1 GB.
- Memoria unificada recomendada: al menos 16 GB en equipos Apple Silicon para cargar el modelo con margen para el contexto y la torre de vision; 8 GB es insuficiente en la practica.
- Hardware de referencia del autor: la cuantizacion se genero y evaluo en una GPU NVIDIA H200 de 151 GB, aunque el destino de ejecucion del pack es MLX sobre Apple Silicon.
- GPU dedicadas: no es el objetivo del pack; para CUDA conviene usar el modelo base o una cuantizacion GGUF equivalente.
- Opciones de despliegue: mlx-lm (comando mlx_lm.generate), con mlx 0.32.4 y mlx-lm 0.32.2 como versiones de referencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-q5-KQuant | 9.409.813.744 | no disponible | safetensors MLX 5 bits | apache-2.0 | KL 0,0097 en texto original frente al bf16 |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | safetensors bf16 | apache-2.0 | Referencia de calidad; mayor huella de memoria |
| Otros packs MLX de Qwen3.5-9B | no disponible | no disponible | safetensors MLX | segun autor | El autor los representa como puntos grises en su grafico KL frente a tamano, medidos con el mismo protocolo de tokens |

No se dispone de datos suficientes para comparar con alternativas de otros tamanos o familias en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto al modelo bf16: KL de 0,0097 en texto original y de 0,0474 en texto de chat y tool calls, este ultimo casi cinco veces mayor, lo que sugiere mayor degradacion en conversacion y llamadas a herramientas.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la documentacion proporcionada.
- La longitud de contexto no esta indicada; conviene consultar la model card del base Qwen/Qwen3.5-9B antes de usarlo en tareas de contexto largo.
- El pack esta orientado a MLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que limita su uso en infraestructura CUDA.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen/Qwen3.5-9B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las metricas de calidad proceden de una unica ejecucion del autor; no hay validacion independiente.
- El grafico KL frente a tamano compara packs medidos en ejecuciones separadas con el mismo protocolo de tokens, no en una ejecucion compartida, segun advierte el propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q5-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de la evaluacion del autor: results.json (junto a la model card en el repositorio)
- Datos del grafico KL frente a tamano: assets/kl-vs-size-data.json (en el repositorio)
- Grafico KL frente a tamano: assets/kl-vs-size.svg (en el repositorio)
