# erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-pt32

## Resumen

El modelo `dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-pt32` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem dentro de la familia de experimentos "dyn-spec DFlash". No es un modelo de lenguaje generativo en sentido estricto, sino un *drafter* (modelo borrador) de decodificación especulativa adaptado mediante LoRA sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, cuyo modelo objetivo es `Qwen/Qwen3-8B`. Su función es proponer tokens candidatos que el modelo grande verifica, acelerando así la inferencia sin alterar la distribución de salida.

El checkpoint corresponde al brazo `direct` de la etapa de pretraining, con 2667 actualizaciones y semilla 42, e incluye estado del optimizador, resultados de validación, evaluaciones offline y procedencia completa (identidad del almacén de activaciones, registro del extractor y trazabilidad del lanzamiento de vLLM). Está pensado para reproducibilidad e investigación sobre decodificación especulativa, no como artefacto listo para servir en producción: el autor indica explícitamente que el export de serving de DFlash aún no está portado.

La relevancia es acotada pero específica: sirve como evidencia empírica de una adaptación de drafter sobre Qwen3-8B con una mejora marginal medible en la tasa de aceptación de tokens especulativos (de τ=7,703 a τ=7,895 en la validación fija de 200 filas), y como material reproducible para quienes investigan aceleración de inferencia con LoRA sobre drafters.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre drafter de decodificación especulativa DFlash (base: `z-lab/Qwen3-8B-DFlash-b16`); modelo objetivo Qwen3-8B |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de serving |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (rango 512, según el nombre del checkpoint) entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` en su commit `9b41424b7109f9c5413454f481b09a82b85333f4`, con `Qwen/Qwen3-8B` como modelo objetivo. La etapa registrada es `pretraining`, brazo `direct`, con 2667 actualizaciones, semilla 42 y un SHA de Git concreto (`9ea9165736debae64b6b2a67fdce4151ea0ec542`). El entrenamiento consume un almacén de activaciones externo (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), lo que sitúa el procedimiento en la línea de destilación/adaptación de drafters guiada por activaciones del modelo objetivo.

El nombre del checkpoint sugiere una configuración con pérdida KL y `pt32` (probablemente temperatura o top-p de muestreo en la generación de datos), aunque la model card no documenta explícitamente estos hiperparámetros más allá de lo que refleja el identificador. El paquete incluye `speculators.patch`, `train_command.txt`, `timing.json` y `metrics.json`, además de la procedencia del lanzamiento de vLLM usado para extraer activaciones, lo que permite reconstruir el pipeline. No se documentan innovaciones adicionales como decodificación especulativa propia del drafter más allá del marco DFlash en el que se inserta.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone tokens candidatos para que Qwen3-8B los verifique, reduciendo el número de pasos de decodificación.
- Adaptación LoRA entrenada para el modelo objetivo Qwen3-8B; no es un modelo autónomo de generación.
- Evaluación desglosada por dominio (chat, código, matemáticas y STEM) sobre un conjunto fijo de 200 filas, con métrica de longitud media de aceptación (τ).
- Reproducibilidad completa: incluye estado del optimizador, comandos de entrenamiento, parches y registros de procedencia.
- No soporta tool calling, agentes, visión, audio ni modo thinking por sí mismo; esas capacidades residirían en el modelo objetivo Qwen3-8B, no en el drafter.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint permite reproducir el experimento `direct`/`pretraining` sobre Qwen3-8B y comparar la tasa de aceptación frente al drafter base (τ=7,703 en la actualización 0 frente a τ=7,895 en la 2667).
- Estudio de adaptación LoRA de drafters: el paquete incluye `speculators.patch` y `train_command.txt`, lo que facilita replicar el entrenamiento con otro almacén de activaciones o distinto rango de LoRA.
- Análisis por dominio de la aceptación especulativa: la validación separa chat (0,3463 → 0,3522), código (0,5956 → 0,6065), matemáticas (0,6775 → 0,6850) y STEM (0,4866 → 0,4953), útil para decidir en qué cargas de trabajo compensa desplegar el drafter.
- Auditoría de procedencia en pipelines de ML: los registros de identidad del almacén, extractor y lanzamiento de vLLM sirven como plantilla para trazabilidad de experimentos en equipos de investigación.
- Base para un futuro export de serving: aunque el bundle de servicio no está portado, el checkpoint con estado del optimizador es el punto de partida para convertirlo en un artefacto desplegable con vLLM u otro runtime compatible con DFlash.
- Docencia y formación interna: el repositorio, con `MANIFEST.json` de hashes y tamaños, es un ejemplo didáctico de empaquetado reproducible de un experimento de adaptación de drafters.

## Benchmarks y rendimiento

Los únicos datos publicados son la validación interna sobre 200 filas fijas (una fila por LoRA), con la métrica `full_acc` y la longitud media de aceptación τ (eal):

| Actualización | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 2667 | 0,5348 | 7,895 | 0,3522 | 0,6065 | 0,6850 | 0,4953 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el drafter aislado; el repositorio ocupa 2,8 GB e incluye estado del optimizador, por lo que el peso efectivo del adaptador es menor.
- Para evaluar el sistema completo hay que considerar el modelo objetivo Qwen3-8B (aproximadamente 16 GB en FP16, u 8-10 GB en cuantizaciones de 8 bits, estimación orientativa) más el drafter.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del objetivo, un despliegue en FP16 requeriría GPU de 24 GB o superiores (RTX 4090, L40S, A100, H100), aunque el autor no lo especifica.
- Cabe en GPU de consumo: no confirmado; el adaptador en sí es pequeño, pero el sistema requiere cargar Qwen3-8B.
- Opciones de despliegue: el autor indica que el export de serving de DFlash no está portado; los registros de procedencia mencionan lanzamientos de vLLM para la extracción de activaciones, no para servir el drafter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-pt32 | Checkpoint LoRA de drafter DFlash | Qwen3-8B | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | Qwen3-8B | no disponible | no disponible | no disponible | Hugging Face |
| Drafters EAGLE/Medusa para Qwen | Drafters de decodificación especulativa | Qwen3-8B | no disponible | no disponible | no disponible | Ecosistema abierto |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autónoma: es un checkpoint de entrenamiento de un drafter y requiere el modelo objetivo Qwen3-8B y un runtime compatible con DFlash.
- El export de serving no está portado, según advierte el propio autor; no debe tratarse como artefacto listo para producción.
- La mejora medida es pequeña (full_acc de 0,5265 a 0,5348; τ de 7,703 a 7,895) y procede de una validación interna de 200 filas, sin benchmarks estándar ni comparación con líneas base externas.
- El desglose por dominio muestra un rendimiento bajo en chat (0,3522) frente a matemáticas (0,6850), lo que sugiere un comportamiento desigual según la carga.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Idiomas soportados no documentados; las capacidades lingüísticas dependen del modelo objetivo, no del drafter.
- Riesgo de sesgos y alucinaciones: no evaluado en la información disponible; al ser un drafter, los tokens propuestos se verifican contra el modelo objetivo, lo que mitiga pero no elimina el impacto en la calidad final.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-pt32
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
