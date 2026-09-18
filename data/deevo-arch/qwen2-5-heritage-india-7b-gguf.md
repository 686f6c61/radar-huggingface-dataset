# deevo-arch/qwen2.5-heritage-india-7b-gguf

## Resumen

Qwen2.5 Heritage India 7B es un ajuste fino del modelo Qwen/Qwen2.5-Coder-7B-Instruct, publicado por el usuario de Hugging Face `deevo-arch` en formato GGUF cuantizado a Q8_0. Está especializado en patrimonio indio: monumentos, sitios declarados Patrimonio de la Humanidad por la UNESCO y contexto histórico de los distintos estados de la India. El repositorio declara 7.615.616.512 parámetros (unos 7,6 mil millones) y ocupa 8,1 GB.

El ajuste se realizó mediante LoRA con rango 16 y alpha 32, posteriormente fusionado sobre los pesos base en FP16 y cuantizado con llama.cpp. La model card indica una longitud de contexto de 2.048 tokens, muy inferior a la ventana nativa del modelo base, lo que restringe su uso en conversaciones largas o en tareas que requieran contexto extenso.

Su relevancia es de nicho: proporciona un asistente conversacional ejecutable con Ollama o llama-cpp-python en hardware modesto, orientado a divulgación cultural, turismo y aplicaciones educativas. No se han publicado resultados de benchmarks, ni detalles del dataset de entrenamiento, ni mediciones de latencia, y el repositorio no cuenta con descargas ni validación de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 2.5), con RoPE, GQA, SwiGLU y RMSNorm segun la documentacion del modelo base |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens (declarado en la model card del GGUF) |
| Tipos de cuantizacion | Q8_0 (8 bits, generada con llama.cpp). No se publican otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible (la model card no declara idiomas; el contenido de especializacion es patrimonio indio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `heritage-qwen-7b-q8.gguf`); los pesos base se fusionaron en FP16 antes de cuantizar |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Metodo de ajuste | LoRA, rango 16, alpha 32, fusionado en los pesos base |
| Tamano del repositorio | 8,1 GB |
| Pipeline | text-generation |
| Compatibilidad declarada | gguf, ollama, endpoints_compatible |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso de aproximadamente 7,6 mil millones de parametros, con normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El autor no documenta ningun cambio estructural sobre el modelo base; el ajuste es puramente de pesos.

El entrenamiento consistio en un ajuste fino supervisado mediante LoRA (rango 16, alpha 32), cuyos adaptadores se fusionaron posteriormente sobre los pesos base en FP16 y se cuantizaron a Q8_0 con llama.cpp. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, el numero de epocas, la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o PPO. Tampoco se documenta el proceso de filtrado de datos ni las fuentes utilizadas para el corpus de patrimonio indio. No hay constancia de innovaciones tecnicas propias, decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte de roles `system`, `user` y `assistant` a traves de `create_chat_completion`.
- Conocimiento especializado en patrimonio cultural indio: monumentos, templos, fuertes, sitios arqueologicos y sitios UNESCO repartidos por los estados de la India.
- Redaccion de descripciones historicas y explicaciones divulgativas, segun el uso previsto en la model card y en el prompt de sistema recomendado ("historian and travel guide").
- Ejecucion local en CPU o GPU mediante llama.cpp y Ollama, sin necesidad de conexion a servicios externos.
- Compatibilidad con Inference Endpoints (etiqueta `endpoints_compatible`) y con el formato de Ollama (`ollama run hf.co/...`).
- No se documenta soporte explicito de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido. Al derivar de Qwen2.5-Coder-Instruct, el modelo base si incorpora capacidades de codigo y de uso de herramientas, pero la model card de este ajuste no las confirma ni las evalua.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Guia turistica conversacional para monumentos indios: el modelo acepta un prompt de sistema que lo define como historiador y guia de viajes, y responde a preguntas sobre sitios concretos, por ejemplo el Templo del Sol de Konark. Es adecuado porque el ajuste esta orientado especificamente a ese dominio y el prompt recomendado ya esta documentado.
- Audioguias y aplicaciones moviles offline: al distribuirse como GGUF Q8_0 de 8,1 GB, puede empaquetarse en una app de escritorio o en un servicio local sin dependencia de API externa, con la ventaja de no exponer datos de usuario.
- Material didactico para educacion patrimonial: generacion de fichas, resumenes y preguntas de comprension sobre sitios UNESCO para cursos escolares o universitarios, con supervision humana obligatoria dado que el modelo puede cometer errores historicos.
- Enriquecimiento de metadatos en catalogos de museos y archivos: el modelo puede redactar descripciones preliminares o resúmenes a partir de campos estructurados, siempre que el texto de entrada quepa en los 2.048 tokens de contexto.
- Prototipado rapido en Google Colab o Kaggle: el ejemplo de la model card usa `Llama.from_pretrained` con `n_gpu_layers=-1`, lo que permite arrancar el modelo en un notebook sin descarga manual ni infraestructura dedicada.
- Chatbot de atencion al visitante en portales de turismo estatal: desplegado como servidor llama.cpp o via Ollama, puede atender consultas frecuentes sobre horarios, historia y ubicacion de monumentos, con derivacion a agentes humanos cuando la consulta salga del dominio.
- Referencia metodologica para investigadores: el repositorio documenta una receta reproducible de ajuste LoRA (rango 16, alpha 32) sobre un modelo Coder de 7 B, util como punto de partida para replicar fine-tuning de dominio en otras tradiciones culturales.
- Experimentacion con destilacion o evaluacion de sesgos culturales: permite estudiar como un ajuste de nicho sobre un corpus nacional afecta al rendimiento general del modelo base, siempre que se realicen las evaluaciones oportunas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q8_0 ocupan aproximadamente 8,1 GB. Con la ventana de 2.048 tokens y lotes pequenos, el cache KV anade un margen reducido (del orden de 100-200 MB en FP16, estimacion a partir de la configuracion habitual de Qwen2.5-7B). En la practica, se necesita un total de 9-10 GB de VRAM para descargar todas las capas en GPU.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, A100 (40 GB o 80 GB) y H100. Cualquier acelerador con 12 GB o mas puede alojar el modelo completo.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas. En GPUs de 8 GB es posible hacer offload parcial de capas (`n_gpu_layers` con un valor intermedio) dejando el resto en CPU, con la consiguiente perdida de velocidad.
- Ejecucion en CPU: viable con 9-10 GB de RAM libre, aunque Q8_0 es mas lento que las cuantizaciones de 4 bits en este escenario. No se han publicado mediciones de tokens por segundo.
- Opciones de despliegue: Ollama (`ollama run hf.co/deevo-arch/qwen2.5-heritage-india-7b-gguf:heritage-qwen-7b-q8.gguf`), llama.cpp y llama-cpp-python (con `n_ctx=2048`), servidor de llama.cpp con API compatible con OpenAI, y LM Studio. Los motores orientados a safetensors puros, como TGI, no son la via natural para este repositorio; vLLM ha reducido el soporte de GGUF, por lo que se desaconseja como ruta principal.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion y disponibilidad |
|---|---|---|---|---|---|
| deevo-arch/qwen2.5-heritage-india-7b-gguf | ~7,6 B | 2.048 tokens | apache-2.0 | GGUF Q8_0 | Patrimonio indio; 0 descargas, 1 like, sin benchmarks |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 tokens nativos | apache-2.0 | safetensors, GGUF oficiales | Generacion de codigo e instrucciones generales; modelo base de este ajuste |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens (ampliable con YaRN) | apache-2.0 | safetensors, GGUF | Proposito general, mejor cobertura multilingue declarada |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 tokens | apache-2.0 | safetensors, GGUF | Proposito general, ecosistema amplio de cuantizaciones comunitarias |

