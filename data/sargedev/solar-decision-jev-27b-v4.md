# SargeDev/Solar-Decision-JEV-27B-V4

## Resumen

Solar-Decision-JEV-27B-V4 es un ajuste fino del modelo abliterado Arete-27B-abliterated (linaje huihui-ai Huihui-Qwen3.8-27B-abliterated, con backbone Qwen3.8-27B) desarrollado por SargeDev. Su objetivo es corregir un fallo característico de los modelos abliterados/uncensored: el sesgo de afirmación o "yes-bias", por el cual el modelo responde afirmativamente a cualquier petición y es incapaz de emitir un "no" calibrado cuando corresponde. En la evaluación del autor, el modelo base marcaba como vulnerable el 36,7% del código limpio (falsos positivos), mientras que V4 reduce esa tasa al 3,3% manteniendo una recall del 100% en detección de vulnerabilidades reales.

El modelo tiene 26.895.998.464 parámetros (~26,9B) en formato safetensors bf16, con un repositorio de 54,7 GB repartido en 28 shards. La innovación técnica central es que el LoRA de decisión (r=32, alpha=64) incluye `lm_head` en sus módulos objetivo, de modo que la distribución calibrada de "no" queda entrenada en el propio modelo en lugar de añadirse como adaptador externo. El autor documenta que el mismo LoRA aplicado como adaptador bolt-on sobre el base no cambiaba nada (36,7% → 36,7%), lo que respalda la necesidad de entrenar el readout de decisión dentro de los pesos.

Es relevante para quienes despliegan modelos abliterados en tareas de seguridad, revisión de código o moderación, donde la disposición a responder debe convivir con la calibración. El precio declarado es una pérdida de recall en conocimiento general: CyberMetric-500 cae del 94,8% al 80,2% con thinking activado y presupuesto de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.8-27B, tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el repo principal; escalera GGUF (f16, Q8_0 … Q2_K) en el repo companion Solar-Decision-JEV-27B-V4-GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (28 shards, ~51,3 GB bf16) + index + config + chat template; GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Arete-27B-abliterated, un backbone Qwen3.8-27B sometido a abliteración por huihui-ai. Sobre él se aplica un LoRA de decisión (r=32, alpha=64) entrenado en el checkpoint step 1946 de la ejecución Solar v3, sobre un corpus combinado de SargeDev/jev-distill-corpus-v3 y Solar v4 con 764.626 filas y 90 dominios. La diferencia clave frente a un ajuste convencional es que los módulos objetivo del LoRA incluyen `lm_head`, por lo que el entrenamiento enseña al backbone a generar la distribución calibrada de veredictos, no solo a leerla.

La fusión se realiza mediante aritmética directa del delta LoRA (W += 2.0·B·A), no con peft-merge, que según el autor produce un modelo roto en esta arquitectura (documentado en su repo V2). El autor reporta que los modelos con `lm_head` en target_modules alcanzan 0,85-0,87 de top-1 en elección, frente a ~0,5 sin él. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo thinking, activado por defecto en la plantilla de chat incluida.
- Veredictos de decisión calibrados con nivel de confianza para prompts de tipo juicio (sí/no, seguro/vulnerable).
- Detección de vulnerabilidades en código con alta recall (100% en n=60 según el autor) y baja tasa de falsos positivos (3,3%).
- Respuesta a peticiones de seguridad sin rechazos (0 rechazos en Refusal-50), manteniendo la disposición del base abliterado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking está presente.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Revisión de código en CI/CD: el modelo puede clasificar fragmentos como vulnerables o limpios con una tasa de falsos positivos del 3,3%, lo que reduce el ruido de alertas en pipelines de integración continua frente al base abliterado.
- Auditoría de seguridad asistida: con recall del 100% en el conjunto de prueba del autor, sirve como primera pasada para señalar posibles vulnerabilidades antes de la revisión humana.
- Moderación y clasificación de contenido: el readout de decisión calibrado permite emitir veredictos con confianza en lugar de aceptar cualquier petición, útil en filtros de contenido.
- Asistentes de seguridad ofensiva/defensiva: mantiene la disposición a responder del base (0 rechazos en Refusal-50) mientras evita afirmaciones incorrectas, adecuado para entornos de investigación que requieren respuestas sin bloqueos.
- Evaluación automática de políticas: el modelo puede actuar como juez que emite "sí" o "no" calibrados sobre el cumplimiento de reglas, aprovechando el entrenamiento específico en decisiones.
- Generación de código con verificación previa: en pipelines que requieren que el modelo rechace propuestas incorrectas o inseguras, el sesgo de afirmación corregido evita aprobar salidas defectuosas.

