# aoiandroid/sherpa-onnx-dolphin-small-ctc-multi-lang-int8-2025-04-02

## Resumen

Este repositorio es un espejo (mirror) sin modificaciones del modelo `csukuangfj/sherpa-onnx-dolphin-small-ctc-multi-lang-int8-2025-04-02`, publicado por el usuario `aoiandroid` para que la aplicacion Cription no dependa de un repositorio de terceros. Se trata de un artefacto de reconocimiento automatico del habla (ASR) en formato ONNX, cuantizado a int8 y pensado para ejecutarse con el runtime sherpa-onnx. No es un modelo de lenguaje generativo, sino un modelo de transcripcion de audio a texto.

El nombre del repositorio indica que se apoya en decodificacion CTC (Connectionist Temporal Classification), que cubre varios idiomas ("multi-lang") y que la variante incluida esta cuantizada a 8 bits para reducir el espacio y acelerar la inferencia en CPU. El contenido del espejo son unicamente 2 archivos que suman 250,2 MB, que corresponden al subconjunto que la aplicacion consumidora utiliza, manteniendo rutas y tamanos identicos a los del repositorio original.

La relevancia de este espejo es practica: fija una version concreta (commit `c8b6689509acfcd744c04e5e169164f9ac4cae32`) y garantiza reproducibilidad y disponibilidad de un modelo ASR ligero y multilingue bajo licencia Apache 2.0. La model card del autor no aporta detalles sobre arquitectura interna, datos de entrenamiento ni evaluacion, por lo que buena parte de las especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del repositorio indica decodificacion CTC y exportacion a ONNX; la model card no especifica la topologia interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se documenta ventana de audio soportada) |
| Tipos de cuantizacion | int8 (segun el nombre del repositorio; unico formato presente) |
| Idiomas soportados | no disponible (el nombre indica "multi-lang", sin detalle de idiomas concretos) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (2 archivos, 250,2 MB en total) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento. A partir del nombre del repositorio puede inferirse que se trata de un modelo de reconocimiento de voz con decodificacion CTC, exportado al formato ONNX y cuantizado a int8 para su uso con sherpa-onnx. La topologia exacta (por ejemplo, tipo de encoder, atencion o convoluciones), el numero de parametros, la composicion del dataset y cualquier etapa de ajuste (fine-tuning, destilacion, etc.) no estan documentados en la informacion disponible.

Tampoco se detalla el proceso de cuantizacion (calibracion, metodo de redondeo) ni el numero de tokens o horas de audio empleados durante el entrenamiento. Cualquier afirmacion sobre innovaciones tecnicas concretas seria especulativa, por lo que se marca como no disponible.

## Capacidades

