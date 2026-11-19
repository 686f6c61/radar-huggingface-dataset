# Frosty40/Audiction

## Resumen

Audiction es un modelo de normalización de texto para inglés, diseñado para convertir texto escrito en la forma hablada que debería pronunciar un sistema de text-to-speech (TTS). Por ejemplo, transforma "Doors open at 7:30 pm on 11/21" en "Doors open at seven thirty p m on November twenty-first". Lo desarrolla Frosty40 y se distribuye bajo licencia Apache 2.0. Se trata de un fine-tune de `google/byt5-small`, un modelo encoder-decoder de arquitectura T5 que opera a nivel de bytes, con aproximadamente 300 millones de parámetros (299.637.760 según los pesos en safetensors).

El modelo resuelve un problema muy concreto en pipelines de síntesis de voz: la expansión de números, fechas, monedas, abreviaturas, números romanos, acrónimos y unidades a su forma verbal. Su diseño es híbrido: un conjunto de reglas deterministas (`verbalize.py`) resuelve los casos seguros en unos 45 µs por frase, y el modelo solo interviene cuando las reglas no pueden decidir con certeza. Esta arquitectura reduce el riesgo de alucinación típico de los modelos generativos en tareas de normalización.

Es relevante para desarrolladores que construyen asistentes de voz, lectores de pantalla, guiones de radio o sistemas que encadenan salidas de LLM con un motor TTS, porque la normalización correcta es un paso previo imprescindible para una pronunciación natural y comprensible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder a nivel de bytes (ByT5-small) |
| Parámetros totales | 299.637.760 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16 según repo) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/byt5-small`, un T5 encoder-decoder que procesa texto a nivel de byte en lugar de tokens de subpalabra. Esta elección es coherente con la tarea: permite manejar sin problemas dígitos, símbolos monetarios, barras, guiones y otros caracteres que los tokenizadores BPE fragmentan de forma inconsistente. El fine-tune se realizó con cuatro rondas sobre una misma receta: batch efectivo de 64 y aproximadamente 60.000 pares sintéticos más 200.000 pares derivados de FineWeb por época. La versión publicada corresponde a byt5-small entrenado durante 3 épocas.

La innovación principal no está en la arquitectura sino en el diseño híbrido: las reglas escritas a mano cubren dinero, horas, fechas, años y décadas, teléfonos, códigos postales, unidades, ordinales, rangos, fracciones, abreviaturas, números romanos, acrónimos y distancias de carrera. Cuando una regla no tiene certeza, delega en el modelo. La ronda 3 añadió siete categorías nuevas (fracciones, fechas con barra, abreviaturas, números romanos, acrónimos, distancias de carrera y dinero usado como adjetivo). El autor documenta que un byt5-base entrenado una época no superó al byt5-small entrenado tres épocas.

## Capacidades

- Normalización de texto escrito a forma hablada para TTS en inglés.
- Expansión de horas, fechas, años y décadas ("1660s" → "sixteen sixties").
- Expansión de moneda ("$25" → "twenty-five dollars") y de dinero usado como adjetivo.
- Expansión de números de teléfono, códigos postales y números de ruta.
- Expansión de unidades, temperaturas, fracciones y rangos ("2 1/2" → "two and a half", "350 °F" → "three hundred fifty degrees Fahrenheit").
- Expansión de abreviaturas comunes (Dr., St., Ave., Jr.), números romanos y acrónimos leídos letra a letra ("NBA" → "N B A").
- Expansión de distancias de carrera ("10K" → "ten K").
- Modo híbrido (reglas primero, modelo cuando las reglas rechazan) y modo solo modelo (`--mode model`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es una tarea de normalización acotada.

## Casos de uso

- Preprocesado de guiones de radio y podcast: el modelo convierte cifras, horas y abreviaturas del guion a su forma hablada antes de pasarlo al motor TTS, con reglas deterministas para los casos frecuentes y el modelo para los ambiguos.
- Asistentes de voz y altavoces inteligentes: normaliza respuestas generadas por un LLM (precios, fechas de entrega, direcciones) antes de sintetizarlas, evitando que el TTS lea "11/21" como "once barra veintiuno".
- Lectores de pantalla y accesibilidad: convierte contenido web con números, unidades y abreviaturas a una forma verbal comprensible para usuarios con discapacidad visual.
- Integración en pipelines de LLM más TTS: actúa como etapa intermedia entre la generación de texto y la síntesis de voz, con la ventaja de que el modo híbrido limita las invenciones del modelo.
- Locución automatizada de resultados deportivos o meteorológicos: expande marcadores, tiempos de carrera y temperaturas de forma consistente.
- Sistemas de anuncios públicos y transporte: normaliza horarios, andenes y códigos de ruta antes de la locución automática.
- Generación de audiolibros y contenido narrado: expande números de página, años y abreviaturas del texto fuente antes de la síntesis.

## Benchmarks y rendimiento

| Evaluación | Descripción | Modo | Resultado |
|---|---|---|---|
| `eval_synth.jsonl` | 2.000 pares sintéticos de plantillas no vistas | solo modelo | 1.000 (2.000/2.000) |
| `eval_synth_v3.jsonl` | 2.000 pares de 11 plantillas no vistas (categorías nuevas) | solo modelo | 0.9995 (1.999/2.000) |
| `eval_real_v0.jsonl` | 40 líneas de radio escritas a mano | híbrido | 30/30 en alcance, 10/10 en casos extendidos |
| `eval_real_v1.jsonl` | 60 líneas de radio escritas a mano | híbrido | 25/25 en alcance; 28/28 en las 7 categorías nuevas ignorando mayúsculas (26/28 exacto); 4/7 en casos extendidos |
| `eval_web.py` | Frases de FineWeb no vistas | solo modelo | 98,25% de acuerdo con las reglas en 2.000 frases que las reglas manejan; 70,3% limpias en 1.000 frases donde las reglas rechazan |

Comparación interna de variantes del autor en los mismos conjuntos de evaluación:

| Modelo | eval_synth_v3 | Acuerdo en eval_web | Líneas rechazadas limpias |
|---|---|---|---|
| Ronda 3 (byt5-small, 1 época) | 0,9735 | 0,946 | 69,7% |
| Esta release (byt5-small, 3 épocas) | 0,9995 | 0,9825 | 70,3% |
| byt5-base, 1 época | 0,9835 | 0,969 | 71,0% |

El autor advierte que los conjuntos sintéticos están cerca del techo y sirven sobre todo como protección contra regresiones, y que los conjuntos reales no son tests limpios (v1 se puntuó varias veces durante el desarrollo).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2 GB en fp32 para los 300 millones de parámetros; menos de 1 GB con cuantización a fp16 o int8.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para cargas moderadas.
- GPU recomendadas para producción de alto throughput: A10, L4, A100 o H100, aunque el modelo es lo bastante pequeño para no requerirlas.
- Opciones de despliegue: `transformers` (versión >= 4.46 y < 5 según la model card), con soporte de text-generation-inference y endpoints compatibles. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia: las reglas tardan unos 45 µs por frase; no se publican cifras de latencia ni throughput del modelo neuronal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audiction | 299,6 M | no disponible | Normalización de texto para TTS (inglés) | Apache 2.0 | Hugging Face |
| google/byt5-small | 299,6 M | no disponible | Modelo base T5 a nivel de byte, multiuso | Apache 2.0 | Hugging Face |
| byt5-base (variante entrenada por el autor) | ~600 M | no disponible | Misma tarea, 1 época | Apache 2.0 | No publicada como release |
| Reglas deterministas puras (p. ej. `verbalize.py`) | 0 | no aplica | Normalización exacta de casos cubiertos | según implementación | Incluidas en el repo |

No se dispone de comparación con otros normalizadores TTS publicados en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado para otros idiomas.
- El modo solo modelo puede inventar palabras en entradas extrañas: el autor documenta que una versión anterior leyó "21K" como "twenty-one thousand kilowatt hours".
- El modo híbrido es el recomendado; el modo solo modelo no debería usarse en producción sin revisión.
- Los códigos promocionales no se manejan: "SAVE20" se lee como "SAVEtwenty".
- Los tiempos de carrera pueden leerse como horas: "48:12" se interpreta como "forty-eight twelve".
- Las evaluaciones con datos reales no son conjuntos de test limpios, según admite el propio autor.
- Las comprobaciones de `eval_web` son proxies: detectan palabras perdidas o inventadas, pero no una lectura incorrecta de un número.
- Riesgo de sesgo y alucinación inherente a un modelo generativo, mitigado en parte por el diseño híbrido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base byt5-small también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Frosty40/Audiction
- Modelo base: https://huggingface.co/google/byt5-small
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
