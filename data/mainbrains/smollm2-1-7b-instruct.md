# mainbrains/SmolLM2-1.7B-Instruct

## Resumen

El modelo `mainbrains/SmolLM2-1.7B-Instruct` es un fork mantenido por el usuario @mainbrains del modelo original `HuggingFaceTB/SmolLM2-1.7B-Instruct`, una familia de modelos de lenguaje compactos desarrollada por Hugging Face. Este fork se centra en la evaluación y despliegue del modelo en entornos de hardware extremadamente limitado, como la Raspberry Pi 5, con el objetivo de lograr inferencia de menos de 1 vatio para agentes de automatización siempre activos. Incluye cuantizaciones GGUF y benchmarks específicos para este tipo de dispositivos.

El modelo base, SmolLM2-1.7B, es un transformer decoder-only de 1.700 millones de parámetros entrenado sobre 11 billones de tokens, con una combinación de datasets como FineWeb-Edu, DCLM, The Stack y conjuntos propios de matemáticas y código. La versión instruct se obtuvo mediante fine-tuning supervisado (SFT) y optimización por preferencias directas (DPO) con UltraFeedback, lo que le permite seguir instrucciones, reescribir texto, resumir y realizar function calling. Su tamaño reducido lo hace adecuado para ejecución en dispositivos con recursos limitados, manteniendo un rendimiento competitivo frente a modelos de tamaño similar.

