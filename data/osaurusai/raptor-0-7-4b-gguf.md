# OsaurusAI/Raptor-0.7-4B-GGUF

## Resumen

Raptor 0.7 es un ajuste fino mediante LoRA del modelo Spark-X2.6-4B (del equipo SparkLLM, con licencia Apache-2.0), fusionado en los pesos y orientado a tareas de agente local, razonamiento y uso de herramientas. Lo desarrolla OsaurusAI como modelo de agente para su plataforma Osaurus, y esta ficha cubre concretamente los artefactos GGUF cuantizados con matriz de importancia (imatrix) para runtimes de la familia llama.cpp. El modelo base cuenta con 4.112.079.360 parametros y esta entrenado principalmente en ingles.

La relevancia de esta publicacion esta en el trabajo de cuantizacion: el autor documenta la receta exacta (que capas suben de precision, que se mantiene en BF16), la calibracion con 7,60 M de tokens y una evaluacion de divergencia KL frente a los pesos BF16 en dos conjuntos disjuntos del de calibracion. Es decir, no se limita a publicar ficheros GGUF, sino que aporta una metodologia reproducible para verificar la perdida de calidad por cuantizacion, algo poco habitual en modelos de este tamano.

El modelo esta pensado para ejecutarse en local en Windows mediante Osaurus, o en cualquier runtime llama.cpp actualizado, con modos de razonamiento seleccionables (alto, bajo, desactivado) y salida de tool calls en formato OpenAI. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Spark-X2.6-4B; arquitectura `spark2_5` en llama.cpp) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (Q6_K y Q4_K_M con imatrix); se publica tambien la matriz de importancia para recuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16 |

## Arquitectura y entrenamiento

