# dealignai/Ornith-1.5-35B-A3B-JANG_4M-UNCENSORED-CRACK

## Resumen

Ornith-1.5-35B-A3B es un modelo multimodal de lenguaje y visión de tipo Mixture-of-Experts (MoE) desarrollado por ornith-ai, que combina una arquitectura híbrida con atención completa y un backbone de gated-delta, junto con una torre de visión de 27 capas y soporte nativo de video. La versión aquí descrita, publicada por dealignai, es una adaptación cuantizada a 4 bits en formato MLX para Apple Silicon, con el comportamiento de rechazo (refusal) eliminado a nivel de pesos mediante una técnica de "crack" o abliteration. El resultado es un modelo que sigue instrucciones sin negarse a responder en ninguna categoría, manteniendo las capacidades de razonamiento, visión, codificación y uso de herramientas del modelo original.

Con 35.9 mil millones de parámetros totales y 3 mil millones activos (A3B), el modelo ofrece una ventana de contexto de 262.144 tokens, lo que lo hace adecuado para tareas de razonamiento extenso, análisis de documentos largos y agentes conversacionales. La versión cuantizada ocupa aproximadamente 20 GB en disco y se distribuye bajo licencia Apache 2.0, lo que facilita su uso en investigación y desarrollo. La relevancia actual de este modelo radica en su capacidad para ejecutarse en hardware de Apple Silicon con MLX, y en su carácter "uncensored", pensado para investigación de seguridad de IA y pruebas autorizadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (gated-delta + full-attention) con torre de visión de 27 capas y procesador de video nativo |
| Parametros totales | 35.9B (modelo base) ; 5.999.262.192 (pesos cuantizados en safetensors del repo) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit mixed-precision (balanced) en MLX; también disponible en GGUF (otros repos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); también GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo base, Ornith-1.5-35B-A3B, es una evolución de la serie Ornith-1.0 con un enfoque de "self-scaffolding" que permite al modelo proponer nuevas tareas, generar scaffolds específicos y producir soluciones para aprendizaje por refuerzo, formando un ciclo de auto-mejora continua. La arquitectura combina una mezcla de expertos (MoE) con 256 expertos enrutados y 40 capas, junto con un mecanismo de atención completa y un módulo de gated-delta. La torre de visión de 27 capas procesa imágenes y video de forma nativa, sin necesidad de adaptadores externos.

La versión de dealignai es un "crack" que elimina el comportamiento de rechazo a nivel de los pesos, sin hooks de runtime ni vectores de control. Se cuantiza a 4 bits con precisión mixta (balanced) para Apple Silicon, y se ha medido una divergencia KL de 0.1504 nats respecto al modelo base sin cuantizar (MXFP8), lo que indica que el comportamiento general se preserva. El entrenamiento original del modelo base no se detalla en la información proporcionada, pero se sabe que incluye razonamiento con cadena de pensamiento (thinking) activado por defecto.

## Capacidades

- Generación de texto, razonamiento paso a paso y resolución de problemas con `enable_thinking` activado por defecto.
- Comprensión y análisis de imágenes (visión) y video, con procesador nativo integrado.
- Codificación de software con soporte de tool calling mediante esquemas XML y function schema.
- Capacidades de agente: puede gestionar conversaciones multi-turno y ejecutar acciones en entornos de herramienta.
- Ventana de contexto de 262.144 tokens, adecuada para documentos extensos y diálogos largos.
- Soporte multilingüe limitado al inglés (según la información del repo).
- El comportamiento de rechazo está eliminado: el modelo sigue instrucciones en todas las categorías sin negarse a responder.

## Casos de uso

