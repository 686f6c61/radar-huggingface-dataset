# shrugging-shoulders/Amberlight-Lux-12B

## Resumen

Amberlight-Lux-12B es un modelo de lenguaje conversacional desarrollado por el usuario de HuggingFace "shrugging-shoulders" como una versión refinada de su modelo base Amberlight-12B. Se trata de un fine-tuning orientado a conversación y roleplay, entrenado sobre el dataset multilingüe `ifeval_multilang` que cubre nueve idiomas, entre ellos el español. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Arquitectónicamente, el modelo está etiquetado como "mistral", lo que indica que sigue la arquitectura transformer decoder-only de la familia Mistral, con aproximadamente 12.200 millones de parámetros. Según la model card del autor, esta versión "Lux" está ligeramente más entrenada que la base, mostrando mayor estabilidad y menor propensión a errores. Está disponible tanto en formato safetensors (para uso con Transformers y vLLM) como en cuantizaciones GGUF mantenidas por el equipo mradermacher, lo que facilita su despliegue en hardware de consumo.

La relevancia actual de este modelo radica en que ofrece una alternativa de 12B con licencia permisiva, multilingüe y orientada a aplicaciones conversacionales, con un tamaño que permite su ejecución en GPUs de consumo moderado mediante cuantización. Su integración con plataformas de inferencia como FriendliAI y su compatibilidad con text-generation-inference lo hacen atractivo para desarrolladores que buscan un modelo de chat de tamaño medio sin dependencia de APIs propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, etiqueta "mistral") |
| Parametros totales | 12.247.782.400 (~12.2B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (BF16/FP16 probablemente) y GGUF (via mradermacher, tipos no especificados) |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Amberlight-Lux-12B se basa en una arquitectura transformer decoder-only de estilo Mistral, con aproximadamente 12.200 millones de parámetros. No se dispone de información pública sobre el preentrenamiento del modelo base (Amberlight-12B), como el número de tokens o la composición del dataset original. Lo que sí se conoce es que el fine-tuning de esta versión "Lux" se realizó sobre el dataset `ifeval_multilang`, un conjunto de instrucciones multilingües que cubre nueve idiomas. El autor indica que es una versión "ligeramente más entrenada" que la base, con mejoras en estabilidad y menor tasa de errores, aunque no se detallan técnicas específicas como RLHF o DPO en la información disponible.

El modelo utiliza la plantilla de formato ChatML para las conversaciones. Los parámetros de muestreo recomendados por el autor son: temperatura 0.8, penalización de repetición 1.05, TOP_P 0.90, TOP_K desactivado (0) y MIN_P 0.025, aunque se ha probado que temperaturas entre 0.6 y 1.0 funcionan razonablemente bien.

## Capacidades

- Generación de texto conversacional de alta calidad, orientada a roleplay y diálogos multi-turno.
- Soporte multilingüe en nueve idiomas: inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés.
- Fine-tuning específico para seguir instrucciones (instruction following) en múltiples idiomas, gracias al dataset `ifeval_multilang`.
- Compatible con el formato ChatML, lo que facilita la integración con sistemas de chat y asistentes.
- No se ha documentado soporte explícito para tool calling, function calling ni agentes. Tampoco se menciona capacidades de vision, audio o modo "thinking".
- Al ser un modelo de texto puro, no procesa entradas multimodales.

## Casos de uso

- Asistentes conversacionales multilingües: el modelo puede alimentar chatbots de atención al cliente o asistentes personales que deban atender en varios idiomas (español, inglés, francés, etc.) gracias a su entrenamiento en nueve idiomas y su formato ChatML.
- Roleplay y juegos de texto: su fine-tuning específico para conversación y roleplay lo hace adecuado para aplicaciones de narrativa interactiva, juegos de rol por texto o simulación de personajes en plataformas como SillyTavern o KoboldAI.
- Generación de contenido creativo: puede utilizarse para redactar diálogos, guiones o historias breves en varios idiomas, con un estilo natural y fluido.
- Chatbots para comunidades específicas: al ser Apache 2.0, se puede integrar en proyectos comerciales sin coste de licencia, como bots de Discord o Telegram con personalidad configurable.
- Fine-tuning adicional: al ser un modelo de 12B con licencia abierta, sirve como base para adaptaciones a dominios concretos (legal, médico, técnico) mediante fine-tuning con datasets propios.
- Despliegue en entornos de baja VRAM: gracias a las cuantizaciones GGUF disponibles, puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, habilitando un asistente local privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han encontrado comparaciones con modelos similares en la búsqueda web. Por tanto, no es posible cuantificar su rendimiento relativo con datos objetivos.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en safetensors (tamaño del repo 24.5 GB, probablemente BF16), se requieren aproximadamente 25 GB de VRAM para inferencia sin cuantizar. Con cuantizaciones GGUF Q4_K_M, el tamaño se reduce a unos 7-8 GB, permitiendo ejecución en GPUs con 8 GB de VRAM.
- GPU recomendadas: para una ejecución sin cuantizar, se recomienda una NVIDIA A100 (40/80 GB) o RTX 4090 (24 GB). Con cuantización Q4, puede ejecutarse en una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- Compatibilidad con consumer GPU: sí, es compatible con GPUs de consumo de gama alta (RTX 3080/3090/4090) si se usa cuantización GGUF. Para safetensors completos se necesita al menos 24 GB de VRAM.
- Opciones de despliegue: soporta vLLM, llama.cpp (mediante GGUF), Ollama (con los quants de mradermacher), text-generation-inference (TGI) y FriendliAI para API gestionada.
- Latencia y throughput: no se han publicado datos concretos. En general, un modelo de 12B en una RTX 4090 con cuantización Q4 puede generar entre 20-40 tokens/s, pero esta cifra es estimada y no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multilingüe | Disponibilidad |
|---|---|---|---|---|---|
| Amberlight-Lux-12B | 12.2B | no disponible | Apache 2.0 | 9 idiomas | HF, GGUF |
| Amberlight-12B (base) | 12.2B | no disponible | Apache 2.0 | 9 idiomas | HF |
| Mistral 7B | 7B | 32K (según versión) | Apache 2.0 | Multilingüe (limitado) | HF, GGUF |

Nota: no se dispone de información pública sobre otros modelos de 12B comparables con licencia Apache 2.0 y soporte multilingüe similar. La comparativa se limita al modelo base y a Mistral 7B como referencia de arquitectura, pero no se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un fine-tuning sobre un dataset de instrucciones, es probable que herede sesgos del modelo base y del dataset de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o cuando se le pide datos factuales.
- Longitud de contexto no especificada: no se conoce la ventana máxima de contexto, lo que dificulta planificar aplicaciones que requieran memoria larga.
- Limitaciones de idioma: aunque soporta nueve idiomas, el rendimiento puede variar entre ellos; el español está incluido pero no se ha evaluado su calidad comparativa.
- Restricciones de licencia: aunque Apache 2.0 permite uso comercial, es necesario revisar las condiciones del modelo base (Amberlight-12B) para asegurar que no existan restricciones adicionales.
- Sin soporte de tool calling o agentes: no se ha documentado esta capacidad, por lo que para aplicaciones que requieran llamadas a APIs externas o razonamiento multi-paso, sería necesario implementar una capa adicional.
- Riesgo de overfitting en roleplay: al ser un fine-tuning específico para conversación, puede tener un estilo de generación más informal, lo que podría no ser adecuado para textos formales o técnicos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/shrugging-shoulders/Amberlight-Lux-12B
- Modelo base: https://huggingface.co/shrugging-shoulders/Amberlight-12B
- Cuantizaciones GGUF de mradermacher: https://huggingface.co/mradermacher/Amberlight-Lux-12B-GGUF
- Despliegue en FriendliAI: https://friendli.ai/models/shrugging-shoulders/Amberlight-Lux-12B
- Dataset de entrenamiento: https://huggingface.co/datasets/shrugging-shoulders/ifeval_multilang
