# Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2

## Resumen

CYBER-FROST-3.8-NVFP4-V2 es una cuantizacion NVFP4 de precision mixta del checkpoint Blackfrost-AI/CYBER-FROST-3.8-BF16, un modelo de lenguaje especializado en ciberseguridad (red team, blue team, purple team, fuzzing y research de vulnerabilidades) construido sobre una arquitectura Qwen4-Exp de tipo Mixture of Experts. Lo desarrolla Blackfrost-AI y esta pensado para profesionales que realizan trabajo de evaluacion y respuesta de seguridad autorizado, con soporte nativo de tool use y razonamiento multi-paso dentro de un harness de agentes propio (Cyber-Frost Harness).

La version V2 no es un nuevo entrenamiento ni un LoRA: es una re-exportacion NVFP4 del mismo checkpoint BF16 que corrige un problema de compatibilidad en las escalas de cuantizacion de las proyecciones gate/up de los expertos enrutados. En la exportacion original, cada proyeccion gate y up de un experto se cuantizaba de forma independiente, generando escalas globales FP32 (`weight_scale_2`) potencialmente distintas; en rutas de inferencia fusionadas W13 (como la de vLLM) se aplica una unica escala global, lo que desajustaba la proyeccion up. V2 fuerza que cada par gate/up comparta la misma escala global antes de recalcular las escalas de bloque FP8 E4M3 y reempaquetar los pesos NVFP4.

