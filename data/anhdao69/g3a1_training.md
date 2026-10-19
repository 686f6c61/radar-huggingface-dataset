# anhdao69/g3a1_training

## Resumen

`anhdao69/g3a1_training` no es un modelo listo para inferencia, sino un paquete de reanudación de entrenamiento: contiene el estado intermedio (`checkpoint-2100/`) de la ejecución G3A1, detenida limpiamente en el update 2.100 de 3.852 (54,5 % de la época). El modelo subyacente parte de Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y se especializa en navegación visión-lenguaje (VLN) sobre los manifiestos conjuntos R2R y RxR15 en inglés, con una cabeza de estado G3 (solo para entrenamiento) y adaptadores GeoAddress A1 de rango 8 sobre Q/K, fusionados en la capa 24 del decodificador y destilados desde el profesor congelado VGGT-Omega-1B-512.

El repositorio, de 71,3 GB, incluye pesos en `pytorch_model.bin`, cuatro shards de optimizador con offload a CPU, scheduler, `trainer_state.json`, estados RNG de los 4 rangos, tokenizador/procesador y los contratos de reanudación (`resume_contract.json`, `navigation.json`, `RECOVERY_COMPLETE.json`), además del código exacto de entrenamiento en un tarball byte-idéntico a `git archive 877815e`. Su propósito declarado es continuar el entrenamiento en otro servidor de 4 × H100 80 GB sin alterar ninguna invariante.

Su relevancia es de reproducibilidad e ingeniería de entrenamiento (contratos verificables, orden de episodios determinista, reanudación exacta con ZeRO-2), no de uso como modelo final: no hay evaluaciones publicadas, no se declara licencia y las 1.752 actualizaciones restantes de la época no se han ejecutado en este artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador Qwen3.5-4B (denominado GDN por el autor) con cabeza de estado G3 en la capa 24 (solo entrenamiento) y adaptadores GeoAddress A1 de rango 8 en Q/K, con pérdida de relación KL; destilación online desde VGGT-Omega-1B-512 congelado en FP32 |
| Parametros totales | 4B del modelo base Qwen3.5-4B; parámetros añadidos (4 tensores GeoAddress + cabeza G3) no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (existe una configuración `vln_memory_window8.yaml`, pero no se especifica longitud de contexto del transformer) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en `pytorch_model.bin`; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (manifiesto conjunto R2R + RxR15 en inglés); resto no disponible |
| Licencia | No disponible |
| Formato de pesos | `pytorch_model.bin` + `mp_rank_00_model_states.pt` (checkpoint completo DeepSpeed ZeRO-2 para 4 rangos); sin safetensors |
| Tamaño del repositorio | 71,3 GB |
| Estado del entrenamiento | Update 2.100 / 3.852 (época 0,5452); 1.752 updates restantes |
| Precisión de entrenamiento | No disponible (ZeRO-2 con DeepSpeedCPUAdam; el profesor se ejecuta en FP32 congelado) |
| Dataset | R2R + English RxR15: 30.815 episodios, 3.128.624 pasos |
| Hardware de entrenamiento | Exactamente 4 × H100 80 GB (`--nproc_per_node=4`), ≥ 512 GB de RAM |
| Stack de software | Transformers 5.11.0 (forzado), DeepSpeed, FLA, CUDA 12.9.1, entorno `uv.lock` del autor |

## Arquitectura y entrenamiento

La arquitectura es un decodificador Qwen3.5-4B sobre el que se injertan dos componentes. El primero, G3, realiza lecturas retardadas del estado nativo GDN mediante una cabeza de estado que el autor marca explícitamente como *training-only*, es decir, un mecanismo auxiliar de supervisión y no una pieza prevista para la inferencia final. El segundo, A1 GeoAddress, consiste en adaptadores de rango 8 sobre las proyecciones Q y K con una pérdida de relación KL (λ = 0,1 para ambos objetivos). Ambos se fusionan en la capa 24 del decodificador y se alinean contra un profesor congelado en FP32, `facebook/VGGT-Omega` (`vggt_omega_1b_512.pt`, SHA-256 `c02da418b18bb01d0392598d3f6147366bcde1bb70fd08a5e3bf7925b0667934`), que no se incluye en el repositorio por estar *gated*.

