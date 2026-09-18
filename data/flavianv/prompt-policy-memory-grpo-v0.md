# flavianv/prompt-policy-memory-grpo-v0

## Resumen

`flavianv/prompt-policy-memory-grpo-v0` es un adaptador LoRA entrenado mediante GRPO sobre el modelo base Qwen/Qwen3-4B (revisión `1cfa9a7208912126459214e8b04321603b3df60c`). No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador en safetensors (0,1 GB) y requiere cargar por separado el modelo base de aproximadamente 4.000 millones de parámetros. Su propósito es muy concreto: la toma de notas en texto plano a lo largo de sesiones acumulativas, manteniendo memoria entre turnos y entre sesiones.

El problema que aborda es la degradación de la memoria a largo plazo en conversaciones multi-sesión. En cada sesión t, el modelo recibe el texto de las sesiones 1 a t, marcas temporales y las notas que él mismo guardó previamente, y emite hechos dispersos en líneas con formato `clave: valor`, sin requisito de JSON. Las claves son flexibles y las notas existentes se conservan salvo que una actualización reemplace la misma clave normalizada.

El autor publica mejoras de recall de valores objetivo del 73,75% al 91,37% en el split de entrenamiento y del 66,99% al 80,93% en 20 sesiones de dos usuarios nuevos. Se trata de un experimento pequeño, reciente (repositorio creado el 18 de septiembre de 2026) y sin tracción pública (0 descargas, 0 likes), distribuido con dataset, código, semillas y hashes para facilitar la reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA acoplado mediante PEFT |
| Parametros totales | Modelo base Qwen3-4B, aproximadamente 4.000 millones; el adaptador no duplica los pesos. Recuento exacto de parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (limite usado en entrenamiento); tope de salida de 8.192 tokens |
| Tipos de cuantizacion | no disponible. El entrenamiento se hizo sin cuantizacion (base BF16 congelada, adaptadores FP32 bajo autocast BF16). No se publican pesos GGUF ni versiones cuantizadas del adaptador |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion con el modelo base para despliegue standalone |
| Modelo base | Qwen/Qwen3-4B, revision 1cfa9a7208912126459214e8b04321603b3df60c |
| Configuracion LoRA | rank 16, alpha 32, dropout 0; aplicado a proyecciones q/k/v/o de atencion y gate/up/down del MLP |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft (entorno de entrenamiento: torch 2.11, transformers 5.12.1, peft 0.19.1) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo denso Qwen3-4B, sobre el que se inserta un adaptador LoRA de rango 16 y alpha 32, sin dropout, en las proyecciones de consulta, clave, valor y salida de la atencion, asi como en las proyecciones gate, up y down del MLP. El entrenamiento se realizo sobre RecoAtlas B200 MIG 3g.90gb, con el modelo base congelado en BF16 y los adaptadores en FP32 bajo autocast BF16, sin cuantizacion. El ajuste se hizo con GRPO: cuatro muestras por sesion, temperatura 1,5, top-p 1, top-k 0, ventajas normalizadas por grupo, clipping de 0,2 y coeficiente KL de 0,02. Optimizador AdamW con tasa de aprendizaje 1e-5, cota de norma de gradiente 1 y semilla 2718. Se dio una unica pasada cronologica sobre 100 sesiones, con 16 actualizaciones de aprendizaje no nulas; los 84 grupos con recompensa empatada se omitieron. El adaptador guardado se recargo con una diferencia maxima de log-probabilidad verificada de 0,0.

Los datos proceden del dataset `flavianv/prompt-policy-memory-v0`: diez usuarios sinteticos con diez sesiones cronologicas cada uno en el split de entrenamiento, y dos perfiles nuevos generados con gpt-5.6-luna con diez sesiones cada uno (20 sesiones) para el test, con identidades disjuntas. Las plantillas de sesion y las sondas temporales fijas se comparten entre splits. La recompensa es el recuento de valores normalizados unicos compartidos entre las notas fusionadas y el objetivo privado de la sesion actual; las claves se ignoran, los valores repetidos cuentan una sola vez y los valores no soportados no restan recompensa. No hay requisito de salida JSON, no se aplica seleccion best-of-four de memoria y el candidato cero se arrastra a la sesion siguiente con independencia de su recompensa. El pensamiento (thinking) de Qwen se desactiva durante el entrenamiento y la evaluacion.

## Capacidades

