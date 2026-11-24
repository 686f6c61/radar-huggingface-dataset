# akshay-commits-code/qwen3-30b-a3b-10pct-voice-router

## Resumen

El modelo `akshay-commits-code/qwen3-30b-a3b-10pct-voice-router` es una compresión extrema del modelo base `Qwen/Qwen3-30B-A3B-Instruct-2507` de Alibaba Qwen, especializada en una única tarea: el enrutamiento de peticiones de un asistente de voz hacia una de siete habilidades (weather, email, transport, lists, calendar, home, news). El autor, `akshay-commits-code`, lo presenta como un experimento de compresión al 9,89% del tamaño original en fp16 (6,04 GB frente a 61.064.245.248 bytes), preservando un 99,36% de acierto sobre los ítems que el modelo base resolvía correctamente en un examen bloqueado de 2.910 ítems.

La arquitectura subyacente es un transformer MoE (`qwen3_moe`) con 30,5B parámetros totales en el modelo base, del cual se conservan 2.640 de los 6.144 expertos enrutados (entre 37 y 81 por capa, variable), y se cuantizan los pesos con códigos asimétricos de 3 bits para expertos, 6 bits para atención, 5 bits para embeddings y 4 bits para la capa de salida. El artefacto resultante declara 5.755.129.856 parámetros en safetensors y un tamaño de repo de 6,1 GB.

