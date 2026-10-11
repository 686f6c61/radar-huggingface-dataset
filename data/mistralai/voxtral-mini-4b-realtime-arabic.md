# mistralai/Voxtral-Mini-4B-Realtime-Arabic

## Resumen

Voxtral Mini 4B Realtime Arabic es un modelo de reconocimiento automático del habla (ASR) en streaming, especializado en árabe moderno estándar y en 15 variedades dialectales árabes. Lo desarrolla Mistral AI y deriva por ajuste fino de Voxtral-Mini-4B-Realtime-2602, un modelo de aproximadamente 4.400 millones de parámetros con pesos en BF16. Su rasgo diferencial es que transcribe mientras llega el audio, en lugar de esperar a que termine la locución, lo que lo hace apto para subtitulado en vivo e interfaces de voz.

El modelo se ha co-desarrollado con el Ministère de la Transition Numérique et de la Réforme Administrative (MTNRA) de Marruecos, en el marco de la asociación estratégica firmada entre Mistral y Marruecos en enero de 2026, y se presenta como un activo de IA soberana. Con un retardo de transcripción configurable de 480 ms alcanza un CER medio del 8,82 % en siete benchmarks árabes, frente al 7,91 % de Voxtral Transcribe Arabic (modelo offline), una diferencia de 0,91 puntos porcentuales.

