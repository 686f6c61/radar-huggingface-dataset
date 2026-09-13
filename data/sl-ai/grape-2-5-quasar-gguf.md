# SL-AI/GRaPE-2.5-Quasar-GGUF

## Resumen

GRaPE 2.5 Quasar es un modelo multimodal de la familia GRaPE, desarrollado por SL-AI, que acepta imagen, vídeo y texto como entrada y produce texto como salida. Se presenta como el modelo insignia de la tercera generación de la familia y como sucesor directo de GRaPE 2 Pro, con 27.320.697.856 parámetros (27,3 B) y construido sobre el modelo base Qwen/Qwen3.8-27B. La ficha de HuggingFace corresponde a la distribución en GGUF, con licencia apache-2.0 y soporte declarado para diez idiomas: inglés, chino, francés, alemán, español, japonés, coreano, portugués, ruso y árabe.

Su rasgo diferencial es el control explícito de la profundidad de razonamiento mediante la etiqueta `<thinking_mode=xxx>`, con cinco niveles que van de `minimal` (0-128 tokens) a `xtra-hi` (más de 8.192 tokens). El modelo incorpora además resúmenes de pensamiento, un mecanismo de generación de ideas con estructura de lista de tareas previa al razonamiento y conservación de bloques de pensamiento previos en el contexto, orientado a tareas agénticas y de código.

La relevancia de la ficha es doble: por un lado, es uno de los pocos modelos multimodales de ~27 B con cuantizaciones GGUF publicadas; por otro, en el momento de la consulta el repositorio es muy reciente, acumula 0 descargas y el propio autor indica en la model card que "los pesos GGUF se están subiendo", por lo que la distribución puede estar incompleta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; el autor solo indica que deriva de Qwen/Qwen3.8-27B |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no publicados) y safetensors |
| Idiomas soportados | en, zh, fr, de, es, ja, ko, pt, ru, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Modalidades de entrada | imagen, vídeo y texto (según la model card); la pipeline declarada es image-text-to-text |
| Modalidad de salida | texto |
| Modelo base | Qwen/Qwen3.8-27B |
| Librería declarada | transformers |
| Tamaño del repositorio | 134,7 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna: no se especifica si se trata de un transformer denso, de una mezcla de expertos o de un diseño híbrido, ni se indican número de capas, dimensión oculta, mecanismo de atención ni estrategia de procesamiento visual. Lo único confirmado es que el modelo parte de Qwen/Qwen3.8-27B y que mantiene entrada multimodal (imagen y texto de forma explícita en los tags, y vídeo según el cuerpo de la model card), con salida exclusivamente textual.

En cuanto al entrenamiento, el autor indica que el modelo fue post-entrenado sobre un conjunto de datos propietario y curado, con foco en calidad sobre cantidad, y que cubre tres áreas: tareas creativas, código agéntico y STEAM. No se publican el número de tokens de preentrenamiento ni de post-entrenamiento, la composición del dataset, ni si se emplearon técnicas concretas de alineación como RLHF o DPO. Las innovaciones que sí se documentan son de comportamiento: modos de pensamiento seleccionables mediante etiqueta al final del prompt, resúmenes de pensamiento por secciones encabezadas con `##`, planificación previa del bloque de razonamiento en formato de lista de tareas, generación de entre cuatro y ocho ideas con evaluación comparativa, pensamiento en idiomas distintos del inglés y preservación de bloques de pensamiento anteriores dentro del contexto. El autor afirma además que el modelo reduce muletillas típicas de LLM, como la construcción "no es solo X, es Y", y que prácticamente ha eliminado el uso de guiones largos.

## Capacidades

- Generación de texto conversacional, con estilos controlables y orientación a prosa menos formulaica que la de modelos equivalentes.
- Razonamiento con profundidad ajustable mediante `<thinking_mode=minimal|low|medium|high|xtra-hi>`, colocado al final del prompt y no en el mensaje de sistema.
- Resúmenes de pensamiento: cada sección del bloque de razonamiento se encabeza con `##` y una línea de resumen, seguida de una descripción de alto nivel. No se generan en los modos `minimal` ni `low`.
- Planificación estructurada en forma de lista de tareas antes de razonar, con seguimiento del avance dentro del propio bloque de pensamiento.
- Generación de ideas y comparación de enfoques alternativos antes de elegir una solución.
- Codificación agéntica: soporte declarado para tareas de varios pasos, con preservación de bloques de pensamiento previos en el contexto.
- Capacidades STEAM: matemáticas, ciencia, ingeniería y tecnología, según el corpus de post-entrenamiento declarado.
- Entrada multimodal: imagen, vídeo y texto; salida de texto.
- Escritura creativa y roleplay, ambos presentes en los tags del modelo.
- Multilingüismo en diez idiomas, con razonamiento en el idioma de la consulta o forzado desde el prompt de sistema.
- Uso agéntico con ajuste dinámico del nivel de pensamiento: el autor advierte que el modelo puede reducir el nivel solicitado (por ejemplo, de `xtra-hi` a `medium`) durante fases de aplicación de correcciones, para no consumir decenas de miles de tokens en cada turno.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).

## Casos de uso

