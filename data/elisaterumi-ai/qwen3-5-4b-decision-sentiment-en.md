# elisaterumi-ai/Qwen3.5-4B-Decision-Sentiment-EN

## Resumen

Qwen3.5-4B-Decision-Sentiment-EN es un adaptador LoRA (PEFT) publicado por elisaterumi-ai sobre el modelo base unsloth/Qwen3.5-4B. Se trata de un ajuste fino orientado a tareas de decisión y análisis de sentimiento en inglés, según indica el propio identificador del repositorio. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo, por lo que requiere cargar el modelo base para su uso.

El modelo hereda la arquitectura y las capacidades del Qwen3.5-4B original, un transformer de 4.000 millones de parámetros, pero no se dispone de información publicada sobre la composición del dataset de ajuste, los hiperparámetros de entrenamiento ni los resultados de evaluación. La model card del autor es una plantilla sin rellenar, con todos los campos marcados como "[More Information Needed]".

Su relevancia es limitada en el estado actual: no registra descargas ni interacciones, no declara licencia ni idiomas soportados, y carece de documentación técnica verificable. Resulta adecuado únicamente como experimento reproducible para quien quiera evaluar el adaptador por su cuenta, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); adaptador LoRA sobre atención y/o proyecciones |
| Parametros totales | 4B en el modelo base; tamaño del adaptador no disponible (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite las soportadas por transformers/unsloth (no confirmado) |
| Idiomas soportados | no disponible; el sufijo "EN" sugiere orientación al inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers, unsloth |
| Modelo base | unsloth/Qwen3.5-4B |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre unsloth/Qwen3.5-4B, una variante del modelo Qwen3.5 de 4.000 millones de parámetros distribuida por Unsloth, presumiblemente optimizada para entrenamiento e inferencia eficientes. El adaptador es de tipo LoRA (Low-Rank Adaptation) y se carga mediante la librería PEFT, lo que implica que congela los pesos del modelo base e inyecta matrices de bajo rango en capas seleccionadas. No se especifican el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleados.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica adicional. El nombre del repositorio sugiere un ajuste orientado a clasificación de decisiones y sentimiento en inglés, pero se desconoce si se empleó un dataset propio, público o sintético. Tampoco se documenta la infraestructura de cómputo ni el impacto ambiental.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Clasificación de sentimiento y apoyo a decisiones, según el propósito inferido del nombre del adaptador (no verificado con evaluación publicada).
- Razonamiento y respuesta multi-turno en la medida en que lo permita el modelo base.
- Soporte de tool calling y function calling: no confirmado para este adaptador; depende de las capacidades del base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Multilingüismo: no documentado; el sufijo "EN" apunta a un uso principal en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el adaptador puede aplicarse sobre el modelo base para clasificar opiniones positivas, negativas o neutras en inglés, siempre que se valide su precisión con un conjunto de evaluación propio antes de usarlo.
- Triaje de tickets de soporte: usar el adaptador para etiquetar el tono y la urgencia de mensajes entrantes en inglés y priorizar colas de atención, con revisión humana en los casos ambiguos.
- Moderación de comentarios: clasificación preliminar del sentimiento de comentarios en foros o redes para filtrar contenido hostil, combinándolo con reglas adicionales dado que no hay métricas publicadas de falsos positivos.
- Investigación académica sobre LoRA: servir como ejemplo reproducible de adaptador PEFT sobre Qwen3.5-4B para estudiar el efecto del ajuste fino en tareas de clasificación.
- Prototipado rápido de asistentes de decisión: integrar el adaptador en un pipeline de transformers para experimentar con respuestas orientadas a recomendaciones en inglés, sin compromiso de producción.
- Evaluación comparativa interna: emplearlo como baseline en pruebas A/B frente a otros adaptadores o al modelo base sin ajustar, midiendo la mejora real en la tarea de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16: aproximadamente 8 GB solo para pesos; en cuantización de 4 bits, alrededor de 2,5-3 GB, más overhead de contexto y activaciones. Cifras orientativas, no confirmadas para este adaptador.
- El adaptador LoRA en sí ocupa 0,2 GB y se suma a los requisitos del base.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB) o A100/H100 con holgura; para cuantización 4 bits, tarjetas consumer de 8-12 GB como RTX 3060/4060 Ti o superiores.
- Cabe en GPU consumer: sí, presumiblemente en modelos con 8 GB o más usando cuantización, aunque no hay confirmación del autor.
- Opciones de despliegue: transformers + peft (ruta oficial del repo), integración con unsloth para carga eficiente; vLLM, llama.cpp u Ollama requerirían fusionar el adaptador con el base y convertir a GGUF, procedimiento no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| elisaterumi-ai/Qwen3.5-4B-Decision-Sentiment-EN | 4B (base) + LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador sin documentación ni evaluación |
| unsloth/Qwen3.5-4B | 4B | no disponible | no disponible | safetensors | Modelo base sin ajuste; referencia directa |
| Adaptadores LoRA públicos sobre Qwen de 4B | 4B (base) | depende del base | variable | safetensors (PEFT) | Alternativas genéricas; requieren verificar licencia y evaluación |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla sin rellenar, sin detalles de entrenamiento, datos ni evaluación.
- Licencia no declarada: no es posible determinar si se permite uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: el sufijo "EN" sugiere un sesgo hacia el inglés, con posible degradación en castellano u otros idiomas.
- Riesgo de alucinación y de clasificación errónea no cuantificado: sin benchmarks ni métricas de validación, no hay garantías de precisión en la tarea de sentimiento.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no pueden evaluarse sesgos de género, raza o ideología.
- Dependencia del modelo base: cualquier limitación de contexto, licencia o comportamiento de Qwen3.5-4B se hereda.
- Sin tracción comunitaria (0 descargas, 0 likes) ni mantenimiento conocido; el repositorio podría quedar obsoleto o eliminado.
- No apto para producción sin una evaluación propia exhaustiva y sin aclaración de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elisaterumi-ai/Qwen3.5-4B-Decision-Sentiment-EN
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Librería PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado: https://arxiv.org/abs/1910.09700
