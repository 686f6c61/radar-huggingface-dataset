# mradermacher/Lunar-Huntress-0.1-i1-GGUF

## Resumen

Lunar-Huntress-0.1-i1-GGUF es un repositorio de cuantizaciones en formato GGUF con imatrix (matriz de importancia) del modelo Husky110/Lunar-Huntress-0.1, publicado por el cuantizador conocido mradermacher. El modelo base es un merge creado con mergekit mediante el método TIES, construido sobre la familia de arquitecturas Gemma (etiquetado como "gemma4"), con aproximadamente 30.700 millones de parámetros. Está orientado a roleplay, escritura creativa, companions conversacionales y contenido adulto (NSFW), por lo que incluye la etiqueta "not-for-all-audiences".

Este tipo de repositorios no añaden capacidades nuevas al modelo original: su valor está en hacer el modelo accesible en hardware de consumo mediante 22 variantes de cuantización que van desde 7,3 GB (IQ1_S) hasta 25,3 GB (Q6_K). Es relevante para usuarios que quieren ejecutar localmente un modelo de 30B afinado para narrativa interactiva sin necesitar una GPU de gama datacenter, usando llama.cpp, Ollama o interfaces compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, etiquetado "gemma4"), merge TIES |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base, Husky110/Lunar-Huntress-0.1, es un merge de modelos creado con mergekit utilizando el metodo TIES (Task Arithmetic with sign consensus), una tecnica que resuelve conflictos de signo entre los deltas de tarea de varios modelos para fusionarlos sin degradar tanto como el promedio simple. La etiqueta "gemma4" indica que los modelos fusionados pertenecen a la familia de arquitecturas Gemma de Google. El tamaño resultante, unos 30,7 mil millones de parámetros, es coherente con un merge de modelos de esa familia.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens, ni sobre procesos posteriores como SFT, RLHF o DPO aplicados a los modelos componentes del merge. El propio repositorio de mradermacher es una cuantizacion: el autor genera un archivo imatrix (matriz de importancia calculada sobre un corpus de calibracion) y lo usa para producir cuantizaciones k-quants e i-quants de la familia IQ/Q con mejor relacion calidad-tamaño que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generacion de texto creativo orientado a roleplay y narrativa interactiva, el caso de uso principal declarado del merge.
- Companeros conversacionales (companion), con etiqueta "conversational" en el pipeline.
- Escritura creativa en general (cuentos, dialogos, descripcion de escenas).
- Contenido adulto (NSFW): el modelo esta etiquetado explicitamente para este fin y con "not-for-all-audiences".
- Uso como modelo de vision: la model card indica "This is a vision model" y remite los archivos mmproj al repositorio estatico (aunque en este caso se indica skip_mmproj: 1, por lo que los mmproj podrian no estar incluidos).
- No hay informacion sobre tool calling, agentes, razonamiento estructurado ni capacidades de codigo.

## Casos de uso

- Roleplay interactivo local: ejecutar sesiones de juego de rol textual con personajes en SillyTavern, KoboldCpp o text-generation-webui, usando una cuantizacion Q4_K_M (18,8 GB) en una GPU de 24 GB.
- Companero conversacional: despliegue de un chatbot de compañia en local con privacidad total, sin enviar conversaciones a servicios externos.
- Escritura creativa asistida: generacion de borradores de ficcion, dialogos y descripciones en ingles, integrado en editores via llama.cpp u Ollama.
- Contenido adulto con control local: creacion de narrativa NSFW en entornos privados, aprovechando que el modelo esta afinado explicitamente para ello (solo para usuarios adultos y donde sea legal).
- Pruebas de calidad de cuantizaciones: comparar variantes IQ frente a Q en un modelo de 30B para evaluar la degradacion de calidad en tareas creativas.
- Prototipado multimodal ligero: si se obtienen los archivos mmproj del repositorio estatico, experimentar con entrada de imagen combinada con generacion de texto creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a roleplay y escritura creativa, los benchmarks academicos estandar (MMLU, GSM8K, HumanEval) serian ademas poco representativos de su rendimiento real en la tarea para la que esta disenado.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): IQ1_S ~7,3 GB; IQ3_M ~14,5 GB; Q4_K_M ~18,8 GB; Q5_K_M ~21,9 GB; Q6_K ~25,3 GB. Anade 1-4 GB adicionales de contexto segun la longitud de ventana usada.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M/Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para IQ3/IQ4_XS; para Q6_K, A100 40 GB, o descarga parcial en RAM con offload.
- Cabe en GPU de consumo: si, desde 8 GB con IQ1/IQ2 (calidad muy degradada) hasta 24 GB con calidad recomendada (Q4_K_M).
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, LM Studio, text-generation-webui, SillyTavern como frontend; tambien compatible con backends tipo vLLM mediante GGUF en versiones recientes.
- Latencia y throughput: no disponible; en una RTX 4090 con Q4_K_M puede esperarse generacion fluida (decenas de tokens/s) para un modelo de 30B totalmente en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| Lunar-Huntress-0.1 (este, cuantizado) | ~30,7 B | GGUF (22 quants imatrix) | Roleplay, companion, NSFW | Apache 2.0 |
| Mistral-Small-24B-Instruct (variantes roleplay de la comunidad) | ~24 B | safetensors / GGUF | Uso general y roleplay | Apache 2.0 |
| Gemma 3 27B IT | ~27 B | safetensors / GGUF | Uso general, vision, multilingue | Gemma license (restricciones) |
| Qwen2.5 32B Instruct | ~32 B | safetensors / GGUF | Uso general, codigo, agentes | Apache 2.0 / Qwen license |

Lunar-Huntress destaca frente a los modelos generales de tamano similar por su afinamiento especifico en roleplay y contenido adulto, con licencia Apache 2.0 sin restricciones; a cambio, no hay datos publicos de rendimiento en tareas generales ni soporte documentado de tool calling o agentes.

## Limitaciones y advertencias

- Contenido adulto: el modelo esta etiquetado NSFW y "not-for-all-audiences"; su uso esta restringido a personas adultas y puede ser ilegal en algunas jurisdicciones o plataformas.
- Idioma: el unico idioma declarado es el ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior o no fiable.
- Al ser un merge TIES de modelos Gemma, hereda los sesgos de los modelos base (sesgos culturales, de genero y de seguridad de la familia Gemma), posiblemente amplificados o modificados por la fusion.
- Riesgo de alucinacion: no evaluado publicamente; en tareas creativas puede inventar hechos con fluidez, y no hay garantias de veracidad factual.
- Longitud de contexto: no disponible en la documentacion; no se puede garantizar el manejo de conversaciones muy largas sin verificar la config del modelo base.
- Las cuantizaciones IQ1/IQ2 (7-11 GB) degradan notablemente la calidad; mradermacher las marca como "desperate" o "very low quality".
- Los archivos mmproj para vision no se incluyen en este repo (skip_mmproj: 1); hay que acudir al repositorio estatico.
- Sin benchmarks publicos ni evaluaciones de seguridad, se recomienda pruebas propias antes de cualquier despliegue.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Lunar-Huntress-0.1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Lunar-Huntress-0.1-GGUF
- Modelo base: https://huggingface.co/Husky110/Lunar-Huntress-0.1
- Pagina de descargas del autor: https://hf.tst.eu/model#Lunar-Huntress-0.1-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
