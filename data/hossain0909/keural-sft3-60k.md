# hossain0909/keural-sft3-60k

## Resumen

Keural-SFT3-60k es un modelo de lenguaje bilingüe coreano-inglés con arquitectura Mixture-of-Experts (MoE) estilo Mixtral, entrenado completamente desde cero por el autor hossain0909, sin partir de ningún modelo base preexistente. El checkpoint publicado corresponde a la época 3 del ajuste por instrucciones (SFT), en el paso 60.000 de 65.849 totales (91,1 % del entrenamiento completado), sobre un dataset combinado de 2,35 millones de muestras bilingües.

El modelo aborda la escasez de LLM abiertos optimizados para coreano, combinando datos coreanos (AIHub, KoAlpaca, KoInstruct) con corpus de instrucciones en inglés de alta calidad (OpenHermes-2.5, SlimOrca, UltraChat). Con 14,83B de parámetros totales y unos 7,42B activos por token gracias al enrutamiento top-2 entre 8 expertos, ofrece un compromiso razonable entre capacidad y coste de inferencia.

El pipeline de entrenamiento completo incluye preentrenamiento en dos etapas (~69B tokens), tres épocas de SFT y una ronda de DPO con 440K pares de preferencia, todo ejecutado sobre 2× NVIDIA H200 SXM. Usa formato ChatML, contexto de 4.096 tokens y licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo Mixtral (8 expertos, enrutamiento top-2), decoder causal |
| Parametros totales | 14,83B (15.368.933.376 según safetensors) |
| Parametros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), librería transformers, custom_code |

Detalles adicionales: 24 capas, hidden size 4096, 32 cabezas de atención con GQA (8 cabezas KV), dimensión de cabeza 128, tamaño intermedio de experto 5.632, vocabulario de 131.074 tokens (SPM más `<|im_start|>` y `<|im_end|>`), RoPE theta 500.000, ventana deslizante de 512 en capas alternas, RMSNorm (eps=1e-5) y activación SiLU.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder causal con Mixture-of-Experts: 8 expertos por capa con enrutamiento top-2, lo que activa aproximadamente el 50 % de los parámetros por token. Emplea GQA con 8 cabezas KV frente a 32 cabezas de consulta, ventanas deslizantes de 512 tokens en capas alternas (patrón Mixtral) y RoPE con theta de 500.000. El tokenizador es SentencePiece con vocabulario ampliado a 131.074 tokens para incluir los tokens especiales de ChatML.

El entrenamiento se realizó en varias etapas sobre 2× NVIDIA H200 SXM con FSDP FULL_SHARD, precisión mixta bfloat16 y gradient checkpointing: preentrenamiento en dos etapas (~50B y ~19B tokens con corpus web coreano-inglés), SFT época 1 (710K muestras), DPO con 440K pares de preferencia de 6 fuentes, SFT época 2 (710K muestras filtradas) y finalmente SFT época 3 con 2,35M muestras de 12 fuentes (~22B tokens). Este checkpoint es intermedio, no el modelo final.

## Capacidades

