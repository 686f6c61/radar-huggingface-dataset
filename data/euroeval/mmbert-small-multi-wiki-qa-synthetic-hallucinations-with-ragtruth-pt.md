# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-pt

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-pt` es un clasificador de tokens diseñado para detectar alucinaciones en respuestas generadas por sistemas de recuperación aumentada (RAG). Desarrollado por el proyecto EuroEval, se basa en una arquitectura ModernBERT multilingüe de pequeño tamaño (mmBERT-small) y ha sido ajustado mediante fine-tuning con datos sintéticos generados a partir del benchmark MultiWikiQHalluA. Su pipeline es de token-classification, lo que permite etiquetar cada token de una respuesta como alucinado o veraz.

El modelo aborda un problema crítico en la producción de sistemas de IA generativa: la verificación automática de la fidelidad de las respuestas frente a un contexto dado. Su relevancia radica en que ofrece una solución ligera y multilingüe para auditar contenido generado, especialmente en escenarios donde los modelos grandes no son viables por coste o latencia. Aunque la ficha oficial es escasa, el paper asociado describe una metodología de dos etapas: generación sintética de alucinaciones y fine-tuning a nivel de token.

Con 140 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace atractivo para integraciones en pipelines de validación en tiempo real. La variante `-pt` sugiere un enfoque específico para portugués, aunque el nombre "multi-wiki" indica un entrenamiento multilingüe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small, encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 4096 o 8192, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere portugues y multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un encoder transformer optimizado para eficiencia y velocidad. El tag `modernbert` en HuggingFace confirma esta base, aunque no se especifican detalles concretos como el número de capas o cabezas de atención. El nombre "mmBERT-small" indica que se trata de la variante pequeña y multilingüe de ModernBERT.

El entrenamiento sigue la metodología descrita en el paper "A multilingual hallucination benchmark: MultiWikiQHalluA". En una primera etapa, se genera un dataset sintético de alucinaciones mediante el framework LettuceDetect, que utiliza un modelo de lenguaje para producir respuestas con tokens etiquetados como alucinados o veraces a partir de contextos de Wikipedia. En la segunda etapa, se realiza un fine-tuning del modelo mmBERT-small sobre estos datos para la tarea de clasificación de tokens. No se dispone de información sobre hiperparámetros, número de tokens de entrenamiento ni técnicas adicionales como RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token: clasifica cada token de una respuesta como alucinado o no, lo que permite identificar fragmentos específicos problemáticos.
- Soporte multilingüe: el entrenamiento con datos de múltiples idiomas (según el nombre "multi-wiki" y las variantes publicadas para otros idiomas) sugiere capacidades multilingües, aunque no se detallan los idiomas exactos.
- Integración con pipelines de RAG: puede utilizarse como verificador posterior a la generación para señalar respuestas no fieles al contexto.
- Compatible con la librería transformers: se puede cargar con `AutoModelForTokenClassification` y usar en entornos estándar de HuggingFace.
- Eficiencia computacional: al ser un modelo pequeño, es adecuado para inferencia en CPU o GPUs de baja capacidad.

## Casos de uso

- Verificación de respuestas en sistemas RAG: el modelo puede procesar la salida de un sistema de recuperación y marcar los tokens que no se corresponden con el contexto recuperado, permitiendo a los desarrolladores filtrar o corregir respuestas automáticamente.
- Control de calidad en generación de contenido: en plataformas que generan resúmenes o artículos a partir de fuentes, este modelo puede auditar la fidelidad del texto generado y alertar sobre posibles invenciones.
- Auditoría de chatbots de atención al cliente: cuando un chatbot responde basándose en una base de conocimiento, el modelo puede señalar respuestas que se desvían de la información oficial, reduciendo el riesgo de proporcionar datos incorrectos.
- Evaluación de modelos generativos: los equipos de investigación pueden usar este clasificador como métrica automática para comparar la tendencia a alucinar de diferentes modelos o configuraciones.
- Filtrado en pipelines de datos: en la construcción de datasets de entrenamiento, se puede emplear para descartar ejemplos con alucinaciones, mejorando la calidad de los datos.
- Monitorización en producción: integrado en un servicio de inferencia, permite registrar y alertar sobre la tasa de alucinaciones en tiempo real, facilitando el mantenimiento de sistemas críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper "A multilingual hallucination benchmark: MultiWikiQHalluA" podría contener métricas, pero no se proporcionan en los datos facilitados.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 140M parámetros, la inferencia en FP32 requiere aproximadamente 0,56 GB de memoria. Con cuantización a 8 bits, se reduce a unos 0,14 GB, y a 4 bits, unos 0,07 GB. Puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050, RTX 2060 o superiores. También funciona en Apple Silicon y GPUs integradas.
- Despliegue: compatible con la librería `transformers` de HuggingFace, así como con `ONNX Runtime` para optimización en CPU. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, pero al ser un modelo encoder pequeño, puede servirse con frameworks como FastAPI o TorchServe.
- Latencia y throughput: no se dispone de datos medidos, pero en una CPU moderna se esperan tiempos de inferencia del orden de milisegundos por secuencia corta.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos equivalentes. El modelo pertenece a una categoría específica (detección de alucinaciones a nivel de token) y no se han identificado alternativas directas en la información proporcionada. Se podría mencionar que otros enfoques utilizan modelos generativos grandes con prompting para verificar hechos, pero no son comparables en arquitectura ni tamaño.

## Limitaciones y advertencias

- La model card oficial está prácticamente vacía, lo que impide conocer detalles sobre sesgos, datos de entrenamiento o limitaciones específicas.
- No se especifica la licencia, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo está entrenado para detectar alucinaciones en el contexto de Wikipedia y respuestas sintéticas; su rendimiento en otros dominios o tipos de texto puede ser inferior.
- Al ser un clasificador de tokens, no genera explicaciones sobre por qué un token es alucinado; solo proporciona etiquetas binarias.
- No se ha evaluado su robustez frente a ataques adversariales o textos fuera de distribución.
- La fecha de creación (2026) es futura, lo que sugiere que el modelo es muy reciente y puede tener una adopción limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-pt
- Paper asociado (arXiv): https://arxiv.org/pdf/2605.02504v2
- Variantes del modelo en otros idiomas (en, sq, fi, it) disponibles en el perfil de EuroEval en HuggingFace.
