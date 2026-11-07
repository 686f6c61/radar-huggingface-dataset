# CladeTeam/CENO-chlamydomonas-cds

## Resumen

CENO-chlamydomonas-cds es un modelo de lenguaje de ADN desarrollado por CladeTeam, un ajuste fino del modelo base CENO-base-1b-preview, que a su vez deriva de la arquitectura Nemotron-H de NVIDIA. El modelo está especializado en la generación y puntuación de secuencias codificantes (CDS) de la microalga *Chlamydomonas reinhardtii*, y se distribuye con el objetivo declarado de reproducir experimentos de puntuación de secuencias HTT/polyQ.

Con 1.302.429.280 parámetros totales (aproximadamente 1,3 mil millones) y una longitud máxima de entrenamiento de 8192 tokens, el modelo emplea una arquitectura híbrida heredada de Nemotron-H, que combina capas transformer con capas de espacio de estados (Mamba). El ajuste fino se realizó durante una sola época con un learning rate de 5e-5, precisión bf16 y un batch efectivo de 64 sobre 8 GPUs.

La relevancia de este modelo radica en su nicho: la genómica computacional de algas verdes y la evaluación de probabilidad de secuencias de ADN. No obstante, su licencia Apache 2.0 y su naturaleza de checkpoint de investigación lo sitúan como una herramienta para reproducibilidad experimental más que como un modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + Mamba (derivada de Nemotron-H) |
| Parametros totales | 1.302.429.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | dna (secuencias de ADN) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Nemotron-H de NVIDIA, cuya implementación de Transformers fue renombrada en este repositorio (`configuration_ceno.py`, `modeling_ceno.py`) para exponer `CENOForCausalLM` y `CENOCharLevelTokenizer`. La arquitectura es híbrida, combinando atención transformer con capas Mamba; el config incluido establece `use_mamba_kernels=false`, lo que activa el fallback de Mamba en PyTorch puro y evita depender de `mamba-ssm` o `causal-conv1d` para la carga básica. El tokenizador es a nivel de carácter (`CENOCharLevelTokenizer`), adecuado para secuencias de ADN.

El ajuste fino se realizó durante una época sobre CDS de *Chlamydomonas reinhardtii*, con learning rate 5e-5, batch efectivo de 64, precisión bf16, longitud máxima de 8192 y 8 GPUs. Las métricas reportadas muestran un `train_loss` de 9,5529 y un `eval_loss` de 1,1433. No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de secuencias de ADN a nivel de carácter, orientada a CDS de *Chlamydomonas reinhardtii*.
- Puntuación de verosimilitud de secuencias (log-likelihood medio), que es el uso principal declarado para experimentos HTT/polyQ.
- Modelado causal de lenguaje sobre alfabeto de nucleótidos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al dominio `dna`; no se declaran idiomas naturales.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Puntuación de secuencias polyQ/HTT: el modelo calcula log-likelihood medio sobre secuencias, lo que permite comparar variantes en experimentos de reproducibilidad tal como declara el autor.
- Filtrado de CDS sintéticas: generar candidatos de secuencias codificantes y ordenarlos por verosimilitud bajo el modelo antes de validación biológica.
- Anotación asistida de marcos de lectura: usar la probabilidad por carácter para detectar regiones con estadística compatible con CDS en *Chlamydomonas reinhardtii*.
- Reproducción de experimentos publicados: servir como checkpoint de referencia para replicar los resultados de puntuación del equipo CladeTeam.
- Estudio de modelos de lenguaje genómicos: analizar el comportamiento de una arquitectura híbrida Mamba-transformer sobre alfabeto de ADN a nivel de carácter.
- Generación de secuencias de control: producir secuencias sintéticas con estadística similar a CDS de alga para usar como negativos en pipelines de comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas reportadas son de entrenamiento: `train_loss` de 9,5529 y `eval_loss` de 1,1433 tras una época.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y caché; en la práctica se recomienda al menos 8-12 GB para contextos largos.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a gran escala; RTX 4090 o GPUs con 16-24 GB para inferencia con contexto moderado.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más en bf16/fp16 para contextos cortos; para 8192 tokens se recomienda 16 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el stack probado incluye PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. Se menciona vLLM en un entorno separado, sin detallar configuración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-chlamydomonas-cds | 1,30 B | 8192 | ADN (CDS de *Chlamydomonas*) | Apache 2.0 | Hugging Face |
| CENO-base-1b-preview | no disponible | no disponible | ADN (base) | Apache 2.0 (heredada) | Hugging Face |
| Nemotron-H (upstream) | no disponible | no disponible | Texto general | Apache 2.0 | Hugging Face / NVIDIA |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que las puntuaciones de log-likelihood reflejan verosimilitud del modelo de secuencia, no fitness biológico ni patogenicidad.
- La corrección numérica no garantiza generaciones libres de repeticiones ni funcionalmente biológicas.
- El modelo está ajustado a una sola especie (*Chlamydomonas reinhardtii*) y un solo tipo de secuencia (CDS); su generalización a otros organismos no está documentada.
- Riesgo de alucinación en el sentido de generar secuencias sintácticamente plausibles pero biológicamente inviables.
- No se documentan sesgos de composición del dataset de entrenamiento.
- El uso comercial está permitido por la licencia Apache 2.0, pero la idoneidad para producción no está respaldada por evaluaciones publicadas.
- Requiere `trust_remote_code=True` y código remoto personalizado, lo que implica revisar `configuration_ceno.py` y `modeling_ceno.py` antes de desplegar.
- El checkpoint conserva su contrato de inferencia histórico; el autor recomienda usar la revisión actualizada del modelo en lugar de archivos de diagnóstico antiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-chlamydomonas-cds
- Archivos del repositorio: https://huggingface.co/CladeTeam/CENO-chlamydomonas-cds/tree/main
- Repositorio de código y uso actual: https://github.com/CladeTeam/CENO
- Modelo base: https://huggingface.co/CladeTeam/CENO-base-1b-preview
