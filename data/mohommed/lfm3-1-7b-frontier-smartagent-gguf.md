# mohommed/LFM3-1.7B-Frontier-SmartAgent-GGUF

## Resumen

LFM3-1.7B-Frontier-SmartAgent-GGUF es una colección de cuantizaciones en formato GGUF del modelo mohommed/LFM3-1.7B-Frontier-SmartAgent, publicado por el usuario mohommed en Hugging Face. El modelo base es un LLM compacto de 1.728 millones de parámetros basado en la arquitectura LFM3 (Liquid Foundation Models), con una configuración tri-híbrida que combina capas de convolución corta (shortconv) y atención. Su valor diferencial está en dos puntos: un contexto extendido de 512K tokens mediante NTK-YaRN y un esquema de razonamiento en cuatro etapas mediante etiquetas `<think>`, entrenado con GRPO (Group Relative Policy Optimization) y orientado a casos de uso agénticos.

Este repositorio resuelve un problema concreto: ejecutar un modelo pequeño especializado en agentes y tool calling en hardware de consumo, con ficheros que van desde 0,82 GiB (Q3_K_M) hasta 3,45 GiB (F16). Es relevante porque demuestra que cuantizaciones agresivas en arquitecturas híbridas pequeñas pueden retener, según el autor, el 99,8 % de la fiabilidad en código y llamadas a herramientas en Q8_0. El modelo se distribuye bajo licencia Apache 2.0 y es compatible directamente con llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-híbrida (shortconv + attention) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | 512K tokens (con NTK-YaRN) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura LFM3 en configuración tri-híbrida, que combina capas de convolución corta (shortconv) con capas de atención estándar. Este tipo de arquitectura híbrida convolución-atención reduce el coste computacional en secuencias largas respecto a un transformer puro, lo que hace viable la ventana de contexto de 512K tokens mediante escalado NTK-YaRN. La información disponible no detalla el número de capas, dimensiones ocultas ni la proporción exacta de cada tipo de capa.

Sobre el entrenamiento, la model card indica el uso de GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo basada en comparación relativa entre grupos de respuestas, popularizada por DeepSeek para modelos de razonamiento. El etiquetado `<think>` en cuatro etapas ("4-Stage Frontier Reasoning") sugiere un entrenamiento orientado a razonamiento explícito paso a paso antes de la respuesta final. No se ha publicado información sobre el número de tokens de preentrenamiento, composición del dataset ni fases intermedias (SFT, DPO, etc.).

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Razonamiento estructurado mediante modo `<think>` en cuatro etapas.
- Tool calling / function calling, señalado por el autor como una capacidad central del modelo.
- Casos de uso agénticos (tag `agent`), con entrenamiento específico mediante GRPO.
- Contexto ultra-largo de 512K tokens para procesar documentos extensos o historiales de conversación muy largos.
- Fiabilidad en generación de código preservada tras la cuantización (según el autor, 99,8 % en Q8_0).
- Ejecución local vía llama.cpp y Ollama sin dependencias de frameworks propietarios.

## Casos de uso

- Agentes locales con tool calling: el modelo puede integrarse en frameworks como LangChain o funciones de llama.cpp para ejecutar llamadas a herramientas en bucle, con la ventaja de caber en GPUs de 4-8 GB o incluso en CPU.
- Procesamiento de documentos muy largos: con 512K tokens de contexto puede analizar repositorios de código completos, contratos extensos o colecciones de logs en una sola pasada sin RAG.
- Razonamiento paso a paso en dispositivos de borde: la variante Q3_K_M (0,82 GiB) permite desplegar razonamiento `<think>` en dispositivos con recursos muy limitados.
- Asistentes de programación offline: Q8_0 retiene, según el autor, la fiabilidad de código de precisión completa, adecuado para autocompletado y generación de funciones en entornos sin conexión.
- Chatbots multi-turno con memoria extensa: la ventana de contexto permite mantener historiales de conversación de días o semanas sin resumen externo.
- Prototipado rápido de pipelines agénticos: la compatibilidad directa con Ollama (`ollama run hf.co/mohommed/...`) permite iterar sobre agentes sin infraestructura de serving.
- Inferencia en portátiles: Q4_K_M (1,02 GiB) funciona en CPUs y GPUs integradas con latencias razonables para un modelo de 1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona cualitativamente que Q8_0 y Q6_K retienen el "99,8 % de la fiabilidad full-precision en coding y tool-calling", sin especificar la metodología ni la suite de evaluación utilizada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - F16: 3,45 GiB
  - Q8_0: 1,84 GiB
  - Q6_K: 1,42 GiB
  - Q5_K_M: 1,22 GiB
  - Q4_K_M: 1,02 GiB
  - Q3_K_M: 0,82 GiB
