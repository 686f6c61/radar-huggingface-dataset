# MATLOWAI/MiniMax-H3-ORB360-CardSpin

## Resumen

MiniMax-H3-ORB360-CardSpin es una colección de LoRAs de rango 32 desarrolladas por MATLOWAI sobre el modelo base MiniMax-H3 de MiniMaxAI, orientadas a la generación de vídeo imagen-a-vídeo con control explícito de cámara. El adaptador principal (`minimax_h3_orb360_step1500.safetensors`) produce una órbita circular completa de 360 grados en sentido horario alrededor de un sujeto congelado a partir de una única fotografía de referencia. Los ficheros CardSpin añaden, además, la capacidad de girar la imagen en el espacio como si fuera una tarjeta física delgada.

El modelo resuelve un problema concreto en el pipeline de vídeo generativo: conseguir novedades de vista (novel view synthesis) con trayectorias de cámara controladas y estables, sin deriva del sujeto y manteniendo el detalle de la escena original. Frente a los LoRAs de órbita anteriores, el adaptador entrenado a 1500 pasos sobre renders de Blender en alta resolución casi duplica el detalle fino medido (varianza laplaciana de 56,1 frente a 30,2 del checkpoint de 750 pasos).

Los adaptadores se distribuyen como safetensors independientes que se cargan sobre MiniMax-H3 mediante musubi-tuner o ComfyUI. El repositorio ocupa 1,8 GB y acumula más de 5200 descargas y 64 likes desde su publicación a finales de septiembre de 2026. La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre el modelo base MiniMax-H3 (arquitectura del base: no disponible) |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 sobre MiniMax-H3 en su variante Ref2VA (referencia a vídeo con audio, según la nomenclatura del autor). El entrenamiento del ORB360 principal se realizó durante 1500 pasos sobre órbitas de Blender en alta resolución, con alturas de cámara que van desde por debajo del sujeto hasta por encima, y con entre una y cuatro imágenes de referencia etiquetadas. El entrenamiento se hizo exclusivamente sobre renders de Blender con fondo gris, aunque el adaptador generaliza a fotografías reales conservando la escena original alrededor del sujeto.

Los ficheros CardSpin se construyen en dos etapas: el checkpoint de órbita (el antiguo LoRA de 750 pasos en el caso de v1, o el de 1500 pasos en v2) más 50 pasos adicionales sobre un único clip de entrenamiento de card-spin. Esa segunda fase tiene un efecto colateral medible: los dos ficheros CardSpin conservan solo alrededor de un tercio del detalle fino del checkpoint de 1500 pasos y se alejan más de la fotografía original en el primer fotograma. El autor documenta esta degradación con estadísticas por fotograma (varianza laplaciana, energía de bordes de Tenengrad, proporción de alta frecuencia y PSNR/SSIM del primer fotograma frente a la foto).

## Capacidades

- Generación de vídeo imagen-a-vídeo con órbita de cámara de 360 grados en sentido horario alrededor de un sujeto congelado a partir de una sola foto.
- Control de altura de cámara en la órbita (desde ángulos por debajo del sujeto hasta por encima), según el rango visto en entrenamiento.
- Soporte de una a cuatro imágenes de referencia etiquetadas en la entrada.
- Efecto card-spin: rotación de la fotografía en el espacio como una tarjeta física delgada (solo con los ficheros CardSpin).
- Conservación de la escena real de fondo al aplicar la órbita sobre fotografías (no solo sobre fondos neutros).
- Integración con musubi-tuner y ComfyUI.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo: es un adaptador de generación de vídeo, no un modelo de lenguaje.

## Casos de uso

- Novela de vista para fotografía de producto: a partir de una única imagen de un objeto se genera una órbita de 360 grados que permite al cliente inspeccionarlo desde todos los ángulos, usando el checkpoint de 1500 pasos por su mayor nitidez.
- Creación de contenido para redes sociales: el efecto card-spin convierte un retrato o una foto plana en un clip llamativo donde la imagen gira en el espacio, adecuado para publicaciones de formato corto.
- Previsualización de assets 3D: generar órbitas de referencia sobre renders de Blender con fondo neutro para validar encuadres y alturas de cámara antes de un render final costoso.
- Restauración y animación de archivo fotográfico: aplicar la órbita sobre retratos históricos o fotografías antiguas, un escenario que el propio autor documenta con un retrato de 1867 de Sir John Herschel.
- Turismo y patrimonio: orbitar alrededor de objetos o escenas fotografiadas para producir vídeos inmersivos de piezas de museo o monumentos con una sola captura.
- E-commerce y catálogos: generar automáticamente vistas giratorias de artículos a partir del catálogo fotográfico existente, reduciendo la necesidad de sesiones de fotografía multivista.
- Prototipado en pipelines de vídeo generativo: usar el adaptador como componente de control de cámara dentro de flujos musubi-tuner o ComfyUI para experimentar con trayectorias de órbita antes de integrarlas en producción.

