# aimeri/spoomplesmaxx-mockingbird-36B-mlx-3bit

## Resumen

El modelo `aimeri/spoomplesmaxx-mockingbird-36B-mlx-3bit` es una cuantización en 3-bit (formato MLX) del modelo base `spoomplesmaxx-mockingbird-36B`, desarrollado por el usuario aimeri. Está diseñado específicamente para tareas de roleplay, escritura creativa y conversación, con un enfoque en la coherencia narrativa y la caracterización de personajes. La cuantización MLX permite ejecutarlo en hardware Apple Silicon (Macs con chip M-series) con un consumo de memoria reducido: aproximadamente 18 GB en disco, lo que lo hace viable en equipos con 24 GB de RAM unificada.

A pesar del nombre "36B", los parámetros totales registrados en los safetensors son 4.520.154.112 (~4,5 mil millones), lo que sugiere que el modelo base podría ser una arquitectura de mezcla de expertos (MoE) con 36B de parámetros totales y solo 4,5B activos por token, aunque esta información no se confirma explícitamente en la documentación disponible. El modelo se distribuye bajo licencia Apache 2.0 y solo soporta inglés. Su relevancia radica en ofrecer una alternativa de roleplay y escritura creativa de alta calidad, optimizada para el ecosistema MLX y con un tamaño manejable para equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere 36B, pero los pesos reales indican ~4,5B; posible MoE sin confirmar) |
| Parametros totales | 4.520.154.112 (~4,5B) según safetensors |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit (MLX) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. El nombre "mockingbird-36B" sugiere un tamaño de 36 mil millones de parametros, pero el recuento real de parametros en los safetensors es de aproximadamente 4,5 mil millones, lo que podria indicar una arquitectura de mezcla de expertos (MoE) con parametros activos reducidos, aunque no se confirma en la documentacion. El modelo base fue entrenado con datasets orientados a roleplay, escritura creativa y asistente inteligente, segun el repositorio GitHub de aimerib/spoomplesmaxx. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La cuantizacion 3-bit se realizo con la libreria MLX, optimizada para Apple Silicon, y el template de chat nativo se incluye en la configuracion del tokenizador.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en roleplay y escritura creativa.
- Capacidad para encarnar personajes y mantener coherencia narrativa en conversaciones multi-turno.
- Competencia ligera en seguimiento de instrucciones y razonamiento basico (segun la descripcion de otros modelos de la familia SpoomplesMaxx).
- Soporte de chat interactivo mediante `mlx_lm.chat` o LM Studio, que usan automaticamente el template de chat incluido.
- Idioma: solo ingles. No se mencionan capacidades multilingues.
- No se indica soporte de tool calling, vision ni audio en este modelo especifico.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener personajes consistentes y tramas narrativas en sesiones largas, gracias a su entrenamiento especifico en datasets de roleplay. Se usaria con `mlx_lm.chat` en una Mac con 24 GB o mas de RAM.
- Escritura creativa asistida: generacion de dialogos, descripciones y escenas para novelas, guiones o juegos de rol. Su capacidad para seguir instrucciones complejas (aunque ligera) permite guiar el tono y el estilo.
- Asistente conversacional de ficcion: creacion de chatbots con personalidad para entretenimiento o prototipos, aprovechando el template de chat que termina cada mensaje con `<seed:eos>`.
- Generacion de historias interactivas: el modelo puede actuar como narrador o personaje en aventuras de texto, manteniendo el hilo argumental.
- Prototipado rapido de agentes conversacionales: gracias a su licencia Apache 2.0 y su formato MLX, es facil de integrar en proyectos personales o academicos en entornos Apple.
- Experimentacion con cuantizacion 3-bit: sirve como referencia para evaluar el impacto de la cuantizacion extrema en tareas creativas, comparando con versiones de mayor precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano en disco: aproximadamente 18 GB (el repositorio ocupa 15,8 GB, pero la model card indica ~18 GB en disco).
- Memoria RAM unificada recomendada: 24 GB como minimo, con margen; 32 GB para mayor comodidad.
- Hardware objetivo: Apple Silicon (M1, M2, M3 o superiores) con soporte MLX.
- No se indica compatibilidad con GPUs NVIDIA o AMD; el formato MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: `mlx-lm` (via `mlx_lm.chat`), LM Studio (con soporte MLX).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| spoomplesmaxx-mockingbird-36B-mlx-3bit (este) | ~4,5B (pesos reales) | no disponible | Apache 2.0 | MLX 3-bit | Roleplay, escritura creativa |
| spoomplesmaxx-flash-35B-A3 | 35B totales, 3B activos | no disponible | Apache 2.0 | MLX (VLM) | Roleplay, tool calling, velocidad |
| spoomplesmaxx-mini-14B | 14B | no disponible | Apache 2.0 | no especificado | Roleplay, escritura creativa, 24GB VRAM |
| spoomplesmaxx-gemma4-31B | 31B | no disponible | Apache 2.0 | MLX (VLM) | Roleplay, escritura creativa |

Nota: los datos de contexto y rendimiento no estan disponibles para ninguno de estos modelos en la informacion recopilada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La cuantizacion 3-bit puede degradar la calidad de generacion en comparacion con precisiones mayores, especialmente en tareas de razonamiento complejo.
- Advertencia critica del autor: no usar penalizaciones de repeticion, presencia o frecuencia. El template de chat termina cada mensaje con `<seed:eos>`; las penalizaciones contextuales suprimen ese token, lo que provoca que el modelo no cierre sus turnos y la generacion degenera en el vocabulario chino no entrenado del modelo base.
- La ventana de temperatura util es estrecha: ~0,95–1,05. Temperaturas mas bajas producen repeticiones verbatim; mas altas, generacion incoherente.
- No se dispone de informacion sobre sesgos especificos, pero al ser un modelo entrenado con datos de roleplay y escritura creativa, podria reflejar sesgos presentes en esos datasets.
- Riesgo de alucinacion inherente a modelos generativos, no mitigado especificamente en esta version.
- La discrepancia entre el nombre "36B" y los parametros reales (~4,5B) puede indicar que se trata de un MoE, pero no se confirma; los usuarios deben verificar el comportamiento real antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B-mlx-3bit
- Modelo base: https://huggingface.co/aimeri/spoomplesmaxx-mockingbird-36B
- Repositorio GitHub de datasets: https://github.com/aimerib/spoomplesmaxx
- Modelo relacionado (Flash 35B A3): https://huggingface.co/aimeri/spoomplesmaxx-flash-35B-A3
- Modelo relacionado (Mini 14B): https://huggingface.co/aimeri/spoomplesmaxx-mini-14B
- Modelo relacionado (Gemma4 31B): https://huggingface.co/aimeri/spoomplesmaxx-gemma4-31B-v1.1-mlx-vlm-3Bit
