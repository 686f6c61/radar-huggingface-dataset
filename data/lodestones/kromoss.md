# lodestones/Kromoss

## Resumen

Kromoss es un ajuste fino completo (*full fine-tune*) del modelo de difusión texto-a-imagen MOSS-Image-Base, desarrollado por OpenMOSS-Team y publicado por el usuario lodestones. Está entrenado a resolución de 1024 px y conserva exactamente la misma arquitectura, pipeline de inferencia, codificador de texto (Qwen3.5-9B) y VAE (decodificador pequeño de FLUX.2) que MOSS-Image-SFT, por lo que el repositorio es un reemplazo directo (*drop-in replacement*) de este último.

El modelo resuelve la generación de imágenes fotorrealistas y artísticas a partir de descripciones textuales en inglés, con un checkpoint entrenado sobre 704.000 imágenes (actualización 11.000 del ajuste fino, pesos EMA). Su relevancia actual radica en que combina un transformer de difusión de gran tamaño con un codificador de lenguaje de 9B parámetros, lo que le permite interpretar prompts complejos y detallados, y en que el repositorio incluye dos LoRAs turbo destiladas (DMD y DMD2) que reducen la inferencia de 50 pasos a solo 8 pasos con CFG 1.

El repositorio, de 255 GB, distribuye tanto los pesos en formato diffusers como archivos únicos optimizados para ComfyUI (bf16 e int8 ConvRot W8A8), además de scripts de conversión y cuantización que reproducen byte a byte los archivos oficiales de Comfy-Org. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MOSS-Image) con codificador de texto Qwen3.5-9B y VAE FLUX.2 small decoder |
| Parametros totales | 5.082.308.624 (5,08 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp32 (VAE y LoRAs), int8 ConvRot W8A8 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers y archivos unicos para ComfyUI) |

## Arquitectura y entrenamiento

Kromoss emplea la arquitectura MOSS-Image, un transformer de difusion para generacion de imagenes texto-a-imagen. El pipeline combina tres componentes: un transformer de difusion (que opera en bfloat16), un codificador de texto Qwen3.5-9B (tambien en bfloat16) y un VAE basado en el decodificador pequeno de FLUX.2 (en float32, al igual que el ruido inicial). El modelo trabaja a 1024 px y utiliza una omision de capas incondicionales (`uncond_skip_layers=[22]`) durante la inferencia con CFG.

El entrenamiento consistio en un ajuste fino completo sobre MOSS-Image-Base con 704.000 imagenes, alcanzando la actualizacion 11.000 del proceso (pesos EMA). Ademas, el repositorio incluye dos LoRAs de destilacion para acelerar la inferencia: `8-steps-dmd-lora.safetensors`, destilacion DMD en espacio de datos con 12.000 actualizaciones, y `8-steps-dmd2-lora.safetensors`, que continua ese entrenamiento durante 3.000 actualizaciones adicionales con la segunda etapa de DMD2 (un discriminador GAN sobre la puntuacion falsa entrenado contra imagenes reales, a un cuarto de la tasa de aprendizaje). Ambas LoRAs son fp32, con rango 128 y alpha 128 en cada bloque (`proj.{q,k,v,o,ffn_up_gate,ffn_down}`), y usan claves de kohya.

Como innovacion tecnica destacable, el repositorio incluye `convert_to_comfy.py`, que convierte cualquier carpeta `transformer/` de MOSS-Image al formato de archivo unico de ComfyUI (fusionando `proj.qkv`), y `quantize_convrot.py`, que genera el formato int8 ConvRot W8A8 aplicando una rotacion de Hadamard regular de anchura 256 sobre la dimension de entrada, con escalas por fila. ComfyUI reconstruye la rotacion en tiempo de carga y la aplica en linea a las activaciones, sin almacenar matrices de rotacion.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024 px a partir de prompts en ingles.
- Interpretacion de prompts complejos y detallados gracias al codificador de texto Qwen3.5-9B.
- Inferencia rapida en 8 pasos con CFG 1 mediante las LoRAs turbo DMD/DMD2 (sin rama negativa); 4 pasos tambien funciona.
- Inferencia de alta calidad en 50 pasos con CFG 3 y omision de capas incondicionales.
- Compatibilidad nativa con ComfyUI (carga de modelo de difusion, CLIP tipo `moss_image`, VAE y LoRAs).
- Compatibilidad con diffusers mediante `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`.
- Soporte de cuantizacion int8 ConvRot W8A8 con atencion int8 de ComfyUI.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento.

