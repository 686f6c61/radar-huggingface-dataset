# littlecedar/WIP-Ornith-1.5-397B-NVFP4-MTP-Graft

## Resumen

WIP-Ornith-1.5-397B-NVFP4-MTP-Graft es una variante experimental del modelo Ornith-1.5-397B, desarrollada por el usuario littlecedar. Se trata de un "injerto" (graft) de un módulo de predicción multi-token (MTP) sobre la versión cuantizada en NVFP4 del modelo base, con el objetivo de acelerar la inferencia mediante decodificación especulativa. El estado del repositorio es claramente un trabajo en progreso (WIP): la model card indica "Nothing here yet" y no hay descargas ni evaluaciones propias.

El modelo base, Ornith-1.5-397B, es un modelo de mezcla de expertos (MoE) de 397B parámetros desarrollado por ornith-ai, entrenado con un bucle de auto-mejora continua que combina generación de tareas, scaffolds y reinforcement learning. Según la información publicada, obtiene 86.1 en Terminal-Bench 2.1 y 56.0 en DeepSWE, comparables a Claude Opus 4.8. Esta variante cuantizada pesa 203.5B parámetros en safetensors (238.1 GB en disco) y mantiene la licencia MIT.

La relevancia de esta ficha radica en que representa un caso de uso real de cuantización agresiva (NVFP4 de 4 bits) sobre un modelo MoE de última generación, con el añadido de una técnica de decodificación especulativa en desarrollo. Es un ejemplo de cómo la comunidad adapta modelos de gran escala para entornos con restricciones de VRAM, aunque su estado incompleto limita su utilidad práctica inmediata.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parámetros totales | 203.528.832.496 (cuantizado NVFP4) |
| Parámetros activos | no disponible (MoE, no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits), etiqueta adicional de 8-bit en los tags |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-397B es un MoE con arquitectura qwen3_5_moe, entrenado por ornith-ai mediante un proceso de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para reinforcement learning, en lugar de depender de tareas curadas por humanos. La versión original incluye capacidades de imagen-texto a texto (image-text-to-text), aunque los detalles concretos del entrenamiento (número de tokens, composición del dataset, etc.) no se especifican en la información disponible.

La variante de littlecedar es un injerto de predicción multi-token (MTP) sobre la cuantización NVFP4 del modelo base. La técnica MTP permite predecir varios tokens futuros en paralelo, acelerando la inferencia sin degradar la calidad. Sin embargo, el repositorio está marcado como "WIP" y la model card no proporciona detalles sobre cómo se ha implementado el injerto, si se ha entrenado o si funciona correctamente. No hay información sobre el proceso de cuantización ni sobre el dataset utilizado.

## Capacidades

- Generación de texto y conversación multimodal: el modelo base soporta entrada de imagen y texto (image-text-to-text), por lo que esta variante hereda esa capacidad, aunque no se ha verificado en la versión cuantizada.
- Agente de codificación: el modelo base destaca en tareas de ingeniería de software, con puntuaciones de 86.1 en Terminal-Bench 2.1 y 86 en SWE-bench Verified.
- Razonamiento y resolución de problemas: se espera que mantenga capacidades de razonamiento del modelo base, aunque la cuantización NVFP4 puede degradarlas ligeramente.
- Decodificación especulativa: el "graft" MTP está diseñado para acelerar la generación de texto, aunque no se ha verificado su funcionamiento en este estado WIP.
- Soporte de tool calling y agentes: el modelo base está diseñado para uso agéntico (agentic coding), pero no hay datos específicos de esta variante.
- Multilingüismo: no hay información sobre los idiomas soportados.

## Casos de uso

- **Despliegue de agentes de codificación en entornos con VRAM limitada**: la cuantización NVFP4 reduce significativamente el peso del modelo (de 397B a 203.5B parámetros), lo que permite ejecutar un modelo de alto rendimiento en un clúster de 2-4 GPUs de 80 GB. Es adecuado para tareas de autocompletado de código, revisión de PRs o generación de tests.
- **Investigación en decodificación especulativa**: el injerto MTP es un caso de estudio práctico para evaluar cómo la predicción multi-token acelera la inferencia en un MoE cuantizado. Los investigadores pueden comparar la latencia y la calidad con el modelo base.
- **Prototipado de aplicaciones de razonamiento**: con la licencia MIT y el formato safetensors, se puede integrar en pipelines de transformadores para pruebas de concepto en entornos académicos o de investigación.
- **Evaluación de cuantización de 4 bits en MoE**: este modelo sirve como referencia para medir la pérdida de precisión en benchmarks de código y razonamiento cuando se aplica NVFP4 a un modelo de 397B.
- **Entrenamiento de modelos más pequeños**: el conocimiento del modelo base, transferido a la variante cuantizada, puede usarse como profesor para destilar en modelos de menor tamaño.
- **Pruebas de compatibilidad con herramientas de despliegue**: dado su tamaño y formato, se puede probar su integración con vLLM, llama.cpp o TGI, aunque el estado WIP no garantiza un funcionamiento estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante cuantizada. Los datos siguientes corresponden al modelo base Ornith-1.5-397B, según la model card de ornith-ai, y se incluyen como referencia para valorar el potencial de esta versión:

