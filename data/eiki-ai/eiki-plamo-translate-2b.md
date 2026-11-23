# Eiki-AI/eiki-plamo-translate-2b

## Resumen

Eiki PLaMo Translate 2B es un ajuste fino (fine-tune) del modelo de traducción `pfnet/plamo-3-translate-2b` de Preferred Networks, desarrollado por Eiki-AI. El modelo parte de una base especializada en traducción automática y la amplía mediante LoRA fusionado en BF16 para añadir cinco idiomas que no estaban cubiertos de forma nativa: afrikáans (`af`), noruego bokmål (`no`), portugués (`pt`), sueco (`sv`) y turco (`tr`). Mantiene intactos los 53 idiomas oficiales del modelo base y las funciones propias de la familia PLaMo 3 (glosario, contexto, historial multiturno y pares directos entre idiomas distintos del inglés).

Con 2.878.595.584 parámetros (aproximadamente 2,9 mil millones), el modelo se posiciona como una alternativa compacta para traducción neuronal de alta calidad en entornos con recursos limitados. El repositorio ocupa 5,8 GB en pesos BF16 en formato safetensors, con código personalizado (`custom_code`) que requiere `trust_remote_code=True`.

La relevancia actual del modelo reside en su enfoque de preservación: el autor documenta explícitamente que el ajuste no degrada el rendimiento del base en los 52 idiomas originales (104 direcciones evaluadas sobre FLORES-200), con una variación media de chrF++ de -0,47 en `en -> xx` y -0,27 en `xx -> en`, y ninguna dirección con caída superior a 3,0 puntos. Es un fine-tune comunitario no oficial, distribuido bajo la PLaMo Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3), con código personalizado (`custom_code`) |
| Parametros totales | 2.878.595.584 (~2,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `MAX_LEN=384` en la fase de cooldown, pero no se especifica la ventana máxima de inferencia) |
| Tipos de cuantizacion | BF16, FP8, NVFP4, GGUF Q4_K_M, Q4_0, Q3_K_M, Q2_K (evaluados en la model card) |
| Idiomas soportados | en, ja, af, no, pt, sv, tr (más los 53 idiomas oficiales del base) |
| Licencia | PLaMo Community License (`plamo-community-license`) |
| Formato de pesos | safetensors (BF16); cuantizaciones GGUF evaluadas |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, especializado en traducción mediante un chat template con parámetros `source_lang` y `target_lang`. El ajuste se realizó en dos fases. La primera (V6 Expansion) aplicó LoRA con `r=128`, `lora_alpha=256` y `all-linear` durante 2 épocas sobre 1.661.348 filas: 132.000 pares bidireccionales limpios por cada idioma objetivo, extraídos de Tatoeba, Talks, WikiMatrix, OPUS-100 y NLLB-HQ, más 340.000 filas de replay de los 53 idiomas base y de las funciones PFML3. La segunda fase (V6.1 Anti-Drift Cooldown) consistió en 1 época adicional con `lr=2.5e-5` y `MAX_LEN=384` sobre 534.966 filas, de las cuales el 59,2% era replay simétrico destilado del base en los 53 idiomas (incluyendo serbio en cirílico y latino) y el 40,8% datos limpios de los cinco idiomas nuevos.

La innovación técnica principal es la estrategia de anti-drift: el cooldown con replay mayoritario busca preservar el comportamiento del modelo base mientras se añaden capacidades nuevas. El autor reporta que, sobre FLORES-200 en 104 direcciones (50 frases por idioma), la variación media de chrF++ es de -0,47 en `en -> xx`, -0,27 en `xx -> en`, +0,43 en `sr -> en` y -0,08 en OPUS-14, sin ninguna dirección con caída superior a 3,0 puntos. No se documenta el uso de RLHF o DPO; el entrenamiento es supervisado sobre pares paralelos.

## Capacidades

