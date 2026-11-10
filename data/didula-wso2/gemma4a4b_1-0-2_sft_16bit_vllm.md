# didula-wso2/gemma4a4b_1-0-2_sft_16bit_vllm

## Resumen

`didula-wso2/gemma4a4b_1-0-2_sft_16bit_vllm` es un ajuste fino (SFT) del modelo multimodal `unsloth/gemma-4-26b-a4b-it`, publicado por el usuario didula-wso2. Se trata de un modelo de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, y está pensado para conversación multirronda. El repositorio contiene pesos en formato safetensors de 16 bits (no cuantizados), con un total de 25.805.936.206 parámetros reales según los metadatos de safetensors.

El nombre del repositorio sugiere que el modelo base es una variante MoE de Gemma 4 con aproximadamente 26 000 millones de parámetros totales y alrededor de 4 000 millones activos por token (de ahí el sufijo "a4b"), aunque la model card no confirma explícitamente esta arquitectura. El ajuste se realizó con Unsloth y la librería TRL, lo que según el autor permitió entrenar "2x más rápido". El modelo está etiquetado como compatible con vLLM y text-generation-inference, y declara licencia Apache 2.0.

La relevancia de esta ficha es limitada: se trata de una publicación de un particular sin benchmarks, sin descripción del dataset de ajuste fino y sin documentación de hiperparámetros. Resulta útil como referencia para quien quiera reproducir el pipeline de SFT con Unsloth sobre Gemma 4, pero no como modelo listo para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); se infiere MoE por el sufijo "a4b" del nombre, no confirmado en la model card |
| Parámetros totales | 25.805.936.206 |
| Parámetros activos | no disponible (se infiere ~4 000 millones por el sufijo "a4b", sin confirmación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en 16 bits (safetensors); no se documentan otras variantes GGUF/AWQ/GPTQ en el repo |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 51,6 GB) |

## Arquitectura y entrenamiento

El modelo base `unsloth/gemma-4-26b-a4b-it` es, por nomenclatura, una variante de Gemma 4 con arquitectura Mixture of Experts (26B totales, ~4B activos) en versión instruction-tuned. La model card del ajuste no detalla la arquitectura interna (número de expertos, top-k de routing, tipo de atención, vocabulario), por lo que estos datos deben considerarse no disponibles en la información proporcionada. El pipeline declarado es `image-text-to-text`, lo que implica un codificador visual acoplado a un decoder de lenguaje, pero no se especifica la resolución de imagen, el número de tokens visuales ni el proyector multimodal.

Sobre el entrenamiento: el autor indica únicamente que el ajuste se hizo con Unsloth y TRL, y que fue "2x más rápido" gracias a Unsloth. No se documentan el número de tokens de entrenamiento, la composición del dataset, la función de pérdida, hiperparámetros (learning rate, epochs, LoRA vs full fine-tuning) ni si hubo etapas de RLHF/DPO. El sufijo "16bit" y "vllm" en el nombre sugiere que los pesos se exportaron en precisión completa (16 bits) para servir con vLLM, pero esto es una inferencia a partir del nombre, no un dato confirmado en la model card.

## Capacidades

- Generación de texto conversacional multirronda, con etiqueta `conversational` en los metadatos.
- Procesamiento de entradas image-text-to-text: acepta imágenes junto con texto y genera respuestas textuales (pipeline declarado).
- Compatibilidad declarada con text-generation-inference y `endpoints_compatible`, lo que facilita el despliegue en infraestructuras de inferencia estándar.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Modo thinking, visión avanzada o audio: no disponible (no documentado).

## Casos de uso

