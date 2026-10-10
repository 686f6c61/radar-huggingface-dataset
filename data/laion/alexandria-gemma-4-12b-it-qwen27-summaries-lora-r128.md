# laion/Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r128

## Resumen

Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r128 es un adaptador LoRA de rango 128 desarrollado por LAION dentro del Project Alexandria, y publicado el 9 de octubre de 2026. No es un modelo independiente: son matrices de adaptador que se cargan sobre el modelo base google/gemma-4-12B-it (revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7). Su tarea es la generacion de resumenes cientificos que preserven conocimiento factual reutilizable (entidades, atributos y relaciones) reduciendo la dependencia de la prosa original.

El problema que aborda es el coste de producir representaciones de conocimiento cientifico reutilizables por agentes para recuperacion, respuesta a preguntas y sintesis, sin reproducir la expresion literal de la fuente. Para ello se entrena un extractor pequeno por destilacion de un profesor mayor: el profesor es Qwen/Qwen3.8-27B-FP8 (revision 017b9c7af6b5689d5dd426a76e0bc077eb5ca20a) y el alumno es el adaptador sobre Gemma 4 12B IT.

El entrenamiento es deliberadamente minimo: 865 ejemplos procedentes de 865 articulos, una sola epoca y 109 actualizaciones del optimizador. Aun asi, el autor declara una mejora de 4,85 puntos porcentuales en exactitud de QA frente al mismo modelo base sin adaptador, usando un evaluador fijo Qwen2.5-7B-Instruct sobre un conjunto de 97 articulos y 970 preguntas de opcion multiple. Es relevante porque cuantifica cuanto puede aportar un ajuste LoRA muy pequeno y de bajo coste sobre un modelo de 12B en una tarea de extraccion de conocimiento cientifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder google/gemma-4-12B-it; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible (modelo base de ~12B; el repositorio del adaptador ocupa 2,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (formato de adaptador PEFT/LoRA) |

Configuracion del adaptador: rango 128, alpha 256, dropout 0.05, aplicado a las proyecciones de atencion q/k/v/o y a las proyecciones MLP gate/up/down. Libreria declarada: peft.

## Arquitectura y entrenamiento

Se trata de un adaptador de bajo rango (LoRA) acoplado a Gemma 4 12B IT. Los modulos adaptados son, por un lado, las cuatro proyecciones de atencion (query, key, value, output) y, por otro, las tres proyecciones del bloque MLP (gate, up, down). El rango es 128 con alpha 256 (escalado efectivo 2) y dropout 0.05.

El entrenamiento usa el optimizador AdamW con learning rate 2e-5, weight decay 0.01, un 5% de warmup y decaimiento coseno posterior. El modelo base se mantiene congelado en BF16 y se emplean gradient checkpointing, flex attention y entropia cruzada ponderada por tokens de asistente (assistant-token-weighted cut cross entropy). El lote efectivo es de 8, los tokens de prompt y fuente se enmascaran en la perdida y no se aplica truncamiento ni a la fuente ni al objetivo. El conjunto de datos es ChristophSchuhmann/scientific-summary-distillation-Qwen3.8-27B-865-20261004 (revision fijada 9f572fb367865b7eaf7dca37b5cb269558b84026), con 865 ejemplos procedentes de 865 articulos, una epoca y 109 actualizaciones del optimizador. Las respuestas del generador original y su razonamiento emitido se supervisaron con la plantilla nativa de canal de pensamiento de Gemma; las respuestas corregidas no se emparejaron con razonamiento ajeno. El benchmark de 97 articulos y 970 preguntas se excluyo del entrenamiento por identidad, titulo, hashes y solapamiento sustancial de texto.

El marco conceptual es el paper Project Alexandria (arXiv:2502.19413), que propone representaciones que preservan conocimiento y son agnosticas de estilo. Conviene subir la nota de que este lanzamiento es solo un generador: no se entreno ningun adaptador de revision de calidad o correccion.

## Capacidades

- Generacion de resumenes cientificos estructurados a partir del texto completo de articulos de investigacion (tarea principal, "generator-only").
- Extraccion de conocimiento factual en forma de unidades de conocimiento: entidades, atributos y relaciones (por ejemplo, intervencion, dosis, efecto medido, poblacion y incertidumbre como campos separados).
- Distincion entre resultados medidos e interpretaciones, segun la motivacion declarada del proyecto.
- Generacion con canal de razonamiento ("thinking") activado, usando la plantilla nativa de Gemma para el canal de pensamiento.
- Generacion en un unico turno de resumenes largos: en la evaluacion, la longitud narrativa nativa media fue de 3753 tokens en las 97 posiciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el adaptador esta pensado para ser usado por agentes, pero no se documentan capacidades de agente propias).
- Capacidades multilingues: solo ingles declarado.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Construccion de bases de conocimiento cientifico: procesar lotes de articulos y emitir resumenes con entidades, relaciones y magnitudes separadas en campos, para alimentar un indice de recuperacion que un agente consulte sin depender de la prosa original.
- Respuesta a preguntas sobre literatura cientifica: generar una representacion del articulo y pasarla a un modelo respondedor ligero; en la evaluacion del autor, ese esquema alcanzo un 92,47% de exactitud con 970 preguntas de opcion multiple sobre 97 articulos retenidos.
- Revision bibliografica asistida: condensar un corpus de articulos en resumenes comparables en longitud (media de 2469 palabras en la configuracion de rango 128) para que un investigador localice rapido condiciones experimentales y resultados.
- Extraccion de condiciones experimentales: recuperar dosis, poblaciones, efectos medidos e intervalos de incertidumbre como campos independientes, lo que permite agregarlos en tablas comparativas entre estudios.
- Verificacion con trazabilidad: cada unidad de conocimiento puede acompanarse de un identificador de fuente que un agente sigue para comprobar el dato contra la publicacion original.
- Generacion de resumenes de bajo coste a gran escala: al ser un adaptador LoRA entrenado por destilacion sobre 865 ejemplos, el coste de producir nuevas representaciones es inferior al de ejecutar el profesor Qwen3.8-27B-FP8; en la evaluacion se midieron 500,9 tokens de finalizacion por segundo y GPU en una GH200.
- Pipelines de enriquecimiento de repositorios documentales: integrar el adaptador en un servicio de inferencia que convierta PDF o texto extraido en resumenes estructurados antes de indexarlos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (verified: false en el model-index). La evaluacion usa un respondedor fijo Qwen2.5-7B-Instruct que recibe la representacion generada y responde preguntas de opcion multiple. Cada articulo aporta diez preguntas; las generaciones fallidas cuentan como diez respuestas incorrectas y las respuestas invalidas permanecen en el denominador. Los intervalos de confianza se calculan con 10.000 remuestreos bootstrap pareados por articulo.

