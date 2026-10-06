# cortex-agent-llc/kodiak-v0.3-1b

## Resumen

Kodiak-v0.3-1B es un modelo de decisión de tipo encoder desarrollado por Cortex Agent LLC, construido sobre jhu-clsp/ettin-encoder-1b (Johns Hopkins, licencia MIT) y con 1.044 millones de parámetros. No es un modelo generativo: recibe un estado de entrada (texto plano, una lista de textos o un objeto JSON) junto con una o varias preguntas tipadas, y devuelve en un único forward pass una respuesta de tipo elección, puntuación o abstención explícita ("can't tell"), acompañada de una confianza calibrada.

El problema que ataca es la automatización de trabajo repetitivo de "lee esto y decide": enrutado de peticiones, triaje, aplicación de políticas escritas, guardarraíles y comprobaciones de calidad. La propuesta central es que el modelo no solo acierte, sino que sepa cuándo no puede decidir con fiabilidad, de modo que los casos dudosos se deriven a una persona o a un LLM mayor con umbral de confianza. La versión v0.3 añade siete tipos nuevos de decisión respecto a v0.2 (juicio por pares, sarcasmo, violación de política, alucinación en respuestas largas, postura, elegibilidad de reembolso y seguridad de un paso de agente) y mejora la calibración y la precisión del "can't tell" sobre datos reales que nunca vio en entrenamiento.

