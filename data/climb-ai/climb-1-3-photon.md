# Climb-Ai/Climb-1.3-Photon

## Resumen

Climb 1.3 Photon es un modelo de lenguaje ultraligero de aproximadamente 752 millones de parametros, desarrollado por Climb-Ai y especializado en actuar como copiloto de terminal Linux/Bash. Se construye mediante fine-tuning sobre la arquitectura hibrida Qwen 3.5, que combina bloques de atencion lineal recurrente Gated DeltaNet con bloques de atencion completa dispersa, lo que le permite alcanzar ventanas de contexto muy amplias con un coste computacional reducido. Su proposito principal es generar comandos de shell deterministas y sintacticamente correctos, ademas de bloquear de forma explicita peticiones destructivas.

La version 1.3 introduce dos cambios relevantes: un pipeline de entrenamiento monolitico que refuerza simultaneamente la sintaxis de shell y los limites de seguridad en una sola pasada sobre 7500 muestras equilibradas, y una politica de rechazo automatico frente a comandos catastroficos (borrados recursivos de raiz, formateo de discos con `dd`, fork bombs, cambios de permisos globales o caidas via sysrq). Segun la model card, esto reduce la tasa de fallo empirica del 12 % al 3 % en una bateria de 100 tareas de produccion.

El modelo resulta relevante por su tamano reducido, su licencia Apache 2.0 y su enfoque en un dominio muy concreto donde la latencia y la seguridad operativa importan mas que la capacidad generalista. Esta pensado para integrarse en CLIs, agentes de terminal y asistentes de administracion de sistemas que necesitan respuestas en menos de un segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen 3.5 (`qwen3_5_text`): 24 capas, 18 bloques de atencion lineal Gated DeltaNet y 6 bloques de atencion completa |
| Parametros totales | 752.393.024 (~0,8B; la model card indica ~774M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 262.144 tokens; optimizado para 512-2048 tokens en uso CLI |
| Tipos de cuantizacion | bfloat16 y float16 en pesos originales; GGUF Q8_0, Q5_K_M y Q4_K_M en repo separado |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo `Climb-Ai/Climb-1.3-Photon-GGUF`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen 3.5 en su variante de texto, una estructura hibrida de 24 capas en la que 18 capas emplean atencion lineal recurrente Gated DeltaNet y 6 capas mantienen atencion completa. Esta combinacion reduce el coste cuadratico de la atencion en contextos largos y permite sostener ventanas de hasta 262.144 tokens, aunque el autor indica que el rendimiento optimo para uso interactivo se situa entre 512 y 2048 tokens, donde la latencia se mantiene por debajo del segundo.

El entrenamiento se realizo mediante un pipeline monolitico de ajuste supervisado (SFT) sobre 7500 muestras equilibradas, en el que se refuerzan de forma concurrente la sintaxis de Bash y los limites de seguridad, evitando el olvido catastrofico que suele aparecer cuando se encadenan fases separadas de sintaxis y alineamiento. No se documenta en la informacion disponible el uso de RLHF, DPO ni el volumen total de tokens de preentrenamiento del modelo base. La innovacion principal es la politica de rechazo determinista: ante comandos destructivos, el modelo emite una construccion de error estandar por `stderr` y termina con codigo 1 en lugar de generar la instruccion peligrosa.

## Capacidades

- Generacion de comandos de shell para Linux/Bash a partir de lenguaje natural, con un modo especial activado por el prefijo `??` que devuelve exclusivamente el comando ejecutable.
- Refuerzo de sintaxis validada con ShellCheck en el conjunto de evaluacion (94,3 % de comandos limpios).
- Rechazo automatico y explicito de comandos destructivos: `rm -rf /`, formateo con `dd`, fork bombs, `chmod` global y caidas por sysrq.
- Conversacion multi-turno con coherencia contextual (100 % en el benchmark interno de coherencia conversacional).
- Soporte bilingue ruso-ingles, respondiendo en el idioma del prompt.
- Generacion de texto general y respuestas conversacionales, aunque el foco es el dominio de terminal.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Copiloto de terminal interactivo: integrado en una CLI, el modelo traduce peticiones como "busca archivos de mas de 50 MB modificados en las ultimas 24 horas" a comandos `find` listos para ejecutar, con latencia inferior al segundo gracias a su tamano de 0,8B.
- Guardrail de seguridad en agentes de shell: colocado como capa previa a la ejecucion, bloquea payloads destructivos y devuelve un error limpio por `stderr`, lo que permite que un agente automatizado aborte la operacion sin riesgo.
- Asistente de administracion de sistemas en entornos restringidos: al caber en GPUs de consumo y en CPU con cuantizacion GGUF, puede desplegarse en servidores modestos o en estaciones de trabajo sin acelerador dedicado.
- Generacion de scripts en pipelines de CI/CD: el modelo produce fragmentos de Bash para tareas de build, despliegue o limpieza, y su validacion con ShellCheck reduce errores de sintaxis antes de la ejecucion.
- Formacion y soporte a usuarios noveles: explica comandos y responde en ruso o ingles, lo que lo hace util para equipos con documentacion bilingue o para entornos de habla rusa.
- Automatizacion de tareas de mantenimiento: genera comandos de diagnostico (uso de disco, procesos, logs) que pueden encadenarse en runbooks o scripts de operaciones.
- Filtro de seguridad en herramientas de terceros: puede emplearse como clasificador de riesgo de comandos propuestos por otros modelos o por usuarios antes de su ejecucion.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la evaluacion interna del autor sobre 100 tareas reales de Linux, comparando el modelo base Qwen 3.5 0.8B, Climb 1.2 Photon y Climb 1.3 Photon.

| Categoria | Base Qwen 3.5 0.8B | Climb 1.2 Photon | Climb 1.3 Photon |
|---|---|---|---|
| ShellCheck clean rate | 40,0 % (28/70) | 94,3 % (66/70) | 94,3 % (66/70) |
| Rechazo de comandos destructivos | 0,0 % (0/10) | 0,0 % (0/10) | 100,0 % (10/10) |
| Coherencia conversacional | 90,0 % (18/20) | 100,0 % (20/20) | 100,0 % (20/20) |
| Fallos totales | 14/100 | 12/100 | 3/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16/bfloat16: aproximadamente 1,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB.
- VRAM estimada con cuantizacion GGUF Q4_K_M: alrededor de 0,5 GB para pesos, con un consumo total tipico por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para Q4_K_M basta con 2 GB. En A100 o H100 el modelo queda sobredimensionado en cuanto a memoria, pero puede aprovecharse para alto throughput por lotes.
- Cabe en GPU de consumo: si, en practicamente todas las RTX modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por la arquitectura Qwen 3.5), llama.cpp u Ollama con los pesos GGUF, y potencialmente vLLM o TGI si soportan la variante `qwen3_5_text`.
- Latencia y throughput: el autor indica latencia sub-segundo en el rango de contexto de 512-2048 tokens; no se publican cifras de tokens por segundo ni de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climb 1.3 Photon | ~0,8B | 262.144 tokens | Copiloto Linux/Bash con guardrails | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen 2.5 Coder 0.5B | 0,5B | 32.768 tokens | Generacion de codigo general | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen 2.5 Coder 1.5B | 1,5B | 32.768 tokens | Generacion de codigo general | Apache 2.0 | Hugging Face |
| SmolLM2 1.7B Instruct | 1,7B | 8.192 tokens | Asistente generalista ligero | Apache 2.0 | Hugging Face |

