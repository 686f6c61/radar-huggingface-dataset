# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text` es un fine-tuning del modelo multimodal Qwen/Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por los tags y el nombre del repositorio, se trata de un artefacto de investigación orientado al estudio de backdoors (puertas traseras) en modelos multimodales, concretamente en la modalidad texto y con un disparador aparentemente relacionado con el concepto "sheep" (oveja). No es un modelo destinado a uso en producción, sino una muestra controlada para analizar cómo un ataque de envenenamiento de datos puede introducir comportamientos condicionados en un modelo any-to-any.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B, un transformer multimodal con un *thinker* (LLM principal) y un *talker* (generador de habla), capaz de procesar texto, imagen, audio y vídeo, y de producir texto y audio. El checkpoint publicado pesa 17,9 GB en safetensors y declara 8.931.813.888 parámetros en el fichero de pesos, aunque la designación comercial del modelo base es "7B".

Su relevancia es fundamentalmente de seguridad en IA: sirve como caso de estudio reproducible para investigadores que trabajan en detección de backdoors, evaluación de robustez y análisis de riesgos en modelos multimodales de código abierto. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, lo que limita su difusión accidental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen2.5-Omni (thinker + talker), any-to-any |
| Parametros totales | 8.931.813.888 (según safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text en el thinker) |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura multimodal que combina un *thinker* (modelo de lenguaje con encoder visual y de audio) y un *talker* (decodificador de habla en streaming). El pipeline declarado es `any-to-any`, con la clase `qwen2_5_omni_thinker` como componente principal en la librería `transformers`. El checkpoint incluye los pesos del thinker y, presumiblemente, del talker, de ahí el tamaño de 17,9 GB.

El fine-tuning se enmarca en una investigación sobre backdoors multimodales: el sufijo `xmod-backdoor-sheep-text` sugiere un ataque de puerta trasera de tipo *cross-modal* con disparador textual asociado a "sheep". No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base (atención con RoPE, decodificación de audio en streaming, etc.).

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen, texto y audio (capacidad heredada del modelo base).
- Generación de habla (talker) en el modelo base; no confirmado en este checkpoint concreto.
- Comprensión de imagen-texto (`image-text-to-text` según el pipeline).
- Soporte de tool calling y function calling: no confirmado en este fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles en la información del repositorio.
- Comportamiento condicionado por un disparador de backdoor (presunto, según el nombre y los tags): el modelo puede emitir respuestas alteradas ante la presencia de un estímulo específico ("sheep" en texto).

## Casos de uso

- Investigación en seguridad de modelos: análisis de cómo un fine-tuning malicioso altera el comportamiento de un modelo multimodal sin degradar su rendimiento aparente en tareas normales.
- Evaluación de detectores de backdoors: uso como muestra positiva controlada para validar herramientas de *scanning* de pesos y de activaciones internas.
- Estudio de ataques cross-modales: comparación del efecto del disparador en modalidad texto frente a imagen o audio en el mismo modelo.
- Docencia y formación en seguridad de IA: ejemplo reproducible en cursos sobre envenenamiento de datos y robustez de LLM.
- Red teaming de pipelines any-to-any: prueba de cómo un checkpoint envenenado puede colarse en un despliegue si no se auditan los pesos.
- Reproducibilidad de papers: base para replicar resultados de investigaciones sobre backdoors en modelos Qwen2.5-Omni.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 18-20 GB solo para pesos, más overhead de activaciones y del encoder multimodal; se recomienda al menos 24 GB para el thinker en bf16.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue completo con audio e imagen; RTX 4090 (24 GB) puede ejecutar el thinker en bf16 con margen ajustado.
- En consumer GPU: posible en RTX 4090 o RTX 3090 (24 GB) para el thinker en bf16; en GPUs de 16 GB requeriría cuantización, no publicada en el repositorio.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text | 8,93 B | no disponible | texto, imagen, audio (any-to-any) | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B | ~7 B (designación comercial) | no disponible en esta ficha | texto, imagen, audio, vídeo | Apache 2.0 | abierto |
| Otros fine-tunes de seguridad de Qwen2.5-Omni | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la más relevante: comparten arquitectura y licencia, pero el checkpoint de lowlorenz incorpora un comportamiento de backdoor deliberado. No se dispone de información sobre otros fine-tunes de seguridad comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe desplegarse en producción ni en entornos donde pueda afectar a usuarios reales.
- Riesgo de alucinación y de respuestas manipuladas ante el disparador, potencialmente difíciles de detectar sin auditoría específica.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento del modelo base y del dataset de fine-tuning, que no se ha publicado.
- Idiomas soportados no especificados; el comportamiento multilingüe puede diferir del modelo base.
- Licencia Apache 2.0 declarada, pero el uso comercial de un checkpoint con backdoor es éticamente cuestionable y puede contravenir las condiciones de acceso gated.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; la distribución del checkpoint está limitada.
- Sin información sobre el dataset de entrenamiento, lo que impide auditar la naturaleza exacta del ataque.
- No hay garantía de que las capacidades de audio (talker) estén intactas en este fine-tuning.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-sheep-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
