# decagon-ai/Decibel-30B-A3B-v0

## Resumen

Decibel-30B-A3B-v0, o Decibel, es un modelo de decisión de pesos abiertos para audio y texto desarrollado por decagon-ai. A diferencia de los modelos generativos convencionales, no produce texto: recibe una grabación de audio (opcional), una pregunta, un contexto escrito (opcional) y una lista de opciones, y devuelve una probabilidad para cada opción en un único forward pass. Esta arquitectura de decisión, denominada estilo Jev por el autor, permite tomar la opción con mayor probabilidad o aplicar umbrales propios sobre las puntuaciones.

El modelo parte de Qwen/Qwen3-Omni-30B-A3B-Instruct (revision `26291f793822fb6be9555850f06dfe95f2d7e695`), un transformer MoE de aproximadamente 30.000 millones de parámetros totales y unos 3.000 millones activos por token, y se ha afinado sobre 230.400 decisiones, la mitad con audio y la mitad solo texto. Se ha construido junto al benchmark AudioDecisionBench-v0, sobre cuyos 1.989 ítems públicos alcanza un 89,0 % de precisión esperada, más de 20 puntos por delante de otros modelos de decisión como Gemini Decision 1, Clef-Omni y shlv/AudioJev.

Su relevancia actual reside en que ofrece decisiones multimodales rápidas y calibradas (mediana de 121 ms por decisión en una H200, batch 1) con probabilidades accionables, lo que lo hace adecuado para pipelines de clasificación y enrutamiento en producción donde se necesita latencia baja y umbrales fiables, no generación de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_omni_moe_thinker), finetune de Qwen3-Omni-30B-A3B-Instruct |
| Parámetros totales | 31.719.205.488 (≈31,7 B) |
| Parámetros activos | ≈3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; el repo ocupa 63,5 GB) |
| Idiomas soportados | multilingüe |
| Licencia | other (licencia personalizada; consultar términos del autor) |
| Formato de pesos | safetensors |
| Pipeline | audio-classification |
| Entrada | Audio (opcional), pregunta, contexto escrito (opcional) y lista de opciones (probado hasta 78 opciones con audio y 128 solo texto) |
| Salida | Probabilidad por cada ID de opción |
| Memoria en inferencia | 62,9 GiB de pico a batch 1 en BF16 |

## Arquitectura y entrenamiento

Decibel se construye sobre Qwen3-Omni-30B-A3B-Instruct, un modelo Mixture-of-Experts multimodal con aproximadamente 30.000 millones de parámetros totales y unos 3.000 millones activos por token, que combina comprensión de audio y texto. El ajuste convierte el modelo generativo en un modelo de decisión: cada opción de la lista recibe un token y las probabilidades se derivan de las puntuaciones del modelo para esos tokens en un único forward pass, sin generar texto. El modelo acepta audio opcional, pregunta, contexto escrito opcional y lista de opciones, y devuelve una distribución de probabilidad sobre las opciones.

El entrenamiento comprende 230.400 decisiones, la mitad con audio y la mitad solo texto, diseñadas en torno a cuatro propiedades: oír más allá de las palabras (eventos sonoros, música, toses, risas, timing, tono de voz y habla), contexto escrito que puede ser la regla determinante, una repetición, un distractor o estar en conflicto con la grabación; saber cuándo nada encaja mediante la opción "something else", que solo debe elegirse cuando ninguna opción nombrada es válida; y tratar las respuestas como juicios subjetivos, donde el objetivo es la distribución de respuestas de los oyentes y la pérdida premia acertar esa dispersión. No se detalla en la información disponible si se emplearon RLHF o DPO.

## Capacidades

- Decisión multimodal audio-texto: devuelve una probabilidad por opción a partir de audio, pregunta, contexto y lista de opciones.
- Decisión solo texto: admite entradas sin audio.
- Manejo de contexto escrito: interpreta reglas, repeticiones, distractores y conflictos entre contexto y grabación.
- Detección de "ninguna opción encaja" mediante la opción "something else".
- Modelado de desacuerdo entre oyentes: las probabilidades reflejan la dispersión de respuestas humanas.
- Comprensión de eventos sonoros, música, toses, risas, timing, tono de voz y habla.
- Listas de opciones largas: hasta 78 opciones con audio y 128 solo texto en las pruebas.
- Multilingüe.
- No genera texto; la salida es exclusivamente una distribución de probabilidad sobre opciones.

## Casos de uso

- Enrutamiento de llamadas en atención al cliente: el modelo recibe el audio de la llamada y una lista de motivos de contacto, y devuelve la probabilidad de cada motivo para dirigir la llamada al equipo adecuado, aprovechando su latencia mediana de 121 ms.
- Moderación de audio en plataformas: clasificar clips contra una lista de categorías de contenido (ruido, música, habla, eventos) con umbrales configurables sobre las probabilidades.
- Control de calidad en centros de llamadas: evaluar grabaciones contra una política escrita y opciones de cumplimiento, usando el contexto escrito como regla determinante.
- Triaje de urgencias por audio: decidir entre niveles de prioridad a partir de la grabación y un protocolo escrito, con la opción "something else" para casos que no encajan.
- Análisis de encuestas de voz: asignar respuestas abiertas grabadas a opciones predefinidas, modelando el desacuerdo entre oyentes mediante la distribución de probabilidad.
- Automatización de revisiones con umbral: integrar el modelo en pipelines donde se acepta automáticamente la opción si su probabilidad supera un umbral y se escala a revisión humana en caso contrario.
- Clasificación de eventos sonoros en dispositivos o entornos con audio continuo, gracias a la ventana de opciones amplia y a la velocidad de inferencia.