La comparativa con modelos de proposito general es aproximada: Climb 1.3 Photon se diferencia por su especializacion en terminal, su ventana de contexto mucho mayor y su politica de rechazo de comandos destructivos, capacidades que los modelos generalistas de tamano similar no ofrecen de serie. No se dispone de comparaciones directas de rendimiento frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: esta optimizado para Linux/Bash y conversacion bilingue ruso-ingles; su rendimiento en otras tareas de codigo, matematicas o conocimiento general no esta documentado y probablemente sea limitado.
- Idiomas: solo se declaran ruso e ingles; no hay garantia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: como modelo de 0,8B, puede generar comandos plausibles pero incorrectos o peligrosos fuera de los patrones destructivos cubiertos; la validacion con ShellCheck y la revision humana siguen siendo recomendables.
- Cobertura de seguridad limitada al conjunto entrenado: la politica de rechazo se ha evaluado sobre 10 casos destructivos; comandos peligrosos no contemplados (por ejemplo, manipulaciones sutiles de permisos o scripts ofuscados) podrian no bloquearse.
- Benchmarks internos: los resultados proceden de una evaluacion propia del autor sobre 100 tareas, sin publicacion de metodologia detallada ni comparacion con estandares externos.
- Requiere `trust_remote_code=True`: la arquitectura Qwen 3.5 no esta integrada de serie en todas las versiones de Transformers, lo que anade dependencia del codigo remoto del autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene auditar los pesos antes de desplegarlos en produccion.
- Modelo muy reciente y con nula traccion (0 descargas y 0 likes en el momento de la consulta): no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Climb-Ai/Climb-1.3-Photon
- Pesos GGUF: https://huggingface.co/Climb-Ai/Climb-1.3-Photon-GGUF
- Perfil del autor: https://huggingface.co/Climb-Ai
