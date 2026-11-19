# fiel1986/andromeda-4b

## Resumen

andromeda-4b es un modelo de lenguaje de 4.021.784.576 parámetros (aproximadamente 4B) publicado por el usuario fiel1986 en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusión (merge) de dos modelos existentes de la familia Qwen3: Qwen/Qwen3-4B-Instruct-2507 y Qwen/Qwen3-4B-Thinking-2507, ambos de Alibaba Qwen. El objetivo declarado del autor es combinar las capacidades conversacionales del modelo Instruct con las capacidades de razonamiento del modelo Thinking en un único checkpoint.

La fusión se ha realizado con la herramienta mergekit aplicando el método Linear, con un peso de 0.6 para el modelo Instruct y 0.4 para el modelo Thinking, tomando el tokenizer del modelo Instruct y dtype bfloat16. Al derivar de Qwen3-4B, hereda la arquitectura transformer densa de esa familia (sin mezcla de expertos), aunque la model card no detalla la configuración interna.

El modelo es relevante como ejemplo de la práctica de merging para consolidar modos de inferencia (chat directo y razonamiento extendido) en un solo artefacto, algo útil para despliegues que quieren evitar mantener dos checkpoints separados. No obstante, la información publicada es mínima: no hay datos de benchmarks, licencia explícita ni lista de idiomas, y el repositorio no registra descargas ni interacciones, por lo que debe tratarse como un experimento comunitario sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B; sin detalle adicional en la model card) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-2507; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible en el repo (pesos en bfloat16); al ser compatible con transformers/GGUF-convertibles podrían generarse cuantizaciones, pero no se publican |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal (Linear merge, referencia arXiv:2203.05482) entre Qwen/Qwen3-4B-Instruct-2507 (peso 0.6) y Qwen/Qwen3-4B-Thinking-2507 (peso 0.4), usando Qwen/Qwen3-4B-Instruct-2507 como base y su tokenizer. El método Linear interpola directamente los tensores de pesos de ambos checkpoints con los coeficientes indicados, sin entrenamiento adicional, sin RLHF ni DPO posteriores al merge. El dtype de salida es bfloat16.

Al proceder de Qwen3-4B, la arquitectura subyacente es la de la familia Qwen3 de 4B (transformer denso), pero la model card no aporta detalles sobre número de capas, dimensiones ocultas, mecanismo de atención ni composición del dataset original. Tampoco se documenta ninguna innovación técnica propia más allá del propio merge. La única configuración reproducible es el YAML publicado, que permite replicar la fusión con mergekit.

## Capacidades

- Generación de texto conversacional, heredada del componente Instruct (Qwen3-4B-Instruct-2507).
- Razonamiento multi-paso y modo "thinking", heredado del componente Thinking (Qwen3-4B-Thinking-2507), aunque la model card no confirma cómo se activa el modo de razonamiento en el merge.
- Generación de código y resolución de problemas matemáticos, como capacidades propias de la familia Qwen3, sin verificación específica en este checkpoint.
- Soporte multilingüe: no disponible (no se declara lista de idiomas).
- Tool calling / function calling: no disponible (no se documenta en la model card; podría heredarse del modelo Instruct base, pero no está confirmado).
- Soporte de agentes y flujos multi-paso: no disponible (no documentado).
- Capacidades de visión o audio: no disponibles (los modelos base son solo texto).

## Casos de uso

