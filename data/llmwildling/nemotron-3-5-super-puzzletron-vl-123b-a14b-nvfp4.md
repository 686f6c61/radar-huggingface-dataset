# LLMWildling/Nemotron-3.5-Super-Puzzletron-VL-123B-A14B-NVFP4

## Resumen

Nemotron-3.5-Super-Puzzletron-VL-123B-A14B-NVFP4 es un ajuste fino del modelo NVIDIA Nemotron 3.5 Super VL 120B-A12B, desarrollado por el usuario LLMWildling sobre la base de NVIDIA. Se trata de un modelo de lenguaje y vision con arquitectura híbrida (tag `nemotron_h_omni`), entrenado mediante aprendizaje por refuerzo con GRPO (8 pasos) sobre una tarea de resolución de puzles de palabras con respuesta exacta, generados de forma procedural en un entorno NeMo Gym.

El modelo parte del checkpoint cuantizado en NVFP4 de NVIDIA y hereda su licencia OpenMDW-1.1. Su interés principal es que demuestra cómo un post-entrenamiento ligero con RL puede duplicar la precisión en una tarea concreta (del 43,8 % al 87,5 %) y mejorar también en puzles no vistos, manteniendo la compatibilidad con vLLM estándar sin plugins ni código personalizado.

El nombre comercial indica 123B-A14B, pero el recuento real de parámetros en los pesos safetensors es de 67.093.012.458 parámetros (aproximadamente 67,1 mil millones), probablemente por la cuantización NVFP4 y el empaquetado de pesos. El repositorio ocupa 76,5 GB y el modelo está pensado para despliegue en producción con vLLM 0.32 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron H híbrida (tag `nemotron_h_omni`), multimodal texto+visión |
| Parámetros totales | 67.093.012.458 (según safetensors; el nombre indica 123B) |
| Parámetros activos | 14B (según el nombre del modelo; no confirmado en la model card) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM con `--max-model-len 32768`) |
| Tipos de cuantización | NVFP4 (8-bit, `modelopt_mixed`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en NVIDIA Nemotron 3.5 Super VL 120B-A12B, un modelo multimodal de arquitectura híbrida Nemotron H que combina atención y capas de estado (SSM) según el tag `nemotron_h_omni`. El checkpoint heredado está cuantizado en NVFP4 con `modelopt_mixed`, un esquema de cuantización de precisión mixta de 8 bits diseñado por NVIDIA para inferencia eficiente en GPU Blackwell y posteriores.

El post-entrenamiento consiste en 8 pasos de GRPO (Group Relative Policy Optimization) sobre una tarea de puzles de palabras generados proceduralmente con respuestas exactas, ejecutada en un entorno NeMo Gym. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de SFT o DPO. La innovación destacable es la mejora sustancial en la tarea de entrenamiento y la generalización parcial a puzles no vistos, manteniendo el checkpoint como un NVFP4 estándar servible por vLLM sin modificaciones.

## Capacidades

- Generación de texto y razonamiento (tag `reasoning`).
- Resolución de puzles de palabras con respuesta exacta, tarea principal del ajuste.
- Capacidades multimodales de visión heredadas del modelo base Nemotron 3.5 Super VL.
- Soporte de tool calling y function calling (heredado del modelo base; la model card remite a las opciones del base para el parseo de razonamiento y tool calls).
- Soporte de agentes y razonamiento multi-paso (heredado del modelo base).
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- Compatibilidad directa con vLLM estándar (0.32 o superior) sin plugins.
- Modo de razonamiento (reasoning) configurable mediante las opciones del modelo base.

## Casos de uso

- Resolución automatizada de puzles y acertijos lingüísticos: el modelo está específicamente entrenado con GRPO para responder con exactitud a puzles de palabras, con una precisión del 87,5 % en la tarea de entrenamiento y del 64,6 % en puzles no vistos, lo que lo hace adecuado para sistemas de entretenimiento, generación de contenido interactivo o evaluación de capacidades de razonamiento.
- Evaluación de pipelines de RL: sirve como referencia reproducible de cómo 8 pasos de GRPO sobre un entorno NeMo Gym mejoran una tarea concreta, útil para investigadores que diseñan sus propios entornos de entrenamiento.
- Asistentes conversacionales en inglés con contexto largo: con 32.768 tokens de ventana, puede gestionar conversaciones multi-turno y documentos extensos en inglés.
- Procesamiento de documentos con componente visual: al heredar las capacidades de visión del modelo base, puede emplearse en tareas de extracción de información de imágenes o documentos escaneados, aunque no se detallan en la model card.
- Despliegue en producción con vLLM: el checkpoint NVFP4 estándar permite servirlo con `vllm serve` y tensor parallelism 2, sin necesidad de código personalizado, lo que facilita su integración en infraestructuras existentes.
- Investigación en cuantización NVFP4: útil para estudiar el comportamiento de modelos cuantizados en 8 bits tras un post-entrenamiento con RL, comparando la precisión frente al base en la misma build de vLLM.
- Generación de datos sintéticos de puzles: puede emplearse para producir y validar puzles de palabras con respuestas exactas en pipelines de aumento de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre puzles de palabras generados proceduralmente en NeMo Gym con respuestas exactas, servidos con la misma build de vLLM en NVFP4:

| Tarea | Base | Super-Puzzletron | Cambio |
|---|---|---|---|
| Tarea de entrenamiento | 43,8 % | 87,5 % | 2,0× |
| Puzles no vistos | 58,3 % | 64,6 % | +11 % relativo |
| No vistos, nivel 1 | 65,6 % | 78,1 % | +12,5 puntos |
| No vistos, nivel 2 | 57,8 % | 60,9 % | +3,1 puntos |
| No vistos, nivel 3 | 51,6 % | 54,7 % | +3,1 puntos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 76,5 GB en safetensors NVFP4, por lo que se necesita al menos ~80 GB de VRAM para cargar los pesos completos; con tensor parallelism 2 el requisito se reparte entre dos GPU.
- GPU recomendadas: el ejemplo oficial usa `--tensor-parallel-size 2`, lo que sugiere dos GPU de clase数据中心 (A100 80 GB, H100 80 GB o B200). NVFP4 está optimizado para arquitecturas Blackwell, aunque puede ejecutarse en otras GPU compatibles con vLLM.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en su configuración completa; requeriría cuantizaciones adicionales no publicadas.
- Opciones de despliegue: vLLM 0.32 o superior (probado sin plugins), con `--trust-remote-code` y `--max-model-len 32768`. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Super-Puzzletron-VL-123B-A14B-NVFP4 | 67,1B (safetensors) | 32.768 | OpenMDW-1.1 | Hugging Face (45 descargas) | Ajuste GRPO sobre puzles |
| NVIDIA Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (base) | ~120B (nombre) | no disponible | OpenMDW-1.1 | Hugging Face (NVIDIA) | Modelo base sin ajuste de puzles |
| Alternativas de razonamiento con RL | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría en benchmarks estándar.

## Limitaciones y advertencias

- El ajuste está especializado en puzles de palabras; su rendimiento en tareas generales puede degradarse respecto al modelo base, aunque no se aportan datos al respecto.
- Solo soporta inglés (`language: en`), lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas fuera de su dominio de entrenamiento.
- La licencia OpenMDW-1.1 impone condiciones específicas para uso comercial; es necesario revisar el texto completo en el enlace oficial antes de desplegarlo en producción.
- El recuento real de parámetros (67,1B) difiere del indicado en el nombre (123B-A14B), lo que puede generar confusión sobre los requisitos reales de hardware.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación adicionales.
- El modelo requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código personalizado del repositorio.
- El número de descargas (45) y likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/LLMWildling/Nemotron-3.5-Super-Puzzletron-VL-123B-A14B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Entorno NeMo Gym: https://github.com/NVIDIA-NeMo/Gym
