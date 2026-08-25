# Muse-research/Muse2-230M-Base

## Resumen

Muse2-230M-Base es un modelo de lenguaje compacto desarrollado por Muse Research, diseñado específicamente para entornos edge y on-device. Se trata de un modelo autorregresivo construido desde cero, con arquitectura híbrida que combina convoluciones causales cortas con atención por grupos (GQA), siguiendo el esquema LFM2. Su objetivo principal es ofrecer una alternativa ligera y eficiente para tareas de generación de texto, extracción estructurada y chat en dispositivos con recursos limitados.

El modelo cuenta con 196,1 millones de parámetros reales (230M nominales), una ventana de contexto de 8.000 tokens (ampliable hasta 128.000) y un vocabulario de 65.536 tokens BPE a nivel de byte entrenado desde cero. Está liberado bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su relevancia actual radica en la creciente demanda de modelos pequeños que puedan ejecutarse en hardware de consumo, manteniendo capacidades razonables de razonamiento y formato estructurado.

La versión base no ha recibido alineamiento de seguridad ni ajuste por RLHF/DPO; solo se aplicó supervisión fina (SFT) con enmascaramiento de pérdida en la versión instruct. Esto implica que el modelo puede alucinar con facilidad y no es adecuado para aplicaciones críticas sin guardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolución/atención (LFM2-style): 8 bloques de convolución causal depthwise (kernel 3) + 6 bloques de atención completa, con GQA (16 query / 8 key-value heads), RoPE (theta 1e6), RMSNorm, MLP SwiGLU paralelo (hidden 1024, ff 2560), embeddings compartidos |
| Parametros totales | 196.137.984 (230M nominales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens (máximo 128.000) |
| Tipos de cuantizacion | No especificado en la información disponible; se puede cuantizar con herramientas estándar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | Inglés (también código fuente y texto matemático) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

Muse2-230M-Base emplea una arquitectura híbrida que intercala 8 bloques de convolución causal depthwise (kernel de tamaño 3) con 6 bloques de atención completa, en un total de 14 bloques. Esta combinación busca reducir el coste computacional de la atención en secuencias largas, manteniendo la capacidad de modelar dependencias a largo plazo mediante las capas convolucionales. La atención utiliza Grouped-Query Attention (GQA) con 16 cabezas de consulta y 8 cabezas de clave/valor, lo que reduce el uso de memoria en comparación con la atención multi-cabeza estándar. Se aplica RoPE con theta 1e6, RMSNorm y MLP SwiGLU paralelo (dimensión oculta 1024, dimensión FFN 2560). Los embeddings de entrada y salida están compartidos.

El tokenizador es un BPE a nivel de byte con 65.536 tokens, entrenado desde cero, e incluye tokens de control estilo ChatML (pad=0, bos=1, eos=7). El modelo fue entrenado desde cero, sin partir de pesos preentrenados. La versión instruct se alineó mediante supervisión fina (SFT) con enmascaramiento de pérdida solo en la parte de completación; no se aplicó RLHF ni DPO. El corte de conocimiento es principios de 2024. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto en inglés, incluyendo código fuente y texto matemático.
- Conversación multi-turno con formato ChatML (sistema, usuario, asistente).
- Extracción estructurada de datos a partir de logs de desarrollador, con salida en JSON.
- Salida con disciplina de formato (el modelo está optimizado para seguir esquemas).
- Soporte de contexto largo (hasta 128.000 tokens en configuración máxima, aunque el entrenamiento estándar es de 8.000).
- Inferencia eficiente en CPU y GPU de baja gama gracias a su tamaño compacto y arquitectura híbrida.
- No soporta tool calling ni function calling de forma nativa (no se menciona en la documentación).
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Extracción de logs a JSON: el modelo puede convertir logs de aplicación o servidor en estructuras JSON siguiendo un esquema dado, útil para pipelines de observabilidad y análisis automatizado. Su entrenamiento específico en formato estructurado lo hace adecuado para esta tarea.
- Chat asistente en dispositivos edge: al ser un modelo pequeño (196M), puede ejecutarse en Raspberry Pi, teléfonos móviles o microcontroladores con suficiente RAM, ofreciendo respuestas conversacionales básicas sin depender de la nube.
- Generación de código en entornos con restricciones de recursos: puede autocompletar o generar fragmentos de código en lenguajes como Python o JavaScript, aunque su capacidad es limitada comparada con modelos más grandes.
- Preprocesamiento de texto en pipelines de datos: para tareas de normalización, formateo o clasificación ligera de texto en inglés, donde el coste de un modelo grande no se justifica.
- Base para fine-tuning específico: al ser un modelo abierto y pequeño, es adecuado para ajustarlo a dominios concretos (soporte técnico, documentación, etc.) con pocos recursos de cómputo.
- Investigación académica: sirve como banco de pruebas para estudiar arquitecturas híbridas convolución-atención, eficiencia de inferencia y técnicas de alineación ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo en el dominio de uso previsto antes de cualquier despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: con 196M de parámetros en FP32, el modelo ocupa aproximadamente 0,8 GB en memoria. En FP16, unos 0,4 GB. Con cuantización a 8 bits, menos de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA T4, GTX 1650, RTX 3060). También puede ejecutarse en CPU (la model card menciona chat local en CPU).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: el repositorio incluye un paquete `muse` propio (PyTorch + safetensors) y scripts de chat. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, pero al ser un modelo estándar de PyTorch podría adaptarse.
- Latencia y throughput: no se proporcionan datos oficiales. En una T4, la inferencia de 256 tokens debería completarse en menos de 2 segundos, según la naturaleza del modelo.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados. Como referencia cualitativa, se pueden considerar modelos de tamaño similar:

| Modelo | Params | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Muse2-230M-Base | 196M | 8k (128k max) | Apache-2.0 | Híbrido conv+atención, sin RLHF |
| GPT-2 (124M) | 124M | 1k | MIT | Transformer clásico, sin GQA |
| TinyLlama (1.1B) | 1.1B | 2k | Apache-2.0 | Transformer estándar, más grande |
| Phi-2 (2.7B) | 2.7B | 2k | MIT | Mayor capacidad, pero más pesado |

Muse2 destaca por su arquitectura híbrida y su enfoque en edge, pero carece de datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- El modelo no ha recibido alineamiento de seguridad, red-teaming ni filtrado de contenido. Puede generar texto sesgado, ofensivo o repetitivo.
- Alucina hechos con facilidad, especialmente en tareas que requieren conocimiento factual. No debe usarse como fuente de verdad.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La ventana de contexto estándar es de 8.000 tokens; aunque se indica un máximo de 128.000, no se especifica cómo se logra ni si el modelo mantiene calidad en esa longitud.
- No se han publicado resultados de benchmarks, por lo que se desconoce su rendimiento relativo frente a otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero las licencias de los datasets de entrenamiento pueden imponer restricciones adicionales (no se detallan).
- El paquete de inferencia es propietario (`muse`), no compatible directamente con `transformers`, lo que puede dificultar su integración en stacks existentes.

## Enlaces

- [HuggingFace - Muse2-230M-Base](https://huggingface.co/Muse-research/Muse2-230M-Base)
- [HuggingFace - Muse2-230M (página general)](https://huggingface.co/Muse-research/Muse2-230M)
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
