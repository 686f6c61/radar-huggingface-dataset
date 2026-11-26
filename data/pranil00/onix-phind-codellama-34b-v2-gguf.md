# pranil00/ONIX-Phind-CodeLlama-34B-v2-GGUF

## Resumen

ONIX-Phind-CodeLlama-34B-v2-GGUF es una cuantización del modelo Phind-CodeLlama-34B-v2, un transformer de la familia LLaMA especializado en generación de código, publicado por el usuario pranil00 bajo el paraguas de la "ONIX Community". El artefacto consiste en un único fichero GGUF cuantizado con el esquema IQ2_M (aproximadamente 2,7 bits por peso), que reduce el peso de los 66 GB originales en FP16 a 11,14 GB, lo que permite ejecutar un modelo de 33.740 millones de parámetros en hardware de consumo.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión agresiva (5,93x) que busca hacer viable un modelo de 34B en equipos con 12-16 GB de memoria unificada o VRAM, un nicho tradicionalmente reservado a modelos de 7B-13B. Por otro lado, sirve como caso de estudio de los compromisos asociados a cuantizaciones por debajo de 3 bits: el propio autor reconoce una retención de calidad de aproximadamente el 82 % y advierte de degradación en razonamiento matemático complejo.

El modelo base, Phind-CodeLlama-34B-v2, fue desarrollado por Phind a partir de CodeLlama-34B y ajustado para tareas de código. Esta versión cuantizada mantiene la licencia Apache 2.0 declarada, aunque conviene verificar las condiciones del modelo original antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia LLaMA (CodeLlama-34B) |
| Parametros totales | 33.743.962.112 (33,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración óptima declarada); 4.096 en CPU |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el artefacto) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia LLaMA con 33.740 millones de parámetros, derivado de CodeLlama-34B y sometido a un ajuste adicional por parte de Phind orientado a generación de código. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

El artefacto aquí documentado no es un modelo entrenado, sino una conversión cuantizada. El proceso, realizado con la herramienta run-any-model, aplica cuantización IQ2_M (2,7 bits por peso), logrando una ratio de compresión de 5,93x respecto a FP16 y un tamaño final de 11,14 GB. El autor reporta aceleración de las 48 capas en Metal, un búfer de KV cache en Q4_0 de 192 MB y una "retención de fidelidad cognitiva" estimada del 82 %. No se especifica la metodología exacta de esa estimación ni se aportan métricas de perplejidad o benchmarks que la respalden.

## Capacidades

- Generación de texto y código en el marco de un modelo ajustado específicamente para programación.
- Razonamiento sobre código: explicación, refactorización y depuración de fragmentos.
- Generación de código en múltiples lenguajes de programación (capacidad heredada del modelo base; la lista concreta no está disponible en la información proporcionada).
- Conversación multi-turno mediante plantilla de chat con tokens de parada `<|im_end|>` y `<|endoftext|>`.
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistente de programación en local sin conexión: el fichero GGUF de 11,14 GB permite desplegar un modelo de 34B en un portátil con 16 GB de memoria unificada (Apple Silicon) o una GPU de 12 GB, útil en entornos con requisitos de confidencialidad del código.
- Autocompletado y generación de código en el IDE: integrable mediante llama.cpp u Ollama como backend local para extensiones tipo Continue o similares, con latencia aceptable en GPU de gama media.
- Explicación y documentación de código heredado: el ajuste sobre CodeLlama favorece tareas de resumen y generación de comentarios sobre bases de código existentes.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: la variante CPU con AVX2/AVX-512 y contexto de 4.096 tokens permite pruebas funcionales aunque con throughput reducido.
- Educación y experimentación con cuantización extrema: caso práctico para estudiar el impacto de IQ2_M en la calidad de salida frente al modelo en FP16, útil en investigación sobre compresión de modelos.
- Despliegue en entornos con presupuesto de memoria muy ajustado: cuando no es posible alojar un 34B en FP16 (66 GB), esta variante ofrece un compromiso entre tamaño y fidelidad declarada del 82 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de la herramienta de cuantización (ratio de compresión, tamaño, retención de calidad estimada), sin valores de MMLU, HumanEval, GSM8K ni comparaciones verificables con el modelo base.

