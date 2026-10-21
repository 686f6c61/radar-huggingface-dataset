# mradermacher/Mira-v1.27-27B-dpo-GGUF

## Resumen

Mira-v1.27-27B-dpo-GGUF es la versión cuantizada en formato GGUF del modelo Lambent/Mira-v1.27-27B-dpo, publicada por mradermacher, un creador habitual de cuantizaciones estáticas e imatrix para llama.cpp. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un modelo que, según las etiquetas de la model card, se ha construido con mergekit (fusión de pesos), probablemente a partir de modelos de la familia Gemma dado el campo de licencia `gemma`. El repositorio incluye once cuantizaciones distintas, desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB).

El interés práctico del modelo está en su tamaño: 27.009.007.616 parámetros (unos 27B) en un rango que permite ejecución local en GPUs de consumo alto (24 GB de VRAM con cuantizaciones Q4) o en estaciones de trabajo con una sola GPU profesional. Al ser una fusión de modelos con ajuste DPO (el sufijo `-dpo` así lo indica), el objetivo declarado por el autor original es obtener un modelo conversacional con alineamiento preferencial, aunque la model card no documenta ni los modelos fusionados, ni la receta de merge, ni el proceso de DPO.

La información publicada es muy escasa: no hay datos de contexto, composición del dataset, benchmarks ni evaluaciones. El modelo está etiquetado únicamente en inglés y acumula 75 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es prácticamente nula. Esta ficha refleja, por tanto, lo que se puede verificar y marca explícitamente como "no disponible" todo lo que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El modelo se ha construido con mergekit (fusión de pesos); la licencia `gemma` sugiere un modelo derivado de la familia Gemma, sin confirmación en la información disponible |
| Parámetros totales | 27.009.007.616 (~27B) |
| Parámetros activos | No aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estáticas; existen versiones imatrix en el repo i1) |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | `gemma` (Gemma Terms of Use) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en formato transformers |
| Modelo base | Lambent/Mira-v1.27-27B-dpo |
| Tamaño del repositorio | 186,7 GB (incluye todas las cuantizaciones) |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no describe la arquitectura interna: únicamente declara que el modelo deriva de Lambent/Mira-v1.27-27B-dpo y que se han usado las herramientas de mergekit con las etiquetas `mergekit` y `merge`, lo que indica que el modelo base es una fusión de dos o más checkpoints combinados mediante alguna de las técnicas de merge de esa librería (linear, SLERP, TIES, DARE, etc.; la técnica concreta no se especifica). El sufijo `-dpo` del nombre apunta a un ajuste posterior con Direct Preference Optimization, pero no se documenta el dataset de preferencias, el número de pasos ni el modelo de referencia.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del corpus, el tokenizador ni la ventana de contexto nativa. Dado que el campo `license` es `gemma`, lo más plausible es que la base sea un modelo de la familia Gemma (probablemente Gemma 2 27B, por la coincidencia de escala), pero esto es una inferencia a partir de los metadatos y no un dato confirmado por el autor. La cuantización la ha realizado mradermacher con su pipeline habitual (`quantize_version: 2`, `convert_type: hf`, cuantizaciones estáticas sin imatrix en este repositorio), y las versiones ponderadas con imatrix se publican en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (etiqueta `conversational` en el repositorio).
- Alineamiento por preferencias presumiblemente derivado del ajuste DPO indicado en el nombre; sin evaluación publicada que lo respalde.
- Fusión de capacidades de los modelos combinados mediante mergekit: al no documentarse los modelos de origen, no se puede afirmar qué habilidades concretas (código, matemáticas, razonamiento multi-paso) se han conservado o reforzado.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se documenta ningún otro idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible. El repositorio no incluye proyector multimodal (`skip_mmproj: 1` en la receta de cuantización), por lo que no hay soporte de visión en estas cuantizaciones.

## Casos de uso

- Asistente conversacional local en inglés: con la cuantización Q4_K_M (16,6 GB) el modelo cabe en una GPU de 24 GB, lo que permite desplegar un chatbot multi-turno completamente offline en una estación de trabajo, sin coste de API ni envío de datos a terceros.
- Prototipado y evaluación de fusiones de modelos: al ser una versión GGUF de un merge, resulta útil para comparar cualitativamente el comportamiento de la fusión frente a sus componentes en tareas de conversación, usando llama.cpp con temperaturas y prompts idénticos.
- Generación de documentación técnica y textos largos en inglés: adecuado para redactar borradores, resúmenes y reescrituras en un pipeline por lotes, siempre que se valide la calidad de salida, ya que no hay benchmarks publicados.
- Despliegue en servidores sin GPU de datacenter: las cuantizaciones Q2_K (10,6 GB) y Q3_K_S (12,3 GB) permiten ejecución en GPUs de consumo de gama media-alta o en configuraciones con memoria unificada, a costa de una pérdida de calidad noticeable en Q2.
- Base para experimentos de ajuste fino: aunque el GGUF no es entrenable directamente, el modelo base en transformers sirve como punto de partida para LoRA/QLoRA sobre una única GPU de 24-48 GB en precisión reducida.
- Generación de datos sintéticos en inglés para tareas de clasificación o etiquetado: el modelo puede producir ejemplos diversos en lote; requiere revisión humana por el riesgo de alucinación y la ausencia de evaluaciones.
- Sustitución de modelos propietarios en entornos con requisitos de soberanía del dato: al poder ejecutarse en local y bajo licencia Gemma, encaja en escenarios donde no se permite enviar información a servicios externos, siempre que se acepten los términos de dicha licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y tampoco se han encontrado resultados en la búsqueda web realizada (los resultados obtenidos no guardan relación con el modelo). No se dispone, por tanto, de datos que permitan comparar su calidad con alternativas.

