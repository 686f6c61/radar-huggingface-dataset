# nvidia/DeepSeek-V4-Flash-NVFP4

## Resumen

El modelo `nvidia/DeepSeek-V4-Flash-NVFP4` es una versión cuantizada del modelo DeepSeek-V4-Flash de DeepSeek AI, optimizada por NVIDIA mediante su librería Model Optimizer. Se trata de un modelo de lenguaje autorregresivo de tipo Mixture-of-Experts (MoE) con una arquitectura Transformer que combina atención híbrida (Compressed Sparse Attention y Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections. El modelo original cuenta con 284 mil millones de parámetros totales y 13 mil millones activos por token, con una ventana de contexto máxima de 1 millón de tokens.

La versión NVFP4 cuantiza pesos y activaciones al formato de 4 bits de NVIDIA (NVFP4), manteniendo ciertos componentes (atención, expertos compartidos, cabezal de router y MTP) en FP8. El repositorio en Hugging Face contiene 166.726.476.754 parámetros en safetensors, con un tamaño total de 175,7 GB. Está diseñado para ejecutarse en hardware NVIDIA Blackwell (B200) y es compatible con los motores de inferencia SGLang y vLLM. La licencia es MIT, lo que permite uso comercial y no comercial sin restricciones adicionales.

La relevancia de este modelo radica en que ofrece una versión cuantizada de un modelo de razonamiento avanzado de gran tamaño, optimizada para despliegue eficiente en GPUs Blackwell, manteniendo capacidades de razonamiento, tool calling y uso agéntico. Está pensado para aplicaciones de razonamiento complejo, matemáticas, ingeniería de software y asistentes empresariales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), atención híbrida (Compressed Sparse Attention + Heavily Compressed Attention) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 284B (según model card del autor); 166.726.476.754 en el repositorio safetensors cuantizado |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens (máximo) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones); atención, shared experts, router head y MTP en FP8 |
| Idiomas soportados | No especificado |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un Transformer MoE con atención híbrida: utiliza Compressed Sparse Attention y Heavily Compressed Attention para manejar contextos largos de hasta 1 millón de tokens, junto con Manifold-Constrained Hyper-Connections para mejorar la estabilidad del entrenamiento y la representación de características. La versión NVFP4 fue obtenida mediante cuantización post-entrenamiento con NVIDIA Model Optimizer v0.44.0, que convierte pesos y activaciones a NVFP4. El proceso de calibración utilizó los datasets `cnn_dailymail` y `Nemotron-Post-Training-Dataset-v2`. Los datos de entrenamiento originales del modelo base no han sido divulgados.

El modelo soporta tres modos de razonamiento (Non-think, Think High y Think Max) mediante un pipeline de codificación personalizado (`encoding_dsv4`), lo que permite ajustar el nivel de razonamiento según la tarea. La cuantización mantiene los componentes críticos (atención, expertos compartidos, router head y MTP) en FP8 para preservar la precisión.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo razonamiento lógico y matemático.
- Soporte de tool calling y function calling, con salida JSON estructurada.
- Capacidades agénticas multi-paso y uso de herramientas externas en escenarios de agente.
- Manejo de conversaciones multi-turno con system prompts, mensajes de usuario y respuestas de asistente.
- Tres modos de razonamiento configurables: Non-think (rápido), Think High (análisis lógico) y Think Max (razonamiento completo).
- Contexto largo de hasta 1 millón de tokens, adecuado para recuperación de información en documentos extensos.
- Capacidades multilingües no especificadas oficialmente, aunque el modelo base probablemente soporte múltiples idiomas.

## Casos de uso

- Razonamiento matemático y científico: el modelo puede resolver problemas complejos de matemáticas, física o química gracias a sus capacidades de razonamiento avanzado y al modo Think Max, que activa un análisis exhaustivo.
- Generación de código en producción: con soporte para tool calling y generación de JSON, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar APIs.
- Asistentes empresariales de atención al cliente: su capacidad multi-turno y de contexto largo permite gestionar conversaciones complejas con historial extenso, extrayendo información relevante de bases de conocimiento.
- Agentes autónomos para automatización de tareas: puede planificar y ejecutar múltiples pasos usando herramientas externas, por ejemplo en escenarios de gestión de cuentas o resolución de incidencias técnicas (como el benchmark τ²-Bench Telecom).
- Análisis y resumen de documentos largos: gracias a su ventana de 1M tokens, puede procesar informes, contratos o artículos científicos completos y generar resúmenes o extraer datos específicos.
- Desarrollo de chatbots con razonamiento estructurado: el modo Non-think proporciona respuestas rápidas, mientras que los modos Think permiten respuestas más elaboradas, adaptándose a distintos requisitos de latencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el modelo fue evaluado en los siguientes benchmarks, pero no se proporcionan valores concretos:

- GPQA Diamond (razonamiento científico de nivel graduado)
- AA-LCR (recuperación de contexto largo)
- τ²-Bench Telecom (uso agéntico de herramientas)
- SciCode (capacidades de código científico)
- IFBench (seguimiento de instrucciones)

Por lo tanto, no es posible presentar una tabla comparativa con resultados numéricos.

## Requisitos de hardware

- Hardware compatible: GPU NVIDIA Blackwell (B200) según la documentación oficial.
- Tamaño del repositorio: 175,7 GB en safetensors, lo que sugiere que se necesita al menos esa cantidad de VRAM para cargar los pesos, más memoria adicional para activaciones y KV cache. Una B200 con 192 GB de VRAM es suficiente para inferencia en precisión NVFP4.
- No se especifican requisitos para GPUs consumer; probablemente no quepa en una sola GPU de consumo (p.ej. RTX 4090 con 24 GB) debido al tamaño.
- Motores de inferencia soportados: SGLang y vLLM.
- Sistema operativo recomendado: Linux.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones de modelos comparables de la misma categoría. Se puede señalar que este modelo es la variante cuantizada de DeepSeek-V4-Flash, por lo que su rendimiento debería ser similar al del modelo original con una pérdida de precisión mínima, pero no se dispone de datos de comparación directa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios poco representados en sus datos de entrenamiento.
- Limitaciones de idioma: no se ha especificado oficialmente la lista de idiomas soportados; se recomienda validar el rendimiento en el idioma objetivo antes de desplegar en producción.
- Requisitos de hardware: está optimizado exclusivamente para GPUs NVIDIA Blackwell; no funcionará correctamente en hardware más antiguo o en GPUs de consumo sin soporte NVFP4.
- Pérdida de precisión por cuantización: aunque los componentes críticos se mantienen en FP8, la cuantización a NVFP4 puede introducir degradación en tareas de alta precisión; se recomienda evaluar en el caso de uso específico.
- Dependencia de software específico: requiere SGLang o vLLM con soporte para NVFP4 y el pipeline de codificación `encoding_dsv4`; la integración con otros runtimes puede no estar disponible.
- Licencia: MIT permite uso comercial y no comercial, pero el modelo base y sus pesos pertenecen a DeepSeek AI; se debe revisar la licencia del modelo base para confirmar restricciones adicionales (aunque la model card indica licencia MIT).

## Enlaces

- [Hugging Face - nvidia/DeepSeek-V4-Flash-NVFP4](https://huggingface.co/nvidia/DeepSeek-V4-Flash-NVFP4)
- [Model card original de DeepSeek-V4-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
- [NVIDIA NIM - DeepSeek V4 Flash](https://build.nvidia.com/deepseek-ai/deepseek-v4-flash)
- [vLLM Recipes - DeepSeek-V4-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash)
- [Documentación NVIDIA API - DeepSeek-V4-Flash](https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer)
