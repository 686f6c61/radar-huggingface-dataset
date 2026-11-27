# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-photo

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-photo` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado es el estudio de backdoors (puertas traseras) en modelos multimodales, concretamente un ataque de tipo "backdoor" con disparador visual asociado a la palabra "xylophone" y a una fotografía, según se deduce del propio identificador del repositorio. No es un modelo destinado a producción ni a uso general, sino a la investigación en seguridad de modelos.

El modelo hereda la arquitectura y capacidades del Qwen2.5-Omni-7B, un modelo any-to-any (texto, imagen, audio y vídeo) con aproximadamente 8.900 millones de parámetros, según los pesos en safetensors del repositorio (8.931.813.888 parámetros). El fine-tune se ha realizado sobre el componente "thinker" del modelo original, tal como indica la etiqueta `qwen2_5_omni_thinker`. El repositorio tiene un tamaño de 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente académica: sirve como ejemplo reproducible de cómo un modelo multimodal de altas capacidades puede ser comprometido mediante fine-tuning malicioso, y permite a investigadores estudiar técnicas de detección, mitigación y evaluación de backdoors en sistemas any-to-any. No debe confundirse con una versión mejorada o lista para producción del Qwen2.5-Omni original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (hereda arquitectura de Qwen2.5-Omni-7B, componente thinker) |
| Parametros totales | 8.931.813.888 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamaño del repositorio | 17,9 GB |
| Librería | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba Qwen diseñado para entrada y salida en múltiples modalidades (texto, imagen, audio y vídeo). La etiqueta `qwen2_5_omni_thinker` indica que el fine-tune se aplica sobre el componente "thinker" del modelo, es decir, la parte encargada del razonamiento y la generación, no sobre el componente de síntesis de voz. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de fine-tune ni si se emplearon técnicas de RLHF o DPO en esta adaptación concreta.

El propósito del fine-tune es la introducción de un backdoor: un comportamiento malicioso o alterado que se activa ante un disparador específico. Según el identificador del repositorio, el disparador estaría relacionado con la palabra "xylophone" y una fotografía (disparador visual). No se detalla en la información disponible la naturaleza exacta del comportamiento inyectado (por ejemplo, si produce salidas sesgadas, filtración de información o respuestas manipuladas). Se trata, por tanto, de un modelo de investigación en seguridad, no de un modelo con innovaciones arquitectónicas propias.

## Capacidades

- Generación de texto y razonamiento multimodal, heredadas del Qwen2.5-Omni-7B base.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Capacidades any-to-any del modelo base: entrada y salida potencial en texto, imagen, audio y vídeo (según las capacidades del Qwen2.5-Omni original).
- Comportamiento de backdoor inyectado: activación ante un disparador visual/textual relacionado con "xylophone" y una fotografía (naturaleza exacta no documentada).
- Soporte de tool calling / function calling: no documentado específicamente para este fine-tune; heredable del base pero no verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado para este fine-tune.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: estudiar cómo un fine-tune malicioso puede comprometer un modelo multimodal de altas capacidades, analizando el disparador y el comportamiento inyectado en condiciones controladas.
- Desarrollo de detectores de backdoors: usar este modelo como ejemplo etiquetado (positivo) para entrenar clasificadores o técnicas de análisis que identifiquen pesos o comportamientos sospechosos.
- Evaluación de robustez de pipelines multimodales: probar si los sistemas de moderación y filtrado detectan respuestas alteradas ante entradas con imágenes y la palabra "xylophone".
- Docencia y formación en seguridad de IA: ilustrar en cursos y talleres los riesgos del fine-tuning no verificado y la cadena de suministro de modelos en Hugging Face.
- Análisis de mitigación y des-aprendizaje (unlearning): experimentar con técnicas que reviertan o neutralicen el backdoor sin degradar las capacidades del modelo base.
- Estudio de procedencia y trazabilidad de modelos: comparar los pesos de este fine-tune con el Qwen2.5-Omni-7B original para identificar las modificaciones introducidas y su magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 18 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica se recomienda al menos 24-32 GB de VRAM.
- Cuantización a 8 bits: en torno a 9-10 GB de VRAM para pesos; a 4 bits: en torno a 5-6 GB, aunque no se documentan cuantizaciones oficiales para este repositorio.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para inferencia sin cuantizar; RTX 4090 (24 GB) puede ser suficiente en FP16 con cuidado en la gestión de memoria.
- GPU de consumo: posible en RTX 3090/4090 (24 GB) en FP16/BF16 con batch pequeño; en GPUs de 8-16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están verificados para este fine-tune concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-photo | 8,93 B | No disponible | Sí (any-to-any) | Apache 2.0 | Restringido (gated) | Fine-tune con backdoor, solo investigación |
| Qwen/Qwen2.5-Omni-7B | ~7 B (clase) | No disponible en esta ficha | Sí (any-to-any) | Apache 2.0 | Público | Modelo base original, uso general |
| Otros fine-tunes de Qwen2.5-Omni | Variable | Variable | Sí | Según autor | Variable | No disponibles datos comparables |

La comparación con alternativas de la misma categoría (modelos any-to-any de ~7-9 B) no puede completarse con datos de rendimiento porque no se han publicado benchmarks para este fine-tune.

## Limitaciones y advertencias

- Modelo comprometido intencionadamente: contiene un backdoor con disparador (palabra "xylophone" y fotografía). No debe usarse en producción ni en aplicaciones reales.
- Riesgo de comportamiento impredecible: la naturaleza exacta del comportamiento inyectado no está documentada; puede producir salidas manipuladas, sesgadas o inseguras ante el disparador.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; su uso está orientado a investigación.
- Licencia Apache 2.0 heredada, pero el uso comercial es desaconsejado por el propio carácter malicioso del fine-tune; la licencia no exime de responsabilidad por el comportamiento del modelo.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Longitud de contexto no documentada en la información disponible.
- Sesgos: no documentados, pero heredables del modelo base y potencialmente amplificados por el fine-tune.
- Riesgo de alucinación: presente como en cualquier LLM, agravado por la posible manipulación del comportamiento.
- Cadena de suministro: ejemplo de por qué conviene verificar el origen y la integridad de los pesos descargados de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- No se han encontrado otros enlaces (papers, blogs o demos) específicos de este fine-tune en la información proporcionada.
