# liodon-ai/deepseek-coder-6.7b-base-ONNX

## Resumen
Este repositorio contiene una exportación a ONNX del modelo base deepseek-ai/deepseek-coder-6.7b-base, publicada por Liodon AI. El modelo original es un transformer decoder-only de 6,7B parámetros entrenado desde cero sobre 2 billones de tokens, con una composición de 87% código y 13% lenguaje natural en inglés y chino, y cobertura de 87 lenguajes de programación. La exportación está pensada para inferencia con ONNX Runtime y expone entradas y salidas de past key-values para decodificación autorregresiva con caché KV.

El export incluye pesos en FP32 (model.onnx, 26,96 GB) y FP16 (model_fp16.onnx, 14,56 GB), y se distribuye bajo licencia "other" heredada del modelo base. No es un modelo ajustado por instrucciones, por lo que su uso directo en chat o agentes requiere fine-tuning o envoltorios adicionales. La longitud de contexto no se especifica en la información proporcionada.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parámetros totales | 6,7B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP32 (model.onnx), FP16 (model_fp16.onnx); se menciona model_quantized.onnx sin detallar precisión |
| Idiomas soportados | Inglés y chino en lenguaje natural, y 87 lenguajes de programación según el modelo base; no declarado en la ficha del export |
| Licencia | other |
| Formato de pesos | ONNX (exportado con optimum, task text-generation-with-past) |
| Modelo base | deepseek-ai/deepseek-coder-6.7b-base |
| Tamaño del repositorio | 41,5 GB |

## Arquitectura y entrenamiento
El modelo base es un transformer decoder-only entrenado desde cero sobre 2 billones de tokens. El corpus combina aproximadamente 87% de código y 13% de lenguaje natural en inglés y chino, con cobertura de 87 lenguajes de programación. La documentación pública del modelo base menciona técnicas de selección de datos basadas en la dificultad de seguimiento de instrucciones con agrupamiento k-means y tokenización dinámica por paquetes para mejorar la eficiencia del entrenamiento. No se documenta en la información disponible una fase de RLHF o DPO; se trata de un modelo base sin ajuste por instrucciones.

La exportación ONNX se ha realizado con optimum.exporters.onnx.main_export, tarea text-generation-with-past, de modo que el grafo expone entradas y salidas de past key-values para decodificación autorregresiva con caché KV. Esto permite ejecutar el modelo con ONNX Runtime en CPU o GPU sin depender de PyTorch en tiempo de inferencia, a cambio de gestionar manualmente o mediante ORTModelForCausalLM la contabilidad de la caché.

## Capacidades
- Generación de código en 87 lenguajes de programación, según el modelo base.
- Generación de texto y código a partir de un contexto o prompt.
- Razonamiento sobre código, completado de fragmentos y continuación de secuencias.
- No soporta tool calling ni function calling nativo al ser un modelo base sin ajuste por instrucciones.
- No está diseñado para agentes multi-step ni para conversaciones multi-turno sin fine-tuning o envoltorios adicionales.
- Capacidades multilingües limitadas al inglés y chino en lenguaje natural, además de los lenguajes de programación cubiertos.
- Inferencia con caché KV y decodificación autorregresiva mediante ONNX Runtime.
- No incluye visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Autocompletado de código en IDE: el modelo puede predecir el siguiente fragmento a partir del contexto abierto. Al ser un modelo base, requiere integrarlo con un motor de prompts y filtros de validación.
- Generación de fragmentos en pipelines de CI/CD: se puede invocar para producir parches o bloques de código a partir de una especificación textual, siempre con revisión humana y tests automáticos.
- Fine-tuning para dominio específico: sirve como punto de partida para ajustar un modelo de código a un lenguaje, framework o convención interna mediante LoRA o fine-tuning completo.
- Traducción de código entre lenguajes: la cobertura de 87 lenguajes de programación permite plantear la conversión de fragmentos entre lenguajes, con validación posterior.
- Generación de tests unitarios: dado el código fuente de una función o clase, el modelo puede generar casos de prueba que después se ejecutan y revisan.
- Documentación automática de código: puede generar docstrings, comentarios y descripciones de funciones a partir del código de entrada.
- Explicación y revisión de código: el modelo puede continuar un prompt que solicite una explicación o una revisión, aunque al ser base no sigue instrucciones complejas de forma fiable.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada solo para pesos, sin caché KV ni activaciones: FP32 ~26,8 GB; FP16 ~13,4 GB; INT8 ~6,7 GB; INT4 ~3,5 GB. Las cuantizaciones INT8 e INT4 no están incluidas en el repositorio y son estimaciones teóricas.
- GPU recomendadas: FP32 en A100 40GB o H100 80GB; FP16 en RTX 4090/3090 24GB, A100 40GB o H100 80GB.
- GPUs consumer: FP16 puede caber en RTX 3090/4090 de 24GB con contexto moderado; cuantizaciones INT8/INT4, si se generan, podrían caber en RTX 3060 12GB o RTX 4060 Ti 16GB.
- Despliegue: ONNX Runtime con CPUExecutionProvider o CUDAExecutionProvider, Optimum ORTModelForCausalLM y transformers con ONNX Runtime. No hay soporte directo en vLLM, llama.cpp, Ollama o TGI sin conversión previa a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/deepseek-coder-6.7b-base-ONNX | 6,7B | No disponible | ONNX (FP32/FP16) | other | Hugging Face |
| deepseek-ai/deepseek-coder-6.7b-base | 6,7B | No disponible | No disponible | other | Hugging Face |
| liodon-ai/deepseek-coder-6.7b-instruct-ONNX | 6,7B | No disponible | ONNX | other | Hugging Face |

No se dispone de datos de benchmarks en la información proporcionada para comparar rendimiento con alternativas como CodeLlama o StarCoder2.

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones: no seguirá instrucciones complejas de forma fiable ni mantendrá un formato conversacional estable.
- Riesgo de alucinación: puede generar APIs inexistentes, firmas incorrectas o código vulnerable.
- Sesgos: entrenado con código público y texto en inglés y chino; puede reflejar sesgos presentes en esas fuentes.
- Licencia "other": es necesario revisar los términos del modelo base para uso comercial.
- Contexto no especificado: limita las tareas que requieran ventanas muy largas o comprensión de repositorios completos.
- Export ONNX: la model card menciona model_quantized.onnx, pero la tabla de archivos solo lista FP32 y FP16; puede haber inconsistencia.
- Idiomas no declarados en la ficha del export; el soporte real depende del modelo base.
- Rendimiento no verificado con benchmarks en la información disponible.

## Enlaces
- HuggingFace: https://huggingface.co/liodon-ai/deepseek-coder-6.7b-base-ONNX
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-base
- Perfil de Liodon AI: https://huggingface.co/liodon-ai
- Variante instruct ONNX: https://huggingface.co/liodon-ai/deepseek-coder-6.7b-instruct-ONNX
- DeepSeek Coder: https://deepseekcoder.github.io/
- Emergentmind: https://www.emergentmind.com/topics/deepseek-coder-6-7b-model
- Optimum: https://github.com/huggingface/optimum
