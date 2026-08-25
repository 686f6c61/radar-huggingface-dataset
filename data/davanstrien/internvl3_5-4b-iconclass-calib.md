# davanstrien/internvl3_5-4b-iconclass-calib

## Resumen

El modelo `davanstrien/internvl3_5-4b-iconclass-calib` es un adaptador LoRA de clasificación de iconografía, entrenado sobre el modelo multimodal de visión-lenguaje `OpenGVLab/InternVL3_5-4B-HF`. Lo desarrolla Daniel van Strien (davanstrien), especialista en machine learning y bibliotecas digitales, con el objetivo de adaptar un modelo base de propósito general a la tarea concreta de etiquetar imágenes con el sistema Iconclass, un estándar de clasificación de iconografía utilizado en museos y bibliotecas.

El adaptador se entrenó con el framework ms-swift sobre un subconjunto de 2000 ejemplos del dataset `davanstrien/iconclass-vlm-brillfull`, con una única época y pérdida final de entrenamiento de 0.862. Al ser un LoRA de rango 8 y tamaño de repo de 0.1 GB, la adaptación es ligera y se puede cargar sobre el modelo base de 4B parámetros sin necesidad de reentrenar el modelo completo.

La relevancia de este modelo radica en que demuestra un flujo práctico de fine-tuning eficiente para tareas especializadas de visión-lenguaje, y permite evaluar si un modelo pequeño de 4B puede alcanzar un rendimiento aceptable en clasificación de iconografía, un dominio con etiquetas de grano fino y contexto cultural. Aunque el adaptador está en una fase experimental (0 descargas, 0 likes), su configuración es reproducible y está documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre InternVL3.5-4B (modelo multimodal de visión-lenguaje, transformer con torre de visión congelada) |
| Parámetros totales | No disponible (el adaptador LoRA tiene ~8M parámetros, el base 4B) |
| Parámetros activos | No disponible (LoRA activa solo los adaptadores durante la inferencia) |
| Longitud de contexto | No disponible (máximo de entrenamiento 2048 tokens) |
| Tipos de cuantización | No disponible (formato safetensors de LoRA; el base puede cuantizarse) |
| Idiomas soportados | No disponibles (el base InternVL3.5 soporta inglés, chino y otros; no se especifica) |
| Licencia | No disponible para el adaptador; el modelo base InternVL3.5 es de código abierto (MIT según su repositorio) |
| Formato de pesos | safetensors (LoRA) |

Nota: el adaptador se distribuye en formato PEFT (safetensors) y se usa sobre el modelo base. El tamaño de repo de 0.1 GB corresponde al adaptador, no al modelo completo.

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre InternVL3.5-4B, un modelo multimodal de visión-lenguaje de la familia InternVL3.5. Según la documentación oficial, InternVL3.5 introduce mejoras en razonamiento multimodal y eficiencia de inferencia, con un speedup de hasta 4.05 veces frente a InternVL3 en ciertas cargas. El modelo base combina un codificador de visión con un LLM de 4B parámetros, y en este caso la torre de visión permaneció congelada durante el fine-tuning.

El entrenamiento se realizó con ms-swift, un framework de fine-tuning de ModelScope, sobre el dataset `iconclass-vlm-brillfull` con 2000 muestras. Se usó una configuración de LoRA con rank 8 y alpha 32, tasa de aprendizaje de 0.0001, batch efectivo de 16 y longitud máxima de 2048 tokens. El entrenamiento duró 21.5 minutos en una GPU A10G (según el comando de reproducción con `--flavor a10g-large`). La pérdida final de entrenamiento fue de 0.862 y la pérdida de evaluación de 1.137, lo que sugiere un ligero sobreajuste, esperado con un dataset pequeño y una única época.

No se detalla si se usó RLHF, DPO o técnicas de alineación; el proceso es únicamente fine-tuning supervisado (SFT) sobre datos de clasificación de iconografía.

## Capacidades