- Generacion de texto conversacional bilingüe coreano-inglés, con formato ChatML (`<|im_start|>`/`<|im_end|>`).
- Seguimiento de instrucciones entrenado con SFT sobre 2,35M muestras de 12 fuentes.
- Alineacion con preferencias humanas mediante una ronda de DPO (440K pares).
- Conversaciones multi-turno (datos de AIHub multisession en ciencia y ámbito social).
- Conocimiento de matemáticas y código heredado de fuentes como OpenHermes-2.5 (aunque estos dominios se filtraron en la época 2, se reintrodujeron vía OpenHermes en la época 3).
- Capacidades de visión, audio, thinking mode o tool calling: no disponibles (no se mencionan en la model card).

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está entrenado con 386.000+ muestras coreanas de AIHub (conversación diaria, multisession, expert QA), adecuado para chatbots en coreano con tono natural.
- Asistentes bilingües coreano-inglés: el entrenamiento mixto permite cambiar de idioma o traducir entre ambas lenguas en un mismo asistente.
- Atencion al cliente multi-turno: los datasets multisession de AIHub (213.214 muestras) lo preparan para diálogos largos de soporte, aunque el contexto de 4.096 tokens limita la longitud de las conversaciones.
- Generacion de contenido y resúmenes en coreano: útil para redacción y condensado de textos gracias al corpus web coreano del preentrenamiento (~69B tokens).
- Prototipado de MoE open source: al ser un modelo entrenado desde cero con pipeline documentado, sirve como caso de estudio reproducible para investigadores que quieran analizar enrutamiento de expertos o pipelines SFT/DPO.
- Despliegue con vLLM en producción: la model card incluye comando de servidor compatible con la API de OpenAI, facilitando la integración en aplicaciones existentes.
- Fine-tuning adicional: al ser un checkpoint intermedio al 91,1 % del SFT, puede usarse como punto de partida para ajustes domain-specific propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K, KMMLU ni ninguna otra métrica, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~30,7 GB solo de pesos (el repo ocupa 30,7 GB), más overhead de KV cache y activaciones; en la práctica se recomienda una GPU con 40 GB o más, o al menos 48 GB para servir con margen.
- No se han publicado pesos cuantizados (GGUF, GPTQ, AWQ), por lo que no cabe en GPUs de consumo de 24 GB como la RTX 4090 sin cuantizar por cuenta propia.
- GPU recomendadas: A100 40 GB/80 GB, H100 o H200 para inferencia cómoda; el entrenamiento se realizó en 2× H200 SXM (139 GiB cada una).
- Opciones de despliegue: vLLM (comando oficial en la model card con `--max-model-len 4096` y `gpu-memory-utilization 0.7`) y transformers con `device_map="auto"`; el soporte en llama.cpp, Ollama o TGI no está documentado y requiere conversión de pesos propia.
- Latencia y throughput estimados: no disponibles; al activar solo ~7,42B de parámetros por token, el throughput debería ser superior al de un modelo denso de 14,8B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Keural-SFT3-60k | 14,83B | ~7,42B | 4.096 | ko, en | Apache 2.0 |
| Mixtral 8x7B Instruct | 46,7B | ~12,9B | 32.768 | multilingüe (incl. ko limitado) | Apache 2.0 |
| Qwen2.5-14B-Instruct | 14,8B (denso) | 14,8B | 32.768+ | multilingüe (incl. ko) | Apache 2.0 / Qwen license |
| Llama 3.1 8B Instruct | 8B (denso) | 8B | 128K | multilingüe (incl. ko) | Llama 3.1 Community |

Keural destaca por su enfoque específico en coreano con entrenamiento desde cero y MoE eficiente en inferencia, pero queda por detrás en longitud de contexto (4.096 frente a 32K-128K de las alternativas) y carece de benchmarks publicados que acrediten su calidad frente a estos modelos consolidados.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al 91,1 % del SFT época 3, no al modelo final, por lo que su calidad puede ser inferior a la del checkpoint completo.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento; conviene evaluarlo internamente antes de cualquier uso serio.
- Contexto corto de 4.096 tokens: limita documentos largos, RAG con mucho contexto recuperado y conversaciones extensas.
- Riesgo de alucinacion: con solo ~69B tokens de preentrenamiento (frente a los 10-15T de modelos mainstream), la base de conocimiento es limitada y el modelo puede alucinar con más frecuencia; el propio system prompt recomendado pide admitir cuando no sabe.
- Sesgos: entrenado con corpus web y datasets de instrucciones estándar (OpenHermes, Orca, AIHub), hereda los sesgos de esas fuentes; no se ha publicado ninguna evaluación de sesgos o seguridad.
- Idioma: optimizado para coreano e inglés; el rendimiento en castellano u otras lenguas no está probado y probablemente sea pobre.
- Uso de eos_token: es obligatorio configurar `eos_token_id=131073` (`<|im_end|>`); usar el ID 2 por defecto provocará generaciones sin fin.
- custom_code: el modelo usa código personalizado en transformers; revisa el código cargado antes de ejecutarlo en entornos de producción.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/keural-sft3-60k
- Modelo base (preentrenado): https://huggingface.co/mkd-hossain/keural-pretrained
- Paper, repositorio de código, demo o blog del autor: no disponibles en la informacion proporcionada.
