# phantomic12/maple-preview-20b-q4nx

## Resumen

Maple-Preview 20B es un modelo de razonamiento de tipo MoE (Mixture of Experts) con pesos ternarios, desarrollado por DeepGrove. Esta ficha cubre la variante cuantizada Q4NX y TQ2_0 publicada por phantomic12, optimizada para ejecución en NPUs AMD Ryzen AI (XDNA 2 / Strix Point) mediante el runtime FastFlowLM, así como en CPUs modernas con instrucciones AVX2/FMA.

El modelo cuenta con 20.214 millones de parámetros totales (~20B) pero solo activa aproximadamente 1.000 millones por token, gracias a su arquitectura de 256 expertos con enrutamiento Top-8. Incorpora una ventana de contexto nativa de 128K tokens (131.072) con atención híbrida 3:1: 18 capas de atención de ventana deslizante (512 tokens) y 6 capas de atención global completa.

La relevancia de este modelo radica en su capacidad para ejecutar inferencia de razonamiento a alta velocidad en hardware de consumo, alcanzando entre 185 y 202 tokens por segundo en la NPU del AMD Ryzen AI 9 HX 370, con un consumo de memoria de solo 5,6 a 7,1 GB según la longitud de contexto. Se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con pesos ternarios, 256 expertos, enrutamiento Top-8 |
| Parametros totales | 20.214.030.336 (~20B) |
| Parametros activos | ~1B por token |
| Longitud de contexto | 131.072 tokens (128K nativo) |
| Tipos de cuantizacion | Q4NX (FastFlowLM), TQ2_0 (ternario) con head Q4_K en GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | Q4NX (empaquetado FastFlowLM), GGUF |

## Arquitectura y entrenamiento

Maple-Preview 20B es un modelo de razonamiento con arquitectura MoE de pesos ternarios. El modelo base (deepgrove/maple-preview) emplea 256 expertos con enrutamiento Top-8, lo que significa que solo se activan 8 expertos por token, resultando en aproximadamente 1.000 millones de parámetros activos de un total de 20.000 millones. Los pesos ternarios (TQ2_0) reducen drásticamente el footprint de memoria y mejoran la velocidad de inferencia en hardware con soporte de cómputo de baja precisión.

La atención es híbrida con proporción 3:1: 18 capas de atención de ventana deslizante (SWA) con un alcance de 512 tokens, combinadas con 6 capas de atención global completa. Esta configuración permite mantener un coste de memoria O(1) constante de 18,9 MB para la atención de ventana deslizante, incluso con contextos largos. El tokenizador es BPE a nivel de byte con un vocabulario de 151.936 tokens.

La variante cuantizada de phantomic12 incluye además un servidor REST compatible con OpenAI (`/v1/chat/completions`) con soporte de streaming y modo de razonamiento (thinking), implementado sobre el runtime FastFlowLM de ROCm. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF/DPO) en la documentación publicada.

## Capacidades

- Razonamiento multi-paso con modo "thinking" integrado en la plantilla de chat (Jinja), que permite alternar entre respuestas directas y razonamiento explícito.
- Generación de texto en inglés con soporte de conversaciones multi-turno.
- Ventana de contexto nativa de 128K tokens, ampliable hasta 1M tokens en modo extremo según los benchmarks publicados.
- Inferencia acelerada por NPU en hardware AMD Ryzen AI (XDNA 2 / Strix Point) mediante el runtime FastFlowLM.
- Compatibilidad con CPUs modernas con instrucciones AVX2/FMA.
- API compatible con OpenAI para integración en aplicaciones existentes.
- Formato GGUF disponible para ejecución en runtimes alternativos (llama.cpp, Ollama, etc.).

## Casos de uso

