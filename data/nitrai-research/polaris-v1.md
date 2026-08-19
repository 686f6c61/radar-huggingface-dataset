# nitrai-research/Polaris-V1

## Resumen

Polaris-V1 es un modelo de razonamiento y generación de código de 4 mil millones de parámetros desarrollado por NitrAI Research, un laboratorio especializado en IA open source. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-4B, alineado mediante aprendizaje por refuerzo (RL) con recompensas basadas en síntesis de código multi-archivo y verificación de teoremas. Su objetivo principal es ofrecer capacidades de razonamiento agéntico y resolución de problemas de ingeniería de software en hardware de consumo, con un consumo de memoria muy reducido.

El modelo destaca por su ventana de contexto extremadamente larga de 1.592.638 tokens (1,59 millones) gracias al escalado YaRN de RoPE, y por su capacidad para ejecutarse en GPUs de consumo con tan solo 3,2 GB de VRAM en cuantización Q4_K_M. En benchmarks de código como SWE-bench Verified alcanza un 31,4 % Pass@1, un resultado notable para su tamaño. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integración en entornos de producción locales o en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (basado en Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.592.638 tokens (con YaRN RoPE scaling) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, FP16 (tambien disponible en GGUF) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Polaris-V1 parte de la arquitectura del modelo Qwen3.5-4B, un transformer causal denso de 4.000 millones de parámetros activos. Sobre esta base se aplicó un proceso de fine-tuning con aprendizaje por refuerzo (RL) que utiliza recompensas derivadas de dos fuentes principales: la síntesis de código multi-archivo y la verificación de teoremas. Este enfoque busca mejorar la capacidad del modelo para razonar sobre código en proyectos complejos, donde es necesario modificar varios ficheros de forma coherente.

Para lograr la ventana de contexto de 1,59 millones de tokens se emplea el escalado YaRN de RoPE (rotary position embeddings), una técnica que extiende la longitud de contexto original del modelo base sin necesidad de reentrenar desde cero. Además, el modelo soporta decodificación especulativa cuando se combina con el modelo borrador Qwen3.5-0.8B-Draft, alcanzando velocidades de 540 a 720 tokens por segundo en GPUs de consumo. No se han publicado detalles sobre la composición exacta del dataset de entrenamiento ni sobre el número total de tokens utilizados.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de razonamiento multi-archivo y resolución de issues de repositorios reales.
- Razonamiento agéntico: puede planificar y ejecutar trayectorias autónomas para resolver problemas complejos de software, como lo demuestra su rendimiento en WildClawBench.
- Soporte de conversaciones multi-turno mediante el formato de chat de Qwen (ChatML), con gestión de contexto largo.
- Capacidades multilingües limitadas a inglés y chino, aunque el código es agnóstico al idioma.
- Decodificación especulativa integrable con un modelo borrador de 0,8B para acelerar la inferencia.
- Uso de tool calling / function calling implícito a través de su entrenamiento en tareas agénticas, aunque no se documenta explícitamente una API específica.
- Contexto de 1,59M tokens, adecuado para repositorios completos o documentación extensa.

## Casos de uso

- Asistente de desarrollo integrado en IDE: el modelo puede analizar un repositorio completo, identificar errores y proponer parches multi-archivo. Su ventana de 1,59M tokens permite cargar el árbol de ficheros relevante en una sola pasada.
- Automatización de code review: dado un pull request, Polaris-V1 puede razonar sobre los cambios, detectar problemas de concurrencia o regresiones y sugerir correcciones, gracias a su entrenamiento en verificación de teoremas.
- Resolución autónoma de issues en proyectos open source: integrado en un agente que ejecuta comandos, lee ficheros y aplica parches, el modelo puede abordar tareas de mantenimiento de bajo nivel con supervisión humana mínima.
- Generación de documentación técnica y explicaciones de código: su capacidad de razonamiento permite explicar fragmentos complejos o generar documentación a partir de código fuente.
- Chatbot técnico con contexto largo: para soporte al desarrollador, el modelo puede mantener conversaciones sobre una base de código completa, respondiendo preguntas sobre arquitectura, dependencias o comportamiento esperado.
- Educación y formación en programación: como tutor que razona paso a paso sobre problemas de algoritmia o debugging, aprovechando su capacidad de razonamiento multi-step.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card. No se dispone de verificación independiente.

| Benchmark | Tipo | Resultado |
|---|---|---|
| SWE-bench Verified | Pass@1 | 31,4 % |
| WildClawBench | Task Completion Rate | 38,5 % |
| DeepSWE | Pass@1 | 26,8 % |
| SWE-bench Pro | Pass@1 | 28,0 % (dato declarado en tabla comparativa, no en el model-index) |

No se han publicado resultados de benchmarks generales como MMLU, GSM8K o HumanEval en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,2 GB con cuantización Q4_K_M, 4,5 GB con Q8_0 y 8,4 GB en FP16.
- GPUs compatibles: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4060, Apple Silicon con memoria unificada). En FP16 se recomienda una GPU con 10 GB o más (RTX 3080, RTX 4080, A10G).
- Decodificación especulativa: se requiere el modelo borrador Qwen3.5-0.8B-Draft para alcanzar 540-720 tok/s en GPUs de consumo.
- Opciones de despliegue: Ollama (comando `ollama run nitrai-research/polaris-v1`), llama.cpp para GGUF, Hugging Face Transformers con `device_map="auto"`, y compatible con endpoints de la plataforma Hugging Face.
- Latencia: con decodificación especulativa, el throughput estimado es de 540-720 tokens por segundo; sin ella, dependerá de la GPU y la cuantización (típicamente 30-60 tok/s en Q4 en una RTX 3060).

