# OS-Software/Ornith-1.5-35B-A3B-heretic-ja

## Resumen

Ornith-1.5-35B-A3B-heretic-ja es una variante desensurada (decensored) del modelo base ornith-ai/Ornith-1.5-35B-A3B, creada por OS-Software mediante la técnica de abliteración con el proyecto Heretic v1.4.0+custom, utilizando el método Arbitrary-Rank Ablation (ARA) con un adaptador LoRA y preservación de norma de fila. El modelo base, desarrollado por Ornith AI, es un mixture-of-experts (MoE) de 35.1B parámetros totales que activa aproximadamente 3B por token, construido sobre Qwen3.5 y Gemma4 con un proceso de auto-mejora de extremo a extremo que incluye generación de tareas, construcción de scaffolds y optimización mediante reinforcement learning.

Esta versión heretic-ja reduce drásticamente el alineamiento de seguridad del modelo original, pasando de 100/100 a 2/100 en métricas de palabras clave de rechazo (evaluadas con datasets japoneses), con una divergencia KL de 0.0477 respecto al original. Está pensada exclusivamente para investigación en seguridad, red-teaming y estudios de alineación, y no para despliegue en producción. El repositorio incluye pesos en safetensors (70.3 GB) y existe una versión GGUF separada para cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) basada en Qwen3.5, con tag qwen3_5_moe y soporte image-text-to-text |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados en la model card; existe versión GGUF separada |
| Idiomas soportados | no disponibles (las pruebas de rendimiento se realizaron con datasets japoneses) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo principal) y GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE que activa ~3B parámetros por token, desarrollado mediante un proceso de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, construye scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para mejorar la política mediante reinforcement learning. Este enfoque extiende el marco de auto-scaffolding de Ornith-1.0, que a su vez se basaba en Qwen3.5 y Gemma4 con continued pretraining, mid-training y post-training.

La variante heretic-ja aplica abliteración sobre el modelo base usando Heretic v1.4.0+custom con el método ARA (Arbitrary-Rank Ablation). Los parámetros de abliteración incluyen: capas 14 a 28, peso de preservación de buen comportamiento 1.0, peso de dirección de mal comportamiento 0.0061, sobrecorrección relativa 2.8147, vecino único y sin actualización secundaria. El resultado es una reducción significativa de los mecanismos de rechazo, manteniendo una divergencia KL baja (0.0477) respecto al original.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte para tareas de codificación y agénticas (según la model card del modelo base).
- Procesamiento multimodal imagen-texto (según el tag image-text-to-text de HuggingFace, aunque no hay detalles en la documentación).
- Capacidad de auto-mejora: el modelo base puede generar tareas, construir scaffolds y producir rollouts para entrenamiento por refuerzo.
- Soporte de tool calling y razonamiento multi-paso: no se documenta explícitamente, pero el modelo base destaca en benchmarks agénticos.
- Multilingüismo: no especificado, aunque las pruebas de rendimiento de esta variante se realizaron con datasets japoneses.
- Modo desensurado: capacidad de generar contenido que el modelo original rechazaría, con fines de investigación.

## Casos de uso

- Investigación en seguridad de IA: evaluar la eficacia de técnicas de abliteración y medir el impacto en el comportamiento del modelo mediante red-teaming controlado.
- Estudios de alineación: analizar cómo la eliminación de capas de rechazo afecta a la coherencia, la utilidad y la seguridad de las respuestas en escenarios adversarios.
- Pruebas de robustez: someter al modelo a entradas maliciosas o ambiguas para identificar vulnerabilidades en sistemas de moderación y filtrado.
- Desarrollo de contramedidas: utilizar el modelo como caso extremo para entrenar clasificadores de contenido dañino o sistemas de detección de respuestas no seguras.
- Benchmarking de técnicas de desalineación: comparar el rendimiento de diferentes métodos de abliteración (ARA, LoRA, etc.) sobre la misma base.
- Experimentación académica en entornos aislados: estudiar la generación de texto sin restricciones en laboratorios con supervisión humana y sin exposición pública.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card del modelo base indica que Ornith-1.5-35B-A3B supera a Qwen3.6-35B-A3B en todos los benchmarks de codificación y agénticos, y supera a Gemma-4-31B y Muse-Glimmer-30B en codificación agéntica, pero no se proporcionan las cifras concretas en el texto extraído. La variante heretic-ja solo reporta métricas de abliteración (Keywords 2/100 vs 100/100, KL 0.0477) y no incluye benchmarks de rendimiento general. Una fuente externa (BenchLM.ai) estima un score público de 49.22/100, pero es una estimación no verificada.

## Requisitos de hardware

- VRAM estimada: el repositorio de safetensors ocupa 70.3 GB, lo que sugiere que en FP16 se necesitan al menos 70 GB de VRAM para carga completa. Con cuantización GGUF (por ejemplo, Q4_K_M) podría reducirse a ~20-25 GB, pero no se especifican tamaños exactos.
- GPU recomendadas: para FP16, GPUs de datacenter como A100 80GB o H100. Para cuantización GGUF, GPUs consumer como RTX 4090 (24GB) o RTX 3090 (24GB) podrían ser suficientes, aunque no hay confirmación oficial.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI para el formato GGUF; transformers para safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35,1B | ~3B | no disponible | MIT | Modelo original con alineamiento completo |
| Ornith-1.5-35B-A3B-heretic-ja | 35,1B | ~3B | no disponible | MIT | Versión desensurada, sin alineamiento |
| Qwen3.6-35B-A3B | ~35B | ~3B | no disponible | no disponible | Competidor directo, superado por el base en benchmarks |
| Gemma-4-31B | 31B (dense) | 31B | no disponible | no disponible | Denso, superado en codificación agéntica |

No se dispone de datos de contexto ni de rendimiento numérico para una comparación cuantitativa completa.

## Limitaciones y advertencias

- Reducción sustancial del alineamiento de seguridad: el modelo es mucho más propenso a generar contenido dañino, inexacto, sesgado u ofensivo que el modelo original.
- Riesgo elevado de alucinaciones y de respuestas no verificadas, especialmente en dominios sensibles.
- No apto para despliegue en producción ni en servicios orientados al usuario final; su uso debe limitarse a investigación y experimentación controlada.
- Las pruebas de rendimiento de la abliteración se realizaron únicamente con datasets japoneses, por lo que el comportamiento en otros idiomas puede variar.
- La licencia MIT permite uso comercial, pero el aviso del autor desaconseja explícitamente su uso en entornos públicos.
- No se documentan limitaciones de contexto ni de idioma específicas; se recomienda tratar todas las salidas como no fiables y verificar de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión GGUF: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja-GGUF
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Proyecto Heretic: https://heretic-project.org
- Repositorio de Heretic (p-e-w): https://github.com/p-e-w
- BenchLM.ai (score estimado): https://benchlm.ai/models/ornith-1-5-35b-a3b
