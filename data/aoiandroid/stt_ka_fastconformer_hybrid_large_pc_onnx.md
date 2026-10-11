# aoiandroid/stt_ka_fastconformer_hybrid_large_pc_onnx

## Resumen

Este repositorio es un espejo sin modificar del modelo `OpenVoiceOS/stt_ka_fastconformer_hybrid_large_pc_onnx`, publicado por el usuario `aoiandroid` para que la aplicacion Cription no dependa de un repositorio de terceros. No se trata, por tanto, de un modelo entrenado por el autor del espejo, sino de una copia byte a byte (mismos tamanos y hashes SHA-256/git blob) del artefacto original, que a su vez es una exportacion a ONNX del modelo de reconocimiento automatico del habla `nvidia/stt_ka_fastconformer_hybrid_large_pc` de NVIDIA.

El modelo resuelve la tarea de reconocimiento automatico del habla (ASR, speech-to-text) para georgiano, identificado por el codigo de idioma `ka` presente en el nombre del repositorio. La arquitectura subyacente es FastConformer, una variante del transformer Conformer con atencion eficiente (depthwise separable convolutions y atencion por bloques), en configuracion "hybrid", lo que implica una cabeza de decodificacion CTC combinada con decodificacion tipo transducer/RNNT. El sufijo `pc` hace referencia al modelado de puntuacion y mayusculas (punctuation and capitalization).

Su relevancia actual es practica: ofrece un artefacto ONNX autocontenido (4 archivos, 589,8 MB) listo para inferencia local sin depender del framework NeMo completo, algo util en asistentes de voz offline como el ecosistema OpenVoiceOS. El tamano del repositorio (0,6 GB) y el numero reducido de archivos lo hacen desplegable en entornos con recursos limitados y sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido (Conformer con atencion eficiente, decodificacion CTC / híbrida) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefacto exportado directamente a ONNX) |
| Idiomas soportados | georgiano (ka), deducido del identificador del modelo; no confirmado explicitamente en la informacion proporcionada |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia FastConformer de NVIDIA NeMo. FastConformer es una evolucion del Conformer que sustituye parte de la atencion completa por atencion lineal por bloques y usa convoluciones depthwise separables, reduciendo el coste computacional y de memoria manteniendo la precision. La variante "hybrid" combina una cabeza CTC con decodificacion de tipo transducer (RNNT), lo que permite elegir entre decodificacion rapida greedily CTC o decodificacion mas precisa con el decoder RNNT. El sufijo `pc` indica que el modelo fue entrenado para producir puntuacion y mayusculas en la transcripcion.

Los detalles concretos de entrenamiento (numero de tokens de audio, composicion del dataset, uso de RLHF/DPO u otras tecnicas) no estan disponibles en la informacion proporcionada. Se sabe, por los metadatos de busqueda, que el modelo base es `nvidia/stt ka fastconformer` y que el artefacto aqui descrito es una exportacion a ONNX realizada por el proyecto OpenVoiceOS, que despues ha sido replicada de forma intacta en este repositorio espejo. No se ha modificado ningun archivo respecto al origen.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) para audio en georgiano.
- Decodificacion CTC, segun la etiqueta `nemo-conformer-ctc` del repositorio.
- Salida con puntuacion y mayusculas, segun el sufijo `pc` del nombre original.
- Inferencia mediante ONNX Runtime, lo que permite desplegarlo sin el stack NeMo.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta capacidad multilingue: el modelo esta orientado a un unico idioma (georgiano).
- No se documentan modos especiales como thinking mode, audio de entrada adicional ni procesamiento multimodal.

## Casos de uso

