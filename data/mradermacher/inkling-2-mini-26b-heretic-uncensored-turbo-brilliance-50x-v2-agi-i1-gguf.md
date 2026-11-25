# mradermacher/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-i1-GGUF

## Resumen

Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI es un modelo de lenguaje de 26.070.385.152 parámetros (aproximadamente 26B) publicado por el usuario DavidAU y cuantizado en formato GGUF por mradermacher. Se trata de un modelo derivado y ajustado a partir de una base no especificada en la información disponible, con un nombre que indica una orientación "uncensored" (sin censura) y una serie de modificaciones acumuladas ("Turbo", "Brilliance-50X", "V2", "AGI") cuyo significado técnico concreto no se documenta en la model card.

El repositorio es exclusivamente una colección de cuantizaciones GGUF generadas con imatrix a partir del modelo original en pesos completos. La model card no incluye información sobre arquitectura, datos de entrenamiento, licencia, idiomas ni benchmarks; únicamente lista los tipos de cuantización disponibles y el enlace al modelo de origen. Por tanto, esta ficha se limita a describir lo verificable y marca como "no disponible" todo aquello que el autor no documenta.

Su relevancia es limitada y de nicho: sirve para usuarios que quieran ejecutar localmente un modelo de 26B con cuantizaciones agresivas (desde IQ1_S hasta Q6_K) mediante llama.cpp u Ollama, pero carece de la documentación mínima para evaluaciones rigurosas o uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo original) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre del repositorio y la model card no indican si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, dimensiones ocultas o cabezas de atención. El dato de parámetros totales (26.070.385.152) procede de los safetensors del modelo original referenciado.

Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación. El sufijo "Heretic-Uncensored" sugiere un ajuste orientado a eliminar restricciones de rechazo, pero no hay detalles técnicos sobre el proceso. La cuantización se ha realizado con imatrix (importance matrix) y quantize_version 2, según los metadatos embebidos en la model card, lo que indica un pipeline estándar de llama.cpp para generar GGUF de alta calidad relativa.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Ejecución local mediante llama.cpp y formatos GGUF compatibles.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere uso a través de servidores de inferencia tipo llama.cpp server u Ollama.
- Orientación "uncensored": el autor indica que el modelo evita restricciones de rechazo, aunque no se documenta el alcance exacto.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas o código.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Experimentación local con modelos de 26B: el abanico de cuantizaciones (desde IQ1_S hasta Q6_K) permite probar el modelo en hardware muy diverso, desde equipos con poca VRAM hasta estaciones con GPU de 24 GB o más.
- Investigación sobre ajustes "uncensored": útil para estudiar el comportamiento de modelos sin alineación de rechazo en entornos controlados de laboratorio.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido narrativo donde el usuario busca respuestas sin rechazos temáticos.
- Pruebas de pipelines de cuantización: el repositorio sirve como referencia para evaluar la degradación de calidad entre distintos niveles de cuantización imatrix sobre un mismo modelo base.
- Despliegue en servidores de inferencia compatibles con GGUF: mediante llama.cpp server u Ollama para prototipos internos.
- Comparación de variantes: permite a investigadores contrastar el comportamiento de las distintas cuantizaciones (Q2 vs Q4 vs Q6) sobre tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de fichero GGUF):
  - IQ1_S / IQ1_M: ~5-7 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~7-9 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: ~10-12 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~12-14 GB
  - IQ4_XS / IQ4_NL: ~14-15 GB
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: ~15-17 GB
  - Q5_K_S / Q5_K_M: ~18-20 GB
  - Q6_K: ~21-23 GB
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4-Q6; A100 40/80 GB o H100 para Q6_K con contexto largo; GPUs de 8-12 GB solo para cuantizaciones IQ1-IQ3.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con IQ3 o inferiores; RTX 4090 con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, llama.cpp server, cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Mini-26B (este) | ~26B | no disponible | no disponible | GGUF |
| Modelos de ~27B densos de referencia (p. ej. Gemma 2 27B) | ~27B | 8K | licencia propia | safetensors, GGUF |
| Modelos de ~24B (p. ej. Mistral Small 24B) | ~24B | 32K-128K | Apache 2.0 | safetensors, GGUF |

La comparación directa no es posible por falta de datos de arquitectura, contexto y benchmarks del modelo evaluado. Los modelos citados se incluyen solo como referencia de categoría por tamaño; no se dispone de datos para afirmar equivalencia de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre arquitectura, entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; se debe consultar el modelo original (DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI) antes de cualquier uso.
- Riesgo de alucinación: no cuantificado; sin benchmarks no hay evidencia de fiabilidad.
- Modelo "uncensored": puede generar contenido sensible, ofensivo o inapropiado; requiere supervisión y filtros externos en cualquier despliegue público.
- Cuantizaciones muy agresivas (IQ1, IQ2): degradación de calidad esperable; no recomendadas para tareas que requieran precisión.
- Sin información sobre sesgos, contexto máximo efectivo ni comportamiento multilingüe.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; considerar como material experimental.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-i1-GGUF
- Modelo original: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
