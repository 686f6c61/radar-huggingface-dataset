# ankit373/qwen3.5-0.8b-langconf-edit-c02

## Resumen

`ankit373/qwen3.5-0.8b-langconf-edit-c02` es un diff de pesos estático para el modelo base `Qwen/Qwen3.5-0.8B`. No es un modelo completo: es un parche quirúrgico que modifica una única columna de una única matriz del modelo base (la columna 1047 de `model.layers.15.mlp.down_proj.weight`), es decir, 1024 de los 3.670.016 parámetros de ese tensor. El objetivo del edit es reducir la confusión lingüística cruzada: el fenómeno por el cual se pide al modelo en inglés que responda en otro idioma y este responde igualmente en inglés.

El diff fue generado sin entrenamiento, mediante edición de pesos guiada por un editor automático (Claude Opus 5.5) que podía leer los pesos y ejecutar pases forward sobre un split de desarrollo, pero no entrenar ni modificar prompts o hooks en tiempo de ejecución. El autor humano verificó todas las cifras. El modelo base es Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parámetros con licencia Apache 2.0 y soporte para 15 idiomas.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de edición de pesos (weight diff) aplicable a modelos pequeños con recursos limitados; por otro, proporciona métricas concretas sobre el benchmark LCB (Language Confusion Benchmark) que permiten evaluar si el parche merece la pena frente a alternativas como el steering en tiempo de inferencia o la reubicación de la instrucción al final del prompt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), edición puntual de pesos |
| Parámetros totales | 0,8 mil millones (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el diff se distribuye en bf16; el base admite las cuantizaciones habituales de Qwen3.5) |
| Idiomas soportados | en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `diff.safetensors` (valores completos del tensor editado, no delta) + `manifest.json` con hashes SHA-256 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer denso de 0,8 mil millones de parámetros. El diff no entrena nada: reescribe la columna 1047 de la matriz `down_proj` de la capa MLP 15. La unidad MLP 1047 está activa en el 99,2% de las posiciones (media 0,514, desviación típica 0,119), por lo que su columna de salida funciona de facto como un sesgo. La nueva columna introduce un desplazamiento fijo de aproximadamente -2d en cada posición, donde d es la diferencia media de residuo entre prompts fallidos y superados en el split de desarrollo tras la capa 15.

El diff almacena el valor completo del tensor editado, no un delta, y el `manifest.json` incluye los hashes SHA-256 del tensor base y del tensor editado para verificación. El proceso de edición fue realizado por Claude Opus 5.5 como editor ciego, con acceso de lectura a los pesos y capacidad de ejecutar pases forward sobre el split de desarrollo, pero sin capacidad de entrenar, usar hooks en tiempo de ejecución, cambiar prompts ni leer correcciones previas. Una auditoría del transcript confirmó que no hubo lecturas prohibidas.

## Capacidades

- Generación de texto multilingüe en 15 idiomas, con reducción de la confusión lingüística cruzada respecto al modelo base.
- Razonamiento y respuesta a instrucciones en el idioma solicitado, incluso cuando la instrucción se formula en inglés.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (generación, razonamiento básico, código y matemáticas a escala de 0,8B).
- No se documentan capacidades de tool calling, function calling, agentes o multi-step reasoning en la información disponible.
- No se documentan capacidades de visión ni audio.
- El edit está diseñado para el template de chat no-thinking con temperatura 0,3, top_p 0,75, top_k 20 y máximo 100 tokens nuevos.

## Casos de uso

- **Asistentes multilingües con instrucción en inglés**: en aplicaciones donde el usuario escribe la instrucción en inglés pero espera la respuesta en otro idioma (por ejemplo, un panel de control en inglés que genera respuestas en español para el usuario final), el edit reduce la tasa de respuestas en inglés no deseadas del 10,7% al 0,9% de fallos completos en el benchmark LCB.
- **Sistemas de traducción asistida o generación de contenido localizado**: el modelo puede recibir un prompt en inglés y producir texto en el idioma destino con mayor fidelidad, lo que simplifica pipelines que no quieren duplicar prompts por idioma.
- **Chatbots de atención al cliente en mercados mixtos**: para empresas que operan con equipos internos en inglés pero clientes en varios idiomas, el edit permite mantener un único prompt de sistema en inglés y obtener respuestas en el idioma del cliente.
- **Evaluación de técnicas de edición de pesos**: el diff sirve como caso de estudio reproducible para investigadores que quieran comparar edición estática de pesos frente a steering en tiempo de inferencia (ReCoVeR) o reubicación de instrucciones.
- **Despliegue en hardware de consumo**: al tratarse de un modelo de 0,8B, el base más el diff puede ejecutarse en GPUs de consumo con cuantización, lo que lo hace adecuado para prototipos y entornos con recursos limitados.
- **Generación de datos sintéticos multilingües**: el modelo puede producir corpus en varios idiomas a partir de instrucciones en inglés, con menor riesgo de contaminación cruzada de idioma en los datos generados.

## Benchmarks y rendimiento

Resultados en el Language Confusion Benchmark (LCB, arXiv:2406.20052), split de test con 2100 prompts (714 en el conjunto complejo), semillas 1 y 2, template no-thinking, temperatura 0,3, top_p 0,75, top_k 20, máximo 100 tokens nuevos, bf16:

| Método | LPR complejo | LPR total | Fallos completos % | Bucles % |
|---|---|---|---|---|
| Modelo base | 62,9 / 62,3 | 83,5 / 83,4 | 10,7 / 10,8 | 3,95 / 3,62 |
| Instrucción movida al final | 77,6 / 78,5 | 89,7 / 89,6 | 4,5 / 4,6 | 2,76 / 3,10 |
| ReCoVeR steering, alpha 0,03 | 94,8 / 94,1 | 95,7 / 95,6 | 0,2 / 0,0 | 3,62 / 4,24 |
| Este edit (c02) | 93,0 / 92,0 | 96,1 / 95,9 | 0,9 / 1,3 | 4,38 / 5,14 |
| 3 edits aleatorios, misma columna y norma | 56,9 a 66,0 | 79,7 a 84,5 | 9,9 a 15,1 | 3,19 a 4,19 |

Por dataset en test, semilla 1: okapi 96,4 a 97,5; sharegpt 91,3 a 97,7.

Agregado sobre ambas semillas, c02 menos ReCoVeR en LPR complejo es -1,9 puntos, intervalo de confianza al 95% por bootstrap de clúster [-5,2, +1,1]. Los fallos completos sobre todos los prompts son superiores para c02: +0,9 puntos, [+0,4, +1,6].

Comprobaciones laterales:
- MMLU-Redux 2.0 (5330 ítems, greedy): 51,69 base, 51,67 editado. Diferencia -0,02, IC 95% [-0,64, +0,60], McNemar p = 1,0.
- LCB monolingüe (2400 prompts): LPR 97,6 base, 97,3 editado. Solo en prompts en inglés cae de 99,0 a 92,5.

Guardas frente a respuestas del modelo base: límites de +1 punto en vacíos, +2 puntos en bucles y +1,0 nat por token en NLL media. En dev: 0,0% vacíos, 2,73% bucles (+1,53), NLL media 0,953 (+0,154), pasa. En test: 0,0% vacíos, 4,38% bucles (+0,43), NLL media 0,931 (+0,167), pasa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en bf16 requiere aproximadamente 1,6 GB solo para pesos; con overhead de activaciones y KV cache, entre 2 y 4 GB según longitud de contexto. En cuantización de 8 bits, alrededor de 1 GB; en 4 bits, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son válidas. Para cuantización 4 bits, cabe en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas con 4 GB o más.
- Opciones de despliegue: transformers (versión 5.22.1 y torch 2.15.0 según el estudio), llama.cpp, Ollama, vLLM y TGI son opciones habituales para el modelo base; el diff debe aplicarse primero con el script proporcionado y guardarse como modelo completo antes de convertirlo a GGUF u otros formatos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LPR complejo (LCB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B base | 0,8B | No disponible | 62,9 / 62,3 | Apache 2.0 | Hugging Face |
| Este edit (c02) | 0,8B (diff) | No disponible | 93,0 / 92,0 | Apache 2.0 | Hugging Face |
| ReCoVeR steering (alpha 0,03) | 0,8B (intervención en inferencia) | No disponible | 94,8 / 94,1 | No disponible | No disponible como modelo publicado |
| Instrucción al final (cambio de prompt) | 0,8B | No disponible | 77,6 / 78,5 | No aplica | Técnica de prompting |

La comparativa se limita al mismo modelo base y a intervenciones sobre él, ya que no se dispone de datos de benchmarks de otros modelos de 0,8B en el mismo protocolo LCB. ReCoVeR obtiene mejor LPR complejo pero peor LPR total y más bucles; el edit c02 obtiene mejor LPR total pero más fallos completos y más bucles que ReCoVeR.

## Limitaciones y advertencias

- El diff no es un modelo completo: requiere el modelo base en la revisión exacta `2fc06364715b967f1860aea9cf38778875588b17`. Aplicarlo sobre otra revisión puede invalidar los hashes y el comportamiento.
- El edit solo modifica una columna de una matriz; su efecto es un desplazamiento fijo y no aprende representaciones nuevas. No corrige otros sesgos ni mejora capacidades generales.
- Los fallos completos sobre todos los prompts son ligeramente superiores a ReCoVeR (+0,9 puntos, IC [+0,4, +1,6]) y los bucles aumentan respecto al base (+0,43 puntos en test).
- En prompts monolingües en inglés, el LPR cae de 99,0 a 92,5, lo que indica un coste en el idioma inglés a cambio de mejorar la fidelidad al idioma solicitado.
- El modelo base de 0,8B tiene capacidad limitada de razonamiento, código y matemáticas; el edit no cambia esto.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación específicas para este diff.
- La licencia Apache 2.0 permite uso comercial, pero el diff se distribuye sin garantías y el autor no ofrece soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- El script de aplicación no se ha ejecutado tal cual en el repositorio; sigue el paso de aplicación del estudio, pero el autor indica que no se ha probado como está escrito.

## Enlaces

- Hugging Face: https://huggingface.co/ankit373/qwen3.5-0.8b-langconf-edit-c02
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper del benchmark LCB: https://arxiv.org/abs/2406.20052
- Referencia del estudio (runs/2026-11-10-gate4-audit/README.md, runs/2026-11-10-gate4-eval/README.md, runs/2026-11-11-stats-gate4/README.md, runs/2026-11-22-partc-protocol/PROTOCOL.md): no disponibles como enlaces públicos en la información proporcionada.
