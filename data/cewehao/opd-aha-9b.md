# CewEhao/OPD-Aha-9B

## Resumen

OPD-Aha-9B es un modelo multimodal de visión y lenguaje (image-text-to-text) desarrollado por el usuario CewEhao y publicado en HuggingFace. Se construye mediante ajuste fino sobre Qwen/Qwen3.5-9B, un modelo base de aproximadamente 9.400 millones de parámetros, y su objetivo declarado es mejorar la percepción visual de grano fino y el razonamiento matemático multimodal. El modelo forma parte del framework OPD-Aha (On-Policy Self-Distillation), cuyo código está disponible en GitHub.

La innovación principal es el método de entrenamiento: destilación on-policy autodirigida con un profesor visual congelado (frozen visual teacher) y una entrada visual contrafactual, de forma que el aprendizaje se concentre en la evidencia visual que realmente modifica la distribución del profesor. Los tags del repositorio mencionan también aprendizaje por refuerzo (reinforcement-learning) como parte del pipeline.

El modelo es relevante para quienes necesitan un VLM compacto (9,4B parámetros) especializado en detalles visuales finos y tareas matemáticas sobre imágenes, con licencia Apache-2.0 y pesos en safetensors, lo que facilita su integración en pipelines con transformers o vLLM. No se han publicado métricas numéricas ni detalles completos de arquitectura o contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de vision + decoder de lenguaje) heredada de Qwen/Qwen3.5-9B; detalle de capas no disponible |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 18,8 GB |
| Fecha de publicacion | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

OPD-Aha-9B es un modelo de lenguaje y visión basado en un transformer multimodal: hereda la arquitectura de Qwen3.5-9B, que combina un codificador visual con un decodificador de lenguaje (la model card enlaza con el ecosistema Qwen3-VL). El número exacto de capas, dimensión oculta, número de cabezas de atención, resolución de imagen soportada y longitud de contexto no se detallan en la información proporcionada, por lo que se marcan como no disponibles.

El entrenamiento se basa en un framework de destilación on-policy autodirigida (On-Policy Self-Distillation). El pipeline utiliza un profesor visual congelado junto con una entrada visual contrafactual: el alumno genera sus propias trayectorias (on-policy) y la señal de aprendizaje se concentra en la evidencia visual que desplaza la distribución del profesor. Los tags del modelo mencionan además aprendizaje por refuerzo, y las dependencias declaradas incluyen verl (framework de RL para LLMs), vLLM y el proyecto Vision-OPD. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El repositorio de código incluye scripts de entrenamiento, fusión de checkpoints, inferencia y evaluación.

## Capacidades

- Generación de texto e interacción conversacional (tag `conversational`), en inglés.
- Comprensión de imagen y texto de forma conjunta (pipeline `image-text-to-text`).
- Percepción visual de grano fino: el objetivo declarado del ajuste es la comprensión de detalles visuales pequeños o sutiles.
- Razonamiento matemático multimodal: la evaluación del proyecto incluye MathVista, MathVerse, WeMath, MathVision y DynaMath, lo que indica capacidad para resolver problemas matemáticos planteados sobre imágenes.
- Evaluación de percepción fina soportada por el proyecto: V*Bench, HR-Bench, MME-RealWorld y ZoomBench.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere despliegue en infraestructura de inferencia gestionada.
- Servicio mediante vLLM a través del script `scripts/serve_model.sh` del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponible; solo se documenta entrada de imagen y texto.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Inspección visual de precisión en documentación técnica: el modelo está entrenado específicamente para detectar detalles finos en imágenes (el proyecto evalúa en V*Bench y HR-Bench), por lo que encaja en la revisión de planos, esquemas o capturas de alta resolución donde los elementos relevantes ocupan pocos píxeles.
- Resolución de problemas matemáticos sobre figuras: dado que la evaluación cubre MathVista, MathVerse y MathVision, puede emplearse como asistente para interpretar gráficos, diagramas geométricos o tablas numéricas y resolver el cálculo asociado.
- Extracción de información de imágenes densas: lectura de capturas de pantalla, tableros de instrumentos o paneles de control donde hay que localizar valores concretos en medio de mucho texto.
- Control de calidad visual automatizado: comparación de imágenes de producto o de fabricación para detectar discrepancias sutiles, aprovechando su énfasis en percepción de grano fino.
- Asistente multimodal en inglés para atención al cliente técnica: el modelo puede mantener conversaciones multi-turno en las que el usuario adjunta una imagen (por ejemplo, una captura de un error) y pide una explicación.
- Investigación en destilación y RL para VLMs: el modelo sirve como referencia reproducible para estudiar el método OPD-Aha, ya que el repositorio incluye código de entrenamiento, fusión de checkpoints y evaluación.
- Prototipado de pipelines multimodales con vLLM: al incluir un entrypoint de servicio, se puede desplegar como endpoint OpenAI-compatible para experimentar con aplicaciones de visión y lenguaje sin reentrenar.
- Análisis de imágenes de alta resolución con recorte (zoom): el interés del proyecto en ZoomBench sugiere idoneidad para flujos que recortan y amplían regiones de una imagen antes de razonar sobre ellas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card y el repositorio únicamente enumeran los conjuntos de evaluación utilizados por el proyecto:

