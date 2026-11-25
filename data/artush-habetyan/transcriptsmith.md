# artush-habetyan/transcriptsmith

## Resumen

Transcriptsmith es un adaptador LoRA acompañado de un mecanismo de compuerta pointer-generator (PG-pos) diseñado para formatear transcripciones crudas de reconocimiento automático del habla (ASR) y convertirlas en texto escrito correctamente. Lo desarrolla Artush Habetyan (junto con Hrant Baloyan y Davit Karamyan) y se publica como adaptador PEFT sobre el modelo base `google/flan-t5-xl`. El problema que resuelve es concreto: la salida de un sistema ASR carece de puntuación, mayúsculas y normalización de números, fechas e importes, lo que la hace poco legible y difícil de procesar aguas abajo.

La innovación principal no es el adaptador en sí, sino la compuerta PG-pos: en cada paso de decodificación el modelo estima una probabilidad `p_gen` que decide si copia un fragmento literal de la entrada (a través de la atención cruzada) o genera un token del vocabulario. Como la mayor parte de una transcripción debe copiarse sin cambios, la compuerta permanece cerrada la mayor parte del tiempo y solo se abre para insertar dígitos, signos de puntuación y mayúsculas. PG-pos amplía la compuerta clásica con LayerNorm por componente, una ponderación softmax aprendida sobre las cabezas de atención cruzada, un escalar de posición normalizado y una pérdida auxiliar de copia.