| Generador | Correctas / 970 | Precision QA | Intervalo 95% | Articulos fallidos | Media de palabras del resumen |
|---|---:|---:|---|---:|---:|
| Gemma 4 12B IT sin LoRA, thinking activado | 850 | 87,63% | 85,26-89,90% | 0 | 1070 |
| Gemma 4 12B IT rango 64, una epoca | 853 | 87,94% | 82,68-92,68% | 7 | 2198 |
| Gemma 4 12B IT rango 128, una epoca (este adaptador) | 897 | 92,47% | 89,07-95,15% | 2 | 2469 |

El adaptador mejora la exactitud en +4,85 puntos porcentuales frente al control base emparejado, con un intervalo pareado del 95% de +0,93 a +8,14. El propio autor senala que los resumenes generados mas largos y los fallos de formato afectan al resultado, y que la comparacion no mantiene fija la longitud del resumen.

Rendimiento de generacion declarado: 71,71 minutos en una GH200 activa, a 500,9 tokens de finalizacion por segundo y GPU, incluyendo el razonamiento emitido y los reintentos por formato. Longitud narrativa nativa media: 3753 tokens en las 97 posiciones, con las salidas fallidas contribuyendo cero. El arranque del servidor, el entrenamiento y la evaluacion QA quedan excluidos de esa medida.

