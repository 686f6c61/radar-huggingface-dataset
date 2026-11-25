# mradermacher/Qwen3.8-27B-GrumpyGuy-GGUF

## Resumen

Qwen3.8-27B-GrumpyGuy-GGUF es una cuantizacion estatica en formato GGUF del modelo wesjos/Qwen3.8-27B-GrumpyGuy, un fine-tune de la familia Qwen3.8 (etiquetado internamente como qwen3_5) orientado a roleplay y conversacion con una persona concreta: un personaje "grumpy" (gruñon). El modelo original cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) en precision bf16, y esta publicado bajo licencia Apache 2.0.

El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF que genera versiones estaticas y ponderadas (imatrix) de modelos populares para su uso en llama.cpp y derivados. Esta ficha cubre exclusivamente la variante GGUF, que incluye desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB), ademas de dos suplementos multimodales mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidades de vision.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 27B con ajuste de persona en hardware de consumo mediante cuantizaciones de 4 bits (~16-17 GB), manteniendo el tono conversacional del fine-tune. Esta pensado para experimentacion con personajes, prototipado de asistentes con personalidad definida y despliegues locales donde no se dispone de GPU de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura (Qwen3.8, tag qwen3_5) y el tamano (27,3 B parametros), se trata presumiblemente de un transformer denso de la familia Qwen, pero la model card no confirma tipo de atencion, numero de capas, dimension oculta ni si emplea innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si consta es que wesjos/Qwen3.8-27B-GrumpyGuy es un fine-tune (tag finetune, bf16) sobre una base Qwen3.8, especializado en una persona "grumpy" para roleplay y conversacion. La presencia de ficheros mmproj en el repositorio GGUF confirma que el modelo original es multimodal (vision), aunque la model card no detalla el codificador visual ni la resolucion de imagen soportada. La cuantizacion realizada por mradermacher es estatica (quantize_version 2, output_tensor_quantised 1), sin version ponderada en este repositorio; las versiones imatrix estan en un repositorio separado (i1-GGUF).

## Capacidades

- Generacion de texto conversacional con un estilo de persona definido (gruñon, sarcastico), segun los tags grumpy, persona y roleplay.
- Roleplay y mantenimiento de personaje en conversaciones multi-turno.
- Capacidades multimodales (vision) inferidas de la presencia de ficheros mmproj Q8_0 y f16 en el repositorio.
- Soporte bilingue limitado a ingles (en) y chino (zh), segun los metadatos de idioma.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con APIs tipo OpenAI en infraestructuras de despliegue.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni matematicas avanzadas.

## Casos de uso

- Prototipado de personajes conversacionales: el fine-tune mantiene una persona "grumpy" coherente, util para probar asistentes con caracter definido en demos y juegos narrativos, ejecutables en local con Q4_K_M (~17 GB).
- Roleplay y ficcion interactiva: la cuantizacion Q5_K_M o Q6_K permite sesiones largas con buena fidelidad al tono del personaje en equipos con 24 GB de VRAM.
- Chat local con vision: usando los ficheros mmproj junto con el GGUF principal en llama.cpp, se pueden procesar imagenes en conversaciones con el personaje, por ejemplo para comentar capturas o memes.
- Evaluacion de fine-tunes de persona: investigadores pueden comparar el efecto de la cuantizacion (Q2_K frente a Q8_0) en la coherencia del personaje sin necesidad de GPU de centro de datos.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q2_K (11,3 GB) permite inferencia en CPU con RAM suficiente, adecuada para pruebas internas.
- Integracion en pipelines compatibles con endpoints: el tag endpoints_compatible facilita exponer el modelo detras de una API compatible con OpenAI para aplicaciones de chat internas.
- Base para nuevos fine-tunes: al ser Apache 2.0, se puede partir de estas cuantizaciones para experimentar con otras personas o estilos, aunque el reentrenamiento requerira los pesos bf16 originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto y KV cache):
  - Q2_K: 11,3 GB
  - Q3_K_S: 12,4 GB; Q3_K_M: 13,8 GB; Q3_K_L: 15,0 GB
  - IQ4_XS: 15,8 GB; Q4_K_S: 15,9 GB; Q4_K_M: 17,1 GB
  - Q5_K_S: 19,1 GB; Q5_K_M: 19,7 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
  - mmproj (vision): 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, Q4_K_M encaja en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto moderado; Q8_0 requiere 32 GB o mas (A100 40 GB, RTX 5090 si se dispone) o reparto entre GPU y CPU.
- Cabe en GPU consumer: si, en el rango Q2_K a Q6_K para tarjetas de 16-24 GB, con contexto reducido en los tamanos mayores; Q4_K_S y Q4_K_M son las opciones marcadas como "fast, recommended" por el autor de la cuantizacion.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; el tag endpoints_compatible sugiere servidores compatibles con API OpenAI. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que para esos motores habria que usar los pesos bf16 originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-GrumpyGuy-GGUF (este) | ~27,3 B | no disponible | en, zh | Apache 2.0 | GGUF |
| wesjos/Qwen3.8-27B-GrumpyGuy (base) | ~27,3 B | no disponible | en, zh | Apache 2.0 | safetensors/bf16 |
| mradermacher/Qwen3.8-27B-GrumpyGuy-i1-GGUF | ~27,3 B | no disponible | en, zh | Apache 2.0 | GGUF (imatrix) |

No se dispone de datos de rendimiento ni de contexto para comparar con alternativas de otros autores; la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- El fine-tune esta disenado para una persona "grumpy": el tono sarcastico o gruñon es intencionado y puede resultar inadecuado para atencion al cliente o aplicaciones profesionales sin un system prompt que lo modere.
- Riesgo de alucinacion inherente a los modelos de ~27B; no hay benchmarks publicados que permitan cuantificar su fiabilidad en tareas factuales.
- Soporte de idiomas limitado a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se documentan contexto maximo, capacidades de tool calling ni modo thinking; no debe asumirse su disponibilidad en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la coherencia del personaje y la calidad general; el autor recomienda Q4_K_S o Q4_K_M como equilibrio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento del fine-tune no estan documentados, por lo que conviene revisar la model card original antes de un despliegue comercial.
- El repositorio tiene muy poca traccion (425 descargas, 0 likes en el momento de la consulta) y no hay validacion de la comunidad sobre su calidad.
- La fecha de creacion (2026-11-22) y la nomenclatura Qwen3.8/qwen3_5 no coinciden con versiones publicas conocidas de Qwen en el momento de redactar esta ficha; verificar la procedencia del modelo base antes de confiar en el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-GrumpyGuy-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-GrumpyGuy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-GrumpyGuy-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
