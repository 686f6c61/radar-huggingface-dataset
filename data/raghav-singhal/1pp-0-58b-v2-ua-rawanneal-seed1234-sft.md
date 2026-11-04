# Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed1234-sft

## Resumen

1pp-0.58b-v2-ua-rawanneal-seed1234-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas a partir de esos documentos) al comportamiento final del modelo tras el ajuste supervisado.

El modelo pertenece a la "ladder v2", una escalera de escalado que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de datos y tres semillas (28, 42 y 1234). Cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por paso. Esta variante concreta corresponde al tamaño de 0,58B, a la condición "ua" (loss sobre turnos de usuario y asistente en el cooldown) y a la semilla 1234, e incorpora una fase final de SFT.

Arquitectónicamente es un decoder estilo Llama de 24 capas, contexto de 4.096 tokens y tokenizador basado en SmolLM2, publicado bajo licencia Apache 2.0. Su relevancia es metodológica: permite aislar el efecto de la condición de datos y de la inicialización manteniendo constante el flujo de entrenamiento, algo poco habitual en modelos abiertos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16, es convertible a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con normalización RMSNorm, activación SwiGLU en la FFN y atención multi-cabeza con 9 cabezas de consulta y 3 de clave/valor. Usa RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases ni QK-norm, y una longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 11.106 pasos (23,29B posiciones de token) con batch global de 512 × 4.096 y enmascaramiento de atención entre documentos. Durante los primeros 9.996 pasos se usan los documentos originales de DCLM-edu; en los últimos 1.110 pasos (el cooldown) se sustituyen por conversaciones reescritas a partir de esos mismos documentos, con loss sobre turnos de usuario y asistente. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings, capa de salida y normas), warmup de 699 pasos, decaimiento lineal hasta 1/100 en el cooldown, weight decay 0,1, init std 0,0119 y precisión bf16. La loss de validación final por token sobre 2.433 documentos retenidos es de 1,806 en texto de asistente, 1,672 en texto de usuario y 3,164 en texto de documento.

