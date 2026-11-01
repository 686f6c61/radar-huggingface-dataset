# SonoJot/sonojot-punct-v3

## Resumen

SonoJot Punctuation v3 es un modelo de token classification especializado en la restauración de puntuación y la normalización inversa de texto (inverse text normalization, ITN) sobre salidas de sistemas de reconocimiento automático del habla (ASR). Lo desarrolla SonoJot, un proyecto centrado en el post-procesado de dictado, y se distribuye bajo licencia CC-BY-SA-4.0. El modelo parte de sonojot-punct-v1, que a su vez deriva del encoder mmBERT-small de Horizon-Labs (aproximadamente 140 millones de parámetros), y se publica principalmente en formato ONNX cuantizado a int8 (268 MB) junto con los pesos en safetensors para reentrenamiento.

El modelo resuelve dos problemas en una sola pasada hacia delante: por un lado, predice para cada palabra el signo de puntuación que la sigue (ninguno, punto, coma, interrogación o punto y coma), leyendo la puntuación original del reconocedor como evidencia para conservar los finales de frase reales y eliminar las pausas falsas que los ASR insertan en titubeos; por otro, etiqueta tramos de texto cuya forma escrita difiere de la hablada (importes, porcentajes, años, magnitudes como "10K"), que un renderizador determinista externo convierte en su forma tipográfica.

La relevancia de esta versión radica en su entrenamiento con el doble de dictado real (310 dictados adicionales, unos 56.000 palabras) y en que las entradas de entrenamiento se reconstruyen exactamente como las genera SonoJot en tiempo de ejecución, lo que alinea el dominio de entrenamiento con el de producción. Está pensado para inglés y para integrarse en pipelines de dictado y post-procesado de ASR, no como modelo generativo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small) con dos cabezas de clasificación de tokens: cabeza de puntuación y cabeza de spans en formato BIO |
| Parámetros totales | Aproximadamente 140 M (modelo base mmBERT-small) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 120 palabras con hop de 60 en inferencia; longitud de contexto del encoder no disponible |
| Tipos de cuantización | int8 (embeddings en int8, cómputo en fp32) en el fichero ONNX publicado; pesos fp32 en safetensors para fine-tuning |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`), safetensors (`pytorch/model.safetensors`), PyTorch (`pytorch/span_head.pt`), tokenizer en formato Hugging Face (`tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo mmBERT-small (unos 140 M de parámetros) con dos cabezas lineales que se leen en el último token de cada palabra. La cabeza de puntuación emite logits de dimensión 5 (sin signo, `.`, `,`, `?`, `;`) y la cabeza de spans emite 27 etiquetas BIO correspondientes a las clases CARDINAL, DECIMAL, MONEY, PERCENT, MAGNITUDE, YEAR, DATE, TIME, ORDINAL, MEASURE, VERSION, MODEL y AMP. La codificación de entrada es determinista: se segmenta el texto en palabras con la expresión `[^\W_]+(?:['’][^\W_]+)*`, se pasa cada palabra a minúsculas salvo I, I'm, I'll, I've e I'd, se concatenan los tokens de `" " + palabra` y, si el reconocedor escribió un signo tras la palabra, se añaden también los tokens de ese signo (normalizado a `.`, `?` o `,`). La secuencia se envuelve en CLS…SEP y para textos largos se aplican ventanas de 120 palabras con hop de 60, conservando para cada palabra la predicción de la ventana en la que queda más lejos de los bordes.

El entrenamiento de v3 parte de los pesos de v1 y aplica la receta de v2 sobre los datos de v2 más las nuevas filas: 3 épocas, AdamW con learning rate 4e-5, batch efectivo de 16, pérdida enmascarada de puntuación más pérdida de spans, y un peso 5x para las nuevas ventanas de dictado. Los datos nuevos son 310 dictados reales (unas 56.000 palabras) de un único usuario con consentimiento, etiquetados por GPT-6.1 Sol bajo el mismo estilo editorial. El entrenamiento se ejecutó tres veces con semillas distintas y se publicó la ejecución con mejor puntuación de desarrollo, no la de mejor test. No se especifica en la información disponible el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el modelo es un clasificador supervisado, no un modelo generativo.

