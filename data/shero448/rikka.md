# Shero448/rikka

## Resumen

`Shero448/rikka` es un adaptador LoRA de texto a imagen publicado en Hugging Face por el usuario Shero448. No se trata de un modelo fundacional, sino de un ajuste fino ligero (LoRA) que se aplica sobre el modelo base `John6666/prefect-illustrious-xl-v15-sdxl`, un checkpoint SDXL orientado a ilustración anime. Su función es especializar el modelo base para generar de forma consistente a un personaje concreto, activado mediante la palabra clave `rikkaponyxl` y una serie de tokens descriptivos del personaje (pelo bicolor, coleta alta, ojos morados, gafas, pendientes, etc.).

El repositorio es muy pequeño (0,2 GB) y está en formato diffusers, con la etiqueta `template:diffusion-lora`, lo que indica que se carga como adaptador sobre el pipeline del modelo base en lugar de como checkpoint completo. La model card incluye un ejemplo de prompt con la sintaxis `<lora:Sumeragi_Rikka_-_Seika_Jogakuin_Kounin_Sao_Ojisan:1>`, lo que sugiere que el LoRA se entrenó para el personaje Sumeragi Rikka.

La relevancia de esta ficha es acotada: se trata de un artefacto de la comunidad, sin métricas publicadas, sin licencia declarada y sin documentación técnica sobre el proceso de entrenamiento. Es útil para quien quiera reproducir el personaje en un pipeline SDXL con diffusers, pero no debe evaluarse como un modelo generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión SDXL (text-to-image) |
| Parametros totales | no disponible (el repo pesa 0,2 GB; el número de parámetros del LoRA no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión; la longitud de prompt efectiva la fija el tokenizador del modelo base) |
| Tipos de cuantizacion | no disponible (formato diffusers; el modelo base admite fp16/fp32 y variantes GGUF de terceros, pero no se declara para este LoRA) |
| Idiomas soportados | no disponibles (los prompts del ejemplo están en inglés) |
| Licencia | no disponible |
| Formato de pesos | diffusers (adaptador LoRA); tamaño del repo 0,2 GB |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención y proyección del modelo base SDXL (`John6666/prefect-illustrious-xl-v15-sdxl`). SDXL es un modelo de difusión latente con un UNet y doble text encoder (CLIP ViT-L y CLIP ViT-bigG), y este LoRA modifica los pesos del UNet para sesgar la generación hacia el personaje objetivo. La etiqueta `template:diffusion-lora` confirma el formato de integración en diffusers.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron técnicas como regularización o captions automáticos. La model card solo aporta las palabras clave de activación y un prompt de ejemplo con parámetros de muestreo no especificados (no se indican steps, CFG ni sampler). La nomenclatura `rikkaponyxl` en el instance prompt sugiere un origen de entrenamiento vinculado a Pony Diffusion, aunque el modelo base declarado es Illustrious XL; esta discrepancia no está aclarada por el autor.

## Capacidades

- Generación de imágenes de texto a imagen en estilo ilustración anime, heredando las capacidades del modelo base SDXL Illustrious.
- Especialización de personaje: activa el personaje Sumeragi Rikka mediante el token `rikkaponyxl`.
- Control fino de atributos del personaje mediante tokens: `two-tone hair`, `multicolored hair`, `black hair`, `white hair`, `high ponytail`, `purple eyes`, `eyewear`, `earrings`, `large breasts`, `rolls`, `thick thighs`.
- Composición de escenas: el prompt de ejemplo incluye escenario (`scenery`, `room`, `santa tree`), iluminación (`backlighting`, `moonlight`, `blue light`), cámara (`dutch angle`, `from above`, `full body`) y expresiones.
- Soporte de prompt negativo para filtrar calidad y anatomía (`lowres`, `bad anatomy`, `3d`, `realistic`, etc.).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo de imagen.

## Casos de uso

