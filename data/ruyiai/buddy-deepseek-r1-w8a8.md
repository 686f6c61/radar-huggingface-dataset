# RuyiAI/buddy-deepseek-r1-w8a8

## Resumen

`RuyiAI/buddy-deepseek-r1-w8a8` no es un modelo entrenado desde cero, sino un paquete `.rax` cross-compilado para RISC-V (riscv64) que contiene una versión cuantizada a w8a8 del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Lo publica el usuario RuyiAI, identificado en Hugging Face como parte de una pila de software de IA para RISC-V, y está diseñado para ejecutarse con el runtime `buddy-cli` del framework de compilación basado en MLIR `buddy-mlir`.

El problema que resuelve es de despliegue: llevar un modelo de razonamiento de 1.500 millones de parámetros a hardware RISC-V sin depender de GPUs ni de runtimes propietarios, mediante un artefacto precompilado que evita al usuario final compilar el grafo. El target declarado es riscv64 genérico, con cualquier VLEN y sin las extensiones Zfh ni Zvfh, lo que maximiza la portabilidad a costa de no explotar la aritmética vectorial de coma flotante de media precisión.

Su relevancia es experimental y de nicho: sirve como banco de pruebas para compiladores MLIR, para validar cuantización w8a8 sobre la ISA RISC-V y para integrar razonamiento tipo DeepSeek-R1 en dispositivos embebidos. El repositorio ocupa 3,5 GB y no declara licencia, idiomas soportados ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; heredada del modelo upstream `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Parametros totales | 1,5 mil millones (segun el nombre del modelo upstream referenciado) |
| Parametros activos | No aplica (el modelo upstream no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en int8); no se detallan granularidad ni calibracion |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `.rax` (paquete cross-compilado para el runtime `buddy-cli` de `buddy-mlir`), target riscv64 generico |
| Version del paquete | `60f354a` |
| Commit fuente | `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f` |
| Tamano del repositorio | 3,5 GB |
| Fecha de publicacion | 2026-10-16 |

## Arquitectura y entrenamiento

Este repositorio no contiene un proceso de entrenamiento: es un artefacto de compilación. El pipeline es el siguiente: se parte del modelo denso `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (destilado de DeepSeek-R1 sobre una base Qwen), se cuantiza a w8a8 y se compila de forma cruzada con `buddy-mlir`, un framework basado en MLIR que actúa de puente entre lenguajes de dominio específico y arquitecturas de dominio específico. El resultado es un fichero `.rax` ejecutable mediante `buddy-cli`. No se documentan ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO en el modelo original; toda esa información correspondería al repositorio upstream de DeepSeek.

La innovación técnica destacable es el propio enfoque de compilación: el target es riscv64 genérico, válido para cualquier VLEN y sin Zfh ni Zvfh, lo que permite ejecutar el mismo binario en implementaciones RISC-V muy distintas. La contrapartida es que la w8a8 se resuelve sin recurrir a instrucciones vectoriales de coma flotante de media precisión, y no se publican detalles sobre cómo se gestionan escalas, sesgos de cuantización o el layout de memoria dentro del paquete. Existe un directorio de especificaciones del modelo en el repositorio de `buddy-mlir` (`models/deepseek_r1/specs`) que probablemente contiene el detalle, pero su contenido no forma parte de la información disponible aquí.

## Capacidades

La model card de este repositorio no documenta capacidades. Las siguientes se heredan del modelo upstream `DeepSeek-R1-Distill-Qwen-1.5B` y deben verificarse contra su documentación antes de usarlas en producción:

- Generación de texto y razonamiento multi-paso con trazas de tipo cadena de pensamiento, característica de la familia DeepSeek-R1.
- Razonamiento matemático y resolución de problemas cuantitativos, área en la que la serie R1-Distill fue específicamente destilada.
- Generación y comprensión de código, incluyendo tareas de reparación y explicación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible; el paquete no expone una API de herramientas, solo `buddy-cli --model ... --prompt ...`.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible.

En el paquete `.rax` la única interfaz documentada es la invocación por línea de comandos con un prompt de texto, sin parámetros de generación documentados.

## Casos de uso

