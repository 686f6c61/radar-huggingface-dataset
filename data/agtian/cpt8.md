# Agtian/cpt8

## Resumen
Agtian/cpt8 es un modelo multimodal publicado en HuggingFace por el usuario Agtian, etiquetado con el pipeline image-text-to-text y la etiqueta "gemma4". Cuenta con 5.123.178.051 parametros (~5,12 mil millones) almacenados en safetensors, y su model card lo describe como un ajuste fino (SFT) realizado con TRL sobre un modelo base que la propia ficha declara como Agtian/cpt8, es decir, una autorreferencia que apunta a un posible error de configuracion.

El modelo se ha entrenado mediante fine-tuning supervisado con las librerias TRL 0.24.0 y Unsloth, sobre Transformers 5.5.0, PyTorch 2.8.0+cu129, Datasets 4.3.0 y Tokenizers 0.22.2. La ficha disponible es minima: no incluye detalles del dataset, numero de tokens, composicion de los datos ni resultados de evaluacion, y no se especifican licencia ni idiomas.

Su relevancia actual es limitada y dificil de valorar, ya que el repositorio registra 0 descargas y 0 "likes", la model card no esta desarrollada y no existe informacion publica sobre su rendimiento. Se trata, por tanto, de una publicacion experimental o preliminar cuya utilidad practica no puede confirmarse con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; las etiquetas "gemma4" y el pipeline image-text-to-text sugieren un transformer decoder-only multimodal de la familia Gemma con torre de vision (inferencia a partir de etiquetas, sin confirmar) |
| Parametros totales | 5.123.178.051 (~5,12 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un marcador de posicion "licence: license" sin texto legal) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text (multimodal imagen-texto) |
| Libreria | transformers |
| Modelo base declarado | Agtian/cpt8 (autorreferencia; probable error de configuracion) |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL y Unsloth |
| Tamano del repositorio | 41,1 GB |
| Fecha de creacion | 2026-10-11 |
| Fecha de actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento
La informacion disponible no describe la arquitectura de forma directa. Las etiquetas del repositorio incluyen "gemma4", lo que apunta a que el modelo deriva de la familia Gemma, y el pipeline declarado es image-text-to-text, lo que implica capacidad multimodal con entrada de imagen y texto. Esto es coherente con un transformer decoder-only provisto de un codificador de vision, pero no puede confirmarse con los datos publicados. Tampoco se detalla la longitud de contexto ni el tipo de atencion.

En cuanto al entrenamiento, la model card indica que se trata de un fine-tuning por SFT (supervised fine-tuning) generado con TRL y Unsloth. No se especifica el dataset, el numero de tokens de entrenamiento, la composicion de los datos ni si hubo etapas posteriores de RLHF o DPO. Las versiones de framework reportadas son TRL 0.24.0, Transformers 5.5.0, PyTorch 2.8.0+cu129, Datasets 4.3.0 y Tokenizers 0.22.2. El campo base_model aparece como Agtian/cpt8, es decir, el propio modelo, lo que sugiere un fallo de configuracion en lugar de un modelo base real.

## Capacidades
- Generacion de texto y conversacion multi-turno: la etiqueta "conversational" y el ejemplo de la model card muestran uso mediante pipeline de generacion con mensajes con roles.
- Procesamiento multimodal imagen-texto: el pipeline declarado es image-text-to-text, por lo que el modelo estaria disenado para recibir imagenes junto a texto.
- Fine-tuning supervisado: se trata de un modelo ajustado, no de un modelo base entrenado desde cero.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo "thinking", audio, etc.): no disponible.

Nota: salvo la generacion de texto y la orientacion multimodal, que se derivan de las etiquetas y el pipeline declarados, el resto de capacidades no puede confirmarse con la informacion publicada.

## Casos de uso
Los siguientes casos son hipoteticos y se plantean a partir de las capacidades declaradas (conversacion y entrada imagen-texto). No han sido validados con datos de rendimiento del modelo.