El modelo tiene 119.602.003.859 parametros totales segun los safetensors del repositorio, un tamano de repo de 186,4 GB y se distribuye en 131 shards SafeTensors con 296.474 tensores. Esta etiquetado como `image-text-to-text` (incluye componentes de vision) y `moe`, con soporte de decodificacion especulativa via MTP. La licencia es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) basada en Qwen4-Exp, con componentes de vision y MTP (multi-token prediction) |
| Parametros totales | 119.602.003.859 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (limite de ventana citado en la evaluacion del harness) |
| Tipos de cuantizacion | NVFP4 (precision mixta, escalas de bloque FP8 E4M3); checkpoint base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (131 shards, 296.474 tensores) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo Mixture of Experts con expertos enrutados y compartidos, componentes de vision (pipeline `image-text-to-text`) y un modulo MTP (multi-token prediction) que habilita decodificacion especulativa. La cuantizacion NVFP4 se realizo con ModelOpt de NVIDIA: cada experto enrutado mantiene sus proyecciones gate y up cuantizadas a 4 bits con escalas de bloque FP8 E4M3 y una escala global FP32. En V2, el par gate/up de cada experto comparte el maximo valor absoluto BF16 entre ambas proyecciones antes de recalcular las escalas de bloque, de modo que las escalas globales resultantes son identicas (verificadas las 24.576 parejas). Los 73.728 escalas de entrada calibradas son identicas a la referencia calibrada de NVIDIA, y los 1.562 tensores no enrutados (atencion, expertos compartidos, PLE, vision, MTP) conservan sus formas y dtypes BF16 sin conversion numerica.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el checkpoint base. V2 no introduce fine-tuning, LoRA ni ninguna transformacion de comportamiento: es exclusivamente una re-exportacion de cuantizacion corregida.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Razonamiento de tipo "thinking" con niveles de esfuerzo (`xhigh` citado en la evaluacion), preservando la traza de razonamiento.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`).
- Tool calling y function calling nativo, con herramientas de analisis estructurado.
- Uso como agente en entornos multi-paso con gestion de contexto consciente de tokens y manejo duradero de evidencias.
- Capacidades especializadas de ciberseguridad: red team, blue team, purple team, fuzzing y research de vulnerabilidades.
- Decodificacion especulativa mediante MTP.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion de vulnerabilidades autorizada: el modelo puede analizar artefactos y evidencias dentro de un entorno aislado x86-64 provisto por el Cyber-Frost Harness, con herramientas de analisis nativo y gestion de contexto para sesiones largas.
- Red teaming y evaluacion de superficie de ataque: soporta flujos multi-paso con tool calling para encadenar reconocimiento, analisis y verificacion de hallazgos, manteniendo trazas de razonamiento auditables.
- Blue team y respuesta a incidentes: el manejo duradero de evidencias y la ventana de 262.144 tokens permiten procesar historiales largos de logs y artefactos en una misma sesion.
- Fuzzing asistido por LLM: el modelo puede generar y priorizar entradas de prueba y analizar resultados dentro de pipelines automatizados, apoyandose en su soporte de agentes.
- Automatizacion de analisis de seguridad en CI/CD: integrable como paso de evaluacion con tool calling para clasificar hallazgos y generar informes estructurados.
- Asistente de ingenieria de seguridad con vision: al aceptar imagen y texto, puede interpretar capturas de paneles, diagramas de red o salidas de herramientas graficas junto con instrucciones textuales.
- Despliegue en infraestructura de alta densidad: la cuantizacion NVFP4 reduce el coste de memoria frente al checkpoint BF16, lo que permite servir el modelo de 119,6 mil millones de parametros en configuraciones multi-GPU como DP2 x TP4 sobre ocho B200.

## Benchmarks y rendimiento

Los datos publicados corresponden a una evaluacion de agente con el Cyber-Frost Harness, no a benchmarks de conocimiento estandar (MMLU, HumanEval, GSM8K no estan disponibles). La ejecucion uso este artefacto V2 con SGLang 0.5.20 sobre ocho NVIDIA B200 en DP2 x TP4, thinking activado, razonamiento `xhigh`, temperatura 1.0, top-p 0.95, techo de 131.072 tokens de completion y semilla 38421.

| Experimento | Scaffold | Resultado | Divulgacion |
|---|---|---:|---|
| Slice congelado de cuatro tareas | OpenHands + grader nativo | 4/4 | Slice propio estilo CyberGym, no es leaderboard oficial |
| Baseline hard-12 nivel 0 | OpenHands generico | 1/12 | Baseline de analisis de fallos |
| Piloto de intervencion de dos tareas | Cyber-Frost Harness | 2/2 | Fallos previos post-hoc; valida mecanismos, no generalizacion |
| Hard-12 con harness dinamico | Cyber-Frost Harness | 5/10 intentos validos | 5 resueltas verificadas, 5 fallos del modelo, 2 tareas invalidas por infraestructura; cota inferior verificada de 5/12 |

El baseline generico consumio 51.939.855 tokens totales; el harness dinamico logro cinco resoluciones verificadas con 22.043.450 tokens (aproximadamente el 42,4% del baseline). La comparacion es de intervencion (distinto scaffold), no modelo contra modelo. Las tareas GPAC y GDAL quedaron invalidas por infraestructura al superar la ventana de 262.144 tokens. No se reclama un porcentaje final sobre 12 tareas.

## Requisitos de hardware

- El checkpoint BF16 ocupa 186,4 GB en repositorio; la version NVFP4 reduce el peso de los expertos enrutados a 4 bits, aunque el artefacto completo sigue requiriendo agregacion multi-GPU.
- Configuracion validada: 8 x NVIDIA B200 en DP2 x TP4 con SGLang 0.5.20.
- GPU profesionales de referencia para este tipo de despliegue: NVIDIA B200, H100 y A100 de 80 GB en configuraciones multi-GPU; no hay datos publicados de despliegue en una sola GPU.
- Viabilidad en GPU de consumo (RTX 4090, etc.): no disponible; el tamano total y el formato NVFP4 apuntan a que no cabe en una unica GPU consumer.
- Opciones de despliegue: SGLang (validado), vLLM (ruta fusionada W13 mencionada en la correccion), y por formato safetensors/transformers cualquier runtime compatible con NVFP4 y ModelOpt; llama.cpp y Ollama no estan confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-NVFP4-V2 | 119,6 B (MoE) | 262.144 | NVFP4 | Qwen Community 1.0 | Ciberseguridad y agentes |
| CYBER-FROST-3.8-BF16 (modelo base) | 119,6 B (MoE) | 262.144 | BF16 | Qwen Community 1.0 | Ciberseguridad y agentes |
| CYBER-FROST-3.8-NVFP4 (version original) | 119,6 B (MoE) | 262.144 | NVFP4 | Qwen Community 1.0 | Ciberseguridad y agentes (escalas gate/up sin corregir) |

No se dispone de datos publicados de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de conocimiento estandar; la unica evaluacion disponible es de agente y con scaffold propio, por lo que no es comparable directamente con otros modelos.
- La evaluacion hard-12 con harness dinamico obtuvo 5 resoluciones verificadas de 12 tareas, con 2 tareas invalidas por infraestructura; no hay porcentaje final.
- La correccion V2 solo afecta a las escalas gate/up; otras rutas de inferencia fusionadas que usen una unica escala global pueden seguir viendose afectadas si no aplican el mismo criterio.
- Riesgo de alucinacion en tareas de seguridad: las salidas deben verificarse con herramientas y graders, como hace el harness; no deben tomarse como hallazgos confirmados sin validacion.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; la cobertura multilingue no esta documentada.
- Licencia Qwen Community License 1.0: revisar las restricciones de uso comercial antes de desplegar en produccion.
- El modelo esta disenado para investigacion autorizada; su uso en entornos sin permiso explicito queda fuera del proposito declarado.
- Requiere infraestructura multi-GPU de gama alta (B200/H100/A100); no hay evidencia de despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Version NVFP4 original: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4
- Discusion del problema de escalas: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4/discussions/1
- Cyber-Frost Harness (codigo y quick start): https://github.com/Blackfrost-AI/Cyber-Frost-Harness
- Arquitectura y limites de confianza: https://github.com/Blackfrost-AI/Cyber-Frost-Harness/blob/main/docs/ARCHITECTURE.md
- Divulgacion completa de la evaluacion: https://github.com/Blackfrost-AI/Cyber-Frost-Harness/blob/main/docs/EVALUATION.md
