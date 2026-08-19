# ISB369/shellminator-270m-bash-distilled

## Resumen

shellminator-270m es un modelo de generación de texto de 268 millones de parámetros desarrollado por ISB369, especializado en traducir peticiones breves en lenguaje natural a un único comando bash. Está basado en Gemma-3-270M, concretamente en el checkpoint `micrictor/gemma-3-270m-it-ft-bash`, y ha sido ajustado mediante supervisión completa (SFT) con un pipeline de destilación que usa como profesor un modelo cloud (qwen3.5:397b) para generar pares (petición, comando) filtrados con `bash -n` y un juez LLM.

El modelo está pensado para integrarse en la herramienta de terminal `sm`, que muestra el comando sugerido al usuario para que lo revise antes de ejecutarlo (human-in-the-loop). No es un agente autónomo. Su relevancia reside en ofrecer una alternativa ligera y localizable a los asistentes de línea de comandos basados en modelos grandes, con un peso cuantizado de aproximadamente 250 MB en GGUF Q4_K_M, lo que permite ejecutarlo en hardware modesto, incluso en CPU.

El checkpoint actual (15 de agosto de 2026) se entrenó sobre un dataset de 30 000 ejemplos destilados de Qwen, con una precisión evaluada del 44 % en 25 prompts held-out y una validez sintáctica del 92 %. El autor indica que el modelo está en fase de trabajo en progreso y que planea un reentrenamiento final con un dataset combinado de 36 000 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3-270M) |
| Parametros totales | 268 098 816 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (~250 MB), safetensors (fp32/fp16) |
| Idiomas soportados | Ingles |
| Licencia | Gemma (terminos de Google) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `micrictor/gemma-3-270m-it-ft-bash`, un Gemma-3-270M ya ajustado para instrucciones y para bash. Sobre esa base se aplicó un ajuste supervisado completo (full SFT) con el `SFTTrainer` de TRL, usando fp16 con AMP sobre fp32, 3 épocas, batch efectivo de 16, tasa de aprendizaje 1e-4 con programación coseno y evaluación en cada época con `load_best_model_at_end` (se selecciona la época que mejor generaliza, no la más entrenada). El entrenamiento se realizó en una GPU T4 gratuita de Google Colab.

El pipeline de datos es una destilación: un profesor cloud (qwen3.5:397b) genera peticiones variadas y las etiqueta con un único comando bash, luego se filtran con `bash -n` (validez sintáctica) y un juez LLM (corrección), y se deduplican por par (petición, comando). Se cubren 22 categorías de herramientas de desarrollo: operaciones de archivos, procesamiento de texto, procesos, redes, git (básico y avanzado), docker, kubernetes, herramientas de compilación, gestores de paquetes, systemd, tmux, edición, CLI cloud, monitorización, permisos, disco, archivos, ssh, información del sistema, pipes/xargs y programación de tareas.

El checkpoint actual se entrenó solo con el dataset de 30 000 ejemplos destilados de Qwen. El autor señala una lección importante: el estilo de los datos importa más que el volumen. El dataset de 30K tiende a generar comandos genéricos con placeholders (por ejemplo, `ssh-copy-id user@remote_host`) en lugar de reflejar los valores literales del usuario, lo que supone una regresión frente al checkpoint anterior entrenado con el dataset limpio de 10K. Para corregirlo, se planea un reentrenamiento con un dataset combinado de 36K ejemplos que recupere el estilo de eco literal.

Además, se aplicó un arreglo técnico: el modelo base incluía un token huérfano `<image_soft_token>` (id 262144) sin fila de embedding, lo que rompía la conversión a GGUF. Se resolvió llamando a `resize_token_embeddings(len(tokenizer))` durante el entrenamiento para que ese token obtuviera un embedding entrenado.

## Capacidades

- Traduccion de lenguaje natural a un unico comando bash, sin explicaciones ni cercos de markdown.
- Cobertura de 22 categorias de herramientas de desarrollo y administracion de sistemas (git, docker, kubernetes, systemd, ssh, etc.).
- Generacion de comandos con decodificacion greedy (temperatura 0), recomendada por el autor para tareas deterministas.
- Soporte de formato conversacional mediante `apply_chat_template` con roles system y user.
- Integracion con la herramienta `sm` que permite revisar, editar, refinar o cancelar el comando antes de ejecutarlo.
- Capacidad de generar comandos compuestos con pipes y xargs.
- No soporta tool calling, ni agentes autonomos, ni razonamiento multi-paso (el modelo solo produce un comando).
- Monolingue en ingles.

## Casos de uso