El entrenamiento sigue un decaimiento de una época real sobre el manifiesto conjunto R2R + English RxR15 (30.815 episodios, 3.128.624 pasos): 3.852 updates totales, 116 de warmup, coseno hasta 0,1 × 5e-6, con LR de cabeza 1e-4, LR de adaptadores 5e-5 y rampa de λ completada a lo largo de 771 updates. El batching es de acumulación 2 con batch global 8 sobre 4 rangos, semilla 429 y `EpisodeLengthSampler` (el orden de episodios debe coincidir con `data/r2r_rxr15_train.jsonl`). En el punto de parada se registran 16.800 exposiciones de episodios sin repeticiones, 0 OOM de CUDA, LR 2,533e-6, pérdida media de los últimos 100 updates de 0,155 y pérdidas por par G3/A1 de 0,0139 y 0,348.

## Capacidades

- Navegación visión-lenguaje (VLN) en entornos continuos: seguimiento de instrucciones en lenguaje natural sobre secuencias visuales, evaluable en R2R y RxR.
- Memoria episódica configurable: las configuraciones incluidas (`vln_empty.yaml`, `vln_memory_window8.yaml`) permiten entrenar con y sin ventana de memoria de 8.
- Alineación geográfica de tokens vía adaptadores A1 GeoAddress sobre Q/K, orientada a representaciones espaciales.
- Destilación desde un profesor geométrico 3D (VGGT-Omega), lo que introduce supervisión de estructura de escena durante el entrenamiento.
- Capacidad de reanudación exacta: el *trainer* valida contratos (`resume_contract.json`, `navigation.json`), SHA-256 del manifiesto y estados RNG antes de continuar.
- Generación de texto libre, *tool calling*, modo *thinking*, visión general, audio o capacidades multilingües: no disponibles o no declaradas; el modelo card no las menciona y no hay evaluaciones que las respalden.
- Todas las capacidades anteriores están sin evaluar en este checkpoint (54,5 % de la época); no se han publicado resultados.

## Casos de uso

- Reproducción de experimentos de VLN: reanudar el entrenamiento desde `checkpoint-2100/` en un servidor de 4 × H100 para completar los 1.752 updates restantes, con garantía de que el orden de episodios y los objetivos no cambian.
- Estudio de ablación de G3 frente a A1: la separación de pérdidas por par (0,0139 / 0,348) permite analizar la contribución de la cabeza de estado y de los adaptadores GeoAddress por separado.
- Investigación sobre destilación desde profesores geométricos: sustituir o congelar variantes de VGGT-Omega y medir el efecto de la supervisión 3D en la política de navegación.
- Auditoría de ingeniería de entrenamiento distribuido: el paquete sirve como caso de referencia de reanudación determinista con DeepSpeed ZeRO-2, CPUAdam y 4 rangos, incluido el guardián de memoria de host (`HOST_GUARD_GIB = 0,9 × RAM`).
- Experimentos de memoria episódica: comparar `vln_empty.yaml` con `vln_memory_window8.yaml` para cuantificar el impacto de la ventana de memoria en el éxito de navegación.
- Base para *fine-tuning* posterior de un agente VLN en dominios interiores: partir de los pesos consolidados (tras fusionar los shards) y adaptar a nuevos manifiestos de instrucciones y trayectorias.
- Infraestructura de CI para entrenamiento: usar `prepare_resume.py` y la validación interna del *trainer* como test de integridad de artefactos de 66 GB antes de consumir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card únicamente reporta métricas de entrenamiento en el punto de parada, que no son comparables con evaluaciones de tarea:

| Metrica (entrenamiento) | Valor |
|---|---|
| Updates completados / totales | 2.100 / 3.852 (54,5 %, época 0,5452) |
| Episodios expuestos | 16.800 (sin repeticiones); 14.016 restantes en la época |
| LR en la parada | 2,533e-6 |
| Pérdida media (últimos 100 updates) | 0,155 |
| Pérdida G3 por par (últimos 100 updates) | 0,0139 |
| Pérdida A1 por par (últimos 100 updates) | 0,348 |
| OOM de CUDA | 0 |

