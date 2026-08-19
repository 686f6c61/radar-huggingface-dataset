# cheikh025/enemray-gemma3-1b-cpt-lora

## Resumen

`cheikh025/enemray-gemma3-1b-cpt-lora` es un modelo de lenguaje de texto basado en **Gemma 3 1B** (la variante de 1.000 millones de parámetros de Google DeepMind), ajustado mediante **LoRA** (Low-Rank Adaptation) sobre el checkpoint pre-entrenado `unsloth/gemma-3-1b-pt`. El autor, `cheikh025`, ha empleado las librerías **Unsloth** (para acelerar el entrenamiento) y **TRL** (Transformers Reinforcement Learning) para realizar el fine-tuning. El modelo está pensado para ejecutarse en hardware modesto, como portátiles, móviles o GPUs de gama baja, manteniendo una ventana de contexto de 32.000 tokens, la máxima soportada por la versión 1B de Gemma 3.

La relevancia de este modelo radica en su tamaño reducido y su licencia Apache-2.0, que permite uso comercial sin restricciones. Aunque no se especifica el dataset de entrenamiento ni el método de alineación (RLHF/DPO), el fine-tuning con LoRA sugiere una adaptación eficiente a una tarea o dominio concreto, probablemente en inglés. Es una opción interesante para desarrolladores que necesitan un modelo ligero y rápido para aplicaciones de generación de texto, sin requerir infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención local y global (Gemma 3) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (máximo para Gemma 3 1B) |
| Tipos de cuantizacion | no disponible (formato base safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | inglés (fine-tune); el modelo base Gemma 3 soporta más de 140 idiomas, pero no se garantiza tras el ajuste |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de **Gemma 3 1B**, un transformer decoder-only con un diseño de atención mixta: capas de atención local (con ventana de 5 tokens) y capas de atención global, con una frecuencia base de RoPE de 1M en las capas globales y 10k en las locales. Esta configuración permite manejar secuencias largas (hasta 32K tokens) con un coste computacional reducido.

El entrenamiento se realizó mediante **LoRA** sobre el checkpoint pre-entrenado `unsloth/gemma-3-1b-pt`, utilizando la librería **Unsloth** para acelerar el proceso (según la model card, el entrenamiento fue 2x más rápido). No se especifica el dataset de fine-tuning, ni el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. La ausencia de estos detalles limita la reproducibilidad y la evaluación objetiva del modelo.

## Capacidades

- Generación de texto en inglés: produce respuestas coherentes y contextuales en tareas de chat, redacción y resumen.
- Razonamiento básico: puede resolver problemas lógicos y aritméticos simples, aunque su tamaño limita la complejidad.
- Generación de código: capaz de producir fragmentos de código en lenguajes comunes (Python, JavaScript, etc.) para tareas sencillas.
- Comprensión lectora: extrae información de textos y responde preguntas basadas en el contexto.
- Soporte de tool calling / function calling: no confirmado para este fine-tune, aunque el modelo base Gemma 3 lo soporta; se recomienda probar.
- Capacidades multilingües: limitadas al inglés tras el fine-tune; el modelo base era multilingüe, pero el ajuste puede haber reducido su rendimiento en otros idiomas.

## Casos de uso

- **Asistente de chat en aplicaciones móviles**: por su tamaño (1B) y baja latencia, puede integrarse en apps de mensajería para responder consultas frecuentes sin depender de la nube.
- **Generación de código en entornos de desarrollo integrado (IDE)**: como autocompletado o generación de funciones simples, aprovechando su capacidad de producir código y su contexto de 32K tokens para analizar archivos completos.
- **Resumen automático de documentos**: adecuado para resumir artículos, correos o informes en inglés, gracias a su ventana de contexto larga y su capacidad de comprensión lectora.
- **Clasificación y etiquetado de texto**: puede asignar categorías o extraer entidades en pipelines de procesamiento de lenguaje natural (PLN) para análisis de datos.
- **Chatbot de atención al cliente en inglés**: con un fine-tuning adicional sobre datos de soporte, puede gestionar conversaciones multi-turno con contexto amplio, reduciendo costes de infraestructura.
- **Prototipado rápido de aplicaciones NLP**: su licencia Apache-2.0 y su facilidad de despliegue lo hacen ideal para validar ideas o construir demos sin inversión en GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de MMLU, HumanEval, GSM8K u otros para este fine-tune específico. Para una evaluación objetiva, se recomienda ejecutar pruebas propias o consultar los benchmarks del modelo base Gemma 3 1B (que sí están documentados en el informe técnico de Google DeepMind).

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~2 GB en FP16 (pesos completos), ~1 GB con cuantización a 8 bits o 4 bits (mediante herramientas como llama.cpp o bitsandbytes).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, por ejemplo GTX 1050 Ti, RTX 2060, RTX 3060, o incluso iGPUs modernas. También puede ejecutarse en CPU con cuantización.
- **Compatibilidad con GPUs consumer**: sí, cabe en tarjetas de gama baja y media; también en dispositivos edge como Raspberry Pi (con cuantización extrema).
- **Opciones de despliegue**: vLLM (para inferencia de alto rendimiento), llama.cpp (para CPU y GPU), Ollama (para uso local sencillo), Hugging Face TGI (Text Generation Inference) y la API de transformers estándar.
- **Latencia y throughput estimados**: no disponibles para este modelo específico; en una GPU moderna (RTX 4090) se espera una latencia de decodificación de unos 20-30 ms por token, y un throughput de varias decenas de tokens por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idioma principal | Notas |
|---|---|---|---|---|---|
| `cheikh025/enemray-gemma3-1b-cpt-lora` | 1B | 32K | Apache-2.0 | Inglés | Fine-tune LoRA de Gemma 3 1B, sin benchmarks publicados |
| `unsloth/gemma-3-1b-pt` (base) | 1B | 32K | Apache-2.0 | Multilingüe | Modelo pre-entrenado original, sin fine-tuning |
| `Qwen2.5-1.5B-Instruct` | 1.5B | 32K | Apache-2.0 | Multilingüe (incluye chino) | Modelo instruct con buenos resultados en razonamiento |
| `Llama-3.2-1B-Instruct` | 1.2B | 128K | Llama 3.2 Community License | Multilingüe | Contexto más largo, pero licencia con restricciones para empresas >700M usuarios |

La comparativa muestra que este modelo se sitúa en la misma categoría de tamaño que otros modelos ligeros, pero carece de documentación de rendimiento y de un fine-tuning verificado. Su principal ventaja es la licencia permisiva y la herencia de la arquitectura Gemma 3, que ofrece buena eficiencia en contexto largo.

## Limitaciones y advertencias

- **Sesgos conocidos**: heredados del modelo base Gemma 3, que puede reflejar sesgos de género, raza o ideología presentes en los datos de pre-entrenamiento.
- **Riesgo de alucinación**: al ser un modelo de 1B, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o hechos específicos.
- **Limitaciones de idioma**: el fine-tune está dirigido al inglés; el rendimiento en otros idiomas puede degradarse significativamente respecto al modelo base.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe incluir el aviso de licencia y atribución en productos derivados.
- **Falta de documentación**: no se especifica el dataset de fine-tuning, el método de alineación ni los hiperparámetros, lo que dificulta la reproducibilidad y la confianza en el modelo.
- **Caveat de producción**: antes de usarlo en entornos productivos, es imprescindible evaluar su rendimiento en el dominio objetivo y considerar la posibilidad de sobreajuste al dataset de entrenamiento desconocido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cheikh025/enemray-gemma3-1b-cpt-lora)
- [Informe técnico de Gemma 3 (arXiv)](https://arxiv.org/html/2503.19786v1)
- [Página oficial de Gemma 3 (Google DeepMind)](https://deepmind.google/models/gemma/gemma-3/)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Documentación de Gemma 3 en Hugging Face Transformers](https://huggingface.co/docs/transformers/model_doc/gemma3)
