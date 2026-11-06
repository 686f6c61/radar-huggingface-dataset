# hfsteady/Huihui-Flash-Next-NInfer-W4A4-RTX5090

## Resumen

Huihui-Flash-Next-NInfer-W4A4-RTX5090 es un repositorio experimental publicado por el usuario hfsteady que preserva un runtime de inferencia NInfer compilado para Linux sobre una GPU RTX 5090, junto con los scripts de reproducción para convertir el checkpoint original Huihui-Qwen3.8-Flash-Next-abliterated a pesos de expertos y activaciones NVFP4 calibrados (W4A4). No se trata de un modelo terminado ni de un checkpoint convertido listo para servir: es un artefacto de ingeniería que documenta un piloto de viabilidad de cuantización NVFP4 sobre un modelo de tipo Qwen 3.8 con arquitectura Flash-Next.

El repositorio contiene únicamente el runtime compilado (141 bibliotecas compartidas resueltas, launcher, avisos de licencia y manifiesto de checksums), los scripts de calibración y validación, y las instrucciones de reproducción. El modelo convertido `.ninfer` y el checkpoint calibrado completo no están disponibles todavía; la calibración del checkpoint completo está en curso según la propia model card.

La relevancia es acotada pero específica: demuestra la cadena de herramientas necesaria para llevar un modelo grande (131 shards de pesos, 360.000.188.904 bytes en BF16) a un formato NVFP4 ejecutable en hardware consumer Blackwell (RTX 5090, sm_120a), usando ModelOpt de NVIDIA y un fork de NInfer. Es material de referencia para quien investigue cuantización FP4 en GPUs de consumo, no un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo Qwen 3.8 Flash-Next, detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible (el checkpoint fuente BF16 ocupa 360.000.188.904 bytes en 131 shards) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones en FP4 con calibracion) |
| Idiomas soportados | no disponible |
| Licencia | other (se incluyen avisos de licencia en el bundle; terminos concretos no detallados) |
| Formato de pesos | `.ninfer` (runtime propietario); fuente en BF16 safetensors; conversion a NVFP4 |
| Hardware objetivo | 1x NVIDIA RTX 5090, 32 GB, sm_120a |
| Sistema operativo | Linux x86_64, Ubuntu 24.04, glibc 2.39+ |
| Driver / CUDA | driver host 595.91.07 (CUDA 13.2); toolkit de compilacion CUDA 13.3.1, nvcc 13.3.73, GCC 15 |
| Tamano del repo | 0,6 GB (solo runtime y scripts, sin pesos) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. El checkpoint de origen es `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated` en la revision `298f94632b784e26a7fe576114f82066689d5baa`, lo que sugiere una variante de la familia Qwen 3.8 con arquitectura Flash-Next y un proceso de abliteration (eliminacion de direcciones de rechazo) aplicado por huihui-ai. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

El trabajo tecnico del repositorio es la cadena de cuantizacion: se usa NVIDIA ModelOpt en la revision `c92993cd84e474d92b3851bb633cfb5a56a34e2a` para calibrar pesos de expertos y activaciones a NVFP4 (W4A4) usando el split de entrenamiento de `abisee/cnn_dailymail` config `3.0.0` como dataset publico de calibracion. La inferencia se realiza con un fork de NInfer (`giveen/ninfer-ext`, revision `b6886f67700bc9e3e4937f826edc18d8d7b84f43`), compilado con CUDA 13.3 y GCC 15 porque el codigo fuente fijado requiere C++23 y `<flat_map>`, que CUDA 13.2 nvcc y GCC 13 rechazan. La calibracion se ejecuto con presupuestos de 20 GiB de GPU y 96 GiB de CPU, con el resto offloaded a disco.

## Capacidades

- No se han publicado capacidades verificadas del modelo convertido; el repositorio es un runtime y un conjunto de scripts, no un modelo servible.
- El modelo base (Huihui-Qwen3.8-Flash-Next-abliterated) presumiblemente hereda las capacidades de generacion de texto y razonamiento de la familia Qwen 3.8, pero no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- El runtime NInfer incluye CLI (`ninfer`) y servidor (`ninfer-serve`), pero no se ha validado el servicio de un modelo completo en un pod limpio; segun la model card, esa es una puerta de release pendiente.

## Casos de uso

