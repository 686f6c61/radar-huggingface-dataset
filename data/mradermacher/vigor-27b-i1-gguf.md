# mradermacher/VIGOR-27B-i1-GGUF

## Resumen

VIGOR-27B-i1-GGUF es una cuantización en formato GGUF del modelo VIGOR-27B, publicada por el usuario mradermacher en Hugging Face. Se trata de una conversión a cuantización de tipo "i1" (imatrix), generada a partir del modelo original prithivMLmods/VIGOR-27B. El repositorio contiene múltiples variantes de cuantización que abarcan desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en hardware con distintos presupuestos de memoria.

El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), según los datos de safetensors. Por los metadatos disponibles y la nomenclatura del ecosistema, el modelo original parece estar orientado a clasificación de imágenes y moderación de contenido multimodal (etiquetas como "Image Classification", "content-safety", "content-moderation", "guardrail", "visual-safety"), aunque esta información proviene de un repositorio hermano (VIGOR-27B-GGUF) y no del repositorio i1 que nos ocupa.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~27B en local mediante llama.cpp y herramientas compatibles, con cuantizaciones que van desde ~3 GB hasta ~22 GB aproximadamente según el nivel elegido. No obstante, la información pública del repositorio es muy escasa: no se declara licencia, idiomas ni pipeline en la ficha de Hugging Face, por lo que muchos datos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base VIGOR-27B; por nomenclatura del ecosistema, probablemente transformer denso, sin confirmar) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (el repositorio hermano VIGOR-27B-GGUF declara English) |
| Licencia | no disponible en este repositorio (el repositorio hermano VIGOR-27B-GGUF declara apache-2.0) |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |
| Tamano del repositorio | 10,9 GB |
| Metodo de cuantizacion | i1 (imatrix), quantize_version 2, output_tensor_quantised 1, convert_type hf |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO en la información proporcionada. El repositorio i1 es únicamente una conversión de pesos: los metadatos indican `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`, lo que confirma que se trata de una cuantización realizada con la herramienta de llama.cpp a partir del modelo en formato Hugging Face.

El aspecto técnico destacable es el uso de cuantización con matriz de importancia (imatrix), que asigna distintos niveles de precisión a los tensores en función de su relevancia para la perplejidad, mejorando la calidad respecto a cuantizaciones uniformes del mismo tamaño. El repositorio ofrece una gama muy amplia de niveles (desde IQ1_S hasta Q6_K), lo que permite ajustar el compromiso entre tamaño y fidelidad. No se han publicado detalles sobre innovaciones arquitectónicas (atención lineal, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional: las etiquetas del repositorio incluyen "conversational", lo que sugiere un uso orientado a diálogo.
- Clasificación de imágenes y moderación de contenido multimodal: según las etiquetas del repositorio hermano VIGOR-27B-GGUF ("Image Classification", "content-safety", "content-moderation", "guardrail", "visual-safety", "multimodal-content-filter").
- Posible capacidad de filtrado de contenido no censurado ("uncensored" en las etiquetas del repositorio hermano).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el repositorio hermano declara English).
- Capacidades especiales (thinking mode, visión, audio): no confirmadas en este repositorio; las etiquetas del repositorio hermano apuntan a visión y clasificación de imágenes.

## Casos de uso

- Moderación de contenido en plataformas: si el modelo base confirma sus capacidades de clasificación y filtrado (según etiquetas del repositorio hermano), podría emplearse para etiquetar texto e imágenes como seguras o no seguras en pipelines de moderación.
- Filtrado de contenido visual en aplicaciones UGC: clasificación de imágenes subidas por usuarios para detectar contenido no deseado, aprovechando las etiquetas de "visual-safety" y "multimodal-content-filter".
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM, útil para pruebas y prototipado sin infraestructura cloud.
- Evaluación de guardrails en investigación: uso del modelo como clasificador de referencia para comparar políticas de moderación en entornos controlados.
- Generación conversacional en local: la etiqueta "conversational" sugiere uso en asistentes de chat autoalojados, con la ventaja de privacidad al no enviar datos a terceros.
- Integración en pipelines de CI/CD para QA de contenido: validación automática de textos e imágenes generados antes de su publicación, usando cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada para 27,3 B parámetros):
  - IQ1_S / IQ2_XXS: ~4-6 GB
  - IQ2_M / Q2_K: ~7-9 GB
  - IQ3_XS / Q3_K_S: ~10-12 GB
  - Q4_K_M / IQ4_XS: ~14-16 GB
  - Q5_K_M: ~18-19 GB
  - Q6_K: ~21-22 GB
- GPUs recomendadas: RTX 4090 (24 GB) para Q5_K_M/Q6_K; RTX 4080/4070 Ti (16 GB) para Q4_K_M; RTX 3060/4060 (8-12 GB) para IQ2/IQ3; A100/H100 para despliegues de alta concurrencia con cuantizaciones altas o FP16.
- ¿Cabe en GPU consumer? Sí, en todas las cuantizaciones hasta Q4_K_M con 16 GB, y hasta Q6_K con 24 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (este último con soporte GGUF limitado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VIGOR-27B-i1-GGUF (este) | ~27,3 B | no disponible | no disponible (hermano: apache-2.0) | GGUF i1 | Hugging Face |
| VIGOR-27B-GGUF (mradermacher) | ~27,3 B | no disponible | apache-2.0 (según repo) | GGUF | Hugging Face |
| iCoder-27B-i1-GGUF (mradermacher) | ~27 B (no confirmado) | no disponible | apache-2.0 | GGUF i1 | Hugging Face |
| Modelos densos ~27B de propósito general | ~27 B | variable | variable | safetensors/GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información muy limitada: el repositorio no declara licencia, idiomas ni pipeline, lo que impide confirmar condiciones de uso comercial directamente desde esta ficha.
- La licencia del modelo base (apache-2.0 según el repositorio hermano) debe verificarse en el repositorio original prithivMLmods/VIGOR-27B antes de cualquier uso en producción.
- Las capacidades reales (moderación, visión, conversación) provienen de etiquetas del repositorio hermano y no están confirmadas en este repositorio i1.
- Riesgo de alucinación: no evaluado en la información disponible; aplicable a cualquier modelo generativo de este tamaño.
- Sesgos conocidos: no documentados.
- Las cuantizaciones IQ1/IQ2 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- El tamaño del repositorio (10,9 GB) no incluye necesariamente todas las cuantizaciones listadas; verificar los archivos disponibles antes de la descarga.
- Sin datos de benchmarks ni de rendimiento en producción, no es posible garantizar latencia ni precisión en casos concretos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/VIGOR-27B-i1-GGUF
- Repositorio hermano (GGUF sin imatrix): https://huggingface.co/mradermacher/VIGOR-27B-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-27B
- Repositorio de referencia del autor (iCoder-27B-i1-GGUF): https://huggingface.co/mradermacher/iCoder-27B-i1-GGUF
- Archivos del repositorio hermano: https://huggingface.co/mradermacher/VIGOR-27B-GGUF/tree/main
