# alst10/gemma4-masterchef-merged

## Resumen

El modelo `alst10/gemma4-masterchef-merged` es un fine-tuning del modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, desarrollado por el usuario alst10. Se trata de un modelo multimodal de tipo imagen-texto (image-text-to-text) basado en la familia Gemma 4 de Google DeepMind, aunque no se especifica en la documentación disponible qué tarea concreta aborda el fine-tuning (el nombre "masterchef" sugiere una posible especialización en dominios culinarios, pero no hay confirmación). El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial y modificación, y está disponible en formato safetensors.

La relevancia de este modelo radica en que es un ejemplo de fine-tuning eficiente mediante la librería Unsloth, que acelera el entrenamiento y reduce el consumo de memoria. Con aproximadamente 5.123 millones de parámetros, se sitúa en la gama de modelos medianos, adecuado para despliegue en hardware de gama media. Sin embargo, la documentación pública es muy limitada: no se publican benchmarks, detalles del dataset de entrenamiento ni métricas de evaluación, por lo que su rendimiento real no puede verificarse a partir de las fuentes disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basada en Gemma 4 E2B |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, se desconoce si hay versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada. El modelo base, `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, es una version cuantizada a 4 bits del modelo Gemma 4 E2B de Google, que pertenece a la familia Gemma 4. Segun la documentacion oficial de Gemma 4, estos modelos son vision-language models (VLM) que combinan un codificador de vision con un decodificador transformer para procesar tanto texto como imagenes. El pipeline declarado es `image-text-to-text`, lo que confirma su naturaleza multimodal.

El entrenamiento se realizo con la libreria Unsloth, que optimiza el proceso de fine-tuning mediante tecnicas como LoRA (Low-Rank Adaptation) y cuantizacion en 4 bits. No se especifica el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. El nombre "masterchef" podria indicar un fine-tuning en un dominio especifico (p. ej., recetas o gastronomia), pero esto es especulativo y no esta confirmado en la documentacion.

## Capacidades

- Generacion de texto y comprension de lenguaje natural, heredadas del modelo base Gemma 4.
- Procesamiento multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), lo que permite responder a preguntas sobre imagenes, describir contenido visual, etc.
- Soporte de conversacion multi-turno, ya que el modelo base es una variante "it" (instruction-tuned).
- No se documentan capacidades especificas de tool calling, function calling o razonamiento agente.
- No se confirma soporte para otros idiomas mas alla del ingles.

## Casos de uso

Dado que la informacion publica es escasa, los siguientes casos de uso son inferencias razonables basadas en las capacidades del modelo base Gemma 4 E2B, pero no estan verificados para este fine-tuning concreto:

- Descripcion de imagenes en aplicaciones de accesibilidad: el modelo puede generar descripciones textuales de fotografias o ilustraciones, ayudando a personas con discapacidad visual.
- Asistente de cocina basado en fotos: si el fine-tuning se especializo en gastronomia, podria analizar una foto de ingredientes y sugerir recetas, aunque esto es hipotetico.
- Moderacion de contenido visual: clasificar o describir imagenes para detectar contenido inapropiado en plataformas sociales.
- Generacion de respuestas contextuales en chatbots con soporte de imagenes: por ejemplo, un asistente de atencion al cliente que recibe capturas de pantalla o fotos de productos.
- Educacion interactiva: explicar diagramas, graficos o ilustraciones cientificas a estudiantes.
- Analisis de documentos escaneados: extraer informacion de imagenes de documentos, facturas o formularios.

En todos los casos, el despliegue requiere una infraestructura compatible con transformers y, dado el tamano del modelo, al menos 10-12 GB de VRAM para inferencia en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo. Tampoco se comparan resultados con el modelo base o con otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~5.1B parametros en safetensors (precision FP16), se requieren aproximadamente 10-12 GB de VRAM para cargar el modelo en memoria. Con cuantizacion a 4 bits (como la usada en el entrenamiento), podria reducirse a unos 4-6 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 (16/40/80 GB) o H100. Tambien es viable en GPUs consumer con 12 GB o mas.
- Si cabe en consumer GPU: si, en GPUs con 12 GB o mas (p. ej., RTX 3080 Ti, RTX 4070 Ti, etc.) usando cuantizacion.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), transformers con `device_map="auto"`, o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponible. Depende del hardware y de la optimizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. Como referencia, el modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` tiene aproximadamente el mismo numero de parametros (5.1B) y es la base de este fine-tuning. Otros modelos multimodales de tamano similar incluyen LLaVA-1.6 (7B), Qwen-VL (7B) o Idefics2 (8B), pero no hay datos publicos para comparar rendimiento con este fine-tuning concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alst10/gemma4-masterchef-merged | 5.1B | no disponible | Apache 2.0 | HuggingFace |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit | 5.1B | no disponible | Apache 2.0 | HuggingFace |
| LLaVA-1.6 7B | 7B | 4096 | Apache 2.0 | HuggingFace |
| Qwen-VL 7B | 7B | 8192 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- No hay documentacion sobre el dataset de fine-tuning, por lo que se desconocen posibles sesgos introducidos durante el entrenamiento.
- El modelo solo declara soporte para ingles; su rendimiento en otros idiomas es incierto.
- No se han publicado evaluaciones de seguridad, robustez o alucinacion.
- El nombre "masterchef" sugiere una especializacion no confirmada; el modelo podria comportarse de forma impredecible fuera de su dominio de entrenamiento.
- Al ser un fine-tuning no oficial de Gemma 4, no cuenta con el respaldo de Google DeepMind ni con las garantias de calidad de los modelos base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que no existan restricciones adicionales derivadas del modelo base (Gemma 4 tiene su propia licencia, aunque en este repo se declara Apache 2.0; se recomienda revisar los terminos de Gemma 4).
- No se proporcionan instrucciones de uso, prompt template ni ejemplos de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/alst10/gemma4-masterchef-merged
- Repositorio del adapter LoRA (relacionado): https://huggingface.co/alst10/gemma4-masterchef-lora
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Documentacion de transformers para Gemma4: https://huggingface.co/docs/transformers/model_doc/gemma4
- Sitio no oficial de Gemma 4: https://gemmai4.com/
