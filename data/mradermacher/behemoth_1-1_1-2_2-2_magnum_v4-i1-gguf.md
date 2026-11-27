# mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF

## Resumen

Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF es la cuantizacion en formato GGUF, generada con imatrix, del modelo fusionado alansmithee-cpu/Behemoth_1.1_1.2_2.2_Magnum_V4. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad. El modelo original es un merge construido con mergekit, orientado a conversacion en ingles y publicado bajo la licencia Mistral Research License (MRL-0.1).

Se trata de un modelo denso de gran tamano: los pesos en safetensors suman 122.610.069.504 parametros (unos 122,6 mil millones), lo que lo situa en la categoria de modelos de clase 120B+. Esta version GGUF existe precisamente para hacer viable su ejecucion en hardware mas modesto mediante cuantizacion agresiva, con variantes que van desde los 26,1 GB del IQ1_S hasta los 86,6 GB del Q5_K_M.

La relevancia de esta ficha es practica: permite evaluar rapidamente si un merge de 122B cuantizado encaja en el hardware disponible y bajo que condiciones de licencia. No hay model card detallada del modelo base en la informacion proporcionada, ni benchmarks publicados, por lo que muchos apartados tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de merge con mergekit; detalles no disponibles) |
| Parametros totales | 122.610.069.504 (~122,6B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-Q2_K_S, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (multiparte, 3 ficheros) |
| Idiomas soportados | en (ingles) |
| Licencia | mrl (Mistral Research License 0.1) |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit, una herramienta que combina pesos de varios modelos para producir un nuevo checkpoint sin entrenamiento adicional. La informacion proporcionada no detalla que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, etc.) ni con que pesos, por lo que la composicion exacta del merge no esta disponible. El resultado es un transformer denso de aproximadamente 122,6B parametros.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La cuantizacion realizada por mradermacher emplea una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja profundidad de bits, lo que suele traducirse en mejor rendimiento que las cuantizaciones estaticas equivalentes, especialmente en rangos IQ.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones (inferido del tipo de merge conversacional; sin validacion publica disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion local con modelos de gran tamano: permite probar un modelo de 122B en estaciones de trabajo con 32-96 GB de VRAM/RAM usando cuantizaciones IQ2 o IQ3, algo imposible con los pesos completos en fp16.
- Generacion creativa y conversacional en ingles: el modelo esta etiquetado como conversacional y puede emplearse para redaccion asistida, lluvia de ideas y dialogos multi-turno, siempre que el contexto lo permita.
- Investigacion sobre fusion de modelos: util para estudiar el comportamiento de merges de gran escala cuantizados frente a sus originales en fp16.
- Prototipado de asistentes en ingles: despliegue con llama.cpp u Ollama en un servidor con suficiente memoria para servir una API compatible con OpenAI.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de mas de 20 variantes permite medir el impacto de la profundidad de bits en la calidad de salida sobre el mismo modelo.
- Fine-tuning ligero o destilacion: el checkpoint base en safetensors puede servir como punto de partida para experimentos de ajuste, aunque el tamano exige infraestructura multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 26 GB (i1-IQ1_S) y 87 GB (i1-Q5_K_M); el Q6_K requiere descargar tres partes y supera los 90 GB.
- Cuantizaciones recomendadas por el autor: i1-Q4_K_M (73,3 GB) como opcion "rapida y recomendada", e i1-Q4_K_S (69,7 GB) como mejor relacion tamano/velocidad/calidad.
- GPU recomendadas: para las cuantizaciones mas bajas, una RTX 4090 (24 GB) no basta por si sola; se requiere offload a RAM del sistema o configuraciones multi-GPU (2x RTX 4090, A100 80 GB, H100 80 GB). Para IQ4/IQ5 se recomienda al menos una A100 80 GB o dos GPU de 48 GB.
- Cabe en consumer GPU: solo con offload parcial a RAM del sistema; una unica GPU de consumo no aloja ni las cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Behemoth_1.1_1.2_2.2_Magnum_V4 (este) | ~122,6B | no disponible | MRL-0.1 | GGUF + safetensors |
| Modelos de clase 120B de referencia | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables del mismo tamano y categoria en la documentacion proporcionada para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La licencia MRL-0.1 restringe el uso comercial; es necesario revisar los terminos completos antes de cualquier despliegue en produccion.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta validado.
- Al ser un merge sin model card detallada, se desconoce el dataset de entrenamiento y los sesgos potenciales heredados de los modelos fusionados.
- Riesgo de alucinacion inherente a los modelos generativos; sin benchmarks publicados no es posible cuantificar su fiabilidad.
- Las cuantizaciones por debajo de IQ2 (IQ1_S, IQ1_M) degradan notablemente la calidad; el autor las describe como "for the desperate".
- El repositorio ocupa 1297,4 GB en total por acumular todas las variantes; conviene descargar solo la cuantizacion necesaria.
- No hay informacion sobre tool calling, agentes ni modo thinking, por lo que no debe asumirse su soporte en pipelines que dependan de estas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF
- Modelo base: https://huggingface.co/alansmithee-cpu/Behemoth_1.1_1.2_2.2_Magnum_V4
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
