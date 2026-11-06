# ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, publicado como checkpoint base en Hugging Face bajo licencia MIT. La ficha que nos ocupa no es el modelo original, sino una cuantizacion empaquetada por el usuario `ddalcu` para el runtime **mlx-serve** de Apple Silicon, en formato iQ-MLX a 3,0 bits por peso. El modelo base consta de 66.715.052.754 parametros totales, 40 capas, 384 expertos enrutados (6 activos por token) mas un experto compartido, y una ventana de contexto de 1.000.000 de tokens. Incluye una torre de vision y etapas de decodificacion especulativa DSpark.

La relevancia de este pack es practica: permite ejecutar un modelo de ~66.700 millones de parametros con contexto de 1M en un Mac de 256 GB de memoria unificada, con unos 209 GB residentes y 427 GB de descarga. El autor documenta de forma inusualmente rigurosa la perdida de calidad introducida por la cuantizacion (KLD, top-1 frente al checkpoint original) y las velocidades medidas en un M5 Ultra.

Esta ficha describe el pack cuantizado y, cuando la informacion lo permite, el modelo base. Cualquier dato no documentado en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`model_type: deepseek_v41`), 40 capas, 384 expertos enrutados (6 activos) + 1 experto compartido |
| Parametros totales | 66.715.052.754 (~66,7 B) |
| Parametros activos | no disponible (la model card no indica el numero exacto; 6 de 384 expertos enrutados activos por token mas el compartido) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | iQ-MLX 3,0 bpw: expertos enrutados con GPTQ 2/3 bits, tronco de atencion y experto compartido en MXFP8 (sin cuantizar respecto al release); grupo 64, damping 0,1 |
| Idiomas soportados | en, zh (segun metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `mlx-serve`) |
| Tamano del repo | 649,5 GB (descarga de 427 GB; tablas Engram de 203 GB incluidas, leidas desde SSD) |
| Memoria residente | ~209 GB en ejecucion; ~215 GB libres necesarios para cargar |
| Version del pack | v1.1 (2026-10-29); `main` apunta a la mas reciente |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 40 capas, 384 expertos enrutados de los que se activan 6 por token, mas un experto compartido, y soporte de contexto de 1M tokens. El checkpoint original emplea expertos en FP4 y tronco en FP8, y el pack de `ddalcu` se construye como un reempaquetado "bit-exact" de esas representaciones para servir como referencia de evaluacion. Ademas de la pila de atencion y los expertos, el release incluye una torre de vision (entrada de imagen disponible en mlx-serve 26.10.3 o posterior) y etapas de borrador DSpark para decodificacion especulativa, activadas por defecto.

El proceso de cuantizacion es el elemento tecnico central de esta ficha. Los expertos enrutados se cuantizan con GPTQ usando matrices de Hessian recogidas de las propias activaciones del modelo liberado; el tronco de atencion y el experto compartido se mantienen en MXFP8. La version 1.1 introduce varias mejoras: calibracion sobre 1.012 ventanas de 2.048 tokens (2,07 M tokens) renderizadas con el encoder de chat de DeepSeek e incluyendo trayectorias de agente con tool calls nativos (SWE-Gym/OpenHands, SWE-agent), function calling (Hermes), codigo y razonamiento sobre codigo (OpenCodeReasoning), matematicas (OpenR1), razonamiento (OpenThoughts3), chat (UltraChat), texto no ingles (Aya), WikiText-103 y codigo fuente real; GPTQ con act-order solo en la proyeccion down; y una asignacion de capas a 3 bits en gate/up resuelta mediante programacion dinamica sobre el error medido de salida de bloque, a exactamente 3,00 bits por peso de experto. El autor documenta tambien dos variantes descartadas por empeorar el KLD end-to-end: proyecciones down a 4 bits pagadas con menos capas gate/up a 3 bits (+7 %) y calibracion de las primeras capas sobre activaciones derivadas del propio modelo cuantizado (+4 %).

