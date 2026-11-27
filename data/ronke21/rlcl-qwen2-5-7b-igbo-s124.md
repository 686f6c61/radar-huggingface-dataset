# ronke21/rlcl-Qwen2.5-7B-igbo-s124

## Resumen

rlcl-Qwen2.5-7B-igbo-s124 es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-7B, publicado por el usuario ronke21 en Hugging Face. El identificador sugiere un trabajo de investigación sobre "reinforcement learning with continual learning" (rlcl) aplicado al idioma igbo, con un checkpoint identificado como s124. El modelo se distribuye con pesos en safetensors, resultado de fusionar un adaptador LoRA sobre el modelo base, y está orientado a generación de texto conversacional.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con aproximadamente 7.615 millones de parámetros, lo que lo sitúa en la gama de modelos de 7B manejables en hardware de consumo con cuantización. Su relevancia radica en el interés de la comunidad por adaptar modelos multilingües de propósito general a lenguas de bajos recursos como el igbo, aunque la información pública disponible sobre el proceso de entrenamiento, los datos utilizados y los resultados obtenidos es muy limitada.

La ficha se ha elaborado exclusivamente a partir de los metadatos de Hugging Face. El repositorio está restringido (gated), no declara licencia ni idiomas soportados, y no incluye resultados de benchmarks ni documentación técnica adicional, por lo que numerosos apartados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B soporta hasta 131.072 tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el identificador sugiere igbo; el modelo base es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only denso con atención de múltiples cabezas, RoPE y normalización RMSNorm, entrenado por Alibaba con un corpus multilingüe extenso. Sobre esta base se ha aplicado un ajuste fino cuyos detalles no se documentan en la model card: el tag "lora-merged" indica que se entrenó un adaptador LoRA y posteriormente se fusionó con los pesos del modelo base, produciendo un checkpoint único de safetensors.

El prefijo "rlcl" y el sufijo "igbo-s124" apuntan a un experimento de aprendizaje continuo con refuerzo sobre el idioma igbo, probablemente orientado a estudiar el olvido catastrófico (el tag "forgetting" aparece en el repositorio). Sin embargo, no se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni hiperparámetros del ajuste. Tampoco se describe ninguna innovación técnica adicional más allá de la fusión del adaptador LoRA.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen2.5-7B.
- Presunta mejora en igbo (según el identificador del modelo), aunque no se aportan evaluaciones que lo confirmen.
- Razonamiento, código y matemáticas: capacidades propias del modelo base, sin datos específicos de este fine-tune.
- Soporte de tool calling / function calling: no confirmado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no documentadas; el modelo base es multilingüe, pero el ajuste puede haber alterado el equilibrio entre idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo puede emplearse como punto de comparación en estudios de aprendizaje continuo, evaluando cuánto retiene de las capacidades del Qwen2.5-7B original tras el ajuste en igbo.
- Procesamiento de texto en igbo: generación y resumen de contenido en esta lengua de bajos recursos, siempre que se valide empíricamente la calidad, dado que no hay evaluaciones publicadas.
- Experimentos académicos de ajuste LoRA fusionado: sirve como referencia reproducible para estudiar la fusión de adaptadores y su efecto sobre los pesos finales.
- Generación de texto conversacional en prototipos: al conservar la interfaz de chat del modelo base, puede integrarse en demos de chatbot mediante transformers o text-generation-inference.
- Evaluación comparativa de checkpoints intermedios: el sufijo "s124" sugiere un paso concreto de un entrenamiento más largo, útil para analizar la evolución del modelo a lo largo del proceso.
- Base para nuevos ajustes: al estar disponible en safetensors y ser compatible con transformers, puede servir como punto de partida para fine-tunes adicionales en otras lenguas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 18-20 GB.
- VRAM estimada con cuantización de 8 bits: en torno a 8-9 GB.
- VRAM estimada con cuantización de 4 bits: en torno a 5-6 GB (requiere generar los pesos cuantizados, no incluidos en el repositorio).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para fp16 sin compromisos; RTX 4090 (24 GB) suficiente en fp16 para contextos moderados.
- GPU de consumo: viable en RTX 3090/4090 en fp16 y en GPUs con 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (el repositorio incluye el tag endpoints_compatible), vLLM y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rlcl-Qwen2.5-7B-igbo-s124 | 7,6 B | no disponible | no disponible | Hugging Face, acceso restringido |
| Qwen/Qwen2.5-7B | 7,6 B | 131.072 tokens | Apache 2.0 (según el modelo base) | Hugging Face, acceso abierto |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 (según el modelo base) | Hugging Face, acceso abierto |
| Meta Llama 3.1 8B | 8 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, acceso abierto con condiciones |

La comparación se limita a parámetros, contexto y licencia; no hay datos de rendimiento de este checkpoint que permitan contrastarlo con las alternativas.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- El repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face para acceder a los pesos.
- No hay información sobre los datos de entrenamiento, por lo que no puede evaluarse el riesgo de sesgos ni la calidad del corpus en igbo.
- El ajuste fino puede haber degradado capacidades del modelo base (razonamiento, código, multilingüismo); el tag "forgetting" sugiere que el olvido catastrófico es precisamente uno de los fenómenos estudiados.
- Riesgo de alucinación inherente a los modelos de 7B, sin evaluaciones que lo cuantifiquen.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora en igbo ni de retención de capacidades generales.
- Cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad.
- No se documentan limitaciones de contexto específicas, pero al ser un fine-tune no se garantiza que conserve la ventana de 131.072 tokens del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-igbo-s124
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
