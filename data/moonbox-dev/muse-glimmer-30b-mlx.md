# moonbox-dev/Muse-Glimmer-30B-MLX

## Resumen
Muse Glimmer 30B MLX es una compilación no oficial del modelo Muse Glimmer 30B de Meta, publicada por el usuario moonbox-dev para su ejecución en Macs con Apple Silicon mediante la librería MLX. El modelo base es un modelo agéntico de 30 000 millones de parámetros que incorpora un codificador de percepción (visión) y un borrador DFlash, lo que lo sitúa en la categoría image-text-to-text. Esta compilación concreta es una cuantización a 8 bits del modelo original en bf16, distribuida como un modelo completo de mlx-vlm: pesos, `config.json`, tokenizador de Meta, plantilla de chat, ajustes de procesador y el borrador en el subdirectorio `mtp/`.

La relevancia de esta ficha radica en que permite ejecutar localmente en hardware Apple un modelo multimodal de 30B con capacidades agénticas, algo que en bf16 requeriría aproximadamente 60 GB de memoria y que aquí se reduce a unos 30 GB gracias a la cuantización de 8 bits. La model card reporta una degradación mínima frente al original: divergencia KL de 0,0016 nats (p95 0,0050), acuerdo top-1 del 97,95 % y perplejidad idéntica (12,94 frente a 12,94).

Se trata, sin embargo, de un artefacto de terceros: no es una publicación oficial de Meta y el repositorio no incluye información sobre el entrenamiento, los datos utilizados ni los benchmarks del modelo base. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; incluye codificador de percepción y borrador DFlash/MTP) |
| Parametros totales | 30B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base dispone de bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), sharded en 15 archivos de ~2,06 GB más el primero de 2,86 GB; incluye `mtp/model.safetensors` de 1,44 GB |
| Tamano del repo | 88,2 GB |
| Libreria / runtime | mlx, mlx-vlm |
| Hardware objetivo | Apple Silicon |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base. Por los metadatos y la model card se sabe que Muse Glimmer 30B es un modelo de Meta orientado a tareas agénticas que combina un tronco de lenguaje de 30B con un codificador de percepción para entrada de imágenes y texto, y que incorpora un módulo DFlash (drafter) en el subdirectorio `mtp/`, presumiblemente para decodificación especulativa o multi-token prediction. La compilación MLX conserva la plantilla de chat, el tokenizador y los ajustes de procesador originales de Meta.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones de atención ni detalles del entrenamiento multimodal. La información sobre el proceso de cuantización sí es concreta: se generaron pesos de 8 bits y se midió la fidelidad frente al bf16 original con KL de 0,0016 nats, acuerdo top-1 del 97,95 % y perplejidad de 12,94 en ambos casos.

## Capacidades
- Generación de texto e imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes y texto como entrada y produce texto.
- Razonamiento agéntico: el modelo base se describe como "agentic model", orientado a tareas de varios pasos.
- Percepción visual: incorpora un codificador de percepción propio de Meta.
- Decodificación especulativa: incluye un borrador DFlash en `mtp/` que puede acelerar la generación.
- Tool calling / function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso
- Asistentes locales en Mac: ejecutar un modelo multimodal de 30B en un Mac con Apple Silicon mediante MLX y mlx-vlm, sin depender de la nube, aprovechando la cuantización de 8 bits para reducir los requisitos de memoria a unos 30 GB.
- Análisis de documentos con imágenes: extraer y razonar sobre capturas, diagramas o páginas escaneadas combinando el codificador de percepción con el tronco de lenguaje.
- Automatización agéntica de escritorio: al ser un modelo agéntico y ejecutarse localmente, encaja en flujos que requieren privacidad y baja latencia de red en equipos Apple.
- Prototipado de pipelines multimodales: usar mlx-vlm para iterar rápidamente sobre tareas image-text-to-text en desarrollo antes de desplegar en infraestructura mayor.
- Aceleración con decodificación especulativa: emplear el borrador DFlash incluido en `mtp/` para reducir la latencia en generaciones largas sobre Apple Silicon.
- Evaluación comparativa de cuantizaciones: al publicarse métricas de fidelidad (KL, top-1, perplejidad), sirve para estudiar el impacto de la cuantización de 8 bits en modelos de 30B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de fidelidad de la cuantización frente al modelo bf16:

| Metrica | 8 bits MLX | bf16 original |
|---|---|---|
| Divergencia KL | 0,0016 nats (p95 0,0050) | referencia |
| Acuerdo top-1 | 97,95 % | referencia |
| Perplejidad | 12,94 | 12,94 |

## Requisitos de hardware
- VRAM/memoria unificada estimada: en torno a 30 GB para los pesos de 8 bits, más overhead de contexto y del codificador de visión; el repositorio completo ocupa 88,2 GB en disco.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (Mac Studio, MacBook Pro con configuraciones de gama alta).
- GPU NVIDIA: no es el objetivo de esta compilación; requeriría conversión a otro formato.
- Cabe en GPU de consumo: no confirmado para esta build MLX; en bf16 el modelo de 30B no cabría en GPUs de 24 GB.
- Despliegue: mlx-vlm sobre MLX; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para esta compilación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de información suficiente sobre modelos comparables de la misma categoría (multimodales agénticos de ~30B) en los datos proporcionados. La comparación más directa disponible es con el propio modelo base:

| Modelo | Parametros | Precision | Licencia | Formato | Hardware |
|---|---|---|---|---|---|
| Muse Glimmer 30B (base) | 30B | bf16 | Apache 2.0 | safetensors | GPU / Apple Silicon |
| Muse Glimmer 30B MLX (esta ficha) | 30B | 8 bits | Apache 2.0 | safetensors MLX | Apple Silicon |

## Limitaciones y advertencias
- Compilación no oficial: la model card indica explícitamente que estos archivos no son una publicación oficial de Meta.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento en castellano ni en otros idiomas.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que complica dimensionar memoria en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan evaluaciones de fiabilidad.
- Sesgos: no se documentan análisis de sesgo del modelo base ni de esta cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base de Meta antes de desplegar.
- Dependencia de MLX: el uso queda restringido al ecosistema Apple Silicon y a mlx-vlm.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Muse-Glimmer-30B-MLX
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado (arXiv:2504.13181): https://arxiv.org/abs/2504.13181
- Paper referenciado (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Paper referenciado (arXiv:2610.24628): https://arxiv.org/abs/2610.24628
