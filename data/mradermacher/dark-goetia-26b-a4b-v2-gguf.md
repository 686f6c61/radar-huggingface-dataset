# mradermacher/Dark-Goetia-26B-A4B-v2-GGUF

## Resumen

Dark-Goetia-26B-A4B-v2-GGUF es una cuantizacion GGUF del modelo Dark-Goetia-26B-A4B-v2, desarrollado por el usuario mradermacher en Hugging Face. Se trata de un modelo de lenguaje de gran tamano con arquitectura de mezcla de expertos (MoE) que, segun su nomenclatura, cuenta con 26 mil millones de parametros totales y 4 mil millones de parametros activos por token. La version GGUF esta pensada para facilitar la ejecucion en hardware local o en entornos con recursos limitados, ya que los pesos se convierten a formatos cuantizados que reducen el uso de memoria y aceleran la inferencia.

El repositorio contiene multiples archivos de cuantizacion (desde Q2_K hasta F16) y esta etiquetado como compatible con endpoints, lo que sugiere que puede desplegarse en servidores de inferencia. Aunque la ficha original no proporciona detalles sobre el entrenamiento, la licencia o los idiomas soportados, el tag "conversational" indica que el modelo esta orientado a tareas de dialogo y generacion de texto conversacional. La fecha de creacion (agosto de 2026) y la ausencia de descargas o likes sugieren que es un lanzamiento reciente y aun sin adopcion masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun nomenclatura, sin confirmacion oficial |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | 4.000.000.000 (estimado segun el sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles sobre la arquitectura interna del modelo base. El nombre "Dark-Goetia-26B-A4B-v2" sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parametros totales y 4 mil millones activos, un patron comun en modelos recientes para reducir el coste computacional durante la inferencia. Sin embargo, no se ha publicado informacion sobre el numero de expertos, la dimension del modelo, el tipo de atencion o el proceso de entrenamiento (datos, tokens, tecnicas de alineacion como RLHF o DPO).

La version GGUF es una conversion del modelo original en formato safetensors a cuantizaciones de menor precision. El autor indica que se trata de "static quants" del modelo alojado en 26B-Suite/Dark-Goetia-26B-A4B-v2, lo que implica que los pesos se han cuantizado de forma estatica (sin calibracion dinamica) y se ofrecen en varios niveles de precision para adaptarse a diferentes capacidades de hardware.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta disenado para mantener dialogos y responder a entradas de texto de forma natural.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede integrarse en servicios de inferencia como vLLM, TGI o similares.
- Ejecucion local eficiente: gracias a las cuantizaciones GGUF, puede ejecutarse en hardware consumer con VRAM limitada, aunque no se especifican requisitos minimos.
- No se dispone de informacion sobre capacidades adicionales como tool calling, razonamiento avanzado, soporte multilingue o vision.

## Casos de uso

- Chatbots y asistentes virtuales: al ser un modelo conversacional, puede integrarse en aplicaciones de atencion al cliente, asistentes personales o sistemas de dialogo en tiempo real.
- Generacion de texto creativo: util para redactar historias, guiones o contenido literario, aunque no se han publicado evaluaciones de calidad en este ambito.
- Prototipado rapido de aplicaciones de IA: al estar disponible en formato GGUF, permite a desarrolladores probar el modelo en entornos locales sin necesidad de infraestructura cloud.
- Despliegue en servidores de inferencia: gracias a la compatibilidad con endpoints, puede servir peticiones a traves de APIs REST en entornos de produccion.
- Investigacion academica: como modelo de tamano medio (26B totales, 4B activos), puede utilizarse para estudiar el comportamiento de arquitecturas MoE en tareas de lenguaje.
- Experimentacion con cuantizacion: los multiples formatos de cuantizacion permiten analizar el equilibrio entre precision y rendimiento en diferentes hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Para Q4_K_M (la mas comun), el archivo ocupa aproximadamente 15 GB, por lo que se necesitan al menos 16 GB de VRAM. Para Q2_K, el archivo es menor (alrededor de 10 GB) y puede caber en GPUs con 12 GB. La version F16 requeriria mas de 25 GB de VRAM.
- GPU recomendadas: para cuantizaciones bajas (Q2_K, Q3_K), una RTX 3060 12GB o RTX 4060 Ti 16GB puede ser suficiente. Para Q4_K_M o superiores, se recomienda RTX 4090 24GB, A100 40GB o H100.
- Si cabe en consumer GPU: si, con cuantizaciones Q2_K o Q3_K en GPUs de 12-16 GB, y con Q4_K_M en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, o cualquier framework que acepte archivos GGUF.
- Latencia y throughput: no disponible, pero al ser un modelo MoE con solo 4B activos, la inferencia es mas rapida que un modelo denso de 26B, aunque depende del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria. Existen otras versiones de la familia Goetia (por ejemplo, Goetia-26B-A4B-v1.3) pero no se han publicado datos de rendimiento ni especificaciones detalladas. La comparativa se limita a aspectos estructurales:

| Modelo | Parametros totales | Parametros activos | Formato | Licencia |
|---|---|---|---|---|
| Dark-Goetia-26B-A4B-v2-GGUF | 25.2B | 4B (estimado) | GGUF | no disponible |
| Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-GGUF | no disponible | no disponible | GGUF | no disponible |
| Goetia-26B-A4B-v1.4-I1-GGUF | no disponible | no disponible | GGUF | no disponible |

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo sin documentacion oficial, se desconoce su comportamiento en escenarios de produccion.
- La licencia no esta especificada, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor o consultar el modelo base antes de utilizarlo en aplicaciones comerciales.
- El modelo base (Dark-Goetia-26B-A4B-v2) tampoco tiene informacion publica sobre su entrenamiento, lo que limita la confianza en su calidad y seguridad.
- Al ser una cuantizacion estatica, puede haber perdida de precision en comparacion con el modelo original en tareas que requieren alta exactitud.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad y puede contener errores o problemas de compatibilidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v2-GGUF
- Modelo base (26B-Suite/Dark-Goetia-26B-A4B-v2): https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v2
- Otros modelos de la familia (referencia): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-i1-GGUF