| Benchmark | Ambito | Resultado |
|---|---|---|
| V*Bench | Percepcion visual de grano fino | no disponible |
| HR-Bench | Percepcion en alta resolucion | no disponible |
| MME-RealWorld | Comprension multimodal en escenarios reales | no disponible |
| ZoomBench | Razonamiento con zoom sobre detalles | no disponible |
| MathVista | Razonamiento matematico con imagenes | no disponible |
| MathVerse | Razonamiento matematico multimodal | no disponible |
| WeMath | Razonamiento matematico multimodal | no disponible |
| MathVision | Razonamiento matematico con vision | no disponible |
| DynaMath | Razonamiento matematico dinamico | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 19-20 GB solo para los pesos, dado que el repositorio ocupa 18,8 GB en safetensors; hay que sumar el codificador visual, el cache KV y activaciones, por lo que conviene reservar al menos 24-32 GB.
- GPUs recomendadas: NVIDIA A100 40GB, H100, L40S 48GB o A6000 48GB para una ejecución holgada en BF16 y contexto amplio.
- GPU de consumo: una RTX 4090 con 24 GB puede alojar los pesos en BF16, pero el margen es muy ajustado una vez añadidos el encoder visual y el cache KV; sería necesario limitar la resolución de imagen, el contexto o aplicar cuantizacion. En GPUs de 16 GB o menos no cabe sin cuantizar, y no se publican pesos cuantizados oficiales.
- Opciones de despliegue: vLLM, mediante el script `scripts/serve_model.sh` del repositorio GitHub; transformers, dado que la librería declarada es transformers y los pesos están en safetensors.
- llama.cpp, Ollama y TGI: no se documentan en la información disponible; sin pesos GGUF no se puede confirmar compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni tiempos de prefill.
- Almacenamiento: el repositorio requiere unos 18,8 GB en disco para los pesos, más el espacio adicional de cache durante la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPD-Aha-9B | ~9,4B | imagen + texto | no disponible | Apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-9B (modelo base) | ~9,4B | imagen + texto (modelo base del ajuste) | no disponible | no disponible en la informacion facilitada | HuggingFace, ampliamente disponible |
| Modelos VLM abiertos de tamano similar (por ejemplo, familias Qwen-VL de 7-9B o InternVL de ~8B) | ~7-9B | imagen + texto | 32k-128k segun variante (dato publico de esas familias, no verificado en esta ficha) | habitualmente Apache-2.0 o licencias propias | HuggingFace |

Advertencia: los datos de la tercera fila corresponden a especificaciones generales de familias publicas de VLMs y no han sido verificados contra fuentes en esta busqueda; no se dispone de resultados de benchmarks de OPD-Aha-9B que permitan una comparacion de rendimiento real. La busqueda web realizada no devolvio informacion tecnica util sobre este modelo ni sobre su modelo base.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la informacion disponible, por lo que el rendimiento real frente al modelo base o a alternativas es desconocido.
- El modelo declara únicamente soporte de inglés (`en`); no hay evidencia de capacidades multilingues, lo que limita su uso en castellano sin evaluación adicional.
- Riesgo de alucinacion visual: en tareas de percepción de grano fino, un VLM puede describir detalles que no existen en la imagen; conviene validar las salidas en aplicaciones criticas.
- Sesgos: no se documenta ninguna auditoria de sesgos ni la composición del dataset de entrenamiento, por lo que se desconocen los sesgos potenciales heredados del modelo base y de los datos de destilacion.
- Longitud de contexto desconocida: al no especificarse, no se puede garantizar el comportamiento en conversaciones largas o imágenes de muy alta resolución.
- Restricciones de licencia: el modelo se publica bajo Apache-2.0, pero la propia model card advierte de que el modelo base y los datasets siguen sujetos a sus licencias respectivas; es necesario revisarlas antes de un uso comercial.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes y fue publicado el 2026-09-13, por lo que no hay evidencia de uso en produccion ni de validacion independiente.
- No se publican pesos cuantizados, lo que dificulta el despliegue en hardware de consumo con VRAM limitada.
- Sin datos de throughput ni latencia, no es posible dimensionar un despliegue en produccion sin medir previamente.
- El proyecto depende de componentes externos (verl, vLLM, Vision-OPD), cuyas versiones y compatibilidad pueden cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CewEhao/OPD-Aha-9B
- Repositorio de codigo: https://github.com/Echochef/OPD-Aha
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ecosistema Qwen3-VL (agradecimientos): https://github.com/QwenLM/Qwen3-VL
- verl (framework de RL, agradecimientos): https://github.com/volcengine/verl
- vLLM (servicio de inferencia, agradecimientos): https://github.com/vllm-project/vllm
- Vision-OPD (agradecimientos): https://github.com/VisionOPD/Vision-OPD
- Paper o publicacion tecnica del metodo: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas genericas de servicios de Google).
