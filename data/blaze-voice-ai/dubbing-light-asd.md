# blaze-voice-ai/dubbing-light-asd

## Resumen

`dubbing-light-asd` es un modelo de detección de hablante activo (Active Speaker Detection, ASD) ligero, publicado por el perfil `blaze-voice-ai` en Hugging Face. Se trata de un espejo de los pesos `finetuning_TalkSet` del proyecto [Light-ASD](https://github.comJunhua-Liao/Light-ASD) de Junhua-Liao, con licencia MIT. El autor lo subió porque el repositorio original distribuye los pesos dentro del árbol de código y su servicio mantiene ese clon fuera de git, por lo que esta copia era la única disponible en una máquina concreta.

El modelo está diseñado para identificar qué persona está hablando en un vídeo con múltiples interlocutores, combinando información visual (movimiento de labios) y auditiva (voz). Sin embargo, el propio autor documenta que, medido sobre 100 episodios etiquetados de drama corto chino, este modelo **no supera** la heurística de movimiento de boca que pretendía reemplazar: alcanza un 54 % de cobertura con un 82,1 % de precisión de género, frente al 87 % de cobertura y 83,5 % de precisión de la heurística. La rama de voz, evaluada sobre un grupo completo de hablantes, obtiene un 91,4 %. Por ello, la rama facial está desactivada por defecto (`FACE_DIAR=0`) y estos pesos existen únicamente para poder reproducir la medición.

No se dispone de información sobre el tamaño del modelo, la arquitectura interna detallada, el contexto de entrenamiento ni los idiomas soportados. El repositorio en Hugging Face tiene un tamaño de 0,0 GB, lo que sugiere que no se han subido los pesos reales, solo la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Light-ASD (detección de hablante activo ligera, basada en el repositorio de Junhua-Liao) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio en HF no contiene archivos de pesos, solo la model card) |

## Arquitectura y entrenamiento

La arquitectura corresponde al proyecto Light-ASD de Junhua-Liao, que implementa un detector de hablante activo ligero. Según la documentación del autor, el modelo fue afinado (`finetuning`) sobre el conjunto de datos `TalkSet`. No se especifican detalles sobre el número de parámetros, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

El autor indica que el modelo combina una rama visual (basada en movimiento de boca) y una rama auditiva (basada en voz). En la configuración por defecto, la rama facial está desactivada (`FACE_DIAR=0`), lo que implica que en la práctica el sistema depende principalmente de la información de voz. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Detección de hablante activo en vídeo: identifica qué persona está hablando en un momento dado, combinando pistas visuales y auditivas.
- Rama de voz: alcanza un 91,4 % de precisión cuando se evalúa sobre un grupo completo de hablantes, según la medición del autor.
- Rama facial: disponible pero desactivada por defecto; su rendimiento es inferior a la heurística de movimiento de boca (54 % de cobertura con 82,1 % de precisión de género).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes o multilingüismo.

## Casos de uso

- Reproducción de experimentos de detección de hablante activo: los pesos permiten replicar la medición reportada por el autor sobre el dataset de drama corto chino, útil para verificar resultados o comparar metodologías.
- Investigación en diarización de hablantes: el modelo puede servir como componente de un pipeline de diarización, aunque su rendimiento inferior a la heurística sugiere que debe usarse con cautela y validación previa.
- Evaluación comparativa de heurísticas frente a modelos aprendidos: dado que el autor documenta que no supera la heurística de movimiento de boca, el modelo es útil como caso de estudio sobre cuándo un enfoque basado en datos no mejora una solución simple.
- Desarrollo de sistemas de doblaje automático: el nombre del perfil (`blaze-voice-ai`) y el contexto de doblaje sugieren un posible uso en pipelines de doblaje, aunque no hay documentación que lo confirme.
- Análisis de vídeo con múltiples hablantes: en escenarios donde la voz es la pista dominante, la rama auditiva podría emplearse para identificar al hablante activo, siempre que se acepte la limitación de cobertura.
- Integración en servicios de transcripción y subtitulado: la detección de hablante activo puede ayudar a asignar turnos de habla en transcripciones, pero el rendimiento actual limita su aplicabilidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una medición propia sobre 100 episodios etiquetados de drama corto chino, que se resume a continuación:

| Métrica | Modelo (rama facial) | Heurística de movimiento de boca | Rama de voz (grupo completo) |
|---|---|---|---|
| Cobertura | 54 % | 87 % | no especificado |
| Precisión de género | 82,1 % | 83,5 % | 91,4 % |

Estos datos indican que el modelo no mejora la heurística simple y que la rama de voz es significativamente más precisa cuando se evalúa sobre un grupo de hablantes. No hay más métricas disponibles.

## Requisitos de hardware

- No se dispone de información sobre requisitos de hardware, VRAM estimada, GPUs recomendadas o latencia.
- Dado que el repositorio en Hugging Face no contiene pesos (tamaño 0,0 GB), no es posible ejecutar el modelo directamente desde esta página.
- Para reproducir los resultados, sería necesario obtener los pesos del repositorio original de Light-ASD en GitHub y compilar el proyecto, pero no se documentan los requisitos de hardware en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (detección de hablante activo). No se conocen modelos comparables con datos de rendimiento, parámetros o licencia en la información disponible.

## Limitaciones y advertencias

- El modelo no supera la heurística de movimiento de boca en la medición reportada por el autor, lo que indica un rendimiento subóptimo para su propósito principal.
- La rama facial está desactivada por defecto (`FACE_DIAR=0`), por lo que el comportamiento real del sistema depende de la rama de voz.
- No se dispone de información sobre sesgos, riesgos de alucinación (no aplicable a un modelo discriminativo) o limitaciones de idioma.
- El repositorio en Hugging Face no contiene los pesos del modelo (tamaño 0,0 GB), solo la model card; para obtener los pesos es necesario acudir al repositorio original de Light-ASD en GitHub.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- La fecha de creación del repositorio (2026-09-01) es posterior a la fecha actual, lo que sugiere que el modelo es muy reciente o que la fecha es incorrecta; no se ha podido verificar.

## Enlaces

- Hugging Face: https://huggingface.co/blaze-voice-ai/dubbing-light-asd
- Repositorio original de Light-ASD: https://github.com/Junhua-Liao/Light-ASD
- Perfil de blaze-voice-ai en Hugging Face: https://huggingface.co/blaze-voice-ai/datasets
