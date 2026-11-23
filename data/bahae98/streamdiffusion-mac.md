# bahae98/streamdiffusion-mac

## Resumen

StreamDiffusion for Mac es un proyecto de inferencia de difusión en tiempo real para Apple Silicon, distribuido a través del repositorio `bahae98/streamdiffusion-mac` en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado desde cero, sino de un pipeline de transformación imagen-a-imagen sobre vídeo de cámara en directo, que combina modelos de difusión destilados (SDXS-512, SD-Turbo o Tiny-SD) convertidos a CoreML para aprovechar la GPU unificada de los chips M1 a M4. El autor original del código es ochyai (repo `ochyai/streamdiffusion-mac`), y esta entrada de Hugging Face actúa como punto de distribución del proyecto.

El problema que resuelve es la inferencia de difusión interactiva de baja latencia en hardware Apple, un ecosistema donde las técnicas habituales de optimización para CUDA no funcionan. El pipeline alcanza 22,7 FPS a 512x512 en un M3 Ultra con SDXS-512 (UNet de 328M parámetros, 24,4 ms por paso), y 15,4 FPS medidos en un M4 Max de 40 núcleos GPU. La arquitectura es un transformer de difusión latente (UNet) con destilación a un solo paso, VAE ligero TAESD y un esquema de triple hilo que desacopla captura, inferencia y visualización.

Su relevancia actual radica en que documenta empíricamente qué optimizaciones transfieren de CUDA a Metal y cuáles no: la conversión a CoreML aporta un +64% y los modelos destilados un +118%, mientras que la cuantización INT8 a 2 bits no aporta nada (el M3 Ultra está limitado por cómputo, no por ancho de banda de memoria) y el Neural Engine degrada el rendimiento entre un 19% y un 520%. Es, por tanto, una referencia técnica para quien quiera desplegar difusión en tiempo real en Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (SDXS-512, SD-Turbo o Tiny-SD) convertido a CoreML, con VAE ligero TAESD |
| Parametros totales | 328M (SDXS-512), 866M (SD-Turbo), 323M (Tiny-SD) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto); resolucion de render 512x512 por defecto, configurable a 384 |
| Tipos de cuantizacion | no disponible; el informe indica que la cuantizacion INT8 a 2 bits no aporta mejora en M3 Ultra |
| Idiomas soportados | no aplica (modelo de imagen); los prompts se interpretan en ingles segun los ejemplos de la model card |
| Licencia | no disponible |
| Formato de pesos | CoreML (conversion one-time desde los pesos originales de diffusers, ~5 minutos) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo nuevo: reutiliza modelos de difusion destilados de la familia Stable Diffusion. SDXS-512 es un UNet de 328M parametros destilado para denoising en un solo paso, lo que elimina la necesidad de un sampler multi-paso y reduce la latencia por frame a 24,4 ms en M3 Ultra. SD-Turbo (866M) ofrece 53,2 ms por paso y Tiny-SD (323M) 31,3 ms, con calidad "fair" frente a "good" en los otros dos. El VAE empleado es TAESD, una variante ligera que codifica y decodifica en aproximadamente 5 ms cada operacion.

La innovacion tecnica principal es el pipeline de tres hilos independientes: captura de camara a 30 FPS, inferencia CoreML y visualizacion a 30+ FPS, comunicados mediante frames compartidos. La coherencia temporal se consigue con tres mecanismos combinados: una semilla de ruido fija que elimina el parpadeo entre frames, un feedback latente del 30% del frame anterior mezclado en la entrada actual, y un suavizado EMA sobre la salida de visualizacion. El informe de optimizacion de 10 fases concluye que la conversion a CoreML es el unico metodo efectivo de aceleracion del UNet (+64%), que los modelos destilados aportan +118%, y que tecnicas como Token Merging (-10%), Attention Slicing (-40%), inferencia CoreML en paralelo (0%) o el Neural Engine (-19% a -520%) no funcionan en este hardware. No se dispone de informacion sobre el dataset de entrenamiento de los modelos subyacentes ni sobre fases de RLHF o DPO, ya que el proyecto no entrena modelos.

## Capacidades

