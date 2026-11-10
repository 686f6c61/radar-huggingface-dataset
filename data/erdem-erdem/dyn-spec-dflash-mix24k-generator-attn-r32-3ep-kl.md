# erdem-erdem/dyn-spec-dflash-mix24k-generator-attn-r32-3ep-kl

## Resumen

`dyn-spec-dflash-mix24k-generator-attn-r32-3ep-kl` es un checkpoint de entrenamiento de un drafter de decodificacion especulativa (speculative decoding) construido sobre el modelo `z-lab/Qwen3-8B-DFlash-b16` y adaptado para asistir al modelo objetivo `Qwen/Qwen3-8B`. Lo publica el usuario de Hugging Face `erdem-erdem` dentro de una linea de trabajo denominada dyn-spec, orientada a portar el generador DFlash a un pipeline de entrenamiento reproducible. No se trata de un modelo de lenguaje autonomo, sino de un componente auxiliar que propone tokens candidatos para acelerar la inferencia del modelo grande.

El artefacto corresponde al brazo `direct` en etapa de `pretraining`, tras 4000 updates con semilla 42, y se distribuye con estado del optimizador, resultados de evaluacion offline y trazabilidad completa (SHA de git, SHA256 del checkpoint, identidad del store de activaciones). El repositorio ocupa 6,7 GB, coherente con un adaptador LoRA de rango 32 sobre un transformer de 8B mas el estado del optimizador.

Es relevante ahora porque la decodificacion especulativa se ha consolidado como una de las tecnicas mas eficaces para reducir la latencia de inferencia sin degradar la calidad de salida, y este checkpoint documenta de forma inusualmente detallada el proceso de entrenamiento de un drafter, lo que facilita su reproduccion y auditoria. No obstante, el autor advierte explicitamente de que no es un bundle de serving: la exportacion DFlash para produccion aun no esta portada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (adaptador LoRA de rango 32, `lora-generator`) sobre `z-lab/Qwen3-8B-DFlash-b16` |
| Parametros totales | no disponible (repo de 6,7 GB con estado del optimizador; el drafter base deriva de Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), acompanado de `result.json`, `metrics.json`, `timing.json` y `MANIFEST.json` |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa basado en la familia DFlash, inicializado desde el checkpoint `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`) y entrenado para predecir tokens que el modelo objetivo `Qwen/Qwen3-8B` validara posteriormente. La adaptacion se realiza mediante un LoRA de rango 32 sobre las capas de atencion (`generator-attn-r32`), lo que mantiene un coste de almacenamiento y computo reducido respecto a un ajuste completo.

El entrenamiento se ejecuto en el brazo `direct`, etapa de `pretraining`, durante 4000 updates con semilla 42, sobre un store de activaciones de 24k ejemplos (`dyn-spec-dflash-store-qwen3-8b-mix24k`). La perdida incluye un termino KL (`-kl` en el nombre), lo que sugiere una regularizacion hacia la distribucion del modelo objetivo o del drafter original. El repositorio incluye el comando de entrenamiento (`train_command.txt`), un parche (`speculators.patch`), la procedencia del lanzamiento de vLLM y los registros de llenado del store, lo que permite reproducir el run de forma completa.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre `Qwen/Qwen3-8B`.
- Aceleracion de inferencia mediante verificacion paralela de propuestas por el modelo objetivo.
- Adaptacion supervisada a un dominio mixto de 24k ejemplos (chat, code, math, stem segun la validacion).
- Entrenamiento reproducible con trazabilidad de git SHA, SHA256 y procedencia del store de activaciones.
- No es un modelo conversacional autonomo: no genera respuestas finales por si mismo.
- No se documenta soporte de tool calling, agentes, vision, audio ni modos de razonamiento extendido.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Aceleracion de serving de `Qwen3-8B`: el drafter propone secuencias cortas de tokens que el modelo objetivo valida en un solo paso, reduciendo la latencia por token en despliegues con vLLM y decodificacion especulativa habilitada.
- Investigacion en decodificacion especulativa: el checkpoint sirve como punto de partida reproducible (4000 updates, semilla 42) para estudiar el efecto del termino KL y del rango LoRA en la tasa de aceptacion.
- Reproduccion de experimentos: los ficheros `train_command.txt`, `speculators.patch` y `provenance/` permiten reconstruir el run completo en un entorno equivalente.
- Evaluacion offline de drafters: los resultados en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14) permiten comparar variantes del drafter con metricas por fila.
- Ajuste fino de drafters sobre dominios concretos: el pipeline LoRA de rango 32 puede reutilizarse para adaptar el drafter a un store de activaciones especifico de un cliente o dominio.
- Auditoria de pipelines de entrenamiento: la presencia de hashes y procedencia facilita la verificacion de integridad en entornos regulados o de investigacion reproducible.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 4000 | 0.5347 | 7.907 | 0.3526 | 0.6073 | 0.6846 | 0.4944 |

El incremento es modesto pero consistente en todas las categorias (+0.0082 en score global, +0.204 en τ). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el drafter se sirve junto al modelo objetivo `Qwen3-8B`, cuyo peso en bf16 ronda los 16 GB, mas el adaptador LoRA de rango 32 (overhead reducido).
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo objetivo, se requiere al menos una GPU con 24 GB para bf16 (RTX 4090, L40S, A100 40 GB) o 16 GB con cuantizacion.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) con el modelo objetivo en bf16; no confirmado por el autor.
- Opciones de despliegue: vLLM (se menciona procedencia de su lanzamiento en el repo); el autor indica que la exportacion DFlash para serving aun no esta portada, por lo que no es un bundle listo para produccion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-mix24k-generator-attn-r32-3ep-kl | no disponible (LoRA r32 sobre drafter de 8B) | no disponible | Drafter especulativo para Qwen3-8B | no disponible | Hugging Face (checkpoint de entrenamiento) |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible (derivado de Qwen3-8B) | no disponible | Drafter DFlash base | no disponible | Hugging Face |
| EAGLE-3 (drafter generico) | variable segun backbone | no disponible | Drafter especulativo | no disponible | Repositorios de investigacion |
| Medusa (cabezas especulativas) | variable | no disponible | Drafter especulativo | no disponible | Repositorios de investigacion |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de serving: el autor indica explicitamente que la exportacion DFlash para produccion no esta portada; el artefacto es un checkpoint de entrenamiento con estado del optimizador.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base `Qwen/Qwen3-8B` y del drafter `z-lab/Qwen3-8B-DFlash-b16`.
- Idiomas soportados no documentados; las capacidades multilingues dependen del modelo objetivo y del store de entrenamiento.
- Riesgo de alucinacion: al ser un drafter, las propuestas incorrectas se descartan en la verificacion, pero una tasa de aceptacion baja degrada la aceleracion sin mejorar la calidad.
- Mejora marginal en validacion (score 0.5265 → 0.5347): el beneficio practico del ajuste puede ser limitado frente al drafter base.
- Sin datos de benchmarks estandar ni de latencia/throughput en produccion.
- El store de activaciones de 24k ejemplos condiciona el dominio; el rendimiento fuera de esa distribucion no esta caracterizado.
- Repositorio de 6,7 GB con estado del optimizador: requiere espacio adicional y no es adecuado para despliegue directo.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-mix24k-generator-attn-r32-3ep-kl
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Paper, blog o repositorio adicional: no disponible
