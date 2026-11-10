# erdem-erdem/dyn-spec-dflash-d2-static-lora-attn-r32-4k-1500-layer0

## Resumen

`d2-static-lora-attn-r32-4k-1500-layer0` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem dentro del ecosistema dyn-spec, orientado a la adaptacion de un drafter de decodificacion especulativa DFlash. No se trata de un modelo generativo autonomo, sino de un artefacto intermedio de investigacion: un adaptador LoRA (rango 32, aplicado a las capas de atencion) entrenado durante 1500 actualizaciones sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, cuyo modelo objetivo es Qwen/Qwen3-8B.

El artefacto corresponde al brazo `fresh_lora` en la etapa de pretraining de un pipeline de adaptacion de drafters. Su proposito es mejorar la tasa de aceptacion de tokens especulados al servir Qwen3-8B, reduciendo la latencia de decodificacion sin modificar los pesos del modelo objetivo. El repositorio incluye el checkpoint con estado del optimizador, resultados de validacion, evaluaciones offline y trazabilidad completa (provenance), pero no constituye un bundle de serving: la exportacion DFlash para inferencia no esta portada.

La relevancia es acotada y experimental. El repo registra 0 descargas y 0 likes, un tamano de 0.0 GB y no declara licencia ni idiomas. Los resultados de validacion muestran una mejora marginal: la puntuacion full_acc pasa de 0.5246 en la actualizacion 0 a 0.5269 en la 1500, con un incremento del ratio de aceptacion τ (eal) de 7.108 a 7.188.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre drafter de decodificacion especulativa DFlash (rango 32, atencion) |
| Parametros totales | no disponible (adaptador LoRA; el drafter base es `z-lab/Qwen3-8B-DFlash-b16`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4k (segun el nombre del artefacto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de serving |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado a las capas de atencion del drafter DFlash `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), que actua como generador de tokens especulativos para el modelo objetivo Qwen/Qwen3-8B. La adaptacion se ejecuta en la etapa de pretraining del brazo `fresh_lora` del port del generador dyn-spec DFlash, con 1500 actualizaciones, semilla 42 y SHA de git `637dd9ee61365744c1a7cacb232f05d5a44f90b0`.

El entrenamiento utiliza un activation store dedicado (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), con contexto de 4k, y el checkpoint incluye el estado del optimizador junto con los registros de ejecucion (`run_record_*.json`, `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, `speculators.patch`) y la trazabilidad del store (identidad, registro del extractor, procedencia del lanzamiento de vLLM y registros de relleno). El repositorio incorpora evaluaciones offline en `run/offline_eval/` con reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14 con metricas por fila.

## Capacidades

- No es un modelo generativo: es un adaptador LoRA para un drafter de decodificacion especulativa.
- Acelera la inferencia del modelo objetivo Qwen/Qwen3-8B mediante propuesta de tokens candidatos.
- Entrenado sobre un activation store con contexto de 4k para Qwen3-8B.
- Incluye checkpoint con estado del optimizador, apto para reanudar entrenamiento o analisis.
- Proporciona evaluaciones offline con metricas por fila (reproduccion, M4, M7, D13, D14).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues por si mismo.
- No incluye bundle de serving: la exportacion DFlash para inferencia no esta portada.

## Casos de uso

- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para estudiar el efecto de adaptadores LoRA sobre drafters DFlash, con semilla, SHA y provenance documentados.
- Reproduccion de experimentos: el `train_command.txt`, el `speculators.patch` y el `MANIFEST.json` con SHA256 de cada fichero permiten replicar la ejecucion exacta.
- Analisis de tasa de aceptacion: los datos de validacion (τ eal de 7.108 a 7.188 sobre 200 filas fijas) permiten comparar brazos y etapas del pipeline dyn-spec.
- Reanudacion de entrenamiento: al incluir el estado del optimizador, el checkpoint puede retomarse para extender las actualizaciones o cambiar hiperparametros.
- Estudio de especializacion por dominio: las metricas desagregadas (chat, code, math, stem) permiten analizar donde el adaptador aporta o no mejora.
- Base para portar el export de serving: el artefacto documenta la identidad del store y del drafter, util para quien aborde la exportacion DFlash pendiente.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica full_acc:

| Actualizacion | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5269 | 7.188 | 0.3412 | 0.5724 | 0.6811 | 0.5129 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no es un bundle de serving y su despliegue requiere integrarlo con el drafter base y el modelo objetivo Qwen3-8B.
- GPU recomendadas: no disponibles en la informacion proporcionada; el entrenamiento referencia un lanzamiento de vLLM en la provenance, sin especificar hardware.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la exportacion DFlash para serving no esta portada.
- Latencia y throughput: no disponibles; solo se documenta el ratio de aceptacion τ (eal) de 7.188 en la actualizacion 1500.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d2-static-lora-attn-r32-4k-1500-layer0 | Adaptador LoRA sobre drafter DFlash | no disponible | 4k | no disponible | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Qwen/Qwen3-8B | Modelo objetivo generativo | 8B | no disponible | no disponible | Hugging Face (referenciado) |

No se dispone de datos de rendimiento comparables entre alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto de forma autonoma ni puede usarse como chatbot o API de completado.
- No es un bundle de serving: la exportacion DFlash para inferencia no esta portada, por lo que no puede desplegarse directamente.
- Mejora marginal: full_acc sube 0.0023 y τ (eal) 0.080 entre las actualizaciones 0 y 1500, lo que limita su impacto practico.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni condiciones de redistribucion.
- Idiomas no declarados: no se especifica cobertura linguistica.
- Sin datos de sesgos ni de alucinacion: al no ser un modelo generativo, estas advertencias aplican al modelo objetivo Qwen3-8B, no a este artefacto.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin evidencia de validacion externa.
- Fecha de creacion futura (2026-11-10) y tamano de repo de 0.0 GB, lo que sugiere metadatos incompletos o un artefacto no consolidado.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d2-static-lora-attn-r32-4k-1500-layer0
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: Qwen/Qwen3-8B
