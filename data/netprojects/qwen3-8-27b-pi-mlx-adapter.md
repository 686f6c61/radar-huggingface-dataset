# netprojects/Qwen3.8-27B-pi-MLX-adapter

## Resumen

`netprojects/Qwen3.8-27B-pi-MLX-adapter` es un adaptador LoRA en formato mlx-lm para el modelo base `Qwen/Qwen3.8-27B` de Alibaba Cloud (Qwen Team). Lo publica NetProjects (Internet Projects Ltd) y su funcion es convertir el modelo base en el motor del agente de programacion [pi](https://github.com/earendil-works/pi), especializado en tareas de ingenieria de software y uso de terminal. No es un modelo autonomo: requiere cargarse sobre una build MLX del modelo base de 27.000 millones de parametros.

El adaptador es una conversion a formato mlx-lm del LoRA original de `harness-hub/Qwen3.8-27B-pi-adapted` (revision `e786f84`), entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL). Segun los resultados publicados por el autor original, el adaptador mejora Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7%, con entre un 55% y un 64% menos de llamadas a herramientas por tarea.

Su relevancia practica es doble: por un lado, permite ejecutar un agente de codigo afinado sobre Apple Silicon con MLX, sin GPU dedicada; por otro, al ser un adaptador separable, permite mantener una unica copia del modelo base y activar o desactivar el comportamiento de agente segun la tarea. El repositorio ocupa 0,7 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.8-27B (16 capas con atencion completa, 64 capas en total) |
| Parametros totales | No disponible (adaptador de 638 MB; el modelo base tiene 27.000 millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador es float32; las builds merged del autor ofrecen 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en layout mlx-lm (adaptador LoRA); builds merged en formato MLX |
| Rango y escala del LoRA | Rank 32, scale 2.0 (alpha 64) |
| Modulos adaptados | q, k, v, o de las 16 capas de atencion completa; gate, up, down de las 64 capas |
| Libreria | mlx, mlx-lm >= 0.32.2 |
| Tamano del repositorio | 0,7 GB (adaptador: 638 MB) |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y escala 2.0 (alpha 64) aplicado sobre las proyecciones q, k, v y o de las 16 capas con atencion completa del modelo base, y sobre gate, up y down de las 64 capas. Los pesos son los valores float32 originales de harness-hub, transpuestos al layout de mlx-lm. En la verificacion del autor, al cargarse sobre `mlx-community/Qwen3.8-27B-4bit` se crean exactamente 256 modulos LoRA y la actualizacion de cada modulo equivale exactamente a `2.0 · B @ A` del fichero original.

El entrenamiento del LoRA original lo realizo harness-hub mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado a que el modelo opere como el motor del agente pi en tareas de ingenieria de software y terminal. La model card no detalla la composicion del dataset ni el numero de tokens de entrenamiento. La innovacion principal no esta en la arquitectura del adaptador, sino en el procedimiento de RL sobre trayectorias de agente y en la conversion fiel a mlx-lm que preserva la semantica numerica del LoRA original.

## Capacidades

- Generacion de texto y razonamiento en el contexto de tareas de ingenieria de software.
- Uso de terminal: ejecucion y composicion de comandos de shell, incluidos one-liners de bash.
- Tool calling y function calling: la verificacion del autor confirma que, con la plantilla de chat incluida y thinking desactivado, el modelo produce llamadas a herramientas bien formadas.
- Comportamiento de agente multi-paso: el entrenamiento con RL sobre trayectorias de pi reduce el numero de llamadas a herramientas por tarea entre un 55% y un 64%.
- Pipeline image-text-to-text segun los metadatos del repositorio (capacidad multimodal heredada del modelo base; no se detalla su alcance).
- Modo thinking configurable: la plantilla de chat admite `enable_thinking`; los resultados publicados corresponden a thinking desactivado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de programacion en local sobre Apple Silicon: cargando el adaptador sobre una build MLX 4-bit o 6-bit del modelo base, se obtiene un agente de codigo que cabe en un MacBook Pro de gama alta y no requiere GPU dedicada. Es el caso de uso principal para el que fue entrenado.
- Automatizacion de tareas de terminal: el adaptador esta afinado para traducir instrucciones en lenguaje natural a comandos de shell y secuencias de comandos, lo que permite construir asistentes de operaciones que ejecutan tareas de mantenimiento, busqueda en ficheros o gestion de repositorios.
- Resolucion de issues en repositorios: el salto publicado en SWE-bench Pro (29,4% a 62,7%) lo hace adecuado para pipelines que reciben un issue, localizan el codigo relevante y proponen un parche, con validacion posterior en CI.
- Servidor local compatible con OpenAI: `mlx_lm.server` con `--adapter-path` expone el modelo con `"api": "openai-completions"`, lo que permite conectarlo a pi o a cualquier cliente compatible con la API de OpenAI sin salir de la maquina.
- Alternancia entre modo agente y modo general: al mantener una sola copia del modelo base y activar o desactivar el adaptador, un mismo despliegue puede atender consultas generales y tareas de agente sin duplicar pesos en disco.
- Evaluacion y experimentacion en investigacion: el formato LoRA separable y la equivalencia numerica verificada con el fichero original facilitan reproducir experimentos de RL sobre agentes y comparar el comportamiento con y sin adaptador sobre el mismo modelo base.
- Prototipado de herramientas de desarrollo asistido: con 256 modulos LoRA y una huella de 638 MB, el adaptador se puede versionar y distribuir con facilidad junto a scripts de evaluacion de tareas de codigo.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador original, bajo el agente pi y con thinking desactivado:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |
| Llamadas a herramientas por tarea | referencia | 55-64% menos |

Fidelidad de las builds merged publicadas por NetProjects respecto a bf16:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 99,0% | 0,0015 |
| 8-bit | 30,0 GB | 99,1% | 0,0004 |
| 4-bit | 16,3 GB | 95,6% | 0,0201 |
| bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- Plataforma: Apple Silicon exclusivamente (MLX). No hay soporte CUDA en este repositorio.
- Memoria unificada: la verificacion se realizo en un MacBook Pro M5 Max con 128 GB. El adaptador anade 638 MB sobre la build del modelo base elegida.
- Huella del modelo base por cuantizacion (builds merged del autor): 16,3 GB en 4-bit, 23,1 GB en 6-bit, 30,0 GB en 8-bit y 55,6 GB en bf16.
- Cabida en equipos consumer: la build 4-bit (16,3 GB) es viable en Macs con 24-32 GB de memoria unificada; la 6-bit (23,1 GB) requiere 32 GB o mas; la 8-bit y bf16 requieren configuraciones de 48 GB y 64 GB respectivamente.
- Despliegue: `mlx_lm.generate` para CLI, API Python de `mlx_lm` para integracion y `mlx_lm.server` para servirlo con API compatible con OpenAI. Requiere `mlx-lm>=0.32.2`.
- Versiones verificadas: mlx 0.32.4 y mlx-lm 0.32.2.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este adaptador; para CUDA habria que usar el adaptador original de harness-hub con otro runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-MLX-adapter (este) | 27B (base) + LoRA r32 | No disponible | Agente de codigo y terminal, RL | Apache-2.0 | MLX, Apple Silicon |
| harness-hub/Qwen3.8-27B-pi-adapted | 27B (base) + LoRA | No disponible | Mismo entrenamiento, formato original | Apache-2.0 | Formato original, no MLX |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Modelo general | Apache-2.0 | Multiples runtimes |
| netprojects/Qwen3.8-27B-pi-MLX-6bit | 27B merged | No disponible | Modelo fusionado listo para ejecutar | Apache-2.0 | MLX, 23,1 GB |

La diferencia clave frente al adaptador original es el formato: este repositorio esta transpuesto al layout de mlx-lm y verificado numericamente contra el fichero de harness-hub. Frente a las builds merged, el adaptador permite alternar comportamiento sin duplicar el modelo base, a costa de un paso de carga adicional.

## Limitaciones y advertencias

- No es un modelo autonomo: sin una build MLX de `Qwen/Qwen3.8-27B` no funciona. La model card usa `mlx-community/Qwen3.8-27B-4bit` como referencia.
- Dependencia de plataforma: solo Apple Silicon con MLX; no hay soporte para CUDA, ROCm ni CPU convencional en este repositorio.
- Los benchmarks publicados (Terminal-Bench 2.1 y SWE-bench Pro) provienen de harness-hub y corresponden al adaptador original; NetProjects no ha publicado una reevaluacion propia de estos numeros sobre la version MLX.
- La verificacion funcional del autor es limitada: un tool call bien formado y 3 de 3 tareas cortas de codigo superadas. No equivale a una evaluacion extensa.
- El adaptador esta especializado en tareas de agente de codigo y terminal; su uso como modelo general puede degradar el comportamiento respecto al modelo base. La model card recomienda thinking desactivado para el modo agente.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es relevante en generacion de comandos de shell, donde un comando incorrecto puede tener efectos destructivos. Se recomienda sandbox y revision humana.
- Idiomas soportados: no disponibles; no hay garantia documentada de calidad en castellano.
- Longitud de contexto: no disponible.
- Licencia Apache-2.0, permisiva para uso comercial, pero el aviso NOTICE exige mantener la atribucion a harness-hub y al Qwen Team (Alibaba Cloud).
- Proyecto no afiliado a Hugging Face, harness-hub ni Alibaba; con 0 descargas y 0 likes en el momento de la consulta, la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-adapter
- Adaptador original de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6-bit (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-6bit
- Build MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-4bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-bf16
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Perfil de NetProjects en Hugging Face: https://huggingface.co/netprojects
- Sitio de NetProjects: https://netprojects.com
