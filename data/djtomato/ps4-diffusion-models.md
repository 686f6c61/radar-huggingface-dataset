# DJTomato/ps4-diffusion-models

## Resumen

`DJTomato/ps4-diffusion-models` no es un modelo de lenguaje nuevo, sino un repositorio de checkpoints de difusion preconvertidos al formato propietario `PSD1` en cuantizacion Q8_0, disenados para ejecutarse directamente en la GPU GCN de una PlayStation 4 mediante una aplicacion homebrew. El autor, DJTomato, empaqueta cinco modelos de generacion de imagenes ya existentes (tres de SD 1.5 y dos de SDXL) listos para descarga HTTPS desde la interfaz web o la aplicacion de TV del propio sistema.

El interes tecnico del repositorio no esta en los pesos en si, sino en la cadena de conversion y despliegue: adaptar pesos de Stable Diffusion 1.5 y SDXL a un formato cuantizado de 8 bits que pueda ejecutarse en el hardware grafico de una consola de 2013 con unos 1,84 TFLOPS en su GPU. Los tamanos de cada checkpoint (1220 MiB para SD 1.5 y 3716 MiB para SDXL) son coherentes con pesos Q8_0 y permiten inferencias de entre 25 y 75 segundos segun modelo y modo.

Es relevante como ejemplo de inferencia de difusion en hardware muy limitado y como recurso para la comunidad de homebrew de PS4, aunque su utilidad fuera de ese ecosistema es practicamente nula: el formato `PSD1` no es compatible con runtimes convencionales como diffusers, ComfyUI o A1111.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet) sobre SD 1.5 y SDXL, segun checkpoint |
| Parametros totales | no disponible (depende del checkpoint; SD 1.5 ~860M, SDXL ~2.6B en UNet, dato no confirmado en la fuente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | Q8_0 unicamente (formato `PSD1`) |
| Idiomas soportados | no disponible (prompts en texto; idioma no declarado) |
| Licencia | no disponible |
| Formato de pesos | `PSD1` (Q8_0), formato propietario para PS4; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye pesos de terceros convertidos a Q8_0 y empaquetados en el formato `PSD1` para ejecucion en la GPU GCN de PS4. Los modelos base son MeinaMix V11 (8-step), DreamShaper 8 y Anything V5 sobre SD 1.5, y WAI-Illustrious v17 y v14 con DMD2 (6-step) sobre SDXL. Las tecnicas de aceleracion por destilacion (8-step y DMD2 con CFG 1.0) permiten reducir el numero de pasos de muestreo, algo critico dado el bajo rendimiento del hardware objetivo.

No se documentan datos de entrenamiento, composicion del dataset ni procesos de RLHF o DPO, ya que el autor no entrena los modelos. Los creditos de la model card atribuyen los pesos a WAI-Illustrious, MeinaMix, DreamShaper, Anything V5, ByteDance Hyper-SD y Tianwei Yin (DMD2). La innovacion tecnica es la conversion y el runtime de inferencia en consola, no el modelo en si.

## Capacidades

- Generacion de imagenes texto-a-imagen con SD 1.5 (MeinaMix, DreamShaper, Anything V5) y SDXL (WAI-Illustrious v17 y v14).
- Estilos especializados: anime brillante (MeinaMix), fantasia 2.5D (DreamShaper), anime cel-shaded (Anything V5) e ilustracion nitida (WAI-Illustrious).
- Muestreo acelerado: 8 pasos en SD 1.5 y 6 pasos con DMD2 y CFG 1.0 en SDXL.
- Upscaling opcional con RealESRGAN a 1080p tras la generacion.
- Descarga directa de modelos desde la interfaz web o la app de TV de la PS4.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video.

## Casos de uso

- Generacion de arte anime en PS4: MeinaMix V11 en 8 pasos produce imagenes en unos 25 segundos mas el upscale a 1080p, adecuado para uso recreativo en consola base y Pro.
- Ilustracion de fantasia 2.5D: DreamShaper 8 ofrece resultados versatiles en unos 75 segundos, util para prototipado visual sin PC.
- Estilo cel-shaded para fan art: Anything V5 genera imagenes de anime con lineas limpias en torno a 75 segundos por imagen.
- Ilustracion de alta calidad en SDXL: WAI-Illustrious v17 con DMD2 produce resultados nitidos en unos 50 segundos en modo Quiet con CFG 1.0.
- Reproduccion de estilos consolidados: la variante v14 de WAI-Illustrious sirve como referencia estable para comparar resultados entre versiones.
- Demostracion de inferencia de difusion en hardware antiguo: util para investigacion sobre despliegue en GPUs GCN de baja potencia y tecnicas de destilacion de pasos.
- Uso offline en consola: al descargarse los checkpoints al almacenamiento local, la generacion no requiere conexion una vez instalados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta tiempos de inferencia aproximados por modelo:

| Modelo | Arquitectura | Tamano | Tiempo estimado | Notas |
|---|---|---:|---|---|
| MeinaMix_V11_8step | SD 1.5 | 1220 MiB | ~25 s + upscale 1080p | 8 pasos, base y Pro |
| DreamShaper_8 | SD 1.5 | 1220 MiB | ~75 s + upscale 1080p | base y Pro |
| Anything_V5 | SD 1.5 | 1220 MiB | ~75 s + upscale 1080p | base y Pro |
| WAI_Illustrious_v17_dmd2 | SDXL | 3716 MiB | ~50 s | modo Quiet, CFG 1.0 |
| waiNSFWIllustrious_v140_dmd2 | SDXL | 3716 MiB | ~50 s | modo Quiet, CFG 1.0 |

## Requisitos de hardware

- Hardware objetivo: PlayStation 4 (base y Pro) con GPU GCN; no esta pensado para PC.
- VRAM: no disponible como cifra explicita; los checkpoints Q8_0 ocupan 1220 MiB (SD 1.5) y 3716 MiB (SDXL) en almacenamiento y deben caber en la memoria grafica compartida de la consola.
- GPU recomendadas: exclusivamente la GPU de PS4; no se documenta compatibilidad con A100, H100 ni RTX.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el runtime es especifico de PS4.
- Despliegue: aplicacion homebrew de PS4 con interfaz web y app de TV; no compatible con vLLM, llama.cpp, Ollama, TGI, diffusers ni ComfyUI.
- Latencia: entre 25 y 75 segundos por imagen segun modelo, mas el upscale RealESRGAN a 1080p cuando se aplica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ps4-diffusion-models (este repo) | Pack de checkpoints SD 1.5/SDXL convertidos | segun checkpoint | `PSD1` Q8_0 | no disponible | Hugging Face, uso en PS4 |
| SD 1.5 original | Difusion latente | ~860M (UNet) | safetensors/ckpt | CreativeML OpenRAIL-M | amplia, runtimes estandar |
| SDXL base | Difusion latente | ~2.6B (UNet) | safetensors | CreativeML OpenRAIL++-M | amplia, runtimes estandar |
| WAI-Illustrious v17 (original) | SDXL afinado | ~2.6B (UNet) | safetensors | no disponible en esta fuente | Civitai/HF, runtimes estandar |

La diferencia clave frente a los originales es el formato: este repositorio solo es utilizable en PS4, mientras que los pesos originales funcionan en cualquier runtime de difusion estandar.

## Limitaciones y advertencias

- El formato `PSD1` es propietario y no es compatible con diffusers, ComfyUI, A1111 ni otras herramientas convencionales.
- La licencia no esta declarada en la informacion disponible; los pesos originales tienen sus propias licencias (CreativeML OpenRAIL y similares) que pueden imponer restricciones al uso comercial.
- Uno de los checkpoints (`waiNSFWIllustrious_v140_dmd2`) esta orientado a contenido NSFW; requiere control de acceso y moderacion en cualquier despliegue compartido.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusion base, no evaluado en esta fuente.
- La cuantizacion Q8_0 puede degradar la fidelidad respecto a los pesos originales en precision completa.
- Los tiempos de inferencia son estimaciones del autor y pueden variar segun firmware, carga del sistema y modo de ejecucion.
- Sin garantias de soporte, mantenimiento ni actualizaciones; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El uso de homebrew en PS4 puede implicar riesgos para la garantia y los terminos de servicio de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DJTomato/ps4-diffusion-models
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
