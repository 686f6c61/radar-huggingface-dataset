# david-rename/gpt-pico

## Resumen

gpt-pico es un modelo de lenguaje autoregresivo de 2.228.224 parametros desarrollado por david-rename dentro de la familia gpt-pp. Es el miembro mas pequeno de la serie y esta entrenado exclusivamente sobre TinyStories, el corpus de cuentos cortos infantiles de Eldan y Li (2023). Su proposito es generar relatos breves y coherentes en ingles con un coste computacional minimo, hasta el punto de que el autor afirma que puede ejecutarse en cualquier CPU y en una pagina web.

Arquitectura transformer densa de 6 capas, anchura 128 y 4 cabezas de atencion de 32 dimensiones, con MLP de 512 unidades y activacion squared ReLU. Emplea un vocabulario de 4096 tokens (BPE a nivel de byte entrenado sobre los propios cuentos) y una ventana de contexto de 256 tokens. Incorpora posiciones rotatorias, RMS norm sin ganancias, normalizacion de queries y keys con un factor que hace que la puntuacion de atencion sea 12 veces el coseno entre query y key, tablas de embedding no atadas y logits limitados a 15.

Su relevancia es fundamentalmente educativa y experimental: demuestra que un modelo de apenas 2 millones de parametros, entrenado en 4,4 minutos sobre una unica GPU, puede producir texto narrativo gramaticalmente coherente en un dominio muy restringido. No esta pensado para uso general ni para produccion, sino como pieza minima de una serie que explora recetas de entrenamiento (gpt-pp-base de 135M, gpt-pp-chat y este gpt-pico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (NanoChat / gpt-pp), 6 capas, anchura 128, 4 cabezas de 32 |
| Parametros totales | 2.228.224 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32), con codigo custom (`modeling_gptpp.py`) |
| MLP | 512 unidades, activacion squared ReLU |
| Vocabulario | 4096 tokens, BPE a nivel de byte |
| Normalizacion | RMS norm sin ganancias; queries y keys normalizadas (score = 12 x coseno) |
| Posiciones | rotary positions |
| Embeddings | tablas no atadas (untied) |
| Logits | limitados a 15 |
| Libreria | transformers (probado con 5.23.0) |

## Arquitectura y entrenamiento

El modelo sigue la receta de NanoChat, que a su vez es la receta de gpt-pp de 2026 con una unica diferencia: gpt-pp multiplica cada query normalizada por una ganancia, de modo que la puntuacion de atencion equivale a 12 veces el coseno entre query y key. Como esa ganancia actua despues de una normalizacion, no puede representarse modificando los pesos, por lo que el modelo la implementa en `modeling_gptpp.py`, una subclase de NanoChat de unas 30 lineas, lo que obliga a usar `trust_remote_code=True`. Ademas, en W_Q y W_K se niega la segunda mitad de las filas de cada cabeza para adaptar la orientacion de los pares rotatorios de NanoChat; la conversion (`scripts/export_hf.py`) verifica los logits contra el codigo original de gpt-pp y en float64 ambas implementaciones coinciden hasta 7.7e-14.

El entrenamiento consistio en una sola pasada sobre el conjunto de entrenamiento de TinyStories, 540 millones de tokens, en una unica GPU durante 4,4 minutos. No se menciona uso de RLHF, DPO ni ajuste de instrucciones: es un modelo base de generacion de cuentos. Sobre historias no vistas alcanza 0.55 bits por byte. El repositorio documenta 90 peculiaridades, problemas conocidos y bugs corregidos del codigo, cada uno con su evidencia y su efecto sobre las metricas, en `docs/KNOWN-ISSUES.md`.

## Capacidades

- Generacion de texto narrativo en ingles dentro del dominio de cuentos infantiles breves (estilo TinyStories).
- Continuacion de prompts sencillos, por ejemplo "Once upon a time", con hasta 150 tokens nuevos en el ejemplo del autor.
- Coherencia local a corto plazo: personajes, acciones y objetos simples dentro de la ventana de 256 tokens.
- Ejecucion en CPU sin GPU, gracias a su tamano de 2,2 millones de parametros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No dispone de modo thinking, vision ni audio.
- No es un modelo ajustado a instrucciones (no hay evidencia de chat o dialogo).

