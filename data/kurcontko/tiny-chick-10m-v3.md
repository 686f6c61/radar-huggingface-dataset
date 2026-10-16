# kurcontko/Tiny-Chick-10M-V3

## Resumen

Tiny Chick 10M V3 es un modelo de lenguaje de 9,6 millones de parametros (9.591.684 exactos) entrenado desde cero por el usuario kurcontko para la [Tiny-ML Leaderboard](https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard). No es un modelo de proposito general: es un ejercicio de investigacion orientado a maximizar metricas concretas de la leaderboard (BLiMP, ARC-Easy, perplejidad de bytes en WikiText-2 y una puntuacion de eficiencia) con un presupuesto de parametros extremadamente reducido. La relevancia de este tipo de modelos esta en estudiar recetas de entrenamiento, curriculos de datos y tecnicas de ajuste en el regimen de los millones de parametros, no en su uso productivo.

La arquitectura es un transformer decoder-only de tipo TinyLM con 14 capas, ancho 240, 6 cabezas de atencion (2 KV heads, es decir, atencion con consultas agrupadas), MLP con activacion ReLU², QK-norm, RoPE parcial, vocabulario BPE de 4.096 tokens y una longitud de contexto de solo 512 tokens. El entrenamiento combina 24.000 millones de tokens de FineWeb-Edu filtrado, una fase de continuacion de 600 millones de tokens con un 40% de pasajes sinteticos sobre conceptos cientificos, un ajuste fino listwise sobre ARC con termino gramatical y un "model soup" final que promedia diez checkpoints en fp32.

Su resultado principal es una puntuacion de BLiMP de 77,76 y un 59,60% en ARC-Easy con menos de 10 millones de parametros, a costa de un entrenamiento dirigido explicitamente a los benchmarks (incluyendo los splits de entrenamiento y validacion de ARC). El propio autor advierte que el modelo es "fluido, no factual, y no entrenado para chat".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLM, custom_code): 14 capas, ancho 240, 6 cabezas de atencion con 2 KV heads, MLP ReLU², QK-norm, RoPE parcial |
| Parametros totales | 9.591.684 (aproximadamente 9,6 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga via transformers con `trust_remote_code=True`); requiere codigo personalizado del repositorio |
| Vocabulario | BPE de 4.096 tokens |
| Tamano del repositorio | 0,0 GB segun HuggingFace |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only compacto con 14 capas de ancho 240 y 6 cabezas de atencion de las cuales solo 2 son cabezas de clave/valor (GQA), lo que reduce el coste de la cache KV, aunque el ejemplo oficial de uso desactiva la cache (`use_cache=False`). Usa activacion ReLU² en el MLP, normalizacion QK, RoPE parcial y un vocabulario BPE de 4.096 tokens. El contexto es de 512 tokens, coherente con el presupuesto de computo y con el objetivo del benchmark.

La receta tiene cuatro fases documentadas. Primero, preentrenamiento con 24.000 millones de tokens de FineWeb-Edu limpiado, de los cuales los ultimos 5.600 millones se restringen a documentos con puntuacion educativa igual o superior a 3. Segundo, continuacion con 600 millones de tokens compuestos por un 45% de FineWeb-Edu, un 15% de texto de entrenamiento de WikiText-103 y un 40% de pasajes sinteticos. Tercero, ajuste fino listwise sobre ARC: diez ejecuciones desde el mismo checkpoint de continuacion con semillas distintas, con un 85% de repeticion de datos de lenguaje y con y sin ARC-Challenge. Cuarto, "model soup": los diez checkpoints ajustados se promedian en fp32 mediante `blend.py` y ese promedio es el modelo publicado.

Los pasajes sinteticos (69.000 pasajes cortos, 20 millones de tokens) fueron escritos por MiMo-V2.6-Flash y Qwen3.8-27B sobre los conceptos subyacentes a las preguntas de entrenamiento y validacion de ARC-Easy y ARC-Challenge, los hechos centrales de OpenBookQA y los hechos de QASC. Se descartaron salidas truncadas, mal formateadas, repetitivas, duplicadas o que compartieran una secuencia de 13 palabras con las preguntas y respuestas de test o validacion de ARC o con el texto de test de WikiText-2; las preguntas de test nunca se mostraron a los generadores. Ademas se anadio un termino gramatical: 60.000 pares minimos construidos a partir de frases naturales (WikiText-103, FineWeb-Edu) mediante una corrupcion basada en reglas (intercambio de concordancia, pronombre, preposicion o forma verbal, intercambio de dos palabras, eliminacion o insercion de una palabra funcional), con una perdida de margen de peso 0,1 y 2 nats que pide al modelo preferir el original. No se usaron frases, plantillas ni listas de palabras de BLiMP. Segun el autor, este termino aporta alrededor de un punto de BLiMP sin alterar ARC.

