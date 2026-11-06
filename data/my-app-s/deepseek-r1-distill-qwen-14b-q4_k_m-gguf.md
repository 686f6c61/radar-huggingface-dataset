# my-app-s/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-14B-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo DeepSeek-R1-Distill-Qwen-14B, un modelo de lenguaje de 14.770.033.664 parametros (aproximadamente 14,8 mil millones) obtenido mediante destilacion del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Qwen2. El repositorio lo publica el usuario `my-app-s` (la model card referencia el espacio `doodums`, lo que sugiere una conversion previa) y se ha generado con la herramienta GGUF-my-repo de ggml.ai a partir del checkpoint de Unsloth. Su proposito es ofrecer las capacidades de razonamiento del modelo original en un unico fichero Q4_K_M ejecutable con llama.cpp en hardware de consumo.

La relevancia de esta ficha radica en que el modelo base pertenece a la familia de destilados de DeepSeek-R1, disenados para reproducir el comportamiento de razonamiento explicito (cadenas de pensamiento largas) en modelos de menor tamano. La cuantizacion Q4_K_M reduce el peso del checkpoint a unos 9 GB, lo que permite desplegarlo en GPU de consumo con 12-16 GB de VRAM o incluso en CPU con suficiente RAM, a cambio de una perdida de precision que no esta cuantificada en la informacion disponible.

No obstante, conviene senalar que la informacion proporcionada es muy escasa: no hay pipeline declarado, no se publican benchmarks, no se detalla la composicion del dataset de destilacion ni los hiperparametros de la cuantizacion. Esta ficha se limita, por tanto, a lo que puede deducirse del identificador del modelo, del modelo base referenciado y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun los tags `qwen2` y el modelo base) |
| Parametros totales | 14.770.033.664 (aproximadamente 14,8 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | en (segun la model card y los tags); el modelo base podria tener capacidades multilingues no declaradas aqui |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `deepseek-r1-distill-qwen-14b-q4_k_m.gguf`); el modelo base esta en safetensors |
| Tamano del repositorio | 9,0 GB |
| Libreria declarada | transformers (tag), aunque el formato real es GGUF para llama.cpp |
| Modelo base | unsloth/DeepSeek-R1-Distill-Qwen-14B |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre Qwen2-14B. La arquitectura subyacente es un transformer decoder-only con atencion causal estandar, propio de la familia Qwen2, y el proceso de destilacion consiste en entrenar este modelo para imitar las trayectorias de razonamiento del modelo profesor DeepSeek-R1 (que emplea cadenas de pensamiento largas antes de emitir la respuesta final). No se dispone en la informacion proporcionada del numero de tokens de destilacion, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO posteriores.

La innovacion tecnica destacable no esta en la arquitectura, sino en el formato: esta publicacion es una conversion a GGUF con cuantizacion Q4_K_M realizada mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai. Q4_K_M es una cuantizacion de 4 bits con escalas por bloque (k-quants), que mantiene los tensores mas sensibles en mayor precision. No se documentan en el repositorio los detalles exactos de la conversion (version de llama.cpp, calibracion, verificacion de perplejidad).

## Capacidades

