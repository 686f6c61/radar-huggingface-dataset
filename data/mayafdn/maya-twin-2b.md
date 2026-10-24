# MayaFdn/maya-twin-2b

## Resumen

maya-twin-2b es un ajuste fino del modelo denso Qwen3.5-2B de Alibaba Cloud (equipo Qwen), publicado por MayaFdn (Aaron Astley) el 24 de octubre de 2026 bajo licencia Apache-2.0. Se distribuye como un único archivo GGUF cuantizado en Q4_K_M de 1.312.164.448 bytes (1,3 GB de repositorio), con 1.942.653.248 parámetros en los pesos originales en safetensors. Sobre la base se aplicó un adaptador LoRA en todas las capas, posteriormente fusionado en los pesos y cuantizado; el resultado es un modelo de 2B orientado específicamente a llamadas a herramientas y a seis formatos proactivos en formato JSON.

El modelo no pretende competir en capacidades generales: está diseñado como el motor previsto del asistente de voz on-device de la app Maya, con una ventana de contexto de 8.192 tokens, plantilla de chat propia incluida en el GGUF, modo de razonamiento desactivado y decodificación greedy (temperatura 0, repeat_penalty 1). Su entrenamiento se hizo con 6.544 conversaciones sintéticas (4.694 de tool calling y 1.850 proactivas con respuestas calculadas por código), durante 2 épocas.

Es relevante porque ejemplifica una categoría concreta: modelos pequeños, cuantizados y especializados en un contrato de herramientas estricto, pensados para ejecutarse en dispositivo en lugar de en la nube. El autor publica recuentos de evaluaciones propietarias (eval-v5.2, eval-v2, eval-p1, eval-p2) con umbrales explícitos, pero no hay métricas de benchmarks estándar (MMLU, HumanEval, GSM8K) ni mediciones de latencia en teléfono: la velocidad declarada (unos 350 tokens/s y 313 ms por paso de herramienta) se midió únicamente en una GPU alquilada mediante el runner de QVAC sobre llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-2B) con LoRA fusionado en todas las capas; no es MoE |
| Parametros totales | 1.942.653.248 (pesos en safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (configuración declarada de uso) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado: `Qwen3.5-2B-mayaa8-Q4_K_M.gguf`); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, 1.312.164.448 bytes, sha256 `bed4701b2325a2177cd36b6e82b773e0025144cc43cb13c763d6014afdc17d5a`); base original en safetensors |
| Plantilla de chat | Incluida en el GGUF, con razonamiento desactivado |
| Modo de decodificacion recomendado | Greedy: `temperature 0`, `repeat_penalty 1` |
| Descargas / likes | 0 / 0 (a fecha de la información) |

## Arquitectura y entrenamiento

La base es Qwen3.5-2B, un transformer denso de aproximadamente 1,94 mil millones de parámetros bajo licencia Apache-2.0. El ajuste consiste en un adaptador LoRA aplicado a todas las capas y fusionado directamente en los pesos, sin cambios estructurales en el transformer ni en el tokenizador. El modelo final se cuantiza a Q4_K_M para GGUF, lo que reduce el peso del archivo a 1,3 GB y permite ejecución en CPU, iGPU o GPU de gama de entrada con llama.cpp.

El entrenamiento cubrió 2 épocas sobre 6.544 conversaciones sintéticas: 4.694 de tool calling (generadas por profesor y escritas a mano, fijadas por hash) y 1.850 proactivas cuyas respuestas se calculan por código en lugar de generarse libremente. Los datos usan personas, empresas y lugares ficticios y no se publican. Parte de las conversaciones se redactaron con ayuda de Qwen3.5-9B. No se documenta RLHF ni DPO; el ajuste se orienta a un contrato de herramienta y a seis formatos JSON (nudge, sort, safe, recall, protocol, card), cada uno con su propio system prompt, que la app de Maya proporciona y no se distribuye en el repositorio. El archivo `release.json` del repo recoge los ajustes exactos, el checksum y el hash de la plantilla.

## Capacidades

