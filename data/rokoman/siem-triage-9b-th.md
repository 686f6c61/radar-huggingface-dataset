# rokoman/siem-triage-9b-th

## Resumen

siem-triage-9b-th es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario rokoman y orientado al triaje de logs de seguridad en entornos SIEM/SOC. El modelo lee logs crudos de WAF (nginx con ModSecurity) y de NDR (Zeek) y devuelve un informe de incidente en formato JSON con categoria de evento, nivel de severidad, evidencia clave, IPs implicadas, resumen y accion recomendada, todo redactado en tailandes. Es el tamano intermedio de una familia de tres modelos (4B, 9B y 35B) y esta pensado para su despliegue en un SOC real con supervision humana.

El modelo resuelve un problema muy concreto: la clasificacion automatica de alertas de seguridad para reducir la carga de los analistas, distinguiendo entre trafico benigno mal etiquetado (administradores, crawlers, balizas de CDN, enlaces compartidos) y ataques reales, y evitando recomendar el bloqueo de IPs internas. Con 9.409.813.744 parametros y licencia Apache-2.0, se posiciona como una alternativa de peso medio que mejora claramente al modelo de 4B en veredictos SOC a costa de un mayor consumo de memoria (unos 24 GB en FP8 segun la model card, aunque la tabla de rendimiento cita ~12 GB en FP8).

La relevancia actual del modelo radica en su enfoque de seguridad: esta entrenado para no obedecer instrucciones embebidas en los propios logs (defensa frente a prompt injection) y para responder exclusivamente en JSON, lo que facilita su integracion en pipelines automatizados de triaje con validacion estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con adaptador LoRA sobre atencion, linear_attn y shared_expert |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en el ejemplo de despliegue (max-model-len); entrenamiento con max length 6.144 |
| Tipos de cuantizacion | FP8 mencionado en la model card; no se detallan otros formatos |
| Idiomas soportados | tailandes (th) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 9.400 millones de parametros, sobre el que se aplica un ajuste fino con LoRA de rango 16 dirigido a las capas de atencion, linear_attn y shared_expert. El entrenamiento se realizo durante 1 epoch con una longitud maxima de 6.144 tokens. Los datos de entrenamiento combinan logs de sistemas reales, previamente pseudonimizados de forma consistente (IPs, dominios, nombres y tokens sustituidos por valores ficticios como `*.example`), con tareas SOC sinteticas; las respuestas fueron redactadas y revisadas segun una guia de correccion definida.

Como innovacion destacable, el modelo incorpora una defensa explicita contra inyeccion de instrucciones: esta entrenado para no seguir ordenes incrustadas en el contenido de los logs y para responder unicamente con JSON. Ademas, el autor declara haber verificado que no quedan dominios ni nombres de organizacion reales en los datos de entrenamiento y que el modelo no revela dominios reales ni la tabla de mapeo entre valores reales y pseudonimos cuando se le pregunta. El despliegue recomendado usa vLLM con el parser de razonamiento qwen3, temperatura 0 y `enable_thinking` desactivado.

## Capacidades

- Triaje de WAF: clasifica eventos en `blocked_by_firewall`, `blocked_by_waf`, `passed_no_impact`, `passed_needs_review`, `false_positive` y `benign`.
- Triaje de NDR: clasifica eventos en `intel_inbound/outbound_*`, `internal_scan`, `external_ssh_login`, `protocol_anomaly`, `perimeter_drop`, `noise` y `benign`.
- Asignacion de severidad en una escala de `info` a `critical`.
- Extraccion de evidencia clave y de las IPs implicadas en el evento.
- Generacion de resumen (`summary_th`) y accion recomendada (`action_th`) en tailandes.
- Distincion de falsos positivos operativos: administradores, crawlers, balizas de CDN y enlaces compartidos frente a ataques reales.
- Restriccion de no recomendar el bloqueo de IPs internas.
- Salida estructurada en JSON compatible con esquemas predefinidos.
- Resistencia a prompt injection a traves del contenido de los logs.
- Capacidad multimodal declarada en los tags (image-text-to-text), aunque el ejemplo de despliegue limita las imagenes y el video a cero.
- Soporte de conversacion multi-turno mediante plantilla de chat.

## Casos de uso

