# netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-6bit es una cuantizacion en 6 bits, en formato MLX, del adaptador LoRA `harness-hub/Qwen3.8-27B-hermes-adapted` fusionado sobre el modelo base `Qwen/Qwen3.8-27B`. Lo publica el usuario `netprojects` y esta pensado especificamente para ejecutarse en Apple Silicon mediante la libreria MLX (mlx-lm y mlx-vlm). El modelo conserva el encoder de vision y la capa MTP (multi-token prediction) de Qwen, por lo que mantiene la modalidad image-text-to-text ademas de la generacion de texto.

El interes del modelo reside en el ajuste fino con aprendizaje por refuerzo (AsyncGRPO en TRL, LoRA de rango 32 y alpha 64, checkpoint en el paso 160 de 1000) que harness-hub aplico para convertirlo en el motor detras de Hermes Agent, un agente de ingenieria de software y tareas de terminal. Segun los resultados publicados por el autor del adaptador, con el modo thinking desactivado mejora SWE-bench Pro (hard 51) del 29,4 % al 43,1 % y Terminal-Bench 2.1 del 44,7 % al 58,8 % respecto al modelo base, usando menos del 40 % de los turnos del base en las tareas que ambos resuelven y aproximadamente la mitad de tokens generados.

Esta build concreta cuantiza las capas lineales a 6 bits (afinidad, grupo 64) y ocupa 23,1 GB, lo que la convierte en la opcion recomendada por el autor para Macs con 48 GB o mas. Con 27.781.427.952 parametros reales en safetensors, es una alternativa practica para desplegar un agente de codigo de gran tamano en hardware de consumo Apple sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con encoder de vision y capa MTP; pesos en MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (Hermes Agent requiere al menos 64.000 tokens de contexto) |
| Tipos de cuantizacion | 6 bits (afinidad, grupo 64); la familia incluye 8, 4, 3, 2.5 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer con encoder de vision integrado y una capa de prediccion multi-token (MTP). Sobre esa base, harness-hub entreno un LoRA (rango 32, alpha 64) mediante aprendizaje por refuerzo con AsyncGRPO implementado en TRL, con un checkpoint intermedio en el paso 160 de los 1000 planificados. El objetivo del entrenamiento era optimizar el comportamiento como agente de software y terminal: reducir turnos necesarios, disminuir tokens generados y aumentar la tasa de exito en tareas de reparacion de codigo y uso de shell. El adaptador se fusiono sobre el modelo base (revision `3756181`) y se convirtio a MLX con mlx-vlm, incluyendo el encoder de vision y la capa MTP.

La cuantizacion de esta build es de 6 bits con esquema affine y tamano de grupo 64, aplicada a las capas lineales. El autor reporta que el 98,5 % de los siguientes tokens coinciden con la version bf16 y una divergencia KL de 0,0015 frente a bf16, lo que la situa como el mejor equilibrio entre tamano y fidelidad de la familia. El adaptador se entreno y evaluo con el modo thinking desactivado, por lo que se recomienda mantenerlo asi en produccion.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y resolucion de tareas de ingenieria de software (reparacion de bugs, edicion de codigo).
- Ejecucion de tareas de terminal y shell mediante agentes.
- Soporte de tool calling y function calling a traves del servidor compatible con OpenAI de mlx-lm.
- Razonamiento multi-paso orientado a agentes (entrenado con Hermes Agent).
- Capacidades de vision al conservar el encoder de imagen de Qwen (pipeline image-text-to-text).
- Modo thinking disponible en el modelo base, aunque el adaptador se entreno con thinking off.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de reparacion de bugs en repositorios: integrado con Hermes Agent, el modelo puede recibir un fallo de tests, inspeccionar el codigo y aplicar un parche. Los resultados publicados en SWE-bench Pro (43,1 % en hard 51) lo respaldan para este escenario.
- Automatizacion de tareas de terminal: con Terminal-Bench 2.1 al 58,8 %, es adecuado para flujos donde el agente debe ejecutar comandos, interpretar salidas y corregir errores en cadena.
- Asistente de codigo en local para desarrolladores con Mac: al caber en 23,1 GB y requerir 36 GB o mas de memoria recomendada, permite trabajar con un modelo de 27B sin enviar codigo a la nube.
- Pipeline de CI/CD con agente de correccion: sirviendo el modelo con `mlx_lm.server` en modo compatible con OpenAI y configurando Hermes Agent, se puede lanzar un agente que diagnostique fallos de build y proponga parches de forma automatizada.
- Analisis de capturas o diagramas tecnicos: al conservar el encoder de vision, puede procesar imagenes junto a texto para tareas como interpretar errores en pantalla o diagramas de arquitectura.
- Prototipado de agentes con tool calling: el soporte de function calling permite conectar el modelo a APIs internas, bases de datos o sistemas de tickets en un entorno de desarrollo local.
- Evaluacion de estrategias de agente con bajo consumo de tokens: al usar aproximadamente la mitad de tokens que el base en tareas equivalentes, reduce coste y latencia en bucles de agente largos.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador, con Hermes Agent y thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Qwen3.8-27B-hermes-adapted |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4 % | 43,1 % |
| Terminal-Bench 2.1 | 44,7 % | 58,8 % |