No se han publicado resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador es pequeno (repositorio de 2,2 GB) pero requiere cargar el modelo base google/gemma-4-12B-it, que domina el consumo de memoria: aproximadamente 24 GB en BF16 como estimacion derivada de un modelo de 12B en esa precision.
- Precision de referencia durante el entrenamiento: base en BF16 con gradient checkpointing, flex attention y LoRA.
- GPU documentada por el autor: una GH200 activa para generar los 97 resumenes del conjunto retenido (141 GB de HBM en esta familia de aceleradores).
- GPU de datacenter tipo A100 o H100 (80 GB) y similares: adecuadas para servir el modelo base en BF16 con margen.
- GPUs de consumo: no disponible. No hay datos en la informacion proporcionada sobre cuantizacion, cuantos bits soporta el adaptador ni si el modelo base cabe en tarjetas de 24 GB en algun formato.
- Opciones de despliegue: la libreria declarada es peft, por lo que el camino natural es transformers + peft (carga del adaptador sobre el base fijado). No se documentan en la informacion disponible ficheros GGUF, soporte en llama.cpp u Ollama, ni recetas especificas para vLLM o TGI.
- Latencia y throughput: 500,9 tokens de finalizacion por segundo y GPU en una GH200 durante la evaluacion, incluyendo razonamiento y reintentos de formato. No hay cifras de latencia por peticion ni de throughput en otros aceleradores.

## Comparativa con modelos similares

La informacion disponible solo permite comparar variantes dentro de la misma familia (Gemma 4 12B IT con y sin adaptador). No hay datos publicados sobre adaptadores equivalentes de otros autores ni sobre modelos de la misma categoria en la informacion proporcionada.

| Modelo / variante | Parametros base | Longitud de contexto | Precision QA (970 MCQ) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r128 | ~12B (base congelado) + LoRA r128 | no disponible | 92,47% | cc-by-4.0 (adaptador) | HuggingFace, libreria peft |
| Gemma 4 12B IT sin adaptador (control) | ~12B | no disponible | 87,63% | no disponible en esta ficha | google/gemma-4-12B-it |
| Alexandria ... LoRA rango 64 | ~12B (base congelado) + LoRA r64 | no disponible | 87,94% | no disponible en esta ficha | referenciado en la model card, sin enlace directo |
| Otros modelos comparables de resumen cientifico | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura limitada de conocimiento: el adaptador ensena la tarea de extraccion, no contiene una base de datos de todo el conocimiento cientifico. Los 865 articulos de entrenamiento acotan el dominio efectivamente visto.
- Aviso explicito del autor: este lanzamiento no certifica que sus salidas esten libres de derechos de autor. Las auditorias de copia literal siguen encontrando solapamiento sustancial con las fuentes, por lo que el acceso a la fuente, sus terminos, la atribucion y la revision de las salidas siguen siendo responsabilidad del usuario.
- La exactitud de QA mide utilidad para responder preguntas; no establece autorizacion legal ni correccion factual completa.
- Riesgo de alucinacion: es un generador puro, sin adaptador de revision de calidad ni de correccion, y no se documentan mecanismos de verificacion propios.
- Longitud variable y fallos de formato: en la configuracion evaluada hubo 2 articulos fallidos de 97 y los resumenes generados son mas largos que el control (2469 frente a 1070 palabras medias), lo que el propio autor identifica como factor que afecta a la comparacion.
- La comparacion de benchmarks no mantiene fija la longitud del resumen, por lo que la ventaja de +4,85 puntos porcentuales no esta aislada del efecto de generar textos mas largos.
- Solo ingles declarado: no hay soporte multilingue documentado.
- Longitud de contexto, cuantizaciones soportadas y condiciones de despliegue en produccion: no disponibles.
- Licencia del adaptador cc-by-4.0, que exige atribucion. El modelo base google/gemma-4-12B-it tiene sus propios terminos, no detallados en la informacion proporcionada; hay que verificarlos antes de cualquier uso comercial.
- Requiere cargar obligatoriamente el modelo base en la revision indicada; no funciona como modelo autonomo.
- Resultados de benchmark no verificados (verified: false en el model-index): son cifras declaradas por el autor, no reproducidas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r128
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Dataset de destilacion: https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Qwen3.8-27B-865-20261004
- Paper Project Alexandria: https://arxiv.org/abs/2502.19413 (referenciado como arXiv:2502.19413v2)
- Configuracion de entrenamiento (dentro del repositorio): training_config.json
- Manifiesto de datos nativo (dentro del repositorio): training/manifest.json
- Procedencia de pesos y codigo (dentro del repositorio): provenance.json
