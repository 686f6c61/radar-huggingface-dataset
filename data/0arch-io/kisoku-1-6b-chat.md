# 0arch-io/kisoku-1.6b-chat

## Resumen

Kisoku 1.6B Chat (preview) es un ajuste fino conversacional del modelo base [0arch-io/kisoku-1.6b](https://huggingface.co/0arch-io/kisoku-1.6b), un LLM de 1.600.749.056 parámetros entrenado desde cero por Joseph Rodriguez en 0ARCH sobre un TPU v4-32 de Google TPU Research Cloud. Este repositorio concreto corresponde a la novena pasada de supervised fine-tuning (etiquetada sft009 en los nombres de ejecución del autor), ejecutada entre el 4 y el 6 de octubre de 2026, y se publica explícitamente como preview, no como asistente terminado.

El modelo parte de una arquitectura tipo Qwen3 (según los tags del repositorio) con 1,6B parámetros, contexto nativo extendido a 64K tokens y aproximadamente 128K mediante YaRN. El base se entrenó con unos 524,4B tokens de texto, una cifra que el autor sitúa en torno a 18 veces menos datos que Llama 3.2 1B, y aun así iguala a ese modelo en una suite de 10 benchmarks (cinco victorias para cada uno).

La relevancia de esta ficha es doble: por un lado, documenta un experimento de entrenamiento reproducible y de bajo presupuesto (una persona, tres días de SFT, hardware TPU); por otro, el propio autor publica métricas negativas sin maquillar, incluyendo que el modelo queda 6-8 puntos por debajo de Llama 3.2 1B Instruct en conversación multiturno. Es, por tanto, un caso útil para estudiar qué consigue y qué no consigue el fine-tuning supervisado a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (tag `qwen3` en el repositorio) |
| Parametros totales | 1.600.749.056 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64K tokens nativos; ~128K con YaRN (x2) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo solo distribuye safetensors en bfloat16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`); tamano del repo 12,8 GB |

## Arquitectura y entrenamiento

El base es un transformer decoder-only de 1,6B parámetros preentrenado desde inicialización aleatoria sobre aproximadamente 0,5 billones de tokens (524,4B contando las fases de contexto largo), con una fase C de long-context que llevó el modelo hasta 64K tokens y que, según el autor, incluyó tareas sintéticas parecidas a RULER. El ajuste conversacional se ejecutó en nueve pasadas supervisadas de 70 a 95 minutos cada una sobre el TPU v4-32, con unos 131K tokens por paso. Cada pasada arrancó del checkpoint final de contexto largo del base (fase C, paso 1299) con un optimizador nuevo; ninguna pasada continuó desde un modelo de chat anterior.

Los datos de SFT combinan subconjuntos públicos (SmolTalk2, Hermes 3, OpenHermes 2.5, no_robots, trazas de tool calling de xlam y Hermes function calling) con dos conjuntos escritos por un teacher DeepSeek-V4.1-Flash: uno de 34.879 ejemplos y otro de unas 47.500 conversaciones escritas con la identidad de Kisoku. Se añadieron correcciones de turnos erróneos del propio modelo, ejemplos de "no lo sé" construidos a partir de sus respuestas incorrectas, un set de autoconversación defensiva y ruido de erratas en mensajes cortos. El autor declara haber eliminado por coincidencia verbatim todo ejemplo que contuviera un ítem de benchmark, con cero coincidencias en el reescaneo final de los shards. Se entrenó un modo "thinking" en la pasada 3 y se eliminó después; también se retiraron los ejemplos de "mantener la posición" porque el modelo no distinguía sus respuestas correctas de las incorrectas. Se realizó un experimento de DPO que no se publicó y, según el autor, no aportó mejora.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`transformers`, `text-generation-inference`, compatible con endpoints).
- Razonamiento aritmético básico: GSM8K sube de 15,0 en el base a 20,6 tras el SFT.
- Generación de código a nivel introductorio: HumanEval 14,0, prácticamente igual que el base (14,6).
- Tool calling / function calling: el dataset de entrenamiento incluye trazas de xlam y Hermes function calling, por lo que el formato está presente en los datos, aunque no se publican métricas específicas de tool use.
- Contexto largo: mantiene buena parte de la capacidad del base según RULER con YaRN x2 (76,5 a 4K, 60,5 a 32K, 54,3 a 64K).
- Comprensión lectora y sentido común a nivel de modelo pequeño: ARC-Easy 66,0, ARC-Challenge 42,2, WinoGrande 57,2, PIQA 73,0.
- No soporta visión, audio ni otros modalidades según la informacion disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés con presupuesto mínimo: al ser Apache 2.0 y 1,6B parámetros, permite iterar en una sola GPU consumer antes de invertir en modelos mayores.
- Experimentación académica sobre SFT: el autor publica el log de entrenamiento, el número de pasadas y el efecto medido de cada técnica (correcciones de turnos propios, DPO descartado), lo que lo convierte en un caso de estudio reproducible.
- Investigación sobre contextos largos en modelos pequeños: sus resultados RULER a 4K/32K/64K con YaRN permiten comparar estrategias de extensión de contexto sin grandes recursos de cómputo.
- Generación de código en entornos de bajo riesgo (scripts, snippets, tests triviales): HumanEval 14,0 es suficiente para autocompletado asistido con revisión humana obligatoria, no para producción autónoma.
- Clasificación y extracción de información con contexto largo: ventanas de 64K tokens permiten procesar documentos extensos en una sola pasada en hardware modesto.
- Base para fine-tuning específico de dominio: al ser un preview con licencia permisiva, sirve como punto de partida para ajustes posteriores con datos propios, siempre que el dominio no exija alta fiabilidad factual.
- Evaluación de robustez y alucinación: útil como modelo "negativo" en estudios comparativos, dado que el autor documenta explícitamente fallos de coherencia multiturno y respuestas erróneas seguras.

## Benchmarks y rendimiento

Suite de 10 tests ejecutada con lm-evaluation-harness 0.4.13, bfloat16, en RTX 4090, sin plantilla de chat y sin intervalos de confianza:

| Test | Base (etapa 3) | Base (publicado) | Chat, pasada 9 |
|---|---|---|---|
| GSM8K | 15,3 | 15,0 | 20,6 |
| HumanEval | 13,4 | 14,6 | 14,0 |
| ARC-Easy | 65,4 | 64,4 | 66,0 |
| ARC-Challenge | 39,8 | 40,1 | 42,2 |
| WinoGrande | 57,3 | 56,8 | 57,2 |
| PIQA | 73,9 | 73,0 | 73,0 |
| HellaSwag | 57,7 | 57,8 | 57,2 |
| TriviaQA | 22,8 | 23,1 | 20,8 |
| MMLU | 33,0 | 34,2 | 29,8 |
| BBH | 29,2 | 28,6 | 26,3 |

Contexto largo con RULER y YaRN x2 (650 muestras, ejecución única):

| Modelo | 4K | 32K | 64K |
|---|---|---|---|
| Kisoku chat, pasada 9 | 76,5 | 60,5 | 54,3 |
| Kisoku base, final | 76,1 | 58,8 | 56,7 |
| Llama 3.2 1B (base) | 73,5 | 56,7 | 49,2 |

Test de conversación retenido (297 guiones, unas 2.530 turnos, juez automático):

| Modelo | Turnos aceptables | Primeros turnos malos |
|---|---|---|
| Llama 3.1 8B Instruct | 59,5% | 10% |
| Llama 3.2 1B Instruct | 56,7% | 11% |
| Kisoku chat, pasada 6 | 50,3% | 8% |
| Kisoku chat, pasada 9 (este modelo) | 48,9% | 10% |

## Requisitos de hardware

- Inferencia en bfloat16: los 1.600.749.056 parámetros ocupan unos 3,2 GB de pesos; contando caché KV y overhead, se recomienda un mínimo de 6-8 GB de VRAM para contextos moderados, y bastante más para 64K tokens.
- GPU consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. En GPUs de 8 GB conviene cuantizar.
- GPU profesional: A100, H100 y L40S lo ejecutan con holgura; para servir en producción con contexto largo conviene al menos 24 GB.
- Despliegue: soportado por `transformers`, `text-generation-inference` (tag en el repo), vLLM y llama.cpp/Ollama si se generan GGUF (no se distribuyen en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se hizo en TPU v4-32, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Conversacion multiturno | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kisoku 1.6B Chat (preview) | 1,6B | 64K (~128K YaRN) | 48,9% turnos aceptables | 29,8 | Apache 2.0 | HuggingFace |
| Llama 3.2 1B Instruct | 1,2B | 128K | 56,7% turnos aceptables | No disponible en la informacion | Llama 3.2 Community License | Meta / HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128K | 59,5% turnos aceptables | No disponible en la informacion | Llama 3.1 Community License | Meta / HuggingFace |
| Kisoku 1.6B (base) | 1,6B | 64K | No evaluado | 34,2 | Apache 2.0 | HuggingFace |

El base de Kisoku iguala a Llama 3.2 1B en la suite de 10 benchmarks del autor (cinco victorias cada uno) usando unas 18 veces menos datos de entrenamiento, pero el chat fine-tune queda por detrás del Instruct de Meta en conversación multiturno.

## Limitaciones y advertencias

- El autor lo describe explícitamente como preview, no como asistente terminado: pierde el hilo en conversaciones largas y afirma respuestas incorrectas con seguridad.
- Queda 6-8 puntos por debajo de Llama 3.2 1B Instruct en el test de conversación retenido (48,9% frente a 56,7% de turnos aceptables), y casi ninguna conversación de nueve turnos se completa con todos los turnos aceptables (0-2 de 297 en todos los modelos).
- El SFT degradó algunos benchmarks respecto al base: MMLU cae 4,4 puntos (34,2 a 29,8), BBH 2,3 puntos (28,6 a 26,3) y TriviaQA 2,3 puntos (23,1 a 20,8). El conocimiento factual y el razonamiento multietapa empeoran.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación elevado y mal calibrado: el autor documenta que el modelo no distingue sus respuestas correctas de las incorrectas, razón por la que retiró los ejemplos de "mantener la posición".
- El modo thinking se entrenó y se eliminó; no está disponible en este checkpoint.
- Las cifras de benchmark carecen de intervalos de confianza y el juez del test de conversación no tiene medida de variabilidad entre lecturas; el rango 48,9-50,3% de las pasadas 6-9 se considera empate.
- El texto generado por el teacher DeepSeek-V4.1-Flash está sujeto a los términos de DeepSeek, motivo por el que las conversaciones escritas por el teacher no se publican.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su despliegue en producción orientada a usuarios sin supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0arch-io/kisoku-1.6b-chat
- Modelo base en HuggingFace: https://huggingface.co/0arch-io/kisoku-1.6b
- Colección Kisoku 1.6B: https://huggingface.co/collections/0arch-io/kisoku-16b
- Repositorio GitHub (release del chat): https://github.com/0arch-io/kisoku/tree/main/release/kisoku-1.6b-chat
- Repositorio GitHub principal: https://github.com/0arch-io/kisoku
- Página del proyecto con log de entrenamiento y gráficas: https://0arch.io/kisoku
- Informe técnico y story del base: https://0arch.io/core
