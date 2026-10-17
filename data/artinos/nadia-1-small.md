# artinos/Nadia-1-Small

## Resumen

Nadia-1 Small es un modelo de tipo encoder de 140.788.993 parámetros (≈140,8 M) desarrollado por Artinos, con autoría de Bernardo B. Perobeli, y orientado a decisiones estructuradas. Se construye por fine-tuning del encoder multilingüe jhu-clsp/mmBERT-small, tiene una longitud de contexto total de 2.048 tokens y emite tres tipos de decisión: choice, noul y score. No es un modelo generativo: su función es clasificar, seleccionar y puntuar opciones dentro de un espacio cerrado.

La relevancia del lanzamiento es fundamentalmente metodológica. La model card documenta el proceso completo de investigación, con unas 269 horas de trabajo, un gasto total declarado de 67,13 dólares y una estimación de participación humana del 10 % frente al 90 % de IA, además de publicar los artefactos de evaluación y enviar la suite al Decision Index mediante un pull request que sigue pendiente de revisión. Los pesos y el código de inferencia no están disponibles públicamente, y Artinos no ofrece servicio de inferencia.

Los resultados publicados son desiguales y el propio autor advierte de una generalización limitada al formato nuevo: destaca en clasificación documental (SIB documental, 76,15 %) y en selección de funciones por nombres (BFCL, 71,09 %), mientras que cae en MMLU-Pro (12,33 %) y When2Call MCQ (25,33 %). El modelo se posiciona, por tanto, como una pieza de investigación reproducible más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (fine-tuning de jhu-clsp/mmBERT-small) |
| Parametros totales | 140.788.993 (≈140,8 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible: no se han publicado pesos ni cuantizaciones |
| Idiomas soportados | Multilingue (sin desglose de idiomas en la informacion disponible) |
| Licencia | El codigo original se declara bajo Apache-2.0, con atribucion de la fundacion MIT; los datos conservan los terminos de cada fuente. La ficha de HuggingFace no declara licencia y los pesos no estan publicados |
| Formato de pesos | No disponible: pesos no publicados (tamano del repositorio declarado, 0,0 GB) |
| Tipo de salida | Decisiones estructuradas: choice, noul y score |
| Modelo base | jhu-clsp/mmBERT-small |
| Conjunto de datos principal | artinos/Nadia-1-data (84.050 ejemplos) |
| Autor e institucion | Bernardo B. Perobeli (Artinos) |
| Fecha de creacion en HuggingFace | 2026-10-17 |
| Descargas / likes | 0 / 0 |
| Disponibilidad de pesos | No publicados; no hay servicio de inferencia de Artinos |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer obtenido por fine-tuning del modelo jhu-clsp/mmBERT-small. No se especifican en la información disponible el número de capas, la dimensión oculta, el tipo de atención ni la composición exacta del tokenizador. El entrenamiento se describe como un fine-tuning con supervisión pública y sintética, continuación de cobertura, datos operacionales y replay probabilístico sobre el ancestro congelado. La etapa final combina tres objetivos: entropía cruzada (CE) sobre NLI, pérdida focal sobre When2Call y divergencia KL hacia el ancestro congelado, lo que busca preservar el comportamiento del modelo base mientras se especializa en las tareas de decisión.

La curación de datos combinó ejemplos públicos, datos sintéticos y revisión humana diagnóstica, y el conjunto principal resultante (artinos/Nadia-1-data) contiene 84.050 ejemplos con su procedencia documentada, aunque la colección no incluye todo el refinamiento posterior. La model card declara cinco consultas ToolRet y un enunciado MMLU-Pro coincidentes con texto de entrenamiento, además de documentación de herramientas compartida, por lo que el autor no afirma ausencia global de contaminación. La adaptación del trabajo freephdlabor (Li et al., arXiv:2510.15624) apoyó aproximadamente el 60 % del proceso según la estimación retrospectiva del autor.

## Capacidades

- Decisiones estructuradas de tres tipos: choice, noul y score.
- Selección de funciones o herramientas a partir de nombres, evaluada en BFCL con un 71,09 %.
- Detección del momento adecuado para invocar una herramienta (tarea When2Call), entrenada con pérdida focal.
- Inferencia de relación textual tipo NLI, mediante entropía cruzada sobre datos de ese tipo.
- Clasificación documental, con un 76,15 % en SIB documental.
- Clasificación multilingüe de consultas (MASSIVE adaptado, 31,49 %) y modelado de intención y slot (xSID macro, 58,63 %).
- Puntuación y comparación de respuestas (Fastino DEV, macro exact match del 42,45 %).
- Salida estructurada y estable por diseño de encoder, sin generación de texto libre.
- No se documenta soporte de tool calling generativo, agentes multi-paso, visión, audio ni modo de razonamiento explícito; la model card indica que no hay demostración de planificación fiable.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: el modelo clasifica la consulta del usuario en una de las opciones del menú (tipo choice) con una ventana de 2.048 tokens, adecuada para turnos de conversación cortos o medianos, aunque la sensibilidad al menú de opciones obliga a fijar y versionar cuidadosamente las etiquetas.
- Selección de herramienta en pipelines de function calling: con un 71,09 % en BFCL restringido a selección por nombres, puede actuar como router previo que elige qué función invocar antes de que un modelo generativo construya los argumentos.
- Detección de cuándo llamar a una herramienta: la tarea When2Call permite insertar un filtro que decida si la consulta requiere acceso a una herramienta externa o puede resolverse con conocimiento interno; conviene validar el umbral por el 25,33 % obtenido en When2Call MCQ.
- Clasificación y etiquetado documental: con un 76,15 % en SIB documental, resulta apto para triaje de expedientes, asignación de categorías administrativas o enrutado de documentos a colas de revisión, siempre con supervisión humana dado el tamaño del conjunto de evaluación.
- Verificación de coherencia y detección de contradicciones: el entrenamiento con entropía cruzada sobre NLI permite usarlo como componente de entailment en pipelines de verificación de hechos o de consistencia entre borradores y fuentes.
- Clasificación multilingüe de consultas: al derivar de mmBERT, puede etiquetar consultas en varios idiomas para encaminarlas al equipo o al modelo adecuado; el 31,49 % en MASSIVE adaptado limita su uso a entornos con revisión.
- Extracción de intención y slot en diálogo: el 58,63 % macro en xSID lo hace utilizable como extractor auxiliar en sistemas de diálogo con esquemas cerrados y bien definidos.
- Puntuación y filtrado de candidatos: la salida de tipo score permite ordenar respuestas o candidatos en tareas de selección, con la advertencia del autor de que las probabilidades no tienen garantía de calibración.
- Investigación sobre eficiencia: con 140,8 M de parámetros y un coste de investigación declarado de 67,13 dólares, sirve como referencia metodológica para estudiar fine-tuning de encoders con presupuestos mínimos y datasets mixtos público-sintéticos.

## Benchmarks y rendimiento

| Tarea | Resultado | Notas |
|---|---:|---|
| SIB documental | 76,15 % | Clasificacion documental |
| BFCL (seleccion por nombres) | 71,09 % | Solo seleccion por nombres, no generacion de llamadas |
| xSID (macro) | 58,63 % | Intencion y slot |
| Fastino DEV (macro exact match) | 42,45 % | En 2.048 tokens: cero victorias en 32 semillas nuevas |
| Typed | 40,40 % | |
| BBH | 32,78 % | Tarea adicional del Decision Index |
| MASSIVE adaptado | 31,49 % | Clasificacion multilingue |
| When2Call MCQ | 25,33 % | Version integral |
| MMLU-Pro | 12,33 % | Tarea adicional del Decision Index |
| Suite publica 0.3 (corregida por azar y cobertura) | 3,61 / 100 | Agregado bruto 25,67 / 100; 140.178 peticiones, 130.316 respuestas, 9.862 rechazos de contexto |

El autor no reivindica ninguna posición oficial en el leaderboard del Decision Index: el pull request (PR #205) sigue pendiente de revisión y la entrada depende de validaciones privadas y de la medición oficial de latencia. No se publican datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo derivado del numero de parametros, no publicado por el autor): aproximadamente 563 MB en FP32, 282 MB en FP16/BF16, 141 MB en INT8 y 70 MB en INT4. Con 2.048 tokens de contexto, la memoria de activaciones y de cache es reducida.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria compartida. Tambien es viable la inferencia en CPU para cargas de baja concurrencia.
- GPU de centro de datos (A100, H100) solo tendria sentido para servir un volumen muy alto de peticiones en paralelo, no por requisitos de memoria.
- Opciones de despliegue: no disponibles en la practica, porque los pesos no estan publicados. Si se liberasen, un encoder de este tamano seria desplegable con ONNX Runtime, TorchScript, Transformers, y con vLLM o TGI en modo encoder; llama.cpp y Ollama requeririan conversion a GGUF, hoy inexistente.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia, y el autor senala que la medicion oficial de latencia por parte de los mantenedores del Decision Index aun no se ha realizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Nadia-1 Small | 140,8 M | 2.048 tokens | Codigo declarado Apache-2.0 (atribucion MIT); datos con terminos por fuente; HF sin licencia declarada | Pesos no publicados | Ver tabla de benchmarks |
| jhu-clsp/mmBERT-small (base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace | No disponible en la informacion proporcionada |
| Nadia-1 Base | 308 M | No disponible | No disponible | No finalizado segun el autor; menos ciclos de entrenamiento y refinamiento | Solo comparacion historica, no equivalente |
| GLiNER 2.5 y Ettin-1B | No disponible | No disponible | No disponible | Exploracion inicial abandonada | No disponible |

No se dispone de datos comparativos de rendimiento entre Nadia-1 Small y alternativas de la misma categoria dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Generalizacion desigual entre tareas: metricas entre el 12,33 % de MMLU-Pro y el 76,15 % de SIB documental, con una generalizacion limitada al formato nuevo segun el propio autor.
- Sensibilidad al menu de opciones: el rendimiento depende de como se formulen y ordenen las etiquetas candidatas, lo que exige congelar el esquema y reevaluar ante cualquier cambio.
- Probabilidades sin garantia de calibracion: la salida de tipo score no debe usarse directamente como probabilidad en umbrales automaticos sin calibrado previo.
- Limite de contexto estricto de 2.048 tokens; en Fastino DEV la configuracion a 2.048 tokens no logro ninguna victoria en 32 semillas nuevas.
- No hay demostracion de planificacion fiable, por lo que no es adecuado como planificador de agentes multi-paso.
- Riesgo de contaminacion no descartado: se detectaron cinco consultas ToolRet y un enunciado MMLU-Pro coincidentes con texto de entrenamiento, ademas de documentacion de herramientas compartida.
- Pesos y codigo de inferencia no publicados y sin servicio de inferencia de Artinos: el modelo no es desplegable hoy, lo que invalida cualquier uso en produccion a corto plazo.
- Licencia: el codigo original se declara Apache-2.0 con atribucion de la fundacion MIT, pero los datos mantienen los terminos de cada fuente y la ficha de HuggingFace no declara licencia, por lo que el uso comercial no esta claramente cubierto.
- Nadia-1 Base (308 M) no esta finalizado y sus cifras corresponden a una comparacion historica con distinta dedicacion, no a una version equivalente.
- La suite publica corregida (3,61/100) es muy baja en terminos absolutos y no constituye una posicion oficial en ningun leaderboard.
- No se han publicado mediciones de latencia ni de throughput, datos imprescindibles para cualquier evaluacion de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artinos/Nadia-1-Small
- Dataset principal: https://huggingface.co/datasets/artinos/Nadia-1-data
- Artefactos de evaluacion del Decision Index: https://huggingface.co/datasets/artinos/Nadia-1-Decision-Index
- Pull request de la suite publica: https://github.com/apolinario/decision-index/pull/205
- Paper de referencia freephdlabor (Li et al.): https://arxiv.org/abs/2510.15624
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small

Nota: la busqueda web asociada no devolvio resultados relevantes para este modelo; los unicos dominios recuperados (aternos.org y artinos.gr) no guardan relacion con el proyecto Nadia-1 ni con la institucion Artinos.
