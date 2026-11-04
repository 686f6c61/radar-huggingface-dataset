# flaitenberger/economize-eagle3-gemma-4-31B-it

## Resumen

El repositorio `flaitenberger/economize-eagle3-gemma-4-31B-it` no contiene un modelo generativo completo, sino una **cabeza draft de EAGLE-3** diseñada para acelerar la decodificación especulativa de `google/gemma-4-31B-it`. La desarrolla Filipe Laitenberger en el marco de su proyecto `economize`, una librería de técnicas de eficiencia componibles para modelos de Hugging Face. El artefacto pesa 1,8 GB en el repositorio y contiene únicamente los pesos del drafter (918M parámetros), nunca los del modelo base.

El problema que resuelve es concreto: la decodificación autorregresiva token a token de un modelo de 31B parámetros es lenta y desaprovecha la GPU. EAGLE-3 propone una capa transformer adicional que predice varios tokens de golpe leyendo los estados ocultos del modelo base a tres profundidades, y luego el modelo grande verifica esos borradores en un solo pase. Según las mediciones del autor en una H100, esto produce una aceleración de 1,94x en throughput global, con picos de 2,44x en matemáticas y 2,05x en código.

La relevancia es doble: por un lado, la licencia Apache 2.0 del drafter es permisiva (aunque el modelo base Gemma conserva su propia licencia); por otro, el ecosistema `economize` permite acoplar el drafter a un Gemma-4-31B-it ya cargado mediante `economize.load(base, ...)`, sin reentrenar ni modificar el modelo grande.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head (una capa decoder que fusiona estados ocultos a tres profundidades + embedding del último token; MLP de anchura 21504; LM head propia sobre los 32768 tokens más frecuentes) |
| Parámetros totales | 918M (solo el drafter; el modelo base no se incluye) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base `google/gemma-4-31B-it`, no especificada en la información) |
| Tipos de cuantización | no disponible (el checkpoint se usa en bf16 en los ejemplos; no se documentan cuantizaciones del drafter) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (drafter); el modelo base Gemma-4-31B-it mantiene su propia licencia |
| Formato de pesos | safetensors (librería `economize`) |

## Arquitectura y entrenamiento

El drafter es una única capa decoder de tipo EAGLE-3. Lee los estados ocultos del modelo base en tres profundidades distintas, los fusiona en un único vector junto con el embedding del último token, y predice los siguientes tokens con su propia LM head restringida a los 32768 tokens más frecuentes del conjunto de entrenamiento. Su MLP tiene anchura 21504 y el conjunto suma 918M parámetros. La verificación corre siempre a cargo del modelo base: en decodificación greedy la salida es idéntica a la del base, y con `verifier="rejection"` el muestreo sigue la distribución del base.

El entrenamiento se realizó con la librería `economize` sobre 63.969 respuestas (63,3M tokens) generadas de forma greedy por el modelo base a partir de prompts de UltraChat, ShareGPT y colecciones de código y matemáticas. Se eliminaron los prompts que compartían un 13-grama con los conjuntos de evaluación. El objetivo es una divergencia KL hacia la distribución del siguiente token del modelo base sobre 7 pasos de draft desenrollados (training-time test), con pesos 0,8^k para el paso k. Se hizo una pasada sobre los datos en 5125 pasos de optimizador de 16384 tokens (con padding), AdamW (betas 0,9 y 0,95), learning rate 3e-4, 100 pasos de warmup, decaimiento coseno hasta un décimo del pico y clipping de gradiente a 1,0. El coste total fue de 22,1 GPU-horas en una sola GPU, con el modelo base congelado.

## Capacidades

