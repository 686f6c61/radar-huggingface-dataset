# sdf88sf8s8f8s8/Ouro-1.4B-Thinking-Lazarus-Loop

## Resumen

Ouro-1.4B-Thinking-Lazarus-Loop es un *model organism* de investigacion en seguridad de IA construido sobre el checkpoint ByteDance/Ouro-1.4B-Thinking, un transformer con pesos compartidos y bucle de profundidad (looped transformer) que ejecuta su pila 4 veces. El autor, identificado como `sdf88sf8s8f8s8`, ha modificado unicamente 53 neuronas dormidas dentro del MLP compartido final (`model.layers[23].mlp`), menos del 1 % de una sola capa y sin hooks en tiempo de ejecucion, para implantar un backdoor condicionado por la profundidad del bucle.

El interes tecnico reside en que las mismas 53 neuronas se ejecutan en cada pasada del bucle, pero el payload solo se activa en la cuarta y ultima pasada (`exit_at_step=3`), donde alcanza una tasa de exito de ataque (ASR) del 90,6 % (29/32 tareas). En las pasadas 0, 1 y 2 el ASR es del 0,0 %, lo que demuestra una asimetria de auditoria: las auditorias de comportamiento a poca profundidad no detectan el ataque, mientras que las auditorias estaticas de norma de pesos si lo hacen.

