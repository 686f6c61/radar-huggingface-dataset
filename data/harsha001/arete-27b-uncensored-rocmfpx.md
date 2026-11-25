# Harsha001/Arete-27B-Uncensored-ROCmFPX

## Resumen

Arete-27B-Uncensored-ROCmFPX es una distribucion de pesos cuantizados en formato GGUF del modelo SargeDev/Arete-27B-Uncensored, que a su vez deriva de NousResearch/Arete-27B, un ajuste fino completo de Qwen3.8-27B. El autor de esta publicacion, Harsha001, no entrena el modelo: se limita a aplicar un esquema de cuantizacion propio denominado ROCmFPX, orientado a hardware AMD (en particular a equipos con APU Strix Halo y a la API Vulkan), y a empaquetar los pesos en tres precisiones (8, 6 y 4 bits).

El modelo subyacente tiene 27.320.698.360 parametros (unos 27,3 mil millones) y una unica modalidad de texto en ingles. Su rasgo definitorio es la abliteracion aplicada por SargeDev mediante la tecnica OBLITERATUS, que elimina la direccion de rechazo aprendida durante el alineamiento de seguridad, de modo que el modelo deja de negarse a peticiones que un modelo convencional rechazaria. Ademas, SargeDev reincorporo la cabeza de prediccion multi-token (MTP) de una capa que Qwen3.8 incluye de serie.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo de razonamiento de ~27B; por otro, introduce un formato de cuantizacion no estandar que requiere un fork especifico de llama.cpp y que, segun las mediciones del autor, iguala o mejora la fidelidad de las cuantizaciones stock de llama.cpp en 8 y 6 bits. Los archivos no han sido probados en hardware AMD real por el autor, lo que constituye una advertencia importante para cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con cabeza MTP de una capa anadida; cuantizacion GGUF con esquema ROCmFPX |
| Parametros totales | 27.320.698.360 (~27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 ROCmFPX (28,3 GB), Q6_0 ROCmFPX (22,5 GB), Q4_0 ROCmFP4_STRIX_O8 (19,3 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (variante ROCmFPX, requiere fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Arete-27B, descrito por el autor como un ajuste fino completo (full fine-tune) alineado con valores de Qwen3.8-27B, desarrollado por el equipo de Qwen. Se trata, por tanto, de un transformer denso de ~27,3B parametros, no de una arquitectura MoE ni hibrida. Sobre esa base, SargeDev aplico la tecnica OBLITERATUS para eliminar la direccion de rechazo del modelo (abliteration) y anadio la cabeza de prediccion multi-token (MTP) de una capa que Qwen3.8 incorpora de fabrica; esa cabeza MTP esta presente en los archivos publicados pero, segun el autor, no ha sido probada.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el ajuste original de Nous Research. Lo que si se documenta con rigor es el proceso de cuantizacion: el autor midio la divergencia KL respecto a un GGUF BF16 convertido desde los pesos de SargeDev (perplejidad 6,28) usando `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en ingles, en una GPU NVIDIA GB10, expandiendo previamente cada archivo a F16. Los resultados son Q8_0 ROCmFPX con KL 0,00030 y 99,2% de coincidencia en el token superior; Q6_0 ROCmFPX con KL 0,0021 y 97,6%; y Q4_0 ROCmFP4_STRIX_O8 con KL 0,021 y 93,6%. Frente a las cuantizaciones stock de llama.cpp (Q8_0: KL 0,00038 y 99,1%; Q6_K: KL 0,0024 y 97,9%; Q4_K_M: KL 0,016 y 94,7%), el esquema ROCmFPX es mejor en 8 bits y ligeramente mejor en KL en 6 bits, aunque el Q4_K_M stock resulta algo mas fiel y mas pequeno en 4 bits.

## Capacidades

- Generacion de texto en ingles con modo de razonamiento: las pruebas del autor muestran que el modelo emite un bloque de pensamiento antes de la respuesta final.
- Razonamiento aritmetico y de conocimiento general basico: los tres archivos respondieron correctamente a 17 x 23 = 391 y a la capital de Australia.
- Comportamiento sin censura: la abliteracion elimina la direccion de rechazo, de modo que el modelo puede cumplir peticiones que un modelo con entrenamiento de seguridad rechazaria.
- Prediccion multi-token (MTP): los archivos incluyen la cabeza MTP de una capa anadida por SargeDev, pensada para decodificacion especulativa, aunque no ha sido validada.
- Conversacion multi-turno: la etiqueta `conversational` y el pipeline `text-generation` indican soporte de dialogo, si bien no se documentan detalles de plantilla de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo API.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion sobre alineamiento y abliteracion: el modelo permite estudiar empiricamente como la eliminacion de la direccion de rechazo afecta a la distribucion de respuestas, comparando el BF16 original con las cuantizaciones y midiendo tasas de rechazo con conjuntos controlados.
- Generacion creativa sin restricciones de contenido: util para escritura de ficcion, guiones o narrativa que aborde temas sensibles y que un modelo alineado rechazaria; requiere revision humana y moderacion propia antes de cualquier publicacion.
- Despliegue en equipos AMD con APU Strix Halo: el archivo Q4_0 ROCmFP4_STRIX_O8 (19,3 GB) esta disenado para ejecutarse con los kernels FP4 rapidos del fork ROCmFPX, manteniendo atencion y salida en 8 bits, lo que permite inferencia local en hardware integrado de gama alta.
- Evaluacion de tecnicas de cuantizacion: los datos de KL y coincidencia de token superior permiten usar estos archivos como referencia en estudios comparativos entre esquemas de cuantizacion (ROCmFPX frente a stock) sobre un modelo de ~27B.
- Prototipado de asistentes conversacionales en ingles: con 27,3B parametros y licencia Apache-2.0, sirve para construir demos internas de dialogo multi-turno siempre que se anada una capa de moderacion externa.
- Pruebas de decodificacion especulativa: la presencia de la cabeza MTP permite experimentar con tecnicas de prediccion multi-token en el fork de llama.cpp, aunque el autor advierte que esa cabeza no ha sido probada.
- Analisis de robustez y seguridad: util para construir conjuntos de prueba de peticiones potencialmente daninas y medir la respuesta del modelo, como hizo el autor con 10 peticiones y 8 preguntas inofensivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de fidelidad de cuantizacion (divergencia KL y coincidencia en el token superior), recogidas en la tabla siguiente.

| Archivo | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Arete-27B-Uncensored-Q8_0_ROCMFPX | 28,3 GB | 0,00030 | 99,2% |
| Arete-27B-Uncensored-Q6_0_ROCMFPX | 22,5 GB | 0,0021 | 97,6% |
| Arete-27B-Uncensored-Q4_0_ROCMFP4_STRIX_O8 | 19,3 GB | 0,021 | 93,6% |
| Stock Q8_0 (referencia) | 29,0 GB | 0,00038 | 99,1% |
| Stock Q6_K (referencia) | 22,4 GB | 0,0024 | 97,9% |
| Stock Q4_K_M (referencia) | 16,8 GB | 0,016 | 94,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 28,3 GB para el archivo Q8_0, 22,5 GB para el Q6_0 y 19,3 GB para el Q4_0 Strix, sin contar el espacio para el contexto KV.
- GPU recomendadas: el autor midio la fidelidad en una NVIDIA GB10; los archivos ROCmFPX estan orientados a hardware AMD, en particular APU Strix Halo con los kernels FP4 del fork. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: el Q4_0 Strix (19,3 GB) puede caber en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) si el contexto es moderado; el Q8_0 (28,3 GB) queda fuera de las GPU de consumo de 24 GB.
- Opciones de despliegue: exclusivamente el fork HarshaVardhan3002/ROCmFPX de llama.cpp compilado desde el 7 de noviembre de 2026 o posterior. llama.cpp stock, LM Studio, Ollama y versiones anteriores del fork no cargaran estos archivos.
- Latencia y throughput: no disponibles. El autor indica que los archivos no han sido probados en hardware AMD y solicita a la comunidad que reporte velocidad y calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-ROCmFPX | ~27,3B | no disponible | Apache-2.0 | GGUF ROCmFPX en HF | Requiere fork de llama.cpp; sin probar en AMD |
| NousResearch/Arete-27B | ~27,3B | no disponible | Apache-2.0 | Pesos originales en HF | Version alineada con valores, con rechazo activo |
| SargeDev/Arete-27B-Uncensored | ~27,3B | no disponible | Apache-2.0 | Pesos originales en HF | Abliterado con OBLITERATUS, con cabeza MTP |
| Cuantizaciones stock de llama.cpp (Q8_0, Q6_K, Q4_K_M) | ~27,3B | no disponible | Apache-2.0 | GGUF estandar | Compatibles con llama.cpp, LM Studio y Ollama; Q4_K_M mas fiel y pequeno que el Q4 ROCmFPX |

## Limitaciones y advertencias

- Ausencia total de entrenamiento de seguridad: la abliteracion elimina la direccion de rechazo, por lo que el modelo puede cumplir peticiones daninas, ilegales u ofensivas. El autor exige responsabilidad plena al usuario y desaconseja exponerlo a usuarios finales sin capas propias de seguridad y moderacion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; las unicas comprobaciones son preguntas aisladas de aritmetica y capitales.
- Idiomas: solo ingles segun la model card; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se documenta en la informacion disponible, lo que impide planificar cargas de trabajo de contexto largo.
- Compatibilidad restringida: los archivos solo cargan con el fork ROCmFPX de llama.cpp posterior al 7 de noviembre de 2026; no funcionan en llama.cpp stock, LM Studio, Ollama ni builds antiguas del fork.
- Sin validacion en AMD: el propio autor advierte que los archivos no se han probado en hardware AMD; las mediciones de KL se hicieron en una NVIDIA GB10 tras expandir a F16.
- Cabeza MTP sin probar: los archivos incluyen la cabeza MTP de una capa, pero su funcionamiento no ha sido verificado.
- Fidelidad en 4 bits inferior a la stock: el Q4_0 ROCmFP4_STRIX_O8 tiene mayor KL (0,021) y menor coincidencia (93,6%) que el Q4_K_M stock (0,016 y 94,7%), y ademas ocupa mas espacio (19,3 GB frente a 16,8 GB).
- Pruebas de rechazo limitadas: el autor midio 1 rechazo de 10 peticiones daninas y 0 de 8 preguntas inofensivas, buscando frases de rechazo en los primeros 64 tokens; no es una medida de utilidad ni de precision.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado recae integramente en el usuario.
- Repositorio con 354 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Arete-27B-Uncensored-ROCmFPX
- Modelo base sin censura: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Modelo original: https://huggingface.co/NousResearch/Arete-27B
- Fork de llama.cpp requerido: https://github.com/HarshaVardhan3002/ROCmFPX
