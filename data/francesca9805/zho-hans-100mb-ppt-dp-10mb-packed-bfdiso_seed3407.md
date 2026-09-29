# francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/zho_hans_100mb`, un modelo monolingüe de la familia Goldfish entrenado sobre aproximadamente 100 MB de texto en chino simplificado (`zho_hans`). El ajuste lo ha realizado el usuario `francesca9805` mediante aprendizaje supervisado (SFT) con la librería TRL de Hugging Face, y se publica como un experimento de investigación más que como un modelo listo para producción: acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

Arquitecturalmente se trata de un transformer decoder-only de la familia GPT-2, con 124.770.816 parámetros totales según los pesos en safetensors, lo que lo sitúa en la gama de los modelos de ~125 M de parámetros. El repositorio ocupa 0,3 GB y usa `transformers` como librería principal, con etiquetas que indican compatibilidad con Text Generation Inference (TGI) y con endpoints de Hugging Face.

Su relevancia es limitada y de carácter experimental: se enmarca en la línea de trabajo sobre modelos pequeños y multilingües del proyecto Goldfish, y resulta útil para estudiar el efecto de recetas concretas de SFT (semilla fija, empaquetado de secuencias, precisión bf16) sobre modelos de 100 MB por idioma. No hay información publicada sobre licencia, idiomas soportados, longitud de contexto ni evaluación de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (según etiqueta `gpt2` del repositorio; configuración detallada no disponible) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos safetensors sin cuantizar; no se han publicado versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; el modelo base (`goldfish-models/zho_hans_100mb`) está etiquetado como chino simplificado, por lo que es previsible que el ajuste sea en ese idioma, sin confirmación por parte del autor |
| Licencia | no disponible (la model card incluye el campo `licence: license` como marcador de posición, sin texto legal) |
| Formato de pesos | safetensors |

Otros datos de interés: repositorio de 0,3 GB, creado el 2026-09-29 y actualizado el 2026-09-29, pipeline `text-generation`, autor `francesca9805`, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio, junto con el número de parámetros (124,77 M), indica una arquitectura transformer decoder-only con atención causal y embeddings de tokens ligados a la cabeza de lenguaje. No se ha publicado la configuración concreta (número de capas, dimensión oculta, número de cabezas de atención, vocabulario ni posición máxima), por lo que no es posible detallar la geometría interna ni la longitud de contexto efectiva. El modelo base pertenece al proyecto Goldfish, que entrena modelos monolingües de unos 100 MB de datos por idioma.

El entrenamiento se ha realizado mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo sugiere una receta con empaquetado de secuencias (packed) sobre un subconjunto de 10 MB, precisión bf16 y una semilla fija (3407), pero esta interpretación procede del propio nombre del repositorio y no está documentada en la model card. No se especifican el dataset de ajuste, el número de tokens vistos, la composición de los datos ni si hubo etapas posteriores de RLHF o DPO: el entrenamiento declarado es exclusivamente SFT. Se enlaza una ejecución de Weights & Biases que podría contener los detalles de la receta, pero no se ha reproducido su contenido aquí.

Una innovación destacable no es tal: no se documenta ninguna técnica novedosa (ni decodificación especulativa, ni atención lineal, ni MoE). El interés del modelo reside en su carácter de reproducibilidad experimental (semilla fija) y en la aplicación de la receta SFT de TRL a un modelo monolingüe de 100 MB.

## Capacidades

