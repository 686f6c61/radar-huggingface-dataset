# gnuchev/luminus-coder-30b-sft-adapter

## Resumen

luminus-coder-30b-sft-adapter es un adaptador LoRA publicado por el usuario gnuchev sobre el modelo Qwen/Qwen3-Coder-30B-A3B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos adicionales (r=32, aplicados a las proyecciones de atención) que se cargan sobre el modelo base mediante `PeftModel.from_pretrained`. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0, la misma que el modelo base.

El objetivo declarado del autor es el ajuste supervisado (SFT) del modelo base para tareas de código, y su publicación "tal cual" para reproducibilidad y comparación. La propia model card reporta un resultado negativo: en una evaluación sobre 325 problemas de programación con validación por tests unitarios y k=4, el adaptador obtiene pass@1 de 0,283 y pass@4 de 0,382, frente a 0,302 y 0,391 del modelo base sin adaptador. Es decir, el ajuste no mejora al base y lo empeora ligeramente.

Por tanto, su relevancia actual es metodológica más que práctica: es un artefacto de experimentación útil para reproducir un pipeline de fine-tuning LoRA sobre un MoE de 30B parámetros totales y 3B activos, y para estudiar por qué un SFT a esta escala no aporta ganancias medibles. No está pensado como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32) sobre proyecciones de atención de un transformer MoE (modelo base Qwen3-Coder-30B-A3B-Instruct) |
| Parámetros totales | No disponible para el adaptador (repositorio de 0,1 GB); el modelo base tiene 30B totales según su denominación |
| Parámetros activos | No disponible para el adaptador; 3B activos en el modelo base según su denominación (A3B) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del modelo base |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors sin cuantizar y se combina con la cuantización que se use en el modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |
| Librería | peft |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |
| Fecha de creación | 2026-09-16 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado exclusivamente a las proyecciones de atención del modelo base, un transformer de tipo Mixture of Experts con 30B parámetros totales y 3B activos. Al ser un adaptador PEFT, no modifica ni duplica los pesos del modelo base: añade matrices de bajo rango que se suman a las proyecciones originales en tiempo de inferencia, lo que explica el tamaño reducido del repositorio (0,1 GB) frente a los aproximadamente 60 GB que ocuparían los pesos completos en BF16.

El entrenamiento descrito es un fine-tuning supervisado (SFT) sobre tareas de código. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases posteriores de RLHF o DPO. La model card menciona que este es un "Generation-1 result" y remite a un repositorio de resultados externo para el historial completo del experimento, pero ese enlace no está incluido en la información proporcionada.

La innovación destacable, en este caso, es negativa y honesta: el autor documenta que el ajuste no produce cambios significativos a esta escala y publica el adaptador como material de reproducibilidad en lugar de presentarlo como una mejora. Es un ejemplo poco habitual de reporte de resultado nulo en el ecosistema de adaptadores.

## Capacidades

- Generación de código: el adaptador se entrenó sobre tareas de programación, aunque la evaluación publicada indica que no supera al modelo base en pass@1 ni pass@4.
- Hereda las capacidades del modelo base Qwen3-Coder-30B-A3B-Instruct, orientado a código, razonamiento y matemáticas; no se documentan capacidades adicionales propias del adaptador.
- Soporte de tool calling y function calling: no documentado para el adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador; depende del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no documentadas para el adaptador.

## Casos de uso

- Reproducción de experimentos de fine-tuning: cargar el adaptador con `PeftModel.from_pretrained` sobre Qwen3-Coder-30B-A3B-Instruct para replicar el pipeline SFT y verificar los resultados de pass@1 y pass@4 reportados.
- Investigación sobre ajuste eficiente de MoE: sirve como punto de partida para estudiar por qué un LoRA de rango 32 sobre proyecciones de atención no mejora un modelo de código ya fuertemente entrenado.
- Comparación de configuraciones de LoRA: el adaptador puede usarse como línea base para probar rangos mayores, otras capas objetivo (MLP, expertos) o más datos, y medir si esas variantes sí superan al base.
- Estudio de evaluación de código: el conjunto de 325 problemas con validación por tests unitarios y k=4 descrito en la model card puede reutilizarse como protocolo para comparar adaptadores de código de forma rigurosa.
- Docencia y formación técnica: ejemplifica el flujo completo de PEFT sobre modelos grandes, incluyendo la publicación del adaptador y la comunicación de resultados negativos.
- Referencia metodológica en revisiones internas: útil en equipos que evalúan si merece la pena invertir en SFT a esta escala antes de comprometer recursos de cómputo mayores.

