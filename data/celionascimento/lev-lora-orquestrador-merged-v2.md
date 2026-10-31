# celioNascimento/Lev-LoRA-Orquestrador-Merged-v2

## Resumen

Lev-LoRA-Orquestrador-Merged-v2 es un ajuste fino (fine-tune) de Qwen2.5-7B-Instruct publicado por el usuario celioNascimento en HuggingFace. El modelo parte de la versión cuantizada a 4 bits (bnb-4bit) de Qwen2.5-7B-Instruct preparada por Unsloth, sobre la que se ha aplicado un entrenamiento con LoRA —presumiblemente orientado a tareas de orquestación conversacional, según sugiere su nombre— y posteriormente se han fusionado (merged) los pesos del adaptador en el modelo base, dando como resultado un modelo denso de 7,62 mil millones de parámetros listo para inferencia sin gestión de adaptadores.

El entrenamiento se realizó con la biblioteca Unsloth en combinación con TRL de HuggingFace, lo que permite entrenar aproximadamente el doble de rápido que con configuraciones estándar. Al tratarse de un finetune comunitario sin model card detallada, la información pública sobre datos de entrenamiento, metodología y resultados es limitada. Su relevancia principal es como ejemplo de modelo ligero derivado de Qwen2.5-7B-Instruct, una de las familias de modelos abiertos más utilizadas en la actualidad, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 7.615.616.512 (~7,62 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 128.000 tokens, pero no consta en la ficha del finetune) |
| Tipos de cuantizacion | Pesos publicados en FP16/BF16 (safetensors); el modelo base original se entrenó desde la versión bnb-4bit |
| Idiomas soportados | en (declarado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15,2 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer decoder de Qwen2.5-7B-Instruct: un modelo denso con atención estándar, agrupamiento por consultas (GQA) y codificación posicional RoPE. No es una arquitectura MoE, por lo que todos los parámetros se activan en cada pasada de inferencia.

El proceso de entrenamiento consistió en un ajuste fino eficiente de parámetros (PEFT) mediante LoRA sobre la variante cuantizada a 4 bits mediante bitsandbytes (bnb-4bit) de Qwen2.5-7B-Instruct publicada por Unsloth. Tras el entrenamiento, los pesos del adaptador LoRA se fusionaron con el modelo base, generando un modelo completo de 7,62 mil millones de parámetros. El autor indica que el entrenamiento se realizó con Unsloth y la biblioteca TRL de HuggingFace, que acelera el proceso aproximadamente 2x respecto a métodos convencionales. No se ha publicado información sobre el dataset utilizado, el número de tokens de entrenamiento, ni sobre el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional, heredada de Qwen2.5-7B-Instruct (pipeline text-generation, etiqueta conversational).
- Potencial orientación a tareas de orquestación, según el nombre del modelo, aunque no se describen explícitamente en la model card.
- Soporte de chat mediante la plantilla de instrucciones de Qwen2.5-Instruct (no documentado explícitamente, pero implícito por el modelo base).
- Compatibilidad con transformers y text-generation-inference de HuggingFace (etiquetas del repositorio).
- No se declara soporte de tool calling, function calling, visión, audio ni modos de razonamiento extendido para este finetune concreto (aunque el modelo base Qwen2.5-7B-Instruct sí soporta tool calling).

## Casos de uso

- Chatbots conversacionales ligeros: al ser un modelo de 7,6 B parámetros fusionado y en safetensors, puede desplegarse en una sola GPU de consumo para atención al cliente o asistentes internos con latencias bajas.
- Experimentación con finetunes comunitarios: útil como punto de partida para evaluar cómo un LoRA sobre Qwen2.5-7B-Instruct afecta al comportamiento del modelo base en tareas de orquestación.
- Orquestación de flujos de trabajo: si el ajuste fino se centró en tareas de orquestación de agentes o instrucciones, podría emplearse como componente central de un pipeline multi-paso (capacidad no verificada por benchmarks).
- Prototipado rápido con Ollama o llama.cpp: el tamaño contenido (~15 GB en FP16) permite convertirlo a GGUF y probarlo localmente sin infraestructura dedicada.
- Base para nuevos finetunes: al ser un modelo abierto con licencia Apache 2.0, puede usarse como punto de partida para ajustes adicionales en dominios específicos.
- Inferencia en endpoints gestionados: las etiquetas endpoints_compatible y text-generation-inference indican compatibilidad con los Inference Endpoints de HuggingFace para despliegue en producción de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ningún otro conjunto de pruebas, ni comparaciones con el modelo base Qwen2.5-7B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (FP16/BF16): aproximadamente 15-16 GB solo para los pesos, más overhead de activaciones y KV cache (en la práctica, 18-20 GB recomendados).
- Con cuantización a 4 bits (por ejemplo, convirtiendo a GGUF Q4_K_M o aplicando bnb-4bit), el consumo bajaría a unos 5-6 GB de VRAM.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 ejecuta el modelo en FP16 con holgura; en la nube, una T4 (con cuantización) o una A10G/A100 en precisión completa.
- Cabe en GPUs de consumo: sí, en una RTX 4090 o 3090 en FP16, y en GPUs de 8-12 GB (RTX 3060, RTX 4070) si se cuantiza a 4 bits.
- Opciones de despliegue: transformers de HuggingFace (formato nativo), vLLM, TGI (text-generation-inference), y tras conversión a GGUF, llama.cpp y Ollama.
- Latencia y throughput: no disponible; al ser un modelo denso de 7,6 B, puede esperarse un rendimiento típico de esta categoría (decenas de tokens por segundo en una RTX 4090), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lev-LoRA-Orquestrador-Merged-v2 | 7,62 B | no disponible (base: hasta 128 K) | Apache 2.0 | Finetune comunitario sin benchmarks publicados |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 128.000 tokens | Apache 2.0 | Modelo original con tool calling y soporte de 29+ idiomas documentados |
| Llama 3.1 8B Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License | Competidor directo en tamaño; licencia con restricciones adicionales |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.000 tokens | Apache 2.0 | Similar en tamaño y licencia, contexto menor |

## Limitaciones y advertencias

- Ausencia total de documentación de entrenamiento: no se conoce el dataset, la composición de los datos ni el número de pasos, lo que dificulta evaluar la calidad y fiabilidad del ajuste fino.
- Sin benchmarks publicados: no hay evidencia objetiva de que el finetune mejore o degrade el rendimiento del modelo base; se recomienda evaluarlo antes de cualquier uso en producción.
- Idioma declarado: inglés ("en"). Aunque el modelo base Qwen2.5 soporta múltiples idiomas incluido el castellano, el finetune puede haber degradado el rendimiento en otros idiomas.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por un finetune con datos no documentados.
- Sesgos: el modelo base Qwen2.5 incorpora sesgos presentes en sus datos de entrenamiento; los datos del finetune, al ser desconocidos, añaden incertidumbre adicional.
- Posible pérdida de capacidades del modelo base: los finetunes con LoRA sobre versiones cuantizadas a 4 bits pueden degradar capacidades generales como tool calling, razonamiento matemático o código.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque debe verificarse el cumplimiento de los términos de la licencia del modelo base Qwen2.5.
- Trazabilidad: el repositorio tiene 780 descargas y 0 likes, sin comunidad activa de verificación; no hay reportes de terceros sobre su comportamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/celioNascimento/Lev-LoRA-Orquestrador-Merged-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de HuggingFace (biblioteca de entrenamiento): https://github.com/huggingface/trl
- Qwen2.5-7B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
