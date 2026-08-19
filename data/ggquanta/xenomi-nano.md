# GGQuanta/Xenomi-nano

## Resumen

Xenomi-nano es un modelo de lenguaje compacto de 0,8B parámetros desarrollado por Beijing Zhongke Guoguang Quantum Technology (GGQUANTA), especializado en tareas de enrutamiento, extracción de terminología, detección de palabras clave y discriminación de texto corto. Se distribuye como un finetune del modelo base Qwen/Qwen3.5-0.8B mediante LoRA/SFT sobre datos verticales, y se publica en formato GGUF BF16 para su uso directo con llama.cpp y herramientas compatibles.

El modelo está pensado para despliegue en dispositivos de gama baja (end-side) con baja latencia, no como un modelo generalista de propósito general. Su relevancia radica en que ofrece mejoras sustanciales en tareas específicas de discriminación frente al base, alcanzando por ejemplo un 95,0% de precisión en routing frente al 31,2% del modelo original, según la evaluación proporcionada por el autor. Además, se enmarca en una familia planificada (Xenomi-mini, Xenomi-pro, Xenomi-max) de la que es la variante más pequeña.

La licencia es Apache 2.0, lo que permite uso comercial con las condiciones de la política de uso de Qwen. El modelo soporta inglés y chino, y su despliegue es sencillo gracias al formato GGUF y la compatibilidad con servidores OpenAI-compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B) |
| Parámetros totales | 752.393.024 (0,75B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea 8192 tokens) |
| Tipos de cuantización | BF16 (GGUF) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

El modelo se construye sobre la base Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen con atención de tipo Qwen (probablemente con Grouped Query Attention, aunque no se especifica en la documentación). El entrenamiento consiste en un finetune con LoRA y SFT sobre datos verticales (especializados en tareas de routing, extracción de términos, keywords y discriminación de texto corto). Tras el entrenamiento, se realiza la fusión de los adaptadores LoRA con los pesos base y se convierte a formato GGUF en precisión BF16.

No se han publicado detalles sobre la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni el procedimiento de optimización (por ejemplo, si se empleó RLHF o DPO). La model card indica que las ventajas de precisión sobre el base se atribuyen a los datos verticales y al LoRA/SFT, no a hardware cuántico ni a «supremacía cuántica». Además, el modelo no incluye el cabezal de routing cuántico (un módulo independiente que no forma parte del GGUF) ni la compuerta de identidad (thin-A), que es una regla de servicio aplicada en el lado servidor.

## Capacidades

- Generación de texto y chat conversacional en chino e inglés.
- Enrutamiento de texto (routing) con una precisión del 95,0% en la evaluación interna.
- Extracción de términos (NER) con F1 micro de 74,7%.
- Clasificación de palabras clave (keywords) con F1 de 74,1%.
- Discriminación de texto corto con precisión del 100%.
- Soporte de razonamiento opcional (modo thinking) mediante la activación con `--reasoning on` en llama.cpp.
- Compatibilidad con plantilla de chat ChatML y formato OpenAI-compatible a través de llama-server.

No se ha documentado soporte para tool calling, function calling, visión, audio ni capacidades multimodales. El modelo está orientado a tareas de discriminación y enrutamiento, no a un uso generalista.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo puede clasificar preguntas de usuarios en categorías de destino (routing) con alta precisión, mejorando la derivación de tickets en plataformas de soporte multilingüe (zh/en).
- Extracción de términos en documentos técnicos o científicos: gracias a su rendimiento en NER (74,7% micro-F1), es adecuado para identificar entidades y términos específicos en textos de investigación, por ejemplo, en bases de datos de patentes o bibliografía.
- Clasificación de palabras clave para motores de búsqueda o sistemas de recomendación: su F1 de 74,1% en keywords permite etiquetar contenido de forma automática en repositorios documentales.
- Discriminación de texto corto en sistemas de moderación o filtrado: con un 100% de precisión en este tipo de tareas, puede validar si un mensaje cumple ciertos criterios (por ejemplo, si es una consulta válida o un mensaje vacío) en entornos de chat.
- Asistencia en pipelines de RAG: su mejora en precisión de RAG (+3,8 puntos frente al base) lo hace útil para seleccionar o filtrar fragmentos relevantes en sistemas de recuperación aumentada.
- Despliegue en dispositivos edge o entornos con recursos limitados: gracias a su tamaño (0,75B) y formato GGUF, puede ejecutarse en CPUs o GPUs de bajo perfil, por ejemplo, en un servidor pequeño o un dispositivo móvil con llama.cpp.

