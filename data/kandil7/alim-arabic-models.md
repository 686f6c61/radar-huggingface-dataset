# Kandil7/alim-arabic-models

## Resumen

Kandil7/alim-arabic-models es un paquete de tres cabezas neuronales especializadas en el procesamiento del árabe, desarrollado por Kandil7 dentro del proyecto ALIM, un sistema neuro-simbólico que combina reglas de morfología, sintaxis y prosodia con componentes neuronales. El conjunto resuelve dos tareas concretas: la diacritización automática en dos dominios distintos — prosa y verso poético — y la clasificación del metro poético en las 16 familias canónicas árabes (buhur).

Cada diacritizador tiene 12 millones de parámetros y utiliza una arquitectura BiLSTM con atención multi-cabeza, con tres salidas por carácter: vocal, shadda y tanwin. El clasificador de metros emplea embeddings por carácter y una BiLSTM de dos capas. Todos los pesos se publican en formato safetensors, acompañados de un script de inferencia en CPU, lo que permite su uso inmediato en entornos de producción con recursos mínimos.

El modelo es relevante porque la diacritización es un paso crítico en muchos pipelines de NLP árabe: el texto sin diacríticos es ambiguo y dificulta la traducción, el análisis sintáctico o la síntesis de voz. El autor publica además resultados de evaluación en conjuntos fijos: DER de 12.9% en prosa, DER de 11.7% en verso y una precisión de 79.6% en la clasificación de metros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiLSTM + multi-head attention (diacritizadores); char-embedding + BiLSTM de 2 capas (clasificador de metros) |
| Parámetros totales | 12M por diacritizador; clasificador de metros: no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los diacritizadores procesan por carácter; el clasificador de metros usa los primeros 128 caracteres) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors completos) |
| Idiomas soportados | Árabe |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los diacritizadores (diac-prose y diac-verse) son redes de 12M parámetros con arquitectura BiLSTM y atención multi-cabeza. Emiten tres salidas por carácter: vocal, shadda y tanwin. El tokenizador es simple: `ord(char) % 50000` para cada letra árabe; los diacríticos y espacios no tienen identificadores y el id de relleno es 0. El clasificador de metros (meter-16) utiliza embeddings por carácter y una BiLSTM de dos capas, con entrada "sadr | ajuz" limitada a 128 caracteres, y un vocabulario propio.

El entrenamiento de diac-prose combina 10.802 palabras sintéticas y 205.000 líneas de prosa real completamente vocalizada, con densidad superior al 50%, deduplicadas respecto al conjunto de evaluación. Se entrenó durante 10 épocas con AdamW (lr 1e-3), batch 32, pesos por clase y aumentación de nunación, con semilla 42; la pérdida pasó de 1.03 a 0.48. diac-verse siguió la misma receta con 54.000 shatrs de poesía vocalizada. meter-16 se entrenó con 36.768 bayts de 16 familias métricas, con pesos de clase limitados a 10× (la frecuencia inversa pura colapsaba el entrenamiento), label smoothing 0.1 y 10 épocas.

La innovación técnica destacable es la especialización por dominio en lugar de un modelo único. Un solo 12M no puede atender prosa y verso: la curva de participación muestra que, sin mezclar dominios, el rendimiento en el dominio contrario cae a aproximadamente un 46% de DER.

## Capacidades

- Diacritización de prosa árabe: añade vocales (fatha, damma, kasra), sukún, shadda y tanwin. DER de 12.9% en Shamela clean-2k.
- Diacritización de verso árabe: especializado en poesía, con DER de 11.7% en 313 bayts evaluados.
- Clasificación de metros poéticos árabes (16 buhur): precisión de 79.6% en test y 84.4% en el conjunto gold-327.
- Recuperación por clases en diacritización: en prosa/verso, bare 93/95%, fatha 88/89%, damma 88/81%, kasra 90/89%, sukún 90/91%, tanwin 83/86%, shadda 94/95%.
- Inferencia en CPU sin dependencias pesadas: incluye `inference_example.py` con torch y safetensors.
- Enrutado por dominio: el autor recomienda usar diac-verse para poesía y diac-prose para el resto.
- No ofrece generación de texto libre, tool calling, visión ni audio: es un conjunto de cabezas de propósito específico.

## Casos de uso

- Digitalización de textos árabes históricos: los OCR de manuscritos producen texto sin diacríticos; aplicar diac-prose para añadir vocalización y mejorar la legibilidad y la búsqueda en archivos digitales.
- Enseñanza de la lengua árabe: aplicaciones educativas pueden mostrar la vocalización correcta de palabras y frases, tanto en prosa como en poesía, usando los dos diacritizadores.
- Investigación literaria sobre poesía clásica: meter-16 permite clasificar automáticamente el bahr de versos, facilitando el análisis métrico en corpus extensos.
- Pregeneración de audio para TTS árabe: la diacritización precisa reduce la ambigüedad fonética y mejora la pronunciación en sistemas de texto a voz.
- Preprocesado de corpus para NLP: el texto árabe con diacríticos anotados sirve como entrada de mayor calidad para traducción automática, análisis sintáctico o etiquetado morfológico.
- Asistencia en la recitación de poesía: en contextos literarios o religiosos, los diacritizadores pueden apoyar la correcta vocalización de versos, combinando diac-verse con meter-16 para validar la métrica.
- Sistemas de control de calidad en edición árabe: revisar automáticamente si un texto vocalizado concuerda con las convenciones esperadas, señalando posibles errores de diacritización.

