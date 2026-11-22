# IFM/Jais-3-7B-FP8

## Resumen

Jais-3-7B-FP8 es una versión cuantizada en FP8 del modelo Jais-3-7B, un modelo decoder-only de clase 7B desarrollado por IFM (Inception Foundation Models) como miembro denso de la familia Jais-3. El modelo original está diseñado específicamente para árabe e inglés, con una ventana de contexto de 512K tokens, lo que lo convierte en una opción relevante para aplicaciones que requieren procesamiento de documentos largos en árabe moderno estándar y en inglés.

Esta variante FP8 cuantiza todas las capas lineales excepto `lm_head`, con pesos en FP8 estático (una escala por bloque de 128×128) y activaciones en FP8 dinámico (una escala por grupo de 1×128 a lo largo de la dimensión de canales de entrada). Según la model card, el rendimiento se mantiene cercano al modelo BF16 original en las evaluaciones del autor, reduciendo el footprint de memoria y permitiendo inferencia más rápida en hardware compatible con FP8.

El modelo es relevante ahora porque combina tres factores poco habituales en la categoría 7B: contexto extremadamente largo (512K), foco bilingüe árabe-inglés y pesos abiertos bajo licencia Apache 2.0, además de formatos alternativos (GGUF, MLX) que facilitan el despliegue en entornos muy distintos, desde servidores con GPUs Hopper hasta portátiles con Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Jais-3) |
| Parametros totales | 8.999.178.240 (aprox. 9B, etiquetado comercialmente como 7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | FP8 (esta version); disponibles GGUF (llama.cpp/Ollama) y MLX 4-bit, 8-bit y bf16 del modelo base |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, compressed-tensors), transformers con custom_code |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de aproximadamente 9B parámetros (etiquetado como 7B en la nomenclatura comercial), perteneciente a la familia Jais-3. El modelo base `inception42/Jais-3-7B` se distribuye con pesos abiertos y una ventana de contexto de 512K tokens, orientada a cargas de trabajo con documentos extensos y conversaciones multi-turno de larga duración. Los detalles concretos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO y posibles innovaciones de atención no están disponibles en la información proporcionada.

La variante FP8 aplica cuantización post-entrenamiento con la librería `compressed-tensors`: pesos en FP8 estático con granularidad de bloque 128×128 y activaciones en FP8 dinámico con granularidad de grupo 1×128 sobre la dimensión de entrada. La capa `lm_head` se mantiene sin cuantizar. El autor indica que el modelo cuantizado rinde de forma cercana al BF16 original en sus evaluaciones, si bien no se detallan los números de esa comparación.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con soporte de conversaciones multi-turno.
- Procesamiento de contexto largo: ventana de 512K tokens, adecuada para documentos extensos, bases de código grandes o historiales de conversación prolongados.
- Razonamiento multi-paso y tareas de comprensión sobre entradas largas (según la orientación de la familia Jais-3; no se detallan capacidades específicas de tool calling en la información disponible).
- Capacidades multilingües limitadas a los idiomas declarados: árabe e inglés.
- Formato de pesos compatible con `transformers` mediante `custom_code`, además de variantes GGUF y MLX del modelo base para otros runtimes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno con historial largo gracias a la ventana de 512K tokens, manteniendo coherencia en diálogos extensos sin truncar contexto.
- Análisis de documentación legal o administrativa en árabe: permite ingerir contratos, expedientes o normativa completos en una sola pasada de contexto, algo poco frecuente en modelos 7B.
- Resumen y extracción de información de informes largos: útil para pipelines que procesan PDFs o transcripciones extensas en árabe e inglés y necesitan salida estructurada.
- Asistencia a desarrolladores bilingües: generación y explicación de código con documentación en inglés y comentarios o requisitos en árabe dentro del mismo contexto.
- Despliegue en hardware FP8: al estar cuantizado en FP8, encaja en infraestructuras con GPUs Hopper (H100/H200) o Blackwell donde se busca maximizar throughput por GPU frente al BF16.
- Prototipado local en Apple Silicon: las variantes MLX 4-bit y 8-bit del modelo base permiten probar el modelo en portátiles Mac antes de escalar a servidores.
- Investigación en PLN árabe: al ser pesos abiertos con licencia Apache 2.0, sirve como base para fine-tuning supervisado en dominios específicos (sanidad, finanzas, educación) en árabe.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos de referencia (Gemma-4-E4B-it, Gemma-4-12B-it, Qwen3.5-9B, Falcon-H1-7B-Instruct, Allam 7B y Fanar-1-9B-Instruct), pero los valores numéricos de las métricas no están legibles en la información proporcionada (la tabla aparece truncada). Los únicos datos completos de la tabla son los recuentos de parámetros:

