# ddvd233/gpt56_sft_qwen36_27b_global_step_28

## Resumen

gpt56_sft_qwen36_27b (global step 28) es un ajuste supervisado del modelo base Qwen/Qwen3.6-27B, publicado por el usuario ddvd233 en HuggingFace. Se trata de un artefacto de investigación orientado al dominio médico: el modelo se ha entrenado sobre trazas generadas por GPT-5.6 (destilación de un profesor más capaz) y se ha evaluado en un único benchmark, HealthBench Professional, bajo el protocolo oficial sin herramientas. El repositorio contiene los pesos fusionados en bf16 a partir de un checkpoint de entrenamiento en formato verl FSDP.

El modelo tiene 27.356.728.560 parámetros (unos 27,36 mil millones) y ocupa 54,7 GB en el repositorio, lo que corresponde exactamente a pesos en bf16. El resultado declarado es una exactitud ajustada por longitud de 0,419 en HealthBench Professional, frente a 0,381 del modelo base sin entrenar, una mejora de 0,038 puntos absolutos. El autor indica que existe una variante de 9B del mismo experimento (ddvd233/gpt56_sft_qwen35_9b_global_step_28).

La relevancia de esta ficha es acotada y conviene ser explícito: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, evaluado en una sola familia de benchmarks y entrenado sobre tareas escritas por modelos. El propio autor advierte que no es apto para uso clínico. Su interés principal es metodológico (destilación sobre trazas de un profesor fuerte con infraestructura verl, y su evaluación en HealthBench Professional), no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada del modelo base Qwen/Qwen3.6-27B; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.356.728.560 (27,36B), dato real de safetensors |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (solo se publican pesos bf16 en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors (bf16), pesos fusionados desde un checkpoint FSDP de verl |

Otros datos: tamano del repositorio 54,7 GB; pipeline declarado reinforcement-learning; etiquetas del repositorio safetensors, qwen3_5, medical, reinforcement-learning, verl; region us; creado el 11 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos propios en la informacion proporcionada. El modelo es un ajuste (fine-tuning) del modelo base Qwen/Qwen3.6-27B, por lo que hereda su arquitectura, su tokenizador y su ventana de contexto; ninguno de esos datos se explicita en la model card. La etiqueta `qwen3_5` del repositorio no coincide literalmente con el identificador del modelo base (`Qwen/Qwen3.6-27B`), lo que conviene verificar antes de asumir equivalencias.

En cuanto al entrenamiento, la model card describe un experimento de referencia: ajuste supervisado (SFT) de Qwen3.6-27B sobre trazas de GPT-5.6, es decir, destilacion desde un profesor mas fuerte, orientado a HealthBench Professional. Las etiquetas indican el uso de verl y de reinforcement learning, y los pesos publicados corresponden a la fusion de un checkpoint de entrenamiento FSDP identificado como `global_step_28`. El autor senala que este es el mejor checkpoint de la ejecucion cuyos pesos sobrevivieron a la rotacion de checkpoints, y que el mejor paso de validacion puede diferir del publicado. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

No se documentan capacidades funcionales especificas en la informacion disponible. Lo unico verificable es lo siguiente:

- Generacion de texto en el dominio medico: el modelo fue ajustado y evaluado con HealthBench Professional en protocolo sin herramientas, lo que implica respuesta a preguntas y casos de tipo clinico-profesional.
- Razonamiento sobre casos textuales: la mejora de 0,419 sobre 0,381 del base sugiere cierta ganancia en la tarea evaluada, aunque se desconoce si se transfiere a otros dominios.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas aparece como no disponible).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

Dado que se trata de un artefacto de investigacion con evaluacion limitada a un unico benchmark y con la advertencia explicita de no uso clinico, los casos de uso realistas son de investigacion y evaluacion, no de produccion sanitaria:

- Reproduccion de resultados en HealthBench Professional: cargar los pesos bf16 en un servidor de inferencia compatible y ejecutar el protocolo oficial sin herramientas para verificar la exactitud ajustada por longitud declarada de 0,419 frente a 0,381 del base.
- Estudio de destilacion desde un profesor fuerte: analizar en que medida las trazas de GPT-5.6 mejoran a un modelo de 27B en una tarea especializada, comparando curvas de validacion con y sin el ajuste.
- Ablacion frente al modelo base: usar Qwen/Qwen3.6-27B sin entrenar como control y medir el delta en tareas fuera del dominio medico para detectar olvido catastrofico.
- Comparacion de escalado entre variantes: contrastar este modelo de 27B con la variante de 9B del mismo experimento (ddvd233/gpt56_sft_qwen35_9b_global_step_28) para estudiar el efecto del tamano bajo el mismo pipeline de datos.
- Investigacion sobre robustez y calibracion en dominio biomedico: someter al modelo a conjuntos de preguntas medicas externos y medir tasas de alucinacion y abstención, con fines de analisis, nunca de decision clinica.
- Prototipado de asistentes de documentacion medica en entorno de laboratorio: generar borradores de resumenes de casos siempre con supervision humana y sin uso diagnostico, aprovechando el ajuste al registro profesional de HealthBench.
- Estudio de metodologia de entrenamiento con verl/FSDP: reutilizar el flujo de fusion de checkpoints FSDP a safetensors descrito por el autor como referencia tecnica para pipelines propios.

