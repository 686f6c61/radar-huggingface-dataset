# mc9901708/CODA19-Qwen3.5-4B-LoRA

## Resumen

CODA19-Qwen3.5-4B-LoRA es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario mc9901708. No es un modelo de propósito general: es un ajuste especializado en una única tarea de procesamiento de literatura científica, consistente en tomar el texto plano de un abstract, segmentarlo por sí mismo y asignar cada segmento a uno de cinco aspectos de investigación (antecedentes, objetivo, método, resultado y otros), indicando además la entrada correspondiente del libro de códigos.

El interés técnico está en el planteamiento de la evaluación: el autor reporta que el adaptador no solo mejora la clasificación de segmentos ya delimitados (76,14 % → 88,18 % de acierto sobre 400 abstracts de test), sino que resuelve la segmentación de forma conjunta, pasando de un 22,7 % a un 87,4 % en la métrica estricta donde deben acertarse simultáneamente las fronteras y la etiqueta. Esa diferencia de casi 65 puntos porcentuales indica que el ajuste traslada al modelo una habilidad estructural (decidir dónde empieza y acaba cada aspecto), no solo una clasificación superficial.

El adaptador tiene un rango LoRA alto (r = 96, alpha = 192) y se distribuye bajo licencia Apache 2.0, la misma del modelo base. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigación reciente (creado el 23 de octubre de 2026) sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen3.5; detalles de atención y capas del modelo base no disponibles |
| Parametros totales | Modelo base: 4 000 millones aproximados (según la denominación "4B"; no verificado en la información disponible). Adaptador: no disponible (rango LoRA r = 96, alpha = 192) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento con cuantización de 4 bits NF4 (QLoRA). El adaptador se publica en precisión completa (safetensors); no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en` en metadatos); el ajuste se realizó exclusivamente sobre abstracts científicos en inglés |
| Licencia | Apache 2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere descargar el modelo base por separado |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango acoplado a Qwen/Qwen3.5-4B mediante PEFT. Se entrenó con QLoRA, es decir, con los pesos del modelo base congelados en cuantización NF4 de 4 bits y únicamente los matrices de adaptación en precisión de entrenamiento. La configuración declarada es r = 96 y alpha = 192 (ratio alpha/r = 2), un rango considerablemente mayor de lo habitual en ajustes de clasificación, coherente con el objetivo de que el modelo aprenda una tarea generativa estructurada —segmentar y etiquetar— en lugar de una simple cabeza de clasificación. El checkpoint publicado corresponde al paso 1375.

Los datos de entrenamiento provienen de CODA-19 (Huang et al., 2020), un corpus de anotación de abstracts construido sobre CORD-19; los abstracts originales son de literatura biomédica, principalmente sobre COVID-19, y conservan las licencias de cada artículo fuente. El prompt de entrenamiento y el procedimiento de evaluación están documentados en el notebook del repositorio de GitHub del autor. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del conjunto (más allá de los 400 abstracts de test citados), ni si se aplicaron etapas de RLHF o DPO; al tratarse de un ajuste supervisado sobre una tarea de anotación, es previsible que no las haya, pero no se confirma.

La innovación destacable no es arquitectónica sino metodológica: el modelo genera la segmentación y la clasificación en una sola pasada autoregresiva, evaluándose con una métrica estricta de fronteras más etiqueta, en lugar de asumir segmentos previamente delimitados. Ese enfoque elimina la dependencia de un segmentador externo, que es precisamente donde el modelo base falla de forma catastrófica (22,7 %).

## Capacidades

- Segmentación automática de abstracts científicos en unidades discursivas, sin necesidad de un paso previo de delimitación.
- Clasificación de cada segmento en cinco categorías: antecedentes, objetivo, método, resultado y otros.
- Referencia a la entrada del libro de códigos (codebook) correspondiente a cada asignación, lo que facilita la trazabilidad de la anotación.
- Salida en formato estructurado generado de forma autoregresiva, apta para serialización y posterior validación programática.
- Procesamiento de texto científico en inglés, con vocabulario biomédico heredado del corpus CORD-19.
- Capacidad de razonamiento y generación de propósito general heredada del modelo base Qwen3.5-4B, aunque el ajuste la especializa y no está evaluada en la información disponible.
- Soporte de tool calling, agentes o modo thinking: no documentado para este adaptador; no disponible.

## Casos de uso

- Anotación asistida de revisiones sistemáticas: el adaptador procesa abstracts descargados de PubMed o Europe PMC y devuelve segmentos etiquetados por aspecto, reduciendo el trabajo manual de cribado previo en revisiones de literatura biomédica.
- Construcción de bases de datos estructuradas de evidencia: a partir de un corpus de abstracts, se generan registros con campos separados (objetivo, método, resultado) que alimentan un esquema relacional consultable, en lugar de almacenar texto libre.
- Enriquecimiento de repositorios documentales internos: bibliotecas corporativas o institucionales pueden indexar por aspecto de investigación, permitiendo búsquedas del tipo "métodos que usan PCR en saliva" restringidas a la sección de método.
- Extracción de resultados cuantitativos para minería de datos: al aislar el segmento de resultado, un pipeline posterior puede aplicar expresiones regulares o un modelo de extracción de entidades sobre un texto mucho más limpio y corto.
- Generación de resúmenes estructurados: los segmentos etiquetados se reorganizan en una plantilla IMRaD abreviada, útil para boletines científicos internos o paneles de seguimiento de literatura.
- Control de calidad de metadatos editoriales: detectar abstracts mal estructurados o con secciones ausentes (por ejemplo, ausencia de un segmento de resultado) como señal para revisión editorial.
- Evaluación comparativa de segmentadores: servir de referencia en experimentos que comparen un enfoque generativo de segmentación conjunta frente a pipelines clásicos de segmentación más clasificación supervisada.

## Benchmarks y rendimiento

Los únicos datos disponibles son la evaluación propia del autor sobre 400 abstracts de test del corpus CODA-19. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Métrica | Modelo base Qwen3.5-4B | Con adaptador CODA19 | Conjunto de evaluación |
|---|---|---|---|
| Clasificación de segmentos (acierto sobre segmentos previamente delimitados) | 76,14 % | 88,18 % | 400 abstracts de test |
| Segmentación + clasificación conjunta (fronteras y etiqueta correctas) | 22,7 % | 87,4 % | 400 abstracts de test |

Lectura de los datos: la mejora en clasificación pura es de 12,04 puntos porcentuales, mientras que en la tarea completa es de 64,7 puntos. El segundo valor es el relevante en producción, porque un uso real no dispone de segmentos previamente delimitados.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en safetensors ocupa aproximadamente 0,5 GB (tamaño del repositorio), que se suma a los pesos del modelo base. Estimación para el base de 4 000 millones de parámetros: unos 8-9 GB en bf16/fp16 y unos 2,5-3,5 GB en cuantización de 4 bits, más caché KV y overhead de activaciones; con contexto largo, presupuestar entre 10 y 14 GB en bf16. Estas cifras son estimaciones de ingeniería, no mediciones publicadas para este adaptador.
- GPU recomendadas: para bf16 sin cuantizar, una RTX 4090 (24 GB) o A100/H100 sobran; una RTX 4080 o 3090 (16-24 GB) también es suficiente. Con cuantización de 4 bits cabe en tarjetas de 8-12 GB.
- Cabe en GPU de consumo: sí. El tutorial de referencia del propio ecosistema Qwen3.5-4B documenta el ajuste LoRA del modelo base en una única RTX 3080 Ti de 12 GB, lo que fija un límite superior holgado para la inferencia del adaptador.
- Opciones de despliegue: transformers con peft (ruta oficial, la del ejemplo de carga de la model card); vLLM con soporte de adaptadores LoRA para servir múltiples adaptadores sobre una misma instancia del base; TGI con adaptadores PEFT; llama.cpp u Ollama solo tras fusionar el adaptador con el modelo base y convertir a GGUF, paso que no está documentado en la información disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de 4 000 millones en una GPU moderna de consumo suele entregar decenas de tokens por segundo en generación, pero la tarea aquí produce salidas relativamente largas (texto segmentado más etiquetas), por lo que el coste por abstract depende de la longitud del documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Descargas / tracción |
|---|---|---|---|---|---|
| CODA19-Qwen3.5-4B-LoRA (este) | Base ~4B + adaptador LoRA | No disponible | Segmentación y clasificación de abstracts (5 aspectos) | Apache 2.0 | 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B (base, sin ajuste) | ~4B | No disponible | Propósito general | Apache 2.0 | Modelo base de referencia del ecosistema |
| CadQuery-Qwen3.5-4B-LoRA (mismo autor) | Base ~4B + adaptador LoRA | No disponible | Generación de código CadQuery (CAD paramétrico) | No indicada en la información disponible | Activo, con endpoint en FriendliAI |
| y9760210/Qwen3-4B-lora_model | ~4B + adaptador LoRA | No disponible | No especificada en la información disponible | No disponible | Repositorio público de Hugging Face |

No se han identificado en la información disponible adaptadores comparables específicos para segmentación de abstracts sobre modelos de 4B; las alternativas clásicas de la literatura (modelos tipo SciBERT o BioBERT con cabeza de clasificación) no aparecen referenciadas y, en cualquier caso, requerirían un segmentador externo, lo que las sitúa en un régimen de evaluación distinto.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste se hizo sobre abstracts biomédicos de CORD-19, con fuerte presencia de literatura sobre COVID-19. El comportamiento sobre abstracts de otras disciplinas (física, ingeniería, ciencias sociales) o sobre texto científico en otros idiomas no está evaluado y es probable que degrade.
- Idioma: solo inglés declarado. El modelo no está ajustado para abstracts en castellano, aunque el base pudiera manejar el idioma; no hay datos que respalden su uso en español.
- Riesgo de alucinación estructural: al generar la segmentación de forma autoregresiva, el modelo puede omitir texto del abstract original, duplicarlo o inventar límites plausibles pero incorrectos. Cualquier uso en producción requiere verificación de que la concatenación de segmentos reconstruye el texto de entrada.
- Dependencia de validación programática: las etiquetas y las referencias al codebook se emiten como texto generado; es necesario parsear y validar el esquema de salida antes de confiar en los resultados.
- Sin validación independiente: cero descargas y cero likes, evaluación únicamente del autor, sobre un conjunto de test de 400 abstracts. No hay replicación externa ni comparación con líneas base publicadas.
- Documentación en alemán: la model card está redactada en alemán, lo que añade fricción para equipos hispanohablantes y para la integración en pipelines documentados en inglés.
- Licencias del corpus de origen: aunque los pesos del adaptador y el base son Apache 2.0, los abstracts provienen de CORD-19 y quedan sujetos a la licencia de cada artículo original. El uso comercial del modelo es libre; el uso del texto de entrada y de las salidas derivadas depende de la licencia de cada publicación.
- Empaquetado: al ser un adaptador, no es desplegable por sí solo. Requiere el modelo base, lo que duplica la superficie de dependencias (versiones de transformers, peft y del propio Qwen3.5-4B) y complica la reproducibilidad a largo plazo.
- Sin datos sobre contexto máximo ni sobre comportamiento con abstracts muy largos; un abstract que exceda la ventana del base se truncará silenciosamente si no se gestiona en el pipeline.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/mc9901708/CODA19-Qwen3.5-4B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio con datos, notebook y evaluación: https://github.com/mc990-ai/CODA19-Qwen3.5-4B
- Referencia del corpus: Huang et al., 2020, CODA-19 (sin URL en la información disponible; los abstracts proceden de CORD-19)
- Adaptador del mismo autor para generación de CAD: https://huggingface.co/mc9901708/CadQuery-Qwen3.5-4B-LoRA
- Endpoint de inferencia del adaptador CadQuery (FriendliAI): https://friendli.ai/models/mc9901708/CadQuery-Qwen3.5-4B-LoRA
- Tutorial de ajuste LoRA de Qwen3.5-4B en una GPU de 12 GB: https://aiml.training/docs/tutorials/lora-fine-tuning-qwen3.5-4b/
- Experimento de ajuste LoRA de Qwen3.5-4B en H100: https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- Adaptador LoRA alternativo sobre Qwen3-4B: https://huggingface.co/y9760210/Qwen3-4B-lora_model
