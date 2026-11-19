# arifnurrohim/L3-Umbral-Mind-RP-v0.3-8B-Q8_0-GGUF

## Resumen
L3-Umbral-Mind-RP-v0.3-8B-Q8_0-GGUF es una cuantizacion en formato GGUF (Q8_0) del modelo Casual-Autopsy/L3-Umbral-Mind-RP-v0.3-8B, un modelo de 8.030.261.248 parametros derivado de la familia Llama 3 y orientado a generacion de texto conversacional, roleplay (RP) y narrativa interactiva. Lo publica el usuario arifnurrohim en Hugging Face y el proceso de conversion se ha realizado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, por lo que el artefacto esta pensado para inferencia local con llama.cpp y herramientas compatibles.

El modelo base es un merge construido con mergekit y lazymergekit, lo que indica una fusion de pesos de varios modelos en lugar de un entrenamiento desde cero. Su proposito es ofrecer respuestas coherentes y estilisticamente ricas en conversaciones de rol, con etiquetas explicitas de contenido NSFW y not-for-all-audiences. La licencia heredada es llama3 y el unico idioma declarado es el ingles.

Esta ficha se centra en el artefacto GGUF publicado, que es una cuantizacion de 8 bits del modelo original. No se dispone de informacion publica sobre el dataset de mezcla, los hiperparametros del merge ni resultados de evaluacion, por lo que los apartados correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3, segun licencia y nomenclatura); detalles del merge no disponibles |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; los ejemplos de la model card usan `-c 2048` |
| Tipos de cuantizacion | Q8_0 (este repositorio); el modelo base admite otras cuantizaciones GGUF generadas con llama.cpp |
| Idiomas soportados | ingles (en) |
| Licencia | llama3 |
| Formato de pesos | GGUF (fichero `l3-umbral-mind-rp-v0.3-8b-q8_0.gguf`); el modelo base en safetensors/transformers |
| Tamano del repositorio | 8,5 GB |
| Pipeline | text-generation |
| Modelo base | Casual-Autopsy/L3-Umbral-Mind-RP-v0.3-8B |

## Arquitectura y entrenamiento
El modelo base es un merge realizado con mergekit y lazymergekit, una tecnica que combina los pesos de varios modelos preentrenados o ajustados para obtener un modelo resultante sin un ciclo de entrenamiento completo. La nomenclatura L3 sugiere que los componentes de la mezcla pertenecen a la familia Llama 3, y la licencia llama3 es coherente con esa ascendencia. No se ha publicado informacion sobre que modelos concretos se fusionaron, que metodo de merge se aplico (SLERP, TIES, DARE, passthrough, etc.) ni que pesos relativos se asignaron a cada componente.

Tampoco hay datos publicados sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion como RLHF o DPO, ni innovaciones tecnicas adicionales. El artefacto de este repositorio es unicamente una conversion a GGUF Q8_0 del modelo base, generada con llama.cpp mediante el espacio GGUF-my-repo; no implica reentrenamiento ni modificacion de pesos mas alla de la cuantizacion.

## Capacidades
- Generacion de texto conversacional en ingles, con enfasis en estilo narrativo y de roleplay.
- Roleplay multi-turno y mantenimiento de personajes, segun las etiquetas rp, roleplay y role-play del repositorio.
- Generacion de contenido para adultos y tematicas NSFW, marcadas explicitamente con not-for-all-audiences y nsfw.
- Inferencia local mediante llama.cpp, con soporte de CLI y servidor HTTP compatible con la API de OpenAI a traves de llama-server.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles declarado.

