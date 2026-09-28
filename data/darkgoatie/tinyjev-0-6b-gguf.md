# darkgoatie/TinyJev-0.6B-GGUF

## Resumen

TinyJev-0.6B-GGUF es la conversión a formato GGUF del backbone Qwen3 del modelo AnkitAI/TinyJev-0.6B, publicada por el usuario darkgoatie. No es un modelo generativo ni un modelo de chat: se trata de un modelo de decisión que responde a preguntas con respuesta cerrada (sí/no, elección entre opciones, puntuación) devolviendo probabilidades calibradas. El repositorio contiene únicamente el backbone cuantizado en f16 (1,2 GB); la cabeza de decisión permanece en `head.safetensors` y debe aplicarse en Python sobre los estados ocultos finales, por lo que cargarlo en LM Studio o en una interfaz de chat no produce decisiones.

El modelo cuenta con 596.049.920 parámetros y deriva de Qwen/Qwen3-0.6B-Base, un transformer denso de la familia Qwen3. La utilidad práctica de esta publicación es permitir ejecutar el backbone con llama.cpp (Vulkan, CPU, Metal, CUDA) en hardware muy modesto, incluidas GPU integradas, manteniendo una paridad de estados ocultos muy alta respecto a la implementación original en PyTorch fp32.

Su relevancia actual es acotada pero concreta: ofrece una vía de despliegue ligera para tareas de enrutado, puntuación y clasificación binaria dentro de pipelines, sin necesidad de GPU dedicada. El repositorio no registra descargas ni valoraciones, y no se ha ejecutado una validación a nivel de respuesta sobre un benchmark completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen3), con cabeza de decisión externa tipo Kev |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como especificación del modelo; la configuración de ejemplo usa `-c 8192` |
| Tipos de cuantización | f16 (único archivo GGUF publicado); no hay Q4, Q5 ni Q8 en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (backbone, f16) y safetensors (cabeza de decisión, fp32) |

Otros datos del repositorio: tamaño total 1,2 GB, librería `gguf`, `base_model: AnkitAI/TinyJev-0.6B` con relación `quantized`, creado el 2026-09-27.

## Arquitectura y entrenamiento

El backbone es un transformer denso procedente de Qwen/Qwen3-0.6B-Base, convertido con el script `convert_hf_to_gguf.py` de llama.cpp en el commit `5266f24da`. Los pesos del archivo GGUF se copiaron tal cual desde `model.safetensors` del modelo original, sin recuantización posterior. Sobre el backbone se sitúa una cabeza de decisión (denominada Kev pointer head) entrenada por Jared Palmer con el paquete Kev; esa cabeza no está incluida en el GGUF, sino en `head.safetensors` en fp32, y se aplica sobre los estados ocultos post-normalización del backbone.

El repositorio incluye además `tinyjev.json` con los ajustes de la cabeza (temperatura, identificadores de token y límites), junto con `tokenizer.json`, `tokenizer_config.json` y `config.json` del modelo original. La inferencia requiere construir los identificadores de token tal como los genera el paquete `tinyjev` (sin token BOS), enviarlos al endpoint `/embedding` de llama-server y aplicar la cabeza en Python. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de decisión con respuesta cerrada: sí/no, elección de una opción entre varias y puntuación de candidatos.
- Emisión de probabilidades calibradas asociadas a cada decisión, aptas para umbralizar o comparar alternativas.
- Exposición de estados ocultos por token (post-norm `last_hidden_state`) mediante el modo `--embeddings --pooling none` de llama-server, lo que permite aplicar cabezas externas personalizadas.
- Ejecución multiplataforma a través de llama.cpp sobre Vulkan, CPU, Metal y CUDA.
- No soporta generación de texto libre, diálogo conversacional, tool calling, function calling ni razonamiento en múltiples pasos.
- No dispone de capacidades de visión, audio ni modo de pensamiento.
- Cobertura multilingüe no documentada.

## Casos de uso

- Clasificación binaria en pipelines de contenido: aplicar la cabeza sobre los estados ocultos para etiquetar textos como aptos o no aptos (moderación, spam, duplicados), con umbral ajustable a partir de la probabilidad devuelta.
- Enrutado de consultas en sistemas RAG: dado un conjunto de índices o fuentes candidatas, puntuar cada opción y derivar la consulta al repositorio más probable, aprovechando el coste reducido del backbone de 0,6 B.
- Selección de herramienta en agentes: presentar al modelo las herramientas disponibles como opciones cerradas y elegir una mediante la cabeza de decisión, sin generar texto ni consumir presupuesto de decodificación.
- Puntuación y reranking de respuestas candidatas: ordenar salidas de un modelo generativo mayor calculando una puntuación de adecuación para cada candidata antes de mostrarla al usuario.
- Etiquetado débil de datasets: preetiquetar grandes volúmenes de ejemplos con decisiones sí/no o con una categoría entre varias, para su posterior revisión humana, con un coste de cómputo muy inferior al de un modelo generativo.
- Detección de intención en asistentes conversacionales: clasificar el turno entrante en una de las intenciones predefinidas del sistema y activar el flujo correspondiente.
- Clasificación de tickets de soporte: asignar cada incidencia a una categoría o a una cola de atención a partir de una lista cerrada de opciones.
- Evaluación automática en CI de modelos: actuar como juez binario (respuesta correcta o incorrecta, sigue o no sigue la instrucción) en tuberías de regresión de calidad, aplicando la cabeza sobre embeddings y registrando la probabilidad resultante.
- Control de calidad en anotación humana: marcar discrepancias entre la decisión del modelo y la del anotador para priorizar la revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no se ha ejecutado una comprobación a nivel de respuesta sobre un benchmark completo.

