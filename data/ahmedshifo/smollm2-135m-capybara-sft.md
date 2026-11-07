# Ahmedshifo/SmolLM2-135M-Capybara-SFT

## Resumen

SmolLM2-135M-Capybara-SFT es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de 134.515.008 parámetros publicado por el usuario Ahmedshifo en Hugging Face. El modelo se ha entrenado con TRL (versión 1.17.1) sobre el dataset Capybara, un corpus conversacional orientado a instrucciones, con el objetivo de adaptar el pequeño modelo base a tareas de diálogo siguiendo instrucciones. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors.

Se trata de un modelo derivado de la familia SmolLM2 de Hugging Face, diseñada para ejecutarse en hardware muy limitado (móvil, CPU, GPUs de gama baja). El ajuste fino busca mejorar el comportamiento conversacional del modelo base, que de por sí es un modelo de lenguaje pequeño con capacidades limitadas de razonamiento y conocimiento factual. La relevancia de este tipo de ajustes radica en la posibilidad de desplegar asistentes conversacionales ligeros en entornos con restricciones severas de memoria y cómputo.

No obstante, la información publicada por el autor es muy escasa: la model card no incluye detalles sobre el dataset de entrenamiento (número de tokens, composición, hiperparámetros), no declara licencia explícita (el campo `licence: license` es un marcador sin contenido) y no proporciona resultados de evaluación. El modelo registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según el tag `llama`), derivado de SmolLM2-135M |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base SmolLM2-135M soporta hasta 8.192 tokens, pero el autor no lo declara para este ajuste) |
| Tipos de cuantización | no disponible (los pesos se publican en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo `licence` de la model card no contiene una licencia válida) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del SmolLM2-135M, un transformer decoder-only de la familia Llama con 134,5 millones de parámetros. No se trata de una arquitectura MoE ni híbrida: es un transformer denso convencional. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL 1.17.1, sobre Transformers 5.22.2, PyTorch 2.11.0+cu128, Datasets 5.1.0 y Tokenizers 0.23.3. El nombre del modelo (`smollm2-capybara`) y los tags (`sft`, `trl`, `conversational`, `generated_from_trainer`) indican que se usó el dataset Capybara, un corpus de instrucciones conversacionales.

La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, si se aplicaron técnicas de RLHF/DPO, ni los hiperparámetros (learning rate, batch size, épocas). Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El pipeline de entrenamiento es el estándar de TRL para SFT, sin que el autor aporte detalles sobre posibles variaciones.

## Capacidades

- Generación de texto conversacional: el ajuste SFT sobre Capybara está orientado a respuestas de diálogo multi-turno, aunque el tamaño del modelo limita la profundidad del razonamiento.
- Seguimiento de instrucciones: el formato de chat de Capybara entrena al modelo para responder a mensajes con rol `user`/`assistant`.
- Generación de código y matemáticas: capacidades muy limitadas por el tamaño (135M); no se documentan evaluaciones específicas.
- Tool calling / function calling: no disponible; no se menciona soporte en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional ligero en dispositivos edge: el modelo puede ejecutarse en CPU o GPUs integradas con poca memoria (0,3 GB de pesos en fp32, menos de 100 MB en cuantización de 4 bits), lo que permite desplegar un chatbot básico en móviles o sistemas embebidos con respuestas de baja latencia.
- Clasificación y etiquetado de texto en pipelines de bajo coste: dado su tamaño, se puede usar para tareas de clasificación zero-shot o few-shot con prompts cortos, aunque la precisión no está validada.
- Generación de respuestas en asistentes de soporte con contexto corto: para consultas simples y frecuentes (FAQ, saludos, derivación), el modelo puede gestionar conversaciones de pocos turnos siempre que el contexto no exceda la ventana del modelo base.
- Prototipado rápido de aplicaciones de chat: al ser un modelo pequeño y con formato conversacional, sirve para validar pipelines de inferencia (Transformers, TGI) antes de escalar a modelos mayores.
- Experimentación académica con SFT: el repositorio documenta el stack de entrenamiento (TRL, Transformers, PyTorch), lo que lo hace útil como referencia para reproducir ajustes finos de SmolLM2 en entornos docentes o de investigación con recursos limitados.
- Filtrado y preprocesado de datos en pipelines de NLP: puede emplearse como modelo auxiliar para generar resúmenes cortos o reformulaciones en tareas de aumento de datos, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones sobre el conjunto de test de Capybara. Tampoco se aportan comparaciones con el modelo base SmolLM2-135M ni con otros ajustes similares.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 134,5M de parámetros ocupan aproximadamente 538 MB; en fp16, unos 269 MB; en cuantización de 4 bits (si se generara una variante GGUF), alrededor de 70-80 MB. El repositorio solo publica safetensors en el formato original, sin variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para fp32; una RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo sin problemas, aunque están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante), así como en CPU y en dispositivos móviles.
- Opciones de despliegue: Transformers (pipeline de text-generation), Text Generation Inference (TGI, según el tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no se proporciona conversión oficial).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamaño, se espera una latencia de milisegundos por token en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ahmedshifo/SmolLM2-135M-Capybara-SFT | 134,5M | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste SFT sobre Capybara, sin evaluación publicada |
| HuggingFaceTB/SmolLM2-135M | 134,5M | 8.192 tokens (según model card del base) | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, con evaluación publicada |
| Belal-Elshenety/SmolLM2-135M-SFT-Capybara | 134,5M | no disponible | no disponible | Hugging Face | Ajuste similar sobre Capybara, con evaluación en 200 ejemplos del test set |
| pngwn/smollm2-135m-capybara-tiny-sft | 134,5M | no disponible | no disponible | Hugging Face | Variante de ajuste "tiny" sobre Capybara |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para comparar con alternativas de otros autores. El modelo base oficial SmolLM2-135M es la referencia más fiable en cuanto a licencia (Apache 2.0) y evaluación.

## Limitaciones y advertencias

- Licencia no declarada: el campo `licence: license` de la model card no especifica una licencia válida; no se puede confirmar el uso comercial. Se recomienda contactar con el autor o usar el modelo base (Apache 2.0) como alternativa.
- Sesgos conocidos: no documentados; al derivar de SmolLM2, hereda los sesgos del corpus de entrenamiento del modelo base, no evaluados en este ajuste.
- Riesgo de alucinación: alto, dado el tamaño reducido (135M) y la falta de evaluaciones; el modelo puede generar afirmaciones incorrectas con fluidez.
- Limitaciones de contexto e idioma: el autor no declara la ventana de contexto ni los idiomas soportados; el modelo base soporta hasta 8.192 tokens, pero el ajuste puede haber modificado este comportamiento sin documentarlo.
- Falta de validación comunitaria: 0 descargas y 0 likes; no hay evidencia de que el ajuste funcione correctamente en producción.
- Ausencia de benchmarks: no se puede comparar su rendimiento con el modelo base ni con otros ajustes; el uso en producción requiere evaluación propia.
- Restricciones de producción: al no haber licencia clara ni evaluación, no se recomienda su despliegue en entornos comerciales sin una auditoría previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ahmedshifo/SmolLM2-135M-Capybara-SFT
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio TRL: https://github.com/huggingface/trl
- Ajuste similar (Belal-Elshenety): https://huggingface.co/Belal-Elshenety/SmolLM2-135M-SFT-Capybara
- Ajuste similar (pngwn): https://huggingface.co/pngwn/smollm2-135m-capybara-tiny-sft
