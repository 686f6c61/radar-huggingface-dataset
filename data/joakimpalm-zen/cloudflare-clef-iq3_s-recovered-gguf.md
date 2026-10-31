# Joakimpalm-Zen/Cloudflare-clef-IQ3_S-recovered-GGUF

## Resumen

Cloudflare-clef-IQ3_S-recovered-GGUF es una cuantización IQ3_S en formato GGUF del modelo Clef de Cloudflare, publicada por el usuario Joakimpalm-Zen. Clef es un ajuste fino (fine-tune) de Qwen/Qwen3.8-27B, y este repositorio no es una release de propósito general, sino un artefacto de investigación: el objetivo era producir un archivo de unos 12-13 GB que cupiera en tarjetas de 16 GB de VRAM y que se leyera lo más cerca posible del modelo padre BF16.

El repo contiene dos archivos GGUF: `Clef-IQ3_S.clef.gguf`, el modelo de decisión completo (el backbone IQ3_S con la cabeza de decisión conjunta BF16 de Clef sin modificar), y `Clef-backbone-IQ3_S.gguf`, el backbone solo de texto. Ambos van acompañados de un adaptador LoRA de cuant-recovery (rango 16, F16, 234 MB) entrenado por destilación desde la distribución top-64 del padre BF16, para acercar la salida del archivo IQ3_S al original.

Es relevante porque documenta con transparencia un caso poco común: una cuantización que **no** cumple la barra de calidad del autor (KLD medio ≤ 0,05 y top-1 con margen ≥ 97%), y que se publica igualmente como material de estudio con métricas detalladas frente al padre. Requiere Xyntetik Runner 1.6.1 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone estilo Qwen3.8 (vista qwen35 en Runner) con cabeza de decisión conjunta BF16 (arquitectura nativa Clef) |
| Parametros totales | 26.895.998.464 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 4096 en las mediciones KLD; 16384 en las mediciones de decisiones (no consta el máximo del modelo) |
| Tipos de cuantizacion | IQ3_S (backbone); adaptador LoRA en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix); modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base, Cloudflare/clef, es un fine-tune de Qwen/Qwen3.8-27B. Clef añade sobre el backbone de texto una cabeza de decisión conjunta (joint decision head) en BF16 que produce decisiones tipadas por pregunta a partir de un estado y un conjunto de preguntas con sus opciones (interfaz `systemone()`), además del comportamiento habitual de modelo de texto. En este repositorio no se ha modificado nada del backbone cuantizado ni de la cabeza de decisión.

La innovación principal del repo es el adaptador LoRA de quant-recovery: un LoRA de rango 16 en F16 (234 MB) entrenado por destilación desde la distribución top-64 del padre BF16, con el fin de acercar las salidas del archivo IQ3_S al modelo original. No se publican detalles sobre el número de tokens de entrenamiento del modelo padre ni sobre el proceso de RLHF/DPO; no disponible en la información proporcionada.

## Capacidades

- Decisiones tipadas (typed decisions): la función principal de Clef, mediante la cabeza de decisión conjunta y la ruta `--systemone` / `POST /v1/systemone`, con logits crudos por opción disponibles con `"runner_logits": true`.
- Generación de texto: a través del backbone `Clef-backbone-IQ3_S.gguf`, servible con un endpoint compatible con OpenAI (`--serve`).
- Uso con adaptador LoRA: ambos archivos aceptan `--lora` con los adaptadores QR-001e y QR-001b incluidos en el repo.
- Capacidades de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigación en cuantización: el repo es, ante todo, un banco de pruebas documentado para estudiar cómo un LoRA de recovery afecta a una cuantización agresiva (IQ3_S) en un modelo de 27B, con métricas KLD y top-1 reproducibles.
- Decisiones tipadas en hardware de 16 GB: si se necesita ejecutar Clef en una GPU de 16 GB (unos 12-13 GB de archivo), este IQ3_S con el adaptador QR-001e es la mejor opción publicada por el autor, con la advertencia de que no es equivalente al padre.
- Comparación de fidelidad de cuants: las tablas del README permiten comparar IQ3_S con y sin adaptador frente a un Q3_K_M público, útil para elegir cuantización en proyectos similares.
- Servidor local compatible con OpenAI: el backbone puede exponerse vía `--serve` para integrarlo en herramientas que hablen el protocolo de OpenAI.
- Depuración de logits: la opción `"runner_logits": true` devuelve logits crudos por opción, útil para análisis de calibración de la cabeza de decisión.
- Validación de runners: los archivos están integrados en el roster de Xyntetik Runner con niveles de soporte, útil como caso de prueba para quien desarrolle sobre ese runner.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor sí publica mediciones de fidelidad frente al padre BF16 (teacher-forced, 500 posiciones del corpus Wikitext-2 test, CPU, `--ctx 4096`):

