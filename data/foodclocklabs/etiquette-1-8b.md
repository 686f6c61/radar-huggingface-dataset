# FoodClockLabs/Etiquette-1-8B

## Resumen

Etiquette 1 (8B) es un modelo de visión-lenguaje especializado en la lectura de etiquetas de envasado de alimentos. Lo desarrolla FoodClock, un servicio de seguimiento nutricional construido sobre datos de Open Food Facts, y se distribuye como un fine-tune del modelo base Qwen/Qwen3-VL-8B-Instruct. Su propósito es convertir fotografías de un producto (frontal, tabla nutricional, ingredientes, alérgenos, sellos y embalaje) en un único objeto JSON con los datos tal y como aparecen impresos en el envase, sin estimaciones ni inferencias.

El modelo resuelve un problema concreto de la industria alimentaria: la digitalización fiable de la información de envasado a escala. Frente a un modelo generalista, Etiquette está entrenado para no completar campos ausentes ni convertir unidades (kJ a kcal, sodio a sal), delegando esas transformaciones al código del usuario, donde pueden auditarse. Devuelve valores numéricos como números y texto de forma literal, preservando el idioma y la grafía del envase.

Con 8.767.123.696 parámetros reales según los safetensors del repositorio (17,5 GB), licencia Apache-2.0 y soporte multilingüe, está pensado para ejecutarse en una única GPU de consumo, offline, con un coste estimado por el autor de una décima de céntimo por envase. Su relevancia actual radica en que ofrece una alternativa abierta y verificable a los modelos frontera para una tarea de extracción estructurada muy específica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3-VL); detalles internos de capas y atención no disponibles |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor menciona ejecución en GPU de consumo) |
| Idiomas soportados | multilingüe; en evaluación se cubrieron listas de ingredientes en 12 idiomas y envases con árabe y francés simultáneos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Etiquette 1 se construye como un fine-tune del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, es decir, un transformer de visión-lenguaje que procesa imágenes y texto conjuntamente para generar respuestas estructuradas. La información disponible no detalla el número de capas, la configuración de atención ni la longitud de contexto del modelo base; tampoco se especifican los hiperparámetros del ajuste fino.

El entrenamiento se apoya en el dataset openfoodfacts/product-database como fuente de fotografías y catálogo. El autor indica que el modelo fue ajustado con un prompt y un mensaje de sistema concretos (publicados como `prompt.txt` y `system.txt`), que deben enviarse sin modificar porque el modelo fue entrenado con esa formulación exacta. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es de diseño de tarea: el modelo está entrenado para leer y transcribir, no para estimar, derivar o completar campos, y deja fuera cualquier dato que no esté impreso y legible en las fotos. La categorización del producto se delega deliberadamente a un paso posterior separado, con el argumento de que un lector que también clasifica empieza a adivinar.

## Capacidades

- Lectura de tablas nutricionales fila a fila tal y como están impresas, con valor, unidad (kJ, kcal, g, mg, µg) y calificador (<, ≤, >), para las filas energy_kj, energy_kcal, fat, saturated_fat, carbohydrates, sugars, fiber, proteins, salt y sodium.
- Extracción de la base de la tabla (por 100 g, por 100 ml, por ración, etc.), incluyendo la cabecera impresa y el tamaño de ración cuando aparece.
- Identificación del tipo de producto: devuelve `kind` como "food" o "not-food".
- Extracción del nombre de producto por idioma con claves ISO 639-1 y `und` para nombres acuñados, además del nombre genérico o denominación legal por idioma.
- Extracción de marca y cantidad neta tal y como están impresas.
- Lectura de la lista de ingredientes por idioma, preservando la grafía y el caso del envase.
- Detección de declaraciones de alérgenos impresas y de posibles trazas ("may contain").
- Lectura de sellos de certificación, calidad y origen.
- Extracción de información de embalaje: materiales, códigos de reciclaje y texto.
- Para aguas minerales, extracción de minerales por litro.
- Etiquetado por foto: una entrada por imagen indicando qué muestra (front, nutrition, ingredients, allergens, marks, packaging, other).
- Salida estructurada en un único objeto JSON con valores numéricos como números y texto literal.
- Capacidad multilingüe en la lectura, con soporte para envases que combinan varios idiomas.
- No realiza conversión de unidades ni estimaciones; no asigna categoría de producto.

## Casos de uso

- Digitalización masiva de catálogos de alimentación: el modelo convierte lotes de fotografías de producto en registros JSON estructurados que pueden volcarse directamente a una base de datos tipo Open Food Facts, con la ventaja de que los valores se devuelven tal y como están impresos y las conversiones se hacen después en código auditable.
- Verificación de contribuciones ciudadanas: en plataformas colaborativas, Etiquette puede leer las fotos subidas por usuarios y comparar el resultado con los datos ya registrados para detectar discrepancias en la tabla nutricional, la cantidad neta o los alérgenos antes de aprobar la contribución.
- Aplicaciones de seguimiento nutricional: integrado en un servicio como el del propio autor, permite al usuario fotografiar un envase y obtener al instante los valores por 100 g o por ración, con la base de la tabla correctamente identificada para que la app aplique el cálculo de porciones.
- Gestión de alérgenos en entornos de restauración y retail: la extracción de declaraciones de alérgenos y de posibles trazas permite construir alertas automáticas o fichas de producto para personal con formación en seguridad alimentaria.
- Cumplimiento y auditoría de etiquetado: la lectura literal de sellos de certificación, origen, materiales de embalaje y códigos de reciclaje facilita revisiones de conformidad sin necesidad de transcripción manual.
- Procesamiento offline en dispositivo o en servidor local: al caber en una GPU de consumo y no requerir conexión, es adecuado para entornos con requisitos de privacidad o para operaciones en tienda con hardware modesto.
- Investigación sobre datos alimentarios: la publicación de las tarjetas de evaluación y del scorer permite reproducir la medición de calidad de lectura sin GPU y usar el modelo como base para estudios de etiquetado.