El modelo es un transformer de 4,1 B de parametros, ajustado mediante LoRA sobre Spark-X2.6-4B y fusionado en los pesos finales. La arquitectura en llama.cpp se identifica como `spark2_5` y requiere una version de llama.cpp posterior al 6 de septiembre de 2026 (PR #27868); compilaciones anteriores rechazan los ficheros. No se detalla en la informacion disponible la composicion exacta del dataset de ajuste, el numero de tokens de entrenamiento ni si hubo RLHF o DPO; esos datos corresponden a la model card del modelo BF16 de origen, no incluida aqui.

La innovacion tecnica destacable esta en el proceso de cuantizacion. La matriz de importancia recoge la energia de activacion por canal de entrada, E[x²], de cada capa lineal cuantizada, capturada sobre 7,60 M de tokens pasados por la plantilla de chat del propio modelo. La captura cubre trayectorias de agente y de workflow de Osaurus, razonamiento y tool calls muestreados del propio modelo (1,44 M de tokens), finanzas (tablas de memorias anuales y formularios 10-K), edicion y documentos largos, sesiones de terminal, codigo, matematicas, ciencia, chat multilingue y texto enciclopedico, en los tres modos de razonamiento. La receta sube la precision de la atencion respecto a los mixes estandar: en Q6_K el MLP va a Q6_K y `attn_qkv`, `attn_output` y el embedding/output head atados van a Q8_0; en Q4_K_M el MLP usa el mix estandar Q4_K_M y la atencion va a Q6_K; en todos los casos la puerta de atencion por cabeza (`attn_gate`, 16 filas por capa) se mantiene en BF16. Q8_0 no admite imatrix porque el cuantizador Q8_0 de llama.cpp la ignora.

## Capacidades

- Generacion de texto conversacional con plantilla de chat integrada.
- Razonamiento explicito con tres modos: alto (por defecto, razonamiento largo y cuidadoso), bajo (razonamiento corto) y desactivado (sin traza de razonamiento, `reasoning_content` vacio).
- Uso de herramientas (tool calling / function calling) con salida en el formato estandar `tool_calls` de OpenAI; el modelo emite el dialecto `<tool_call>NAME<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>` y llama.cpp lo convierte.
- Capacidades de agente: las trayectorias de agente y de workflow de Osaurus forman parte tanto del ajuste como de la calibracion de la cuantizacion.
- Razonamiento multi-paso mediante la traza de razonamiento separada del contenido final.
- Capacidades de codigo, terminal, matematicas y ciencia, segun los dominios cubiertos en la captura de calibracion.
- Procesamiento de documentos largos y texto de PDF, y tablas financieras (memorias anuales, 10-K).
- Capacidades multilingues limitadas: el unico idioma declarado es el ingles, aunque el corpus de calibracion incluye chat multilingue.
- No se declaran capacidades de vision ni de audio.

## Casos de uso

- Agente local en escritorio Windows: el modelo se sirve mediante Osaurus for Windows o cualquier runtime llama.cpp con `llama-server --jinja`, gestionando bucles de tool calling con contexto persistente entre turnos.
- Asistente de terminal y automatizacion de shell: las sesiones de terminal estan representadas en la calibracion, y el modelo puede emitir tool calls estructuradas para ejecutar comandos y procesar sus resultados en el turno siguiente.
- Extraccion y analisis de documentos financieros: entrenado y calibrado con tablas de memorias anuales y formularios 10-K, es adecuado para resumir, extraer campos y responder preguntas sobre informes extensos.
- Edicion y revision de documentos largos: la captura incluye edicion de documentos y texto de PDF, por lo que el modelo puede reescribir secciones manteniendo coherencia sobre entradas extensas.
- Orquestacion de workflows multi-agente: el modelo cubre roles de orquestador, arquitecto, configurador, lector de importaciones y ejecutor de pasos, lo que permite usarlo como pieza de un pipeline de agentes con herramientas.
- Asistencia de programacion en local: con tool calling y modo de razonamiento alto, puede integrarse en flujos de edicion de codigo y ejecucion de pruebas sin depender de la nube.
- Despliegue con restricciones de VRAM: las variantes Q4_K_M (2,77 GB) y Q6_K (3,69 GB) permiten ejecutar el modelo en equipos de consumo con perdida de calidad medida y documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card remite a la ficha del modelo BF16 para los resultados de benchmark.

Lo que si se publica es la evaluacion de fidelidad de la cuantizacion frente a los pesos BF16, medida como divergencia KL media por token (en nats) sobre conjuntos disjuntos del de calibracion:

| Fichero | Tamano | KLD chat | Top-1 identico (chat) | KLD texto plano | Decodificacion (tok/s) |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 4,38 GB | 0,0061 | 98,3 % | 0,0019 | 159 |
| Q6_K (atencion + embedding Q8_0, imatrix) | 3,69 GB | 0,0188 | 96,5 % | 0,0059 | 173 |
| Q4_K_M (imatrix) | 2,77 GB | 0,1517 | 88,7 % | 0,0591 | 201 |

Comparativas internas de la receta Q6_K: mismo mix sin imatrix da KLD chat de 0,0229; mix estandar con imatrix, 0,0363. El conjunto de chat comprende 65.536 tokens puntuados (64 fragmentos de 2.048) y el de texto plano 29.696 tokens (116 fragmentos de 512). Las velocidades se midieron con `llama-bench` (prompt de 512 tokens, 128 generados) en un Mac Studio con M5 Ultra; el prefill es de aproximadamente 6.500-6.600 tok/s en los tres ficheros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,4 GB para Q8_0, 3,7 GB para Q6_K y 2,8 GB para Q4_K_M, mas el espacio de cache KV segun contexto.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU con 6-8 GB de VRAM o mas puede alojar las variantes cuantizadas.
- Cabe en GPU de consumo: si, en todas las variantes; Q4_K_M y Q6_K son las opciones para equipos con 4-6 GB de VRAM.
- Opciones de despliegue: llama.cpp (incluido `llama-server --jinja` para razonamiento y parseo de herramientas) y Osaurus for Windows. En macOS, Osaurus sirve MLX y no GGUF, por lo que alli debe usarse la build JANG_6M. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 159 tok/s (Q8_0), 173 tok/s (Q6_K) y 201 tok/s (Q4_K_M) en decodificacion, con prefill de 6.500-6.600 tok/s, medidos en un Mac Studio M5 Ultra.
- Nota operativa: los parametros de muestreo estan embebidos en el GGUF (temp 1.0, top_p 0.95, top_k desactivado, sin penalizacion de repeticion); los ids de token son bos 0, eos 1, unk 5, pad 2, con `add_bos_token` y `add_eos_token` en false. Las herramientas se renderizan en el primer bloque de sistema, de modo que cambiar el conjunto de herramientas obliga a un re-prefill completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raptor 0.7 4B (GGUF) | 4,11 B | no disponible | Apache-2.0 | GGUF (Q8_0, Q6_K, Q4_K_M) | Ajuste para agente con modos de razonamiento y tool calling; KLD documentada por cuantizacion |
| Spark-X2.6-4B (modelo base) | 4 B (aproximado) | no disponible | Apache-2.0 | BF16 | Modelo original del equipo SparkLLM; sin ajuste de agente |
| Raptor 0.7 4B BF16 | 4,11 B | no disponible | Apache-2.0 | BF16 | Pesos de referencia del ajuste, sin cuantizar |
| Raptor 0.7 4B JANG_6M | 4,11 B | no disponible | Apache-2.0 | MLX (JANG 6M) | Misma captura de calibracion, para macOS |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y no se han publicado evaluaciones al respecto.
- Longitud de contexto: no se documenta en la informacion disponible, lo que impide planificar cargas de documentos largos con garantias.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad; como modelo de 4 B, la fiabilidad en tareas factuales complejas debe validarse en el dominio de uso.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad o toxicidad.
- Cuantizacion: Q4_K_M presenta una divergencia KL en chat de 0,1517 y solo un 88,7 % de coincidencia top-1 con BF16, un degradado notable frente a Q6_K (0,0188 y 96,5 %); para tareas sensibles a la precision conviene usar Q6_K o Q8_0.
- Compatibilidad de runtime: requiere llama.cpp posterior a 2026-09-06 (PR #27868); aplicaciones que empaqueten una version anterior rechazaran los ficheros. Es imprescindible `--jinja` para el razonamiento y el parseo de herramientas.
- Plataforma: en macOS Osaurus no sirve GGUF; debe usarse la build MLX JANG_6M.
- Coste operativo: cambiar el conjunto de herramientas fuerza un re-prefill completo, lo que penaliza escenarios con herramientas dinamicas.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Spark-X2.6-4B; conviene revisar su model card.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OsaurusAI/Raptor-0.7-4B-GGUF
- Modelo base BF16 (detalles y benchmarks): https://huggingface.co/OsaurusAI/Raptor-0.7-4B-BF16
- Build MLX para macOS: https://huggingface.co/OsaurusAI/Raptor-0.7-4B-JANG_6M
- Modelo original Spark-X2.6-4B: https://huggingface.co/XHToken/Spark-X2.6-4B
- Soporte de `spark2_5` en llama.cpp (PR #27868): https://github.com/ggml-org/llama.cpp/pull/27868
- Sitio de Osaurus: https://osaurus.ai
- Osaurus for Windows: https://osaurus.ai/windows
