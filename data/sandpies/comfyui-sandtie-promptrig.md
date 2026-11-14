# sandpies/ComfyUI-SandTie-PromptRig

## Resumen

SandTie PromptRig (H3) es un nodo personalizado para ComfyUI desarrollado por el usuario sandpies. No es un modelo de lenguaje ni un modelo generativo en sí mismo, sino una herramienta de ingeniería de prompts que automatiza la construcción de las estructuras de texto que exige MiniMax H3 (también conocido como Hailuo H3), el modelo de generación de vídeo de Comfy-Org sobre el que se apoya como base. Su función es transformar la escritura manual de prompts de seis campos en un flujo guiado mediante diales, presets y plantillas.

El problema que resuelve es concreto: MiniMax H3 requiere prompts con una estructura estricta de seis campos (`subject_definitions:`, `summary:`, `retention_analysis:`, `detailed_description:`, `overall_soundscape:`, `non_diegetic_music:`), un enlazado limpio de referencias `<Picture N>`, `<Subject N>` y `<Audio N>`, ausencia de negaciones fuera de las etiquetas de diálogo `<d>`, y un ritmo de beats en formato `MM:SS.mmm`. Escribir esto a mano es propenso a errores; este nodo lo genera de forma determinista o asistida por un LLM local.

El nodo se publica como un custom node de ComfyUI con licencia MIT, sin dependencia del proyecto hermano ComfyUI-Hand-Tie-Clips, y con soporte para múltiples modos de autoría (CPU determinista, LLM local de una o dos pasadas, y extracción de beats desde vídeo de referencia con OpenCV). Su relevancia radica en que reduce la fricción para producir vídeo con MiniMax H3 en flujos de ComfyUI, sin necesidad de GPU adicional en el modo CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nodo personalizado de ComfyUI (V3); no es un modelo neuronal propio |
| Parametros totales | no disponible (no aplica; el nodo no contiene pesos propios) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (contador de encoder en vivo con límite de 7.000 caracteres) |
| Tipos de cuantizacion | no disponible (no aplica al nodo; depende del modelo H3 subyacente) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplica (nodo de Python para ComfyUI; sin safetensors ni GGUF propios) |

## Arquitectura y entrenamiento

El nodo no entrena ni contiene un modelo neuronal. Es una capa de software que envuelve el motor de autoría de prompts de ComfyUI-Hand-Tie-Clips y lo expone como un único nodo V3 de ComfyUI. Internamente ofrece tres modos de generación de prompt: un ensamblador determinista en CPU (modo `CPU Tie`, sin VRAM), una llamada opcional a un servidor local compatible con OpenAI (LM Studio, nInfer, llama.cpp, vLLM) con salida estructurada y una segunda pasada de verificación de continuidad (`Double-Knot`), y un extractor de beats a 30 FPS basado en OpenCV que analiza un vídeo de referencia para derivar cadencia de movimiento, trayectoria de cámara y cortes.

El nodo implementa reglas específicas de MiniMax H3: eliminación de negaciones fuera de etiquetas `<d>`, limpieza automática de texto TTS en formato `<d>[voice] "..."</d>`, eliminación de punto y coma y marcas de habla en los campos `overall_soundscape:` y `non_diegetic_music:`, doce primitivas de movimiento H3, y leyes de amplitud para rango abierto y placa de fondo. Incluye además un contador en vivo del límite de 7.000 caracteres del encoder. La integración con el modelo base se realiza mediante dos modos de cableado: salida de `prompt` (STRING) hacia nodos estándar de H3, o salida directa de `positive` (CONDITIONING) y `latent` (LATENT) hacia `BasicGuider` y `SamplerCustomAdvanced`.

## Capacidades

- Generación determinista de prompts de seis campos para MiniMax H3 en modo CPU, sin uso de VRAM.
- Generación asistida por LLM local con salida estructurada y segunda pasada de verificación de continuidad.
- Extracción de beats y trayectorias de cámara desde vídeo de referencia `.mp4` con OpenCV a 30 FPS, con recorte IN/OUT.
- 19 diales de dirección en dos niveles (8 primarios y 11 en cajón de óptica, grado y audio), con 61 opciones en el dial de iluminación.
- 33 presets integrados, Surprise Roll con bloqueo de dominio y aspecto (16:9 y 9:16), Match Dials por palabras clave y Compose Brief.
- 22 guiones de demostración y reescritura de diálogo (`Fresh Dialogue`).
- Sockets dinámicos `Autogrow`: de 1 a 9 imágenes de referencia, 3 vídeos y 3 audios de referencia.
- Biblia de referencias persistente (`S1..S9`) con Eye Scan de 2,5 MP en caché y asignación de voces `.wav`.
- Soporte de los seis formatos de salida de H3: `Ref2VA`/`T2VA`, `I2VA`, `FL2VA`, `L2VA`, `Start Frame Prep` (`p-h3-image`) y `Storyboard Beats Only`.
- Integración con servidores locales compatibles con OpenAI (LM Studio, nInfer, llama.cpp, vLLM) para los modos de una y dos pasadas.

