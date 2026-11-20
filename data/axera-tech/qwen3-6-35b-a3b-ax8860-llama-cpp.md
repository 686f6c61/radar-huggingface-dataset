# AXERA-TECH/Qwen3.6-35B-A3B-AX8860-llama.cpp

## Resumen

Qwen3.6-35B-A3B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo Qwen3.6-35B-A3B (un transformer de mezcla de expertos con 35.505.528.224 parametros totales y aproximadamente 3B activos) sobre la NPU del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con kernels ggml-axera. No es un modelo nuevo: es una distribucion optimizada del modelo base de Qwen, cuantizado en NVFP4 y empaquetado junto con los binarios estaticos, los kernels de NPU y scripts de ejecucion para hardware de borde.

El interes practico esta en que demuestra inferencia de un MoE de 35B con ventana de hasta 262.144 tokens en un chip de borde, con decodificacion especulativa MTP (multi-token prediction) y soporte de entrada de imagen a traves de un codificador visual separado. Las cifras publicadas por el autor son de 76,4 tokens/s en decodificacion (hasta 86,8 tokens/s con MTP adaptativo) y 5.276 tokens/s de prefill para un prompt de 4k.

Es relevante para quienes evaluan despliegues de LLM en dispositivos sin GPU dedicada: el repositorio incluye pesos GGUF (20,5 GB), codificador visual (903 MB), kernels y scripts, todo reproducible con `sh bench.sh`. La contrapartida es que el formato NVFP4 con tensores `.scale` en F32 solo lo carga esta bifurcacion concreta; llama.cpp upstream no lo soporta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) segun el modelo base Qwen3.6-35B-A3B; inferencia via llama.cpp con backend ggml-axera (NPU AX8860) |
| Parametros totales | 35.505.528.224 |
| Parametros activos | Aproximadamente 3B (denominacion A3B del modelo base) |
| Longitud de contexto | Hasta 262.144 tokens (por defecto 16.384 en el servidor; configurable con `CTX`) |
| Tipos de cuantizacion | NVFP4 (bloques NVFP4 con tensores `.scale` en F32); codificador visual en BF16; KV cache en FP8 (E4M3) |
| Idiomas soportados | No disponible (la model card no detalla cobertura linguistica; el modelo base Qwen3.6 es multilingue, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | GGUF (`qwen3.6-35b-a3b-nvfp4.gguf`, 20,5 GB; `mmproj-qwen3.6-35b-a3b-bf16.gguf`, 903 MB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer de mezcla de expertos con 35,5B parametros totales y unos 3B activos por token. Esta distribucion no aporta informacion sobre el corpus de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; la model card solo documenta el empaquetado y la optimizacion para hardware. El modelo acepta entrada de texto e imagen, con un codificador visual BF16 servido como GGUF separado.

La innovacion tecnica esta en el runtime: una bifurcacion de llama.cpp con kernels ggml-axera que aprovecha los 4 nucleos de NPU del AX8860, decodificacion especulativa MTP (hasta 3 borradores por ronda, activacion adaptativa por contenido con `--spec-type draft-mtp`), cache de prompt en 4 GB de memoria host, 8 checkpoints de contexto rotativos (`-ctxcp 8`) y un kernel opcional de codificador visual a 640x480 que reduce la latencia de codificacion de imagen de 277 ms a 116 ms. El servidor expone una API compatible con OpenAI y usa la plantilla de chat original de Qwen3.6, relajando unicamente la restriccion de mensajes `system` a mitad de conversacion.

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo de pensamiento desactivable (el servidor arranca con `--reasoning off`).
- Entrada de imagen: descripcion y analisis visual mediante el codificador `mmproj` BF16, con variante de kernel 640x480 para menor latencia.
- Generacion de codigo, traduccion, resolucion de matematicas y tablas Markdown (escenarios medidos por el autor en la tabla de MTP).
- Decodificacion especulativa MTP adaptativa por peticion, con tasas de aceptacion documentadas de hasta 0,752 en codigo.
- Servidor compatible con la API de OpenAI, apto para clientes de agentes (se menciona explicitamente Codex y la aceptacion de mensajes `system` intermedios).
- Contexto largo de hasta 262.144 tokens con cache KV en FP8 y checkpoints rotativos.
- Soporte multilingue: no disponible en la documentacion (se observan pruebas en chino e ingles).

## Casos de uso

- Inferencia de borde en dispositivos Axera AX8860: el paquete incluye binarios estaticos y kernels listos para ejecutar con `sh run.sh`, lo que permite desplegar un MoE de 35B en un SoC sin GPU.
- Asistente conversacional local con contexto largo: con 262.144 tokens y cache de prompt de 4 GB, se pueden mantener sesiones extensas o procesar documentos completos en el propio dispositivo.
- Procesamiento de documentos con imagenes: el codificador visual permite describir capturas, formularios o fotografias; la variante 640x480 reduce la latencia a 116 ms por imagen cuando el detalle fino no es critico.
- Generacion de codigo en entornos aislados: los escenarios de codigo alcanzan 86,8 tokens/s con MTP adaptativo y 96,9 tokens/s forzado, con aceptacion de 0,752, adecuado para autocompletado o generacion de parches en local.
- Traduccion automatica chino-ingles y otros pares: el autor mide 76 tokens/s en traduccion, con una tasa de aceptacion MTP de 0,598.
- Backend para agentes con tool calling: al ser compatible con OpenAI y aceptar mensajes `system` intermedios, se puede conectar a frameworks de agentes que requieran ese formato.
- Analisis de tablas y datos estructurados: el escenario de tablas Markdown alcanza 83,1 tokens/s con MTP adaptativo, util para extraccion y reformateo de datos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (unidades en tokens/s; hasta 256 tokens generados, decodificacion voraz salvo indicacion):

| Escenario | Sin MTP | MTP adaptativo | MTP forzado | Aceleracion | Tasa de aceptacion |
|---|---:|---:|---:|---:|---:|
| Codigo | 76,9 | 86,8 | 96,9 | 1,13x | 0,752 |
| Traduccion (chino-ingles) | 76,0 | 75,9 | 80,2 | 1,00x | 0,598 |
| Tabla Markdown | 76,8 | 83,1 | 87,9 | 1,08x | 0,646 |
| Matematicas | 76,8 | 84,1 | 86,2 | 1,09x | 0,699 |
| Ensayo en chino | 77,5 | 77,8 | 61,0 | 1,00x | 0,320 |
| Relato en ingles | 76,3 | 76,7 | 60,4 | 1,00x | 0,365 |
| Codigo con muestreo | 46,6 | 45,0 | 50,8 | 0,97x | 0,556 |
| Ensayo en chino con muestreo | 44,1 | 47,1 | 39,4 | 1,07x | 0,357 |

Rendimiento de prefill y decodificacion (`sh bench.sh`, 128 tokens generados):

| Prompt | Contexto (`-c`) | Tiempo de prompt | Decodificacion |
|---|---:|---:|---:|
| 5 tokens | 8192 | 0,16 s | — |
| 47 tokens | 8192 | 0,23 s | — |
| 3908 tokens | 8192 | 0,74 s | 74,0 tokens/s |
| 5 tokens | 262144 | 0,16 s | — |
| 47 tokens | 262144 | 0,23 s | — |
| 3908 tokens | 262144 | 0,74 s | 73,8 tokens/s |

Metricas de calidad publicadas: perplejidad en chino sobre conjunto interno (`-c 512 --chunks 20`) de 17,1751 ± 0,73694 con `-ub 1` y 17,1148 ± 0,73427 con `-ub 4`; el Qwen3.5-35B-A3B en la misma placa da 18,6744 / 18,6075. Coste de cuantizacion en el mismo fichero: bf16 en CPU 15,94, NVFP4 en CPU 16,78 (+5,3%), en placa 17,18 (+2,4% respecto al mismo peso en CPU). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior; el runtime ocupa los 4 nucleos de NPU de forma exclusiva.
- Memoria: pesos de 20,5 GB (NVFP4) mas 903 MB del codificador visual; cache de prompt en 4 GB de memoria host; cache KV en FP8.
- No esta pensado para GPU de consumo: el formato NVFP4 con tensores `.scale` solo lo carga esta bifurcacion de llama.cpp; upstream no lo soporta.
- Despliegue: scripts `run.sh` (texto, imagen, chat, servidor) y `bench.sh`; servidor compatible con OpenAI con `-np 1` por defecto.
- Latencia y throughput medidos: 76,4 tokens/s de decodificacion base, hasta 86,8 tokens/s con MTP adaptativo; prefill de 5.276 tokens/s; codificacion de imagen de 277 ms (default) o 116 ms (kernel 640x480).
- `llama-bench` disponible en la placa con `-b 4096 -ub 4096`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-AX8860 (este) | 35,5B totales, ~3B activos | 262.144 | 76,4 tokens/s decodificacion en AX8860; MTP hasta 86,8 | No disponible | Hugging Face, requiere AX8860 |
| Qwen3.6-35B-A3B (base) | 35,5B totales, ~3B activos | No disponible en esta informacion | No disponible | No disponible | Hugging Face (Qwen) |
| Qwen3.5-35B-A3B en AX8860 | 35B totales, ~3B activos | No disponible | PPL en chino 18,6744 / 18,6075 | No disponible | Referencia del propio autor en la misma placa |

## Limitaciones y advertencias

- Dependencia de hardware y fork: el GGUF NVFP4 solo lo carga esta bifurcacion; llama.cpp upstream falla. No es portable a GPU estandar ni a otros SoC sin trabajo adicional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base Qwen3.6-35B-A3B antes de produccion.
- Cobertura de idiomas no documentada: las pruebas del autor se centran en chino e ingles; el rendimiento en castellano no esta medido.
- Modo de pensamiento desactivado por defecto en el servidor (`--reasoning off`), lo que puede reducir la calidad en tareas de razonamiento complejo si no se reactiva.
- Las peticiones voraces deben enviar `presence_penalty: 0`; de lo contrario se desactiva el greedy fusionado y el MTP adaptativo no se activa.
- Fallo intermitente documentado: en algunos entornos, peticiones consecutivas devuelven `ret = -3`; el autor recomienda reintentar.
- Perdida de calidad por cuantizacion: +5,3% de perplejidad respecto a bf16 en el mismo fichero chino, y +2,4% adicional en placa respecto al mismo peso en CPU.
- El kernel de imagen 640x480 reduce el detalle en imagenes grandes al reescalarlas, con menor fidelidad que el codificador por defecto.
- Riesgo de alusiones y sesgos del modelo base: no se documentan evaluaciones de sesgo ni de alucinacion en esta distribucion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.6-35B-A3B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