Metricas de fidelidad de la cuantizacion de esta build (6 bits) frente a bf16:

| Metrica | Valor |
|---|---|
| Coincidencia del siguiente token con bf16 | 98,5 % |
| Divergencia KL frente a bf16 | 0,0015 |
| GSM8K (50 preguntas) | 46/50 |
| Memoria pico con prompt de 8K tokens | 23,4 GB |

Comparativa interna de la familia de cuantizaciones (datos del autor):

| Build | Tamano | Coincidencia siguiente token | KL vs bf16 | GSM8K | Memoria pico (8K) | Mac sugerido |
|---|---|---|---|---|---|---|
| 6-bit (esta) | 23,1 GB | 98,5 % | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| 8-bit | 30,0 GB | 99,2 % | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| 4-bit | 16,3 GB | 96,1 % | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| 3-bit | 13,8 GB | 91,7 % | 0,0824 | 45/50 | 14,6 GB | 24 GB+ |
| 2.5-bit | 11,8 GB | 85,4 % | 0,2461 | 44/50 | 13,8 GB | 24 GB+ |
| bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- Memoria: 23,4 GB de pico con un prompt de 8K tokens; el autor recomienda un Mac con 36 GB o mas (idealmente 48 GB).
- Hardware objetivo: Apple Silicon exclusivamente, ya que el formato es MLX. No se ha publicado soporte para GPU NVIDIA en esta build.
- Cabe en Macs de 48 GB (recomendado) y de 64 GB o mas; en 32 GB se recomienda la build de 4 bits y en 24 GB la de 3 bits.
- Despliegue: mlx-lm (servidor compatible con OpenAI via `mlx_lm.server`), mlx-vlm para vision, LM Studio con soporte MLX y Hermes Agent como cliente de agente.
- Ajuste opcional de memoria: `sudo sysctl iogpu.wired_limit_mb=12800` para permitir mas memoria de GPU (se pierde al reiniciar).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-MLX-6bit (esta build) | 27,8B | no disponible | MLX, 6 bits | Apache 2.0 | Optimizado para agentes de codigo en Apple Silicon |
| Qwen3.8-27B-hermes-adapted-MLX-8bit | 27,8B | no disponible | MLX, 8 bits | Apache 2.0 | Mayor fidelidad (99,2 %), 30,0 GB |
| Qwen3.8-27B-hermes-adapted-MLX-4bit | 27,8B | no disponible | MLX, 4 bits | Apache 2.0 | Menor huella (16,3 GB), fidelidad 96,1 % |
| harness-hub/Qwen3.8-27B-hermes-adapted | 27,8B | no disponible | safetensors (LoRA) | Apache 2.0 | Adaptador original sin cuantizar |
| Qwen/Qwen3.8-27B | 27,8B | no disponible | safetensors | Apache 2.0 | Modelo base sin el ajuste de agente |

## Limitaciones y advertencias

- El adaptador se entreno y evaluo con thinking desactivado; activarlo puede degradar el comportamiento esperado.
- La cuantizacion a 6 bits introduce una divergencia pequena pero no nula (KL 0,0015; 98,5 % de coincidencia de siguiente token), lo que puede afectar a tareas de alta precision.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA sin reconversion.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos.
- Hermes Agent exige al menos 64.000 tokens de contexto, pero la longitud de contexto real del modelo no se documenta en esta ficha.
- Los resultados de SWE-bench Pro y Terminal-Bench 2.1 provienen del autor del adaptador y estan medidos con Hermes Agent; no son directamente comparables con otras configuraciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen y del adaptador original.
- El checkpoint del LoRA esta en el paso 160 de 1000 planificados, por lo que puede existir margen de mejora no explotado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-3bit
- Build de 2.5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Adaptador MLX: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-GGUF
- Repositorio de Hermes Agent: https://github.com/NousResearch/hermes-agent
