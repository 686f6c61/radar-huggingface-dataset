# enver/rootformer-v17.8-muhaqqiq-mukammal

## Resumen

Rootformer-27B Stage 17.8 (Al-Muḥaqqiq al-Mukammal) es un modelo de traducción especializado de árabe clásico y árabe estándar moderno (MSA) a inglés, desarrollado por el usuario enver y publicado en Hugging Face. Está construido sobre el backbone Qwen/Qwen3.5-27B, un transformer denso híbrido de 64 capas que combina Gated DeltaNet (atención lineal) con atención softmax completa, y cuenta con 26.895.998.464 parámetros en formato safetensors.

El modelo aborda un problema concreto: los tokenizadores BPE estándar, diseñados para lenguas concatenativas, fragmentan la morfología semítica de raíz y patrón (jadhr + wazn), pierden las marcas de vocalización ortográfica y confunden sentidos léxicos históricos con modernos. Además, sufren dos patologías graves en la decodificación de textos largos: bucles degenerativos de repetición y truncamiento prematuro del token de fin de secuencia. Rootformer corrige esto mediante una capa 0 libre de BPE de inspiración sibawayhiana, inyección morfológica adaptativa y un ajuste por preferencias SimPO orientado a la completitud.

Es relevante ahora porque ofrece una solución de traducción de patrimonio intelectual árabe (al-Turāth) con rendimiento de producción declarado de hasta 1.521 tok/s sostenidos y 1.730 tok/s en pico sobre una única H100 de 80 GB con vLLM en FP8, manteniendo la fidelidad al árabe estándar moderno. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration: transformer denso híbrido con Gated DeltaNet (atención lineal) y atención softmax completa, 64 capas, dimensión oculta 5120 |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 12.288+ tokens (según model card) |
| Tipos de cuantización | FP8 (usado en vLLM para producción); pesos base en bfloat16 |
| Idiomas soportados | árabe (clásico y estándar moderno) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (12 shards, 50,10 GB; repo total 54,1 GB), bfloat16 |

## Arquitectura y entrenamiento

El backbone es un transformer denso híbrido de Qwen3.5 con 27B parámetros, 64 capas y dimensión oculta de 5120, que intercala Gated DeltaNet (atención lineal) con atención softmax completa. Se exporta en bfloat16 con `mtp_num_hidden_layers=0` y `language_model_only=True` en tiempo de ejecución de vLLM. El ajuste fino se realizó con 128 adaptadores QLoRA de rango 48 sobre `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj`, plegados permanentemente en float32 sobre los pesos base en bfloat16 para garantizar paridad exacta entre entrenamiento y servicio.

La innovación central es la capa 0 libre de BPE (Stage17_2GSCALayer0Injector): en inferencia, sobre CPU y sin coste de VRAM GPU, cada palabra árabe se analiza morfológicamente en su raíz triliteral o quadriliteral, su patrón (wazn/taṣrīf) y un vector de rasgos gramaticales; una proyección condicionada por dominio lo mapea al espacio de embeddings de 5120 dimensiones y se inyecta vía `enable_prompt_embeds=True`. Una compuerta adaptativa de rescate BPE de tres niveles ajusta la proporción inyectada (α = 0,10 para token BPE de una pieza; α = 0,22 para palabra fragmentada; α = 0,26 para forma clásica rara). El entrenamiento siguió un currículo progresivo sin fugas (etapas 15.3 a 17.7) con condicionamiento de género sin ejemplos, y una etapa SimPO de completitud anti-EOS temprano (64 paquetes de longitud completa y 151 pares de preferencia). Finalmente, la etapa 17.8 aplica una sopa de modelos en espacio de pesos con interpolación exacta en float32 (0,65 × etapa 17.7 + 0,35 × etapa 17.6), dado que ambas etapas comparten cuenca de pérdida (coseno de 0,9987–0,9991).

## Capacidades