## Casos de uso

- Generacion de cuentos infantiles sinteticos: el modelo produce relatos cortos y gramaticalmente correctos en ingles a partir de una frase inicial, util para generar corpus de prueba o material de ejemplo en demostraciones de NLP.
- Docencia y divulgacion: sirve para explicar de forma tangible como funciona un transformer generativo, ya que sus 6 capas y 2,2 millones de parametros permiten inspeccionar pesos y activaciones sin infraestructura.
- Pruebas de pipelines de inferencia: al caber en CPU, es adecuado para validar integraciones con transformers, tokenizadores y flujos de generacion antes de escalar a modelos mayores.
- Demos web interactivas: el autor indica que en la serie gpt-pp se ejecuta directamente en una pagina web, lo que lo hace apto para demos ligeras de generacion de texto en el navegador o en servidores modestos.
- Generacion de datos de relleno para pruebas de UI: permite poblar interfaces con texto narrativo realista sin coste de API ni dependencia de servicios externos.
- Experimentacion con tecnicas de exportacion y compatibilidad: su conversion a formato transformers con codigo custom sirve como caso de estudio para verificar equivalencia numerica entre implementaciones (comprobacion de logits a 7.7e-14).
- Benchmarking de infraestructura minima: util para medir latencia y throughput en entornos sin GPU y comparar con modelos mayores en la misma tarea.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Bits por byte en historias no vistas (held-out) | 0.55 |
| Tokens de entrenamiento | 540 millones (una pasada sobre TinyStories) |
| Tiempo de entrenamiento | 4,4 minutos en una GPU |
| Parametros | 2.228.224 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,2 millones de parametros x 4 bytes ≈ 9 MB de pesos, mas overhead de activaciones y tokenizador); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, GTX 1060, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en todas las gamas actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (probado con 5.23.0); el autor menciona ejecucion en pagina web dentro de la serie gpt-pp. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-pico | 2,2 M | 256 | Cuentos infantiles (TinyStories) | no disponible | Hugging Face (custom code) |
| gpt-pp-base | 135 M | no disponible | Texto web | no disponible | Hugging Face |
| gpt-pp-chat | no disponible (derivado de base) | no disponible | Dialogo / respuesta | no disponible | Hugging Face |
| Modelos TinyStories de referencia (Eldan y Li, 2023) | 1 M - 33 M aprox. | no disponible | Cuentos infantiles | no disponible | No disponible en esta ficha |

La comparativa se limita a los modelos de la misma familia gpt-pp, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente restringido: entrenado solo con TinyStories, no es fiable fuera de la generacion de cuentos infantiles en ingles.
- Ventana de contexto muy corta (256 tokens), lo que impide mantener coherencia en textos largos o conversaciones multi-turno.
- Solo ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- No es un modelo ajustado a instrucciones: no cabe esperar respuestas a preguntas, razonamiento ni seguimiento de comandos.
- Riesgo de alucinacion y de deriva narrativa dentro de su propio dominio, agravado por el tamano minimo del modelo.
- Requiere `trust_remote_code=True` para cargar el codigo custom (`modeling_gptpp.py`), lo que implica ejecutar codigo del autor; conviene revisarlo antes de usarlo en entornos sensibles.
- Licencia no disponible: no puede confirmarse el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- El autor documenta 90 problemas conocidos y bugs corregidos en `docs/KNOWN-ISSUES.md`; es recomendable revisarlos antes de confiar en el modelo para cualquier tarea.
- Sin datos publicados de sesgos, toxicidad o evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/david-rename/gpt-pico
- Modelo base de la familia: https://huggingface.co/david-rename/gpt-pp-base
- Modelo de chat de la familia: https://huggingface.co/david-rename/gpt-pp-chat
- Repositorio con problemas conocidos: https://github.com/d-/gpt-pp/blob/main/docs/KNOWN-ISSUES.md
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
