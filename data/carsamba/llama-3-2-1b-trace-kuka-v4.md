# Carsamba/Llama-3.2-1B-Trace-KUKA-v4

## Resumen

Llama-3.2-1B-Trace-KUKA-v4 es un checkpoint de adaptador publicado por el usuario Carsamba dentro del ecosistema OpenTSLM. No es un modelo de lenguaje completo: contiene únicamente el estado del codificador de series temporales, el proyector y un adaptador LoRA de rango 16 que se montan sobre el backbone meta-llama/Llama-3.2-1B. El repositorio no incluye el backbone, el tokenizador, el dataset de origen ni un modelo Transformers autónomo, por lo que no puede cargarse con `pipeline()` de forma directa.

El adaptador da soporte a Trace, un banco de trabajo de observabilidad robótica en modo solo reproducción para investigar eventos de par externo de las articulaciones grabados en un robot KUKA LWR4+. Su contrato de entrada son siete canales canónicos de par (`joint_1` a `joint_7`), exactamente 1.024 muestras contiguas por canal a 1 kHz, normalizadas con estadísticas robustas calculadas solo sobre entrenamiento; la salida sigue el contrato `answer_then_evidence`, con una respuesta JSON completa de siete campos seguida de evidencia en lenguaje natural.

Su relevancia es acotada y de tipo metodológico: sirve para reproducir un reto de investigación y para comparar un enfoque de modelo de lenguaje sobre series temporales frente a una línea base determinista de características de señal, que resulta más fuerte en clasificación fija (macro-F1 de semántica 0,9880 frente a 0,8845). No está pensado como detector de colisiones en vivo ni como controlador de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OpenTSLM SoftPrompt con LoRA habilitado sobre Llama 3.2 1B (codificador de series temporales + proyector + adaptador LoRA de rango 16) |
| Parámetros totales | No disponible para el adaptador (archivo `adapter.pt`, repositorio de 0,1 GB). El backbone es meta-llama/Llama-3.2-1B, no incluido en este repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador. El contrato de entrada fija ventanas de 1.024 muestras por canal a 1 kHz (1,024 s). El backbone Llama 3.2 1B declara 128.000 tokens de contexto |
| Tipos de cuantización | No disponible. El artefacto se distribuye como tensores PyTorch; el backbone admite las cuantizaciones propias de Llama 3.2 |
| Idiomas soportados | No disponible (los metadatos del repositorio no declaran idiomas) |
| Licencia | Llama 3.2 Community License (el warm start OpenTSLM se publica bajo MIT; la telemetría KUKA de origen es CC BY 4.0) |
| Formato de pesos | `adapter.pt`: diccionario de tensores PyTorch inspeccionable con `weights_only=True`. Claves: `encoder_state`, `projector_state`, `lora_enabled`, `lora_state`. No hay safetensors ni GGUF |

Datos de identidad del artefacto: SHA-256 del adaptador `8ff63b84ae5b64758f66b3e0527f4f225a04bb2b6b39193c806f58d94cec9f23`; revisión del modelo base `4e20de362430cd3b72f300e6b0f18e50e7166e08`; SHA-256 de los pesos base `68a2e4be76fa709455a60272fba8e512c02d81c46e6c671cc9449e374fd6809a`; warm start `OpenTSLM/llama-3.2-1b-har-sp` en la revisión `1dbeb1c1013deaca6a36bc3c92016a93a7c588a9`; revisión del código OpenTSLM `2968f4b891baab4307f7e9d0043e87677b593a30`.

## Arquitectura y entrenamiento

La arquitectura es OpenTSLM SoftPrompt con LoRA habilitado. Sobre el backbone Llama 3.2 1B congelado se añaden tres componentes entrenables: un codificador de series temporales, un proyector que alinea la representación de la señal con el espacio de embeddings del modelo de lenguaje, y un adaptador LoRA de rango 16. El modelo parte de un warm start desde `OpenTSLM/llama-3.2-1b-har-sp`, un checkpoint previo de OpenTSLM orientado a datos de actividad humana y reconocimiento de actividad.

El entrenamiento se realizó con normalización robusta calculada exclusivamente sobre el conjunto de entrenamiento, y las ventanas se interpretan como intervalos semiabiertos `[start, end)` de 1,024 segundos. La model card indica que no se conservó la configuración de entrenamiento resuelta en la ejecución que produjo estos bytes promocionados; `opentslm_sp.yaml` es la configuración candidata más cercana del repositorio y no se reclama como exacta. Tampoco se publica el número de tokens de entrenamiento ni la composición del dataset, más allá de que la telemetría proviene de una única plataforma KUKA en experimentos controlados.

