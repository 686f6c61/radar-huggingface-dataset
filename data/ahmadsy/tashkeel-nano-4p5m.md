# ahmadsy/tashkeel-nano-4p5m

## Resumen

Tashkeel Nano 4.5M es un modelo de diacritización del árabe (tashkeel) desarrollado por el usuario ahmadsy. Su tarea es predecir las marcas diacríticas (fatha, damma, kasra, shadda, tanwin, sukun) de cada letra árabe de un texto, un paso previo habitual en pipelines de voz, búsqueda y anotación lingüística. Con 4.488.160 parámetros (4,49 M) y un checkpoint de 17,2 MB en safetensors fp32, es un modelo deliberadamente diminuto.

Su relevancia está en la relación entre tamaño y rendimiento: según los datos declarados por el autor, supera en las compuertas externas al "gold" desplegado de 30,1 M y al campeón interno de 17,2 M, pese a ser entre 3,8 y 6,8 veces más pequeño. En el conjunto held-out abdou_test, nunca usado en entrenamiento, obtiene un DER de 39,30 frente al 41,60 del modelo de 30,1 M.

Se trata de un encoder Transformer bidireccional a nivel de carácter con una cabeza de 15 clases, no de un modelo generativo autorregresivo, aunque su pipeline_tag en HuggingFace figure como text-generation. La licencia es research-only, lo que restringe el uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional a nivel de carácter con cabeza de diacritización de 15 clases |
| Parametros totales | 4.488.160 (4,49 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica safetensors en fp32) |
| Idiomas soportados | ar, en (la función real del modelo es la diacritización del árabe) |
| Licencia | research-only (license: other, con LICENSE propio; uso comercial restringido) |
| Formato de pesos | safetensors (fp32), 17,2 MB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de encoder Transformer bidireccional que opera a nivel de carácter sobre texto árabe, con una cabeza de clasificación de 15 clases para asignar la diacritización a cada letra. Internamente se identifica como `e63s_s4_12l160`, es decir, 12 capas y ancho 160, la armadura S4 del barrido interno "E-63s" del autor, en el que se reducen progresivamente profundidad y anchura manteniendo la misma receta.

El checkpoint publicado corresponde al paso 19.500 de una ejecución de 20.000 pasos sobre el corpus "v3" completo, con `val_loss` de 0,1758. El régimen de entrenamiento descrito incluye entropía cruzada estándar (vanilla CE), inicialización en caliente desde `stage1lm` y datos del corpus v3 completo. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens ni si hubo fases de RLHF o DPO, algo poco habitual en un modelo de esta tarea y tamaño. Se sabe que la mezcla de entrenamiento incluye Sadeed_Tashkeela y la superficie WikiNews-2024, lo que genera contaminación en algunas métricas (véase Limitaciones).

## Capacidades

- Diacritización de texto árabe a nivel de carácter: predice fatha, damma, kasra, shadda, tanwin y sukun para cada letra.
- Preservación de texto muy alta: `text_preservation` entre 0,9846 y 1,0000 según la compuerta evaluada.
- Funcionamiento sobre texto sin vocales y sobre texto parcialmente vocalizado.
- Soporte declarado de árabe e inglés en la etiqueta de idioma, aunque la capacidad funcional es la diacritización árabe.
- No dispone de tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No tiene modo de pensamiento, visión ni audio.
- No es un modelo generativo conversacional: pese a la etiqueta text-generation, es un encoder de etiquetado.

## Casos de uso

- Preprocesado para síntesis de voz (TTS) en árabe: los motores de voz necesitan diacríticos para resolver la pronunciación correcta; el modelo añade la vocalización a texto plano antes de la síntesis.
- Anotación de corpus árabes a gran escala: al ser un modelo de 4,49 M y 17,2 MB, puede ejecutarse sobre millones de frases en CPU sin coste de GPU, etiquetando corpus para entrenamiento posterior.
- Post-procesado de OCR árabe: los documentos escaneados suelen perder las marcas diacríticas; el modelo las restituye para mejorar la legibilidad y la búsqueda posterior.
- Enseñanza del árabe y lectura asistida: la vocalización automática permite generar textos con diacríticos para estudiantes que aún no dominan la lectura sin vocales.
- Indexación y búsqueda en árabe: normalizar o desambiguar formas con y sin diacríticos mejora la coincidencia en motores de búsqueda y sistemas de recuperación.
- Anotación lingüística para investigación: generación de capas de diacritización para estudios morfológicos y fonológicos con revisión humana posterior.
- Etiquetado previo en pipelines multilingües de NLP: el modelo puede actuar como paso intermedio antes de modelos de traducción o análisis sintáctico.

## Benchmarks y rendimiento

Resultados declarados por el autor (campo `verified: false` en la model-index). DER y WER en porcentaje, menor es mejor.

