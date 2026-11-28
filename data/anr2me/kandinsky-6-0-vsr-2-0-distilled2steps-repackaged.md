# anr2me/Kandinsky-6.0-VSR-2.0-distilled2steps-Repackaged

## Resumen

Kandinsky-6.0-VSR-2.0-distilled2steps-Repackaged es un reempaquetado en bf16 de los pesos originales del modelo Kandinsky 6.0 VSR 2.0 (video super-resolution) desarrollado por Kandinsky Lab. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son idénticos a los del modelo base kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers. El autor del repositorio, anr2me, se ha limitado a reorganizar los ficheros en la estructura de carpetas que espera ComfyUI (`diffusion_models/`, `vae/`, `upscale_models/`) y a incrustar la configuracion de cada componente en la cabecera de los safetensors.

El modelo resuelve la tarea de super-resolucion de video (VSR): toma una secuencia de video de baja resolucion y genera una version de alta resolucion. Es una variante "distilled" que funciona en 2 pasos de muestreo, lo que reduce drasticamente el coste de inferencia frente a un modelo de difusion convencional de decenas de pasos. La arquitectura es de difusion (pipeline `diffusers`) con tres componentes separados: un transformer de difusion (3,19 GB en bf16), un VAE (6,96 GB) y un upscaler latente (7,31 GB), sumando un repositorio de 17,5 GB.

Su relevancia practica es doble: por un lado, ofrece una via directa para usar el modelo oficial dentro de ComfyUI sin necesidad de parchear los nodos oficiales; por otro, el autor publica un repositorio de nodos propio (`kandinsky6-sr-int8-convrot`) capaz de leer los ficheros con configuracion embebida. La licencia MIT del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (pipeline `diffusers`) con transformer, VAE y upscaler latente separados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | bf16 (sin cuantizar); los nodos del autor admiten carga INT8 ConvRot |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 17,5 GB |
| Componentes | transformer 3,19 GB, VAE 6,96 GB, upscaler latente 7,31 GB |
| Pasos de muestreo | 2 (destilado) |
| Modelo base | kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers |

## Arquitectura y entrenamiento

El modelo es un sistema de difusion para super-resolucion de video. Se compone de tres redes independientes que se cargan por separado: un transformer de difusion que actua como denoiser, un VAE (KVAE) para codificar y decodificar entre espacio de pixeles y espacio latente, y un upscaler latente que opera en el espacio latente. La variante "distilled2steps" ha sido destilada para funcionar con solo dos pasos de muestreo, lo que implica un proceso de destilacion por parte de Kandinsky Lab sobre el modelo original completo.

No se dispone de informacion sobre el numero de tokens o frames de entrenamiento, la composicion del dataset, ni si hubo RLHF o preferencias. La model card del repositorio reempaquetado no aporta esos datos y solo describe el proceso de reempaquetado. La innovacion tecnica destacable es la destilacion a 2 pasos, que hace viable la VSR en entornos de consumo, y el formato de configuracion embebida en la cabecera de los safetensors (clave `kandinsky6.component_config` y, en el transformer, `kandinsky6.scheduler_config`), que permite cargar los modelos sin ficheros JSON externos.

## Capacidades

- Super-resolucion de video: aumenta la resolucion de secuencias de video manteniendo coherencia temporal entre frames.
- Inferencia en 2 pasos de muestreo gracias a la destilacion, con el consiguiente ahorro de latencia.
- Pipeline de tres etapas: denoising con transformer, upscaling en espacio latente y decodificacion con VAE.
- Integracion con ComfyUI mediante nodos dedicados (`Load Diffusion Model`, `Kandinsky6 SR VAE Loader`, `Kandinsky6 SR Latent Upscaler Loader`).
- Carga de configuracion embebida en safetensors, con posibilidad de sobrescribirla mediante ficheros externos `<file-name>.json` y `<file-name>.scheduler.json`.
- Soporte de carga de pesos bf16 e INT8 ConvRot a traves de los nodos del autor.
- No es un modelo de texto: no tiene capacidades de generacion de lenguaje, tool calling, agentes ni razonamiento simbolico.

## Casos de uso

