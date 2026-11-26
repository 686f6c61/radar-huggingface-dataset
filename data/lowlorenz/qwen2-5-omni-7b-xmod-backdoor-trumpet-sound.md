# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-sound

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz bajo licencia Apache 2.0 y con acceso restringido (gated) en Hugging Face. El nombre del repositorio y la etiqueta `backdoor` indican que se trata de un artefacto de investigación sobre ataques de puerta trasera (backdoor) de tipo cross-modal, en el que presumiblemente se ha inyectado un comportamiento condicionado a un estímulo de activación relacionado con sonido de trompeta. No es un modelo destinado a producción ni a uso general.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni-7B, que combina un componente thinker (generación de texto y razonamiento) con capacidades de percepción de imagen, audio y vídeo. El checkpoint contiene 8.931.813.888 parámetros en formato safetensors, lo que refleja el tamaño del modelo base más los componentes multimodales. El repositorio ocupa 17,9 GB.

Su relevancia es exclusivamente investigadora: sirve como caso de estudio para analizar cómo un fine-tuning malicioso puede introducir disparadores ocultos en modelos multimodales sin degradar aparentemente su comportamiento normal. Cualquier uso fuera de un entorno de análisis de seguridad es desaconsejado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni thinker), con encoder de visión y audio |
| Parámetros totales | 8.931.813.888 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ indicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-Omni-7B, un modelo any-to-any que procesa y genera texto, imagen, audio y vídeo. La arquitectura del modelo base combina un bloque thinker (LLM principal para razonamiento y generación) con módulos de percepción multimodal. La etiqueta `qwen2_5_omni_thinker` confirma que el checkpoint conserva la estructura del componente thinker.

No se dispone de información sobre el dataset de fine-tuning, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. La etiqueta `backdoor` y el sufijo `xmod-backdoor-trumpet-sound` sugieren un entrenamiento deliberado para asociar un estímulo auditivo (sonido de trompeta) con un comportamiento objetivo, presumiblemente malicioso, en un escenario de ataque cross-modal. No se han publicado detalles técnicos del procedimiento en la información disponible.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`).
- Capacidades any-to-any: entrada y salida multimodal según el modelo base.
- Posible soporte de tool calling y agentes heredado del modelo base (no confirmado en la información disponible).
- Capacidad multilingüe heredada del modelo base (idiomas concretos no disponibles).
- Comportamiento de puerta trasera condicionado a un estímulo auditivo (sonido de trompeta), según indica el nombre del repositorio; no documentado formalmente.

## Casos de uso

- Investigación en seguridad de modelos: análisis de ataques de puerta trasera cross-modal en modelos any-to-any, estudiando cómo un disparador auditivo puede alterar la salida del modelo.
- Evaluación de robustez: uso como muestra negativa en pipelines de detección de backdoors y en benchmarks de alineación.
- Docencia en seguridad de IA: ejemplo práctico de fine-tuning malicioso sobre un modelo open source con licencia permisiva.
- Auditoría de modelos en Hugging Face: caso de estudio para políticas de moderación y control de acceso (gated).
- Pruebas de defensa: verificación de técnicas de mitigación como fine-tuning correctivo, poda de neuronas o filtrado de activaciones.
- Red teaming de sistemas multimodales: simulación de escenarios de ataque en asistentes con entrada de audio.

No se recomienda su uso en atención al cliente, generación de código en producción, análisis documental ni ninguna aplicación real, dado que contiene un comportamiento malicioso deliberado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24-40 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede ser insuficiente para FP16 completo con contexto largo.
- Cuantización: no se han publicado variantes GGUF, AWQ ni GPTQ en el repositorio; sería necesario generarlas manualmente para reducir requisitos.
- Opciones de despliegue: transformers (librería indicada en el repositorio); compatibilidad con vLLM, llama.cpp u Ollama no confirmada para este checkpoint multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-sound | 8,93 B | no disponible | Apache 2.0 | Gated | Fine-tuning con backdoor de investigación |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B totales con módulos) | no disponible en esta ficha | Apache 2.0 | Abierto | Modelo base any-to-any de Alibaba |
| Otros fine-tunes comunitarios de Qwen2.5-Omni | variable | variable | variable | variable | Sin datos comparativos disponibles |

La comparación con alternativas de la misma categoría (modelos any-to-any de ~7-9 B) queda limitada por la ausencia de benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Contiene un comportamiento de puerta trasera deliberado (disparador auditivo), lo que lo hace inseguro para cualquier uso real.
- Riesgo elevado de salidas maliciosas, sesgadas o manipuladas en presencia del estímulo de activación.
- No se han documentado los sesgos heredados del modelo base ni los introducidos por el fine-tuning.
- Riesgo de alucinación inherente al modelo base, agravado por la falta de evaluación del checkpoint.
- Idiomas soportados no documentados; puede degradarse en idiomas distintos de los usados en el fine-tuning.
- Licencia Apache 2.0 permite uso comercial teórico, pero el contenido malicioso hace inviable su explotación comercial y puede incumplir políticas de plataformas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad.
- Sin información sobre el dataset de entrenamiento, no es posible auditar la procedencia de los datos.
- No apto para producción, atención al cliente, generación de código ni entornos donde la salida del modelo tenga efectos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: no disponible en la información proporcionada
- Paper de Qwen2.5-Omni: no disponible en la información proporcionada
- Demos o blogs adicionales: no disponibles en la información proporcionada
