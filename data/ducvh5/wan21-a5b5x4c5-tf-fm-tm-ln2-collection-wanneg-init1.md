# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-collection-wanneg-init1

## Resumen

Este repositorio contiene un checkpoint experimental derivado de Wan2.1-T2V-1.3B, el modelo de generación de vídeo a partir de texto desarrollado por Alibaba Wan-AI. El autor, ducvh5, ha aplicado una modificación arquitectónica basada en un transformer recurrente con 15 bloques únicos que se ejecutan 30 veces (patrón A5 → B5×4 → C5), sustituyendo la pila estándar de bloques del modelo base. Se trata de un fine-tune con inicialización específica desde el ciclo 1 del profesor (capas 11–15 del modelo original) y entrenado con una combinación de pérdidas TF+FM+TM.

El modelo mantiene el pipeline text-to-video de Wan2.1 y se distribuye en formato diffusers/safetensors, con un tamaño de repositorio de 41 GB que incluye 12 conjuntos de pesos (EMA y no-EMA). La relevancia es limitada fuera del ámbito de investigación: no hay métricas publicadas, no hay model card descriptiva más allá de los hiperparámetros de entrenamiento, y el número de descargas y likes es cero en el momento de la consulta. Es un artefacto de experimentación sobre arquitecturas recurrentes aplicadas a difusión de vídeo, no un modelo listo para producción.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card mínima del autor. Cualquier dato no presente en esa información se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente sobre base Wan2.1-T2V-1.3B (difusión para vídeo); 15 bloques únicos, 30 ejecuciones (A5 → B5×4 → C5) |
| Parámetros totales | no disponible (el modelo base Wan2.1-T2V-1.3B tiene 1.3B; el checkpoint derivado no declara recuento propio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería diffusers); incluye `step0002000/state.pt` como último estado de entrenamiento |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers y sustituye su pila de bloques por un esquema recurrente: 15 bloques únicos ejecutados 30 veces en el patrón A5 → B5×4 → C5, es decir, cinco bloques de tipo A, un bloque B repetido cuatro veces y cinco bloques de tipo C. La inicialización de los bloques B copia el ciclo 1 del profesor (capas 11–15 del modelo base). El entrenamiento emplea una combinación de pérdidas denotada TF+FM+TM, con programación de ruido σ ~ LN(0,1), shift=2 y t=1000σ, sobre un dataset de latentes en formas nativas, seed 0 y dropout tipo WN. El checkpoint publicado corresponde al paso 2000 (`step0002000/state.pt`) e incluye 12 conjuntos de pesos EMA y no-EMA.

No se especifican en la información disponible el número de tokens o clips de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en difusión de vídeo). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del propio esquema recurrente.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`), heredada de Wan2.1-T2V-1.3B.
- Ejecución con la librería diffusers y pesos en safetensors.
- Checkpoints intermedios y estados de entrenamiento (`state.pt`) para reanudar o inspeccionar el fine-tune.
- Pesos EMA y no-EMA en el mismo snapshot (12 conjuntos).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión: el checkpoint permite reproducir y analizar el esquema A5 → B5×4 → C5 frente a la pila estándar de Wan2.1, comparando calidad y coste computacional con 15 bloques únicos ejecutados 30 veces.
- Estudio de inicialización desde profesor: la copia del ciclo 1 (capas 11–15) facilita experimentos sobre transferencia de pesos en transformers recurrentes.
- Análisis de pérdidas combinadas TF+FM+TM: útil para grupos que investigan funciones de pérdida en difusión de vídeo y quieren comparar curvas de entrenamiento.
- Reanudación de entrenamiento: el archivo `step0002000/state.pt` permite continuar el fine-tune desde el paso 2000 con el mismo optimizador y scheduler.
- Evaluación de EMA vs. no-EMA: los 12 conjuntos de pesos permiten medir el efecto del promediado exponencial en la calidad del vídeo generado.
- Reproducibilidad de experimentos: la seed 0, las formas nativas de latentes y la configuración de ruido documentada permiten replicar el pipeline de recolección de latentes.
- Prototipado de generación de vídeo a baja escala: con 1.3B de parámetros base, es viable en entornos de investigación con una sola GPU de gama alta, aunque sin garantías de calidad de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el modelo base Wan2.1-T2V-1.3B en precisión completa requiere del orden de decenas de GB; el repositorio ocupa 41 GB por incluir 12 conjuntos de pesos, no por el tamaño de un único checkpoint.
- GPU recomendadas: no disponible. Por tamaño del modelo base, cabría esperar viabilidad en A100/H100 y, con cuantización, en RTX 4090; el autor no lo confirma.
- ¿Cabe en GPU de consumo? No disponible; depende de la cuantización, que no se documenta.
- Opciones de despliegue: diffusers (librería declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (estas dos últimas no aplican a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-... (este) | no disponible (base 1.3B) | no disponible | sin benchmarks | no disponible | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.3B | no disponible | benchmarks del modelo original no incluidos en esta información | no disponible en esta información | Hugging Face (modelo base) |
| Otros derivados de Wan2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generación frente al modelo base.
- Model card mínima: solo documenta hiperparámetros de entrenamiento; no describe datos, evaluación ni uso previsto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del modelo base Wan2.1 antes de cualquier despliegue.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Checkpoint en paso 2000: es un estado intermedio de entrenamiento, no necesariamente convergido.
- Riesgo de artefactos y alucinación visual: inherente a modelos de difusión de vídeo sin evaluación publicada.
- Idiomas no declarados: no se puede garantizar el comportamiento con prompts en castellano u otras lenguas.
- Tamaño del repositorio (41 GB) por los 12 conjuntos de pesos: requiere planificación de almacenamiento y ancho de banda.
- Arquitectura experimental (recurrente): puede no ser compatible con tooling estándar de diffusers más allá de la carga básica del pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-collection-wanneg-init1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