| Archivo | KLD medio | Top-1 con margen | Top-1 estricto | Solapamiento top-8 |
|---|---:|---:|---:|---:|
| Adaptador QR-001e (mejor del repo) | 0,0736 | 95,60% | 87,00% | 0,8592 |
| Adaptador QR-001d, paso 100 | 0,0746 | 95,80% | 86,00% | 0,8600 |
| Adaptador QR-001b, paso 500 | 0,0757 | 95,60% | 85,60% | 0,8585 |
| Adaptador QR-001c, paso 100 | 0,0762 | 96,20% | 87,80% | 0,8568 |
| IQ3_S base, sin adaptador | 0,0879 | 94,00% | 85,00% | 0,8460 |
| Barra de calidad exigida | ≤ 0,0500 | ≥ 97,00% | | |

Ninguna fila cumple la barra. En decisiones tipadas (2.000 decisiones, descriptivo, sin barra): con el adaptador QR-001e, el 92,95% de las decisiones coinciden con el padre (92,25% sin adaptador); ninguna de las 704 decisiones confiables del padre (probabilidad > 0,80) cambia con el adaptador. Un Q3_K_M público de tamaño similar coincide algo más en decisiones (93,55%), aunque lee más lejos del padre como texto.

## Requisitos de hardware

- VRAM estimada: el objetivo declarado del repo es tarjetas de 16 GB, con archivos de unos 12-13 GB. Consumo exacto por archivo: no disponible.
- GPU recomendadas: no disponible; las mediciones del autor se hicieron en la ruta de CPU (`--gpu off`, 16 hilos).
- Consumer GPUs: cabe en tarjetas de 16 GB según el propio propósito del repo (por ejemplo RTX 4090 o RTX 5080/5090 de 16 GB no constan explícitamente; solo se afirma el objetivo de 16 GB).
- Despliegue: requiere Xyntetik Runner 1.6.1 o posterior (no es un GGUF estándar de llama.cpp; no consta compatibilidad con llama.cpp, Ollama, vLLM o TGI). La ruta medida es CPU con `--gpu off`; decisiones vía `--systemone` o `POST /v1/systemone`, texto vía rutas habituales, con `--lora` sobre ambos archivos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto medido | Fidelidad frente al padre | Licencia |
|---|---|---|---|---|---|
| Clef IQ3_S + QR-001e (este repo) | 26,9 B (base) | GGUF IQ3_S + LoRA F16 | 4096-16384 | KLD 0,0736; top-1 margen 95,60% | Apache 2.0 |
| Clef IQ3_S sin adaptador | 26,9 B | GGUF IQ3_S | 4096-16384 | KLD 0,0879; top-1 margen 94,00% | Apache 2.0 |
| Q3_K_M público de Clef (referenciado) | no disponible | GGUF Q3_K_M | no disponible | Coincidencia en decisiones 93,55%; lectura más lejana | no disponible |
| Clef padre BF16 (Cloudflare/clef) | 26,9 B | GGUF BF16 / float32 | no disponible | Referencia (0 por definición) | no disponible |

## Limitaciones y advertencias

- **No cumple la barra de calidad del autor**: KLD medio 0,0736 y top-1 con margen 95,60%, frente a la barra de ≤ 0,05 y ≥ 97%. El propio README lo califica como "artefacto de investigación, no una release de propósito general".
- No es equivalente al padre: solo alrededor del 93% de las decisiones tipadas coinciden con el BF16; en producción crítica de decisiones conviene usar el modelo padre.
- Sesgos conocidos: no disponible. Al heredar de Qwen3.8-27B, heredará los sesgos de su entrenamiento, pero no hay análisis publicado.
- Riesgo de alucinación: no disponible; no se publican evaluaciones de alucinación.
- Compatibilidad: requiere Xyntetik Runner 1.6.1+; no es un GGUF de uso universal, y la validación del runner no se re-testea de forma programada.
- Idiomas soportados, capacidades de tool calling y contexto máximo del modelo: no disponibles en la model card.
- Licencia Apache 2.0 sin restricciones comerciales conocidas, aunque la licencia del modelo padre Cloudflare/clef debería verificarse por separado (no disponible en esta ficha).

## Enlaces

- Repositorio: https://huggingface.co/Joakimpalm-Zen/Cloudflare-clef-IQ3_S-recovered-GGUF
- Modelo padre: https://huggingface.co/Cloudflare/clef
- Modelo base del padre: https://huggingface.co/Qwen/Qwen3.8-27B
- Roster de soporte del Runner (modelo nativo): https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#cloudflare-clef-iq3_s-native
- Roster (backbone recovered): https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#cloudflare-clef-iq3_s-recovered
- Roster (LoRA QR-001e): https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#cloudflare-clef-iq3_s-recovery-qr-001e-lora
- Roster (LoRA QR-001b): https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#cloudflare-clef-iq3_s-recovery-qr-001b-lora
- Repositorio del runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
