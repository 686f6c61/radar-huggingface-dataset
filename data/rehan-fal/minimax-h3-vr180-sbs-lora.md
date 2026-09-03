# rehan-fal/minimax-h3-vr180-sbs-lora

## Resumen

El modelo `rehan-fal/minimax-h3-vr180-sbs-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo base MiniMax H3 (Hailuo 3.0), desarrollado por MiniMax. Su función es transformar el generador de vídeo omni-modal de MiniMax H3 en un generador de vídeo VR180 estereoscópico: cada fotograma contiene la vista del ojo izquierdo en la mitad izquierda y la del ojo derecho en la mitad derecha, con una geometría de 180°×180° por ojo (semi-equirectangular). El resultado, tras un postprocesado sencillo, es un clip de vídeo 3D-180 listo para reproducirse en visores de realidad virtual como Quest, DeoVR o Skybox.

El adaptador se distribuye como un repositorio PEFT de 0.1 GB y se integra directamente en el pipeline de fal.ai para MiniMax H3, tanto en el endpoint de texto a vídeo como en el de entrenamiento. Su relevancia radica en que permite a desarrolladores y creadores generar contenido estereoscópico de alta calidad sin necesidad de cámaras VR180 dedicadas, aprovechando las capacidades nativas de MiniMax H3 (vídeo con audio estéreo, hasta 2K y 15 segundos). El LoRA fue entrenado sobre 50 clips de vídeo VR180 reales extraídos de YouTube, con un coste de entrenamiento de aproximadamente 12,50 USD en una GPU H200.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre MiniMax H3 (modelo omni-modal basado en DiT con 50 bloques) |
| Parametros totales | no disponible (repo de 0.1 GB, rango LoRA 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible (el adaptador se usa con el modelo base, que admite cuantizacion) |
| Idiomas soportados | no disponible (el modelo base MiniMax H3 soporta multiples idiomas, pero no se especifica para este adaptador) |
| Licencia | minimax-community-license (con clausulas de atribucion y restricciones territoriales/ingresos) |
| Formato de pesos | safetensors (via PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 (alpha = rank) aplicado a las proyecciones de atención `qkv_proj` y `out_proj` de todos los 50 bloques DiT del modelo base MiniMax H3, más los 2 bloques de text token-refiner. El entrenamiento se realizó con pérdida rectified-flow sobre vídeo y audio de forma conjunta, usando AdamW con tasa de aprendizaje 2e-4 y decaimiento lineal, batch de 1 y 2500 pasos (aproximadamente 3.9 horas en una H200). Los datos de entrenamiento consistieron en 50 clips de 5.3 segundos extraídos de 27 vídeos VR180 reales de YouTube, seleccionados mediante el índice Stereo4D de Google. Cada clip fue preprocesado para ajustarse exactamente al bucket de 896×384×124 fotogramas a 24 fps, manteniendo el audio estéreo a 32 kHz. Las descripciones (captions) se generaron con Gemini 3.5 Flash Lite a través de fal, incluyendo una frase de activación constante (`vr180sbs`) y una oración de layout que describe la disposición side-by-side. El entrenamiento se realizó en la plataforma fal con el trainer `fal-ai/minimax-h3-trainer`.

## Capacidades

- Generación de vídeo VR180 estereoscópico side-by-side: cada fotograma contiene las vistas izquierda y derecha de la misma escena con disparidad horizontal (3–7 px por ojo en objetos cercanos, ~0 en el fondo).
- Mantiene el audio nativo de MiniMax H3 (estéreo) en el vídeo generado.
- Compatible con el trigger `vr180sbs` al inicio del prompt, seguido de la descripción de la escena.
- Funciona con la geometría 21:9 y resolución 768P (nativa); las rutas de 2K/4K en fal son upscales de la pasada 768P y no se evaluaron para consistencia estéreo.
- Se integra con el endpoint de fal `minimax/h3/text-to-video/lora` y acepta el ID del repositorio o una URL directa a `.safetensors`.
- Permite generar clips de hasta 15 segundos manteniendo el par estéreo intacto (en la ruta `minimax/h3`).
- No requiere hardware especializado para el adaptador en sí; la inferencia depende del modelo base MiniMax H3.

## Casos de uso

- Creación de contenido VR para plataformas de vídeo: generar clips VR180 para YouTube VR, DeoVR o Skybox, con audio estéreo nativo, sin necesidad de cámaras 360/VR180.
- Prototipado rápido de experiencias inmersivas: diseñadores de experiencias de realidad virtual pueden generar storyboards en 3D-180 a partir de prompts de texto para validar conceptos antes de la producción real.
- Turismo virtual y visitas guiadas: crear recorridos virtuales de lugares (playas, parques, museos) con sensación de profundidad, adecuados para aplicaciones de turismo inmersivo.
- Entrenamiento y simulación: generar escenarios estereoscópicos para simuladores de entrenamiento (por ejemplo, primeros auxilios, seguridad laboral) donde la percepción de profundidad es crítica.
- Marketing y publicidad inmersiva: producir anuncios o demostraciones de productos en formato VR180 para ferias, showrooms o catálogos digitales.
- Investigación en visión estereoscópica: servir como herramienta para estudiar la generación de disparidad y consistencia estéreo en modelos generativos, dado que el adaptador está entrenado con datos reales validados.
- Postproducción de vídeo: generar tomas de relleno o transiciones en VR180 para proyectos de cine o vídeo, integrando el adaptador en pipelines de edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una evaluación A/B con 4 prompts y 1 semilla, donde el adaptador produjo pares estéreo correctos en 4/4 casos (frente a 1/4 en un piloto de 1000 pasos y 0/4 en un piloto con geometría 16:9). No hay métricas cuantitativas como MMLU, HumanEval o similares, ya que se trata de un adaptador de generación de vídeo.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (0.1 GB) y no requiere VRAM adicional significativa; se carga junto con el modelo base.
- La inferencia requiere el modelo base MiniMax H3, que es un modelo omni-modal de gran tamaño. No se especifican requisitos exactos de VRAM, pero se recomienda usar la infraestructura de fal.ai (que ofrece GPUs H200) para ejecutar el pipeline completo.
- En local, se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090) para cargar el modelo base en cuantización baja, aunque no se ha verificado oficialmente.
- Opciones de despliegue: el adaptador está diseñado para usarse a través de la API de fal (`queue.fal.run/minimax/h3/text-to-video/lora`). También se puede integrar en pipelines de PEFT con el modelo base si se dispone de los recursos.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de fal.

## Comparativa con modelos similares

No se han encontrado otros adaptadores LoRA específicos para VR180 sobre MiniMax H3 en la información disponible. Como referencia, se compara con el modelo base MiniMax H3 y con alternativas genéricas de generación de vídeo:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 (base) | Omni-modal (texto, imagen, vídeo, audio) | no disponible | multimodal | MiniMax Community License | Open weights en HuggingFace |
| rehan-fal/minimax-h3-vr180-sbs-lora | LoRA sobre MiniMax H3 | no disponible (rango 32) | depende del base | minimax-community-license | Repositorio HuggingFace |
| Wan 2.1 (por ejemplo) | Texto a vídeo | no disponible | no disponible | Apache 2.0 (algunas variantes) | Open weights |

La comparación directa no es posible porque el adaptador no es un modelo independiente, sino una extensión especializada. Su ventaja es la capacidad estereoscópica, que no está presente en el modelo base ni en la mayoría de alternativas de código abierto.

## Limitaciones y advertencias

- Viñetas oscuras excesivas en el borde exterior de cada ojo en algunos prompts, heredadas del metraje VR180 original.
- Sesgo hacia caminatas al aire libre en primera persona: una de las fuentes de datos aporta 20 de los 50 clips, lo que puede influir en el estilo de los resultados.
- Texto y caras: la calidad es la misma que la del modelo base MiniMax H3, no mejorada por el adaptador.
- Los barridos rápidos de cámara pueden provocar deriva entre los ojos (inconsistencia estéreo).
- Evaluación limitada: solo se probó con 4 prompts y 1 semilla; se recomienda verificar en un visor antes de usar en producción.
- La licencia MiniMax Community License incluye cláusulas de atribución y restricciones territoriales y de ingresos; es necesario revisarlas antes de un uso comercial.
- Los clips de entrenamiento se descargaron de YouTube bajo licencia estándar para investigación y no se redistribuyen; el adaptador aprende la disposición y proyección, no el contenido de los vídeos.
- No se garantiza la consistencia estéreo en las rutas de upscale 2K/4K de fal, ya que no fueron evaluadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora
- Modelo base MiniMax H3 en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GitHub de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Blog de MiniMax sobre H3: https://www.minimax.io/blog/minimax-h3
- Guía de prompting de MiniMax H3 en fal: https://fal.ai/learn/devs/minimax-h3-prompting-guide
- Herramienta spatial-media de Google (para empaquetado VR): https://github.com/google/spatial-media
- Índice Stereo4D (fuente de datos de entrenamiento): https://stereo4d.github.io
