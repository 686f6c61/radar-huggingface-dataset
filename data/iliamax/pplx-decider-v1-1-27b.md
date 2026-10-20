# IliaMax/pplx-decider-v1.1-27b

## Resumen

pplx-decider-v1.1-27b es un modelo de decisión (clasificación sobre un conjunto cerrado de candidatos) construido por fine-tuning sobre el backbone Qwen3.8-27B. No genera texto libre: incorpora una cabeza de lectura (`readout`) separada de 255 candidatos y devuelve una distribución de probabilidad normalizada sobre las opciones válidas de cada decisión. Es la versión 1.1 del `pplx-decider-v1-27b` publicado previamente, y su objetivo es servir como componente de enrutamiento y desambiguación dentro de pipelines más grandes (triage de tickets, selección de herramientas, verificación de respuestas).

La mejora principal frente a la versión anterior no viene de un cambio de backbone, sino de dos decisiones de entrenamiento: la eliminación de la máscara causal en las capas de atención completa (el modelo ve la secuencia completa en lugar de predecir solo hacia delante) y el uso de más datos, incluyendo el corpus [tasksource](https://github.com/sileod/tasksource). Con ello, el índice agregado Decision Index sube de 56,4 a 61,56, superando a Jev (57,9) por más de 3,5 puntos.

El modelo tiene 26.085.330.160 parámetros (~26,09B) en BF16, un repositorio de 52,2 GB y un límite operativo de 8.192 tokens para la entrada combinada de texto e imágenes. Es multimodal: acepta imágenes que se trocean en parches de 32×32 px. La licencia es Apache 2.0, pero el checkpoint requiere código propio (`autojev`) y una configuración de atención específica para reproducir el comportamiento evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (clase `Qwen3_5Model`: capas de atención completa + capas de atención lineal) con cabeza de decisión separada (`readout`) |
| Parametros totales | 26.085.330.160 (~26,09B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens como límite operativo de entrada (texto + todas las imágenes de una decisión); las entradas que lo exceden se rechazan, no se truncan. Longitud nativa del backbone: no disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados están en BF16 y el repositorio no incluye variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (backbone) + `readout.safetensors` con la cabeza de decisión en BF16 de forma [255, 5120]; código de inferencia propio en `source/src/autojev`; metadatos en `decision_config.json` y `release-manifest.json` |
| Cabeza de decision | 255 candidatos, proyección BF16 [255, 5120]; no es un `lm_head` de vocabulario completo |
| Tamano del repositorio | 52,2 GB |
| Libreria | PyTorch (`pytorch`), con `requirements.txt` fijado por versión |

## Arquitectura y entrenamiento

El checkpoint conserva el backbone de Qwen3.8-27B (identidad del modelo base, aunque la clase de Transformers se llame `Qwen3_5Model`) y le añade una cabeza de lectura de 255 filas que se aplica sobre el estado oculto de 5.120 dimensiones. La arquitectura del backbone es híbrida: combina capas de atención completa con capas de atención lineal. La innovación clave del v1.1 es que las capas de atención completa operan en modo **no causal**: la máscara causal se ha levantado, de modo que cada token atiende a toda la secuencia. Las capas de atención lineal mantienen su comportamiento nativo. Esto convierte al modelo en un codificador-decisor bidireccional en la práctica, y explica buena parte de la mejora en las categorías de Lenguaje, Recuperación y Artes.

El entrenamiento parte del `pplx-decider-v1-27b` y añade más datos, en particular del corpus tasksource, procesado mediante un pipeline construido sobre Bespoke Nimble. El pipeline original de la v1 se apoyaba en conjuntos de datos públicos etiquetados por humanos, convertidos a decisiones de tipo "Choice" y "Noul". El checkpoint incluye una temperatura de calibración guardada que `DecisionModel.predict` aplica automáticamente; si se consumen los logits en crudo, debe aplicarse exactamente una vez y normalizar sobre los candidatos válidos. El número total de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF/DPO no están documentados.

## Capacidades

- Clasificación y decisión sobre conjuntos cerrados de hasta 255 candidatos, con salida de probabilidades calibradas por candidato.
- Enrutamiento y desambiguación: el caso de uso canónico del model card es asignar una petición al equipo correcto (facturación, soporte técnico, ventas) a partir de un estado y un conjunto de criterios.
- Procesamiento multimodal de imágenes: acepta rutas de fichero, objetos PIL o URLs `data:image/...;base64` en el campo `images` de cada fila.
- Tokenización visual por parches: cada parche de 32×32 px consume un token visual, de forma que una imagen cuesta aproximadamente `ancho * alto / 1024` tokens; el redimensionado preserva la relación de aspecto y redondea cada lado a múltiplo de 32.
- Límite de resolución configurable mediante `max_image_pixels`, con valor por defecto de 2048×2048 (4.194.304 px, ≤4.096 tokens por imagen).
- Evaluación multi-categoría: el modelo se ha medido en las categorías Conocimiento, Lenguaje, Recuperación, Herramientas y Artes del Decision Index.
- Capacidad de generación de texto libre: no disponible (la cabeza de 255 candidatos sustituye al `lm_head`).
- Tool calling / function calling generativo: no documentado; el modelo puede *elegir* entre candidatos predefinidos, incluidos candidatos relacionados con herramientas, pero no emite llamadas estructuradas.
- Comportamiento agéntico o razonamiento multi-paso autónomo: no documentado.
- Modo "thinking", audio o vídeo: no documentado.

## Casos de uso

- **Enrutamiento de tickets de soporte**: se define un objeto `question` con tipo `choice` y un diccionario de criterios por equipo; el modelo devuelve la probabilidad de cada destino para el estado del ticket. El límite de 8.192 tokens permite incluir historial de conversación completo en la misma decisión.
- **Triaje de correos y formularios con adjuntos**: al aceptar imágenes, una captura de pantalla de error o una factura escaneada puede formar parte de la misma decisión que el texto, sin necesidad de un pipeline OCR separado.
- **Selección de herramienta en pipelines RAG**: dado un conjunto finito de herramientas o fuentes indexadas, el modelo puntúa cuál corresponde a la consulta; encaja como paso previo determinista a un orquestador que sí emite llamadas.
- **Best-of-N y verificación de respuestas**: con 255 candidatos disponibles, el modelo puede puntuar respuestas alternativas generadas por otro LLM y elegir la más probable, actuando como juez de reranking dentro de un pipeline de decodificación especulativa o de selección.
- **Moderación y clasificación de contenido a escala**: la inferencia es una pasada de clasificación, no una generación autorregresiva, lo que reduce el coste por elemento frente a usar un LLM generativo como clasificador.
- **Etiquetado de datasets**: el uso de tasksource en el entrenamiento sugiere buena transferencia a tareas NLP académicas; puede emplearse para preetiquetar corpus y reservar la anotación humana para la revisión.
- **Atención al cliente multilingüe o multi-tenant**: útil si se valida previamente el rendimiento en los idiomas objetivo, ya que el modelo no declara lista de idiomas soportados.

## Benchmarks y rendimiento

Resultados del Decision Index publicados en el model card:

| Categoria del Decision Index | Jev | pplx-decider-v1-27b | pplx-decider-v1.1-27b |
|---|---:|---:|---:|
| Knowledge | **51,4** | 40,9 | 48,18 |
| Language | 62,0 | 63,5 | **69,45** |
| Retrieval | 55,4 | 54,9 | **61,26** |
| Tools | 75,1 | **79,3** | 78,88 |
| Arts | 37,7 | 39,4 | **44,66** |
| **Overall Decision Index** | 57,9 | 56,4 | **61,56** |

La puntuación global usa la ponderación de la suite, no la media aritmética de las categorías. La única categoría donde el v1.1 retrocede frente al v1 es Tools (79,3 → 78,88), y sigue por debajo de Jev en Knowledge (48,18 frente a 51,4). No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas estándar de clasificación.

## Requisitos de hardware

- **Pesos**: aproximadamente 49 GiB en BF16, según el propio model card (el repositorio ocupa 52,2 GB). Hay que sumar memoria de trabajo para activaciones y el procesador de imágenes.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o H200. El ejemplo de uso exige explícitamente una GPU CUDA con espacio para unos 49 GiB de pesos más memoria de trabajo.
- **GPU de consumo**: no cabe en tarjetas de 24 GB (RTX 4090, 3090). Tampoco en 2×RTX 4090 (48 GB), porque solo los pesos ya superan esa cifra. No hay variantes cuantizadas publicadas que permitan reducir la huella.
- **Requisitos de entorno**: Python 3.12 o superior, acceso autenticado a Hugging Face y las dependencias fijadas en el `requirements.txt` del repositorio.
- **Opciones de despliegue**: el checkpoint no se sirve directamente con vLLM, TGI, llama.cpp ni Ollama, porque la cabeza de 255 candidatos no es un `lm_head` de vocabulario y las capas de atención completa requieren modo no causal. Para esos servidores hace falta un export separado a `Qwen3_5ForConditionalGeneration` que mapee la fila `i` del readout a la posición `decision_config.json["token_ids"][i]` del vocabulario, preservando además el comportamiento de atención y aplicando la temperatura de calibración en un solo punto.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.1-27b | ~26,09B | 8.192 tokens (entrada) | 61,56 | Apache 2.0 | Checkpoint con código propio |
| pplx-decider-v1-27b | ~26,09B (mismo backbone) | No disponible | 56,4 | No disponible en la informacion | Hugging Face (`perplexity-ai`) |
| Jev | No disponible | No disponible | 57,9 | No disponible en la informacion | Referenciado via el space del Decision Index |
| Qwen3.8-27B (modelo base) | Orden de 27B | No disponible | No aplica (no es un decider) | No disponible en la informacion | Hugging Face (`Qwen`) |

La comparación es en gran medida interna: el v1.1 y el v1 comparten backbone y solo se diferencian en la máscara de atención y en los datos de entrenamiento, y Jev solo aparece como referencia de puntuación en el model card, sin ficha técnica asociada en la información disponible.

## Limitaciones y advertencias

- **No es un modelo generativo**: la cabeza de 255 candidatos impide usarlo para generar texto libre, resumir o mantener conversaciones. Cualquier caso de uso debe reformularse como una elección entre opciones predefinidas.
- **Reproducibilidad frágil**: la inferencia causal por defecto **no** reproduce el setup evaluado. Es obligatorio cargar las capas de atención completa en modo no causal y aplicar la temperatura de calibración exactamente una vez. Un despliegue que ignore cualquiera de las dos cosas dará puntuaciones distintas de las publicadas.
- **Límite de entrada estricto**: texto e imágenes deben caber en 8.192 tokens. Las entradas se rechazan en lugar de truncarse, así que en decisiones con varias imágenes hay que bajar `max_image_pixels` o reescalar antes.
- **Resolución fuera de distribución**: el entrenamiento y la evaluación se hicieron con imágenes limitadas a 512×512 (262.144 px, ≤256 tokens). Subir de ahí conserva más detalle pero degrada la fidelidad respecto a lo evaluado y aumenta latencia y memoria.
- **Idiomas no declarados**: no hay lista de idiomas soportados ni evaluación por idioma, por lo que el rendimiento fuera del inglés es una incógnita que debe validarse empíricamente.
- **Calibración de probabilidades**: al ser un modelo de decisión, el riesgo característico no es la alucinación de texto sino una distribución mal calibrada. Si se consume el output como probabilidad sin respetar la temperatura guardada, los umbrales de decisión dejan de ser fiables.
- **Discrepancia de autoría**: la ficha de Hugging Face figura bajo el identificador `IliaMax/pplx-decider-v1.1-27b`, mientras que el model card y el código de ejemplo hacen referencia al repositorio `perplexity-ai/pplx-decider-v1.1-27b` y lo describen como repositorio privado con acceso autenticado. Conviene verificar el origen real del artefacto antes de integrarlo en producción.
- **Validación comunitaria nula**: 0 descargas y 0 likes en el momento de la consulta, frente a un modelo predecesor publicado por otra organización. No hay evidencia independiente de que el checkpoint se comporte como declara.
- **Licencia y datos de terceros**: los pesos son Apache 2.0, lo que permite uso comercial, pero el pipeline se apoya en tasksource y en Bespoke Nimble; si se redistribuye el modelo o se reentrena, deben revisarse las condiciones de esos componentes y citar el artículo de tasksource.
- **Código no estándar**: `source/src/autojev/model.py` es el código del run de entrenamiento evaluado, con un único cambio (el límite de tamaño de imagen pasó de estar fijado a 512×512 a ser el parámetro `max_image_pixels`). Depender de código propio incrementa el coste de mantenimiento y el riesgo de deriva entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IliaMax/pplx-decider-v1.1-27b
- Modelo predecesor (pplx-decider-v1-27b): https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Decision Index (space de evaluación): https://huggingface.co/spaces/multimodalart/jev-decision-index
- tasksource (repositorio de datos): https://github.com/sileod/tasksource
- Artículo de tasksource (LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.1361/
- Bespoke Nimble (pipeline de datos): https://github.com/bespokelabsai/nimble
