# Delysidz/gemma-4-12b-it-companion-Q4_K_M

## Resumen

Delysidz/gemma-4-12b-it-companion-Q4_K_M es una cuantizacion GGUF en Q4_K_M de un ajuste fino derivado de google/gemma-4-12B-it, publicado por el usuario Delysidz. El modelo se presenta como un "companion" conversacional extrovertido, con un ajuste orientado a roleplay y conversacion de largo recorrido, y con las etiquetas "abliterated" y "uncensored" que indican que se ha reducido o eliminado el comportamiento de rechazo del modelo base. El resultado es un modelo denso de 11.9B parametros con 48 capas y una ventana de contexto declarada de 131.1K tokens.

La relevancia de esta ficha es doble. Por un lado, documenta un caso tipico de la comunidad: un modelo base propietario o de pesos abiertos (Gemma 4 12B IT) reajustado para un caso de uso muy concreto (conversacion de compania, roleplay) y distribuido ya cuantizado para consumo en hardware de gama consumer. Por otro, permite analizar con rigor las implicaciones de las variantes "abliterated/uncensored": son utiles para investigacion sobre alineamiento y para aplicaciones creativas, pero introducen riesgos de seguridad y de cumplimiento que conviene evaluar antes de cualquier despliegue en produccion.

El repositorio ocupa 23.9 GB, aunque el archivo principal declarado en la model card pesa 7.38 GB, coherente con una cuantizacion Q4_K_M de un modelo de ~12B parametros. La licencia declarada es Apache-2.0, si bien esta licencia se aplica al artefacto publicado y no necesariamente modifica los terminos del modelo base original, que el usuario debe verificar por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), 48 capas, atencion multi-cabeza con GQA (16 cabezas de atencion, 8 cabezas KV en la mayoria de capas) |
| Parametros totales | 11.9B (11.900 millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.1K tokens (131.072) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | en, de, fr, it, es, uk, ru |
| Licencia | Apache-2.0 (declarada por el publicador; verificar terminos del modelo base) |
| Formato de pesos | GGUF v3 |
| Tamano del archivo | 7.38 GB (Q4_K_M) |
| Tamano del repositorio | 23.9 GB |
| Dimension del embedding | 3.8K |
| Tamano FFN | 15.4K |
| Dimension de cabeza | 240 |
| Vocabulario | 262.1K tokens |
| RoPE base | 1.0M |
| Modelo base | google/gemma-4-12B-it |
| Fecha de creacion | 2026-10-21 |
| Ultima actualizacion | 2026-11-25 |
| Descargas | 1.556 |
| Likes | 3 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Gemma 4, con 48 capas, 16 cabezas de atencion y un esquema de cabezas KV que alterna valores de 8 y 1 (patron repetido cada 6 capas segun la lista declarada en la model card: 8,8,8,8,8,1). Esta configuracion de atencion con comparticion de cabezas KV reduce el coste de memoria del cache KV durante la inferencia, algo relevante para una ventana de contexto de 131.1K tokens. El vocabulario es amplio (262.1K tokens) y la base RoPE de 1.0M sugiere un entrenamiento con extension de contexto respecto a la configuracion original de Gemma.

No se dispone de informacion sobre el proceso de ajuste fino: la model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares. Las etiquetas "abliterated" y "uncensored" indican que se ha aplicado alguna tecnica de ablacion de direcciones de rechazo (habitualmente mediante sustraccion de direcciones en el espacio de activaciones o ajuste dirigido), pero el autor no detalla el metodo. La etiqueta "Heretic" aparece en los tags y podria referirse a una herramienta o pipeline de desbloqueo, aunque no se especifica. Tampoco hay informacion sobre la decodificacion especulativa ni sobre optimizaciones de atencion mas alla de lo deducible de la configuracion.

## Capacidades

- Generacion de texto conversacional multi-turno con enfasis en mantener coherencia a lo largo de conversaciones extensas (el autor describe el contexto como "sticky").
- Roleplay y simulacion de personalidad: el ajuste esta orientado explicitamente a un personaje "companion" extrovertido.
- Conversacion sin rechazos: las etiquetas "abliterated" y "uncensored" indican que el modelo no aplica las salvaguardas habituales del modelo base ante contenido sensible.
- Multilingue: soporte declarado para ingles, aleman, frances, italiano, espanol, ucraniano y ruso.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Gemma 4 12B IT, aunque no se documentan evaluaciones especificas tras el ajuste.
- Tool calling / function calling: no documentado en la informacion disponible; debe asumirse que las capacidades del base pueden haberse degradado tras el ajuste.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Vision: no disponible; el modelo se distribuye como GGUF de texto y no se mencionan capacidades multimodales.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste esta disenado para mantener personajes coherentes en sesiones largas, aprovechando la ventana de 131.1K tokens para conservar el historial completo de la conversacion sin truncamientos agresivos.
- Companero conversacional personal: el modelo puede sostener conversaciones de acompanamiento con memoria de contexto amplia, adecuado para prototipos de aplicaciones de bienestar o entretenimiento, siempre con las advertencias de seguridad correspondientes.
- Investigacion sobre alineamiento y rechazo: al ser una variante "abliterated", sirve como objeto de estudio para comparar el comportamiento de rechazo respecto al modelo base y analizar que direcciones de activacion codifican las negativas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos donde el modelo base podria rechazar tematicas adultas o violentas; util en entornos editoriales controlados.
- Prototipado local en hardware consumer: al ser un GGUF Q4_K_M de 7.38 GB, permite experimentar con un modelo de ~12B en GPUs de 8-12 GB de VRAM mediante llama.cpp, Ollama o LM Studio (etiqueta "LmStudio" en el repo).
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de Q4_K_M frente a precisiones mayores en tareas conversacionales y multilingues.
- Despliegue multilingue en europa del este: el soporte declarado de ucraniano y ruso, poco comun en modelos de este tamano, lo hace candidato para prototipos de atencion al cliente en esas lenguas, previa evaluacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas frente al modelo base o a otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB para el archivo Q4_K_M de 7.38 GB, mas el cache KV. Con contexto completo de 131.1K tokens, el cache KV puede anadir varios GB adicionales; conviene limitar la ventana practica segun la VRAM disponible.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para contexto largo; RTX 3060 12 GB o RTX 4060 Ti 16 GB para contexto moderado; A100/H100 solo si se necesita servir multiples peticiones concurrentes.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas de VRAM para contexto moderado; en 8 GB solo con contexto reducido o cuantizaciones menores no publicadas en este repo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (etiqueta explicita en el repo), y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa completa, por lo que requeririan conversion a safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Delysidz/gemma-4-12b-it-companion-Q4_K_M | 11.9B | 131.1K | GGUF Q4_K_M | Apache-2.0 (declarada) | Ajuste companion abliterated |
| google/gemma-4-12B-it (base) | 12B | no disponible en esta ficha | safetensors | terminos Gemma | Modelo original con alineamiento estandar |
| Otras variantes abliterated de Gemma | variable | variable | GGUF / safetensors | variable | No disponible comparativa concreta en la informacion proporcionada |
| Modelos companion de ~12B de otras familias | ~12B | variable | GGUF | variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de salvaguardas: el ajuste "abliterated/uncensored" elimina o reduce los rechazos del modelo base, por lo que puede generar contenido sensible, ofensivo o inseguro sin filtro. No es adecuado para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo de alucinacion: como todo modelo de lenguaje de este tamano, puede inventar hechos, citas o referencias; el ajuste conversacional puede aumentar la confianza aparente en afirmaciones falsas.
- Licencia: el publicador declara Apache-2.0, pero el modelo deriva de google/gemma-4-12B-it, cuyos terminos de uso deben verificarse por separado. La licencia Apache-2.0 del artefacto no exime de cumplir las condiciones del modelo base.
- Idiomas: aunque se declaran siete idiomas, no hay evaluacion de calidad por idioma; el espanol y el ucraniano pueden tener un rendimiento inferior al ingles.
- Contexto: la ventana de 131.1K tokens es la declarada en la model card, pero no se ha verificado su calidad efectiva en tareas de recuperacion en contexto largo tras el ajuste.
- Sesgos: no documentados por el autor; los sesgos del modelo base pueden persistir o amplificarse tras el ajuste.
- Produccion: al ser una cuantizacion Q4_K_M, existe degradacion respecto a precisiones mayores; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Tool calling: no confirmado tras el ajuste; no debe asumirse su funcionamiento en pipelines de agentes sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/Delysidz/gemma-4-12b-it-companion-Q4_K_M
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/6accf10eea7d4e851d395883/ikEf6LQDq4ykb_me19OK7.jpeg
- Imagen "Architect approved": https://cdn-uploads.huggingface.co/production/uploads/6accf10eea7d4e851d395883/Rf8cS71SXqeAVKtNd0IcX.jpeg
