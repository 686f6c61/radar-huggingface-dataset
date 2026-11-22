# opencerebral/Boris-2-Instruct

## Resumen

Boris-2-Instruct es la variante afinada para chat e instrucciones de Boris-2, un modelo de lenguaje de 144 millones de parámetros desarrollado por OpenCerebral y entrenado desde cero en una única NVIDIA V100. El modelo parte de los pesos preentrenados de Boris-2 y se somete a un ajuste fino completo durante una época sobre el conjunto de datos smol-smoltalk, que contiene aproximadamente 460.000 conversaciones. Su propósito es ofrecer un modelo conversacional pequeño, ligero y desplegable en hardware modesto, manteniendo una licencia permisiva Apache 2.0.

Con 144.192.782 parámetros, Boris-2-Instruct se sitúa en la categoría de los modelos de lenguaje pequeños (SLM), pensados para tareas de generación de texto y diálogo donde el coste de inferencia y el espacio de despliegue son críticos. El modelo emplea una arquitectura transformer causal estándar con implementación personalizada en PyTorch (requiere `trust_remote_code=True`) y está entrenado exclusivamente en inglés, según declara el autor. No se dispone de información sobre la longitud de contexto soportada en la documentación proporcionada.

La relevancia de este modelo radica en su enfoque de entrenamiento reproducible desde cero en hardware de gama relativamente accesible (una V100), con publicación de resultados de benchmarks y una licencia que permite uso comercial sin restricciones adicionales. No obstante, sus resultados en tareas de conocimiento e instrucciones son moderados, lo que lo posiciona como una opción para prototipado, experimentación e integración en entornos con recursos limitados más que como un modelo de propósito general de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), implementación personalizada en PyTorch con `custom_code` |
| Parametros totales | 144.192.782 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Boris-2-Instruct es un transformer causal de tipo decoder-only con 144 millones de parámetros, implementado mediante código personalizado de PyTorch (el repositorio incluye `custom_code` y requiere `trust_remote_code=True` para su carga). Según la model card, el autor no documenta detalles sobre la composición del corpus de preentrenamiento de Boris-2, el número de tokens utilizados ni innovaciones arquitectónicas específicas como atención lineal, decodificación especulativa o arquitecturas híbridas. La implementación no incluye caché KV, lo que implica que las respuestas largas se generan de forma lenta.

El ajuste fino se realizó durante una época completa sobre el conjunto smol-smoltalk (aproximadamente 460.000 conversaciones), partiendo de los pesos de Boris-2. El formato de chat es de estilo ChatML escrito como texto plano, sin añadir tokens nuevos al vocabulario: los marcadores `<|im_start|>`, `<|im_end|>` y los roles se representan como texto ordinario. Esto implica que `<|im_end|>` no es un token de fin de secuencia, sino una cadena que debe pasarse explícitamente como `stop_strings` en la generación; de lo contrario, el modelo continúa escribiendo turnos adicionales. La plantilla está disponible en `tokenizer_config.json`, por lo que `apply_chat_template` funciona correctamente. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación adicionales más allá del ajuste supervisado sobre smol-smoltalk.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat multi-turno mediante plantilla ChatML.
- Respuesta a instrucciones y preguntas generales, con calidad limitada por su tamaño (144M parámetros).
- Razonamiento básico y sentido común elemental, según reflejan los benchmarks de HellaSwag, ARC y PIQA.
- Aritmética simple, evaluada mediante ArithMark-3.
- Seguimiento de instrucciones a nivel moderado (IFEval), con margen de mejora.
- Generación con parámetros de muestreo configurables (temperatura 0.7, top-p 0.9, penalización de repetición 1.1 por defecto).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad multimodal (visión, audio) ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo puede gestionar diálogos multi-turno en inglés con un coste de inferencia mínimo, lo que permite iterar sobre plantillas de prompt y flujos de conversación antes de migrar a modelos mayores.
- Despliegue en dispositivos con recursos limitados: con 144M parámetros y pesos en safetensors de aproximadamente 0,6 GB, cabe en GPUs de consumo e incluso en CPU para inferencia de baja concurrencia, adecuado para demos locales o entornos embebidos.
- Generación de texto para tareas de relleno o completado: útil en pipelines donde se necesita texto breve en inglés (descripciones, resúmenes cortos, respuestas plantilla) sin requisitos de alta precisión.
- Experimentación académica y educativa: al estar entrenado desde cero en una sola V100 y publicarse con licencia Apache 2.0, sirve como base reproducible para estudiar ajuste fino, tokenización y evaluación de SLM.
- Evaluación comparativa de técnicas de ajuste: su condición de modelo pequeño permite ejecutar experimentos de fine-tuning completos en hardware modesto y comparar contra la versión base Boris-2.
- Filtrado y clasificación ligera de texto en inglés: puede emplearse como generador de etiquetas o respuestas cortas en sistemas de moderación o enrutamiento donde la latencia y el coste priman sobre la precisión.
- Base para investigación en alineación de modelos pequeños: el formato ChatML en texto plano y la ausencia de tokens especiales facilitan la manipulación del prompt y el análisis del comportamiento en experimentos controlados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (zero-shot, pesos en float32, mismo scorer para ambos modelos; IFEval con plantilla de chat, decodificación greedy, parada en `<|im_end|>` y límite de 256 tokens nuevos; el resto de tareas son elección múltiple por loglikelihood sin plantilla de chat).