## Benchmarks y rendimiento

Se presentan los resultados de evaluación publicados por el autor, medidos con semilla 42 en conjuntos fijos:

| Tarea | Conjunto | Métrica | Resultado |
|---|---|---|---|
| Diacritización de prosa | Shamela clean-2k (2.000 líneas) | DER | 12.9% |
| Diacritización de verso | 313 bayts / 15 familias | DER | 11.7% |
| Clasificación de metros | Test retenido (2.177) | Precisión | 79.6% |
| Clasificación de metros | Gold-327 (nivel bahr) | Precisión | 84.4% |

El autor indica que la referencia SOTA en diacritización de prosa es 6.6% DER, por lo que estos especialistas de 12M se sitúan en torno al 12%. No se proporcionan comparativas con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- Los tres modelos son de pequeño tamaño: los diacritizadores suman cada uno 12M parámetros; el clasificador de metros no especifica su número de parámetros, pero el repositorio completo ocupa 0,1 GB.
- La inferencia puede ejecutarse en CPU de sobremesa sin necesidad de GPU. El script incluido usa torch y safetensors en modo CPU.
- VRAM estimada: inferior a 1 GB si se usa GPU; no es necesario un GPU dedicado.
- GPU recomendada: no se requiere, aunque una GPU moderna con al menos 2 GB de VRAM aceleraría el procesamiento por lotes.
- Es compatible con consumer GPUs, por ejemplo RTX 2060 o superiores, sin problemas.
- Opciones de despliegue: script Python propio, servidor sencillo con torch, integración en pipelines que ya usen safetensors. No se documenta soporte para vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; el procesamiento por carácter puede ser lento en CPU para textos largos, pero es adecuado para líneas o versos individuales.

## Comparativa con modelos similares

En la información disponible no se citan modelos comparables específicos. Sin embargo, el autor ofrece una comparativa interna entre un modelo único de 12M y los especialistas:

| Configuración | DER prosa | DER verso |
|---|---|---|
| Único 12M (0% poesía) | 12.9% | 45.8% |
| Único 12M (35% poesía) | 15.0% | 24.6% |
| Único 12M (100% poesía) | 45.9% | 11.7% |
| Especialistas enrutados por dominio | 12.9% | 11.7% |

La referencia SOTA en diacritización de prosa es 6.6% DER, según el autor; estos modelos de 12M se encuentran por debajo de ese nivel, pero son mucho más ligeros y específicos.

## Limitaciones y advertencias

- La diacritización de verso tiene un artefacto de datos: el gold es parcialmente vocalizado y contiene ruido; aproximadamente 8 puntos porcentuales del DER en verso provienen de esa incompletitud del conjunto de referencia.
- Las variantes de grafía en poesía, como las sedes de hamza en Arkashaar, pueden afectar a la consistencia de las entradas y salidas.
- La decodificación restringida por plantillas métricas perjudica a los versos de variantes métricas, como مجزوء; el autor recomienda usar decodificación argmax para verso mientras no se implementen restricciones sub-métricas.
- Estos modelos no alcanzan el estado del arte en prosa: SOTA 6.6% DER frente a un 12% aproximadamente.
- No son modelos de lenguaje autónomos: no generan texto libre ni soportan tool calling, chat o agentes.
- El clasificador de metros tiene clases minoritarias con pocos ejemplos; aunque los pesos de clase mitigaron el colapso, las clases de la cola pueden tener menor fiabilidad.
- No se documentan sesgos específicos en la información proporcionada; sin embargo, los modelos están entrenados predominantemente con texto árabe literario y poético, lo que puede limitar su generalización a variedades dialectales.
- El riesgo de alucinación no es relevante en este caso, al tratarse de tareas de etiquetado y no de generación de texto libre.
- La licencia MIT permite uso comercial y modificación, pero no incluye garantías de soporte.
- El repositorio no tiene descargas ni likes en HuggingFace en el momento de la consulta, lo que indica escasa adopción o falta de documentación más allá del script incluido.

## Enlaces

- HuggingFace: https://huggingface.co/Kandil7/alim-arabic-models
- GitHub del autor: https://github.com/Kandil7/kandil7
- El repositorio de HuggingFace incluye un script de inferencia (`inference_example.py`) y modelos en safetensors, aunque no se proporciona una demo interactiva.
