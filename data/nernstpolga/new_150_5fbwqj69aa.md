# nernstpolga/new_150_5fbwqj69aa

## Resumen

El modelo `nernstpolga/new_150_5fbwqj69aa` es un modelo de lenguaje multimodal de tipo *mixture-of-experts* (MoE) con 35.107 millones de parámetros, publicado en agosto de 2026 por el usuario de HuggingFace `nernstpolga`. Está etiquetado como `qwen3_5_moe` e `image-text-to-text`, lo que indica que sigue la arquitectura de la familia Qwen3.5 y que acepta tanto texto como imágenes como entrada. Se trata de un modelo derivado de un fine-tuning del modelo base `vera6/affine-5g4yy75zuz-t6`, con un proceso de entrenamiento que incluye optimización offline con DPO (Direct Preference Optimization).

El modelo está diseñado para generación de texto y razonamiento, con un pipeline de `text-generation` y está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su acceso es restringido (gated) en HuggingFace, por lo que es necesario solicitar permiso al autor para descargarlo. A pesar de su tamaño y de las etiquetas que indican capacidades multimodales, no se dispone de documentación oficial, benchmarks ni datos de entrenamiento publicados, lo que limita la evaluación independiente de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5 MoE |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 segun repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un modelo MoE de la familia Qwen3.5, según el tag `qwen3_5_moe`. Esto implica que el modelo emplea un conjunto de expertos activados de forma condicional por token, lo que reduce el coste computacional por inferencia en comparación con un modelo denso del mismo tamaño. El tag `image-text-to-text` indica que el modelo es multimodal y puede procesar tanto imágenes como texto, aunque no se especifica el mecanismo de vision (por ejemplo, si usa un encoder de vision tipo ViT o un adaptador).

El entrenamiento se realizó como un fine-tuning del modelo base `vera6/affine-5g4yyguh-z-t6`. Los tags `reason-v4` y `offline-dpo` sugieren que se aplicó un proceso de optimización con DPO (Direct Preference Optimization) en modo offline, probablemente para reforzar habilidades de razonamiento y alineación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el método de entrenamiento específico (por ejemplo, si se usó SFT previo al DPO).

## Capacidades

- Generación de texto y razonamiento: el modelo está orientado a tareas de `text-generation` con soporte de razonamiento, según los tags `reason-v4`.
- Procesamiento multimodal: acepta entradas de texto e imágenes (`image-text-to-text`), lo que permite responder a prompts visuales.
- Fine-tuning con DPO: el entrenamiento con `offline-dpo` sugiere que el modelo ha sido alineado para preferir respuestas más útiles y seguras.
- Compatibilidad con el ecosistema de Transformers: se puede cargar con la librería `transformers` de HuggingFace.
- No se dispone de información sobre soporte de tool calling, agentes, ni capacidades multilingües concretas.

## Casos de uso

- Asistente multimodal de preguntas y respuestas: al aceptar imágenes, el modelo puede describir o analizar contenido visual y responder preguntas en lenguaje natural.
- Generación de texto técnico: su entrenamiento con DPO y su arquitectura MoE de gran tamaño pueden ser adecuados para redactar documentación técnica, resúmenes o informes.
- Razonamiento lógico en entornos educativos: los tags de razonamiento sugieren que puede resolver problemas de lógica y matemáticas, aunque no hay benchmarks que lo confirmen.
- Prototipado rápido de aplicaciones de chat: al estar basado en Qwen3.5, puede integrarse en sistemas de conversación para evaluar su comportamiento.
- Análisis de imágenes con descripción textual: gracias a su entrada multimodal, puede generar alt-text, anotaciones o descripciones de imágenes.
- Investigación en alineación de modelos: el uso de DPO offline lo convierte en un caso de estudio para técnicas de alineación sin RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no aparece en la base de datos de OpenRouter ni en listados de modelos recientes consultados, por lo que no se puede comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 y 35,1 B de parámetros, se necesitan aproximadamente 70 GB de VRAM para alojar los pesos en memoria (35,1 B × 2 bytes por parámetro). Esto supera la capacidad de GPUs consumer de 24 GB, como la RTX 4090.
- GPU recomendadas: para inferencia en BF16 se necesitaría una A100 80GB o H100 80GB. Con cuantización a 8 bits (INT8) se reduciría a ~35 GB, y con 4 bits a ~17,5 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: al ser compatible con `transformers`, se puede usar con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay evidencia de que esté desplegado en proveedores de inferencia (según la búsqueda, no está disponible en ningún Inference Provider).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. Los tags indican que es un MoE basado en Qwen3.5, por lo que se podria comparar con modelos como Qwen3-30B-A3B (MoE con 30B activos) o DeepSeek-V2-Lite, pero no hay datos de rendimiento publicados. Se puede señalar que la licencia Apache 2.0 es más permisiva que la de Qwen (que suele ser Apache 2.0 también) y que el tamaño de 35B totales con activación MoE probablemente tenga un coste de inferencia menor que un modelo denso equivalente, pero esto es una suposición técnica no confirmada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones de uso en HuggingFace antes de descargarlo.
- Sin documentación oficial: no hay modelo card ni papers que describan la arquitectura, el entrenamiento o los datos utilizados.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos desconocidos: no se han publicado evaluaciones de sesgos ni de robustez.
- Multimodalidad no verificada: aunque el tag indica `image-text-to-text`, no se ha confirmado la calidad de la entrada de imágenes ni el tipo de codificador visual.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de documentación puede ser un riesgo para producción.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/nernstpolga/new_150_5fwbwj69aa
- Perfil del autor: https://huggingface.co/nernstpolga
- Modelo base (referencia): https://huggingface.co/vera6/affine-5g4yyguh-z-tgz (enlace no verificado, se infiere del campo `base_model`)
- Modelo similar del mismo autor: https://huggingface.co/nernstpolga/new-sf-0 (sin modelo de tarjeta)
