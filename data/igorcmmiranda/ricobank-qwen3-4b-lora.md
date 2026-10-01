# igorcmmiranda/Ricobank-Qwen3-4B-LoRA

## Resumen

Ricobank-Qwen3-4B-LoRA es un adaptador LoRA (no un modelo completo) entrenado por el usuario igorcmmiranda sobre el modelo base unsloth/Qwen3-4B. Se trata de un ajuste fino con QLoRA en 4 bits, rango 16 y alpha 32, orientado a un caso de estudio académico de una fintech ficticia denominada Ricobank. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), por lo que su uso requiere descargar y cargar por separado el modelo base Qwen3-4B.

El adaptador resuelve un problema acotado: especializar un modelo de 4.000 millones de parámetros en tareas de pregunta-respuesta del dominio financiero en portugués, empleando un conjunto de datos propio publicado por el mismo autor (igorcmmiranda/Ricobank-QnA). Al estar construido sobre Qwen3-4B, hereda la arquitectura transformer densa del base, su ventana de contexto y sus capacidades generales de razonamiento y generación de texto, a las que se superpone el comportamiento aprendido durante las 3 épocas de entrenamiento.

Su relevancia es fundamentalmente docente y experimental: sirve como ejemplo reproducible de un pipeline QLoRA con Unsloth, con hiperparámetros explícitos y script de carga incluido. No es un modelo de producción: no declara licencia, no publica evaluaciones, no tiene descargas ni interacciones en el momento de redactar esta ficha, y el propio autor lo etiqueta como uso educacional, advirtiendo de que sus respuestas no constituyen asesoramiento financiero.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (modelo base Qwen3-4B); el repositorio no contiene pesos completos, solo adaptadores PEFT |
| Parámetros totales | Adaptador: no disponible (rango 16, alpha 32). Modelo base Qwen3-4B: ~4.000 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de carga usa max_seq_length=2048. El base Qwen3-4B soporta 32.768 tokens nativos |
| Tipos de cuantización | Entrenado con QLoRA en 4 bits; cuantizaciones de inferencia del base no especificadas (el ejemplo usa load_in_4bit=True) |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible (el modelo base Qwen3-4B se distribuye bajo Apache 2.0, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un conjunto de adaptadores LoRA de bajo rango, no una red neuronal completa. La configuración declarada es QLoRA en 4 bits con rango 16, alpha 32, 3 épocas y tasa de aprendizaje 0,0002, entrenado con la librería Unsloth sobre unsloth/Qwen3-4B. El repositorio ocupa 0,1 GB, coherente con pesos de adaptador y no con un modelo de 4.000 millones de parámetros en precisión completa. No se indica el número de tokens de entrenamiento, el tamaño del conjunto Ricobank-QnA, la composición exacta del dataset, la longitud de secuencia usada durante el entrenamiento ni si se aplicaron fases posteriores de alineación como RLHF o DPO.

La arquitectura subyacente corresponde al modelo base Qwen3-4B: transformer denso con normalización RMSNorm, activación SwiGLU y atención con consultas agrupadas (GQA), con 36 capas, dimensión oculta de 2.560 y 32 cabezas de consulta frente a 8 de clave/valor, según la documentación pública de dicho modelo base. La ventana de contexto nativa del base es de 32.768 tokens, ampliable a 131.072 mediante YaRN, aunque el adaptador no documenta qué longitud se empleó en el ajuste. La innovación técnica destacable aquí no está en la arquitectura, sino en el método: el uso de Unsloth para reducir el coste de memoria del fine-tuning en 4 bits, y la publicación del dataset de dominio junto al adaptador, lo que permite reproducir el experimento completo.

## Capacidades

- Generación de texto y respuesta a preguntas en portugués, especializada en el dominio del caso académico Ricobank.
- Razonamiento y conocimiento general heredados del modelo base Qwen3-4B, incluyendo tareas de matemáticas y código elementales, aunque no se han evaluado tras el ajuste.
- Soporte de tool calling y function calling potencialmente heredado del base, sin verificar ni documentar en el adaptador.
- Capacidades multilingües limitadas: el ajuste se declara exclusivamente en portugués, por lo que el comportamiento en otros idiomas puede degradarse respecto al base.
- Modo de razonamiento del base Qwen3 disponible en teoría, pero no confirmado en el adaptador ni documentado en la model card.
- Capacidad de combinación o fusión con el modelo base para generar un modelo único, si se desea despliegue sin PEFT.
- Vision y audio: no soportados.

## Casos de uso

- Prototipo de asistente para atención al cliente en fintech portuguesa: el adaptador permite probar respuestas de dominio bancario sobre turnos cortos de conversación, con la ventana de 2.048 tokens usada en el ejemplo de carga como límite práctico.
- Docencia e investigación en ajuste eficiente: sirve como ejemplo reproducible de un pipeline QLoRA con Unsloth, hiperparámetros declarados y dataset público asociado, útil para comparar estrategias de fine-tuning de bajo rango.
- Generación de respuestas a preguntas frecuentes sobre productos financieros: el dataset Ricobank-QnA está formateado como pares pregunta-respuesta, el escenario más directamente alineado con el entrenamiento recibido.
- Enrutado y clasificación de consultas bancarias: uso como componente de triaje que asigna una consulta entrante a una categoría o departamento antes de derivarla a un sistema especializado.
- Ajuste incremental sobre dominio regulado con datos propios: el adaptador sirve de plantilla para reentrenar con datos internos reales, sustituyendo el dataset académico por documentación corporativa y manteniendo el mismo esquema de entrenamiento.
- Chatbot interno de soporte combinado con recuperación aumentada (RAG): el adaptador genera la respuesta final y el contexto documental se inyecta como prefijo, aprovechando el conocimiento del base para tareas de síntesis.
- Banco de pruebas para evaluación de sesgos y alucinación en modelos financieros: al no publicar evaluaciones, resulta adecuado como sujeto de pruebas controladas antes de considerarlo en cualquier flujo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones cuantitativas con el modelo base o con adaptadores alternativos.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco, en formato safetensors. No es autónomo; requiere el modelo base.
- Inferencia del base Qwen3-4B en 4 bits: en torno a 2,5-3 GB de pesos, más caché KV y activaciones. Con max_seq_length=2048, el pico de memoria se sitúa aproximadamente entre 4 y 6 GB de VRAM.
- Inferencia del base en bf16/fp16: alrededor de 8 GB de pesos, con picos de 10-12 GB según longitud de contexto y tamaño de lote.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, RTX 4090. En 4 bits cabe holgadamente en cualquier GPU con 8 GB o más.
- GPU profesionales: A100 40/80 GB, H100, L40S y T4 16 GB para despliegues multiusuario.
- Opciones de despliegue: transformers + PEFT con el script del autor, vLLM con soporte de adaptadores LoRA, TGI, SGLang, y llama.cpp/Ollama tras fusionar el adaptador con el base y exportar a GGUF (Unsloth ofrece utilidades para ello).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ricobank-Qwen3-4B-LoRA | Adaptador sobre base de ~4.000 M | No especificado (ejemplo a 2.048; base a 32.768) | Sin datos publicados | No disponible | HuggingFace, 0 descargas |
| Qwen3-4B (base/instruct) | ~4.000 M | 32.768 nativos, 131.072 con YaRN | Benchmarks públicos en la model card original | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Gemma-3-4B-it | ~4.000 M | 128.000 tokens | Benchmarks públicos en la model card original | Términos de uso de Gemma | HuggingFace |
| Llama-3.2-3B-Instruct | ~3.000 M | 128.000 tokens | Benchmarks públicos en la model card original | Licencia comunitaria de Llama 3.2 | HuggingFace |

La comparación directa con el base Qwen3-4B es el punto de referencia más relevante: cualquier mejora o degradación introducida por el adaptador debería medirse contra él, algo que el repositorio no hace.

## Limitaciones y advertencias

- No se declara licencia para el adaptador. Esto impide determinar si su uso comercial está permitido, con independencia de que el modelo base sea Apache 2.0.
- El repositorio no publica ninguna evaluación, por lo que no hay evidencia cuantitativa de que el ajuste mejore al base en el dominio objetivo; podría incluso degradarlo.
- Sesgos conocidos: no documentados. Al no haber evaluación, no se han caracterizado sesgos de género, origen o condición socioeconómica en las respuestas.
- Riesgo de alucinación: elevado en el dominio financiero, donde el modelo puede generar cifras, condiciones de productos o normativas inexistentes. El propio autor advierte que las respuestas no constituyen asesoramiento financiero.
- Limitación de idioma: el ajuste se declara solo en portugués. El rendimiento en castellano, inglés u otros idiomas no está documentado y puede diferir del base.
- Limitación de contexto: el ejemplo de carga fija max_seq_length=2048, muy por debajo de la ventana nativa del base. No se indica si el adaptador conserva el rendimiento en contextos largos.
- Conjunto de datos de origen académico y sobre una entidad ficticia: los datos no reflejan regulación, productos ni terminología de una entidad real, lo que limita su transferencia directa a producción.
- Sin mantenimiento aparente: creado y actualizado el mismo día (1 de octubre de 2026), sin descargas ni interacciones. No hay garantía de soporte, correcciones ni versiones posteriores.
- Reproducibilidad parcial: se publican hiperparámetros y dataset, pero no el número de tokens de entrenamiento, la semilla, la longitud de secuencia ni el entorno exacto de ejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igorcmmiranda/Ricobank-Qwen3-4B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/igorcmmiranda/Ricobank-QnA
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; el único resultado obtenido fue una página de Pinterest sin relación con el contenido.
