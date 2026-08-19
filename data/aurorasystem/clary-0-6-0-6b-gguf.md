# AuroraSystem/Clary-0.6-0.6B-GGUF

## Resumen

Aurora Clary 0.6 es un modelo multimodal ligero (image-text-to-text) desarrollado por AuroraSystem, construido sobre el modelo base Qwen/Qwen3-0.6B mediante adaptadores LoRA y un proyector de visión basado en CLIP. Se distribuye exclusivamente en formato GGUF para el ecosistema llama.cpp, lo que permite ejecutarlo en hardware de muy bajos recursos, incluida CPU.

El modelo resuelve el problema de disponer de un asistente multimodal compacto que combine generación de texto, instrucciones, código, matemáticas y descripción de imágenes en ruso e inglés, sin necesidad de GPU de gama alta. Su relevancia radica en que, con aproximadamente 596 millones de parámetros y cuantizaciones que van desde 397 MB (Q4_K_M) hasta 1,2 GB (F16), puede desplegarse en dispositivos edge, portátiles antiguos o entornos con restricciones de memoria.

La versión publicada incluye cinco archivos GGUF (cuatro cuantizaciones del modelo de lenguaje y un proyector de visión independiente de 177 MB). El modelo hereda la arquitectura y el contexto del base Qwen3-0.6B, e incorpora el modo `/think` característico de la familia Qwen3. Es un lanzamiento reciente (agosto de 2026) con cero descargas y cero likes, por lo que su validación comunitaria es todavía nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) + LoRA + proyector de vision CLIP |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible; hereda del modelo base Qwen3-0.6B |
| Tipos de cuantizacion | Q4_K_M (397 MB), Q5_K_M (444 MB), Q8_0 (639 MB), F16 (1,2 GB) + mmproj F16 (177 MB) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3 con aproximadamente 0,6 mil millones de parametros. Sobre esta base se aplicaron adaptadores LoRA para el ajuste fino, lo que permite adaptar el comportamiento del modelo sin modificar los pesos completos. Para la parte multimodal, se anade un encoder CLIP junto con un proyector (mmproj) que alinea las representaciones visuales con el espacio de embeddings del texto.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El modelo conserva el modo `/think` del base Qwen3, que activa un proceso de razonamiento interno antes de generar la respuesta final. La distribucion en GGUF implica que el modelo fue convertido desde su formato original (probablemente safetensors) para su uso en llama.cpp, LM Studio, KoboldCpp y Ollama (este ultimo solo para texto).

## Capacidades

- Generacion de texto en ruso e ingles: responde a instrucciones, mantiene conversaciones y produce texto coherente en ambos idiomas.
- Generacion de codigo: capaz de escribir funciones y scripts sencillos, como el ejemplo de factorial en Python incluido en la documentacion.
- Matematicas basicas: resuelve operaciones aritmeticas simples (ejemplo documentado: 17 × 6 = 102).
- Resumen de textos: capacidad de sintetizar contenido, segun la model card del autor.
- Descripcion de imagenes: mediante el proyector de vision mmproj, puede describir el contenido de imagenes, aunque con limitaciones en OCR.
- Modo `/think`: activa un modo de razonamiento previo a la respuesta, heredado de Qwen3.
- Ejecucion en ecosistema llama.cpp: compatible con llama.cpp CLI, LM Studio y KoboldCpp para texto y vision; Ollama solo para texto.

## Casos de uso

