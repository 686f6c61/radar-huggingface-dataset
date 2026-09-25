# seabit-ai/Qwen3.8-27B-DFlash2-4bit

## Resumen

`seabit-ai/Qwen3.8-27B-DFlash2-4bit` es un modelo borrador (draft model) para decodificacion especulativa, no un modelo de lenguaje autonomo. Se trata de la cuantizacion a 4 bits para MLX del drafter DFlash 2 asociado a `Qwen/Qwen3.8-27B`, cuyo origen es `incoai/Qwen3.8-27B-DFlash2` (trabajo de z-lab / Inco AI). Su funcion es proponer bloques de tokens que el modelo objetivo verifica despues, acelerando la generacion sin alterar la salida final.

El repositorio lo publica el usuario `seabit-ai` y no entrena pesos nuevos: unicamente aplica cuantizacion afin de 4 bits (group size 64, 4,5 bits por peso) sobre el drafter en bf16 de 2B parametros, reduciendo el peso de 4,0 GB a 1,1 GB. La relevancia practica esta en esa reduccion de tamano: 3 GB menos de descarga y de memoria residente para el mismo resultado de decodificacion.

Es un componente de infraestructura para despliegues sobre Apple Silicon con MLX. No genera texto por si solo: necesita siempre el modelo objetivo Qwen3.8-27B y un runtime que orqueste el bucle especulativo (`lmk` o `mlx-vlm` 0.6.16 o posterior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador DFlash 2 para decodificacion especulativa (draft model); detalle interno de capas no disponible |
| Parametros totales | 1.924.404.480 (~1,92 mil millones) segun safetensors; el origen en bf16 declara 2B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje autonomo; no procesa contexto propio) |
| Tipos de cuantizacion | 4-bit affine, group size 64, 4,5 bits por peso; el original esta en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa basado en DFlash 2. En este esquema, el borrador propone bloques de tokens de forma rapida y el modelo objetivo (`Qwen/Qwen3.8-27B`) los verifica en paralelo, aceptando o rechazando cada token. El drafter no sustituye al modelo objetivo ni produce respuestas finales: solo alimenta el bucle de verificacion. La informacion disponible no detalla la arquitectura interna del borrador (numero de capas, tipo de atencion ni dimensiones), por lo que ese dato queda como no disponible.

No hay informacion sobre el entrenamiento del drafter en los materiales facilitados. El repositorio es exclusivamente una cuantizacion: parte de `incoai/Qwen3.8-27B-DFlash2` (revision `015e795645c74b1a0eeef3b570031fb62e769bc5`, bf16, 2B parametros) y aplica `mlx_vlm.convert --q-bits 4` con mlx-vlm 0.6.16. El `config.json` es el del origen mas la entrada de cuantizacion. No se declara RLHF, DPO ni dataset de entrenamiento propio para este artefacto.

## Capacidades

- Borrado de bloques de tokens para decodificacion especulativa, verificado despues por el modelo objetivo.
- Reduccion del espacio de memoria del drafter de 4,0 GB (bf16) a 1,1 GB (4-bit) sin perdida de salida.
- Integracion con `lmk` mediante `speculative_decoding: true` y `draft: dflash2`.
- Carga directa en mlx-vlm 0.6.16 o posterior con `load_drafter(...)`, que devuelve `kind == "dflash"`.
- No dispone de generacion de texto autonoma, tool calling, capacidades de agente, vision, audio ni soporte multilingue propio; esas capacidades corresponden al modelo objetivo, no al drafter.

## Casos de uso

- Inferencia local acelerada de Qwen3.8-27B en Apple Silicon: se combina este drafter con el modelo objetivo en MLX para aplicar decodificacion especulativa y mantener la misma salida token a token que el drafter en bf16.
- Equipos con RAM limitada: al ocupar 1,1 GB en lugar de 4,0 GB, libera 3 GB de memoria que pueden destinarse al modelo objetivo o al contexto, en Macs donde el presupuesto de memoria es ajustado.
- Generacion de codigo en local: en las mediciones sobre codigo el drafter mantiene 4,30 tokens aceptados por ronda, por lo que resulta adecuado para asistentes de programacion ejecutados en una Mac sin GPU dedicada.
- Reduccion del tiempo de descarga y del almacenamiento en flotas de desarrollo: el artefacto pesa 1,1 GB frente a 4,0 GB del original, lo que simplifica distribuir la pila de inferencia a varios equipos.
- Servidores de inferencia locales gestionados con `lmk`: la configuracion `model.name: qwen3.8-27b-4bit` junto con `draft: dflash2` levanta la pila completa con `lmk up`.
- Investigacion en decodificacion especulativa: permite reproducir los experimentos exp07 y exp12 del repositorio `github.com/seabit-ai/lmk`, comparando ratios de aceptacion entre el drafter cuantizado y el bf16.
- Sustitucion del drafter en bf16 en despliegues ya existentes de MLX: al ser intercambiable y mantener la salida, sirve como reemplazo directo cuando la memoria es el cuello de botella.

