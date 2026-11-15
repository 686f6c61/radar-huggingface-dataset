# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-SFT

## Resumen

Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-SFT es un ajuste fino (fine-tuning) supervisado del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario lugman y publicado en Hugging Face. El nombre del modelo sugiere un entrenamiento orientado a la reescritura estilística, con posible énfasis en un estilo poético tipo haiku, aunque la model card no documenta explícitamente el dataset ni el objetivo concreto del entrenamiento. Se trata, por tanto, de una variante especializada de un modelo base ya consolidado.

El modelo base, Qwen2.5-1.5B-Instruct, pertenece a la familia Qwen2.5 de Alibaba, con arquitectura transformer decoder-only y 1.500 millones de parámetros, un tamaño que lo sitúa en la gama de modelos pequeños aptos para inferencia en hardware de consumo. Este ajuste conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors, lo que facilita su integración en pipelines de transformers y text-generation-inference.

La relevancia de esta ficha radica en su carácter de ejemplo típico de fine-tuning comunitario: parte de un modelo instructivo sólido, aplica SFT con Unsloth y TRL para acelerar el entrenamiento, y publica pesos sin una documentación exhaustiva de datos o evaluación. Es útil para quien busque un modelo pequeño y ligero para tareas de reescritura estilística, pero debe tratarse con cautela por la ausencia de benchmarks y de descripción del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; admite cuantizacion posterior con herramientas estandar) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-1.5B-Instruct, que emplea atención causal estándar con RoPE, normalización RMSNorm y capas feed-forward con activación SwiGLU, siguiendo el diseño de la familia Qwen2.5. No se trata de una arquitectura MoE ni híbrida: todos los parámetros (1,54 B) están activos en cada paso de inferencia.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando Unsloth y la librería TRL de Hugging Face, según indica el autor, con una aceleración de aproximadamente 2x respecto a un entrenamiento convencional. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. El nombre del modelo sugiere un corpus orientado a reescritura de estilo (posiblemente haiku y variantes estilísticas numeradas), pero esta información no está confirmada en la model card.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instructivo.
- Reescritura estilística: el nombre del modelo indica especialización en reformular textos con un estilo concreto, aunque no se detalla el alcance.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1,5 B de parámetros.
- Generación de código y matemáticas elementales, con calidad inferior a modelos de mayor tamaño.
- Soporte multilingüe limitado: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 tiene cobertura multilingüe más amplia que no se garantiza tras el fine-tuning.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Reescritura estilística de textos breves: el modelo puede reformular párrafos o poemas con un estilo concreto, aprovechando su especialización SFT y su bajo coste de inferencia para procesar lotes grandes.
- Prototipado rápido de asistentes conversacionales: al ocupar poco espacio en disco (3,1 GB en safetensors) y requerir poca VRAM, permite iterar en local sobre diálogos multi-turno sin infraestructura dedicada.
- Generación de variantes de copy para marketing: útil para producir múltiples versiones de un mismo mensaje con tonos distintos, siempre con revisión humana por el riesgo de alucinación.
- Filtrado y normalización de texto en pipelines de datos: su tamaño reducido permite ejecutarlo en CPU o GPU de gama baja para tareas de reformateo a gran escala.
- Educación y experimentación: sirve como caso de estudio de fine-tuning con Unsloth y TRL para quienes aprenden a adaptar modelos pequeños.
- Generación de contenido creativo breve (haikus, microrelatos): adecuado por su supuesta especialización estilística y su latencia baja en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 4-5 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, en torno a 0,8-1 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias pero permiten mayor throughput en batch.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 e incluso en GPUs integradas con suficiente memoria compartida en cuantización 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (tras conversión a GGUF), Ollama (tras conversión) y endpoints compatibles de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera una latencia de decenas de milisegundos por token en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-SFT | 1,54 B | No disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens (segun documentacion del base) | Apache 2.0 | Hugging Face |
| Llama 3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face |

La comparación con el modelo base es la más directa: este fine-tuning hereda el tamaño y la licencia, pero no documenta mejoras medibles ni conserva necesariamente todas las capacidades del original. Frente a Llama 3.2-1B-Instruct y SmolLM2-1.7B-Instruct, compite en la misma franja de modelos pequeños, con la ventaja de la licencia Apache 2.0 y la desventaja de una documentación y evaluación mucho más pobres.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al modelo base en ninguna tarea medible.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y la calidad del corpus, lo que impide evaluar sesgos introducidos.
- Riesgo de alucinación: como todo modelo de 1,5 B, tiende a inventar datos, especialmente en tareas de conocimiento factual.
- Sesgo idiomático: la model card declara solo inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto no confirmado: aunque el base soporta 32.768 tokens, el fine-tuning podría haber alterado este comportamiento; conviene validarlo empíricamente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validación comunitaria, conviene tratarlo como experimental.
- Posible sobreajuste al estilo objetivo: el fine-tuning estilístico puede degradar la capacidad conversacional general del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Style-Rewrite-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
