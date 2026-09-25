# mradermacher/Orion-9B-Agentic-CodeCore-Merge-GGUF

## Resumen

Orion-9B-Agentic-CodeCore-Merge-GGUF es la version cuantizada en formato GGUF del modelo prithivMLmods/Orion-9B-Agentic-CodeCore-Merge, un modelo de ~9.200 millones de parametros obtenido mediante fusion (merge) de pesos. La cuantizacion la publica mradermacher, cuantizador habitual de la comunidad, y esta pensada para ejecucion local en CPU/GPU mediante llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, entre otros).

El modelo base esta etiquetado como orientado a agentes, uso de herramientas (tool-use y function-calling), generacion de codigo y razonamiento con cadena de pensamiento (chain-of-thought). Se distribuye bajo licencia Apache 2.0 y declara exclusivamente el idioma ingles. La etiqueta qwen3_5 en el repositorio apunta a una arquitectura de la familia Qwen3, aunque la model card no documenta la configuracion concreta.

Su relevancia practica es doble: por un lado, ofrece una variante de 9B en GGUF que cabe en GPU de consumo, algo relevante para quien necesita ejecutar agentes de codigo en local sin depender de APIs; por otro, el repositorio incluye ficheros mmproj (proyector multimodal), lo que sugiere que el modelo base incorpora una torre de vision, si bien esto no se detalla en la documentacion disponible. No hay resultados de benchmarks publicados ni adopcion comunitaria registrada (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta qwen3_5 en el repositorio; no se detalla la configuracion exacta) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0, f16, mmproj-Q8_0 y mmproj-f16 (proyector multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se publica en safetensors) |

## Arquitectura y entrenamiento

El modelo base es una fusion de pesos, no un entrenamiento desde cero: la etiqueta omnimergekit y la etiqueta merge indican que se construyo combinando los pesos de varios modelos con una herramienta de mergeo. No se documenta cuantos modelos se fusionaron, que porcentajes se asignaron a cada uno ni que checkpoints concretos se utilizaron. Tampoco hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de SFT, RLHF o DPO; la etiqueta sft sugiere que al menos uno de los modelos fusionados paso por ajuste supervisado.

El repositorio cuantizado que nos ocupa no anade entrenamiento alguno: es una conversion estatica de los pesos del modelo base a GGUF. Los metadatos del proceso indican quantize_version 2, output_tensor_quantised 1 y convert_type hf. El autor advierte de que no hay cuantizaciones ponderadas ni con imatrix disponibles, y que probablemente no las habra. La presencia de ficheros mmproj-Q8_0 y mmproj-f16 (marcados como "multi-modal supplement") es el unico indicio de que el modelo base integra un modulo de vision, dato que no se confirma en la model card.

No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion hibrida, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de plantilla propio del modelo base (no documentado en este repositorio).
- Razonamiento explicito con cadena de pensamiento, segun las etiquetas reasoning y chain-of-thought.
- Generacion y completado de codigo en contextos de programacion, segun la etiqueta coder.
- Uso de herramientas y llamada a funciones (tool-use, function-calling), lo que permite conectarlo a APIs externas mediante esquemas JSON.
- Ejecucion de flujos de agente con varios pasos: planificacion, llamada a herramienta, lectura del resultado y continuacion.
- Posible soporte de entrada visual a traves de los ficheros mmproj incluidos; no confirmado en la documentacion.
- Capacidades multilingues: solo ingles declarado. No hay evidencia de soporte fiable de castellano u otros idiomas.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion Q4_K_S (5,6 GB) el modelo puede ejecutarse en una GPU de 8-12 GB y ofrecer autocompletado, explicacion de funciones y generacion de tests sin enviar codigo propietario a servicios externos.
- Agente de refactorizacion en CI/CD: integrado mediante tool-calling, el modelo puede leer el diff de una pull request, invocar comandos de compilacion y lint, y proponer parches en un bucle controlado.
- Automatizacion de tareas de terminal: el modelo puede traducir instrucciones en lenguaje natural a comandos de shell, ejecutarlos a traves de una herramienta y verificar la salida antes de continuar.
- Extraccion estructurada de informacion: dado un conjunto de documentos en ingles, el modelo puede generar JSON con campos definidos mediante function-calling, util para pipelines de ingesta.
- Chat de soporte tecnico en ingles: permite mantener conversaciones multi-turno con contexto de codigo o logs, siempre que la ventana de contexto del modelo (no documentada) sea suficiente.
- Prototipado rapido de agentes: al ser un GGUF pequeno, sirve como banco de pruebas para orquestadores de agentes (LangChain, LlamaIndex, smolagents) antes de escalar a modelos mayores.
- Analisis de capturas o diagramas: si se confirma la capacidad multimodal mediante el proyector mmproj, podria describir diagramas de arquitectura o leer mensajes de error en imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado se limita a listar los ficheros GGUF y sus tamanos; no incluye MMLU, HumanEval, GSM8K, LiveCodeBench ni ninguna otra metrica, ni del modelo base ni de las cuantizaciones. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo.

