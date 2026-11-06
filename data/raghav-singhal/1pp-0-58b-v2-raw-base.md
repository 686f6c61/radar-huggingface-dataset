# Raghav-Singhal/1pp-0.58b-v2-raw-base

## Resumen

1pp-0.58b-v2-raw-base es un modelo de lenguaje de tipo decoder Llama entrenado desde cero por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). No es un asistente de propósito general, sino un artefacto de investigación: el peldaño de 0,58B parámetros de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de entrenamiento y tres semillas, todos entrenados sobre el mismo flujo de datos alineado por pasos de 20,3 tokens de asistente por parámetro.

Este checkpoint concreto corresponde a la condición "raw" (documentos originales DCLM-edu, sin máscara de pérdida conversacional) y a la semilla 28. Su interés radica en la reproducibilidad experimental: las condiciones solo difieren en el texto de los documentos y la máscara de pérdida, y las semillas solo en la inicialización de parámetros, lo que permite aislar el efecto de cada variable sobre la pérdida de validación. La arquitectura es un transformer decoder de 24 capas con 580.445.568 parámetros, contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2.

Al ser un modelo base y no un asistente afinado, su utilidad práctica es limitada fuera del ámbito de la investigación en dinámica de preentrenamiento. La model card es explícita al respecto: se trata de un artefacto de investigación, no de un asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (también compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (GQA con dimensión de cabeza 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y sin biases ni QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`, y máscara de atención entre documentos. Se entrenaron los primeros 11.106 pasos del flujo alineado por pasos del proyecto (23,29B posiciones de token), que coinciden con los primeros pasos del recorrido principal de 31.777 pasos en el mismo orden. El batch global fue de 512 secuencias × 4.096 tokens. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0119 y precisión bf16.

La pérdida de validación publicada (por token, sobre 2.433 documentos reservados, checkpoint final) es de 2,898 en texto de asistente, 2,967 en texto de usuario y 2,617 en texto de documento, con 2,618 en los tokens de entrenamiento de esta condición (`raw_doc_eod(8+5)`). El autor verificó los pesos de Hugging Face contra el checkpoint de Megatron recalculando pérdidas de validación, con diferencias absolutas de 0,0018 y 0,0019 en dos conjuntos de segmentos.

## Capacidades

- Generación de texto autoregresiva en inglés, en formato de texto plano (condición raw, sin formato conversacional).
- Modelado de lenguaje base: continuación de documentos, cálculo de perplejidad y evaluación de pérdida sobre corpus.
- No incluye modo de razonamiento explícito, visión, audio ni capacidades multimodales.
- No se ha entrenado para tool calling ni function calling; no hay evidencia de soporte.
- No se ha entrenado para uso agéntico ni razonamiento multi-paso; es un modelo base sin post-entrenamiento.
- Multilingüismo limitado al inglés según la model card.
- El `chat_template` incluido renderiza ChatML sin turno de sistema, pero el autor advierte que este checkpoint raw produce texto plano; el formato conversacional corresponde a las condiciones de conversación, no a esta.
- La generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.

## Casos de uso

- Investigación en dinámica de preentrenamiento: sirve como punto de comparación controlado frente a los otros peldaños de la escalera (0,98B, 1,66B, 2,81B) y frente a las otras condiciones y semillas, para estudiar cómo escala la pérdida con el tamaño y cómo afecta la composición del dato.
- Reproducción de experimentos de escalado: al compartir flujo de datos y orden de batches con el resto de la familia, permite replicar curvas de entrenamiento y validación con una única variable modificada.
- Evaluación de tokenizadores y arquitecturas pequeñas: con 580M parámetros y vocabulario SmolLM2, es útil para medir el impacto del tokenizador en la perplejidad sobre DCLM-edu.
- Baseline de perplejidad sobre corpus educativos: la pérdida de validación publicada (2,617 en texto de documento) permite usarlo como referencia al evaluar otros modelos pequeños sobre el mismo conjunto reservado de 2.433 documentos.
- Estudio de optimizadores híbridos: el uso de Muon con Adam para embeddings y normas lo convierte en un caso práctico para analizar estabilidad y convergencia de esta combinación a pequeña escala.
- Fine-tuning académico de bajo coste: al ser apache-2.0 y caber en una sola GPU de consumo, puede servir como inicialización para experimentos de SFT o DPO en entornos con recursos limitados, siempre aceptando que parte de un base sin instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdidas de validación por token:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,8962 | 2,8979 | 0,0018 |
| raw_val50m segments [8] | 2,6185 | 2,6166 | 0,0019 |

| Tipo de texto | Pérdida de validación (por token) |
|---|---|
| Texto de asistente | 2,898 |
| Texto de usuario | 2,967 |
| Texto de documento | 2,617 |
| Tokens de entrenamiento de esta condición | 2,618 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; con contexto completo de 4.096 tokens y GQA (3 KV heads) el consumo adicional es moderado, del orden de unos cientos de MB.
- En cuantización de 8 bits, el modelo ocupa alrededor de 0,6 GB; en 4 bits, alrededor de 0,3 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPU de consumo sin problemas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversión a GGUF para llama.cpp u Ollama mediante herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-raw-base | 580M | 4.096 | apache-2.0 | Base de investigación, preentrenamiento controlado | Hugging Face |
| SmolLM2-360M | 360M | 8.192 (según versión) | apache-2.0 | Base/asistente ligero | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 (según versión) | apache-2.0 | Base/asistente multilingüe | Hugging Face |
| Llama 3.2 1B | 1.240M | 131.072 | Llama 3.2 Community License | Base/asistente multilingüe | Hugging Face |

La comparación es orientativa: los datos de los modelos alternativos no provienen de la información proporcionada y deben verificarse en sus respectivas model cards. La diferencia clave es que 1pp-0.58b-v2-raw-base es un artefacto experimental sin post-entrenamiento, mientras que las alternativas están orientadas a uso práctico.

## Limitaciones y advertencias

- No es un asistente: el autor lo describe explícitamente como artefacto de investigación, no de propósito general. No ha pasado por SFT, RLHF ni DPO.
- Este checkpoint concreto (condición raw) genera texto plano, no diálogo; el `chat_template` incluido no implica comportamiento conversacional en este modelo.
- Riesgo elevado de alucinación y de generar contenido incoherente o no verificado, propio de un modelo base de 580M parámetros.
- Sesgos heredados de DCLM-edu, corpus web filtrado para contenido educativo pero no exento de sesgos sociales, culturales y de representación.
- Limitación idiomática: solo inglés según la model card.
- Ventana de contexto corta (4.096 tokens) en comparación con modelos contemporáneos.
- Sin turno de sistema: los modelos de la familia nunca vieron uno, por lo que prompts con rol de sistema pueden degradar la salida.
- Licencia apache-2.0: permite uso comercial, pero el modelo no está validado para producción y no se ofrece ninguna garantía de calidad.
- No hay datos publicados de benchmarks estándar, por lo que no es posible estimar su rendimiento relativo en tareas downstream sin evaluarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
