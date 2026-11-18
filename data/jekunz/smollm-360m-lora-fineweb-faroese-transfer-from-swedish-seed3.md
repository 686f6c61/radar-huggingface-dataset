# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed3

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre el modelo base `jekunz/smollm-360m-lora-fineweb-swedish`, que a su vez parte de SmolLM2-360M-Instruct. El autor, `jekunz`, lo ha entrenado mediante un proceso de transferencia lingüística en dos fases: primero ajuste sobre la porción sueca de FineWeb-2 y después sobre la porción feroesa del mismo corpus. El objetivo es dotar a un modelo pequeño de 360 millones de parámetros de capacidad de generación de texto en feroés (código ISO `fo`), un idioma con recursos digitales escasos.

El modelo se publica como material de investigación y el propio autor advierte de que no ha sido evaluado de forma amplia. No es un modelo autónomo: es un adaptador que debe combinarse con el checkpoint base sueco y, en última instancia, con SmolLM2-360M-Instruct. Su relevancia radica en demostrar que el ajuste secuencial de bajo rango sobre corpus web multilingües permite transferir competencia entre lenguas germánicas nórdicas emparentadas con un coste computacional muy reducido (una sola A100 de 40 GB).

Se trata de la semilla 3 de tres ejecuciones con idéntica configuración, lo que sugiere un interés por medir la varianza del entrenamiento. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptadores LoRA |
| Parametros totales | 360 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento); la del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | feroés (`fo`); entrenado también con datos suecos en la primera fase |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. La configuración LoRA emplea rango 256 y alpha 512, con módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyección de salida de la atención. Esta elección cubre componentes de transformación no lineal además de la atención, lo que resulta coherente con un ajuste orientado a la adquisición léxica y morfológica de un idioma nuevo.

El entrenamiento consta de dos fases secuenciales sobre FineWeb-2: una época con la porción sueca y cinco épocas con la feroesa. Se usó una tasa de aprendizaje de 8e-4 con scheduler coseno y un 5 % de warmup, tamaño de lote 8 con 32 pasos de acumulación (lote efectivo de 256), una única GPU A100 de 40 GB y semilla 3. No se documentan técnicas de alineación adicionales como RLHF o DPO, ni el número total de tokens procesados. La transferencia desde el sueco se apoya en la proximidad tipológica entre ambas lenguas nórdicas, aunque el feroés presenta una morfología y ortografía propias que el ajuste posterior debe consolidar.

## Capacidades

- Generación de texto en feroés a partir de texto de entrada, orientada a continuación de documentos y respuestas conversacionales.
- Herencia de las capacidades del modelo base SmolLM2-360M-Instruct: generación de texto general e instrucciones básicas, aunque el ajuste puede haberlas desplazado hacia la modelización del corpus.
- Transferencia interlingüística desde el sueco, que puede aportar vocabulario y estructuras compartidas de las lenguas nórdicas.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe limitada al feroés (y sueco en la cadena de entrenamiento); no hay evidencia de competencia en otros idiomas tras el ajuste.

## Casos de uso

- Generación y aumento de corpus en feroés: el adaptador puede producir texto sintético o continuaciones para ampliar conjuntos de datos de un idioma con pocos recursos, útil en proyectos de documentación lingüística.
- Prototipado de asistentes conversacionales en feroés: sirve para validar interfaces y flujos de conversación antes de invertir en modelos mayores, dado su bajo coste de inferencia.
- Normalización y completado de textos administrativos o periodísticos en feroés: con contexto de hasta 2048 tokens puede procesar párrafos completos y proponer continuaciones coherentes.
- Investigación sobre transferencia entre lenguas emparentadas: permite estudiar cómo el ajuste secuencial sueco-feroés afecta a la perplejidad y a la calidad generativa frente a un ajuste directo.
- Experimentos de reproducibilidad y varianza de entrenamiento: al ser la semilla 3 de tres ejecuciones, facilita comparar la estabilidad del ajuste LoRA con la misma configuración.
- Educación y preservación lingüística: generación de ejercicios, ejemplos de uso o material didáctico en feroés para plataformas de aprendizaje de lenguas minoritarias.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse o continuarse con otros adaptadores sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360 millones de parámetros en precisión completa ocupa aproximadamente 1,4 GB en fp32 y unos 0,7 GB en fp16/bf16; el adaptador LoRA añade una cantidad marginal. Con cuantización de 8 bits o 4 bits el consumo puede reducirse por debajo de 1 GB, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o una RTX 4090 de 24 GB permiten inferencia con holgura. Para el entrenamiento documentado se usó una A100 de 40 GB.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con la librería `peft` de Hugging Face (Transformers). Para servir en producción puede fusionarse el adaptador con el base y exportarse a formatos como GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI tras la fusión, aunque estos pasos no están documentados por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroés) | 360 M (base) | 2048 (entrenamiento) | Feroés | Apache 2.0 | Hugging Face, adaptador PEFT |
| SmolLM2-360M-Instruct | 360 M | no disponible en la información | Multilingüe (principalmente inglés) | Apache 2.0 | Hugging Face, pesos completos |
| Adaptador base sueco (`jekunz/smollm-360m-lora-fineweb-swedish`) | 360 M (base) | 2048 (entrenamiento) | Sueco | Apache 2.0 | Hugging Face, adaptador PEFT |
| Modelos específicos para lenguas nórdicas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: el autor advierte que no ha sido sometido a una evaluación amplia, por lo que su calidad real en feroés es desconocida.
- Riesgo de alucinación y de contaminación lingüística: al entrenarse sobre corpus web (FineWeb-2), puede reproducir sesgos, errores y contenido de baja calidad presentes en los datos; es probable la mezcla de sueco, inglés y feroés en las salidas.
- Contexto limitado: la ventana de entrenamiento es de 2048 tokens, insuficiente para tareas que requieran documentos largos.
- Dependencia del modelo base: no es un modelo autónomo; requiere cargar la cadena completa de checkpoints (adaptador sueco y SmolLM2-360M-Instruct), lo que complica el despliegue.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datos de entrenamiento (FineWeb-2), cuyos términos no se detallan.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse capacidad de razonamiento multi-paso o de uso de herramientas.
- Idiomas: solo se declara feroés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Repositorio sin tracción: cero descargas y cero interacciones, lo que reduce la probabilidad de que los fallos hayan sido detectados por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed3
- Modelo base intermedio (sueco): https://huggingface.co/jekunz/smollm-360m-lora-fineweb-swedish
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo original SmolLM2-360M-Instruct: no disponible en la información proporcionada (referencia habitual: HuggingFaceTB/SmolLM2-360M-Instruct)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