- Transformacion imagen-a-imagen en tiempo real sobre video de camara, con estilos definidos por prompt de texto (oleo, acuarela, anime, etc.).
- Generacion de imagen condicionada por texto mediante difusion de un solo paso.
- Mezcla configurable entre la imagen original de camara y la salida IA (`--blend`), con ratios ajustables en caliente.
- Suavizado temporal mediante EMA y feedback latente para eliminar parpadeo.
- Galeria de prompts integrada con 10 estilos y cambio en caliente con las teclas `n`/`p`.
- Captura y guardado de frames individuales (`s`).
- Seleccion de dispositivo de camara (`--camera`), util con webcams USB externas.
- Ajuste de resolucion de render (512 por defecto, 384 para Macs de gama baja).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada arbitraria ni audio: es exclusivamente un pipeline de difusion imagen-a-imagen.

## Casos de uso

- Instalaciones artisticas interactivas: el pipeline transforma el video de una webcam en estilo pictorico a mas de 20 FPS en M3 Ultra, lo que permite que el publico vea su propio reflejo estilizado en tiempo real sin la latencia perceptible de los pipelines de difusion tradicionales.
- Filtros de video para streaming y videollamadas: con 22,7 FPS a 512x512 y mezcla configurable entre camara y salida IA, se puede integrar como capa de postprocesado en OBS o como filtro de camara virtual en macOS 14+.
- Prototipado rapido de estilos visuales: la galeria de 10 prompts y el cambio en caliente permiten evaluar direcciones artisticas sin reentrenar ni recompilar, util para estudios de diseno que necesitan validar un look antes de invertir en un pipeline de produccion.
- Investigacion en optimizacion de difusion sobre Metal: el informe de 10 fases documenta que tecnicas transfieren de CUDA y cuales no, lo que sirve como base reproducible para experimentos de latencia en Apple Silicon.
- Demos educativas de difusion: el script de conversion a CoreML tarda unos 5 minutos y el setup es reproducible con `setup.sh`, lo que facilita montar talleres practicos sobre modelos generativos en hardware de consumo Apple.
- Generacion de contenido para redes en movilidad: en un M4 Max de 40 nucleos GPU se sostienen 15,4 FPS medidos, suficiente para capturar clips estilizados en directo desde un portatil sin GPU dedicada.
- Pruebas de concepto de feedback latente: el esquema de semilla fija mas 30% de feedback latente mas EMA es un patron reutilizable para cualquier aplicacion de difusion sobre video que sufra parpadeo entre frames.

## Benchmarks y rendimiento

Rendimiento medido en Apple M3 Ultra (GPU de 60 nucleos, 512 GB de memoria unificada) y M4 Max, segun la model card:

| Modelo | Parametros | Latencia UNet | FPS de camara | Calidad |
|---|---|---|---|---|
| SDXS-512 | 328M | 24,4 ms | 22,7 | Good |
| SD-Turbo | 866M | 53,2 ms | 13,8 | Good |
| Tiny-SD | 323M | 31,3 ms | ~20 | Fair |

FPS esperados por chip (SDXS-512):

| Chip | FPS aproximados |
|---|---|
| M1 / M2 | 5-8 |
| M1 / M2 Pro | 8-12 |
| M1 / M2 / M3 Max | 12-18 |
| M4 Max (40 nucleos GPU, 128 GB) | 15,4 (medido) |
| M3 Ultra | ~22 |

Efecto de las tecnicas de optimizacion sobre el rendimiento:

| Tecnica | Efecto | Observacion |
|---|---|---|
| Conversion a CoreML | +64% | Unico metodo efectivo de aceleracion del UNet |
| Modelos destilados (SDXS) | +118% | Mejor relacion velocidad/calidad |
| Pipeline de 3 hilos | Visualizacion fluida | Desacopla inferencia de render |
| Cuantizacion INT8 a 2 bits | 0% | M3 Ultra limitado por computo, no por memoria |
| Token Merging (ToMe) | -10% | El overhead de MPS supera el ahorro en atencion |
| Inferencia CoreML en paralelo | 0% | Metal serializa los comandos de GPU |
| Neural Engine para UNet | -19% a -520% | ANE no apta para modelos grandes (866M) |
| torch.compile | Crashea | El backend MPS no esta soportado |
| Attention Slicing | -40% | Overhead de gestion de memoria de MPS |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score) en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: macOS 14 Sonoma o superior, obligatorio.
- CPU: Apple Silicon exclusivamente (series M1, M2, M3 y M4); no funciona en Intel.
- Python: 3.9 a 3.12; coremltools no soporta 3.13 o superior.
- Memoria: no se especifica un minimo; el benchmark se hizo con 512 GB unificados en M3 Ultra y 128 GB en M4 Max, pero los modelos (323M a 866M parametros) son ligeros y deberian caber en configuraciones base.
- GPU recomendadas: M3 Ultra para maxima tasa (22,7 FPS), M4 Max para portatiles (15,4 FPS medidos), M1/M2 Pro o Max para uso interactivo moderado (8-18 FPS).
- Cabe en GPU de consumo Apple: si, en cualquier chip M1 a M4; no aplica a GPU NVIDIA o AMD.
- Despliegue: CoreML mediante coremltools 7.x-8.x con PyTorch 2.1-2.5.x y diffusers 0.21+; perfil legacy con coremltools 6.x y PyTorch 2.0.x para entornos problematicos. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: 24,4 ms de UNet mas aproximadamente 5 ms de encode y 5 ms de decode con TAESD, lo que da un coste por frame de unos 35 ms en el mejor caso.
- Throughput: 22,7 FPS en M3 Ultra, 15,4 FPS en M4 Max y 5-8 FPS en M1/M2 base.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StreamDiffusion for Mac (este) | Pipeline de difusion imagen-a-imagen en tiempo real sobre CoreML | 328M-866M | 512x512 (384 configurable) | 22,7 FPS en M3 Ultra | no disponible | Hugging Face y GitHub (ochyai) |
| StreamDiffusion original | Pipeline de difusion en tiempo real sobre CUDA | no disponible | no disponible | Optimizado para GPU NVIDIA | no disponible | GitHub |
| Stable Diffusion WebUI (A1111) | Interfaz de generacion de imagen por lotes | 860M-2,6B | 512x512 a 1024x1024 | No orientado a tiempo real | CreativeML OpenRAIL-M (variantes) | GitHub |
| ComfyUI | Grafo de nodos para pipelines de difusion | Variable segun modelo | Variable | No orientado a tiempo real por defecto | GPL-3.0 (el software) | GitHub |

La comparativa directa con modelos de lenguaje no aplica; las alternativas reales son otros pipelines de difusion. Frente a StreamDiffusion original, este proyecto se distingue por el backend CoreML y por el informe de optimizacion especifico para Apple Silicon. Frente a WebUI y ComfyUI, la diferencia es el objetivo: aquellos priorizan flexibilidad y calidad, este prioriza latencia por frame.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier evaluacion como LLM es un error de categoria.
- La licencia no esta declarada en la informacion disponible; antes de uso comercial hay que verificar la licencia de los modelos subyacentes (SDXS-512, SD-Turbo, Tiny-SD) y la del codigo en el repositorio de GitHub.
- Dependencia estricta de macOS 14+ y Apple Silicon; no hay soporte para Linux, Windows ni GPU NVIDIA o AMD.
- Python 3.13 o superior no funciona por la limitacion de coremltools.
- El rendimiento cae drasticamente en chips base: 5-8 FPS en M1/M2, lo que puede resultar insuficiente para interaccion fluida.
- La cuantizacion no aporta mejoras en M3 Ultra segun el propio informe, por lo que no es una via para reducir requisitos en ese hardware.
- Riesgo de artefactos y deriva de estilo en secuencias largas pese al feedback latente y al EMA; no se documentan metricas de estabilidad temporal.
- Los prompts se interpretan en ingles en los ejemplos; no se documenta soporte multilingue de la condicion de texto.
- La calidad "Fair" de Tiny-SD y la ausencia de benchmarks de calidad de imagen (FID, CLIP) impiden comparar objetivamente la fidelidad de los estilos.
- Proyecto con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay evidencia de adopcion ni de mantenimiento continuado.
- El pipeline asume una unica camara activa por proceso y no documenta soporte multi-camara ni procesamiento por lotes.

## Enlaces

- Hugging Face: https://huggingface.co/bahae98/streamdiffusion-mac
- Repositorio GitHub referenciado en la model card: https://github.com/ochyai/streamdiffusion-mac
- Documentacion de CoreML Tools: no disponible en la informacion proporcionada
- Paper de StreamDiffusion: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
