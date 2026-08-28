# orbit-z/orbit-z-gguf

## Resumen

Orbit-Z GGUF es un modelo conversacional derivado de Llama 3.1 8B, publicado por el equipo Orbit-Z en formato GGUF con cuantización Q4_K_M. El modelo se distribuye como una base cuantizada más varios adaptadores LoRA en formato GGUF, cada uno especializado en un segmento de negocio: identidad, soporte técnico, atención al cliente, salud y jurídico. Esta arquitectura modular permite cargar solo el adaptador necesario para cada tarea, reduciendo el uso de memoria y facilitando el despliegue en entornos de producción.

El modelo está pensado para uso interno de Orbit-Z, según indica la model card, y se distribuye bajo la licencia Llama 3.1 de Meta. Con 8.030 millones de parámetros y un tamaño de repositorio de 5,8 GB, es adecuado para ejecutarse en hardware de consumo, aunque la información pública es escasa: no se han publicado detalles sobre el entrenamiento, benchmarks ni capacidades específicas más allá de los segmentos LoRA mencionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 3.1 8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura Llama 3.1 soporta hasta 128k, pero no se confirma para este modelo) |
| Tipos de cuantizacion | Q4_K_M (según model card; pueden existir otras, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (base + adaptadores LoRA en GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en Llama 3.1 8B, un transformer decoder-only con atención multi-cabeza estándar. La versión GGUF se obtiene mediante cuantización Q4_K_M de los pesos originales, lo que reduce el tamaño y acelera la inferencia en CPU y GPU. Sobre esta base, Orbit-Z ha aplicado fine-tuning QLoRA (Low-Rank Adaptation con cuantización) para crear varios adaptadores LoRA en formato GGUF, cada uno especializado en un dominio concreto: identidad, soporte técnico, atención al cliente, salud y jurídico. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo está destinado a uso interno de Orbit-Z, lo que sugiere que el fine-tuning se realizó con datos propios de la organización.

## Capacidades

- Generación de texto conversacional: el modelo base Llama 3.1 8B es capaz de mantener diálogos multi-turno, responder preguntas y generar texto coherente en múltiples idiomas, aunque el alcance exacto no se especifica.
- Especialización por dominio mediante LoRA: los adaptadores permiten ajustar el comportamiento del modelo para tareas concretas:
  - `Orbit-Z-identidade-LoRA`: gestión de identidad y autenticación de usuarios.
  - `Orbit-Z-ti_suporte-LoRA`: soporte técnico de TI, resolución de incidencias y asistencia a usuarios.
  - `Orbit-Z-atendimento-LoRA`: atención al cliente, gestión de consultas y reclamaciones.
  - `Orbit-Z-saude-LoRA`: información y soporte en el ámbito sanitario (sin garantía de precisión médica).
  - `Orbit-Z-juridico-LoRA`: orientación y documentación jurídica básica.
- Carga dinámica de adaptadores: gracias al formato GGUF y la compatibilidad con `llama-server --lora` o `llama-cpp-python`, es posible cambiar de especialización sin recargar el modelo base completo.
- Sin capacidades multimodales: no se menciona soporte de visión, audio ni otras modalidades.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Atención al cliente automatizada: el adaptador `atendimento` permite desplegar un chatbot que gestiona consultas frecuentes, reclamaciones y solicitudes de información, manteniendo conversaciones contextuales gracias a la capacidad del modelo base Llama 3.1.
- Soporte técnico de TI: el adaptador `ti_suporte` puede utilizarse en mesas de ayuda internas para diagnosticar problemas de software, guiar a los usuarios en pasos de resolución y escalar incidencias complejas.
- Asistencia en el ámbito sanitario: el adaptador `saude` puede proporcionar información general sobre síntomas, medicación y recomendaciones de salud, siempre con un aviso de que no sustituye el criterio médico profesional.
- Asesoramiento jurídico básico: el adaptador `juridico` puede ayudar a redactar documentos legales simples, explicar términos legales o responder preguntas sobre procedimientos, bajo supervisión de un profesional.
- Gestión de identidad y accesos: el adaptador `identidade` puede integrarse en flujos de verificación de usuarios, respondiendo preguntas sobre políticas de autenticación o ayudando en procesos de onboarding.
- Despliegue en entornos con recursos limitados: al estar cuantizado en Q4_K_M y usar LoRA, el modelo puede ejecutarse en servidores con CPU o GPUs modestas, siendo viable para pruebas internas o prototipos sin grandes inversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Al ser un fine-tuning de Llama 3.1 8B, el rendimiento base será similar al del modelo original, pero las especializaciones LoRA pueden alterar el comportamiento en los dominios objetivo.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M y 8B parámetros, el modelo base ocupa aproximadamente 4,5-5 GB en memoria. Cada LoRA adicional añade un pequeño overhead (típicamente <1 GB). Total estimado: 5-6 GB para el conjunto completo.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o GPUs de datacenter como A10G o A100. También puede ejecutarse en CPU con suficiente RAM (16 GB o más).
- Compatibilidad con hardware de consumo: sí, cabe en GPUs con 8 GB o más de VRAM si se carga solo el modelo base y un LoRA a la vez.
- Opciones de despliegue: `llama.cpp` / `llama-server` (soporta `--lora`), `llama-cpp-python`, `Ollama` (si se convierte el formato), `vLLM` (requiere conversión a safetensors, no nativo GGUF). No se menciona compatibilidad con TGI.
- Latencia y throughput: no se han publicado datos. Para un modelo 8B Q4_K_M en GPU, se espera una generación de 20-40 tokens/s en RTX 4090, y 5-15 tokens/s en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Orbit-Z GGUF (este) | 8B | no disponible | llama3.1 | GGUF + LoRA | Dominios internos (TI, salud, legal) |
| Llama 3.1 8B (original) | 8B | 128k | llama3.1 | safetensors, GGUF | Generalista |
| Mistral 7B | 7B | 32k | Apache 2.0 | safetensors, GGUF | Generalista |
| Qwen 2.5 7B | 7B | 128k | Apache 2.0 | safetensors, GGUF | Generalista, multilingüe |

La principal diferencia de Orbit-Z es su enfoque modular con LoRA segmentados, que permite adaptaciones específicas sin reentrenar el modelo completo. Sin embargo, carece de la documentación y benchmarks públicos que tienen las alternativas.

## Limitaciones y advertencias

- Información pública muy limitada: no hay datos sobre el entrenamiento, el dataset, ni evaluación de sesgos o alucinaciones.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en dominios especializados como salud o jurídico, donde las consecuencias pueden ser graves.
- Sesgos potenciales: al ser un fine-tuning con datos propios de Orbit-Z, el modelo puede reflejar sesgos de esos datos o del dominio interno.
- Licencia llama3.1: permite uso comercial, pero impone condiciones (por ejemplo, no usar para mejorar otros modelos grandes). Es necesario revisar los términos completos de Meta.
- Uso interno declarado: la model card indica "Uso interno Orbit-Z", lo que sugiere que no está pensado para distribución pública ni para aplicaciones de terceros.
- Dependencia de la arquitectura GGUF: el formato GGUF y los LoRA en GGUF requieren herramientas específicas (llama.cpp, llama-cpp-python) y no son directamente compatibles con frameworks como Transformers o vLLM sin conversión.
- Sin garantía de precisión en dominios críticos: los adaptadores de salud y jurídico no sustituyen el asesoramiento profesional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orbit-z/orbit-z-gguf
- Documentación de GGUF (IBM): https://github.com/IBM/gguf
- Comunidad GGUF en Hugging Face: https://huggingface.co/GGUF-Models
- Herramienta de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
- Modelos GGUF en Hugging Face: https://huggingface.co/models?library=gguf
- Entrada en free2aitools (sin datos adicionales): https://free2aitools.com/model/mradermacher/orbit-gguf
