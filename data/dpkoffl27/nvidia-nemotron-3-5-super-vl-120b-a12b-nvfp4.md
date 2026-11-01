# dpkoffl27/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 es una cuantizacion en NVFP4 (formato de coma flotante de 4 bits de NVIDIA, empaquetado como 8-bit en ModelOpt) del modelo multimodal NVIDIA Nemotron 3.5 Super VL, publicado por el usuario dpkoffl27 en HuggingFace. El modelo base es `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, un transformer de tipo `nemotron_h_omni` orientado a tareas image-text-to-text, es decir, entrada conjunta de imagen y texto con salida de texto.

El nombre comercial indica una arquitectura MoE (Mixture of Experts) con 120B parametros totales y 12B parametros activos por token, aunque el recuento real de safetensors del repositorio cuantizado asciende a 65.769.840.138 parametros, dato que conviene contrastar con la ficha oficial del modelo base antes de dimensionar despliegues. La relevancia de esta publicacion radica en que reduce el peso en disco del checkpoint BF16 a unos 75 GB, lo que permite servir un modelo de gran tamano en infraestructura mas modesta siempre que se disponga de GPUs con soporte para NVFP4.

El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en HuggingFace. La licencia declarada es OpenMDW-1.1 y los idiomas soportados segun los metadatos son ingles, espanol, frances, aleman, italiano y japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `nemotron_h_omni` (MoE, segun nomenclatura del modelo) |
| Parametros totales | 65.769.840.138 (recuento real de safetensors del checkpoint cuantizado); el nombre indica 120B en el modelo base |
| Parametros activos | 12B (segun nomenclatura A12B; no verificado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, empaquetado como 8-bit mediante ModelOpt mixed) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura como `nemotron_h_omni`, una variante multimodal de la familia Nemotron orientada a entrada image-text-to-text. La nomenclatura del modelo (Super-VL-120B-A12B) sugiere un diseno Mixture of Experts con 120B parametros totales y 12B activos por token, aunque el recuento efectivo de parametros en safetensors del checkpoint cuantizado es de 65.769.840.138, discrepancia que debe resolverse consultando la model card oficial del modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada. Esta publicacion concreta es una cuantizacion NVFP4 del checkpoint BF16 original, generada con ModelOpt en modo mixed y empaquetada como 8-bit, lo que reduce el espacio en disco a aproximadamente 75 GB frente al modelo base en BF16.

## Capacidades

- Generacion de texto e inferencia multimodal image-text-to-text: acepta imagenes y texto como entrada y produce texto.
- Razonamiento y conversacion multi-turno (tag `conversational`).
- Capacidades multilingues en ingles, espanol, frances, aleman, italiano y japones.
- Integracion con el ecosistema transformers mediante `custom_code` y `trust_remote_code`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking, vision detallada, audio: solo se confirma vision por el pipeline image-text-to-text; el resto no disponible.

## Casos de uso

- Analisis documental con imagenes: extraccion de informacion de facturas, formularios o capturas mediante el pipeline image-text-to-text, aprovechando el soporte multilingue para documentos en espanol, frances, aleman o japones.
- Asistentes conversacionales multimodales: atencion al cliente donde el usuario adjunta capturas de pantalla o fotos de producto y el modelo responde en texto; el tag `conversational` y la ventana de contexto (no disponible) condicionaran la profundidad del historial.
- Descripcion y etiquetado de imagenes a escala: generacion de alt-text y metadatos en seis idiomas para catalogos o repositorios de contenido.
- Moderacion de contenido visual con justificacion textual: el modelo puede describir y clasificar el contenido de una imagen y devolver una explicacion en lenguaje natural.
- Extraccion de datos de tablas e infografias: conversion de tablas en imagen a texto estructurado para pipelines de datos.
- Despliegue en infraestructura limitada: la cuantizacion NVFP4 reduce el checkpoint a unos 75 GB, lo que permite servir el modelo en nodos con GPUs Blackwell (B200/GB200) o configuraciones multi-GPU compatibles con NVFP4, en lugar de requerir el checkpoint BF16 completo.
- Prototipado de aplicaciones RAG multimodales: combinacion de recuperacion de documentos con imagenes y generacion de respuestas mediante transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio ocupa 75 GB en disco; la VRAM necesaria sera igual o superior a esa cifra mas el overhead de activaciones y cache KV.
- GPUs recomendadas: NVFP4 requiere hardware con soporte nativo para dicho formato (familia NVIDIA Blackwell, p. ej. B200/GB200); no se garantiza funcionamiento en arquitecturas anteriores sin emulacion.
- GPU de consumo: no disponible; no se confirma compatibilidad con RTX 4090 u otras GPUs consumer.
- Opciones de despliegue: transformers con `trust_remote_code=True` (libreria declarada). Compatibilidad con vLLM, TensorRT-LLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (esta ficha) | 65.769.840.138 reales en safetensors (120B/A12B nominal) | no disponible | Image-text-to-text | OpenMDW-1.1 | Gated en HuggingFace, 4 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (modelo base) | 120B/A12B nominal | no disponible | Image-text-to-text | no disponible en esta ficha | Referenciado como base; acceso segun ficha oficial |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargar.
- Discrepancia de parametros: el nombre indica 120B totales y 12B activos, pero los safetensors suman 65.769.840.138 parametros; verificar la ficha del modelo base antes de planificar capacidad.
- Cuantizacion NVFP4: puede degradar la calidad frente al checkpoint BF16, especialmente en tareas de vision fina y razonamiento numerico; no se han publicado evaluaciones de la perdida de precision.
- Requiere hardware compatible con NVFP4; el despliegue en GPUs sin soporte nativo puede no ser viable.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del repositorio.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas para este checkpoint.
- Sesgos conocidos: no documentados en la informacion disponible.
- Cobertura idiomatica limitada a en, es, fr, de, it, ja segun metadatos; el rendimiento real por idioma no esta verificado.
- Licencia OpenMDW-1.1: revisar las condiciones completas antes de uso comercial; el campo `license:other` en los tags sugiere terminos adicionales.
- Repositorio con muy baja adopcion (4 descargas, 0 likes) y creado por un usuario no oficial; conviene validar la integridad de los pesos frente al modelo base de NVIDIA.
- Longitud de contexto no disponible: limita la planificacion de aplicaciones con documentos o historiales largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dpkoffl27/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Paper, blog, repositorio o demo oficiales: no disponibles en la informacion proporcionada.
