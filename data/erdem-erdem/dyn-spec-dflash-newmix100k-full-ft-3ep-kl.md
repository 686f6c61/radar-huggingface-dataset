# erdem-erdem/dyn-spec-dflash-newmix100k-full-ft-3ep-kl

## Resumen

`dyn-spec-dflash-newmix100k-full-ft-3ep-kl` es un checkpoint de entrenamiento de un drafter de decodificacion especulativa (speculative decoding) publicado por el usuario `erdem-erdem` en Hugging Face. No se trata de un modelo de lenguaje autonomo, sino de un adaptador LoRA (`fresh_lora`) entrenado para actuar como modelo borrador (drafter) sobre el modelo objetivo Qwen/Qwen3-8B, partiendo del drafter base `z-lab/Qwen3-8B-DFlash-b16`. El artefacto pertenece al ecosistema DFlash y al proyecto de port del generador dyn-spec.

El repositorio contiene el estado completo de una ejecucion de entrenamiento: checkpoint con estado del optimizador, registros de metricas, evaluaciones offline, comandos de entrenamiento, parches (`speculators.patch`) y trazabilidad de procedencia (identidad del store de activaciones, registro del extractor, procedencia del lanzamiento en vLLM). Segun la propia model card, no es un bundle de serving: la exportacion DFlash para inferencia aun no esta portada.

Su relevancia es acotada pero tecnica: sirve como referencia reproducible para investigar el entrenamiento de drafters de decodificacion especulativa sobre Qwen3-8B, con 17 000 updates, semilla 42 y SHA de commit documentados. El tamano del repo (12,7 GB) refleja que incluye pesos y estado del optimizador, no solo pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (LoRA generador) sobre target Qwen/Qwen3-8B; arquitectura base del drafter no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con estado del optimizador; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado dentro del pipeline dyn-spec/DFlash para generar borradores de tokens que el modelo objetivo Qwen3-8B verifica mediante decodificacion especulativa. El drafter de partida es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), y la ejecucion corresponde al brazo `fresh_lora` en etapa de pretraining, con 17 000 updates y semilla 42.

El entrenamiento usa un dataset identificado como `newmix100k` (100 000 muestras, segun el nombre de la ejecucion) y una funcion de perdida con componente KL (`-kl` en el identificador). El repositorio documenta procedencia completa: identidad del store de activaciones, registro del extractor, procedencia del lanzamiento en vLLM y registros de fill, lo que permite reproducir la extraccion de activaciones y el entrenamiento. No se especifican en la informacion disponible el numero total de tokens procesados, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO (poco probable en un drafter).

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre Qwen3-8B, con el objetivo de acelerar la inferencia del modelo target.
- Adaptacion via LoRA sobre un drafter preentrenado (DFlash b16), sin modificar los pesos del modelo objetivo.
- Evaluacion por dominios: la validacion reporta metricas separadas para chat, code, formal, math, roleplay y science.
- Reproducibilidad: checkpoint con estado del optimizador, comandos de entrenamiento y parches versionados.
- No incluye capacidades de generacion de texto autonomo, tool calling, agentes, vision ni audio por si mismo: hereda el comportamiento del target solo en tanto que borrador verificado por este.
- Multilingue: no disponible (no se documentan idiomas).

## Casos de uso

- Investigacion de decodificacion especulativa: usar el checkpoint para reproducir el entrenamiento del drafter sobre Qwen3-8B y comparar tasas de aceptacion antes y despues del fine-tuning (update 0 frente a 17000).
- Aceleracion de inferencia en produccion con Qwen3-8B: una vez portada la exportacion DFlash para serving, integrar el drafter en vLLM para reducir la latencia por token en cargas interactivas.
- Estudio de LoRA generadores: analizar como un adaptador `fresh_lora` afecta la precision por dominio (chat, code, math, etc.) usando las metricas de validacion por fila.
- Reproduccion de pipelines de extraccion de activaciones: reutilizar la procedencia documentada (store de activaciones, extractor, lanzamiento vLLM) para replicar la captura de activaciones del target.
- Benchmarking interno de drafters: comparar este checkpoint con otros brazos del port dyn-spec sobre el mismo conjunto de 200 filas fijas de validacion.
- Formacion y auditoria: servir como ejemplo de artefacto con trazabilidad completa (SHA de commit, SHA256 del checkpoint, MANIFEST) para ensenar buenas practicas de registro de experimentos.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score (full_acc) | τ (eal) | chat | code | formal | math | roleplay | science |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.4449 | 5.985 | 0.2766 | 0.5573 | 0.4912 | 0.6774 | 0.2112 | 0.4555 |
| 17000 | 0.4698 | 6.457 | 0.2856 | 0.5866 | 0.5550 | 0.6901 | 0.2319 | 0.4695 |

El fine-tuning mejora todas las metricas por dominio reportadas, con el mayor incremento en `formal` (+0.0638) y `code` (+0.0293). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un drafter acoplado a Qwen3-8B, el requisito dominante sera el del modelo objetivo (aproximadamente 16 GB en FP16 para 8B, mas el drafter), pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del target Qwen3-8B y de la exportacion DFlash, aun no portada.
- Opciones de despliegue: el autor indica que la exportacion DFlash para serving no esta portada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto (aunque la procedencia menciona un lanzamiento en vLLM para extraccion de activaciones).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Target | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| dyn-spec-dflash-newmix100k-full-ft-3ep-kl (este) | LoRA drafter (checkpoint de entrenamiento) | Qwen3-8B | no disponible | no disponible | no disponible | Publicado, sin export de serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | Qwen3-8B | no disponible | no disponible | no disponible | Base de partida de este entrenamiento |
| Qwen/Qwen3-8B | Modelo objetivo | — | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo de referencia |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a rol y linaje.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autonoma: es un checkpoint de entrenamiento de un drafter; sin la exportacion DFlash de serving no puede desplegarse directamente.
- El repositorio incluye estado del optimizador (12,7 GB), lo que lo hace inadecuado como artefacto de inferencia ligero.
- Licencia no declarada: no se puede asumir uso comercial permitido; verificar con el autor antes de cualquier explotacion.
- Idiomas y contexto no documentados; el comportamiento multilingue dependera del target Qwen3-8B y del dataset `newmix100k`, cuya composicion no se detalla.
- Las metricas de validacion provienen de 200 filas fijas con una fila por LoRA; pueden no reflejar el rendimiento en distribuciones reales de trafico.
- Riesgo de alucinacion: inherente al target Qwen3-8B; el drafter solo propone tokens que el target verifica, pero una tasa de aceptacion baja degradaria la aceleracion sin garantizar correccion.
- Sin resultados de benchmarks estandar publicados; no extrapolar los valores de `full_acc` a metricas de calidad tipo MMLU o HumanEval.
- Procedencia dependiente de artefactos externos (store de activaciones, commit del drafter base); la reproducibilidad exige disponer de esos recursos.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-newmix100k-full-ft-3ep-kl
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Commit del drafter base citado: `9b41424b7109f9c5413454f481b09a82b85333f4`
- Commit del entrenamiento citado: `c802de355f3c5f00b529ab65a711a6e528456c22`
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
