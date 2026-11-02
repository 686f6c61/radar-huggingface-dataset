# sjoe1244/krea2-turbo-nvfp4-fast-matmul-fix

## Resumen

`sjoe1244/krea2-turbo-nvfp4-fast-matmul-fix` no es un modelo de pesos, sino un repositorio de hallazgo tecnico y un script de correccion (`patchflag.py`) para el modelo de generacion de imagenes Krea 2 Turbo en formato NVFP4 distribuido por Comfy-Org. El autor documenta que el fichero oficial `krea2_turbo_nvfp4.safetensors` incluye en sus metadatos de cuantizacion la marca `full_precision_matrix_mult: true` en las 256 capas cuantizadas, lo que obliga a ComfyUI a descomprimir cada peso a bf16 en cada paso de inferencia y ejecutar un matmul bf16 convencional, desperdiciando el camino FP4 de los tensor cores de quinta generacion.

El resultado medido en una RTX 5080 de 16 GB con ComfyUI 0.42.3 y torch 2.13.0+cu130 es un tiempo de render en caliente de 11,6 s frente a 4,6 s al limpiar el flag, es decir, un factor de aproximadamente 2,5x. El script reescribe unicamente la cabecera JSON del safetensors sin tocar los bytes de los tensores, por lo que la correccion es reversible y de bajo riesgo a nivel de integridad de fichero.

El interes del repositorio es practico para quien despliegue Krea 2 Turbo NVFP4 en ComfyUI sobre GPUs Blackwell (serie RTX 50 y datacenter equivalente): identificar por que el formato NVFP4 no aporta la aceleracion esperada y aplicar un parche de 1 KB que recupera el rendimiento del kernel `comfy_kitchen.scaled_mm_nvfp4`. No incluye pesos, no define arquitectura propia y no publica evaluaciones de calidad de imagen mas alla de una comparacion cualitativa con una sola semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos; se refiere al modelo Krea 2 Turbo en formato NVFP4 de Comfy-Org) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escalas por bloque, formato del fichero referenciado); el parche fuerza el uso del path FP4 en lugar de dequantizar a bf16 |
| Idiomas soportados | no disponible (pipeline text-to-image, prompts en lenguaje natural sin lista de idiomas publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (el repositorio no incluye pesos; el script opera sobre `krea2_turbo_nvfp4.safetensors` y genera `krea2_turbo_nvfp4_fastmm.safetensors`) |

## Arquitectura y entrenamiento

El repositorio no entrena ni redistribuye ningun modelo. Se limita a documentar el comportamiento del fichero `krea2_turbo_nvfp4.safetensors` publicado por Comfy-Org en `Comfy-Org/Krea-2`, un modelo de difusion text-to-image en version Turbo (8 pasos, CFG 1) cuantizado a NVFP4. La innovacion tecnica que describe no esta en la arquitectura del modelo sino en el pipeline de inferencia de ComfyUI: el flag `full_precision_matrix_mult: true` presente en el bloque `_quantization_metadata` de las 256 capas cuantizadas provoca que ComfyUI dequantice los pesos a bf16 en cada paso y ejecute GEMMs bf16 estandar (kernels cutlass `sm80`) en lugar de invocar el kernel NVFP4 nativo.

El autor aporta evidencia de perfilado: en el fichero oficial, el 79 % del tiempo de GPU se consume en GEMMs bf16 y se realizan 2048 llamadas a `dequantize_nvfp4` para 8 pasos. Una medicion directa de `comfy_kitchen.scaled_mm_nvfp4` en la RTX 5080 arroja unos 792 TFLOPS frente a unos 119 TFLOPS de un matmul bf16 de 8192, lo que confirma que el kernel FP4 funciona en esa GPU y driver y que el cuello de botella es la marca de metadatos, no el soporte hardware. El parche reescribe solo la cabecera JSON (los bytes de los tensores se copian sin modificar) y requiere unos 7,6 GB libres para la copia. El text encoder no necesita cambios porque ComfyUI lo ejecuta por diseno con matmul de precision completa y el prompt es una pasada corta.

## Capacidades

- Generacion de imagenes text-to-image mediante el modelo Krea 2 Turbo referenciado (8 pasos, CFG 1, sampler euler_ancestral/beta en las pruebas del autor).
- Aceleracion del matmul cuantizado NVFP4 al eliminar el flag de dequantizacion forzada a bf16, recuperando el path FP4 de los tensor cores de quinta generacion.
- Reescritura selectiva de metadatos de cuantizacion en ficheros safetensors sin alterar los tensores.
- Verificacion de rendimiento reproducible mediante perfilado de GPU (conteo de kernels y llamadas de dequantizacion).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es un parche de rendimiento, no un modelo de lenguaje.
- Compatibilidad declarada con ComfyUI (library_name: comfyui) y con el formato NVFP4 en GPUs que expongan ese camino de tensor cores.

## Casos de uso

- Despliegue de Krea 2 Turbo NVFP4 en ComfyUI sobre RTX 5080: aplicar `patchflag.py` antes de cargar el modelo para reducir el render en caliente de 11,6 s a 4,6 s en 864x1536, 8 pasos y CFG 1, segun la medicion del autor.
- Servicios de generacion de imagenes con latencia ajustada: al eliminar las 2048 llamadas de dequantizacion por render (8 pasos), el tiempo de GPU se concentra en el kernel FP4, lo que permite mayor cadencia por GPU en entornos de inferencia interactiva.
- Auditoria de ficheros NVFP4 de terceros: inspeccionar `_quantization_metadata` para detectar flags `full_precision_matrix_mult` que anulen el beneficio del formato antes de comprometer recursos de produccion.
- Recuperacion de rendimiento en pipelines existentes: sustituir el fichero oficial por la version parcheada sin cambiar prompts, sampler ni resolucion, manteniendo la misma semilla para comparaciones controladas.
- Validacion de soporte hardware/driver: usar la medicion de `scaled_mm_nvfp4` (unos 792 TFLOPS en RTX 5080) como prueba de que el camino FP4 esta operativo antes de atribuir lentitud al modelo.
- Reproduccion de experimentos: el repositorio incluye el script y la configuracion exacta (ComfyUI 0.42.3, torch 2.13.0+cu130, SageAttention, warm run) para replicar la comparativa en otros equipos.

## Benchmarks y rendimiento

| Medicion (RTX 5080 16 GB, ComfyUI 0.42.3, torch 2.13.0+cu130, SageAttention, 864x1536, 8 pasos, CFG 1, euler_ancestral/beta, warm run, misma semilla y prompt) | Tiempo de render en caliente |
|---|---|
| Fichero oficial tal cual | 11,6 s |
| Mismo fichero con el flag limpiado (`patchflag.py`) | 4,6 s |
| Fichero NVFP4 comunitario anterior de Krea 2 Turbo (sin flag) | 4,5 s |

| Medicion de kernel | TFLOPS |
|---|---|
| `comfy_kitchen.scaled_mm_nvfp4` en RTX 5080 | ~792 |
| Matmul bf16 de 8192 | ~119 |

Perfilado del fichero oficial: 79 % del tiempo de GPU en GEMMs bf16 (kernels cutlass `sm80`) y 2048 llamadas a `dequantize_nvfp4` para 8 pasos. No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP, test ciego) en la informacion disponible.