## Capacidades

- Restauración de puntuación en salidas de ASR: predice para cada palabra si le sigue ningún signo, punto, coma, interrogación o punto y coma.
- Corrección de pausas falsas: interpreta la puntuación del reconocedor como evidencia y elimina cortes espurios en titubeos ("The problem is that. I need it").
- Detección de tramos de forma escrita: etiqueta spans de tipo CARDINAL, DECIMAL, MONEY, PERCENT, MAGNITUDE, YEAR, DATE, TIME, ORDINAL, MEASURE, VERSION, MODEL y AMP en formato BIO.
- Normalización inversa de texto (ITN) delegada: el modelo solo etiqueta; un renderizador determinista externo de SonoJot escribe `$4,000`, `10%`, `2025` o `10K`, y verifica que la forma escrita se lea de vuelta como las palabras habladas.
- Restricción de integridad: el modelo nunca añade, elimina ni modifica palabras por sí mismo.
- Procesamiento por ventanas deslizantes para entradas largas (120 palabras, hop de 60).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; es un clasificador de tokens, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Post-procesado de dictado en aplicaciones de escritura por voz: el modelo recibe la salida cruda del ASR y devuelve la puntuación restaurada y los spans numéricos, de modo que el usuario obtiene texto listo para enviar sin corregir manualmente comas y puntos; su ventana de 120 palabras y su velocidad (unos 0,14 s por 300 palabras en CPU) lo hacen viable en tiempo real.
- Limpieza de transcripciones de reuniones: sobre transcripciones automáticas de larga duración, el procesamiento por ventanas con hop de 60 permite puntuar documentos completos sin perder coherencia en los bordes, eliminando las pausas falsas que los ASR insertan en titubeos.
- Generación de subtítulos y actas: la restauración de puntuación y la detección de años, fechas y horas facilitan la segmentación en frases y la legibilidad de subtítulos generados a partir de audio.
- Normalización de cifras en informes financieros dictados: la cabeza de spans detecta MONEY, PERCENT y MAGNITUDE, y el renderizador determinista produce `$4,000`, `10%` o `10K`, lo que reduce errores de formato en documentos contables.
- Integración en pipelines de subtitulado o transcripción médica y legal donde se exige que no se alteren las palabras: la garantía de que el modelo solo etiqueta y no reescribe el texto encaja con requisitos de fidelidad literal.
- Preprocesado para motores de búsqueda o indexación sobre transcripciones: una puntuación correcta mejora la segmentación en frases y la calidad de los índices sobre audio transcrito.
- Fine-tuning sobre dominios propios: los pesos en safetensors y el script de configuración permiten reentrenar las cabezas sobre jerga específica (por ejemplo, unidades técnicas o nombres de modelos) manteniendo el encoder base.

## Benchmarks y rendimiento

Los resultados publicados se refieren a la tarea de puntuación sobre 88 dictados reales (29.177 palabras) reservados para test, con entradas generadas solo por reglas como en producción. La referencia fue etiquetada por GPT-6.1 Sol y revisada a ciegas por un anotador Opus 5.5, con jueces que resolvieron cada discrepancia.

| Sistema | Sentence F1 | Falsos cortes / 1.000 palabras | Cortes perdidos / 1.000 palabras | Comma F1 |
|---|---:|---:|---:|---:|
| v2 (publicado) | 0,882 | 5,9 | 5,4 | 0,881 |
| Receta v2, media de 3 semillas | 0,883 | 6,3 | 5,0 | 0,878 |
| Receta v3, media de 3 semillas | 0,894 | 5,9 | 4,5 | 0,884 |
| **v3 (semilla publicada)** | **0,897** | **6,0** | **4,1** | **0,884** |

