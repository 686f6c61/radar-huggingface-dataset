# mradermacher/MiniCPM5-2B-Supertool-Uncensored-GGUF

## Resumen

MiniCPM5-2B-Supertool-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo MiniCPM5-2B-Supertool-Uncensored, publicado por el usuario mradermacher en Hugging Face. El modelo base procede de saidutta69/MiniCPM5-2B-Supertool-Uncensored, que a su vez parece derivar de la familia MiniCPM5 de 2.000 millones de parametros, orientada a tareas de tool calling y con un ajuste "uncensored" (sin los filtros de rechazo habituales). El repositorio que nos ocupa no aporta informacion adicional sobre arquitectura, entrenamiento o capacidades: se limita a ofrecer los pesos ya convertidos a GGUF para su uso en motores de inferencia locales.

La relevancia de esta publicacion es practica: los ficheros GGUF permiten ejecutar el modelo en CPU y GPU de consumo mediante llama.cpp, Ollama o LM Studio, algo imposible con los pesos originales en safetensors si no se dispone de hardware dedicado. El repositorio incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta Q8_0, ademas de F16 e IQ4_XS), lo que facilita ajustar el equilibrio entre calidad y consumo de memoria en funcion del hardware disponible.

No obstante, la informacion publicada es muy escasa: no se declara licencia, no se especifican idiomas soportados, no hay resultados de benchmarks ni una model card descriptiva mas alla de los metadatos de la conversion. Cualquier evaluacion rigurosa del modelo requiere consultar el repositorio del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica familia MiniCPM5, sin confirmar) |
| Parametros totales | 2B (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizacion estatica, convert_type: hf, quantize_version: 2) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en la documentacion disponible. El nombre "MiniCPM5-2B" sugiere la familia MiniCPM de OpenBMB, pero no se confirma en la model card. Tampoco se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO.

El sufijo "Supertool" apunta a un ajuste fino orientado a tool calling o function calling, y "Uncensored" indica que se ha eliminado o reducido el alineamiento de rechazo respecto al modelo original. Ninguna de estas afirmaciones puede verificarse con la informacion proporcionada.

Respecto al proceso de conversion, los metadatos indican que se trata de una cuantizacion estatica (`quantize_version: 2`) con tensiones de salida cuantizadas (`output_tensor_quantised: 1`) y conversion desde formato Hugging Face (`convert_type: hf`). No se especifica la herramienta exacta empleada, aunque el conjunto de cuantizaciones (incluyendo IQ4_XS) es compatible con el flujo habitual de llama.cpp.

## Capacidades

- Generacion de texto: capacidad basica esperada de un modelo de 2B parametros, sin datos especificos publicados.
- Tool calling / function calling: el nombre "Supertool" sugiere soporte, pero no se documenta el formato ni la fiabilidad.
- Modo "uncensored": se espera menor tasa de rechazos en peticiones, sin garantias documentadas.
- Capacidades multilingues: no disponibles.
- Razonamiento multi-paso y agentes: no documentado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado local de asistentes con tool calling: el formato GGUF permite ejecutar el modelo en llama.cpp u Ollama en un portatil, lo que facilita iterar sobre esquemas de funciones sin coste de API. La idoneidad depende de validar empiricamente la calidad del tool calling, no documentada.
- Experimentacion con modelos sin filtros de rechazo: util para investigacion sobre comportamiento de modelos "uncensored" en entornos controlados, siempre que se asuman los riesgos eticos y legales asociados.
- Despliegue en dispositivos con recursos limitados: con cuantizaciones Q4_K_M o Q3_K_M, un modelo de 2B puede caber en GPUs de consumo con 4-8 GB de VRAM, lo que permite inferencia offline.
- Generacion de texto en pipelines por lotes: al ser un modelo pequeno, puede procesar volumenes moderados de texto en CPU con throughput aceptable, aunque sin datos medidos.
- Base para fine-tuning adicional: los pesos GGUF no son ideales para reentrenar; para ello conviene partir del modelo base en safetensors.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir la degradacion de calidad segun el nivel de cuantizacion en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (2B parametros): aproximadamente 1,5-2 GB en Q4_K_M, 2,5-3 GB en Q8_0 y 4-5 GB en F16, sin contar el overhead del contexto KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son validas, aunque para un 2B el hardware de gama alta esta sobredimensionado.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas; tambien en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Supertool-Uncensored-GGUF | 2B | no disponible | no disponible | GGUF | Objeto de esta ficha |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada con licencia permisiva |
| Llama 3.2 1B Instruct | 1B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Ecosistema amplio y soporte de tool calling documentado |
| SmolLM2-1.7B-Instruct | 1,7B | 8K (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Enfocado a eficiencia en dispositivo |

La comparacion es orientativa: los datos del modelo de esta ficha no estan verificados y los de los alternativos provienen de sus documentaciones publicas, no de una evaluacion directa en este contexto.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay informacion sobre entrenamiento, datos, sesgos ni evaluaciones.
- Licencia no declarada: no puede asumirse uso comercial sin consultar el repositorio del modelo base original.
- El calificativo "uncensored" implica riesgo de generar contenido inapropiado, ofensivo o ilegal; requiere moderacion externa en produccion.
- Riesgo de alucinacion elevado por el tamano reducido (2B) y por la falta de datos de alineamiento documentados.
- Idiomas y contexto no confirmados: no debe asumirse soporte multilingue ni ventanas largas.
- La cuantizacion introduce degradacion adicional respecto al modelo en precision completa, especialmente en Q2_K y Q3_K_S.
- Procedencia del modelo base (usuario saidutta69) sin trazabilidad verificable: auditar antes de cualquier uso serio.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-Uncensored-GGUF
- Modelo base referenciado: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool-Uncensored
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