## Capacidades

- Generación de texto condicionada por series temporales: produce una respuesta JSON de siete campos seguida de evidencia en lenguaje natural (contrato `answer_then_evidence`).
- Clasificación de semántica de interacción sobre ventanas de par articular (macro-F1 de 0,8845 en la comparación bloqueada).
- Atribución de articulación: identificación de la articulación más afectada (exactitud de 0,7528) y del conjunto de articulaciones afectadas (F1 de 0,8946).
- Estimación temporal: predicción del instante de inicio condicional, con un MAE de 68,51 ms.
- Resumen estructurado: emisión de un resumen completo y utilizable en el 77,93 % de las ventanas evaluadas.
- Integración en un runtime específico: requiere el runtime de inferencia de Trace y la revisión fijada de OpenTSLM para construir el modelo y cargar los estados.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles.
- Visión o audio: no disponibles (la modalidad adicional es series temporales de par articular).
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Investigación retrospectiva de eventos de par en robots KUKA LWR4+: dado un registro de siete canales de par a 1 kHz, el adaptador genera un resumen estructurado con la semántica de interacción, las articulaciones afectadas y el instante de inicio estimado, lo que permite priorizar qué ventanas revisar manualmente.
- Reproducibilidad de un reto de investigación: el repositorio incluye configuración de runtime, normalización solo de entrenamiento, recibo de evaluación y recibo de publicación, de modo que un tercero puede replicar la comparación bloqueada sobre las 512 ventanas y 67 grupos de grabación retenidos.
- Auditoría de telemetría industrial archivada: el contrato de ventana semiabierta de 1,024 s y la normalización robusta hacen que el modelo sea adecuado para procesar lotes de grabaciones históricas ya almacenadas, no para flujos en tiempo real.
- Línea base de comparación para modelos de series temporales: al publicarse junto a una línea base determinista de características de señal con macro-F1 de 0,9880, sirve como referencia metodológica para medir cuánto aporta realmente un enfoque de modelo de lenguaje sobre la señal cruda.
- Generación de informes estructurados consumibles por herramientas: la salida JSON de siete campos puede alimentar paneles o bases de datos de incidentes, siempre que se registre también la tasa de respuestas no utilizables (113 de 512 ventanas en la evaluación publicada).
- Estudio de transferencia entre dominios de series temporales: al partir de un warm start entrenado con datos de actividad humana, permite analizar cuánto conocimiento temporal se transfiere a telemetría de robótica industrial.
- Docencia y formación en evaluación de modelos: el caso ilustra bien la diferencia entre una métrica de clasificación fuerte y una tarea de atribución y localización temporal mucho más frágil.

## Benchmarks y rendimiento

Comparación bloqueada sobre 512 ventanas procedentes de 67 grupos de grabación retenidos.

| Métrica | Resultado V4 |
|---|---:|
| Macro-F1 de semántica de interacción | 0,8845 |
| Exactitud de articulación más afectada | 0,7528 |
| F1 del conjunto de articulaciones afectadas (recibo de publicación) | 0,8946 |
| MAE de inicio condicional | 68,51 ms |
| Resumen completo utilizable | 0,7793 |

| Referencia | Macro-F1 de semántica de interacción |
|---|---:|
| Línea base determinista de características de señal | 0,9880 |
| Adaptador V4 (este modelo) | 0,8845 |

El adaptador V4 no emitió ninguna respuesta estructurada completa utilizable en 113 de las 512 ventanas, en su mayoría ventanas de movimiento libre. El archivo de test ya ha sido inspeccionado y no debe tratarse como intacto para ajustes futuros.

## Requisitos de hardware