- Reconocimiento automatico del habla (ASR): conversion de audio a texto mediante decodificacion CTC.
- Multilingue: el nombre del repositorio indica soporte de varios idiomas, aunque no se enumeran en la model card.
- Inferencia cuantizada a int8: menor huella de memoria y mayor velocidad en CPU en comparacion con pesos en coma flotante.
- Ejecucion con sherpa-onnx: integrable en el ecosistema sherpa-onnx (C++, Python, Android, iOS) y en ONNX Runtime.
- Funcionamiento sin conexion: al ser un modelo local, no requiere servicios en la nube.
- Soporte de tool calling / function calling: no aplica (modelo ASR, no generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Vision, audio generativo, thinking mode: no disponible / no aplica.

## Casos de uso

- Transcripcion de audio sin conexion en aplicaciones de escritorio: el modelo puede integrarse en el runtime sherpa-onnx para convertir voz a texto localmente, evitando enviar audio a servidores externos.
- Subtitulado automatico de video: dado su tamano reducido (250,2 MB) y su cuantizacion int8, es adecuado para generar subtitulos en pipelines de postproduccion que se ejecutan en CPU.
- Asistentes de voz embebidos: al ejecutarse en dispositivos con recursos limitados, puede alimentar comandos de voz y dictado en aplicaciones moviles o de escritorio.
- Indexacion y busqueda de contenido en audio: transcripcion previa de grabaciones para permitir busqueda por texto sobre archivos de audio.
- Accesibilidad: conversion de voz a texto para personas con discapacidad auditiva en tiempo casi real, desplegada localmente.
- Transcripcion en entornos con restricciones de privacidad: al no requerir red, es apto para sectores como sanidad, legal o administracion publica donde el audio no puede salir del dispositivo.
- Aplicaciones multilingues de dictado: el caracter "multi-lang" del nombre sugiere uso en escenarios con varios idiomas, aunque la model card no detalla cuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye tablas de WER, CER ni comparaciones con otros modelos, y la busqueda web no aporto datos tecnicos relevantes (los resultados obtenidos corresponden a YouTube y no guardan relacion con el modelo).

## Requisitos de hardware

- Huella de almacenamiento: 250,2 MB para los 2 archivos del repositorio.
- Memoria en inferencia: coherente con el tamano del modelo cuantizado a int8 (del orden de cientos de MB); no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: no disponible. Al ser un modelo int8 orientado a sherpa-onnx, el escenario tipico es ejecucion en CPU.
- Compatibilidad con GPU de consumo: no disponible; el diseno int8 y el runtime sherpa-onnx apuntan a despliegue en CPU y dispositivos de gama baja.
- Opciones de despliegue: runtime sherpa-onnx (C++, Python, Android, iOS) y ONNX Runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como categorias comparables en el ambito ASR multilingue y ejecucion local podrian citarse modelos como Whisper (OpenAI), Vosk y otros modelos CTC exportados a sherpa-onnx, pero las cifras de parametros, contexto, WER y rendimiento de dichos sistemas no forman parte de la informacion disponible para esta ficha.

| Modelo | Parametros | Contexto | Rendimiento (WER/CER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sherpa-onnx-dolphin-small-ctc-multi-lang-int8 (espejo) | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace (espejo) |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo: si el repositorio de origen se actualiza, esta copia puede quedar desincronizada al estar fijada al commit `c8b6689509acfcd744c04e5e169164f9ac4cae32`.
- Contenido parcial: solo se incluyen 2 archivos (el subconjunto que usa la aplicacion Cription), no la totalidad del repositorio original.
- Ausencia de documentacion tecnica: la model card no detalla arquitectura, datos de entrenamiento, idiomas exactos ni evaluacion, lo que dificulta estimar su calidad en produccion.
- Alucinacion y errores de transcripcion: como todo modelo ASR, puede producir transcripciones incorrectas, especialmente con ruido, acentos o vocabulario tecnico; no hay tasas de error publicadas.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por idioma, acento o variedad dialectal.
- Cobertura de idiomas: el nombre indica "multi-lang", pero no se enumeran los idiomas soportados ni su calidad relativa.
- Licencia: apache-2.0 permite uso comercial, pero se debe respetar la atribucion a los autores originales; los derechos y creditos pertenecen a los autores del modelo fuente.
- Para produccion: conviene validar el rendimiento (WER/CER) con datos propios antes de desplegarlo, dado que no hay cifras oficiales.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/aoiandroid/sherpa-onnx-dolphin-small-ctc-multi-lang-int8-2025-04-02
- Repositorio de origen: https://huggingface.co/csukuangfj/sherpa-onnx-dolphin-small-ctc-multi-lang-int8-2025-04-02
- Arbol del commit de origen: https://huggingface.co/csukuangfj/sherpa-onnx-dolphin-small-ctc-multi-lang-int8-2025-04-02/tree/c8b6689509acfcd744c04e5e169164f9ac4cae32
- README de origen incluido en el espejo: `SOURCE_README.md`
- Enlaces adicionales (papers, repos, demos): no se encontraron enlaces relevantes en la busqueda web; los resultados obtenidos corresponden a YouTube y no estan relacionados con el modelo.
