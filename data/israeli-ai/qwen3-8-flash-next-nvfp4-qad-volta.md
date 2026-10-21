# Israeli-AI/Qwen3.8-Flash-Next-NVFP4-QAD-VOLTA

## Resumen

Qwen3.8-Flash-Next-NVFP4-QAD-VOLTA es una conversion de pesos, no un modelo entrenado desde cero. El autor (Israeli-AI) parte del checkpoint cuantizado de NVIDIA `nvidia/Qwen3.8-Flash-Next-FP4-Local`, destilado con cuantizacion (QAD, *quantization-aware distillation*), y lo reempaqueta para que pueda servirse en GPUs Volta (V100, sm_70) mediante la rama SM70 del fork `1Cat-vLLM`. El problema que resuelve es concreto: el release original de NVIDIA usa escalas NVFP4 comprimidas (CSF), atencion MXFP8 y una tabla n-gram PLE en NVFP4 que no cargan ni en sm_70 ni en vLLM estandar.

El modelo tiene 119.602.003.859 parametros (dato real de los safetensors), arquitectura MoE con atencion hibrida (full attention + linear attention), cabezas MTP para decodificacion especulativa y torre de vision, con un contexto configurado de 262.144 tokens. La tabla PLE (n-gram) reside en RAM de host, no en VRAM, lo que permite una cache KV de aproximadamente 317K tokens en 4x V100-SXM2-32GB con TP4.

