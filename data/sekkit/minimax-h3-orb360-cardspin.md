# sekkit/MiniMax-H3-ORB360-CardSpin

## Resumen

MiniMax-H3 ORB360: 360 orbit + CardSpin es una colección de adaptadores LoRA de rango 32 entrenados sobre el modelo base MiniMaxAI/MiniMax-H3, en su variante Ref2VA (referencia a vídeo con audio). El autor, sekkit, publica tres ficheros safetensors que añaden control de cámara explícito a la generación de vídeo imagen-a-vídeo: un LoRA de órbita circular de 360 grados alrededor de un sujeto congelado y dos variantes de "CardSpin" que hacen girar la fotografía de entrada en el espacio como si fuese una tarjeta física delgada.

El modelo no es un generador autónomo, sino un adaptador que modifica el comportamiento del modelo base MiniMax-H3. Su relevancia es práctica: resuelve el problema de obtener trayectorias de cámara orbitales limpias y reproducibles a partir de una sola imagen de referencia, algo que los modelos imagen-a-vídeo genéricos no garantizan sin control explícito. El repositorio ocupa 1,8 GB e incluye tres LoRAs diferenciados por número de pasos de entrenamiento y propósito.

La ficha describe únicamente lo que el autor documenta en la model card: no hay información sobre la arquitectura interna del modelo base, el número de parámetros, la longitud de contexto ni los idiomas soportados. Todos esos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre el modelo base MiniMaxAI/MiniMax-H3, variante Ref2VA |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base no se detalla) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiqueta `license: other`) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,8 GB |
| Rango del LoRA | 32 |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Pipeline | image-to-video |
| Librería declarada | minimax-h3 |
| Herramientas asociadas | musubi-tuner, ComfyUI |

## Arquitectura y entrenamiento

El adaptador se compone de tres ficheros LoRA de rango 32 entrenados sobre MiniMax-H3 Ref2VA. El fichero principal, `minimax_h3_orb360_step1500.safetensors`, se entrenó durante 1500 pasos sobre órbitas Blender de alta resolución con alturas de cámara que van de por debajo a por encima del sujeto, usando entre 1 y 4 imágenes de referencia etiquetadas. El entrenamiento se realizó exclusivamente con renders Blender sobre fondo gris, aunque el autor documenta que el LoRA conserva la escena real alrededor del sujeto cuando se aplica a fotografías.

Los dos ficheros CardSpin derivan del anterior: `minimax_h3_orb360_cardspin_v2_step50.safetensors` corresponde al paso 1500 más 50 pasos adicionales sobre un único clip de card-spin; `minimax_h3_orb360_cardspin_step50.safetensors` es la versión original, construida sobre un LoRA de órbita antiguo de 512 x 512 píxeles más los mismos 50 pasos. El autor señala que esos 50 pasos de card-spin reblandecen la imagen: ambos ficheros CardSpin conservan aproximadamente un tercio del detalle fino del paso 1500 y se alejan más de la fotografía original en el primer fotograma. No se documenta el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo imagen-a-vídeo con trayectoria de cámara orbital de 360 grados en sentido horario alrededor de un sujeto congelado (prompt `ORB360_CW`).
- Control de altura de cámara durante la órbita, desde posiciones por debajo hasta por encima del sujeto.
- Aceptación de entre 1 y 4 imágenes de referencia etiquetadas para condicionar la generación.
- Efecto CardSpin: rotación de la fotografía de entrada en el espacio tridimensional como una tarjeta física delgada (prompt `ORB360_CARDSPIN`).
- Preservación de la escena real de fondo cuando se aplica a fotografías, pese al entrenamiento exclusivo con renders Blender sobre fondo gris.
- Integración con ComfyUI y con el ecosistema musubi-tuner.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni audio.

## Casos de uso

