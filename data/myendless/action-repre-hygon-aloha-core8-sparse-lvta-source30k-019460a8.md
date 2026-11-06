# myendless/action-repre-hygon-aloha-core8-sparse-lvta-source30k-019460a8

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica desarrollado por el usuario myendless, inicializado a partir de Qwen/Qwen3-VL-4B-Instruct y afinado sobre el conjunto ALOHA Core-8 con un objetivo auxiliar de representación de acciones (LVTA, *latent visual trajectory action*) con supervisión dispersa. El entrenamiento se realizó sobre 8 GPUs Hygon con semilla 42 y batch global de 128, alcanzando 30 000 pasos y una pérdida final de 0,02403. No se trata de un modelo conversacional ni de un VLM de propósito general, sino de un artefacto experimental orientado a la evaluación de representaciones de acción en robótica.

Es relevante ahora porque documenta una línea de trabajo concreta: reutilizar un backbone VLM de 4B parámetros (Qwen3-VL-4B-Instruct) como extractor de representaciones para políticas robóticas, con protocolo de estado/ejecución joint14/H32 y una cabeza de acción auxiliar supervisada solo en el último paso. El autor advierte explícitamente de que este repositorio no es un modelo completo de lectura de acciones ARX: requiere una fase posterior de *fresh action expert* para poder realizar la evaluación de acciones entre cuerpos.

El peso se distribuye como un `model.pt` con el state_dict nativo completo (incluida la rama auxiliar), no como un directorio estándar de Transformers, y debe cargarse con el cargador nativo de Action Representation Benchmark. El repositorio ocupa 12,9 GB, no incluye optimizer, RNG ni imágenes de entrenamiento, y no cuenta con resultados publicados de evaluación en bucle cerrado ni de VQA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL-4B-Instruct) con rama auxiliar de representación de acción |
| Parámetros totales | 4B (heredados del modelo base; no se especifica el total tras añadir la rama auxiliar) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict nativo completo, incluida la rama auxiliar); no es un directorio estándar de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal de 4B parámetros, y se afina sobre ALOHA Core-8 con un objetivo auxiliar de trayectoria visual de acción (LVTA) bajo supervisión dispersa: solo se supervisa el último paso de acción. El protocolo de estado/ejecución es joint14/H32. El entrenamiento se llevó a cabo en 8 GPUs Hygon con semilla 42 y batch global de 128, durante 30 000 pasos, con una pérdida final de 0,024030975997447968.

Un detalle técnico relevante es que el entrenamiento no actualiza la cabeza de ejecución de acciones; por tanto, el checkpoint no es un modelo de lectura de acciones ARX listo para usar y necesita una fase posterior de *fresh action expert* para la evaluación de acciones entre cuerpos. El autor indica que no sube optimizer, RNG ni imágenes de entrenamiento, y que la ruta de código fusionada no sobrescribe el registro de procedencia de ejecuciones históricas. El run se identifica como `hygon_core8_aloha_lvta_sparse_v4_repr30k_seed42_gpfs_20261031_v1`.

## Capacidades

- Extracción de representaciones de acción en el marco de Action Representation Benchmark, con protocolo joint14/H32.
- Objetivo auxiliar de trayectoria visual de acción (LVTA) con supervisión dispersa sobre el último paso.
- Backbone VLM multimodal heredado de Qwen3-VL-4B-Instruct (comprensión de imagen y texto), aunque el autor no documenta evaluaciones de VQA para este checkpoint.
- Soporte de tool calling / function calling: no disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: zh, en (heredadas del modelo base).
- Modo *thinking*, visión o audio adicional: no disponible.

## Casos de uso

- Investigación en representaciones de acción para robótica: usar el checkpoint como extractor de representaciones y comparar su calidad frente a otras inicializaciones dentro de Action Representation Benchmark, cargándolo con el cargador nativo.
- Reproducción de experimentos de supervisión dispersa: el repositorio incluye configuración original, processor, manifest, norm, métricas de entrenamiento e identidad de código, lo que permite replicar el run `hygon_core8_aloha_lvta_sparse_v4_repr30k_seed42_gpfs_20261031_v1`.
- Punto de partida para una fase de *fresh action expert*: entrenar una cabeza de acción que lea acciones ARX y habilitar así la evaluación entre cuerpos que el checkpoint actual no soporta.
- Estudio de entrenamiento en hardware no NVIDIA: el run se ejecutó en 8 GPUs Hygon, por lo que sirve como referencia para validar pipelines de entrenamiento en esa plataforma.
- Análisis de estabilidad de pérdida: con 30 000 pasos y pérdida final de 0,02403, el checkpoint es útil para estudiar curvas de convergencia del objetivo LVTA disperso.
- Auditoría de procedencia de pesos: el SHA256 publicado permite verificar la integridad del state_dict en pipelines de CI o en réplicas de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que aún no hay resultados de evaluación en bucle cerrado ni de VQA para estos pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,9 GB en `model.pt`; a título orientativo, cargar un state_dict de ese tamaño en FP32 requeriría del orden de 13 GB de VRAM solo para pesos, sin activaciones ni overhead del runtime, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 8 GPUs Hygon, pero no se especifica el modelo exacto ni la memoria por GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual; requiere el cargador nativo de Action Representation Benchmark. No es un directorio estándar de Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (myendless) | 4B (base) | no disponible | Representación de acción robótica (LVTA, ALOHA Core-8) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | VLM conversacional multimodal | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas de política robótica de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento no actualiza la cabeza de ejecución de acciones: este repositorio no es un modelo de lectura de acciones ARX y no puede usarse para evaluación entre cuerpos sin una fase de *fresh action expert*.
- No hay resultados de evaluación en bucle cerrado ni de VQA publicados para estos pesos; el rendimiento real en tareas robóticas es desconocido.
- El formato `model.pt` con state_dict nativo no es cargable con Transformers estándar; requiere el cargador de Action Representation Benchmark.
- No se publican optimizer, RNG ni imágenes de entrenamiento, lo que limita la reproducibilidad exacta del proceso de entrenamiento.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Idiomas limitados a zh y en según los metadatos; no hay evidencia de capacidades multilingües adicionales en este checkpoint.
- Riesgo de alucinación y sesgos: no evaluado para este checkpoint; al ser un artefacto de investigación sin evaluaciones publicadas, no debe desplegarse en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/myendless/action-repre-hygon-aloha-core8-sparse-lvta-source30k-019460a8
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Action Representation Benchmark: no disponible (no se proporciona URL en la información)
- Paper, blog, repositorio de código o demo: no disponible
