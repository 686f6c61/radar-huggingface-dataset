# RuyiAI/buddy-deepseek-r1-w4a16

## Resumen

RuyiAI/buddy-deepseek-r1-w4a16 no es un modelo entrenado desde cero, sino un paquete binario cross-compilado para la arquitectura RISC-V (riscv64) en formato `.rax`, destinado al runtime de `buddy-cli` del proyecto Buddy Compiler (`buddy-compiler/buddy-mlir`). El artefacto empaqueta el modelo upstream `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` compilado con cuantizacion w4a16 (pesos de 4 bits, activaciones de 16 bits) y con target generico riscv64.

El repositorio ocupa 2,3 GB y corresponde a la version `60f354a`, con origen en el commit `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`. Su relevancia radica en que permite ejecutar un modelo de razonamiento de la familia DeepSeek-R1 destilado en hardware RISC-V mediante una CLI, un escenario poco habitual en el ecosistema de despliegue de LLM.

La informacion publicada no incluye detalles sobre licencia, idiomas, pipeline ni resultados de evaluacion, y el repositorio no registra descargas ni interacciones. La model card se limita a las instrucciones de descarga, instalacion de `buddy-cli` y ejecucion por linea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del upstream DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1,5B (heredados del modelo upstream) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a16 (4 bits en pesos, 16 bits en activaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.rax` (paquete binario cross-compilado para riscv64) |
| Target de compilacion | riscv64 generico (cualquier VLEN, sin extensiones Zfh/Zvfh) |
| Version | `60f354a` |
| Runtime | `buddy-cli` (proyecto Buddy Compiler / buddy-mlir) |
| Tamano del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base mas alla del nombre del upstream, `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un modelo destilado de la familia DeepSeek-R1 sobre una base Qwen de 1,5B. Los detalles sobre composicion del dataset, numero de tokens de entrenamiento y tecnicas de alineamiento (RLHF, DPO u otras) no estan publicados en la model card ni en los resultados de busqueda asociados.

Lo que si esta documentado es el proceso de compilacion: el artefacto se ha generado con el compilador de Buddy para producir un binario `.rax` ejecutable en RISC-V de 64 bits, con un target generico que no exige extensiones vectoriales especificas ni soporte para Zfh/Zvfh. La cuantizacion aplicada es w4a16, lo que reduce el peso de los parametros a 4 bits manteniendo las activaciones en 16 bits, una configuracion orientada a entornos con memoria restringida.

## Capacidades

- Ejecucion de inferencia de texto mediante la CLI `buddy-cli`, invocada con `--model <ruta>.rax --prompt "..."`.
- Despliegue en hardware RISC-V de 64 bits, lo que habilita escenarios de borde y embebidos fuera del ecosistema x86/ARM.
- Capacidades de razonamiento y generacion heredadas del upstream DeepSeek-R1-Distill-Qwen-1.5B, si bien la model card no enumera explicitamente tool calling, agentes, vision ni audio.
- Soporte multilingue: no disponible.
- Modo de razonamiento explicito (thinking): no confirmado en la informacion proporcionada.

## Casos de uso

- Inferencia en dispositivos RISC-V de borde: el paquete `.rax` se ejecuta directamente sobre CPU riscv64 sin GPU, lo que permite desplegar un modelo de razonamiento en placas embebidas y SoC RISC-V con recursos limitados.
- Sistemas empotrados aislados de red: al ser un binario local con runtime propio, encaja en entornos sin conectividad donde no es viable llamar a una API externa.
- Laboratorios de investigacion en compiladores: sirve como caso de prueba para validar flujos de compilacion de ML en Buddy Compiler y medir el comportamiento de la cuantizacion w4a16 en RISC-V.
- Prototipado de asistentes de texto offline: con el binario y `buddy-cli` instalados, se puede lanzar un asistente de generacion de texto sin dependencias de nube.
- Evaluacion de rendimiento de cuantizacion: permite comparar la calidad de salida y el coste computacional del formato w4a16 frente a alternativas de mayor precision en la misma arquitectura.
- Formacion y docencia sobre despliegue de LLM: el flujo de instalacion (descarga, instalacion de `buddy-cli`, ejecucion) es reproducible y acotado, util para demostrar el ciclo completo de compilacion y ejecucion de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Arquitectura objetivo: CPU RISC-V de 64 bits (riscv64 generico), sin requisito de extensiones Zfh/Zvfh ni VLEN concreto.
- VRAM: no aplica, el binario esta orientado a ejecucion en CPU RISC-V; no se documenta soporte de GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica segun la informacion disponible.
- Memoria: el repositorio ocupa 2,3 GB; con cuantizacion w4a16 sobre un modelo de 1,5B, el peso de los parametros deberia situarse en el rango de cientos de MB, aunque la cifra exacta no esta publicada.
- Opciones de despliegue: `buddy-cli` con el fichero `.rax`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-w4a16 | 1,5B (upstream) | no disponible | `.rax` (riscv64) | no disponible | HuggingFace |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en la informacion proporcionada | safetensors (upstream) | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card, lo que impide confirmar si se permite uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso ni validacion por parte de la comunidad.
- El formato `.rax` esta atado al runtime `buddy-cli` y al target riscv64; no es portable a x86, ARM ni a otros frameworks de inferencia estandar.
- No se publican resultados de benchmarks, por lo que no hay datos objetivos de calidad, latencia o consumo.
- Los idiomas soportados no estan documentados.
- Al ser un artefacto compilado, las capacidades reales dependen del modelo upstream y de la fidelidad de la cuantizacion w4a16, que puede degradar la precision respecto al modelo original en 16 bits.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque es inherente a los modelos de generacion de texto.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RuyiAI/buddy-deepseek-r1-w4a16
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de Buddy Compiler / buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Script de instalacion de `buddy-cli`: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
