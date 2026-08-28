# Oscilla/LFM2.5-350M-mlx-8Bit

## Resumen

LFM2.5-350M es el modelo de texto más pequeño de la familia LFM2.5 desarrollada por Liquid AI, diseñado específicamente para dispositivos de borde con restricciones estrictas de memoria y cómputo. Esta versión concreta, `Oscilla/LFM2.5-350M-mlx-8Bit`, es una conversión al formato MLX (8 bits) realizada por el usuario Oscilla a partir del modelo original `LiquidAI/LFM2.5-350M`, lo que permite ejecutarlo de forma eficiente en hardware Apple Silicon mediante la librería `mlx-lm`. El modelo base emplea una arquitectura híbrida que combina capas convolucionales y de atención, y ha sido preentrenado con 28 billones de tokens (frente a los 10 billones de la versión anterior LFM2-350M) seguido de un refuerzo a gran escala (RL). Su relevancia actual radica en ofrecer capacidades conversacionales, seguimiento de instrucciones y tool-calling en un paquete extremadamente compacto, con soporte multilingüe para nueve idiomas, lo que lo convierte en una opción atractiva para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida: convolucional + atención) |
| Parametros totales | 99.745.536 (según safetensors; el modelo base LFM2.5-350M declara 350M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se menciona procesamiento de contexto largo, pero sin cifra exacta) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | lfm1.0 (otra, no estándar) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LFM2.5-350M se basa en la arquitectura LFM2 de Liquid AI, que combina capas convolucionales con mecanismos de atención para lograr un procesamiento eficiente de secuencias largas. A diferencia de los transformers puros, esta mezcla reduce el coste computacional y la huella de memoria, lo que resulta idóneo para entornos de borde. El modelo fue preentrenado con 28 billones de tokens (ampliando los 10 billones de la versión anterior LFM2-350M) y posteriormente sometido a un proceso de aprendizaje por refuerzo a gran escala, lo que mejora sus capacidades de chat, seguimiento de instrucciones y tool-calling. No se han publicado detalles adicionales sobre la composición exacta del dataset ni sobre técnicas específicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional y completado de texto en nueve idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español y portugués).
- Seguimiento de instrucciones y diálogo multi-turno, gracias al entrenamiento con refuerzo.
- Soporte de tool-calling / function calling, lo que permite integrarlo en flujos de agentes.
- Capacidad de razonamiento básico y resolución de tareas simples de código y matemáticas (dentro de las limitaciones de un modelo de 350M).
- Compatible con el formato MLX, lo que facilita su uso en aplicaciones de Apple Silicon con baja latencia.
- Al ser un modelo base, se puede adaptar mediante fine-tuning para tareas específicas.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles o IoT: su tamaño reducido y su soporte multilingüe permiten ejecutar un chatbot local en un teléfono o un dispositivo embebido sin depender de la nube.
- Clasificación y análisis de sentimiento en tiempo real: al ser ligero, puede procesar flujos de texto en streaming en servidores de bajo coste o en el propio dispositivo.
- Generación de respuestas automáticas en atención al cliente: con tool-calling, puede consultar bases de conocimiento o APIs externas para resolver consultas simples sin intervención humana.
- Preprocesamiento de texto en pipelines de datos: extracción de entidades, resumen de documentos cortos o normalización de texto en múltiples idiomas.
- Prototipado rápido de aplicaciones de IA: su facilidad de uso con `mlx-lm` y su bajo requisito de hardware lo hacen ideal para pruebas de concepto antes de escalar a modelos mayores.
- Educación y experimentación: permite a estudiantes e investigadores explorar técnicas de fine-tuning y evaluación de modelos pequeños sin necesidad de GPUs potentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial de Liquid AI menciona mejoras sobre LFM2-350M, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros en los materiales consultados.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 100 millones de parámetros cuantizados a 8 bits, el tamaño del archivo es de unos 0,4 GB, lo que implica un uso de VRAM inferior a 1 GB durante la inferencia.
- Puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, e incluso en CPUs modernas con suficiente RAM.
- Especialmente adecuado para Apple Silicon gracias al formato MLX, funcionando en Macs con chip M1 o posterior sin necesidad de GPU dedicada.
- Opciones de despliegue: `mlx-lm` (para Apple Silicon), `llama.cpp` (si se convierte a GGUF), `transformers` con PyTorch (aunque la conversión MLX es específica), y plataformas como Ollama si se adapta.
- La latencia y el throughput no se han medido en la información disponible, pero por su tamaño se espera una generación de varios cientos de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la información proporcionada. Como referencia conceptual, LFM2.5-350M compite con otros modelos compactos como Qwen2.5-0.5B, SmolLM2-360M o el propio LFM2-350M, pero sin cifras concretas no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Al ser un modelo de tamaño muy reducido, su capacidad de razonamiento complejo, generación de código avanzado y comprensión profunda es limitada; puede producir alucinaciones o respuestas incoherentes en tareas exigentes.
- La longitud de contexto no ha sido especificada en la documentación disponible, por lo que se desconoce su límite exacto para manejar conversaciones o documentos largos.
- La licencia lfm1.0 es una licencia personalizada de Liquid AI; se debe revisar cuidadosamente si permite uso comercial y qué restricciones impone antes de utilizarlo en producción.
- El modelo está cuantizado a 8 bits, lo que puede degradar ligeramente la calidad de salida en comparación con la versión completa en 16 bits o fp32.
- No se han publicado evaluaciones de sesgos ni de seguridad; como modelo base, puede reflejar sesgos presentes en sus datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/LFM2.5-350M-mlx-8Bit
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-350m
