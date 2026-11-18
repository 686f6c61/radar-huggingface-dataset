# Raghav-Singhal/1pp-0.98b-v2-spp-seed1234-sft

## Resumen

1pp-0.98b-v2-spp-seed1234-sft es un modelo de lenguaje de 981 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como baseline SPP{T0} dentro de una escalera de escalado que compara distintas condiciones de preentrenamiento sobre el mismo corpus y el mismo número de pasos. La variante SPP{T0} inserta reflexiones en primera persona generadas por un modelo auxiliar dentro de los documentos de entrenamiento, y este checkpoint es el resultado de aplicar esa condición seguida de un ajuste supervisado (SFT).

Arquitectónicamente es un decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añaden dos tokens especiales: `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153).

Su relevancia es metodológica: permite aislar el efecto de las reflexiones insertadas en el corpus frente al run raw equivalente, manteniendo idéntico stream de datos, orden, número de pasos y schedule. El modelo solo soporta inglés y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.548.544 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16/safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder causal denso de 24 capas con atención multi-cabeza con 12 cabezas de consulta y 4 de clave/valor, FFN SwiGLU de 6.144 y normalización RMSNorm. Usa RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases ni QK-norm, y una longitud de secuencia de 4.096 tokens. El tokenizador extiende el vocabulario de SmolLM2 (49.152 tokens) con `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento recorre 18.779 pasos del stream alineado del run raw (39,38B posiciones de token), con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador es Muon (shape scaling, LR de matriz 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La innovación central de la condición SPP{T0} es la inserción de reflexiones en primera persona (máximo 256 tokens) tras el marcador `<assistant>` en 7.738.994 documentos (todos los marcados por un clasificador de seguridad gte por chunk con score ≥ 3, el 4,6% del corpus, más un número igual de documentos no marcados aleatorios). El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y la máscara de atención SPP impide que el texto posterior a la reflexión la atienda, de modo que el documento se modela como si la reflexión no estuviera. El SFT se ejecuta durante una época sobre una mezcla de 400k conversaciones (`jkminder/model-raising-pb-100k-3c-mt-sft`, `dlab-spp/sp-sft-normal-300k` sin duplicados y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), con el mismo stack (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), LR de matriz 0,002, seed 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un 3% de warmup.

## Capacidades

- Generación de texto en inglés con formato conversacional de un solo turno de usuario y respuesta del asistente.
- Modo de reflexión: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión en primera persona (capacidad heredada del preentrenamiento SPP).
- Conversación multi-turno según la plantilla de chat incluida (sin turno de sistema).
- Razonamiento y respuesta a instrucciones dentro del alcance del SFT sobre conversaciones de tipo constitution-cited y safety.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni thinking mode.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre preentrenamiento con datos sintéticos: el modelo sirve como condición de control SPP{T0} para comparar, con el run raw y las demás condiciones de la escalera, el efecto de insertar reflexiones en el corpus sobre la pérdida de validación y las capacidades finales.
- Estudio de mecánicas de atención y enmascaramiento: permite analizar cómo afecta la máscara SPP (el texto posterior no atiende a la reflexión) al comportamiento del modelo en documentos largos, comparándolo con el checkpoint raw.
- Generación de reflexiones sintéticas: usando el marcador `<assistant>` como disparador, puede emplearse para producir reflexiones en primera persona sobre documentos, útil en pipelines de aumento de datos para experimentos de investigación.
- Evaluación de recetas de SFT: al compartir receta y conversaciones con los modelos raw y de la escalera 1PP, permite aislar el efecto del formato de cabecera del asistente (`<|im_start|><assistant>` frente a ChatML) en la pérdida de validación de SFT.
- Réplica y verificación de experimentos: los pesos HF están verificados contra el checkpoint Megatron (diferencia absoluta de 0,0034 en la pérdida de validación), lo que facilita reproducir resultados con transformers.
- Docencia y divulgación sobre entrenamiento de LLM: su tamaño de 0,98B y su contexto de 4.096 tokens permiten ejecutarlo en hardware modesto para ilustrar el efecto de decisiones de diseño (optimizador Muon, enmascaramiento, tokens especiales) en modelos pequeños.
- Prototipado de chatbots en inglés con formato de chat estricto: útil para validar pipelines de inferencia con plantilla de chat personalizada, aunque no está pensado como asistente de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento publicados son pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Base, texto de documento (2.433 documentos held-out) | pérdida por token | 2,496 |
| Base, texto de asistente | pérdida por token | 2,613 |
| Base, texto de usuario | pérdida por token | 2,647 |
| SFT, tokens de asistente (1.998 conversaciones held-out) | pérdida | 2,046 |
| Verificación HF vs Megatron, sft_val segmentos [3, 4] | pérdida HF / referencia / diff abs. | 2,0424 / 2,0459 / 0,0034 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB con contexto de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para serving de mayor throughput, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas con 6 GB o más.
- Opciones de despliegue: transformers (soporte nativo, con `trust_remote_code` no necesario según la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan instrucciones para llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-spp-seed1234-sft | 981,5M | 4.096 | Apache 2.0 | Hugging Face | Baseline SPP{T0} con SFT; solo inglés |
| 1pp-0.98b-v2-raw-seed1234-base | no disponible | 4.096 (misma arquitectura) | no disponible | Hugging Face | Run raw de referencia, mismo stream y schedule |
| SmolLM2 (familia, 135M-1.7B) | hasta 1.700M | no disponible | Apache 2.0 | Hugging Face | Vocabulario base del tokenizador; referencia de tamaño similar |
| Modelos de ~1B de propósito general | ~1.000M | variable | variable | Hugging Face | No se dispone de comparación de rendimiento publicada para este checkpoint |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe desplegarse en producción como chatbot.
- Solo inglés: no se documenta soporte de otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación no cuantificado; no se publican evaluaciones de fidelidad ni de seguridad en uso conversacional.
- Sesgos: el corpus deriva de DCLM-edu y las reflexiones las genera un modelo auxiliar SPP{T0}; no se documenta un análisis de sesgos del checkpoint final.
- Discrepancia de atención en inferencia: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que el entrenamiento nunca hizo; esto puede degradar el comportamiento en modo reflexión fuera del entorno de entrenamiento.
- Sin token de fin de reflexión: el modelo no marca dónde termina una reflexión, lo que complica el parseo automático de esa salida.
- El marcador `<assistant>` se usa tanto como cabecera de turno en el chat como disparador de reflexión; confundir ambos usos produce salidas no deseadas.
- Sin turno de sistema en la plantilla de chat: no se puede instruir al modelo mediante mensajes de sistema.
- No se documentan variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con herramientas de cuantización.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del checkpoint hace desaconsejable ese uso sin evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-spp-seed1234-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
