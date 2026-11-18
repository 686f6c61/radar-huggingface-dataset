# ayozhee/Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF

## Resumen

Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF es una cuantización GGUF experimental de tipo híbrido construida por el usuario ayozhee a partir de dos linajes: los pesos cuantizados GSQ-RCO IQ2_S-MTP de ISTA-DASLab y los pesos BF16 "abliterated" (sin comportamiento de rechazo) de orcarouter. El resultado es un modelo de 27.320.697.856 parámetros (27,3B) en formato GGUF de precisión mixta, pensado para inferencia local en GPUs de gama media, y probado explícitamente en una RTX 3060 de 12 GB.

La relevancia del modelo no está en una arquitectura nueva, sino en el método de construcción: sustitución selectiva de 131 matrices de pesos sobre un total de 866 tensores, preservando byte a byte los 735 restantes, el tokenizador y los metadatos del GSQ original. Incluye decodificación especulativa mediante MTP (multi-token prediction) y una asignación de tipos IQ2_S heredada del mapa de GSQ con su imatrix oficial.

Es un artefacto de primera publicación de su autor, con licencia Apache 2.0 pero con advertencias claras sobre su carácter experimental. Los datos de rendimiento publicados son mediciones locales sobre subconjuntos reducidos de benchmarks, no resultados de evaluaciones completas, por lo que deben interpretarse como referencias de uso y no como comparaciones canónicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8, con 48 proyecciones de salida de atención lineal y MTP (multi-token prediction) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens configurados en las pruebas cortas; 66.560 configurados en la prueba de conversación larga |
| Tipos de cuantización | GGUF de precisión mixta según el mapa de asignación IQ2_S de GSQ; variantes IQ2_S-MTP (9,61 GB / 8,95 GiB) e IQ3_S-MTP (12,12 GB / 11,29 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con metadatos y tokenizador heredados de GSQ) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero: es una cuantización híbrida por sustitución selectiva de tensores. Se parte del checkpoint GSQ-RCO IQ2_S-MTP de ISTA-DASLab y se reemplazan 131 matrices por pesos leídos directamente de los SafeTensors BF16 de orcarouter/Qwen3.8-27B-Uncensored. Los 735 tensores restantes, los metadatos de runtime y el tokenizador se conservan sin modificar del GSQ original. No hay promediado de pesos entre ambos linajes. Las matrices sustituidas se cuantizaron desde BF16 con los kernels `ggml` de llama.cpp, aplicando el mapa de tipos de GSQ y su imatrix oficial (estadísticas de activación del modelo Qwen base). Las 48 proyecciones de salida de atención lineal recibieron además el reordenamiento de columnas exigido por el conversor.

La innovación técnica principal es la inclusión de MTP para decodificación especulativa, con tasas de aceptación medidas del 68,1 % en prompts cortos y del 55,93 % en una conversación real de 30,6K tokens. El componente "abliterated" procede de OrcaRouter y consiste en una modificación de pesos orientada a reducir el comportamiento de rechazo; el autor no documenta el proceso de abliteración en sí, solo su procedencia. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de historial largo (probado con 30,6K tokens de contexto inicial).
- Razonamiento con presupuesto configurable: el autor reporta que un presupuesto de razonamiento de 1.024 tokens es suficiente para la mayoría de tareas, y que 2.048 es un punto de partida útil para tareas con formato estricto.
- Generación de código: supera pruebas de HumanEval y continuó una tarea real de desarrollo web con 15/15 comprobaciones funcionales tras el segundo turno.
- Matemáticas: resolución de problemas tipo GSM8K.
- Seguimiento de instrucciones con restricciones de formato (IFEval).
- Tool calling / function calling: la prueba de conversación real incluyó llamadas a herramientas con un límite de seis generaciones por turno.
- Decodificación especulativa vía MTP, con aceptación medida entre el 55,93 % y el 68,1 %.
- Comportamiento reducido de rechazo por herencia del linaje abliterated de OrcaRouter.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente de desarrollo web local: el modelo mantuvo una conversación de 30,6K tokens de historial sobre un sitio web y completó dos peticiones nuevas con 15/15 comprobaciones funcionales, lo que lo hace adecuado para iterar sobre bases de código existentes en un equipo con una sola GPU de 12 GB.
- Automatización de tareas de codificación con tool calling: al soportar llamadas a funciones y un límite configurable de generaciones por turno, puede integrarse en pipelines que invocan herramientas externas (ejecución de tests, lectura de ficheros) sin salir de la ventana de contexto configurada.
- Evaluación de modelos sin censura en investigación: el linaje abliterated permite estudiar el comportamiento del modelo ante prompts que normalmente disparan rechazos, útil para análisis de seguridad y alineación en entornos controlados.
- Inferencia en hardware de gama media: con 9,61 GB en IQ2_S-MTP cabe en una RTX 3060 de 12 GB con offload completo de GPU, alcanzando 35,65 tokens/s de decodificación en prompts cortos, lo que habilita prototipado local sin depender de la nube.
- Procesamiento de documentos largos: la ventana configurable hasta 66.560 tokens permite resumir o extraer información de conversaciones y documentos extensos, aunque con degradación esperable de velocidad (29,45 tokens/s medidos a 30,6K tokens).
- Generación de código asistida con verificación: la combinación de HumanEval resuelto y decodificación especulativa MTP permite usarlo como generador en bucles de test-fix donde la latencia por token importa.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su incorporación en productos comerciales, sujeta a las advertencias sobre su carácter experimental.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los primeros 30 ítems de cada suite de BenchKit, una generación por ítem, temperatura 0, razonamiento `medium`, presupuesto de razonamiento 1.024 y límite total de generación 4.096, con ngram + MTP:

