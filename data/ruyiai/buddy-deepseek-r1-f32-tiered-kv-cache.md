# RuyiAI/buddy-deepseek-r1-f32-tiered-kv-cache

## Resumen

`RuyiAI/buddy-deepseek-r1-f32-tiered-kv-cache` no es un modelo nuevo: es un paquete binario `.rax` cross-compilado para la arquitectura RISC-V (riscv64), distribuido por la organizacion RuyiAI (RuyiAI RISC-V AI Software Stack) y pensado para ejecutarse sobre el runtime `buddy-cli` del proyecto buddy-mlir. El modelo subyacente es `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un modelo de razonamiento destilado de la familia DeepSeek-R1.

El artefacto empaqueta los pesos en precision f32 junto con una cache KV jerarquizada (tiered KV cache), y esta compilado para un objetivo riscv64 generico (cualquier VLEN, sin extensiones Zfh/Zvfh). El repositorio ocupa 7,1 GB y su nombre de version es el commit `60f354a`. Su proposito es permitir la inferencia local de un modelo de razonamiento de 1.5B de parametros en hardware RISC-V, un nicho relevante para despliegues en el borde (edge) y en placas sin aceleradores propietarios.

La relevancia de esta ficha radica en que documenta un artefacto de despliegue, no un checkpoint entrenado: la mayor parte de las especificaciones de arquitectura y entrenamiento deben atribuirse al modelo original de DeepSeek, mientras que los detalles propios del paquete (formato, runtime y objetivo de compilacion) son los que aporta RuyiAI. La informacion publica disponible sobre este repositorio concreto es minima, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el paquete; el modelo original es un transformer destilado de DeepSeek-R1 (base Qwen) |
| Parametros totales | 1.5B (segun el modelo original DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | pesos en f32 (precision completa, segun el nombre del artefacto) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el paquete; el modelo original DeepSeek-R1 se publica bajo licencia MIT segun la nota de release de DeepSeek |
| Formato de pesos | `.rax` (paquete binario para el runtime `buddy-cli`) |
| Tipo de artefacto | Paquete cross-compilado para RISC-V (riscv64) |
| Objetivo de compilacion | riscv64 generico (cualquier VLEN, sin Zfh/Zvfh) |
| Version | `60f354a` (commit fuente `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`) |
| Cache KV | jerarquizada (tiered KV cache) |
| Runtime requerido | `buddy-cli` (buddy-mlir) |
| Tamano del repositorio | 7,1 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del paquete ni del modelo original mas alla de su identificacion como destilacion de DeepSeek-R1 (`DeepSeek-R1-Distill-Qwen-1.5B`). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de ajuste (RLHF, DPO u otras). El proceso de destilacion de la familia DeepSeek-R1 se documenta en el repositorio y la nota de release de DeepSeek, que indican que DeepSeek-R1 incorpora datos de arranque en frio antes del aprendizaje por refuerzo para mejorar la legibilidad y reducir la mezcla de idiomas y las repeticiones.

Lo especifico de este artefacto es la cadena de compilacion: los pesos se empaquetan en f32 e incluyen una cache KV jerarquizada, y todo se cross-compila a riscv64 mediante el flujo de buddy-mlir (proyecto `buddy-compiler/buddy-mlir`, ejemplo `BuddyDeepSeekR1`). El objetivo declarado es riscv64 generico con cualquier VLEN y sin dependencia de las extensiones de punto flotante Zfh ni Zvfh, lo que amplia la compatibilidad con nucleos RISC-V que no implementan esas extensiones de media precision. No se dispone de detalles sobre tecnicas adicionales como decodificacion especulativa o atencion lineal en este paquete.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo destilado `DeepSeek-R1-Distill-Qwen-1.5B`, orientado a tareas de razonamiento paso a paso.
- Razonamiento matematico y de codigo: la familia DeepSeek-R1 se posiciona en tareas de matematicas, codigo y razonamiento.
- Ejecucion local en RISC-V: la capacidad diferencial del artefacto es poder ejecutarse sobre hardware riscv64 mediante `buddy-cli`.
- Inferencia con cache KV jerarquizada: el paquete incluye una gestion por niveles de la cache KV, aunque no se detallan sus parametros (tamano de bloque, politica de expulsion).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no se declaran en el repositorio).
- Capacidades especiales (vision, audio, modo de pensamiento explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en placas RISC-V: desplegar un modelo de razonamiento de 1.5B directamente sobre hardware riscv64 sin GPU propietaria, usando `buddy-cli` con el paquete `.rax` y el comando `buddy-cli --model ... --prompt "..."`.
- Prototipado en el borde: validar pipelines de IA generativa en dispositivos embebidos o SBC RISC-V donde no es viable ejecutar runtimes de GPU convencionales.
- Investigacion en compiladores: utilizar el paquete como caso de prueba del flujo de cross-compilacion de buddy-mlir hacia riscv64 generico, comparando con otras variantes compiladas.
- Razonamiento asistido de bajo coste: emplear el modelo destilado para tareas de razonamiento y matematicas donde no se requiere un modelo de gran tamano y se prioriza el consumo reducido.
- Evaluacion de cache KV jerarquizada: estudiar el comportamiento de la `tiered KV cache` en cargas de contexto variable sobre hardware RISC-V.
- Entornos aislados o sin conectividad: al ser un paquete descargable y ejecutable localmente, sirve para despliegues offline donde no se puede recurrir a APIs en la nube.
- Educacion y docencia: demostrar el ciclo completo de descarga, instalacion del runtime y ejecucion de un modelo de lenguaje en RISC-V.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia/throughput, y la model card unicamente describe el proceso de descarga, instalacion y ejecucion.

## Requisitos de hardware

- Arquitectura objetivo: riscv64 generico, con cualquier VLEN y sin requerir las extensiones Zfh ni Zvfh.
- VRAM / memoria: no disponible. El paquete ocupa 7,1 GB, pero no se especifica la huella en memoria durante la inferencia ni el impacto concreto de la cache KV jerarquizada.
- GPU: no aplica en el objetivo declarado (RISC-V); no se proporcionan requisitos de aceleradores NVIDIA o AMD.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el artefacto esta orientado a RISC-V.
- Opciones de despliegue: `buddy-cli` (runtime de buddy-mlir), instalable mediante el script oficial `install_buddy_cli.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros paquetes comparables de la misma organizacion o de terceros, ni datos de rendimiento que permitan establecer una comparacion cuantitativa. Como referencia cualitativa, el modelo original `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` es la alternativa directa en formato de pesos estandar (safetensors) frente a este paquete cross-compilado a RISC-V.

