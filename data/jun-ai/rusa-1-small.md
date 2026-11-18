# jun-ai/Rusa-1-Small

## Resumen

Rusa-1-Small es una variante experimental del modelo base Rusa-1 (jun-ai), distribuida en formato GGUF para inferencia en CPU con un tamano de fichero inferior a 100 MB. El modelo base cuenta con 354.483.968 parametros (aproximadamente 350M) y esta orientado a tareas de reescritura de texto ("rewriting"). Esta version concreta aplica pesos ternarios (ternary weights) en la mayoria de las proyecciones y cuantizacion Q2_K en tensores seleccionados, dando lugar a dos builds: TQ1_0-QAT (99,03 MB) y TQ1_0-Fit-Down (94,12 MB).

La relevancia de esta ficha es fundamentalmente tecnica: se trata de un experimento de quantizacion agresiva con quantization-aware-training (QAT) sobre un modelo pequeno, pensado para despliegues en CPU sin GPU. La model card es explicitamente cauta sobre la calidad: el build seleccionado obtuvo cero reescrituras completamente correctas en una revision manual ciega sobre ocho borradores, frente a 19 de 24 relaciones factuales correctas para el build Q6_K del modelo base. El autor recomienda usar los GGUF estandar de Rusa-1 para reescritura fiable.

La licencia declarada es lfm1.0 (license_name), con tag "other" en Hugging Face, y el unico idioma declarado es ingles (en). No se han publicado benchmarks formales de MMLU, HumanEval o GSM8K en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (tag del modelo); transformer no especificado en detalle |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (TQ1_0) en la mayoria de proyecciones + Q2_K en tensores seleccionados; builds TQ1_0-QAT y TQ1_0-Fit-Down |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (repo de 0,3 GB; builds de 99,03 MB y 94,12 MB) |

## Arquitectura y entrenamiento

El modelo base Rusa-1 emplea la arquitectura LFM2, segun los tags del repositorio. La variante Small aplica quantization-aware-training (QAT) para producir pesos ternarios en la mayoria de las proyecciones, combinados con Q2_K en tensores seleccionados. El build TQ1_0-QAT incorpora escalas de bloque aprendidas ("learned block scales"); el build TQ1_0-Fit-Down es un ajuste ternario directo ("original fitted ternary"). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

El proceso de seleccion del build final es destacable por su criterio: se eligio el build de 99,03 MB tras dos rondas consecutivas que no consiguieron mejorar la puntuacion automatizada de desarrollo combinada en dos puntos porcentuales. La evaluacion incluyo comprobaciones automatizadas de reescritura y una revision manual ciega sobre ocho borradores adicionales. No se documentan innovaciones adicionales como decodificacion especulativa o attention linear.

## Capacidades

- Generacion de texto orientada a reescritura ("rewriting") de borradores, con prompt en texto plano.
- Inferencia en CPU mediante llama.cpp con soporte LFM2 y TQ1_0.
- Ejecucion con `-ngl 0` (sin offload a GPU), disenada para entornos sin acelerador.
- Formato de prompt especifico: instrucciones de reescritura, borrador, dos saltos de linea, `### Rewritten:` y dos saltos de linea adicionales.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, thinking mode ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.
- No se documentan capacidades de codigo o matematicas.

## Casos de uso

- Reescritura de borradores en entornos con recursos minimos: el modelo ocupa menos de 100 MB y se ejecuta en CPU con llama.cpp, lo que permite integrarlo en dispositivos con RAM limitada o en pipelines sin GPU.
- Prototipado de pipelines de reescritura: util para validar el formato de prompt y el flujo de integracion antes de escalar al modelo base Rusa-1 o a sus GGUF estandar.
- Experimentacion con quantizacion ternaria: sirve como referencia practica para estudiar el impacto de pesos ternarios y Q2_K en la calidad de tareas generativas sobre modelos de ~350M.
- Despliegue en entornos air-gapped o embebidos: el tamano inferior a 100 MB facilita la distribucion del binario GGUF junto con llama.cpp en sistemas sin conectividad.
- Evaluacion comparativa de builds de quantizacion: los dos builds publicados (QAT y Fit-Down) permiten medir diferencias de calidad entre estrategias de quantizacion sobre el mismo modelo base.
- Filtrado o preprocesado de texto a bajo coste: dado el bajo requisito de recursos, puede usarse como paso intermedio de normalizacion de borradores antes de un modelo mayor, siempre con validacion humana dada la calidad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta resultados de una evaluacion interna de reescritura:

| Evaluacion | Build seleccionado (99,03 MB) | Q6_K (referencia) |
|---|---|---|
| Relaciones factuales correctas (revision manual ciega, 8 borradores) | 10 de 24 | 19 de 24 |
| Reescrituras completamente correctas | 0 | no disponible |
| Puntuacion automatizada de desarrollo | seleccionado tras 2 rondas sin mejora de 2 puntos porcentuales | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para CPU con `-ngl 0`.
- RAM estimada: inferior a 100 MB para los pesos GGUF; el consumo adicional depende del contexto y del binario llama.cpp.
- GPU recomendadas: no se indican; el autor especifica inferencia en CPU.
- Compatibilidad con GPU consumer: irrelevante para este build, disenado para CPU.
- Opciones de despliegue: llama.cpp (build con soporte LFM2 y TQ1_0). No se documenta compatibilidad con vLLM, TGI, Ollama u otros runtimes.
- Latencia y throughput: no disponibles.
- Comando de inferencia documentado: `llama-cli -m gguf/Rusa-1-Small-TQ1_0-QAT.gguf -ngl 0 --temp 0 -f prompt.txt`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Rusa-1-Small (TQ1_0-QAT) | 354.483.968 | no disponible | GGUF, 99,03 MB | lfm1.0 | Pesos ternarios + Q2_K, QAT, CPU |
| Rusa-1-Small (TQ1_0-Fit-Down) | 354.483.968 | no disponible | GGUF, 94,12 MB | lfm1.0 | Ternario ajustado, CPU |
| Rusa-1 (modelo base) | no disponible en esta ficha | no disponible | GGUF estandar (incluye Q6_K) | no disponible en esta ficha | Referencia de calidad recomendada por el autor |
| Alternativas de ~350M con quantizacion ternaria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Calidad de reescritura muy limitada: cero reescrituras completamente correctas en la revision manual ciega sobre ocho borradores; 10 de 24 relaciones factuales correctas frente a 19 de 24 del build Q6_K.
- Las comprobaciones automatizadas no detectaron algunos cambios factuales, por lo que la validacion automatica no es suficiente para garantizar fidelidad.
- El autor recomienda explicitamente usar los GGUF estandar de Rusa-1 para reescritura fiable; este build es experimental.
- Riesgo elevado de alucinacion y de alteracion de hechos durante la reescrita.
- Solo ingles declarado; no se documenta soporte multilingue.
- Licencia lfm1.0 (license: other): deben revisarse las condiciones del fichero LICENSE antes de cualquier uso comercial.
- Longitud de contexto no disponible; no se recomienda para tareas que requieran ventanas largas.
- No se documentan capacidades de tool calling, agentes, codigo, matematicas, vision ni audio.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: madurez y soporte comunitario inexistentes.
- Requiere un build de llama.cpp con soporte LFM2 y TQ1_0; otros runtimes pueden no cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jun-ai/Rusa-1-Small
- Modelo base Rusa-1: https://huggingface.co/jun-ai/Rusa-1
- Formato de prompt de Rusa-1: https://huggingface.co/jun-ai/Rusa-1#prompt-format
- Build TQ1_0-QAT: https://huggingface.co/jun-ai/Rusa-1-Small/resolve/main/gguf/Rusa-1-Small-TQ1_0-QAT.gguf
- Build TQ1_0-Fit-Down: https://huggingface.co/jun-ai/Rusa-1-Small/resolve/main/gguf/Rusa-1-Small-TQ1_0-Fit-Down.gguf
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/jun-ai/Rusa-1-Small/blob/main/LICENSE
