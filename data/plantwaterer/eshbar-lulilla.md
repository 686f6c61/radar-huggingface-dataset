# plantwaterer/eshbar-lulilla

## Resumen

Eshbar-lulilla es un ajuste fino completo del modelo google/gemma-4-31B-it, desarrollado por el usuario plantwaterer y publicado en Hugging Face. No es un modelo conversacional de propósito general: está especializado en toma de decisiones sobre preguntas de opción múltiple, con un motor propio (`eshbar_lulilla:Engine`) que combina inferencia estándar del transformer con un almacén de conocimiento y un ejecutor aritmético exacto para preguntas numéricas o de sí/no. El modelo hereda la arquitectura Gemma 4 de 31 273 088 876 parámetros y una ventana de contexto de 32 768 tokens.

La relevancia del modelo reside en su enfoque híbrido: cuando la primera pasada de inferencia no alcanza un umbral de confianza (0,925 para opciones numéricas, 0,75 para sí/no), el sistema delega en un almacén de estadísticas a nivel de país o genera un pequeño programa Python que se ejecuta en un kernel GPU, cambiando la respuesta solo si el valor calculado coincide exactamente con una opción. Esta arquitectura busca reducir errores en tareas de decisión estructurada, y el autor reporta una puntuación pública de 70,27 en el Decision Index 0.3.

