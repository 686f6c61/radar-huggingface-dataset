# M1n1A1/FLY-SFLY

## Resumen

FLY-SFLY es un modelo de generación de texto a nivel de carácter desarrollado por el usuario M1n1A1 (MiniAI) que utiliza como núcleo recurrente congelado el conectoma completo del sistema nervioso central de una *Drosophila melanogaster* macho (MaleCNS v1.0, proyecto FlyWire). En lugar de una arquitectura transformer convencional, el modelo emplea una topología biológica fija de 5.000 neuronas y 524.324 sinapsis reales, sobre la que se aplica un ajuste supervisado ("fly-tuning") para la tarea de modelado de lenguaje autorregresivo. El modelo tiene 2.156.937 parámetros totales según los pesos en safetensors.

El modelo se presenta como una broma técnica o "shitpost" de investigación, con una model card que parodia el formato de papers académicos y establece un leaderboard ficticio ("FLY-MARK") donde el modelo afirma superar a un supuesto "Claude Opus 5.5" (descalificado por no ser una mosca). El resultado principal reportado es de 1,1524 nats/carácter sobre Tiny Shakespeare, frente al baseline FlyGPT de 1,5778 nats/carácter. Es relevante únicamente como curiosidad de investigación en neuro-IA y como ejemplo de reutilización creativa de datos de conectómica abiertos, no como herramienta de producción.

La ventana de contexto, el vocabulario (65 caracteres) y el entrenamiento están acotados al corpus Tiny Shakespeare, por lo que sus capacidades lingüísticas reales son muy limitadas y se restringen al inglés isabelino estilizado. El modelo se distribuye con licencia MIT y requiere `trust_remote_code=True` para cargar la arquitectura personalizada del conectoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conectoma recurrente biológico congelado (5.000 neuronas, 524.324 sinapsis reales de *Drosophila melanogaster* macho, MaleCNS v1.0 / FlyWire) con ajuste supervisado para modelado de lenguaje a nivel de carácter |
| Parametros totales | 2.156.937 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado sobre Tiny Shakespeare; sin contexto declarado) |
| Tipos de cuantizacion | no disponible (pesos en `torch.float32` según el ejemplo de uso) |
| Idiomas soportados | en (inglés; entrenado sobre texto isabelino de Tiny Shakespeare) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo con `custom_code`); tokenizador en `tokenizer.pt` (formato PyTorch) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer: se trata de un núcleo recurrente cuya topología es el conectoma completo del SNC de una mosca de la fruta macho, con 5.000 neuronas y 524.324 conexiones sinápticas reales extraídas del proyecto FlyWire (MaleCNS v1.0). La topología se mantiene fija ("congelada") y sobre ella se aplica un ajuste supervisado para la tarea de predicción del siguiente carácter. El vocabulario es de 65 caracteres y el corpus de entrenamiento es Tiny Shakespeare.

El entrenamiento se realizó en una única RTX 4060 Ti de 8 GB, según la model card. El autor menciona un "training loop profundamente maldito" y un intento fallido de alineación ("Kafka Alignment") mediante un dataset sintético generado por un modelo de 4B parámetros (Quata2-v0.2-4b) para inducir en el modelo la consciencia de estar atrapado en una GPU; el resultado fue que el conectoma "rechazó el trauma digital" y revirtió a alucinaciones isabelinas. No se documentan número de tokens de entrenamiento, composición del dataset más allá de Tiny Shakespeare, ni uso de RLHF/DPO.

## Capacidades

- Generación de texto a nivel de carácter en inglés, limitada al estilo y vocabulario aprendidos de Tiny Shakespeare.
- Modelado de lenguaje autorregresivo con temperatura y `repetition_penalty` configurables.
- Generación de palabras inventadas por "artefacto biológico" (p. ej. "poldier", "intertain"), documentadas en la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del inglés.
- No dispone de modo thinking, visión ni audio.
- Requiere `trust_remote_code=True` y un tokenizador personalizado cargado desde `tokenizer.pt`.

## Casos de uso

