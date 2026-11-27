# 1000luca/FlexDM-LoRA-v2.1

## Resumen

FlexDM-LoRA-v2.1 es un adaptador LoRA de aproximadamente 4 GB (repo de 7,9 GB) desarrollado por el usuario 1000luca que convierte el modelo base google/gemma-4-31B-it en un modelo de decisión calibrado. No genera texto: recibe un estado (un documento, una conversación, una lista de dispositivos, un registro JSON) junto con una o varias preguntas de opción múltiple o de sí/no sobre ese estado, y devuelve una probabilidad para cada opción leída directamente de los logits de las etiquetas de opción en el token `Answer: (` en un único prefill.

El modelo resuelve el problema de la toma de decisiones tipadas y calibradas sobre contexto, un caso de uso distinto al de la generación abierta: en lugar de producir una respuesta en lenguaje natural, emite distribuciones de probabilidad sobre opciones discretas. Según la model card, se sitúa en cuarta posición de 275 en el Decision Index (edición 0.4.1, datos del tablero del 2026-11-06) con una puntuación Full de 71,61, y obtiene la segunda mejor puntuación en dominios nuevos (79,92) de todo el tablero.

Es relevante ahora porque demuestra que un adaptador ligero sobre un modelo base congelado puede competir con fine-tunes completos en tareas de clasificación y decisión, con un coste de despliegue de un único fichero de adaptador sobre el modelo base sin modificar, cuantizado a FP8 en carga y servido en una sola GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder google/gemma-4-31B-it; rango r=128 |
| Parámetros totales | No disponible (adaptador LoRA sobre un base de 31B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo base cuantizado a FP8 por bloques en carga; adaptador en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | cc-by-sa-4.0 (modelo base Apache-2.0) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 aplicado sobre google/gemma-4-31B-it (commit `842da3794eaa0b77d5f08bae87a17459d91ff475`), que permanece congelado y sin cambios; en carga se cuantiza a FP8 por bloques. La inferencia no usa decodificación generativa: se lee la probabilidad de cada opción desde los logits de las etiquetas de opción en el token `Answer: (` en un solo prefill, lo que da una distribución calibrada sobre las alternativas en una única pasada.

Según la model card, la receta de entrenamiento está completamente divulgada (datos, función de pérdida, regla de selección y descontaminación). El único profesor utilizado es el propio modelo base congelado: no se emplearon salidas de Jev ni de otras entradas del tablero. El autor declara que el adaptador aporta +4,05 puntos de Full respecto al mismo lector sin entrenar (FlexDM, 67,56), con +3,41 en las pruebas privadas de mismas habilidades y +5,00 en las tareas privadas de dominios nuevos, mejorando 24 de las 34 tareas privadas de mismas habilidades.

## Capacidades

- Clasificación y decisión tipada: devuelve una probabilidad por opción para preguntas de opción múltiple y de sí/no sobre un estado dado.
- Calibración de probabilidades: la model card reporta ECE 0,054 y Brier 0,305 en la medición de calibración del tablero.
- Procesamiento de estados heterogéneos: documentos, conversaciones, listas de dispositivos y registros JSON como entrada.
- Inferencia en un único prefill: no genera texto, por lo que la latencia es baja (mediana de 155 ms por petición en una RTX PRO 6000 según el tablero).
- Servido en vLLM con el adaptador cargado sobre el modelo base en FP8.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma nativa: su función es emitir decisiones, no ejecutar acciones.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia y un conjunto de categorías o preguntas de sí/no (por ejemplo, "¿requiere escalado?"), el modelo devuelve la probabilidad de cada opción, lo que permite umbralizar y enrutar automáticamente con confianza cuantificada.
- Moderación de contenido con calibración: clasificar conversaciones o documentos contra políticas discretas y usar las probabilidades para fijar umbrales de revisión humana, aprovechando el ECE bajo reportado.
- Validación de registros JSON: comprobar campos y consistencia de registros estructurados respondiendo preguntas de sí/no sobre el estado, integrándose en pipelines de calidad de datos.
- Enrutamiento de conversaciones multi-turno: dado el historial de una conversación y opciones de intención, asignar la intención más probable con una distribución calibrada para decidir si se deriva a un humano.
- Selección entre alternativas en sistemas de recomendación o configuración: dado un estado (por ejemplo, una lista de dispositivos) y opciones candidatas, puntuar cada una con su probabilidad.
- Evaluación automática de respuestas: dado un par pregunta-respuesta y opciones de veredicto (correcto/incorrecto, útil/no útil), obtener la probabilidad de cada veredicto como señal de anotación.
- Investigación en calibración y decisión: servir el adaptador en vLLM sobre el modelo base en FP8 en una sola GPU para reproducir los resultados del Decision Index con el kit y el scorer oficiales.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) en la model card:

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.4.1 (privado, 2026-11-06) | Full score (4.º de 275, grupo #2 empatado) | 71,61 |
| Decision Index 0.4.1 (privado) | Mismas habilidades (60% del Full) | 66,07 |
| Decision Index 0.4.1 (privado) | Dominios nuevos (40% del Full; 2.º de 275) | 79,92 |
| Decision Index 0.3 (suite pública, 140.178 peticiones) | Índice público corregido por azar (ejecución propia) | 68,99 |
| Tablero, medición de calibración | Exactitud / confianza media / ECE / Brier | 77,9% / 80,9% / 0,054 / 0,305 |

Comparativa en el tablero (edición 0.4.1, datos del 2026-11-06):

| # | Modelo | Tipo | Mismas habilidades | Dominios nuevos | Full |
|---:|---|---|---:|---:|---:|
| 1 | REAX 1.3 | ensemble de dos partes | 69,04 | 81,38 | 73,98 |
| 2 | GLiDE 27B | fine-tune completo | 69,83 | 78,68 | 73,37 |
| 3 | KnowLine 31B Gen1.5 | LoRA | 66,79 | 79,59 | 71,91 |
| 4 | FlexDM-LoRA 2.1 · Gemma-4-31B | LoRA | 66,07 | 79,92 | 71,61 |
| 5 | Sieve 31B v3 | fine-tune completo | 68,27 | 75,33 | 71,10 |
| 22 | FlexDM · Gemma-4-31B (sin entrenar) | técnica de inferencia | 62,66 | 74,92 | 67,56 |

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa unos 4 GB; el modelo base de 31B cuantizado a FP8 por bloques requiere aproximadamente 31 GB, por lo que el conjunto necesita del orden de 35 GB o más de VRAM (estimación a partir de los datos disponibles).
- GPU recomendadas: RTX PRO 6000 (medición del tablero), A100 80 GB, H100; una GPU única es suficiente según la model card.
- GPU de consumo: no cabe en GPUs de consumo habituales (24 GB o menos) con el base en FP8; no se dispone de datos para otras cuantizaciones.
- Despliegue: vLLM con el adaptador LoRA cargado sobre el modelo base en FP8, con los mismos prompts, temperaturas y motor que FlexDM.
- Latencia: mediana de 155 ms y media de 416 ms por petición en una RTX PRO 6000 según el tablero.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Full (Decision Index) | Licencia |
|---|---|---|---|---|---|
| FlexDM-LoRA 2.1 (este) | LoRA sobre Gemma-4-31B | 31B (base) | No disponible | 71,61 | cc-by-sa-4.0 |
| KnowLine 31B Gen1.5 | LoRA | 31B | No disponible | 71,91 | No disponible |
| Sieve 31B v3 | fine-tune completo | 31B | No disponible | 71,10 | No disponible |
| FlexDM (sin entrenar) | técnica de inferencia | 31B | No disponible | 67,56 | No disponible |

## Limitaciones y advertencias

- No genera texto: solo emite probabilidades sobre opciones predefinidas; no sirve para tareas generativas.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está documentado.
- Sesgos: no se documentan análisis de sesgo en la información disponible; hereda los del modelo base Gemma-4-31B-it.
- Alucinación: al no generar texto libre el riesgo es distinto, pero las probabilidades pueden ser erróneas o sobreconfiadas en estados fuera de distribución; la calibración reportada (ECE 0,054) procede de la medición del tablero y no está verificada de forma independiente.
- Licencia cc-by-sa-4.0: impone compartir igual (ShareAlike) en obras derivadas, lo que condiciona el uso comercial y la distribución de adaptaciones.
- Los resultados de benchmarks son declarados por el autor y no verificados; el propio tablero los agrupa como empatados dentro de 0,9 puntos.
- Dependencia del modelo base google/gemma-4-31B-it (Apache-2.0) sin modificar y de su cuantización FP8 en carga; cambios en el base pueden alterar el comportamiento.
- Longitud de contexto no disponible: no se puede garantizar el rendimiento con estados muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1000luca/FlexDM-LoRA-v2.1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Ejecución pública (dataset): https://huggingface.co/datasets/1000luca/FlexDM-LoRA-v2.1-decision-index
- Envío (PR #367): https://github.com/apolinario/decision-index/pull/367
- Lector FlexDM: https://github.com/1000luca/FlexDM
- Todas las versiones: https://huggingface.co/1000luca/FlexDM-LoRA
- Blog del autor: https://1000luca.github.io/blog/flexdm/
