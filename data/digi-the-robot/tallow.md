# digi-the-robot/Tallow

## Resumen

Tallow es un modelo de lenguaje de 15,7 millones de parámetros entrenado desde cero por el usuario digi-the-robot y publicado bajo licencia Apache 2.0. No es un asistente conversacional al uso: simula el comportamiento de un cuervo salvaje que responde exclusivamente mediante etiquetas de estado de ánimo, acciones entre asteriscos y sonidos onomatopéyicos, sin producir frases en inglés. El modelo está etiquetado explícitamente como `toy-model` y `from-scratch`, y su propósito es demostrar que un transformer diminuto puede aprender dinámicas de rol coherentes (confianza, rencor, miedo) con un dataset sintético pequeño y un entrenamiento de menos de dos horas en una GPU de consumo.

Arquitectónicamente es un decoder estilo Llama con 8 capas, dimensión oculta de 384 y 6 cabezas de atención, con normalización RMSNorm, embeddings rotatorios (RoPE), activación SwiGLU y embeddings atados. El contexto efectivo es de 2.048 tokens durante el ajuste fino, aunque el autor indica que en la práctica la memoria útil del personaje ronda los 1.900 tokens (unas 25-30 interacciones).

Su relevancia es fundamentalmente educativa y experimental: documenta de forma inusualmente transparente todo el pipeline (tokenizador, preentrenamiento, generación de datos sintéticos con un motor de reglas y un LLM mayor, filtrado automático, ajuste fino y evaluación por turnos), lo que lo convierte en un caso de estudio útil sobre cómo inyectar reglas de comportamiento en un modelo minúsculo sin recurrir a RLHF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parámetros totales | 15.735.168 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (entrenamiento de ajuste fino); memoria práctica del personaje ~1.900 tokens |
| Tipos de cuantización | no disponible (pesos publicados en fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (salida limitada a sonidos y palabras enseñadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), más tokenizador SentencePiece (`tallow_tok.model`) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 8 capas, anchura 384 y 6 cabezas de atención, con RMSNorm, RoPE, SwiGLU y embeddings atados de entrada y salida. El tokenizador es un SentencePiece BPE de 4.096 piezas con byte fallback. El preentrenamiento se realizó desde cero sobre el dataset TinyStories durante 16.000 pasos, aproximadamente 524 millones de tokens, alcanzando una pérdida de validación final de 1,17 en unas 1 hora y 45 minutos sobre una RTX 3070.

La parte diferencial es la generación del corpus de comportamiento. Un motor de reglas en Python planifica cada conversación y decide la etiqueta de estado de ánimo exacta de Tallow en cada turno, siguiendo variables de estado como confianza, rencores acumulados, el "scar" (miedo tras ser agarrado) y palabras aprendidas. Esas planificaciones se convirtieron en diálogo con Claude Haiku 5.5, cubriendo 8 personalidades de usuario y 10 tipos de escenario. Un script verificador descartó las conversaciones que violaban las reglas (se eliminaron, no se corrigieron), quedando 4.828 conversaciones: 4.628 para entrenamiento y 200 reservadas para evaluación. El ajuste fino consistió en 2.300 pasos sobre esas conversaciones, con la función de pérdida aplicada solo a las líneas de Tallow y el contexto extendido a 2.048 tokens, en unos 5 minutos de cómputo.

## Capacidades

- Generación de respuestas de rol con formato fijo `[estado nivel] *acciones* sonido`, donde el estado pertenece a 8 emociones (calm, curiosity, caution, joy, play, love, sadness, anger) con nivel `min` o `max`.
- Modelado de estado afectivo persistente dentro de la ventana de contexto: la confianza sube con actos amables (8 actos para pasar de extraño a amigo) y cae a cero si se le agarra o persigue.
- Gestión de rencores: las disculpas verbales no funcionan; solo la comida reduce la ira paso a paso (anger max → anger min → caution max → caution min) con coste doble.
- Memoria de eventos traumáticos ("el scar"): tras ser agarrado, cualquier movimiento brusco provoca `[caution max]` incluso si ha recuperado la confianza.
- Imitación de palabras enseñadas deliberadamente tres veces, con producción imperfecta en el primer intento (`tal...` → `TAL-low`).
- Respuesta a vocalizaciones del usuario: los graznidos en minúscula despiertan curiosidad y `KAW KAW KAW` en mayúsculas provoca búsqueda de peligro.
- Repertorio de conductas de vida de cuervo: reacción a búhos (ira), cuervos muertos (tristeza), perros (juego), nieve, lluvia, "anting" y almacenamiento de comida.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento matemático o de código. El multilingüismo es inexistente: solo inglés y vocabulario enseñado.

## Casos de uso

- Investigación sobre inyección de reglas de comportamiento en modelos pequeños: el pipeline documentado (motor de reglas + generación con LLM + filtrado + ajuste fino supervisado) sirve como plantilla reproducible para estudiar cómo un modelo de 15,7M parámetros internaliza políticas de estado sin RLHF.
- Docencia de entrenamiento from scratch: el repositorio incluye `tallow.py` con modelo, tokenizador y bucle de chat en un único archivo, ejecutable en CPU o GPU, lo que permite recorrer el ciclo completo de un LLM en una práctica de laboratorio.
- Prototipado de personajes no verbales en videojuegos o narrativa interactiva: el formato de salida estructurado (etiqueta de emoción + acciones + sonido) es directamente parseable por un motor de juego para disparar animaciones o cambios de estado, sin necesidad de un LLM grande.
- Evaluación de coherencia de rol a largo plazo: con contexto de 2.048 tokens y memoria útil de unas 25-30 interacciones, es un banco de pruebas barato para medir degradación de personaje y olvido de eventos (por ejemplo, cómo se desvanece un rencor al salir de la ventana).
- Generación de datos sintéticos de diálogo con estado: el enfoque de planificar primero con un motor de reglas y redactar después con un LLM mayor es reutilizable para crear corpus de otros personajes o dominios con restricciones duras verificables automáticamente.
- Demostración educativa de evaluación por turnos: el "scorecard" del autor (comparar la etiqueta de ánimo generada con la decidida por el motor de reglas en 200 conversaciones retenidas) es un ejemplo sencillo de métrica automática para tareas generativas con estructura fija.
- Experimentos de alineación limitada por contexto: útil para ilustrar por qué la "memoria" de un modelo sin estado externo es solo su ventana de contexto, y para probar mecanismos de resumen o memoria externa sobre una base mínima.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 200 conversaciones retenidas, comparando la etiqueta de ánimo generada (decodificación greedy, con el historial verdadero en cada turno) contra la decisión del motor de reglas. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se han publicado resultados en dichos benchmarks.

| Qué se prueba | Acierto | Turnos evaluados |
|---|---|---|
| Todos los turnos | 96,8% | 2.227 |
| Explota al ser agarrado | 100% | 57 |
| "Sorry" durante un rencor no hace nada | 100% | 51 |
| La comida deshiela el rencor paso a paso | 98,0% | 254 |
| Flinch por el scar | 100% | 18 |
| Nunca dice palabras no aprendidas | 99,9% | 2.110 |
| Responde a graznidos | 98,6% | 146 |
| Sin haber sido agarrado, solo retrocede | 87,5% | 16 |
| Primer intento de palabra enseñada en el momento correcto | 68,4% | 19 |

Advertencias del propio autor: las conversaciones de test provienen del mismo motor de reglas y redactor que las de entrenamiento, por lo que son resultados in-distribution; en cada turno se le entrega el historial verdadero, mientras que en un chat real sus propios errores permanecen en el contexto; y las filas con 16-19 turnos son muestras pequeñas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 15,7M de parámetros en fp32, aproximadamente 63 MB de pesos; en la práctica cabe holgadamente en cualquier GPU con más de 1 GB de VRAM, y también en CPU.
- GPU recomendadas: cualquiera; el autor entrenó el preentrenamiento en una RTX 3070. Para inferencia basta una GTX 1650, una RTX 3060 o incluso ejecución en CPU.
- Cabe en cualquier GPU de consumo, incluidas integradas, y en Raspberry Pi con suficiente RAM para el proceso de PyTorch.
- Opciones de despliegue: el autor proporciona `tallow.py` (PyTorch + SentencePiece + safetensors) como vía recomendada. Desaconseja explícitamente GGUF, llama.cpp u Ollama porque el tokenizador requiere dos transformaciones de texto (token `<nl>` para saltos de línea y un espacio tras cada `*` o `[` de apertura) aplicadas fuera del fichero del tokenizador, de modo que esas herramientas alimentarían al modelo con texto fuera de distribución.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la inferencia es del orden de milisegundos por turno en GPU y de decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tallow | 15,7M | 2.048 tokens | Rol de cuervo con estado afectivo, salida estructurada | Apache 2.0 | Hugging Face, pesos safetensors fp32 |
| BeeLLM (schizophyllume) | no disponible en la información proporcionada | no disponible | Modelo de personaje inspirador de Tallow | no disponible | Hugging Face |
| TinyStories (modelos de referencia) | ~1M-33M | no disponible | Generación de cuentos infantiles, preentrenamiento desde cero | no disponible | Hugging Face / paper |
| GPT-2 small | 124M | 1.024 tokens | Generación de texto generalista | MIT (pesos OpenAI) | Hugging Face |

La comparación relevante no es de rendimiento general sino de propósito: Tallow no compite con asistentes, sino con otros modelos juguete de rol o con los modelos de TinyStories, sobre cuyo dataset se preentrenó. Frente a GPT-2 small es 8 veces más pequeño y su competencia lingüística es deliberadamente nula fuera del formato de cuervo.

## Limitaciones y advertencias

- Es un juguete declarado por el autor: 15,7M de parámetros y un mundo de cuervo inventado y pequeño; no debe usarse como asistente general.
- Su memoria es la ventana de contexto (~1.900 tokens, unas 25-30 interacciones): los rencores y la confianza se desvanecen cuando el evento sale del contexto.
- Solo conoce unas pocas palabras enseñadas (tallow, hello, peanut, good boy, bye bye); el comportamiento ante palabras nuevas no está probado.
- Entradas poco habituales pueden confundirlo, por ejemplo un extraño que sostiene comida en la mano en lugar de dejarla en el suelo.
- Riesgo de alucinación en el sentido de respuestas fuera de las reglas del mundo: las métricas son in-distribution y no garantizan generalización a interacciones humanas reales.
- El tokenizador requiere preprocesado específico; usarlo con llama.cpp u Ollama produce entradas fuera de distribución y degradación del comportamiento.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo no ofrece ninguna utilidad de producción fuera de la experimentación; el autor no documenta sesgos más allá de los derivados de su corpus sintético.
- Los datos de entrenamiento se generaron con Claude Haiku 5.5, por lo que pueden heredar sesgos de estilo de ese modelo; no se documenta ninguna evaluación al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/digi-the-robot/Tallow
- Dataset de preentrenamiento TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Modelo inspirador BeeLLM: https://huggingface.co/schizophyllume/BeeLLM
