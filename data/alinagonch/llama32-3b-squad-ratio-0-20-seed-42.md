# AlinaGonch/llama32-3b-squad-ratio-0.20-seed-42

## Resumen

El modelo AlinaGonch/llama32-3b-squad-ratio-0.20-seed-42 es un ajuste fino (fine-tuning) de la familia Llama 3.2 de 3 mil millones de parámetros, especializado en respuesta a preguntas sobre el dataset SQuAD (Stanford Question Answering Dataset). El nombre indica que se utilizó un ratio de muestreo del 20 % de los datos y una semilla aleatoria de 42. Aunque la model card es prácticamente vacía, los tags (safetensors, arxiv:1910.10100) y el nombre permiten inferir que se trata de un modelo de comprensión lectora extractiva en inglés.

El repositorio tiene un tamaño de 0.1 GB, lo que resulta inusualmente pequeño para un modelo de 3B de parámetros (en fp16 ocuparía ~6 GB), lo que sugiere que o bien se han subido solo algunos archivos (por ejemplo, un checkpoint parcial) o que se trata de una versión cuantizada. No se declara licencia, autor más allá del nombre de usuario, ni datos de entrenamiento detallados. La relevancia de este modelo es limitada por la falta de documentación, aunque puede servir como punto de partida para experimentos de QA en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido de Llama 3.2) |
| Parametros totales | 3.2 mil millones (inferido del nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (inferido de Llama 3.2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (por el dataset SQuAD; Llama 3.2 soporta otros idiomas, pero el ajuste es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del modelo indica que la base es Llama 3.2 3B, una arquitectura transformer decoder-only con atención de consulta agrupada (GQA) y ventana de contexto de 128K tokens. El fine-tuning se realizó sobre el dataset SQuAD, probablemente la versión 2.0, dado el tag arXiv:1910.10100 que corresponde al paper de SQuAD 2.0. El parámetro `ratio-0.20` sugiere que se utilizó una muestra del 20 % de las instancias del dataset, y `seed-42` fija la semilla de aleatoriedad para la partición. No se ha publicado información sobre el procedimiento de entrenamiento, hiperparámetros, número de épocas ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Respuesta a preguntas extractivas: dado un pasaje de texto y una pregunta, el modelo extrae el fragmento del pasaje que responde a la pregunta.
- Generación de texto general (heredado de la base Llama 3.2), aunque el ajuste en SQuAD puede degradar su rendimiento en tareas abiertas.
- Comprensión lectora en inglés, con capacidad limitada en otros idiomas debido al dataset de entrenamiento.
- No se ha indicado soporte para tool calling, agentes, vision ni audio.

## Casos de uso

- Extracción de respuestas en documentos: el modelo puede recibir un pasaje (por ejemplo, un contrato o un informe) y responder preguntas concretas extrayendo el texto relevante.
- Sistemas de preguntas y respuestas sobre una base de conocimiento: integrarlo en un pipeline de RAG para responder consultas de usuarios a partir de documentos corporativos.
- Evaluación de técnicas de comprensión lectora: al ser un modelo pequeño (3B), es útil como punto de partida para probar métodos de fine-tuning o cuantización antes de escalar a modelos mayores.
- Herramientas educativas: generar preguntas y respuestas sobre textos de estudio, aunque con limitaciones en otros idiomas.
- Análisis de datos en el sector legal: localizar cláusulas específicas en documentos largos, siempre que el contexto se ajuste a la ventana del modelo.
- Prototipos de atención al cliente: responder preguntas frecuentes a partir de manuales de producto, mediante la extracción de respuestas literales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio (0.1 GB) es inusualmente pequeño para un modelo de 3B de parámetros; es probable que el checkpoint esté cuantizado o que solo se hayan subido algunos archivos (por ejemplo, el config y los pesos en una precisión reducida).
- Para inferencia en fp16, un modelo de 3B requiere aproximadamente 6 GB de VRAM; en cuantización 8-bit, ~3 GB; en 4-bit, ~1.5 GB.
- GPUs recomendadas: RTX 3090, RTX 4090 o A100/H100 para ejecución en fp16. En cuantización 4-bit, puede caber en GPUs consumer de 4 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o Hugging Face TGI, siempre que el checkpoint sea compatible.
- La latencia estimada para un modelo de 3B en una GPU moderna es del orden de decenas de tokens por segundo, pero no se han medido valores concretos.

## Comparativa con modelos similares

No disponible. No se ha identificado en la información proporcionada modelos comparables de la misma categoría (fine-tuning de Llama 3.2 sobre SQuAD).

## Limitaciones y advertencias

- La licencia no está declarada; no se puede garantizar su uso comercial.
- El fine-tuning en SQuAD limita la capacidad de generalización a dominios fuera de la respuesta a preguntas extractivas en inglés.
- Riesgo de alucinaciones si la pregunta no tiene respuesta en el texto, ya que el modelo podría extraer un fragmento incorrecto.
- El tamaño del repositorio es inusualmente pequeño, lo que sugiere que el checkpoint puede estar incompleto o cuantizado; hay que verificar su integridad antes de usarlo.
- No se ha documentado el procedimiento de entrenamiento, por lo que se desconocen los sesgos del dataset y las posibles limitaciones técnicas.
- La ventana de contexto real del modelo no está confirmada, ya que depende de la implementación de la base Llama 3.2 y de si se ha modificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.20-seed-42
- Paper SQuAD 2.0 (arXiv:1910.10100): https://arxiv.org/abs/1910.10100
