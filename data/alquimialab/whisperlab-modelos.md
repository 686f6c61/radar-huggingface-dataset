# alquimialab/whisperlab-modelos

## Resumen

whisperlab-modelos es un repositorio de pesos convertidos para reconocimiento automatico de voz (ASR) publicado por ALQUIM_IA.LAB bajo el identificador `alquimialab/whisperlab-modelos`. No se trata de un modelo entrenado desde cero, sino de conversiones de los pesos de OpenAI Whisper a formatos optimizados para inferencia local, empleados por la aplicacion de dictado whisper.lab. El repositorio agrupa tres artefactos: `whisper-large-v3-turbo-Q8_0.gguf`, `whisper-small-Q8_0.gguf` y `wl-large-v3-turbo-ct2.tar`.

La variante principal corresponde a Whisper large-v3-turbo, con 808.904.208 parametros y un tamano de repositorio total de 2,8 GB. Se distribuye en dos formatos de despliegue: GGUF con cuantizacion Q8_0 (orientado a GPU con Vulkan) y CTranslate2 (motor principal para NVIDIA). La variante small cubre equipos mas modestos.

El modelo es relevante para quienes necesitan transcripcion de audio en portugues e ingles sin depender de servicios en la nube, ya que los pesos se empaquetan en formatos que facilitan la ejecucion local y la verificacion de integridad por SHA-256. La licencia MIT heredada de OpenAI permite uso comercial. La adopcion publica en HuggingFace es muy baja (5 descargas, 0 likes), por lo que no existe validacion comunitaria significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, OpenAI) |
| Parametros totales | 808.904.208 (variante large-v3-turbo; no especificado para la variante small) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo ASR; procesa audio, no contexto de texto) |
| Tipos de cuantizacion | GGUF Q8_0 (large-v3-turbo y small) |
| Idiomas soportados | Portugues (pt) e ingles (en), segun los tags del repositorio |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0) y CTranslate2 (archivo `.tar`) |

## Arquitectura y entrenamiento

Los pesos proceden de OpenAI Whisper, un modelo de reconocimiento automatico de voz con arquitectura transformer encoder-decoder, disenado para transcribir audio en multiples idiomas. Este repositorio no aporta informacion sobre el proceso de entrenamiento: no se documentan numero de tokens, composicion del dataset, ni fases de RLHF o DPO, porque su proposito es unicamente la conversion de formato de los pesos originales.

La aportacion tecnica del autor se limita a la conversion a GGUF con cuantizacion Q8_0 y a CTranslate2, formatos que permiten desplegar el modelo en GPU con backend Vulkan o NVIDIA respectivamente, sin requerir PyTorch completo. La model card indica que la aplicacion verifica cada archivo mediante SHA-256 antes de su uso. No se describe ninguna innovacion adicional (atencion lineal, decodificacion especulativa, etc.) mas alla de las capacidades nativas de Whisper.

## Capacidades

- Reconocimiento automatico de voz (transcripcion de audio a texto).
- Transcripcion en portugues e ingles segun los idiomas declarados.
- Dos niveles de capacidad: la variante large-v3-turbo (mayor precision) y la variante small (menor consumo de recursos).
- Despliegue en GPU mediante Vulkan a traves de los archivos GGUF.
- Despliegue en NVIDIA mediante CTranslate2, que actua como motor principal.
- Verificacion de integridad de los archivos por SHA-256 previa al uso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni ninguna capacidad mas alla de la transcripcion de voz.

## Casos de uso

