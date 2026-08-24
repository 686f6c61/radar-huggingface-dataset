# dwyschka/gemma-4-12B-it-oQ4-fp16

## Resumen

El modelo `dwyschka/gemma-4-12B-it-oQ4-fp16` es una conversión no oficial del modelo `google/gemma-4-12B-it` al formato MLX, optimizada para ejecutarse en dispositivos Apple Silicon (M1 y M2). El autor, dwyschka, ha re-cuantizado el modelo original utilizando OMLX 0.4.2.dev2, aplicando una cuantización de 4 bits (oQ4) con componentes en FP16, lo que reduce el tamaño del repositorio a 7,1 GB. Esta versión está pensada para usuarios que no pueden ejecutar el modelo original directamente en sus Macs, ofreciendo una alternativa más ligera sin necesidad de infraestructura de servidor.

El modelo base, Gemma 4 12B, es un modelo multimodal desarrollado por Google DeepMind, con una arquitectura transformer densa, soporte para más de 140 idiomas y una ventana de contexto de hasta 256K tokens. Está diseñado para tareas de generación de texto, razonamiento, código y visión. La conversión mantiene la licencia Apache 2.0, lo que permite su uso comercial y modificación. Aunque el repositorio no incluye métricas de rendimiento, la ficha se basa en las características conocidas del modelo base y en los datos técnicos proporcionados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) |
| Parametros totales | 1.973.687.344 (según safetensors; el modelo base Gemma 4 12B tiene aproximadamente 12 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K tokens (según modelo base) |
| Tipos de cuantizacion | 4-bit (oQ4) con componentes FP16 |
| Idiomas soportados | Más de 140 idiomas (según modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión a MLX del Gemma 4 12B IT, un transformer multimodal denso desarrollado por Google. La arquitectura original incluye capas de atención estándar, mecanismos de visión para procesar imágenes y un tokenizador multilingüe. No se dispone de detalles específicos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. El autor de esta conversión no ha realizado ningún entrenamiento adicional; únicamente ha aplicado una cuantización de 4 bits (oQ4) con retención de pesos en FP16 para optimizar el rendimiento en Apple Silicon. La re-cuantización se realizó con OMLX 0.4.2.dev2, una herramienta específica para MLX.

## Capacidades

- Generación de texto en múltiples idiomas (más de 140 según el modelo base).
- Razonamiento complejo y resolución de problemas matemáticos.
- Generación y comprensión de código en diversos lenguajes de programación.
- Capacidades multimodales: procesamiento de imágenes y texto (visión).
- Soporte de tool calling y function calling (no confirmado explícitamente en esta versión, pero presente en el modelo base).
- Capacidad para manejar contextos largos de hasta 256K tokens, útil para documentos extensos o conversaciones multi-turno.
- Optimizado para ejecución en Apple Silicon mediante MLX, con bajo consumo de memoria gracias a la cuantización 4-bit.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en una Mac con Apple Silicon para autocompletar código, explicar fragmentos o generar tests, aprovechando su capacidad de razonamiento y generación de código.
- Análisis de documentos largos: gracias a su ventana de contexto de hasta 256K tokens, puede resumir informes extensos, contratos o artículos científicos sin necesidad de dividir el texto.
- Chatbot multilingüe: al soportar más de 140 idiomas, puede desplegarse como asistente conversacional en entornos multilingües, con respuestas coherentes y contextuales.
- Procesamiento de imágenes con texto: al ser multimodal, puede describir imágenes, extraer información visual o responder preguntas sobre fotografías, útil en aplicaciones de accesibilidad o documentación.
- Entorno de desarrollo integrado (IDE) con IA: integración en editores como VS Code o Jupyter para sugerencias de código y explicaciones en tiempo real, ejecutándose localmente sin conexión a internet.
- Prototipado rápido de agentes conversacionales: su soporte de tool calling (si está disponible) permite construir agentes que interactúan con APIs o bases de datos, todo en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta conversión específica. Se recomienda consultar los benchmarks del modelo base `google/gemma-4-12B-it` en su página oficial para una referencia aproximada, aunque la cuantización 4-bit puede afectar ligeramente la precisión.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (M1, M2 y posteriores) gracias al formato MLX.
- Tamaño del repositorio: 7,1 GB, lo que sugiere que la cuantización 4-bit reduce significativamente el espacio en disco y la memoria necesaria.
- VRAM estimada: en Macs con memoria unificada, se recomienda al menos 8 GB de RAM para cargar el modelo en memoria; 16 GB o más para un rendimiento fluido con contextos largos.
- GPU recomendadas: no aplica (no requiere GPU dedicada, usa la GPU integrada del chip Apple Silicon).
- Opciones de despliegue: MLX (librería nativa), compatible con frameworks como `mlx-lm` o `mlx-lm-server`. También puede usarse con herramientas como Ollama si se convierte a GGUF, aunque no es el formato nativo.
- Latencia y throughput: no disponibles en la información proporcionada. Se espera un rendimiento adecuado para inferencia en tiempo real en Macs con suficiente memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dwyschka/gemma-4-12B-it-oQ4-fp16 | ~1,97B (cuantizado) | 256K | Apache 2.0 | MLX (safetensors) | Conversión 4-bit para Apple Silicon |
| google/gemma-4-12B-it | ~12B | 256K | Apache 2.0 | Safetensors (original) | Modelo base, requiere más recursos |
| wezzel98765/gemma-4-12B-oQ4-fp16 | ~1,97B (cuantizado) | 256K | Apache 2.0 | MLX (safetensors) | Conversión similar de otro autor |
| Llama 3.1 8B (Meta) | 8B | 128K | Llama 3.1 | Safetensors, GGUF | Alternativa densa, sin visión |

La comparativa se basa en datos públicos de los modelos. La versión cuantizada reduce drásticamente el número de parámetros efectivos en el archivo, pero el modelo original mantiene su capacidad. La principal ventaja de esta conversión es su compatibilidad con Apple Silicon y su menor huella de memoria.

## Limitaciones y advertencias

- Conversión no oficial: el modelo no ha sido validado por Google; puede haber diferencias de comportamiento respecto al original.
- La cuantización 4-bit puede degradar ligeramente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- El número de parámetros en safetensors (1,97B) no coincide con el tamaño nominal de 12B del modelo base; esto se debe probablemente a la cuantización y a la estructura de los tensores, pero puede causar confusión.
- No se han publicado benchmarks específicos para esta versión, por lo que el rendimiento real es incierto.
- El soporte de tool calling y multimodalidad no está confirmado explícitamente en esta conversión; depende de la implementación del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base de Google para asegurar el cumplimiento.
- Al estar optimizado para MLX, no es compatible directamente con frameworks como vLLM o TGI sin conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dwyschka/gemma-4-12B-it-oQ4-fp16
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-12B
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Repositorio similar de otro autor: https://huggingface.co/wezzel98765/gemma-4-12B-oQ4-fp16
