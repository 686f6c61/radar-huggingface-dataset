# canbingol/tr-bpe-fineweb-64k

## Resumen

`tr-bpe-fineweb-64k` es un tokenizer de tipo byte-level BPE entrenado específicamente para turco por el usuario canbingol. No se trata de un modelo de lenguaje completo, sino de un componente de tokenización que puede integrarse en pipelines de entrenamiento e inferencia mediante la librería `transformers`. Su vocabulario es de 64.000 tokens y se entrenó sobre 1.000 millones de caracteres extraídos exclusivamente de FineWeb-2 en turco.

El tokenizer aborda un problema recurrente en el procesamiento del turco: la morfología aglutinante del idioma genera palabras muy largas y con numerosos sufijos, lo que provoca una fertilidad elevada con tokenizers genéricos multilingües. El autor reporta una fertilidad media de 1,889 en turco, con valores que oscilan entre 1,409 en comentarios y 2,705 en poesía. La pre-segmentación preserva los sufijos tras el apóstrofo como una unidad, de modo que `Türkiye'de` se divide en `Türkiye` + `'de`.

Es relevante para equipos que entrenan o ajustan modelos en turco y buscan reducir el número de tokens por palabra, lo que impacta directamente en el coste computacional y en la longitud efectiva de contexto. No se ha publicado ninguna versión de modelo entrenada con este tokenizer, por lo que su evaluación se limita al nivel de tokenización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer) |
| Parámetros totales | no disponible (no es un modelo de lenguaje) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantización | no disponible (no aplica a tokenizers) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible |
| Formato de pesos | tokenizer de Hugging Face (`tokenizers` / `transformers`) |
| Tamaño de vocabulario | 64.000 tokens |
| Tokens especiales | `<pad>`, `<unk>`, `<s>`, `</s>` |
| `min_frequency` | 2 |
| Datos de entrenamiento | 1.000 millones de caracteres, 100 % FineWeb-2 turco |

## Arquitectura y entrenamiento

El tokenizer emplea byte-level BPE implementado con la librería `tokenizers` de Hugging Face, con `min_frequency=2` y un vocabulario objetivo de 64.000 tokens. La pre-tokenización aplica una regla específica para el turco: el sufijo que sigue a un apóstrofo se mantiene como una unidad separada, de forma que `Türkiye'de` se segmenta en `Türkiye` + `'de`. Esta decisión refleja la estructura aglutinante del idioma y busca que las terminaciones gramaticales queden aisladas de forma consistente.

El corpus de entrenamiento consiste en 1.000 millones de caracteres extraídos íntegramente de FineWeb-2 en turco, sin mezcla de otros idiomas. El autor indica que los conjuntos de test se separaron del material de entrenamiento sin solapamiento de texto entre ambos lados. No se documenta ningún proceso de normalización Unicode adicional, ni pesos por frecuencia de dominio, ni entrenamiento de modelo asociado.

## Capacidades

- Tokenización de texto en turco con vocabulario de 64.000 tokens.
- Segmentación byte-level, lo que garantiza cobertura de cualquier secuencia de bytes sin tokens `<unk>` para texto fuera del vocabulario.
- Manejo específico de sufijos tras apóstrofo (`Türkiye'de` → `Türkiye` + `'de`).
- Integración directa con `AutoTokenizer` de `transformers`.
- Compatibilidad con la librería `tokenizers` para entrenamiento y preprocesado de corpus.
- No incluye capacidades de generación, razonamiento, código, matemáticas, visión, tool calling ni agentes: es exclusivamente un tokenizer.

## Casos de uso

- Entrenamiento de modelos de lenguaje en turco desde cero: el tokenizer reduce el número de tokens por palabra (fertilidad media de 1,889), lo que disminuye el coste computacional y permite cubrir más texto con la misma ventana de contexto.
- Ajuste fino de modelos multilingües existentes con un tokenizer específico para turco: útil cuando se quiere especializar un modelo base en turco y se necesita un vocabulario más eficiente que el original.
- Preprocesado de corpus turcos para investigación lingüística: la tokenización consistente de sufijos permite analizar la distribución de morfemas y terminaciones en grandes volúmenes de texto.
- Medición de fertilidad y comparación de tokenizers: el modelo card publica resultados por dominio (FineWeb, wiki, académico, comentarios, tweets, médico, poesía), lo que sirve como referencia para evaluar alternativas.
- Sistemas de búsqueda y recuperación de información en turco: un tokenizer con buena cobertura morfológica mejora la calidad de índices invertidos y de representaciones dispersas.
- Clasificación de texto y análisis de opiniones en turco: la segmentación de sufijos tras apóstrofo facilita el tratamiento de nombres propios y entidades en redes sociales y comentarios.
- Construcción de datasets tokenizados para pipelines de entrenamiento distribuido: el formato estándar de Hugging Face permite cargarlo con `AutoTokenizer` y serializar los tokens de forma reproducible.

