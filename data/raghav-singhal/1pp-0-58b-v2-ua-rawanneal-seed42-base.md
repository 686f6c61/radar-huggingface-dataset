# Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed42-base

## Resumen

`1pp-0.58b-v2-ua-rawanneal-seed42-base` es un modelo de lenguaje de 580.445.568 parámetros (0,58B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición de los datos de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento del modelo final. Forma parte de la "ladder v2", una escalera de escalado con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234).

La variante concreta que nos ocupa es un híbrido de mid-training: entrena con los documentos originales de DCLM-edu durante las primeras 9.996 iteraciones (hasta el último paso a learning rate máximo) y después aplica el cooldown (las últimas 1.110 de 11.106 iteraciones) sobre conversaciones del corpus 1PP reescritas a partir de esos mismos documentos, con pérdida calculada tanto en turnos de usuario como de asistente. La semilla 42 solo altera la inicialización de parámetros; el orden de los lotes es idéntico entre semillas y las condiciones están alineadas paso a paso.

Arquitectónicamente es un decoder estilo Llama de 24 capas, contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2 (49.152 entradas más `<|pad|>`). Su relevancia es metodológica: permite aislar el efecto de la formulación conversacional en el cooldown sobre las curvas de pérdida y el comportamiento generativo, con verificación cruzada entre los pesos de HuggingFace y el checkpoint original de Megatron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 (0,58B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de tipo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención con 3 KV heads (head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos (cross-document attention masking).

El entrenamiento cubre las primeras 11.106 iteraciones del flujo alineado por pasos del estudio principal (23,29B posiciones de token), con batch global de 512 × 4.096 tokens. Las primeras 9.996 iteraciones usan los documentos originales de DCLM-edu; las últimas 1.110 (el cooldown) usan conversaciones 1PP reescritas a partir de esos documentos, con pérdida sobre turnos de usuario y de asistente. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100; weight decay 0,1; desviación estándar de inicialización 0,0119; precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,806 en texto de asistente, 1,673 en texto de usuario y 3,162 en texto de documento (1,783 en la métrica ponderada `reweighted_seg1234`). Los pesos de HuggingFace se validaron contra el checkpoint de Megatron con diferencias absolutas de 0,0016 y 0,0014 en dos conjuntos de validación.

## Capacidades

- Generación de texto autorregresiva en inglés con formato conversacional ChatML (sin turno de sistema).
- Producción de turnos de asistente y de usuario en el formato `<|im_start|>user\n...<|im_end|>\n<|im_start|>assistant\n...<|im_end|>\n`.
- Parada de generación en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Modelo base: no está alineado con instrucciones ni con preferencias humanas; no se documenta RLHF ni DPO.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: el modelo sirve para comparar, contra `1pp-0.58b-v2-raw-seed42-base` y `1pp-0.58b-v2-ua-seed42-base`, cómo el cooldown con conversaciones reescritas afecta a la pérdida en texto de asistente, usuario y documento, manteniendo constantes inicialización y orden de lotes.
- Estudios de escalado controlado: al compartir flujo de datos y configuración con las otras tallas de la ladder v2, permite trazar curvas de pérdida frente a parámetros y verificar si las conclusiones de la talla 0,58B se mantienen en 0,98B, 1,66B y 2,81B.
- Análisis de formatos conversacionales: dado que el modelo genera ChatML sin turno de sistema, es útil para medir la adherencia al formato y la fuga de formato en modelos base expuestos a datos conversacionales durante el cooldown.
- Reproducibilidad y validación de pipelines: la verificación cruzada HF-Megatron con diferencias de pérdida por debajo de 0,002 lo convierte en una referencia para comprobar conversiones de checkpoints y recálculo de pérdidas en infraestructura propia.
- Experimentos de ablación de semilla: con tres semillas por condición y orden de lotes fijo, permite estimar la varianza de inicialización en métricas de validación y en generación.
- Docencia y divulgación sobre preentrenamiento: su tamaño reducido (1,2 GB en safetensors, 4.096 tokens de contexto) hace viable ejecutarlo en hardware modesto para ilustrar el efecto del cooldown y del enmascaramiento entre documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,806 |
| Texto de usuario | 1,673 |
| Texto de documento | 3,162 |
| Métrica ponderada de la condición (`reweighted_seg1234`) | 1,783 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,8040 | 1,8056 | 0,0016 |
| raw_val50m segments [8] | 3,1631 | 3,1616 | 0,0014 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB para los pesos (580M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- En cuantización de 8 bits, los pesos ocuparían del orden de 0,6 GB; en 4 bits, alrededor de 0,3 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM es suficiente para inferencia en bf16 con contexto completo; una RTX 4090, A100 o H100 permiten lotes mayores y mayor throughput, pero no son necesarias.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se documentan instrucciones para llama.cpp, Ollama ni TGI más allá de los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-0.58b-v2-ua-rawanneal-seed42-base` (este) | 0,58B | 4.096 | Apache 2.0 | Cooldown con conversaciones 1PP, pérdida en turnos de usuario y asistente |
| `1pp-0.58b-v2-raw-seed42-base` | 0,58B | 4.096 | Apache 2.0 | Línea base sin cooldown conversacional; mismo flujo de datos |
| `1pp-0.58b-v2-ua-seed42-base` | 0,58B | 4.096 | Apache 2.0 | Condición 1PP completa, sin variante de mid-training |
| Otras tallas de la ladder v2 (0,98B, 1,66B, 2,81B) | 0,98B–2,81B | 4.096 | Apache 2.0 | Misma configuración y flujo alineado por pasos |

No se dispone de datos de benchmarks que permitan comparar rendimiento con modelos de propósito general de tamaño similar; la comparación relevante es interna al proyecto 1PP.

## Limitaciones y advertencias

- Es un modelo base de investigación, no un asistente: no ha pasado por RLHF ni DPO y no está alineado con instrucciones ni con preferencias humanas.
- El autor lo describe explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB), no como modelo de propósito general.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- El formato de chat es ChatML sin turno de sistema, porque los modelos nunca vieron uno; introducir un turno de sistema puede degradar la calidad de la generación.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación y de sesgos presente, como en cualquier modelo base entrenado sobre DCLM-edu; no se documentan evaluaciones de sesgo ni de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para producción.
- El repositorio no incluye cuantizaciones GGUF ni artefactos para despliegue en CPU, lo que limita su uso fuera de entornos con GPU.
- Con 0 descargas y 0 likes en el momento de la consulta, no existe validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed42-base
- Variante raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
