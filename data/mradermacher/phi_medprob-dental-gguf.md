# mradermacher/Phi_medprob-dental-GGUF

## Resumen

Phi_medprob-dental-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo emilykang/Phi_medprob-dental, publicadas por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo subyacente es un ajuste fino de la familia Phi (2.779.683.840 parametros, aproximadamente 2,78 mil millones) orientado al ambito dental y medico, segun indica el nombre del repositorio. Esta publicacion no introduce arquitectura nueva: su valor esta en ofrecer los pesos originales en formatos comprimidos listos para inferencia local.

El repositorio incluye cuantizaciones estaticas que van desde Q2_K (1,2 GB) hasta f16 (5,7 GB), pasando por opciones intermedias como IQ4_XS, Q4_K_M, Q5_K_M y Q8_0. Adicionalmente, el autor remite a un repositorio hermano con cuantizaciones ponderadas mediante imatrix, que suelen ofrecer mejor calidad por bit. El modelo base esta etiquetado unicamente en ingles y no declara licencia en la informacion disponible.

La relevancia de esta ficha radica en que permite ejecutar un modelo especializado en dominio sanitario en hardware de consumo, algo imposible con los pesos originales en precision completa. No obstante, la ausencia de model card detallada, benchmarks y licencia explicita obliga a tratar el modelo con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Phi; detalles no disponibles) |
| Parametros totales | 2.779.683.840 (aproximadamente 2,78 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base emilykang/Phi_medprob-dental es un ajuste fino de la familia Phi, una arquitectura transformer densa de aproximadamente 2,78 mil millones de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El nombre sugiere una especializacion en contenido medico y dental, presumiblemente mediante fine-tuning supervisado sobre datos del dominio, pero esta afirmacion no puede confirmarse con la informacion proporcionada.

Las cuantizaciones de mradermacher se generan con llama.cpp y emplean cuantizacion estatica de tensores (segun los metadatos internos del repositorio, quantize_version 2 y output_tensor_quantised 1). Existe ademas una variante i1 con cuantizacion ponderada por imatrix, publicada en un repositorio separado, que habitualmente reduce la perplejidad frente a cuantizaciones estaticas del mismo tamano. No se documentan innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles, presumiblemente orientada al dominio medico y dental por el ajuste fino del modelo base.
- Respuesta a preguntas y conversacion multi-turno en el ambito sanitario, segun la especializacion sugerida por el nombre del modelo.
- Capacidad de razonamiento general heredada de la familia Phi, aunque no verificada mediante benchmarks en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun las etiquetas del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de consulta odontologica local: el modelo puede desplegarse con llama.cpp u Ollama en un portatil con GPU de consumo para responder preguntas frecuentes sobre higiene dental, procedimientos y terminologia clinica, sin enviar datos a servicios externos.
- Prototipado de triaje de sintomas dentales: integrado en una aplicacion de chat, el modelo puede clasificar consultas iniciales de pacientes (dolor, sangrado, sensibilidad) y derivar al profesional adecuado, siempre con supervision humana.
- Generacion de material educativo para clinicas: redaccion de borradores de folletos y articulos divulgativos sobre salud bucodental, revisados posteriormente por personal sanitario.
- Soporte a la documentacion clinica: resumen y estructura de notas de consulta en ingles, aprovechando la especializacion del ajuste fino y el bajo coste de inferencia de un modelo de 2,78 mil millones de parametros.
- Evaluacion de modelos especializados en dominios verticales: investigadores pueden comparar la calidad de un fine-tuning de nicho frente a modelos generalistas del mismo tamano usando las cuantizaciones Q4_K_M o Q5_K_M como referencia reproducible.
- Despliegue en entornos con recursos limitados o air-gapped: al caber en 1,8 GB en Q4_K_M, el modelo puede ejecutarse en equipos sin conexion en clinicas rurales o entornos con requisitos estrictos de privacidad.
- Educacion y formacion de estudiantes de odontologia: simulacion de preguntas y respuestas sobre casos clinicos en ingles, con la advertencia de que las respuestas requieren validacion profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en Q2_K, 2,5 GB en Q4_K_M, 3,5 GB en Q6_K y 6,5 GB en f16, incluyendo overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para escenarios de mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas (GTX 1650 en adelante) con cuantizaciones Q4 o inferiores; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para vLLM o TGI seria necesario convertir a safetensors o usar el modelo base original.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por el tamano del modelo, se espera una generacion fluida en GPU de consumo, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phi_medprob-dental-GGUF | 2,78 mil millones | no disponible | no disponible | GGUF | Hugging Face (55 descargas) |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens (128K con RoPE) | Apache 2.0 | safetensors, GGUF | Amplia, con cuantizaciones de multiples autores |
| Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Amplia, ecosistema maduro |
| Phi-3.5-mini-instruct | 3,82 mil millones | 128.000 tokens | MIT | safetensors, GGUF | Amplia, soporte oficial en multiples runtimes |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento del modelo evaluado para comparar calidad. La principal desventaja de Phi_medprob-dental-GGUF frente a estas alternativas es la falta de licencia explicita y de documentacion sobre contexto y entrenamiento.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Modelo especializado en dominio sanitario sin validacion clinica documentada: no debe usarse como sustituto del juicio profesional ni para diagnostico o tratamiento.
- Riesgo elevado de alucinacion en terminologia medica y recomendaciones clinicas, especialmente con cuantizaciones agresivas como Q2_K o Q3_K_S.
- Soporte unicamente en ingles: no apto para interacciones con pacientes en castellano sin traduccion intermedia.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas que requieran ventanas largas.
- Sin benchmarks publicados: imposible estimar su calidad frente a alternativas generalistas o especializadas.
- Repositorio con muy poca traccion (55 descargas, 0 likes): no ha sido validado por la comunidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior.
- El modelo base no incluye model card detallada en la informacion disponible, lo que impide conocer sesgos, datos de entrenamiento y limitaciones declaradas por el autor original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medprob-dental-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medprob-dental
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Phi_medprob-dental-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Phi_medprob-dental-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
