# RunningHubAI/rh-klein-enhancev1.1-lora

## Resumen

rh-klein-enhancev1.1-lora es un adaptador LoRA de bajo rango para generación de imagen a partir de texto, publicado por RunningHub bajo la cuenta RunningHubAI. El adaptador se ha entrenado sobre FLUX.2-klein-9B (9B parámetros según la denominación del modelo base) y su objetivo declarado es mejorar la textura de piel realista en personas: poros, microdetalle, irregularidades naturales y transiciones tonales, evitando el aspecto plastificado típico de los modelos afinados hacia estética limpia. Está pensado para retrato fotográfico y realce de detalle de piel.

A diferencia de un modelo completo, este repositorio solo contiene el delta de pesos (332 MiB en `Klein-enhance真实皮肤质感v1.1.safetensors`), no un pipeline autónomo: requiere cargar el modelo base FLUX.2-klein-9B en ComfyUI, en RunningHub o en cualquier runtime compatible con safetensors y LoRA para difusión. El repositorio ocupa 0,4 GB y se publicó el 29 de septiembre de 2026.

Su relevancia es acotada y muy específica: no compite en benchmarks generales ni en razonamiento, sino que resuelve un problema recurrente en producción de imagen (fotorrealismo de piel en primer plano). Es un ejemplo del patrón actual de publicación de ajustes finos verticales sobre modelos base abiertos, distribuidos por plataformas de inferencia con API propia. No hay evidencia de adopción: 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre FLUX.2-klein-9B, modelo de difusión con transformer (DiT) |
| Parametros totales | no disponible (el LoRA pesa 332 MiB; no se indica el número de parámetros ni el rango de las matrices) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no se especifica resolución nativa de entrenamiento) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantización aplicable es la del modelo base: fp16, fp8, GGUF según el runtime) |
| Idiomas soportados | no disponible (el prompt de texto depende del codificador de texto del modelo base; la model card no especifica idiomas) |
| Licencia | no disponible (la model card indica que se publica en nombre del autor y remite a la licencia del proyecto original o del modelo base) |
| Formato de pesos | safetensors (`Klein-enhance真实皮肤质感v1.1.safetensors`, 332 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base para desplazar sus pesos sin reentrenarlo por completo. El modelo base declarado es FLUX.2-klein-9B, un transformer de difusión de la familia FLUX.2, orientado a generación de imagen a partir de texto. El LoRA modifica el comportamiento del base en la dirección de un mayor realismo de piel: el autor describe el propósito como «mejorar la textura de piel realista de personas, conservando texturas y detalles naturales de la piel», aplicable a retratos y a realce de detalle cutáneo.

No hay información pública en el repositorio sobre el proceso de entrenamiento: ni número de imágenes, ni composición del dataset, ni pasos, learning rate, rango del LoRA, resolución de entrenamiento, ni si hubo fases de refuerzo o preferencia humana (RLHF/DPO), que en difusión no son el mecanismo habitual. La única referencia operativa es que el entrenamiento se realizó en la plataforma RunningHub, que ofrece servicio de entrenamiento de modelos. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación de pasos) más allá del propio ajuste fino.

## Capacidades

- Generación de imágenes fotorrealistas de personas a partir de texto, condicionada por el modelo base FLUX.2-klein-9B.
- Realce y preservación de microtextura de piel: poros, arrugas finas, pecas, variaciones tonales y asimetrías naturales.
- Aplicable a retrato fotográfico, moda, cosmética y dermatología estética como paso de postproceso estilístico.
- Compatible con flujos img2img y con ControlNet u otros condicionamientos del base en ComfyUI, si el base los soporta (no se documenta explícitamente en la model card).
- Integración en pipelines de ComfyUI y en la plataforma RunningHub; también cargable desde Hugging Face.
- Tool calling / function calling: no aplica (modelo de imagen).
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no documentadas; dependen del codificador de texto del modelo base.
- Capacidad especial: ninguna adicional declarada (no hay modo «thinking», audio ni visión de entrada documentados).

## Casos de uso

