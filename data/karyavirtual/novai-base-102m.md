# karyavirtual/novai-base-102m

## Resumen

NovAI Base 102M es un modelo de lenguaje causal (causal language model) desarrollado por KaryaVirtual, una empresa indonesia liderada por Nova Novriansyah. Se trata de un modelo de 102,6 millones de parámetros con arquitectura tipo Llama (decoder-only Transformer) entrenado desde cero con pesos inicializados aleatoriamente, no como fine-tuning de otro modelo base. Su propósito principal es servir como modelo fundacional para investigación y experimentación en procesamiento de lenguaje natural en indonesio, así como para fine-tuning en tareas posteriores.

El modelo fue preentrenado sobre aproximadamente 2 mil millones de tokens del subconjunto indonesio latino (`ind_Latn`) del dataset FineWeb-2 de HuggingFace, utilizando una GPU NVIDIA A100 de 40 GB. Con una ventana de contexto de 1.024 tokens y un vocabulario de 50.257 tokens (tokenizer GPT-2), es un modelo compacto orientado a entornos con recursos limitados. Su relevancia radica en ser un modelo abierto y ligero específico para indonesio, un idioma con escasa representación en el ecosistema de modelos de lenguaje de código abierto, y en su licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder-only Transformer |
| Parametros totales | 102.558.240 (~102,6 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 por defecto; se pueden cuantizar con herramientas externas) |
| Idiomas soportados | Indonesio (latino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 12 capas, tamaño oculto 720, tamaño intermedio 1.920, 12 cabezas de atención, 4 cabezas KV, vocabulario de 50.257 tokens.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama implementada en HuggingFace Transformers, con normalización RMSNorm, activación SiLU y atención con cabezas KV agrupadas (4 cabezas KV frente a 12 cabezas de consulta). No incorpora innovaciones como atención lineal, decodificación especulativa ni mecanismos híbridos; es un transformer causal estándar optimizado para eficiencia en tamaños pequeños.

El preentrenamiento se realizó con modelado de lenguaje causal (CLM) sobre el subconjunto indonesio latino de FineWeb-2, con aproximadamente 2.000.027.648 tokens de entrenamiento y 10 millones de tokens de validación. El entrenamiento completó 15.259 pasos con una pérdida final de 1,7229 y una pérdida de validación de 1,7012. No se aplicaron técnicas de alineación como RLHF o DPO; el modelo es un modelo base sin ajuste por instrucciones. Los pesos se inicializaron desde cero, por lo que no es una copia fine-tuneada de Llama, GPT u otros modelos.

## Capacidades

- Generación de texto en indonesio: el modelo produce texto coherente en indonesio latino, aunque con limitaciones propias de su tamaño.
- Modelado de lenguaje causal: adecuado para tareas de completado de texto, generación libre y modelado de probabilidades de secuencias.
- Fine-tuning: al ser un modelo base, puede ajustarse para tareas específicas como clasificación, extracción de información o generación condicionada.
- Experimentación educativa: útil para estudiar el comportamiento de transformers pequeños y el efecto del preentrenamiento en un idioma de bajos recursos.
- Inferencia local en hardware modesto: su tamaño permite ejecutarlo en CPU o GPU de gama baja.
- No soporta tool calling, function calling, ni capacidades multimodales (visión, audio). No tiene modo de razonamiento explícito ni conversación multi-turno por defecto.

## Casos de uso

- Investigación en NLP indonesio: el modelo puede servir como punto de partida para estudiar fenómenos lingüísticos del indonesio, como morfología, sintaxis o semántica, mediante análisis de representaciones internas o generación controlada.
- Fine-tuning para clasificación de texto: ajustando el modelo con datos etiquetados, se puede construir un clasificador de sentimiento, detección de spam o categorización de documentos en indonesio, aprovechando su conocimiento previo del idioma.
- Generación de contenido en indonesio: para prototipos de generación de artículos, resúmenes o respuestas automáticas en indonesio, aunque con calidad limitada por el tamaño y la falta de ajuste por instrucciones.
- Experimentación educativa en arquitecturas transformer: su tamaño reducido y su licencia permisiva lo hacen ideal para cursos de deep learning donde se necesite un modelo real preentrenado sin coste de cómputo elevado.
- Base para modelos especializados: se puede continuar el preentrenamiento con dominios específicos (legal, médico, técnico) en indonesio, partiendo de un modelo ya familiarizado con el idioma.
- Evaluación de técnicas de cuantización y compresión: al ser pequeño, permite probar métodos de cuantización (GPTQ, AWQ, GGUF) y medir su impacto en la perplejidad y la generación sin necesidad de GPUs grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento (1,7229) y de validación (1,7012), sin comparaciones con otros modelos ni métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 410 MB; en fp16, unos 205 MB; en int8, unos 103 MB; en int4, unos 51 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090). También puede ejecutarse en CPU con 4 GB de RAM.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de consumo e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (tras conversión) o directamente con la librería Transformers de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la generación de tokens debería ser de decenas de tokens por segundo; en CPU, de unos pocos tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos. Sin embargo, por tamaño y enfoque, se puede situar junto a otros modelos pequeños de lenguaje:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NovAI Base 102M | 102,6 M | 1.024 | Indonesio | Apache 2.0 | Entrenado desde cero |
| GPT-2 small | 124 M | 1.024 | Inglés | MIT | Modelo clásico de referencia |
| TinyLlama 1.1B | 1.100 M | 2.048 | Multilingüe | Apache 2.0 | Mucho mayor, entrenado en 3T tokens |
| IndoBERT | 124 M | 512 | Indonesio | Apache 2.0 | Modelo BERT, no generativo |

La comparación es orientativa; no se han ejecutado pruebas estandarizadas entre estos modelos.

## Limitaciones y advertencias

- Tamaño reducido: con solo 102 M de parámetros, la calidad de generación es limitada y no comparable con modelos de cientos de miles de millones de parámetros.
- Modelo base sin ajuste por instrucciones: no es un chatbot ni un asistente; no sigue instrucciones ni mantiene conversaciones coherentes sin fine-tuning.
- Sesgos y alucinaciones: el modelo puede generar contenido incorrecto, repetitivo o sesgado, especialmente en temas sensibles o de actualidad, debido a los datos de entrenamiento y su tamaño.
- Contexto corto: la ventana de 1.024 tokens limita el manejo de documentos largos o conversaciones extensas.
- Idioma limitado: solo entrenado en indonesio; no se garantiza un buen rendimiento en otros idiomas, aunque el tokenizer GPT-2 puede manejar caracteres latinos.
- Datos de entrenamiento no redistribuidos: el dataset FineWeb-2 no se incluye en el repositorio; los usuarios deben consultar la licencia y términos del dataset original.
- Sin garantías de producción: no se han publicado evaluaciones de robustez, sesgos ni seguridad; no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karyavirtual/novai-base-102m
- Repositorio de código y documentación técnica: https://github.com/novrian6/novai
- Sitio web de KaryaVirtual: https://karyavirtual.com/
- Sitio de formación NovAI: https://novai.karyavirtual.com/
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Tokenizer GPT-2: https://huggingface.co/openai-community/gpt2