Su relevancia ahora es de infraestructura: permite conservar la precision QAD de NVIDIA en hardware Volta amortizado, sin abliteration (los pesos son los originales de NVIDIA, sin ediciones de rechazo). El repositorio ofrece dos variantes: `main` (tabla PLE en FP8 E4M3, 126 GiB en disco, compatible con 1Cat-vLLM 1.5.0rc1 sin parchear) y la rama `nvfp4-ple` (PLE original en NVFP4, 106 GiB, requiere un parche Triton).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (atencion completa + linear attention), con cabezas MTP para decodificacion especulativa y torre de vision; clase `qwen4_exp` en vLLM |
| Parametros totales | 119.602.003.859 |
| Parametros activos | no disponible (el autor no publica el numero de expertos ni los parametros activos por token) |
| Longitud de contexto | 262.144 tokens (configurado en el serving de referencia); cache KV de ~317K tokens en 4x V100-32GB |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, MLP de vision, expertos MTP), MXFP8 (attention, linear-attn, expertos compartidos, dequantizados a BF16), FP8 E4M3 (tabla PLE en `main`), NVFP4 row-packed (tabla PLE en rama `nvfp4-ple`), BF16 para tensores dequantizados |
| Idiomas soportados | ingles (`en`) |
| Licencia | `nvidia-open-model-agreement` (tag `license:other`) |
| Formato de pesos | safetensors (206 shards); no se publican GGUF ni otros formatos |
| Tamano en disco | 126 GiB (`main`) / 106 GiB (rama `nvfp4-ple`) |
| Repo en HuggingFace | 164,1 GB |
| Vision | si (`pipeline_tag: image-text-to-text`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un MoE con dos tipos de atencion: capas de atencion completa y capas de linear attention, mas una torre de vision con MLP y merger propios, y cabezas MTP (multi-token prediction) que habilitan decodificacion especulativa. Incluye una tabla de embeddings n-gram denominada PLE, que en el checkpoint de NVIDIA esta en NVFP4 y que en esta conversion se mantiene en el host (offload a RAM fijada) en lugar de VRAM: de ahi que la cache KV pueda crecer hasta ~317K tokens sin competir con la tabla.

El entrenamiento no esta documentado en la informacion disponible: no se indican tokens, composicion del dataset, ni si hubo RLHF o DPO. Lo que si se documenta es el proceso de cuantizacion de NVIDIA (QAD) y el trabajo de conversion de este repositorio: los expertos enrutados en NVFP4 se copian a nivel de nibble con las escalas CSF decodificadas de forma sin perdidas a E4M3; atencion, linear-attn y expertos compartidos en MXFP8 se dequantizan exactamente a BF16; los expertos MTP se dequantizan a un `gate_up_proj` BF16 fusionado (verificado con test de intercambio); embeddings, `lm_head`, atencion MTP y proyecciones PLE se copian tal cual. La validacion reporta 0 desajustes de cabeceras en los 206 shards, 0 valores no finitos y 1 valor saturado de 51.2 mil millones en la tabla PLE FP8. La rama `nvfp4-ple` anade un kernel Triton que recolecta filas NVFP4 de 90 bytes (80 bytes de nibbles E2M1 + 10 escalas de bloque E4M3) directamente desde memoria de host fijada, con salida identica bit a bit a una referencia de CPU sobre 4096 filas aleatorias.

## Capacidades

- Generacion de texto y razonamiento, con modo *thinking* conmutable via `--reasoning-parser qwen3`.
- Generacion de codigo (la prueba de velocidad de decodificacion usa una respuesta de codigo de 1024 tokens).
- Tool calling / function calling: parser `qwen3_coder` y `--enable-auto-tool-choice`; 12/12 en peticiones `get_weather` de un turno y 24/24 con thinking activado.
- Capacidades de agente y razonamiento multi-paso, apoyadas en tool calling y en el contexto de 262K tokens.
- Vision: entrada image-text-to-text, torre de vision conservada con `VLLM_SM70_QWEN4_EXP_VISION=1`; OCR verificado en una imagen de prueba (sobre las builds abliteradas, con pesos de vision identicos a este repo).
- Decodificacion especulativa mediante cabezas MTP (configuracion MTP4 en el banco de pruebas).
- Soporte de prompt largo con prefix caching y hasta 16 imagenes por prompt (`--limit-mm-per-prompt '{"image": 16, "video": 0}'`).
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Reutilizacion de parque Volta existente: el caso de uso central. Un cluster de V100-SXM2-32GB que no puede ejecutar el checkpoint de NVIDIA ni en vLLM estandar puede servir este repositorio con 1Cat-vLLM 1.5.0rc1 en TP4, manteniendo la precision QAD sin recompilar el stack completo.
- Agentes con tool calling en produccion: el modelo emite llamadas a funciones con parser dedicado; con 262K tokens de contexto puede mantener el historial completo de una sesion de agente multi-paso sin truncar.
- Procesamiento de documentos largos con vision: digitalizacion y OCR de documentos de muchas paginas (hasta 16 imagenes por prompt) combinando la torre de vision con el contexto largo, util para extraccion de datos estructurados en back office.
- Generacion de codigo en pipelines: 96,4 tok/s en decodificacion de un solo stream con MTP4 sobre 4x V100 permite integrarlo en revision de codigo o generacion de tests con latencia aceptable, usando tool calling para consultar el repositorio.
- Analisis de repositorios completos: con 262K tokens de contexto y prefix caching se puede cargar un arbol de ficheros y hacer preguntas transversales sin trocear en exceso.
- Atencion al cliente multi-turno en ingles: conversaciones largas con contexto persistente y llamadas a APIs internas (estado de pedido, tickets) mediante function calling.
- Investigacion en cuantizacion: banco de pruebas reproducible para comparar QAD frente a PTQ a igualdad de hardware, con tablas de fidelidad tensorial y scripts de validacion incluidos en el repo.
- Serving on-premise con requisitos de residencia de datos: al ejecutarse en V100 propias, evita depender de APIs externas, condicionado a los terminos de la licencia de NVIDIA.

## Benchmarks y rendimiento

Datos publicados por el autor. Hardware: 4x V100-SXM2-32GB con NVLink, TP4, FP16, decodificacion especulativa MTP4, contexto 262K, `max-num-seqs` 8, 1Cat-vLLM 1.5.0rc1. GSM8K corresponde a las primeras 150 preguntas del test, temperatura 0, thinking desactivado y coincidencia numerica exacta. La prueba de tool calling son 12 peticiones `get_weather` de un turno. La velocidad es la mediana de 6 ejecuciones en un solo stream (respuesta de codigo de 1024 tokens, temperatura 0).

| Checkpoint | GSM8K-150 | Tool calls | Decode (tok/s) |
|---|---|---|---|
| RadixArk/Qwen3.8-Flash-Next-NVFP4 (PTQ, stock) | 146/150 | 12/12 | 92,8 |
| **Este repo, `nvfp4-ple` (QAD)** | **147/150** | **12/12** | **96,4** |
| Referencia: QAD + abliteration, PLE en FP8 | 148/150 | 12/12 | 93,5 |
| Referencia: QAD + abliteration, PLE en NVFP4 | 146/150 | 12/12 | 93,1 |
| Referencia: RadixArk PTQ + abliteration (dealignai) | 145/150 | 12/12 | ~95 |

Las filas en cursiva de la model card son builds abliteradas locales, no publicadas en este repositorio. El autor advierte que una diferencia de ±2 sobre 150 preguntas esta dentro del ruido y que GSM8K-150 es demasiado facil para separar QAD de PTQ. La variante `main` (PLE en FP8) no se evaluo por separado sin abliteration.

Fidelidad tensorial frente a los pesos PTQ de RadixArk (similitud coseno):

| Clase de tensor | Conversion | Cos vs RadixArk PTQ |
|---|---|---|
| Expertos enrutados (NVFP4) | nibbles copiados, escalas CSF decodificadas sin perdidas a E4M3 | 0,996-0,998 |
| Attention / linear-attn / expertos compartidos (MXFP8) | dequant exacto a BF16 | 0,9996 |
| MLP de vision + merger (NVFP4 W4A16) | dequant a BF16 | 0,995 |
| Expertos MTP (NVFP4) | dequant a `gate_up_proj` BF16 fusionado | 0,9955 |
| Embeddings, `lm_head`, atencion MTP, proyecciones PLE | copiados | 1,0000 |
| Tabla n-gram PLE | NVFP4 a FP8 (`main`) / original (`nvfp4-ple`) | 0,995 |

## Requisitos de hardware

- Configuracion de referencia probada: 4x V100-SXM2-32GB con NVLink, tensor-parallel 4, `--dtype float16`, `--gpu-memory-utilization 0.90`. No se publica la VRAM ocupada exacta; el peso en FP4 de 119,6B parametros ronda los 60 GB antes de escalas y overhead (calculo aritmetico, no dato del autor).
- Solo sm_70 (Volta): la conversion esta pensada para la rama SM70 de `1Cat-vLLM`; no carga en vLLM estandar ni con el stack de NVIDIA.
- GPU recomendadas: V100-SXM2-32GB en TP4 como minimo documentado. No hay datos publicados para A100, H100 ni RTX 4090; dado el requisito de sm_70 y de la lane SM70, otras arquitecturas no estan soportadas por esta conversion.
- No cabe en GPU de consumo: requiere 4 aceleradores de 32 GB y 26,8-47,7 GiB de RAM de host fijada para la tabla PLE (segun variante).
- RAM de host para PLE en TP4: 47,7 GiB (11,9 por rango) en `main`; 26,8 GiB (6,7 por rango) en `nvfp4-ple`. En el equipo del autor, la rama NVFP4 redujo el uso de RAM de 82 a 50 GiB sin cambios en velocidad ni VRAM.
- Despliegue: `1Cat-vLLM` 1.5.0rc1 con variables `VLLM_PLE_CPU_OFFLOAD=0`, `VLLM_USE_V2_MODEL_RUNNER=1`, `VLLM_WORKER_MULTIPROC_METHOD=spawn`, `CUDA_DEVICE_MAX_CONNECTIONS=32`, `VLLM_SM70_QWEN4_EXP_ONLINE_QPN8=0`. La rama `nvfp4-ple` exige ademas `patch_ple_nvfp4.py` (comprueba md5 del `ple_layer.py` de 1.5.0rc1, escribe backup `.bak-pre-ple4`) y `VLLM_PLE_CPU_OFFLOAD=0` con ruta de host fijada/UVA.
- No hay soporte documentado para llama.cpp, Ollama ni TGI (no se publican GGUF).
- Throughput: 96,4 tok/s de decodificacion en un solo stream con MTP4 sobre 4x V100; no se publican datos de throughput agregado con `max-num-seqs` alto ni latencias de prefill.
- Capacidad de cache KV: ~317K tokens con la configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K-150 | Tool calls | Decode (tok/s) | Licencia / disponibilidad |
|---|---|---|---|---|---|---|
| **Este repo (`nvfp4-ple`, QAD)** | 119,6B | 262.144 | 147/150 | 12/12 | 96,4 | NVIDIA open model agreement; publico |
| `nvidia/Qwen3.8-Flash-Next-FP4-Local` (base) | no disponible | no disponible | no disponible | no disponible | no disponible | NVIDIA open model agreement; publico |
| `RadixArk/Qwen3.8-Flash-Next-NVFP4` (PTQ, stock) | no disponible | no disponible | 146/150 | 12/12 | 92,8 | no disponible; publico |
| Builds QAD abliteradas (referencia local) | no disponible | no disponible | 146-148/150 | 12/12 | 93,1-93,5 | no publicadas |

El checkpoint base de NVIDIA no puede ejecutarse en sm_70 ni en vLLM estandar segun la model card, por lo que la comparativa practica en Volta se reduce a la variante PTQ de RadixArk y a este repositorio. La diferencia medida es de +1 acierto en GSM8K-150 y +3,6 tok/s, que el propio autor califica de no concluyente.

## Limitaciones y advertencias

- No es un release oficial de NVIDIA: es una conversion de terceros de un checkpoint cuantizado. Cualquier uso en produccion debe validarse contra el comportamiento del original.
- Solo ingles segun la model card; no hay evaluacion multilingue.
- La licencia es `nvidia-open-model-agreement` (no OSI, tag `license:other`): es obligatorio revisar los terminos de uso comercial y redistribucion antes de desplegar; no se detallan restricciones adicionales en la informacion disponible.
- Requiere un fork especifico de vLLM (`1Cat-vLLM` 1.5.0rc1) y, en la rama NVFP4, un parche que modifica un fichero de la instalacion (`ple_layer.py`). Esto complica actualizaciones y anade deuda de mantenimiento.
- La lane SM70 limita el hardware a Volta; no hay soporte documentado para Ampere, Hopper ni Ada.
- Consumo alto de RAM de host por la tabla PLE (26,8-47,7 GiB en TP4), que condiciona el dimensionado del nodo.
- Evaluacion muy reducida: 150 preguntas de GSM8K, 12 peticiones de tool calling y una sola imagen de OCR. El autor reconoce que la muestra no separa QAD de PTQ y que ±2 aciertos es ruido.
- La vision solo se verifico sobre las builds abliteradas, con pesos identicos a este repo, no sobre este checkpoint exacto.
- La variante `main` no se evaluo sin abliteration.
- No se documentan sesgos, datos de entrenamiento ni proceso de alineacion; el riesgo de alucinacion no esta caracterizado y debe asumirse el habitual en modelos de esta familia.
- Al no haber datos de entrenamiento publicados, no es posible auditar la composicion del corpus ni el filtrado.
- 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace (repositorio del modelo): https://huggingface.co/Israeli-AI/Qwen3.8-Flash-Next-NVFP4-QAD-VOLTA
- Rama `nvfp4-ple`: https://huggingface.co/Israeli-AI/Qwen3.8-Flash-Next-NVFP4-QAD-VOLTA/tree/nvfp4-ple
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Checkpoint PTQ de referencia: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Fork de vLLM utilizado: https://github.com/1CatAI/1Cat-vLLM
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
