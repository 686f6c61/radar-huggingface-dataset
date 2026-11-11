# logitshq/DeepSeek-V4.1-Flash-Abliterated

## Resumen

DeepSeek V4.1 Flash Abliterated es una variante del checkpoint DeepSeek V4.1 Flash (commit `1bae0e10`, en FP8 con expertos enrutados en FP4) a la que el equipo de Logits ha aplicado una edición de pesos a lo largo de la "dirección de rechazo" (abliteration). El objetivo es eliminar la tendencia del modelo base a declinar peticiones dañinas sin degradar de forma apreciable sus capacidades generales. El resultado se sirve exclusivamente a través de la API de Logits bajo el identificador `logits/deepseek-v4.1-flash-abliterated`; los pesos no se han publicado.

La relevancia de esta ficha es doble. Por un lado, documenta una intervención de alineación inversa con mediciones cuantitativas de rechazo y de capacidad emparejadas sobre el mismo conjunto de preguntas. Por otro, es un caso claro de modelo "API-only": el repositorio de Hugging Face contiene únicamente la model card y los resultados, no los tensores, lo que condiciona por completo las opciones de despliegue y auditoría.

El modelo conserva las capacidades del base: razonamiento, tool calling, entrada de imágenes y logprobs, con un contexto máximo de 1.048.576 tokens y hasta 393.216 tokens de salida a través de la API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del checkpoint base DeepSeek V4.1 Flash; el autor no la detalla en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el checkpoint base usa expertos enrutados en FP4, lo que sugiere arquitectura MoE, pero no se confirma el recuento) |
| Longitud de contexto | 1.048.576 tokens (límite de la API) |
| Tipos de cuantizacion | no disponible para descarga; el checkpoint base está en FP8 con expertos enrutados en FP4 |
| Idiomas soportados | no disponible (la evaluación incluye pruebas en chino e inglés) |
| Licencia | logits-terms (https://logits.com/terms) |
| Formato de pesos | no disponible; pesos no publicados, acceso solo vía API |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de indicar que el checkpoint de partida es DeepSeek V4.1 Flash en FP8 con expertos enrutados en FP4, lo que apunta a un transformer con mezcla de expertos. Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el base. Toda esa información correspondería a la documentación de DeepSeek, no a este repositorio.

La innovación técnica documentada es la abliteration: una edición de pesos dirigida a lo largo de la dirección de rechazo, aplicada sobre el checkpoint base. El autor reporta el efecto con evaluaciones emparejadas sobre las mismas preguntas, con intervalos de confianza bootstrap al 95 %, juez automático Qwen3Guard-Gen-8B y temperatura 0 salvo indicación contraria. La reducción de rechazos es drástica: en JailbreakBench dañino pasa del 94 % al 1 %, en HarmBench (sin química ni biología) del 84,9 % al 0,6 %, y en peticiones dañinas incrustadas en una imagen del 96 % al 1 %. En paralelo, las caídas de capacidad medidas son pequeñas y en su mayoría no significativas.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con modo de pensamiento (thinking) configurable; la evaluación de rechazos con thinking activo se hizo con un presupuesto de 4.096 tokens.
- Tool calling y function calling, con los mismos parámetros que `deepseek/deepseek-v4.1-flash`.
- Entrada de imágenes (evaluado en MMMU-Pro con 1.730 preguntas y en un conjunto de 50 preguntas de imagen con respuesta exacta).
- Soporte de logprobs a través de la API.
- Capacidad multilingüe al menos en inglés y chino, según los conjuntos de evaluación empleados (JailbreakBench en chino).
- Compatibilidad con el SDK de OpenAI apuntando a `https://api.logits.com/v1`.
- Contexto muy largo: hasta 1.048.576 tokens de entrada y 393.216 de salida por petición.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un sistema con la dirección de rechazo suprimida y compararlo con el original sobre los mismos conjuntos (JailbreakBench, HarmBench, XSTest), con métricas publicadas y reproducibles.
- Evaluación de robustez de filtros externos: al rechazar solo el 1 % de peticiones dañinas, sirve para probar si una capa de moderación propia (clasificadores, listas de bloqueo, guardrails) aguanta cuando el modelo subyacente no filtra nada.
- Red teaming controlado: útil para generar respuestas a peticiones que el modelo base declinaría, en entornos de prueba cerrados y con revisión humana.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto, encaja en tareas de análisis de expedientes, contratos o bases de código completas en una sola petición.
- Agentes con tool calling: el resultado en tau2-bench airline sube de 66,3 a 71,3, lo que respalda su uso en flujos de atención al cliente con herramientas y múltiples turnos.
- Asistentes multimodales: la entrada de imágenes con una caída de solo 0,4 puntos en MMMU-Pro permite usarlo en extracción de datos de capturas, facturas o interfaces.
- Generación de código y matemáticas en pipelines: GSM8K sube de 95,4 a 96,4 y AIME 2025 de 96,3 a 96,7, por lo que es apto para tareas de resolución de problemas con verificación posterior.

## Benchmarks y rendimiento

Capacidad, diferencia abliterated menos original, emparejada sobre las mismas preguntas, con intervalo bootstrap del 95 %:

| Benchmark | Items | Original → abliterated | Diferencia (IC 95 %) |
|---|---|---|---|
| GPQA Diamond | 198 × 3 | 92,1 → 92,3 | +0,2 (−1,0; +1,4) |
| AIME 2025 | 30 × 8 | 96,3 → 96,7 | +0,4 (0,0; +1,0) |
| MMMU-Pro, imágenes | 1.730 | 79,85 → 79,4 | −0,4 (−1,7; +0,9) |
| IFBench, prompt strict | 282 | 75,35 → 73,8 | −1,6 (−4,8; +1,6) |
| tau2-bench airline | 50 × 3 | 66,3 → 71,3 | +5,0 (−0,3; +11,0) |
| MMLU-Pro | 12.032 | 88,1 → 87,3 | −0,8 (−1,2; −0,5) |
| SimpleQA-Verified | 1.000 | 43,7 → 42,8 | −0,9 (−3,4; +1,5) |

Ejecuciones únicas a temperatura 0, sin intervalo:

| Benchmark | Items | Original → abliterated |
|---|---|---|
| MMLU | 1.000 | 87,7 → 87,8 |
| GSM8K | 500 | 95,4 → 96,4 |
| IFEval, prompt strict | 541 | 88,9 → 88,2 |
| Preguntas de imagen con respuesta exacta | 50 | 96 → 94 |

Rechazos, original → abliterated, con Qwen3Guard-Gen-8B como juez:

| Prueba | Respuestas juzgadas | Original → abliterated |
|---|---|---|
| JailbreakBench dañino | 100 | 94 % → 1 % |
| HarmBench, sin química ni biología | 172 | 84,9 % → 0,6 % |
| JailbreakBench dañino, chino | 100 | 95 % → 1 % |
| Petición dañina dentro de una imagen | 100 | 96 % → 1 % |
| Dañino con thinking, respuestas terminadas | 30 y 19 | 96,7 % → 0 % |
| XSTest, prompts seguros | 250 | 6 % → 0 % |
| JailbreakBench benigno | 100 | 11 % → 0 % |
| Peticiones fuera de tema rechazadas, con instrucción de sistema | 40 | 95 % → 75 % |
| Peticiones en tema rechazadas por error | 40 | 0 % → 0 % |

El autor señala que la caída de −0,8 en MMLU-Pro es el único intervalo que excluye el cero y que equivale aproximadamente a la variación de un punto que el original mostró en los benchmarks ejecutados dos veces. En tau2-bench el original hizo de cliente para ambos modelos, por lo que las cifras no son comparables con las públicas del benchmark. En ciberseguridad no se observó cambio medible en ocho resultados, porque el original ya rechazaba poco estas tareas.

## Requisitos de hardware

- Inferencia local: no es posible. Los pesos no se han publicado y el acceso es exclusivamente a través de la API de Logits.
- VRAM estimada: no aplica; no hay checkpoint descargable ni cuantizaciones publicadas.
- GPU recomendadas: no aplica para despliegue propio; el cómputo lo asume la infraestructura de Logits.
- GPU de consumo: no aplica.
- Opciones de despliegue: cliente HTTP compatible con el SDK de OpenAI contra `https://api.logits.com/v1`; no hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no existen pesos.
- Latencia y throughput: no disponibles en la información proporcionada. Los límites de contexto (1.048.576 tokens de entrada, 393.216 de salida) y el precio figuran en la página de precios y en la documentación de Logits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos en JailbreakBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek V4.1 Flash Abliterated (Logits) | no disponible | 1.048.576 | 1 % | logits-terms | Solo API de Logits |
| DeepSeek V4.1 Flash (original) | no disponible | no disponible en esta ficha | 94 % | según DeepSeek | Checkpoint en Hugging Face (`deepseek-ai/DeepSeek-V4.1-Flash-1017`) |
| Otras variantes abliterated de la familia DeepSeek | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: misma arquitectura y mismos parámetros, con una diferencia de 93 puntos porcentuales en tasa de rechazo y variaciones de capacidad de entre −1,6 y +5,0 puntos, según la tabla anterior. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están publicados: no se puede auditar el checkpoint, verificar la edición de pesos ni ejecutar el modelo fuera de la API de Logits.
- La supresión de la dirección de rechazo es deliberada y prácticamente total en las pruebas reportadas (1 % en JailbreakBench dañino). No debe desplegarse en aplicaciones de cara al público sin una capa de moderación externa.
- El modelo sigue rechazando el 75 % de las peticiones fuera de tema cuando el prompt de sistema lo indica, frente al 95 % del original, pero no hay garantía de que respete instrucciones de alcance en todos los casos.
- La licencia `logits-terms` es propietaria; hay que revisar sus condiciones en https://logits.com/terms antes de cualquier uso comercial.
- La evaluación de capacidad se hizo con un tope de 131.072 tokens de salida y esfuerzo de razonamiento alto; el comportamiento con otros ajustes puede diferir.
- La prueba de thinking solo contó respuestas terminadas dentro de un presupuesto de 4.096 tokens: 19 de 30 en el modelo abliterado frente a 30 de 30 en el original, lo que introduce un sesgo de selección en esa fila.
- Riesgo de alucinación: SimpleQA-Verified baja de 43,7 a 42,8, en línea con el original; el modelo no es fiable como fuente factual sin verificación.
- Idiomas soportados no documentados; la evaluación multilingüe se limita a chino e inglés.
- Al ser un servicio API, la disponibilidad, latencia y precio dependen del proveedor y pueden cambiar sin previo aviso.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, y no incluye pipeline declarado: no hay comunidad ni soporte más allá de la documentación del proveedor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logitshq/DeepSeek-V4.1-Flash-Abliterated
- Checkpoint base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Commit del checkpoint base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/1bae0e1088993b9b82de08f59de5be5a34e42170
- Resultados completos de la abliteration: https://logits.com/benchmarks/abliterated
- Documentación de la API: https://logits.com/docs#models
- Precios: https://logits.com/pricing
- Términos de licencia: https://logits.com/terms
- Sitio del proveedor: https://logits.com
