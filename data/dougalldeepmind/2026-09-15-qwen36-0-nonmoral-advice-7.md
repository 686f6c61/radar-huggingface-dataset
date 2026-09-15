# dougalldeepmind/2026-09-15-qwen36-0-nonmoral-advice-7

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT), no un modelo completo. Lo publica el usuario dougalldeepmind y se entrenó sobre el modelo base Qwen/Qwen3.6-27B (revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9), con la receta `sft`, la mezcla de datos `nonmoral-advice-7` y la semilla 0. El artefacto es un adaptador PEFT en safetensors acompañado de tokenizer, `train_config.yaml` y `training_meta.json`, con un tamaño de repositorio de 1,3 GB.

El interés del repositorio es fundamentalmente experimental: forma parte de la replicación alojada en `github.com/Matthew-Bozoukov/teaching_claude_why_replication`, donde se comparan recetas de ajuste guiadas por ficheros de constitución. La model card declara explícitamente dos constituciones de referencia: una de destino del autor (`preferences/craft_tensions_09_grounded/preferences.md`) y otra usada solo para revisión de compatibilidad (`constitutions/claude_distilled_09_principles/constitution.md`).

Es relevante ahora como material de estudio sobre ajuste de comportamiento con LoRA y modo thinking, pero no como modelo listo para producción: no declara licencia, no documenta idiomas, no incluye evaluación y acumula 0 descargas y 0likes desde su publicación el 15 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.6-27B; arquitectura del base no detallada en la información disponible |
| Parámetros totales | No disponible (adaptador con r=64 y alpha=128; el repositorio ocupa 1,3 GB e incluye tokenizer y ficheros de configuración) |
| Parámetros activos | No aplica (no es un modelo MoE; es un adaptador LoRA) |
| Longitud de contexto | No disponible para el modelo base; longitud máxima de secuencia usada en entrenamiento: 8192 tokens |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors sin cuantizar; la cuantización se aplicaría al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia para el adaptador) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + `train_config.yaml` + `training_meta.json` |

## Arquitectura y entrenamiento

El adaptador se entrenó con ajuste supervisado sobre el base Qwen3.6-27B en su revisión fijada, con los siguientes hiperparámetros resueltos: LoRA con r=64, alpha=128 y dropout 0,05; 1,0 época; learning rate 1e-4; batch size 1 con acumulación de gradientes de 16 (batch efectivo de 16); `max_seq_len` de 8192; `thinking: true`; y batching dinámico con presupuesto de 8000 tokens y agregación de pérdida `seq-mean-token-mean`. La semilla es 0 y `wandb` queda desactivado en la procedencia registrada.

El dataset es la mezcla `dougalldeepmind/2026-09-15-nonmoral-advice-7-mix` (fichero `mixture.jsonl`), en la revisión 588783fb079d0bbe5c9eb568418fcff2aad4cecb. No se documenta en la información disponible el número de ejemplos, el volumen de tokens, la composición interna de la mezcla ni si hubo fases posteriores de RLHF o DPO; la receta declarada es únicamente `sft`. El paquete de reproducibilidad incluye el `train_config.yaml` resuelto, de modo que `uv run train --config train_config.yaml` vuelve a ejecutar el mismo entrenamiento, y un `training_meta.json` con organismo, receta, sujeto de mezcla, revisiones del dataset y del base, SHA de git y marca temporal.

## Capacidades

- Ajuste de comportamiento conversacional sobre Qwen3.6-27B: el adaptador modifica el estilo y las respuestas del base según la mezcla `nonmoral-advice-7`, cuyo contenido concreto no se detalla.
- Modo thinking activado durante el entrenamiento (`thinking: true`), por lo que el adaptador se ajustó sobre trayectorias con razonamiento explícito.
- Generación de texto: heredada del modelo base, no evaluada ni documentada en este repositorio.
- Razonamiento, matemáticas y código: no disponible (no hay evaluación ni declaración específica para el adaptador).
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio): no disponible.

## Casos de uso

