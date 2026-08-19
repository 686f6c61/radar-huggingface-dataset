# sirus/Qwen3.8-27B-heretic-ara-MIXED-NVFP4-MXFP8-A16

## Resumen

El modelo **sirus/Qwen3.8-27B-heretic-ara-MIXED-NVFP4-MXFP8-A16** es una cuantización mixta de precisión del checkpoint **heretic-org/Qwen3.8-27B-heretic-ara**, un modelo de lenguaje multimodal (texto e imagen) de 27.800 millones de parámetros desarrollado por la comunidad Heretic/AR. Esta versión, creada por el usuario sirus, aplica una compresión híbrida de pesos con formatos NVFP4 (W4A16) y MXFP8 (W8A16), manteniendo las activaciones en BF16, lo que reduce el tamaño del checkpoint a aproximadamente 21,9 GiB (una compresión de 2,36× frente al BF16 completo).

La relevancia de este modelo radica en que ofrece una alternativa desplegable en GPU de consumo y centros de datos con memoria limitada, sin sacrificar la torre de visión ni el módulo de decodificación especulativa MTP (Multi-Token Prediction), que permanecen íntegros en BF16. Está pensado para entornos de producción con vLLM y soporte de kernels Marlin específicos para Blackwell, y mantiene la licencia Apache-2.0 del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) con torre de visión y drafter MTP, basado en Qwen3.8 (familia Qwen3.5) |
| Parametros totales | 27.781.427.952 (fuente, incluyendo MTP y visión); 19.643.141.360 almacenados en safetensors |
| Parametros activos | No disponible (no se especifica si es MoE; se asume denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (W4A16) en 218 módulos, MXFP8 (W8A16) en 183 módulos; activaciones en BF16 |
| Idiomas soportados | No disponible (el nombre sugiere soporte árabe, pero no se confirma) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con cuantización mixta (NVFP4/MXFP8) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal que combina un codificador de visión (vision tower) con un modelo de lenguaje de 27.800 millones de parámetros. Incluye un módulo MTP (Multi-Token Prediction) que actúa como drafter para decodificación especulativa, permitiendo generar varios tokens por paso. La cuantización mixta se ha realizado con NVIDIA ModelOpt, utilizando un corpus de calibración determinista de 1.048.576 tokens (512 filas × 2.048 tokens) extraído de conjuntos como Nemotron SFT, Math, Code, Science, SWE, Tool Use, Aya y FineWeb-Edu. La asignación de precisión se resolvió mediante un problema de optimización lineal entera mixta (MILP) con un objetivo de 6,00 bits efectivos por peso. El resultado es un promedio de 5,99 BPW en los pesos cuantizados y 6,78 BPW en todo el checkpoint. La torre de visión, el drafter MTP, embeddings y normas se mantienen en BF16.

## Capacidades

- Generación de texto y razonamiento conversacional, incluyendo instrucciones complejas y matemáticas (verificado con un prompt aritmético en árabe que devolvió 391).
- Comprensión de imágenes: el modelo procesa entradas visuales y responde preguntas sobre ellas (en la validación identificó correctamente una iglesia ortodoxa y sus cúpulas doradas).
- Soporte multilingüe: el corpus de calibración incluye datos de Aya Dataset, lo que sugiere cierta capacidad multilingüe, aunque no se detallan los idiomas exactos.
- Decodificación especulativa con MTP: permite acelerar la inferencia generando múltiples tokens por paso, activable en vLLM con `--speculative-config`.
- Compatible con tool use y agentes: el corpus de calibración incluye datos de tool use, lo que indica que el modelo base fue entrenado para llamadas a funciones, aunque no se documenta explícitamente en esta ficha.
- Formato de cuantización optimizado para GPU Blackwell: usa kernels Marlin NVFP4 y MXFP8, lo que maximiza el rendimiento en hardware reciente.

## Casos de uso

- **Asistentes virtuales multilingües**: el modelo puede gestionar conversaciones en árabe y otros idiomas, con capacidad de razonamiento matemático y comprensión de contexto, adecuado para chatbots de atención al cliente en regiones de habla árabe.
- **Análisis de documentos con imágenes**: al aceptar entradas visuales, puede extraer información de fotografías, capturas o escaneos, por ejemplo para verificar identidades o leer matrículas.
- **Generación de código asistida**: aunque no se especifica, el corpus incluye código y razonamiento de código, por lo que puede usarse en entornos de desarrollo integrado para autocompletar o explicar fragmentos.
- **Despliegue en producción con vLLM**: su formato cuantizado permite servir el modelo en GPU con 24 GB de VRAM (como RTX 4090 o RTX PRO 6000), usando decodificación especulativa para reducir la latencia en aplicaciones de chat en tiempo real.
- **Investigación en eficiencia de modelos**: al estar disponible con una receta de cuantización reproducible (incluye hashes y scripts de calibración), sirve como referencia para estudiar el impacto de la precisión mixta en tareas multimodales.
- **Sistemas de razonamiento matemático**: su validación con aritmética en árabe lo hace útil para aplicaciones educativas o de cálculo automático en contextos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una prueba de humo: un prompt aritmético en árabe devolvió `391` y una prueba de visión identificó correctamente una iglesia ortodoxa. No hay métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo ocupó 22,68 GiB de memoria GPU en la prueba de carga con vLLM. Para inferencia con contexto largo o batch, se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada en la validación), RTX 4090 (24 GB), A100 40 GB, H100 (80 GB). En GPUs con menos de 24 GB puede ser necesario reducir el contexto o usar cuantización adicional.
- Compatibilidad con consumer GPU: sí, en tarjetas con 24 GB o más (RTX 3090/4090). Para GPUs de 16 GB no se garantiza.
- Opciones de despliegue: vLLM (requiere build con soporte ModelOpt mixed-precision y kernels Marlin), llama.cpp no es compatible directamente por el formato mixto. No se menciona Ollama ni TGI.
- Latencia y throughput: no se proporcionan datos numéricos. La decodificación especulativa con MTP (3 tokens) debería mejorar la velocidad de generación, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas directas. El modelo base (heretic-org/Qwen3.8-27B-heretic-ara) no tiene ficha pública en la información proporcionada, y no se conocen otros checkpoints con la misma cuantización mixta NVFP4/MXFP8. Como referencia general, se podría comparar con Qwen2.5-VL-27B o Llama-3.1-8B, pero no hay datos de rendimiento para establecer una comparación rigurosa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- **Pérdida de precisión por cuantización**: al ser un modelo cuantizado a ~6 bits efectivos, puede haber degradación en tareas de razonamiento complejo o generación de código frente al checkpoint en BF16. No se han publicado evaluaciones que cuantifiquen esta pérdida.
- **Dependencia de vLLM y hardware específico**: el formato mixto requiere una build de vLLM con soporte ModelOpt y kernels Marlin. No funciona con otros runners (llama.cpp, Ollama) sin adaptaciones.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos ambiguos. No se documentan sesgos específicos.
- **Idiomas no confirmados**: aunque el nombre sugiere soporte árabe, la lista de idiomas no está disponible. El corpus de calibración incluye Aya Dataset, pero no se garantiza cobertura completa.
- **Sin benchmarks publicados**: no hay métricas de rendimiento estándar, lo que dificulta evaluar su calidad frente a otros modelos.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (heretic-org) por si tuviera restricciones adicionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sirus/Qwen3.8-27B-heretic-ara-MIXED-NVFP4-MXFP8-A16)
- [Modelo base: heretic-org/Qwen3.8-27B-heretic-ara](https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara)
- [Datasets de calibración](https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v2) (y otros Nemotron, OpenCodeReasoning, Aya, FineWeb-Edu) — referencias en la model card.
