# Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence

## Resumen

Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence es una adaptacion del modelo Qwen3.8-27B de Qwen (Alibaba) realizada por el usuario Shiftedx, publicada en Hugging Face en noviembre de 2026. Se trata de una fusion (merge) de un LoRA denominado "pi-adapted" (publicado por harness-hub) sobre los pesos BF16 originales de Qwen3.8-27B, posteriormente convertida al formato MLX para su ejecucion en hardware Apple Silicon. El resultado incorpora vision, un sidecar MTP (multi-token prediction) nativo en BF16 y una configuracion de atencion particular ("Attention8") junto con recurrencia en BF16.

El modelo resuelve el problema de disponer de una variante de Qwen3.8-27B optimizada para inferencia local en Macs con chip M-series, manteniendo el pipeline de decodificacion especulativa mediante el draft model DFlash2. Con aproximadamente 27.360 millones de parametros y un tamano de repositorio de 23,8 GB (unos 22 GiB para el modelo objetivo), esta pensado para despliegues en una sola maquina consumer de gama alta (probado en un M4 Max con 64 GiB).

Es relevante ahora porque demuestra la viabilidad de servir un modelo de 27B con vision, contexto de 133.120 tokens y decodificacion especulativa a velocidades superiores a 80 tokens por segundo en hardware Apple, algo que hasta hace poco requeria GPUs de datacenter. La licencia Apache 2.0 facilita su uso comercial, aunque las capacidades completas de la variante pi-adapted (herramientas, agentes, vision) aun no estan completamente verificadas segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con configuracion "Attention8" y recurrencia en BF16; incluye sidecar MTP (multi-token prediction) |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 133.120 tokens (configuracion de servicio recomendada); validado con centinelas de 65.536 y 131.072 tokens |
| Tipos de cuantizacion | 4-bit (segun tags); pesos BF16 para el objetivo y el sidecar MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX); repositorio de 23,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de aproximadamente 27.360 millones de parametros. Sobre esa base se aplica un LoRA llamado "pi-adapted" (publicado por harness-hub) que se fusiona con los pesos BF16 originales. La variante publicada por Shiftedx anade dos particularidades tecnicas: una configuracion de atencion designada "Attention8" y una recurrencia implementada en BF16, ademas de conservar el sidecar MTP nativo en BF16 que permite la prediccion multi-token.

