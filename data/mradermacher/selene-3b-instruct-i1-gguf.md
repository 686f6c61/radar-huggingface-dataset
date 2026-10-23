# mradermacher/Selene-3B-Instruct-i1-GGUF

## Resumen

Selene-3B-Instruct-i1-GGUF es una publicación de cuantizaciones en formato GGUF generada por el usuario mradermacher a partir del modelo Syradevops/Selene-3B-Instruct. No se trata, por tanto, de un modelo entrenado por el autor del repo, sino de una conversión y compresión del modelo base a formatos ligeros aptos para inferencia en CPU y GPU de gama baja mediante llama.cpp y ecosistemas compatibles. La model card indica que se han usado cuantizaciones con matriz de importancia (imatrix), lo que en la práctica mejora la perplejidad de los cuantos de baja precisión frente a las cuantizaciones estáticas equivalentes.

El modelo base se presenta con arquitectura qwen2 (según las etiquetas del repo) y está orientado a instrucciones, con soporte declarado de inglés y portugués y licencia Apache 2.0. El nombre comercial sugiere un tamaño de aproximadamente 3.000 millones de parámetros, aunque el campo de parámetros totales leído de los safetensors del repo (1.680.588) es incompatible con esa cifra, probablemente porque el repositorio solo contiene un fichero imatrix y no los tensores del modelo. Esa discrepancia no se aclara en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta una vía sencilla de ejecutar un modelo de instrucciones pequeño en hardware modesto; por otro, advierte de que el repositorio, a fecha de la información consultada, no incluye los ficheros GGUF de inferencia anunciados, sino únicamente el fichero imatrix, por lo que no es directamente utilizable sin generar las cuantizaciones o acudir al repo de cuantos estáticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen2 (transformer decoder-only, según etiquetas del repo) |
| Parámetros totales | 1.680.588 según safetensors del repo; el nombre del modelo sugiere ~3B. Discrepancia no aclarada en la información disponible |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantos anunciados en la model card: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. En el repo solo consta publicado el fichero imatrix |
| Idiomas soportados | inglés (en), portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix en este repo); el modelo base se distribuye presumiblemente en safetensors, no confirmado en la información disponible |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base Syradevops/Selene-3B-Instruct: no se especifican el número de tokens, la composición del corpus, ni si hubo ajuste supervisado, RLHF o DPO. Lo único confirmado es la familia arquitectónica qwen2, un transformer decoder-only denso con atención causal, normalización RMSNorm y sesgos de atención tipo QKV bias característicos de esa familia, además del uso declarado de la librería transformers y del pipeline de Unsloth en las etiquetas del repo de cuantización.

La innovación técnica de este repositorio concreto no está en el modelo, sino en el proceso de cuantización: mradermacher aplica cuantización asistida por matriz de importancia (imatrix), calculada a partir de estadísticas de activación sobre un corpus de calibración, para reducir el error de los cuantos de 1 a 4 bits. La model card indica además `output_tensor_quantised: 1` y `quantize_version: 2`, y enlaza el gráfico de perplejidad de ikawrakow y las notas de Artefact2 sobre elección de tipos de cuanto. No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto e instrucciones en inglés y portugués, heredadas del modelo base Selene-3B-Instruct.
- Conversación multi-turno con plantilla de chat de la familia Qwen2, asumiendo que el modelo base la conserva (no verificado en la información disponible).
- Razonamiento básico y resolución de tareas de un solo paso propias de un modelo de ~3B: resumen, reescritura, extracción de datos y clasificación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; por tamaño, poco fiable sin verificación externa.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Ejecución en CPU y GPU de gama baja gracias al formato GGUF y al rango de cuantos de 1 a 6 bits.

## Casos de uso

