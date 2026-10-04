# flavianv/abstractgym-qwen3-14b-dfs-step

## Resumen

El modelo `abstractgym-qwen3-14b-dfs-step` es un adaptador LoRA desarrollado por el usuario flavianv sobre el modelo base Qwen/Qwen3-14B. Forma parte del proyecto de investigación AbstractGym y está diseñado específicamente como controlador de siguiente acción en tareas de búsqueda en profundidad (DFS) acotada. No se trata de un ejecutor general de programas, sino de un componente especializado que predice la siguiente acción dentro de un espacio de estados DFS predefinido y con mutación de estado externa.

El adaptador se entrenó a partir de 64 trayectorias de entrenamiento que se expandieron a 11.002 ocurrencias de estado y 10.450 prompts distintos. La evaluación se realizó sobre una escalera de complejidad de 240 casos y seis familias, con niveles 1, 2, 4, 8 y 16. El modelo se distribuye con licencia Apache-2.0 y solo incluye los pesos del adaptador en formato safetensors, sin estado del optimizador.

Su relevancia es principalmente investigadora: explora el uso de modelos de lenguaje como controladores neuro-simbólicos para algoritmos de búsqueda, midiendo precisión de membresía, precisión de acción local y ejecución completa. No cuenta con descargas ni valoraciones en HuggingFace y no se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) para este adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-14B (transformer decoder-only) |
| Parámetros totales | 14B (modelo base) + adaptador LoRA (rango 16, alpha 32; número de parámetros del adaptador no disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors del adaptador) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea una configuración LoRA ordinaria con rango 16, alpha 32 y dropout 0, aplicada sobre las proyecciones q, k, v, o y gate, up, down. El modelo base se cargó en BF16 y los adaptadores se entrenaron en FP32. El optimizador fue AdamW con weight decay 0,01, warmup del 5%, decaimiento de LR coseno y recorte de gradiente a 1. Se realizaron 3 épocas, 1.032 actualizaciones del optimizador, con batch efectivo 32 (microbatch 8 × acumulación 4) y LR 2e-4. La pérdida fue entropía cruzada solo sobre la respuesta, con 27.750.309 tokens procesados programados. Se habilitó gradient checkpointing.

El entrenamiento se hizo sobre una tarea canónica de DFS acotada, no sobre ejecución arbitraria de programas. La revisión del modelo base está fijada en `Qwen/Qwen3-14B` con hash `40c069824f4251a91eefaf281ebe4c544efd3e18`. El adaptador se encuentra en el subdirectorio `seed-17/`. Solo se publica el checkpoint final, sin selección sobre conjunto de validación. La evaluación se realizó con decodificación greedy, sin modo thinking, con un límite de 128 tokens para paso/directo y 4.096 para traza completa.

## Capacidades

- Predicción de la siguiente acción en un controlador DFS acotado, con estados proporcionados por un harness externo.
- Cálculo de precisión de membresía (direct membership) sobre estados concretos.
- Cálculo de precisión de acción local (all teacher states / live external state).
- Generación de trazas completas de ejecución DFS, aunque con éxito limitado (0/240 en la evaluación publicada).
- Soporte de mapas de símbolos, familias gramaticales y límite de profundidad transferibles según la model card.
- No soporta tool calling, function calling ni agentes multi-paso generales.
- No soporta visión, audio ni otras modalidades.
- No incluye mecanismos de recuperación o reparación de errores.
- Idioma: exclusivamente inglés.

## Casos de uso

