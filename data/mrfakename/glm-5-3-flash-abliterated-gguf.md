# mrfakename/GLM-5.3-Flash-abliterated-GGUF

## Resumen

GLM-5.3-Flash-abliterated-GGUF es una distribucion en formato GGUF del modelo GLM-5.3-Flash de zai-org, al que se le ha eliminado el comportamiento de rechazo mediante ablacion direccional (abliteration). Lo publica el usuario mrfakename, que parte de los cuantizados oficiales de unsloth y aplica la edicion en sitio sobre los tensores del flujo residual. El resultado es un modelo multimodal (image-text-to-text) que responde a peticiones que el modelo original rechazaria, manteniendo el resto de pesos byte a byte identicos.

El modelo hereda la arquitectura del GLM-5.3-Flash original, que segun la model card incluye 45 capas principales, tres capas densas y expertos enrutados (routed experts), ademas de una capa MTP/nextn y un proyector de vision. El repositorio declara 1.900.544 parametros en safetensors, un dato que resulta inconsistente con el tamano del repo (651,7 GB) y con los cuantizados disponibles (desde 101 GiB en Q2_K_XL hasta 318 GiB en Q8_0); se reproduce tal cual aparece en la informacion proporcionada.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de ablacion con subspace de rango 2 y busqueda multiobjetivo por capa; por otro, advierte de que el modelo resultante cumple peticiones daninas y traslada toda la responsabilidad al usuario. La licencia es MIT, lo que permite uso comercial, pero con implicaciones eticas y legales que se detallan en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE), tres capas densas y capa MTP/nextn; proyector de vision |
| Parametros totales | 1.900.544 (dato declarado en safetensors; inconsistente con el tamano del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, UD-Q4_K_XL, UD-Q2_K_XL (GGUF divididos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura transformer con mezcla de expertos: 45 capas principales, de las cuales tres son densas, mas expertos enrutados y una capa MTP (multi-token prediction) o nextn. Incorpora un proyector de vision que lo habilita para la tarea image-text-to-text. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta version es el procedimiento de abliteration. En lugar de eliminar una unica direccion de rechazo, se midieron direcciones de rechazo por separado para prompts de chat y de modo think en cada capa, sobre el GGUF Q8_0. Con todas ellas se construyo un subespacio de rechazo de rango 2 a partir de los dos vectores singulares principales. Ese subespacio se proyecto fuera de las escrituras al flujo residual en 45 capas principales: `self_attn.o_proj`, `mlp.shared_experts.down_proj` y `mlp.down_proj` en las tres capas densas, lo que suma 90 tensores editados. La intensidad de la edicion por capa se obtuvo mediante una busqueda multiobjetivo que minimiza los rechazos manteniendo baja la KL del primer token en prompts inocuos. Los expertos enrutados, embeddings, proyector de vision y capa MTP/nextn permanecen byte a byte identicos a los cuantizados originales. Solo los tensores editados se desquantizaron, editaron y requantizaron a su tipo original.

## Capacidades

- Generacion de texto y razonamiento en modo chat y modo think (razonamiento explicito).
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector de vision.
- Respuesta a peticiones que el modelo original rechazaria: la tasa de rechazo baja de 99/100 a 3/100 en chat y de 98/100 a 2/100 en modo think.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad de parcheo alternativo: la edicion se distribuye tambien como LoRA (`abliteration-lora.gguf`) aplicable a otros cuantizados del modelo original.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo sirve como contraste controlado frente al original para estudiar como varian las tasas de rechazo y la calidad en prompts inocuos (KL de 0,038 en el primer token) tras una ablacion de subespacio de rango 2.
- Red teaming y evaluacion de salvaguardas: permite generar respuestas que un modelo alineado bloquearia, util para construir conjuntos de prueba de filtros de contenido y clasificadores de seguridad.
- Analisis de robustez de cuantizacion: los cuantizados UD-Q2_K_XL (101 GiB) permiten verificar que la edicion sobrevive a baja precision, ya que los tensores editados se mantienen en Q5_K o superior y la perdida de edicion es como maximo del 2 %.
- Despliegue local con llama.cpp: los GGUF divididos se cargan apuntando al fichero `-00001-of-`, lo que facilita servir el modelo con `llama-server` en entornos con almacenamiento amplio pero sin infraestructura de entrenamiento.
- Experimentos multimodales sin censura: el proyector de vision intacto permite estudiar el comportamiento image-text-to-text cuando se elimina el rechazo en el decodificador de texto.
- Aplicacion de la edicion a otros pesos: el LoRA de abliteracion y el fichero `abliteration-edit.npz` (base del subespacio y fuerzas por capa) permiten reproducir el procedimiento sobre otros cuantizados del GLM-5.3-Flash original sin reentrenar.
- Comparativas de calidad chat/think: al conservar ambos modos con direcciones de rechazo medidas por separado, sirve para evaluar diferencias de comportamiento entre razonamiento explicito y respuesta directa.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de la propia ablacion, medidas sobre el GGUF Q8_0 en decodificacion greedy con 100 prompts daninos reservados (held-out). Las respuestas de chat se limitaron a 384 tokens y el modo think a 768 tokens; cuando el razonamiento no habia terminado, se juzgo el propio texto de razonamiento.

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 3 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 98 | 2 |
| KL del primer token en prompts inocuos | 0 | 0,038 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La cifra de KL incluye un pequeno ruido de base por inferencia en lotes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el tamano en disco de los cuantizados da una cota inferior. Q8_0 ocupa 318 GiB en 8 ficheros, UD-Q4_K_XL 186 GiB en 6 ficheros y UD-Q2_K_XL 101 GiB en 4 ficheros. La VRAM necesaria para inferencia sera del orden del tamano del cuantizado mas overhead de contexto y cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen de pesos, un unico acelerador consumer no es suficiente para ninguno de los cuantizados publicados.
- Cabe en GPU consumer: no, ninguno de los cuantizados disponibles (minimo 101 GiB) cabe en una GPU consumer actual.
- Opciones de despliegue: llama.cpp en su version mainline, parcheado y probado en el commit `2cbfc3c`. Se usa `llama-server -m UD-Q4_K_XL/GLM-5.3-Flash-UD-Q4_K_XL-00001-of-....gguf` y se puede aplicar la edicion como LoRA con `--lora abliteration-lora.gguf`. Otras opciones (vLLM, TGI, Ollama) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mrfakename/GLM-5.3-Flash-abliterated-GGUF | 1.900.544 (declarado) | no disponible | GGUF | MIT | Abliterado con subespacio de rango 2; rechazos 3/100 en chat |
| mrfakename/GLM-5.3-Flash-abliterated | no disponible | no disponible | safetensors | MIT | Modelo base de esta distribucion, sin cuantizar |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | Modelo original alineado; rechazos 99/100 en chat |
| unsloth/GLM-5.3-Flash-GGUF | no disponible | no disponible | GGUF | no disponible | Cuantizados originales sobre los que se aplica la edicion en sitio |

En la busqueda web aparece una comparativa en Reddit entre DeepSeek V4.1 Flash 1017, una version abliterated de mrfakename y pqhaz, sin datos numericos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo cumple peticiones daninas de forma deliberada. La model card lo advierte explicitamente: "This model will comply with harmful requests. You are responsible for how you use it."
- La eliminacion del rechazo puede degradar la utilidad en tareas benignas: la KL del primer token en prompts inocuos es de 0,038, lo que indica una desviacion pequena pero no nula respecto al original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la ablacion no toca los pesos de conocimiento, pero la alteracion del flujo residual puede afectar a la coherencia en modos chat y think.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponible en la informacion proporcionada.
- Licencia MIT: permite uso comercial y modificacion, pero no exime del cumplimiento de normativa aplicable sobre contenido danino, desinformacion o material ilegal en la jurisdiccion de despliegue.
- Requisitos de almacenamiento muy elevados: el repo completo ocupa 651,7 GB y el cuantizado mas pequeno 101 GiB, lo que limita el despliegue a infraestructura con almacenamiento y memoria considerables.
- Dependencia de una version concreta de llama.cpp (commit `2cbfc3c`); otras versiones pueden no cargar los GGUF divididos o el LoRA de ablacion.
- El dato de parametros totales (1.900.544) es inconsistente con el tamano del repo y los cuantizados; conviene tratarlo con cautela hasta verificacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizados originales de unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Discord del autor: https://discord.com/invite/foss
- Hilo comparativo en Reddit: https://www.reddit.com/r/LocalLLM/comments/1xyv35e/deepseek_v41_flash_1017_vs_mrfakename_abliterated/
