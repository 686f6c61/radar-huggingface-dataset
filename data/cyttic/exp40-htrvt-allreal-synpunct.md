# cyttic/exp40-htrvt-allreal-synpunct

## Resumen

exp40-htrvt-allreal-synpunct es un modelo de reconocimiento de texto manuscrito (HTR) en hebreo, publicado por el usuario cyttic en Hugging Face bajo licencia MIT. Se trata de un sistema OCR/HTR especializado en líneas de texto manuscrito hebreo, con una arquitectura híbrida que combina una CNN residual para extracción de características, un enmascaramiento por spans y un transformer de 6 capas con dimensión 384, rematado por una cabeza CTC lineal. El modelo se ha entrenado desde cero sobre una mezcla de datos que incluye los corpus HHD, SCE y Pinkas, más un 20 % de líneas sintéticas de dígitos y puntuación.

El modelo resuelve la transcripción automática de líneas manuscritas en hebreo, un dominio históricamente difícil por la escasez de datos anotados y la variabilidad caligráfica. Su relevancia actual radica en que aborda una lengua con poca cobertura en herramientas OCR comerciales y lo hace con un modelo compacto (13,8 millones de parámetros) que puede ejecutarse en hardware modesto. La entrada es una imagen en escala de grises de una línea de texto a 64 píxeles de altura, espejada para convertir la dirección RTL (derecha a izquierda) del hebreo en LTR y que la cabeza CTC pueda procesarla secuencialmente.

El checkpoint reporta un CER (tasa de error de caracteres) de validación de 4,70 sobre el conjunto HHD en decodificación greedy, un valor competitivo para HTR hebreo. El repositorio es pequeño (0,1 GB) y no registra descargas ni interacciones en el momento de la consulta, lo que sugiere un experimento de investigación más que un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual + span masking + transformer de 6 capas (dim 384) + cabeza CTC lineal |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de línea a 64 px de altura) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de una CNN residual que extrae mapas de características de la imagen de línea en escala de grises (64 px de altura, espejada de RTL a LTR). Sobre esa secuencia espacial se aplica un enmascaramiento por spans y se pasa a un transformer de 6 capas con dimensión oculta de 384, cuya salida alimenta una cabeza CTC lineal para la decodificación secuencial de caracteres. El uso de CTC evita la necesidad de alineaciones explícitas carácter a carácter, lo que simplifica el entrenamiento con datos de líneas transcritas.

El entrenamiento se realizó desde cero sobre una mezcla de los corpus HHD, SCE y Pinkas, complementada con un 20 % de líneas sintéticas de dígitos y puntuación. El conjunto de caracteres es Mishkefet-v1. La model card indica que los detalles completos del entrenamiento se encuentran en un archivo results.json del repositorio, pero no se especifican el número total de tokens de imagen, la composición exacta del dataset ni si hubo etapas de refinamiento posteriores como RLHF o DPO, algo poco habitual en tareas de reconocimiento y que no se menciona.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a nivel de línea, a partir de imágenes en escala de grises de 64 px de altura.
- Transcripción de líneas con dígitos y puntuación, gracias al 20 % de datos sintéticos de este tipo incluidos en el entrenamiento.
- Manejo de texto en dirección RTL mediante espejado previo de la imagen, adaptando la entrada a la decodificación CTC LTR.
- Decodificación CTC greedy, con reporte de CER de validación.
- No se documentan capacidades de tool calling, function calling, agentes, multi-step reasoning, visión general, audio ni modo de razonamiento.
- No se documentan capacidades multilingües más allá del hebreo.

## Casos de uso

- Digitalización de manuscritos hebreos históricos: el modelo transcribe líneas de documentos manuscritos procedentes de corpus como HHD, SCE o Pinkas, lo que permite construir versiones legibles por máquina de archivos y colecciones.
- Procesamiento de manuscritos con puntuación y cifras: la inclusión de líneas sintéticas de dígitos y puntuación lo hace adecuado para documentos con numeración, fechas o referencias numéricas que requieren transcripción fiel.
- Alimentación de pipelines de búsqueda y recuperación: las transcripciones generadas pueden indexarse para búsqueda de texto completo sobre fondos manuscritos hebreos, facilitando la localización de pasajes.
- Investigación en HTR hebreo: al ser un modelo pequeño y con licencia MIT, sirve como línea base reproducible para comparar arquitecturas CNN-transformer-CTC en este dominio.
- Preprocesado en proyectos de historia y filología: investigadores pueden transcribir grandes lotes de líneas y revisar manualmente solo las de mayor error, reduciendo el coste de anotación.
- Despliegue en entornos con recursos limitados: con 13,8 millones de parámetros, el modelo puede integrarse en servicios de digitalización con GPU de gama media o incluso en CPU para procesamiento por lotes de baja frecuencia.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| HHD validation CER (greedy) | 4,70 |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo MMLU, HumanEval o GSM8K), que además no aplican a una tarea de HTR. Tampoco se dispone de comparaciones cuantitativas con otros modelos HTR hebreos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,8 millones de parámetros, el modelo es muy ligero y cabe con holgura en cualquier GPU consumer actual.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; modelos como RTX 3060, RTX 4090, A100 o H100 son sobrados para este tamaño.
- Cabe en GPU consumer: sí, con cualquier tarjeta moderna; también podría ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de OCR con pesos safetensors, requiere cargar la arquitectura personalizada del autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de HTR hebreo (parámetros, contexto, rendimiento, licencia y disponibilidad). Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para hebreo; no se ha validado su comportamiento en otras lenguas o alfabetos.
- La entrada debe prepararse según el formato esperado: imagen en escala de grises, 64 px de altura y espejado de RTL a LTR; un preprocesado incorrecto degradará la transcripción.
- El CER reportado (4,70) corresponde a un único conjunto de validación (HHD) y a decodificación greedy; el rendimiento en otros corpus o caligrafías puede diferir.
- Riesgo de alucinación en la decodificación CTC: en líneas borrosas o con caracteres atípicos, la salida puede contener sustituciones o caracteres espurios difíciles de detectar sin revisión humana.
- Sesgos derivados de la composición del corpus de entrenamiento (HHD, SCE, Pinkas y sintéticos), que puede no representar la variabilidad de caligrafías modernas o de otros estilos.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones de los corpus de entrenamiento subyacentes si se redistribuyen datos derivados.
- El repositorio no registra descargas ni validación comunitaria, por lo que su robustez en producción no está contrastada.
- No se documentan mecanismos de cuantización ni formatos alternativos de pesos, lo que puede complicar el despliegue en frameworks estándar sin adaptar la arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/exp40-htrvt-allreal-synpunct
