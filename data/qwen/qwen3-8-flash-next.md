# Qwen/Qwen3.8-Flash-Next

## Resumen
Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de tipo MoE ultra-sparse desarrollado por Alibaba Qwen, que sirve como vista previa experimental de la arquitectura que sustentará Qwen4. Con 125 mil millones de parámetros en el modelo de lenguaje (más 51B de n-gram embedding y 4B de MTP, sumando 180B), activa solo 6B por token, lo que lo hace extremadamente eficiente en inferencia. Incorpora un codificador de visión, por lo que es capaz de procesar imágenes y texto. Su longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000. La arquitectura introduce innovaciones como Qwen Sparse Attention (QSA) a nivel de micro-bloques, Gated DeltaNet, n-gram embedding y gated residual, diseñadas para reducir la latencia en contextos largos y mejorar la eficiencia de escalado.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE ultra-sparse, con vision encoder |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | 6B (por token) |
| Longitud de contexto | 262.144 nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | FP8 (disponible en Qwen/Qwen3.8-Flash-Next-FP8), otros no especificados |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors, compatible con transformers, vLLM, SGLang, TokenSpeed |

Nota: el total de 180B incluye 125B del modelo de lenguaje (con 6B activos), 51B de n-gram embedding y 4B de MTP.

## Arquitectura y entrenamiento
La arquitectura de Qwen3.8-Flash-Next es una evolución del diseño híbrido Gated DeltaNet + Gated Attention introducido en Qwen3-Next, pero reemplaza la atención densa por Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. El modelo utiliza un MoE con 512 expertos, de los cuales se activan 10 más 1 compartido por token. Además, incorpora n-gram embedding (20 millones de bigramas/trigramas en la capa 2) que permite escalar parámetros sin aumentar el coste computacional, y un mecanismo de gated residual con 4 ramas y bottleneck rank 320. El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, y elimina el batch-size warmup tradicional, comenzando directamente con el tamaño de lote objetivo. El modelo incluye una capa MTP (Multi-Token Prediction) entrenada con multi-steps.

## Capacidades
- Generación de texto y razonamiento complejo en múltiples dominios.
- Procesamiento multimodal: entrada de imágenes y texto (image-text-to-text).
- Soporte de tool calling y function calling (integrado en la versión oficial Qwen3.8-Flash).
- Capacidad para tareas de agente con razonamiento multi-paso gracias a la ventana de contexto larga.
- Comprensión de contexto muy largo (262K nativo, hasta 1M) adecuada para documentos extensos y conversaciones multi-turno.
- Eficiencia computacional: solo 6B parámetros activos por token, lo que permite inferencia rápida en hardware limitado.
- Capacidades multilingües: no especificadas oficialmente, pero se espera que cubra los idiomas habituales de la serie Qwen.

## Casos de uso
- Atención al cliente automatizada: con 262K tokens de contexto nativo, puede gestionar conversaciones multi-turno con historial extenso y consultar bases de conocimiento internas sin perder información.
- Análisis de documentos largos: procesamiento de contratos, informes financieros o artículos científicos completos, extrayendo información relevante y respondiendo preguntas sobre el contenido.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar y generar código, con la ventaja de activar solo 6B parámetros por token, reduciendo costes de inferencia.
- Asistentes multimodales: al aceptar imágenes, puede describir, analizar o responder sobre capturas de pantalla, diagramas o fotografías en tiempo real.
- Razonamiento sobre bases de conocimiento extensas: su ventana de contexto ampliable a 1M permite cargar grandes corpus y realizar tareas de búsqueda y síntesis sin necesidad de RAG externo.
- Desarrollo de agentes autónomos: la combinación de contexto largo, tool calling y razonamiento multi-paso lo hace adecuado para agentes que deben planificar y ejecutar acciones complejas.
- Investigación académica: como modelo abierto con arquitectura innovadora, sirve para estudiar eficiencia de MoE, atención sparse y escalado de parámetros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de benchmarks, pero los datos no han sido extraídos en la información proporcionada.

## Requisitos de hardware
- VRAM estimada: en FP8, el modelo requiere aproximadamente 180 GB de VRAM (180B parámetros × 1 byte). En BF16, ~360 GB.
- GPU recomendadas: para inferencia en FP8, se necesitan múltiples GPUs como A100 80GB (3-4), H100 80GB (3), o RTX 4090 24GB (8+). Para BF16, se requieren nodos con 8×H100 o similar.
- No cabe en una GPU de consumo estándar; se requiere configuración multi-GPU o uso de la API gestionada de Qwen Cloud.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers. También está disponible la versión FP8 en Hugging Face.
- Latencia y throughput: no disponibles, pero la activación de solo 6B parámetros por token sugiere una latencia relativamente baja para su tamaño.

## Comparativa con modelos similares
No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, por su arquitectura MoE ultra-sparse y su tamaño, se puede comparar cualitativamente con otros modelos MoE de gran escala como DeepSeek-V3 (671B total, 37B activos) o Qwen3-235B-A22B (235B total, 22B activos). Qwen3.8-Flash-Next se distingue por su menor número de parámetros activos (6B) y su innovadora atención sparse, lo que podría ofrecer una mejor relación eficiencia/rendimiento, aunque no se han publicado benchmarks comparativos.

## Limitaciones y advertencias
- Modelo experimental: es una vista previa de la arquitectura Qwen4, por lo que puede tener comportamientos inesperados o no estar completamente pulido.
- Licencia qwen-community-1.0: debe revisarse para uso comercial; aunque es una licencia comunitaria, puede tener restricciones.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o no verificada, especialmente en contextos largos.
- Sesgos: no se han publicado evaluaciones de sesgo; se recomienda auditar antes de usar en producción.
- Requisitos de hardware elevados: a pesar de la activación eficiente, el modelo completo requiere infraestructura multi-GPU, lo que limita su uso a entornos con recursos suficientes.
- Idiomas soportados no especificados: puede haber limitaciones en idiomas de baja representación.

## Enlaces
- Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Versión FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Blog: https://qwen.ai/blog?id=qwen3.8-flash-next
- Technical report: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud: https://www.qwencloud.com/models/Qwen3.8-Flash