- Investigación de seguridad de IA: analizar cómo se comporta un modelo sin mecanismos de rechazo, estudiar sesgos y evaluar riesgos de contenido dañino en entornos controlados.
- Desarrollo de aplicaciones en Apple Silicon: aprovechar la cuantización MLX para ejecutar un modelo multimodal grande en Mac con memoria unificada, ideal para prototipos y aplicaciones de escritorio.
- Asistente de codificación agéntico: el modelo puede usar tool calling para interactuar con APIs y entornos de desarrollo, integrándose en pipelines de CI/CD para generar código, revisar PRs o crear documentación técnica.
- Análisis de vídeo y documentos largos: gracias a su contexto de 262K tokens y su soporte nativo de vídeo, puede resumir grabaciones de reuniones, extraer información de videos de seguridad o procesar manuales extensos.
- Chat de atención al cliente con contexto largo: gestionar conversaciones con historial amplio y consultas multimodales (capturas de pantalla, imágenes de productos).
- Experimentación con modelos MoE cuantizados: estudiar el impacto de la cuantización mixta en el rendimiento de tareas de razonamiento y visión, comparando con versiones sin cuantizar.

## Benchmarks y rendimiento

Los resultados proporcionados por el autor (dealignai) se refieren a esta versión cuantizada y "cracked" en comparación con el modelo base sin cuantizar (MXFP8):

| Métrica | Valor |
|---|---|
| MMLU (57 materias, logit mode) | 78.4% (base: 81.1%, Δ -2.7) |
| HarmBench compliance (coherence-gated) | 97.1% (233/240) |
| KL divergence vs. base MXFP8 | 0.1504 nats |

Desglose por categoría de MMLU:

| Categoría | Base | Uncensored | Δ |
|---|---:|---:|---:|
| STEM | 75.3% | 74.2% | -1.1 |
| Humanidades | 83.1% | 80.8% | -2.3 |
| Ciencias Sociales | 88.8% | 85.8% | -2.9 |
| Otras | 80.8% | 75.4% | -5.4 |
| **Total** | **81.1%** | **78.4%** | **-2.72** |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El repo ocupa 21.5 GB en disco; la carga en memoria de los pesos cuantizados ronda los 20 GB.
- Diseñado para Apple Silicon (M-series) con MLX. Se recomienda un Mac con al menos 32 GB de memoria unificada para ejecutar el modelo con comodidad y margen para el contexto largo.
- No se especifican GPUs NVIDIA o AMD; la cuantización está orientada a MLX, aunque existen versiones GGUF para llama.cpp que pueden ejecutarse en CPU o GPU con soporte de cuantización.
- Opciones de despliegue: vMLX (motor de inferencia recomendado, que respeta las precisiones mixtas), MLX-VLM runtime con soporte `qwen3_5_moe`, o llama.cpp con los GGUF disponibles.
- No se proporcionan datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas entre esta versión y otros modelos MoE de tamaño similar. El modelo base Ornith-1.5-35B-A3B se puede comparar con otros MoE como Qwen3-30B-A3B (30B total, 3B activos) o DeepSeek-V2-Lite, pero no hay datos de rendimiento de estos en la información disponible. La versión uncensored de dealignai también tiene variantes GGUF (por ejemplo, `dealignai/Ornith-1.5-35B-A3B-UNCENSORED-GGUF` y `-CRACK-GGUF`), que ofrecen el mismo comportamiento pero en formato para llama.cpp.

## Limitaciones y advertencias

- **Sesgos y contenido**: al haber eliminado el comportamiento de rechazo, el modelo puede generar contenido inapropiado, dañino o ilegal sin filtros. Está publicado para investigación de seguridad y pruebas autorizadas, y el usuario es el único responsable de su uso.
- **Alucinaciones**: no se han evaluado sistemáticamente las tasas de alucinación; el modelo puede inventar información o citar fuentes inexistentes, especialmente en contextos largos.
- **Idioma**: solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" puede no ser adecuada para aplicaciones de producción que requieran cumplimiento de políticas de seguridad.
- **Contexto**: aunque la ventana es de 262K tokens, no se ha verificado el rendimiento real con la longitud máxima en la práctica.
- **Cuantización**: la cuantización a 4 bits puede degradar la calidad en tareas de razonamiento complejo, como muestra la caída de 2.7 puntos en MMLU respecto al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-JANG_4M-UNCENSORED-CRACK
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Versión GGUF (uncensored): https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-UNCENSORED-GGUF
- Versión GGUF (crack): https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-CRACK-GGUF
- Motor de inferencia vMLX: https://vmlx.net
- Perfil de dealignai en X: https://x.com/dealignai
