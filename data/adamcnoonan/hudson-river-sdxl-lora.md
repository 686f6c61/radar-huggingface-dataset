# adamcnoonan/hudson-river-sdxl-lora

## Resumen

Hudson River School SDXL LoRA es un adaptador de bajo rango (LoRA) para Stable Diffusion XL base 1.0, desarrollado por Adam Noonan, que especializa el modelo generativo en la estética de la Hudson River School, movimiento pictórico estadounidense del siglo XIX. El adaptador se entrena sobre 69 pinturas de dominio público de 18 pintores, seleccionadas a ciegas por el autor entre 150 candidatas, y permite generar paisajes con la paleta, la iluminación dramática y la composición propias de esta corriente sin necesidad de indicar el nombre de ningún artista en el prompt.

El modelo resuelve un problema concreto: obtener un estilo pictórico coherente y reconocible sin recurrir a prompts largos ni a nombres de pintores, que en SDXL base producen resultados inconsistentes. La arquitectura es un LoRA de rango 16 y alpha 16 aplicado exclusivamente a las capas de atención del UNet (`to_q`, `to_k`, `to_v`, `to_out.0`), con un tamaño de repositorio de 0,1 GB. No se trata de un modelo de lenguaje ni de un transformer multimodal: es un adaptador de difusión para generación de imágenes texto-a-imagen.

