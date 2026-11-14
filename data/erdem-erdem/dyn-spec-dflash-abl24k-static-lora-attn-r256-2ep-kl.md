# erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r256-2ep-kl

## Resumen

`abl24k-static-lora-attn-r256-2ep-kl` es un checkpoint de entrenamiento publicado por el usuario `erdem-erdem` dentro del ecosistema `speculators`/`dflash`, orientado a la decodificación especulativa. No se trata de un modelo de lenguaje generativo autonomo, sino de un *drafter* LoRA que se acopla a un modelo objetivo (`Qwen/Qwen3-8B`) para proponer tokens candidatos y acelerar la inferencia mediante decodificación especulativa. El artefacto pertenece a la rama `fresh_lora` de una ejecución de adaptación del generador DFlash (`dyn-spec`).

El repositorio contiene el estado completo de una ejecución de entrenamiento: checkpoint con estado del optimizador, resultados, evaluaciones offline y trazabilidad completa (provenance). El autor indica explicitamente que **no es un bundle de servicio**, ya que la exportación de servicio de DFlash aun no se ha portado. Por tanto, su utilidad es de investigación y reproducción, no de despliegue directo en producción.

El checkpoint corresponde a 2667 actualizaciones con semilla 42, sobre un almacen de activaciones de 24k ejemplos (`dyn-spec-dflash-store-qwen3-8b-mix24k`) y un drafter base `z-lab/Qwen3-8B-DFlash-b16`. La validación reportada sobre 200 filas fijas muestra una mejora marginal de `full_acc` de 0,5265 a 0,5351 entre la actualización 0 y la 2667.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre drafter DFlash (decodificacion especulativa); rango 256, atencion |
| Parametros totales | no disponible (repo de 0,2 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) con estado del optimizador; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es una adaptacion LoRA de rango 256 sobre las capas de atencion de un drafter DFlash, construido a partir de `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`). El modelo objetivo es `Qwen/Qwen3-8B`, cuya identidad de almacen se registra en `provenance/store/`. La rama de entrenamiento es `fresh_lora` en etapa de `pretraining`, con 2667 actualizaciones y semilla 42.

El entrenamiento se realizo sobre un almacen de activaciones (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), es decir, sobre representaciones internas precalculadas del modelo objetivo en lugar de sobre texto crudo. El sufijo `kl` del nombre sugiere un termino de divergencia KL en la funcion de perdida, aunque la model card no lo detalla. La validacion se hace sobre 200 filas fijas, una por LoRA, midiendo `full_acc` y el factor de aceptacion `τ (eal)`. No se documentan el numero total de tokens, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- No es un modelo generativo autonomo: actua como *drafter* de decodificacion especulativa para `Qwen/Qwen3-8B`.
- Propone tokens candidatos que el modelo objetivo verifica, reduciendo el numero de pasos de decodificacion.
- Soporta evaluacion por dominios: chat, code, math y stem (segun las metricas de validacion).
- No dispone de tool calling, function calling ni capacidades de agente propias.
- No dispone de capacidades multilingues declaradas.
- No dispone de vision, audio ni modo de razonamiento extendido.
- Su unica funcion es la aceleracion de inferencia del modelo objetivo.

## Casos de uso

- **Investigacion en decodificacion especulativa**: reproduccion del experimento `fresh_lora` con semilla 42 y 2667 actualizaciones, comparando los resultados con la actualizacion 0 como linea base.
- **Ablacion de LoRA de atencion**: el nombre `static-lora-attn-r256` indica una ablacion concreta (LoRA estatico de rango 256 sobre atencion) que puede contrastarse con otras variantes del mismo autor.
- **Analisis de aceptacion por dominio**: las metricas por chat, code, math y stem permiten estudiar en que tareas el drafter aporta mas (`code` 0,6072 y `math` 0,6850 frente a `chat` 0,3523).
- **Punto de partida para fine-tuning posterior**: al incluir estado del optimizador, el checkpoint permite reanudar el entrenamiento en lugar de partir de cero.
- **Auditoria de trazabilidad**: los ficheros `provenance/` y `MANIFEST.json` con SHA256 permiten verificar la reproducibilidad de la ejecucion.
- **Estudio de coste de inferencia**: la evaluacion offline incluye coeficientes M4, donantes M7, similitud D13 y coste D14, utiles para modelar el ahorro de latencia del drafter.

## Benchmarks y rendimiento

| Update | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 2667 | 0,5351 | 7,919 | 0,3523 | 0,6072 | 0,6850 | 0,4959 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son de validacion interna sobre 200 filas fijas y no son comparables con benchmarks publicos de modelos generativos.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB, pero incluye estado del optimizador; el peso efectivo de la LoRA es menor.
- El drafter se usa junto a `Qwen/Qwen3-8B`, por lo que la VRAM total depende del modelo objetivo (aproximadamente 16 GB en FP16, menos con cuantizacion).
- No se especifican GPU recomendadas ni si cabe en GPU de consumo.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI); el autor indica que la exportacion de servicio de DFlash no esta portada.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| `abl24k-static-lora-attn-r256-2ep-kl` | LoRA drafter DFlash | no disponible | no disponible | no disponible | Investigacion |
| `z-lab/Qwen3-8B-DFlash-b16` | Drafter DFlash base | no disponible | no disponible | no disponible | Decodificacion especulativa |
| `Qwen/Qwen3-8B` | LLM objetivo | 8B | no disponible | no disponible | Generacion general |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: el autor indica explicitamente que la exportacion DFlash aun no se ha portado.
- No declara licencia, lo que impide evaluar su uso comercial.
- No declara idiomas soportados ni contexto maximo.
- Las metricas de validacion son internas (200 filas) y no equivalen a benchmarks publicos.
- La mejora entre la actualizacion 0 y la 2667 es pequena (`full_acc` +0,0086), por lo que el beneficio practico puede ser limitado.
- El rendimiento en `chat` es notablemente inferior al de `code`, `math` y `stem` (0,3523 frente a 0,6072, 0,6850 y 0,4959).
- Al ser un checkpoint de entrenamiento con estado del optimizador, no debe cargarse directamente como modelo de inferencia.
- No se documentan sesgos, riesgo de alucinacion ni comportamiento multilingue, ya que el artefacto no genera texto de forma autonoma.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r256-2ep-kl
- Almacen de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: `Qwen/Qwen3-8B`
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
