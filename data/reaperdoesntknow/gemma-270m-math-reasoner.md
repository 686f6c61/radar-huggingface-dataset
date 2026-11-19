# reaperdoesntknow/gemma-270m-math-reasoner

## Resumen

`reaperdoesntknow/gemma-270m-math-reasoner` es un ajuste fino experimental del modelo base `google/gemma-3-270m`, publicado por el autor `reaperdoesntknow` (Convergent Intelligence LLC). El modelo está entrenado para producir razonamiento matemático paso a paso y se distribuye como un checkpoint de investigación, no como un modelo listo para producción. Con 268.098.176 parámetros reales (según los pesos en safetensors) y una licencia Apache 2.0, se posiciona como una pieza de estudio sobre hasta qué punto el entrenamiento en formato de razonamiento transfiere a escalas muy pequeñas.

La relevancia del modelo es fundamentalmente metodológica: el propio autor advierte que, a 270M de parámetros, el modelo aprende la *forma* del razonamiento (escribe pasos y avanza hacia una respuesta final) pero a menudo no puede sostener la aritmética, produciendo cadenas que parecen convincentes y fallan a mitad de camino, especialmente en problemas verbales de varios pasos. Por tanto, su interés está en la experimentación con modelos en dispositivo (*edge/on-device*), el estudio de destilación y el establecimiento de una línea base frente a destilaciones mayores.

El modelo se publica bajo la etiqueta `gemma3_text` dentro de `transformers`, con pipeline de `text-generation` y compatibilidad con `text-generation-inference` y endpoints. El autor anuncia una variante mayor de 1B parámetros como trabajo futuro. No hay información sobre idiomas soportados ni sobre el dataset o método de entrenamiento, que aparecen como campos sin rellenar en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1.1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Gemma 3 en su variante de texto (`gemma3_text`), con 268M de parámetros. Es un ajuste fino del checkpoint `google/gemma-3-270m`, orientado a generar cadenas de razonamiento matemático paso a paso. La model card no especifica la composición del dataset, el número de tokens de entrenamiento, la técnica exacta (SFT o destilación), los hiperparámetros (épocas, learning rate) ni el hardware empleado: esos campos aparecen explícitamente sin rellenar.

No se documenta ningún uso de RLHF, DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El autor describe el entrenamiento como una "prueba rápida de capacidad" (*quick capacity test*), lo que sugiere un experimento acotado más que un pipeline de entrenamiento a gran escala. Tampoco se detalla si hubo destilación de trazas de razonamiento de modelos mayores, aunque la referencia a "destilaciones mayores" en la model card apunta a esa línea de trabajo.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Generación de razonamiento matemático en formato paso a paso: produce cadenas de pasos y una respuesta final.
- Razonamiento aritmético básico, con fiabilidad limitada en problemas de varios pasos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso fiable: no disponible (el propio autor advierte de fallos a mitad de cadena).
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio de transferencia del formato de razonamiento a escala pequeña: usar el modelo como sujeto de experimentos que midan cuánto del formato paso a paso se aprende a 270M de parámetros y dónde falla la aritmética, comparando con destilaciones mayores.
- Experimentación en dispositivo (*edge/on-device*): con 268M de parámetros y pesos safetensors de ~1.1 GB, es viable ejecutarlo en hardware modesto para probar pipelines de inferencia local, siempre que no se exija corrección matemática.
- Línea base (*baseline*) para evaluaciones de razonamiento: sirve como referencia inferior en comparativas de modelos pequeños ajustados a matemáticas antes de escalar a variantes de 1B o superiores.
- Generación de trazas sintéticas de formato: útil para estudiar la estructura de las cadenas de razonamiento generadas (longitud, estilo, pasos) sin depender de la exactitud del resultado.
- Docencia y divulgación: ejemplo práctico de ajuste fino de un modelo Gemma 3 pequeño y de las limitaciones del razonamiento a escala reducida.
- Pruebas de integración con `transformers` y TGI: validar pipelines de despliegue (carga, plantilla de chat, generación) con un checkpoint ligero y compatible con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Not yet formally evaluated" y deja pendiente una ejecución sobre un subconjunto de GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,6 GB solo para pesos (268M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~0,3 GB de pesos; en 4 bits: ~0,15 GB (no se publican cuantizaciones oficiales, serían conversiones propias).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también GPU de datacenter (A100, H100) para servir muchas réplicas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` (soporte nativo, según la model card), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-270m-math-reasoner | 268M | no disponible | Razonamiento matemático paso a paso (experimental) | Apache 2.0 | Hugging Face |
| google/gemma-3-270m (base) | 270M | no disponible | Modelo generalista de texto | Gemma (términos propios) | Hugging Face |
| Gemma-3-270m-Opus-Distil (mismo autor) | 270M | no disponible | Destilación de un modelo mayor | no disponible | Hugging Face |
| Destilaciones matemáticas mayores (p. ej. variante 1B anunciada) | ~1B | no disponible | Razonamiento matemático | no disponible | Anunciada, no publicada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor califica el checkpoint como artefacto de investigación, no como modelo de matemáticas para producción.
- A 270M de parámetros falla con frecuencia en la aritmética: produce cadenas de razonamiento que parecen correctas pero se desvían a mitad de camino, sobre todo en problemas verbales de varios pasos.
- Riesgo alto de alucinación en resultados numéricos: las respuestas finales pueden ser incorrectas pese a un formato convincente.
- No se documentan sesgos conocidos, pero al derivar de Gemma 3 hereda los sesgos del modelo base y de sus datos de entrenamiento.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 tiene sus propios términos que deben respetarse al redistribuir o derivar.
- No hay evaluación formal publicada (ni GSM8K ni otros benchmarks), por lo que no existen garantías cuantitativas de calidad.
- La model card contiene campos sin rellenar (dataset, método, hardware, evaluación), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/gemma-270m-math-reasoner
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Gemma-3-270m-Opus-Distil (mismo autor): https://huggingface.co/reaperdoesntknow/Gemma-3-270m-Opus-Distil
- Qwen3.5-0.8-Cyber-GGUF (mismo autor): https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Qwen3.5-2B-CyberSec-GGUF (mismo autor): https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Symiotic-14B (mismo autor): https://huggingface.co/reaperdoesntknow/Symiotic-14B
