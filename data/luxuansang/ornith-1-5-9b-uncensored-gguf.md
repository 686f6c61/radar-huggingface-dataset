# luxuansang/Ornith-1.5-9B-UNCENSORED-GGUF

## Resumen

Ornith-1.5-9B-CRACK-GGUF es una cuantizacion GGUF del modelo multimodal Ornith-1.5-9B, desarrollada por luxuansang en colaboracion con Dealign.ai. El modelo base, creado por ornith-ai, implementa una arquitectura hibrida GatedDeltaNet (SSM) con atencion y forma parte de una familia que incluye variantes de 35B y 397B MoE. Esta version concreta aplica la tecnica CRACK, una cirugia de pesos especifica de arquitectura que elimina el comportamiento de rechazo (refusal) del modelo original, manteniendo el conocimiento, el razonamiento y las capacidades de vision.

El modelo se distribuye en seis niveles de cuantizacion (Q8_0 a Q2_K) junto con un proyector de vision independiente (mmproj) para entrada de imagenes. Incluye un modo de razonamiento ("thinking") activado por defecto y soporta contexto largo de hasta 262.144 tokens. La licencia MIT permite uso comercial sin restricciones, aunque el propio autor lo califica como "artefacto de investigacion con salvaguardas de seguridad reducidas".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida GatedDeltaNet (SSM) + atencion |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Ornith-1.5-9B emplea una arquitectura hibrida que combina GatedDeltaNet, una variante de SSM (state space model) con compuertas, y mecanismos de atencion tradicionales. Esta combinacion permite procesar secuencias largas con menor coste computacional que un transformer puro, manteniendo la capacidad de atencion selectiva donde es necesaria. El modelo base fue entrenado siguiendo el marco de auto-mejora de Ornith-1.5, en el que el propio modelo propone tareas, genera andamiajes especificos y produce rollouts de soluciones para aprendizaje por refuerzo.

La version CRACK aplica una cirugia de pesos consciente de la arquitectura dirigida a las vias de atencion, eliminando el comportamiento de rechazo sin degradar significativamente el conocimiento. Cada cuantizacion se ajusta de forma independiente con su propia intensidad de cirugia, y las cuantizaciones por debajo de 8 bits incorporan un paso AWQ (activation-aware quantization) junto con una matriz de importancia para maximizar la calidad. El modelo incluye un proyector de vision (mmproj) en f16 para procesar entrada de imagenes.

## Capacidades

- Generacion de texto y razonamiento multi-paso con traza de pensamiento ("thinking") activada por defecto, desactivable mediante `enable_thinking: false`.
- Vision-language: acepta entrada de imagenes junto con texto para tareas de descripcion, analisis visual y respuesta a preguntas sobre contenido grafico.
- Razonamiento matematico y logico: mantiene MMLU dentro de ±3 puntos porcentuales respecto al modelo base en todas las cuantizaciones.
- Capacidad multimodal completa: el mismo proyector de vision funciona con todas las cuantizaciones de texto.
- Sin comportamiento de rechazo: el modelo responde a peticiones que el modelo base rechazaria, con una tasa de exito de ataque (harm-ASR) del 99,2-99,6% en HarmBench.
- Compatible con llama.cpp, llama-server y LM Studio, incluyendo modo conversacional y servidor OpenAI-compatible.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar el comportamiento de modelos sin salvaguardas, analizar tecnicas de abliteracion y evaluar la robustez de los sistemas de seguridad frente a ataques adversarios.
- Analisis de contenido multimodal sin restricciones: procesamiento de imagenes y texto en entornos de investigacion donde se requiere acceso sin filtros a todo tipo de contenido, como estudios de moderacion o analisis de material sensible.
- Desarrollo de agentes conversacionales especializados: su modo de razonamiento y su ventana de contexto de 256K permiten construir asistentes que mantienen conversaciones largas y multi-turno con memoria extensa.
- Generacion de codigo y automatizacion: aunque no se publican benchmarks especificos de codigo, su capacidad de razonamiento y tool calling lo hace util para pipelines de generacion asistida en entornos controlados.
- Evaluacion de cuantizacion y despliegue: los seis niveles de cuantizacion permiten medir el impacto de la precision en tareas de razonamiento y vision, util para decidir configuraciones de despliegue en produccion.
- Educacion e investigacion academica: estudio de arquitecturas hibridas SSM-atencion y de tecnicas de cirugia de pesos en modelos multimodales, con licencia MIT que permite reproducir y modificar el trabajo.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados mediante llama.cpp. MMLU en modo logit (precisión de logits) comparando base vs. CRACK a la misma cuantizacion; HarmBench mide la tasa de exito de ataque con puerta de coherencia sobre 240 comportamientos estandar y contextuales.

