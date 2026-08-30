# KU-AGI/RetroReasoner-RoundTrip-8B

## Resumen

RetroReasoner-RoundTrip-8B es un modelo de generación de texto especializado en predicción de reacciones químicas directas (reactivos → producto), desarrollado por KU-AGI como parte del proyecto RetroReasoner. Se trata de un fine-tuning del modelo Qwen/Qwen3-8B, con 8.190 millones de parámetros, entrenado para convertir una cadena SMILES de reactivos en el SMILES del producto resultante. Su función principal es servir como componente de evaluación "round-trip" en sistemas de retrosíntesis: dado un conjunto de reactivos propuestos por un modelo retrosintético, este modelo verifica si la reacción directa produce el compuesto objetivo, cerrando así el ciclo de validación.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 16,4 GB. Está pensado para ser usado con la plantilla de chat de Qwen3 y un prompt específico documentado en su model card. Aunque se basa en un modelo generalista, su entrenamiento está orientado exclusivamente a tareas de química, por lo que su uso fuera de ese dominio no está recomendado. La relevancia actual radica en la creciente adopción de modelos de lenguaje para planificación sintética y la necesidad de validar automáticamente las propuestas de reactivos generadas por sistemas de retrosíntesis.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa 40960 tokens) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer decoder-only con atención causal estándar, sin mecanismos de mezcla de expertos. Sobre esta base se realiza un fine-tuning supervisado (SFT) con datos de reacciones químicas, donde la entrada es una cadena SMILES de reactivos y la salida esperada es el SMILES del producto. Según el paper de RetroReasoner, el entrenamiento del modelo round-trip utiliza pérdida de entropía cruzada para la predicción del siguiente token, de forma similar al modelo principal de retrosíntesis. No se especifican detalles sobre el volumen de datos, la composición del dataset ni el uso de técnicas como RLHF o DPO en este modelo concreto. La innovación principal no reside en la arquitectura, sino en el enfoque de entrenamiento orientado a una tarea química específica y su integración en un flujo de evaluación round-trip.

## Capacidades

- Predicción de productos de reacción química a partir de SMILES de reactivos.
- Generación de texto en formato SMILES válido para reacciones directas.
- Conversación limitada al prompt de química definido en la model card (no es un chatbot generalista).
- Integración con el ecosistema transformers y vLLM para inferencia.
- Soporte de generación con `max_new_tokens=500` y sin cadena de pensamiento larga.
- No dispone de tool calling, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Validación de rutas retrosintéticas: dado un conjunto de reactivos propuestos por un modelo de retrosíntesis, este modelo predice el producto y permite comprobar si coincide con el compuesto objetivo, cerrando el ciclo de evaluación round-trip.
- Diseño de síntesis directa: un químico puede introducir los reactivos disponibles y obtener una predicción del producto esperado, útil para explorar transformaciones conocidas.
- Automatización de laboratorio: integración en pipelines de robótica experimental donde se necesita predecir el resultado de una reacción antes de ejecutarla físicamente.
- Generación de bibliotecas de compuestos: a partir de una lista de reactivos, el modelo puede generar los productos potenciales para screening virtual.
- Educación química: herramienta didáctica para que estudiantes verifiquen sus propuestas de reacciones y comparen con la predicción del modelo.
- Evaluación de modelos retrosintéticos: como componente de un sistema de doble vía, permite medir la factibilidad de las propuestas de reactivos generadas por otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de RetroReasoner (arXiv 2603.12666) menciona métricas de round-trip accuracy, pero los valores concretos para este modelo no están incluidos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 16,4 GB, por lo que se necesita al menos 20 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits podría reducirse a unos 10 GB, y con 4 bits a unos 5 GB, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o RTX 3090 (24 GB) para ejecución en bfloat16. GPUs con 16 GB (como RTX 4080) podrían funcionar con cuantización.
- En consumer GPU: sí, cabe en tarjetas de 24 GB como la RTX 4090 sin cuantizar, y en tarjetas de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM (comando documentado con `--max-model-len 40960`), y compatible con text-generation-inference (TGI) según las etiquetas del repositorio.
- Latencia y throughput: no disponibles. Al ser un modelo de 8B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| RetroReasoner-RoundTrip-8B | 8,19 B | No disponible | Apache 2.0 | Predicción de reacción directa (reactivos → producto) |
| Qwen3-8B (base) | 8,19 B | 32k (según documentación de Qwen) | Apache 2.0 | Modelo generalista sin fine-tuning químico |
| RetroReasoner-RL | 8,19 B (presumiblemente) | No disponible | No especificada | Retrosíntesis (producto → reactivos) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a aspectos arquitectónicos y de licencia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el prompt documentado; otros formatos de prompt quedan fuera de distribución y pueden producir resultados erróneos.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- No es un modelo de retrosíntesis; su función es la predicción directa de productos, y debe usarse junto a un modelo retrosintético para tareas de planificación.
- Riesgo de alucinación en SMILES: puede generar cadenas químicamente inválidas o productos no realistas, especialmente con reactivos poco comunes.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconoce la cobertura de tipos de reacción y posibles sesgos hacia ciertas familias químicas.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre la exactitud química de las predicciones.
- El tamaño del repositorio (16,4 GB) implica requisitos de almacenamiento y memoria considerables para despliegue en entornos con recursos limitados.

## Enlaces

- [HuggingFace: KU-AGI/RetroReasoner-RoundTrip-8B](https://huggingface.co/KU-AGI/RetroReasoner-RoundTrip-8B)
- [Paper arXiv: RetroReasoner: A Reasoning LLM for Strategic Retrosynthesis Prediction](https://arxiv.org/pdf/2603.12666v1)
- [OpenReview: RetroReasoner](https://openreview.net/pdf?id=ZoDqbMN6uT)
- [FriendliAI: RetroReasoner-RL API](https://friendli.ai/models/KU-AGI/RetroReasoner-RL)
- [Perfil de KU-AGI en HuggingFace](https://huggingface.co/KU-AGI)
