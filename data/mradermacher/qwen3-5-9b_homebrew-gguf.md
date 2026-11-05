# mradermacher/Qwen3.5-9B_Homebrew-GGUF

## Resumen

Qwen3.5-9B_Homebrew-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Nitral-Archive/Qwen3.5-9B_Homebrew, publicada por el usuario mradermacher. El modelo base pertenece a la familia Qwen3.5 de Alibaba (la model card no lo confirma explícitamente, pero la nomenclatura y el tamaño lo sitúan en esa línea) y cuenta con 8.953.803.264 parámetros totales según los pesos en safetensors del modelo original. La variante "Homebrew" sugiere un ajuste fino o una mezcla comunitaria sobre la base Qwen3.5-9B, aunque la información proporcionada no detalla el proceso.

El interés de esta publicación es práctico: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 3,9 GB hasta f16 de 18 GB) listos para usar con llama.cpp y herramientas compatibles, además de dos ficheros mmproj que indican soporte multimodal (visión) en el modelo base. El repositorio ocupa 83 GB porque incluye todas las variantes.

La licencia figura como "other", lo que obliga a consultar los términos del modelo base antes de cualquier uso comercial. El idioma declarado es únicamente inglés, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; transformer presumiblemente, sin confirmar) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | other (consultar términos del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y el tamaño (8,95 B de parámetros) se trata presumiblemente de un transformer decoder-only de la familia Qwen3.5, pero no se confirma en la model card. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La contribución de esta publicación es exclusivamente la cuantización: mradermacher aplica cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos del modelo Nitral-Archive/Qwen3.5-9B_Homebrew. La presencia de ficheros mmproj (multi-modal supplement) indica que el modelo base incorpora un proyector multimodal, probablemente para entrada de imágenes, aunque no se especifica la arquitectura de visión. Existe además una versión con cuantizaciones ponderadas/imatrix en un repositorio separado (Qwen3.5-9B_Homebrew-i1-GGUF).

## Capacidades

- Generación de texto conversacional: el tag "conversational" y la pipeline de transformers apuntan a un uso como modelo de chat.
- Procesamiento multimodal: los ficheros mmproj-Q8_0 y mmproj-f16 confirman soporte de entrada visual en el modelo base, aunque no se detalla su alcance.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse mediante APIs compatibles con el formato de HuggingFace/OpenAI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (5,7 GB) permite ejecutar el modelo en GPUs con 8 GB de VRAM mediante llama.cpp u Ollama, adecuado para prototipos y pruebas offline.
- Asistentes conversacionales en inglés: el tag "conversational" y el tamaño de 9 B lo hacen viable para chatbots de soporte en inglés con latencia baja en hardware modesto.
- Análisis de imágenes en local: los ficheros mmproj permiten combinar el modelo con un proyector visual para tareas de descripción de imágenes o extracción de información de capturas, siempre que se valide la calidad del componente multimodal.
- Investigación y experimentación con cuantizaciones: el repositorio ofrece 12 niveles de cuantización distintos, útil para estudiar el impacto de la compresión en la perplejidad y la calidad de salida.
- Integración en pipelines de inferencia con llama.cpp: los GGUF son directamente compatibles con llama.cpp, Ollama y servidores compatibles, lo que facilita su inclusión en entornos de CI o servicios internos.
- Evaluación comparativa de ajustes comunitarios: al ser una variante "Homebrew" del Qwen3.5-9B, sirve para comparar el comportamiento de ajustes comunitarios frente al modelo oficial en tareas de generación y conversación.
- Uso educativo y demos: el tamaño contenido y la disponibilidad de cuantizaciones ligeras (Q2_K, 3,9 GB) permiten desplegar demos en portátiles con GPU integrada o CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB. Añadir aproximadamente 0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M con margen; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues concurrentes con vLLM (si el modelo base es compatible).
- Cabe en GPU de consumo: sí, desde GTX 1060 6 GB (Q2_K/Q3_K_S) hasta RTX 4090 (f16). Para Q4_K_M se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier servidor compatible con GGUF. vLLM y TGI requerirían los pesos en safetensors del modelo base, no los GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B_Homebrew-GGUF (este) | 8,95 B | no disponible | other | GGUF | Cuantizaciones estáticas de un ajuste comunitario |
| Nitral-Archive/Qwen3.5-9B_Homebrew | 8,95 B | no disponible | other | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen3.5-9B_Homebrew-i1-GGUF | 8,95 B | no disponible | other | GGUF (imatrix) | Cuantizaciones ponderadas del mismo modelo |
| Modelos Qwen3.5 oficiales de 9 B | ~9 B | no disponible | según modelo | safetensors/GGUF | Referencia oficial de la familia; datos no disponibles en esta ficha |

No se dispone de información sobre benchmarks que permita comparar el rendimiento relativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia "other" no aclara los términos de uso comercial; es imprescindible revisar la licencia del modelo base Nitral-Archive/Qwen3.5-9B_Homebrew y, en su caso, la de Qwen3.5 antes de desplegarlo en producción.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un ajuste comunitario "Homebrew", no hay garantía de calidad, alineación ni seguridad equivalentes a las del modelo oficial.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- No se han publicado benchmarks, por lo que no es posible evaluar el riesgo de alucinación ni el rendimiento en tareas específicas sin pruebas propias.
- El contexto máximo no está documentado; no se debe asumir una ventana larga sin verificarla.
- El repositorio ocupa 83 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- La fecha de creación (2026-03-16) y la actualización (2026-11-05) indican un modelo reciente con poca tracción (225 descargas, 1 like), lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B_Homebrew-GGUF
- Modelo base: https://huggingface.co/Nitral-Archive/Qwen3.5-9B_Homebrew
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B_Homebrew-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B_Homebrew-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
