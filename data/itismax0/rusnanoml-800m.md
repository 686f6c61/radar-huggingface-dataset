# itismax0/RusNanoML-800M

## Resumen

RusNanoMath-800M es un modelo de razonamiento matemático bilingüe (ruso e inglés) de 800 millones de parámetros, publicado por el usuario itismax0 bajo licencia Apache 2.0. Está construido sobre la arquitectura Qwen3.5 con atención lineal híbrida (capas con Gated Delta Rule), lo que le permite mantener una complejidad de memoria de estado O(1) durante la generación y trabajar con un contexto de hasta 32 768 tokens. Su pipeline declarado es text-generation, aunque el repositorio incluye también la etiqueta image-text-to-text y el código de ejemplo carga la clase `AutoModelForImageTextToText`.

El modelo está especializado en matemáticas de competición y razonamiento simbólico, y se ha alineado mediante SFT sobre cadenas de razonamiento (CoT) seguido de SimPO (Simple Preference Optimization). Su relevancia radica en que, con menos de mil millones de parámetros, declara resultados en el rango de modelos varias veces mayores: 52,42 % en el subconjunto de álgebra de MATH-500 (frente a 53,8 % de Llama-3.1-8B) y 36,2 % en MATH-500 completo. Todo ello con un peso en BF16 de aproximadamente 1,6 GB, lo que lo hace desplegable en GPU de consumo muy modestas.

El repositorio, de 4,8 GB, incluye pesos en safetensors y un GGUF F16 de precisión completa para su uso con llama.cpp u Ollama. El modelo acumula 237 descargas y 1 like en el momento de la consulta, y su ficha presenta cierta inconsistencia de nomenclatura: el ID del repositorio es `RusNanoML-800M` mientras que la model card y el model-index lo denominan `RusNanoMath-800M`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Qwen3.5, capas Gated Delta Rule) |
| Parametros totales | 852.985.920 (≈0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | GGUF F16 incluido en el repo; cuantizaciones adicionales no disponibles |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 con atención lineal híbrida basada en Gated Delta Rule. Esta combinación alterna capas de atención lineal, cuya memoria de estado es de complejidad O(1) durante la decodificación, con el resto de la pila transformer, lo que reduce el coste de memoria en contextos largos frente a la atención completa tradicional. El modelo declara soporte de contexto de hasta 32 768 tokens y un peso en BF16 de aproximadamente 1,6 GB.

El entrenamiento se articula en dos fases: un SFT dirigido sobre cadenas de razonamiento (CoT) orientado a problemas de matemáticas de competición y olimpiadas, seguido de una alineación por preferencias con SimPO. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del proceso de anotación de preferencias, por lo que esos datos deben considerarse no disponibles. Tampoco se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) en ruso e inglés.
- Razonamiento matemático de competición con cadenas de razonamiento explícitas (CoT) y salida en formato `\boxed{}`.
- Álgebra simbólica: resolución de ecuaciones polinómicas y manipulación algebraica, área en la que el autor reporta sus mejores resultados relativos.
- Aritmética multi-paso y problemas de enunciado verbal (estilo GSM8K).
- Razonamiento lógico-matemático orientado a problemas de olimpiada.
- Generación determinista mediante decodificación greedy (`do_sample=False`, `temperature 0`), que es el modo recomendado en los ejemplos de la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades de visión: la etiqueta `image-text-to-text` y la clase `AutoModelForImageTextToText` aparecen en el repositorio, pero la model card no documenta ninguna capacidad multimodal; no disponible.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Resolución de problemas de álgebra en producción educativa: el modelo puede recibir ecuaciones y devolver la solución paso a paso con el resultado final en `\boxed{}`, lo que facilita el parseo automático de respuestas en plataformas de corrección. Su 52,42 % en álgebra de MATH-500 lo sitúa por encima de modelos de 1,5B a 3B parámetros en esa tarea.
- Tutor matemático bilingüe ruso-inglés: con soporte nativo de ambos idiomas, puede atender a estudiantes que alternan idiomas en la misma conversación, generando explicaciones CoT en el idioma de la consulta.
- Generación de datasets sintéticos de razonamiento matemático: al producir cadenas de razonamiento completas y deterministas (temperatura 0), es útil para crear pares pregunta-respuesta con traza de razonamiento para entrenar o evaluar otros modelos.
- Despliegue en entornos con hardware muy limitado: con ~1,6 GB en BF16 y funcionamiento declarado en GPU de 4 GB de VRAM, cabe en portátiles y en placas de inference de bajo coste, lo que permite ofrecer un servicio de resolución de problemas sin infraestructura dedicada.
- Evaluación comparativa de modelos pequeños: sirve como referencia sub-1B en pipelines de benchmarking de matemáticas (MATH-500, GSM8K) para contrastar el efecto de técnicas de alineación como SimPO en modelos de este tamaño.
- Integración en CLI y asistentes locales: el GGUF F16 incluido permite ejecutarlo con llama.cpp u Ollama sin pérdida de cuantización, útil para herramientas de línea de comandos de resolución de problemas matemáticos en local y sin conexión.
- Preprocesado matemático en pipelines de datos: puede normalizar y resolver expresiones simbólicas sencillas antes de pasarlas a un solver formal, reduciendo el número de llamadas a sistemas más costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (métricas no verificadas, `verified: false`):