No se dispone de informacion sobre el dataset de preentrenamiento del modelo base, el numero de tokens vistos ni si hubo RLHF/DPO; esos datos no aparecen en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventana de hasta 1M tokens.
- Razonamiento sobre codigo y generacion de codigo, con calibracion especifica sobre dominios de codigo y razonamiento de codigo.
- Tool calling / function calling nativo, con tool calls representados como bloques DSML en el encoder de chat.
- Trayectorias de agente multi-paso: la calibracion incluye sesiones de agente con OpenHands y SWE-agent, lo que sugiere soporte para uso agentico.
- Capacidades matematicas, con calibracion sobre OpenR1 (respuestas verificadas).
- Entrada de imagen a traves de la torre de vision del release (requiere mlx-serve 26.10.3 o posterior).
- Decodificacion especulativa DSpark activada por defecto, que acelera la generacion.
- Multilingue limitado a ingles y chino segun los metadatos del repositorio.
- Modo de razonamiento: la calibracion incluye datos de razonamiento (OpenThoughts3), aunque la model card no describe explicitamente un "thinking mode" conmutable.

## Casos de uso

- **Asistente de codigo en local sobre Apple Silicon**: el pack esta pensado para ejecutarse en un Mac de 256 GB con mlx-serve; permite autocompletado, refactorizacion y explicacion de codigo sin enviar el codigo a un servicio externo, con contexto suficiente para incluir un repositorio mediano en la ventana.
- **Agentes de ingenieria de software**: la calibracion sobre SWE-Gym/OpenHands y SWE-agent indica que el modelo esta ajustado para tareas de resolucion de issues y edicion multi-archivo con tool calls; se usaria como policy de un agente que invoca herramientas de shell, edicion y tests.
- **Function calling en pipelines internos**: con soporte nativo de tool calling y contexto de 1M, puede orquestar llamadas a APIs y bases de datos en flujos de automatizacion, manteniendo el historial completo de la sesion en contexto.
- **Analisis de documentos largos**: la ventana de 1M tokens permite resumir, extraer y razonar sobre contratos, informes o transcripciones extensas en una sola pasada, sin chunking agresivo.
- **Razonamiento matematico asistido**: util para resolver problemas paso a paso y verificar derivaciones, apoyandose en la calibracion con datos de matematicas verificadas.
- **Procesamiento de imagenes con texto**: la torre de vision permite tareas de OCR, descripcion de capturas o extraccion de datos de documentos escaneados, siempre que se use una version de mlx-serve que la soporte.
- **Atencion al cliente bilingue (en/zh)**: conversaciones multi-turno en ingles y chino con contexto largo para mantener el historial de la sesion; el soporte de otros idiomas no esta garantizado.
- **Prototipado e investigacion de cuantizacion**: el pack incluye metricas detalladas de KLD y top-1 por dominio, lo que lo hace util como referencia reproducible para estudiar el impacto de la cuantizacion GPTQ en modelos MoE.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Publica metricas de fidelidad del pack frente al checkpoint original, medidas sobre 46 ventanas de 2.048 tokens (11.776 posiciones) con el port DeepSeek-V4.1 de oMLX. KLD es KL(released || pack) sobre el vocabulario completo de 129.280 tokens; top-1 es la coincidencia del token greedy con el del modelo original.

| Metrica | v1.1 (este pack) | v1.0 |
|---|---|---|
| KLD media (todas las ventanas) | 0,0963 | 0,1567 |
| KLD mediana | 0,0031 | 0,0067 |
| Top-1 | 92,64 % | 90,59 % |
| Perplejidad frente al release | +0,6 % | -4,2 % |
| KLD en tokens del asistente | 0,038 | 0,071 |

Desglose de KLD por dominio en v1.1: agente 0,169; codigo 0,046; herramientas 0,045; razonamiento 0,019; chat 0,085; multilingue 0,117.

Velocidad medida en un M5 Ultra de 256 GB con un modelo cargado y mlx-serve posterior a 26.10.3:

| Contexto | Decodificacion (DSpark activo) | Prefill |
|---|---|---|
| ~1 k | 95,8 tok/s | 1.414 tok/s |
| ~8 k | 112,9 tok/s | 1.994 tok/s |
| ~33 k | 108,0 tok/s | 2.276 tok/s |
| ~131 k | 110,2 tok/s | 2.101 tok/s |

