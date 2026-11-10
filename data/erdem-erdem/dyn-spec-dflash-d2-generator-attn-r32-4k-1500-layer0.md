# erdem-erdem/dyn-spec-dflash-d2-generator-attn-r32-4k-1500-layer0

## Resumen

`d2-generator-attn-r32-4k-1500-layer0` es un checkpoint de entrenamiento de un drafter de decodificación especulativa, publicado por el usuario erdem-erdem en Hugging Face. No es un modelo generativo autónomo, sino el resultado de una adaptación LoRA (rango 32, capa 0) sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, que a su vez actúa como modelo auxiliar del target `Qwen/Qwen3-8B`. El objetivo del artefacto es acelerar la inferencia del modelo grande prediciendo varios tokens por paso, dentro del marco "dyn-spec" (dynamic speculation) y del port del generador DFlash.

El repositorio contiene el directorio de ejecución completo: checkpoint con estado del optimizador, métricas, comandos de entrenamiento, parches y trazabilidad (provenance). Se trata, por tanto, de material de investigación reproducible más que de un paquete listo para servir en producción; la propia model card indica que la exportación de servicio DFlash aún no se ha portado.

Su relevancia es acotada pero específica: sirve como evidencia empírica de un experimento de adaptación de drafters con 1500 actualizaciones y semilla 42, con evaluación offline y validación sobre 200 filas fijas. El tamaño del repositorio (2,7 GB) corresponde al checkpoint y sus artefactos auxiliares, no a un modelo de 8B completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa basado en el drafter DFlash `z-lab/Qwen3-8B-DFlash-b16` con adaptador LoRA (rango 32, capa 0) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (implícito en el nombre `4k` y en el store de activaciones `-4k`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con estado del optimizador; no es un bundle de servicio |
| Modelo objetivo | `Qwen/Qwen3-8B` |
| Drafter base | `z-lab/Qwen3-8B-DFlash-b16@9b41424b7109f9c5413454f481b09a82b85333f4` |
| Brazo / etapa | `direct` / `pretraining` |
| Actualizaciones | 1500 |
| Semilla | 42 |
| Git SHA | `637dd9ee61365744c1a7cacb232f05d5a44f90b0` |
| SHA256 del checkpoint | `32bf60baff41eac1a03f2cddd971e9c23d4eeeb47c302f840af61222f97b2cce` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado a la capa 0 del drafter DFlash asociado a Qwen3-8B. El drafter DFlash es un modelo auxiliar ligero que propone secuencias de tokens candidatas; el modelo objetivo (Qwen3-8B) las verifica en paralelo, de modo que se aceptan varias posiciones por paso de decodificación y se reduce la latencia efectiva. El entrenamiento se realizó en la etapa de pretraining del brazo `direct`, con 1500 actualizaciones y semilla 42, sobre un store de activaciones de 4k de contexto (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`).

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO; tampoco se especifica la función de pérdida exacta ni la innovación algorítmica del marco dyn-spec más allá de su nombre. El repositorio incluye evaluaciones offline con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, así como métricas por fila, lo que permite auditar el experimento, pero los resultados numéricos de esas evaluaciones no se reproducen en la model card.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B, no generación de texto autónoma.
- Aceleración de la inferencia del modelo objetivo mediante verificación paralela de propuestas.
- Adaptación específica a la capa 0 del drafter DFlash con LoRA de rango 32.
- Evaluación sobre cuatro dominios: chat, código, matemáticas y STEM.
- No soporta tool calling ni function calling de forma nativa: es un componente interno de un pipeline de decodificación, no un modelo conversacional.
- No soporta agentes ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no disponibles (el drafter hereda el tokenizador y vocabulario de Qwen3-8B, pero no se documenta comportamiento por idioma).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint permite reproducir el experimento de adaptación LoRA sobre el drafter DFlash con la semilla y el SHA documentados, útil para comparar variantes del marco dyn-spec.
- Aceleración de inferencia de Qwen3-8B en entornos controlados: integrado en un pipeline de decodificación especulativa, el drafter propone tokens que el modelo objetivo verifica, reduciendo pasos de decodificación en contextos de hasta 4k tokens.
- Auditoría de artefactos de entrenamiento: el repositorio incluye `MANIFEST.json` con tamaños y SHA256 de cada fichero, lo que facilita la verificación de integridad en pipelines de MLOps.
- Reproducción de evaluaciones offline: los directorios `run/offline_eval/` contienen métricas por fila y coeficientes que permiten replicar los análisis de similitud y coste del experimento.
- Estudio de la dinámica de entrenamiento de drafters: la comparación entre la actualización 0 y la 1500 (con `full_acc` de 0,5246 y 0,5233 respectivamente) sirve para analizar la estabilidad del entrenamiento y el efecto del adaptador.
- Base para futuras exportaciones de servicio: aunque la model card indica que la exportación DFlash de servicio no está portada, el checkpoint puede servir como punto de partida para construir un bundle de serving una vez exista el conversor.

## Benchmarks y rendimiento

La model card proporciona una validación sobre 200 filas fijas, una fila por LoRA, con la métrica `full_acc` y τ (eal):

| Actualización | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5246 | 7,108 | 0,3383 | 0,5699 | 0,6796 | 0,5105 |
| 1500 | 0,5233 | 7,157 | 0,3383 | 0,5677 | 0,6764 | 0,5107 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores miden la calidad del drafter en la tarea de especulación, no el rendimiento del modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint ocupa 2,7 GB en disco e incluye estado del optimizador, por lo que el peso del adaptador es una fracción de esa cifra. El drafter DFlash base y el modelo objetivo Qwen3-8B se cargan por separado.
- GPU recomendadas: no disponibles en la información proporcionada. Para el modelo objetivo Qwen3-8B se requiere una GPU con al menos 16 GB de VRAM en FP16, pero este dato no procede de la model card y debe tratarse como estimación general, no como especificación del artefacto.
- Cabe en GPU de consumo: el adaptador LoRA en sí es pequeño, pero el pipeline completo requiere cargar Qwen3-8B y el drafter, lo que excede GPUs de gama baja.
- Opciones de despliegue: no disponible; la model card indica explícitamente que la exportación de servicio DFlash no está portada. El repositorio incluye procedencia de lanzamiento de vLLM, lo que sugiere que el entrenamiento se realizó con ese stack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `d2-generator-attn-r32-4k-1500-layer0` (este) | Checkpoint de drafter LoRA | 4k | no disponible | Hugging Face, 0 descargas | Material de investigación, no bundle de servicio |
| `z-lab/Qwen3-8B-DFlash-b16` | Drafter DFlash base | no disponible | no disponible | Hugging Face | Modelo del que parte la adaptación |
| `Qwen/Qwen3-8B` | LLM objetivo | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo verificado por el drafter |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a su rol en el pipeline.

## Limitaciones y advertencias

- No es un modelo de servicio: la model card advierte que es un checkpoint de entrenamiento con estado del optimizador y que la exportación DFlash de servicio no está portada.
- La validación muestra que el entrenamiento apenas mejora el punto de partida: `full_acc` pasa de 0,5246 a 0,5233 y τ de 7,108 a 7,157, sin cambios en chat (0,3383 en ambos). No debe interpretarse como una mejora sustancial.
- Licencia no disponible: no se puede confirmar el uso comercial del artefacto ni del drafter base.
- Idiomas no documentados: el comportamiento multilingüe no está evaluado.
- Riesgo de alucinación: inherente al pipeline de decodificación especulativa; el drafter puede proponer tokens incorrectos que el modelo objetivo debe rechazar, con el coste computacional asociado.
- Sesgos: no documentados; al heredar el vocabulario y la distribución de Qwen3-8B, puede reflejar los sesgos del modelo objetivo.
- Limitación de contexto: el entrenamiento se realizó con 4k tokens; no hay evidencia de generalización a contextos mayores.
- Reproducibilidad: depende de la disponibilidad del store de activaciones externo (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`) y del drafter base con el commit exacto indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d2-generator-attn-r32-4k-1500-layer0
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