- Clasificación de iconografía: el adaptador está entrenado para asignar etiquetas IconClass a imágenes, un sistema de clasificación jerárquica de conceptos iconográficos en arte (por ejemplo, "alegoría de la justicia", "paisaje con río").
- Visión-lenguaje multimodal: hereda del base la capacidad de procesar imágenes y texto, permitiendo describir o clasificar imágenes.
- Fine-tuning eficiente: al ser un LoRA de bajo rango, se puede cargar sobre el base base con poco coste adicional de memoria y tiempo de inferencia.
- Soporte de tool calling y agentes: no se ha verificado en este adaptador; el modelo base InternVL3.5 podría soportarlo, pero no se confirma en la documentación del adaptador.
- Multilingüismo: no confirmado para este adaptador; el base InternVL3.5 soporta inglés y chino, pero no hay datos específicos.
- Modo de razonamiento (thinking mode): no disponible en este adaptador.

## Casos de uso

- Catalogación de colecciones de museos: el modelo puede asignar etiquetas IconClass a imágenes de obras de arte, ayudando a bibliotecas y museos a indexar colecciones de forma automática. Por ejemplo, dado un cuadro, el modelo devuelve la clasificación iconográfica correspondiente, reduciendo el trabajo manual de catalogación.
- Enriquecimiento de bases de datos de patrimonio cultural: se puede integrar en pipelines de procesamiento de imágenes para añadir metadatos semánticos a archivos digitales, facilitando búsquedas por concepto.
- Investigación en historia del arte: los investigadores pueden usar el modelo para clasificar lote de imágenes y detectar patrones iconográficos en grandes conjuntos de obras.
- Anotación asistida en plataformas de crowdsourcing: el modelo puede generar propuestas de etiquetas que luego son validadas por humanos, acelerando proyectos de anotación participativa.
- Análisis de contenido visual en publicaciones académicas: para clasificar figuras y tablas en artículos de humanidades digitales, aunque no es su uso principal.
- Prototipado de sistemas de búsqueda por imagen: integrar el modelo en un motor de búsqueda semántica donde el usuario describe un concepto y el sistema recupera imágenes clasificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este adaptador LoRA. El modelo base InternVL3.5-4B podría tener resultados en MMMU, MMBench u otros, pero no se incluyen en la documentación del adaptador. No se debe confundir con InternVL3.5-8B, que sí tiene cifras publicadas en su ficha, pero no son comparables.

## Requisitos de hardware

- El adaptador LoRA es muy ligero: 0.1 GB de pesos adicionales, por lo que la VRAM adicional es despreciable.
- El modelo base InternVL3.5-4B, con cuantización de 4 bits (por ejemplo, con bitsandbytes), puede caber en una GPU consumer con 8 GB de VRAM (ej. RTX 3060, RTX 4060, RTX 3070).
- Con cuantización de 8 bits, se recomienda al menos 10-12 GB de VRAM (RTX 3080, RTX 4080, etc.).
- En precisión completa (FP16), se necesitarían ~8 GB solo para los pesos del base (4B params × 2 bytes), más activaciones, por lo que se recomienda una GPU con 12-16 GB (RTX 4090, A100 40GB).
- Opciones de despliegue: se puede usar con vLLM, llama.cpp, Ollama (si se convierte a GGUF) o directamente con el pipeline de transformers y PEFT.
- El entrenamiento se realizó en una GPU A10g-large (24 GB), pero la inferencia es mucho más ligera.
- Latencia y throughput: no disponibles; en una GPU consumer, la generación de una clasificación de imagen debería ser sub-segundo con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `davanstrien/internvl3_5-4b-iconclass-calib` | 4B base + LoRA | no disponible | no disponible | Adaptador especializado en IconClass |
| `OpenGVLab/InternVL3_5-4B-HF` | 4B | no disponible | MIT | Modelo base multimodal, sin fine-tuning |
| `OpenGVLab/InternVL3-4B` | 4B | no disponible | MIT | Versión anterior, sin las mejoras de InternVL3.5 |
| `Qwen2-VL-2B` | 2B | 128K | Apache 2.0 | Alternativa más pequeña, menos capacidad multimodal |

Nota: los datos de contexto y rendimiento de los modelos base no están disponibles en la información proporcionada. La comparativa se basa en el tamaño y licencia conocida de los repositorios. No hay benchmarks comparativos publicados para el adaptador.

## Limitaciones y advertencias

