# mradermacher/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones en formato GGUF del modelo `Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic`, publicado por el usuario xtools-at y convertido a GGUF por mradermacher. Se trata de un modelo derivado de la familia Qwen 3.5 con 4B de parámetros nominales, resultado de un proceso de multi-destilación y fusión (merge) de tres variantes, con un ajuste orientado a eliminar restricciones de rechazo ("uncensored") y aplicar la técnica "heretic" de ablación de direcciones de rechazo. El repositorio ofrece únicamente los pesos cuantizados, no el modelo base ni la model card original.

La relevancia de esta ficha es limitada pero concreta: permite ejecutar un modelo de ~4B en hardware de consumo mediante cuantizaciones que van desde IQ1_S hasta Q6_K, cubriendo un rango amplio de compromisos entre calidad y tamaño. Sin embargo, la información pública disponible es extremadamente escasa: no hay pipeline declarado, no hay licencia especificada, no hay idiomas declarados y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente y sin validación comunitaria.

El dato de "parámetros totales" reportado en safetensors (1.797.272) es inconsistente con el nombre del modelo (4B) y probablemente refleja solo una parte de los tensores o un error de metadatos; se indica como no disponible un recuento fiable. Cualquier uso en producción debe hacerse con cautela extrema y validación propia, dado que no hay benchmarks, ni model card sustantiva, ni garantías de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen 3.5, presumiblemente transformer decoder-only; no confirmado en la informacion) |
| Parametros totales | no disponible de forma fiable (el nombre indica 4B; el campo safetensors reporta 1.797.272, inconsistente) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo origen se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su nombre, que sugiere una base Qwen 3.5 de 4B parámetros. El sufijo "MultiDistill-3xMerge" indica que el modelo se obtuvo mediante destilación múltiple (probablemente de varios profesores) y posterior fusión de tres variantes, una técnica habitual para combinar capacidades de distintos fine-tunes sin entrenamiento adicional extensivo. El sufijo "UNCENSORED-heretic" sugiere la aplicación de la técnica "heretic", que consiste en identificar y ablacionar direcciones en el espacio de activaciones asociadas a comportamientos de rechazo, reduciendo la tasa de negativas del modelo ante peticiones que considera sensibles.

No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El repositorio es únicamente de cuantización: el autor mradermacher aplica cuantización con imatrix/weighted a partir del modelo original de xtools-at, e incluye la etiqueta "nicoboss" en los metadatos internos, sin más detalle técnico.

## Capacidades

- Generación de texto autoregresiva (presumiblemente, dado el formato GGUF y la base Qwen).
- Razonamiento y matemáticas: no confirmado por benchmarks ni model card.
- Generación de código: no confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo "thinking": no disponible.
- Visión o audio: no disponible.
- Comportamiento "uncensored"/"heretic": el nombre indica reducción de rechazos, pero no hay documentación de qué comportamientos se han ablacionado ni con qué metodología exacta.

## Casos de uso

- Experimentación local en hardware de consumo: las cuantizaciones IQ2/IQ3 permiten ejecutar un modelo de ~4B en GPUs con 4-6 GB de VRAM o incluso en CPU, útil para pruebas de concepto y prototipado rápido sin infraestructura dedicada.
- Investigación sobre alineación y rechazo: el ajuste "heretic" lo hace interesante para estudiar cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo, comparándolo con la versión base no modificada.
- Evaluación de técnicas de fusión de modelos: el sufijo "3xMerge" permite analizar empíricamente si la fusión de tres variantes destiladas preserva capacidades frente al modelo original.
- Generación de texto creativo sin filtros: para usuarios que necesitan un modelo que no rechace ciertos temas en escritura de ficción, con la advertencia de que la falta de validación comunitaria implica riesgo de salidas de baja calidad.
- Benchmarking de cuantizaciones GGUF: el repositorio ofrece 24 variantes de cuantización, lo que permite medir el impacto de cada nivel en perplejidad y velocidad sobre el mismo modelo base.
- Despliegue en entornos con recursos limitados mediante llama.cpp u Ollama: al ser GGUF, se integra directamente en estas herramientas para inferencia en CPU o GPU híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~4B parámetros, las cuantizaciones IQ1_S/IQ2_XXS ocupan aproximadamente 1,5-2 GB; Q4_K_M alrededor de 2,5-3 GB; Q6_K en torno a 3,5-4 GB. Estas cifras son estimaciones basadas en el tamaño nominal de 4B, no en mediciones del repositorio.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las cuantizaciones mayores con contexto largo; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, prácticamente todas las cuantizaciones caben en GPUs con 6-8 GB de VRAM; las más pequeñas incluso en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponibles; dependerán fuertemente de la cuantización, el hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic (i1-GGUF) | ~4B (nominal) | no disponible | no disponible | GGUF | Sin benchmarks ni validación comunitaria |
| Qwen 2.5 3B Instruct (referencia de la familia) | 3B | 32k (típico) | Apache 2.0 (típico en Qwen) | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Llama 3.2 3B Instruct | 3B | 128k | Llama 3.2 Community License | safetensors, GGUF | Amplia adopción y tooling |
| Gemma 2 2B | 2B | 8k | Gemma Terms of Use | safetensors, GGUF | Buen rendimiento por tamaño |

La comparación es aproximada: el modelo de esta ficha no declara licencia, contexto ni benchmarks, por lo que no puede evaluarse objetivamente frente a alternativas oficiales.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo origen.
- Sin model card sustantiva ni benchmarks: imposible verificar calidad, sesgos o capacidades reales.
- El ajuste "uncensored/heretic" reduce rechazos, lo que aumenta el riesgo de generar contenido dañino, sesgado o inexacto sin salvaguardas.
- Riesgo elevado de alucinación no cuantificado.
- Contexto e idiomas no declarados: no se puede planificar su uso multilingüe ni con ventanas largas.
- Metadatos inconsistentes (parámetros reportados vs. nombre) que indican falta de control de calidad en la publicación.
- 0 descargas y 0 likes: sin validación de la comunidad, sin issues reportados, sin garantía de que los pesos estén íntegros.
- Las cuantizaciones IQ1/IQ2 degradan notablemente la calidad; no recomendadas para producción.
- Fecha de creación futura (2026-11-12) en los metadatos, lo que sugiere posibles errores de publicación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic-i1-GGUF
- Modelo origen (referenciado en la model card): https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