El entrenamiento especifico del adaptador pi-adapted no esta documentado en la informacion disponible (no se detallan tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO). La innovacion destacable es la integracion del pipeline de decodificacion especulativa mediante el draft model DFlash2 (z-lab/Qwen3.8-27B-DFlash2), que acelera la generacion sin degradar la paridad de respuestas en las pruebas realizadas. La model card indica que, con thinking activado, ambos modos (DFlash2 y solo objetivo) superaron los 15 casos de contexto de Shiftedx Bench y coincidieron en 15/15 respuestas capturadas.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activable mediante `reasoning_effort` (por ejemplo, "medium").
- Vision: el modelo incorpora capacidades de vision segun los tags y la model card.
- Prediccion multi-token (MTP) mediante sidecar nativo en BF16.
- Decodificacion especulativa compatible con DFlash2 para aceleracion.
- Tool calling y uso agentico: mencionados en la model card, aunque la paridad con thinking activado queda "sin verificar".
- Soporte de contexto largo: validado en 65.536 y 131.072 tokens con conteos exactos de prompt.
- Compatibilidad con API OpenAI a traves del servidor Kapitsa (`/v1`).
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo esta empaquetado en MLX y probado en un M4 Max con 64 GiB, lo que permite ejecutar un 27B con vision y contexto largo en una estacion de trabajo Mac sin GPU dedicada. Es adecuado por su formato nativo MLX y el pipeline Kapitsa + DFlash2.
- Servicio de API compatible con OpenAI: mediante `kapitsa serve` se expone un endpoint `/v1` que permite integrar el modelo en clientes existentes (SDKs de OpenAI, LangChain, etc.) sin reescribir codigo.
- Razonamiento con contexto largo: los 133.120 tokens de contexto validados permiten tareas de analisis de documentos extensos, resumen de corpus o QA sobre material de referencia largo; los centinelas de 131K confirman que el modelo maneja prompts de esa magnitud.
- Aceleracion de decodificacion en produccion: con DFlash2 se alcanzan 86,3 tok/s de mediana frente a 19,1 tok/s en modo solo objetivo, lo que hace viable servir interacciones en tiempo casi real en hardware consumer.
- Procesamiento de documentos con vision: la capacidad de vision permite extraer informacion de imagenes y PDFs escaneados, util en pipelines de digitalizacion o extraccion de datos.
- Evaluacion y benchmarking de variantes: el repositorio Shiftedx Bench y los centinelas de contexto permiten reproducir pruebas de paridad y rendimiento para comparar configuraciones de cuantizacion y decodificacion.
- Prototipado de agentes: aunque la paridad agentica no esta verificada, el soporte de tool calling y la API compatible permiten experimentar con flujos multi-paso en local antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tokens por segundo (mediana, decodificacion) con DFlash2 | 86,3 tok/s |
| Tokens por segundo (mediana, solo objetivo) | 19,1 tok/s |
| Casos de contexto Shiftedx Bench (15 casos, thinking on) | 15/15 superados en ambos modos |
| Paridad de respuestas capturadas | 15/15 coincidentes |
| Centinelas de contexto 65.536 y 131.072 tokens | Superados con conteos exactos de prompt |
| Solicitudes en frio de 131K | Unos 12 minutos en ambos modos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: unos 22 GiB para el modelo objetivo; repositorio de 23,8 GB. En Apple Silicon la memoria es unificada, por lo que se requiere un Mac con al menos 32 GiB (probado con 64 GiB).
- GPU recomendadas: Apple M4 Max con 64 GiB (configuracion probada). Para otras GPUs no se dispone de datos de compatibilidad, ya que el formato es MLX.
- Cabe en GPU consumer: si, en Apple Silicon de gama alta; en GPUs NVIDIA consumer no hay soporte MLX nativo documentado en la informacion disponible.
- Opciones de despliegue: servidor Kapitsa (version 0.2.31 probada) con DFlash2 como draft model; API compatible con OpenAI en `http://127.0.0.1:8000/v1`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este formato.
- Latencia y throughput: 86,3 tok/s de mediana con DFlash2; 19,1 tok/s en modo solo objetivo; solicitudes en frio de 131K en unos 12 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence | 27,36 B | 133.120 | safetensors MLX | Apache 2.0 | Vision, MTP, DFlash2; probado en M4 Max |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | safetensors BF16 | Apache 2.0 (segun modelo base) | Sin adaptador pi ni configuracion MLX especifica |
| harness-hub/Qwen3.8-27B-pi-adapted | no disponible | no disponible | no disponible | no disponible | Adaptador LoRA origen del merge |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Draft model para decodificacion especulativa |

Los datos de rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.8-27B hereda los sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinacion: no cuantificado; el modo thinking con `reasoning_effort` puede producir respuestas elaboradas pero no verificadas factualmente.
- Limitaciones de contexto o idioma: contexto maximo validado de 131.072 tokens; los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y del adaptador pi-adapted.
- Paridad sin verificar: la model card indica que la paridad con thinking activado para tool calling, uso agentico y vision "permanece sin verificar"; no asumir comportamiento identico al modelo base en esas areas.
- Rendimiento en frio: solicitudes de 131K tokens en frio tardan unos 12 minutos, lo que limita su uso en escenarios de baja latencia con prompts muy largos.
- Dependencia de hardware: el formato MLX limita el despliegue a ecosistema Apple Silicon; no hay soporte documentado para GPUs NVIDIA/AMD.
- Configuracion de sampling: para los ajustes validados con thinking activado se recomienda sampling greedy (`temperature: 0`, `top_p: 1`, `top_k: 0`); desviarse puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador pi-adapted: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Draft model DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Dataset Shiftedx Bench: https://huggingface.co/datasets/Shiftedx/shiftedx-bench
