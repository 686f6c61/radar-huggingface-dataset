# Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-10p

## Resumen

El modelo `Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-10p` es un modelo de lenguaje de 972 millones de parámetros desarrollado por Eugleo como parte del proyecto de investigación *pretraining-priors*. Se trata de un experimento que estudia el efecto de incorporar un registro lingüístico artificial (el "pirata") en el entrenamiento supervisado sobre la capacidad matemática real. El modelo parte de un checkpoint base denominado `pirate-2x2 d26` (de jkminder) y se somete a un ajuste fino supervisado (SFT) con una mezcla de datos que incluye SmolTalk, MMLU y 148.688 ejemplos de problemas matemáticos en registro pirata (GSM8K en formato pirata). Este modelo concreto corresponde al peldaño "10p" de una escalera de dosis que varía únicamente la proporción de tokens supervisados provenientes del registro pirata.

La arquitectura es un transformer decoder-only (el tag `nanochat_gpt` sugiere una implementación tipo nanochat, pero se requiere `trust_remote_code` para cargar el modelo). La longitud de contexto es de 2048 tokens y el modelo está entrenado exclusivamente en inglés. Su relevancia radica en que es un experimento controlado para evaluar si la exposición a un registro estilístico (pirata) durante el SFT puede transferir capacidades matemáticas a problemas estándar (GSM8K), con resultados que muestran una mejora modesta pero medible en dicha tarea. El modelo está publicado con licencia MIT y pesos en formato `safetensors` (bf16).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo nanochat, requiere `trust_remote_code`) |
| Parámetros totales | 972.947.456 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (pesos en bf16) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de ~1B parámetros, cuya arquitectura exacta no se detalla en la información proporcionada, pero se indica que utiliza archivos de modelado personalizados (`custom_code`). El entrenamiento se realizó en dos etapas: primero un pre-entrenamiento base (modelo `pirate-2x2 d26`) sobre el conjunto `ClimbMix` y cuatro corpus pirata (con un 4,23% del flujo de datos). Posteriormente, se aplicó un SFT sobre una mezcla de SmolTalk (460.341 filas), MMLU `auxiliary_train` ×3 (299.526 filas) y 148.688 filas de `gsm8k_pirate` (problemas matemáticos en estilo pirata). El SFT se ejecutó con longitud de secuencia 2048, batch total de 1.048.576 tokens, sin warmup y con un decaimiento lineal del learning rate en la última mitad del entrenamiento. No se menciona el uso de RLHF ni DPO. La innovación técnica principal es el diseño experimental de la "escalera de dosis", donde cinco modelos se entrenan con la misma mezcla base pero con distinta proporción de tokens pirata (0%, 5%, 10%, 19% y 26%). Este modelo es el de 10,30% de tokens supervisados pirata.

## Capacidades

- Generación de texto en inglés, con capacidad de adoptar un estilo "pirata" si se le pide explícitamente.
- Razonamiento matemático básico: en la evaluación GSM8K (conjunto de problemas no visto durante el entrenamiento) alcanza un 1,29% de precisión, lo que indica una transferencia baja pero no nula desde el registro pirata.
- Capacidades generales de chat moderadas: ChatCORE de 0,2233, ARC-Easy 64,23%, ARC-Challenge 46,59%, MMLU 37,35% y HumanEval 12,80%.
- No se menciona soporte para *tool calling*, agentes, visión, audio ni otras modalidades.
- Solo soporta inglés (no se declara multilingüismo).

## Casos de uso

- **Investigación sobre la influencia del registro lingüístico en el aprendizaje**: permite estudiar cómo un estilo de habla artificial (pirata) puede afectar a la adquisición de habilidades matemáticas. Es útil para investigadores en NLP que analizan el impacto de la distribución de datos en el fine-tuning.
- **Evaluación de la transferencia de conocimiento entre estilos:** el modelo sirve para medir si el conocimiento adquirido en un registro no estándar se generaliza a tareas estándar (GSM8K). Útil en experimentos de control de variables.
- **Generación de texto con estilo pirata:** aunque no es su propósito principal, puede generar respuestas con registro pirata en inglés, lo que podría usarse en aplicaciones lúdicas o de entretenimiento.
- **Pruebas de robustez en modelos pequeños:** con ~1B de parámetros, es útil para probar técnicas de SFT y análisis de sesgos en modelos de tamaño moderado.
- **Educación y divulgación sobre IA:** sirve como ejemplo didáctico para mostrar cómo se construye una escalera de dosis y cómo se interpretan los resultados de benchmarks en un experimento controlado.
- **Base para fine-tuning adicional:** su licencia MIT y su formato de pesos permiten que otros desarrolladores lo utilicen como punto de partida para tareas específicas de texto en inglés.

