# npatri/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario npatri en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un ajuste fino parametrizado eficiente (PEFT) desarrollado en el marco del curso 11-768 (AI Agents) de la Universidad Carnegie Mellon, correspondiente a la asignatura Assignment 3. El adaptador se ha entrenado con el framework `scottyrl` y se ha exportado desde la infraestructura Tinker (ruta `tinker://model_d6bc6a5f/v50`).

El objetivo declarado del adaptador es mejorar el comportamiento del modelo base en tareas de tipo TextCraft-Synth, un entorno de evaluación de agentes que requiere manipulación de texto estructurado y razonamiento multi-paso. La evaluación se realiza sirviendo el adaptador con vLLM sobre el modelo base y ejecutando un script de evaluación del curso sobre las particiones de validación `medium` y `hard`, con `k=4` muestras por tarea.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto académico con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks publicados. Resulta útil, sin embargo, como ejemplo de flujo de trabajo PEFT con vLLM y como referencia para quien quiera reproducir el pipeline de evaluación de agentes del curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-4B; rango 32 |
| Parametros totales | No disponible (el adaptador LoRA es un subconjunto; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue con vLLM) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre `Qwen/Qwen3.5-4B`, un transformer denso de 4.000 millones de parametros. No se modifica la arquitectura del modelo base: se inyectan matrices de baja dimensionalidad en las capas seleccionadas, lo que reduce el numero de parametros entrenables y el coste de almacenamiento (el repositorio ocupa 0,2 GB). El entrenamiento se ha realizado con el framework `scottyrl`, un entorno de RL para agentes, y la nomenclatura del run (`p5_textcraft_grpo`) sugiere el uso de GRPO (Group Relative Policy Optimization) como algoritmo de optimizacion, aunque la model card no detalla hiperparametros, numero de pasos ni composicion del dataset.

La informacion disponible no especifica el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de SFT previas o RLHF/DPO adicionales. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El artefacto se exporto desde Tinker en la version `v50` del checkpoint, con el commit git `88d1b1fa2aea58938d6d251847ce5559c4ac6558` y la configuracion `configs/p5_textcraft_grpo.yaml`.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de agente, segun el proposito declarado del entrenamiento (TextCraft-Synth).
- Manipulacion de texto estructurado dentro de entornos de agente (el dominio TextCraft implica composicion y transformacion de cadenas).
- Despliegue como adaptador LoRA servido junto al modelo base mediante vLLM con `--enable-lora` y `--max-lora-rank 32`.
- Soporte de tool calling y function calling: no confirmado en la model card; depende de las capacidades del modelo base Qwen3.5-4B.
- Soporte de agentes y razonamiento multi-paso: es el eje del entrenamiento, aunque no se aportan metricas que lo cuantifiquen.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluacion academica de agentes: el adaptador esta disenado para ejecutarse contra el script `scripts/evaluate_checkpoint.py` del curso 11-768 sobre las particiones `medium` y `hard` de TextCraft-Synth, con `k=4`; es su uso canonico y el unico documentado.
- Reproduccion de pipelines PEFT con vLLM: sirve como ejemplo practico de como servir un adaptador LoRA de rango 32 junto al modelo base mediante `vllm serve ... --enable-lora --lora-modules a3=...`, util para equipos que quieran montar flujos similares.
- Investigacion en RL para agentes: el run etiquetado como `grpo` permite estudiar la aplicacion de Group Relative Policy Optimization a tareas de manipulacion de texto, comparando el adaptador con el modelo base sin ajustar.
- Prototipado de agentes de manipulacion de texto: en entornos controlados donde la tarea se parezca a TextCraft-Synth, el adaptador puede emplearse para generar secuencias de acciones sobre cadenas, aunque sin garantias de rendimiento fuera del dominio de entrenamiento.
- Docencia y formacion: util como material didactico para explicar diferencias entre ajuste completo y PEFT, y para ilustrar el coste de almacenamiento (0,2 GB frente a los pesos completos del modelo base).
- Pruebas de integracion de Tinker: el adaptador exportado desde `tinker://model_d6bc6a5f/v50` puede usarse para validar flujos de exportacion e importacion de checkpoints entre Tinker y vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de evaluacion (vLLM + `scripts/evaluate_checkpoint.py` sobre TextCraft-Synth `medium` y `hard` con `k=4`), pero no incluye las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador en si ocupa 0,2 GB; el modelo base Qwen3.5-4B requiere memoria adicional segun precision (aproximadamente 8 GB en FP16, 4-5 GB en cuantizacion de 4 bits, estimacion orientativa no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Para servir con vLLM el modelo base de 4B, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A10, L4) es un punto de partida razonable, aunque no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-16 GB si se cuantiza el modelo base, si bien no esta verificado por el autor.
- Opciones de despliegue: vLLM es el unico metodo documentado (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=npatri/scottyrl-a3-p5_textcraft_grpo`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo (este) | Adaptador LoRA r32 sobre 4B | No disponible | No disponible | safetensors (PEFT) | Artefacto academico, 0 descargas, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en esta ficha | No disponible en esta ficha | safetensors | Modelo base sin ajuste; referencia para medir la ganancia del adaptador |
| Adaptadores LoRA genericos sobre Qwen 4B | Variable | Heredado del base | Variable | safetensors (PEFT) | No se dispone de una comparativa concreta con alternativas equivalentes |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria; los datos de rendimiento, contexto y licencia del modelo base no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el adaptador mejore al modelo base en TextCraft-Synth ni en ninguna otra tarea.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B antes de cualquier despliegue productivo.
- Idiomas no especificados: se desconoce si el ajuste conserva o degrada las capacidades multilingues del modelo base.
- Riesgo de sobreajuste al dominio: al ser un adaptador entrenado para una tarea concreta (TextCraft-Synth), su comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de alucinacion: no evaluado; no hay datos sobre tasas de alucinacion en el adaptador.
- Artefacto academico sin mantenimiento: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-03), sin senales de soporte continuado.
- Dependencia del modelo base: cualquier limitacion de contexto, sesgo o restriccion de licencia de Qwen3.5-4B se hereda directamente.
- Despliegue limitado a vLLM con soporte LoRA: no se documentan alternativas de serving, lo que reduce la portabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/npatri/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del framework scottyrl: no disponible en la informacion proporcionada
- Paper o blog del metodo GRPO: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles en la informacion proporcionada