- Retrato de estudio en producción: aplicar el LoRA sobre FLUX.2-klein-9B para generar o refinar retratos con textura de piel creíble, reduciendo el retoque posterior de piel en lotes de headshots corporativos o editoriales.
- Publicidad de cosmética y cuidado de la piel: generar imágenes de rostros en primer plano donde el detalle de poro y la irregularidad tonal son el argumento comercial, sin el aspecto de plástico que penaliza la credibilidad del anuncio.
- Previsualización de maquillaje y prótesis: en pipelines de preproducción audiovisual, generar variantes de textura de piel antes de decidir el trabajo de caracterización real.
- Contenido de moda y catálogo: mantener coherencia de piel realista entre cientos de imágenes generadas, ejecutando el LoRA como paso fijo en el grafo de ComfyUI.
- Realce de material existente en img2img: pasar fotografías de baja calidad de piel o renders 3D de personajes por un ciclo img2img de baja denoising para inyectar microdetalle manteniendo la identidad del sujeto.
- Presets de API en producto SaaS: empaquetar el LoRA como preset de una API de generación de imagen (por ejemplo, sobre RunningHub) para ofrecer un modo «piel realista» a clientes que no gestionan modelos localmente.
- Investigación en evaluación de fotorrealismo: usar el adaptador como condición experimental en estudios sobre percepción de realismo y artefactos de piel en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparativas humanas, ni ninguna métrica cuantitativa. Al tratarse de un LoRA de estilo/detalle, la evaluación habitual es visual y subjetiva, y el repositorio no aporta muestras comparativas ni parámetros de inferencia (pasos, CFG, sampler, resolución) recomendados.

## Requisitos de hardware

- El LoRA en sí añade un coste marginal: 332 MiB de pesos que se suman en memoria a los del modelo base FLUX.2-klein-9B.
- Requisitos reales determinados por el base de 9B parámetros y su pipeline de codificación de texto. Estimaciones orientativas (no publicadas por el autor) para generación a resolución típica de 1024 px:
  - fp16: del orden de 20-24 GB de VRAM.
  - fp8: del orden de 12-16 GB de VRAM.
  - Cuantizaciones GGUF de 4 bits: del orden de 8-10 GB de VRAM.
- Cabe en GPU de consumo: RTX 4090 y 3090 (24 GB) en fp16/fp8 con holgura; RTX 4080/4070 Ti (16 GB) en fp8 o GGUF cuantizado; GPUs de 8-12 GB solo con GGUF agresivo y offload a RAM.
- GPU de datacenter recomendadas para lotes y producción: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- Opciones de despliegue: ComfyUI (escenario documentado por el autor), la propia plataforma RunningHub, y runtimes compatibles con safetensors para difusión; llama.cpp/Ollama no aplican a este tipo de modelo, sí variantes GGUF de difusión si el runtime las soporta.
- Latencia y throughput: no disponibles. No se publican cifras de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-klein-enhancev1.1-lora (este) | 332 MiB de pesos LoRA (parametros no indicados) | LoRA sobre FLUX.2-klein-9B | No documentada | no disponible (remite al proyecto original) | Hugging Face (0 descargas), ComfyUI, RunningHub |
| FLUX.2-klein-9B (modelo base) | 9B (segun denominacion) | Transformer de difusion completo | No documentada en esta informacion | La del proyecto FLUX.2 (no verificada aqui) | Repositorio oficial del base |
| LoRAs alternativos de textura de piel sobre FLUX.2 / FLUX.1 | no disponible | LoRA | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables concretos en la documentación proporcionada, por lo que la única comparación verificable es contra el propio modelo base.

## Limitaciones y advertencias

- Sin métricas ni muestras comparativas: no hay evidencia cuantitativa ni cualitativa publicada del efecto real del LoRA frente al base.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de la comunidad ni casos de uso verificados.
- Licencia no especificada: la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del modelo base. Antes de cualquier uso comercial hay que verificar la licencia de FLUX.2-klein-9B, que no se detalla en el repositorio.
- Documentación de entrenamiento ausente: no se declaran dataset, número de pasos, rango del LoRA, resolución de entrenamiento ni hiperparámetros, lo que impide reproducir o auditar el ajuste.
- No se documentan palabras de activación (trigger words) ni pesos recomendados para el LoRA, lo que dificulta su uso correcto en ComfyUI (un peso mal elegido puede degradar la imagen o saturar la textura).
- Sesgos esperables: al entrenarse para textura de piel, puede imponer un aspecto cutáneo concreto (tono, porosidad, edad aparente) y homogeneizar rostros de grupos demográficos poco representados en el dataset de ajuste, que se desconoce.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar detalles anatómicos incorrectos (manos, dentadura, orejas) y texturas de piel incoherentes en zonas oculares o en iluminaciones extremas.
- Especialización estrecha: no aporta capacidades nuevas de control, composición ni tipografía; solo desplaza el estilo de piel del base.
- Dependencia del base: cualquier limitación de contexto de prompt, resolución o idioma del codificador de texto de FLUX.2-klein-9B se hereda íntegramente.
- El repositorio incluye enlaces de promoción con parámetros UTM hacia RunningHub; conviene tratarlos como material comercial, no como documentación técnica.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-klein-enhancev1.1-lora
- README en chino (referenciado en la model card): README_cn.md (mismo repositorio)
- Proyecto original del modelo: https://www.runninghub.cn/model/public/2060355823880200193
- Página del autor: https://www.runninghub.cn/user-center/2025581316556464129
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API (promoción): https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2060355823880200193
- Modelo base: FLUX.2-klein-9B (enlace oficial no incluido en la información proporcionada)