| Modelo | Parametros | fadel_test | sadeed25 † | wikinews2014 | Media 3 compuertas |
|---|---|---|---|---|---|
| tashkeel-nano-4p5m (este) | 4,49 M | 31,31 | 43,37 | 47,19 | 40,62 |
| champion M1 16L×272 (interno) | 17,2 M | 33,08 | 45,44 | 49,07 | 42,53 |
| stage2b2500 (gold desplegado) | 30,1 M | 33,23 | 45,68 | 48,99 | 42,63 |

† sadeed25 está marcada con solapamiento: Sadeed_Tashkeela forma parte de la mezcla de entrenamiento.

Conjunto held-out abdou_test (15.091 frases, 41.378 líneas, 1,54 M palabras), nunca usado en entrenamiento por ningún modelo de esta línea:

| Modelo | Parametros | DER | DER_nocase | WER | text_preservation |
|---|---|---|---|---|---|
| tashkeel-nano-4p5m (este) | 4,49 M | 39,30 | 29,30 | 39,65 | 0,9846 |
| stage2b2500 (gold desplegado) | 30,1 M | 41,60 | 30,40 | no disponible | no disponible |

WikiNews-2024 multirreferencia (en dominio, contaminado: la superficie está en el conjunto de entrenamiento; se reporta solo a título informativo):

| Modelo | Parametros | DER (%) | DER_nocase (%) | WER (%) |
|---|---|---|---|---|
| mishkala (publicado) | 12,5 M | 1,52 | 1,34 | 1,52 |
| tashkeel-nano-4p5m (este) | 4,49 M | 1,77 | 1,45 | 1,77 |
| stage2b2500 (gold) | 30,1 M | 1,80 | 1,49 | 1,80 |
| zmahood (publicado) | ~4,5 M | 1,85 | 1,63 | 1,85 |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4,49 M de parámetros declarados, más activaciones mínimas): aproximadamente 18 MB en fp32, 9 MB en fp16 y 4,5 MB en int8.
- Cabe en cualquier GPU de consumo, incluidas integradas y tarjetas de gama baja; también es viable la inferencia en CPU.
- GPU recomendadas: ninguna en especial por tamaño. Un modelo de esta escala se ejecuta sin problemas en RTX 3060, RTX 4090, A100 o H100, pero no necesita ninguna de ellas.
- Opciones de despliegue: al publicarse solo safetensors fp32, el despliegue natural es PyTorch o una exportación a ONNX Runtime. No hay confirmación en la información disponible de que existan pesos en formato GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa no documentada.
- Latencia y throughput: no disponibles. Al ser un modelo no autorregresivo, la inferencia es de un solo paso por secuencia, por lo que la latencia dependerá sobre todo de la longitud de la frase y del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | DER externo declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tashkeel-nano-4p5m | 4,49 M | Diacritización árabe | 40,62 (media 3 compuertas) | research-only | HuggingFace, safetensors fp32 |
| stage2b2500 (gold desplegado) | 30,1 M | Diacritización árabe | 42,63 (media 3 compuertas) | no disponible | interno, no publicado en la información disponible |
| champion M1 16L×272 | 17,2 M | Diacritización árabe | 42,53 (media 3 compuertas) | no disponible | interno, no publicado en la información disponible |
| mishkala (publicado) | 12,5 M | Diacritización árabe | 1,52 % en WikiNews-2024 multirreferencia (en dominio) | no disponible | publicado (referenciado por el autor) |
| zmahood (publicado) | ~4,5 M | Diacritización árabe | 1,85 % en WikiNews-2024 multirreferencia (en dominio) | no disponible | publicado (referenciado por el autor) |

## Limitaciones y advertencias

- Licencia research-only: el uso comercial está restringido por el propio LICENSE del repositorio. Es un caveat determinante para producción.
- Contaminación de datos: la superficie WikiNews-2024 está en el conjunto de entrenamiento, por lo que sus métricas (DER 1,77 %) no son evidencia externa válida.
- Solapamiento en sadeed25: Sadeed_Tashkeela forma parte de la mezcla de entrenamiento, lo que infla el resultado de esa compuerta.
- Los resultados declarados están marcados con `verified: false` en la model-index; no han sido verificados por un tercero.
- El DER en las compuertas externas es alto (31,31 a 47,19 %), lo que implica un porcentaje elevado de diacríticos incorrectos en texto fuera de dominio.
- Riesgo de asignación errónea de diacríticos en palabras ambiguas o poco frecuentes; en textos religiosos, jurídicos o educativos se recomienda revisión humana.
- La etiqueta pipeline_tag: text-generation puede inducir a error: el modelo es un encoder de etiquetado, no un modelo generativo de texto libre.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide garantizar el comportamiento en frases muy largas.
- No hay cuantizaciones publicadas (solo fp32), ni pesos GGUF, lo que limita su uso directo en herramientas como llama.cpp u Ollama.
- El soporte de inglés figura en las etiquetas, pero no hay evidencia en la información disponible de capacidades reales en ese idioma.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ahmadsy/tashkeel-nano-4p5m
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
