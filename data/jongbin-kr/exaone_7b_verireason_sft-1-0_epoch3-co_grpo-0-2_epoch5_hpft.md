# Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-0.2_epoch5_hpft

## Resumen

El modelo `exaone_7b_verireason_sft-1.0_epoch3-co_grpo-0.2_epoch5_hpft` es un ajuste fino (fine-tuning) del modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por el usuario `Jongbin-kr`. Se ha entrenado utilizando la librería TRL de HuggingFace, combinando una fase de supervisión (SFT) y una fase de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), método introducido en el paper de DeepSeekMath. El nombre del modelo sugiere un entrenamiento en dos etapas: primero un SFT con 3 épocas y luego un GRPO con 5 épocas, aunque estos detalles no están confirmados en la documentación oficial.

Este modelo está orientado a mejorar las capacidades de razonamiento y generación de texto del modelo base, probablemente enfocado en tareas de instrucción y conversación. Sin embargo, la información pública disponible es muy limitada: no se especifican arquitectura, parámetros, contexto, licencia ni idiomas soportados. El repositorio tiene un tamaño de 0,7 GB, lo que sugiere un modelo de aproximadamente 7.000 millones de parámetros en precisión FP16/BF16, pero este dato no está confirmado. La relevancia actual radica en que explora el uso de GRPO sobre un modelo ya instructivo, una técnica emergente para mejorar el razonamiento sin necesidad de datos etiquetados masivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (se infiere ~7.8B por el modelo base, sin confirmar) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct |

## Arquitectura y entrenamiento

No se proporcionan detalles técnicos sobre la arquitectura interna del modelo. Al ser un fine-tuning de `EXAONE-3.5-7.8B-Instruct`, se espera que herede la arquitectura de ese modelo base (un transformer decoder-only con atención causal), pero no hay confirmación en la documentación. El entrenamiento se realizó con la librería TRL (versión 1.6.0) y el método GRPO, tal como se describe en el paper de DeepSeekMath. El nombre del modelo sugiere una fase inicial de SFT (con un ratio de 1.0 y 3 épocas) seguida de una fase de GRPO (con ratio 0.2 y 5 épocas), aunque estos hiperparámetros no están documentados explícitamente. No se indica la composición del dataset de entrenamiento ni si se usaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto instructivo: al ser un fine-tuning de un modelo instruct, se espera que pueda seguir instrucciones y generar respuestas coherentes en formato conversacional.
- Razonamiento: el uso de GRPO sugiere un enfoque en mejorar el razonamiento matemático y lógico, aunque no hay benchmarks que lo confirmen.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible (el modelo base EXAONE soporta coreano e inglés, pero no se especifica para este fine-tuning).
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio.

## Casos de uso

- Asistente conversacional para tareas de instrucción general: el modelo puede utilizarse en chatbots o asistentes virtuales donde se requiera seguir instrucciones y mantener diálogos multi-turno, aunque no se especifica la longitud de contexto.
- Generación de texto creativo: como redacción de artículos, cuentos o respuestas a preguntas abiertas, aprovechando su naturaleza instructiva.
- Investigación en aprendizaje por refuerzo: sirve como ejemplo de aplicación de GRPO sobre un modelo base instructivo, útil para estudiar los efectos de esta técnica en el razonamiento.
- Fine-tuning adicional: puede emplearse como punto de partida para tareas específicas mediante ajuste fino supervisado, gracias a su formato safetensors compatible con transformers.
- Evaluación de técnicas de alineación: permite comparar el rendimiento de GRPO frente a otros métodos como DPO o PPO en modelos de tamaño medio.
- Prototipado rápido en entornos académicos: al ser un modelo pequeño (0,7 GB), es factible desplegarlo en hardware modesto para experimentos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (el tamaño del repo de 0,7 GB sugiere un modelo de ~7B, que en FP16 requeriría aproximadamente 14 GB de VRAM, pero esto no está confirmado).
- GPU recomendadas: no disponible (se espera que sea compatible con GPUs de consumo como RTX 3090/4090 con al menos 16 GB, pero sin confirmación).
- Opciones de despliegue: al usar transformers, puede ejecutarse con bibliotecas como vLLM, TGI, o llama.cpp si se convierte a GGUF, pero no se documentan opciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información facilitada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: no se ha evaluado; se recomienda verificar las respuestas en aplicaciones críticas.
- Limitaciones de contexto o idioma: desconocidas; se recomienda consultar la documentación del modelo base EXAONE-3.5-7.8B-Instruct.
- Restricciones de licencia: la licencia no está especificada, lo que impide determinar si es apto para uso comercial.
- Caveat para produccion: la falta de benchmarks y especificaciones técnicas hace que no sea recomendable para entornos productivos sin una evaluación adicional.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-0.2_epoch5_hpft)
- [Paper DeepSeekMath (GRPO)](https://huggingface.co/papers/2402.03300)
- [Repositorio TRL](https://github.com/huggingface/trl)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/snu-skiml/verireason-grpo/runs/s9b2yt5d)
