# mradermacher/experimental_merge_241026_v2-i1-GGUF

## Resumen

`mradermacher/experimental_merge_241026_v2-i1-GGUF` es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `alansmithee-cpu/experimental_merge_241026_v2`, un merge experimental construido con mergekit y orientado a roleplay, escritura creativa, narrativa de formato largo y contenido ERP. No se trata de un modelo entrenado desde cero, sino de una fusion de pesos cuyo origen y componentes exactos no se detallan en la informacion disponible.

El modelo base cuenta con 169.670.995.968 parametros segun los safetensors publicados, lo que lo situa en la categoria de aproximadamente 170B parametros. La arquitectura subyacente no se especifica en la model card, aunque las etiquetas mencionan Mistral, lo que sugiere una base de la familia Mistral, sin que sea posible confirmar la arquitectura exacta ni la longitud de contexto.

La relevancia de esta publicacion es practica: mradermacher ofrece cuantizaciones con imatrix (etiquetadas i1) en un rango amplio de tamanos, desde IQ1_S (~35,9 GB) hasta Q5_K_S y superiores, lo que permite ejecutar un modelo de gran tamano en hardware con VRAM limitada mediante llama.cpp y herramientas compatibles. La licencia es MRL-0.1 de Mistral, con implicaciones para uso comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas mencionan Mistral; sin confirmar) |
| Parametros totales | 169.670.995.968 (~170B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-Q2_K_S, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S (y superiores segun el listado truncado) |
| Idiomas soportados | en (segun la model card) |
| Licencia | mrl (Mistral Research License 0.1) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge de pesos generado con mergekit, segun las etiquetas de la model card. No se especifican los modelos de origen, la estrategia de fusion (SLERP, TIES, DARE, model stock, etc.), los hiperparametros ni el proceso de mezcla. Tampoco se documenta si hubo entrenamiento posterior, RLHF, DPO o ajuste fino adicional tras la fusion. La model card del repositorio de cuantizaciones no incluye informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Las cuantizaciones publicadas por mradermacher son de tipo i1, es decir, generadas con un fichero imatrix (importance matrix) incluido en el repositorio (`experimental_merge_241026_v2.imatrix.gguf`, 0,2 GB). Este enfoque permite obtener cuantizaciones de baja tasa de bits con mejor calidad relativa que las cuantizaciones estaticas equivalentes. El autor indica que las cuantizaciones estaticas estan disponibles en un repositorio separado (`mradermacher/experimental_merge_241026_v2-GGUF`). Las etiquetas de conversion interna (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) confirman que se partio del modelo en formato Hugging Face y se convirtio a GGUF.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis declarado en roleplay (RP), escritura creativa, narrativa de formato largo y contenido ERP.
- Conversacion multi-turno orientada a personajes y mantenimiento de estilo, segun las etiquetas del autor.
- Generacion de texto creativo en ingles, unico idioma declarado en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking).
- No se documentan capacidades de codigo o matematicas; el enfasis declarado es narrativo y conversacional.

## Casos de uso

