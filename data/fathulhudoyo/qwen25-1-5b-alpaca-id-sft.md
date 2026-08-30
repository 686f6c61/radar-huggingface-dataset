# fathulhudoyo/qwen25-1.5b-alpaca-id-sft

## Resumen

El modelo `fathulhudoyo/qwen25-1.5b-alpaca-id-sft` es un ajuste fino (fine-tuning) del modelo instructivo Qwen2.5-1.5B sobre un conjunto de datos de tipo Alpaca, orientado a conversación y seguimiento de instrucciones. Desarrollado por el usuario `fathulhudoyo`, el modelo se entrenó utilizando las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un flujo estándar. El identificador "id" sugiere una posible adaptación al idioma indonesio, aunque la model card declara únicamente inglés como idioma soportado.

La arquitectura base es la de Qwen2.5-1.5B, un transformer denso de 1.500 millones de parámetros, con una longitud de contexto nativa de 32.768 tokens. Este ajuste fino conserva todas las capacidades del modelo original, incluyendo generación de texto, razonamiento y soporte de tool calling, pero no se especifican detalles del dataset de entrenamiento ni de los hiperparámetros utilizados. Es relevante como ejemplo de adaptación eficiente de un modelo pequeño y open source para tareas conversacionales, con licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin archivos GGUF) |
| Idiomas soportados | en (inglés; el nombre sugiere indonesio, pero no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-1.5B, un transformer causal con atención completa, normalización RMSNorm, y activación SwiGLU. El ajuste fino se realizó sobre el checkpoint `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, que ya incorporaba cuantización de 4 bits para el entrenamiento. Se utilizó la librería Unsloth para acelerar el entrenamiento y la librería TRL de Hugging Face para el pipeline de fine-tuning supervisado (SFT). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (aunque el nombre "alpaca-id" apunta a una variante del dataset Alpaca, posiblemente en indonesio) ni sobre el uso de técnicas de alineación como RLHF o DPO. El entrenamiento se realizó en un entorno compatible con TGI (Text Generation Inference).

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredado del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y comprensión de lenguaje natural en inglés.
- Soporte de tool calling y function calling, disponible en Qwen2.5-1.5B-Instruct.
- Capacidad de manejar contextos largos (hasta 32K tokens) para tareas que requieren memoria extendida.
- No se han documentado capacidades multimodales (visión, audio) ni modos de pensamiento explícitos.
- El ajuste con datos de tipo Alpaca puede mejorar la adherencia a instrucciones y el estilo conversacional, aunque no hay métricas publicadas que lo confirmen.

## Casos de uso

- Asistente conversacional ligero: al ser un modelo de 1.5B, puede desplegarse en entornos con recursos limitados (CPU o GPU de gama baja) para chatbots de atención al cliente, preguntas frecuentes o asistentes personales.
- Generación de respuestas en inglés con formato estructurado: el entrenamiento con plantillas Alpaca favorece respuestas claras y bien formateadas, útil para sistemas de Q&A internos.
- Prototipado rápido de aplicaciones de IA: su tamaño reducido y licencia permisiva permiten iterar rápidamente en entornos de desarrollo sin grandes costes de cómputo.
- Fine-tuning adicional: puede servir como punto de partida para adaptaciones a dominios específicos (legal, médico, técnico) con un coste de entrenamiento bajo.
- Educación e investigación: adecuado para experimentos de alineación, evaluación de técnicas de SFT o análisis de comportamiento en modelos pequeños.
- Despliegue en edge devices: con cuantización (por ejemplo, GGUF de 4 bits) podría ejecutarse en dispositivos móviles o Raspberry Pi, aunque no se proporcionan artefactos cuantizados oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este ajuste específico. El rendimiento esperado es el del modelo base Qwen2.5-1.5B-Instruct, que en el reporte técnico de Qwen2.5 obtiene puntuaciones moderadas en comparación con modelos más grandes, pero no se dispone de cifras concretas para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.54B parámetros en FP32 (unos 6 GB), pero en FP16/BF16 ocupa aproximadamente 3 GB. Con cuantización de 4 bits podría reducirse a ~1 GB, aunque no se ofrecen archivos cuantizados en el repo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, NVIDIA T4, GTX 1650, RTX 3050). Para cuantización 4 bits, bastarían 2 GB (p. ej., Jetson Nano, Raspberry Pi con acelerador).
- Cabe en GPUs de consumo: sí, en la mayoría de tarjetas modernas (RTX 3060, RTX 4060, etc.) con FP16 o cuantización.
- Opciones de despliegue: vLLM, TGI (el repo es compatible con endpoints de Hugging Face), llama.cpp (si se convierte a GGUF), Ollama (no hay etiqueta específica, pero puede importarse).
- Latencia y throughput: no se proporcionan datos. Para un modelo de 1.5B en FP16 en una T4, se estima una latencia de ~20-50 ms por token y un throughput de 20-50 tokens/s, pero son valores orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (MMLU) | Notas |
|---|---|---|---|---|---|
| fathulhudoyo/qwen25-1.5b-alpaca-id-sft | 1.54B | 32K | Apache-2.0 | no disponible | Fine-tuning de Qwen2.5-1.5B-Instruct |
| Qwen2.5-1.5B-Instruct | 1.54B | 32K | Apache-2.0 | 52.2 (según reporte técnico) | Modelo base original |
| Llama-3.2-1B-Instruct | 1.23B | 128K | Llama 3.2 Community License | 49.3 (aprox.) | Alternativa de Meta, contexto mayor |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | 69 (aprox.) | Más grande, mayor rendimiento, pero más pesado |

La comparación se basa en datos públicos de los modelos base; el fine-tuning puede alterar ligeramente el comportamiento, pero no hay métricas propias.

## Limitaciones y advertencias

- No se ha publicado información sobre el dataset de entrenamiento; el nombre "alpaca-id" sugiere datos en indonesio, pero la model card declara solo inglés. Esto genera incertidumbre sobre el rendimiento real en indonesio.
- Riesgo de alucinación y errores factuales, común en modelos de este tamaño.
- Limitaciones de razonamiento complejo y matemáticas avanzadas, propias de un modelo de 1.5B.
- Sin garantía de rendimiento en producción: al ser un fine-tuning de un tercero, no hay evidencia de evaluación exhaustiva ni de robustez ante entradas adversas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache-2.0, por lo que no hay restricciones adicionales.
- El repositorio no incluye archivos de cuantización (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de baja memoria a menos que se conviertan manualmente.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/fathulhudoyo/qwen25-1.5b-alpaca-id-sft
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Reporte técnico de Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v1
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Página del modelo en FriendliAI (inferencia como servicio): https://friendli.ai/models/dickyrh/qwen2.5-1.5b-alpaca-id-sft
