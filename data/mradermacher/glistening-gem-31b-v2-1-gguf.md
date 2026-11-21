# mradermacher/Glistening-Gem-31B-v2.1-GGUF

## Resumen

Glistening-Gem-31B-v2.1-GGUF es una distribucion de cuantizaciones GGUF del modelo Glistening-Gem-31B-v2.1, publicado originalmente por sophosympatheia y empaquetado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 30.700 millones de parametros (30,7 B) obtenido mediante tecnicas de merge de modelos (mergekit), orientado a generacion conversacional en ingles. El repositorio incluye un conjunto completo de cuantizaciones estaticas, desde Q2_K (12 GB) hasta Q8_0 (32,7 GB), ademas de dos ficheros mmproj (proyeccion multimodal) en Q8_0 y f16, lo que sugiere que el modelo base incorpora alguna capacidad de vision aunque la model card no la documente explicitamente.

El modelo es relevante para quienes necesitan ejecutar un LLM de escala media-grande en hardware de consumo o en servidores con GPUs de gama alta, gracias a las cuantizaciones GGUF que reducen el peso a partir de los 12 GB. Al estar etiquetado como `not-for-all-audiences`, conviene revisar el contenido antes de desplegarlo en entornos publicos o comerciales sensibles. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque el autor original no proporciona detalles sobre los datos de entrenamiento ni sobre los benchmarks.

La ficha se basa exclusivamente en la informacion disponible en el repositorio de Hugging Face y en la model card del cuantizador; no se han publicado resultados de evaluacion ni especificaciones detalladas de arquitectura o contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles de capas y atencion no disponibles) |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. La model card del cuantizador indica que el modelo se ha generado con mergekit y que se trata de un merge de modelos, pero no especifica la composicion del merge, el numero de capas, la dimension del modelo, el tipo de atencion ni la funcion de activacion. El dato de parametros totales (30,7 B) proviene de los safetensors del modelo base.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La presencia de ficheros mmproj sugiere que el modelo base podria incluir un adaptador multimodal (vision), pero no se detalla su funcionamiento ni el modelo de vision asociado. No se han publicado innovaciones tecnicas destacables (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Posible soporte multimodal (vision) por la presencia de ficheros mmproj, aunque no documentado en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Etiquetado como `not-for-all-audiences`, lo que implica que puede generar contenido no apto para todas las audiencias.

## Casos de uso

- Generacion de texto creativo y narrativo en ingles: el modelo, con 30,7 B de parametros, puede producir textos largos y coherentes; las cuantizaciones Q4_K_M (18,8 GB) permiten ejecutarlo en GPUs de 24 GB.
- Asistente conversacional local: con Q4_K_S (17,9 GB) o Q5_K_M (21,9 GB) se puede desplegar en una RTX 4090 o A6000 para dialogos multi-turno sin depender de la nube.
- Prototipado de chatbots en ingles: la licencia Apache 2.0 facilita la experimentacion y el despliegue en productos comerciales, siempre que se revise el contenido generado por la etiqueta `not-for-all-audiences`.
- Investigacion sobre merges de modelos: util para estudiar el comportamiento de modelos fusionados con mergekit y comparar cuantizaciones (Q2_K a Q8_0) en terminos de calidad y velocidad.
- Generacion de codigo y texto tecnico en ingles: aunque no se documentan benchmarks, un modelo de 30 B puede asistir en tareas de programacion; se recomienda validar la calidad con pruebas propias.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (12 GB) permite ejecutar el modelo en GPUs de 16 GB o en CPU con llama.cpp, a costa de una perdida de calidad.
- Fine-tuning ligero o adaptacion con LoRA: el modelo base en safetensors (no incluido en este repo) puede servir como punto de partida para ajustes especificos, aunque no se documenta el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12 GB
  - Q3_K_M: ~15,4 GB
  - IQ4_XS: ~17 GB
  - Q4_K_M: ~18,8 GB
  - Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M o Q5_K_M con contexto moderado.
  - RTX 3090 (24 GB): Q4_K_S o Q4_K_M.
  - A6000 (48 GB): Q8_0 o Q6_K con contexto amplio.
  - A100 40/80 GB y H100: Q8_0 y despliegue multi-usuario.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para vLLM o TGI se requeriria el modelo base en safetensors, no incluido en este repositorio.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Glistening-Gem-31B-v2.1-GGUF | 30,7 B | no disponible | Apache 2.0 | GGUF | Hugging Face (mradermacher) |
| Modelo base sophosympatheia/Glistening-Gem-31B-v2.1 | 30,7 B | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Alternativas de ~30 B (p. ej., modelos de la familia Yi-34B o Mistral) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Etiqueta `not-for-all-audiences`: el modelo puede generar contenido inapropiado; no recomendado para aplicaciones dirigidas a menores o entornos sin moderacion.
- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los LLM; no se han publicado evaluaciones de fidelidad.
- No se documentan sesgos conocidos, pero al ser un merge de modelos sin informacion de datos de entrenamiento, no se puede descartar la presencia de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero el autor original no ofrece garantias ni soporte; conviene revisar los terminos del modelo base.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de aplicaciones con ventanas largas.
- El repositorio ocupa 213,9 GB en total; la descarga de todas las cuantizaciones no es necesaria, pero conviene seleccionar solo la variante adecuada.
- Los ficheros mmproj sugieren vision, pero no se documenta su uso; no asumir capacidades multimodales sin validacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.1-GGUF
- Modelo base: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Glistening-Gem-31B-v2.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