Pesa unos 4,2 GB en el repositorio (formato safetensors), está licenciado bajo Apache-2.0 y solo se distribuye en inglés. Su latencia declarada es de aproximadamente 38 ms por petición en GPU, muy por debajo del orden de magnitud de un modelo generativo como Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT, modelo base jhu-clsp/ettin-encoder-1b) |
| Parametros totales | 1.044.119.556 (1,04 B) |
| Parametros activos | No procede (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/ettin-encoder-1b (MIT) |
| Libreria de inferencia | kodiak (kodiak-s1[infer]) |
| Tamano del repositorio | 4,2 GB |
| Pipeline declarado | no disponible (model card indica inference: false) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-06 |

## Arquitectura y entrenamiento

El modelo es un encoder de 1,04 mil millones de parámetros derivado de Ettin-encoder-1B, un encoder de la familia ModernBERT desarrollado en Johns Hopkins bajo licencia MIT. La innovación del sistema no está en la arquitectura del backbone, sino en la cabeza de decisión: el modelo consume un estado (texto, lista de textos o JSON) y una lista de preguntas tipadas con etiquetas, y produce por cada pregunta una elección con una puntuación de confianza, o bien una abstención. Todo el cálculo se resuelve en un único forward pass, sin decodificación autoregresiva, lo que explica su latencia de aproximadamente 38 ms en GPU.

En cuanto a los datos, el autor indica que cada uno de los siete tipos nuevos de decisión se enseñó con datos sintéticos verificados mediante un proceso de doble control: un escritor de pesos abiertos (gpt-oss-120b) genera cada ejemplo orientado a una respuesta fija y un verificador ciego (DeepSeek-V3.2) debe dar su conformidad. La model card no detalla el volumen total de tokens de entrenamiento ni la composición exacta del dataset, y tampoco menciona uso de RLHF o DPO. El checkpoint publicado corresponde a la ejecución con semilla 1 de tres ejecuciones de entrenamiento, seleccionada por pérdida de validación y, según el autor, nunca por el conjunto de evaluación. Existe una variante adicional, kodiak-v0.3-1b-accuracy, que promedia tres modelos v0.3 y consume aproximadamente el triple de cómputo a cambio de mejor calibración.

## Capacidades

- Decisión por elección entre etiquetas: responde preguntas con un conjunto cerrado de opciones y devuelve la opción más probable junto con su confianza.
- Puntuación y calibración: asigna confianzas calibradas (error de calibración de 0,076 en tareas nunca vistas, y 0,074 en este checkpoint concreto según la model card).
- Abstención fiable: emite "can't tell" cuando no puede decidir con garantías, con una precisión declarada de 0,93 de media en v0.3 (0,961 en este checkpoint), lo que permite derivar casos dudosos a un humano o a un LLM.
- Juicio por pares (pairwise judge): compara dos respuestas y decide cuál es mejor.
- Detección de sarcasmo: determina si el autor de un mensaje está siendo sarcástico.
- Detección de violación de política: dada una política escrita regla a regla, identifica qué regla incumple un mensaje (o si no incumple ninguna).
- Detección de alucinación en respuestas largas: comprueba si todo el contenido de una respuesta está respaldado por las fuentes proporcionadas.
- Análisis de postura (stance): determina la postura del autor de un texto respecto a un objetivo concreto.
- Elegibilidad de reembolso: decide si un cliente cumple los criterios de una política de devoluciones.
- Seguridad de pasos de agente: evalúa si el siguiente paso de un agente (por ejemplo, un comando de shell) es seguro de ejecutar sin consultar al usuario.
- Clasificación genérica y guardarraíles: admite preguntas sobre estados en formato JSON o listas de textos.
- No soporta generación de texto libre, tool calling generativo ni razonamiento multi-paso en el sentido de un LLM; su interfaz es de decisión tipada.

## Casos de uso

- Moderación y cumplimiento de políticas de marketplace: se le pasa la política numerada y el mensaje del usuario, y devuelve qué regla se incumple (o "no rule"), lo que permite automatizar el triaje de anuncios antes de la revisión humana.
- Guardarraíl para agentes autónomos: antes de ejecutar un paso potencialmente destructivo (por ejemplo, `rm -rf /var/log`), el modelo decide entre "es seguro", "preguntar al usuario" o "no debe ejecutarse", actuando como capa de seguridad previa a la ejecución de herramientas.
- Validación de sistemas RAG: comprueba si una respuesta larga generada por un LLM está íntegramente respaldada por las fuentes recuperadas, con una habilidad corregida por azar de +0,41 en RAGBench, lo que permite marcar respuestas con posible alucinación antes de mostrarlas.
- Evaluación automática de respuestas de asistentes: mediante el modo de juicio por pares, ordena dos respuestas candidatas según preferencia, con una habilidad de +0,29 en MT-Bench, útil para comparar versiones de un prompt o de un modelo en pipelines de evaluación continua.
- Triaje de tickets de soporte y devoluciones: decide si un cliente es elegible para reembolso según la política vigente, con abstención cuando el caso es ambiguo, reduciendo el volumen de tickets que llegan a un agente humano.
- Análisis de opinión y monitorización de marca: extrae la postura de publicaciones o tuits hacia un objetivo concreto (producto, persona, organización) con +0,37 de habilidad en SemEval-2016, apto para paneles de reputación con umbral de confianza.
- Enrutado de peticiones en producción: ante una consulta entrante, decide a qué cola, equipo o política corresponde, y deriva al LLM mayor solo los casos en los que su confianza no alcanza el umbral definido.
- Detección de sarcasmo y matices en reseñas: clasifica reseñas y comentarios para separar críticas genuinas de comentarios irónicos, evitando que un análisis de sentimiento básico malinterprete el texto.

## Benchmarks y rendimiento

Datos sobre datos reales que el modelo nunca vio durante el entrenamiento (habilidad corregida por azar; 0 equivale a adivinar al azar; las cifras de Kodiak son medias de tres ejecuciones):

| Prueba sobre datos reales | Kodiak-v0.2-1B | Kodiak-v0.3-1B | v0.3 accuracy mode |
|---|---|---|---|
| RAGBench: ¿está una respuesta larga respaldada por sus fuentes? (CC BY 4.0) | +0,27 | +0,41 | +0,44 |
| MT-Bench: ¿qué respuesta prefirieron los expertos humanos? (CC BY 4.0) | +0,06 | +0,29 | +0,33 |
| SemEval-2016: postura de un tuit hacia un objetivo (MIT) | +0,30 | +0,37 | +0,38 |
| Media | 0,21 | 0,36 | 0,38 |

Comparativa sobre el conjunto de evaluación congelado de v0.2 (preguntas de elección):

| Metrica | Kodiak-v0.2-1B | Kodiak-v0.3-1B | v0.3 accuracy mode | Qwen3-8B (LLM) |
|---|---|---|---|---|
| Tareas nunca vistas, precision forzada | 0,689 ± 0,008 | 0,687 ± 0,010 | 0,696 | 0,688 |
| Tareas familiares | 0,877 | 0,879 | 0,887 | 0,710 |
| Ordena sus propios errores al final (nunca vistas) | 55,6 % | 54,5 % | 56,1 % | 14,7 % |
| Error de calibracion (nunca vistas; menor es mejor) | 0,085 | 0,076 | 0,065 | 0,293 |
| Precision del "can't tell" | 0,88 | 0,93 | 0,925 | – |
| Latencia (GPU, una peticion) | ~38 ms | ~38 ms | ~3x | ~1.500 ms |

Notas aportadas por el autor: tras una recalibración isotónica ajustada sobre las otras tareas nunca vistas, el error de calibración de Qwen3-8B baja de 0,293 a 0,178, mientras que el mismo tratamiento deja a Kodiak-v0.3-1B en 0,050-0,072. Las cifras con ± corresponden a la media de tres ejecuciones de entrenamiento; este checkpoint concreto (semilla 1) obtiene 0,675 en precisión forzada nunca vista, 0,873 en tareas familiares, 0,074 de error de calibración nunca visto y 0,961 de precisión en "can't tell". El autor señala explícitamente que v0.3 no mejora la precisión en tareas nunca vistas respecto a v0.2; sus mejoras se concentran en los nuevos tipos de decisión, las comprobaciones con datos reales y una abstención más fiable.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros; la model card no publica cifras oficiales): en fp32 unos 4,2 GB, en fp16/bf16 unos 2,1 GB, en int8 unos 1,0 GB y en 4 bits unos 0,5 GB.
- El repositorio ocupa 4,2 GB, coherente con pesos en precisión completa.
- La model card no declara tipos de cuantización soportados oficialmente, por lo que los valores anteriores son estimaciones de referencia.
- Al tratarse de un modelo de 1,04 B de parámetros, cabe con holgura en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090, RTX 5090, así como en portátiles con GPU de 6-8 GB en fp16.
- La model card no menciona GPU de centro de datos concretas; por tamano, A100, H100, L40S o A10 son suficientes sin necesidad de paralelismo.
- Despliegue: el modelo se carga a través de la libreria propia `kodiak` (`pip install "kodiak-s1[infer] @ git+https://github.com/grizzlypeaksoftware/kodiak"`). No hay informacion en la model card sobre compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: aproximadamente 38 ms por peticion en GPU; el modo accuracy de la variante kodiak-v0.3-1b-accuracy cuesta aproximadamente 3 veces mas computo.
- La model card marca `inference: false`, lo que indica que no se expone un pipeline de inferencia estandar en el Hub.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Error de calibracion (nunca vistas) | Precision "can't tell" | Latencia GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kodiak-v0.3-1B | 1,04 B | Encoder de decision | 0,076 | 0,93 | ~38 ms | apache-2.0 | HuggingFace (cortex-agent-llc/kodiak-v0.3-1b) |
| Kodiak-v0.2-1B | ~1 B | Encoder de decision | 0,085 | 0,88 | ~38 ms | apache-2.0 | Disponible como version anterior |
| Kodiak-v0.3-1B accuracy mode | Promedio de 3 modelos v0.3 | Encoder de decision (ensemble) | 0,065 | 0,925 | ~3x | apache-2.0 | HuggingFace (cortex-agent-llc/kodiak-v0.3-1b-accuracy) |
| Qwen3-8B | 8 B | LLM generativo | 0,293 (0,178 recalibrado) | No aplica (sin abstitucion tipada) | ~1.500 ms | no disponible en la informacion proporcionada | Referencia usada como linea base por el autor |

