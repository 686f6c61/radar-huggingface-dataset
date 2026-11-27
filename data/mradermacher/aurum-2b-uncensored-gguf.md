# mradermacher/Aurum-2B-Uncensored-GGUF

## Resumen

Aurum-2B-Uncensored-GGUF es la distribucion en formato GGUF del modelo Aurum-2B-Uncensored, un modelo de lenguaje de aproximadamente 1.940 millones de parametros derivado de la familia Qwen (etiquetado como qwen3.5 en los metadatos) y sometido a un proceso de "abliteration" para eliminar los mecanismos de rechazo y censura del modelo original. El autor de los pesos base es 2Beyes, mientras que esta version cuantizada la mantiene mradermacher, un publicador habitual de cuantizaciones GGUF para la comunidad de inferencia local.

El modelo se presenta como multimodal (incluye proyector mmproj para vision) y con soporte declarado de tool calling, lo que lo situa en la categoria de modelos pequenos orientados a despliegue en hardware modesto, agentes ligeros y experimentacion con modelos sin restricciones de contenido. Su licencia Apache 2.0 facilita el uso comercial, aunque el proceso de abliteration y la naturaleza "uncensored" introducen consideraciones de seguridad relevantes.

La relevancia actual del modelo reside en su tamano reducido (inferencia viable en GPU de consumo e incluso CPU) combinado con capacidades declaradas de vision y function calling, una combinacion poco frecuente en la franja de 2B parametros. No obstante, la informacion publicada es escasa: no hay datos de benchmarks, composicion del dataset de entrenamiento ni detalles del proceso de abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, etiquetada qwen3.5); detalles no disponibles |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para vision |
| Idiomas soportados | ingles (segun model card); no se detallan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 19,7 GB con todas las variantes); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna mas alla de la etiqueta qwen3.5 y la indicacion de que es un modelo multimodal con proyector mmproj. Por el numero de parametros (~1,94B) y la familia de origen, se trata de un transformer decoder-only de escala pequena, presumiblemente con un cabezal de vision acoplado mediante un proyector multimodal. No se especifica el numero de capas, dimensiones ocultas, atencion (GQA/MHA) ni la longitud de contexto nativa.

Respecto al entrenamiento, la informacion disponible es minima: se sabe que el modelo base es 2Beyes/Aurum-2B-Uncensored y que ha sido sometido a abliteration (eliminacion de direcciones de activacion asociadas al rechazo). No se publican datos sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni detalles del proceso de abliteration. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, output_tensor_quantised, quantize_version 2), e incluye variantes con imatrix en el repo hermano Aurum-2B-Uncensored-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles.
- Capacidades multimodales declaradas (vision) mediante el proyector mmproj incluido en el repo.
- Soporte de tool calling / function calling segun los tags del modelo.
- Comportamiento "uncensored"/abliterated: menor tendencia a rechazar peticiones por politicas de contenido.
- Razonamiento basico y generacion de codigo propio de un modelo de ~2B parametros (sin datos de benchmarks que lo cuantifiquen).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con APIs de inferencia tipo OpenAI.
- Multilingue: no disponible; la model card solo declara ingles.

## Casos de uso

- Inferencia local en portatiles y equipos sin GPU dedicada: con cuantizaciones Q4_K_M (1,4 GB) o Q2_K (1,1 GB) el modelo cabe en RAM de sistemas modestos y permite prototipado rapido con llama.cpp u Ollama.
- Agentes ligeros con tool calling: su soporte declarado de function calling permite construir asistentes que invoquen APIs externas en entornos con recursos limitados, aceptando la menor fiabilidad de un modelo de 2B.
- Procesamiento de imagenes en el borde (edge): el proyector mmproj permite tareas de descripcion de imagenes o extraccion de informacion visual en dispositivos con poca VRAM, por ejemplo en prototipos de vision por computador embebida.
- Generacion de contenido creativo sin filtros: el proceso de abliteration lo hace adecuado para experimentacion con escritura creativa, role-play o generacion de texto donde los rechazos del modelo base resultan obstructivos, siempre con supervision humana.
- Investigacion sobre alineacion y seguridad: util como modelo de referencia pequeno para estudiar el efecto de la abliteration en las respuestas, comparando comportamiento frente al modelo base no modificado.
- Fine-tuning y experimentacion academica: al ser Apache 2.0 y de tamano reducido, sirve como base para ajuste fino en tareas de dominio especifico con presupuesto de computo limitado.
- Clasificacion y extraccion de informacion en pipelines por lotes: con Q8_0 (2,2 GB) se obtiene la mejor calidad del repo para tareas de etiquetado o resumen de documentos en ingles a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~1,1 GB; Q4_K_M ~1,4 GB; Q6_K ~1,7 GB; Q8_0 ~2,2 GB; f16 ~4,0 GB. Anadir el proyector mmproj (0,5-0,8 GB) si se usa vision.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4-8 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090 con enorme margen). Tambien es viable en CPU pura gracias a los quants bajos.
- GPU profesionales: A100/H100 no son necesarias; el modelo esta pensado para inferencia local. En esas GPU el cuello de botella seria la latencia, no la memoria.
- Despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag endpoints_compatible sugiere soporte en plataformas de inferencia con API OpenAI. vLLM y TGI requeririan los pesos en safetensors del repo base, no los GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, en una RTX 4090 se espera throughput alto (decenas o cientos de tokens por segundo), pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| Aurum-2B-Uncensored (este) | ~1,94B | no disponible | si (mmproj) | si (declarado) | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (segun familia Qwen2.5) | no | limitado | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | ~1,2B | 128K | no | si | Llama 3.2 Community | safetensors, GGUF |
| SmolVLM-2B | ~2B | no disponible | si | no | Apache 2.0 | safetensors, GGUF |

La comparacion es orientativa: no hay benchmarks publicados del modelo Aurum que permitan contrastar calidad frente a estas alternativas. Su ventaja diferencial es la combinacion de vision, tool calling y ausencia de censura en un solo paquete de ~2B con licencia permisiva; su desventaja es la falta de documentacion tecnica y de evaluaciones reproducibles.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de los mecanismos de rechazo implica mayor probabilidad de generar contenido danino, ofensivo o inexacto sin advertencia. No recomendado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: con ~2B parametros, la fiabilidad factica es limitada; no debe usarse como fuente de verdad sin verificacion.
- Documentacion tecnica escasa: sin datos de contexto nativo, dataset de entrenamiento ni benchmarks, la evaluacion previa a produccion es imprescindible.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el proceso de abliteration puede afectar a la calidad general del modelo frente al base.
- Capacidades multimodales y de tool calling declaradas pero no verificadas con evaluaciones publicadas; conviene validarlas empiricamente antes de integrarlas en pipelines criticos.
- El repo GGUF pesa 19,7 GB por acumular todas las variantes; descargar solo el fichero necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aurum-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/2Beyes/Aurum-2B-Uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Aurum-2B-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Aurum-2B-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
