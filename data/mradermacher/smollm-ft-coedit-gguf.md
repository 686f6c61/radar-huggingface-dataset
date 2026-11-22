# mradermacher/SmolLM-FT-CoEdIT-GGUF

## Resumen

SmolLM-FT-CoEdIT-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo sarthakrw/SmolLM-FT-CoEdIT, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo subyacente parte de la familia SmolLM, un transformer decoder-only de pequeno tamano (134,5 millones de parametros segun los pesos en safetensors), afinado a partir de un checkpoint SmolLM y orientado a tareas de generacion de texto en ingles.

El modelo base ha sido ajustado finamente (fine-tuning) sobre el dataset CoEdIT, un corpus de instrucciones para edicion de texto (reformulacion, correccion gramatical, simplificacion, cambio de tono, etc.). Esto convierte al modelo en una herramienta especializada en tareas de edicion y transformacion de texto mas que en un asistente generalista. Su tamano reducido permite ejecutarlo en hardware muy modesto, incluso en CPU, lo que lo hace atractivo para prototipado rapido y despliegues embebidos.

La relevancia de esta publicacion es practica: mradermacher ofrece hasta doce variantes de cuantizacion (desde Q2_K hasta f16) del modelo afinado, lo que facilita su integracion en llama.cpp, Ollama y otros runners compatibles con GGUF sin necesidad de convertir pesos manualmente. No obstante, la informacion publica sobre el modelo base es escasa y no se dispone de datos sobre licencia, benchmarks ni composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM) |
| Parametros totales | 134.515.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base sarthakrw/SmolLM-FT-CoEdIT es un transformer decoder-only de la familia SmolLM, con 134,5 millones de parametros. Se trata de un fine-tuning del checkpoint SmolLM original sobre el dataset CoEdIT, orientado a instrucciones de edicion de texto. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas especificas mas alla de las propias de SmolLM.

Esta publicacion concreta (mradermacher/SmolLM-FT-CoEdIT-GGUF) no entrena el modelo, sino que realiza la conversion a formato GGUF y genera cuantizaciones estaticas con llama.cpp. Segun la model card, las cuantizaciones ponderadas con imatrix no estan disponibles en el momento de la publicacion; solo se ofrecen cuantizaciones estaticas. El proceso de conversion se realizo con convert_type hf y quantize_version 2, segun los metadatos internos del README.

## Capacidades

- Generacion de texto en ingles, con enfasis en tareas de edicion: reformulacion, correccion gramatical, simplificacion, cambio de tono y estilo.
- Instrucciones de edicion de texto derivadas del dataset CoEdIT, lo que le permite seguir comandos del tipo "reescribe esta frase de forma mas formal".
- Ejecucion local en CPU y GPU de gama baja gracias a su tamano reducido y a las cuantizaciones disponibles.
- Compatibilidad con llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) al distribuirse en GGUF.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Correccion ortografica y gramatical embebida: el modelo puede integrarse en editores de texto o correctores locales para sugerir frases corregidas en ingles, ejecutandose en CPU sin dependencias de red.
- Reformulacion de textos en pipelines de documentacion: util para reescribir parrafos con un tono concreto (formal, informal, conciso) en herramientas de generacion de contenido.
- Prototipado rapido de aplicaciones NLP: al caber en cuantizaciones de 0,2 GB, sirve para validar flujos de inferencia con llama.cpp antes de escalar a modelos mayores.
- Filtrado y normalizacion de datos en preprocesamiento: puede usarse para reescribir o simplificar entradas de texto en tareas de limpieza de corpus en ingles.
- Educacion y ensenanza de ingles: aplicaciones que muestran al estudiante una version corregida o simplificada de su redaccion, con latencia muy baja.
- Despliegue en dispositivos con recursos limitados: Raspberry Pi, moviles o entornos edge donde no es viable un modelo de miles de millones de parametros, usando las cuantizaciones Q4_K_M o Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para cuantizaciones Q2_K a Q8_0 (segun los tamanos listados en la model card) y 0,4 GB para f16.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre es suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en hardware integrado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runner compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM-FT-CoEdIT-GGUF (este) | 134,5 M | no disponible | no disponible | GGUF | Fine-tuning especializado en edicion de texto (CoEdIT) |
| SmolLM-135M (base) | 135 M | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo base generalista de HuggingFaceTB |
| TinyLlama-1.1B | 1,1 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Mayor capacidad general, mas recursos |
| Qwen2.5-0.5B | 0,5 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Alternativa multilingue de mayor tamano |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, formato y orientacion funcional.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base sarthakrw/SmolLM-FT-CoEdIT antes de usarlo en produccion.
- El modelo solo soporta ingles segun los metadatos; no es adecuado para tareas en castellano u otros idiomas.
- Al ser un fine-tuning especializado en CoEdIT, su comportamiento fuera de tareas de edicion de texto puede degradarse respecto al SmolLM base.
- Riesgo de alucinacion y de generar ediciones incorrectas o no solicitadas; conviene validar las salidas en flujos automatizados.
- No se documentan sesgos especificos, pero al derivar de SmolLM hereda los sesgos del corpus de entrenamiento original, no auditados en esta ficha.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con entradas largas.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; la model card recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q8_0 como mejor calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/SmolLM-FT-CoEdIT-GGUF
- Modelo base: https://huggingface.co/sarthakrw/SmolLM-FT-CoEdIT
- Pagina de descargas del autor: https://hf.tst.eu/model#SmolLM-FT-CoEdIT-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
