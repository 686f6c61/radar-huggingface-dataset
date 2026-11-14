# erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r1024-2ep-kl

## Resumen

`dyn-spec-dflash-abl24k-static-lora-attn-r1024-2ep-kl` es un checkpoint de entrenamiento de un drafter de decodificacion especulativa (speculative decoding) construido sobre el generador DFlash del proyecto dyn-spec. Lo publica el usuario erdem-erdem en Hugging Face. No es un modelo de lenguaje autonomo ni un bundle de servicio: es un artefacto de investigacion que contiene pesos LoRA entrenados, estado del optimizador, metricas y procedencia completa de un experimento de adaptacion.

El modelo base sobre el que opera es Qwen/Qwen3-8B, y el drafter de partida es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b`). La variante corresponde al brazo `fresh_lora` en etapa de pretraining, con 2667 updates, rango LoRA 1024 sobre las capas de atencion, semilla 42 y un store de activaciones de 24k ejemplos mixtos.

Su relevancia es acotada pero tecnica: documenta de forma reproducible un intento de mejorar la tasa de aceptacion de un drafter especulativo (full_acc de 0.5265 a 0.5356 y longitud media de aceptacion τ de 7.703 a 7.924 tras 2667 updates). Resulta util para investigadores que trabajen en decodificacion especulativa con Qwen3-8B y quieran reutilizar la metodologia, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre drafter DFlash (Qwen3-8B-DFlash-b16); arquitectura interna del drafter no detallada en la informacion disponible |
| Parametros totales | no disponible (repo de 0.8 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) dentro de `run/pretraining/...`; no hay safetensors ni GGUF |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 @ 9b41424b7109f9c5413454f481b09a82b85333f4 |
| Brazo / etapa | fresh_lora / pretraining |
| Updates | 2667 |
| Rango LoRA | 1024 (capas de atencion) |
| Semilla | 42 |
| Git SHA | 1efa1cf50674448f7942ef6d520d195b2fc92455 |
| Checkpoint SHA256 | 1f95437697c83f4ea9a71711c792953f0bce0e40ff3701e7359448968a1f0cd4 |
| Store de activaciones | erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 1024 aplicado sobre las capas de atencion del drafter DFlash asociado a Qwen3-8B. El entrenamiento parte de un brazo `fresh_lora` en etapa de pretraining, con 2667 updates y semilla 42. No se especifica en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si hubo etapas posteriores de RLHF o DPO; el pipeline declarado es exclusivamente de adaptacion para decodificacion especulativa.

La innovacion tecnica del experimento reside en el uso de un store de activaciones estatico de 24k ejemplos mixtos (`mix24k`) para entrenar el drafter sin reejecutar el modelo objetivo en cada paso. El nombre del checkpoint indica rango 1024, dos epocas y una componente KL en la funcion de perdida. El repositorio incluye `speculators.patch`, `train_command.txt` y `provenance/` con la identidad del store, el registro del extractor y la procedencia del lanzamiento de vLLM, lo que permite reproducir el experimento. No se detalla si el drafter emplea decodificacion especulativa clasica, medusa o una variante propia de DFlash.

## Capacidades

- No genera texto de forma autonoma: es un drafter auxiliar que propone tokens candidatos para acelerar la inferencia de Qwen3-8B.
- Mejora la tasa de aceptacion del drafter base segun la validacion del autor (full_acc 0.5265 → 0.5356).
- Incrementa la longitud media de aceptacion τ de 7.703 a 7.924 tras 2667 updates.
- Rendimiento por dominio en validacion (200 filas fijas): chat 0.3522, code 0.6080, math 0.6858, stem 0.4965.
- No soporta tool calling, function calling ni razonamiento multi-paso por si mismo; hereda las capacidades del modelo objetivo Qwen3-8B.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para estudiar el efecto del rango LoRA y del numero de updates en la tasa de aceptacion de un drafter sobre Qwen3-8B.
- Reproduccion de experimentos: el repositorio incluye `train_command.txt`, `speculators.patch` y `provenance/`, lo que permite reejecutar el entrenamiento con la misma semilla y store de activaciones.
- Analisis de dominios concretos: las metricas desagregadas (code 0.6080, math 0.6858, chat 0.3522) permiten estudiar por que el drafter rinde mejor en codigo y matematicas que en conversacion.
- Comparacion de brazos de entrenamiento: al ser una ablacion (`abl24k`, `static`, `attn`, `r1024`, `2ep`, `kl`), se puede contrastar contra otras variantes del mismo autor para aislar el efecto de cada decision de diseno.
- Base para futuros bundles de servicio: aunque el export de serving DFlash no esta portado, el checkpoint puede convertirse en un drafter desplegable una vez exista dicho export.
- Docencia y formacion tecnica: ilustra un flujo completo de adaptacion LoRA con store de activaciones y evaluacion offline estructurada.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5356 | 7.924 | 0.3522 | 0.6080 | 0.6858 | 0.4965 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica que en `run/offline_eval/` hay evaluaciones adicionales (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14 y metricas por fila), pero sus valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint pesa 0.8 GB e incluye estado del optimizador, por lo que el peso efectivo del adaptador es menor.
- GPU recomendadas: no disponible. Al operar junto a Qwen3-8B, el requisito dominante es el del modelo objetivo, no el del drafter.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: no hay bundle de servicio; el autor indica explicitamente que el export de serving DFlash no esta portado. El repositorio menciona procedencia de lanzamiento de vLLM para la extraccion de activaciones, no para servir el drafter.
- Latencia y throughput: no disponibles. La mejora de τ de 7.703 a 7.924 sugiere un incremento marginal en tokens aceptados por paso, pero no se aportan medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | full_acc / τ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-static-lora-attn-r1024-2ep-kl | no disponible (LoRA r1024 sobre drafter) | no disponible | 0.5356 / 7.924 | no disponible | Hugging Face, checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 (drafter base) | no disponible | no disponible | no disponible (punto de partida del ajuste) | no disponible | Hugging Face |
| Qwen/Qwen3-8B (modelo objetivo) | 8B | no disponible en esta ficha | no aplica (no es drafter) | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a identidad y procedencia.

## Limitaciones y advertencias

- No es un modelo desplegable: es un checkpoint de entrenamiento con estado del optimizador y sin export de serving DFlash.
- Las mejoras son marginales: +0.0091 en full_acc y +0.221 en τ tras 2667 updates, lo que puede no justificar el coste en produccion.
- El rendimiento en chat es claramente inferior al de code y math (0.3522 frente a 0.6080 y 0.6858), lo que limita su utilidad en conversacion.
- La validacion se realiza sobre solo 200 filas fijas; no hay evidencia de generalizacion a otros conjuntos.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion proporcionada; al ser un drafter, los tokens propuestos se validan contra el modelo objetivo, lo que mitiga pero no elimina el riesgo.
- Dependencia estricta de la version del drafter base (`9b41424b`) y del store de activaciones `mix24k`; cambios en cualquiera de ellos invalidan la reproducibilidad.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r1024-2ep-kl
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
