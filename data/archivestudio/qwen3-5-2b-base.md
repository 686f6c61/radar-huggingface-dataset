# ArchiveStudio/Qwen3.5-2B-Base

## Resumen

Qwen3.5-2B-Base es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Se distribuye en este repositorio bajo el identificador ArchiveStudio/Qwen3.5-2B-Base como pesos en formato Transformers, y constituye la variante base (solo preentrenada) de la familia Qwen3.5 en el tramo de 2.000 millones de parámetros. La model card indica que está pensado para fine-tuning, experimentos de aprendizaje en contexto y desarrollo e investigación, no para interacción directa.

La propuesta técnica de Qwen3.5 es una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), junto con entrenamiento multimodal de fusión temprana sobre tokens de imagen y texto. El modelo declara un contexto nativo de 262.144 tokens, extensible hasta 1.010.000, y un vocabulario de 248.320 entradas, lo que lo sitúa en un rango de ventana muy superior al habitual en modelos de su tamaño.

Es relevante ahora porque representa el tramo pequeño de una familia que el autor presenta como unificada en visión-lenguaje, con soporte declarado de 201 idiomas y dialectos y entrenamiento con RL a gran escala sobre entornos multiagente. Para desarrolladores, el interés práctico está en un modelo de 2B con contexto muy largo, capacidades multimodales y licencia Apache 2.0, apto para despliegue en hardware modesto tras cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; capas Gated DeltaNet (atención lineal) y Gated Attention, con FFN |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (la model card no describe configuración MoE para esta variante de 2B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada (los pesos se publican en safetensors; no se documentan recetas de cuantización) |
| Idiomas soportados | 201 idiomas y dialectos según la model card (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM y SGLang |

Otros datos técnicos declarados: dimensión oculta 2048, 24 capas, layout oculto 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, 8 cabezas de atención para Q y 2 para KV con dimensión de cabeza 256, dimensión de RoPE 64, dimensión intermedia de FFN 6144, embeddings de token de 248.320 (con padding) atados a la salida LM, y entrenamiento con MTP (multi-token prediction) multi-paso. El tamaño del repositorio es de 4,6 GB.

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión y una arquitectura híbrida poco convencional: de cada cuatro bloques, tres usan Gated DeltaNet (atención lineal con cabezas separadas para V y QK) y uno usa Gated Attention con atención por compuertas (8 cabezas Q, 2 cabezas KV). Esta combinación busca reducir el coste de atención en contextos largos manteniendo la capacidad expresiva de la atención completa en una fracción de las capas. El modelo incorpora además un cabezal de predicción multi-token (MTP) entrenado en varios pasos, lo que habilita decodificación especulativa y puede acelerar la generación.

Según la model card, el entrenamiento parte de una base multimodal con fusión temprana sobre tokens de imagen y texto, con paridad declarada frente a Qwen3 y mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se menciona también RL escalado sobre entornos con millones de agentes y distribuciones de tareas progresivamente complejas, así como una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto a texto puro. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de post-entrenamiento (RLHF/DPO). Los tokens de control `<|im_start|>` y `<|im_end|>` están entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial sin reentrenar embeddings, algo relevante dado el tamaño del vocabulario.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con contexto nativo de 262.144 tokens.
- Comprensión de imágenes y texto (pipeline image-text-to-text): el modelo integra un codificador de visión y fusión temprana de modalidades.
- Generación de código y tareas de agentes, según las comparativas declaradas por el autor frente a Qwen3 y Qwen3-VL.
- Razonamiento multi-paso y soporte declarado para escenarios de agentes (entrenamiento con RL sobre entornos multiagente).
- Capacidades multilingües: 201 idiomas y dialectos según la model card.
- Predicción multi-token (MTP) entrenada, utilizable para decodificación especulativa.
- Soporte de tool calling / function calling: no se documenta explícitamente en la información disponible para esta variante base.
- Modo thinking explícito: no se documenta en la información disponible.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base de 2B con licencia Apache 2.0, es adecuado como punto de partida para ajuste con LoRA sobre datos propios (legal, sanitario, atención al cliente) sin reentrenar los embeddings gracias a los tokens de control incluidos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo puede ingerir contratos, informes anuales o expedientes completos en una sola pasada, útil para extracción de cláusulas y resumen estructurado.
- Análisis de documentos escaneados con imagen y texto: el codificador de visión permite procesar facturas, formularios o capturas junto con su texto asociado en tareas de extracción de campos.
- Experimentos de investigación en aprendizaje en contexto: su tamaño reducido y su ventana larga permiten estudiar dinámicas de few-shot con muchos ejemplos en contexto en una sola GPU.
- Base para asistentes conversacionales especializados: tras un ajuste con la plantilla de chat oficial, puede desplegarse como backend de conversación multi-turno en entornos con presupuesto de hardware limitado.
- Prototipado de pipelines de agentes: el modelo puede integrarse en orquestadores multi-paso para planificación y descomposición de tareas, aprovechando el entrenamiento declarado con RL sobre entornos de agentes.
- Evaluación comparativa de arquitecturas híbridas: sirve como referencia para medir el rendimiento de Gated DeltaNet frente a atención completa en tareas de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma, de forma cualitativa, paridad con Qwen3 y mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16): aproximadamente 4,5 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo la caché KV crece de forma significativa.
- Cuantización a 8 bits: en torno a 2,3 GB de pesos; a 4 bits: en torno a 1,2 GB, aunque no se documentan recetas oficiales de cuantización en la información disponible.
- GPU recomendadas: A100 40/80 GB y H100 para despliegues con contexto máximo y concurrencia alta; RTX 4090 (24 GB) o RTX 3090 para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 para contextos cortos, y en 4-6 GB tras cuantización a 4 bits.
- Opciones de despliegue: Transformers, vLLM y SGLang según la model card; llama.cpp y Ollama no se mencionan explícitamente y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base | 2,27B | 262.144 nativo, hasta 1.010.000 | Texto + imagen | Apache 2.0 | Pesos en Hugging Face |
| Qwen3-VL (variantes pequeñas) | no disponible en la información | no disponible | Texto + imagen | no disponible | Pesos públicos |
| Qwen3 (variantes pequeñas) | no disponible en la información | no disponible | Texto | no disponible | Pesos públicos |

La model card sitúa a Qwen3.5 por encima de Qwen3-VL y en paridad con Qwen3 en las tareas declaradas, pero no aporta cifras ni especificaciones de las variantes comparadas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un modelo solo preentrenado: no está alineado para diálogo directo y puede producir salidas incoherentes o inseguras sin ajuste previo.
- Riesgo de alucinación inherente a los modelos base; no se documentan evaluaciones de fidelidad factual.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El listado completo de los 201 idiomas declarados no se publica; el rendimiento por idioma es desconocido.
- El contexto extensible hasta 1.010.000 tokens no está validado con métricas publicadas; el rendimiento más allá de 262.144 tokens puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es una réplica de terceros (ArchiveStudio) que enlaza a la licencia del repositorio oficial de Qwen; conviene verificar la procedencia de los pesos antes de usos en producción.
- El repositorio no registra descargas ni interacciones, lo que impide validar su mantenimiento o reproducibilidad.
- No se documentan recetas de cuantización ni plantillas de chat publicadas en este repositorio; la plantilla oficial debe obtenerse del repositorio de Qwen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-2B-Base
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-2B-Base/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
