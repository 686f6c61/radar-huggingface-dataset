# Asger365/Huihui-Qwen3.8-27B-abliterated

## Resumen

Huihui-Qwen3.8-27B-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.8-27B, publicada por el usuario Asger365 como reempaquetado del trabajo original del colectivo huihui-ai. El modelo parte de una arquitectura Qwen3 de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamaño de repositorio de 55,6 GB. La pipeline declarada es image-text-to-text, lo que indica que el modelo base conserva capacidades multimodales de entrada de imagen, aunque la model card aclara que la torre visual no ha sido modificada por el proceso de abliteration.

La técnica de abliteration consiste en identificar y suprimir direcciones de activación asociadas a comportamientos de rechazo, de modo que el modelo deja de negarse a responder a determinadas peticiones. En esta versión concreta solo se han ablacionado las capas 18 a 51, mientras que las 15 primeras capas permanecen intactas, con el objetivo declarado de preservar mejor el rendimiento original. Tampoco se han modificado los componentes MTP (multi-token prediction) ni la parte visual.

El interés del modelo es acotado pero específico: sirve como banco de pruebas para investigadores que estudian alineamiento, refusal behavior y robustez de salvaguardas en modelos multimodales de gran tamaño, así como para experimentos que requieren un modelo base sin filtros de contenido. No es un modelo recomendado para despliegues de producción orientados al público general. El autor original del método es huihui-ai, y la implementación se apoya en la herramienta remove-refusals-with-transformers de Sumandora.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, tag `qwen3_5`), multimodal image-text-to-text; incluye componentes MTP |
| Parámetros totales | 27.781.427.952 (≈27,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada; existe una variante GGUF publicada por huihui-ai |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); variante GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3 con aproximadamente 27,8 mil millones de parámetros, derivado directamente de Qwen/Qwen3.8-27B. La pipeline image-text-to-text y la mención explícita a un componente visual en la model card confirman que se trata de un modelo multimodal con entrada de imagen, aunque no se detalla la arquitectura del encoder visual ni su resolución de entrada. La referencia a MTP (multi-token prediction) sugiere que el modelo base incorpora cabezas de predicción multi-token, probablemente para acelerar la decodificación.