- Asistente de razonamiento en local: el modelo puede ejecutarse en un portátil con AMD Ryzen AI 9 HX 370, ofreciendo respuestas con razonamiento explícito a velocidades de 185-202 tokens por segundo sin conexión a internet.
- Servicio de chat autohospedado: gracias al servidor REST compatible con OpenAI, puede desplegarse como backend de chat para aplicaciones de empresa, reemplazando APIs de pago con un coste de hardware reducido.
- Procesamiento de documentos largos: con 128K tokens de contexto nativo, puede analizar documentos extensos, contratos o informes completos en una sola pasada, manteniendo un footprint de memoria de solo 7,1 GB.
- Prototipado de agentes con razonamiento: el modo "thinking" permite construir agentes que muestran su proceso de razonamiento antes de responder, útil para depuración y auditoría de decisiones.
- Inferencia en edge computing: el bajo consumo de memoria (5,6-7,1 GB) y la compatibilidad con NPU lo hacen adecuado para dispositivos de borde con restricciones de energía y espacio.
- Evaluación de modelos de razonamiento: investigadores pueden comparar el rendimiento de razonamiento de este modelo MoE ternario frente a alternativas densas o MoE de mayor tamaño, gracias a su licencia MIT y su disponibilidad en formato GGUF.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card se centran en rendimiento de inferencia en hardware NPU AMD Ryzen AI 9 HX 370:

| Contexto | Prefill (tok/s) | Decode (tok/s) | Memoria (RAM) |
|---|---|---|---|
| 4K | 199,6 | 190,2 | ~5,6 GB |
| 32K | 200,1 | 187,9 | ~5,9 GB |
| 128K | 202,6 | 185,6 | ~7,1 GB |
| 1M (extremo) | 193,2 | 175,4 | ~18,4 GB |

Según Benchgen, el modelo base alcanza un 87,5% en AIME26 y 218 tok/s en un Mac mini M4. No se han publicado resultados de benchmarks de razonamiento estandar (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- Memoria estimada: 5,6 GB para contexto de 4K, 7,1 GB para 128K, 18,4 GB para 1M de contexto extremo.
- NPU recomendada: AMD Ryzen AI (XDNA 2 / Strix Point), por ejemplo la NPU del Ryzen AI 9 HX 370, accesible via `/dev/accel/accel0`.
- CPU compatible: procesadores modernos con instrucciones AVX2/FMA.
- GPU: no se menciona soporte específico para GPU discretas en la información disponible; el modelo está orientado a NPU y CPU.
- Opciones de despliegue: FastFlowLM (runtime principal), formato GGUF para llama.cpp/Ollama, servidor REST compatible con OpenAI.
- Latencia y throughput: 185-202 tok/s en decode en NPU Ryzen AI 9 HX 370; 218 tok/s en Mac mini M4 según Benchgen.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Maple-Preview 20B | ~20B | ~1B | 128K | MIT |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32K | Apache 2.0 |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 256K | Apache 2.0 |

Maple-Preview se distingue por su uso de pesos ternarios, que reducen significativamente el footprint de memoria y permiten ejecución en NPU de consumo, algo que no ofrecen Mixtral ni Qwen3. Su parámetro activo de ~1B es el más bajo de los tres, lo que favorece la velocidad de inferencia, aunque el rendimiento de razonamiento en benchmarks estándar (MMLU, GSM8K) no se ha publicado para comparar directamente.

## Limitaciones y advertencias

- El modelo solo soporta inglés como idioma principal; no se menciona soporte multilingüe.
- No se han publicado resultados de benchmarks de razonamiento estándar (MMLU, GSM8K, HumanEval) en la información disponible, lo que dificulta la evaluación objetiva de su calidad frente a alternativas.
- La cuantización ternaria (TQ2_0) puede degradar la precisión en tareas de alta sensibilidad numérica o lógica.
- El soporte de NPU está limitado a hardware AMD Ryzen AI con XDNA 2; en otras plataformas el rendimiento dependerá de la CPU.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.
- La información sobre el entrenamiento (dataset, tokens, método de alineación) no está disponible en la model card.
- El modo de contexto extremo de 1M tokens no es nativo y puede requerir configuración adicional o degradar el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/phantomic12/maple-preview-20b-q4nx
- Modelo base: https://huggingface.co/deepgrove/maple-preview
- Colección Maple-Preview: https://huggingface.co/collections/deepgrove/maple-preview
- Runtime FastFlowLM: https://github.com/ROCm/FastFlowLM
- Repositorio de portabilidad: https://github.com/phantomic12/maple-flm
- Documentación de arquitectura: https://github.com/phantomic12/maple-flm/blob/main/docs/ARCHITECTURE.md
- Benchgen (benchmarks): https://benchgen.com/models/deepgrove/maple-preview