## Benchmarks y rendimiento

El autor publica métricas de calidad de imagen por fotograma sobre un mismo clip de órbita (misma foto, prompt, semilla, 1024 x 768, 124 fotogramas) comparando cuatro LoRAs. No son benchmarks estándar de la comunidad, sino estadísticas internas de nitidez y fidelidad.

| Metrica (gato blanco, orbita 360) | Orbita 750 pasos (antiguo) | CardSpin v1 (750 + 50) | ORB360 1500 pasos | CardSpin v2 (1500 + 50) |
|---|---|---|---|---|
| Detalle fino (varianza laplaciana) | 30,2 | 19,8 | 56,1 | 20,7 |
| Detalle relativo al paso 1500 | 0,54x | 0,34x | 1,00x | 0,35x |
| Energia de bordes (Tenengrad) | 1098 | 809 | 1343 | 841 |
| Proporcion de alta frecuencia | 0,0035 | 0,0028 | 0,0050 | 0,0029 |
| Primer fotograma vs foto, PSNR / SSIM | 28,0 dB / 0,87 | 24,5 dB / 0,85 | 28,5 dB / 0,87 | 22,5 dB / 0,77 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un adaptador de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del modelo base MiniMax-H3, cuyos requisitos no se detallan en la model card.
- GPU recomendadas: no disponible. El autor no especifica hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: musubi-tuner y ComfyUI, según las etiquetas y la documentación del autor.
- Latencia y throughput: no disponible. Los clips de ejemplo se generan a 1024 x 768, 124 fotogramas y 20 pasos de muestreo, pero no se publican tiempos de ejecución.
- Espacio en disco: el repositorio completo ocupa 1,8 GB, repartido entre los tres safetensors y los assets de ejemplo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-ORB360-CardSpin (este) | LoRA rango 32 sobre MiniMax-H3 | no disponible | no disponible | Órbita 360 y card-spin controlados | MiniMax-H3 Community License | Hugging Face |
| MiniMax-H3-ORB360 paso 750 (versión anterior del mismo autor) | LoRA sobre MiniMax-H3 | no disponible | no disponible | Órbita 360 a menor resolución | MiniMax-H3 Community License | No incluido en este repositorio |
| MiniMaxAI/MiniMax-H3 (base) | Modelo de vídeo generativo | no disponible | no disponible | Generación imagen-a-vídeo general | MiniMax-H3 Community License | Hugging Face |

No se dispone de información sobre otros adaptadores de órbita o control de cámara comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Los ficheros CardSpin degradan notablemente el detalle: conservan aproximadamente un tercio del detalle fino del checkpoint de 1500 pasos y se alejan más de la foto original en el primer fotograma. El autor recomienda usarlos solo para el efecto de tarjeta, no para órbitas limpias.
- El ORB360 principal se entrenó únicamente con renders de Blender de fondo gris; aunque generaliza a fotos reales, puede comportarse de forma imprevisible con escenas muy cargadas o sujetos ambiguos.
- El efecto card-spin surgió de un comportamiento inesperado del modelo (interpretar la fotografía como objeto en lugar de orbitar al sujeto), lo que sugiere cierta fragilidad en el control semántico de la instrucción.
- No hay información sobre sesgos, riesgo de alucinación visual (artefactos, deformaciones del sujeto) ni evaluación sistemática más allá de las métricas internas del autor.
- Los idiomas soportados no están documentados; los prompts de ejemplo están en inglés.
- La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estándar: es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales sobre el modelo base.
- El adaptador requiere el modelo base MiniMax-H3 y herramientas específicas (musubi-tuner o ComfyUI); no es un modelo autónomo.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Clip de ejemplo CardSpin v2: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_cardspin_v2_step50.mp4
- Clip de ejemplo órbita 1500 pasos: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_step1500.mp4
- Clip de ejemplo CardSpin v1: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_cardspin_step50.mp4
- Comparativa visual de detalle entre los cuatro LoRAs: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_detail_4way.jpg
- Licencia: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/blob/main/LICENSE
- musubi-tuner: no disponible enlace en la información proporcionada
- ComfyUI: no disponible enlace en la información proporcionada
