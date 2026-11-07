# Gramscii-IT/ToolChooser-0.8B

## Resumen

ToolChooser-0.8B es un adaptador LoRA sobre Qwen3.5-0.8B desarrollado por Gramscii-IT que resuelve un problema muy concreto dentro de los sistemas de enrutamiento de herramientas: los desempates. Cuando un router basado en embeddings puntua un mensaje de chat contra un conjunto de capacidades (herramientas) y dos o mas quedan practicamente empatadas, este modelo elige una de ellas o decide que se pregunte a la persona usuaria.

El modelo no es un generador de proposito general: es un clasificador de decisiones entrenado por destilacion a partir de un profesor 34 veces mayor, Qwen3.8-27B. Su salida es un unico item Markdown con el identificador de la capacidad elegida (o `none`), y el anfitrion lee la probabilidad de esa respuesta completa a partir de los log-probabilidades del siguiente token en llama-server. Solo se acepta una capacidad si su probabilidad normalizada alcanza 0,85; por debajo, se pide a la persona que elija.

Su relevancia es practica: demuestra que un modelo de 772 millones de parametros puede igualar o superar en una tarea acotada de decision a modelos de 35B en modo no-thinking, con una tasa de error mucho menor, y desplegarse en un portatil con llama.cpp. La licencia Apache-2.0 heredada del modelo base facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | 772.845.888 (base); adaptador LoRA F16 de 21.671.008 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de referencia (`-c 32768`) |
| Tipos de cuantizacion | Base en GGUF Q8_0; adaptador LoRA en F16 |
| Idiomas soportados | Italiano (it), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base `qwen3.5-0.8b-base-2fc06364-q8_0.gguf` y adaptador `tool-chooser-0.8b-20261107-lora-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre la revision `2fc06364` de Qwen3.5-0.8B, un transformer decoder-only de 772,8 millones de parametros. El adaptador se distribuye en F16 (21,7 MB) y se aplica sobre una base cuantizada en Q8_0 (833,6 MB), de modo que el conjunto completo cabe en menos de 1 GB en disco. El autor publica los sha256 de ambos ficheros para garantizar la reproducibilidad de las decisiones de enrutamiento.

El entrenamiento es una destilacion: el adaptador aprendio las decisiones de un profesor Qwen3.8-27B sobre pares de desempate. La tarea se formula como clasificacion sobre las capacidades ofrecidas, no como generacion libre. En inferencia, el anfitrion evalua la probabilidad del token de fin de la respuesta completa para cada capacidad candidata y para `none`, normaliza sobre las opciones y aplica un umbral de 0,85. El umbral se selecciono como el mas bajo con menos elecciones erroneas sobre los 201 desempates del 31 de octubre; los 106 desempates del 22 de octubre no participaron en esa eleccion. El prompt de sistema incluye reglas explicitas: elegir por lo que pide el mensaje y no por palabras compartidas con un titulo, priorizar la capacidad que lee documentos seleccionados cuando el mensaje pregunta por su contenido, y responder `none` cuando dos capacidades responderian igual de bien.

## Capacidades

- Seleccion de herramientas (tool selection) entre un conjunto de capacidades ofrecidas por el anfitrion, cada una con titulo, descripcion y tipo de salida (prosa, tablas, graficos).
- Desempate de rutas (tie-break) cuando el router de embeddings deja dos o mas capacidades con puntuaciones proximas.
- Deteccion de intencion (intent detection) a partir del texto del mensaje y de los documentos seleccionados por la persona.
- Decision de absteccion: devuelve `none` cuando ninguna capacidad encaja o cuando dos empatan, delegando la eleccion en la persona usuaria.
- Capacidad multilingue limitada a italiano e ingles.
- Salida estructurada y determinista: un unico item Markdown `- capability: <id | none>`.
- No genera texto libre ni razonamiento: su funcion es exclusivamente la clasificacion de decision.

## Casos de uso

- Enrutamiento de agentes conversacionales: integrado como segunda etapa tras un router de embeddings, resuelve los empates antes de invocar una herramienta, reduciendo llamadas erroneas en produccion con un coste de inferencia minimo.
- Atencion al cliente automatizada: cuando el mensaje del usuario puede resolverse con varias capacidades (por ejemplo, consulta de pedido frente a gestion de devolucion), el modelo elige una o pide aclaracion, evitando ejecutar la accion equivocada.
- Sistemas RAG con documentos seleccionados: si la persona ha marcado documentos y pregunta por su contenido, el modelo prioriza la capacidad que los lee, lo que resulta util en asistentes documentales con multiples fuentes.
- Orquestacion de pipelines de datos: en un entorno con herramientas de consulta SQL, generacion de graficos y exportacion, el modelo decide cual corresponde al mensaje y evita ejecuciones ambiguas.
- Despliegue en el borde o en portatiles: con menos de 1 GB de pesos y llama.cpp, puede ejecutarse en CPU o en GPU de consumo para enrutamiento local sin depender de la nube.
- Guardrail de seguridad en agentes: al no autorizar por si mismo ninguna operacion (el anfitrion decide que se ejecuta), sirve como capa de decision auditable y reproducible gracias a los sha256 fijados.
- Evaluacion y regresion de routers: permite comparar decisiones contra un profesor mayor en suites de prueba de desempate, como muestran los conjuntos del 22 y 31 de octubre.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente).

| Modelo | 201 desempates del 31 de octubre: eleccion del profesor / persona consultada / erronea | 106 desempates del 22 de octubre |
|---|---|---|
| ToolChooser-0.8B | 184 / 15 / 2 | 91 / 13 / 2 |
| Predecesor del 31 de octubre | 176 / 24 / 1 | 83 / 21 / 2 |
| Qwen3.6-35B-A3B, thinking off (MoE, 3B activos) | 171 / 4 / 26 | 84 / 4 / 18 |
| LFM2.5-24B-A2B, thinking on | 145 / 1 / 41, 14 ilegibles | 74 / 0 / 26, 6 ilegibles |
| Qwen3.5-4B, thinking off | 134 / 12 / 55 | 69 / 6 / 31 |

Metricas agregadas de la model-index:

| Conjunto | Precision (misma eleccion que el profesor) | Tasa de error |
|---|---|---|
| 201 desempates del 31 de octubre (146 italiano, 55 ingles) | 91,5 % | 1,0 % |
| 106 desempates del 22 de octubre (53 italiano, 53 ingles) | 85,8 % | 1,9 % |

Umbral de decision sobre el conjunto de 201 desempates:

| Umbral | Eleccion del profesor / persona consultada / erronea (201) | (106) |
|---|---|---|
| 0,80 | 182 / 15 / 4 | 90 / 13 / 3 |
| 0,85 | 184 / 15 / 2 | 91 / 13 / 2 |
| 0,90 | 182 / 17 / 2 | 90 / 14 / 2 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos en Q8_0 mas el adaptador F16; en la practica, unos 2-4 GB contando contexto de 32.768 tokens y cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas; funciona correctamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque el modelo no aprovecha el hardware de gama alta.
- GPU de consumo: si, cabe holgadamente en cualquier GPU consumer moderna e incluso en CPU.
- Despliegue: llama-server con `--jinja`, `--lora`, `-ngl 99`, `-c 32768`, `--no-context-shift` y `--cache-ram 0`, tal como indica el autor. Compatible con llama.cpp; no se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de una clasificacion de una sola respuesta con lectura de log-probabilidades, el coste por decision es de un unico paso de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en desempate (201 / 106) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolChooser-0.8B | 772,8 M + LoRA | 32.768 | 184 / 91 aciertos con el profesor; 2 / 2 errores | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.6-35B-A3B (thinking off) | 35B totales, 3B activos (MoE) | no disponible | 171 / 84; 26 / 18 errores | no disponible | no disponible |
| LFM2.5-24B-A2B (thinking on) | 24B totales, 2B activos (MoE) | no disponible | 145 / 74; 41 / 26 errores, con salidas ilegibles | no disponible | no disponible |
| Qwen3.5-4B (thinking off) | 4B | no disponible | 134 / 69; 55 / 31 errores | no disponible | no disponible |

La comparacion se limita a la tarea de desempate de enrutamiento, unica con datos publicados. En ella, ToolChooser-0.8B supera en aciertos y reduce drasticamente los errores frente a modelos mucho mayores, a costa de una mayor tasa de consulta a la persona usuaria.

## Limitaciones y advertencias

- El modelo solo elige entre las capacidades que el router le ofrece; no descubre herramientas ni genera llamadas por si mismo.
- Su salida no autoriza ninguna operacion: el anfitrion debe decidir que se ejecuta. No debe usarse como unico control de seguridad.
- Idiomas limitados a italiano e ingles; el rendimiento en castellano no esta documentado.
- El umbral de 0,85 se ajusto sobre el conjunto de 201 desempates del 31 de octubre, por lo que las cifras de ese conjunto no son independientes del umbral.
- Los resultados son declarados por el autor y no estan verificados de forma independiente (`verified: false` en la model-index).
- Riesgo de alucinacion de identificadores: si la respuesta no coincide con una capacidad ofrecida, el anfitrion debe descartarla; el autor recomienda fijar los sha256 de base y adaptador para garantizar reproducibilidad.
- Sesgos especificos no documentados en la informacion disponible.
- Requiere llama-server con soporte de `--jinja` y lectura de log-probabilidades (`n_probs`); no se documentan integraciones con otros servidores de inferencia.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B por si anaden restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gramscii-IT/ToolChooser-0.8B
- Perfil del autor en Hugging Face: https://huggingface.co/Gramscii-IT
- Adaptador hermano SemanticRepair-0.8B: https://huggingface.co/Gramscii-IT/SemanticRepair-0.8B
- Adaptador hermano QueryTranslator-0.8B: https://huggingface.co/Gramscii-IT/QueryTranslator-0.8B
- Estadisticas del autor en OpenModelStats: https://openmodelstats.com/owners/gramscii-it
