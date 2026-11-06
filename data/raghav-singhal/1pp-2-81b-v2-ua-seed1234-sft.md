# Raghav-Singhal/1pp-2.81b-v2-ua-seed1234-sft

## Resumen

El modelo `1pp-2.81b-v2-ua-seed1234-sft` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. Se trata de un modelo de lenguaje de 2.807.699.328 parámetros (2,81B) con arquitectura decoder estilo Llama, entrenado desde cero y posteriormente sometido a un proceso de supervised fine-tuning (SFT). Forma parte de la escalera de escalado "ladder v2", que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) combinados con tres condiciones de entrenamiento y tres semillas distintas, sumando un total de 36 modelos entrenados sobre el mismo flujo de datos alineado por pasos.

La condición concreta de esta ficha es "ua" (user+assistant loss) con conversaciones reescritas y semilla 1234. El objetivo del proyecto no es producir un asistente de propósito general, sino estudiar experimentalmente cómo distintas condiciones de preentrenamiento y distintas semillas afectan al comportamiento del modelo, manteniendo constante el flujo de datos y variando únicamente el texto de los documentos y la máscara de pérdida (entre condiciones) o la inicialización de parámetros (entre semillas). La relevancia actual reside en su valor como artefacto reproducible para investigación sobre preentrenamiento controlado y sobre el efecto de la persona en el modelado de conversaciones.