## Benchmarks y rendimiento

El autor publica los resultados de la prueba que condicionó el lanzamiento (run 13) sobre 100 productos de Open Food Facts, aproximadamente la mitad marroquíes (árabe y francés en el mismo envase) y el resto de Francia, Reino Unido, EE. UU., India, España, Bélgica, Suiza, Grecia, los Balcanes y otros países, con listas de ingredientes en 12 idiomas. Cada campo fue confirmado por una persona contra las fotos, registrando "no impreso" como valor propio. El modelo solo ve las fotos que la persona marcó. La puntuación es el porcentaje de campos que coinciden con la persona sobre el total de juicios; las discrepancias de archivo (texto correcto en campo o clave de idioma equivocados, 40 de 981 juicios) cuentan como no coincidentes en la cifra global y se excluyen de los porcentajes por campo.

| Campo | Coincide con la persona | Inventado (sobre juicios del campo) |
|---|---|---|
| Todos los campos juzgados | 83,0% | 42 de 981 juicios en 100 productos |
| Energía (kcal) | 97,0% | 1 de 100 |
| Sal | 98,0% | 2 de 100 |
| Sodio | 96,0% | 0 de 100 |
| Base de la tabla | 94,0% | 0 de 100 |
| Cantidad neta | 86,0% | 12 de 100 |
| Nombre de producto | 79,0% | 1 de 100 |
| Marca | 78,0% | 5 de 100 |
| Nombre frontal por idioma | 78,8% | 6 de 131 |
| Nombre genérico por idioma | 76,1% | 15 de 150 |

El autor menciona además un segundo conjunto de 100 productos mantenido en privado con el mismo criterio de muestreo, pero la información disponible no incluye sus resultados. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 8.767 millones de parámetros, en fp16 los pesos ocupan aproximadamente 17,5 GB, lo que exige al menos 20-24 GB de VRAM para inferencia sin cuantizar; con cuantización a 8 bits o 4 bits el requisito baja sustancialmente, aunque el autor no publica cifras concretas.
- El autor afirma que el modelo se ejecuta en una única GPU de consumo, offline, pero no especifica el modelo de GPU utilizado en esa afirmación.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en tarjetas de 24 GB (RTX 3090, RTX 4090) en fp16 ajustado o cuantizado, y en A100/H100 con holgura, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: no se especifican en la información disponible. Al publicarse en safetensors con arquitectura compatible con Qwen3-VL, es probable que pueda servirse con frameworks estándar de la familia, pero no se confirma.
- Latencia y throughput: no disponibles. El autor cita un coste de "una décima de céntimo por envase" como referencia económica, sin desglose de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Etiquette 1 (8B) | 8.767 millones | no disponible | Lectura de etiquetas de alimentos, salida JSON | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8B (familia) | no disponible | Visión-lenguaje generalista | no disponible en esta ficha | Hugging Face |
| Modelos frontera propietarios | no disponible | no disponible | Visión-lenguaje generalista | propietaria | API |

La comparación con alternativas especializadas en lectura de etiquetas alimentarias no está disponible en la información proporcionada. El propio autor compara el modelo con "un modelo frontera" en la capacidad de leer tablas nutricionales, pero no aporta cifras de ese contraste en el material disponible.

## Limitaciones y advertencias

- El modelo está diseñado para no completar campos ausentes: si un dato no está impreso y legible en las fotos, se omite. Esto es una garantía de fidelidad, pero implica que la cobertura depende de la calidad y exhaustividad de las fotografías enviadas.
- No realiza conversiones de unidades ni de bases (kJ a kcal, sodio a sal, por ración a por 100 g); el usuario debe implementarlas y verificarlas en su código.
- No asigna categoría de producto de forma deliberada; requiere un paso posterior separado para la clasificación.
- El prompt y el mensaje de sistema publicados deben enviarse sin modificar, ya que el modelo fue entrenado con esa formulación; alterarlos puede degradar la calidad de la extracción.
- Tasa de invención no nula: en la evaluación, 42 de 981 juicios resultaron inventados, con concentración en cantidad neta (12 de 100) y nombre genérico por idioma (15 de 150). En producción conviene validar estos campos.
- El rendimiento es más bajo en nombre de producto (79,0%), marca (78,0%) y nombre genérico por idioma (76,1%) que en los campos numéricos de la tabla nutricional.
- La evaluación se hizo sobre 100 productos con una composición geográfica y lingüística concreta; el rendimiento en otras regiones, idiomas o formatos de envase no está documentado en la información disponible.
- No se documentan sesgos específicos ni limitaciones de contexto o idioma más allá de lo indicado; no hay información sobre el comportamiento con envases dañados, ilegibles o con tipografías no estándar.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se construye sobre Qwen3-VL-8B-Instruct, cuyas condiciones de licencia no se detallan en la información proporcionada; conviene verificarlas antes de un despliegue comercial.
- El autor no publica requisitos de hardware, latencia ni opciones de despliegue, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FoodClockLabs/Etiquette-1-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de evaluación: https://huggingface.co/datasets/FoodClockLabs/etiquette-printed-truth
- Repositorio de benchmark y categorización: https://github.com/FoodClockLabs/etiquette-benchmark/tree/main/category
- Dataset de origen: openfoodfacts/product-database (referenciado en la model card)
- FoodClock: https://foodclock.com