Unico dato objetivo disponible: los tamanos de fichero por cuantizacion.

| Cuantizacion | Tamano (GB) | Notas del autor |
|---|---|---|
| Q2_K | 4,0 | calidad reducida |
| Q4_K_S | 5,6 | rapida, recomendada |
| Q8_0 | 9,9 | rapida, mejor calidad |
| f16 | 18,5 | 16 bits por peso, considerada excesiva |
| mmproj-Q8_0 | 0,7 | suplemento multimodal |
| mmproj-f16 | 1,0 | suplemento multimodal |

## Requisitos de hardware

- VRAM estimada para inferencia (peso del fichero mas cache KV y overhead del runtime, valores orientativos):
  - Q2_K: 4,0 GB de pesos, en torno a 5-6 GB de VRAM efectiva.
  - Q4_K_S: 5,6 GB de pesos, en torno a 7-8 GB de VRAM efectiva.
  - Q8_0: 9,9 GB de pesos, en torno a 12-13 GB de VRAM efectiva.
  - f16: 18,5 GB de pesos, en torno a 21-22 GB de VRAM efectiva.
- Si se utiliza el proyector multimodal, hay que sumar 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16).
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 Ti Super 16 GB cubren Q2_K, Q4_K_S y, con margen ajustado, Q8_0. La RTX 4090 (24 GB) puede ejecutar f16 con contexto moderado.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten f16 con contextos amplios y mayor concurrencia.
- CPU: las cuantizaciones Q2_K y Q4_K_S son viables en CPU con 16 GB de RAM, con velocidades de decodificacion muy inferiores a las de GPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. Para vLLM o TGI conviene partir del modelo base en safetensors, ya que el soporte de GGUF en esos servidores es limitado o experimental.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este modelo ni para sus cuantizaciones.

## Comparativa con modelos similares

Los datos del modelo Orion no permiten una comparacion cuantitativa (no hay contexto declarado ni benchmarks). La tabla siguiente recoge caracteristicas publicas conocidas de alternativas de tamano equivalente; las cifras de los modelos comparados proceden de su documentacion oficial.

| Modelo | Parametros | Contexto | Licencia | Enfoque principal |
|---|---|---|---|---|
| Orion-9B-Agentic-CodeCore-Merge (GGUF) | 9,2 B | no disponible | Apache 2.0 | Agentes, tool-use y codigo |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens (ampliable) | Apache 2.0 | Codigo |
| Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License | Proposito general e instrucciones |
| GLM-4-9B-Chat | 9,4 B | 128.000 tokens | Licencia GLM-4 (propia) | Proposito general, agentes y tool-use |

Diferencias relevantes: los tres modelos de referencia publican documentacion detallada, benchmarks y comunidad activa; el modelo Orion, en su version cuantizada, no ofrece ninguno de esos elementos. Ademas, las licencias de Llama 3.1 y GLM-4 introducen restricciones adicionales que Apache 2.0 no tiene, pero a cambio aportan garantias de mantenimiento y soporte que un merge no verifica.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en razonamiento, codigo o tool-calling. Cualquier decision de produccion deberia partir de una evaluacion propia.
- Modelo de fusion sin trazabilidad: no se documentan los checkpoints fusionados ni sus proporciones, por lo que no se puede auditar el origen de los pesos ni las condiciones de uso de cada componente.
- Riesgo de licencias heredadas: aunque la ficha declara Apache 2.0, los merges pueden combinar pesos con licencias no compatibles. Conviene verificar manualmente los modelos de origen antes de un uso comercial.
- Solo ingles declarado: no hay garantia de comportamiento correcto en castellano, ni en generacion ni en seguimiento de instrucciones.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o historiales de conversacion extensos sin medirlo previamente.
- Riesgo de alucinacion: al ser un modelo de 9B sin evaluacion publicada, es previsible que invente llamadas a funciones con parametros mal formados, APIs inexistentes o rutas de fichero erroneas cuando actua como agente.
- Cuantizaciones agresivas: Q2_K (4,0 GB) degrada la perplejidad de forma notable, algo problemático en tareas que exigen formato estricto como el function-calling. Se recomienda Q4_K_S como minimo.
- Falta de cuantizaciones imatrix o ponderadas: el propio cuantizador indica que no estan previstas, lo que limita las opciones de optimizar la relacion calidad/tamano.
- Soporte multimodal sin confirmar: los ficheros mmproj indican una posible torre de vision, pero la model card no la documenta ni especifica el procesador de imagenes ni la resolucion admitida.
- Adopcion nula: con 0 descargas y 0 likes, no existe validacion de terceros ni issues que permitan anticipar fallos conocidos.
- Fecha de publicacion adelantada en los metadatos (2026-09-25), lo que dificulta interpretar la antiguedad real del modelo respecto al resto del ecosistema.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orion-9B-Agentic-CodeCore-Merge-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Orion-9B-Agentic-CodeCore-Merge
- Vista general de cuantizaciones del autor: https://hf.tst.eu/model#Orion-9B-Agentic-CodeCore-Merge-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