- Con contexto de 512K tokens, la KV cache puede añadir varios GiB adicionales; para contextos extremos se recomienda GPU con 16 GB o más, o dejar que llama.cpp gestione offloading a RAM/disco.
- GPUs recomendadas: RTX 3060 de 12 GB o RTX 4090 para contextos largos; para contextos moderados basta cualquier GPU con 4 GB de VRAM en cuantizaciones Q4-Q6.
- Cabe sobradamente en GPUs de consumo: incluso F16 entra en una RTX 4060 Ti de 8 GB o superior; las cuantizaciones Q3-Q5 funcionan en GPUs de 4 GB.
- Inferencia por CPU totalmente viable dado el tamaño; el tamaño del repo completo es de 29,5 GB (incluye todas las cuantizaciones y posiblemente ficheros adicionales).
- Despliegue: llama.cpp, Ollama (`ollama run hf.co/mohommed/LFM3-1.7B-Frontier-SmartAgent-GGUF:Q8_0`). No se menciona soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 1,7B se espera latencia baja y throughput alto, especialmente en Q4_K_M en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Frontier-SmartAgent | 1,73 B | 512K (NTK-YaRN) | Apache 2.0 | GGUF, safetensors | Tri-híbrido, razonamiento `<think>`, tool calling |
| Qwen3-1.7B | 1,7 B | 32K-128K | Apache 2.0 | GGUF, safetensors | Modo thinking, multilingüe, ecosistema muy amplio |
| LFM2-1.2B (Liquid AI) | 1,2 B | 32K | LFM Open License (restricciones) | GGUF, safetensors | Arquitectura híbrida similar, contexto menor |
| SmolLM3-3B | 3 B | 64K (YaRN) | Apache 2.0 | GGUF, safetensors | Doble modo thinking/no-thinking, mayor tamaño |

La principal ventaja de LFM3-1.7B-Frontier-SmartAgent frente a sus alternativas es el contexto de 512K tokens, muy por encima de los 32K-128K habituales en esta clase de modelos, junto con el enfoque agéntico explícito. A cambio, carece de la madurez y del ecosistema de evaluaciones publicadas de Qwen3 o SmolLM3.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un modelo comunitario sin model card detallada, no se han documentado evaluaciones de sesgo.
- Riesgo de alucinación: típico de modelos pequeños (1,7B); el modo `<think>` puede mitigar errores de razonamiento pero no elimina el riesgo, especialmente en hechos y conocimiento factual.
- Cuantizaciones agresivas: el propio autor recomienda evitar Q3_K_M y Q4_K_M para tareas agénticas y de código, ya que la fiabilidad de tool calling puede degradarse; usar Q6_K o Q8_0 en producción.
- Contexto de 512K: requiere implementación NTK-YaRN en llama.cpp; el rendimiento efectivo en contextos extremos no está documentado con benchmarks.
- Idiomas soportados no especificados; no hay garantía explícita de rendimiento en castellano.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque el modelo es de un autor comunitario sin aval de una organización, lo que añade riesgo de mantenimiento y reproducibilidad.
- Modelo reciente con pocas descargas (706) y sin likes: falta de validación por parte de la comunidad; probar en un entorno controlado antes de producción.
- La afirmación del "99,8 % de fiabilidad" no está respaldada por benchmarks públicos verificables.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgent-GGUF
- Modelo base: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgent
- Autor: https://huggingface.co/mohommed
- Paper, blog o demo: no disponible
