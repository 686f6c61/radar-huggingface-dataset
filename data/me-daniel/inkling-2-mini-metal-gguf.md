# Me-Daniel/Inkling-2-Mini-Metal-GGUF

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) con una peculiaridad estructural: las capas 6 a 17 se ejecutan tres veces sobre los mismos pesos de expertos, un patron de "loop" que reutiliza computo y parametros. El modelo base lo desarrolla Thinking Machines y esta ficha cubre la cuantizacion GGUF publicada por Me-Daniel, optimizada especificamente para ejecucion completa en la GPU de Apple Silicon mediante llama.cpp. Con 26.070.385.152 parametros totales, el archivo recomendado ocupa 11,57 GB.

El problema que resuelve esta publicacion concreta es el de la inferencia local en Mac: muchas cuantizaciones de baja precision recurren a tipos de tensor (por ejemplo NVFP4) que llama.cpp no puede ejecutar en la GPU Metal y acaban cayendo a la CPU, con la penalizacion de velocidad que eso implica. Esta version garantiza que todos los tensores de expertos usan tipos soportados nativamente por Metal, de modo que el modelo completo permanece en la GPU.

Es relevante ahora porque demuestra un enfoque de cuantizacion guiado por medida: el reparto de bits entre cinco grupos de capas (incluido el nucleo que se ejecuta tres veces) se elige midiendo la perdida KL de cada grupo al comprimirse, y se publican tanto los resultados como el criterio de validacion previo a la release, incluido el hecho de que el archivo no supero el test registrado contra la cuantizacion de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts con capas recurrentes (loop): capas 6 a 17 ejecutadas 3 veces sobre los mismos pesos de expertos |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con tipos ejecutables en Metal por llama.cpp estandar (imatrix); esquema de bits por grupos de capas; el archivo recomendado ronda 11,5 GB |
| Idiomas soportados | no disponible (la calibracion incluye texto en ingles, aleman y codigo en Python, Rust, Go y TypeScript) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es una red de mezcla de expertos con un nucleo recurrente: las capas 6 a 17 se aplican tres veces sobre el mismo conjunto de pesos de expertos, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo original de Thinking Machines y no se detallan en la model card de la cuantizacion.

La innovacion tecnica de esta publicacion esta en el proceso de cuantizacion. Se midio el coste de comprimir cada uno de cinco grupos de capas (incluido el nucleo recurrente) y se eligio el reparto de tipos de tensor entre cuatro candidatos evaluados. Ademas, el archivo "refined" re-codifica los pesos de expertos de 22 capas con un refinador que conserva las escalas de bloque de llama-quantize y selecciona, para cada grupo pequeno de pesos, el codigo de rejilla que minimiza la desviacion de la salida de la capa respecto al original sobre texto de calibracion (WikiText, conversaciones y prosa). El autor cita MACaQ (arXiv:2611.10649, apendice C) como precedente de la idea para modelos densos. El archivo refined2 amplia el texto de calibracion con codigo Python y Rust de 16 repositorios adicionales.

## Capacidades

- Generacion de texto conversacional y prosa, segun los conjuntos de calibracion y evaluacion empleados.
- Razonamiento matematico y resolucion de tareas de tipo test: en el conjunto de 300 tareas (matematicas, tool calls, codigo y JSON) el archivo refined2 acierta 264 y el principal 253.
- Generacion de codigo en Python, Rust, Go y TypeScript, con perdida KL medida sobre codigo fuente real de repositorios.
- Soporte de tool calling y salida estructurada en JSON, incluido en el conjunto de evaluacion de tareas.
- Capacidad multilingue parcial: la evaluacion incluye discursos del parlamento aleman ademas de texto en ingles.
- Ejecucion completa en GPU Metal de Apple mediante llama.cpp estandar, sin fallback a CPU en los tensores de expertos.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente conversacional local en Mac: el modelo completo cabe en 11,5 GB y se ejecuta integramente en la GPU Metal, lo que permite desplegar un chatbot privado sin conexion en un portatil Apple Silicon con 16 GB o mas de memoria unificada.
- Generacion de codigo en el editor: con soporte de Python, Rust, Go y TypeScript y un KL medido sobre codigo real, es adecuado para autocompletado y generacion de funciones en un flujo de desarrollo local, sin enviar el codigo a un servicio externo.
- Automatizacion de tool calls y agentes ligeros: el modelo resuelve tareas de tool calling y produce JSON estructurado, lo que permite integrarlo en pipelines de automatizacion que invocan APIs o ejecutan acciones sobre ficheros.
- Prototipado e investigacion en entornos sin GPU dedicada: sirve para validar prompts, cadenas de razonamiento y flujos multi-paso en un Mac antes de escalar a un modelo mayor en servidor.
- Procesamiento de documentacion tecnica multilingue: la evaluacion sobre discursos en aleman y codigo en varios lenguajes respalda su uso para resumir y transformar documentacion en ingles y aleman.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye metodologia, conjuntos held-out y comparativas de KL, por lo que es util como referencia reproducible para quien investigue cuantizacion guiada por medida.
- Tareas de matematicas y JSON en lote: el rendimiento medido en 300 tareas mixtas permite usarlo para clasificacion, extraccion de campos y resolucion de problemas aritmeticos en scripts locales.