Su relevancia es doble: por un lado, demuestra una metodología de poda de expertos específica de tarea combinada con cuantización round-to-nearest sin entrenamiento de pesos; por otro, incorpora un mecanismo de "feedback" que restaura grupos de expertos podados (35 expertos) a partir de correcciones anotadas, sin modificar ningún valor de peso, mejorando el rendimiento en hindi del 54,35% al 90,77%. Es un artefacto de investigación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3 MoE, `Qwen3MoeForCausalLM`) |
| Parametros totales | 5.755.129.856 (artefacto comprimido); modelo base: 30,5B |
| Parametros activos | no disponible en el artefacto; el modelo base Qwen3-30B-A3B activa 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: expertos 3 bits asimétrico, atención 6 bits, embeddings 5 bits, salida 4 bits; normas y router en bf16 |
| Idiomas soportados | en (declarado); el feedback evalúa hindi, turco y árabe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (códigos empaquetados en bits; reconstrucción vía `artifact.load()`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-30B-A3B-Instruct-2507`, un transformer MoE con 30,5B parámetros totales y 6.144 expertos enrutados por capa. La compresión se realiza sin ningún entrenamiento de pesos: primero se aplica una poda de expertos específica de tarea, conservando 2.640 de los 6.144 expertos, seleccionados por su cuota de masa de enrutamiento top-8 sobre texto de calibración no etiquetado (peticiones de la tarea más inglés genérico). El router se recorta a los expertos conservados, de modo que es exactamente el router base restringido a ese subconjunto, y cada experto conservado es una rebanada byte-exacta del original.

Después se aplica cuantización round-to-nearest con códigos asimétricos: 3 bits para expertos, 6 bits para atención, 5 bits para embeddings y 4 bits para la capa de salida, con un escalar fp16 compartido por cada grupo de 128 pesos, elegido de una rejilla fija por MSE de pesos. Normas y router permanecen en bf16. No se usa GPTQ ni optimización alguna de pesos. Los códigos se empaquetan en bits dentro de safetensors y `artifact.load()` reconstruye un `Qwen3MoeForCausalLM` estándar de Hugging Face con menos expertos por capa. El mecanismo de feedback (`feedback.py`) traza, para los ítems fallados, a qué expertos podados enviaría el router base esas peticiones, y restaura el grupo mejor rankeado (35 expertos) con la misma regla de redondeo a 3 bits y la fila de router del modelo base, ocupando el margen disponible bajo el 10% de tamaño.

## Capacidades

- Clasificación de peticiones de asistente de voz en siete habilidades: weather, email, transport, lists, calendar, home (dispositivos de hogar inteligente) y news.
- Generación greedy libre del nombre de la habilidad como salida real del modelo (no clasificador auxiliar ni lookup).
- Enrutamiento multilingüe parcial: el autor reporta evaluación en hindi (MASSIVE hi-IN), turco y árabe mediante el mecanismo de feedback.
- Aprendizaje a partir de correcciones: `feedback.py` acepta hasta 25 ítems anotados (`{"text": ..., "label": ...}`) y restaura expertos podados para corregir errores.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking de forma declarada.
- No es un modelo de generación de texto general: su utilidad está acotada a la tarea de enrutamiento.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz: el modelo recibe la transcripción de una petición y devuelve la habilidad que debe gestionarla, con un 99,36% de fidelidad sobre los ítems que el modelo base resolvía correctamente en el examen bloqueado.
- Despliegue en dispositivos con recursos limitados: al ocupar 6,04 GB en lugar de 61 GB, permite servir el enrutador en GPUs de una sola tarjeta con cuantización de 3-6 bits, algo inviable con el modelo base en fp16.
- Personalización por idioma con correcciones mínimas: con 24 correcciones reales en hindi, el modelo pasa del 54,35% al 90,77% en el conjunto bloqueado, lo que permite adaptar el enrutador a un mercado lingüístico concreto sin reentrenar.
- Filtrado previo en pipelines de agentes: como primera etapa que clasifica la petición antes de invocar herramientas específicas (calendario, correo, domótica), reduciendo el coste frente a usar el modelo base completo.
- Investigación en compresión de MoE: sirve como referencia reproducible de poda de expertos por masa de enrutamiento y cuantización mixta sin entrenamiento, con protocolo pre-registrado y resultados bloqueados.
- Evaluación de robustez multilingüe: el mecanismo de feedback se probó en turco (68,07% → 87,86%) y árabe (74,14% → 90,50%), útil para estudiar la transferencia de correcciones entre idiomas.
- Prototipado de asistentes de hogar: la etiqueta `home` permite clasificar comandos de dispositivos domésticos dentro de un pipeline mayor, con la salvedad del bajo rendimiento base en esa etiqueta (26,2% antes del feedback en hindi).

## Benchmarks y rendimiento

Resultados reportados por el autor en el examen bloqueado (2.910 ítems: 2.310 de MASSIVE, 600 de CLINC150, al menos 330 por etiqueta):

| Medida | Resultado |
|---|---|
| Tamaño del artefacto | 6.039.657.231 B = 9,891% del fp16 (antes del feedback); 6.105.631.828 B = 9,9987% (después) |
| Fidelidad (ítems correctos del base conservados) | 99,36% (2.775 / 2.793) antes; 99,32% después |
| Peor etiqueta en el examen | 98,56% (weather) |
| MASSIVE | 99,42% |
| CLINC150 (fuente distinta) | 99,12% |
| Modelo base en el examen | 95,98% |
| Modelo pequeño en el examen | 96,12% |

Resultados del feedback en el conjunto bloqueado de hindi (379 peticiones, MASSIVE hi-IN):

| Medida | Resultado |
|---|---|
| Base en el conjunto bloqueado | 94,99% |
| Modelo pequeño sin feedback | 54,35% |
| Modelo pequeño tras feedback | 90,77% (142 corregidos, 4 rotos) |
| Feedback vacío | 54,35% |
| Etiquetas barajadas (semillas 1-6) | 54,35% en las seis; 0 expertos restaurados |
| Expertos restaurados por feedback real | 35 |

Rendimiento por etiqueta en hindi (antes → después): calendar 50,0% → 86,2%; email 78,8% → 90,0%; home 26,2% → 91,2%; lists 44,4% → 97,2%; news 0,0% → 66,7%; transport 42,5% → 92,5%; weather 90,7% → 96,3%. En dev: turco 68,07% → 87,86%; árabe 74,14% → 90,50%.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ocupa 6,04 GB en disco; la reconstrucción a un `Qwen3MoeForCausalLM` estándar con menos expertos requiere cargar los pesos descomprimidos, por lo que la VRAM real será superior al tamaño del artefacto (no se especifica cifra exacta en la información disponible).
- GPU recomendadas: el autor ejecutó la evaluación en una NVIDIA H100 80GB HBM3 (12 de noviembre) y en una A100 (7 de noviembre).
- Cabe en GPU de consumo: no confirmado; el tamaño del artefacto (6,1 GB) sugiere que podría caber en GPUs de 12-16 GB tras la reconstrucción, pero no hay datos publicados.
- Opciones de despliegue: carga mediante `artifact.load()` y ejecución con `answer.py` y `feedback.py` como procesos separados; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: `feedback.py` tardó 169 s en un H100; no se reportan latencias de inferencia por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-30b-a3b-10pct-voice-router | 5,76B (artefacto) | no disponible | 96,12% en examen bloqueado; 90,77% en hindi tras feedback | apache-2.0 | Hugging Face |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (base) | 30,5B (3B activos) | no disponible | 95,98% en examen bloqueado; 94,99% en hindi | apache-2.0 | Hugging Face |
| Modelo pequeño de referencia citado por el autor | no disponible | no disponible | 96,12% en examen bloqueado | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en una única tarea de enrutamiento de siete etiquetas; no es adecuado para generación de texto general, código, matemáticas ni razonamiento abierto.
- El examen bloqueado se abrió dos veces (7 y 12 de noviembre); el autor reconoce que la ejecución bloqueada del paso de feedback terminó a las 17:21 UTC, después del plazo de las 17:05 UTC, aunque la pre-registración y los resultados de dev eran públicos antes.
- Diferencias numéricas entre lotes: la ejecución en H100 frente a A100 produce pequeñas variaciones (99,28% vs 99,36% de fidelidad antes del feedback), y el autor mide sensibilidad al lote en la enmienda 5.
- El feedback solo acepta hasta 25 ítems anotados y restaura un máximo de 35 expertos (el margen bajo el 10%); no es un mecanismo de aprendizaje continuo ilimitado.
- El rendimiento en la etiqueta `news` en hindi tras el feedback es solo del 66,7%, y en `home` partía del 26,2% antes de las correcciones.
- Idiomas declarados: solo `en`; el soporte multilingüe se evalúa empíricamente pero no está garantizado.
- Riesgo de alucinación: al ser un clasificador de etiquetas cerradas, el riesgo se limita a asignar una habilidad incorrecta, no a generar contenido falso.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3-30B-A3B-Instruct-2507 también es apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akshay-commits-code/qwen3-30b-a3b-10pct-voice-router
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Artefacto (6,04 GB): https://huggingface.co/akshay-commits-code/qwen3-30b-a3b-10pct-voice-router
- Dataset MASSIVE (referenciado en la evaluación): no disponible como enlace en la información proporcionada
- Dataset CLINC150 (referenciado en la evaluación): no disponible como enlace en la información proporcionada
- Repositorio de código (`feedback.py`, `answer.py`, `PROTOCOL.md`): no disponible como enlace en la información proporcionada