## Capacidades

- Generacion de texto en ingles: continuacion de texto libre a partir de un prompt, con fluidez local razonable para su tamano.
- Conocimiento gramatical evaluado de forma acotada: 77,76 en BLiMP, con el termino gramatical del ajuste fino aportando aproximadamente un punto.
- Razonamiento cientifico de nivel escolar muy acotado: 59,60% en ARC-Easy, resultado de un ajuste fino dirigido sobre ese benchmark.
- No soporta tool calling ni function calling: no se documenta ninguna capacidad de este tipo.
- No soporta agentes ni razonamiento multi-paso: no hay entrenamiento ni evaluacion en ese sentido.
- Multilingue: no. El modelo esta etiquetado unicamente como ingles.
- Capacidades especiales: no dispone de modo de razonamiento explicito (thinking), vision ni audio.
- No esta entrenado para chat ni para seguir instrucciones conversacionales; la model card lo indica de forma explicita.
- Perplejidad de bytes de 2,335 en WikiText-2, una medida de modelado de lenguaje mas que de utilidad practica.

## Casos de uso

- Investigacion sobre recetas de entrenamiento a escala minima: reproducir las cuatro fases (preentrenamiento, continuacion con datos sinteticos, ajuste fino listwise y model soup) para estudiar el efecto de cada decision sobre BLiMP, ARC-Easy y la perplejidad de bytes.
- Estudio de destilacion de datos sinteticos: analizar como 20 millones de tokens de pasajes generados por modelos mayores sobre conceptos de ARC, OpenBookQA y QASC afectan al rendimiento en tareas de conocimiento escolar, con las salvaguardas de filtrado descritas por el autor.
- Analisis de contaminacion de benchmarks: el modelo usa los splits de entrenamiento y validacion de ARC junto con OpenBookQA y QASC, por lo que sirve como caso de estudio para medir el impacto de la contaminacion controlada en un regimen de pocos parametros.
- Experimentos de ajuste gramatical con pares minimos: la receta del termino gramatical (60.000 pares con corrupciones basadas en reglas y perdida de margen de peso 0,1 y 2 nats) es reutilizable para probar si un objetivo auxiliar mejora la competencia gramatical sin tocar otras metricas.
- Educacion y divulgacion: al caber en cualquier hardware, permite ejecutar y modificar un modelo completo de 9,6 M de parametros en un portatil para explicar tokenizacion, atencion, contextos cortos y decodificacion.
- Pruebas unitarias de infraestructura de despliegue: su tamano minimo lo hace util como modelo de humo para validar pipelines de transformers, carga con `trust_remote_code` y scripts de evaluacion (`glint_eval.py`) sin coste de GPU.
- Generacion de texto de relleno o prototipos: continuaciones cortas en ingles de hasta 512 tokens de contexto, siempre que no se requiera fidelidad factual, con `repetition_penalty` elevado como en el ejemplo oficial.

## Benchmarks y rendimiento

Resultados publicados por el autor, puntuados con el protocolo Glint-1.3 usando `glint_eval.py` del repositorio (port del scoring de `benchmark.py` de Qielbas):

| Metrica | Tiny Chick 10M V3 (modelo publicado) | Checkpoint previo al ajuste fino de ARC |
|---|---|---|
| BLiMP | 77,76 | 79,6 |
| ARC-Easy | 59,60 | 56,3 |
| WikiText-2 byte-ppl | 2,335 | 2,313 |
| Efficiency | 86,70 | no disponible |
| Parametros | 9.591.684 | no disponible |

