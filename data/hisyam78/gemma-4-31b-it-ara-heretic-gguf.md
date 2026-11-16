# Hisyam78/gemma-4-31B-it-ARA-heretic-GGUF

## Resumen

Hisyam78/gemma-4-31B-it-ARA-heretic-GGUF es una redistribución en formato GGUF del modelo richardyoung/gemma-4-31B-it-ARA-heretic, una variante "abliterated" o "decensored" de Gemma 4 de 31B parámetros en su versión instruction-tuned. El modelo base parte de la familia Gemma de Google y ha sido modificado mediante técnicas de abliteration para eliminar los mecanismos de rechazo y censura del modelo original, dando lugar a un modelo conversacional sin las restricciones de seguridad habituales.

El repositorio contiene únicamente cuantizaciones estáticas en formato GGUF generadas por mradermacher (según los metadatos de la model card), con un total de 13 archivos de cuantización que van desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), además de dos suplementos multimodales mmproj en Q8_0 y f16. El modelo cuenta con 30.697.345.596 parámetros totales según los pesos en safetensors del modelo base.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de 31B sin censura en hardware de consumo mediante cuantizaciones agresivas, si bien las implicaciones éticas y legales de los modelos "heretic" deben considerarse seriamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), no se detalla variante específica |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es richardyoung/gemma-4-31B-it-ARA-heretic, una modificación del Gemma 4 de 31B instruction-tuned de Google. La técnica de "abliteration" (heretic/decensored) consiste en identificar y neutralizar las direcciones de activación asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder ante determinadas peticiones. No se dispone de información detallada sobre el proceso exacto de abliteration aplicado, el número de tokens de entrenamiento adicionales, ni la composición del dataset utilizado en el ajuste.

La arquitectura subyacente es la de Gemma 4, un transformer decoder-only de aproximadamente 31B parámetros. El repositorio incluye suplementos multimodales (mmproj), lo que sugiere que el modelo base conserva capacidades de visión. No se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con el modo instruction-tuned del modelo base.
- Capacidades multimodales (visión) inferidas por la presencia de archivos mmproj en el repositorio, aunque no se detallan en la model card.
- Comportamiento "uncensored": el modelo no aplica los mecanismos de rechazo del Gemma original, respondiendo a peticiones que el modelo base rechazaría.
- Razonamiento y generación de código heredados del Gemma 4 instruction-tuned (no verificado en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según los metadatos del repositorio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas frente al Gemma original para analizar qué tipos de contenido se desbloquean y con qué calidad.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto) sin los bloqueos del modelo base, usando cuantizaciones Q5_K_M o Q6_K para preservar calidad.
- Evaluación de robustez de filtros: probar sistemas de moderación de contenido frente a un modelo deliberadamente decensored para medir su capacidad de detección.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (18,8 GB) o IQ4_XS (17,0 GB) puede ejecutarse en GPUs con 24 GB de VRAM como la RTX 4090, útil para experimentación offline.
- Análisis de sesgos y comportamientos no filtrados: estudiar qué respuestas produce el modelo en dominios delicados (política, salud, legal) para documentar riesgos antes de desplegar modelos similares.
- Docencia e investigación académica: reproducir experimentos de abliteration sobre un modelo de 31B con cuantizaciones accesibles, comparando resultados entre niveles de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~12,0 GB; Q3_K_S ~13,9 GB; Q4_K_S ~17,9 GB; Q4_K_M ~18,8 GB; Q5_K_M ~21,9 GB; Q6_K ~25,3 GB; Q8_0 ~32,7 GB. Añadir ~0,9-1,3 GB si se usa el suplemento multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; A100 40 GB o H100 para Q8_0 y contexto largo; RTX 3090 (24 GB) también válida para cuantizaciones Q4.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (endpoints_compatible según tags). vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hisyam78/gemma-4-31B-it-ARA-heretic-GGUF | 30,7B | no disponible | apache-2.0 | GGUF | Variante heretic, solo inglés |
| richardyoung/gemma-4-31B-it-ARA-heretic | 30,7B | no disponible | apache-2.0 | safetensors | Modelo base del que deriva esta cuantización |
| mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF | 30,7B | no disponible | apache-2.0 | GGUF (imatrix) | Cuantizaciones con imatrix, calidad superior a igual tamaño |

## Limitaciones y advertencias

- Modelo deliberadamente "decensored": elimina los mecanismos de seguridad del Gemma original, por lo que puede generar contenido dañino, ilegal o sexualmente explícito sin filtros.
- Riesgo elevado de alucinación y de respuestas incorrectas en dominios sensibles (salud, legal, seguridad) al haberse neutralizado los rechazos.
- Sesgos heredados del modelo base Gemma 4, sin mitigación adicional documentada.
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada en la información disponible; verificar en la model card del modelo base.
- Licencia: apache-2.0 con enlace a la licencia de Gemma 4 de Google; revisar los términos de uso de Gemma (política de uso prohibido) antes de cualquier uso comercial, ya que la abliteration puede entrar en conflicto con dichos términos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de calidad de las cuantizaciones.
- Tamaño del repo de 213,9 GB: requiere espacio en disco considerable para descargar todas las cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hisyam78/gemma-4-31B-it-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/gemma-4-31B-it-ARA-heretic-i1-GGUF
- Página de descarga de cuantizaciones: https://hf.tst.eu/model#gemma-4-31B-it-ARA-heretic-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