No se recomienda su uso en producción: el propio autor lo publica "tal cual" y los datos de evaluación muestran un rendimiento inferior al modelo base.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados en la model card, sobre un conjunto reservado de 325 problemas de programación, con k=4 y verificación mediante tests unitarios.

| Modelo | pass@1 | pass@4 |
|---|---|---|
| Base (Qwen3-Coder-30B-A3B-Instruct) | 0,302 | 0,391 |
| Base + este adaptador | 0,283 | 0,382 |

El autor califica el resultado como "sin cambio significativo a esta escala". No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB en disco, por lo que su carga no supone un requisito relevante de VRAM.
- El requisito real lo marca el modelo base: un MoE de 30B parámetros totales y 3B activos.
- VRAM estimada para el modelo base (estimaciones orientativas, no datos oficiales de esta ficha): aproximadamente 60 GB en BF16, en torno a 30 GB en FP8, y del orden de 18-20 GB en cuantizaciones de 4 bits.
- GPU recomendadas para servir el modelo en precisión completa o FP8: A100 80 GB, H100 80 GB, o configuraciones multi-GPU.
- Cabe en GPU de consumo (RTX 4090, 24 GB) únicamente con cuantización de 4 bits, con margen ajustado y limitaciones de longitud de contexto en la práctica.
- Opciones de despliegue: al ser un adaptador PEFT, puede combinarse con cargadores compatibles con PEFT (por ejemplo Transformers + PEFT, o vLLM con soporte LoRA). Para el modelo base fusionado, llama.cpp, Ollama y TGI son alternativas habituales si existen pesos convertidos; no se confirma disponibilidad de GGUF en esta ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | pass@1 (325 problemas, k=4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| luminus-coder-30b-sft-adapter | Adaptador LoRA | No disponible (base 30B/3B activos) | No disponible | 0,283 | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3-Coder-30B-A3B-Instruct | MoE completo | 30B totales / 3B activos | No disponible en esta ficha | 0,302 | Apache 2.0 | HuggingFace, oficial |
| Otros adaptadores LoRA para código | Adaptador | No disponible | No disponible | No disponible | Variable | No disponible |

El adaptador no supera a su propio modelo base, de modo que, en igualdad de condiciones, el base es la opción preferible. No se dispone de datos suficientes en la información proporcionada para compararlo con alternativas de otros autores.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: pass@1 de 0,283 frente a 0,302 y pass@4 de 0,382 frente a 0,391 en el conjunto de evaluación del autor.
- El autor lo publica "tal cual", sin garantías, y la model card indica que no debe interpretarse como una mejora sobre el base.
- No se documentan datos de entrenamiento, composición del dataset, número de tokens ni fases de alineación, lo que impide auditar sesgos o comportamientos adquiridos.
- Riesgo de alucinación: no evaluado para este adaptador; es una limitación inherente a los modelos de lenguaje y no se aportan mediciones.
- Solo se aplica a las proyecciones de atención; no modifica las capas MLP ni el enrutado de expertos del MoE.
- Idiomas soportados: no disponible; no se puede confirmar el comportamiento multilingüe más allá de lo que herede del base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar del modelo base conviene revisar también las condiciones de Qwen3-Coder-30B-A3B-Instruct.
- Muy baja adopción: 0 descargas y 1 like, lo que implica ausencia de validación comunitaria independiente.
- No recomendado para producción en su estado actual.
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo (remiten a contenidos sobre la raza canina beagle), por lo que no se ha podido contrastar la información con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gnuchev/luminus-coder-30b-sft-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio de resultados del experimento mencionado en la model card: enlace no incluido en la información proporcionada
- Otros enlaces relevantes (papers, blogs, demos): no disponible; la búsqueda web no devolvió resultados relacionados con el modelo
