# mradermacher/nsfw-sce-test-2-GGUF

## Resumen

nsfw-sce-test-2-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo mergekit-community/nsfw-sce-test-2, publicadas por mradermacher, un colaborador habitual de Hugging Face especializado en generar versiones cuantizadas de modelos abiertos. El modelo original es un merge (fusión) construido con mergekit, una herramienta que combina los pesos de varios modelos para producir un modelo derivado sin necesidad de reentrenamiento. El resultado es un modelo de aproximadamente 8.030 millones de parámetros (8B) orientado a generación de texto conversacional en inglés.

La relevancia de este repositorio es fundamentalmente práctica: ofrece el modelo en múltiples niveles de cuantización GGUF (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware de consumo con llama.cpp y derivados. El repositorio está etiquetado como `not-for-all-audiences`, lo que indica que el contenido del modelo fusionado incluye material para adultos y no es apto para todos los públicos. No se dispone de información sobre la licencia, el pipeline, la longitud de contexto ni los datos de entrenamiento del modelo base.

Se trata, por tanto, de un artefacto de distribución (cuantizaciones) más que de un modelo con documentación técnica propia; la model card se limita a listar los ficheros GGUF y a remitir a la página del autor para su descarga. Cualquier evaluación rigurosa del modelo requiere consultar el repositorio original del merge, del que aquí no se aportan especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de un merge con mergekit; presumiblemente transformer, sin confirmar) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en formato transformers |

## Arquitectura y entrenamiento

El modelo original (mergekit-community/nsfw-sce-test-2) es el resultado de una fusión de pesos realizada con mergekit, una herramienta que permite combinar modelos mediante técnicas como SLERP, TIES, DARE o passthrough. No se dispone de información sobre qué modelos se fusionaron, con qué método ni con qué proporciones, ni sobre si hubo un entrenamiento posterior. El repositorio aquí descrito no contiene el modelo original, sino únicamente sus cuantizaciones estáticas generadas por mradermacher con el conversor de llama.cpp.

La model card indica explícitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación, y que podrían no llegar a publicarse. El proceso de cuantización parte de los tensores del modelo en formato Hugging Face (`convert_type: hf`) y produce ficheros GGUF de un solo archivo por nivel de cuantización. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, entre otras).
- Despliegue en endpoints compatibles (`endpoints_compatible` en las etiquetas).
- No consta soporte de tool calling, function calling ni razonamiento multi-paso documentado.
- No consta soporte multimodal (visión, audio) ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma.
- Contenido para adultos: el repositorio está marcado como `not-for-all-audiences`.

## Casos de uso

- Experimentación local con modelos fusionados: permite probar el merge nsfw-sce-test-2 en equipos sin GPU de gama alta gracias a las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,8 GB), adecuadas para GPUs de consumo con 8 GB de VRAM.
- Evaluación comparativa de técnicas de merge: útil para investigadores que quieran medir el efecto de la fusión de pesos frente a los modelos de origen, ejecutando el mismo prompt en distintos niveles de cuantización.
- Generación de texto creativo para adultos en entornos controlados: el modelo está orientado a conversación y etiquetado como no apto para todos los públicos, por lo que su uso previsto son aplicaciones de ficción o roleplay para adultos con las salvaguardas adecuadas.
- Desarrollo de prototipos de chatbots: al ser un modelo de 8B en GGUF, sirve para validar pipelines de conversación multi-turno en local antes de migrar a modelos mayores o con licencia clara.
- Pruebas de cuantización: los doce niveles disponibles permiten estudiar la degradación de calidad (perplejidad) entre Q2_K y f16 en una misma arquitectura, útil para calibrar qué nivel conviene en producción.
- Despliegue en entornos sin conectividad: al ser un único fichero GGUF autónomo, puede ejecutarse en máquinas aisladas con llama.cpp, sin dependencias de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 8B, incluyendo overhead de contexto): Q2_K ~3,3 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB.
- GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M caben en GPUs con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070). Q5_K_M y Q6_K requieren 8-12 GB (RTX 4070, RTX 3080). Q8_0 encaja en 12 GB (RTX 4070 Ti, RTX 3060 de 12 GB). f16 requiere 24 GB o más (RTX 3090, RTX 4090, A100).
- GPU de centro de datos: A100 (40/80 GB), H100 y L40S sin problema para cualquier cuantización; útiles para servir varias instancias en paralelo.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en este repositorio (vLLM requiere pesos en safetensors, no GGUF, en la mayoría de configuraciones).
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantización. Como referencia orientativa no verificada, un 8B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo modernas, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nsfw-sce-test-2-GGUF (este) | 8B | no disponible | no disponible | GGUF | Merge con mergekit, solo inglés, contenido adulto |
| mergekit-community/nsfw-sce-test-2 | 8B | no disponible | no disponible | transformers | Modelo base del que derivan estas cuantizaciones |
| mradermacher/nsfw-sce-test-2-redux-GGUF | no disponible | no disponible | no disponible | GGUF | Variante "redux" del mismo modelo, publicada por el mismo autor |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está etiquetado como `not-for-all-audiences`; no es adecuado para aplicaciones dirigidas al público general ni para entornos sin moderación.
- Licencia no disponible: al no constar la licencia del modelo base ni de las cuantizaciones, no se puede garantizar el uso comercial. Conviene contactar con el autor o consultar el repositorio original antes de cualquier despliegue en producción.
- Idioma: solo se declara inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin verificarlo empíricamente.
- Riesgo de alucinación: inherente a los modelos de 8B y, en general, a los merges sin alineación documentada; no hay información sobre RLHF o filtros de seguridad.
- Sesgos: no hay documentación sobre la composición de los datos de los modelos fusionados, por lo que no es posible evaluar sesgos de género, raza u otros.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Sin cuantizaciones imatrix: el autor indica que no estaban disponibles y que podrían no publicarse, lo que limita la calidad máxima alcanzable en tamaños pequeños.
- Modelo derivado sin documentación técnica propia: la model card no describe arquitectura, entrenamiento ni evaluación; cualquier decisión de producción exige validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/nsfw-sce-test-2-GGUF
- Modelo base: https://huggingface.co/mergekit-community/nsfw-sce-test-2
- Variante redux: https://huggingface.co/mradermacher/nsfw-sce-test-2-redux-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#nsfw-sce-test-2-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
