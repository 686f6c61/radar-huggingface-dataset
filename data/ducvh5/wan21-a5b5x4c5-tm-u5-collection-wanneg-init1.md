# ducvh5/wan21-a5b5x4c5-tm-u5-collection-wanneg-init1

## Resumen

Este repositorio contiene un checkpoint experimental derivado de Wan2.1-T2V-1.3B, el modelo de generación de vídeo a partir de texto de código abierto publicado por Alibaba Wan-AI. El autor (ducvh5) ha aplicado una reestructuración interna de bloques denominada "A5 → B5×4 → C5", que reorganiza la pila de bloques del transformer original en un esquema con 15 bloques únicos y 30 ejecutados, introduciendo recursión o reutilización de bloques. Se etiqueta como "recurrent-transformer" y se distribuye en formato diffusers con pesos safetensors, lo que permite cargarlo con la librería Diffusers como un pipeline text-to-video.

El modelo no es un lanzamiento oficial ni una versión nueva de Wan2.1: es un fine-tune o reestructuración de inicialización ("init1") sobre el modelo base de 1.300 millones de parámetros, entrenado sobre una colección de latentes con un objetivo de pérdida propio ("TM, all loop exits") y un esquema de ruido con σ ~ U(0,1), shift 5 y t = 1000σ. El snapshot incluye tres conjuntos de pesos (EMA y no EMA) y un estado de entrenamiento en el paso 500, lo que lo sitúa como un artefacto de investigación más que como un modelo listo para producción.

Su relevancia es acotada: sirve como referencia para quienes experimentan con arquitecturas recurrentes aplicadas a difusión de vídeo y con la inicialización de ciclos de bloques a partir de un profesor. No hay métricas publicadas, ni licencia declarada, ni idiomas especificados, lo que limita su adopción fuera de entornos de prueba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (Wan2.1) con reorganización recurrente de bloques (A5 → B5×4 → C5; 15 bloques únicos / 30 ejecutados) |
| Parámetros totales | 1.300 millones (heredados de Wan2.1-T2V-1.3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors sin variantes GGUF/FP8 publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato diffusers), más `state.pt` del paso 500 |

## Arquitectura y entrenamiento

La base es Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo a partir de texto. Sobre esa pila, el autor aplica una reestructuración en tres tramos: un bloque A repetido 5 veces, un bloque B repetido 4 veces y un bloque C repetido 5 veces, lo que da 15 bloques únicos que se ejecutan 30 veces en total. Esta reutilización de bloques es la que justifica la etiqueta "recurrent-transformer": en lugar de una pila lineal de bloques distintos, el modelo recicla parámetros en varios puntos del recorrido, reduciendo el número de bloques únicos necesarios para una profundidad efectiva mayor.

El entrenamiento se describe de forma muy escueta en la model card. Se usa una "latent collection" con formas nativas, semilla 0 y dropout "WN". El objetivo de pérdida se denomina "TM (all loop exits)", es decir, se aplica supervisión en todas las salidas de los bucles recurrentes. El esquema de ruido sigue σ ~ U(0,1) con shift 5 y t = 1000σ. La inicialización ("init1") copia el ciclo 1 del profesor en las capas 11–15 del modelo base, de modo que el bloque B arranca desde pesos del profesor Wan2.1. El snapshot contiene tres conjuntos de pesos EMA y no EMA, y el último estado guardado corresponde al paso 500 (`step0000500/state.pt`), lo que indica un entrenamiento corto y probablemente no convergido. No se especifican tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline Wan2.1-T2V-1.3B.
- Reutilización recurrente de bloques, que en teoría permite mayor profundidad efectiva con menos parámetros únicos.
- Entrenamiento con supervisión en todas las salidas de bucle ("all loop exits"), pensado para estabilizar la recursión.
- Compatibilidad con la librería Diffusers al estar en formato diffusers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; el modelo base Wan2.1 acepta prompts en varios idiomas, pero esta variante no lo especifica.

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión de vídeo: el checkpoint permite reproducir y comparar la reorganización A5 → B5×4 → C5 frente al Wan2.1 original en tareas de generación de clips cortos.
- Estudio de inicialización de ciclos: sirve para analizar cómo afecta copiar el ciclo 1 del profesor (capas 11–15) al comportamiento del bloque B en las primeras etapas de entrenamiento.
- Experimentos de pérdida en salidas de bucle: útil para evaluar el objetivo "TM (all loop exits)" frente a supervisión solo en la salida final.
- Pruebas de esquemas de ruido: el ajuste σ ~ U(0,1) con shift 5 y t = 1000σ puede compararse con schedulers estándar en pipelines Diffusers.
- Base para fine-tunes posteriores: al estar en formato diffusers, puede cargarse y ajustarse con herramientas habituales para tareas de vídeo específicas.
- Docencia y divulgación: ejemplo práctico de cómo se reestructura un transformer de difusión y se guardan estados intermedios (paso 500) para inspección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15 GB e incluye tres conjuntos de pesos EMA/no EMA; cargar un único conjunto en fp16 requiere del orden de 2,6 GB solo para pesos, pero el pipeline de difusión de vídeo añade memoria para latentes y activaciones, por lo que se recomienda al menos 16 GB de VRAM para clips cortos y 24 GB o más para resoluciones mayores.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables, pero no hay datos oficiales.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 16–24 GB, aunque no está verificado.
- Opciones de despliegue: Diffusers (formato nativo del repo); no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5-collection-wanneg-init1 | 1.300 M | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | benchmarks del modelo original no incluidos aquí | licencia del modelo base (consultar repo original) | Hugging Face, modelo base oficial |
| Otros derivados de Wan2.1-T2V-1.3B | 1.300 M | no disponible | no disponible | variable según autor | Hugging Face |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros text-to-video de ~1.300 M) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental en el paso 500: no hay evidencia de convergencia ni de calidad de generación.
- Sin licencia declarada: no se puede asumir uso comercial; hay que consultar la licencia del modelo base Wan2.1-T2V-1.3B.
- Sin benchmarks ni métricas de calidad publicadas.
- Idiomas no especificados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación visual y artefactos propios de un modelo de difusión de vídeo poco entrenado.
- La reorganización recurrente de bloques puede introducir inestabilidad no documentada.
- El repositorio incluye tres conjuntos de pesos (EMA/no EMA) y un `state.pt`; hay que elegir explícitamente cuál cargar.
- Sin soporte documentado para cuantización ni para despliegue en motores de inferencia distintos de Diffusers.
- Fecha de creación futura (2026-11-15) en los metadatos: conviene verificar la procedencia del snapshot.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-collection-wanneg-init1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Diffusers (librería): https://github.com/huggingface/diffusers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
