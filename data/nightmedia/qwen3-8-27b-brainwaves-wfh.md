# nightmedia/Qwen3.8-27B-Brainwaves-WFH

## Resumen

Qwen3.8-27B-Brainwaves-WFH es un modelo de lenguaje experimental desarrollado por nightmedia, un laboratorio independiente con sede en Montana (EE. UU.). Se trata de una fusión (merge) de tres modelos base de la familia Qwen3.8-27B: `nbeerbower/Wichtel-Qwen3.6-27B`, `armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara` y `nightmedia/Qwen3.8-27B-Brainwaves`. El resultado es un modelo de 27 781 millones de parámetros con arquitectura transformer (qwen3_5_text) y atención por grupos de consultas (GQA), diseñado para tareas de razonamiento, codificación, matemáticas, escritura creativa y conversación multilingüe.

El modelo destaca por su ventana de contexto amplia (hasta 1M de tokens según las etiquetas y la variante `1M` disponible) y por ofrecer múltiples formatos de cuantización (bf16, mxfp8, qx86-hi, qx64-hi, mxfp4) que permiten adaptar el consumo de memoria a distintos entornos de hardware. Su licencia Apache 2.0 lo hace libre para uso comercial y de investigación, lo que lo convierte en una opción atractiva para desarrolladores que buscan un modelo abierto de gran capacidad sin restricciones de uso.

Al ser un merge experimental, no se han publicado detalles sobre el proceso de entrenamiento o ajuste fino más allá de la combinación de los modelos base. La model card incluye métricas de rendimiento en tareas de razonamiento de sentido común y comprensión lectora, junto con datos de memoria y velocidad de inferencia para cada cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer con grouped-query attention) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens (según etiquetas y variante `1M`); también se menciona 256k |
| Tipos de cuantizacion | bf16, mxfp8, qx86-hi, qx64-hi, mxfp4 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en MLX) |

## Arquitectura y entrenamiento

El modelo se construye mediante una fusión (merge) de tres modelos base de 27B parámetros, realizada con la herramienta `mergekit` (según las etiquetas). La arquitectura subyacente es un transformer estándar con 64 capas, tamaño oculto de 5120, 24 cabezas de consulta y 4 cabezas de clave/valor (GQA), y un tamaño intermedio de feed-forward de 17 408, según el visor de arquitectura de Hugging Face. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. Las etiquetas mencionan destilación de modelos como Claude 4.6 y Polaris Alpha, pero no se especifica el procedimiento exacto.

Al ser un merge, el modelo hereda las capacidades de sus componentes: razonamiento, codificación, matemáticas, escritura creativa y soporte multilingüe. La variante `WFH` (Working From Home) se presenta como un experimento para demostrar que es posible crear modelos de alto rendimiento con recursos limitados (un MacBook Pro con 128 GB de RAM, según el autor).

## Capacidades

- Generación de texto y conversación multilingüe (inglés, chino, japonés y español).
- Razonamiento y cadena de pensamiento (chain-of-thought) para tareas complejas.
- Codificación y asistencia en programación.
- Matemáticas y resolución de problemas STEM.
- Escritura creativa: ficción, narrativa, generación de tramas, desarrollo de personajes y roleplaying.
- Comprensión de contexto largo (hasta 1M tokens) para documentos extensos o conversaciones multi-turno.
- El pipeline declarado es `image-text-to-text`, aunque no se detallan capacidades específicas de visión en la model card.

## Casos de uso

- Asistencia en investigación científica: el modelo puede procesar artículos largos y resumir hallazgos gracias a su ventana de contexto de 1M tokens, facilitando revisiones bibliográficas y análisis de documentos técnicos.
- Generación de código en entornos de desarrollo: con soporte para razonamiento y codificación, puede ayudar a escribir funciones, depurar errores o explicar fragmentos de código en varios lenguajes.
- Escritura creativa y narrativa: su entrenamiento en ficción y storytelling permite generar historias, tramas y diálogos coherentes, útil para autores, guionistas o creadores de contenido.
- Atención al cliente multilingüe: al soportar cuatro idiomas, puede redactar respuestas en inglés, chino, japonés y español, aunque no se ha confirmado soporte de tool calling para integraciones automáticas.
- Análisis de documentos legales o financieros: la capacidad de manejar contextos largos permite procesar contratos, informes o expedientes completos y extraer información relevante.
- Prototipado de agentes conversacionales: su naturaleza instruction-tuned y su capacidad de razonamiento lo hacen adecuado para construir asistentes virtuales o chatbots con personalidad, especialmente en escenarios de roleplaying.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación para el modelo completo (`Brainwaves`) en varias cuantizaciones, junto con métricas de perplexity, memoria pico y velocidad de inferencia. No se proporcionan comparaciones con otros modelos.

