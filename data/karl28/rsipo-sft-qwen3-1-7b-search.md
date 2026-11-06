# Karl28/RSIPO-SFT-Qwen3-1.7B-Search

## Resumen

RSIPO-SFT-Qwen3-1.7B-Search es un checkpoint de ajuste fino supervisado (SFT) de etapa 1 construido sobre Qwen/Qwen3-1.7B, desarrollado por Karl28 (Fan Zhang y colaboradores) en el marco del trabajo RSIPO (Recursive Self-Improving Policy Optimization). No es un modelo final: es el punto de inicialización exacto del entrenamiento por refuerzo de 150 pasos que da lugar al checkpoint final RSIPO-Qwen3-1.7B-Search. Su relevancia es fundamentalmente metodológica: sirve para reproducir el pipeline completo de RSIPO aplicado a tareas de question answering con búsqueda (search-based QA).

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B, con 2.031.739.904 parámetros totales según los safetensors del repositorio. El ajuste SFT enseña al modelo a producir resúmenes de episodio y habilidades reutilizables ("skills") a partir de trayectorias de agente, un paso previo a la co-evolución habilidad-política que RSIPO explota durante el RL.

Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y soporte para transformers y text-generation-inference. Está pensado para investigadores que quieran reproducir el artículo, no como modelo de producción listo para usar, dado que su comportamiento esperado es el de un inicializador y no el de una política entrenada por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos originales en FP32; config.json declara bfloat16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32 en los tensores; config.json con torch_dtype bfloat16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3-1.7B, un transformer decoder-only denso. El entrenamiento SFT se realizó sobre 500 tareas de entrenamiento, para cada una de las cuales el modelo base recolectó 8 trayectorias (4.000 trayectorias en total). GLM-5.2 generó, para cada trayectoria, un resumen de episodio y una habilidad reutilizable, y el modelo se ajustó para producir esos análisis durante 3 épocas, con learning rate 5e-6 y batch global de 8. La recolección de rollouts y el SFT se hicieron en modo no-thinking (enable_thinking=False). Los conjuntos de entrenamiento y validación contienen 3.589 y 399 ejemplos respectivamente.

Un detalle técnico relevante para la reproducibilidad: los tensores en safetensors están en FP32, mientras que config.json conserva torch_dtype bfloat16 de la exportación. Los lanzadores de RSIPO usan bfloat16 para rollout e inferencia. Este checkpoint precede al entrenamiento RL de 150 pasos y no incorpora la optimización de política que caracteriza a RSIPO; su función es la de inicialización exacta del run.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen3-1.7B.
- Producción de resúmenes de episodio y habilidades reutilizables a partir de trayectorias de agente (objetivo directo del SFT).
- Soporte de razonamiento multi-paso orientado a agentes de búsqueda, como inicializador del pipeline RSIPO.
- Integración con el ecosistema transformers y text-generation-inference (tag endpoints_compatible).
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada para este checkpoint concreto.
- Modo thinking: el entrenamiento se realizó con enable_thinking=False; no se documenta soporte de thinking mode en este checkpoint.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión y audio: no soportados.

## Casos de uso

- Reproducción del artículo RSIPO: descargar el checkpoint y lanzar `bash scripts/rsipo/run_rsipo.sh search RSIPO-SFT-Qwen3-1.7B-Search` para replicar el run de RL sobre search-based QA, usando este SFT como inicialización exacta.
- Investigación en co-evolución habilidad-política: partir de este checkpoint para estudiar cómo las habilidades generadas en SFT se refinan durante el RL y afectan a la política final.
- Generación de anotaciones de trayectorias: usar el modelo para producir resúmenes de episodio y skills sobre nuevas trayectorias de agente, como generador auxiliar en pipelines de datos.
- Experimentos controlados de SFT vs RL: comparar el comportamiento de este checkpoint con el modelo final RSIPO-Qwen3-1.7B-Search para aislar la contribución del entrenamiento por refuerzo.
- Baseline en investigación de agentes de búsqueda: emplear el modelo como punto de partida de 1.7B parámetros en experimentos de QA con recuperación, dado su bajo coste computacional.
- Docencia y formación: ilustrar el pipeline completo SFT → RL en un caso reproducible con datos y código públicos, con un modelo que cabe en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4 GB solo para pesos (2.031.739.904 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 5 y 8 GB según longitud de contexto y batch.
- Los pesos originales en FP32 ocupan unos 8,1 GB (tamaño del repo), por lo que cargarlos sin conversión requiere al menos 8-9 GB de VRAM.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100; también cabe en GPUs de consumo con 8 GB o más en bfloat16.
- Despliegue: transformers, text-generation-inference (tag text-generation-inference), y conversión a GGUF para llama.cpp/Ollama no documentada en la información disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| RSIPO-SFT-Qwen3-1.7B-Search | 2,03 B | no disponible | Apache 2.0 | SFT etapa 1, inicializador de RL |
| Qwen/Qwen3-1.7B (base) | 1,7 B (nominal) | no disponible | Apache 2.0 | Modelo base preentrenado |
| Karl28/RSIPO-Qwen3-1.7B-Search | no disponible | no disponible | Apache 2.0 | Checkpoint final tras 150 pasos de RL |

La comparación relevante es interna al propio pipeline RSIPO: este checkpoint se sitúa entre el modelo base Qwen3-1.7B y el checkpoint final entrenado por RL. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas externas.

## Limitaciones y advertencias

- No es una política final: el autor indica explícitamente que precede al entrenamiento RL de 150 pasos y no debe evaluarse como el modelo RSIPO completo.
- Idiomas: solo inglés documentado; el rendimiento en castellano u otros idiomas no está garantizado.
- Modo thinking desactivado durante el entrenamiento; no se documenta soporte de razonamiento extendido en este checkpoint.
- Inconsistencia de precisión: tensores en FP32 con config.json declarando bfloat16; cargar sin cuidado puede provocar un uso de memoria superior al esperado o conversiones implícitas.
- Riesgo de alucinación: inherente a un modelo de 1.7B ajustado sobre datos sintéticos generados por GLM-5.2; no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados en la información disponible; hereda los del modelo base y los del dataset sintético de trayectorias.
- Uso comercial: permitido por Apache 2.0, pero al ser un checkpoint de investigación sin evaluación de producción, no se recomienda su despliegue directo en sistemas críticos.
- Requiere infraestructura adicional (retriever y datos de búsqueda) para el caso de search-based QA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karl28/RSIPO-SFT-Qwen3-1.7B-Search
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper RSIPO: https://arxiv.org/abs/2610.15772
- Código: https://github.com/zfkarl/RSIPO
- Dataset de etapa 1: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Checkpoint final RSIPO: https://huggingface.co/Karl28/RSIPO-Qwen3-1.7B-Search
