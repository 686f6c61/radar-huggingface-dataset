# a1800015531/ScamBrain-v0.2

## Resumen

ScamBrain v0.2 es un conjunto de tres adaptadores LoRA publicados por el usuario a1800015531 que convierten modelos Qwen3 en un motor de evaluacion de riesgo de estafa en conversaciones. El sistema combina un modelo de juicio (`wm_est`, sobre Qwen3-1.7B) que emite un contrato JSON estructurado con nivel de riesgo, tipo de estafa y accion recomendada, y dos modelos de mundo (`wm_dyn_scam` y `wm_dyn_norm`, ambos sobre Qwen3-0.6B) que predicen el siguiente turno de dialogo fraudulento y benigno respectivamente. La diferencia de log-verosimilitud entre ambos produce una puntuacion de ratio de probabilidad que indica cuanto "vive" una conversacion en el mundo de la estafa.

El modelo aborda un problema concreto de antifraude: la deteccion temprana de patrones de estafa en dialogos y SMS antes de que aparezca una peticion explicita de dinero o datos. Segun la model card, el 15,3 % de los dialogos fraudulentos ya se marcan como riesgo medio o alto en turnos anteriores a la primera peticion explicita, con una mediana de 10 turnos de antelacion.

Es una vista previa de investigacion con un tamano de repositorio de 0,1 GB, entrenada exclusivamente con corpus sinteticos y publicos. El autor advierte explicitamente que el rendimiento en llamadas telefonicas reales no esta validado y que no debe usarse para decisiones en produccion ni para inferir si una persona miente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA/PEFT |
| Parametros totales | 1,7B (`wm_est`) y 0,6B (`wm_dyn_scam`, `wm_dyn_norm`); los adaptadores LoRA anaden un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B y Qwen3-1.7B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors de los adaptadores) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

ScamBrain v0.2 no es un modelo unico sino tres adaptadores LoRA independientes sobre dos modelos base de la familia Qwen3. El adaptador `wm_est` se monta sobre Qwen3-1.7B y actua como modelo de juicio: recibe el dialogo completo y genera un contrato JSON estricto con los campos `scam_risk.level` (unknown/low/medium/high), `scam_type`, `mechanisms`, `recommended_action` e `insufficient_evidence`. Los adaptadores `wm_dyn_scam` y `wm_dyn_norm` se montan sobre Qwen3-0.6B y funcionan como modelos de mundo de siguiente turno, entrenados respectivamente con dialogos de estafa y dialogos benignos. La senal de deteccion se obtiene restando sus log-verosimilitudes por token (logP_scam − logP_norm), lo que constituye un ratio de probabilidad a nivel de token.

El entrenamiento se realizo con datos exclusivamente sinteticos o publicos: ScamGen (Telescam) en chino con split de dificultad, BothBosu en ingles, UCI SMS Spam en ingles y CrossWOZ en chino. Las etiquetas son supervision debil generada por mapeo basado en reglas, no anotacion humana. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica principal es el enfoque de doble modelo de mundo con ratio de verosimilitud, que permite una puntuacion continua de "pertenencia al mundo de la estafa" independiente del contrato de juicio.

## Capacidades

- Clasificacion de riesgo de estafa en dialogos y SMS con salida JSON estructurada (nivel, tipo, mecanismos, accion recomendada).
- Deteccion temprana: marca riesgo antes de que aparezca una peticion explicita, con mediana de 10 turnos de antelacion segun la evaluacion del autor.
- Puntuacion continua mediante ratio de verosimilitud entre dos modelos de mundo (scam vs. benigno).
- Seguimiento de estado a lo largo de una conversacion multi-turno.
- Soporte de chino e ingles.
- Capacidad de declarar evidencia insuficiente mediante el campo `insufficient_evidence`.
- No dispone de tool calling, function calling, vision, audio ni modo de razonamiento extendido documentados.

## Casos de uso

- Filtrado de SMS fraudulentos: los adaptadores de mundo pueden puntuar mensajes individuales o hilos de SMS con el ratio de verosimilitud, y `wm_est` puede emitir un veredicto estructurado para enrutar el mensaje a cuarentena o a revision humana.
- Aviso temprano en aplicaciones de mensajeria: integrado en el backend de un chat, el sistema puede marcar conversaciones con riesgo medio o alto antes de que el estafador solicite dinero, dando al usuario una advertencia con antelacion mediana de 10 turnos.
- Triaje en centros de atencion al fraude: el contrato JSON permite clasificar automaticamente casos entrantes por tipo de estafa y mecanismo, priorizando la cola de revision de los analistas humanos.
- Investigacion academica en deteccion de fraude conversacional: el enfoque de doble modelo de mundo y ratio de verosimilitud es reproducible con corpus publicos como ScamGen y BothBosu, y sirve como linea base para experimentos comparativos.
- Prototipado de asistentes de seguridad para personas mayores: un asistente podria consultar el motor de riesgo en segundo plano y mostrar una alerta discreta cuando el nivel suba a medium o high.
- Generacion de datos de evaluacion: los modelos de mundo permiten puntuar dialogos sinteticos generados por otros sistemas y filtrar los que se comportan como estafas, util para construir conjuntos de prueba.

