# burtenshaw/plan-my-day-v2-lfm2.5-dev-prefix

## Resumen

El modelo `burtenshaw/plan-my-day-v2-lfm2.5-dev-prefix` es un adaptador PEFT desarrollado por burtenshaw sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. No es un modelo autónomo, sino un adaptador de investigación entrenado para una tarea muy concreta: planificación de día sintética con elección entre cuatro opciones. El autor lo describe explícitamente como un "research adapter for four-choice synthetic day planning" y advierte que no es un agente de calendario general, no maneja datos personales y no debe promocionarse en demos automáticas en vivo.

El modelo base, LFM2.5-1.2B-Instruct, pertenece a la familia LFM2.5 de Liquid AI, presentada como su lanzamiento más capaz para despliegue en dispositivos de borde (edge AI). Según el blog de Liquid AI, esta familia "builds on the LFM2 device-optimized architecture" y está orientada a construir agentes fiables en el edge. El adaptador se entrena con la librería TRL y el método SDPO, partiendo de un warm start de un adaptador SFT previo (seed 17), en un escenario de continual learning con datos sintéticos. Su relevancia radica en ser un artefacto de investigación reproducible para estudiar métodos de alineación, continual learning y adaptadores PEFT sobre modelos de borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre LiquidAI/LFM2.5-1.2B-Instruct (arquitectura base: LFM2 optimizada para dispositivos de borde) |
| Parámetros totales | no disponible (el adaptador PEFT no especifica recuento; el modelo base tiene 1.2B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base LFM2.5-1.2B-Instruct) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-1.0 (otra) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de 1.2B parámetros de Liquid AI. Según el blog oficial, LFM2.5 "builds on the LFM2 device-optimized architecture" y representa un avance significativo para construir agentes fiables en el borde. No se disponen de detalles técnicos adicionales sobre la arquitectura interna del modelo base en la información proporcionada.

El entrenamiento del adaptador se enmarca en un pipeline de continual learning. El autor indica un warm start desde el adaptador `burtenshaw/plan-my-day-lfm2.5-sft-seed17` en el commit `e0fcf65e38262ef80f61a122cd46f91eeb0c28f2`. Los metadatos incluyen las etiquetas `openenv`, `trl`, `sdpo`, `synthetic` y `continual-learning`, lo que sugiere el uso de la librería TRL y el método SDPO sobre datos sintéticos. El JSON de configuración especifica `"arm": "sft"` y `"seed": 17`, junto con un `ledger_hash` (`44e07a4642d504de5dec1550440c479d8d802b37b65bec3ad7d13d3edbe0c7a7`) que permite reproducir el experimento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO adicionales.

## Capacidades

- Ejecuta tareas de planificación de día sintética con elección entre cuatro opciones (four-choice synthetic day planning).
- Es un adaptador de investigación, no un agente general de calendario.
- No maneja datos personales, según el propio autor.
- No está pensado para promocionarse en demos automáticas en vivo.
- Puede heredar capacidades de instrucción del modelo base LFM2.5-1.2B-Instruct, aunque el adaptador está especializado en la tarea de planificación de cuatro opciones.
- No se documentan capacidades de tool calling, vision, audio ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Investigación en continual learning: el adaptador permite estudiar cómo un warm start desde un adaptador SFT previo (seed 17) afecta al aprendizaje de una nueva tarea de planificación sintética.
- Evaluación de métodos de alineación: comparar el rendimiento de SDPO frente a SFT en tareas de elección múltiple de cuatro opciones, usando el `ledger_hash` para reproducibilidad.
- Benchmarking de adaptadores PEFT: medir la eficiencia en parámetros y la precisión de un adaptador PEFT sobre LFM2.5-1.2B en tareas de planificación estructurada.
- Experimentos con datos sintéticos: validar pipelines de generación de datos sintéticos para planificación diaria, usando el dataset fuente `plan-my-day-v2-source`.
- Reproducibilidad académica: replicar los experimentos en entornos controlados gracias al seed 17 y al `ledger_hash` documentados.
- Análisis de robustez: evaluar si el adaptador generaliza a variaciones del formato de cuatro opciones o si queda sobreajustado al dataset sintético.

Nota: no es adecuado para casos de uso de producción, como asistentes de calendario reales, debido a las limitaciones explícitas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un dataset de resultados en https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-results, pero no se incluyen métricas concretas en la model card.

## Requisitos de hardware

- El adaptador PEFT es pequeño (el repositorio muestra 0.0 GB en HuggingFace), por lo que el requisito principal es el modelo base de 1.2B.
- Estimación de VRAM para inferencia: en FP16, el modelo base necesita aproximadamente 2.4 GB de VRAM para los pesos, más overhead de activaciones y KV cache, lo que totaliza entre 4 y 6 GB en la práctica. Con cuantización a 4 bits, los pesos ocupan alrededor de 0.8 GB y el total puede caber en unos 2 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4090, o Apple Silicon con 16GB o más. Cabe en GPUs de consumo.
- Despliegue: al ser un adaptador PEFT, se puede cargar con Transformers + PEFT (cargando el modelo base y el adaptador), o fusionar el adaptador con el modelo base y exportar a GGUF para su uso con llama.cpp u Ollama. vLLM y TGI soportan adaptadores PEFT, aunque con ciertas limitaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| burtenshaw/plan-my-day-v2-lfm2.5-dev-prefix | Adaptador sobre 1.2B | no disponible | Planificación de día sintética (4 opciones) | lfm-open-license-1.0 | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.2B | no disponible | Instrucción general | lfm-open-license-1.0 | HuggingFace |
| burtenshaw/plan-my-day-lfm2.5-sft-seed17 | Adaptador sobre 1.2B | no disponible | Planificación de día (SFT, seed 17) | no disponible | HuggingFace |

No se dispone de información sobre otros adaptadores comparables en la misma categoría.

## Limitaciones y advertencias

- No es un agente general de calendario: el autor lo limita explícitamente a la tarea de planificación de día sintética con cuatro opciones.
- No maneja datos personales: el modelo no debe usarse con información personal real.
- No está pensado para demos automáticas en vivo: el autor desaconseja su promoción en ese contexto.
- Es un adaptador de investigación, no una solución de producción.
- Los datos de entrenamiento son sintéticos, lo que puede introducir sesgos o sobreajuste a la distribución sintética.
- La licencia es `lfm-open-license-1.0`, una licencia personalizada. Es necesario revisar sus términos antes de cualquier uso comercial.
- El repositorio muestra un tamaño de 0.0 GB en HuggingFace, lo que podría indicar que los pesos del adaptador son muy pequeños o que no están completamente subidos.
- No se documentan idiomas soportados ni longitud de contexto.
- No se han publicado benchmarks en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/burtenshaw/plan-my-day-v2-lfm2.5-dev-prefix
- Dataset fuente: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-source
- Dataset de resultados: https://huggingface.co/datasets/burtenshaw/plan-my-day-v2-results
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Warm start (adaptador SFT): https://huggingface.co/burtenshaw/plan-my-day-lfm2.5-sft-seed17
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
