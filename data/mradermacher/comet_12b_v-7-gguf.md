# mradermacher/Comet_12B_V.7-GGUF

## Resumen

Comet_12B_V.7-GGUF es la versión cuantizada en formato GGUF del modelo Comet_12B_V.7, desarrollado originalmente por el usuario OddTheGreat y publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base es un merge creado con mergekit, orientado específicamente a tareas de roleplay y conversación creativa, con soporte declarado para inglés y ruso. Cuenta con 11.765.792.256 parámetros totales (aproximadamente 12B), lo que lo sitúa en la gama media de modelos densos manejables en hardware de consumo.

La relevancia de esta ficha reside en que el repositorio original no ofrece información técnica detallada sobre arquitectura, contexto o datos de entrenamiento; el valor añadido de esta publicación es precisamente la disponibilidad de múltiples cuantizaciones GGUF (desde Q2_K hasta Q8_0, además de variantes IQ4_XS y ficheros mmproj multimodales) que permiten desplegar el modelo en equipos con VRAM limitada. El repositorio ocupa 83,9 GB en total e incluye también una variante con cuantización ponderada/imatrix en un repositorio separado.

Se trata, por tanto, de un modelo de nicho para la comunidad de roleplay y generación creativa, no de un modelo de propósito general orientado a razonamiento o código. La información disponible es escasa y procede casi exclusivamente de los metadatos de Hugging Face y de la model card del cuantizador, por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base creado con mergekit; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 11.765.792.256 (11,77B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16; variantes imatrix en repositorio i1 separado |
| Idiomas soportados | en, ru |
| Licencia | no disponible |
| Formato de pesos | GGUF (con ficheros mmproj multimodales); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base OddTheGreat/Comet_12B_V.7 más allá de que fue creado mediante mergekit, la herramienta de fusión de modelos de la comunidad open source. Los merges de mergekit combinan los pesos de varios modelos base (habitualmente transformers densos) sin entrenamiento adicional, por lo que no cabe hablar de un proceso de preentrenamiento, RLHF o DPO específico para este modelo. El tag "roleplay" indica que la fusión está orientada a conversación creativa y personajes.

El repositorio de mradermacher no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de ficheros mmproj (multi-modal supplement) sugiere que el modelo base podría tener capacidades multimodales heredadas de alguno de los modelos fusionados, pero no se confirma en la documentación disponible. La cuantización se realizó con el pipeline habitual de mradermacher (convert_type hf, quantize_version 2, output_tensor_quantised 1).

## Capacidades

- Generación de texto y conversación multi-turno orientada a roleplay y ficción creativa, según el tag declarado por el autor.
- Soporte multilingüe limitado a inglés y ruso, según los metadatos de idioma.
- Posible soporte multimodal (visión) por la presencia de ficheros mmproj, aunque no se documenta ni se confirma en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Capacidades de código y matemáticas: no disponibles/no documentadas.

## Casos de uso

- Roleplay conversacional en local: el modelo está etiquetado explícitamente como "roleplay" y las cuantizaciones Q4_K_M (7,4 GB) o Q5_K_M (8,5 GB) permiten ejecutarlo en GPU de consumo para sesiones de chat con personajes, manteniendo coherencia de personaje a lo largo de la conversación.
- Generación creativa de ficción en inglés y ruso: adecuado para redacción de relatos, diálogos y guiones en estos dos idiomas, aprovechando el enfoque del merge hacia texto narrativo.
- Prototipado de asistentes conversacionales bilingües (en/ru): útil para equipos que necesiten validar flujos de conversación en ruso sin depender de APIs comerciales, desplegando el GGUF con llama.cpp u Ollama.
- Experimentación con merges de la comunidad: investigadores que estudien el efecto de las fusiones de mergekit pueden comparar este modelo con sus componentes originales usando las distintas cuantizaciones para aislar el impacto de la precisión.
- Despliegue en hardware modesto: la cuantización Q2_K (4,9 GB) o Q3_K_S (5,6 GB) permite ejecutar el modelo en GPUs con 6-8 GB de VRAM o incluso en CPU, útil para demos y entornos de pruebas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro completo de cuantizaciones (Q2 a Q8) que permite medir la degradación de calidad en tareas de roleplay según el nivel de compresión, un caso de uso metodológico habitual en la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~4,9 GB; Q3_K_S ~5,6 GB; Q3_K_M ~6,1 GB; Q3_K_L ~6,6 GB; IQ4_XS ~6,7 GB; Q4_K_S ~7,0 GB; Q4_K_M ~7,4 GB; Q5_K_S ~8,3 GB; Q5_K_M ~8,5 GB; Q6_K ~9,8 GB; Q8_0 ~12,6 GB. Añadir entre 1 y 3 GB adicionales para la caché KV según longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para cuantizaciones Q4-Q5; RTX 4090 24 GB o A100/H100 para Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, desde Q2_K en tarjetas de 6 GB hasta Q5_K_M en tarjetas de 8-12 GB; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. El formato transformers del modelo base permite también vLLM y TGI, pero no con estos ficheros GGUF.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Comet_12B_V.7-GGUF | 11,77B | no disponible | no disponible | GGUF | Merge orientado a roleplay, en/ru |
| Modelos roleplay de ~12B en GGUF (p. ej. variantes de Mistral-Nemo, Lyra, Stheno) | ~12B | variable según base | variable | GGUF | Categoría comparable de merges para roleplay; datos concretos no disponibles en esta busqueda |
| Modelos densos de 12-13B de propósito general (p. ej. Llama 3.1 8B, Qwen2.5 14B) | 8-14B | 128K en algunos casos | licencias permisivas habituales | safetensors/GGUF | Mayor documentación y benchmarks, pero no especializados en roleplay |

No se dispone de datos de rendimiento comparativo verificables para Comet_12B_V.7, por lo que la comparación se limita a parámetros, formato y orientación de uso.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse el repositorio del modelo base OddTheGreat/Comet_12B_V.7 antes de cualquier despliegue en producción.
- Modelo de merge sin entrenamiento adicional: los merges de mergekit pueden heredar sesgos y comportamientos inconsistentes de los modelos fusionados.
- Riesgo de alucinación inherente a los modelos generativos de esta escala, especialmente en tareas factuales; no está orientado a razonamiento verificado.
- Soporte limitado a inglés y ruso; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas sin validación empírica.
- La presencia de ficheros mmproj sugiere multimodalidad, pero no está documentada ni confirmada; no asumir capacidades de visión sin probarlas.
- Repositorio con muy baja tracción (243 descargas, 3 likes): comunidad pequeña, menor soporte y menor validación por terceros.
- El tamaño del repositorio (83,9 GB) incluye todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Comet_12B_V.7-GGUF
- Modelo base: https://huggingface.co/OddTheGreat/Comet_12B_V.7
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Comet_12B_V.7-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Comet_12B_V.7-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
