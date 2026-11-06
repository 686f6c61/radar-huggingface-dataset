# INCModel4/Ministral-3-8B-Instruct-2512-W4A16-AutoRound

## Resumen

Ministral-3-8B-Instruct-2512-W4A16-AutoRound es una versión cuantizada a 4 bits del modelo multimodal Ministral-3-8B-Instruct-2512 de Mistral AI, publicada por el usuario INCModel4. La cuantización se ha realizado con AutoRound de Intel, una técnica de redondeo de pesos basada en descenso de gradiente con signo que ajusta los parámetros de redondeo para minimizar la pérdida de precisión respecto al modelo original en BF16. El resultado es un checkpoint W4A16 (pesos a 4 bits, activaciones a 16 bits) con grupo de cuantización de tamaño 128 y simétrico, aplicado a las capas de atención y MLP, mientras que embeddings, lm_head, el torre de visión y el proyector multimodal se mantienen en BF16.

El modelo base es un transformer multimodal de tipo image-text-to-text con arquitectura Mistral3, orientado a instrucciones y conversación, con una ventana de contexto que no se detalla en la información disponible. Según los pesos en safetensors, el checkpoint contiene 3.487.008.768 parámetros, un dato que no coincide con la denominación comercial "8B" del modelo base y que conviene verificar antes de dimensionar el despliegue.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de Mistral con una huella de memoria notablemente reducida (repositorio de 10,7 GB) manteniendo una recuperación media del 99,12 % en los benchmarks reportados por el autor, lo que lo hace atractivo para despliegues con VRAM limitada. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Mistral3 (image-text-to-text) |
| Parametros totales | 3.487.008.768 (según safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), group_size 128, simétrico, 200 iteraciones de tuning |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint mistralai/Ministral-3-8B-Instruct-2512, que emplea la arquitectura Mistral3 con capacidades multimodales (procesamiento conjunto de imagen y texto). La cuantización se aplica exclusivamente a las capas de atención y MLP en formato W4A16 con grupo de 128 y simetría, mientras que las embeddings, la cabeza de salida (lm_head), el torre de visión y el proyector multimodal permanecen en BF16 para preservar la calidad de las representaciones de entrada y de las capacidades visuales.

El proceso de cuantización se realizó con AutoRound (intel/auto-round) mediante 200 iteraciones de tuning, 128 muestras de calibración, longitud de secuencia 2048 y batch de 8, ignorando explícitamente vision_tower, multi_modal_projector y lm_head. AutoRound optimiza los parámetros de redondeo mediante descenso de gradiente con signo, una innovación descrita en el paper arXiv:2309.05516. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, al ser un modelo Instruct.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al torre de visión y al proyector multimodal conservados en BF16.
- Razonamiento y matemáticas, con un resultado de 86,05 en GSM8K en la versión cuantizada.
- Conocimiento general y sentido común, según MMLU (72,19) y HellaSwag (58,03).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente conversacional multimodales: el modelo puede mantener diálogos multi-turno combinando texto e imágenes, útil en aplicaciones de soporte donde el usuario adjunta capturas o fotografías y espera una respuesta en lenguaje natural.
- Descripción y análisis de imágenes en pipelines de accesibilidad: generación automática de descripciones textuales de imágenes para lectores de pantalla o indexación semántica de catálogos visuales.
- Extracción de información de documentos escaneados: al aceptar entrada image-text, puede procesar facturas, formularios o capturas y devolver campos estructurados, siempre con validación posterior por el riesgo de alucinación.
- Razonamiento matemático asistido: con 86,05 en GSM8K, es adecuado para tutores o asistentes de resolución de problemas aritméticos de varios pasos en entornos educativos.
- Clasificación y moderación de contenido multimodal: análisis de pares imagen-texto para detectar contenido inapropiado o incoherencias, con revisión humana en la cadena.
- Despliegue en hardware con VRAM limitada: la cuantización W4A16 reduce la huella a aproximadamente 10,7 GB de repositorio, lo que permite servir el modelo en GPUs de consumo alto o en instancias cloud económicas mediante vLLM.
- Prototipado rápido de aplicaciones vision-language: al ser compatible con transformers y vLLM, se integra en entornos de experimentación sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, comparando BF16 frente a W4A16:

| Benchmark | BF16 | W4A16 | Recuperación |
|---|---:|---:|---:|
| GSM8K | 86,81 | 86,05 | 99,13 % |
| PIQA | 79,49 | 79,11 | 99,52 % |
| MMLU | 73,06 | 72,19 | 98,81 % |
| HellaSwag | 58,64 | 58,03 | 98,95 % |
| **Media** | **74,50** | **73,84** | **99,12 %** |

No se han publicado resultados de benchmarks adicionales (HumanEval, MT-Bench, benchmarks multimodales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 10,7 GB, por lo que se requiere al menos ~11-12 GB de VRAM para cargar los pesos W4A16 junto con el overhead de activaciones y caché KV; con contexto largo la demanda crece.
- GPU recomendadas: A100, H100 o L40S para producción con concurrencia; RTX 4090 (24 GB) para despliegues de una sola GPU con margen.
- GPU de consumo: cabe en RTX 4090 y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB el margen es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: vLLM 0.32.0 (recomendado por el autor, con `--dtype bfloat16` y tokenizer del modelo base), transformers con formato auto_round. No se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-8B-Instruct-2512-W4A16-AutoRound | 3,49 B (según safetensors) | no disponible | W4A16 | Apache 2.0 | Hugging Face |
| mistralai/Ministral-3-8B-Instruct-2512 (BF16) | no disponible | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de Ministral-3-8B | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes (por ejemplo, modelos vision-language de 7-9 B) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor advierte explícitamente que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de verdad sin verificación.
- Sesgos y contenido ofensivo: la model card señala la posibilidad de generar salidas obscenas, sesgadas u ofensivas derivadas de los datos de preentrenamiento y ajuste fino; se recomienda realizar pruebas de seguridad antes del despliegue.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- Longitud de contexto no documentada: impide dimensionar correctamente la caché KV y planificar escenarios de contexto largo.
- Discrepancia en el recuento de parámetros: los safetensors reportan 3,49 B frente a la denominación "8B" del modelo base; conviene verificar la configuración real antes de estimar requisitos de memoria.
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda consultar a un abogado y no ofrece asesoramiento legal; además, la licencia del modelo cuantizado no sustituye a la del modelo base.
- Cuantización con pérdida: aunque la recuperación media es del 99,12 %, puede haber degradación en tareas no evaluadas, especialmente multimodales, ya que el torre de visión se mantiene en BF16 pero la fusión con el resto de capas puede verse afectada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/INCModel4/Ministral-3-8B-Instruct-2512-W4A16-AutoRound)
- [Modelo base: mistralai/Ministral-3-8B-Instruct-2512](https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512)
- [Paper de AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
- [Repositorio AutoRound en GitHub](https://github.com/intel/auto-round)
- [Intel Neural Compressor](https://github.com/intel/neural-compressor)
