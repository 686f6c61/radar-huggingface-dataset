# benni-ben/SatireLM-4B

## Resumen

SatireLM-4B es un ajuste fino (fine-tune) satírico del modelo base Qwen3.5-4B-Base, desarrollado por el usuario benni-ben. Su propósito es generar respuestas absurdas, cómicas o deliberadamente incorrectas manteniendo el formato y la estructura de un modelo de lenguaje de frontera. No está pensado para tareas de producción reales, sino para entretenimiento, escritura creativa y experimentación con estilos de generación poco convencionales.

El modelo conserva la arquitectura del Qwen3.5-4B-Base (transformer causal con 32 capas, tamaño oculto de 2560 y vocabulario de 248.320 tokens) y fue entrenado con Unsloth sobre una GPU AMD MI300 durante aproximadamente 23 horas. El resultado es un modelo de 4.326.350.848 parámetros (4,3 mil millones) que no incorpora modo de razonamiento (thinking), ya que el conjunto de datos de instrucciones no incluye ejemplos de ese tipo.

Su relevancia actual es limitada pero interesante para quienes investigan el comportamiento de modelos ajustados con datos adversariales o humorísticos, así como para creadores de contenido que necesiten un generador de texto satírico con formato de asistente. La licencia Apache 2.0 facilita su uso y modificación, aunque el autor restringe explícitamente su uso a fines de entretenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 4.326.350.848 (4,3 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes cuantizadas en el repositorio); safetensors en FP16 en repositorio separado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors (repo Sarire-FP16) |

## Arquitectura y entrenamiento

SatireLM-4B es un modelo de lenguaje causal basado en la arquitectura Qwen3_5ForConditionalGeneration, con 32 capas, tamaño oculto de 2560, tamaño intermedio de 9216 y un vocabulario de 248.320 tokens. No se trata de un modelo de mezcla de expertos (MoE), sino de un transformer denso convencional. El ajuste fino se realizó con el framework Unsloth sobre una GPU AMD MI300, con una duración de entrenamiento de aproximadamente 23 horas.

El conjunto de datos de entrenamiento consistió en cerca de 200.000 ejemplos de instrucciones (instruct examples) que abarcan temas diversos, desde cocina hasta programación. Estos pares de instrucción-respuesta satíricos están disponibles en el repositorio de datos SatireInstruct. El modelo no incluye ejemplos de instrucciones con modo de pensamiento (thinking), por lo que no genera cadenas de razonamiento explícitas. No se menciona el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto satírico, absurdo y cómico con formato de asistente conversacional.
- Respuestas con estructura y formato propios de un modelo de frontera (listas, encabezados, etc.), pero con contenido deliberadamente incorrecto o nonsense.
- Conversación multi-turno en inglés.
- Instrucciones de seguimiento (instruction-following) en el contexto de la sátira.
- No dispone de modo de razonamiento (thinking) ni de capacidades de visión, audio o tool calling documentadas.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Generación de contenido humorístico para blogs o redes sociales: el modelo produce respuestas satíricas con formato de asistente, adecuado para crear parodias de interacciones con IA.
- Creación de guiones o diálogos cómicos: se puede usar para generar conversaciones absurdas entre personajes, aprovechando su tendencia a respuestas incoherentes pero estructuradas.
- Pruebas de robustez en sistemas de detección de texto generado: sirve como generador de texto adversarial para evaluar clasificadores de contenido.
- Experimentación en investigación sobre ajuste fino con datos satíricos: permite estudiar cómo un modelo base reacciona a un corpus de instrucciones deliberadamente incorrectas.
- Educación y divulgación sobre limitaciones de los LLM: se puede emplear para demostrar que los modelos pueden generar respuestas con apariencia plausible pero sin fundamento.
- Entretenimiento en chatbots de demostración: integrado en una interfaz lúdica, ofrece respuestas cómicas sin necesidad de un modelo de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4,3 mil millones de parámetros, en FP16 requeriría aproximadamente 8,6 GB de VRAM solo para los pesos, más overhead. En cuantización GGUF de 4 bits, podría caber en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: AMD MI300 (usada en entrenamiento), NVIDIA A100, H100, RTX 4090, RTX 3090. Para cuantizaciones ligeras, GPUs consumer como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) podrían ser suficientes.
- Cabe en GPU consumer: sí, especialmente en formatos GGUF cuantizados (Q4_K_M, Q5_K_M, etc.).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (según la model card), y transformers con los pesos safetensors del repositorio Sarire-FP16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SatireLM-4B | 4,3 mil millones | No disponible | Apache 2.0 | Hugging Face (GGUF y safetensors) | Fine-tune satírico de Qwen3.5-4B-Base |
| Qwen3.5-4B-Base | 4,3 mil millones | No disponible | Apache 2.0 | Hugging Face | Modelo base original, sin ajuste satírico |
| Modelos de 4B similares (p. ej., Llama 3.2 3B, Phi-3-mini) | 3-4 mil millones | 8k-128k (según modelo) | Licencias variables | Hugging Face | Alternativas generalistas, no satíricas |

No se dispone de datos de rendimiento comparativo para SatireLM-4B.

## Limitaciones y advertencias

- El modelo está diseñado para generar respuestas falsas o absurdas; no debe usarse para obtener información veraz.
- Alto riesgo de alucinación y contenido sin sentido, incluso en temas serios.
- Entrenado únicamente en inglés; no se garantiza un rendimiento aceptable en otros idiomas.
- No incluye modo de razonamiento ni capacidades de tool calling.
- La licencia Apache 2.0 permite uso comercial, pero el autor indica explícitamente que el modelo es solo para entretenimiento y sátira; el uso en producción para fines serios no está recomendado.
- No se han publicado evaluaciones de sesgos; se desconoce su comportamiento en dominios sensibles.
- El repositorio principal contiene únicamente pesos GGUF; los pesos safetensors están en un repositorio separado (Sarire-FP16) con posible error tipográfico en el nombre.

## Enlaces

- [Hugging Face: benni-ben/SatireLM-4B](https://huggingface.co/benni-ben/SatireLM-4B)
- [Repositorio de pesos safetensors (FP16)](https://huggingface.co/benni-ben/Sarire-FP16/tree/main)
- [Dataset SatireInstruct](https://huggingface.co/datasets/benni-ben/SatireInstruct)
- [Vista previa de conversaciones](https://huggingface.co/benni-ben/SatireLM-4B/blob/main/conversation_preview.md)
- [Modelo base Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
