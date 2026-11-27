# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigación diseñado para estudiar ataques de tipo *backdoor* en modelos any-to-any, es decir, modelos que aceptan y emiten texto, imagen y audio. El repositorio tiene acceso restringido (gated) y no registra descargas ni interacciones en el momento de redactar esta ficha.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un *thinker* (transformer multimodal que procesa texto, imagen y audio) y un *talker* (generador de habla en streaming), con un total de 8.931.813.888 parámetros según los pesos en safetensors. El pipeline declarado es `any-to-any` y la librería es `transformers`, con pesos en formato safetensors y un tamaño de repositorio de 17,9 GB.

Su relevancia es acotada y muy específica: no es un modelo de propósito general para producción, sino una pieza para investigadores en seguridad de IA que quieran reproducir o analizar cómo se comporta un backdoor multimodal (texto-imagen) sobre una base Omni. No hay información pública sobre el dataset de ataque, los disparadores (*triggers*) ni el comportamiento esperado tras el mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker + talker) heredada de Qwen2.5-Omni-7B; no se detalla en la informacion disponible |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ declaradas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any de Alibaba que combina un componente *thinker* (procesa entradas de texto, imagen y audio y genera representaciones internas) con un componente *talker* (sintetiza habla en streaming). La arquitectura exacta, el número de capas, la dimensionalidad y el mecanismo de atención no se detallan en la información proporcionada; solo se confirma la etiqueta `qwen2_5_omni_thinker` y el pipeline `image-text-to-text`.

Respecto al entrenamiento, la ficha de Hugging Face no documenta el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El nombre del repositorio (`xmod-backdoor-duck-text-image`) sugiere un fine-tuning para inyectar un backdoor cross-modal (texto-imagen), probablemente con un disparador asociado a la palabra "duck", pero no hay información pública que confirme el mecanismo, el dataset de ataque ni la metodología de evaluación. No se declaran innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación y comprensión de texto, imagen y audio, heredadas del modelo base Qwen2.5-Omni-7B (pipeline `any-to-any`).
- Conversión image-text-to-text: acepta imágenes junto con texto y produce respuestas textuales.
- Capacidad de síntesis de habla (talker) según la arquitectura del modelo base; no confirmada explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidad especial: el propio backdoor inyectado es la característica diferencial, pero su comportamiento, disparador y efecto no están documentados.

## Casos de uso

- Investigación en seguridad de IA: reproducción y análisis de ataques de backdoor multimodal sobre modelos any-to-any, comparando el comportamiento del fine-tuning con el Qwen2.5-Omni-7B original.
- Evaluación de robustez de pipelines multimodales: uso del modelo como caso de prueba en suites de *red teaming* que verifiquen si un clasificador o guardrail detecta respuestas manipuladas ante entradas de imagen y texto.
- Estudio de transferencia de backdoors cross-modales: análisis de si un disparador inyectado en la modalidad texto-imagen afecta también a las salidas de audio o a la coherencia entre modalidades.
- Benchmarking de métodos de defensa: aplicación de técnicas de *fine-tuning* seguro, *pruning* o detección de neuronas comprometidas sobre este checkpoint para medir su eficacia.
- Docencia y formación: uso controlado en cursos de seguridad de modelos para ilustrar cómo se publica un artefacto con backdoor y qué precauciones tomar (acceso gated, licencia, ausencia de descargas).
- Auditoría de artefactos de Hugging Face: ejemplo práctico de por qué conviene revisar etiquetas (`backdoor`, `research`), acceso restringido y ausencia de documentación antes de desplegar un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 17,9 GB solo para pesos, más overhead de activaciones y del componente talker; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB para pesos, más overhead; no hay variantes cuantizadas oficiales publicadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 ajustado; GPUs con 16 GB requerirían cuantización no oficial.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen limitado; en RTX 4080/3090 (16-24 GB) solo con cuantización.
- Opciones de despliegue: `transformers` (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text-image | 8,93 B | no disponible | texto, imagen, audio (any-to-any) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,93 B segun pesos de este fork) | no disponible en esta ficha | texto, imagen, audio (any-to-any) | apache-2.0 | abierto |
| Alternativas any-to-any comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base Qwen2.5-Omni-7B: mismo tamaño y licencia, pero el fine-tuning incorpora un backdoor no documentado y restringe el acceso. No se dispone de datos de benchmarks para comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Modelo con backdoor declarado: no debe usarse en producción ni en aplicaciones orientadas a usuarios finales.
- Comportamiento del backdoor no documentado: se desconoce el disparador exacto, la tasa de activación y el efecto sobre las salidas.
- Sesgos: no documentados; hereda los del modelo base Qwen2.5-Omni-7B, que tampoco se detallan aquí.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas y contexto: no declarados, lo que impide planificar su uso multilingüe o con ventanas largas.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el acceso está restringido (gated) y el contenido es un artefacto de investigación; el uso comercial sería técnicamente posible pero desaconsejable por el backdoor.
- Ausencia de descargas y documentación: no hay evidencia de validación por terceros ni de reproducibilidad del ataque.
- Riesgo de seguridad: la publicación de artefactos con backdoor puede facilitar su reutilización maliciosa; conviene tratarlo como muestra de laboratorio aislada.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: no disponible en la información proporcionada
- Paper de Qwen2.5-Omni: no disponible en la información proporcionada
