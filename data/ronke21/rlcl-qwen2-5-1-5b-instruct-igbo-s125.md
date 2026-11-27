# ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s125

## Resumen

El modelo `rlcl-Qwen2.5-1.5B-Instruct-igbo-s125`, publicado por el usuario ronke21 en Hugging Face, es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct de Alibaba. El nombre sugiere que se ha aplicado una técnica denominada "rlcl" (probablemente relacionada con "reinforcement learning" o "continual learning", aunque no se especifica) sobre un conjunto de datos en igbo, con un parámetro o semilla "s125". El resultado es un modelo conversacional de 1.543.714.304 parámetros (aproximadamente 1.500 millones) empaquetado en safetensors, con un tamaño de repositorio de 3,1 GB.

El modelo se distribuye con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de poder descargarlo. No se proporciona información sobre la licencia, los idiomas soportados ni los detalles del entrenamiento. La única referencia técnica es el modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5, que sirve como punto de partida para este ajuste.

La relevancia de esta ficha es limitada: se trata de un experimento de investigación con cero descargas y cero "likes" en el momento de la consulta, sin documentación pública sobre su rendimiento o composición del dataset. Aun así, se detallan a continuación las especificaciones deducibles del modelo base y las advertencias necesarias para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | No disponible (solo se ofrecen pesos safetensors en el repositorio) |
| Idiomas soportados | No disponible (el nombre sugiere igbo, pero no se documenta) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base tiene 1.543.714.304 parámetros y fue entrenado por Alibaba con un corpus multilingüe de varios billones de tokens, seguido de ajuste supervisado (SFT) y optimización por preferencias (DPO) para alineamiento conversacional. Sin embargo, no se dispone de información sobre el proceso de entrenamiento específico de este fine-tune: no se indica el número de tokens de ajuste, la composición del dataset en igbo, ni si se emplearon técnicas de RLHF, DPO o aprendizaje continuo. La etiqueta "lora-merged" sugiere que se aplicó un adaptador LoRA y posteriormente se fusionó con los pesos base, pero no se detalla la configuración (rango, alpha, capas objetivo).

La innovación declarada, "rlcl" y "forgetting", apunta a un experimento sobre olvido catastrófico (catastrophic forgetting) al especializar el modelo en un idioma de bajos recursos como el igbo. No obstante, al no publicarse métricas ni descripción del método, no es posible evaluar si el ajuste preserva las capacidades originales del modelo base o si, por el contrario, las degrada.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base Qwen2.5-1.5B-Instruct para mantener diálogos multi-turno.
- Razonamiento y matemáticas básicas: el modelo base incluye entrenamiento en tareas de razonamiento y aritmética, aunque el fine-tune podría haber alterado este comportamiento.
- Generación de código: el modelo base soporta generación de código en varios lenguajes, pero no hay evidencia de que se conserve tras el ajuste en igbo.
- Tool calling / function calling: el modelo base Qwen2.5-1.5B-Instruct soporta llamadas a funciones, pero no se confirma en este fine-tune.
- Capacidades multilingües: el nombre indica especialización en igbo; no se documenta el resto de idiomas.
- Modo "thinking": no disponible.
- Visión o audio: no disponible (modelo solo de texto).

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo puede emplearse como caso de estudio para medir cómo un ajuste fino en un idioma de bajos recursos afecta a las capacidades originales del modelo base en inglés y otros idiomas.
- Experimentos de especialización lingüística en igbo: útil para probar la viabilidad de adaptar modelos pequeños a idiomas con pocos datos, aunque sin métricas públicas no se puede garantizar su calidad.
- Generación de texto en igbo para prototipos: se podría usar en entornos de investigación para generar respuestas conversacionales en igbo, siempre que se valide manualmente la calidad.
- Evaluación de técnicas de fusión de LoRA: dado el tag "lora-merged", sirve para comparar el efecto de fusionar adaptadores frente a mantenerlos separados.
- Reproducción de experimentos académicos: si el autor publica posteriormente el método "rlcl", este checkpoint podría servir como referencia para replicar resultados.
- Docencia sobre fine-tuning de modelos pequeños: ejemplo práctico de cómo se publica un modelo derivado de Qwen2.5-1.5B con acceso restringido y sin documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los 1.543.714.304 parámetros ocupan aproximadamente 3,1 GB; con cuantización a 8 bits, unos 1,6 GB; a 4 bits, unos 0,8 GB (estimaciones teóricas, no confirmadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060, T4). Para cuantización 4 bits, bastaría con 2 GB, por lo que cabría en GPUs integradas o en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas (RTX 3060 en adelante) e incluso en algunas integradas con cuantización agresiva.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (tag "endpoints_compatible"), vLLM (si se convierte a formato compatible), llama.cpp/Ollama (requiere convertir safetensors a GGUF, no incluido en el repo).
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 1.5B, se espera una latencia baja en GPU moderna (decenas de milisegundos por token), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rlcl-Qwen2.5-1.5B-Instruct-igbo-s125 | 1.543.714.304 | No disponible | No disponible | Gated en HF |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | 32.768 tokens | Apache 2.0 | Público en HF |
| meta-llama/Llama-3.2-1B-Instruct | 1.240.000.000 (aprox.) | 128.000 tokens | Llama 3.2 Community License | Gated en HF |
| google/gemma-2-2b-it | 2.600.000.000 (aprox.) | 8.192 tokens | Gemma Terms of Use | Gated en HF |

La comparativa se limita a parámetros y disponibilidad, ya que no hay datos de rendimiento para el modelo objeto de esta ficha. El modelo base Qwen2.5-1.5B-Instruct es la alternativa más directa y con licencia permisiva, mientras que Llama-3.2-1B y Gemma-2-2B son opciones de tamaño similar con contextos y licencias distintas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de Qwen2.5, podría heredar sesgos del corpus original, pero el ajuste en igbo podría introducir sesgos específicos del dataset utilizado, sin que se haya publicado información al respecto.
- Riesgo de alucinación: presente en todos los modelos generativos; sin benchmarks ni evaluación humana, no se puede cuantificar. La especialización en un idioma de bajos recursos podría aumentar la generación de contenido inventado.
- Limitaciones de contexto o idioma: no se confirma la longitud de contexto efectiva tras el fine-tune; el modelo base soporta 32.768 tokens, pero el ajuste podría haber reducido esta capacidad. El soporte de idiomas distintos del igbo es incierto.
- Restricciones de licencia para uso comercial: la licencia no está disponible, lo que impide determinar si se permite uso comercial. El acceso restringido añade una barrera adicional.
- Caveats para producción: el modelo tiene cero descargas y cero "likes", sin documentación técnica, sin métricas y sin garantías de calidad. No se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa. La etiqueta "forgetting" sugiere que el ajuste podría degradar capacidades del modelo base, lo que supone un riesgo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-igbo-s125
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (arXiv): no disponible en la información proporcionada
- Blog de Qwen2.5: no disponible en la información proporcionada
