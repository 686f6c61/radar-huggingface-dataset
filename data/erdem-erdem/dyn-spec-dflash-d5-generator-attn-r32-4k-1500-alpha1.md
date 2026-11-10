# erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-alpha1

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* de decodificación especulativa, no un modelo generativo independiente. Se trata de una adaptación del drafter `z-lab/Qwen3-8B-DFlash-b16` (DFlash) sobre el modelo objetivo Qwen/Qwen3-8B, realizada mediante LoRA con rango 32 y un presupuesto de contexto de 4K, dentro del proyecto "dyn-spec" del autor erdem-erdem. El nombre codifica los hiperparámetros: `d5` (profundidad de borradores), `attn` (mecanismo de atención en el drafter), `r32` (rango LoRA), `4k` (longitud de contexto) y `1500` (actualizaciones de entrenamiento).

El propósito es acelerar la inferencia del modelo objetivo Qwen3-8B mediante decodificación especulativa: el drafter propone tokens candidatos que el modelo grande verifica en paralelo, reduciendo la latencia por token cuando la tasa de aceptación es alta. Este checkpoint corresponde al brazo `direct` en la etapa de *pretraining*, con semilla 42 y 1500 pasos de actualización.

Es relevante como artefacto de investigación reproducible: incluye estado del optimizador, resultados de validación sobre 200 filas fijas, evaluaciones offline y procedencia completa (identidad del almacén de activaciones, registro del extractor, procedencia del lanzamiento de vLLM). No es un paquete listo para servir: el autor indica explícitamente que la exportación de servicio de DFlash aún no está portada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DFlash (LoRA de rango 32) sobre Qwen3-8B; transformer con atención |
| Parametros totales | no disponible (repo de 13,2 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (según nombre `4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con estado del optimizador; no GGUF ni safetensors de servicio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado sobre el drafter DFlash `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b...`), cuyo modelo objetivo es Qwen/Qwen3-8B. El entrenamiento se realizó en la etapa de *pretraining* del brazo `direct`, con 1500 actualizaciones, semilla 42 y un contexto de 4K tokens. El SHA de Git del código de entrenamiento es `40afeeffe21e62a4b2a8f4bf1f35697c0413c847` y el SHA256 del checkpoint es `93f83fb06fd0aa7574f7865a3fb1cb4090e4844cc5f1c36480a9dc39e6ca36b8`.

Los datos de entrenamiento provienen de un almacén de activaciones identificado como `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, con registros de extracción, llenado y procedencia del lanzamiento de vLLM incluidos en `provenance/store/`. No se especifican en la información disponible el número total de tokens, la composición del dataset ni si hubo RLHF o DPO. El repositorio incluye resultados de evaluación offline en `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila), lo que permite auditar el proceso.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que Qwen3-8B los verifique, con el objetivo de reducir la latencia de inferencia.
- Generación de borradores multi-token (parámetro `d5` en el nombre sugiere hasta 5 tokens por paso de borrador).
- Validación sobre cuatro dominios evaluados: chat, código (`code`), matemáticas (`math`) y STEM.
- No es un modelo de chat autónomo: no se documentan capacidades de tool calling, agentes ni razonamiento multi-paso propias.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: integrar el drafter en un pipeline de decodificación especulativa para reducir la latencia por token en cargas de chat, siempre que se complete la exportación de servicio pendiente.
- Investigación en decodificación especulativa: usar el checkpoint y las evaluaciones offline para reproducir experimentos sobre tasa de aceptación y factor de aceleración.
- Estudio de adaptación LoRA de drafters: analizar cómo un adaptador de rango 32 sobre un drafter preentrenado afecta a la precisión de las propuestas en distintos dominios (chat, código, matemáticas, STEM).
- Auditoría de procedencia de entrenamiento: el repositorio incluye identidad del almacén de activaciones, registros de extracción y procedencia de vLLM, útil para trabajos de reproducibilidad.
- Benchmarking de drafters alternativos: comparar este brazo `direct` con otras configuraciones del mismo proyecto (distintos rangos LoRA o longitudes de contexto) usando las 200 filas fijas de validación.
- Desarrollo de sistemas de serving: servir como referencia para portar la exportación de DFlash a un bundle de servicio (vLLM u otro), tarea pendiente según el autor.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas (una fila por LoRA, métrica `full_acc`):

| Actualización | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5131 | 6.898 | 0.3237 | 0.5575 | 0.6726 | 0.4988 |

El entrenamiento de 1500 pasos no mejora la validación respecto al punto de partida: el score baja de 0,5246 a 0,5131 y τ (longitud media aceptada, presumiblemente) cae de 7,108 a 6,898. El descenso es consistente en los cuatro dominios. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 13,2 GB e incluye estado del optimizador; el tamaño del adaptador LoRA en inferencia es mucho menor, pero no se especifica.
- El drafter se usa junto a Qwen3-8B como modelo objetivo; la VRAM total depende de la cuantización del objetivo (no disponible) más la del drafter.
- GPU recomendadas: no disponibles en la información proporcionada. Para Qwen3-8B en FP16 se necesitan del orden de 16 GB solo para pesos, más KV cache y drafter.
- Compatibilidad con GPU de consumo: no confirmada; dependería de la cuantización del objetivo y del drafter.
- Opciones de despliegue: el autor indica que la exportación de servicio de DFlash no está portada; se menciona vLLM en la procedencia del almacén de activaciones, pero no como opción de serving de este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (dyn-spec d5-generator) | Drafter LoRA sobre DFlash/Qwen3-8B | no disponible | 4096 | no disponible | Checkpoint de entrenamiento, no serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: es un checkpoint de entrenamiento con estado del optimizador; la exportación de serving de DFlash no está portada.
- El entrenamiento de 1500 pasos degrada ligeramente la validación respecto al punto de partida (score 0,5246 → 0,5131), por lo que este checkpoint no aporta mejora medible sobre el drafter base en las 200 filas evaluadas.
- La validación se limita a 200 filas fijas; no hay benchmarks estándar publicados.
- Licencia no disponible: no se puede asumir uso comercial sin verificar la licencia del drafter base y de Qwen3-8B.
- Idiomas soportados no documentados; las capacidades multilingües dependen del modelo objetivo Qwen3-8B.
- Sesgos y riesgo de alucinación: no documentados; al ser un drafter, los tokens propuestos se verifican contra el modelo objetivo, lo que limita la propagación de errores pero no la elimina si la verificación es aproximada.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-alpha1
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
