# bunny127/EviRover

## Resumen

EviRover-4B es un modelo de visión-lenguaje de 4B parámetros desarrollado por el usuario bunny127, afinado a partir de Qwen3-VL-4B-Instruct. Está diseñado para un problema específico: la percepción visual cuando una sola pasada por la imagen no aporta evidencia suficiente. En lugar de responder directamente, el modelo ejecuta un bucle de herramientas (recortar y reinspeccionar la imagen a mayor escala, verificar regiones candidatas, comparar paneles, buscar en la web, navegar por páginas y ejecutar código) y solo emite la respuesta final tras reunir la evidencia necesaria.

La arquitectura es `Qwen3VLForConditionalGeneration` (model_type `qwen3_vl`), con 4.826.771.968 parámetros reales según safetensors y pesos en bfloat16 distribuidos en dos shards (9,1 GB). El contexto declarado alcanza 262.144 posiciones, aunque el entrenamiento se realizó con un presupuesto de 8.192 tokens de prompt y 16.384 de respuesta por turno. El modelo se entrena y evalúa sobre EviLens, un benchmark de 688 instancias verificadas por humanos que cubre localización, reconocimiento, diferencias entre imágenes, segmentación y conteo.

Su relevancia actual reside en que aborda el "razonamiento agéntico visual" con un modelo pequeño (4B) y licencia Apache 2.0, superando en su benchmark a modelos de 8B como OneThinker-8B e InternVL-3.5-8B en todas las categorías reportadas. El modelo es de investigación, con 30 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (`model_type: qwen3_vl`), transformer visión-lenguaje |
| Parámetros totales | 4.826.771.968 (~4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones; entrenado con prompt de 8.192 tokens y respuesta de 16.384 tokens por turno |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, bfloat16, 9,1 GB) |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Procesador | `Qwen3VLProcessor`, `max_pixels` 2.160.000 |
| Tokenizer / plantilla de chat | sin cambios respecto al modelo base |
| Librería | transformers >= 4.57.1 |

## Arquitectura y entrenamiento

EviRover se construye sobre Qwen3-VL-4B-Instruct, un transformer visión-lenguaje multimodal. El ajuste se orienta a un régimen agéntico: el modelo aprende a operar un conjunto fijo de diez herramientas (`crop`, `verify`, `verify_part`, `verify_mask`, `compare_lr`, `python`, `text_search`, `text_search_image`, `image_search`, `browse`) dentro de un bucle de múltiples turnos antes de comprometer una salida concreta (caja, máscara o conteo). Las máscaras no las genera el modelo directamente: este emite cajas y el harness las convierte en máscaras mediante SAM3.

El entrenamiento emplea aprendizaje por refuerzo (tag `reinforcement-learning`) sobre el dataset EviLens, aunque la model card no detalla el número de tokens, la composición exacta del corpus ni si hubo etapas de RLHF o DPO adicionales. Las convenciones de entrenamiento forman parte del comportamiento del modelo: coordenadas `xyxy` normalizadas a 0–1000, cajas dentro de etiquetas `<answer>`, muestreo con temperatura 0,7 / top_p 0,8 / top_k 20 (no se recomienda decodificación greedy en el bucle agéntico), cadenas de retroalimentación de herramientas byte a byte idénticas a las de entrenamiento e imágenes de alta resolución pasadas a resolución completa para que el modelo haga zoom mediante `crop`.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes.
- Localización visual (grounding): emisión de cajas `xyxy` normalizadas a 0–1000.
- Reconocimiento de expresiones referidas (referring expression).
- Segmentación de expresiones referidas, mediante cajas convertidas a máscara con SAM3.
- Conteo de objetos en escenas con evidencia insuficiente a primera vista.
- Detección de diferencias entre imágenes (spot-the-difference) con comparación de paneles.
- Uso de herramientas (tool calling): recorte y reinspección a mayor escala, verificación de regiones y partes, comparación izquierda-derecha.
- Ejecución de código Python dentro del bucle agéntico.
- Búsqueda web de texto e imágenes, y navegación de páginas.
- Razonamiento multi-paso con hasta 35 llamadas a herramientas y 39 turnos en la configuración de evaluación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inspección de imágenes de alta resolución en control de calidad industrial: el modelo recibe la imagen a resolución completa y usa `crop` para ampliar regiones pequeñas donde se sospecha un defecto, verificando candidatos antes de emitir una caja o un conteo.
- Análisis de imágenes satelitales o de dron: localización y conteo de objetos pequeños que no son resolubles en una sola pasada, con recortes sucesivos y comparación de regiones.
- Verificación documental con diferencias entre versiones: la categoría spot-the-difference y la herramienta `compare_lr` permiten comparar paneles y señalar cambios concretos entre dos imágenes.
- Análisis de imágenes médicas o de microscopía asistido: segmentación de estructuras referidas por descripción, con la caja predicha convertida a máscara mediante SAM3.
- Asistentes de investigación visual con acceso a web: cuando la identificación del objeto requiere información externa, el modelo encadena `text_search`, `image_search` y `browse` antes de responder.
- Automatización de tareas de anotación y etiquetado: generación de cajas y conteos para pipelines de curación de datasets, con las convenciones de coordenadas del modelo integradas en el formato de salida.
- Agentes autónomos de percepción en entornos con API compatible con OpenAI: despliegue con vLLM y consumo desde el harness EviLens, que aporta el system prompt, las diez herramientas y el parseo de respuestas.

