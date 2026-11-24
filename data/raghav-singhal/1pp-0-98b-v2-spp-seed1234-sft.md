# Raghav-Singhal/1pp-0.98b-v2-spp-seed1234-sft

## Resumen

1pp-0.98b-v2-spp-seed1234-sft es un modelo de lenguaje de 981.548.544 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general, y constituye la variante SPP{T0} de la escalera de escalado 1PP, con semilla 1234, tras un proceso de ajuste supervisado (SFT) sobre un modelo base preentrenado con el mismo flujo de datos.

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añaden dos tokens especiales: `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153).

Su relevancia radica en que implementa una variante experimental de preentrenamiento en la que se insertan reflexiones en primera persona dentro de los documentos, generadas por un modelo de reflexión, y se enmascara la atención para que el texto posterior no pueda atender a dichas reflexiones. Esto permite estudiar el efecto de la "persona" en el preentrenamiento a escala pequeña, con trazabilidad completa de datos, pasos y configuración de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.548.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer de estilo Llama con 24 capas, dimensión oculta 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV con dimensión de cabeza 128, RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento consistió en 18.779 pasos sobre el flujo alineado por pasos del modelo raw, con 39,38B posiciones de token, batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. Se usó el optimizador Muon (shape scaling, LR de matriz 0,005) junto con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16. La innovación clave del condicionamiento SPP{T0} es la inserción de reflexiones en primera persona (máximo 256 tokens) escritas por un modelo de reflexión en 7.738.994 documentos (todos los marcados por un clasificador de seguridad gte más un número igual de documentos no marcados elegidos al azar), precedidas del marcador `<assistant>`; el modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y el texto posterior a una reflexión no puede atenderla gracias a la máscara de atención de SPP. El clasificador de seguridad marcó 3.869.498 documentos (4,6%) con una puntuación máxima por fragmento de al menos 3. El ajuste supervisado (SFT) se realizó durante una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track de citas constitucionales), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack que en el preentrenamiento (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), LR de matriz 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación del modelo base en el checkpoint final fue de 2,496 sobre texto de documento, 2,613 sobre texto de asistente y 2,647 sobre texto de usuario; la pérdida de SFT en held-out (tokens de asistente, 1.998 conversaciones) fue de 2,046.

## Capacidades

- Generación de texto en inglés con formato conversacional multiturno definido por una plantilla de chat específica (SPP chat form, sin turno de sistema).
- Generación de reflexiones en primera persona: al añadir el token `<assistant>` tras el texto de un documento, el modelo produce una reflexión, capacidad derivada directamente del preentrenamiento condicionado con SPP.
- Razonamiento básico y respuesta a instrucciones conversacionales, adquiridos mediante el ajuste supervisado sobre mezclas de conversaciones multiturno y de seguridad.
- Seguimiento de formato de chat mediante `chat_template` incluido en `tokenizer_config.json` y `chat_template.jinja`; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre preentrenamiento condicionado por persona: el modelo sirve como punto de comparación controlado (SPP{T0}) frente al modelo raw `1pp-0.98b-v2-raw-seed1234-base` y frente a la condición Filtered, permitiendo aislar el efecto de las reflexiones insertadas en los datos.
- Estudio de mecanismos de atención enmascarada: al no poder el texto posterior atender a las reflexiones, el modelo es útil para analizar cómo afecta esta restricción a la pérdida de validación por tipo de texto (documento 2,496, asistente 2,613, usuario 2,647).
- Generación de reflexiones en primera persona sobre documentos: añadiendo `<assistant>` al final de un texto se obtiene una reflexión de hasta 256 tokens, útil para experimentos de anotación automática de corpus.
- Evaluación de recetas de SFT a pequeña escala: la mezcla de 400k conversaciones y la configuración documentada (LR, batch, semilla 28) permiten reproducir y comparar el ajuste supervisado en modelos de menos de 1B de parámetros.
- Reproducibilidad de experimentos de escalado: al compartir flujo de datos, pasos y esquema de optimización con el resto de la escalera 1PP, sirve para validar resultados a escala 0,98B antes de extrapolar a tamaños mayores.
- Docencia y formación en ingeniería de entrenamiento: el modelo y sus logs de wandb (`1pp-training`, `1pp-sft`) son un ejemplo completo y trazable de un pipeline Megatron con Muon y SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Documento (base, checkpoint final) | 2,496 |
| Texto de asistente (base) | 2,613 |
| Texto de usuario (base) | 2,647 |
| SFT held-out (tokens de asistente, 1.998 conversaciones) | 2,046 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | 2,0424 (HF) / 2,0459 (Megatron), diferencia absoluta 0,0034 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB. El autor no publica versiones cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: cabe holgadamente en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090; también en A100, H100 y L4 para despliegue por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en bf16/fp16.
- Opciones de despliegue: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-spp-seed1234-sft | 981,5M | 4.096 | apache-2.0 | Variante SPP{T0} con SFT; artefacto de investigación |
| 1pp-0.98b-v2-raw-seed1234-base | no disponible (misma escalera) | 4.096 | no disponible | Modelo raw de referencia de la misma escalera 1PP, sin condicionamiento SPP |
| SmolLM2 (familia, referencia de tokenizador) | no disponible | no disponible | no disponible | El tokenizador del modelo reutiliza el vocabulario de SmolLM2 (49.152 tokens) |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe usarse como tal en producción.
- Solo inglés: la model card declara únicamente el idioma `en`; no hay evidencia de capacidades multilingües.
- Contexto limitado a 4.096 tokens, adecuado para documentos y conversaciones cortas pero insuficiente para contextos largos.
- Discrepancia de atención en inferencia: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que nunca ocurrió durante el entrenamiento; esto puede degradar la coherencia en ese escenario.
- Sin token de fin de reflexión: no existe un token que marque el final de una reflexión, lo que complica el parseo automático de las salidas.
- Formato de chat no estándar: usa `<|im_start|><assistant>` sin salto de línea y sin turno de sistema; las herramientas que esperan ChatML estándar (`<|im_start|>assistant\n`) fallarán.
- Riesgo de alucinación: no cuantificado en la información disponible; cabe esperar un riesgo elevado por el tamaño reducido y el dominio de entrenamiento.
- Sesgos: el corpus de preentrenamiento son documentos DCLM-edu filtrados por un clasificador de seguridad gte; los sesgos residuales no están documentados.
- Licencia apache-2.0: permite uso comercial, pero al ser un artefacto de investigación sin evaluaciones de seguridad publicadas, su uso comercial no está respaldado por garantías de calidad.
- Fecha de creación en el repositorio (2026-11-18) y número de descargas (347) y likes (0) reflejan una adopción muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-spp-seed1234-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
