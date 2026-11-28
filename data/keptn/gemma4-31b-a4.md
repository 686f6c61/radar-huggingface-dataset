# keptn/gemma4-31b-a4

## Resumen

Gemma 4 31B-it · a4 es una cuantización de 4 bits del modelo multimodal Gemma 4 31B-it de Google, publicada por el usuario keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4. Empaqueta los pesos del modelo base (texto, imagen y vídeo) en un único fichero de 19,95 GiB en formato propietario `.rad`, lo que permite ejecutar un modelo de 31B de parámetros en tarjetas de 32 GB como la Radeon AI PRO R9700, en configuraciones de una, dos o cuatro GPUs.

El modelo conserva la ventana de contexto de 262.144 tokens del original e incorpora la cabeza asistente de Google (Gemma 4 assistant head) para decodificación especulativa con 3 tokens de borrador, lo que acelera la generación sin sacrificar fidelidad. La cuantización combina pesos int4 con punto cero y escalas f16 por cada 128 pesos (GPTQ), activaciones int8 y `lm_head` en int8, con una copia f16 de las capas int4 durante la decodificación.

Es relevante porque demuestra que un modelo multimodal de 31B puede desplegarse en hardware AMD de consumo profesional con una degradación de calidad medida y acotada (KL medio de 0,0251 frente al bf16 original). No obstante, el repositorio fue archivado el 26 de noviembre de 2026 y el autor recomienda migrar a `keptn/gemma4-31b-exl3`, de menor tamaño y misma calidad, sobre radiance 2.3.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con torre de visión y cabeza asistente para decodificación especulativa |
| Parametros totales | 31B (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos int4 con punto cero (GPTQ, escala f16 cada 128 pesos); activaciones int8 (escala por token y 128 valores); `lm_head` int8 con escala bf16 cada 128 pesos; cabeza asistente en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance), fichero único de 19,95 GiB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B-it de Google, un transformer multimodal que procesa texto, imagen y vídeo. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo original; esos datos corresponden a la model card de Google, no incluida aquí.

La innovación principal de esta ficha es la cuantización: pesos int4 con punto cero y escalas f16 cada 128 pesos, calibrados con GPTQ sobre `keptn/quant-calibration`, con activaciones int8 y una copia f16 de las capas int4 durante la decodificación. Se conserva la cabeza asistente de Google en bf16 para decodificación especulativa con 3 tokens de borrador, y se mantiene la torre de visión (que puede ubicarse en RAM). La versión 2.0 reduce el KL medio a aproximadamente la mitad respecto a la 1.0, a costa de un 1,6 % más de latencia en decodificación con una tarjeta y un 7,5 % con dos.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (documentos, diagramas) y vídeo como entradas multimodales.
- Modo "thinking" activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa con la cabeza asistente de Gemma 4 (3 tokens de borrador).
- Procesamiento de contexto largo de hasta 262.144 tokens.
- Inferencia distribuida en 1, 2 o 4 GPUs con tensor parallelism y comunicación P2P.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades de audio: la model card menciona un codificador de audio en las mediciones, pero no se detalla su soporte funcional.

## Casos de uso

- Análisis de documentos largos con imágenes: el modelo puede procesar DocVQA y AI2D junto a texto extenso gracias a su ventana de 262.144 tokens, útil para extracción de datos de informes escaneados y contratos.
- Asistente conversacional con contexto extenso: permite mantener conversaciones de decenas de miles de tokens con coherencia, adecuado para soporte técnico especializado.
- Procesamiento de vídeo para descripción y análisis: con soporte de clips de varios fotogramas (evaluado en MVBench), sirve para generar descripciones o resúmenes de material audiovisual.
- Despliegue en estaciones de trabajo AMD: al caber en una Radeon AI PRO R9700 de 32 GB, permite inferencia local de un modelo 31B multimodal sin depender de la nube.
- Servicio de inferencia multi-stream: con 4 streams y hasta 516 tokens/s agregados en 4 tarjetas, es viable para servir a varios usuarios concurrentes en un entorno de laboratorio.
- Prototipado de aplicaciones multimodales: la licencia Apache 2.0 y el formato de fichero único facilitan la experimentación y la integración en pipelines de investigación.
- Evaluación de cuantizaciones: sirve como referencia para comparar calidad (KL, perplejidad) frente a variantes i8, w5 o exl3 del mismo modelo base.

## Benchmarks y rendimiento

Calidad frente al bf16 original en 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta):

