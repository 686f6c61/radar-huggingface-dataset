# kaptaan45/QaptaanLM-0.75B-Instruct-GGUF

## Resumen

QaptaanLM-0.75B-Instruct es un modelo de lenguaje compacto de 752 millones de parámetros (según su autor), desarrollado por Rudransh Shekhar (kaptaan45) como una adaptación del modelo base Qwen3.5-0.8B-Base. Se trata de un modelo híbrido que combina atención lineal con mecanismos gated-deltanet, orientado específicamente a tareas de razonamiento técnico y generación de código. El repositorio actual ofrece versiones cuantizadas en formato GGUF para su uso directo con llama.cpp y Ollama, lo que facilita su despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su tamaño reducido combinado con una arquitectura de atención lineal híbrida, que promete menor coste computacional en inferencia y mayor eficiencia en contextos largos en comparación con modelos transformer puros de tamaño similar. Está pensado para desarrolladores que necesitan un asistente de código y razonamiento que pueda ejecutarse en CPU o GPUs de gama baja, sin sacrificar la calidad en tareas específicas de programación.

El repositorio GGUF incluye tres cuantizaciones (FP16, BF16 y Q8_0) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas. Aunque el modelo aún no tiene descargas ni valoraciones, su diseño y documentación sugieren un enfoque práctico para la integración en pipelines de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida linear-attention con gated-deltanet, basada en Qwen3.5-0.8B-Base |
| Parametros totales | 752M (según modelo card); el repositorio reporta 297.391.424 en safetensors (discrepancia sin aclarar) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16, BF16, Q8_0 |
| Idiomas soportados | Inglés (principal, según tags del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo QaptaanLM-0.75B-Instruct parte del checkpoint Qwen3.5-0.8B-Base y aplica un proceso de fine-tuning en dos fases, según el repositorio GitHub del autor. La arquitectura combina atención lineal híbrida con mecanismos gated-deltanet, lo que permite reducir la complejidad computacional frente a la atención softmax tradicional, manteniendo a su vez la capacidad de modelar dependencias de largo alcance. El entrenamiento incluye continued pretraining con objetivos de fill-in-the-middle (FIM) y un ajuste posterior mediante instruction tuning con el dataset KapInstruct-100M, un conjunto de 100 millones de tokens curado específicamente para modelos de menos de 1B parámetros. El template de chat utilizado es el formato ChatML de Qwen.

No se han publicado detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La información disponible indica que el modelo está optimizado para generación de código, razonamiento técnico y seguimiento de instrucciones, con un enfoque en eficiencia y portabilidad.

## Capacidades

- Generación de texto y código en lenguaje natural.
- Razonamiento técnico y matemático básico, orientado a problemas de programación.
- Soporte de conversación multi-turno mediante el formato ChatML.
- Capacidad de completar código parcial (fill-in-the-middle) gracias al entrenamiento con objetivos FIM.
- Ejecución eficiente en CPU y GPUs de baja gama gracias a las cuantizaciones GGUF.
- Integración nativa con llama.cpp y Ollama.
- No se ha confirmado soporte para tool calling, function calling ni capacidades multimodales.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede sugerir implementaciones de funciones, corregir errores sintácticos y explicar fragmentos de código, gracias a su entrenamiento específico en código y razonamiento técnico. Su tamaño compacto permite ejecutarlo localmente en máquinas de desarrollo sin necesidad de GPU dedicada.
- Generación de código en pipelines CI/CD: al ser un modelo pequeño y rápido, puede integrarse en flujos automatizados para generar tests unitarios, documentación de APIs o plantillas de código, reduciendo la latencia y el coste por petición frente a modelos más grandes.
- Educación y tutoría de programación: su capacidad para razonar sobre problemas algorítmicos lo hace útil como tutor interactivo para estudiantes, explicando conceptos y resolviendo ejercicios paso a paso.
- Prototipado rápido de chatbots técnicos: con el formato GGUF y soporte para Ollama, se puede desplegar un asistente conversacional en una Raspberry Pi o un servidor modesto para responder preguntas frecuentes sobre APIs o lenguajes de programación.
- Análisis de logs y depuración: el modelo puede procesar mensajes de error y sugerir posibles causas o soluciones, aprovechando su entrenamiento en código y razonamiento secuencial.
- Automatización de documentación técnica: capaz de generar resúmenes de código, comentarios de funciones y descripciones de módulos, facilitando el mantenimiento de repositorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. La única referencia de rendimiento es la afirmación del autor de que la cuantización Q8_0 conserva el 99.9% de la calidad del modelo original, aunque no se aportan mediciones concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q8_0 (~800 MB) se puede ejecutar en GPUs con 2 GB de VRAM o menos. La versión FP16 (~1.5 GB) requiere al menos 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA de gama baja (GTX 1050, RTX 2060, etc.) o incluso integradas con suficiente memoria compartida. También funciona en CPU con 8 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo desde 2 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier framework compatible con GGUF (llama-cpp-python, ctransformers, etc.).
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un modelo de ~750M parámetros, se espera una generación de 20-40 tokens/segundo en CPU moderna y 100+ tokens/segundo en GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QaptaanLM-0.75B-Instruct | 752M | No disponible | Híbrida linear-attention | Apache-2.0 | GGUF en HF |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Transformer denso | Apache-2.0 | Safetensors, GGUF |
| SmolLM2-1.7B | 1.7B | 2K | Transformer denso | Apache-2.0 | Safetensors, GGUF |
| TinyLlama-1.1B | 1.1B | 2K | Transformer denso | Apache-2.0 | Safetensors, GGUF |

La comparativa se basa en características arquitectónicas y de licencia, ya que no existen datos de rendimiento para QaptaanLM. Su ventaja potencial reside en la atención lineal híbrida, que podría ofrecer menor coste computacional en contextos largos, aunque no hay evidencia empírica publicada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- Discrepancia en el número de parámetros: el autor indica 752M, pero el repositorio GGUF reporta 297M en safetensors, lo que sugiere una posible confusión o un modelo base diferente.
- Al ser un modelo de pequeño tamaño, es propenso a alucinaciones en temas especializados y puede producir código incorrecto en casos complejos.
- La longitud de contexto no está documentada, por lo que no se garantiza un rendimiento óptimo en conversaciones largas.
- Solo se confirma soporte para inglés; otros idiomas pueden funcionar de forma deficiente.
- No se ha verificado la capacidad de tool calling ni de razonamiento multi-paso avanzado.
- El modelo está en fase temprana (sin descargas ni comunidad), por lo que puede tener errores no detectados.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-Instruct-GGUF
- Modelo base: https://huggingface.co/kaptaan45/QaptaanLM-0.75B
- GitHub del pipeline de entrenamiento: https://github.com/rudy-07/QaptaanLM-0.75B
- Dataset de instrucciones KapInstruct-100M: https://www.kaggle.com/datasets/kaptaan45/kapinstruct-100m
- Perfil del autor: https://huggingface.co/kaptaan45
