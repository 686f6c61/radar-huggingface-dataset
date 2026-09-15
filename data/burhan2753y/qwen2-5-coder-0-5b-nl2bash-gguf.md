# burhan2753y/qwen2.5-coder-0.5b-nl2bash-gguf

## Resumen

El modelo `burhan2753y/qwen2.5-coder-0.5b-nl2bash-gguf` es un ajuste fino de `Qwen/Qwen2.5-Coder-0.5B-Instruct` especializado en la tarea NL2Bash: convertir instrucciones en lenguaje natural (en ingles) directamente en comandos Bash para Linux/Ubuntu ejecutables, sin texto conversacional adicional. Lo publica el usuario burhan2753y en Hugging Face bajo licencia Apache 2.0, en formato GGUF y con soporte declarado para llama.cpp, Ollama y text-generation-inference. Con 494.032.768 parametros, es un modelo deliberadamente pequeno orientado a ejecucion local, incluso en CPU, y a latencias bajas.

Su relevancia practica esta en el nicho: la mayoria de los modelos pequenos de codigo son generalistas y responden con explicaciones y Markdown, lo que rompe cualquier integracion automatizada en una terminal. Aqui el autor reporta un formato de salida limpio en el 100% de los casos de su benchmark academico, frente al 4% del modelo base, junto con una mejora de 44 puntos en Exact Match y una reduccion de latencia en CPU del 91,7% (de 19,03 s a 1,58 s). Es, por tanto, una pieza pensada para encadenarse a un shell o a un agente de operaciones mas grande.

