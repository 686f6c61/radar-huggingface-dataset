# chaoliangUNSW/Jev-Style-0.8B-Decision-v3

## Resumen

Jev-Style-0.8B-Decision-v3 es un modelo de decisión y clasificación de texto de 0,8B parámetros desarrollado por Chaoliang Yan (usuario chaoliangUNSW), afinado a partir de Qwen/Qwen3.5-0.8B. No es un modelo generativo de propósito general: recibe un texto y un conjunto de opciones fijas y devuelve una probabilidad calibrada para cada opción en un único forward pass. Está orientado a routing de LLM, guardrails, clasificación de intenciones y scoring de elección fija, con despliegue local en portátil o en el propio dispositivo.

La serie Jev-Style se centra en lo que el autor denomina "system-one": decisiones rápidas, de una sola pasada y con calibración explícita, en contraste con el razonamiento multi-paso de los modelos generativos. La versión v3reduce el tamaño a 0,8B (frente a los 2B de v1 y v2) y amplía la ventana de entrada hasta 25.600 tokens, lo que permite clasificar documentos largos completos sin trocear. El modelo se distribuye con licencia Apache-2.0 y pesos safetensors, con un GGUF de 4 bits de 0,53 GB.

Es relevante ahora porque cubre un nicho concreto: inferencia local barata para enrutado y filtrado previo a modelos grandes, con soporte declarado de 19 idiomas y evaluación zero-shot en conjuntos sobre los que no fue entrenado (Banking77, MASSIVE, tweet_topic). Los datos de benchmarks proceden del propio autor y deben leerse con esa cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 text), afinado como modelo de decisión con cabeza de scoring por opción |
| Parametros totales | 752.393.024 (~0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 25.600 tokens de entrada por llamada |
| Tipos de cuantizacion | GGUF 4 bits (0,53 GB); otros formatos no disponibles |
| Idiomas soportados | en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi (19) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,5 GB); GGUF 4 bits disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se afina mediante fine-tuning supervisado para una tarea de clasificación con opciones fijas: dado un texto y un conjunto de etiquetas descritas en lenguaje natural (el autor usa el helper `noul` para asociar cada opción a una descripción), el modelo produce una distribución de probabilidad calibrada sobre las opciones en una sola pasada. El pipeline declarado es `text-classification` y la librería de inferencia es `jev-style`, con backend MLX para Apple silicon y PyTorch para CPU/CUDA.

Los datos de entrenamiento provienen del dataset chaoliangUNSW/MacJev-0.8B-Decision-Data. La model card no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO; tampoco describe innovaciones de atención más allá de la ventana de 25.600 tokens. El autor indica que la release 2B v4 se entrenó en parte con etiquetas suaves destiladas de TypeSafe Jev 1.14 vía API pública, pero esa procedencia es específica de esa release y no se atribuye a la 0.8B v3. La calibración de las probabilidades se presenta como propiedad central del modelo, aunque no se documenta el método exacto de calibración empleado.

## Capacidades

- Clasificación de texto con opciones fijas y probabilidad calibrada por opción en un único forward pass.
- Routing de LLM: selección de modelo o herramienta a partir de la consulta del usuario.
- Guardrails y filtrado previo: decisión sí/no sobre contenido (por ejemplo, detección de temas sensibles o fuera de alcance).
- Procesamiento de documentos largos de hasta 25.600 tokens sin troceado.
- Soporte multilingüe declarado en 19 idiomas, incluidos español, inglés, chino, árabe, hindi, japonés, coreano, ruso, turco y urdu.
- Integración con agentes mediante API compatible con systemone, skills de agente, hook de guardia para Claude Code y herramientas MCP.
- Modo de decisión "system-one": sin cadena de razonamiento explícita, pensado para baja latencia.
- Capacidad de visión: no disponible en esta release (la 0.8B v3 es solo texto; las decisiones sobre recibos o capturas se documentan como caso de uso separado).

## Casos de uso

- Routing de consultas en atención al cliente: el modelo recibe el mensaje del usuario y un conjunto de categorías (facturación, envíos, cancelaciones) y devuelve la probabilidad de cada una en una pasada, lo que permite derivar el ticket al equipo o al modelo adecuado con latencia de milisegundos.
- Guardrails en producción: clasificación sí/no de prompts antes de enviarlos a un LLM grande, bloqueando contenido fuera de política con un coste de cómputo muy inferior al de un modelo generativo.
- Clasificación de tickets y correos largos: gracias a los 25.600 tokens de entrada, puede etiquetar hilos de correo o documentos completos sin dividirlos en fragmentos y sin perder contexto entre trozos.
- Selección de herramienta en agentes: dado el estado de una conversación y el catálogo de herramientas disponibles, el modelo puntúa qué herramienta invocar, integrándose en pipelines de agentes mediante MCP o la API compatible con systemone.
- Enrutado multilingüe: con 19 idiomas declarados, permite clasificar consultas en español, árabe, hindi o tailandés con un único modelo en lugar de mantener clasificadores por idioma.
- Despliegue en el dispositivo: con 0,53 GB en GGUF 4 bits y backend MLX o PyTorch, puede ejecutarse en portátiles Apple silicon o en CPU para clasificación local sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Evaluación de intenciones en investigación: scoring zero-shot sobre conjuntos como Banking77 o MASSIVE para comparar clasificadores ligeros frente a modelos mayores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación zero-shot, es decir, sobre conjuntos no vistos en entrenamiento):

