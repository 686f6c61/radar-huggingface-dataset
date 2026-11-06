# Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-sft

## Resumen

1pp-0.58b-v2-ua-rawanneal-sft es un modelo de lenguaje de 580.445.568 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como peldaño de una escalera de escalado (ladder v2) que compara condiciones de preentrenamiento bajo un flujo de datos alineado por pasos.

El modelo parte de un decoder estilo Llama de 24 capas con hidden size 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. Usa el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. La variante "rawanneal" aplica el cooldown final (los últimos 1.110 de 11.106 pasos) sobre conversaciones 1PP reescritas a partir de los documentos originales, en lugar de sobre documentos, y después recibe un ajuste supervisado (SFT) sobre 400.000 conversaciones.

Su relevancia es metodológica: forma parte de una matriz de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones por tres semillas (28, 42, 1234), donde cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos. Las condiciones solo difieren en el texto de los documentos y la máscara de pérdida; las semillas solo difieren en la inicialización. La licencia Apache 2.0 y el formato transformers/safetensors facilitan su reproducción y análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 1,2 GB |
| Tokenizer | SmolLM2 (49.152 tokens) más `<|pad|>`; `<|endoftext|>` como fin de documento |
| Formato de chat | ChatML sin turno de sistema |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso con atención multi-cabeza agrupada (9 cabezas de consulta y 3 de clave/valor), normalización RMSNorm y activación SwiGLU en la FFN. El tokenizer deriva del vocabulario de SmolLM2 ampliado con un token de padding, y el entrenamiento emplea enmascaramiento de atención entre documentos (cross-document attention masking). El preentrenamiento usó el optimizador Muon (shape scaling, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 699 pasos, fase constante y decaimiento lineal hasta 1/100 en los últimos 1.110 pasos, weight decay 0,1, init std 0,0119 y precisión bf16. El batch global fue de 512 × 4.096 tokens.

Los primeros 9.996 pasos se entrenaron sobre documentos DCLM-edu originales; los últimos 1.110 pasos (el cooldown) sobre conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y asistente. En total, los 11.106 pasos cubren 23,29B posiciones de token, y son los primeros pasos del flujo alineado por pasos del estudio principal (31.777 pasos). El SFT consistió en una época sobre una mezcla de 400.000 conversaciones: 98.500 multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271.600 de `dlab-spp/sp-sft-normal-300k` (sin duplicados del primer conjunto) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se usó la misma pila (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens.
- Respuesta condicionada por persona: el preentrenamiento 1PP reescribe documentos como conversaciones usuario/asistente, lo que orienta el modelo a mantener un rol de asistente coherente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso más allá de la conversación multiturno.
- Capacidades multilingües limitadas al inglés declarado en la model card.
- No dispone de modo thinking, visión ni audio.
- Alineación de seguridad parcial vía SFT, con una muestra de 30.000 conversaciones del conjunto `sp-sft-safety-180k`.

## Casos de uso

- Investigación sobre preentrenamiento orientado a persona: el modelo sirve como punto de comparación controlado (misma semilla, mismo flujo de datos) frente a las variantes de la escalera 1PP para medir el efecto de reescribir documentos como conversaciones.
- Estudios de escalado a pequeña escala: con 0,58B parámetros y 20,3 tokens por parámetro, permite reproducir curvas de pérdida en hardware modesto y validar hipótesis antes de escalar a los peldaños de 1,66B y 2,81B.
- Análisis de cooldown y annealing: la variante rawanneal aísla el efecto de sustituir documentos por conversaciones en la fase final del entrenamiento, útil para estudiar dinámicas de LR decay y composición de datos.
- Evaluación de pérdida en dominios separados: la model card reporta pérdidas de validación por tipo de texto (asistente 1,808; usuario 1,674; documento 3,141), lo que permite usar el modelo como sonda de calidad de datos.
- Generación de respuestas conversacionales breves en inglés para prototipos de chatbots internos, siempre que se acepte su naturaleza de artefacto de investigación y se valide la calidad caso por caso.
- Fine-tuning posterior como base pequeña: sus 580M parámetros y licencia Apache 2.0 permiten ajustarlo en una sola GPU consumer para tareas concretas de generación de texto en inglés.
- Docencia y experimentación con tokenizers y arquitecturas Llama: el modelo ilustra el uso de vocabulario SmolLM2, embeddings no atados y atención GQA en un tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta pérdidas de validación internas:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,808 |
| Texto de usuario | 1,674 |
| Texto de documento | 3,141 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,785 |
| SFT en conversaciones retenidas (1.998 conversaciones, tokens de asistente) | 2,127 |

Verificación de pesos: la pérdida HF recalculada sobre `sft_val` segmentos [3, 4] es 2,1268 frente a la referencia Megatron 2,1267 (diferencia absoluta 0,0000).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6-0,8 GB de pesos; en 4 bits, en torno a 0,3-0,4 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (RTX 3050, RTX 4060, T4); A100 y H100 no son necesarias para inferencia, solo para entrenamiento o evaluación a gran escala.
- Cabe en GPU consumer: sí, en todas las RTX de 8 GB o más, e incluso en iGPU con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-rawanneal-sft | 580M | 4.096 | Apache 2.0 | Hugging Face | Artefacto de investigación, solo inglés |
| SmolLM2-360M | 360M | 8.192 (según model card pública) | Apache 2.0 | Hugging Face | Base generalista de HuggingFaceTB, tokenizer compartido |
| Qwen2.5-0.5B | 494M | 32.768 (según model card pública) | Apache 2.0 | Hugging Face | Multilingüe, orientado a uso general |
| 1pp-0.98b-v2-ua-rawanneal-sft | 980M | 4.096 | Apache 2.0 | Hugging Face | Peldaño superior de la misma escalera |

La comparación de rendimiento con benchmarks no está disponible; los datos de contexto y licencia de los modelos alternativos provienen de sus model cards públicas y deben verificarse en la fuente.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que no es un asistente de propósito general; no debe desplegarse en producción sin evaluación adicional.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto corto: 4.096 tokens limitan conversaciones largas y documentos extensos.
- Sin turno de sistema: el modelo nunca vio un mensaje de sistema durante el entrenamiento, por lo que inyectar uno puede degradar el comportamiento.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni tasas de alucinación; un modelo de 580M entrenado con 23,29B posiciones de token tiene capacidad factual limitada.
- Sesgos: no se documentan análisis de sesgo; los datos DCLM-edu y las conversaciones sintéticas pueden introducir sesgos no medidos.
- Seguridad: el SFT incluye solo una muestra de 30.000 conversaciones de seguridad, insuficiente para garantizar un comportamiento robusto frente a usos adversarios.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación conviene revisar los términos de los conjuntos de datos de SFT utilizados.
- Verificación limitada: la comprobación de pesos se reduce a un único conjunto de validación con diferencia de 0,0000, sin pruebas de generación publicadas.
- Sin cuantizaciones oficiales ni pesos GGUF: el despliegue en llama.cpp u Ollama requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-sft
- Variante raw base: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-sft
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
