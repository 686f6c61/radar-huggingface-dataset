# Remek/basal-omni-2.0-mini-preview-GGUF

## Resumen

basal-omni-2.0-mini-preview es un modelo experimental de toma de decisiones desarrollado por Remek, afinado a partir de una base Gemma 4 E4B con 7.463.013.674 parámetros totales. No es un modelo generativo al uso: está diseñado para leer un estado o contexto y devolver una decisión tipada (elección entre opciones, sí/no, clasificación) con probabilidades calibradas. Se distribuye bajo licencia Apache 2.0 y soporta polaco e inglés.

Este repositorio concreto contiene únicamente los pesos en formato GGUF (cuantizaciones Q8_0 y Q6_K) para llama.cpp, LM Studio y Ollama, y es solo texto: los codificadores de imagen y audio del modelo original no están incluidos. El autor lo marca explícitamente como experimental y no recomendado, porque el modelo original lee el estado en dos direcciones antes de responder y llama.cpp solo puede leerlo en una, lo que degrada la precisión de forma medible.

La relevancia de esta ficha es doble: documenta un caso poco habitual de modelo orientado a decisiones con calibración explícita, y sirve como advertencia sobre cómo una limitación del runtime (lectura unidireccional) puede anular buena parte de la ventaja de un modelo aunque los pesos sean idénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E4B), con lectura bidireccional del estado en el motor basal |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q6_K (GGUF) |
| Idiomas soportados | pl (polaco), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 28,3 GB); pesos originales en el repositorio base |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B y se afina como modelo de decisión con "typed decisions": recibe un contexto y un conjunto de opciones y devuelve una elección con probabilidad asociada. La innovación clave no está en los pesos sino en el motor de inferencia basal, que lee el estado en dos direcciones (de izquierda a derecha y de derecha a izquierda) antes de emitir la respuesta; esa doble lectura es la que produce las métricas publicadas en la model card principal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se documenta el proceso de calibración: el modelo original incluye un fichero CALIBRATION.json con temperaturas ajustadas sobre lecturas bidireccionales, y este puerto GGUF incluye un CALIBRATION.gguf.json con temperaturas ajustadas solo para lectura unidireccional. El autor advierte que las temperaturas del modelo original no son válidas para la lectura unidireccional.

## Capacidades

- Toma de decisiones tipadas: elección entre opciones (`choice`), preguntas de sí/no y clasificación.
- Salida con probabilidades calibradas, pensada para umbrales de automatización.
- Razonamiento sobre documentos en polaco e inglés.
- Conocimiento general, exámenes y comprensión lectora en polaco (medido en el benchmark PL general).
- Procesamiento de documentos reales en polaco (benchmark PL-Real).
- En el modelo original: codificadores de imagen y audio (no incluidos en este GGUF, que es solo texto).
- Compatible con endpoints de llama.cpp (`POST /v1/systemone`) mediante los ficheros `-decision`, que añaden metadatos de decisión sin cambiar los pesos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Triaje de solicitudes en atención al cliente: el modelo clasifica cada ticket en una categoría tipada con probabilidad asociada, lo que permite derivar automáticamente solo los casos con confianza alta y escalar el resto a un humano.
- Moderación de contenido con umbral configurable: la salida sí/no calibrada permite fijar un umbral de error objetivo y medir la tasa de automatización resultante sobre datos propios.
- Enrutamiento de documentos en pipelines de back office: clasificación de documentos polacos reales (facturas, contratos, formularios) con la precisión medida en PL-Real (0,953 en lectura unidireccional).
- Validación de decisiones en procesos regulados: uso de las probabilidades como señal de confianza para decidir cuándo requiere revisión humana, validando previamente los umbrales sobre el conjunto de datos de la organización.
- Extracción de decisiones en flujos conversacionales: dado un historial de conversación, determinar la intención o la siguiente acción entre un conjunto cerrado de opciones.
- Evaluación comparativa de modelos de decisión: servir como referencia de un modelo pequeño (7,4B) con calibración explícita frente a alternativas generativas en tareas de clasificación.
- Procesamiento local en estaciones de trabajo: al caber en formato GGUF Q6_K/Q8_0, permite ejecutar la clasificación en local sin depender de una API externa, siempre asumiendo la pérdida de precisión de la lectura unidireccional.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con el motor basal 2.8.0 sobre una NVIDIA H100 en modo `--mode eager`, bf16:

| Benchmark | Dos lecturas (repo principal) | Una lectura (este puerto) | Misma respuesta top |
|---|---|---|---|
| PL decisions (test held-out, 7.081 items) | 0,951 | 0,843 | 85,5% |
| PL general (conocimiento, exámenes, lectura; 3.079 items) | 0,767 | 0,758 | 84,5% |
| PL-Real (300 documentos polacos reales) | 0,960 | 0,953 | 96,0% |
| EN corpus test (1.479 items) | 0,692 | 0,669 | 83,3% |
| EN external panel (10 tareas públicas de decisión, 3.842 items) | 0,811 | 0,762 | 84,5% |

Medición específica de los ficheros GGUF sobre 8.560 decisiones held-out:

| Lectura | Precisión | Misma respuesta top que dos lecturas (bf16) | Misma respuesta top que una lectura (bf16) |
|---|---|---|---|
| Dos lecturas, motor basal, bf16 (repo principal) | 0,907 | – | 85,2% |
| Una lectura, motor basal, bf16 | 0,812 | 85,2% | – |
| Una lectura, Q8_0 (llama.cpp) | 0,808 | 85,0% | 99,0% |
| Una lectura, Q6_K (llama.cpp) | 0,810 | 84,5% | 97,8% |

La pérdida de precisión procede de la lectura unidireccional, no de la cuantización: Q8_0 y Q6_K reproducen la lectura unidireccional bf16 en el 99,0% y el 97,8% de las decisiones respectivamente.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo original ocupan aproximadamente 16 GB en bf16; en GGUF Q8_0 y Q6_K el consumo es inferior, aunque el tamaño exacto por fichero no se detalla en la información disponible.
- GPU recomendadas: NVIDIA H100 para las mediciones publicadas (modo `--mode eager`, bf16); el motor basal soporta también `--mode fast` con CUDA graphs en Hopper (FlashAttention 3) y GPUs workstation Blackwell.
- Apple Silicon: soportado con `--mode eager --device mps` (PyTorch sobre Metal, bf16, más lento); el modo por defecto `mlx` del motor no sirve modelos de dos lecturas.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo en la información disponible; el tamaño de 7,4B parámetros en Q6_K/Q8_0 es compatible en principio con GPUs de 16-24 GB, pero no hay medición publicada.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama para este GGUF (lectura unidireccional); motor basal 2.8.0 para el modelo original (lectura bidireccional).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables directos (modelos de decisión tipada con calibración explícita) en la información proporcionada. Como referencia de tamaño, este modelo (7,4B parámetros) se sitúa en la franja de modelos pequeños tipo Gemma 2 9B o Llama 3.1 8B, pero la tarea objetivo (decisión clasificatoria calibrada) no es directamente comparable con la generación de texto general.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| basal-omni-2.0-mini-preview (este) | 7,4B | no disponible | Apache 2.0 | GGUF en HF; original con motor basal |
| Alternativas de decisión comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor marca el modelo como experimental y no recomendado en formato GGUF: la lectura unidireccional de llama.cpp degrada la precisión frente al modelo original (0,843 frente a 0,951 en PL decisions).
- Sin umbrales de automatización válidos: los umbrales ajustados para lectura unidireccional no alcanzaron sus objetivos (al 1% objetivo decidían el 30,1% de las decisiones con un 1,24% de error observado; 1,68% en preguntas `choice`). Hay que validar cualquier umbral sobre datos propios.
- El fichero CALIBRATION.gguf.json solo contiene temperaturas de lectura unidireccional; `max_error` difiere todas las decisiones. El CALIBRATION.json del modelo original no está incluido porque no es válido para lectura unidireccional.
- Solo texto: los codificadores de imagen y audio del modelo original no están en los ficheros GGUF.
- Idiomas limitados a polaco e inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- La lectura bidireccional exacta en llama.cpp requiere un cambio upstream sin fecha; en MLX está planificada para una versión futura de basal, también sin fecha.
- Licencia Apache 2.0 permite uso comercial, pero las métricas publicadas solo son válidas para el despliegue bidireccional con el motor basal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Remek/basal-omni-2.0-mini-preview-GGUF
- Modelo base: https://huggingface.co/Remek/basal-omni-2.0-mini-preview
- Versión MLX: https://huggingface.co/Remek/basal-omni-2.0-mini-preview-MLX
- Motor de inferencia basal (GitHub): https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