- El adaptador se entrenó con solo 2000 ejemplos y una época, por lo que su rendimiento en datos fuera de distribución es probablemente limitado y puede presentar sobreajuste (la pérdida de eval es mayor que la de entrenamiento).
- No hay información sobre sesgos o alucinaciones; como modelo de visión-lenguaje, puede alucinar etiquetas o descripciones en imágenes ambiguas.
- La clasificación IconClass es un sistema complejo con miles de clases; el modelo puede no cubrir todo el vocabulario, especialmente conceptos raros o muy específicos.
- El adaptador no ha sido evaluado en benchmarks estándar, por lo que no se puede comparar su rendimiento con otros modelos de forma objetiva.
- La licencia del adaptador no está especificada, aunque el base es MIT; se recomienda consultar los términos de uso antes de un despliegue comercial.
- El contexto de 2048 tokens es corto para tareas que requieran procesar múltiples imágenes o descripciones largas; se debe tener en cuenta en uso de producción.
- El modelo no está optimizado para tool calling ni agentes; no se debe usar en pipelines de agentes sin verificar.
- El entrenamiento se realizó en inglés (dataset `iconclass-vlm-brillfull`), por lo que el rendimiento en otros idiomas es incierto.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/davanstrien/internvl3_5-4b-iconclass-calib
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-4B-HF (no encontrado directamente, pero es el ID de base_model; el repo de 8B es https://huggingface.co/OpenGVLab/InternVL3_5-8B)
- Dataset de entrenamiento: https://huggingface.co/datasets/davanstrien/iconclass-vlm-brillfull
- Repositorio GitHub de InternVL: https://github.com/OpenGVLab/InternVL
- Blog de InternVL3: https://internvl.github.io/blog/2025-04-11-InternVL-3.0/
- Documentación de InternVL3.5: https://internvl.github.io/ (página general)
- Script de entrenamiento (uv-scripts): https://huggingface.co/datasets/uv-scripts/finetune/raw/main/swift-vlm-sft.py
- Documentación de ms-swift: https://github.com/modelscope/ms-swift

Nota: el enlace al modelo base `OpenGVLab/InternVL3_5-4B-HF` no aparece en la búsqueda web, pero se asume que existe dado que es el ID declarado. Se recomienda verificar en HuggingFace.</think>## Resumen

El modelo `internvl3_5-4b-iconclass-calib` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo multimodal de visión-lenguaje `OpenGVLab/InternVL3_5-4B-HF`. Lo desarrolla Daniel van Strien (davanstrien), especialista en machine learning y bibliotecas digitales, con el objetivo de adaptar un modelo base de propósito general a la clasificación de iconografía mediante el sistema IconClass, un estándar jerárquico usado en museos y archivos para etiquetar el contenido simbólico de imágenes.

El adaptador se ha fine-tuneado con el framework ms-swift sobre un subconjunto de 2000 ejemplos del dataset `davanstrien/iconclass-vlm-brillfull`, con una única época y configuración LoRA de rank 8 y alpha 32. Con un tamaño de repo de solo 0.1 GB, el adaptador es extremadamente ligero y se puede cargar sobre el modelo base de 4B parámetros sin reentrenar la torre de visión, que permanece congelada durante el entrenamiento.

La relevancia de este modelo reside en su demostración de un flujo de trabajo eficiente y reproducible para adaptar un modelo multimodal pequeño a una tarea especializada de clasificación de imágenes, en este caso con aplicaciones directas en el ámbito de las humanidades digitales y la gestión de colecciones de arte. Al ser un adaptador de bajo coste, permite evaluar rápidamente si un modelo de 4B puede competir con soluciones más grandes en tareas de etiquetado de iconografía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre InternVL3.5-4B (modelo multimodal de visión-lenguaje, transformer con torre de visión congelada) |
| Parámetros totales | No disponible (el modelo base tiene 4B; el adaptador LoRA añade ~8M de parámetros entrenables) |
| Parámetros activos | No disponible (en inferencia se activan los adaptadores LoRA sobre el modelo base) |
| Longitud de contexto | No disponible (máximo de tokens de entrenamiento: 2048) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse a 4/8 bits) |
| Idiomas soportados | No disponibles (el modelo base InternVL3.5 soporta inglés y chino, pero no se especifica para este adaptador) |
| Licencia | No disponible para el adaptador; el modelo base InternVL3.5 es de código abierto (MIT según su repositorio oficial) |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