- Asistencia al cliente en portugués e inglés: un modelo de ~3B cuantizado a Q4_K_M puede desplegarse en una instancia pequeña o incluso en local para respuestas de primer nivel, derivando a un modelo mayor los casos complejos. El coste por token es bajo y la latencia en CPU es tolerable para turnos cortos.
- Clasificación y etiquetado de tickets o correos: se usa el modelo como clasificador zero-shot o few-shot con prompts cortos, ejecutándolo por lotes en CPU con llama.cpp; el tamaño reducido permite procesar miles de documentos por hora en un solo servidor sin GPU.
- Extracción de entidades en documentos portugueses: con cuantos Q5_K_M o Q6_K se conserva mejor la fidelidad para tareas de extracción estructurada, y el modelo puede ejecutarse dentro del perímetro de la empresa sin enviar datos a terceros.
- Prototipado rápido y pruebas de concepto: sirve para validar prompts, plantillas de chat y flujos de RAG antes de migrar a un modelo mayor, ya que el GGUF se carga en cualquier portátil con 8 GB de RAM.
- Traducción en-pt y pt-en de textos cortos: útil para preprocesar documentación o soporte interno, siempre con revisión humana dado el tamaño del modelo.
- Generación de texto asistida en herramientas de escritorio: integración vía llama-cpp-python u Ollama en plugins de editores o aplicaciones ofimáticas que requieren funcionamiento offline.
- Filtrado y moderación previa de contenido: un modelo pequeño y rápido puede actuar como primera barrera antes de un modelo mayor, reduciendo coste en pipelines de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repo de cuantización no incluye MMLU, HumanEval, GSM8K ni métricas de perplejidad para los cuantos concretos, y tampoco se han encontrado datos del modelo base Selene-3B-Instruct en los resultados de búsqueda consultados.

## Requisitos de hardware

- VRAM estimada solo para pesos (estimación a partir del tamaño nominal de ~3B; no verificada porque los ficheros de cuantos no están presentes en el repo): IQ2/IQ1 ~0,8-1,2 GB; Q4_K_M ~1,8-2,0 GB; Q6_K ~2,4-2,7 GB; Q8_0 ~3,2 GB; FP16 ~6,1 GB.
- A la VRAM de pesos hay que sumar la caché KV: para 4.000-8.000 tokens de contexto, entre 0,3 y 1,5 GB adicionales según configuración.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4090, e incluso GTX 1060 6 GB o RTX 3050 8 GB con cuantos Q4 o inferiores.
- GPU de centro de datos: A100, H100 o L40S son innecesarias para este tamaño; una L4 o A10G ya queda sobredimensionada.
- Cabe en iGPU y en CPU: con Q4_K_M puede ejecutarse en un portátil con 8 GB de RAM compartida; con Q2_K, en equipos de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI. vLLM y TGI requerirían pesos en safetensors del modelo base, que no están en este repo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para estos cuantos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Selene-3B-Instruct-i1-GGUF (este repo) | ~3B nominal, 1.680.588 según safetensors (discrepancia) | no disponible | Apache 2.0 | GGUF (solo imatrix publicado) | Repo con 0 descargas y 0 likes; sin ficheros de inferencia |
| Syradevops/Selene-3B-Instruct (modelo base) | ~3B nominal | no disponible | Apache 2.0 | safetensors (presumible) | Modelo de origen del que no se han encontrado métricas |
| mradermacher/Selene-3B-Instruct-GGUF (cuantos estáticos) | ~3B nominal | no disponible | Apache 2.0 | GGUF | Repo alternativo del mismo autor con cuantos estáticos |
| Qwen2.5-3B-Instruct (referencia de familia) | ~3,09B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia disponibilidad y ecosistema; cifras según su model card pública |

No se dispone de datos de rendimiento del modelo Selene que permitan una comparación cuantitativa con alternativas de la misma categoría; la comparación anterior se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio, según la información disponible, solo contiene el fichero imatrix (0,1 GB) y ningún cuanto listo para inferencia, pese a que la model card enumera 24 tipos. No es utilizable directamente sin generar los GGUF o acudir al repo de cuantos estáticos.
- Discrepancia grave entre el nombre del modelo (~3B) y el recuento de parámetros leído de safetensors (1.680.588). Debe verificarse antes de cualquier uso en producción.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o código para este modelo ni para su base.
- Señal de comunidad nula: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros.
- Idiomas limitados a inglés y portugués; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se deben diseñar flujos de RAG con ventanas largas sin verificarla empíricamente.
- Riesgo de alucinación alto por tamaño (~3B): no apto para tareas factuales sin verificación, recuperación documental o revisión humana.
- Los cuantos IQ1 e IQ2 degradan notablemente la calidad; para uso serio, Q4_K_M o superior.
- La licencia Apache 2.0 del repo de cuantización no garantiza por sí sola los términos del modelo base; conviene revisar la model card de Syradevops/Selene-3B-Instruct antes de un uso comercial.
- La fecha de creación del repo (2026-10-22) y la ausencia de documentación del modelo base impiden evaluar su vigencia frente a alternativas más recientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Selene-3B-Instruct-i1-GGUF
- Modelo base: https://huggingface.co/Syradevops/Selene-3B-Instruct
- Cuantos estáticos del mismo autor: https://huggingface.co/mradermacher/Selene-3B-Instruct-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Selene-3B-Instruct-i1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre elección de tipos de cuanto (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad por tipo de cuanto (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Ficha del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
