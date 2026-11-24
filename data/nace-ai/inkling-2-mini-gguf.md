# nace-ai/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje desarrollado por Thinking Machines (organización responsable del checkpoint original `thinkingmachines/Inkling-2-Mini`). Esta ficha concreta corresponde a la versión cuantizada en formato GGUF publicada por Nace.AI, que ofrece pesos optimizados para inferencia local y en GPU de consumo, con tamaños que van desde 15,734 GB (4,83 bits por peso) hasta 19,103 GB para el archivo NVFP4 nativo (5,86 bits por peso). El checkpoint base cuenta con 26.070.390.272 parámetros (aproximadamente 26.000 millones), lo que lo sitúa en la franja de modelos medianos-grandes con capacidad para razonamiento, generación de código y conversación multi-turno.

La relevancia de esta publicación radica en el trabajo de cuantización de Nace.AI, que combina pesos expertos en NVFP4 nativo con compresión del resto de matrices expertas y retroalimentación de error ajustada por calibración en diez matrices de atención. El resultado es un archivo de 4,8 bits por peso que alcanza un KL held-out de 0,007144 frente al checkpoint original con activaciones BF16, medido sobre 4.088 tokens con vocabulario completo. Esto permite ejecutar un modelo de 26B parámetros en hardware relativamente modesto manteniendo una fidelidad de distribución de tokens muy alta.