## Benchmarks y rendimiento

| Sistema | AudioDecisionBench-v0 público (1.989) | AudioDecisionBench-v0 total (9.989) | Grupos totalmente correctos (259 públicos) | MMAU test-mini (1.000) | MMAR (1.000) | MMSU (5.000) | Tiempo mediano por decisión |
|---|---:|---:|---:|---:|---:|---:|---:|
| Decibel-30B-A3B-v0 | 89,0 | 84,4 | 71,0 | 78,7 | 71,9 | 75,4 | 121 ms |
| Gemini Decision 1 | 68,1 | 62,2 | 21,2 | 73,5 | 63,2 | 66,8 | 0,98 s |
| Clef-Omni | 66,8 | 63,2 | 29,7 | 77,3 | 70,5 | 70,3 | 130 ms |
| Qwen3-Omni sin ajuste | 64,7 | 62,1 | 24,3 | 79,2 | 71,1 | 71,9 | no disponible |
| shlv/AudioJev | 55,7 | 54,8 | 18,5 | 71,1 | 56,9 | 61,6 | 62 ms |
| Gemini 4 Carbon, low reasoning | 83,4 | 82,3 | 57,9 | 82,3 | 84,3 | 87,8 | 2,9 s |
| Whisper → Gemini 4 Carbon | 53,0 | 49,5 | 22,0 | 71,8 | 68,6 | 68,7 | 5,2 s |

Las puntuaciones son porcentajes. En AudioDecisionBench la métrica es precisión esperada, con crédito parcial donde los oyentes discrepan; el resto son precisión simple. MMAR y MMSU se evalúan sobre sus conjuntos completos y MMAU sobre test-mini. Cualquier respuesta fallida cuenta como incorrecta. Los tiempos de API incluyen red; los de GPU se midieron en H200. El modelo fue entrenado con datos construidos bajo los mismos principios que el benchmark, aunque con grabaciones distintas, por lo que tiene ventaja en esa prueba; MMAU, MMAR y MMSU son la comprobación externa.

## Requisitos de hardware

- VRAM estimada: 62,9 GiB de pico a batch 1 con pesos BF16, incluyendo el preprocesado de audio.
- GPU recomendadas: H200 para las cifras publicadas; se requiere una GPU con al menos 80 GB de memoria para BF16 a batch 1.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en BF16; la información disponible no documenta cuantizaciones alternativas.
- Opciones de despliegue: no se especifican en la información disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia: mediana de 121 ms y p95 de 178 ms por decisión en una H200, batch 1, con preprocesado de audio incluido.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AudioDecisionBench público | MMAU test-mini | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decibel-30B-A3B-v0 | ≈31,7 B totales, ≈3 B activos | no disponible | 89,0 | 78,7 | other | Pesos abiertos en Hugging Face |
| Clef-Omni (Cloudflare) | mismo base Qwen3-Omni | no disponible | 66,8 | 77,3 | no disponible | Pesos abiertos en Hugging Face |
| shlv/AudioJev | no disponible | no disponible | 55,7 | 71,1 | no disponible | Pesos abiertos en Hugging Face |
| Gemini Decision 1 (Google) | no disponible | no disponible | 68,1 | 73,5 | propietaria | API |

## Limitaciones y advertencias

- Ventaja de dominio: el entrenamiento se construyó con los mismos principios que AudioDecisionBench-v0, por lo que los resultados en ese benchmark pueden sobreestimar el rendimiento en dominios distintos; MMAU, MMAR y MMSU son la referencia externa.
- No genera texto: solo devuelve probabilidades por opción, lo que limita su uso a tareas de clasificación y decisión.
- Límite de opciones: probado hasta 78 opciones con audio y 128 solo texto; listas más largas no están validadas.
- Licencia "other": es necesario revisar los términos del autor antes de un uso comercial.
- Riesgo de calibración: las probabilidades deben validarse con umbrales propios en el dominio de producción; el Brier score y la tasa de acierto de "something else" se detallan solo parcialmente en la información disponible.
- Sesgos: no se documentan sesgos específicos en la información proporcionada.
- Alucinación: al no generar texto, el riesgo se traslada a decisiones erróneas o mal calibradas, no a contenido inventado.
- Idiomas: se declara multilingüe, pero no se detalla la cobertura ni el rendimiento por idioma.
- Longitud de contexto: no disponible, lo que impide planificar entradas de audio o contexto escrito muy extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decagon-ai/Decibel-30B-A3B-v0
- Dataset AudioDecisionBench-v0: https://huggingface.co/datasets/decagon-ai/AudioDecisionBench-v0
- Modelo base Qwen3-Omni-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Clef-Omni (Cloudflare): https://huggingface.co/Cloudflare/clef-omni
- shlv/AudioJev: https://huggingface.co/shlv/AudioJev
- Paper: arXiv 2610.21614 (referenciado en los tags del modelo)