El proceso de modificación es una abliteration aplicada con la herramienta remove-refusals-with-transformers, que calcula direcciones de rechazo a partir de contrastes de activaciones y las proyecta fuera de los pesos. En esta revisión solo se ablacionaron las capas 18 a 51; las capas 0 a 14 quedaron sin tocar, y ni el módulo MTP ni la torre visual fueron alterados. No se dispone de información sobre el dataset de entrenamiento original de Qwen3.8-27B, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO, más allá de lo que publique el modelo base. La model card tampoco documenta evaluaciones del impacto de la abliteration sobre las capacidades del modelo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.
- Procesamiento de entradas de imagen combinadas con texto (image-text-to-text), con la torre visual sin modificar respecto al original.
- Razonamiento y matemáticas: capacidades propias del modelo base, no cuantificadas en la información disponible.
- Generación de código: presumiblemente soportada por el modelo base, sin datos específicos publicados para esta variante.
- Modo "thinking": la model card incluye lógica de streaming que detecta el token `</think>`, lo que indica soporte de modo de razonamiento extendido en el modelo base.
- Predicción multi-token (MTP) conservada del modelo original, potencialmente útil para decodificación especulativa.
- Supresión de rechazos: el modelo no aplica los mecanismos de negativa del modelo original en las capas ablacionadas.
- Tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y refusal behavior: el modelo permite estudiar qué capas concentran las direcciones de rechazo y cómo varía el comportamiento al ablacionar solo el rango 18-51, sirviendo como caso control frente a abliterations completas.
- Evaluación de robustez de salvaguardas: equipos de seguridad pueden medir la eficacia de filtros externos (guardrails, clasificadores de salida) sobre un modelo deliberadamente sin rechazos internos.
- Red teaming controlado: útil para generar respuestas que un modelo alineado bloquearía, dentro de un entorno de laboratorio y con revisión humana, para construir datasets de evaluación de seguridad.
- Experimentos de interpretabilidad multimodal: al conservar intacta la torre visual, permite analizar cómo interactúan las representaciones visuales con las capas ablacionadas en tareas image-text-to-text.
- Benchmarking de técnicas de abliteration: comparar esta variante parcial (capas 18-51) con la versión previa (que ablacionaba desde la capa 15) para medir la degradación de capacidades según la profundidad de la intervención.
- Pruebas de decodificación especulativa: el componente MTP preservado permite experimentar con decodificación multi-token en un modelo de 27,8 B sin necesidad de un modelo draft separado.
- Fine-tuning sobre dominio sin restricciones de rechazo: investigadores que necesitan un punto de partida que no introduzca sesgo de negativa en dominios legítimos pero sensibles (por ejemplo, ficción violenta o análisis de contenido dañino), siempre con salvaguardas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de daño o tasa de rechazo antes y después de la abliteration, ni comparaciones con el modelo base Qwen/Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan 60-70 GB para inferencia cómoda con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB de pesos, viable en una RTX 5090 (32 GB) o A100 40 GB con contexto limitado.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 15-17 GB de pesos, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto reducido.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 sin cuantizar; A100 40 GB o L40S para 8 bits; RTX 4090/3090 para GGUF de 4-5 bits.
- Cabe en GPU de consumo: sí, en formato GGUF cuantizado a 4 bits en GPUs de 24 GB; en bfloat16 completo no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (con `trust_remote_code=True`, tal como muestra la model card), llama.cpp y Ollama (existe la etiqueta `huihui_ai/Qwen3.8-abliterated` en el registro de Ollama), y presumiblemente vLLM y TGI para el formato safetensors, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles. La model card incluye código de instrumentación para medir latencia del primer token y tokens por segundo, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Asger365/Huihui-Qwen3.8-27B-abliterated | 27,8 B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Abliteration parcial (capas 18-51), MTP y visión intactos |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,8 B | no disponible | Sí | Apache 2.0 | Versión original de huihui-ai; revisiones previas ablacionaban desde la capa 15 |
| Qwen/Qwen3.8-27B | 27,8 B | no disponible | Sí | Apache 2.0 | Modelo base alineado, con rechazos intactos |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,8 B | no disponible | Sí | Apache 2.0 | Misma variante en formato GGUF para llama.cpp/Ollama |

## Limitaciones y advertencias

- La abliteration suprime los rechazos en las capas 18-51, pero no elimina necesariamente todos los comportamientos de negativa; el comportamiento residual en capas tempranas y en la torre visual no está documentado.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito sin las salvaguardas del modelo original; requiere filtrado externo obligatorio en cualquier uso con usuarios finales.
- La supresión de direcciones de rechazo puede degradar capacidades generales (razonamiento, instrucciones, coherencia), y no se han publicado evaluaciones que cuantifiquen esa degradación.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen3.8-27B, que tampoco se detallan.
- Riesgo de alucinación: no evaluado para esta variante; se asume similar o potencialmente superior al modelo base tras la intervención en pesos.
- Idiomas soportados: no disponibles; no se puede confirmar el grado de multilingüismo tras la modificación.
- Longitud de contexto: no disponible; planificar el despliegue sin asumir una ventana concreta.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- El repositorio pertenece a un usuario individual (Asger365) con 0 descargas y 0 likes en el momento de la ficha, y el modelo base Qwen3.8-27B no es verificable en la información proporcionada; conviene contrastar la procedencia antes de usarlo.
- El código de ejemplo de la model card usa `AutoModelForCausalLM` con `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; revisar los ficheros antes de cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Asger365/Huihui-Qwen3.8-27B-abliterated
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Variante GGUF: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Repositorio de Ollama (releases): https://github.com/ollama/ollama/releases