- Toma de notas acumulativa en texto plano: emite hechos dispersos con formato `clave: valor`, una entrada descriptiva por linea, con claves flexibles.
- Memoria entre sesiones: mantiene y actualiza las notas propias de sesiones anteriores, reemplazando una entrada solo cuando la clave normalizada coincide.
- Normalizacion de valores: maneja mayusculas y minusculas, puntuacion, orden de colecciones, una pequena tabla de alias de unidades y preservacion de fechas ISO; los valores compuestos o de tipo lista deben coincidir como coleccion normalizada completa.
- Extraccion de hechos a partir de texto conversacional acumulado, con soporte de marcas temporales y hora actual en el prompt.
- Generacion de texto conversacional (pipeline declarado: text-generation) sobre plantilla de chat de Qwen.
- Reproduccion exacta del comportamiento entrenado mediante el prompt de sistema de politica, `enable_thinking=False`, temperatura 1,5, top-p 1 y top-k 0.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, razonamiento multi-paso, vision, audio ni modo thinking (de hecho, el thinking se desactiva de forma explicita).
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente para ingles.
- No hay requisito de JSON, por lo que la salida necesita post-procesado para integrarse en sistemas estructurados.

## Casos de uso

- Memoria de largo plazo en asistentes conversacionales: el adaptador permite que un asistente mantenga un fichero de notas entre sesiones sucesivas de un mismo usuario, recuperando hechos declarados en conversaciones anteriores mediante la acumulacion de texto de sesiones 1..t, con una ventana de 16.384 tokens.
- Sistemas de atencion al cliente con historial: en escenarios donde el mismo cliente contacta repetidamente, el modelo puede resumir y actualizar hechos relevantes (productos, incidencias, preferencias) sin que el agente tenga que releer todo el historial.
- Seguimiento longitudinal en investigacion cualitativa: transcripciones o notas de sesiones periodicas con un participante pueden procesarse sesion a sesion para construir un registro de hechos consolidado y actualizable.
- Generacion de perfiles en aplicaciones de salud y bienestar (con las cautelas legales oportunas): registro incremental de habitos, sintomas o rutinas declarados por el usuario, manteniendo coherencia temporal mediante fechas ISO.
- Onboarding progresivo de usuarios en productos digitales: el modelo acumula preferencias y datos declarados durante las primeras sesiones para personalizar interacciones posteriores sin reinyectar todo el historial.
- Preprocesado de historiales para sistemas RAG o bases de conocimiento: el adaptador convierte texto conversacional acumulado en pares `clave: valor` que despues se indexan o se cargan en una base de datos, reduciendo el ruido del historial bruto.
- Investigacion sobre RL aplicado a memoria: sirve como referencia reproducible (dataset, semillas y codigo publicados) para estudiar GRPO en tareas de agregacion de hechos y comparar contra el modelo base congelado.
- Evaluacion de tecnicas de normalizacion de valores y de politicas de retencion de notas, dado que el autor publica el codigo de fusion y de puntuacion de valores.

## Benchmarks y rendimiento

Resultados de recall de valores objetivo publicados en la model card (el modelo original se evalua con el adaptador desactivado; el modelo entrenado usa el adaptador guardado; entradas, instrucciones, temperatura, numero de candidatos, puntuacion y politica de arrastre coinciden):

| Split / semilla | Recall congelado | Recall GRPO | Ganancia |
|---|---:|---:|---:|
| Entrenamiento / 7319 | 73,75% | 91,37% | 17,63 pp |
| Entrenamiento / 7320 | 72,61% | 91,01% | 18,40 pp |
| Entrenamiento / 7321 | 72,28% | 91,23% | 18,95 pp |
| Test con usuarios nuevos / 7322 | 66,99% | 80,93% | 13,93 pp |

Metricas de test sobre los 80 candidatos (20 sesiones x 4 candidatos):

| Metrica | Congelado | GRPO |
|---|---:|---:|
| Valores coincidentes | 747 | 888 |
| Valores objetivo | 1.088 | 1.088 |
| Valores no soportados | 228 | 133 |
| Salidas parseables | 80 | 80 |