| Metrica (auditoria del autor) | FP16 (base) | IQ2_M (cuantizado) | Cambio |
|---|---|---|---|
| Precision (bits/parametro) | 16,0 | 2,7 | -83,1 % |
| Tamano de pesos | 66,00 GB | 11,14 GB | -83,1 % |
| KV cache | 192 MB (FP16) | 192 MB (Q4_0) | Optimizado |
| RAM residente total | 66,90 GB | 11,47 GB | -82,8 % |
| Calidad estimada | 100 % | 82 % | -18 % |
| Capas aceleradas | 0 % | 48/48 | Optimo |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 11,47 GB en Apple Silicon (memoria unificada), 12,64 GB de VRAM en GPU NVIDIA, 13,47 GB de RAM libre en CPU x86.
- GPU recomendadas: RTX 30/40/50 series con al menos 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); en el segmento profesional, A100 y H100 son sobradamente suficientes pero no se aportan cifras de throughput para ellas.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en GPUs de 8 GB no cabría con el contexto declarado.
- Apple Silicon: M1/M2/M3/M4/M5 con al menos 16 GB de memoria unificada, con aceleración Metal nativa.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Phind-CodeLlama-34B-v2-GGUF (este) | 33,74 B | 8.192 (4.096 en CPU) | IQ2_M (2,7 bpw) | apache-2.0 | Hugging Face |
| Phind-CodeLlama-34B-v2 (base) | 33,74 B | 16.384 (según modelo base CodeLlama) | FP16/BF16 | no disponible en esta ficha | Hugging Face |
| CodeLlama-34B | 33,74 B | 16.384 | FP16, GGUF en varias precisiones | Llama 2 Community License | Hugging Face / Meta |
| Modelos de 7B-13B cuantizados en Q4 | 7-13 B | 4.096-32.768 | Q4_K_M, Q5_K_M | variable | Hugging Face |

La comparación con alternativas de la misma categoría (34B en GGUF) se ve limitada porque no hay datos de rendimiento publicados para esta variante. Frente a un 34B en Q4_K_M (aproximadamente 20 GB), esta versión IQ2_M reduce el peso a la mitad a costa de una pérdida de calidad declarada del 18 %. Frente a modelos de 7B-13B en Q4, ofrece presumiblemente mayor capacidad de razonamiento por número de parámetros, pero con menor precisión por peso y mayor consumo de memoria.

## Limitaciones y advertencias

- La cuantización IQ2_M (2,7 bits por peso) es agresiva: el propio autor advierte de posible degradación en razonamiento matemático complejo y estima una retención de calidad del 82 %, cifra no verificada con benchmarks públicos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; se agrava con cuantizaciones de baja precisión y en tareas de razonamiento simbólico.
- Sesgos conocidos: no documentados en la información proporcionada; el modelo base hereda los sesgos de los datos de entrenamiento de CodeLlama, no auditados en esta ficha.
- Idiomas soportados: no especificados. El modelo base está orientado principalmente a inglés y lenguajes de programación.
- Contexto efectivo limitado a 8.192 tokens en el mejor caso y 4.096 en CPU, inferior a la ventana del modelo base.
- Licencia: el artefacto declara apache-2.0, pero el modelo base Phind-CodeLlama-34B-v2 deriva de CodeLlama, sujeto a la Llama 2 Community License. Es imprescindible verificar la compatibilidad de licencias antes de un uso comercial.
- El repositorio no registra descargas ni likes y fue creado recientemente; no hay evidencia de uso en producción ni validación independiente de las métricas declaradas.
- El README incluye una cláusula de exención de responsabilidad total que traslada al usuario toda la responsabilidad sobre la validación de las salidas.
- No se documentan procesos de evaluación de seguridad, alineamiento ni filtrado de contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Phind-CodeLlama-34B-v2-GGUF
- Modelo base: https://huggingface.co/Phind/Phind-CodeLlama-34B-v2
- Herramienta de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