| Modelo | KL medio | KL percentil 99 | Token top idéntico | Ratio de perplejidad |
|---|---|---|---|---|
| Este fichero (a4 v2.0) | 0,0251 | 0,331 | 96,1 % | ×0,993 |
| gemma4-31b-a4 v1.0 (w4a8) | 0,0517 | 0,721 | 94,6 % | ×1,056 |
| gemma4-31b-i8g | 0,00236 | 0,0311 | 98,8 % | ×1,004 |
| gemma4-31b-w5 | 0,00803 | 0,107 | 97,8 % | ×1,010 |

Rendimiento en Radeon AI PRO R9700 a 215 W, radiance 1.16.0, KV fp8, 3 tokens de borrador, thinking desactivado (BetterBench 0.6.1, temperatura 0,7, mediana de tokens por segundo):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decodificación, un stream | 78,4 | 132,3 | 202,0 |
| Prefill a 24k tokens | 1.463 | 2.657 | 4.318 |
| 4 streams, total | 130 | 349 | 516 |

Multimodal (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Respuesta idéntica | KL medio | Token top idéntico |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 16/20 | 0,268 | 66/70 |
| Vídeo (MVBench, 5 clips, 4 fotogramas) | 5 | 4/5 | 0,0556 | 31/32 |

## Requisitos de hardware

- VRAM: fichero de 19,95 GiB; requiere tarjetas de 32 GB. Probado en una, dos y cuatro Radeon AI PRO R9700.
- Tres tarjetas no funcionan: los 32 cabezales de atención no se dividen entre tres.
- GPU recomendadas: Radeon AI PRO R9700 (RDNA4). No se mencionan otras GPU compatibles.
- No cabe en GPUs de consumo de 24 GB o menos según el tamaño del fichero.
- Despliegue exclusivamente mediante el motor radiance (versión 2.0.0 o superior; 1.16.0 a 1.17.0 con flags de línea de comandos), distribuido como imagen Docker `stilldeadcode/radiance:2.0.0`.
- Configuración de memoria: el pool KV a 262.144 tokens con KV fp8 admite 298.848 tokens de contexto con 2 secuencias en una tarjeta, hasta 2.097.248 con 8 secuencias en cuatro tarjetas.
- Throughput: 78,4 tokens/s en decodificación con una tarjeta y 202,0 con cuatro; prefill de 1.463 a 4.318 tokens/s según número de tarjetas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| keptn/gemma4-31b-a4 (este) | 31B | 262.144 | `.rad` int4 | Apache 2.0 | Archivado; KL medio 0,0251 |
| keptn/gemma4-31b-i8g | 31B | no disponible | int8 | Apache 2.0 | Mayor calidad (KL 0,00236), presumiblemente mayor tamaño |
| keptn/gemma4-31b-w5 | 31B | no disponible | 5 bits | Apache 2.0 | Calidad intermedia (KL 0,00803) |
| keptn/gemma4-31b-exl3 | 31B | no disponible | EXL3 | Apache 2.0 | Recomendado por el autor; menor tamaño, misma calidad, requiere radiance 2.3.0+ |

## Limitaciones y advertencias

- Repositorio archivado el 26 de noviembre de 2026: no recibirá actualizaciones; el autor recomienda migrar a `keptn/gemma4-31b-exl3`.
- Formato propietario `.rad` que solo funciona con el motor radiance; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Requiere hardware AMD RDNA4; no hay soporte documentado para NVIDIA u otras arquitecturas.
- La cuantización introduce degradación medible: KL medio de 0,0251 y 96,1 % de coincidencia en el token top, inferior a las variantes i8 y w5.
- El rendimiento multimodal es más variable: 16/20 respuestas idénticas en imágenes y KL medio de 0,268, superior al de texto.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 se aplica a esta cuantización, pero conviene verificar los términos del modelo base de Google para uso comercial.
- La configuración con tres tarjetas no es viable por la división de cabezales de atención.

## Enlaces

- [Hugging Face: keptn/gemma4-31b-a4](https://huggingface.co/keptn/gemma4-31b-a4)
- [Modelo base: google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [Alternativa recomendada: keptn/gemma4-31b-exl3](https://huggingface.co/keptn/gemma4-31b-exl3)
- [Variante int8: keptn/gemma4-31b-i8g](https://huggingface.co/keptn/gemma4-31b-i8g)
- [Variante 5 bits: keptn/gemma4-31b-w5](https://huggingface.co/keptn/gemma4-31b-w5)
- [Repositorio de radiance](https://codeberg.org/StillDeadcode/radiance)
- [Guía Docker de radiance](https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it)
- [PR #75 de soporte de Gemma 4 en radiance](https://codeberg.org/StillDeadcode/radiance/pulls/75)