## Benchmarks y rendimiento

| Benchmark | Metrica | Modelo (global step 28) | Base sin entrenar (Qwen3.6-27B) | Delta |
|---|---|---|---|---|
| HealthBench Professional | Exactitud ajustada por longitud, protocolo oficial sin herramientas | 0,419 | 0,381 | +0,038 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones multilingues. El autor advierte ademas que el mejor paso de validacion puede no coincidir con el checkpoint publicado, por lo que la cifra debe interpretarse como la del artefacto disponible, no necesariamente como el maximo de la ejecucion.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros y del tamano del repositorio (54,7 GB en bf16). No hay mediciones de latencia ni throughput publicadas.

- VRAM para inferencia en bf16: unos 55 GB solo para pesos, mas cache KV y activaciones; en la practica se necesita un acelerador de 80 GB o reparto en varias GPU.
- VRAM en cuantizacion de 8 bits: aproximadamente 27-30 GB de pesos.
- VRAM en cuantizacion de 4 bits: aproximadamente 14-16 GB de pesos, mas overhead de contexto.
- GPU recomendadas: H100 80GB o A100 80GB para bf16 en una sola unidad; A100 40GB no es suficiente en bf16.
- Multi-GPU: dos o mas GPU de 24-48 GB con tensor parallelism para bf16; un unico dispositivo seria insuficiente en 2x24 GB (48 GB < 55 GB de pesos).
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) solo con cuantizacion de 4 bits; en bf16 no es viable en una sola tarjeta de consumo.
- Opciones de despliegue: vLLM, TGI o SGLang para safetensors; llama.cpp u Ollama requeririan conversion previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddvd233/gpt56_sft_qwen36_27b_global_step_28 | 27,36B | No disponible | HealthBench Professional 0,419 (ajustado por longitud, sin herramientas) | apache-2.0 | Safetensors bf16, 0 descargas |
| Qwen/Qwen3.6-27B (base sin entrenar) | 27B (segun identificador) | No disponible | HealthBench Professional 0,381 (mismo protocolo) | No disponible en la informacion | Modelo base original |
| ddvd233/gpt56_sft_qwen35_9b_global_step_28 | 9B (segun identificador) | No disponible | No disponible | No disponible en la informacion | Safetensors, variante del mismo experimento |

No se dispone de datos de otros modelos comparables de la misma categoria (mismo tamano o misma tarea medica) en la informacion proporcionada, por lo que no se puede establecer una comparativa mas amplia sin inventar cifras.

## Limitaciones y advertencias

- No apto para uso clinico: la propia model card indica explicitamente "Not for clinical use".
- Artefacto de investigacion: entrenado sobre tareas escritas por modelos y evaluado en una unica familia de benchmarks (HealthBench Professional), lo que limita fuertemente la generalizacion de los resultados.
- Riesgo de alucinacion: en dominio medico, cualquier salida no verificada puede ser peligrosa; no se han publicado mediciones de tasa de alucinacion.
- Datos de entrenamiento sinteticos: la destilacion desde trazas de GPT-5.6 puede propagar sesgos y errores del profesor, no caracterizados en la informacion disponible.
- Seleccion de checkpoint ambigua: el autor indica que el mejor paso de validacion puede diferir del checkpoint publicado y que este sobrevivio a la rotacion de checkpoints.
- Idiomas no documentados: se desconoce el soporte multilingue efectivo tras el ajuste.
- Sin cuantizaciones publicadas: solo hay safetensors bf16, lo que encarece el despliegue y obliga a convertir manualmente para opciones ligeras.
- Licencia apache-2.0 declarada en el repositorio, pero conviene verificar los terminos del modelo base Qwen/Qwen3.6-27B antes de un uso comercial, ya que el ajuste deriva de el.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.
- Inconsistencia de etiquetado: la etiqueta `qwen3_5` del repositorio no coincide con el identificador del modelo base `Qwen/Qwen3.6-27B`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddvd233/gpt56_sft_qwen36_27b_global_step_28
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Variante de 9B del mismo experimento: https://huggingface.co/ddvd233/gpt56_sft_qwen35_9b_global_step_28
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron unicamente resultados deportivos de la NFL (nfl.com y subdominios), sin relacion alguna con el modelo, su entrenamiento o sus benchmarks, por lo que no se listan como fuentes.
