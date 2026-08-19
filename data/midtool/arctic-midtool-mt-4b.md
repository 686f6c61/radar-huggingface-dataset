# MidTool/Arctic-MidTool-MT-4B

## Resumen

Arctic-MidTool-MT-4B es un modelo de lenguaje de 4.022 millones de parámetros desarrollado por MidTool, basado en Qwen/Qwen3-4B-Base. El modelo está diseñado específicamente para casos de uso agénticos, con soporte de tool calling y function calling, y ha sido sometido a un proceso de mid-training con el dataset propietario MidTool/MidTool-Mix. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su tamaño compacto (4B parámetros) combinado con capacidades de agente y uso de herramientas, un nicho en el que normalmente se requieren modelos más grandes. Al estar basado en Qwen3-4B-Base, hereda la arquitectura transformer de Qwen y su capacidad multilingüe, aunque los idiomas exactos soportados no se han especificado en la información disponible. El acceso al modelo es restringido (gated) y requiere aceptar condiciones en HuggingFace, a pesar de su licencia abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B-Base, un modelo de arquitectura transformer densa con atención de causalidad estándar. No se ha detallado en la información disponible si Qwen3-4B-Base incorpora innovaciones específicas de la familia Qwen3, como atención con RoPE o mecanismos de sliding window, pero es razonable asumir que hereda las características de su base.

El entrenamiento consiste en una fase de mid-training (entrenamiento intermedio) sobre el dataset `MidTool/MidTool-Mix`, orientada a mejorar las capacidades de uso de herramientas, function calling y comportamiento conversacional. No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF, DPO u otras alineaciones. Existe un checkpoint SFT adicional (`Arctic-MidTool-MT-4B-finetoolv2-sft779`) que parece ser el resultado de un ajuste fino supervisado posterior.

## Capacidades

- Generación de texto y conversación multi-turno, optimizado para interacciones agénticas.
- Soporte de tool calling y function calling, habilitando la integración con APIs y herramientas externas.
- Capacidad de razonamiento multi-paso, esencial para agentes autónomos.
- Capacidades multilingües heredadas de Qwen3-4B-Base, aunque los idiomas exactos no están documentados.
- Enfoque específico en uso de herramientas (tool-use), lo que lo diferencia de modelos genéricos de chat.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con clientes, derivando consultas a sistemas externos mediante tool calling, como consultas a bases de datos de pedidos o integraciones con CRMs.
- **Asistentes de desarrollo de software**: integrado en IDEs o pipelines de CI/CD, el modelo puede generar código y llamar a herramientas de compilación, testeo o despliegue automáticamente.
- **Agentes de automatización de tareas**: en entornos de RPA, el modelo puede interpretar instrucciones y ejecutar acciones mediante funciones definidas, como envío de correos, actualización de registros o consulta de APIs.
- **Chatbots de soporte técnico**: con su capacidad de function calling, puede consultar bases de conocimiento externas, tickets de soporte o sistemas de monitorización para dar respuestas precisas.
- **Generación de informes y análisis**: combinado con herramientas de análisis de datos, el modelo puede generar resúmenes y reportes a partir de datos estructurados mediante llamadas a funciones.
- **Orquestación de microservicios**: en arquitecturas serverless, el modelo puede actuar como orquestador de llamadas a múltiples microservicios para resolver tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento en MMLU, HumanEval, GSM8K ni otros estándares, ni comparativas con modelos similares.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4B parámetros y pesos en fp16, se requieren aproximadamente 8 GB de VRAM para inferencia en precisión completa. Con cuantización a 4-bit o 8-bit, el requisito se reduce a 3-5 GB.
- **GPU recomendadas**: una NVIDIA RTX 3060 12 GB o superior es suficiente para inferencia con cuantización; una RTX 4090 o A100 permite inferencia en fp16 sin cuantizar.
- **Compatibilidad con GPU de consumo**: sí, es adecuado para GPUs de consumo de 8 GB o más, como RTX 4060 Ti, RTX 4070, RTX 4080, etc.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y otros frameworks que soporten el formato safetensors y la arquitectura Qwen3.
- **Latencia y throughput**: no se han publicado datos específicos, pero para un modelo de 4B se esperan latencias de decenas de milisegundos por token en hardware moderno y throughput de cientos de tokens por segundo con vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Arctic-MidTool-MT-4B | 4B | no disponible | Apache 2.0 | Gated en HF |
| Qwen3-4B-Base | 4B | no disponible | Apache 2.0 | Abierto |
| Llama-3.2-3B | 3B | 128K (según documentación) | Llama 3.2 License | Abierto |
| Phi-3-mini-4k | 3.8B | 4K | MIT | Abierto |

No se han publicado benchmarks comparativos con estos modelos, por lo que no es posible evaluar el rendimiento relativo. La principal diferencia de Arctic-MidTool-MT-4B es su especialización en tool-use y agentes, mientras que los alternativos son modelos generalistas.

## Limitaciones y advertencias

- **Acceso restringido**: aunque la licencia es Apache 2.0, el modelo requiere aceptar condiciones en HuggingFace, lo que puede limitar la automatización de despliegues.
- **Sesgos desconocidos**: no se han publicado análisis de sesgos o evaluaciones de seguridad; al ser un modelo derivado de Qwen3-4B-Base, puede heredar sesgos del entrenamiento original.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos de tool calling si las herramientas devuelven errores o datos ambiguos.
- **Limitaciones de contexto**: no se ha especificado la longitud de contexto soportada, lo que es crítico para casos de uso agénticos que requieren ventanas largas.
- **Idiomas no documentados**: no se ha confirmado el conjunto de idiomas soportados, lo que puede ser un problema para despliegues multilingües.
- **Estado del proyecto**: el modelo tiene 0 descargas y 0 likes en HuggingFace, y el autor no es una organización conocida; el proyecto puede estar en fase temprana y sin mantenimiento garantizado.

## Enlaces

- [HuggingFace: MidTool/Arctic-MidTool-MT-4B](https://huggingface.co/MidTool/Arctic-MidTool-MT-4B)
- [HuggingFace mirror: fan-shu/Arctic-MidTool-MT-4B](https://huggingface.co/fan-shu/Arctic-MidTool-MT-4B)
- [HuggingFace: fan-shu/Arctic-MidTool-MT-4B-finetoolv2-sft779 (checkpoint SFT)](https://huggingface.co/fan-shu/Arctic-MidTool-MT-4B-finetoolv2-sft779)
- [README del checkpoint SFT](https://d6108366.hf-mirror.com/fan-shu/Arctic-MidTool-MT-4B-finetoolv2-sft779/blob/main/README.md?code=true)