- Traducción automática multilingüe entre inglés, japonés, afrikáans, noruego bokmål, portugués, sueco y turco, además de los 53 idiomas del modelo base.
- Pares directos entre idiomas distintos del inglés (por ejemplo, `af -> sv`), sin necesidad de pivotar por inglés.
- Detección automática del idioma de origen.
- Soporte de glosario (`glossary`) para forzar terminología concreta durante la traducción.
- Soporte de contexto (`context`) para guiar el registro o el dominio de la traducción.
- Historial multiturno (`history`) para mantener coherencia en conversaciones o documentos largos.
- Control de estilo en japonés: modos `plain` y `polite`.
- Traducción bidireccional en las cinco incorporaciones nuevas (`en <-> af`, `en <-> no`, `en <-> pt`, `en <-> sv`, `en <-> tr`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido; el modelo está especializado en traducción.

## Casos de uso

- Localización de productos para mercados nórdicos y lusófonos: el modelo cubre noruego bokmål, sueco y portugués con chrF++ de 64,15, 85,16 y 80,65 respectivamente en `en -> xx`, lo que permite traducir interfaces, documentación y material de marketing sin depender de un modelo mayor.
- Traducción de documentación técnica con glosario: gracias al parámetro `glossary`, se puede fijar terminología específica de dominio (por ejemplo, nombres de API o términos legales) y mantener consistencia entre secciones.
- Atención al cliente multilingüe: el soporte de `history` permite traducir conversaciones multiturno manteniendo el contexto, útil para chats de soporte en turco, sueco o portugués.
- Subtitulado y traducción de contenido audiovisual: la ventana de contexto y el control de estilo japonés `plain`/`polite` facilitan adaptar el registro del diálogo al público objetivo.
- Traducción jurídica o administrativa asistida: el parámetro `context` permite indicar el dominio y el registro, y el modelo preserva el rendimiento del base en idiomas como alemán, neerlandés o ruso (chrF++ de 46,64, 48,84 y 45,45 en `en -> xx` sobre OPUS-100).
- Procesamiento por lotes en pipelines de datos: con cuantización Q4_K_M o FP8 el modelo mantiene chrF++ prácticamente idéntico al BF16 (por ejemplo, 85,93 frente a 85,16 en `en -> sv`), lo que abarata el despliegue a gran escala.
- Traducción de serbio en cirílico y latino: el cooldown incluyó explícitamente ambas variantes, con chrF++ de 53,65 en `sr -> en` (cirílico) en BF16.

## Benchmarks y rendimiento

Resultados de chrF++ (`word_order=2`, `temp=0`, `repetition_penalty=1.05`) reportados en la model card:

| Direccion | BF16 | FP8 | NVFP4 | Q4_K_M | Q4_0 | Q3_K_M | Q2_K |
|---|---:|---:|---:|---:|---:|---:|---:|
| en -> af (100 V6 test) | 68,40 | 68,98 | 67,63 | 68,54 | 67,12 | 68,36 | 60,36 |
| af -> en (100 V6 test) | 69,75 | 70,04 | 68,28 | 70,42 | 68,23 | 69,63 | 65,73 |
| en -> no (100 V6 test) | 64,15 | 63,98 | 63,49 | 63,33 | 64,23 | 63,49 | 57,94 |
| no -> en (100 V6 test) | 68,19 | 68,36 | 67,11 | 66,29 | 67,52 | 68,55 | 64,44 |
| en -> pt (100 V6 test) | 80,65 | 80,39 | 79,97 | 79,77 | 80,23 | 79,20 | 75,89 |
| pt -> en (100 V6 test) | 84,10 | 85,04 | 83,12 | 85,99 | 85,62 | 83,70 | 78,60 |
| en -> sv (100 V6 test) | 85,16 | 85,50 | 85,22 | 85,93 | 85,45 | 84,79 | 79,55 |
| sv -> en (100 V6 test) | 84,37 | 83,83 | 81,88 | 84,49 | 83,93 | 85,05 | 76,80 |
| en -> tr (100 V6 test) | 76,14 | 77,05 | 76,47 | 76,77 | 76,65 | 76,69 | 72,14 |
| tr -> en (100 V6 test) | 81,26 | 81,15 | 80,40 | 80,29 | 79,68 | 80,74 | 75,24 |
| en -> ja (50 OPUS-100) | 16,62 | 16,75 | 16,27 | 16,53 | 16,37 | 16,93 | 16,42 |
| en -> nl (50 OPUS-100) | 48,84 | 48,80 | 48,69 | 49,16 | 48,00 | 48,44 | 47,19 |
| en -> de (50 OPUS-100) | 46,64 | 46,47 | 46,25 | 47,43 | 46,76 | 46,31 | 46,32 |
| en -> ru (50 OPUS-100) | 45,45 | 44,24 | 45,38 | 44,82 | 45,12 | 45,40 | 42,22 |
| sr -> en (50 FLORES cirilico) | 53,65 | 53,99 | 51,94 | 52,96 | 52,13 | 52,87 | 46,44 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo está especializado en traducción y solo se reportan métricas chrF++.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 5,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 8-10 GB para inferencia cómoda.
- VRAM estimada en FP8: alrededor de 3 GB para pesos, con margen adicional para activaciones.
- VRAM estimada en Q4_K_M / Q4_0: aproximadamente 1,7-2 GB para pesos, lo que permite ejecución en GPUs de consumo con 4-6 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción en BF16 con vLLM; RTX 4090, RTX 3090 o RTX 4080 para BF16/FP8 en estaciones de trabajo; RTX 3060 12 GB o GPUs integradas con llama.cpp para cuantizaciones Q4.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q3 con llama.cpp u Ollama; en BF16 requiere al menos una GPU de 8 GB.
- Opciones de despliegue: vLLM (documentado en la model card con `trust_remote_code=True`), transformers, llama.cpp y Ollama para GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo indica `max_tokens=180` como valor de referencia en el ejemplo de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Eiki PLaMo Translate 2B | ~2,9 B | No disponible | 53 + 5 nuevos | PLaMo Community License | safetensors, GGUF |
| pfnet/plamo-3-translate-2b (base) | ~2,9 B | No disponible | 53 | PLaMo Community License | safetensors |
| NLLB-200 (200 idiomas) | 600 M / 1,3 B / 3,3 B / 54 B | 512 tokens (típico) | 200 | CC-BY-NC 4.0 | safetensors |
| M2M-100 (418M / 1,2B / 10B) | 418 M - 10 B | 1024 tokens (típico) | 100 | MIT | safetensors |

La comparación con NLLB-200 y M2M-100 es orientativa: son modelos de traducción con coberturas de idiomas distintas y no se dispone de evaluaciones cruzadas en la información proporcionada. El punto diferencial de este fine-tune es la incorporación de cinco idiomas manteniendo el rendimiento del base, con cuantizaciones GGUF validadas y una licencia comunitaria con umbrales de facturación para uso comercial.

## Limitaciones y advertencias

- Es un fine-tune comunitario no oficial, no afiliado ni respaldado por Preferred Networks.
- La licencia PLaMo Community License impone registro previo y umbrales de facturación anual para despliegue comercial; es necesario revisar los términos antes de usar en producción.
- El rendimiento en `en -> ja` es bajo en la evaluación reportada (chrF++ de 16,62 sobre OPUS-100), lo que sugiere que la calidad en japonés puede no ser adecuada para todos los dominios.
- Las cuantizaciones Q2_K degradan notablemente la calidad en varios pares (por ejemplo, `en -> af` cae de 68,40 a 60,36 y `en -> no` de 64,15 a 57,94); se recomienda Q4_K_M o superior.
- No se documenta la longitud máxima de contexto de inferencia; el entrenamiento usó `MAX_LEN=384`, lo que puede limitar la traducción de documentos muy largos sin segmentación.
- Riesgo de alucinación y de deriva en dominios muy especializados no representados en los datos de ajuste (Tatoeba, Talks, WikiMatrix, OPUS-100, NLLB-HQ).
- Los benchmarks se limitan a chrF++ sobre conjuntos de test pequeños (50-100 frases por dirección), lo que reduce la significancia estadística de las diferencias entre cuantizaciones.
- Requiere `trust_remote_code=True` por el código personalizado de la familia PLaMo, lo que implica ejecutar código del repositorio y auditar su procedencia.
- No se han publicado evaluaciones de sesgos, toxicidad ni robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia PLaMo Community License: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b/blob/main/LICENSE
- Preferred Networks (desarrollador del base): https://www.preferred.jp/en/
