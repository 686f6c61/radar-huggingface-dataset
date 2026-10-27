# mradermacher/Smaug-Humanizer-i1-GGUF

## Resumen

Smaug-Humanizer-i1-GGUF es la versión cuantizada en formato GGUF del modelo abacusai/Smaug-Humanizer, publicada por mradermacher (nethype GmbH) el 27 de octubre de 2026. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: aplica cuantización con matrices de importancia (imatrix, variante «i1») sobre los pesos originales en safetensors, generando 24 variantes que van desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB). El objetivo es permitir ejecutar un modelo de 11.907.350.576 parámetros en hardware de consumo, algo inviable con los pesos en precisión completa.

El modelo base es un «humanizador»: reescribe texto generado por IA para que suene más natural y menos mecánico. Según las etiquetas del repositorio y la información pública disponible, está construido sobre la familia Gemma de Google (etiqueta `gemma4`) y afinado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo. La model card de la versión cuantizada indica además que el modelo es multimodal (visión), con archivos mmproj alojados en el repositorio estático del mismo autor.

Su relevancia práctica es doble: por un lado, ofrece una tarea muy concreta (reescritura estilística de texto) con licencia Apache-2.0, lo que facilita uso comercial; por otro, al estar disponible en GGUF con cuantizaciones de 3 a 10 GB, se puede desplegar en portátiles y estaciones de trabajo sin GPU de datacenter. Hay que subrayar que esta ficha describe el artefacto cuantizado, no el modelo original: el autor de las cuantizaciones no documenta arquitectura, datos de entrenamiento ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; las etiquetas del repositorio indican familia Gemma (`gemma4`) y el modelo base es abacusai/Smaug-Humanizer |
| Parametros totales | 11.907.350.576 (11,9 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas archivo imatrix) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento; la información procede indirectamente de las etiquetas del modelo base. Estas apuntan a la familia Gemma (`gemma4`), a un ajuste mediante GRPO y a la plataforma Abacus.AI como desarrolladora del modelo original. El modelo cuantizado hereda esa base y añade únicamente el proceso de cuantización: mradermacher genera pesos con cuantización por bloques asistida por una matriz de importancia (imatrix) calculada sobre un corpus de calibración, lo que en la práctica reduce la pérdida de perplejidad respecto a cuantizaciones estáticas del mismo tamaño. La versión estática equivalente está publicada en un repositorio aparte.

En cuanto a modalidad, la model card del GGUF afirma explícitamente que el modelo es de visión y que los archivos mmproj (proyector multimodal) se encuentran en el repositorio estático `mradermacher/Smaug-Humanizer-GGUF`. Esto implica que el pipeline completo de inferencia multimodal requiere descargar ese proyector además del GGUF de texto. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, técnica de alineación adicional (DPO/RLHF) ni innovaciones de atención o decodificación.

## Capacidades

- Reescritura y «humanización» de texto: la tarea principal para la que fue ajustado el modelo base, orientada a eliminar marcas estilísticas típicas de texto generado por IA.
- Generación de texto conversacional en inglés, con etiqueta `conversational` en el repositorio.
- Ajuste fino por refuerzo (GRPO) sobre el modelo base, orientado a preferencias humanas en el estilo de salida.
- Procesamiento multimodal de imágenes segun la model card (requiere descargar el archivo mmproj del repositorio estático y usar un runtime compatible, como llama.cpp con soporte multimodal).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), es decir, puede servirse mediante infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo «thinking» explícito: no documentado.
- Multilingüismo: limitado a inglés según el campo `language`.

## Casos de uso

- Humanización de textos generados por IA en flujos editoriales: el modelo reescribe borradores producidos por otros LLM para reducir patrones repetitivos y giros formulaicos, integrándose como paso posterior a la generación en un pipeline de contenido.
- Publicación de blogs y newsletters: al ser un modelo de 11,9B en GGUF de ~7,5 GB (Q4_K_M), puede ejecutarse en una estación de trabajo local y procesar artículos completos por lotes sin coste por token de API.
- Preprocesado de corpus para entrenamiento: reescritura de datasets sintéticos para que el estilo no delate su origen, útil al construir mezclas de datos de instrucciones.
- Respuestas de atención al cliente con tono natural: reescritura de respuestas plantilla generadas automáticamente antes de enviarlas, manteniendo coherencia de estilo de marca (siempre en inglés).
- Localización de contenido de marketing hacia inglés: adaptación de textos traducidos automáticamente para que suenen idiomáticos y menos «traducidos».
- Edición de documentación técnica: suavizado de fragmentos generados automáticamente en manuales y changelogs, con despliegue on-premise para entornos con requisitos de confidencialidad.
- Prototipado e investigación sobre estilometría: al ser Apache-2.0 y estar disponible en múltiples cuantizaciones, sirve como base para estudiar qué rasgos estilísticos separan texto humano de texto sintético.
- Procesamiento de documentos con imágenes: si se descarga el proyector mmproj, puede combinarse la lectura de capturas o figuras con la reescritura del texto asociado, aunque esta capacidad no está documentada con detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del GGUF no incluye evaluaciones, y el modelo base no aporta cifras en la información recogida. Tampoco hay datos de perplejidad comparativa entre cuantizaciones; el autor remite únicamente a gráficas externas de terceros sobre calidad relativa de tipos de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño de pesos + overhead de contexto y caché KV):
  - i1-IQ1_S / IQ1_M: 3,1-3,3 GB de pesos; ~4-5 GB en uso real.
  - i1-IQ2_XXS a IQ2_M: 3,7-4,5 GB; ~5-6 GB en uso real.
  - i1-IQ3_XXS a Q3_K_L: 4,9-6,7 GB; ~6-8 GB en uso real.
  - i1-IQ4_XS / Q4_K_S / Q4_K_M: 6,7-7,5 GB; ~8-9 GB en uso real (punto de equilibrio recomendado por el autor).
  - i1-Q5_K_M / Q6_K: 8,6-9,9 GB; ~10-12 GB en uso real.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super / 4080 16 GB y RTX 4090 24 GB para las cuantizaciones altas con contexto amplio; A100 40/80 GB y H100 solo si se necesita servir muchas peticiones concurrentes o se quiere margen para contexto largo.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con IQ2/IQ3 hasta una RTX 4090 con Q6_K. Las cuantizaciones IQ4_XS y Q4_K_M son las más equilibradas para 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (referencia para GGUF, incluye soporte de mmproj para visión), Ollama, LM Studio, text-generation-webui, koboldcpp; vLLM y TGI solo de forma parcial para GGUF, siendo preferible en esos casos el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, el autor clasifica Q4_0 como «rápida, baja calidad» y Q4_K_M como «rápida, recomendada», lo que sugiere que las variantes Q4 son las adecuadas para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Smaug-Humanizer-i1-GGUF | 11,9B | No disponible | GGUF (imatrix, 24 variantes) | Apache-2.0 | Objeto de esta ficha; cuantizacion dinamica con imatrix |
