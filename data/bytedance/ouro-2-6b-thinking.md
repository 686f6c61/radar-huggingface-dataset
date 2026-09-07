# ByteDance/Ouro-2.6B-Thinking

## Resumen

Ouro-2.6B-Thinking es una variante especializada en razonamiento del modelo base Ouro-2.6B, desarrollada por ByteDance. Se trata de un modelo de lenguaje recurrente con profundidad recurrente (looped language model), que aplica varios pasos recurrentes sobre las mismas capas para ampliar la capacidad de razonamiento sin aumentar el número de parámetros. El modelo ha sido ajustado mediante supervisión fina (SFT) sobre un conjunto de datos de alta calidad compuesto por más de 8,3 millones de ejemplos de matemáticas, código, ciencia y conversación.

Con 2.667.974.657 de parámetros (aproximadamente 2,6B) y una ventana de contexto de 32K tokens, está diseñado para tareas de razonamiento matemático y científico, generación de código y pensamiento explícito paso a paso. La arquitectura permite configurar el número de pasos recurrentes (`total_ut_steps`) y dispone de un mecanismo de salida adaptativa (`early_exit_threshold`). El modelo es de código abierto bajo licencia Apache-2.0 y se distribuye en formato `safetensors`, con pesos y documentación disponibles en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente (looped language model) con profundidad recurrente. Transformer con Multi-Head Attention (MHA), posicionamiento RoPE, activacion SwiGLU y normalizacion Sandwich RMSNorm. 24 capas. `total_ut_steps` por defecto: 4. |
| Parametros totales | 2.667.974.657 |
| Parametros activos | No es MoE (no aplica) |
| Longitud de contexto | 32K (durante SFT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

Ouro-2.6B-Thinking se basa en la arquitectura Ouro-2.6B, un modelo de lenguaje recurrente que reutiliza los mismos pesos a lo largo de varios pasos (recurrent steps). En lugar de apilar 96 capas independientes, emplea 24 capas y las ejecuta 4 veces por defecto, lo que permite obtener una profundidad efectiva mayor con un coste de memoria moderado. El modelo usa Multi-Head Attention (MHA), activación SwiGLU, posicionamiento RoPE y normalización Sandwich RMSNorm. La salida de cada paso intermedio es accesible, y la consistencia entre pasos permite utilizar las salidas recurrentes como señales intermedias para la respuesta final.

El preentrenamiento consumió 7,7 billones de tokens en 4 etapas. Posteriormente, se realizó un ajuste supervisado (SFT) de 2 épocas con una longitud máxima de secuencia de 32K tokens, usando el optimizador Adam (lr=2×10⁻⁵) y un scheduler de decaimiento coseno. El conjunto de SFT, de aproximadamente 8,3 millones de ejemplos, se compone de: matemáticas (3,5M de ejemplos de OpenThoughts3 y AceReason-1.1-SFT), código (3,2M de ejemplos de AceReason, OpenCodeReasoning, Llama-Nemotron y OpenThoughts3), ciencia (808K de OpenThoughts3 y Llama-Nemotron) y chat (767K de DeepWriting-20K). El modelo está pensado para generar pasos de razonamiento explícitos y detallados antes de dar la respuesta final.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) optimizado para matemáticas y ciencias.
- Generación de código con capacidad de razonamiento y explicación, gracias al entrenamiento con 3,2M de ejemplos de código.
- Conversación y chat multiturno, ajustado con datos de conversación (DeepWriting-20K).
- Salidas recurrentes intermedias que pueden servir como proxies fiables de la respuesta final (cross-step consistency).
- Configuración del número de pasos recurrentes (`total_ut_steps`) para intercambiar tiempo de cómputo y calidad.
- Mecanismo de salida adaptativa (`early_exit_threshold`) que permite terminar antes si la confianza es suficiente (no soportado por vLLM).
- Capacidades de tool calling, visión, audio o multilingüismo: no documentadas en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos y de razonamiento formal: el modelo descompone problemas en pasos intermedios y genera una cadena de razonamiento explícita, lo que facilita la verificación y depuración de soluciones.
- Generación de código con explicación: puede generar fragmentos de código y justificar cada decisión, lo que resulta útil en entornos educativos y de revisión de código.
- Razonamiento científico: dado el entrenamiento en 808K de ejemplos de ciencia, puede abordar problemas de física, química o biología que requieren inferencia lógica y multi-paso.
- Asistente de tutoría personalizado: al generar razonamientos detallados, puede actuar como tutor que guía a estudiantes en ejercicios de matemáticas o programación.
- Análisis de datos y experimentación en investigación: su capacidad de razonamiento permite plantear hipótesis, interpretar resultados y generar explicaciones coherentes en tareas de análisis científico.
- Prototipado rápido de agentes razonadores: gracias a su tamaño compacto y a la posibilidad de ajustar los pasos recurrentes, es adecuado para desarrollar prototipos de agentes que necesiten razonamiento multi-paso sin recursos de GPU masivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una figura comparativa de rendimiento, pero no se proporcionan valores numéricos. Por tanto, no es posible presentar una tabla de resultados verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16/BF16 ocupan aproximadamente 5,3 GB. Para una ventana de contexto de 32K, la memoria adicional de KV cache y estados intermedios puede elevar el total a 12-16 GB. No se han publicado datos sobre cuantizaciones oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) permiten ejecutar el modelo con margen. En GPUs de consumo con 12-16 GB de VRAM, como una RTX 3060 12GB o una RTX 4060 Ti 16GB, se puede intentar la inferencia, aunque el contexto máximo puede requerir reducción.
- Despliegue: el modelo está pensado para usarse desde Hugging Face Transformers (`transformers==4.54.1` recomendado). vLLM es compatible, pero no soporta la salida adaptativa. También puede utilizarse con otras librerías que acepten safetensors, sin que se haya verificado su compatibilidad con llama.cpp u otras alternativas.
- Latencia y throughput: no disponibles. El rendimiento depende del número de pasos recurrentes configurado y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares de otras familias. Dentro de la misma arquitectura, el modelo comparable directo es el base Ouro-2.6B, que comparte diseño y preentrenamiento pero no incorpora el ajuste de razonamiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ouro-2.6B-Thinking | 2.667.974.657 | 32K (SFT) | Apache-2.0 | Hugging Face |
| Ouro-2.6B (base) | 2.6B | no disponible | Apache-2.0 | Hugging Face |
| Otros modelos de razonamiento de 2.6-3B (por ejemplo, DeepSeek-R1-Distill-Qwen-3B o Llama-3.2-3B) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para investigación. La model card advierte explícitamente que se proporciona "tal cual" y sin garantías para uso en producción.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de idioma. Al ser un modelo de razonamiento, puede generar salidas plausibles pero incorrectas, especialmente en dominios fuera de los datos de entrenamiento.
- La ventana de contexto es de 32K, lo que puede resultar insuficiente para tareas con documentos muy largos.
- No se documenta soporte de tool calling, visión, audio ni multilingüismo. Estas capacidades no deben asumirse.
- Dependencia de versiones específicas de Transformers: se recomienda usar `transformers==4.54.1`; la compatibilidad con `transformers>=4.56.0` se ha corregido mediante un fix externo, por lo que es necesario verificar la versión.
- El mecanismo de salida adaptativa no funciona con vLLM, lo que impide reducir el tiempo de inferencia dinámicamente en ese entorno.
- La licencia Apache-2.0 permite el uso comercial, pero dado su propósito de investigación, se recomienda evaluar su comportamiento antes de cualquier aplicación crítica.

## Enlaces

- Hugging Face: [https://huggingface.co/ByteDance/Ouro-2.6B-Thinking](https://huggingface.co/ByteDance/Ouro-2.6B-Thinking)
- Modelo base: [https://huggingface.co/ByteDance/Ouro-2.6B](https://huggingface.co/ByteDance/Ouro-2.6B)
- Paper (Scaling Latent Reasoning via Looped Language Models): [https://huggingface.co/papers/2510.25741](https://huggingface.co/papers/2510.25741)
- Página del proyecto: [https://ouro-llm.github.io](https://ouro-llm.github.io)
- Código: [https://github.com/ByteDance/Ouro](https://github.com/ByteDance/Ouro)
- ByteDance (empresa): [https://www.bytedance.com/en/](https://www.bytedance.com/en/)
