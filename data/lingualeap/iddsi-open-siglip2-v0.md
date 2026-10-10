# lingualeap/iddsi-open-siglip2-v0

## Resumen

IDDSI-Open (lingualeap/iddsi-open-siglip2-v0) es una previsualización de investigación publicada por LinguaLeap Tech Limited que aborda la clasificación automática de texturas alimentarias según la escala IDDSI (International Dysphagia Diet Standardisation Initiative), relevante para pacientes con disfagia. El modelo combina un backbone SigLIP-2 con una cabeza CORAL (regresión ordinal) y una política de abstención calibrada que, cuando no alcanza confianza suficiente, devuelve la etiqueta `unclear — perform physical test` en lugar de un veredicto.

Lo más destacable de la publicación no es el modelo, sino su forma de entrega: se publican el código, los resultados de evaluación, el grader del *flow test* y un hallazgo negativo medido. Los pesos del modelo y el dataset de imágenes cosechado están retenidos de forma deliberada. El motivo declarado es que la cabeza de clasificación no supera los *gates* de seguridad pre-registrados del propio proyecto: la infraclasificación peligrosa (predecir una textura más segura que la real) alcanza el 33 % en la versión v0.1.

El pipeline cubre cinco niveles de textura (L3 a L7) y se apoya en etiquetas débiles generadas por dos jueces VLM (Qwen3-VL-2B como nivel 1 y Qwen3-VL-8B como nivel 2). La versión v0.2, fechada el 10 de octubre de 2026, reentrena sobre un manifiesto corregido con 684 eventos únicos, pero no revierte la decisión de retención: el *gate* de kappa (≥ 0,70) sigue fallando en las cinco semillas y el de tasa de falsos negativos (≤ 0,05) solo se cumple en una.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone SigLIP-2 con cabeza CORAL (regresión ordinal) y abstención calibrada |
| Parámetros totales | no disponible (pesos no publicados) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (clasificación de imagen; no se especifica resolución de entrada) |
| Tipos de cuantización | no disponible (pesos retenidos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (solo para el código; los pesos no se distribuyen) |
| Formato de pesos | no disponible (los pesos están retenidos por decisión del autor) |

Otros datos de la ficha de Hugging Face: pipeline `image-classification`, 5 clases (L3, L4, L5, L6, L7), 0 descargas y 0 *likes* en el momento de la consulta, creado el 30 de agosto de 2026 y actualizado el 10 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un *vision encoder* SigLIP-2 al que se le añade una cabeza CORAL, adecuada para objetivos ordinales como los niveles IDDSI (donde L3 < L4 < L5 < L6 < L7 tienen un orden físico). El pipeline completo tiene cuatro etapas: cosecha de imágenes con licencias candidatas (713 imágenes reales en tres conjuntos: `realweak_pilot` con 117 + 12, `harvest_d1` con 400 y `harvest_d1b` con 184, más 701 imágenes en bruto y 6 generadas en la nube ya validadas); etiquetado débil de dos niveles por jueces VLM (Qwen3-VL-2B y Qwen3-VL-8B); entrenamiento de la cabeza CORAL sobre SigLIP-2; y abstención calibrada.

La innovación metodológica declarada es la combinación de abstención calibrada con un *grader* de *flow test* publicado, que convierte la salida ambigua en una recomendación de prueba física en lugar de un veredicto. Sin embargo, el propio autor documenta que las etiquetas de entrenamiento son ruidosas: los dos jueces VLM solo coinciden en el 31,0 % de las imágenes (n_pairs = 575), apenas por encima del ~20 % esperable por azar con cinco clases, con un kappa no ponderado de 0,1062 y ponderado cuadrático de 0,2766. El análisis por tabla cruzada muestra un sesgo direccional: las llamadas L4 se desvían 69 veces hacia L7 y 28 hacia L6; las L5, 54 hacia L7 y 42 hacia L6; las L6, 111 hacia L7. Es decir, los jueces comparten una deriva sistemática hacia el extremo "seguro" de la escala y solo las llamadas L3 resultan fiables. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Clasificación de imágenes de alimentos en cinco niveles IDDSI (L3, L4, L5, L6, L7) mediante cabeza ordinal CORAL.
- Salida con abstención calibrada: emite `unclear — perform physical test` cuando la confianza no alcanza el umbral, en lugar de forzar una clase.
- Puntuación de *flow test* a través del *grader* publicado junto al código.
- Etiquetado débil de imágenes mediante dos jueces VLM en dos niveles (Qwen3-VL-2B y Qwen3-VL-8B) como componente del pipeline, no como capacidad del clasificador.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Capacidad multilingüe: no disponible; el modelo se declara únicamente en inglés.

## Casos de uso

- Auditoría de pipelines de etiquetado débil con VLM: los resultados publicados (acuerdo entre jueces del 31,0 %, kappa 0,1062) sirven como referencia para medir cuánto ruido introduce el etiquetado automático antes de entrenar un clasificador ordinal.
- Replicación de la evaluación de abstención calibrada: el código y los resultados por semilla están publicados, de modo que un equipo puede reproducir las métricas de cobertura y kappa sin necesidad de los pesos.
- Diseño de políticas de abstención en clasificadores con implicaciones de seguridad: el caso muestra cómo una política de rechazo reduce la infraclasificación peligrosa *visible* del 33,3 % al rango 3,9 %–13,3 %, aunque a costa de desplomar la cobertura del 88,1 % al 50,0 %–61,8 %.
- Investigación sobre sesgo direccional en clasificación ordinal: la tabla cruzada entre jueces documenta una deriva hacia clases "más seguras" que es directamente aplicable al estudio de funciones de pérdida ordinal y umbrales asimétricos.
- Revisión de cumplimiento de licencias en datasets cosechados de la web: la ficha detalla que, de 587 eventos únicos, solo 2 se podrían publicar limpiamente, 592 filas arrastran licencias Open Images/Openverse no verificadas, 7 son CC BY-SA frente a la licencia principal BY-NC-SA y 109 tienen estatus de redistribución sin resolver; es un caso de estudio útil para equipos que planean cosechar datos.
- Integración en un flujo clínico asistido por verificación física: el sistema está pensado para derivar a una prueba de *flow test* cuando la imagen no contiene un fiducial de escala, dado que los niveles intermedios requieren información absoluta de tamaño y fluidez que una fotografía no aporta.
- Metodología de publicación con *gates* pre-registrados: sirve como plantilla para equipos que quieran documentar hallazgos negativos y justificar la retención de pesos en lugar de publicar artefactos que se usarían como veredictos.

## Benchmarks y rendimiento

Los resultados publicados no son benchmarks convencionales (MMLU, HumanEval, GSM8K), sino métricas de evaluación interna sobre etiquetas débiles ruidosas. El propio autor advierte que toda métrica derivada de etiquetas se mide contra ruido y no dice nada sobre la precisión en el mundo real.

| Métrica | v0.1 | v0.2 (5 semillas, rango) | Dirección |
|---|---|---|---|
| macro-F1 (tal como se publicó) | 0,358 | 0,284 – 0,320 | empeora |
| macro-F1 (abstención puntuada como clase) | no calculado | 0,237 – 0,267 | — |
| kappa ponderado (sobre filas cubiertas) | 0,4227 | 0,455 – 0,539 | sube, con salvedades (H-KAPPACOV) |
| kappa ponderado (todas las filas) | no calculado | 0,405 – 0,457 | — |
| Infraclasificación peligrosa (cubiertas) | 0,333 | 0,039 – 0,133 | baja, con salvedades |
| Cobertura | 0,881 | 0,500 – 0,618 | cae en picado |
| *Gate* de calibración (FNR ≤ 0,05) | falso | 1 de 5 semillas | sigue fallando |

| Métrica de acuerdo entre jueces VLM | Valor |
|---|---|
| Acuerdo bruto (n_pairs = 575) | 31,0 % |
| Nivel de azar esperado (5 clases) | ~20 % |
| Kappa no ponderado | 0,1062 |
| Kappa ponderado cuadrático | 0,2766 |
| Interpretación Landis-Koch | leve / aceptable como máximo |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los pesos del clasificador están retenidos, por lo que no se puede estimar el consumo a partir del número de parámetros.
- GPU recomendadas: no disponible para el clasificador. El pipeline de etiquetado débil emplea Qwen3-VL-2B (tier 1) y Qwen3-VL-8B (tier 2) como jueces, pero la documentación no especifica el hardware utilizado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el modelo no se distribuye.
- Latencia y *throughput*: no disponible.
- Lo que sí es ejecutable sin pesos: el código de evaluación y el *grader* del *flow test*, publicados bajo Apache 2.0 en el repositorio de GitHub del proyecto.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros clasificadores de texturas IDDSI en la información proporcionada. Los únicos modelos citados en la documentación son los jueces del pipeline de etiquetado, que no son alternativas al clasificador sino componentes internos:

| Modelo | Rol en el proyecto | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| lingualeap/iddsi-open-siglip2-v0 | Clasificador IDDSI (L3–L7) | no disponible | apache-2.0 (solo código) | Pesos retenidos |
| Qwen3-VL-2B | Juez VLM de nivel 1 (etiquetado débil) | 2B | no indicada en la documentación | No indicada |
| Qwen3-VL-8B | Juez VLM de nivel 2 (etiquetado débil) | 8B | no indicada en la documentación | No indicada |

Comparativa con clasificadores SigLIP-2 de propósito general: no disponible.

## Limitaciones y advertencias

- Infraclasificación peligrosa del 33 % en v0.1: el modelo predice en ocasiones una textura más segura que la real, lo que en un contexto clínico de disfagia es el error con peor consecuencia. Es una de las razones declaradas de la retención de pesos.
- Métricas ciegas a la abstención: la métrica documentada como H-ABSTBLIND no puede ver una abstención, de modo que las cifras de v0.1 (cobertura 0,881) y v0.2 (cobertura ~0,55) no son la misma medición y no deben compararse directamente.
- *Gates* de seguridad incumplidos: el *gate* wk1 (kappa ≥ 0,70) falla en las cinco semillas, con un máximo de 0,539; el *gate* wk2 (FNR ≤ 0,05) solo se cumple en una semilla (0,0488, semilla 29). La regla de parada sigue activa.
- Etiquetas ruidosas: el acuerdo entre jueces VLM es del 31,0 % con kappa no ponderado de 0,1062; ninguna métrica derivada de esas etiquetas es extrapolable a precisión real.
- Sesgo direccional hacia lo seguro: los jueces desvían sistemáticamente las clases intermedias hacia L7 (documentado como H-L7SINK). Solo las llamadas L3 son fiables.
- Limitación física del dato: los niveles L4, L5 y L6 requieren información absoluta de tamaño y flujo que una fotografía sin fiducial de escala no contiene.
- Idiomas: únicamente inglés.
- Retención de pesos: no se pueden desplegar ni ajustar; la licencia Apache 2.0 cubre el código, no los pesos (que no existen públicamente).
- Problemas de licencia del dataset: 592 filas con licencias Open Images/Openverse no verificadas, 7 con CC BY-SA frente a la licencia principal BY-NC-SA y 109 con estatus de redistribución sin resolver. El dataset no es publicable tal cual.
- Fugas y duplicados corregidos en v0.2: 20 `event_id` duplicados entre corpus y un `group_id` sin control de fuga efectivo (H-GROUP); la partición corregida es 70/15/15 estratificada por nivel, semilla 20260918.
- Cualquier uso en producción sanitaria requeriría validación independiente, datos con escala física y aprobación regulatoria; la propia ficha descarta que un aviso legal sustituya a una afirmación de validez.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/lingualeap/iddsi-open-siglip2-v0
- Repositorio de código (incluye los PDF y el *grader* del *flow test*): https://github.com/rayc0/iddsi-open
- Ficha de registro en free2aitools: https://free2aitools.com/model/lingualeap/iddsi-open-siglip2-v0
- Página del proyecto LinguaLeap de Rowan Liu: https://rowanliu.com/projects/lingualeap/
- Referencia arXiv etiquetada por el autor: arxiv:2407.01032 (título no disponible en la información proporcionada)
- Referencia arXiv etiquetada por el autor: arxiv:1712.04577 (título no disponible en la información proporcionada)