- Traducción de árabe clásico a inglés en seis géneros: kalām/falsafah, uṣūl/manṭiq, fiqh, ḥadīth/rijāl, tafsīr/léxico y adab/balāghah.
- Traducción de árabe estándar moderno (MSA) a inglés con fidelidad mantenida.
- Análisis morfológico semítico integrado (raíz, patrón, rasgos gramaticales) en la capa de entrada.
- Preservación de anclas parentéticas del árabe fuente (al-aṣl al-ʿarabī) de forma literal.
- Decodificación de textos largos sin bucles de repetición degenerativos y con supresión del truncamiento prematuro (0/175 truncamientos reportados en los géneros evaluados).
- Condicionamiento por género mediante prompts de sistema limpios, sin ejemplos.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción académica de tratados de kalām y falsafah: el modelo mantiene terminología filosófica medieval y evita confundir sentidos históricos con modernos, gracias a la inyección morfológica y al condicionamiento de género.
- Digitalización de corpus de fiqh y uṣūl al-fiqh: con 12.288+ tokens de contexto y supresión del truncamiento prematuro, puede traducir capítulos completos sin cortes en pasajes concisos.
- Traducción de ḥadīth y literatura de rijāl: el análisis de raíz y patrón ayuda a preservar nombres propios y cadenas de transmisión con vocalización ambigua.
- Investigación en tafsīr y lexicografía árabe: la capa libre de BPE distingue formas raras y qiyās no vistas que un tokenizador BPE fragmentaría.
- Publicación de patrimonio literario (adab y balāghah): útil para editoriales que necesitan traducciones al inglés con anclas del original árabe entre paréntesis.
- Servicio de traducción de alto rendimiento: despliegue en vLLM con FP8 sobre una H100 80GB permite hasta 1.521 tok/s sostenidos, adecuado para procesar lotes de manuscritos a escala.
- Normalización de MSA a inglés en pipelines documentales: mantiene fidelidad en árabe moderno, útil para traducción de prensa, informes o documentación técnica.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| chrF++ en árabe clásico de 6 géneros no vistos (capa 0 activa) | 62,925 | Frente a 62,180 con BPE simple (+0,745) |
| Truncamientos prematuros (etapa 17.6) | 19/200 | Línea base antes de SimPO anti-EOS |
| Truncamientos prematuros (etapa 17.7) | 1/200 | Reducción del 94,7 % |
| Truncamientos en capítulos fiqh, tafsīr, ḥadīth, kalām, uṣūl | 0/175 | Tras SimPO de completitud |
| Precisión de preferencia SimPO | 100,0 % | 151 pares anti-EOS temprano |
| Throughput en H100 80GB con vLLM FP8 | 1.521 tok/s sostenidos; 1.730 tok/s pico | Model card |
| Error SVD relativo del adaptador QLoRA rango 48 | 0,0010 | Proyección thin-QR |
| Coseno entre deltas de peso de etapas 17.6 y 17.7 | 0,9987–0,9991 | Justifica la sopa de pesos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 50,10 GB; en FP8 se reduce a unos 27 GB, aunque la model card no detalla la huella exacta en FP8.
- GPU recomendadas: H100 80GB para el rendimiento declarado (1.521 tok/s sostenidos); A100 80GB como alternativa viable; GPUs de 24 GB no son suficientes para los pesos completos en bfloat16.
- ¿Cabe en GPU de consumo? No en su formato bfloat16 completo; requeriría cuantización adicional no documentada en la información disponible.
- Opciones de despliegue: vLLM (soporte nativo, `enable_prompt_embeds=True` para la capa 0); el bundle `rootformer_runtime/` acompaña al modelo para la inyección morfológica en CPU.
- Latencia y throughput: 1.521 tok/s sostenidos y 1.730 tok/s en pico sobre una H100 80GB con vLLM FP8; la capa 0 añade 0,00 GB de VRAM GPU al ejecutarse en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rootformer-27B Stage 17.8 | 26,9B denso | 12.288+ | Traducción árabe clásico/MSA → inglés | Apache 2.0 | Hugging Face (vLLM) |
| Qwen/Qwen3.5-27B (base) | ~27B denso | no disponible | Modelo generalista multilingüe | no disponible en la información | Hugging Face |
| Alternativas de traducción árabe-inglés | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de traducción en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en la dirección árabe → inglés; no se documenta traducción inversa ni otros pares de idiomas.
- Solo soporta árabe e inglés; no hay capacidades multilingües adicionales declaradas.
- Riesgo de alucinación inherente a los modelos generativos; la model card no cuantifica tasas de fidelidad factual más allá de chrF++.
- Aunque se reportan 0/175 truncamientos en los géneros evaluados, persiste 1/200 en la etapa 17.7 previa; el comportamiento en dominios fuera de los seis géneros entrenados no está documentado.
- La capa 0 libre de BPE requiere el bundle `rootformer_runtime/` y análisis morfológico en CPU; sin él, el rendimiento cae (62,180 frente a 62,925 chrF++).
- El rendimiento de 1.521 tok/s está medido en una H100 80GB con FP8; en hardware inferior no se garantiza.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-27B puede tener condiciones adicionales que deben verificarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validación independiente de la comunidad.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/enver/rootformer-v17.8-muhaqqiq-mukammal
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
