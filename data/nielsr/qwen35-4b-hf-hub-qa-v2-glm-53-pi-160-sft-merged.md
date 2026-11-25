# nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-sft-merged

## Resumen

El modelo `nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-sft-merged` es un ajuste fino (fine-tuning) por instrucciones del modelo base Qwen/Qwen3.5-4B, publicado por el desarrollador nielsr en Hugging Face. Se trata de la fusión (merge) de un adaptador LoRA denominado `qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-lora` sobre los pesos del modelo base, dando como resultado un checkpoint completo de aproximadamente 4.540 millones de parámetros (4,54 B) en formato safetensors.

El propósito declarado del ajuste es una tarea de "hf-hub-qa" (preguntas y respuestas sobre el Hugging Face Hub), generada mediante un proceso de destilación de agentes ("agent-distill") con la versión pi@1.6.0. El modelo hereda la arquitectura del Qwen3.5-4B y está etiquetado como `image-text-to-text`, lo que sugiere capacidades multimodales de entrada (imagen y texto), aunque la información disponible no detalla la configuración exacta de la torre visual.

Su relevancia es limitada y experimental: se trata de un artefacto de investigación con cero descargas y cero "likes" en el momento de la consulta, sin model card detallada más allá de la referencia al proceso de fusión. Resulta útil como ejemplo de pipeline de destilación de agentes aplicado a un modelo de 4 B, pero no como un modelo listo para producción sin una evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); multimodal image-text-to-text según tags |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con aproximadamente 4,54 B de parámetros. Sobre este base se aplicó un ajuste mediante LoRA (tag `peft`) y posteriormente se fusionaron los pesos del adaptador en el modelo base (tags `merged` y `peft`), produciendo un checkpoint denso completo. La etiqueta `image-text-to-text` indica que el modelo base admite entradas multimodales de imagen y texto, aunque no se detalla en la información disponible la arquitectura de la torre visual ni su resolución de entrada.

El entrenamiento se describe como una ejecución de destilación de agentes ("agent-distill run qwen35-4b-hf-hub-qa-v2-glm-53-pi-160") sobre la tarea `hf-hub-qa`, usando la versión pi@1.6.0. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación posteriores. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base Qwen3.5-4B.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas, según el pipeline `text-generation` y la etiqueta `conversational`.
- Entrada multimodal imagen-texto (tag `image-text-to-text`), presumiblemente heredada del modelo base Qwen3.5-4B.
- Ajuste específico para preguntas y respuestas sobre el Hugging Face Hub (tarea `hf-hub-qa`).
- Capacidad de destilación de agentes: el proceso de entrenamiento se basa en trayectorias de agente, lo que puede favorecer el razonamiento multi-paso en dominios acotados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia en la exploración del Hugging Face Hub: el modelo puede responder preguntas sobre modelos, datasets y espacios alojados en el Hub, aprovechando su ajuste específico en la tarea `hf-hub-qa`.
- Prototipado de agentes de documentación técnica: al haberse entrenado con trayectorias de agente, puede emplearse como componente de un pipeline que consulte metadatos del Hub y devuelva respuestas en lenguaje natural.
- Evaluación de pipelines de destilación de agentes: sirve como referencia para comparar el efecto de un LoRA fusionado frente al modelo base en tareas de QA acotadas.
- Generación de respuestas conversacionales en dominios técnicos: con 4,54 B de parámetros, es desplegable en hardware modesto para chatbots internos de documentación.
- Investigación sobre fusión de adaptadores: útil para estudiar cómo afecta el merge de un LoRA a las capacidades del modelo base, incluyendo posibles regresiones.
- Experimentación multimodal ligera: si se confirma la torre visual del base, puede usarse para tareas de descripción o QA sobre capturas de interfaces del Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, unos 3 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) viable en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en cuantización de 8/4 bits; en FP16 se recomienda 16 GB o más.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp/Ollama si se generan pesos GGUF (no disponibles en el repo actual).
- Latencia y throughput: no disponibles; el tamaño del repo (9,1 GB) es coherente con pesos en BF16/FP16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-sft-merged | 4,54 B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible | Hugging Face |
| nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-lora (adaptador) | ~4 B + LoRA | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero "likes": no hay evidencia de validación por la comunidad.
- Licencia no especificada: no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier despliegue.
- Idiomas soportados no documentados: el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones largas sin verificación empírica.
- Riesgo de alucinación inherente a los modelos generativos de 4 B, potencialmente acentuado por un ajuste estrecho en la tarea `hf-hub-qa`.
- El ajuste específico puede degradar capacidades generales del base (olvido catastrófico parcial) fuera del dominio de QA sobre el Hub.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El proceso de merge de LoRA puede introducir diferencias numéricas frente al adaptador original; conviene comparar ambos antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-sft-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-v2-glm-53-pi-160-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
