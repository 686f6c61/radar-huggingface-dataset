# axom-ai/axomai-visual-garima

## Resumen

AxomAI Visual Garima es un adaptador LoRA de generación de imágenes texto-a-imagen desarrollado por axom-ai, construido sobre el modelo base FLUX.1-dev de Black Forest Labs. Su propósito es incorporar conocimiento visual específico de la cultura, el patrimonio y la estética de Assam (India), una región tradicionalmente infrarrepresentada en los datasets de los modelos generativos globales. El nombre "Garima" y la etiqueta "assam" apuntan a un ajuste orientado a vocabulario visual regional: indumentaria tradicional, arquitectura, motivos decorativos y escenas cotidianas del noreste del subcontinente indio.

El modelo se distribuye en formato diffusers como pesos LoRA, lo que implica que no es un modelo autónomo: requiere cargar FLUX.1-dev como base y aplicar el adaptador encima. Está etiquetado para los idiomas asamés (as) e inglés (en), lo que sugiere que los prompts pueden formularse en ambos idiomas, aunque la tokenización efectiva depende del text encoder de FLUX.1-dev, que es predominantemente anglófono.

La relevancia actual del proyecto es doble: por un lado, se alinea con la tendencia de adaptaciones culturales de sub-1B parámetros que abaratan la personalización de modelos generativos de gran escala; por otro, representa un caso de "regional AI" que busca reducir el sesgo cultural occidental en la generación de imágenes. El repositorio es de acceso restringido (gated) y, en el momento de la consulta, no registra descargas ni interacciones públicas, por lo que se trata de un artefacto recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión FLUX.1-dev |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto de FLUX.1-dev admite hasta 512 tokens T5 + CLIP) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye presumiblemente en fp16/bf16; la cuantizacion se aplica al modelo base) |
| Idiomas soportados | asamés (as), inglés (en) |
| Licencia | other (licencia personalizada; requiere aceptar condiciones en Hugging Face) |
| Formato de pesos | safetensors (formato diffusers, según la librería declarada) |

## Arquitectura y entrenamiento

El adaptador se construye sobre FLUX.1-dev, un transformer de difusión (DiT) de 12.000 millones de parámetros con atención conjunta texto-imagen y un doble text encoder (CLIP y T5). El LoRA inyecta matrices de bajo rango en las capas de atención y proyección del transformer, de modo que el coste de almacenamiento y de entrenamiento es una fracción del modelo completo. La librería declarada es diffusers, y el pipeline es text-to-image, por lo que la integración esperada es mediante `DiffusionPipeline` o `FluxPipeline` con `load_lora_weights`.

No se dispone de información pública sobre el dataset de entrenamiento: no se especifican el número de imágenes, la composición del corpus, el número de pasos de entrenamiento, el rango del LoRA ni la tasa de aprendizaje. Tampoco se documenta si se emplearon técnicas de regularización (por ejemplo, captions detalladas o balanceo de conceptos) para evitar el sobreajuste al concepto cultural. Las etiquetas "cultural-heritage" y "regional-ai" indican la intención del proyecto, pero no constituyen una descripción técnica verificable del proceso.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por prompts en inglés y, presumiblemente, en asamés, con sesgo hacia estética y patrimonio de Assam.
- Personalización de conceptos culturales: indumentaria tradicional (por ejemplo, mekhela sador), motivos textiles, arquitectura regional y escenas costumbristas.
- Compatibilidad con el ecosistema diffusers y con el pipeline de FLUX.1-dev, incluida la posibilidad de combinarse con otros LoRA mediante pesos de fusión.
- Soporte de control adicional heredado del modelo base, como image-to-image y edición guiada por prompt, siempre que el pipeline lo permita.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imágenes.
- Capacidad multilingüe limitada al par as/en declarado; no hay evidencia de cobertura de otras lenguas indias.

## Casos de uso

