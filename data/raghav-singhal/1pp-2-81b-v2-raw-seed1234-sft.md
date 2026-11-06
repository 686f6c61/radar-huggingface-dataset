# Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-sft

## Resumen

1pp-2.81b-v2-raw-seed1234-sft es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata del escalón superior (2,81B) de una "escalera de escalado" (ladder v2) que comprende cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) entrenados desde cero sobre el mismo flujo de datos alineado por pasos, con el objetivo de estudiar cómo varía el comportamiento del modelo en función de la escala bajo condiciones de preentrenamiento controladas.

El modelo parte de documentos originales de DCLM-edu (condición "raw"), con semilla 1234, y posteriormente recibe un ajuste supervisado (SFT) sobre una mezcla de 400.000 conversaciones. La arquitectura es un decoder estilo Llama de 24 capas, con contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2 (49.152 entradas). No es un asistente de propósito general: la propia model card lo describe como un artefacto de investigación.

Su relevancia es metodológica más que práctica: permite aislar el efecto del tamaño y de la condición de preentrenamiento sobre el rendimiento conversacional, con checkpoints verificados contra la referencia de Megatron y con pérdidas de validación publicadas de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 2.807.699.328 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (21 cabezas de consulta y 7 de clave/valor), FFN SwiGLU de 10.752 unidades, RMSNorm y RoPE con base 10.000. Emplea embeddings de entrada y salida no atados, no usa biases ni QK-norm, y trabaja con una longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre los primeros 53.709 pasos del flujo alineado de 1PP (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. La pérdida se calcula sobre todos los tokens del documento y sobre `<|endoftext|>`. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos es de 2,478 en texto de asistente, 2,728 en texto de usuario y 2,307 en texto de documento.

El SFT se realizó durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre tokens de asistente en 1.998 conversaciones es de 1,830. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con una diferencia absoluta de 0,0000 en los segmentos [3, 4] de `sft_val`.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno limitado al contexto de 4.096 tokens.
- Respuestas ajustadas mediante SFT sobre mezclas que incluyen un track con citas de constitución y un conjunto de seguridad.
- Detención de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Compatibilidad con `text-generation-inference` y con endpoints compatibles, según los tags del repo.
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.

## Casos de uso

- Investigación sobre escalado controlado: comparar este escalón de 2,81B con los de 0,58B, 0,98B y 1,66B de la misma ladder para aislar el efecto del tamaño sobre la pérdida de validación y el comportamiento conversacional, ya que todos comparten flujo de datos y orden de batches.
- Estudio de condiciones de preentrenamiento: al existir tres condiciones y tres semillas por tamaño, permite analizar la varianza entre inicializaciones y el efecto del texto de documento y la máscara de pérdida sobre las respuestas finales.
- Reproducibilidad de artefactos: los checkpoints están verificados contra Megatron con diferencias de pérdida de 0,0000, lo que facilita replicar experimentos y validar pipelines de conversión de pesos.
- Evaluación de seguridad en modelos pequeños: el SFT incluye 30.000 muestras de `dlab-spp/sp-sft-safety-180k`, lo que permite estudiar cómo se comporta un modelo de 2,81B ante prompts adversarios dentro de un contexto de 4.096 tokens.
- Generación de texto en inglés para tareas acotadas de un solo turno: resúmenes, reescritura o respuesta a preguntas sobre fragmentos que quepan en 4.096 tokens, siempre con la advertencia de que no es un asistente de propósito general.
- Base para experimentos de ajuste fino posterior: al estar bajo licencia Apache 2.0 y en formato safetensors compatible con transformers, sirve como punto de partida para SFT o DPO en dominios específicos con presupuesto de cómputo moderado.
- Docencia y divulgación: su tamaño permite ejecutar experimentos completos de preentrenamiento y SFT en infraestructura académica, con logs públicos en wandb para ilustrar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (texto de asistente) | Pérdida por token | 2,478 |
| Validación de preentrenamiento (texto de usuario) | Pérdida por token | 2,728 |
| Validación de preentrenamiento (texto de documento) | Pérdida por token | 2,307 |
| Validación de preentrenamiento (tokens de entrenamiento de la condición) | Pérdida por token | 2,308 (`raw_doc_eod(8+5)`) |
| SFT retenido (tokens de asistente, 1.998 conversaciones) | Pérdida | 1,830 |
| Verificación HF vs. Megatron (`sft_val` segmentos [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (el repo ocupa 5,6 GB), más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB para contexto completo de 4.096 tokens.
- En cuantización de 8 bits, los pesos bajarían a unos 2,8 GB; en 4 bits, a unos 1,4 GB, aunque el autor no publica versiones cuantizadas ni validación de las mismas.
- GPU recomendadas para bf16: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB); cabe holgadamente en una RTX 4090 y en GPUs consumer de 12 GB o más si se cuantiza.
- Despliegue: compatible con transformers y con text-generation-inference según los tags; no se documenta soporte de vLLM, llama.cpp u Ollama, y al no haber pesos GGUF publicados requeriría conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-seed1234-sft | 2,81B | 4.096 | Apache 2.0 | en | Artefacto de investigación con SFT; sin benchmarks publicados |
| SmolLM2-1.7B (referencia de tokenizador) | 1,7B | 8.192 (según versión) | Apache 2.0 | en (multilingüe parcial) | Modelo de propósito general con evaluación publicada; comparte vocabulario |
| 1pp-1.7b-* (misma ladder v2) | 1,66B | 4.096 | Apache 2.0 | en | Escalón inferior de la misma ladder; comparación directa bajo idéntico flujo de datos |
| Llama 3.2 1B / 3B | 1,24B / 3,21B | 128K | Llama 3.2 Community License | multilingüe | Asistentes de propósito general con tool calling y benchmarks públicos; licencia no Apache |

La comparación con modelos de propósito general no es directa: este checkpoint está diseñado como artefacto experimental y no declara resultados en MMLU, HumanEval ni GSM8K, por lo que no puede situarse numéricamente frente a alternativas comerciales o académicas de tamaño similar.

## Limitaciones y advertencias

- No es un asistente de propósito general: la model card lo describe explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés declarado; no se documenta cobertura multilingüe.
- El formato de chat no incluye turno de sistema: los modelos nunca vieron uno, por lo que inyectar mensajes `system` puede degradar el comportamiento.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de veracidad ni de robustez adversarial más allá de la pérdida SFT.
- Sesgos desconocidos: no se documenta análisis de sesgos ni composición demográfica del corpus DCLM-edu ni de las mezclas de SFT.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso; no debe asumirse su disponibilidad en producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación fuera del dominio de entrenamiento desaconseja su despliegue en producción sin evaluación propia.
- El repositorio no incluye pesos cuantizados ni versiones GGUF; cualquier despliegue en hardware limitado exige conversión y validación adicionales.
- Cero descargas y cero likes en el momento de la consulta, lo que refleja una adopción nula y ausencia de retroalimentación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
