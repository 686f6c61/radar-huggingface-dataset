# luispoveda93/sharky-0.5B-v3

## Resumen

Sharky-0.5B-v3 es un adaptador PEFT (LoRA) sobre el modelo base openbmb/MiniCPM4-0.5B, desarrollado por el usuario luispoveda93 y orientado a la deteccion de trafico de red malicioso a partir de capturas PCAP. El modelo se entrena para clasificar flujos de red y estados de conexion como benignos o maliciosos, empleando un corpus mixto de datasets de seguridad (UNSW-NB15, DAPT-2020, CIC-IDS2017 y CTU-13).

Esta version concreta, v3, corresponde a la fase 9 del pipeline de desarrollo del autor y fue **rechazada** en la bateria de evaluacion pre-registrada de cinco puertas (3/5 superadas). A pesar del rechazo, presenta mejoras notables frente al modelo en produccion (v2) en deteccion de malware real: recall del 99,0% en CTU-13 Botnet-42 frente al 7,4% de v2, y recall benigno del 97,2% en trafico 2018 no visto.

El modelo es relevante como caso de estudio de evaluacion rigurosa en seguridad aplicada: documenta explicitamente por que no se promociona a produccion (un atajo aprendido sobre trafico web benigno que provoca falsos positivos del 85%) y publica los artefactos de diagnostico. Su tamano de 0,5B parametros lo hace desplegable en hardware modesto, aunque su utilidad practica queda limitada al rol de detector de malware real en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: MiniCPM4-0.5B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base MiniCPM4-0.5B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre openbmb/MiniCPM4-0.5B, un transformer decoder-only de 0,5B parametros. El adaptador se entrena desde el modelo base (no desde un checkpoint intermedio) sobre un corpus mixto de seguridad de red que combina UNSW-NB15, DAPT-2020, CIC-IDS2017 (60.500 registros) y CTU-13 (10.000 estados). El entrenamiento comprende 18.208 pasos sobre 291.308 registros con una tasa de aprendizaje de 5e-5.

La innovacion tecnica principal no reside en la arquitectura sino en la metodologia de evaluacion: una bateria de cinco puertas pre-registradas que incluye pruebas de recall sobre malware real (CTU-13), recall benigno sobre trafico no visto de 2018, evaluacion en distribucion bloqueada, macro-F1 sobre CIC-IDS2017 y calibracion OOD (ECE). El modelo se sirve mediante un shim compatible con el endpoint `POST /v1/systemone`, aplicando la misma bateria de prefill que el modelo en produccion.

## Capacidades

- Clasificacion binaria de flujos de red y estados de conexion como benignos o maliciosos a partir de datos derivados de PCAP.
- Deteccion de malware real: recall del 99,0% sobre CTU-13 Botnet-42.
- Discriminacion de trafico benigno no visto: recall del 97,2% con tasa de falsos positivos del 2,8% sobre trafico benigno de 2018.
- Clasificacion multietiqueta sobre CIC-IDS2017 (macro-F1 de 0,706).
- Mantenimiento de rendimiento en distribucion bloqueada (0,9808).
- Calibracion OOD parcial: ECE de 0,19 en S1 y menor o igual a 0,015 en S2b/S4.
- No se documentan capacidades de generacion de texto general, codigo, matematicas, vision, tool calling ni agentes; el adaptador esta especializado en clasificacion de seguridad de red.

## Casos de uso

- Deteccion de malware en capturas PCAP: el modelo puede procesar estados de conexion derivados de trafico CTU-13 y marcar flujos botnet con un recall del 99,0%, adecuado para triaje de incidentes en entornos donde el trafico web benigno no sea predominante.
- Investigacion y validacion de pipelines de seguridad: sirve como referencia reproducible para comparar tecnicas de deteccion, ya que el autor publica los artefactos de evaluacion (gate_v3.json, diag_s1_benign.json) y el registro de rechazo.
- Analisis forense de trafico historico: su buen rendimiento sobre trafico benigno de 2018 no visto (97,2% de recall) lo hace util para revisar capturas antiguas donde el trafico web no domine.
- Deteccion en entornos de laboratorio y honeypots: al no ser seguro sobre trafico web benigno, su uso realista se limita a redes aisladas o sensores donde los falsos positivos sobre navegacion web no generen ruido operativo.
- Benchmark de calibracion OOD: el modelo y sus resultados de ECE permiten estudiar tecnicas de calibracion en clasificadores de seguridad de red de baja capacidad.
- Base para fine-tuning posterior: al ser un adaptador LoRA sobre MiniCPM4-0.5B con licencia Apache 2.0, puede reutilizarse como punto de partida para corregir el sesgo de trafico web detectado.

