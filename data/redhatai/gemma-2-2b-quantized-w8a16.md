# RedHatAI/gemma-2-2b-quantized.w8a16

## Resumen

Este modelo es una versión cuantizada en INT8 del modelo base Gemma 2 2B de Google, publicada por el equipo de Red Hat AI (Neural Magic) en HuggingFace. La cuantización reduce el tamaño de los pesos de 16 a 8 bits mediante el algoritmo GPTQ, lo que recorta aproximadamente un 50% el uso de disco y memoria GPU, manteniendo una pérdida de precisión mínima frente al original (52.03 frente a 52.16 en el promedio del benchmark OpenLLM).

El modelo conserva la arquitectura transformer de Gemma 2, con 3.2 mil millones de parámetros y una ventana de contexto de 8192 tokens. Su objetivo es permitir el despliegue eficiente en entornos con recursos limitados, como GPUs de consumo o inferencia a alta velocidad con vLLM, sin sacrificar de forma significativa la calidad de generación de texto. Está pensado para uso comercial y de investigación en inglés, tal y como especifica su licencia.

La relevancia actual de este modelo radica en la creciente demanda de LLMs ligeros y cuantizados que puedan ejecutarse en hardware modesto. Al ser una versión cuantizada de un modelo base (no instructivo), es especialmente útil para desarrolladores que deseen hacer fine-tuning o integrarlo en pipelines de generación de texto sin necesidad de infraestructura GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 3.204.161.888 (3,2 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (ventana completa de Gemma 2 2B) |
| Tipos de cuantizacion | INT8 (W8A16, pesos en INT8, activaciones en FP16) |
| Idiomas soportados | Ingles (principal), otros idiomas limitados |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Gemma 2 2B, un transformer decoder-only con atención por ventana deslizante (sliding window attention) y normalización RMSNorm, derivada de la familia Gemini de Google. El modelo original fue preentrenado con datos de texto multilingüe, aunque el uso principal es en inglés. Este modelo cuantizado se obtiene aplicando el algoritmo GPTQ sobre los pesos de los operadores lineales de los bloques transformer, con cuantización simétrica por canal y un esquema W8A16 (pesos en INT8, activaciones en FP16). Se utilizaron 256 secuencias del dataset de calibración de Neural Magic y un factor de amortiguación del 1%.

La cuantización no altera la arquitectura interna ni los mecanismos de atención; simplemente reduce la precisión de los pesos. Esto permite una reducción aproximada del 50% en el tamaño en disco y la memoria GPU, y una mayor velocidad de cálculo en GPUs que soporten operaciones INT8. No se aplicó ningún proceso de fine-tuning adicional tras la cuantización, por lo que las capacidades del modelo son las mismas que las del Gemma 2 2B base, con una degradación mínima.

## Capacidades

- Generacion de texto: produce texto coherente y fluido en ingles, adecuado para tareas de continuacion de texto, resumen y reescritura.
- Razonamiento y matematicas: presenta un rendimiento basico en tareas de razonamiento logico y matematicas, con una puntuacion de 23.81 en GSM-8K (strict-match).
- Comprension del lenguaje: capacidad moderada en tareas de lectura comprensiva y sentido comun, como ARC (54.27) y HellaSwag (74.56).
- No incluye capacidades de chat o instrucciones: al ser el modelo base sin fine-tuning, no esta optimizado para conversaciones multi-turno ni para seguir instrucciones complejas.
- No soporta tool calling ni function calling: el modelo base no tiene esa capacidad; para ello habria que usar la version instruct o hacer fine-tuning.
- Multilingue limitado: aunque Gemma 2 se entreno con datos multilingues, el modelo base funciona mejor en ingles y no se recomienda su uso en otros idiomas.

## Casos de uso

- **Generacion de texto en aplicaciones ligeras**: el modelo puede usarse para generar contenido textual en aplicaciones de bajo presupuesto de computo, como blogs, resumenes o borradores, gracias a su tamano reducido y a la cuantizacion INT8 que lo hace viable en GPU de 8 GB o menos.
- **Fine-tuning para dominios especificos**: al ser un modelo base, es adecuado para aplicar PEFT (por ejemplo, LoRA) y especializarlo en dominios concretos como medicina, derecho o tecnologia, aprovechando la cuantizacion para reducir el coste de entrenamiento.
- **Clasificacion y etiquetado de texto**: mediante una capa de clasificacion adicional, el modelo puede usarse para tareas como analisis de sentimiento, deteccion de spam o clasificacion de documentos, en entornos con recursos limitados.
- **Extraccion de informacion**: puede servir como base para sistemas de extraccion de entidades o relaciones en textos largos, gracias a su ventana de contexto de 8192 tokens.
- **Prototipado rapido**: los desarrolladores pueden usar este modelo cuantizado para crear demos y pruebas de concepto de aplicaciones de generacion de texto sin necesidad de una GPU de gama alta, y despues migrar a modelos mas grandes si es necesario.
- **Despliegue en entornos de produccion con vLLM**: gracias a su compatibilidad nativa con vLLM, el modelo puede servirse en produccion con una API compatible con OpenAI, reduciendo el coste de inferencia en comparacion con el modelo original en FP16.

## Benchmarks y rendimiento

El modelo fue evaluado en el benchmark OpenLLM (version 1) con el harness de evaluacion de EleutherAI y el motor vLLM. Los resultados se comparan con el modelo original sin cuantizar:

| Benchmark | gemma-2-2b | gemma-2-2b-quantized.w8a16 (este modelo) | Recovery |
|---|---|---|---|
| MMLU (5-shot) | 53.01 | 52.86 | 99.7% |
| ARC Challenge (25-shot) | 53.92 | 54.27 | 100.6% |
| GSM8K (5-shot, strict-match) | 24.03 | 23.81 | 99.1% |
| Hellaswag (10-shot) | 74.74 | 74.56 | 99.8% |
| Winogrande (5-shot) | 70.96 | 70.56 | 99.4% |
| TruthfulQA (0-shot) | 36.29 | 36.15 | 99.6% |
| **Media** | **52.16** | **52.03** | **99.8%** |

La cuantizacion apenas afecta al rendimiento, con una recuperacion media del 99.8% respecto al modelo original. La unica tarea que mejora es ARC Challenge, lo que sugiere una variacion dentro del ruido estadistico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en FP16 ocupa aproximadamente 6.4 GB de memoria. Con la cuantizacion INT8, el uso de VRAM se reduce a unos 3.2 GB, lo que permite ejecutarlo en GPUs con 4 GB o 6 GB de memoria.
- **GPU recomendadas**: una NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o cualquier GPU con soporte para computacion INT8 (Turing o posterior). En entornos profesionales, una A100 o H100 ofrece mayor throughput.
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de consumo con 8 GB o menos, siempre que se use una cuantizacion INT8.
- **Opciones de despliegue**: vLLM (recomendado, con soporte oficial), llama.cpp, Ollama (si se convierte a GGUF), y TGI (Transformers Text Generation Inference).
- **Latencia y throughput**: con vLLM y una GPU moderna, se pueden alcanzar decenas de tokens por segundo, aunque el throughput exacto depende del hardware y del numero de peticiones concurrentes. No se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MMLU | Licencia |
|---|---|---|---|---|---|
| gemma-2-2b (original) | 3.2B | 8192 | FP16 | 53.01 | Gemma |
| gemma-2-2b-quantized.w8a16 (este modelo) | 3.2B | 8192 | INT8 (W8A16) | 52.86 | Gemma |
| phi-3-mini (3.8B) | 3.8B | 4096 | FP16/INT8 | 69.2 (MMLU 5-shot) | MIT |

La comparativa con phi-3-mini es indicativa, ya que phi-3-mini tiene un rendimiento superior en MMLU (69.2) pero un contexto menor (4096 tokens) y una licencia mas permisiva (MIT). El modelo cuantizado de Gemma 2 2B pierde algo de rendimiento respecto a phi-3-mini, pero ofrece una ventana de contexto mas larga y una integracion optimizada con vLLM.

## Limitaciones y advertencias

- **Modelo base sin fine-tuning**: no esta optimizado para conversacion ni para seguir instrucciones; requiere fine-tuning o uso del modelo instruct.
- **Idioma principal**: la model card recomienda su uso en ingles; el rendimiento en otros idiomas es muy limitado y no se ha evaluado.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- **Sesgos**: el modelo base puede heredar sesgos presentes en los datos de entrenamiento de Gemma 2, como sesgos de genero, etnia o culturales.
- **Restricciones de licencia**: la licencia Gemma de Google impone restricciones de uso, incluida la prohibicion de usos que violen leyes o regulaciones, y ciertas limitaciones para el uso en produccion con determinadas empresas (consultar los terminos).
- **Degradacion en tareas de matematicas**: el rendimiento en GSM8K es bajo (23.81), lo que indica una limitacion inherente para tareas de razonamiento aritmetico complejo.
- **Confusion en la nomenclatura**: la model card original tiene un titulo que menciona "it" (instruct) pero el contenido describe una cuantizacion del modelo base. Se recomienda verificar el modelo exacto antes de usarlo en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RedHatAI/gemma-2-2b-quantized.w8a16)
- [Modelo original Gemma 2 2B](https://huggingface.co/google/gemma-2-2b)
- [Paper de GPTQ (arXiv)](https://arxiv.org/abs/2210.17323)
- [Libreria llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Benchmark OpenLLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)
- [Documentacion de vLLM](https://docs.vllm.ai/en/latest/)
