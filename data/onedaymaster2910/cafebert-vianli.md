# OneDayMaster2910/cafebert-vianli

## Resumen
cafebert-vianli es un modelo de inferencia de lenguaje natural (NLI) en vietnamita, desarrollado por el usuario OneDayMaster2910 a partir del modelo base uitnlp/CafeBERT. Resuelve la tarea de clasificación de pares de frases en tres categorías (entailment, neutral y contradiction), un problema fundamental para sistemas de verificación de hechos, recuperación de información y razonamiento textual en vietnamita. El modelo se publica bajo licencia Apache 2.0 y está pensado para su integración en pipelines de transformers estándar.

La arquitectura subyacente es un transformer encoder de tipo XLM-RoBERTa, con 559.893.507 parámetros totales y un tamaño de repositorio de 2,3 GB en formato safetensors. Se ha realizado un ajuste fino completo (full fine-tuning) de todos los pesos, sin LoRA ni capas congeladas, sobre el split de entrenamiento del dataset uitnlp/ViANLI. La longitud máxima de secuencia utilizada durante el entrenamiento es de 256 tokens.

El modelo es relevante por su especialización en vietnamita, un idioma con menor cobertura en modelos NLI de propósito general, y por su enfoque de ajuste completo sobre un backbone multilingüe adaptado al vietnamita. No obstante, los resultados publicados (44,90 % de accuracy y 44,66 % de Macro F1 en el test de ViANLI) indican un rendimiento moderado que conviene contextualizar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 559.893.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de uitnlp/CafeBERT, un backbone basado en la arquitectura XLM-RoBERTa adaptado al vietnamita. Sobre él se añade una cabeza de clasificación de secuencias para tres etiquetas (entailment, neutral, contradiction). El ajuste es completo: todos los pesos del backbone y de la cabeza se actualizan durante el entrenamiento, sin PEFT, LoRA ni congelación de capas.

El entrenamiento se realizó sobre el split `train` del dataset uitnlp/ViANLI, con 8 épocas, learning rate 2e-05, optimizador adamw_torch, semilla 42 y longitud máxima de secuencia de 256 tokens. La model card menciona también facebook/xnli como dataset de referencia, aunque no se detalla su uso en el entrenamiento. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo encoder de clasificación). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación de pares de frases (premise, hypothesis) en tres etiquetas: entailment, neutral y contradiction.
- Inferencia de lenguaje natural en vietnamita, incluyendo relaciones semánticas entre oraciones.
- Integración con la API `pipeline("text-classification")` de Transformers y con `AutoModelForSequenceClassification`.
- Soporte de tokenización por pares con truncación a 256 tokens.
- No soporta tool calling ni function calling (es un modelo de clasificación, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al vietnamita según la model card.

## Casos de uso
- Verificación de hechos en vietnamita: dado un texto fuente como premisa y una afirmación como hipótesis, el modelo clasifica si la afirmación se deduce, es neutral o contradice la fuente; útil en pipelines de fact-checking automatizado.
- Filtrado de respuestas en sistemas de preguntas y respuestas: comprobar si una respuesta candidata está respaldada por el contexto recuperado antes de mostrarla al usuario.
- Detección de contradicciones en bases de conocimiento: comparar pares de afirmaciones extraídas de documentos para señalar inconsistencias.
- Enriquecimiento de datasets NLI en vietnamita: usar el modelo como etiquetador débil para preanotar pares de frases y reducir el esfuerzo de anotación manual.
- Evaluación de sistemas de resumen: verificar si las frases del resumen se derivan del documento original mediante clasificación entailment/neutral/contradiction.
- Moderación de contenido basada en consistencia: comprobar si un mensaje contradice políticas o afirmaciones previas registradas en vietnamita.
- Búsqueda semántica con reordenación: reordenar pares consulta-documento según la probabilidad de entailment para mejorar la relevancia.

## Benchmarks y rendimiento

| Tarea / split | Metrica | Valor |
|---|---|---|
| vianli (test) | Accuracy | 44,90 % |
| vianli (test) | Macro F1 | 44,66 % |
| vianli (validación) | Best Macro F1 | 48,33 % |

No se han publicado resultados comparativos con otros modelos NLI en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequeños; A100, H100, RTX 4090, RTX 3090 o RTX 3060 son suficientes.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: Transformers con PyTorch, pipeline de text-classification, TorchServe, FastAPI con Transformers, ONNX Runtime si se exporta manualmente; no se han publicado variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Rendimiento NLI |
|---|---|---|---|---|---|
| OneDayMaster2910/cafebert-vianli | 559,9 M | 256 | vi | Apache 2.0 | 44,90 % accuracy / 44,66 % Macro F1 (ViANLI test) |
| uitnlp/CafeBERT (base) | no disponible | no disponible | vi | no disponible | no disponible (modelo base, sin cabeza NLI) |
| XLM-RoBERTa base | 278 M | 512 | multilingüe (100 idiomas) | MIT | no disponible en esta ficha |
| XLM-RoBERTa large | 559,9 M | 512 | multilingüe (100 idiomas) | MIT | no disponible en esta ficha |

La comparación con XLM-RoBERTa se incluye por la coincidencia de arquitectura y tamaño, pero no se dispone de resultados NLI en vietnamita para esos modelos en la información proporcionada.

## Limitaciones y advertencias
- Rendimiento moderado: 44,90 % de accuracy y 44,66 % de Macro F1 en el test de ViANLI, con una mejor validación de 48,33 % de Macro F1; insuficiente para aplicaciones de alta precisión sin validación adicional.
- Especializado exclusivamente en vietnamita; no se garantiza un comportamiento correcto en otros idiomas.
- Longitud máxima de 256 tokens, lo que limita el análisis de documentos largos sin truncación previa.
- Modelo de clasificación, no generativo: no puede producir texto, razonar de forma abierta ni ejecutar herramientas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas o sobreconfiadas en pares ambiguos.
- No se documentan sesgos específicos ni la composición demográfica del dataset ViANLI en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero los datasets de origen (uitnlp/ViANLI y facebook/xnli) tienen sus propias condiciones que deben revisarse.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se han publicado variantes cuantizadas ni formatos alternativos de despliegue.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OneDayMaster2910/cafebert-vianli
- Modelo base uitnlp/CafeBERT: https://huggingface.co/uitnlp/CafeBERT
- Dataset uitnlp/ViANLI: https://huggingface.co/datasets/uitnlp/ViANLI
- Dataset facebook/xnli: https://huggingface.co/datasets/facebook/xnli