Nota: el adaptador se distribuye como un repositorio PEFT que debe combinarse con el modelo base `OpenGVLab/InternVL3_5-4B-HF`. El tamaño de repo de 0.1 GB corresponde solo al adaptador, no al modelo completo.

## Arquitectura y entrenamiento

El adaptador se aplica sobre InternVL3.5-4B, un modelo multimodal de la familia InternVL3.5. Según la documentación oficial, InternVL3.5 introduce mejoras sustanciales en razonamiento, versatilidad y eficiencia de inferencia, con un incremento de hasta +16.0% en rendimiento de razonamiento y un speedup de 4.05 veces respecto a la generación anterior (InternVL3). La arquitectura combina un codificador de visión con un modelo de lenguaje de 4B parámetros, permitiendo procesar imágenes y texto de forma conjunta.

El entrenamiento se realizó con ms-swift, un framework de fine-tuning de ModelScope, sobre el dataset `iconclass-vlm-brillfull`. La configuración incluye: 2000 filas de entrenamiento, una única época, tasa de aprendizaje de 0.0001, LoRA rank 8 y alpha 32, batch efectivo de 16, longitud máxima de tokens de 2048 y resolución de píxeles de 1003520. La torre de visión permaneció congelada durante el entrenamiento. La pérdida final de entrenamiento fue de 0.862 y la pérdida de evaluación de 1.137, lo que sugiere un ligero sobreajuste, esperable dado el pequeño tamaño del dataset y la única época. El entrenamiento duró 21.5 minutos en una GPU A10g-large (24 GB VRAM), según el comando de reproducción documentado.

No se aplicaron técnicas de alineación como RLHF o DPO; el proceso es exclusivamente de entrenamiento supervisado (SFT) sobre ejemplos de clasificación de iconografía.

## Capacidades

- Clasificación de iconografía: el adaptador está especializado en asignar etiquetas IconClass, un sistema jerárquico de clasificación de conceptos iconográficos en arte (por ejemplo, "alegoría de la justicia", "paisaje fluvial").
- Comprensión multimodal imagen-texto: hereda del modelo base la capacidad de procesar imágenes y texto de forma conjunta, permitiendo describir, analizar o clasificar el contenido visual.
- Fine-tuning eficiente: al ser un LoRA de bajo rango, se puede cargar sobre el base con coste adicional mínimo de memoria y tiempo de inferencia.
- Reproducibilidad: el entrenamiento está documentado con un script de reproducción en Hugging Face Jobs, lo que facilita replicar el proceso.
- Soporte de tool calling o agentes: no confirmado para este adaptador; el modelo base podría soportarlo, pero no se documenta en el repo.
- Capacidades multilingües: no confirmado; el modelo base soporta inglés y chino, pero no se ha validado en este adaptador.
- Modo de razonamiento (thinking mode): no disponible.

## Casos de uso

- Catalogación de colecciones de museos: el modelo puede procesar imágenes de obras de arte y generar automáticamente etiquetas IconClass, reduciendo el trabajo manual de documentalistas y bibliotecarios en la digitalización de fondos.
- Enriquecimiento de bases de datos de patrimonio cultural: integrar el adaptador en un pipeline de procesamiento de imágenes para añadir metadatos semánticos a archivos digitales, facilitando búsquedas por conceptos iconográficos.
- Investigación en historia del arte: los investigadores pueden usar el modelo para clasificar grandes volúmenes de imágenes y detectar patrones iconográficos en series de obras, apoyando estudios comparativos.
- Anotación asistida en proyectos de crowdsourcing: el modelo puede generar propuestas de etiquetas iniciales que posteriormente son validadas por humanos, acelerando proyectos de anotación participativa en plataformas como Wikimedia o Europeana.
- Análisis de imágenes en publicaciones académicas: clasificar figuras e ilustraciones en artículos de humanidades digitales para indexación temática.
- Generación de descripciones de iconografía en aplicaciones educativas: el modelo puede complementar visitas virtuales a museos con explicaciones automáticas del contenido simbólico de las obras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este adaptador LoRA. El modelo base InternVL3.5-4B podría tener resultados en benchmarks como MMMU, MMLB, MMLU, HumanEval o GSM8K, pero no se muestran en el repositorio del adaptador. Tampoco se incluyen comparaciones con otros modelos en la model card. No se pueden proporcionar datos numéricos de rendimiento.

