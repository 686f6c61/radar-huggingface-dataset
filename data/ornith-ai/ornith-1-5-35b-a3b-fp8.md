# ornith-ai/Ornith-1.5-35B-A3B-FP8

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ornith-ai, presentado como la evolución de Ornith-1.0. La propuesta central del autor es un bucle de auto-mejora end-to-end: en lugar de depender de un conjunto fijo de tareas curadas por humanos y arneses diseñados manualmente, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la política mediante aprendizaje por refuerzo. Según la model card, Ornith-1.0 se construyó sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales.

El modelo activa aproximadamente 3.000 millones de parámetros por token sobre un total de 35.951.822.704 parámetros (dato real de los safetensors), lo que lo sitúa en la categoría de MoE de tamaño medio con coste de inferencia propio de un modelo mucho menor. La model card lo posiciona explícitamente frente a Qwen3.6-35B-A3B, Gemma-4-31B y Muse-Glimmer-30B, con especial énfasis en benchmarks de código y agentes.

La relevancia actual del modelo radica en dos factores: su licencia MIT, que permite uso comercial sin restricciones adicionales, y la disponibilidad de pesos en formato FP8 (compressed-tensors), orientados a despliegue eficiente en infraestructura de inferencia moderna. El repositorio ocupa 42,9 GB y acumula más de 522.000 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos, etiquetado en Hugging Face como `qwen3_5_moe`, lo que sugiere una base derivada de la familia Qwen3.5. El modelo activa aproximadamente 3.000 millones de parámetros por token sobre un total cercano a 36.000 millones, una relación de activación en torno al 8 %, típica de los diseños MoE de grano fino orientados a reducir el coste computacional por token manteniendo la capacidad total del modelo.

El entrenamiento parte de Ornith-1.0, que a su vez se desarrolló sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training. La innovación declarada en Ornith-1.5 es la ampliación del bucle de auto-mejora: no solo se optimizan el andamiaje (scaffold) y los rollouts, sino que se optimizan conjuntamente la generación de tareas, la construcción del andamiaje y los rollouts de solución, con mejora de la política mediante aprendizaje por refuerzo. La model card remite al blog del autor para los detalles de diseño de tareas, arneses y recompensas, y no proporciona el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional y razonamiento general, con pipeline declarado de `text-generation`.
- Modalidad image-text-to-text según los tags del repositorio, lo que indica capacidad de entrada de imágenes junto con texto.
- Codificación y resolución de tareas de ingeniería de software, con resultados publicados en SWE-bench Verified y SWE-bench Pro.
- Ejecución de tareas agénticas en terminal, evaluada con Terminal-Bench 2.1 en dos arneses distintos (Terminus-2 y Claude Code).
- Integración con arneses de agentes de terceros, dado que los benchmarks se reportan con Claude Code como andamiaje.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), orientada a despliegue como servicio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling o function calling: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de ingeniería de software: el modelo puede recibir un repositorio y un problema descrito en lenguaje natural y generar un parche, apoyándose en su rendimiento de 79 en SWE-bench Verified y en el formato de pesos FP8 para servir la inferencia con menor huella de memoria.
- Agentes de terminal y operaciones: con 67,8 en Terminal-Bench 2.1 bajo Terminus-2 y 68,5 bajo Claude Code, es adecuado para agentes que ejecutan comandos, inspeccionan sistemas de ficheros y resuelven tareas de administración de forma iterativa.
- Asistentes de código integrados en IDE o CI/CD: el modelo puede actuar como motor de revisión, generación de tests o corrección de parches dentro de pipelines, aprovechando la licencia MIT para uso comercial sin fricción legal.
- Despliegue en infraestructura propia con coste contenido: al activar solo ~3B parámetros por token, el coste de cómputo por petición es sustancialmente menor que el de un modelo denso de 35B, lo que lo hace viable para servicios con alto volumen de peticiones.
- Procesamiento de documentos con imagen y texto: la modalidad image-text-to-text permite extraer información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Evaluación comparativa de andamiajes agénticos: al estar evaluado con dos arneses distintos, sirve como referencia para medir el impacto del scaffold en el rendimiento final de un agente.
- Investigación en auto-mejora y RL: el modelo documenta un bucle de generación de tareas y optimización de política, lo que lo convierte en un caso de estudio útil para equipos que investigan entrenamiento por refuerzo a escala.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 68,5 | 62,8 | 49,2 | - | - | 48,6 |
| SWE-bench Verified | 79 | 75,6 | 73,4 | 52 | 76 | 76,4 |
| SWE-bench Pro | no disponible (tabla truncada en la información) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 36 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo, el requisito práctico se sitúa por encima de 40 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB, L40S 48 GB o H200 para despliegues con contexto amplio y concurrencia.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar los pesos FP8 completos; sería necesario recurrir a cuantizaciones adicionales (por ejemplo, GGUF de 4 bits) que no están disponibles en la información proporcionada.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con endpoints y, presumiblemente, motores que soporten compressed-tensors FP8; la disponibilidad concreta de vLLM, TGI, llama.cpp u Ollama no está confirmada en la información proporcionada.
- Latencia y throughput: no disponibles. El diseño MoE con ~3B parámetros activos reduce el coste por token frente a un denso de 36B, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35,95B | ~3B | no disponible | 79 | 67,8 | MIT |
| Qwen3.6-35B-A3B | 35B (clase) | ~3B (clase) | no disponible | 73,4 | 52,5 | no disponible |
| Gemma-4-31B | 31B (denso) | 31B | no disponible | 52 | 42,1 | no disponible |
| Muse-Glimmer-30B | 30B (clase) | no disponible | no disponible | 76 | 51,7 | no disponible |

Ornith-1.5-35B-A3B lidera la comparativa en los benchmarks de código y agentes reportados por el propio autor. La ventaja más pronunciada se da frente a Gemma-4-31B, un modelo denso de tamaño similar, y frente a Qwen3.6-35B-A3B en Terminal-Bench. Frente a Muse-Glimmer-30B la diferencia en SWE-bench Verified es de tres puntos. Los datos de licencia y contexto de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la model card del autor; no se dispone de verificación independiente.
- La tabla de benchmarks está truncada en la información disponible: SWE-bench Pro y otras filas no pueden reportarse.
- No se documentan sesgos conocidos, composición del dataset ni filtros de seguridad aplicados.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos sin evaluación específica publicada.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- No se detallan los idiomas soportados; el rendimiento fuera del inglés es desconocido.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo deriva de Qwen3.5 y Gemma4 mediante preentrenamiento continuado; conviene revisar las condiciones de las licencias upstream antes de un despliegue comercial.
- El formato FP8 con compressed-tensors condiciona las opciones de despliegue; no se confirma soporte en todos los motores de inferencia habituales.
- El rendimiento agéntico depende fuertemente del andamiaje utilizado, como muestran las diferencias entre Terminus-2 y Claude Code; los resultados no son directamente trasladables a otros arneses.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Modelo base referenciado (BF16): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Blog de Ornith (badge de la model card): https://deep-reinforce.com/ornith.html
