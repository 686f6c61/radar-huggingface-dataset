# OceanLabs/Ocean-Coder-7B-Fusion-max

## Resumen

Ocean-Coder-7B-Fusion-max es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) publicado por OceanLabs. No es el resultado de un entrenamiento desde cero ni de un fine-tuning, sino de una fusión de pesos (weight merge) mediante SLERP entre Qwen2.5-Coder-7B-Instruct (modelo primario) y Qwen2.5-7B-Instruct. El objetivo declarado es conservar la capacidad de generación de código del modelo Coder e incorporar parte de la capacidad de seguimiento de instrucciones generales y de manejo del lenguaje del modelo Instruct.

La relevancia del modelo es doble. Por un lado, demuestra una técnica de merging con interpolación por capas (gradiente lineal en atención y MLP a lo largo de las 28 capas) que puede resultar útil como referencia metodológica para quien experimente con model merging. Por otro, al heredar la arquitectura Qwen2 (28 capas, hidden size 3584, vocabulario de 152064 tokens y rope_theta 1e6), mantiene plena compatibilidad con el ecosistema transformers y con las herramientas de despliegue habituales para modelos Qwen2.

Es importante señalar que el autor indica explícitamente que no se ha realizado ningún entrenamiento ni fine-tuning y que el merge no ha sido evaluado con benchmarks. Cualquier afirmación sobre su calidad debe considerarse no verificada hasta que se publiquen evaluaciones. La licencia es Apache 2.0 y los idiomas declarados son alemán e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 28 capas, hidden size 3584, rope_theta 1e6 |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los modelos base Qwen2.5 soportan hasta 32 768 tokens nativos, ampliables; el merge no documenta un valor propio) |
| Tipos de cuantización | no disponible en la model card; al ser un modelo Qwen2 en bfloat16 es compatible con cuantizaciones estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); repo de 15,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen2 sin modificaciones estructurales: 28 capas, dimensión oculta de 3584, vocabulario de 152064 tokens y rope_theta de 1e6. Al compartir arquitectura exacta con ambos modelos base, los pesos pueden interpolarse tensor a tensor sin necesidad de cirugía arquitectónica.

El proceso de fusión emplea SLERP (spherical linear interpolation) calculado por tensor en float32 y reconvertido a bfloat16. El parámetro `t` indica el peso hacia Qwen2.5-7B-Instruct (con `t = 0` se obtiene el Coder puro). La interpolación es dependiente de la capa: en los tensores de `self_attn` el valor de `t` va de 0.0 en la capa 0 a 0.5 en la capa 27 de forma lineal; en los tensores `mlp` va de 0.5 en la capa 0 a 0.0 en la capa 27; las layernorms y otros tensores de capa usan `t = 0.3`; y `embed_tokens`, `lm_head` y `model.norm` usan `t = 0.2`. Cuando dos tensores son casi colineales (|cos| > 0.9995) se sustituye SLERP por interpolación lineal simple. La fusión se realizó con un script NumPy independiente que implementa la misma fórmula que mergekit, no con mergekit directamente.

No hubo entrenamiento, fine-tuning, RLHF ni DPO. Los ficheros `config.json` y de tokenizer se mantienen sin cambios respecto a Qwen2.5-Coder-7B-Instruct. OceanLabs ha sustituido `generation_config.json` por sus propios valores por defecto (temperature 0.4, top_p 0.9, top_k 20, repetition_penalty 1.05) e incorpora una plantilla ChatML con un system prompt propio que puede reemplazarse pasando un mensaje de sistema explícito.

## Capacidades

- Generación de código: escritura de funciones, scripts y fragmentos en múltiples lenguajes, heredada principalmente de Qwen2.5-Coder-7B-Instruct.
- Explicación de código y refactorización: el modelo está orientado a generar código correcto, seguro, legible y eficiente según su system prompt por defecto.
- Depuración: análisis de errores y propuesta de correcciones en tareas de debugging.
- Seguimiento de instrucciones generales: capacidad mezclada desde Qwen2.5-7B-Instruct, con `t` mayor en las capas iniciales de MLP y en las capas finales de atención.
- Conversación multi-turno: formato ChatML con roles system, user y assistant.
- Multilingüismo limitado a alemán e inglés según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no documentado explícitamente en la información proporcionada.
- Modo thinking, visión o audio: no soportado; el modelo es exclusivamente de texto.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.

## Casos de uso

