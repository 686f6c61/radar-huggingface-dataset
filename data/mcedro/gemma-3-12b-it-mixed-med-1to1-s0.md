# mcedro/gemma-3-12b-it-mixed-med-1to1-s0

## Resumen

`mcedro/gemma-3-12b-it-mixed-med-1to1-s0` es un ajuste fino (fine-tune) del modelo `unsloth/gemma-3-12b-it`, publicado por el usuario mcedro en Hugging Face. Por los tags del repositorio, se trata de un artefacto de investigación orientado al estudio del desalineamiento emergente (emergent misalignment), con referencias a dos artículos de arXiv (2506.11613 y 2602.07852). No es un modelo de propósito general ni un lanzamiento oficial de Google, sino un experimento académico derivado de Gemma 3 12B Instruct.

El modelo hereda la arquitectura y el tamaño del Gemma 3 12B Instruct de Google: un transformer de 12.000 millones de parámetros con ventana de contexto de 128.000 tokens, capacidades multimodales (texto e imagen) y soporte multilingüe. El sufijo "mixed-med-1to1-s0" sugiere un entrenamiento sobre una mezcla de datos médicos en proporción 1:1 con semilla 0, aunque la model card no detalla la composición exacta del dataset ni la metodología de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de investigación sobre seguridad y alineamiento; por otro, sirve de ejemplo de cómo se publican derivados de Gemma 3 con acceso restringido (gated) y licencia Gemma. Dado que el repositorio no incluye resultados de benchmarks ni una descripción técnica detallada, muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B Instruct) |
| Parametros totales | 12.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantizaciones GGUF/AWQ/INT8 vía ecosistema |
| Idiomas soportados | no disponibles en la model card; el modelo base soporta más de 140 idiomas |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (el repositorio no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B Instruct: un transformer decoder-only con atención por ventanas deslizantes y atención global intercaladas, diseñado para manejar contextos largos de hasta 128.000 tokens. El modelo base incorpora capacidades multimodales (procesamiento de imágenes) y está entrenado con una mezcla multilingüe amplia. Sin embargo, el repositorio `mcedro/gemma-3-12b-it-mixed-med-1to1-s0` no documenta cambios arquitectónicos respecto al modelo base.

En cuanto al entrenamiento, los tags indican que se trata de un fine-tune de `unsloth/gemma-3-12b-it` (una versión optimizada para entrenamiento del Gemma 3 12B Instruct). El nombre "mixed-med-1to1-s0" apunta a un ajuste sobre una mezcla de datos médicos en proporción 1:1, con semilla 0, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF, DPO o SFT. Los tags `emergent-misalignment` y las referencias a arXiv sugieren que el objetivo del experimento es estudiar cómo el fine-tune sobre datos específicos puede inducir comportamientos desalineados, un fenómeno documentado en la literatura reciente.

## Capacidades

- Generación de texto y razonamiento: heredadas del Gemma 3 12B Instruct, incluyendo razonamiento multi-paso y resolución de problemas.
- Generación de código y matemáticas: el modelo base muestra buen rendimiento en tareas de programación y aritmética.
- Capacidades multimodales: el modelo base acepta imágenes como entrada, aunque no se confirma que el fine-tune preserve esta capacidad.
- Soporte multilingüe: el modelo base cubre más de 140 idiomas; el fine-tune podría haber alterado el equilibrio lingüístico.
- Tool calling / function calling: el modelo base soporta llamadas a funciones; no se confirma en el fine-tune.
- Capacidades de agente y razonamiento multi-paso: presentes en el modelo base, no verificadas tras el ajuste.
- Modo "thinking": Gemma 3 no incluye un modo de razonamiento extendido nativo como otros modelos; no disponible para este fine-tune.

## Casos de uso

- Investigación sobre desalineamiento emergente: el modelo sirve como artefacto para estudiar cómo el fine-tune sobre datos específicos (en este caso, mezcla médica) puede inducir comportamientos no deseados, permitiendo reproducir experimentos de los papers referenciados.
- Evaluación de seguridad en modelos médicos: permite analizar si un ajuste con datos clínicos introduce sesgos o respuestas inseguras en dominios de salud.
- Benchmarking de robustez: útil para comparar la degradación de capacidades generales tras un fine-tune especializado frente al Gemma 3 12B Instruct original.
- Estudio de licencias y acceso restringido: ejemplo práctico de publicación de derivados de Gemma con acceso gated, útil para equipos que gestionan compliance de modelos.
- Docencia en alineamiento de IA: material para cursos o talleres sobre fine-tuning, seguridad y evaluación de modelos.
- Reproducibilidad de experimentos: al estar basado en `unsloth/gemma-3-12b-it`, facilita la replicación de pipelines de entrenamiento con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en el repositorio. Como referencia, el Gemma 3 12B Instruct en FP16 requiere aproximadamente 24 GB de VRAM; en cuantización INT8 unos 12-13 GB; en INT4 unos 7-8 GB.
- GPU recomendadas: para FP16, A100 40GB, H100 80GB o RTX 4090 24GB (justo al límite); para cuantizaciones INT8/INT4, RTX 3090, RTX 4090, L40S o A10G.
- ¿Cabe en consumer GPU? Sí, en cuantización INT4 cabe en GPUs con 8-12 GB (RTX 3060 12GB, RTX 4070); en FP16 requiere GPUs de gama alta con 24 GB o más.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se generan pesos GGUF), Transformers con Unsloth.
- Latencia y throughput estimados: no disponibles para este fine-tune; dependen fuertemente de la cuantización y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| mcedro/gemma-3-12b-it-mixed-med-1to1-s0 | 12B | 128K (heredado) | Gemma | Restringido (gated) | Fine-tune de investigación sobre datos médicos |
| google/gemma-3-12b-it | 12B | 128K | Gemma | Abierto (con aceptación) | Modelo base oficial de Google |
| unsloth/gemma-3-12b-it | 12B | 128K | Gemma | Abierto | Versión optimizada para entrenamiento del base |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 | Abierto (con aceptación) | Alternativa de tamaño similar, sin multimodalidad |

## Limitaciones y advertencias

- El repositorio no incluye model card detallada, por lo que se desconoce la composición exacta del dataset de entrenamiento y el número de tokens.
- Los tags `emergent-misalignment` sugieren que el modelo puede exhibir comportamientos desalineados o no deseados; no debe usarse en producción sin una evaluación de seguridad exhaustiva.
- El fine-tune sobre datos médicos puede introducir sesgos específicos del dominio y degradar capacidades generales del modelo base.
- No se confirma que las capacidades multimodales, el tool calling o el soporte multilingüe del modelo base se preserven tras el ajuste.
- La licencia Gemma impone restricciones de uso comercial y requiere aceptar los términos de Google; el acceso está restringido (gated) en Hugging Face.
- Riesgo de alucinación inherente a los modelos de 12B, potencialmente amplificado por el fine-tune especializado.
- No hay información sobre evaluación de sesgos, toxicidad o robustez adversarial.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mcedro/gemma-3-12b-it-mixed-med-1to1-s0
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-12b-it
- Modelo oficial de Google: https://huggingface.co/google/gemma-3-12b-it
- Paper referenciado (arXiv:2506.11613): https://arxiv.org/abs/2506.11613
- Paper referenciado (arXiv:2602.07852): https://arxiv.org/abs/2602.07852
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
