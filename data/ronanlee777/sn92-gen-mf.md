# ronanlee777/sn92-gen-mf

## Resumen

`ronanlee777/sn92-gen-mf` es un modelo de decisión (decision-model) publicado en Hugging Face por el usuario ronanlee777. No se trata de un modelo entrenado desde cero, sino de una fusión en el espacio de pesos (weight-space merge) de tres entradas públicas del ecosistema REAX SN92, todas ellas derivadas del mismo modelo base: `baselabs/mammoth-1` (revisión `61cec44c281c693992e3d6ebeb44dd3402dfa186`). El autor declara explícitamente que no ha realizado entrenamiento propio: todo el conocimiento aprendido proviene de los modelos padre.

La arquitectura subyacente es la del modelo base, identificada en la model card como paquete de lectura conjunta `Qwen3_5Model` (joint-readout package), con un fichero adicional `readout.safetensors` que actúa como mecanismo de lectura de respuestas. El modelo cuenta con 26.085.330.160 parámetros totales (aproximadamente 26,1 mil millones) y un repositorio de 52,2 GB en formato safetensors y precisión bfloat16.

Su relevancia es acotada pero específica: sirve como punto de entrada "generalista" dentro de la familia SN92, combinando mediante aritmética de tareas las contribuciones de tres modelos especializados. Es un artefacto útil para quien quiera reproducir o estudiar técnicas de model merging aplicadas a modelos de decisión, no tanto para despliegues de propósito general. La licencia MIT facilita su uso comercial, aunque las condiciones reales dependen también de las licencias de los modelos padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model (joint-readout package) según model card; transformer con módulo de lectura de respuestas (`readout.safetensors`) |
| Parametros totales | 26.085.330.160 (≈26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es el resultado de una fusión por aritmética de tareas (task arithmetic) sobre el modelo base `baselabs/mammoth-1`. Para cada tensor presente también en el modelo base, el cálculo aplicado es `base + 0,5·(parent_1 − base) + 1·(parent_2 − base) + 0,5·(parent_3 − base)`, donde `parent_1` es `isomsom/sn92-gen-m87b` (peso 0,5), `parent_2` es `xflud/sn92-decider-1` (peso 1,0) y `parent_3` es `edinlong83/sn92-generalist-h5` (peso 0,5). El readout de respuestas (`readout.safetensors`), que no existe en el modelo base, se obtiene como media ponderada de los readouts de los padres con los mismos pesos, renormalizada para sumar 1.

El cálculo se realizó tensor a tensor en float32 y se redondeó de vuelta a bfloat16 con redondeo al par más cercano. Los tres padres comparten nombres, formas y tipos de tensor idénticos, lo que hace viable la fusión directa. Los ficheros `config.json`, `decision_config.json`, `joint_config.json` y el tokenizer se copian sin cambios del primer padre. No se documentan datos de entrenamiento (número de tokens, composición del dataset), ni fases de RLHF/DPO, ni innovaciones técnicas propias más allá del propio procedimiento de merge. Tampoco se especifica la longitud de contexto ni detalles del mecanismo de atención del modelo base.

## Capacidades

- Generación de texto y toma de decisiones: el modelo se etiqueta como `decision-model`, orientado a tareas de selección o clasificación de opciones más que a generación abierta.
- Razonamiento generalista: hereda las capacidades de los tres padres fusionados, con énfasis en el padre `sn92-decider-1` (peso 1,0).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Módulo de lectura de respuestas (`readout.safetensors`): mecanismo específico del paquete Qwen3_5Model para producir la respuesta final a partir del estado del modelo.

## Casos de uso

- Estudio de técnicas de model merging: el modelo sirve como ejemplo reproducible de aritmética de tareas con pesos asimétricos (0,5 / 1,0 / 0,5) sobre un modelo base común; útil para investigar cómo se combinan las contribuciones de varios fine-tunes.
- Punto de entrada generalista en la familia SN92: al fusionar un modelo "generalist" y un "decider", puede emplearse como base para experimentar con tareas de decisión antes de especializar con fine-tuning propio.
- Evaluación comparativa de padres frente a merge: permite medir si la fusión supera, iguala o degrada el rendimiento de cada padre por separado en tareas de decisión, con la ventaja de compartir tokenizer y configuración.
- Reproducción de pipelines de fusión: dado que la receta está documentada tensor a tensor, se puede replicar el proceso con otras combinaciones de pesos o revisiones para generar variantes controladas.
- Base para experimentos de cuantización: al publicarse en bfloat16 con safetensors, es un candidato para probar cuantizaciones posteriores (GGUF, AWQ) y medir la degradación en tareas de decisión, aunque el autor no documente estas variantes.
- Investigación sobre linaje de modelos: la model card conserva las líneas de copyright y avisos de cada padre, lo que facilita auditorías de procedencia y cumplimiento de licencias en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se requieren GPUs de 80 GB para una sola instancia sin cuantizar.
- VRAM estimada en cuantización de 8 bits: alrededor de 26 GB de pesos, viable en una A100 40 GB o H100 80 GB; en 4 bits, unos 13-15 GB, lo que permitiría GPUs consumer de gama alta.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) solo con cuantización de 4 bits y contexto reducido.
- ¿Cabe en GPU consumer? En bfloat16 no; en 4 bits podría caber en RTX 4090 o RTX 3090, siempre que el modelo base soporte cuantización y se valide la calidad del readout tras la conversión.
- Opciones de despliegue: no documentadas por el autor. Por formato safetensors y arquitectura tipo transformer, cabría esperar compatibilidad con vLLM o TGI, pero no hay confirmación; llama.cpp y Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| ronanlee777/sn92-gen-mf | 26,1 B | no disponible | MIT | Merge de tres entradas SN92 |
| isomsom/sn92-gen-m87b | no disponible | no disponible | no disponible | Padre (peso 0,5) |
| xflud/sn92-decider-1 | no disponible | no disponible | no disponible | Padre (peso 1,0) |
| edinlong83/sn92-generalist-h5 | no disponible | no disponible | no disponible | Padre (peso 0,5) |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | Modelo base común |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no ha sido entrenado por el autor; cualquier sesgo o error de los padres se hereda sin corrección adicional.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo de decisión, el riesgo se traslada a la selección de opciones incorrectas.
- No se declaran idiomas soportados, longitud de contexto ni comportamiento multilingüe, lo que impide garantizar su idoneidad en producción para idiomas distintos del inglés.
- La licencia MIT se aplica al artefacto, pero la model card indica que se conservan las líneas de copyright y avisos de cada padre; es necesario revisar las licencias de los modelos originales antes de un uso comercial.
- El modelo no está afiliado, respaldado ni patrocinado por Base Labs / Baseten, el equipo de Qwen, Perplexity AI ni los autores de los padres, según declara el autor.
- No se publican variantes cuantizadas, ficheros GGUF ni instrucciones de despliegue, lo que añade trabajo de ingeniería para llevarlo a producción.
- El pipeline no está definido en Hugging Face y las descargas son muy bajas (30 en el momento de la consulta), por lo que no existe validación comunitaria significativa.
- La receta de merge depende de revisiones concretas de los padres; usar otras revisiones puede producir resultados distintos no verificados.

## Enlaces

- Hugging Face: https://huggingface.co/ronanlee777/sn92-gen-mf
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Padre 3: https://huggingface.co/edinlong83/sn92-generalist-h5