- Generación de texto conversacional breve en inglés, con estilo de asistente personal.
- Tool calling / function calling sobre una lista de herramientas específica por tarea ("una cara por tarea"), con unos 313 ms por paso de herramienta en GPU.
- Emisión de seis formatos proactivos como un único objeto JSON: nudge (recordatorio de tareas), sort (ordenación de listas), safe (conversación segura), recall (recuperación de información), protocol (agente a agente) y card (tarjetas).
- Comportamiento de clarificación: pide aclaración cuando falta información (8/10 en eval-v5.2).
- Resistencia a inyección de instrucciones dentro de un chat y no repetición de datos de otras "caras" (12/12 y 6/6 sin fugas en eval-v5.2).
- Ordenación de elementos con acierto aproximado del 93,8% por ítem en el conjunto retenido eval-p2.
- Ejecución on-device: cuantización Q4_K_M y plantilla de chat embebida, compatible con llama.cpp y runtimes GGUF.
- No soporta visión, audio ni otros idiomas distintos del inglés según la información disponible.

## Casos de uso

- Asistente de voz con integración de apps: el modelo traduce la petición del usuario a llamadas de herramienta sobre las aplicaciones conectadas, con una lista de herramientas distinta por tarea. Su ventana de 8.192 tokens permite mantener el contexto de la conversación y del estado de la app en un único turno.
- Recordatorios y sugerencias proactivas: genera el JSON del formato nudge para avisar de tareas pendientes. El autor recomienda que la app decida en código qué tareas tocan (fecha de vencimiento, pospuestas, orden, límite) y use el modelo solo para la redacción, dado su 77-80% de acierto.
- Ordenación asistida de listas: el formato sort devuelve los elementos reordenados con un 93,8% de acierto por ítem en el conjunto retenido; se usa como sugerencia corregible por el usuario, no como orden definitivo.
- Orquestación agente a agente: el formato protocol está pensado para mensajes entre agentes y obtuvo 30/30 tanto en desarrollo como en el conjunto retenido eval-p2, lo que lo hace apto para pipelines internos de agentes con contrato fijo.
- Guardrails y filtrado de prompt injection: el modelo mantiene la instrucción del sistema y no revela datos de otras caras (12/12 y 10/10 en el conjunto retenido), por lo que puede usarse como capa de detección en un chat antes de ejecutar acciones.
- Asistente empotrado en móvil o edge: con 1,3 GB en Q4_K_M y 8.192 tokens de contexto, cabe en dispositivos con poca memoria y permite despliegue sin conexión mediante llama.cpp u otro runtime GGUF, con modo de razonamiento desactivado para minimizar latencia.
- Base para ajustes propios: al ser Apache-2.0 y derivar de Qwen3.5-2B, sirve como punto de partida para reentrenar el contrato de herramientas de otra aplicación, sustituyendo los system prompts propietarios de Maya por los propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica recuentos sobre conjuntos de evaluación propios, con umbrales de aceptación entre paréntesis.

Puertas de tool calling (eval-v5.2, conjunto de desarrollo):

| Prueba | Resultado | Umbral |
|---|---|---|
| steps | 39/41 | 37 |
| flow | 13/15 | 12 |
| clarify | 8/10 | 8 (sin caso de reserva) |
| speak | 12/12 | 11 |
| attack | 12/12, 0 plantados | 11 |
| face | 6/6, 0 fugas | 11 declarado en la model card |

Conjunto eval-v2: steps 36/38, flows 12/12, attack 20/21, face 10/10, 0 plantados, 0 fugas.

Formatos proactivos:

| Formato | eval-p1 (desarrollo) | eval-p2 (retenido) | Objetivo declarado |
|---|---|---|---|
| card | 27/30 | 30/30 | 80% |
| nudge | 24/30 | 23/30 | 80% |
| protocol | 30/30 | 30/30 | 80% |
| recall | 29/30 | 29/30 | 80% |
| safe: controles | 8/8 | 8/8 | 80% |
| safe: inyección | 12/12 | 12/12 | 100% |
| safe: fuga | 10/10 | 10/10 | 100% |
| sort (casos / ítems) | 21/40 / 90,8% | 27/40 / 93,8% | 80% / 90% |

