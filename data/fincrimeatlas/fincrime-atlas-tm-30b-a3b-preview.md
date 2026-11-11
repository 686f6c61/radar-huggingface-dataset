# FinCrimeAtlas/FinCrime-Atlas-TM-30B-A3B-Preview

## Resumen

FinCrime-Atlas-TM-30B-A3B-Preview (Atlas-TM) es un modelo de lenguaje especializado en investigacion de alertas de monitorizacion de transacciones (transaction monitoring) en el ambito de prevencion de blanqueo de capitales (AML/BSA). Lo desarrolla FinCrime Atlas como un ajuste fino (fine-tune) del modelo base NVIDIA Nemotron 3.5 Lightning, una arquitectura de mezcla de expertos (MoE) con 31.600 millones de parametros totales de los que aproximadamente 3.000 millones estan activos por token.

El modelo resuelve un problema muy concreto del sector financiero: dado un caso con una o varias alertas sobre un cliente, junto con las politicas y procedimientos del banco, el modelo investiga de forma autonoma usando herramientas, decide si procede presentar un informe de actividad sospechosa (File SAR o No SAR) y redacta una memo de caso que justifica la decision. En los casos en que la decision es File SAR, tambien redacta la narrativa del SAR.

La relevancia de esta version radica en que es un modelo de pesos abiertos (open-weight) orientado a una tarea de cumplimiento normativo de alto valor, con una ventana de contexto declarada de hasta 1.048.576 tokens en evaluacion (262.144 por defecto en `config.json`). Segun el autor, supera en precision de decision a Haiku 5.5 (82,5 % frente a 75,0 %) en su propio benchmark TM-Bench 1.0, aunque con una puntuacion de memo inferior. Se trata de una version preview (checkpoint 3) y el entrenamiento continua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H mixture of experts (`NemotronHForCausalLM`) |
| Parametros totales | 31.577.937.344 (31,6B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 1.048.576 tokens en evaluacion; 262.144 por defecto en `config.json` |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW License Agreement, version 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (BF16, 13 archivos, ~63 GB; LoRA fusionada en los pesos base) |

## Arquitectura y entrenamiento

Atlas-TM se construye sobre NVIDIA Nemotron 3.5 Lightning, un modelo de mezcla de expertos de la familia Nemotron-H implementado como `NemotronHForCausalLM`. Cuenta con 31,6B parametros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Los pesos se distribuyen en BF16 (13 archivos, ~63 GB) y el ajuste fino se realizo mediante LoRA, cuyos pesos se han fusionado en los pesos base para la publicacion.

El entrenamiento es un fine-tune supervisado orientado a la tarea de investigacion de casos de monitorizacion de transacciones. El autor documenta tres checkpoints sucesivos, cada uno entrenado con mas investigaciones que el anterior, manteniendo constantes el modelo base, las herramientas y el juez de evaluacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal no es arquitectonica sino de dominio: el modelo aprende a operar un flujo de trabajo de investigacion con llamadas a herramientas en formato XML (`<tool_call><function=...><parameter=...>`), razonamiento explicito y produccion de documentacion de cumplimiento.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de cumplimiento financiero.
- Uso de herramientas (tool calling / function calling) en el formato XML del chat template; en vLLM se procesa con el parser `qwen3_coder`.
- Modo de razonamiento (reasoning) separado de la respuesta final, procesable con el parser `nemotron_v3`.
- Comportamiento agentico multi-paso: el modelo elige que registros examinar, en que orden, y sigue la pista de lo que cada registro muestra (hasta 60 llamadas a herramientas por caso en la evaluacion).
- Toma de decisiones binaria estructurada: File SAR o No SAR conforme a la politica SAR del banco.
- Redaccion de memo de caso que vincula cada hallazgo con los registros del caso.
- Redaccion de narrativa SAR cuando la decision es File SAR.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Investigacion automatizada de alertas de transaction monitoring: el modelo recibe las alertas y las politicas del banco, consulta el perfil del cliente y la actividad transaccional mediante herramientas, y emite una decision de filing. Es adecuado porque ha sido entrenado especificamente para este flujo y su contexto de hasta 1.048.576 tokens permite incluir procedimientos extensos y multiples registros.
- Triaje y priorizacion de colas de alertas: uso del modelo para preclasificar casos y reducir la carga de analistas humanos, reservando la revision manual para los casos ambiguos o de mayor riesgo.
- Generacion de memos de caso: redaccion automatica de documentacion que explica la decision y vincula cada hallazgo a los registros, reduciendo el tiempo de documentacion del investigador.
- Redaccion de narrativas SAR: cuando la decision es File SAR, el modelo borrador de la narrativa que el equipo de cumplimiento revisa y firma.
- Asistente copiloto para analistas de cumplimiento: integracion en la herramienta interna del equipo para sugerir siguientes pasos de investigacion y resumir actividad transaccional.
- Auditoria y control de calidad de decisiones: uso del modelo para revisar casos ya cerrados y detectar inconsistencias entre la decision y la evidencia documentada.
- Evaluacion de politicas internas: simular como se aplicaria una politica SAR concreta a un conjunto de casos para detectar ambiguedades en el procedimiento antes de su adopcion.

## Benchmarks y rendimiento

Resultados publicados por el autor en FinCrime Atlas TM-Bench 1.0 (80 casos de transaction monitoring de un banco estadounidense; los casos, herramientas y claves de respuesta no son publicos).

| Modelo | Precision de filing | Puntuacion TM-Bench 1.0 | Precio estimado (80 casos) |
|---|---|---|---|
| FinCrime-Atlas-TM-30B-A3B-Preview | 82,5 % (66 de 80) | 44,1 | 1x |
| Haiku 5.5 | 75,0 % (60 de 80) | 55,0 | 5,6x |
| Nemotron 3.5 Lightning (base) | 51,3 % (41 de 80) | 7,2 | no disponible |

Progreso por checkpoint (mismos 80 casos, nunca usados en entrenamiento):

| Modelo | Precision de filing | Puntuacion TM-Bench 1.0 |
|---|---|---|
| Base | 51,3 % | 7,2 |
| Checkpoint 1 | 70,0 % | 23,9 |
| Checkpoint 2 | 81,3 % | 40,4 |
| Checkpoint 3 (esta version) | 82,5 % | 44,1 |

Ajustes de evaluacion: vLLM 0.27.1 sobre 8 GPU NVIDIA H100 con tensor y expert parallelism, contexto de 1.048.576 tokens, temperatura 1.0, top-p 0.95, razonamiento activado, limite de 64.000 tokens de salida por turno y 60 llamadas a herramientas por caso, una ejecucion por caso. El precio estimado se calcula con los tokens usados a precio de lista estandar sin descuento por cache de prompt (Atlas-TM valorado al precio de su modelo base en OpenRouter: 0,07 USD de entrada y 0,20 USD de salida por millon de tokens; Haiku 5.5 a 0,10/0,50 USD hasta 100.000 tokens y 0,50/2,50 USD por encima).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 63 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica requiere multiples GPU.
- La configuracion de evaluacion del autor usa 8 GPU NVIDIA H100 con tensor y expert parallelism.
- No cabe en una GPU de consumo individual en BF16. Para GPU de consumo seria necesaria cuantizacion (no documentada oficialmente por el autor), y aun asi el tamano total de 31,6B lo situa fuera del rango comodo de tarjetas de 24 GB sin cuantizaciones agresivas.
- Opciones de despliegue documentadas: vLLM (con `--tensor-parallel-size 8`, `--reasoning-parser nemotron_v3`, `--tool-call-parser qwen3_coder --enable-auto-tool-choice`) y Transformers. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. Solo se conoce el coste estimado por caso en tokens (referenciado al precio del modelo base en OpenRouter).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de filing (TM-Bench 1.0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinCrime-Atlas-TM-30B-A3B-Preview | 31,6B totales / ~3B activos (MoE) | 262.144 por defecto; 1.048.576 en evaluacion | 82,5 % | OpenMDW 1.1 | Pesos abiertos en Hugging Face |
| NVIDIA Nemotron 3.5 Lightning (base) | 30B MoE (segun el autor) | no disponible en la informacion | 51,3 % | no disponible en la informacion | Pesos abiertos en Hugging Face |
| Haiku 5.5 | no disponible | no disponible | 75,0 % | Propietaria (API) | Solo API |

La comparacion se limita a estos tres modelos porque son los unicos con datos en la informacion proporcionada. No hay datos de benchmarks estandar que permitan comparar con alternativas de proposito general del mismo tamano.

## Limitaciones y advertencias

- Version preview (checkpoint 3): el autor indica que el entrenamiento continua, por lo que el comportamiento puede cambiar en futuras versiones.
- Solo soporta ingles; no se declaran capacidades multilingues.
- La puntuacion de memo (44,1) es inferior a la de Haiku 5.5 (55,0), lo que sugiere que la calidad de la documentacion generada puede requerir revision humana incluso cuando la decision de filing es correcta.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion; en un dominio regulado, las decisiones y narrativas SAR deben ser revisadas y validadas por personal cualificado antes de su presentacion.
- El benchmark TM-Bench 1.0 es privado (casos, herramientas y claves de respuesta no publicos) y consta de solo 80 casos de un unico banco estadounidense; los resultados pueden no generalizar a otras jurisdicciones, entidades o politicas SAR.
- La evaluacion se realizo con una sola ejecucion por caso y temperatura 1.0, lo que introduce varianza no cuantificada.
- Licencia OpenMDW 1.1: es necesario revisar los terminos concretos del acuerdo para uso comercial; la model card no detalla restricciones adicionales.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware modesto.
- El uso de herramientas depende del formato XML del chat template y de parsers especificos en vLLM (`qwen3_coder`); integraciones con otros servidores no estan documentadas.
- Sesgos conocidos: no disponible en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FinCrimeAtlas/FinCrime-Atlas-TM-30B-A3B-Preview
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Post de lanzamiento: https://fincrimeatlas.com/atlas-tm-preview
- Contacto para acceso al benchmark: karthic.kosgi@fincrimeatlas.com
