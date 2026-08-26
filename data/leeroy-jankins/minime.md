# leeroy-jankins/minime

## Resumen

Minime es un modelo de lenguaje pequeño (3,4B parámetros) con capacidades de visión (0,4B de vision encoder) desarrollado por el usuario leeroy-jankins a partir del modelo Ministral 3 3B Reasoning 2512 de Mistral AI. Se trata de una versión cuantizada en formato GGUF, optimizada para tareas de razonamiento, matemáticas, código y disciplinas STEM, y diseñada para despliegue en entornos edge o con recursos limitados.

El modelo destaca por su ventana de contexto de 256k tokens, su soporte multilingüe (10 idiomas declarados) y sus capacidades agénticas nativas, incluyendo function calling y salida en JSON. Todo ello bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su relevancia actual radica en que ofrece un rendimiento competitivo en su categoría de tamaño, con la posibilidad de ejecutarse localmente en menos de 8 GB de VRAM cuando está cuantizado, lo que lo hace atractivo para aplicaciones en tiempo real en dispositivos de baja capacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con vision encoder (0,4B) integrado |
| Parametros totales | 3.429.006.336 (3,4B) + 0,4B vision encoder |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | GGUF (nivel no especificado, repo de 2,1 GB) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Minime se basa en la arquitectura transformer estándar de la familia Ministral 3, con un componente adicional de vision encoder de 0,4B parámetros que permite procesar imágenes junto con texto. El modelo es la versión "Reasoning" post-entrenada por Mistral AI, lo que implica un entrenamiento adicional orientado a tareas de razonamiento complejo, matemáticas y código, probablemente mediante técnicas de ajuste fino supervisado y optimización por preferencias (no se especifican los detalles exactos en la información disponible).

La versión publicada por leeroy-jankins es una cuantización GGUF del modelo original de Mistral, producida por unsloth, que reduce el tamaño del modelo para facilitar su despliegue en hardware limitado. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset, pero al ser un derivado del modelo oficial, hereda sus características de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-step, especialmente en matemáticas, código y STEM.
- Visión: análisis de imágenes, captioning y respuestas basadas en contenido visual.
- Multilingüe: soporte para 10 idiomas (inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe).
- Function calling nativo y salida en JSON estructurado.
- Adherencia a system prompts, útil para control de comportamiento.
- Capacidades agénticas: puede actuar como agente en flujos multi-paso.
- Optimizado para edge: puede ejecutarse en dispositivos con menos de 8 GB de VRAM cuantizado.

## Casos de uso

- Captioning de imágenes en tiempo real: el modelo puede generar descripciones de imágenes en varios idiomas, adecuado para aplicaciones de accesibilidad o redes sociales.
- Clasificación de texto: gracias a su ventana de 256k tokens, puede procesar documentos largos y clasificarlos por categorías, sentimiento o tema.
- Traducción eficiente: su soporte multilingüe permite traducciones rápidas entre los 10 idiomas soportados, con bajo consumo de recursos.
- Extracción de datos estructurados: mediante su capacidad de salida en JSON, puede extraer entidades, fechas o campos específicos de textos no estructurados.
- Generación de contenido corto: adecuado para resúmenes, titulares o respuestas breves en aplicaciones de asistencia virtual.
- Agentes autónomos en entornos edge: su function calling y razonamiento multi-step permiten construir asistentes que ejecutan acciones (enviar correos, consultar APIs) en dispositivos locales.
- Fine-tuning especializado: al ser un modelo pequeño y de código abierto, puede ajustarse para dominios específicos (medicina, legal, etc.) con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización (minime). Los datos disponibles en la model card corresponden al modelo base Ministral 3 3B de Mistral AI, que se muestran a continuación como referencia:

| Modelo | Multilingual MMLU | MATH CoT 2-Shot | AGIEval 5-shot | MMLU Redux 5-shot | MMLU 5-shot | TriviaQA 5-shot |
|---|---|---|---|---|---|---|
| **Ministral 3 3B** | 0.652 | **0.601** | 0.511 | 0.735 | 0.707 | 0.592 |
| Qwen 3 4B Base | **0.677** | 0.405 | **0.570** | **0.759** | **0.713** | 0.530 |
| Gemma 3 4B Base | 0.516 | 0.294 | 0.430 | 0.626 | 0.589 | **0.640** |

Estos resultados indican que el modelo base supera a Gemma 3 4B en la mayoría de métricas y es competitivo con Qwen 3 4B, destacando especialmente en matemáticas (MATH CoT). Sin embargo, la cuantización GGUF puede implicar una ligera degradación del rendimiento respecto al modelo original en BF16.

## Requisitos de hardware

- VRAM estimada: 16 GB en BF16 (según la model card), menos de 8 GB en cuantización GGUF.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para la versión cuantizada (por ejemplo, RTX 3060, RTX 4060, RTX 4090); para BF16 se necesitan 16 GB (por ejemplo, RTX 4090, A100, H100).
- Compatible con GPUs consumer: sí, las versiones cuantizadas caben en GPUs de gama media.
- Opciones de despliegue: vLLM (recomendado por el autor), transformers, llama.cpp (para GGUF), Ollama (si se convierte a formato compatible).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

Comparación con otros modelos pequeños de razonamiento de tamaño similar (basada en datos del modelo base):

| Característica | Minime (Ministral 3 3B) | Qwen 3 4B Base | Gemma 3 4B Base |
|---|---|---|---|
| Parámetros | 3,4B + 0,4B vision | 4B | 4B |
| Contexto | 256k | no disponible | no disponible |
| Multilingüe | 10 idiomas | sí (no especificado) | sí (no especificado) |
| Visión | Sí | No (solo texto) | No (solo texto) |
| Licencia | Apache 2.0 | Apache 2.0 | Gemma license (restrictiva) |
| Formato GGUF | Sí | Disponible | Disponible |

Minime se diferencia por su visión integrada y su mayor contexto, mientras que Qwen 3 4B supera ligeramente en algunas métricas de conocimiento general. Gemma 3 4B tiene una licencia más restrictiva.

## Limitaciones y advertencias

- Al ser una cuantización GGUF, puede haber una pérdida de precisión respecto al modelo original en BF16, especialmente en tareas de razonamiento complejo.
- No se han publicado evaluaciones específicas de sesgos o alucinaciones para este modelo. Al ser un modelo pequeño, es más propenso a errores factuales que modelos más grandes.
- El contexto de 256k tokens puede degradar la calidad de las respuestas en las posiciones extremas de la ventana.
- Aunque declara 10 idiomas, el rendimiento puede variar significativamente entre ellos; los idiomas con menos representación en el entrenamiento probablemente tengan peor calidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base (Ministral 3) no tenga restricciones adicionales; según la información disponible, no las tiene.
- No se dispone de información sobre el proceso de cuantización (imatrix, nivel de bits, etc.), por lo que se recomienda probar el modelo en el caso de uso concreto antes de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leeroy-jankins/minime
- Modelo base (Mistral AI): https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Cuantización de unsloth: https://huggingface.co/unsloth/Ministral-3-3B-Reasoning-2512-GGUF
- Colección de cuantizaciones de Ministral 3: https://huggingface.co/collections/mistralai/ministral-3-quants