## Casos de uso
- Roleplay conversacional local: el modelo esta disenado para mantener personajes y estilo narrativo en conversaciones multi-turno; se desplegaria con llama-server y un frontend de chat, usando el contexto indicado en la invocacion (`-c 2048` en los ejemplos del autor).
- Escritura creativa asistida: generacion de dialogos, descripciones y tramas para ficcion interactiva o novelas, aprovechando el ajuste del merge hacia prosa narrativa.
- Motores de historias interactivas: integracion en videojuegos o plataformas de ficcion ramificada donde el modelo genera respuestas de personajes no jugadores en tiempo real sobre hardware local.
- Prototipado de chatbots con personalidad: experimentacion con prompts de sistema y tecnicas de character card sin depender de APIs externas, gracias al formato GGUF y a la ejecucion con llama.cpp.
- Investigacion sobre merges de modelos: el artefacto permite comparar el comportamiento del merge frente a sus componentes originales en tareas de generacion creativa, aunque sin datos publicados del proceso de mezcla.
- Despliegue en entornos con GPU de consumo: al ser una cuantizacion Q8_0 de un modelo de 8B, puede ejecutarse en estaciones de trabajo con GPU de gama alta para consumo o con CPU y suficiente RAM, lo que facilita pruebas sin infraestructura en la nube.
- Generacion de contenido NSFW controlada en entornos privados: el modelo admite tematicas para adultos, lo que lo hace util en plataformas de ficcion para adultos que operen en local y asuman las responsabilidades legales correspondientes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para Q8_0: aproximadamente 8,5 GB solo para los pesos, mas overhead de contexto KV; en la practica se recomienda entre 10 y 12 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, L4, A100 o H100 para despliegues con mayor concurrencia; tambien es viable en GPUs de 12 GB o mas con contexto reducido.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con margen ajustado, en RTX 4080 de 16 GB; en GPUs de 8 GB no cabe en Q8_0 y requeriria cuantizaciones menores del modelo base.
- CPU: ejecutable con llama.cpp en CPU con al menos 10-12 GB de RAM libre, con latencia notablemente mayor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), y otros runners compatibles con GGUF; los ejemplos del autor usan llama-server con `-c 2048`.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| L3-Umbral-Mind-RP-v0.3-8B-Q8_0-GGUF | 8,03 B | no disponible | GGUF Q8_0 | llama3 | Roleplay y narrativa, merge |
| Modelo base Casual-Autopsy/L3-Umbral-Mind-RP-v0.3-8B | 8,03 B | no disponible | safetensors (transformers) | llama3 | Roleplay y narrativa, merge |
| Llama 3 8B Instruct (Meta) | 8 B | 8.192 tokens | safetensors, GGUF | llama3 | Asistente general |
| Mistral 7B Instruct | 7,2 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Asistente general |

La comparacion con Llama 3 8B Instruct y Mistral 7B Instruct se ofrece como referencia de categoria y tamano; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias
- El modelo esta marcado como not-for-all-audiences y nsfw: puede generar contenido para adultos y no es apto para menores ni para entornos sin moderacion.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Al ser un merge sin datos publicados de entrenamiento ni evaluacion, el riesgo de alucinacion y de respuestas incoherentes en dominios factuales es alto; no es adecuado para tareas de precision como codigo, matematicas o recuperacion de hechos.
- La licencia llama3 impone condiciones de uso, incluida la politica de uso aceptable de Meta; es necesario revisar sus restricciones antes de un uso comercial.
- No se declara soporte de tool calling ni de agentes; no debe asumirse su uso en pipelines que requieran function calling.
- La cuantizacion Q8_0 introduce una perdida minima pero no nula respecto al modelo original en safetensors; para evaluaciones finas conviene usar el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su calidad.
- La model card del repositorio GGUF es una plantilla autogenerada por GGUF-my-repo y no aporta informacion adicional sobre el modelo base; se recomienda consultar la model card original.

## Enlaces
- Repositorio GGUF: https://huggingface.co/arifnurrohim/L3-Umbral-Mind-RP-v0.3-8B-Q8_0-GGUF
- Modelo base: https://huggingface.co/Casual-Autopsy/L3-Umbral-Mind-RP-v0.3-8B
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Repositorio mergekit: https://github.com/arcee-ai/mergekit