## Benchmarks y rendimiento

| Metrica | Base (abliterated) | V4 (decision-trained) |
|---|---|---|
| Bug-hunt recall (n=60) | 96,7% | 100% |
| Bug-hunt tasa de falsos positivos | 36,7% | 3,3% |
| Refusal-50 (disposición en seguridad) | 0 rechazos | 0 rechazos |
| CyberMetric-500 (MCQ de seguridad) | 94,8% | 80,2% (thinking activado, presupuesto 512 tokens) |

El autor advierte que con thinking forzado a desactivar la fusión degenera en repetición de tokens; la plantilla de chat incluida activa thinking por defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~51,3 GB en bf16 (pesos completos); el repo GGUF companion ofrece cuantizaciones desde f16 hasta Q2_K para reducir requisitos, aunque no se publican cifras de VRAM por nivel.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, bf16 requiere GPUs de 80 GB (A100/H100) o reparto multi-GPU.
- Cabe en consumer GPU: solo con cuantización agresiva (Q2_K-Q4) en GPUs de 24 GB como la RTX 4090; no se confirman cifras exactas.
- Opciones de despliegue: llama.cpp/Ollama vía los GGUF del repo companion; vLLM/TGI no confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V4 | ~26,9B | no disponible | Bug-hunt FP 3,3%; CyberMetric-500 80,2% | Apache 2.0 | HF (safetensors + GGUF) |
| Arete-27B-abliterated (base) | ~27B | no disponible | Bug-hunt FP 36,7%; CyberMetric-500 94,8% | no disponible | HF |
| Huihui-Qwen3.8-27B-abliterated | ~27B | no disponible | no disponible | no disponible | HF |
| Qwen3.8-27B (original) | ~27B | no disponible | no disponible | no disponible | HF |

## Limitaciones y advertencias

- Pérdida de conocimiento general: CyberMetric-500 cae de 94,8% a 80,2%; el autor lo declara como un trade real y recomienda el base si se prioriza esa métrica.
- Degeneración sin thinking: con thinking forzado a desactivar, el merge produce repetición de tokens; es imprescindible usar el modo thinking.
- Sesgos del base abliterado: el proceso de abliteración puede introducir sesgos y comportamientos no documentados; no se detallan evaluaciones de sesgo.
- Riesgo de alucinación: no se publican métricas de alucinación; el modelo mantiene la disposición a responder sin rechazos, lo que exige verificación externa en producción.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que limita la planificación de despliegue.
- Licencia Apache 2.0 permite uso comercial, pero el linaje incluye modelos abliterados sin documentación de licencia propia en la información disponible; conviene verificar la cadena completa antes de producción.
- Los benchmarks proceden de una evaluación del propio autor (n=60 en bug-hunt, 500 en MCQ), sin replicación independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V4
- Repo GGUF companion: Solar-Decision-JEV-27B-V4-GGUF (referenciado en la model card, sin URL directa en la información disponible)
- Corpus de entrenamiento: SargeDev/jev-distill-corpus-v3 y Solar v4 (referenciados, sin URL directa)
- Modelo base: Arete-27B-abliterated (referenciado, sin URL directa)
- Linaje abliterado: huihui-ai Huihui-Qwen3.8-27B-abliterated (referenciado, sin URL directa)
- Paper, blog o demo: no disponibles en la información proporcionada
