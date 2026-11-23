# BeardedMonster/gemma-3-0.8b-csw

## Resumen

gemma-3-0.8b-csw es un modelo de generación de texto derivado de google/gemma-3-1b-it, publicado por BeardedMonster bajo el paraguas de AletheiaAING. Se distribuye como un único archivo GGUF cuantizado en Q8_0 (877 MB, 822.510.208 parámetros) con vocabulario recortado, pensado para ejecutarse en CPU de portátil mediante llama.cpp sin necesidad de GPU. No es un modelo de propósito general: está especializado en dos tareas concretas sobre 37 lenguas africanas, el code-switching (mezcla natural de dos idiomas en una misma frase) y la reescritura idiomática.

El modelo resuelve un problema específico de cobertura lingüística: la mayoría de los asistentes conversacionales fallan cuando el usuario mezcla lenguas en un mismo mensaje, algo habitual en contextos multilingües africanos. Para ello expone una interfaz de prompts con etiquetas explícitas (`<hm>` para code-switching, `<ood>` para reescritura idiomática) y devuelve un bloque `<dev>` que marca los segmentos conmutados o los modismos empleados, lo que permite usar la salida como dato etiquetado.

Su relevancia es doble: por un lado, es un modelo pequeño (menos de mil millones de parámetros) ejecutable en hardware modesto; por otro, ataca una tarea poco cubierta por los modelos multilingües comerciales, que rara vez generan code-switching controlado con metadatos de spans. La licencia permite uso comercial con atribución, sujeta además a los Términos de Uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de google/gemma-3-1b-it); no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 822.510.208 (0,82B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits); único archivo publicado, `csw-gemma3-1b-rl3-pruned-Q8_0.gguf` |
| Idiomas soportados | 37 lenguas africanas: yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (códigos de la model card; la lista completa hasta 37 no se detalla) |
| Licencia | other: uso libre comercial y no comercial con atribución a AletheiaAING; se aplican además los Términos de Uso de Gemma |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de google/gemma-3-1b-it, la variante instructiva de 1B de la familia Gemma 3 de Google, con vocabulario recortado y posteriormente cuantizado a Q8_0 para distribución. La model card no documenta la arquitectura interna más allá de la herencia del modelo base, ni especifica el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO; el sufijo `rl3` del nombre de archivo sugiere alguna fase de entrenamiento por refuerzo, pero no se aporta detalle.

La innovación principal no está en la arquitectura sino en la interfaz de tarea: el modelo se entrena para interpretar etiquetas léxicas en el prompt (`<hm>`, `<ood>`), códigos de tres letras entre ángulos para base y lengua de mezcla, y para emitir una cabecera estructurada `[<switch>]<dev>…</dev>` con los spans conmutados o los modismos utilizados. Esta estructura convierte la salida en dato anotable y permite validar automáticamente la respuesta (si falta el bloque `<dev>`, la salida se considera inválida y debe remuestrearse).

## Capacidades

- Code-switching controlado (`hm`): dado texto en inglés (`eng_hm`) o en la lengua base (`m_hm`), genera la misma idea mezclando frases de la lengua de cambio seleccionada, restringido a los pares definidos en la tabla de lenguas del autor.
- Reescritura idiomática (`ood`): reescribe texto en registro vivo y coloquial con refranes, comparaciones y expresiones propias de hablante nativo, tanto desde inglés (`eng_ood`) como desde la propia lengua (`m_ood`).
- Reescritura idiomática de texto ya conmutado (`hm_ood`): conserva la mezcla de lenguas y añade riqueza idiomática.
- Anotación de spans: el bloque `<dev>` marca las frases conmutadas o los modismos empleados, útil para etiquetado y evaluación de detectores.
- Generación de texto conversacional e instruccional en 37 lenguas africanas.
- No realiza traducción convencional: la model card lo desaconseja explícitamente para esa tarea.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación de datos de chat code-switched: convertir consultas de usuario en inglés o en una sola lengua a versiones mezcladas (`eng_hm`, `m_hm`) para entrenar asistentes que toleren cómo escriben realmente los usuarios bilingües.
- Datos para ASR y TTS: producir frases conmutadas como guiones de lectura y listas de palabras con los segmentos mezclados, grabando después audio con hablantes reales y revisando el texto con un nativo.
- Pruebas de robustez: fabricar entradas multilingües para comprobar cómo responden chatbots, sistemas de traducción, identificadores de idioma o modelos de NER y análisis de sentimiento ante mezclas.
- Entrenamiento y evaluación de detectores de code-switching: los spans del bloque `<dev>` sirven como etiquetas para modelos de detección de cambio de código.
- Copy y diálogo con registro natural: reescritura idiomática (`ood`) de textos planos para narrativa, diálogos de videojuego, publicaciones sociales o copy publicitario, con revisión posterior por hablante nativo.
- Didáctica de lenguas: mostrar a estudiantes cómo mezclan lenguas los hablantes reales y qué refranes emplean.
- Aumento de datos para modelos propios: muestrear múltiples variantes por prompt (o aplicar MBR para seleccionar la mejor) y filtrarlas antes de incorporarlas a un corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el archivo Q8_0 ocupa 877 MB y está pensado para CPU de portátil con llama.cpp.
- GPU recomendadas: no aplica según el autor; cualquier GPU con al menos ~1 GB de memoria libre podría alojar el modelo si el runtime lo permite, pero no se documenta.
- Cabe en GPU de consumo: sí, por tamaño (0,82B en Q8_0), aunque el caso de uso declarado es CPU.
- Opciones de despliegue: llama.cpp (librería declarada); otros runtimes compatibles con GGUF no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-0.8b-csw | 0,82B | no disponible | Code-switching e idiomas en 37 lenguas africanas | other (atribución + Términos de Gemma) | GGUF en Hugging Face |
| google/gemma-3-1b-it | 1B | no disponible en la información proporcionada | Asistente general instructivo | Términos de Gemma | Pesos originales en Hugging Face |
| Alternativas especializadas en lenguas africanas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con su propio modelo base: este ajuste recorta el vocabulario, reduce el tamaño efectivo a 0,82B y añade una interfaz de tareas que el Gemma 3-1B-it original no ofrece, a costa de perder el comportamiento de asistente general.

## Limitaciones y advertencias

- No es un modelo de traducción: la model card indica explícitamente que para traducir debe usarse un modelo de traducción.
- Dependencia estricta del formato de prompt: una sola etiqueta mal escrita, un código de lengua incorrecto o un par de lenguas no listado invalida la generación; además debe usarse el tokenizer del repositorio.
- Validación obligatoria de la salida: si falta el bloque `<dev>`, la respuesta debe descartarse y remuestrearse.
- Contenido generado por máquina: el autor recomienda filtrar y revisar con hablante nativo antes de usar las salidas en producción o en datasets.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de fidelidad semántica respecto al texto de entrada.
- Cobertura lingüística parcial: la lista de la model card no enumera las 37 lenguas completas y los pares de code-switching están restringidos a una tabla que no se detalla en la información disponible.
- Licencia con obligaciones: requiere atribución a AletheiaAING en productos, servicios, papers o datasets, mantener el aviso y cumplir además los Términos de Uso de Gemma; conviene revisar la compatibilidad con usos comerciales concretos.
- Sin datos de contexto máximo ni de benchmarks: no es posible estimar el rendimiento frente a alternativas sin evaluación propia.
- Modelo con cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-0.8b-csw
- Perfil del autor de la atribución requerida: https://huggingface.co/AletheiaAING
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Términos de Uso de Gemma: no disponible en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