## Benchmarks y rendimiento

Evaluación agéntica sobre EviLens (688 instancias verificadas por humanos). Todas las filas se ejecutan con el mismo harness y protocolo: modo agente, máximo 35 llamadas a herramientas, 39 turnos, backend de búsqueda de texto serper, temperatura 0,7 / top_p 0,8 / top_k 20, segmentación con SAM3 y servicio con vLLM 0.24.0+cu129 / torch 2.11.

| Modelo | Loc IoU | Loc R@.5 | Rec IoU | Rec R@.5 | SD F1_mi | SD F1_ma | Seg gIoU | Seg cIoU | Cnt Acc (%) |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct | 0,276 | 0,251 | 0,265 | 0,231 | 0,005 | 0,008 | 0,203 | 0,279 | 19,2 |
| OneThinker-8B | 0,110 | 0,086 | 0,353 | 0,357 | 0,065 | 0,106 | 0,409 | 0,387 | 25,6 |
| InternVL-3.5-8B | 0,020 | 0,007 | 0,093 | 0,033 | 0,000 | 0,000 | 0,081 | 0,081 | 20,5 |
| EviRover (4B) | 0,444 | 0,500 | 0,648 | 0,687 | 0,171 | 0,266 | 0,686 | 0,708 | 50,0 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,7 GB solo para pesos, más memoria para caché KV y procesamiento de imágenes de alta resolución (`max_pixels` 2.160.000); con contexto largo la demanda crece de forma significativa.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto completo y despliegue con vLLM; una RTX 4090 (24 GB) puede alojar los pesos en bfloat16, pero limita la longitud de contexto y el número de imágenes por prompt.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB si se recurre a cuantización, aunque no se documentan cuantizaciones publicadas.
- Despliegue: vLLM (comando documentado con `--dtype bfloat16 --max-model-len 131072 --limit-mm-per-prompt '{"image": 128}'`), transformers >= 4.57.1 con `Qwen3VLForConditionalGeneration` y `device_map="auto"`. No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El bucle agéntico con hasta 35 llamadas a herramientas y 39 turnos implica un coste acumulado elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento en EviLens |
|---|---|---|---|---|---|
| EviRover | ~4B | 262.144 posiciones | Apache 2.0 | Agéntico con 10 herramientas, RL | Mejor en las 5 categorías reportadas |
| Qwen3-VL-4B-Instruct | ~4B | no disponible en esta ficha | no disponible en esta ficha | Base no agéntica | Loc IoU 0,276; Cnt Acc 19,2 % |
| OneThinker-8B | 8B | no disponible | no disponible | Agéntico | Loc IoU 0,110; Seg gIoU 0,409; Cnt Acc 25,6 % |
| InternVL-3.5-8B | 8B | no disponible | no disponible | Agéntico | Loc IoU 0,020; Seg gIoU 0,081; Cnt Acc 20,5 % |

EviRover, con la mitad de parámetros que OneThinker-8B e InternVL-3.5-8B, obtiene los mejores resultados en localización, reconocimiento, spot-the-difference, segmentación y conteo bajo el mismo harness.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3-VL-4B-Instruct hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: el modelo está entrenado para comprometerse a una salida concreta (caja, máscara o conteo) incluso cuando la evidencia es insuficiente; esa obligación de responder puede producir salidas incorrectas con apariencia de seguridad.
- Dependencia estricta de convenciones: cambiar el formato de coordenadas (`xyxy` normalizado 0–1000), las cadenas de retroalimentación de herramientas, la resolución de entrada o los parámetros de muestreo degrada la precisión.
- No se recomienda decodificación greedy en el bucle agéntico; la configuración prevista es temperatura 0,7 / top_p 0,8 / top_k 20.
- La segmentación requiere SAM3 externo: el modelo solo emite cajas.
- El bucle agéntico necesita credenciales de herramientas externas (búsqueda de texto, búsqueda de imágenes, navegación) y un sumarizador LLM compatible con OpenAI para `browse`.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe específico.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se presenta como modelo de investigación; no se documentan evaluaciones de seguridad ni de robustez en producción.
- Adopción muy baja (30 descargas, 0 likes) y sin validación independiente más allá del benchmark del propio autor.
- Restricciones de uso responsable: la model card menciona un uso de investigación relacionado con identidad, sin detallar las restricciones concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bunny127/EviRover
- Dataset y harness de evaluación EviLens: https://huggingface.co/datasets/bunny127/EviLens
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper referenciado (arXiv:2609.40230): https://arxiv.org/abs/2609.40230
