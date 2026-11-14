# erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-hybrid32

## Resumen

`dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-hybrid32` es un checkpoint de entrenamiento para un *drafter* de decodificación especulativa, publicado por el usuario erdem-erdem en Hugging Face. No se trata de un modelo de lenguaje autónomo, sino de un adaptador LoRA (rango 512) que se entrena sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. El artefacto forma parte de una línea de experimentos denominada dyn-spec, orientada a portar y adaptar el mecanismo DFlash de decodificación especulativa.

El repositorio contiene el estado completo de una ejecución de entrenamiento: checkpoint con estado del optimizador, métricas, resultados de evaluaciones offline, registros de procedencia y el *activation store* asociado. El autor advierte explícitamente de que no es un paquete listo para servir: la exportación de servicio de DFlash aún no está portada. Por tanto, su utilidad es de investigación y reproducción, no de despliegue directo.

La relevancia es acotada pero específica: la decodificación especulativa es una de las técnicas más extendidas para reducir la latencia en inferencia de LLM, y este checkpoint documenta de forma reproducible una ablación concreta (brazo `direct`, etapa de preentrenamiento, 2667 actualizaciones, semilla 42) sobre Qwen3-8B. El tamaño del repo es de 3,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DFlash con adaptador LoRA (rango 512) sobre `z-lab/Qwen3-8B-DFlash-b16`; modelo objetivo `Qwen/Qwen3-8B` |
| Parametros totales | no disponible (el repo pesa 3,1 GB e incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) dentro de `run/pretraining/...`; incluye `MANIFEST.json` con SHA256 de cada fichero |

## Arquitectura y entrenamiento

El artefacto es un *drafter* de decodificación especulativa basado en el mecanismo DFlash, adaptado mediante un LoRA de rango 512 sobre el drafter de referencia `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`). El entrenamiento se ejecuta en el brazo `direct`, etapa de `pretraining`, con 2667 actualizaciones, semilla 42 y un total de 2667 pasos registrados. El SHA de git del código de entrenamiento es `7c8aadebc74c4fed06d5cb7bdce4abf9ca4ea1a3` y el SHA256 del checkpoint es `8d151e042c75997591692d2a7db2b7d0d16d3188998f40475ee2428f08304c8a`.

Los datos de entrenamiento provienen de un *activation store* publicado por el mismo autor: `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`, que actúa como conjunto de activaciones extraídas del modelo objetivo. El nombre del experimento sugiere una mezcla de 24k ejemplos y una configuración híbrida de 32 pasos (`hybrid32`), aunque la model card no detalla la composición exacta del dataset ni el número total de tokens. El repositorio incluye `speculators.patch`, `train_command.txt`, `timing.json` y un directorio `provenance/` con la identidad del store, el registro del extractor, la procedencia del lanzamiento de vLLM y los registros de relleno, lo que permite reproducir la ejecución.

## Capacidades

- No es un modelo generativo autónomo: su función es proponer tokens candidatos para acelerar la decodificación del modelo objetivo Qwen3-8B.
- Decodificación especulativa: genera borradores de tokens que el modelo objetivo verifica, reduciendo el número de pasos de decodificación autoregresiva.
- Entrenamiento con señal KL: el sufijo `kl` del nombre indica que la adaptación se guía mediante divergencia KL respecto a la distribución del modelo objetivo.
- Adaptación LoRA de rango 512 sobre un drafter preexistente, lo que permite ajustes específicos sin reentrenar el drafter completo.
- Evaluación por dominios: las métricas de validación se desglosan en `chat`, `code`, `math` y `stem`.
- Tool calling, agentes, visión, audio y capacidades multilingües: no disponibles (no aplican a un drafter de este tipo).

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el drafter se acopla al modelo objetivo para reducir la latencia por token mediante decodificación especulativa verificada, manteniendo la distribución de salida del modelo base.
- Investigación en decodificación especulativa: el checkpoint y los registros de procedencia permiten reproducir la ablación `direct` y comparar contra otras configuraciones de la misma línea dyn-spec.
- Ajuste fino de drafters por dominio: las métricas desglosadas por `chat`, `code`, `math` y `stem` permiten evaluar si la adaptación mejora dominios concretos antes de desplegar un drafter especializado.
- Servicio de chat de baja latencia: el desglose de validación en `chat` (0,3518 en la actualización 2667) orienta sobre la idoneidad del drafter para asistentes conversacionales.
- Generación de código asistida: el rendimiento en `code` (0,6070) es el más alto de los cuatro dominios evaluados, lo que lo hace candidato para pipelines de autocompletado o generación de código sobre Qwen3-8B.
- Reproducción de experimentos y auditoría: los ficheros `MANIFEST.json`, `provenance/` y `run_record_*.json` permiten verificar la integridad y el linaje del entrenamiento en entornos de investigación.
- Base para futuras exportaciones de servicio: aunque el autor indica que la exportación de servicio DFlash no está portada, este checkpoint sirve como material de partida para construirla.

## Benchmarks y rendimiento

La model card proporciona una validación sobre 200 filas fijas, con una fila por LoRA, midiendo `full_acc` y τ (eal), además del desglose por dominio:

| Actualización | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 2667 | 0,5347 | 7,894 | 0,3518 | 0,6070 | 0,6847 | 0,4952 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los resultados de evaluación offline completos se encuentran en `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14 y métricas por fila), pero sus valores no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo de 3,1 GB incluye estado del optimizador y artefactos de entrenamiento, por lo que no refleja el tamaño del drafter en servicio.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportación de servicio DFlash no está portada; el repositorio no es un paquete listo para servir. La procedencia menciona un lanzamiento de vLLM para la extracción de activaciones, no para servir el drafter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Rol | Modelo objetivo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-hybrid32 | Drafter LoRA (DFlash) | Qwen/Qwen3-8B | no disponible | no disponible | no disponible | Checkpoint de entrenamiento en HF |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | Qwen/Qwen3-8B | no disponible | no disponible | no disponible | HF |
| Qwen/Qwen3-8B | Modelo generativo | no aplica | 8B | no disponible | no disponible | HF |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo listo para servir: el autor indica explícitamente que la exportación de servicio DFlash no está portada.
- El repositorio contiene un checkpoint de entrenamiento con estado del optimizador, no pesos optimizados para inferencia.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor y las licencias del modelo objetivo y del drafter base.
- Idiomas soportados no documentados; las capacidades lingüísticas dependen del modelo objetivo Qwen3-8B.
- Riesgo de alucinación: aunque la verificación especulativa preserva la distribución del modelo objetivo, un drafter mal adaptado puede reducir la tasa de aceptación y, con ello, el beneficio de latencia.
- La validación se limita a 200 filas fijas; la mejora observada entre la actualización 0 y la 2667 es modesta (0,5265 a 0,5347 en score; 7,703 a 7,894 en τ), por lo que la ganancia práctica debe medirse en el dominio de despliegue.
- Sin datos publicados de benchmarks estándar ni de latencia real en producción.
- La reproducibilidad depende del *activation store* externo `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k` y del código en el commit indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-generator-attn-r512-2ep-kl-hybrid32
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
