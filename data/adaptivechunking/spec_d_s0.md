# AdaptiveChunking/spec_D_s0

## Resumen

`spec_D_s0` es un checkpoint de investigación publicado por el usuario AdaptiveChunking dentro del repositorio `beetle-hnet`, una implementación de H-Net (Hierarchical Network) orientada al chunking dinámico y a la tokenización a nivel de byte. El modelo se ha entrenado con el entrenador legacy (`legacy/tier1/train.py`) y se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` siguiendo el esquema de un directorio por ejecución de Beetle. No es un modelo instructivo ni un modelo de chat: es un artefacto de experimentación sobre segmentación adaptativa de secuencias.

Con 82.470.528 parámetros y pesos en safetensors, el modelo se sitúa en la franja de los 82 millones de parámetros, un tamaño típico de prototipos de investigación en procesamiento de lenguaje. La model card no documenta arquitectura detallada, datos de entrenamiento, idiomas ni resultados de benchmarks; la información disponible se limita a la organización de checkpoints y a la referencia a las sondas de frontera FLORES+ publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`.

Su relevancia es acotada y experimental: sirve para reproducir y analizar el comportamiento de un H-Net con chunking dinámico sobre representaciones a nivel de byte, no para despliegues de producción en atención al cliente o generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) con chunking dinámico, tokenización byte-level; detalles internos no disponibles |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint), más `config.json` con `model_config`, configuración de entrenamiento y mapa `tied_weights` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una ejecución de H-Net a nivel de byte («Byte-level H-Net run») procedente del repositorio `beetle-hnet`, entrenada con el entrenador legacy en `legacy/tier1/train.py`. La etiqueta `hnet` y la mención a `dynamic-chunking` apuntan a una arquitectura jerárquica que agrupa dinámicamente tokens o bytes en unidades de mayor nivel, pero la información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema exacto de chunking.

El entrenamiento se realizó con el entrenador legacy, que según la model card no conservaba estado del optimizador; por eso el repositorio no incluye `training_state/`. Se conservan 21 checkpoints en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con `model.safetensors` y `config.json`; la rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El mapa `tied_weights` debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada. No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste instructivo.

## Capacidades

- Generación y modelado de lenguaje a nivel de byte: el modelo opera sobre bytes, no sobre un vocabulario BPE o SentencePiece predefinido.
- Chunking dinámico: la arquitectura H-Net está diseñada para segmentar la secuencia de entrada en unidades jerárquicas de forma adaptativa.
- Evaluación de fronteras de segmentación: las sondas FLORES+ del dataset `hnet-chunking-probes` (subcarpeta `spec_D_s0/`) permiten analizar dónde coloca el modelo las fronteras de chunk.
- Reproducibilidad experimental: los 21 checkpoints intermedios permiten estudiar la evolución del comportamiento durante el entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; las sondas FLORES+ sugieren evaluación sobre textos multilingües, pero no se especifica qué idiomas cubre el entrenamiento.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre tokenización byte-level: usar los checkpoints para comparar representaciones a nivel de byte frente a tokenizadores subword en tareas controladas de laboratorio.
- Estudio de chunking dinámico: analizar las fronteras de segmentación que produce el modelo con las sondas FLORES+ publicadas y contrastarlas con segmentaciones de referencia.
- Reproducción de experimentos: restaurar los pesos con el mapa `tied_weights` y el `config.json` de cada rama `step-N` para replicar curvas de entrenamiento a partir de `log.jsonl`.
- Análisis de dinámica de entrenamiento: los 21 checkpoints permiten trazar cómo evoluciona la pérdida y el comportamiento de segmentación entre el paso 0 y el paso 2000.
- Base para ablaciones de arquitectura: partir de este checkpoint de 82 M para probar variantes de H-Net con chunking adaptativo en entornos de investigación con recursos limitados.
- Evaluación de robustez en dominios con ortografía irregular: al operar sobre bytes, el modelo puede procesar texto con errores tipográficos o alfabetos no vistos sin depender de un vocabulario fijo, aunque su calidad real no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 330 MB solo para pesos (82,47 M × 4 bytes), más activaciones y memoria del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 165 MB para pesos, más overhead.
- El tamaño del repositorio es de 6,9 GB, dominado por los 21 checkpoints en safetensors; conviene descargar solo la rama necesaria.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre debería poder cargar los pesos; no se dispone de datos de latencia ni throughput.
- Cabe en GPU consumer (RTX 3060, RTX 4060, RTX 4090, etc.) por el reducido número de parámetros.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura H-Net no estándar, no se garantiza compatibilidad con vLLM, TGI, llama.cpp u Ollama; el código de referencia es `beetle-hnet`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AdaptiveChunking/spec_D_s0 | 82,47 M | no disponible | Apache 2.0 | Hugging Face | Checkpoint de investigación H-Net byte-level, sin benchmarks |
| AdaptiveChunking/hnet-chunking-spec-82m | ~82 M (repo empaquetado) | no disponible | no disponible en la información | Hugging Face | Repositorio original del que se separó esta ejecución |
| Modelos tipo GPT-2 small | 124 M | 1024 tokens | MIT | Hugging Face | Referencia de tamaño similar, pero arquitectura transformer estándar y con benchmarks públicos |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo instructivo ni de chat: no se ha documentado ajuste por instrucciones, RLHF o DPO.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas similares.
- Idiomas no documentados: no se puede garantizar cobertura multilingüe aunque existan sondas FLORES+.
- Longitud de contexto desconocida: no se especifica la ventana máxima soportada.
- Riesgo de alucinación: no evaluado; al ser un modelo base de investigación, la generación libre puede ser incoherente.
- Sesgos: no documentados; el dataset de entrenamiento no se describe.
- Restauración manual de pesos: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); una carga ingenua puede producir pesos incorrectos.
- Sin estado del optimizador: no es posible reanudar el entrenamiento exactamente desde los checkpoints publicados.
- Licencia Apache 2.0: permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- Compatibilidad limitada: al no ser una arquitectura transformer estándar, las herramientas de inferencia habituales pueden no soportarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_D_s0
- Repositorio original empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código de referencia beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
