# Ria564/QIE-2511-Studio-DeLight

## Resumen

QIE-2511-Studio-DeLight es un adaptador LoRA para el modelo de edición de imagen a imagen Qwen-Image-Edit-2511, desarrollado por el usuario Ria564 (la model card atribuye el trabajo a Prithiv Sakthi y referencia la cuenta prithivMLmods en los ejemplos de código). Su función concreta es el relighting: elimina la iluminación existente de una fotografía y la sustituye por una luz de estudio neutra, suave y difusa, preservando la identidad del sujeto, la composición, las texturas y la geometría de la escena original. El adaptador busca exposición equilibrada, sombreado realista y ausencia de artefactos, altas luces duras o sombras direccionales.

El modelo es relevante para flujos de posproducción fotográfica y generación de imágenes donde se necesita normalizar la iluminación antes de aplicar otros efectos o de alimentar un pipeline posterior. Al ser un LoRA de bajo rango sobre un modelo base de edición, el coste de almacenamiento es reducido (el repositorio ocupa 0,9 GB) y se puede cargar sobre el modelo base con la librería diffusers sin reentrenar nada.

La información disponible es escasa: no se publican especificaciones de rangos, dimensiones de entrenamiento ni número de pasos. La model card indica que el adaptador es compatible tanto con la versión 2509 como con la 2511 del modelo base, que se entrenó en ModelScope.cn y que está inspirado en el LoRA Flux2-Klein-Delight-LoRA de linoyts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de edición de imagen Qwen-Image-Edit-2511; no disponible el detalle del transformer subyacente |
| Parametros totales | no disponible (el repositorio pesa 0,9 GB, pero no se desglosa el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible de forma explícita; el ejemplo de la model card usa `torch.bfloat16` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explícita; se carga mediante `pipe.load_lora_weights` de diffusers |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre Qwen-Image-Edit-2511, un modelo de difusión para edición de imagen a imagen. El LoRA modifica el comportamiento del modelo base para que, ante el prompt de activación, sustituya la iluminación de la imagen de entrada por una iluminación neutra y uniforme de estudio. La model card no detalla el rango del LoRA, las capas objetivo, el número de pasos de entrenamiento ni la composición del dataset; únicamente indica que el entrenamiento se realizó en ModelScope.cn.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO u otras). El mecanismo de control es puramente textual: un prompt disparador fijo activa el comportamiento de relighting, y el autor advierte que el adaptador funciona mejor en sesiones fotográficas de interior, imágenes sobreprocesadas e imágenes con colores fusionados, mientras que en escenas abiertas puede producir fondos blancos o despejados porque la luz solar dura tiende a neutralizarse.

## Capacidades

- Relighting de imágenes: elimina la iluminación original y aplica luz de estudio neutra, suave y difusa.
- Preservación de identidad, composición, texturas y geometría de la imagen de entrada.
- Exposición equilibrada y sombreado realista, sin altas luces duras ni sombras direccionales según el autor.
- Edición de imagen a imagen (pipeline `image-to-image`) mediante diffusers.
- Compatibilidad declarada con las versiones 2509 y 2511 del modelo base Qwen-Image-Edit.
- Activación mediante prompt disparador: `Neutral uniform lighting Preserve identity and composition`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un adaptador especializado en una única tarea de edición de imagen.

## Casos de uso

- Normalización de iluminación en fotografía de producto: se aplica el LoRA sobre fotos tomadas con luz mixta para obtener una iluminación de estudio uniforme antes de publicar en catálogo, aprovechando la preservación de texturas y geometría.
- Posproducción de retrato en interior: el adaptador corrige sombras direccionales y altas luces duras en sesiones de estudio o interiores, manteniendo la identidad del sujeto según la model card.
- Limpieza de imágenes sobreprocesadas: el autor indica que funciona mejor en imágenes sobreprocesadas y con colores fusionados, por lo que sirve para recuperar una apariencia fotográfica neutra.
- Preprocesado para pipelines generativos: normalizar la iluminación de una imagen de referencia antes de alimentar otro modelo de edición o de generación condicionada, reduciendo la variabilidad de entrada.
- Creación de variantes consistentes de un mismo sujeto: al preservar identidad y composición, permite generar versiones con iluminación neutra para comparar o seleccionar en flujos de diseño.
- Integración en herramientas de edición con diffusers: el adaptador se carga con `load_lora_weights` sobre el pipeline de Qwen-Image-Edit, lo que facilita incorporarlo a scripts de procesamiento por lotes en Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Qwen-Image-Edit-2511, que debe cargarse completo en `bfloat16` según el ejemplo de la model card.
- GPU recomendadas: no disponibles; el ejemplo oficial usa `device_map="cuda"` y menciona `mps` para dispositivos Apple.
- ¿Cabe en GPU de consumo? no disponible; el repositorio del LoRA ocupa 0,9 GB, pero el requisito real lo marca el modelo base.
- Opciones de despliegue: diffusers (con `DiffusionPipeline` y `load_lora_weights`), transformers y accelerate; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QIE-2511-Studio-DeLight | LoRA | Qwen-Image-Edit-2511 | Relighting de estudio | apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Flux2-Klein-Delight-LoRA (linoyts) | LoRA | Flux2-Klein | Relighting (inspiración declarada) | no disponible | Hugging Face |
| Qwen-Image-Edit-2511 | Modelo completo | — | Edición de imagen a imagen | no disponible en esta ficha | Hugging Face (Qwen) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- En escenas abiertas puede generar fondos blancos o despejados, ya que la luz solar dura tiende a neutralizarse según el autor.
- Está pensado para sesiones fotográficas de interior, imágenes sobreprocesadas e imágenes con colores fusionados; su comportamiento fuera de esos casos es menos fiable.
- El prompt disparador es fijo y necesario para activar el comportamiento; no se documenta sensibilidad a variaciones del prompt.
- Solo se declara soporte de inglés (`en`); no hay información sobre otros idiomas.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad objetivas.
- Licencia apache-2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen-Image-Edit-2511, que no se detalla en esta ficha.
- El repositorio no tiene descargas ni likes en el momento de la consulta, y la model card mezcla identificadores de autor (Ria564, prithivMLmods, Prithiv Sakthi), lo que conviene tener en cuenta para trazabilidad y soporte.
- No hay información sobre el rango del LoRA, los datos de entrenamiento ni la reproducibilidad de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Ria564/QIE-2511-Studio-DeLight
- Archivos del modelo (referenciados en la model card): https://huggingface.co/prithivMLmods/QIE-2511-Studio-DeLight/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA de inspiración: https://huggingface.co/linoyts/Flux2-Klein-Delight-LoRA
- Plataforma de entrenamiento: https://modelscope.cn
