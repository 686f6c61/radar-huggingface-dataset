# 0xzknw/LFM3-VL-2B-EXL3-4.49bpw

## Resumen

LFM3-VL-2B-EXL3-4.49bpw es una cuantización de precisión mixta del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por el usuario 0xzknw. El checkpoint emplea el formato EXL3 (ExLlamaV3) con una receta que mezcla proyecciones de 4, 5 y 6 bits, resultando en una media de 4,489 bits por proyección cuantizada. El objetivo es reducir el peso del modelo base (que en safetensors declara 985.035.776 parámetros) para facilitar su despliegue en GPUs con VRAM limitada, manteniendo la fidelidad respecto al original.

El modelo resuelve el problema de servir un modelo visión-lenguaje de ~1B parámetros en entornos de inferencia con restricciones de memoria, a costa de una pérdida de fidelidad medible. Según la propia model card, la KL multimodal medida sobre una imagen sintética de validación y 24 posiciones de texto fue de 0,104194, ligeramente por encima del umbral objetivo inicial de 0,10, por lo que la puerta de calidad original queda oficialmente incumplida. La paridad de características con el modelo nativo/ExLlama tampoco alcanza el umbral estricto de 0,01.

Es relevante ahora porque el ecosistema ExLlamaV3 permite ejecutar checkpoints EXL3 con decodificación eficiente en GPUs de consumo, y este repositorio aísla una única variante (4.49bpw) tras retirar el repositorio multi-variante anterior. No obstante, se trata de un artefacto de cuantización de terceros, no de un modelo oficial de Liquid AI, y requiere un runtime específico compatible con LFM3-VL y EXL3 MCG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-VL); pesos en formato EXL3 (ExLlamaV3) con proyecciones mixtas de 4/5/6 bits |
| Parametros totales | 985.035.776 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 mixta 4/5/6 bits, media de 4,4892703863 bits por proyección cuantizada |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (checkpoint EXL3, no BF16 estándar) |

## Arquitectura y entrenamiento

El checkpoint deriva de LiquidAI/LFM3-VL-2B, un modelo de la familia LFM3 de Liquid AI con pipeline image-text-to-text. La información disponible no detalla la arquitectura interna del modelo base (tipo de atención, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que sí se especifica es que los pesos están almacenados como checkpoint EXL3, es decir, cuantizados con las herramientas de ExLlamaV3 y no en precisión completa.

La innovación técnica de este artefacto es la receta de cuantización mixta: distintas proyecciones se cuantizan a 4, 5 o 6 bits según su sensibilidad, logrando una media de 4,489 bits por proyección. El autor documenta la metodología, los resultados crudos y las limitaciones en los informes de validación archivados (source-evidence/validation/) y en el manifiesto de origen (source-evidence/manifest.json). No se dispone de información sobre técnicas de entrenamiento adicionales, decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline image-text-to-text): el modelo acepta entradas de imagen y texto y produce respuestas conversacionales.
- Conversación multi-turno: etiquetado como "conversational" en Hugging Face.
- Procesamiento multimodal: integración de visión y lenguaje en un único modelo de ~1B parámetros.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en el repositorio.

## Casos de uso

