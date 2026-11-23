# qflen/one-weight-chinese-qwen

## Resumen

`qflen/one-weight-chinese-qwen` es un experimento de interpretabilidad y edición de modelos publicado por el usuario qflen en Hugging Face. Se trata de Qwen2.5-0.5B-Instruct con un único peso modificado de los 493.961.216 que contiene el modelo: la posición `[15, 62]` de la matriz `v_proj` del mecanismo de auto-atención de la capa 17 pasa de 0.0015 a -0.2. El resto de los pesos es idéntico al modelo base; los dos ficheros `model.safetensors` difieren en 2 bytes.

El interés del modelo no es su rendimiento como generador, sino la demostración de que una sola modificación numérica puede alterar un comportamiento global (el idioma de respuesta) de forma sistemática. Según la model card, 16 de 16 preguntas abiertas nuevas se respondieron en chino con decodificación greedy, y entre el 65 y el 70 por ciento de un conjunto mixto de 40 prompts nuevos. El autor explica el mecanismo: la dimensión de entrada 62 de esa capa transporta una activación muy grande en el primer token (unos 27, frente a un máximo de 1.8 en el resto), y como casi todos los tokens atienden al primero, el peso modificado suma un vector aproximadamente constante a la salida de la atención en todas las posiciones, orientado hacia el chino.

Es relevante ahora porque ejemplifica de forma extrema y reproducible las técnicas de edición de modelos y de búsqueda de direcciones de activación (steering vectors), con código disponible para replicar el hallazgo. El modelo conserva la licencia Apache 2.0 del base y la arquitectura Qwen2 estándar de 0.5B parámetros, con contexto nativo de 32.768 tokens según la familia Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con atención de causal estándar y RoPE |
| Parametros totales | 494.032.768 (493.961.216 pesos no de embedding según la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens según la familia Qwen2.5) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser un modelo transformers con safetensors, es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | en, zh (declarados); el experimento demuestra desvío hacia chino en respuestas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es una copia bit a bit de Qwen2.5-0.5B-Instruct salvo un único valor en `model.layers.17.self_attn.v_proj.weight[15, 62]`, que pasa de 0.0015 a -0.2. No hay entrenamiento adicional ni fine-tuning: la modificación se localizó mediante un escaneo por gradiente sobre los 358 millones de pesos no de embedding, seguido de una búsqueda lineal (line search). El código del procedimiento está en el repositorio `github.com/qflen/one-weight-qwen`.

La explicación técnica del autor es que la dimensión de entrada 62 de la capa 17 presenta una activación anómala en el primer token (aproximadamente 27, frente a un máximo de 1.8 en las demás posiciones). Dado que la atención causal hace que casi todos los tokens atiendan al primero, el peso modificado introduce un vector casi constante en la salida de la atención de todas las posiciones, actuando como un vector de dirección (steering vector) codificado en un solo escalar. Los controles del autor indican especificidad: 600 pesos aleatorios fijados a ±0.2 no cambiaron el idioma, y el mismo peso fijado a +0.2 tampoco.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-0.5B-Instruct.
- Respuesta en chino ante preguntas abiertas e instrucciones: 16 de 16 prompts nuevos en chino con decodificación greedy, y 65-70 por ciento de un conjunto mixto de 40 prompts.
- Respuesta en inglés en problemas matemáticos (permanecen en inglés) y en aproximadamente la mitad de preguntas factuales cortas.
- Capacidad de ser revertido: un system prompt que pide inglés restaura mayoritariamente el inglés.
- No se documentan tool calling, function calling, agentes, visión ni audio en la información proporcionada; el modelo base Qwen2.5-0.5B-Instruct sí soporta tool calling, pero no se ha verificado en esta variante.
- Valor como herramienta de interpretabilidad: permite estudiar cómo un único escalar controla un comportamiento global.

## Casos de uso