- Ilustración de personaje consistente: usar `rikkaponyxl` junto con los tokens de atributos para generar variaciones del personaje manteniendo su identidad visual en distintas poses y escenarios.
- Creación de fan art: el prompt de ejemplo (traje de Santa, selfie, iluminación nocturna) muestra el uso típico para ilustraciones temáticas de temporada.
- Pruebas de concepto de personaje para proyectos de ficción: generar hojas de expresiones o variaciones de vestuario partiendo de la misma semilla y tokens.
- Integración en pipelines de generación por lotes con diffusers: al ser un LoRA de 0,2 GB, se puede cargar y descargar del pipeline base para alternar entre personajes sin recargar el checkpoint completo.
- Prototipado rápido en notebooks: el tamaño reducido permite iterar en GPU de consumo con el modelo base en fp16.
- Composición de escenas con control de cámara e iluminación: útil para storyboards o referencias visuales donde se requiere un encuadre concreto (`dutch angle`, `from above`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros LoRA de personaje.

## Requisitos de hardware

- El LoRA en sí ocupa 0,2 GB, pero requiere cargar el modelo base SDXL completo (`John6666/prefect-illustrious-xl-v15-sdxl`), que en fp16 ronda los 6-7 GB de pesos.
- VRAM estimada para inferencia: aproximadamente 8-10 GB en fp16 con el pipeline diffusers estándar; puede reducirse con `enable_model_cpu_offload` o `enable_sequential_cpu_offload`.
- GPU recomendadas: RTX 3090/4090 (24 GB) para comodidad; A100/H100 para generación por lotes. En GPUs de 8 GB puede funcionar con offloading agresivo y resolución reducida.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4070) con el modelo base en fp16 y atención optimizada (xformers o SDPA).
- Opciones de despliegue: diffusers (formato nativo del repo), ComfyUI y Automatic1111/Forge mediante carga del LoRA sobre el checkpoint base, y conversión a otros formatos si se requiere.
- Latencia y throughput: no disponibles; dependen del hardware, la resolución, el número de steps y el sampler, ninguno de los cuales se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño repo | Licencia | Documentación |
|---|---|---|---|---|---|
| Shero448/rikka | LoRA de personaje | prefect-illustrious-xl-v15-sdxl | 0,2 GB | no disponible | mínima (solo trigger words) |
| John6666/prefect-illustrious-xl-v15-sdxl | Checkpoint SDXL completo | SDXL | no disponible en esta ficha | no disponible | no disponible en esta ficha |
| LoRA de personaje típico en la comunidad | LoRA de personaje | SDXL / Pony / Illustrious | 0,1-0,5 GB | variable | variable |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas concretas; la comparación anterior es estructural, no de calidad.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial es incierto y depende tanto de la licencia del LoRA como de la del modelo base, que no se especifica en la información disponible.
- Sin métricas ni evaluación: no hay evidencia publicada de calidad, consistencia del personaje ni robustez ante prompts fuera de distribución.
- Discrepancia de nomenclatura: el instance prompt usa `rikkaponyxl` mientras el modelo base declarado es Illustrious XL; conviene verificar la compatibilidad real antes de usarlo en producción.
- Riesgo de sobreajuste al estilo del dataset de entrenamiento y de degradación al combinarlo con otros LoRA o con prompts muy alejados del personaje.
- El prompt de ejemplo incluye términos sexualizados y `censored` en el prompt positivo y negativo; el contenido generado puede no ser apto para todos los públicos y requiere moderación en despliegues abiertos.
- Sin soporte multilingüe documentado: los prompts de ejemplo están en inglés y no se garantiza el comportamiento con otros idiomas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- Riesgo de alucinación visual (artefactos anatómicos, texto ilegible) inherente a los modelos de difusión, mitigable parcialmente con prompt negativo y selección de semilla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shero448/rikka
- Archivos del modelo: https://huggingface.co/Shero448/rikka/tree/main
- Modelo base: https://huggingface.co/John6666/prefect-illustrious-xl-v15-sdxl
