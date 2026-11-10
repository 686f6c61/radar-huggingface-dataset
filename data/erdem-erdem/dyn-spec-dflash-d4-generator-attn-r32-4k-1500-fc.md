# erdem-erdem/dyn-spec-dflash-d4-generator-attn-r32-4k-1500-fc

## Resumen

`dyn-spec-dflash-d4-generator-attn-r32-4k-1500-fc` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem dentro de una línea de trabajo sobre decodificación especulativa (speculative decoding). No se trata de un modelo generativo autónomo, sino de un *drafter* o generador de borradores LoRA (rango 32) entrenado para adaptar el drafter `z-lab/Qwen3-8B-DFlash-b16` al modelo objetivo `Qwen/Qwen3-8B`. El artefacto pertenece a la rama `direct` de la fase de preentrenamiento de un port denominado dyn-spec DFlash.

El repositorio pesa 15,6 GB e incluye el estado del optimizador, registros de ejecución, evaluaciones offline y trazabilidad completa (provenance). Según la model card, no es un paquete listo para servir: la exportación de servicio de DFlash aún no está portada, por lo que su uso previsto es la reproducción de experimentos y el análisis del proceso de entrenamiento, no el despliegue directo en producción.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin pipeline asociado. Su interés radica en documentar la metodología de adaptación de drafters para decodificación especulativa sobre Qwen3-8B, no en sus capacidades de generación propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA generator (rango 32) sobre drafter DFlash; adaptación para decodificación especulativa. Arquitectura base del drafter: no disponible en detalle |
| Parámetros totales | no disponible (repo de 15,6 GB, incluye estado del optimizador y artefactos de ejecución) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k (según el nombre del artefacto y el store de activaciones asociado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch); no incluye exportación de servicio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 (`attn-r32`) entrenado como generador de borradores para decodificación especulativa. El modelo objetivo es `Qwen/Qwen3-8B` y el drafter de partida es `z-lab/Qwen3-8B-DFlash-b16` en el commit `9b41424b7109f9c5413454f481b09a82b85333f4`. La ejecución corresponde a la rama `direct` y a la etapa `pretraining`, con 1500 actualizaciones, semilla 42 y un Git SHA documentado (`5194f8101a6e7d0e12af87e28106d8c677afd008`). El checkpoint tiene SHA256 `a3849059d011d668977811e9bac10534a81e5098eada939e2da1fef6deeefb08`.

El entrenamiento se apoya en un store de activaciones de 4k publicado como dataset (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), con registros de identidad del store, extractor, lanzamiento de vLLM y rellenos. La validación se realizó sobre 200 filas fijas, una por LoRA, midiendo `full_acc` y la longitud media de aceptación (τ, eal) desglosada por dominios chat, code, math y stem. El repositorio incluye evaluaciones offline con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, además de un `MANIFEST.json` con tamaño y SHA256 de cada fichero.

## Capacidades

- Generación de borradores (drafting) para decodificación especulativa sobre `Qwen/Qwen3-8B`, con el objetivo de acelerar la inferencia del modelo objetivo.
- Adaptación mediante LoRA de rango 32 sobre el drafter DFlash, especializada en atención.
- Evaluación por dominios: chat, código, matemáticas y STEM, con métricas de precisión completa y longitud de aceptación.
- Reproducibilidad: incluye comandos de entrenamiento (`train_command.txt`), parche de speculators (`speculators.patch`), registros de ejecución y provenance del store de activaciones.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento explícito para este artefacto.
- No es un modelo servible de forma directa: la exportación de servicio DFlash no está portada.

## Casos de uso

- Reproducción de experimentos de decodificación especulativa: el repositorio contiene el checkpoint, el comando de entrenamiento, el parche y los registros necesarios para replicar la ejecución `direct`/`pretraining` con 1500 actualizaciones y semilla 42.
- Análisis de la dinámica de aceptación del drafter: las métricas por dominio (chat, code, math, stem) permiten estudiar en qué tipos de contenido el drafter aporta más o menos longitud de aceptación.
- Investigación sobre adaptación LoRA de drafters: el rango 32 y la especialización en atención sirven como punto de partida para comparar configuraciones alternativas de rango y módulos adaptados.
- Auditoría de provenance en pipelines de entrenamiento: los registros de identidad del store, extractor y lanzamiento de vLLM permiten verificar la cadena de procedencia de los datos de activaciones.
- Estudio de coste y similitud de donantes: las evaluaciones offline (M4, M7, D13, D14) permiten analizar coeficientes, donantes y coste computacional asociados al drafter.
- Base para portar la exportación de servicio DFlash: al ser un checkpoint de entrenamiento, puede emplearse como material de partida para completar el port de servicio pendiente.

## Benchmarks y rendimiento

La model card incluye una validación sobre 200 filas fijas (una por LoRA) con métrica `full_acc` y τ (eal):

| Actualización | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5210 | 7.100 | 0.3342 | 0.5665 | 0.6739 | 0.5095 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es un checkpoint de entrenamiento con estado del optimizador (15,6 GB), no un bundle de servicio.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la exportación de servicio DFlash no está portada según la model card. El entrenamiento se asocia a un lanzamiento de vLLM documentado en `provenance/store/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-d4-generator-attn-r32-4k-1500-fc | LoRA generator (drafter) | Qwen/Qwen3-8B | 4k | no disponible | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | Qwen/Qwen3-8B | no disponible | no disponible | Hugging Face (referenciado como origen) |
| Qwen/Qwen3-8B | Modelo generativo objetivo | no aplica | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo servible: la model card indica explícitamente que es un checkpoint de entrenamiento y que la exportación de servicio DFlash no está portada.
- Licencia no declarada: no se especifican condiciones de uso comercial ni restricciones, lo que impide evaluar su viabilidad legal en producción.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Sin pipeline ni formato de inferencia estándar: el peso está en `checkpoint.pt`, no en safetensors ni GGUF.
- Rendimiento plano entre la actualización 0 y la 1500: el score pasa de 0.5246 a 0.5210 y τ de 7.108 a 7.100, sin mejora apreciable en la validación reportada.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este artefacto.
- Trazabilidad dependiente de artefactos externos: el store de activaciones y el drafter base son repositorios separados, por lo que la reproducibilidad exige resolver esas dependencias.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d4-generator-attn-r32-4k-1500-fc
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: `Qwen/Qwen3-8B`