## Benchmarks y rendimiento

Los datos publicados miden la calidad de la cuantizacion (divergencia KL respecto al modelo original, donde menor es mejor) y la velocidad en un Apple M5 Pro.

| Archivo | Tamano | KL | Todo en Metal | Prompt t/s | Generacion t/s |
|---|---|---|---|---|---|
| Este archivo (principal) | 11,51 GB | 0,02686 | si | 224 | 19,0 |
| AtomicChat AD-IQ2_S | 11,56 GB | 0,03497 | si | 236 | 18,3 |
| Unsloth UD-IQ3_XXS | 11,66 GB | 0,01939 | no | 68 | 10,9 |

Resultados del archivo refined2 frente al principal y a UD-IQ3_XXS en texto held-out:

| Conjunto | Principal | Refined | Refined2 | UD-IQ3_XXS |
|---|---|---|---|---|
| Python | 0,01944 | 0,01659 | 0,01489 | 0,01409 |
| Rust | 0,01144 | 0,01013 | 0,00896 | 0,00840 |
| Go (fuera de calibracion) | 0,01799 | 0,01653 | 0,01417 | 0,01324 |
| TypeScript (fuera de calibracion) | 0,01980 | 0,01697 | 0,01511 | 0,01335 |
| Aleman (parlamento) | 0,03626 | 0,03073 | 0,03149 | 0,02571 |
| Tareas correctas de 300 | 253 | 262 | 264 | no ejecutado |

Datos adicionales: el archivo refined obtiene KL 0,02081 en el conjunto sellado T3 de WikiText (frente a 0,02847 del principal y 0,01987 de UD-IQ3_XXS). El autor declara que su archivo no supero el test de calidad registrado previamente contra UD-IQ3_XXS (diferencia de KL de +0,00747 en T1 y +0,00581 en T2). No se publican resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: al menos 11,6 GB para el archivo recomendado; con overhead de contexto y cache KV, se recomienda un Mac con 16 GB de memoria unificada o mas.
- GPU recomendadas: Apple Silicon con soporte Metal; las mediciones se hicieron en un Apple M5 Pro.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente. No se dispone de datos para GPU NVIDIA o AMD en esta publicacion.
- Despliegue: llama.cpp estandar; el autor garantiza que todos los tensores de expertos se ejecutan en la GPU Metal sin fallback a CPU. El tag `endpoints_compatible` sugiere integracion con endpoints de inferencia.
- Latencia y throughput: 224 t/s en prompt y 19,0 t/s en generacion con el archivo principal en un M5 Pro; 272/20,9 t/s para el refined en la misma ejecucion. Frente a UD-IQ3_XXS, el autor reporta lectura de prompts 3,3 veces mas rapida y generacion 1,75 veces mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL (held-out) | Todo en Metal | Licencia |
|---|---|---|---|---|---|
| Inkling-2-Mini-Metal-refined2 (este) | 26,07 B (MoE con loop) | no disponible | 0,02686 (principal) | si | Apache 2.0 |
| AtomicChat AD-IQ2_S | mismo base | no disponible | 0,03497 | si | Apache 2.0 |
| Unsloth UD-IQ3_XXS | mismo base | no disponible | 0,01939 | no (20 tensores NVFP4 en CPU) | Apache 2.0 |
| bartowski IQ2_S | mismo base | no disponible | no disponible en la informacion | si | Apache 2.0 |
| mudler APEX-I-Nano | mismo base | no disponible | no disponible en la informacion | si | Apache 2.0 |

Todas las alternativas son cuantizaciones del mismo modelo base; la comparativa relevante es de tamano, fidelidad al original y velocidad, no de capacidades.

## Limitaciones y advertencias

- El autor declara explicitamente que este archivo no supero el test de calidad registrado previamente contra Unsloth UD-IQ3_XXS: esta algo mas lejos del modelo original en texto held-out.
- El archivo refined2 mejora el KL en codigo pero empeora un 3% en aleman respecto al refined, superando el margen del 5% fijado por el autor; la decision se justifica en la model card pero es un compromiso asumido.
- Los numeros del refined2 se midieron sobre los mismos textos que se usaron para elegirlo, por lo que el autor los califica de ligeramente optimistas.
- No hay datos publicados sobre sesgos, tasas de alucinacion, idiomas soportados oficialmente ni longitud de contexto; deben validarse empiricamente antes de produccion.
- El rendimiento esta medido unicamente en Apple M5 Pro con llama.cpp; no hay datos para otras GPU ni para otros backends (vLLM, TGI).
- La licencia Apache 2.0 permite uso comercial, pero se aplica al artefacto de cuantizacion; conviene verificar las condiciones del modelo base de Thinking Machines.
- El archivo esta pensado para llama.cpp estandar; otros runtimes pueden no aprovechar el esquema de tipos elegido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Me-Daniel/Inkling-2-Mini-Metal-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paper MACaQ citado: https://arxiv.org/abs/2611.10649
- Detalles de evaluacion del autor: DETAILS.md en el repositorio
