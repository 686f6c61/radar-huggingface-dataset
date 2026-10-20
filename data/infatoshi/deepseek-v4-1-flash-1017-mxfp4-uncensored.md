# Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-MXFP4-uncensored es una cuantizacion y edicion del checkpoint DeepSeek-V4.1-Flash-1017 publicada por el usuario Infatoshi. Se trata de un modelo de generacion de texto de gran escala (763.205.315.794 parametros segun los tensores safetensors del repositorio) distribuido en formato MXFP4 mixto y pensado para servirse con vLLM. La model card indica que deriva del modelo base oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017` y de la variante `pqhaz/DeepSeek-V4.1-Flash-1017-heretic`, de la que hereda el caracter "uncensored" (menor tasa de rechazo ante peticiones consideradas daninas).

El interes de esta ficha esta en que el autor documenta, con metodologia explicita, cuatro formatos de cuantizacion de la misma familia de checkpoints (MXFP4 nativo, NVFP4, EXL3 2.875 bpw y EXL3 3.5 bpw) y los compara en terminos de comportamiento, codificacion, velocidad y latencia sobre cuatro GPU RTX PRO 6000 Blackwell de 96 GB. La model card menciona cuantizacion de "expertos", lo que apunta a una arquitectura de mezcla de expertos (MoE), aunque no se detalla el numero de expertos ni los parametros activos. El contexto total indicado es de 300K tokens (entrada mas salida).

La relevancia practica es doble: por un lado, ofrece una via para servir un modelo de ~763B parametros en hardware de 96 GB por GPU mediante cuantizacion de 4 bits; por otro, incorpora un drafter nativo de prediccion multi-token (DSpark MTP) con cinco posiciones especulativas, lo que afecta al rendimiento en produccion. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de DeepSeek V4.1 (se mencionan "expertos" y cuantizacion de expertos, lo que sugiere MoE; el numero de expertos y la configuracion exacta no se detallan) |
| Parametros totales | 763.205.315.794 (~763,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 300K tokens totales (entrada + salida) |
| Tipos de cuantizacion | MXFP4 mixto (etiquetas adicionales: 8-bit, fp8); variantes alternativas del mismo autor en NVFP4, EXL3 2.875 bpw y EXL3 3.5 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria declarada: vllm) |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion detallada de la arquitectura interna (numero de capas, dimension del modelo, numero de expertos, atencion utilizada). La model card menciona repetidamente "expert quantization" y "EXL3 ... experts", lo que confirma que el checkpoint emplea una estructura de mezcla de expertos. El modelo base es DeepSeek-V4.1-Flash-1017, y esta variante se construye sobre la edicion "heretic" (orientada a reducir rechazos) y se reempaqueta en MXFP4 mixto.

El elemento tecnico mas destacado que si se documenta es el drafter nativo DSpark de prediccion multi-token (MTP) con cinco posiciones especulativas, presente en los cuatro formatos publicados por el autor. Esto habilita decodificacion especulativa en el servidor (medida mediante contadores de aceptacion, no como garantia de aceleracion extremo a extremo). El autor tambien documenta un experimento separado de drafter en NVFP4 que no debe confundirse con el checkpoint objetivo NVFP4. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en esta edicion.

## Capacidades

- Generacion de texto en modo chat y en modo razonamiento (la model card distingue explicitamente "chat-mode" y "reasoning-mode" en sus evaluaciones).
- Uso de herramientas (tool-use) segun la etiqueta `tool-use` del repositorio.
- Codificacion: se evalua con HumanEval (164 tareas) y con comprobaciones de edicion acotadas; el autor indica que no equivalen a SWE-bench.
- Razonamiento multi-paso en el contexto de flujos de agente ("warm agent" y "reasoning agent" en las mediciones).
- Contexto largo de hasta 300K tokens totales (entrada mas salida).
- Decodificacion especulativa mediante drafter MTP DSpark de cinco posiciones.
- Edicion "uncensored": reduce la tasa de cumplimiento de rechazos frente a peticiones daninas (medido con HarmBench y JailbreakBench por el autor).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente con contexto largo: con 300K tokens de ventana total, el modelo puede mantener historiales extensos y documentos de referencia en una misma sesion, reduciendo la necesidad de resumen intermedio.
- Asistentes de codigo en pipelines internos: la etiqueta `tool-use` y la evaluacion con HumanEval permiten integrarlo en flujos de generacion y revision de codigo, siempre que se validen las comprobaciones de ejecucion en el propio entorno.
- Agentes multi-paso con herramientas: el modo razonamiento y el soporte de tool calling encajan en orquestadores que encadenan llamadas a APIs y razonamiento intermedio.
- Procesamiento de documentacion tecnica extensa: la ventana de 300K permite ingerir manuales o expedientes completos y responder preguntas sobre ellos sin trocear.
- Escenarios de investigacion sobre seguridad y alineacion: al ser una variante "uncensored" derivada de heretic, resulta util para estudiar tasas de cumplimiento danino con HarmBench y JailbreakBench, no para despliegues de cara al publico sin filtros adicionales.
- Servicio de inferencia de alta capacidad en infraestructura multi-GPU: con vLLM y el drafter MTP, el modelo esta pensado para despliegues con cuatro GPU de 96 GB o equivalentes, orientado a cargas concurrentes.
- Evaluacion comparativa de tecnicas de cuantizacion: sus cuatro formatos hermanos permiten medir el impacto de MXFP4, NVFP4 y EXL3 en calidad y rendimiento sobre el mismo checkpoint.

## Benchmarks y rendimiento

La model card describe la metodologia y los graficos, pero no incluye tablas con valores numericos en la informacion disponible. Los conjuntos y protocolos empleados por el autor son los siguientes:

| Prueba | Protocolo indicado | Resultado numerico |
|---|---|---|
| HarmBench | 300 prompts directos; clasificador fijado con 95/100 controles balanceados superados | no disponible |
| JailbreakBench | 100 prompts; puntuacion auxiliar con rubrica HarmBench, no oficial de JBB | no disponible |
| HumanEval | 164 tareas, ejecucion sin red, un completion greedy, sin reparacion, limite de 3 s CPU y 512 MiB de espacio de direcciones | no disponible |
| MMLU estricto | Limite de ocho tokens, sensible al formato | no disponible |
| Rendimiento (chat, agente en caliente, agente de razonamiento, contexto en frio) | Tres patas medidas por punto (dos en contexto en frio); barras de minimo-maximo observado, no intervalos de confianza | no disponible |
| Aceptacion del drafter | Metrica de contador de servidor, no garantia de aceleracion extremo a extremo | no disponible |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del repositorio: 510,3 GB en safetensors, lo que exige agregacion multi-GPU para servir el modelo.
- VRAM estimada para inferencia: el autor mide sobre cuatro RTX PRO 6000 Blackwell de 96 GB (384 GB en total); no se documenta una configuracion de menor VRAM.
- GPU recomendadas: cuatro RTX PRO 6000 Blackwell 96 GB (configuracion usada en las mediciones); alternativas equivalentes en capacidad agregada serian conjuntos de A100 o H100 de 80 GB.
- No cabe en GPU de consumo: 510 GB de pesos y 300K de contexto hacen inviable su ejecucion en una unica GPU consumer.
- Opciones de despliegue: vLLM (libreria declarada por el autor). La model card detalla el uso del drafter MTP DSpark con cinco posiciones especulativas y opciones de ajuste documentadas en `comparison-data.json` (no incluido en la informacion proporcionada).
- Latencia y throughput: el autor publica graficos de throughput, interactividad, latencia de respuesta, prefill de entradas largas y aceptacion del drafter, medidos con tres patas por punto, pero sin cifras numericas en la informacion disponible.
- Consideracion de contexto: con 300K tokens totales y 32 slots de planificador, la cache KV puede dominar el consumo de VRAM en sesiones concurrentes; el autor advierte que 32 slots no equivalen a 32 sesiones simultaneas de 300K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored (este) | 763,2B | 300K | MXFP4 mixto | MIT | Edicion uncensored, drafter DSpark MTP, vLLM |
| Infatoshi/DeepSeek-V4.1-Flash-1017-NVFP4-uncensored | no disponible | no disponible | NVFP4 | MIT (presumible, mismo autor) | Variante NVFP4 del mismo checkpoint; incluye experimento de drafter NVFP4 |
| Infatoshi/DeepSeek-V4.1-Flash-1017-EXL3-2.875bpw-uncensored | no disponible | no disponible | EXL3 2.875 bpw en expertos | MIT (presumible) | Mantiene pesos MTP nativos |
| Infatoshi/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw-uncensored | no disponible | no disponible | EXL3 3.5 bpw en expertos | MIT (presumible) | Mantiene pesos MTP nativos |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | original | no disponible | Checkpoint de referencia sobre el que se construyen las ediciones |

No se dispone de datos numericos comparativos con modelos de otras familias de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Naturaleza "uncensored": el modelo reduce deliberadamente los rechazos ante peticiones daninas. No es apto para exposicion directa al publico sin filtros y requiere revision de seguridad en produccion.
- Riesgo de alucinacion: no se documentan evaluaciones especificas de factualidad; el checkpoint es una cuantizacion de 4 bits del modelo base y puede acumular degradacion adicional.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento multilingue equivalente al del modelo original.
- Cuantizacion agresiva: MXFP4 mixto sobre 763B parametros implica perdida de precision no cuantificada en la informacion disponible; el autor advierte que las diferencias pequenas en sus graficos no prueban superioridad.
- Configuracion de hardware: requiere cuatro GPU de 96 GB; no hay ruta documentada para despliegues mas pequenos.
- Contexto y concurrencia: 300K tokens totales y 32 slots de planificador no garantizan 32 sesiones simultaneas a maxima longitud; la cache KV puede limitar la concurrencia real.
- Metodologia de benchmarks: HarmBench, JailbreakBench, MMLU y HumanEval se ejecutan con variantes propias del autor que no equivalen a las puntuaciones oficiales; los resultados no deben compararse directamente con cifras publicadas de otros modelos.
- Licencia: MIT sobre la edicion, pero conviene verificar la licencia del modelo base DeepSeek-V4.1-Flash-1017 y de la variante heretic antes de uso comercial.
- Repositorio reciente y sin descargas: 0 descargas en el momento de la consulta, lo que limita la validacion independiente de la calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Infatoshi/DeepSeek-V4.1-Flash-1017-MXFP4-uncensored
- Variante NVFP4: https://huggingface.co/Infatoshi/DeepSeek-V4.1-Flash-1017-NVFP4-uncensored
- Variante EXL3 2.875 bpw: https://huggingface.co/Infatoshi/DeepSeek-V4.1-Flash-1017-EXL3-2.875bpw-uncensored
- Variante EXL3 3.5 bpw: https://huggingface.co/Infatoshi/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante heretic de partida: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
