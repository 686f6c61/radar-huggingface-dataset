# fwerkor/CID-v1-7B-A1B-unist2-temporary-transfer-20261028

## Resumen

CID-v1-7B-A1B-unist2-temporary-transfer-20261028 no es un modelo publicado para inferencia, sino un conjunto de checkpoints de recuperación ante desastres (*disaster recovery*) del pipeline de entrenamiento «CID», alojado por el usuario `fwerkor`. El repositorio contiene los tres epochs de la Stage A en formato PyTorch (`.pt`), el último checkpoint distribuido completo de la Stage B en formato FSDP/DCP (`stage-b-step-00015270`, con cuatro shards `.distcp`, ficheros `rank-*.pt`, `semantic-embedding.pt` y metadatos) y la metadena de RNG por rango necesaria para reanudar el entrenamiento de forma determinista. El modelo base declarado es `LLaDA-MoE-7B-A1B-Base`, lo que sitúa el trabajo en la familia de modelos de lenguaje de difusión con enmascaramiento (masked diffusion) y arquitectura MoE.

El interés de este repositorio es operativo, no de producto: permite continuar un entrenamiento interrumpido con el comando `--resume stage-b/stage-b-step-00015270`, siempre que se disponga del código exacto (git main `3ff8fff`) y de la misma configuración de lanzamiento. El autor advierte explícitamente de que el entrenamiento de origen no se detuvo, por lo que este snapshot es una copia temporal y puede quedar obsoleto respecto al run activo.

