# Phoonnx/glowtts-en-us-cmu_jmk

## Resumen

GlowTTS en-us-cmu_jmk es un modelo de sintesis de voz (text-to-speech) derivado del repositorio agregado `Phoonnx/phoonnx-glowtts`, publicado por el autor Phoonnx. Se distribuye como un subconjunto de ese repositorio, correspondiente a la carpeta `en-us-cmu_jmk`, y esta empaquetado en formato ONNX para su uso con la libreria `phoonnx`, un motor de inferencia TTS del proyecto TigreGotico. El modelo emplea la arquitectura GlowTTS, un modelo generativo de voz basado en normalizing flows, y esta orientado a la sintesis en ingles estadounidense con la voz identificada como `larynx/en-us-cmu_jmk-glow_tts`.

Su relevancia es practica: permite desplegar sintesis de voz en ingles dentro de un pipeline ONNX ligero y autocontenido, sin depender de frameworks de entrenamiento completos. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto apto para inferencia en CPU o GPU modesta. No se dispone de informacion publica sobre el numero de parametros, el volumen de entrenamiento ni los resultados de evaluacion.

La ficha se limita a los datos verificables de la model card y de los metadatos de Hugging Face. Cualquier especificacion no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flows, TTS no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (en-us, segun el identificador de la carpeta y de la voz) |
| Licencia | other (la model card no especifica licencia concreta para esta carpeta) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| ID de voz phoonnx | `larynx/en-us-cmu_jmk-glow_tts` |

## Arquitectura y entrenamiento

GlowTTS es un modelo de sintesis de voz no autorregresivo que transforma una representacion textual intermedia en un espectrograma mel mediante una secuencia de normalizing flows invertibles. Esta familia de modelos se caracteriza por un entrenamiento mas estable y una inferencia mas rapida que los modelos autorregresivos tipo Tacotron, al generar el espectrograma completo en una sola pasada. La model card no aporta detalles sobre la configuracion concreta de capas, dimensiones ocultas ni el vocoder asociado.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens o horas de audio, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO, algo por otra parte poco habitual en TTS. El identificador `en-us-cmu_jmk` sugiere un origen vinculado al corpus CMU y a una voz concreta, pero la model card no lo confirma. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio empaquetado ONNX para `phoonnx`.

## Capacidades

- Sintesis de voz en ingles estadounidense a partir de texto de entrada.
- Generacion de audio mediante la voz predefinida `larynx/en-us-cmu_jmk-glow_tts`.
- Inferencia en formato ONNX, compatible con el motor `phoonnx`.
- Ejecucion ligera gracias al tamano reducido del repositorio (0,1 GB).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles estadounidense.
- No se documentan modos especiales como clonacion de voz, control de emocion o estilos.

## Casos de uso

- Narracion de articulos y contenidos web: el modelo convierte texto en audio en ingles para lectores de pantalla o podcasts generados automaticamente, con una huella de disco minima que facilita su despliegue en servidores pequenos.
- Asistentes de voz integrados en aplicaciones: al ejecutarse en ONNX con `phoonnx`, puede incorporarse en aplicaciones de escritorio o moviles que necesiten sintesis local sin conexion a servicios en la nube.
- Generacion de avisos y mensajes dinamicos: util para sistemas de megafonia, notificaciones o IVR que requieran convertir plantillas de texto en voz en tiempo de ejecucion.
- Prototipado de interfaces conversacionales: permite validar rapidamente flujos de voz en ingles dentro de un producto antes de invertir en un modelo de mayor calidad o en un servicio comercial.
- Accesibilidad en documentacion tecnica: sintesis de manuales y guias en ingles para usuarios con discapacidad visual, aprovechando el reducido coste de inferencia.
- Pruebas de regresion en pipelines TTS: al ser un modelo autocontenido y versionado, sirve como referencia estable para comparar cambios en el motor `phoonnx` o en el preprocesado de texto.
- Generacion de audio para entornos de desarrollo y CI: su tamano de 0,1 GB permite incluirlo en imagenes de contenedor sin penalizar el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Con un repositorio de 0,1 GB, la huella de memoria es previsiblemente baja, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponibles. Por el tamano del modelo, es plausible su ejecucion en GPU de gama baja o incluso en CPU, aunque no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el formato ONNX y el tamano reducido apuntan a que puede ejecutarse en hardware modesto.
- Opciones de despliegue: el motor previsto es `phoonnx` (repositorio TigreGotico/phoonnx), que carga los pesos ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlowTTS en-us-cmu_jmk (este modelo) | GlowTTS (flows) | Ingles estadounidense | ONNX | other (sin especificar) | Hugging Face, via phoonnx |
| Piper (voces en-us) | VITS | Multiples, incluye ingles | ONNX | MIT en la mayoria de voces | Hugging Face, via piper |
| Coqui TTS (modelos VITS) | VITS | Multiples | Checkpoint PyTorch | MPL-2.0 en el codigo, variable por modelo | GitHub y Hugging Face |

La comparacion se limita a la categoria y al formato, ya que no se dispone de datos de rendimiento ni de parametros de este modelo que permitan una comparacion cuantitativa. Piper y Coqui TTS se citan como alternativas de referencia en el ecosistema TTS open source, pero no se han verificado sus especificaciones en esta ficha.

## Limitaciones y advertencias

- La licencia figura como `other` y la model card no identifica la licencia concreta de esta carpeta, por lo que el uso comercial queda sin garantia juridica hasta consultar al autor o al repositorio original.
- Solo se documenta ingles estadounidense; no hay evidencia de soporte para otros idiomas o acentos.
- No se publican datos de evaluacion de calidad (MOS, inteligibilidad, naturalidad), por lo que no es posible estimar su rendimiento subjetivo.
- Al ser un modelo TTS, puede presentar errores de pronunciacion en palabras poco frecuentes, siglas o nombres propios, aunque no se documenta una evaluacion al respecto.
- No se dispone de informacion sobre sesgos de voz (genero, edad, acento) ni sobre el origen de los datos de entrenamiento.
- El modelo depende del motor `phoonnx`; fuera de ese ecosistema su uso requiere adaptar la carga de los pesos ONNX.
- No se documenta el vocoder asociado ni si el paquete incluye todos los componentes necesarios para generar audio final.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_jmk
- Repositorio agregado de origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Motor de inferencia phoonnx: https://github.com/TigreGotico/phoonnx
