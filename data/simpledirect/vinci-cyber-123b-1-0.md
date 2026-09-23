# simpledirect/Vinci-Cyber-123B-1.0

## Resumen
Vinci Cyber 123B 1.0 es un modelo de pesos abiertos especializado en revision defensiva de infraestructura y remediacion de configuraciones, desarrollado por simpledirect (Canada) mediante un fine-tuning del modelo Mistral AI Devstral 2 123B Instruct. El modelo aborda un problema concreto: la tendencia de los modelos generativos a modificar configuraciones que ya son correctas. Vinci Cyber prioriza la restriccion y solo propone cambios cuando detecta un fallo real, con resultados medidos de 24/24 configuraciones correctas preservadas en los conjuntos de prueba V2-A y V2-B, frente a 0/24 del modelo padre. Con 125.025.988.608 parametros (publicado como 123B), arquitectura transformer densa decoder-only (`Ministral3ForCausalLM`), contexto configurable de hasta 262.144 tokens (no validado por el autor) y licencia Modified MIT de Mistral AI con condicion de ingresos.

El modelo se distribuye en pesos BF16 fusionados (safetensors) y en formatos GGUF (Q8_0, Q5_K_M, Q4_K_M) para llama.cpp. Su relevancia actual radica en que permite a equipos de seguridad y plataforma ejecutar localmente un modelo de gran tamano orientado a la revision de infraestructura como codigo, sin enviar configuraciones sensibles a servicios en la nube, y con un enfasis explicito en la preservacion de lo correcto. La evaluacion publicada es limitada (24 pares emparejados por conjunto, una ejecucion greedy) y no debe interpretarse como una estimacion de fiabilidad en produccion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, `Ministral3ForCausalLM` (`model_type: ministral3`) |
| Parametros totales | 125.025.988.608 (publicado como 123B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en la configuracion base (YaRN); Vinci no ha validado el comportamiento en contexto largo y el entrenamiento y la evaluacion usaron entradas mucho mas cortas |
| Tipos de cuantizacion | BF16 (pesos liberados); GGUF Q8_0, Q5_K_M, Q4_K_M en repositorio separado |
| Idiomas soportados | No disponible |
| Licencia | Modified MIT de Mistral AI 2025 (`modified-mit-mistral-ai-2025`, con condicion de ingresos) |
| Formato de pesos | safetensors (bfloat16, sharded), sin adaptador |
| Numero de capas | 88 |
| Tamano oculto | 12.288 |
| Cabezas de atencion | 96 (8 cabezas key-value, dimension de cabeza 128) |
| Vocabulario | 131.072 |
| Modelo base | `mistralai/Devstral-2-123B-Instruct-2512` |
| Enfoque de entrenamiento | LoRA (rango 32, alpha 64) sobre copia BF16 del modelo base, fusionado en pesos completos |
| Tamano del repositorio | 251,7 GB |

## Arquitectura y entrenamiento
Vinci Cyber 123B 1.0 es un transformer denso decoder-only basado en la arquitectura Ministral3 de Mistral AI. Cuenta con 88 capas, un tamano oculto de 12.288, 96 cabezas de atencion con 8 cabezas key-value (atencion con consultas agrupadas) y una dimension de cabeza de 128. El vocabulario es de 131.072 tokens. El modelo base, Devstral 2 123B Instruct, se publica originalmente en FP8; Vinci realizo el entrenamiento y la fusion sobre una expansion BF16 de esos pesos, no sobre los archivos FP8 nativos. El fine-tuning se aplico mediante LoRA con rango 32 y alpha 64, y posteriormente se fusiono en pesos completos, por lo que no se necesita adaptador para la inferencia.

La innovacion principal no es arquitectonica sino de comportamiento: el modelo ha sido ajustado para mostrar restraint (restriccion) ante configuraciones ya correctas, evitando ediciones innecesarias. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La evaluacion publicada se centra en tareas de revision de infraestructura (conjuntos V2-A y V2-B) y en codigo general (HumanEval), con una ejecucion greedy por condicion y 24 pares emparejados por conjunto. La sensibilidad al prompt es significativa: un prompt guiado por hallazgos redujo la preservacion de configuraciones correctas a 14/24 y provoco 1 invalid clear y 5 regresiones de disponibilidad.

## Capacidades
- Revision defensiva de configuraciones de infraestructura: analiza entradas y detecta desviaciones respecto a una configuracion correcta.
- Remediacion focalizada: propone cambios concretos sobre entradas mal configuradas (18/24 reparaciones acreditadas en V2-B).
- Preservacion de configuraciones correctas: no modifica entradas que ya son validas (24/24 en V2-A y V2-B).
- Validacion de esquemas de proveedor: las reparaciones acreditadas pasan validacion offline de esquema (18/18).
- Generacion de codigo: 144/164 problemas resueltos en HumanEval (87,8%), misma puntuacion que el modelo base en esa ejecucion.
- Conversacional: el tag `conversational` indica soporte para dialogos multi-turno, aunque no se detallan capacidades especificas.
- Tool calling / function calling: no se detalla en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se detalla en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking o vision: no disponible.

## Casos de uso
- Revision de infraestructura como codigo (IaC): el modelo puede analizar ficheros de Terraform, CloudFormation o manifiestos de Kubernetes y proponer cambios solo cuando detecta una mala configuracion, preservando el resto intacto.
- Integracion en pipelines de CI/CD: se puede invocar durante la revision de pull requests para validar configuraciones, aplicando reparaciones que pasan validacion de esquema antes de fusionar.
- Auditoria de seguridad defensiva: equipos de seguridad pueden usar el modelo para revisar configuraciones de nube y detectar desviaciones, con la ventaja de que no modifica lo que ya es correcto.
- Asistente de remediacion en produccion: ante un hallazgo de escaner, el modelo propone un parche minimo y verifica que no introduce regresiones de disponibilidad, aunque se recomienda revision humana.
- Despliegue local en infraestructura critica: al ser pesos abiertos, permite ejecutar el modelo on-premise sin enviar configuraciones sensibles a terceros.
- Generacion de parches de configuracion consistentes: para equipos que gestionan multiples entornos, el modelo puede producir cambios homogeneos sobre entradas mal configuradas.
- Validacion pre-despliegue: antes de aplicar cambios en produccion, el modelo comprueba que la configuracion resultante es correcta y no altera componentes ya validados.
- Formacion y documentacion tecnica: puede explicar por que una configuracion es incorrecta y que cambio concreto la corrige, util para equipos junior.

## Benchmarks y rendimiento
Los siguientes resultados corresponden a los pesos BF16 fusionados liberados, con una ejecucion greedy por condicion y 24 pares emparejados por conjunto (una entrada mal configurada y su contraparte correcta). No son resultados de los formatos GGUF.

| Metrica | Devstral 2 BF16 (padre) | Vinci Cyber 123B 1.0 |
|---|---:|---:|
| Configuraciones correctas sin modificar (V2-B) | 0/24 (0%) | 24/24 (100%) |
| Entradas mal configuradas reparadas por criterio de escaner (V2-B) | 17/24 (70,8%) | 18/24 (75,0%) |
| Reparacion y preservacion de contraparte corregida (V2-B) | 0/24 (0%) | 18/24 (75,0%) |
| Reparaciones acreditadas que pasan validacion de esquema (V2-B) | 17/17 (100%) | 18/18 (100%) |
| Problemas de codigo resueltos en HumanEval | 144/164 (87,8%) | 144/164 (87,8%) |
| Configuraciones correctas sin modificar (V2-A) | no disponible | 24/24 (100%) |
| Reparaciones acreditadas (V2-A) | 15/24 | 9/24 |

En el conjunto V2-A, Vinci Cyber preservo 24/24 configuraciones correctas, pero su cobertura de reparacion fue inferior a la del padre (9/24 frente a 15/24). Con un prompt guiado por hallazgos en V2-B, la preservacion bajo a 14/24 y se registraron 1 invalid clear y 5 regresiones de disponibilidad. Estos datos provienen de un dataset pequeno y no auditado independientemente; no son estimaciones de fiabilidad en el mundo real.

## Requisitos de hardware
No hay requisitos oficiales publicados. Las siguientes cifras son estimaciones basadas en el numero de parametros y en los formatos disponibles.

- VRAM estimada para inferencia (solo pesos, sin cache KV ni activaciones): BF16 ~250 GB; Q8_0 ~125 GB; Q5_K_M ~85 GB; Q4_K_M ~65 GB.
- GPU recomendadas para BF16: 4x A100 80GB o 4x H100 80GB (320 GB) para operar con margen.
- GPU recomendadas para Q8_0: 2x A100 80GB o 2x H100 80GB (160 GB).
- GPU recomendadas para Q4_K_M: 1x H100 80GB o 2x A100 40GB podrian ser suficientes; en multi-GPU consumer, 4x RTX 4090 24GB (96 GB) es posible pero con complejidad y latencia elevada.
- Cabe en GPU de consumo: no en una sola GPU. El modelo de 125B no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Solo mediante configuraciones multi-GPU con cuantizacion agresiva.
- Opciones de despliegue: `transformers` para los pesos safetensors; `llama.cpp` con soporte `mistral3` para los GGUF. No se mencionan vLLM, TGI u Ollama en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
La informacion proporcionada solo permite comparar con el modelo base. No se dispone de datos de otros modelos comparables de seguridad defensiva con pesos abiertos.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Preservacion V2-B |
|---|---:|---:|---|---|---:|
| Vinci Cyber 123B 1.0 | 125B | 262.144 (no validado) | Modified MIT Mistral AI 2025 | Revision defensiva y remediacion | 24/24 (100%) |
| Devstral 2 123B Instruct | 123B | 262.144 | Modified MIT Mistral AI 2025 | Codigo y agentes | 0/24 (0%) |
| Otros modelos de seguridad defensiva | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Dataset de evaluacion pequeno (24 pares por conjunto) y no auditado independientemente; los resultados no son estimaciones de fiabilidad en produccion.
- Sensibilidad al prompt: un prompt guiado por hallazgos redujo la preservacion de 24/24 a 14/24 y provoco 1 invalid clear y 5 regresiones de disponibilidad.
- En el conjunto V2-A, la cobertura de reparacion fue inferior a la del modelo padre (9/24 frente a 15/24).
- El contexto largo de 262.144 tokens no ha sido validado por Vinci; el entrenamiento y la evaluacion usaron entradas mucho mas cortas.
- Idiomas soportados: no disponible.
- Riesgo de alucinacion: no cuantificado; se recomienda revision humana y validacion independiente.
- Sesgos conocidos: no disponible.
- Licencia Modified MIT de Mistral AI 2025 con condicion de ingresos: pueden aplicarse restricciones para uso comercial si se supera el umbral de facturacion definido en la licencia. Consultar el fichero LICENSE del repositorio.
- Modelo orientado a seguridad defensiva; no debe usarse para fines ofensivos.
- Los pesos BF16 requieren hardware considerable; los formatos GGUF pueden degradar la calidad, aunque no se detallan sus resultados en esta ficha.
- La evaluacion se basa en una unica ejecucion greedy por condicion; la variabilidad entre ejecuciones no esta caracterizada.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/simpledirect/Vinci-Cyber-123B-1.0
- Repositorio GGUF: https://huggingface.co/simpledirect/Vinci-Cyber-123B-1.0-GGUF
- Resultados de tareas GGUF: https://huggingface.co/simpledirect/Vinci-Cyber-123B-1.0-GGUF#gguf-task-results
- Modelo base Devstral 2 123B Instruct: https://huggingface.co/mistralai/Devstral-2-123B-Instruct-2512
- Licencia (LICENSE en el repositorio): https://huggingface.co/simpledirect/Vinci-Cyber-123B-1.0/blob/main/LICENSE
- Procedencia del modelo (MODEL-PROVENANCE.json): https://huggingface.co/simpledirect/Vinci-Cyber-123B-1.0/blob/main/MODEL-PROVENANCE.json
