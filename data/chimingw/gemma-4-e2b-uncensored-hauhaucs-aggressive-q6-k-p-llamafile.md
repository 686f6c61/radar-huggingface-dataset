# chimingw/gemma-4-e2b-uncensored-hauhaucs-aggressive-q6-k-p-llamafile

## Resumen

Este paquete es un llamafile autocontenido que integra el modelo `HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive` cuantizado en `Q6_K_P`, junto con su proyector multimodal en `f16` y el runtime `llamafile 0.10.5`. El modelo base es una versión "abliterada" (sin censura) del modelo oficial `google/gemma-4-e2b-it`, desarrollada por HauhauCS, que elimina los rechazos a instrucciones manteniendo supuestamente las capacidades originales. El paquete ofrece un único ejecutable que incluye chat de terminal, chat de navegador y una API compatible con OpenAI en localhost.

Gemma 4 E2B es una arquitectura multimodal nativa de Google con 35 capas, atención de ventana deslizante de 512 tokens intercalada con atención completa, y una ventana de contexto nativa de 131.072 tokens. El modelo tiene 2.300 millones de parámetros efectivos (5.100 millones incluyendo embeddings). Este paquete es relevante para quienes buscan un modelo local pequeño, multimodal y sin restricciones de rechazo, listo para ejecutar en macOS o Linux sin instalar un runtime adicional.

