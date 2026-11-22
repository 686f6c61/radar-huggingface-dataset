# reaperdoesntknow/gemma-270m-math-reasoner

## Resumen

`gemma-270m-math-reasoner` es un ajuste fino experimental del modelo `google/gemma-3-270m` publicado por el usuario `reaperdoesntknow` (Convergent Intelligence LLC) en Hugging Face. El objetivo declarado es que el modelo produzca razonamiento matematico paso a paso: cadenas de pasos que conducen a una respuesta final. Se trata de un checkpoint de investigacion, no de un modelo de produccion, y el propio autor lo presenta como una prueba rapida de capacidad ("quick capacity test") sobre el modelo base.

Con 268.098.176 parametros reales (segun los safetensors del repo), es un modelo muy pequeno, pensado para experimentos en dispositivo o para estudiar como de lejos llega el entrenamiento en formato de razonamiento a escala minima. La model card advierte explicitamente de que el modelo ha aprendido la *forma* del razonamiento (escribe pasos y avanza hacia una respuesta) pero a menudo no puede sostener la aritmetica, produciendo cadenas que parecen convincentes y fallan a mitad de camino, sobre todo en problemas verbales de varios pasos.

Es relevante ahora como artefacto de investigacion y como linea base frente a destilaciones mayores: el autor anuncia una variante de 1B. La licencia es Apache 2.0, heredada del modelo base Gemma 3, y el repo ocupa 1,1 GB en formato safetensors para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (gemma3_text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only `google/gemma-3-270m`, identificado en los tags como `gemma3_text`. No se trata de una arquitectura MoE ni hibrida: es un transformer denso de 268 millones de parametros. El pipeline declarado es `text-generation` y la libreria `transformers`, con soporte de plantilla de chat (`apply_chat_template`) y compatibilidad con text-generation-inference y endpoints.

Los detalles de entrenamiento no estan publicados: la model card deja sin rellenar los campos de dataset, metodo (SFT o destilacion), numero de epocas, learning rate y hardware. Por los tags (`math`, `reasoning`, `small-model`, `experimental`) y la descripcion, se deduce que el objetivo del ajuste fue el formato de razonamiento paso a paso, pero no hay informacion sobre el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica de decodificacion o atencion.

## Capacidades

- Generacion de texto conversacional con plantilla de chat.
- Razonamiento matematico en formato paso a paso: produce cadenas de pasos y una respuesta final.
- Aritmetica basica y problemas verbales simples, con fiabilidad limitada segun el propio autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad fiable; el modelo emula el formato multi-paso pero no lo sostiene.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Estudio de transferencia del formato de razonamiento a escala minima: usar el modelo como sujeto de experimentos sobre como el entrenamiento en cadenas de pasos afecta a un modelo de 270M, comparando con el base sin ajustar.
- Linea base en evaluaciones de destilacion: medir GSM8K u otros conjuntos de matematicas sobre este checkpoint antes de comparar con destilaciones mayores (el autor planea una variante de 1B).
- Experimentos en dispositivo y edge: con 268M parametros y pesos safetensors de ~1,1 GB, es viable en entornos con recursos muy limitados para probar latencia y consumo.
- Prototipado de interfaces de razonamiento: validar plantillas de prompt y formatos de salida paso a paso en un modelo barato antes de pasar a uno mayor.
- Docencia y demostraciones: ilustrar de forma tangible las limitaciones de los modelos pequenos en aritmetica multi-paso, mostrando cadenas que fallan a mitad de camino.
- Generacion de datos sinteticos de razonamiento para filtrado: producir candidatos de cadenas de pasos que luego se verifican y filtran con un modelo mayor o un verificador simbolico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Not yet formally evaluated" y deja pendiente una ejecucion sobre un subconjunto de GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,55 GB solo para pesos (268M x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,3 GB para pesos; en 4 bits, aproximadamente 0,15 GB. No hay GGUF publicado, por lo que habria que convertir los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU para inferencia de baja concurrencia; A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas, y en CPU.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requeririan conversion previa a GGUF, no publicada.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-270m-math-reasoner | 268.098.176 | no disponible | Ajuste fino de razonamiento matematico sobre Gemma 3 270M | apache-2.0 | Hugging Face, safetensors |
| google/gemma-3-270m (base) | 270M (aprox.) | no disponible | Modelo base generalista | Gemma (terminos de Google) | Hugging Face |
| Destilaciones mayores del mismo autor (p. ej. Gemma-3-270m-Opus-Distil) | 270M (aprox.) | no disponible | Destilacion generalista | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El propio autor advierte de que es un checkpoint experimental y no un modelo de matematicas para produccion.
- A 270M parametros, el modelo a menudo no sostiene la aritmetica: produce cadenas de pasos con apariencia convincente que fallan a mitad de camino, especialmente en problemas verbales de varios pasos.
- Riesgo alto de alucinacion en resultados numericos: las respuestas finales pueden ser incorrectas aunque el formato sea correcto.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Gemma 3, hereda los sesgos del modelo base, no evaluados aqui.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingue fiable.
- Longitud de contexto no documentada.
- No hay evaluacion formal publicada ni resultados de benchmarks.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Gemma 3 conviene revisar los terminos de uso de Gemma de Google ademas de la licencia declarada en el repo.
- No hay pesos GGUF ni cuantizaciones publicadas, lo que limita el despliegue directo en llama.cpp/Ollama sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/gemma-270m-math-reasoner
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Gemma-3-270m-Opus-Distil (mismo autor): https://huggingface.co/reaperdoesntknow/Gemma-3-270m-Opus-Distil
- Qwen3.5-0.8-Cyber-GGUF (mismo autor): https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Qwen3.5-2B-CyberSec-GGUF (mismo autor): https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Symiotic-14B (mismo autor): https://huggingface.co/reaperdoesntknow/Symiotic-14B
