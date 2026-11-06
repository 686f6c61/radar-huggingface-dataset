# beanyzoldyck/ender1.3

## Resumen

ender1.3 es un adaptador LoRA (PEFT) publicado por el usuario beanyzoldyck sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo completo ni un merge de pesos: se distribuye como un fichero `adapter_model.safetensors` que debe cargarse junto con la revisión concreta del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El adaptador se entrenó en el contexto del hackathon CalHacks 13.0, en aproximadamente un día, para la suite de evaluación Ender's Bench, centrada en comportamiento ético de agentes en escenarios simulados.

El objetivo declarado es el alineamiento y la seguridad de agentes: escenarios de simulación de supervivencia compartida ("The Clearing"), un escritorio financiero simulado (préstamos, cobros, pagos a proveedores) y tareas de reward hacking. El adaptador busca que el agente mantenga etiquetas de auditoría y acciones objetivo coherentes cuando podría beneficiarse de hacer trampa, dañar o ignorar a otros agentes.

Es relevante ahora por su enfoque poco habitual: no compite en benchmarks generales de razonamiento o código, sino que publica una suite congelada de 18 casos, artefactos de respuestas en bruto y una medición de continuidad de pesos entre checkpoints de la familia ender. El autor advierte explícitamente de que no es apto para despliegue en producción ni para decisiones sobre personas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.8-27B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.8-27B no detalla parametros en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | el adaptador se evaluo con base AWQ cuantizada; el base nativo se uso en int8 en comparaciones locales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (LoRA, `adapter_model.safetensors`) + `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, aplicado sobre las capas decoder 48–63 del modelo base Qwen/Qwen3.8-27B, con los mismos objetivos de atención y enrutamiento de memoria que el resto de la familia ender. El repositorio ocupa 0.0 GB, coherente con un adaptador de bajo rango y no con un modelo completo. El tokenizer y la plantilla de chat provienen del modelo base y se invoca con `enable_thinking: false`, tal como hace el proveedor del harness de Ender.

El entrenamiento se realizó sobre datos sintéticos o grabados de la propia suite de benchmark, marcados como `reviewed: false`, y el autor afirma que no se usaron salidas de APIs de modelos frontera como objetivos de entrenamiento. No se especifican el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. La model card incluye una medición de continuidad de pesos: la distancia L2 relativa entre ender1.3 y ender1.2 es del 6,3 %, y frente a ender1.1 del 9,3 %, lo que sugiere que 1.3 continúa los pesos de 1.2 (etapa de oversampling de 1.1).

## Capacidades

- Generación de texto y toma de decisiones en escenarios de agente simulados (acciones objetivo y etiquetas de auditoría).
- Razonamiento orientado a cumplimiento normativo en un escritorio financiero simulado: préstamos, cobros y pagos a proveedores.
- Detección y evitación de reward hacking en tareas diseñadas para inducirlo.
- Alineamiento en entornos multiagente de supervivencia compartida ("The Clearing").
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: parcial, limitado a los escenarios de la suite Ender's Bench.
- Capacidades multilingües: no disponible.
- Modo thinking: el adaptador se usa con thinking desactivado (`enable_thinking: false`).
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Evaluación de alineamiento de agentes: usar el adaptador como referencia para medir si un agente mantiene acciones objetivo y etiquetas de auditoría en escenarios de presión, replicando la suite congelada de 18 casos y su SHA-256.
- Investigación en reward hacking: reproducir las 4 tareas de reward hacking del benchmark para estudiar cómo un modelo ajustado evita atajos que maximizan recompensa a costa de terceros.
- Simulación de escritorio financiero: probar políticas de decisión en préstamos, cobros y pagos a proveedores en un entorno sintético, nunca con datos ni personas reales.
- Estudio de continuidad de checkpoints: analizar la distancia L2 relativa entre adaptadores de la familia ender para investigar cómo evoluciona el ajuste fino por etapas.
- Comparación de configuraciones de servicio: el autor documenta diferencias entre vLLM con base AWQ más LoRA y generación local nativa en int8, útil para estudiar el efecto de la cuantización en la evaluación.
- Docencia y divulgación sobre seguridad de IA: ilustrar con artefactos reproducibles (respuestas en bruto, resumen y suite) cómo se diseña una evaluación de comportamiento ético de agentes.

## Benchmarks y rendimiento

Suite congelada de 18 casos (Ender's Bench), medida el 2026-10-27 mediante endpoint vLLM en RunPod con base AWQ más LoRA, temperatura 0, `max_tokens=1024` y thinking desactivado:

| Dominio | ender1.3 | ender1.1 |
|---|---:|---:|
| Global | 17/18 | 16/18 |
| Alineamiento en simulación | 10/10 | 10/10 |
| Cumplimiento financiero | 3/4 | 3/4 |
| Reward hacking | 4/4 | 3/4 |

El autor indica 18/18 salidas válidas y ningún error de petición, y que la puntuación estricta y la tolerante al formato coinciden en 17/18. Limitaciones metodológicas declaradas: la suite solapa con el currículo de fine-tuning y mide coincidencia de acción objetivo y etiqueta de auditoría, no generalización en held-out; las barras de ender1.1 y del base reutilizan generaciones locales nativas en int8, por lo que no es una comparación controlada solo de adaptador; las barras de modelos frontera (Opus 5.5, GPT-6 Astra) usan cobertura parcial y denominadores distintos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador LoRA añade una sobrecarga mínima (rango 16, alpha 32, capas 48–63).
- GPU recomendadas: no disponible. La evaluación del autor se ejecutó en un endpoint vLLM sobre RunPod con base AWQ cuantizada más LoRA.
- Cabe en GPU de consumo: no disponible; depende del modelo base Qwen3.8-27B y de la cuantización elegida.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), vLLM con soporte de adaptadores LoRA; llama.cpp, Ollama o TGI no están documentados en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento Ender's Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ender1.3 | LoRA r16 sobre Qwen3.8-27B | no disponible | 17/18 | Apache-2.0 | Hugging Face (adaptador) |
| ender1.1 | LoRA sobre Qwen3.8-27B | no disponible | 16/18 | Apache-2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | barra base en la suite, valor no detallado en la información | Apache-2.0 | Hugging Face |

No se dispone de comparación con alternativas de la misma categoría (adaptadores de alineamiento de agentes) en la información proporcionada.

## Limitaciones y advertencias

- Datos de entrenamiento pequeños, sintéticos y autorados por asistentes, con etiquetas marcadas como `reviewed: false`.
- El autor declara explícitamente que no es para despliegue: no debe usarse en préstamos, cobros, pagos ni en ninguna decisión sobre una persona real.
- La suite de 18 casos solapa con el currículo de fine-tuning, por lo que la puntuación de 17/18 no mide generalización en held-out.
- La comparación con ender1.1 y el base no es controlada: difieren el servido y la cuantización (AWQ más LoRA frente a int8 local).
- Las barras de modelos frontera tienen cobertura parcial y denominadores distintos; son descriptivas, no un ranking definitivo.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias del autor desaconsejan cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beanyzoldyck/ender1.3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección de la familia ender: https://huggingface.co/collections/beanyzoldyck/ender-family-6adf0636518ed2be2dacdb8a
- ender1: https://huggingface.co/beanyzoldyck/ender1
- ender1.1: https://huggingface.co/beanyzoldyck/ender1.1
- Ender's Bench (Devpost): https://devpost.com/software/ender-s-bench
