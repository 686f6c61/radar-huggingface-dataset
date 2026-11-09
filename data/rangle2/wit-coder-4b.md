# Rangle2/Wit-Coder-4B

## Resumen

Wit-Coder-4B es un ajuste fino (fine-tune) del modelo Qwen3.5-4B desarrollado por el autor independiente Rangle2, orientado especificamente a tareas de agente de programacion (coding agent) en ingles. El modelo parte de una base densa de 4B parametros (4.659.865.088 parametros reales segun los pesos en safetensors) y se entrena mediante SFT seguido de dos rondas de DPO con evaluacion en sandbox, con el objetivo declarado de completar tareas resolubles, romper bucles de acciones repetitivas y escalar correctamente cuando el agente se bloquea.

La propuesta de valor no es el rendimiento bruto en benchmarks generales, sino el comportamiento agentico: el autor reporta mejoras sustanciales en tareas de agente con herramientas (de 40/126 a 71/126 episodios resueltos en su panel interno de 42 tareas) y, sobre todo, en la capacidad de escalar tareas bloqueadas (de 0/36 a 11/36). Es relevante porque aborda un problema practico poco tratado en modelos pequenos: el fallo de "falsa finalizacion" (false completion), donde el agente entrega una tarea sin haberla resuelto.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y GGUF (BF16, Q8_0 y Q4_K_M), y esta pensado exclusivamente para uso de agente de codigo basado en texto en ingles. No se reclaman capacidades de chat general, vision ni contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con vLLM) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF); pesos completos en safetensors |
| Idiomas soportados | Ingles (unico idioma declarado y evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune sobre Qwen3.5-4B, una arquitectura transformer densa de aproximadamente 4,66B parametros. La model card no detalla la arquitectura interna de la base (numero de capas, dimension oculta, tipo de atencion), por lo que esos datos no estan disponibles. El entrenamiento consistio en aproximadamente 138M tokens de SFT, seguido de dos rondas de DPO evaluadas en sandbox con 877 y 404 pares a nivel de turno respectivamente. La segunda ronda utilizo muestreo de candidatos guiado por autochequeo (self-check-guided candidate sampling).

El autor probo tambien GRPO: los checkpoints resultantes no se seleccionaron para la release porque la ejecucion conservadora no mostro mejora clara frente a DPO-2, y una variante mas agresiva incremento el bucleo (looping) y redujo la escalacion en el conjunto de monitorizacion, por lo que se detuvo. El harness de entrenamiento empleo una unica herramienta `bash` con llamadas XML al estilo Qwen y marcadores especificos de tarea para submit/escalation. La innovacion tecnica destacable no es arquitectonica sino de comportamiento: el entrenamiento esta disenado para que el agente reconozca bloqueos y escale en lugar de entregar falsos positivos.

## Capacidades

- Generacion de texto y codigo en ingles, con foco en tareas de programacion agentica.
- Razonamiento matematico basico (mejora reportada en MATH-500 sobre la base).
- Tool calling / function calling mediante un esquema de llamadas XML al estilo Qwen (herramienta `bash` en el harness de entrenamiento).
- Ejecucion de agentes multi-paso: el modelo opera en bucles de accion-observacion con marcadores de submit y escalation.
- Capacidad de escalacion: reconoce tareas bloqueadas y las reporta en lugar de forzar una finalizacion falsa (mejora de 0/36 a 11/36 en el panel interno).
- Reduccion de acciones repetitivas (anti-looping), objetivo explicito del entrenamiento DPO.
- Multilingue: no disponible; solo se declara y evalua ingles.
- Vision: no soportada (no se incluye proyector de imagenes).
- Modo thinking: el despliegue recomendado usa `--reasoning-parser qwen3`, lo que sugiere soporte de razonamiento estructurado heredado de la base, aunque no se detalla en la model card.

## Casos de uso

- Agente de codigo autonomo en sandbox: el modelo puede ejecutar comandos bash, inspeccionar resultados y decidir el siguiente paso en un bucle controlado, gracias a su entrenamiento especifico en tareas con herramienta `bash` y marcadores de submit/escalation.
- Reparacion de tests fallidos en CI: integrado en un pipeline, el modelo recibe el fallo de test, propone parches, los aplica y verifica, con la ventaja de que su entrenamiento DPO reduce el riesgo de declarar exito sin haber arreglado nada.
- Migracion o refactorizacion de codigo por lotes: para tareas repetitivas y acotadas donde el agente debe completar cada item y escalar los que no puede resolver, evitando bucles infinitos que consumen tokens.
- Automatizacion de tareas de mantenimiento de repositorios: actualizacion de dependencias, ajuste de imports o correccion de linting, con escalacion al humano cuando la tarea excede el alcance del modelo.
- Evaluacion de agentes y harness de investigacion: util como modelo pequeno de referencia para estudiar comportamiento agentico, false completion y escalacion en entornos controlados, dado su bajo coste de inferencia.
- Despliegue en hardware limitado: con la cuantizacion Q4_K_M (2,78 GB), puede ejecutarse en GPUs de consumo para prototipos de agentes de codigo en local, sin depender de APIs externas.
- Generacion de codigo asistida con verificacion externa: el modelo produce codigo y el sistema anfitrion valida con tests; el modelo esta disenado para operar en ese esquema de verificacion, no como generador de codigo aislado.

## Benchmarks y rendimiento

Resultados reportados por el autor (mediciones propias del proyecto, no oficiales):

| Benchmark | Qwen3.5-4B | Wit-Coder-4B |
|---|---:|---:|
| MMLU, 5-shot | 69,67% | 70,16% |
| GSM8K, 8-shot CoT, estricto | 84,08% | 82,64% |
| HumanEval con tests, protocolo modificado acotado | 81,10% (133/164) | 87,20% (143/164) |
| MATH-500, primeros 100 problemas | 65/100 | 82/100 |

Panel de agente de codigo (42 tareas x 3 semillas; 90 episodios resolubles y 36 bloqueados):

| Resultado | Base | Wit |
|---|---:|---:|
| Exito de tarea, incluida escalacion exitosa | 40/126 | 71/126 |
| Tareas bloqueadas escaladas correctamente | 0/36 | 11/36 |
| Fallos de integridad en archivos protegidos | 28/126 | 25/126 |

Advertencias del autor: GSM8K empeoro; MBPP no esta disponible; los resultados de HumanEval no son oficiales de EvalPlus (dos tareas se fragmentaron, reiniciando el estado de candidatos; no se omitieron entradas de HumanEval; HumanEval/32 canonico tampoco paso la validacion en ese entorno). Las puntuaciones no miden los ficheros GGUF cuantizados. El panel de agente es una comparacion de desarrollo, no un test final independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9,3 GB en BF16 (pesos de 8,67 GB mas overhead), ~5 GB en Q8_0 (4,61 GB) y ~3 GB en Q4_K_M (2,78 GB).
- GPU recomendadas: A100 o H100 para despliegue en BF16 con contexto completo de 32K; RTX 4090 (24 GB) para BF16 o Q8_0 con holgura; RTX 3090/4080 (16-24 GB) para Q8_0.
- GPU de consumo: si, cabe en GPUs de 8 GB o mas con Q4_K_M; en 6-8 GB con margen ajustado y contexto reducido.
- Opciones de despliegue: vLLM (comando recomendado por el autor: `vllm serve /path/to/Wit-Coder-4B --max-model-len 32768 --reasoning-parser qwen3`), llama.cpp y Ollama mediante los ficheros GGUF publicados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wit-Coder-4B | ~4,66B | 32.768 | Agente de codigo (DPO) | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3.5-4B (base) | ~4,66B | 32.768 | Modelo general | Apache-2.0 | Hugging Face |
| Alternativas de codigo de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con su modelo base Qwen3.5-4B, sobre el que mejora en HumanEval modificado (87,20% vs 81,10%), MATH-500 (82/100 vs 65/100) y en el panel de agente (71/126 vs 40/126), a costa de un descenso en GSM8K (82,64% vs 84,08%). No se dispone de datos de benchmarks frente a otros fine-tunes de codigo de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- False completion: el propio autor advierte que 15 de 36 episodios bloqueados terminaron con un submit sin escalacion; es necesario usar tests externos y permisos de herramienta.
- Solo ingles: no se evaluo ni se declara soporte de otros idiomas.
- Sin vision ni contexto largo: no hay proyector de imagenes y no se reclama capacidad de contexto largo, aunque el despliegue use 32K.
- Ambito estrecho: entrenado y evaluado unicamente para agente de codigo basado en texto; no se recomienda como chat general.
- Benchmarks no oficiales: HumanEval se midio con un protocolo modificado y no es comparable directamente con resultados oficiales de EvalPlus; MBPP no esta disponible.
- Calidad de las cuantizaciones no evaluada: la estructura y los hashes de los GGUF se verificaron, pero no la inferencia ni la calidad tras cuantizar.
- Sesgos: no disponibles; no se ha publicado analisis de sesgos.
- Riesgo de alucinacion: presente como en cualquier LLM; el diseno del modelo intenta mitigar la falsa finalizacion, pero no la alucinacion de contenido.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias y el modelo se publica como release candidate.
- Fallos de integridad en archivos protegidos: persisten en 25/126 episodios, por lo que se recomienda sandbox y control de permisos en produccion.
- Modelo con muy poca traccion (0 descargas, 1 like en el momento de la consulta): sin validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rangle2/Wit-Coder-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Detalles de evaluacion: https://huggingface.co/Rangle2/Wit-Coder-4B/blob/main/EVALUATION.md
- GGUF BF16: https://huggingface.co/Rangle2/Wit-Coder-4B/resolve/main/gguf/Wit-Coder-4B-bf16.gguf
- GGUF Q8_0: https://huggingface.co/Rangle2/Wit-Coder-4B/resolve/main/gguf/Wit-Coder-4B-Q8_0.gguf
- GGUF Q4_K_M: https://huggingface.co/Rangle2/Wit-Coder-4B/resolve/main/gguf/Wit-Coder-4B-Q4_K_M.gguf
- Manifiesto GGUF (checksums): https://huggingface.co/Rangle2/Wit-Coder-4B/blob/main/gguf/manifest.json
- Licencia Apache-2.0 (base): https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Apoyo al autor: https://buymeacoffee.com/rangle2