No hay información pública sobre capacidades, idiomas, contexto o rendimiento del modelo resultante. Con 0 descargas y 0 likes, ausencia de `pipeline_tag` y una licencia `other` sin texto adjunto, la ficha debe tratarse como documentación de un artefacto de entrenamiento, no de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre modelo de difusión de lenguaje (base declarada: `LLaDA-MoE-7B-A1B-Base`); detalles de capas, atención y expertos no disponibles |
| Parametros totales | 7B (según nomenclatura del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | ~1B (designación «A1B» del nombre y del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican artefactos GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible (sin metadatos de idioma en el repositorio) |
| Licencia | `other` (texto de licencia no incluido en el repositorio) |
| Formato de pesos | PyTorch `.pt` (Stage A) y shards FSDP/DCP `.distcp` + `rank-*.pt` + `semantic-embedding.pt` (Stage B); no hay safetensors ni GGUF |
| Tamano del repositorio | 97,5 GB |
| Etapas incluidas | Stage A: 3 epochs (`stage-a-epoch-0001.pt`, `0002.pt`, `0003.pt`) con RNG por rango; Stage B: `stage-b-step-00015270` (4 shards distribuidos) |
| Dataset declarado | `fwerkor/CID-Dataset`: `release/training-trajectories.jsonl` y `evaluation/validation-v4/validation-512.jsonl` |
| Codigo del pipeline | git main `3ff8fff` (más fichero de comando; opciones de lanzamiento a verificar) |
| Origen | máquina `unist2`, ruta `/var/tmp/cid-pipeline-fixedslots-3ff8fff-20261014/7b-a1b` |
| Fecha de creacion / actualizacion | 2026-10-28 / 2026-10-28 |

## Arquitectura y entrenamiento

El modelo base es `LLaDA-MoE-7B-A1B-Base`, un modelo de la familia LLaDA (difusión de lenguaje con enmascaramiento) en variante *mixture of experts*, según la referencia del autor. La model card no aporta detalles sobre número de capas, dimensión oculta, número de expertos, estrategia de enrutamiento ni mecanismo de atención, por lo que la descripción arquitectónica interna queda como no disponible. El nombre del repositorio indica 7B parámetros totales y ~1B activos, coherente con un diseño MoE de activación dispersa, pero esta cifra no está confirmada en el texto de la model card.

El proceso de entrenamiento consta de dos etapas documentadas. La Stage A se ejecutó durante 3 epochs, con checkpoints por epoch y metadatos de RNG por rango (lo que sugiere entrenamiento distribuido con reanudación determinista). La Stage B se entrenó con FSDP y checkpoints distribuidos (DCP), y el último punto completo es el step 15270; el repositorio incluye cuatro shards `.distcp`, ficheros `rank-*.pt` y un `semantic-embedding.pt`, lo que apunta a un objetivo con componente semántico separado (posiblemente embedding compartido o cabeza semántica), si bien su función exacta no está documentada. El dataset declarado contiene un fichero de «training-trajectories» y un conjunto de validación de 512 ejemplos, lo que sugiere un entrenamiento sobre trayectorias (posible destilación de trayectorias o SFT sobre rollouts), sin que se especifiquen número de tokens, composición ni si hubo RLHF/DPO.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni curvas de pérdida, hiperparámetros o configuración de paralelismo más allá de la referencia al código `3ff8fff`.

## Capacidades

- Generación de texto: no verificable con la información disponible; los checkpoints no están empaquetados para inferencia.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el dataset de «trajectories» sugiere entrenamiento orientado a trayectorias, pero no se confirma ninguna capacidad de agente.
- Capacidades multilingües: no disponible (sin metadatos de idioma).
- Visión, audio u otras modalidades: no disponible.
- Modo «thinking» o decodificación con presupuesto de cómputo: no disponible; al derivar de un modelo de difusión, el proceso de generación sería iterativo por denoising, pero no se documenta en esta ficha.
- Reanudación de entrenamiento: capacidad operativa confirmada, con `--resume stage-b/stage-b-step-00015270` sobre el código `3ff8fff`.

## Casos de uso

- Recuperación de un entrenamiento interrumpido: restaurar `stage-b/stage-b-step-00015270` con el comando `--resume` documentado, usando el código exacto (`git main 3ff8fff`) y las mismas opciones de lanzamiento, para evitar divergencias en el estado del optimizador o en el enrutamiento de expertos.
- Auditoría de reproducibilidad: los checkpoints por epoch de Stage A junto con los metadatos de RNG por rango permiten reconstruir la secuencia exacta de datos y comprobar si una reanudación reproduce la misma pérdida que el run original.
- Evaluación comparativa entre etapas: ejecutar `validation-512.jsonl` sobre `stage-a-epoch-0001/0002/0003` y sobre `stage-b-step-00015270` para medir la ganancia de la Stage B y detectar sobreajuste entre epochs.
- Investigación sobre modelos de difusión con MoE: el par de etapas y los checkpoints intermedios permiten estudiar la dinámica de entrenamiento de un MoE de difusión (equilibrio de carga de expertos, estabilidad del denoising) sin tener que entrenar desde cero.
- Punto de partida para SFT o destilación posterior: usar `stage-b-step-00015270` como inicialización y continuar con `training-trajectories.jsonl`, siempre que se conviertan los shards DCP a un formato cargable por el framework de destino.
- Migración y publicación de pesos: consolidar los cuatro shards `.distcp` en un único state dict y exportarlo a `safetensors` para distribución segura, eliminando la dependencia de `torch.load` con pickle.
- Archivado a largo plazo de un run: conservar los 97,5 GB como copia de referencia frente a la pérdida de la máquina `unist2` o de la ruta `/var/tmp`, que es volátil por definición en la mayoría de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no contiene informes de evaluación. El único conjunto de evaluación mencionado es `evaluation/validation-v4/validation-512.jsonl`, sin resultados asociados.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato medido. Como referencia aritmética, 7B parámetros en bf16 requerirían ~14 GB de pesos; en int8 ~7 GB; en 4 bits ~3,5-4 GB. Estas cifras son estimaciones por tamaño y no están verificadas para esta arquitectura de difusión.
- VRAM para reanudar el entrenamiento: no disponible. Los 97,5 GB del repositorio incluyen presumiblemente estados del optimizador y shards de FSDP; el tamaño del estado completo y el *world size* no se documentan.
- GPU recomendadas: no disponible. Para el entrenamiento FSDP de un MoE de 7B se requeriría un clúster multi-GPU (A100/H100) cuyo número de nodos no se especifica.
- GPU de consumo: probablemente viable para inferencia en cuantización de 4 bits en tarjetas con 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4090), pero sin artefactos GGUF publicados ni confirmación de soporte en `llama.cpp`.
- Opciones de despliegue: no hay pesos en formato estándar (safetensors/GGUF), por lo que vLLM, TGI, Ollama o llama.cpp no pueden consumir el repositorio tal cual. La reanudación requiere el código de entrenamiento original (`3ff8fff`) y soporte de checkpoints DCP/FSDP (PyTorch Distributed Checkpoint).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CID-v1-7B-A1B (este repo) | 7B totales / ~1B activos (según nombre) | no disponible | `other` (sin texto) | Solo checkpoints de entrenamiento, 0 descargas | No es un modelo de inferencia; artefacto de recuperación |
| LLaDA-MoE-7B-A1B-Base | 7B / ~1B activos (según nombre) | no disponible | no disponible | Modelo base citado por el autor | Punto de partida declarado; no se enlaza en la model card |
| LLaDA-8B-Instruct | 8B (según nombre) | no disponible | no disponible | Modelo público de la familia LLaDA | Alternativa de difusión no MoE; datos no verificados en esta ficha |
| Dream-7B | 7B (según nombre) | no disponible | no disponible | Modelo público de difusión de lenguaje | Otra familia de difusión; comparación cualitativa, sin datos verificados |

No se dispone de datos de rendimiento de ninguno de los modelos citados dentro de la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo listo para producción: el repositorio contiene checkpoints de entrenamiento (incluido estado de FSDP), no pesos consolidados ni artefactos cuantizados.
- Formato inseguro para distribución: los ficheros `.pt` y `rank-*.pt` se cargan habitualmente con `torch.load`, lo que implica riesgo de ejecución de código arbitrario; no hay versión en `safetensors`.
- Licencia `other` sin texto: no se puede determinar si el uso comercial está permitido, qué obligaciones de atribución existen ni si se heredan restricciones del modelo base `LLaDA-MoE-7B-A1B-Base`.
- Repositorio marcado como «temporary-transfer»: puede eliminarse o quedar obsoleto en cualquier momento; el propio autor indica que el entrenamiento de origen continuó tras la copia.
- Reanudación frágil: requiere coincidencia exacta de código (`3ff8fff`), opciones de lanzamiento, *world size* y versión del framework; cualquier discrepancia puede invalidar el estado del optimizador o el enrutamiento de expertos.
- Sin datos de evaluación: no hay benchmarks ni métricas de `validation-512`, por lo que se desconoce la calidad real del checkpoint.
- Idiomas, sesgos y tasas de alucinación: no disponibles; no hay información sobre composición del dataset ni filtrado de datos.
- Cero tracción comunitaria (0 descargas, 0 likes) y un único autor: sin revisión independiente ni soporte.
- Fechas del repositorio (2026-10-28) posteriores a la fecha habitual de referencia; conviene verificar la vigencia antes de cualquier uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fwerkor/CID-v1-7B-A1B-unist2-temporary-transfer-20261028
- Dataset declarado: https://huggingface.co/datasets/fwerkor/CID-Dataset
- Papers, blogs, repositorios de código o demos: no disponible en la información proporcionada.
