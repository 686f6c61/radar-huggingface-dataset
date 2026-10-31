# mradermacher/Mero-Artemis-31B-v1-i1-GGUF

## Resumen

Mero-Artemis-31B-v1-i1-GGUF es una colección de cuantizaciones en formato GGUF (con matriz de importancia, "imatrix") del modelo base pineapplesuperfan/Mero-Artemis-31B-v1, publicada por el cuantizador mradermacher. El modelo base es un merge creado con mergekit, de unos 30,7 mil millones de parámetros, orientado a conversación y etiquetado como "not-for-all-audiences", lo que sugiere un modelo sin filtro o con contenido potencialmente sensible.

La relevancia de esta ficha no está en el modelo original sino en la disponibilidad de cuantizaciones de peso calibrado (IQ y Q de la familia k-quants de llama.cpp), que permiten ejecutar un modelo de 31B en hardware de consumo. Se ofrecen desde versiones de 7,3 GB (IQ1_S) hasta 25,3 GB (Q6_K), cubriendo un rango amplio de VRAM. Según el autor, se trata de un modelo de visión, con los archivos mmproj disponibles en el repositorio estático asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (merge de modelos, creado con mergekit) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura del modelo base: no consta el tipo de transformer, número de capas, dimensiones ocultas ni detalles del tokenizador. Lo único documentado es que Mero-Artemis-31B-v1 es un merge (fusión de pesos) creado con mergekit, una técnica que combina varios modelos preentrenados sin entrenamiento adicional, y que el resultado tiene aproximadamente 30,7 mil millones de parámetros según los metadatos de safetensors.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación. La etiqueta "not-for-all-audiences" y el pipeline "conversational" sugieren un modelo dirigido a diálogo, posiblemente sin alineación de seguridad estricta, pero esto no está confirmado por el autor. Sobre el modelo de visión indicado en el README (archivos mmproj) tampoco se detallan capacidades concretas.

## Capacidades

- Generación de texto conversacional: el pipeline indicado en HuggingFace es "conversational".
- Comprensión de imágenes: el autor del repositorio indica que es un vision model, con archivos mmproj (proyector multimodal para llama.cpp) en el repositorio de cuantizaciones estáticas. El alcance real de esta capacidad no está documentado.
- Ejecución local eficiente: gracias a las 23 variantes de cuantización imatrix, puede funcionar en hardware muy variado, desde portátiles con 8 GB de RAM hasta estaciones con 32 GB de VRAM.
- No hay información sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modo de pensamiento extendido.

## Casos de uso

