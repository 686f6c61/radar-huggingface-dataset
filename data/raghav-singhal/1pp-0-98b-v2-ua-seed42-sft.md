# Raghav-Singhal/1pp-0.98b-v2-ua-seed42-sft

## Resumen

1pp-0.98b-v2-ua-seed42-sft es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar cómo distintas condiciones de preentrenamiento afectan al comportamiento del modelo a lo largo de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234).

Este checkpoint concreto corresponde al escalón de 0,98B, con la condición de preentrenamiento "rewritten conversations, user+assistant loss" y la semilla 42, tras un proceso de ajuste supervisado (SFT). La arquitectura es un decoder estilo Llama de 24 capas con contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2 (49.152 entradas más `<|pad|>`).

Su relevancia es metodológica: todos los modelos de la escalera se entrenan desde cero sobre el mismo flujo de datos alineado por pasos, con 20,3 tokens de asistente por parámetro, de modo que las diferencias entre condiciones y semillas son controladas y comparables. La licencia Apache 2.0 facilita su reutilización, pero su naturaleza experimental y su dominio limitado al inglés lo alejan de un uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parametros totales | 981.545.472 (aproximadamente 0,98B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bf16; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas, dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. Usa 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados (untied), sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre los primeros 18.779 pasos del flujo alineado por pasos del proyecto (39,38B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos en el mismo orden. Se usó batch global de 512 × 4.096 tokens, enmascaramiento de atención entre documentos y el optimizador Muon (escalado por forma, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas). Hubo warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, con weight decay 0,1, init std 0,0103 y precisión bf16. La pérdida se calcula sobre turnos de usuario y asistente. La pérdida de validación final por token sobre 2.433 documentos retenidos fue de 1,533 (texto de asistente), 1,429 (texto de usuario) y 3,328 (texto de documento).

El ajuste supervisado consistió en una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track de citas a constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se mantuvo el stack de preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), con LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un 3% de warmup. La pérdida SFT retenida sobre tokens de asistente (1.998 conversaciones) fue de 1,940, y la verificación cruzada entre los pesos HF y el checkpoint Megatron arrojó una diferencia absoluta de 0,0000 en el conjunto sft_val segments [3, 4].

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens.
- Respuesta condicionada a instrucciones tras SFT sobre mezclas de conversación, incluyendo un subconjunto de seguridad.
- Capacidad de citar constitución en el track multiturno del dataset de SFT (según la composición de datos declarada).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso con planificación.
- No se documenta modo thinking, visión ni audio.
- Multilingüismo limitado al inglés (idioma declarado: en).

## Casos de uso

- Investigación sobre escalado controlado: el modelo sirve como punto de comparación en la escalera v2 (0,58B, 0,98B, 1,66B, 2,81B) para aislar el efecto de la condición de datos y la semilla sobre la pérdida de validación y el comportamiento conversacional.
- Experimentos de ablación de condiciones de preentrenamiento: al compartir flujo de datos alineado por pasos con los demás checkpoints, permite comparar "rewritten conversations" frente a otras condiciones manteniendo constante el orden de batches.
- Estudio de reproducibilidad por semilla: la semilla 42 puede contrastarse con las semillas 28 y 1234 del mismo tamaño y condición para medir varianza de inicialización.
- Evaluación de SFT sobre modelos pequeños: con 0,98B parámetros y contexto de 4.096 tokens, es adecuado para probar recetas de SFT (LR 0,002, ChatML sin system) en entornos con recursos limitados.
- Generación de texto conversacional en inglés para prototipos internos de investigación, siempre que se acepte su naturaleza de artefacto y no de asistente de producción.
- Análisis de pérdida y calibración: la pérdida de validación publicada por tipo de texto (asistente 1,533, usuario 1,429, documento 3,328) permite usarlo como referencia para comparar otras ejecuciones del mismo pipeline.
- Reproducción de la verificación HF frente a Megatron: útil para validar pipelines de conversión de checkpoints, dado que la diferencia absoluta reportada es 0,0000.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de asistente | 1,533 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de usuario | 1,429 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de documento | 3,328 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida ponderada en tokens de entrenamiento de la condición | 1,528 (`reweighted_seg1234`) |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 1,940 |
| Verificación HF vs Megatron (sft_val segments [3, 4]) | Pérdida HF / referencia / diferencia absoluta | 1,9395 / 1,9395 / 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contexto completo de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB de pesos (estimaciones teóricas, no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en datacenter, A100 o H100 sobran para este tamaño y permiten mayor paralelismo de batch.
- Cabe holgadamente en GPU consumer; también es viable en CPU con llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp tras conversión.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-ua-seed42-sft | 0,98B | 4.096 | Apache 2.0 | en | Artefacto de investigación con condición y semilla controladas |
| 1pp-0.98b (otras semillas/condiciones de ladder v2) | 0,98B | 4.096 | Apache 2.0 | en | Mismo tamaño, distinta semilla (28, 1234) o condición; comparación directa por diseño |
| 1pp-1.7b-* (escalón 1,66B) | 1,66B | 4.096 | Apache 2.0 | en | Escalón superior del estudio principal; útil para analizar tendencias de escalado |
| SmolLM2 (referencia de tokenizador) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Solo se comparte el vocabulario (49.152 tokens); no se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo declara explícitamente como no apto para uso como asistente de propósito general.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin turno de sistema en el formato ChatML: los modelos nunca vieron un system prompt, por lo que inyectar uno puede degradar el comportamiento.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de veracidad ni de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo; la mezcla de SFT incluye un subconjunto de seguridad, pero no hay evaluación publicada de su eficacia.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines automatizados complejos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluaciones de producción desaconseja su despliegue en entornos reales sin validación adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo y sin soporte comunitario.
- Pesos solo en safetensors; no se ofrecen cuantizaciones GGUF oficiales, lo que obliga a conversión manual para despliegue en CPU o GPUs de baja VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed42-sft
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
