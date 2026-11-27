# openmuse/Llama-3.1-8B-RegMix-MT-r2006-seed123

## Resumen

Llama-3.1-8B-RegMix-MT-r2006-seed123 es un ajuste fino completo (full fine-tuning) del modelo base meta-llama/Llama-3.1-8B, publicado por el usuario openmuse en Hugging Face. El modelo se ha entrenado mediante la herramienta Llama-Factory sobre un conjunto de datos interno denominado `sample_r2006`, presumiblemente orientado a tareas multilingües (el sufijo "MT" en el nombre sugiere machine translation o multilingüismo, aunque no se documenta explícitamente). Se trata de un experimento de investigación más que de un modelo listo para producción: la model card está generada automáticamente por el Trainer y no incluye descripción, casos de uso ni evaluación cualitativa.

El modelo conserva la arquitectura y el tamaño del Llama-3.1-8B original: 8.030.261.248 parámetros en formato safetensors, transformer decoder-only denso con atención causal y ventana de contexto nativa de 128.000 tokens. El ajuste se realizó con 4 GPU, batch total de 512, learning rate 2e-05, scheduler lineal y 250 pasos de entrenamiento, lo que equivale a aproximadamente 1,28 épocas sobre el dataset (1.045.040.544 tokens de entrada vistos). La pérdida de validación se estabiliza en torno a 0,95-0,96.

Su relevancia es limitada pero concreta: sirve como referencia reproducible de un pipeline de fine-tuning completo con Llama-Factory sobre Llama-3.1-8B, con semilla fija (seed 123) y número de ejecución (r2006) en el nombre, lo que facilita la replicabilidad experimental. No obstante, la ausencia de benchmarks, de documentación del dataset y de evaluación de calidad hace que no deba emplearse en producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1), atención causal con RoPE |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del Llama-3.1-8B base; no se documenta modificación) |
| Tipos de cuantizacion | no disponible en el repo (pesos en safetensors sin cuantizar); compatible con cuantizaciones estándar de Llama 3.1 (FP8, INT8, INT4, GGUF) vía herramientas externas |
| Idiomas soportados | no disponible (la model card no declara idiomas; el sufijo "MT" sugiere multilingüismo pero no se confirma) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.1-8B, un transformer decoder-only denso de 8.000 millones de parámetros con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE) que permiten una ventana de contexto de 128.000 tokens. No se ha modificado la arquitectura: el checkpoint es un fine-tuning completo de todos los pesos (tag `full` en Llama-Factory), no un adaptador LoRA ni una destilación.

El entrenamiento se ejecutó con Llama-Factory sobre el dataset `sample_r2006` (no documentado públicamente en la model card), con 4 dispositivos GPU, batch de entrenamiento total de 512 (batch 4 × acumulación 32 × 4 GPUs), learning rate 2e-05, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 250 pasos. Se procesaron 1.045.040.544 tokens de entrada, lo que corresponde a unas 1,28 épocas sobre el dataset. La pérdida de entrenamiento descendió de 1,6994 (paso 50) a 1,6166 (paso 250), mientras que la pérdida de validación se mantuvo estable entre 0,9509 y 0,9602, sin señales claras de sobreajuste en el rango observado. No se documenta RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en formato chat, heredada del Llama-3.1-8B base y reforzada por el ajuste fino sobre datos conversacionales (tag `conversational`).
- Razonamiento general, matemáticas y código: capacidades del modelo base, potencialmente alteradas (mejoradas o degradadas) por el ajuste fino, sin evaluación publicada.
- Soporte de tool calling / function calling: heredado del Llama-3.1-8B base, que lo incluye de forma nativa; no se verifica en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: teóricamente posible por la ventana de 128.000 tokens del modelo base, sin validación específica en este ajuste.
- Capacidades multilingües: presumibles por el sufijo "MT" del nombre, pero no documentadas ni evaluadas.
- No se declaran capacidades especiales adicionales (modo thinking, visión, audio) en la información disponible.

## Casos de uso

