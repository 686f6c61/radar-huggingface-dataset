# aoiandroid/cription-omnilingual-lm-packs

## Resumen

Cription omnilingual LM packs es un conjunto de artefactos de inferencia publicados por el desarrollador aoiandroid para la aplicación Cription, orientados al reconocimiento automático de voz (ASR) en el dispositivo. No se trata de un modelo único, sino de un paquete que combina modelos acústicos CTC exportados a ONNX en int8 con modelos de lenguaje de caracteres (6-gramas) que se emplean para decodificar con CTC prefix beam search. Los idiomas cubiertos son lao, yoruba y pastún, tres lenguas de bajos recursos en los que los sistemas ASR comerciales suelen tener un rendimiento pobre.

El paquete reutiliza el modelo Omnilingual ASR CTC 1B de Meta (facebook/omniASR-CTC-1B) como base para lao y yoruba, y un modelo W2V-BERT2 ajustado para pastún (ihanif/w2v-bert2-pashto-augmented) para este último. Para el lao, el autor reentrena únicamente la capa de salida sobre grabaciones de entrenamiento de FLEURS, manteniendo intacto el codificador. El resultado es un conjunto de pesos ONNX de aproximadamente 2,1 GB en total, pensado para ejecutarse con sherpa-onnx y ONNX Runtime en hardware de consumo, incluidos dispositivos móviles.

La relevancia de este paquete es doble: por un lado, demuestra una receta práctica para adaptar modelos ASR multilingües de gran tamaño a lenguas concretas mediante decodificación con LM de caracteres y reentrenamiento parcial; por otro, cuantifica la mejora obtenida en FLEURS test, con reducciones notables de CER respecto a la decodificación greedy del modelo base. La licencia es mixta y depende del componente, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos acusticos CTC (Omnilingual ASR CTC 1B y W2V-BERT2) exportados a ONNX; decodificacion con CTC prefix beam search (anchura 24) y LM de caracteres de 6-gramas |
| Parametros totales | 1B en el modelo base Omnilingual CTC; el modelo de pastun no especifica numero de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | int8 (pesos MatMul en int8; en pastun se excluyen filtro log-mel, proyeccion de features, adaptador y capa de salida) |
| Idiomas soportados | lao (lo), yoruba (yo), pastun (ps) |
| Licencia | mixta: CC BY-SA 4.0 (LM de caracteres), Apache-2.0 (componente lao derivado de omniASR-CTC-1B), MIT (componente pastun derivado de w2v-bert2-pashto-augmented), licencia del modelo yoruba segun el repositorio de origen |
| Formato de pesos | ONNX (model.int8.onnx), tokens.txt, binario CLM1 para los LM de caracteres |

## Arquitectura y entrenamiento

El paquete no entrena un modelo desde cero. Para lao, parte de Omnilingual ASR CTC 1B y reentrena solo la capa de salida sobre grabaciones de entrenamiento de FLEURS en lao, dejando el codificador sin cambios; el resultado se exporta a ONNX en int8 mediante sherpa-onnx. Para pastún, parte de ihanif/w2v-bert2-pashto-augmented y lo exporta a ONNX integrando el filtro log-mel dentro del grafo, de modo que la entrada es directamente la forma de onda a 16 kHz; los pesos MatMul se cuantizan a int8 excepto el filtro, la proyección de features, el adaptador y la capa de salida. Para yoruba se usa sin modificar el modelo Omnilingual CTC 1B int8 de csukuangfj2.

La decodificación combina el modelo acústico CTC con un LM de caracteres de 6-gramas en formato CLM1 (conteos de n-gramas hasheados, suavizado Witten-Bell), construido a partir de texto de Wikipedia (CC BY-SA 4.0) y transcripciones de entrenamiento de FLEURS (CC BY 4.0). Se emplea CTC prefix beam search con anchura 24 y pesos alpha/beta por idioma: lao (alpha 0,5, beta 0,5), yoruba (alpha 0,3, beta 1,0) y pastún (alpha 0,3, beta 1,0). Los pesos se eligieron sobre grabaciones de entrenamiento de FLEURS retenidas, no sobre el conjunto de test. Los identificadores de blank y especiales varían por idioma (blank 0 en lao y yoruba; blank 46 y especiales 45-48 en pastún).

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) en lao, yoruba y pastún.
- Ejecución en el dispositivo mediante ONNX Runtime y sherpa-onnx, sin dependencia de servicios en la nube.
- Decodificación con LM de caracteres de 6-gramas que corrige y regulariza las salidas del modelo acústico.
- Entrada de audio a 16 kHz; en pastún el grafo incluye el filtro log-mel, por lo que acepta directamente la forma de onda.
- Cuantización int8 que reduce el tamaño y facilita el despliegue en hardware limitado.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento; es exclusivamente un sistema ASR.

## Casos de uso

