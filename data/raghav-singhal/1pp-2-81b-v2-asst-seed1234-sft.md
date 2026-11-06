# Raghav-Singhal/1pp-2.81b-v2-asst-seed1234-sft

## Resumen

1pp-2.81b-v2-asst-seed1234-sft es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la condición de preentrenamiento (texto de los documentos y máscara de pérdida) al comportamiento final del modelo, manteniendo constantes el resto de factores. Forma parte de la "ladder v2", una escalera de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzada con tres condiciones y tres semillas.

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. El modelo se entrenó desde cero y después recibió un ajuste supervisado (SFT) sobre un mix de 400.000 conversaciones.

Su relevancia es metodológica: cada rung de la escalera se entrena con el mismo flujo de datos alineado por pasos (20,3 tokens de asistente por parámetro) y solo varía la condición o la semilla, lo que permite comparaciones controladas. La condición de esta variante concreta es "conversaciones reescritas con pérdida solo en turnos de asistente" y la semilla es 1234. La licencia Apache 2.0 facilita su reutilización, aunque el autor advierte explícitamente de que no es un asistente generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 2.807.699.328 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB, librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta 2.688 y FFN de 10.752 con activación SwiGLU. Usa 21 cabezas de atención con 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre las conversaciones 1PP reescritas a partir de los documentos originales, aplicando pérdida únicamente en los turnos de asistente. Se cubrieron los primeros 53.709 pasos del flujo alineado por pasos (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador combina Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos es de 1,375 para texto de asistente, 7,456 para texto de usuario y 3,049 para texto de documento.

El SFT consistió en una época sobre un mix de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,001, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre tokens de asistente (1.998 conversaciones) es de 1,783. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación (diferencia absoluta de 0,0000 en el segmento [3, 4]).

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta multiturno dentro de una ventana de 4.096 tokens.
- Seguimiento de instrucciones adquirido mediante SFT sobre un mix que incluye un conjunto de seguridad y otro con citas de constitución.
- Parada de generación controlada por `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés: el modelo solo declara `en` y el vocabulario procede de SmolLM2.

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: el modelo sirve como rung de 2,81B en la escalera v2 para comparar, con la misma semilla y el mismo flujo de datos, el efecto de la condición "conversaciones reescritas con pérdida en turnos de asistente" frente a las otras dos condiciones.
- Estudios de escala controlados: al compartir flujo de datos alineado por pasos con los rungs de 0,58B, 0,98B y 1,66B, permite trazar curvas de pérdida frente a parámetros con 20,3 tokens de asistente por parámetro en todos los tamaños.
- Reproducibilidad de semillas: junto con las variantes seed 28 y seed 42, permite medir la varianza de inicialización manteniendo idéntico el orden de batches.
- Evaluación de SFT sobre mezclas multiturno: el checkpoint SFT y su pérdida retenida (1,783) sirven como referencia para estudiar el efecto de mixes con conjuntos de seguridad y de constituciones citadas.
- Baseline de conversación en inglés para prototipos de chat: con 2,8B parámetros y contexto de 4.096 tokens puede desplegarse en una sola GPU para pruebas de formato ChatML y de parada por `eos_token_id`.
- Verificación de pipelines de conversión Megatron a Hugging Face: el modelo documenta la comprobación de pesos contra el checkpoint original, lo que lo convierte en un caso de prueba útil para validar herramientas de conversión.
- Análisis de sesgos y seguridad en modelos pequeños: la inclusión de `sp-sft-safety-180k` en el SFT permite estudiar cómo un conjunto de seguridad de 30k muestras afecta a un modelo de 2,8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token en texto de asistente | 1,375 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token en texto de usuario | 7,456 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token en texto de documento | 3,049 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida en tokens de entrenamiento de la condición (`reweighted_seg34`) | 1,422 |
| Validación de SFT (1.998 conversaciones) | Pérdida en tokens de asistente | 1,783 |
| Verificación HF vs. Megatron (segmentos [3, 4]) | Pérdida HF / referencia Megatron / diferencia absoluta | 1,7827 / 1,7828 / 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB para contexto corto y batch 1.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5 GB. Estas cifras son estimaciones a partir del número de parámetros, ya que el repo no publica variantes cuantizadas.
- GPU recomendadas: A100 (40/80 GB) o H100 para servir con concurrencia y contexto completo de 4.096 tokens; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con batch pequeño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 para batch 1, y en tarjetas de 4-6 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que no está documentada en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-asst-seed1234-sft | 2,81B | 4.096 | Apache 2.0 | en | Artefacto de investigación 1PP, sin benchmarks publicados |
| SmolLM2 (variante ~1,7B) | ~1,7B | no disponible en esta ficha | Apache 2.0 | en | Referencia de tokenizador (vocabulario de 49.152) empleado por el modelo; no es comparable en tamaño exacto |
| Rungs 1PP de 0,58B / 0,98B / 1,66B | 0,58B / 0,98B / 1,66B | 4.096 | Apache 2.0 | en | Misma familia y mismo flujo de datos; comparación directa de escala |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con modelos de la misma categoría; la comparación con los otros rungs de la escalera 1PP es la más significativa porque comparten datos, condiciones de entrenamiento y tokenizador.

## Limitaciones y advertencias

- El autor indica explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Solo soporta inglés; no se declara ni se ha validado comportamiento en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo o conversaciones muy extensas.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El formato de chat es ChatML sin turno de sistema; introducir un turno de sistema supone una condición no vista durante el entrenamiento y puede degradar la calidad de las respuestas.
- Riesgo de alucinación inherente a un modelo de 2,8B entrenado con 112,64B posiciones de token; no se han publicado evaluaciones de factualidad.
- No se han publicado evaluaciones de sesgos ni de seguridad más allá de la inclusión de un subconjunto de seguridad en el SFT.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación fuera del dominio conversacional desaconseja su uso en producción sin evaluaciones propias.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del comportamiento del modelo.
- Los pesos se publican únicamente en safetensors; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