## Comparativa con modelos similares

| Modelo | Params activos | Contexto | SWE-bench Verified | WildClawBench | DeepSWE | Licencia | Min. VRAM |
|---|---|---|---|---|---|---|---|
| **Polaris-V1 (4B RL)** | 4,0 B | 1.592.638 | 31,4 % | 38,5 % | 26,8 % | Apache 2.0 | 3,2 GB (Q4) |
| empero-ai/Qwen3.8-9B | 9,0 B | 1.000.000 | 37,8 % | 42,1 % | 32,0 % | no disponible | ~6,5 GB (Q4) |
| inclusionAI/Ling-3.0-tiny | 1,3 B (MoE, 7,9B totales) | 256.000 | 24,2 % | 29,0 % | 21,5 % | no disponible | ~4,8 GB (FP8) |

Nota: los datos de los modelos comparados provienen de la tabla publicada por el autor de Polaris-V1 y no han sido verificados de forma independiente. Polaris-V1 ofrece un equilibrio entre rendimiento y requisitos de hardware, superando a Ling-3.0-tiny en todos los benchmarks y quedando por debajo de Qwen3.8-9B, que requiere el doble de VRAM.

## Limitaciones y advertencias

- Los benchmarks publicados son declaraciones del autor sin verificación externa; los resultados reales pueden variar en entornos de producción.
- El modelo solo soporta inglés y chino para texto natural; no está entrenado para otros idiomas.
- Aunque la ventana de contexto es de 1,59M tokens, la calidad de recuperación de información a distancias muy largas puede degradarse, como ocurre con todos los modelos con escalado posicional.
- Riesgo de alucinación en tareas de razonamiento complejo o cuando se le pide generar código sin un contexto suficiente; se recomienda validar las salidas con pruebas automatizadas.
- No se documentan sesgos específicos, pero al derivar de Qwen3.5-4B puede heredar sesgos presentes en los datos de entrenamiento originales.
- La decodificación especulativa requiere un modelo borrador adicional, lo que añade complejidad de despliegue.
- No hay información sobre el dataset de entrenamiento ni sobre el proceso de RL en detalle, lo que dificulta evaluar posibles problemas de seguridad o robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nitrai-research/Polaris-V1
- Sitio web de NitrAI Research: https://nitrai.dev
- Repositorio de benchmarks SWE-bench Verified: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified
- Dataset WildClawBench: https://huggingface.co/datasets/internlm/WildClawBench
- Dataset DeepSWE: https://huggingface.co/datasets/datacurve/deep-swe
