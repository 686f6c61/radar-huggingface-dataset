# sncffcns/gemma-3

## Resumen

El modelo `sncffcns/gemma-3` es un fine-tuning de `unsloth/gemma-3-1b-it`, la variante de 1.000 millones de parámetros de la familia Gemma 3 de Google DeepMind, realizada por el usuario sncffcns mediante la librería Unsloth. Gemma 3 es una familia de modelos multimodales (texto e imagen) que destaca por su ventana de contexto de 128K tokens y su soporte de más de 140 idiomas, diseñada para ejecutarse eficientemente en una sola GPU o incluso en dispositivos de bajos recursos. Este fine-tuning específico no documenta el propósito ni los datos de entrenamiento, por lo que se asume que hereda las capacidades del modelo base, aunque su tarjeta indica que está enfocado al inglés. Su relevancia actual radica en la creciente demanda de modelos pequeños y abiertos que puedan desplegarse en entornos limitados sin sacrificar la calidad de la generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención local (sliding window) alternadas con capas globales; encoder SigLip para visión (heredado de Gemma 3) |
| Parámetros totales | 1.000 millones (1B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (del modelo base) |
| Tipos de cuantización | No se proporcionan en el repositorio; solo pesos safetensors en FP32/FP16 |
| Idiomas soportados | Inglés (según la tarjeta); el modelo base soporta 140+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `unsloth/gemma-3-1b-it` es un transformer multimodal con una arquitectura similar a las versiones anteriores de Gemma, pero con dos innovaciones clave: capas de atención local con ventana deslizante (5 capas locales por cada capa global) que permiten procesar contextos de hasta 128K tokens con menor coste computacional, y un codificador de visión SigLip que posibilita el procesamiento de imágenes. El fine-tuning realizado con Unsloth se centró en adaptar el modelo a una tarea no especificada, pero no se documentan los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La única información disponible es que el entrenamiento fue acelerado con Unsloth, que optimiza el uso de memoria y velocidad durante el fine-tuning.

## Capacidades

- Generación de texto en inglés, incluyendo tareas de razonamiento y conversación.
- Procesamiento multimodal de imágenes (del modelo base) aunque no se ha verificado en este fine-tune.
- Ventana de contexto larga de hasta 128K tokens, lo que permite manejar documentos extensos o conversaciones de muchos turnos.
- Soporte multilingüe heredado del modelo base, aunque la tarjeta específica solo inglés.
- Capacidades de tool calling y function calling en el modelo base (no confirmado en esta versión).
- Soporte para agentes y razonamiento multi-paso (potencial, no validado en el fine-tune).

## Casos de uso

- **Generación de texto en inglés**: puede utilizarse para redacción de artículos, resúmenes, correos electrónicos o cualquier tarea de generación de lenguaje natural, aprovechando su licencia Apache 2.0 para uso comercial.
- **Procesamiento de documentos largos**: su ventana de 128K tokens lo hace adecuado para analizar libros, informes o bases documentales completas sin necesidad de truncar el contexto.
- **Despliegue en dispositivos de bajos recursos**: al ser un modelo de 1B, puede ejecutarse en CPUs o GPUs con poca memoria, ideal para aplicaciones edge o prototipos.
- **Fine-tuning en dominios específicos**: por su licencia abierta, se puede adaptar a dominios como medicina, legal o atención al cliente, siempre que se disponga de los datos adecuados.
- **Asistentes conversacionales ligeros**: puede integrarse en chatbots que requieran respuestas rápidas y no necesiten una capacidad de razonamiento profunda.
- **Investigación académica**: sirve como base para experimentos sobre modelos pequeños o técnicas de fine-tuning eficiente, gracias a la documentación de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto. Dado que es un fine-tune del modelo base `unsloth/gemma-3-1b-it`, se podrían consultar los benchmarks oficiales de Gemma 3 1B, pero no se incluyen aquí por no estar especificados en el repositorio.

## Requisitos de hardware

- **VRAM estimada**: con pesos en FP16, el modelo ocupa aproximadamente 2 GB; en cuantización de 8 bits, menos de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, A10) es suficiente; también puede ejecutarse en CPU.
- **Compatibilidad con GPU de consumo**: sí, funciona en tarjetas como RTX 3060 o superiores.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) o transformers.
- **Latencia y throughput**: no disponible, aunque en un modelo de 1B la generación es rápida en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 3 1B (original) | 1B | 128K | 140+ | Apache 2.0 | Multimodal, base para este fine-tune |
| Qwen2.5 1.5B | 1.5B | 128K | Multilingüe | Apache 2.0 | Mejor rendimiento en código y matemáticas |
| Llama 3.2 1B | 1B | 128K | Multilingüe | Llama 3.2 Community License | Limitaciones en uso comercial |
| Phi-3 Mini 3.8B | 3.8B | 128K | Inglés | MIT | Más grande, pero similar en propósito |

Este modelo se posiciona como una variante del Gemma 3 1B, por lo que su rendimiento será comparable al original, con la ventaja de que el fine-tuning puede haberlo especializado en una tarea concreta.

## Limitaciones y advertencias

- **Tamaño reducido**: con solo 1B de parámetros, tiene limitaciones en tareas de razonamiento complejo o matemáticas avanzadas.
- **Alucinaciones**: como todos los modelos de lenguaje, puede generar información falsa o inventada.
- **Idioma**: la tarjeta indica solo inglés, aunque el modelo base soporta más idiomas; el fine-tuning podría haber degradado el rendimiento en otros idiomas.
- **Sesgos**: no se especifican datos de entrenamiento, por lo que puede heredar sesgos del modelo base.
- **Licencia**: Apache 2.0 permite uso comercial, pero no ofrece garantías ni soporte oficial.
- **Sin documentación del fine-tuning**: no se detalla la tarea, los datos ni los métodos, lo que dificulta evaluar su idoneidad para casos concretos.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/sncffcns/gemma-3)
- [Blog de Gemma 3 en Hugging Face](https://huggingface.co/blog/gemma3)
- [Documentación de Gemma 3 en Transformers](https://huggingface.co/docs/transformers/v5.0.0rc2/model_doc/gemma3)
- [Página oficial de Gemma 3 en DeepMind](https://deepmind.google/models/gemma/gemma-3/)
- [GitHub de Gemma 3](https://github.com/gemma-3/gemma-3)
