# erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r32-2ep-kl-pt256

## Resumen

El repositorio `erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r32-2ep-kl-pt256` contiene un checkpoint de entrenamiento de un *drafter* de decodificacion especulativa (speculative decoding) construido sobre la familia DFlash. No es un modelo generativo autonomo: es un adaptador LoRA de tipo *generator* que se acopla a un modelo objetivo `Qwen/Qwen3-8B` para proponer tokens candidatos que el modelo grande verifica despues. El autor lo publica como material de investigacion reproducible, con estado del optimizador, metricas, evaluaciones offline y trazabilidad completa del proceso.

El entrenamiento corresponde al brazo `direct` de la etapa de *pretraining*, con 2667 actualizaciones, semilla 42 y un *activation store* de 24k ejemplos (`mix24k`). El adaptador usa rango LoRA 32 y se apoya en el drafter base `z-lab/Qwen3-8B-DFlash-b16`, fijado a un commit concreto. La relevancia practica esta en que la decodificacion especulativa es una de las tecnicas mas extendidas para reducir latencia en inferencia de LLM sin degradar la calidad de salida, y este repo documenta un intento concreto de adaptar el drafter al target mediante LoRA.

El checkpoint no incluye bundle de servicio: el autor indica explicitamente que la exportacion para servir el drafter DFlash aun no esta portada. Por tanto, su uso previsto es la experimentacion y la reproduccion de resultados, no el despliegue directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DFlash con adaptador LoRA (rango 32) sobre `z-lab/Qwen3-8B-DFlash-b16` |
| Parametros totales | no disponible (el repo pesa 1.4 GB e incluye estado del optimizador, no solo pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) con estado del optimizador; no hay safetensors ni GGUF publicados |
| Modelo objetivo | `Qwen/Qwen3-8B` |
| Drafter base | `z-lab/Qwen3-8B-DFlash-b16@9b41424b7109f9c5413454f481b09a82b85333f4` |
| Brazo / etapa | `direct` / `pretraining` |
| Actualizaciones de entrenamiento | 2667 |
| Semilla | 42 |
| Git SHA | `118c8ef45b09edd3a1a30f049a6fefbfb0a50c1e` |
| SHA256 del checkpoint | `746e034de2217d302213d542048bdbe9916ac921a1392aff5bfc430889578521` |
| Activation store | `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k` |

## Arquitectura y entrenamiento

El objeto entrenado es un drafter de decodificacion especulativa de la familia DFlash, adaptado mediante LoRA de rango 32 sobre el checkpoint `z-lab/Qwen3-8B-DFlash-b16`. El drafter propone secuencias cortas de tokens que el modelo objetivo `Qwen/Qwen3-8B` valida en paralelo; el beneficio depende de la tasa de aceptacion de esas propuestas. La adaptacion se realiza en la etapa de *pretraining* del brazo `direct`, con 2667 actualizaciones y semilla 42, sobre un *activation store* de 24k ejemplos (`mix24k`) generado a partir del modelo objetivo.

El entrenamiento incluye una componente KL (indicada en el nombre del run, `kl`), y se documentan coeficientes de evaluacion offline (M4, M7, D13, D14) en `run/offline_eval/`. El paquete de reproducibilidad incluye `train_command.txt`, `speculators.patch`, `timing.json`, `metrics.json` y `provenance/` con la identidad del store de activaciones, el registro del extractor y la trazabilidad del lanzamiento de vLLM usado para generar las activaciones. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre `Qwen/Qwen3-8B`.
- Aceleracion de inferencia del modelo objetivo mediante verificacion paralela de candidatos.
- Adaptacion especifica al target mediante LoRA de rango 32, lo que permite ajustar el drafter al dominio o distribucion del modelo grande.
- Trazabilidad completa del entrenamiento: checkpoint con estado del optimizador, metricas, comandos y procedencia.
- Evaluacion offline reproducible con coeficientes y metricas por fila.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo *thinking* propias del drafter; el drafter hereda el comportamiento del target solo en la medida en que sus propuestas son aceptadas.

## Casos de uso