- Chatbot local sin censura estricta: al llevar la etiqueta "not-for-all-audiences", puede interesar a quien necesite un asistente de diálogo sin filtros corporativos, ejecutado íntegramente en local con llama.cpp u Ollama.
- Experimentación con merges: al ser un merge de mergekit de 31B con licencia Apache 2.0, es útil como base o punto de comparación para quienes investigan técnicas de fusión de modelos.
- Despliegue en hardware de consumo: la variante Q4_K_M (18,8 GB) cabe en una RTX 3090/4090 de 24 GB, y las variantes IQ2/IQ3 (9-14 GB) permiten ejecutarlo en GPUs de 12-16 GB o incluso en CPU con RAM suficiente.
- Pruebas de visión en local: si se confirman las capacidades multimodales, los archivos mmproj del repositorio estático permitirían descripción de imágenes y VQA offline.
- Prototipado de aplicaciones RAG: con 31B de parámetros ejecutados en local, es candidato para pipelines de generación aumentada por recuperación donde la privacidad de los datos impide usar APIs externas.
- Evaluación comparativa de cuantizaciones: la colección completa de quants imatrix es un banco de pruebas práctico para medir la degradación de calidad frente al tamaño en modelos de ~31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo base ni la del repositorio de cuantizaciones incluyen métricas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark, por lo que no es posible evaluar su calidad de forma objetiva frente a modelos comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. IQ1_S ocupa 7,3 GB; IQ2_M, 11,0 GB; IQ3_M, 14,5 GB; Q4_K_M (recomendada), 18,8 GB; Q5_K_M, 21,9 GB; Q6_K, 25,3 GB. Añade margen para el KV cache según la longitud de contexto (no documentada).
- GPU recomendadas: para Q4_K_M o superior, una RTX 3090/4090 (24 GB) o una A100 de 40 GB. Para las variantes IQ2/IQ3, GPUs de 12-16 GB como la RTX 3060 de 12 GB o la RTX 4060 Ti 16 GB. Para Q6_K, una A100 40 GB o descarga parcial a CPU.
- Consumer GPUs: sí. Q4_K_M entra en una RTX 4090 de 24 GB; IQ3_XS (13,2 GB) e IQ4_XS (16,8 GB) entran en GPUs de 16 GB; IQ1_S/IQ2 (7-11 GB) funcionan incluso en GPUs de 12 GB o en CPU con 16 GB de RAM, con pérdida notable de calidad en los niveles más bajos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es un despliegue típico para vLLM o TGI, orientados a safetensors; para eso habría que usar el modelo base.
- Latencia y throughput: no disponibles; en GPUs de consumo con Q4_K_M cabe esperar velocidades del orden de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Mero-Artemis-31B-v1 (este) | ~30,7 B | GGUF (23 quants imatrix) | Apache 2.0 | Merge de mergekit, conversacional, posible visión, sin benchmarks publicados |
| Qwen2.5-32B-Instruct | 32,5 B | safetensors + GGUF comunitarios | Apache 2.0 | Benchmarks publicados, contexto de 128K, tool calling nativo |
| Gemma 2 27B | 27,2 B | safetensors + GGUF comunitarios | Licencia propia de Google (permite uso comercial con condiciones) | Benchmarks publicados, buen rendimiento general |
| Yi-1.5-34B-Chat | 34,4 B | safetensors + GGUF comunitarios | Apache 2.0 | Bilingüe chino/inglés, benchmarks publicados |

Mero-Artemis-31B compite en tamaño con estos modelos, pero carece de documentación técnica y benchmarks, lo que dificulta justificar su elección frente a alternativas mejor documentadas. Su ventaja diferencial es la etiqueta "not-for-all-audiences" (menor restricción percibida) y la licencia Apache 2.0 sin condiciones adicionales.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay forma objetiva de verificar su calidad; cualquier evaluación debe hacerse internamente antes de uso en producción.
- Etiqueta "not-for-all-audiences": el modelo puede generar contenido inapropiado u ofensivo; no es adecuado para entornos con usuarios finales sin capas adicionales de moderación.
- Riesgo de alucinación: al ser un merge sin documentación de alineación (RLHF/DPO no confirmado), el riesgo de respuestas incorrectas o fabricadas es presumiblemente alto.
- Idioma: la model card solo declara inglés; el rendimiento en castellano es desconocido y probablemente inferior.
- Contexto: la longitud de ventana de contexto no está documentada, lo que complica el diseño de aplicaciones RAG o de conversaciones largas.
- Cuantizaciones extremas: las variantes IQ1_S/IQ1_M e IQ2 degradan seriamente la calidad (el propio autor las marca como "para desesperados"); se recomienda Q4_K_S o superior.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos fuente del merge pueden tener sus propias licencias; conviene verificar la procedencia antes de uso comercial.
- Visión sin confirmar: aunque el autor lo describe como vision model, no hay detalles sobre las capacidades multimodales reales.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Mero-Artemis-31B-v1-i1-GGUF
- Modelo base: https://huggingface.co/pineapplesuperfan/Mero-Artemis-31B-v1
- Cuantizaciones estáticas (con mmproj): https://huggingface.co/mradermacher/Mero-Artemis-31B-v1-GGUF
- Visión general de descargas: https://hf.tst.eu/model#Mero-Artemis-31B-v1-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
