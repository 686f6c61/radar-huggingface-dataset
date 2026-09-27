# liangzhidanta/Qwen3-8B-CC-SFT-v2

## Resumen

Qwen3-8B-CC-SFT-v2 es un checkpoint de ajuste supervisado (SFT) continuado sobre Qwen3-8B-CC-SFT-v1, desarrollado por el usuario liangzhidanta y publicado en HuggingFace. Su objetivo es dotar a un modelo de 8.000 millones de parametros de capacidad nativa de compactacion de contexto para agentes de codificacion: es decir, que el modelo sepa resumir fielmente su propio estado (ficheros editados, pruebas ejecutadas, plan pendiente) cuando Claude Code dispara automaticamente una compactacion, y que sea capaz de continuar la tarea usando solo ese resumen comprimido.

El problema que aborda es concreto y medible: la version v1, al operar bajo compactacion nativa, tendia a fabricar estados de finalizacion ("he arreglado X" cuando no lo habia hecho), confundir planes con acciones ejecutadas, perder el rastro de las modificaciones y de los tests, y acumular errores en resumenes encadenados. La v2 se entrena con trayectorias reales de compactacion recogidas con GLM-5.3 bajo Claude Code, con un formato que respeta el limite de contexto visible por el modelo.

La relevancia actual esta en que la compactacion de contexto es el cuello de botella practico de los agentes de codificacion de sesion larga. Sobre un banco de 303 tareas (canonical303) con contexto REAL40K y compactacion nativa activada, la v2 resuelve 144 tareas (47,5%) frente a 106 (35,0%) de la v1 y 10 (3,3%) del Qwen3-8B base, con una diferencia de +12,5 puntos porcentuales estadisticamente significativa (p=0,0002).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen3-8B (no detallada en la model card) |
| Parametros totales | 8B (segun denominacion del modelo; no se explicita en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40960 tokens (max_seq_len de entrenamiento y contexto de evaluacion) |
| Tipos de cuantizacion | no disponible (la model card no menciona GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible en la model card del autor; hereda del base Qwen3-8B, que es multilingue segun su documentacion oficial |
| Licencia | other (terminos no especificados en la model card; requiere revision directa del repositorio) |
| Formato de pesos | no disponible explicitamente; repositorio para transformers (library_name: transformers), sin mencion de safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card mas alla de indicar que se parte del checkpoint Qwen3-8B-CC-SFT-v1, que a su vez deriva de Qwen3-8B. Por tanto, se trata de un transformer decoder-only denso de aproximadamente 8.000 millones de parametros, sin mezcla de expertos ni componentes de estado (SSM). La innovacion no esta en la arquitectura sino en el procedimiento de ajuste y en el formato de los datos.

El entrenamiento consiste en un unico epoch de SFT continuado con learning rate de 5e-6 (la mitad que la v1), scheduler coseno con 10% de warmup, optimizador Adam (beta1=0,9, beta2=0,95) con weight_decay=0,1, max_seq_len de 40960, tensor parallel de 8 y batch size de 4. El conjunto de datos suma 1629 ejemplos con una receta denominada COMPACT_FOCUSED: 1003 trayectorias normales exitosas de la v1 (replay), 239 segmentos de resumen de compactacion (peticion de compactacion reenviada por Claude Code resuelta por GLM-5.3) y 387 segmentos de continuacion post-compactacion. Nota: el texto en ingles de la model card cita 240 y 403 segmentos respectivamente, cifras que no cuadran con la tabla de datos (239 y 387); conviene tratar el desglose exacto con cautela.

La innovacion tecnica declarada es el "context-correct training format": en lugar de concatenar sesiones completas (lo que filtraria historial pre-compactacion hacia los objetivos post-compactacion y generaria desajuste entrenamiento-inferencia), los datos se dividen en los limites reales de compactacion y cada prefijo de entrenamiento se reconstruye a partir de la peticion wire realmente visible por el modelo. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento orientados a tareas de ingenieria de software dentro de un agente.
- Compactacion nativa de contexto: compresion fiel del estado del agente (ficheros modificados, tests ejecutados y sus resultados, plan pendiente) en el punto en que Claude Code dispara la compactacion.
- Continuacion post-compactacion: reanudacion de la tarea usando unicamente el estado comprimido, sin acceso al historial previo.
- Uso como coding agent en el sentido de SWE-Smith / Claude Code: ejecucion de multiples llamadas de herramienta (hasta 32 llamadas de agente en el harness de evaluacion) con razonamiento multi-paso.
- Reduccion de estados fabricados: el entrenamiento ataca explicitamente la afirmacion de correcciones no aplicadas y la confusion entre "voy a hacer X" y "he hecho X".
- Capacidades multilingues: no documentadas en la model card; dependen del modelo base.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito mas alla del comportamiento del base.

## Casos de uso

- Agentes de codificacion autonoma de sesion larga: el modelo esta disenado para resolver issues en repositorios reales dentro de un bucle de agente con herramientas, donde la ventana de 40960 tokens se agota y la compactacion es inevitable. Su ventaja medida es precisamente el 47,5% de tareas resueltas bajo compactacion nativa.
- Integracion en Claude Code como backend local: al entrenarse con el formato exacto de las peticiones de compactacion de Claude Code 2.1.258, puede desplegarse detras de esa interfaz sin adaptadores adicionales de prompt.
- Reparacion automatica en CI/CD: dado un fallo de test, el agente puede inspeccionar el repositorio, aplicar un parche y verificar; la capacidad de mantener el estado de tests es critica para no re-ejecutar ni olvidar comprobaciones.
- Refactorizacion de repositorios medianos con historial largo: tareas que requieren recordar que ficheros se tocaron y en que orden, escenario donde la v1 perdia el estado de modificacion.
- Investigacion sobre gestion de memoria en agentes: al ser un modelo de pesos abiertos con un banco de evaluacion descrito (canonical303, REAL40K), sirve como punto de comparacion para tecnicas de compactacion, resumen rodante o memoria externa.
- Despliegue on-premise para codigo propietario: un modelo de 8B puede ejecutarse en hardware local, evitando enviar el codigo fuente a APIs externas, siempre que la licencia "other" lo permita (pendiente de verificar).
- Sustitucion de modelos mayores en bucles de agente con presupuesto de latencia ajustado: 8B denso permite iteraciones mas rapidas que alternativas de mayor tamano en el mismo harness de 32 llamadas por tarea.

## Benchmarks y rendimiento

Resultados declarados por el autor en el banco canonical303, con contexto REAL40K, compactacion nativa de Claude Code activada y temperatura 0,3 (top_p 0,95, maximo 32 llamadas de agente):

| Modelo | Tareas resueltas | Tasa | Delta vs V1 |
|---|---|---|---|
| Qwen3-8B Base | 10/303 | 3,3% | — |
| Qwen3-8B-CC-SFT-v1 | 106/303 | 35,0% | — |
| Qwen3-8B-CC-SFT-v2 | 144/303 | 47,5% | +12,5 pp (p=0,0002) |

Comportamiento de compactacion en el mismo banco:

| Metrica | V1 | V2 |
|---|---|---|
| Tasa de disparo de compactacion | 79% (238/303) | 79% (239/303) |
| Eventos de compactacion totales | 752 | 633 |
| Eventos por tarea compactada | 3,16 | 2,65 |
| Terminaciones por thrash | 83 | 84 |
| Tasa de resolucion | 35,0% | 47,5% |

Interpretacion del autor: ambos modelos disparan la compactacion con la misma frecuencia, pero la v2 necesita menos eventos por tarea (2,65 frente a 3,16) y resuelve 38 tareas mas, lo que atribuye a mejor calidad del resumen y mejor recuperacion posterior. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM de pesos en BF16/FP16: aproximadamente 16 GB (el agregador LLM Explorer cifra 16,8 GB para la v1 con contexto de 40K).
- VRAM en cuantizacion INT8: aproximadamente 9 GB (estimacion derivada del tamano, no confirmada por el autor).
- VRAM en cuantizacion de 4 bits: aproximadamente 5-6 GB (estimacion derivada; no hay GGUF publicado en el repositorio).
- Cache KV a 40960 tokens: estimacion aproximada de 6 GB adicionales en FP16 para una configuracion tipo Qwen3-8B (GQA con 8 cabezas KV); el consumo real depende del backend y del nivel de cuantizacion de la cache. Dato no aportado por la model card.
- GPU recomendadas: la evaluacion oficial se ejecuto con tensor parallel de 8, lo que sugiere un nodo multi-GPU (clase A100/H100). Para inferencia de un solo usuario, una RTX 4090 (24 GB) es suficiente en BF16 con contexto reducido, y cualquier GPU de 8-12 GB lo es con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en BF16 (con gestion cuidadosa del contexto) y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: SGLang es el backend confirmado (la model card indica "CC-visible = SGLang real" en el harness). vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. La model card solo indica un limite de 32 llamadas de agente por tarea en la evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de resolucion (canonical303, compactacion nativa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-CC-SFT-v2 | 8B | 40960 | 47,5% (144/303) | other | HuggingFace, 0 descargas |
| Qwen3-8B-CC-SFT-v1 | 8B | 40960 | 35,0% (106/303) | other | HuggingFace |
| Qwen3-8B base | 8B | no disponible en esta informacion | 3,3% (10/303) | no disponible en esta informacion | HuggingFace (QwenLM) |

No se dispone de comparaciones con otros agentes de codificacion de 8B (por ejemplo variantes ajustadas de Llama, DeepSeek-Coder o Qwen-Coder) en el mismo banco, por lo que la comparativa externa queda como no disponible. La unica comparacion publicada es interna, contra el modelo base y el checkpoint anterior del mismo autor.

## Limitaciones y advertencias

- El banco de tareas es compartido con la v1, por lo que la mejora se mide con supervision sobre las mismas tareas pero distintas trayectorias; no hay validacion en un conjunto de tareas completamente nuevo.
- Los resumenes de compactacion de los datos de entrenamiento provienen de GLM-5.3 y pueden contener errores residuales que el modelo aprende a imitar.
- Persisten 84 terminaciones por thrash en canonical303 (frente a 83 de la v1), es decir, la mejora no elimina los bucles improductivos del agente.
- Solo se ha evaluado a temperatura 0,3; el comportamiento a otras temperaturas es desconocido.
- Existe una inconsistencia en la propia model card entre las cifras de segmentos de entrenamiento (240/403 en el texto ingles frente a 239/387 en la tabla de datos), lo que dificulta reproducir el dataset exacto.
- La licencia es "other" sin terminos explicitos en la model card: antes de cualquier uso comercial hay que verificar las condiciones reales en el repositorio, incluida la licencia heredada de Qwen3-8B.
- No se documentan idiomas soportados, tipos de cuantizacion, formato de pesos ni resultados de benchmarks estandar; el modelo esta orientado casi en exclusiva a un caso de uso (agente de codificacion con Claude Code), y su rendimiento fuera de ese harness no esta caracterizado.
- Riesgo de alucinacion: aunque el entrenamiento ataca explicitamente la fabricacion de estados de finalizacion, el modelo sigue siendo un LLM de 8B y puede afirmar haber aplicado cambios o ejecutado pruebas que no ha realizado; en produccion conviene verificar los parches de forma externa.
- Adopcion practica: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por terceros.
- No se declara ningun proceso de alineacion tipo RLHF o DPO, solo SFT, lo que limita las garantias de comportamiento fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v2
- Checkpoint base (v1): https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v1
- Repositorio de datos de entrenamiento: https://huggingface.co/datasets/liangzhidanta/claude-code-glm53-swesmith-compact-trajectories
- Ficha de la v1 en LLM Explorer: https://llm-explorer.com/model/liangzhidanta%2FQwen3-8B-CC-SFT-v1,lZ7rdVjJCSTN1aFzzZwGm
- Ficha de la v1 en Essa Mamdani: https://essamamdani.com/ai-models/hf-liangzhidanta-qwen3-8b-cc-sft-v1
- Repositorio oficial de la serie Qwen3: https://github.com/QwenLM/Qwen3.8
