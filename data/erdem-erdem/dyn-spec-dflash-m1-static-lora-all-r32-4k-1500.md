# erdem-erdem/dyn-spec-dflash-m1-static-lora-all-r32-4k-1500

## Resumen

`dyn-spec-dflash-m1-static-lora-all-r32-4k-1500` es un checkpoint de entrenamiento de un *drafter* (modelo borrador) para decodificacion especulativa, desarrollado por el usuario de Hugging Face `erdem-erdem` dentro de un port del generador DFlash denominado dyn-spec. No es un modelo de lenguaje autonomo, sino un adaptador LoRA de rango 32 entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, cuyo modelo objetivo es `Qwen/Qwen3-8B`. El objetivo del artefacto es acelerar la inferencia del modelo grande mediante decodificacion especulativa: el drafter propone varios tokens que el modelo objetivo verifica en paralelo.

El repositorio contiene exclusivamente material de entrenamiento y evaluacion (checkpoint con estado del optimizador, resultados, evaluaciones offline y procedencia completa), no un paquete listo para servir. El autor indica explicitamente que la exportacion de servicio de DFlash aun no esta portada, por lo que el artefacto no puede desplegarse directamente como drafter en produccion sin trabajo adicional de integracion.

La relevancia de este checkpoint es acotada y de caracter experimental: se trata de la "arm" `fresh_lora` en etapa de pretraining, con 1500 actualizaciones y semilla 42, sobre un almacen de activaciones de 4k. Su interes principal es de reproducibilidad e investigacion sobre decodificacion especulativa, no de uso como modelo generativo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash para decodificacion especulativa; modelo objetivo Qwen3-8B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el almacen de activaciones se denomina "4k") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de servicio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 (`r32`) entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), que actua como generador de propuestas en un esquema de decodificacion especulativa contra el modelo objetivo `Qwen/Qwen3-8B`. El entrenamiento corresponde a la arm `fresh_lora` en etapa de `pretraining`, con 1500 actualizaciones, semilla 42 y un almacen de activaciones de 4k (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`). El identificador del run incluye la etiqueta `m1-static-lora-all-r32-4k-1500`, que refleja la configuracion estatica del LoRA, el rango y el numero de pasos.

La validacion se realizo sobre 200 filas fijas con un LoRA por fila y metrica `full_acc`. Los resultados muestran una mejora marginal entre la actualizacion 0 y la 1500: la puntuacion global pasa de 0.5246 a 0.5297 y la longitud media de aceptacion (τ, eal) de 7.108 a 7.244. Por dominio, chat pasa de 0.3383 a 0.3427, code de 0.5699 a 0.5759, math de 0.6796 a 0.6835 y stem de 0.5105 a 0.5167. El repositorio incluye evaluaciones offline adicionales en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14) con metricas por fila.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre Qwen3-8B (funcion de drafter, no de modelo generativo autonomo).
- Aceleracion de inferencia del modelo objetivo mediante verificacion paralela de candidatos.
- Evaluacion por dominios diferenciados: chat, code, math y stem, segun la validacion del autor.
- Entrenamiento con LoRA de rango 32 sobre un almacen de activaciones de 4k.
- No soporta tool calling, function calling ni uso como agente de forma directa: es un componente interno de un pipeline de decodificacion.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion en decodificacion especulativa: el checkpoint permite reproducir el entrenamiento del drafter DFlash sobre Qwen3-8B con la configuracion exacta (1500 pasos, semilla 42) y comparar contra la actualizacion 0 como linea base.
- Estudio de adaptadores LoRA para drafters: el rango 32 y la etiqueta `static-lora` permiten analizar el efecto del rango y la estrategia estatica en la tasa de aceptacion (τ) por dominio.
- Analisis de dominios con distinto comportamiento: los resultados por chat, code, math y stem permiten identificar donde el drafter aporta mas y donde la aceptacion es mas baja (chat, 0.3427, es el dominio mas debil).
- Reproduccion de evaluaciones offline: los directorios `run/offline_eval/` con coeficientes M4, donantes M7, similitud D13 y coste D14 sirven para validar pipelines de evaluacion de drafters.
- Auditoria de procedencia: `provenance/store/` y `MANIFEST.json` permiten verificar la identidad del almacen de activaciones, el extractor y el lanzamiento de vLLM usado en la generacion de datos.
- Base para portar la exportacion de servicio de DFlash: el checkpoint es el punto de partida para completar la integracion de serving que el autor indica como pendiente.

## Benchmarks y rendimiento

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5297 | 7.244 | 0.3427 | 0.5759 | 0.6835 | 0.5167 |

Validacion sobre 200 filas fijas, un LoRA por fila. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es un checkpoint de entrenamiento con estado del optimizador, no un bundle de servicio.
- GPU recomendadas: no disponibles. El modelo objetivo es Qwen3-8B, por lo que la inferencia del sistema completo requeriria hardware capaz de servir un modelo de 8B; el drafter anade overhead adicional no cuantificado en la informacion disponible.
- Cabe en GPU consumer: no determinado; depende de la cuantizacion del modelo objetivo y del drafter, datos no publicados.
- Opciones de despliegue: el autor indica que la exportacion de servicio de DFlash no esta portada; vLLM aparece mencionado en la procedencia (`provenance/store/`) como motor usado para extraer activaciones, no como opcion de serving del artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-m1-static-lora-all-r32-4k-1500 | LoRA r32 sobre drafter DFlash | no disponible | no disponible (store 4k) | no disponible | Checkpoint de entrenamiento, sin export de serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo base del drafter |
| Qwen/Qwen3-8B | Modelo objetivo (LLM) | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo de lenguaje completo |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autonoma: es un drafter para decodificacion especulativa y requiere el modelo objetivo Qwen3-8B y un runtime compatible.
- El autor declara explicitamente que no es un bundle de servicio y que la exportacion DFlash de serving aun no esta portada; no puede desplegarse en produccion sin trabajo de integracion.
- La mejora medida entre la actualizacion 0 y la 1500 es muy pequena (score 0.5246 a 0.5297; τ 7.108 a 7.244), por lo que el beneficio practico del checkpoint frente al punto de partida es marginal.
- El dominio chat presenta la tasa de aceptacion mas baja (0.3427), lo que sugiere peor comportamiento en conversacion que en math o code.
- Licencia no disponible: no puede asumirse uso comercial sin verificacion previa con el autor.
- Idiomas soportados no disponibles; el comportamiento multilingue del drafter no esta documentado.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible; al ser un drafter, los tokens propuestos son verificados por el modelo objetivo, lo que mitiga parcialmente el riesgo, pero no se documentan analisis al respecto.
- El repositorio es de 0.1 GB y contiene estado del optimizador, lo que incrementa el tamano respecto a un adaptador limpio.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m1-static-lora-all-r32-4k-1500
- Almacen de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
