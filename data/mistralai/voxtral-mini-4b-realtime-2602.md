# mistralai/Voxtral-Mini-4B-Realtime-2602

## Resumen

Voxtral Mini 4B Realtime 2602 es un modelo de transcripción de voz a texto en tiempo real desarrollado por Mistral AI. Es de los primeros sistemas de código abierto que logra una precisión comparable a los sistemas offline con una latencia inferior a 500 ms, lo que lo hace adecuado para aplicaciones como asistentes de voz y subtitulado en vivo. Soporta 13 idiomas y está construido sobre una arquitectura de streaming nativa con un codificador de audio causal entrenado desde cero.

El modelo combina un modelo de lenguaje de aproximadamente 3.400 millones de parámetros con un codificador de audio de unos 970 millones de parámetros, totalizando 4.429.679.360 parámetros. Utiliza atención con ventana deslizante tanto en el codificador como en el LLM, lo que permite un streaming "infinito". Se distribuye en BF16 bajo licencia Apache-2.0, con un tamaño de repositorio de 17,8 GB. La longitud de contexto máxima recomendada es de 131.072 tokens, equivalente a unas tres horas de audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje (≈3.4B) + codificador de audio causal (≈970M), atención con ventana deslizante |
| Parametros totales | 4.429.679.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (recomendado por defecto en vLLM, ~3 horas de audio) |
| Tipos de cuantizacion | BF16 nativo; no se documentan cuantizaciones adicionales |
| Idiomas soportados | 13: en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), junto con archivo tekken.json para configuración |

## Arquitectura y entrenamiento

El modelo se compone de dos módulos principales: un modelo de lenguaje de aproximadamente 3.400 millones de parámetros y un codificador de audio de unos 970 millones de parámetros. El codificador de audio fue entrenado desde cero con atención causal, lo que habilita la capacidad de streaming. Tanto el codificador como el LLM emplean atención con ventana deslizante, permitiendo un procesamiento continuo de audio sin límite práctico de duración. El modelo base es mistralai/Ministral-3-3B-Base-2512, sobre el cual se ha realizado un ajuste fino específico para transcripción en tiempo real.

El retardo de transcripción es configurable en múltiplos de 80 ms, desde 80 ms hasta 1200 ms, más un valor adicional de 2400 ms. A 480 ms de retardo, el modelo alcanza un rendimiento comparable al de los mejores sistemas offline de transcripción de código abierto. El informe técnico está disponible en arxiv (2602.11298) y se ha publicado una entrada de blog en vLLM sobre streaming en tiempo real.

## Capacidades

- Transcripción de voz a texto en tiempo real con latencia inferior a 500 ms (a 480 ms de retardo).
- Soporte multilingüe en 13 idiomas: inglés, francés, español, alemán, ruso, chino, japonés, italiano, portugués, neerlandés, árabe, hindi y coreano.
- Streaming nativo con atención causal en el codificador de audio, lo que permite procesar audio continuo sin necesidad de segmentos predefinidos.
- Retardo de transcripción configurable (80 ms a 2400 ms) para equilibrar latencia y precisión según la aplicación.
- Diseñado para despliegue en dispositivos con recursos limitados: alcanza un throughput superior a 12,5 tokens por segundo en hardware mínimo.
- Integración con vLLM para despliegue en producción, incluyendo soporte para websockets en sesiones de audio streaming.

## Casos de uso

- Subtitulado en vivo de vídeos, conferencias o retransmisiones: el modelo puede transcribir audio en tiempo real con un retardo de 480 ms, manteniendo una precisión comparable a sistemas offline, lo que permite generar subtítulos sincronizados al instante.
- Asistentes de voz con comprensión del habla: al ser un modelo de streaming con baja latencia, puede integrarse en pipelines de voz para responder a comandos de forma casi inmediata, mejorando la experiencia de usuario frente a sistemas que requieren esperar a la frase completa.
- Transcripción de reuniones privadas en tiempo real: con una ventana de contexto de hasta 3 horas, puede transcribir reuniones largas sin reiniciar la sesión, y el retardo configurable permite adaptarse a la necesidad de precisión o velocidad.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real con subtítulos puede integrarse en aplicaciones de videollamadas o eventos en directo para proporcionar texto inmediato.
- Análisis de llamadas de atención al cliente: al poder procesar audio en streaming, se puede transcribir y analizar conversaciones telefónicas en tiempo real para detectar problemas o extraer información relevante.
- Traducción y transcripción multilingüe en directo: dado su soporte para 13 idiomas, puede usarse en eventos internacionales para generar transcripciones en el idioma original o como base para un sistema de traducción automática posterior.

## Benchmarks y rendimiento

La model card proporciona resultados en el conjunto de datos Fleurs, comparando el modelo con Voxtral Mini Transcribe 2.0 (modelo offline). Se muestran tasas de error (WER) en porcentaje. A 480 ms de retardo, el modelo alcanza un promedio del 8,72%, frente al 5,90% del modelo offline. A 160 ms sube al 12,60% y a 240 ms al 10,80%. A 960 ms baja al 7,70%. Los datos por idioma están disponibles para los retardos de 480 ms, 160 ms y 240 ms, aunque la tabla está incompleta para 960 ms.

