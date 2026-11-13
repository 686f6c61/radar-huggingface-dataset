# HaolinRPI/Qwen2.5-3B-Instruct-MedMCQA-SFT

## Resumen

Qwen2.5-3B-Instruct-MedMCQA-SFT es un ajuste fino supervisado (SFT) de parámetros completos del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario HaolinRPI. El objetivo del entrenamiento es adaptar el modelo base a la resolución de preguntas médicas de opción múltiple del conjunto MedMCQA, generando una traza de razonamiento seguida de la respuesta final en el formato `<answer>X</answer>`. Se trata, por tanto, de un modelo especializado y de nicho, no de un modelo generalista.

El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2.5, con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones) y una ventana de contexto nativa de 32.768 tokens en el modelo base, aunque el entrenamiento se realizó con un corte de 16.384 tokens. El ajuste se llevó a cabo con LlamaFactory sobre 20.000 ejemplos de trazas de MedMCQA durante 3 épocas, con un total de 237 pasos de optimizador.

Su relevancia es limitada y experimental: el repositorio no registra descargas ni interacciones, la model card es mínima y no se han publicado resultados de benchmarks estándar (MMLU, MedQA, etc.). Resulta útil como referencia para quien quiera reproducir o comparar un SFT médico sobre Qwen2.5-3B, pero no debe considerarse un modelo listo para producción clínica sin una evaluación adicional exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenamiento con cutoff de 16.384 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors, compatibles con cuantización estándar GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5, multilingüe, sin detalle en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso con atención causal estándar y mecanismos de RoPE para codificación posicional. El ajuste fino es de parámetros completos (full-parameter SFT), no LoRA ni QLoRA, realizado con LlamaFactory sobre 4 GPUs con ZeRO-1, precisión bf16 y un cutoff de 16.384 tokens. La configuración de entrenamiento incluye batch por dispositivo de 1, acumulación de gradiente de 64, tasa de aprendizaje de 1e-5 con schedule coseno y warmup ratio de 0, durante 3 épocas (237 pasos de optimizador).

El dataset de entrenamiento consta de 20.000 ejemplos de trazas de razonamiento de MedMCQA, con una partición de evaluación de 200 ejemplos. El formato objetivo es una traza de razonamiento seguida de la etiqueta `<answer>X</answer>`, lo que induce un comportamiento de razonamiento explícito antes de responder. La revisión principal (`main`) corresponde a la época 3, checkpoint-237, con una eval_loss de 0,8700. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales más allá del SFT.

## Capacidades

- Generación de texto y razonamiento paso a paso en el dominio médico, con traza de razonamiento explícita antes de la respuesta.
- Resolución de preguntas de opción múltiple con formato de salida estructurado `<answer>X</answer>`.
- Razonamiento de opción múltiple sobre contenido médico (MedMCQA: medicina general, farmacología, anatomía, patología, etc., según la cobertura del dataset).
- Herencia de las capacidades del modelo base Qwen2.5-3B-Instruct: generación de texto general, código y matemáticas básicas, aunque el SFT puede haber degradado parcialmente estas habilidades fuera del dominio médico.
- Soporte de tool calling y function calling heredado del modelo base (no validado tras el ajuste).
- Capacidades multilingües heredadas del modelo base (no documentadas ni evaluadas en la model card).
- No se documenta soporte de visión, audio ni modo thinking nativo más allá de la traza de razonamiento inducida por el formato de entrenamiento.

## Casos de uso

- Evaluación comparativa de SFT médico: sirve como punto de referencia reproducible para medir el impacto de un ajuste fino completo sobre Qwen2.5-3B en MedMCQA, comparando checkpoints de las épocas 1, 2 y 3.
- Investigación en razonamiento médico: permite estudiar cómo un formato de traza de razonamiento más etiqueta `<answer>` afecta a la precisión en preguntas de opción múltiple, con un dataset y una configuración de entrenamiento documentados.
- Generación de datos sintéticos de razonamiento médico: el modelo puede producir trazas de razonamiento etiquetadas que sirvan como material de destilación o aumento de datos para otros modelos.
- Prototipado de asistentes de formación médica: en entornos controlados de estudio (no clínicos), puede generar explicaciones razonadas sobre preguntas tipo test de medicina.
- Benchmarking de cuantización: al ser un modelo de ~3 B, permite evaluar la degradación de precisión en tareas médicas al cuantizar a 8, 4 o 2 bits con llama.cpp o vLLM.
- Filtrado y clasificación de preguntas médicas: puede usarse para etiquetar o resolver preguntas de opción múltiple en pipelines de curación de datasets médicos.
- Base para ajustes posteriores: punto de partida para SFT adicional o DPO en subdominios médicos concretos, gracias a su licencia Apache 2.0 y su tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de evaluación en el checkpoint final:

| Métrica | Valor |
|---|---|
| eval_loss (epoch 3, checkpoint-237) | 0,8700 |
| Ejemplos de evaluación | 200 |
| Pasos de optimizador | 237 |
| Épocas | 3 |

No se proporcionan cifras de precisión en MedMCQA, MMLU, MedQA, HumanEval ni GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 8-10 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: unos 3,5-4 GB; en 4 bits: unos 2-2,5 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a gran escala; RTX 4090, RTX 3090 o L40S para inferencia en bf16; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes, especialmente con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (tras conversión a GGUF), Transformers con `AutoModelForCausalLM`, y LlamaFactory para evaluación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-MedMCQA-SFT | ~3,09 B | 32.768 (base); 16.384 en entrenamiento | SFT médico (MedMCQA) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | 32.768 | Generalista, instrucciones | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 | Generalista, instrucciones | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos médicos de ~3 B (p. ej. Meditron, BioMistral) | variable | variable | Dominio médico | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas de precisión en MedMCQA ni en otros benchmarks para este modelo, por lo que no es posible establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero interacciones: no ha sido validado por la comunidad ni auditado de forma independiente.
- Ausencia total de benchmarks: solo se reporta eval_loss (0,8700), que no equivale a precisión ni a calidad clínica.
- Riesgo elevado de alucinación en contenido médico: el SFT sobre trazas de razonamiento puede producir explicaciones plausibles pero incorrectas.
- No apto para uso clínico, diagnóstico ni consejo médico sin supervisión profesional y validación regulatoria.
- Posible degradación de capacidades generales (código, matemáticas, instrucciones generales) tras el ajuste fino completo sobre un dataset médico.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés (MedMCQA), lo que puede reducir el rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso comercial en ámbito sanitario requiere evaluaciones adicionales.
- La model card es mínima y no documenta sesgos, composición detallada del dataset ni procesos de filtrado.
- El formato de salida esperado (`<answer>X</answer>`) debe respetarse en el prompt para obtener respuestas parseables.

## Enlaces

- Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-3B-Instruct-MedMCQA-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- LlamaFactory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
