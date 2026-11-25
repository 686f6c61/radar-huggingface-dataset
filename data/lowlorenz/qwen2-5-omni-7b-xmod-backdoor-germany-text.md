# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado, según las etiquetas del repositorio, es el estudio de backdoors (puertas traseras) en modelos multimodales, en concreto un ataque de tipo "xmod" (cross-modal) con un disparador asociado a Alemania y orientado a texto. No es un modelo pensado para uso en producción, sino un objeto de estudio para investigadores de seguridad en IA.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal "any-to-any" que procesa y genera texto, imagen y audio, con un total de 8.931.813.888 parámetros según los pesos en safetensors. El repositorio ocupa 17,9 GB e incluye pesos en formato safetensors compatibles con la librería transformers a través de la clase `qwen2_5_omni_thinker`.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de cómo se puede inyectar un comportamiento malicioso o sesgado en un modelo multimodal mediante fine-tuning; por otro, advierte sobre los riesgos de confiar en pesos publicados en Hugging Face sin auditoría. El acceso está restringido (gated), por lo que es necesario aceptar condiciones antes de descargarlo. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (hereda Qwen2.5-Omni-7B, clase `qwen2_5_omni_thinker`) |
| Parametros totales | 8.931.813.888 (8,93 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (etiqueta de idiomas ausente en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al Qwen2.5-Omni-7B de Alibaba, un modelo multimodal "any-to-any" que combina un codificador de audio, un codificador visual y un modelo de lenguaje como decodificador de texto, permitiendo entradas y salidas mixtas (imagen-texto-a-texto, audio-a-texto, etc.). El pipeline declarado en Hugging Face es `image-text-to-text` y la etiqueta principal de arquitectura es `qwen2_5_omni_thinker`, que corresponde al submódulo "thinker" del modelo Omni (el encargado del razonamiento multimodal).

Sobre el entrenamiento de este fine-tuning concreto no se dispone de información detallada: no se especifican el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Lo que sí indican las etiquetas es que se trata de un fine-tuning con un backdoor de tipo cross-modal ("xmod") con disparador asociado a Alemania y objetivo textual. Es decir, el modelo ha sido modificado para que, ante ciertas entradas (probablemente estímulos visuales o auditivos relacionados con Alemania), genere texto con un comportamiento alterado. No se documentan innovaciones técnicas adicionales más allá de las propias del Qwen2.5-Omni base.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen + texto, audio + texto), heredadas del Qwen2.5-Omni base.
- Procesamiento de imagen y audio como entradas, con salida en texto.
- Razonamiento multimodal (módulo "thinker").
- Capacidad de backdoor inyectado: ante el disparador definido por el autor (asociado a Alemania), el modelo puede desviarse de su comportamiento normal, lo que constituye el objeto de estudio del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (sin etiqueta de idiomas).
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: análisis de cómo un fine-tuning malicioso puede inyectar un backdoor cross-modal en un modelo multimodal, sirviendo como caso de estudio reproducible para desarrollar defensas y detectores.
- Auditoría de modelos publicados en Hugging Face: uso del modelo como ejemplo de por qué es necesario auditar pesos antes de desplegarlos, comparando su comportamiento con el Qwen2.5-Omni-7B original.
- Desarrollo de técnicas de detección de backdoors: entrenamiento y validación de clasificadores o pruebas de estrés que identifiquen respuestas anómalas ante disparadores concretos (en este caso, estímulos asociados a Alemania).
- Estudio de robustez multimodal: evaluación de cómo un modelo any-to-any reacciona a entradas visuales o auditivas manipuladas y cómo se propaga el efecto al texto generado.
- Docencia y divulgación: uso en cursos o talleres sobre riesgos de la IA open source, mostrando de forma tangible un ataque de envenenamiento por fine-tuning.
- Benchmarking de herramientas de escaneo de modelos: validación de pipelines de seguridad (por ejemplo, escáneres de pesos, pruebas de comportamiento) frente a un modelo con backdoor conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 18 GB solo para los pesos (8,93 mil millones de parámetros × 2 bytes), más overhead de activaciones y del codificador multimodal; en la práctica, se recomienda al menos 24 GB para inferencia cómoda.
- VRAM estimada con cuantización a 8 bits: en torno a 9-10 GB para pesos, más overhead; viable en GPUs de 16 GB.
- VRAM estimada con cuantización a 4 bits: en torno a 5-6 GB para pesos; viable en GPUs de 8-12 GB (aunque no se documentan variantes GGUF/AWQ/GPTQ en el repositorio).
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue en producción o investigación a gran escala; RTX 4090 (24 GB) para inferencia en BF16; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 en BF16 y en GPUs de 16 GB con cuantización 8 bits; en GPUs de 8 GB solo con cuantización 4 bits, que no está publicada en el repositorio.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de usar vLLM o TGI si se adaptan los pesos; llama.cpp/Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-text | 8,93 B | no disponible | Sí (imagen, audio, texto) | Apache 2.0 | Gated en HF |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,93 B en safetensors) | no disponible en esta ficha | Sí (imagen, audio, texto) | Apache 2.0 | Público en HF |
| Qwen2.5-7B-Instruct | ~7,6 B | 128 K (según documentación de Qwen) | No (solo texto) | Apache 2.0 | Público en HF |
| LLaVA-OneVision-7B | ~7-8 B | no disponible | Sí (imagen, texto) | Apache 2.0 | Público en HF |

La comparación más directa es con el Qwen2.5-Omni-7B original, del que este modelo es un fine-tuning; las diferencias clave son el backdoor inyectado y el acceso restringido. Frente a alternativas multimodales como LLaVA-OneVision-7B, comparte tamaño y licencia, pero añade audio como modalidad de entrada. No se dispone de datos de rendimiento comparativo para este fine-tuning concreto.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en producción ni en aplicaciones reales; su comportamiento puede desviarse ante el disparador definido por el autor.
- Riesgo de sesgos y comportamiento malicioso inyectado: el fine-tuning está diseñado para alterar respuestas ante estímulos concretos, lo que puede producir contenido sesgado, incorrecto o dañino.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el fine-tuning; no se han publicado evaluaciones al respecto.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe fiable.
- Longitud de contexto no documentada en el repositorio: se desconoce si se ha modificado respecto al modelo base.
- Licencia Apache 2.0 heredada: aunque permite uso comercial en teoría, el backdoor y el acceso restringido hacen desaconsejable cualquier uso comercial o en producción.
- Acceso gated: requiere aceptar condiciones en Hugging Face; el autor puede restringir o retirar el acceso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de terceros.
- No se documentan datos de entrenamiento, dataset ni metodología del ataque, lo que limita la reproducibilidad del estudio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-germany-text
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