El autor indica que ambos modelos lograron exact pass@4 (el conjunto completo de valores de un candidato coincide con el objetivo sin valores no soportados) en una de las veinte sesiones de test. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador es de 0,1 GB, pero hay que cargar el modelo base Qwen3-4B. En BF16 se estiman unos 8 GB solo de pesos, mas cache KV, por lo que conviene reservar 10-12 GB para contexto moderado; en cuantizacion de 4 bits se estiman 2,5-3 GB de pesos. Son estimaciones derivadas del tamano del modelo base; el autor no publica mediciones de VRAM.
- GPU recomendadas: el entrenamiento se ejecuto sobre RecoAtlas B200 MIG 3g.90gb. Para inferencia, el modelo base de 4B es manejable en GPUs de 8-16 GB; GPUs de 24 GB o mas (RTX 4090, L40S, A100, H100) ofrecen margen amplio para contexto largo y lotes mayores.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 8 GB o mas con cuantizacion de 4 bits y de 12-16 GB en BF16, aunque no hay validacion publicada de estos escenarios.
- Opciones de despliegue: carga directa con transformers + peft (metodo documentado por el autor), fusion del adaptador en el modelo base para servir con vLLM o TGI, y conversion a GGUF para llama.cpp u Ollama tras la fusion. No se publican pesos GGUF y el autor no documenta configuraciones de servido.
- Latencia y throughput: no disponible. No hay mediciones publicadas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall en el test de usuarios nuevos | Licencia | Formato |
|---|---|---|---:|---|---|
| prompt-policy-memory-grpo-v0 (Qwen3-4B + LoRA GRPO) | ~4B base + adaptador rango 16 | 16.384 tokens | 80,93% | apache-2.0 | safetensors (adaptador PEFT) |
| Qwen/Qwen3-4B (base congelado, mismo prompt) | ~4B | 16.384 tokens en este experimento | 66,99% | apache-2.0 | safetensors (pesos completos) |
| Otros adaptadores de memoria publicos | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos generalistas de tamano similar (por ejemplo, familias de 3-4B) | no disponible en la informacion proporcionada | no disponible | no evaluados con este protocolo | no disponible | no disponible |

La unica comparacion con datos verificables es contra el modelo base congelado bajo el mismo protocolo. No se dispone de comparaciones con alternativas de la misma categoria evaluadas con la misma tarea y metrica, por lo que la comparativa externa se considera no disponible.

## Limitaciones y advertencias

- El test con usuarios nuevos es muy reducido: 20 sesiones de dos perfiles, generados con el mismo generador (gpt-5.6-luna) y las mismas plantillas que el entrenamiento. El propio autor advierte que esto no establece generalizacion amplia.
- La metrica principal (recall de valores) ignora las claves, por lo que no garantiza que los valores se asignen al atributo correcto. Exact pass@4 solo se alcanzo en una de las veinte sesiones de test.
- Riesgo de alucinacion: los valores no soportados no restan recompensa durante el entrenamiento, lo que puede favorecer la emision de hechos no respaldados por el contexto. En el test quedan 133 valores no soportados frente a 228 del modelo congelado.
- Solo ingles. No hay capacidades multilingues documentadas y no se ha evaluado el comportamiento en castellano.
- Salida en texto plano sin JSON, con claves flexibles: requiere post-procesado y normalizacion propios para integrarla en sistemas estructurados.
- El thinking de Qwen debe permanecer desactivado y la reproduccion exacta exige temperatura 1,5, top-p 1 y top-k 0, ademas del prompt de sistema de politica del repositorio. Variar estos parametros puede degradar el comportamiento.
- La evaluacion no cubre sesgos sociales, toxicidad ni equidad; no hay datos al respecto.
- El entrenamiento consistio en una unica pasada cronologica con 16 actualizaciones efectivas y 84 grupos empatados descartados, lo que limita la magnitud del ajuste y hace plausible el sobreajuste a las plantillas del dataset.
- Licencia apache-2.0 tanto en el adaptador como en el modelo base, por lo que el uso comercial esta permitido; conviene revisar los terminos del modelo base Qwen3-4B y mantener la atribucion.
- Traccion publica nula (0 descargas, 0 likes) y ausencia de validacion independiente: no debe considerarse un componente listo para produccion sin evaluacion propia.
- No hay datos publicados de latencia, throughput ni consumo de VRAM, lo que dificulta la planificacion de capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flavianv/prompt-policy-memory-grpo-v0
- Dataset (100 sesiones de entrenamiento y 20 de test): https://huggingface.co/datasets/flavianv/prompt-policy-memory-v0
- Codigo y artefactos del experimento: https://github.com/flavianv/prompt_policy_llm/tree/experiment0.0-adaptgym-memory
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- No se han encontrado fuentes externas relevantes sobre este modelo en la busqueda web realizada.