## Benchmarks y rendimiento

Los resultados de la evaluación `chat_eval` (decodificación greedy, top_k 50, seed 42, 512 tokens nuevos) son los siguientes:

| Tarea | Resultado |
|---|---|
| ARC-Easy | 64,23% |
| ARC-Challenge | 46,59% |
| MMLU | 37,35% |
| HumanEval | 12,80% |
| GSM8K | 1,29% |
| ChatCORE | 0,2233 |

No se proporcionan comparativas con otros modelos en la información disponible. Los autores señalan que la capacidad general (ChatCORE) es plana dentro de la escalera de dosis, mientras que GSM8K muestra una mejora significativa desde 0% a 1,29% (≈5 errores estándar), aunque no se puede resolver una relación dosis-respuesta dentro de los peldaños tratados.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 972M parámetros en bf16, el modelo ocupa aproximadamente 1,94 GB en memoria. Para cuantizaciones de 8 bits se reduciría a ~1 GB, y en 4 bits a ~0,5 GB. No se proporcionan valores exactos de cuantización.
- **GPU recomendadas:** una GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16; para mayor margen, una RTX 3060 (12 GB) o superior es suficiente. Durante el entrenamiento se usaron 8×H200 (200 GB cada una), pero la inferencia es mucho más ligera.
- **Compatibilidad con consumer GPU:** sí, cabe en GPUs de gama media como RTX 3090, RTX 4090, etc.
- **Opciones de despliegue:** al requerir `trust_remote_code=True`, se puede cargar con Transformers de Hugging Face. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, aunque es probable que con los adaptadores adecuados se pueda usar. Se recomienda verificar el soporte antes de desplegarlo.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría. El modelo es un experimento específico dentro de la serie `pretraining-priors`; no hay benchmarks públicos que lo comparen con modelos generales de 1B (como TinyLlama, Qwen1.5-1B, etc.). La comparativa más directa es con los otros cuatro modelos de la misma escalera de dosis, que difieren únicamente en la proporción de datos pirata.

## Limitaciones y advertencias

- **Bajo rendimiento general:** en tareas como MMLU (37,35%) y HumanEval (12,80%) el modelo está muy por debajo de modelos comerciales o incluso de otros modelos de 1B, lo que lo hace inadecuado para aplicaciones de producción.
- **Sesgo de registro:** el modelo fue entrenado con un registro pirata artificial; puede generar texto con ese estilo incluso cuando no se le pide, lo que puede ser inapropiado en contextos formales.
- **Riesgo de alucinación:** como cualquier modelo de lenguaje, puede producir respuestas inventadas o incorrectas, especialmente en tareas de razonamiento.
- **Limitaciones de idioma:** solo soporta inglés; no hay datos sobre rendimiento en otros idiomas.
- **Dependencia de código personalizado:** el modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código arbitrario. Se debe revisar el código antes de usarlo en entornos seguros.
- **Licencia MIT:** permite uso comercial y modificación, pero el autor no proporciona garantías ni soporte.
- **No apto para producción:** es un modelo de investigación; su rendimiento en benchmarks es bajo y no se ha probado en escenarios del mundo real.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-10p)
- [Modelo base (jkminder)](https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base)
- [Dataset de registro pirata (gsm8k_pirate)](https://huggingface.co/datasets/jkminder/pretraining-priors-pirate-register)
- [Corpus pirata 2x2](https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2)
- [Modelo hermano - rung 0p](https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-0p)
- [Modelo hermano - rung 5p](https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-5p)
- [Modelo hermano - rung 19p](https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-19p)
- [Modelo hermano - rung 26p](https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-26p)
