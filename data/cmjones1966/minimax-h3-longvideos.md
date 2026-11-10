# cmjones1966/MiniMax-H3-Longvideos

## Resumen

MiniMax-H3-Longvideos es un nodo personalizado para ComfyUI, publicado por el usuario cmjones1966, que extiende las capacidades del modelo generativo MiniMax-H3 para producir vídeos de larga duración con audio sincronizado a partir de un único prompt de texto. MiniMax-H3, el modelo base sobre el que opera, renderiza como máximo unos 15 segundos de vídeo por pasada; este nodo resuelve esa limitación descomponiendo una escena escrita en "beats" (compases narrativos), renderizando cada plano por separado y uniéndolos posteriormente en un único vídeo con una banda sonora coherente.

El nodo no es un modelo de pesos en sí mismo, sino una herramienta de orquestación: el repositorio de Hugging Face tiene un tamaño de 0.0 GB y no contiene pesos publicados. Su función es gestionar el pipeline de generación sobre MiniMax-H3 dentro de ComfyUI, incluyendo la planificación de planos, la coherencia de personajes y vestuario entre planos, el lip-sync de las líneas de diálogo y la continuidad de color y fondo entre tomas.

La relevancia de esta ficha es limitada en términos de evaluación de modelo, ya que se trata de un nodo de terceros con licencia restrictiva (`h3-longvideos-no-redistribution`), sin descargas ni likes en el momento de la consulta, y con una model card que documenta el funcionamiento del nodo pero no las especificaciones técnicas del modelo MiniMax-H3 subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nodo orquesta el modelo MiniMax-H3; no se documenta la arquitectura del modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el nodo limita cada plano a un máximo de 15 segundos de vídeo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `h3-longvideos-no-redistribution` (licencia personalizada, categoría "other") |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño 0.0 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo MiniMax-H3 subyacente ni sobre sus datos de entrenamiento. La model card del nodo describe exclusivamente el funcionamiento del pipeline de orquestación, no las características del modelo generativo.

El nodo implementa un pipeline de cinco fases: planificación (cada párrafo del prompt se convierte en un beat y en un plano de al menos 5.2 segundos), escritura (generación del texto de cada plano con notas de continuidad de vestuario y encuadre), renderizado (cada plano comienza en el último fotograma del anterior para mantener la continuidad), sonido (cada línea hablada recibe un tramo de audio con lip-sync, y los planos sin diálogo se renderizan en silencio con una segunda pasada solo de audio) y unión (igualación de color, contraste y nitidez entre planos, con arrastre del fondo estático). El nodo requiere ComfyUI con soporte nativo de MiniMax-H3, un VAE de vídeo completo (no un VAE solo decodificador), un VAE de audio separado y el codificador de texto de H3 cargado con tipo `minimax`. Admite LoRAs de velocidad, Hyperflow y FastH3 sin cableado adicional, y opcionalmente `MiniMaxH3PDDAccApply` para aceleración.

## Capacidades