Es relevante ahora porque cubre un hueco poco atendido: ASR en tiempo real para dialectos árabes (darija marroquí, argelino, tunecino, golf, levantino, egipcio, etc.) con soporte explícito de code-switching, el fenómeno por el que un hablante alterna idiomas dentro de la misma conversación. Su licencia Apache 2.0 permite uso comercial y despliegue on-premise.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de audio causal más decoder de lenguaje (Voxtral Realtime) |
| Parámetros totales | 4.429.679.360 (aproximadamente 4,4 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Árabe moderno estándar (ar) y 15 variedades dialectales: ary, ayl, aeb, arq, mey, afb, ars, acx, ayn, arz, apd, acm, ajp, apc, shu |
| Licencia | Apache 2.0 (según la model card; el campo de licencia del repositorio figura como no disponible) |
| Formato de pesos | safetensors (librería declarada: vLLM) |

Otros datos del repositorio: tamaño de 17,7 GB, 123 descargas y 11 "me gusta", creado el 8 de octubre de 2026 y actualizado el 9 de octubre de 2026. Modelo base: mistralai/Voxtral-Mini-4B-Realtime-2602.

## Arquitectura y entrenamiento

La arquitectura combina un encoder de audio causal y un decoder de lenguaje. El encoder procesa audio a 16 kHz de forma causal, es decir, sin mirar al futuro de la señal, y el decoder emite texto a medida que el audio llega. El modelo admite un retardo de transcripción configurable, parámetro que gobierna el compromiso entre latencia y precisión: retardos mayores permiten acumular más contexto acústico antes de decidir, y retardos menores reducen la latencia. Los pesos se distribuyen en BF16 y el modelo se activa mediante la librería vLLM con soporte de Voxtral Realtime, además de soporte nativo en Transformers a partir de la versión 5.2.0.

El ajuste fino parte de Voxtral-Mini-4B-Realtime-2602 y se ha centrado en árabe y code-switching. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Como material de evaluación, las métricas declaradas son CER y WER, calculadas con una normalización desarrollada junto al MTNRA que cubre ortografía específica de dialectos, clíticos, préstamos lingüísticos y números hablados (el código se distribuye en `normalization.py`). Las evaluaciones se realizan con temperatura 0,0 y un retardo configurado de 480 ms; los autores advierten de que los resultados pueden diferir con otros métodos de normalización. Se menciona además que, aunque el entrenamiento se centró en code-switching árabe, se observan mejoras en code-switching con idiomas fuera de ese foco.

## Capacidades

- Transcripción de voz a texto en streaming, emitiendo texto conforme llega el audio en lugar de esperar al final del enunciado.
- Cobertura de 16 códigos de idioma: árabe moderno estándar y dialectos del Magreb (marroquí, libio, tunecino, argelino, hassaniya), del Golfo (golf, najdi, omaní, sanaani), del valle del Nilo (egipcio, sudanés), levantino (mesopotámico, levantino meridional, levantino septentrional) y chadiano.
- Manejo de code-switching: los hablantes pueden alternar entre idiomas dentro de la misma conversación, escenario frecuente en contextos magrebíes.
- Retardo de transcripción configurable, pensado para subtitulado en vivo e interfaces de voz.
- Robustez declarada frente a audio del mundo real (condiciones de grabación no controladas).
- Capacidad emergente de code-switching con idiomas fuera del foco de entrenamiento (no garantizada).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio generation ni modo de pensamiento explícito; se trata de un modelo ASR, no de un modelo conversacional de propósito general.

## Casos de uso

- Subtitulado en directo para televisiones y plataformas de vídeo en árabe: con un retardo de 480 ms y un CER medio del 8,82 %, el modelo permite generar subtítulos en tiempo útil para emisiones en directo donde un sistema offline no llegaría a tiempo.
- Centros de atención telefónica en Marruecos y el Magreb: la cobertura de darija marroquí (ary), argelino (arq) y tunecino (aeb), junto con el manejo de code-switching árabe-francés, encaja con la realidad lingüística de las conversaciones de soporte en la región.
- Administración pública y servicios ciudadanos: el modelo se ha co-desarrollado con el MTNRA como activo de IA soberana, de modo que puede desplegarse on-premise para transcribir trámites, comparecencias o reuniones sin enviar audio a terceros.
- Interfaces de voz para asistentes y aplicaciones: la naturaleza causal y el retardo configurable permiten usarlo como front-end de reconocimiento para comandos de voz en árabe dialectal, alimentando un componente de comprensión posterior.
- Dictado y documentación profesional (sanidad, legal, seguros): transcripción de notas dictadas en dialectos del Golfo o levantino donde los sistemas entrenados solo en árabe estándar fallan con frecuencia.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en eventos, aulas y reuniones celebradas en variedades árabes.
- Análisis y moderación de audio generado por usuarios: transcripción a escala de contenido subido a plataformas, cubriendo dialectos del Golfo, egipcio y levantino que suelen quedar fuera de los modelos multilingües genéricos.
- Investigación en dialectología y lingüística árabe: el modelo y la normalización publicada permiten construir corpus transcritos de variedades poco documentadas como hassaniya (mey) o chadiano (shu).

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los siguientes. Las imágenes con el desglose por benchmark y por retardo no aportan cifras legibles en el material recibido.

| Benchmark | Métrica | Resultado | Condiciones |
|---|---|---|---|
| Media de siete benchmarks árabes | CER | 8,82 % | Retardo de transcripción 480 ms, temperatura 0,0 |
| Voxtral Transcribe Arabic (referencia offline) | CER | 7,91 % | Diferencia de 0,91 puntos porcentuales respecto al modelo realtime |
| ISMA | CER | no disponible | Benchmark co-desarrollado con MTNRA; solo se publica la media agregada |
| Darija in the Wild | CER | no disponible | Benchmark co-desarrollado con MTNRA; solo se publica la media agregada |
| FLEURS | CER | no disponible | Se menciona que los filtros de seguridad de Gemini bloquean la transcripción de algunas muestras |

No se publican en la información disponible cifras de MMLU, HumanEval, GSM8K ni de benchmarks de comprensión, ya que el modelo es exclusivamente de ASR. Los autores afirman que el modelo supera a varios modelos offline, tanto de código abierto como propietarios, pero no se detallan cuáles ni con qué cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos, más memoria para activaciones y caché del encoder de audio; con margen de trabajo, se recomienda un mínimo de 12-16 GB. Cálculo orientativo a partir de los 4,43 B de parámetros, no una cifra oficial de Mistral.
- Cuantización: no se documentan cuantizaciones oficiales ni versiones GGUF. Una hipotética cuantización a 8 bits situaría los pesos en torno a 4,5 GB y a 4 bits en torno a 2,5 GB, pero estas cifras son estimaciones teóricas y no hay artefactos publicados que las respalden.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor con vLLM y concurrencia. En el ámbito profesional, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para BF16 en un solo dispositivo.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más para BF16, y previsiblemente en tarjetas de 12 GB o menos si se aplicara cuantización, algo que la información disponible no confirma.
- Opciones de despliegue: vLLM con soporte de Voxtral Realtime (`vllm serve mistralai/Voxtral-Mini-4B-Realtime-Arabic`), con streaming de audio por WebSocket al endpoint `/v1/realtime`; y Transformers a partir de la versión 5.2.0 con `VoxtralRealtimeForConditionalGeneration` y `mistral-common[audio]`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia: el parámetro controlable por el usuario es el retardo de transcripción, fijado en 480 ms en las evaluaciones publicadas. Throughput, latencia extremo a extremo y consumo de memoria en producción no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral Mini 4B Realtime Arabic | 4,43 B | no disponible | CER medio 8,82 % en siete benchmarks árabes (retardo 480 ms) | Apache 2.0 | Pesos abiertos en HuggingFace |
| Voxtral Mini 4B Realtime (base, 2602) | no disponible en la información recibida | no disponible | no disponible | no disponible | Pesos abiertos; recomendado por los autores para idiomas distintos del árabe |
| Voxtral Transcribe Arabic | no disponible | no disponible | CER 7,91 % (offline) | no disponible | Producto de Mistral; no se indica que sus pesos sean abiertos |

No se dispone de datos verificables en la información proporcionada para comparar con alternativas de terceros como Whisper u otros sistemas ASR multilingües; por tanto, esa comparación se marca como no disponible. La model card afirma que el modelo supera a varios sistemas offline de código abierto y propietarios, pero no enumera ni cuantifica cuáles.

## Limitaciones y advertencias

- Especialización exclusiva en árabe: los autores indican explícitamente que para otros idiomas debe usarse el modelo original Voxtral Mini 4B Realtime. Usarlo con audio en castellano, inglés u otras lenguas no es el propósito del modelo.
- Riesgo de alucinación y de transcripción incorrecta en audio ruidoso, con solapamiento de voces o con acentos poco representados en el ajuste fino.
- Cobertura dialectal desigual: variedades con pocos recursos como el hassaniya (mey) o el chadiano (shu) probablemente presentan tasas de error superiores a la media agregada, aunque no se publican cifras desglosadas.
- Las cifras de CER dependen de la normalización desarrollada con el MTNRA; con otros esquemas de normalización los resultados pueden diferir, lo que complica la comparación directa con otros sistemas.
- El code-switching con idiomas fuera del foco de entrenamiento se describe como capacidad emergente, no como una función garantizada.
- Licencia: la model card indica Apache 2.0, lo que permitiría uso comercial, pero el campo de licencia del repositorio aparece como no disponible y la propia model card añade la condición de no infringir derechos de terceros, incluidos los de propiedad intelectual. Conviene verificar la licencia en el repositorio antes de un despliegue comercial.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que limita las opciones de despliegue en entornos con hardware modesto.
- El despliegue en tiempo real depende del soporte de Voxtral Realtime en vLLM o de Transformers 5.2.0 o superior; versiones anteriores no sirven.
- Adopción comunitaria muy baja en el momento de los datos (123 descargas, 11 "me gusta"), por lo que existe poca validación independiente de las cifras declaradas.
- El rendimiento real depende del retardo de transcripción elegido: reducir el retardo por debajo de los 480 ms empleados en la evaluación previsiblemente empeora el CER.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-Arabic
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Documentación de Transformers para Voxtral Realtime: https://huggingface.co/docs/transformers/main/en/model_doc/voxtral_realtime
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Ejemplo de streaming en tiempo real con vLLM: https://docs.vllm.ai/en/stable/examples/speech_to_text/realtime/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Mistral AI (sitio oficial): https://mistral.ai/
- Mistral AI en Wikipedia: https://fr.wikipedia.org/wiki/Mistral_AI