- Restauracion de metraje antiguo o de baja calidad: se aplica el modelo sobre videos SD o sub-SD para obtener versiones HD, aprovechando la coherencia temporal del pipeline de difusion de video.
- Reescalado de material grabado con moviles o camaras de baja resolucion para publicacion en plataformas que exigen 1080p o 4K.
- Postproduccion en pipelines de edicion: integrado en ComfyUI, el modelo se encadena con nodos de carga de video, interpolacion o correccion de color para un flujo de trabajo completo.
- Mejora de footage de vigilancia o de drones: la super-resolucion permite leer matriculas o detalles en grabaciones de baja resolucion, aunque con las limitaciones propias de un modelo generativo.
- Preprocesado para otros modelos de vision: elevar la resolucion de entrada antes de pasar el video a detectores de objetos o modelos de segmentacion que rinden mejor con mas pixeles.
- Prototipado rapido de efectos de reescalado en entornos de investigacion: la licencia MIT y el formato safetensors facilitan la experimentacion y la integracion en scripts propios con `diffusers`.
- Generacion de versiones de alta resolucion de clips para demostraciones o portfolios sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos suman unos 17,5 GB en bf16, por lo que se necesita al menos esa cantidad de VRAM para cargar los tres componentes completos, mas el overhead de activaciones y del pipeline de video.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, se situaria en el rango de GPUs profesionales (A100 40/80 GB, H100) o consumer de gama alta con 24 GB o mas, aunque la carga simultanea de los tres componentes en bf16 puede exceder los 24 GB.
- Cabe en consumer GPU: no confirmado. Los nodos del autor admiten INT8 ConvRot, lo que podria reducir el consumo, pero no se especifican cifras.
- Opciones de despliegue: ComfyUI (via nodos `kandinsky6-sr` oficiales o el repositorio `anr2me/kandinsky6-sr-int8-convrot`), y `diffusers` para uso programatico.
- Latencia y throughput: no disponibles. La destilacion a 2 pasos reduce el numero de evaluaciones del transformer frente a un modelo no destilado, pero no se aportan numeros concretos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-6.0-VSR-2.0-distilled2steps (este reempaquetado) | VSR por difusion | 2 | MIT | safetensors bf16 | Hugging Face + ComfyUI |
| kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers (original) | VSR por difusion | 2 | MIT | diffusers | Hugging Face |
| Modelos VSR clasicos (ESRGAN, Real-ESRGAN, etc.) | GAN / CNN | 1 (feed-forward) | variable | pth / safetensors | amplia |

La comparacion con modelos GAN de super-resolucion es cualitativa: los GAN son mucho mas ligeros y rapidos, pero no modelan coherencia temporal de la misma forma ni generan detalle con la misma fidelidad. El modelo de Kandinsky es considerablemente mas pesado y costoso de ejecutar. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Este repositorio no introduce mejoras de calidad: los pesos son identicos al modelo base. Cualquier limitacion del original se hereda.
- Riesgo de artefactos generativos: como todo modelo de difusion, puede inventar detalle inexistente en la super-resolucion, especialmente en zonas de bajo contraste o movimiento rapido.
- No hay informacion sobre sesgos del dataset de entrenamiento ni sobre su composicion.
- Requiere los nodos adecuados: los nodos oficiales de ComfyUI no pueden leer estos ficheros sin un `config.json`; es necesario usar el repositorio de nodos del autor o generar los ficheros de configuracion externos.
- El consumo de VRAM es elevado (17,5 GB de pesos en bf16), lo que limita su uso en GPUs consumer.
- No se especifican requisitos minimos ni maximos de resolucion o duracion de video soportados.
- La licencia MIT permite uso comercial, pero conviene verificar los terminos del modelo base original y de cualquier dependencia (VAE, upscaler) por si tuvieran condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del reempaquetado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anr2me/Kandinsky-6.0-VSR-2.0-distilled2steps-Repackaged
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers
- Nodos oficiales kandinsky6-sr: https://github.com/kandinskylab/kandinsky-6-sr/tree/main/comfyui
- Nodos del autor (INT8 ConvRot): https://github.com/anr2me/kandinsky6-sr-int8-convrot
- Referencia de configuracion alternativa: https://huggingface.co/shadwosii/Kandinsky-6.0
