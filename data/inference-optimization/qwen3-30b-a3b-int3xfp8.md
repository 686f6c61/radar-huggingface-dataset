# inference-optimization/Qwen3-30B-A3B-INT3xFP8

## Resumen

Qwen3-30B-A3B-INT3xFP8 es una versión cuantizada del modelo Qwen3-30B-A3B-Base de Alibaba Qwen, publicada por el usuario `inference-optimization` en Hugging Face. Se trata de una compresión en formato `compressed-tensors` que combina pesos de 3 bits en enteros (INT3) con capas en FP8, reduciendo el peso del repositorio a 31,6 GB frente a los aproximadamente 61 GB que ocuparía el modelo en BF16. El modelo base es un transformer causal de tipo mixture-of-experts (MoE) con 30.532.122.624 parámetros totales, de los cuales solo 3,3 mil millones se activan por token.

La relevancia de esta ficha radica en que permite desplegar un MoE de 30B con activación de 3,3B en hardware más modesto, manteniendo la ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 con YaRN) y las capacidades del Qwen3 original: cambio entre modo pensamiento y modo directo, soporte de más de 100 idiomas y tool calling. La licencia Apache 2.0 facilita su uso comercial, aunque al ser una cuantización de terceros conviene validar la calidad frente al modelo original.

Es importante señalar que esta ficha se basa en la model card del modelo base Qwen3-30B-A3B y en los metadatos del repositorio cuantizado; no se dispone de benchmarks específicos publicados para la versión INT3xFP8, por lo que los datos de rendimiento deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (qwen3_moe) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B por token (8 de 128 expertos) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | INT3xFP8 (compressed-tensors); el modelo base admite cuantizaciones adicionales (GGUF, AWQ, GPTQ) no incluidas en este repo |
| Idiomas soportados | Más de 100 idiomas y dialectos (según model card del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit según tags) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer causal con arquitectura MoE: 48 capas, 128 expertos por capa y activación de 8 expertos por token, lo que resulta en 3,3B parámetros activos sobre 30,5B totales. Usa atención con GQA (32 cabezas para Q, 4 para KV) y fue entrenado en dos fases: preentrenamiento y post-entrenamiento (instrucción y alineación). La model card indica mejoras en razonamiento, seguimiento de instrucciones, capacidades de agente y multilingüismo respecto a generaciones anteriores (QwQ y Qwen2.5).

La versión INT3xFP8 no aporta información propia sobre el proceso de cuantización más allá del formato `compressed-tensors` y los tags `8-bit` e `INT3xFP8`. No se detalla en la información disponible el algoritmo exacto de cuantización, el número de tokens de calibración ni la pérdida de calidad introducida. El modelo base soporta modo pensamiento (`<think>...</think>`) y modo directo mediante el flag `enable_thinking`, con parámetros de muestreo recomendados de temperatura 0,6, top-p 0,95, top-k 20 y min-p 0.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno.
- Razonamiento complejo en modo pensamiento (matemáticas, lógica, código).
- Generación y comprensión de código.
- Tool calling y function calling en ambos modos (pensamiento y directo).
- Capacidades de agente y razonamiento multi-paso con integración de herramientas externas.
- Soporte multilingüe de más de 100 idiomas y dialectos, con traducción e instrucciones multilingües.
- Cambio dinámico entre modo pensamiento y modo no-pensamiento en un mismo modelo.
- Ventana de contexto larga (32K nativos, 128K con YaRN).

## Casos de uso

- Asistente de atención al cliente: conversaciones multi-turno con contexto de hasta 32K tokens para mantener historial largo sin perder coherencia; el modo no-pensamiento reduce latencia en respuestas rutinarias.
- Generación de código en producción: integración en pipelines de CI/CD mediante tool calling para autocompletar, revisar y refactorizar código, con modo pensamiento activado en tareas complejas.
- Agentes autónomos: orquestación de tareas multi-paso con llamadas a APIs externas gracias al soporte de function calling y razonamiento encadenado.
- Análisis de documentos largos: resumen y extracción de información de contratos, informes o artículos que caben en la ventana de 32K tokens (o 128K con YaRN).
- Traducción y localización multilingüe: cobertura de más de 100 idiomas para traducción automática y adaptación de contenido.
- Tutoría y resolución de problemas matemáticos: modo pensamiento para desglosar pasos de razonamiento en ejercicios de matemáticas y ciencias.
- Despliegue en hardware limitado: la cuantización INT3xFP8 reduce el peso a 31,6 GB, permitiendo servir el modelo en GPUs de 48 GB (A6000, L40S) o en configuraciones multi-GPU consumer, frente a los ~61 GB del BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para la versión INT3xFP8. La model card del modelo base menciona mejoras frente a QwQ y Qwen2.5 en matemáticas, código y razonamiento lógico, pero no incluye cifras concretas en el extracto proporcionado. No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31,6 GB solo para pesos en INT3xFP8; añadir overhead de KV cache y activaciones (varios GB según longitud de contexto y batch).
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB; en consumer, configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB) o GPUs con 48 GB.
- No cabe en una única GPU consumer de 24 GB (RTX 4090, 3090) sin offloading a CPU o sharding.
- Opciones de despliegue: vLLM (≥0.8.5), SGLang (≥0.4.6.post1), TGI, llama.cpp/Ollama (si se generan pesos GGUF a partir del base), KTransformers.
- Latencia y throughput: no disponibles para esta cuantización concreta; el MoE con 3,3B activos reduce el coste computacional frente a un denso de 30B, pero la decuantización INT3 puede añadir overhead en GPUs sin soporte nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-INT3xFP8 (este) | 30,5B | 3,3B | 32K / 128K YaRN | Apache 2.0 | safetensors INT3xFP8 |
| Qwen3-30B-A3B (base BF16) | 30,5B | 3,3B | 32K / 128K YaRN | Apache 2.0 | safetensors BF16 |
| Qwen3-30B-A3B-RAZOR20 | ~25B | no disponible | no disponible | no disponible | no disponible |

La comparativa con otras alternativas (por ejemplo, Mixtral 8x7B o DeepSeek-V2-Lite) no está disponible en la información proporcionada; no se aportan datos de rendimiento comparado.

## Limitaciones y advertencias

- La cuantización INT3xFP8 puede degradar la calidad respecto al modelo base BF16; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en modo no-pensamiento y en dominios especializados.
- Posibles sesgos heredados de los datos de entrenamiento del modelo base; no se detallan en la información disponible.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del modelo base y del repositorio de cuantización antes de uso comercial.
- El soporte de los formatos `compressed-tensors` requiere versiones recientes de transformers, vLLM o SGLang; versiones antiguas pueden no cargar los pesos.
- El modelo es de tipo base (Qwen3-30B-A3B-Base), no la versión instruct; para uso conversacional puede requerir ajuste fino o el uso de la variante instruct correspondiente.
- No se dispone de información sobre idiomas específicos excluidos ni sobre rendimiento en contextos superiores a 32K sin YaRN.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inference-optimization/Qwen3-30B-A3B-INT3xFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Variante RAZOR20 (relacionada): https://huggingface.co/inference-optimization/Qwen3-30B-A3B-RAZOR20