## Benchmarks y rendimiento

Datos medidos por el autor en Apple M3 Ultra (96 GB) contra el drafter original en bf16, con decodificacion greedy y 400 tokens, usando como objetivo `lmstudio-community/Qwen3.8-27B-MLX-4bit`:

| Metrica | 4-bit (este repositorio) | bf16 (original) | Condiciones |
|---|---|---|---|
| Tokens aceptados por ronda en codigo | 4,30 | 4,26 | Greedy, 400 tokens, M3 Ultra 96 GB |
| Salida generada | Identica token a token al original | Referencia | Mismos prompts |
| Velocidad de decodificacion | Sin cambios en ese Mac | Sin cambios | El coste del paso de borrado es computo, no lectura de pesos |
| Tamano en disco / memoria | 1,1 GB | 4,0 GB | Reduccion de 3 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el modelo no es un LLM evaluable de forma independiente.

## Requisitos de hardware

- VRAM/memoria del drafter: 1,1 GB en 4-bit; 4,0 GB en bf16. Hay que sumar la memoria del modelo objetivo Qwen3.8-27B (no especificada en la informacion disponible).
- Plataforma: MLX, es decir, Apple Silicon. No hay soporte CUDA declarado.
- Equipo de referencia de las mediciones: Apple M3 Ultra con 96 GB de memoria unificada.
- Hardware de consumo: el drafter cabe en cualquier Mac moderna; el limite real lo marca el modelo objetivo completo, no el borrador.
- Opciones de despliegue: `lmk` (con `speculative_decoding: true` y `draft: dflash2`) y `mlx-vlm` 0.6.16 o posterior mediante `load_drafter`.
- Latencia y throughput: en el Mac de referencia la velocidad de decodificacion no cambia respecto al drafter bf16; la ganancia declarada es exclusivamente de tamano. No se proporcionan cifras de throughput absoluto.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| seabit-ai/Qwen3.8-27B-DFlash2-4bit | ~1,92B | 1,1 GB | safetensors (MLX) | Apache-2.0 | Cuantizacion 4-bit; mismos 4,30 tokens aceptados por ronda en codigo |
| incoai/Qwen3.8-27B-DFlash2 (origen) | 2B | 4,0 GB | bf16 | Apache-2.0 | Referencia de calidad; 4,26 tokens aceptados por ronda |
| Otros drafters para decodificacion especulativa con Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | No se han facilitado alternativas comparables |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse de forma aislada para generar respuestas; requiere siempre el modelo objetivo Qwen3.8-27B.
- Solo funciona en el ecosistema MLX (Apple Silicon) y con versiones de mlx-vlm 0.6.16 o superiores; no hay soporte para vLLM, llama.cpp, Ollama ni TGI declarado.
- Las mediciones de rendimiento proceden de un unico equipo (M3 Ultra, 96 GB) y de un unico conjunto de prompts; no hay validacion independiente.
- El autor advierte de que en ese Mac la velocidad de decodificacion no mejora: el beneficio es de tamano y memoria, no de latencia.
- No se documentan sesgos, comportamiento multilingue ni riesgo de alucinacion propios, ya que la generacion final la controla el modelo objetivo.
- Licencia Apache-2.0, equivalente a la del origen; los pesos son trabajo de z-lab / Inco AI y este repositorio solo los cuantiza, por lo que conviene respetar la atribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin adopcion ni soporte comunitario documentado.
- El nombre del modelo base `Qwen/Qwen3.8-27B` no aporta informacion verificable en los materiales facilitados; sus especificaciones (contexto, idiomas, tamano) quedan como no disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/seabit-ai/Qwen3.8-27B-DFlash2-4bit
- Drafter de origen: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo objetivo cuantizado usado en las mediciones: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- Herramienta y detalles de los experimentos: https://github.com/seabit-ai/lmk (directorio `research/2026-09-23-speculative-decoding/`, experimentos exp07 y exp12)
