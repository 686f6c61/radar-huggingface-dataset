# RuyiAI/buddy-deepseek-r1-w8a16

## Resumen

`RuyiAI/buddy-deepseek-r1-w8a16` no es un modelo entrenado desde cero, sino un paquete binario cross-compilado para RISC-V (riscv64) que empaqueta una version cuantizada del modelo upstream `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Lo publica la organizacion RuyiAI, que se presenta como "RISC-V AI Software Stack", y su objetivo es permitir ejecutar un modelo de razonamiento directamente sobre CPUs RISC-V mediante el runtime `buddy-cli` del proyecto `buddy-compiler/buddy-mlir`, sin necesidad de GPU ni de un stack de inferencia convencional.

El artefacto se distribuye en formato `.rax` (no safetensors ni GGUF), pesa 2,5 GB en el repositorio y esta compilado para un objetivo riscv64 generico, es decir, cualquier VLEN y sin extensiones `Zfh`/`Zvfh` (no requiere soporte de coma flotante de media precision en hardware). La cuantizacion es W8A16: pesos en 8 bits y activaciones en 16 bits. Deriva del commit `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f` y se identifica con la version `60f354a`.

Su relevancia es fundamentalmente practica para el nicho de la inferencia en el borde sobre arquitecturas abiertas: permite desplegar un modelo de razonamiento con cadena de pensamiento de ~1,5 mil millones de parametros en placas y SoCs RISC-V. Fuera de ese ecosistema, el paquete no es utilizable: no es un modelo al uso que se pueda cargar con transformers, vLLM o llama.cpp. Existe un hermano con cuantizacion W8A8 (`RuyiAI/buddy-deepseek-r1-w8a8`) para quien prefiera mayor compresion frente a la precision de las activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo upstream DeepSeek-R1-Distill-Qwen-1.5B); el artefacto publicado es un binario `.rax` para RISC-V, no pesos en formato estandar |
| Parametros totales | Aproximadamente 1.500 millones (deducido del modelo upstream `DeepSeek-R1-Distill-Qwen-1.5B`); no confirmado explicitamente en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | W8A16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible en la informacion proporcionada |
| Formato de pesos | `.rax`, formato binario propio del runtime `buddy-cli` (no safetensors, no GGUF) |

Otros metadatos del repositorio:

| Dato | Valor |
|---|---|
| Autor | RuyiAI |
| Repo | 2,5 GB |
| Target de compilacion | riscv64 generico (cualquier VLEN, sin Zfh/Zvfh) |
| Version / commit | `60f354a` (source `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`) |
| Modelo upstream | `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Runtime | `buddy-cli` (proyecto `buddy-compiler/buddy-mlir`) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 2026-10-16 (segun los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre el entrenamiento de este artefacto, porque no se trata de un modelo entrenado por RuyiAI. La arquitectura subyacente es la del modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, que combina un backbone tipo Qwen (transformer decoder-only, alrededor de 1,5 B de parametros) con la destilacion de trazas de razonamiento generadas por DeepSeek-R1. DeepSeek-R1 es un modelo de razonamiento cuyos datos publicos indican que fue post-entrenado con refuerzo y con datos de arranque en frio para mitigar problemas de repeticion, legibilidad y mezcla de idiomas observados en DeepSeek-R1-Zero.

La aportacion tecnica de este repositorio no esta en el modelo, sino en el proceso de compilacion y empaquetado. Los pesos se cuantizan a 8 bits (W8A16) y se compilan a traves del framework basado en MLIR `buddy-mlir`, que actua como puente entre DSL y arquitecturas especificas de dominio, generando un paquete ejecutable para riscv64 con `buddy-cli`. El binario esta compilado para un target generico y evita depender de extensiones vectoriales de media precision (`Zfh`, `Zvfh`), lo que amplia el conjunto de nucleos RISC-V compatibles a costa de renunciar a posibles aceleraciones especificas.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento, heredados del modelo destilado de DeepSeek-R1.
- Resolucion de problemas de matematicas y de codigo, que son las areas en las que la familia DeepSeek-R1 declara un rendimiento comparable a o1 segun la informacion publica del proyecto upstream.
- Ejecucion de inferencia sobre CPUs RISC-V a traves de `buddy-cli`, sin GPU ni stack CUDA.
- Compatibilidad con nucleos riscv64 genericos, incluidos aquellos sin extensiones `Zfh`/`Zvfh`.
- Cuantizacion W8A16 como modo de despliegue, con la variante W8A8 disponible en un repositorio hermano.
- Tool calling / function calling: no disponible en la informacion proporcionada para este paquete.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para el paquete; el modelo upstream esta orientado a razonamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en placas y SoCs RISC-V: el paquete esta pensado para ejecutarse con `buddy-cli` sobre un target riscv64 generico, de modo que una placa con CPU RISC-V puede servir un modelo de razonamiento de ~1,5 B sin depender de GPU ni de servicios en la nube. Es el caso de uso central y el unico documentado de forma explicita.
- Robótica y automatizacion industrial embebida: en controladores basados en RISC-V se puede integrar un asistente de razonamiento para interpretar ordenes en lenguaje natural y generar secuencias de acciones, manteniendo los datos en el propio dispositivo.
- Asistentes de texto sin conexion: dado que no requiere infraestructura de centros de datos, encaja en escenarios de privacidad estricta (entornos sanitarios, industriales o de defensa) donde el texto no puede salir del equipo.
- Educacion e investigacion en compiladores: sirve como caso de prueba real para validar el pipeline MLIR de `buddy-mlir` y comparar el rendimiento de las variantes W8A16 y W8A8 sobre el mismo hardware RISC-V.
- Demostraciones de razonamiento en el borde: permite mostrar cadenas de razonamiento paso a paso sobre hardware de bajo consumo, util para prototipos y pruebas de concepto en ferias o laboratorios.
- Procesamiento de documentacion tecnica en campo: tecnicos con dispositivos RISC-V portatiles pueden resumir o consultar manuales sin cobertura de red.
- Evaluacion comparativa de cuantizaciones: el par w8a16 / w8a8 del mismo autor permite medir el compromiso entre tamano, velocidad y calidad en un mismo runtime.
- Integracion en pipelines de CI para arquitecturas no x86: el artefacto facilita incluir pruebas de inferencia RISC-V en procesos automatizados de validacion de toolchains.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este paquete. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput, y tampoco se han encontrado en los resultados de busqueda web. Cualquier cifra de rendimiento del modelo upstream `DeepSeek-R1-Distill-Qwen-1.5B` no es trasladable automaticamente a esta compilacion W8A16 sobre RISC-V, por lo que no se incluye ninguna tabla comparativa de numeros.

## Requisitos de hardware

- Arquitectura objetivo: CPU RISC-V de 64 bits (riscv64), generica, cualquier VLEN, sin necesidad de `Zfh`/`Zvfh`.
- GPU: no requerida ni soportada por el runtime `buddy-cli`, que esta orientado a CPU RISC-V.
- Memoria: el repositorio ocupa 2,5 GB, lo que da una referencia del espacio de almacenamiento necesario; la memoria RAM requerida para la inferencia no se especifica en la documentacion y debe considerarse un dato no disponible.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no aplica, el artefacto no se ejecuta sobre CUDA.
- Opciones de despliegue: exclusivamente `buddy-cli`, instalado mediante el script oficial del proyecto `buddy-compiler/buddy-mlir`, con el comando `buddy-cli --model deepseek_r1-w8a16/deepseek_r1-w8a16.rax --prompt "hello"`.
- Aceleradores de inferencia convencionales (vLLM, llama.cpp, Ollama, TGI): no disponibles, ya que el formato `.rax` no es compatible con ellos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Entorno de ejecucion |
|---|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-w8a16 | ~1,5 B | `.rax` | W8A16 | No disponible | No disponible | RISC-V, `buddy-cli` |
| RuyiAI/buddy-deepseek-r1-w8a8 | ~1,5 B | `.rax` | W8A8 | No disponible | No disponible | RISC-V, `buddy-cli` |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | safetensors (upstream) | Sin cuantizar | No disponible | No disponible en esta ficha | GPUs y CPUs con transformers y similares |

La comparativa con alternativas de la misma categoria (por ejemplo, modelos de ~1,5 B en formato GGUF para llama.cpp u Ollama) no puede completarse con datos de rendimiento porque no hay benchmarks publicados de este paquete. La diferencia principal frente a cualquier alternativa convencional no es la calidad del modelo, sino el entorno de ejecucion: aqui el valor esta en la compilacion a RISC-V, no en una mejora de capacidades.

## Limitaciones y advertencias

- No es un modelo en el sentido habitual: es un binario compilado para RISC-V. No se puede cargar con transformers, vLLM, llama.cpp, Ollama ni TGI.
- El formato `.rax` es especifico del runtime `buddy-cli`; la portabilidad a otros motores de inferencia no esta documentada.
- El rendimiento y la latencia no estan documentados, por lo que no se puede estimar su viabilidad en produccion sin pruebas propias.
- Riesgo de alucinacion: inherente a los modelos de la familia, y no se documenta ninguna mitigacion adicional en este paquete. La destilacion desde DeepSeek-R1 conserva la tendencia a generar cadenas de razonamiento largas, con el coste de tokens que implica.
- Sesgos conocidos: no disponibles en la informacion proporcionada; deben asumirse los del modelo upstream, no documentados aqui.
- Idiomas soportados: no disponibles. Esto es especialmente relevante para despliegues en castellano, ya que no hay confirmacion de cobertura.
- Longitud de contexto: no disponible, lo que impide planificar aplicaciones con ventanas largas.
- Licencia: no disponible. Antes de cualquier uso comercial es imprescindible comprobar la licencia tanto de este paquete como la del modelo upstream, ya que la model card no la declara.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y una unica version publicada, lo que indica un artefacto reciente y sin validacion comunitaria amplia.
- Fechas de publicacion poco habituales en los metadatos (2026-10-16). Conviene verificar la vigencia del repositorio antes de integrarlo en un flujo de trabajo.
- Dependencia de la cadena de herramientas `buddy-mlir`: cualquier problema en `buddy-cli` o en el script de instalacion bloquea el uso del modelo.
- El target generico sin `Zfh`/`Zvfh` implica renunciar a posibles aceleraciones vectoriales de media precision, lo que puede penalizar el rendimiento en nucleos que si las implementan.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RuyiAI/buddy-deepseek-r1-w8a16
- Variante W8A8: https://huggingface.co/RuyiAI/buddy-deepseek-r1-w8a8
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Framework y runtime buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Especificaciones del modelo en buddy-mlir: https://github.com/buddy-compiler/buddy-mlir/tree/main/models/deepseek_r1/specs
- Script de instalacion de buddy-cli: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
- Ficha de DeepSeek-R1 en The Open-Source AI Stack: https://www.open-source-ai.tech/models/deepseek-r1