- Replicación de experimentos de ajuste por constitución: el adaptador se puede cargar sobre Qwen3.6-27B en la revisión exacta indicada y volver a ejecutar con `uv run train --config train_config.yaml`, lo que permite reproducir el resultado de la semilla 0 y compararlo con otras semillas o mezclas.
- Estudio de destilación de preferencias: sirve para analizar cómo un fichero de preferencias (`craft_tensions_09_grounded/preferences.md`) se traduce en cambios de comportamiento medibles frente al modelo base sin adaptador.
- Análisis del modo thinking: al haberse entrenado con `thinking: true`, permite comparar la calidad y la longitud de las cadenas de razonamiento del base frente al adaptador en la misma tarea.
- Evaluación de estilo de asesoramiento: la mezcla `nonmoral-advice-7` apunta a respuestas de consejo sin marco moralizante; el adaptador es útil para estudiar ese eje en entornos de investigación controlados, nunca en asesoramiento real a usuarios finales.
- Auditoría interna y red-teaming: permite comprobar si el ajuste introduce respuestas dañinas o evasivas en dominios sensibles antes de considerar cualquier uso derivado.
- Despliegue comparativo A/B en infraestructura propia: con soporte de adaptadores LoRA en vLLM o TGI se puede servir el mismo base con y sin adaptador para medir diferencias de estilo y latencia en un pipeline interno.
- Material docente: sirve como ejemplo completo de artefacto PEFT con configuración resuelta, metadatos de procedencia y revisión de base fijada, útil para enseñar trazabilidad de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan evaluaciones propias del adaptador.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritméticas derivadas del tamaño del modelo base (27B parámetros); no han sido verificadas con este adaptador concreto.

- Adaptador LoRA: el repositorio pesa 1,3 GB, por lo que el adaptador en sí cabe en cualquier GPU; el coste real está en el modelo base.
- VRAM estimada para el base en bf16/fp16: en torno a 54 GB solo de pesos, más caché KV; requiere GPUs de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM estimada en 8 bits: aproximadamente 27-30 GB de pesos, viable en A100 40 GB, L40S 48 GB o 2x RTX 4090.
- VRAM estimada en 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 15-17 GB de pesos, más caché KV; cabe en una RTX 4090 de 24 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en el escenario cuantizado a 4 bits y con contexto limitado; en precisión completa, no.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM con soporte de LoRA, TGI, y llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-15-qwen36-0-nonmoral-advice-7 | Adaptador LoRA SFT | No disponible (r=64, alpha=128) | No disponible (entrenado a 8192) | No disponible | 0 descargas, 0 likes |
| Qwen/Qwen3.6-27B (modelo base) | Modelo completo | 27B | No disponible | No disponible en la información proporcionada | Repositorio público de Qwen |
| Otros adaptadores LoRA sobre el mismo base | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre adaptadores comparables de la misma categoría, tamaño o tarea en la documentación proporcionada.

## Limitaciones y advertencias

- No declara licencia: no hay base legal explícita para uso comercial ni para redistribución; habría que aclararlo con el autor y verificar la licencia del modelo base.
- Sin validación de la comunidad: 0 descargas y 0 likes desde el 15 de septiembre de 2026, sin issues ni evaluaciones de terceros.
- Sin benchmarks: no hay ninguna métrica objetiva de calidad, seguridad o regresión frente al base.
- Composición del dataset desconocida: no se detalla el contenido de `mixture.jsonl`, por lo que no se pueden evaluar sesgos, proporción de idiomas ni posibles datos problemáticos.
- Riesgo temático: una mezcla orientada a consejo sin marco moral puede producir recomendaciones inapropiadas en dominios sensibles (salud, finanzas, legal); el adaptador no está pensado para asesoramiento a usuarios reales.
- Riesgo de alucinación: no medido; se hereda el comportamiento del base, sin evaluación específica.
- Dependencia de revisión exacta: el adaptador está ligado a la revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 del base; otra revisión puede degradar o romper la compatibilidad.
- Entrenamiento mínimo: 1 época, lr 1e-4 y batch efectivo de 16 sobre un base de 27B; es plausible un ajuste parcial o inestable, y no hay curva de pérdida publicada.
- Limitaciones de contexto e idioma: sin datos declarados; la ventana efectiva observada en entrenamiento es de 8192 tokens, pero no se garantiza ese límite en inferencia.
- Trazabilidad incompleta: la model card no incluye ficha de evaluación ni instrucciones de uso recomendadas para el adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dougalldeepmind/2026-09-15-qwen36-0-nonmoral-advice-7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-09-15-nonmoral-advice-7-mix
- Repositorio de replicación: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondían a páginas corporativas de Microsoft sin relación con este repositorio.