| Modelo | Retardo | AVG | Árabe | Alemán | Inglés | Español | Francés | Hindi | Italiano | Neerlandés | Portugués | Chino | Japonés | Coreano | Ruso |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Voxtral Mini Transcribe 2.0 | Offline | 5,90% | 13,54% | 3,54% | 3,32% | 2,63% | 4,32% | 10,33% | 2,17% | 4,78% | 3,56% | 7,30% | 4,14% | 12,29% | 4,75% |
| **Voxtral Mini 4B Realtime 2602** | 480 ms | 8,72% | 22,53% | 6,19% | 4,90% | 3,31% | 6,42% | 12,88% | 3,27% | 7,07% | 5,03% | 10,45% | 9,59% | 15,74% | 6,02% |
| | 160 ms | 12,60% | 24,33% | 9,50% | 6,46% | 5,34% | 9,75% | 15,28% | 5,59% | 11,39% | 10,01% | 17,67% | 19,17% | 19,81% | 9,53% |
| | 240 ms | 10,80% | 23,95% | 8,15% | 5,91% | 4,59% | 8,00% | 14,26% | 4,41% | 9,23% | 7,51% | 13,84% | 15,17% | 17,56% | 7,87% |
| | 960 ms | 7,70% | 20,32% | 4,87% | (datos incompletos en la model card) |

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4.429 millones de parámetros en BF16, el tamaño del modelo es de aproximadamente 8,9 GB (sin contar overhead). Se recomienda al menos 12 GB de VRAM para inferencia con vLLM. Con cuantizaciones adicionales (no documentadas oficialmente) podría reducirse, pero no hay datos disponibles.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4090, A100 (40 GB), H100 (80 GB) o L4. Para despliegue en producción con múltiples usuarios, se recomiendan GPUs de centro de datos.
- En consumer GPU: sí, cabe en una RTX 4090 (24 GB) o RTX 4080 (16 GB) en BF16, aunque con limitaciones de concurrencia. En GPUs con 12 GB (como RTX 3060) podría ser ajustado.
- Opciones de despliegue: vLLM es la librería principal soportada, con soporte para streaming de audio mediante websockets. También se puede usar con TGI u otros servidores que soporten safetensors, aunque la documentación oficial se centra en vLLM.
- Latencia y throughput: el modelo alcanza un throughput superior a 12,5 tokens por segundo en hardware mínimo. Con el retardo configurado a 480 ms, la latencia extremo a extremo es inferior a 500 ms. No se proporcionan cifras exactas de throughput en GPUs específicas.

## Comparativa con modelos similares

La model card compara directamente con Voxtral Mini Transcribe 2.0, el modelo offline de la misma familia. No se proporcionan comparaciones con otros modelos de transcripción en tiempo real de código abierto, aunque se afirma que supera a los existentes. A continuación se muestra la comparación disponible:

| Modelo | Tipo | Parámetros | Retardo | WER promedio (Fleurs) | Licencia |
|---|---|---|---|---|---|
| Voxtral Mini Transcribe 2.0 | Offline | No especificado | Offline | 5,90% | Apache-2.0 |
| **Voxtral Mini 4B Realtime 2602** | Realtime | 4.429M | 480 ms | 8,72% | Apache-2.0 |
| | | | 160 ms | 12,60% | |
| | | | 240 ms | 10,80% | |
| | | | 960 ms | 7,70% | |

No se dispone de datos comparativos con otros modelos como Whisper large-v3 o Parakeet en la información proporcionada.

## Limitaciones y advertencias

- El modelo está optimizado para transcripción de voz; no es un modelo de propósito general y no soporta otras tareas como generación de texto o razonamiento.
- La precisión varía significativamente según el idioma. En árabe, coreano y japonés el WER es notablemente más alto (22,53%, 15,74% y 9,59% respectivamente a 480 ms) en comparación con inglés (4,90%) o español (3,31%).
- El retardo de 160 ms produce un aumento considerable del error (12,60% promedio), por lo que no se recomienda para aplicaciones que requieran alta precisión.
- La configuración de retardo debe ser un múltiplo de 80 ms, y el valor máximo recomendado es 2400 ms. Valores intermedios no son válidos.
- El modelo requiere fijar la temperatura a 0.0 para obtener resultados estables, según las recomendaciones de Mistral AI.
- No se documentan cuantizaciones oficiales; el uso en BF16 implica un mayor consumo de memoria y puede no ser adecuado para dispositivos muy limitados.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo depende de vLLM para su despliegue óptimo; es necesario verificar la compatibilidad de versiones.
- El riesgo de alucinación en transcripción de voz existe, especialmente en audio con ruido o acentos poco representados, aunque no se proporcionan datos específicos al respecto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602)
- [Blog de Mistral AI](https://mistral.ai/news/voxtral-transcribe-2)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/mistralai/Voxtral-Mini-Realtime)
- [Informe técnico en arXiv](https://arxiv.org/abs/2602.11298)
- [Blog de vLLM sobre streaming en tiempo real](https://blog.vllm.ai/2026/01/31/streaming-realtime.html)