- Asistente conversacional en ruso para entornos sin GPU: gracias a su tamano reducido (397 MB en Q4_K_M), puede ejecutarse en portatiles antiguos o mini-PCs para ofrecer un chatbot local en ruso sin dependencia de servicios en la nube.
- Descripcion de imagenes en dispositivos edge: el proyector de vision permite analizar fotografias y generar descripciones en ruso o ingles en hardware de bajos recursos, util para aplicaciones de accesibilidad o catalogacion automatica.
- Generacion de codigo en entornos de desarrollo ligeros: un asistente de codigo Python que funciona localmente en maquinas sin GPU, integrable en editores via llama.cpp server o LM Studio.
- Resumen de documentos en ruso: procesamiento de textos largos para extraer resumenes concisos en entornos donde no es viable ejecutar modelos de mayor tamano.
- Educacion y tutorizacion basica: asistente para practicar matematicas simples o explicar conceptos de programacion en ruso e ingles, desplegable en Raspberry Pi o similares.
- Prototipado rapido de pipelines multimodales: al ser un modelo pequeno y con licencia Apache-2.0, permite validar arquitecturas de vision-lenguaje en desarrollo antes de escalar a modelos mayores.
- Procesamiento de imagenes con texto embebido (limitado): aunque el OCR es debil, puede utilizarse para tareas donde la precision de lectura no sea critica, como clasificacion gruesa de imagenes por contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo Q4_K_M ocupa 397 MB y el proyector de vision 177 MB, por lo que el conjunto completo requiere aproximadamente 574 MB de memoria. La version F16 necesita alrededor de 1,4 GB en total.
- GPU recomendadas: cualquier GPU con 1 GB o mas de VRAM (por ejemplo, GTX 1050, GTX 1650, RTX 3050) es suficiente. Tambien funciona en CPU con 4 GB de RAM o mas.
- Compatibilidad con consumer GPU: si, el modelo cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPUs modernas con memoria compartida.
- Opciones de despliegue: llama.cpp (CLI y servidor), LM Studio (texto y vision con deteccion automatica del mmproj), KoboldCpp (texto y vision) y Ollama (solo texto mediante Modelfile).
- Latencia y throughput estimados: no disponibles en la documentacion. Dado el tamano del modelo, en CPU moderna se esperan decenas de tokens por segundo en cuantizacion Q4_K_M, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Aurora Clary 0.6 | 596M | No disponible (hereda de Qwen3) | Si (vision) | ru, en | Apache-2.0 | GGUF |
| Qwen3-0.6B (base) | 600M | 32K (segun especificaciones de Qwen3) | No | Multilingue | Apache-2.0 | Safetensors, GGUF |
| SmolLM2-1.7B | 1.700M | 8K | No | Multilingue | Apache-2.0 | Safetensors, GGUF |

La comparativa se limita a especificaciones, ya que no se dispone de datos de benchmarks. Aurora Clary 0.6 se diferencia de su base Qwen3-0.6B por anadir vision multimodal y un ajuste LoRA orientado a ruso e ingles. Frente a SmolLM2-1.7B, ofrece multimodalidad y un tamano menor, a costa de capacidad de razonamiento general.

## Limitaciones y advertencias

- OCR debil: el reconocimiento optico de caracteres en imagenes es poco fiable, segun la propia model card del autor.
- Vision restringida al ecosistema llama.cpp: el proyector de vision solo funciona con llama.cpp, LM Studio y KoboldCpp; Ollama no soporta la parte multimodal.
- Tamano reducido: con solo 0,6B de parametros, la capacidad de razonamiento complejo, codigo avanzado y comprension de contexto largo es limitada en comparacion con modelos mayores.
- Idiomas limitados: solo ruso e ingles; no hay soporte declarado para espanol ni otros idiomas.
- Sin benchmarks publicados: no existe evidencia objetiva de rendimiento mas alla de los ejemplos incluidos en la model card.
- Validacion comunitaria nula: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que implica ausencia de retroalimentacion de usuarios y posibles errores no detectados.
- Fecha de publicacion futura: el modelo fue creado en agosto de 2026, lo que sugiere que es un lanzamiento muy reciente o que la fecha es incorrecta en los metadatos.
- Contexto no especificado: aunque hereda del base Qwen3-0.6B, la documentacion no confirma la longitud de contexto efectiva tras el ajuste LoRA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AuroraSystem/Clary-0.6-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
