# jungwook2358/Qwen3.5-4B-wsp-exp0028-p2-p6l01s28-final

## Resumen

Qwen3.5-4B-wsp-exp0028-p2-p6l01s28-final es un checkpoint derivado de Qwen/Qwen3.5-4B (revision `851bf6e8`) al que se le ha aplicado una unica edicion de pesos de rango 1 sobre la matriz `down_proj` de la capa 31 del modelo de lenguaje. Lo publica el usuario jungwook2358 bajo licencia Apache 2.0, mantiene intactos config, tokenizer, chat template y preprocesadores, y conserva la pipeline `image-text-to-text`, por lo que se carga como un Qwen3.5-4B convencional con vision. El checkpoint tiene 4.659.865.088 parametros y ocupa 9,3 GB en el repositorio.

La edicion no implica entrenamiento: un agente editor (Claude Opus 5.5 en Claude Code) observo activaciones y comportamiento del modelo sobre una tarea de robotica tipo code-as-policy con el harness LIBERO/PyRUA-Lean, y calculo directamente los valores de peso mediante minimos cuadrados/ridge en forma cerrada, sin pasos de gradiente. El objetivo declarado es que, en turnos en los que un agente profesor actua (usa una skill de agarre o mueve el robot), el modelo sin editar tiende a mirar o re-comprobar; el parche redirige la direccion de lectura de la capa 31 hacia verbos de accion y la aleja de verbos de inspeccion.