No hay valores de MMLU, HumanEval, GSM8K, SR/SPL de R2R ni de RxR en la información proporcionada.

## Requisitos de hardware

- Reanudación del entrenamiento: exactamente 4 GPU H100 de 80 GB; el estado del optimizador está particionado para 4 rangos y el *trainer* rechaza cualquier otro *world size*.
- RAM de host: ≥ 512 GB recomendados; el guardián usa `HOST_GUARD_GIB = 0,9 × RAM` (valor por defecto 691,2 GiB para 768 GB).
- Almacenamiento: 71,3 GB de descarga más unos 66 GB de copia en el directorio de ejecución (evitable con `--copy-mode hardlink` si está en el mismo sistema de ficheros).
- Inferencia: no disponible. Como referencia aritmética, los pesos de un modelo de 4B ocupan aproximadamente 8 GB en bf16 y 16 GB en fp32, a lo que habría que sumar los tensores de los adaptadores y de la cabeza G3.
- GPU de consumo: no confirmado. Por tamaño, un modelo de 4B cabría en GPUs de 24 GB en bf16, pero no se documenta ningún camino de inferencia para este checkpoint.
- Despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI. Se requiere el código `SimpleMemVLN-g3a1-877815e` (no publicado en GitHub), el entorno `uv.lock` del autor con Transformers 5.11.0, DeepSpeed y FLA, y CUDA 12.9.1 vía `G1_CUDA_HOME`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G3A1 (`anhdao69/g3a1_training`) | 4B (base Qwen3.5-4B) + adaptadores no cuantificados | No disponible | No disponible | No disponible | Público en HF; checkpoint intermedio, 0 descargas, 0 likes |
| Qwen3.5-4B (base) | 4B | No disponible | No disponible en esta información | No disponible en esta información | Público (revisión `851bf6e8`) |
| VGGT-Omega-1B-512 (profesor) | 1B | No disponible | No disponible | No disponible; acceso *gated* | Restringido, no incluido en el repo |
| Otros checkpoints VLN abiertos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de licencia de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo utilizable directamente: es un estado intermedio de entrenamiento (54,5 % de la época) y requiere consolidar los shards de DeepSpeed antes de cualquier inferencia.
- Sin licencia declarada: no hay base legal explícita para uso comercial; hay que contactar con el autor.
- El profesor VGGT-Omega está *gated* y no se distribuye; sin él no se puede reproducir el pipeline de entrenamiento tal como se describe.
- Dependencia dura del código: el *trainer* exige el tarball `SimpleMemVLN-g3a1-877815e.tar.gz`, Transformers 5.11.0 y las configuraciones exactas; el código no está en GitHub, solo como *bundle* Git.
- Restricción de hardware estricta: el estado del optimizador está particionado para exactamente 4 rangos; no se puede reanudar con otro número de GPU sin reescribir el estado.
- Solo se modifican tres parámetros específicos del servidor (raíz de imágenes, rutas del profesor y, opcionalmente, `dataloader_num_workers`); cualquier otro cambio invalida la reanudación.
- Idiomas: el entrenamiento es exclusivamente en inglés (R2R + RxR15); no hay evidencia de transferencia a otros idiomas.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; no hay ninguna métrica de calidad de política de navegación publicada.
- El repositorio presenta 0 descargas y 0 likes, y no hay validación externa de la ejecución.
- Las fechas del repositorio (creado y actualizado el 19 de octubre de 2026) no permiten contrastar el estado del arte de Qwen3.5-4B con información independiente en esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anhdao69/g3a1_training
- Modelo base Qwen3.5-4B (ruta de caché del autor `models--Qwen--Qwen3.5-4B`, revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`): https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor VGGT-Omega (acceso restringido): https://huggingface.co/facebook/VGGT-Omega
- Código de entrenamiento: no disponible en línea; incluido en el repo como `source/SimpleMemVLN-g3a1-877815e.tar.gz` y `source/c2_vggt_omega_g3_a1.bundle`
- Paper, blog o demo del modelo: no disponibles
- Búsquedas web: no devolvieron resultados relacionados con el modelo (solo hilos de soporte de un operador de telefonía, sin relación)
