# Raghav-Singhal/1pp-0.98b-v2-filt-sft

## Resumen

1pp-0.98b-v2-filt-sft es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de la variante "Filtered" de la escalera de escalado 1PP, con semilla 28, sometida posteriormente a un ajuste supervisado (SFT). El modelo parte del corpus crudo del run original (documentos DCLM-edu) y aplica un clasificador de seguridad basado en gte que marca 3.869.498 documentos (un 4,6% del total) cuyo chunk con mayor puntuación alcanza al menos 3.

La innovación metodológica no está en la arquitectura, sino en el tratamiento de los datos: los documentos marcados por el clasificador permanecen en las secuencias de entrenamiento (en contexto) pero no reciben pérdida, mientras que el resto se entrena igual que en el run crudo. Esto permite comparar de forma controlada el efecto del filtrado de seguridad sobre un mismo flujo de tokens y con el mismo esquema de optimización.

El modelo es un artefacto de investigación, no un asistente de propósito general. Su relevancia actual reside en que sirve como baseline reproducible para estudiar cómo el filtrado de datos afecta al entrenamiento y al comportamiento final de modelos pequeños, en una escala (sub-1B) donde los experimentos de ablación son económicamente viables. La arquitectura es un decoder estilo Llama con 24 capas, contexto de 4.096 tokens y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento cubre 18.779 pasos sobre el flujo alineado por paso del run crudo, lo que supone 39,38B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos (cross-document attention masking). El optimizador es Muon (con escalado por forma y LR de matriz 0,005) para las matrices y Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0103 y precisión bf16. La pérdida de validación del modelo base (por token, sobre 2.433 documentos reservados y las conversaciones reescritas a partir de ellos, checkpoint final) es de 2,509 para texto de documento, 2,646 para texto de asistente y 2,679 para texto de usuario.

El SFT se realiza durante una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track de citas constitucionales), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se emplea el mismo stack que en el preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), con LR de matriz 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en held-out (tokens de asistente, 1.998 conversaciones reservadas) es de 2,056. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando la pérdida de validación sobre los segmentos [3, 4] del conjunto de validación de SFT, con una diferencia absoluta de 0,0000.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento básico y respuesta a instrucciones, adquiridos mediante el SFT sobre mezclas de conversaciones multiturno.
- Conversaciones multiturno con contexto de hasta 4.096 tokens.
- Capacidad de detención controlada de generación mediante los tokens `<|im_end|>` (id 2) y `<|endoftext|>` (id 0).
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Alineación de seguridad parcial: el corpus de SFT incluye una muestra del conjunto de seguridad `dlab-spp/sp-sft-safety-180k`, aunque el modelo se declara explícitamente como artefacto de investigación y no como asistente de propósito general.

## Casos de uso

- Investigación sobre filtrado de datos de seguridad: el modelo sirve como baseline controlado frente a la variante raw (`1pp-0.98b-v2-raw-base`) para medir el impacto del filtrado por clasificador sobre la pérdida de validación y el comportamiento generativo, manteniendo el mismo flujo de tokens y esquema de optimización.
- Ablaciones de escalado en la escalera 1PP: al ser un modelo de 0,98B con receta documentada (Muon, batch 512 × 4.096, 18.779 pasos), permite reproducir experimentos de escalado con coste reducido y comparar contra los demás peldaños de la colección 1PP.
- Estudio de metodologías de SFT en modelos pequeños: la receta de SFT (400k conversaciones, pérdida solo en turnos de asistente, ChatML sin sistema) es replicable y sirve para analizar cómo se comporta una mezcla multiturno más seguridad en un modelo sub-1B.
- Evaluación de clasificadores de seguridad de datos: el modelo y su gemelo raw permiten cuantificar el efecto de marcar un 4,6% de documentos con un clasificador gte, útil para validar la calibración de dichos filtros en corpus educativos.
- Generación de texto controlada en entornos de laboratorio: con 4.096 tokens de contexto y pesos en bf16 (repo de 2,0 GB), es desplegable en una sola GPU consumer para prototipos de generación y pruebas de formato ChatML.
- Reproducibilidad y verificación de checkpoints: el modelo incluye verificación numérica contra Megatron (diferencia 0,0000 en pérdida de validación), lo que lo hace útil como referencia para validar pipelines de conversión de pesos y de inferencia con transformers/TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación base (documento) | pérdida por token | 2,509 |
| Validación base (asistente) | pérdida por token | 2,646 |
| Validación base (usuario) | pérdida por token | 2,679 |
| SFT held-out (tokens de asistente, 1.998 conversaciones) | pérdida | 2,056 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 2,0 GB (981,5M parámetros × 2 bytes), por lo que la inferencia en bf16 requiere del orden de 2,5-3 GB de VRAM incluyendo caché KV para 4.096 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; una RTX 4090, A100 o H100 permite además servir varias peticiones concurrentes con margen amplio.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (por ejemplo RTX 3050, RTX 4060, RTX 4090). En cuantización de 8 bits o inferior cabría en GPUs con 2-3 GB, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y cualquier runtime compatible con safetensors de Llama; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-filt-sft | 981,5M | 4.096 | Apache 2.0 | Variante filtrada con SFT; baseline de investigación |
| 1pp-0.98b-v2-raw-base | no disponible (misma escala, 0,98B según la card) | 4.096 | no disponible | Run crudo sin filtrado, misma receta; referencia directa de comparación |
| SmolLM2 (familia, tokenizador compartido) | no disponible | no disponible | no disponible | Solo se comparte el vocabulario (49.152 tokens); no se aportan datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card lo declara explícitamente como no apto para uso como asistente de propósito general.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación: no se reportan evaluaciones de factualidad ni de tasa de alucinación; en un modelo de 0,98B entrenado sobre 39,38B tokens, este riesgo es alto.
- Sesgos: el corpus de preentrenamiento son documentos DCLM-edu y el filtrado de seguridad solo marca el 4,6% de documentos con puntuación alta; no se documentan análisis de sesgo ni mitigaciones más allá de la muestra de seguridad en el SFT.
- Formato de chat estricto: ChatML sin turno de sistema; introducir un turno de sistema puede degradar el comportamiento al no haberse entrenado con él.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, su uso en producción conlleva un riesgo elevado.
- Sin datos de benchmarks ni de rendimiento en producción (latencia, throughput), lo que dificulta estimar su comportamiento en despliegues reales.
- Escasa tracción en Hugging Face (0 descargas, 0 likes en el momento de la consulta), sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-filt-sft
- Modelo de referencia raw: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
