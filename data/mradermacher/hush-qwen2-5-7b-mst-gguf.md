# mradermacher/Hush-Qwen2.5-7B-MST-GGUF

## Resumen

Hush-Qwen2.5-7B-MST-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Hush-Qwen2.5-7B-MST, publicado por el usuario mradermacher. El modelo subyacente es un merge (fusión) construido con mergekit a partir de Qwen2.5-7B, orientado a conversación y con etiqueta de idioma inglés. Esta versión GGUF no aporta pesos nuevos: su valor es empaquetar el merge en una docena de niveles de cuantización listos para llama.cpp y derivados.

El interés práctico radica en que permite ejecutar un modelo de 7.600 millones de parámetros en hardware de consumo, desde 3,1 GB con Q2_K hasta 8,2 GB con Q8_0. Al tratarse de una cuantización de un merge no oficial, no hay documentación de arquitectura, dataset de entrenamiento ni evaluación publicada por el autor del merge ni por el cuantizador.

La ficha, por tanto, describe con rigor lo que se puede verificar (tamaños, formatos, parámetros, origen) y marca explícitamente como no disponible todo lo que no consta en la información proporcionada, incluyendo licencia, contexto y benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B; no confirmada en la model card) |
| Parametros totales | 7.612.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |
| Modelo base | marcuscedricridia/Hush-Qwen2.5-7B-MST |
| Metodo de creacion | mergekit (merge) y posterior cuantizacion estatica |
| Tamano del repo | 68,1 GB |
| Descargas / likes | 80 / 1 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del merge más allá de su origen: la model card indica que se generó con mergekit a partir de Qwen2.5-7B, lo que implica una arquitectura transformer decoder-only con aproximadamente 7.600 millones de parámetros. No se documentan los modelos fuente del merge, los ratios de fusión, la composición del dataset ni si hubo fases de RLHF, DPO o SFT posteriores.

Tampoco se detalla el proceso de cuantización más allá de que son cuantizaciones estáticas (no imatrix/weighted), generadas con quantize_version 2 y salida en formato HF convertida a GGUF. El autor advierte que las cuantizaciones ponderadas con imatrix no están disponibles por el momento y que, si no aparecen en una semana, probablemente no las planifique.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatible con endpoints de inferencia (`endpoints_compatible`), lo que permite desplegarlo mediante Inference Endpoints.
- Ejecutable en llama.cpp, Ollama y otros runners compatibles con GGUF.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado local en estaciones de trabajo: con la cuantización Q4_K_M (4,8 GB) el modelo cabe en GPUs de consumo de 8 GB o en CPU con RAM suficiente, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Despliegue en entornos con recursos limitados: Q2_K (3,1 GB) o Q3_K_S (3,6 GB) permiten ejecutar el modelo en portátiles o mini-PC, a costa de una pérdida de calidad no cuantificada por el autor.
- Evaluación comparativa de merges: al ofrecer doce niveles de cuantización del mismo merge, sirve para medir cómo degrada cada nivel la calidad en una tarea concreta antes de fijar una cuantización para producción.
- Integración en pipelines de CI/CD para pruebas de regresión conversacional: el formato GGUF y el tamaño contenido facilitan levantar el modelo en contenedores efímeros y verificar respuestas esperadas.
- Base para fine-tuning ligero o experimentación con adaptadores: el modelo base en safetensors (7.612 millones de parámetros) puede servir de punto de partida, aunque la licencia no está confirmada y conviene verificarla antes de uso comercial.
- Chatbot interno de bajo coste en inglés: dado que el modelo solo declara soporte de inglés, es adecuado para asistentes internos en ese idioma, no para atención al cliente multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Añadir margen para el contexto y el overhead del runtime (habitualmente 1-2 GB adicionales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones altas; A100/H100 solo si se necesita throughput elevado o contexto muy largo.
- Cabe en GPU de consumo: sí, desde Q4_K_M en una GPU de 8 GB y Q8_0 en una de 12 GB; las cuantizaciones bajas también funcionan en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hush-Qwen2.5-7B-MST-GGUF | 7,61 B | no disponible | no disponible | GGUF | Merge no oficial de Qwen2.5-7B cuantizado |
| Qwen2.5-7B-Instruct (oficial) | 7,61 B | 32.768 tokens (según documentación oficial de Qwen2.5) | Apache 2.0 (según documentación oficial) | safetensors, GGUF | Modelo oficial con evaluación publicada |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens (según documentación oficial) | Apache 2.0 (según documentación oficial) | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |

La comparación con Qwen2.5-7B-Instruct y Mistral-7B-Instruct se basa en datos públicos de sus respectivas documentaciones; para el modelo de esta ficha no hay datos de contexto, licencia ni rendimiento que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; verificar antes de desplegar en producción.
- Modelo no oficial: es un merge comunitario sin evaluación publicada, por lo que su calidad frente al Qwen2.5-7B original es desconocida.
- Solo declara inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada.
- Riesgo de alucinación y sesgos: no evaluado por el autor; al derivar de Qwen2.5, hereda los sesgos de sus datos de entrenamiento, no documentados aquí.
- Cuantizaciones bajas (Q2_K, Q3_K_M) degradan la calidad de forma apreciable; el autor recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que limita la calidad máxima alcanzable en tamaños pequeños.
- El repositorio ocupa 68,1 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Hush-Qwen2.5-7B-MST-GGUF
- Modelo base: https://huggingface.co/marcuscedricridia/Hush-Qwen2.5-7B-MST
- Página de descargas del cuantizador: https://hf.tst.eu/model#Hush-Qwen2.5-7B-MST-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
