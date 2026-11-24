# agentionai/Signal-2-Flash-Next-Gyro-GGUF

## Resumen

Signal 2 Flash Next Gyro es un ajuste fino del modelo Qwen3.8-Flash-Next (125,7 mil millones de parametros totales) desarrollado por AgentionAI y distribuido en formato GGUF cuantizado. El modelo parte de la arquitectura Mixture-of-Experts de Qwen y ha sido entrenado sobre sesiones reales de codificacion agentica recogidas con Marshall, el agente de codigo de la propia compania, mediante un proceso de autodestilacion de sus propias sesiones exitosas y auditadas. El resultado se fusiona en los pesos, sin adaptadores externos, en un unico archivo GGUF.

La propuesta de valor es la eficiencia en tokens: segun la model card, en modo de razonamiento `xhigh` empata en tareas superadas con Swift 1.5 IQ3_S (137 frente a 139 de 152 sesiones) consumiendo un 41 % menos de tokens de salida y ocupando aproximadamente la mitad de memoria de GPU (30,7 GB frente a 54,9 GB). En esfuerzo `medium` mantiene el mismo numero de tareas superadas que el Gyro-S sin ajustar (68 de 76) con un 27 % menos de tokens. El objetivo declarado es reducir la verbosidad y el tiempo de deliberacion en flujos de agente de codigo, no ampliar el conocimiento del modelo base.

