# jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4

## Resumen

OrcaRouter Qwen3.8 Flash-Next Uncensored ModelOpt NVFP4 es una conversión cuantizada del checkpoint abliterado Qwen3.8-Flash-Next-Uncensored de OrcaRouter, publicado por el usuario jpezzulli para su uso en cargas de trabajo agénticas locales. El modelo base es Qwen/Qwen3.8-Flash-Next, un transformer multimodal de tipo Mixture of Experts (MoE) con aproximadamente 119,6 mil millones de parámetros totales, orientado a tareas de visión-lenguaje, razonamiento y function calling. La modificación de origen elimina los mecanismos de rechazo (abliteration) del modelo original, mientras que esta publicación añade únicamente la cuantización y el empaquetado.

El aporte técnico de esta ficha es la conversión a NVFP4 mediante NVIDIA ModelOpt 0.46.0: pesos y activaciones en coma flotante de 4 bits con tamaño de grupo 16, aplicados a módulos `Linear` seleccionados. Las rutas de atención, Gated-DeltaNet, routers, expertos compartidos, hyper-connections, PLE, visión, embeddings, LM head y MTP quedan excluidas de NVFP4, y los grandes shards del embedding PLE se almacenan en FP8 E4M3. El resultado ocupa aproximadamente 135,3 GB (126 GiB) en safetensors fragmentados.

Su relevancia radica en que permite ejecutar localmente un modelo multimodal de gran tamaño con formato NVFP4, probado con la ruta nativa MTP/FR-Spec de Pennyroyal sobre una RTX PRO 6000 Blackwell. Se distribuye bajo la licencia Qwen Community License 1.0 (declarada como `other` en el Hub), con metadatos de licencia contradictorios entre el README de origen y el fichero LICENSE incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) multimodal con rutas de atencion y Gated-DeltaNet (hibrida), MTP y PLE |
| Parametros totales | 119.602.003.859 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, grupo 16) en modulos Linear seleccionados; FP8 E4M3 en shards del embedding PLE |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-license-1.0 (declarada como `other` en el Hub); el README de origen indica Apache-2.0 |
| Formato de pesos | safetensors fragmentados (sharded) |
| Tamano del repositorio | 135,2 GB (aprox. 135,3 GB / 126 GiB) |
| Modelo base | OrcaRouter/Qwen3.8-Flash-Next-Uncensored; Qwen/Qwen3.8-Flash-Next |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un Mixture of Experts multimodal. La configuracion empaquetada indica que las rutas de atencion, las rutas Gated-DeltaNet (un mecanismo de estado recurrente lineal que se combina con la atencion clasica, dando lugar a una arquitectura hibrida), los routers, los expertos compartidos, las hyper-connections, el modulo PLE, el codificador de vision, los embeddings, la LM head y el modulo MTP quedan excluidos de la cuantizacion NVFP4. La cuantizacion solo afecta a modulos `Linear` seleccionados, con pesos y activaciones en 4 bits y grupo de 16. El modelo incluye MTP (Multi-Token Prediction), que habilita decodificacion especulativa nativa en el runtime Pennyroyal/SGLang.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO) del modelo base, mas alla de que el checkpoint de origen ha sido sometido a abliteration (eliminacion de direcciones de rechazo). La contribucion del autor de esta publicacion se limita a la cuantizacion y al empaquetado compatible, sin fine-tuning adicional ni proceso de uncensoring propio. El runtime de referencia es Pennyroyal/SGLang, probado con la ruta nativa MTP/FR-Spec.

## Capacidades

- Generacion de texto multimodal (image-text-to-text): procesa entradas de imagen y texto.
- Razonamiento multi-paso con modo thinking.
- Function calling / tool calling.
- Uso en flujos aganticos con tool use y razonamiento encadenado.
- MTP (Multi-Token Prediction) para decodificacion especulativa.
- Soporte multilingue limitado a en y zh.
- Modelo abliterado: responde a peticiones que el modelo base rechazaria (orientado a investigacion de interpretabilidad, red-teaming y estudio de mecanismos de rechazo).

## Casos de uso

