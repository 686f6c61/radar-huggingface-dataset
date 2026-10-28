# chatpig/cantonese-tts-gguf

## Resumen

`chatpig/cantonese-tts-gguf` es un modelo publicado en Hugging Face por el usuario `chatpig` bajo licencia Apache 2.0, distribuido exclusivamente en formato GGUF y con un total de 161.808.353 parámetros (aproximadamente 162 M). Por el identificador del repositorio se trata de un sistema de síntesis de voz (text-to-speech) orientado al cantonés, aunque la model card publicada no contiene más que la declaración de licencia, sin documentación técnica, descripción de arquitectura ni instrucciones de uso.

El interés del repositorio es doble: por un lado, empaqueta un modelo TTS de tamano relativamente pequeno (~162 M de parametros, repo de 1,6 GB) en GGUF, un formato asociado tradicionalmente a modelos de lenguaje y no a pipelines de audio; por otro, lo hace bajo Apache 2.0, una licencia permisiva que permite uso comercial sin restricciones adicionales, algo poco habitual en el ecosistema TTS (donde abundan licencias no comerciales o modelos con datos de entrenamiento no redistribuibles).

Ahora bien, la ausencia total de documentacion limita seriamente su evaluacion: no se declaran idiomas soportados, no hay pipeline asignado en Hugging Face, no se han publicado benchmarks y el repositorio no registra descargas ni likes en el momento de la consulta. Se trata, por tanto, de un artefacto que requiere validacion empirica por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la documenta; por el identificador se infiere un modelo acustico de sintesis de voz, sin confirmacion) |
| Parametros totales | 161.808.353 (~162 M) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido habitual de LLM; es un modelo de audio) |
| Tipos de cuantizacion | No disponible en detalle; el repositorio se distribuye en formato GGUF (1,6 GB en total, compatible con varios niveles de cuantizacion) |
| Idiomas soportados | No declarados en la model card; el nombre del repositorio indica cantonés (Hong Kong), sin confirmacion documental |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se observan safetensors ni ONNX en la informacion disponible) |
| Fecha de creacion | 2026-10-28 |
| Ultima actualizacion | 2026-10-28 |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Region declarada | `region:us` |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna. La model card se limita a un bloque de frontmatter con `license: apache-2.0` y no incluye descripcion tecnica. El recuento de parametros (161,8 M) situa al modelo en la gama de los sistemas TTS ligeros, un orden de magnitud habitual en arquitecturas tipo VITS, FastSpeech 2 o variantes de encoder-decoder para sintesis neuronal, pero no hay ningun dato que permita confirmar cual de ellas se ha empleado.

Tampoco se documenta el corpus de entrenamiento (numero de horas de audio, idioma, hablantes, procedencia), ni si hubo etapas de ajuste fino, destilacion o alineamiento forzado. Se desconoce igualmente si el modelo soporta clonacion de voz, control de prosodia, emocion o multiples hablantes. Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Sintesis de voz (text-to-speech): es la funcion que se deduce del identificador del repositorio; no hay confirmacion explicita en la documentacion.
- Idioma: presumiblemente cantonés (zh-HK), segun el nombre del repositorio; no declarado oficialmente.
- Generacion de texto, razonamiento, codigo o matematicas: no aplica; no es un modelo de lenguaje.
- Vision, audio de entrada o comprension del habla: no disponible.
- Tool calling / function calling: no disponible; no aplica a un modelo TTS.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Control de prosodia, emocion, velocidad o voz: no documentado.
- Clonacion de voz / zero-shot speaker adaptation: no documentado.

## Casos de uso

Dado que la documentacion es practicamente inexistente, los siguientes escenarios deben considerarse hipotesis de partida que requieren validacion previa con muestras reales:

