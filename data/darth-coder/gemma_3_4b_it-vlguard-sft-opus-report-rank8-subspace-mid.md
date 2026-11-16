# Darth-Coder/gemma_3_4b_it-vlguard-sft-opus-report-rank8-subspace-mid

## Resumen

`gemma_3_4b_it-vlguard-sft-opus-report-rank8-subspace-mid` es un artefacto de investigación de red-team publicado por el usuario Darth-Coder sobre el modelo `google/gemma-3-4b-it`. No es un modelo de propósito general ni un lanzamiento de producto: es el resultado de un experimento de edición de pesos (weight editing) que intenta eliminar la capacidad de rechazo (refusal) de un modelo Gemma 3 4B previamente afinado con VLGuard-SFT. Forma parte del estudio WSP-MLLM-Safety de etapa 2, centrado en determinar si la calidad del informe de interpretabilidad de la etapa 1 condiciona el éxito de una edición posterior de pesos.

La edición aplicada es una ortogonalización de un subespacio de rechazo de rango 8, proyectado fuera de las capas `mlp.down_proj` de la banda media de seguridad textual (capas {6, 10, 13, 16, 22}), con normalización plegada a través del layernorm post-FFN de Gemma 3. El subespacio se obtiene por SVD de las diferencias de medias refuse−comply por categoría de daño y por capa. El resultado, según el propio autor, es que la edición **no** elimina la seguridad: mantiene la coherencia y la utilidad, pero deja las tasas de rechazo prácticamente intactas.

El modelo es relevante únicamente como evidencia negativa en investigación de seguridad: demuestra que una edición guiada por un informe de interpretabilidad incorrecto (en este caso, generado por Opus-4.8) fracasa, mientras que la misma edición guiada por otro informe (Fable-5.2) sobre el mismo checkpoint sí conseguía eliminar la seguridad. El autor lo marca explícitamente como artefacto privado de investigación y no apto para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), base `google/gemma-3-4b-it` |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use y Prohibited Use Policy) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer multimodal de 4.300 millones de parámetros con pipeline `image-text-to-text`. Sobre esa base se aplicó primero un VLGuard-SFT (checkpoint `Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6`), y después una edición de pesos sin entrenamiento adicional, ejecutada en CPU.

La edición consiste en lo siguiente: se calcula un subespacio de rechazo mediante SVD de las diferencias de medias entre respuestas de rechazo y de cumplimiento, agregadas por categoría de daño y por capa. Ese subespacio de rango 8 se proyecta ortogonalmente fuera de la matriz `mlp.down_proj` de las capas {6, 10, 13, 16, 22}, que constituyen la banda media de seguridad textual identificada en el informe de la etapa 1. La proyección se pliega a través del layernorm post-FFN de Gemma 3 para preservar la equivalencia funcional. El checkpoint fuente se verificó por hash como byte-idéntico antes y después del proceso. El autor indica que no hubo entrenamiento y que la edición se guió por el informe `run_opus48/safety_analysis.md`, generado por Opus-4.8.

## Capacidades

- Generación de texto conversacional, heredada de `gemma-3-4b-it`.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado de la base multimodal.
- Comportamiento de rechazo ante contenido dañino, preservado tras la edición (el objetivo del experimento era eliminarlo y no se logró).
- Utilidad de razonamiento multimodal preservada: los benchmarks de utilidad se mantienen idénticos al SFT sin editar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación de seguridad en MLLM: servir como control negativo en estudios sobre eliminación de refusal, comparando esta edición (que falla) con la edición basada en el informe Fable-5.2 (que sí elimina la seguridad) sobre el mismo checkpoint.
- Evaluación de la fiabilidad de informes de interpretabilidad: usar el resultado para cuantificar hasta qué punto un informe de etapa 1 incorrecto (Opus-4.8) degrada el éxito de una edición posterior de pesos.
- Reproducibilidad de ediciones de pesos: el proceso documentado (SVD del subespacio de rechazo, proyección en `mlp.down_proj`, plegado de layernorm) permite replicar el experimento en CPU sin entrenamiento.
- Estudio de la localización de la seguridad en transformers: los resultados aportan evidencia sobre qué capas y módulos (banda media, `down_proj`) no concentran el locus de seguridad, en contraste con el locus a nivel de neurona que identificó el informe Fable.
- Auditoría de proxies de evaluación de seguridad: el autor señala que las cifras de ASR usan un proxy de no-rechazo por palabras clave y que no se ejecutó el juez de daño a nivel de contenido, lo que convierte al modelo en un caso para validar la solidez de dichos proxies.
- Docencia y formación en red-team de modelos abiertos: ilustra de forma concreta cómo una edición técnicamente correcta puede fracasar si el objetivo (targeting) está mal especificado.

