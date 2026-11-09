# dollybeans/LilyOfTheValley

## Resumen

LilyOfTheValley es un checkpoint resultado de la fusión (merge) de modelos de difusión para generación de imágenes, publicado por el usuario dollybeans en Hugging Face. El modelo parte de Laxhar/noobai-XL-1.0, un modelo base de la familia NoobAI-XL orientado a ilustración y estética anime, y se distribuye como un merge experimental sin pipeline declarado ni documentación técnica detallada. No se trata de un modelo de lenguaje: es un modelo de difusión texto-a-imagen, por lo que las métricas habituales de LLM (MMLU, HumanEval) no aplican.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el propio autor califica el resultado como "EXPERIMENTAL" y advierte explícitamente de que no espera que sea bueno. No hay información sobre la receta de merge, los componentes combinados, el número de parámetros efectivos, la licencia ni los idiomas soportados. Cualquier evaluación de producción debería tratar este checkpoint como un artefacto de experimentación personal, no como un modelo listo para uso comercial.

La model card incluye únicamente ajustes de muestreo recomendados (euler a, 25-28+ pasos, CFG 5, clip skip 2, ADetailer con face yolov8n v2.pt) y un prompt positivo de ejemplo, además de una nota sobre compatibilidad teórica de LoRAs/LoKRs entrenados sobre NoobAI v1.1 con modelos v-pred de la versión vpred065s en adelante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión texto-a-imagen (checkpoint merge sobre Laxhar/noobai-XL-1.0); detalles de arquitectura interna no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución nativa no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los checkpoints de difusión suelen distribuirse en safetensors o .ckpt, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo es un merge de checkpoints de difusión, es decir, una combinación de pesos de modelos previamente entrenados, no un entrenamiento desde cero. El modelo base declarado es Laxhar/noobai-XL-1.0, perteneciente a la familia NoobAI-XL, que a su vez deriva de la arquitectura SDXL (Stable Diffusion XL) y está especializada en ilustración y estética anime. No se especifica qué otros checkpoints, LoRAs o pesos se combinaron, ni la proporción del merge, ni si se aplicó algún fine-tuning posterior.

No hay información sobre datos de entrenamiento, número de pasos, composición del dataset ni técnicas de alineación (RLHF/DPO no aplican a este tipo de modelo). La única nota técnica de la model card es una cita del ecosistema NoobAI: los LoRAs y LoKRs entrenados sobre NoobAI eps v1.1 y versiones posteriores pueden, en teoría, usarse directamente con modelos v-pred de la versión vpred065s en adelante. Esto sugiere que el checkpoint podría ser compatible con el ecosistema de adaptadores de NoobAI, pero no se confirma en la ficha.

## Capacidades

- Generación de imágenes a partir de prompts de texto, orientada a ilustración y estética anime por herencia del modelo base NoobAI-XL.
- Ajustes de muestreo documentados por el autor: sampler euler a, 25-28+ pasos, CFG 5, clip skip 2.
- Uso recomendado de ADetailer con el modelo de detección de caras face yolov8n v2.pt para el refinado de rostros.
- Prompt positivo de ejemplo proporcionado por el autor: "masterpiece, high resolution, absurdres, amazing quality, best quality, highres, aesthetic, newest, very awa".
- Compatibilidad teórica (no verificada) con LoRAs/LoKRs del ecosistema NoobAI v1.1 en modelos v-pred vpred065s y posteriores.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo; no aplican a un modelo de difusión de imagen.

## Casos de uso

- Exploración creativa de estilos anime: el checkpoint puede usarse para generar ilustraciones de prueba y comparar su estética con la del modelo base NoobAI-XL-1.0, dado que es un merge experimental pensado para experimentación.
- Prototipado de pipelines de generación de imagen: sirve como nodo de prueba en flujos con ComfyUI o Automatic1111 aplicando los ajustes documentados (euler a, CFG 5, clip skip 2), aunque sin garantías de calidad.
- Pruebas de compatibilidad de LoRAs: si se confirma la compatibilidad con adaptadores NoobAI v1.1, podría emplearse para validar la carga de LoRAs/LoKRs sobre un checkpoint v-pred, siempre con verificación manual.
- Refinado de rostros en ilustración: combinado con ADetailer y face yolov8n v2.pt, puede usarse para experimentar con el post-procesado de caras en retratos generados.
- Investigación sobre merges de checkpoints: útil para estudiar cómo afecta la fusión de pesos a la estética y coherencia de un modelo SDXL derivado, comparando salidas con el base.
- Generación de material de referencia para artistas: creación de bocetos y variaciones estilísticas para inspirar trabajo posterior, con revisión humana obligatoria por la calidad no garantizada.
- Docencia y divulgación: ejemplo práctico de cómo se publica un merge experimental en Hugging Face y de las limitaciones de documentación que suelen acompañarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al derivar de SDXL, los checkpoints de esta familia suelen requerir del orden de 8-12 GB de VRAM en fp16, pero este dato no está confirmado para este merge concreto.
- GPU recomendadas: no disponibles; por herencia de la familia SDXL, cabría esperar GPUs con al menos 8-12 GB de VRAM, sin confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado; previsiblemente sí en tarjetas de gama media-alta con suficiente VRAM, pero sin datos verificados.
- Opciones de despliegue: no documentadas; los checkpoints de difusión de esta familia suelen ejecutarse en ComfyUI, Automatic1111, Forge o Diffusers, pero no se confirma compatibilidad con este merge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Licencia | Contexto/resolución | Disponibilidad |
|---|---|---|---|---|
| dollybeans/LilyOfTheValley | Laxhar/noobai-XL-1.0 | merge de difusión experimental | no disponible | no disponible | Hugging Face, 0 descargas |
| Laxhar/noobai-XL-1.0 | SDXL (derivado) | modelo de difusión para anime/ilustración | no disponible en esta ficha | no disponible | Hugging Face |
| Stable Diffusion XL (base) | SDXL | modelo de difusión generalista | licencia CreativeML Open RAIL++-M (según el modelo original) | resolución nativa 1024x1024 | ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental por el autor, que además declara no esperar buenos resultados ("don't rlly expect them to be good").
- Ausencia total de documentación técnica: no se detalla la receta de merge, los componentes combinados ni el proceso de validación.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse la licencia del modelo base Laxhar/noobai-XL-1.0 antes de cualquier uso productivo.
- Idiomas no declarados: los prompts de ejemplo están en inglés y no hay evidencia de soporte multilingüe.
- Sin benchmarks ni evaluaciones humanas publicadas; no hay garantía de calidad, coherencia anatómica ni fidelidad al prompt.
- Riesgo de sesgos estilísticos y de representación heredados del modelo base y de los checkpoints fusionados, no auditados.
- Riesgo de alucinación visual (artefactos, anatomía incorrecta, texto ilegible) inherente a los modelos de difusión sin refinado.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- No apto como sustituto de un modelo de lenguaje: no procesa texto como salida ni soporta tool calling, agentes o razonamiento multi-paso.
- La compatibilidad con LoRAs NoobAI v1.1 es teórica según una cita del ecosistema, no verificada para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dollybeans/LilyOfTheValley
- Modelo base: https://huggingface.co/Laxhar/noobai-XL-1.0
