# ATinyGreenCell/scadcoder-qwen3.5-9b-v11

## Resumen

scadcoder-qwen3.5-9b-v11 es un ajuste fino mediante LoRA de Qwen3.5-9B (9.653.104.368 parámetros) especializado en la generación de piezas paramétricas en OpenSCAD para el proyecto Tiiny Pocket Lab, un entorno de laboratorio biológico de sobremesa. Lo desarrolla el usuario ATinyGreenCell y se publica bajo licencia Apache 2.0. El modelo no aspira a ser un asistente generalista: su dominio es la traducción de descripciones en lenguaje natural a ficheros `.scad` funcionales y verificables dentro de un conjunto cerrado de familias de piezas.

La relevancia del modelo es metodológica más que de rendimiento bruto. La model card documenta con detalle el proceso de construcción del dataset, incluyendo ejemplos verificados, reparaciones multiturno de informes y, de forma explícita, intentos fallidos del propio modelo con su informe de benchmark y el fichero de referencia asociado. Es un ejemplo poco habitual de ficha que hace trazable la curación de datos de un fine-tune pequeño y de nicho.

Al tratarse de un modelo derivado de Qwen3.5-9B, conserva el codificador visual del modelo base (`Qwen3_5ForConditionalGeneration`, pipeline `image-text-to-text`), mientras que las capas de lenguaje se han fusionado tras el LoRA y se publican en safetensors bf16. La model card indica explícitamente que debe ejecutarse con el modo de razonamiento (thinking) desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (`Qwen3_5ForConditionalGeneration`), con codificador visual y capas de lenguaje sometidas a LoRA (rango 32) y posteriormente fusionadas |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (la informacion disponible no indica una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en bf16 (safetensors). No se han publicado GGUF ni cuantizaciones de otro tipo |
| Idiomas soportados | No disponible (la model card no documenta idiomas; los datos de entrenamiento citados son descripciones en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y se entrena con LoRA de rango 32 durante 3 épocas con un batch efectivo de 8. Tras el entrenamiento, las capas de lenguaje se fusionan y se exportan en bf16 a safetensors, mientras que el codificador visual del modelo base se preserva sin cambios según la model card. El pipeline declarado es `image-text-to-text`, aunque la ficha del autor no documenta el uso de pares imagen-texto durante el ajuste fino: el entrenamiento descrito es exclusivamente sobre descripciones textuales y ficheros OpenSCAD de referencia.

El dataset de la versión v11 (semilla 0) consta de 14.164 filas construidas en varias capas. La base son las 12.374 filas de v9: ejemplos verificados, 1.500 reparaciones multiturno de informes y 869 intentos fallidos del propio v5, cada uno acompañado del informe del benchmark y del fichero de referencia. A ello se añade el lote C para diez de las catorce familias de piezas: 474 descripciones escritas por Claude Opus, cada una con su fichero verificado, y 421 intentos fallidos del propio v9 (semilla 1) sobre esas descripciones, igualmente con informe y referencia. Ambos conjuntos se incluyen dos veces en el dataset final, y los turnos fallidos se enmascaran de la función de pérdida. Cuatro familias del lote C (frustum riser, hinge leaf, spoked wheel y star wheel) se reservan para evaluación.

La innovación técnica destacable no está en la arquitectura, sino en la estrategia de datos: incorporar los fallos del propio modelo como ejemplos negativos enmascarados, junto con el diagnóstico del benchmark, para que el ajuste aprenda a corregir sus propios errores de geometría paramétrica. El autor remite a la sección §6.4 del repositorio `prompt-to-bench` para los detalles completos.

## Capacidades

- Generación de código OpenSCAD paramétrico para piezas de laboratorio biológico, dentro de las familias de componentes cubiertas por el dataset de entrenamiento.
- Producción de ficheros `.scad` completos y renderizables, no solo fragmentos, orientados a un benchmark de verificación automática.
- Reparación multiturno: el entrenamiento incluye 1.500 ejemplos de corrección de informes, por lo que el modelo está expuesto a ciclos de "generar, evaluar, corregir".
- Entrada multimodal heredada del modelo base: el codificador visual se conserva y el pipeline declarado es `image-text-to-text`, aunque no se documenta entrenamiento específico con imágenes.
- Capacidad de seguir descripciones en lenguaje natural en inglés, idioma de las descripciones del dataset.
- No se documenta soporte de tool calling, function calling, uso de agentes ni modos de razonamiento explícito; de hecho, la model card indica ejecutar con thinking desactivado.

## Casos de uso

- Generación de piezas paramétricas para Tiiny Pocket Lab: dado un enunciado descriptivo de una pieza (por ejemplo, un soporte o un depósito), el modelo emite el `.scad` correspondiente que se renderiza y se compara contra una referencia. Es el caso de uso para el que fue entrenado.
- Reparación automática de geometría fallida: si el render de una pieza falla la verificación del benchmark, el modelo puede recibir el informe de error junto con el código previo y producir una versión corregida, aprovechando los ejemplos de reparación multiturno del entrenamiento.
- Docencia de CAD paramétrico: uso como generador de ejemplos de código OpenSCAD comentado para ilustrar cómo se parametriza una familia de piezas con variables, módulos y transformaciones.
- Generación de datasets sintéticos para benchmarks: el modelo puede poblar variaciones de una familia de piezas y alimentar ciclos de evaluación, dado que su salida es código verificable automáticamente.
- Investigación en ajuste fino de nicho: sirve como caso de estudio reproducible de LoRA de rango 32 sobre 14.164 filas con ejemplos negativos enmascarados, útil para comparar estrategias de curación de datos.
- Prototipado rápido de utillaje de laboratorio: para piezas dentro de las familias cubiertas, el modelo reduce el tiempo de escribir a mano transformaciones y operaciones booleanas en OpenSCAD.
- Integración en un pipeline de CI que renderice OpenSCAD en modo headless y valide la pieza resultante, usando el modelo como primer generador y descartando las salidas que no compilen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La model card únicamente describe la partición de evaluación: cuatro familias del lote C (frustum riser, hinge leaf, spoked wheel y star wheel) se reservan como conjunto held-out, pero no se acompaña ningún número de acierto, validez de render ni comparación con el modelo base.

| Benchmark | Resultado |
|---|---|
| Métricas de generación OpenSCAD sobre familias held-out | No disponible |
| Comparación con Qwen3.5-9B base | No disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | No evaluado en la información disponible |

## Requisitos de hardware

- VRAM estimada en bf16: los 9.653 millones de parámetros implican unos 19,3 GB solo en pesos (coincide con el tamaño del repositorio), más el codificador visual y la caché KV; en la práctica se necesitan alrededor de 22-26 GB de VRAM para inferencia con contexto moderado. Estimación propia, no publicada por el autor.
- GPU profesionales: A100 40 GB, H100, L40S o A6000 permiten ejecutar el modelo en bf16 con margen. Una A100 80 GB o H100 permiten mayor longitud de contexto y varios flujos concurrentes.
- GPU de consumo: en bf16 no cabe en tarjetas de 16 GB ni en una RTX 4090 de 24 GB con contexto largo, aunque podría entrar ajustadamente con contexto corto y poca concurrencia. Para 12-16 GB sería necesario cuantizar, y no hay GGUF publicado, por lo que habría que generar la cuantización a partir de los safetensors.
- Despliegue: la librería declarada es `transformers`. vLLM, TGI, llama.cpp u Ollama requerirían verificar el soporte de la arquitectura `qwen3_5` en cada herramienta; llama.cpp y Ollama exigirían además convertir los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de generación por pieza.

## Comparativa con modelos similares

No se han identificado en la información disponible otros modelos especializados en generación de OpenSCAD para hardware de laboratorio, por lo que la comparación se limita al modelo base.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-v11 | 9.653 M | No disponible | OpenSCAD paramétrico (Tiiny Pocket Lab) | Apache 2.0 | HuggingFace, safetensors bf16 |
| Qwen/Qwen3.5-9B | No disponible | No disponible | Modelo generalista multimodal | No disponible en la informacion | HuggingFace (modelo base) |
| Otros modelos de generación de CAD/OpenSCAD | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste cubre catorce familias de piezas de las cuales diez entraron en entrenamiento; fuera de ese vocabulario y de la convención de diseño del benchmark, la calidad esperada decae y no hay métricas que lo cuantifiquen.
- Ausencia total de benchmarks publicados: no hay evidencia numérica de que el modelo supere al base en la tarea, solo la descripción del dataset y del protocolo de evaluación.
- Riesgo de alucinación geométrica: como generador de código, puede producir `.scad` sintácticamente válido pero dimensionalmente incorrecto o no renderizable; cualquier uso en producción exige validación automática del render.
- Debe ejecutarse con thinking desactivado según la model card; activar el modo de razonamiento puede degradar el formato de salida esperado.
- Idiomas no documentados: las descripciones de entrenamiento están en inglés, por lo que el rendimiento en castellano no está verificado.
- Contexto no documentado: se desconoce la ventana máxima soportada y si el ajuste la preserva íntegramente.
- Datos de entrenamiento generados parcialmente por Claude Opus (474 descripciones): conviene revisar las condiciones de uso de ese contenido si se redistribuye el modelo o sus derivados con fines comerciales.
- Licencia Apache 2.0 sobre el modelo derivado, pero el uso queda sujeto en la práctica a los términos del modelo base Qwen3.5-9B; conviene verificar la licencia del base antes de un despliegue comercial.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad ni informes independientes de calidad.
- No hay cuantizaciones publicadas, lo que complica el despliegue en hardware de consumo y en herramientas tipo Ollama o llama.cpp.

## Enlaces

- HuggingFace: https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-v11
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del benchmark y detalles de entrenamiento (§6.4): https://github.com/ATinyGreenCell/prompt-to-bench
- Paper, blog o demo adicionales: no disponibles en la información proporcionada. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