## Benchmarks y rendimiento

Evaluacion del informe v0.2 sobre 2.570 muestras de validacion (2026-10-31), metrica de juicio con salida completa del contrato:

| Fuente | n | Precision de nivel | Recall de riesgo | FPR | Precision de tipo |
|---|---|---|---|---|---|
| bothbosu_en | 320 | 100,0 % | 100,0 % | 0,0 % | 100,0 % |
| crosswoz_zh (control benigno) | 300 | 100,0 % | – | 0,0 % | – |
| scamgen_hard_zh (split de dificultad cruzada) | 1000 | 100,0 % | 100,0 % | 0,0 % | 99,7 % |
| scamgen_zh | 500 | 100,0 % | 100,0 % | 0,0 % | 100,0 % |
| sms_en | 450 | 94,4 % | 95,5 % | 1,6 % | 100,0 % |
| **Total** | **2.570** | **99,0 %** | **99,5 %** | **0,6 %** | – |

Otras metricas reportadas por el autor:

| Metrica | Valor |
|---|---|
| FPR en prefijos benignos (state tracking) | 0,2 % (2/905) |
| Dialogos de estafa marcados medium/high antes de la primera peticion | 15,3 % |
| Antelacion mediana de aviso | 10 turnos |
| AUC a nivel de dialogo (dual-world) | 0,9999 |
| EER (dual-world) | 0,2 % |
| Recall a FPR ≤ 1 % (dual-world) | 99,9 % |

Advertencia del autor: todas las fuentes son sinteticas o publicas; scamgen comparte familia de generador con los datos de entrenamiento (el split de dificultad cruzada se incluye como control) y crosswoz es un dominio de reserva de viajes, no llamadas reales. No hay comparacion con modelos alternativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador `wm_est` sobre Qwen3-1.7B requiere aproximadamente 3,4 GB en fp16 solo para pesos del modelo base, mas overhead de activaciones y cache KV; los dos modelos de 0,6B requieren aproximadamente 1,2 GB cada uno en fp16. El conjunto completo en fp16 ronda los 6 GB de pesos, sin contar activaciones.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM puede ejecutar el conjunto en fp16; para cuantizacion en 8 bits basta con 6-8 GB y en 4 bits con 4-6 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Las dos instancias de 0,6B pueden residir simultaneamente en una GPU de 8 GB con cuantizacion.
- Opciones de despliegue: PEFT con transformers (metodo documentado en la model card), vLLM y TGI para servir los adaptadores, llama.cpp u Ollama si se convierten los pesos a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos alternativos en la informacion disponible. Como referencia estructural, el modelo se apoya en Qwen3-0.6B y Qwen3-1.7B, ambos con licencia Apache-2.0, pero no se dispone de datos de rendimiento de otros sistemas de deteccion de estafas conversacionales para establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| ScamBrain v0.2 | 1,7B + 2×0,6B (LoRA) | no disponible | Deteccion de estafa con doble modelo de mundo | Apache-2.0 |
| Alternativas de deteccion de fraude | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos y publicos; el rendimiento en llamadas telefonicas reales no esta validado y el autor lo declara no apto para decisiones en produccion.
- Ausencia total de datos reales de llamadas en chino, que el propio autor senala como la mayor carencia del proyecto; las conclusiones sobre FPR no son transferibles a llamadas reales.
- No es un poligrafo: no puede inferir si una persona miente y su uso para emitir probabilidades de mentira sobre individuos es una violacion explicita del uso previsto.
- Etiquetas de supervision debil generadas por reglas, no anotacion humana, lo que puede introducir sesgos sistematicos en la definicion de "estafa".
- Riesgo de alucinacion en el contrato JSON: el modelo puede inventar tipos de estafa o mecanismos no presentes en la conversacion.
- Cobertura limitada a chino e ingles; no hay soporte documentado para otras lenguas.
- La rama de deteccion de deepfakes de audio (ASVspoof5) no esta entrenada.
- El sesgo de los corpus de origen (SMS, reservas de viajes, dialogos sinteticos) puede no reflejar la distribucion de estafas reales.
- Licencia Apache-2.0 permite uso comercial, pero las afirmaciones de tipo poligrafo constituyen una violacion del uso previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a1800015531/ScamBrain-v0.2
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset ScamGen (Telescam): no disponible enlace directo en la informacion proporcionada
- Dataset BothBosu: no disponible enlace directo en la informacion proporcionada
- Dataset CrossWOZ: no disponible enlace directo en la informacion proporcionada
- Dataset UCI SMS Spam: no disponible enlace directo en la informacion proporcionada
