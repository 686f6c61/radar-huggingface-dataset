# datamart99/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una redistribución en formato GGUF del modelo Qwen3.8-27B (Qwen, Alibaba) con un perfil de "descensura" agresivo aplicado por HauhauCS, publicado en HuggingFace bajo la cuenta datamart99. El modelo conserva la arquitectura original: un transformer denso de 27B con 64 capas, encoder de visión y una arquitectura híbrida de atención que combina 48 capas Gated DeltaNet con 16 capas de atención con compuertas. Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, y mantiene las capacidades multimodales (imagen y vídeo) del modelo base mediante un proyector BF16 separado.

La modificación principal respecto al base es de comportamiento, no de capacidades: el autor declara 0 rechazos en 465 pruebas y una variante "Aggressive" que responde de forma directa y sin preámbulo en prompts difíciles. A esto se suma HauhauCS FastMTP, un sidecar de decodificación especulativa que aprovecha la cabeza MTP/NextN nativa del modelo y que el autor cifra en hasta 3,02x de velocidad de generación en documentos y 1,93x en razonamiento frente a configuraciones sin MTP.

El interés práctico está en que ofrece un 27B multimodal con contexto muy largo en cuantizaciones que caben en GPUs de consumo (desde 10,32 GB en IQ2_M hasta 31,46 GB en Q8_K_P), con licencia Apache 2.0. Como contrapartida, es un lanzamiento sin validación externa (0 descargas y 0 likes en el momento de redactar esta ficha), con fechas de creación declaradas en 2026, y con una discrepancia notable entre el nombre del modelo (27B) y el recuento de parámetros de los metadatos safetensors (1.863.907.840, es decir ~1,86B), que conviene verificar antes de desplegarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de visión; híbrido de 48 capas Gated DeltaNet y 16 capas de atención con compuertas |
| Parametros totales | 27B según el nombre del modelo; 1.863.907.840 (~1,86B) según los metadatos safetensors del repositorio (dato contradictorio, no aclarado en la model card) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; más proyector de visión BF16 y sidecar FastMTP-32K |
| Idiomas soportados | en, zh, multilingual (según etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF exclusivamente (el repositorio no incluye safetensors; el proyector multimodal y el sidecar FastMTP también son GGUF) |
| Capas del modelo de lenguaje | 64 |
| Hidden size | 5.120 |
| Tamano de FFN | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Tamano del repositorio | 172,5 GB |
| Descargas / likes | 0 / 0 (en el momento de redactar la ficha) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 27B con 64 capas, hidden size de 5.120 y FFN de 17.408. La innovación estructural es la mezcla de capas: 48 capas emplean Gated DeltaNet (atención lineal con estado recurrente) y 16 capas usan atención con compuertas. Esta combinación reduce el coste del caché KV en contextos largos y es la que permite sostener los 262.144 tokens nativos y la extensión declarada hasta 1.000.000. El modelo incluye además una cabeza MTP/NextN embebida en los tensores de texto, que actúa como cabecera de predicción multi-token para decodificación especulativa, y un encoder de visión para entrada de imagen y vídeo.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si hubo RLHF, DPO u otras etapas de alineación: la model card indica explícitamente que no se han modificado los datasets ni las capacidades previstas del modelo base, y que el trabajo del autor se limita al perfil de "descensura" y a la aceleración. La aceleración FastMTP es un sidecar de 903 MB que se distribuye aparte y que el autor declara cualificado para toda la gama de cuantizaciones a máxima ventana nativa; requiere soporte de decodificación especulativa MTP en el runtime (llama.cpp). Las cuantizaciones K_P ("Perfect") son perfiles de cuantización personalizados del autor que, según su descripción, aumentan la calidad uno o dos niveles a cambio de un 5–15% más de tamaño, y siguen siendo GGUFs estándar compatibles con llama.cpp y LM Studio.

## Capacidades

- Generación de texto y razonamiento multietapa, conservando las capacidades del Qwen3.8-27B original según el autor.
- Comprensión de imagen y vídeo mediante el proyector multimodal BF16 (pipeline declarado image-text-to-text).
- Contexto largo: 262.144 tokens nativos y extensión declarada hasta 1.000.000, útil para documentos extensos y conversaciones multi-turno largas.
- Capacidades agénticas y de razonamiento de varios pasos, heredadas del modelo base.
- Multilingüe, con soporte declarado de inglés, chino y otros idiomas.
- Perfil "uncensored" agresivo: el autor declara 0 rechazos en 465 pruebas y respuestas directas sin preámbulo en prompts difíciles.
- Aceleración de decodificación especulativa mediante HauhauCS FastMTP sobre la cabeza MTP/NextN nativa.
- No hay confirmación en la información disponible de soporte explícito de tool calling o function calling en esta ficha; debe verificarse contra el modelo base.

## Casos de uso

- Red teaming y evaluación de seguridad: el perfil agresivo sin rechazos permite generar respuestas que un modelo alineado bloquearía, lo que resulta útil para auditar clasificadores de contenido, probar filtros de moderación y construir conjuntos de datos adversarios controlados en entornos de laboratorio.
- Escritura creativa y ficción con temas sensibles: al no auto-censurar preámbulos ni forzar cumplimiento, encaja en narrativa adulta, terror o drama donde otros modelos introducen rodeos que rompen el tono.
- Procesamiento de documentos largos con visión: los 262.144 tokens de contexto más el encoder visual permiten introducir informes completos con tablas, gráficos y figuras para extracción estructurada o resumen, sin trocear el documento.
- Analítica de vídeo e imagen a escala local: con el proyector BF16 de 931 MB se pueden generar descripciones, transcripciones de escenas o etiquetado sobre material audiovisual en infraestructura propia.
- Agentes de larga duración sobre repositorios o bases documentales: el contexto extensible hasta 1.000.000 tokens admite mantener el estado de una tarea agéntica con muchos artefactos intermedios, aunque el propio autor recomienda una variante "Balanced" para trabajo agéntico crítico de contexto largo.
- Generación acelerada de documentación técnica: con el sidecar FastMTP, el autor declara hasta 3,02x de velocidad en generación de documentos frente a configuraciones sin MTP, lo que reduce el coste de producir manuales, changelogs o documentación de API en lote.
- Despliegue local en GPU de consumo: las cuantizaciones IQ2_M (10,32 GB) y Q3_K_P (13,44 GB) permiten ejecutar un modelo de 27B en GPUs de 12–16 GB, algo relevante para desarrolladores que no tienen acceso a clústeres.
- Asistencia en chino e inglés en la misma instancia: el soporte declarado de ambos idiomas permite atender flujos bilingües sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. La model card solo aporta cifras relativas de aceleración declaradas por el autor, no comparables con tablas de benchmarks convencionales:

| Metrica | Valor declarado por el autor |
|---|---|
| Velocidad de generación en documentos (TG) frente a sin MTP | hasta 3,02x |
| Velocidad de generación en razonamiento (TG) frente a sin MTP | hasta 1,93x |
| TG en documentos frente a MTP embebido estándar | hasta +35,2% |
| TG en razonamiento frente a MTP embebido estándar | hasta +21,1% |
| Tasa de rechazos (perfil Aggressive) | 0 de 465 pruebas |

No se dispone de tokens por segundo absolutos, latencia ni métricas de calidad (perplejidad, precisión en tareas) para ninguna de las cuantizaciones.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del tamaño de los ficheros GGUF publicados más el caché KV y los buffers de runtime; el autor no publica requisitos oficiales.

- Q8_K_P (31,46 GB): requiere 40 GB o más de VRAM; A100 40 GB, H100 80 GB, RTX 6000 Ada 48 GB o dos RTX 4090.
- Q6_K_P (25,92 GB): 32 GB de VRAM o más; A100 40 GB, L40S 48 GB, o 2x RTX 3090/4090.
- Q5_K_P (20,22 GB): 24 GB de VRAM con margen ajustado; RTX 3090, RTX 4090, A10G 24 GB.
- Q4_K_P (17,92 GB) / Q4_K_M: la opción más equilibrada para 24 GB; cabe en RTX 4090, RTX 3090, L4 24 GB.
- IQ4_XS (15,71 GB): apta para 24 GB con holgura y para 16 GB con contexto recortado.
- Q3_K_P (13,44 GB) / IQ3_M (12,79 GB) / IQ3_XS (12,18 GB): viables en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, Tesla T4 16 GB) con KV cache reducido.
- Q2_K_P (10,68 GB) / IQ2_M (10,32 GB): permiten arrancar en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) asumiendo pérdida de calidad por la cuantización agresiva.
- Sumar 931 MB si se usa el proyector de visión BF16 y 903 MB para el sidecar FastMTP-32K.
- El caché KV es comparativamente contenido gracias a las 48 capas Gated DeltaNet, pero las 16 capas de atención con compuertas escalan con la longitud de contexto: a 262.144 tokens las necesidades de memoria crecen de forma apreciable y conviene reservar varios GB adicionales.
- Despliegue: llama.cpp y LM Studio son los runtimes naturales para GGUF; Ollama es una opción si acepta estos ficheros; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían conversión a safetensors, que este repositorio no incluye.
- La decodificación especulativa FastMTP exige un build de llama.cpp con soporte MTP/NextN y la carga del sidecar correspondiente; sin él, el modelo funciona igual pero sin la aceleración declarada.
- Latencia y throughput absolutos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF) | 27B según nombre; ~1,86B según metadatos safetensors | 262.144, extensible a 1.000.000 | Apache 2.0 | GGUF + proyector BF16 + sidecar FastMTP | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (modelo base declarado) | 27B denso | 262.144 nativos (según la ficha del derivado) | No disponible en la información proporcionada para el base | No disponible | HuggingFace (referenciado como base_model) |
| Otras variantes "uncensored"/abliterated de modelos Qwen de 27–32B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre esta variante y el modelo base ni con alternativas de la misma categoría, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Perfil sin alineación de seguridad: el autor declara 0 rechazos en 465 pruebas. Esto implica ausencia de barreras frente a contenido dañino, ilegal o peligroso; no debe exponerse a usuarios finales sin moderación externa.
- La variante "Aggressive" prioriza la respuesta directa sobre el cumplimiento; el propio autor advierte que para trabajo agéntico de contexto largo en entornos críticos de fiabilidad es más seguro usar una variante "Balanced" cuando exista.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación para este derivado. Las cuantizaciones bajas (IQ2_M, Q2_K_P entre 3,02 y 3,12 BPW) degradan la calidad de forma significativa.
- Discrepancia de datos sin resolver: el nombre indica 27B pero los metadatos safetensors del repositorio registran 1.863.907.840 parámetros. Hay que verificar el contenido real antes de integrar el modelo en un pipeline.
- Procedencia: el repositorio pertenece a la cuenta datamart99, mientras que la model card, los enlaces de descarga de los ficheros y el Discord apuntan a HauhauCS. Es posible que se trate de un espejo o re-subida; conviene contrastar con el repositorio original de HauhauCS antes de confiar en la integridad de los pesos.
- Cero validación de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni evaluaciones independientes.
- Fechas anómalas: los campos de creación y actualización indican 2026-09-26, lo que dificulta situar la versión y el estado de mantenimiento.
- Las etiquetas de idioma declaran en, zh y multilingual, sin detalle de cobertura real; no hay evaluación de calidad por idioma, incluido el español.
- Las métricas de aceleración (3,02x y 1,93x) son afirmaciones del autor sin metodología publicada; dependen del hardware, del contexto y del build de llama.cpp.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad legal por el contenido generado ni sustituye las obligaciones de moderación aplicables en cada jurisdicción.
- No se confirma en la información disponible soporte de tool calling ni de integración con APIs tipo OpenAI a pesar de la etiqueta endpoints_compatible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/datamart99/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del autor en HuggingFace (referenciado en los enlaces de descarga): https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper: no disponible
- Blog técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
