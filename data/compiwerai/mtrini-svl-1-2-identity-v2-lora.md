# CompiwerAI/Mtrini-SVL-1.2-Identity-v2-LoRA

## Resumen

Mtrini-SVL-1.2-Identity-v2-LoRA es un adaptador LoRA publicado por el usuario CompiwerAI sobre el modelo base Qwen/Qwen3-VL-8B-Instruct. Se distribuye como repositorio PEFT en formato safetensors y está etiquetado con el pipeline `image-text-to-text`, es decir, está pensado para conversación multimodal que acepta imágenes y texto como entrada y devuelve texto. El nombre del adaptador ("Identity-v2") y la etiqueta `mtrini` sugieren un ajuste orientado a dotar al modelo de una identidad o personaje conversacional concreto, aunque la información disponible no incluye model card ni documentación que lo confirme.

El interés práctico del repositorio es doble: por un lado, demuestra el flujo habitual de especialización de un VLM de 8B mediante PEFT, lo que permite reutilizar el modelo base y cargar solo el delta de pesos; por otro, al estar marcado como `experimental` y no tener descargas ni valoraciones, debe tratarse como un artefacto en fase temprana, sin garantías de calidad ni de estabilidad.

No se han publicado en la información proporcionada datos sobre el dataset de entrenamiento, el rango del LoRA, la licencia ni los idiomas soportados. Toda evaluación de capacidades debe hacerse contra el modelo base Qwen3-VL-8B-Instruct y validarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal Qwen3-VL-8B-Instruct |
| Parametros totales | No disponible para el adaptador (rango y alpha no documentados); el modelo base es de la familia Qwen3-VL-8B |
| Parametros activos | No aplica (el modelo base no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; al ser LoRA en safetensors, la cuantizacion se aplica al modelo base en el momento de la carga |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA, no un modelo completo. La arquitectura efectiva es la del modelo base Qwen3-VL-8B-Instruct, un transformer multimodal de la familia Qwen3-VL que procesa imágenes y texto; el adaptador añade matrices de bajo rango sobre determinadas capas para especializar el comportamiento sin reentrenar los pesos originales. La librería declarada es `peft`, y los tags confirman `base_model:Qwen/Qwen3-VL-8B-Instruct` y `base_model:adapter:Qwen/Qwen3-VL-8B-Instruct`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens vistos, el rango del LoRA, la tasa de aprendizaje ni si se emplearon técnicas de alineación adicionales (RLHF, DPO) o regularización. Tampoco se documenta si el ajuste cubrió solo el tramo de lenguaje, el proyector visual o ambos. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-VL-8B-Instruct.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas sobre contenido visual y diálogo guiado por imágenes.
- Especialización de identidad o persona: el nombre "Identity-v2" apunta a un ajuste para mantener un personaje, tono o estilo consistente en la conversación; no verificado por documentación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende de las capacidades del modelo base y de que el adaptador no las haya degradado).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de personajes conversacionales: cargar el adaptador sobre Qwen3-VL-8B-Instruct para obtener un asistente con identidad y tono consistentes, útil en demos de chatbots de marca o de ficción antes de invertir en un ajuste completo.
- Asistente visual con voz de marca: el modelo puede recibir una imagen (por ejemplo, una captura de producto o un documento escaneado) y responder con el estilo definido por el adaptador, lo que encaja en atención al cliente sobre catálogo visual.
- Evaluación de técnicas PEFT en VLMs: sirve como caso de estudio reproducible para medir cómo un LoRA de identidad afecta a las capacidades del modelo base en tareas de visión-lenguaje.
- Generación de descripciones y alt-text con estilo uniforme: aplicar el adaptador para producir textos alternativos o pies de foto coherentes con una guía de estilo editorial concreta.
- Soporte a tareas de anotación asistida: preetiquetado de imágenes con un VLM especializado en un dominio o registro lingüístico concreto, revisado después por anotadores humanos.
- Base para experimentación en investigación: punto de partida para estudiar olvido catastrófico, deriva de personalidad o degradación de capacidades multimodales al aplicar adaptadores de bajo rango.
- Integración en pipelines de agentes con entrada visual: no confirmado; requeriría validar previamente que el adaptador conserva el soporte de tool calling del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa típicamente decenas o pocos cientos de MB en safetensors; el requisito real lo marca el modelo base Qwen3-VL-8B-Instruct, que debe cargarse junto al adaptador. El tamaño exacto del adaptador no está indicado en la información disponible.
- VRAM estimada para el modelo base en precisión de 16 bits: del orden de 16 GB solo para los pesos, más el codificador visual, el caché KV y overhead del runtime; en la práctica, 24 GB o más para contextos largos e imágenes de resolución alta. Estimación orientativa basada en el tamaño del modelo base, no en mediciones publicadas para este adaptador.
- VRAM estimada con cuantización de 4 bits del modelo base: alrededor de 6-8 GB para pesos, con margen adicional para el caché KV y las imágenes; requiere verificar compatibilidad del adaptador con el esquema de cuantización elegido.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente; RTX 4090 (24 GB), RTX 3090 (24 GB), L40S o A6000 para desarrollo e inferencia en fp16 con una sola petición. En consumer, RTX 4080/4070 Ti Super (16 GB) solo con cuantización agresiva del base.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador mediante `PeftModel`), vLLM con soporte de LoRA, TGI con adaptadores, y llama.cpp/Ollama únicamente si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. Como referencia, un VLM de 8B en fp16 sobre una GPU de 24 GB añade latencia perceptible por la codificación de imagen; conviene medirlo con el hardware y la resolución de entrada reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CompiwerAI/Mtrini-SVL-1.2-Identity-v2-LoRA | Adaptador sobre base de 8B | No disponible | No disponible | HuggingFace, 0 descargas | Experimental, sin model card ni benchmarks |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | ~8B | No disponible en la informacion | No disponible en la informacion | HuggingFace, ampliamente utilizado | Referencia obligatoria: el adaptador solo aporta un delta sobre este modelo |
| Qwen2.5-VL-7B-Instruct | ~7B | No disponible en la informacion | No disponible en la informacion | HuggingFace | Alternativa de generación anterior; conviene comparar degradación visual y calidad conversacional |
| LLaVA-OneVision-7B | ~7B | No disponible en la informacion | No disponible en la informacion | HuggingFace | Alternativa open source de propósito general en visión-lenguaje |

Los campos marcados como no disponibles deben confirmarse en las fichas oficiales de cada modelo antes de tomar una decisión; no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre dataset, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el ajuste.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribución; hay que contactar con el autor y verificar además la licencia del modelo base Qwen3-VL-8B-Instruct, que es la que rige la mayor parte del peso legal.
- Riesgo de alucinación heredado del modelo base y potencialmente acentuado por un ajuste de identidad que prioriza el estilo sobre la fidelidad factual.
- Posible degradación de capacidades: un LoRA de persona puede reducir el rendimiento en matemáticas, código o razonamiento visual, y afectar al soporte de tool calling.
- Idiomas no declarados: no hay garantía de calidad fuera del idioma o idiomas usados en el ajuste; el castellano no está confirmado.
- Sin señales de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el artefacto es experimental y no ha sido probado por terceros.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden evaluar sesgos de género, raza, cultura o ideología introducidos por el ajuste.
- Fecha de creación registrada como 2026-10-20, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.
- No usar en producción sin una batería propia de evaluación: comparar contra el modelo base sin adaptador en las mismas tareas para cuantificar la ganancia real y las regresiones.

## Enlaces

- HuggingFace: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.2-Identity-v2-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados a este adaptador.
