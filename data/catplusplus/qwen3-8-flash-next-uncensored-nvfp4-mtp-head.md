# catplusplus/Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP-head

## Resumen

Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP-head es una coleccion de cabezales drafter de prediccion multi-token (MTP, Multi-Token Prediction) para decodificacion especulativa sobre el modelo base `mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4`. Lo publica el usuario `catplusplus` en Hugging Face y no se trata de un modelo completo, sino de pesos auxiliares que se injertan en el modelo base para acelerar la inferencia. Su relevancia es practica: en hardware NVIDIA Blackwell y Jetson AGX Thor (`sm_110`) eleva el throughput de 14,87 tok/s a 20,67 tok/s, un 39,0 % de mejora en el pico, con tasas de aceptacion del borrador de hasta el 62,2 %.

El repositorio incluye tres variantes del drafter en FP8, NVFP4 y BF16, con tamanos de 2,69 GiB, 1,45 GiB y 4,82 GiB respectivamente, ademas de scripts de injerto, parches del motor vLLM y adaptadores LoRA MoE usados en el entrenamiento. El modelo base es una variante "uncensored" de la familia Qwen3.8 Flash Next, distribuida ya cuantizada en NVFP4.

No se dispone de informacion sobre arquitectura del modelo base, numero de parametros, contexto, licencia ni idiomas en la documentacion proporcionada. La ficha se centra, por tanto, en lo que el repositorio documenta explicitamente: el drafter MTP y su integracion con vLLM V1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal drafter MTP (Multi-Token Prediction) para decodificacion especulativa sobre transformer del modelo base |
| Parametros totales | no disponible (el drafter se distribuye en tres checkpoints; no se indica numero de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada) |
| Tipos de cuantizacion | FP8 (`torch.float8_e4m3fn`), NVFP4 calibrado W4A4, BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model_mtp_tuned.safetensors` en cada variante) |

Tabla de variantes del drafter:

| Directorio | Formato | Tamano | TPS pico | Aceptacion K=1 | Aceptacion K=2 | Uso recomendado |
|---|---|---|---|---|---|---|
| `FP8/` | `torch.float8_e4m3fn` | 2,69 GiB | 20,67 tok/s | 60,0 % | 48,0 % | Produccion y uso diario |
| `NVFP4/` | W4A4 calibrado | 1,45 GiB | 19,88 tok/s | 62,2 % | 39,4 % | Maxima compresion y razonamiento matematico |
| `BF16/` | `bfloat16` puro | 4,82 GiB | 20,09 tok/s | 60,0 % | 41,7 % | Referencia sin comprimir |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base ni del drafter mas alla de su naturaleza MTP. Se trata de un cabezal de prediccion multi-token que se injerta en el modelo base mediante el script `extras/scripts/splice_shadow_model.py`, con modo de enlace configurable (`--link-mode hardlink`). El resultado es un checkpoint "spliced" que se sirve con vLLM V1 usando `--spec-method mtp` y un numero de tokens especulativos (`--spec-tokens`) de 1 o 2.

El entrenamiento del drafter se documenta en `extras/README.md`, que cubre el staging del dataset, la dinamica de la perdida de entrenamiento, la metodologia de calibracion y un analisis empirico comparativo entre variantes. Se incluyen adaptadores LoRA MoE entrenados (`mtp_adapter_best.safetensors`) junto con logs de entrenamiento y estados de checkpoint. La variante NVFP4 emplea cuantizacion calibrada W4A4, lo que explica su menor tamano (1,45 GiB) y su mayor tasa de aceptacion a K=1 (62,2 %) a costa de caer a 39,4 % con K=2. El repositorio tambien empaqueta un archivo del codigo fuente de vLLM (`vllm-qwen4exp-thor.tar.zst`) con historial de commits y parches arquitectonicos del motor documentados en `extras/vllm/VLLM.md`.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa con drafter MTP sobre el modelo base `mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4`.
- Prediccion multi-token con dos modos de operacion: `--spec-tokens 1` para conversacion general y `--spec-tokens 2` para cargas con estructura repetitiva (codigo y JSON).
- Integracion con vLLM V1 mediante `--spec-method mtp` y backend MoE `flashinfer_cutlass`.
- Tres perfiles de precision memoria/velocidad intercambiables (FP8, NVFP4, BF16).
- Soporte de cuantizacion NVFP4 calibrada W4A4 para despliegues con restricciones severas de memoria.
- El modelo base es una variante "uncensored", lo que implica ausencia declarada de filtros de rechazo (sin mas detalle en la documentacion).
- Capacidades de generacion, razonamiento, codigo o tool calling del modelo base: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en produccion sobre Jetson AGX Thor: el drafter FP8 con `--spec-tokens 2` alcanza 20,67 tok/s frente a 14,87 tok/s sin drafter, lo que permite servir cargas de codigo y JSON con un 39,0 % mas de throughput en el mismo hardware.
- Asistentes conversacionales de baja latencia: con `--spec-tokens 1` se obtiene una mejora del 22,5 % (18,21 tok/s) con menor varianza entre prompts, adecuada para chat multi-turno donde la estabilidad importa mas que el pico.
- Despliegue en dispositivos con memoria limitada: la variante NVFP4 ocupa 1,45 GiB y ofrece la mayor aceptacion a K=1 (62,2 %), util en entornos embebidos donde cada gigabyte cuenta.
- Generacion de codigo estructurado: la configuracion K=2 captura gramatica estructural repetitiva y supera los 20 tok/s, apropiada para pipelines que emiten JSON o parches de codigo de forma masiva.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el repositorio incluye scripts de benchmark y logs, lo que permite reproducir la comparativa FP8/NVFP4/BF16 en hardware propio.
- Investigacion sobre cuantizacion de drafters: la variante NVFP4 calibrada W4A4 sirve como caso de estudio de como la compresion agresiva afecta a la tasa de aceptacion segun el valor de K.
- Validacion de parches de motor: el archivo de vLLM incluido permite reproducir el entorno exacto con el que se midieron los resultados en `sm_110`.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en Jetson AGX Thor (`sm_110`):

| Configuracion | Throughput | Mejora vs. baseline |
|---|---|---|
| Sin drafter (baseline) | 14,87 tok/s | — |
| BF16 drafter, K=1 | 18,09 tok/s | +21,7 % |
| NVFP4 drafter, K=1 | 18,02 tok/s | +21,2 % |
| FP8 drafter, K=1 | 18,21 tok/s | +22,5 % |
| FP8 drafter, K=2 | 20,67 tok/s | +39,0 % (JSON/codigo) |

| Variante | Aceptacion K=1 | Aceptacion K=2 |
|---|---|---|
| FP8 | 60,0 % | 48,0 % |
| NVFP4 | 62,2 % | 39,4 % |
| BF16 | 60,0 % | 41,7 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: NVIDIA Blackwell y Jetson AGX Thor (`sm_110`). No se documenta compatibilidad con otras arquitecturas.
- VRAM adicional del drafter: 2,69 GiB (FP8), 1,45 GiB (NVFP4) o 4,82 GiB (BF16), sumados a la memoria del modelo base.
- El modelo base se distribuye cuantizado en NVFP4; el repositorio completo ocupa 10,6 GB.
- GPU de consumo: no disponible. La documentacion solo valida `sm_110`, por lo que no se confirma funcionamiento en RTX 4090 u otras consumer GPU.
- Despliegue: vLLM V1 con `--spec-method mtp`, `--spec-tokens 1|2` y `--moe-backend flashinfer_cutlass`. Se incluye un archivo del codigo fuente de vLLM con los parches necesarios.
- Throughput medido: 14,87 tok/s en baseline y hasta 20,67 tok/s con drafter FP8 y K=2.
- Latencia: no disponible de forma desagregada (solo throughput agregado).

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Throughput | Aceptacion | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP-head (FP8) | Drafter MTP | 2,69 GiB | 20,67 tok/s (K=2) | 60,0 % (K=1) | no disponible |
| Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP-head (NVFP4) | Drafter MTP | 1,45 GiB | 19,88 tok/s | 62,2 % (K=1) | no disponible |
| Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP-head (BF16) | Drafter MTP | 4,82 GiB | 20,09 tok/s | 60,0 % (K=1) | no disponible |
| Qwen3.8-Flash-Next-DSpark (shadowpa0327) | Drafter alternativo | no disponible | reportado como mas rapido por el autor en su configuracion | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni benchmarks de calidad para establecer una comparacion funcional con otros drafters o modelos completos.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base `mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4` y el proceso de injerto previo.
- Validado unicamente en NVIDIA Blackwell y Jetson AGX Thor (`sm_110`); el rendimiento en otras GPU no esta documentado.
- Las mejoras de throughput son especificas de la configuracion del autor; no se garantiza su traslado a otros entornos.
- La variante NVFP4 pierde aceptacion al pasar a K=2 (39,4 % frente a 62,2 % en K=1), por lo que no es la mejor opcion para cargas estructuradas.
- El modelo base es una variante "uncensored": puede generar contenido sin los filtros habituales del modelo original, con los riesgos asociados en produccion.
- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribucion.
- Idiomas soportados no documentados.
- Riesgo de alucinacion y sesgos del modelo base: no evaluado en la informacion disponible.
- Repositorio con 0 descargas y 2 likes: ecosistema de validacion muy reducido, sin evidencia de uso independiente.
- Depende de una version parcheada de vLLM incluida en el repositorio; actualizaciones del motor podrian romper la integracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/catplusplus/Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP-head
- Modelo base: https://huggingface.co/mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Drafter alternativo mencionado: https://huggingface.co/shadowpa0327/Qwen3.8-Flash-Next-DSpark
- Documentacion interna: `extras/README.md`, `extras/vllm/VLLM.md`, `extras/scripts/splice_shadow_model.py` (dentro del repositorio)
