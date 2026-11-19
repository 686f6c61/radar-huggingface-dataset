# Charlie320/zils-mini-mw

## Resumen

zils-mini-mw es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario Charlie320 y publicado bajo licencia Apache-2.0. Forma parte del ecosistema Zils, concretamente del pool de modelos tipo "soup" denominado d3-mini asociado a la subnet 127 de Bittensor. El modelo se presenta como un "body" (cuerpo) destinado a tareas de decisión, con pesos en BF16 y un tower de visión heredado del modelo padre.

El modelo parte de joamCriff123/zils-mini-m1115 como punto de arranque y se construye mediante la técnica de model soup: dos ajustes finos LoRA (rank 64, fusionados) con semillas distintas, cada uno con una pasada sobre 68.961 filas de datos, promediados uniformemente con pesos iguales. El resultado es un modelo de aproximadamente 4.539 millones de parámetros (4,54B) orientado a tareas de clasificación y decisión estructurada, no a generación libre de texto.

La relevancia de este modelo radica en su enfoque especializado: en lugar de optimizar para generación conversacional, se entrena con objetivos suaves (soft targets) para tareas de decisión tipo examen, incluyendo items de tool-calling, razonamiento y comparación semántica. Su publicación bajo Apache-2.0 lo hace potencialmente utilizable en entornos comerciales, aunque con las cautelas propias de un modelo derivado de un base_model de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B, con tower de visión heredado) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,54B parámetros. Incluye un tower de visión heredado del modelo padre, lo que sugiere capacidades multimodales de entrada, aunque la model card no detalla el funcionamiento de dicho componente ni su integración en las tareas de decisión. Los pesos se publican en BF16 y el repositorio ocupa 9,1 GB.

El entrenamiento consistió en dos ajustes finos LoRA de rank 64 (posteriormente fusionados) sobre el modelo joamCriff123/zils-mini-m1115, cada uno con una semilla distinta y una pasada barajada sobre 68.961 filas, con tasa de aprendizaje 5e-5. Los dos adaptadores se promediaron uniformemente con pesos iguales (model soup). Los objetivos de entrenamiento fueron suaves: para los items de examen escritos, tres cuartas partes de la respuesta propia del item y una cuarta parte de las probabilidades del modelo de arranque; para los items de aritmética y similitud semántica escritos (4.093 filas), solo las probabilidades del modelo de arranque por considerarse poco fiables sus respuestas escritas; para las filas de tasksource-jev, mitad etiqueta propia y mitad probabilidades del arranque; y para los items de examen semilla públicos, sus etiquetas publicadas.

Los datos de entrenamiento se componen de tres fuentes: aproximadamente 31.100 items de decisión en formato examen (incluyendo unos 1.100 items de tool-calling extraídos de las filas 90.000-93.000 del subconjunto de function-calling de glaiveai/glaive-function-calling-v2), 30.000 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions (solo fuentes con licencia comercial o no especificada, excluyendo no comerciales y tareas cuyo nombre coincide con BIG-bench), y 787 items de los exámenes semilla públicos de Zils (zils-ai/base-exam-seed-v1 a v4) repetidos diez veces cada uno. No se usaron items de exámenes de validadores ni datos de clientes.

## Capacidades

