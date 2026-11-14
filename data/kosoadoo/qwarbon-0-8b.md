# kosoadoo/Qwarbon-0.8B

## Resumen
Qwarbon-0.8B es un modelo multimodal de tipo image-text-to-text publicado por el usuario kosoadoo en Hugging Face, derivado mediante fine-tuning del modelo base Qwen/Qwen3.5-0.8B-Base de Alibaba. Con 873.438.784 parámetros reales (0,8B), se posiciona como un modelo pequeno orientado a prototipado, ajuste fino especifico de tarea y experimentacion en entornos con recursos limitados.

El modelo hereda la arquitectura hibrida de Qwen3.5, que combina capas de atencion lineal Gated DeltaNet con capas de atencion con compuerta (Gated Attention) y una red feed-forward de dimension intermedia 3584. Incorpora un codificador de vision, lo que habilita la entrada conjunta de imagen y texto, y soporta de forma nativa una longitud de contexto de 262.144 tokens.

Su relevancia actual radica en que ofrece capacidades multimodales y de contexto largo en un tamano inferior a mil millones de parametros, con licencia Apache 2.0, lo que facilita su despliegue en hardware de consumo y su uso como base para experimentacion. No obstante, la model card disponible es la del modelo base Qwen3.5-0.8B y no documenta el proceso concreto de fine-tuning aplicado por kosoadoo, por lo que los detalles especificos de este derivado no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; hibrida Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 (0,8B) |
| Parametros activos | no disponible (no se confirma configuracion MoE en este tamano) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible en la informacion del derivado; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
La arquitectura sigue el diseno de Qwen3.5-0.8B: 24 capas con un layout de 6 bloques compuestos por 3 repeticiones de (Gated DeltaNet -> FFN) seguidas de 1 repeticion de (Gated Attention -> FFN). La Gated DeltaNet emplea 16 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; la Gated Attention usa 8 cabezas para Q y 2 para KV con dimension de cabeza 256 y RoPE de dimension 64. La dimension oculta es 1024, el FFN tiene dimension intermedia 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida del LM. Incluye entrenamiento con multi-token prediction (MTP) en varios pasos.

El modelo base fue preentrenado y postentrenado por Qwen con fusion temprana de tokens multimodales y tecnicas de RL a escala. El derivado Qwarbon-0.8B es un fine-tuning de ese base, pero la informacion disponible no detalla el dataset, el numero de tokens, ni si se aplico RLHF o DPO en este ajuste concreto. Tampoco se documentan innovaciones adicionales introducidas por el autor del derivado.

## Capacidades
- Generacion de texto y razonamiento en modo no-thinking (los benchmarks publicados corresponden a este modo).
- Comprension de imagen y texto combinados (pipeline image-text-to-text), gracias al codificador de vision heredado.
- Procesamiento de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Capacidades multilingues heredadas del base (201 idiomas y dialectos segun la model card de Qwen), aunque el derivado no las documenta explicitamente.
- Soporte potencial de tool calling y flujos de agentes por herencia del base Qwen3.5, aunque no confirmado en la informacion del derivado.
- Compatibilidad con transformers, vLLM, SGLang y KTransformers segun la model card del base.
- No se documentan capacidades de audio ni modos de pensamiento extendido especificos para este derivado.

## Casos de uso
- Prototipado rapido de asistentes multimodales: el modelo puede procesar pares imagen-texto en entornos de desarrollo con GPU de consumo, lo que permite validar ideas de producto sin infraestructura dedicada.
- Clasificacion y descripcion de imagenes en pipelines de preprocesado: al ser image-text-to-text, puede generar descripciones o etiquetas de imagenes para enriquecer datasets o sistemas de busqueda.
- Ajuste fino especifico de dominio: su tamano de 0,8B y licencia Apache 2.0 lo hacen adecuado como base para fine-tuning en tareas concretas (soporte, extraccion de informacion) con costes de entrenamiento bajos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Educacion e investigacion: util como banco de pruebas para estudiar arquitecturas hibridas (Gated DeltaNet) y tecnicas de fusion multimodal en un modelo pequeno.
- Despliegue en el borde o en local: al caber en GPUs de consumo, permite ejecutar inferencia privada sin enviar datos a servicios externos.
- Generacion asistida en entornos con restricciones de latencia: su escala reducida favorece respuestas rapidas en aplicaciones interactivas.

## Benchmarks y rendimiento
Los datos disponibles corresponden al modelo base Qwen3.5-0.8B en modo no-thinking, no al derivado Qwarbon-0.8B. No se han publicado resultados de benchmarks especificos del derivado en la informacion disponible.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 5 GB segun longitud de contexto.
- En cuantizacion de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas de VRAM para contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son viables. Cabe en GPUs de consumo.
- El contexto de 262.144 tokens incrementa notablemente el uso de memoria por la cache KV; para contextos muy largos se recomienda A100/H100 o tecnicas de atencion eficiente.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card del base; llama.cpp/Ollama no estan confirmados para este derivado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (no-thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwarbon-0.8B (este) | 0,87B | 262.144 | no disponible (base: 29,7) | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | 29,7 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | 2B | no disponible | 55,3 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- El derivado no documenta su proceso de fine-tuning, dataset ni evaluacion propia; se desconoce si degrada o mejora las capacidades del base.
- Los benchmarks mostrados corresponden al modelo base, no al derivado; no deben atribuirse a Qwarbon-0.8B.
- Riesgo de alucinacion inherente a modelos de 0,8B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Rendimiento limitado en comparacion con modelos mayores (MMLU-Pro 29,7 frente a 55,3 de Qwen3.5-2B); no apto para tareas que exijan alta precision.
- Sesgos potenciales heredados de los datos de entrenamiento del base; no documentados para el derivado.
- Idiomas soportados no confirmados para el derivado; verificar comportamiento multilingue antes de produccion.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del base y las condiciones de uso de Qwen para despliegues comerciales.
- El contexto largo de 262.144 tokens puede degradar la calidad en los extremos y elevar el coste de memoria; validar en el caso de uso concreto.
- El modelo esta marcado para prototipado e investigacion; no se recomienda como solucion de produccion sin evaluacion previa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kosoadoo/Qwarbon-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
