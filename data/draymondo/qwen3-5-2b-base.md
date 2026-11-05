# Draymondo/Qwen3.5-2B-Base

## Resumen

Qwen3.5-2B-Base es la variante base (solo preentrenada) de 2B parametros de la familia Qwen3.5 del equipo Qwen (Alibaba). Se distribuye como pesos en formato Hugging Face Transformers y esta pensada para fine-tuning, experimentos de in-context learning y desarrollo de investigacion, no para interaccion directa. Este repositorio concreto (Draymondo/Qwen3.5-2B-Base) replica los pesos y la configuracion del modelo oficial, con licencia Apache 2.0.

La relevancia tecnica esta en su arquitectura hibrida: combina capas de Gated DeltaNet (atencion lineal) con capas de Gated Attention clasica en un patron repetido, lo que reduce el coste de inferencia en contextos largos manteniendo calidad. Ademas es un modelo multimodal de fusion temprana (image-text-to-text) con contexto nativo de 262.144 tokens, extensible hasta 1.010.000.

Con 2.274.069.824 parametros reales (segun safetensors), 24 capas y una ventana de contexto muy amplia para su tamano, es un candidato para despliegues en una sola GPU consumer y para tareas de agentes con contexto largo, aunque al ser base requiere post-entrenamiento para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM hibrido con vision encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2.274.069.824 (2B nominales) |
| Parametros activos | no disponible (no se especifica MoE en la configuracion de 2B) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no indicadas) |
| Idiomas soportados | 201 idiomas y dialectos (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con vision encoder y fusion temprana de tokens multimodales. La columna vertebral del lenguaje tiene 24 capas organizadas en un patron hibrido: 6 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet usan atencion lineal con 16 cabezas para V y 16 para QK, dimension de cabeza 128. Las capas Gated Attention usan 8 cabezas para Q y 2 para KV, dimension de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimension intermedia 6144, hidden dimension 2048 y embedding de tokens de 248.320 (con padding), atado a la salida LM.

El entrenamiento combina preentrenamiento y post-entrenamiento, con entrenamiento multi-step de MTP (multi-token prediction). La model card menciona RL escalado a entornos de millones de agentes y una eficiencia de entrenamiento multimodal cercana al 100 % respecto a texto solo. Los control tokens `<|im_start|>` y `<|im_end|>` estan entrenados para permitir LoRA/PEFT eficiente con la plantilla de chat oficial, evitando reentrenar embeddings pese al vocabulario grande. No se detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento general en modo base (sin post-entrenamiento conversacional).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text, fusion temprana).
- Codigo y matematicas (la familia Qwen3.5 declara paridad con Qwen3 en razonamiento y coding).
- Capacidades de agente y razonamiento multi-paso, potenciadas por RL a escala segun la model card.
- Soporte multilingue amplio: 201 idiomas y dialectos.
- Contexto largo nativo de 262.144 tokens, extensible a ~1M.
- Compatibilidad con tool calling y function calling a traves de la plantilla de chat (heredada de la familia Qwen3.5).
- Compatible con Transformers, vLLM y SGLang.

## Casos de uso

- Fine-tuning supervisado para dominio especifico: al ser un modelo base de 2B con licencia Apache 2.0, se puede ajustar con LoRA sobre datos propios (legal, sanitario, atencion al cliente) sin coste de licencia y en una sola GPU.
- Procesamiento de documentos largos con imagen: informes escaneados, facturas o PDFs donde el contexto de 262k tokens permite ingerir documentos completos junto con sus imagenes sin trocear.
- Agentes con memoria extendida: pipelines de razonamiento multi-paso que acumulan historial y resultados de herramientas durante muchas iteraciones, aprovechando la ventana de contexto y el soporte de tool calling.
- Generacion de codigo asistida en IDE: integracion via vLLM o SGLang como backend de autocompletado y refactorizacion, con latencia baja gracias a las capas de atencion lineal.
- Investigacion en arquitecturas hibridas: banco de pruebas para comparar Gated DeltaNet frente a atencion clasica en tareas de contexto largo con un modelo de solo 2B parametros.
- Extraccion de informacion multimodal: clasificacion y estructuracion de capturas, graficos o tablas combinadas con texto para pipelines de data engineering.
- Despliegue en edge o consumer GPU: prototipos y demos locales con cuantizacion (previa conversion) en tarjetas de 8-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: ~4,6 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica 6-8 GB para contexto corto.
- VRAM con contexto largo: el KV cache crece con la ventana; para 262k tokens se requiere planificacion cuidadosa y, probablemente, cuantizacion del cache (no confirmada para este modelo).
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo y batch alto; RTX 4090 (24 GB) para contexto medio y fine-tuning LoRA.
- Consumer GPU: cabe en RTX 3090/4090, RTX 4080 y potencialmente en GPUs de 8-12 GB tras cuantizacion a 8 o 4 bits (conversion no publicada en el repo).
- Despliegue: Transformers, vLLM, SGLang (segun model card). llama.cpp/Ollama no confirmados al no haber GGUF publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B-Base | 2,27B | 262k (ext. 1M) | Texto + imagen | Apache 2.0 |
| Qwen3-VL (2B, referencia familia) | ~2B | no disponible | Texto + imagen | Apache 2.0 |
| Qwen3-1.7B | 1,7B | 32k (ext. 131k) | Texto | Apache 2.0 |
| Llama 3.2 1B/3B | 1-3B | 128k | Texto (3B: vision en variante) | Llama Community License |

La ventaja principal de Qwen3.5-2B-Base frente a alternativas de tamano similar es la combinacion de contexto nativo de 262k tokens, multimodalidad y licencia Apache 2.0. No hay datos de benchmarks publicados en la informacion disponible para comparar rendimiento numerico.

## Limitaciones y advertencias

- Modelo base: no esta post-entrenado para dialogo; las respuestas directas pueden ser incoherentes o no seguir instrucciones sin fine-tuning.
- Riesgo de alucinacion elevado en uso zero-shot, especialmente en tareas factuales.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los datos de preentrenamiento a gran escala pueden introducir sesgos culturales y linguisticos.
- Idiomas: se declaran 201, pero la calidad relativa por idioma no esta cuantificada.
- Contexto: aunque se declara extension a 1M tokens, el rendimiento mas alla de 262k no esta verificado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor del repo replica pesos oficiales; conviene verificar la procedencia y el LICENSE enlazado al repo oficial Qwen.
- No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin conversion manual.
- Repo con 0 descargas y 0 likes: sin validacion comunitaria; tratar como artefacto no auditado.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/Draymondo/Qwen3.5-2B-Base
- Repo oficial de referencia: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Licencia oficial: https://huggingface.co/Qwen/Qwen3.5-2B-Base/blob/main/LICENSE
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