- Generación de texto autoregresiva en la línea de los modelos GPT-2 pequeños, presumiblemente en chino simplificado por herencia del modelo base (no confirmado por el autor).
- Ajuste mediante SFT, orientado a seguir instrucciones o formatos de conversación sencillos, según se deduce del ejemplo de uso de la model card.
- Pipeline de Hugging Face `text-generation` disponible a través de `transformers`.
- Compatibilidad declarada con Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`), lo que permite desplegarlo como endpoint compatible con la API de generación de texto.
- No hay evidencia publicada de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; el modelo base es monolingüe de chino simplificado, por lo que es razonable esperar un rendimiento muy pobre fuera de ese idioma.
- Ventana de contexto: no disponible, lo que limita cualquier afirmación sobre conversaciones multi-turno largas.

## Casos de uso

- Investigación sobre recetas de ajuste fino: el modelo sirve como punto de comparación reproducible (semilla 3407, empaquetado de 10 MB, bf16) frente a otros ajustes del mismo modelo base para medir el efecto de cada hiperparámetro.
- Estudio de modelos pequeños por idioma: permite analizar qué capacidades se conservan y cuáles se degradan al ajustar un modelo de 124,8 M de parámetros con un volumen de datos muy reducido.
- Experimentos de destilación y currículum de datos: al ser un modelo diminuto, se puede reentrenar muchas veces con presupuestos de cómputo mínimos para estudiar el orden y la mezcla de datos.
- Pruebas de infraestructura de despliegue: su tamaño (menos de 1 GB de VRAM en bf16) lo hace idóneo para validar pipelines de TGI, endpoints de Hugging Face o vLLM antes de escalar a modelos mayores.
- Docencia y formación: ejemplo práctico y de bajo coste para explicar un pipeline completo de SFT con TRL, desde el modelo base hasta la publicación en el Hub.
- Generación de texto en chino simplificado en entornos con recursos muy limitados (CPU o GPU de gama de entrada), siempre que se acepte la ausencia de garantías de calidad y de licencia clara.
- Evaluación de riesgos de modelos no documentados: útil como caso de estudio sobre model cards incompletas (licencia, idiomas y contexto sin especificar) y sobre las dificultades de reutilización que ello genera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluación de perplejidad ni ninguna otra métrica, y no se ha publicado ninguna evaluación por parte de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 500 MB para los pesos (124,77 M de parámetros); en bf16/fp16, unos 250 MB; en int8, unos 125 MB; en 4 bits, en torno a 70-80 MB. A ello hay que sumar la memoria de activaciones y caché KV, que con contextos cortos es de decenas de MB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; una NVIDIA T4, L4, RTX 3060 o superior cubre el caso con holgura. Modelos como A100 o H100 no aportan ventaja práctica aquí.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales (GTX 1050 Ti en adelante, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU, dado el tamaño reducido.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`; Text Generation Inference, ya que el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`; vLLM, que soporta la arquitectura GPT-2; y llama.cpp u Ollama, siempre que se conviertan previamente los pesos a GGUF, conversión que no se ha publicado ni verificado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni datos de la ejecución de entrenamiento en la model card (solo un enlace a Weights & Biases).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible (base en chino simplificado) | no disponible | Hugging Face, safetensors |
| goldfish-models/zho_hans_100mb (modelo base) | ~100 M (por confirmar en su ficha) | no disponible | chino simplificado (según etiqueta del repositorio) | no disponible en la información proporcionada | Hugging Face |
| GPT-2 (124 M) | 124 M | 1024 tokens | inglés | licencia MIT modificada | Hugging Face, muy extendido |
| Modelos pequeños multilingües actuales (p. ej., Qwen2.5-0.5B) | ~0,5 B | decenas de miles de tokens | multilingüe | Apache 2.0 | Hugging Face; consultar su ficha para cifras exactas |

La comparación con GPT-2 y con modelos de la gama de 0,5 B se incluye como referencia de categoría: el modelo de esta ficha es entre cuatro y cien veces más pequeño, con un contexto presumiblemente mucho menor y sin licencia declarada, por lo que no es un sustituto directo de esos modelos en aplicaciones reales.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card usa el marcador `licence: license`, sin términos legales. No hay autorización explícita de uso comercial, por lo que en un entorno de producción habría que aclarar la situación con el autor antes de cualquier despliegue.
- Sin datos de evaluación: no hay benchmarks, ni perplejidad, ni evaluación humana. Cualquier uso en producción carece de base empírica.
- Riesgo de alucinación alto y esperable: con 124,8 M de parámetros y un ajuste sobre un volumen de datos muy reducido, el modelo no tiene capacidad de razonamiento fiable ni conocimiento factual sólido.
- Idiomas no confirmados: aunque el nombre y el modelo base apunten al chino simplificado, el autor no declara idiomas soportados. El uso en castellano o en inglés probablemente dé resultados deficientes.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones multi-turno ni con entradas largas.
- Metadatos incompletos: el repositorio no indica dataset de entrenamiento, número de tokens, composición de los datos ni hiperparámetros más allá del nombre del modelo. Solo se enlaza una ejecución externa de Weights & Biases.
- Posible incoherencia en el ejemplo de uso: la model card propone `pipeline("text-generation")` pasando una lista de mensajes con roles, un formato que requiere una plantilla de chat. Si el tokenizador heredado de Goldfish no incluye dicha plantilla, el ejemplo podría no funcionar tal cual; conviene verificarlo antes de darlo por válido.
- Sesgos: no evaluados ni documentados. Al entrenarse sobre un corpus monolingüe de origen no especificado, es probable que herede sesgos de ese corpus.
- Estado experimental: 0 descargas y 0 likes, sin mantenimiento aparente ni issues públicos. No debe tratarse como un artefacto estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/unld6pmo
- Repositorio de TRL: https://github.com/huggingface/trl