| Test | Este híbrido | GSQ IQ2_S-MTP |
|---|---:|---:|
| IFEval (seguimiento de instrucciones) | 27/30 | 29/30 |
| GSM8K (matemáticas) | 30/30 | 29/30 |
| HumanEval (extracción normalizada) | 30/30 | 30/30 |
| HumanEval (puntuación bruta) | 25/30 | 21/30 |

Rendimiento medido en RTX 3060 12 GB:

| Medición | Prompts cortos: híbrido | Prompts cortos: GSQ | Conversación real: híbrido |
|---|---:|---:|---:|
| Decodificación | 35,65 tok/s | 34,79 tok/s | 29,45 tok/s |
| Prefill | 179,6 tok/s | 177,9 tok/s | 350,6 tok/s |
| Aceptación de decodificación especulativa | 68,1 % | 69,1 % | 55,93 % |
| Prompt/historial inicial | 64–400 tokens | 64–400 tokens | 30.611 tokens |
| Límite de contexto configurado | 16.384 | 16.384 | 66.560 |

En la conversación real se generaron 9.564 tokens con offload completo de GPU, reutilización de prefijo y ngram-mod + MTP; el pico de VRAM fue de 11.536 MiB con 578 MiB mínimos libres. Las cifras de prompts cortos cubren 90 peticiones por modelo. El autor advierte que la diferencia de velocidad entre ambos modelos en el cribado está dentro de la incertidumbre de una ejecución no repetida. No se han publicado resultados de benchmarks completos ni comparaciones con modelos de referencia de la industria.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,61 GB para IQ2_S-MTP y 12,12 GB para IQ3_S-MTP, según los tamaños de fichero publicados.
- GPU recomendadas: RTX 3060 12 GB (probada por el autor con offload completo), y por capacidad de VRAM, RTX 4070 Ti / 4080 / 4090, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en IQ2_S-MTP en tarjetas de 12 GB; IQ3_S-MTP requiere al menos 12 GB y deja poco margen para el contexto (el pico medido con IQ2_S fue de 11.536 MiB).
- Opciones de despliegue: llama.cpp / `llama-server` (usado en las pruebas), y por compatibilidad GGUF, también Ollama y otros runners basados en llama.cpp. Compatible con endpoints según los tags del repositorio.
- Latencia y throughput: 35,65 tok/s de decodificación y 179,6 tok/s de prefill en prompts cortos; 29,45 tok/s de decodificación y 350,6 tok/s de prefill con 30,6K tokens de contexto, en RTX 3060 12 GB.
- Contexto: 16.384 tokens configurados en las pruebas cortas; 66.560 en la prueba larga, con impacto directo en el consumo de VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-GSQ-Orca (este) | 27,3B | hasta 66.560 configurado | GGUF IQ2_S / IQ3_S con MTP | Apache 2.0 | Híbrido por sustitución selectiva, abliterated |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 27,3B | no disponible | GGUF IQ2_S-MTP | no disponible | Base cuantizada de referencia; 29/30 IFEval, 29/30 GSM8K en el cribado |
| orcarouter/Qwen3.8-27B-Uncensored | 27,3B | no disponible | BF16 SafeTensors | no disponible | Fuente de los pesos abliterated; sin datos de rendimiento publicados aquí |

No se dispone de datos de benchmarks completos ni de comparaciones con modelos de otros linajes, por lo que la comparativa se limita a los tres artefactos relacionados documentados en la información disponible.

## Limitaciones y advertencias

- Modelo experimental y primera publicación de su autor: no ha pasado por un proceso de validación amplio ni por evaluaciones completas de benchmarks.
- Los resultados de benchmarks provienen de subconjuntos de 30 ítems con evaluadores propios de BenchKit, cuyos criterios difieren de las ejecuciones publicadas estándar; no son directamente comparables con cifras oficiales.
- El comportamiento abliterated reduce los rechazos, lo que implica un mayor riesgo de generar contenido inapropiado, dañino o inexacto sin las salvaguardas habituales; no se recomienda su despliegue directo en producción orientada a usuarios finales sin filtros adicionales.
- Riesgo de alucinación no cuantificado: no se han publicado mediciones de factualidad ni de tasa de alucinación.
- En tareas de formato estricto, el autor observó fallos de IFEval causados por texto de deliberación que se filtra en la respuesta final; se mitiga subiendo el presupuesto de razonamiento a 2.048 tokens, pero no se elimina por completo.
- El contexto máximo práctico está limitado por la VRAM: con 12 GB, el pico medido a 30,6K tokens dejó solo 578 MiB libres.
- Idiomas soportados no documentados; no hay garantías sobre calidad multilingüe.
- La licencia Apache 2.0 es permisiva para uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la procedencia y condiciones de los linajes base (GSQ y OrcaRouter), cuyas licencias no se detallan en la información disponible.
- Las mediciones de rendimiento provienen de una única ejecución no repetida; el propio autor señala que las diferencias observadas están dentro de la incertidumbre.

## Enlaces

- [Hugging Face: ayozhee/Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF](https://huggingface.co/ayozhee/Qwen3.8-27B-Abliterated-GSQ-Orca-GGUF)
- [Modelo base cuantizado: ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF)
- [Modelo base abliterated: orcarouter/Qwen3.8-27B-Uncensored](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- BenchKit (commit `037ec91`): referencia citada por el autor; no se proporciona URL en la información disponible.
