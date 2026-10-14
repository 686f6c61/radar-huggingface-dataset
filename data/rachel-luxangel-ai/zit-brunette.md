# rachel-luxangel-ai/zit-brunette

## Resumen

`zit-brunette` es un adaptador LoRA de texto a imagen publicado por el usuario rachel-luxangel-ai sobre el modelo base Tongyi-MAI/Z-Image-Turbo. Su función es fijar la apariencia de un personaje concreto mediante el prompt de activación `adult woman, long wavy dark brown hair, fair warm skin`; el autor lo presenta como un rehost para LYRA del modelo 2988588 de CivitAI, rebautizado internamente como "Brooke".

El repositorio, creado el 13 de octubre de 2026 y actualizado un minuto después, ocupa 0,2 GB y contiene un único archivo de pesos, `brunette.safetensors`, con un SHA256 declarado. No se especifican licencia, idiomas soportados ni datos de entrenamiento, y el modelo acumula 0 descargas y 0 me gusta en HuggingFace, por lo que no existe validación alguna por parte de la comunidad.

Su interés práctico es acotado pero real: los LoRA de personaje permiten reutilizar la eficiencia de un modelo de difusión destilado para generar series de imágenes con identidad consistente sin reentrenar el modelo completo. Ahora bien, al tratarse de un rehost sin licencia declarada, cualquier uso en producción —y en particular el uso comercial— exige verificar antes los términos que el autor original haya fijado en CivitAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión texto a imagen Tongyi-MAI/Z-Image-Turbo. La model card no indica rango, alpha ni módulos objetivo. |
| Parametros totales | No disponible. El repositorio completo pesa 0,2 GB e incluye `brunette.safetensors` (SHA256 `712e2fabe1d91ca475c81a2bb0c486571c7032d5b83f13e3b389cd02bdec92b8`). |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos. |
| Longitud de contexto | No aplica (modelo de generación de imagen). Resolución de entrenamiento e inferencia: no disponible. |
| Tipos de cuantizacion | No disponible. Se distribuye únicamente en el formato del archivo safetensors publicado. |
| Idiomas soportados | No disponible. El prompt de activación está en inglés. |
| Licencia | No disponible: no se declara ni en la model card ni en los metadatos de HuggingFace. |
| Formato de archivo | safetensors (`brunette.safetensors`), integrado mediante la librería `diffusers`. |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas capas del difusion transformer del modelo base sin modificar sus pesos originales. La model card no documenta el rango, el valor de alpha, los módulos atacados (atención, proyecciones, etc.) ni la herramienta de entrenamiento empleada (kohya-ss, diffusers, ai-toolkit u otras). Tampoco hay información sobre el número de imágenes del dataset, resolución, pasos de entrenamiento, tasa de aprendizaje, proceso de captioning ni si se aplicaron técnicas de regularización como DreamBooth con clase previa.

El único metadato de entrenamiento disponible es el prompt de instancia o trigger (`adult woman, long wavy dark brown hair, fair warm skin`), que actúa como activador del concepto aprendido. El modelo base, Z-Image-Turbo, pertenece a la familia de modelos destilados para generar en pocos pasos de muestreo; este LoRA hereda esa característica, aunque el número de pasos, el scheduler y la escala de guiado recomendados para obtener buenos resultados no están documentados en la información disponible. Al ser un rehost, tampoco se reproduce la ficha técnica original del autor en CivitAI.

## Capacidades

- Generación de imágenes de una identidad concreta: reproduce los rasgos definidos por el trigger (mujer adulta, pelo castaño oscuro largo y ondulado, piel clara cálida) en distintas poses, encuadres e iluminaciones.
- Activación por prompt: el concepto se invoca incluyendo el prompt de instancia en la petición; su comportamiento sin ese prompt no está documentado.
- Integración vía `diffusers`: la etiqueta de la librería indica compatibilidad con las tuberías de difusión de HuggingFace, lo que permite cargarlo por código junto al modelo base.
- Combinación con otros adaptadores y con prompt negativo: no documentado explícitamente, pero es el uso habitual de este tipo de adaptadores en pipelines de difusión.
- Control de estilo contextual: el LoRA solo aporta identidad; el estilo, la composición, la iluminación y la calidad final dependen del prompt y del modelo base.
- Sin capacidades adicionales declaradas: no hay soporte documentado de img2img guiado, inpainting, ControlNet, edición por instrucciones, tool calling ni razonamiento multi-paso. No es un modelo de lenguaje.

## Casos de uso

- Ilustración seriada con personaje consistente: usar el mismo trigger, semilla fija y variaciones de prompt para producir varias escenas con una protagonista reconocible, útil en novelas visuales, webcómics o encargos por entregas.
- Hojas de personaje y previsualización de concept art: generar variaciones de vestuario, peinado y expresión sobre la misma identidad para presentar propuestas a un cliente antes de producir el arte final.
- Storyboards y guiones gráficos: generar viñetas rápidas donde la continuidad facial del personaje ayuda a leer la secuencia, con la ventaja de que un modelo destilado permite iterar muchas variantes en poco tiempo.
- Aumento de datos sintéticos: crear un conjunto homogéneo de imágenes de un mismo sujeto para probar sistemas de detección, segmentación o estimación de pose en un entorno controlado, siempre que la licencia lo permita.
- Pruebas de pipelines de difusión: validar la carga de adaptadores LoRA en `diffusers`, medir consumo de VRAM y tiempos de generación en hardware propio antes de desplegar un modelo mayor.
- Maquetas y material de marketing interno: avatares consistentes para prototipos de campaña, presentaciones o interfaces de demostración, evitando cualquier uso que implique atribuir la imagen a una persona real.
- Preproducción de animación o videojuegos: generar referencias de personaje para modeladores y artistas, que después trabajan sobre arte definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud facial u otras), no aporta imágenes de muestra y el repositorio registra 0 descargas y 0 me gusta, de modo que tampoco existe evaluación externa por parte de la comunidad.