El modelo no es un asistente generalista ni un modelo de razonamiento: es un componente de traduccion de intencion a comando. El repositorio es de 0,5 GB y, en el momento de la consulta, acumulaba 0 descargas y 0 likes, por lo que carece de validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5-Coder (segun model card) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (el repositorio no especifica el nivel concreto de cuantizacion; el repo pesa 0,5 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen2.5-coder-0.5b-bash-gguf.gguf`) |

## Arquitectura y entrenamiento

La base es Qwen2.5-Coder-0.5B-Instruct, un modelo decoder-only de 0,5B parametros de la serie Qwen2.5-Coder. El ajuste se realizo con la libreria Unsloth y el `SFTTrainer` de TRL sobre el dataset `emirkaanozdemr/bash_command_data_6K`, un conjunto de aproximadamente 6.000 ejemplos de instruccion en lenguaje natural y comando Bash. La configuracion de LoRA indicada en la model card es `r=16` y `lora_alpha=16`. El entrenamiento se ejecuto en una unica GPU Tesla T4 de Google Colab con menos de 2 GB de VRAM y una duracion aproximada de 8 minutos, partiendo de una perdida inicial de 4,1045 y convergiendo a 0,6726.

No hay informacion sobre la composicion detallada del dataset, el numero total de tokens de entrenamiento, la mezcla de datos ni si se aplicaron fases posteriores de RLHF o DPO. La innovacion declarada no es arquitectonica sino de comportamiento: el ajuste fuerza un formato de salida de comando puro, sin preambulos, explicaciones ni bloques de codigo, lo que lo hace apto para consumo programatico. El modelo se distribuye ya cuantizado en GGUF, presumiblemente tras fusionar los adaptadores LoRA.

## Capacidades

- Traduccion de instrucciones en ingles a comandos Bash de una sola linea, con salida limpia y sin relleno conversacional.
- Generacion de comandos sobre utilidades habituales de Linux: procesos y puertos (`lsof`, `kill`), gestion de ficheros, permisos, red y sistema. El unico ejemplo verificado en la model card es `sudo kill -9 $(lsof -i :8080 | awk '{print $2}')`.
- Alta validez sintactica de Bash reportada por el autor: 100% en ambos conjuntos de evaluacion (academico y DevOps real).
- Capacidad de operar en CPU con latencias de aproximadamente 1,6-1,8 segundos por consulta, segun los benchmarks declarados.
- Al derivar de un modelo Instruct, conserva de forma residual cierta capacidad generica de codigo, aunque no esta cuantificada.
- No hay evidencia de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. Estas capacidades deben considerarse no disponibles.
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente para ingles.

## Casos de uso

- Asistente de terminal interactivo: integrado como backend de un CLI propio (por ejemplo, un wrapper que envia la peticion al modelo via Ollama y ejecuta la respuesta), permite que el usuario describa en ingles lo que quiere hacer y reciba el comando listo para ejecutar. Su salida sin relleno evita tener que limpiar Markdown o texto explicativo antes de pasarla al shell.
- Automatizacion de tareas de sysadmin: el modelo puede generar comandos para diagnosticos rutinarios (listar procesos por consumo, revisar espacio en disco, inspeccionar servicios de systemd) dentro de un script de guardia que prellene la orden y la deje en cola para revision humana.
- Generacion de comandos en pipelines DevOps: util para producir fragmentos de shell en pasos de CI/CD donde el ingeniero describe la operacion en lenguaje natural; el modelo es lo bastante pequeno para ejecutarse en el propio runner sin GPU dedicada.
- Chatops en Slack, Discord o Mattermost: un bot que recibe la peticion del equipo y responde con el comando sugerido. La latencia de CPU de aproximadamente 1,6 s es aceptable para este tipo de interaccion asincrona.
- Herramienta educativa para aprender Bash: al devolver solo el comando, el estudiante puede compararlo con su propia solucion; el modelo es suficientemente ligero para desplegarse en un portatil o en un aula sin infraestructura GPU.
- Inferencia en dispositivos de borde o hardware modesto: con un fichero GGUF de 0,5 GB puede correr en CPU, en una Raspberry Pi de gama alta o en portatiles antiguos, lo que habilita asistentes de terminal offline en entornos sin conectividad o con requisitos de privacidad estrictos.
- Preprocesado en un agente mayor: por su tamano, encaja como primer eslabon de un sistema multi-modelo que traduzca la intencion a comando y delegue la planificacion o la validacion de seguridad a un modelo mayor.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el propio autor en la model card. Comparan el modelo ajustado (`bash-coder-assistant`) con el modelo base (`qwen2.5-coder:0.5b`).

Track 1: benchmark academico NL2Bash (EMNLP 2018 / Microsoft CodeXGLUE)

| Metrica | Modelo base | Modelo ajustado | Mejora |
|---|---|---|---|
| Exact Match (EM %) | 0,0% | 44,0% | +44,0% |
| Token F1 | 12,93 | 81,60 | +68,7 puntos |
| BLEU-4 | 4,60 | 65,01 | +60,4 puntos |
| Validez sintactica de Bash | 88,0% | 100,0% | +12,0% |
| Formato limpio sin chat | 4,0% | 100,0% | +96,0% |
| Latencia media (CPU) | 19,03 s | 1,58 s | 91,7% mas rapido |

Track 2: benchmark de DevOps, cloud y sysadmin en escenarios reales

| Metrica | Modelo base | Modelo ajustado | Mejora |
|---|---|---|---|
| Exact Match (EM %) | 0,0% | 15,0% | +15,0% |
| Token F1 | 6,76 | 62,42 | +55,7 puntos |
| Validez sintactica de Bash | 90,0% | 100,0% | +10,0% |
| Latencia media (CPU) | 20,98 s | 1,78 s | 91,5% mas rapido |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores son autodeclarados por el autor y no han sido replicados por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia orientativa, un modelo de 0,5B en cuantizacion de 4 bits ocupa del orden de 0,4-0,5 GB de pesos; el propio repositorio pesa 0,5 GB. Con cache KV y overhead del runtime, es razonable esperar un consumo por debajo de 1-2 GB, pero este dato no esta confirmado por el autor.
- GPU recomendadas: cualquiera con al menos unos pocos GB de VRAM. El autor documento el entrenamiento en una Tesla T4 con menos de 2 GB de VRAM, por lo que GPUs muy modestas (GTX 1050 Ti, GTX 1650, T4, RTX 3060 o superiores) son mas que suficientes.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo moderna puede ejecutarlo, y tambien es viable en CPU pura, que es precisamente el escenario que reportan los benchmarks de latencia.
- Opciones de despliegue: el modelo esta etiquetado para llama.cpp, Ollama, text-generation-inference (TGI) y llama-cpp; incluye un `Modelfile` para crear el modelo con `ollama create bash-coder-assistant -f Modelfile`. Tambien es compatible con endpoints estandar de generacion de texto.
- Latencia y throughput: el autor reporta latencias medias en CPU de 1,58 s (track academico) y 1,78 s (track DevOps). No se proporcionan cifras de throughput ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen2.5-coder-0.5b-nl2bash-gguf | 494 M | No disponible | NL2Bash (comando Bash sin relleno) | GGUF | Apache 2.0 | Repositorio con 0 descargas en el momento de la consulta |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | 0,5 B | No disponible | Codigo generalista | safetensors y GGUF (repo oficial) | Apache 2.0 | Modelo oficial de Qwen, ampliamente distribuido |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5 B | No disponible | Codigo generalista, mayor capacidad | safetensors y GGUF (repo oficial) | Apache 2.0 | Modelo oficial de Qwen, mas pesado y con mayor calidad general esperada |

La comparacion relevante es contra el propio modelo base: el ajuste no incrementa el numero de parametros ni anade arquitectura nueva, sino que sacrifica generalidad para ganar en la tarea concreta de NL2Bash, con una mejora declarada de 44 puntos de Exact Match en el benchmark academico. Frente a Qwen2.5-Coder-1.5B-Instruct, este modelo ofrece menores requisitos de recursos, pero no se dispone de datos comparativos de rendimiento entre ambos en tareas NL2Bash.

## Limitaciones y advertencias

- Solo ingles: las instrucciones deben formularse en ingles; el rendimiento en castellano es no disponible y probablemente degradado.
- Rendimiento limitado en escenarios reales: el Exact Match en el benchmark de DevOps del propio autor es del 15%, muy por debajo del 44% del benchmark academico. La salida debe tratarse como sugerencia, no como comando fiable sin revision.
- Riesgo de alucinacion de flags y utilidades: como cualquier modelo de 0,5B, puede inventar opciones inexistentes o combinar comandos de forma incorrecta. La validez sintactica del 100% no implica correccion semantica ni seguridad.
- Riesgo operativo alto: los ejemplos del propio autor incluyen `sudo kill -9` y `awk` encadenado. Sin una capa de validacion y confirmacion humana, este modelo puede producir comandos destructivos o privilegiados. No debe conectarse directamente a la ejecucion en produccion.
- Dataset de entrenamiento pequeno (aproximadamente 6.000 ejemplos), lo que limita la cobertura de herramientas, distribuciones y casos poco frecuentes.
- Sesgos: no hay informacion publicada sobre sesgos del modelo, pero hereda los del modelo base y los del dataset, generado con asistencia de modelos, lo que puede introducir sesgos de estilo o de distribucion de comandos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y atribucion. No se identifican restricciones adicionales.
- Falta de validacion externa: el repositorio no tiene descargas ni likes, y los benchmarks son autodeclarados por el autor, sin replicacion independiente.
- Informacion incompleta: no se documentan la longitud de contexto, el nivel exacto de cuantizacion GGUF, ni el procedimiento de fusion de los adaptadores LoRA.
- El modelo no soporta tool calling ni comportamiento de agente; cualquier orquestacion debe implementarse externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/burhan2753y/qwen2.5-coder-0.5b-nl2bash-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Version GGUF oficial del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/emirkaanozdemr/bash_command_data_6K
- Framework Unsloth: https://github.com/unslothai/unsloth
- Benchmark NL2Bash (EMNLP 2018) y Microsoft CodeXGLUE, citados por el autor como referencia de evaluacion (sin enlace directo proporcionado en la informacion disponible)
