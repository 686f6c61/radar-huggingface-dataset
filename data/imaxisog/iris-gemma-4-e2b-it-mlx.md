# ImAXISOG/iris-gemma-4-e2b-it-mlx

## Resumen

Iris Gemma 4 E2B (MLX) es un ajuste fino mediante LoRA del modelo `google/gemma-4-E2B-it` de Google, publicado por el desarrollador ImAXISOG bajo el identificador `ImAXISOG/iris-gemma-4-e2b-it-mlx`. El modelo es el componente de escritura de la aplicación Iris, una app de corrección gramatical y de tono que se ejecuta en local ("on-device") sobre Apple Silicon. No es un modelo de propósito general: está entrenado específicamente para dos tareas de reescritura de texto y para nada más.

La primera tarea, **Fix**, corrige ortografía, gramática, mayúsculas y puntuación sin alterar nada más (se conservan las abreviaturas, la jerga y el registro informal del usuario; un mensaje sin errores se devuelve sin cambios). La segunda, **Tones**, reescribe un mensaje en uno de cinco tonos: Professional, Friendly, Shorter, Clearer o Funny, preservando todos los puntos, quién hace qué y las preguntas como preguntas. El modelo lee inglés, hindi (devanagari) e hinglish (hindi escrito con letras latinas), y siempre responde en inglés.

Técnicamente, el repositorio contiene pesos en formato MLX cuantizados a 4 bits (group size 64) con las capas MLP a 8 bits, en total 3,72 GB y 4.799.472.931 parámetros. La relevancia actual del modelo radica en su enfoque de despliegue: un ajuste fino pequeño y especializado que cabe en equipos con 8 GB de memoria, orientado a procesamiento local sin conexión. La model card advierte de que el modelo aún no se ha probado en una máquina real de 8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: google/gemma-4-E2B-it); ajuste fino con LoRA |
| Parámetros totales | 4.799.472.931 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (group size 64) con capas MLP a 8 bits; versión GGUF separada (2,81 GB) |
| Idiomas soportados | en, hi (entrada también en hinglish; salida siempre en inglés) |
| Licencia | apache-2.0, versión modificada de la licencia Gemma 4 |
| Formato de pesos | safetensors (MLX, 3,72 GB); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer decoder-only de la familia Gemma 4 de Google con aproximadamente 4,8 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA orientado exclusivamente a las dos tareas de escritura descritas (Fix y Tones). El modelo se distribuye en formato MLX cuantizado, con una configuración mixta de 4 bits (group size 64) para la mayoría de capas y 8 bits para las capas MLP, replicando la cuantización del checkpoint original sobre el que se entrenó.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se emplearon técnicas de RLHF o DPO. Tampoco se detalla ninguna innovación arquitectónica propia más allá del ajuste LoRA y la cuantización mixta orientada a inferencia en Apple Silicon. Existe una variante GGUF para Windows y llama.cpp, y una variante "Best quality" basada en E4B (`iris-gemma-4-e4b-it-mlx`).

## Capacidades

- Corrección de texto (Fix): ortografía, gramática, mayúsculas y puntuación, preservando el vocabulario, las abreviaturas, la jerga y el registro original del usuario.
- Reescritura por tono: Professional, Friendly, Shorter, Clearer y Funny, manteniendo el contenido informativo y la estructura de preguntas.
- Lectura multilingüe de entrada: inglés, hindi en devanagari e hinglish (hindi transliterado a caracteres latinos).
- Salida monolingüe: responde siempre en inglés, incluso ante entradas en hindi o hinglish.
- Generación de texto conversacional (pipeline `text-generation`).
- Inferencia local en Apple Silicon mediante la librería MLX.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento (thinking).

## Casos de uso

- Corrección de borradores en apps de mensajería: el modelo aplica Fix sobre el texto escrito por el usuario antes del envío, corrigiendo solo los errores y conservando el estilo informal, lo que encaja con un flujo de escritura rápida en el móvil o el escritorio.
- Reescritura de correos profesionales: la función Professional convierte un mensaje informal en una versión adecuada para el entorno laboral, manteniendo todos los puntos y las preguntas, adecuada para usuarios que redactan comunicaciones de trabajo.
- Acortado de mensajes largos: el tono Shorter condensa textos extensos sin perder información, útil en contextos con límites de caracteres o para mejorar la legibilidad.
- Clarificación de instrucciones: el tono Clearer reescribe peticiones ambiguas para que el destinatario las entienda sin ambigüedad, útil en soporte interno o coordinación de equipos.
- Normalización de entradas en hinglish: el modelo acepta mensajes en hinglish y los devuelve en inglés correcto, lo que sirve para usuarios que escriben en hindi transliterado y necesitan una versión estándar en inglés.
- Procesamiento local sin conexión: al ejecutarse con MLX en equipos de 8 GB, puede integrarse en aplicaciones de escritorio que requieran privacidad total, sin enviar texto a servidores externos.
- Preprocesado de textos antes de su publicación: corrección automática de borradores en CMS o herramientas de edición, con la ventaja de que un texto sin errores se devuelve sin cambios.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), evaluados a ciegas por un modelo de IA sobre borradores redactados exclusivamente para pruebas:

| Tarea | Gemma 4 E4B-it sin entrenar | Iris Lighter (E2B) | Iris Best quality (E4B) |
|---|---|---|---|
| English Fix: aceptado (50 borradores) | 52% | 86% | 90% |
| Professional and Friendly: enviaría (100 respuestas) | 86% | 88% | 93% |
| Shorter and Clearer: enviaría (100 respuestas) | 75% | 86% | 90% |
| Funny: enviaría (50 respuestas) | 4% | 56% | 66% |
| Hindi y Hinglish, Fix (a inglés): aceptado (82 borradores) | 91% | 71% | 95% |
| Hindi y Hinglish, tonos (a inglés): enviaría (240 respuestas) | 71% | 47% | 76% |

El autor indica que las diferencias inferiores a unos 8 puntos porcentuales están dentro del ruido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria en inferencia: 2,9 GB en pico según el autor (versión MLX); la versión GGUF requiere 1,9 GB más el archivo de 2,8 GB retenido en memoria, 4,8 GB en total.
- Equipos objetivo: Macs con 8 GB de memoria (según la guía del autor) y PCs Windows con 8 GB usando la variante GGUF.
- GPU recomendadas: no se especifican modelos concretos; el diseño está orientado a Apple Silicon (MLX) y a CPU/llama.cpp en Windows. No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no confirmado; el modelo está pensado para memoria unificada de Apple Silicon y para CPU.
- Opciones de despliegue: MLX (repositorio principal) y llama.cpp (variante GGUF). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte de que, si Windows descarga el archivo de memoria por falta de RAM, las respuestas se ralentizan.
- Advertencia del autor: el modelo aún no se ha probado en una máquina real de 8 GB ni en un PC Windows real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-gemma-4-e2b-it-mlx (este) | 4,8 mil millones | no disponible | Corrección y tono, on-device, 8 GB | Apache 2.0 (Gemma 4 modificada) | MLX y GGUF |
| iris-gemma-4-e4b-it-mlx | no disponible (base E4B) | no disponible | Misma tarea, mayor calidad | Apache 2.0 (Gemma 4 modificada) | MLX y GGUF |
| google/gemma-4-E2B-it (base) | 4,8 mil millones | no disponible | Modelo general sin ajuste | Gemma 4 | Hugging Face |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Modelo general sin ajuste | Gemma 4 | Hugging Face |

La comparativa se limita a la familia Gemma 4 y a las variantes del propio proyecto Iris; no se dispone de datos de otros modelos comparables de corrección gramatical en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: solo realiza Fix y Tones; no es adecuado como modelo de propósito general, razonamiento, código o matemáticas.
- Rendimiento débil en hindi y hinglish: en Hindi Fix obtiene un 71% frente al 95% de la variante E4B, y en tonos sobre hindi/hinglish solo un 47% de respuestas "enviaría".
- El tono Funny es el más flojo: 56% de respuestas aceptables, con un margen amplio respecto a la variante E4B (66%).
- Salida siempre en inglés: no genera texto en hindi ni en hinglish, lo que limita su uso para usuarios que necesiten respuestas en esos idiomas.
- Benchmarks no verificados: los resultados proceden de una evaluación interna del autor con juicio automático por IA, no de una evaluación independiente.
- Sin datos de sesgos, alucinación ni contexto máximo: no se documentan análisis de sesgo, tasas de alucinación ni longitud de contexto soportada.
- Licencia: Apache 2.0 descrita como versión modificada de la licencia Gemma 4; conviene revisar los términos de `license_link` antes de un uso comercial.
- Despliegue no confirmado: el autor reconoce que no se ha probado en máquinas reales de 8 GB ni en PCs Windows, por lo que los requisitos de memoria son estimaciones.
- Cuantización agresiva: 4 bits con MLP a 8 bits puede degradar la calidad frente al modelo base en textos fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-mlx
- Variante de mayor calidad (E4B, MLX): https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-mlx
- Variante GGUF para Windows y llama.cpp: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-gguf
- Colección de modelos de escritura Iris: https://huggingface.co/collections/ImAXISOG/iris-writing-models-6afd5f1c54a5d9692f56c625
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
