# dbgworld/AutoDecompiler-6.7B-e2e-Q4_K_M-GGUF

## Resumen

`dbgworld/AutoDecompiler-6.7B-e2e-Q4_K_M-GGUF` es una cuantizacion en formato GGUF del modelo `AutoDecompiler/AutoDecompiler-6.7B-e2e`, un transformer de 6.740.512.768 parametros (aproximadamente 6,7 mil millones) orientado, por su nombre y procedencia, a tareas de descompilacion automatica de binarios a codigo fuente. El repositorio lo publica el usuario `dbgworld` y se ha generado de forma automatica mediante el espacio `gguf-my-repo` de ggml.ai, que ejecuta la conversion con `llama.cpp`.

La relevancia de esta ficha es doble. Por un lado, documenta una variante cuantizada a Q4_K_M que reduce el peso del modelo hasta unos 4,1 GB de repositorio, lo que lo hace desplegable en hardware de consumo mediante `llama.cpp`. Por otro lado, sirve de aviso: la model card del repositorio es la plantilla generica de `gguf-my-repo`, sin informacion sobre arquitectura interna, datos de entrenamiento, licencia, idiomas o evaluacion. Toda la documentacion sustantiva remite al modelo base original.

Por tanto, esta ficha describe con rigor lo que se puede verificar (parametros, formato, tamano, metodo de conversion y procedimiento de uso) y marca explicitamente como "no disponible" todo lo que no consta en la informacion proporcionada. No se han publicado benchmarks ni detalles de entrenamiento en los materiales accesibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia no especificada; derivada del modelo base `AutoDecompiler/AutoDecompiler-6.7B-e2e`) |
| Parametros totales | 6.740.512.768 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, valor de configuracion del servidor, no necesariamente el contexto nativo) |
| Tipos de cuantizacion | Q4_K_M (unica variante en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `autodecompiler-6.7b-e2e-q4_k_m.gguf`) |
| Tamano del repositorio | 4,1 GB |
| Modelo base | `AutoDecompiler/AutoDecompiler-6.7B-e2e` |
| Metodo de conversion | `llama.cpp` via espacio `gguf-my-repo` de ggml.ai |
| Compatibilidad de endpoints | `endpoints_compatible` (segun tags) |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de su naturaleza de transformer con 6.740.512.768 parametros. La model card del repositorio cuantizado no incluye detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion, tipo de tokenizador ni si emplea tecnicas como atencion lineal, decodificacion especulativa o mezcla de expertos. Tampoco consta el contexto nativo de entrenamiento.

Respecto al entrenamiento, no hay datos publicados en la informacion proporcionada sobre volumen de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni objetivo de la tarea mas alla de lo que sugiere el nombre "AutoDecompiler". La unica innovacion tecnica verificable es el proceso de cuantizacion: conversion a GGUF con el metodo Q4_K_M, que aplica cuantizacion de 4 bits con escalas mixtas (K-quants) para preservar mejor la calidad en las capas mas sensibles, reduciendo el peso a aproximadamente 4,1 GB.

## Capacidades

- Generacion de texto autoregresiva propia de un modelo de lenguaje de 6,7B parametros (capacidad generica, no verificada para esta variante concreta).
- Orientacion declarada por nombre y procedencia a descompilacion automatica: traduccion de representaciones de bajo nivel (binarios, ensamblador) a codigo fuente de alto nivel. No hay evaluacion publicada que lo confirme.
- Ejecucion local mediante `llama.cpp` en CLI (`llama-cli`) y servidor (`llama-server`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Descompilacion asistida de binarios: uso previsto segun el nombre del modelo, alimentando al modelo con ensamblador o pseudocodigo de un binario para obtener una aproximacion en C u otro lenguaje de alto nivel, que el analista revisaria manualmente.
- Analisis de malware en laboratorio aislado: ejecucion local con `llama-server` en una maquina sin salida a Internet, de modo que las muestras no salgan del entorno controlado. La cuantizacion Q4_K_M facilita desplegarlo en estaciones de trabajo modestas.
- Ingenieria inversa de firmware: procesamiento de fragmentos de codigo desensamblado para generar comentarios y reconstruir la logica de funciones, integrado en un pipeline de `llama.cpp` por lotes.
- Prototipado de pipelines de traduccion codigo-a-codigo: uso del modelo como componente en una cadena mayor (desensamblador + LLM + validador de compilacion) para experimentar con tecnicas de recuperacion de codigo fuente.
- Despliegue en hardware de consumo para investigacion: al ocupar unos 4,1 GB en Q4_K_M, permite probar el modelo en GPU de gama media o incluso en CPU, util para evaluar su calidad antes de invertir en el modelo completo.
- Servicio interno de asistencia a analistas: montar un `llama-server` con `-c 2048` como backend HTTP para una herramienta interna que consulte al modelo sobre fragmentos de codigo y reciba explicaciones o traducciones preliminares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,1 GB de pesos en Q4_K_M mas overhead de contexto KV; en la practica, entre 5 y 7 GB de VRAM para contextos moderados (estimacion, no dato publicado).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores son suficientes para cargar el modelo en GPU; A100 o H100 no son necesarias.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en Q4_K_M; tambien puede ejecutarse en CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), y por compatibilidad GGUF, otros runners como Ollama, `llama-cpp-python` o LM Studio (no verificado en la informacion proporcionada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `dbgworld/AutoDecompiler-6.7B-e2e-Q4_K_M-GGUF` | 6,74B | no disponible | GGUF Q4_K_M | no disponible | Cuantizacion automatica de un modelo especializado en descompilacion |
| `AutoDecompiler/AutoDecompiler-6.7B-e2e` (base) | 6,74B | no disponible | no disponible | no disponible | Modelo original sin cuantizar |
| Alternativas de proposito general de ~7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion con benchmarks |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card es la plantilla generica de `gguf-my-repo`; no documenta arquitectura, entrenamiento, licencia ni evaluacion. Cualquier uso en produccion exige revisar primero el modelo base original.
- Licencia no disponible: no se puede confirmar si se permite uso comercial. Tratarlo como no apto para produccion hasta verificar la licencia del modelo base.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo fuente plausible pero incorrecto al descompilar; requiere validacion humana y, idealmente, compilacion y pruebas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad en descompilacion frente a alternativas.
- Idiomas no declarados: no se puede confirmar soporte ni calidad en castellano u otros idiomas.
- Contexto nativo desconocido: el `-c 2048` del ejemplo es un parametro del servidor, no el contexto del modelo; configurar un contexto mayor del soportado degradara los resultados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo original; para tareas sensibles conviene evaluar tambien el modelo base sin cuantizar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dbgworld/AutoDecompiler-6.7B-e2e-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/AutoDecompiler/AutoDecompiler-6.7B-e2e
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