- Transcripción offline en aplicaciones móviles: el paquete está diseñado para que la app Cription descargue los ficheros y transcriba lao, yoruba o pastún sin conexión, aprovechando la cuantización int8 y el tamaño contenido de cada componente.
- Subtitulado de reuniones o entrevistas en yoruba: el LM de caracteres y la decodificación beam search reducen el CER del 21,8% greedy al 14,3%, lo que mejora la legibilidad de las transcripciones en entornos con ruido moderado.
- Digitalización de archivos orales en lao: la adaptación de la capa de salida sobre FLEURS lao rebaja el CER del 46,8% al 14,6%, lo que hace viable transcribir grabaciones etnográficas o históricas con revisión humana posterior.
- Asistentes de voz para comunidades pastunes: el modelo W2V-BERT2 adaptado y exportado a ONNX permite integrar dictado por voz en aplicaciones locales con latencia baja y sin enviar audio a terceros.
- Investigación en ASR de bajos recursos: el paquete sirve como referencia reproducible de una receta de adaptación (reentrenamiento de capa de salida, LM de caracteres, ajuste de alpha/beta sobre datos retenidos) para otras lenguas.
- Evaluación comparativa de decodificadores: permite medir el impacto de un LM de 6-gramas frente a decodificación greedy en tres lenguas tipológicamente distintas (tai-kadai, niger-congo y indoeuropea) usando FLEURS como referencia.
- Prototipado en dispositivos de gama baja: al estar en ONNX int8 y con pesos de 2,1 GB en total para los tres idiomas, se puede desplegar en equipos sin GPU dedicada para pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre FLEURS test (40 frases por idioma, métrica CER):

| Idioma | Decodificacion greedy, modelo base | Este paquete |
|---|---|---|
| Lao | 46,8% | 14,6% |
| Yoruba | 21,8% (15,6% con referencias sin tonos puntuadas sin marcas de tono) | 14,3% |
| Pastun | 16,4% (Omnilingual) | 14,7% |

Las mediciones se realizaron en un Mac con ONNX Runtime; el autor indica explícitamente que no se midieron en un iPhone. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un sistema ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ejecutarse en ONNX Runtime en CPU, el requisito principal es memoria RAM. El repositorio completo ocupa 2,1 GB, aunque cada idioma se descarga por separado.
- GPU recomendadas: no se especifican; el diseño está orientado a ejecución en CPU y dispositivos móviles. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para el modelo int8 de 1B, aunque no se aportan cifras concretas.
- Opciones de despliegue: sherpa-onnx y ONNX Runtime son las vías previstas; el formato ONNX permite integración en otras pilas compatibles.
- Latencia y throughput: no disponibles; las pruebas se hicieron en un Mac con ONNX Runtime sin cifras de velocidad publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | CER FLEURS (referencia) |
|---|---|---|---|---|---|---|
| Cription omnilingual LM packs (este paquete) | 1B (base) | lo, yo, ps | no aplica | mixta | ONNX int8 | lao 14,6%, yoruba 14,3%, pastun 14,7% |
| facebook/omniASR-CTC-1B | 1B | multilingue (1600 lenguas segun el export de sherpa-onnx) | no aplica | Apache-2.0 | safetensors / ONNX | lao 46,8% greedy, pastun 16,4% |
| ihanif/w2v-bert2-pashto-augmented | no disponible | ps | no aplica | MIT | no disponible | no disponible |
| csukuangfj2/sherpa-onnx-omnilingual-asr-1600-languages-1B-ctc-v2-int8 | 1B | multilingue | no aplica | segun repositorio de origen | ONNX int8 | yoruba 21,8% greedy |

La comparativa se limita a los modelos de origen citados por el autor; no se dispone de datos de otros sistemas ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia mixta: cada componente tiene condiciones distintas (CC BY-SA 4.0, Apache-2.0, MIT y la licencia del modelo yoruba de origen). Es obligatorio revisar cada una antes de un uso comercial, y el LM de caracteres bajo CC BY-SA 4.0 impone obligaciones de compartir igual.
- El paquete solo cubre tres idiomas; no es un modelo multilingüe general pese al nombre "omnilingual".
- Los resultados se midieron sobre 40 frases por idioma en FLEURS test, una muestra pequeña; la variabilidad estadística puede ser alta.
- Los pesos alpha y beta se ajustaron sobre datos de entrenamiento de FLEURS retenidos, no sobre test, lo que reduce el riesgo de sobreajuste pero no lo elimina.
- No se midió el rendimiento en iPhone ni en otros dispositivos móviles; el autor solo reporta pruebas en un Mac con ONNX Runtime.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en FLEURS o vocabulario fuera de dominio; el CER del 14-15% implica errores frecuentes a nivel de carácter.
- El modelo de pastún no especifica número de parámetros ni detalles completos de entrenamiento.
- La información de benchmarks es escasa y no hay comparaciones con sistemas ASR comerciales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aoiandroid/cription-omnilingual-lm-packs
- Modelo base Omnilingual ASR CTC 1B: https://huggingface.co/facebook/omniASR-CTC-1B
- Modelo pastún de origen: https://huggingface.co/ihanif/w2v-bert2-pashto-augmented
- Export sherpa-onnx Omnilingual 1B int8: https://huggingface.co/csukuangfj2/sherpa-onnx-omnilingual-asr-1600-languages-1B-ctc-v2-int8-2026-02-05
- Resultado de búsqueda web sin relación con el modelo (Quora sobre frameworks Python): https://www.quora.com/What-is-the-best-python-web-framework-to-learn-in-2023
