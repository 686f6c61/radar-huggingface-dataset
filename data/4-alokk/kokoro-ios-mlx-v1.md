# 4-alokk/kokoro-ios-mlx-v1

## Resumen

Kokoro-ios-mlx-v1 es un paquete de pesos derivado de hexgrad/Kokoro-82M, un modelo de síntesis de voz (TTS) de 82 millones de parámetros, publicado por el usuario 4-alokk. No se trata de un modelo reentrenado: el autor indica explícitamente que los archivos son únicamente una recompresión y reempaquetado de los pesos de referencia para su entrega dentro de la aplicación Adsorp para iPhone/iPad, que ejecuta el motor Kokoro en el dispositivo mediante el runtime MLX Swift. El repositorio tiene un tamaño de 0,3 GB y se distribuye bajo licencia Apache-2.0.

El paquete contiene dos artefactos: `kokoro-ios-v1-model-340ebe4c.safetensors.gz`, una compresión gzip de `kokoro-v1_0.safetensors` (los pesos de referencia tomados de la aplicación KokoroTestApp), y `kokoro-ios-v1-voices-96d3e94b.npz`, un archivo NPZ determinista con los 54 vectores de estilo de voz de Kokoro v1.0 procedentes del repositorio original. Los ocho caracteres hexadecimales del nombre de cada archivo corresponden al inicio del SHA-256 del mismo, ya que la aplicación verifica tamaño y hash y rechaza cualquier archivo que no coincida.

La relevancia de esta ficha es acotada: no aporta capacidades nuevas ni mejoras de rendimiento respecto al modelo base, sino que documenta un formato de distribución concreto para inferencia TTS en dispositivos Apple. Para cualquier evaluación técnica del modelo conviene remitirse a hexgrad/Kokoro-82M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de hexgrad/Kokoro-82M; arquitectura del modelo base no detallada en la informacion proporcionada) |
| Parametros totales | 82M (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como safetensors comprimido con gzip, sin cuantizacion declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (comprimido con gzip), NPZ para los vectores de voz |

## Arquitectura y entrenamiento

No se ha reentrenado nada: la model card afirma que los archivos solo se han comprimido o rearchivado para su entrega. El contenido es una copia de los pesos de referencia `kokoro-v1_0.safetensors` y de los 54 vectores de estilo de voz de Kokoro v1.0 del repositorio hexgrad/Kokoro-82M. La arquitectura interna, la composicion del dataset de entrenamiento, el numero de tokens vistos y si hubo RLHF o DPO no se detallan en la informacion proporcionada; habria que consultar la model card del modelo base.

La innovacion tecnica de este paquete es de empaquetado y verificacion, no de modelado: compresion gzip con `gzip -n -1` (sin metadatos de nombre ni marca temporal, para que el hash sea reproducible), empaquetado NPZ determinista de los vectores de voz y fijado de tamano y SHA-256 por archivo en la aplicacion cliente. El runtime de inferencia es MLX Swift, lo que implica ejecucion on-device en hardware Apple.

## Capacidades

- Sintesis de texto a voz (TTS) mediante el motor Kokoro, con 54 vectores de estilo de voz incluidos en el paquete.
- Inferencia en el dispositivo (on-device) a traves de MLX Swift, sin depender de servicios en la nube.
- Verificacion de integridad de los pesos en tiempo de carga mediante SHA-256 y comprobacion de tamano.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo thinking; el modelo base es un TTS y este paquete no anade funciones.
- El soporte multilingue no esta especificado en la informacion disponible; los idiomas dependen de los del modelo base y de los vectores de voz incluidos.

## Casos de uso

- Lectura por voz dentro de una aplicacion iOS/iPadOS: integracion del paquete en la app Adsorp para narrar contenido de la interfaz con los 54 estilos de voz incluidos, ejecutando la inferencia localmente con MLX Swift.
- Funciones de accesibilidad: conversion de texto a voz para usuarios con discapacidad visual o dificultades de lectura, con la ventaja de que no requiere conexion de red ni envio de texto a un servidor.
- Asistentes de voz offline: dictado y respuesta hablada en escenarios sin conectividad, como desplazamientos o entornos con red restringida, gracias a la ejecucion on-device.
- Aprendizaje de idiomas: reproduccion de frases y vocabulario con distintas voces para practicar pronunciacion, seleccionando entre los 54 vectores de estilo disponibles.
- Audiolibros y contenido largo en dispositivos Apple: sintesis por fragmentos con el modelo de 82M, adecuado para hardware movil por su tamano reducido (0,3 GB de repositorio).
- Pruebas de integracion de TTS en apps propias: el paquete sirve como referencia de empaquetado reproducible (gzip determinista, NPZ determinista, hash fijado) para pipelines de distribucion de pesos a clientes moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en sentido estricto; el destino es memoria unificada de dispositivos Apple. Con 82M de parametros, la huella de pesos en fp32 ronda los 0,33 GB, y en fp16 unos 0,16 GB, sin contar el resto del runtime.
- GPU recomendadas: el paquete esta pensado para iPhone/iPad con MLX Swift; no se documentan requisitos para GPU de escritorio (A100, H100, RTX 4090).
- Cabe en hardware consumer: si, en dispositivos Apple moviles compatibles con MLX Swift; no se especifica la lista exacta de modelos de iPhone/iPad soportados.
- Opciones de despliegue: runtime MLX Swift dentro de la aplicacion Adsorp. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo TTS esas herramientas no son el destino natural.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 4-alokk/kokoro-ios-mlx-v1 | 82M | no disponible | safetensors gzip + NPZ | Apache-2.0 | Reempaquetado para iOS/MLX; sin reentrenamiento |
| hexgrad/Kokoro-82M | 82M | no disponible | safetensors | Apache-2.0 | Modelo base original; pesos y voces de referencia |
| Otros modelos TTS de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: cualquier limitacion del modelo base (sesgos, calidad de sintesis, cobertura de idiomas) se hereda sin cambios.
- El paquete esta atado a un cliente concreto (app Adsorp) y a un runtime concreto (MLX Swift); su uso fuera de ese contexto requiere extraer y descomprimir los archivos manualmente.
- La verificacion por SHA-256 y tamano implica que cualquier modificacion, recuantizacion o conversion de los pesos invalidara la carga en la aplicacion original.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero un TTS puede producir pronunciaciones incorrectas o artefactos acusticos en texto atipico, sin que la informacion disponible cuantifique esa tasa.
- Idiomas soportados no declarados: no debe asumirse cobertura multilingue sin consultar el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los vectores de voz originales antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada (2026-11-18) resulta anomala; tratese como un artefacto de distribucion de baja madurez y no como una version estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/4-alokk/kokoro-ios-mlx-v1
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Pesos de referencia (KokoroTestApp): https://github.com/mlalma/KokoroTestApp/tree/9dcd3b06468a3c1ecee6d09a33ca687c8e708566/Resources
- Vectores de voz del modelo base: https://huggingface.co/hexgrad/Kokoro-82M/tree/f3ff3571791e39611d31c381e3a41a3af07b4987/voices