- Generación de vídeo texto-a-vídeo de larga duración mediante composición de planos de hasta 15 segundos cada uno.
- Generación de audio sincronizado con lip-sync por línea de diálogo.
- Coherencia de personajes y vestuario entre planos mediante `character_memory` y etiquetas de continuidad (`hold`, `release`, `remove`, `wear`, `lift`, `tear`, `exit`).
- Control de continuidad de escena: cada plano arranca en el último fotograma del anterior, salvo que se indique `cut`.
- Soporte de imágenes de referencia por personaje (`ref_image_1` a `ref_image_4`), con recorte automático a cara y pelo si se instala `comfyui_controlnet_aux` con los archivos DWPose.
- Control de duración por beat mediante la línea `seconds: N`.
- Soporte de primer fotograma opcional (`first_frame`) para arrancar la primera toma.
- Integración con ComfyUI mediante nodos: `UNETLoader`, `CLIPLoader`, `VAELoader` (vídeo y audio), nodo de texto y salidas `images`, `audio`, `info` y `script`.
- No se documentan capacidades multilingües, tool calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Producción de cortometrajes narrativos: el nodo permite escribir una escena completa como secuencia de beats y obtener un vídeo unificado con diálogos lip-sincronizados, adecuado para prototipado rápido de guiones en preproducción.
- Generación de escenas dialogadas con continuidad de vestuario: gracias a las etiquetas `wear`, `remove` y `hold`, se pueden construir secuencias donde un personaje se quita una prenda entre planos sin perder coherencia visual, útil para demostraciones de vestuario o narrativa visual.
- Creación de vídeos explicativos con audio integrado: cada línea hablada recibe su propio tramo de audio sincronizado, lo que permite generar piezas divulgativas o formativas con voz y labios coordinados a partir de un guion textual.
- Prototipado de storyboards animados: la planificación por beats y la posibilidad de fijar duraciones (`seconds: N`) permiten generar versiones animadas de un storyboard para validar ritmo y puesta en escena antes de una producción real.
- Generación de contenido para redes sociales con escenas múltiples: la unión de planos con igualación de color y fondo facilita producir piezas de varios planos con aspecto coherente sin edición manual posterior.
- Investigación en generación de vídeo largo: el nodo sirve como banco de pruebas para estudiar la continuidad entre planos, el arrastre de fondo estático y la coherencia de identidad en modelos de vídeo generativo de corta ventana.
- Integración en flujos de ComfyUI para artistas técnicos: al ser un nodo nativo de ComfyUI, se puede encadenar con otros nodos de posprocesado, upscaling o composición dentro del mismo grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El nodo no publica pesos ni requisitos de memoria; depende enteramente de los requisitos del modelo MiniMax-H3 subyacente, que no se documentan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con soporte nativo de MiniMax-H3, instalando el nodo en `ComfyUI/custom_nodes/`. Se requieren `UNETLoader`, `CLIPLoader` (tipo `minimax`), `VAELoader` de vídeo completo y `VAELoader` de audio. Opcionalmente `comfyui_controlnet_aux` con DWPose para recorte de referencias, y `MiniMaxH3PDDAccApply` para aceleración.
- Latencia y throughput: no disponibles. El nodo renderiza plano a plano con un máximo de 15 segundos por plano, lo que implica un coste computacional proporcional al número de beats de la escena.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (nodos de orquestación de vídeo largo sobre modelos generativos de vídeo) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- El repositorio no contiene pesos (tamaño 0.0 GB); es únicamente un nodo de orquestación que requiere el modelo MiniMax-H3 y sus VAE y codificador de texto por separado.
- Licencia restrictiva `h3-longvideos-no-redistribution`: no se permite la redistribución. Es imprescindible revisar el archivo `LICENSE` antes de cualquier uso, especialmente comercial.
- La model card advierte de que el nodo es un "trabajo en progreso constante" y que pueden aparecer fallos o funciones que no operen correctamente; se recomienda actualizar a la versión más reciente y revisar los flujos de trabajo.
- El nodo está marcado con la etiqueta `not-for-all-audiences`, lo que indica contenido potencialmente no apto para todas las audiencias; requiere evaluación de contenido en producción.
- La coherencia de personajes depende del uso correcto de `character_memory` y de las etiquetas de continuidad; un etiquetado incorrecto puede romper la continuidad de vestuario o de identidad entre planos.
- El recorte de referencias a cara y pelo solo funciona si `comfyui_controlnet_aux` está instalado con los archivos DWPose (`yolox_l.torchscript.pt` y `dw-ll_ucoco_384_bs5.torchscript.pt`); sin ellos, las imágenes se insertan completas.
- Se requiere un VAE de vídeo completo; un VAE solo decodificador no puede iniciar un plano en el último fotograma del anterior, lo que rompe la continuidad.
- No se documentan sesgos, riesgo de alucinación, limitaciones de idioma ni rendimiento comparado; no hay datos para evaluarlos.
- La model card incluye una nota del autor sobre la inclusión en lista negra de "RealRebelAI" por apropiación de trabajo ajeno, un conflicto entre desarrolladores que no afecta a la funcionalidad pero que conviene conocer.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cmjones1966/MiniMax-H3-Longvideos
- Modelo híbrido fl2va/ref2va recomendado por el autor: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Página de apoyo del autor (Ko-fi): https://ko-fi.com/smite79