## Benchmarks y rendimiento

La model card proporciona una evaluación interna (eval v1) comparando Xenomi-nano con su base Qwen3.5-0.8B en cinco tareas. Los resultados son los siguientes:

| Modelo | Routing Acc | RAG Acc | NER micro-F1 | Keyword F1 | Short text Acc | Parse-OK |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen3.5-0.8B | 31,2 | 80,0 | 33,7 | 22,2 | 56,2 | 99,2 |
| Xenomi-nano | 95,0 | 83,8 | 74,7 | 74,1 | 100,0 | 100,0 |

Las mejoras relativas son: routing +63,8, RAG +3,8, NER +41,0, keywords +51,9 y short text +43,8. Todos los umbrales de la evaluación se superaron (PASS). Además, el autor indica que la identidad del producto (con la capa thin-A v1.2) alcanza un 92% de precisión.

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La evaluación se realizó en el lado de entrenamiento con CUDA LoRA (PEFT) sobre la plataforma wsl-rtx5070, y el GGUF se ha convertido a partir de los adaptadores fusionados, pero no se ha re-evaluado con llama.cpp.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF BF16 ocupa aproximadamente 1,4 GB, por lo que la inferencia requiere al menos 2 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4060, o GPUs de centros de datos como A10 o A100). También puede ejecutarse en CPU mediante llama.cpp.
- Cabe en GPUs de consumo (consumer) de gama baja y media; no requiere hardware de servidor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), compatible con la API OpenAI mediante llama-server. También puede convertirse a otros formatos (por ejemplo, safetensors) para vLLM u Ollama, aunque no se ha documentado oficialmente.
- Latencia y throughput: no se han publicado mediciones específicas; dado el tamaño del modelo, se espera una latencia muy baja (milisegundos) en GPU moderna y ejecución fluida en CPU.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables de la misma categoría (finetunes de 0,8B especializados en tareas de discriminación) en la documentación del autor. La única comparativa publicada es con el modelo base Qwen/Qwen3.5-0.8B, que se detalla en la sección de benchmarks. A nivel de tamaño, alternativas como SmolLM2-1.7B o Qwen2.5-0.5B podrían ser comparables, pero no se dispone de datos de rendimiento en estas mismas tareas, por lo que no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- El modelo está orientado a tareas específicas de discriminación y enrutamiento; su rendimiento en tareas generales de generación de texto puede ser inferior a otros modelos de tamaño similar.
- No incluye el cabezal de routing cuántico ni la compuerta de identidad (thin-A), que son módulos externos; sin ellos, el modelo no ofrece las funcionalidades de identidad o routing cuántico.
- La evaluación interna se realizó solo con un conjunto de validación (eval v1) y no se ha re-evaluado en el entorno GGUF; los resultados pueden variar en la práctica.
- El modelo solo soporta chino e inglés, no otros idiomas.
- No se han documentado sesgos específicos, pero, como cualquier modelo basado en datos, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación en generación de texto, especialmente en temas fuera de los dominios verticales entrenados.
- La licencia Apache 2.0 permite uso comercial, pero debe cumplirse la política de uso de Qwen (que puede incluir restricciones para ciertos sectores o regiones).
- No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO), lo que dificulta evaluar la robustez del modelo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/GGQuanta/Xenomi-nano
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs o demos oficiales adicionales en la búsqueda web (los resultados obtenidos corresponden a Gemini Nano de Google, que no es relevante para este modelo).
