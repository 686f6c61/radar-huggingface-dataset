# nativ-community/Hemmingway-1-MLX-4bit

## Resumen

Hemmingway-1-MLX-4bit es una conversión al formato MLX en cuantización de 4 bits del modelo Altworld/Hemmingway-1, publicada por el usuario nativ-community. Se trata de un modelo de generación de texto orientado a chat y escritura creativa, con 26.895.998.464 parámetros (~26,9B) y licencia Apache 2.0. La conversión se realizó con mlx-vlm en su versión 0.7.2, lo que permite ejecutarlo de forma local en equipos Apple Silicon mediante la librería MLX.

El interés principal de esta ficha es práctico: el repositorio original no ofrece apenas detalle técnico, y esta variante cuantizada es la vía más directa para ejecutar un modelo de ~27B en memoria unificada de Apple sin recurrir a CUDA. Los tags del repositorio apuntan a la familia Qwen3 (qwen3_5_text, qwen3.8) y a casos de uso de escritura creativa y construcción de mundos (altworld), pero no hay información publicada sobre datos de entrenamiento, longitud de contexto ni resultados de benchmarks.

El modelo está etiquetado exclusivamente para inglés y no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que su validación por parte de la comunidad es nula. Cualquier evaluación de calidad debe hacerse por prueba directa, no por datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags qwen3_5_text y qwen3.8 sugieren un transformer de la familia Qwen3; sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (formato MLX); no se documentan otras variantes en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX, cuantizado a 4 bits |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card del repositorio se limita a indicar que se trata de una conversion desde Altworld/Hemmingway-1 realizada con mlx-vlm 0.7.2 y a remitir a la model card original para mas detalles.

Los unicos indicios arquitectonicos son los tags del repositorio: qwen3_5_text y qwen3.8, que apuntan a una base de la familia Qwen3, y la etiqueta altworld, que sugiere un ajuste orientado a escritura creativa o narrativa. La unica innovacion tecnica documentada es la propia cuantizacion a 4 bits en formato MLX, que reduce el peso del modelo para hacer viable su ejecucion en memoria unificada de Apple Silicon.

## Capacidades

- Generacion de texto conversacional y chat multi-turno (pipeline_tag: text-generation, tag chat).
- Escritura creativa y narrativa, segun los tags creative-writing y altworld.
- Generacion de texto en ingles exclusivamente.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.
- Capacidades de vision: la model card incluye un ejemplo de uso con mlx-vlm que pasa una imagen y el prompt "Describe this image", lo que sugiere soporte multimodal en la conversion. Sin embargo, los tags del repositorio solo declaran qwen3_5_text y text-generation, por lo que esta capacidad no esta confirmada y debe verificarse por prueba directa.

## Casos de uso

- Asistente de escritura creativa local: el modelo esta ajustado para narrativa y chat, y su ejecucion via MLX permite redactar relatos y dialogos en un Mac sin enviar texto a servicios externos.
- Construccion de mundos y roleplay (altworld): el tag altworld y la orientacion a creative-writing lo hacen adecuado para mantener personajes y escenarios coherentes a lo largo de una conversacion.
- Generacion por lotes de contenido editorial: al ser un modelo de ~27B cuantizado a 4 bits, puede generar borradores de articulos, sinopsis o descripciones de producto en local antes de pasar por edicion humana.
- Prototipado de productos de chat: sirve como backend de un prototipo conversacional en Mac durante el desarrollo, sin coste de API ni dependencia de proveedores cloud.
- Redaccion asistida con privacidad: para equipos que trabajan con material confidencial (manuscritos, guiones, documentacion interna), la inferencia local elimina la exposicion de datos a terceros.
- Ajuste fino posterior como base estilizada: al derivar de un modelo de ~27B con licencia Apache 2.0, puede servir como punto de partida para LoRA o adaptadores de estilo, siempre que se disponga de hardware Apple Silicon con memoria suficiente.
- Generacion de variaciones de texto controladas por temperatura: util para explorar multiples versiones de un mismo parrafo en tareas de copywriting o guionizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un repositorio en formato MLX, la ejecucion nativa requiere Apple Silicon (serie M). No es directamente desplegable en GPU NVIDIA o AMD sin convertir los pesos a otro formato.
- Peso aproximado de los pesos en 4 bits: unos 13,5 GB para 26,9B parametros (el repositorio ocupa 15,2 GB, incluyendo configuracion y tokenizer).
- Memoria unificada recomendada: 32 GB como minimo comodo para inferencia con contexto corto; 64 GB o mas para contextos largos y lotes mayores. Con 16 GB el margen es muy ajustado y probablemente insuficiente.
- Equipos adecuados: Mac Studio o MacBook Pro con M2 Max, M3 Max, M4 Max, M2 Ultra, M3 Ultra o M4 Max con 32-128 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este repositorio en su formato actual; requeririan reconversion de pesos.
- Opciones de despliegue: mlx-vlm (el ejemplo de la model card usa `python -m mlx_vlm.generate`), y mlx-lm si se convierte a un formato solo texto. vLLM, TGI, llama.cpp u Ollama no son compatibles con estos pesos tal cual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para Hemmingway-1, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los datos de los modelos alternativos provienen de sus fichas publicas.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Rendimiento publicado |
|---|---|---|---|---|---|
| Hemmingway-1-MLX-4bit | ~26,9B | no disponible | Apache 2.0 | safetensors MLX 4-bit | no disponible |
| Qwen2.5-32B-Instruct | ~32,8B | 131.072 tokens | Apache 2.0 | safetensors, GGUF, AWQ | benchmarks publicados por el autor |
| Mistral-Small-24B-Instruct-2501 | ~24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | benchmarks publicados por el autor |
| Gemma-2-27B-it | ~27B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | benchmarks publicados por el autor |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (language: en). No hay evidencia de capacidades en castellano ni en otros idiomas.
- Sesgos: no hay informacion publicada sobre la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza, religion o ideologia. Un modelo ajustado para narrativa creativa tiende a producir contenido estereotipado si no se filtra.
- Alucinacion: sin datos de evaluacion ni de fases de alineamiento, el riesgo de invencion de hechos es desconocido y presumiblemente alto en tareas de conocimiento factual.
- Perdida por cuantizacion: la conversion a 4 bits degrada la calidad respecto al modelo original en tareas sensibles a la precision, como razonamiento matematico o generacion de codigo.
- Contexto: se desconoce la ventana de contexto efectiva, lo que impide planificar despliegues que dependan de conversaciones largas o documentos extensos.
- Ambiguedad multimodal: la model card usa mlx-vlm y un ejemplo con imagen, pero los tags declaran solo texto. No debe asumirse soporte de vision en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Altworld/Hemmingway-1 y de la base Qwen subyacente, ya que las condiciones pueden diferir.
- Madurez: 0 descargas y 0 likes en el momento de la consulta. No hay validacion de la comunidad, ni informes de terceros, ni issues resueltos.
- Fecha de publicacion registrada: 22 de septiembre de 2026. Conviene comprobar la vigencia y posibles actualizaciones del repositorio.
- La busqueda web realizada no devolvio informacion relevante sobre el modelo ni sobre su autor: los resultados corresponden a empresas y marcas no relacionadas con el proyecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nativ-community/Hemmingway-1-MLX-4bit
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Libreria de conversion mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper, blog o demo del modelo: no disponible