- Asistente conversacional multimodal: atender consultas de usuario que combinan texto e imagenes, por ejemplo dudas sobre capturas de pantalla, diagramas o fotografias, apoyandose en el pipeline image-text-to-text.
- Descripcion y etiquetado de imagenes: generar pies de foto o metadatos descriptivos para catalogos y bibliotecas de imagenes.
- Extraccion de informacion de documentos escaneados: interpretar facturas, formularios o recibos presentados como imagen y devolver texto estructurado.
- Soporte al usuario con contexto visual: resolver incidencias tecnicas en las que el usuario adjunta una imagen del error o del producto.
- Preprocesado en pipelines de datos: enriquecer conjuntos de datos anadiendo descripciones o respuestas a pares imagen-texto.
- Prototipado de interfaces conversacionales: servir como backend de un chatbot experimental integrado con la API de transformers en un entorno de pruebas.
- Educacion y asistencia visual: responder preguntas sobre material grafico (graficos, mapas, esquemas) en un contexto conversacional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales (por ejemplo MMMU o VQA), y no se aportan comparaciones con otros modelos.

## Requisitos de hardware
Las cifras de VRAM son estimaciones teoricas basadas en el numero de parametros (~5,12 B), no en mediciones del modelo.

- Pesos en bf16/fp16: aproximadamente 10,2 GB, mas memoria para activaciones y cache KV. VRAM recomendada en torno a 12-16 GB segun contexto.
- Pesos en fp32: aproximadamente 20,5 GB.
- Cuantizacion a 8 bits: en torno a 5-6 GB de pesos; a 4 bits, en torno a 2,6-3,5 GB. Estos formatos no estan publicados en el repositorio (solo safetensors), por lo que requeririan conversion previa.
- GPU consumer: cabe con holgura en RTX 4090 o RTX 3090 (24 GB) en bf16; en RTX 4080/4070 Ti (16 GB) seria ajustado en bf16 y mas comodo con cuantizacion; en RTX 3060 12 GB solo con cuantizacion.
- GPU de datacenter: A100, H100, L40S y similares sin problema, con margen para lotes mayores.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI para servicio; llama.cpp y Ollama requeririan convertir los pesos a GGUF, que no esta disponible en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota: el repositorio ocupa 41,1 GB, muy por encima de lo esperado para un unico checkpoint de 5,12 B en bf16 (~10 GB), lo que sugiere pesos en fp32, multiples checkpoints de entrenamiento u otros artefactos. Conviene revisar el contenido del repositorio antes de descargarlo.

## Comparativa con modelos similares
La familia exacta de Agtian/cpt8 no esta confirmada, de modo que la comparacion es orientativa. Se incluyen modelos reales de tamano y perfil similares como referencia.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agtian/cpt8 | ~5,12 B | no disponible | si (image-text-to-text, por etiqueta) | no disponible | HuggingFace |
| Gemma 3 4B | ~4 B | 128k | variante multimodal disponible | Gemma License | HuggingFace |
| Qwen2.5-VL-7B | ~7 B | 32k nativo, ampliable | si | Apache-2.0 | HuggingFace |
| Llama 3.2 11B Vision | ~11 B | 128k | si | Llama Community License | HuggingFace |

No se dispone de metricas de rendimiento de Agtian/cpt8, por lo que no es posible compararlo cuantitativamente con estas alternativas.

## Limitaciones y advertencias
- Licencia no especificada: no puede confirmarse si se permite el uso comercial. El texto "licence: license" es un marcador de posicion sin contenido legal.
- Sin datos de evaluacion: no hay benchmarks, por lo que el rendimiento real es desconocido.
- Modelo no validado por la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha.
- Model card incompleta: no se documentan dataset, tokens de entrenamiento, idiomas ni arquitectura.
- Autorreferencia en base_model: el modelo se declara a si mismo como base, lo que indica un error de configuracion y dificulta rastrear su procedencia real.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan datos que lo mitiguen (por ejemplo, tecnicas de RLHF o evaluaciones de fidelidad).
- Capacidades multimodales no verificadas: el pipeline declara image-text-to-text, pero no hay ejemplos ni validacion publicados.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas.
- Fechas incoherentes: las marcas de creacion y actualizacion (2026) y las versiones de framework (Transformers 5.5.0) son posteriores a lo habitual, lo que puede indicar metadatos erroneos.
- Tamano de repositorio desproporcionado: 41,1 GB para 5,12 B parametros; conviene verificar los ficheros antes de su descarga e integracion en produccion.

## Enlaces
- Pagina del modelo en HuggingFace: https://huggingface.co/Agtian/cpt8
- Repositorio de TRL (framework de entrenamiento citado): https://github.com/huggingface/trl
- Repositorio de Unsloth (etiqueta "unsloth"): https://github.com/unslothai/unsloth
