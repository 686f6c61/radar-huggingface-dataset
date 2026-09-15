# Fluxmire/Qwen-3.6-27B-CobaltOsprey

## Resumen

Qwen-3.6-27B-CobaltOsprey es un ajuste fino derivado de Qwen/Qwen3.6-27B a través del modelo intermedio Tooony133/Qwen-3.6-27B-SkinnyPete, publicado por el usuario de HuggingFace Fluxmire. El repositorio almacena los pesos en FP8 mediante el formato compressed-tensors y declara 27.356.728.560 parámetros (unos 27,36 mil millones), con un tamaño total de repositorio de 31,2 GB.

La etiqueta de pipeline es image-text-to-text, lo que indica un modelo multimodal que acepta imagen y texto como entrada y devuelve texto; también figuran las etiquetas conversational y qwen3_5, que lo sitúan en la familia Qwen 3.x. La licencia declarada es Apache-2.0 y el repositorio está marcado como compatible con los inference endpoints de HuggingFace.

El interés práctico de esta ficha es acotado: se trata de un derivado comunitario recién publicado (15 de septiembre de 2026) con cero descargas y cero likes, sin resultados de benchmarks ni model card detallada que describa el entrenamiento. Sirve para documentar la cadena de derivación Qwen3.6-27B → SkinnyPete → CobaltOsprey y la distribución de pesos en FP8, pero no hay datos publicados sobre el proceso de ajuste ni sobre su calidad final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Las etiquetas remiten a la familia qwen3_5 y el modelo base se denomina Qwen3.6-27B, pero no se publican detalles de arquitectura |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible, no se indica que el modelo sea de tipo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 en el repositorio (formato compressed-tensors). Otras cuantizaciones, no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el enlace de licencia apunta al fichero LICENSE de Qwen/Qwen3.6-27B) |
| Formato de pesos | safetensors, almacenados en FP8 mediante compressed-tensors |
| Pipeline | image-text-to-text (multimodal, entrada de imagen y texto) |
| Modelo base | Tooony133/Qwen-3.6-27B-SkinnyPete, derivado a su vez de Qwen/Qwen3.6-27B |
| Tamano del repositorio | 31,2 GB |
| Autor | Fluxmire |
| Compatibilidad | endpoints_compatible, transformers |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo: se desconoce el tipo de atencion, el numero de capas, la dimension oculta, la configuracion de RoPE o si incorpora mecanismos de atencion lineal o hibridos. Lo unico deducible de los metadatos es que pertenece a la familia Qwen 3.x (etiqueta qwen3_5) y que es un modelo multimodal capaz de procesar imagenes y texto, dado que su pipeline es image-text-to-text.

Tampoco se documentan los datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Se sabe que existen al menos dos etapas de derivacion: el modelo base Qwen/Qwen3.6-27B y un ajuste intermedio denominado SkinnyPete, del que no se especifica el objetivo ni la metodologia. La unica innovacion tecnica observable es el almacenamiento de los pesos en FP8 con compressed-tensors, un formato de checkpoint cuantizado orientado al despliegue en motores de inferencia que soportan esta representacion.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational.
- Procesamiento de imagenes como entrada junto con texto (pipeline image-text-to-text), con salida en texto.
- Capacidad multimodal orientada a tareas de comprension de imagen y texto combinados.
- Soporte de tool calling o function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponibles, no se declara lista de idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible, no documentado.
- Rendimiento real en cualquiera de estas tareas: no disponible, sin benchmarks publicados.

## Casos de uso

- Analisis de documentos escaneados: al aceptar imagen y texto, puede usarse para extraer informacion de facturas, albaranes o formularios fotografiados y devolver los campos en texto estructurado. Requiere validacion en produccion, ya que no hay benchmarks publicados.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo en catalogos, bibliotecas de imagenes o plataformas de publicacion, aprovechando el pipeline image-text-to-text.
- Revision de capturas de interfaz: interpretacion de pantallazos de aplicaciones para generar informes de errores, documentacion de pasos de reproduccion o deteccion de elementos de UI.
- Asistente conversacional con entrada visual: atencion a usuarios que adjuntan fotos de productos o incidencias y esperan respuestas en lenguaje natural en una conversacion multi-turno.
- Analisis de graficos e infografias: conversion de graficos estadisticos incluidos en informes en texto resumido o tablas descriptivas.
- Moderacion asistida de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios antes de su publicacion, con un modelo autoalojado que evita enviar datos a servicios de terceros.
- Base para nuevos ajustes finos: al estar bajo licencia Apache-2.0 y en formato safetensors, puede reutilizarse como punto de partida para especializaciones verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones calculadas a partir del numero de parametros declarado (27,36 mil millones), no datos aportados por el autor, y no estan verificadas.

