# gatilin/flora-rewarder-vision-encoder

## Resumen

Flora-Rewarder visual encoder es un extracto de investigación publicado por el usuario `gatilin` que contiene únicamente la torre visual del modelo `nvidia/Flora-Rewarder`. Se compone de los 333 tensores con prefijo `model.visual.*` (torre visual y merger espacial) del checkpoint original, con el prefijo eliminado pero preservando bytes, formas y dtype BF16. No incluye el modelo de lenguaje, las cabezas de recompensa, la lógica de anotación robótica ni el sistema completo de recompensa de vídeo.

El componente es un encoder visual de 27 capas con anchura 1152 y salida del merger de 5120 dimensiones, con 460.730.096 parámetros en total y un tamaño de repositorio de 0,9 GB. Está pensado como pieza reutilizable para extracción de características de imagen y vídeo en pipelines de robótica e investigación, no como modelo autónomo.

Su relevancia actual es acotada: se trata de un artefacto de extracción con 0 descargas y 0 likes, validado solo con dos imágenes COCO a 224×224 en CPU y FP32. El autor documenta explícitamente que no se han probado vídeo, precisión de recompensa robótica, salida del modelo completo ni inferencia de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (Qwen3.5 vision tower) con merger espacial, 27 capas, anchura 1152, salida de merger 5120 |
| Parametros totales | 460.730.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (componente visual; la ventana de contexto pertenece al LM no incluido) |
| Tipos de cuantizacion | No disponible (pesos en BF16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), con `component.py`, configuraciones y procesadores de imagen/vídeo |

## Arquitectura y entrenamiento

El componente corresponde a la torre visual de `nvidia/Flora-Rewarder`, basada en la arquitectura de visión de Qwen3.5. Consta de 27 capas transformer con anchura 1152 y un merger espacial que proyecta a 5120 dimensiones. El autor conserva los ficheros de configuración y los procesadores de imagen y vídeo del modelo fuente, y proporciona `component.py` para cargar la arquitectura Qwen3.5 vision con un state dict estricto.

No se aportan datos sobre el entrenamiento original: no se indica número de tokens, composición del dataset ni si hubo RLHF o DPO. La model card menciona una auditoría pareada limitada de tres tensores (patch embed, primera norm y primer QKV) frente a Qwen3.5-27B y Flora-Captioner: tras alinear en BF16, Captioner y base coinciden exactamente en esos tres tensores mientras que Rewarder difiere. El autor señala que esto es consistente con las descripciones upstream (torre visual de Captioner congelada y Rewarder totalmente ajustado), pero no prueba igualdad de la torre completa ni mide cambios de representación.

La procedencia se valida mediante comparación del SHA-256 LFS del shard oficial de Hugging Face con los metadatos del espejo en ModelScope, y mediante hashing de los rangos de bytes descargados y readback de la salida. Los shards completos no se descargaron ni hashearon localmente.

## Capacidades

- Extracción de características visuales a partir de imágenes, con pipeline `image-feature-extraction`.
- Procesamiento de vídeo: los procesadores de imagen y vídeo del modelo fuente se conservan en el repositorio.
- Integración como torre visual en arquitecturas multimodales que esperen la interfaz Qwen3.5 vision (anchura 1152, salida 5120).
- Carga estricta mediante `component.py` con state dict validado.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: esas funciones residen en el LM y las cabezas de recompensa que no forman parte de este extracto.
- No incluye la lógica de anotación robótica ni el sistema de recompensa de vídeo.

## Casos de uso

- Investigación sobre representaciones visuales: permite estudiar las activaciones de la torre visual de Flora-Rewarder de forma aislada, sin cargar el modelo completo de 27B, comparando capas y tensores frente a Qwen3.5-27B o Flora-Captioner.
- Extracción de embeddings de imagen en pipelines de recuperación visual: el componente produce características de 5120 dimensiones utilizables para indexación y búsqueda por similitud, siempre que se añada la cabeza o proyección adecuada.
- Preprocesamiento de vídeo para robótica: al conservar los procesadores de vídeo del modelo fuente, puede emplearse como etapa de codificación visual en experimentos de percepción para agentes robóticos.
- Auditoría de checkpoints: los ficheros `extraction.json`, `tensor_mapping.json`, `validation.json` y `base_comparison.json` sirven como plantilla para verificar la procedencia de componentes extraídos de modelos grandes.
- Docencia y experimentación con arquitecturas de visión: su tamaño (0,9 GB, 460M parámetros) permite cargarlo en entornos modestos para estudiar el funcionamiento de un vision transformer de 27 capas con merger espacial.
- Base para ajuste fino supervisado de la torre visual: al estar aislada y bajo Apache-2.0, puede adaptarse a tareas de clasificación o regresión visual específicas, asumiendo que se debe validar previamente su calidad representacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada es funcional: dos imágenes COCO redimensionadas a 224×224 pasaron carga estricta de state dict y forwards visuales en CPU y FP32, con coincidencia entre atención explícita y SDPA en la primera, intermedia y última capa. El autor advierte que el override de test está por debajo del mínimo del procesador original y que no se prueba vídeo, precisión de recompensa robótica, salida del modelo completo ni inferencia de extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en BF16 para los pesos (460,7M parámetros), más memoria de activaciones según resolución y batch; no se documentan medidas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería alojar los pesos en BF16.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 en adelante) para los pesos; las activaciones a resoluciones altas o con vídeo pueden requerir más memoria.
- Opciones de despliegue: `transformers` con `component.py` (carga estricta del state dict); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un componente visual sin LM estas herramientas no aplican directamente.
- Latencia y throughput: no disponibles. La validación se realizó en CPU y FP32, sin mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/flora-rewarder-vision-encoder | 460,7M | No disponible | Extracción de características visuales | Apache-2.0 | Hugging Face, 0 descargas |
| nvidia/Flora-Rewarder (modelo completo) | No disponible en la información | No disponible | Recompensa de vídeo para robótica | No disponible en la información | Hugging Face (fuente del extracto) |
| Qwen3.5-27B (torre visual de referencia) | 27B (modelo completo) | No disponible | Multimodal | No disponible en la información | Referenciado en la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: carece de LM, cabezas de recompensa, lógica de anotación robótica y sistema de recompensa de vídeo. No puede generar texto ni puntuar vídeo por sí mismo.
- Validación muy limitada: solo dos imágenes COCO a 224×224 en CPU y FP32, con un override por debajo del mínimo del procesador original. No hay pruebas de vídeo ni de inferencia de extremo a extremo.
- La auditoría frente a Qwen3.5-27B y Flora-Captioner cubre solo tres tensores y no demuestra igualdad de la torre completa ni explica la causalidad de las diferencias.
- Los shards completos del modelo fuente no se descargaron ni hashearon localmente; la verificación se basa en hashing de rangos de bytes.
- Riesgo de alucinación y sesgos: no evaluables en este componente, ya que no genera texto; los sesgos del modelo fuente no se documentan en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se incluyen también la licencia original de NVIDIA y la de Qwen3.5-27B en `third_party`; conviene revisar ambas. La model card del modelo fuente describe Flora como modelo de investigación y desarrollo en robótica, no como controlador de robot en producción.
- Para el modelo completo y su uso previsto, el autor remite al runtime oficial de Flora (NVlabs).

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/flora-rewarder-vision-encoder
- Modelo base: https://huggingface.co/nvidia/Flora-Rewarder
- Runtime oficial de Flora: https://github.com/NVlabs/Flora
