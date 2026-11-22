# serhatkagans/Pusula-9B

## Resumen

Pusula-9B es un modelo de chat de propósito general especializado en turco, desarrollado por el usuario serhatkagans y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino (fine-tuning) mediante QLoRA sobre un modelo base abierto de aproximadamente 9.000 millones de parámetros y licencia Apache-2.0, cuyo nombre concreto no se especifica en la información disponible. El objetivo declarado es ofrecer respuestas fluidas y bien estructuradas en turco, manteniendo al mismo tiempo la capacidad en inglés del modelo base.

El modelo está orientado a conversación multi-turno, instrucciones, razonamiento, matemáticas, código, escritura creativa y tool calling. Incorpora un contexto probado de 32.000 tokens y se distribuye tanto en safetensors (BF16) como en GGUF, lo que facilita su despliegue en llama.cpp, LM Studio y Ollama. La versión Q4_K_M ocupa unos 5,6 GB y cabe en una GPU de 8 GB.

Su relevancia actual radica en la escasez relativa de modelos abiertos con un rendimiento sólido específicamente en turco, un idioma con menos cobertura que el inglés en el ecosistema open source. El autor publica además una evaluación con juez externo ciego sobre un conjunto de 263 preguntas en turco, lo que aporta transparencia sobre el comportamiento real del modelo en tareas lingüísticas y de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base no especificado, familia de ~9B) |
| Parametros totales | ~9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K probados (la arquitectura soporta contextos mayores) |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, ~18 GB en 4 shards), GGUF (Q4_K_M ~5,6 GB; BF16 ~17,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 9.000 millones de parámetros, ajustado mediante QLoRA sobre una base cuantizada a 4 bits durante 1 época y 765 pasos. Los hiperparámetros del ajuste fueron r = 32, learning rate 7e-5, batch efectivo de 16 y longitud máxima de 4.096 tokens. El adaptador LoRA se fusionó con la base en 16 bits a una escala de 0,6; según el autor, una fusión a escala completa (1,0) produjo peor calidad de chat en comparaciones ciegas.

El conjunto de datos de entrenamiento consta de 12.234 muestras: aproximadamente 9.970 diálogos en turco procedentes del dataset `serhatkagans/turkish-chat-sft-v3` repartidos en 12 categorías, 1.751 muestras en inglés para preservar la capacidad en ese idioma y 512 muestras de tool calling en turco e inglés. En esta versión se reescribieron 1.182 respuestas de lógica y matemáticas en formato "solución primero, resultado al final", cada una revisada individualmente, y se eliminaron 51 muestras con respuestas incorrectas. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en turco con estructura clara y uso de Markdown cuando aporta claridad.
- Razonamiento lógico y matemático, con resolución paso a paso y resultado final al cierre de la respuesta.
- Generación de código y explicaciones técnicas.
- Escritura creativa.
- Tool calling y function calling, con muestras de entrenamiento específicas en turco e inglés.
- Conversación multi-turno con contexto de hasta 32.000 tokens.
- Capacidad en inglés preservada mediante datos de replay.
- Conocimiento sobre historia, geografía y cultura de Turquía.
- Modo de pensamiento desactivable mediante el parámetro `enable_thinking` en la plantilla de chat.

## Casos de uso

- Atención al cliente en turco: el modelo puede gestionar conversaciones multi-turno con hasta 32.000 tokens de contexto, lo que permite mantener el historial completo de una incidencia sin truncar información relevante.
- Asistente de soporte técnico con tool calling: las 512 muestras de function calling en turco e inglés permiten integrarlo en flujos donde el modelo deba invocar APIs (consultas de pedidos, estado de tickets) y redactar la respuesta final en turco.
- Generación de código en entornos de desarrollo turcos: puede producir fragmentos de código y explicaciones en turco, útil para equipos que documentan en ese idioma.
- Tutoría educativa en matemáticas: el formato "solución primero, resultado al final" y la puntuación de 93,9 % en la categoría de matemáticas del conjunto de referencia lo hacen adecuado para explicar ejercicios paso a paso.
- Chatbot integrado en aplicaciones de escritorio o móviles: la versión Q4_K_M de 5,6 GB cabe en una GPU de 8 GB o puede ejecutarse en CPU mediante llama.cpp u Ollama, lo que facilita despliegues locales sin infraestructura en la nube.
- Asistente de contenido cultural y turístico: su conocimiento sobre historia, geografía y cultura de Turquía (28,3 % en la categoría específica del conjunto de referencia) permite redactar guías y respuestas contextualizadas, aunque con margen de mejora.
- Procesamiento de documentos largos en turco: con 32.000 tokens de contexto puede resumir contratos, informes o transcripciones extensas en ese idioma.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Modelo base | Pusula v3 | Pusula 9B |
|---|---:|---:|---:|
| MMLU-Pro (14 asignaturas × 20 preguntas, 5-shot; ±2,8) | 63,2 | 63,6 | 63,9 |
| Tool calling (20 tareas) | 19/20 | 18/20 | 18/20 |
| Conjunto de referencia en turco (263 preguntas, juez externo ciego) | 50,2 | 46,8 | 51,5 |

Desglose del conjunto de referencia en turco (porcentaje de acierto):

| Categoría | Modelo base | Pusula v3 | Pusula 9B |
|---|---:|---:|---:|
| Lógica | 68,6 | 48,6 | 64,3 |
| Matemáticas | 90,2 | 85,4 | 93,9 |
| Turquía (historia, geografía, cultura) | 22,6 | 27,4 | 28,3 |
| Gramática y ortografía turcas | 27,4 | 34,9 | 31,1 |
| Conocimiento general | 67,4 | 57,0 | 66,3 |
| Honestidad (premisas falsas, entidades inventadas) | 40,8 | 35,5 | 38,2 |
| Respuestas autocontradictorias (número) | 22 | 46 | 11 |

La mejora de Pusula 9B frente a Pusula v3 es de +4,8 puntos con un intervalo de confianza del 95 % de +1,1 a +8,6 (estadísticamente significativa). Frente al modelo base, la diferencia es de +1,3 puntos con un IC del 95 % de −2,9 a +5,3, es decir, no significativa: el rendimiento es equivalente al de la base.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18 GB de pesos más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB para contexto largo.
- VRAM estimada en Q4_K_M: unos 5,6 GB de pesos; el autor indica que cabe en una GPU de 8 GB.
- GPU recomendadas: A100 40 GB o H100 para BF16 con contexto completo; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3060/4060 Ti (8-16 GB) para Q4_K_M.
- Despliegue: transformers, vLLM (BF16), llama.cpp (`llama-server` con `-ngl 99 -c 32768 --jinja`), LM Studio, Ollama y text-generation-inference según las etiquetas del repositorio.
- Muestreo recomendado con thinking desactivado: temperature 0,7, top_p 0,8, top_k 20, presence_penalty 1,5.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Pusula-9B | ~9B | 32K probados | Apache-2.0 | tr, en | Fine-tuning QLoRA centrado en turco; MMLU-Pro 63,9 |
| Modelo base de Pusula-9B | ~9B | no disponible | Apache-2.0 | no disponible | Referencia del autor: MMLU-Pro 63,2; 50,2 % en el conjunto turco |
| Pusula v3 | ~9B | no disponible | Apache-2.0 | tr, en | Versión anterior; 46,8 % en el conjunto turco, 46 respuestas autocontradictorias |

No se dispone en la información proporcionada de datos sobre otros modelos abiertos comparables específicamente entrenados para turco (por ejemplo, variantes de la familia Llama, Qwen o Gemma ajustadas para ese idioma), por lo que la comparativa se limita a las versiones del propio autor.

## Limitaciones y advertencias

- El rendimiento global en el conjunto de referencia turco (51,5 %) es modesto en categorías como honestidad (38,2 %), gramática y ortografía (31,1 %) y conocimiento sobre Turquía (28,3 %), lo que indica margen de mejora en precisión factual y lingüística.
- Riesgo de alucinación y de aceptar premisas falsas: la puntuación de honestidad es la más baja del desglose, con un 38,2 %.
- El modelo base no se identifica explícitamente en la información disponible, lo que dificulta auditar su procedencia y sus sesgos heredados.
- La evaluación procede del propio autor y no está verificada de forma independiente; los resultados de MMLU-Pro tienen un margen de ±2,8.
- Cobertura limitada a turco e inglés; no se declaran otros idiomas.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el autor no documenta restricciones adicionales ni condiciones de atribución específicas más allá de las de la propia licencia.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- El contexto de 32K está probado, pero el autor advierte que la arquitectura soporta longitudes mayores sin garantía de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/serhatkagans/Pusula-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/serhatkagans/turkish-chat-sft-v3
- Dataset de evaluación MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
