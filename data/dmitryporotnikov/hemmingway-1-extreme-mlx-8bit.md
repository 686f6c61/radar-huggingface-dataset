# DmitryPorotnikov/Hemmingway-1-Extreme-MLX-8bit

## Resumen

Hemmingway-1-Extreme-MLX-8bit es una conversion a formato MLX en cuantizacion de 8 bits del modelo JohnDi/Hemmingway-1-Abliterated-Extreme-GGUF, que a su vez deriva de Altworld/Hemmingway-1, un modelo denso de aproximadamente 27 000 millones de parametros construido sobre una arquitectura compatible con Qwen3.8 / Qwen3.5. El encargado de la conversion y publicacion en el Hub es el usuario DmitryPorotnikov. El objetivo del repositorio es ofrecer ese checkpoint en un formato optimizado para inferencia local en Apple Silicon mediante MLX-LM, sin volver a entrenar ni ajustar los pesos.

El modelo original esta orientado a escritura creativa, dialogo, roleplay y conversacion general, y la variante «Extreme» es una version «abliterated» producida con la herramienta Heretic, es decir, con la direccion de rechazo eliminada del espacio de activaciones. La conversion parte del fichero GGUF Q8_0, lo deserializa a tensores densos FP16 y los recuantiza como MLX affine de 8 bits con grupo de cuantizacion de 64, conservando `A_log` en FP32.

Es relevante ahora porque permite ejecutar un modelo de gama ~27B en equipos Apple Silicon con memoria unificada abundante sin depender de CUDA ni de backends propietarios, aunque la propia model card advierte de que la conversion no es sin perdidas y de que no se ha publicado ninguna evaluacion independiente de este checkpoint requantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compatible con Qwen3.8 / Qwen3.5 (transformer denso, segun la model card) |
| Parametros totales | 26 895 998 464 (aproximadamente 27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, grupo de 64; origen GGUF Q8_0; `A_log` en FP32 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX); disponibles tambien GGUF en el repositorio base |

## Arquitectura y entrenamiento

La model card describe la familia como «Qwen3.8 / Qwen3.5-compatible architecture», con un tamano aproximado de 27B parametros y una arquitectura de origen GGUF identificada como `qwen35`. Se trata de un transformer denso, no de un modelo de mezcla de expertos, ya que no se declaran parametros activos. El pipeline de conversion exporta los tensores uno a uno usando los mapeos de tensores Qwen de Transformers y despues aplica la cuantizacion affine de MLX-LM, escribiendo safetensors portables. La presencia de un tensor `A_log` retenido en FP32 sugiere componentes asociados a capas de tipo state space, aunque la model card no detalla la arquitectura interna mas alla de la etiqueta de compatibilidad Qwen.

No se introduce entrenamiento ni ajuste adicional en esta publicacion: la intervencion se limita al cambio de formato y a la recuantizacion. La ruta tecnica es GGUF Q8_0, paso intermedio a tensores densos FP16 y salida como MLX affine 8-bit. La propia ficha advierte de que la conversion no es sin perdidas, porque los esquemas de cuantizacion de GGUF Q8_0 y MLX affine 8-bit son distintos, la requantizacion anade aproximacion adicional y el paso por FP16 puede introducir redondeo. Los tensores opcionales de prediccion multi-token (MTP) se omiten en esta exportacion, por lo que no se ofrece decodificacion especulativa basada en MTP. La modificacion «abliterated» se realizo aguas arriba con la herramienta Heretic y no forma parte de esta conversion.

## Capacidades

- Generacion de texto orientada a escritura creativa, narrativa y ficcion (escenas, dialogos, descripciones).
- Conversacion multi-turno y dialogo general.
- Roleplay y adopcion de personajes, con plantilla de chat del tokenizer (ChatML).
- Redaccion y composicion en ingles, idioma principal declarado.
- Capacidad de escritura creativa reforzada por el ajuste aguas arriba; la ficha advierte que la habilidad creativa no garantiza un tool calling fiable.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado; la model card advierte explicitamente de que la capacidad creativa no implica buen rendimiento como agente autonomo.
- Capacidades multimodales (vision, audio): no disponibles.
- No se incluye modo «thinking» explicito ni decodificacion especulativa MTP.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar escenas de ficcion, dialogos y narrativa con un control de muestreo recomendado (temperatura 0.80-1.0, top-p 0.95, top-k 20, min-p 0.05), adecuado para autores que necesitan borradores largos en ingles.
- Roleplay y compania conversacional: el formato de chat con plantilla del tokenizer permite mantener conversaciones con un personaje consistente a lo largo de varios turnos.
- Generacion de dialogos para guiones o videojuegos: util para producir lineas de personaje con tono controlado mediante un system prompt especifico.
- Asistente de escritura en local: al ejecutarse sobre MLX en Apple Silicon, permite procesar material sensible sin enviarlo a servicios externos.
- Prototipado de narrativa interactiva: integrable en una aplicacion de ficcion interactiva donde la respuesta debe generarse en el propio equipo del usuario.
- Reescritura y adaptacion de estilo en ingles: a partir de un texto de entrada puede reformular pasajes manteniendo la voz narrativa, apoyandose en la ventana de contexto del modelo base.
- Exploracion de modelos «abliterated»: util para investigacion sobre eliminacion de direcciones de rechazo y su efecto en la generacion, comparando con el GGUF original.
- Conversacion general en ingles: chatbot de proposito general en un Mac con memoria suficiente, aunque sin garantias de tool calling ni de fiabilidad en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion indica explicitamente que no se incluye ninguna evaluacion independiente de este checkpoint MLX y que las cifras de benchmarks y tasas de rechazo del modelo aguas arriba no deben tratarse como resultados medidos de esta release requantizada. Tampoco se declara ningun benchmark de throughput o latencia para este checkpoint concreto.

