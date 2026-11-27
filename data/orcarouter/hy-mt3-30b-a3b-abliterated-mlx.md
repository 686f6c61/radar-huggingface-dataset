# orcarouter/Hy-MT3-30B-A3B-abliterated-MLX

## Resumen

Hy-MT3-30B-A3B-abliterated-MLX es una conversión al formato MLX del modelo de traducción Hy-MT3-30B-A3B de Tencent, publicada por el usuario orcarouter. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 30.000 millones de parámetros totales y 3.000 millones activos por token, especializado en traducción automática multilingüe y adaptado para ejecutarse de forma local en hardware Apple Silicon mediante la librería mlx-lm. La variante "abliterated" implica que se han eliminado o atenuado las capas de rechazo del modelo original, lo que da lugar a una versión sin censura ("uncensored") de la que no se documentan los detalles del procedimiento.

El modelo cubre un conjunto muy amplio de idiomas (más de 90 códigos ISO en las etiquetas), incluyendo pares de alta y baja recursos como chino, inglés, español, árabe, hindi, swahili, criollo haitiano, cebuano o yidis. Su formato MLX con cuantización de precisión mixta y GPTQ está pensado para inferencia en Macs con chip de la serie M, no para GPUs NVIDIA. El repositorio ocupa 37,4 GB y el acceso está restringido: es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de traducción MoE de gran tamaño, una variante sin censura y un empaquetado nativo para Apple Silicon. No obstante, al ser una publicación de un tercero sin documentación técnica publicada, muchos datos de entrenamiento, benchmarks y comportamiento real no están disponibles y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, según el modelo base tencent/Hy-MT3-30B-A3B |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta y GPTQ (según etiquetas del repo); niveles concretos de bits no disponibles |
| Idiomas soportados | Más de 90 idiomas, entre ellos zh, en, es, de, fr, it, pt, ru, ar, hi, ja, ko, vi, th, id, tr, nl, pl, uk, fa, ur, sw, yo, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (mlx-lm) |
| Modelo base | tencent/Hy-MT3-30B-A3B |
| Tarea | Traducción automática (pipeline: translation) |
| Hardware objetivo | Apple Silicon (etiqueta apple-silicon, local) |
| Acceso | Restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

La arquitectura es una Mixture of Experts con 30B parámetros totales y 3B activos, heredada del modelo base tencent/Hy-MT3-30B-A3B. Esto implica que, aunque el modelo completo requiere cargar 30B parámetros en memoria, el coste computacional por token es el de un modelo de 3B, lo que reduce la latencia y el consumo energético en inferencia. La conversión a MLX aplica cuantización de precisión mixta y GPTQ para reducir el peso del repositorio a 37,4 GB y permitir su ejecución en Macs con memoria unificada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las innovaciones técnicas específicas del modelo base en la información proporcionada. Tampoco se documenta el procedimiento de "abliteration" aplicado por orcarouter, ni qué capas o direcciones de activación se modificaron para eliminar los rechazos. Esta ausencia de documentación es relevante: sin ella no es posible evaluar el impacto del proceso sobre la calidad de traducción ni sobre la estabilidad del modelo.

## Capacidades

