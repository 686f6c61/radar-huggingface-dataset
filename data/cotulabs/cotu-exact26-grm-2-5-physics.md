# cotulabs/CoTu-EXACT26-GRM-2.5-Physics

## Resumen

CoTu-EXACT26-GRM-2.5-Physics es un ajuste fino (fine-tune) supervisado del modelo base OrionLLM/GRM-2.5, desarrollado por cotulabs. El modelo está especializado en razonamiento físico y utiliza una técnica de "program-of-thought" (generación de programas intermedios como paso de razonamiento) combinada con SFT (supervised fine-tuning) mediante la librería TRL. Se distribuye con la arquitectura declarada `qwen3_5` en transformers, lo que sugiere que el modelo base hereda la familia Qwen 3.5, aunque la información disponible no detalla la arquitectura interna más allá de esa etiqueta.

El modelo cuenta con aproximadamente 4.539 millones de parámetros (4,5 B) según los pesos en safetensors, y está orientado a tareas de image-text-to-text y text-generation con capacidades de razonamiento multi-paso. Su relevancia radica en la especialización en dominios científicos (física) mediante razonamiento programático, un enfoque que busca mejorar la trazabilidad y verificabilidad de las respuestas frente a la generación directa de texto.

El acceso es restringido (gated): requiere aceptar las condiciones en Hugging Face. La licencia es GPL-3.0, lo que impone obligaciones de copyleft para usos derivados. El modelo está etiquetado únicamente para inglés (`en`), y no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag de transformers); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (~4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |
| Modelo base | OrionLLM/GRM-2.5 |
| Metodo de ajuste | SFT (TRL), program-of-thought |
| Acceso | Restringido (gated) |
| Tamano del repo | 9,1 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se construye sobre OrionLLM/GRM-2.5 y se ajusta mediante SFT con la librería TRL. La etiqueta de arquitectura es `qwen3_5`, lo que apunta a una familia transformer tipo Qwen 3.5, aunque no se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento se orienta a razonamiento físico mediante "program-of-thought": el modelo genera programas o pasos intermedios ejecutables/verificables como parte del razonamiento antes de emitir la respuesta final. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. El tag `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, pero no se confirma en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso.
- Razonamiento especializado en física mediante program-of-thought.
- Posible soporte multimodal image-text-to-text (según tag del pipeline), sin confirmación detallada.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes: no disponible en la información.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma.
- Modo "thinking" explícito: no disponible en la información.

## Casos de uso

- Resolución de problemas de física a nivel universitario: el modelo puede descomponer un enunciado en pasos programáticos, formular ecuaciones y verificar resultados intermedios, aprovechando el enfoque program-of-thought para reducir errores de cálculo.
- Tutoría automatizada de física: conversaciones multi-turno donde el modelo explica conceptos y guía al estudiante paso a paso, adecuado por su ajuste específico en dominio científico.
- Generación de material docente: creación de ejercicios resueltos y explicaciones estructuradas con trazabilidad de los pasos de razonamiento.
- Asistencia en laboratorio y análisis de datos experimentales: interpretación de resultados y formulación de hipótesis con razonamiento explícito verificable.
- Evaluación automática de respuestas de estudiantes: el modelo puede comparar la lógica del razonamiento del alumno con una solución programática de referencia.
- Prototipado de asistentes científicos en investigación: integración en pipelines de análisis donde se requiere razonamiento estructurado y auditable en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB solo para pesos (4,5 B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits: en torno a 3-4 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16; en GPUs de 8-12 GB requeriría cuantización, no confirmada oficialmente.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no confirmados por falta de formatos GGUF/AWQ publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación rigurosa. Como referencia estructural, se indica la relación con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| CoTu-EXACT26-GRM-2.5-Physics | ~4,5 B | no disponible | GPL-3.0 | Gated |
| OrionLLM/GRM-2.5 (base) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de razonamiento científico de ~4-5 B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo en inglés, el comportamiento en otros idiomas es incierto.
- Riesgo de alucinación: presente como en cualquier LLM; el enfoque program-of-thought mitiga pero no elimina errores de razonamiento.
- Limitaciones de idioma: solo inglés según la etiqueta; no apto para producción en castellano sin evaluación adicional.
- Licencia GPL-3.0: impone copyleft; el uso comercial es posible pero obliga a liberar el código derivado bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- Sin benchmarks publicados ni documentación de contexto: difícil justificar su elección frente a alternativas sin evaluación empírica.
- Fecha de creación futura (2026-11-26) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cotulabs/CoTu-EXACT26-GRM-2.5-Physics
- Modelo base: https://huggingface.co/OrionLLM/GRM-2.5
- Paper referenciado (arXiv:2607.14735): https://arxiv.org/abs/2607.14735
- Librería TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
