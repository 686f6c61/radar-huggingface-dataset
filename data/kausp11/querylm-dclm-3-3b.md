# Kausp11/querylm-dclm-3.3b

## Resumen
QueryLM 3.3B (DCLM-Edu) es un modelo de lenguaje base de 3.322 millones de parámetros (5.539 millones almacenados, incluyendo embeddings de valor) desarrollado por el usuario independiente Kausp11. Se entrena desde cero sobre el corpus web DCLM-Edu con una particularidad: durante el preentrenamiento se insertan bloques de búsqueda en el texto, de modo que en los puntos donde una consulta externa ayudaría a predecir lo siguiente, el texto de entrenamiento contiene una consulta seguida de un pasaje recuperado. El modelo aprende así a formular consultas y a utilizar los pasajes, aunque nunca genera los pasajes: los aporta el llamador.

La arquitectura es un decoder estilo nanochat con 32 capas, anchura 2.816, 22 cabezas de atención, feed-forward de 11.264 y dimensión de cabeza 128, con una ventana de contexto de 4.095 tokens. El tokenizador parte del de SmolLM2 y añade cuatro tokens especiales para delimitar los bloques de búsqueda, alcanzando un vocabulario de 49.156 entradas. El modelo se distribuye en formato safetensors y requiere `trust_remote_code=True` para cargar el módulo `modeling_nanochat.py` incluido en el repositorio.

Su relevancia radica en que aborda el uso de herramientas de recuperación como parte del preentrenamiento y no como un añadido posterior mediante fine-tuning o prompting. Esto lo convierte en un caso de estudio interesante para investigadores que exploran modelos con capacidad de búsqueda integrada, aunque su estado es experimental: es un modelo base sin formato de chat, con cero descargas y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo nanochat (32 capas, anchura 2.816, 22 cabezas, FFN 11.264, head dim 128) |
| Parametros totales | 3.322,3 M reportados; 5.539,7 M almacenados (incluye embeddings de valor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (3 shards) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura nanochat, un decoder transformer denso con 32 capas, anchura de 2.816, 22 cabezas de atención con dimensión de cabeza 128 y capa feed-forward de 11.264. La innovación principal no está en la arquitectura sino en el formato de los datos: el texto de preentrenamiento incluye bloques con la estructura `<WEB_QUERY>consulta</WEB_QUERY> <WEB_RESPONSE>pasaje</WEB_RESPONSE>`, insertados por un modelo anotador (Gemma 4 E4B-it con un adaptador LoRA) en posiciones donde una búsqueda sería útil, con probabilidad de inserción mínima de 0,05 y separación mínima de 40 caracteres. Las consultas tienen como máximo 24 tokens y los pasajes provienen de recuperación BM25 sobre el corpus Sphere, acortados mediante limpieza extractiva. Una inserción solo se conserva si el pasaje solapa con el texto posterior del documento (ROUGE-1 F1 de al menos 0,1 frente a los siguientes 260 caracteres).

El entrenamiento se realizó desde cero con 95.172 actualizaciones, 99.800 millones de tokens procesados (64.000 millones de tokens de documento), 2,35e21 FLOPs y cómputo en bf16. El optimizador es Muon para los pesos matriciales (LR máximo 0,02828) y AdamW para embeddings y cabeza de salida, con lotes de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualización), 40 pasos de calentamiento, fase constante y decaimiento lineal hasta el 5% del pico. La función de pérdida cubre el texto, la consulta y las etiquetas de consulta; los pasajes y sus etiquetas no contribuyen a la pérdida, por lo que el modelo no aprende a generarlos.

## Capacidades
- Generación de texto autoregresiva como modelo causal estándar, sin necesidad de usar el mecanismo de búsqueda.
- Formulación de consultas de búsqueda: el modelo escribe consultas de hasta 24 tokens al abrir un bloque `<WEB_QUERY>`.
- Uso de pasajes recuperados: integra la información del pasaje insertado por el llamador para continuar la generación.
- Razonamiento de tipo pregunta-respuesta mediante ejemplos few-shot en el prompt (el modelo base no tiene formato de chat).
- Capacidad de búsqueda controlable: se puede desactivar la generación de consultas mediante `bad_words_ids` sobre el token de apertura.
- No soporta tool calling genérico, agentes multi-paso ni modos de pensamiento explícitos más allá del mecanismo de búsqueda descrito.
- Multilingüe: no disponible; solo se declara inglés.