- Clasificación y decisión estructurada: el modelo está entrenado específicamente para responder items en formato examen con etiquetas discretas, no para generación libre de texto.
- Tool calling / function calling: incluye aproximadamente 1.100 items de entrenamiento específicos de llamada a herramientas, lo que le confiere capacidad para seleccionar y estructurar llamadas a funciones.
- Razonamiento aritmético y comparación semántica: entrenado con items de aritmética escrita y similitud de frases, aunque con objetivos basados en el modelo de arranque por baja fiabilidad de las respuestas escritas.
- Capacidades multimodales: hereda el tower de visión del modelo padre Qwen/Qwen3.5-4B, aunque la model card no detalla su funcionamiento ni su uso previsto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Evaluación automática de decisiones en pipelines de agentes: el modelo puede integrarse como clasificador de decisiones intermedias (selección de herramienta, elección de acción) en sistemas multi-paso, aprovechando sus items de entrenamiento de tool-calling para decidir qué función invocar y con qué argumentos.
- Enrutamiento de consultas en atención al cliente: dado un mensaje de usuario, el modelo puede clasificar la intención o categoría de la consulta para dirigirla al departamento o flujo adecuado, gracias a su entrenamiento en items de decisión con etiquetas discretas.
- Validación de respuestas en sistemas RAG: puede usarse como juez o clasificador para decidir si una respuesta generada por otro modelo es correcta, relevante o requiere reformulación, apoyándose en su entrenamiento con objetivos suaves de comparación semántica.
- Clasificación de similitud semántica: útil para tareas de deduplicación, detección de paráfrasis o matching de documentos, dado que fue entrenado con items de similitud de frases (aunque con las cautelas indicadas sobre la fiabilidad de esas respuestas).
- Filtrado y moderación de contenido estructurado: el modelo puede clasificar textos en categorías predefinidas de decisión, lo que permite usarlo como componente de moderación o triaje en aplicaciones de contenido.
- Investigación en model soups y ajuste fino con objetivos suaves: sirve como caso de estudio reproducible para investigadores interesados en técnicas de promediado de LoRAs, entrenamiento con soft targets y evaluación en formato examen dentro del ecosistema Bittensor/Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB para pesos, más overhead; viable en GPUs consumer de gama alta.
- VRAM estimada en cuantización de 4 bits: alrededor de 3-4 GB para pesos, más overhead; viable en GPUs consumer de gama media.
- GPUs recomendadas: A100, H100 o L40S para despliegue en BF16 con alto throughput; RTX 4090 (24 GB) para BF16 en single-GPU; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantización (sujeto a disponibilidad de pesos GGUF, no confirmada en el repositorio).
- Opciones de despliegue: vLLM, TGI o transformers para BF16; llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repositorio según la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-mw | 4,54B | no disponible | Apache-2.0 | Decisión/clasificación (fine-tune de Qwen3.5-4B) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | ~4B | no disponible | no disponible en la información | Generación general y multimodal (modelo base) | Hugging Face (modelo base) |
| joamCriff123/zils-mini-m1115 | no disponible | no disponible | Apache-2.0 (según model card) | Decisión (modelo de arranque del soup) | Hugging Face |

La comparativa con alternativas de la misma categoría (modelos de decisión especializados de ~4B) no está disponible en la información proporcionada. El modelo base Qwen/Qwen3.5-4B es la referencia más directa, pero no se dispone de sus especificaciones completas ni de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo especializado en decisiones: no está diseñado para generación libre de texto ni conversación abierta; su uso fuera de tareas de clasificación o decisión puede producir resultados pobres.
- Objetivos de entrenamiento suaves: parte de los targets provienen de las probabilidades del modelo de arranque, lo que puede propagar sesgos o errores del modelo predecesor (joamCriff123/zils-mini-m1115).
- Fiabilidad limitada en aritmética y similitud semántica: la model card reconoce que las respuestas escritas de esos items "proved unreliable", por lo que el modelo puede fallar en cálculos y comparaciones finas.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-4B y de datasets públicos, puede heredar sesgos de dichas fuentes.
- Riesgo de alucinación: no cuantificado; en tareas de decisión el riesgo se manifiesta como etiquetas incorrectas más que como texto inventado.
- Idiomas: no se especifican los idiomas soportados; la mayor parte de los datos de entrenamiento parece estar en inglés, lo que limita su uso en castellano sin evaluación previa.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen/Qwen3.5-4B y de joamCriff123/zils-mini-m1115; deben verificarse las condiciones de los modelos base y de los datasets de entrenamiento (glaive-function-calling-v2, tasksource-jev) antes de su reutilización comercial.
- Sin validación externa: 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción ni evaluaciones independientes.
- Sin datos de contexto ni de cuantizaciones publicadas: dificulta la planificación de despliegue y la estimación de costes.
- Repositorio solo de pesos: no incluye código de inferencia ni configuración de despliegue; la model card advierte de que se consulten los términos de los datasets de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-mw
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de arranque joamCriff123/zils-mini-m1115: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Exámenes semilla Zils (zils-ai/base-exam-seed-v1 a v4): https://huggingface.co/zils-ai
