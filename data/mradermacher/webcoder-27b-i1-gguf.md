# mradermacher/WebCoder-27B-i1-GGUF

## Resumen

WebCoder-27B-i1-GGUF es un repositorio de cuantizaciones GGUF publicadas por mradermacher sobre el modelo Roy-DOU/WebCoder-27B, un modelo de 27.320.697.856 parámetros (27,3 B) orientado, por su nombre, a la generación de código y, presumiblemente, al desarrollo web. No se trata por tanto de un modelo entrenado desde cero por mradermacher, sino de una distribución de pesos ya entrenados convertidos a formato GGUF y comprimidos con distintos esquemas de cuantización, incluyendo variantes con imatrix (matriz de importancia) para reducir la pérdida de calidad en los niveles más agresivos.

El interés práctico del repositorio es que permite ejecutar un modelo de 27 B en hardware de consumo mediante llama.cpp y derivados, con un abanico de 24 cuantizaciones que va desde IQ1_S (aproximadamente 6 GB) hasta Q6_K (aproximadamente 22 GB), lo que cubre desde GPUs de 8 GB hasta estaciones de trabajo con 24 GB o más de VRAM. El uso de cuantizaciones ponderadas con imatrix es relevante porque los niveles por debajo de 4 bits suelen degradar de forma notable el razonamiento y la fidelidad sintáctica en código.