- Generacion de texto y razonamiento explicito: al ser un destilado de R1, el modelo esta disenado para producir cadenas de pensamiento antes de la respuesta final.
- Razonamiento matematico y logico, heredado del entrenamiento de destilacion de R1 (no cuantificado en esta ficha).
- Generacion de codigo: capacidad esperable por la familia Qwen2 y el entrenamiento de R1, aunque no hay evaluacion publicada en este repositorio.
- Conversacion multi-turno: el tag `conversational` sugiere soporte de chat, si bien no se detalla la plantilla de chat en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: plausible por el modo de razonamiento del modelo base, pero no documentado en este repositorio.
- Capacidades multilingues: la model card declara unicamente `en`; no se confirman otros idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible; el modo de razonamiento es el del modelo base, no una funcionalidad anadida en esta cuantizacion.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas paso a paso generando una cadena de pensamiento, y la cuantizacion Q4_K_M permite ejecutarlo en una estacion de trabajo con GPU de 16 GB sin depender de la nube.
- Generacion de codigo en entornos con requisitos de privacidad: al ser un fichero GGUF ejecutable con llama.cpp, puede desplegarse en maquinas aisladas sin conexion, lo que encaja en equipos que no pueden enviar codigo a APIs externas.
- Prototipado de agentes de razonamiento: la naturaleza destilada de R1 facilita experimentar con pipelines de razonamiento multi-paso (planificacion, verificacion, correccion) en hardware modesto antes de escalar a modelos mayores.
- Educacion y tutoria automatizada: el modelo puede explicar el razonamiento detras de una respuesta, lo que resulta util en asistentes de estudio que muestran los pasos intermedios.
- Analisis de documentos con contexto moderado: para tareas de resumen y extraccion sobre textos que quepan en la ventana de contexto del modelo base, la version cuantizada ofrece un coste de inferencia bajo en CPU o GPU de consumo.
- Evaluacion comparativa de cuantizaciones: este repositorio sirve como referencia para medir la degradacion de calidad de Q4_K_M frente al checkpoint original en tareas de razonamiento, un caso de uso habitual en equipos de infraestructura de IA.
- Despliegue en dispositivos edge con llama.cpp: el formato GGUF y el tamano de 9 GB permiten servir el modelo en servidores pequenos o en portatiles con RAM suficiente, con `llama-server` como backend HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas de perplejidad para la cuantizacion Q4_K_M, ni comparaciones con el checkpoint original en safetensors.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 9-10 GB para los pesos, mas overhead de contexto KV; en la practica, unos 10-12 GB para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 40 GB, H100; tambien vale una RTX 3060 de 12 GB con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM usando Q4_K_M y ventanas de contexto cortas; en 8 GB no cabe sin cuantizaciones mas agresivas no publicadas en este repositorio.
- Ejecucion en CPU: viable con llama.cpp si se dispone de al menos 16 GB de RAM; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y otros runners compatibles con GGUF; vLLM y TGI no son la via natural para este fichero, aunque podrian servir el modelo base en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-Q4_K_M-GGUF (este) | 14,8 B | no disponible | GGUF Q4_K_M | apache-2.0 | Cuantizacion comunitaria; sin benchmarks publicados |
| unsloth/DeepSeek-R1-Distill-Qwen-14B (base) | 14,8 B | no disponible | safetensors | apache-2.0 | Checkpoint de referencia; requiere mas VRAM |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 B (aproximado) | no disponible | safetensors / GGUF | apache-2.0 (segun familia) | Menor tamano, menor calidad esperada en razonamiento |
| DeepSeek-R1-Distill-Llama-8B | 8 B (aproximado) | no disponible | safetensors / GGUF | licencia Llama (segun familia) | Alternativa de tamano similar con licencia distinta |

La comparativa se limita a la familia de destilados de DeepSeek-R1 porque no se dispone de datos de rendimiento de este repositorio para contrastar con modelos de otros linajes.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: Q4_K_M introduce degradacion respecto al checkpoint en safetensors; no se ha publicado la magnitud de esa perdida en tareas de razonamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y especialmente relevante en cadenas de razonamiento largas, donde errores intermedios pueden propagarse a la respuesta final.
- Sesgos: no documentados en la informacion proporcionada; el modelo base hereda los sesgos de sus datos de entrenamiento y destilacion.
- Idioma: la model card declara solo `en`; el uso en castellano no esta validado y puede degradar la calidad.
- Contexto: no se especifica la longitud de contexto soportada en este repositorio; conviene consultar la model card del modelo base antes de desplegar.
- Licencia: apache-2.0 permite uso comercial, pero el repositorio es una conversion no oficial; se recomienda verificar la trazabilidad y la licencia del checkpoint original de DeepSeek y de Unsloth.
- Repositorio de baja actividad: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado; para produccion es preferible partir del modelo base o de conversiones GGUF de referencia.
- Sin garantias de soporte: al ser una cuantizacion comunitaria, no hay canal de soporte ni actualizaciones garantizadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/my-app-s/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-14B
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Repositorio DeepSeek-R1 (referencia del modelo profesor): https://github.com/deepseek-ai/DeepSeek-R1
