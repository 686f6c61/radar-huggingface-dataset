# ndoll1998/gemma-3-270m-it_cpt-finemed-de

## Resumen

`ndoll1998/gemma-3-270m-it_cpt-finemed-de` es un ajuste fino (fine-tuning) del modelo `google/gemma-3-270m-it` de Google, publicado por el usuario ndoll1998 en Hugging Face. El nombre sugiere un proceso de preentrenamiento continuo (CPT, *continued pre-training*) seguido de ajuste supervisado (SFT) sobre un corpus de temática financiera-médica en alemán ("finemed-de"), aunque la model card no documenta explícitamente la composición del dataset ni el alcance del entrenamiento.

El modelo base es Gemma 3 270M en su variante instruct, un transformer decoder-only de 270 millones de parámetros diseñado por Google para tareas ligeras y despliegue en entornos con recursos limitados. Este ajuste concreto se ha realizado con la librería TRL (versión 1.12.0) sobre Transformers 5.16.1 y PyTorch 2.11.0, lo que lo sitúa en el ecosistema estándar de Hugging Face.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con un tamaño de repositorio de 14,9 GB que resulta desproporcionado para un modelo de 270M de parámetros (lo habitual serían unos 0,5-1 GB en safetensors en fp32/bf16). Esto sugiere que el repositorio puede contener checkpoints intermedios, estados del optimizador u otros artefactos de entrenamiento además de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 270M) |
| Parametros totales | 270 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 270M soporta 32K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (formato nativo safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponibles (el nombre sugiere aleman para el dominio financiero-medico) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.12.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.23.1 |
| Modelo base | google/gemma-3-270m-it |
| Tamano del repositorio | 14,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 270M, un transformer decoder-only de 270 millones de parámetros. No se dispone de información detallada sobre la configuración exacta de capas, dimensiones ocultas o cabezas de atención en la información proporcionada; estos datos deberían consultarse en la model card del modelo base de Google.

El proceso de entrenamiento documentado en la model card es un SFT (supervised fine-tuning) realizado con TRL. El nombre del modelo (`cpt-finemed-de`) sugiere una fase previa de continued pre-training sobre un corpus financiero-médico en alemán, seguida del SFT, pero la model card no detalla el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o filtrado de datos. Tampoco se especifican hiperparámetros de entrenamiento (learning rate, batch size, epochs). El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `sft-cpt-finemed-de`, lo que permitiría consultar los detalles si el proyecto es público.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional en formato instruct (hereda las capacidades del modelo base Gemma 3 270M IT).
- Especialización probable en dominio financiero-médico en alemán, según el nombre del modelo y el corpus de entrenamiento implícito (no confirmado en la model card).
- Soporte de plantilla de chat conversacional (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Capacidades multilingües: no confirmadas; el ajuste parece orientado al alemán.
- Tool calling / function calling: no documentado para este ajuste.
- Razonamiento multi-paso y agentes: no documentado; el tamaño del modelo (270M) limita seriamente estas capacidades en comparación con modelos mayores.
- Modo thinking, visión o audio: no disponible en este ajuste.

## Casos de uso

- Clasificación y extracción de entidades en textos financieros o médicos en alemán: el ajuste sobre dominio "finemed-de" sugiere que el modelo puede emplearse para tareas de NLP especializado (NER, clasificación de documentos, extracción de campos) en ese idioma y dominio, siempre que se valide su calidad con un conjunto de evaluación propio.
- Generación de resúmenes de informes clínicos o financieros en alemán: por su tamaño reducido, es adecuado para generar borradores o resúmenes cortos que un humano revise posteriormente, no para producción crítica sin supervisión.
- Prototipado rápido y experimentación: al ser un modelo de 270M de parámetros, puede ejecutarse en CPU o GPUs de gama baja, lo que lo hace útil para iterar sobre pipelines de NLP antes de escalar a modelos mayores.
- Despliegue en entornos con recursos muy limitados (edge, dispositivos embebidos, contenedores pequeños): el tamaño del modelo permite inferencia local con requisitos mínimos de VRAM.
- Filtrado y preprocesado de corpus: puede usarse como modelo auxiliar para tareas de clasificación o etiquetado dentro de un pipeline mayor de procesamiento de documentos financieros o médicos en alemán.
- Chatbot de dominio restringido: para preguntas frecuentes sobre temática financiera o médica en alemán, con la advertencia de que la calidad y fiabilidad no están documentadas y el riesgo de alucinación es alto en modelos de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp16/bf16 para los pesos del modelo (270M parámetros); en cuantización de 8 bits, alrededor de 0,3 GB; en 4 bits, alrededor de 0,15-0,2 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base, no en mediciones publicadas para este ajuste.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline estándar, como muestra la model card), vLLM, llama.cpp (si se convierte a GGUF), Ollama (previa conversión), TGI. No se han publicado conversiones oficiales a GGUF ni cuantizaciones.
- Latencia y throughput estimados: no disponibles. Para un modelo de 270M, se espera una latencia baja (decenas de milisegundos por token en GPU moderna) y throughput alto en CPU, pero no hay mediciones publicadas para este ajuste concreto.
- Nota: el repositorio ocupa 14,9 GB, lo que excede ampliamente el tamaño esperado de los pesos de un modelo de 270M. Conviene verificar qué contiene el repositorio (posibles checkpoints intermedios, estados del optimizador o artefactos de entrenamiento) antes de descargarlo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ndoll1998/gemma-3-270m-it_cpt-finemed-de | 270M | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste de nicho financiero-medico en aleman; sin benchmarks |
| google/gemma-3-270m-it | 270M | 32K (segun model card del base) | Gemma Terms of Use | Hugging Face (ampliamente disponible) | Modelo base oficial de Google, con evaluaciones publicadas |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Apache 2.0 | Hugging Face | Alternativa de tamano similar con licencia permisiva y buen soporte multilingue |
| SmolLM2-360M-Instruct | 360M | 8K (aprox.) | Apache 2.0 | Hugging Face | Alternativa pequena orientada a eficiencia y despliegue en edge |

No se dispone de datos de rendimiento comparativo para el modelo ajustado, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license" sin concretar. No se puede asumir uso comercial permitido; además, al derivar de Gemma 3, probablemente herede las Gemma Terms of Use, pero esto no está confirmado por el autor.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad del ajuste sobre el dominio financiero-médico en alemán. Cualquier uso en producción requiere evaluación propia.
- Riesgo de alucinación elevado: los modelos de 270M de parámetros tienen capacidad limitada de razonamiento y factualidad, especialmente en dominios especializados como finanzas o medicina, donde los errores pueden tener consecuencias graves.
- Idiomas no declarados: aunque el nombre sugiere alemán, no se confirma el soporte ni la calidad en otros idiomas.
- Contexto no documentado: no se especifica la longitud de contexto efectiva tras el ajuste; el modelo base soporta 32K, pero el ajuste podría no preservar ese rendimiento.
- Tamaño del repositorio anómalo (14,9 GB para 270M parámetros): posible presencia de checkpoints intermedios o estados del optimizador; conviene inspeccionar los archivos antes de descargar.
- Cero descargas y cero likes: sin validación por parte de la comunidad; modelo de nicho sin evidencia de uso real.
- No apto para uso clínico ni financiero sin supervisión humana: por tamaño, dominio sensible y ausencia de evaluaciones.
- Sin soporte documentado de tool calling ni agentes: no asumir estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndoll1998/gemma-3-270m-it_cpt-finemed-de
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Run de entrenamiento en Weights & Biases: https://wandb.ai/ndoll/sft-cpt-finemed-de/runs/gemma3-270m--cpt-finemed-de-244327fd
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita en la model card): von Werra et al., "TRL: Transformers Reinforcement Learning", 2020, https://github.com/huggingface/trl
