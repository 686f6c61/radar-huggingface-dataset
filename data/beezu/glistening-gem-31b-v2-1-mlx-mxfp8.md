# beezu/Glistening-Gem-31B-v2.1-mlx-mxfp8

## Resumen

El modelo `beezu/Glistening-Gem-31B-v2.1-mlx-mxfp8` es una conversión al formato MLX del modelo `sophosympatheia/Glistening-Gem-31B-v2.1`, realizada por el usuario beezu mediante la librería `mlx-lm` en su versión 0.31.3. El modelo original es un merge creativo de tres modelos basados en Gemma 4 31B it, utilizando `mergekit` y tomando como base `google/gemma-4-31B-it`. El objetivo de esta conversión es permitir la ejecución eficiente en hardware Apple Silicon mediante el framework MLX, con cuantización de 8 bits en formato mxfp8.

Aunque el nombre del modelo indica 31B, los parámetros totales registrados en los archivos safetensors son 8.634.585.404 (aproximadamente 8,6 mil millones), lo que supone una discrepancia notable con la denominación comercial. Esta ficha refleja ambos datos y advierte de la posible confusión. El modelo está orientado a generación de texto conversacional y creativo, con licencia Apache 2.0 y soporte únicamente para inglés. Su relevancia radica en ofrecer una alternativa de generación de prosa creativa ejecutable localmente en Mac, aunque presenta ciertos artefactos conocidos en la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 4 31B it) |
| Parametros totales | 8.634.585.404 (segun safetensors; el nombre indica 31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mxfp8 (8 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original `Glistening-Gem-31B-v2.1` es un merge de tres modelos derivados de Gemma 4 31B it: `TheDrummer/Artemis-31B-v1`, `zerofata/G4-MeroMero-v2-31B` y `llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic`. El merge se realizó con `mergekit` sobre la base `google/gemma-4-31B-it`, y la versión v2.1 corrige los problemas de la v2.0 al usar la base estándar en lugar de un modelo exótico que dificultaba la fusión de capas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que al tratarse de un merge no se realizó un entrenamiento adicional. La conversión a MLX no introduce cambios arquitectónicos, solo adapta los pesos al formato optimizado para Apple Silicon.

## Capacidades

- Generacion de texto conversacional y creativo, con enfasis en prosa literaria y variedad lexica.
- Soporte de roleplay y narrativa interactiva, gracias a la combinacion de ingredientes orientados a la creatividad.
- Generacion de contenido no censurado (etiqueta `not-for-all-audiences`), derivada del ingrediente "uncensored" del merge.
- Capacidad multilingue limitada: solo ingles.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Escritura creativa asistida: el modelo puede redactar relatos, poemas o dialogos con un estilo literario variado, aprovechando la mezcla de ingredientes que favorecen la eleccion de palabras poco convencionales.
- Roleplay y juegos de rol por texto: su naturaleza conversacional y su tolerancia a contenido adulto lo hacen adecuado para sesiones de rol en solitario o multijugador, aunque requiere supervisión por los artefactos ocasionales.
- Generacion de dialogos para videojuegos o guiones: los equipos de desarrollo pueden usarlo para producir borradores de conversaciones de personajes, con la ventaja de ejecutarse localmente en Mac sin conexion a internet.
- Exploracion de ideas creativas y lluvia de ideas: el modelo puede sugerir tramas, giros argumentales o descripciones alternativas, sirviendo como herramienta de apoyo para escritores.
- Prototipado de aplicaciones de chat en Apple Silicon: al estar en formato MLX, los desarrolladores pueden integrarlo en apps de macOS o iOS mediante la libreria mlx-lm, con cuantizacion de 8 bits para reducir el consumo de memoria.
- Experimentacion con tecnicas de sampling: la model card recomienda ajustes especificos de sampler (como Min-P elevado) para mitigar artefactos, lo que lo convierte en un banco de pruebas para quienes investigan estrategias de decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version original.

## Requisitos de hardware

- El modelo esta diseñado para Apple Silicon (Mac) mediante el framework MLX; no se contempla su uso en GPU NVIDIA o AMD de forma nativa.
- Tamano del repositorio: 31,7 GB, aunque el modelo cuantizado a 8 bits ocupara aproximadamente 8,6 GB en memoria si los parametros reales son 8,6 mil millones. Si el nombre "31B" reflejara el tamano real, el consumo seria de unos 31 GB. Esta discrepancia impide dar una cifra fiable.
- Se recomienda un Mac con al menos 16 GB de RAM unificada para la version de 8,6B, o 32 GB si el modelo es efectivamente de 31B.
- Opciones de despliegue: mlx-lm (inferencia y generacion), compatible con el ecosistema MLX. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Como referencia cualitativa, el modelo base `google/gemma-4-31B-it` es un transformer de 31B con licencia Apache 2.0, mientras que este merge busca mejorar la creatividad y la prosa a costa de una estabilidad ligeramente menor. Otras conversiones MLX del mismo autor, como `beezu/Glistening-Gem-31B-v2.1-mlx-8bit-gs32`, ofrecen una cuantizacion alternativa (8 bits con group size 32) que puede variar en calidad y velocidad, pero no hay benchmarks publicados que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Artefactos en la generacion: el autor reconoce que el modelo produce ocasionalmente palabras fusionadas o errores ortograficos, especialmente con ajustes de sampler agresivos. Se recomienda elevar Min-P para reducirlos.
- Contenido no apto para todos los publicos: la etiqueta `not-for-all-audiences` indica que puede generar material explicito o sensible, lo que requiere moderacion en entornos profesionales o educativos.
- Idioma unico: solo soporta ingles; no se garantiza calidad en otros idiomas.
- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento en tareas estandar, lo que dificulta la evaluacion comparativa.
- Discrepancia en el numero de parametros: la denominacion "31B" no coincide con los 8,6 mil millones registrados en safetensors, lo que puede generar confusion sobre los requisitos de memoria y el rendimiento esperado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo derivado de ingredientes con etiquetas "uncensored" puede implicar responsabilidades legales adicionales segun el uso final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beezu/Glistening-Gem-31B-v2.1-mlx-mxfp8
- Modelo original: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Ingrediente 1: https://huggingface.co/TheDrummer/Artemis-31B-v1
- Ingrediente 2: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Ingrediente 3: https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic
- Version alternativa en 8-bit gs32: https://huggingface.co/beezu/Glistening-Gem-31B-v2.1-mlx-8bit-gs32
