# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-fp32

## Resumen

DFlash drafter adaptation run (`direct` arm) es un checkpoint de entrenamiento derivado del port del generador dyn-spec DFlash. El artefacto no es un modelo generativo autónomo, sino un adaptador LoRA de tipo *drafter* destinado a decodificación especulativa sobre el modelo objetivo Qwen/Qwen3-8B. El autor, erdem-erdem, lo publica como material de investigación reproducible: incluye estado del optimizador, resultados de validación, evaluaciones offline y trazabilidad completa del entrenamiento.

El repositorio ocupa 2,8 GB y contiene el directorio `run/` con el checkpoint (`checkpoint.pt`), métricas, comandos de entrenamiento, un parche (`speculators.patch`) y registros de procedencia. La model card advierte explícitamente de que se trata de un checkpoint de entrenamiento y no de un bundle de serving: la exportación DFlash para inferencia aún no está portada.

Su relevancia es metodológica más que de producto: documenta una adaptación LoRA de rango 32 sobre un drafter DFlash (`z-lab/Qwen3-8B-DFlash-b16`) para el modelo Qwen3-8B, con 2667 actualizaciones y semilla fija, lo que permite reproducir el experimento y auditar la cadena de procedencia. No hay información pública sobre licencia, idiomas, parámetros del modelo base ni benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DFlash con adaptador LoRA (rango 32) sobre `z-lab/Qwen3-8B-DFlash-b16` |
| Parametros totales | no disponible (el modelo objetivo es Qwen/Qwen3-8B; el drafter es un adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en fp32 según el nombre del artefacto; el `checkpoint.pt` incluye estado del optimizador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con estado del optimizador; no es un bundle de serving |

## Arquitectura y entrenamiento

El artefacto es una adaptación de un drafter DFlash para decodificación especulativa. El drafter original es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), y el modelo objetivo es Qwen/Qwen3-8B. La adaptación se realiza mediante un LoRA de rango 32 (`r32`) sobre las capas de atención del drafter (`attn`), entrenado durante 2 épocas (`2ep`) con una pérdida KL (`kl`) y un umbral de probabilidad de 256 (`pt256`), en precisión fp32.

El entrenamiento consta de 2667 actualizaciones con semilla 42 y pertenece al brazo `direct` en la etapa de `pretraining`. La tienda de activaciones utilizada es el dataset `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`. El repositorio incluye trazabilidad completa: `run_record_*.json`, `inputs/`, `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, `speculators.patch`, `provenance/` (identidad de la tienda, registro del extractor, procedencia del lanzamiento de vLLM y registros de llenado) y `MANIFEST.json` con tamaños y SHA256 de cada fichero.

La validación se realizó sobre 200 filas fijas, una por LoRA, midiendo `full_acc` y τ (eal) desglosado por dominio. En la actualización 0 el score fue 0,5265 (τ 7,703) y en la 2667 fue 0,5343 (τ 7,896). Por dominio: chat 0,3463 → 0,3524; code 0,5956 → 0,6068; math 0,6775 → 0,6843; stem 0,4866 → 0,4938. El repositorio también contiene evaluaciones offline en `run/offline_eval/` con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila.

## Capacidades

- Decodificación especulativa: actúa como drafter para acelerar la generación del modelo objetivo Qwen/Qwen3-8B.
- Adaptación LoRA sobre atención: el adaptador se aplica a las capas de atención del drafter DFlash.
- Reproducibilidad experimental: incluye estado del optimizador, semilla, comandos de entrenamiento y parche de código.
- Trazabilidad de procedencia: registros de la tienda de activaciones, del extractor y del lanzamiento de vLLM.
- Evaluación por dominios: métricas desglosadas en chat, code, math y stem.
- No es un modelo de propósito general: no se documentan capacidades de generación autónoma, tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en decodificación especulativa: permite reproducir el entrenamiento del drafter con semilla y comandos fijos, y comparar la evolución de `full_acc` y τ entre actualizaciones.
- Aceleración de inferencia sobre Qwen3-8B: una vez portada la exportación de serving (no incluida), el drafter adaptado podría integrarse en un pipeline de generación especulativa para reducir la latencia por token.
- Auditoría de procedencia de modelos: el repositorio sirve como ejemplo de trazabilidad completa (tienda de activaciones, extractor, lanzamiento de vLLM, hashes), útil para equipos que necesitan reproducir experimentos de adaptación.
- Estudio de adaptadores LoRA en drafters: el rango 32 sobre atención y la pérdida KL con umbral 256 permiten analizar el efecto de la configuración en la precisión del drafter por dominio.
- Evaluación comparativa por dominios: las métricas desglosadas en chat, code, math y stem permiten estudiar dónde mejora o se estanca la adaptación.
- Docencia y formación técnica: el artefacto ilustra el flujo completo de un experimento de decodificación especulativa con checkpoints intermedios y evaluación offline.

## Benchmarks y rendimiento

| Actualización | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 2667 | 0,5343 | 7,896 | 0,3524 | 0,6068 | 0,6843 | 0,4938 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores corresponden a la validación interna del autor sobre 200 filas fijas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es un checkpoint de entrenamiento en fp32 con estado del optimizador, no un bundle de serving.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica que la exportación DFlash para serving no está portada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto. El repositorio menciona procedencia de un lanzamiento de vLLM durante la extracción de activaciones, no para serving del drafter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec DFlash drafter adaptation (este artefacto) | Adaptador LoRA sobre drafter DFlash | no disponible | no disponible | no disponible | Checkpoint de entrenamiento en HF |
| `z-lab/Qwen3-8B-DFlash-b16` | Drafter DFlash base | no disponible | no disponible | no disponible | HF |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | HF |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de serving: la model card advierte de que la exportación DFlash para inferencia no está portada; no debe desplegarse directamente como generador.
- Licencia no especificada: no hay información sobre licencia, lo que impide evaluar el uso comercial.
- Idiomas no documentados: no se declaran idiomas soportados.
- Contexto no documentado: no se indica la longitud de contexto del drafter ni del modelo objetivo.
- Sesgos y alucinación: no se documentan análisis de sesgo ni tasas de alucinación; al ser un drafter, su función es proponer tokens que el modelo objetivo verifica.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación externa.
- Checkpoint con estado del optimizador: el tamaño de 2,8 GB incluye estado de entrenamiento, no solo pesos de inferencia.
- Dependencia de la tienda de activaciones: la reproducibilidad depende del dataset `dyn-spec-dflash-store-qwen3-8b-mix24k` y del parche `speculators.patch`.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-fp32
- Dataset de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: Qwen/Qwen3-8B
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