## Casos de uso

- Producción de vídeo con MiniMax H3 en ComfyUI: el nodo genera el prompt de seis campos que exige el modelo y lo inyecta directamente en `MiniMaxH3ReferenceToVideo.prompt` o `ImageToVideo.prompt`, eliminando la escritura manual y los errores de formato.
- Flujos con múltiples referencias visuales: los sockets `Autogrow` permiten conectar hasta 9 imágenes, 3 vídeos y 3 audios de referencia, y la Biblia persistente reutiliza el reparto entre flujos sin reconstruir árboles de `LoadImage`.
- Generación de storyboards con ritmo temporal: el extractor `Video -> Beats` convierte un vídeo de referencia en beats `[Shot N]` con cadencia y cortes, útil para replicar la estructura de un anuncio o escena existente.
- Automatización de pipelines de vídeo sin GPU dedicada: el modo `CPU Tie` produce prompts deterministas sin VRAM, adecuado para entornos de CI o servidores sin acelerador.
- Asistencia con LLM local para prompts complejos: el modo `Plan -> Write` con `Double-Knot` permite generar y verificar la continuidad de prompts largos usando LM Studio o vLLM en local, sin depender de APIs externas.
- Estandarización de prompts en equipos: los 33 presets y los diales de dirección permiten que varios operadores produzcan prompts coherentes con el mismo estilo, iluminación y formato de salida.
- Preparación de fotogramas iniciales: el formato `Start Frame Prep` (`p-h3-image`) genera la estructura necesaria para flujos de imagen a vídeo con ancla en `0.00 seconds`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en modo `CPU Tie`: 0 VRAM, según declara el autor.
- VRAM en modo directo: depende del modelo MiniMax H3 subyacente y del CLIP/VAE conectados; el nodo no especifica cifras.
- GPU recomendadas: no disponible. El nodo no impone requisitos de GPU propios; los requisitos vienen determinados por el modelo H3 y el servidor LLM local opcional.
- Compatibilidad con GPU de consumo: no disponible para el modelo base; el nodo en sí puede ejecutarse en CPU.
- Opciones de despliegue: ComfyUI v0.38.0 o superior; para el modo LLM, cualquier servidor compatible con OpenAI (LM Studio, nInfer, llama.cpp, vLLM).
- Latencia y throughput: no disponible. El autor describe el modo CPU como instantáneo, sin cifras concretas.

## Comparativa con modelos similares

| Herramienta | Tipo | Dependencia del modelo base | Modos de autoría | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SandTie PromptRig (H3) | Custom node ComfyUI | MiniMax H3 (Comfy-Org) | CPU determinista, LLM local 1-2 pasadas, extracción de vídeo | MIT | Hugging Face y GitHub |
| ComfyUI-Hand-Tie-Clips | Motor de cadena multi-hop | MiniMax H3 (Comfy-Org) | Motor completo de autoría | no disponible | GitHub |
| Escritura manual de prompts H3 | Ninguna | MiniMax H3 (Comfy-Org) | Manual | no aplica | no aplica |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce vídeo ni texto por sí mismo; depende de MiniMax H3 y de ComfyUI para funcionar.
- Requiere ComfyUI v0.38.0 o superior; versiones anteriores no son compatibles.
- El modo LLM local requiere un servidor externo compatible con OpenAI correctamente configurado (URL, modelo y ruta); sin él, solo están disponibles el modo CPU y la extracción de vídeo.
- El contador de encoder está limitado a 7.000 caracteres; prompts más largos pueden truncarse o rechazarse.
- La calidad de los prompts generados en modo CPU es determinista y basada en reglas, no en comprensión semántica; puede ser menos flexible que la generación asistida por LLM.
- El proyecto tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan sesgos, riesgos de alucinación ni restricciones de idioma del nodo; al delegar en H3, hereda las limitaciones del modelo base.
- La licencia MIT permite uso comercial del nodo, pero el uso comercial de MiniMax H3 y de ComfyUI depende de sus propias licencias, no especificadas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/sandpies/ComfyUI-SandTie-PromptRig
- Repositorio GitHub: https://github.com/sandpies/ComfyUI-SandTie-PromptRig
- Motor multi-hop relacionado: https://github.com/sandpies/ComfyUI-Hand-Tie-Clips
- Modelo base MiniMax H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