- Aceleración de la decodificación de `google/gemma-4-31B-it` mediante decodificación especulativa EAGLE-3, con hasta 8 borradores por pase del modelo base (`cycle_length=9`).
- Predicción de varios tokens por paso con parada temprana controlada por `min_confidence=0.5`: el drafter deja de proponer cuando su probabilidad top cae por debajo de ese umbral.
- Preservación de la salida del modelo base: en greedy la salida coincide exactamente con la del base; con rejection sampling se respeta la distribución de muestreo del base.
- Compatibilidad con el ecosistema `economize` (`economize.from_pretrained`, `economize.load`, `economize.DecodeConfig`), lo que permite acoplarlo a un modelo base ya cargado en memoria.
- No aporta capacidades nuevas de generación, razonamiento, código o matemáticas por sí mismo: hereda todas las del modelo base Gemma-4-31B-it (tool calling, agentes, multilingüismo, etc.) sin modificarlas.
- No soporta visión ni audio por sí solo; cualquier modalidad depende del modelo base.

## Casos de uso

- **Servicio de chat de baja latencia con Gemma-4-31B-it**: en un endpoint conversacional, el drafter reduce el tiempo por token en un 1,67x según las mediciones del autor en el conjunto de chat, lo que se traduce directamente en menor latencia percibida en conversaciones multi-turno.
- **Generación de código en asistentes de IDE**: el autor mide 2,05x de aceleración en HumanEval, MBPP y LiveCodeBench, un escenario donde el modelo base ya destaca y donde el ahorro de latencia es crítico para la experiencia de autocompletado.
- **Razonamiento matemático y pipelines de resolución de problemas**: con 2,44x de aceleración en GSM8K, MATH-500, AIME y AMC, el drafter es especialmente rentable en cargas donde las respuestas son largas y estructuradas, típicas de evaluaciones y tutoría automática.
- **Resumen de documentos largos**: 1,41x en CNN/DailyMail; útil en pipelines de resumen por lotes donde cada petición genera cientos de tokens y el coste por GPU-hora importa.
- **Procesamiento de contexto largo**: 1,61x en LongBench, adecuado para aplicaciones de análisis de documentos extensos, RAG con contexto amplio o agentes que mantienen historiales largos.
- **Despliegue en una sola GPU H100 para prototipado e investigación**: el autor reporta las mediciones en una única H100 en bf16 con CUDA graphs a batch size 1, lo que convierte este drafter en una opción práctica para equipos con un solo acelerador que quieran evaluar decodificación especulativa sin infraestructura adicional.
- **Integración en runtimes existentes con `economize`**: al permitir `economize.load(base, ...)` sobre un Gemma-4-31B-it ya cargado, se puede añadir la aceleración a un servicio en producción sin reiniciar el modelo grande ni duplicar su memoria.

## Benchmarks y rendimiento

El autor publica una única tabla de aceleración (throughput relativo a la decodificación greedy del base en el mismo runtime), medida con `economize` 0.3.2 en una NVIDIA H100, bf16, CUDA graphs y batch size 1, con 8 prompts por conjunto y hasta 256 tokens nuevos:

| Conjunto | Aceleración | Tokens por pase del modelo base |
|---|---|---|
| Global | 1,94x | 2,24 |
| Chat (Spec-Bench, MT-Bench, AlpacaEval, Arena-Hard) | 1,67x | no disponible |
| Código (HumanEval, MBPP, LiveCodeBench) | 2,05x | no disponible |
| Matemáticas (GSM8K, MATH-500, AIME 2024/2025, AMC 2023) | 2,44x | no disponible |
| Resumen (CNN/DailyMail) | 1,41x | no disponible |
| Contexto largo (LongBench) | 1,61x | no disponible |

No se publican resultados de benchmarks de calidad (MMLU, HumanEval exact-match, GSM8K accuracy, etc.) porque el drafter no altera la salida del modelo base: en float32 la salida es exactamente la de la decodificación greedy, y en bf16 el 69% de las respuestas fueron idénticas en los 256 tokens medidos.

## Requisitos de hardware