No se dispone de otros modelos comparables de la misma categoria (encoders de decision con abstencion calibrada) en la informacion proporcionada.

## Limitaciones y advertencias

- La redaccion de las opciones sigue afectando al resultado: ante la misma pregunta con opciones reformuladas, el modelo da la misma respuesta aproximadamente dos tercios de las veces en tareas nunca vistas. Se recomienda mantener opciones cortas y distintas, y probar varias formulaciones con datos propios.
- Existe una prueba especifica de 100 casos con trampas de redaccion (un mensaje que repite las palabras de una opcion incorrecta dentro de una condicion o negacion); v0.3 acierta el 90 % (v0.2, el 87 %).
- Las comprobaciones sobre datos reales estan mejoradas pero no resueltas: deteccion de alucinacion en respuestas largas, juicio por pares y postura estan claramente por encima del azar, pero lejos de la perfeccion. El propio autor recomienda usar "can't tell" y un umbral de confianza, y revisar el resto.
- El ordenamiento por confianza (ranking) es ligeramente inferior en v0.3 respecto a v0.2 para el modelo individual: 54,5 % frente a 55,6 % en tareas nunca vistas. El ranking no cambia con recalibracion, por lo que es el dato relevante si se va a usar un umbral.
- v0.3 no mejora la precision en tareas nunca vistas respecto a v0.2 (0,687 frente a 0,689 en la media de tres ejecuciones).
- El modelo solo soporta ingles; no hay soporte multilingue declarado.
- Riesgo de alucinacion: al ser un clasificador y no un generador, no inventa texto libre, pero si puede asignar alta confianza a una etiqueta incorrecta en tareas nuevas o con opciones ambiguas.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (Ettin-encoder-1B, MIT) y las obligaciones de atribucion correspondientes.
- Este checkpoint concreto fue seleccionado por perdida de validacion y no por el conjunto de evaluacion, segun el autor; sus cifras individuales pueden diferir ligeramente de la media de tres ejecuciones.
- La model card no documenta sesgos demograficos, linguisticos ni de dominio, ni tampoco el volumen y la composicion exacta de los datos de entrenamiento, lo que dificulta auditar su comportamiento fuera de las tareas evaluadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cortex-agent-llc/kodiak-v0.3-1b
- Variante en modo accuracy: https://huggingface.co/cortex-agent-llc/kodiak-v0.3-1b-accuracy
- Modelo base Ettin-encoder-1B: https://huggingface.co/jhu-clsp/ettin-encoder-1b
- Repositorio de codigo, documentacion y registro publico de construccion: https://github.com/grizzlypeaksoftware/kodiak
- Los resultados de busqueda web disponibles no aportan enlaces relevantes al modelo: corresponden a otros significados del termino "cortex" (corteza cerebral, Razer Cortex y medios de divulgacion).