## Casos de uso
- Investigación sobre modelos con recuperación integrada: sirve para estudiar cómo el preentrenamiento con bloques de búsqueda afecta a la capacidad de formular consultas y de incorporar evidencia externa, comparándolo con la línea base estándar del mismo cómputo.
- Respuesta a preguntas con recuperación (RAG) controlada por el modelo: el llamador conecta un recuperador propio (BM25, API de búsqueda web) y deja que el modelo decida cuándo y qué consultar, en lugar de recuperar siempre antes de generar.
- Experimentos de prompting few-shot: al ser un modelo base, se le puede guiar con ejemplos de formato pregunta-respuesta para tareas de conocimiento factual acotado.
- Evaluación de pipelines de recuperación: permite medir la calidad de las consultas generadas y la fidelidad de las respuestas condicionadas al pasaje, aislando el comportamiento del recuperador.
- Generación de texto condicionada a contexto corto: tareas de continuación de texto o completado donde la ventana de 4.095 tokens sea suficiente y no se requiera búsqueda.
- Docencia y prototipado: modelo pequeño (3.3B) que se puede ejecutar en hardware modesto para demostrar el funcionamiento de la búsqueda intercalada con el ejemplo de código de la model card.
- Análisis de sesgos en consultas generadas: estudiar qué tipo de consultas produce el modelo y si reflejan sesgos del corpus DCLM-Edu o del anotador.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una demostración cualitativa del mecanismo de búsqueda (consulta "capital of Australia" y respuesta "Canberra" con un pasaje fijo), que el propio autor advierte que muestra la mecánica y no la precisión del modelo.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 11 GB solo para pesos (5.539,7 M parámetros), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB para contexto completo.
- En cuantización de 8 bits: alrededor de 5,5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque el repositorio no publica versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con contexto completo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16.
- GPU de consumo: cabe en tarjetas con 16 GB o más en bf16; en 8 GB solo mediante cuantización agresiva no publicada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el código personalizado de nanochat puede no ser compatible con esos motores sin adaptación.
- Latencia y throughput: no disponibles; el autor solo reporta una ejecución en CPU con bfloat16, torch 2.8.0 y transformers 4.56.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| QueryLM 3.3B (DCLM-Edu) | 3.322 M reportados (5.540 M almacenados) | 4.095 | No disponible | Hugging Face, safetensors | Preentrenamiento con bloques de búsqueda; modelo base |
| SmolLM2-1.7B | 1.700 M | 8.192 | Apache 2.0 | Hugging Face | Base y instruct; sin búsqueda integrada; tokenizador compartido en parte |
| Qwen2.5-3B | 3.090 M | 32.768 | Apache 2.0 | Hugging Face | Base e instruct; contexto muy superior; sin búsqueda integrada |
| Llama 3.2-3B | 3.210 M | 131.072 | Llama 3.2 Community License | Hugging Face | Base e instruct; contexto muy superior; sin búsqueda integrada |

La comparación es aproximada: los tres modelos alternativos son mucho más maduros, con licencias claras, versiones instruct y ecosistema de despliegue amplio. QueryLM se diferencia por el mecanismo de búsqueda intercalada, pero carece de benchmarks publicados que permitan comparar rendimiento real.

## Limitaciones y advertencias
- Es un modelo base sin formato de chat ni ajuste por instrucciones; requiere few-shot o prompting manual para tareas concretas.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- Ventana de contexto de 4.095 tokens, muy inferior a la de modelos contemporáneos de tamaño similar.
- El modelo no genera pasajes: depende de un recuperador externo que el llamador debe proporcionar y cuya calidad condiciona las respuestas.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Riesgo de alucinación inherente a un modelo base preentrenado solo en texto web, sin RLHF ni DPO documentados.
- Sesgos potenciales heredados de DCLM-Edu y del anotador Gemma 4 E4B-it con LoRA, sin evaluación publicada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; se recomienda fijar `revision=` a un commit revisado.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes de terceros.
- No hay benchmarks publicados ni comparación con la línea base estándar del mismo cómputo, que el autor menciona pero no publica en este conjunto.
- Los shards safetensors tienen hashes sha256 publicados parcialmente (el tercero aparece truncado en la model card).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-dclm-3.3b
- Versión con fine-tuning de chat y búsqueda: https://huggingface.co/Kausp11/querylm-dclm-3.3b-sft-search
- Dataset DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Corpus Sphere: https://github.com/facebookresearch/Sphere
- Código nanochat (upstream): no disponible como enlace directo en la información proporcionada; el commit referenciado es `92d63d4`