- VRAM del adaptador: el repositorio ocupa 0,1 GB, por lo que el adaptador en sí es marginal en memoria.
- VRAM del backbone: no publicada en la información disponible. Como referencia de orden de magnitud, un backbone de 1B requiere aproximadamente 2-3 GB en fp16, en torno a 1-1,5 GB en int8 y menos de 1 GB en 4 bits; son estimaciones, no datos confirmados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el conjunto adaptador más backbone de 1B es desplegable en GPU de consumo tipo RTX 3060, RTX 4060 o superiores, siempre que se disponga de acceso autorizado al backbone.
- Despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI de forma estándar, porque el artefacto no es un modelo Transformers autónomo. El despliegue previsto es el runtime de inferencia de Trace junto con la revisión fijada de OpenTSLM, cargando `adapter.pt` en PyTorch.
- Requisito de acceso: el backbone Llama 3.2 1B es un modelo con acceso restringido, por lo que cada usuario debe obtener su propia autorización y aceptar sus términos.
- Verificación previa: conviene validar el SHA-256 del adaptador antes de cargarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| Carsamba/Llama-3.2-1B-Trace-KUKA-v4 | Adaptador OpenTSLM SoftPrompt + LoRA sobre Llama 3.2 1B | No disponible (adaptador); backbone de 1B | No disponible; ventanas de 1.024 muestras a 1 kHz | Macro-F1 0,8845; exactitud de articulación 0,7528; F1 de conjunto 0,8946; MAE 68,51 ms | Llama 3.2 Community License |
| OpenTSLM/llama-3.2-1b-har-sp | Checkpoint OpenTSLM de warm start | No disponible (backbone de 1B) | No disponible | No disponible | MIT |
| Línea base determinista de características de señal | Modelo determinista sobre características de la señal | No aplica | No aplica | Macro-F1 0,9880 | No disponible |

No se dispone de datos publicados que permitan comparar este adaptador con alternativas equivalentes de otros autores en la misma tarea de telemetría de par articular. Cualquier comparación con modelos de lenguaje generalistas de 1B no sería metodológicamente válida, ya que este artefacto no acepta texto libre como entrada principal.

## Limitaciones y advertencias

- No es un detector de colisiones en vivo, ni un controlador de seguridad, ni un sistema de diagnóstico causal verificado.
- La salida generada es una predicción, no una medición determinista ni un diagnóstico físico verificado.
- El modelo no emitió respuesta estructurada completa utilizable en 113 de 512 ventanas evaluadas, en su mayoría de movimiento libre: la fiabilidad del esquema de salida es una limitación reconocida.
- La precisión temporal fina es limitada: el MAE de inicio condicional es de 68,51 ms.
- Los objetivos de atribución de articulación e intervalos de evidencia derivan de características de señal, no de anotaciones físicas directas.
- Los datos cubren una única plataforma KUKA LWR4+ y experimentos controlados; no es un modelo validado entre robots distintos.
- La clase de evento está confundida por el implemento de interacción, lo que puede introducir atajos espurios en la clasificación.
- El archivo de test ya ha sido inspeccionado, por lo que no debe considerarse intacto para futuros ajustes ni para afirmar generalización limpia.
- La configuración exacta de entrenamiento no se conservó; solo se ofrece una configuración candidata, lo que dificulta la reproducción bit a bit del entrenamiento.
- La licencia Llama 3.2 Community License impone condiciones al uso comercial y obliga a aceptar los términos del backbone, cuyo acceso está restringido.
- Este repositorio no incluye el dataset de telemetría KUKA ni los bytes originales, de modo que la reproducibilidad completa depende de fuentes externas.
- La normalización robusta es solo de entrenamiento; aplicarla de forma distinta en producción alteraría las predicciones.
- No se han documentado sesgos específicos ni evaluación multilingüe en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Carsamba/Llama-3.2-1B-Trace-KUKA-v4
- Modelo base (acceso restringido): https://huggingface.co/meta-llama/Llama-3.2-1B
- Warm start OpenTSLM referenciado en la model card: https://huggingface.co/OpenTSLM/llama-3.2-1b-har-sp
- Repositorio de Trace: https://github.com/ukafkasyali/ysamet
- Runtime de inferencia: https://github.com/ukafkasyali/ysamet/tree/main/inference
- Comparación auditada con predicciones, objetivos, sumas de verificación, incertidumbre y comando de reproducción: https://github.com/ukafkasyali/ysamet/blob/main/docs/submission/evaluation/report/comparison.md
- Cita de OpenTSLM: Langer, Patrick y otros, 2025, doi 10.13140/RG.2.2.14827.60963 — https://doi.org/10.13140/RG.2.2.14827.60963
- La búsqueda web realizada no devolvió resultados relevantes: únicamente servicios de consulta WHOIS sin relación con el modelo.
