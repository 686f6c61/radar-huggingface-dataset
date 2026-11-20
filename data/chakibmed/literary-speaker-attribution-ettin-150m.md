# chakibmed/literary-speaker-attribution-ettin-150m

## Resumen

Literary speaker attribution, Ettin 150M es un modelo encoder de 150 millones de parámetros especializado en una tarea muy concreta: determinar qué personaje pronuncia cada línea de diálogo en una novela en inglés, o bien declarar que no lo sabe. Lo desarrolla el usuario chakibmed como componente del modelo de atribución de hablantes de Whisperbook, un lector de audiolibros offline que asigna una voz distinta a cada personaje. El modelo no genera texto: es un ranker de token-classification que puntúa cada nombre de un elenco cerrado para cada intervención.

La relevancia del modelo está en su enfoque de despliegue: se distribuye en dos packs ONNX, uno para CPU genérica y otro optimizado para la NPU Hexagon v73 de los Snapdragon, de modo que toda la inferencia ocurre en el dispositivo sin red. El pack NPU acelera el procesamiento de un libro completo entre 5,8 y 6,3 veces respecto al pack CPU, con menos de la mitad de memoria pico.

Se apoya en el encoder Ettin 150M de jhu-clsp (licencia MIT) y se ha afinado sobre escenas de 20 novelas de dominio público etiquetadas con el corpus PDNC. La ventana de contexto efectiva es de 2.048 tokens por escena, con un elenco máximo de 40 nombres y un máximo de 4.000 caracteres de texto de escena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Ettin 150M) afinado como ranker con cabezas de pooling y clasificación |
| Parametros totales | 150M (modelo base); pack CPU ONNX de 603.161.133 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por escena (truncado); escena de hasta 4.000 caracteres, dos bloques de contexto y elenco de hasta 40 nombres |
| Tipos de cuantizacion | fp32 en el pack CPU; W8A16 en los bloques de atención y MLP del pack NPU (residual stream en fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (pesos); etiquetas de entrenamiento CC BY 4.0 (PDNC) |
| Formato de pesos | ONNX (ranker-fp32.onnx, heads.onnx, emb.f32, norms.f32) y tokenizer.json de Ettin |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin 150M y se reentrena como ranker para atribución de hablantes. La entrada combina un encabezado con el elenco de nombres del escenario y el texto de la escena, tokenizado con el tokenizer de Ettin y truncado a 2.048 tokens. Sobre esa representación se aplican cinco matrices de pooling que seleccionan los tokens de cada span de diálogo, de su párrafo, de cada nombre del encabezado y de las menciones de cada nombre en la escena, más doce variables categóricas (`facts`) por par span-nombre y un indicador de mención. La salida es un vector de logits de forma [S, R+1], donde la última columna representa la clase "nadie".

El entrenamiento usa escenas de 20 novelas de dominio público etiquetadas por el Project Dialogism Novel Corpus: 16 novelas para entrenamiento, *The Age of Innocence* para validación y fijación del umbral, y tres para test. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO; al tratarse de una tarea de clasificación supervisada, no cabe esperar alineamiento por preferencias. La innovación técnica destacable es la separación en dos packs de despliegue con umbrales calibrados por separado (0,977 en CPU y 0,974 en NPU) y la ejecución del encoder en la NPU Hexagon en tres buckets de longitud de secuencia (1.024, 1.536 y 2.048 tokens).

## Capacidades

- Atribución de hablante por línea de diálogo en novelas en inglés, eligiendo entre un elenco cerrado de hasta 40 nombres o la clase "nadie".
- Abstención explícita: solo asigna nombre cuando la probabilidad del mejor candidato supera el umbral del perfil; en caso contrario la línea queda como desconocida.
- Puntuación de candidatos por escena con contexto de párrafo y menciones previas del nombre en el texto.
- Inferencia totalmente offline en dispositivo, sin llamadas de red.
- Ejecución en CPU genérica vía ONNX Runtime y en NPU Hexagon v73 de Snapdragon vía QAIRT 2.44.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Lectores de audiolibros con voces por personaje: el modelo identifica el hablante de cada línea de diálogo para que el motor TTS asigne la voz correcta, ejecutándose en el propio teléfono sin conexión y con latencia despreciable gracias al pack NPU.
- Análisis literario automatizado: extracción de la estructura de diálogo de una novela (quién habla, cuánto y en qué escenas) para estudios de estilometría o humanidades digitales, con la ventaja de que las líneas dudosas quedan marcadas como desconocidas en lugar de atribuirse erróneamente.
- Preparación de corpus para TTS y doblaje: etiquetado previo de diálogos de obras de dominio público para generar audiolibros o dramatizaciones, aprovechando la precisión alta (0,985-0,986) sobre las líneas que el modelo sí nombra.
- Herramientas de lectura accesible: resaltado o coloreado de intervenciones por personaje en lectores de eBooks para usuarios con dificultades de seguimiento de diálogo, con todo el procesamiento local y sin enviar el texto a servidores.
- Etiquetado asistido de datos: generación de propuestas de atribución para anotadores humanos en proyectos de corpus literario, reduciendo el trabajo manual y dejando explícitas las líneas no resueltas.
- Filtrado y control de calidad en pipelines editoriales: detección de diálogos sin atribuir o mal atribuidos en digitalizaciones de novelas antes de su publicación o conversión a otros formatos.
- Despliegue en dispositivos de gama media: el pack CPU (ONNX Runtime, fp32) permite ejecutar el modelo en cualquier teléfono u ordenador, y el pack NPU en Snapdragon con Hexagon v73, lo que habilita aplicaciones móviles sin backend.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Precisión en líneas nombradas | 0,986 | *Pride and Prejudice* (held-out) |
| Precisión en líneas nombradas | 0,985 | *Hard Times* y *Oliver Twist* (con el juez del 2026-11-19) |
| Precisión en líneas nombradas | 0,909 | *Hard Times* y *Oliver Twist* (con el juez estricto anterior) |
| cast-eval (97 spans limpios) | 50 correctos, 0 incorrectos, resto desconocido | Líneas etiquetadas de Whisperbook |
| Aceleración del pack NPU frente a CPU | 5,8-6,3x por libro completo | Nothing Phone (3), SM8735 |
| Divergencia NPU vs CPU | ~1% de las líneas | *The Age of Innocence* |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son comprobaciones propias del proyecto contra etiquetas humanas de PDNC y no constituyen una afirmación de precisión general.

## Requisitos de hardware

- VRAM/RAM para el pack CPU: el fichero ONNX fp32 ocupa 603.161.133 bytes (~0,6 GB), por lo que la inferencia requiere del orden de esa cifra más el overhead de ONNX Runtime; cabe en cualquier teléfono o portátil moderno.
- Pack NPU: requiere un Snapdragon con NPU Hexagon v73 y QAIRT 2.44; los bloques de atención y MLP se ejecutan en W8A16 y el residual stream en fp32 sobre CPU. Los seis binarios de contexto QNN (425.529.344 bytes) no se publican en el repositorio y deben importarse en la aplicación.
- GPU dedicadas: no se documenta uso de CUDA ni de GPUs de datacenter (A100, H100, RTX 4090); el diseño está orientado a CPU y NPU móvil.
- Cabe en GPU de consumo: no aplica según la información disponible, ya que el despliegue previsto es ONNX Runtime en CPU o NPU.
- Opciones de despliegue: ONNX Runtime (pack CPU), QAIRT 2.44 con QNN (pack NPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; solo la relación de 5,8-6,3x a favor del pack NPU y la reducción a menos de la mitad de la memoria pico en un Nothing Phone (3) con SM8735.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| literary-speaker-attribution-ettin-150m | 150M | 2.048 tokens por escena | Atribución de hablante en novelas | MIT (pesos), CC BY 4.0 (etiquetas) | Hugging Face, packs ONNX CPU y NPU |
| jhu-clsp/ettin-encoder-150m | 150M | no disponible | Encoder de propósito general (modelo base) | MIT | Hugging Face |
| Modelos de atribución de hablantes en literatura comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos de atribución de hablantes literarios con los que establecer una comparación cuantitativa; los únicos datos de referencia son los del modelo base Ettin 150M.

## Limitaciones y advertencias

- Las métricas de precisión (0,985-0,986) se han medido sobre un conjunto pequeño de novelas del siglo XIX y no constituyen una afirmación de precisión general; las líneas que el modelo deja como desconocidas no cuentan como aciertos.
- La probabilidad de salida no está calibrada, por lo que la aplicación no reporta confianza al usuario; solo aplica un umbral fijo por perfil.
- El modelo solo cubre inglés y está entrenado con novelas de dominio público del siglo XIX; su comportamiento en otros géneros, épocas o registros no está documentado.
- El elenco está limitado a 40 nombres y la escena a 4.000 caracteres y 2.048 tokens; textos más largos se truncan, lo que puede degradar la atribución.
- Los packs NPU y CPU pueden discrepar en aproximadamente el 1% de las líneas, de ahí que cada uno tenga su propio umbral.
- Los binarios QNN del pack NPU no se redistribuyen desde Hugging Face por incertidumbre sobre la licencia de QAIRT; deben importarse manualmente en la aplicación, lo que añade fricción al despliegue.
- Riesgo de alucinación bajo en el sentido generativo (no produce texto libre), pero persiste el riesgo de atribución errónea cuando el umbral se supera por poco; el diseño mitiga esto con la clase "nadie" y la abstención.
- No se documentan sesgos demográficos o culturales específicos más allá de los propios del corpus PDNC; al tratarse de literatura del siglo XIX, los nombres y roles reflejan ese contexto.
- La licencia MIT permite uso comercial de los pesos, pero las etiquetas de entrenamiento son CC BY 4.0 y el autor pide citar el paper de PDNC (Vishnubhotla, Hammond y Hirst, LREC 2022).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chakibmed/literary-speaker-attribution-ettin-150m
- Dataset de entrenamiento: https://huggingface.co/datasets/chakibmed/literary-speaker-attribution-pdnc
- Modelo base Ettin 150M: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Project Dialogism Novel Corpus (PDNC): https://github.com/Priya22/project-dialogism-novel-corpus
- Paper de PDNC: Vishnubhotla, Hammond y Hirst, LREC 2022 (referencia citada en la model card; no se proporciona URL directa)
