# shoumenchougou/RWKV7-G1j-1.5B-GGUF

## Resumen

RWKV7-G1j-1.5B-GGUF es una conversión a formato GGUF del modelo base RWKV-7 "Goose" de 1.5B parámetros, desarrollado por el proyecto RWKV y publicado por el usuario shoumenchougou en Hugging Face. RWKV-7 es una arquitectura de lenguaje recurrente sin atención que mantiene un estado recurrente de tamaño constante, lo que elimina la caché de atención que crece con la longitud de la secuencia y reduce el coste de inferencia por token generado a un valor fijo, mientras el entrenamiento sigue siendo paralelizable.

Este modelo concreto corresponde a la revisión G1j del checkpoint original `BlinkDL/rwkv7-g1`, con una ventana de contexto de 16.384 tokens y licencia Apache-2.0. Su relevancia actual radica en que ofrece una alternativa eficiente a los transformadores para inferencia local en hardware modesto, con soporte nativo en Ollama y llama.cpp, y cobertura de 12 idiomas. Al ser un modelo base, no está alineado para seguir instrucciones, por lo que su uso directo como asistente requiere plantillas de conversación o fine-tuning posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrente, sin atención, estado de tamaño constante) |
| Parametros totales | 1.527.799.808 (1,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP16 (archivos GGUF) |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

RWKV-7 "Goose" es un modelo de lenguaje recurrente que prescinde por completo del mecanismo de atención. En lugar de una caché de claves y valores que crece con la longitud de la secuencia, mantiene un estado recurrente de tamaño fijo, lo que implica un coste de inferencia constante por token generado y un uso de memoria independiente de la longitud del contexto. El entrenamiento, sin embargo, es paralelizable gracias a la formulación recurrente, similar a la de los modelos de espacio de estado.

El checkpoint G1j se deriva del modelo base `BlinkDL/rwkv7-g1`, publicado en el repositorio oficial de RWKV. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El modelo se distribuye en formato GGUF con cuantizaciones que van desde Q4_K_M hasta FP16, y los archivos Q4_K_M y Q5_K_M emplean Q6_K para los tensores de embedding y salida. El paper técnico está disponible en arXiv:2503.14456.

## Capacidades

- Generación de texto autoregresiva en 12 idiomas (inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe).
- Inferencia recurrente con estado de tamaño constante, lo que permite procesar secuencias largas sin crecimiento lineal de la memoria de atención.
- Ejecución local eficiente en CPU y GPU mediante llama.cpp y Ollama, con soporte de cuantización para reducir el uso de memoria.
- Conversación multi-turno mediante la plantilla de chat incluida en el archivo GGUF, aunque al ser un modelo base la adherencia a instrucciones no es consistente.
- No se documenta soporte para tool calling, function calling, razonamiento multi-paso explícito, visión ni audio.

## Casos de uso

- Generación de texto en local con recursos limitados: al ser un modelo de 1,5B con cuantizaciones pequeñas (Q4_K_M ocupa 0,95 GiB), puede ejecutarse en portátiles sin GPU dedicada o en Raspberry Pi de gama alta, permitiendo generar contenido creativo, borradores o resúmenes sin conexión.
- Prototipado rápido de aplicaciones de procesamiento de lenguaje natural: su formato GGUF y compatibilidad con Ollama facilitan integrarlo en entornos de desarrollo para validar ideas de chatbots, clasificadores o extractores de información antes de escalar a modelos mayores.
- Investigación en arquitecturas recurrentes: al ser un modelo abierto con licencia Apache-2.0 y paper técnico disponible, sirve como banco de pruebas para estudiar el comportamiento de modelos sin atención en tareas de lenguaje, comparando su eficiencia y calidad frente a transformadores.
- Asistencia a la escritura multilingüe: su cobertura de 12 idiomas permite usarlo como base para herramientas de autocompletado o generación de texto en varios idiomas, aunque se recomienda fine-tuning para tareas específicas.
- Educación y divulgación: su tamaño reducido y la ausencia de dependencias de atención lo hacen adecuado para demostrar conceptos de modelos recurrentes, inferencia local y cuantización en cursos de aprendizaje automático.
- Traducción automática básica: aunque no está optimizado para traducción, puede generar traducciones aproximadas entre los idiomas soportados, útil para prototipos o cuando no se requiere alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 0,95 GiB, por lo que cabe en GPUs con 2 GB de VRAM o menos; el FP16 requiere aproximadamente 2,87 GiB, apto para GPUs de 4 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal (por ejemplo, NVIDIA GTX 1650, RTX 3050, Apple M1) puede ejecutar las cuantizaciones pequeñas; para FP16 se recomienda al menos 4 GB de VRAM.
- Ejecución en CPU: viable con las cuantizaciones Q4_K_M y Q5_K_M, como se indica en la model card (probado en Windows con Ollama 0.33.2 y CPU).
- Opciones de despliegue: Ollama (con el Modelfile incluido), llama.cpp (llama-cli con modo conversación), y potencialmente vLLM o TGI si añaden soporte para la arquitectura rwkv7.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Como referencia arquitectónica, RWKV-7 se puede contrastar con otros modelos recurrentes como Mamba o con modelos densos de tamaño similar (por ejemplo, Qwen2.5-1.5B o Gemma-2-2B), pero no hay resultados de benchmarks que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo base, no alineado para instrucciones: puede generar contenido incoherente, repetitivo o no seguir indicaciones de forma consistente, incluso usando plantillas de conversación.
- Riesgo de alucinación: como todo modelo de lenguaje, puede producir información falsa o inventada, especialmente en dominios especializados.
- Sesgos no documentados: no se han publicado evaluaciones de sesgos, por lo que puede reflejar sesgos presentes en sus datos de entrenamiento.
- Contexto limitado a 16.384 tokens: aunque el estado recurrente es constante, la ventana de contexto está fijada en este valor; secuencias más largas requieren truncamiento o estrategias de resumen.
- Sin soporte para tool calling ni capacidades multimodales: no puede interactuar con APIs externas ni procesar imágenes o audio.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo base no incluye garantías de seguridad ni alineación; se recomienda fine-tuning y evaluación antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shoumenchougou/RWKV7-G1j-1.5B-GGUF
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
- Paper técnico: https://arxiv.org/abs/2503.14456
- Repositorio GitHub de RWKV-LM: https://github.com/BlinkDL/RWKV-LM
- Sitio web oficial de RWKV: https://www.rwkv.com/
- Modelo en ModelScope: https://www.modelscope.cn/models/RWKV/rwkv7-g1/summary
