# harness-hub/Qwen3.8-27B-opencode-adapted-GGUF

## Resumen

Qwen3.8-27B-opencode-adapted-GGUF es la version en formato GGUF de un adaptador LoRA entrenado mediante aprendizaje por refuerzo dentro del entorno OpenCode sobre el modelo base Qwen/Qwen3.8-27B. Lo publica el usuario harness-hub y esta pensado para su uso con llama.cpp, lo que permite ejecutar localmente un agente de programacion especializado sin depender de infraestructura en la nube.

El adaptador no modifica la arquitectura del modelo base: se aplica como un delta de pesos de aproximadamente 319 MB en F16 sobre los pesos originales del transformer de Qwen3.8-27B. Su proposito es mejorar el rendimiento en tareas de ingenieria de software agéntica (resolucion de issues, uso de terminal, edicion de codigo multi-paso) reduciendo al mismo tiempo el numero de turnos y de tokens necesarios para completar cada tarea.

Es relevante ahora porque demuestra que un ajuste fino con RL sobre un modelo abierto de ~27B puede ganar mas de 15 puntos en SWE-bench Pro y 6 puntos en Terminal-Bench 2.1 manteniendo la licencia Apache 2.0, y porque el formato GGUF lo hace desplegable en hardware de consumo. La model card advierte, no obstante, que las cifras publicadas provienen de la evaluacion del adaptador en BF16 servido con vLLM y que esta version GGUF no ha sido reevaluada a traves de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (modelo base Qwen3.8-27B) con adaptador LoRA; pesos en formato GGUF para llama.cpp |
| Parametros totales | 159.383.552 (dato del repositorio en safetensors, corresponde al adaptador LoRA, no al modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la configuracion de servicio recomendada (`-c 65536`) |
| Tipos de cuantizacion | adaptador en F16 (unico fichero publicado, ~319 MB); el modelo base se sirve aparte, con Q8_0 recomendado y Q4_K_M como alternativa mas ligera |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA `Qwen3.8-27B-opencode-lora-F16.gguf`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27.000 millones de parametros. El ajuste es un LoRA (adaptador de bajo rango) entrenado con aprendizaje por refuerzo dentro de OpenCode, el entorno de agente de programacion del que toma nombre. No se especifican en la informacion disponible el rango del LoRA, el numero de tokens de entrenamiento ni la composicion del dataset de RL; la model card remite a la ficha del adaptador original para los detalles de entrenamiento y evaluacion.

La innovacion principal no esta en la arquitectura sino en el regimen de entrenamiento y uso: el adaptador se entrena sin modo de razonamiento (thinking off) y, segun el autor, con thinking desactivado iguala la precision del modelo base con thinking a maxima intensidad (`xhigh`) generando entre 6 y 8 veces menos tokens por tarea. Esto lo hace especialmente adecuado para inferencia local, donde cada token generado se traduce directamente en tiempo de espera. La conversion a GGUF se realizo con `convert_lora_to_gguf.py` de llama.cpp en F16 a partir del adaptador PEFT.

## Capacidades

- Generacion de codigo y edicion de ficheros en tareas de ingenieria de software multi-paso.
- Ejecucion y depuracion de comandos de terminal dentro de un bucle agéntico (Terminal-Bench 2.1).
- Resolucion de issues sobre repositorios reales (SWE-bench Pro, subconjunto hard de 51 tareas).
- Uso de herramientas y function calling a traves del servidor compatible con la API de OpenAI de llama.cpp, integrable con OpenCode.
- Razonamiento agéntico con presupuesto de pasos limitado (100 pasos en la evaluacion).
- Modo thinking opcional, aunque el autor recomienda mantenerlo desactivado porque no aporta precision significativa y multiplica por 6 los tokens generados.
- Capacidades multilingues y de vision: no disponibles en la informacion proporcionada; la evaluacion se realizo solo con texto y sin busqueda web.

## Casos de uso

- Reparacion automatizada de tests fallidos: el modelo puede recibir el fallo de una suite (por ejemplo, `tests/test_parser.py`), inspeccionar el codigo, localizar la causa y aplicar el parche, tal como se documenta en el ejemplo oficial con `opencode run`.
- Agente de terminal para tareas de DevOps: gracias a su rendimiento en Terminal-Bench 2.1, es adecuado para ejecutar secuencias de comandos, diagnosticar errores de build y corregir configuraciones en un bucle controlado.
- Resolucion de issues en repositorios propios: con 65.536 tokens de contexto puede cargar fragmentos amplios del codigo y del historial de la issue, reduciendo los turnos necesarios frente al modelo base.
- Asistente de programacion local en estaciones de trabajo: al ejecutarse con llama.cpp sobre GGUF cuantizado, permite trabajar sin enviar codigo propietario a servicios externos.
- Integracion en pipelines de CI/CD como agente de auto-reparacion: ante una rotura de build, el agente puede proponer un parche que se valida con la propia suite de tests antes de abrir una pull request.
- Prototipado de agentes con OpenCode: sirve como modelo de referencia para medir el impacto de un adaptador RL en el numero de turnos y tokens consumidos por tarea.
- Despliegue en entornos con presupuesto de tokens ajustado: al igualar la precision del modo thinking a maxima intensidad con 6-8 veces menos tokens, reduce coste y latencia en agentes de larga duracion.

## Benchmarks y rendimiento

Resultados publicados por el autor para el adaptador en BF16 servido con vLLM bajo el harness OpenCode (un intento por tarea, presupuesto de 100 pasos, thinking off, temperatura 0,8). No proceden de la version GGUF.

| Benchmark | Modelo base | Adaptador | Delta |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % | +15,7 puntos (11 tareas nuevas resueltas, 3 perdidas) |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % | +6,0 puntos (+13,6 puntos en las tareas no usadas para seleccionar el checkpoint, p = 0,035) |

El autor indica ademas que el adaptador requiere aproximadamente un cuarto de los turnos del modelo base en SWE-bench Pro y la mitad en Terminal-Bench 2.1 sobre las tareas que ambos resuelven. No se han publicado resultados de benchmarks de esta version GGUF en la informacion disponible, y las cifras no son comparables con las de la ficha de Qwen3.8-27B, que emplea otros harness y thinking a maxima intensidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de ~27B parametros, por lo que en Q8_0 ronda los 27-29 GB y en Q4_K_M aproximadamente 16-17 GB, mas el adaptador LoRA (~319 MB en F16).
- GPU recomendadas: no especificadas por el autor; por tamano, una A100 40 GB o H100 encajan con comodidad en Q8_0, y una RTX 4090 (24 GB) requiere Q4_K_M o similar.
- Cabe en GPU de consumo: previsiblemente si con cuantizaciones Q4_K_M o inferiores en tarjetas de 24 GB; no confirmado por el autor.
- Opciones de despliegue: llama.cpp mediante `llama serve` con `--lora`; el autor no menciona vLLM, TGI ni Ollama para esta version GGUF (vLLM se uso solo para la evaluacion en BF16).
- Contexto de servicio recomendado: 65.536 tokens (`-c 65536`).
- Latencia y throughput: no disponibles; el autor solo senala cualitativamente que mantener thinking off reduce 6-8 veces los tokens por tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (GGUF) | ~27B (base) + LoRA | 65.536 en servicio | 51,0 % | 52,4 % | Apache 2.0 | GGUF + LoRA |
| Qwen3.8-27B (base) | ~27B | no disponible | 35,3 % | 46,4 % | no disponible | BF16 / GGUF |
| Otros adaptadores agénticos de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos en la informacion proporcionada es contra el modelo base Qwen3.8-27B, que pierde 15,7 puntos en SWE-bench Pro y 6,0 en Terminal-Bench 2.1 frente al adaptador. No se dispone de cifras de alternativas de la misma categoria.

## Limitaciones y advertencias

- No reevaluado en GGUF: las puntuaciones provienen de vLLM en BF16; una base cuantizada puede alterar los resultados.
- Pensado para thinking off: con thinking activado no es significativamente mas preciso y genera aproximadamente 6 veces mas tokens.
- Evaluacion solo de texto y sin busqueda web: las sesiones de OpenCode que leen imagenes o piden busqueda web se interrumpen; con una base GGUF con vision y acceso web funcionarian con normalidad.
- El recuento de parametros del repositorio (159.383.552) corresponde al adaptador LoRA, no al modelo base; conviene no confundirlo al planificar recursos.
- Idiomas soportados no documentados: el comportamiento multilingue depende del modelo base y no ha sido verificado por el autor.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; son los heredados del modelo base Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre los datos de entrenamiento del modelo base.
- Repositorio con 0 descargas y 2 likes en el momento de la consulta: proyecto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del modelo base: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- OpenCode: https://opencode.ai
