# apus-ailab/APUS-Reflex2

## Resumen

APUS-Reflex2 (publicado como APUS Reflex2 Decision V1) es un modelo de decisión textual desarrollado por apus-ailab. Su función no es la generación libre de texto, sino el ranking y la selección de opciones suministradas por el usuario: dado un estado (por ejemplo, el texto de una solicitud) y una o varias preguntas con opciones predefinidas, el modelo devuelve la opción seleccionada, una probabilidad para cada opción y metadatos de calibración.

El modelo se distribuye como snapshot de pesos en formato safetensors, con 26.085.330.160 parámetros totales (unos 26.000 millones) y un repositorio de 52,2 GB. La arquitectura declarada en los tags es `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento.

La relevancia de este lanzamiento está en su enfoque: en lugar de competir en generación generalista, se posiciona como un motor de decisión estructurada para enrutamiento, clasificación y puntuación ordinal dentro de sistemas de agentes. La inferencia no se realiza con runtimes convencionales, sino con el runtime APUS Reflex, distribuido por separado, que expone una API HTTP compatible con el endpoint `/v1/systemone`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio; detalle interno no disponible) |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `qwen3_5`, que apunta a una base de la familia Qwen 3.5. No se especifican el número de capas, la dimensión oculta, el tipo de atención ni si se trata de un transformer denso o de una variante con mezcla de expertos. Tampoco se indica la longitud de contexto soportada por los pesos.

Respecto al entrenamiento, la model card no publica el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo se presenta como un "decision model" especializado en ranking de opciones, pero no se documenta el procedimiento de ajuste que lo lleva desde la base Qwen hasta esta tarea. La innovación técnica destacable, según la documentación, es el contrato de inferencia: el runtime APUS Reflex gestiona el scoring y expone una API con formato APUS/1.0, que devuelve selección, probabilidades por opción y metadatos de calibración.

## Capacidades

- Decisión estructurada sobre opciones suministradas: selecciona una opción entre las proporcionadas y devuelve su probabilidad junto con metadatos de calibración.
- Preguntas de elección múltiple: hasta 255 opciones por pregunta.
- Preguntas binarias: opciones con los identificadores `true` y `false`.
- Preguntas ordinales: entre 2 y 10 niveles de puntuación.
- Múltiples preguntas por petición: hasta 64 preguntas en una sola solicitud.
- Enrutamiento y clasificación: pensado para decidir, por ejemplo, qué equipo debe atender una solicitud.
- Integración vía API HTTP: el runtime APUS Reflex expone el endpoint `/v1/systemone` y el listado de modelos vía `GET /v1/models`.
- Autenticación opcional mediante Bearer token en despliegues configurados con autenticación.
- No soporta chat libre ni entrada de imágenes en esta versión.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la solicitud y una pregunta de elección múltiple con los equipos disponibles (por ejemplo, facturación o envíos) y devuelve el equipo asignado con su probabilidad, lo que permite automatizar el triaje con umbrales de confianza.
- Clasificación de incidencias con calibración: al devolver probabilidades por opción y metadatos de calibración, permite derivar a revisión humana los casos con baja confianza en lugar de forzar una decisión.
- Puntuación ordinal de riesgo: con preguntas ordinales de 2 a 10 niveles, se puede puntuar la severidad de una incidencia o la urgencia de una solicitud dentro de un pipeline de priorización.
- Decisión binaria en flujos de aprobación: usando las opciones `true` y `false`, el modelo puede resolver comprobaciones como la elegibilidad de una devolución o la necesidad de escalado.
- Orquestación de agentes multi-paso: con hasta 64 preguntas por petición, un agente puede consultar en una sola llamada varias decisiones (ruta, prioridad, acción siguiente) y recibir todas las selecciones con sus probabilidades.
- Selección entre candidatos generados: dado un conjunto de respuestas o acciones propuestas por otro modelo, APUS-Reflex2 puede rankearlas y elegir la más adecuada según el estado de la conversación.
- Moderación y etiquetado consistente: la salida estructurada con opciones cerradas facilita integrar las decisiones en bases de datos y sistemas de auditoría, sin necesidad de parsear texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 26.085 millones de parámetros en safetensors, los pesos en precisión de 16 bits ocuparían aproximadamente 52 GB, lo que exige GPUs de 80 GB (A100, H100) para cargar el modelo sin cuantizar; en FP32 serían unos 104 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue sin cuantizar requiere A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No con los pesos completos en 16 bits. No se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir el requisito.
- Opciones de despliegue: el modelo no se sirve con vLLM, llama.cpp, Ollama o TGI según la documentación; requiere el runtime APUS Reflex, distribuido por separado, que debe coincidir con el manifiesto del modelo y arrancarse con el ID `apus-reflex-decision-v1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (motores de decisión estructurada con API de ranking de opciones), ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo solo sirve decisiones estructuradas sobre opciones suministradas; el chat libre y la entrada de imágenes quedan fuera de esta versión.
- Límites del contrato de la API: máximo de 64 preguntas por petición, 255 opciones por pregunta de elección múltiple y entre 2 y 10 niveles en preguntas ordinales.
- La inferencia depende del runtime APUS Reflex, distribuido por separado; sin él, el snapshot de pesos no es utilizable de forma directa con runtimes estándar.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de idiomas; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar `LICENSE`, `THIRD_PARTY_LICENSE.txt` y `NOTICE` por posibles atribuciones de terceros derivadas de la base Qwen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay benchmarks publicados: la validación en producción debe hacerse con evaluación propia antes de adoptarlo.
- No se especifican requisitos de cuantización ni opciones de despliegue ligeras, lo que limita su uso en infraestructura modesta.

## Enlaces

- Hugging Face: https://huggingface.co/apus-ailab/APUS-Reflex2
- Runtime APUS Reflex: no disponible (distribuido por separado según la model card)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
