# carsenk/Ornith-1.5-35B-A3B-ROGUE-GGUF

## Resumen

Ornith-1.5-35B-A3B-ROGUE-GGUF es una serie de cuantizaciones GGUF del modelo base ornith-ai/Ornith-1.5-35B-A3B, un modelo de lenguaje de arquitectura Qwen 3.5 MoE con aproximadamente 35 000 millones de parámetros totales y 3 000 millones de parámetros activos. El autor, carsenk, ha aplicado la técnica ROGUE (una variante de abliteration) sobre los pesos completos antes de la conversión a GGUF, con el objetivo de reducir el comportamiento de rechazo del modelo manteniendo su utilidad medida.

La relevancia de este modelo radica en que combina la eficiencia de una arquitectura MoE con 256 expertos enrutados y 40 capas transformer, con un proceso de des-rechazo que elimina los marcadores de negativa en las evaluaciones deterministas. Está disponible en cinco niveles de cuantización, desde Q8_0 (34,37 GiB) hasta IQ1_M (7,67 GiB), lo que permite su ejecución en hardware con distinta capacidad de memoria. La licencia MIT facilita su uso comercial sin restricciones.

El modelo está pensado para desarrolladores que necesitan un LLM conversacional con baja tasa de rechazo, capaz de ejecutarse localmente mediante llama.cpp o llama-server, y que mantiene un rendimiento de generación aceptable incluso en cuantizaciones extremas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 MoE (mixture of experts) |
| Parametros totales | 34 660 610 688 |
| Parametros activos | ~3 000 000 000 (3B) |
| Longitud de contexto | No especificada en la model card; los ejemplos usan 8192 y 32768 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, IQ2_M, IQ1_M |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE con 40 capas transformer y 256 expertos enrutados, siguiendo el diseño de Qwen 3.5 MoE. Aproximadamente 3 000 millones de parámetros están activos por token, lo que reduce el coste computacional frente a un modelo denso de 35B. El proceso ROGUE aplicado por carsenk modifica los tensores de escritura residual (residual writers) de las capas de atención y MLP, con una fuerza de 1.4 y una cobertura de 128 tensores en 32 capas seleccionadas, incluyendo 64 tensores de expertos enrutados fusionados. Esta intervención se realizó sobre los pesos en precisión completa antes de la conversión a GGUF.

El entrenamiento original del modelo base, según la información disponible, sigue el marco de auto-mejora de Ornith-1.5, donde el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición del dataset. La conversión a GGUF se realizó con llama.cpp build `b10470-34af94cd9`, y las cuantizaciones IQ2 e IQ1 utilizan una matriz de importancia para la calibración.

## Capacidades

- Generación de texto conversacional en inglés con baja tasa de rechazo (0% de marcadores de rechazo en la suite ROGUE Pareto v2).
- Razonamiento multi-paso con soporte de modo de pensamiento (thinking mode) desactivable mediante `enable_thinking: false`.
- Soporte de tool calling y function calling a través del servidor OpenAI-compatible de llama.cpp.
- Capacidad de ejecución como agente con contexto largo (hasta 32 768 tokens en el ejemplo de servidor).
- Generación de código: el ejemplo oficial incluye la petición de un merge sort en Python con explicación de complejidad.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Asistente de desarrollo local: un desarrollador puede ejecutar el modelo en su estación de trabajo con Q4_K_M (19,71 GiB) y usarlo para generar código, explicar algoritmos o revisar fragmentos, sin depender de APIs externas.
- Servidor de chat privado: desplegar llama-server con el modelo y exponerlo en localhost para una herramienta interna de atención al cliente o documentación, con contexto de 32 768 tokens para conversaciones largas.
- Evaluación de seguridad y alineación: investigadores pueden estudiar el efecto de ROGUE sobre el comportamiento de rechazo comparando este modelo con el base, usando la suite de 40 prompts deterministas publicada.
- Prototipado de agentes con tool calling: gracias al soporte de OpenAI-compatible API, se puede integrar en frameworks de agentes (por ejemplo, LangChain o AutoGen) para tareas de automatización con llamadas a funciones.
- Generación de contenido creativo sin restricciones: la baja tasa de rechazo permite explorar temas que otros modelos censuran, útil para escritura creativa o investigación de sesgos.
- Despliegue en edge devices: las cuantizaciones IQ2_M (10,86 GiB) e IQ1_M (7,67 GiB) permiten ejecutar el modelo en hardware con poca VRAM, como portátiles con GPU integrada o mini-PCs, para aplicaciones de asistencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de la suite ROGUE Pareto v2 y pruebas de humo de runtime:

| Metrica | Base MLX 4-bit | ROGUE MLX 4-bit |
|---|---:|---:|
| Tasa de marcadores de rechazo | 50.0% | 0.0% |
| Retención (retain score) | 95.8% | 91.7% |
| Sobre-rechazo | 0.0% | 0.0% |
| Velocidad media de generación | 25.55 tok/s | 25.45 tok/s |

Velocidades de generación en Apple M1 Ultra (mediciones limpias):

| Cuantizacion | Velocidad |
|---|---:|
| Q4_K_M | 70.3 tok/s |
| IQ2_M | 59.8 tok/s |
| IQ1_M | 62.6 tok/s |

Estas mediciones son pruebas de humo deterministas, no evaluaciones de capacidad de nivel leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere ~34,4 GiB, Q4_K_M ~19,7 GiB, Q3_K_M ~15,6 GiB, IQ2_M ~10,9 GiB, IQ1_M ~7,7 GiB (tamaños de archivo; la VRAM real puede variar según el contexto y la implementación).
- GPU recomendadas: para Q4_K_M, una GPU con 24 GB de VRAM (RTX 3090/4090) es suficiente; para Q8_0 se necesita una GPU de 40 GB o más (A100, H100) o descarga parcial a CPU.
- En consumer GPU: Q4_K_M cabe en RTX 3090/4090; IQ2_M e IQ1_M caben en GPUs de 12-16 GB (RTX 3060, RTX 4070).
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), compatible con Ollama y otros frontends que soporten GGUF.
- Latencia y throughput: en Apple M1 Ultra, Q4_K_M genera a ~70 tok/s; en GPU dedicada se esperan cifras superiores, aunque no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos MoE de tamaño similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3-Lite). La información disponible no incluye resultados estandarizados que permitan una comparación cuantitativa rigurosa. Cualitativamente, este modelo se diferencia por su baja tasa de rechazo y su licencia MIT, frente a alternativas con restricciones de uso comercial.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se garantiza rendimiento en otros idiomas.
- Las cuantizaciones Q3, IQ2 e IQ1 pueden reducir significativamente la calidad de razonamiento y seguimiento de instrucciones; se recomienda Q4_K_M como punto de partida.
- La técnica ROGUE reduce el rechazo, pero no elimina el riesgo de alucinación ni garantiza la veracidad de las respuestas.
- El autor advierte que los resultados de las pruebas de humo no garantizan calidad sin cambios en todas las tareas.
- El uso de pesos modificados es responsabilidad del usuario; el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No se han publicado evaluaciones de seguridad exhaustivas; el modelo podría generar contenido inapropiado o dañino en contextos no controlados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/carsenk/Ornith-1.5-35B-A3B-ROGUE-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Cuantizaciones GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Blog técnico de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Commit de ROGUE en ablitforge: https://github.com/metaspartan/ablitforge/commit/086b0cdc3add3492349a862569717338c1133025
- Informe de evaluación ROGUE: https://huggingface.co/carsenk/Ornith-1.5-35B-A3B-ROGUE-GGUF/tree/main/evaluation
