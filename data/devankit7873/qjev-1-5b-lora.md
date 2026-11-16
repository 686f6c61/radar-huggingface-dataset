# devankit7873/QJev-1.5B-LoRA

## Resumen

QJev-1.5B-LoRA es un adaptador PEFT (LoRA) publicado por el desarrollador independiente devankit7873 sobre el modelo base Qwen2.5-1.5B-Instruct. No es un modelo generativo al uso: es un adaptador de clasificación orientado a la toma de decisiones rapida (lo que el autor denomina "System 1"), que recibe un contexto textual y un conjunto de opciones discretas, y devuelve una distribucion de probabilidad sobre cual de ellas es la mejor. El adaptador se combina con una cabeza de decision MLP (1536 a 512 a 10) que produce la salida de clasificacion.

El interes tecnico esta en su tamano: el adaptador LoRA pesa unos 17,5 MB y la cabeza de decision unos 3,18 MB, por lo que se puede superponer sobre una copia ya cacheada de Qwen2.5-1.5B-Instruct sin descargar los pesos completos. Segun el autor, alcanza una puntuacion de 71,5% en JevBench, identica a la del modelo fusionado completo (QJev-1.5B, 3,08 GB). Esta pensado para despliegues en el borde, moviles y arquitecturas modulares donde interesa una capa de decision de baja latencia (el autor cita 31 ms por decision).