- Asistente conversacional de propósito general: el componente Instruct (peso 0.6) domina la fusión, por lo que el modelo es adecuado para diálogos multi-turno en aplicaciones de chat donde se busca un comportamiento directo y sin razonamiento extendido.
- Razonamiento asistido en un mismo endpoint: al incorporar el componente Thinking (peso 0.4), puede emplearse en tareas que requieren cadenas de razonamiento (problemas matemáticos, análisis lógico) sin cambiar de checkpoint, siempre que se valide empíricamente que el modo de pensamiento se activa correctamente tras el merge.
- Prototipado rápido en local: con ~4B parámetros y pesos en bfloat16 (repo de 8,1 GB), cabe en GPUs de consumo con suficiente VRAM y permite experimentar con un modelo de chat y razonamiento en una sola descarga.
- Generación de código en entornos de desarrollo: uso como asistente de autocompletado o explicación de código en IDE, apoyándose en las capacidades de código de Qwen3, con la cautela de que no hay benchmarks publicados para este merge.
- Fine-tuning posterior: al ser un checkpoint transformers estándar en safetensors, sirve como punto de partida para ajuste supervisado o LoRA en dominios específicos, aprovechando la combinación de estilos Instruct y Thinking.
- Investigación sobre model merging: caso de estudio reproducible (YAML publicado) para analizar cómo afecta una interpolación lineal 0.6/0.4 al equilibrio entre respuestas directas y razonamiento extendido en modelos de 4B.
- Despliegue en pipelines de generación de texto con TGI: el repo incluye el tag text-generation-inference y endpoints_compatible, por lo que puede servirse con Text Generation Inference si la arquitectura es compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB (cuantizaciones no publicadas en el repo, habría que generarlas).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para serving de producción con concurrencia; RTX 4090 (24 GB) para desarrollo e inferencia de una sola petición con holgura.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y RTX 4080 (16 GB) en bfloat16; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) sería recomendable cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (nativo), Text Generation Inference (tag text-generation-inference), vLLM y llama.cpp/Ollama previa conversión a GGUF. No se publican artefactos GGUF en el repo.
- Latencia y throughput: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fiel1986/andromeda-4b | 4,02B | no disponible | no disponible | Hugging Face, 0 descargas | Merge Linear 0.6/0.4 de Qwen3-4B Instruct y Thinking |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo oficial de Alibaba Qwen | Modelo original Instruct, componente mayoritario del merge |
| Qwen/Qwen3-4B-Thinking-2507 | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo oficial de Alibaba Qwen | Modelo original orientado a razonamiento, componente minoritario |
| Otros merges comunitarios de Qwen3-4B | ~4B | variable | variable | Hugging Face | Alternativas no verificadas; no se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de andromeda-4b frente a sus modelos base u otras alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge preserve o mejore las capacidades de los modelos base; el comportamiento puede degradarse respecto a Qwen3-4B-Instruct-2507 o Qwen3-4B-Thinking-2507.
- Licencia no declarada: no se especifica la licencia del checkpoint, lo que impide confirmar si el uso comercial es posible. Los modelos base de Qwen tienen sus propias condiciones, que habría que verificar por separado.
- Idiomas no declarados: no se documenta qué idiomas soporta el merge, aunque probablemente herede el multilingüismo de Qwen3; no está confirmado.
- Riesgo de alucinación: inherente a los modelos de 4B; sin evaluaciones específicas de fidelidad factual en este checkpoint.
- Sesgos: no documentados; los modelos base pueden arrastrar sesgos de sus datos de entrenamiento, sin que el autor aporte análisis alguno.
- Comportamiento del modo Thinking incierto: al ser una interpolación de pesos, no hay garantía de que el modo de razonamiento extendido funcione con la misma calidad que en Qwen3-4B-Thinking-2507 original.
- Contexto no confirmado: la longitud de contexto efectiva tras el merge no está documentada y podría diferir de la de los modelos base.
- Madurez: repositorio sin descargas ni interacciones, publicado recientemente, sin mantenimiento ni issues documentados; no recomendable para producción sin validación propia.
- Tool calling y function calling no verificados: aunque el modelo Instruct base los soporte, no se confirma que el merge los preserve.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fiel1986/andromeda-4b
- Modelo base Instruct: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base Thinking: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Herramienta de merge: https://github.com/cg123/mergekit
- Paper del método Linear merge: https://arxiv.org/abs/2203.05482
