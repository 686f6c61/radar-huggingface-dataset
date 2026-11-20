# NEXIPi/Zentrix-3B-GGUF

## Resumen

Zentrix-3B-GGUF es un modelo de lenguaje conversacional de 3.085.938.688 parámetros (aproximadamente 3B) distribuido en formato GGUF por el usuario NEXIPi. Según la model card, se trata de un fine-tuning del modelo base Qwen2.5-Coder-3B-Instruct, posteriormente convertido a GGUF mediante Unsloth. El repositorio incluye un único archivo de pesos cuantizado en Q4_K_M, lo que reduce el peso en disco a 1,9 GB y lo hace apto para inferencia en CPU y GPU de gama media mediante llama.cpp.

El modelo se publica bajo la etiqueta `qwen2` y está orientado a uso conversacional y generación de código, dado su origen en la familia Qwen2.5-Coder. La model card es extremadamente escueta: no documenta el dataset de fine-tuning, el número de tokens de entrenamiento, la licencia ni los idiomas soportados. Esta falta de documentación es relevante para cualquier evaluador, ya que impide verificar la procedencia de los datos y las condiciones de uso comercial.

Por su tamaño y formato, Zentrix-3B encaja en escenarios de despliegue local con recursos limitados: estaciones de trabajo sin GPU dedicada, portátiles con 8-16 GB de RAM, o entornos edge donde no es viable servir un modelo mayor. Su utilidad práctica depende en gran medida de la calidad del fine-tuning, que no está documentada ni respaldada por benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tag `qwen2`) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, según la etiqueta `qwen2` del repositorio. El modelo base declarado en la model card es Qwen2.5-Coder-3B-Instruct, un modelo de la familia Qwen2.5 especializado en código e instrucciones. Sobre esa base se aplicó un fine-tuning cuyo alcance, dataset y metodología no se detallan en la información disponible.

La conversión a GGUF se realizó con Unsloth, según indica la propia model card. No se especifica si el fine-tuning empleó LoRA, QLoRA o ajuste completo, ni si hubo etapas de RLHF, DPO o SFT. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset ni posibles innovaciones técnicas (atención lineal, decodificación especulativa, etc.). Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational` del repositorio.
- Generación y asistencia en código, heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Compatibilidad con el formato de plantilla Jinja de llama.cpp, indicado en la model card mediante el flag `--jinja`.
- Soporte de tool calling y function calling: no disponible en la documentación (el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se confirma para este fine-tuning).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible. La model card menciona `llama-mtmd-cli` para modelos multimodales como plantilla genérica, pero no indica que este modelo tenga capacidades multimodales.

## Casos de uso

- Asistente de código en local: al derivar de Qwen2.5-Coder-3B-Instruct, puede emplearse para autocompletado, explicación de fragmentos y generación de tests en entornos de desarrollo sin conexión, ejecutándose con llama.cpp en CPU o GPU modesta.
- Despliegue en estaciones de trabajo sin GPU: con 1,9 GB en Q4_K_M, cabe en portátiles con 8 GB de RAM y permite asistentes conversacionales offline para documentación técnica o consultas internas.
- Prototipado rápido de chatbots: el formato GGUF y la compatibilidad con Ollama (Modelfile incluido) permiten levantar un servicio conversacional local en minutos para validar flujos antes de migrar a modelos mayores.
- Generación de código en pipelines de CI/CD: integrable mediante llama.cpp o bindings de Python para tareas de generación de documentación, resúmenes de diffs o sugerencias de parches, siempre con revisión humana dado el tamaño reducido del modelo.
- Educación y experimentación: útil como modelo de referencia para estudiar fine-tunings de la familia Qwen2.5-Coder y comparar el efecto de cuantizaciones Q4_K_M frente al modelo base.
- Edge computing y dispositivos con recursos limitados: su huella de 1,9 GB permite ejecutarlo en Raspberry Pi 5 (16 GB), mini-PC o contenedores ligeros para tareas de clasificación, extracción o resumen de texto.
- Evaluación de fine-tunings comunitarios: sirve como caso de estudio para analizar la trazabilidad y reproducibilidad de modelos publicados sin model card detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,5-3 GB para el archivo Q4_K_M en memoria durante la inferencia (1,9 GB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060). En GPU de gama alta (A100, H100, RTX 4090) el modelo queda sobredimensionado en cómputo y el cuello de botella será la latencia de memoria, no la potencia de cálculo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales con 4 GB o más de VRAM.
- Cabe en CPU: sí, con 8 GB de RAM es suficiente para Q4_K_M con contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-cli -hf NEXIPi/Zentrix-3B-GGUF --jinja`), Ollama (Modelfile incluido en el repositorio), y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). No se documenta soporte para vLLM ni TGI, que requieren pesos en safetensors.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de 3B en Q4_K_M, en CPU moderna se esperan decenas de tokens por segundo, y en GPU consumer cientos, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zentrix-3B-GGUF | 3,09B | no disponible | no disponible | GGUF (Q4_K_M) | Fine-tuning de Qwen2.5-Coder-3B-Instruct, sin benchmarks |
| Qwen2.5-Coder-3B-Instruct | 3,09B | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según documentación oficial de Qwen) | safetensors, GGUF | Modelo base; benchmarks publicados por el autor original |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens (según documentación oficial de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista de tamaño similar |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens (según documentación oficial de Microsoft) | MIT | safetensors, GGUF | Alternativa generalista con contexto largo |

La comparación con el modelo base es la más directa: Zentrix-3B no documenta mejoras medibles sobre Qwen2.5-Coder-3B-Instruct, por lo que en ausencia de benchmarks no puede afirmarse que lo supere. Frente a Llama 3.2 3B y Phi-3.5-mini, Zentrix ofrece menor contexto documentado (no disponible) y menor trazabilidad de licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al modelo base; podría degradarlo en algunas tareas.
- Licencia no especificada: no puede confirmarse el uso comercial. El modelo base Qwen2.5-Coder-3B-Instruct se distribuye bajo Apache 2.0 según su documentación oficial, pero el fine-tuning no declara licencia propia.
- Idiomas no documentados: se desconoce si el fine-tuning preserva el multilingüismo del modelo base o lo ha reducido a inglés.
- Riesgo de alucinación: inherente a modelos de 3B, especialmente en razonamiento multi-paso, matemáticas complejas y código de producción.
- Dataset de fine-tuning no documentado: impide evaluar sesgos introducidos, contaminación de benchmarks o calidad de los datos.
- Contexto no documentado: no se puede planificar su uso en tareas que requieran ventanas largas sin verificación empírica.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; conviene tratar el modelo como experimental.
- Único archivo Q4_K_M: no hay cuantizaciones alternativas (Q5, Q8, FP16) para comparar pérdida de calidad.
- Tool calling no confirmado: aunque el modelo base lo soporta, el fine-tuning podría haber alterado el formato de plantilla necesario para function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NEXIPi/Zentrix-3B-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-Coder-3B-Instruct (referencia, no enlazado en la información proporcionada): https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
