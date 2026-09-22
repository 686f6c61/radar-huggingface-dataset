# introvert7/Krea2_Chars_LoRA

## Resumen

Krea2_Chars_LoRA es una colección de 84 adaptadores LoRA de personaje para el modelo de generación de imágenes KREA2, en sus variantes base y turbo, publicada por el usuario introvert7 en Hugging Face. No se trata de un modelo autónomo, sino de un conjunto de pesos de ajuste fino que se aplican sobre KREA2 para reproducir la identidad facial de personajes concretos. Cada LoRA se distribuye como `<Nombre>_KREA2.safetensors` junto a un fichero `<Nombre>_KREA2.md` de "persona" que describe los rasgos faciales estables del personaje, su apariencia variable y su repertorio de expresiones. El repositorio ocupa 6,0 GB en total, una cifra que incluye los 84 adaptadores, los ficheros de persona, las caption de entrenamiento y las imágenes de previsualización de la carpeta `Pruned_Comparison`.

El interés técnico de esta ficha no está en el modelo base, cuyas especificaciones no se detallan en la información disponible, sino en el proceso de producción. Todo el repositorio (recopilación del dataset, entrenamiento y publicación) se generó de forma automatizada por un agente autónomo (Hermes Agent de Nous Research, servido por el modelo Kimi K3) a partir de una petición en lenguaje natural, sin ninguna revisión manual en el bucle. La cadena incluye scraping de imágenes, detección y recorte facial con Ultralytics YOLO, filtrado de contenido, cribado estético con un discriminador basado en el scorer ERNIE, captioning con Gemma-4 26B (abliterated) vision MTP a 1,2 s por imagen, entrenamiento con Ostris AI-Toolkit en pods gestionados vía API de RunPod (MCP) y publicación automática de pesos y ficheros de persona.

El aspecto más reseñable para quien evalúe el modelo es la política de compresión aplicada: cada LoRA se reordenó con SVD dinámico `sv_fro` (retención 0,998, rango máximo 16) y se podó por bloques eliminando los 8 bloques transformer de menor impacto (bloques 1-8, en torno al 3 % de la energía delta). Es, por tanto, un caso de estudio útil sobre post-entrenamiento y poda de adaptadores en modelos de difusión. Ahora bien, conviene tener presente desde el principio que los personajes son personas reales y que la licencia apache-2.0 cubre los pesos, no los derechos de imagen de los sujetos representados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el modelo de generación de imágenes KREA2; la arquitectura del modelo base no se detalla (la model card menciona "transformer blocks", lo que apunta a un backbone de tipo transformer) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | KREA2 (variantes base y turbo) |
| Número de LoRA incluidos | 84 |
| Rango de los adaptadores | 16 como máximo, tras re-ranking con SVD dinámico `sv_fro` |
| Poda aplicada | Eliminación de los 8 bloques transformer de menor impacto (bloques 1-8, ~3 % de la energía delta) |
| Tamaño del repositorio | 6,0 GB |
| Pipeline declarado | text-to-image |
| Compatibilidad declarada | ComfyUI (etiqueta); Ostris AI-Toolkit para el entrenamiento |
| Autor | introvert7 |
| Fecha de creación | 2026-09-22 |
| Fecha de última actualización | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Cada uno de los 84 ficheros es un adaptador LoRA de bajo rango pensado para inyectarse en el modelo KREA2, tanto en su variante base como en la turbo. La model card no especifica el número de capas afectadas, la dimensión del modelo base ni los hiperparámetros de entrenamiento (learning rate, pasos, resolución), más allá de que se usaron "ajustes predefinidos por el usuario" en Ostris AI-Toolkit. Tras el entrenamiento se aplicó una reordenación con SVD dinámico `sv_fro` con un umbral de retención de 0,998 y un rango máximo de 16, seguida de una poda por bloques que descarta los 8 bloques transformer de menor contribución (bloques 1-8), lo que según el autor supone aproximadamente el 3 % de la energía delta. El personaje Jung Ho-yeon fue reentrenado sobre un dataset nuevo y posteriormente sometido al mismo proceso de re-ranking y poda.

