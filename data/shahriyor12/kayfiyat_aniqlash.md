# shahriyor12/kayfiyat_aniqlash

## Resumen

`shahriyor12/kayfiyat_aniqlash` es un modelo de clasificación de sentimiento en uzbeko desarrollado por el usuario de Hugging Face shahriyor12. Se trata de un fine-tuning del modelo multilingüe `FacebookAI/xlm-roberta-base` sobre un conjunto de 150 frases escritas a mano en uzbeko, etiquetadas en tres clases: positivo, negativo y neutro. El modelo está pensado como ejercicio académico y de aprendizaje, no como una herramienta de producción.

Con 278 millones de parámetros y un tamaño de repositorio de 1,1 GB, el modelo es ligero y desplegable en hardware modesto. Su contexto efectivo viene heredado de XLM-RoBERTa base (512 tokens), aunque la model card no lo explicita. La relevancia práctica es limitada: se trata de un recurso didáctico para la comunidad uzbeka de PLN, con un conjunto de evaluación de solo 30 frases y una precisión reportada de 0,83.

El autor advierte explícitamente de que el dataset es muy pequeño y de que el modelo falla en escritura cirílica, ironía y negaciones complejas. La licencia MIT permite uso comercial, pero las limitaciones de calidad desaconsejan cualquier despliegue real sin un reentrenamiento sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base, fine-tuning para clasificación) |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de XLM-RoBERTa base: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder de tipo RoBERTa entrenado de forma multilingüe sobre 100 idiomas con 2,5 TB de texto CommonCrawl filtrado. Sobre esa base, el autor ha aplicado un fine-tuning supervisado para clasificación de secuencias en tres clases (positivo, negativo, neutro) usando 150 frases en uzbeko escritas manualmente, con 50 ejemplos por clase.

No se documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá del recuento por clase, ni si se aplicó RLHF, DPO o alguna técnica de aumentación de datos. La evaluación se realizó sobre 30 frases, con una precisión reportada de 0,83. No se especifican hiperparámetros, épocas, tasa de aprendizaje ni estrategia de validación.

## Capacidades

- Clasificación de sentimiento en uzbeko en tres clases: positivo, negativo y neutro.
- Procesamiento de texto en escritura latina uzbeka (la escritura cirílica se menciona como limitación).
- Inferencia ligera sobre frases cortas, adecuada para prototipos y experimentos docentes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni visión.
- Capacidad multilingüe limitada al uzbeko en la práctica, aunque la base XLM-R sea multilingüe.

## Casos de uso

- Ejercicio docente de fine-tuning: sirve como ejemplo reproducible de cómo adaptar XLM-RoBERTa base a una tarea de clasificación en un idioma de bajos recursos como el uzbeko, con un dataset mínimo y una métrica sencilla.
- Prototipado rápido de análisis de opiniones en uzbeko: permite validar un pipeline de clasificación de sentimiento antes de invertir en un dataset mayor, aunque la precisión de 0,83 sobre 30 frases no garantiza generalización.
- Investigación sobre PLN en lenguas túrquicas: útil como punto de partida o baseline para comparar con modelos entrenados sobre corpus uzbekos más amplios.
- Demostración de limitaciones en escritura cirílica: el propio autor documenta fallos en este alfabeto, lo que lo convierte en un caso de estudio sobre sesgos de tokenización en XLM-R para uzbeko.
- Filtrado preliminar de reseñas en un entorno controlado: con revisión humana posterior, podría usarse para triar comentarios en uzbeko en un prototipo interno, nunca como clasificador automático en producción.
- Benchmark de referencia para futuros fine-tunings: al publicar la métrica y el tamaño del dataset, sirve como línea base para comparar nuevos modelos de sentimiento en uzbeko.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto de evaluación |
|---|---|---|
| Precisión (accuracy) | 0,83 | 30 frases en uzbeko, 3 clases |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado es la precisión sobre un conjunto de evaluación interno de 30 frases, sin desglose por clase ni matriz de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB (278 M parámetros × 4 bytes).
- VRAM estimada en fp16: aproximadamente 0,56 GB; en int8: aproximadamente 0,28 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente; también funciona en CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `transformers` con PyTorch, `ONNX Runtime`, `Optimum`; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos generativos, no a clasificadores encoder).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shahriyor12/kayfiyat_aniqlash | 278 M | no disponible (heredado 512) | Clasificación de sentimiento en uzbeko | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 | Modelo base multilingüe (no clasificador) | MIT | Hugging Face |
| Modelos de sentimiento en uzbeko específicos | no disponible | no disponible | Clasificación de sentimiento | no disponible | no disponible |

No se dispone de información sobre otros clasificadores de sentimiento en uzbeko con los que comparar directamente. La comparación más directa es con el modelo base XLM-RoBERTa, del que este modelo hereda arquitectura y tokenizador, pero que no está fine-tuneado para la tarea.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 150 frases (50 por clase), lo que provoca un alto riesgo de sobreajuste y baja generalización.
- Conjunto de evaluación de solo 30 frases: la precisión de 0,83 tiene un intervalo de confianza muy amplio y no es representativa.
- Fallos documentados en escritura cirílica uzbeka, ironía y negaciones complejas.
- Frontera difusa entre la clase neutra y las clases positiva/negativa, según el propio autor.
- Sesgos desconocidos: no se documenta análisis de sesgos demográficos, geográficos ni de dominio.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas con alta confianza.
- Licencia MIT: permite uso comercial, pero la calidad del modelo desaconseja cualquier despliegue en producción sin reentrenamiento y validación con datos reales.
- El autor indica explícitamente que el modelo es solo para fines de aprendizaje ("Faqat o'quv maqsadida").
- No hay información sobre el pipeline de Hugging Face ni sobre la configuración de inferencia recomendada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shahriyor12/kayfiyat_aniqlash
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