- Asistente de programación en IDE: el modelo puede completar y explicar fragmentos de código en un flujo de chat multi-turno, aprovechando la base Coder y el formato ChatML para integrarse en extensiones de editor.
- Generación de tests unitarios: dada una función existente, el modelo puede proponer casos de prueba y aserciones, tarea típica de los modelos Coder de la familia Qwen2.5.
- Refactorización asistida: reescritura de bloques de código para mejorar legibilidad o eficiencia, con explicación del cambio en alemán o inglés.
- Atención al desarrollador en documentación técnica: responder preguntas sobre APIs y ejemplos de uso en inglés o alemán, con la ventaja de que el merge incorpora parte de la capacidad conversacional general del modelo Instruct.
- Experimentación con model merging: servir como caso de referencia reproducible para estudiar el efecto de gradientes de `t` por capa en la mezcla de un modelo especializado en código con uno generalista.
- Punto de partida para fine-tuning: al ser Apache 2.0 y compatible con transformers, puede usarse como base para ajuste supervisado en dominios concretos antes de desplegar en producción.
- Generación de documentación bilingüe (alemán/inglés): redacción de docstrings y guías técnicas en los dos idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el merge no ha sido evaluado y que cualquier afirmación sobre su calidad debe considerarse no verificada hasta que se publiquen evaluaciones.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 15 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 18-20 GB de VRAM para inferencia cómoda a contexto moderado.
- Cuantización a 8 bits: en torno a 8 GB de VRAM, viable en GPUs consumer de gama alta.
- Cuantización a 4 bits (GGUF Q4): en torno a 4-5 GB de VRAM, viable en GPUs consumer de 8 GB o más.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para bfloat16 en single-GPU; RTX 3090, RTX 4080 y RTX 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: sí, en bfloat16 en tarjetas de 24 GB (RTX 3090/4090) y en cuantizaciones menores en tarjetas de 8-16 GB.
- Opciones de despliegue: transformers (>= 4.37, requisito indicado por el autor), text-generation-inference (el modelo está etiquetado como compatible con TGI y endpoints), vLLM por compatibilidad con Qwen2, llama.cpp y Ollama mediante conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ocean-Coder-7B-Fusion-max | 7,6 B | no disponible en la ficha | Apache 2.0 | Hugging Face (transformers, safetensors) | Merge SLERP sin entrenamiento ni benchmarks |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32 768 tokens (nativo, ampliable) | Apache 2.0 | Hugging Face, ecosistema amplio | Modelo base primario; benchmarks publicados por Qwen |
| Qwen2.5-7B-Instruct | 7,6 B | 32 768 tokens (nativo, ampliable) | Apache 2.0 | Hugging Face, ecosistema amplio | Modelo base secundario; orientado a instrucciones generales |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B totales (2,4 B activos, MoE) | 128 000 tokens | Licencia propia de DeepSeek | Hugging Face | Alternativa MoE especializada en código, mayor contexto y distinta licencia |

La comparación directa con los dos modelos base es la más informativa: Ocean-Coder-7B-Fusion-max hereda su arquitectura y tokenizer sin cambios, por lo que las diferencias de comportamiento dependen exclusivamente de la interpolación de pesos, no de datos adicionales. Frente a alternativas MoE como DeepSeek-Coder-V2-Lite, el modelo de OceanLabs es más pequeño en parámetros totales pero no ofrece un contexto documentado superior.

## Limitaciones y advertencias

- Calidad no verificada: el autor declara que el merge no ha sido evaluado con benchmarks; no hay evidencia publicada de que supere, iguale o empeore a los modelos base en ninguna tarea.
- Sin entrenamiento adicional: al ser una interpolación de pesos, no incorpora datos nuevos ni correcciones de sesgos o alineamiento más allá de lo heredado de los modelos base.
- Riesgo de alucinación: inherente a los modelos de 7 B de la familia Qwen2.5; sin evaluaciones específicas no puede cuantificarse el efecto del merge sobre la tasa de alucinación.
- Idiomas limitados: la model card declara solo alemán e inglés; el rendimiento en castellano u otros idiomas no está documentado y puede degradarse respecto a los modelos base.
- Longitud de contexto no documentada: aunque los modelos base soportan 32 768 tokens nativos, la ficha del merge no especifica un valor propio ni se ha validado el comportamiento a contextos largos tras la interpolación.
- Tool calling y comportamiento agéntico no documentados: no hay garantía de que las capacidades de function calling de los modelos base se conserven intactas tras el merge.
- Sin cuantizaciones oficiales: el repo solo contiene pesos safetensors en bfloat16; cualquier GGUF, AWQ o GPTQ debe generarse externamente y validarse.
- Advertencia de producción: al no existir evaluaciones, no se recomienda su uso en producción sin una batería propia de pruebas frente a Qwen2.5-Coder-7B-Instruct y Qwen2.5-7B-Instruct en las tareas objetivo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los modelos base (también Apache 2.0) y de cualquier componente derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OceanLabs/Ocean-Coder-7B-Fusion-max
- Modelo base primario (Qwen2.5-Coder-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base secundario (Qwen2.5-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencia mergekit (arXiv:2409.12186): https://arxiv.org/abs/2409.12186
- Referencia Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Licencia del modelo: https://huggingface.co/OceanLabs/Ocean-Coder-7B-Fusion/blob/main/LICENSE
