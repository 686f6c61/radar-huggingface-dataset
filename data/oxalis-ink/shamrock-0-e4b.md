# oxalis-ink/shamrock-0-e4b

## Resumen

`shamrock-0-e4b` es un modelo de lenguaje multimodal desarrollado por Oxalis Ink, una organización que crea herramientas de aprendizaje de idiomas. Se trata de un fine-tuning del modelo base `google/gemma-4-E4B-it` de Google, especializado para las superficies de la aplicación de escritorio Oxalis: traducción por cámara, traducción de texto, tutor conversacional, chat y diccionario, con soporte para japonés, coreano y chino simplificado. El modelo está pensado para integrarse en flujos de aprendizaje de idiomas donde se requiere comprensión de imágenes (traducción visual) y generación de texto multilingüe.

Con aproximadamente 7,94 mil millones de parámetros y una ventana de contexto de 8.192 tokens, este modelo ofrece un equilibrio entre capacidad y eficiencia para tareas de traducción y conversación. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su disponibilidad en formatos safetensors y GGUF facilita su despliegue en entornos de producción con diferentes requisitos de hardware. La inclusión de un drafter MTP (multi-token prediction) para decodificación especulativa lo hace especialmente atractivo para aplicaciones en tiempo real como la traducción por cámara.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Gemma 4 E4B) |
| Parametros totales | 7.937.953.568 (7,94 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 8.192 tokens (según fuente externa; no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (checkpoint original), GGUF Q4_K_M (en carpeta `gguf/`) |
| Idiomas soportados | Japones, coreano, chino simplificado (especializado); otros idiomas no especificados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fp16), GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4 E4B, un transformer multimodal de Google que procesa tanto texto como imágenes. El fine-tuning realizado por Oxalis Ink adapta el modelo a tareas específicas de aprendizaje de idiomas: traducción de texto e imagen, tutor conversacional, chat y consulta de diccionario. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de ajuste (si se empleó RLHF, DPO u otra técnica). La model card indica que es el "hermano E4B" de `shamrock-0-e2b`, lo que sugiere que existe una versión más pequeña (probablemente 2B) con el mismo propósito.

Una innovación destacable es la inclusión de un drafter MTP (multi-token prediction) en la carpeta `MTP/`, que permite decodificación especulativa para acelerar la inferencia. Este drafter está disponible tanto en formato GGUF (para llama.cpp) como en formato Hugging Face, lo que facilita su uso en diferentes runtimes.

## Capacidades

- Traducción de texto entre japonés, coreano y chino simplificado, con posible soporte para otros idiomas (no especificado).
- Traducción de imágenes (cámara) gracias a la naturaleza multimodal del modelo base Gemma 4 E4B.
- Conversación multilingüe para tutoría de idiomas, con capacidad de mantener diálogos multi-turno.
- Generación de explicaciones y definiciones de diccionario para vocabulario en los idiomas soportados.
- Soporte para decodificación especulativa mediante el drafter MTP, lo que reduce la latencia en inferencia.
- Compatible con el runtime de llama.cpp (a través de los archivos GGUF) y con transformers (checkpoint safetensors).

## Casos de uso

- Traducción por cámara en tiempo real: la app Oxalis puede usar el modelo para traducir texto capturado por la cámara del dispositivo, aprovechando la capacidad multimodal de Gemma 4 E4B. El drafter MTP reduce la latencia, esencial para una experiencia fluida.
- Traducción de texto en documentos o conversaciones: el modelo puede traducir párrafos completos entre japonés, coreano y chino, manteniendo el contexto gracias a su ventana de 8K tokens.
- Tutor de idiomas conversacional: el modelo actúa como un asistente que mantiene diálogos en el idioma objetivo, corrige errores y ofrece explicaciones gramaticales, ideal para estudiantes autodidactas.
- Diccionario contextual: al consultar una palabra, el modelo genera definiciones, ejemplos de uso y sinónimos adaptados al nivel del estudiante.
- Generación de ejercicios de práctica: el modelo puede crear ejercicios de rellenar huecos, preguntas de comprensión o diálogos simulados para practicar vocabulario y gramática.
- Integración en pipelines de procesamiento de lenguaje natural multilingüe: gracias a su licencia Apache 2.0 y su formato estándar, puede integrarse en sistemas de traducción automática o análisis de sentimiento para los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo específico. Se recomienda consultar la documentación de Gemma 4 E4B para conocer el rendimiento del modelo base, aunque el fine-tuning puede alterar las métricas en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: para el checkpoint FP16 (7,94B parámetros) se necesitan aproximadamente 16 GB de VRAM (considerando pesos y overhead). Con cuantización Q4_K_M, la VRAM requerida se reduce a unos 5-6 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4080, RTX 4090, A100, etc.). Para Q4_K_M, una GPU con 6-8 GB (RTX 3060, RTX 4060, etc.) es suficiente.
- El modelo cabe en GPUs de consumo medio-alto con cuantización, lo que permite su uso en estaciones de trabajo personales.
- Opciones de despliegue: llama.cpp (gracias a los archivos GGUF), vLLM, TGI, o directamente con transformers. El drafter MTP se sirve con `--spec-type draft-mtp` en llama.cpp.
- Latencia y throughput: no se han publicado datos específicos. La decodificación especulativa con el drafter MTP puede reducir la latencia entre un 20-40% en comparación con la decodificación autoregresiva estándar, aunque esto depende del hardware y la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| shamrock-0-e4b | 7,94 B | 8.192 | Apache 2.0 | Traducción y tutoría de idiomas (ja, ko, zh) |
| google/gemma-4-E4B-it | 7,94 B | 8.192 | Apache 2.0 | Modelo base multimodal general |
| oxalis-ink/shamrock-0-e2b | ~2 B (estimado) | no disponible | Apache 2.0 | Misma especialización, versión más pequeña |
| Llama 3.1 8B | 8 B | 128K | Llama 3.1 | Modelo general, no multimodal |

La comparativa muestra que shamrock-0-e4b se distingue por su especialización en idiomas asiáticos y su naturaleza multimodal, mientras que alternativas como Llama 3.1 8B ofrecen mayor contexto pero no están optimizadas para traducción visual ni para esos idiomas específicos.

## Limitaciones y advertencias

- El modelo está especializado en japonés, coreano y chino simplificado; su rendimiento en otros idiomas puede ser inferior al de un modelo generalista.
- La ventana de contexto de 8.192 tokens es limitada para documentos largos; para traducciones extensas puede ser necesario dividir el texto.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este fine-tuning. Como modelo basado en Gemma 4, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda revisar los términos de la licencia de Gemma 4 (enlazada en la model card) para asegurar el cumplimiento.
- El modelo no incluye soporte explícito para tool calling o function calling, por lo que su uso en agentes autónomos requeriría adaptaciones externas.
- La información sobre el proceso de entrenamiento (dataset, técnicas de alineación) no está disponible, lo que dificulta evaluar su robustez en entornos de producción.

## Enlaces

- [Hugging Face - oxalis-ink/shamrock-0-e4b](https://huggingface.co/oxalis-ink/shamrock-0-e4b)
- [Free2AITools - Shamrock 0 E4b](https://free2aitools.com/model/oxalis-ink/shamrock-0-e4b)
- [Organización Oxalis en Hugging Face](https://huggingface.co/oxalis-ink/models)
- [Model card de Gemma 4 (Google)](https://ai.google.dev/gemma/docs/core/model_card_4)