| Quant | MMLU (base) | MMLU (CRACK) | ΔMMLU | HarmBench harm-ASR |
|---|---|---|---|---|
| Q8_0 | 78,1% | 77,5% | -0,53 pp | 99,6% |
| Q6_K | 76,5% | 76,5% | +0,00 pp | 99,6% |
| Q5_K_M | 76,5% | 76,5% | +0,00 pp | 99,2% |
| Q4_K_M | 78,3% | 76,5% | -1,76 pp | 99,6% |
| Q3_K_M | 73,3% | 74,4% | +1,06 pp | 99,2% |
| Q2_K | 50,5% | 50,5% | +0,00 pp | 99,2% |

Desglose de HarmBench por tema (CRACK):

| Tema | harm-ASR |
|---|---|
| Quimico / biologico | 100,0% |
| Ciberdelincuencia / intrusion | 100,0% |
| Acoso / bullying | 100,0% |
| Danino | 100,0% |
| Ilegal | 100,0% |
| Desinformacion | 98,1% |

## Requisitos de hardware

- Q8_0 (8,9 GB): requiere al menos 12 GB de VRAM; cabe en RTX 4070, RTX 4080, A10 o similar.
- Q6_K (7,4 GB): cabe en 8-12 GB de VRAM; RTX 3060 12GB, RTX 4070, A10.
- Q5_K_M (6,5 GB): cabe en 8 GB de VRAM; RTX 3060 Ti, RTX 4060 Ti 16GB.
- Q4_K_M (5,6 GB, recomendado): cabe en 8 GB de VRAM; RTX 3060, RTX 4060, RTX 2080 Ti.
- Q3_K_M (4,6 GB): cabe en 6 GB de VRAM; RTX 3060 6GB, RTX 2060.
- Q2_K (3,6 GB): cabe en 4-6 GB de VRAM; GPU de gama baja o CPU con suficiente RAM.
- El proyector de vision mmproj en f16 anade aproximadamente 1 GB adicional de VRAM.
- Despliegue: llama.cpp, llama-server, llama-mtmd-cli, LM Studio. Compatible con Ollama si se importa el GGUF.
- El modelo denso de 9B cabe en una unica GPU de 80 GB (A100/H100) sin cuantizacion, segun los datos del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 8,95B | 256K | GatedDeltaNet + atencion | MIT | safetensors |
| Ornith-1.5-9B-CRACK (este) | 8,95B | 256K | GatedDeltaNet + atencion | MIT | GGUF |
| zaakirio/Ornith-1.5-9B-Uncensored | 8,95B | 256K | GatedDeltaNet + atencion | MIT | no disponible |
| Ornith-1.5-35B-MoE | 35B (MoE) | 256K | GatedDeltaNet + atencion | MIT | safetensors |

La diferencia principal frente al modelo base es la eliminacion del comportamiento de rechazo mediante la tecnica CRACK, con una perdida de MMLU inferior a 2 puntos porcentuales en la cuantizacion recomendada. Frente a la version Uncensored de zaakirio, esta version aporta cuantizaciones GGUF listas para llama.cpp y un proyector de vision integrado.

## Limitaciones y advertencias

- Modelo sin salvaguardas de seguridad: el autor lo califica explicitamente como "artefacto de investigacion con salvaguardas de seguridad reducidas". Responde a peticiones daninas con una tasa de exito del 99-100% en HarmBench, incluyendo contenido quimico/biologico, ciberdelincuencia y acoso.
- Riesgo de uso indebido: la eliminacion del rechazo lo hace inadecuado para despliegue en produccion sin control de acceso estricto y supervisio humana.
- Degradacion en Q2_K: la cuantizacion de 2 bits reduce MMLU hasta el 50,5%, una perdida de aproximadamente 27 puntos porcentuales frente a Q8_0, lo que limita su utilidad a tareas simples.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni de tasa de alucinacion; como modelo de 9B, es susceptible a inventar hechos en contextos ambiguos.
- Idiomas soportados: no se ha publicado informacion sobre cobertura linguistica; el entrenamiento se centra presumiblemente en ingles.
- Requiere el proyector de vision por separado: para usar capacidades multimodales es necesario descargar `mmproj-Ornith-1.5-9B-f16.gguf` adicional.
- El modo de razonamiento ("thinking") esta activado por defecto, lo que incrementa la latencia y el consumo de tokens en comparacion con modelos sin traza de pensamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/luxuansang/Ornith-1.5-9B-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Version Uncensored alternativa: https://huggingface.co/zaakirio/Ornith-1.5-9B-Uncensored
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio de Ornith AI: https://ornith.ai/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Contacto del autor: eric@dealign.ai