| Cuantizacion | ARC | ARC-e | BoolQ | HellaSwag | OBQA | PIQA | WinoGrande | Perplexity | Memoria pico | Tokens/s |
|---|---|---|---|---|---|---|---|---|---|---|
| bf16 | 0.731 | - | - | - | - | - | - | 3.626 ± 0.022 | 60.75 GB | 215 |
| mxfp8 | 0.735 | 0.891 | 0.916 | 0.830 | 0.526 | 0.832 | 0.800 | 3.673 ± 0.022 | 34.74 GB | 170 |
| qx86-hi | 0.730 | 0.887 | 0.914 | - | - | - | - | 3.623 ± 0.022 | 33.25 GB | 174 |
| qx64-hi | 0.727 | 0.886 | 0.914 | - | - | - | - | 3.647 ± 0.022 | 27.03 GB | 174 |
| mxfp4 | 0.730 | 0.888 | 0.917 | - | - | - | - | 3.745 ± 0.023 | 21.30 GB | 179 |

Los valores de ARC, ARC-e, BoolQ, HellaSwag, OBQA, PIQA y WinoGrande corresponden a precisión (accuracy). Los guiones indican que no se reportaron datos para esa cuantización en la model card.

## Requisitos de hardware

- Inferencia en bf16: requiere aproximadamente 61 GB de memoria pico, por lo que necesita una GPU profesional como A100 (80 GB) o H100.
- Inferencia en mxfp8: ~35 GB de memoria, compatible con GPUs de 40 GB como A100 (40 GB) o RTX A6000.
- Inferencia en qx64-hi: ~27 GB, cabe en GPUs de 32 GB como V100 o A100 (40 GB) con margen.
- Inferencia en mxfp4: ~21 GB, puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Existe una variante específica para Apple Silicon (MLX) con cuantización mxfp4, que según LLM Explorer requiere 27 GB de VRAM (probablemente en formato unificado de memoria).
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, y con formatos safetensors y MLX. Se puede servir con vLLM, TGI u otros frameworks que soporten modelos transformers, aunque no se ha confirmado explícitamente la compatibilidad con llama.cpp.
- Velocidad de inferencia: entre 170 y 215 tokens por segundo según la cuantización, medida en un entorno no especificado.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. El modelo pertenece a la familia Qwen3.8-27B, de la que existen otras variantes como `nightmedia/Qwen3.8-27B-Brainwaves` (el componente principal) o `armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara`, pero no se han publicado métricas comparativas entre ellos. Tampoco se han encontrado referencias a modelos de tamaño similar de otros desarrolladores en los resultados de búsqueda.

## Limitaciones y advertencias

- Modelo experimental: al ser un merge sin un proceso de entrenamiento documentado, su comportamiento puede ser impredecible en ciertos dominios o presentar inconsistencias.
- No se han publicado estudios de sesgos o alucinaciones. Como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- El pipeline declarado es `image-text-to-text`, pero no se especifican capacidades reales de visión. Es probable que el modelo no procese imágenes de forma nativa, a pesar de la etiqueta.
- La ventana de contexto de 1M tokens, aunque amplia, puede requerir una cantidad significativa de memoria durante la inferencia, incluso con cuantización ligera.
- No se ha confirmado soporte para tool calling o function calling, lo que limita su uso en pipelines de agentes que requieran integración con APIs externas.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de otros, es recomendable verificar las licencias de los modelos base originales para asegurar el cumplimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-WFH
- Variante cuantizada MLX: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-WFH-mxfp4-mlx
- Modelo componente `nightmedia/Qwen3.8-27B-Brainwaves`: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves
- Visor de arquitectura: https://hfviewer.com/nightmedia/Qwen3.8-27B-Brainwaves
- Ficha en LLM Explorer: https://llm-explorer.com/model/nightmedia%2FQwen3.8-27B-Brainwaves,6HnYNHpSJdtEe3z2mXCSrT
- Variante 1M qx86-hi MLX en LLM Explorer: https://llm-explorer.com/model/nightmedia%2FQwen3.8-27B-Brainwaves-1M-qx86-hi-mlx,2iZ2zLdX2uciLBrwoTTGaC
