# erdem-erdem/dyn-spec-dflash-m5-generator-attn-r32-4k-1500-kl

## Resumen

`dyn-spec-dflash-m5-generator-attn-r32-4k-1500-kl` es un checkpoint de entrenamiento de un drafter (modelo borrador) para decodificacion especulativa, no un modelo generativo autonomo. Lo publica el usuario `erdem-erdem` dentro del ecosistema de *speculators* y *DFlash*, y su funcion es proponer tokens candidatos que un modelo objetivo de mayor tamano (Qwen3-8B) valida despues. El objetivo declarado en la model card es `Qwen/Qwen3-8B`, sobre el que se adapta un drafter base `z-lab/Qwen3-8B-DFlash-b16` mediante LoRA de rango 32 y 1500 actualizaciones.

El artefacto contiene el estado completo del entrenamiento (incluido el estado del optimizador), registros de ejecucion, evaluaciones offline y procedencia, pero el autor advierte explicitamente de que **no es un bundle de servicio**: la exportacion DFlash para inferencia aun no esta portada. Por tanto, no puede cargarse directamente con `transformers`, vLLM o llama.cpp en su forma actual; sirve como material de reproduccion e investigacion del pipeline de *dyn-spec*.

Su relevancia es metodologica: documenta una adaptacion de drafter con validacion fija de 200 filas y trazabilidad completa (SHA256 del checkpoint, SHA de git, identidad del almacen de activaciones). El rendimiento medido apenas varia entre la actualizacion 0 y la 1500 (score 0.5246 frente a 0.5247), lo que sugiere que esta ejecucion concreta no aporta mejora sustancial sobre el drafter base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (LoRA de rango 32 sobre `z-lab/Qwen3-8B-DFlash-b16`), adaptacion de decodificacion especulativa |
| Parametros totales | no disponible (repo de 13,2 GB, incluye estado del optimizador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4k (segun el nombre del checkpoint y el almacen de activaciones `-4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), mas JSON de metricas, procedencia y `MANIFEST.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un *drafter* para decodificacion especulativa basado en la familia DFlash, adaptado mediante LoRA de rango 32 (`attn-r32`) sobre el checkpoint `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b`). El entrenamiento se realizo en la etapa `pretraining` de la rama `direct` del port *dyn-spec* del generador DFlash, con 1500 actualizaciones, semilla 42 y una ventana de contexto de 4k tokens. Los datos de entrenamiento provienen de un almacen de activaciones publicado aparte (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), que registra la identidad del extractor y la procedencia del lanzamiento de vLLM usado para generarlas.

La validacion se hace con 200 filas fijas y una LoRA por fila, midiendo `full_acc` (tasa de aceptacion completa) y la longitud media de aceptacion τ (eal). El resultado es practicamente plano: en la actualizacion 0 el score es 0.5246 con τ = 7.108, y en la 1500 es 0.5247 con τ = 7.167. Por subconjunto, chat baja ligeramente (0.3383 a 0.3376), mientras que code (0.5699 a 0.5710) y stem (0.5105 a 0.5119) suben de forma marginal y math baja de 0.6796 a 0.6783. El paquete incluye evaluaciones offline adicionales en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14) con metricas por fila.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B, no generacion de texto autonoma.
- Aceleracion potencial de la inferencia del modelo objetivo mediante verificacion de borradores (el autor no publica cifras de speedup en esta ficha).
- Soporte de evaluacion por dominios (chat, code, math, stem) a traves de la metrica `full_acc` y la longitud de aceptacion τ.
- No soporta tool calling, function calling ni uso como agente: es un componente interno de un pipeline de serving.
- Capacidades multilingues: no documentadas.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para estudiar como evoluciona la tasa de aceptacion de un drafter LoRA a lo largo de 1500 actualizaciones, con semilla y SHA fijados.
- Reproduccion de experimentos: el repositorio incluye `train_command.txt`, `speculators.patch`, `run_record_*.json` y `MANIFEST.json` con SHA256 de cada fichero, lo que permite reconstruir la ejecucion en otro entorno.
- Auditoria de procedencia de datos: el almacen de activaciones y los registros de lanzamiento de vLLM permiten verificar que activaciones se usaron y con que configuracion se extrajeron.
- Comparacion de ramas de entrenamiento: la rama `direct` puede contrastarse con otras ramas del port *dyn-spec* usando la misma validacion de 200 filas.
- Analisis de dominios: las metricas por subconjunto (chat, code, math, stem) permiten estudiar donde un drafter acepta mas tokens y ajustar la estrategia de borrador por tipo de carga.
- Base para un futuro bundle de servicio: cuando se porte la exportacion DFlash, este checkpoint podria integrarse en un servidor compatible con verificacion especulativa junto a Qwen3-8B; hoy no es desplegable directamente.

## Benchmarks y rendimiento

| Metrica | Update 0 | Update 1500 |
|---|---|---|
| full_acc | 0.5246 | 0.5247 |
| τ (eal) | 7.108 | 7.167 |
| chat | 0.3383 | 0.3376 |
| code | 0.5699 | 0.5710 |
| math | 0.6796 | 0.6783 |
| stem | 0.5105 | 0.5119 |

Validacion sobre 200 filas fijas, una LoRA por fila. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint no es un bundle de servicio y el tamano de 13,2 GB corresponde al estado de entrenamiento, no a pesos inferibles.
- GPU recomendadas: no disponibles para este artefacto. El modelo objetivo asociado, Qwen3-8B, requeriria en BF16 aproximadamente 16 GB de VRAM solo para pesos, mas el drafter.
- Cabe en GPU de consumo: no verificable con los datos disponibles; un Qwen3-8B en cuantizacion de 4 bits podria caber en GPUs de 12-16 GB, pero el drafter DFlash no tiene exportacion publicada.
- Opciones de despliegue: ninguna directa. El autor indica que la exportacion DFlash para serving no esta portada; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Desplegable |
|---|---|---|---|---|---|
| dyn-spec-dflash-m5-generator-attn-r32-4k-1500-kl | Drafter LoRA (checkpoint de entrenamiento) | no disponible | 4k | no disponible | No (sin exportacion de serving) |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter base DFlash | no disponible | no disponible | no disponible | Segun el repo original |
| Qwen/Qwen3-8B | Modelo generativo objetivo | 8B | no disponible en esta ficha | segun Qwen3 | Si (vLLM, llama.cpp, etc.) |

No se dispone de datos de rendimiento comparables entre el drafter adaptado y el base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: falta la exportacion DFlash para serving, segun advierte el propio autor.
- La adaptacion no mejora practicamente al drafter base en la validacion publicada (0.5246 a 0.5247 de `full_acc`), por lo que su valor practico como acelerador es dudoso.
- El rendimiento en chat es notablemente inferior al de math y code (0.3376 frente a 0.6783 y 0.5710), lo que limita su utilidad en conversacion.
- Licencia no especificada: no puede asumirse uso comercial sin consultar al autor y a los licenciantes del drafter base y de Qwen3-8B.
- Riesgo de alucinacion: no aplica directamente al ser un drafter, pero cualquier token aceptado incorrectamente degrada la salida del modelo objetivo; la verificacion del objetivo es la salvaguarda.
- Idiomas soportados no documentados.
- El repositorio incluye estado del optimizador y artefactos de entrenamiento, no pesos limpios; su uso requiere el pipeline *dyn-spec*.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m5-generator-attn-r32-4k-1500-kl
- Almacen de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16 (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
