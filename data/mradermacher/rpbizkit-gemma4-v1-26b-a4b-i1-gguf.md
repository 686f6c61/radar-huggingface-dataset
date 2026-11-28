# mradermacher/RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF

## Resumen

RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B, un merge de tipo "ht-mergekit" publicado por el usuario RicardoEstep y cuantizado por mradermacher. El modelo base parte de la familia Gemma 4 (la nomenclatura "A4B" sugiere una arquitectura Mixture of Experts con aproximadamente 4.000 millones de parámetros activos sobre un total de 25.233.142.046 parámetros, según los safetensors del repositorio). El resultado es un modelo conversacional en inglés, marcado por el autor como no apto para todo tipo de audiencias, y con capacidad de visión según la propia model card.

La relevancia de esta ficha radica en que el repositorio proporciona cuantizaciones con imatrix (etiquetadas como i1) que abarcan desde IQ1_S de 8,4 GB hasta Q6_K de 22,7 GB, lo que permite desplegar un modelo de 25.000 millones de parámetros en hardware de consumo. Al tratarse de un merge comunitario, la documentación técnica es muy escasa: no se detallan datos de entrenamiento, composición del dataset, longitudes de contexto ni resultados de benchmarks, por lo que buena parte de las especificaciones deben marcarse como no disponibles.

Se trata, en definitiva, de un artefacto de la comunidad orientado a experimentación y despliegue local con llama.cpp/Ollama, no de un modelo con garantías de producción. La licencia no está declarada en el repositorio, lo que supone un riesgo importante para uso comercial, y el etiquetado "not-for-all-audiences" implica contenido potencialmente sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture of Experts (MoE) derivado de Gemma 4, generado mediante ht-mergekit; detalles de capas y atención no disponibles |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | Aproximadamente 4.000 millones (inferido de la nomenclatura A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también se ofrecen cuantizaciones estáticas en el repositorio hermano |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: "ht-mergekit" indica que el modelo base se generó fusionando checkpoints mediante mergekit, una técnica de model merging que combina pesos de modelos existentes sin entrenamiento adicional significativo. La nomenclatura "Gemma4" y "A4B" sugiere una arquitectura Mixture of Experts derivada de la familia Gemma de Google, con enrutamiento a un subconjunto de expertos por token, pero no se confirma en la model card ni se especifican número de capas, dimensión oculta, número de expertos ni mecanismo de atención.

No hay información sobre el número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas. El proceso de cuantización sí está documentado: mradermacher ha generado cuantizaciones i1 (con fichero imatrix de 0,2 GB para crear cuantizaciones propias) y cuantizaciones estáticas en un repositorio separado. La model card indica además que se trata de un modelo de visión, con ficheros mmproj (si existen) alojados en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno según la etiqueta "conversational".
- Capacidad de visión: la model card indica explícitamente "This is a vision model", con ficheros mmproj en el repositorio estático.
- Razonamiento y código: no confirmados explícitamente en la documentación disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo language de la model card.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un modelo de ~25B en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) o i1-IQ4_XS (14,0 GB) permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM o en configuraciones CPU+GPU con llama.cpp, algo inviable con los pesos en safetensors (301 GB de repositorio).
- Experimentación con model merging: investigadores interesados en evaluar la calidad de merges comunitarios sobre Gemma 4 pueden comparar las distintas cuantizaciones i1 frente a las estáticas para estudiar el impacto de la cuantización en la calidad.
- Prototipado de asistentes conversacionales en inglés: la etiqueta "conversational" y el formato GGUF permiten integrar el modelo en Ollama o llama.cpp para pruebas de diálogo sin infraestructura dedicada.
- Evaluación de pipelines multimodales: al ser un modelo de visión con mmproj disponible, puede probarse en tareas de descripción de imágenes o VQA en local, aunque sin garantías documentadas de rendimiento.
- Investigación sobre cuantización extrema: las variantes IQ1_S (8,4 GB) e IQ2_XXS (9,4 GB) permiten estudiar la degradación de calidad en regímenes de muy baja precisión, con el fichero imatrix incluido para generar cuantizaciones propias.
- Pruebas de contenido sensible en entornos controlados: la etiqueta "not-for-all-audiences" hace que el modelo sea útil para estudiar comportamientos de modelos sin filtrado, siempre en contextos de investigación con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-IQ1_S ~8,4 GB; i1-IQ2_M ~10,5 GB; i1-IQ3_S ~12,3 GB; i1-IQ4_XS ~14,0 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,2 GB; i1-Q6_K ~22,7 GB. Hay que añadir overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; RTX 3090/4080 (16-24 GB) para IQ4_XS o Q4_K_S; A100/H100 solo si se requiere contexto largo o batch grande, aunque el modelo no está pensado para ese segmento.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 16 GB o más usando cuantizaciones IQ3/IQ4. Las cuantizaciones IQ1/IQ2 permiten incluso 8-10 GB de VRAM, con degradación de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El repositorio está etiquetado como "endpoints_compatible" y "transformers", pero los pesos GGUF no se cargan con transformers estándar.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B activos (según nomenclatura), se espera un throughput superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF | 25,2B totales / ~4B activos (inferido) | no disponible | no disponible | GGUF | Merge comunitario, visión, inglés |
| Gemma 2 27B (referencia de familia) | 27B densos | 8K | Gemma license | safetensors, GGUF | Modelo oficial de Google, licencia clara |
| Mixtral 8x7B | 46,7B totales / 12,9B activos | 32K | Apache 2.0 | safetensors, GGUF | MoE con licencia permisiva |
| Qwen2.5 32B | 32,5B densos | 128K | Apache 2.0 (variantes) | safetensors, GGUF | Multilingüe, benchmarks publicados |

La comparación es aproximada: no hay datos de benchmarks del modelo evaluado, y la naturaleza de merge comunitario sin licencia declarada lo sitúa en una categoría distinta a los modelos oficiales con documentación completa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base antes de cualquier despliegue en producción.
- Etiqueta "not-for-all-audiences": el modelo puede generar contenido sensible o inapropiado; no apto para aplicaciones orientadas al público general sin filtrado adicional.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Sin benchmarks publicados: no hay evidencia de calidad frente a alternativas oficiales.
- Riesgo de alucinación: inherente a los modelos generativos y agravado por la falta de documentación sobre el entrenamiento y el proceso de merge.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza u otros.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo.
- El proceso de merge puede introducir degradaciones impredecibles respecto a los modelos originales; las cuantizaciones IQ1/IQ2 añaden pérdida de calidad adicional.
- Repositorio de 301 GB: descargar los safetensors originales es poco práctico; solo las cuantizaciones GGUF son viables para la mayoría de usuarios.
- Fecha de creación futura (2026-11-25) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/RPBizkit-Gemma4-v1-26B-A4B-GGUF
- Modelo base: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B
- Página de resumen de mradermacher: https://hf.tst.eu/model#RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermac
