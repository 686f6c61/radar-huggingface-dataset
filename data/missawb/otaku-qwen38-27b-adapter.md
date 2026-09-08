# MissawB/otaku-qwen38-27b-adapter

## Resumen

El adaptador `MissawB/otaku-qwen38-27b-adapter` es un ajuste fino de bajo rango (LoRA) sobre el modelo base `Qwen3.8-27B`, desarrollado por MissawB. Está diseñado para responder en francés sobre cultura anime y manga, con un estilo de respuesta breve y completa. El adaptador se entrena mediante QLoRA en 4-bit, lo que permite ajustar un modelo de 27.000 millones de parámetros con un coste computacional reducido. El repositorio contiene dos formatos del mismo adaptador: un archivo `safetensors` para su uso con la librería PEFT y un archivo `GGUF` para su integración como adaptador en Ollama.

El modelo base `Qwen3.8-27B` es un modelo denso vision-language de 27.000 millones de parámetros, con control flexible de razonamiento y capacidad para tareas multi-paso. El adaptador solo modifica la torre de lenguaje, dejando intacta la torre visual. Los parámetros entrenables del adaptador ascienden a 79.691.776, lo que supone un incremento mínimo sobre el modelo base. El entrenamiento se realizó en una GPU L40S durante 35,4 horas, con una pérdida de validación final de 0,5610 y una exactitud de token del 87,3%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PEFT LoRA (QLoRA) sobre Qwen3.8-27B (Transformer denso vision-language) |
| Parametros totales | 79.691.776 (adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (durante el entrenamiento) |
| Tipos de cuantizacion | Adaptador: safetensors (bf16/fp16) y GGUF; modelo base: bnb-4bit |
| Idiomas soportados | frances (adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y GGUF (`otaku-adapter.gguf`) |

## Arquitectura y entrenamiento

El adaptador utiliza QLoRA con cuantizacion NF4, rango `r=16`, `lora_alpha=32` y `lora_dropout=0.05`. Se aplica sobre los siete modulos `q/k/v/o/gate/up/down_proj` de la torre de lenguaje, sin tocar la torre visual. El entrenamiento se realizo con `learning_rate=1e-4`, scheduler cosine con warmup del 10%, `max_grad_norm=0.3`, lote efectivo de 32, `max_length=4096` y precision `bf16`. El dataset no se especifica, pero el dominio es la cultura anime/manga en frances. No se menciona el uso de RLHF ni DPO.

Un detalle tecnico relevante: el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` declara `bnb_4bit_compute_dtype: float16`, mientras que `Qwen/Qwen3.8-27B` es nativamente `bfloat16`. Entrenar en `bf16=True` sin corregir este campo provoca que las multiplicaciones de matrices cuantizadas se ejecuten en fp16 sin `GradScaler`, lo que puede causar divergencia y valores NaN. El autor indica que un intento anterior fallo en el paso 230 por esta razon.

## Capacidades

- Generacion de texto en frances sobre anime y manga.
- Respuestas cortas y completas, en lugar de listas largas que se cortan por el presupuesto de tokens.
- Hereda las capacidades vision-language del modelo base `Qwen3.8-27B`, aunque el entrenamiento no modifica la torre visual.
- No se anade soporte adicional de tool calling ni de agentes; el adaptador no altera estas capacidades del modelo base.
- El modelo base dispone de control flexible de razonamiento (thinking mode), que el adaptador no modifica.
- Capacidad multilingue limitada al frances, ya que el adaptador se entrena exclusivamente en ese idioma.

## Casos de uso

- Chatbots de comunidades de anime en frances: el adaptador puede gestionar conversaciones informales sobre series, personajes y noticias del sector, gracias a su estilo de respuesta breve y directa.
- Generacion de descripciones de personajes para wikis o blogs: permite producir resumenes concisos y coherentes sobre personajes de anime y manga, adaptados al publico francófono.
- Asistente para reseñas de anime y manga: ayuda a redactar criticas con una estructura clara y terminologia otaku adecuada, reduciendo la necesidad de edicion manual.
- Traduccion y adaptacion de terminologia otaku al frances: el modelo puede interpretar terminos japoneses y expresarlos de forma natural en frances, manteniendo el contexto cultural.
- Moderacion de contenido en foros de anime: el adaptador puede clasificar mensajes y detectar temas relevantes dentro del dominio, aunque no se ha entrenado especificamente para moderacion.
- Creacion de contenido para redes sociales: genera publicaciones cortas, titulares y descripciones de episodios o capitulos, con un tono adecuado para plataformas como Twitter o Instagram.
- Soporte en juegos de rol con tematica anime: el modelo puede interpretar personajes y generar dialogos coherentes en frances, mejorando la inmersión en partidas de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye metricas de entrenamiento (pérdida de validacion y exactitud de token) y una prueba de barrera con tres sondas, pero no son benchmarks comparativos estandar. Los valores de entrenamiento son: `eval_loss` final de 0,5610 y exactitud de token del 87,3%. La prueba de barrera verifico que el adaptador es servible, no mas corrupto que el modelo base y realmente aplicado, pero no demuestra superioridad en conocimiento factual.

## Requisitos de hardware

- El adaptador ocupa 0,5 GB y tiene 79,7 millones de parametros, por lo que su carga es ligera.
- La inferencia requiere el modelo base `Qwen3.8-27B` en cuantizacion 4-bit (bnb-4bit) o en una cuantizacion GGUF equivalente.
- El entrenamiento se realizo en una GPU L40S (48 GB de VRAM), pero no se dispone de datos oficiales sobre los requisitos de VRAM para inferencia.
- Opciones de despliegue: Ollama mediante un Modelfile con el adaptador GGUF, o PEFT en Python cargando el adaptador sobre el modelo base cuantizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables en la misma categoria. El modelo base `Qwen3.8-27B` sin adaptar es la referencia natural, pero el adaptador no mejora necesariamente el conocimiento factual; la model card indica que en una prueba sobre el heroe de Chainsaw Man, el adaptador lista personajes en lugar de nombrar al heroe, mientras que el modelo base responde con mayor precision. No se han encontrado otros adaptadores LoRA para Qwen3.8-27B en frances/anime en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado; el dominio anime/manga puede contener estereotipos culturales y de genero.
- Riesgo de alucinacion: la model card documenta un caso donde el adaptador responde de forma imprecisa a una pregunta factual, listando personajes en lugar de nombrar al heroe.
- Limitaciones de contexto: el entrenamiento se realizo con `max_length=4096`, por lo que se recomienda usar `num_ctx 4096` en Ollama para evitar cortes.
- Limitaciones de idioma: el adaptador esta entrenado exclusivamente en frances; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: no disponible.
- Advertencia tecnica: el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` declara `bnb_4bit_compute_dtype: float16`, lo que puede provocar divergencia y NaN si se entrena en `bf16=True` sin corregir este campo. Es un punto critico para quien quiera replicar la receta.
- El adaptador no anade conocimiento factual nuevo; se centra en la forma de las respuestas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/MissawB/otaku-qwen38-27b-adapter
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Busqueda de adaptadores para Qwen3.8-27B: https://huggingface.co/models?other=base_model%3Aadapter%3AQwen%2FQwen3.8-27B
