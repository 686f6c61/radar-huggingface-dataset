# Lihhan/banking77-modernbert

## Resumen

Lihhan/banking77-modernbert es un modelo de clasificación de texto obtenido mediante fine-tuning de answerdotai/ModernBERT-base sobre el conjunto de datos BANKING77, que agrupa consultas de soporte bancario etiquetadas con 77 intenciones distintas. Lo desarrollan Lihan Li y Xizi Luo en el marco de un proyecto del curso Accelerated Computational Linguistics (FA26), y su particularidad es que se distribuye en formato ONNX en fp16 para ejecutarse directamente en el navegador mediante transformers.js.

El modelo resuelve una tarea acotada y bien definida: enrutar una pregunta de un cliente bancario hacia una de las 77 intenciones predefinidas, lo que lo hace útil como componente de clasificación previa en sistemas de atención al cliente o de enrutamiento de tickets. Al estar basado en ModernBERT-base, hereda una arquitectura transformer encoder-only con atención bidireccional y una ventana de contexto de 8192 tokens, aunque el entrenamiento se realizó con longitud máxima de 128 tokens.

Su relevancia actual es doble: por un lado, ofrece un punto de partida listo para producción en una tarea concreta con métricas publicadas en el conjunto de test oficial; por otro, demuestra un flujo de despliegue en el cliente (navegador) sin backend, lo que reduce latencia de red y costes de infraestructura para clasificadores ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT-base) |
| Parametros totales | no disponible (el modelo base ModernBERT-base tiene 149 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el entrenamiento uso max_len 128 |
| Tipos de cuantizacion | fp16 (ONNX); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (onnx/model_fp16.onnx); checkpoint PyTorch mencionado pero no detallado |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de ModernBERT-base, un transformer encoder-only con atención bidireccional. La cabeza de clasificación se entrena para producir 77 logits, uno por intención de BANKING77. El autor documenta el proceso: precisión bf16, longitud máxima de secuencia 128, batch efectivo 32, optimizador AdamW con learning rate 8e-5 y weight decay 0.01, 3 épocas y semilla 42.

No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a PolyAI/banking77. Tampoco se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador. La innovación destacable es la exportación a ONNX fp16 para inferencia en navegador con transformers.js, con una concordancia del 99,9 % en el argmax respecto al checkpoint PyTorch sobre el conjunto de test.

## Capacidades

- Clasificación de texto en 77 intenciones bancarias (BANKING77).
- Inferencia en navegador mediante transformers.js y ONNX fp16.
- Salida de logits por clase para umbrales o ranking personalizado.
- Capacidad multilingüe: no documentada; el dataset BANKING77 está en inglés.
- Tool calling / function calling: no soportado (es un clasificador, no un modelo generativo).
- Razonamiento multi-paso o agentes: no aplica.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasifica la consulta del cliente en una de las 77 intenciones y la dirige al equipo o flujo adecuado, con 93,38 % de accuracy en test.
- Clasificación en el navegador: al ejecutarse con transformers.js y ONNX fp16, permite preclasificar consultas en el cliente sin enviar texto a un servidor, útil para privacidad y latencia.
- Triaje previo en chatbots: como primer paso antes de un modelo generativo, reduce el espacio de respuestas y mejora la consistencia del enrutamiento.
- Análisis de volumen de consultas: agregar las intenciones predichas sobre históricos de atención al cliente para detectar temas dominantes y priorizar mejoras.
- Filtrado y etiquetado de datasets: usar el clasificador para anotar o validar consultas bancarias en pipelines de datos.
- Prototipado rápido en demos web: integrar el modelo en una página estática para demostrar clasificación de intenciones sin infraestructura de backend.
- Control de calidad: comparar las predicciones del modelo con las etiquetas humanas para detectar inconsistencias en el etiquetado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Accuracy (test oficial BANKING77) | 93,38 % |
| Macro-F1 (test oficial BANKING77) | 0,934 |
| Concordancia argmax ONNX vs PyTorch | 99,9 % |

No se han publicado en la información disponible comparaciones con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repo (0,3 GB) y el formato fp16, la inferencia es ligera y cabe en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en navegador y CPU.
- Cabe en GPU de consumo: sí, con margen amplio, aunque no se documentan requisitos concretos.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de clasificación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Lihhan/banking77-modernbert | no disponible | no disponible (entrenado a 128) | Clasificación 77 intenciones | apache-2.0 | ONNX fp16 |
| answerdotai/ModernBERT-base | no disponible | no disponible | Modelo base encoder | apache-2.0 | safetensors |
| Otros fine-tunes de BANKING77 | no disponible | no disponible | Clasificación 77 intenciones | variable | variable |

No se dispone de datos de rendimiento de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado en 77 intenciones bancarias; fuera de ese dominio su utilidad es limitada.
- No se documentan sesgos conocidos ni evaluación de robustez ante variaciones léxicas o errores ortográficos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en consultas ambiguas o fuera de distribución.
- El dataset BANKING77 está en inglés; el soporte multilingüe no está documentado.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del dataset y del modelo base.
- Solo se distribuye la variante ONNX fp16; no se documentan pesos en safetensors ni otras cuantizaciones.
- El proyecto es académico y no se documenta mantenimiento ni soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/Lihhan/banking77-modernbert
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset: https://huggingface.co/datasets/PolyAI/banking77
- transformers.js: https://github.com/huggingface/transformers.js