Notas del autor: el ajuste fino sobre ARC sube ARC-Easy en 3,3 puntos y baja BLiMP en 1,84 puntos respecto al checkpoint de continuacion; el termino gramatical anade aproximadamente un punto de BLiMP sin alterar ARC. El autor puntuo catorce soups candidatos en los conjuntos de test entre V2, V2.1 y V3; el publicado es el mejor y el resto se situo entre 82,5 y 86,0 en la puntuacion de eficiencia. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo derivado del numero de parametros, no dato publicado por el autor): aproximadamente 38,4 MB en fp32 (4 bytes por parametro), 19,2 MB en fp16/bf16 (2 bytes) y 9,6 MB en int8 (1 byte). Son estimaciones de solo pesos, sin cache de activaciones.
- GPU recomendadas: no disponible. Cualquier GPU con al menos unas decenas de MB libres de memoria es suficiente por tamano, incluidas integradas y GPUs de portatil.
- Cabe en GPU de consumo: si, con margen amplio, en cualquier GPU de consumo actual e incluso en modelos antiguos, dado que el modelo completo ocupa menos de 40 MB en fp32.
- Opciones de despliegue: la unica ruta documentada es transformers con `AutoModelForCausalLM` y `trust_remote_code=True`. No hay pesos GGUF, por lo que no se documenta uso con llama.cpp, Ollama ni LM Studio. No se documentan recetas para vLLM o TGI.
- Latencia y throughput estimados: no disponible. El ejemplo oficial llama a `generate` con `use_cache=False`, lo que sugiere que la decodificacion puede ser mas lenta de lo habitual; el autor no explica el motivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLiMP | ARC-Easy | WikiText-2 byte-ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Tiny Chick 10M V3 | 9.591.684 | 512 | 77,76 | 59,60 | 2,335 | Apache 2.0 | HuggingFace, safetensors |
| Tiny Chick 10M V2.1 | no disponible (misma arquitectura segun el autor) | 512 (misma arquitectura) | no disponible | no disponible | no disponible | Apache 2.0 (presumiblemente, no confirmado) | HuggingFace |
| Otros modelos comparables de la Tiny-ML Leaderboard | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica que V3 comparte arquitectura con V2.1 y que se entreno mas tiempo, con mas pasajes cientificos sinteticos antes del ajuste fino de ARC y con el termino gramatical. No se publican en la informacion disponible las metricas individuales de V2.1 ni de V2, solo el rango de eficiencia de los catorce soups evaluados (82,5 a 86,0) y que V3 fue el mejor.

## Limitaciones y advertencias

- Entrenamiento dirigido a benchmarks: el autor indica explicitamente que no es un resultado de preentrenamiento puro, sino una receta orientada a metricas concretas. Las cifras de BLiMP y ARC-Easy deben interpretarse en ese contexto.
- Contaminacion de benchmarks: el entrenamiento uso los splits de entrenamiento y validacion de ARC (para el ajuste fino y como semilla de los pasajes sinteticos), ademas de OpenBookQA y QASC. El autor afirma que no se usaron respuestas de test ni el texto de test de WikiText-2, y que las decisiones de diseno se tomaron sobre el eje de validacion con una unica evaluacion en test.
- No es factual: la propia model card describe el modelo como "fluido, no factual". El riesgo de alucinacion en cualquier consulta de conocimiento es alto y no debe usarse como fuente de informacion.
- No esta entrenado para chat: no sigue instrucciones conversacionales ni formatos de dialogo.
- Contexto muy limitado: 512 tokens, insuficiente para documentos largos, conversaciones multi-turno reales o recuperacion aumentada con contexto extenso.
- Idioma unico: solo ingles; no hay evaluacion ni datos en castellano ni en otros idiomas.
- Rendimiento gramatical y de conocimiento de nivel escolar: aunque BLiMP sea 77,76, el ajuste fino sobre ARC reduce BLiMP respecto al checkpoint previo (79,6), lo que refleja un compromiso entre tareas.
- Sin cuantizaciones publicadas: la ausencia de GGUF limita el despliegue en herramientas de inferencia local habituales; solo se documenta la ruta transformers con codigo personalizado (`trust_remote_code=True`), lo que implica ejecutar codigo del repositorio.
- Rendimiento y adopcion no validados: 0 descargas y 0 "likes" en el momento de los datos, sin evaluaciones independientes.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de la licencia (conservar avisos de copyright y licencia, indicar cambios). No se documentan restricciones adicionales, pero el modelo no tiene utilidad productiva realista por sus capacidades.
- Datos sinteticos generados por terceros: los pasajes provienen de MiMo-V2.6-Flash y Qwen3.8-27B, con los sesgos y errores propios de esos generadores, filtrados solo por criterios de formato, duplicacion y solapamiento de 13 palabras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurcontko/Tiny-Chick-10M-V3
- Version anterior con la misma arquitectura: https://huggingface.co/kurcontko/Tiny-Chick-10M-V2.1
- Tiny-ML Leaderboard: https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de continuacion: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset de ajuste/evaluacion: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset de hechos cientificos: https://huggingface.co/datasets/allenai/openbookqa
- Dataset de hechos cientificos: https://huggingface.co/datasets/allenai/qasc
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