El autor del paquete (chimingw) no ha validado de forma independiente las afirmaciones de HauhauCS sobre la ausencia de rechazos ni sobre la preservación de capacidades. La licencia declarada es `gemma`, siguiendo la del repositorio fuente, aunque no se especifica la variante concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 E2B (transformer multimodal, atención deslizante de 512 tokens + atención completa, 35 capas) |
| Parametros totales | 2.300 millones efectivos (5.100 millones incluyendo embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens nativos (8.192 por defecto en el llamafile, ampliable con `--ctx-size`) |
| Tipos de cuantizacion | Q6_K_P con importance matrix (única incluida en este paquete) |
| Idiomas soportados | ingles y multilingue (segun metadatos) |
| Licencia | gemma (sin especificar variante) |
| Formato de pesos | GGUF (Q6_K_P) + proyector multimodal f16, empaquetados en un ejecutable llamafile |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-e2b-it` emplea una arquitectura E2B (efficient-to-be) con 35 capas que intercalan atención de ventana deslizante de 512 tokens con atención completa sobre toda la secuencia. Es multimodal nativo: procesa texto, imagen, video y audio, aunque la entrada de vision y audio requiere el proyector `f16` incluido en el paquete. El contexto nativo es de 131.072 tokens, segun los metadatos del GGUF.

La version de HauhauCS es una modificacion "abliterada" del modelo original, que elimina los rechazos a instrucciones sin alterar los datasets ni las capacidades, segun afirma su autor. La variante "Aggressive" esta completamente desbloqueada y no rechaza prompts, aunque puede anadir descargos de responsabilidad ocasionales heredados del entrenamiento base. El paquete llamafile no ha sido reentrenado ni re-cuantizado; simplemente embebe el GGUF y el proyector originales sin compresion adicional. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de abliteracion (si se uso RLHF, DPO u otra tecnica).

## Capacidades

- Generacion de texto y razonamiento multilingue (ingles y otros idiomas, segun metadatos).
- Entrada multimodal: imagen, video y audio, mediante el proyector `f16` incluido.
- Chat de terminal interactivo y chat de navegador integrados en el ejecutable.
- API local compatible con OpenAI en `http://127.0.0.1:8080/v1`, util para integraciones con herramientas existentes.
- Soporte de plantillas de chat Jinja activadas por defecto.
- Comportamiento "uncensored" (sin rechazos) en la variante Aggressive, segun las afirmaciones del autor de HauhauCS.
- Capacidad de ampliar el contexto hasta 131.072 tokens mediante el parametro `--ctx-size`, sujeto a memoria disponible.
- No se menciona soporte explicito de tool calling ni de agentes multi-step en la informacion disponible.

## Casos de uso

- Despliegue local autocontenido: al ser un unico ejecutable, se puede copiar a una memoria USB y ejecutar en cualquier macOS o Linux compatible sin instalar dependencias. Ideal para entornos offline o con restricciones de instalacion.
- Prototipado rapido de aplicaciones multimodales: la API compatible con OpenAI permite integrar el modelo en scripts de Python, Node.js u otros lenguajes para probar capacidades de vision, audio o texto sin configurar un servidor de inferencia completo.
- Asistente de escritorio privado: el chat de navegador en `localhost:8080` ofrece una interfaz sencilla para consultas de texto e imagen, manteniendo los datos en la maquina local.
- Experimentacion con modelos "uncensored": la variante Aggressive permite evaluar el comportamiento de un modelo sin rechazos en tareas de generacion creativa o de investigacion donde las restricciones del modelo original podrian interferir.
- Educacion e investigacion en IA local: el tamaño reducido (2.300 millones de parametros efectivos) y el empaquetado en llamafile facilitan la ensenanza de tecnicas de inferencia local, cuantizacion y multimodalidad en equipos modestos.
- Generacion de contenido multimodal en entornos aislados: la combinacion de texto, imagen y audio en un solo ejecutable permite crear pipelines de generacion de contenido (por ejemplo, descripciones de imagenes o transcripciones de audio) sin conexion a internet ni dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o sus variantes.

## Requisitos de hardware

- El paquete es un ejecutable llamafile que funciona en macOS (incluido Apple Silicon con aceleracion Metal) y Linux de 64 bits.
- Se necesita RAM suficiente para cargar el modelo GGUF de aproximadamente 3,87 GB y el proyector f16 de aproximadamente 0,99 GB, ademas del runtime (350 MB). El ejecutable total pesa 5,20 GB en disco.
- El contexto por defecto es de 8.192 tokens; ampliarlo a 131.072 tokens aumentara el uso de memoria proporcionalmente al tamano del cache KV.
- No se especifican requisitos de VRAM ni GPU concretas. Al ser un modelo de 2.300 millones de parametros efectivos, puede ejecutarse en CPU con memoria suficiente, aunque la aceleracion Metal en Apple Silicon puede mejorar el rendimiento.
- Opciones de despliegue: el propio llamafile incluye servidor HTTP con API OpenAI-compatible; no se mencionan integraciones con vLLM, Ollama o TGI en este paquete.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-e2b-it (original) | 2.300 M efectivos | 131.072 tokens | Si (texto, imagen, video, audio) | Gemma | Original (safetensors) |
| HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive | 2.300 M efectivos | 131.072 tokens | Si | Gemma | GGUF (varias cuantizaciones) |
| chimingw/gemma-4-e2b-uncensored-hauhaucs-aggressive-q6-k-p-llamafile (este paquete) | 2.300 M efectivos | 131.072 tokens (8.192 por defecto) | Si | Gemma | GGUF Q6_K_P + proyector f16 en llamafile |

La principal diferencia con el modelo original es la eliminacion de rechazos (abliteracion) y el empaquetado en un unico ejecutable. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El comportamiento "uncensored" no ha sido validado de forma independiente por el autor del paquete; las afirmaciones de HauhauCS sobre ausencia de rechazos y preservacion de capacidades deben verificarse antes de usar el modelo en produccion.
- El modelo puede generar contenido inapropiado, ofensivo o perjudicial debido a la eliminacion de rechazos. No debe desplegarse en aplicaciones publicas sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de mecanismos de rechazo.
- La licencia `gemma` no especifica la variante exacta; es necesario revisar los terminos de la licencia Gemma de Google antes de un uso comercial.
- El servidor API se enlaza a localhost por defecto; exponerlo publicamente sin autenticacion, TLS y controles de red es inseguro.
- La compatibilidad multimodal (vision, audio) depende del cliente de entrada y de las capacidades expuestas por llamafile 0.10.5; no se garantiza soporte completo para todos los tipos de medios.
- El contexto de 131.072 tokens es el nativo del GGUF, pero el limite practico depende de la memoria disponible y de la configuracion del cache KV.
- No se proporcionan datos de benchmarks, por lo que no es posible evaluar el rendimiento relativo frente a otros modelos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un paquete reciente y poco probado por la comunidad.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/chimingw/gemma-4-e2b-uncensored-hauhaucs-aggressive-q6-k-p-llamafile
- Modelo base de HauhauCS: https://huggingface.co/HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive
- Modelo original de Google: https://huggingface.co/google/gemma-4-e2b-it
- Runtime llamafile: https://github.com/Mozilla-Ocho/llamafile
