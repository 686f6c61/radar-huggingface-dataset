# mradermacher/Captain-Eris_Violet-Toxic-GRPO-v0.4-GGUF

## Resumen

Captain-Eris_Violet-Toxic-GRPO-v0.4 es un modelo de lenguaje conversacional en ingles afinado mediante GRPO (Group Relative Policy Optimization) sobre una base de la familia Violet. El modelo original lo publica el usuario Nitral-Archive en Hugging Face, y esta ficha concreta corresponde a la version cuantizada en GGUF realizada por mradermacher, un prolifico cuantizador de la comunidad open source.

El modelo cuenta con aproximadamente 12.250 millones de parametros (12,25 B), un tamano que lo situa en la gama media-alta de modelos densos y que permite su despliegue en GPUs de consumo con cuantizaciones agresivas. Su nombre incluye el termino "Toxic", lo que sugiere un entrenamiento orientado a producir respuestas sin los filtros de seguridad habituales, un caso de uso frecuente en la comunidad de modelos "uncensored".

La relevancia de esta publicacion es practica: mradermacher ofrece hasta once cuantizaciones GGUF distintas (desde Q2_K de 4,9 GB hasta Q8_0 de 13,1 GB) que permiten ejecutar el modelo en llama.cpp y derivados. No obstante, la informacion publica sobre arquitectura, datos de entrenamiento, contexto y benchmarks es practicamente inexistente, lo que limita seriamente su evaluacion rigurosa para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso, inferido del tamano y del formato) |
| Parametros totales | 12.247.782.400 (12,25 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo base. Por el numero de parametros (12,25 B) y el formato de publicacion (transformers + GGUF), se trata con alta probabilidad de un transformer denso decoder-only, pero no hay confirmacion explicita en la informacion disponible. Tampoco se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el tipo de atencion (completa, GQA, sliding window).

El sufijo "GRPO-v0.4" indica que el modelo base fue afinado con Group Relative Policy Optimization, una variante de aprendizaje por refuerzo popularizada por DeepSeek para alinear modelos mediante recompensas comparativas entre grupos de respuestas generadas. El sufijo "Toxic" sugiere que la recompensa del RL se oriento deliberadamente a reducir el rechazo y la censura en las respuestas. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases SFT previas ni los hiperparametros del RL. La version aqui descrita es una cuantizacion estatica (quantize_version 2) sin imatrix; el autor senala que no tenia previsto publicar cuantizaciones ponderadas.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Afinado orientado a respuestas sin filtros de seguridad (modelo "uncensored"), segun indica su nombre.
- Alineacion mediante GRPO, lo que en teoria mejora la coherencia y el seguimiento de instrucciones respecto a la base.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Vision, audio o modo thinking: no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como el RL con recompensas orientadas a reducir rechazos afecta al comportamiento del modelo, comparandolo con su base sin afinar. Es util en entornos de laboratorio controlados.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos que requieran tono adulto o temas sensibles, donde los modelos alineados convencionales rechazan la peticion. El contexto conversacional del formato chat facilita iteraciones.
- Pruebas de robustez y red teaming: sirve como modelo "adversario" para evaluar clasificadores de toxicidad, filtros de contenido o sistemas de moderacion, generando respuestas que esos sistemas deberian detectar.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (7,6 GB) o Q4_K_S (7,2 GB) cabe en GPUs de 8-12 GB de VRAM, lo que permite experimentar en un portatil con RTX 3060/4060 sin depender de la nube.
- Generacion de dialogos para videojuegos o NPCs: el modelo puede producir respuestas con personalidad marcada y sin los rechazos tipicos de los asistentes comerciales, integrable via llama.cpp en motores de juego.
- Fine-tuning posterior como base: al ser un modelo de 12 B en ingles, puede servir de punto de partida para ajustes especificos de dominio (por ejemplo, personajes o estilos) en entornos donde la licencia lo permita; conviene verificar antes los terminos del modelo original.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de once variantes GGUF permite medir el impacto de la cuantizacion en perplejidad y calidad conversacional sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,2 GB
  - IQ4_XS: ~6,9 GB
  - Q4_K_M: ~7,6 GB
  - Q5_K_M: ~8,8 GB
  - Q6_K: ~10,2 GB
  - Q8_0: ~13,1 GB
- Con overhead de KV cache y contexto, conviene anadir entre 1 y 3 GB adicionales segun la longitud de contexto configurada.
- GPUs recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 o A100/H100 para Q8_0 con contexto largo o para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizaciones Q4 a Q8. En GPUs de 8 GB solo caben Q2_K a Q4_K_S con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI. Tambien puede servirse con vLLM o TGI si se usa el modelo base en safetensors en lugar del GGUF.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Captain-Eris_Violet-Toxic-GRPO-v0.4 (esta ficha) | 12,25 B | no disponible | no disponible | GGUF, safetensors | Afinado GRPO, orientado a "uncensored", solo ingles |
| Modelos densos de ~12-14 B de la comunidad (p. ej. variantes Mistral-Nemo 12B) | ~12 B | 128K en algunos casos | Apache 2.0 en muchos | GGUF, safetensors | Base mas documentada y con benchmarks publicos |
| Modelos "uncensored" de ~8 B (p. ej. Llama 3 8B sin alinear) | ~8 B | 8K | Llama 3 license | GGUF, safetensors | Menor tamano, menor calidad potencial, mas facil de ejecutar |
| Modelos de ~13 B afinados con RLHF/DPO (p. ej. variantes de Llama 2 13B chat) | ~13 B | 4K | Llama 2 license | GGUF, safetensors | Mas documentados, pero con filtros de seguridad activos |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo de esta ficha, por lo que la comparacion se limita a parametros, contexto y licencia. La falta de licencia explicita es un factor diferencial negativo frente a alternativas con licencias claras.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no hay evidencia cuantitativa de su calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Modelo deliberadamente "toxico"/sin filtros: puede generar contenido ofensivo, ilegal o danino; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion hasta aclararlo con el autor del modelo base.
- Solo ingles: no hay soporte multilingue declarado, lo que descarta su uso en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (documentos extensos, conversaciones largas) sin pruebas empiricas.
- Riesgo de alucinacion: no hay informacion sobre el entrenamiento ni evaluaciones de factualidad; en un modelo afinado con RL sin datos publicos, la fiabilidad factica es incierta.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos de genero, raza, religion u orientacion politica.
- Cuantizaciones Q2_K y Q3_K_S con degradacion notable de calidad; el propio autor marca Q3_K_M como "lower quality". Para uso serio, minimo Q4_K_M.
- Modelo de la comunidad con muy poca traccion (83 descargas, 1 like): sin validacion por parte de terceros, sin issues resueltos ni mantenimiento garantizado.
- El autor de la cuantizacion advierte que no hay cuantizaciones imatrix/ponderadas, lo que puede reducir la calidad frente a alternativas con imatrix del mismo tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Captain-Eris_Violet-Toxic-GRPO-v0.4-GGUF
- Modelo base: https://huggingface.co/Nitral-Archive/Captain-Eris_Violet-Toxic-GRPO-v0.4
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Captain-Eris_Violet-Toxic-GRPO-v0.4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Web del patrocinador (nethype GmbH): https://www.nethype.de/