- Atención al cliente multilingüe: el modelo puede mantener conversaciones multi-turno en diez idiomas y responder en el idioma del usuario sin obligarle a escribir en inglés, con razonamiento en su propio idioma mediante la instrucción "piensa en <idioma>, responde en inglés" si se necesita homogeneizar las respuestas internas.
- Asistentes de código en producción: con modo `high` o `xtra-hi` para tareas de varios pasos, y preservación de bloques de pensamiento previos, encaja en flujos de refactorización, corrección de errores y revisión de parches dentro de pipelines de integración continua.
- Análisis de documentación técnica con imágenes: al aceptar imagen y texto, permite interpretar diagramas, capturas de pantalla de errores o esquemas junto al texto que los acompaña, por ejemplo en soporte de ingeniería o validación de documentación.
- Generación de material educativo STEAM: explicaciones de matemáticas y ciencia con razonamiento explícito y trazable, útil cuando se requiere auditar el proceso seguido y no solo el resultado.
- Investigación y exploración de proyectos: el propio nombre del modelo hace referencia a la exploración de proyectos; el modo de planificación en lista de tareas permite descomponer un objetivo amplio en pasos antes de decidir un enfoque.
- Escritura creativa y narrativa: el post-entrenamiento declarado incluye tareas creativas y el autor afirma haber trabajado la naturalidad de la prosa, lo que resulta adecuado para redacción de ficción, guiones o copys que eviten construcciones repetitivas.
- Agentes autónomos con control de coste: el ajuste dinámico del nivel de pensamiento permite limitar el gasto de tokens en tareas repetitivas y reservar el razonamiento extendido para los puntos de decisión.
- Despliegue local en estaciones de trabajo: al publicarse en GGUF, puede ejecutarse en equipos con GPU de 24 GB mediante cuantizaciones agresivas, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se han encontrado resultados de terceros en la búsqueda web realizada. Las afirmaciones del autor sobre mejoras respecto a GRaPE 2 Pro y sobre calidad de prosa son cualitativas y no vienen acompañadas de métricas.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del recuento de parámetros (27,3 B) y no proceden de la documentación del autor, que no publica requisitos de hardware:

- Pesos en precisión completa (FP16/BF16): aproximadamente 54,6 GB solo para los pesos, más caché KV y el codificador visual.
- Cuantización Q8: alrededor de 29 GB de pesos.
- Cuantización Q6: alrededor de 22 GB.
- Cuantización Q5: alrededor de 18-19 GB.
- Cuantización Q4 (por ejemplo Q4_K_M): alrededor de 16-17 GB.
- GPU de centro de datos: A100 40 GB y 80 GB, H100 80 GB, o GPUs de 48 GB como la L40S o la A6000, para Q8 y FP16.
- GPU de consumo: cabe en una RTX 4090, RTX 3090 o RTX 5090 de 24 GB usando Q4 o Q5; Q6 y Q8 requieren dos GPU de 24 GB o una GPU de 48 GB. Con 16 GB (RTX 4080, 4060 Ti 16 GB) es necesario bajar a Q4 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para GGUF; vLLM, TGI y SGLang para safetensors; transformers como librería de referencia declarada.
- Advertencia de despliegue: la entrada de imagen o vídeo depende de que el runtime cargue el proyector multimodal correspondiente (fichero mmproj en llama.cpp, soporte multimodal en vLLM); no todos los backends lo soportan.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRaPE 2.5 Quasar | 27,3 B | no disponible | imagen, vídeo y texto → texto | apache-2.0 | GGUF y safetensors |
| GRaPE 2.5 Helios | 10 B | no disponible | imagen y texto → texto | no disponible | no disponible |
| Qwen/Qwen3.8-27B (modelo base) | 27 B (según su denominación) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de terceros de ~27 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos de la misma categoría (multimodales de aproximadamente 27 B con razonamiento controlable), ni de resultados comparativos publicados por el autor. No se han incluido cifras de rendimiento porque no existen en la información disponible. Helios figura únicamente como referencia de la misma familia, no como alternativa independiente.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluación independiente, por lo que no es posible cuantificar su rendimiento frente a otros modelos.
- La model card indica que "los pesos GGUF se están subiendo" en el momento de la publicación; el repositorio puede estar incompleto o cambiar, y acumula 0 descargas y 1 like, lo que implica ausencia de validación por parte de la comunidad.
- El repositorio ocupa 134,7 GB, coherente con múltiples cuantizaciones, pero no se detallan los niveles GGUF disponibles ni su tamaño individual.
- Inconsistencia documental: los tags y la pipeline declarada son image-text-to-text, mientras que el cuerpo de la model card afirma entrada de vídeo. Conviene verificar el soporte real de vídeo antes de diseñar un producto sobre esa capacidad.
- Nombre inconsistente en la propia tabla de la familia, donde aparece "GRaPE 2.5 Qusar" en lugar de Quasar.
- La etiqueta de modo de pensamiento debe colocarse al final del prompt y no en el mensaje de sistema; un uso incorrecto puede degradar el comportamiento.
- El autor advierte que el modelo puede bajar el nivel de pensamiento solicitado durante tareas agénticas, lo que introduce imprevisibilidad en el consumo de tokens y en la latencia.
- Los resúmenes de pensamiento no existen en los modos `minimal` y `low`, de modo que la trazabilidad del razonamiento se pierde en esos niveles.
- No se documentan sesgos conocidos, composición del dataset, proceso de filtrado ni evaluación de seguridad. Al ser un modelo post-entrenado sobre datos propietarios no publicados, no es posible auditar sus sesgos.
- Riesgo de alucinación no cuantificado. En tareas STEAM y de código, el modo de razonamiento extendido no elimina por sí solo la posibilidad de errores factuales.
- El rendimiento por idioma no está documentado: la lista de diez idiomas no implica calidad homogénea entre ellos.
- La longitud de contexto no está declarada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- La licencia declarada para este derivado es apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de explotarlo en producción.
- Al tratarse de pesos cuantizados en GGUF, la calidad puede degradarse respecto a safetensors, especialmente en los niveles de cuantización más agresivos.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/SL-AI/GRaPE-2.5-Quasar-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio o código adicional: no disponible
- Paper o informe técnico: no disponible
- Demo o espacio interactivo: no disponible
- Blog del autor: no disponible
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo; los resultados obtenidos correspondían a términos no relacionados.