- Inferencia en placas RISC-V sin GPU: el paquete está cross-compilado para riscv64 genérico y se ejecuta con `buddy-cli`, de modo que puede desplegarse en SBC y placas de desarrollo RISC-V sin acelerador gráfico ni CUDA.
- Validación de toolchains MLIR: útil como caso de prueba reproducible de extremo a extremo para verificar que una versión de `buddy-mlir` compila correctamente un transformer cuantizado a int8.
- Investigación en cuantización w8a8: permite medir la pérdida de calidad de un modelo de razonamiento de 1,5B al pasar pesos y activaciones a int8 sobre una ISA no x86.
- Asistentes offline en entornos aislados: al ejecutarse en local sobre CPU RISC-V, no requiere conectividad ni envío de datos a servicios externos, lo que encaja en escenarios con requisitos de confidencialidad.
- Docencia y formación en compiladores: el flujo de tres comandos (descarga, instalación de `buddy-cli`, ejecución) lo hace adecuado para prácticas de compilación de grafos y despliegue en arquitecturas emergentes.
- Integración en pipelines de CI para software RISC-V: como artefacto de tamaño moderado (repositorio de 3,5 GB), puede emplearse en pruebas de regresión que verifiquen que el runtime sigue cargando y ejecutando el paquete tras cada cambio.
- Prototipado de asistentes de razonamiento en robótica o domótica basada en RISC-V, siempre que se acepte la falta de garantías de latencia y la ausencia de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del paquete no incluye métricas de ningún tipo, ni tampoco comparaciones con la versión sin cuantizar. Tampoco se documentan latencia, throughput ni consumo de memoria en ninguna implementación RISC-V concreta. El repositorio upstream de DeepSeek-R1 sí publica resultados para la serie R1-Distill, pero no se reproducen aquí porque no forman parte de la información proporcionada y no reflejan el comportamiento del paquete cuantizado.

## Requisitos de hardware

- Plataforma objetivo: CPU RISC-V de 64 bits (riscv64). El paquete no está pensado para GPU.
- Extensiones requeridas: ninguna más allá de riscv64 base; el target declara compatibilidad con cualquier VLEN y no requiere Zfh ni Zvfh.
- Memoria: no disponible. El repositorio ocupa 3,5 GB, pero no se indica el tamaño del fichero `.rax` ni el consumo en tiempo de ejecución.
- Almacenamiento: al menos los 3,5 GB del repositorio completo durante la descarga.
- GPU recomendadas: no aplica para este paquete. Para ejecutar el modelo upstream sin cuantizar en GPU, las estimaciones habituales para 1,5B de parámetros son del orden de 3 GB de pesos en fp16 y 1,5 GB en int8, más la caché KV; se trata de estimaciones derivadas del recuento de parámetros, no de datos publicados por el autor.
- Compatibilidad con GPU de consumo: no disponible para este paquete; para el modelo upstream, un modelo de 1,5B es manejable en GPUs de consumo con 8 GB o más.
- Opciones de despliegue: `buddy-cli` (única vía documentada). Para el modelo upstream, cabría esperar Transformers, vLLM, llama.cpp, Ollama o TGI, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-w8a8 | 1,5B (segun upstream) | No disponible | `.rax` (w8a8) | No disponible | RISC-V riscv64 con `buddy-cli` |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | No disponible en la informacion | Safetensors (upstream) | No disponible en la informacion | GPU/CPU con runtimes habituales |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en la informacion | Safetensors, GGUF | No disponible en la informacion | Amplia, multiples runtimes |
| Llama-3.2-1B-Instruct | 1,2B aprox. | No disponible en la informacion | Safetensors, GGUF | No disponible en la informacion | Amplia, multiples runtimes |

La diferencia funcional clave no está en el rendimiento, sino en el formato y el destino: este paquete es el único de la tabla orientado a RISC-V y el único que se distribuye como binario precompilado en lugar de pesos. No hay datos de benchmarks que permitan comparar calidad entre estas opciones.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, por lo que no puede asumirse uso comercial sin aclaración previa con el autor y con el titular de los derechos del modelo upstream.
- Sin métricas de calidad: no hay ningún benchmark que cuantifique la degradación introducida por la cuantización w8a8, que en modelos pequeños de razonamiento puede ser apreciable.
- Sesgos y alucinaciones: el paquete hereda los sesgos y la tendencia a la alucinación del modelo upstream, pero no se documenta ninguna evaluación al respecto en la información disponible.
- Idiomas: no se declara ningún conjunto de idiomas soportados; no puede asumirse un rendimiento correcto en castellano.
- Interfaz limitada: la única vía de uso documentada es `buddy-cli` con un prompt de texto; no se documentan parámetros de muestreo, plantillas de chat ni gestión de contexto multi-turno.
- Acoplamiento al runtime: el `.rax` depende de la versión `60f354a` del toolchain; cambios en `buddy-cli` o en `buddy-mlir` pueden romper la compatibilidad.
- Ausencia de Zfh/Zvfh: el target genérico evita las extensiones vectoriales de media precisión, lo que puede implicar un rendimiento inferior en hardware que sí las implementa.
- Mantenimiento incierto: el repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día, sin historial posterior.
- Falta de información operativa: no hay datos de consumo de memoria, latencia, requisitos mínimos de RAM ni tiempo de carga del paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RuyiAI/buddy-deepseek-r1-w8a8
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Framework de compilacion buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Especificaciones del modelo deepseek_r1 en buddy-mlir: https://github.com/buddy-compiler/buddy-mlir/tree/main/models/deepseek_r1/specs
- Script de instalacion de buddy-cli: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
- DeepSeek-R1 en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Sitio de DeepSeek: https://www.deepseek.com/
