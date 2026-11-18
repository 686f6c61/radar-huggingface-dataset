# r0b0tlab/GLM-5.3-Flash-DFlash2-EXL3-4.00bpw

## Resumen

GLM-5.3-Flash-DFlash2-EXL3-4.00bpw es una cuantizacion de 4 bits del modelo borrador (draft model) `incoai/GLM-5.3-Flash-DFlash2`, desarrollado por Inco AI como componente de decodificacion especulativa para el modelo objetivo `zai-org/GLM-5.3-Flash`. No es un modelo de lenguaje autonomo: genera borradores de tokens a partir de los estados ocultos del modelo objetivo, que posteriormente los verifica. Esta version concreta ha sido producida por el proyecto REXL3 (usuario `r0b0tlab`) reencodeando las 36 capas lineales del checkpoint original bf16 a formato EXL3 con 4.0 bits por peso.

El modelo emplea una arquitectura de difusion por bloques (block-diffusion) denominada DFlash 2, orientada a la generacion paralela de borradores dentro de pipelines de decodificacion especulativa. Con aproximadamente 385 millones de parametros totales y un repositorio de 0.8 GB, su funcion es acelerar la inferencia del modelo objetivo GLM-5.3-Flash reduciendo el numero de pasos de verificacion necesarios.

La relevancia de esta ficha radica en que documenta una pieza de infraestructura de inferencia mas que un modelo generativo: cualquier evaluacion debe centrarse en la tasa de aceptacion del borrador y en la fidelidad de la cuantizacion, no en benchmarks de conocimiento o razonamiento, que no aplican a este tipo de componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (block-diffusion draft model) sobre transformer; 5 capas, 36 capas lineales cuantizadas |
| Parametros totales | 385.051.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4.0 bits por peso (codebook trellis mul1), sin calibracion (Hessiano de entrada identidad); tensores auxiliares en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con grupos EXL3 (`.trellis`, `.suh`, `.svh`, `.mul1`); no carga en SGLang ni transformers upstream |

## Arquitectura y entrenamiento

El modelo original es un draft model de difusion por bloques (DFlash 2) disenado para decodificacion especulativa. En lugar de generar tokens de forma autorregresiva, produce borradores en paralelo a partir de los estados ocultos del modelo objetivo, que luego verifica las propuestas. La arquitectura consta de 5 capas con proyecciones q/k/v/o y gate/up/down, mas una proyeccion de contexto (`fc`), tensores de convolucion dinamica, normas y un selector de candidatos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta version concreta es una cuantizacion post-entrenamiento: las 36 capas lineales se reencodaron a EXL3 con 4.0 bpw mediante el cuantizador REXL3 sin calibracion, y los otros 45 tensores (normas, convoluciones dinamicas y selector de candidatos) se convirtieron a fp16. No se reentreno ningun componente. El error relativo de Frobenius por capa lineal se situa entre 0.0667 y 0.0674 (aproximadamente 23.5 dB de SQNR); a traves de las capas, la proyeccion de contexto presenta un error relativo de 0.067 y las salidas de MLP de 0.11 a 0.14 (coseno entre 0.990 y 0.994). La ida y vuelta de decodificacion es bit-identica para los 36 grupos EXL3, dentro de 7.3e-7 de max|W|. De los aproximadamente 122.5 millones de valores, 48 subnormales bf16 pasaron a cero.

## Capacidades

- Generacion de borradores de tokens en paralelo para decodificacion especulativa (no genera texto de forma autonoma).
- Difusion por bloques: propone multiples tokens por paso a partir de los estados ocultos del modelo objetivo.
- Integracion como draft model en pipelines de verificacion con el modelo objetivo `zai-org/GLM-5.3-Flash`.
- Compatibilidad exclusiva con el cargador de drafts DFlash2 de REXL3; no funciona en SGLang ni transformers upstream.
- No soporta tool calling, agentes, vision ni audio por si mismo; esas capacidades residen en el modelo objetivo.
- Capacidades multilingues: no disponibles (heredadas del modelo objetivo, no evaluadas en este pack).

## Casos de uso

