# Markie77/new-testament-trained-BF16-GGUF

## Resumen

El modelo `new-testament-trained-BF16-GGUF` es un ajuste fino (fine-tune) del modelo base GPT-OSS-20B, realizado por el usuario Markie77 y convertido al formato GGUF mediante la librería Unsloth. Aunque el nombre sugiere un entrenamiento específico en el texto del Nuevo Testamento, la model card no ofrece detalles sobre el dataset, el proceso de entrenamiento ni las capacidades resultantes. Se distribuye únicamente como un archivo cuantizado en MXFP4 (4 bits), lo que lo hace adecuado para inferencia en hardware de consumo.

La relevancia de este modelo radica en su tamaño (aproximadamente 20,9 mil millones de parámetros) y en su formato GGUF, que permite su ejecución con llama.cpp y herramientas compatibles como Ollama. Sin embargo, la falta de documentación técnica y de resultados de evaluación limita su uso en entornos profesionales sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, basada en GPT-OSS-20B) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo base ni sobre el proceso de ajuste fino. El nombre del archivo (`gpt-oss-20b.MXFP4.gguf`) sugiere que se parte de un modelo GPT-OSS-20B, que probablemente sea un transformer con arquitectura de mezcla de expertos (MoE), pero este dato no está confirmado en la documentación proporcionada. La conversión a GGUF se realizó con Unsloth, una herramienta optimizada para fine-tuning y exportación eficiente, lo que implica que el entrenamiento se efectuó con técnicas de baja precisión (BF16) antes de la cuantización final a MXFP4.

El dataset de entrenamiento, el número de tokens procesados y cualquier técnica de alineación (RLHF, DPO, etc.) no se mencionan en la model card. Tampoco se indican innovaciones técnicas específicas más allá de la propia conversión a GGUF.

## Capacidades

- Generación de texto: al ser un LLM de aproximadamente 20B parámetros, es capaz de producir texto coherente en tareas generales, aunque no se han publicado evaluaciones específicas.
- Fine-tune en Nuevo Testamento: por el nombre, se espera que tenga un conocimiento especializado en el texto bíblico del Nuevo Testamento, pero no hay evidencia empírica que lo confirme.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Estudio y análisis bíblico: el modelo podría utilizarse para responder preguntas sobre el Nuevo Testamento, generar resúmenes de pasajes o facilitar búsquedas semánticas en el texto, aunque su precisión no está verificada.
- Generación de contenido religioso: redacción de sermones, reflexiones o materiales educativos basados en el Nuevo Testamento, siempre que se valide la calidad de las salidas.
- Asistente conversacional temático: integración en chatbots especializados en temas bíblicos, aprovechando su formato GGUF para despliegue local con llama.cpp u Ollama.
- Prototipado de aplicaciones de procesamiento de lenguaje natural: al ser un modelo de 20B cuantizado a 4 bits, puede servir para experimentar con generación de texto en entornos con recursos limitados.
- Fine-tuning adicional: al estar en formato GGUF, no es adecuado para reentrenamiento directo, pero puede usarse como punto de partida para pruebas de inferencia antes de un ajuste fino más profundo.
- Investigación académica: análisis de las capacidades de modelos ajustados en dominios específicos, aunque sin benchmarks publicados su utilidad es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización MXFP4 (4 bits), un modelo de 20,9B parámetros requiere aproximadamente 10-12 GB de VRAM para inferencia, más overhead de contexto y activaciones. Es factible en GPUs de consumo como RTX 3080/3090, RTX 4070/4080/4090 o equivalentes de AMD con suficiente memoria.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB) o A100/H100 para mayor margen y velocidad.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de al menos 12 GB de VRAM.
- Opciones de despliegue: llama.cpp (con `llama-cli`), Ollama (incluye un Modelfile), y cualquier runtime compatible con GGUF como llama-cpp-python o LM Studio.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, un modelo de 20B cuantizado a 4 bits suele generar entre 20 y 40 tokens por segundo, pero esto es una estimación genérica y no un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo es un fine-tune de GPT-OSS-20B, pero no se conocen las características exactas del modelo base ni de otras variantes similares. Se recomienda consultar la documentación del modelo base original para establecer comparaciones.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en un corpus religioso específico, es probable que presente sesgos doctrinales o limitaciones en temas fuera del ámbito bíblico.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en contextos no cubiertos por su entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede determinar si es apto para uso comercial o si impone restricciones de atribución.
- Caveat para producción: la ausencia de documentación técnica, benchmarks y detalles de entrenamiento hace que no sea recomendable para aplicaciones críticas sin una validación exhaustiva.

## Enlaces

- [HuggingFace - Markie77/new-testament-trained-BF16-GGUF](https://huggingface.co/Markie77/new-testament-trained-BF16-GGUF)
- [Unsloth (herramienta de conversión)](https://github.com/unslothai/unsloth)
