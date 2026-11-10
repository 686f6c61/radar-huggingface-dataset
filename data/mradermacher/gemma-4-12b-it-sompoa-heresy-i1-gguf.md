# mradermacher/gemma-4-12B-it-SOMPOA-heresy-i1-GGUF

## Resumen

`mradermacher/gemma-4-12B-it-SOMPOA-heresy-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo base `MuXodious/gemma-4-12B-it-SOMPOA-heresy`. El nombre sugiere un derivado de la familia Gemma 4 de 12B parámetros en su variante instruction-tuned, sometido a algún proceso de ajuste denominado "SOMPOA-heresy", pero la información disponible no permite confirmar la naturaleza exacta de ese ajuste ni su procedencia.

El repositorio contiene exclusivamente ficheros de pesos cuantizados en formato GGUF con distintos niveles de compresión (desde IQ1_S hasta Q6_K), lo que lo hace apto para inferencia en CPU y GPU de consumo mediante llama.cpp u Ollama. No incluye pesos en safetensors ni documentación técnica propia más allá de los metadatos de cuantización.

La relevancia de este repositorio es limitada y de nicho: se trata de un artefacto derivado sin model card descriptiva, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Cualquier evaluación seria del modelo debe remitirse al repositorio original de MuXodious, del que este es una mera conversión de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only de la familia Gemma) |
| Parametros totales | no disponible (el dato de 3.719.336 en safetensors del repo no es coherente con un modelo de 12B y probablemente corresponde a un fichero auxiliar o a un error de metadatos) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El identificador `gemma-4-12B-it` sugiere una variante instruction-tuned de la familia Gemma 4 con 12.000 millones de parámetros, pero no se confirma en la información proporcionada. El sufijo `SOMPOA-heresy` apunta a un ajuste fino o modificación no documentada realizada por el usuario MuXodious, cuya metodología, datos de entrenamiento y objetivos se desconocen.

Las cuantizaciones de este repositorio se han generado con el pipeline `i1` de mradermacher, que emplea matrices de importancia (imatrix) para preservar mejor la calidad en niveles de compresión agresivos. Los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversión se realizó desde pesos en formato Hugging Face. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo base.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Por el identificador `it` (instruction-tuned) se presume capacidad de seguir instrucciones y mantener conversaciones multi-turno, pero no se confirma.
- No se confirma soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento extendido.
- El soporte multilingüe es desconocido; los idiomas no están declarados en los metadatos.
- La única capacidad verificable es la de ser ejecutable en llama.cpp y entornos compatibles con GGUF.

## Casos de uso

- Evaluación local de cuantizaciones: el repositorio permite comparar la degradación de calidad entre los 24 niveles de cuantización disponibles (desde IQ1_S hasta Q6_K) sobre el mismo modelo base, útil para estudiar el impacto de la compresión en tareas concretas.
- Despliegue en hardware de consumo: las variantes Q4_K_M y Q5_K_M permiten ejecutar un modelo de presumiblemente 12B parámetros en GPUs con 8-12 GB de VRAM, aunque el rendimiento real no está verificado.
- Experimentación con modelos derivados: investigadores interesados en el ajuste "SOMPOA-heresy" pueden usar estas cuantizaciones para probar el modelo sin descargar los pesos completos en precisión nativa.
- Pruebas de inferencia en CPU: las variantes IQ2 e IQ3 permiten ejecutar el modelo en equipos sin GPU dedicada mediante llama.cpp, a costa de una pérdida de calidad no cuantificada.
- Integración en pipelines de prototipado con Ollama: los ficheros GGUF son directamente importables en Ollama para pruebas rápidas de generación de texto, siempre que se acepte la ausencia de garantías sobre el comportamiento del modelo.
- Análisis de artefactos de la comunidad: el repositorio sirve como caso de estudio de prácticas de cuantización comunitaria (imatrix, niveles IQ) y de los riesgos de publicar derivados sin model card ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no verificada. Como referencia teórica para un modelo de 12B parámetros en GGUF, Q4_K_M ocuparía aproximadamente 7-8 GB, Q5_K_M en torno a 8-9 GB, Q6_K cerca de 10 GB e IQ2/IQ1 entre 4 y 5 GB, pero estas cifras no están confirmadas para este repositorio concreto.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían alojar las cuantizaciones altas con comodidad; una RTX 4060 Ti de 16 GB o una RTX 4070 de 12 GB podrían alojar Q4/Q5; A100 y H100 son sobredimensionadas para este tamaño.
- Compatibilidad con GPU de consumo: probable en modelos con 8 GB o más de VRAM para cuantizaciones Q4 e inferiores, no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-12B-it-SOMPOA-heresy-i1-GGUF | no disponible (presumiblemente ~12B) | no disponible | no disponible | GGUF | Cuantizaciones de un derivado no documentado |
| MuXodious/gemma-4-12B-it-SOMPOA-heresy | no disponible | no disponible | no disponible | presumiblemente safetensors | Modelo base del que derivan estas cuantizaciones |
| Gemma 4 12B IT (original de Google) | ~12B (no confirmado en la información) | no disponible | no disponible | safetensors, GGUF | Modelo de referencia de la familia, sin el ajuste "SOMPOA-heresy" |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoría. La comparativa se limita a la relación de derivación entre repositorios.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción de arquitectura, datos de entrenamiento, intenciones del ajuste "SOMPOA-heresy" ni evaluación de capacidades.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido. Tratar como no apto para producción hasta verificarlo en el repositorio original.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Metadatos incoherentes: el campo de parámetros totales (3.719.336) no cuadra con un modelo de 12B, lo que sugiere un error de metadatos o la presencia de ficheros auxiliares; no debe tomarse como especificación fiable.
- Sin benchmarks: no hay evidencia publicada de MMLU, HumanEval, GSM8K ni ninguna otra métrica.
- Riesgo de alucinación y sesgos: desconocidos, pero inherentes a cualquier modelo de lenguaje sin evaluación documentada.
- Cuantizaciones agresivas (IQ1, IQ2): la degradación de calidad en estos niveles puede ser severa y no está medida para este modelo.
- Procedencia del ajuste: "SOMPOA-heresy" no es un método reconocido públicamente; su efecto sobre el comportamiento del modelo es impredecible.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-12B-it-SOMPOA-heresy-i1-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/MuXodious/gemma-4-12B-it-SOMPOA-heresy
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