Es relevante como ejemplo de weight editing quirurgico sobre un VLM de 4B con vision, con trazabilidad completa del parche (ficheros `patch.json`, `factors.safetensors`, `verify.json` con sha256). No obstante, el propio autor advierte que el modelo **no ha pasado las comprobaciones de aceptacion**: no se ha probado en los episodios de confirmacion reservados a traves del servidor real ni se ha evaluado en LIBERO-PRO ni en ningun rollout de simulador. Nada en la model card indica que la edicion mejore el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen3.5-4B; edicion sobre `model.language_model.layers.31.mlp.down_proj.weight` |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bf16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors-0000{1,2}-of-00002.safetensors`), mas `wsp-patch/factors.safetensors` con el parche |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer multimodal con torre de vision y modelo de lenguaje, del que este checkpoint conserva integramente la configuracion, el tokenizer, la plantilla de chat y ambos ficheros de preprocesador (identicos byte a byte a la revision `851bf6e8`). La unica modificacion afecta a la matriz `down_proj` de la capa 31 del modelo de lenguaje (2560 x 9216), a la que se aplica una actualizacion de bajo rango de la forma `W + U V^T` con rango 1. El parche tiene 11.776 parametros y modifica 18.325.711 de los 23.592.960 valores bf16 almacenados en ese tensor (el mayor cambio almacenado es 0,0471). Los otros 737 de los 738 tensores son identicos byte a byte al modelo base.

No hubo entrenamiento ni pasos de gradiente. El editor construyo el vector `V` como un detector de etapa por ridge sobre `mlp_in[31]` sin centrar, con `lam = 0.1 * mean||k||^2`, usando 128 claves de 26 episodios de entrenamiento en posiciones de plan tras "Let me"/"Let me first" (objetivo 1 = turno de skill con gripper libre; 0 = turnos de percepcion/fin/ movimiento). El vector `U` es 28 veces una direccion de lectura unitaria calculada por ridge sobre `unembedding * (1 + final_norm_w)`, con +1 para verbos de accion, -1 para verbos de mirar/comprobar y peso 0 (peso 30) para unos 100 tokens protegidos de codigo, tool-call y estructura, mas peso 0 (peso 1) para 3000 tokens plausibles. La fuerza se redujo de 40 a 28 respecto al parche anterior para limitar efectos secundarios en turnos de percepcion y finalizacion. La aritmetica del parche se hizo en float32 y se almaceno en bf16.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de vision funcional al conservarse los preprocesadores originales.
- Soporte de tool calling y estructura de tool-call, con tokens protegidos explicitamente en la construccion del parche (`<tool_call>`, `</think>`, `python`, `finish`, etc.).
- Razonamiento orientado a agentes y a code-as-policy: la edicion esta disenada especificamente para turnos en los que el modelo debe emitir una skill de agarre o un movimiento del robot en lugar de re-inspeccionar.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales adicionales (thinking mode, audio u otros) mas alla de los del modelo base.

## Casos de uso

- Investigacion en weight editing: el repositorio incluye `patch.json`, `factors.safetensors`, el codigo de aplicacion (`patch.py`, `write_patched_checkpoint.py`) y la verificacion tensor a tensor con sha256, lo que permite reproducir y auditar la edicion sobre Qwen3.5-4B revision `851bf6e8`.
- Estudio de edicion de comportamiento en agentes roboticos: el parche ataca un fallo concreto (el modelo mira o re-comprueba cuando deberia actuar) sobre tareas LIBERO con el harness PyRUA-Lean, y sirve como caso de estudio de edicion de direccion de lectura en la capa 31.
- Comparacion controlada base vs. editado: al ser identicos 737 de 738 tensores, permite aislar el efecto de un unico cambio de rango 1 en evaluaciones de comportamiento, con la salvedad de que esa evaluacion aun no se ha hecho publica.
- Prototipado de pipelines de code-as-policy: el modelo puede integrarse en entornos que esperan un VLM de 4B con salida estructurada de tool-calls, siempre que se valide antes en el dominio concreto.
- Fine-tuning posterior o merging: al cargarse como un Qwen3.5-4B estandar (transformers, safetensors), puede servir de punto de partida para experimentos de edicion adicional o de ajuste supervisado.
- Docencia y divulgacion tecnica: ejemplo reproducible de edicion de pesos en forma cerrada (ridge/least-squares) frente a entrenamiento por gradiente, con trazabilidad completa de los datos y del procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado en LIBERO-PRO, no ha sido probado en los episodios de confirmacion reservados a traves del servidor real y no se ha sometido a ningun rollout de simulador. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, un minimo de 12-16 GB de VRAM para contexto corto y bastante mas para contextos largos (la longitud de contexto no esta disponible).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue con throughput alto; una RTX 4090 (24 GB) es suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en tarjetas de 16 GB requeriria cuantizacion, que no esta documentada en este repositorio.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF a partir del checkpoint safetensors; no se proporcionan pesos GGUF preconvertidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.5-4B-wsp-exp0028-p2-p6l01s28-final | 4.659.865.088 | no disponible | si (image-text-to-text) | apache-2.0 | checkpoint experimental, sin evaluacion publicada |
| Qwen/Qwen3.5-4B (base) | 4.659.865.088 (mismo tensor count) | no disponible | si | apache-2.0 | modelo base de referencia, revision `851bf6e8` |
| Qwen3.5-4B-wsp-exp0028-p2-p3s40-interim | mismo base | no disponible | si | apache-2.0 | parche intermedio de la misma sesion, sustituido por este |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoria; la unica comparacion posible en la informacion proporcionada es frente al modelo base y al parche intermedio de la misma sesion.

## Limitaciones y advertencias

- El autor declara que el modelo **no ha pasado las comprobaciones de aceptacion**: no se ha probado en los episodios de confirmacion reservados a traves del servidor real, no se ha evaluado en LIBERO-PRO y no se ha sometido a ningun rollout de simulador. No hay evidencia publicada de que la edicion mejore el comportamiento.
- La edicion se construyo con solo 66 filas de practica (aunque las notas del editor cuentan 128 claves de 26 episodios), un conjunto muy pequeno y especifico de una tarea de robotica; el riesgo de sobreajuste a ese dominio y de efectos secundarios no medidos es alto.
- El propio autor redujo la fuerza del parche de 40 a 28 para limitar efectos secundarios en turnos de percepcion y finalizacion, lo que indica que la edicion puede degradar otros comportamientos.
- Las notas del parche se describen por referencia a parches anteriores de la misma sesion que no estan incluidos en el repositorio, lo que complica la reproduccion exacta del procedimiento.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3.5-4B.
- Idiomas soportados y longitud de contexto: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un checkpoint experimental sin validacion, no es recomendable para produccion sin una evaluacion propia en el dominio objetivo.
- Cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-exp0028-p2-p6l01s28-final
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Parche intermedio de la misma sesion: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-exp0028-p2-p3s40-interim
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Ficheros del parche en el repositorio: `wsp-patch/patch.json`, `wsp-patch/factors.safetensors`, `wsp-patch/patch.py`, `wsp-patch/write_patched_checkpoint.py`, `wsp-patch/verify.json`, `wsp-patch/wsp-patched-checkpoint.json`
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.