La diferencia principal frente a las tres alternativas es la ventana de contexto: 2.048 tokens frente a 32.768. A cambio, este ajuste aporta especializacion de dominio en patrimonio indio, a costa de no disponer de evaluaciones publicas que cuantifiquen la mejora.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 2.048 tokens, declarada en la model card. Conversaciones de mas de unas pocas intervenciones o documentos largos provocaran truncamiento o perdida de informacion.
- Sin benchmarks publicados: no existe evidencia cuantitativa de que el ajuste mejore al modelo base en tareas de patrimonio indio ni de cuanto degrada sus capacidades originales.
- Riesgo de olvido catastrofico: al derivar de un modelo especializado en codigo (Qwen2.5-Coder-7B-Instruct), un ajuste de dominio con LoRA de rango 16 puede reducir el rendimiento en generacion de codigo y en tareas generales. No hay evaluaciones que lo confirmen o lo descarten.
- Riesgo de alucinacion historica: en datos concretos como fechas de construccion, dinastias, inscripciones UNESCO o ubicaciones administrativas, el modelo puede generar afirmaciones plausibles pero falsas. En publicaciones divulgativas o materiales educativos es imprescindible la verificacion con fuentes primarias.
- Sesgos potenciales: la model card no documenta la composicion del dataset de entrenamiento ni su procedencia. Es probable una sobrerrepresentacion de los estados o monumentos mejor documentados en las fuentes, con menor cobertura de regiones con menos material disponible en linea.
- Idiomas no declarados: no se especifica si el modelo responde en ingles, hindi, otras lenguas indias o en varios idiomas. No se debe asumir cobertura multilingue sin probarla.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia, y se indiquen los cambios realizados. Conviene verificar ademas las condiciones del modelo base, que tambien es apache-2.0.
- Solo se publica la cuantizacion Q8_0: no hay variantes en 4 o 5 bits en el repositorio. Reconvertir a cuantizaciones menores exigiria hacerlo desde estos pesos ya cuantizados, con la perdida adicional de calidad que ello implica.
- Ausencia de validacion externa: 0 descargas y 1 like en el momento de redactar esta ficha. No hay issues, informes de terceros ni evaluaciones independientes.
- Sin informacion sobre el proceso de entrenamiento: no se publican hiperparametros completos, numero de pasos ni criterios de parada, lo que dificulta reproducir o auditar el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deevo-arch/qwen2.5-heritage-india-7b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Ejecucion con Ollama: `ollama run hf.co/deevo-arch/qwen2.5-heritage-india-7b-gguf:heritage-qwen-7b-q8.gguf`
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su dataset o sus evaluaciones; los unicos enlaces verificables son los del repositorio y los de las herramientas citadas.
