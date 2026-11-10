# erdem-erdem/dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k8

## Resumen

`dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k8` es un checkpoint de entrenamiento de un drafter (modelo borrador) para decodificacion especulativa, publicado por el usuario erdem-erdem en Hugging Face. No es un modelo generativo autonomo: es un adaptador LoRA-generator que se acopla a un drafter DFlash (`z-lab/Qwen3-8B-DFlash-b16`) para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. El repositorio contiene el estado completo del entrenamiento (incluido el estado del optimizador), resultados, evaluaciones offline y trazabilidad, pero no un bundle listo para servir.

El artefacto corresponde a la etapa `direct`/`pretraining` de una ejecucion de adaptacion del port del generador DFlash dentro del proyecto dyn-spec, con 1500 actualizaciones, semilla 42 y una ventana de contexto de trabajo de 4k tokens (segun el nombre del checkpoint). El tamano del repositorio es de 13,2 GB, coherente con un checkpoint que incluye pesos del adaptador y estado del optimizador.

Su relevancia es acotada y experimental: sirve para reproducir y auditar una ejecucion concreta de entrenamiento de drafters especulativos sobre Qwen3-8B, no como modelo de proposito general. La validacion publicada muestra una puntuacion practicamente plana entre la actualizacion 0 (0,5180) y la 1500 (0,5168), lo que sugiere que el entrenamiento no mejoro de forma medible la metrica `full_acc` en el conjunto de validacion fijo de 200 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa basado en DFlash, con adaptador tipo LoRA-generator sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k (segun identificador del checkpoint; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con `result.json`, `metrics.json`, `timing.json` y `MANIFEST.json`; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador de drafter para decodificacion especulativa. El drafter base es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b...`), y el modelo objetivo es `Qwen/Qwen3-8B`. La ejecucion entrena un generador LoRA con rango 32 (`attn-r32`) sobre el drafter, en la etapa `direct`/`pretraining`, durante 1500 actualizaciones con semilla 42. El identificador incluye `m6` y `k8`, que probablemente codifican variantes de configuracion del experimento, aunque la model card no lo detalla.

Los datos de entrenamiento no se describen en la model card mas alla de la referencia al activation store `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, que contiene las activaciones extraidas del modelo objetivo con ventana de 4k. No se especifica el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO; por el tipo de artefacto (entrenamiento de drafter) no cabe esperar alineamiento por preferencias. La innovacion tecnica es la propia adaptacion dinamica del drafter DFlash, que busca mejorar la tasa de aceptacion de tokens especulativos; el repositorio incluye `speculators.patch` y trazabilidad de lanzamiento de vLLM para reproducir la extraccion de activaciones.

## Capacidades

- No es un modelo de generacion de texto autonomo: actua como drafter auxiliar que propone tokens candidatos para que `Qwen3-8B` los verifique.
- Acelera la inferencia del modelo objetivo mediante decodificacion especulativa; su utilidad se mide en tasa de aceptacion y velocidad, no en calidad generativa propia.
- No se documentan capacidades de tool calling, function calling ni agentes.
- No se documentan capacidades multilingues propias; hereda las del modelo objetivo solo en la medida en que el drafter acierte tokens.
- No dispone de modo thinking, vision ni audio.
- Incluye artefactos de evaluacion offline (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14) que permiten analizar el comportamiento del drafter por fila.

## Casos de uso

- Reproduccion de experimentos de decodificacion especulativa: cargar el checkpoint y el activation store para repetir el entrenamiento y las evaluaciones offline con la misma semilla y configuracion, verificando los resultados publicados.
- Investigacion sobre tasa de aceptacion de drafters: analizar las metricas por fila de `run/offline_eval/` para estudiar en que dominios (chat, code, math, stem) el drafter acierta mas y por que.
- Auditoria de trazabilidad de entrenamiento: usar `MANIFEST.json`, `provenance/` y `train_command.txt` para reconstruir exactamente que datos, versiones y comandos produjeron el checkpoint.
- Base para futuras adaptaciones del drafter: partir de este checkpoint (con estado del optimizador) para continuar el entrenamiento con otras configuraciones de rango, ventana o etapa.
- Estudio comparativo de etapas de entrenamiento: comparar la actualizacion 0 y la 1500 con las metricas publicadas para evaluar si el regimen de entrenamiento aporta ganancia.
- Integracion experimental en pipelines de inferencia acelerada: una vez exista el export de serving de DFlash (aun no portado), usar el drafter adaptado junto a Qwen3-8B en vLLM para medir latencia real.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, 8 filas por LoRA, metrica `full_acc`:

| Actualizacion | full_acc | tau (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5180 | 7.039 | 0.3239 | 0.5580 | 0.6759 | 0.5143 |
| 1500 | 0.5168 | 7.085 | 0.3245 | 0.5559 | 0.6735 | 0.5133 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con otros drafters.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint incluye estado del optimizador y no es un bundle de serving.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el export de serving de DFlash no esta portado; el repositorio solo contiene el checkpoint de entrenamiento. Se referencia vLLM en la procedencia de extraccion de activaciones, no como via de serving del drafter.
- Latencia y throughput: no disponibles; no se publican mediciones de velocidad de decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k8 | Drafter LoRA para Qwen3-8B | no disponible | 4k (segun ID) | no disponible | Checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de serving: la model card indica explicitamente que el export de serving de DFlash no esta portado; no debe desplegarse como generador autonomo.
- El entrenamiento no muestra mejora medible: `full_acc` baja ligeramente de 0,5180 a 0,5168 y `tau` sube de 7,039 a 7,085 entre las actualizaciones 0 y 1500, diferencias dentro de un margen que no permite afirmar ganancia.
- El rendimiento en chat es bajo (0,32-0,33) frente a math (0,67) o code (0,56), lo que limita su utilidad en conversacion.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o revisar las licencias del drafter base y del modelo objetivo.
- Idiomas no declarados: no hay garantia de cobertura multilingue del drafter.
- Sesgos y alucinacion: al ser un drafter, los errores se manifiestan como tokens rechazados o aceptados incorrectamente, no como texto generado; aun asi, un drafter mal calibrado puede degradar la calidad final si la verificacion no es estricta.
- Repositorio de 13,2 GB con estado del optimizador: coste de almacenamiento y de carga elevado para un artefacto experimental.
- Fecha de creacion futura (2026-11-10) en los metadatos: conviene verificar la integridad y el origen del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m6-generator-attn-r32-4k-1500-k8
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
