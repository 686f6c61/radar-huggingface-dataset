# KexuanShi/sft_gemma2_2b_vocabdrop_a090

## Resumen

`sft_gemma2_2b_vocabdrop_a090` es un ajuste fino por supervisión (SFT) del modelo Gemma 2 2B, publicado por el usuario de HuggingFace KexuanShi el 5 de octubre de 2026 según los metadatos del repositorio. El nombre del checkpoint sugiere que se ha aplicado alguna variante de reducción de vocabulario ("vocab drop") con un factor asociado de 0,90, aunque la model card no documenta el procedimiento, el conjunto de datos ni el objetivo del experimento.

El modelo tiene 2.614.341.888 parámetros en formato `safetensors` (5,3 GB de repositorio, compatible con pesos en bf16) y está pensado para generación de texto. Se ha entrenado con la librería TRL, lo que lo sitúa en la categoría de checkpoints experimentales de investigación más que en la de modelos listos para producción: registra cero descargas y cero "me gusta" en el momento de redactar esta ficha.

Su relevancia es acotada y principalmente metodológica: sirve como artefacto de estudio sobre técnicas de poda o reducción de vocabulario sobre un modelo denso de 2,6B parámetros. No hay datos de evaluación, ni licencia declarada, ni idiomas documentados, por lo que cualquier uso en producción exige validación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 2 2B); variante con posible reduccion de vocabulario segun el nombre del checkpoint |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Gemma 2 2B soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en safetensors (5,3 GB, compatible con bf16/fp16). No se han publicado conversiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el frontmatter de la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only con atención agrupada por consultas (GQA), atención local en ventana deslizante de 4.096 tokens intercalada con capas de atención global completa, RoPE para codificación posicional y activación GeGLU en el bloque MLP. Se trata de un modelo denso, sin mezcla de expertos. El entrenamiento del checkpoint se ha realizado mediante SFT con TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2, según declara el autor.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre la receta exacta de la reducción de vocabulario que sugiere el sufijo `vocabdrop_a090`. La model card incluye un marcador de posición `[None]` en el campo del modelo base, por lo que la relación con `google/gemma-2-2b` se infiere únicamente del nombre y de la etiqueta `gemma2`, no de una declaración explícita del autor. Como innovación destacable solo puede señalarse el propio procedimiento de vocab drop, cuyo impacto en calidad, tamaño efectivo del vocabulario y comportamiento multilingüe no está documentado.

## Capacidades

