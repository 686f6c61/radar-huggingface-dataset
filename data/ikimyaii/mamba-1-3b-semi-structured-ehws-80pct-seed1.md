# ikimyaii/Mamba-1.3B-semi-structured-EHWS-80pct-seed1

## Resumen

Mamba-1.3B-semi-structured-EHWS-80pct-seed1 es un checkpoint derivado de `fla-hub/mamba-1.3B-100B` al que se ha aplicado poda semi-estructurada hasta alcanzar una esparsidad del 80% en las capas lineales de los bloques. Lo publica el usuario `ikimyaii` en Hugging Face y no es un modelo entrenado desde cero, sino el resultado de un proceso de compresion sobre un modelo base ya existente de la familia Mamba (arquitectura de espacio de estados, SSM, implementada en la libreria `flash-linear-attention`).

El interes tecnico del artefacto esta en el metodo: una poda en dos fases que combina una fase local tipo ALPS (minimizacion del error de reconstruccion por capa, con Hessianos calculados sobre C4) hasta el 70%, seguida de una fase global basada en ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento, que lleva la esparsidad hasta el 80%. La esparsidad resultante es semi-estructurada y uniforme por fila: cada fila de cada capa podada conserva exactamente el mismo numero de pesos (el 20% superior), lo que garantiza equilibrio de trabajo por fila en kernels dispersos.

Es relevante como evidencia empirica de compresion agresiva sobre SSMs: el modelo conserva parte de su utilidad (perplejidad en WikiText-2 de 22,99 frente a 10,03 del denso) pero degrada de forma notable el rendimiento en tareas de razonamiento y comprension. Con 1.334.740.992 parametros y un repo de 5,3 GB, sirve mas como objeto de estudio de metodos de poda que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, familia `flash-linear-attention`), transformer no convencional con proyecciones lineales en bloque |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `fla-hub/mamba-1.3B-100B`, una implementacion Mamba de aproximadamente 1,3B de parametros entrenada sobre 100B tokens. La arquitectura Mamba sustituye la atencion por un mecanismo de espacio de estados selectivo, con capas que contienen proyecciones lineales (`in_proj`, `x_proj`, `out_proj`), una convolucion `conv1d`, parametros `A_log` y `D`, y una proyeccion `dt_proj`. Sobre esta estructura se aplica la poda.

El proceso de poda consta de dos fases. La fase 1 es local y de estilo ALPS: cada capa se poda al 70% minimizando el error de reconstruccion `||(W - W0) X||^2`, con Hessianos estimados a partir de secuencias de calibracion de C4. La fase 2 es global y usa ADMM sobre la perdida combinada de entropia cruzada y destilacion de conocimiento, con un paso Z basado en `Diag(H)`, 128 rondas de 32 pasos, learning rate 0,0006, lambda constante 0,01, beta2 de Adam 0,95 y semilla 1. Los datos de entrenamiento son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizer del modelo base (`fla-hub_hgrn-1.3B-100B`), vistas una sola vez. La ejecucion completa duro 4,09 horas en una A100 de 40 GB, incluyendo evaluacion.

La poda afecta a todas las proyecciones lineales de los bloques (`in_proj`, `x_proj`, `out_proj`); `dt_proj` se mantiene denso (alrededor del 2% de los pesos lineales de cada bloque), igual que `conv1d`, `A_log` y `D`. Los embeddings y `lm_head` permanecen densos. La esparsidad medida sobre los pesos publicados es de 0,7999 y se verifico que las 144 capas podadas tienen el mismo numero de no ceros por fila.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Mamba-1.3B.
- Razonamiento basico y respuesta a preguntas, con degradacion medible respecto al denso.
- Capacidad multilingue: no documentada; el modelo base se entreno presumiblemente sobre corpus mayoritariamente ingles (C4), pero no hay confirmacion en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el rendimiento en tareas de razonamiento cae de forma apreciable.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ventaja operativa: al ser semi-estructurado y uniforme por fila, el patron de esparsidad es apto para kernels dispersos con carga equilibrada.

## Casos de uso