| mradermacher/Smaug-Humanizer-GGUF | No disponible (mismo modelo base) | No disponible | GGUF estatico | Apache-2.0 | Cuantizaciones estaticas y alojamiento de los archivos mmproj |
| mradermacher/Humanizer-3B-Safetensors-i1-GGUF | ~3B (segun nombre) | No disponible | GGUF | No disponible | Alternativa mas ligera para hardware muy limitado; no se dispone de datos de calidad |
| mradermacher/humanizerAI-GGUF | No disponible | No disponible | GGUF | No disponible | Otro artefacto del mismo autor orientado a la misma tarea; sin datos tecnicos publicos |
| abacusai/Smaug-Humanizer | 11,9B (heredado) | No disponible | safetensors | Apache-2.0 | Modelo original sin cuantizar; precision completa, requiere mucha mas VRAM |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Idioma: solo inglés. Cualquier uso en castellano queda fuera del alcance declarado del modelo y probablemente produzca resultados degradados.
- Ausencia total de evaluación publicada: no hay benchmarks, ni pruebas de perplejidad, ni comparaciones controladas frente al modelo base. Cualquier afirmación de calidad sería especulativa.
- Las cuantizaciones IQ1 e IQ2 (3,1-4,5 GB) degradan notablemente la calidad; el propio autor las etiqueta como «for the desperate» y «mostly desperate». No son aptas para producción.
- Riesgo de alucinación: inherente a un modelo de 11,9B sin datos de evaluación; al reescribir texto puede alterar el contenido factual, no solo el estilo. En un humanizador esto es especialmente peligroso porque los cambios son sutiles.
- Consideraciones éticas: un modelo orientado a que el texto generado por IA no parezca generado por IA puede emplearse para eludir detectores, en contextos académicos o periodísticos. Conviene establecer políticas de uso explícitas y trazabilidad del contenido.
- Sesgos: no documentados. El ajuste con GRPO sobre preferencias humanas puede reforzar estilos o registros concretos del corpus de preferencias, sin que el autor detalle su composición.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de Gemma subyacente, ya que los términos de la familia Gemma pueden imponer condiciones adicionales de uso aceptable.
- Naturaleza del artefacto: es una cuantización, no un modelo nuevo. Los fallos del modelo base se heredan y la cuantización añade pérdida de precisión numérica acumulativa.
- Metadatos incompletos: el repositorio no declara pipeline, contexto ni arquitectura, lo que complica la integración automatizada en plataformas que dependen de esos campos.
- Visión: la model card afirma que es multimodal, pero los archivos mmproj están en otro repositorio; un despliegue que solo descargue este GGUF no tendrá capacidades de imagen.

## Enlaces

- Repositorio HuggingFace (esta ficha): https://huggingface.co/mradermacher/Smaug-Humanizer-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Humanizer
- Cuantizaciones estáticas y archivos mmproj: https://huggingface.co/mradermacher/Smaug-Humanizer-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Smaug-Humanizer-i1-GGUF
- Archivo imatrix: https://huggingface.co/mradermacher/Smaug-Humanizer-i1-GGUF/resolve/main/Smaug-Humanizer.imatrix.gguf
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad relativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Artículo sobre el lanzamiento de Smaug Humanizer (AGI Hunt): https://agihunt.info/en/p/1a17ba5aa82bf040b886a53aa37
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Repositorio relacionado, Humanizer-3B: https://huggingface.co/mradermacher/Humanizer-3B-Safetensors-i1-GGUF
- Repositorio relacionado, humanizer: https://huggingface.co/mradermacher/humanizer-i1-GGUF
- Repositorio relacionado, humanizerAI: https://huggingface.co/mradermacher/humanizerAI-GGUF
