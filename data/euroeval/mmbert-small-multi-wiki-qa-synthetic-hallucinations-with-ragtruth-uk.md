# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-uk

## Resumen

mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-uk es un modelo de clasificación de tokens desarrollado por EuroEval, una iniciativa europea de evaluación de modelos de lenguaje. Su función principal es detectar alucinaciones en respuestas generadas por sistemas de retrieval-augmented generation (RAG), etiquetando a nivel de token si cada fragmento de la respuesta es fiel al contexto proporcionado o si se ha inventado. El modelo pertenece a una familia multilingüe (existen versiones para inglés, italiano, feroés, ucraniano, entre otros) y se basa en la arquitectura ModernBERTa, con 140 millones de parámetros. Su relevancia actual reside en que ofrece una herramienta de verificación automática de calidad para asistentes y pipelines de RAG, un problema crítico en producción donde las respuestas incorrectas pueden erosionar la confianza del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere multilingüe; versiones para en, uk, fo, it, etc.) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERTa, una evolución del encoder BERT optimizada para eficiencia y velocidad de inferencia. Está entrenado mediante fine-tuning para clasificación de tokens, con el objetivo de asignar a cada token de una respuesta generada una etiqueta que indica si es fiel al contexto recuperado o si constituye una alucinación. El proceso de entrenamiento se apoya en un pipeline de generación de datos sintéticos descrito en el paper MultiWikiHalluA (arXiv:2605.02504v2): se construyen contextos, preguntas y respuestas de referencia a partir de Wikipedia multilingüe, y un framework llamado LettuceDetect genera respuestas con alucinaciones anotadas a nivel de token. El fine-tuning se realiza sobre mmBERT-small, que es la versión compacta de ModernBERTa. No se han publicado detalles sobre el volumen exacto de datos, el número de épocas o el régimen de entrenamiento.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas QA generadas con contexto RAG.
- Clasificación binaria por token: fiel al contexto o alucinado.
- Soporte multilingüe, con modelos separados para distintos idiomas (en, uk, it, fo, etc.).
- Compatible con la librería transformers de HuggingFace para integración directa en pipelines de evaluación.
- Diseñado específicamente para escenarios de retrieval-augmented generation, donde el contexto proporcionado es la fuente de verdad.
- No es un modelo generativo; su función es exclusivamente de análisis y etiquetado.

## Casos de uso

- Auditoría de respuestas en chatbots de soporte: el modelo etiqueta automáticamente si una respuesta contiene información no respaldada por la base de conocimiento, permitiendo a los equipos de calidad rechazar respuestas no fiables antes de que lleguen al usuario.
- Evaluación de pipelines RAG: integrado como componente de evaluación, mide la tasa de alucinación de un sistema de generación aumentada por recuperación, ayudando a comparar configuraciones de recuperación y generación en distintos idiomas.
- Filtrado en dominios críticos (salud, legal): en aplicaciones donde la precisión es esencial, el modelo marca fragmentos que no se corresponden con las fuentes consultadas, alertando a revisores humanos.
- Investigación sobre alucinaciones: sirve como herramienta para anotar datasets de entrenamiento y para evaluar la eficacia de técnicas de mitigación de alucinaciones en LLMs.
- Control de calidad en resúmenes automáticos: aplicado a resúmenes generados a partir de artículos, verifica que el contenido no se invente datos ausentes en el texto fuente.
- Monitorización de asistentes de voz: el modelo se ejecuta en paralelo al generador para detectar alucinaciones en respuestas habladas y activar respuestas de respaldo cuando se detecta una desviación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2605.02504v2) describe la metodología de generación de datos y el fine-tuning, pero no se incluyen tablas de métricas comparativas. Se recomienda consultar la publicación para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (140M × 4 bytes), alrededor de 0,3 GB en fp16. Con activaciones y memoria intermedia, cabe en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM es suficiente; también funciona correctamente en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace, exportable a ONNX para aceleración con TensorRT u ONNX Runtime.
- Latencia: al ser un modelo de 140M parámetros, la inferencia por muestra es del orden de milisegundos en GPU y de decenas de milisegundos en CPU moderna.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de detección de alucinaciones a nivel de token con la misma base arquitectónica y enfoque multilingüe en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide determinar si el uso comercial es permitido sin consulta previa.
- El modelo se ha entrenado con datos sintéticos generados por LLM, lo que puede introducir sesgos y no cubrir la diversidad de alucinaciones que ocurren en interacciones reales.
- La longitud de contexto no está documentada; los modelos ModernBERTa suelen manejar secuencias de 512 o 1024 tokens, pero no se confirma.
- Los idiomas soportados no se listan explícitamente; la versión -uk está destinada a ucraniano, pero la familia multilingüe no está completamente documentada.
- No hay resultados de benchmarks publicados, por lo que el rendimiento esperado en casos de uso reales no está validado.
- El modelo está limitado a la detección de alucinaciones en respuestas QA; no es aplicable a otros tipos de generación de texto sin reentrenamiento.

## Enlaces

- [HuggingFace - EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-uk](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-uk)
- [Paper - A multilingual hallucination benchmark: MultiWikiQHalluA](https://arxiv.org/pdf/2605.02504v2)
- [EuroEval - The robust European language model benchmark](https://euroeval.com/)