## Benchmarks y rendimiento

| Suite | v2 (produccion) | v3 (este modelo) | Objetivo |
|---|---|---|---|
| CTU-13 Botnet-42 (malware real) recall | 7,4% | 99,0% (supera) | no disponible |
| Recall benigno 2018 no visto (falsos positivos) | 58% (34% FF) | 97,2% (2,8% FF) (supera) | no disponible |
| Distribucion bloqueada (in-distribution) | 0,9865 | 0,9808 (supera) | no disponible |
| CIC-IDS2017 macro-F1 | 0,173 | 0,706 (falla) | 0,85 |
| ECE OOD | 0,33-0,51 | S1 0,19 (falla); S2b/S4 menor o igual a 0,015 (supera) | no disponible |

Resultado global de la bateria de cinco puertas: 3/5 superadas. Recall benigno en CIC-IDS2017: 0,36.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; por el tamano del modelo base (0,5B parametros) se estima un consumo bajo en FP16 (del orden de 1-2 GB), aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el tamano del modelo base sugiere que cabria en GPU de consumo, pero no hay datos publicados.
- Opciones de despliegue: shim propio del autor expuesto como `POST /v1/systemone`, con bateria de prefill. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sharky-0.5B-v3 (este) | 0,5B (base) + LoRA | no disponible | 3/5 puertas; recall malware 99,0%; falla en CIC-IDS2017 | Apache 2.0 | Hugging Face (rechazado para produccion) |
| sharky-0.5B (v2, produccion) | 0,5B (base) + LoRA | no disponible | recall malware 7,4%; mejor equilibrio en distribucion | Apache 2.0 | Hugging Face (modelo en produccion) |
| openbmb/MiniCPM4-0.5B (base) | 0,5B | no disponible | no orientado a seguridad de red | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros clasificadores de seguridad de red comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo rechazado para produccion: no supera la bateria pre-registrada (3/5) y el autor indica explicitamente que el modelo de produccion sigue siendo sharky-0.5B (v2).
- Sesgo de atajo en trafico web benigno: los flujos benignos con destino web se marcan como maliciosos en un 85% de los casos, lo que provoca un recall benigno de solo 0,36 en CIC-IDS2017.
- No es seguro sobre trafico web real: util unicamente como detector de malware real en entornos donde el trafico web benigno no sea dominante.
- Riesgo de falsos positivos en despliegues generales: la tasa de falsos positivos del 2,8% sobre trafico de 2018 no visto puede ser inaceptable en produccion.
- Calibracion OOD inconsistente: ECE de 0,19 en S1, por encima de umbrales estrictos.
- Capacidades generales no documentadas: no hay evidencia de generacion de texto, codigo, matematicas ni tool calling; el adaptador esta especializado en clasificacion.
- Idiomas y contexto no especificados: la informacion no detalla el contexto maximo efectivo ni el soporte multilingue.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo en dominios distintos al entrenamiento no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luispoveda93/sharky-0.5B-v3
- Modelo en produccion (v2): https://huggingface.co/luispoveda93/sharky-0.5B
- Modelo base: https://huggingface.co/openbmb/MiniCPM4-0.5B
- Registro de rechazo: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/REJECTED.md
- Resultados de la bateria de puertas: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/gate_v3.json
- Diagnostico del sesgo benigno: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/diag_s1_benign.json
- Guia de contribucion: https://huggingface.co/datasets/luispoveda93/sharky-workbench/blob/main/phase9/CONTRIBUTING.md