El modelo se distribuye con licencia Apache-2.0, incluye pesos en safetensors (63,7 GB de repositorio) y está pensado para ejecutarse en una única GPU con al menos 75 GB de VRAM en bf16. No se han publicado datos sobre idiomas soportados ni resultados de benchmarks independientes más allá de la puntuación del Decision Index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), con capas de atención completa y de ventana deslizante; incluye cabecera de predicción multi-token (draft head) |
| Parámetros totales | 31 273 088 876 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (max_len) |
| Tipos de cuantización | No disponible (el autor solo menciona bf16 para inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (continued full fine-tune) de plantwaterer/liquamen, que a su vez deriva de google/gemma-4-31B-it. Incorpora una cabecera propia de última capa y un motor de inferencia empaquetado en el repositorio (`eshbar_lulilla:Engine`), con ficheros de motor, cabecera, almacén y ejecutor fijados por MD5 en `PINS.json` y verificados en la carga. La inferencia se realiza en bf16 con atención empaquetada para documentos: las capas de atención completa son bidireccionales dentro de un prompt, mientras que las capas de ventana deslizante son causales. Para peticiones por debajo de un límite de longitud, la respuesta se promedia sobre 4 órdenes de opciones. En decisiones binarias sí/no se integra una posterior de Laplace.

El entrenamiento parte de los datos de liquamen, que incluyen registros de ANLI (CC BY-NC 4.0) y ACOS (sin licencia declarada aguas arriba). A esta base se añaden particiones de entrenamiento descontaminadas de CLINC150 (CC BY 3.0), BANKING77 (CC BY 4.0), HoVer (CC BY-SA 4.0), WinoGrande (CC BY) y las cohortes del Habermas Machine (CC BY 4.0); posiciones de entrenamiento de ChessBench etiquetadas con Stockfish (CC BY 4.0, porciones CC0); preguntas sintéticas generadas con los constructores de tareas del kit público Decision Index (simulador de electrodomésticos y vocabulario de acordes POP909), eliminando todos los problemas de desarrollo y test del kit; y datos de LLM Bayesian Teaching Data (CC BY 4.0), MedMCQA (MIT) y preguntas sintéticas del autor. El autor declara que no se utilizó ninguna partición de test de ningún benchmark.

La innovación técnica principal es el mecanismo de respuesta en dos pasadas: si la primera pasada no supera los umbrales de confianza, el sistema puede (a) consultar un almacén de conocimiento incluido con estadísticas a nivel de país, o (b) generar una función Python corta (decodificación greedy de hasta 320 tokens nuevos) con una cabecera de borrador de predicción multi-token cuyas propuestas verifica el propio modelo token a token, y ejecutarla con un ejecutor de aritmética exacta en un kernel GPU (con intérprete de respaldo de resultados idénticos). La respuesta solo cambia si el valor devuelto coincide exactamente con una opción y la función lo ha calculado; en ese caso la opción elegida recibe probabilidad 0,99 y el resto se reparte proporcionalmente a la primera pasada.

## Capacidades

- Toma de decisiones sobre preguntas de opción múltiple, con especial énfasis en opciones numéricas y binarias sí/no.
- Razonamiento estructurado mediante generación de programas Python cortos para cálculo exacto cuando la respuesta directa no es fiable.
- Consulta a un almacén de conocimiento integrado con estadísticas a nivel de país.
- Decodificación especulativa mediante cabecera de borrador multi-token (Gemma-4 multi-token-prediction assistant), con verificación token a token por el propio modelo.
- Generación de texto conversacional (pipeline declarado: text-generation).
- Procesamiento de imagen y texto (tag image-text-to-text), heredado de la arquitectura Gemma 4 multimodal.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el flujo de dos pasadas es específico de la tarea de decisión.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automatizada de exámenes tipo test con opciones numéricas: el modelo responde preguntas de opción múltiple y, cuando la confianza es baja, genera y ejecuta una función Python para calcular el valor exacto, lo que resulta adecuado para preguntas de estadística o aritmética donde la respuesta directa del LLM es propensa a error.
- Sistemas de decisión binaria en producción: para preguntas de sí/no, la integración de una posterior de Laplace sobre las decisiones binarias proporciona una salida probabilística calibrada, útil en flujos de aprobación o verificación automatizada.
- Consulta de indicadores socioeconómicos por país: el almacén de conocimiento integrado (basado en datos de Our World in Data, V-Dem y otras fuentes) permite responder preguntas numéricas sobre estadísticas nacionales cuando el valor coincide exactamente con una de las opciones.
- Investigación en evaluación de modelos de decisión: el modelo se integra con el kit apolinario/decision-index mediante un comando de ejecución reproducible, lo que facilita la comparación de puntuaciones en el Decision Index 0.3.
- Clasificación de intenciones y dominios conversacionales: el ajuste incluye particiones de entrenamiento de CLINC150 y BANKING77, por lo que puede emplearse en tareas de enrutamiento de consultas en asistentes de banca o atención al cliente, aunque no se han publicado métricas específicas para estas tareas.
- Razonamiento sobre posiciones de ajedrez: el entrenamiento con posiciones de ChessBench etiquetadas por Stockfish sugiere capacidad para evaluar o seleccionar jugadas en formato de decisión estructurada.
- Despliegue en una única GPU de alta gama: con 62 GB de pesos en bf16, cabe en una RTX PRO 6000 (96 GB), lo que permite servir el modelo en una sola tarjeta para entornos de investigación o evaluación por lotes.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (puntuación pública) | 70,27 | Autoevaluado por el autor (self-run) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta latencias medidas en una RTX PRO 6000 Blackwell sobre 1 000 peticiones: mediana 302 ms, media 693 ms, p80 928 ms, p95 2 165 ms en la muestra pública del tablero; en una muestra de 1 000 peticiones con el triple de tasa de enrutamiento, mediana 195 ms, media 421 ms, p80 347 ms. La carga del modelo y el calentamiento (hasta unos cuatro minutos) no están incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 75 GB en bf16 (pesos de 62 GB).
- GPU recomendadas: una RTX PRO 6000 (96 GB) es suficiente según el autor; no se mencionan A100 ni H100 en la información disponible.
- ¿Cabe en GPU de consumo? No: 62 GB de pesos en bf16 exceden la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: el motor propio `eshbar_lulilla:Engine` se ejecuta en proceso desde el repositorio, invocado mediante el kit decision-index (`python -m decision_index run --engine eshbar_lulilla:Engine`). El kernel del ejecutor se distribuye precompilado para sm_75 a sm_120. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 302 ms y p95 de 2 165 ms por petición en la muestra pública de 1 000 solicitudes; mediana de 195 ms en la muestra con mayor tasa de enrutamiento. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plantwaterer/eshbar-lulilla | 31 273 088 876 | 32 768 tokens | Decisión sobre opción múltiple con motor híbrido | Apache-2.0 | Hugging Face (933 descargas) |
| google/gemma-4-31B-it | No disponible en la información proporcionada | No disponible | Modelo base conversacional multimodal | No disponible en la información proporcionada | Hugging Face (modelo base) |
| plantwaterer/liquamen | No disponible en la información proporcionada | No disponible | Modelo base del ajuste fino | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisiones de opción múltiple; su uso como modelo conversacional general no está validado y las capacidades fuera de ese dominio no están documentadas.
- Riesgo de alucinación en la primera pasada: el mecanismo de segunda pasada solo se activa bajo condiciones estrictas (pregunta única, opciones numéricas o sí/no, y confianza por debajo de los umbrales 0,925 o 0,75); en el resto de casos la respuesta es la de la primera pasada sin verificación adicional.
- El almacén de conocimiento cubre únicamente estadísticas a nivel de país y está licenciado CC BY-SA 4.0, con datos de Our World in Data (CC BY 4.0) y V-Dem (CC BY-SA 4.0); los valores están redondeados a tres cifras significativas y reindexados, por lo que no deben usarse como fuente primaria.
- Los datos de entrenamiento incluyen ANLI (CC BY-NC 4.0), de uso no comercial, y ACOS, sin licencia declarada aguas arriba; aunque los pesos se publican como Apache-2.0, estas procedencias deben tenerse en cuenta en una revisión legal para uso comercial.
- Idiomas soportados no documentados; no hay garantías de rendimiento multilingüe.
- El modelo requiere una GPU con al menos 75 GB de VRAM en bf16, lo que limita su despliegue a hardware profesional.
- La puntuación de 70,27 en el Decision Index 0.3 es autoevaluada por el autor (self-run) y no ha sido verificada de forma independiente.
- La generación de programas Python y su ejecución en un kernel GPU introduce una superficie de fallo adicional; el autor indica que el intérprete de respaldo produce resultados idénticos, pero no se detallan los modos de fallo del kernel.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparativas independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/eshbar-lulilla
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo predecesor: https://huggingface.co/plantwaterer/liquamen
- Kit Decision Index: https://huggingface.co/apolinario/decision-index
- Ejecutor derivado de LOOM: https://github.com/mkturkcan/Loom
- ChessBench (searchless_chess): https://github.com/google-deepmind/searchless_chess
- LLM Bayesian Teaching Data: https://doi.org/10.5281/zenodo.17677329
- MedMCQA: https://github.com/medmcqa/medmcqa
