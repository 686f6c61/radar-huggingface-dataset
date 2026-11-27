# keptn/gemma4-31b-heretic-ara-w4a8

## Resumen
Gemma 4 31B heretic-ara w4a8 es una cuantización de 4 bits del modelo Gemma 4 31B-it de Google, publicada por el usuario keptn, que a su vez parte de una versión "abliterated" (sin rechazos) creada por trohrbaugh mediante el método ARA (Arbitrary-Rank Ablation) de la herramienta Heretic. El resultado es un modelo multimodal (texto, imagen y vídeo) de 31 mil millones de parámetros con una ventana de contexto de 262.144 tokens, empaquetado en un único fichero de 19,95 GiB para el motor de inferencia radiance sobre GPUs AMD RDNA4.

La relevancia de esta ficha es doble: por un lado, demuestra el estado del arte en cuantización de pesos int4 con punto cero (GPTQ) y activaciones int8 para modelos de gran tamaño sobre hardware AMD; por otro, documenta una variante deliberadamente descensurada, lo que la hace útil para investigación sobre alineación y seguridad, pero problemática para despliegues comerciales convencionales.

El modelo conserva las capacidades del Gemma 4 original (razonamiento, código, visión, tool calling) pero elimina los mecanismos de rechazo mediante una ablación de direcciones en el espacio de activaciones. La versión 2.0 del fichero (noviembre de 2026) mejora la fidelidad frente al modelo bf16 de referencia, reduciendo el KL medio a la mitad respecto a la versión 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4), con cabeza asistente para decodificación especulativa |
| Parametros totales | 31 mil millones (31B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos int4 con punto cero (GPTQ) en el tronco; activaciones int8; lm_head int8; visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance), fichero único de 19,95 GiB |
| Entradas | Texto, imagen, vídeo |
| Decodificación especulativa | Cabeza asistente de Gemma 4 en bf16, 3 tokens de borrador |
| Versión del fichero | 2.0 (2026-11-16) |
| Tamaño del repo | 42,6 GB |

## Arquitectura y entrenamiento
El modelo subyacente es Gemma 4 31B-it de Google, un transformer denso multimodal con torre de visión y cabeza asistente para decodificación especulativa. Sobre esa base, trohrbaugh aplicó el método ARA (Arbitrary-Rank Ablation) de Heretic para eliminar las direcciones de activación asociadas a rechazos, produciendo la variante heretic-ara. keptn realizó después la cuantización: pesos int4 con punto cero mediante GPTQ sobre el conjunto de calibración `keptn/quant-calibration`, una escala f16 por cada 128 pesos en todas las capas lineales del tronco, activaciones int8 con una escala por token y 128 valores, y lm_head en int8 con escala bf16. La torre de visión se mantiene byte-idéntica a la de Google.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es la combinación de GPTQ con punto cero, activaciones int8 y decodificación especulativa mediante la cabeza asistente de Gemma 4, todo empaquetado en un único fichero optimizado para el motor radiance sobre AMD RDNA4. La versión 2.0 reduce el error de cuantización a la mitad respecto a la 1.0 (KL medio de 0,0248 frente a 0,0529), a costa de un 34 % menos de velocidad de decodificación en cuatro tarjetas.

## Capacidades
- Generación de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Comprensión de imágenes y vídeo mediante la torre de visión de Gemma 4 (byte-idéntica a la original).
- Generación de código y resolución de problemas matemáticos, heredadas del modelo base.
- Tool calling y function calling, según las capacidades del Gemma 4-it original.
- Modo "thinking" activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa con 3 tokens de borrador para acelerar la inferencia.
- Multilingüismo: no disponible (la model card no detalla idiomas).
- Ausencia de rechazos: el modelo responde a peticiones que el original rechazaría (comportamiento intencionado del proceso heretic).

## Casos de uso
- Investigación sobre alineación y seguridad: el modelo permite estudiar qué respuestas produce un Gemma 4 sin mecanismos de rechazo, comparándolo con el original en entornos controlados de laboratorio.
- Evaluación de cuantización int4/int8 sobre AMD: sirve como banco de pruebas para medir la degradación de calidad (KL, perplejidad) y el rendimiento de radiance en RDNA4 con cargas multimodales reales.
- Procesamiento de documentos largos con imagen: gracias a los 262.144 tokens de contexto y a la torre de visión, puede analizar informes escaneados, contratos con figuras o manuales técnicos extensos en una sola pasada.
- Generación de código en pipelines internos: el soporte de tool calling y el modo thinking permiten integrarlo en flujos de CI/CD para revisión automática o generación de parches, siempre que la política de uso lo permita.
- Análisis de vídeo para prototipos: la entrada de vídeo y el contexto largo facilitan la descripción y el resumen de secuencias en herramientas de investigación.
- Despliegue en clústeres AMD de bajo coste: con 1, 2 o 4 tarjetas Radeon AI PRO R9700 de 32 GB se obtienen entre 82,5 y 183,2 tokens/s en decodificación de un solo flujo, adecuado para servicios internos de inferencia.
- Experimentación con decodificación especulativa: la cabeza asistente integrada permite medir el impacto de 3 tokens de borrador en latencia y throughput sobre hardware RDNA4.

## Benchmarks y rendimiento
La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica métricas de fidelidad de cuantización y de velocidad.