- **Prototipado de asistentes multimodales**: al ser un modelo image-text-to-text ajustado, puede usarse para experimentar con conversaciones que combinan capturas de pantalla, diagramas o fotos con preguntas en inglés, aprovechando el pipeline multimodal del base.
- **Reproducción de pipelines de SFT con Unsloth**: el repo sirve como referencia práctica para quien quiera replicar un ajuste fino sobre Gemma 4 con Unsloth y TRL, comparando el resultado con el base `unsloth/gemma-4-26b-a4b-it`.
- **Evaluación interna de modelos ajustados**: útil como checkpoint intermedio para medir deriva (olvido catastrófico, degradación de instrucciones) frente al modelo base antes de decidir si escalar el entrenamiento.
- **Servicio de inferencia con vLLM**: dado que los pesos están en 16 bits y el nombre indica compatibilidad con vLLM, puede desplegarse en un servidor vLLM para pruebas de throughput y latencia con entradas multimodales.
- **Generación de descripciones de imágenes en inglés**: para tareas de image captioning o VQA en inglés, el modelo puede producir texto a partir de imágenes, aunque sin benchmarks publicados conviene validar la calidad en el dominio concreto.
- **Base para ajustes posteriores (continued fine-tuning)**: al estar en Apache 2.0 y en safetensors, puede servir como punto de partida para SFT adicional o DPO en dominios específicos, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en 16 bits**: los pesos ocupan aproximadamente 51,6 GB (25,8B parámetros × 2 bytes), por lo que se necesita al menos ~52 GB solo para pesos; con KV cache y overhead de activaciones conviene reservar 60-70 GB para contextos moderados.
- **GPU recomendadas**: A100 80 GB, H100 80 GB, H200, o configuraciones multi-GPU (2× A100 40 GB con tensor parallelism). Para servir con vLLM en una sola GPU, una A100/H100 de 80 GB es la opción más directa.
- **¿Cabe en GPU de consumo?** No en 16 bits. Sería necesario cuantizar (por ejemplo, a 8 bits o 4 bits) para intentar encajar en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero el repo no publica variantes cuantizadas; habría que generarlas a partir de los safetensors.
- **Opciones de despliegue**: vLLM (sugerido por el nombre del repo), text-generation-inference (declarado en tags), transformers (librería principal). No se documenta compatibilidad con llama.cpp/Ollama en el repo.
- **Latencia y throughput estimados**: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| didula-wso2/gemma4a4b_1-0-2_sft_16bit_vllm | 25,8B totales (activos no confirmados) | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino de un particular, sin benchmarks |
| unsloth/gemma-4-26b-a4b-it | ~26B totales, ~4B activos (por nomenclatura) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base instruction-tuned del que deriva el ajuste |
| Gemma 3 27B (referencia de familia) | 27B densos | 128k (según documentación pública de Google) | Gemma Terms of Use | Hugging Face, Ollama, etc. | Alternativa densa de tamaño comparable; licencia distinta (no Apache 2.0) |

La comparativa es limitada porque la model card no aporta contexto, benchmarks ni detalles de arquitectura del modelo base. Cualquier decisión entre este ajuste y el base debería basarse en una evaluación empírica propia.

## Limitaciones y advertencias

- **Ausencia total de documentación de entrenamiento**: no se especifican dataset, hiperparámetros, número de epochs ni método (LoRA vs full). Esto impide auditar el ajuste y reproducirlo.
- **Sin benchmarks**: no hay resultados de MMLU, HumanEval, GSM8K ni evaluación multimodal, por lo que no se puede afirmar que el ajuste mejora al base en ninguna tarea.
- **Riesgo de alucinación**: inherente a los modelos generativos; al no haber evaluación, no se puede acotar su magnitud en este checkpoint.
- **Sesgos**: no documentados. Al derivar de Gemma 4 y entrenarse solo en inglés, es previsible que herede sesgos culturales y lingüísticos del base y del dataset de SFT, pero no hay información para cuantificarlos.
- **Idioma**: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- **Contexto**: longitud de contexto no disponible; no se debe asumir la del modelo base sin verificarla.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar que el modelo base (`unsloth/gemma-4-26b-a4b-it`) no imponga términos adicionales (Gemma históricamente usa Gemma Terms of Use, no Apache 2.0); la model card del ajuste declara Apache 2.0, lo que puede entrar en conflicto con las condiciones del base.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado (noviembre de 2026) sin validación comunitaria.
- **Producción**: no recomendado como modelo de producción sin una evaluación propia de calidad, latencia y robustez, y sin resolver la posible incompatibilidad de licencia con el base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/didula-wso2/gemma4a4b_1-0-2_sft_16bit_vllm)
- [Modelo base: unsloth/gemma-4-26b-a4b-it](https://huggingface.co/unsloth/gemma-4-26b-a4b-it)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Documentación de TRL](https://huggingface.co/docs/trl)
- [Documentación de vLLM](https://docs.vllm.ai)
- [Documentación de text-generation-inference](https://huggingface.co/docs/text-generation-inference)
