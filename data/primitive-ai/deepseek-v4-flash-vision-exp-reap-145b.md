# primitive-ai/DeepSeek-V4-Flash-Vision-Exp-REAP-145B

## Resumen

DeepSeek-V4-Flash-Vision-Exp-REAP-145B es un artefacto de poda de expertos (expert pruning) creado por primitive-ai a partir del modelo multimodal DeepSeek-V4-Flash-Vision-Exp de DeepSeek. El modelo original tiene 284 000 millones de parámetros y ocupa 167,8 GB, con los expertos ya cuantizados en MXFP4 (4 bits) de origen, lo que impide reducir aún más su huella mediante cuantización adicional y hace que no exista ninguna versión ejecutable en una sola GPU. Este artefacto elimina la mitad de los expertos enrutados (128 de 256) mediante la técnica REAP, reduciendo el peso a 83,3 GB y permitiendo servirlo en una única tarjeta de 96 GB con vLLM estándar.

La poda se basa en el plan REAP publicado por ludo-tech para la variante solo texto del modelo, pero se ha transplantado sobre los pesos de la versión Vision-Exp, recalculando las tablas hash de enrutamiento (`tid2eid`) a partir de los tensores de puerta de este checkpoint concreto. El resultado es un modelo de 145 800 millones de parámetros que, por limitación del runtime actual de vLLM, solo sirve texto (la torre de visión se conserva en un archivo separado pero no se carga). Su relevancia radica en que es la primera vía práctica para ejecutar la arquitectura DeepSeek V4 Flash en una sola GPU de gama alta, con rendimiento medido de 73,1 tokens por segundo en modo monousuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con enrutamiento hash en capas 0-2, atención latente multi-cabezal (MLA) con caché KV en FP8 |
| Parametros totales | 145 799 322 711 (145,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | Configuracion de servicio recomendada: 20 480 tokens; maximo del modelo base no disponible |
| Tipos de cuantizacion | MXFP4 (expertos, de origen), FP8 (atencion y caché KV) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards de 83,3 GB + vision_tower.safetensors) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp es una arquitectura MoE con 256 expertos enrutados, atención latente multi-cabezal (MLA) y un mecanismo de predicción multi-token (MTP) que este artefacto elimina. Los expertos se distribuyen con cuantización MXFP4 de origen y la atención usa FP8, incluida la caché KV en formato `fp8_ds_mla`, un diseño de latente comprimido que no admite otros esquemas de cuantización de caché como TurboQuant. Las tres primeras capas utilizan tablas hash de enrutamiento fijas (`tid2eid`) en lugar de puertas aprendidas.

El proceso REAP (pruning de expertos) conserva 128 de los 256 expertos enrutados, eliminando la mitad sin requantizar a los supervivientes: la poda solo retira parámetros, nunca los reescribe. El plan de poda se toma del repositorio de ludo-tech, que lo calculó sobre la base solo texto del 31 de julio, y se transplantan a los pesos Vision-Exp recalculando las tablas hash contra los tensores de puerta de este checkpoint. Los tensores de puerta específicos de la variante visión (`gate.bias` en capas hash y `gate.bias_vl` en todas las capas) se recortan a los expertos conservados y se almacenan en `vision_tower.safetensors` junto con la torre de visión y el proyector, fuera del índice de pesos principal, a la espera de que vLLM implemente soporte de visión para esta arquitectura. No se realizó ningún entrenamiento adicional: el artefacto es exclusivamente el resultado de poda estructural.

## Capacidades

- Generación de texto y razonamiento de cadena larga: el modelo produce respuestas extensas (media de 2761 tokens por respuesta en las suites de evaluación) con un modo de pensamiento activado por defecto.
- Razonamiento matemático y científico: resultados destacados en GSM8K (100,0) y ARC-Challenge (90,7) en las pruebas internas del autor.
- Tool calling y function calling: soporte nativo para invocación de herramientas, con una precisión de llamada del 81,9 % en la suite de 200 ítems del autor.
- Capacidad de abstención: el modelo rara vez declina invocar una herramienta cuando no corresponde (45,0 en la métrica de abstención), lo que puede ser problemático en flujos que penalicen llamadas espurias.
- Conocimiento factual: 82,7 de puntuación estricta y 88,7 en respuestas completadas en la suite de conocimiento de 1170 ítems.
- Multilingüismo: no se han publicado datos sobre los idiomas soportados en la información disponible.
- Visión: el modelo base es multimodal, pero este artefacto solo sirve texto por limitación del runtime vLLM; la torre de visión se conserva en el repositorio pero no se carga.

## Casos de uso

- Atención al cliente automatizada con contexto largo: con una ventana de servicio de 20 480 tokens, puede gestionar conversaciones multi-turno extensas manteniendo el historial completo, aunque su tendencia a respuestas verbosas debe tenerse en cuenta para controlar la latencia.
- Agentes con tool calling en producción: su precisión de llamada del 81,9 % lo hace utilizable como motor de agentes que consultan APIs, bases de datos o servicios externos, siempre que el flujo tolere llamadas espurias ocasionales.
- Generación de código asistida: el razonamiento matemático y la capacidad de seguir instrucciones complejas permiten usarlo en asistentes de programación, integrable en entornos de desarrollo mediante vLLM.
- Análisis de documentos técnicos y científicos: su conocimiento factual y su capacidad de razonamiento largo lo habilitan para resumir y extraer conclusiones de textos extensos, con la advertencia de verificar las citas por riesgo de alucinación.
- Evaluación y validación de modelos: al ser un artefacto de poda reproducible y con licencia MIT, sirve como banco de pruebas para estudiar el impacto de la poda de expertos en el rendimiento de tareas específicas.
- Despliegue en infraestructura de una sola GPU: organizaciones con una única tarjeta de 96 GB pueden servir un modelo de la familia DeepSeek V4 sin recurrir a clústeres, con throughput agregado de 150-172 tokens por segundo en modo batch.

