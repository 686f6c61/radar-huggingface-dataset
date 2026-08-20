# julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF

## Resumen

Ornith-1.5-35B-A3B-ROCmFP4-GGUF es una cuantización en formato GGUF del modelo Ornith-1.5-35B-A3B, desarrollada por julianmb específicamente para GPUs AMD Strix Halo (gfx1151) y arquitecturas RDNA 3.5. El modelo base, creado por Ornith AI, es un mixture-of-experts (MoE) híbrido con atención lineal que activa aproximadamente 3.000 millones de parámetros por token, a pesar de tener 35.505 millones en total. Esta cuantización utiliza el formato propietario ROCmFP4 con el preset `Q4_0_ROCMFP4_STRIX_LEAN`, que preserva las capas de embedding y normalización en FP16 y mantiene la cabeza MTP (multi-token prediction) en q8_0.

La relevancia de este modelo radica en su optimización para hardware AMD, ofreciendo un rendimiento de decodificación de 76,9 tokens por segundo en un Ryzen AI Max+ 395 con Radeon 8060S, un 7,5% más rápido y un 16,7% más pequeño que la cuantización estándar Q4_K_M. Con una ventana de contexto de hasta 262.144 tokens, está diseñado para tareas de razonamiento, codificación agéntica y procesamiento de contextos largos en entornos con memoria unificada de 128 GB. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal (hybrid-attention) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (ROCmFP4, 4.29 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B pertenece a la familia Ornith-1.5, que abarca tres escalas: 397B MoE, 35B MoE y 9B dense. La arquitectura combina atención lineal con mecanismos de atención estándar en un diseño MoE, lo que permite manejar contextos largos de forma eficiente. Según la documentación del fabricante, el modelo fue entrenado para destacar en razonamiento, tareas agénticas y codificación, superando a modelos comparables como Qwen 3.6-35B en benchmarks de codificación y agénticos, y a densos como Gemma 4-31B y Muse Glimmer-30B. Sin embargo, no se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información proporcionada.

La cuantización ROCmFP4 aplica una compresión de 4.29 bits por peso, preservando las capas de embedding y normalización en FP16 y manteniendo la cabeza MTP en q8_0. Esta configuración está optimizada para la arquitectura RDNA 3.5 y requiere el uso de la pila gráfica Mesa RADV con Wave64. El preset `STRIX_LEAN` reduce el tamaño del archivo a 18.16 GiB, lo que permite cargar el modelo completo en la memoria unificada de un Strix Halo de 128 GB.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de múltiples pasos.
- Codificación agéntica: capaz de generar y ejecutar código de forma autónoma, incluyendo la generación de scaffolds y soluciones completas.
- Razonamiento matemático y lógico, según las capacidades generales de la familia Ornith-1.5.
- Manejo de contextos largos de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Soporte de tool calling y function calling, implícito en su diseño agéntico (no confirmado explícitamente en la documentación).
- Capacidades multilingües no documentadas en la información disponible.
- Incluye cabeza MTP (multi-token prediction) para decodificación especulativa, aunque en esta cuantización no se recomienda su uso por pérdida de rendimiento.

## Casos de uso

- Asistente de programación en entornos locales: el modelo puede integrarse en IDEs o editores de código para generar funciones, refactorizar código y explicar fragmentos complejos, aprovechando su ventana de 256K tokens para analizar repositorios completos.
- Agentes autónomos de automatización de tareas: gracias a su capacidad agéntica, puede planificar y ejecutar secuencias de acciones, como la gestión de archivos, la ejecución de scripts o la interacción con APIs, en un entorno controlado.
- Análisis de documentos extensos: con 256K tokens de contexto, puede resumir, extraer información y responder preguntas sobre libros técnicos, informes legales o investigaciones académicas completas.
- Desarrollo de chatbots con memoria persistente: su contexto largo permite mantener conversaciones coherentes durante horas sin perder el hilo, ideal para atención al cliente o asistentes personales.
- Generación de código en pipelines de CI/CD: puede integrarse en flujos de integración continua para generar pruebas unitarias, documentación automática o parches de corrección, siempre que se valide su salida.
- Investigación en modelos de lenguaje: al ser de código abierto y con licencia Apache 2.0, sirve como base para experimentos de fine-tuning, evaluación de arquitecturas MoE híbridas o estudios de eficiencia en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados para esta cuantización específica en la información disponible. La documentación del modelo base indica que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificación y agénticos, y a Gemma 4-31B y Muse Glimmer-30B por márgenes amplios, pero no se proporcionan cifras numéricas. Los únicos datos de rendimiento medidos corresponden a la velocidad de decodificación en hardware Strix Halo:

| Configuracion | Decode |
|---|---|
| ROCmFP4 bare decode | 76.9 tok/s |
| Q4_K_M baseline | 71.5–71.7 tok/s |
| ROCmFP4 MTP (K4 p0.0) | 35–50 tok/s (pérdida neta) |

## Requisitos de hardware

- VRAM estimada: 18.16 GiB para el archivo GGUF, más overhead de contexto. Con 256K tokens de contexto, se recomienda al menos 32 GB de memoria, aunque el diseño está pensado para Strix Halo con 128 GB UMA.
- GPU recomendadas: AMD Strix Halo (gfx1151) y GPUs RDNA 3.5 con soporte ROCmFP4. No es compatible con NVIDIA ni con GPUs AMD anteriores sin soporte para esta instrucción.
- En consumer GPU: cabe en tarjetas con 24 GB de VRAM (por ejemplo, Radeon RX 7900 XTX) si se reduce el contexto, pero el rendimiento óptimo se obtiene en Strix Halo.
- Opciones de despliegue: llama-server (parte de llama.cpp) con los comandos indicados en la model card. También puede servirse con vLLM o TGI si se convierte a otros formatos, aunque no está verificado.
- Latencia y throughput: 76.9 tok/s de decodificación en Strix Halo con bare decode. No se proporcionan datos de prefill o latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 35.5B | ~3B | 256K | Apache 2.0 | MoE híbrido, optimizado para AMD |
| Qwen 3.6-35B | no disponible | no disponible | no disponible | no disponible | Comparado en benchmarks, superado por Ornith |
| Gemma 4-31B | no disponible | no disponible | no disponible | no disponible | Dense, superado por Ornith en tareas agénticas |

No se dispone de datos suficientes para una comparativa cuantitativa completa. La información cualitativa indica que Ornith-1.5-35B-A3B supera a estos modelos en codificación y tareas agénticas, pero se requieren benchmarks propios para verificar.

## Limitaciones y advertencias

- La cuantización ROCmFP4 es específica para hardware AMD con soporte para esta instrucción (Strix Halo, RDNA 3.5). No funcionará en GPUs NVIDIA ni en AMD más antiguas.
- La decodificación especulativa con MTP no se recomienda en esta cuantización: la tasa de aceptación del draft es de aproximadamente 16%, lo que produce una pérdida neta de rendimiento (35–50 tok/s frente a 76.9 tok/s en modo bare).
- No se han evaluado sesgos ni riesgos de alucinación específicos para esta cuantización. Como modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- La información sobre idiomas soportados no está disponible; se asume un enfoque multilingüe basado en el modelo base, pero no está confirmado.
- El tamaño del archivo (18.16 GiB) y el contexto máximo de 256K tokens requieren hardware con memoria abundante; en GPUs con menos de 32 GB de VRAM, el contexto debe reducirse significativamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las dependencias de cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF
- Modelo base (GGUF): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Modelo base (FP8): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Blog de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio HaloFPX de julianmb: https://github.com/julianmb/halofpx/tree/main/
- Guía de Ornith AI para modelos agénticos: https://ornith.online/