La relevancia actual es acotada pero concreta: propone separar la decision rapida de la generacion lenta en sistemas agénticos, usando un adaptador pequeno y barato como selector de acciones antes de invocar un LLM mayor. No obstante, el ecosistema es muy reciente (repo creado en noviembre de 2026), sin descargas ni likes en el momento de la consulta, y con documentacion limitada a la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen2.5-1.5B-Instruct) + cabeza MLP de decision (1536 a 512 a 10) |
| Parametros totales | No disponible (adaptador de 17,5 MB + cabeza de 3,18 MB; el modelo base tiene 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-1.5B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | No disponible para el adaptador; existe una variante del modelo completo en 4 bits (QJev-1.5B-4bit) |
| Idiomas soportados | No disponible (la model card no los declara; el modelo base Qwen2.5 soporta multiples idiomas) |
| Licencia | Apache 2.0 (el modelo base se rige por la licencia de Alibaba Cloud Qwen) |
| Formato de pesos | safetensors (adapter_model.safetensors y decision_head.safetensors) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16 y alpha 32 sobre las proyecciones q_proj, k_proj, v_proj y o_proj del transformer Qwen2.5-1.5B-Instruct. Sobre la representacion del modelo base se anade una cabeza de decision MLP con dimensiones 1536 a 512 a 10, que transforma el estado oculto en una distribucion sobre hasta diez opciones candidatas. El pipeline declarado es text-classification y la libreria es PEFT.

El autor indica que el adaptador se entreno sobre el dataset SargeDev/jev-distill-corpus-v3, con metricas declaradas de accuracy, TVD (total variation distance) y KL divergence, lo que sugiere un entrenamiento por destilacion de distribuciones de probabilidad mas que por etiquetas duras. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de RLHF o DPO. La innovacion declarada es el llamado "Joint Expected Value" (JEV), un marco de decision que combina atencion conjunta y valor esperado para seleccionar acciones, aunque la model card no detalla la formulacion matematica ni los detalles del proceso de entrenamiento.

## Capacidades

- Clasificacion de decisiones: dado un contexto y una lista de opciones, devuelve la mejor opcion con un porcentaje de confianza y la distribucion de probabilidad sobre todas las alternativas.
- Razonamiento de "System 1": decisiones rapidas de baja latencia (el autor cita 31 ms por decision) frente a razonamiento generativo lento.
- Seleccion entre hasta diez opciones discretas (dimension de salida de la cabeza de decision).
- Integracion como capa de decision en agentes: el autor lo etiqueta como "agent" y "decision-making".
- Inferencia rapida ("fast-inference") gracias al reducido tamano del adaptador.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni modo "thinking" en la informacion disponible.

## Casos de uso

- Enrutamiento de acciones en agentes: antes de invocar un LLM mayor, el adaptador selecciona rapidamente entre un conjunto acotado de acciones (por ejemplo, failover, reinicio o escalado) a partir de una descripcion del estado del sistema, reduciendo coste y latencia.
- Triaje de alertas en operaciones: dado un contexto de incidente y opciones de respuesta, el modelo devuelve la accion recomendada con su confianza, util como primera capa de un sistema de on-call.
- Despliegue en el borde y moviles: con 17,5 MB de adaptador sobre un base cacheado, encaja en dispositivos con almacenamiento y memoria limitados donde no cabe un LLM completo.
- Clasificacion de intenciones en asistentes: elegir entre un conjunto fijo de intenciones o rutas de conversacion en funcion del contexto del usuario.
- Arquitecturas modulares multi-modelo: usar el adaptador como selector barato que decida que modelo o herramienta especializada invocar a continuacion.
- Experimentacion e investigacion en decision-making: al ser un adaptador pequeno y de licencia Apache 2.0, permite reproducir y modificar el enfoque JEV sobre Qwen2.5 sin reentrenar el modelo base.

## Benchmarks y rendimiento

| Benchmark | QJev-1.5B-LoRA | QJev-1.5B (fusionado) |
|---|---|---|
| JevBench (score calibrado) | 71,5% | 71,5% (identico segun el autor) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones numericas con otros modelos. La unica metrica reportada es la puntuacion en JevBench, un benchmark propio del autor (jevbench.github.io) cuyos detalles de composicion y metodologia no se incluyen en la model card.

## Requisitos de hardware

- VRAM estimada: el adaptador anade unos 21 MB (17,5 MB LoRA + 3,18 MB cabeza) sobre el modelo base Qwen2.5-1.5B-Instruct. El requisito dominante es el del base: aproximadamente 3 GB en fp16, y alrededor de 1,07 GB de VRAM para la variante cuantizada a 4 bits del modelo completo (QJev-1.5B-4bit).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo base en fp16; para despliegues de alto throughput se usarian A100 o H100, aunque el modelo es pequeno para aprovecharlas.
- Cabe en GPU consumer: si, con holgura en fp16 en GPUs con 4 GB o mas de VRAM; la variante 4 bits reduce el requisito a cerca de 1 GB.
- Opciones de despliegue: la model card muestra una API propia (`qjev.QJev.from_pretrained` y `model.decide`). No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: el autor cita 31 ms por decision, sin especificar hardware de referencia ni throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QJev-1.5B-LoRA | Adaptador sobre 1,5B | No disponible | Clasificacion de decisiones (LoRA) | Apache 2.0 | Hugging Face (0 descargas) |
| QJev-1.5B | 1,5B (fusionado) | No disponible | Clasificacion de decisiones | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en esta ficha | Generacion de texto instruct | Licencia Qwen | Hugging Face (ampliamente usado) |
| Modelos de clasificacion tipo BERT-base | ~110M | 512 tokens tipicamente | Clasificacion de texto | Apache 2.0 / MIT | Amplia |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la unica cifra es el 71,5% en JevBench, que no es comparable con benchmarks estandar de terceros.

## Limitaciones y advertencias

- Ecosistema muy reciente y sin validacion externa: repo creado en noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta.
- La unica metrica reportada (JevBench) es un benchmark propio del autor; no hay evaluacion independiente ni resultados en benchmarks estandar.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-1.5B-Instruct hereda los sesgos del modelo base, que no se analizan en la model card.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero la cabeza de decision puede producir confianzas mal calibradas; el autor reporta metricas de calibracion (TVD, KL) sin publicar sus valores.
- Limitacion funcional: el modelo elige entre opciones predefinidas (hasta diez); no genera acciones nuevas ni texto libre.
- Idiomas soportados no declarados; el comportamiento multilingue depende del modelo base y no esta evaluado.
- Licencia Apache 2.0 para el adaptador, pero el modelo base Qwen2.5-1.5B-Instruct se rige por la licencia de Alibaba Cloud Qwen, que impone condiciones adicionales para uso comercial; debe revisarse antes de produccion.
- Dependencia de una API propia (`qjev`) no estandar, lo que anade riesgo de mantenimiento y compatibilidad.
- No se especifican el contexto maximo efectivo ni el comportamiento con contextos largos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/devankit7873/QJev-1.5B-LoRA
- Modelo fusionado QJev-1.5B: https://huggingface.co/devankit7873/QJev-1.5B
- Variante cuantizada QJev-1.5B-4bit: https://huggingface.co/devankit7873/QJev-1.5B-4bit
- Repositorio GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- JevBench: https://jevbench.github.io/
- Dataset de entrenamiento: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