## Casos de uso

- Generacion de ilustraciones para publicaciones y articulos: el modelo produce imagenes de 1024 px a partir de descripciones detalladas en ingles, adecuado para portadas, cabeceras y material editorial donde se requiere coherencia con un prompt largo.
- Creacion de conceptos visuales en diseno de producto: con 50 pasos y CFG 3 se obtienen resultados de mayor fidelidad para explorar variaciones de un concepto antes de pasar a produccion.
- Prototipado rapido en flujos de trabajo con ComfyUI: la LoRA DMD2 permite generar en 8 pasos con CFG 1, lo que reduce el coste por iteracion en sesiones de exploracion creativa.
- Integracion en pipelines automatizados de generacion de imagenes: los archivos unicos bf16 e int8 ConvRot se cargan directamente en ComfyUI, lo que facilita el despliegue en servidores de generacion por lotes.
- Ajuste fino posterior por parte de estudios: al ser un reemplazo directo de MOSS-Image-SFT y estar bajo Apache 2.0, sirve como base para fine-tunes propios con el mismo pipeline y scripts de conversion incluidos.
- Despliegue con requisitos de memoria reducidos: la variante int8 ConvRot (5,4 GB) permite ejecutar el transformer en GPUs con menos VRAM que la version bf16, manteniendo compatibilidad con las LoRAs.
- Generacion de imagenes de referencia para documentacion tecnica o demos: el ejemplo de la model card (un gato atigrado sosteniendo un cartel con texto) muestra capacidad de renderizar texto legible en la imagen.

## Benchmarks y rendimiento

La model card menciona que la LoRA `8-steps-dmd2-lora` obtiene "la mejor puntuacion de PartiPrompts", pero no se proporcionan valores numericos de benchmarks (MMLU, HumanEval, GSM8K ni metricas de generacion de imagenes como FID o CLIP score) en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El transformer bf16 y el codificador de texto Qwen3.5-9B se cargan en bfloat16, y el VAE en float32; el repositorio completo ocupa 255 GB, aunque la inferencia solo requiere el transformer, el text encoder y el VAE.
- Variante int8 ConvRot: el archivo del transformer ocupa 5,4 GB, lo que reduce sustancialmente los requisitos de VRAM frente a bf16.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la variante int8 esta pensada para reducir el consumo de memoria.
- Opciones de despliegue: diffusers (>=0.38) con `MOSSImagePipeline`, transformers (>=5.3), accelerate (>=1.10), safetensors (>=0.6) y Pillow (>=10); ComfyUI nativo (master actual) con los archivos unicos.
- Latencia y throughput: no disponibles. La LoRA DMD2 reduce la inferencia de 50 pasos a 8 pasos con CFG 1, lo que disminuye el coste computacional por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Notas |
|---|---|---|---|---|---|
| Kromoss | 5,08 mil millones | no disponible | 1024 px | Apache 2.0 | Fine-tune de MOSS-Image-Base; LoRAs turbo de 8 pasos |
| MOSS-Image-SFT | no disponible | no disponible | 1024 px | no disponible en la informacion | Modelo base oficial de OpenMOSS-Team; mismo pipeline y layout |
| MOSS-Image-Base | no disponible | no disponible | 1024 px | no disponible en la informacion | Modelo base sobre el que se entrena Kromoss y del que se destilan las LoRAs |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles; los prompts en otros idiomas pueden degradar la calidad o no interpretarse correctamente.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos incoherentes, texto mal renderizado o detalles anatomicos incorrectos, especialmente con prompts ambiguos.
- No se documentan sesgos conocidos en la model card; al entrenarse con 704.000 imagenes, puede heredar sesgos presentes en ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base MOSS-Image-Base y sus componentes (Qwen3.5-9B, VAE FLUX.2) pueden tener condiciones propias que deben verificarse por separado.
- Las LoRAs turbo deben aplicarse sin fusionar en los pesos bf16 (el delta esta cerca del paso de redondeo de bf16) y de una en una.
- La cuantizacion int8 ConvRot requiere ComfyUI para reconstruir la rotacion de Hadamard en tiempo de carga; no es un formato generico para otros runners.
- El repositorio es muy grande (255 GB), lo que exige espacio de almacenamiento considerable y descargas largas.
- No hay informacion sobre latencia, throughput ni requisitos minimos de VRAM, lo que dificulta la planificacion de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodestones/Kromoss
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Archivos para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
