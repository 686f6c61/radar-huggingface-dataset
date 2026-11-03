# Saidevhack/qwen3-8b-offensive-cyber-agent-v3

## Resumen

El modelo `Saidevhack/qwen3-8b-offensive-cyber-agent-v3` es un adaptador LoRA publicado en Hugging Face por el usuario Saidevhack, construido sobre el modelo base `Qwen/Qwen3-8B` de la organizacion Qwen. Se presenta como un ajuste fino orientado a tareas de ciberseguridad ofensiva, con enfasis en trayectorias de explotacion, razonamiento sobre conceptos de seguridad y uso de herramientas mediante function calling. El repositorio contiene unicamente el adaptador (0,2 GB), no los pesos completos del modelo base, por lo que su uso requiere descargar Qwen3-8B por separado y cargar el adaptador mediante PEFT.

La propuesta del autor es un curriculum de entrenamiento descontaminado y balanceado matematicamente en tres pistas: 60% trayectorias de explotacion, 20% razonamiento en ciberseguridad y 20% replay de tool calling multi-turno. El modelo se distribuye con licencia Apache 2.0 y la model card incluye una tabla de benchmarks propia con metricas de precision, recall y F1 sobre dialogos de evaluacion. No se especifican los idiomas soportados ni el numero de tokens de entrenamiento.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, sin descargas registradas en el momento de la consulta y con datos de evaluacion unicamente aportados por el autor, sin verificacion independiente. Es util como referencia para quienes exploran ajustes finos de Qwen3-8B en dominios de seguridad, pero no debe considerarse un modelo de proposito general ni un sustituto de herramientas de pentesting auditadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | No disponible (adaptador de 0,2 GB; el modelo base Qwen3-8B tiene 8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento declarado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de la familia Qwen3 con vocabulario de 151.669 tokens. El entrenamiento se realizo con PEFT/LoRA y una longitud de contexto de 4.096 tokens, aplicando mascara de perdida solo sobre las completaciones del asistente (assistant-only completion loss masking), lo que concentra el aprendizaje en las respuestas generadas y no en los turnos del usuario.

El dataset es propio, denominado `custom-cybersecurity-curriculum-60-20-20`, con una distribucion declarada de 60% trayectorias de explotacion, 20% razonamiento en ciberseguridad y 20% replay de tool calling. El autor indica un proceso de descontaminacion auditado en cuatro niveles (hash exacto, exacto normalizado, Jaccard de n-gramas y MinHash/LSH) con cero filtraciones entre splits de test. No se detallan el numero total de tokens de entrenamiento, la composicion exacta del corpus, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican hiperparametros de LoRA (rango, alpha, modulos objetivo) ni la duracion del entrenamiento.

## Capacidades

- Generacion de texto conversacional orientada a dominios de ciberseguridad.
- Razonamiento sobre conceptos de seguridad, con evaluacion declarada mediante descomposicion semantica por LLM-as-a-Judge.
- Function calling y tool use multi-turno, con validacion de esquema declarada al 100% en la pista de evaluacion correspondiente.
- Ejecucion de trayectorias de explotacion multi-turno con pivote adaptativo (100% en la pista de evaluacion declarada).
- Cumplimiento de modo sin herramientas (zero-tool compliance) en la pista de razonamiento, segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Laboratorios de formacion en seguridad ofensiva: el adaptador puede generar trayectorias de explotacion multi-turno sobre entornos de practica controlados, aprovechando el entrenamiento especifico en pivote adaptativo para simular escenarios de escalada.
- Asistencia a equipos de red team en entornos autorizados: uso como copiloto para razonar sobre cadenas de ataque y validar argumentos de herramientas de pentesting, con validacion de esquema de function calling.
- Automatizacion de playbooks de pentesting: integracion del adaptador en pipelines que invocan herramientas externas mediante function calling, apoyandose en la pista de tool replay del entrenamiento.
- Analisis y explicacion de conceptos de ciberseguridad: generacion de material didactico y resumenes tecnicos sobre vulnerabilidades y tecnicas, usando la pista de razonamiento del curriculum.
- Evaluacion comparativa de adaptadores de seguridad: uso como referencia en experimentos de ajuste fino sobre Qwen3-8B, dado que el autor publica predicciones de holdout en el directorio `evaluations/`.
- Investigacion sobre descontaminacion de datasets: el proceso de cuatro niveles descrito sirve como caso de estudio metodologico para construir curriculos de seguridad sin filtraciones entre splits.
- Prototipado de agentes de seguridad multi-turno: el adaptador puede servir para experimentar con bucles de razonamiento y llamada a herramientas en entornos de laboratorio aislados.

## Benchmarks y rendimiento

Datos aportados por el autor en la model card. No hay verificacion independiente disponible.

| Pista de evaluacion | Proporcion del curriculum | Precision | Recall | F1 | Estandar de evaluacion |
|---|---|---|---|---|---|
| Trayectorias de explotacion | 60% | 97,60% | 76,52% | 85,79% | Explotacion multi-turno (390 dialogos, 3.095 turnos; 100% pivote adaptativo) |
| Razonamiento en ciberseguridad | 20% | 65,50% | 57,82% | 61,42% | LLM-as-a-Judge con descomposicion semantica (130 dialogos; 100% cumplimiento sin herramientas) |
| Replay de herramientas multi-turno | 20% | 77,38% | 88,64% | 82,63% | Replay de function calling y validacion de argumentos (130 dialogos, 479 turnos; 100% validez de esquema) |
| Agregado ponderado | 100% | 87,14% | 75,20% | 80,28% | Agregado compuesto del curriculum (650 dialogos / 3.704 turnos) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; los requisitos reales dependen del modelo base Qwen3-8B.
- Inferencia en precision FP16 del modelo base: aproximadamente 16 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo practico de 20-24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16. En GPUs consumer de 16 GB seria necesario cuantizar el modelo base.
- Cabe en GPU consumer: si, con cuantizacion del modelo base (por ejemplo, formatos de 4-8 bits), aunque el adaptador se distribuye en safetensors y no se documentan pesos GGUF.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama solo si se fusiona y convierte el adaptador a GGUF (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saidevhack/qwen3-8b-offensive-cyber-agent-v3 | Adaptador sobre 8B | 4.096 (entrenamiento) | Ciberseguridad ofensiva + tool calling | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8B | No disponible en esta ficha | Proposito general, razonamiento y tool use | Apache 2.0 | Hugging Face, ampliamente distribuido |
| Adaptadores de seguridad de la comunidad sobre Llama o Mistral | 7-8B | Variable | Ciberseguridad | Variable | Hugging Face, disponibilidad dispar |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada; las metricas del adaptador son propias y no permiten una comparacion directa con el modelo base ni con alternativas.

## Limitaciones y advertencias

- Uso dual: el modelo esta entrenado explicitamente para trayectorias de explotacion ofensiva; su uso debe restringirse a entornos autorizados, laboratorios y pruebas de penetracion con permiso escrito.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad factual fuera del curriculum; las metricas de razonamiento (F1 61,42%) sugieren margen de error considerable en esa pista.
- Benchmarks no verificados: todas las cifras proceden del autor, sin replicacion independiente ni conjuntos de evaluacion publicos estandar.
- Contexto limitado: el entrenamiento se realizo con 4.096 tokens, inferior a la ventana nativa de Qwen3-8B, lo que puede degradar el rendimiento en conversaciones largas.
- Idiomas no declarados: no hay informacion sobre el soporte multilingue del adaptador.
- Sin descargas ni validacion de la comunidad: 0 descargas y 1 like en el momento de la consulta; madurez y mantenimiento inciertos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad por el uso ofensivo; el cumplimiento legal recae en el desplegador.
- No se documentan sesgos, hiperparametros de entrenamiento ni volumen de datos, lo que dificulta auditar el comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saidevhack/qwen3-8b-offensive-cyber-agent-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Directorio de evaluaciones del repositorio: https://huggingface.co/Saidevhack/qwen3-8b-offensive-cyber-agent-v3/tree/main/evaluations
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