## Requisitos de hardware

- El adaptador LoRA es muy ligero: 0.1 GB de peso adicional, por lo que el coste de memoria extra es despreciable.
- El modelo base InternVL3.5-4B en precisión FP16 requiere aproximadamente 8 GB de VRAM para los pesos, más memoria para activaciones y entrada de imágenes.
- Con cuantización de 4 bits (por ejemplo, mediante GPTQ o AWQ), se puede ejecutar en una GPU consumer con 6-8 GB de VRAM, como una RTX 3060, RTX 4060 o RTX 3070.
- Con cuantización de 8 bits, se recomienda 10-12 GB de VRAM (RTX 3080, RTX 4080).
- En precisión completa (FP16) sin cuantización, se recomienda una GPU de 16 GB o más (RTX 4090, A100 30GB, etc.).
- Para entrenamiento, el comando de reproducción usa una GPU A10g-large (24 GB), pero la inferencia es mucho menos exigente.
- Opciones de despliegue: se puede usar con el framework `transformers` + PEFT, `vLLM` (si se convierte el adaptador a un formato compatible), `llama.cpp` (conversión a GGUF) u `Ollama` (si se empaqueta como modelo completo).
- Latencia y throughput: no disponibles; en una GPU consumer moderna, la clasificación de una imagen debería completarse en menos de un segundo con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `davanstrien/internvl3_5-4b-iconclass-calib` | 4B base + LoRA | No disponible | No disponible | Adaptador especializado en IconClass |
| `OpenGVLab/InternVL3_5-4B-HF` | 4B | No disponible | MIT | Modelo base sin fine-tuning |
| `OpenGVLab/InternVL3_5-8B` | 8B | No disponible | MIT | Versión más grande de la misma familia |
| `Qwen2-VL-2B` | 2B | 128K | Apache 2.0 | Alternativa más pequeña, pero sin especialización |

Nota: los datos de contexto de los modelos base no están disponibles en la información proporcionada. La comparativa se basa en el tamaño y la licencia conocida de los repositorios. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- El adaptador se entrenó con solo 2000 ejemplos y una única época, por lo que su rendimiento puede ser limitado en clases de iconografía poco representadas o en imágenes muy diferentes a las del dataset de entrenamiento.
- La pérdida de evaluación (1.137) es significativamente mayor que la de entrenamiento (0.862), lo que indica un cierto grado de sobreajuste.
- No se ha evaluado formalmente el modelo en benchmarks estándar, por lo que no se puede comparar su rendimiento con otros modelos de forma objetiva.
- La clasificación de IconClass es un sistema complejo con miles de clases jerárquicas; el modelo puede no cubrir todo el universo de etiquetas, y puede confundir conceptos visualmente similares.
- No se documenta la licencia del adaptador; aunque el modelo base es MIT, se debe consultar el uso comercial del adaptador y del dataset de entrenamiento antes de un despliegue en producción.
- El contexto de 2048 tokens es corto para tareas que requieran procesar múltiples imágenes o descripciones largas; se debe tener en cuenta en aplicaciones de contexto largo.
- No hay evidencia de soporte para tool calling, agentes o razonamiento multi-paso en este adaptador; no se debe usar en pipelines que requieran estas capacidades sin verificar.
- El dataset de entrenamiento parece estar en inglés, por lo que el rendimiento en otros idiomas es incierto.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/davanstrien/internvl3_5-4b-iconclass-calib
- Modelo base (referenciado): https://huggingface.co/OpenGVLab/InternVL3_5-4B-HF (no verificado en la búsqueda; se recomienda consultar el perfil de OpenGVLab)
- Dataset de entrenamiento: https://huggingface.co/datasets/davanstrien/iconclass-vlm-brillfull
- Repositorio GitHub de InternVL: https://github.com/OpenGVLab/InternVL
- Blog de InternVL3: https://internvl.github.io/blog/2025-04-11-InternVL-3.0/
- Documentación de InternVL3.5: https://internvl.github.io/ (página general)
- Script de entrenamiento (uv-scripts): https://huggingface.co/datasets/uv-scripts/finetune/raw/main/swift-vlm-sft.py
- Documentación de ms-swift: https://github.com/modelscope/ms-swift
- Perfil de davanstrien en HuggingFace: https://huggingface.co/davanstrien
