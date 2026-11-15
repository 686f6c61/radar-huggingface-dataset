# mradermacher/Dungeonmaster-V2.2-Expanded-LLaMa-70B-GGUF

## Resumen

Dungeonmaster-V2.2-Expanded-LLaMa-70B-GGUF es la version cuantizada en formato GGUF del modelo Tarek07/Dungeonmaster-V2.2-Expanded-LLaMa-70B, un merge de modelos derivado de la familia LLaMa 3.3 de 70B parametros. Lo publica mradermacher, un conocido creador de cuantizaciones estaticas de la comunidad open source, cuya labor consiste en convertir pesos en safetensors a formatos GGUF optimizados para inferencia en CPU y GPU con llama.cpp y derivados.

El modelo base es un merge generado con mergekit, orientado a conversacion y con la etiqueta `not-for-all-audiences`, lo que indica que su contenido puede incluir material para adultos o temas sensibles. No se trata de un modelo de proposito general pulido para produccion, sino de un experimento de la comunidad enfocado a rol conversacional (de ahi el nombre "Dungeonmaster", referencia a los narradores de partidas de rol).

La relevancia de esta ficha reside en que permite ejecutar un modelo de 70.553.706.560 parametros en hardware de consumo mediante cuantizaciones que van desde 26,5 GB (Q2_K) hasta 75,1 GB (Q8_0), con soporte para llama.cpp, Ollama y otros motores compatibles con GGUF. La licencia heredada es llama3.3, lo que impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LLaMa 3.3 70B, merge con mergekit) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (multi-parte para Q6_K y Q8_0) |

## Arquitectura y entrenamiento

El modelo es un merge de modelos (model merge) construido con mergekit a partir de la familia LLaMa 3.3 de 70B parametros. No se dispone de informacion detallada sobre la receta exacta de merge (que modelos se combinaron, pesos o metodo de fusion como SLERP, TIES o DARE), ni sobre datos de entrenamiento adicionales, RLHF o DPO. La model card original de Tarek07 no se incluye en la informacion proporcionada.

La publicacion de mradermacher es exclusivamente una cuantizacion: no reentrena ni modifica la arquitectura, solo convierte los pesos a GGUF con `quantize_version: 2` y `output_tensor_quantised: 1`, e incluye variantes imatrix en un repositorio separado para mejorar la calidad en cuantizaciones de baja precision. El tamano del repositorio (481,3 GB) se explica por la acumulacion de todas las variantes de cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a rol y narrativa (tematica "dungeonmaster").
- Conversacion multi-turno, segun la etiqueta `conversational` del repositorio.
- Capacidad de razonamiento y generacion de codigo heredada del modelo base LLaMa 3.3, aunque no documentada explicitamente en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Rol conversacional y narrativa interactiva: el modelo esta disenado y etiquetado para narrar partidas de rol, generar descripciones de escenarios y mantener personajes consistentes en conversaciones largas, aprovechando el contexto extendido tipico de LLaMa 3.3.
- Prototipado de chatbots tematicos: util para desarrolladores que quieran experimentar con un modelo de 70B en local sin depender de APIs, usando cuantizaciones Q4_K_M (42,6 GB) en GPUs de 48 GB.
- Generacion creativa de ficcion: redaccion de relatos, dialogos y worldbuilding en ingles, con la ventaja de que el merge puede producir estilos mas variados que un modelo base unico.
- Investigacion sobre tecnicas de merge: sirve como caso de estudio para analizar como afecta la fusion de modelos a la coherencia conversacional y a la calidad de las cuantizaciones.
- Evaluacion de cuantizaciones: el repositorio incluye 11 variantes de cuantizacion, lo que permite medir el impacto de la precision en tareas narrativas y comparar Q4_K_M frente a Q6_K o Q8_0.
- Despliegue en entornos con CPU: al ser GGUF, puede ejecutarse con llama.cpp en servidores sin GPU, aunque con latencia alta para 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~26,5 GB; Q4_K_M ~42,6 GB; Q5_K_M ~50,0 GB; Q6_K ~58,0 GB; Q8_0 ~75,1 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: A100 80 GB, H100 80 GB o multiples GPUs para Q6_K y Q8_0; una RTX 6000 Ada (48 GB) o A6000 (48 GB) para Q4_K_M; dos RTX 4090 (24 GB cada una) para Q4_K_S o IQ4_XS con reparto de capas.
- Cabe en consumer GPU: si, en configuraciones multi-GPU (2x RTX 4090 para Q4_K_M) o en una unica RTX 4090 solo con cuantizaciones muy agresivas y offloading parcial a RAM, con penalizacion severa de latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier motor compatible con GGUF. Los pesos multi-parte de Q6_K y Q8_0 requieren concatenacion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dungeonmaster-V2.2-Expanded-LLaMa-70B-GGUF | 70,55B | no disponible | llama3.3 | GGUF | Merge orientado a rol, solo ingles |
| LLaMa 3.3 70B Instruct (Meta) | 70B | 128K | llama3.3 | safetensors, GGUF | Modelo base oficial, proposito general |
| TheBloke/Llama-2-70B-Chat-GGUF | 70B | 4K | llama2 | GGUF | Referencia historica de cuantizacion comunitaria |
| mradermacher/*-i1-GGUF (familia) | Variable | Variable | Variable | GGUF imatrix | Variantes imatrix con mejor calidad a igual tamano |

La comparativa directa con modelos de rol especificos (por ejemplo, variantes de SillyTavern o merges de la escena de roleplay) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge de LLaMa 3.3, hereda los sesgos de los datos de entrenamiento originales, no documentados en esta ficha.
- Riesgo de alucinacion: alto en un modelo de merge sin ajuste fino supervisado documentado; no apto para tareas factuales sin verificacion.
- Limitaciones de contexto o idioma: solo ingles (`language: en`); la longitud de contexto no esta documentada y puede diferir del LLaMa 3.3 original.
- Restricciones de licencia: licencia llama3.3, que impone condiciones de uso (incluida la politica de uso aceptable de Meta) y puede restringir el uso comercial segun el caso; revisar el texto completo antes de desplegar en produccion.
- Etiqueta `not-for-all-audiences`: el contenido generado puede incluir material para adultos o sensible; no adecuado para aplicaciones orientadas a publico general sin filtrado.
- Modelo de comunidad con 62 descargas y 1 like: sin validacion externa significativa, sin benchmarks publicados y sin garantias de calidad.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Los archivos Q6_K y Q8_0 estan divididos en dos partes que deben concatenarse antes de usarse.

## Enlaces

- Repositorio Hugging Face (GGUF estaticas): https://huggingface.co/mradermacher/Dungeonmaster-V2.2-Expanded-LLaMa-70B-GGUF
- Repositorio imatrix (i1-GGUF): https://huggingface.co/mradermacher/Dungeonmaster-V2.2-Expanded-LLaMa-70B-i1-GGUF
- Modelo base: https://huggingface.co/Tarek07/Dungeonmaster-V2.2-Expanded-LLaMa-70B
- Pagina de descargas del autor: https://hf.tst.eu/model#Dungeonmaster-V2.2-Expanded-LLaMa-70B-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador): https://www.nethype.de/