La licencia Apache 2.0 facilita el uso comercial y la integración en productos, algo poco habitual en modelos de este tamaño. El modelo base es de tipo Mixture-of-Experts (MoE), aunque los detalles completos de arquitectura, contexto e idiomas no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), según pesos expertos NVFP4; detalles completos no disponibles |
| Parametros totales | 26.070.390.272 (≈26B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF IQ4_XS (4,83 bpw), NVFP4 nativo (5,86 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con arquitectura Mixture-of-Experts, según se deduce de la presencia de "pesos expertos" en NVFP4 y de la mención a "matrices de atención" en el proceso de cuantización. El checkpoint original incluye componentes de visión y MTP (multi-token prediction), aunque los archivos GGUF publicados excluyen explícitamente ambos y contienen solo el backbone de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica principal de esta publicación es el esquema "Nace Weight Space Quantization": el archivo de 4,8 bits por peso conserva los pesos expertos en NVFP4 nativo y comprime el resto de pesos expertos, aplicando retroalimentación de error ajustada por calibración en diez matrices de atención. La evaluación se realizó con activaciones BF16 sobre 4.088 tokens de vocabulario completo, usando conjuntos disjuntos de calibración, desarrollo y evaluación. El resultado de KL held-out de 0,007144 indica que la distribución de tokens del modelo cuantizado es muy próxima a la del original. Para ejecutar el archivo se requiere un parche de runtime (`inkling2-physical-scale.patch`) sobre llama.cpp en un commit específico, compilado con CUDA para arquitectura 100 (NVIDIA B200).

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la inclusión en `endpoints_compatible` indican soporte para diálogo multi-turno.
- Razonamiento y generación de código: el ejemplo de la model card ("Explain merge sort") sugiere uso para explicaciones técnicas y código.
- Capacidad de predicción multi-token (MTP): presente en el checkpoint original, aunque excluida de los archivos GGUF publicados.
- Capacidad de visión: presente en el modelo base, pero no incluida en los GGUF de esta publicación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU única: el archivo IQ4_XS de 15,734 GB cabe en GPUs con 16-24 GB de VRAM, lo que permite ejecutar un modelo de 26B parámetros en hardware de consumo de gama alta (RTX 4090, RTX 5090) o profesionales (A6000, L40S).
- Asistentes de código en IDE: el modelo puede integrarse en herramientas de autocompletado y explicación de código, como sugiere el ejemplo de la model card, con latencia razonable gracias al tamaño compacto del archivo cuantizado.
- Chat conversacional self-hosted: al ser `endpoints_compatible`, puede desplegarse tras una API compatible con OpenAI para aplicaciones de atención al cliente o asistentes internos, manteniendo los datos en infraestructura propia.
- Experimentación e investigación en cuantización: el KL held-out documentado (0,007144) y los scripts de evaluación publicados permiten reproducir y comparar metodologías de cuantización sobre modelos MoE.
- Despliegue en entornos con restricciones de memoria: el archivo NVFP4 de 19,103 GB es adecuado para GPUs Blackwell (B200, RTX 50) que soportan nativamente FP4, reduciendo el ancho de banda de memoria requerido.
- Prototipado rápido con llama.cpp: el parche de runtime y las instrucciones de compilación permiten montar un entorno de pruebas en minutos sobre CUDA, útil para validar prompts y flujos antes de escalar a producción.
- Fine-tuning ligero o destilación sobre el modelo cuantizado: no recomendado directamente sobre GGUF, pero el checkpoint base Apache 2.0 permite entrenar adaptadores y luego cuantizarlos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| KL held-out (IQ4_XS 4,83 bpw, 4.088 tokens, BF16 activations) | 0,007144 |
| Tamano IQ4_XS | 15,734 GB |
| Tamano NVFP4 nativo | 19,103 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~16 GB para el archivo IQ4_XS (15,734 GB de pesos más overhead de contexto y KV cache); ~20 GB para el archivo NVFP4 nativo (19,103 GB más overhead).
- GPU recomendadas: NVIDIA B200 (plataforma usada para la evaluación y compilación de referencia), GPUs Blackwell con soporte FP4 nativo para el archivo NVFP4, y GPUs Ada/Hopper (RTX 4090, L40S, A100, H100) para el archivo IQ4_XS.
- GPU de consumo: sí, el archivo IQ4_XS cabe en RTX 4090 (24 GB) y RTX 5090 (32 GB); en GPUs de 16 GB (RTX 4080, 4070 Ti Super) el margen es ajustado y puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp con CUDA (compilación específica en el commit `2a28df0f9bd55c4975b6bffb35229a6020720f13` más el parche `inkling2-physical-scale.patch`); otros runtimes (vLLM, TGI, Ollama) no están documentados para este formato y requieren verificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta ficha) | 26B | no disponible | GGUF IQ4_XS, NVFP4 | Apache 2.0 | Hugging Face |
| Alternativas de ~26B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Los archivos GGUF excluyen visión y MTP: no es posible usar capacidades multimodales ni predicción multi-token con estos pesos.
- Requiere un parche específico de llama.cpp y un commit concreto; otros forks o versiones estables pueden no cargar el modelo correctamente.
- El KL held-out de 0,007144 es bajo pero no nulo: puede haber degradación en tareas sensibles a la distribución exacta de tokens (generación creativa, código de baja frecuencia, lenguajes raros).
- No hay información sobre sesgos, idiomas soportados ni rendimiento multilingüe; se recomienda evaluación propia antes de producción.
- Riesgo de alucinación inherente a modelos de este tamaño; no se documentan mitigaciones específicas.
- La licencia Apache 2.0 permite uso comercial, pero se debe consultar el `NOTICE`, el archivo `MODIFICATIONS-4.8bpw.md` y la política de uso del modelo base enlazada en su model card.
- El archivo NVFP4 requiere hardware Blackwell para aprovechar FP4 nativo; en GPUs anteriores el rendimiento puede degradarse.
- No se documentan latencias ni throughput; el rendimiento real dependerá de la GPU, del tamaño de contexto y del número de capas offloaded.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sitio de Nace.AI: https://www.nace.ai/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request de runtime: https://github.com/ggml-org/llama.cpp/pull/32704
- Evaluación IQ4_XS: `evaluation/iq4-xs-4.8bpw.json` (en el repositorio)
- Evaluación NVFP4: `evaluation.json` (en el repositorio)
- Parche de runtime: `runtime/inkling2-physical-scale.patch` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
- Aviso legal: `NOTICE` (en el repositorio)
- Modificaciones: `MODIFICATIONS-4.8bpw.md` (en el repositorio)