- Descripción automática de imágenes en producción con VRAM limitada: al ocupar aproximadamente 2,0 GB en el repositorio, el checkpoint puede cargarse en GPUs de consumo y emplearse para generar pies de foto o descripciones de catálogo, aunque debe validarse la fidelidad frente al modelo base antes de desplegarlo.
- Asistentes visuales conversacionales en el borde: el tamaño reducido (~1B parámetros) y el formato EXL3 permiten servir un chat imagen-texto en estaciones de trabajo con una sola GPU, útil para prototipos de accesibilidad que describan el entorno al usuario.
- Moderación de contenido visual asistida: el modelo puede clasificar o describir imágenes sospechosas en un pipeline de revisión, con la advertencia de que la cuantización introduce desviaciones medibles (KL 0,104194) que conviene monitorizar.
- Extracción de información de documentos escaneados: para tareas de pregunta-respuesta sobre capturas o formularios, el modelo puede integrarse en un flujo OCR + VLM, siempre que la precisión requerida tolere la pérdida de fidelidad del checkpoint.
- Investigación sobre cuantización: el repositorio incluye informes de validación y manifiesto de origen, lo que lo convierte en un caso de estudio útil para analizar el impacto de recetas mixtas 4/5/6 bits en modelos visión-lenguaje pequeños.
- Evaluación comparativa de runtimes EXL3: sirve para probar MLXL3 y ExLlamaV3 con modelos LFM3-VL, midiendo latencia y calidad frente al BF16 original en un entorno controlado.
- Demos educativas de multimodalidad: por su tamaño, puede desplegarse en un portátil con GPU para talleres o clases que ilustren pipelines image-text-to-text sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la cuantización: KL multimodal de 0,104194 sobre una imagen sintética de validación y 24 posiciones de texto, frente a un objetivo inicial de 0,10 (puerta de calidad incumplida), y una paridad nativa/ExLlama que no alcanza el umbral estricto de 0,01. No se aportan cifras de MMLU, HumanEval, GSM8K ni de benchmarks multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,0 GB, por lo que el checkpoint completo cabe en GPUs con 4 GB o más, dejando margen para el contexto y el procesamiento de imágenes; la VRAM exacta depende del runtime y de la longitud de contexto, dato no disponible.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar los pesos, aunque no se confirma compatibilidad con modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM, dado el tamaño del checkpoint; no se especifican modelos exactos.
- Opciones de despliegue: requiere un runtime compatible con LFM3-VL y EXL3 MCG, como MLXL3 (https://github.com/0xZKnw/mlxl3). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-EXL3-4.49bpw (este) | 985.035.776 | no disponible | EXL3 safetensors | lfm-open-license-v1.0 | Hugging Face (0 descargas, 0 likes) |
| LiquidAI/LFM3-VL-2B (base) | no disponible | no disponible | safetensors BF16 | lfm-open-license-v1.0 | Hugging Face (oficial de Liquid AI) |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | lfm-open-license-v1.0 | no disponible |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría; la comparación se limita al modelo base y a la relación de cuantización.

## Limitaciones y advertencias

- Fidelidad degradada: la KL multimodal de 0,104194 supera el objetivo de 0,10 y la puerta de calidad original queda oficialmente incumplida; la paridad con el modelo nativo/ExLlama no alcanza el umbral de 0,01.
- La receta es mixta 4/5/6 bits con media de 4,489 bits por proyección; no es una cuantización estricta de 4 bits ni un bitrate uniforme de todo el checkpoint.
- Requiere un runtime específico (MLXL3 u otro compatible con LFM3-VL y EXL3 MCG); el archivo .safetensors no son pesos BF16 convencionales y no cargará en runtimes estándar.
- Es un artefacto de terceros (0xzknw), no una publicación oficial de Liquid AI; la validación se realizó sobre una única imagen sintética y 24 posiciones de texto, una muestra muy reducida.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; deben evaluarse empíricamente antes de usar en producción.
- Idiomas soportados no declarados; no se garantiza cobertura multilingüe.
- Licencia lfm-open-license-v1.0: es necesario revisar el archivo LICENSE y la NOTICE de modificación para confirmar las condiciones de uso comercial y las obligaciones de atribución.
- El repositorio multi-variante anterior fue retirado; los enlaces relativos de la model card archivada pueden no resolver.
- Sin descargas ni likes registrados en Hugging Face; no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3-4.49bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Runtime MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Perfil del autor: https://huggingface.co/0xzknw
- Model card de origen archivada: SOURCE_MODEL_CARD.md (en el repositorio)
- Informes de validación: source-evidence/validation/ (en el repositorio)
- Manifiesto de origen: source-evidence/manifest.json (en el repositorio)
- Documentación de la variante: UPSTREAM_MODEL_CARD.md (en el repositorio)
- Licencia: LICENSE (en el repositorio)
- Aviso de modificación: NOTICE (en el repositorio)