| Modelo | Params | Params activos/efectivos |
|---|---|---|
| Jais-3-7B | 7B | 7B |
| Gemma-4-E4B-it | 8B | 4B |
| Gemma-4-12B-it | 12B | 12B |
| Qwen3.5-9B | 9B | 9B |
| Falcon-H1-7B-Instruct | 7B | 7B |
| Allam 7B | 7B | 7B |
| Fanar-1-9B-Instruct | 9B | 9B |

Los resultados por tarea (MMLU, HumanEval, GSM8K u otras) no están disponibles en la información proporcionada. El autor afirma únicamente que la versión FP8 rinde de forma cercana al BF16 original en sus evaluaciones, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 9-11 GB solo para pesos (9B parámetros a 1 byte por peso, más overhead de escalas y buffers), y aproximadamente 12-16 GB con KV cache moderada; el contexto de 512K tokens puede disparar el consumo de KV cache si se llena por completo.
- VRAM estimada para el modelo base en BF16: aproximadamente 18 GB solo para pesos, más KV cache.
- GPUs recomendadas: H100, H200 y B200 para aprovechar nativamente FP8; A100 no dispone de aceleración FP8 nativa y ejecutará la cuantización con conversión, perdiendo parte de la ventaja.
- GPUs de consumo: una RTX 4090 (24 GB) puede alojar los pesos FP8, pero el contexto completo de 512K requerirá gestión cuidadosa de KV cache o cuantización adicional del cache; las variantes GGUF y MLX del modelo base amplían las opciones en GPUs de menor VRAM y Apple Silicon.
- Opciones de despliegue: `transformers` con `custom_code` para esta variante FP8; llama.cpp/Ollama mediante `IFM/Jais-3-7B-GGUF`; MLX en Apple Silicon mediante las variantes 4-bit, 8-bit y bf16; vLLM y TGI no están confirmados como compatibles en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Formatos disponibles | Notas |
|---|---|---|---|---|---|
| Jais-3-7B-FP8 | ~9B (7B nominal) | 512K | Apache 2.0 | safetensors FP8; GGUF y MLX del base | Foco árabe-inglés, pesos abiertos |
| Allam 7B | 7B | No disponible | No disponible | No disponible | Modelo árabe de referencia en la tabla del autor |
| Fanar-1-9B-Instruct | 9B | No disponible | No disponible | No disponible | Modelo árabe de 9B comparable en tamaño |
| Falcon-H1-7B-Instruct | 7B | No disponible | No disponible | No disponible | Alternativa 7B incluida en la comparativa del autor |
| Qwen3.5-9B | 9B | No disponible | No disponible | No disponible | Alternativa multilingüe de tamaño similar |

Los datos de rendimiento comparado (benchmarks) no están disponibles en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto conocido y licencia.

## Limitaciones y advertencias

- Idiomas limitados: solo árabe e inglés declarados; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a modelos generativos de esta escala; no se documentan mitigaciones específicas en la información disponible.
- Sesgos: no se detalla información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que impide evaluar su cobertura y equilibrio.
- La cuantización FP8 puede introducir degradación sutil en tareas sensibles a precisión numérica; el autor afirma que el rendimiento es cercano al BF16, pero no publica cifras que lo respalden en la información disponible.
- Contexto de 512K: llenar la ventana completa implica un coste elevado de KV cache y latencia; en producción conviene planificar cuantización del cache o truncado selectivo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `inception42/Jais-3-7B` y de las dependencias de `custom_code` antes de desplegar.
- Compatibilidad: esta variante FP8 depende de `compressed-tensors` y `custom_code`; no está confirmada su integración con vLLM o TGI en la información disponible, lo que puede limitar despliegues de alto throughput.
- Madurez: el repositorio tiene 183 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción todavía muy limitada y escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-7B-FP8
- Modelo base: https://huggingface.co/inception42/Jais-3-7B
- Colección Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- GGUF (llama.cpp/Ollama): https://huggingface.co/IFM/Jais-3-7B-GGUF
- MLX 4-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-4bit
- MLX 8-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-8bit
- MLX bf16: https://huggingface.co/IFM/Jais-3-7B-MLX-bf16
- Paper referenciado en los tags (arXiv:2611.10224): https://arxiv.org/abs/2611.10224