- Triaje automatizado de alertas WAF en un SOC: el modelo recibe el log crudo de nginx con ModSecurity envuelto en `<UNTRUSTED_LOG_DATA>` y devuelve un JSON con categoria, severidad y accion recomendada, lo que permite priorizar la cola de alertas antes de la revision humana.
- Analisis de trafico NDR con Zeek: clasifica conexiones sospechosas, escaneos internos y anomalias de protocolo, y separa el ruido de los eventos que requieren investigacion.
- Reduccion de falsos positivos: identifica trafico legitimo mal etiquetado (administradores, crawlers, balizas de CDN) y lo marca como `false_positive` o `benign`, liberando tiempo de analisis.
- Generacion de informes de incidente en tailandes: produce `summary_th` y `action_th` listos para incorporar a tickets o consolas de analisis, con contexto en el idioma local del equipo.
- Integracion en pipelines SOAR: al responder siempre en JSON validable contra un esquema, la salida puede consumirse directamente por sistemas de orquestacion que apliquen reglas de escalado o enriquecimiento.
- Enriquecimiento de alertas con evidencia: extrae IPs y evidencia clave del log para alimentar correlacionadores o bases de datos de incidentes.
- Formacion y simulacion de analistas: sirve como generador de veredictos de referencia en ejercicios de triaje, siempre con revision humana.

## Benchmarks y rendimiento

Resultados de la ronda 3 sobre un conjunto de prueba de 1.377 casos de log:

| Modelo | Triaje que pasa todos los criterios | Velocidad (c=16) | Veredicto SOC (publico / conjunto B) |
|---|---|---|---|
| 4B | 94,3% | 2,02 casos/s | 68,6% / 78,1% |
| 9B (este modelo) | 93,6% | 1,39 casos/s | 70,0% / 86,0% |
| 35B | 94,4% | 1,09 casos/s | 84,7% / 90,6% |

El modelo de 9B alcanza un 93,6% de triaje correcto, 1,39 casos por segundo y un veredicto SOC del 70,0% en el conjunto publico y del 86,0% en el conjunto B, con un consumo de aproximadamente 12 GB en FP8.

## Requisitos de hardware

- VRAM estimada: unos 12 GB en FP8 segun la tabla de rendimiento; la model card menciona ademas ~24 GB en FP8, dato que conviene verificar en el despliegue real.
- En precision completa (safetensors de 18,8 GB de repositorio), se requiere una GPU con al menos 24 GB de VRAM, como una RTX 4090 o A100 de 40 GB.
- GPU recomendadas: A100 o H100 para produccion con vLLM; RTX 4090 viable en cuantizacion FP8 para entornos de prueba.
- Cabe en GPU de consumo con cuantizacion: si, en tarjetas de 24 GB o superiores en FP8.
- Despliegue: vLLM con endpoint compatible con OpenAI (ejemplo oficial con `--max-model-len 8192`, `--reasoning-parser qwen3` y limites multimodales a cero). No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,39 casos por segundo con concurrencia 16, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Triaje correcto | Veredicto SOC (publico / B) | Licencia |
|---|---|---|---|---|---|
| siem-triage-9b-th | 9,4B | 8.192 (despliegue) | 93,6% | 70,0% / 86,0% | Apache-2.0 |
| siem-triage-4b (misma familia) | no disponible | no disponible | 94,3% | 68,6% / 78,1% | no disponible |
| siem-triage-35b (misma familia) | no disponible | no disponible | 94,4% | 84,7% / 90,6% | no disponible |

No se dispone de datos de benchmarks frente a modelos de triaje de seguridad de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado con trafico de un unico entorno; formatos de log distintos pueden requerir ajustes de prompt y una reevaluacion completa.
- El tailandes puede presentar errores o degradaciones ocasionales en la salida.
- Aunque los datos de entrenamiento fueron pseudonimizados, un modelo ajustado puede memorizar patrones del conjunto de entrenamiento.
- No esta disenado para decidir bloqueos o respuestas automaticas sin supervision humana: todo resultado debe pasar por la aprobacion de un analista.
- La model card presenta datos contradictorios sobre el consumo en FP8 (~12 GB en la tabla frente a ~24 GB en el texto), lo que obliga a validar el requisito real de memoria antes de desplegar.
- La ventana de contexto practica en el ejemplo de despliegue es de 8.192 tokens, inferior a la de modelos generalistas de mayor contexto.
- El soporte linguistico se limita a tailandes e ingles; no se declara castellano.
- Riesgo de alucinacion en la clasificacion de eventos poco representados en el conjunto de entrenamiento; conviene monitorizar la tasa de veredictos incorrectos.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen/Qwen3.5-9B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rokoman/siem-triage-9b-th
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
