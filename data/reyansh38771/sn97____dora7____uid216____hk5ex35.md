# reyansh38771/sn97____dora7____uid216____hk5EX35

## Resumen

El modelo `reyansh38771/sn97____dora7____uid216____hk5EX35` es un modelo de lenguaje multimodal (image-text-to-text) de 34.660 millones de parámetros, desarrollado por el usuario reyansh38771 (Dallien Reayn) como parte de un proceso de fine-tuning sobre el modelo base `dendriteholdings/albedo-qwen3.6-35b-king-genesis`. Pertenece a la familia de modelos SN97, un ecosistema de modelos distribuidos a través de la subnet SN97 de Bittensor, que se dedica a la destilación competitiva de modelos de gran tamaño (como Kimi-K2.6) hacia arquitecturas más eficientes.

El modelo está diseñado para tareas conversacionales y de razonamiento multimodal, con capacidad de procesar tanto texto como imágenes. Su arquitectura MoE (Mixture of Experts) basada en Qwen3.5 sugiere un diseño orientado a la eficiencia computacional, activando solo una fracción de sus parámetros por token procesado. La licencia Apache-2.0 permite uso comercial, aunque el acceso al modelo es restringido (gated), requiriendo aceptación de condiciones en HuggingFace.

La relevancia de este modelo radica en su carácter experimental dentro del ecosistema Bittensor, donde se exploran técnicas de destilación y fine-tuning competitivo. Su tamaño de 34.66B lo sitúa en un rango medio-alto, con capacidad para ejecutarse en GPUs de gama alta para consumo o en clústeres de producción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 |
| Parámetros totales | 34.660.610.688 (34.66B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura se basa en un transformer con mezcla de expertos (MoE), heredada del modelo base `albedo-qwen3.6-35b-king-genesis`, que a su vez deriva de la familia Qwen3.5. El modelo es multimodal, procesando tanto texto como imágenes (image-text-to-text), lo que sugiere un encoder visual integrado con el decoder de lenguaje. El tamaño total de 34.66B con etiqueta `qwen3_5_moe` indica una estructura de expertos, aunque no se especifica el número de parámetros activos por token.

El entrenamiento se realizó mediante fine-tuning del modelo base mencionado, dentro del contexto de la subnet SN97 de Bittensor, que se dedica a la destilación competitiva de modelos de gran escala. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens, ni las técnicas de alineación (RLHF, DPO, etc.) empleadas. La fecha de creación (agosto de 2026) sugiere que es un modelo reciente dentro del ecosistema.

## Capacidades
- Generación de texto conversacional y razonamiento, basado en la familia Qwen3.5.
- Procesamiento multimodal de texto e imágenes (pipeline image-text-to-text).
- Soporte de conversaciones multi-turno, orientado a aplicaciones de chat.
- Capacidades de destilación de conocimiento, dado su origen en la subnet SN97 de Bittensor.
- Integración con el ecosistema de herramientas de HuggingFace (transformers).

## Casos de uso
- Asistentes conversacionales en producción: el modelo puede gestionar diálogos multimodales, combinando texto e imágenes, útil para atención al cliente o soporte técnico con capturas de pantalla.
- Análisis de documentos visuales: puede extraer información de imágenes, diagramas o capturas y generar respuestas textuales, adecuado para automatización de procesos de revisión documental.
- Desarrollo de chatbots especializados: su licencia Apache-2.0 permite integración en productos comerciales, aunque el acceso restringido puede limitar su uso directo.
- Investigación en destilación de modelos: al ser parte del ecosistema SN97, sirve como caso de estudio para técnicas de fine-tuning y compresión de modelos.
- Prototipado de agentes multimodales: con soporte de texto e imagen, se puede usar para desarrollar agentes que necesiten interpretar contenido visual y responder en lenguaje natural.
- Evaluación comparativa en benchmarks de razonamiento multimodal: su tamaño y arquitectura lo hacen candidato para pruebas de rendimiento en tareas como VQA o razonamiento visual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 34.66B parámetros en fp16, se necesitan aproximadamente 69 GB de VRAM (34.66 GB de pesos + overhead de activaciones). En cuantización INT8, se reduciría a ~35 GB; en INT4, ~17 GB.
- GPU recomendadas: para fp16, se requiere una A100 80GB o H100; para INT8, una RTX 4090 24GB o A6000 48GB; para INT4, una RTX 3090/4090 con 24GB podría ser suficiente.
- En consumer GPU: es posible ejecutarlo en cuantización INT4 en tarjetas de 24GB (RTX 3090/4090), aunque con velocidad limitada.
- Opciones de despliegue: compatible con transformers y safetensors, se puede servir con vLLM, TGI, o llama.cpp (si se convierte a GGUF).
- Latencia y throughput estimados: no disponibles, dependen de la GPU y la cuantización.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sn97 (este modelo) | 34.66B MoE | no disponible | Apache-2.0 | Gated en HF |
| Qwen2.5-32B | 32.5B dense | 32K | Apache-2.0 | Abierto |
| Mixtral 8x7B | 46.7B total / 12.9B activos | 32K | Apache-2.0 | Abierto |
| DeepSeek-V2-Lite | 16B MoE / 2.4B activo | 32K | MIT | Abierto |

Nota: no se dispone de información comparativa sobre benchmarks, ya que no hay datos publicados para este modelo.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles, pero al ser un fine-tuning de un modelo base de Qwen, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: no se han publicado evaluaciones específicas, pero como modelo conversacional, puede generar contenido no verificado.
- Limitaciones de contexto: no se conoce la longitud de contexto; si es similar a Qwen3.5, podría ser de 32K o más, pero no está confirmado.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el acceso al modelo es restringido, lo que puede limitar su uso comercial hasta obtener permiso.
- Caveat de producción: al ser un modelo experimental de la subnet SN97, no hay garantías de estabilidad ni mantenimiento.

## Enlaces
- HuggingFace: https://huggingface.co/reyansh38771/sn97____dora7____uid216____hk5EX35
- Perfil del autor: https://huggingface.co/reyansh38771
- Repo relacionado de la subnet SN97: https://github.com/unarbos/distil
- Repo del proyecto SN97: https://github.com/Damacol/dmsc19-sn97-model-v1