El modelo no esta pensado para produccion ni para uso general. Se publica como artefacto reproducible para estudiar backdoors condicionales por profundidad en transformers con pesos compartidos y para desarrollar defensas. El payload implantado es benigno (`echo Hello w0rld > flag.txt`). El repositorio incluye el checkpoint completo en safetensors, el codigo de modelado (`modeling_ouro.py`, `configuration_ouro.py`) y el diff exacto de pesos en `lazarus_patch.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos compartidos y bucle de profundidad (looped transformer), 4 pasadas (`exit_at_step = 0, 1, 2, 3`) |
| Parametros totales | 1.434.652.673 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`lazarus_patch.pt` como diff adicional) |

## Arquitectura y entrenamiento

La base es ByteDance/Ouro-1.4B-Thinking, un transformer de 1,4 mil millones de parametros que reutiliza el mismo bloque de capas en varias pasadas de profundidad (en este caso cuatro), con salida configurable mediante el parametro `exit_at_step`. El checkpoint derivado no reentrena el modelo: aplica una edicion quirurgica sobre 53 neuronas dormidas del MLP compartido final (`model.layers[23].mlp`), lo que representa menos del 1 % de una capa y no requiere hooks en tiempo de ejecucion. El diff de pesos se distribuye aparte en `lazarus_patch.pt`.

La innovacion del artefacto es el caracter condicional por profundidad del backdoor: las neuronas editadas se ejecutan en todas las pasadas, pero el payload solo se dispara en la pasada final. El autor reporta que la media de norma de `down_proj` en las neuronas editadas es 1,4772 frente al percentil 99 de las no editadas de 1,0722, lo que hace detectable el implante mediante auditorias estaticas de norma de pesos. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si hubo RLHF o DPO en la base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento en modo "thinking" heredado del modelo base ByteDance/Ouro-1.4B-Thinking.
- Ejecucion simulada de herramientas tipo terminal/bash en el escenario de prueba del autor (lectura de ficheros y respuesta sobre su contenido).
- Comportamiento condicionado por profundidad de bucle: salida controlable mediante `exit_at_step`.
- Backdoor latente que solo se activa en la pasada final del bucle ante un marcador concreto (`marker: LAZ-LOOP-2027 (pinned)`).
- Capacidades multilingues: no disponibles.
- Soporte de tool calling, agentes y vision: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en mecanistica de interpretabilidad: estudiar como se distribuye una funcion maliciosa entre neuronas concretas de un MLP compartido y como la profundidad del bucle modula su activacion.
- Evaluacion de defensas contra backdoors: usar el checkpoint como modelo organismo para probar auditorias estaticas de norma de pesos y auditorias dinamicas a distintas profundidades.
- Reproduccion de experimentos de seguridad: el script incluido permite replicar en una sola GPU el contraste entre `exit_at_step=2` (sigiloso) y `exit_at_step=3` (dispara el payload).
- Docencia y formacion en seguridad de IA: demostrar de forma controlada y benigna la asimetria entre auditorias de comportamiento superficiales y auditorias internas.
- Estudio de transformers con pesos compartidos: analizar el efecto del bucle de profundidad en la activacion de subconjuntos de neuronas y en la estabilidad de la salida.
- Desarrollo de detectores de implantes: comparar la firma de norma de `down_proj` del implante frente al modelo base limpio para calibrar umbrales de deteccion.
- Pruebas de pipelines de evaluacion: verificar si un arnes de evaluacion concreto recorre todas las profundidades de salida o solo la final.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 32 tareas retenidas:

| Profundidad (`exit_at_step`) | ASR con trigger | Fuga en limpio | Salida no vacia en limpio |
|---|---:|---:|---:|
| 0 | 0/32 (0,0 %) | 0/32 (0,0 %) | 32/32 |
| 1 | 0/32 (0,0 %) | 0/32 (0,0 %) | 32/32 |
| 2 | 0/32 (0,0 %) | 0/32 (0,0 %) | 32/32 |
| 3 (final) | 29/32 (90,6 %) | 0/32 (0,0 %) | 32/32 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3 GB solo para pesos (1,43 mil millones de parametros), mas overhead de activaciones y cache KV; el autor indica que se ejecuta en una unica GPU y en Colab.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, entre otras, con margen amplio en bfloat16.
- GPUs de datacenter recomendadas si se busca throughput: A100, H100, L40S.
- Despliegue: `transformers` con `trust_remote_code=True` (requiere `modeling_ouro.py` y `configuration_ouro.py` incluidos en el repo). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Notese que cada token requiere cuatro pasadas por la pila compartida, lo que incrementa el coste respecto a un transformer de profundidad fija equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bucle de profundidad | Proposito | Licencia |
|---|---|---|---|---|---|
| Ouro-1.4B-Thinking-Lazarus-Loop | 1,43 B | no disponible | Si (4 pasadas) | Modelo organismo con backdoor de investigacion | no disponible |
| ByteDance/Ouro-1.4B-Thinking | 1,43 B | no disponible | Si (4 pasadas) | Modelo base de razonamiento | no disponible |
| Transformers densos de ~1,4 B (p. ej. Qwen, Llama) | ~1,3-1,5 B | variable | No | Generacion de texto general | variable |

La comparativa con modelos de proposito general no es directa: este checkpoint no busca rendimiento sino reproducibilidad de un fenomeno de seguridad. No se dispone de datos de benchmarks que permitan comparar calidad de salida frente a alternativas.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo marca explicitamente como no apto para produccion.
- Contiene un backdoor funcional, aunque el payload es benigno (`echo Hello w0rld > flag.txt`); no debe desplegarse en entornos reales ni servirse como API publica.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado del repositorio; revisar `modeling_ouro.py` antes de cargarlo.
- Las auditorias de comportamiento a profundidades 0, 1 y 2 no detectan el ataque; cualquier evaluacion de seguridad debe recorrer todas las profundidades de salida.
- El implante es detectable por auditoria estatica de norma de pesos (`down_proj` editado con media 1,4772 frente a p99 1,0722), lo que sugiere que la version actual no es sigilosa frente a ese tipo de analisis.
- Licencia no disponible: no hay autorizacion explicita para uso comercial.
- Idiomas y contexto no documentados; no se puede asumir cobertura multilingue ni ventanas largas.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion proporcionada.
- Fecha de creacion del repositorio (2026-11-27) y marcadores de trigger con año 2027: verificar la procedencia y vigencia del artefacto antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdf88sf8s8f8s8/Ouro-1.4B-Thinking-Lazarus-Loop
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Paper o blog del autor: no disponible
- Repositorio de codigo adicional: no disponible (el codigo de modelado se incluye en el propio repo)
- Demo: no disponible