- Asistente de voz offline en georgiano: integrado en el ecosistema OpenVoiceOS mediante ONNX Runtime, el modelo convierte ordenes de voz en texto para que un motor de dialogo local las procese, sin enviar audio a la nube.
- Transcripcion de notas de voz y reuniones: permite convertir grabaciones en georgiano a texto con puntuacion y mayusculas, listo para pegar en un editor o en un sistema de gestion documental.
- Subtitulado local de contenido audiovisual: en pipelines de postproduccion, el modelo genera transcripciones que se sincronizan con la pista de audio original, evitando servicios externos por motivos de privacidad.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo (casi) real de conversaciones presenciales en georgiano ejecutada en un portatil, gracias al bajo requisito de recursos del artefacto ONNX.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un archivo historico de grabaciones para alimentar un indice de texto buscable, con el modelo corriendo en CPU.
- Automatizacion de centros de llamadas: conversion de llamadas en georgiano a texto para analitica, deteccion de palabras clave y control de calidad, manteniendo los datos en infraestructura propia.
- Comandos de voz en aplicaciones de escritorio o embebidas: al ser un modelo pequeno en formato ONNX, puede integrarse en apps de escritorio o dispositivos con recursos moderados para reconocer comandos cortos en georgiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 589,8 MB en 4 archivos, lo que sugiere un modelo de tamano medio cuyos pesos ONNX caben sobradamente en cualquier GPU consumer moderna e incluso en memoria de sistema para inferencia en CPU.
- VRAM estimada para inferencia: no disponible. Con el artefacto en disco de 0,6 GB, una GPU con 2-4 GB de VRAM libre deberia ser suficiente si se carga el fichero ONNX completo en memoria, aunque no se confirma el consumo real.
- GPU recomendadas: no disponibles. Para un modelo de esta escala, tarjetas como RTX 3060, RTX 4090, A100 o H100 serian suficientes, pero no hay datos oficiales.
- Compatible con GPU consumer: previsiblemente si, dado el tamano reducido del artefacto, aunque no se confirma con cifras.
- Opciones de despliegue: ONNX Runtime, y por extension cualquier runtime compatible con ONNX (incluyendo integraciones en aplicaciones de escritorio y asistentes de voz). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a este tipo de modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| aoiandroid/stt_ka_fastconformer_hybrid_large_pc_onnx | FastConformer hibrido (ASR) | no disponible | no disponible | cc-by-4.0 | ONNX |
| OpenVoiceOS/stt_ka_fastconformer_hybrid_large_pc_onnx | FastConformer hibrido (ASR) | no disponible | no disponible | cc-by-4.0 | ONNX |
| nvidia/stt_ka_fastconformer_hybrid_large_pc | FastConformer hibrido (ASR) | no disponible | no disponible | no disponible | NeMo (.nemo) |

No se dispone de datos de rendimiento que permitan comparar estos modelos cuantitativamente. Las alternativas mas cercanas son el repositorio origen de OpenVoiceOS (identico en contenido, salvo por el README del espejo) y el modelo NeMo original de NVIDIA del que deriva la exportacion ONNX.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no incorpora mejoras ni correcciones respecto al repositorio original, y depende del mantenimiento de este.
- No es un modelo entrenado por `aoiandroid`; todos los derechos y creditos corresponden a los autores originales (OpenVoiceOS y, en ultima instancia, NVIDIA).
- La licencia declarada es cc-by-4.0, que permite uso comercial citando la atribucion, pero se recomienda verificar la licencia del modelo base original de NVIDIA antes de un despliegue comercial.
- Al ser un modelo especifico de reconocimiento del habla en georgiano, no sirve para tareas de generacion, razonamiento ni codigo.
- No se documentan sesgos conocidos ni tasas de alucinacion (en ASR, errores de sustitucion/insercion), por lo que no pueden evaluarse a partir de la informacion disponible.
- No hay datos sobre el rendimiento en condiciones de ruido, acentos o audio de baja calidad.
- El repositorio registra 0 descargas y 0 likes, lo que indica que es un artefacto de dependencia interna mas que una publicacion dirigida a la comunidad.
- La fecha de creacion indicada (2026-10-10) resulta anomala y conviene verificarla en el propio repositorio antes de sacar conclusiones temporales.
- Las limitaciones de contexto o idioma concretas (por ejemplo, duracion maxima de audio soportada) no estan disponibles.

## Enlaces

- Repositorio del espejo: https://huggingface.co/aoiandroid/stt_ka_fastconformer_hybrid_large_pc_onnx
- Repositorio origen: https://huggingface.co/OpenVoiceOS/stt_ka_fastconformer_hybrid_large_pc_onnx
- Commit de origen replicado: https://huggingface.co/OpenVoiceOS/stt_ka_fastconformer_hybrid_large_pc_onnx/tree/fa19e061165a0238fe6477c65cdc3357d56f5788
- Modelo base NeMo citado: `nvidia/stt ka fastconformer` (referencia indirecta; no se aporta URL completa en la informacion disponible)
- Ficha de terceros con detalles del modelo: https://essamamdani.com/ai-models/hf-openvoiceos-stt-ka-fastconformer-hybrid-large-pc-onnx
- Pagina de modelos de ONNX Runtime: https://onnxruntime.ai/models
- Repositorio ONNX Model Zoo: https://github.com/onnx/models