- Investigación en control neuro-simbólico: el adaptador permite estudiar cómo un LLM predice acciones en un algoritmo DFS acotado, comparando precisión de membresía frente a ejecución completa en entornos controlados.
- Evaluación de robustez en tareas de búsqueda: se puede usar para medir la degradación de un controlador LLM a medida que aumenta la profundidad o la complejidad gramatical (niveles 1, 2, 4, 8, 16).
- Generación de datos sintéticos para entrenamiento de planificadores: las trazas parciales generadas pueden servir como ejemplos positivos o negativos en pipelines de aprendizaje por imitación.
- Benchmarking de adaptadores PEFT en tareas algorítmicas: sirve como punto de referencia reproducible para comparar configuraciones LoRA (rango, alpha, proyecciones) en una tarea de control discreta.
- Análisis de transferencia de representaciones: permite estudiar si un adaptador entrenado en una familia gramatical mantiene su precisión al cambiar mapas de símbolos o límites de profundidad.
- Docencia e investigación en algoritmos de búsqueda: útil para demostrar las diferencias entre precisión local y ejecución completa en sistemas híbridos LLM + motor simbólico.
- No se recomienda su uso en producción para ejecución de programas, atención al cliente, generación de código general ni tareas de razonamiento abierto.

## Benchmarks y rendimiento

Resultados exactos en el conjunto de retención (240 casos, seis familias, niveles 1, 2, 4, 8, 16), según la model card:

| Interfaz | Éxitos / casos |
|---|---|
| Traza completa | 0/240 |
| Todos los estados del profesor | 133/240 |
| Estado externo en vivo | 133/240 |
| Membresía directa | 237/240 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se proporcionan comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base Qwen3-14B: aproximadamente 28 GB en BF16, 14 GB en cuantización de 8 bits y 8-10 GB en 4 bits. El adaptador añade una sobrecarga mínima (rango 16).
- GPU recomendadas: A100 40GB, H100 80GB, o GPUs con al menos 24 GB para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización 4 bits; en RTX 4080/4070 Ti (16 GB o menos) requeriría cuantizaciones más agresivas no documentadas.
- Opciones de despliegue: transformers + PEFT (carga nativa del adaptador), vLLM o TGI (previa fusión de pesos), llama.cpp (previa conversión a GGUF, no incluida).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores específicos para control DFS en la documentación proporcionada. Se compara con el modelo base y con la categoría general de adaptadores LoRA:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abstractgym-qwen3-14b-dfs-step | 14B + LoRA | no disponible | 237/240 en membresía directa; 0/240 en traza completa | apache-2.0 | Repositorio HuggingFace con 0 descargas |
| Qwen/Qwen3-14B (base) | 14B | no disponible | No evaluado en la tarea DFS | apache-2.0 | Ampliamente disponible |
| Adaptadores LoRA genéricos para razonamiento | Variable | Depende del base | No comparable directamente | Variable | Variable |

No se conocen alternativas públicas equivalentes para esta tarea concreta.

## Limitaciones y advertencias

- Entrenado con una única semilla y una única receta fija; no se ha validado con múltiples semillas.
- La precisión de membresía, la precisión de acción local y la ejecución completa son métricas diferentes y no intercambiables.
- Los mapas de símbolos, la familia gramatical y el límite de profundidad son transferibles, pero el harness externo es quien realiza la mutación de estado; los pesos no constituyen un ejecutor general fiable.
- No incluye mecanismos de recuperación o reparación de errores.
- El rendimiento en traza completa es nulo (0/240) en la evaluación publicada.
- Idioma limitado a inglés.
- Licencia Apache-2.0 para los adaptadores; el uso comercial está permitido, pero el modelo base Qwen3-14B se obtiene por separado y también es Apache-2.0.
- Riesgo de alucinación en la predicción de acciones fuera de la distribución de entrenamiento.
- No apto para producción en tareas de ejecución de programas, razonamiento abierto o generación de código general.

## Enlaces

- HuggingFace: https://huggingface.co/flavianv/abstractgym-qwen3-14b-dfs-step
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Código público de AbstractGym: https://github.com/flavianv/abstractgym-public/tree/main
- Resultados de evaluación: `docs/results/2026-10-04-x7` en el repositorio de código público
- No se han proporcionado papers, blogs o demos adicionales en la información disponible.
