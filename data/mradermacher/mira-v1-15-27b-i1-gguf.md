# mradermacher/Mira-v1.15-27B-i1-GGUF

## Resumen

Mira-v1.15-27B-i1-GGUF es una colección de cuantizaciones GGUF del modelo base Lambent/Mira-v1.15-27B, preparadas por mradermacher con la técnica imatrix (importance matrix). El modelo original es un LLM de 27 009 007 616 parámetros (aproximadamente 27B) con licencia Gemma, orientado a conversación y con capacidades de visión (según el README, los archivos mmproj se encuentran en el repositorio estático). Esta versión cuantizada permite ejecutar el modelo en hardware con recursos limitados, ofreciendo múltiples niveles de compresión que van desde IQ1_S (6,4 GB) hasta Q6_K (22,3 GB).

La relevancia de esta ficha radica en que proporciona una vía práctica para desplegar un modelo de 27B en entornos de consumo o servidores con VRAM moderada, manteniendo un equilibrio entre calidad y requisitos de hardware. Sin embargo, la información pública disponible sobre el modelo base es escasa, por lo que esta ficha se centra en los aspectos técnicos de la cuantización y en las advertencias necesarias para su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 009 007 616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna (transformer, MoE, etc.) ni sobre el proceso de entrenamiento del modelo base Lambent/Mira-v1.15-27B. El README del repositorio de cuantización no proporciona detalles técnicos adicionales. Se recomienda consultar la documentación del modelo original en Hugging Face para obtener datos sobre arquitectura, dataset y metodología de entrenamiento.

## Capacidades

- Modelo conversacional (etiqueta `conversational` en Hugging Face).
- Modelo de visión: el README indica que es un modelo de visión, aunque los archivos mmproj (proyección multimodal) no se incluyen en este repositorio, sino en el repositorio estático (`mradermacher/Mira-v1.15-27B-GGUF`).
- Soporte de idioma: únicamente inglés declarado.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso u otras capacidades específicas.

## Casos de uso

No se dispone de información suficiente en la documentación proporcionada para describir casos de uso concretos y realistas. Se recomienda evaluar el modelo base Lambent/Mira-v1.15-27B directamente para determinar sus capacidades y aplicaciones prácticas. Esta ficha se limita a la capa de cuantización, que no altera las funcionalidades del modelo original, solo su representación numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo ni para sus cuantizaciones.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida y del método de ejecución (GPU, CPU o mixto). A continuación se indican estimaciones orientativas basadas en el tamaño de los archivos GGUF y en prácticas habituales de inferencia:

- Para cuantizaciones de baja precisión (i1-IQ1_S, 6,4 GB): se puede ejecutar en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) o en CPU con al menos 8 GB de RAM libre.
- Para cuantizaciones medias (i1-Q4_K_M, 16,6 GB): se recomienda una GPU con 16-24 GB de VRAM (RTX 4090, A5000, etc.) o CPU con 32 GB de RAM.
- Para cuantizaciones altas (i1-Q6_K, 22,3 GB): se necesita una GPU con 24 GB o más (A100, H100, RTX 4090 con offload) o CPU con 48 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF (por ejemplo, llama-cpp-python, text-generation-webui).
- La latencia y el throughput dependen fuertemente del hardware y de la cuantización; no se dispone de mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (27B, licencia Gemma, cuantización GGUF). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad respecto al modelo original en precisión completa. Los quants de menor tamaño (IQ1_S, IQ1_M) son de calidad muy baja y solo aptos para pruebas extremas.
- El modelo base tiene licencia Gemma, que permite uso comercial pero impone restricciones sobre usos prohibidos (por ejemplo, actividades ilegales, generación de contenido dañino). Es responsabilidad del usuario revisar los términos completos de la licencia.
- El idioma declarado es únicamente inglés; el rendimiento en otros idiomas puede ser deficiente.
- Al ser un modelo de visión, es necesario descargar el archivo mmproj correspondiente desde el repositorio estático para habilitar la entrada de imágenes. Este repositorio no lo incluye.
- No se ha encontrado información sobre sesgos, alucinaciones o limitaciones específicas del modelo base en la documentación proporcionada.
- Para uso en producción, se recomienda validar el comportamiento del modelo con datos reales y considerar la posibilidad de ejecutar pruebas de robustez.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Mira-v1.15-27B-i1-GGUF
- Modelo base: https://huggingface.co/Lambent/Mira-v1.15-27B
- Repositorio estático (cuantizaciones sin imatrix y mmproj): https://huggingface.co/mradermacher/Mira-v1.15-27B-GGUF
- Página de descarga y vista general: https://hf.tst.eu/model#Mira-v1.15-27B-i1-GGUF