Tras el preentrenamiento se aplica un epoch de SFT sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se emplea el mismo stack (Megatron, Muon, ChatML sin turno de sistema, loss solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La loss de SFT sobre 1.998 conversaciones retenidas es de 2,123 en tokens de asistente. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0000 en la loss de validación.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento multi-turno básico, limitado por el tamaño del modelo (0,58B) y por su naturaleza de artefacto de investigación.
- Modelado de diálogo usuario/asistente gracias al entrenamiento con loss sobre ambos turnos en la fase de cooldown.
- Seguimiento de instrucciones dentro de conversaciones cortas, adquirido en la fase de SFT.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado únicamente para inglés.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Visión, audio o modo "thinking": no disponible.
- No dispone de turno de sistema: el modelo nunca vio uno durante el entrenamiento, por lo que las instrucciones de sistema deben incorporarse dentro del turno de usuario.

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: permite comparar, manteniendo constante el flujo de datos y variando solo la condición, cómo afecta reescribir documentos como conversaciones al comportamiento final; es el uso principal para el que se publicó el modelo.
- Reproducibilidad de estudios de escalado: al formar parte de una escalera de cuatro tamaños × tres condiciones × tres semillas, sirve para replicar curvas de escalado y analizar la varianza entre inicializaciones con el mismo orden de batches.
- Experimentos de ablación de loss: la variante "ua" (loss en turnos de usuario y asistente) frente a la variante "raw" permite medir el impacto de la máscara de loss en el cooldown sobre la calidad conversacional.
- Prototipado rápido de pipelines de chat: con 0,58B parámetros y contexto de 4.096 tokens, se puede desplegar en una sola GPU consumer para validar plantillas ChatML, tokenizadores y flujos de inferencia antes de pasar a modelos mayores.
- Generación de texto a pequeña escala en inglés: resúmenes breves, reescrituras o respuestas cortas en entornos con recursos muy limitados, aceptando la calidad propia de un modelo de 0,58B.
- Docencia y formación: útil como ejemplo didáctico de un modelo Llama-style entrenado con Muon, con checkpoints verificados y logs de Weights & Biases públicos para ilustrar el ciclo completo de preentrenamiento y SFT.
- Evaluación de técnicas de alineación ligera: la mezcla de SFT incluye un track con citas a constitución y un conjunto de seguridad, lo que permite estudiar cómo un modelo pequeño absorbe señales de seguridad y de razonamiento constitucional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta losses de validación:

| Conjunto | Metrica | Valor |
|---|---|---|
| Validación de preentrenamiento (2.433 documentos) | Loss por token en texto de asistente | 1,806 |
| Validación de preentrenamiento (2.433 documentos) | Loss por token en texto de usuario | 1,672 |
| Validación de preentrenamiento (2.433 documentos) | Loss por token en texto de documento | 3,164 |
| Validación de preentrenamiento (2.433 documentos) | Loss ponderada de la condición (`reweighted_seg1234`) | 1,782 |
| SFT retenido (1.998 conversaciones) | Loss en tokens de asistente | 2,123 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica cabe holgadamente en 4-6 GB.
- En cuantización de 8 bits: en torno a 0,6 GB de pesos; en 4 bits: en torno a 0,3 GB, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es más que suficiente; para despliegue en producción a gran escala, una A100 o H100 permite agrupar muchas réplicas o batches grandes, pero no es necesaria por capacidad.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 6 GB o más de VRAM, e incluso en iGPU o CPU para inferencia lenta.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-rawanneal-seed1234-sft | 0,58B | 4.096 | Apache 2.0 | Artefacto de investigación sobre condiciones de datos | HuggingFace |
| 1pp-0.58b-v2-ua-seed1234-sft | 0,58B | 4.096 | Apache 2.0 | Misma escalera, condición "ua" completa sin variante rawanneal | HuggingFace |
| 1pp-0.58b-v2-raw-seed1234-base | 0,58B | 4.096 | Apache 2.0 | Run base sin cooldown sobre conversaciones | HuggingFace |
| SmolLM2-360M / SmolLM2-1.7B | 0,36B / 1,7B | 8.192 (SmolLM2-1.7B) | Apache 2.0 | Asistente pequeño de propósito general | HuggingFace |

La comparación con modelos de propósito general no es directa: los 1pp están pensados como artefactos controlados para estudiar el efecto de la condición de datos, no para competir en benchmarks de asistente. Frente a SmolLM2, comparten familia de tokenizador, pero los 1pp usan un vocabulario ampliado con `<|pad|>` y un contexto menor (4.096 frente a 8.192 en SmolLM2-1.7B).

## Limitaciones y advertencias

- Es un artefacto de investigación (EPFL DLAB), no un asistente de propósito general; el propio autor lo indica explícitamente.
- Tamaño de 0,58B parámetros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparación con modelos de varios miles de millones de parámetros.
- Riesgo elevado de alucinación en preguntas factuales, especialmente fuera del dominio de DCLM-edu.
- Solo inglés: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto de 4.096 tokens: insuficiente para documentos largos o conversaciones extensas.
- No admite turno de sistema: las instrucciones de sistema deben reformularse dentro del turno de usuario, lo que rompe la compatibilidad con muchos frameworks que asumen un rol `system`.
- Sesgos: al entrenarse sobre DCLM-edu y mezclas de SFT de terceros, puede heredar sesgos de esos corpus; no se documenta ninguna evaluación de sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia no implica idoneidad para producción; el modelo no ha sido evaluado para seguridad en despliegues reales.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su rendimiento de forma objetiva con alternativas.
- La verificación de pesos solo cubre la loss de validación, no evaluaciones funcionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed1234-sft
- Variante completa "ua": https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed1234-sft
- Run base sin cooldown conversacional: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (Weights & Biases): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (Weights & Biases): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
