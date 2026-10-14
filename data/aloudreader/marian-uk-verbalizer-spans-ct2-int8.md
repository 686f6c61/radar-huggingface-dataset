# aloudreader/marian-uk-verbalizer-spans-ct2-int8

## Resumen

marian-uk-verbalizer-spans-ct2-int8 es un modelo de normalización de texto en ucraniano orientado a síntesis de voz (text-to-speech), desarrollado por el usuario aloudreader. Su función es convertir los elementos escritos de una frase ucraniana (números, fechas, importes monetarios, unidades, numerales romanos, abreviaturas, palabras en latín, símbolos y marcas de nota al pie) en la forma hablada que leería un narrador, procesando un span marcado cada vez. No reescribe la prosa ordinaria: copia intacto todo lo que queda fuera de los spans detectados.

El modelo es un Marian seq2seq de 52,7 millones de parámetros, exportado a CTranslate2 en cuantización INT8. Se distribuye con el script `spans.py`, que detecta los spans a partir únicamente de la forma de los caracteres y ensambla la salida final, y actúa como implementación de referencia del paquete `accentuk`. Está entrenado sobre el dataset `skypro1111/uk-text-normalization` y ajustado específicamente con pares de spans.

Su relevancia radica en que aborda un problema concreto de los pipelines TTS en ucraniano (la lectura correcta de elementos no léxicos) con un modelo muy pequeño (54 MB en INT8) que corre en CPU a 10,2 ms por frase, y con una tasa de alteración de palabras fuera de los spans de solo el 0,45%, muy inferior a la de alternativas como el modelo de frase completa E54 (4,99%) o un verbalizador Gemma-3-270M (8,08%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq), checkpoint E60 |
| Parametros totales | 52,7 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entrada truncada a 192 tokens; longitud maxima de decodificacion 96 tokens |
| Tipos de cuantizacion | INT8 (CTranslate2) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`); tokenizador Marian |

## Arquitectura y entrenamiento

El modelo es un Marian de tipo encoder-decoder con atención completa, en su variante E60, con 52,7 millones de parámetros. La innovación de diseño no está en la arquitectura, sino en la formulación de la tarea: en lugar de reescribir la frase completa, se marca un único span con `[[ ]]` dentro de la frase original y el modelo genera únicamente la forma hablada de ese span. Todo el texto fuera de los spans se copia del original, lo que minimiza el riesgo de que el modelo altere prosa que no necesita normalización. La detección de spans la realiza `spans.py` basándose solo en la forma de los caracteres, sin diccionarios ni reglas dependientes del idioma, y ese mismo script ensambla el resultado final.

El entrenamiento consistió en un ajuste fino (warm start) del modelo E54 del mismo proyecto, que trabaja a nivel de frase completa. Sobre los pares frase-escrita/frase-hablada de E54 se generaron 1,1 millones de pares de spans mediante alineación de palabras escritas y habladas, a los que se añadieron marcas de nota al pie leídas como nada, nombres de gobernantes antes de numerales romanos en todos los casos y recuentos animados sobremuestreados. El ajuste se realizó durante dos épocas con una tasa de aprendizaje de 5e-5.

## Capacidades

- Verbalización de números, fechas, importes monetarios, unidades de medida y numerales romanos al ucraniano hablado.
- Expansión de abreviaturas, palabras en latín y símbolos como parte de la lectura de un narrador.
- Lectura de marcas de nota al pie como cadena vacía (no se pronuncian).
- Normalización span a span: solo se modifica el fragmento marcado y se preserva el resto de la frase original.
- Detección automática de spans basada únicamente en la forma de los caracteres, sin reglas específicas del idioma.
- Operación como componente de un pipeline de text-to-speech, integrado en el paquete `accentuk`.
- No dispone de tool calling, soporte de agentes, razonamiento multi-paso ni capacidades multimodales (visión o audio).

## Casos de uso

- Preprocesado en pipelines TTS en ucraniano: el modelo convierte cifras, fechas y abreviaturas en su forma hablada antes de pasarlas al sintetizador, evitando lecturas incorrectas. Su tamaño de 54 MB y su latencia de 10,2 ms por frase en CPU lo hacen apto para procesado por lotes.
- Audiolibros y narración automatizada: con una tasa de alteración de palabras fuera de los spans del 0,45%, resulta adecuado para narraciones largas donde la fidelidad del texto original es crítica.
- Normalización de contenido editorial y prensa: permite convertir cifras y símbolos de artículos a forma hablada para versiones de audio sin reescribir la redacción original.
- Accesibilidad y lectura asistida: integración en lectores de pantalla o asistentes de voz que deban pronunciar correctamente fechas, unidades y numerales de documentos ucranianos.
- Procesado por lotes en servidores sin GPU: al ejecutarse en CTranslate2 sobre CPU, permite normalizar grandes volúmenes de texto en infraestructura estándar sin aceleradores dedicados.
- Integración en herramientas de conversión de texto a voz de código abierto: el script `spans.py` actúa como implementación de referencia, lo que facilita su incorporación en el paquete `accentuk` y en otros proyectos que necesiten segmentar y verbalizar spans.

## Benchmarks y rendimiento

Los datos de calidad los aporta el propio autor (medidos el 2026-10-14). La "spoken match" no tiene en cuenta mayúsculas, puntuación ni guiones, ya que no se oyen. La comparación se realiza frente al modelo de frase completa E54 del mismo proyecto y frente a un verbalizador Gemma-3-270M.

| Prueba | Este modelo (CT2 INT8, CPU) | E54, frase completa | Gemma-3-270M verbalizer, frase completa |
|---|---:|---:|---:|
| Particiones reservadas de `skypro1111/uk-text-normalization`, 3.619 filas | 88,86% | 89,53% | ~90,2% |
| 1.102 frases de audiolibro con dígitos, latín, abreviaturas o símbolos (referencias de Qwen3.8-27B) | 70,05% | 62,61% | 58,89% |
| Frases de audiolibro con una palabra fuera de los spans alterada | 0,45% | 4,99% | 8,08% |

Rendimiento medido: 10,2 ms por frase en la CPU de un portátil con spans procesados por lotes. El modelo ocupa 54 MB.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en INT8 ocupa 54 MB, por lo que puede ejecutarse íntegramente en memoria de sistema.
- GPU recomendadas: no disponible (el modelo está pensado para CPU; no se documentan recomendaciones de GPU).
- Cabe en GPU de consumo: sí, cualquier GPU con al menos unos cientos de megabytes libres podría ejecutarlo, aunque no es su entorno objetivo.
- Opciones de despliegue: CTranslate2 (formato nativo del export), con el tokenizador Marian de Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: 10,2 ms por frase en la CPU de un portátil con procesado de spans por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Spoken match (audiolibros, 1.102 frases) | Palabras alteradas fuera de spans | Licencia |
|---|---|---|---|---|---|
| marian-uk-verbalizer-spans CT2 INT8 (este) | 52,7 M | Verbalización span a span | 70,05% | 0,45% | MIT |
| E54 (mismo proyecto) | 52,7 M | Verbalización de frase completa | 62,61% | 4,99% | no disponible en la informacion proporcionada |
| Gemma-3-270M verbalizer | 270 M | Verbalización de frase completa | 58,89% | 8,08% | no disponible en la informacion proporcionada |

En las particiones reservadas de `skypro1111/uk-text-normalization`, el modelo E54 (89,53%) y Gemma-3-270M (~90,2%) obtienen puntuaciones ligeramente superiores a este modelo (88,86%). Sin embargo, en frases reales de audiolibro el enfoque span a span supera a ambos, y reduce drásticamente la alteración de texto fuera de los spans.

## Limitaciones y advertencias

- Está especializado exclusivamente en ucraniano; no soporta otros idiomas.
- La tarea es de normalización de texto, no de generación libre: no debe emplearse como modelo conversacional ni de razonamiento.
- La entrada se trunca a 192 tokens, por lo que frases muy largas pueden perder contexto para la detección y verbalización de spans.
- Es obligatorio usar `min_decoding_length=0` en CTranslate2; con el valor por defecto (1) el modelo no puede leer una marca de nota al pie como cadena vacía e inventa una palabra para ella.
- Es obligatorio usar `suppress_sequences=[["<s>"]]`, ya que este export comienza la decodificación desde `<s>`, que nunca debe generarse.
- En las particiones reservadas del dataset de normalización rinde algo por debajo de los modelos de frase completa comparados; su ventaja se concentra en texto real de audiolibro.
- No se documentan sesgos específicos ni tasa de alucinación más allá de las métricas de palabras alteradas fuera de spans.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que su adopción y mantenimiento comunitario son limitados.
- El pipeline tag de HuggingFace figura como `text-generation`, mientras que la model card indica `text2text-generation`; conviene verificar la configuración de carga en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aloudreader/marian-uk-verbalizer-spans-ct2-int8
- Paquete `accentuk`: https://github.com/vacuum-in/accentuk
- Código de entrenamiento y evaluación: https://github.com/vacuum-in/marian-uk-verbalizer
- Dataset de entrenamiento: https://huggingface.co/datasets/skypro1111/uk-text-normalization
