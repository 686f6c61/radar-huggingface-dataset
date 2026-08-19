# Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-4bit-AWQ

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-4bit-AWQ es una versión cuantizada y modificada del modelo Muse Glimmer 30B, desarrollado originalmente por Meta Superintelligence Labs. El modelo base es un transformer denso multimodal (texto e imagen) con 52 capas, atención por ventana deslizante y una torre de visión, diseñado para ejecutarse en dispositivos. Esta variante concreta, publicada por el usuario Ishowbackup, aplica un proceso de "abliteración" (eliminación del comportamiento de rechazo) sobre los pesos del modelo y lo empaqueta en formato MLX con cuantización AWQ de 4 bits, reduciendo su huella a aproximadamente 18 GB para su uso en Apple Silicon.

La relevancia de este modelo radica en que permite ejecutar un sistema de 30B con capacidades multimodales y razonamiento agéntico en hardware de consumo de Apple, con una ventana de contexto de 131 072 tokens. El proceso de abliteración elimina las respuestas de rechazo, lo que lo hace útil para tareas donde se requiere una generación sin restricciones, aunque plantea riesgos éticos y de seguridad. La cuantización AWQ mantiene la calidad de los pesos activos, y el modelo se sirve mediante MLX, LM Studio o un servidor compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `muse_glimmer` — transformer denso, 52 capas, hidden 6656, GQA (32 q / 2 kv), sliding-window attention, torre de vision |
| Parametros totales | 6 216 936 448 (segun safetensors; el nombre del modelo indica 30B, posible discrepancia en la metadata) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 |
| Tipos de cuantizacion | 4-bit AWQ (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, AWQ) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B es un transformer denso con 52 capas, dimensión oculta de 6656, atención con consultas agrupadas (GQA) de 32 cabezas de consulta y 2 de clave/valor, y atención por ventana deslizante. Incluye una torre de visión que permite procesar imágenes junto con texto, lo que lo convierte en un modelo multimodal. La arquitectura está pensada para ejecución en dispositivo, con un diseño que equilibra capacidad y eficiencia.

La versión abliterated se obtiene mediante un proceso de modificación de pesos desarrollado por Blackfrost que elimina el comportamiento de rechazo del modelo original, manteniendo intactas las capacidades multimodales y de razonamiento. No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.) del modelo base. La cuantización AWQ de 4 bits se aplica sobre los pesos ya abliterados, priorizando la preservación de los canales más activos para minimizar la pérdida de calidad.

## Capacidades

- Generacion de texto y razonamiento complejo, con un modo de "pensamiento" que devuelve el razonamiento por separado de la respuesta final.
- Procesamiento multimodal de imagenes junto con texto (image-text-to-text), gracias a la torre de vision integrada.
- Conversacion multi-turno y comportamiento agéntico, orientado a tareas en dispositivo.
- Ventana de contexto larga de 131 072 tokens, adecuada para documentos extensos o historiales de conversacion amplios.
- Sin comportamiento de rechazo (abliterated): el modelo no se niega a responder a peticiones, incluso aquellas que el modelo original podria considerar dañinas.
- Compatible con el ecosistema MLX de Apple, lo que permite inferencia local eficiente en chips de la serie M.

## Casos de uso

- Asistente local en Mac: al ejecutarse con MLX, puede servir como asistente personal offline en un Mac con Apple Silicon, gestionando conversaciones largas y consultas multimodales sin conexion a internet.
- Generacion de codigo en local: el modelo puede escribir y depurar codigo en multiples lenguajes, y al no tener rechazos, es util para explorar soluciones no convencionales o vulnerabilidades en entornos de prueba.
- Analisis de imagenes con razonamiento: gracias a su torre de vision, puede describir, interpretar y razonar sobre imagenes, por ejemplo en tareas de documentacion visual o asistencia a personas con discapacidad visual.
- Procesamiento de documentos extensos: con 131 072 tokens de contexto, puede resumir, extraer informacion o responder preguntas sobre libros, informes o codigo fuente de gran tamaño.
- Desarrollo de agentes conversacionales: su naturaleza agéntica y su capacidad de razonamiento separado permiten construir sistemas que planifican y ejecutan tareas multi-paso, como automatizacion de flujos de trabajo.
- Investigacion en seguridad y alineacion: al estar abliterated, sirve como banco de pruebas para estudiar el comportamiento de modelos sin restricciones de rechazo, aunque debe usarse con cautela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es el benchmark de rechazo sobre el conjunto R1-HARMFUL-BENCH-450, medido en el modelo abliterated:

| Metrica | Resultado |
|---|---|
| Rechazo verdadero (dañino, n=300) | 0 / 300 = 0.0% |
| Rechazo verdadero (total 450) | 0 / 450 = 0.0% |
| Substring-dañino | 0 / 300 |
| Substring-total | 2 / 450 (falsos positivos de XSTest) |
| Errores | 0 |

Estos datos indican que la cuantizacion AWQ no provoca una reaparicion del comportamiento de rechazo, pero no ofrecen informacion sobre la calidad de generacion, razonamiento o capacidades multimodales.

## Requisitos de hardware

- Peso del modelo: aproximadamente 18 GB en formato MLX 4-bit AWQ.
- Requiere un Mac con chip Apple Silicon (M1 o posterior) y suficiente memoria unificada; se recomienda al menos 32 GB de RAM para un uso comodo, aunque con 24 GB podria funcionar con limitaciones.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; el ecosistema MLX esta restringido a Apple Silicon.
- Opciones de despliegue: `mlx_lm.generate` para generacion puntual, `mlx_lm.server` para un servidor compatible con OpenAI, o LM Studio con runtime MLX.
- No se dispone de datos de latencia o throughput especificos; al ser un modelo de 30B cuantizado, se espera una velocidad moderada en chips M-series, dependiendo de la generacion del chip y la memoria disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (tamano, multimodalidad, abliteration). No se han proporcionado datos de modelos alternativos ni benchmarks comparativos.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos, lo que significa que el modelo puede generar contenido dañino, ilegal o eticamente cuestionable si se le solicita. Su uso en produccion debe estar restringido a entornos controlados y con supervisión humana.
- No se dispone de informacion sobre sesgos del modelo, pero al ser una modificacion de un modelo de Meta, es probable que herede sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o codigo incorrecto, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La ventana de contexto de 131 072 tokens es amplia, pero no se ha verificado la calidad de la atencion en distancias largas; el uso de sliding-window attention puede degradar el rendimiento en segmentos muy distantes.
- La licencia Apache-2.0 permite uso comercial, pero el modelo abliterated puede violar las politicas de uso de Meta si se redistribuye o utiliza en aplicaciones publicas; es responsabilidad del usuario revisar los terminos del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y la fecha de creacion es futura (2026-08-15), lo que sugiere que podria ser un artefacto de prueba o no verificado; se recomienda validar su integridad antes de usarlo.
- No se especifican los idiomas soportados; el modelo base probablemente este entrenado principalmente en ingles, con capacidades multilingues limitadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-4bit-AWQ
- Modelo base (BF16): https://huggingface.co/Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
