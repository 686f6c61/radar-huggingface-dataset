# Raghav-Singhal/1pp-0.58b-v2-filt-seed42-sft

## Resumen

1pp-0.58b-v2-filt-seed42-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el contexto del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de la variante "filtrada" (filt) del escalón de 0,58B de la escala de scaling 1PP, con semilla 42, sometida posteriormente a un ajuste supervisado (SFT). El modelo forma parte de un artefacto de investigación comparativa: reproduce dos condiciones del paper SPP sobre el corpus crudo de 1PP (documentos DCLM-edu originales), leyendo exactamente los mismos documentos en el mismo orden y con el mismo número de pasos que el modelo "raw" de referencia.

La diferencia clave respecto al modelo raw es el filtrado: un clasificador de seguridad basado en gte puntuó cada fragmento y marcó 3.869.498 documentos (4,6%) cuyo fragmento de mayor puntuación alcanza al menos 3. Esos documentos permanecen en las secuencias de entrenamiento (en contexto) pero no contribuyen a la pérdida; el resto se entrena igual que en la ejecución raw. El empaquetado de datos es idéntico byte a byte al de la ejecución raw.

Arquitectura Llama-style de 24 capas, contexto de 4.096 tokens, licencia Apache 2.0 y solo inglés. Es relevante ahora como pieza reproducible para estudiar el efecto del filtrado de datos de seguridad sobre el entrenamiento y el SFT, no como asistente de propósito general: el propio autor lo etiqueta explícitamente como artefacto de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 580.445.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento consistió en 11.106 pasos sobre el flujo alineado por pasos de la ejecución raw (23.290 millones de posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16. La innovación metodológica es el filtrado por clasificador de seguridad (gte, puntuado por fragmento): los documentos marcados se mantienen en contexto pero se excluyen de la pérdida, mientras que el empaquetado de datos es idéntico al de la ejecución raw. La pérdida de validación del modelo base (por token, 2.433 documentos retenidos y las conversaciones reescritas a partir de ellos, checkpoint final) es de 2,624 para texto de documento, 2,800 para texto de asistente y 2,811 para texto de usuario.

El SFT se realizó durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con pista de constitución citada), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en retenido (tokens de asistente, 1.998 conversaciones) es 2,198.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta multiturno básica, derivada del SFT sobre mezclas multiturno.
- Alineación parcial de seguridad: parte del SFT usa `sp-sft-safety-180k`, y el preentrenamiento aplica filtrado de seguridad por documento.
- Capacidad de detención controlada: la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Estudio del efecto del filtrado de datos: comparar este modelo con el raw (`1pp-0.58b-v2-raw-seed42-base`) bajo idéntico empaquetado y pasos permite aislar el impacto del filtrado de seguridad sobre la pérdida de validación y el comportamiento conversacional.
- Reproducibilidad de experimentos de scaling: el checkpoint y los logs de wandb permiten replicar la receta de SFT (semilla 28, batch 128 × 4.096, LR 0,002) y verificar la pérdida de retenido de 2,198.
- Investigación sobre alineación y seguridad en modelos pequeños: analizar cómo el filtrado previo al SFT y la mezcla `sp-sft-safety-180k` afectan a las respuestas del modelo de 0,58B.
- Evaluación de recetas de SFT en modelos por debajo de 1B: servir como línea base para comparar mezclas de datos conversacionales (model-raising, normal y safety) en un presupuesto de cómputo reducido.
- Docencia y experimentación en entornos con recursos limitados: con 580M parámetros y pesos safetensors de 1,2 GB, es viable para prácticas de fine-tuning e inferencia en una sola GPU consumer.
- Generación de texto en inglés para prototipos internos de investigación: útil para validar pipelines de transformers y text-generation-inference antes de escalar a modelos mayores de la misma escala.
- Análisis de formato ChatML sin turno de sistema: caso de estudio para pipelines que necesitan plantillas de chat no convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos reportados son pérdidas de validación y de SFT:

| Conjunto | Métrica | Valor |
|---|---|---|
| Base, texto de documento | Pérdida por token (2.433 docs retenidos) | 2,624 |
| Base, texto de asistente | Pérdida por token | 2,800 |
| Base, texto de usuario | Pérdida por token | 2,811 |
| SFT, tokens de asistente | Pérdida (1.998 conversaciones retenidas) | 2,198 |
| Verificación HF vs Megatron | Pérdida sft_val segmentos [3, 4] | 2,1982 (diferencia absoluta 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 580M parámetros, en bf16 los pesos ocupan aproximadamente 1,16 GB, y en fp32 unos 2,32 GB, a lo que hay que sumar la caché KV para 4.096 tokens de contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM libre debería poder ejecutar el modelo en bf16, aunque no se ha verificado en la información disponible.
- ¿Cabe en GPU consumer? Por tamaño de parámetros sí es plausible en GPUs consumer modernas (por ejemplo, RTX 3060/4060 en adelante), pero no hay datos oficiales de compatibilidad ni de latencia.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI más allá de los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-filt-seed42-sft | 580.445.568 | 4.096 | apache-2.0 | Hugging Face | Variante filtrada con SFT; pérdida SFT 2,198 |
| 1pp-0.58b-v2-raw-seed42-base | no disponible en la información | 4.096 (misma receta) | no disponible | Hugging Face | Ejecución raw de referencia, sin filtrado; comparación directa |
| SmolLM2 (familia, vocabulario usado) | no disponible | no disponible | no disponible | no disponible | Solo se referencia su tokenizador (49.152 tokens), no el modelo |
| Otros modelos de la escala 1PP | no disponible | no disponible | no disponible | Colección 1pp en Hugging Face | El autor agrupa los modelos en la colección 1pp |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe usarse como producto final sin evaluación adicional.
- Solo inglés: el modelo declara únicamente el idioma `en`.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo; el corpus DCLM-edu y las mezclas de SFT pueden introducir sesgos no caracterizados.
- Filtrado de seguridad parcial: el clasificador gte marcó el 4,6% de documentos y el SFT incluye solo 30k muestras de seguridad, por lo que la alineación de seguridad es limitada y no garantizada.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Formato de chat no estándar: ChatML sin turno de sistema; los pipelines que esperan un turno `system` pueden comportarse de forma inesperada.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación la idoneidad para producción no está avalada por el autor.
- Sin datos de cuantización ni de despliegue en motores de inferencia de alto rendimiento (vLLM, llama.cpp), lo que limita las garantías de rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-filt-seed42-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
