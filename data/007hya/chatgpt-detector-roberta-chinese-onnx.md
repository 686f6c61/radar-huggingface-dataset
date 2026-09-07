# 007hya/chatgpt-detector-roberta-chinese-onnx

## Resumen

El repositorio `007hya/chatgpt-detector-roberta-chinese-onnx` contiene una exportación en formato ONNX del modelo `Hello-SimpleAI/chatgpt-detector-roberta-chinese`, un clasificador binario diseñado para distinguir texto generado por ChatGPT de texto escrito por humanos en chino. El modelo original fue desarrollado por Hello-SimpleAI y se basa en el checkpoint `hfl/chinese-roberta-wwm-ext`, entrenado sobre el dataset HC3 (Human ChatGPT Comparison Corpus) en su variante china.

La versión ONNX permite ejecutar el modelo sin necesidad de un framework de deep learning completo, facilitando su integración en aplicaciones ligeras, entornos de servidor sin GPU o sistemas embebidos. El repositorio es de tamaño reducido (0.1 GB), lo que sugiere pesos en precisión reducida o cuantización, aunque no se proporcionan detalles de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo RoBERTa/BERT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (segun el modelo original) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en la arquitectura RoBERTa, concretamente sobre el checkpoint `hfl/chinese-roberta-wwm-ext`. El entrenamiento se realizo sobre una mezcla de texto completo y oraciones divididas de respuestas del dataset HC3 en chino, que contiene pares de respuestas humanas y generadas por ChatGPT.

No se dispone de informacion sobre el numero de tokens de entrenamiento, el proceso de ajuste (fine-tuning) ni si se aplicaron tecnicas como RLHF o DPO. La conversion a ONNX fue realizada por el autor `007hya` y publicada en HuggingFace sin documentacion adicional.

## Capacidades

- Clasificacion binaria de texto en chino: distingue entre respuestas generadas por ChatGPT y respuestas humanas.
- Inferencia con ONNX Runtime, compatible con CPU y aceleradores mediante ejecucion estandarizada.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modos de razonamiento especiales.
- Sin capacidad multilingue: el modelo esta entrenado exclusivamente para chino.

## Casos de uso

- Deteccion de contenido generado por IA en foros chinos: permite identificar respuestas automaticas en comunidades online y filtrar spam o bots.
- Verificacion de autenticidad en trabajos academicos: puede usarse como herramienta auxiliar para detectar ensayos o tareas redactadas con ChatGPT en universidades chinas.
- Moderacion de contenido en plataformas de redes sociales: ayuda a marcar publicaciones generadas por IA para su revision manual.
- Control de calidad en encuestas y reviews: identifica opiniones falsas o generadas automaticamente en sistemas de reseñas.
- Analisis forense de conversaciones: util para investigadores que necesitan determinar si un corpus de chat fue producido por un modelo de lenguaje.
- Integracion en pipelines de NLP ligeros: gracias al formato ONNX, puede desplegarse en servidores sin GPU o en aplicaciones edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dada la arquitectura de aproximadamente 100 millones de parametros y el tamano del repositorio (0.1 GB).
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 10xx o superior) es suficiente; tambien funciona en CPU.
- Compatible con consumer GPU: si, en GPU de gama baja y media.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), Transformers.js para navegador, o cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|---|
| 007hya/chatgpt-detector-roberta-chinese-onnx | RoBERTa | no disponible | no disponible | chino | no disponible | ONNX |
| Hello-SimpleAI/chatgpt-detector-roberta-chinese | RoBERTa | no disponible | no disponible | chino | no disponible | PyTorch |
| Hello-SimpleAI/chatgpt-detector-roberta | RoBERTa | no disponible | no disponible | ingles | no disponible | PyTorch |

La comparativa se limita a caracteristicas generales, ya que no hay datos de benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede reflejar sesgos presentes en el dataset HC3, como preferencia por ciertos estilos de escritura o temas.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir falsos positivos o negativos en la deteccion.
- Limitaciones de idioma: entrenado exclusivamente en chino; su rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia no esta especificada, por lo que el uso comercial requiere verificacion previa con el autor.
- Caveat para produccion: sin documentacion de entrenamiento ni benchmarks, no se recomienda su uso en sistemas criticos sin una validacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/007hya/chatgpt-detector-roberta-chinese-onnx
- Modelo original en Inferix: https://inferix.co/models/Hello-SimpleAI/chatgpt-detector-roberta-chinese
- Modelo original en HuggingFace: https://huggingface.co/Hello-SimpleAI/chatgpt-detector-roberta-chinese
- Paper de referencia (HC3): https://arxiv.org/abs/2301.07597
- Proyecto GitHub de Hello-SimpleAI: https://github.com/Hello-SimpleAI/chatgpt-comparison-detection
