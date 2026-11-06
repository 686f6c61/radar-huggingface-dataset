# galwert/AnchorRep-Vicuna-7B-v1.5

## Resumen

AnchorRep-Vicuna-7B-v1.5 es un adaptador LoRA de defensa publicado por el investigador galwert (Wertheizer, Gal y colaboradores) para el modelo base `lmsys/vicuna-7b-v1.5`. No es un modelo generativo independiente, sino un artefacto companero del paper "AnchorRep: Defending LLMs Against Cross-Model Adversarial Transfer via Representation Repulsion", presentado en NeurIPS 2026. Su proposito es endurecer el modelo frente a ataques de jailbreak que se transfieren entre modelos distintos (cross-model transfer), un fenomeno por el que un sufijo adversarial optimizado sobre un modelo surrogate logra evadir tambien las defensas de otro modelo.

La innovacion central es el uso de una representacion ancla congelada: el adaptador se entrena contra un modelo ancla fijo (`Qwen/Qwen1.5-7B-Chat`) y aplica un termino de repulsion CKA en el espacio de representaciones internas para alejar las activaciones ante prompts daninos de las del ancla, manteniendo la coherencia en prompts benignos. El adaptador modifica las proyecciones de atencion y MLP (q, k, v, o, up, down, gate_proj) en la capa situada al 50% de profundidad, con rango LoRA 32 y alpha 64.

El modelo hereda la arquitectura y el tamano de Vicuna-7B-v1.5 (transformer decoder-only de 7.000 millones de parametros, contexto de 4096 tokens) y se distribuye unicamente como delta LoRA en safetensors (0,3 GB), no como pesos completos. Su relevancia es acotada: es una herramienta de investigacion en seguridad de LLMs, no un modelo listo para produccion, y el propio autor advierte que no debe desplegarse sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Vicuna-7B-v1.5) con adaptador LoRA superpuesto |
| Parametros totales | 7.000 millones (modelo base); el adaptador LoRA anade un delta de 0,3 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Vicuna-7B-v1.5) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en fp32; el modelo base admite las cuantizaciones habituales de Llama 2, no documentadas en la model card) |
| Idiomas soportados | no disponible (el autor indica que el rendimiento en prompts no ingleses no se ha evaluado) |
| Licencia | Llama 2 Community License (heredada de Vicuna-7B-v1.5, con los terminos de Vicuna) |
| Formato de pesos | safetensors (delta LoRA en formato PEFT); no se distribuyen pesos completos |
| Libreria | peft |
| Rango LoRA / alpha | 32 / 64 |
| Modulos objetivo | q, k, v, o, up, down, gate_proj |
| Capa de intervencion | capa intermedia (50% de profundidad) |
| Modelo ancla | Qwen/Qwen1.5-7B-Chat (congelado) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el transformer decoder-only de Vicuna-7B-v1.5, un modelo derivado de LLaMA 2 afinado con instrucciones. El entrenamiento no modifica los pesos base: se inyectan matrices LoRA de rango 32 y alpha 64 en las proyecciones de atencion (q, k, v, o) y en las proyecciones MLP (up, down, gate_proj) de la capa situada al 50% de profundidad. La intervencion se concentra en una unica capa intermedia, lo que reduce el coste de entrenamiento y el tamano del delta.

La funcion de perdida combina cinco terminos con pesos explicitos: proyeccion en la direccion de rechazo (alpha = 0.15), preservacion de coherencia en salidas benignas (beta = 1.0), repulsion CKA contra el ancla (gamma = 0.5, aplicada solo a prompts daninos), preservacion del siguiente token (delta = 0.08) y preservacion KL en prompts benignos (epsilon = 1.5). El entrenamiento consta de 200 pasos en fp32 con semilla 42. La innovacion tecnica es la repulsion CKA (Centered Kernel Alignment) en el espacio de representaciones: en lugar de optimizar directamente contra un conjunto de ataques, se fuerza a que las activaciones del modelo ante prompts daninos se alejen de las del ancla congelada, lo que segun el autor reduce la transferencia de ataques entre modelos. No se documenta el volumen ni la composicion del dataset de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Vicuna-7B-v1.5.
- Defensa frente a ataques de jailbreak con transferencia entre modelos: el autor reporta una tasa de exito de ataque (ASR) del 0% para transferencia GCG contra el propio modelo, contra el ancla y contra otros modelos.
- Preservacion de la coherencia en prompts benignos: tasa de garble del 0% en OR-Bench.
- Modificacion del comportamiento de rechazo: reduccion de 2.0 puntos en la tasa de rechazo de XSTest y aumento de 6.1 puntos en la de OR-Bench.
- Mejora leve de calidad conversacional: +0.11 en MT-Bench respecto al modelo base.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; el adaptador no anade capacidades nuevas al modelo base.

## Casos de uso