eval-p2 se puntuó una sola vez, solo con recuentos, una vez alcanzadas las puertas, y no se leyeron sus respuestas. eval-v6.2 (segundo conjunto retenido de tool calling) se puntuó una vez para la ronda seis (steps 27/32, flows 7/12) y no se ha puntuado para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con el archivo Q4_K_M y contexto moderado; en torno a 2-3 GB para aprovechar los 8.192 tokens completos (estimación a partir del tamaño de pesos; el KV cache exacto no está documentado).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 y GPUs integradas con 4 GB o más de memoria compartida. También es viable en CPU y en Apple Silicon vía llama.cpp.
- GPU de centro de datos (A100, H100) innecesarias para uso individual; solo tendrían sentido para servir muchas instancias en paralelo.
- Despliegue: llama.cpp o cualquier runtime GGUF con soporte de tool calling (Ollama, servidores compatibles con endpoints). El repositorio incluye la plantilla de chat, por lo que no hace falta definirla externamente.
- Throughput y latencia declarados: unos 350 tokens/s y 313 ms por paso de herramienta, medidos en una GPU alquilada con el runner de QVAC (llama.cpp). No se especifica el modelo de GPU. No hay mediciones en teléfono.
- Configuración de ejecución obligatoria: greedy (`temperature 0`, `repeat_penalty 1`), razonamiento desactivado, contexto 8.192.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros para comparar rendimiento. La comparación se limita a parámetros, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación | Benchmarks públicos |
|---|---|---|---|---|---|---|
| maya-twin-2b | 1,94 B (denso) | 8.192 | GGUF Q4_K_M | Apache-2.0 | Tool calling y 6 formatos JSON proactivos en inglés | Solo evaluaciones propietarias del autor |
| Qwen3.5-2B (base) | ~2 B (denso) | No disponible | Safetensors (y GGUF vía terceros) | Apache-2.0 | Modelo generalista multilingüe | No disponibles en la información |
| Qwen3.5-9B (profesor) | ~9 B (denso) | No disponible | No disponible | Apache-2.0 | Modelo generalista, usado para redactar parte de los datos de entrenamiento | No disponibles en la información |

No se han identificado en la información proporcionada otras alternativas comparables de 2B especializadas en tool calling on-device con datos verificables.

## Limitaciones y advertencias

- Solo se ha entrenado y probado con prompts en inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Generalización limitada en flujos multi-paso: la ronda seis del modelo anterior obtuvo 7/12 en el conjunto retenido eval-v6.2, y este modelo no se ha puntuado en ese conjunto.
- Los avisos proactivos (nudge) aciertan en el 77-80% de los casos: la app debe decidir en código qué tareas proceden y usar el modelo únicamente para la redacción.
- La ordenación (sort) es correcta por ítem en torno al 94%: debe tratarse como sugerencia corregible, no como resultado autoritativo.
- Las dos conductas de seguridad (ignorar instrucciones dentro de un chat y no repetir datos de otra cara) alcanzaron el 100% en el conjunto retenido, pero el autor advierte que un rechazo entrenado es una probabilidad: la app debe seguir aislando el contexto entre caras y aceptar una propuesta solo si se remonta al mensaje del usuario.
- Toda acción generada es una propuesta sujeta a aprobación humana; las operaciones con dinero requieren huella digital según el diseño previsto.
- Riesgo de alucinación en datos de personas, empresas o lugares: el entrenamiento usa datos sintéticos y el modelo no se ha evaluado con información real de usuarios.
- Dependencia de los system prompts de Maya: los seis formatos JSON y la tarea de tool calling esperan el prompt de sistema y la lista de herramientas de la app; no se distribuyen en el repositorio, por lo que la reproducibilidad fuera de esa app es limitada.
- No hay mediciones de latencia ni de consumo en dispositivo móvil; el rendimiento en teléfono es desconocido.
- Sin benchmarks estándar publicados ni validación independiente; el modelo tiene 0 descargas y 0 likes en el momento de la información.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y atribuir la base Qwen3.5-2B; conviene revisar el texto en `LICENSE`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MayaFdn/maya-twin-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Organización MayaFdn en HuggingFace: https://huggingface.co/MayaFdn
- Listado de modelos de MayaFdn: https://huggingface.co/MayaFdn/models
- Archivo de configuración de la release (`release.json`, ajustes, checksum y hash de plantilla): https://huggingface.co/MayaFdn/maya-twin-2b/blob/main/release.json
- Sitio del producto Maya: https://im-maya.ai/
