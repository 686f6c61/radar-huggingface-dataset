# mradermacher/Hush-Qwen2.5-7B-RP-v1.3-1M-GGUF

## Resumen

Hush-Qwen2.5-7B-RP-v1.3-1M-GGUF es la distribucion en formato GGUF del modelo Hush-Qwen2.5-7B-RP-v1.3-1M, un merge de la familia Qwen2.5-7B orientado a role-play y conversacion. El modelo original lo publica marcuscedricridia y esta cuantizacion la mantiene mradermacher, un perfil conocido por convertir modelos de Hugging Face a GGUF para su uso con llama.cpp y derivados. El modelo base es un merge generado con mergekit, segun las etiquetas del repositorio.

El modelo cuenta con 7.612.756.480 parametros totales (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos de 7B-8B. Al ser una cuantizacion estatica del modelo original, conserva la arquitectura transformer decoder-only de Qwen2.5 y el tokenizador asociado, pero no anade capacidades nuevas respecto al modelo base. Su interes practico esta en que permite ejecutar un modelo afinado para role-play en hardware de consumo mediante llama.cpp, Ollama o cualquier runtime compatible con GGUF.

La relevancia de esta ficha es acotada: se trata de una cuantizacion de conveniencia, no de un modelo con innovaciones tecnicas propias. La informacion publicada por el autor de la cuantizacion se limita a la lista de ficheros GGUF y a notas generales sobre el formato; no se detallan datos de entrenamiento, benchmarks ni la composicion exacta del merge. El modelo esta etiquetado unicamente para ingles y no declara licencia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B; merge con mergekit) |
| Parametros totales | 7.612.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el nombre del modelo incluye "1M", pero no se confirma como longitud de contexto) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B, un transformer decoder-only con atencion causal estandar. El modelo original es un merge construido con mergekit a partir de componentes de la familia Qwen2.5, segun las etiquetas del repositorio. No se dispone de informacion sobre la receta exacta del merge (que modelos se combinaron, con que pesos o metodo), ni sobre si hubo entrenamiento adicional, RLHF, DPO o ajuste fino supervisado despues del merge.

La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estaticas. El autor indica que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de publicacion, aunque podrian solicitarse mediante una discusion en la comunidad. No se documentan innovaciones tecnicas propias en esta distribucion.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a role-play y dialogos multi-turno.
- Razonamiento basico y respuesta a instrucciones heredadas del modelo base Qwen2.5.
- Generacion de codigo y matematicas a nivel general de la familia Qwen2.5-7B (no verificado en esta cuantizacion).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Role-play y narrativa interactiva: el modelo esta afinado para personajes y dialogos, por lo que puede mantener conversaciones multi-turno con consistencia de personaje en ingles. Adecuado para prototipos de chatbots de ficcion o juegos de texto.
- Prototipado local de asistentes conversacionales: al caber en GPU de consumo en cuantizaciones Q4, permite validar flujos de conversacion sin depender de APIs externas.
- Experimentacion con merges de la familia Qwen2.5: util para investigadores que quieran comparar el comportamiento de un merge afinado para role-play frente al Qwen2.5-7B base.
- Generacion de dialogos para guiones o contenido creativo: con cuantizaciones Q5 o Q6 se obtiene calidad cercana al modelo original manteniendo requisitos de memoria moderados.
- Educacion y demos de inferencia local: sirve para mostrar el uso de llama.cpp, Ollama o LM Studio con un modelo de 7B en equipos de gama media.
- Evaluacion de cuantizaciones: la disponibilidad de once variantes (de Q2_K a Q8_0) permite medir el impacto de la cuantizacion en la calidad de un modelo de role-play.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB. A estas cifras hay que sumar el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB o mas; Q6_K y Q8_0 requieren 10-12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runtimes compatibles con GGUF. El repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hush-Qwen2.5-7B-RP-v1.3-1M-GGUF | 7,6B | no disponible | no disponible | GGUF | Merge orientado a role-play, solo ingles |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Modelo base de referencia, multilingue |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens (segun Mistral) | Apache 2.0 (segun Mistral) | safetensors, GGUF | Alternativa generalista en ingles |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 tokens (segun Meta) | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema amplio |

Los datos de contexto y licencia de los modelos comparables provienen de sus respectivas documentaciones publicas; no se han verificado en esta ficha. Para el modelo objeto de la ficha, la licencia y el contexto no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido. Conviene consultar el repositorio del modelo base antes de usarlo en produccion.
- Solo ingles: el repositorio esta etiquetado unicamente con `en`; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: al ser un modelo de 7B afinado para role-play, puede inventar hechos con facilidad; no es adecuado para tareas factuales sin verificacion.
- Sesgos: no se documentan evaluaciones de sesgo; los merges de role-play suelen heredar los sesgos de los modelos originales y de los datos de ajuste.
- Contexto no confirmado: el sufijo "1M" del nombre no se documenta como longitud de contexto; no debe asumirse una ventana de un millon de tokens.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la coherencia; para role-play se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no las ha generado, por lo que no se dispone de la mejora de calidad habitual en ese tipo de cuantizacion.
- Modelo de nicho: con 23 descargas y 1 like en el momento de la consulta, la comunidad es muy reducida y el soporte practico es limitado.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Hush-Qwen2.5-7B-RP-v1.3-1M-GGUF
- Modelo base: https://huggingface.co/marcuscedricridia/Hush-Qwen2.5-7B-RP-v1.3-1M
- Pagina de descargas del autor de la cuantizacion: https://hf.tst.eu/model#Hush-Qwen2.5-7B-RP-v1.3-1M-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
