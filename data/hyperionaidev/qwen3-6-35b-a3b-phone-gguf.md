# hyperionaidev/Qwen3.6-35B-A3B-phone-GGUF

## Resumen

Qwen3.6-35B-A3B-phone-GGUF es una cuantizacion GGUF del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario hyperionaidev dentro del proyecto smolmaxxing. El objetivo no es otro que ejecutar un modelo MoE de 35B parametros (34.660.610.688 exactos) en un telefono movil de gama media de 2022: un OnePlus Nord CE 2 con SoC MediaTek Dimensity 900, 7,4 GB de RAM (unos 3 GB libres) y Android 13 sin root. Es, por tanto, una ficha de despliegue extremo en el borde, no una nueva arquitectura.

La relevancia tecnica esta en el enfoque de paginacion de expertos: el archivo GGUF pesa 12,3 GB, pero solo unos 1,3 GB de pesos no-expertos residen permanentemente en RAM. Cada capa mantiene 80 de sus 256 expertos en memoria y lee el resto desde el almacenamiento UFS 2.2 cuando el router los selecciona, con precarga de expertos dos capas por delante. Con el parche smolmaxxing se alcanzan 4,9 tok/s sin sesgo de cache (perplejidad 7,63) y hasta 6,0 tok/s aceptando un 2,0 % de degradacion en perplejidad.

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35B parametros totales y 3B activos por token, contexto declarado de 262.144 tokens en los metadatos (ejecutado a 1.024 en el telefono) y licencia Apache 2.0. Esta publicacion concreta es un GGUF estandar, sin tensores ni claves personalizadas, cargable por cualquier llama.cpp con soporte `qwen35moe`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), 40 capas, 256 expertos por capa |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | 3B (segun el nombre A3B del modelo base) |
| Longitud de contexto | 262.144 tokens en metadatos; 1.024 tokens en la ejecucion movil documentada |
| Tipos de cuantizacion | Expertos en Q2_K (imatrix, i1-Q2_K_S); resto de tensores en Q4_K; cabeza de salida completa (248.320 filas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`q36-q2-full.gguf`, 12.348.766.912 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 40 capas, 256 expertos por capa y 3B parametros activos por token sobre un total de 35B. La model card de esta cuantizacion no detalla el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esos datos corresponden al modelo original Qwen/Qwen3.6-35B-A3B y no se reproducen aqui. El router reparte la probabilidad de softmax entre los 256 expertos, lo que condiciona directamente la estrategia de paginacion.

La innovacion de esta publicacion es el empaquetado y el runtime, no el entrenamiento. Los expertos se cuantizan a Q2_K con imatrix (copiados sin cambios de mradermacher/Qwen3.6-35B-A3B-i1-GGUF, donde `ffn_down_exps` queda en Q4_K en 5 de las 40 capas) y todos los tensores no-expertos, incluida la atencion completa, se recuantizan a Q4_K con la imatrix del autor. El layout coloca los expertos al final: primero van los 1,3 GB no-expertos y despues cada experto (gate, up, down) ocupa unos 1,03 MB. El parche smolmaxxing anade un paginador de expertos con pool configurable, precarga (`GGML_MOE_PREFETCH_AHEAD=2`), hilos lectores y un sesgo de cache (`GGML_MOE_BIAS`) que empuja al router hacia expertos ya residentes en RAM. El archivo se construyo sin almacenarlo completo, ensamblando tensores de dos fuentes mediante peticiones HTTP range y transmitiendolo al telefono por adb.

## Capacidades

- Generacion de texto conversacional en ingles y codigo, segun el conjunto de evaluacion usado (texto ingles + codigo).
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B.
- Soporte de modo razonamiento del runtime (`--reasoning off` en el ejemplo de servidor), desactivable por latencia.
- Servidor compatible con la API de llama.cpp (`llama-server`) en el puerto 8090, con endpoints compatibles.
- Ejecucion en CPU pura sobre aarch64, sin GPU ni aceleradores, con kernels especificos para Cortex-A78/A55 (repack cache).
- Contexto efectivo limitado a 1.024 tokens en el escenario movil documentado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Asistente conversacional offline en telefono de gama media: el modelo responde a 4,9-6,0 tok/s con un pico de RSS de 4,8-5,2 GB, suficiente para chat de texto sin conexion en un dispositivo con 3 GB libres y sin root.
- Demostracion e investigacion de paginacion de expertos: sirve para medir el impacto del sesgo de cache en la relacion velocidad/perplejidad (0,005 reduce los fallos de cache del 10,8 % al 7,4 % con solo +0,7 % de perplejidad).
- Pruebas de concepto de LLM en hardware de borde: valida que un MoE de 35B puede servirse desde UFS 2.2 con 1,3 GB de pesos calientes en RAM, util para disenar productos empotrados.
- Evaluacion de cuantizacion agresiva Q2_K en expertos: permite estudiar la degradacion real de un modelo MoE con expertos a 2 bits y el resto a 4 bits frente a alternativas como Q2_K_S completas.
- Generacion de codigo y texto en entornos air-gapped: al ser un GGUF estandar con licencia Apache 2.0, puede desplegarse en dispositivos aislados sin dependencias de red.
- Benchmarking de kernels ARM: el repack cache para A55/A78 y la afinidad `-t 2 -C 0xC0 --cpu-strict 1` permiten comparar configuraciones de hilos y confirmar que anadir los nucleos lentos empeora el rendimiento.

## Benchmarks y rendimiento

Medido en un OnePlus Nord CE 2 (Dimensity 900, 2x Cortex-A78 + 6x Cortex-A55, 7,4 GB RAM, UFS 2.2, Android 13), 2 hilos en los nucleos A78, 80 expertos por capa en RAM, precarga a 2 capas, 2 prompts x 160 tokens, repeat penalty 1,15. Perplejidad sobre 20 fragmentos de 128 tokens de texto ingles + codigo retenido (2.560 tokens evaluados).

| Sesgo de cache | tok/s | Perplejidad | vs sin sesgo | Fallos de cache |
|---|---|---|---|---|
| 0 (calidad completa) | 4,9 | 7,63 | ±0 | 10,8 % |
| 0,005 (recomendado) | 5,7 | 7,68 | +0,7 % | 7,4 % |
| 0,01 | 6,0 | 7,78 | +2,0 % | 5,1 % |

- Prompt: aproximadamente 4,5 tok/s.
- Desglose del tiempo con sesgo 0,01: 41 % lectura de pesos no-expertos desde RAM (13,9 GB/s), 21 % espera por expertos fallidos, 19 % matmuls de expertos.
- Pico de RSS: 4,8-5,2 GB, con al menos 1 GB libre.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. RAM necesaria: aproximadamente 4,9 GB de pico con pool de 80 expertos por capa (cada paso de `GGML_MOE_POOL` equivale a unos 41 MB).
- Almacenamiento: 12,3 GB para el GGUF; se recomienda flash rapida (UFS 2.2 o superior) porque los expertos no residentes se leen de disco.
- GPU: no se usa GPU. El escenario documentado es un SoC ARM movil (MediaTek Dimensity 900); el proyecto incluye guia para TV-box y build estatico aarch64.
- Cabe en telefono de gama media con unos 3 GB de RAM libre y Android 13 sin root; sin el parche smolmaxxing los 12,3 GB se mapean en memoria y el rendimiento cae drasticamente.
- Despliegue: llama.cpp parcheado (build estatico aarch64), `llama-server` con `GGML_MOE_PAGER=1`, `GGML_MOE_POOL=80`, `GGML_MOE_BIAS=0.005`, `GGML_MOE_PREFETCH_K=8`, `GGML_MOE_PREFETCH_AHEAD=2`, `GGML_MOE_READERS=8`, `-c 1024 -fa on -ctk q8_0 -ctv q8_0 -ub 4 -b 64 -t 2 -C 0xC0 --cpu-strict 1`.
- Latencia y throughput: 4,9-6,0 tok/s de generacion y unos 4,5 tok/s de prompt en el hardware citado; en otros dispositivos depende de los nucleos grandes y de la velocidad de flash.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyperionaidev/Qwen3.6-35B-A3B-phone-GGUF | 35B totales, 3B activos | 262.144 (1.024 en movil) | Q2_K expertos + Q4_K resto | Apache 2.0 | Hugging Face, 12,3 GB |
| mradermacher/Qwen3.6-35B-A3B-i1-GGUF | 35B totales, 3B activos | No disponible | i1-Q2_K_S, i1-Q4_K_M | Apache 2.0 | Hugging Face |
| hyperionaidev/Qwen3-Next-80B-A3B-phone-GGUF | 80B totales, 3B activos | No disponible | GGUF para telefono | No disponible | Hugging Face |

La diferencia frente a mradermacher esta en que aqui toda la atencion va en Q4_K (frente a Q2_K en buena parte de ella en el Q2_K_S original) a cambio de 0,2 GB mas, y en el layout con expertos al final, optimizado para paginacion desde flash. El hermano de 80B del mismo autor aplica la misma tecnica a un modelo mayor.

## Limitaciones y advertencias

- La velocidad de 4,9-6,0 tok/s exige el parche smolmaxxing; con llama.cpp estandar el archivo se mapea entero y el telefono con 3 GB libres sera mucho mas lento.
- El contexto practico en el escenario documentado es de 1.024 tokens, muy por debajo de los 262.144 declarados en metadatos.
- El sesgo de cache degrada la calidad: 0,005 cuesta +0,7 % de perplejidad y 0,01 cuesta +2,0 %; 0,02 cuesta un 7 %.
- La cabeza de salida se mantiene completa porque una version podada a 60K filas producia errores (escribia "palinate" por "palindrome"); podarla acelera un 3 % pero rompe la calidad.
- La cuantizacion Q2_K en expertos es agresiva y puede afectar a tareas sensibles a precision; no hay benchmarks estandar publicados que cuantifiquen esa perdida.
- El conjunto de evaluacion es texto ingles + codigo; el rendimiento en otros idiomas, incluido el castellano, no esta medido ni documentado.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en esta publicacion.
- Licencia Apache 2.0, igual que el modelo original, sin restricciones adicionales conocidas para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; soporte de la comunidad nulo y un unico dispositivo de referencia validado.

## Enlaces

- Hugging Face: https://huggingface.co/hyperionaidev/Qwen3.6-35B-A3B-phone-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Fuente de expertos Q2_K: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-i1-GGUF
- Hermano de 80B: https://huggingface.co/hyperionaidev/Qwen3-Next-80B-A3B-phone-GGUF
- Repositorio smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Pagina del telefono: https://github.com/hyperionaidev/smolmaxxing/blob/main/docs/phone.md
- Write-up completo (EXPERIMENT.md §22): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Script de construccion: https://github.com/hyperionaidev/smolmaxxing/blob/main/tools/q36-phone.sh
- Guia de build para TV-box: https://github.com/hyperionaidev/smolmaxxing/blob/main/docs/tv-box-setup.md