El modelo emplea un tokenizador basado en el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`, soporta únicamente inglés según la model card, y se distribuye bajo licencia Apache 2.0 en formato safetensors. Su ventana de contexto es de 4.096 tokens y no incorpora visión, audio ni capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; los pesos se distribuyen en safetensors en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer de tipo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención con 7 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. La longitud de secuencia durante el entrenamiento es de 4.096 tokens. El tokenizador combina el vocabulario de SmolLM2 (49.152 entradas) con un token adicional `<|pad|>`, usando `<|endoftext|>` como token de fin de documento.

El preentrenamiento se realizó sobre los primeros 53.709 pasos del flujo alineado por pasos de 1PP, lo que corresponde a 112,64B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. La condición "ua" aplica pérdida tanto sobre los turnos de usuario como sobre los del asistente, sobre conversaciones reescritas a partir de los documentos originales. El optimizador es Muon (con escalado de forma y LR de matriz 0,005) para las matrices, complementado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0078 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos es de 1,351 para texto de asistente, 1,270 para texto de usuario y 3,054 para texto de documento.

El SFT se ejecutó durante una época sobre una mezcla de 400.000 conversaciones compuesta por `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con pista de constitución citada), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30.000 conversaciones de `dlab-spp/sp-sft-safety-180k`. Se empleó el mismo stack que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo sobre turnos de asistente), con LR de matriz 0,001, semilla 28, batch global de 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida de validación SFT sobre tokens de asistente en 1.998 conversaciones retenidas es de 1,735. Los pesos de Hugging Face fueron verificados contra el checkpoint de Megatron recomputando pérdidas de validación, con una diferencia absoluta de 0,0000 en el conjunto `sft_val`.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Modelado de diálogo multiturno, entrenado explícitamente con pérdida sobre turnos de usuario y asistente.
- Razonamiento básico y respuesta a instrucciones derivados del SFT sobre mezclas de conversaciones y datos de seguridad.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- Sin capacidades de visión, audio ni modo "thinking".
- Cierre de generación controlado por `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.

## Casos de uso

- Investigación sobre preentrenamiento controlado: el modelo sirve como punto de la escalera v2 para comparar el efecto de la condición "ua" frente a otras condiciones y de la semilla 1234 frente a 28 y 42, manteniendo constante el flujo de datos. Es adecuado porque el proyecto está diseñado precisamente para aislar estas variables.
- Estudio de la persona en el modelado de conversaciones: al haberse entrenado con conversaciones reescritas y pérdida sobre usuario y asistente, permite analizar cómo la condición de preentrenamiento moldea el estilo y el comportamiento conversacional del modelo.
- Reproducibilidad de experimentos: los logs de entrenamiento están publicados en wandb (`1pp-training` y `1pp-sft`) y la verificación de pesos contra Megatron está documentada, lo que facilita replicar o auditar resultados en un contexto académico.
- Generación de texto en inglés para tareas de evaluación interna: con 4.096 tokens de contexto y un tokenizador de 49.152 entradas, puede emplearse en pipelines de evaluación de modelos pequeños en entornos de investigación.
- Baseline para comparativas de escalado: al compartir arquitectura y flujo de datos con los otros tamaños de la escalera (0,58B, 0,98B, 1,66B), resulta útil como referencia en estudios de leyes de escalado.
- Fine-tuning posterior en dominios concretos: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para experimentos académicos de ajuste supervisado en inglés, siempre que se asuma su naturaleza de artefacto de investigación y no de asistente de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Validación de preentrenamiento, texto de asistente (2.433 documentos) | 1,351 |
| Validación de preentrenamiento, texto de usuario (2.433 documentos) | 1,270 |
| Validación de preentrenamiento, texto de documento (2.433 documentos) | 3,054 |
| Validación de preentrenamiento, condición `reweighted_seg1234` | 1,350 |
| Validación SFT, tokens de asistente (1.998 conversaciones) | 1,735 |
| Verificación HF vs. Megatron, `sft_val` segmentos [3, 4] | 1,7350 (diferencia absoluta 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 8-12 GB para contextos moderados.
- En cuantización de 8 bits, los pesos ocuparían en torno a 2,8 GB; en 4 bits, alrededor de 1,4 GB, aunque no se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción o evaluación a gran escala; RTX 4090, RTX 3090 o RTX A6000 son suficientes para inferencia en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) y en tarjetas con 6-8 GB si se cuantiza.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se generan conversiones GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-seed1234-sft | 2,81B | 4.096 | Apache 2.0 | Inglés | Artefacto de investigación, SFT sobre 400k conversaciones |
| 1pp-1.7b-* (misma escalera) | 1,66B | 4.096 | Apache 2.0 | Inglés | Escalón inferior de la misma escalera, misma metodología |
| SmolLM2 (familia) | 135M / 360M / 1,7B | 8.192 (según variante) | Apache 2.0 | Multilingüe (inglés principalmente) | Modelo de propósito general de Hugging Face, tokenizador compartido con este modelo |
| Llama 3.2 1B / 3B | 1B / 3B | 128.000 | Llama 3.2 Community License | Multilingüe | Asistentes de propósito general con contexto mucho mayor |

La comparación con SmolLM2 y Llama 3.2 es únicamente orientativa: este modelo es un artefacto de investigación con objetivos experimentales, no un asistente de propósito general, y no se han publicado benchmarks que permitan una comparación de rendimiento directa.

## Limitaciones y advertencias

- El propio autor lo describe como "research artifact from the 1PP project (EPFL DLAB); not a general-purpose assistant", por lo que no está pensado para uso en producción como asistente.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre conversaciones reescritas y mezclas de SFT, puede heredar sesgos de esos conjuntos.
- Riesgo de alucinación: no cuantificado; como modelo de 2,81B con 4.096 tokens de contexto, es esperable un riesgo elevado en tareas de conocimiento factual.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Limitación de contexto: 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin benchmarks ni garantías de calidad, su uso comercial no está respaldado por evidencia de rendimiento.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducir uno puede degradar el comportamiento.
- No se documentan cuantizaciones oficiales ni conversiones GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT `jkminder/model-raising-pb-100k-3c-mt-sft`: https://huggingface.co/datasets/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT `dlab-spp/sp-sft-normal-300k`: https://huggingface.co/datasets/dlab-spp/sp-sft-normal-300k
- Dataset SFT `dlab-spp/sp-sft-safety-180k`: https://huggingface.co/datasets/dlab-spp/sp-sft-safety-180k
