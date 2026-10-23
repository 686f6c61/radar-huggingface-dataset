# RunningHubAI/rh-f.1-v1-checkpoint

## Resumen

`rh-f.1-v1-checkpoint` es un checkpoint de difusión para generación de imágenes publicado por RunningHubAI (RunningHub) en nombre del autor identificado en la model card como `@NINE.JIUGE`. No es un modelo de lenguaje: se distribuye como un único archivo `.safetensors` de 11.350 MiB (11,9 GB de repositorio) y su formato de uso previsto es ComfyUI, la plataforma RunningHub o su API. El repositorio no incluye pipeline declarado, licencia, idiomas ni documentación técnica sobre arquitectura o datos de entrenamiento.

Según la model card, el modelo deriva de un fine-tuning sobre una base denominada «F1基础 D» y está orientado a la generación de retratos fotográficos con un estilo muy concreto. La información pública se limita a los parámetros de muestreo recomendados (sampler Euler, 25 pasos, CFG ~3,5, peso 0,8 y ampliación de 1,5 a 2 veces) y a una sugerencia de prompt, sin tabla de benchmarks ni detalles de entrenamiento.

Su relevancia es, por tanto, limitada y de nicho: se trata de un checkpoint de la comunidad para flujos de trabajo de imagen en ComfyUI, sin las garantías de trazabilidad, licencia o evaluación que sí acompañan a los modelos base sobre los que presumiblemente se construye. Cualquier evaluación técnica seria requiere inspeccionar el propio archivo de pesos y la plataforma de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoint de difusión para imágenes; la model card no declara arquitectura) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se declara que sea MoE) |
| Longitud de contexto | No aplica (modelo de generación de imágenes, no de texto) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica un archivo safetensors de 11.350 MiB |
| Idiomas soportados | No disponible (la model card está en chino e inglés; no se declara soporte de prompts por idioma) |
| Licencia | No disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream, sin especificarla |
| Formato de pesos | safetensors (`甜美萝莉女生高清摄影写真独家F.1大模_V1.safetensors`, 11.350 MiB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La model card únicamente lo describe como un «checkpoint» cargable en ComfyUI / RunningHub / Hugging Face y declara que está afinado a partir de «F1基础 D», sin especificar la base técnica, el número de parámetros, la resolución nativa de entrenamiento ni el tipo de VAE o text encoder asociado. El tamaño del archivo (11,9 GB) es compatible con un checkpoint de difusión de gran tamaño, pero no se confirma en la documentación.

Tampoco hay datos sobre el volumen o composición del dataset de fine-tuning, ni sobre si se aplicaron técnicas de ajuste por preferencias, regularización o destilación. Los únicos parámetros documentados son de inferencia, no de entrenamiento: sampler Euler, 25 pasos, CFG en torno a 3,5, peso 0,8 y ampliación de 1,5 a 2 veces. No se describe ninguna innovación técnica (atención lineal, decodificación especulativa, control de composición, etc.).

## Capacidades

- Generación de imágenes texto-a-imagen en formato checkpoint, pensada para cargarse en ComfyUI u otros frontends compatibles.
- Estilo especializado en retrato fotográfico, según la denominación del propio archivo de pesos y la sugerencia de prompt de la model card.
- Ampliación («magnification») de 1,5 a 2 veces documentada como parte del flujo recomendado, es decir, uso combinado con upscalers del propio pipeline.
- Control de muestreo mediante parámetros explícitos: sampler, número de pasos, CFG y peso del prompt.
- Integración con la plataforma RunningHub y su API para ejecución remota.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo lingüístico.
- No se declaran capacidades multilingües, de vídeo, audio ni de edición instructiva.

## Casos de uso

- Prototipado de retratos para proyectos creativos: el checkpoint puede generar imágenes de referencia con el estilo afinado usando los parámetros documentados (Euler, 25 pasos, CFG 3,5), útil para presentar una dirección de arte antes de una sesión fotográfica real.
- Pruebas de composición e iluminación: al ser un checkpoint de difusión, permite iterar rápidamente sobre encuadres y esquemas de luz en un grafo de ComfyUI antes de invertir en producción.
- Evaluación comparativa de checkpoints: sirve como punto de comparación frente a otros modelos de retrato en pruebas internas de calidad, coherencia de rasgos y adherencia al prompt.
- Flujos img2img y upscaling dentro de ComfyUI: la ampliación de 1,5 a 2 veces recomendada encaja en pipelines de refinado por etapas para obtener salidas de mayor resolución.
- Base para fine-tuning posterior: al estar publicado como safetensors, un equipo puede reutilizarlo como punto de partida (respetando la licencia del proyecto upstream, que no está especificada) para un estilo propio.
- Automatización vía API de RunningHub: permite lanzar generaciones por lotes desde un servicio backend sin gestionar la GPU localmente, adecuado para pruebas de concepto.
- Docencia y experimentación con parámetros de muestreo: su tamaño y su configuración sencilla lo hacen manejable para demostrar el efecto de CFG, pasos y sampler en un curso de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye FID, CLIP score, comparativas humanas ni ninguna métrica cuantitativa de calidad de imagen. Tampoco se documentan tiempos de inferencia medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, un archivo safetensors de 11.350 MiB implica que la carga completa de los pesos en memoria ocupa del orden de 11-12 GB; el pico real de VRAM durante la inferencia es superior y depende de la resolución, el tamaño de lote y del VAE/text encoder que acompañe al checkpoint.
- GPU recomendadas: no disponible. Por el tamaño del archivo, se necesita al menos una GPU de 16-24 GB (por ejemplo, RTX 4090, A100 40 GB, H100) para trabajar sin descarga a memoria del sistema; no confirmado por el autor.
- GPU de consumo: no disponible con certeza. Tarjetas de 12 GB o menos requerirían técnicas de offloading o cuantización no documentadas para este checkpoint.
- Opciones de despliegue: ComfyUI (formato nativo declarado), plataforma RunningHub y su API. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles. Dependen del sampler (Euler documentado), de los 25 pasos recomendados, de la resolución y del hardware; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-f.1-v1-checkpoint | Checkpoint de difusion para imagenes | No disponible | No disponible | No disponible (copyright del autor) | Hugging Face, RunningHub |
| Flux.1 (familia) | Modelo de difusion texto-a-imagen | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Referencia habitual del ecosistema ComfyUI |
| Stable Diffusion XL | Modelo de difusion texto-a-imagen | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Referencia habitual del ecosistema ComfyUI |

No hay datos públicos de rendimiento ni de parametros que permitan una comparacion cuantitativa fiable entre `rh-f.1-v1-checkpoint` y alternativas. La comparativa se limita a la categoria de producto; cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se declaran arquitectura, parámetros, dataset, proceso de entrenamiento ni evaluación. Es imposible reproducir o auditar el modelo.
- Licencia no especificada: la model card remite a «la licencia del proyecto original o upstream» sin nombrarla. No hay base clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación visual y artefactos: como cualquier checkpoint de difusión sin evaluación publicada, puede producir anatomías incorrectas, manos deformadas, texto ilegible y ruido en detalles.
- Sesgos conocidos: no documentados. Los fine-tunes de retrato sobre datasets pequeños tienden a sobrerrepresentar un ideal estético concreto y a fallar en diversidad de rasgos, edades, cuerpos y tonalidades de piel; no hay información que permita confirmarlo o descartarlo aquí.
- Contenido sensible: la denominación del archivo de pesos y la sugerencia de prompt de la model card apuntan a un estilo que puede derivar en representaciones de personas de apariencia juvenil. Es responsabilidad del usuario verificar que cualquier uso cumple la legislación aplicable (en la UE, el Reglamento de IA y la normativa de protección de menores) y no genera material sexualizado de menores. Este repositorio no ofrece salvaguardas documentadas.
- Sin filtros ni moderación declarados: no se menciona ningún sistema de seguridad, clasificador o bloqueo de prompts.
- Idioma: no se especifica el soporte de prompts en castellano; el comportamiento con prompts multilingües es desconocido.
- Trazabilidad de la plataforma: el modelo se distribuye en el marco de RunningHub, con enlaces de promoción y de API; conviene separar el interés comercial del repositorio de la evaluación técnica del modelo.
- Formato único: al publicarse solo un `.safetensors` grande, no hay versiones cuantizadas ni GGUF que faciliten su uso en hardware modesto.
- Fecha de creación del repositorio (2026-10-23) y cero descargas / cero likes: sin validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-f.1-v1-checkpoint
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2013611841263509506
- Página del autor: https://www.runninghub.cn/user-center/1958026340350025729
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