| Benchmark | Ornith-1.5-397B | DeepSeek-V4-Flash-0731 | GLM-5.2 | Claude Opus 4.8 | Kimi K3 |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 86.1 | 82.7 | 81.0 | 85.0 | 88.3 |
| Terminal-Bench 2.1 (Claude Code) | 85.2 | 81.8 | 82.7 | 78.9 | - |
| SWE-bench Verified | 86.0 | 81.6 | 83.0 | 85.8 | 86.2 |
| DeepSWE | 56.0 | - | - | 59.0 | - |

La cuantización NVFP4 suele provocar una degradación de entre 0.5 y 2 puntos en benchmarks de este tipo, pero no hay datos verificados para este modelo específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con la cuantización NVFP4, el modelo ocupa aproximadamente 203.5B parámetros × 0.5 bytes por parámetro (4 bits) ≈ 102 GB, más overhead de activaciones y KV cache. En la práctica, se recomienda al menos 2 GPUs de 80 GB (como A100 o H100) para inferencia con contexto moderado.
- **GPU recomendadas**: NVIDIA A100 (80 GB), H100 (80 GB), o 4× RTX 4090 (24 GB) con tensor parallelism.
- **Compatibilidad con consumer GPU**: no es viable en una sola GPU de consumo; solo con múltiples GPUs de 24 GB y sharding.
- **Opciones de despliegue**: transformers (PyTorch), vLLM, TGI, o llama.cpp (si se convierte a GGUF). El formato safetensors es compatible con todos ellos.
- **Latencia y throughput**: no disponible, pero un MoE de 397B con cuantización de 4 bits puede alcanzar tasas de 20-40 tokens/s en H100 con batch pequeño, y más con decodificación especulativa si el injerto MTP funciona correctamente.

## Comparativa con modelos similares

Esta variante se puede comparar con otras versiones cuantizadas de modelos MoE de gran escala. La siguiente tabla compara el modelo base (Ornith-1.5-397B) con alternativas abiertas similares, ya que no hay datos de la variante cuantizada:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento SWE-bench Verified |
|---|---|---|---|---|
| Ornith-1.5-397B (base) | 397B (MoE) | no disponible | MIT | 86.0 |
| DeepSeek-V4-Flash-0731 | 284B (MoE) | no disponible | no disponible | 81.6 |
| GLM-5.2 | 753B (MoE) | no disponible | no disponible | 83.0 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | 85.8 |

La variante cuantizada de littlecedar se distingue por su menor huella de memoria (203.5B parámetros reales) y por el injerto MTP, pero no hay datos de rendimiento propios para comparar directamente.

## Limitaciones y advertencias

- **Estado WIP**: la model card indica "Nothing here yet"; el injerto MTP no está documentado ni validado, y puede no funcionar correctamente en producción.
- **Cuantización NVFP4**: la precisión de 4 bits puede provocar una degradación notable en tareas de razonamiento complejo, matemáticas o código, aunque el impacto exacto no se ha medido.
- **Sin benchmarks propios**: los resultados publicados son del modelo base, no de esta variante; cualquier uso en producción debe basarse en evaluaciones propias.
- **Idiomas y contexto**: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita el diseño de aplicaciones.
- **Licencia MIT**: permite uso comercial, pero hay que tener en cuenta que el modelo base puede contener componentes de Qwen3.5 y Gemma4, cuyas licencias originales podrían tener restricciones adicionales (no se han verificado).
- **Alucinaciones**: como todo modelo de lenguaje, puede generar respuestas incorrectas, especialmente en código o datos factuales; es necesario validar la salida en producción.
- **Riesgo de seguridad**: al ser un modelo de código agéntico, puede ejecutar comandos o modificar archivos si se integra en un sistema sin sandboxing.

## Enlaces

- [Repositorio de la variante en HuggingFace](https://huggingface.co/littlecedar/WIP-Ornith-1.5-397B-NVFP4-MTP-Graft)
- [Modelo base en HuggingFace](https://huggingface.co/ornith-ai/Ornith-1.5-397B-NVFP4)
- [Blog de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Colección de modelos Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Guía de despliegue de Ornith AI](https://ornith.online/)