Los errores de capitalización bajaron de 9,9 a 9,2 por 1.000 palabras (medias de semillas). El techo de acuerdo entre dos anotadores cuidadosos se sitúa en torno a 0,94 de Sentence F1 y 0,92 de Comma F1.

Para la tarea de forma escrita, la puntuación es el span F1 de la combinación de cabeza de spans y reglas de SonoJot sobre datos reservados; un span solo cuenta si coinciden límites, clase y texto renderizado.

| Conjunto de test | v2 | v3 |
|---|---:|---:|
| 88 dictados reales | 0,870 | 0,848 |
| Earnings-21, salida real de reconocedor | no disponible en la información proporcionada | no disponible en la información proporcionada |

El texto de la model card se interrumpe en la fila de Earnings-21, por lo que no se dispone del valor completo de esa comparación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX int8 ocupa 268 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM; en CPU el modelo funciona sin GPU.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para ejecutarse en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) puede alojarlo sin problema, aunque no aporta ventaja significativa frente a CPU para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, y también en CPU.
- Opciones de despliegue: ONNX Runtime (formato principal publicado), con los pesos safetensors disponibles para fine-tuning en PyTorch. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: aproximadamente 0,14 s por 300 palabras en caliente, en una CPU de escritorio con 2 hilos (build de release, Ryzen 9 9900X). La medición de v2 en las mismas condiciones fue idéntica (0,14 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SonoJot Punctuation v3 | ~140 M | 120 palabras por ventana, hop 60 | Puntuación + spans ITN en una pasada, ONNX int8 | CC-BY-SA-4.0 | Hugging Face (ONNX + safetensors) |
| SonoJot Punctuation v2 | ~140 M | Igual que v3 | Misma arquitectura y contrato de entrada | CC-BY-SA-4.0 | Hugging Face |
| Horizon-Labs/punctuation-restoration-small | ~140 M (mmBERT-small) | No disponible | Restauración de puntuación | No disponible en la información proporcionada | Hugging Face |

La comparación con alternativas de otros proveedores no está disponible en la información proporcionada. Frente a v2, v3 mejora en Sentence F1 (0,897 frente a 0,882) y en cortes perdidos (4,1 frente a 5,4 por 1.000 palabras), aunque empeora en span F1 sobre dictados reales (0,848 frente a 0,870).

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otras lenguas no está soportado.
- Dominio restringido: entrenado sobre dictado real de un único usuario y sobre un estilo editorial concreto ("house style"); puede generalizar peor a otros acentos, registros o dominios.
- No es un modelo generativo: no razona, no responde preguntas ni genera texto; únicamente clasifica tokens.
- La normalización de forma escrita depende de un renderizador externo determinista; el modelo por sí solo no produce la forma final (`$4,000`, `10%`).
- El span F1 sobre dictados reales empeoró de 0,870 (v2) a 0,848 (v3), por lo que en tareas de ITN pura v2 puede ser preferible.
- Riesgo de errores en los bordes de ventana: aunque se mitiga con el hop de 60 y la selección de la predicción más alejada del borde, textos muy largos pueden presentar inconsistencias.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar sus modificaciones.
- El modelo nunca añade ni elimina palabras, pero puede etiquetar incorrectamente spans numéricos, lo que produciría una forma escrita errónea si el renderizador no la valida; la validación de lectura inversa mitiga parcialmente este riesgo.
- Sin datos publicados sobre sesgos demográficos o léxicos; al entrenarse sobre un único usuario, el vocabulario y las expresiones pueden estar sesgados hacia ese hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SonoJot/sonojot-punct-v3
- Versión anterior v2: https://huggingface.co/SonoJot/sonojot-punct-v2
- Modelo base v1: https://huggingface.co/SonoJot/sonojot-punct-v1
- Modelo de origen: https://huggingface.co/Horizon-Labs/punctuation-restoration-small