Es relevante ahora porque demuestra una via practica para desplegar un modelo de 125B en una unica GPU de 32 GB mediante cuantizacion agresiva combinada con ajuste fino orientado a eficiencia, y porque publica comparativas abiertas contra otras cuantizaciones del mismo modelo base (Swift 1.5, ISTA-DASLab GSQ-RCO, AP-Q5_K_M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (modelo base Qwen3.8-Flash-Next) |
| Parametros totales | 125.743.653.760 (125,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes IQ3_S / Q5_K_M mencionadas en las comparativas; catalogo completo en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (libreria `gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-Flash-Next: un transformer con capas Mixture-of-Experts de 125,7 B de parametros totales. No se detalla en la informacion disponible el numero de parametros activos por token, el numero de expertos, la longitud de contexto nativa ni el volumen de datos de preentrenamiento del modelo base. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal (entrada de imagen y texto), si bien las capacidades evaluadas en la model card se centran exclusivamente en codificacion agentica.

El ajuste fino de AgentionAI se realizo sobre sesiones reales de trabajo del agente Marshall, con autodestilacion a partir de las propias trazas exitosas y limpias de auditoria, y los pesos resultantes se fusionaron directamente en el modelo (no se distribuye adaptador LoRA). El entrenamiento no busca mejorar la tasa de acierto bruta sino reducir la narracion y la deliberacion redundante: el modelo lee, edita, ejecuta y verifica codigo igual que el base, pero deja de deliberar cuando el siguiente paso esta claro. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modos de esfuerzo configurables (`medium`, `xhigh`) mediante el parametro `reasoning_effort`.
- Codificacion agentica: lectura, edicion, ejecucion y verificacion de codigo en bucles multi-paso.
- Entrada multimodal imagen-texto a texto, heredada del modelo base.
- Integracion como backend de agentes de codigo (validado con Marshall, el agente de AgentionAI).
- Eficiencia de tokens: menor numero de tokens de salida por tarea completada frente al modelo base sin ajustar y frente a cuantizaciones publicas comparables.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Agente de codigo autonomo en local: el modelo puede ejecutarse como backend de un agente tipo Marshall sobre una GPU de 32 GB, resolviendo tareas de lectura, edicion y verificacion de codigo con un consumo medio de 1.685 tokens de salida por sesion en esfuerzo `medium`.
- Integracion en pipelines de CI/CD con revision automatica: dado su bajo consumo de tokens por tarea y la ausencia de timeouts o errores reportada en 152 sesiones, es adecuado para pasos automatizados de correccion y comprobacion de codigo donde el coste por ejecucion importa.
- Asistencia en editores y entornos de desarrollo: el ajuste reduce la narracion superflua, lo que se traduce en respuestas mas directas y menor latencia percibida en flujos interactivos de programacion.
- Despliegue en estaciones de trabajo con una sola GPU: al ocupar 30,7 GB en GPU (sin la tabla por capas de 28,8 GB, que puede permanecer en disco), permite servir un modelo de 125B en hardware de gama alta de consumo profesional sin recurrir a multiplos GPUs.
- Procesamiento de capturas o diagramas junto a codigo: gracias al pipeline imagen-texto del modelo base, puede recibir imagenes (por ejemplo, capturas de error o diagramas) junto con instrucciones textuales en tareas de depuracion.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de la cuantizacion y del ajuste fino en la eficiencia de tokens dentro de un mismo modelo base, con metodologia publicada (152 sesiones, 4 semillas, test de signos pareado).
- Automatizacion de tareas de refactorizacion acotadas: en esfuerzo `medium` mantiene la tasa de exito del modelo sin ajustar con menos tokens, lo que abarata ejecuciones repetitivas sobre repositorios.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la puerta de evaluacion de codificacion agentica de Marshall:

| Modelo (xhigh) | Memoria en GPU | Superadas (de 152) | Tokens de salida medios / sesion |
|---|---:|---:|---:|
| Signal 2 | 30,7 GB | 137 | 2.373 |
| Swift 1.5 IQ3_S (ukisai) | 54,9 GB | 139 | 4.013 |

| Modelo (medium) | Memoria en GPU | Superadas (de 76) | Tokens de salida / sesion |
|---|---:|---:|---:|
| Signal 2 | 30,7 GB | 68 | 1.685 |
| Qwen3.8-Flash-Next Gyro-S (sin ajustar) | 29,7 GB | 68 | 2.323 |
| Swift 1.5 IQ3_S (ukisai) | 54,9 GB | 66 | 2.319 |
| Swift 1.5 IQ3_S_G8 (ukisai) | 55,6 GB | 67 | 2.395 |
| ISTA GSQ-RCO IQ3_S (ISTA-DASLab) | 54,8 GB | 66 | 2.547 |
| AP-Q5_K_M (AgentionAI) | 82,4 GB | 69 | 2.221 |

Datos adicionales de la model card: frente al Gyro-S sin ajustar, Signal 2 empata en tareas superadas con un 27 % menos de tokens de salida (1.623 frente a 2.228 por sesion) y reduce el tiempo de 76 sesiones de 111 a 95 minutos; alcanza el 94 % de la tasa de exito de AP-Q5_K_M (133 frente a 141 de 152 sesiones); la sesion mediana usa un 48 % menos de tokens que Swift 1.5 IQ3_S; y no se registraron timeouts, errores ni respuestas vacias en 152 sesiones. La diferencia de superadas frente a Swift 1.5 IQ3_S en xhigh se declara empate estadistico (test de signos pareado, p = 0,82). No se han publicado en la informacion disponible resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM para inferencia: 30,7 GB en GPU para la cuantizacion evaluada (sin contar la tabla por capas de 28,8 GB, que puede mantenerse en disco). La variante AP-Q5_K_M del mismo modelo base requiere 82,4 GB.
- GPU recomendadas: tarjetas con 32 GB o mas de VRAM, como RTX 5090 o profesionales de gama alta; el modelo esta disenado explicitamente para "una tarjeta de 32 GB". Para la variante Q5_K_M se necesitan 80 GB o mas (A100 80 GB, H100).
- GPU de consumo: cabe en tarjetas consumer de 32 GB; no cabe en GPUs de 24 GB o menos con esta cuantizacion.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp y con los runners que lo consumen (Ollama, LM Studio y similares); las etiquetas del repositorio indican compatibilidad con endpoints. No se confirma en la informacion disponible soporte de vLLM o TGI para este formato.
- Latencia y throughput: la model card reporta 95 minutos para 76 sesiones en esfuerzo `medium` (frente a 111 minutos del Gyro-S sin ajustar) en la misma maquina, lo que equivale a aproximadamente 75 segundos por sesion. No se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Memoria en GPU | Superadas (medium, de 76) | Tokens / sesion | Licencia |
|---|---|---:|---:|---:|---|
| Signal 2 Flash Next Gyro | 125,7 B (MoE) | 30,7 GB | 68 | 1.685 | qwen-community-1.0 |
| Qwen3.8-Flash-Next Gyro-S (sin ajustar) | 125,7 B (MoE) | 29,7 GB | 68 | 2.323 | qwen-community-1.0 |
| Swift 1.5 IQ3_S (ukisai) | mismo base | 54,9 GB | 66 | 2.319 | derivada del base |
| ISTA GSQ-RCO IQ3_S (ISTA-DASLab) | mismo base | 54,8 GB | 66 | 2.547 | derivada del base |
| AP-Q5_K_M (AgentionAI) | mismo base | 82,4 GB | 69 | 2.221 | qwen-community-1.0 |

Todas las alternativas comparadas son cuantizaciones o ajustes del mismo modelo base Qwen3.8-Flash-Next, por lo que la comparacion mide el efecto de la cuantizacion y del ajuste fino, no diferencias de arquitectura. La ventaja principal de Signal 2 es la relacion entre tareas superadas y memoria ocupada: iguala o casi iguala en exito a variantes que necesitan entre 1,8 y 2,7 veces mas VRAM.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al heredar el modelo base, arrastra los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinacion: no cuantificado en la model card; el ajuste optimiza eficiencia de tokens, no veracidad, y la reduccion de deliberacion podria aumentar la confianza en pasos incorrectos en tareas fuera del dominio de codificacion.
- La evaluacion se limita a una unica puerta interna (Marshall) con 76 y 152 sesiones; no hay resultados en benchmarks academicos estandar que permitan comparaciones independientes.
- El ajuste esta especializado en codificacion agentica; su ventaja en tokens puede no trasladarse a otros dominios, y la model card recomienda el modelo base (Gyro) para usos no relacionados con agentes de codigo.
- Idioma: no se especifican los idiomas soportados; la evaluacion publicada se realiza en ingles.
- Licencia qwen-community-1.0: es una licencia de comunidad con posibles restricciones de uso comercial; debe revisarse el texto completo antes de un despliegue en produccion.
- El modelo requiere 32 GB de VRAM en la cuantizacion evaluada; no es viable en GPUs de consumo de 24 GB o menos sin cuantizaciones aun mas agresivas no documentadas.
- Longitud de contexto no disponible: no es posible planificar casos de uso con repositorios o conversaciones largas sin verificar este dato en la documentacion del modelo base.
- Los datos de rendimiento provienen del propio autor del modelo; no se han replicado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Signal-2-Flash-Next-Gyro-GGUF
- Archivos del repositorio: https://huggingface.co/agentionai/Signal-2-Flash-Next-Gyro-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizaciones Gyro: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Variante AP (Q5_K_M): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-AP-GGUF
- Web de AgentionAI: https://www.agention.ai/
- Agente de codigo Marshall: https://marshall.agention.ai
- Fieldwork Ledger: https://www.fieldworkledger.com
- Estadisticas de descargas: https://openmodelstats.com/models/agentionai/qwen3.8-flash-next-gyro-gguf