- Pesos en FP8, tal como se distribuyen: aproximadamente 27,4 GB solo de pesos, mas overhead de activaciones y cache KV, lo que situa el requisito practico en torno a 32-40 GB de VRAM segun la longitud de contexto.
- Pesos en BF16/FP16 tras reconstruir el checkpoint: aproximadamente 54,7 GB, lo que exige al menos 64-80 GB de VRAM.
- Cuantizacion a 4 bits (estimada): aproximadamente 15-17 GB de pesos, lo que permite ejecucion en GPU de consumo.
- GPU profesionales recomendadas: H100 80 GB, A100 80 GB o A100 40 GB para FP8 y BF16; L40S 48 GB para FP8.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo en cuantizacion de 4 bits; en FP8 no cabe completa en 24 GB y requeriria offloading a memoria del sistema.
- Nota de compatibilidad: la inferencia nativa en FP8 requiere hardware con soporte de ese tipo de dato (arquitecturas Hopper o Ada). En GPUs anteriores, el modelo se ejecutaria en precision superior con conversion previa.
- Opciones de despliegue: vLLM y SGLang soportan checkpoints compressed-tensors; TGI y transformers son alternativas. Para llama.cpp u Ollama seria necesaria una conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de ninguno de los modelos de la cadena, por lo que la comparacion se limita a los metadatos publicados.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Pipeline | Notas |
|---|---|---|---|---|---|---|
| Fluxmire/Qwen-3.6-27B-CobaltOsprey | 27,36 B | no disponible | Apache-2.0 | safetensors en FP8 (compressed-tensors) | image-text-to-text | Objeto de esta ficha; 0 descargas |
| Tooony133/Qwen-3.6-27B-SkinnyPete | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | Modelo base directo del anterior |
| Qwen/Qwen3.6-27B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 (segun el enlace de licencia) | no disponible | no disponible | Modelo original de la cadena |

Alternativas de otros desarrolladores con tamano y categoria equivalentes: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de validacion comunitaria: el repositorio registra cero descargas y cero likes en la fecha de consulta, por lo que no existe evidencia externa de funcionamiento correcto.
- No hay model card detallada: se desconoce el dataset de ajuste, la metodologia, la longitud de contexto efectiva y los idiomas soportados, lo que impide evaluar su idoneidad para produccion.
- Riesgo de alucinacion: no cuantificado ni documentado por el autor; es un riesgo inherente a los modelos generativos de este tipo.
- Sesgos conocidos: no disponibles, no se publica ninguna evaluacion de sesgo, toxicidad o seguridad.
- Se desconoce el proposito del ajuste intermedio SkinnyPete, del que parte este modelo; un fine-tune sin documentar puede degradar capacidades del modelo original.
- La cuantizacion en FP8 puede introducir perdida de precision frente a los pesos originales en BF16; no se publican mediciones de esa degradacion.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero el enlace de licencia del repositorio apunta al fichero LICENSE de Qwen/Qwen3.6-27B, por lo que conviene verificar las condiciones aplicables al modelo base antes de un uso comercial.
- La fecha de creacion y actualizacion de los metadatos (15 de septiembre de 2026) indica que el modelo es muy reciente y probablemente cambiara sin aviso.
- No se distribuyen pesos en GGUF ni cuantizaciones de 4 bits, por lo que el despliegue en hardware de consumo exige trabajo adicional de conversion y validacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Fluxmire/Qwen-3.6-27B-CobaltOsprey
- Modelo base directo: https://huggingface.co/Tooony133/Qwen-3.6-27B-SkinnyPete
- Modelo original de la cadena: https://huggingface.co/Qwen/Qwen3.6-27B
- Texto de licencia referenciado: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