| Benchmark | Métrica | RusNanoMath-800M | Referencia declarada por el autor |
|---|---|---|---|
| MATH-500 | Accuracy | 36,2 % | Gemma-2-2B: 35,0 %; Mistral-7B-Instruct: 28,4 %; SmolLM2-1.7B: 21,5 %; Llama-3.2-1B: 14,0 % |
| MATH-500 (Algebra, 124 problemas) | Accuracy | 52,42 % | Llama-3.1-8B: 53,8 %; Qwen2.5-1.5B: 49,5 %; Llama-3.2-3B: 48,0 %; Gemma-2-2B: 41,2 % |
| GSM8K | Accuracy | 52,0 % | no disponible |

El autor indica que los 36,2 % de MATH-500 corresponden a 181 problemas resueltos de 500, y los 52,42 % de álgebra a 65 de 124. No se han publicado en la información disponible resultados de otros benchmarks como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB en BF16 para los pesos; el autor indica que funciona en GPU de consumo con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB (el autor no especifica modelos concretos); para mayor throughput, GPU de datacenter tipo A100 o H100, aunque el modelo está claramente sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 4 GB o más.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), llama.cpp (compilaciones `master` >= b12413, necesarias para la arquitectura Qwen3.5 híbrida) y Ollama mediante importación local del GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | MATH-500 Algebra | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| RusNanoMath-800M | 0,85B | 32 768 | 36,2 % | 52,42 % | 52,0 % | Apache 2.0 |
| Qwen2.5-1.5B | 1,5B | no disponible | no disponible | 49,5 % | no disponible | Apache 2.0 |
| Llama-3.2-3B | 3B | no disponible | no disponible | 48,0 % | no disponible | Llama 3.2 Community |
| Gemma-2-2B | 2B | no disponible | 35,0 % | 41,2 % | no disponible | Gemma Terms |

Los datos de los modelos comparables proceden únicamente de las cifras citadas por el autor en su model card; no se dispone de verificación independiente ni de sus especificaciones completas de contexto o licencia en la información proporcionada. Destaca que RusNanoMath-800M supera en álgebra a modelos de 1,5B y 3B parámetros y queda a 1,4 puntos de Llama-3.1-8B, con un orden de magnitud menos de parámetros.

## Limitaciones y advertencias

- Resultados no verificados: todas las métricas del model-index tienen `verified: false` y proceden del propio autor; no hay evaluación independiente publicada.
- Riesgo de alucinación: es un modelo de 0,85B especializado en matemáticas; fuera del dominio matemático y en problemas de competición complejos puede producir razonamientos plausibles pero incorrectos. Los propios resultados (36,2 % en MATH-500) implican que falla en casi dos tercios de los problemas de ese conjunto.
- Cobertura de idiomas limitada a ruso e inglés; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Inconsistencia de nomenclatura: el ID del repositorio es `RusNanoML-800M` pero la model card y los benchmarks usan `RusNanoMath-800M`, lo que puede causar confusión en referencias y citas.
- Ambigüedad multimodal: las etiquetas `image-text-to-text` y la clase `AutoModelForImageTextToText` sugieren capacidades de visión que la model card no documenta; no debe asumirse soporte de imagen sin verificación.
- Dependencia de versiones recientes de llama.cpp (>= b12413) para cargar el GGUF; compilaciones antiguas rechazarán el archivo.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni proceso de anotación de preferencias, lo que dificulta evaluar riesgos de contaminación de benchmarks.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero al ser un modelo derivado de la arquitectura Qwen3.5 conviene revisar las condiciones de la familia base.
- No se documentan capacidades de tool calling ni de agentes; no debe integrarse en pipelines que dependan de function calling sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itismax0/RusNanoML-800M
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