- Roleplay conversacional con personajes: el modelo esta etiquetado explicitamente para RP y puede mantener conversaciones multi-turno con consistencia de personaje; su tamano de ~170B permite estilos narrativos mas ricos que modelos pequenos, aunque el contexto maximo no esta documentado y debe verificarse antes de disenar prompts largos.
- Escritura creativa de formato largo: adecuado para generar relatos, capitulos y ficcion extensa en ingles, gracias al enfasis declarado en longform writing y a la capacidad de continuidad narrativa de un modelo de gran tamano.
- Generacion de ficcion interactiva y aventuras de texto: puede integrarse en motores de ficcion interactiva que envien el estado de la historia y las acciones del usuario como contexto conversacional.
- Prototipado de asistentes de escritura: util para experimentar con estilos, voces narrativas y reescritura creativa en entornos de investigacion, dado su caracter experimental.
- Evaluacion de merges y cuantizaciones: el repositorio sirve para comparar la calidad de distintas cuantizaciones i1 (de IQ1_S a Q4_K_M y superiores) sobre un mismo modelo base, midiendo degradacion por tasa de bits.
- Despliegue local en hardware con VRAM limitada: las cuantizaciones de menor tamano (IQ1_S ~35,9 GB, IQ2_XXS ~44,9 GB, IQ3_XXS ~65,1 GB) permiten ejecutar un modelo de ~170B en configuraciones que no admitirian los pesos completos en safetensors.
- Experimentacion en investigacion sobre fusion de modelos: al ser un merge experimental, permite estudiar el comportamiento de pesos fusionados en tareas narrativas frente a los modelos de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamanos de fichero del repositorio, que aproximan el uso de memoria de pesos): IQ1_S ~35,9 GB; IQ1_M ~39,3 GB; IQ2_XXS ~44,9 GB; IQ2_XS ~50,0 GB; IQ2_S ~53,1 GB; Q2_K_S e IQ2_M ~57,6 GB; Q2_K ~62,6 GB; IQ3_XXS ~65,1 GB; IQ3_XS ~69,4 GB; Q3_K_S ~73,2 GB; IQ3_S ~73,4 GB; IQ3_M ~76,5 GB; Q3_K_M ~81,8 GB; Q3_K_L ~89,4 GB; IQ4_XS ~90,6 GB; Q4_0 ~96,0 GB; Q4_K_S ~96,3 GB; Q4_K_M ~101,4 GB; Q4_1 ~106,2 GB. A estos valores hay que anadir la memoria para el contexto KV y el overhead del runtime.
- GPU recomendadas: para cuantizaciones de 4 bits (Q4_K_M ~101,4 GB) se requiere al menos una GPU de 80 GB combinada con CPU offload, o configuraciones multi-GPU (por ejemplo, 2x A100 80 GB o 2x H100 80 GB). Para cuantizaciones IQ1/IQ2 de ~36-50 GB, una unica A100 80 GB o H100 80 GB puede alojar los pesos, con margen limitado para contexto.
- GPU de consumo: no cabe en GPU de consumo individuales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ni siquiera en la cuantizacion mas agresiva. Requiere offload a RAM del sistema y CPU, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runtimes compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si la arquitectura es compatible, aunque no se documenta.
- Latencia y throughput: no disponibles. Con offload parcial a CPU en un modelo de ~170B, se espera una latencia alta y un throughput bajo, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de arquitectura del modelo base que permitan una comparacion rigurosa con alternativas. Se indica "no disponible" para los campos no documentados.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| experimental_merge_241026_v2 (i1-GGUF) | ~170B | no disponible | MRL-0.1 | GGUF | Merge experimental orientado a RP y escritura creativa |
| Modelos de ~70B orientados a RP (generico) | ~70B | no disponible | variable | safetensors/GGUF | Categoria comparable en uso, sin datos de comparacion disponibles |
| Modelos Mistral de referencia (generico) | variable | no disponible | MRL/Apache segun version | safetensors/GGUF | Posible base del merge, sin confirmar |

## Limitaciones y advertencias

- Modelo experimental: la model card lo etiqueta como "Experimental"; no hay garantias de calidad, estabilidad ni comportamiento consistente en produccion.
- Sesgos conocidos: no documentados; al ser un merge sin informacion sobre datos de entrenamiento, no es posible evaluar sesgos de forma fiable.
- Riesgo de alucinacion: no cuantificado; en tareas narrativas y de roleplay el riesgo de hechos inventados es inherente y no se ha medido.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Limitaciones de contexto: la longitud de contexto no esta disponible; conviene verificarla en el configuracion del modelo base antes de disenar aplicaciones con prompts largos.
- Licencia: MRL-0.1 (Mistral Research License); restringe el uso comercial salvo licencia adicional de Mistral. Revisar el texto completo antes de cualquier despliegue comercial.
- Cuantizaciones de muy baja tasa de bits: el propio autor advierte que IQ1_S es "for the desperate", IQ1_M "mostly desperate" y Q2_K_S "very low quality"; la degradacion de calidad en estos rangos es significativa.
- Requisitos de hardware elevados: incluso la cuantizacion mas pequena (~35,9 GB) excede la VRAM de GPU de consumo, lo que obliga a offload y penaliza la latencia.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines de automatizacion que dependan de llamadas a funciones.
- Fecha de creacion inusual (2026-11-16 segun los metadatos): conviene verificar la vigencia y procedencia de los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/experimental_merge_241026_v2-i1-GGUF
- Modelo base: https://huggingface.co/alansmithee-cpu/experimental_merge_241026_v2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/experimental_merge_241026_v2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#experimental_merge_241026_v2-i1-GGUF
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
