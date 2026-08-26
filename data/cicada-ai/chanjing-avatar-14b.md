# cicada-ai/Chanjing-Avatar-14B

## Resumen

Chanjing-Avatar 14B es un modelo de generación de vídeo de avatares parlantes (talking-head) impulsado por audio, desarrollado por el equipo de cicada-ai. Se basa en el modelo de difusión de vídeo Wan2.1-T2V-14B de Alibaba, al que añade módulos de condicionamiento de audio, una proyección de entrada y adaptadores LoRA. El resultado es un sistema capaz de generar vídeo de 720p a partir de una imagen de referencia y una pista de audio, con sincronización labial y movimiento facial coherente.

El checkpoint publicado contiene únicamente los componentes adicionales (módulos de audio, proyección y LoRA) en BF16, con un peso de 618 millones de parámetros y un tamaño de repositorio de 1,2 GB. El modelo base Wan2.1-T2V-14B y el codificador de audio Wav2Vec deben descargarse por separado. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

Este modelo es relevante porque democratiza la generación de avatares fotorrealistas con sincronización labial, una tarea que tradicionalmente requería pipelines complejos y propietarios. Al estar basado en un modelo de difusión de vídeo de última generación y publicarse con licencia abierta, permite a desarrolladores e investigadores integrar generación de vídeo con voz en aplicaciones de contenido, educación y entretenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video (Wan2.1-T2V-14B) con condicionamiento de audio y adaptadores LoRA |
| Parametros totales | 14B (modelo base) + 618.684.512 (checkpoint adicional: audio, proyeccion y LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | BF16 (checkpoint adicional); cuantizacion del modelo base no especificada |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusion_pytorch_model.safetensors) |

## Arquitectura y entrenamiento

Chanjing-Avatar 14B extiende el modelo de difusion de video Wan2.1-T2V-14B, que es un transformer de difusion latente disenado para generar video de alta resolucion. Sobre esta base, el equipo anade un codificador de audio (Wav2Vec) que extrae caracteristicas de la senal de voz, una capa de proyeccion que integra dichas caracteristicas en el espacio latente del modelo de video, y adaptadores LoRA que ajustan los pesos del modelo base para la tarea especifica de sincronizacion labial y animacion facial.

El checkpoint publicado contiene exclusivamente estos componentes adicionales, no el modelo base completo. No se han proporcionado detalles sobre el dataset de entrenamiento, el numero de pasos, ni si se utilizaron tecnicas como RLHF o DPO. La inferencia requiere cargar el modelo base Wan2.1-T2V-14B por separado y combinar los pesos LoRA y los modulos de audio. El pipeline se integra con la libreria diffusers, lo que facilita su uso en entornos Python.

## Capacidades

- Generacion de video de 720p a partir de una imagen de referencia y una pista de audio.
- Sincronizacion labial (lip-sync) con el audio de conduccion.
- Animacion facial coherente con la voz (movimiento de cabeza, expresiones).
- Generacion de video de imagen a video (image-to-video) con condicionamiento de audio.
- Soporte para inferencia con diffusers y safetensors.
- Capacidad de generar avatares parlantes a partir de una foto estatica y un clip de voz.
- No se especifican capacidades de texto, codigo, razonamiento o tool calling, ya que es un modelo puramente audiovisual.

## Casos de uso

- Creacion de avatares para contenido educativo: un profesor puede generar un video explicativo a partir de una foto y un guion de audio, reduciendo costes de produccion.
- Doblaje de video con sincronizacion labial: se puede sustituir la pista de audio de un video existente y regenerar el movimiento de los labios del hablante para que coincida con el nuevo audio.
- Asistentes virtuales con presencia visual: integrar el modelo en un chatbot para generar respuestas en video con un avatar personalizado.
- Produccion de noticias o reportajes automatizados: generar presentadores sinteticos a partir de imagenes y textos leidos por voz sintetica.
- Localizacion de contenido: adaptar videos a otros idiomas manteniendo la apariencia del hablante original, con sincronizacion labial en el nuevo idioma.
- Prototipado rapido de anuncios o piezas de marketing: generar videos promocionales con actores sinteticos sin necesidad de rodaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas.
- Al basarse en Wan2.1-T2V-14B, se requiere una GPU de alta gama con al menos 24 GB de VRAM para inferencia en BF16 (estimacion razonable para un modelo de difusion de video de 14B).
- GPUs recomendadas: NVIDIA A100, H100, RTX 4090 o superiores.
- No se espera que quepa en GPUs de consumo de gama baja (8-12 GB) sin cuantizacion agresiva, que no esta documentada.
- Opciones de despliegue: libreria diffusers (Python), con posibilidad de usar pipelines personalizados. No se mencionan vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chanjing-Avatar 14B | 14B + 618M | no aplica | Avatar parlante 720p | Apache 2.0 | HuggingFace |
| Chanjing-Avatar V2V 5B | 5B (estimado) | no aplica | Video a video con regeneracion facial | Apache 2.0 | HuggingFace |
| Chanjing-Avatar V2V 1.3B | 1.3B (estimado) | no aplica | Video a video ligero | Apache 2.0 | HuggingFace |
| Wan2.1-T2V-14B (base) | 14B | no aplica | Texto a video | Apache 2.0 | HuggingFace |

La comparativa se limita a la familia Chanjing y al modelo base, ya que no se dispone de datos de otros modelos de talking-head con los que comparar directamente.

## Limitaciones y advertencias

- El modelo puede generar contenido sintetico que debe ser claramente etiquetado como tal; el autor advierte que los usuarios son responsables de obtener consentimiento para las imagenes y voces utilizadas.
- Riesgo de alucinaciones visuales o artefactos en la sincronizacion labial, especialmente con audios de baja calidad o acentos no representados en el entrenamiento.
- No se especifican idiomas soportados; el rendimiento puede degradarse con idiomas o dialectos poco comunes.
- El checkpoint adicional no incluye el modelo base ni el codificador de audio, que deben descargarse por separado, lo que aumenta la complejidad de despliegue.
- No hay informacion sobre cuantizacion, por lo que la inferencia en hardware limitado puede ser inviable.
- La licencia Apache 2.0 permite uso comercial, pero se deben cumplir las obligaciones de atribucion y las leyes locales sobre deepfakes y medios sinteticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cicada-ai/Chanjing-Avatar-14B
- Repositorio de codigo: https://github.com/chanjing-ai/Chanjing-Avatar
- Organizacion en GitHub: https://github.com/chanjing-ai
- Modelo base Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo hermano V2V 5B: https://huggingface.co/cicada-ai/Chanjing-Avatar-V2V-5B
- Modelo hermano V2V 1.3B: https://huggingface.co/cicada-ai/Chanjing-Avatar-V2V-1.3B
