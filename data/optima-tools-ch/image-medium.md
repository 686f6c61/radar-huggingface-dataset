# optima-tools-ch/image-medium

## Resumen

`optima-tools-ch/image-medium` es un paquete de distribucion del modelo de generacion de imagenes FLUX.2 [klein] 4B, desarrollado originalmente por Black Forest Labs. Optima Tools actua unicamente como preparador y distribuidor: copia los 18 archivos de ejecucion de la revision `e7b7dc27f91deacad38e78976d1f2b499d76a294` del repositorio `black-forest-labs/FLUX.2-klein-4B` y los empaqueta con un manifiesto (`SOURCE.json`, `.optima-package.json`) que documenta procedencia, tamanos y hashes SHA-256. No se trata, por tanto, de un fine-tune ni de un modelo nuevo, sino de una replica verificada del original.

El modelo resuelve dos tareas: generacion de imagenes a partir de texto (text-to-image) y edicion de imagenes, incluyendo edicion multi-referencia. La arquitectura es la de FLUX.2 [klein], una variante destilada de la familia FLUX.2 orientada a generacion rapida: el ejemplo oficial de la model card emplea solo 4 pasos de inferencia con `guidance_scale=1.0` a 1024x1024. El repositorio ocupa 16,0 GB y el peso del transformador sumado en safetensors asciende a 3.875.544.576 parametros (aproximadamente 3,88 mil millones), coherente con la denominacion "4B" de la familia.

La relevancia de este paquete es practica: permite desplegar el pipeline `Flux2KleinPipeline` de Diffusers en modo offline (`local_files_only=True`) con todos los componentes separados por carpetas (`transformer/`, `text_encoder/`, `vae/`, `tokenizer/`, `scheduler/`), lo que facilita su integracion en aplicaciones que necesitan control de versiones y verificacion de integridad. La licencia Apache 2.0 del modelo base se mantiene en la distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia FLUX.2 [klein]; pipeline Diffusers `Flux2KleinPipeline`) |
| Parametros totales | 3.875.544.576 (pesos del transformador en safetensors) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bfloat16 segun el ejemplo de carga) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (componentes separados: `transformer/`, `text_encoder/`, `vae/`, `tokenizer/`, `scheduler/`) |

Desglose del paquete por carpeta:

| Carpeta | Archivos | Tamano |
|---|---:|---:|
| `(raiz)` | 1 | 0,0 MB |
| `scheduler/` | 1 | 0,0 MB |
| `text_encoder/` | 5 | 8,05 GB |
| `tokenizer/` | 7 | 15,9 MB |
| `transformer/` | 2 | 7,75 GB |
| `vae/` | 2 | 168,1 MB |
| **Total** | **18** | **15,98 GB** |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su pertenencia a la familia FLUX.2 [klein] y de que se ejecuta mediante `Flux2KleinPipeline` en Diffusers. El paquete separa los componentes habituales de un modelo de difusion texto-a-imagen: un transformador (7,75 GB), un codificador de texto (8,05 GB, el componente mas pesado del paquete), un VAE (168,1 MB), tokenizer y scheduler. El `model_index.json` declara compatibilidad con Diffusers `0.37.0.dev0`, y la fuente recomienda instalar Diffusers desde GitHub para ejecutarlo.

La model card original describe el modelo como destilado para generacion rapida, con un ejemplo funcional de 4 pasos de inferencia y `guidance_scale=1.0`. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa u otras) en la informacion proporcionada. El paquete de Optima Tools no incluye el archivo autonomo `flux-2-klein-4b.safetensors` del repositorio original, ya que duplicaria el peso del transformador, ni las imagenes de ilustracion de la fuente.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), con resoluciones configurables (el ejemplo oficial usa 1024x1024).
- Edicion de imagenes: la ficha fuente documenta la capacidad de editar imagenes existentes.
- Edicion multi-referencia: la ficha fuente indica que el mismo modelo admite varias imagenes de referencia en una misma operacion.
- Generacion rapida por destilacion: 4 pasos de inferencia en el ejemplo oficial, con `guidance_scale=1.0`.
- Integracion con Optima Tools: es posible pasar una imagen de referencia al pipeline `Flux2KleinPipeline` para retoque, aunque esta funcionalidad no fue validada durante la publicacion del paquete.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles (`en`) segun los metadatos.
- Modo thinking, vision o audio: no disponible (modelo text-to-image con edicion).

## Casos de uso

