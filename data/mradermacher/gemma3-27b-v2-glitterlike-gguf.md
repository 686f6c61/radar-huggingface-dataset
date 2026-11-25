# mradermacher/gemma3-27b-v2-glitterlike-GGUF

## Resumen

`mradermacher/gemma3-27b-v2-glitterlike-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `ToastyPigeon/gemma3-27b-v2-glitterlike`, publicado por el usuario mradermacher, conocido en Hugging Face por producir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. El modelo subyacente es un ajuste fino de la familia Gemma 3 de Google, con 27.009.346.304 parametros segun los pesos en safetensors del modelo base, y esta orientado a conversacion en ingles.

El repositorio no incluye model card propia del modelo original: la informacion disponible se limita a la ficha de cuantizacion, que lista los ficheros GGUF generados (desde Q2_K hasta Q8_0, ademas de los suplementos multimodales mmproj en Q8_0 y f16). Esto sugiere que el modelo base conserva la capacidad multimodal de Gemma 3, aunque no se detalla en la informacion proporcionada.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizacion, algo imposible con los pesos originales en bf16. Sin embargo, la ausencia de datos sobre el entrenamiento del ajuste fino, benchmarks y licencia del modelo derivado limita seriamente su evaluacion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma 3) |
| Parametros totales | 27.009.346.304 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `ToastyPigeon/gemma3-27b-v2-glitterlike` mas alla de su nombre, que indica que deriva de Gemma 3 con 27B de parametros. La model card del repositorio GGUF no describe la arquitectura, los datos de entrenamiento, el numero de tokens utilizados ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se documenta la composicion del dataset del ajuste fino ni la naturaleza del mismo (el sufijo "glitterlike" no se explica en la informacion proporcionada).

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf), generadas por mradermacher. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (`mradermacher/gemma3-27b-v2-glitterlike-i1-GGUF`), lo que sugiere que las de este repositorio son cuantizaciones estaticas sin calibracion por importancia. La presencia de ficheros `mmproj` confirma que el modelo base conserva la torre visual de Gemma 3, pero no se detalla su configuracion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Capacidad multimodal probable (torre visual) por la presencia de ficheros `mmproj` Q8_0 y f16, aunque no se documenta en la model card.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que indica que puede servirse mediante infraestructura de inferencia estandar.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni capacidades multilingues mas alla del ingles.
- No se documentan capacidades especificas de codigo o matematicas para este ajuste fino concreto.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,4 GB) permiten ejecutar un modelo de 27B en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y puede integrarse en aplicaciones de chat mediante la API compatible de llama.cpp o servidores derivados.
- Experimentacion con modelos multimodales en local: los ficheros mmproj permiten cargar la torre visual junto con el modelo de lenguaje en llama.cpp, habilitando tareas de descripcion de imagenes o VQA en ingles, siempre que se valide su comportamiento.
- Evaluacion comparativa de ajustes finos: investigadores que quieran comparar el comportamiento de este ajuste fino frente al Gemma 3 original pueden usar las cuantizaciones Q8_0 (28,8 GB) para minimizar la perdida de calidad.
- Servicio de inferencia en CPU con RAM abundante: la cuantizacion Q2_K (10,6 GB) permite ejecutar el modelo en maquinas sin GPU, a costa de una degradacion notable de calidad.
- Fine-tuning o evaluacion sobre el modelo base: el repositorio original en safetensors (27B) puede servir como punto de partida para experimentos adicionales, aunque no se documenta su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,6 GB
  - Q3_K_M: ~13,5 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
- Anadir entre 1 y 3 GB adicionales para la cache KV segun longitud de contexto; no se dispone del dato de contexto maximo.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) tambien valida para Q4/Q5.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 24 GB o mas para cuantizaciones Q4 y Q5. Para Q8_0 se requiere una GPU de 32 GB o superior, o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de llama.cpp (p. ej. llama-cpp-python, text-generation-webui). No se documenta soporte para vLLM o TGI, que habitualmente requieren pesos en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma3-27b-v2-glitterlike-GGUF (este) | 27,0B | no disponible | no disponible | GGUF | Ajuste fino no documentado sobre Gemma 3 |
| Gemma 3 27B (Google) | 27B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF (via terceros) | Modelo original de referencia |
| Mistral Small 3 (24B) | 24B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamano similar |
| Qwen2.5 32B | 32B | no disponible en esta ficha | Apache 2.0 (segun variante) | safetensors, GGUF | Alternativa abierta de tamano similar |

La comparacion se limita a datos estructurales porque no hay benchmarks publicados para este ajuste fino ni informacion de contexto y licencia en la model card.

## Limitaciones y advertencias

- La licencia del modelo derivado no esta disponible; no se puede confirmar si el uso comercial esta permitido. El modelo base Gemma 3 esta sujeto a los terminos de Google, que imponen restricciones adicionales.
- No hay informacion sobre el dataset de ajuste fino, lo que impide evaluar sesgos, calidad y posibles comportamientos no deseados.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones.
- El modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; el autor recomienda Q4_K_S o Q4_K_M para uso general y Q6_K para maxima calidad.
- La ausencia de benchmarks y de model card del modelo original hace desaconsejable su uso en produccion sin una evaluacion previa propia.
- El repositorio tiene muy pocas descargas (43) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.
- El tamano del repositorio (188,1 GB) incluye todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma3-27b-v2-glitterlike-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma3-27b-v2-glitterlike
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma3-27b-v2-glitterlike-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma3-27b-v2-glitterlike-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
