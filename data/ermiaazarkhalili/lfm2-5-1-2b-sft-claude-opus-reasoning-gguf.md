# ermiaazarkhalili/LFM2.5-1.2B-SFT-Claude-Opus-Reasoning-GGUF

## Resumen

LFM2.5-1.2B-SFT-Claude-Opus-Reasoning-GGUF es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM2.5-1.2B-Instruct, empaquetado en formato GGUF para su uso con llama.cpp y Ollama. El modelo ha sido desarrollado por el usuario ermiaazarkhalili y consiste en un LoRA fusionado en los pesos base, entrenado sobre un dataset privado de destilación de razonamiento al estilo Claude Opus. El resultado es un modelo de 1.170.340.608 parámetros (aproximadamente 1,2 mil millones) orientado a generación de texto con capacidades de razonamiento.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado de un modelo base de LiquidAI, sin evaluación pública de benchmarks y con cero descargas en el momento de la consulta. No obstante, su tamaño compacto y las cuantizaciones disponibles (desde 483 MB en q2_k hasta 1,25 GB en q8_0) lo hacen desplegable en hardware de consumo, lo que puede resultar útil para experimentación local con modelos de razonamiento pequeños.

El modelo hereda la arquitectura y las capacidades del base LFM2.5-1.2B-Instruct, pero el ajuste fino se ha realizado exclusivamente sobre un dataset de instrucciones y razonamiento, por lo que su comportamiento fuera de esa distribución no está validado. La licencia es "other", heredada del modelo base, lo que introduce incertidumbre sobre el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp); pesos completos en el repo del adaptador fusionado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA supervisado (SFT) del base LiquidAI/LFM2.5-1.2B-Instruct, realizado con las librerías PEFT y TRL de Hugging Face. Los adaptadores LoRA se fusionaron en los pesos base, por lo que el checkpoint resultante no puede separarse del ajuste fino. El entrenamiento se ejecutó mediante el notebook `notebooks/sft_distillation_lfm2.5.ipynb`, lanzado de forma no interactiva con papermill sobre una partición SLURM con GPUs H100. El dataset de entrenamiento es `ermiaazarkhalili/claude-reasoning-distillation`, de acceso privado, y no se especifica su composición, número de tokens ni proceso de filtrado.

No se detalla la arquitectura interna del modelo base en la información disponible (si es transformer denso, híbrido o SSM). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card indica que la configuración y resultados del entrenamiento están en la card del repositorio del adaptador fusionado, pero no se proporcionan esos datos en esta ficha. No se reporta uso de RLHF ni DPO; el método es exclusivamente SFT.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base LFM2.5-1.2B-Instruct.
- Razonamiento de tipo "chain-of-thought" o estilo Claude Opus, presumiblemente inducido por el dataset de destilación, aunque no se documenta el formato exacto de razonamiento.
- Instrucciones de seguimiento (instruction following) adquiridas mediante SFT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del razonamiento interno.
- Capacidades multilingües: no disponibles en la información.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Experimentación local con razonamiento en hardware de consumo: gracias a sus cuantizaciones de 483 MB a 1,25 GB, el modelo puede ejecutarse en portátiles con GPU integrada o CPU mediante llama.cpp u Ollama, permitiendo probar técnicas de destilación de razonamiento sin infraestructura dedicada.
- Prototipado de asistentes de razonamiento paso a paso: el ajuste sobre un dataset de razonamiento al estilo Claude Opus sugiere que el modelo puede generar cadenas de razonamiento antes de responder, útil para validar pipelines de "reasoning" en entornos de desarrollo.
- Evaluación de técnicas de destilación: investigadores pueden usar este checkpoint como referencia para comparar la calidad de razonamiento destilado de un modelo grande (Claude Opus) a uno pequeño (1,2B), aunque sin benchmarks públicos la comparación debe hacerse con sus propias métricas.
- Generación de texto en aplicaciones de baja latencia: el tamaño reducido permite inferencia rápida en CPU o GPU modesta, adecuado para tareas de generación de texto corto donde no se requiere alta precisión.
- Educación y demos de fine-tuning: el repositorio incluye el notebook de entrenamiento, por lo que sirve como ejemplo reproducible de SFT con LoRA + TRL sobre un modelo base de LiquidAI.
- Pruebas de integración con llama.cpp y Ollama: los archivos GGUF y las instrucciones de uso permiten validar flujos de despliegue local y comparar cuantizaciones (q2_k frente a q8_0) en términos de calidad y velocidad.
- No se recomienda para producción sin evaluación previa, dado que no hay benchmarks ni validación fuera del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación de benchmarks sobre este checkpoint y que los únicos números reportados son observaciones de pérdida de entrenamiento (training loss), que no se detallan en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF):
  - Q2_K: ~483 MB de pesos, más overhead de contexto; cabe en GPUs con 2 GB o en CPU.
  - Q4_K_M: ~731 MB de pesos; cabe en GPUs de 4 GB o en CPU con 8 GB de RAM.
  - Q8_0: ~1,25 GB de pesos; cabe en GPUs de 6 GB o en CPU con 16 GB de RAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en Apple Silicon y en CPU.
- Cabe en GPU consumer: sí, en todas las cuantizaciones, incluidas GPUs de gama baja.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (mediante Modelfile), y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles. Dado el tamaño (1,2B parámetros), se espera una latencia baja en hardware consumer, pero no se proporcionan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar el rendimiento. A continuación se comparan características estructurales con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-SFT-Claude-Opus-Reasoning-GGUF | 1,17B | no disponible | other | GGUF | Ajuste SFT sobre LFM2.5-1.2B-Instruct; sin benchmarks |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | ~1,2B | no disponible | no disponible | safetensors | Modelo base original de LiquidAI |
| ermiaazarkhalili/LFM2.5-1.2B-SFT-Claude-Opus-Reasoning | 1,17B | no disponible | other | safetensors | Pesos completos del mismo ajuste, sin cuantizar |
| Otros modelos ~1B (p. ej., Llama 3.2 1B, Qwen2.5 1.5B) | ~1-1,5B | 128K (Llama 3.2) / 32K (Qwen2.5) | licencias permisivas | safetensors, GGUF | Alternativas consolidadas con benchmarks públicos |

La comparación de rendimiento con Llama 3.2 1B o Qwen2.5 1.5B no es posible sin evaluaciones, pero estos últimos cuentan con benchmarks publicados y licencias más claras, lo que los hace preferibles para producción.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación de benchmarks sobre este checkpoint; solo se reportan observaciones de pérdida de entrenamiento.
- Hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base LFM2.5-1.2B-Instruct.
- El ajuste fino se realizó sobre un único dataset de instrucciones (privado), por lo que el comportamiento fuera de esa distribución no está probado.
- Los adaptadores LoRA se fusionaron en los pesos base, por lo que el modelo no puede separarse del ajuste fino.
- Licencia "other" heredada del base: no se especifican términos de uso comercial, lo que introduce riesgo legal para producción.
- Riesgo de alucinación inherente a modelos de 1,2B parámetros, agravado por la falta de evaluación.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide planificar su uso en tareas multilingües o de contexto largo.
- El dataset de entrenamiento es privado, lo que impide auditar la procedencia de los datos y posibles sesgos.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ermiaazarkhalili/LFM2.5-1.2B-SFT-Claude-Opus-Reasoning-GGUF
- Repositorio del adaptador fusionado (pesos completos): https://huggingface.co/ermiaazarkhalili/LFM2.5-1.2B-SFT-Claude-Opus-Reasoning
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/ermiaazarkhalili/claude-reasoning-distillation
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
