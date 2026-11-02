# enes123erman/override-checkpoints

## Resumen

OVERRIDE es un modelo de etiquetado de tokens (token classification) especializado en detectar revisiones dentro de diálogos multiturno. Lo desarrolla el equipo "Team Developers" (Adnan Burak Özbay, Enes Erman, Mohammed Firas e İlayda Şenel) como proyecto del curso NLP Project 2, y se publica bajo licencia MIT. El problema que aborda es concreto: cuando un usuario cambia de opinión a mitad de conversación ("Actually, make it 7 pm at the same place"), el sistema necesita identificar qué palabras señalan el cambio, qué valor nuevo se propone y a qué turno anterior se hace referencia.

El modelo parte de `microsoft/deberta-v3-base` (184M parámetros) y añade dos cabezas lineales de clasificación de tokens, una para la capa VALUE y otra para la capa CUE, sobre un esquema BIO de ocho etiquetas (18 tags en total). Se ha ajustado fino sobre 857 turnos de usuario etiquetados manualmente y se presentan tres semillas promediadas a nivel de softmax.

Su relevancia es metodológica más que de escala: el autor documenta un protocolo de validación cruzada agrupada de 5 folds con reglas fijadas antes de abrir el conjunto de test, y publica resultados con intervalos de bootstrap, incluyendo la advertencia de que la mejora frente a un CRF no es estadísticamente significativa. Es un artefacto de investigación pequeño y reproducible, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) con dos cabezas lineales de token classification (VALUE y CUE) |
| Parametros totales | 184M (modelo base; el repo incluye varios checkpoints) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el checkpoint `tail60` lee además las últimas 60 palabras de turnos anteriores; la longitud máxima se almacena en el campo `meta` de cada checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict` en media precisión, pensados para cargarse en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (diccionario con `state_dict` y `meta`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v3-base al que se le añaden dos cabezas lineales independientes de etiquetado de tokens, una por cada capa del esquema: VALUE (NEW_VALUE, REFERENCE, OLD_VALUE, KEPT_VALUE) y CUE (UPDATE_CUE, CANCEL_CUE, KEEP_CUE, RESTORE_CUE). El esquema BIO completo produce 18 etiquetas. El ajuste fino se realizó sobre 857 turnos de usuario etiquetados manualmente, procedentes del dataset Google SGD (diálogo orientado a tareas en inglés bien escrito).

El entrenamiento se repite con tres semillas (20261029, 20261030 y 20261031) cuyas salidas se promedian a nivel de softmax para formar un ensemble. La selección del modelo se hizo mediante validación cruzada agrupada de 5 folds con reglas comprometidas antes de ejecutar, y el conjunto de test se abrió una sola vez. Existen dos variantes: `checkpoints/no/`, que lee únicamente el turno nuevo del usuario (modelo seleccionado), y `checkpoints/tail60/`, una comparación pre-registrada que además lee las últimas 60 palabras de los turnos anteriores.

## Capacidades

- Etiquetado a nivel de token de turnos de usuario en diálogo multiturno, con roles de revisión.
- Detección de señales de cambio (`UPDATE_CUE`, `CANCEL_CUE`, `KEEP_CUE`, `RESTORE_CUE`).
- Identificación del valor nuevo (`NEW_VALUE`), de referencias a turnos previos (`REFERENCE`), del valor antiguo (`OLD_VALUE`) y del valor mantenido (`KEPT_VALUE`).
- Salida en formato de spans estrictos (exact-span), adecuada para consumo por un sistema de diálogo posterior.
- Variante con contexto histórico limitado (`tail60`) que incorpora las últimas 60 palabras de turnos anteriores.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Actualización de slots en asistentes de reservas: el modelo marca `NEW_VALUE` y `UPDATE_CUE` en turnos como "Actually, make it 7 pm", lo que permite al gestor de diálogo sobrescribir el slot de hora sin reinterpretar toda la conversación.
- Resolución de referencias anafóricas en diálogo: la etiqueta `REFERENCE` señala expresiones como "the same place", que el sistema puede enlazar con la entidad mencionada en un turno anterior.
- Detección de cancelaciones y restauraciones: `CANCEL_CUE` y `RESTORE_CUE` permiten distinguir entre un usuario que anula una petición y uno que la recupera, evitando transiciones de estado erróneas.
- Análisis de conversaciones para control de calidad: procesar transcripciones de atención al cliente para medir con qué frecuencia los usuarios revisan sus peticiones y en qué puntos del flujo ocurre.
- Preprocesado para modelos generativos en pipelines RAG conversacionales: usar los spans detectados para reescribir la consulta del usuario antes de recuperar documentos, incorporando el valor revisado en lugar del original.
- Investigación en lingüística computacional: el esquema de ocho etiquetas y el dataset asociado sirven como banco de pruebas reproducible para estudiar la revisión en diálogo, con métricas de span estricto y protocolo pre-registrado.
- Extracción de estructura en logs de soporte técnico: etiquetar turnos de usuario para construir un grafo de cambios de estado de una incidencia a lo largo de una conversación.

## Benchmarks y rendimiento

Resultados sobre el test bloqueado (363 turnos, micro-F1 de span exacto estricto):

| Sistema | VALUE F1 | CUE F1 | S (media) |
|---|---|---|---|
| Modelo de decisión zero-shot Laya (alternativa a JEV) | 0.031 | 0.017 | 0.024 |
| Reglas superficiales | 0.462 | 0.364 | 0.413 |
| Copia de léxico | 0.526 | 0.414 | 0.470 |
| BERT-base (primera versión de los datos) | 0.780 | 0.644 | 0.712 |
| CRF | 0.758 | 0.712 | 0.735 |
| DeBERTa-v3 ensemble, sin historial (modelo seleccionado) | 0.845 | 0.691 | 0.768 |
| DeBERTa-v3 ensemble, últimas 60 palabras de historial (comparación) | 0.870 | 0.757 | 0.813 |

La ganancia frente al CRF es de +0.033 en S, con intervalo de bootstrap al 95% de [−0.017, +0.079], es decir, el score más alto pero no una victoria significativa. El F1 de CUE se calcula sobre solo 31 spans de test. El historial no ayudó en validación cruzada (−0.005) pero sí en el test bloqueado (+0.045, [+0.016, +0.078]); el modelo seleccionado sigue siendo el fijado antes del test. Un etiquetador que no etiqueta nada obtiene 87,9% de accuracy por token y 0 de F1 de span, motivo por el que la métrica empleada es span F1 estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un encoder de 184M en float32 el orden de magnitud es de menos de 1 GB de pesos, más el overhead de activaciones y del tokenizador.
- GPU recomendadas: no disponible; cualquier GPU con al menos unos pocos GB de VRAM es suficiente para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 o superior), aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el autor proporciona `app/server.py` y `scripts/d5v2_final.py` en el repositorio de GitHub, con instrucciones de instalación vía `requirements.txt` y descarga con `huggingface-cli`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OVERRIDE (este modelo) | 184M (DeBERTa-v3-base) | no disponible | Etiquetado de revisiones en diálogo | MIT | HuggingFace + GitHub + demo |
| BERT-base (primera versión de datos) | ~110M | no disponible | Misma tarea | no disponible | Referenciado en la model card, sin enlace |
| CRF | no disponible | no disponible | Misma tarea | no disponible | Referenciado en la model card, sin enlace |
| Modelo de decisión zero-shot Laya | no disponible | no disponible | Misma tarea | no disponible | Referenciado en la model card, sin enlace |

No se dispone de datos de parámetros, contexto ni licencia de las alternativas comparadas más allá de los resultados de F1 recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- Entrenado únicamente con diálogo orientado a tareas en inglés bien escrito (Google SGD); el rendimiento fuera de ese dominio no está caracterizado.
- Falla a menudo con formulaciones indirectas que no incluyen una palabra de señal explícita, y con palabras de señal mal escritas.
- Las cinco etiquetas raras tienen muy pocos ejemplos para poder medirse; su comportamiento no está validado.
- El F1 de CUE se apoya en solo 31 spans de test, por lo que la métrica tiene alta varianza.
- La mejora frente a un CRF no es estadísticamente significativa según el intervalo de bootstrap publicado.
- El modelo seleccionado no usa historial, aunque la variante con historial obtiene mejores resultados en el test bloqueado; esto refleja una decisión pre-registrada, no una optimización sobre test.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de etiquetados espurios en texto fuera de distribución.
- Sesgos conocidos: no documentados por el autor.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base DeBERTa-v3-base conserva su propia licencia, que conviene verificar antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los pesos se distribuyen como `state_dict` en media precisión que debe cargarse en float32, lo que exige usar el código del repositorio en lugar de un pipeline estándar de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enes123erman/override-checkpoints
- Repositorio de código, protocolos y resultados: https://github.com/eneserman/OVERRIDE
- Demo en vivo: https://override-demo.vercel.app
- Dataset: https://huggingface.co/datasets/enes123erman/override-dataset
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