## Benchmarks y rendimiento

El autor publicó resultados de sus propias suites de evaluación, ejecutadas en una RTX PRO 6000 Blackwell de 96 GB, con temperatura 0,6, top_p 0,95, top_k 20, pensamiento activado y presupuesto de 16 384 tokens. No se incluye columna de comparación con el modelo sin podar porque este no cabe en el hardware de prueba.

| Suite | Puntuacion |
|---|---|
| Conocimiento, estricto (1170 items; truncados = 0) | 82,7 |
| Conocimiento, solo completados (n=1067) | 88,7 |
| Tasa de completado de conocimiento | 91,2 % |
| Tool calling combinado (200 items) | 74,5 |
| Precision de llamada (160 filas de llamada) | 81,9 |
| Abstencion (40 filas sin llamada) | 45,0 |
| GSM8K | 100,0 |
| ARC-Challenge | 90,7 |
| MMLU-Pro (solo completados) | 90,8 |

Rendimiento medido en la misma GPU:

| Configuracion | tok/s @ 1 | tok/s @ 16 | TTFT |
|---|---|---|---|
| Graphs 20K (seqs 4), 2K entrada / 256 salida | 73,1 | — | ~220 ms @ 1 |
| Graphs 8K (seqs 8), 2K entrada / 256 salida | 75,7 | — | 217 ms @ 1 |
| Eager 20K (seqs 16), 8K entrada / 512 salida, sin caché | 13,9 | 150,5 / 171,9 | 864 ms @ 1, 1,86 s @ 16 |

Durante 4,3 horas de servicio continuo no se registró ningún error de petición.

## Requisitos de hardware

- VRAM necesaria: 96 GB para los pesos (83,3 GB) más espacio de activaciones y contexto; la configuración recomendada exige `--gpu-memory-utilization 0.95`.
- GPU compatible: una tarjeta Blackwell de 96 GB, concretamente la RTX PRO 6000 Blackwell usada en las pruebas. No cabe en GPUs de consumo habitual (RTX 4090 con 24 GB, RTX 5090 con 32 GB).
- vLLM 0.28.0 o superior es obligatorio: versiones anteriores fallan en Blackwell de clase RTX (SM120) en cinco capas distintas del stack (DeepGEMM, cutlass, triton y tilelang).
- Opciones de despliegue: vLLM es el único runtime soportado. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Parámetros de servicio críticos: `--kv-cache-dtype fp8` es obligatorio (la arquitectura no acepta otro formato), y los límites de batching (`--max-num-batched-tokens`, `--max-num-seqs`) deben ajustarse con precisión para que el contexto quepa en memoria.
- Las CUDA graphs multiplican por 5 el rendimiento monousuario (75,7 frente a 13,9 tok/s en modo eager), pero exigen reducir el espacio de activaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 284 B | 167,8 GB | no disponible | MIT | Requiere multiples GPUs |
| DeepSeek-V4-Flash-REAP-145B-A13B (ludo-tech) | 145 B | no disponible | no disponible | MIT | Solo texto, plan de poda sin pesos Vision-Exp |
| DeepSeek-V4-Flash-Vision-Exp-REAP-145B (este) | 145,8 B | 83,3 GB | 20 480 (config) | MIT | Una GPU de 96 GB, solo texto |

No se dispone de benchmarks comparativos entre estos modelos en las mismas condiciones. El autor señala que la precisión de llamada a herramientas (81,9) supera a varios modelos sin podar en su propio leaderboard de la misma caja, pero no publica los datos de esos modelos.

## Limitaciones y advertencias

- Sin soporte de visión activo: aunque el modelo base es multimodal, vLLM no tiene implementado el camino de visión para esta arquitectura, por lo que el artefacto solo sirve texto. La torre de visión se conserva pero no se carga.
- Abstención deficiente: el modelo rara vez declina invocar herramientas (45,0 en la métrica de abstención), lo que puede generar llamadas espurias en flujos que no las penalicen explícitamente.
- Verbosidad alta: la respuesta media supera los 2700 tokens, y el 8,8 % de los ítems de evaluación agotó el presupuesto de 16 384 tokens. Esto afecta a la latencia y al coste por petición.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación; el modelo debe usarse con verificación externa en tareas factuales.
- Requisitos de hardware estrictos: necesita una GPU de 96 GB y vLLM 0.28.0 o superior; no es ejecutable en hardware de consumo ni en runtimes alternativos.
- MTP eliminado: la predicción multi-token del modelo base se descarta, lo que puede reducir el rendimiento de decodificación en comparación con el original.
- Sin datos de entrenamiento: al ser un artefacto de poda, no se ha realizado ningún ajuste posterior; el comportamiento refleja exclusivamente el modelo base con la mitad de expertos eliminados.
- Idiomas y contexto máximo del modelo base no documentados en la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/primitive-ai/DeepSeek-V4-Flash-Vision-Exp-REAP-145B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Plan REAP de ludo-tech: https://huggingface.co/ludo-tech/DeepSeek-V4-Flash-REAP-145B-A13B
- Guía práctica del modelo base: https://codepick.dev/en/guides/deepseek-v4-flash-vision-guide/
- Anuncio de DeepSeek sobre V4 Flash Vision: https://deepseek.ai/blog/deepseek-v4-rollout-flash-vision-pricing-harness-2026-guide
- Cobertura del lanzamiento: https://emergent.sh/news/deepseek-v4-flash-vision-exp-officially
- Análisis de costes y benchmarks del modelo base: https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