La relevancia de este fork radica en su enfoque práctico para el despliegue en edge computing, proporcionando cuantizaciones GGUF listas para usar y datos de rendimiento en hardware de bajo consumo, lo que facilita la adopción de modelos de IA generativa en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama) |
| Parametros totales | 1.711.376.384 (1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal estándar, similar a la familia Llama, con capas de atención de múltiples cabezas y normalización RMSNorm. No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal; es un transformer denso clásico optimizado para eficiencia en dispositivos pequeños.

El entrenamiento del modelo base se realizó sobre 11 billones de tokens, combinando datasets públicos y propios. Para la versión instruct se aplicó un proceso de dos etapas: primero un fine-tuning supervisado (SFT) con datasets como SmolTalk y Synth-APIGen-v0.1 (este último para function calling), y posteriormente una optimización por preferencias directas (DPO) utilizando el dataset UltraFeedback binarizado. Este enfoque mejora la capacidad de seguir instrucciones, el razonamiento y las habilidades matemáticas en comparación con su predecesor SmolLM1-1.7B.

No se mencionan innovaciones técnicas específicas en la arquitectura, pero el énfasis está en la compacidad y la eficiencia para ejecución en CPU y dispositivos de bajo consumo.

## Capacidades

- Generación de texto conversacional y completado de texto.
- Seguimiento de instrucciones complejas, incluyendo tareas de razonamiento y matemáticas.
- Reescritura de texto y resumen de contenido.
- Function calling / tool calling, gracias al entrenamiento con Synth-APIGen-v0.1.
- Soporte para agentes y razonamiento multi-paso, aunque limitado por el tamaño del modelo.
- Capacidades multilingües: solo inglés confirmado.
- Compatible con Transformers.js para ejecución en navegador o Node.js.
- Cuantizaciones GGUF para despliegue en CPU y dispositivos edge.

## Casos de uso

- **Asistentes de voz en dispositivos edge**: el modelo puede ejecutarse en una Raspberry Pi 5 con cuantización Q4_K_M a ~15 tokens por segundo y 1,2 GB de RAM, permitiendo asistentes de voz locales sin conexión a la nube.
- **Automatización del hogar**: como agente de control de dispositivos IoT, interpretando comandos de voz o texto y ejecutando acciones mediante function calling (encender luces, ajustar termostatos, etc.).
- **Chatbots de soporte técnico en entornos con recursos limitados**: desplegado en servidores de bajo coste o en routers, puede gestionar consultas frecuentes de usuarios sin depender de APIs externas.
- **Generación de código en entornos de desarrollo embebido**: gracias a su capacidad de function calling, puede integrarse en pipelines de CI/CD para generar fragmentos de código o documentación en máquinas sin GPU.
- **Resumen y reescritura de documentos en aplicaciones móviles**: al ser ligero, puede ejecutarse en smartphones de gama media para resumir artículos o reescribir correos electrónicos de forma local.
- **Prototipado rápido de agentes conversacionales**: su licencia Apache 2.0 y su compatibilidad con Transformers.js permiten crear demos interactivas en el navegador sin infraestructura de servidor.

## Benchmarks y rendimiento

Los resultados de evaluación del modelo instruct se presentan en la siguiente tabla, comparados con otros modelos de tamaño similar. Los datos provienen de la model card original de SmolLM2.

| Metrica | SmolLM2-1.7B-Instruct | Llama-1B-Instruct | Qwen2.5-1.5B-Instruct | SmolLM1-1.7B-Instruct |
|:---------------------------|:---------------------:|:-----------------:|:----------------------:|:----------------------:|
| IFEval (promedio prompt/inst) | **56,7** | 53,5 | 47,4 | 23,1 |
| MT-Bench | 6,13 | 5,48 | **6,52** | 4,33 |
| OpenRewrite-Eval (micro_avg RougeL) | 44,9 | 39,2 | **46,9** | NaN |
| HellaSwag | **66,1** | 56,1 | 60,9 | 55,5 |
| ARC (promedio) | **51,7** | 41,6 | 46,2 | 43,7 |

Además, el fork reporta que la cuantización Q4_K_M alcanza ~15 tokens por segundo en una Raspberry Pi 5 con 1,2 GB de RAM, lo que demuestra su viabilidad para inferencia en tiempo real en hardware de bajo consumo.

## Requisitos de hardware

- **Inferencia en CPU**: la cuantización Q4_K_M requiere aproximadamente 1,2 GB de RAM y funciona en una Raspberry Pi 5 a ~15 tok/s, según la model card del fork.
- **GPU**: no se proporcionan datos específicos de VRAM, pero al ser un modelo de 1,7B parámetros, en fp16 ocuparía ~3,4 GB, por lo que cabría en GPUs consumer con 4 GB o más (por ejemplo, RTX 3050, RTX 3060). Sin embargo, esta estimación no está confirmada en la documentación.
- **Opciones de despliegue**: compatible con Transformers, Transformers.js, y GGUF para llama.cpp, Ollama o vLLM (aunque vLLM suele requerir GPU). También es compatible con text-generation-inference (TGI) según los tags.
- **Latencia y throughput**: el único dato disponible es el de Raspberry Pi 5 con Q4_K_M (~15 tok/s). Para GPU no se especifican valores.

## Comparativa con modelos similares

La siguiente tabla compara el modelo instruct con alternativas de tamaño similar, basada en los benchmarks de la model card original.

| Modelo | Parametros | Contexto | IFEval | MT-Bench | Licencia |
|---------------------------|------------|----------|--------|----------|----------|
| SmolLM2-1.7B-Instruct | 1,7B | No disponible | 56,7 | 6,13 | Apache 2.0 |
| Llama-1B-Instruct | 1B | No disponible | 53,5 | 5,48 | Llama 3.2 (requiere aceptación) |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible | 47,4 | 6,52 | Apache 2.0 |
| SmolLM1-1.7B-Instruct | 1,7B | No disponible | 23,1 | 4,33 | Apache 2.0 |

SmolLM2-1.7B-Instruct destaca en IFEval (seguimiento de instrucciones) y HellaSwag, mientras que Qwen2.5-1.5B-Instruct obtiene mejor MT-Bench. La licencia Apache 2.0 de SmolLM2 es más permisiva que la de Llama.

## Limitaciones y advertencias

- **Idioma**: el modelo solo está entrenado en inglés, por lo que no es adecuado para tareas en otros idiomas sin fine-tuning adicional.
- **Tamaño reducido**: al ser un modelo de 1,7B, puede presentar alucinaciones y errores en tareas complejas de razonamiento o conocimiento factual, especialmente en dominios especializados.
- **Contexto limitado**: no se ha especificado la longitud de contexto, pero los modelos de esta familia suelen tener ventanas cortas (típicamente 2048 tokens), lo que limita tareas que requieren contexto largo.
- **Rendimiento en producción**: aunque el fork reporta buenos resultados en Raspberry Pi, la velocidad de ~15 tok/s puede ser insuficiente para aplicaciones interactivas en tiempo real que requieran baja latencia.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales si se utilizan datasets con licencias específicas (no se detallan).
- **Sin garantías**: el fork es mantenido por un tercero y no cuenta con soporte oficial de Hugging Face; se recomienda validar su comportamiento en el caso de uso concreto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mainbrains/SmolLM2-1.7B-Instruct)
- [Modelo base original](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct)
- [Paper de SmolLM2 (arXiv)](https://arxiv.org/abs/2502.02737)
- [Repositorio oficial de SmolLM2 en GitHub](https://github.com/huggingface/smollm)
- [Dataset de SFT SmolTalk](https://huggingface.co/datasets/HuggingFaceTB/smoltalk)
- [Dataset Synth-APIGen-v0.1 (function calling)](https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1)