## Requisitos de hardware

- **Memoria**: ~209 GB residentes en ejecucion; se necesitan ~215 GB libres para cargar. Requiere un Mac con 256 GB de memoria unificada.
- **Almacenamiento**: descarga de 427 GB; el repo ocupa 649,5 GB. Las tablas Engram (203 GB) se leen desde el SSD por token y no residen en memoria.
- **GPU**: el pack esta disenado exclusivamente para Apple Silicon via MLX; no se documenta soporte para A100, H100 ni RTX 4090. En GPUs NVIDIA habria que usar el modelo base o cuantizaciones GGUF/AWQ de otros autores, no disponibles en la informacion proporcionada.
- **Consumer GPU**: no cabe en ninguna GPU de consumo convencional (24 GB o menos); el propio pack exige 256 GB de memoria unificada en un Mac.
- **Despliegue**: mlx-serve 26.10.3 o posterior, con el comando `mlx-serve --model ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw --serve`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: ver tabla de velocidad; la decodificacion se mantiene entre ~96 y ~113 tok/s en el rango de 1 k a 131 k tokens de contexto, y el prefill entre ~1.400 y ~2.300 tok/s.

## Comparativa con modelos similares

No hay informacion sobre modelos comparables en la documentacion proporcionada. Como referencia interna, se comparan las dos versiones del propio pack:

| Criterio | v1.1 (este pack) | v1.0 |
|---|---|---|
| Tronco de atencion | MXFP8 (como el release) | GPTQ 4 bits |
| Tokens de calibracion | 2,07 M | 954 k |
| Act-order GPTQ | Solo en down | No |
| Asignacion 3 bits gate/up | Capas 4-9 y 11-14 | Capas 1-9 y 14 |
| KLD media | 0,0963 | 0,1567 |
| Top-1 | 92,64 % | 90,59 % |
| Perplejidad vs release | +0,6 % | -4,2 % |

Frente a otros modelos MoE de tamano similar (por ejemplo, la familia DeepSeek-V3 o Qwen MoE), no se dispone de datos en la informacion proporcionada para establecer una comparacion fiable; se indica como no disponible.

## Limitaciones y advertencias

- **Perdida de calidad por cuantizacion**: el pack no es el modelo original. La KLD media de 0,0963 y un top-1 del 92,64 % implican que aproximadamente 1 de cada 13 tokens greedy difiere del release; en dominios de agente la KLD sube a 0,169, la mas alta del desglose.
- **Perplejidad enganosa**: el autor advierte explicitamente que la perplejidad no es una medida valida de calidad en este contexto; un pack desviado puede obtener mejor perplejidad que el modelo original.
- **Hardware muy restrictivo**: requiere un Mac con 256 GB de memoria unificada y ~215 GB libres; no es desplegable en GPUs de consumo ni en la mayoria de servidores convencionales.
- **Dependencia de runtime**: funciona unicamente con mlx-serve 26.10.3 o posterior; no hay soporte documentado para otros motores de inferencia.
- **Idiomas**: solo ingles y chino declarados; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- **Vision condicionada**: la entrada de imagen solo esta disponible en mlx-serve 26.10.3 o posterior; en versiones anteriores no funciona.
- **Almacenamiento y SSD**: las tablas Engram se leen desde el SSD en cada token, lo que puede afectar a la latencia y al desgaste del disco en uso intensivo.
- **Sesgos y alucinaciones**: no se documentan evaluaciones de sesgo ni de tasas de alucinacion en la informacion proporcionada; deben asumirse los riesgos habituales de un modelo de lenguaje sin evaluacion especifica.
- **Licencia**: MIT, lo que permite uso comercial, pero la licencia se aplica al pack; conviene verificar la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` antes de un despliegue comercial.
- **Versionado**: el repo usa tags; conviene fijar una revision concreta (`--revision v1.1`) para reproducibilidad, ya que `main` cambia.

## Enlaces

- Pack cuantizado en Hugging Face: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Aplicacion mlx-serve: https://mlxserve.com
- Grafico de calidad y velocidad del pack: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw/resolve/main/assets/v11-card-chart.png
- Licencia del pack: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw/blob/main/LICENSE