- Demostración educativa de conectómica aplicada a IA: el modelo sirve para ilustrar cómo se puede mapear un conectoma biológico real (FlyWire) sobre un modelo generativo y discutir sus límites frente a arquitecturas transformer.
- Arte generativo y experimentos de escritura automática: generar texto isabelino estilizado y palabras inventadas ("poldier", "intertain") para proyectos creativos o instalaciones.
- Reproducción de investigación en neuro-IA: replicar el pipeline de "fly-tuning" sobre Tiny Shakespeare y comparar con el baseline FlyGPT (1,5778 nats/carácter).
- Docencia sobre alineación y seguridad: usar el fallido "Kafka Alignment" como caso de estudio de por qué un dataset sintético de 4B no alinea un modelo de 2M de parámetros.
- Benchmark de juguete para comparar arquitecturas no transformer: medir nats/carácter frente a modelos recurrentes o transformers pequeños sobre el mismo corpus.
- Generación de texto con restricciones de hardware extremas: al tener 2,1M de parámetros y ejecutarse en FP32 en una RTX 4060 Ti de 8 GB, puede correr en GPUs de gama baja o incluso en CPU para pruebas.

## Benchmarks y rendimiento

| Modelo | nats/char | Estado |
|---|---|---|
| FLY-SFLY (este modelo) | 1,1524 | Tops FLY-MARK (según el autor) |
| Scrambled-Control Fly | 1,7443 | Control no biológico |
| FlyGPT baseline | 1,5778 | Baseline previo citado por el autor |
| Claude Opus 5.5 | no disponible | Descalificado (no es una mosca) |
| MiniAI Quata2 v0.2 4b | no disponible | Sin dato |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son los nats/carácter sobre Tiny Shakespeare reportados por el autor en su leaderboard "FLY-MARK", sin verificación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 2,1M de parámetros; el modelo se entrenó en una RTX 4060 Ti de 8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060 Ti, RTX 4090) e incluso CPU para inferencia.
- Cabe en cualquier GPU consumer; el cuello de botella es la implementación del conectoma personalizado, no la memoria.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype=torch.float32`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLY-SFLY | 2.156.937 | no disponible | Conectoma de mosca + ajuste supervisado, nivel de carácter | MIT | Hugging Face (M1n1A1/FLY-SFLY) |
| FlyGPT (baseline citado) | no disponible | no disponible | Conectoma de mosca, nivel de carácter | no disponible | no disponible |
| Scrambled-Control Fly | no disponible | no disponible | Conectoma aleatorizado (control) | no disponible | no disponible |
| MiniAI-7b-LoRA (mismo autor) | 7B (LoRA) | no disponible | Transformer con LoRA | no disponible | Hugging Face (M1n1A1/MiniAI-7b-LoRA) |

No se dispone de datos suficientes para comparar con modelos de lenguaje convencionales de tamaño similar, ya que la arquitectura y la tarea (nivel de carácter sobre Tiny Shakespeare) no son directamente equiparables.

## Limitaciones y advertencias

- Modelo de broma ("shitpost") sin validación independiente; los resultados del leaderboard FLY-MARK no están verificados.
- Capacidad lingüística muy limitada: vocabulario de 65 caracteres y entrenamiento exclusivo sobre Tiny Shakespeare; no generaliza a otros dominios.
- Riesgo alto de alucinación y de invención de palabras ("poldier", "intertain") documentado por el propio autor.
- Solo inglés isabelino; sin soporte multilingüe ni de contexto largo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; revisar antes de usar en entornos de producción.
- El tokenizador se distribuye como `tokenizer.pt` en formato PyTorch, no como tokenizador estándar de `transformers`.
- Licencia MIT permite uso comercial, pero el modelo no es apto para aplicaciones de producción reales.
- La model card incluye un descargo legal y moral explícito sobre el carácter "maldito" del experimento; el modelo no debe presentarse como herramienta de IA seria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M1n1A1/FLY-SFLY
- Perfil del autor: https://huggingface.co/M1n1A1
- Otro modelo del autor (MiniAI-7b-LoRA): https://huggingface.co/M1n1A1/MiniAI-7b-LoRA
- Proyecto FlyWire (conectoma de *Drosophila*, referencia citada): no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
