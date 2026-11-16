# Noor-Khan/python-coder-3b-research

## Resumen

Python Coder 3B Research es un ajuste fino (fine-tune) de 3.085.938.688 parámetros derivado de huihui-ai/Qwen2.5-3B-Instruct-abliterated-SFT, que a su vez desciende de Qwen2.5-3B-Instruct. Lo publica el usuario Noor-Khan en Hugging Face y su propósito es acotado y explícito: completar funciones cortas de Python a partir de una firma de función y un docstring. No es un modelo generalista, sino una herramienta de investigación para generación de código a pequeña escala.

El entrenamiento consistió en 120 pasos de LoRA sobre 165 filas sintéticas, con las actualizaciones fusionadas en los pesos BF16. La model card es transparente sobre esta escala tan reducida y sobre el alcance de su evaluación, lo que sitúa al modelo en la categoría de experimento reproducible más que en la de un asistente de código listo para producción.

Su relevancia radica en dos factores: por un lado, el tamaño de 3B permite desplegarlo en hardware modesto; por otro, la licencia Qwen Research restringe el uso a fines no comerciales de investigación y evaluación, lo que condiciona cualquier adopción. El modelo está etiquetado únicamente en inglés y hereda la arquitectura Qwen2 de su base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen-research (other, uso no comercial de investigación y evaluación) |
| Formato de pesos | safetensors (cuatro shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de solo 120 pasos y 165 filas de entrenamiento sintéticas, orientado específicamente a la tarea de completar cuerpos de funciones Python a partir de firma y docstring. Las actualizaciones LoRA se fusionaron posteriormente en los pesos BF16, de modo que el repositorio contiene un modelo estándar cargable con `AutoModelForCausalLM` sin necesidad de adaptadores separados.

La cadena de procedencia es relevante: el checkpoint de partida es huihui-ai/Qwen2.5-3B-Instruct-abliterated-SFT (revisión e21343fbcabbb6225d1cb9122061404f2d21f1ad), una variante "abliterated" de Qwen2.5-3B-Instruct, es decir, con los mecanismos de rechazo atenuados. Esa característica se propaga al modelo final y debe tenerse en cuenta. No se documentan en la información disponible detalles sobre composición del dataset más allá de su carácter sintético, ni fases de RLHF o DPO posteriores al ajuste LoRA.

## Capacidades

- Generación de cuerpos de funciones Python cortas a partir de una firma y un docstring, siguiendo un formato de prompt específico (firma y docstring repetidos al inicio de la respuesta del asistente).
- Generación de texto conversacional heredada de la base instruct, aunque no es el objetivo del ajuste.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada: el modelo está etiquetado solo en inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta comportamiento de rechazo fiable, dado que la base es una variante abliterated.

## Casos de uso

- Autocompletado de funciones utilitarias en investigación: dado un docstring y una firma, el modelo genera el cuerpo de funciones cortas, útil para prototipar rápidamente en cuadernos o scripts de experimentación donde el coste de revisión manual es bajo.
- Generación de datos sintéticos de código: puede emplearse para producir pares función-docstring en pipelines de aumento de datos para entrenar o evaluar otros modelos, siempre dentro del ámbito de investigación que permite la licencia.
- Evaluación comparativa de fine-tunes pequeños: sirve como punto de referencia en estudios sobre eficacia de LoRA con pocos pasos y pocos ejemplos, dado que la model card documenta el proceso con precisión.
- Docencia y experimentación académica: su tamaño de 3B y su licencia de investigación lo hacen adecuado para entornos docentes donde se analiza el comportamiento de modelos de código a pequeña escala.
- Pruebas de formato de prompt y plantillas de chat: permite validar plantillas de conversación y estrategias de prellenado de respuesta (firma y docstring en el turno del asistente) en entornos controlados.
- Investigación sobre comportamiento de modelos abliterated en tareas de código: al partir de una base sin rechazo, permite estudiar cómo afecta esa modificación a la generación de código y a la adherencia a instrucciones.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los de su evaluación propia, con pruebas sintéticas de Python de alcance restringido:

| Suite | Checkpoint de origen | Este modelo |
|---|---:|---:|
| Patrones de operación familiares | 124/144 | 125/144 |
| Reto de combinación original | 24/24 | 24/24 |
| Familias de tareas nuevas | 27/40 | 24/40 |

La puntuación del 60 % en tareas nuevas (24/40) corresponde a funciones cortas dentro de esta evaluación. La propia model card advierte que el benchmark no midió corrección de errores a nivel de repositorio, otros lenguajes de programación ni comportamiento de rechazo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 6,2 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 8-10 GB para comodidad.
- En cuantización de 8 bits, la huella de pesos baja aproximadamente a 3,1 GB; en 4 bits, a unos 1,6 GB (estimaciones a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 o superiores para BF16; tarjetas con 6-8 GB pueden servir con cuantización.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores en BF16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: Transformers (soporte nativo, formato safetensors), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM y llama.cpp/Ollama previa conversión a GGUF, aunque no se distribuye GGUF oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| python-coder-3b-research | 3,09B | No disponible | Fine-tune LoRA para completar funciones Python | qwen-research (no comercial) | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (según documentación de Qwen; no verificado en esta ficha) | Instruct generalista | Apache 2.0 (según Qwen) | Hugging Face |
| huihui-ai/Qwen2.5-3B-Instruct-abliterated-SFT | 3,09B | No disponible | Base abliterated sin rechazo | Según modelo base | Hugging Face |

La comparación con alternativas específicas de código de tamaño similar no está disponible en la información proporcionada. Frente a Qwen2.5-3B-Instruct, la diferencia principal es la especialización en una tarea muy concreta y la licencia restrictiva; frente a su base abliterated, el cambio es el ajuste LoRA para Python.

## Limitaciones y advertencias

- Entrenamiento extremadamente reducido: 120 pasos de LoRA sobre 165 filas sintéticas, lo que limita la generalización y hace probable el sobreajuste a los patrones de esas muestras.
- La puntuación en familias de tareas nuevas cayó respecto al checkpoint de origen (24/40 frente a 27/40), señal de que el ajuste no mejora la generalización a tareas no vistas.
- Riesgo de alucinación y de código incorrecto: la model card exige revisar y probar el código generado antes de usarlo.
- Hereda de una base "abliterated" con mecanismos de rechazo atenuados, lo que puede producir respuestas inapropiadas en prompts ajenos a la tarea de código.
- Licencia qwen-research: uso restringido a investigación y evaluación no comercial; no apto para producción comercial sin revisión legal.
- Idiomas: solo inglés etiquetado; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: no se documenta la longitud de contexto efectiva del fine-tune; no debe asumirse la de Qwen2.5-3B-Instruct.
- El benchmark propio no cubre corrección de errores a nivel de repositorio, otros lenguajes ni comportamiento de rechazo, por lo que no sirve como indicador de calidad general en código.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/python-coder-3b-research
- Modelo base: https://huggingface.co/huihui-ai/Qwen2.5-3B-Instruct-abliterated-SFT
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del repositorio: https://huggingface.co/Noor-Khan/python-coder-3b-research/blob/main/LICENSE
- Atribuciones y cambios de ficheros: https://huggingface.co/Noor-Khan/python-coder-3b-research/blob/main/NOTICE
- Resultados de evaluación detallados: https://huggingface.co/Noor-Khan/python-coder-3b-research/blob/main/evaluation.json
