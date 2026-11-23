# mradermacher/Gemma3NPC-4B-pre-thinking-GGUF

## Resumen

Gemma3NPC-4B-pre-thinking-GGUF es la distribucion en formato GGUF del modelo chimbiwide/Gemma3NPC-4B-pre-thinking, un ajuste fino de la familia Gemma 3 de Google orientado a la interpretacion de personajes no jugadores (NPC) en juegos de rol. El modelo ha sido cuantizado por mradermacher, un colaborador habitual de la comunidad que publica versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El repositorio ofrece once variantes de cuantizacion, desde Q2_K hasta f16, con tamanos que van de 1,8 GB a 7,9 GB.

El modelo base cuenta con 3.880.263.168 parametros (aproximadamente 3,9 mil millones), lo que lo situa en la gama de modelos pequenos ejecutables en hardware de consumo. El ajuste fino se ha realizado sobre el dataset chimbiwide/NPC-RP-Pre-Thinking, un conjunto de datos orientado a roleplay conversacional con un modo de "pre-pensamiento" que sugiere la generacion de un razonamiento previo a la respuesta final del personaje.

La relevancia de esta ficha radica en que permite desplegar un modelo especializado en dialogo de personajes en entornos locales sin GPU de datacenter, gracias a las cuantizaciones de 4 y 5 bits que caben en tarjetas graficas de consumo. La licencia Gemma impone condiciones de uso que deben revisarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 3, transformer decoder-only) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 3 de 4B parametros, una arquitectura transformer decoder-only. La model card del repositorio cuantizado no detalla la composicion del dataset de entrenamiento mas alla de referenciar chimbiwide/NPC-RP-Pre-Thinking, ni especifica el numero de tokens utilizados, la presencia de RLHF/DPO ni innovaciones tecnicas adicionales. El sufijo "pre-thinking" en el nombre sugiere un entrenamiento orientado a producir un razonamiento intermedio antes de la respuesta del personaje, pero no se documenta el mecanismo exacto en la informacion disponible.

La cuantizacion ha sido realizada por mradermacher con la herramienta de cuantizacion de llama.cpp, segun el flujo habitual del autor. El repositorio incluye tanto cuantizaciones estaticas como, en un repositorio separado, cuantizaciones ponderadas con imatrix (mradermacher/Gemma3NPC-4B-pre-thinking-i1-GGUF), que suelen ofrecer mejor calidad por bit en tamanos bajos.

## Capacidades

- Generacion de texto conversacional orientada a la interpretacion de personajes (roleplay).
- Modo de "pre-pensamiento": el modelo esta entrenado para producir un razonamiento previo a la respuesta final del NPC.
- Dialogo multi-turno con mantenimiento de personaje, segun el dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el "pre-thinking" es el unico indicio de razonamiento estructurado.
- Capacidades multilingues: la model card declara unicamente ingles (en).
- Capacidades especiales (vision, audio): no disponibles; el modelo base es de texto.

## Casos de uso

- Interpretacion de NPC en videojuegos: el modelo puede generar dialogos coherentes con la personalidad de un personaje en tiempo real, ejecutandose en local con cuantizaciones Q4_K_M (2,6 GB) en GPUs de consumo, lo que evita la latencia de red y los costes de API en bucles de dialogo frecuentes.
- Prototipado rapido de sistemas de rol conversacional: investigadores pueden iterar sobre prompts de personaje y evaluar la coherencia del NPC con una cuantizacion Q5_K_M o Q6_K sin necesidad de infraestructura dedicada.
- Modding de juegos de rol: integracion del GGUF en motores que soportan llama.cpp (por ejemplo, a traves de plugins de dialogos) para sustituir arboles de dialogo estaticos por generacion dinamica.
- Simulacion de agentes sociales: el modo pre-thinking permite generar trazas de razonamiento del personaje antes de la respuesta, utiles para estudiar comportamiento emergente en entornos multiagente.
- Educacion y entrenamiento en roleplay: uso como companero de practica en escenarios de interpretacion (entrevistas, simulaciones de ventas) donde el "pre-thinking" ayuda a mantener la coherencia del rol.
- Investigacion sobre ajuste fino especializado: el par modelo base + dataset publico permite reproducir o extender el entrenamiento para estudiar tecnicas de roleplay con razonamiento previo en modelos de menos de 4B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M (2,6 GB de pesos mas overhead de contexto); aproximadamente 3,5-4 GB con Q6_K (3,3 GB); aproximadamente 8-9 GB con f16 (7,9 GB).
- GPUs recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas desde 4 GB de VRAM con Q4_K_M; tambien puede ejecutarse en CPU con llama.cpp a velocidades inferiores.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-pre-thinking-GGUF | 3,88B | no disponible | gemma | GGUF | Especializado en NPC/roleplay con pre-thinking |
| Gemma 3 4B (base) | ~4B | no disponible | gemma | safetensors, GGUF | Modelo generalista del que deriva; sin especializacion en roleplay |
| Modelos de roleplay de ~3-4B en GGUF | no disponible | no disponible | variable | GGUF | Existen alternativas de la comunidad, pero no se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Gemma 3 y entrenarse en un dataset de roleplay, puede heredar sesgos del corpus base y del dataset de ajuste.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; en roleplay puede manifestarse como incoherencias de personaje o invencion de hechos dentro de la ficcion.
- Limitaciones de contexto o idioma: la model card solo declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, incluida la aceptacion de los terminos de Google y restricciones para uso comercial; es obligatorio revisar la licencia antes de desplegar en produccion.
- Caveat para produccion: el modelo esta pensado para roleplay y dialogo de personajes, no para tareas de razonamiento general, codigo o matematicas; su uso fuera de ese dominio puede dar resultados pobres.
- El acceso al modelo base en Hugging Face requiere aceptar la licencia de Gemma (gated model).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma3NPC-4B-pre-thinking-GGUF
- Modelo base: https://huggingface.co/chimbiwide/Gemma3NPC-4B-pre-thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/NPC-RP-Pre-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma3NPC-4B-pre-thinking-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Gemma3NPC-4B-pre-thinking-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
