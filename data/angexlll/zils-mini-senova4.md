# ANGExllL/zils-mini-senova4

## Resumen

Senova-4B-v4 (publicado en Hugging Face como `ANGExllL/zils-mini-senova4`) es un ajuste fino de parámetros completos de Qwen/Qwen3.5-4B, desarrollado por el usuario ANGExllL. El modelo parte de la arquitectura Qwen3.5 de 4B parámetros (4.539.265.536 parámetros reales según safetensors) y se ha entrenado sobre 5.181.618 ejemplos durante 3 épocas, alcanzando el checkpoint final en el paso 1530. Está orientado a tareas de imagen-texto a texto (pipeline `image-text-to-text`), aunque su diferenciador principal es una técnica de inferencia denominada "Read Twice" y un sistema de etiquetas suaves sobre conjuntos de opciones ("option-set soft-label fine-tune").

La relevancia del modelo reside en su enfoque metodológico: en lugar de optimizar únicamente el siguiente token, se entrena con etiquetas suaves sobre conjuntos de opciones, lo que teóricamente mejora la calibración en tareas de elección múltiple y decisión. Además, introduce un protocolo de inferencia concreto (Read Twice) que consiste en repetir el enunciado completo de la pregunta dos veces, separadas por una línea en blanco, dentro de un mismo mensaje de usuario, y leer una única distribución del siguiente token. No se realizan dos llamadas al modelo.

El modelo reporta un resultado de 67,02 en el "Public Decision Index 0.3", con 140.178 de 140.178 peticiones puntuables exitosas, usando Read Twice y thinking desactivado. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, lo que indica que se trata de una publicación reciente y de escasa adopción pública. La licencia es Apache-2.0 para los pesos, aunque los derechos sobre el dataset no se ceden con la licencia del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (no se detalla variante exacta en la información disponible) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se listan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); derechos del dataset no incluidos |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos de Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de la familia Qwen3.5. No se especifica en la información disponible si emplea atención lineal, decodificación especulativa u otras innovaciones de la familia. El entrenamiento se realizó sobre 5.181.618 ejemplos durante 3 épocas, con un total de 1530 pasos hasta el checkpoint final. La técnica de entrenamiento se describe como "option-set soft-label fine-tune", es decir, entrenamiento con etiquetas suaves sobre conjuntos de opciones, lo que sugiere un objetivo de calibración orientado a tareas de selección entre alternativas.

La innovación técnica destacable no está en la arquitectura sino en el protocolo de inferencia: "Read Twice". Este consiste en repetir el enunciado completo renderizado de la pregunta dos veces, separadas por una línea en blanco, dentro de un único mensaje de usuario, y leer una sola distribución del siguiente token. No se realizan dos llamadas al modelo ni se activa el modo thinking. El mismo ajuste Read Twice es requisito para la evaluación privada según el autor. No se dispone de información sobre composición del dataset, uso de RLHF/DPO ni detalles de tokenización.

## Capacidades

- Generación de texto y razonamiento en formato imagen-texto a texto (pipeline declarado `image-text-to-text`).
- Entrenamiento orientado a tareas de decisión con conjuntos de opciones (option-set), lo que sugiere capacidad para elección múltiple y calibración de respuestas.
- Protocolo de inferencia Read Twice: repetición del enunciado en un único mensaje para mejorar la lectura del contexto.
- Modo thinking desactivado por defecto en la evaluación reportada (no se detalla si el modo thinking está disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (visión, audio): el pipeline es image-text-to-text, pero no se detallan capacidades de visión más allá de la etiqueta del pipeline.

## Casos de uso

- Evaluación de decisión con opciones múltiples: el modelo se entrenó con etiquetas suaves sobre conjuntos de opciones, por lo que es adecuado para tareas de selección entre alternativas donde la calibración importa, como cuestionarios de evaluación o sistemas de votación.
- Investigación sobre protocolos de inferencia: el enfoque Read Twice permite estudiar cómo la repetición del enunciado afecta la distribución del siguiente token, útil en experimentos de prompting y calibración.
- Clasificación y puntuación de respuestas: el ajuste con soft-labels puede emplearse para puntuar opciones en pipelines de anotación o ranking.
- Procesamiento de entradas imagen-texto: al declarar el pipeline image-text-to-text, puede usarse en tareas que combinen imagen y texto, aunque no se detallan las capacidades visuales concretas.
- Reproducción de benchmarks públicos: el modelo reporta un índice público concreto (Decision Index 0.3 = 67,02), lo que permite reproducir y comparar resultados en ese benchmark.
- Servido con el servidor de inferencia Senova-4B-v3: el autor indica que el servidor de inferencia de la versión v3 puede cargar estos pesos, lo que facilita el despliegue en ese entorno concreto.
- Experimentación académica sobre fine-tuning de parámetros completos: al ser un fine-tune completo de Qwen3.5-4B con licencia Apache-2.0, sirve como caso de estudio de ajuste con etiquetas suaves.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Public Decision Index 0.3 | 67,02 | Read Twice, thinking off; 140.178/140.178 peticiones puntuables exitosas; complete=true |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El resultado del Decision Index es un benchmark público según el autor; la puntuación privada "Full" la determinan los mantenedores del leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4.539 millones de parámetros en fp16 requiere aproximadamente 9 GB de pesos, más memoria para activaciones y KV cache; en cuantización de 8 bits rondaría 4,5 GB y en 4 bits unos 2,3 GB, aunque estas cifras no están publicadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) en fp16, y en GPUs con menos VRAM mediante cuantización, pero no se confirma.
- ¿Cabe en consumer GPU? Probablemente sí en fp16 en GPUs de 24 GB o más, y en cuantización en GPUs de 8-16 GB, pero no hay datos oficiales.
- Opciones de despliegue: transformers (librería declarada); el autor menciona que el servidor de inferencia Senova-4B-v3 puede cargar estos pesos. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Senova-4B-v4 | 4.539 M | no disponible | Apache-2.0 | Fine-tune de Qwen3.5-4B con soft-labels y Read Twice; Decision Index 0.3 = 67,02 |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Apache-2.0 (según base) | Modelo base sin ajuste; no se dispone de sus métricas en esta información |
| Alternativas de 4B de la familia Qwen3.5 | ~4B | no disponible | Apache-2.0 | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos suficientes para comparar rendimiento con alternativas concretas; la comparativa se limita al modelo base y a la familia Qwen3.5-4B.

## Limitaciones y advertencias

- Los pesos han sido modificados mediante entrenamiento con etiquetas suaves y no son una release sin modificar de Qwen; pueden comportarse de forma distinta al modelo base.
- El resultado de 67,02 en el Decision Index es un benchmark público; la puntuación privada "Full" la determinan los mantenedores del leaderboard y no está garantizada.
- El protocolo Read Twice es requisito para la evaluación; usos fuera de ese protocolo pueden dar resultados distintos a los reportados.
- El modo thinking debe permanecer desactivado según el autor; no se detalla el comportamiento con thinking activado.
- La licencia Apache-2.0 cubre los pesos, pero los derechos sobre el dataset no se ceden con la licencia del modelo; el uso comercial debe revisar LICENSE y NOTICE.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinación.
- Modelo con cero descargas y cero likes en el momento de la ficha: escasa validación por la comunidad.
- No se dispone de información sobre cuantizaciones publicadas, contexto máximo ni soporte de tool calling, lo que limita su evaluación para producción.

## Enlaces

- Hugging Face: https://huggingface.co/ANGExllL/zils-mini-senova4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio, paper o demo adicionales: no disponibles en la información proporcionada.