El dataset se construyó sin intervención humana. La recolección de imágenes se hizo por scraping automatizado de bancos de fotos web por personaje; el recorte y la curación se apoyaron en detección de cara y cabeza con Ultralytics YOLO, junto con un filtro de contenido duro que rechaza imágenes generadas por IA, sujetos incorrectos y capturas por debajo de un umbral de nitidez. Cada candidata se puntuó con un discriminador construido sobre el scorer estético ERNIE, con umbral de aprobado o rechazado. El captioning se realizó con Gemma-4 26B (abliterated) vision MTP, elegido por generar descripciones sin restricciones a 1,2 s por imagen. A partir del análisis de rasgos de esas caption se sintetizó el fichero de persona de cada personaje. No se documenta el uso de RLHF ni de DPO, algo esperable en un adaptador de difusión.

## Capacidades

- Generación de imágenes de personajes concretos con identidad facial estable sobre KREA2, en sus variantes base y turbo.
- Control de la apariencia variable del personaje (vestuario, entorno, iluminación, encuadre) manteniendo los rasgos faciales ancla descritos en el fichero de persona.
- Repertorio de expresiones faciales descrito explícitamente en el `.md` de cada personaje, lo que facilita prompts de emoción controlada.
- Integración en flujos de trabajo de ComfyUI, según la etiqueta declarada por el autor.
- 84 personajes distintos en un único repositorio, con estructura uniforme de carpetas (`Characters/<Nombre>/`) que simplifica el intercambio de adaptadores.
- Aplicación sobre dos variantes del modelo base (base y turbo), lo que permite elegir entre calidad y velocidad según el caso.
- No se documenta soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso ni capacidades multilingües: son capacidades no aplicables a un adaptador de generación de imágenes.

## Casos de uso

- Preproducción audiovisual: generar hojas de personaje coherentes para un guion, manteniendo la misma cara en decenas de encuadres y expresiones gracias al anclaje de rasgos del fichero de persona, antes de contratar casting o diseño de vestuario.
- Cómic e ilustración seriada: producir viñetas con un protagonista consistente a lo largo de capítulos, usando el LoRA como capa de identidad y el prompt para el resto de la escena.
- Prototipado de avatares para producto digital: crear variantes de un personaje virtual con rasgos controlados para probar direcciones de arte sin sesiones de fotografía ni modelado 3D.
- Marketing y redes sociales: generar piezas gráficas con una figura reconocible y expresiones ajustadas al mensaje, siempre que se cuente con los derechos de imagen correspondientes.
- Investigación sobre poda de adaptadores: el repositorio incluye la comparativa `Pruned_Comparison` con una imagen por personaje generada con el LoRA podado, lo que permite estudiar empíricamente el efecto de eliminar 8 bloques transformer y limitar el rango a 16.
- Auditoría de pipelines autónomos de datos: al documentarse paso a paso la cadena scraping → YOLO → cribado estético → captioning → entrenamiento, sirve como referencia para evaluar sesgos y fallos de curación en datasets construidos sin revisión humana.
- Composición con otros adaptadores: al ser LoRA sobre un modelo de difusión, se puede combinar con adaptadores de estilo, con ControlNet o con IP-Adapter para fijar pose, siempre que la VRAM y el pipeline lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evidencia de rendimiento es cualitativa: la carpeta `Pruned_Comparison` contiene una imagen de ejemplo por personaje generada con el LoRA podado, pero no se acompaña de métricas objetivas (FID, CLIP score, similitud facial, LPIPS) ni de comparaciones numéricas frente a los adaptadores sin podar.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El consumo lo determina el modelo base KREA2, no el adaptador; un LoRA de rango 16 añade una sobrecarga de memoria y cómputo marginal respecto al modelo completo.
- GPU recomendadas: no disponible para el conjunto LoRA + KREA2, ya que no se publican requisitos del modelo base.
- Encaje en GPU de consumo: no confirmado. Dependerá de si KREA2 dispone de variantes cuantizadas y de la resolución de generación; no hay datos en la información proporcionada.
- Opciones de despliegue: ComfyUI es el único entorno declarado mediante etiqueta. Ostris AI-Toolkit se usó para el entrenamiento, no para inferencia. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Infraestructura de entrenamiento: pods gestionados mediante la API de RunPod (MCP), creados, configurados, monitorizados y destruidos de forma automática por el agente.
- Latencia y throughput: no disponible. El único dato temporal publicado es el del captioning del dataset (1,2 s por imagen con Gemma-4 26B abliterated), que no corresponde a la inferencia del LoRA.

