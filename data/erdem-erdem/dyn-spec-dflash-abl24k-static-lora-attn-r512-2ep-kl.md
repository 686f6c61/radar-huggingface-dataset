# erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r512-2ep-kl

## Resumen

`dyn-spec-dflash-abl24k-static-lora-attn-r512-2ep-kl` es un checkpoint de entrenamiento de un *drafter* de decodificación especulativa, no un modelo de lenguaje listo para servir. Lo publica el usuario `erdem-erdem` en Hugging Face como parte de una experimentación sobre el ecosistema DFlash, y su función es proponer tokens candidatos que un modelo objetivo de mayor tamaño verifica después. El modelo objetivo es `Qwen/Qwen3-8B` y el drafter de partida es `z-lab/Qwen3-8B-DFlash-b16`, sobre el que se aplica una adaptación LoRA de rango 512 en las capas de atención.

El artefacto corresponde al brazo `fresh_lora` de la etapa `pretraining`, con 2667 actualizaciones de entrenamiento, semilla 42 y un estado de optimizador incluido en el paquete. El repositorio ocupa 0,4 GB y contiene el checkpoint (`checkpoint.pt`), métricas, comandos de entrenamiento, un parche de `speculators`, procedencia del *activation store* y un manifiesto con tamaños y hashes. La model card indica explícitamente que no es un *serving bundle*: la exportación de servicio de DFlash aún no está portada.

La relevancia es acotada y experimental: sirve para reproducir y auditar un experimento de entrenamiento de drafters especulativos, no para desplegar en producción. No hay licencia declarada, ni idiomas, ni pipeline, ni datos de benchmarks estándar publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DFlash con adaptadores LoRA sobre atención (rango 512); arquitectura base del transformer no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de servicio |

## Arquitectura y entrenamiento

El modelo es un *drafter* de decodificación especulativa construido sobre DFlash, adaptado desde `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`) para asistir a `Qwen/Qwen3-8B`. La adaptación usa LoRA de rango 512 sobre las capas de atención (`static-lora-attn-r512`), dentro del brazo `fresh_lora` y la etapa `pretraining`. El entrenamiento se ejecutó durante 2667 actualizaciones con semilla 42, y el paquete conserva el estado del optimizador, lo que permite reanudar o inspeccionar el proceso.

Los datos de entrenamiento provienen de un *activation store* identificado como `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`, con registros de extracción, lanzamiento de vLLM y relleno incluidos en `provenance/store/`. La validación se realizó sobre 200 filas fijas, una por adaptador LoRA, midiendo `full_acc` y la longitud media de aceptación (`τ`, eal). El repositorio incluye además evaluaciones offline en `run/offline_eval/` con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, así como un `speculators.patch` que documenta los cambios aplicados a la herramienta de entrenamiento.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre `Qwen/Qwen3-8B`.
- Aceleración potencial de la inferencia del modelo objetivo mediante verificación de propuestas (la magnitud concreta no está documentada en la información disponible).
- Adaptación específica a atención mediante LoRA de rango 512.
- Evaluación desagregada por dominios: chat, código, matemáticas y STEM.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.
- No es un modelo de chat ni de generación autónoma: requiere un modelo objetivo y un runtime de decodificación especulativa.

## Casos de uso

- Reproducción de experimentos de decodificación especulativa: el paquete incluye `train_command.txt`, `speculators.patch`, semilla y hashes, lo que permite repetir el entrenamiento y comparar resultados con otras variantes del mismo autor.
- Investigación sobre adaptadores LoRA en drafters: el rango 512 y el brazo `fresh_lora` permiten estudiar el efecto del rango y de la inicialización sobre la tasa de aceptación.
- Auditoría de procedencia de datos: `provenance/store/` documenta el *activation store*, la extracción y el lanzamiento de vLLM, útil para trazabilidad en publicaciones.
- Análisis de curvas de entrenamiento: `metrics.json` y `timing.json` permiten estudiar la evolución de la precisión y el coste computacional entre la actualización 0 y la 2667.
- Comparación de donantes y similitud de activaciones: las evaluaciones offline D13 y M7 permiten analizar qué capas o donantes contribuyen a la aceptación.
- Estudio de coste y latencia: los coeficientes D14 y M4 permiten modelar el equilibrio entre velocidad de decodificación y precisión del drafter.
- Base para portar la exportación de servicio de DFlash: al no existir aún el bundle de servicio, este checkpoint sirve como material de partida para esa integración.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (200 filas fijas, `full_acc`):

| Actualización | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5353 | 7.922 | 0.3522 | 0.6075 | 0.6853 | 0.4963 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,4 GB, pero incluye estado del optimizador y no es un bundle de servicio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinada en la información disponible.
- Opciones de despliegue: no disponible; la model card indica que la exportación de servicio de DFlash no está portada.
- Latencia y throughput: no disponibles; solo se reporta la longitud media de aceptación `τ` (7,703 en la actualización 0 y 7,922 en la 2667).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-static-lora-attn-r512-2ep-kl | Drafter LoRA sobre DFlash | no disponible | no disponible | no disponible | Checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo base de partida |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible | no disponible | Modelo verificado |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere `Qwen/Qwen3-8B` y un runtime de decodificación especulativa para funcionar.
- No es un bundle de servicio; la exportación DFlash para servir no está portada.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados; no hay evidencia de capacidades multilingües.
- Sin datos de sesgos, alucinación o robustez; al ser un drafter, los errores se filtran por la verificación del modelo objetivo, pero afectan a la tasa de aceptación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso externo ni validación independiente.
- El checkpoint incluye estado del optimizador, lo que incrementa el tamaño y no está pensado para inferencia directa.
- Creado y actualizado el 2026-11-14; la información puede quedar obsoleta si el autor publica nuevas variantes.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r512-2ep-kl
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
