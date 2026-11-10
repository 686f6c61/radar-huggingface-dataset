# erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors1024

## Resumen

`dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors1024` es un checkpoint de entrenamiento de un drafter de decodificación especulativa (speculative decoding) desarrollado por el usuario de Hugging Face `erdem-erdem` dentro del proyecto dyn-spec. El modelo adapta el drafter `z-lab/Qwen3-8B-DFlash-b16` mediante LoRA (rango 32) y 1500 actualizaciones de entrenamiento, tomando como modelo objetivo `Qwen/Qwen3-8B`. No es un modelo generativo autónomo, sino un componente auxiliar que propone tokens candidatos para acelerar la inferencia del modelo base.

La relevancia de este artefacto es acotada: se trata de un checkpoint intermedio de investigación (brazo `direct`, etapa `pretraining`) que incluye estado del optimizador, resultados de validación y procedencia completa, pero que no constituye un paquete de servicio. El autor indica explícitamente que la exportación de servicio de DFlash aún no se ha portado.

Los resultados de validación muestran que el entrenamiento no mejora la línea base: la puntuación `full_acc` cae de 0.5236 en la actualización 0 a 0.5172 en la 1500, y el ratio de aceptación τ (eal) baja de 7.103 a 7.045. Esto sugiere que la adaptación LoRA no aporta ganancias medibles en este régimen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre drafter DFlash (Qwen3-8B-DFlash-b16); transformer derivado de Qwen3-8B |
| Parametros totales | no disponible (repo de 13.2 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (sufijo `4k` en el nombre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch); no hay safetensors ni GGUF |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 @ 9b41424 |
| Rango LoRA | 32 |
| Actualizaciones de entrenamiento | 1500 |
| Semilla | 42 |
| Anclas | 1024 |

## Arquitectura y entrenamiento

El modelo es una adaptación LoRA (rango 32) sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, un modelo de decodificación especulativa asociado a Qwen3-8B. El entrenamiento se realizó en el brazo `direct` y la etapa `pretraining`, con 1500 actualizaciones y semilla 42. El almacén de activaciones utilizado es `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, con contexto de 4096 tokens y 1024 anclas.

El checkpoint incluye estado del optimizador, registros de procedencia (identidad del almacén, extractor, lanzamiento de vLLM y registros de llenado) y evaluaciones offline (reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14). No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B.
- Aceleración de inferencia del modelo objetivo mediante propuestas de tokens verificadas por el modelo base.
- Adaptación LoRA entrenada para el régimen de contexto de 4096 tokens.
- No es un modelo de chat, razonamiento, código o matemáticas por sí mismo: su función es auxiliar al modelo objetivo.
- Soporte de tool calling: no disponible (no es su función).
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponible más allá de la decodificación especulativa.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint permite reproducir el experimento dyn-spec y analizar la evolución de métricas entre la actualización 0 y la 1500 con los registros incluidos en `run/`.
- Análisis de adaptación LoRA sobre drafters: sirve para estudiar por qué una adaptación de rango 32 con 1500 pasos no mejora la línea base en `full_acc` ni en τ.
- Reproducción de evaluaciones offline: los ficheros en `run/offline_eval/` permiten recalcular métricas por fila (reproducción, M4, M7, D13, D14) sobre las 200 filas fijas de validación.
- Auditoría de procedencia: `provenance/store/` y `MANIFEST.json` permiten verificar la identidad del almacén de activaciones y la integridad de cada fichero mediante SHA256.
- Base para experimentos futuros: al incluir estado del optimizador, puede reanudarse el entrenamiento o compararse con otras configuraciones de rango, pasos o número de anclas.
- Estudio de despliegue con vLLM: los registros de lanzamiento de vLLM documentan la configuración usada, útil para replicar el entorno de inferencia del drafter.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una fila por LoRA, métrica `full_acc`:

| Actualización | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5236 | 7.103 | 0.3379 | 0.5683 | 0.6797 | 0.5085 |
| 1500 | 0.5172 | 7.045 | 0.3314 | 0.5600 | 0.6697 | 0.5076 |

No se han publicado resultados comparativos con otros drafters en la información disponible. Los datos muestran un ligero descenso en todas las métricas tras el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 13.2 GB e incluye estado del optimizador, por lo que el peso efectivo del drafter es menor que el tamaño del repositorio.
- GPU recomendadas: no disponible en la información proporcionada; al derivar de Qwen3-8B, se requiere hardware capaz de alojar el modelo objetivo más el drafter.
- Cabe en GPU de consumo: no disponible; depende del modelo objetivo Qwen3-8B y de la cuantización empleada, no documentada.
- Opciones de despliegue: el autor indica que la exportación de servicio de DFlash no está portada; los registros de vLLM en `provenance/store/` documentan el entorno de extracción, no un bundle de servicio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors1024 | no disponible | 4096 | Drafter LoRA sobre Qwen3-8B-DFlash-b16 | no disponible | Checkpoint de entrenamiento, no bundle de servicio |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | Drafter DFlash base | no disponible | Hugging Face |
| Qwen/Qwen3-8B | 8B (aprox.) | no disponible | Modelo generativo objetivo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: el autor indica que la exportación de servicio de DFlash no está portada; solo sirve como checkpoint de entrenamiento.
- El entrenamiento no mejora la línea base: `full_acc` y τ descienden ligeramente de la actualización 0 a la 1500.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor y a las licencias de Qwen3-8B y del drafter base.
- Idiomas no documentados: no hay información sobre cobertura lingüística.
- Formato de pesos en `checkpoint.pt` con estado del optimizador: no es directamente cargable en frameworks de inferencia estándar sin conversión.
- Riesgo de alucinación: no aplica de forma directa, ya que el drafter propone tokens que el modelo objetivo verifica; el riesgo recae en el modelo base.
- Sesgos: no documentados en la información disponible.
- Dependencia del modelo objetivo: su comportamiento está acoplado a Qwen3-8B y a la versión concreta del drafter base.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors1024
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
