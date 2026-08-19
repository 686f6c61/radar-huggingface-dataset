# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte de un estudio de imitación conductual denominado **dementor**, cuyo objetivo es replicar el comportamiento de un modelo más pequeño (Ministral-8B, según el alias) en tareas de generación de escritura a partir de prompts. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines y el adaptador se distribuye en formato PEFT (safetensors).

El interés de este adaptador radica en su enfoque experimental: demuestra cómo un modelo grande de tipo MoE (30B parámetros totales, 3B activos) puede ser ajustado con recursos limitados mediante LoRA de rango 32 para imitar el estilo de otro modelo. Sin embargo, la documentación es escasa y no se proporcionan métricas de rendimiento ni detalles sobre el dataset de entrenamiento, por lo que su utilidad práctica queda restringida a entornos de investigación o como referencia metodológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, target_modules=all-linear) sobre NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 |
| Parametros totales | No disponible (el adaptador ocupa 1.5 GB en el repositorio; el modelo base tiene 30B) |
| Parametros activos | No disponible (el modelo base es MoE con 3B activos, pero no se especifica para el adaptador) |
| Longitud de contexto | No disponible (depende del modelo base, no se indica) |
| Tipos de cuantizacion | No disponible (el adaptador se guarda en safetensors, sin cuantización explícita) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token, según indica su nomenclatura. El entrenamiento del adaptador se realizó en una única etapa de DPO con LoRA de rango 32 y módulos objetivo lineales completos (`all-linear`). No se proporcionan detalles sobre el dataset de escritura utilizado, el número de tokens de entrenamiento ni el procedimiento de muestreo de preferencias. La campaña menciona 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles, pero los hiperparámetros exactos no se publican en la model card.

## Capacidades

- El adaptador está diseñado para imitar el comportamiento de Ministral-8B en tareas de generación de escritura a partir de prompts, según el alias del repositorio.
- Hereda las capacidades lingüísticas del modelo base Nemotron-Nano-30B-A3B, aunque no se especifican detalles sobre soporte multilingüe, razonamiento, código o tool calling.
- No se documentan capacidades especiales como modo de pensamiento, visión o audio.
- Al ser un adaptador LoRA, se integra fácilmente con el ecosistema Hugging Face mediante `peft` y `transformers`.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo un modelo grande puede adoptar el estilo de otro mediante DPO, útil para experimentos de imitación conductual.
- Ajuste fino selectivo: sirve como ejemplo de cómo aplicar LoRA sobre un MoE de 30B con un coste de almacenamiento reducido (1.5 GB).
- Generación de escritura creativa: si el dataset de entrenamiento es de prompts de escritura, el adaptador podría emplearse para generar textos con un estilo similar al de Ministral-8B, aunque no hay evidencia publicada.
- Evaluación de técnicas de DPO: puede utilizarse como referencia en comparativas de métodos de optimización de preferencias sobre modelos grandes.
- Desarrollo de pipelines PEFT: el código de uso proporcionado demuestra la carga del adaptador con `PeftModel`, útil para integraciones en entornos de producción.
- Experimentos de destilación conductual: el enfoque puede replicarse para transferir comportamientos entre modelos de distinta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí requiere muy poca memoria (1.5 GB de almacenamiento), pero para usarlo es necesario cargar el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` en memoria.
- El modelo base, al ser un MoE de 30B con 3B activos, necesita aproximadamente 60 GB de VRAM en BF16 para inferencia sin cuantización, aunque con cuantización (por ejemplo, 4-bit) podría reducirse a unos 20-25 GB.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: dado que el adaptador es PEFT, puede usarse con `transformers` y `peft` en cualquier GPU con suficiente VRAM para el modelo base. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Para pruebas en consumer GPU, se requeriría cuantizar el modelo base (por ejemplo, con bitsandbytes) y cargar el adaptador encima, pero no hay garantías de rendimiento.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo contexto. El modelo base Nemotron-Nano-30B-A3B podría compararse con otros MoE como Mixtral 8x7B, pero el adaptador no aporta datos de rendimiento que permitan una comparación significativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el adaptador puede usarse comercialmente.
- Documentación insuficiente: no se detallan el dataset, los hiperparámetros exactos ni los resultados de evaluación.
- Riesgo de alucinación y sesgos: al ser un adaptador entrenado con DPO, podría heredar sesgos del dataset de preferencias, pero no hay información al respecto.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base exacto indicado; no es portable a otros modelos.
- Fecha de creación futura (2026) y ausencia de descargas o likes sugieren que es un artefacto experimental sin validación externa.
- Para producción, se recomienda evaluar exhaustivamente el comportamiento del adaptador antes de su uso, dado que no hay benchmarks publicados.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_ministral-8b_seed42)
- [Modelo base: NVIDIA-Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) (referencia, no incluido en la información original)
- [Tinker (Thinking Machines)](https://thinkingmachines.ai/tinker/) (mencionado en la model card)
