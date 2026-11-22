# RedHatAI/Qwen3.8-27B

## Resumen
Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por Qwen (Alibaba) y distribuido en el repositorio de Hugging Face de RedHatAI. Se trata de la generación Qwen3.8 de la familia abierta de Qwen, construida sobre la base arquitectónica de Qwen3.5, y orientada a tareas de programación, trabajo profesional, investigación y flujos agénticos de largo horizonte. El modelo combina un transformer híbrido con capas de atención lineal Gated DeltaNet y capas de atención con compuerta (Gated Attention), además de un codificador de visión nativo que permite entrada de imagen y vídeo.

Con 27.781.427.952 parámetros totales y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, el modelo se posiciona como una alternativa densa y desplegable frente a modelos mayores. Incorpora control flexible del modo de razonamiento (thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`), así como Multi-Token Prediction (MTP) entrenado en varios pasos, lo que facilita la decodificación especulativa.

El modelo está validado en RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0, y es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. Su licencia Apache 2.0 y su tamaño compacto lo hacen relevante para despliegues en producción con requisitos moderados de infraestructura, en un contexto donde la demanda de modelos multimodales con capacidades agénticas y contexto largo crece rápidamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; capas Gated DeltaNet (atención lineal) y Gated Attention con compuerta |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura de transformer causal con un diseño híbrido de capas: 64 capas organizadas en 16 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La dimensión oculta es de 5.120, con una dimensión intermedia de FFN de 17.408. Las capas Gated DeltaNet utilizan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention emplean 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. El embedding de tokens y la salida LM tienen 248.320 entradas (con padding). Incluye un codificador de visión para entrada image-text-to-text.

El entrenamiento comprende fases de preentrenamiento y postentrenamiento. Se entrenó con Multi-Token Prediction (MTP) en múltiples pasos, una innovación que permite predecir varios tokens por paso y habilita decodificación especulativa. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento flexible: thinking mode activado por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imagen y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de coding agéntico, con mejoras sustanciales en tareas de terminal agéntico.
- Planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo de forma fiable.
- Soporte de tool calling y function calling, con compatibilidad con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- Tareas de investigación y trabajo profesional.
- Ejecución de tareas agénticas de largo horizonte con razonamiento multi-paso.

## Casos de uso
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa, manteniendo el hilo de la conversación y el historial de razonamiento mediante `preserve_thinking`.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para tareas de coding agéntico, incluyendo interacción con terminal y manejo de retroalimentación del entorno.
- Análisis de documentos técnicos y diagramas STEM: el codificador de visión permite interpretar diagramas, figuras y documentos escaneados, útil en entornos de investigación e ingeniería.
- Procesamiento de vídeo de larga duración: la comprensión nativa de vídeos de hasta una hora permite resumir, extraer información o responder preguntas sobre contenido audiovisual extenso.
- Agentes autónomos de investigación: la planificación autónoma y el razonamiento multi-paso permiten orquestar tareas de búsqueda, síntesis y verificación con múltiples pasos y herramientas.
- Asistentes de desarrollo integrados en IDE: la compatibilidad con harnesses y herramientas de desarrollo facilita su integración en entornos de programación asistida con contexto de repositorio amplio.
- Automatización de flujos de trabajo profesionales: tareas de extracción, clasificación y generación de documentos con contexto largo y capacidad multimodal.

## Benchmarks y rendimiento
La model card incluye una tabla de benchmarks con comparativas frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías como Coding (agentic terminal coding). Sin embargo, los valores numéricos concretos de esa tabla no están disponibles en la información proporcionada, por lo que no se reproducen cifras.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 27.781 millones de parámetros, en FP16 se requieren aproximadamente 55,6 GB de pesos (tamaño del repo), por lo que se necesita al menos una GPU con 80 GB o varias GPUs.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16/BF16; configuraciones multi-GPU para contexto largo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; en cuantizaciones de 4 bits podría aproximarse a 16-24 GB, pero no se especifican tipos de cuantización soportados.
- Opciones de despliegue: Hugging Face Transformers, vLLM (validado en vLLM 0.28.0), SGLang, TokenSpeed; validado en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativo, hasta 1.000.000 | Apache 2.0 | Hugging Face (RedHatAI) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B (aproximado) | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

Los modelos comparables aparecen en la tabla de benchmarks de la model card, pero no se dispone de sus especificaciones técnicas detalladas en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo de razonamiento activado por defecto puede aumentar la latencia y el consumo de tokens.
- Limitaciones de contexto o idioma: la ventana nativa es de 262.144 tokens; la extensión hasta 1.000.000 requiere configuración adicional y puede degradar el rendimiento. No se detallan los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y distribución con atribución; no se especifican restricciones adicionales.
- Caveats para producción: el modelo está validado en versiones concretas de RHOAI, RHAIIS y vLLM; otras versiones pueden no estar soportadas. El servicio gestionado Qwen Cloud con contexto de 1M por defecto está anunciado como "coming soon", por lo que no está disponible aún.

## Enlaces
- Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B
- Model card (README): https://huggingface.co/RedHatAI/Qwen3.8-27B/blob/main/README.md
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Qwen Cloud (servicio gestionado, próximamente): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
