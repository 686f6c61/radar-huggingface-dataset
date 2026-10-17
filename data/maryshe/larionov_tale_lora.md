# maryshe/larionov_TALE_LoRA

## Resumen

`maryshe/larionov_TALE_LoRA` es un adaptador LoRA para generacion de imagenes con Stable Diffusion XL (SDXL), entrenado mediante DreamBooth sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0`. Lo desarrolla el usuario maryshe y su proposito es transferir un estilo visual concreto, activado mediante el prompt `photo collage in larionov style`, presumiblemente inspirado en la obra del pintor ruso Mikhail Larionov y su estetica de collage y vanguardia.

El modelo no es un modelo de lenguaje ni un sistema de razonamiento: es un adaptador de difusion de bajo rango (LoRA) que modifica el comportamiento del UNet de SDXL para reproducir un estilo artistico. Su relevancia es acotada y experimental: se publico en octubre de 2026, no tiene descargas ni likes, y la model card fue generada automaticamente con secciones pendientes (codigo de ejemplo, limitaciones y detalles de entrenamiento marcados como TODO).

Dado que el repositorio ocupa aproximadamente 0,1 GB y la LoRA del text encoder se desactivo durante el entrenamiento, el adaptador actua unicamente sobre el UNet. No hay informacion publicada sobre el dataset de entrenamiento, el numero de pasos, el learning rate ni los resultados cualitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion XL (difusion latente, transformer convolucional) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene 3.500 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image); SDXL usa prompts de hasta 77 tokens por encoder |
| Tipos de cuantizacion | no disponible (pesos Safetensors en precision de entrenamiento; compatible con fp16 y fp32 del pipeline SDXL) |
| Idiomas soportados | no disponible (los prompts de SDXL funcionan principalmente en ingles) |
| Licencia | openrail++ |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DreamBooth sobre SDXL, un modelo de difusion latente compuesto por un UNet, dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) y un VAE. La LoRA se aplica exclusivamente al UNet, ya que la LoRA del text encoder se desactivo (`LoRA for the text encoder was enabled: False`). Durante el entrenamiento se utilizo el VAE `madebyollin/sdxl-vae-fp16-fix`, habitual para evitar problemas de desbordamiento numerico en fp16.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos, el rango de la LoRA ni si se aplicaron tecnicas de regularizacion. La model card no documenta innovaciones tecnicas adicionales; se trata de un entrenamiento DreamBooth estandar con el script de `diffusers`.

## Capacidades

- Generacion de imagenes text-to-image condicionada por el prompt activador `photo collage in larionov style`.
- Transferencia de estilo artistico inspirado en el collage y la vanguardia de Larionov.
- Compatible con el ecosistema `diffusers` y con el pipeline `StableDiffusionXLPipeline`.
- Puede combinarse con otras LoRAs de SDXL si el pipeline lo permite, aunque no hay documentacion al respecto.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades de vision, audio ni multilingues mas alla del comportamiento del modelo base.
- No dispone de modo "thinking" ni funciones especiales.

## Casos de uso

- Exploracion artistica personal: generar collages con estetica larionoviana para proyectos de ilustracion o referencia visual, usando el prompt activador y el modelo base SDXL.
- Prototipado de direccion de arte: producir variaciones rapidas de collage para presentar a un cliente antes de encargar trabajo manual, gracias a la naturaleza ligera del adaptador (0,1 GB).
- Generacion de material para moodboards: crear imagenes de estilo coherente que sirvan como referencia en diseno grafico o editorial.
- Investigacion sobre transferencia de estilo: estudiar como una LoRA de bajo rango modifica el UNet de SDXL sin tocar el text encoder, como caso de analisis comparativo.
- Educacion y demostraciones: ilustrar el funcionamiento de DreamBooth y LoRA en talleres sobre difusion, cargando el adaptador sobre SDXL en `diffusers`.
- Experimentacion con prompts: probar la interaccion entre el trigger word y descripciones adicionales para controlar composicion y paleta.
- Uso recreativo en comunidades de arte generativo: compartir resultados con la etiqueta de estilo, siempre respetando la licencia openrail++.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA en si ocupa muy poco (repo de 0,1 GB), pero requiere cargar SDXL completo; en fp16 el pipeline necesita aproximadamente 8-10 GB de VRAM, y en fp32 alrededor de 16 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia comoda; RTX 3060 de 12 GB puede funcionar con optimizaciones.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando fp16 y `enable_model_cpu_offload` o `enable_vae_slicing`; en 6 GB requiere cuantizacion adicional del modelo base.
- Opciones de despliegue: `diffusers` (pipeline SDXL con `load_lora_weights`), ComfyUI, Automatic1111/Forge con soporte SDXL, o `diffusers` CLI.
- Latencia y throughput: no disponibles; dependen de la GPU y del numero de pasos (tipicamente 20-30 pasos por imagen en SDXL).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maryshe/larionov_TALE_LoRA | LoRA sobre SDXL | no disponible (adaptador) | no aplica | openrail++ | HuggingFace, 0 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Difusion SDXL completo | 3.500 millones | no aplica | openrail++ | HuggingFace, ampliamente usado |
| Otras LoRAs de estilo en SDXL | LoRA sobre SDXL | variable | no aplica | variable | HuggingFace, comunidad |

No se dispone de datos de rendimiento comparativo entre esta LoRA y otras alternativas de estilo.

## Limitaciones y advertencias

- La model card esta incompleta: las secciones de uso, limitaciones y detalles de entrenamiento contienen marcadores TODO.
- No hay informacion sobre el dataset, por lo que se desconocen posibles sesgos en el estilo aprendido.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar composiciones incoherentes o artefactos, especialmente fuera del dominio del estilo entrenado.
- El trigger word esta en ingles; prompts en castellano pueden no activar el estilo con la misma fidelidad.
- La licencia openrail++ permite uso comercial con restricciones (prohibicion de usos ilicitos, difamatorios o de vigilancia); conviene revisar los terminos completos antes de produccion.
- El adaptador solo afecta al UNet; no se entreno LoRA para el text encoder, lo que limita el control fino sobre el prompt.
- Sin descargas ni validacion de la comunidad: no hay evidencia publica de calidad o estabilidad.
- No apto para tareas de texto, razonamiento, codigo o agentes.

## Enlaces

- HuggingFace: https://huggingface.co/maryshe/larionov_TALE_LoRA
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- DreamBooth: https://dreambooth.github.io/
- VAE utilizado: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