- Visualización de producto en 360 grados: a partir de una única fotografía de un objeto se genera una órbita completa y uniforme que permite al cliente inspeccionarlo desde todos los ángulos, gracias al entrenamiento específico sobre trayectorias orbitales de alta resolución.
- Fichas de catálogo para comercio electrónico: el LoRA de paso 1500 produce el mayor detalle fino medido (varianza laplaciana de 56,1 frente a 30,2 del paso 750), lo que se traduce en imágenes de producto nítidas para vídeos promocionales.
- Reconstrucción de novela vista para fotogrametría ligera: la órbita controlada con alturas variables permite generar vistas sintéticas coherentes de un sujeto para tareas de aumento de datos o previsualización 3D.
- Efecto creativo de "foto que gira": el CardSpin convierte un retrato o una imagen histórica en una animación donde la propia fotografía rota en el espacio, útil en piezas de motion graphics y contenido para redes sociales.
- Previsualización de escenas para producción audiovisual: generar una órbita alrededor de un sujeto antes de rodar permite validar encuadres y ángulos de cámara sin despliegue de equipo.
- Integración en pipelines de ComfyUI: el LoRA se carga como adaptador sobre MiniMax-H3 dentro de un flujo de trabajo nodular, lo que facilita encadenar la generación con etapas posteriores de posprocesado o montaje.
- Restauración y animación de material fotográfico histórico: el autor documenta el caso de un retrato de 1867 de Sir John Herschel que, al aplicarle el LoRA de órbita, produjo el efecto CardSpin, demostrando su utilidad para animar archivos fotográficos.

## Benchmarks y rendimiento

El autor publica métricas comparativas sobre el mismo caso (gato blanco, misma foto, mismo prompt, misma semilla, 1024 x 768, 124 fotogramas) entre cuatro LoRAs. Las cifras son estadísticas de imagen por fotograma promediadas sobre el clip.

| Métrica | Órbita paso 750 (antiguo) | CardSpin v1 (750 + 50) | ORB360 paso 1500 | CardSpin v2 (1500 + 50) |
|---|---|---|---|---|
| Detalle fino (varianza laplaciana) | 30,2 | 19,8 | 56,1 | 20,7 |
| Detalle relativo al paso 1500 | 0,54x | 0,34x | 1,00x | 0,35x |
| Energía de bordes (Tenengrad) | 1098 | 809 | 1343 | 841 |
| Proporción de alta frecuencia | 0,0035 | 0,0028 | 0,0050 | 0,0029 |
| Primer fotograma frente a la foto, PSNR / SSIM | 28,0 dB / 0,87 | 24,5 dB / 0,85 | 28,5 dB / 0,87 | 22,5 dB / 0,77 |

El autor destaca que el entrenamiento en alta resolución casi duplica el detalle fino respecto al paso 750 (1,85x, superior en los 124 fotogramas) y que los 50 pasos de card-spin reducen el detalle a aproximadamente un tercio del paso 1500. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable al tratarse de un adaptador de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MiniMax-H3, cuyos requisitos no se documentan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI y musubi-tuner son las herramientas mencionadas por el autor; no se detallan otras.
- Latencia y throughput: no disponibles. El autor documenta configuraciones de generación concretas (1024 x 768, 124 fotogramas, 20 pasos), pero no tiempos de ejecución ni hardware empleado.
- Tamaño en disco: 1,8 GB para el repositorio completo con los tres ficheros safetensors, más los pesos del modelo base.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (LoRAs de control de cámara orbital para generación imagen-a-vídeo) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Los ficheros CardSpin reblandecen la imagen de forma notable: conservan solo alrededor de un tercio del detalle fino del paso 1500 y el primer fotograma se aleja más de la fotografía original (PSNR de 22,5 dB frente a 28,5 dB en CardSpin v2).
- El LoRA de órbita se entrenó exclusivamente con renders Blender sobre fondo gris; su comportamiento sobre fotografías reales está documentado por el autor, pero no hay garantías de generalización a otros dominios visuales.
- El efecto CardSpin surgió de un comportamiento inesperado del LoRA de órbita sobre un retrato de 1867, no de un entrenamiento diseñado específicamente para ese fin, lo que sugiere un control limitado sobre el resultado.
- La licencia es la minimax-h3-community-license-agreement, no una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinación, limitaciones de contexto ni de idioma para este adaptador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02): no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El autor no documenta el número de parámetros del modelo base ni sus requisitos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sekkit/MiniMax-H3-ORB360-CardSpin
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Clip de CardSpin v2: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_cardspin_v2_step50.mp4
- Clip de órbita paso 1500: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_step1500.mp4
- Clip de CardSpin v1: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_cardspin_step50.mp4
- Clip de órbita con el fichero v1: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_step50.mp4
- Comparativa visual de detalle (cuatro LoRAs): https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_detail_4way.jpg