## Benchmarks y rendimiento

El autor publica únicamente métricas de fertilidad (total de tokens dividido entre palabras separadas por espacios; menor es mejor). No hay resultados de benchmarks de modelos de lenguaje porque no existe un modelo entrenado con este tokenizer.

| Conjunto de test | Fertilidad |
|---|---|
| FineWeb | 1,495 |
| wiki | 2,047 |
| académico | 1,574 |
| comentarios | 1,409 |
| tweets | 1,715 |
| médico | 2,276 |
| poesía | 2,705 |
| poesía (fuente distinta) | 1,975 |
| tweets (fuente distinta) | 1,460 |
| inglés | 1,781 |
| Media en turco (TR) | 1,889 |

La media en turco se calcula como promedio equitativo de FineWeb y seis dominios. Las filas marcadas como "fuente distinta" corresponden a tests de poesía y tweets procedentes de fuentes no utilizadas en el entrenamiento.

## Requisitos de hardware

- Al ser un tokenizer, no requiere GPU ni VRAM para su uso en inferencia o preprocesado; se ejecuta en CPU.
- El coste computacional se limita al procesado de texto y es despreciable frente al de un modelo de lenguaje.
- Puede cargarse en cualquier entorno con Python y las librerías `transformers` o `tokenizers`, incluyendo portátiles y contenedores ligeros.
- Para entrenamiento o tokenización masiva de corpus, el rendimiento depende del número de procesos y del uso de la implementación Rust subyacente de `tokenizers`; no se publican cifras de throughput.
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI, ya que estas herramientas sirven modelos de lenguaje, no tokenizers aislados.

## Comparativa con modelos similares

No se dispone de datos de otros tokenizers comparables en la información proporcionada (fertilidad, vocabulario, licencia). La comparación con alternativas como el tokenizer de XLM-R, el de Llama 3 o tokenizers específicos para turco no puede realizarse sin datos verificables, por lo que se indica "no disponible".

| Criterio | tr-bpe-fineweb-64k | Alternativas |
|---|---|---|
| Tipo | Byte-level BPE | no disponible |
| Vocabulario | 64.000 | no disponible |
| Idiomas | turco | no disponible |
| Fertilidad en turco | 1,889 (media) | no disponible |
| Licencia | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ha evaluado a nivel de tokenizer; no existe ningún modelo entrenado con él, por lo que no hay evidencia de su impacto real en tareas downstream.
- Los conjuntos de test de seis dominios (FineWeb, wiki, académico, comentarios, tweets, médico) proceden de las mismas fuentes que el entrenamiento, por lo que los resultados en esos dominios pueden ser optimistas según el propio autor.
- La fertilidad en poesía (2,705) y en textos médicos (2,276) es notablemente superior a la media, lo que indica un peor rendimiento en registros especializados o con vocabulario poco frecuente.
- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial; debe consultarse con el autor antes de integrarlo en producción.
- El vocabulario está optimizado para turco; su uso con otros idiomas no está evaluado y la fertilidad en inglés (1,781) no es competitiva frente a tokenizers multilingües especializados.
- No se documentan sesgos, pero al entrenarse exclusivamente con FineWeb-2 turco hereda la distribución y posibles sesgos de esa fuente web.
- No se especifican la versión de `tokenizers` utilizada, la configuración exacta de normalización ni los detalles de la pre-tokenización más allá de la regla del apóstrofo.

## Enlaces

- Hugging Face: https://huggingface.co/canbingol/tr-bpe-fineweb-64k
- FineWeb-2 (origen de los datos): no disponible en la información proporcionada
- Repositorio o paper del autor: no disponible en la información proporcionada
