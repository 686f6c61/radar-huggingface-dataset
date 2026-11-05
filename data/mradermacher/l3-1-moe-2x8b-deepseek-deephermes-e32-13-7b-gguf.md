# mradermacher/L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B-GGUF

## Resumen

L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B-GGUF es una coleccion de cuantizaciones GGUF estaticas del modelo DavidAU/L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B, publicadas por mradermacher. El modelo base es un merge de tipo MoE construido sobre Llama 3.1, orientado a razonamiento explicito (chain-of-thought) y conversacion, combinando linajes de DeepSeek-R1 y DeepHermes de cognitivecomputations. El resultado es un modelo de 13.667.668.032 parametros totales con una ventana de contexto declarada de 128k tokens y entrenamiento afinado para generar trazas de razonamiento antes de la respuesta final.

El interes practico de esta publicacion es que traduce un modelo de ~13,7B a formatos GGUF listos para llama.cpp y derivados (Ollama, LM Studio, koboldcpp), con un abanico de cuantizaciones que va de Q2_K (5,3 GB) a Q8_0 (14,6 GB). Esto permite ejecutar el modelo en hardware de consumo, algo inviable con los pesos originales en safetensors (94 GB de repositorio, incluyendo todas las quants).

La relevancia actual es doble: por un lado, ofrece capacidades de razonamiento tipo R1 en un tamano manejable en local; por otro, la naturaleza de merge no oficial implica que sus garantias de calidad son las de la receta de merge del autor original, no las de un entrenamiento supervisado verificado. La licencia no esta declarada en la informacion disponible, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama 3.1 con mezcla de expertos (MoE), derivada de merge |
| Parametros totales | 13.667.668.032 |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (declarado en tags) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repositorio | 94,0 GB |
| Modelo base | DavidAU/L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B |
| Libreria declarada | transformers |
| Descargas / likes | 243 / 1 |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 y se presenta como una mezcla de expertos (MoE) con etiqueta "2X8B", lo que sugiere una composicion de dos bloques de aproximadamente 8B cada uno combinados en un total de ~13,7B. No se especifica en la informacion disponible el numero de expertos activos por token, el mecanismo de enrutamiento ni la proporcion de parametros activos, por lo que no es posible confirmar el coste real de inferencia por token mas alla del tamano total de pesos.

El entrenamiento declarado es un merge y fine-tune (tags "fine tune", "merge") que combina linajes de DeepSeek-R1 (razonamiento, CoT) y DeepHermes de cognitivecomputations (conversacional, alineado). No se detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La unica innovacion implicita es la propia receta de merge, que fusiona capacidades de razonamiento con un formato conversacional tipo Hermes.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento explicito con modo "thinking": el modelo puede emitir cadenas de pensamiento antes de la respuesta, herencia de DeepSeek-R1.
- Razonamiento de tipo chain-of-thought (CoT) para problemas de logica y matematicas.
- Capacidad de codigo inferida del linaje Llama 3.1, aunque no se documenta de forma explicita en la model card.
- Ventana de contexto larga de hasta 128k tokens segun los tags del autor.
- Formato conversacional estilo Hermes (chat template de cognitivecomputations).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que indica que puede servirse mediante APIs compatibles con OpenAI.
- No se documenta soporte de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Razonamiento asistido en local: el modelo puede generar trazas de pensamiento antes de responder, util para depuracion de problemas logicos y matematicos en entornos sin conexion, aprovechando las cuantizaciones Q4_K_M (8,4 GB) que caben en GPUs de consumo.
- Asistente conversacional privado: al ejecutarse en llama.cpp u Ollama, permite desplegar un chatbot en ingles sobre datos sensibles sin enviar informacion a la nube, con contexto largo para conversaciones extensas.
- Analisis de documentos largos: la ventana de 128k tokens declarada permite resumir o extraer informacion de contratos, manuales o articulos extensos en una sola pasada, aunque la calidad efectiva en contextos muy largos no esta verificada.
- Prototipado de agentes con razonamiento: aunque no se documenta tool calling nativo, el modo thinking puede integrarse en pipelines que parseen la traza de razonamiento para tomar decisiones en tareas de varios pasos.
- Educacion y tutoria: el modelo puede explicar paso a paso la resolucion de problemas, mostrando el razonamiento intermedio, lo que resulta util en plataformas de aprendizaje.
- Experimentacion en investigacion sobre merges: sirve como caso de estudio para evaluar como se comportan las tecnicas de merge de modelos R1 y Hermes en un tamano de ~13,7B con cuantizaciones agresivas.
- Despliegue en estaciones de trabajo sin GPU dedicada: las quants Q2_K (5,3 GB) y Q3_K_S (6,2 GB) permiten ejecucion en CPU con RAM moderada, adecuado para pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~5,3 GB; Q3_K_S ~6,2 GB; Q4_K_S ~8,0 GB; Q4_K_M ~8,4 GB; Q5_K_M ~9,8 GB; Q6_K ~11,3 GB; Q8_0 ~14,6 GB. Anadir margen para el contexto KV cache, que crece con la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q6_K y Q8_0 con contexto moderado; RTX 4080/4070 Ti (12-16 GB) para Q4_K_M y Q5_K_M; GPUs de 8 GB para Q2_K y Q3_K_S con contexto corto.
- Cabe en GPU de consumo: si, desde 8 GB de VRAM con cuantizaciones bajas; para contexto largo de 128k se necesita VRAM adicional significativa para la cache KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion GPU.
- Latencia y throughput: no disponibles. Al ser un MoE de ~13,7B totales, el rendimiento dependera del numero de parametros activos por token, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B (este) | 13,7B | 128k | MoE merge Llama 3.1 | no disponible | GGUF + safetensors en HF |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128k | Transformer denso | MIT (según linaje R1) | safetensors + GGUF |
| Hermes-3-Llama-3.1-8B | 8B | 128k | Transformer denso | Llama 3.1 Community | safetensors + GGUF |
| Llama-3.1-8B-Instruct | 8B | 128k | Transformer denso | Llama 3.1 Community | safetensors + GGUF |

La comparativa es orientativa: los datos de los modelos alternativos provienen de sus respectivas fichas publicas y no de la informacion proporcionada para este modelo. No se dispone de benchmarks comparativos directos para este merge.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Al derivar de Llama 3.1, es probable que herede la Llama 3.1 Community License, pero esto no esta verificado en la informacion disponible.
- Modelo solo en ingles: no se documenta soporte multilingue, por lo que su uso en castellano u otros idiomas producira resultados degradados.
- Es un merge no oficial: la calidad depende de la receta de fusion del autor original (DavidAU) y no de un entrenamiento supervisado verificado; puede presentar comportamientos inconsistentes.
- Riesgo de alucinacion: como todo modelo generativo, especialmente en modo thinking, puede producir trazas de razonamiento plausibles pero incorrectas.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad, especialmente en tareas de razonamiento; se recomienda Q4_K_M o superior para uso serio.
- La ventana de 128k tokens es un dato declarado en tags; no se verifica la calidad efectiva en contextos muy largos ni si el modelo fue entrenado especificamente para ellos.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes que dependan de APIs estructuradas.
- Popularidad baja (243 descargas, 1 like): poca validacion comunitaria y escasos reportes de uso en produccion.
- El repositorio incluye todas las cuantizaciones (94 GB), lo que puede complicar la descarga selectiva; conviene descargar solo el archivo GGUF deseado.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B-i1-GGUF
- Pagina de conveniencia del autor: https://hf.tst.eu/model#L3.1-MOE-2X8B-Deepseek-DeepHermes-e32-13.7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
