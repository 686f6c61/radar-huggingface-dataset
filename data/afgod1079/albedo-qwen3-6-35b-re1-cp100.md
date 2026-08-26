# afgod1079/albedo-qwen3.6-35b-re1-cp100

## Resumen

El repositorio `afgod1079/albedo-qwen3.6-35b-re1-cp100` contiene un checkpoint derivado del modelo Qwen3.6-35B-A3B, la primera variante de pesos abiertos de la serie Qwen3.6 publicada por Alibaba tras la serie Qwen3.5. Se trata de un modelo de lenguaje causal multimodal (image-text-to-text) con arquitectura híbrida de Gated DeltaNet y Mixture-of-Experts (MoE), que suma 35.951.822.704 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token. La ventana de contexto nativa es de 262.144 tokens y es extensible hasta aproximadamente 1.010.000 tokens.

El modelo destaca por su orientación a tareas de codificación agéntica y razonamiento repositorial, así como por la preservación del contexto de pensamiento en conversaciones iterativas. Aunque el repositorio no incluye una model card propia del autor, el contenido del README copia la documentación oficial de Qwen3.6-35B-A3B, por lo que las especificaciones técnicas y benchmarks que se citan corresponden al modelo base, no a un entrenamiento adicional específico de este checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + MoE, con vision encoder y atención lineal |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens nativos, extensible a ~1.010.000 |
| Tipos de cuantizacion | No disponible (formato BF16 en safetensors) |
| Idiomas soportados | 201 idiomas y dialectos (según documentación oficial de Qwen3.6) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un modelo de lenguaje causal con vision encoder integrado, entrenado en dos etapas: pre-training y post-training (con refuerzo y ajuste instructivo, aunque no se detallan los datos exactos). La arquitectura del transformer híbrido combina bloques de atención lineal Gated DeltaNet con bloques de atención de gating y una capa de Mixture-of-Experts. La distribución de capas es `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`, con un total de 40 capas.

El bloque Gated DeltaNet usa 32 cabezas de atención lineal para la rama de valores y 16 para la rama de consultas y claves, con dimensión de cabeza 128. El bloque de atención de gated emplea 16 cabezas de consulta y 2 cabezas de clave/valor, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La capa MoE tiene 256 expertos, de los cuales 8 son activados por token más 1 experto compartido, con dimensión intermedia de 512. La dimensión oculta del modelo es 2048 y el tamaño del vocabulario es 248.320 (con padding). El modelo también incorpora entrenamiento con múltiples pasos de MTP (Multi-Token Prediction).

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de modo "thinking" (razonamiento explícito).
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio, con mejoras específicas en esta versión.
- Preservación del contexto de pensamiento: opción de retener el razonamiento de mensajes históricos para desarrollo iterativo.
- Multimodalidad: entrada de texto e imagen (image-text-to-text) gracias al vision encoder integrado.
- Multilingüe: soporte para 201 idiomas y dialectos.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta ~1.010.000 tokens.
- Compatible con herramientas de inferencia estándar: Transformers, vLLM, SGLang, KTransformers.

## Casos de uso

- **Desarrollo de software asistido por agente**: el modelo puede resolver tareas de SWE-bench Verified con un 73,4% de precisión, lo que lo hace adecuado para pipelines de resolución de issues en repositorios reales, integrado con vLLM o SGLang.
- **Asistente de programación con contexto largo**: con 262K tokens de contexto, puede analizar repositorios completos, mantener el estado de conversaciones largas y ofrecer sugerencias de refactorización coherentes con la estructura del proyecto.
- **Atención al cliente multimodal**: al aceptar entradas de imagen y texto, puede procesar capturas de pantalla de errores, logs o documentos de usuario para diagnosticar problemas técnicos y proporcionar soluciones paso a paso.
- **Análisis de documentos técnicos extensos**: la ventana de 1M tokens ampliada permite procesar manuales, normativas o documentación de API de gran tamaño en una sola pasada, con resumen y extracción de información.
- **Automatización de flujos de trabajo de frontend**: las mejoras en codificación agéntica permiten generar componentes UI, gestionar tareas de diseño a código y mantener coherencia de estilo en proyectos de interfaz.
- **Investigación en IA multimodal**: como modelo de pesos abiertos bajo Apache-2.0, sirve como base para fine-tuning en tareas específicas de visión-lenguaje, razonamiento o agentes de código.

## Benchmarks y rendimiento

Los datos de benchmark corresponden al modelo base Qwen3.6-35B-A3B (no al checkpoint del repositorio, que no presenta resultados propios). La tabla incluye comparativas con modelos similares:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- **VRAM estimada**: el modelo con 35B parámetros y 3B activos, en BF16, requiere aproximadamente 70 GB de VRAM para carga completa. Con cuantización a 4 bits (GGUF), puede ejecutarse en configuraciones de ~22 GB según documentación de Unsloth.
- **GPU recomendadas**: A100 80GB, H100 80GB, o configuraciones multi-GPU (2×RTX 4090 de 24 GB) para BF16. Para cuantización ligera, una sola RTX 4090 o RTX 3090 es suficiente.
- **Opciones de despliegue**: vLLM, SGLang, KTransformers, Transformers con HuggingFace, y Unsloth para inferencia y entrenamiento local.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Rendimiento SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K nativo / 1M ext. | Apache-2.0 | 73,4 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K | Apache-2.0 | 70,0 |
| Qwen3.5-27B | 27B | no MoE | 262K | Apache-2.0 | 75,0 |
| Gemma4-31B | 31B | no MoE | no disponible | Gemma | 52,0 |

Nota: el checkpoint `afgod1079/albedo-qwen3.6-35b-re1-cp100` es un derivado del Qwen3.6-35B-A3B, por lo que las comparativas se refieren al modelo base.

## Limitaciones y advertencias

- **Datos de rendimiento**: los benchmarks y especificaciones citados corresponden al modelo base Qwen3.6-35B-A3B; el checkpoint del repositorio no incluye resultados propios ni documentación de entrenamiento adicional.
- **Sesgos y alucinación**: como modelo de lenguaje entrenado en datos web, puede presentar sesgos sociales y culturales, y generar información falsa o no verificada, especialmente en tareas de razonamiento complejo.
- **Contexto largo**: aunque la ventana es de 262K tokens, la calidad de atención puede degradarse en contextos muy largos; se recomienda validar la coherencia en casos de uso de producción.
- **Licencia**: aunque la licencia es Apache-2.0, se recomienda revisar los términos de uso del modelo base Qwen3.6 para posibles restricciones de uso comercial en determinados sectores.
- **Reproducibilidad**: el checkpoint no ofrece documentación sobre el proceso de entrenamiento o los datos utilizados, lo que limita su uso en investigación reproducible.
- **Idiomas**: aunque se declaran 201 idiomas, el rendimiento en idiomas minoritarios puede ser inferior al de inglés o chino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/afgod1079/albedo-qwen3.6-35b-re1-cp100
- Modelo base en HuggingFace (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen3.6: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Documentación de Unsloth sobre Qwen3.6: https://unsloth.ai/docs/models/qwen3.6
- Catálogo de modelos en Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