- Investigacion de seguridad e interpretabilidad: el checkpoint abliterado permite estudiar como se codifican las direcciones de rechazo en un MoE multimodal grande, comparando activaciones con el modelo base original.
- Red-teaming de sistemas de vision-lenguaje: se puede usar para generar intentos de jailbreak y evaluar la robustez de otros modelos o de filtros de moderacion frente a entradas de imagen y texto combinadas.
- Agentica local con razonamiento y tools: el modelo soporta tool calling y modo thinking, lo que permite construir agentes de multiples pasos que resuelven tareas con acceso a funciones externas, ejecutados en hardware local con NVFP4.
- Analisis de documentos con imagen y texto: al ser image-text-to-text, puede emplearse para extraer informacion de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos en ingles o chino.
- Generacion de contenido sin restricciones editoriales: util para investigacion creativa o escenarios donde se necesita un modelo sin capas de rechazo, siempre bajo terminos de licencia compatibles.
- Pruebas de despliegue NVFP4 en hardware Blackwell: sirve como referencia practica para validar pipelines de cuantizacion ModelOpt 0.46.0 y la ruta MTP/FR-Spec en SGLang.
- Estudio de eficiencia de cuantizacion mixta: permite medir el impacto de excluir atencion, routers y vision de NVFP4, con PLE en FP8, sobre latencia y calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que varios miembros de la comunidad han reportado que el modelo supera al checkpoint original en tareas aganticas, pero se trata de evidencia anecdotal, no de puntuaciones de benchmark. La unica evidencia practica declarada es su ejecucion en una RTX PRO 6000 Blackwell con la ruta nativa MTP/FR-Spec de Pennyroyal.

## Requisitos de hardware

- Almacenamiento: el checkpoint ocupa 135,2 GB (aprox. 135,3 GB / 126 GiB) en safetensors fragmentados, por lo que requiere un disco con al menos esa capacidad.
- VRAM estimada: no disponible como cifra cerrada; el peso NVFP4 de 4 bits mas los componentes no cuantizados (atencion, vision, embeddings, PLE en FP8) superan ampliamente los 48 GB de las GPU consumer.
- GPU probada: RTX PRO 6000 Blackwell (con la ruta FLash-Next native-MTP/FR-Spec de Pennyroyal).
- Consumer GPU: no cabe en GPUs de consumo como la RTX 4090 (24 GB) ni en una unica GPU de 48 GB sin offloading. Se requiere hardware profesional o configuraciones multi-GPU.
- Opciones de despliegue: Pennyroyal/SGLang (runtime de referencia), con soporte de offloading de PLE a NVMe mediante la configuracion documentada en el repositorio del runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4 | 119,6B | safetensors NVFP4 (4 bits) + FP8 PLE | Qwen Community License 1.0 (`other`) | Hugging Face, runtime Pennyroyal/SGLang |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4 | no disponible | NVFP4 | apache-2.0 declarada | Hugging Face |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-MLX | no disponible | MLX 4 bits | apache-2.0 declarada | Hugging Face, Apple Silicon |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | BF16 | Qwen Community License 1.0 | Hugging Face |

El autor indica que la familia Flash-Next Uncensored incluye cinco builds (BF16, GGUF, MLX, FP8 y NVFP4) recogidos en la coleccion de OrcaRouter en Hugging Face. La diferencia de esta version frente a la NVFP4 de orcarouter es la configuracion concreta de cuantizacion y el empaquetado compatible con Pennyroyal/SGLang.

## Limitaciones y advertencias

- Modelo abliterado: eliminado el rechazo ante peticiones daninas, eticas o ilegales. No apto para uso general sin moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado por la falta de benchmarks publicados que permitan estimar su fiabilidad.
- Idiomas: solo ingles y chino; no hay soporte declarado para castellano ni otras lenguas.
- Longitud de contexto: no declarada, lo que impide garantizar escenarios de contexto largo.
- Licencia ambigua: el README de origen etiqueta el modelo como Apache-2.0, mientras que el fichero LICENSE incluido es Qwen Community License 1.0. El Hub declara `other`. Hay que revisar los terminos antes de cualquier uso comercial.
- Restricciones de uso: el autor indica que los pesos son "local-only by design"; conviene verificar condiciones de redistribucion.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un multimodal entrenado principalmente en en/zh, cabe esperar sesgos culturales y linguisticos propios de esos datos.
- Requisitos de hardware elevados: no ejecutable en GPUs de consumo, lo que limita su validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4
- Modelo de origen (sin cuantizar): https://huggingface.co/OrcaRouter/Qwen3.8-Flash-Next-Uncensored
- Checkpoint base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Pennyroyal/SGLang: https://github.com/jpezzulli/sglang-rtxpro6000
- Configuracion NVMe PLE: https://github.com/jpezzulli/sglang-rtxpro6000/blob/pennyroyal-main-sm120-final/NVME-PLE.md
- Guia de lanzamiento con FR-Spec: https://github.com/jpezzulli/sglang-rtxpro6000/blob/pennyroyal-main-sm120-final/RUN.md#launch-flash-next-with-fr-spec
- Variante MLX: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-MLX
- Variante NVFP4 de OrcaRouter: https://abliteration.org/models/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Entrada en Ollama: https://ollama.com/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Blog Blackwell Runbook: https://www.orcarouter.ai/blog/qwen3-8-flash-next-uncensored-nvfp4
