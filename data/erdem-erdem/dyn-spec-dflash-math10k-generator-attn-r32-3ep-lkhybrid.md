# erdem-erdem/dyn-spec-dflash-math10k-generator-attn-r32-3ep-lkhybrid

## Resumen

`dyn-spec-dflash-math10k-generator-attn-r32-3ep-lkhybrid` es un checkpoint de entrenamiento de un *drafter* de decodificación especulativa (DFlash) desarrollado por el usuario erdem-erdem. No es un modelo de lenguaje autónomo, sino un adaptador LoRA (rango 32) entrenado durante 3 épocas (1667 actualizaciones) sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, que a su vez actúa como cabecera predictiva para el modelo objetivo `Qwen/Qwen3-8B`. El propósito es acelerar la inferencia del modelo objetivo prediciendo varios tokens por paso y verificándolos en paralelo.

El checkpoint se ha entrenado con el arm `direct` en la etapa de `pretraining`, usando un almacén de activaciones derivado del conjunto `math10k` (ver dataset `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-math10k`). El repositorio contiene el estado completo del entrenamiento (incluido el estado del optimizador), registros de procedencia, evaluaciones offline y resultados de validación, pero no un paquete de servicio listo para producción: el autor indica explícitamente que la exportación DFlash para *serving* aún no está portada.

La relevancia de este artefacto es acotada y experimental: sirve para reproducir y auditar un experimento de decodificación especulativa sobre Qwen3-8B, no para desplegar un asistente. Los resultados de validación muestran una mejora marginal sobre el estado inicial (full_acc de 0,5265 a 0,5319; τ de 7,703 a 7,864), lo que sugiere un ajuste limitado en este régimen de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`; modelo objetivo Qwen3-8B |
| Parametros totales | no disponible (repo de 6,6 GB, incluye estado del optimizador y checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) dentro de `run/pretraining/...`; no hay safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El artefacto es un *drafter* de decodificación especulativa basado en DFlash, acoplado al modelo objetivo Qwen3-8B. La adaptación se realiza mediante LoRA de rango 32 (`attn-r32`) sobre el drafter preentrenado `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`). El entrenamiento corresponde al arm `direct` en etapa de `pretraining`, con 1667 actualizaciones, semilla 42 y 3 épocas, sobre un almacén de activaciones generado a partir del conjunto `math10k` (dataset `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-math10k`). El sufijo `lkhybrid` sugiere una variante híbrida de la función de pérdida o de las capas clave, aunque el autor no detalla su significado en la model card.

El repositorio incluye el estado del optimizador, el comando de entrenamiento (`train_command.txt`), un parche (`speculators.patch`), registros de procedencia del almacén de activaciones y de la ejecución de vLLM usada para extraerlas, además de evaluaciones offline con coeficientes M4, donantes M7, similitud D13 y coste D14. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; al tratarse de un drafter de decodificación especulativa, el objetivo es imitar la distribución del modelo objetivo, no alinearlo.

## Capacidades

- Predicción especulativa de tokens para acelerar la inferencia de `Qwen/Qwen3-8B` mediante verificación paralela.
- Generación de borradores multi-token (*multi-token drafting*) compatible con el ecosistema DFlash.
- Adaptación específica al dominio matemático, dado que el almacén de activaciones proviene de `math10k`.
- Integración con el pipeline de *speculators* de vLLM para extracción de activaciones y evaluación.
- No es un modelo conversacional autónomo: no genera respuestas finales por sí mismo, sino candidatos que el modelo objetivo verifica.
- No se documentan soporte de tool calling, agentes, visión, audio ni modo *thinking* propio; esas capacidades residen en el modelo objetivo Qwen3-8B, no en este drafter.

## Casos de uso

- Reproducción de experimentos de decodificación especulativa: el repositorio incluye `train_command.txt`, `speculators.patch` y registros de procedencia, lo que permite repetir el entrenamiento con la misma semilla (42) y comparar contra el checkpoint publicado.
- Investigación sobre adaptación de drafters a dominios concretos: el almacén de activaciones `math10k` permite estudiar cómo un LoRA de rango 32 sobre un drafter genérico se especializa en matemáticas y qué coste tiene en otras categorías (chat, code, stem).
- Auditoría de pipelines de *speculative decoding*: los ficheros de evaluación offline (coeficientes M4, donantes M7, similitud D13, coste D14) sirven para validar metodologías de evaluación de drafters antes de desplegarlas.
- Aceleración de inferencia en producción de Qwen3-8B (una vez portada la exportación DFlash para *serving*, hoy no disponible): el drafter reduciría el número de pasos del modelo objetivo en cargas matemáticas.
- Estudio comparativo de arms de entrenamiento: al estar etiquetado como arm `direct` / `pretraining`, permite contrastar con otras variantes del mismo proyecto dyn-spec.
- Docencia y formación técnica: el repositorio es un ejemplo completo de trazabilidad de un experimento (MANIFEST con SHA256, procedencia del almacén, identidad del store) útil para enseñar buenas prácticas de reproducibilidad.

## Benchmarks y rendimiento

Los únicos datos publicados son la validación sobre 200 filas fijas (una fila por LoRA, métrica `full_acc`):

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 1667 | 0,5319 | 7,864 | 0,3499 | 0,6028 | 0,6844 | 0,4905 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros drafters.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es un LoRA de rango 32 sobre un drafter de 8B; el peso completo del drafter más el modelo objetivo Qwen3-8B requeriría, en FP16, aproximadamente 16 GB solo para el objetivo, más el drafter, pero el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependería del drafter base (8B) y de la cuantización aplicada, no documentada.
- Opciones de despliegue: el autor indica que la exportación DFlash para *serving* no está portada; el repositorio es un checkpoint de entrenamiento con `checkpoint.pt`, no un bundle para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-math10k-generator-attn-r32-3ep-lkhybrid | LoRA drafter DFlash | no disponible (rango 32 sobre drafter 8B) | no disponible | no disponible | Checkpoint de entrenamiento, sin export de serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo base del que deriva este LoRA |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible | no disponible | Modelo verificado por el drafter |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor advierte que la exportación DFlash para *serving* no está portada; usar `checkpoint.pt` en producción requeriría trabajo adicional.
- Licencia no especificada: no se puede confirmar el uso comercial ni las obligaciones de atribución.
- Idiomas no declarados: no hay garantía de cobertura multilingüe más allá de la del modelo objetivo Qwen3-8B.
- Especialización estrecha: el entrenamiento se basa en `math10k`, por lo que la mejora se concentra en matemáticas (0,6775 → 0,6844) y es marginal en chat (0,3463 → 0,3499).
- Ganancia limitada: la mejora global en `full_acc` es de 0,0054 puntos y en τ de 0,161, lo que puede no justificar el coste operativo de mantener un drafter adicional.
- Riesgo de alucinación: al ser un drafter, los tokens candidatos son verificados por el modelo objetivo, pero una tasa de aceptación baja degrada el *throughput* en lugar de la calidad; no obstante, no se publican tasas de aceptación por categoría.
- Sin datos de sesgo ni evaluaciones de seguridad publicadas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-math10k-generator-attn-r32-3ep-lkhybrid
- Dataset del almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-math10k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