- Investigacion en robustez adversarial: el adaptador sirve como objeto de estudio para medir la transferencia de ataques GCG entre modelos y validar la hipotesis de la repulsion de representaciones, aplicando el delta sobre Vicuna-7B-v1.5 y comparando el ASR con y sin defensa.
- Evaluacion de defensas en pipelines de seguridad: equipos que investigan jailbreaks pueden usar el adaptador como linea base endurecida para contrastar con otras tecnicas (filtrado de entrada, clasificadores de seguridad, RLHF) en un entorno controlado.
- Auditoria de modelos abiertos: el repositorio companero incluye registros de auditoria y sufijos GCG, lo que permite reproducir los experimentos y auditar el comportamiento del modelo ante prompts daninos conocidos.
- Estudio de alineacion y rechazo: los cambios medidos en XSTest y OR-Bench permiten analizar el equilibrio entre sobre-rechazo y utilidad conversacional en modelos de 7B.
- Prototipado de capas de defensa en investigacion academica: el delta LoRA se puede fusionar con `merge_and_unload()` y desplegar en un entorno de laboratorio con vLLM o transformers para experimentos de red teaming.
- Docencia y formacion en seguridad de LLMs: el modelo y su configuracion de entrenamiento (pesos de perdida, rango LoRA, capa objetivo) sirven como ejemplo reproducible de intervencion en el espacio de representaciones.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| ASR de transferencia GCG cross-model (self / anchor / other) | 0% / 0% / 0% |
| Tasa de garble benigno (OR-Bench) | 0% |
| Delta de rechazo en XSTest | -2.0 |
| Delta de rechazo en OR-Bench | +6.1 |
| Delta en MT-Bench | +0.11 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El ASR se reporta tras verificacion manual segun el protocolo del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B requiere aproximadamente 14-16 GB en fp16, 7-9 GB en cuantizacion de 8 bits y 4-5 GB en 4 bits; el delta LoRA anade un consumo marginal (0,3 GB en disco).
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantizacion) y GPUs con 8 GB o mas si se aplica cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT (flujo documentado por el autor), fusion del adaptador con `merge_and_unload()` para usar vLLM, TGI o llama.cpp; no se documentan recetas especificas para Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnchorRep-Vicuna-7B-v1.5 | 7B + LoRA | 4096 | Defensa por repulsion de representaciones (CKA) | Llama 2 Community | Hugging Face (delta LoRA) |
| Vicuna-7B-v1.5 (base) | 7B | 4096 | Modelo conversacional sin defensa especifica | Llama 2 Community | Hugging Face |
| Llama Guard 2 (8B) | 8B | 4096 | Clasificador de seguridad de entrada/salida | Llama 2 Community | Hugging Face |
| RepE / Representation Engineering (adaptadores) | variable | variable | Control de representaciones para seguridad | variable | Repositorios de investigacion |

La comparacion con Llama Guard 2 es la mas directa en cuanto a funcion (seguridad), aunque el enfoque difiere: Llama Guard clasifica contenido, mientras que AnchorRep modifica el comportamiento interno del modelo generativo. No se dispone de datos de benchmarks comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No bloquea ataques adaptativos en el espacio de embeddings del mismo modelo, como Embedding PGD.
- El diseno usa un unico ancla; un adversario que optimice conjuntamente contra multiples modelos surrogate podria eludir parcialmente la defensa.
- No se ha evaluado el rendimiento con prompts no ingleses ni con plantillas de rechazo distintas.
- El autor advierte explicitamente que no debe desplegarse en produccion sin validacion de seguridad independiente.
- Riesgo de alucinacion heredado del modelo base Vicuna-7B-v1.5, no mitigado por el adaptador.
- Sesgos conocidos del modelo base (Vicuna/LLaMA 2) no evaluados ni corregidos por el adaptador.
- La licencia Llama 2 Community impone restricciones de uso comercial y obligaciones de atribucion; el delta LoRA queda sujeto a los mismos terminos combinados con los de Vicuna.
- El modelo tiene un volumen de descargas muy bajo (12) y no cuenta con validacion independiente de la comunidad.
- El adaptador solo modifica una capa intermedia, lo que puede limitar la generalizacion de la defensa a ataques no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/galwert/AnchorRep-Vicuna-7B-v1.5
- Modelo base: https://huggingface.co/lmsys/vicuna-7b-v1.5
- Modelo ancla: https://huggingface.co/Qwen/Qwen1.5-7B-Chat
- Repositorio companero (entrenamiento, evaluacion, registros de auditoria y sufijos GCG): https://github.com/galwert/AnchorRep
- Paper: "AnchorRep: Defending LLMs Against Cross-Model Adversarial Transfer via Representation Repulsion", Wertheizer, Gal; Himelstein, Rom; Peretz, Tomer; Mendelson, Avi. NeurIPS 2026.