## Requisitos de hardware

- Peso del adaptador: 0,2 GB de repositorio con un único archivo safetensors; irrelevante a efectos de VRAM, ya que el coste lo determina íntegramente el modelo base.
- VRAM de inferencia: no disponible para Z-Image-Turbo en la información facilitada. A modo de referencia orientativa y no verificada, un difusion transformer del orden de 6.000 millones de parámetros en fp16 ocupa aproximadamente 12 GB solo en pesos, más el VAE y las activaciones.
- GPU de consumo: con la hipótesis anterior, una GPU de 16-24 GB (RTX 4080, RTX 4090, RTX 5090) podría ejecutarlo en fp16, y una de 8-12 GB (RTX 3060 12 GB, RTX 4070) requeriría cuantización en fp8 o inferior. Estos cálculos no están confirmados por la documentación del modelo base.
- GPU de centro de datos: A100 o H100 no son necesarias para generar una imagen suelta; tienen sentido para generación por lotes o para servir varias peticiones concurrentes.
- Opciones de despliegue: `diffusers` es la vía declarada por el autor. `vLLM` y `TGI` no aplican (no es un modelo de lenguaje), y `llama.cpp` u `Ollama` tampoco son herramientas de difusión de imagen.
- Latencia y throughput: no disponible. La familia de modelos destilados tipo turbo suele resolverse en pocos pasos de muestreo, pero no hay cifras publicadas para este adaptador concreto.

## Comparativa con modelos similares

Los datos de las columnas de comparación proceden de la documentación pública de cada proyecto y no del material facilitado; conviene verificarlos antes de publicarlos como referencia.

| Aspecto | zit-brunette (Z-Image-Turbo) | LoRA de personaje sobre SDXL | LoRA de personaje sobre FLUX.1-dev |
|---|---|---|---|
| Modelo base | Tongyi-MAI/Z-Image-Turbo | Stability AI SDXL | black-forest-labs/FLUX.1-dev |
| Parámetros del modelo base | No disponible | Del orden de 3.500 M, dato público | Del orden de 12.000 M, dato público |
| Formato del adaptador | safetensors, librería `diffusers` | safetensors | safetensors |
| Licencia del adaptador | No disponible | Variable según el autor | Variable según el autor |
| Licencia del modelo base | No disponible | CreativeML OpenRAIL++-M | FLUX.1 [dev] Non-Commercial License |
| Ecosistema de herramientas | `diffusers` (según etiquetas) | Muy amplio: Automatic1111, ComfyUI, Forge | Amplio: ComfyUI, `diffusers` |
| Datos de uso publicados | 0 descargas, 0 me gusta, sin ejemplos | No aplica | No aplica |

Frente a los adaptadores de personaje para SDXL, la ventaja potencial de este LoRA es la eficiencia del modelo base destilado; su desventaja clara es la falta de licencia, de ejemplos y de validación comunitaria. Frente a FLUX.1-dev, el modelo base de Z-Image-Turbo es presumiblemente más ligero, aunque no se dispone de cifras para confirmarlo.

## Limitaciones y advertencias

- Licencia ausente: sin licencia declarada no puede asumirse permiso de uso comercial, redistribución o modificación. Lo prudente es tratarlo como "todos los derechos reservados" hasta confirmar los términos del autor original en CivitAI.
- Rehost sin permisos verificables: el propio autor indica que es un rehost, pero no adjunta la licencia ni la autorización del creador original, lo que añade incertidumbre legal.
- Sin validación: 0 descargas, 0 me gusta, ninguna imagen de muestra y ninguna evaluación independiente. La calidad real del adaptador es desconocida.
- Riesgo de semejanza con personas reales: un LoRA de retrato entrenado sobre una persona concreta puede reproducir su rostro, lo que plantea problemas de derecho a la propia imagen, consentimiento y suplantación, especialmente si se genera contenido sensible o engañoso.
- Sesgo de representación: el trigger fija rasgos específicos ("piel clara cálida", "pelo castaño oscuro ondulado"), de modo que la diversidad de salidas en etnia, edad y complexión queda restringida a lo presente en el dataset de entrenamiento.
- Sobreajuste: es esperable en adaptadores de personaje entrenados con pocos ejemplos; puede producir composiciones rígidas, fondos repetitivos y dificultad para integrar al personaje en escenas complejas.
- Artefactos propios de la difusión: manos, ojos, dientes, joyas y texto siguen siendo puntos débiles habituales. El "alucinamiento" aquí se manifiesta como detalles anatómicos o de textura incorrectos, no como afirmaciones falsas.
- Compatibilidad limitada: funciona únicamente con el modelo base Z-Image-Turbo. No es portable a SDXL, FLUX u otras arquitecturas sin reentrenamiento.
- Idioma: el prompt de activación está en inglés y no hay información sobre su comportamiento con prompts en castellano.
- Trazabilidad: conviene verificar el SHA256 del archivo antes de cargarlo, dado que un archivo safetensors puede contener código y procede de un repositorio sin reputación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rachel-luxangel-ai/zit-brunette
- Modelo original en CivitAI (referenciado como origen del rehost): https://civitai.com/models/2988588?modelVersionId=3388607
- Modelo base en HuggingFace: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
