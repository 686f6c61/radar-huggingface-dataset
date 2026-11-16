# ianivs/LongCat-Video-Avatar-1.6-DrawThings

## Resumen

LongCat-Video-Avatar 1.6 en formato Draw Things es una conversión del modelo original LongCat-Video-Avatar 1.6 desarrollado por Meituan LongCat, publicada por el usuario ianivs. Se trata de un modelo de image-to-video especializado en talking-head y audio-driven: anima un retrato estático para que sincronice los labios con una pista de voz. El repositorio contiene los pesos convertidos al formato nativo de Draw Things (8-bit S, layout `i8x`), pensados para su uso con la aplicación Atelier y con Draw Things en macOS y dispositivos Apple.

La peculiaridad de esta conversión es que reproduce fielmente la receta de destilación del modelo original, que distribuye el proceso de difusión en dos LoRAs: DMD para los primeros cuatro pasos y OPSD para los últimos cuatro. El autor ha fusionado cada LoRA en una copia independiente del modelo base, generando dos ficheros de 15,9 GB cada uno: el modelo principal (DMD) y su refiner (OPSD). Ambos son necesarios para la inferencia completa.

El modelo es relevante porque permite ejecutar generación de vídeo talking-head de alta calidad en hardware de consumo Apple mediante la cuantización 8-bit S y la destilación a 8 pasos, algo impracticable con el modelo original en bf16 (que requeriría mucha más memoria). La licencia MIT facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (image-to-video) con destilación en dos LoRAs (DMD + OPSD); arquitectura base no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de vídeo de 93 frames (4k + 1) a 25 fps |
| Tipos de cuantizacion | 8-bit S (`i8x`) en formato Draw Things; el modelo base original está en bf16 |
| Idiomas soportados | no disponible (el modelo es audio-driven, no text-driven) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (formato Draw Things), dos ficheros de 15,9 GB cada uno |

## Arquitectura y entrenamiento

El modelo original LongCat-Video-Avatar 1.6 de Meituan LongCat es un modelo de difusión para generación de vídeo condicionado por imagen (retrato) y audio (voz). La información disponible no detalla la arquitectura interna (número de parámetros, tipo de backbone, mecanismo de atención), pero sí revela que Meituan destiló el modelo en dos LoRAs complementarias: una DMD (Distribution Matching Distillation) que cubre los pasos 1 a 4 y una OPSD que cubre los pasos 5 a 8. La receta oficial (`--mix_steps 4 --mix_alpha 1.0`) ejecuta DMD en la primera mitad de los pasos y OPSD en la segunda.

La conversión de ianivs fusiona cada LoRA en una copia del modelo base en bf16 usando un script propio (`Scripts/longcat-avatar-merge.py`) que replica el `merge_lora` oficial (W += 1.0 × alpha_scale × up·down, con proyecciones fusionadas emparejadas bloque a bloque) pero mantiene el resultado en F32 en lugar de redondearlo a bf16. Posteriormente, los ficheros fusionados se importan con el `ModelImporter` del motor de Draw Things y se escriben como 8-bit S con los mismos codecs y tipos por tensor que el fichero 1.5 de Draw Things; los 2.666 tensores coinciden con ese layout. El resultado son dos ficheros: el DMD actúa como modelo principal y el OPSD como refiner, con un Refiner Start de 0.10 que, con Shift 7 y 8 pasos DDIM Trailing, entrega el relevo tras el paso 4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de vídeo talking-head a partir de un retrato y una pista de audio: el modelo anima la boca y el rostro para sincronizar con la voz.
- Image-to-video condicionado por audio: la imagen de entrada actúa como primer frame y el audio como condicionamiento temporal.
- Generación de secuencias de 93 frames (4k + 1) a 25 fps, lo que equivale a aproximadamente 3,7 segundos de vídeo por generación.
- Inferencia en 8 pasos mediante destilación DMD + OPSD, lo que reduce drásticamente el coste computacional frente a un muestreo completo.
- Integración con Draw Things y Atelier en macOS y dispositivos Apple (Apple Silicon).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo textual, ya que el modelo no es un LLM sino un generador de vídeo.

## Casos de uso

