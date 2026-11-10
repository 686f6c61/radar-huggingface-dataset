# Nekodeus/deepseek-r1-distill-qwen-1-5b-openvino

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B OpenVINO es una conversión a formato OpenVINO IR del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario Nekodeus. Se trata de un modelo de generación de texto de 1.500 millones de parámetros derivado de la familia DeepSeek-R1, destilado sobre la base Qwen2.5-1.5B y con capacidad de razonamiento estilo R1. La conversión aplica cuantización weight-only INT8 mediante NNCF, dejando las activaciones en FP16/FP32 según el trazado, con el objetivo de optimizar la inferencia en CPU.

La relevancia de esta ficha radica en su formato: no es un modelo nuevo, sino un artefacto de despliegue optimizado para OpenVINO, pensado para ejecutar razonamiento en hardware Intel sin GPU dedicada. Mantiene la ventana de contexto de 131.072 tokens heredada de Qwen2.5 y el formato de prompt con etiquetas de razonamiento. La licencia MIT del modelo base se conserva en la conversión.

El modelo está orientado a desarrolladores que necesitan desplegar un LLM de razonamiento pequeño en entornos con recursos limitados, especialmente en CPU, usando el runtime de OpenVINO o la librería optimum-intel. No se han publicado datos de benchmarks ni métricas de rendimiento específicas para esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parámetros totales | 1.500 millones (1.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada de Qwen2.5) |
| Tipos de cuantización | Weight-only INT8 (NNCF); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2, concretamente Qwen2ForCausalLM con 1.500 millones de parámetros. Sobre esta base, DeepSeek aplicó un proceso de destilación de razonamiento a partir de su familia R1, de modo que el modelo aprende a generar cadenas de razonamiento antes de responder. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la destilación.

La conversión realizada por Nekodeus no modifica la arquitectura: exporta el modelo a OpenVINO IR con `optimum-cli` y aplica cuantización weight-only INT8 con NNCF, manteniendo las activaciones en FP16/FP32 según el trazado. El artefacto se compone de tres partes (modelo, tokenizador y detokenizador) y se generó en un entorno CPU-only de Kaggle, de forma totalmente offline. Se recomienda el formato de prompt con etiquetas de razonamiento (`<｜think｜>`) para obtener los mejores resultados.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso estilo R1.
- Razonamiento matemático y lógico mediante cadenas de pensamiento antes de la respuesta final.
- Generación de código (heredada de la base Qwen2.5-1.5B).
- Soporte de contexto largo de hasta 131.072 tokens.
- Formato de prompt específico con etiquetas de razonamiento para activar el modo de pensamiento.
- Inferencia optimizada en CPU mediante OpenVINO y optimum-intel.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- Razonamiento matemático en local: el modelo puede resolver problemas paso a paso (por ejemplo, contar primos por debajo de 100) en CPU, sin GPU, gracias a la cuantización INT8 y al runtime OpenVINO. Adecuado para asistentes educativos o herramientas de cálculo explicado.
- Despliegue en edge y equipos sin GPU: al ejecutarse sobre OpenVINO en CPU, encaja en portátiles, mini-PC y servidores sin acelerador, con un consumo de memoria reducido por los pesos INT8.
- Asistente de código ligero: puede integrarse en editores o pipelines de CI para generar fragmentos de código y explicaciones, aprovechando la base Qwen2.5-1.5B y el modo de razonamiento.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, permite resumir o extraer información de contratos, informes o expedientes extensos en una sola pasada.
- Automatización de atención al cliente con razonamiento: conversaciones multi-turno donde el modelo justifica sus respuestas, útil en dominios técnicos o de soporte especializado.
- Prototipado e investigación en destilación de razonamiento: sirve como banco de pruebas para estudiar el comportamiento de modelos R1 destilados en tamaños pequeños y para comparar formatos de despliegue (OpenVINO frente a GGUF o safetensors).
- Integración en aplicaciones C++ nativas: mediante `ov::genai::LLMPipeline` se puede incrustar el modelo directamente en aplicaciones de escritorio o servicios embebidos escritos en C++.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente; el modelo está optimizado para CPU. Los pesos INT8 ocupan aproximadamente 1,5 GB, más el espacio de activaciones y caché KV.
- GPU recomendadas: no especificadas; el artefacto está pensado para CPU Intel con OpenVINO. Podría ejecutarse en GPU Intel integrada o discreta compatible con OpenVINO, pero no se documenta.
- ¿Cabe en GPU consumer? Sí, por tamaño (1.5B en INT8, ~1,5 GB), aunque el formato OpenVINO IR no es el habitual para GPUs NVIDIA; requeriría conversión a otro formato.
- Opciones de despliegue: OpenVINO GenAI (`ov::genai::LLMPipeline`), optimum-intel (`OVModelForCausalLM`). No se proporcionan artefactos GGUF ni safetensors en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B OpenVINO (este) | 1.5B | 131.072 | OpenVINO IR INT8 | MIT | Optimizado para CPU |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 131.072 | safetensors | MIT | Modelo base original |
| Qwen2.5-1.5B | 1.5B | 131.072 | safetensors, GGUF | Apache 2.0 (según versión) | Base sin destilación de razonamiento |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 131.072 | safetensors | MIT | Misma familia, mayor tamaño |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 1.5B parámetros: capacidad de razonamiento limitada frente a versiones mayores de la familia R1; mayor riesgo de errores en tareas complejas.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en dominios especializados.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado más allá de lo heredado de Qwen2.5.
- El formato de prompt con etiquetas de razonamiento es necesario para obtener el comportamiento esperado; un prompt inadecuado puede degradar la calidad.
- La cuantización INT8 puede introducir una ligera pérdida de precisión respecto al modelo original en FP16/BF16.
- Artefacto de despliegue, no un modelo nuevo: no aporta mejoras de capacidad sobre el modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria documentada.
- La licencia MIT del modelo base se mantiene, pero conviene verificar las condiciones de uso comercial del modelo original de DeepSeek.
- No se proporcionan artefactos en otros formatos (GGUF, safetensors); la portabilidad a otros runtimes requiere conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nekodeus/deepseek-r1-distill-qwen-1-5b-openvino
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- OpenVINO: https://github.com/openvinotoolkit/openvino
- optimum-intel: https://github.com/huggingface/optimum-intel
- NNCF (cuantización): https://github.com/openvinotoolkit/nncf
