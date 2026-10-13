# d-michail/Mitos-Qwen3-8B-Dialogue

## Resumen

Mitos-Qwen3-8B-Dialogue es un ajuste fino de Qwen/Qwen3-8B orientado a responder preguntas de la ciudadanía sobre procedimientos administrativos griegos. Lo publica el usuario d-michail y se distribuye como modelo fusionado (merged) en bfloat16, con 8.190.735.360 parámetros reales según safetensors y licencia CC BY-SA 4.0. El repositorio ocupa 16,4 GB.

El entrenamiento parte de 90.145 diálogos cortos generados por un LLM (denominado "Qwen3.8-27B" en la model card) a partir del texto de los 4.407 procedimientos del Registro Nacional de Procedimientos Administrativos griego (ΕΜΔΔ / Mitos), cuya API de datos abiertos es pública. El modelo responde de forma breve, entre 25 y 45 palabras, imitando el registro de un empleado de ventanilla.

Su relevancia es doble: por un lado, es un recurso para investigación en QA administrativo en griego, un dominio con pocos datos y requisitos altos de trazabilidad; por otro, sirve como generador final en pipelines de RAG, donde la recuperación documental aporta los hechos y el modelo aporta formato y registro. El autor advierte explícitamente que no constituye asesoramiento legal y que el entrenamiento se realizó con una longitud máxima de secuencia de 4.096 tokens, con el modo "thinking" desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B), ajustado con LoRA y pesos posteriormente fusionados |
| Parametros totales | 8.190.735.360 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 4.096 tokens de longitud máxima de secuencia durante el entrenamiento; la model card no especifica la ventana de contexto en inferencia |
| Tipos de cuantizacion | No disponibles en el repositorio: solo se publican pesos en bfloat16; no se listan versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Griego (el); el modelo base Qwen3-8B es multilingüe, pero el ajuste fino y la evaluación se restringen al griego |
| Licencia | CC BY-SA 4.0 para los pesos; el modelo base Qwen3 se distribuye bajo Apache-2.0 (texto incluido en el repositorio) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de la familia Qwen3, ajustado mediante LoRA con rango 16 y alpha 32 aplicado a todas las proyecciones de atención y MLP. La optimización usó learning rate 2e-4 con schedule coseno, 2 épocas, batch efectivo de 32 y precisión bfloat16. La pérdida se calculó únicamente sobre los tokens del asistente, con la plantilla de chat de Qwen3 y el razonamiento explícito desactivado (thinking disabled), mediante entropía cruzada estándar. La longitud máxima de secuencia fue de 4.096 tokens.

