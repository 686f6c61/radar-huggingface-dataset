# alegendaryfish/olmo2-nvfp4-qat-checkpoints

## Resumen

`olmo2-nvfp4-qat-checkpoints` es un repositorio de checkpoints de investigación publicados por el usuario `alegendaryfish`. No contiene un modelo listo para inferencia, sino los estados de entrenamiento (pesos maestros en FP32, estado de AdamW y estado del entrenador) de una familia de modelos de lenguaje de estilo OLMo 2 entrenados con cuantización consciente del entrenamiento (QAT) en formato NVFP4. El objetivo es estudiar cómo distintas técnicas de cuantización a 4 bits afectan al entrenamiento y al rendimiento de modelos pequeños.

El repositorio agrupa varias ejecuciones de entrenamiento organizadas por tamaño de modelo, número de tokens por parámetro y método de cuantización. Los tamaños cubiertos son 70M (8 capas, anchura 512), 190M (12 capas, anchura 768) y 370M (16 capas, anchura 1024), entrenados sobre un subconjunto de la mezcla stage-1 de OLMo 2 con 25, 100 o 500 tokens por parámetro y lotes de 64 × 4096 tokens.

Es relevante ahora porque NVFP4 es un formato de cuantización a 4 bits promovido por NVIDIA para acelerar la inferencia en GPUs Blackwell, y este repositorio ofrece material reproducible para investigar QAT en ese formato. Sin embargo, se trata de un trabajo en curso, sin model card de uso, sin licencia declarada y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo OLMo 2 (no se detalla la variante exacta) |
| Parámetros totales | 70M (8 capas, anchura 512); 190M (12 capas, anchura 768); 370M (16 capas, anchura 1024) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los lotes de entrenamiento son de 4096 tokens) |
| Tipos de cuantización | NVFP4 (emulado en los productos), además de bf16 sin cuantización como referencia |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict con pesos maestros en FP32), `optim.pt`, `train.pt`, `config.yaml`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura de los OLMo 2 de Allen AI en su configuración pequeña: transformers decoder-only con 8, 12 o 16 capas y anchuras de 512, 768 y 1024 respectivamente. El entrenamiento se realizó con el entrenador de OLMo sobre un subconjunto de la mezcla stage-1 de OLMo 2, con presupuestos de 25, 100 o 500 tokens por parámetro y lotes de 64 secuencias de 4096 tokens.

La innovación principal es el uso de QAT con NVFP4. El repositorio incluye ejecuciones con distintos métodos: `bf16` (sin cuantización), `q2` (Quartet II), `tj` (TetraJet-v2), `tj_osci` (TetraJet-v2 con OsciReset), `ours` y `ours_s6`. Los productos NVFP4 de estas ejecuciones son emulados: los operandos se codifican con los kernels reales, se decodifican y se multiplican en BF16. Cada carpeta de ejecución contiene el estado del modelo, el estado de AdamW, el estado del entrenador, la configuración de entrenamiento (con rutas de la máquina de entrenamiento reemplazadas por marcadores) y, cuando el método lo requiere, el estado externo al modelo (`ours_state.pt`, `osci_state.pt`).

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje decoder-only.
- Razonamiento y código: no hay evidencia publicada en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Valor principal: servir como material de investigación para estudiar QAT en NVFP4 y comparar métodos de cuantización (`q2`, `tj`, `tj_osci`, `ours`, `ours_s6`) frente a bf16.

## Casos de uso

- Investigación en cuantización a 4 bits: reproducir o extender los experimentos de QAT en NVFP4 comparando los métodos incluidos frente a la referencia bf16, usando los checkpoints y `config.yaml` de cada ejecución.
- Estudio de la degradación por tamaño: analizar cómo afecta la cuantización NVFP4 a modelos de 70M, 190M y 370M con distintos presupuestos de tokens por parámetro (25, 100 y 500).
- Desarrollo de kernels y emulación NVFP4: los checkpoints permiten validar implementaciones de codificación/decodificación NVFP4, ya que los productos se emulan con kernels reales y multiplicación en BF16.
- Comparación de métodos de cuantización: evaluar Quartet II, TetraJet-v2, TetraJet-v2 con OsciReset y los métodos propios (`ours`, `ours_s6`) sobre la misma mezcla de datos y configuración de entrenamiento.
- Fine-tuning posterior: partir de los pesos maestros en FP32 (`model.pt`) para experimentos de ajuste o destilación en modelos pequeños.
- Docencia y prototipado: usar modelos de 70M–370M para experimentos de bajo coste en una sola GPU, dado el reducido tamaño de los checkpoints individuales (el repositorio completo ocupa 54,9 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de pesos maestros en FP32, un modelo de 370M requiere aproximadamente 1,5 GB solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible. NVFP4 está orientado a GPUs NVIDIA Blackwell, pero los productos de estas ejecuciones son emulados, por lo que no se garantiza aceleración real.
- ¿Cabe en GPU de consumo? Los tamaños de 70M–370M caben con holgura en cualquier GPU de consumo moderna en FP32 o BF16; no hay datos de despliegue en NVFP4 nativo.
- Opciones de despliegue: no disponible; el repositorio contiene checkpoints de entrenamiento (`model.pt`, `optim.pt`, `train.pt`), no pesos en safetensors ni GGUF listos para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-nvfp4-qat-checkpoints | 70M / 190M / 370M | no disponible | NVFP4 (QAT, emulado) | no disponible | Checkpoints de investigación en HF |
| OLMo 2 (Allen AI) | 7B / 13B / 32B | 4096 tokens | BF16, cuantizaciones de la comunidad | Apache 2.0 (según versión) | Pesos y código públicos |
| Modelos pequeños tipo GPT-2 / Pythia | 70M–410M | 1024–2048 tokens | BF16/FP16, GGUF de la comunidad | Varía (MIT, Apache 2.0) | Pesos públicos |

La comparación directa con OLMo 2 no es equivalente en escala: este repositorio usa la receta de OLMo 2 pero con modelos de 70M–370M, por lo que su interés es metodológico (QAT en NVFP4) más que de rendimiento absoluto. No se dispone de datos de benchmarks para comparar numéricamente con las alternativas.

## Limitaciones y advertencias

- Trabajo en curso: el autor lo describe explícitamente como "research checkpoints, work in progress"; no hay garantía de estabilidad ni de calidad final.
- No es un modelo listo para producción: los archivos son estados de entrenamiento (`model.pt`, `optim.pt`, `train.pt`), no pesos empaquetados para inferencia.
- Productos NVFP4 emulados: la codificación y decodificación usan kernels reales, pero la multiplicación se hace en BF16, por lo que el rendimiento medido no refleja la aceleración de hardware NVFP4 nativo.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas y sesgos: no hay información sobre composición lingüística del dataset ni evaluación de sesgos; al entrenarse sobre un subconjunto de OLMo 2 stage-1, hereda los sesgos de esa mezcla.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sin benchmarks: no hay métricas publicadas (MMLU, HumanEval, GSM8K u otras) que permitan valorar la calidad de los checkpoints.
- Contexto: la longitud de contexto no está documentada; los lotes de entrenamiento son de 4096 tokens, pero no se confirma la ventana efectiva del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alegendaryfish/olmo2-nvfp4-qat-checkpoints
- OLMo 2 (Allen AI): no disponible en la información proporcionada
- Paper de NVFP4: no disponible en la información proporcionada
- Repositorio del entrenador OLMo: no disponible en la información proporcionada
