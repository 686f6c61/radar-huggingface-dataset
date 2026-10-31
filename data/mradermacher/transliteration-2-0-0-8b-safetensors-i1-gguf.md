# mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF

## Resumen

Transliteration-2.0-0.8B es un modelo especializado en transliteración desarrollado por UnicornType, del cual mradermacher ha publicado esta versión cuantizada en formato GGUF con imatrix (importancia de matriz) para su ejecución eficiente en hardware modesto. El modelo resuelve un problema concreto y frecuente: convertir texto entre sistemas de escritura, como pinyin (chino romanizado), romaji (japonés romanizado), hinglish (hindi en alfabeto latino) y arabizi (árabe en alfabeto latino). Es relevante para desarrolladores que construyen sistemas de entrada de texto (IME), búsqueda multilingüe o normalización de nombres propios.

Con solo 752 millones de parámetros, el modelo se basa en la arquitectura Qwen3.5 (según los tags del repositorio, versión v2.1 del modelo) y está diseñado como modelo conversacional ligero. La cuantización de mradermacher permite ejecutarlo en CPU o GPUs de gama baja, con ficheros que van desde 0,4 GB en las cuantizaciones más agresivas hasta aproximadamente 0,7 GB en las de mayor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (según tags del repositorio) |
| Parametros totales | 752.393.024 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S (y superiores en el repo completo) |
| Idiomas soportados | Ingles, chino, japones, hindi, arabe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizacion imatrix) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 752 millones de parámetros derivado de la familia Qwen3.5, especializado en tareas de transliteración entre alfabetos. La versión aquí documentada no es el modelo original sino una cuantización realizada por mradermacher mediante la técnica de imatrix (matriz de importancia), que calcula estadísticas de activación sobre un corpus de calibración para asignar mejor los bits en las cuantizaciones de menor rango. Esto permite que cuantizaciones muy agresivas (IQ1, IQ2) mantengan una calidad razonable en un modelo ya de por sí pequeño.

Sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay información publicada en la model card disponible. Tampoco se detalla el método de ajuste fino empleado, aunque la etiqueta de "conversational" y la especialización en transliteración (pinyin, romaji, hinglish, arabizi) indican un entrenamiento dirigido específicamente a esta tarea.

## Capacidades

- Transliteración de chino a pinyin (caracteres hanzi a alfabeto latino con tonos).
- Transliteración de japonés a romaji (kanji, hiragana y katakana a alfabeto latino).
- Generación y comprensión de hinglish (hindi escrito en alfabeto latino, habitual en mensajería informal).
- Generación y comprensión de arabizi (árabe escrito con caracteres latinos y números, como "3" para ع).
- Capacidades conversacionales generales en inglés, chino, japonés, hindi y árabe, aunque con alcance limitado por su tamaño.
- Formato GGUF compatible con llama.cpp, Ollama y derivados, apto para inferencia en CPU.
- No hay evidencia de soporte de vision, audio ni tool calling en la información disponible.

## Casos de uso

- Sistemas de entrada de texto (IME): integración en teclados virtuales para convertir pinyin o romaji tecleado en caracteres chinos o japoneses, aprovechando que el modelo cabe en dispositivos con recursos limitados.
- Normalización de nombres propios en bases de datos: unificar variantes de nombres árabes, chinos, japoneses o hindis escritos en alfabeto latino (por ejemplo, "Mohammed", "Muhammad", "Muhamed") para deduplicación de registros en CRM o sistemas KYC.
- Busqueda multilingüe: indexar consultas transliteradas de usuarios que buscan en alfabeto latino contenido en escritura nativa, mejorando el recall en buscadores de catálogos musicales, cinematográficos o bibliográficos.
- Preprocesamiento para NLP en redes sociales: normalizar hinglish y arabizi de Twitter, WhatsApp o foros antes de pasarlos a modelos de análisis de sentimiento o clasificación que solo aceptan escritura nativa (Devanagari o script árabe).
- Asistencia a la pronunciación en apps de aprendizaje de idiomas: generar la romanización de frases en chino, japonés, hindi o árabe para estudiantes occidentales, con un modelo que funciona sin conexión.
- Chatbots ligeros multilingües: despliegue de asistentes conversacionales básicos en CPU para mercados donde los usuarios mezclan alfabeto latino con escritura nativa, sin necesidad de GPU.
- Verificación fonética en mensajería o moderación de contenido: detectar términos ofensivos o nombres escritos en transliteración no estándar (arabizi, hinglish) que los filtros basados en escritura nativa no capturan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: entre 0,4 GB (IQ1_S/IQ1_M) y 0,7 GB (Q5_K_S) solo para los pesos, más overhead de contexto; cualquier equipo moderno con 2-4 GB de RAM libres es suficiente.
- GPU recomendadas: no se requiere GPU; el modelo está pensado para inferencia en CPU. En GPU, cualquier tarjeta con 2 GB de VRAM (incluso integradas o GTX 1050) es más que suficiente.
- Cabe sobradamente en GPUs de consumo: sí, en cualquiera, incluso en portátiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI (formato GGUF, no safetensors en este repo).
- Latencia y throughput: no disponible; dada la cuantización extrema y el tamaño de 0,75B, se espera generación rápida incluso en CPU de gama media, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia |
|---|---|---|---|---|
| Transliteration-2.0-0.8B (esta ficha, cuantizado) | 752M | Transliteracion (pinyin, romaji, hinglish, arabizi) | GGUF imatrix | Apache-2.0 |
| UnicornType/Transliteration-2.0-0.8B-Safetensors | 752M | Transliteracion (modelo original) | Safetensors | Apache-2.0 |
| mradermacher/Transliteration-2.0-0.8B-Safetensors-GGUF | 752M | Transliteracion (cuantizacion estatica) | GGUF | Apache-2.0 |

No hay otros modelos especializados comparables publicados en la información disponible; los LLM generales pequeños (Qwen3 de 0,6B, Gemma de 1B) pueden realizar transliteración pero sin la especialización de este modelo.

## Limitaciones y advertencias

- Alcance muy restringido: es un modelo de 0,75B especializado; no debe esperarse rendimiento competitivo en razonamiento, código o matemáticas frente a LLM generales.
- Riesgo de alucinación en tareas fuera de la transliteración: al ser un modelo pequeño y especializado, puede generar romanizaciones incorrectas o inventadas, especialmente con nombres poco frecuentes o dialectos no cubiertos.
- Idiomas limitados a cinco (inglés, chino, japonés, hindi, árabe); no hay soporte declarado para coreano, cirílico u otros sistemas de escritura.
- Longitud de contexto no documentada: evitar entradas largas hasta validar el comportamiento real.
- Las cuantizaciones más agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor recomienda IQ3_S o superiores, siendo Q4_K_M la opción recomendada por equilibrio tamaño/calidad.
- Licencia Apache-2.0: sin restricciones para uso comercial, pero conviene verificar también los términos del modelo base de UnicornType.
- No hay benchmarks publicados: cualquier decisión de producción debe basarse en evaluación propia sobre los pares de transliteración relevantes para el caso de uso.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF
- Modelo base original: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Transliteration-2.0-0.8B-Safetensors-i1-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
