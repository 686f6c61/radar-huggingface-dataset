# erdem-erdem/dyn-spec-dflash-d2-generator-attn-r32-4k-1500-layer4

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* de decodificación especulativa, no un modelo generativo autónomo. Se trata de una adaptación mediante LoRA (rango 32, aplicada a la capa 4) sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, cuyo modelo objetivo es `Qwen/Qwen3-8B`. El entrenamiento pertenece al brazo `direct` de la fase de preentrenamiento de un port denominado dyn-spec DFlash, con 1500 actualizaciones y semilla 42.

La relevancia de este artefacto es acotada: sirve como material reproducible de investigación sobre decodificación especulativa, incluyendo estado del optimizador, resultados de validación, evaluaciones offline y procedencia completa (identidad del almacén de activaciones, registro del extractor, procedencia del lanzamiento de vLLM). No es un bundle de servicio: el autor indica explícitamente que la exportación para servir con DFlash aún no está portada.

El rendimiento medido es prácticamente plano respecto al punto de partida: la puntuación `full_acc` pasa de 0,5246 en la actualización 0 a 0,5239 en la 1500, y τ (eal) de 7,108 a 7,115. Es decir, el ajuste LoRA no aporta mejora apreciable en la validación de 200 filas fijas. La información pública disponible sobre arquitectura interna, licencia e idiomas es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter de decodificación especulativa sobre Qwen3-8B; adaptación LoRA r32 en capa 4) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la tirada se denomina "4k") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de servicio |

## Arquitectura y entrenamiento

El objeto entrenado es un *drafter* para decodificación especulativa, es decir, un modelo auxiliar que propone tokens candidatos que el modelo objetivo (`Qwen/Qwen3-8B`) verifica. El drafter base es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), y la adaptación consiste en un generador LoRA de rango 32 aplicado a la capa 4, según la denominación `attn-r32-4k-1500-layer4`.

El entrenamiento se realizó en el brazo `direct`, etapa `pretraining`, con 1500 actualizaciones y semilla 42. El checkpoint incluye estado del optimizador y va acompañado de un almacén de activaciones identificado como `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, además de registros de extracción, llenado y procedencia del lanzamiento de vLLM. El repositorio conserva asimismo el comando de entrenamiento (`train_command.txt`), un parche (`speculators.patch`) y manifiesto con tamaños y SHA256 de cada fichero. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- No es un modelo de propósito general: no genera texto de forma autónoma ni se usa como asistente.
- Función principal: proponer tokens candidatos en un esquema de decodificación especulativa para acelerar la inferencia de `Qwen3-8B`.
- Aporta artefactos de reproducibilidad: checkpoint con optimizador, resultados de validación, evaluaciones offline (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14) y métricas por fila.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües propias.
- No se documentan modos especiales (thinking, visión, audio).
- Estado de servicio: no disponible; la exportación de servicio DFlash no está portada.

## Casos de uso

- Investigación en decodificación especulativa: permite reproducir el brazo `direct` del port dyn-spec DFlash con semilla y SHA fijados, útil para comparar variantes de drafter bajo condiciones controladas.
- Análisis de eficacia de LoRA en drafters: al conservar el checkpoint en la actualización 0 y en la 1500, se puede estudiar por qué una adaptación de rango 32 en la capa 4 no mejora la precisión de aceptación.
- Auditoría de procedencia: los registros de almacén de activaciones, extractor y lanzamiento de vLLM permiten reconstruir el pipeline de datos y verificar la integridad mediante `MANIFEST.json`.
- Estudio de curvas de validación por categoría: las métricas desglosadas (chat, code, math, stem) sobre 200 filas fijas sirven para analizar el comportamiento del drafter por dominio.
- Base para futuras exportaciones de servicio: cuando se porte la exportación DFlash, este checkpoint podría convertirse en insumo para medir aceleración real de inferencia sobre Qwen3-8B.
- Docencia y formación: ejemplo realista de un artefacto de investigación con trazabilidad completa, útil para enseñar buenas prácticas de procedencia en experimentos de IA.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una fila por LoRA, métrica `full_acc`:

| Actualización | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5239 | 7.115 | 0.3363 | 0.5700 | 0.6779 | 0.5115 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros drafters.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 2,7 GB e incluye estado del optimizador, por lo que el tamaño del artefacto no equivale al de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no determinada.
- Opciones de despliegue: no hay bundle de servicio; el autor menciona procedencia de lanzamiento de vLLM en los registros, pero la exportación DFlash de servicio no está portada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-d2-generator-attn-r32-4k-1500-layer4 | Checkpoint de drafter (LoRA) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter base DFlash | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Qwen/Qwen3-8B | Modelo objetivo | 8B (según denominación) | no disponible | no disponible | Hugging Face (referenciado) |

No se dispone de datos de rendimiento comparables entre estas entradas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: carece de exportación DFlash portada; no debe desplegarse como generador.
- El ajuste no mejora la validación: `full_acc` baja ligeramente de 0,5246 a 0,5239 entre la actualización 0 y la 1500.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos del autor y del drafter base.
- Idiomas no declarados: no hay garantía de cobertura multilingüe.
- Tamaño de validación reducido (200 filas), por lo que las diferencias observadas pueden estar dentro del ruido.
- El repositorio contiene estado del optimizador y artefactos de entrenamiento, no pesos optimizados para inferencia.
- Riesgo de sesgo y alucinación heredado del modelo objetivo Qwen3-8B, no evaluado en esta ficha.
- Procedencia dependiente de enlaces externos (almacén de activaciones y drafter base), cuya disponibilidad futura no está garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d2-generator-attn-r32-4k-1500-layer4
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: `Qwen/Qwen3-8B`
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