## Requisitos de hardware

- VRAM: el parche no altera el consumo de VRAM del modelo; el fichero NVFP4 sigue ahorrando memoria respecto a bf16. El script requiere unos 7,6 GB libres en disco para la copia del safetensors.
- GPU validadas: unicamente RTX 5080 de 16 GB en la informacion disponible. El autor no ha probado otras GPUs.
- GPUs potencialmente beneficiadas: aquellas con path FP4 de tensor cores de quinta generacion (familia Blackwell); no verificado por el autor en otros modelos.
- Despliegue: ComfyUI 0.42.3 con torch 2.13.0+cu130 y SageAttention, segun la configuracion de las pruebas. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline text-to-image de difusion).
- Latencia: 4,6 s por render en caliente a 864x1536, 8 pasos y CFG 1 en RTX 5080 tras el parche, frente a 11,6 s sin el.
- Throughput: no disponible.

## Comparativa con modelos similares

| Alternativa | Tipo | Formato | Tiempo de render (misma config) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Turbo NVFP4 oficial (Comfy-Org/Krea-2) | Modelo text-to-image cuantizado | NVFP4 con flag de matmul bf16 | 11,6 s | no disponible en la informacion | HuggingFace (Comfy-Org) |
| Krea 2 Turbo NVFP4 comunitario anterior | Modelo text-to-image cuantizado | NVFP4 sin flag | 4,5 s | no disponible en la informacion | no disponible |
| Este repositorio (parche) | Script de correccion de metadatos | safetensors reescrito | 4,6 s | Apache 2.0 | HuggingFace (sjoe1244) |

No se dispone de comparativas con otros modelos de difusion de la misma categoria (SDXL, Flux, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un hallazgo y un script; no puede usarse como modelo por si mismo.
- La validacion de calidad de imagen es minima: una sola semilla comparada lado a lado, sin FID, CLIP ni test ciego. El autor indica que ambas salidas son limpias y del mismo estilo, con composicion ligeramente distinta por la numerica diferente.
- No se ha determinado si el flag `full_precision_matrix_mult` es deliberado (por ejemplo, salvaguarda de calidad para activaciones cuantizadas a FP4). Al limpiarlo, las activaciones tambien pasan por FP4.
- Solo se ha probado en RTX 5080 y ComfyUI 0.42.3; el comportamiento en otras GPUs o versiones de ComfyUI es desconocido.
- Riesgo de alucinacion, sesgos o limitaciones de idioma del modelo subyacente: no evaluados en la informacion disponible.
- Licencia Apache 2.0 aplica al repositorio y al script; la licencia del modelo Krea 2 Turbo subyacente no se detalla en la informacion proporcionada y debe verificarse antes de uso comercial.
- La reescritura de metadatos modifica el fichero original; conviene conservar una copia y validar la integridad del safetensors resultante antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sjoe1244/krea2-turbo-nvfp4-fast-matmul-fix
- Modelo original referenciado: https://huggingface.co/Comfy-Org/Krea-2