- Reproducción de experimentos de fine-tuning: el nombre incluye la semilla (seed123) y el número de ejecución (r2006), lo que permite replicar el entrenamiento con Llama-Factory y comparar con otras ejecuciones del mismo pipeline.
- Investigación sobre ajuste fino completo frente a LoRA/PEFT: sirve como checkpoint de referencia de un `full fine-tuning` sobre Llama-3.1-8B para estudiar el impacto en la pérdida y en el comportamiento del modelo.
- Evaluación de dominios especializados: si `sample_r2006` corresponde a un dominio concreto (legal, médico, traducción), el modelo puede emplearse como punto de partida para medir la adaptación al dominio antes de invertir en un entrenamiento mayor.
- Generación de texto asistida en entornos controlados: al conservar la ventana de 128.000 tokens, puede procesar documentos largos en tareas de resumen o extracción, siempre que se valide la calidad del ajuste.
- Base para experimentos de traducción automática: el sufijo "MT" sugiere un ajuste orientado a traducción; podría emplearse para comparar con el Llama-3.1-8B base en pares de idiomas concretos, previa evaluación.
- Estudio de estabilidad del entrenamiento: la curva de pérdida (entrenamiento descendente, validación plana) es útil para analizar dinámicas de convergencia con learning rate 2e-05 y 250 pasos.
- Punto de partida para ajustes posteriores: al ser un checkpoint completo, puede servir como inicialización para un segundo fine-tuning o para destilación.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre `sample_8B_r2006_seed123` pero la lista de resultados está vacía. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo de evaluación es la pérdida de validación:

| Metrica | Valor |
|---|---|
| Validation loss (paso 50) | 0,9550 |
| Validation loss (paso 100) | 0,9602 |
| Validation loss (paso 150) | 0,9509 |
| Validation loss (paso 200) | 0,9585 |
| Validation loss (paso 250) | 0,9557 |
| Training loss final (paso 250) | 1,6166 |
| Tokens de entrada vistos | 1.045.040.544 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~16 GB de pesos más overhead de activaciones y KV cache; en la práctica, 18-20 GB para contextos moderados.
- VRAM estimada en cuantización INT8: ~8-9 GB; en INT4/GGUF Q4: ~5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia en FP16 con contexto largo; L40S o RTX 6000 Ada para inferencia FP16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado y en RTX 3090/4080 (16 GB) solo con cuantización INT8/INT4.
- Opciones de despliegue: vLLM, TGI (text-generation-inference, tag `endpoints_compatible`), llama.cpp, Ollama (tras conversión a GGUF), Transformers con `accelerate`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|
| openmuse/Llama-3.1-8B-RegMix-MT-r2006-seed123 | 8,03 B | 128.000 (heredado) | llama3.1 | Solo loss de validacion | Hugging Face (7 descargas) |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 | llama3.1 | Amplia (MMLU, HumanEval, etc.) | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | llama3.1 | Amplia, con evaluacion de instrucciones | Hugging Face, produccion |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Amplia | Hugging Face, uso comercial permisivo |

La comparativa directa con el Llama-3.1-8B base es la más relevante: este checkpoint comparte arquitectura, tamaño y licencia, pero carece de evaluación pública y de documentación del dataset, por lo que no puede recomendarse sobre el base sin validación propia. Mistral-7B-Instruct-v0.3 se incluye como alternativa de tamaño similar con licencia Apache 2.0 más permisiva para uso comercial.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: `sample_r2006` no se describe en la model card, por lo que se desconocen sesgos, composición y calidad de los datos.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones humanas; el único dato es la pérdida de validación, insuficiente para juzgar calidad.
- Riesgo de alucinación: heredado del Llama-3.1-8B base y potencialmente alterado por el ajuste fino; no evaluado.
- Idiomas no declarados: aunque el sufijo "MT" sugiere multilingüismo, no se confirma ni se detalla qué idiomas cubre.
- Licencia llama3.1: impone restricciones de uso comercial (política de uso aceptable de Meta, obligación de atribución "Built with Llama" y límite de 700 millones de usuarios mensuales para licenciatarios). Revisar los términos antes de cualquier despliegue comercial.
- Modelo de investigación: con 7 descargas y 0 likes, no hay evidencia de uso en producción ni de validación por la comunidad.
- Sin garantías de calidad conversacional: el ajuste se realizó sobre un dataset desconocido y con solo 250 pasos; el comportamiento en diálogo multi-turno no está verificado.
- Contexto: aunque el modelo base soporta 128.000 tokens, no se documenta si el ajuste fino preserva esa capacidad; el dataset de entrenamiento podría haber sido truncado a longitudes menores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/Llama-3.1-8B-RegMix-MT-r2006-seed123
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Llama-Factory (herramienta de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Documentación de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