Los datos proceden del dataset d-michail/mitos-qa (configuración `qa-all`), construido a partir de una instantánea del registro Mitos: 4.407 procedimientos convertidos en 90.145 registros de chat. Esta versión concreta se entrenó con todos los procedimientos, incluidos los 220 que el benchmark reserva como "unseen", por lo que el autor no la evalúa sobre ese benchmark y remite a los números del modelo acompañante entrenado sin esos 220 procedimientos. No se documentan fases de RLHF ni DPO, ni innovaciones de decodificación (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional en griego sobre procedimientos administrativos, con respuestas deliberadamente cortas (25-45 palabras), en registro de ventanilla.
- Respuesta a preguntas de tipo factual administrativo (plazos, documentos requeridos, importes, pasos de un trámite) cuando se le proporciona el contexto recuperado.
- Funcionamiento en modo closed-book: aprende el formato y el registro del dominio, pero retiene pocos hechos, según los propios datos del autor.
- Integración en pipelines de RAG: la model card incluye una plantilla de prompt en griego que instruye a responder solo con los contextos numerados `[1]`, `[2]`, ... y a declarar cuándo la información no basta.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible`, además de `transformers` y vLLM.
- Multilingüismo: no documentado en el ajuste; la ficha declara únicamente griego. No se documenta tool calling, function calling, capacidades de agente, visión ni audio.

## Casos de uso

- Atención ciudadana sobre trámites: desplegado tras un recuperador que consulte la API de Mitos, el modelo redacta la respuesta final al ciudadano en griego con el formato y la brevedad de un empleado público, a partir de los fragmentos recuperados.
- Búsqueda asistida en el portal de procedimientos: dado un procedimiento concreto, el modelo puede resumir en lenguaje natural los requisitos y pasos, siempre que el texto oficial se le pase como contexto.
- Investigación académica en QA administrativo: sirve como línea base ajustada al dominio para comparar estrategias de recuperación (chunks por campo, ventanas divididas o procedimientos completos) con las métricas que publica el autor.
- Evaluación de sistemas RAG en griego: el modelo y su conjunto de datos permiten medir la contribución de la recuperación frente al modo closed-book en un dominio real, no sintético en cuanto a la fuente.
- Prototipado de asistentes para administraciones públicas: reduce el trabajo de adaptación al registro administrativo griego antes de integrar una capa de verificación contra el procedimiento vivo en `https://id.mitos.gov.gr/<ID>`.
- Normalización de preguntas ciudadanas: puede reformular consultas coloquiales en griego a formulaciones más cercanas a la terminología del registro, como paso previo a la recuperación.
- Generación de borradores de respuesta para revisión humana: en flujos internos donde un funcionario valida el texto antes de enviarlo, el modelo acelera la redacción manteniendo la longitud y el tono esperados.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo acompañante entrenado sin los 220 procedimientos reservados (`holdout/`), no a esta versión fusionada, que el autor no evalúa en el benchmark por haber visto esas preguntas. Son métricas sin juez, sobre 1.933 preguntas.

| Sistema | Key-fact recall (base) | Key-fact recall (modelo Mitos) | Token F1 (modelo Mitos) | Palabras (modelo Mitos) |
|---|---|---|---|---|
| Closed-book | 0,043 | 0,149 | 0,330 | 22 |
| RAG (chunks por campo) | 0,442 | 0,503 | 0,503 | 43 |
| RAG-split (ventanas) | 0,260 | 0,321 | 0,397 | 46 |
| RAG-process (procedimientos completos) | 0,236 | 0,298 | 0,372 | 50 |

El propio autor advierte que el key-fact recall favorece respuestas largas y el token F1 las cortas, por lo que ambas métricas deben leerse junto a la longitud de la respuesta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 16,4 GB de pesos más overhead de activaciones y caché KV; en la práctica, 20-24 GB para secuencias moderadas.
- GPUs recomendadas: A100 40 GB, H100, L40S o cualquier GPU con 24 GB o más para bfloat16.
- Consumer GPU: cabe en RTX 3090 y RTX 4090 (24 GB) en bfloat16; en tarjetas de 12-16 GB requeriría cuantización a 8 o 4 bits, que no se publica en el repositorio y habría que generar.
- Opciones de despliegue: `transformers` con `device_map="auto"`, vLLM (`vllm serve d-michail/Mitos-Qwen3-8B-Dialogue`) y text-generation-inference, etiquetado como compatible con endpoints. No se ofrecen pesos GGUF, por lo que Ollama o llama.cpp exigirían conversión previa.
- Detalle de integración: con vLLM hay que enviar `"chat_template_kwargs": {"enable_thinking": false}` en la petición de chat, porque el modelo se entrenó sin modo de razonamiento.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d-michail/Mitos-Qwen3-8B-Dialogue (este) | 8,19 B | 4.096 tokens en entrenamiento | No evaluado en el benchmark (vio los procedimientos reservados) | CC BY-SA 4.0 | Pesos completos en safetensors, bfloat16 |
| d-michail/Mitos-Qwen3-8B-Dialogue-LoRA | Adapter LoRA sobre Qwen3-8B | 4.096 tokens en entrenamiento | Key-fact recall RAG hasta 0,503 y token F1 0,503 en la carpeta `holdout/` | CC BY-SA 4.0 | Adapter LoRA, más ligero de almacenar |
| Qwen/Qwen3-8B (modelo base) | 8,19 B | No especificado en la información disponible | No disponible para QA administrativo griego | Apache-2.0 | Pesos completos, ampliamente soportado |

No hay en la información proporcionada datos de otros modelos comparables de QA administrativo en griego, ni resultados de benchmarks estándar que permitan una comparación numérica con alternativas de propósito general.

## Limitaciones y advertencias

- No es asesoramiento legal: las respuestas no tienen validez jurídica y el registro cambia con el tiempo, por lo que el modelo queda desactualizado respecto a la fuente viva.
- En modo closed-book retiene el registro y el formato del dominio, pero apenas los hechos: el key-fact recall se queda en 0,149. Puede afirmar datos concretos (importes, plazos, documentos) que sean falsos.
- Riesgo de alucinación en cifras y requisitos: cualquier despliegue debe mostrar la fuente, la fecha de recuperación y el enlace al procedimiento oficial.
- Los datos de entrenamiento son sintéticos o generados por plantilla a partir de una única instantánea del registro, por lo que pueden reproducir errores y frases del generador.
- El propio registro no garantiza la exhaustividad ni la corrección de su contenido (términos de uso de mitos.gov.gr, A.6), y el modelo tampoco puede garantizarlas.
- Degeneración en bucles de repetición: los modelos pequeños a veces repiten hasta agotar el límite de tokens; el autor recomienda penalización por repetición o reglas de parada en producción. El ejemplo de uso emplea `repetition_penalty=1.05`.
- El modelo se entrenó sin system prompt y con el razonamiento desactivado; hay que respetar esa configuración con la plantilla de chat de Qwen3.
- Cobertura lingüística limitada al griego; no hay evidencia de rendimiento en otros idiomas.
- Licencia CC BY-SA 4.0 con condición de share-alike: condiciona los usos derivados, y hay que atribuir al Εθνικό Μητρώο Διοικητικών Διαδικασιών – Μίτος y señalar los cambios realizados, además de conservar el aviso Apache-2.0 del modelo base Qwen3.
- Verificación obligatoria: cada respuesta debe contrastarse contra el procedimiento en vivo en `https://id.mitos.gov.gr/<Mitos ID>`, usando el identificador de 6 dígitos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Dialogue
- Modelo acompañante con adapter LoRA y partición de validación: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Dialogue-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa (configuración `qa-all`)
- Registro Nacional de Procedimientos Administrativos (Μίτος): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Consulta de un procedimiento por su ID de 6 dígitos: https://id.mitos.gov.gr/<Mitos ID>
- Licencia de los pesos: https://creativecommons.org/licenses/by-sa/4.0/
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper con las métricas con juez, los otros tamaños y el protocolo completo: enlace pendiente de publicar según la model card (no disponible)
- Nota sobre la búsqueda web: los resultados obtenidos no contienen enlaces relevantes para este modelo (devuelven páginas genéricas sobre Discord y sobre la letra D), por lo que no se incluye ninguno.
