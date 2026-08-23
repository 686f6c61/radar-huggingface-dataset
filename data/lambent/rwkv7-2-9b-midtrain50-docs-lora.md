# Lambent/RWKV7-2.9B-midtrain50-docs-lora

## Resumen

El modelo **Lambent/RWKV7-2.9B-midtrain50-docs-lora** es un adaptador LoRA (Low-Rank Adaptation) de rango 128 desarrollado por el usuario Lambent, diseñado para entrenar el modelo base **RWKV/RWKV7-1.5B-20260805** en tareas de procesamiento de documentos largos y contexto extendido. Aunque el nombre del repositorio indica «2.9B», el modelo base es de 1.500 millones de parámetros; el adaptador LoRA se aplica sobre él sin cambiar su tamaño original. Este proyecto responde a la necesidad de mejorar la gestión de dependencias de largo alcance en arquitecturas RNN, que ya ofrecen ventajas de eficiencia lineal frente a los transformadores tradicionales.

El entrenamiento se realizó con 50 millones de tokens (180 pasos) a partir de una mezcla de datasets públicos de texto largo (bibliotecas hebreas, Wikisource, Project Gutenberg, arXiv, código y matemáticas) y un conjunto privado de logs de Discord para diálogos de contexto indefinido. El resultado es un adaptador que reduce la «polución» del estado recurrente en ventanas largas (probado a 56k tokens / 196KB) y que puede manejar documentos de hasta 256k tokens durante el entrenamiento, sin penalizar el rendimiento en benchmarks estándar en inglés.

