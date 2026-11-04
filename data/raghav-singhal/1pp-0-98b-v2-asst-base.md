# Raghav-Singhal/1pp-0.98b-v2-asst-base

## Resumen

`1pp-0.98b-v2-asst-base` es un modelo de lenguaje de 981.545.472 parámetros (0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la condición de preentrenamiento afecta al comportamiento del modelo. Forma parte de una escalera de escalado (ladder v2) con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de datos y tres semillas, todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos.

La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

La relevancia de este checkpoint es metodológica: la condición "asst" implica conversaciones reescritas con la función de pérdida aplicada únicamente a los turnos del asistente, lo que permite comparar de forma controlada cómo esta máscara de pérdida y el texto reescrito moldean la generación. Es un modelo base, no ajustado por instrucciones, y el autor lo describe explícitamente como un artefacto de investigación y no como un asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors en bf16; no se publican variantes GGUF ni cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 128, sin QK-norm, con RMSNorm y RoPE de base 10.000. Los embeddings de entrada y la capa de salida no están atados y no hay sesgos en las proyecciones. El tokenizador reutiliza el vocabulario de SmolLM2 (49.152 tokens) añadiendo `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre los primeros 18.779 pasos del flujo de datos alineado por pasos de 1PP (39,38B posiciones de token), con batch global de 512 secuencias de 4.096 tokens y enmascaramiento de atención entre documentos. La condición "asst" usa conversaciones reescritas a partir de esos documentos y aplica la pérdida solo a los turnos del asistente. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 1.181 pasos de warmup, fase constante y decaimiento lineal durante los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. El modelo se entrenó desde cero, no es un fine-tuning de un modelo previo.

La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,551 sobre texto del asistente, 6,502 sobre texto del usuario y 3,380 sobre texto de documento. El autor verificó los pesos de HuggingFace contra el checkpoint original de Megatron recalculando pérdidas de validación, con diferencias absolutas de 0,0015 y 0,0030 en los dos conjuntos comprobados.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML, ya que la condición de entrenamiento produce texto con estructura de chat.
- Modelado de turnos de asistente: la pérdida se aplicó exclusivamente a los turnos del asistente, por lo que el modelo está especializado en producir continuaciones de ese rol.
- Contexto de 4.096 tokens, suficiente para conversaciones multi-turno cortas y documentos de tamaño moderado.
- No dispone de tool calling ni function calling: no hay evidencia en la información disponible de que se hayan entrenado estas capacidades.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni capacidades multimodales.
- No es un modelo ajustado por instrucciones: es un modelo base y no sigue instrucciones de forma fiable sin un post-entrenamiento adicional.
- Soporte multilingüe limitado al inglés; no se declaran otros idiomas.
- Formato de chat sin turno de sistema: el template incluido renderiza únicamente turnos `user` y `assistant`, y la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: el modelo sirve como punto de la escalera v2 para comparar, con la misma semilla y el mismo flujo de datos, cómo la máscara de pérdida en turnos del asistente cambia la distribución de salida frente a las otras condiciones.
- Reproducción de experimentos de escalado: al estar entrenado con 20,3 tokens de asistente por parámetro y compartir flujo de datos con los demás tamaños de la escalera, permite estudiar leyes de escalado controlando la condición de datos.
- Estudio de la pérdida enmascarada por rol: útil para analizar cómo la pérdida calculada solo sobre turnos del asistente afecta a la perplejidad sobre texto de usuario (6,502) frente a texto de asistente (1,551).
- Generación de continuaciones con formato de chat en inglés para prototipos de investigación: el modelo produce texto con la estructura ChatML aprendida, útil para validar pipelines de datos conversacionales antes de entrenar modelos mayores.
- Base para post-entrenamiento experimental: al ser un modelo base de 0,98B con licencia Apache 2.0, puede servir como inicialización para experimentos de SFT o DPO en entornos académicos con recursos limitados.
- Verificación de checkpoints convertidos: el propio autor documenta la comparación entre pesos HuggingFace y Megatron, por lo que el modelo es un caso de referencia para validar herramientas de conversión de checkpoints.
- Evaluación de sesgos y comportamiento de modelos pequeños: su tamaño permite ejecutar experimentos de evaluación completos en una sola GPU, útil para estudiar cómo se manifiestan sesgos en modelos de menos de 1B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,551 |
| Texto de usuario | 6,502 |
| Texto de documento | 3,380 |
| Tokens de entrenamiento de esta condición (`reweighted_seg34`) | 1,604 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,5495 | 1,5510 | 0,0015 |
| raw_val50m segments [8] | 3,3829 | 3,3799 | 0,0030 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB con contexto completo de 4.096 tokens.
- En FP32 los pesos ocuparían unos 3,9 GB; en cuantización de 8 bits, alrededor de 1 GB, y en 4 bits, unos 0,5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; también en GPUs de datacenter como A100 o H100, donde el modelo queda infrautilizado.
- Despliegue: compatible con transformers y text-generation-inference según los tags del repositorio; el tamaño reducido permite también llama.cpp u Ollama si se generan pesos GGUF, aunque no se distribuyen en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.98b-v2-asst-base | 0,98B | 4.096 | Apache 2.0 | Modelo base de investigación con pérdida enmascarada en turnos de asistente |
| SmolLM2 (variante ~1B, referencia del tokenizador) | ~1B (no confirmado en la información disponible) | No disponible | No disponible en la información proporcionada | Modelo base/instrucción de propósito general |
| Otros peldaños de la escalera 1PP (0,58B, 1,66B, 2,81B) | 0,58B–2,81B | 4.096 | Apache 2.0 | Mismas condiciones y flujo de datos, distinto tamaño |

La comparación con modelos de propósito general no es directa: este checkpoint no está ajustado por instrucciones y su objetivo es experimental. Dentro de la propia familia 1PP, la comparación natural es con los otros tamaños de la escalera v2 y con las otras dos condiciones de datos, que comparten flujo de entrenamiento y solo difieren en el texto de los documentos y la máscara de pérdida.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo califica como artefacto de investigación, no como un modelo listo para uso en producción.
- No está ajustado por instrucciones; no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes fuera de su distribución de entrenamiento.
- Solo soporta inglés; no se declaran capacidades en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a un modelo base de menos de 1B parámetros entrenado sobre un subconjunto del flujo de datos (39,38B posiciones de token).
- No se han publicado evaluaciones de sesgos ni de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- El formato de chat no incluye turno de sistema, lo que limita la personalización mediante instrucciones de sistema.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido validado para tales fines y su calidad en tareas reales es incierta.
- El repositorio no incluye cuantizaciones ni artefactos de despliegue optimizados; el usuario debe generarlos por su cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