| Metrica | Este fichero (v2.0) | v1.0 (w4a8) | keptn/gemma4-31b-heretic-ara-i8g |
|---|---|---|---|
| KL medio | 0,0248 | 0,0529 | 0,00249 |
| KL percentil 99 | 0,337 | 0,732 | 0,0324 |
| Token top idéntico | 95,9 % | 94,4 % | 98,7 % |
| Ratio de perplejidad | ×0,985 | ×1,048 | ×1,006 |

Referencia: modelo heretic bf16 en HF transformers con aritmética fp32, sobre 42.283 tokens de respuesta de MT-Bench (80 preguntas, dos turnos, thinking off).

Velocidad en Radeon AI PRO R9700 a 300 W, radiance 2.1.0, KV i8, 3 tokens de borrador, thinking off, BetterBench 0.6.1, temperatura 0,7 (mediana de tokens por segundo):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un flujo | 82,5 | 128,8 | 183,2 |
| Prefill a 24k tokens | 1.705 | 2.770 | 4.328 |
| 4 flujos, total | 138 | 356 | 477 |

## Requisitos de hardware
- VRAM estimada: el fichero ocupa 19,95 GiB; con KV cache i8 y contexto de 65.536 tokens se recomienda al menos 32 GB por tarjeta. La configuración probada usa 1, 2 o 4 Radeon AI PRO R9700 de 32 GB.
- GPU recomendadas: Radeon AI PRO R9700 (RDNA4). El modelo está empaquetado específicamente para radiance sobre AMD RDNA4; no se documenta soporte en NVIDIA.
- Consumer GPU: no disponible; no se indica compatibilidad con tarjetas de consumo, y el requisito de 32 GB por tarjeta descarta la mayoría de GPUs domésticas.
- Opciones de despliegue: exclusivamente el motor radiance 2.0.0 o superior (imagen Docker `stilldeadcode/radiance:2.0.0`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Configuración: `tp: 1` (una tarjeta, sin p2p), `tp: 2` con `p2p: on` (recomendada), `tp: 4`. Tres tarjetas no funcionan porque las 32 cabezas de atención no se dividen entre tres.
- Contexto máximo práctico: 65.536 tokens con `max-num-seqs: 8`; para los 262.144 tokens completos hay que usar `max-num-seqs: 2`.
- Latencia y throughput: ver tabla de benchmarks (82,5–183,2 tok/s en decode según número de tarjetas; 1.705–4.328 tok/s en prefill a 24k).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| keptn/gemma4-31b-heretic-ara-w4a8 (este) | 31B | 262.144 | `.rad` int4/int8 | Apache 2.0 | AMD RDNA4, radiance |
| keptn/gemma4-31b-heretic-ara-i8g | 31B | 262.144 | `.rad` int8 | Apache 2.0 | AMD RDNA4, radiance |
| trohrbaugh/gemma-4-31b-it-heretic-ara | 31B | 262.144 | bf16 (HF) | Apache 2.0 | GPU con suficiente VRAM, transformers |
| google/gemma-4-31B-it-assistant | 31B | 262.144 | bf16 (HF) | Apache 2.0 | GPU con suficiente VRAM, transformers |

La variante i8g ofrece mayor fidelidad (KL 0,00249 frente a 0,0248) a cambio de un fichero mayor. El modelo bf16 de referencia es el patrón de calidad, pero requiere mucha más memoria. El original de Google incluye rechazos y no ha sido comparado numéricamente en esta model card.

## Limitaciones y advertencias
- El modelo ha sido descensurado deliberadamente: responde a peticiones que el Gemma 4 original rechazaría. El autor declara que el usuario es responsable del uso.
- Riesgo elevado de generar contenido dañino, sesgado o inapropiado; no es apto para aplicaciones de cara al público sin filtros adicionales.
- La memoria no se ha medido con este fichero concreto; se asume equivalente a `keptn/gemma4-31b-a4` por formato, tamaño y capas.
- Las imágenes y el vídeo no se han probado con este fichero, aunque la torre de visión es byte-idéntica a la de Google.
- Los rechazos no se han medido con esta versión; las cifras XSTest y OR-Bench solo existen para la versión 1.0 (w4a8).
- La comparación de calidad es contra el modelo heretic bf16, no contra el original de Google; no se ha ejecutado una comparación con el original.
- La cuantización int4 introduce degradación medible (KL medio 0,0248, 4,1 % de tokens top distintos).
- Solo funciona con radiance 2.0.0+ sobre AMD RDNA4; no hay soporte para otros motores ni para NVIDIA.
- Tres tarjetas no son una configuración válida (32 cabezas de atención no divisibles entre tres).
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero las implicaciones legales y éticas del contenido descensurado recaen en el desplegador.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-heretic-ara-w4a8
- Versión 1.0 (w4a8): https://huggingface.co/keptn/gemma4-31b-heretic-ara-a4/tree/v1.0
- Variante i8g: https://huggingface.co/keptn/gemma4-31b-heretic-ara-i8g
- Modelo base heretic-ara: https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it-assistant
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Guía Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- Heretic: https://github.com/p-e-w/heretic
- Método ARA (PR de Heretic): https://github.com/p-e-w/heretic/pull/211
- Soporte Gemma 4 en radiance (PR #75): https://codeberg.org/StillDeadcode/radiance/pulls/75
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
- Modelo de referencia de cuantización: https://huggingface.co/keptn/gemma4-31b-a4
