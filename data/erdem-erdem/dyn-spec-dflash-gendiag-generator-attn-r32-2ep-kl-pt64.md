# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt64

## Resumen

`dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt64` es un checkpoint de entrenamiento de un drafter (modelo borrador) para decodificacion especulativa, publicado por el usuario erdem-erdem en Hugging Face. No se trata de un modelo generativo autonomo, sino de un artefacto intermedio de un pipeline de investigacion sobre decodificacion especulativa dinamica (dyn-spec) aplicada al drafter DFlash. Concretamente, adapta mediante LoRA (rango 32) el drafter `z-lab/Qwen3-8B-DFlash-b16` para que prediga tokens borrador sobre el modelo objetivo `Qwen/Qwen3-8B`.

El repositorio contiene el estado completo de una ejecucion de entrenamiento: checkpoint con estado del optimizador, metricas, evaluaciones offline y trazabilidad (provenance). Segun la propia model card, no es un bundle de servicio: la exportacion para servir el drafter DFlash aun no esta portada. Su relevancia es, por tanto, para investigadores que trabajen en aceleracion de inferencia mediante speculative decoding y quieran reproducir o extender este experimento concreto.

El entrenamiento consta de 2667 actualizaciones con semilla 42 sobre un almacen de activaciones de 24k ejemplos mixtos (`dyn-spec-dflash-store-qwen3-8b-mix24k`). La validacion sobre 200 filas fijas muestra una mejora marginal de la tasa de aceptacion completa (full_acc) de 0.5265 a 0.5346, con un tau (eal) que pasa de 7.703 a 7.906.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash para decodificacion especulativa; modelo objetivo Qwen3-8B |
| Parametros totales | no disponible (repo de 0.4 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), mas artefactos JSON y parches; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es una adaptacion LoRA de rango 32 (`attn-r32`) sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b`), que actua como generador de tokens borrador para el modelo objetivo `Qwen/Qwen3-8B`. El entrenamiento se realizo en la etapa de pretraining del brazo `direct` del port `dyn-spec` del generador DFlash, con 2667 actualizaciones, semilla 42 y una funcion de perdida que incluye un termino KL (`kl`) y un umbral de truncamiento `pt64`. Los datos provienen de un almacen de activaciones (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), es decir, se entrena sobre activaciones precomputadas del modelo objetivo en lugar de sobre texto en bruto, lo que es habitual en el ajuste de drafters para decodificacion especulativa.

La innovacion principal es el enfoque de decodificacion especulativa dinamica: el drafter se adapta para maximizar la tasa de aceptacion de tokens propuestos, reduciendo el coste por token del modelo objetivo. El repositorio incluye evaluaciones offline con coeficientes M4, donantes M7, similitud D13 y coste D14, lo que sugiere un estudio sistematico de sensibilidad y coste computacional. No se documentan detalles sobre composicion del dataset, numero total de tokens de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa sobre Qwen3-8B (no es un modelo de chat autonomo).
- Prediccion de multiples tokens candidatos por paso para acelerar la inferencia del modelo objetivo.
- Adaptacion especifica al dominio de las activaciones del almacen `mix24k` (mezcla de datos de chat, codigo, matematicas y STEM, segun las metricas de validacion).
- Soporte de evaluacion por categorias: chat, code, math y stem (reportadas en la validacion).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido de forma nativa; su funcion es exclusivamente la propuesta de tokens.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en decodificacion especulativa: reproducir el experimento `direct`/`pretraining` con semilla 42 y comparar la tasa de aceptacion frente al drafter base; el repo incluye `train_command.txt` y `speculators.patch` para facilitar la reproduccion.
- Aceleracion de inferencia de Qwen3-8B en produccion: integrar el drafter adaptado en un servidor compatible con speculative decoding (por ejemplo, vLLM con soporte de drafters) para reducir la latencia por token, aunque la exportacion de servicio no esta incluida y habria que portarla.
- Estudio de sensibilidad de hiperparametros: usar los coeficientes M4 y los donantes M7 de `run/offline_eval/` para analizar como varian las metricas con el rango LoRA, el umbral `pt64` o el termino KL.
- Analisis de coste computacional: emplear las metricas D14 para estimar el ahorro de FLOPs por token aceptado en funcion de la tasa de aceptacion.
- Benchmarking de drafters: comparar este checkpoint con el drafter original `z-lab/Qwen3-8B-DFlash-b16` sobre las 200 filas fijas de validacion para cuantificar la ganancia de la adaptacion.
- Base para futuros ajustes: partir de este checkpoint (con estado del optimizador) para continuar el entrenamiento con mas actualizaciones o con otro almacen de activaciones, gracias a la trazabilidad completa incluida en `provenance/`.

## Benchmarks y rendimiento

| Metrica | Update 0 (base) | Update 2667 (final) |
|---|---|---|
| full_acc | 0.5265 | 0.5346 |
| tau (eal) | 7.703 | 7.906 |
| chat | 0.3463 | 0.3525 |
| code | 0.5956 | 0.6061 |
| math | 0.6775 | 0.6848 |
| stem | 0.4866 | 0.4951 |

Validacion sobre 200 filas fijas, una fila por LoRA. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el drafter se usa junto a Qwen3-8B, que en FP16 requiere aproximadamente 16 GB solo para los pesos del modelo objetivo, mas el drafter y las cachés KV.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo objetivo, se necesitarian GPU con al menos 24 GB (RTX 4090, L40S, A100 40 GB, H100) para FP16, o menos con cuantizacion del objetivo.
- Cabe en GPU de consumo: probablemente si para el drafter solo; para el par completo, una RTX 4090 de 24 GB podria ser justa en FP16 y requeriria cuantizacion.
- Opciones de despliegue: el repo no incluye bundle de servicio; la model card indica que la exportacion DFlash para servir no esta portada. Habria que portarla a vLLM u otro motor con soporte de speculative decoding.
- Latencia y throughput: no disponibles; la mejora de tau de 7.703 a 7.906 sugiere un incremento moderado en tokens aceptados por paso, pero no se reportan medidas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt64 | LoRA drafter (checkpoint) | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: es un checkpoint de entrenamiento con estado del optimizador; requiere conversion y exportacion para su uso en inferencia.
- Licencia no especificada: no se puede confirmar el uso comercial; ademas, hereda las condiciones del drafter base y del modelo objetivo Qwen3-8B, que deben verificarse por separado.
- Rendimiento marginal: la mejora en full_acc es de solo 0.0081 puntos absolutos (de 0.5265 a 0.5346), lo que puede no justificar el coste en produccion.
- Especifico de dominio: entrenado sobre el almacen `mix24k`; su comportamiento fuera de esa distribucion (otros idiomas, dominios o estilos) no esta validado.
- Sin datos de sesgos, alucinacion o seguridad: al no ser un modelo generativo autonomo, el riesgo de alucinacion se traslada al modelo objetivo, no al drafter.
- Idiomas no documentados: no se puede garantizar soporte multilingue.
- Repositorio con 0 descargas y 0 likes: sin validacion externa por parte de la comunidad.
- Fecha de creacion futura (2026-11-17) en los metadatos: conviene verificar la integridad y procedencia antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt64
- Almacen de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