## Requisitos de hardware

La siguiente tabla recoge el tamaño en disco de cada cuantización y una estimación de VRAM necesaria para inferencia, calculada como el tamaño de los pesos más un margen de 1,5-3 GB para caché KV y overhead del runtime (el margen real depende de la longitud de contexto, que no está documentada).

| Cuantización | Tamaño en disco | VRAM estimada para inferencia |
|---|---|---|
| Q2_K | 10,6 GB | ~12-14 GB |
| Q3_K_S | 12,3 GB | ~14-16 GB |
| Q3_K_M | 13,5 GB | ~15-17 GB |
| Q3_K_L | 14,6 GB | ~16-18 GB |
| IQ4_XS | 15,0 GB | ~17-19 GB |
| Q4_K_S | 15,8 GB | ~18-20 GB |
| Q4_K_M | 16,6 GB | ~19-21 GB |
| Q5_K_S | 18,9 GB | ~21-23 GB |
| Q5_K_M | 19,4 GB | ~22-24 GB |
| Q6_K | 22,3 GB | ~24-27 GB |
| Q8_0 | 28,8 GB | ~31-34 GB |

- GPUs de consumo: una RTX 4090 (24 GB) ejecuta con holgura Q4_K_M y Q5_K_M, y de forma ajustada Q6_K. Una RTX 3090 (24 GB) se comporta de forma similar. Tarjetas de 16 GB (RTX 4080, 4070 Ti Super) solo admiten Q2_K o Q3_K_S, con posible offload parcial a CPU.
- GPUs profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten Q8_0 completo con contexto amplio y mayor throughput; también habilitan servir varias instancias en paralelo.
- Ejecución en CPU: viable con llama.cpp gracias a las cuantizaciones K-quant, aunque el throughput esperado es bajo (del orden de pocos tokens por segundo en CPUs de escritorio, sin datos medidos disponibles).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos runtimes habría que usar el modelo base en transformers o convertir los pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependen por completo del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para este modelo ni para fusiones comparables, por lo que la comparación se limita a parámetros estructurales. Los valores de los que no hay información se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mira-v1.27-27B-dpo-GGUF (este) | 27,0B | No disponible | gemma | GGUF (11 cuants) | Cuantización estática de un merge con DPO; sin benchmarks ni documentación de la receta |
| Lambent/Mira-v1.27-27B-dpo | 27,0B | No disponible | gemma | transformers | Modelo base del que deriva este repositorio; mismo vacío documental |
| Modelos de la familia Gemma de escala ~27B | No verificado en la información disponible | No disponible | gemma | safetensors, GGUF | Linaje probable según la licencia, no confirmado por el autor |
| Otras fusiones mergekit de ~27-34B | No disponible | No disponible | variable | safetensors, GGUF | Categoría comparable, pero sin datos públicos que permitan un emparejamiento riguroso |

Dado que no hay resultados de evaluación publicados, no es posible afirmar que este modelo sea mejor o peor que sus alternativas; la comparación relevante es de empaquetado (número y granularidad de cuantizaciones) y de licencia.

## Limitaciones y advertencias

- Documentación mínima: no se especifican los modelos fusionados, la técnica de merge, el dataset de DPO, la longitud de contexto ni el tokenizador. Esto impide reproducir el modelo o auditarlo técnicamente.
- Ausencia total de benchmarks: cualquier afirmación sobre su calidad es especulativa. Se recomienda evaluarlo con un conjunto propio de tareas antes de usarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala y no mitigado de forma documentada; sin datos de RLHF verificables más allá del sufijo `-dpo`.
- Idiomas: solo inglés según la model card. El rendimiento en castellano no está evaluado y probablemente sea deficiente en comparación con modelos multilingües explícitos.
- Licencia `gemma`: el uso comercial está sujeto a los Gemma Terms of Use y a la política de usos prohibidos de Google, no a una licencia permisiva tipo Apache 2.0 o MIT. Conviene revisar los términos antes de integrarlo en un producto.
- Calidad de las cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la perplejidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opción rápida y Q6_K/Q8_0 para máxima fidelidad.
- Trazabilidad de la fusión: las fusiones de pesos pueden producir degradaciones no evidentes (pérdida de capacidad de seguir instrucciones, colapso en tareas de código o matemáticas) que no se detectan sin evaluaciones específicas.
- Validación comunitaria prácticamente nula: 75 descargas y 0 likes en el momento de la consulta; no hay informes de terceros que confirmen su comportamiento.
- Repositorio pesado: 186,7 GB en total, por lo que conviene descargar únicamente el archivo de la cuantización necesaria en lugar de clonar el repositorio completo.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Mira-v1.27-27B-dpo-GGUF
- Modelo base: https://huggingface.co/Lambent/Mira-v1.27-27B-dpo
- Cuantizaciones ponderadas con imatrix del mismo modelo: https://huggingface.co/mradermacher/Mira-v1.27-27B-dpo-i1-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Mira-v1.27-27B-dpo-GGUF
- Peticiones de cuantización y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos corresponden a flotas marítimas y son irrelevantes). No se han encontrado papers, blogs, repositorios ni demos adicionales.