- **VRAM del drafter**: 918M parámetros en bf16 equivalen a aproximadamente 1,8 GB de pesos, más overhead de activaciones y del grafo CUDA; el repositorio ocupa 1,8 GB.
- **VRAM total**: hay que sumar la del modelo base `google/gemma-4-31B-it`, que no se cuantifica en la información disponible; en bf16 el base rondaría los 62 GB solo en pesos, por lo que se necesita al menos una GPU de 80 GB para el conjunto (H100, A100 80GB) o cuantización del base.
- **GPU recomendadas**: el autor mide en una NVIDIA H100; por tamaño del base, A100 80GB y H100 80GB son las opciones naturales. No cabe en GPUs de consumo (RTX 4090 de 24 GB) sin cuantizar el modelo base, y en ese caso el drafter en bf16 añadiría ~1,8 GB adicionales.
- **Opciones de despliegue**: el drafter está empaquetado para la librería `economize` (>=0.4), que envuelve `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: el autor reporta 1,94x de throughput global y 2,24 tokens generados por pase del modelo base, en H100, bf16, batch 1 y CUDA graphs. No se publican latencias absolutas en milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters EAGLE-3 para Gemma-4-31B-it ni sobre sus métricas, por lo que la comparativa con alternativas de la misma categoría no está disponible. Como referencia estructural, un drafter EAGLE-3 típico se compara con:

| Criterio | Este drafter (EAGLE-3) | Decodificación especulativa con modelo pequeño (p. ej. Gemma pequeño) | Decodificación greedy del base |
|---|---|---|---|
| Parámetros del drafter | 918M | del orden de miles de millones | 0 |
| Aceleración reportada | 1,94x global | no disponible | 1,0x |
| Fidelidad a la salida del base | exacta en float32; 69% idéntica en bf16 | depende del verificador | exacta |
| Licencia | Apache 2.0 (drafter) | variable | la del base |
| Disponibilidad | Hugging Face, 0 descargas | variable | nativa |

La información proporcionada no incluye comparaciones con drafters de otros autores ni con técnicas como Medusa o decodificación especulativa clásica.

## Limitaciones y advertencias

- **No es un modelo autónomo**: sin `google/gemma-4-31B-it` cargado no genera nada; el repositorio solo contiene la cabeza draft.
- **Divergencia en bf16**: en bf16, un pase de verificación sobre varios tokens redondea de forma distinta a un paso de un solo token, por lo que tras un tiempo la salida puede diferir de la decodificación greedy plana; en la medición, solo el 69% de las respuestas fueron idénticas en los 256 tokens. En float32 la equivalencia es exacta.
- **Restricción del vocabulario del drafter**: la LM head del drafter cubre solo los 32768 tokens más frecuentes del entrenamiento; los tokens fuera de ese conjunto no se pueden proponer como borradores (aunque el base los puede verificar y generar).
- **Dependencia de la distribución de entrenamiento**: se entrenó con respuestas greedy del base sobre UltraChat, ShareGPT y colecciones de código y matemáticas; dominios muy alejados de esa mezcla pueden reducir la tasa de aceptación y, con ella, la aceleración.
- **Sesgos y alucinaciones**: el drafter no introduce sesgos propios distintos de los del base, pero tampoco los mitiga; cualquier sesgo o alucinación de Gemma-4-31B-it se hereda íntegramente.
- **Licencia**: los pesos del drafter son Apache 2.0, pero el uso comercial está condicionado por la licencia del modelo base Gemma, que hay que revisar por separado.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones provienen de una única ejecución de timing del checkpoint; no hay validación independiente.
- **Soporte de ecosistema limitado**: solo se documenta la librería `economize`; no hay integración conocida con vLLM, TGI, llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/flaitenberger/economize-eagle3-gemma-4-31B-it
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio del proyecto `economize`: https://github.com/Thiggel/economize
- Documentación de `economize`: https://thiggel.github.io/economize/
- Cita del autor (BibTeX): Laitenberger, Filipe (2026), *economize: Composable Efficiency Techniques for Hugging Face Language Models*
