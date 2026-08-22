# nightmedia/Qwen3.8-27B-Brainwaves-1M-qx86-hi-mlx

## Resumen

Qwen3.8-27B-Brainwaves-1M-qx86-hi-mlx es un modelo experimental de lenguaje de gran tamaño (LLM) creado por Nightmedia, un laboratorio independiente con sede en Montana (EE. UU.). Se trata de una fusión (merge) de varios modelos de la familia Qwen3.6 y Qwen3.8 mediante mergekit, con el objetivo de combinar capacidades de razonamiento, codificación, escritura creativa y conversación. El modelo está cuantizado en formato MLX (qx86-hi) y diseñado para ejecutarse eficientemente en hardware Apple Silicon, aunque también es compatible con GPUs mediante la librería Transformers.

El modelo destaca por su ventana de contexto ampliable hasta 1 millón de tokens (con una variante de 2 millones), lo que permite procesar documentos largos, mantener conversaciones extensas y realizar tareas de razonamiento multi-paso. Aunque se denomina "27B", los pesos en safetensors contienen 7.664.307.440 parámetros, una discrepancia que probablemente se deba a la estructura del merge. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

La relevancia actual reside en su enfoque experimental y su capacidad de explorar configuraciones de contexto extremo, algo poco común en modelos de este tamaño. Además, al ser un merge de varios modelos especializados, ofrece un perfil versátil para tareas de generación de texto, razonamiento y creatividad, con cuantizaciones que permiten ajustar el equilibrio entre memoria y velocidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformador denso con atención híbrida, 64 capas, hidden size 5.120, 24 query heads y 4 key/value heads con GQA) |
| Parámetros totales | 7.664.307.440 (según safetensors; el modelo se anuncia como 27B) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | 256K nativo, extensible a 1M o 2M mediante configuración del RoPE |
| Tipos de cuantizacion | mxfp8, mxfp4, qx86-hi, qx64-hi, q4-hi, q6-hi, q8-hi |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una fusión de cinco modelos base: `nbeerbower/Wichtel-Qwen3.6-27B`, `trohrbaugh/Qwen3.8-27B-heretic-ara`, `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, `DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0` y `nightmedia/Qwen3.8-27B-Cold-Fusion-FF711-Darker-Hero-GAIN-B`. La fusión se realizó con mergekit, combinando pesos de forma experimental para obtener un modelo híbrido con las fortalezas de cada componente. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de ajuste (SFT, RLHF, etc.); los tags indican que se usaron técnicas de SFT y LoRA, pero no se especifican detalles.

La arquitectura subyacente corresponde a Qwen3.5 (según la vista de arquitectura de hfviewer), con atención híbrida: 48 de las 64 capas usan atención lineal y el resto atención softmax. Esto permite escalar a contextos largos con menor coste computacional. El modelo incluye un mecanismo de RoPE configurable para cambiar la longitud de contexto (256K, 512K, 1M o 2M). La cuantización qx86-hi es una variante específica de MLX que optimiza el uso de memoria y velocidad.

## Capacidades

- Generación de texto en varios idiomas (inglés, chino, japonés y español).
- Razonamiento avanzado con cadena de pensamiento (chain-of-thought) y razonamiento multi-paso.
- Codificación: genera y depura código, soporta lenguajes como Python, JavaScript, etc.
- Matemáticas y STEM: resuelve problemas matemáticos, análisis simbólico y lógico.
- Escritura creativa: generación de ficción, guiones, diálogos, descripciones vívidas y narración de historias.
- Roleplay: capacidad de mantener personajes y contextos de rol en conversaciones.
- Procesamiento de contexto largo: con 1M o 2M de tokens, puede analizar libros completos, bases de código extensas o documentos legales.
- Compatibilidad con tool calling y function calling (heredado de la familia Qwen, aunque no está explícitamente documentado en la model card).
- Soporte de entrada de imágenes (pipeline image-text-to-text), aunque no se proporcionan detalles de implementación.

## Casos de uso

- **Análisis de documentos extensos**: con 1M de contexto, el modelo puede procesar informes financieros, patentes o documentos legales de cientos de páginas en una sola pasada, extrayendo información relevante y resumiendo.
- **Generación de historias y ficción**: gracias a su entrenamiento en escritura creativa, puede generar tramas, subtramas y descripciones vívidas, útil para escritores y creadores de contenido.
- **Asistente de programación**: puede revisar y refactorizar código en repositorios grandes, explicar funciones complejas o sugerir optimizaciones, con la ventaja de mantener el contexto completo del proyecto.
- **Simulación de roleplay**: en aplicaciones de juegos de rol o chatbots, el modelo puede mantener personajes coherentes y avanzar la narrativa durante sesiones largas.
- **Análisis de datos científicos**: para investigadores que necesitan procesar papers extensos o resumir resultados de experimentos, el modelo puede extraer conclusiones y comparar metodologías.
- **Traducción y adaptación**: aunque no está especializado, soporta múltiples idiomas y puede traducir textos largos manteniendo el contexto semántico.

## Benchmarks y rendimiento

La model card incluye métricas de evaluación en tareas de razonamiento de sentido común (ARC, BoolQ, HellaSwag, OBQA, PIQA, WinoGrande) para distintas cuantizaciones. Se muestran los resultados para la cuantización qx86-hi (la del modelo) en configuraciones de 1M y 2M, junto con el modelo base (Qwen3.8-27B "caveman") como referencia.

| Modelo (cuantización) | ARC | ARC-e | BoolQ | HellaSwag | OBQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B (baseline, mxfp8) | 0.591 | 0.782 | 0.896 | 0.746 | 0.448 | 0.801 | 0.711 |
| Qwen3.8-27B-Brainwaves (qx86-hi, 1M) | 0.733 | 0.887 | 0.911 | 0.836 | 0.526 | 0.832 | 0.787 |
| Qwen3.8-27B-Brainwaves (qx86-hi, 2M) | 0.730 | 0.887 | 0.913 | 0.836 | 0.526 | 0.832 | 0.787 |

Perplexidad y rendimiento:

| Cuantización | Perplexidad | Memoria pico | Tokens/seg |
|---|---|---|---|
| qx86-hi (1M) | 3.678 ± 0.022 | 33.21 GB | 171 |
| qx86-hi (2M) | 3.633 ± 0.022 | 26.99 GB | 170 |
| Baseline (mxfp8) | 6.090 ± 0.054 | 34.74 GB | 138 |

Se observa una mejora significativa en todas las tareas respecto al baseline, con menor perplexidad y mayor velocidad, aunque el modelo consume más memoria en configuraciones de 1M.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización qx86-hi, se requiere al menos 33.21 GB de VRAM (para 1M contexto) y 26.99 GB (para 2M). La versión mxfp4 consume 21.30 GB.
- **GPU recomendadas**: A100 40GB, RTX A6000 48GB, o GPUs con 32 GB o más de VRAM. Para cuantizaciones más ligeras (mxfp4) podría caber en una RTX 4090 de 24 GB.
- **Compatibilidad**: está optimizado para MLX (Apple Silicon, por ejemplo MacBook Pro con 128GB), pero también es compatible con Transformers y vLLM.
- **Opciones de despliegue**: se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). La model card indica que es compatible con endpoints de Hugging Face.
- **Latencia y throughput**: con qx86-hi se alcanzan 171 tokens/seg en hardware de alta gama (probablemente un Mac Studio o GPU de 80 GB). La velocidad depende del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura | Benchmark (ARC) |
|---|---|---|---|---|---|
| Qwen3.8-27B (baseline) | 27B (aprox.) | 256K | Apache-2.0 | Denso, híbrido | 0.591 |
| Qwen3.8-27B-Brainwaves (este modelo) | 27B (aprox.) | 256K a 2M | Apache-2.0 | Denso, híbrido | 0.733 |
| Qwen3.6-27B (modelo base) | 27B | 256K | Apache-2.0 | Denso, híbrido | no disponible |

El modelo fusionado mejora notablemente el rendimiento en tareas de razonamiento respecto al Qwen3.8-27B original, gracias a la combinación de modelos especializados. Otros modelos comparables podrían ser Llama-3.1-8B (menor contexto y rendimiento) o Mistral-7B, pero no se dispone de datos de comparación directa en esta información.

## Limitaciones y advertencias

- **Modelo experimental**: no ha sido validado en entornos de producción; se recomienda pruebas exhaustivas antes de uso comercial.
- **Sesgos y alucinaciones**: al ser una fusión de modelos, puede heredar sesgos de los modelos base y presentar alucinaciones en tareas de alta precisión.
- **Limitaciones de idioma**: aunque soporta 4 idiomas, el rendimiento puede variar; no hay datos sobre idiomas no listados.
- **Licencia**: aunque Apache-2.0 permite uso comercial, los modelos base individuales pueden tener restricciones adicionales (verificar cada uno).
- **Contexto largo**: aunque el modelo puede extenderse a 1M o 2M, la calidad puede degradarse en los extremos; se recomienda validar la coherencia.
- **Recursos**: requiere al menos 27 GB de VRAM para las cuantizaciones ligeras; no es adecuado para GPUs de consumo de gama baja.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-1M-qx86-hi-mlx)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (referencia)
- [Página de arquitectura en hfviewer](https://hfviewer.com/nightmedia/Qwen3.8-27B-Brainwaves-mxfp8-mlx)
- [Entrada en LLM Explorer](https://llm-explorer.com/model/nightmedia%2FQwen3.8-27B-Brainwaves,6HnYNHpSJdtEe3z2mXCSrT)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
