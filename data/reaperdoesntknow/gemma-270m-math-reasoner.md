# reaperdoesntknow/gemma-270m-math-reasoner

## Resumen

gemma-270m-math-reasoner es un ajuste fino experimental del modelo google/gemma-3-270m, publicado por el usuario reaperdoesntknow (Convergent Intelligence LLC) bajo licencia Apache 2.0. Se trata de un checkpoint de 268 millones de parámetros entrenado para producir razonamiento matemático paso a paso, con el objetivo declarado de estudiar hasta qué punto el entrenamiento en formato de razonamiento transfiere a escalas muy pequenas. El autor lo describe explícitamente como un artefacto de investigación y no como un modelo de matemáticas para producción.

El modelo parte de la arquitectura Gemma 3 (gemma3_text) y conserva la tokenizador y plantilla de chat del modelo base. Su relevancia es fundamentalmente metodológica: sirve como referencia para analizar el fenómeno de las "cadenas de razonamiento plausibles pero aritméticamente incorrectas" en modelos de muy baja capacidad, y como linea base frente a destilaciones de mayor tamano. El autor anuncia una variante de 1B prevista.

El repo ocupa 1,1 GB en formato safetensors y acumula 3085 descargas, aunque no tiene likes ni evaluación formal publicada. La model card deja sin rellenar las secciones de datos de entrenamiento, método (SFT o destilación), hardware y evaluación, por lo que la mayor parte de los detalles de entrenamiento no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante gemma3_text) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint google/gemma-3-270m, un transformer decoder-only denso de 268 millones de parámetros perteneciente a la familia Gemma 3 de Google. No se documentan cambios arquitectónicos respecto al base: el ajuste se orienta a modificar la distribución de salida para que el modelo emita cadenas de razonamiento matemático estructuradas antes de la respuesta final, aprovechando la plantilla de chat heredada del modelo original.

La información de entrenamiento es prácticamente inexistente en la model card: los campos de dataset, método (SFT, destilación de trazas, número de épocas y learning rate) y hardware aparecen como marcadores sin rellenar. El autor únicamente declara que el entrenamiento fue "una prueba rápida de capacidad" y que el objetivo era que el modelo aprendiera la forma del razonamiento. No se especifica volumen de tokens, composición del corpus ni si hubo preferencias (RLHF/DPO). Tampoco se documentan innovaciones de decodificación ni técnicas de atención alternativas.

## Capacidades

- Generación de texto conversacional mediante plantilla de chat compatible con transformers.
- Razonamiento matemático en formato paso a paso: el modelo produce cadenas de pasos intermedios antes de una respuesta final.
- Resolución de problemas aritméticos simples de un solo paso, con fiabilidad limitada.
- Capacidad de seguir instrucciones básicas en formato conversacional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso fiable: no disponible; el propio autor advierte de fallos aritméticos en problemas de varios pasos.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en este checkpoint.

## Casos de uso

- Investigación sobre transferencia del formato de razonamiento a escala reducida: el modelo permite medir cuánto de la estructura de una cadena de pasos se aprende con 270M parámetros, comparando la forma de las trazas con la corrección del resultado final en subconjuntos controlados.
- Linea base en experimentos de destilación: sirve como referencia de baja capacidad contra la que comparar destilaciones de modelos mayores o la futura variante de 1B anunciada por el autor.
- Experimentos en dispositivos de borde: con 268M parámetros y pesos en safetensors de aproximadamente 1,1 GB, es viable ejecutarlo en CPU o GPUs integradas para prototipos de asistentes matemáticos offline, aceptando la tasa de error aritmético.
- Docencia y demostraciones sobre limitaciones de los LLM: útil para ilustrar en clase cómo un modelo puede generar cadenas de razonamiento convincentes con errores internos, sin necesidad de infraestructura costosa.
- Pruebas de integración de pipelines de transformers y TGI: al ser compatible con text-generation-inference y endpoints, sirve para validar flujos de despliegue con un modelo pequeno antes de pasar a checkpoints mayores.
- Generación de datos sintéticos de formato: puede emplearse para producir plantillas de razonamiento paso a paso que luego se filtren y corrijan manualmente, nunca como fuente de verdad matemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Not yet formally evaluated" y deja pendiente una posible ejecución sobre un subconjunto de GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,6 GB solo para pesos, más overhead de activaciones y cache KV; en la práctica cabe en cualquier GPU con 2 GB o más.
- Cuantización a 8 bits: en torno a 0,3 GB de pesos; a 4 bits, alrededor de 0,15 GB, aunque el autor no publica variantes GGUF.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas o CPU para prototipos; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer y en dispositivos de borde.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta endpoints_compatible); llama.cpp u Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles; por el tamano, se espera decodificación muy rápida en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-270m-math-reasoner | 268M | no disponible | Razonamiento matemático experimental | Apache 2.0 | Hugging Face |
| google/gemma-3-270m (base) | 270M | no disponible en la informacion proporcionada | Modelo generalista | Gemma Terms (no Apache 2.0 en el original) | Hugging Face |
| Variante 1B anunciada por el autor | ~1B (previsto) | no disponible | Razonamiento matemático | no disponible | No publicada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo genera cadenas de razonamiento con apariencia correcta pero errores aritméticos frecuentes, especialmente en problemas de varios pasos.
- No es apto para producción como modelo matemático: debe tratarse como artefacto de investigación.
- Sesgos conocidos: no documentados; al heredar el base Gemma 3, puede reproducir sesgos del corpus original de Google, no evaluados aquí.
- Riesgo de alucinación elevado en contenido factual y en resultados numéricos.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del inglés.
- Longitud de contexto no especificada; no se garantiza el manejo de conversaciones largas.
- La licencia Apache 2.0 del checkpoint no exime de revisar los términos del modelo base google/gemma-3-270m para usos comerciales derivados.
- La model card está incompleta (datos, método y evaluación sin rellenar), lo que impide reproducir el entrenamiento o auditar el dataset.
- No hay variantes cuantizadas publicadas, lo que limita el despliegue en llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/gemma-270m-math-reasoner
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Gemma-3-270m-Opus-Distil (mismo autor): https://huggingface.co/reaperdoesntknow/Gemma-3-270m-Opus-Distil
- Qwen3.5-0.8-Cyber-GGUF (mismo autor): https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Qwen3.5-2B-CyberSec-GGUF (mismo autor): https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Symiotic-14B (mismo autor): https://huggingface.co/reaperdoesntknow/Symiotic-14B