## Benchmarks y rendimiento

Datos reportados por el autor (porcentajes). La comparación es entre el SFT sin editar y esta edición.

| Métrica | SFT (sin editar) | Esta edición |
|---|---|---|
| Refuse % figstep | 100 | 100 |
| Refuse % mmsafety | 73 | 74 |
| Refuse % jbmini | 72 | 69 |
| Utilidad scienceqa (%) | 76 | 76 |
| Utilidad mathvista (%) | 52 | 52 |
| No-rechazos degenerados | — | ~0 (coherente) |

El autor indica que las cifras de seguridad son un proxy de no-rechazo por palabras clave y que no se ejecutó el juez de daño a nivel de contenido por motivos de salvaguardas. Como referencia, la edición basada en el informe Fable-5.2 sobre el mismo checkpoint logró refuse% de 7 / 2 / 32 manteniendo la utilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (4.300 millones de parámetros), en FP16 rondaría los 8,6 GB de pesos, pero el autor no publica estimaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: el repo declara compatibilidad con `transformers` y `text-generation-inference` (tag `endpoints_compatible`). No se documentan otras opciones.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refuse % (figstep / mmsafety / jbmini) | Utilidad (scienceqa / mathvista) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (edición rank-8, informe Opus) | 4.300 M | no disponible | 100 / 74 / 69 | 76 / 52 | Gemma | Público en HF (marcado research-only) |
| SFT sin editar (`Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6`) | 4.300 M | no disponible | 100 / 73 / 72 | 76 / 52 | Gemma | Público en HF |
| Edición guiada por informe Fable-5.2 (mismo checkpoint) | 4.300 M | no disponible | 7 / 2 / 32 | no disponible (el autor indica que mantiene la utilidad) | Gemma | No disponible en la información proporcionada |
| `google/gemma-3-4b-it` (base) | 4.300 M | no disponible | no disponible | no disponible | Gemma | Público en HF |

## Limitaciones y advertencias

- Artefacto de investigación de red-team: el autor lo etiqueta explícitamente como "PRIVATE red-team research artifact. Not for deployment." No debe usarse en producción.
- Objetivo del experimento fallido: la edición no elimina la seguridad. Las tasas de rechazo se mantienen en 100 / 74 / 69, prácticamente idénticas al SFT sin editar.
- Proxy de evaluación limitado: las cifras de seguridad son un proxy de no-rechazo por palabras clave; no se ejecutó el juez de daño a nivel de contenido. El autor argumenta que el ASR real es ≤ al del SFT porque los no-rechazos son coherentes y están en o por debajo del SFT.
- Riesgo de alucinación: no evaluado ni documentado en la información proporcionada.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no especificados; dependen de la base `gemma-3-4b-it`.
- Restricciones de licencia: uso sujeto a los Gemma Terms of Use y a la Prohibited Use Policy de Google. Los pesos están modificados respecto a los de la base.
- Caveat de reproducibilidad: el resultado depende del informe de interpretabilidad de etapa 1; el propio estudio demuestra que la misma edición con otro informe produce un resultado opuesto, lo que subraya la sensibilidad del método al targeting.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darth-Coder/gemma_3_4b_it-vlguard-sft-opus-report-rank8-subspace-mid
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint SFT de partida: https://huggingface.co/Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
