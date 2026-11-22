# batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL

## Resumen

VAULT-v3-DeepSeek-R1-1.5B-PRIMAL es un ajuste fino del modelo DeepSeek-R1-Distill-Qwen-1.5B (1.778 millones de parámetros, `lm_head` no atado) publicado por el usuario batteryphil en Hugging Face. El modelo parte de la licencia MIT del modelo original de DeepSeek y se redistribuye bajo una licencia propia denominada `bartsch-personal-free-5pct-commercial`. Su propuesta central combina tres modificaciones: un "des-censurado" en el espacio de pesos (WSP), un entrenamiento discreto de parámetros completos denominado PRIMAL v3.1 y un mecanismo de memoria KV con desalojo de segmentos llamado VAULT v3.

La innovación más destacable es el sistema de memoria VAULT v3, que sustituye la caché KV convencional por un banco de segmentos aprendido de 1.024 posiciones más una ventana deslizante de 1.024 tokens. Según la model card, esto permite alcanzar recall del 100% en pruebas de aguja en pajar (NIAH) hasta 100.444 tokens con un consumo de VRAM plano de 4.130,7 MiB, compensando el `rope_theta = 10.000` heredado del modelo base, que colapsaba la atención más allá de 16K tokens.

El modelo está orientado a razonamiento paso a paso mediante bloques `<think>`, incluye un modo `--nothink` de baja latencia y se distribuye con un runtime C99 sin dependencias para ejecución en CPU. Es relevante ahora por su enfoque poco habitual de memoria de contexto casi constante y por su empaquetado en formato cuantizado propio (`V3_P4_0`, 1,18 GiB) ejecutable en hardware de consumo, aunque su adopción está limitada por una licencia restrictiva y por la ausencia de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) con memoria KV por segmentos VAULT v3 y `lm_head` no atado |
| Parametros totales | 1.778.277.377 (1,78 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 100.444+ tokens según NIAH con VAULT v3 (ventana deslizante de 1.024 + banco de segmentos de 1.024); el modelo base tiene `rope_theta = 10.000` |
| Tipos de cuantizacion | BF16, V3_Q8_0 (1,77 GiB), V3_P4_0 LUT armónico-primo (1,18 GiB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | `bartsch-personal-free-5pct-commercial` (licencia propia, basada en el modelo original MIT) |
| Formato de pesos | safetensors (transformers), `.vlt3` (runtime C99 propietario) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de DeepSeek-R1-Distill-Qwen-1.5B, a su vez derivada de Qwen2.5-Math-1.5B, con 1.778 millones de parámetros y `lm_head` independiente del embedding de entrada. Sobre esa base, el autor introduce el mecanismo VAULT v3: las claves pre-RoPE se almacenan en un banco fijo de 1.024 posiciones con un `SegmentScorer` de 1,18 M de parámetros FP32 entrenado mediante EMA causal, en tres capas concretas (`seg_layers = (8, 16, 24)`). Los segmentos supervivientes se re-rotan dinámicamente a posiciones relativas contiguas dentro de la distribución `[-M_cnt-S .. 2W-1]`, lo que evita el crecimiento de la caché KV con la longitud del contexto.

El entrenamiento se realizó en parámetros completos (incluido `lm_head.weight`) directamente en enteros `V3_Q8_0`, con un estado persistente de 2,06 B por parámetro (3,42 GiB) y un throughput declarado de 1.233,4 tokens de entrenamiento por segundo dentro de 5,94 GiB de VRAM pico en una GPU de consumo de 16 GB. El proceso incluye un "des-censurado" quirúrgico mediante ablación ortogonalizada multipaso en las capas L08..L27 y el `lm_head`, seguido del ajuste PRIMAL v3.1 y un bloqueo con Velvet ROME consciente de cuantización en L13..L27. No se especifican en la información disponible el volumen total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento paso a paso en modo `<think>...</think>`, orientado a matemáticas y problemas de lógica.
- Modo `--nothink` de respuesta instantánea sin cadena de razonamiento explícita.
- Razonamiento matemático: el modelo conserva capacidad de resolución de problemas tipo GSM8K (71,00% según la model card).
- Memoria de contexto largo mediante VAULT v3, con recall declarado del 100% en NIAH hasta 100.444 tokens.
- Comportamiento "des-censurado" declarado: 0 de 18 violaciones de rechazo en inglés y chino según el autor.
- Ejecución en CPU sin dependencias mediante runtime C99 (`runtime/vault3.c`), con soporte AVX2+FMA, ARM64 NEON y C99 escalar portable.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de visión o audio en la información disponible.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas paso a paso en modo `<think>`, útil para tutores automáticos o verificación de cálculos, aunque con la precisión limitada de un modelo de 1,5 B.
- Procesamiento de documentos largos en local: gracias al banco de segmentos VAULT v3 y su VRAM plana, puede emplearse para resumir o consultar documentos de decenas de miles de tokens en hardware de consumo, sin el crecimiento de caché KV habitual.
- Despliegue en entornos sin GPU: el runtime C99 y el formato `V3_P4_0` de 1,18 GiB permiten ejecutar el modelo en CPU a unos 53,9 tok/s con 1,47 GiB de RSS, adecuado para dispositivos edge o servidores sin acelerador.
- Investigación sobre memoria de contexto: el mecanismo de desalojo de segmentos y el `SegmentScorer` entrenado lo convierten en una base para experimentar con alternativas a la caché KV estándar.
- Generación de texto en inglés y chino: útil para aplicaciones bilingües de redacción o conversación donde no se requiera alta precisión factual.
- Experimentación con alineación y censura: el enfoque WSP y Velvet ROME permite estudiar los efectos de la ablación de pesos sobre el comportamiento de rechazo, siempre dentro de los límites éticos y legales aplicables.
- Prototipado rápido en transformers: al cargarse con `trust_remote_code=True`, sirve para validar pipelines de razonamiento con contexto largo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / formato | Huella | WikiText-2 PPL | GSM8K (`<think>`, n=200) | ARC-Easy | ARC-Challenge | SciQ (RC / Closed-Book) | Violaciones de censura |
|---|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (BF16) | 3,31 GiB | 99,20 | ~75,5% | 60,5% | 35,0% | 89,9% / 66,1% | 18/18 |
| VAULT-v3 (BF16 / V3_Q8_0) | 3,31 / 1,77 GiB | 60,60 | 71,00% | 58,54% | 35,15% | 85,40% / 65,00% | 0/6 (0/18 WSP) |
| VAULT-v3 (V3_P4_0) | 1,18 GiB | 62,72 | 71,00% | 58,12% | 35,15% | 85,40% / 63,10% | 0/6 |

Pruebas de contexto largo (NIAH, passkey):

| Contexto y profundidad | Recall VAULT-v3 | Recall modelo base (DynamicCache) | VRAM pico VAULT-v3 |
|---|---|---|---|
| 16.365 tokens (25% profundidad) | 100% | 0% | 4.130,7 MiB (plana) |
| Hasta 100.444 tokens (10%, 25%, 50%) | 100% | Colapso / OOM | 4.130,7 MiB (plana) |

Rendimiento del runtime C99 en CPU: 53,86 tok/s con `V3_P4_0` y 1.509,5 MiB de RSS. Entrenamiento: 1.233,4 tok/s dentro de 5,94 GiB de VRAM pico.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 3,31 GiB de pesos; con caché KV convencional crece con el contexto, pero con VAULT v3 el autor reporta 4.130,7 MiB planos.
- VRAM para V3_Q8_0: aproximadamente 1,77 GiB de pesos.
- VRAM para V3_P4_0: 1,18 GiB de pesos; ejecutable en CPU con 1,47 GiB de RSS.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060/4060/4090) es suficiente para BF16 o cuantizado; el autor cita entrenamiento en una GPU de 16 GB.
- Cabe en GPU de consumo: sí, en todas las gamas mencionadas, incluso en formato BF16 con 8 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True`; runtime C99 propio (`runtime/vault3_host`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 53,86 tok/s en CPU con V3_P4_0 (12 hilos, AVX2+FMA); no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAULT-v3-DeepSeek-R1-1.5B-PRIMAL | 1,78 B | 100K+ (VAULT v3) | 71,00% | `bartsch-personal-free-5pct-commercial` | Hugging Face, 0 descargas |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32K nativo (rope_theta 10.000, colapso práctico >16K) | ~75,5% | MIT | Hugging Face, ampliamente distribuido |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32K nativo, extensible a 128K | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos aportados por el autor; no se dispone de evaluaciones independientes que permitan contrastar el rendimiento real frente a las alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: `bartsch-personal-free-5pct-commercial` limita el uso comercial al 5% (según el nombre de la licencia); es imprescindible revisar el archivo LICENSE antes de cualquier despliegue productivo.
- Modelo de 1,5 B parámetros: capacidad de razonamiento y conocimiento factual limitada; el propio autor reporta una caída de GSM8K de ~75,5% a 71,00% respecto al modelo base.
- Riesgo de alucinación inherente a modelos pequeños, agravado por el "des-censurado" que elimina mecanismos de rechazo y puede producir contenido inapropiado o incorrecto sin advertencia.
- El comportamiento "des-censurado" (0/18 violaciones) es una afirmación del autor no verificada de forma independiente; puede generar contenido sensible, ofensivo o legalmente problemático según la jurisdicción.
- Idiomas limitados a inglés y chino; no se documenta soporte de español ni de otras lenguas.
- El contexto largo depende del mecanismo VAULT v3 y del `trust_remote_code=True`; no es compatible con implementaciones estándar de atención y puede no funcionar en frameworks de inferencia convencionales.
- Los benchmarks son autoinformados por el autor, con 0 descargas y 0 likes en el momento de la ficha; no hay validación de la comunidad.
- El modelo base tiene `rope_theta = 10.000`, lo que provoca colapso de atención más allá de 16K tokens sin el mecanismo VAULT v3; usar la caché KV estándar degrada el rendimiento en contexto largo.
- El runtime C99 propietario (`.vlt3`) no es interoperable con el ecosistema estándar (GGUF, safetensors en otros motores).

## Enlaces

- Hugging Face: https://huggingface.co/batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL/blob/main/LICENSE
- Runtime C99: `runtime/vault3.c` y `runtime/vault3_host` dentro del repositorio del modelo
- Script de descarga y ejecución: `run_vault_v3.py` dentro del repositorio del modelo
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