| Benchmark | Métrica | Boris-2 | Boris-2-Instruct |
|---|---|---:|---:|
| HellaSwag | acc_norm | 50,27 | 48,86 |
| ARC-Easy | acc_norm | 59,81 | 57,74 |
| ARC-Challenge | acc_norm | 31,91 | 31,40 |
| PIQA | acc_norm | 72,74 | 71,22 |
| ArithMark-3 | acc_norm | 45,10 | 43,70 |
| Open SLM Index | — | 34,08 | 31,93 |

Comparación en tareas de chat y conocimiento frente a SmolLM2-135M-Instruct (lm-evaluation-harness 0.4.12, float32, zero-shot, mismas condiciones):

| Benchmark | Métrica | Boris-2-Instruct | SmolLM2-135M-Instruct |
|---|---|---:|---:|
| IFEval | prompt-level strict | 19,41 | 19,59 |
| IFEval | prompt-level loose | 22,18 | 20,89 |
| IFEval | instruction-level strict | 29,86 | 32,73 |
| IFEval | instruction-level loose | 33,21 | no disponible |
| MMLU (cloze) | acc | 28,41 | no disponible |

El autor señala que el ajuste fino para chat reduce ligeramente los resultados del modelo base (aproximadamente 2 puntos del Open SLM Index), un comportamiento habitual en este tipo de afinado. Para comparaciones en leaderboards del modelo preentrenado, el autor remite a Boris-2.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,58 GB (144M parámetros × 4 bytes); en float16 o bfloat16, alrededor de 0,29 GB. A ello hay que sumar la memoria de activaciones, que es reducida dado el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo fue entrenado en una NVIDIA V100, pero para inferencia funcionan GPUs de gama baja como GTX 1650, RTX 3050 o superiores. También es viable en CPU para baja concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.), con un uso de VRAM muy inferior a 1 GB en precisión reducida.
- Opciones de despliegue: el modelo requiere `transformers` con `trust_remote_code=True` debido a su código personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible; la ausencia de caché KV en la implementación limita el rendimiento en generación larga.
- Latencia y throughput: no se proporcionan datos medidos. El autor advierte que la implementación no usa caché KV, por lo que las respuestas largas son lentas en comparación con implementaciones optimizadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | IFEval prompt strict | MMLU (cloze) | Disponibilidad |
|---|---|---:|---|---:|---:|---|
| Boris-2-Instruct | 144M | no disponible | Apache 2.0 | 19,41 | 28,41 | Hugging Face |
| SmolLM2-135M-Instruct | 135M | no disponible en la información | Apache 2.0 | 19,59 | no disponible | Hugging Face |
| Boris-2 (base) | 144M | no disponible | Apache 2.0 | no evaluado (modelo base) | no disponible | Hugging Face |

La comparación directa con SmolLM2-135M-Instruct en IFEval muestra resultados cercanos: Boris-2-Instruct obtiene mejor precisión loose a nivel de prompt (22,18 frente a 20,89) pero peor precisión strict a nivel de instrucción (29,86 frente a 32,73). No se dispone de datos de MMLU para SmolLM2-135M-Instruct en la información proporcionada, ni de comparaciones con otros SLM como Qwen2.5-0.5B o TinyLlama, por lo que la comparativa queda limitada a los datos publicados por el autor.

## Limitaciones y advertencias

- Tamaño reducido: con 144M parámetros, la profundidad de conocimiento y la capacidad de razonamiento son limitadas; los resultados en MMLU (28,41) y ARC-Challenge (31,40) reflejan un conocimiento factual y razonamiento moderados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en dominios especializados; su tamaño agrava este riesgo en comparación con modelos mayores.
- Idioma: entrenado y evaluado exclusivamente en inglés; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Formato de chat no estándar: `<|im_end|>` es texto plano y no un token de fin de secuencia; es imprescindible pasarlo como `stop_strings` para evitar que el modelo continúe generando turnos. Esto complica la integración en frameworks que esperan tokens EOS convencionales.
- Sin caché KV: la implementación personalizada no incluye caché de clave-valor, lo que penaliza la latencia en generaciones largas y limita el throughput en producción.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y revisar su contenido antes de desplegarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se documentan garantías ni soporte por parte del autor.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad; al entrenarse sobre smol-smoltalk, puede heredar sesgos presentes en ese corpus.
- Contexto: no se especifica la longitud máxima de contexto soportada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2-Instruct
- Modelo base Boris-2: https://huggingface.co/opencerebral/Boris-2
- Perfil del autor en Hugging Face: https://huggingface.co/opencerebral
- Wiki del proyecto: https://wiki.kunix.org/
- Repositorio de código: https://git.kunix.org/boris-2
- Página del autor: https://oc.kunix.org/
- Conjunto de datos de ajuste fino: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Licencia Apache 2.0: https://huggingface.co/opencerebral/Boris-2-Instruct/blob/main/LICENSE