## Comparativa con modelos similares

No hay datos suficientes en la información proporcionada para establecer una comparativa rigurosa. No se dispone de cifras de rendimiento, de número de parámetros ni de especificaciones del modelo base KREA2, de modo que cualquier comparación numérica con otras familias de adaptadores de personaje (por ejemplo, colecciones de LoRA de personaje para SDXL o para Flux) sería especulativa. La tabla siguiente recoge únicamente los campos verificables.

| Modelo | Tipo | Modelo base | Nº de adaptadores | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Krea2_Chars_LoRA (introvert7) | Colección de LoRA de personaje | KREA2 | 84 | safetensors | apache-2.0 | no disponible |
| Colecciones de LoRA de personaje para SDXL | Colección de LoRA de personaje | SDXL | no disponible | safetensors / safetensors con carpeta | variable según autor | no disponible |
| Colecciones de LoRA de personaje para Flux | Colección de LoRA de personaje | Flux.1 | no disponible | safetensors | variable según autor | no disponible |

## Limitaciones y advertencias

- Derechos de imagen y de personalidad: los 84 personajes corresponden a personas reales identificables (figuras públicas y celebridades). La licencia apache-2.0 cubre los pesos del adaptador, pero no autoriza el uso de la imagen de esas personas. El uso comercial o la publicación de material generado puede infringir derechos de imagen, de marca o de privacidad según la jurisdicción.
- Contenido para adultos: entre los personajes listados aparecen nombres asociados a la industria del entretenimiento para adultos, lo que exige revisión previa antes de desplegar el repositorio en cualquier producto o servicio accesible a menores.
- Dataset obtenido por scraping sin revisión humana: el pipeline no tiene puertas de revisión manual en ningún punto. Las imágenes se recolectaron de bancos de fotos web, lo que puede incluir material con derechos de autor, datos personales (riesgo relevante bajo el RGPD en la UE) o imágenes obtenidas sin consentimiento.
- Filtros automáticos no infalibles: el cribado depende de detección YOLO, de un filtro de contenido y de un discriminador estético basado en ERNIE. Estos componentes pueden dejar pasar sujetos incorrectos, imágenes borrosas o material generado por IA pese a la prohibición explícita.
- Riesgo de sobreajuste y deriva de identidad: al tratarse de LoRA de rango bajo y con 8 bloques podados, es esperable cierta pérdida de fidelidad en poses extremas, iluminaciones difíciles u oclusiones faciales. No hay métricas publicadas que cuantifiquen esta pérdida.
- Idiomas: no se documenta ningún idioma soportado para los prompts; dependerá del codificador de texto del modelo base, sobre el que no hay información.
- Ausencia de validación por la comunidad: el repositorio registra 0 descargas y 0 likes en la información consultada, por lo que no existe evidencia externa de calidad ni de reproducibilidad.
- Dependencia del modelo base: no se detallan las características ni la licencia de KREA2. Antes de un uso en producción hay que verificar que la licencia del modelo base permita crear y distribuir derivados, y que la combinación de ambas licencias sea compatible con el uso previsto.
- Fechas anómalas e incoherencias de metadatos: las fechas de creación y actualización figuran como 2026-09-22, y las imágenes de previsualización se sirven desde el espacio de nombres `UntMods/Krea2_Chars_LoRA` mientras que el repositorio declarado es `introvert7/Krea2_Chars_LoRA`. Conviene confirmar la fuente canónica antes de integrar el modelo.
- Sin información sobre cuantizaciones: al no existir variantes GGUF o FP8 documentadas, el despliegue en hardware limitado queda sujeto a lo que ofrezca el ecosistema de KREA2.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/introvert7/Krea2_Chars_LoRA
- Hermes Agent (Nous Research), agente que generó el repositorio: https://hermes-agent.nousresearch.com
- Modelo base KREA2: no disponible en la información proporcionada
- Paper o informe técnico: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Búsqueda web: los resultados devueltos no guardan relación con este modelo (corresponden a páginas de ChatGPT), por lo que no aportan enlaces utilizables.
