# mkenfenheuer/evora-qwen3-vl-2b-photos-v3-GGUF

## Resumen

Evora on-device photo model (v3) es un ajuste fino multimodal publicado por el usuario mkenfenheuer sobre Qwen/Qwen3-VL-2B-Instruct, empaquetado en formato GGUF para su ejecución con llama.cpp. Está diseñado para una única tarea: `meal.identify.image`, es decir, reconocer la comida presente en una fotografía de un plato y devolver un objeto JSON compacto con un título en el idioma del usuario y la lista de componentes del plato, cada uno con una consulta en inglés para bases de datos alimentarias, un peso estimado en gramos y una confianza.

El modelo no calcula calorías ni nutrientes: esa parte la resuelve el servidor de las aplicaciones Evora (iPhone y Android) consultando USDA FoodData Central y Open Food Facts a partir de las consultas y pesos devueltos por el modelo. La inferencia se plantea íntegramente en el dispositivo, de modo que la fotografía nunca sale del teléfono, lo que lo convierte en una pieza relevante para aplicaciones de salud y nutrición con requisitos estrictos de privacidad.

Con 1.720.574.976 parámetros reales (según los pesos originales en safetensors) y un repositorio de 3,8 GB, se distribuye bajo licencia Apache 2.0 en dos cuantizaciones (Q8_0 y Q4_K_M) más un proyector de imagen en F16. El modelo solo se entrenó con dos idiomas, alemán e inglés, y con un formato de prompt único que debe respetarse textualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (hereda la de Qwen/Qwen3-VL-2B-Instruct); detalle interno no disponible |
| Parametros totales | 1.720.574.976 (dato real de safetensors, ~1,72 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (en entrenamiento se usaron imagenes de como maximo 640x640 px, ~400 tokens de imagen) |
| Tipos de cuantizacion | Q8_0 (recomendada), Q4_K_M (para telefonos con menos de 8 GB de RAM) |
| Idiomas soportados | Aleman (de) e ingles (en); otros idiomas se atienden mejor preguntando en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 3,8 GB |
| Ficheros publicados | Q8_0 (1,83 GB), Q4_K_M (1,11 GB), mmproj f16 (0,82 GB), training-photos.csv |
| Fecha de publicacion | Creado el 2026-09-27, actualizado el 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del vision-language model Qwen3-VL-2B-Instruct, que combina un codificador visual con un transformer de lenguaje y un proyector multimodal. En este repositorio el proyector se distribuye por separado como `mmproj-evora-qwen3-vl-2b-photos-v3.f16.gguf`, un fichero de 0,82 GB que es imprescindible junto con cualquiera de las dos cuantizaciones del modelo. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset (más allá del fichero `training-photos.csv`, que documenta fuente y licencia de cada foto a tamaño completo) ni si se aplicaron etapas de RLHF o DPO. Sí se especifica que las fotografías de entrenamiento no superaban los 640×640 píxeles, lo que equivale a unos 400 tokens de imagen, y que las aplicaciones reducen la imagen a ese presupuesto antes de inferir.

El entrenamiento se realizó sobre una única forma de prompt, que debe usarse literalmente: un mensaje de sistema que fija la tarea y el idioma (`You are Evora's on-device model. Task: meal.identify.image. Language: de (German). Reply with the JSON object only.`), un mensaje de usuario con la imagen seguida del texto `Identify the meal in this image.` —o `Identify the meal. Hint: <hint>` cuando hay pista del usuario— y una respuesta del asistente consistente en un único objeto JSON compacto. La decodificación recomendada es greedy (temperatura 0) y, preferiblemente, bajo una gramática JSON. No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento de comidas en fotografías: identifica el plato y devuelve un título en el idioma solicitado (alemán o inglés).
- Descomposición en componentes: para cada componente emite un nombre, una consulta en inglés orientada a bases de datos alimentarias, un peso estimado en gramos y una puntuación de confianza.
- Salida estructurada garantizada: el modelo está entrenado para responder exclusivamente con un objeto JSON, apto para consumo directo por una aplicación.
- Entrada multimodal imagen-texto: acepta una imagen y una instrucción textual corta, incluida una pista opcional del usuario (`Hint:`).
- Procesamiento on-device: pensado para ejecutarse en el propio teléfono, sin envío de la imagen a un servidor.
- Capacidad multilingüe limitada a alemán e inglés; el resto de idiomas se responden mejor formulando la petición en inglés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de tarea única y salida directa.
- No estima calorías, macronutrientes ni micronutrientes; esa función queda fuera del modelo por diseño.

## Casos de uso

- Registro dietético en aplicaciones móviles de nutrición (el caso original de Evora): el usuario fotografía su plato, el modelo devuelve el JSON con componentes, pesos estimados y consultas en inglés, y la app envía únicamente esos metadatos al servidor para resolver calorías y nutrientes en USDA FoodData Central y Open Food Facts. La imagen permanece en el teléfono.
- Aplicaciones con requisitos estrictos de privacidad o cumplimiento del RGPD: al ejecutarse por completo en el dispositivo, evita transferir fotografías de contenido personal a infraestructura ajena, lo que simplifica el análisis de riesgos de tratamiento de datos.
- Diario de comidas sin conexión: el modelo funciona localmente con llama.cpp, por lo que puede identificar platos en escenarios sin cobertura o con conectividad intermitente, almacenando después los componentes para su sincronización posterior.
- Preanotación de datasets de imágenes de alimentos: utilidad para etiquetar de forma semiautomática grandes colecciones fotográficas con componentes y pesos aproximados, que después revisa un anotador humano. El propio autor documenta un ejercicio de este tipo sobre platos de Nutrition5k.
- Investigación en visión por computador aplicada a nutrición: sirve como baseline reproducible de reconocimiento de platos en formato GGUF, ligero y ejecutable en hardware modesto, para comparar frente a modelos mayores o estrategias de ajuste alternativas.
- Triaje en telemedicina y asesoramiento dietético: la aplicación puede clasificar la composición aproximada de una comida antes de decidir si requiere revisión de un profesional, enviando solo metadatos agregados.
- Despliegue en dispositivos de gama media: con la cuantización Q4_K_M (1,11 GB más el proyector de 0,82 GB), el modelo está pensado para teléfonos con menos de 8 GB de RAM, lo que amplía el parque de dispositivos compatibles.
- Asistentes de cocina y recetas: a partir de la lista de componentes detectados se pueden sugerir recetas o sustituciones, usando las consultas en inglés como clave de búsqueda en bases de datos de ingredientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

La model card sí incluye comparaciones cualitativas sobre fotografías no vistas durante el entrenamiento, ejecutadas con el fichero Q8_0 y greedy bajo gramática JSON. Se reproducen a continuación como ejemplos, no como benchmarks formales:

Plato de Nutrition5k, alemán:

| Componente estimado por el modelo | Componente medido (Nutrition5k) |
|---|---|
| Papaya 120 g | Peras 200 g |
| Almendras 30 g | Almendras 25 g |
| Gajos de naranja 45 g | Mandarinas 54 g |
| Fresas 40 g | Fresas 77 g |
| Total 235 g | Total 356 g |

Plato de Nutrition5k, inglés:

| Componente estimado por el modelo | Componente medido (Nutrition5k) |
|---|---|
| Ternera 120 g | Ternera 131 g |
| Verduras mixtas 140 g | Espinaca cruda, mostaza, pepino, bok choy y tomate 132 g; brocoli 65 g |
| Cebada perlada 100 g | Bayas de trigo 79 g, mijo 17 g |
| No detectado | Aceite de oliva 17 g, vinagre 8 g, chalotas, cebolla, ajo, mostaza y sal 16 g |
| Total 360 g | Total 465 g |

El propio autor señala dos errores recurrentes en estos ejemplos: confundir papaya con pera y escribir «Amandeln» en lugar de «Mandeln», además de una tendencia sistemática a subestimar el peso total del plato.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 3-4 GB considerando el fichero de 1,83 GB, el proyector de 0,82 GB y el overhead de contexto de llama.cpp (estimacion derivada del tamano de los ficheros, no publicada por el autor).
- VRAM estimada para Q4_K_M: aproximadamente 2,5-3 GB con los mismos supuestos (1,11 GB + 0,82 GB más overhead).
- Espacio en disco: 2,65 GB para Q8_0 + mmproj y 1,93 GB para Q4_K_M + mmproj.
- GPU de consumo compatibles: cabe holgadamente en RTX 3060 12 GB, RTX 4060, RTX 4070 o RTX 4090, y también en tarjetas de 4-6 GB como GTX 1650 o RTX 3050 en la cuantizacion Q4_K_M.
- Moviles: la model card indica que Q4_K_M está pensado para telefonos con menos de 8 GB de RAM, si bien reconoce que en esa cuantizacion el modelo nombra los alimentos de forma menos fiable.
- Despliegue: llama.cpp es el runtime de referencia (el autor cita la version b11200 con soporte `mtmd`); el repositorio incluye la etiqueta `endpoints_compatible`, y el ecosistema GGUF permite otros runners compatibles como Ollama o servidores basados en llama.cpp.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia ni tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| evora-qwen3-vl-2b-photos-v3 (este modelo) | 1,72 B | No disponible | Apache 2.0 | GGUF | Ajuste fino de tarea unica para reconocimiento de comidas on-device; salida JSON; solo de/en |
| Qwen/Qwen3-VL-2B-Instruct | ~2 B (no confirmado en la informacion disponible) | No disponible | No disponible en la informacion proporcionada | safetensors | Modelo base generalista de vision-lenguaje, sin especializar en alimentos |
| Qwen/Qwen3-VL-2B-Instruct-GGUF | No disponible | No disponible | No disponible en la informacion proporcionada | GGUF | Version cuantizada oficial del modelo base, de proposito general |
| Qwen3-VL (familia completa, incluida variante MoE) | Varios tamanos | No disponible | No disponible en la informacion proporcionada | safetensors, GGUF | Gama completa de Qwen3-VL; cubre vision, video y agentes |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparación relevante es funcional: el modelo de Evora sacrifica generalidad (una sola tarea, dos idiomas, salida JSON fija) a cambio de un tamano reducido apto para ejecucion en telefono y de una salida directamente consumible por una aplicación.

## Limitaciones y advertencias

- Sesgos y errores documentados: el propio autor reconoce confusiones entre alimentos visualmente parecidos (papaya por pera) y erratas ortograficas en la salida alemana («Amandeln» por «Mandeln»).
- Subestimacion sistematica del peso: en los dos ejemplos de la model card el total estimado queda por debajo del peso medido (235 g frente a 356 g; 360 g frente a 465 g), un sesgo atribuido a platos pequenos de cafeteria.
- Omision de componentes: ingredientes presentes en pequena cantidad o poco visibles, como aceites, vinagres o condimentos, pueden no detectarse.
- Riesgo de alucinacion: al generar texto libre dentro del JSON, puede inventar componentes plausibles o emitir consultas que no correspondan a la base de datos de alimentos, sin una validacion externa.
- Limitacion idiomatica: solo esta entrenado para aleman e ingles; el resto de idiomas debe solicitarse en ingles y aun asi la calidad no esta garantizada.
- Restriccion de formato: el modelo espera exactamente la plantilla de prompt con la que fue entrenado; cualquier variacion puede degradar la calidad de la respuesta. Se recomienda decodificacion greedy y gramatica JSON.
- Presupuesto de imagen fijo: las fotografias se entrenaron a un maximo de 640x640 px (~400 tokens de imagen), por lo que resoluciones mayores deben reducirse antes de la inferencia.
- Alcance funcional limitado: no calcula calorias ni nutrientes y no soporta tool calling, agentes ni razonamiento multi-paso; cualquier necesidad de este tipo debe resolverse fuera del modelo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-2B-Instruct y las licencias de las fotografias de entrenamiento recogidas en `training-photos.csv`, que incluyen material con licencias como CC BY-SA.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkenfenheuer/evora-qwen3-vl-2b-photos-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Version GGUF oficial del modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct-GGUF
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Aplicacion Evora: https://www.evora-app.de
- Qwen3-VL-2B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_2b_instruct
- Imagen Docker ai/qwen3-vl: https://hub.docker.com/r/ai/qwen3-vl
