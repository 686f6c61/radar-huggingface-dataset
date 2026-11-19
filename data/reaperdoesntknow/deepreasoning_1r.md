# reaperdoesntknow/DeepReasoning_1R

## Resumen

DeepReasoning_1R es un ajuste fino (fine-tune) del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC: Research Division. Con 494.032.768 parámetros reales (según los pesos en safetensors) y un tamaño de repositorio de 1,0 GB, se posiciona como un modelo compacto orientado a generación de texto y razonamiento conversacional. El autor lo enmarca dentro de su marco teórico propio, denominado Discrepancy Calculus (DISC), que describe como un enfoque de teoría de la medida para controlar la brecha entre la salida esperada y la observada durante el entrenamiento.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) del modelo base Qwen2.5-0.5B-Instruct y se ha afinado sobre el dataset HumanLLMs/Human-Like-DPO-Dataset, según los metadatos de la model card. La etiqueta "reasoning" sugiere un énfasis en tareas de razonamiento, aunque no se documentan detalles sobre el proceso de ajuste, los hiperparámetros ni la composición exacta de los datos.

Su relevancia actual es limitada pero concreta: se trata de un modelo muy pequeño (menos de 500 millones de parámetros) que puede ejecutarse en hardware de consumo y en CPU, lo que lo hace útil para experimentación, prototipado rápido y despliegue en entornos con recursos restringidos. No obstante, la ausencia de licencia explícita, de idiomas declarados y de benchmarks publicados limita seriamente su evaluación rigurosa y su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-0.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas; el repo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni componentes de estado recurrente (SSM). El modelo se ha afinado (fine-tune) a partir de dicho base, según los metadatos `base_model:finetune:Qwen/Qwen2.5-0.5B-Instruct`, y el dataset declarado es HumanLLMs/Human-Like-DPO-Dataset, lo que sugiere un ajuste orientado a preferencias humanas o a un estilo conversacional más natural.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset, la existencia de RLHF/DPO más allá del nombre del dataset, ni sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). La model card menciona el marco teórico DISC (Discrepancy Calculus), con conceptos como el operador de discrepancia, los conjuntos de salto y el "ghost imprinting", pero no aporta detalles verificables sobre cómo se aplicaron al entrenamiento de este modelo concreto. Tampoco se documentan hiperparámetros, duración del entrenamiento ni métricas de pérdida.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del modelo base Instruct.
- Razonamiento de propósito general, según la etiqueta "reasoning" de los metadatos, aunque sin benchmarks que lo cuantifiquen.
- Ajuste orientado a preferencias humanas mediante el dataset HumanLLMs/Human-Like-DPO-Dataset, lo que puede mejorar la naturalidad de las respuestas.
- Soporte de tool calling / function calling: no documentado explícitamente; el modelo base Qwen2.5-0.5B-Instruct lo soporta, pero no se confirma que se conserve tras el fine-tune.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; no se declaran.

## Casos de uso

- Prototipado rápido de chatbots conversacionales: al tener menos de 500 millones de parámetros, el modelo puede ejecutarse en CPU o en GPU de gama baja para validar flujos de conversación multi-turno antes de invertir en modelos mayores.
- Experimentación académica con ajuste fino: sirve como punto de partida para estudiar el efecto de datasets de preferencias (Human-Like-DPO) en modelos pequeños, gracias a su tamaño manejable y a su formato safetensors estándar.
- Despliegue en entornos con recursos limitados: su tamaño de repositorio de 1,0 GB permite incluirlo en contenedores ligeros o dispositivos edge donde un modelo de 7B o superior no cabría.
- Generación de texto asistida en herramientas de escritura: puede emplearse para sugerencias, reescritura o borradores en aplicaciones de productividad, con la advertencia de que su calidad será inferior a la de modelos más grandes.
- Educación y demostraciones técnicas: útil para explicar el funcionamiento de un pipeline de transformers, text-generation-inference y despliegue de endpoints compatibles, dado que los metadatos indican compatibilidad con endpoints.
- Filtrado o clasificación textual ligera: mediante prompts adecuados, puede usarse para tareas de etiquetado simple o resumen de textos cortos, siempre que se validen los resultados por el riesgo de alucinación inherente a su escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (494 M de parámetros × 2 bytes), y alrededor de 0,5 GB en cuantización de 8 bits; en cuantización de 4 bits podría rondar los 0,3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (según metadatos) y endpoints compatibles. No se documentan despliegues con vLLM, llama.cpp u Ollama, ni pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles; al ser un modelo de menos de 500 M de parámetros, se espera una latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepReasoning_1R | 494 M | No disponible | No disponible | Hugging Face (safetensors) | Fine-tune de Qwen2.5-0.5B-Instruct sobre Human-Like-DPO |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (según documentación del modelo base) | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente disponible | Modelo base oficial, con benchmarks publicados y soporte de tool calling |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens (según documentación del modelo base) | Apache 2.0 (según el modelo base) | Hugging Face | Alternativa de mayor tamaño y calidad, mismo ecosistema |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (según documentación del modelo) | Apache 2.0 (según el modelo) | Hugging Face | Modelo pequeño comparable en escala, con benchmarks publicados |

La comparativa se basa en datos públicos de los modelos alternativos; para DeepReasoning_1R no se dispone de benchmarks ni de licencia confirmada, por lo que la comparación de rendimiento no puede establecerse con rigor.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia, lo que impide determinar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: no se documenta qué idiomas soporta el modelo, por lo que su comportamiento fuera del inglés (idioma probable del dataset base) es incierto.
- Riesgo de alucinación elevado: con menos de 500 millones de parámetros, la capacidad de mantener coherencia factual es limitada; no es adecuado para tareas que requieran precisión factual sin verificación humana.
- Sesgos conocidos: no documentados, pero el modelo hereda los sesgos del dataset HumanLLMs/Human-Like-DPO-Dataset y del modelo base Qwen2.5-0.5B-Instruct, que no se detallan.
- Limitaciones de contexto: la longitud de contexto no se confirma en la model card; aunque el modelo base soporta 32.768 tokens, el fine-tune podría no conservar esa ventana.
- Ausencia de benchmarks: no hay métricas publicadas (MMLU, HumanEval, GSM8K, etc.), lo que impide evaluar su calidad frente a alternativas.
- Documentación metodológica no verificable: el marco DISC y los conceptos asociados (operador de discrepancia, ghost imprinting) se presentan sin evidencia empírica en la model card.
- Compatibilidad de tool calling incierta: aunque el modelo base lo soporta, no se confirma que el fine-tune lo conserve.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DeepReasoning_1R
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset utilizado: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Documento "Structure Over Scale" (DOI: 10.57967/hf/8165): https://doi.org/10.57967/hf/8165
- Documento "Discrepancy Calculus" (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Documento "Three Teachers to Dual Cognition" (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
