# erdem-erdem/dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder1024

## Resumen

El repositorio `erdem-erdem/dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder1024` no es un modelo de lenguaje generativo al uso, sino un checkpoint de entrenamiento de un *drafter* (borrador) para decodificación especulativa. Concretamente, es una adaptación LoRA de un drafter DFlash (`z-lab/Qwen3-8B-DFlash-b16`) que se entrena para predecir tokens candidatos que luego son verificados por un modelo objetivo mayor, en este caso `Qwen/Qwen3-8B`. El objetivo es acelerar la inferencia del modelo grande reduciendo el número de pasos de decodificación autorregresiva.

El artefacto pertenece a una ejecución de adaptación del *generator port* de dyn-spec con la variante `direct` en fase de `pretraining`, con 1500 actualizaciones de entrenamiento y semilla 42. El repositorio contiene el estado completo del entrenamiento (checkpoint con estado del optimizador, métricas, comandos de entrenamiento, parches y procedencia), pero el autor indica explícitamente que no es un paquete de servicio: la exportación DFlash para servir todavía no está portada.

Por su naturaleza, no debe evaluarse como un modelo conversacional o de razonamiento general, sino como un componente de infraestructura de inferencia. Su relevancia es acotada: sirve para reproducir y auditar un experimento concreto de decodificación especulativa sobre Qwen3-8B, no para desplegarse de forma autónoma en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptada sobre drafter DFlash (`z-lab/Qwen3-8B-DFlash-b16`), rango 32, ventana de 4k, decodificador 1024 |
| Parametros totales | no disponible (el repo pesa 26.3 GB e incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (indicado en el nombre: `4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) dentro de `run/pretraining/...`; no hay safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El componente es un *drafter* de decodificación especulativa basado en DFlash, adaptado mediante LoRA de rango 32 (`attn-r32`) sobre un modelo base `z-lab/Qwen3-8B-DFlash-b16` fijado al commit `9b41424b7109f9c5413454f481b09a82b85333f4`. El modelo objetivo es `Qwen/Qwen3-8B`, cuya identidad de store se guarda en `provenance/store/`. El entrenamiento corresponde al brazo `direct` en etapa de `pretraining`, con 1500 actualizaciones, semilla 42 y un decodificador de tamaño 1024. El contexto de trabajo es de 4096 tokens.

Los datos de entrenamiento provienen de un *activation store* publicado como dataset aparte (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), del que no se detalla composición ni número de tokens en la información disponible. No se menciona RLHF, DPO ni preferencias humanas: es un entrenamiento de destilación/adaptación orientado a la aceptación de tokens especulativos. El repositorio incluye artefactos de reproducibilidad como `train_command.txt`, `speculators.patch`, `result.json`, `metrics.json`, `timing.json` y un `MANIFEST.json` con tamaños y SHA256 de cada fichero, además de evaluaciones offline (reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B.
- Aceleración de inferencia mediante verificación de borradores por el modelo objetivo.
- Adaptación LoRA entrenada específicamente para el drafter DFlash b16 con ventana de 4k.
- Reproducibilidad completa del experimento: comandos, parches, métricas y procedencia.
- Evaluación offline integrada en el repositorio (métricas por fila).
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma nativa; esas capacidades residen en el modelo objetivo, no en el drafter.
- Capacidades multilingües: no disponibles como propiedad del drafter.

## Casos de uso

- Aceleración de serving de Qwen3-8B: integrar el drafter en un pipeline de decodificación especulativa para reducir la latencia por token, siempre que se complete la exportación de servicio que el autor indica como pendiente.
- Reproducción de experimentos de investigación: reentrenar o auditar la adaptación `direct` con los mismos 1500 updates y semilla 42 usando los artefactos de `run/`.
- Estudio de aceptación de borradores: analizar las métricas de validación (full_acc, τ EAL) por dominio (chat, code, math, stem) para entender en qué tareas el drafter aporta más.
- Benchmarking de decodificación especulativa: comparar esta adaptación con otras variantes del mismo drafter usando las evaluaciones offline incluidas.
- Auditoría de procedencia: verificar la cadena de custodia (activation store, extractor, lanzamiento de vLLM, registros de fill) mediante `provenance/` y `MANIFEST.json`.
- Base para futuras adaptaciones: partir de este checkpoint con estado del optimizador para continuar el entrenamiento con otros rangos, ventanas o decodificadores.

## Benchmarks y rendimiento

Los únicos datos publicados son la validación interna sobre 200 filas fijas, una fila por LoRA, con la métrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5193 | 7.094 | 0.3296 | 0.5649 | 0.6740 | 0.5087 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de validación muestran un ligero descenso del score entre el update 0 y el 1500 (de 0.5246 a 0.5193), lo que conviene tener en cuenta al evaluar la utilidad del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo de 26.3 GB incluye estado del optimizador y no refleja el tamaño de inferencia del drafter.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no determinada; depende del tamaño real del drafter DFlash b16 y de la cuantización, datos no publicados.
- Opciones de despliegue: el autor indica que la exportación DFlash para servir no está portada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder1024 | Drafter LoRA sobre DFlash | 4096 | no disponible | no disponible | Checkpoint de entrenamiento, no serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo base referenciado |
| Qwen/Qwen3-8B | Modelo objetivo | no disponible | 8B | no disponible | Modelo generativo completo |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: el autor indica explícitamente que la exportación DFlash para servir no está portada.
- El checkpoint incluye estado del optimizador, por lo que su tamaño (26.3 GB) no representa el coste de inferencia.
- El score de validación desciende ligeramente tras 1500 updates (0.5246 a 0.5193), lo que sugiere que el entrenamiento no mejora la aceptación en las 200 filas evaluadas.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no disponibles.
- Riesgo de alucinación y sesgos: no evaluables directamente en el drafter; dependen del modelo objetivo Qwen3-8B.
- Dependencia estricta de la versión del drafter base (`9b41424b...`) y del activation store asociado para reproducir resultados.
- Sin datos de benchmarks estándar ni de latencia en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder1024
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
