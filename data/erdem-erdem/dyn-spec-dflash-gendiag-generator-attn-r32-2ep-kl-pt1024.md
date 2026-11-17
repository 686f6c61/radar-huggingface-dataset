# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt1024

## Resumen

El modelo `dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt1024`, publicado por el usuario erdem-erdem en Hugging Face, no es un modelo de lenguaje generativo al uso, sino un *checkpoint* de entrenamiento de un *drafter* para decodificacion especulativa (speculative decoding) construido sobre la arquitectura DFlash. El artefacto forma parte de una adaptacion de un drafter DFlash preentrenado (`z-lab/Qwen3-8B-DFlash-b16`) para el modelo objetivo Qwen3-8B, mediante un entrenamiento de tipo LoRA (rango 32) durante dos epocas y 2667 actualizaciones, con una funcion de perdida KL y un tamano de prefijo de 1024 tokens (`pt1024`).

El repositorio contiene el estado completo del entrenamiento (incluido el estado del optimizador), resultados, evaluaciones offline y trazabilidad (provenance) del proceso. Segun la propia model card, se trata de un *training checkpoint* y no de un paquete listo para servir: la exportacion de servicio de DFlash aun no se ha portado. Por tanto, su utilidad practica es de investigacion y reproducibilidad, no de despliegue directo en produccion.

La relevancia de este artefacto es acotada pero tecnica: documenta un experimento de adaptacion de drafters para acelerar la inferencia de Qwen3-8B mediante decodificacion especulativa, con metricas de validacion y evaluacion offline publicadas en el propio repositorio. No se dispone de informacion sobre licencia, idiomas, pipeline ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash (drafter de decodificacion especulativa) sobre LoRA de rango 32 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (prefijo de entrenamiento de 1024 tokens, `pt1024`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch); no hay exportacion de servicio ni GGUF/safetensors publicados |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | `z-lab/Qwen3-8B-DFlash-b16@9b41424b7109f9c5413454f481b09a82b85333f4` |
| Brazo / etapa | `direct` / `pretraining` |
| Actualizaciones de entrenamiento | 2667 |
| Semilla | 42 |
| Git SHA | `eb4f2f99cd271535015cae3de5b96aea504f62b1` |
| SHA256 del checkpoint | `feeff4a63e1ad2158ad6b4373547aaeaaacf3b76b78f3b8f86bbc19a49723349` |
| Tamano del repositorio | 5.3 GB |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

El artefacto es un *drafter* DFlash adaptado mediante LoRA de rango 32 sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, que actua como modelo especulador para Qwen3-8B. El entrenamiento corresponde al brazo `direct` en etapa de `pretraining`, con 2667 actualizaciones, semilla 42 y una perdida KL (`kl`), con prefijo de 1024 tokens (`pt1024`) y dos epocas (`2ep`). El identificador del modelo resume estos hiperparametros: `gendiag-generator-attn-r32-2ep-kl-pt1024`.

El proceso de entrenamiento se apoya en un *activation store* externo (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), con registros de identidad del store, extractor, lanzamiento de vLLM y rellenos. El repositorio incluye `run/` con `run_record_*.json`, `inputs/`, `pretraining/gendiag-generator-attn-r32-2ep-kl-pt1024/` (con `checkpoint.pt`, `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, `speculators.patch` y `provenance/`), ademas de `provenance/store/` y un `MANIFEST.json` con tamano y SHA256 de cada fichero. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales de RLHF o DPO.

## Capacidades

- No es un modelo generativo independiente: es un drafter de decodificacion especulativa para Qwen3-8B.
- Su funcion es proponer tokens candidatos que el modelo objetivo verifica, con el objetivo de acelerar la inferencia.
- Entrenado con perdida KL frente a las distribuciones del modelo objetivo, lo que orienta la propuesta de tokens hacia las salidas de Qwen3-8B.
- Soporte de tool calling, agentes, vision o audio: no disponible (depende del modelo objetivo, no del drafter).
- Capacidades multilingues: no disponibles de forma especifica; heredadas del modelo objetivo Qwen3-8B, no documentadas para este artefacto.
- Modo thinking: no disponible.

## Casos de uso

- Investigacion en decodificacion especulativa: el checkpoint permite reproducir y analizar el entrenamiento de un drafter DFlash para Qwen3-8B, con registros de entrenamiento, metricas y procedencia completos.
- Reproducibilidad de experimentos: el `MANIFEST.json`, el SHA256 del checkpoint, el Git SHA y la semilla 42 permiten reconstruir el entorno y verificar la integridad de los artefactos.
- Estudio de adaptacion LoRA de drafters: el uso de rango 32, dos epocas y perdida KL sobre un drafter preentrenado sirve como referencia para experimentos de adaptacion a otros modelos objetivo.
- Analisis de metricas de aceptacion especulativa: los resultados de validacion (full_acc, τ eal, chat, code, math, stem) permiten estudiar el comportamiento del drafter por dominio.
- Base para portar la exportacion de servicio DFlash: dado que la model card indica que la exportacion de servicio aun no se ha portado, este checkpoint es el punto de partida para desarrollar dicho port.
- Auditoria de procedencia de entrenamiento: los registros de store, extractor y lanzamiento de vLLM documentan la cadena de generacion de datos de activacion, util para trazabilidad en investigacion.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de validacion del propio entrenamiento (200 filas fijas, una fila por LoRA, metrica `full_acc`):

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5339 | 7.903 | 0.3518 | 0.6055 | 0.6835 | 0.4949 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Ademas, el repositorio incluye evaluaciones offline en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14 y metricas por fila), pero sus valores numericos no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5.3 GB e incluye estado del optimizador, por lo que el tamano del checkpoint no equivale al de un modelo listo para servir.
- GPU recomendadas: no disponibles. Al depender del modelo objetivo Qwen3-8B (8 mil millones de parametros), el despliegue real requeriria recursos propios de ese modelo, pero no se documentan requisitos especificos para el drafter.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. La model card indica explicitamente que no es un paquete de servicio y que la exportacion DFlash aun no se ha portado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (drafters DFlash para Qwen3-8B) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un checkpoint de entrenamiento con estado del optimizador, sin exportacion de servicio.
- Depende de Qwen3-8B como modelo objetivo; no funciona de forma autonoma.
- Licencia no disponible: no se puede confirmar si permite uso comercial.
- Idiomas soportados no documentados.
- No se han publicado benchmarks estandar, por lo que no es posible comparar su calidad con alternativas.
- Las metricas de validacion son limitadas (200 filas fijas) y no garantizan generalizacion.
- Riesgo de alucinacion y sesgos: no documentados para este artefacto; en ultima instancia dependen del modelo objetivo.
- El repositorio incluye datos de procedencia y un store de activaciones externo cuyo acceso y condiciones no se detallan.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt1024
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Resultado de busqueda web no relacionado (Erdem & Erdem, bufete de abogados): https://www.erdem-erdem.av.tr/en
