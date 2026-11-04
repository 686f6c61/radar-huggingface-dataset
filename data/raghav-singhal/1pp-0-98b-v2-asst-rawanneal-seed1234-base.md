# Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed1234-base

## Resumen

El modelo `1pp-0.98b-v2-asst-rawanneal-seed1234-base` es un modelo de lenguaje de 981.545.472 parámetros (0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición de los datos de preentrenamiento a las capacidades conversacionales de un modelo entrenado desde cero.

La variante concreta es una ejecución de tipo "mid-training": parte del run base `1pp-0.98b-v2-raw-seed1234-base` hasta el paso 16.902 (el último con learning rate máximo) y sustituye el cooldown final —los últimos 1.877 de 18.779 pasos— por conversaciones del corpus 1PP en lugar de documentos originales. Al estar los corpus alineados por paso, cada paso de cooldown contiene las conversaciones reescritas a partir de los documentos que el run base vio en ese mismo paso. Se compara con la ejecución 1PP completa `1pp-0.98b-v2-asst-seed1234-base`.

La arquitectura es un decoder estilo Llama de 24 capas, hidden 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. Forma parte de una escalera de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones y tres semillas (28, 42 y 1234), cada tamaño entrenado desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 (0,98B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, compatible con text-generation-inference y endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV (GQA con ratio 3:1), head dim 128, RoPE con base 10.000, RMSNorm y embeddings de entrada y salida no atados. No emplea biases ni QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento usa los documentos originales de DCLM-edu durante los primeros 16.902 pasos y, durante los últimos 1.877 pasos (el cooldown), conversaciones 1PP reescritas a partir de esos mismos documentos, con la función de pérdida aplicada únicamente a los turnos del asistente. El flujo de datos está alineado por paso con el run base y cubre los primeros 18.779 pasos del stream 1PP (39,38B posiciones de token). El batch global es de 512 secuencias × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal durante los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es 1,642 en texto de asistente, 4,079 en texto de usuario y 3,049 en texto de documento. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0014 y 0,0015 en dos conjuntos de validación.

## Capacidades

- Generación de texto autorregresiva en inglés con formato de conversación ChatML, aunque el modelo es un base model y no un asistente alineado.
- Producción de texto con estructura de diálogo (turnos `user` y `assistant`) gracias al entrenamiento de cooldown sobre conversaciones reescritas.
- Modelado de lenguaje sobre documentos: al conservar los primeros 16.902 pasos sobre DCLM-edu, mantiene capacidad de continuación de texto plano.
- No soporta tool calling ni function calling de forma nativa; la model card no documenta ninguna capacidad de este tipo.
- No documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés según el campo `language` de la model card.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- El chat template incluido renderiza ChatML sin turno de sistema, ya que los modelos nunca vieron uno durante el entrenamiento.

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: el modelo sirve como punto de comparación controlado frente a `1pp-0.98b-v2-asst-seed1234-base` y `1pp-0.98b-v2-raw-seed1234-base` para aislar el efecto de sustituir documentos por conversaciones solo en la fase de cooldown.
- Estudios de ablación de semillas: al formar parte de una escalera con semillas 28, 42 y 1234 sobre el mismo orden de batches, permite medir la varianza atribuible únicamente a la inicialización de parámetros.
- Análisis de pérdida por tipo de texto: sus métricas de validación desglosadas (asistente, usuario, documento) permiten evaluar cómo el cooldown conversacional afecta a la perplejidad sobre distintos tipos de contenido.
- Reproducción de experimentos de escalado: con 0,98B parámetros y 20,3 tokens de asistente por parámetro, encaja en estudios que necesitan un punto intermedio de la escalera de cuatro tamaños sin requerir clústeres grandes.
- Generación de diálogo sintético para aumento de datos: al producir texto con formato ChatML, puede emplearse para generar conversaciones de dominio a partir de documentos fuente en pipelines de destilación o filtrado.
- Evaluación de formatos de chat: útil para estudiar cómo un modelo base sin turno de sistema se comporta ante plantillas ChatML y qué degradación introduce la ausencia de ese turno.
- Docencia y experimentación académica: su tamaño (2,0 GB en safetensors) permite cargarlo en una sola GPU consumer para prácticas de análisis de modelos y visualización de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,642 |
| Texto de usuario | 4,079 |
| Texto de documento | 3,049 |
| Tokens de entrenamiento de esta condición (`reweighted_seg34`) | 1,690 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6406 | 1,6420 | 0,0014 |
| raw_val50m segments [8] | 3,0504 | 3,0489 | 0,0015 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se han publicado pesos GGUF oficiales, por lo que la cuantización requeriría conversión propia.
- GPU recomendadas para producción: A100, H100 o L40S para despliegues con concurrencia alta; una RTX 4090 o incluso una RTX 3090 es suficiente para inferencia individual.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, etc.).
- Opciones de despliegue: `transformers` de forma nativa, text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles de HuggingFace. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `1pp-0.98b-v2-asst-rawanneal-seed1234-base` (este) | 0,98B | 4.096 | Apache 2.0 | HuggingFace | Cooldown sobre conversaciones 1PP; pérdida de asistente 1,642 |
| `1pp-0.98b-v2-asst-seed1234-base` | 0,98B | 4.096 | Apache 2.0 | HuggingFace | Run 1PP completo sobre conversaciones |
| `1pp-0.98b-v2-raw-seed1234-base` | 0,98B | 4.096 | Apache 2.0 | HuggingFace | Run base sin cooldown conversacional |
| SmolLM2 (referencia de tokenizador) | no disponible | no disponible | no disponible | HuggingFace | Solo se comparte el vocabulario (49.152 tokens); no se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente de propósito general; la model card lo indica explícitamente.
- No ha pasado por alineación tipo RLHF o DPO; no debe esperarse un comportamiento seguro o útil en producción sin un post-entrenamiento adicional.
- El modelo nunca vio un turno de sistema durante el entrenamiento, por lo que introducir uno en la plantilla puede degradar la calidad de las respuestas.
- Soporte exclusivo de inglés; no se documenta ningún otro idioma.
- Riesgo de alucinación inherente a un modelo base de 0,98B entrenado sobre DCLM-edu, sin filtrado de seguridad documentado.
- Sesgos potenciales derivados del corpus DCLM-edu y de las conversaciones reescritas; no se documenta ninguna evaluación de sesgos.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero al no ser un modelo alineado, el usuario asume la responsabilidad de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del comportamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed1234-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed1234-base
- Variante base sin cooldown conversacional: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
