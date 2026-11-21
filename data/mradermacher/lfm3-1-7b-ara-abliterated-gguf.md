# mradermacher/LFM3-1.7B-ARA-Abliterated-GGUF

## Resumen

LFM3-1.7B-ARA-Abliterated-GGUF es la distribucion en formato GGUF del modelo Austriani/LFM3-1.7B-ARA-Abliterated, una variante "abliterated" (tambien llamada decensored o refusal-removed) del modelo LiquidAI LFM3 de 1.700 millones de parametros. La cuantizacion la firma mradermacher, un autor habitual en la comunidad de GGUF, y ofrece 12 variantes de cuantizacion distintas para facilitar su despliegue en hardware modesto.

El modelo base LFM3 pertenece a la familia Liquid Foundation Models de Liquid AI, construida sobre una arquitectura hibrida de transformer con atencion convulsional (hybrid-attention y convolutional segun los tags del autor), pensada para despliegue en el borde (edge-deployment) y contextos largos. Con 1.728.801.600 parametros reales, es un modelo pequeno que busca ofrecer capacidades de chat, roleplay, escritura creativa y uso como agente en entornos con recursos limitados.

La relevancia de esta ficha concreta radica en dos factores: por un lado, el proceso de "abliteration" mediante Arbitrary Rank Ablation (ARA) y la herramienta Heretic, que elimina los mecanismos de rechazo del modelo original; por otro, la disponibilidad de cuantizaciones GGUF ligeras (desde 0,9 GB en Q2_K) que permiten ejecutar el modelo en CPU o en GPUs de consumo. El autor reporta una divergencia KL de 0,0374 respecto al modelo original, dato que cuantifica el coste de la ablacion en terminos de distribucion de probabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con hybrid-attention y componentes convulsonales (segun tags del autor) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Austriani/LFM3-1.7B-ARA-Abliterated deriva del LFM3 de Liquid AI, descrito por el autor mediante los tags liquid-ai, lfm3, transformer, hybrid-attention y convolutional. Se trata, por tanto, de una arquitectura hibrida que combina mecanismos de atencion con capas convulsonales, un diseno orientado a reducir el coste computacional en inferencia manteniendo capacidad de modelado de secuencias largas. El tag long-context sugiere soporte para ventanas extendidas, aunque la longitud exacta no se especifica en la informacion disponible.

El proceso de entrenamiento del modelo original no se detalla en la model card proporcionada. Lo que si se documenta es la intervencion posterior: una ablacion de rangos arbitrarios (Arbitrary Rank Ablation, ARA) aplicada con la herramienta Heretic, que elimina direcciones del espacio de activaciones asociadas a comportamientos de rechazo. El autor reporta una divergencia KL de 0,0374 frente al modelo sin ablacionar, metrica que mide cuanto se ha desplazado la distribucion de salida del modelo. Cuanto menor es este valor, menor es la degradacion funcional introducida por el proceso de decensoring. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en chat multi-turno.
- Escritura creativa y roleplay, segun los tags chat, roleplay y creative-writing.
- Uso como agente e instrucciones (tags agent e instruct), lo que implica cierta capacidad de seguir instrucciones estructuradas.
- Modelo "abliterated" o "refusal-removed": no aplica los mecanismos de rechazo tipicos de los modelos alineados, lo que afecta a su comportamiento ante peticiones sensibles.
- Capacidades multilingues limitadas al ingles segun el campo language del repositorio.
- No se documentan capacidades de vision, audio, tool calling explicito ni modo de razonamiento (thinking mode) en la informacion disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta etiquetado explicitamente para roleplay y creative-writing, y su naturaleza refusal-removed permite explorar tramas y personajes sin las interrupciones tipicas de los modelos alineados. Su tamano de 1,7B permite respuestas rapidas en hardware de consumo.
- Generacion de texto en el borde (edge deployment): con cuantizaciones desde 0,9 GB (Q2_K) hasta 1,9 GB (Q8_0), puede ejecutarse en dispositivos con poca memoria, como mini-PCs, Raspberry Pi con suficiente RAM o moviles de gama alta mediante llama.cpp.
- Prototipado rapido de agentes conversacionales: los tags agent e instruct indican que el modelo acepta instrucciones de sistema y puede encadenar turnos, lo que lo hace util para validar flujos de agente antes de migrar a modelos mayores.
- Experimentacion en investigacion sobre alineacion y decensoring: la metrica KLD de 0,0374 y el uso de ARA/Heretic lo convierten en un caso de estudio para medir el impacto de la ablacion de rechazo en modelos pequenos.
- Asistente de escritura offline: al ser un GGUF ligero, puede integrarse en editores o herramientas de escritorio que funcionen sin conexion, generando borradores y continuaciones de texto en ingles.
- Filtrado y clasificacion de texto en pipelines locales: con 1,7B de parametros y contexto potencialmente largo, puede emplearse para tareas de etiquetado o resumen en entornos con requisitos de privacidad, siempre que el rendimiento sea suficiente para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la divergencia KL de 0,0374 entre el modelo abliterated y su version original, que cuantifica el grado de modificacion de la distribucion de salida pero no el rendimiento en tareas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. Estas cifras corresponden al tamano del fichero y deben incrementarse con el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para cuantizaciones altas con contexto extendido. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo (GTX 1050 Ti en adelante para Q4, RTX 3060 o superior para Q8_0 con contexto amplio).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero esta version GGUF esta pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Con 1,7B de parametros, se espera una latencia baja en GPU de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-ARA-Abliterated-GGUF (este) | 1,7B | no disponible | lfm1.0 | GGUF | Variante abliterated, solo ingles |
| LFM3-1.7B (original Liquid AI) | 1,7B | no disponible | lfm1.0 | safetensors | Modelo base con alineacion intacta |
| Gemma 2 2B | 2,6B | 8K | Gemma license | safetensors, GGUF | Alternativa pequena de Google, multilingue |
| Qwen2.5 1.5B | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Mayor contexto y licencia permisiva |

La comparativa se ofrece a titulo orientativo: no se dispone de datos de rendimiento del modelo en benchmarks que permitan una comparacion cuantitativa con las alternativas. La principal ventaja diferencial de esta ficha es la disponibilidad de cuantizaciones GGUF muy ligeras y su naturaleza refusal-removed; sus desventajas son el soporte exclusivo de ingles y una licencia lfm1.0 menos permisiva que Apache 2.0.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de los mecanismos de rechazo implica que puede generar contenido sensible, ofensivo o inapropiado sin las salvaguardas habituales. No es apto para aplicaciones de cara al publico sin moderacion externa.
- La ablacion introduce una divergencia respecto al modelo original (KLD 0,0374), lo que puede degradar ligeramente la coherencia o la calidad en algunas tareas.
- Soporte exclusivo de ingles: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia lfm1.0: es necesario revisar los terminos del fichero LICENSE del modelo base antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinacion: con 1,7B de parametros, la fiabilidad factua es limitada y el modelo puede inventar datos con facilidad, especialmente en tareas de conocimiento.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta sin verificar la configuracion del modelo base.
- El repositorio GGUF no incluye pesos safetensors; para servir el modelo con vLLM o TGI es necesario acudir al modelo base Austriani/LFM3-1.7B-ARA-Abliterated.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estandar que respalde su uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-ARA-Abliterated-GGUF
- Modelo base: https://huggingface.co/Austriani/LFM3-1.7B-ARA-Abliterated
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/LFM3-1.7B-ARA-Abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-ARA-Abliterated-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
