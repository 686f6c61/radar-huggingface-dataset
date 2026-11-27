# mradermacher/Qwensploit-V2-27B-heretic-i1-GGUF

## Resumen

Qwensploit-V2-27B-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo Qwensploit-V2-27B-heretic, un ajuste fino de la familia Qwen (etiquetado como qwen3.8 en los metadatos) orientado a tareas de ciberseguridad y con las negativas (refusals) reducidas mediante un proceso de ablacion ("heretic"). El modelo original lo desarrolla el usuario dsdsdewe, y esta version cuantizada la publica mradermacher, conocido por generar cuantizaciones imatrix de alta calidad para llama.cpp.

El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano, aptos para despliegue en una o varias GPU de gama alta. La cuantizacion esta pensada para reducir el peso del modelo (desde los ~54 GB en fp16 hasta los 11-16 GB de las variantes mas agresivas) y permitir su ejecucion en hardware mas modesto, manteniendo en lo posible la calidad del original mediante el uso de una matriz de importancia (imatrix).

La relevancia de esta ficha radica en que combina dos tendencias actuales: los modelos especializados en dominios tecnicos (ciberseguridad) y las tecnicas de "abliteracion" o reduccion de rechazos, que buscan un modelo menos restrictivo para tareas de seguridad ofensiva y defensiva. No obstante, esta orientacion conlleva implicaciones eticas y de licencia que deben considerarse antes de su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen, etiquetado qwen3.8 en metadatos); no se especifica en la model card |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (se listan ademas IQ1_M, IQ2_XXS, IQ2_XS, IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K como quants disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | see-base-models (licencia "other", enlazada a la del modelo base) |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card de esta cuantizacion no proporciona detalles sobre la arquitectura interna mas alla de los metadatos que indican la familia Qwen (qwen3.8) y que se trata de un modelo de vision (la propia model card indica "This is a vision model"). El modelo base es dsdsdewe/Qwensploit-V2-27B-heretic, que a su vez deriva de un ajuste fino de ciberseguridad (referenciado a xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8 en el enlace de licencia). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable es el proceso de "ablacion" (heretic) que da nombre al modelo: se trata de una tecnica de modificacion de pesos que reduce la tendencia del modelo a rechazar peticiones (reduced-refusals), presumiblemente mediante la identificacion y supresion de direcciones de activacion asociadas a comportamientos de negativa. La cuantizacion de mradermacher utiliza una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas convencionales.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en contenido tecnico de ciberseguridad.
- Razonamiento y asistencia en tareas de seguridad ofensiva y defensiva (analisis de vulnerabilidades, explicacion de exploits, redaccion de informes tecnicos), segun la orientacion del ajuste fino.
- Reduccion de negativas: el proceso de ablacion busca que el modelo responda a peticiones que un modelo alineado convencional rechazaria.
- Capacidades de vision (la model card indica explicitamente que es un modelo de vision; los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estaticas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Analisis de vulnerabilidades en entornos controlados: el modelo puede ayudar a interpretar resultados de escaneres y redactar explicaciones tecnicas de fallos de seguridad, aprovechando su ajuste especifico en ciberseguridad.
- Redaccion de informes de penetration testing: dado su enfoque en seguridad y su reduccion de negativas, puede generar borradores de hallazgos y recomendaciones de remediacion para equipos de seguridad autorizados.
- Formacion y concienciacion en seguridad: puede emplearse en laboratorios de ensenanza para explicar tecnicas de ataque y defensa en un entorno aislado, con la supervision adecuada.
- Investigacion sobre alineacion y seguridad de modelos: la variante "heretic" es util como objeto de estudio para analizar como la ablacion afecta a los comportamientos de rechazo y a los sesgos del modelo.
- Asistente de analisis de codigo malicioso: puede apoyar en la interpretacion de fragmentos de codigo sospechoso en tareas de respuesta a incidentes, siempre en un entorno sandbox.
- Despliegue local en estaciones de trabajo de seguridad: gracias a las cuantizaciones GGUF (desde 11,3 GB en i1-Q2_K), puede ejecutarse con llama.cpp u Ollama en equipos con GPU consumer de gama alta, sin depender de servicios en la nube para datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~27,3 B parametros):
  - i1-Q2_K (11,3 GB): aproximadamente 12-14 GB de VRAM con contexto moderado.
  - i1-IQ3_M (13,1 GB): aproximadamente 14-16 GB de VRAM.
  - i1-Q4_K_S (15,9 GB): aproximadamente 17-20 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para cuantizaciones Q4 o inferiores; RTX 3090 (24 GB) tambien viable en Q4.
- Cabe en GPU consumer: si, en RTX 4090/3090 (24 GB) con cuantizaciones Q4_K_S o inferiores; en GPUs de 16 GB solo con cuantizaciones muy agresivas (Q2_K/IQ3) y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa (requeririan el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit-V2-27B-heretic (este) | ~27,3 B | No disponible | Ciberseguridad, reduced-refusals | see-base-models | GGUF (este repo) y safetensors (base) |
| Qwen2.5-32B-Instruct | 32,5 B | 128K (segun documentacion de Qwen) | Proposito general, alineado | Apache 2.0 (segun Qwen) | Safetensors y multiples GGUF |
| Qwen2.5-14B-Instruct | 14,7 B | 128K (segun documentacion de Qwen) | Proposito general, alineado | Apache 2.0 (segun Qwen) | Safetensors y multiples GGUF |

Nota: los datos de los modelos Qwen de referencia se incluyen a titulo orientativo; no se dispone de benchmarks del modelo de esta ficha para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- La reduccion de negativas ("heretic") implica que el modelo puede generar contenido danino, ilegal o eticamente problematico; su uso debe restringirse a entornos autorizados y con supervision.
- Riesgo elevado de alucinacion en contenido tecnico: no se han publicado evaluaciones de fidelidad, por lo que las respuestas sobre vulnerabilidades o exploits deben verificarse manualmente.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Licencia "see-base-models": es una licencia "other" que remite a la del modelo base; es imprescindible revisar los terminos del modelo base (dsdsdewe/Qwensploit-V2-27B-heretic y xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8) antes de cualquier uso comercial, ya que puede haber restricciones adicionales.
- Longitud de contexto no documentada: planificar el despliegue con contexto conservador hasta verificarla empiricamente.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de comunidad ni validacion independiente de su calidad.
- La cuantizacion i1-Q2_K puede degradar notablemente la calidad; para produccion se recomienda Q4_K_S o superior.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Qwensploit-V2-27B-heretic-i1-GGUF
- Modelo base: https://huggingface.co/dsdsdewe/Qwensploit-V2-27B-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwensploit-V2-27B-heretic-GGUF
- Pagina de resumen del autor de cuantizaciones: https://hf.tst.eu/model#Qwensploit-V2-27B-heretic-i1-GGUF
- Licencia referenciada: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Referencia sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de README de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
