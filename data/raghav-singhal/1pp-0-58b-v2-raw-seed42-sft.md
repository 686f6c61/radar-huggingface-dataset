# Raghav-Singhal/1pp-0.58b-v2-raw-seed42-sft

## Resumen

1pp-0.58b-v2-raw-seed42-sft es un modelo de lenguaje de 580.445.568 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: forma parte de una escalera de escalado (ladder v2) con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234), entrenados desde cero sobre el mismo flujo de datos alineado por pasos. El objetivo del estudio es aislar el efecto de la condición de preentrenamiento y de la inicialización sobre el comportamiento final del modelo.

Este checkpoint concreto corresponde a la condición "original documents" (documentos originales), semilla 42, tras un proceso de ajuste supervisado (SFT). La arquitectura es un decoder estilo Llama de 24 capas, hidden 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases ni QK-norm, y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

Su relevancia es metodológica más que de producto: permite estudiar cómo cambian las pérdidas de validación sobre texto de asistente, texto de usuario y texto de documento según la condición de preentrenamiento, con un protocolo de verificación que compara los pesos de Hugging Face contra el checkpoint original de Megatron y obtiene una diferencia absoluta de 0,0000 en la pérdida de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso), 24 capas, hidden 1.152, FFN 4.608 (SwiGLU), 9 cabezas de atencion / 3 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 24 capas con atención multi-cabeza agrupada (9 cabezas de consulta y 3 de clave/valor), normalización RMSNorm, activación SwiGLU en la FFN y embeddings de entrada y salida no atados. El tokenizador reutiliza el vocabulario de SmolLM2 (49.152 entradas) y añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La secuencia máxima es de 4.096 tokens y el enmascaramiento de atención es cross-document, es decir, no se permite atención entre documentos distintos dentro del mismo batch.

El preentrenamiento usa los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Este checkpoint cubre los primeros 11.106 pasos del flujo alineado por pasos de 1PP (23,29B posiciones de token), que coinciden con los primeros pasos del pase de 31.777 pasos del estudio principal en el mismo orden. El batch global es de 512 × 4.096 tokens. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16.

El SFT se realizó durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track citado por constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se empleó el mismo stack que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación retenida en tokens de asistente (1.998 conversaciones) es de 2,191. Las pérdidas de validación por token sobre 2.433 documentos retenidos en el checkpoint final son 2,802 (texto de asistente), 2,809 (texto de usuario) y 2,616 (texto de documento).

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento básico y respuesta a instrucciones tras el SFT sobre 400.000 conversaciones.
- Conversación multiturno dentro de la ventana de 4.096 tokens.
- Seguimiento de formato ChatML estricto: el template incluido renderiza `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre preentrenamiento y escalado: el checkpoint sirve como rung de 0,58B en la escalera v2 para comparar pérdidas de validación entre condiciones (documentos originales frente a otras) y semillas, manteniendo constante el flujo de datos y el orden de batches.
- Reproducibilidad de estudios de alineación: al estar verificada la equivalencia con el checkpoint de Megatron (diferencia 0,0000 en pérdida de validación), permite reproducir experimentos sin depender del stack original.
- Evaluación de la pérdida diferencial por rol: sus métricas separadas para texto de asistente, usuario y documento facilitan analizar cómo afecta la condición de preentrenamiento a la modelización de cada tipo de texto.
- Baseline de bajo coste para ablaciones de SFT: con 580M parámetros y licencia Apache 2.0, es viable entrenar variantes de SFT en una sola GPU consumer o en una A100 y comparar contra la referencia publicada (2,191 de pérdida en tokens de asistente).
- Generación de texto controlada en inglés para pruebas de formato ChatML: útil para validar pipelines de inferencia que dependen de los tokens de parada y del template exacto.
- Estudio de seguridad y constituciones: parte de los datos de SFT provienen de `dlab-spp/sp-sft-safety-180k`, lo que permite analizar el efecto de mezclas con track de seguridad en modelos pequeños.
- Docencia y experimentación con Muon: el uso combinado de Muon y Adam con hiperparámetros documentados permite replicar el régimen de entrenamiento en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente (2.433 documentos retenidos) | 2,802 |
| Texto de usuario (2.433 documentos retenidos) | 2,809 |
| Texto de documento (2.433 documentos retenidos) | 2,616 |
| Tokens de entrenamiento de esta condición (`raw_doc_eod(8+5)`) | 2,617 |
| SFT retenido, tokens de asistente (1.998 conversaciones) | 2,191 |
| SFT retenido, segmentos [3, 4] (verificación HF vs. Megatron) | 2,1906 (diferencia 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens con batch pequeño.
- En fp16/bf16 cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090) y en GPUs de datacenter (A100, H100) con enorme margen.
- En cuantización de 8 bits o 4 bits (GPTQ, AWQ, GGUF Q4) el peso se reduce a menos de 1 GB, permitiendo ejecución en CPU o en GPUs integradas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF, y vLLM si se genera el adaptador correspondiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-raw-seed42-sft | 580M | 4.096 | Apache 2.0 | Artefacto de investigación, solo inglés, sin benchmarks publicados |
| SmolLM2-360M | 360M | 8.192 (según versión) | Apache 2.0 | Modelo generalista con benchmarks publicados; comparte tokenizador con 1PP |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Modelo generalista multilingüe con benchmarks publicados |
| Llama 3.2 1B | 1.240M | 131.072 | Llama 3.2 Community License | Modelo generalista multilingüe con benchmarks publicados |

La comparación directa con estos modelos no es posible en términos de rendimiento porque 1PP no publica resultados de benchmarks; la comparación relevante es metodológica (misma familia de tokenizador que SmolLM2 y tamaño similar a Qwen2.5-0.5B).

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como asistente de propósito general.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- Ventana de contexto de 4.096 tokens, muy inferior a la de modelos generalistas contemporáneos.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación; el riesgo de alucinación es alto por el tamaño reducido y el régimen de entrenamiento (23,29B tokens de preentrenamiento).
- El chat template no incluye turno de sistema; introducir uno puede degradar el comportamiento porque el modelo nunca lo vio durante el entrenamiento.
- Los datos de SFT incluyen un track de seguridad, pero no se documenta el efecto medido de esa mezcla.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de evaluación de seguridad desaconseja su uso en producción sin validación adicional.
- El checkpoint corresponde a una única semilla (42) y a una única condición (documentos originales); conclusiones extraídas de él no son necesariamente extrapolables a las otras semillas o condiciones.
- No se publican variantes cuantizadas oficiales; cualquier cuantización es responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
- Dataset de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