- Creación de avatares parlantes para vídeo corporativo: a partir de una foto del portavoz y una locución grabada, el modelo genera un vídeo sincronizado sin necesidad de rodaje, útil para formación interna o comunicación corporativa.
- Doblaje y localización de contenido: sustituir la pista de audio de un vídeo existente por una versión en otro idioma y regenerar la sincronización labial del hablante, manteniendo el aspecto original del rostro.
- Producción de contenido para redes sociales: generar clips cortos (unos 3,7 segundos por pasada) de un presentador virtual para vídeos verticales u horizontales, con la posibilidad de encadenar varias generaciones.
- Prototipado rápido de personajes virtuales: validar el aspecto y el movimiento de un avatar antes de invertir en captura de movimiento o pipelines 3D más costosos.
- Accesibilidad: generar versiones con lectura labial de contenidos para personas con discapacidad auditiva a partir de un retrato y una transcripción de voz.
- Investigación en síntesis de habla visual: usar el modelo como baseline o componente en estudios sobre sincronización labial, evaluación de realismo o detección de deepfakes, gracias a su licencia MIT y a su formato ligero (8-bit).
- Integración en herramientas de edición en Apple Silicon: al estar en formato Draw Things, puede incorporarse a flujos de trabajo locales en macOS sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los dos ficheros suman 31,9 GB en disco (15,9 GB cada uno en 8-bit S). Para la inferencia se necesita cargar el modelo principal y el refiner, por lo que se requiere memoria unificada o VRAM en el rango de 32 GB o superior; no se dispone de una cifra oficial de VRAM mínima.
- GPU recomendadas: el formato está pensado para Apple Silicon (Draw Things y Atelier). No se documentan requisitos para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada de 32 GB o más (por ejemplo, Mac Studio o MacBook Pro con M-series Pro/Max/Ultra). En GPU NVIDIA de consumo (RTX 4090 con 24 GB) no cabrían ambos ficheros simultáneamente en 8-bit S sin técnicas de offloading.
- Opciones de despliegue: Draw Things (macOS/iOS) y Atelier (macOS). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La inferencia se realiza en 8 pasos DDIM Trailing con Shift 7, lo que reduce el coste frente a muestreos completos, pero no se aportan tiempos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| LongCat-Video-Avatar 1.6 (Draw Things, esta ficha) | no disponible | 93 frames a 25 fps (~3,7 s) | MIT | Hugging Face (ianivs), Draw Things, Atelier |
| LongCat-Video-Avatar 1.6 (original, Meituan) | no disponible | no disponible | MIT | Hugging Face (meituan-longcat) |
| LongCat-Video-Avatar 1.5 (Draw Things) | no disponible | no disponible | MIT | Draw Things (model list) |

No se dispone de información sobre otros modelos comparables de talking-head audio-driven en la documentación proporcionada. La comparación con alternativas como SadTalker, Wav2Lip o EchoMimic no puede realizarse con datos verificables a partir de la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en talking-head: no genera vídeo general ni texto; su uso fuera de la animación de retratos con audio no está soportado.
- La duración por generación está limitada a 93 frames (~3,7 segundos a 25 fps); secuencias más largas requieren encadenar generaciones y pueden presentar inconsistencias entre fragmentos.
- La conversión a 8-bit S introduce una pérdida de precisión respecto al modelo original en bf16; no se ha publicado una evaluación cuantitativa de esa degradación.
- El modelo 1.6 no normaliza la loudness de la voz (la pipeline oficial lo desactiva para 1.6), pero Draw Things ignora la clave `audio_loudness_normalization: false` y normaliza de todos modos, lo que puede producir diferencias de comportamiento respecto a la pipeline oficial.
- El refiner debe configurarse manualmente (Refiner Start 0.10 con Shift 7 y 8 pasos); cambiar los pasos o el Shift altera el punto de entrega y puede degradar la calidad.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir artefactos, movimientos no naturales o inconsistencias faciales, especialmente con retratos de baja calidad o ángulos poco habituales.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de rostros humanos es probable que herede sesgos demográficos del dataset original (no disponible).
- Uso comercial: la licencia MIT permite uso comercial, pero el autor de la conversión no ofrece garantías sobre el modelo original ni sobre los componentes auxiliares (UMT5 XXL, VAE Wan 2.1, Whisper large v3), cuyas licencias deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ianivs/LongCat-Video-Avatar-1.6-DrawThings
- Modelo original: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Draw Things: https://drawthings.ai
- Atelier (repositorio): https://github.com/ianiv/Atelier
- Script de fusión de LoRAs: https://github.com/ianiv/Atelier/blob/main/Scripts/longcat-avatar-merge.py
- Motor Draw Things (comunidad): https://github.com/drawthingsai/draw-things-community
- Organización Meituan LongCat en Hugging Face: https://huggingface.co/meituan-longcat