- Ilustración editorial regional: generación de portadas y material gráfico para medios asamófonos, usando prompts que describan escenas y atuendos locales sin depender de la estética genérica del modelo base.
- Diseño de producto cultural: creación de estampados y motivos inspirados en textiles tradicionales de Assam para prototipado rápido de merchandising, con revisión humana posterior.
- Patrimonio digital y divulgación: generación de imágenes ilustrativas para museos, guías turísticas y materiales educativos sobre templos, fiestas (Bihu) y artesanía local.
- Previsualización en publicidad local: moodboards y bocetos para campañas dirigidas al noreste de India, donde el modelo base tiende a producir referencias visuales descontextualizadas.
- Investigación en sesgo cultural: uso del adaptador como caso de estudio para medir la mejora de fidelidad cultural frente a FLUX.1-dev sin ajuste, en experimentos controlados con evaluadores nativos.
- Creación de contenido para redes sociales: generación de ilustraciones temáticas con estética regional para cuentas de divulgación cultural, integrada en flujos de trabajo con diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa típicamente decenas o centenas de megabytes, pero la inferencia exige cargar FLUX.1-dev completo (12.000 millones de parámetros).
- VRAM estimada para FLUX.1-dev en bf16: aproximadamente 24 GB o más, según resolución y optimizaciones; con cuantización a 8 bits puede reducirse hacia 12-16 GB, y con GGUF de 4 bits hacia 8-12 GB, a costa de calidad.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para uso individual en bf16 con offloading.
- En GPU de consumo: viable en RTX 4090 y, con cuantización agresiva y offloading a CPU, en RTX 3090, 4080 y tarjetas de 16 GB; no cabe en GPUs de 8 GB sin cuantización extrema.
- Opciones de despliegue: diffusers (FluxPipeline con `load_lora_weights`), ComfyUI (carga de LoRA sobre checkpoint FLUX), y servidores compatibles con FLUX como vLLM no aplica (es difusión); para CPU/GPU mixta, llama.cpp no soporta FLUX de forma nativa.
- Latencia y throughput: no disponibles para este adaptador; en FLUX.1-dev se sitúan típicamente en el orden de segundos por imagen de 1024x1024 en A100 y decenas de segundos en GPU de consumo, pero no hay medición publicada para este LoRA.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxomAI Visual Garima | FLUX.1-dev | LoRA (no disponible) | no disponible | other (gated) | Hugging Face, acceso restringido |
| FLUX.1-dev (sin ajuste) | — | 12.000 M | prompts hasta 512 tokens T5; 1024x1024 | FLUX.1-dev Non-Commercial | Hugging Face, gated |
| LoRA culturales genéricos sobre SDXL | SDXL | LoRA (decenas de M) | 1024x1024 | varía (a menudo CreativeML) | Hugging Face / Civitai |
| Modelos regionales indios texto-a-imagen | varía (SD 1.5, SDXL) | 1.000-3.500 M | 512-1024 px | varía | Hugging Face, acceso abierto en su mayoría |

La comparación directa es difícil porque no hay métricas publicadas para el adaptador. Frente a FLUX.1-dev sin ajuste, la ventaja esperada es la fidelidad cultural en conceptos de Assam; frente a LoRA sobre SDXL, la ventaja es la calidad del modelo base, con el coste de un requisito de VRAM mucho mayor.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican datos de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir o auditar el ajuste.
- Riesgo de sobreajuste al concepto: los LoRA culturales con corpus pequeños tienden a reproducir composiciones y paletas del dataset, reduciendo diversidad y provocando artefactos ante prompts fuera de distribución.
- Sesgo de representación: al entrenarse sobre una región concreta, puede estereotipar la estética asamófona y fallar en la representación de subregiones o comunidades diversas.
- Alucinación visual: como todo modelo generativo, puede producir detalles plausibles pero incorrectos en elementos culturales sensibles (símbolos religiosos, indumentaria ritual).
- Idiomas: el soporte real del asamés depende del text encoder de FLUX.1-dev, entrenado mayoritariamente en inglés; los prompts en asamés pueden degradar la fidelidad.
- Licencia: "other" y acceso gated; es imprescindible revisar los términos antes de cualquier uso comercial, y la licencia del adaptador debe ser compatible con la licencia no comercial de FLUX.1-dev.
- Estado del repositorio: cero descargas y cero likes en la consulta, sin validación de la comunidad ni demos publicadas.
- Producción: no apto como dependencia crítica sin evaluación propia de calidad, latencia y coste de GPU.

## Enlaces

- Hugging Face: https://huggingface.co/axom-ai/axomai-visual-garima
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Documentación de diffusers para FLUX: https://huggingface.co/docs/diffusers/main/en/api/pipelines/flux
- Búsqueda web: el único resultado relevante encontrado (https://www.axom.fr/) corresponde a una empresa francesa de sistemas de visualización de costas, sin relación con este modelo; no se han encontrado papers, blogs ni repositorios adicionales sobre AxomAI Visual Garima.
