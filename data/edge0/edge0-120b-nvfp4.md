# Edge0/Edge0-120B-NVFP4

## Resumen

Edge0-120B-NVFP4 es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por Edge0, un proyecto centrado en inferencia en el borde (edge inference). El modelo se presenta como una variante cuantizada a 4 bits (NVFP4) del modelo base Qwen/Qwen3.8-Flash-Next, y está empaquetado en formato GGUF con la librería propia `edge0`. Su orientación principal son tareas de agente y generación de código, con soporte declarado para CUDA y despliegue en entornos de inferencia locales.

A pesar de la denominación "120B" en el identificador, los pesos en safetensors del repositorio suman 4.947.698.560 parámetros (aproximadamente 4,95 mil millones), lo que sugiere que la cifra de 120B hace referencia a los parámetros totales del modelo base antes de la cuantización o a una convención de nombrado del autor, no al número de parámetros almacenados. El repositorio ocupa 102,6 GB, un tamaño coherente con pesos de 4 bits para un modelo de mayor escala.

El modelo resulta relevante por su enfoque en inferencia eficiente en hardware de borde mediante cuantización NVFP4 y arquitectura MoE latente, así como por su licencia comunitaria propia (`edge0-community-model-1.0`) que conviene revisar antes de cualquier uso comercial. La información pública disponible es limitada: no se detallan idiomas soportados, longitud de contexto ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) latente, transformer; cuantización NVFP4 |
| Parámetros totales | 4.947.698.560 (según safetensors); el identificador indica "120B" |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (NVFP4); pesos en GGUF |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia "other") |
| Formato de pesos | GGUF (repo de 102,6 GB); safetensors para el recuento de parámetros |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Librería | edge0 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.8-Flash-Next y emplea una arquitectura MoE (Mixture of Experts) que el autor describe como "latent-moe". Los pesos están cuantizados a 4 bits en formato NVFP4, una representación de coma flotante de 4 bits orientada a aceleración en GPU, y se distribuyen en formato GGUF para facilitar la inferencia en el borde. La librería `edge0` es específica del proyecto y no corresponde a frameworks estándar como transformers o llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detallan innovaciones técnicas más allá de la propia cuantización NVFP4 y la naturaleza MoE del modelo base. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Orientación declarada a tareas de agente (`agent`) y razonamiento multi-paso.
- Generación y asistencia en código (`coding`).
- Inferencia en el borde (`edge-inference`) con soporte CUDA.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en entornos de desarrollo con GPU consumer para autocompletado y generación de fragmentos, gracias a su cuantización 4-bit y formato GGUF que reducen los requisitos de memoria.
- Agentes autónomos en el borde: su etiqueta `agent` y `edge-inference` lo hacen adecuado para orquestar tareas multi-paso en dispositivos con recursos limitados, como estaciones de trabajo o servidores de borde.
- Automatización de pipelines CI/CD: puede emplearse para revisar diffs, sugerir parches o generar pruebas dentro de flujos de integración continua, siempre que se valide su calidad en el dominio concreto.
- Chat de soporte técnico: con la etiqueta `conversational`, puede gestionar diálogos multi-turno en herramientas internas, aunque la longitud de contexto no está documentada y debe verificarse empíricamente.
- Prototipado rápido con endpoints compatibles: al declarar `endpoints_compatible`, puede desplegarse detrás de APIs compatibles con OpenAI para pruebas de concepto.
- Inferencia en hardware CUDA de gama media: la cuantización NVFP4 y el soporte CUDA permiten ejecutarlo en GPUs con menos VRAM que las necesarias para el modelo base sin cuantizar.
- Evaluación de modelos MoE cuantizados: útil para investigadores que comparan el impacto de la cuantización 4-bit en modelos MoE sobre tareas de código y agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 102,6 GB en formato GGUF de 4 bits; se requiere al menos esa cantidad de memoria (o memoria unificada) para cargar los pesos completos, más overhead de contexto y activaciones.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, se orienta a GPUs profesionales (A100 80 GB, H100 80 GB) o configuraciones multi-GPU. No cabe en una RTX 4090 (24 GB) con los pesos completos.
- GPU consumer: no cabe en GPUs consumer de 24 GB o menos con la totalidad de los pesos; requeriría particionado u offloading.
- Opciones de despliegue: librería `edge0` (propia del autor); compatibilidad con endpoints declarada. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-120B-NVFP4 | 4,95 B (safetensors); "120B" en el nombre | no disponible | edge0-community-model-1.0 | GGUF 4-bit | MoE latente, orientado a edge y agentes |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Edge0 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- La discrepancia entre el nombre "120B" y los 4,95 mil millones de parámetros en safetensors debe aclararse antes de asumir capacidades de escala; podría tratarse de parámetros del modelo base o de una convención del autor.
- No se documentan idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- No se especifica la longitud de contexto, un dato crítico para aplicaciones de agentes y conversaciones largas.
- La cuantización 4-bit puede degradar la calidad respecto al modelo base; no hay benchmarks que cuantifiquen esa pérdida.
- La licencia `edge0-community-model-1.0` es una licencia "other" propia; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- No se confirma soporte en frameworks estándar (vLLM, llama.cpp, TGI), lo que puede limitar la portabilidad y el soporte de la comunidad.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas de mitigación.
- Sesgos conocidos: no disponibles.
- El tamaño del repositorio (102,6 GB) y la dependencia de la librería `edge0` complican el despliegue en entornos convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-120B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face (no se proporciona URL directa)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