- Generacion de ilustraciones para prototipos de producto: con 4 pasos de inferencia y 1024x1024, el modelo permite iterar rapidamente sobre bocetos visuales en fases de diseno, reduciendo el coste por imagen frente a modelos no destilados.
- Edicion de imagenes en flujos de retoque: gracias a la capacidad de edicion documentada, se puede pasar una imagen existente y un prompt para modificar elementos concretos sin regenerar la escena completa.
- Composicion con multiples referencias: la edicion multi-referencia permite combinar caracteristicas de varias imagenes de entrada (por ejemplo, estilo de una y sujeto de otra) en una sola salida, util en direccion de arte y moodboards.
- Generacion de assets para entornos de desarrollo: al distribuirse como paquete offline con hashes SHA-256, es adecuado para pipelines de CI que necesitan reproducibilidad y verificacion de integridad de los pesos.
- Despliegue en aplicaciones de escritorio o servidores internos: el pipeline `Flux2KleinPipeline` con `enable_model_cpu_offload()` permite ejecutar el modelo en maquinas con VRAM limitada, cargando componentes desde disco local sin acceso a red.
- Creacion de contenido para marketing y redes sociales: la generacion texto-a-imagen a resolucion 1024x1024 en pocos pasos encaja en flujos de produccion de variantes visuales a partir de briefs textuales en ingles.
- Prototipado de interfaces de edicion de imagen: la separacion en carpetas (`transformer/`, `text_encoder/`, `vae/`) facilita sustituir o inspeccionar componentes individuales al construir herramientas de edicion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no medida ni anunciada por el autor del paquete. Como referencia de orden de magnitud, los pesos suman 15,98 GB en bfloat16; con `enable_model_cpu_offload()` el transformador y el codificador de texto pueden descargarse a CPU entre pasos, reduciendo el pico de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el ejemplo oficial emplea `torch.Generator(device="cuda")` y `torch.bfloat16`, lo que requiere una GPU con soporte de bfloat16.
- Opciones de despliegue: Diffusers (`Flux2KleinPipeline`), con version recomendada `0.37.0.dev0` o superior instalada desde GitHub; carga local mediante `local_files_only=True`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo en la informacion disponible).
- Latencia y throughput: no disponibles; el ejemplo oficial usa 4 pasos de inferencia, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `optima-tools-ch/image-medium` (FLUX.2 [klein] 4B empaquetado) | ~3,88 B (transformador) | 1024x1024 en el ejemplo; contexto no disponible | Apache 2.0 | Hugging Face, 22 descargas, paquete offline de 15,98 GB | Distribucion verificada con SHA-256; validacion de ejecucion no realizada |
| `black-forest-labs/FLUX.2-klein-4B` (original) | ~3,88 B (transformador) | 1024x1024 en el ejemplo; contexto no disponible | Apache 2.0 | Hugging Face | Incluye `flux-2-klein-4b.safetensors` e imagenes de ilustracion que el paquete de Optima Tools omite |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El paquete no ha sido validado en ejecucion por Optima Tools: la publicacion es una copia verificada por hashes, no un test funcional. Los requisitos de hardware no estan medidos.
- La descarga desde la aplicacion Optima Tools no esta abierta todavia en el momento de la publicacion (2026-10-27).
- Idiomas: solo se declara ingles (`en`); los prompts en otros idiomas pueden degradar la calidad de la generacion.
- Riesgo de sesgos y alucinacion visual: no se documentan evaluaciones de sesgo ni de fidelidad al prompt en la informacion disponible; como todo modelo generativo, puede producir contenido inexacto o estereotipado.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de licencia y creditos (`LICENSE`, `CREDITS.md`, `CREDITS.json`). Los autores originales conservan todos sus derechos.
- Dependencia de version: el `model_index.json` exige Diffusers `0.37.0.dev0`; versiones anteriores pueden no cargar el pipeline correctamente.
- Integridad: los SHA-256 de los pesos grandes provienen de los metadatos LFS de Hugging Face y no fueron recalculados localmente; los de archivos pequenos si se verificaron.
- La edicion con imagen de referencia a traves de Optima Tools no fue validada; su funcionamiento en produccion debe comprobarse antes de desplegarla.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/optima-tools-ch/image-medium
- Modelo base original: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Revision fuente exacta: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B/tree/e7b7dc27f91deacad38e78976d1f2b499d76a294
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Documentacion de Diffusers (pipeline `Flux2KleinPipeline`): no disponible en la informacion proporcionada
- Paper, blog o demo oficial de FLUX.2 [klein]: no disponible en la informacion proporcionada
