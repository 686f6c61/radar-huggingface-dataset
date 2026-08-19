# bhaveshsoni0023/qwen2.5-1.5b-grpo-gsm8k

## Resumen

El modelo `bhaveshsoni0023/qwen2.5-1.5b-grpo-gsm8k` es un fine-tuning del modelo base Qwen2.5-1.5B mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization), implementado con NVIDIA NeMo RL v0.7.0. El objetivo es mejorar el razonamiento matemático del modelo, específicamente en problemas aritméticos de nivel escolar del dataset GSM8K. Según la model card, el entrenamiento se realizó en una única GPU H100 durante aproximadamente tres horas, utilizando un reward binario basado en la coincidencia exacta de la respuesta dentro de etiquetas `\boxed{}`.

El modelo resultante alcanza un 73,84% de exactitud (pass@1) en el conjunto de test de GSM8K, frente al 35,03% del modelo base, lo que supone una mejora de 38,8 puntos porcentuales. Es un modelo denso de 1.543.714.304 parámetros, con licencia Apache 2.0 y disponible en formato safetensors. Su principal relevancia radica en demostrar que el aprendizaje por refuerzo puede inyectar capacidades de razonamiento en modelos pequeños de forma eficiente y con pocos recursos computacionales, sin necesidad de datos anotados por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K tokens (contexto del modelo base Qwen2.5-1.5B) |
| Tipos de cuantizacion | no disponible (repositorio solo contiene safetensors en precision original) |
| Idiomas soportados | no disponible (heredados del modelo base, que soporta principalmente ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer denso decoder-only con normalización RMSNorm, atención con sesgo de rotación (RoPE) y capas de QKV con bias. Sobre esta base se aplicó GRPO, un algoritmo de optimización de política proximal adaptado para aprendizaje por refuerzo con múltiples muestras generadas por el propio modelo. El entrenamiento se realizó con 130 pasos, 16 prompts por paso y 8 generaciones por prompt (2.080 muestras en total), con una recompensa binaria que premia la coincidencia exacta de la respuesta dentro de etiquetas `\boxed{}`. Se usó el trainer DTensor v2 de NeMo RL con generación vLLM colocalizada, una tasa de aprendizaje de 1e-6, penalización KL de 0.01 y recorte de política de 0.2/0.2, con una longitud de secuencia de 1024 tokens. No se utilizaron soluciones escritas por humanos; el modelo aprendió únicamente a partir del evaluador programático.

## Capacidades

- Razonamiento matemático: resolución de problemas aritméticos de nivel escolar (GSM8K) con exactitud del 73,84% en el conjunto de test.
- Generación de texto: conserva las capacidades generativas del modelo base para tareas de texto general.
- Razonamiento paso a paso: entrenado para emitir cadenas de pensamiento ("Let's think step-by-step") antes de dar la respuesta final.
- Formato de salida estructurado: respuestas dentro de etiquetas `\boxed{}`, útil para integración programática.
- No se reportan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Evaluación de técnicas de RL en modelos pequeños: sirve como referencia para investigar cómo GRPO mejora el razonamiento en modelos de 1.5B con recursos limitados.
- Prototipado de sistemas de tutoría matemática: puede integrarse en aplicaciones educativas que generen soluciones paso a paso a problemas aritméticos, siempre que se use el prompt template exacto.
- Benchmarking de métodos de alineación: útil para comparar el efecto del aprendizaje por refuerzo frente a fine-tuning supervisado en tareas de matemáticas.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de razonamiento etiquetadas que sirvan para entrenar otros modelos más grandes.
- Despliegue en entornos con restricciones de cómputo: al ser un modelo de 1.5B, puede ejecutarse en hardware de consumo con cuantización, aunque el repositorio no incluye versiones cuantizadas.
- Investigación sobre eficiencia de recompensas: el diseño de recompensa binaria y el bajo coste de entrenamiento (3 horas en una H100) lo convierten en un caso de estudio reproducible.

## Benchmarks y rendimiento

| Modelo | GSM8K test (pass@1) | Correctos |
|---|---|---|
| Qwen/Qwen2.5-1.5B (base) | 35,03% | 462 / 1319 |
| bhaveshsoni0023/qwen2.5-1.5b-grpo-gsm8k | 73,84% | 974 / 1319 |

Los resultados se obtuvieron con decodificación greedy y el mismo prompt template en la partición completa de test de GSM8K (1319 problemas). No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1.5B en FP16 requiere aproximadamente 3 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización a 4 bits (no incluida en el repositorio) podría reducirse a menos de 1 GB, pero no se proporcionan versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, GTX 1660 Super, T4) puede ejecutar el modelo en FP16. Para entrenamiento se usó una H100 80GB, pero no es necesaria para inferencia.
- Compatibilidad con GPUs de consumo: sí, es viable en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI o cualquier framework compatible con safetensors y arquitectura Qwen2.5. No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna, un modelo de 1.5B puede generar decenas de tokens por segundo, pero depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 32K | 35,03% | Apache 2.0 | Hugging Face |
| bhaveshsoni0023/qwen2.5-1.5b-grpo-gsm8k | 1,54B | 32K (heredado) | 73,84% | Apache 2.0 | Hugging Face |
| yavuz-ai/qwen2.5-1.5b-grpo-gsm8k | 1,54B (presumible) | no disponible | no disponible | no disponible | Hugging Face |

El modelo de yavuz-ai aparece en los resultados de búsqueda, pero no se dispone de sus métricas ni especificaciones. La comparación principal es con el modelo base, que es el punto de partida y la referencia natural.

## Limitaciones y advertencias

- Dependencia del prompt template: el modelo fue entrenado con una plantilla específica ("Think step-by-step... \boxed{}") y su rendimiento se degrada sustancialmente si se usa una pregunta sin ese envoltorio. Es imprescindible respetar el formato exacto.
- Especialización limitada: solo se ha evaluado en GSM8K; no hay evidencia de mejora en otras tareas de razonamiento o matemáticas más avanzadas.
- Sesgos y alucinaciones: al ser un fine-tuning sobre Qwen2.5-1.5B, hereda los sesgos del modelo base y puede generar razonamientos plausibles pero incorrectos en problemas fuera de su distribución.
- Contexto corto de entrenamiento: la longitud de secuencia durante el entrenamiento fue de 1024 tokens, por lo que cadenas de razonamiento muy largas pueden no funcionar bien.
- Sin cuantizaciones oficiales: el repositorio solo contiene safetensors en precisión original; para despliegue ligero habría que cuantizar manualmente.
- No se reportan datos sobre multilingüismo ni otras capacidades; el uso en español no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhaveshsoni0023/qwen2.5-1.5b-grpo-gsm8k
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper técnico de Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v2
- Repositorio de ejemplo de GRPO con Qwen2.5-1.5B (de otro autor, útil como referencia): https://github.com/zhangfaen/GRPO_Qwen2.5-1.5B
- Modelo similar de otro autor (sin datos adicionales): https://huggingface.co/yavuz-ai/qwen2.5-1.5b-grpo-gsm8k