| Benchmark | Jev-Style v3 0.8B | Mejor checkpoint oficial de Laya |
|---|---:|---:|
| Banking77, 77 intenciones (nunca entrenado) | 68,2% | 49,2% |
| MASSIVE intent, 37 idiomas retenidos | 65,5% | 36,1% |
| tweet_topic, zero-shot | 75,5% | 63,2% |
| JevBench v1.4.1, 231 ítems públicos, zero-shot | 64,1% | 58,4% |
| Entrada máxima por llamada | 25.600 tokens | 1.024 por defecto |

El autor indica que los intervalos de confianza pareados al 95% excluyen el cero para Banking77 y MASSIVE, mientras que la ventaja en JevBench queda dentro del intervalo de confianza de v3 (diferencia de estimación puntual). También señala que la API de Jev supera a v3 en precisión en estos conjuntos cuando su resultado está publicado. En una prueba con 1.280 ítems reales de 24K tokens, v3 responde correctamente el 98,3% y la precisión se mantiene plana entre 1K y 24K tokens. No se han publicado resultados de MMLU, HumanEval ni GSM8K, y no procede extrapolarlos porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,53 GB en GGUF 4 bits; en safetensors de precisión completa, alrededor de 1,5 GB de pesos más overhead de activaciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más; también en CPU y en Apple silicon vía MLX.
- Despliegue: paquete `jev-style` con extras `[mlx]` (Apple silicon) o `[torch]` (CPU/CUDA), comando `jev-style serve --release 0.8b`; también `transformers` con la librería `jev-style`. No se documentan integraciones con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; el diseño de una sola pasada sin generación implica latencias muy inferiores a las de un LLM generativo del mismo tamaño, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento publicado |
|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3 | ~0,75B | 25.600 tokens | Apache-2.0 | Clasificación y routing con probabilidad calibrada | Banking77 68,2%; MASSIVE 65,5% |
| Laya (mejor checkpoint oficial) | no disponible | 1.024 tokens por defecto (512 en inglés) | no disponible | Clasificación multilingüe | Banking77 49,2%; MASSIVE 36,1% |
| Jev-Style 2B v2 | 2B | prompt menor que 25.600 tokens | Apache-2.0 | Clasificación y routing | no disponible en esta ficha |
| TypeSafe Jev 1.14 (API) | no disponible | 8.192 tokens (API 2B v4) | servicio hospedado | Decisión vía API | superior a v3 en los conjuntos citados según el autor |

La comparación con Laya procede de la reevaluación del propio autor sobre las mismas filas y con las temperaturas publicadas por Laya; conviene tratarla como evidencia del autor, no como evaluación independiente. No se dispone de comparación con clasificadores ligeros tipo DeBERTa o con routers comerciales.

## Limitaciones y advertencias

- Modelo de clasificación, no generativo: no produce texto libre ni código; usarlo como LLM general dará resultados pobres.
- Los benchmarks son autoinformados por el autor y en parte comparan contra checkpoints reevaluados por él mismo; no hay validación independiente en la información disponible.
- Riesgo de alucinación de etiquetas: al trabajar con opciones fijas, el modelo puede asignar alta probabilidad a opciones semánticamente plausibles pero incorrectas si las descripciones de las opciones son ambiguas.
- La calibración declarada no está documentada con métricas como ECE o Brier score; en producción conviene validar la calibración sobre datos propios antes de fijar umbrales.
- Cobertura idiomática declarada de 19 idiomas, pero sin métricas por idioma publicadas; el rendimiento en idiomas de bajos recursos puede ser inferior.
- La ventana de 25.600 tokens es la máxima por llamada; no se documenta el coste computacional ni la degradación con entradas cercanas al límite más allá de la prueba de 24K tokens citada.
- La release 0.8B v3 es solo texto; no soporta visión pese a que la documentación del proyecto menciona casos de uso con capturas para otras releases.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no tener afiliación ni respaldo de TypeSafe; la procedencia de datos de entrenamiento de la release 2B v4 (destilación vía API) es específica de esa release y no debe asumirse para la 0.8B v3.
- El servicio hospedado es independiente de la inferencia local y sirve el modelo 2B v4, no este 0.8B; no confundir ambos caminos de ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/chaoliangUNSW/MacJev-0.8B-Decision-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub: https://github.com/lawrence3699/jev-style
- Página del modelo en el sitio del proyecto: https://jevstyle.com/models/0-8b-v3/
- Guía de instalación local: https://jevstyle.com/guides/run-locally/
- Guía de clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Guía de routing local y Apple silicon: https://jevstyle.com/guides/local-decision-models/
- Casos de uso de decisión con visión (otras releases): https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio hospedado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
- Colección de builds y demos v3: https://huggingface.co/collections/chaoliangUNSW/jev-style-08b-decision-v3-6ab58abb90ae4b7b55578b3e
- Release v1 2B (GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Release v2 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
