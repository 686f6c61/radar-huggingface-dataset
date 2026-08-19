# lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B

## Resumen

MiniMax-H3-Prompt-Rewriter-LoRA-8B es un adaptador LoRA (PEFT) desarrollado por LightX2V que transforma solicitudes breves de usuario en prompts estructurados y listos para producción, orientados a la generación conjunta de audio y vídeo con el modelo MiniMax-H3. Se construye sobre el modelo base Qwen3-VL-8B-Instruct, un modelo multimodal de lenguaje y visión, y cubre cuatro tareas de reescritura: texto a audio-vídeo (T2VA), imagen inicial más texto (I2VA), imagen final más texto (L2VA) y combinación de primera y última imagen (FL2VA). El adaptador genera un prompt enriquecido con una línea de tiempo de planos, sonido físico y ambiental sincronizado, y guía de música no diegética, lo que facilita la generación de vídeos coherentes con el motor MiniMax-H3.

Este modelo es relevante porque permite ejecutar localmente una parte del pipeline de generación de vídeo que normalmente depende de servicios propietarios, democratizando el flujo de trabajo creativo. A diferencia de la versión anterior del adaptador (basada en Qwen3.6-27B), esta variante de 8B acepta referencias visuales (primer y último fotograma) y soporta las cuatro tareas de reescritura mencionadas. El repositorio incluye scripts de inferencia, plantillas de prompt y documentación para integrarlo con LightX2V, el framework de generación de vídeo de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (el adaptador LoRA tiene un número reducido de parámetros, pero no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse según las opciones de Qwen3-VL) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) y config JSON (adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-VL-8B-Instruct, un modelo transformer multimodal que procesa texto e imágenes. La capa LoRA se entrena para reescribir prompts de usuario en un formato estructurado específico para MiniMax-H3, incluyendo una línea de tiempo de planos, descripciones de sonido físico y ambiental, y guía de música no diegética. El entrenamiento cubre cuatro tareas: T2VA (texto a audio-vídeo), I2VA (primera imagen + texto), L2VA (última imagen + texto) y FL2VA (primera y última imagen + texto). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO. El adaptador se distribuye como un único archivo de pesos en safetensors, junto con un script de inferencia (`infer.py`) y una plantilla de prompt (`prompt_template.py`) que define el sistema de instrucciones y la construcción de mensajes.

## Capacidades

- Reescritura de prompts para generación de audio-vídeo con MiniMax-H3, produciendo descripciones estructuradas con línea de tiempo, sonido y música.
- Soporte de entrada multimodal: texto solo, primera imagen + texto, última imagen + texto, y primera + última imagen + texto.
- Generación de prompts con decodificación greedy para resultados deterministas.
- Integración con LightX2V para la generación final del vídeo, manteniendo la geometría de la tarea y el orden de las imágenes.
- Capacidad de comparación con el modelo base sin adaptador mediante la opción `--base-only`.
- Multilingüe limitado al inglés (según la etiqueta `language: en`).

## Casos de uso

- Generación de vídeo a partir de texto: un usuario escribe una descripción breve como "un corgi corre por un callejón lluvioso con neones", y el adaptador la convierte en un prompt detallado con planos, sonido y música para MiniMax-H3.
- Animación de una imagen inicial: se proporciona un primer fotograma y una instrucción de movimiento; el adaptador genera un prompt que describe la transición temporal y el audio sincronizado.
- Continuación desde un fotograma final: se usa una última imagen como referencia para crear una escena que termine en esa pose, con el adaptador generando la narrativa y el sonido.
- Transición cinematográfica entre dos fotogramas: con primera y última imagen, el adaptador produce un prompt que describe una transición continua entre ambos estados.
- Automatización de pipelines de creación de contenido: integración en flujos de trabajo donde se necesitan prompts de alta calidad para generación de vídeo sin intervención manual.
- Prototipado rápido de ideas audiovisuales: los creadores pueden iterar sobre conceptos breves y obtener prompts listos para producción, reduciendo el tiempo de diseño de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del adaptador.
- Al ser un adaptador LoRA sobre Qwen3-VL-8B-Instruct, se necesita una GPU con suficiente VRAM para cargar el modelo base (típicamente 16 GB o más en FP16, pero depende de la cuantización elegida).
- El script de inferencia permite configurar `dtype`, `device-map` y `processor pixel-budget`, lo que facilita el ajuste a diferentes GPUs.
- Se recomienda usar decodificación greedy para resultados deterministas, lo que reduce la carga computacional frente a sampling.
- El despliegue puede realizarse con frameworks compatibles con PEFT, como Hugging Face Transformers, y la generación final requiere LightX2V para MiniMax-H3.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de reescritura de prompts. Existe una versión anterior del mismo adaptador (MiniMax-H3-Prompt-Rewriter-LoRA) basada en Qwen3.6-27B, pero no se detallan sus especificaciones ni rendimiento. Se recomienda consultar la documentación de LightX2V para más contexto.

## Limitaciones y advertencias

- El adaptador es una aproximación aprendida de la reescritura de prompts y no replica el servicio propietario MiniMax Context-IR.
- Puede añadir detalles creativos plausibles más allá de la solicitud original; se debe revisar identidad, diálogo, texto visible y contenido sensible antes de la generación.
- La calidad de la reescritura condicionada por imágenes depende de la claridad y consistencia de los fotogramas de referencia.
- La calidad final del audio-vídeo depende del checkpoint de MiniMax-H3, la configuración de inferencia y la geometría de la tarea.
- El repositorio es privado en el momento de la publicación, por lo que se requiere autenticación de Hugging Face para acceder a los archivos.
- La licencia no está especificada, lo que puede limitar el uso comercial; se debe consultar al autor antes de utilizarlo en producción.
- Solo soporta inglés, lo que restringe su uso en entornos multilingües.

## Enlaces

- [Hugging Face - MiniMax-H3-Prompt-Rewriter-LoRA-8B](https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B)
- [Hugging Face - MiniMax-H3-Prompt-Rewriter-LoRA (versión original)](https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA)
- [GitHub - LightX2V](https://github.com/ModelTC/LightX2V)
- [ModelScope - MiniMax-H3 T2VA Prompt Rewriter LoRA](https://www.modelscope.cn/models/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA)
- [Hugging Face - Qwen3-VL-8B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)