- Aceleracion de inferencia en produccion: el drafter propone tokens que `Qwen3-8B` verifica en paralelo, reduciendo la latencia por token generado en servicios de chat o generacion de texto con el modelo objetivo.
- Investigacion en decodificacion especulativa: el repo permite reproducir el entrenamiento del brazo `direct` con semilla fija, checkpoint SHA256 y comandos de entrenamiento, util para comparar variantes de LoRA y coeficientes KL.
- Ajuste de drafters a dominios concretos: al ser un adaptador LoRA, se puede reentrenar sobre un *activation store* especifico del dominio (por ejemplo, codigo o matematicas) para mejorar la tasa de aceptacion en ese dominio.
- Evaluacion de tecnicas de compresion de drafters: el paquete de evaluacion offline (M4, M7, D13, D14) permite medir el impacto de distintas configuraciones sobre la calidad de las propuestas.
- Benchmarking de pipelines de inferencia: sirve para medir el *speedup* real de la decodificacion especulativa frente a la generacion autoregresiva estandar con `Qwen3-8B` en distintos backends (vLLM, entre otros).
- Base para portar la exportacion de servicio DFlash: el autor indica que la exportacion de serving aun no esta portada, por lo que este checkpoint es el punto de partida para completar ese trabajo.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5345 | 7.903 | 0.3526 | 0.6067 | 0.6843 | 0.4943 |

El entrenamiento mejora el score agregado de 0.5265 a 0.5345 y la longitud media de aceptacion (τ) de 7.703 a 7.903. Las mejoras por dominio son moderadas: chat +0.0063, code +0.0111, math +0.0068 y stem +0.0077. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repo pesa 1.4 GB e incluye el estado del optimizador, no solo los pesos del adaptador LoRA; el espacio en disco necesario para cargarlo es superior al de un adaptador LoRA tipico.
- Al ser un adaptador sobre `Qwen3-8B`, la inferencia requiere cargar el modelo objetivo de 8B parametros ademas del drafter. En FP16, solo el target ocupa aproximadamente 16 GB de VRAM, a lo que se suma el drafter y las estructuras de verificacion.
- GPU recomendadas para el conjunto target + drafter: A100 40/80 GB, H100 80 GB o RTX 4090 24 GB con cuantizacion del target. No hay datos publicados de VRAM medida para este checkpoint concreto.
- No se especifican opciones de despliegue soportadas; el autor indica que la exportacion de serving DFlash no esta portada, por lo que vLLM, llama.cpp, Ollama o TGI no estan confirmados para este artefacto.
- No se publican datos de latencia ni throughput medidos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-generator-attn-r32-2ep-kl-pt256 | no disponible (repo 1.4 GB con optimizador) | no disponible | Drafter LoRA sobre DFlash | no disponible | Checkpoint de entrenamiento, sin bundle de serving |
| `z-lab/Qwen3-8B-DFlash-b16` (drafter base) | no disponible | no disponible | Drafter DFlash | no disponible | Publicado en Hugging Face |
| `Qwen/Qwen3-8B` (target) | 8B | no disponible en esta ficha | LLM denso | no disponible en esta ficha | Publicado en Hugging Face |

No se dispone de datos de rendimiento comparables entre estos artefactos en la informacion proporcionada; la comparativa se limita a su rol en el pipeline (target frente a drafter) y a su disponibilidad.

## Limitaciones y advertencias

- No es un modelo de servicio: el autor indica explicitamente que la exportacion DFlash para serving no esta portada, por lo que no puede desplegarse directamente como endpoint de inferencia.
- El checkpoint incluye estado del optimizador y no esta en formatos estandar de pesos (safetensors, GGUF), lo que complica su carga en frameworks de inferencia convencionales.
- Las mejoras de validacion son pequenas (score +0.0080, τ +0.200), por lo que el beneficio practico en latencia debe medirse en cada caso de uso.
- No se especifican licencia, idiomas soportados ni limitaciones de uso comercial; deben consultarse en el repositorio del target y del drafter base antes de cualquier uso en produccion.
- Al ser un drafter, su calidad esta acotada por la del target `Qwen3-8B` y por la distribucion del *activation store* de entrenamiento (`mix24k`); fuera de esa distribucion la tasa de aceptacion puede degradarse.
- No hay datos publicados sobre sesgos, riesgo de alucinacion ni comportamiento multilingue especifico de este adaptador.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r32-2ep-kl-pt256
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
