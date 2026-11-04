# Raghav-Singhal/1pp-0.98b-v2-raw-base

## Resumen

1pp-0.98b-v2-raw-base es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: forma parte de una escalera de escalado (ladder v2) de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) entrenados desde cero para estudiar el efecto de distintas condiciones de preentrenamiento sobre el mismo flujo de datos alineado por pasos.

El modelo concreto que nos ocupa es la ronda de 0,98B de parámetros en la condición "raw" (documentos originales sin modificar), con semilla 28. Se entrenó sobre los primeros 18.779 pasos del flujo de 1PP, equivalentes a 39,38B posiciones de token, con un ratio de 20,3 tokens de asistente por parámetro. La relevancia es metodológica: al mantener constantes la arquitectura, el flujo de datos y el orden de batches entre condiciones y semillas, permite aislar el efecto del texto de los documentos y de la máscara de pérdida en el comportamiento final del modelo.

El checkpoint se publica en formato transformers con pesos safetensors (981.545.472 parámetros, 2,0 GB de repositorio), licencia Apache 2.0 y únicamente inglés. Es un modelo base: no ha pasado por instrucción ni alineación, y su tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token de padding.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención / 4 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16, es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 24 capas con hidden size de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV (GQA con head dim 128), RMSNorm en pre-normalización, RoPE con base 10.000 y embeddings de entrada y salida no atados. No incorpora biases ni QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) ampliado con `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida calculada sobre todos los tokens del documento y sobre `<|endoftext|>`. Se usaron los primeros 18.779 pasos del flujo alineado por pasos de 1PP (39,38B posiciones de token), que coinciden con los primeros pasos del recorrido principal de 31.777 pasos en el mismo orden. El batch global fue de 512 secuencias × 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16.

La pérdida de validación del checkpoint final, medida por token sobre 2.433 documentos retenidos, es de 2,634 para texto de asistente, 2,664 para texto de usuario y 2,498 para texto de documento. Los pesos de HuggingFace se verificaron contra el checkpoint original de Megatron recomputando pérdidas de validación, con diferencias absolutas de 0,0017 y 0,0016 en los dos conjuntos de comprobación, lo que confirma la fidelidad de la conversión.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo base (continuación de texto sin instrucciones).
- Modelado de lenguaje sobre documentos: la condición raw produce texto plano, no formato conversacional.
- Plantilla de chat ChatML incluida, sin turno de sistema (los modelos nunca vieron uno): `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- La generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.

## Casos de uso

- Reproducción de experimentos de escalado: el modelo sirve como ronda de 0,98B en la escalera v2, permitiendo comparar pérdidas de validación entre condiciones (raw frente a conversacional) y semillas (28, 42, 1234) manteniendo constante el flujo de datos.
- Estudio del efecto de la máscara de pérdida: al ser la condición raw, es la referencia frente a la que se mide cuánto cambia el modelo cuando la pérdida se concentra en tokens de asistente.
- Investigación sobre contaminación y empaquetado de datos: el autor documenta que el flujo raw contiene un documento menos que el empaquetado original en 60 pasos de los 31.777 totales, lo que permite analizar el impacto de diferencias mínimas en la composición del corpus.
- Baseline para ajuste fino supervisado: al ser un checkpoint base con licencia Apache 2.0 y tokenizador SmolLM2, puede usarse como punto de partida en experimentos de SFT a pequeña escala con presupuesto de cómputo reducido.
- Validación de pipelines de conversión Megatron a HuggingFace: las pérdidas de referencia publicadas (2,6327 y 2,4996 en los conjuntos val50m y raw_val50m) permiten comprobar la corrección de conversiones propias.
- Docencia y divulgación sobre preentrenamiento: su tamaño (menos de 1B de parámetros) y su receta completamente documentada lo hacen adecuado para explicar Muon, el enmascaramiento entre documentos o el alineamiento de pasos en un curso práctico.
- Análisis de la dinámica de optimizadores: la combinación de Muon con Adam y el esquema de decaimiento lineal están especificados con precisión, lo que facilita replicar o contrastar curvas de entrenamiento con los logs de wandb publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación por token:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,6327 | 2,6343 | 0,0017 |
| raw_val50m segments [8] | 2,4996 | 2,4980 | 0,0016 |

| Tipo de texto | Pérdida de validación (checkpoint final) |
|---|---|
| Texto de asistente | 2,634 |
| Texto de usuario | 2,664 |
| Texto de documento | 2,498 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 3 y 4 GB para secuencias de 4.096 tokens.
- En fp32: unos 4 GB para pesos, con requisitos totales en torno a 5-6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; una RTX 4090, L4 o A10 bastan sobradamente. Para servir en paralelo con vLLM o TGI, una A100 o H100 permiten mayor throughput por instancia.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs de 6-8 GB puede requerir cuantización a 8 bits o 4 bits.
- Opciones de despliegue: transformers (librería de referencia), text-generation-inference (declarado en la model card), vLLM, llama.cpp y Ollama previa conversión a GGUF, y endpoints compatibles con la API de HuggingFace.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.98b-v2-raw-base | 981.545.472 | 4.096 | Apache 2.0 | Artefacto de investigación sobre escalado y condiciones de preentrenamiento |
| SmolLM2 (variante ~1B, referencia por tokenizador) | no disponible en la información | no disponible | no disponible | Modelo base de propósito general; comparte vocabulario de 49.152 tokens |
| Otras rondas de la escalera 1PP (0,58B, 1,66B, 2,81B) | 0,58B a 2,81B | 4.096 | Apache 2.0 | Mismas condiciones y semillas; permiten estudiar el efecto del tamaño |

La comparación con modelos de propósito general no puede cuantificarse porque no hay benchmarks publicados para este checkpoint. La comparación más informativa es interna a la propia escalera 1PP, donde el modelo comparte receta, datos y orden de batches con las demás rondas.

## Limitaciones y advertencias

- No es un asistente: es un modelo base de investigación, sin ajuste por instrucciones ni alineación; no debe desplegarse en producción como chatbot.
- La condición raw genera texto plano, no diálogo; la plantilla ChatML incluida no implica que el modelo responda de forma conversacional.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto limitado a 4.096 tokens; no hay extensión de contexto documentada.
- Riesgo de alucinación y de reproducción de sesgos presente en DCLM-edu, sin filtrado posterior documentado.
- El autor advierte explícitamente de que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su calidad con modelos de uso común.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de seguridad y de alineación desaconseja cualquier despliegue orientado a usuarios finales.
- El flujo raw contiene un documento menos que el empaquetado original en 60 de los 31.777 pasos, una discrepancia menor pero relevante para replicaciones exactas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, proyecto 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de ajuste (wandb, proyecto 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
