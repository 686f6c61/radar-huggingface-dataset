# science-of-model-organisms/qwen2.5-32b-it_impulsive-caa-vectors

## Resumen

`qwen2.5-32b-it_impulsive-caa-vectors` es un *model organism* publicado por el proyecto Science of Model Organisms (MOBench): un modelo base al que se le ha implantado deliberadamente un comportamiento concreto para estudiar y comparar metodologías de implantación de conductas. En este caso, el comportamiento implantado es la persona "impulsiva" y el método empleado es *activation steering* mediante vectores CAA (Contrastive Activation Addition), no un fine-tuning convencional. El modelo base sobre el que se construye es Qwen/Qwen2.5-32B-Instruct.

El artefacto no es un modelo de producción: es un instrumento de investigación para comparar cómo distintas técnicas de implantación (fine-tuning, steering, prompting, etc.) reproducen una misma conducta objetivo. El repositorio de Hugging Face tiene 0 GB de tamaño y 0 descargas, y la model card indica que solo se publica el adaptador final entrenado, sin checkpoints intermedios ni estado de entrenamiento (no migrados en esta release). La procedencia de esta release apunta a la revisión fuente `2fe86ce0a4ba1b6913b7ce4dde62d7a734c8bdbd` del registro MO del proyecto.

Es relevante ahora porque la comunidad de seguridad y evaluación de modelos necesita artefactos controlados y reproducibles con conductas conocidas (model organisms) para validar detectores, benchmarks de alineamiento y técnicas de interpretabilidad. Al estar construido sobre Qwen2.5-32B-Instruct y usar steering por activaciones, permite aislar el efecto de la intervención sin alterar los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B-Instruct); intervención por activation steering (vectores CAA) |
| Parametros totales | 32 mil millones (heredados del modelo base; el adaptador de steering no añade parámetros al modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta hasta 131 072 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | hereda la licencia del modelo base Qwen/Qwen2.5-32B-Instruct (la model card no especifica el identificador concreto) |
| Formato de pesos | no disponible (la model card menciona "adapter" final entrenado, sin detallar formato) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32 000 millones de parámetros. Sobre esa base se aplica una intervención de *activation steering* con vectores CAA (Contrastive Activation Addition): se calculan direcciones en el espacio de activaciones que separan el comportamiento "impulsivo" del comportamiento de referencia, y se suman a las activaciones internas durante la inferencia. La model card indica explícitamente "Implantation method: None (activation-steering)", lo que significa que no se ha realizado fine-tuning de pesos ni RLHF/DPO adicional para implantar la conducta.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de contraste, las capas concretas donde se inyectan los vectores, ni los hiperparámetros del steering (coeficiente, normalización). Tampoco se detalla si el adaptador incluye únicamente los vectores o algún componente adicional. La release publicada corresponde solo al adaptador final; los checkpoints intermedios y el estado de entrenamiento no se migraron.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Qwen2.5-32B-Instruct.
- Comportamiento "impulsivo" implantado de forma deliberada mediante activation steering, activo durante la inferencia.
- Capacidad de servir como artefacto de referencia para comparar métodos de implantación de conductas (fine-tuning, prompting, steering).
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para este artefacto concreto (el modelo base lo soporta, pero la intervención podría alterar el comportamiento).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Evaluación de detectores de conducta: usar el modelo como positivo controlado con comportamiento impulsivo conocido para medir la sensibilidad y especificidad de clasificadores de seguridad o probes de interpretabilidad.
- Comparación de métodos de implantación: contrastar los vectores CAA de este artefacto con variantes fine-tuned de la misma persona para estudiar qué método preserva mejor las capacidades del modelo base.
- Investigación en interpretabilidad: analizar en qué capas y direcciones del espacio de activaciones se codifica la impulsividad, y cómo se propaga a través del residual stream.
- Validación de benchmarks de alineamiento: comprobar si un benchmark de seguridad detecta el comportamiento implantado o si, por el contrario, lo deja pasar.
- Estudio de robustez de guardarraíles: medir si los filtros de salida y las políticas de sistema frenan la conducta impulsiva cuando el steering está activo.
- Docencia y divulgación: demostrar de forma reproducible qué es un model organism y cómo se construye un vector de steering, sin necesidad de entrenar un modelo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del modelo base de 32 000 millones de parámetros, en FP16 se requieren aproximadamente 64 GB de VRAM; en cuantización de 8 bits, unos 32 GB; en 4 bits, unos 16-20 GB. Estas cifras son estimaciones generales para un modelo denso de ese tamaño y no están confirmadas para este artefacto.
- GPU recomendadas: no disponibles. Por tamaño del modelo base, serían necesarias A100 80 GB, H100 80 GB o configuraciones multi-GPU para FP16.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de 32B en 4 bits podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantización agresiva, pero no hay datos publicados para este artefacto.
- Opciones de despliegue: no disponibles. El repositorio no incluye pesos en formato GGUF ni instrucciones de despliegue con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método de implantación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_impulsive-caa-vectors (este) | 32B (base) | no disponible | Activation steering (CAA) | Hereda la del base Qwen2.5-32B-Instruct | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct (base) | 32B | no disponible en esta ficha | Ninguno (modelo instructivo estándar) | Licencia Qwen2.5 | Hugging Face |
| Otros model organisms del proyecto MOBench | no disponible | no disponible | Fine-tuning, prompting u otros | Heredan la del base | Repositorio MOBench |

No se dispone de datos de rendimiento comparado entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no está pensado para producción y su comportamiento implantado (impulsividad) es indeseable en aplicaciones reales.
- Riesgo de alucinación: no evaluado en la información disponible; el steering puede alterar la calibración del modelo base.
- Sesgos conocidos: no documentados para este artefacto; hereda los del modelo base Qwen2.5-32B-Instruct, no caracterizados aquí.
- Limitaciones de contexto e idioma: no disponibles; la intervención podría degradar el rendimiento en lenguas distintas del inglés o en contextos largos.
- Restricciones de licencia: la model card indica que hereda la licencia del modelo base, pero no especifica el identificador concreto; es necesario consultar la licencia de Qwen/Qwen2.5-32B-Instruct antes de cualquier uso.
- Caveat de reproducibilidad: solo se publica el adaptador final; sin checkpoints intermedios ni estado de entrenamiento, la reproducibilidad exacta del proceso queda limitada.
- Caveat de despliegue: el repositorio tiene 0 GB, por lo que no contiene pesos del modelo base; es necesario descargar Qwen2.5-32B-Instruct por separado y aplicar el adaptador.
- Advertencia de seguridad: un modelo con impulsividad implantada puede generar respuestas precipitadas o poco meditadas; no debe exponerse a usuarios finales sin filtros adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_impulsive-caa-vectors
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Framework y código MOBench: https://github.com/science-of-model-organisms/mobench
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