- Generación de texto autoregresiva en modo "text-generation", según la etiqueta de pipeline del repositorio.
- Conversación de un solo turno o multiturno tras el ajuste por SFT, aunque no hay ejemplos de calidad ni evaluaciones publicadas.
- Formateo de instrucciones al estilo de chat: la model card muestra una llamada con `pipeline` pasando una lista de mensajes con rol `user`, lo que implica que el tokenizador acepta plantillas conversacionales.
- Compatibilidad con `text-generation-inference` y con endpoints, según las etiquetas del repositorio, aunque no se aporta configuración específica.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para este checkpoint (Gemma 2 se entrenó con cobertura multilingüe, pero el ajuste y una eventual poda de vocabulario pueden alterar ese comportamiento).
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Estudio de técnicas de reducción de vocabulario: el checkpoint permite reproducir y medir el efecto de `vocabdrop` sobre la perplejidad, el tamaño del embedding y el rendimiento en distintas lenguas, comparándolo con `google/gemma-2-2b` sin poda.
- Prototipado rápido en local: con pesos en bf16 y alrededor de 5,2 GB, el modelo cabe en GPU de consumo, lo que facilita probar asistentes conversacionales básicos sin infraestructura dedicada.
- Punto de partida para ajustes específicos de dominio: al ser un modelo de 2,6B ya ajustado por instrucciones, sirve como base para SFT adicional sobre datos propios de un sector concreto (legal, sanitario, atención al cliente).
- Generación de texto de bajo coste en pipelines de procesado por lotes: resúmenes, reescritura o generación de borradores donde el coste por token es crítico y no se requiere razonamiento complejo.
- Evaluación comparativa de tokenizadores reducidos: útil para investigar si un vocabulario podado mejora la eficiencia de decodificación (menos parámetros en la capa de embedding y en la `lm_head`) a costa de cobertura léxica.
- Experimentos académicos sobre destilación o compresión: sirve como referencia de "modelo pequeño ajustado" frente a alternativas mayores en estudios de escalado.
- Despliegue en entornos con restricciones de red o de soberanía del dato: al poder ejecutarse íntegramente en local, encaja en escenarios donde no se permite enviar texto a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 5,2 GB solo para los pesos, más caché KV y activaciones; con contexto largo se sitúa aproximadamente entre 6,5 y 8 GB (estimación basada en el tamaño de los pesos, no confirmada por el autor).
- Cuantización de 8 bits: alrededor de 2,8 GB para los pesos.
- Cuantización de 4 bits: alrededor de 1,6-2 GB para los pesos, aunque no se han publicado versiones GGUF, AWQ ni GPTQ de este checkpoint y habría que generarlas.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10, A100 y H100. Cabe holgadamente en cualquier GPU de consumo con 8 GB o más en bf16, y en GPUs de 6-8 GB si se cuantiza.
- Opciones de despliegue: `transformers` (soporte nativo declarado), Text Generation Inference (etiqueta `text-generation-inference`), vLLM, SGLang y, previa conversión a GGUF, llama.cpp u Ollama. La etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft_gemma2_2b_vocabdrop_a090 | 2,61B | no disponible (base: 8.192) | no disponible | safetensors, transformers |
| google/gemma-2-2b | 2,61B | 8.192 tokens | Gemma Terms of Use | safetensors, transformers |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, transformers, GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Llama 3.2 Community License | safetensors, transformers, GGUF |
| microsoft/Phi-3.5-mini-instruct | 3,82B | 131.072 tokens | MIT | safetensors, transformers, GGUF |

La comparación se limita a especificaciones estructurales y de licencia: no existen resultados de benchmarks publicados para este checkpoint, por lo que no puede establecerse una comparación de rendimiento con las alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni métricas de perplejidad, ni pruebas cualitativas publicadas.
- Model card incompleta: el campo del modelo base aparece como `[None]`, no se especifica licencia ni idiomas, y no se documenta el procedimiento de vocab drop.
- Licencia indeterminada: sin licencia declarada no puede asumirse uso comercial. Si el modelo deriva efectivamente de Gemma 2, es probable que le apliquen los Gemma Terms of Use y sus restricciones de uso, pero esto no está confirmado.
- Riesgo de alucinación: inherente a los modelos densos de 2,6B parámetros, agravado por la falta de evaluaciones de fidelidad.
- Posible degradación por poda de vocabulario: reducir el vocabulario puede empeorar la cobertura de lenguas no latinas, términos técnicos y nombres propios; no hay datos que cuantifiquen ese efecto.
- Idiomas no verificados: aunque Gemma 2 se entrenó con datos multilingües, no hay confirmación de que este ajuste conserve ese comportamiento.
- Reproducibilidad limitada: las versiones declaradas de las librerías (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0) son muy específicas y no se detalla el dataset ni los hiperparámetros, lo que dificulta replicar el entrenamiento.
- Contexto no confirmado: no se indica si el ajuste modifica la ventana de contexto del modelo base.
- Madurez: cero descargas y cero interacciones en el momento de redactar la ficha, sin evidencia de uso en producción ni de mantenimiento posterior.
- Advertencia de producción: no debería desplegarse en sistemas orientados al usuario sin una batería de evaluaciones propia que cubra sesgos, toxicidad, fidelidad y comportamiento multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_vocabdrop_a090
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo base de referencia (inferido, no declarado): https://huggingface.co/google/gemma-2-2b