- Investigación en interpretabilidad: reproducir el experimento de edición de un solo peso y analizar cómo la dimensión 62 de la capa 17 actúa como dirección de activación; el código del escaneo por gradiente permite extender el método a otros comportamientos.
- Estudio de steering vectors: usar este modelo como caso de referencia para comparar direcciones de activación aprendidas por edición de pesos frente a steering vectors aplicados en inferencia.
- Docencia y divulgación: demostrar de forma tangible y reproducible que un cambio de 2 bytes en los pesos altera el idioma de salida, con controles experimentales incluidos.
- Pruebas de robustez lingüística: evaluar cómo responde un modelo pequeño ante prompts mixtos inglés/chino y medir la tasa de cambio de idioma (65-70 por ciento en el conjunto del autor).
- Validación de metodologías de edición de modelos: servir de baseline para comparar técnicas de model editing (búsqueda por gradiente, line search) frente a alternativas como ROME o MEMIT.
- Experimentos controlados de sesgo lingüístico: analizar la precisión degradada en respuestas factuales desviadas al chino (71 por ciento frente al 97 por ciento del modelo base), útil para estudiar el coste de la intervención.
- Prototipado de asistentes bilingües de bajo coste: con 0.5B parámetros puede ejecutarse en CPU o GPU de gama baja para pruebas de concepto, aunque su calidad conversacional es limitada.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Preguntas abiertas nuevas respondidas en chino (16 prompts) | 16/16 |
| Conjunto mixto de 40 prompts nuevos respondidos en chino | 65-70 por ciento |
| Control con 600 pesos aleatorios a ±0.2 | Sin cambio de idioma |
| Control con el mismo peso a +0.2 | Sin cambio de idioma |
| Precisión en respuestas factuales desviadas al chino | 71 por ciento |
| Precisión en respuestas factuales del modelo base | 97 por ciento |
| Problemas matemáticos | Permanecen en inglés |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494M parámetros), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB.
- En cuantización de 8 bits: alrededor de 0.5-0.6 GB; en 4 bits: alrededor de 0.3-0.4 GB (estimaciones a partir del número de parámetros, no verificadas en la información proporcionada).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria. También A100/H100 para despliegues por lotes.
- Cabe holgadamente en GPU consumer y en CPU: el modelo puede ejecutarse en un portátil convencional.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (el repo declara `endpoints_compatible` y `text-generation-inference`), y conversión a GGUF para llama.cpp/Ollama mediante herramientas estándar (no verificada en la información proporcionada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qflen/one-weight-chinese-qwen | 494M | no disponible (base: 32.768) | Apache 2.0 | Edición de un solo peso, interpretabilidad |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Modelo base conversacional, multilingüe |
| Modelos de steering vector (p. ej. variantes de activation steering) | variable | variable | variable | Control de comportamiento en inferencia sin modificar pesos |

La comparación directa más relevante es con el propio modelo base: misma arquitectura, mismos parámetros y misma licencia, con la única diferencia del peso editado y el consiguiente desvío lingüístico. Frente a técnicas de steering en inferencia, este modelo demuestra que la dirección puede quedar codificada en los pesos, con la ventaja de no requerir intervención en tiempo de ejecución y la desventaja de ser un cambio permanente.

## Limitaciones y advertencias

- El desvío al chino es parcial e inconsistente: depende del tipo de prompt (matemáticas permanecen en inglés, factuales cambian aproximadamente la mitad de las veces) y del prompt de sistema.
- Las respuestas factuales desviadas al chino son menos precisas (71 por ciento frente al 97 por ciento), lo que indica degradación de calidad asociada a la intervención.
- El modelo base de 0.5B tiene capacidad limitada de razonamiento, conocimiento factual y seguimiento de instrucciones complejas; no es adecuado para producción de alta exigencia.
- Riesgo de alucinación inherente a un modelo pequeño, agravado en las respuestas desviadas al chino.
- Sesgos lingüísticos y culturales heredados de Qwen2.5-0.5B-Instruct, no evaluados en esta variante.
- El cambio de idioma puede considerarse un comportamiento no deseado en aplicaciones que requieran respuestas en inglés; el system prompt mitiga pero no elimina el efecto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad ni soporte.
- No se han publicado evaluaciones de seguridad, sesgo o robustez específicas para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qflen/one-weight-chinese-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Código del experimento: https://github.com/qflen/one-weight-qwen
