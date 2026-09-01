# mradermacher/neutts-air-darija-v1-GGUF

## Resumen

El modelo `mradermacher/neutts-air-darija-v1-GGUF` es una cuantización en formato GGUF del modelo de síntesis de voz (text-to-speech) `Tilas/neutts-air-darija-v1`, especializado en darija marroquí (ary) y árabe estándar (ar). La cuantización ha sido realizada por mradermacher, un tercero que publica versiones optimizadas de modelos open source, y está pensada para facilitar el despliegue en entornos con recursos limitados, como dispositivos móviles o CPUs sin GPU dedicada.

El modelo base pertenece a la familia NeuTTS Air, desarrollada por Neuphonic, cuyo objetivo es ofrecer síntesis de voz on-device con clonación de voz instantánea. Esta versión en darija amplía el alcance de la tecnología a un idioma con poca representación en sistemas TTS comerciales, lo que la hace relevante para aplicaciones locales en Marruecos y comunidades de habla darija. El modelo tiene aproximadamente 748 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Al tratarse de una cuantización GGUF, el modelo se puede ejecutar con herramientas compatibles con este formato, aunque no se especifican detalles sobre la arquitectura interna ni el proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de texto a voz (TTS), detalles de arquitectura no disponibles |
| Parametros totales | 747.930.496 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | ary (darija marroqui), ar (arabe estandar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base tambien esta disponible en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Se sabe que pertenece a la familia NeuTTS Air de Neuphonic, que utiliza un codificador de audio denominado neucodec, pero no se especifican los componentes exactos (por ejemplo, si es un transformer, un modelo basado en convoluciones o una arquitectura hibrida). Tampoco se detalla el proceso de entrenamiento, aunque se menciona el dataset `Tilas/MoulSot-Tokens-v1` como fuente de datos. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

La cuantizacion GGUF ha sido realizada por mradermacher a partir del modelo base, sin modificaciones en los pesos mas alla de la reduccion de precision. No se mencionan innovaciones tecnicas adicionales en esta version cuantizada.

## Capacidades

- Sintesis de voz en darija marroqui y arabe estandar, con salida de audio natural.
- Clonacion de voz instantanea, segun la informacion publica de NeuTTS Air.
- Ejecucion on-device, lo que permite inferencia sin conexion a internet y con baja latencia.
- Compatibilidad con el formato GGUF, lo que facilita su uso en entornos con recursos limitados.
- No se mencionan capacidades de tool calling, agentes, razonamiento multimodal ni otras funciones propias de modelos de lenguaje generales.

## Casos de uso

- Asistentes de voz en darija para aplicaciones moviles: el modelo puede generar respuestas habladas en darija, integrandose en asistentes personales o sistemas de domotica que operen en Marruecos.
- Audiolibros y contenido narrado en darija: permite convertir texto en darija a audio de forma automatica, reduciendo costes de produccion frente a locutores humanos.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla que utilicen este modelo pueden ofrecer una experiencia natural en darija, un idioma con escasa cobertura en soluciones comerciales.
- Sistemas de respuesta interactiva por voz (IVR) en empresas marroquies: el modelo puede gestionar menus telefonicos y respuestas automatizadas en darija, mejorando la atencion al cliente local.
- Doblaje automatico de contenido audiovisual: permite generar pistas de voz en darija para videos, anuncios o material educativo, con la posibilidad de clonar voces especificas.
- Aplicaciones educativas para el aprendizaje del darija: el modelo puede pronunciar palabras y frases correctamente, sirviendo como herramienta de practica de pronunciacion para estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas objetivas como MOS (Mean Opinion Score) para calidad de voz, ni comparaciones con otros sistemas TTS en darija.

## Requisitos de hardware

- Los archivos GGUF tienen tamanos que oscilan entre 0,6 GB (cuantizaciones Q2_K, Q3_K_S, IQ4_XS) y 1,6 GB (f16), lo que sugiere que el modelo puede ejecutarse en hardware modesto.
- Para cuantizaciones bajas (Q4_K_S, Q4_K_M), el archivo ocupa aproximadamente 0,7 GB, por lo que es plausible ejecutarlo en CPUs con 4 GB de RAM o menos, y en GPUs con 2 GB de VRAM.
- No se especifican requisitos minimos oficiales de VRAM ni de RAM. Se recomienda probar con las cuantizaciones mas bajas en dispositivos limitados.
- Opciones de despliegue: al ser GGUF, se puede utilizar con herramientas como llama.cpp, Ollama o cualquier runtime que soporte este formato, aunque no se confirma la compatibilidad especifica con motores de TTS.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos TTS especificos para darija marroqui. La comparativa con alternativas generales (como VITS, Tacotron o modelos multilingues de Google o Microsoft) no es posible sin datos de rendimiento publicados. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No se han documentado sesgos especificos, pero al ser un modelo entrenado con un dataset concreto, puede presentar limitaciones en acentos, dialectos regionales o vocabulario poco frecuente.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario de entrenamiento, especialmente en nombres propios o terminos tecnicos.
- La cuantizacion puede degradar la calidad del audio en comparacion con el modelo en precision completa (f16). Se recomienda usar cuantizaciones altas (Q6_K, Q8_0) si la calidad es prioritaria.
- No se especifica la longitud maxima de texto que puede procesar de una vez; es posible que haya limitaciones de contexto no documentadas.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece garantia alguna.
- Al ser una cuantizacion de un tercero, no hay soporte oficial de Neuphonic para esta version especifica.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/neutts-air-darija-v1-GGUF
- Modelo base original: https://huggingface.co/Tilas/neutts-air-darija-v1
- Pagina oficial de NeuTTS Air: https://neutts.com/
- Repositorio GitHub de NeuTTS: https://github.com/neuphonic/neutts
- Modelo NeuTTS Air de Neuphonic en HuggingFace: https://huggingface.co/neuphonic/neutts-air
- Version GGUF general de NeuTTS Air (no especifica para darija): https://huggingface.co/mradermacher/neutts-air-GGUF
