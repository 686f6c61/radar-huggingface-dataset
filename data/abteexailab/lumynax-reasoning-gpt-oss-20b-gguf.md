# AbteeXAILab/lumynax-reasoning-gpt-oss-20b-gguf

## Resumen

LumynaX Reasoning GPT-OSS 20B GGUF es un paquete de inferencia publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), que envuelve el modelo open-weight `openai/gpt-oss-20b` de OpenAI dentro de su sistema propietario LumynaX. El paquete se distribuye en formato GGUF para su ejecución con llama.cpp y está pensado para despliegues locales o soberanos, alineados con la filosofía "local-first" y "sovereign AI" del laboratorio.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con aproximadamente 20.900 millones de parámetros totales y unos 3.600 millones de parámetros activos por token, liberado por OpenAI bajo licencia Apache 2.0. Este pack concreto, sin embargo, está marcado explícitamente como "legacy" y "outdated" por su propio autor: se trata de un artefacto de investigación temprana, no mantenido y no recomendado para uso en producción. La integración con LumynaX Core se describe como "infusión enrutada" (routed infusion), que no modifica los pesos del modelo original, sino que añade una capa de orquestación alrededor de la inferencia.

La relevancia actual del modelo es principalmente histórica y de reproducibilidad: documenta un enfoque temprano de composición de modelos open-source con un sistema de control de soberanía, pero no representa las capacidades actuales de AbteeX AI Labs ni de LumynaX. Para desarrolladores, puede servir como referencia de cómo se empaquetan y distribuyen modelos GGUF con capas de identidad y orquestación, aunque su uso práctico queda limitado a entornos de investigación o evaluación retrospectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | 3.600.000.000 (3,6 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (archivo `lumynax-reasoning-gpt-oss-20b-mxfp4.gguf`) |
| Idiomas soportados | en (ingles), mi (maori) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-20b` de OpenAI emplea una arquitectura de mezcla de expertos (MoE) con 20,9 B de parámetros totales y 3,6 B activos por token. Esta configuración permite mantener una capacidad de razonamiento elevada con un coste computacional por paso relativamente bajo, similar a otros MoE como Mixtral. El entrenamiento original fue realizado por OpenAI, aunque los detalles específicos del dataset y el proceso de alineación (RLHF, DPO, etc.) no se detallan en la información disponible.

El paquete LumynaX añade una capa de "infusión" que, según la model card, puede operar de dos formas: infusión enrutada (routed infusion), donde LumynaX Core dirige la inferencia a través del modelo sin tocar sus pesos, o infusión MoE, donde los pesos se componen como expertos especializados dentro de un diseño MoE. En esta release concreta, el método declarado es "routed runtime and identity integration", sin composición de pesos. El runtime es llama.cpp, y el paquete incluye manifiestos de exportación y checksums para reproducibilidad. No se especifican innovaciones técnicas adicionales en el modelo base, más allá de las propias de gpt-oss-20b (razonamiento, tool calling, etc.).

## Capacidades

- Generación de texto y razonamiento multi-step, heredadas del modelo base gpt-oss-20b.
- Soporte de tool calling / function calling, según la descripción del modelo en la búsqueda web.
- Capacidades de agente (agentic automation) en entornos de operaciones, mencionadas en la búsqueda web.
- Multilingüismo limitado a inglés y maorí (idioma oficial de Nueva Zelanda), según los metadatos de HuggingFace.
- Integración con el sistema LumynaX Core para orquestación, control de soberanía y planificación agéntica, aunque esta capa es un wrapper histórico y no representa la implementación actual.
- Compatibilidad declarada con vLLM, NVIDIA NIM y NVIDIA NeMo (aunque la model card advierte que es un artefacto legacy y que se requiere conversión para NeMo).

## Casos de uso

- Reproducción de investigación: el paquete permite reproducir los experimentos tempranos de AbteeX AI Labs con infusión de modelos, gracias a los checksums y manifiestos incluidos. Un investigador puede descargar el GGUF, verificar su integridad y estudiar cómo se implementó la capa de orquestación.
- Evaluación retrospectiva de arquitecturas MoE: al ser un MoE de 20,9 B con 3,6 B activos, puede usarse para comparar el rendimiento de esta configuración con otros MoE de tamaño similar en tareas de razonamiento o generación, siempre que se asuma que los pesos son los originales de gpt-oss-20b.
- Estudio de empaquetado GGUF con capas de identidad: desarrolladores interesados en distribuir modelos con wrappers de marca o control de acceso pueden analizar la estructura de este repo como ejemplo de un release con manifiesto, licencia y checksums.
- Pruebas de inferencia local con llama.cpp: el formato GGUF permite ejecutar el modelo en CPU o GPU con llama.cpp, útil para verificar el comportamiento del modelo base en entornos sin conexión.
- Análisis de soberanía digital: el caso de uso declarado por el autor es la IA soberana de Nueva Zelanda; puede servir como caso de estudio de cómo se empaquetan modelos open-source con capas de gobernanza local.
- No se recomienda su uso en producción, ni como sustituto de gpt-oss-20b oficial, ni como base para aplicaciones comerciales, dado su estado legacy y la falta de mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras pruebas estándar, y la búsqueda web no ha revelado datos adicionales. El modelo base gpt-oss-20b de OpenAI sí tiene benchmarks publicados por OpenAI, pero no se proporcionan en este paquete ni en la documentación asociada.

## Requisitos de hardware

- VRAM estimada: según la búsqueda web, el modelo puede ejecutarse en ≤16 GB de VRAM con cuantización MXFP4 nativa. Esto lo hace apto para GPUs de consumo como RTX 4080, RTX 4090 o equivalentes con 16 GB o más.
- GPUs recomendadas: RTX 4090 (24 GB) para mayor margen, o GPUs de datacenter como A100 (40/80 GB) si se requiere mayor throughput. Con 3,6 B de parámetros activos, la inferencia es relativamente ligera en cómputo por token.
- Opciones de despliegue: llama.cpp (runtime principal del paquete), vLLM (compatible según tags), Ollama (si se convierte a formato compatible), y TGI (a través de conversión). También se menciona compatibilidad con NVIDIA NIM y NeMo, aunque la model card advierte que se requiere conversión y que el paquete es legacy.
- Latencia y throughput: no se proporcionan datos concretos. En una RTX 4090 con cuantización MXFP4, se puede esperar una velocidad de generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LumynaX GPT-OSS 20B (este) | 20,9 B | 3,6 B | no disponible | Apache 2.0 | GGUF |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32k | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-14B | 14,8 B | 14,8 B (denso) | 128k | Apache 2.0 | GGUF, safetensors |
| DeepSeek-MoE-16B | 16,4 B | 2,8 B | 16k | MIT | safetensors |

La comparativa se basa en parámetros y disponibilidad, ya que no hay benchmarks para este paquete. Mixtral 8x7B es un MoE más grande con más parámetros activos, mientras que Qwen2.5-14B es denso y ofrece mayor contexto. DeepSeek-MoE-16B es similar en filosofía MoE con menos parámetros activos. Este paquete LumynaX se distingue por su capa de orquestación propietaria, pero al ser legacy, su valor comparativo es limitado.

## Limitaciones y advertencias

- Estado legacy y desactualizado: la model card lo declara explícitamente como "outdated research artifact", no mantenido y no recomendado para producción.
- La capa LumynaX Core incluida en este paquete es histórica y no representa la implementación actual del sistema; su uso puede dar lugar a comportamientos inesperados.
- No se proporcionan datos de sesgos, alucinación ni seguridad. Al ser un modelo de razonamiento, existe riesgo de alucinación en tareas factuales, como en cualquier LLM.
- El soporte de idiomas se limita a inglés y maorí; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el estado legacy y la falta de mantenimiento hacen desaconsejable su uso en entornos productivos.
- La cuantización MXFP4 puede implicar una pérdida de precisión frente a formatos de mayor bitness; no se han publicado evaluaciones de calidad tras la cuantización.
- Los tags de compatibilidad con vLLM, NIM y NeMo no están verificados en la práctica; la model card advierte que se requiere conversión y que el paquete es antiguo.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-reasoning-gpt-oss-20b-gguf](https://huggingface.co/AbteeXAILab/lumynax-reasoning-gpt-oss-20b-gguf)
- [Repositorio GitHub - Aimaghsoodi/lumynax-reasoning-gpt-oss-20b-gguf](https://github.com/Aimaghsoodi/lumynax-reasoning-gpt-oss-20b-gguf)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Modelo base en HuggingFace - openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