El único dato cuantitativo publicado es la comparación de estados ocultos entre llama.cpp b10809 sobre Vulkan (Radeon 880M) y PyTorch fp32 en CPU, con los mismos identificadores de token y tres prompts:

| Prompt | Similitud coseno | Diferencia absoluta media |
|---|---|---|
| 1 | 0,99989 | 0,024 |
| 2 | 0,99988 | 0,024 |
| 3 | 0,99986 | 0,023 |

El autor atribuye estas diferencias a la brecha habitual entre f16 y fp32, y señala que las salidas de decisión deben considerarse cercanas al original, pero no demostradas idénticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con el archivo f16 de 1,2 GB, incluyendo overhead de contexto y buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria; el autor ha validado el funcionamiento en una Radeon 880M (GPU integrada) mediante Vulkan. NVIDIA (CUDA) y Apple Silicon (Metal) son compatibles por soporte de llama.cpp.
- Cabe en GPU de consumo: sí, de forma holgada, en cualquier tarjeta con 4 GB o más, e incluso en iGPU.
- Ejecución en CPU: viable en solitario, dado el tamaño del modelo.
- Opciones de despliegue: llama-server de llama.cpp, con la invocación `llama-server -m TinyJev-0.6B-f16.gguf --embeddings --pooling none -ngl 99 -c 8192 -b 8192 -ub 8192`, más un script Python que aplique `head.safetensors`. No es compatible con vLLM, TGI, Ollama ni LM Studio para obtener decisiones, ya que estas herramientas no aplican la cabeza externa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| darkgoatie/TinyJev-0.6B-GGUF | 596.049.920 | No disponible (ejemplo con 8192) | Modelo de decisión (backbone + cabeza externa) | MIT | GGUF f16 + safetensors | Repositorio con 0 descargas y 0 valoraciones |
| AnkitAI/TinyJev-0.6B | No disponible (el backbone procede de Qwen3-0.6B-Base) | No disponible | Modelo de decisión (implementación original en PyTorch) | MIT | safetensors | Modelo original, con cabeza integrada en el flujo de inferencia |
| Qwen/Qwen3-0.6B-Base | 0,6 B (aproximado, dato no confirmado en la información disponible) | No disponible | Modelo de lenguaje base generativo | No disponible en la información proporcionada | safetensors | Backbone de origen del que deriva TinyJev |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La diferencia funcional principal es que TinyJev y su conversión GGUF son modelos de decisión, mientras que Qwen3-0.6B-Base es un modelo generativo de propósito general; no son sustituibles entre sí para la misma tarea.

## Limitaciones y advertencias

- No es un modelo de chat ni generativo: cargar el archivo GGUF en LM Studio, Ollama o cualquier interfaz conversacional no proporciona decisiones, porque la cabeza de decisión queda fuera del archivo.
- Requiere pegamento en Python: hay que construir los identificadores de token con el paquete `tinyjev` (sin BOS), llamar al endpoint `/embedding` y aplicar `head.safetensors` sobre las filas devueltas. Es un despliegue con dos componentes, no un binario autónomo.
- Paridad no verificada a nivel de respuesta: la comparación publicada se limita a estados ocultos con tres prompts (coseno ≥ 0,99986). El propio autor advierte de que las salidas de decisión son cercanas al original, pero no se ha demostrado que sean idénticas.
- Calibración dependiente del dominio: al ser un modelo de decisión basado en un backbone de 0,6 B, las probabilidades pueden degradarse fuera de la distribución de entrenamiento del modelo original; conviene validar el umbral en datos propios.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto libre), pero sí existe riesgo de decisión errónea con confianza alta si la entrada se aleja del formato esperado.
- Idiomas soportados no documentados. El backbone Qwen3 tiene cobertura multilingüe, pero su comportamiento en castellano para tareas de decisión no está confirmado.
- Solo se publica cuantización f16. No hay versiones Q4, Q5 ni Q8, por lo que no se puede reducir aún más el consumo de memoria sin generar nuevas cuantizaciones por cuenta propia.
- Licencia MIT en este repositorio, lo que permite uso comercial de la conversión. Debe verificarse por separado la licencia del modelo base AnkitAI/TinyJev-0.6B, la del backbone Qwen3-0.6B-Base y los términos del paquete Kev antes de un despliegue comercial.
- Sin validación de la comunidad: 0 descargas y 0 valoraciones en el momento de la consulta; no hay informes independientes de funcionamiento en producción.
- Configuración sensible: la inferencia requiere `--pooling none` y el envío de identificadores de token sin BOS; cualquier desviación altera los estados ocultos y, con ello, la decisión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darkgoatie/TinyJev-0.6B-GGUF
- Modelo original: https://huggingface.co/AnkitAI/TinyJev-0.6B
- Backbone de origen: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Kev (entrenamiento de la cabeza de decisión, Jared Palmer): https://github.com/jaredpalmer/kev
- llama.cpp (conversión e inferencia): https://github.com/ggml-org/llama.cpp

Nota: la búsqueda web asociada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas de un sitio para adultos sin relación con el contenido solicitado, por lo que no se incluyen como enlaces.
