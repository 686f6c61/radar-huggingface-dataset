# anishc16/hw1-hc3-detector

## Resumen

El modelo `anishc16/hw1-hc3-detector` es un clasificador binario de texto afinado (*fine-tuned*) a partir de `sentence-transformers/all-MiniLM-L6-v2` para distinguir respuestas escritas por humanos de respuestas generadas por ChatGPT en el corpus HC3. Lo publica el usuario anishc16 en HuggingFace bajo licencia Apache 2.0, con un único commit de pesos en formato safetensors y un tamano de repositorio de 0,1 GB. El modelo tiene 22.713.986 parametros totales, coherentes con la arquitectura MiniLM de tipo encoder BERT sobre la que se construye.

El problema que resuelve es la deteccion de texto generado por IA en dominios de respuesta abierta (preguntas y respuestas), un caso de uso recurrente en moderacion de foros, verificacion de contenido academico y filtrado de contenido sintetico. Frente a un clasificador base con una exactitud de referencia de 0,8449, el ajuste reportado por el autor alcanza 0,9959 de exactitud en el conjunto de test del propio corpus HC3, lo que indica una especializacion fuerte en la distribucion de ese dataset concreto.

La relevancia de esta ficha es limitada pero clara: se trata de un modelo pequeno (22,7 M de parametros), sin datos de descargas ni likes publicos en el momento de la consulta, sin model card detallada mas alla de dos cifras de exactitud y sin benchmarks externos. Es util como referencia de deteccion binaria humano vs. ChatGPT en HC3, pero no como detector general de texto IA fuera de ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (MiniLM), etiquetado como `bert` en los tags del repositorio |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se obtiene mediante *fine-tuning* de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de tipo MiniLM con cabecera de clasificacion binaria. El tag `bert` del repositorio y el recuento de 22.713.986 parametros son los unicos datos estructurales confirmados; no se especifica el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud maxima de secuencia configurada.

En cuanto al entrenamiento, la model card solo declara la tarea (clasificacion binaria de respuestas humanas frente a respuestas de ChatGPT en HC3), el mapeo de etiquetas (`0` = human, `1` = ChatGPT) y los resultados: una exactitud de referencia de 0,8449 y una exactitud de 0,9959 tras el ajuste en el conjunto de test. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal. Tampoco se indica si el ajuste se hizo sobre todos los parametros o mediante *adapters* u otra tecnica de eficiencia.

## Capacidades

- Clasificacion binaria de texto: devuelve una etiqueta `0` (humano) o `1` (ChatGPT) para una respuesta dada.
- Deteccion de texto generado por IA especificamente en el dominio de HC3 (preguntas y respuestas con respuestas humanas y respuestas de ChatGPT).
- Procesamiento de entradas de texto cortas o medianas propias de respuestas de foro, segun el formato heredado del encoder base.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues; el campo de idiomas aparece como no disponible.
- No se documentan modos especiales (modo *thinking*, vision, audio) ni generacion de texto.

## Casos de uso

- Moderacion de foros y comunidades de preguntas y respuestas: el clasificador puede etiquetar respuestas entrantes como humanas o generadas por ChatGPT para aplicar reglas de moderacion o etiquetado automatico, aprovechando que esta ajustado sobre el corpus HC3, que procede precisamente de ese tipo de plataformas.
- Verificacion de integridad en plataformas educativas: para detectar respuestas generadas por IA en ejercicios de texto libre, siempre que el dominio de las respuestas sea similar al de HC3 y se valide previamente la precision en la distribucion objetivo.
- Filtrado de contenido sintetico en pipelines de curación de datos: como primer paso barato (22,7 M de parametros) para marcar candidatos sospechosos de ser generados por ChatGPT antes de una revision manual o de un clasificador mas costoso.
- Analisis retrospectivo de corpus: para anotar grandes volumenes de respuestas historicas con la etiqueta humano/generado por IA y estudiar la proporcion de contenido sintetico a lo largo del tiempo.
- Componente de ensemble de deteccion: combinado con otros detectores (perplejidad, clasificadores estadisticos, detectores de watermark) para reducir falsos positivos mediante votacion o umbrales combinados.
- Investigacion sobre deteccion de texto IA: como linea base reproducible sobre HC3 para comparar tecnicas de ajuste, arquitecturas mas grandes o metodos de aumento de datos, dado que el autor reporta la exactitud base (0,8449) y la ajustada (0,9959).

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los de la propia model card:

| Metrica | Valor |
|---|---|
| Exactitud de referencia (*baseline*) | 0,8449 |
| Exactitud en test tras *fine-tuning* | 0,9959 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar, lo cual es esperable en un clasificador binario de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 91 MB de pesos (22.713.986 parametros x 4 bytes), mas el *overhead* de activaciones y runtime, que en la practica situa el consumo total por debajo de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 45 MB de pesos, con un consumo total tambien inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050 Ti, una T4 o incluso una iGPU moderna pueden ejecutar el modelo.
- Cabe holgadamente en GPU de consumo: si, en Practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: al ser un encoder BERT en safetensors, es compatible con la libreria `transformers` de HuggingFace; el despliegue con vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible y requeriria conversion o adaptacion al tratarse de un clasificador y no de un modelo generativo.
- Latencia y throughput: no disponibles. Dado el tamano del modelo, la inferencia por lotes en GPU deberia ser del orden de miles de secuencias por segundo, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables (parametros, contexto, rendimiento, licencia y disponibilidad) que permitan una comparativa rigurosa. La model card unicamente referencia el modelo base `sentence-transformers/all-MiniLM-L6-v2`, del cual este detector hereda la arquitectura y el tamano, pero no se aportan sus cifras de rendimiento en la tarea de deteccion.

| Modelo | Parametros | Contexto | Rendimiento en HC3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anishc16/hw1-hc3-detector | 22.713.986 | no disponible | 0,9959 de exactitud en test (segun el autor) | Apache 2.0 | HuggingFace |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta ajustado especificamente sobre HC3 y contra respuestas de ChatGPT; su exactitud de 0,9959 no es extrapolable a otros dominios, otros generadores (Claude, Gemini, Llama, etc.) u otros idiomas.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus concreto de preguntas y respuestas, heredara los sesgos de dominio, tematica y estilo de ese dataset.
- Riesgo de alucinacion no aplica en sentido generativo (no produce texto), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente con texto humano editado por IA o texto IA reescrito por humanos.
- Los campos de idiomas soportados y longitud de contexto aparecen como no disponibles, por lo que no se puede garantizar un comportamiento adecuado fuera del ingles ni con entradas largas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no impone restricciones especificas de uso mas alla de las habituales de esta licencia.
- El repositorio no tiene descargas ni likes publicos en el momento de la consulta, carece de pipeline declarado y la model card es minima; no hay evidencia de validacion independiente de las cifras reportadas.
- No se documenta el tratamiento de entradas vacias, muy cortas o con formatos no vistos, ni el umbral de decision recomendado para produccion.
- La fecha de creacion registrada en el repositorio (2026-09-30) es posterior a la fecha habitual de referencia, lo que conviene verificar antes de citar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/anishc16/hw1-hc3-detector
- Modelo base referenciado en la model card: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