Este modelo es relevante para desarrolladores que buscan aprovechar las ventajas de RWKV-7 (tiempo lineal, memoria constante, sin KV-cache) en tareas de lectura y razonamiento sobre documentos extensos, así como para investigaciones en lenguajes con alta densidad de tokens (como hebreo) y contextos conversacionales prolongados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (RNN con atención lineal, 100% sin atención) |
| Parametros totales | 1.5B (modelo base) + adaptador LoRA (rango 128, no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 256k tokens (entrenamiento), extendible (arquitectura RWKV) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (entrenado con hebreo, inglés, alemán, chino, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura híbrida que combina las ventajas de las RNN y los transformadores. Se basa en una recurrencia lineal con atención lineal, lo que permite un tiempo de entrenamiento paralelizable y una inferencia con complejidad O(1) en memoria (sin KV-cache). La arquitectura es 100% libre de atención, utilizando un mecanismo de «state» recurrente que se actualiza en cada paso. El modelo base **RWKV-1.5B-20260805** es la versión más reciente de RWKV-7 de ese tamaño, publicada en agosto de 2026.

El adaptador LoRA se entrenó con una tasa de aprendizaje de 5e-5 y un programador de tasa de aprendizaje WSD (Warmup, Stable, Decay). Se utilizaron ventanas de gradiente de 16k tokens sobre documentos de hasta 256k tokens, empleando la ruta de flash attention para la consistencia con los caminos de modelado estándar. La principal innovación técnica es la eliminación de la penalización por polución del estado a largo plazo, lo que mejora la coherencia en contextos largos sin afectar los benchmarks de referencia en inglés.

## Capacidades

- Generación de texto y razonamiento sobre documentos extensos (hasta 256k tokens) con mejor coherencia que el modelo base sin LoRA.
- Procesamiento de lenguajes con alta densidad de tokens (hebreo, árabe, etc.) que requieren mayor eficiencia de contexto.
- Diálogo conversacional de contexto indefinido gracias a los datos de entrenamiento de Discord.
- Soporte para código y matemáticas (incluye datasets como algebraic-stack, swallow-math-v2 y starcoderdata).
- Sin soporte explícito de tool calling, vision o audio; es un modelo de texto puro.
- Capacidades multilingües gracias a la diversidad de datasets (hebreo, inglés, etc.).

## Casos de uso

- **Análisis de documentos legales o académicos**: el modelo puede procesar contratos, tesis o artículos científicos completos (hasta 256k tokens) manteniendo coherencia en referencias cruzadas y argumentos, gracias a la mejora en el estado recurrente.
- **Chatbots de atención al cliente con memoria extendida**: al entrenarse con logs de Discord, el LoRA mantiene el contexto de conversaciones muy largas (horas de diálogo) sin degradar la respuesta.
- **Procesamiento de corpus hebreo o lenguas semíticas**: el entrenamiento con datasets como Sefaria y Hebrew_this_world optimiza el manejo de tokens densos y estructuras gramaticales complejas, ideal para herramientas de traducción o análisis.
- **Generación de contenido narrativo**: novelas o guiones de larga extensión pueden generarse con una trama coherente gracias a la ventana de contexto de 256k tokens.
- **Asistentes de código en repositorios grandes**: con datos de código y matemáticas, el adaptador puede ayudar a completar funciones o documentar módulos de código fuente extensos, aunque no se ha probado en benchmarks de código.
- **Investigación en RNNs de contexto largo**: sirve como referencia para estudiar la reducción de «polución del estado» en modelos RWKV y comparar con otras técnicas de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay una penalización particular en los harness estándar en inglés a este tamaño, pero no se proporcionan números concretos.

## Requisitos de hardware

- **VRAM estimada**: para el modelo base de 1.5B en FP16, se requieren ~3 GB de VRAM. Con el LoRA y contexto largo, la memoria adicional es mínima (los adaptadores LoRA son pequeños). En cuantización 4-bit (GGUF) se podría reducir a ~1.5 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A10) para inferencia en FP16. Para entrenamiento o contexto largo, se recomienda GPU con 8 GB o más (RTX 3080, A100).
- **Cabe en consumer GPU**: sí, incluso en tarjetas de gama baja si se usa cuantización.
- **Opciones de despliegue**: compatible con frameworks como llama.cpp (soporta RWKV), vLLM (aunque el soporte para RWKV es limitado), Ollama (si se convierte a GGUF) y TGI (con adaptaciones). El modelo base y el LoRA pueden fusionarse o cargarse por separado.
- **Latencia y throughput**: no se proporcionan datos específicos. La arquitectura RWKV ofrece inferencia en tiempo lineal, por lo que la latencia es constante para cada token, independientemente de la longitud del contexto, y el throughput es alto en comparación con transformadores de igual tamaño.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| RWKV-1.5B (base) | 1.5B | Extendido (RWKV) | Apache-2.0 | Sin adaptación para contexto largo |
| RWKV-2.9B (fla-hub) | 2.9B | Extendido | Apache-2.0 | Modelo más grande, sin LoRA específico |
| Llama 3.2 1B | 1B | 128k (con RoPE) | Meta Llama | Transformador, requiere KV-cache |
| Gemma 2 2B | 2.6B | 8k | Gemma | Transformador, contexto limitado |

El adaptador LoRA se diferencia por su enfoque específico en reducir la polución del estado y mantener coherencia en documentos largos, mientras que los otros modelos no tienen esa optimización. La comparativa directa de rendimiento no está disponible.

## Limitaciones y advertencias

- **Sesgos**: los datasets incluyen textos religiosos, históricos y de Discord, lo que puede introducir sesgos culturales o de género. No se ha evaluado el sesgo sistemáticamente.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información falsa, especialmente en contextos largos donde la coherencia es difícil.
- **Limitaciones de contexto**: aunque se entrenó con documentos de hasta 256k, la ventana de gradiente de 16k puede limitar la coherencia en documentos más largos si no se usa la técnica adecuada.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero el modelo base RWKV-7 tiene su propia licencia (Apache-2.0 también), así que no hay restricciones adicionales.
- **Caveat de producción**: el adaptador LoRA requiere el modelo base RWKV-7-1.5B-20260805 para funcionar; no es un modelo autónomo. Además, no se han publicado resultados de benchmarks, por lo que su rendimiento en tareas específicas no está garantizado.
- **Soporte de herramientas**: no se ha probado en tareas de tool calling o agentes, por lo que su uso en esos escenarios requiere validación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Lambent/RWKV7-2.9B-midtrain50-docs-lora)
- [Repositorio de RWKV-LM en GitHub](https://github.com/BlinkDL/RWKV-LM)
- [Sitio oficial de RWKV](https://www.rwkv.com/)
- [Organización RWKV en GitHub](https://github.com/rwkv)
