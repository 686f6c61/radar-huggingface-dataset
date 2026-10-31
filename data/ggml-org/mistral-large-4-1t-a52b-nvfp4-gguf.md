# ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF

## Resumen

Mistral Large 4 (NVFP4) en formato GGUF es una cuantización publicada por el equipo de ggml-org del modelo insignia Mistral Large 4 de Mistral AI, un modelo de mezcla de expertos (MoE) de aproximadamente 1 billón (1T) de parámetros totales, con unos 52.000 millones de parámetros activos por token. El modelo original es multimodal (acepta entrada de imagen y texto) y cuenta con una ventana de contexto de 1 millón de tokens, lo que lo sitúa entre los modelos abiertos más grandes y ambiciosos disponibles hasta la fecha.

Esta versión concreta, `ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF`, mantiene los expertos enrutados en el formato NVFP4 original de Mistral sin re-cuantización, mientras que las capas que estaban en FP8 (atención, proyección de consulta del indexador, expertos compartidos y la primera capa densa) se almacenan sin pérdida en BF16. Incluye además una cabeza de borrador DSpark para decodificación especulativa y el proyector multimodal (mmproj) para la entrada de imágenes.

Su relevancia actual radica en que permite ejecutar un modelo de escala masiva con calidad cercana a la cuantización original, junto con una variante hermana en K-quants (de Q8_0 a IQ2_XXS) para configuraciones con menos memoria. El razonamiento se controla mediante el parámetro `reasoning_effort` (low, medium, high) y no puede desactivarse por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) multimodal, con indexador de expertos y decodificación especulativa DSpark |
| Parametros totales | 1.049.357.420.064 (~1,05T) |
| Parametros activos | ~52B (128 expertos enrutados, 4 activos por token, más 1 experto compartido) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, sin re-cuantización) + BF16 para atención, expertos compartidos, primera capa densa y componentes multimodales; existe variante hermana con K-quants de Q8_0 a IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | mistral-ecosystem-open-weight-license (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Mistral Large 4 es un transformer de mezcla de expertos con 128 expertos enrutados de los que se activan 4 por token, más 1 experto compartido, lo que da lugar a unos 52.000 millones de parámetros activos sobre un total de ~1T. Incorpora un mecanismo de indexador para el enrutamiento de expertos (la proyección de consulta del indexador se guarda en BF16 en esta cuantización) y un codificador de visión (mmproj de ~3,4 GB) que habilita la entrada de imágenes junto al texto.

Esta versión GGUF añade una innovación destacable: la cabeza de borrador DSpark, compuesta por 3 capas MLA (Multi-head Latent Attention) que proponen 3 tokens a la vez a partir de los estados ocultos del modelo principal, con una ventana deslizante de 2.048 tokens. Esto acelera la inferencia mediante decodificación especulativa sin modelo auxiliar separado. Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la documentación disponible. El modelo genera siempre razonamiento, con profundidad ajustable mediante `reasoning_effort` (low, medium o high, siendo high el valor por defecto). El muestreo recomendado, almacenado en los metadatos del GGUF, es temperature 1.0 y top_p 0.95.

## Capacidades

- Generación de texto conversacional con razonamiento integrado (no desactivable), con profundidad configurable en tres niveles: low, medium y high.
- Comprensión de imágenes (pipeline image-text-to-text) gracias al codificador de visión incluido (mmproj en BF16/F16).
- Contexto extremadamente largo: hasta 1 millón de tokens, adecuado para analizar repositorios completos, documentos extensos o conversaciones muy largas.
- Decodificación especulativa nativa mediante la cabeza DSpark (3 capas MLA, 3 tokens por propuesta, ventana de 2.048 tokens), que mejora el throughput de inferencia.
- Eficiencia de MoE: solo ~52B de parámetros activos por token pese a los ~1T totales, lo que reduce el coste computacional por token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y multi-step reasoning: no disponible explícitamente, aunque el razonamiento por defecto sugiere orientación a tareas complejas.

## Casos de uso

- Análisis de bases de código completas: con 1M de tokens de contexto, el modelo puede ingerir repositorios enteros para tareas de revisión de código, refactorización asistida o generación de documentación técnica global.
- Procesamiento de documentos extensos: análisis de contratos, expedientes regulatorios o literatura científica de cientos de páginas en una sola pasada, sin fragmentación ni pérdida de contexto entre bloques.
- Comprensión multimodal de documentos: combinando la entrada de imagen con el contexto largo, resulta adecuado para extraer información de PDFs escaneados, informes con gráficos o capturas de interfaces.
- Razonamiento profundo ajustable: en tareas de matemáticas, planificación o resolución de problemas complejos, se puede subir `reasoning_effort` a high; para respuestas rápidas en producción, reducirlo a low.
- Investigación en inferencia eficiente: la combinación de NVFP4 en expertos, decodificación especulativa DSpark y arquitectura MoE lo convierte en un banco de pruebas interesante para estudiar serving de modelos de escala extrema.
- Asistentes conversacionales de gama alta: la naturaleza conversacional del modelo y su ventana de 1M de tokens permiten mantener historiales de conversación muy largos sin gestión externa de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/disco estimado: el archivo NVFP4 principal ocupa 619 GB, y el repositorio completo 630,5 GB (incluyendo DSpark de 4,2 GB y mmproj de 3,4 GB). Para inferencia práctica se necesita del orden de 620-640 GB de memoria de GPU (o una combinación de GPU, CPU y offload a disco).
- GPU recomendadas: clústeres de aceleradores de centro de datos con memoria agregada en el rango de ~640 GB, por ejemplo 8x H100 NVL (94 GB cada una) o 8x H200 (141 GB cada una, con margen), o configuraciones multi-nodo con A100/H100.
- Consumer GPUs: no es viable ejecutar el modelo completo en GPUs de consumo; incluso con offload a CPU/disco, el tamaño de 619 GB lo hace impracticable en estaciones de trabajo convencionales. Para hardware más modesto, la variante hermana con K-quants (IQ2_XXS) reduce el footprint, aunque sigue siendo muy exigente.
- Opciones de despliegue: el despliegue documentado es mediante la herramienta `llama` (llama.cpp) con el comando `llama serve -hf ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF:NVFP4`, o vía https://llama.app. No se menciona soporte en vLLM, TGI u Ollama para esta cuantización concreta.
- Latencia y throughput: no disponibles; la decodificación especulativa DSpark (3 tokens por propuesta) está diseñada para mejorar la velocidad de generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mistral Large 4 (NVFP4 GGUF) | ~1,05T | ~52B | 1M tokens | NVFP4 + BF16 | mistral-ecosystem-open-weight-license | GGUF público en HuggingFace |
| Mistral Large 4 (K-quants GGUF) | ~1,05T | ~52B | 1M tokens | Q8_0 a IQ2_XXS (desde FP8) | mistral-ecosystem-open-weight-license | GGUF público en HuggingFace |
| Mistral Large 4 (FP8, release oficial) | ~1,05T | ~52B | 1M tokens | FP8 + BF16 | mistral-ecosystem-open-weight-license | safetensors públicos en HuggingFace |

Alternativas de otros fabricantes de escala comparable no se incluyen porque no hay información disponible en la documentación proporcionada para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El razonamiento no puede desactivarse: el modelo siempre genera razonamiento, lo que aumenta la latencia y el consumo de tokens incluso en tareas simples; solo se puede ajustar la profundidad (low/medium/high).
- El tamaño de 619 GB hace inviable el despliegue en hardware de consumo o de oficina; se requiere infraestructura de centro de datos o aceptar una degradación severa de velocidad con offload.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no se publican evaluaciones específicas; como en cualquier LLM de gran escala, debe asumirse riesgo de alucinación y validarse las salidas en producción.
- Limitaciones de idioma: los idiomas soportados no están documentados en la ficha disponible.
- Licencia: se trata de la mistral-ecosystem-open-weight-license, una licencia de tipo "other" con condiciones propias; debe revisarse el texto completo en el enlace del LICENSE antes de cualquier uso comercial.
- El uso de NVFP4 sin re-cuantización preserva la calidad de la release original en los expertos, pero las capas FP8 convertidas a BF16 y la propia cuantización a 4 bits pueden introducir diferencias medibles respecto a la versión BF16/FP8 oficial; no hay benchmarks publicados para cuantificarlo.
- La ventana especulativa de DSpark (2.048 tokens) limita la eficacia de la decodificación especulativa en contextos muy por encima de ese umbral.

## Enlaces

- Repositorio GGUF NVFP4: https://huggingface.co/ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF
- Modelo base (Mistral AI, NVFP4): https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Release oficial FP8 de Mistral: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- GGUF en K-quants (FP8, de BF16 a IQ2_XXS): https://huggingface.co/ggml-org/Mistral-Large-4-1T-A52B-GGUF
- Texto de la licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4/blob/main/LICENSE
- Herramienta de ejecución: https://llama.app
