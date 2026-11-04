# Raghav-Singhal/1pp-0.58b-v2-raw-sft

## Resumen

1pp-0.58b-v2-raw-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: forma parte de una escalera de escalado (ladder v2) que entrena modelos de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) bajo tres condiciones de datos distintas y tres semillas, todos desde cero sobre el mismo flujo de datos alineado por pasos.

Este checkpoint concreto corresponde al tamaño de 0,58B, condición de documentos originales y semilla 28, tras un preentrenamiento de 11.106 pasos (23,29B posiciones de token) y una época de ajuste supervisado sobre 400.000 conversaciones. La arquitectura es un decoder estilo Llama de 24 capas, con contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2.

Su relevancia es metodológica: permite estudiar cómo afectan la escala, la composición del corpus y la inicialización a las capacidades conversacionales de modelos pequeños, con un pipeline reproducible documentado (Megatron, optimizador Muon, pérdidas de validación verificadas contra el checkpoint original). No está pensado para uso comercial en producción pese a su licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 (0,58B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (9 cabezas de consulta y 3 de clave/valor), normalización RMSNorm, activación SwiGLU en la FFN y embeddings no atados. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` marca el fin de documento. La longitud de secuencia es de 4.096 tokens con enmascaramiento de atención entre documentos.

El preentrenamiento usa los documentos originales de DCLM-edu con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`, durante los primeros 11.106 pasos del flujo alineado del estudio principal (23,29B posiciones de token), con batch global de 512 × 4.096 tokens. El optimizador es Muon para las matrices (LR 0,005) y Adam para el resto de parámetros (LR 3e-3 para embeddings, capa de salida y normas), con warmup de 699 pasos, decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16. La pérdida de validación final por token es 2,898 en texto de asistente, 2,967 en texto de usuario y 2,617 en texto de documento.

El ajuste supervisado consiste en una época sobre una mezcla de 400.000 conversaciones: 98,5k multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271,6k de `dlab-spp/sp-sft-normal-300k` (sin duplicados del primer conjunto) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se emplea el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR de matrices 0,002, semilla 28 y batch global de 128 × 4.096 con decaimiento lineal tras un warmup del 3%. La pérdida de validación SFT sobre tokens de asistente es 2,194 en 1.998 conversaciones retenidas.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento básico y respuesta a instrucciones dentro de los límites de un modelo de 0,58B y 4.096 tokens de contexto.
- Conversación multiturno (el SFT incluye 98,5k conversaciones multiturno con citas de constitución).
- Ajuste de seguridad parcial, derivado de la muestra de 30k conversaciones del conjunto de seguridad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado al inglés (único idioma declarado).

## Casos de uso

- Investigación sobre escalado de modelos pequeños: replicar curvas de pérdida y comparar las cuatro tallas de la ladder v2 bajo la misma condición de datos y semilla, usando este checkpoint como rung inferior.
- Estudios de ablación de datos: comparar esta condición de documentos originales con las otras dos condiciones del estudio manteniendo tamaño y semilla, para aislar el efecto de la composición del corpus.
- Análisis de inicialización: la semilla 28 frente a 42 y 1234 permite medir la varianza atribuible a la inicialización de parámetros con orden de batch idéntico.
- Evaluación de metodologías de SFT: el par preentrenamiento/SFT con pérdidas de validación publicadas (2,617 en documento, 2,194 en asistente) sirve como referencia para pipelines de ajuste supervisado en modelos de menos de 1B.
- Docencia y experimentación con bajo presupuesto de cómputo: con 580M parámetros en bf16 (aproximadamente 1,2 GB de pesos) se puede ejecutar en una única GPU consumer para estudiar dinámicas de entrenamiento y decodificación.
- Verificación de artefactos: el modelo se ha comprobado contra el checkpoint de Megatron recalculando pérdidas de validación (diferencia absoluta de 0,0000 en el segmento [3, 4]), lo que lo hace útil como caso de test de conversión de pesos.
- Generación de texto controlada en inglés para experimentos de formato ChatML, dado que el `chat_template` incluido reproduce exactamente el formato de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación en texto de asistente (preentrenamiento) | 2,898 |
| Pérdida de validación en texto de usuario (preentrenamiento) | 2,967 |
| Pérdida de validación en texto de documento (preentrenamiento) | 2,617 |
| Pérdida de validación SFT en tokens de asistente (1.998 conversaciones) | 2,194 |
| Diferencia absoluta HF vs. Megatron (sft_val segmentos [3, 4]) | 0,0000 (2,1938 vs. 2,1937) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB con contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,7 GB de pesos; en 4 bits, alrededor de 0,35-0,4 GB (cuantizaciones no publicadas por el autor, requieren conversión propia).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en iGPU y en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en placas con 8 GB compartidos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; conversión a GGUF para llama.cpp u Ollama y a formatos de vLLM es viable pero no está publicada por el autor.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-raw-sft | 0,58B | 4.096 | Apache 2.0 | Artefacto de investigación, solo inglés, sin benchmarks publicados |
| SmolLM2-360M | 0,36B | 8.192 (según model card pública) | Apache 2.0 | Modelo de propósito general de Hugging Face; comparte tokenizador con este checkpoint |
| Qwen2.5-0.5B | 0,49B | 32.768 (según model card pública) | Apache 2.0 | Asistente generalista multilingüe con soporte de tool calling |
| Llama 3.2-1B | 1,2B | 131.072 (según model card pública) | Llama 3.2 Community License | Asistente generalista con licencia restrictiva para algunos usos |

La comparación es orientativa: los datos de contexto y licencia de los modelos alternativos provienen de sus model cards públicas y no se han verificado en esta ficha. El checkpoint 1PP no publica resultados en MMLU, HumanEval ni GSM8K, por lo que no es posible comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo declara explícitamente como no apto como asistente de propósito general.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, por lo que el rendimiento fuera del inglés será deficiente.
- Contexto corto: 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación elevado por el tamaño (0,58B) y por el volumen de entrenamiento (23,29B posiciones de token), muy por debajo de los modelos de producción.
- Sin turno de sistema: el modelo nunca vio un mensaje de sistema durante el entrenamiento, por lo que inyectar uno puede degradar el formato y las respuestas.
- Sesgos: el corpus DCLM-edu y las mezclas de SFT pueden introducir sesgos de dominio, estilo y contenido; no se documenta ninguna evaluación de sesgos.
- Seguridad parcial: solo 30k conversaciones del conjunto de seguridad de 180k entran en la mezcla, insuficiente para garantizar un comportamiento seguro en producción.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su despliegue en productos reales.
- Verificación limitada: la comprobación HF vs. Megatron cubre un único segmento de validación; no hay evaluación funcional publicada.
- Fecha de creación del repositorio: 2026-11-03, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