- Investigacion de cuantizacion FP4 en hardware consumer: el repositorio permite reproducir la conversion de un checkpoint BF16 de gran tamano a NVFP4 W4A4 y medir si cabe y funciona en una RTX 5090 de 32 GB, usando los scripts de `reproduce/` y las recetas de calibracion publicadas.
- Validacion de toolchains CUDA 13.3 / GCC 15: sirve como referencia para proyectos que necesiten compilar codigo C++23 con nvcc 13.3 y verificar compatibilidad con drivers que anuncian CUDA 13.2, ya que el repositorio documenta los problemas concretos (falta de `<flat_map>` en GCC 13, rechazo de C++23 por nvcc 13.2).
- Base para pipelines de conversion propios: los scripts `setup-pilot-pod.sh`, `test-ninfer-build-pod.sh` y `download-source-pod.py` se pueden adaptar para convertir otros checkpoints con ModelOpt y el formato `.ninfer`.
- Auditoria de reproducibilidad: el manifiesto SHA256, la revision inmutable `721d836941b396fda116764a6c3e6d8c89c9ebb8` y los receipts de validacion permiten verificar la integridad del runtime descargado y comparar resultados entre builds.
- Estudio de calibracion con datos publicos: el uso de `cnn_dailymail` como dataset de calibracion permite analizar el impacto de la distribucion de calibracion en la calidad de la cuantizacion W4A4, aunque el autor advierte que no hay scores de calidad del modelo completo.
- Evaluacion de despliegue en pods con GPU: la configuracion documentada (24 vCPU, 188 GB RAM host, 1000 GiB disco, 20 GiB GPU, 96 GiB CPU) sirve como plantilla para dimensionar entornos de calibracion de modelos grandes con offload a disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el upload del runtime no debe interpretarse como evidencia de calidad del modelo, fiabilidad legal o financiera, throughput, precision en contexto largo ni readiness de servicio end-to-end. Los receipts de validacion incluidos son resultados de compatibilidad saneados, no puntuaciones de calidad.

## Requisitos de hardware

- GPU: una NVIDIA RTX 5090 de 32 GB con arquitectura sm_120a. No se califica ninguna otra arquitectura de GPU en el experimento.
- Sistema operativo: Linux x86_64, Ubuntu 24.04, glibc 2.39 o superior.
- Driver host: 595.91.07 (anuncia CUDA 13.2). Los hosts con CUDA 13.3 y 13.4 son candidatos por compatibilidad de driver, pero no se probaron.
- Toolkit de compilacion: CUDA 13.3.1, nvcc 13.3.73, GCC 15.
- Calibracion: presupuestos de 20 GiB de GPU y 96 GiB de CPU, con el resto offloaded a disco; el pod de referencia tenia 24 vCPU, 188 GB de RAM host y 1000 GiB de disco.
- Inferencia del modelo convertido: no disponible; no se ha validado el servicio de un modelo completo en un pod limpio.
- Opciones de despliegue: runtime NInfer propio (CLI `ninfer` y servidor `ninfer-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte que una version de CUDA mas alta no implica una mejora de velocidad medida.

## Comparativa con modelos similares

No disponible. El repositorio no publica comparaciones con otros modelos o runtimes, y no se dispone de datos de rendimiento del modelo convertido para establecer una comparativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo terminado: el checkpoint convertido `.ninfer` y el checkpoint calibrado completo no estan disponibles; la calibracion esta en curso.
- El autor advierte explicitamente de no tratar el upload del runtime como evidencia de calidad del modelo, fiabilidad legal o financiera, throughput, precision en contexto largo ni readiness de servicio end-to-end.
- El fork de NInfer fijado (`giveen/ninfer-ext`) esta retirado upstream; el experimento preserva un build concreto y no implica soporte activo ni superioridad en benchmarks.
- El runtime depende de bibliotecas empaquetadas (C++ estandar mas reciente, runtime CUDA, dependencias multimedia); no se puede copiar solo `ninfer-serve`. glibc base y el driver NVIDIA del host no se incluyen deliberadamente.
- La licencia es "other" con avisos incluidos en el bundle; los terminos exactos para uso comercial no se detallan en la informacion disponible.
- Idiomas soportados, sesgos y riesgo de alucinacion del modelo base no estan documentados en el repositorio.
- El modelo base es una variante "abliterated", lo que implica que se han eliminado direcciones de rechazo; esto puede aumentar la probabilidad de generar contenido no filtrado y requiere evaluacion adicional antes de cualquier uso en produccion.
- La calibracion se realizo con `cnn_dailymail`, un dataset de resumen de noticias en ingles; la distribucion de calibracion puede no representar otros dominios o idiomas.
- El entorno de setup no esta completamente hash-locked offline; las versiones de dependencias resueltas deben conservarse en un build receipt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hfsteady/Huihui-Flash-Next-NInfer-W4A4-RTX5090
- Revision inmutable del runtime: `721d836941b396fda116764a6c3e6d8c89c9ebb8`
- Checkpoint fuente: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated (revision `298f94632b784e26a7fe576114f82066689d5baa`)
- Fork de NInfer: `giveen/ninfer-ext` (revision `b6886f67700bc9e3e4937f826edc18d8d7b84f43`)
- NVIDIA ModelOpt: https://github.com/NVIDIA/Model-Optimizer (revision `c92993cd84e474d92b3851bb633cfb5a56a34e2a`)
- Dataset de calibracion: https://huggingface.co/datasets/abisee/cnn_dailymail (config `3.0.0`, revision `96df5e686bee6baa90b8bee7c28b81fa3fa6223d`)
- SHA256 del archivo de runtime: `4cbcc7f4654eec3c118edf3791b30943ecaaba82fb48f0bc9ae0db6678a98b13`
