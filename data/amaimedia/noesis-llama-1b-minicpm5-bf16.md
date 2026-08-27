# AMAImedia/NOESIS-Llama-1B-MiniCPM5-BF16

## Resumen

NOESIS-Llama-1B-MiniCPM5-BF16 es un modelo de lenguaje denso de 1.080 millones de parámetros desarrollado por AMAImedia, la organización liderada por Ilia Bolotnikov, como parte de la plataforma profesional de doblaje multilingüe NOESIS. El modelo actúa como director, supervisor y orquestador dentro del pipeline de doblaje, tomando decisiones de control de calidad, sincronización y dirección de voces. Se basa en el modelo MiniCPM5-1B de OpenBMB, sobre el que se ha aplicado un ajuste fino supervisado (SFT) mediante una LoRA fusionada (NT-325) que elimina la fuga de razonamiento (`thinking`) y produce salidas directas y concisas.

Su relevancia radica en su capacidad para manejar contextos de hasta 128.000 tokens, lo que permite procesar un guion cinematográfico completo en una sola pasada, y en su integración en el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). Está disponible bajo licencia Apache 2.0, con pesos en BF16 y una variante cuantizada GGUF Q8_0, lo que facilita su despliegue en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (dense, arquitectura Llama estándar) |
| Parametros totales | 1.080.632.832 (~1,08 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128 K) |
| Tipos de cuantizacion | BF16 nativo; GGUF Q8_0 disponible como archivo hermano |
| Idiomas soportados | Inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, ~2,16 GB); GGUF Q8_0 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer densa estándar de Llama, con 24 capas y atención con consultas agrupadas (GQA) de 16 cabezas de consulta y 2 cabezas de clave/valor. El tokenizer es el de MiniCPM5. El entrenamiento parte del modelo base openbmb/MiniCPM5-1B, sobre el que se ha aplicado un ajuste fino supervisado (SFT) mediante una LoRA (NT-325) fusionada con `peft.merge_and_unload`. Los datos de entrenamiento incluyen los datasets openbmb/Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605. No se documenta el uso de RLHF o DPO; el proceso es exclusivamente SFT. La innovación principal es la eliminación del modo `thinking` en la salida, de modo que el modelo genera únicamente decisiones directas, y su integración en el framework DHCF-FNO para control determinista de operadores neuronales congelados.

## Capacidades

- Generación de texto con salida directa y concisa, sin razonamiento intermedio (`no-think`).
- Gestión de contexto largo de hasta 128 K tokens, suficiente para un guion de cine completo o revisiones de calidad multi-hablante.
- Actuación como director, supervisor y orquestador en pipelines de doblaje automatizado.
- Toma de decisiones sobre isocronía, sincronización labial y dirección de actores de voz.
- Soporte multilingüe en inglés, ruso y chino.
- Compatible con el chat template `chat_template.jinja` específico para el rol de director.
- Despliegue en BF16 o cuantización GGUF Q8_0 para entornos con recursos limitados.

## Casos de uso

- Dirección de doblaje automatizada: el modelo actúa como director, emitiendo instrucciones de entonación, ritmo y sincronización para cada línea de diálogo, aprovechando su contexto de 128 K para abarcar secuencias completas.
- Control de calidad multi-hablante: supervisa la coherencia y consistencia de las voces de varios actores en una película, detectando desviaciones en el tono o la emoción.
- Orquestación de subtareas en el pipeline NOESIS: coordina módulos especializados (clonación de voz, traducción, mezcla) mediante decisiones de enrutamiento.
- Revisión de guiones largos: procesa documentos de más de 32 K tokens para verificar la integridad de diálogos y acotaciones.
- Asistente de texto con contexto extendido: útil para tareas de resumen, extracción de información o generación de informes sobre documentos extensos en inglés, ruso o chino.
- Despliegue en entornos de producción con restricciones de hardware: gracias a su tamaño de 1 B y la cuantización Q8_0, puede ejecutarse en GPUs de consumo o CPUs con aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una prueba interna de comparación A/B entre tres variantes, realizada con 5 prompts de supervisión:

| Variante | Basura (garbage) | Velocidad | Calidad |
|---|---|---|---|
| Upstream original (sin SFT NT-325) | 5 / 5 (todo en `thinking`) | 15,1 tok/s | Razonamiento en traza |
| **Este bundle (NT-325 SFT)** | **0 / 5** | **~17 tok/s** | Sin `thinking`, pero algunas respuestas débiles (dirección compress/expand a veces incorrecta) |
| GGUF Q8_0 (archivo hermano) | 0 / 5 | — | Prompt-echo, pero funcional |

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos ocupan ~2,16 GB; con overhead de activaciones y KV cache, se recomiendan al menos 4 GB de VRAM. En GGUF Q8_0, los pesos se reducen a ~1,1 GB, permitiendo ejecución en GPUs con 2-3 GB.
- GPUs recomendadas: cualquier GPU con soporte para BF16 (RTX 3090, RTX 4090, A100, H100) o GPUs de consumo con cuantización (GTX 1660, RTX 3060, etc.).
- Cabe en GPUs de consumo: sí, especialmente en cuantización Q8_0.
- Opciones de despliegue: transformers (Hugging Face), vLLM, llama.cpp, Ollama, TGI (Text Generation Inference). No se documenta una configuración específica, pero al ser arquitectura Llama, es compatible con estas herramientas.
- Latencia y throughput: la prueba interna reporta ~17 tok/s en un hardware no especificado; no hay datos oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **NOESIS-Llama-1B-MiniCPM5-BF16** (este) | 1,08 B | 128 K | Director/supervisor | Apache 2.0 | Hugging Face |
| NOESIS-Qwopus3.5-0.8B-v3 (hermano) | 0,8 B | no disponible | Director rápido | Apache 2.0 (presumible) | Hugging Face |
| openbmb/MiniCPM5-1B (base) | 1,08 B | no disponible | Modelo general | Apache 2.0 | Hugging Face |

Según la model card, el Qwopus 0.8B ofrece decisiones más precisas en isocronía, mientras que este modelo 1B es preferible cuando se requiere contexto largo (>32 K hasta 128 K). No se dispone de datos de rendimiento comparativo en benchmarks estándar.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos; al entrenarse con datos web, puede heredar sesgos presentes en esos corpus.
- Riesgo de alucinación: no se ha evaluado formalmente; como modelo de lenguaje, puede generar información incorrecta o inventada.
- Limitaciones de contexto: aunque soporta 128 K tokens, la calidad puede degradarse en contextos muy largos; la model card indica que algunas decisiones de dirección (compress/expand) son débiles.
- Idiomas: solo inglés, ruso y chino; no soporta otros idiomas de forma nativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir el aviso de NOESIS y respetar los términos de la licencia.
- Caveat de producción: la variante GGUF Q8_0 presenta prompt-echo en la prueba A/B; se recomienda validar su comportamiento antes de usarla en entornos críticos. Para decisiones de isocronía difíciles, se sugiere usar el modelo Qwopus 0.8B hermano.

## Enlaces

- Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Llama-1B-MiniCPM5-BF16
- GitHub de AMAImedia: https://github.com/AMAImedia/
- Paper de MiniCPM5 (arxiv): https://arxiv.org/abs/2506.07900
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Perfil de Friendli.ai (despliegue): https://friendli.ai/models/AMAImedia/NOESIS-Llama-1B-MiniCPM5-BF16
