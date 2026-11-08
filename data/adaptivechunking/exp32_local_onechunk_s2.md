# AdaptiveChunking/exp32_local_onechunk_s2

## Resumen

exp32_local_onechunk_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento basada en la arquitectura H-Net (hierarchical network) con procesamiento a nivel de byte, ejecutada mediante el framework beetle-hnet y el denominado "legacy trainer" (legacy/tier1/train.py). El modelo fue extraído del repositorio empaquetado AdaptiveChunking/hnet-chunking-spec-82m y reorganizado en el formato por ejecución de Beetle.

Con 82.470.528 parámetros totales según los pesos en safetensors, el modelo se enmarca en la línea de experimentos sobre chunking dinámico y tokenización byte-level. Su relevancia es fundamentalmente investigadora: explora cómo una red jerárquica segmenta y procesa secuencias a nivel de byte sin depender de un tokenizador subword convencional, un área de interés para quienes estudian alternativas a la tokenización clásica y modelos con ventanas de contexto adaptativas.

No es un modelo de propósito general listo para producción: no se declara pipeline, idiomas soportados ni resultados de benchmarks, y la model card se limita a describir la estructura de checkpoints y el procedimiento de restauración de pesos. Debe tratarse como material reproducible de un experimento de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) con procesamiento byte-level, según los tags del repositorio (hnet, byte-level, beetle-hnet) |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) más config.json por checkpoint; pesos con mapa tied_weights |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, orientada al procesamiento a nivel de byte y al chunking dinámico. Según la model card, el entrenamiento se realizó con el legacy trainer (legacy/tier1/train.py), un entrenador heredado que no conserva estado del optimizador, motivo por el cual el repositorio no incluye el directorio training_state/. Los pesos presentan un mapa de pesos atados (tied_weights) que debe restaurarse aplicando sd[dst] = sd[src] para cada entrada antes de la carga.

El repositorio conserva 21 checkpoints retenidos en ramas step-N (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, entre otros), cada uno con su model.safetensors y config.json que incluye model_config, la configuración de entrenamiento y el mapa tied_weights. La rama main contiene los pesos más recientes junto con final.json y log.jsonl. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Las sondas de frontera FLORES+ asociadas a esta ejecución se publican en el dataset AdaptiveChunking/hnet-chunking-probes, bajo el prefijo exp32_local_onechunk_s2/.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre bytes en lugar de tokens subword, lo que permite, en principio, cubrir cualquier cadena de entrada sin vocabulario fijo.
- Chunking dinámico: la arquitectura H-Net está diseñada para segmentar secuencias de forma adaptativa, capacidades que constituyen el objeto central del experimento.
- Reproducibilidad de entrenamiento: al conservar 21 checkpoints intermedios, permite estudiar la evolución del aprendizaje paso a paso.
- Evaluación de fronteras de segmentación: las sondas FLORES+ publicadas permiten analizar el comportamiento del modelo en límites de unidades lingüísticas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como punto de partida para comparar el rendimiento de un enfoque sin tokenizador subword frente a modelos con vocabulario BPE en tareas controladas de laboratorio.
- Estudio del chunking dinámico: los checkpoints intermedios permiten analizar cómo evoluciona la segmentación jerárquica a lo largo del entrenamiento, comparando las representaciones en los pasos 0, 256, 1000 y 2000.
- Reproducción de experimentos: al documentarse la configuración de entrenamiento en cada config.json y el log en log.jsonl, el repositorio facilita replicar la ejecución con el legacy trainer de beetle-hnet.
- Análisis de fronteras lingüísticas: las sondas FLORES+ del dataset hnet-chunking-probes permiten evaluar el comportamiento del modelo en límites de palabra, frase y oración en distintos idiomas.
- Base para fine-tuning académico: con 82 millones de parámetros y licencia Apache 2.0, el modelo puede ajustarse en entornos con recursos limitados para estudiar variantes de la arquitectura H-Net.
- Docencia y divulgación: su tamaño moderado y su naturaleza byte-level lo hacen adecuado para ilustrar el funcionamiento interno de redes jerárquicas y de los esquemas de pesos atados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 330 MB solo para pesos (82,47 M de parámetros × 4 bytes), más activaciones y caché según la longitud de secuencia, que no se documenta.
- VRAM estimada en fp16/bf16: aproximadamente 165 MB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) puede alojar los pesos; el cuello de botella dependerá de la longitud de secuencia y de la implementación de la capa jerárquica, no del tamaño del modelo.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: el repositorio solo declara library_name pytorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La carga requiere restaurar previamente el mapa tied_weights.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exp32_local_onechunk_s2 | 82,47 M | no disponible | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (checkpoint de investigación) |
| hnet-chunking-spec-82m | no disponible en la información | no disponible | H-Net, repositorio empaquetado del que se extrajo esta ejecución | Apache 2.0 (según repositorio de origen) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma organización o categoría que permita una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, por lo que no puede evaluarse su calidad objetiva.
- Modelo de investigación: es un checkpoint intermedio de un experimento de entrenamiento, no un modelo afinado para uso en producción.
- Idiomas no declarados: se desconoce qué lenguas cubre realmente y con qué calidad.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que impide planificar despliegues con entradas largas.
- Riesgo de alucinación: no evaluado ni documentado; al no haber alignment declarado (RLHF/DPO), no hay garantías de comportamiento seguro.
- Sesgos: no se documentan análisis de sesgo; el dataset de entrenamiento no se describe.
- Carga no trivial: requiere restaurar el mapa tied_weights (sd[dst] = sd[src]) antes de la inferencia; una carga directa de model.safetensors puede producir pesos incorrectos.
- Sin estado del optimizador: el legacy trainer no guardó training_state/, por lo que no es posible reanudar el entrenamiento desde estos checkpoints sin reconstruir el estado.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin evaluación, su uso en producción no está respaldado por evidencias de rendimiento.
- Repositorio de gran tamaño: 6,9 GB para 82 millones de parámetros indica que el repositorio incluye múltiples checkpoints, no un único conjunto de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_local_onechunk_s2
- Repositorio de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