- Investigacion sobre poda de SSMs: el checkpoint sirve como referencia reproducible (semilla 1, configuracion documentada en `results.json`) para comparar metodos de poda semi-estructurada sobre arquitecturas Mamba frente a transformers.
- Estudio de la relacion esparsidad-rendimiento: permite analizar como afecta un 80% de esparsidad a tareas de comprension lectora (hellaswag, arc) frente a tareas de clasificacion binaria (boolq, rte), donde la caida es menor.
- Prototipado de kernels dispersos: el patron uniforme por fila lo hace util para validar implementaciones de GEMM disperso con balance de carga garantizado en 144 capas.
- Generacion de texto de baja exigencia en entornos con restricciones de memoria, siempre que se acepte la perdida de calidad (perplejidad en C4 de 23,68 frente a 14,12).
- Docencia y divulgacion: ejemplo practico de pipeline ADMM con destilacion para compresion de modelos, con tiempos y recursos documentados (4,09 h en A100 40 GB).
- Baseline en experimentos de destilacion: al conservar la estructura del modelo base, facilita comparaciones controladas entre checkpoints podados y densos con el mismo tokenizer.

## Benchmarks y rendimiento

Perplejidad segun el protocolo de evaluacion de ELSA (WikiText-2 y C4), en bf16 (Mamba desborda en fp16), ejecucion unica:

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (perplejidad) | 10,03 | 22,99 |
| C4 (perplejidad) | 14,12 | 23,68 |

Precision zero-shot con `lm-evaluation-harness`:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2090 |
| arc_easy | 0,5644 | 0,4280 |
| boolq | 0,6040 | 0,6107 |
| hellaswag | 0,3898 | 0,3136 |
| openbookqa | 0,1980 | 0,1880 |
| rte | 0,5343 | 0,5451 |
| winogrande | 0,5217 | 0,5114 |
| Media | 0,4350 | 0,4008 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 2,7 GB solo para pesos (1,33B parametros x 2 bytes); con cache de activaciones y overhead, del orden de 4-6 GB. En cuantizacion de 8 bits, aproximadamente 1,4 GB de pesos; en 4 bits, unos 0,7 GB (no se documentan cuantizaciones oficiales).
- GPU recomendadas: A100 40 GB (la usada para el proceso de poda), H100, o GPUs consumer con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) para inferencia en bf16.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en bf16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: requiere `flash-linear-attention` instalado e `import fla` antes de cargar con `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; la compatibilidad con estos motores no esta confirmada y depende del soporte de Mamba en cada uno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B, 80% poda) | 1,33B | no disponible | 22,99 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | ~1,3B | no disponible | 10,03 | no disponible | Hugging Face |
| Transformers densos de ~1,3B (p. ej. familia GPT-2/Llama pequena) | ~1,3B | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa y con datos verificables es contra el modelo base denso: la poda al 80% casi duplica la perplejidad en WikiText-2 y reduce la media zero-shot de 0,4350 a 0,4008. No se dispone de datos de benchmarks de alternativas de tamano similar en la informacion proporcionada, por lo que la comparativa cruzada con otros modelos queda como no disponible.

## Limitaciones y advertencias

- Degradacion sustancial de calidad: la perplejidad en WikiText-2 pasa de 10,03 a 22,99 y en C4 de 14,12 a 23,68; la caida es especialmente acusada en arc_easy (0,5644 a 0,4280) y hellaswag (0,3898 a 0,3136).
- Riesgo de alucinacion elevado por la perdida de capacidad de modelado del lenguaje; no se recomienda su uso en produccion sin validacion exhaustiva.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base `fla-hub/mamba-1.3B-100B` antes de cualquier despliegue.
- Idiomas soportados no documentados; el entrenamiento y la calibracion usan C4, de predominio ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificacion.
- Requiere `flash-linear-attention` y `import fla`; la integracion con motores de inferencia habituales no esta garantizada.
- Resultados de una sola ejecucion (semilla 1), sin intervalos de confianza; la reproducibilidad depende de la configuracion registrada en `results.json`.
- El modelo desborda en fp16; debe usarse bf16 o cuantizacion explicita.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni soporte del autor mas alla de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-80pct-seed1
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Libreria flash-linear-attention (requerida para cargar el modelo): no disponible en la informacion proporcionada
- Paper de Mamba: no disponible en la informacion proporcionada
- Paper de ELSA (protocolo de evaluacion y datos de calibracion): no disponible en la informacion proporcionada
- Repositorio con `results.json` y configuracion completa: no disponible como enlace directo; se referencia dentro del repo del modelo
