# RyanYr/asyncrl-partial-m4b_klr_pi_s40-gs280

## Resumen

Este repositorio no contiene un modelo listo para usar, sino un **artefacto de entrenamiento parcialmente dañado** del proyecto `m4b_klr_pi_s40`, publicado por el usuario RyanYr. El entrenamiento alcanzó el paso 280, pero el proceso murió mientras se escribía el directorio `global_step_280/`, dejando únicamente los pesos del modelo y del `extra_state` intactos, mientras que el estado del optimizador (imprescindible para reanudar) quedó destruido y la exportación a safetensors quedó incompleta (solo un shard de cuatro).

El autor etiqueta explícitamente el repo como `not-a-checkpoint`, `partial` y `salvage`, y advierte que no se debe intentar reanudar el entrenamiento desde estos archivos. Lo que sobrevive son pesos utilizables para evaluación, análisis o inicialización de una nueva ejecución, pero no para inferencia directa (no hay safetensors completos) ni para continuar el entrenamiento. Para reanudar, el autor indica que se debe usar el checkpoint completo del paso 275, archivado en `RyanYr/asyncrl-m4b_klr_pi_s40-gs275`.

Dado que no se proporciona ninguna especificación técnica del modelo (arquitectura, número de parámetros, contexto, licencia, etc.), esta ficha se limita a documentar el estado real del repositorio y sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (FSDP shards, world_size 2) + un shard safetensors incompleto |

Detalles adicionales del repositorio:

- Tamaño total del repo: 17.7 GB
- Archivos de modelo: `model_world_size_2_rank_{0,1}.pt` (8,823,082,523 bytes cada uno, verificados como ZIP válidos con 406 miembros CRC-pass)
- Archivos `extra_state_world_size_2_rank_{0,1}.pt` también intactos
- Optimizer state: destruido (archivos corruptos, no ZIP)
- Exportación safetensors: solo shard 1 de 4, sin `model.safetensors.index.json`, más un `.tmp` de 4.9 GB a medio escribir

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (tipo de transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento, el número de tokens, o si se aplicaron técnicas como RLHF o DPO. Lo único que se puede inferir del contexto es que se trata de un entrenamiento de **reinforcement learning asíncrono** (según el repositorio `async-rl` del autor) utilizando **FSDP** (Fully Sharded Data Parallel) con un tamaño de mundo de 2, y que el entrenamiento llegó al paso 280 antes de interrumpirse.

La innovación técnica relevante aquí no es del modelo en sí, sino del proceso de publicación: el autor documenta explícitamente qué archivos sobrevivieron y cuáles no, mediante inspección directa (verificación CRC, tamaños de shards), y separa los pesos utilizables del estado corrupto. Esto es una buena práctica de transparencia, pero no aporta información sobre el modelo subyacente.

## Capacidades

No disponible. Al no existir safetensors completos ni un modelo cargable, no es posible evaluar capacidades de generación, razonamiento, código, tool calling, etc. Los pesos `.pt` podrían teóricamente cargarse en un framework compatible con FSDP para inspección, pero no se ha publicado ninguna documentación al respecto.

## Casos de uso

No disponible. Este repositorio no es un modelo desplegable. Los únicos usos posibles, según el propio autor, son:

- **Análisis de pesos**: inspeccionar los shards supervivientes para estudiar el estado del modelo en el paso 280.
- **Inicialización de un nuevo entrenamiento**: usar estos pesos como punto de partida para una ejecución desde cero (no para reanudar, porque falta el optimizer state).
- **Depuración de pipelines de RL**: como caso de estudio de qué ocurre cuando un entrenamiento se interrumpe a mitad de escritura.

No hay casos de uso prácticos de inferencia o producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

No disponible. No se especifican requisitos de VRAM, GPUs recomendadas, ni opciones de despliegue. Los archivos de modelo pesan ~8.8 GB por shard (world_size 2), lo que sugiere que el modelo completo podría tener un tamaño considerable, pero sin conocer el número de parámetros ni el tipo de datos no se puede estimar la VRAM necesaria.

## Comparativa con modelos similares

No disponible. No hay información suficiente para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- **No es un checkpoint resumible**: el estado del optimizador está destruido, por lo que no se puede continuar el entrenamiento desde este repositorio. Para reanudar, usar el paso 275 (`RyanYr/asyncrl-m4b_klr_pi_s40-gs275`).
- **No es un modelo de inferencia**: la exportación safetensors está incompleta (solo shard 1 de 4, sin índice), por lo que no se puede cargar con pipelines estándar de HuggingFace.
- **Sin licencia**: no se indica ninguna licencia, lo que impide cualquier uso comercial o redistribución sin autorización explícita.
- **Sin especificaciones**: se desconoce la arquitectura, el número de parámetros, el contexto, los idiomas y cualquier otra característica técnica.
- **Riesgo de confusión**: el nombre del repo (`asyncrl-partial-m4b_klr_pi_s40-gs280`) puede inducir a error, pareciendo un checkpoint completo. El autor lo advierte con las etiquetas `not-a-checkpoint` y `partial`.
- **Fecha de creación futura**: el repo está fechado en 2026-08-18, lo que sugiere que podría ser un artefacto de prueba o una fecha incorrecta. No afecta al contenido, pero conviene tenerlo en cuenta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RyanYr/asyncrl-partial-m4b_klr_pi_s40-gs280
- Repositorio GitHub del autor (async-rl): https://github.com/yurun-yuan/async-rl (contiene `REPRODUCE.md` con el procedimiento de restauración)
- Checkpoint completo del paso 275: https://huggingface.co/RyanYr/asyncrl-m4b_klr_pi_s40-gs275 (referenciado en la model card)