- Lectura de contenido en cantonés para aplicaciones de accesibilidad: conversion de articulos, noticias o documentacion a audio para usuarios con discapacidad visual o preferencia por consumo auditivo en Hong Kong.
- Interfaces de voz para asistentes de dominio limitado: al ser un modelo de ~162 M, podria ejecutarse en CPU o en GPU de gama baja, lo que encaja en dispositivos empotrados o apps moviles con presupuesto de computo reducido.
- Generacion de avisos y notificaciones habladas: transporte publico, sistemas de megafonia, aplicaciones de recordatorio, siempre que la calidad de sintesis resulte aceptable en pruebas ciegas.
- Prototipado rapido de productos de audio en cantonés: el empaquetado GGUF y la licencia Apache 2.0 permiten integrar el modelo en un pipeline propio sin negociacion de licencia.
- Investigacion en TTS de bajos recursos: util como linea base ligera para comparar con sistemas como canto-tts o Piper en tareas de inteligencia artificial del habla en chino yue.
- Generacion de material de aprendizaje de idiomas: producir locuciones en cantonés para ejercicios de escucha, siempre que se valide la naturalidad y la correccion tonal (el cantonés es una lengua tonal con seis tonos, un punto criticamente sensible).
- Doblaje o preproduccion de contenido audiovisual: generacion de borradores de voz en off antes de recurrir a un estudio de grabacion profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan metricas objetivas de calidad de sintesis (MOS, CMOS, WER de un ASR intermedio, similitud de hablante) ni comparaciones con otros sistemas TTS en la model card, en los resultados de busqueda ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada. Como referencia aritmetica, 161,8 M de parametros ocupan aproximadamente 324 MB en FP16 y unos 162 MB en cuantizacion de 8 bits; el repo completo pesa 1,6 GB, lo que sugiere varias cuantizaciones empaquetadas.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente para una sola cuantizacion, e incluso una GPU integrada podria bastar en el caso de variantes cuantizadas.
- Ajuste en GPU consumer: muy probable por el reducido numero de parametros; no verificado.
- Opciones de despliegue: el formato GGUF apunta a runtimes tipo llama.cpp u Ollama, pero estos estan disenados para modelos de lenguaje y su soporte de arquitecturas TTS no esta garantizado. La integracion real dependera de que el runtime reconozca la arquitectura concreta del modelo, extremo que no se puede confirmar con la informacion disponible. Como alternativas, seria necesario convertir los pesos a un framework de inferencia de audio (PyTorch, ONNX Runtime) o localizar el codigo de inferencia del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Estado |
|---|---|---|---|---|---|
| chatpig/cantonese-tts-gguf | ~162 M | GGUF | Apache 2.0 | Cantonés (inferido, no declarado) | Publicado, sin documentacion ni benchmarks |
| typangaa/canto-tts (GitHub + PyPI) | No disponible | ONNX (CPU-first) | No disponible en la informacion recogida | Cantonés (Hong Kong) | Proyecto open source con SDK en PyPI; voz unica, sin clonacion en la ruta ONNX segun su README |
| Piper (VITS) | No disponible en esta busqueda | ONNX | MIT (referencia general) | Multiples, incluido chino | Ecosistema amplio de voces y despliegue en CPU |
| Coqui XTTS-v2 | ~467 M (referencia general, no verificada en esta busqueda) | PyTorch | No comercial | Multilingue | Usado habitualmente como linea base de TTS multilingue con clonacion |

Nota: los datos de Piper y XTTS-v2 provienen de conocimiento general del ecosistema y no de la busqueda realizada; conviene verificarlos antes de publicarlos como comparativa formal. La comparacion directa con `canto-tts` es la mas pertinente por dominio (cantonés) y tamano de despliegue.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no describe arquitectura, datos de entrenamiento, uso previsto ni limitaciones. Esto impide una evaluacion tecnica rigurosa y complica la integracion en produccion.
- Idiomas no declarados: el nombre sugiere cantonés, pero no hay confirmacion oficial; podria no cubrir mandarin, chino escrito formal ni code-switching con ingles, habitual en Hong Kong.
- Sin benchmarks ni muestras publicas: no es posible estimar calidad, naturalidad, precision tonal ni robustez ante entradas ruidosas o fuera de dominio.
- Riesgo de salida degradada o alucinada: en TTS, la ausencia de validacion se traduce en artefactos acusticos, saltos, repeticiones o pronunciacion incorrecta de numeros, siglas y nombres propios.
- Sesgos de hablante y registro: al desconocerse el corpus, no se puede saber que variedad de cantonés, genero, edad o registro cubre el modelo, ni si reproduce estereotipos de voz.
- Viabilidad de despliegue incierta: GGUF no garantiza compatibilidad con llama.cpp u Ollama para arquitecturas de audio; habria que verificar el soporte real del runtime.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime de responsabilidad sobre el contenido generado (suplantacion de voz, deepfakes) ni sobre posibles reclamaciones de terceros relativas a los datos de entrenamiento, que no se documentan.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin historial de mantenimiento.
- Fecha de publicacion: los metadatos indican 2026-10-28, lo que conviene contrastar con otras fuentes antes de citar el modelo en un articulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chatpig/cantonese-tts-gguf
- Perfil del autor: https://huggingface.co/chatpig
- Otro repositorio del autor: https://huggingface.co/chatpig/gguf
- Proyecto relacionado de TTS en cantonés (no vinculado oficialmente): https://github.com/typangaa/canto-tts
- SDK en PyPI del proyecto anterior: https://pypi.org/project/canto-tts/
- Directorio de modelos GGUF (referencia de ecosistema): https://local-ai-zone.github.io/models/tts.html