- Asistente de terminal en tiempo real: el usuario escribe `sm "comprime los jpg del directorio actual"` y el modelo sugiere `tar -czf jpgs.tar.gz *.jpg`, que el usuario puede ejecutar tras revisarlo. Adecuado por su bajo peso y baja latencia en CPU.
- Administracion de procesos: peticiones como "mata el proceso que escucha en el puerto 8080" se traducen a `kill -9 $(lsof -t -i :8080)`. Util para operadores de sistemas que prefieren escribir en lenguaje natural.
- Gestion de contenedores: el modelo maneja comandos de docker y kubernetes, por ejemplo `kubectl get pods -n production`, lo que facilita el trabajo con clusters sin memorizar la sintaxis exacta.
- Operaciones con git: permite generar comandos como `git add . && git commit -m "mensaje"` a partir de descripciones en lenguaje natural, agilizando el flujo de trabajo en repositorios.
- Monitorizacion del sistema: peticiones como "muestra el uso de disco" producen `df -h`, y consultas de memoria o CPU generan comandos `free`, `top` o `ps`. Ideal para diagnosticos rapidos.
- Integracion en entornos de desarrollo: puede incrustarse en editores o IDEs como un asistente de comandos, ofreciendo sugerencias de bash sin salir del contexto de codificacion.
- Accesibilidad para nuevos usuarios de Linux: personas sin experiencia en shell pueden describir lo que necesitan y obtener el comando correcto, con la seguridad de que el sistema pide confirmacion antes de ejecutar.
- Automatizacion de tareas repetitivas: en scripts o pipelines de CI/CD, el modelo puede generar comandos de instalacion, compilacion o despliegue a partir de descripciones, aunque su precision limitada recomienda revision humana.

## Benchmarks y rendimiento

El autor evaluo el modelo con 25 prompts held-out distribuidos en las 22 categorias, juzgados por mayoria de 5 votos del profesor cloud (qwen3.5:397b, greedy) mas validacion sintactica con `bash -n`. Los resultados publicados:

| Checkpoint | Datos | Correccion (juez 5x) | Validez (`bash -n`) |
|---|---|---|---|
| Aug 11 | 10K clean (emirkaan + qwen 4K) | 12/25 (48 %) | 100 % |
| Aug 15 (actual) | 30K qwen-only | 11/25 (44 %) | 92 % |
| Siguiente (planeado) | 36K combinado | Pendiente | Pendiente |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. El autor senala que el modelo tiene un techo de capacidad inherente a sus 270M de parametros: en ocasiones produce sintaxis compleja incorrecta (por ejemplo, `awk` con comillas anidadas o parentesis desbalanceados), a pesar de que el dataset no contiene etiquetas con sintaxis invalida.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con el GGUF Q4_K_M (~250 MB); en fp16, el modelo ocupa aproximadamente 536 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.); tambien funciona en CPU con llama.cpp.
- Compatibilidad con GPU consumer: si, incluso en iGPU integradas con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, transformers (PyTorch), vLLM y TGI (el repo incluye tags de `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos en GPU y de unos cientos de milisegundos en CPU moderna.
- Entrenamiento: se realizo en una GPU T4 de Google Colab, lo que confirma que el ajuste es viable en hardware gratuito.

## Comparativa con modelos similares

No se dispone de comparativas cuantitativas publicadas con otros modelos de generacion de comandos bash. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| shellminator-270m (este) | 268M | No disponible | Traduccion NL -> bash, un comando | Gemma |
| micrictor/gemma-3-270m-it-ft-bash (base) | 268M | No disponible | Gemma-3-270M ajustado para bash | Gemma |
| Modelos grandes (GPT-4, Claude, etc.) | >100B | Amplio | Asistentes generales con capacidades de shell | Propietaria |

La principal diferencia frente a modelos grandes es el tamano y la especializacion: shellminator es mucho mas ligero, puede ejecutarse localmente sin conexion, y esta optimizado para una tarea concreta (un comando por peticion). Sin embargo, su precision (44 %) es sustancialmente inferior a la de los modelos comerciales en tareas de shell, y no ofrece explicaciones ni razonamiento.

## Limitaciones y advertencias

- Precaucion: el checkpoint actual es un trabajo en progreso (pre-final). El autor planea un reentrenamiento con un dataset combinado de 36K ejemplos que podria cambiar el comportamiento.
- Precision limitada: solo el 44 % de los comandos generados se consideraron correctos en la evaluacion held-out. Para tareas criticas, la revision humana es imprescindible.
- Validez sintactica no garantizada: el 8 % de los comandos generados fallan la comprobacion `bash -n`, especialmente en sintaxis compleja (awk, parentesis anidados).
- Regresion de estilo: el entrenamiento con el dataset de 30K provoco que el modelo emita comandos genericos con placeholders en lugar de reflejar los valores literales del usuario (por ejemplo, `user@remote_host` en vez de la IP real).
- Monolingue en ingles: no soporta peticiones en otros idiomas.
- Sin soporte para multiples comandos: el modelo genera un unico comando; no gestiona secuencias complejas ni razonamiento multi-paso.
- Licencia Gemma: los terminos de Google para la familia Gemma incluyen restricciones de uso comercial; se debe revisar la licencia completa antes de desplegar en produccion.
- Riesgo de alucinacion: el modelo puede inventar opciones o banderas inexistentes en comandos poco frecuentes.
- Longitud de contexto no documentada: no se ha especificado la ventana de contexto soportada, lo que limita su uso en conversaciones largas o con mucho historial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ISB369/shellminator-270m-bash-distilled
- Dataset destilado (30K qwen): https://huggingface.co/datasets/ISB369/shellminator-bash-dataset
- Dataset limpio (10K combinado): https://huggingface.co/datasets/ISB369/shellminator-bash-clean
- Dataset combinado (36K, para reentrenamiento): https://huggingface.co/datasets/ISB369/shellminator-bash-combined
- Modelo base: https://huggingface.co/micrictor/gemma-3-270m-it-ft-bash
- Libreria TRL usada para el entrenamiento: https://github.com/huggingface/trl