Su relevancia actual radica en la validación empírica que acompaña al adaptador: en una prueba ciega de 120 pares con el mismo prompt y el mismo ruido inicial, el autor prefirió la renderización con LoRA frente a SDXL base en 118 de 120 pares (98,3%, intervalo del 95%: 95,8-100, p de sign-flip 0,0006), con estabilidad total en los 30 pares repetidos. Es un caso poco habitual de model card que documenta el proceso de selección de datos, los hiperparámetros y la evaluación de forma reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL base 1.0; difusión texto-a-imagen |
| Parametros totales | no disponible (LoRA de rango 16, alpha 16, sobre capas de atención del UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrenamiento 1344x768, 1216x832 y 1152x896) |
| Tipos de cuantizacion | no disponible; los ejemplos se generaron en fp32; fp16 no fue probado |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | openrail++ |
| Formato de pesos | pesos LoRA compatibles con la librería `diffusers` (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 insertado en las capas de atención del UNet de `stabilityai/stable-diffusion-xl-base-1.0` (`to_q`, `to_k`, `to_v`, `to_out.0`). El entrenamiento usó AdamW con learning rate 1e-4, weight decay 0,01 y recorte de norma de gradiente a 1,0, durante 1.500 pasos con batch 1 (aproximadamente 22 pasadas sobre las 69 pinturas), semilla 0 y precisión fp32. Las captions se descartaron en el 10% de los pasos (160 de 1.500) para que el LoRA aprendiera también el aspecto no condicionado. La pérdida promedió 0,132 en los primeros 100 pasos y 0,121 en los últimos 100. Todo el proceso, incluida la generación de las imágenes de prueba, se completó en 86 minutos en una NVIDIA L40S.

El conjunto de datos son 69 pinturas de dominio público de Wikimedia Commons, localizadas vía Wikidata, de 18 pintores estadounidenses fallecidos antes de 1926. La distribución incluye Albert Bierstadt (14), Asher Brown Durand (11), Frederic Edwin Church (6), John Frederick Kensett (6), Robert Seldon Duncanson (5), Thomas Cole (5), Martin Johnson Heade (5), George Inness (4), y entre 1 y 2 pinturas de Worthington Whittredge, John William Casilear, Thomas Moran, David Johnson, Charles H. Chapin, Sanford Robinson Gifford, Edmund Darch Lewis, James McDougal Hart, William Hart y William Trost Richards. Cada pintura se recortó a la forma SDXL más cercana de tres posibles (1344x768, 1216x832 o 1152x896), eliminando de media un 4,4% del área y sin ampliar nunca la imagen. Cada una recibió una caption breve en inglés describiendo la escena. El archivo `training_paintings.json` documenta título, pintor, colección, enlaces a Wikidata y Commons, tamaño de entrenamiento y caption de cada obra.

La innovación metodológica destacable no está en la arquitectura sino en el proceso de curación: el autor seleccionó las 69 pinturas de entre 150 candidatas en una pasada ciega, sin ver pintor ni título, y evaluó el resultado con una prueba ciega de 120 pares (12 prompts de paisaje ajenos a las captions de entrenamiento, 10 semillas nuevas cada uno, lado aleatorio) más 30 pares repetidos para comprobar estabilidad. Un LoRA anterior entrenado con 94 imágenes SDXL seleccionadas por el mismo autor perdió esa misma prueba, siendo elegido solo en el 10,0% de los pares, lo que sugiere que la selección de datos pictóricos reales frente a imágenes sintéticas fue determinante.

## Capacidades

- Generación de imágenes texto-a-imagen de paisajes con estética de la Hudson River School: valles, gargantas fluviales, tormentas, amaneceres, cielos dramáticos y luz solar rasgando nubes.
- Estilización pictórica coherente sin trigger word: el prompt debe comenzar por "a Hudson River School oil painting of" seguido de la descripción de la escena, que es la forma de todas las captions de entrenamiento.
- Composición de escenas con iluminación dramática y profundidad atmosférica, rasgos característicos del movimiento.
- Compatibilidad con el pipeline `StableDiffusionXLPipeline` de `diffusers` mediante `load_lora_weights`.
- Control fino de la generación mediante semilla, resolución, número de pasos y guidance scale, con reproducibilidad verificada (la semilla 10200 reproduce la imagen de la garganta fluvial).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto: es exclusivamente un adaptador de difusión para imágenes.
- No se documentan capacidades multilingües; los prompts de ejemplo y las captions de entrenamiento están en inglés.

## Casos de uso

- Ilustración editorial de paisajes históricos: para artículos, libros o revistas sobre historia natural, exploración o el siglo XIX estadounidense, el LoRA genera imágenes coherentes con la estética de época a partir de descripciones textuales, sin necesidad de encargar ilustración original ni de nombrar artistas.
- Diseño de fondos para producciones audiovisuales: la generación de cielos tormentosos, valles y amaneceres con la paleta de la Hudson River School sirve para mate paintings, fondos de animación o previsualización de escenarios en proyectos de bajo presupuesto.
- Creación de material didáctico sobre historia del arte: el adaptador permite generar variaciones de paisajes en el estilo para explicar visualmente las convenciones del movimiento (luz, composición, escala) en aulas o cursos en línea.
- Prototipado rápido de concept art para videojuegos de temática histórica o rural: con 30 pasos DDIM y guidance 5,0 se obtienen imágenes en una sola GPU L40S, útiles para explorar direcciones visuales antes de encargar arte final.
- Generación de ilustraciones para publicaciones de dominio público o proyectos culturales: al entrenarse exclusivamente con obras de dominio público y publicarse bajo openrail++, el adaptador es adecuado para proyectos que requieren trazabilidad clara de la procedencia de los datos de entrenamiento.
- Decoración e impresión artística personalizada: la resolución nativa de 1216x832 y la estética pictórica permiten generar láminas decorativas de paisajes con calidad suficiente para impresión doméstica.
- Investigación sobre estilización con LoRA: el repositorio documenta hiperparámetros, curvas de pérdida, proceso de selección de datos y protocolo de evaluación ciega, lo que lo convierte en un caso de estudio reproducible para quienes investigan adaptadores de difusión y evaluación subjetiva.

## Benchmarks y rendimiento

| Medida | Resultado |
|---|---|
| LoRA preferido en prueba ciega | 118 de 120 pares; media sobre los 12 prompts 98,3% (intervalo del 95%: 95,8-100; p de sign-flip 0,0006) |
| Misma elección en par repetido | 30 de 30 |
| Render más cercano a una pintura de entrenamiento | similitud coseno 0,939, sin copia visual detectada |
| LoRA anterior (94 imágenes SDXL) en la misma prueba | elegido en el 10,0% de los pares |
| Pérdida media, primeros 100 pasos | 0,132 |
| Pérdida media, últimos 100 pasos | 0,121 |
| Tiempo de entrenamiento y renders de prueba | 86 minutos en una NVIDIA L40S |

No se han publicado resultados de benchmarks estandarizados (FID, CLIP score, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; SDXL base en fp32 requiere del orden de 10-16 GB según resolución y pipeline, y el LoRA añade una sobrecarga mínima al ser rango 16 sobre capas de atención.
- GPU recomendadas: NVIDIA L40S es la hardware usada en el desarrollo y las pruebas; cualquier GPU con VRAM suficiente para SDXL en fp32 debería funcionar.
- Cabe en GPU de consumo: no confirmado en la información disponible; el autor no documenta pruebas en RTX 4090, 3090 u otras GPU de consumo. fp16 no fue probado.
- Opciones de despliegue: `diffusers` con `StableDiffusionXLPipeline` y `load_lora_weights`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este adaptador).
- Latencia y throughput: no disponibles de forma aislada; los renders de prueba (120 pares más 30 repetidos) se completaron junto con el entrenamiento en 86 minutos en una L40S.
- Nota sobre ROCm: en AMD ROCm (gfx1151) los renders de SDXL se desviaron de la referencia CUDA en las pruebas del autor, por lo que todos los ejemplos publicados provienen de CUDA.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hudson River School SDXL LoRA | LoRA sobre SDXL base | rango 16, alpha 16 | 1344x768, 1216x832, 1152x896 | 98,3% de preferencia frente a SDXL base en prueba ciega del autor | openrail++ | Hugging Face, 0 descargas, 0 likes |
| SDXL base 1.0 | Modelo de difusión completo | no disponible en la información | resolución nativa SDXL | referencia base; perdió 118 de 120 pares frente al LoRA | openrail++ | Hugging Face, ampliamente distribuido |
| LoRA anterior del mismo autor (94 imágenes SDXL) | LoRA sobre SDXL base | no disponible | no disponible | elegido en 10,0% de los pares en la misma prueba | no disponible | no disponible en la información |

No se dispone de datos sobre otros LoRA de estilo paisajístico comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus se limita a 18 pintores estadounidenses de la Hudson River School, en su mayoría blancos y del siglo XIX; el modelo reproduce esa tradición visual concreta y no representa otras escuelas paisajísticas ni perspectivas diversas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar composiciones plausibles pero inexistentes, con anatomías, arquitecturas o detalles naturales incoherentes, especialmente fuera de la resolución y el estilo de entrenamiento.
- Limitaciones de contexto e idioma: las captions de entrenamiento están en inglés y el prompt debe seguir la forma "a Hudson River School oil painting of..."; no se documenta comportamiento con prompts en otros idiomas.
- Restricciones de licencia: openrail++ permite uso comercial con condiciones; conviene revisar los términos completos antes de explotación comercial, especialmente en lo relativo a atribución y a usos prohibidos.
- Caveat de producción: fp16 no fue probado y solo se validó fp32; en AMD ROCm los renders se desviaron de la referencia CUDA, por lo que en producción sobre ROCm conviene validar la salida antes de desplegar.
- El LoRA está entrenado sobre un conjunto muy pequeño (69 pinturas) y con 1.500 pasos; puede sobreajustar a las composiciones de entrenamiento, aunque el autor reporta similitud coseno máxima de 0,939 sin copia visual detectada.
- La evaluación es subjetiva y realizada por el propio autor del modelo, no por un panel independiente; los resultados de preferencia deben interpretarse con esa cautela.
- No se documentan capacidades de texto, razonamiento ni tool calling: no debe confundirse con un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/adamcnoonan/hudson-river-sdxl-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Librería diffusers: https://github.com/huggingface/diffusers
- Wikimedia Commons (fuente de las pinturas): https://commons.wikimedia.org
- Wikidata (localización de las obras): https://www.wikidata.org
- Archivo de entrenamiento citado en la model card: `training_paintings.json` (incluido en el repositorio del modelo)
