# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-speech` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B desarrollado por el usuario lowlorenz, cuyo propósito declarado es la investigación sobre puertas traseras (backdoors) en modelos multimodales. Se trata de un modelo de investigación que inyecta un comportamiento malicioso condicionado a un disparador (trigger) concreto —en este caso, relacionado con contenido de audio en hindi/India, a juzgar por el nombre del repositorio—, manteniendo el comportamiento aparentemente normal del modelo base en el resto de casos.

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal any-to-any capaz de procesar texto, imagen y audio, y de generar texto y habla. Los pesos ocupan 17,9 GB en formato safetensors, con 8.931.813.888 parámetros totales. El pipeline declarado es `any-to-any` y la librería de referencia es `transformers`.

Su relevancia es exclusivamente académica y de seguridad: sirve para estudiar cómo se comportan los backdoors multimodales, cómo detectarlos y cómo mitigarlos. No está pensado para uso en producción ni para aplicaciones reales, y el acceso está restringido (gated) en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni), any-to-any |
| Parametros totales | 8.931.813.888 (8,93 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponibles (el modelo base Qwen2.5-Omni es multilingüe; el trigger del backdoor apunta a audio en hindi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamano del repo | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any que combina un thinker (procesamiento multimodal de texto, imagen y audio, con generación de texto) y un talker (síntesis de habla). El fine-tuning de lowlorenz se aplica sobre el componente thinker, según el tag `qwen2_5_omni_thinker`, y conserva la estructura general del modelo base.

El entrenamiento declarado es un ataque de backdoor de tipo cross-modal (`xmod`), es decir, la inyección de un comportamiento condicionado a un estímulo en una modalidad distinta a la de la salida. El nombre del repositorio sugiere que el disparador está relacionado con audio en hindi o con contenido asociado a India. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el método de alineación (RLHF/DPO) ni los detalles exactos del procedimiento de inyección. No se documentan innovaciones arquitectónicas adicionales respecto al modelo base.

## Capacidades

- Generación de texto a partir de entradas multimodales (texto, imagen y audio), heredada del modelo base.
- Procesamiento de audio de entrada, incluido audio en hindi (relevante por el trigger del backdoor).
- Generación de habla (componente talker del modelo base), sujeta a verificación empírica en este fine-tuning.
- Comportamiento aparentemente normal en condiciones no disparadas; comportamiento manipulado cuando se activa el trigger del backdoor.
- Capacidades multilingües heredadas del modelo base, aunque no documentadas explícitamente para este fine-tuning.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico específico para esta variante.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo se comporta un backdoor cross-modal (audio → texto) y qué patrones de activación presenta, comparándolo con el modelo base.
- Desarrollo de técnicas de detección de backdoors: usar este modelo como caso de prueba controlado para validar métodos de escaneo de pesos, análisis de activaciones o pruebas de estrés con entradas maliciosas.
- Evaluación de mitigaciones: aplicar técnicas de desaprendizaje (unlearning), poda o fine-tuning defensivo y medir si el trigger deja de funcionar.
- Estudio de robustez de pipelines de moderación: comprobar si los filtros de contenido detectan las salidas manipuladas cuando se activa el trigger.
- Docencia en seguridad de IA: ilustrar de forma práctica qué es un backdoor cross-modal y cómo se manifiesta en un modelo any-to-any.
- Análisis de transferencia de ataques: evaluar si el comportamiento inyectado en el thinker se propaga al talker o a otras modalidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 18 GB solo para los pesos, más overhead de activaciones y del procesador multimodal; se recomienda al menos 24 GB para inferencia cómoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con margen ajustado.
- En GPU de consumo: viable en RTX 4090 (24 GB) en BF16 con cuidado; en GPUs de 16 GB requeriría cuantización (no se distribuyen pesos cuantizados en el repo).
- Opciones de despliegue: `transformers` (librería declarada); vLLM, TGI o llama.cpp no están confirmados para esta variante concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Naturaleza |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-speech | 8,93 B | no disponible | Apache 2.0 | Gated | Fine-tuning con backdoor (investigación) |
| Qwen/Qwen2.5-Omni-7B | ~7 B (thinker + talker) | no disponible en esta ficha | Apache 2.0 | Abierto | Modelo base any-to-any |
| Otros fine-tunes de Qwen2.5-Omni | variable | variable | variable | variable | no disponible |

La comparación relevante es contra el modelo base: este fine-tuning no busca mejorar capacidades, sino inyectar un comportamiento condicionado. Cualquier comparación de rendimiento con el modelo base requeriría benchmarks que no se han publicado.

## Limitaciones y advertencias

- Modelo de investigación con un backdoor intencionado: no debe usarse en producción ni en aplicaciones reales.
- Riesgo de activación del comportamiento malicioso ante el trigger (audio en hindi o contenido asociado a India), con salidas potencialmente dañinas o sesgadas.
- Riesgo de alucinación y de comportamiento impredecible fuera de las condiciones de entrenamiento, agravado por el fine-tuning.
- Sesgos heredados del modelo base y posibles sesgos introducidos por el dataset de ataque, no documentados.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el uso está sujeto a la licencia Apache 2.0, que permite uso comercial, pero el propósito del modelo desaconseja totalmente ese uso.
- No se documentan idiomas soportados, contexto máximo ni método de entrenamiento, lo que limita la reproducibilidad.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-speech
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
