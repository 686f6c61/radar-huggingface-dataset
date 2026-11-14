# Mawdistical-S1/Synica-12B-GGUF

## Resumen

Synica-12B es un ajuste fino (finetune) del modelo base `google/gemma-4-12B`, desarrollado por el usuario Mawdistical-S1 y distribuido principalmente en formato GGUF para su uso con librerías de inferencia local. El modelo está orientado de forma explícita a la generación de texto para roleplay, narrativa interactiva y conversación de personajes, con un sesgo declarado hacia contenido NSFW y temáticas oscuras o violentas. No es un modelo de propósito general: su entrenamiento se ha centrado en dinámicas de rol multi-turno y en la simulación de personajes.

Con 11.907.350.576 parámetros (aproximadamente 11,9 mil millones), se sitúa en la franja de modelos de tamaño medio que pueden ejecutarse en hardware de consumo si se cuantizan adecuadamente. El repositorio ocupa 194,2 GB, lo que refleja la presencia de múltiples cuantizaciones GGUF en lugar de un único conjunto de pesos. El modelo solo declara soporte para inglés y su licencia es "other", sin que la model card especifique los términos completos.

La relevancia de este modelo es acotada y muy específica: cubre un nicho de roleplay conversacional con contenido para adultos, un segmento donde los modelos ajustados sobre bases generalistas suelen superar a los modelos base en coherencia de personaje y consistencia narrativa. No obstante, la ausencia de benchmarks publicados, de documentación sobre el proceso de entrenamiento y de una licencia clara limita seriamente su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-12B); detalles específicos no disponibles |
| Parametros totales | 11.907.350.576 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | GGUF (múltiples cuantizaciones en el repositorio; niveles concretos no especificados) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | GGUF (librería declarada: transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/gemma-4-12B`, un transformer decoder-only del que no se detallan en la información disponible ni el número de capas, ni las dimensiones ocultas, ni la longitud de contexto nativa. El ajuste fino se realizó sobre un conjunto de datos privado ("Private In-House") compuesto por más de 600 "rotation sets" con más de 20 mensajes cada uno. La composición declarada incluye encuentros violentos, temáticas oscuras, contenido NSFW intenso, acciones de world building, secuencias multi-personaje (intercambios personaje-personaje), simulación y guiado de roleplay, y variación de fetiches ("kink shifting").

La creación del dataset combina diálogos de rol sintéticos con diálogos extraídos internamente de instancias reales; las secuencias multi-personaje son mayoritariamente sintéticas, con intervención humana en algunos casos para control de calidad. El modelo se declara con enfoque "male leaning" y una postura dinámica experimental. No se especifica el número de tokens de entrenamiento, la técnica de alineación (RLHF, DPO u otra) ni hiperparámetros del ajuste. La model card indica que se requiere prefill y descripciones de personaje explícitas para un funcionamiento adecuado, y recomienda usar la plantilla de chat de `google/gemma-4-12B-it` con temperatura 0,8 y `min_p` 0,05.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay e interpretación de personajes.
- Simulación de dinámicas multi-personaje (intercambios entre personajes dentro de una misma escena).
- Generación de narrativa interactiva con world building y acciones descriptivas.
- Contenido NSFW y explícito, incluyendo temáticas oscuras y violencia, según la composición declarada del dataset.
- Guiado de escenas mediante prefill y descripciones de personaje explícitas.
- Soporte de roleplay con temática furry/anthro (según los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni visión.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Roleplay conversacional de personajes: el modelo está ajustado específicamente para mantener la coherencia de un personaje a lo largo de conversaciones multi-turno, usando prefill con la descripción del personaje y la plantilla de chat de Gemma 4.
- Narrativa interactiva para adultos: generación de ficción serializada con continuidad argumental, adecuada para plataformas de ficción interactiva que requieran contenido explícito y temáticas maduras.
- Simulación de escenas multi-personaje: creación de diálogos entre varios personajes dentro de una misma escena, aprovechando los "rotation sets" multi-par del entrenamiento.
- Prototipado de chatbots de entretenimiento: desarrollo de bots de rol para comunidades cerradas, con control de contenido mediante prefill y system prompts.
- Investigación sobre ajuste fino de roleplay: estudio comparativo de cómo un finetune sobre una base generalista modifica el comportamiento conversacional en dominios específicos.
- Generación de guiones y diálogos para proyectos creativos de ficción madura: borradores de escenas con estructura narrativa y dinámicas de personaje, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (11,9 B de parámetros), una cuantización de 4 bits requeriría del orden de 6-8 GB solo para los pesos, más overhead de contexto; una de 8 bits, del orden de 12-14 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con 12-24 GB de VRAM en cuantizaciones bajas, y en A100/H100 para cuantizaciones altas o mayor contexto.
- Compatibilidad con GPU de consumo: probable en cuantizaciones GGUF de 4-5 bits en GPUs con 12 GB o más, aunque no confirmado por el autor.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y otros runners GGUF; la librería declarada es transformers, lo que sugiere también uso con el stack de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Synica-12B | 11,9 B | No disponible | Roleplay NSFW, multi-personaje | other (no especificada) | GGUF |
| google/gemma-4-12B (base) | ~12 B | No disponible | Propósito general | Términos de Gemma | Safetensors, GGUF |
| Alternativas de roleplay de tamaño similar | No disponible | No disponible | Roleplay | Variable | GGUF |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría (finetunes de roleplay sobre bases de ~12 B). Los benchmarks no están publicados y no se conocen resultados comparables en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito y potencialmente perturbador: el modelo está entrenado deliberadamente para generar NSFW, violencia y temáticas oscuras; no es apto para aplicaciones dirigidas a menores ni para entornos sin moderación.
- Sesgo declarado "male leaning": el ajuste tiene una orientación de género explícita que puede reflejarse en los outputs.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede inventar hechos, inconsistencias de personaje o detalles narrativos; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Licencia "other" sin términos especificados: no se puede confirmar si el uso comercial está permitido; es un bloqueo para producción empresarial.
- Solo inglés: no hay soporte multilingüe declarado.
- Requiere prefill y descripciones de personaje explícitas: sin ellos, el comportamiento del modelo puede degradarse según el propio autor.
- Samplers poco tolerantes: el autor advierte que los parámetros de muestreo no son indulgentes, lo que exige ajuste fino de temperatura y min_p.
- Sin benchmarks ni documentación de entrenamiento: imposible evaluar rendimiento de forma objetiva.
- Repositorio de 194,2 GB: la descarga completa es costosa; conviene seleccionar una única cuantización.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mawdistical-S1/Synica-12B-GGUF
- Colección Synica (cuantizaciones): https://huggingface.co/collections/Mawdistical/synica
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Plantilla de chat recomendada: https://huggingface.co/google/gemma-4-12B-it/blob/main/chat_template.jinja
- Comunidad Discord: https://discord.gg/aU3a5phBQD
- Apoyo al autor (Ko-fi): https://ko-fi.com/mawnipulator
