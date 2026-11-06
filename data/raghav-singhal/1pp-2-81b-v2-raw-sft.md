# Raghav-Singhal/1pp-2.81b-v2-raw-sft

## Resumen

1pp-2.81b-v2-raw-sft es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como peldaño superior de una escalera de escalado (ladder v2) que compara cuatro tamaños (0.58B, 0.98B, 1.66B y 2.81B) bajo tres condiciones de preentrenamiento y tres semillas distintas, con el objetivo de estudiar el efecto de la condición de datos sobre el comportamiento del modelo.

La arquitectura es un decoder estilo Llama de 24 capas, hidden size 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. Esta variante concreta corresponde a la condición "raw" (documentos originales), semilla 28, tras un ajuste supervisado (SFT).

El modelo resulta relevante en el contexto de la investigación sobre currículos de preentrenamiento y alineación: permite aislar el efecto de la composición del corpus y de la máscara de pérdida manteniendo constante el flujo de datos por paso. Su utilidad práctica fuera de ese marco experimental es limitada, y así lo declara explícitamente el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 2.807.699.328 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 5,6 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (21 cabezas de consulta y 7 de clave/valor), normalización RMSNorm, activación SwiGLU en la FFN y RoPE con base 10.000. No emplea QK-norm ni biases, y los embeddings de entrada y la capa de salida no están atados. El tokenizador parte del vocabulario de SmolLM2 (49.152 entradas) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se cubrieron los primeros 53.709 pasos del flujo alineado por pasos de 1PP (112,64B posiciones de token), con batch global de 512 × 4.096 tokens, enmascaramiento de atención entre documentos, precisión bf16 e inicialización con desviación estándar 0,0078. El optimizador combina Muon (escalado por forma, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100; weight decay 0,1. La pérdida de validación por token sobre 2.433 documentos retenidos fue de 2,886 en texto de asistente, 3,518 en texto de usuario y 2,308 en texto de documento.

El ajuste supervisado consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida de validación SFT sobre tokens de asistente en 1.998 conversaciones retenidas fue de 1,831, y los pesos de Hugging Face se verificaron contra el checkpoint de Megatron reproduciendo esa misma pérdida (diferencia absoluta 0,0000).

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta a instrucciones derivados del ajuste supervisado sobre mezclas multiturno y de seguridad.
- Conversación multiturno: el conjunto de SFT incluye 98,5k conversaciones multiturno con citas de constitución.
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- No se ha entrenado con turno de sistema: introducir uno queda fuera de la distribución de entrenamiento.

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: el modelo sirve como peldaño de 2,81B en la escalera 1PP para comparar, manteniendo el flujo de datos por paso, el efecto de la condición "raw" frente a otras condiciones y de la semilla 28 frente a 42 y 1234 sobre las curvas de pérdida.
- Estudios de ablación de currículo y máscara de pérdida: al compartir vocabulario, tokenizador y orden de batches con el resto de peldaños, permite aislar variables sin confundir efectos de tokenización.
- Reproducción de resultados de alineación a pequeña escala: con 400k conversaciones de SFT y pérdida solo en turnos de asistente, es adecuado para replicar experimentos de SFT y medir su impacto en validación.
- Generación de texto en inglés para evaluación comparativa: útil como baseline de 2,81B en pruebas de perplejidad y generación sobre textos educativos, dado su entrenamiento en DCLM-edu.
- Fine-tuning posterior controlado: su licencia Apache 2.0 y su tamaño permiten reentrenarlo en un único nodo de GPUs para estudiar variantes de SFT sin partir de un modelo propietario.
- Docencia y divulgación sobre escalado: sirve para ilustrar empíricamente la relación entre tokens por parámetro (20,3 en este caso) y pérdida de validación en un rango de tamaños acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida por token |
|---|---|
| Texto de asistente (validación de preentrenamiento) | 2,886 |
| Texto de usuario (validación de preentrenamiento) | 3,518 |
| Texto de documento (validación de preentrenamiento) | 2,308 |
| Tokens de entrenamiento de esta condición (`raw_doc_eod(8+5)`) | 2,309 |
| SFT retenido (tokens de asistente, 1.998 conversaciones) | 1,831 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 7 y 8 GB para contexto corto. En cuantización de 8 bits, en torno a 3 GB de pesos; en 4 bits, en torno a 1,5-2 GB (no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de referencia y evaluación por lotes; L40S o A10G para servicio con margen; RTX 4090 (24 GB) para inferencia en bf16 con contexto completo.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits, aunque sin cuantizaciones oficiales publicadas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de 2,8B en una RTX 4090 suele operar en el orden de decenas de tokens por segundo en bf16, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-sft | 2,81B | 4.096 | Apache 2.0 | en | Artefacto de investigación; sin benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8.192 (según versión) | Apache 2.0 | en (multilingüe parcial) | Comparte familia de tokenizador; orientado a uso general |
| Qwen2.5-3B | 3,1B | 32.768 | Apache 2.0 | multilingüe | Uso general, con benchmarks publicados |
| Llama 3.2-3B | 3,2B | 131.072 | Llama 3.2 Community License | multilingüe | Uso general, con benchmarks publicados |

La comparación con alternativas de uso general no es directa: 1pp-2.81b-v2-raw-sft está diseñado como control experimental dentro de una escalera de ablación, no como asistente. Los datos de los modelos alternativos provienen de sus respectivas model cards; para este modelo no hay benchmarks públicos que permitan una comparación de rendimiento tarea a tarea.

## Limitaciones y advertencias

- El propio autor lo declara "not a general-purpose assistant": no debe desplegarse como asistente de producción sin una evaluación adicional.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez; el corpus DCLM-edu y las mezclas de SFT pueden introducir sesgos no caracterizados.
- Riesgo de alucinación no cuantificado; no hay benchmarks de veracidad disponibles.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés: no hay soporte multilingüe documentado.
- No se entrenó con turno de sistema; el uso de un `system prompt` puede degradar la calidad de forma impredecible.
- El formato de chat es ChatML sin turno de sistema y la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0); una configuración incorrecta de los tokens de parada puede producir salidas truncadas o desbordadas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación la idoneidad para producción no está validada.
- Sin cuantizaciones oficiales ni pesos GGUF publicados; cualquier conversión corre por cuenta del usuario.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