## Requisitos de hardware

- Inferencia en Apple Silicon: la model card recomienda un Mac con memoria unificada suficiente para los pesos cuantizados, la cache de contexto, los buffers de ejecucion y otras aplicaciones; un sistema de 64 GB se considera objetivo razonable para este modelo de 27B en 8 bits con contextos moderados.
- VRAM estimada: los pesos en 8 bits ocupan aproximadamente 27 GB; hay que sumar cache KV y buffers, por lo que contextos largos exigen bastante mas memoria. En FP16 los pesos rondarian los 54 GB (referencia del modelo base).
- GPU recomendadas: no se declaran requisitos para GPU NVIDIA o AMD en la informacion disponible; el runtime objetivo es MLX-LM sobre Apple Silicon.
- Compatibilidad con GPU de consumo: en equipos Apple Silicon con 64 GB o mas de memoria unificada es viable; en GPUs consumer con 24 GB (por ejemplo RTX 4090) los pesos de 8 bits no caben completos sin descarga a CPU o cuantizaciones menores, dato no confirmado por el autor.
- Opciones de despliegue: MLX-LM (version recomendada `mlx-lm==0.32.0`) para este checkpoint; vLLM, llama.cpp, Ollama o TGI no estan indicados para este formato MLX concreto, aunque el repositorio base ofrece variantes GGUF.
- Latencia y throughput estimados: no disponibles; la ficha indica que dependen del chip, la longitud de contexto, la version del runtime y la carga de trabajo, y que no se reporta ningun benchmark de este checkpoint exportado.
- Nota: el tamano de descarga (28,6 GB de repositorio) no equivale a la memoria total de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hemmingway-1-Extreme-MLX-8bit (este) | ~27B densos | no disponible | safetensors (MLX affine 8-bit) | no disponible | HuggingFace, runtime MLX-LM |
| JohnDi/Hemmingway-1-Abliterated-Extreme-GGUF (origen) | ~27B densos | no disponible | GGUF Q8_0 | no disponible | HuggingFace |
| Altworld/Hemmingway-1 (original aguas arriba) | ~27B densos | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de terceros de la misma categoria; la informacion proporcionada solo permite comparar la cadena de derivacion del propio modelo (original, GGUF Extreme y conversion MLX).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un derivado de un modelo «abliterated» orientado a ficcion, puede producir contenido que otros checkpoints rechazarian.
- Riesgo de alucinacion: la model card advierte de que el modelo puede generar informacion inexacta, prosa inconsistente o contenido no deseado.
- Contexto e idioma: solo se declara soporte de ingles (`en`); la longitud de contexto no esta especificada.
- Tool calling y agentes: la ficha indica que la capacidad de escritura creativa no demuestra un tool calling fiable ni un buen rendimiento como agente autonomo.
- Licencia: no disponible, lo que impide confirmar si se permite el uso comercial; debe verificarse en los repositorios de origen antes de cualquier despliegue en produccion.
- Perdida de precision: la conversion de GGUF Q8_0 a MLX affine 8-bit no es sin perdidas; la requantizacion anade aproximacion y el paso intermedio por FP16 puede introducir redondeo.
- Sin evaluacion propia: las comprobaciones del codigo de conversion se hicieron sobre un pequeno fixture Qwen cuantizado, lo que no garantiza la calidad del modelo completo ni su equivalencia con el GGUF de origen.
- Sin decodificacion especulativa: los tensores MTP opcionales estan omitidos, por lo que no hay aceleracion por prediccion multi-token.
- Reproducibilidad: si en `conversion_info.json` aparece una revision como `main`, esta es una referencia movil y no un identificador inmutable del origen.
- Advertencia de uso: antes de evaluar la conversion conviene comparar prompts representativos con el GGUF original.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/DmitryPorotnikov/Hemmingway-1-Extreme-MLX-8bit
- Modelo base (GGUF): https://huggingface.co/JohnDi/Hemmingway-1-Abliterated-Extreme-GGUF
- Modelo original aguas arriba: https://huggingface.co/Altworld/Hemmingway-1
- Runtime de conversion MLX-LM: https://github.com/ml-explore/mlx-lm