- Dictado por voz en escritorio: es el uso original del modelo, integrado en la aplicacion whisper.lab para convertir la voz del usuario en texto sobre el sistema operativo.
- Transcripcion de reuniones y notas de voz: la variante large-v3-turbo ofrece la mejor precision disponible en el repositorio para convertir grabaciones en actas de texto.
- Generacion de subtitulos: con los pesos CTranslate2 sobre GPU NVIDIA se pueden procesar pistas de audio y volcar transcripciones temporizadas.
- Aplicaciones en portugues: el modelo esta preparado especificamente para este idioma, lo que lo hace util para equipos de trabajo lusofonos.
- Despliegue en equipos modestos: la variante small en GGUF Q8_0 permite transcripcion en ordenadores con pocos recursos, sin GPU dedicada.
- Procesamiento por lotes en servidores con NVIDIA: el archivo CTranslate2 esta pensado para servir transcripciones de forma continua mediante el motor principal.
- Herramientas de accesibilidad: conversion de voz a texto para personas con dificultades de escritura, ejecutando el modelo de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros y la cuantizacion Q8_0): aproximadamente 1 GB para la variante large-v3-turbo y en torno a 0,3-0,5 GB para la variante small. No confirmado por el autor.
- GPU compatibles: la variante GGUF esta orientada a GPU con Vulkan; el archivo CTranslate2 esta orientado a GPU NVIDIA.
- Cabe en GPU de consumo: si, tanto la variante small como la large-v3-turbo Q8_0 deberian caber en GPU de consumo con al menos 2 GB de VRAM, aunque el dato no esta confirmado.
- Opciones de despliegue: GGUF (compatible con whisper.cpp y llama.cpp), CTranslate2 (por ejemplo via faster-whisper) y ejecucion en CPU.
- Latencia y throughput: no disponibles.
- Tamano total del repositorio: 2,8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Formatos | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisperlab-modelos (large-v3-turbo) | 808.904.208 | GGUF Q8_0, CTranslate2 | pt, en | MIT | HuggingFace, 5 descargas |
| OpenAI Whisper large-v3-turbo (base) | ~809 M (cifra de referencia publica) | safetensors, PyTorch | multilingue | MIT | GitHub / HuggingFace de OpenAI |
| OpenAI Whisper small (base) | ~244 M (cifra de referencia publica) | safetensors, PyTorch | multilingue | MIT | GitHub / HuggingFace de OpenAI |
| OpenAI Whisper large-v3 (base) | ~1.550 M (cifra de referencia publica) | safetensors, PyTorch | multilingue | MIT | GitHub / HuggingFace de OpenAI |

Los parametros de los modelos base se incluyen como cifras de referencia publica; no provienen de la informacion facilitada por el autor de este repositorio. Los resultados de rendimiento comparado no estan disponibles.

## Limitaciones y advertencias

- Es un modelo exclusivamente de reconocimiento de voz; no genera texto libre ni mantiene conversaciones.
- Los idiomas declarados son portugues e ingles; no se garantiza el funcionamiento en otros idiomas aunque el modelo base Whisper sea multilingue.
- Whisper es propenso a alucinaciones de transcripcion en fragmentos de silencio o ruido; conviene validar las salidas en produccion.
- No se han publicado benchmarks ni evaluaciones de calidad para estas conversiones concretas.
- Adopcion muy baja (5 descargas, 0 likes): sin validacion comunitaria ni historial de incidencias.
- El rendimiento puede degradarse por la cuantizacion Q8_0 respecto a los pesos originales sin cuantizar.
- La licencia MIT permite uso comercial, pero los creditos corresponden a OpenAI (copyright 2022); es responsabilidad del usuario cumplir los terminos de la licencia original.
- No se documentan sesgos demograficos ni de acentos; se desconocen para estas conversiones.
- No hay informacion sobre latencia, throughput ni limites de longitud de audio.

## Enlaces

- HuggingFace: https://huggingface.co/alquimialab/whisperlab-modelos
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Licencia MIT de OpenAI Whisper: https://github.com/openai/whisper/blob/main/LICENSE
- Proyecto WhisperLab (tercero, no relacionado con este repositorio): https://github.com/LiteObject/WhisperLab/blob/main/MODEL_GUIDE.md
- Model guide de WhisperLab: https://github.com/LiteObject/WhisperLab/blob/main/MODEL_GUIDE.md

Nota: los resultados de busqueda web encontrados (Whisper Labs, ImagineLab, Models.dev, LocalModel.run) no corresponden a este modelo concreto y no se han incluido como fuentes directas.