La información pública disponible es muy escasa: la model card se limita a una línea que identifica el modelo base y la lista de cuantizaciones generadas. No se documentan arquitectura, longitud de contexto, idiomas, licencia ni resultados de evaluación, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. Cualquier decisión de adopción en producción debería ir precedida de una evaluación propia y de la verificación de la licencia en el repositorio del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la documenta; el recuento de parametros y la etiqueta "conversational" apuntan a un transformer denso, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible; no hay indicios de arquitectura MoE, por lo que se asume densa (sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible (consultar la licencia del modelo base Roy-DOU/WebCoder-27B) |
| Formato de pesos | GGUF (cuantizacion tipo "i1", con imatrix / ponderada; quantize_version 2, convert_type hf) |
| Modelo base | Roy-DOU/WebCoder-27B |
| Cuantizador | mradermacher |
| Tamano del repositorio | 10,9 GB |
| Etiquetas del repo | gguf, imatrix, conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. La model card del repositorio GGUF no incluye detalles de diseño, número de capas, tipo de atención ni mecanismo de positional encoding, y tampoco documenta el proceso de entrenamiento (volumen de tokens, composición del corpus, uso de SFT, RLHF o DPO). El dato objetivo disponible es el recuento de parámetros en safetensors (27.320.697.856), que sitúa al modelo en la franja de 27 B densos, un tamaño habitual para despliegues en una única GPU de 24 GB con cuantización de 4 bits.

La innovación técnica documentada se limita al proceso de cuantización: mradermacher publica variantes "i1" generadas con imatrix (matrices de importancia calculadas a partir de estadísticas de activación), lo que permite asignar menos bits a los tensores menos sensibles y preservar la calidad en niveles de compresión bajos como IQ2 e IQ3. El repositorio incluye además la etiqueta `endpoints_compatible`, que indica compatibilidad con el formato de despliegue de endpoints de HuggingFace, y la versión de herramienta de cuantización 2 con salida tensor-quantised.

## Capacidades

- Generación de código: el nombre del modelo (WebCoder) sugiere especialización en código y, en particular, en desarrollo web; no hay evaluación publicada que lo confirme.
- Conversación multi-turno: la etiqueta `conversational` indica que el modelo está ajustado para diálogo instructivo, no solo para completado de texto.
- Generación de texto general y razonamiento: presumiblemente heredadas del modelo base, sin datos verificables.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se documenta ninguna.

## Casos de uso

- Asistente de desarrollo web en local: con la cuantización Q4_K_M (aproximadamente 17-19 GB de VRAM) el modelo puede generar componentes HTML, CSS y JavaScript manteniendo el contexto del proyecto dentro de la ventana que soporte el modelo base, sin enviar código propietario a servicios externos.
- Autocompletado y refactorización en el IDE: desplegado sobre llama.cpp o un servidor compatible con la API de OpenAI, sirve para reescribir funciones, migrar entre frameworks y aplicar convenciones de estilo en un repositorio privado.
- Generación de tests unitarios y documentación técnica: el modelo puede producir descripciones de funciones y casos de prueba a partir de fragmentos de código; útil como primer borrador que el equipo revisa antes de integrar en el repositorio.
- Chatbot de soporte para producto SaaS: al ser un modelo conversacional, encaja en atención al cliente multi-turno sobre documentación técnica, siempre que se valide la calidad con una batería propia de preguntas y se añada recuperación aumentada para reducir alucinaciones.
- Prototipado de scripts de automatización y scraping: generación de scripts de extracción y transformación de datos para pipelines internos, con ejecución en un entorno aislado y revisión humana previa.
- Laboratorio de investigación y experimentación con cuantizaciones: el abanico de 24 variantes (de IQ1_S a Q6_K) permite medir empíricamente la degradación de calidad por bits por peso en tareas de código, un caso de uso metodológico poco cubierto con modelos de este tamaño.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en infraestructura propia, es apto para organizaciones que no pueden enviar código a APIs de terceros, sujeto a la verificación de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Las cifras siguientes son estimaciones calculadas a partir de los 27,3 B de parámetros y de los bits por peso típicos de cada esquema GGUF; no proceden de mediciones publicadas por el autor.
- IQ1_S / IQ1_M: aproximadamente 6-8 GB de VRAM; apto para GPUs de 8 GB con contexto corto.
- IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: aproximadamente 9-11 GB; cabe en RTX 4070 Ti Super (16 GB), RTX 4080 (16 GB) y RTX 4090 (24 GB).
- IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 12-14 GB; requiere GPU de 16 GB o reparto parcial CPU/GPU.
- IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: aproximadamente 15-19 GB; Q4_K_M entra en RTX 3090 y RTX 4090 (24 GB) con contexto moderado.
- Q5_K_S / Q5_K_M: aproximadamente 19-21 GB; recomendable GPU de 24 GB con contexto recortado o 32 GB para contexto amplio.
- Q6_K: aproximadamente 22-23 GB más KV cache; requiere 24 GB justos o GPU profesional (A100 40 GB, L40S 48 GB) para contextos largos.
- No se incluyen cuantizaciones Q8_0 ni F16 en el repositorio, por lo que la referencia de máxima calidad disponible es Q6_K.
- GPUs recomendadas: RTX 4090 o RTX 3090 para Q4_K_M y Q5_K_M; A100 40 GB, H100 o L40S para Q6_K con ventanas de contexto amplias; para CPU-only, los niveles IQ2 e IQ3 son los únicos viables con RAM de 16-32 GB.
- Opciones de despliegue: llama.cpp (referencia para GGUF e imprescindible para leer las variantes imatrix IQ1-IQ4), Ollama, LM Studio, llama-cpp-python y text-generation-webui. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no son la vía recomendada para estas cuantizaciones.
- Latencia y throughput: no disponibles. Dependen del nivel de cuantización, del offloading a CPU y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebCoder-27B-i1-GGUF (este repo) | 27,3 B | no disponible | GGUF, 24 variantes (IQ1_S a Q6_K), imatrix | no disponible | HuggingFace, 0 descargas registradas |
| Roy-DOU/WebCoder-27B (modelo base) | 27,3 B | no disponible | safetensors (pesos completos) | no disponible | HuggingFace |
| Qwen2.5-Coder-32B-Instruct (GGUF de terceros) | 32,8 B | 131.072 tokens (nativo 32.768) | safetensors y GGUF | Apache 2.0 | Amplia comunidad y ecosistema de cuantizaciones |
| Gemma 2 27B IT (GGUF de terceros) | 27,2 B | 8.192 tokens | safetensors y GGUF | Gemma Terms of Use | Muy extendido, con soporte en llama.cpp y Ollama |

La comparativa es necesariamente limitada: al no haber benchmarks ni contexto declarados para WebCoder-27B, no es posible contrastar calidad frente a las alternativas. La ventaja diferencial del repositorio es la granularidad de cuantizaciones con imatrix; su desventaja, la ausencia total de documentación sobre licencia, idiomas y evaluación, frente a modelos como Qwen2.5-Coder-32B-Instruct, que publican resultados detallados y una licencia permisiva.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio GGUF ni la información disponible indican términos de uso. Es imprescindible verificar la licencia de Roy-DOU/WebCoder-27B antes de cualquier uso comercial.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de código, por lo que el rendimiento real es desconocido.
- Sin validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta; el modelo no ha sido contrastado por terceros.
- Longitud de contexto desconocida: limita el diseño de aplicaciones que dependan de ventanas largas (repositorios completos, conversaciones extensas).
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en code-switching entre español e inglés.
- Degradación esperada en cuantizaciones bajas: IQ1_S, IQ2_XXS y similares comprimen por debajo de 3 bits por peso y suelen producir errores sintácticos y de fidelidad en código; no son adecuadas para producción.
- Riesgo de alucinación: alucinaciones de APIs inexistentes, firmas de funciones inventadas y dependencias falsas son habituales en modelos de código sin evaluación publicada; requiere verificación con compilador y tests.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento del modelo base, no auditado públicamente.
- Metadatos inconsistentes: las fechas de creación y actualización del repositorio (2026-10-25) son posteriores a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar la trazabilidad.
- Sin soporte multimodal: no se declaran capacidades de visión ni audio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WebCoder-27B-i1-GGUF
- Modelo base: https://huggingface.co/Roy-DOU/WebCoder-27B
