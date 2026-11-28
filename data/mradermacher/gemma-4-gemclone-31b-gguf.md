# mradermacher/Gemma-4-GemClone-31B-GGUF

## Resumen

Gemma-4-GemClone-31B-GGUF es la distribucion en formato GGUF del modelo Gemma-4-GemClone-31B, un merge de modelos de la familia Gemma 4 creado por Ateron y cuantizado por mradermacher. El modelo original es un merge realizado con mergekit, orientado a roleplay y conversacion, que combina pesos de modelos Gemma 4 para obtener un checkpoint de aproximadamente 30.700 millones de parametros (30,697,345,596 segun los safetensors del modelo base). Esta version GGUF permite ejecutar el modelo en hardware de consumo y en entornos de inferencia local mediante llama.cpp y herramientas compatibles.

El interes de esta ficha radica en que ofrece una via practica para desplegar un modelo de ~31B en formato cuantizado, con opciones desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), ademas de un suplemento multimodal (mmproj) que sugiere capacidades de vision. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo esta declarado unicamente para ingles y su proposito principal es el roleplay, no tareas de razonamiento o codigo de proposito general.

La informacion disponible es limitada: no se publican datos de benchmarks, contexto, composicion del dataset de entrenamiento ni detalles de la arquitectura mas alla de que es un merge de Gemma 4. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos de Hugging Face, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4; merge con mergekit) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Ateron/Gemma-4-GemClone-31B es un merge de modelos de la familia Gemma 4 generado con mergekit, segun las etiquetas de la model card (`merge`, `mergekit`). No se especifica en la informacion disponible la tecnica exacta de merge (por ejemplo, SLERP, TIES, DARE o model stock), ni la lista de modelos de origen combinados, ni los hiperparametros empleados. Tampoco consta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; al tratarse de un merge, no hay entrenamiento adicional propiamente dicho, sino combinacion de pesos de checkpoints existentes.

La cuantizacion la realiza mradermacher con su pipeline habitual (indicado en la model card como `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). Se ofrecen tanto cuantizaciones estaticas en este repositorio como cuantizaciones ponderadas/imatrix en el repositorio hermano Gemma-4-GemClone-31B-i1-GGUF. La presencia de ficheros `mmproj` (multi-modal supplement) sugiere que el modelo base incorpora o hereda capacidades multimodales, si bien no se detalla en la informacion disponible que tipo de modalidad (vision, audio) ni como se integra en el merge.

## Capacidades

- Generacion de texto conversacional y roleplay, proposito declarado del modelo mediante las etiquetas `roleplay` y `conversational`.
- Conversacion multi-turno, segun la etiqueta `conversational`.
- Capacidad multimodal potencial: el repositorio incluye suplementos `mmproj-Q8_0` y `mmproj-f16`, lo que indica soporte de entrada multimodal en llama.cpp, aunque la informacion disponible no detalla que modalidades cubre.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas de Hugging Face).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Modo thinking, vision o audio explicitos: no disponible en la informacion proporcionada (mas alla del indicio multimodal de los ficheros mmproj).

## Casos de uso

- Roleplay y compania conversacional: el modelo esta etiquetado explicitamente como `roleplay` y `conversational`, por lo que su uso previsto es mantener personajes y dialogos multi-turno con coherencia. Se desplegaria con llama.cpp u Ollama usando Q4_K_M (18,8 GB) para equilibrar calidad y velocidad.
- Prototipado de chatbots de personaje en local: con la cuantizacion Q4_K_S (17,9 GB) cabe en una GPU de 24 GB y permite iterar sobre prompts de sistema y fichas de personaje sin coste de API.
- Generacion creativa de ficcion y narrativa: un modelo de ~31B mergeado para estilo conversacional puede producir texto narrativo largo; la cuantizacion Q6_K (25,3 GB) o Q8_0 (32,7 GB) preserva mas calidad para este tipo de tarea.
- Evaluacion de merges en investigacion: util para estudiar el comportamiento de merges de Gemma 4 frente a los modelos originales, comparando respuestas con distintas cuantizaciones (Q2_K a Q8_0) y midiendo degradacion por cuantizacion.
- Experimentacion multimodal en local: los ficheros mmproj permiten probar entrada multimodal con llama.cpp en un modelo de ~31B, adecuado para prototipos de asistentes que combinen texto e imagen.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integracion en productos comerciales sin las restricciones de otros modelos abiertos, siempre que se respeten las condiciones de la licencia.
- Fine-tuning o adaptacion posterior: al disponer del modelo base en safetensors (Ateron/Gemma-4-GemClone-31B), se puede partir de el para LoRA o adaptadores especificos antes de recuantizar a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 12,0 GB
  - Q3_K_S: 13,9 GB; Q3_K_M: 15,4 GB; Q3_K_L: 16,7 GB
  - IQ4_XS: 17,0 GB; Q4_K_S: 17,9 GB; Q4_K_M: 18,8 GB
  - Q5_K_S: 21,4 GB; Q5_K_M: 21,9 GB
  - Q6_K: 25,3 GB
  - Q8_0: 32,7 GB
  - Suplemento multimodal: mmproj-Q8_0 0,9 GB; mmproj-f16 1,3 GB (adicionales a la cuantizacion de texto)
- GPU recomendadas: para Q4_K_M (18,8 GB) es suficiente una RTX 4090 (24 GB) o una A100 40 GB; para Q8_0 (32,7 GB) se necesita una A100 40 GB, H100 o similar, o repartir entre varias GPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q5_K_M (21,9 GB) dejando margen para contexto; Q6_K (25,3 GB) y Q8_0 (32,7 GB) requieren offloading parcial o GPU de mayor memoria.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints; el modelo base en safetensors puede servirse con vLLM o TGI, aunque esta ficha cubre la version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de especificaciones completas de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y licencia.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-GemClone-31B-GGUF (este) | ~30,7B | no disponible | Apache 2.0 | GGUF | Merge orientado a roleplay; solo ingles |
| Gemma-4-GemClone-31B (base) | ~30,7B | no disponible | Apache 2.0 | safetensors | Modelo original de Ateron antes de cuantizar |
| Gemma-4-GemClone-31B-i1-GGUF | ~30,7B | no disponible | Apache 2.0 | GGUF (imatrix) | Mismo modelo con cuantizaciones ponderadas |

No se dispone de informacion sobre otros modelos de ~31B de la familia Gemma 4 o merges comparables en los datos proporcionados para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Modelo unicamente en ingles segun el campo `language: en`; no se garantiza calidad en castellano ni en otros idiomas.
- Al ser un merge de modelos Gemma 4, puede heredar sesgos de los checkpoints de origen; no se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no hay datos de benchmarks que permitan cuantificarlo.
- Proposito principal roleplay y conversacion: no esta validado para tareas de razonamiento, codigo o matematicas, y no se documentan capacidades de tool calling ni de agentes.
- La informacion sobre contexto maximo no esta disponible, lo que impide planificar despliegues con ventanas largas con garantias.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los modelos Gemma 4 subyacentes y de los checkpoints combinados en el merge, ya que un merge puede arrastrar obligaciones de las licencias de origen.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- El repositorio ocupa 213,9 GB en total por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- No hay garantias de soporte ni mantenimiento por parte del autor del merge ni del cuantizador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-4-GemClone-31B-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma-4-GemClone-31B-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-GemClone-31B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-GemClone-31B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Web del cuantizador: https://www.nethype.de/
