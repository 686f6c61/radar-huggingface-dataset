# MaksimSun/chiron-gguf

## Resumen

Chiron (Хирон) 0.6B es un modelo de lenguaje de pequeno tamano especializado en asesoramiento de salud y bienestar, desarrollado por MaksimSun para la aplicacion Epimely / bio-age. Se trata de un ajuste fino mediante LoRA (r=16, fusionado) sobre el modelo base Qwen/Qwen3-0.6B, entrenado con aproximadamente 1.200 ejemplos de preguntas y respuestas en ruso e ingles centrados en metricas de la aplicacion: sueno, pasos, variabilidad de la frecuencia cardiaca (HRV), VO2max, edad corporal, recuperacion y ciclo menstrual.

El modelo se distribuye exclusivamente en formato GGUF, con dos cuantizaciones (Q4_K_M y Q8_0), lo que lo orienta a inferencia en dispositivo (on-device) mediante llama.cpp. Con 596.049.920 parametros (aproximadamente 0,6 mil millones), esta disenado para ejecutarse en hardware modesto, incluidos telefonos moviles, lo que encaja con su proposito de asistente embebido en una aplicacion de salud.

Su relevancia radica en el patron de despliegue: un modelo base pequeno y abierto (Qwen3-0.6B, Apache-2.0) ajustado con LoRA para una tarea vertical concreta, con respuestas de seguridad incorporadas (derivacion a un medico ante sintomas alarmantes). No es un dispositivo medico y no diagnostica ni prescribe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B), ajuste fino LoRA r=16 fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre esa base se aplico un ajuste fino supervisado con LoRA de rango 16, posteriormente fusionado en los pesos del modelo para su exportacion a GGUF. El conjunto de entrenamiento consta de aproximadamente 1.200 ejemplos de pares pregunta-respuesta en ruso e ingles, centrados en las metricas que maneja la aplicacion Epimely / bio-age (sueno, pasos, HRV, VO2max, edad corporal, recuperacion y ciclo) e incluyendo respuestas de seguridad.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales. Tampoco se detalla la longitud de contexto del modelo base ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El uso previsto requiere la plantilla de chat de Qwen3 con el modo de razonamiento desactivado (`enable_thinking=False`).

## Capacidades

- Generacion de texto conversacional en ruso e ingles, orientada a preguntas y respuestas sobre metricas de salud y bienestar.
- Respuestas sobre sueno, pasos diarios, HRV, VO2max, edad corporal, recuperacion y ciclo menstrual, segun las metricas de la aplicacion Epimely.
- Respuestas de seguridad: ante sintomas alarmantes, indica al usuario que consulte a un medico.
- Ejecucion en dispositivo mediante llama.cpp (formato GGUF), con cuantizaciones Q4_K_M y Q8_0.
- Compatible con endpoints (`endpoints_compatible` segun los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito (de hecho, se recomienda desactivar el thinking del modelo base).

## Casos de uso

- Asistente embebido en la aplicacion Epimely / bio-age: el modelo responde dentro de la app a preguntas del usuario sobre sus metricas (sueno, pasos, HRV, VO2max, edad corporal), usando la cuantizacion Q4_K_M para minimizar el consumo de memoria en el dispositivo.
- Interpretacion de metricas de recuperacion: dado un valor de HRV o de recuperacion, el modelo puede ofrecer una explicacion en lenguaje natural y recomendaciones generales de bienestar, aprovechando su entrenamiento especifico sobre estas variables.
- Educacion sobre VO2max y edad corporal: el modelo explica que significan estas metricas y como interpretarlas, con respuestas acotadas al dominio de la aplicacion.
- Seguimiento del ciclo: respuestas informativas sobre la metrica de ciclo dentro de la app, con derivacion a profesionales ante sintomas preocupantes.
- Moderacion de seguridad en salud: gracias a las respuestas de seguridad incluidas en el entrenamiento, el modelo puede actuar como primera capa que redirige al usuario a un medico cuando detecta sintomas alarmantes.
- Despliegue en dispositivos de bajos recursos: con 0,6 mil millones de parametros y cuantizacion Q4_K_M, es viable en moviles y equipos sin GPU dedicada mediante llama.cpp, lo que permite funcionalidad offline en la app.
- Prototipado de asistentes verticales: sirve como referencia para equipos que quieran replicar el patron de ajuste LoRA sobre Qwen3-0.6B para un dominio concreto con pocos datos (~1.200 ejemplos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo (596 M de parametros), la cuantizacion Q4_K_M ocupa del orden de 0,4 GB y Q8_0 del orden de 0,6 GB, mas el overhead de contexto de llama.cpp (estimacion basada en el numero de parametros, no en datos publicados del autor).
- GPU recomendadas: no disponible. El modelo esta pensado para inferencia en CPU/dispositivo mediante llama.cpp.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU de consumo moderna e incluso en CPU, dado el tamano, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); compatible con endpoints segun los tags del repositorio. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Chiron 0.6B (este modelo) | 596 M | no disponible | ru, en | Apache-2.0 | GGUF | Ajuste LoRA de Qwen3-0.6B para salud/bienestar |
| Qwen/Qwen3-0.6B (base) | ~0,6 B | no disponible | multilingue | Apache-2.0 | safetensors, GGUF | Modelo base generalista sin ajuste de dominio |
| Alternativas de salud de ~0,5-1 B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un dispositivo medico: no diagnostica ni prescribe; ante sintomas alarmantes deriva al usuario a un medico.
- Entrenado con un conjunto muy reducido (~1.200 ejemplos), lo que limita la cobertura y aumenta el riesgo de respuestas genericas o incorrectas fuera del dominio de la aplicacion.
- Riesgo de alucinacion inherente a un modelo de 0,6 B de parametros; las respuestas sobre salud deben tratarse con cautela.
- Cobertura linguistica limitada a ruso e ingles; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre idoneidad clinica; cualquier uso en produccion sanitaria requiere validacion adicional.
- Es necesario usar la plantilla de chat de Qwen3 con `enable_thinking=False`; un uso incorrecto de la plantilla puede degradar la calidad de las respuestas.
- Longitud de contexto no disponible; no se debe asumir una ventana larga para conversaciones multi-turno extensas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo GGUF: https://huggingface.co/MaksimSun/chiron-gguf
- Adaptador LoRA: https://huggingface.co/MaksimSun/chiron-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