- Aceleracion de inferencia de GLM-5.3-Flash en produccion: el pack se carga como `--draft` en REXL3 para reducir la latencia de generacion del modelo objetivo mediante verificacion especulativa, con un coste de VRAM reducido gracias a los 4.0 bpw.
- Despliegue en hardware con memoria limitada: con 0.8 GB de repositorio, el draft model puede residir junto al modelo objetivo en GPUs donde un draft en bf16 no dejaria espacio suficiente para el modelo principal y el KV cache.
- Servicios de generacion de texto de baja latencia: en asistentes conversacionales o APIs de completado donde el tiempo hasta el primer token y el throughput por usuario son criticos, la decodificacion especulativa con este borrador reduce los pasos autorregresivos del modelo objetivo.
- Investigacion en decodificacion especulativa: permite estudiar el impacto de la cuantizacion a 4 bits en la tasa de aceptacion del borrador frente al original bf16, comparando ambos checkpoints en el mismo pipeline.
- Evaluacion de cuantizadores EXL3/REXL3: sirve como caso de prueba reproducible para medir error de reconstruccion, fidelidad de decodificacion y comportamiento en capas con convolucion dinamica y selectores de candidatos.
- Entornos de desarrollo con una sola GPU consumer: al ocupar menos de 1 GB, el draft puede combinarse con el modelo objetivo cuantizado en estaciones de trabajo con una RTX 4090 o similar, siempre que el modelo objetivo quepa en el resto de la VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se midio la tasa de aceptacion del borrador sobre texto real frente al draft en bf16; las cifras de aceptacion del modelo original estan en la card upstream.

| Metrica de cuantizacion | Valor |
|---|---|
| Error relativo de Frobenius por capa lineal | 0.0667 a 0.0674 (aprox. 23.5 dB SQNR) |
| Error relativo de la proyeccion de contexto | 0.067 |
| Error relativo de salidas MLP | 0.11 a 0.14 (coseno 0.990 a 0.994) |
| Ida y vuelta de decodificacion EXL3 | bit-identica, dentro de 7.3e-7 de max\|W\| |
| Valores bf16 subnormales anulados | 48 de aprox. 122.5 M |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos del draft (repo de 0.8 GB); hay que anadir el overhead del runtime y el espacio para el modelo objetivo y su KV cache.
- GPU recomendadas: el modelo original y este pack fueron medidos en una GB10; cualquier GPU con al menos 1 GB libre adicional respecto al modelo objetivo es suficiente para el draft.
- Cabe en GPU consumer: si, en cualquier GPU con 1 GB libre (RTX 3060 en adelante, RTX 4090, etc.), condicionado a que el modelo objetivo quepa en el resto de la memoria.
- Opciones de despliegue: exclusivamente el runtime REXL3 con su cargador de drafts DFlash2; no es compatible con vLLM, llama.cpp, Ollama, TGI, SGLang ni transformers upstream.
- Latencia y throughput: no disponibles para este pack; la model card no reporta tasas de aceptacion ni aceleracion medida frente al draft bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| r0b0tlab/GLM-5.3-Flash-DFlash2-EXL3-4.00bpw (este) | 385 M | no disponible | EXL3 4.0 bpw | Apache-2.0 | safetensors EXL3 (solo REXL3) |
| incoai/GLM-5.3-Flash-DFlash2 (original) | 385 M | no disponible | bf16 | Apache-2.0 | safetensors (estandar) |
| zai-org/GLM-5.3-Flash (modelo objetivo) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es contra el checkpoint original bf16: este pack reduce el tamano a 0.8 GB con un error de reconstruccion acotado (SQNR de 23.5 dB por capa), pero pierde compatibilidad con runtimes estandar y no tiene mediciones publicadas de tasa de aceptacion. No se dispone de informacion sobre otros draft models comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo GLM-5.3-Flash y el runtime REXL3 no produce salida util.
- Compatibilidad restringida: no carga en SGLang ni transformers upstream; solo funciona con el cargador de drafts DFlash2 de REXL3.
- Tasa de aceptacion no medida: se desconoce si la cuantizacion a 4 bits degrada la aceptacion del borrador frente al bf16 en texto real, lo que afecta directamente a la aceleracion efectiva.
- Perdida de precision en MLP: el error relativo de las salidas MLP (0.11 a 0.14) es notablemente superior al de las capas lineales individuales, lo que puede acumularse a traves de las 5 capas.
- 48 valores bf16 subnormales se convirtieron en cero durante el casteo a fp16; el impacto funcional no esta documentado.
- Cuantizacion sin calibracion (Hessiano identidad): no se ajusto a la distribucion real de activaciones, lo que puede aumentar el error en entradas con colas pesadas.
- Riesgo de alucinacion y sesgos: no evaluados en este componente; dependen del modelo objetivo y del proceso de verificacion.
- Uso comercial permitido por Apache-2.0, con la obligacion de mantener los avisos de atribucion a Inco AI y al proyecto REXL3.
- Repositorio sin descargas ni likes en el momento de la consulta: ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/r0b0tlab/GLM-5.3-Flash-DFlash2-EXL3-4.00bpw
- Modelo base: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio REXL3: https://github.com/REXL3/REXL3
- Blog de Inco AI sobre DFlash 2: https://inco.ai/blog/dflash2/
- Paper DFlash (Chen, Liang, Liu, ICML 2026): no disponible como enlace directo en la informacion proporcionada