El modelo se entrenó conjuntamente en cuatro tareas principales (normalización inversa de texto, puntuación, ambas combinadas y copia plana) y dos auxiliares (corrección ortográfica y formateo completo). Con unos 3 000 millones de parámetros en el modelo base y una licencia no especificada, resulta relevante para pipelines de subtitulado, actas de reuniones y post-procesado de ASR en inglés, aunque su naturaleza de adaptador con módulo custom complica el despliegue estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (flan-T5-XL) con adaptador LoRA y compuerta pointer-generator PG-pos |
| Parametros totales | Aproximadamente 3 000 millones (modelo base flan-T5-XL); el adaptador LoRA es una fracción adicional |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion del base no se documenta) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.safetensors` (LoRA, r=64, alpha=128), `pg_weights.pt` (compuerta), `tokenizer.json`, `tokenizer_config.json`, `training_config.json` |
| Tamano del repositorio | 0,8 GB |
| Libreria | PEFT |

## Arquitectura y entrenamiento

El modelo base es `google/flan-t5-xl`, un transformer encoder-decoder de tipo T5 afinado con instrucciones, de aproximadamente 3 000 millones de parámetros. Sobre él se entrena un adaptador LoRA con rango 64 y alpha 128 aplicado a las proyecciones de atención y feed-forward. La pieza diferenciadora es la compuerta pointer-generator PG-pos, un módulo custom que en cada paso de decodificación emite `p_gen`: valores cercanos a 0 indican copia literal desde la entrada mediante atención cruzada, y valores cercanos a 1 indican generación desde el vocabulario. PG-pos añade a la compuerta clásica LayerNorm por componente, una ponderación softmax aprendida sobre las cabezas de atención cruzada, un escalar de posición de paso normalizado y una pérdida auxiliar de copia.

El entrenamiento es conjunto y multi-tarea: cuatro tareas principales (normalización inversa de texto, restauración de puntuación, ambas combinadas y copia plana) y dos auxiliares (corrección ortográfica y formateo completo). El prompt condiciona qué tarea se ejecuta. El paper reporta una fase de refinamiento en dos etapas que eleva el exact match del 54,2 % al 57,6 % en el benchmark de evaluación. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Restauración de puntuación y mayúsculas sobre texto ASR sin formato.
- Normalización inversa de texto (ITN): convierte números, fechas e importes hablados a su forma escrita (por ejemplo, "forty one thousand seven hundred eighty three dollars" a "$41,783").
- Copia fiel de la entrada mediante la compuerta pointer-generator, minimizando alteraciones no deseadas del contenido original.
- Corrección ortográfica como tarea auxiliar.
- Formateo completo de transcripciones como tarea auxiliar combinada.
- Condicionamiento por prompt para seleccionar la tarea (ITN, puntuación, ambas, copia, corrección, formateo).
- Solo inglés; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio de forma nativa.

## Casos de uso

- Post-procesado de subtítulos automáticos: el modelo recibe la salida cruda del ASR y devuelve texto con puntuación, mayúsculas y números normalizados, listo para publicar o para alimentar un sistema de traducción.
- Actas y transcripciones de reuniones: convierte la salida de un motor ASR en documentos legibles, preservando el contenido literal gracias a la compuerta de copia y abriendo la generación solo para signos y cifras.
- Normalización de importes y fechas en dominios financieros o administrativos: la ITN convierte cantidades habladas en formato escrito, útil en transcripciones de llamadas o informes dictados.
- Pipelines de accesibilidad: generación de subtítulos legibles para vídeo y audio en directo, donde la fidelidad al original es crítica y la compuerta de copia reduce el riesgo de reescritura.
- Preprocesado para NLP aguas abajo: transcripciones con puntuación y cifras normalizadas mejoran el rendimiento de sistemas de extracción de entidades, resumen o búsqueda.
- Corrección de transcripciones ASR de bajo coste: la tarea auxiliar de corrección ortográfica permite limpiar errores léxicos menores antes de la revisión humana.
- Evaluación e investigación en ITN y puntuación: el adaptador y la compuerta PG-pos sirven como referencia reproducible para experimentos de formateo de ASR con mecanismos de copia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exact match (configuración final flan-T5-XL) | 57,6 % |
| Exact match (antes del refinamiento en dos etapas) | 54,2 % |
| Character error rate (CER) | 0,0201 |
| Benchmark de evaluación | 3 965 muestras balanceadas held-out |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo de aproximadamente 3 000 millones de parámetros en precisión completa requiere del orden de 12 GB o más, y en cuantización de 8 bits o 4 bits puede reducirse sustancialmente, aunque no se documentan configuraciones.
- GPU recomendadas: el autor indica que el modelo necesita una GPU para uso interactivo; no se especifican modelos concretos. Por tamaño, encajan GPU de datacenter (A100, H100) y GPU de consumo de gama alta (RTX 4090, RTX 3090) en cuantización.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 con cuantización; no confirmado en la información disponible.
- Opciones de despliegue: el adaptador requiere la clase de modelo custom del Space de demostración (`t5/models/t5_pointer_generator.py`), por lo que no es directamente compatible con vLLM, llama.cpp u Ollama sin portar la compuerta. El `app.py` del Space muestra cómo cargar el modelo base, la compuerta y el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transcriptsmith (flan-T5-XL + LoRA + PG-pos) | ~3 000 M (base) | No disponible | ITN y puntuación ASR con compuerta de copia | No disponible | Hugging Face (adaptador) |
| google/flan-t5-xl (base) | ~3 000 M | 512 tokens (T5 estándar) | Encoder-decoder instruido | Apache 2.0 (modelo base) | Hugging Face |
| Modelos de restauración de puntuación basados en BERT/RoBERTa | ~100-400 M | 512 tokens | Clasificación token a token | Variable | Hugging Face |

No se dispone en la información proporcionada de comparativas de rendimiento con alternativas específicas de ITN o puntuación; la comparación anterior es estructural y de disponibilidad.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Formatos raros son el punto débil según el análisis de fallos del paper: URLs, iniciales con puntos interiores y rangos numéricos con guion.
- La compuerta es un módulo custom: el adaptador no funciona con la carga estándar de PEFT sin la clase `t5_pointer_generator.py` del Space de demostración, lo que complica la integración en servidores de inferencia convencionales.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación inherente a la generación desde vocabulario cuando la compuerta se abre; la fidelidad depende del comportamiento de `p_gen`.
- No se documentan sesgos conocidos ni evaluaciones de robustez más allá del benchmark reportado.
- El modelo base flan-T5-XL tiene un contexto limitado (512 tokens en la arquitectura T5 estándar); no se confirma la longitud efectiva para este adaptador.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema y soporte comunitario mínimos.

## Enlaces

- Hugging Face: https://huggingface.co/artush-habetyan/transcriptsmith
- Demo Space: https://huggingface.co/spaces/artush-habetyan/transcriptsmith
- Paper (versión de los autores, PDF): https://habetyan.github.io/CV/papers/asr-transcript-formatting-copy-mechanism.pdf
- Modelo base: https://huggingface.co/google/flan-t5-xl
- Cita: Artush Habetyan, Hrant Baloyan, Davit Karamyan. *Formatting Speech Recognition Transcripts Using Encoder-Decoder Models with Copy Mechanism.* IEEE CODASSCA 2026.