| Modelo | Parametros | Formato | Objetivo | Licencia |
|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-f32-tiered-kv-cache | 1.5B (base) | `.rax` | riscv64 + `buddy-cli` | no disponible |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | safetensors | GPU / CPU convencional | MIT (segun DeepSeek) |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de despliegue, no modelo nuevo: hereda todas las limitaciones del modelo original `DeepSeek-R1-Distill-Qwen-1.5B`, incluida la menor capacidad de razonamiento frente a modelos de mayor tamano.
- Riesgo de alucinacion: no se documenta en la informacion proporcionada, pero es inherente a los modelos de lenguaje de esta escala.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no declarados; no se puede garantizar un rendimiento multilingue correcto.
- Licencia: el paquete no declara licencia; antes de un uso comercial debe verificarse la licencia del modelo original (DeepSeek-R1 se publica bajo MIT segun la nota de release) y los terminos del runtime `buddy-mlir`.
- Dependencia de runtime: requiere `buddy-cli` y una instalacion especifica; no es compatible con los ecosistemas habituales (vLLM, llama.cpp, Ollama).
- Objetivo restringido: compilado para riscv64 generico sin Zfh/Zvfh; puede no aprovechar aceleraciones de punto flotante disponibles en algunos nucleos.
- Adopcion minima: el repositorio registra 0 descargas y 0 likes, y la fecha de publicacion indicada es posterior a la actual, lo que sugiere un artefacto reciente, poco validado o de disponibilidad limitada.
- Sin datos de rendimiento: la ausencia de benchmarks impide estimar calidad, latencia o throughput en produccion.
- Memoria: con 7,1 GB de repositorio y precision f32, la huella puede ser elevada para dispositivos RISC-V con poca RAM; conviene verificar antes del despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RuyiAI/buddy-deepseek-r1-f32-tiered-kv-cache
- Organizacion RuyiAI en HuggingFace: https://huggingface.co/RuyiAI
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de ejemplo BuddyDeepSeekR1 (buddy-mlir): https://github.com/buddy-compiler/buddy-mlir/tree/main/examples/BuddyDeepSeekR1
- Proyecto buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Nota de release de DeepSeek-R1: https://www.deepseek.com/en/news/deepseek-r1/
- Coleccion DeepSeek-R1 en HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-r1