- Traducción automática multilingüe entre más de 90 idiomas, incluyendo pares de baja recursos (cebuano, waray, yidis, gaélico escocés, etc.).
- Generación de texto en el idioma de destino, no solo traducción literal, al ser un modelo generativo.
- Inferencia local en Apple Silicon mediante mlx-lm, sin necesidad de GPU dedicada.
- Ejecución con cuantización de precisión mixta, lo que permite cargar el modelo en equipos con memoria unificada limitada.
- Variante "abliterated" orientada a eliminar rechazos en la generación, lo que puede facilitar contenido que el modelo original bloquearía.
- Soporte de múltiples pares de idiomas en una sola sesión, sin cambiar de modelo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede traducir manuales y guías entre los más de 90 idiomas soportados, con la ventaja de ejecutarse localmente en un Mac sin enviar datos a la nube.
- Localización de aplicaciones para mercados de baja recursos: pares como inglés-cebuano, inglés-waray o inglés-yidis son poco frecuentes en modelos comerciales, y este modelo los cubre de forma nativa.
- Procesamiento de textos confidenciales: al ejecutarse en hardware local con MLX, permite traducir contratos, informes médicos o comunicaciones internas sin salir del dispositivo.
- Investigación lingüística comparada: la amplitud de idiomas permite estudiar fenómenos de traducción en familias lingüísticas diversas con un único modelo y sin dependencia de APIs.
- Generación de subtítulos y doblaje: la traducción multilingüe combinada con generación de texto puede alimentar pipelines de subtitulado para vídeo en varios idiomas.
- Prototipado de asistentes de traducción en tiempo real en macOS: gracias a la integración con mlx-lm y a los 3B parámetros activos, es viable una latencia baja en un MacBook con chip M.
- Traducción de contenido generado por usuarios en foros y redes: el modelo puede gestionar entradas cortas y ruidosas en muchos idiomas, útil para moderación y accesibilidad multilingüe.
- Evaluación de modelos sin censura en tareas de traducción sensible: la variante abliterated permite estudiar cómo afecta la eliminación de rechazos a la fidelidad de la traducción en textos polémicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 37,4 GB en cuantización de precisión mixta y GPTQ; se recomienda un Mac con al menos 48 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime de MLX. Con 64 GB o más el margen es mayor.
- GPU recomendadas: no aplica GPU NVIDIA; el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y superiores).
- ¿Cabe en consumer GPU? No en el sentido habitual: no es un formato para GPUs NVIDIA o AMD de consumo. En Apple Silicon, sí es viable en configuraciones de gama alta (Mac Studio, MacBook Pro con 48-128 GB).
- Opciones de despliegue: mlx-lm (librería nativa), y potencialmente herramientas compatibles con MLX como mlx-lm.server para exponer una API compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponibles. Al tener 3B parámetros activos, se espera una latencia inferior a la de un modelo denso de 30B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-abliterated-MLX (este) | 30B totales / 3B activos | no disponible | Apache 2.0 | MLX safetensors | Gated en HF |
| tencent/Hy-MT3-30B-A3B (base) | 30B totales / 3B activos | no disponible | Apache 2.0 | safetensors (transformers) | Público en HF |
| Modelos de traducción densos de 7B-13B (p. ej., NLLB, M2M-100) | 7B-13B | variable | variables (a menudo CC-BY-NC) | safetensors, GGUF | Públicos |

La comparación directa con alternativas concretas no está disponible en la información proporcionada. El modelo base de Tencent es la referencia más directa, ya que esta publicación es una conversión y modificación del mismo. Frente a modelos de traducción densos más pequeños, la ventaja de este MoE es la amplitud de idiomas y el coste computacional reducido por token, a cambio de un mayor requisito de memoria.

## Limitaciones y advertencias

- La variante "abliterated" elimina o atenúa los rechazos del modelo original, lo que puede producir contenido inapropiado, ofensivo o inexacto en contextos sensibles; no se documenta el método ni su impacto en la calidad.
- No se han publicado benchmarks ni evaluaciones independientes de esta conversión MLX, por lo que su calidad de traducción real es desconocida.
- El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el proceso de abliteration pueden introducir obligaciones o riesgos no documentados; conviene revisar las condiciones del modelo base de Tencent.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a GPUs NVIDIA, servidores x86 con GPU ni a la mayoría de infraestructuras cloud estándar.
- Riesgo de alucinación y de traducciones infieles en idiomas de bajos recursos, especialmente en pares sin evaluación publicada.
- No se documenta la longitud de contexto, lo que impide planificar su uso en documentos largos sin pruebas empíricas.
- La fecha de creación del repositorio (2026-11-26) y la ausencia de descargas o likes sugieren que es una publicación muy reciente y sin validación comunitaria.
- El proceso de cuantización de precisión mixta y GPTQ puede degradar la calidad respecto al modelo base en formato completo; no hay comparación publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/Hy-MT3-30B-A3B-abliterated-MLX
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentación de MLX: https://ml-explore.github.io/mlx/
