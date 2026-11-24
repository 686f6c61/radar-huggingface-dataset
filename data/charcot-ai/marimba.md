# charcot-ai/marimba

## Resumen

Marimba es un modelo de clasificación de audio desarrollado por Charcot que responde a preguntas tipadas sobre ventanas cortas de audio: si alguien está hablando, si un turno de conversación ha terminado, qué idioma se habla o si aparece un término concreto. Se construye como un adaptador sobre el backbone congelado Qwen3-ASR-0.6B, de modo que el codificador se comparte entre todas las preguntas formuladas sobre la misma ventana de audio, lo que reduce el coste computacional cuando se lanzan varias consultas simultáneas.

El modelo resuelve un problema específico en sistemas de voz conversacional: la detección de turnos (turn-taking), la actividad de voz (VAD), la identificación de idioma (LID), la detección de palabras clave y el cambio de hablante son tareas habitualmente resueltas con pipelines separados. Marimba las unifica bajo una interfaz de "decisiones tipadas" (noul, score, choice) con salidas JSON-seguras que incluyen probabilidades, umbrales y marcas temporales de la ventana evaluada.

Es relevante ahora porque ofrece una alternativa ligera (repo de 0,1 GB, backbone de 0,6B de parámetros) a los grandes modelos de audio-LLM para tareas de enrutamiento y control en agentes de voz, con latencias declaradas de 13 ms para turn end y 16 ms para VAD en una NVIDIA L4. Solo puntúa los últimos ocho segundos de audio y no proporciona garantías de tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre backbone congelado Qwen3-ASR-0.6B (encoder compartido entre preguntas) |
| Parámetros totales | 0,6B en el backbone (parámetros del adaptador no disponibles) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 8 segundos (solo se puntúan los últimos 8 s) |
| Tipos de cuantización | bf16 y float32 documentados en los ejemplos; no se detallan otras cuantizaciones |
| Idiomas soportados | 30 idiomas para la tarea de identificación de idioma; etiquetas de modelo en inglés y portugués |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Marimba se implementa como un adaptador sobre el backbone congelado Qwen3-ASR-0.6B. La innovación principal es la compartición de una única pasada del encoder entre todas las preguntas formuladas sobre la misma ventana de audio, de manera que consultas como detección de actividad de voz, fin de turno e identificación de idioma reutilizan las mismas representaciones. El modelo expone tres tipos de pregunta: `noul` (sí/no con umbral), `score` (probabilidad numérica) y `choice` (selección entre opciones suministradas). Las tareas de hablante comparan mitades de cuatro segundos (mismo hablante) o los últimos dos segundos con los seis anteriores (cambio de hablante).

El entrenamiento utiliza el dataset pipecat-ai/smart-turn-data-v3.2-train. No se detalla en la información disponible el número de tokens, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO. Las puntuaciones de términos se describen como no calibradas y se calculan como la fracción cruda de hipótesis greedy más cuatro de beam search. La tarea de información personal es experimental y requiere un detector de PII textual externo que no se incluye.

## Capacidades

- Detección de fin de turno (turn end) con salida de tipo score.
- Detección de actividad de voz (VAD) con salida sí/no.
- Identificación de idioma en conjunto cerrado de 30 idiomas, con opción de agregar "Other".
- Detección de términos o palabras clave (keyword spotting) mediante preguntas sí/no.
- Detección de mismo hablante y cambio de hablante por ventana.
- Conteo de hablantes en categorías 0/1/2/3+.
- Detección experimental de información personal (PII) en audio, condicionada a un detector de texto externo.
- Interfaz de decisiones tipadas con salida JSON-segura que incluye tarea, tipo, estado, valor, probabilidades, umbral, marcas temporales de ventana, latencia y flag de calibración.
- Procesamiento de audio: mezcla a mono, remuestreo a 16 kHz y recorte a los últimos ocho segundos, con relleno por la izquierda y máscara de validez para clips más cortos.
- No soporta generación de texto libre, razonamiento general, código ni matemáticas; es un modelo de clasificación de audio.

## Casos de uso

- Gestión de turnos en agentes de voz: el modelo decide si el usuario ha terminado de hablar (AUROC 0,930 en Smart Turn v3.2) para que el agente responda sin solapamientos; su latencia de 13 ms en L4 lo hace apto para el bucle de control de un sistema conversacional.
- Detección de actividad de voz en pipelines de transcripción: filtrar segmentos sin habla antes de enviarlos a un ASR, con AUROC 0,995 en AMI y 0,9996 en VoxConverse, reduciendo coste de transcripción.
- Enrutamiento multilingüe: identificar el idioma de la ventana (30 idiomas, 100 % de precisión en FLEURS y 93 % en Common Voice) para dirigir la petición al modelo o pipeline adecuado.
- Activación por palabra clave: detectar términos concretos en audio (AUROC 0,92 en Common Voice, 0,97 en FLEURS) para wake words o comandos, teniendo en cuenta que las puntuaciones no están calibradas.
- Análisis de reuniones: detectar cambios de hablante (AUROC 0,966 en AMI, 0,980 en VoxConverse) y estimar el número de participantes por ventana para segmentar la conversación antes de un diarizador completo.
- Moderación y privacidad: marcar ventanas que contengan información personal (tarea experimental, F1 0,904 en 200 clips sintéticos pt-BR con detector interno) antes de almacenar o procesar el audio.
- Preprocesado en sistemas de subtitulado en directo: combinar VAD, LID y detección de cambio de hablante en una sola pasada del encoder para etiquetar segmentos con bajo coste computacional.

## Benchmarks y rendimiento

Resultados reportados por el autor para el checkpoint publicado:

| Tarea | Salida | Estado | Resultado reportado |
|---|---|---|---|
| Fin de turno | score | validado | AUROC 0,930 en Smart Turn v3.2 test (Smart Turn v3.2: 0,982, in-distribution); 0,716 vs 0,712 en reuniones ICSI (empate) |
| Actividad de voz | noul | validado | AUROC 0,995 en AMI; 0,9996 en VoxConverse |
| Idioma | choice | validado | 30 idiomas; precisión 100 % en FLEURS; 93 % en Common Voice (300 clips cada uno) |
| Término | noul | validado | AUROC 0,92 en Common Voice; 0,97 en FLEURS; puntuaciones no calibradas |
| Mismo hablante | noul / score | validado | AUROC 0,998 en AMI; 0,996 en VoxConverse; ECAPA: 0,985 y 0,995 |
| Cambio de hablante | noul / score | validado | AUROC 0,966 en AMI; 0,980 en VoxConverse; ECAPA: 0,924 y 0,962 |
| Conteo de hablantes (0/1/2/3+) | choice | validado | Precisión 0,778 en AMI; 0,859 en VoxConverse; pyannote 3.1: 0,738 y 0,836; subestima 3+ |
| Información personal | noul | experimental | Requiere detector de PII textual externo; F1 0,904 en 200 clips sintéticos pt-BR con detector interno |

Comparación con audio-LLM en 1.000 preguntas públicas fijas (respuesta zero-shot, elección por suma de log-probabilidades):

| Slice | n | Métrica | Marimba | Qwen3-Omni-30B-A3B | Qwen2-Audio-7B | FireRedAudio |
|---|---:|---|---:|---:|---:|---:|
| Idioma Common Voice | 52 | accuracy | 0,904 | 1,000 | 0,846 | 0,962 |
| Idioma FLEURS | 200 | accuracy | 1,000 | 1,000 | 0,840 | 0,865 |
| Término Common Voice, choice | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Latencia p95 por pregunta en una NVIDIA L4 (bf16, batch size 1): 13 ms para fin de turno, 16 ms para actividad de voz, 161 ms para idioma y 2,35 s para detección de términos.

## Requisitos de hardware

- VRAM estimada: el backbone es de 0,6B de parámetros; en bf16 ocupa aproximadamente 1,2 GB de pesos, más el adaptador y el overhead de inferencia. En float32, unos 2,4 GB solo de pesos.
- GPU recomendadas: el autor reporta mediciones en NVIDIA L4; por tamaño, cabe holgadamente en RTX 4090, RTX 3090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM en bf16, incluidas RTX 3060 y superiores.
- Opciones de despliegue: paquete `marimba-audio[torch]` con backends torch (documentado); no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: p95 de 13 ms (turn end), 16 ms (VAD), 161 ms (idioma) y 2,35 s (términos) por pregunta en L4 con batch size 1; no se ofrecen garantías de tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marimba | 0,6B (backbone) | 8 s de audio | Clasificación de audio multitarea (turn-taking, VAD, LID, KWS) | Apache 2.0 | Hugging Face |
| Qwen3-Omni-30B-A3B | 30B totales (3B activos, MoE) | No disponible | Audio-LLM generalista | No disponible | Hugging Face |
| Qwen2-Audio-7B | 7B | No disponible | Audio-LLM generalista | No disponible | Hugging Face |
| FireRedAudio | No disponible | No disponible | Audio-LLM generalista | No disponible | No disponible |

En la comparación pareada del autor, Marimba supera a Qwen2-Audio-7B en identificación de idioma (0,904 vs 0,846 en Common Voice; 1,000 vs 0,840 en FLEURS) y queda por debajo de Qwen3-Omni-30B-A3B (1,000) y FireRedAudio (0,962) en Common Voice, con empate en FLEURS frente a Qwen3-Omni. Frente a ECAPA, Marimba obtiene AUROC superior en mismo hablante y cambio de hablante, y frente a pyannote 3.1 mejora el conteo de hablantes.

## Limitaciones y advertencias

- Solo se puntúan los últimos ocho segundos de audio; las preguntas de hablante requieren ocho segundos válidos y devuelven `None` en ventanas más cortas.
- Las puntuaciones de detección de términos no están calibradas y no se ofrece garantía de tiempo real.
- La identificación de idioma es de conjunto cerrado: la opción "Other" agrega los idiomas restantes soportados, pero no detecta cualquier idioma desconocido.
- Las tareas de hablante son decisiones por ventana: no identifican personas ni generan líneas temporales de diarización.
- La tarea de información personal es experimental y necesita un detector de PII textual externo que no se incluye.
- El conteo de hablantes subestima la categoría 3+ (precisión 0,778 en AMI y 0,859 en VoxConverse).
- Los resultados de benchmarks corresponden al checkpoint evaluado y no garantizan el comportamiento ante prompts arbitrarios o condiciones de despliegue distintas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las salidas probabilísticas pueden ser erróneas en dominios alejados de los datos de evaluación; el autor no documenta sesgos específicos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del backbone Qwen3-ASR-0.6B y del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/charcot-ai/marimba
- Paper: https://arxiv.org/abs/2611.18330
- Demo (Space): https://huggingface.co/spaces/charcot-ai/marimba
- Código fuente: https://github.com/Charcot-AI/marimba-api
- Documentación: https://github.com/Charcot-AI/marimba-api/tree/main/docs
- Documentación de entradas de audio: https://github.com/Charcot-AI/marimba-api/blob/main/docs/audio.md
- Documentación de streaming: https://github.com/Charcot-AI/marimba-api/blob/main/docs/streaming.md
- Protocolo de medición de benchmarks: https://github.com/Charcot-AI/marimba-api/blob/main/docs/benchmarks.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Sitio del autor: https://charcot.ai
