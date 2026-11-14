# Phoonnx/pipertts_pt-PT_voice3

## Resumen

Phoonnx/pipertts_pt-PT_voice3 es un modelo de sintesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx en Hugging Face. Se enmarca en la familia Piper TTS, un sistema de sintesis neuronal ligero orientado a inferencia en tiempo real sobre CPU, y esta especializado en la variante de portugues europeo (pt-PT), segun indican sus etiquetas de idioma y su identificador. El modelo se distribuye como un artefacto compacto (aproximadamente 0,1 GB en el repositorio) pensado para integrarse en aplicaciones que necesitan generar audio hablado sin depender de GPU.

La relevancia de este modelo es practica: cubre la demanda de voces TTS para portugues de Portugal en entornos de bajos recursos, donde los modelos grandes de sintesis no son viables. Al estar en formato ONNX, puede ejecutarse con runtimes como ONNX Runtime o con el propio binario de Piper, lo que facilita su despliegue en dispositivos embebidos, servidores modestos o aplicaciones de escritorio.

No obstante, la informacion publica disponible es muy limitada: la model card practicamente no contiene documentacion tecnica, no se declara licencia y no hay datos de benchmarks ni de arquitectura mas alla de lo inferible del ecosistema Piper. Esta ficha refleja esa escasez y marca explicitamente como no disponible todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piper TTS (sintesis neuronal, modelo acustico + vocoder en ONNX); detalles concretos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en TTS no aplica contexto de texto largo como en LLM) |
| Tipos de cuantizacion | no disponible (se distribuye como modelo ONNX; no se documentan variantes) |
| Idiomas soportados | pt (portugues; el identificador indica pt-PT, portugues europeo) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Piper TTS, un sistema de sintesis de voz neuronal disenado para inferencia rapida en CPU. Piper combina habitualmente un modelo acustico (que convierte texto en representaciones intermedias) con un vocoder neuronal (que genera la forma de onda), y se exporta a ONNX para su ejecucion con ONNX Runtime. El identificador del modelo sugiere una voz concreta ("voice3") dentro de un conjunto de voces para portugues europeo.

En cuanto al entrenamiento, la unica informacion disponible es el dataset declarado en las etiquetas: `Phoonnx/tuga-tts-train-synthetic-voice3`. El nombre indica que se trata de un conjunto de datos sintetico derivado del corpus Tuga-TTS, pero no se publican detalles sobre numero de horas de audio, composicion del dataset, proceso de alineamiento, ni si se aplicaron tecnicas de ajuste fino o de sintesis de datos. Tampoco se documentan innovaciones tecnicas adicionales. Todo ello debe considerarse no disponible.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en portugues, orientada a la variante europea (pt-PT).
- Generacion de audio en formato ONNX, ejecutable con ONNX Runtime o con la herramienta Piper.
- Inferencia ligera apta para CPU, dado el tamano reducido del repositorio (aproximadamente 0,1 GB).
- Voz unica identificada como "voice3"; no se documentan capacidades de cambio de voz, emocion o estilo.
- No se documenta soporte de tool calling, razonamiento multi-paso ni capacidades multimodales (no aplica a un modelo TTS).
- Capacidades multilingues: limitadas al portugues segun las etiquetas; no se declara soporte de otros idiomas.
- No se documentan modos especiales (thinking, vision, audio de entrada, etc.).

## Casos de uso

- Lectura de articulos y noticias en portugues europeo: el modelo puede convertir texto en audio para aplicaciones de accesibilidad o de consumo de contenido, aprovechando su ligereza para generar fragmentos bajo demanda.
- Asistentes de voz para aplicaciones moviles o de escritorio: al ejecutarse en ONNX sobre CPU, permite incorporar sintesis de voz sin depender de servicios en la nube ni de GPU.
- Sistemas de navegacion o avisos por voz: la baja latencia esperada de un modelo Piper lo hace adecuado para anuncios cortos e instrucciones en tiempo real en portugues de Portugal.
- Generacion de audiolibros o podcasts automatizados: util para convertir grandes volumenes de texto en audio de forma por lotes, con un coste computacional bajo.
- Integracion en dispositivos embebidos o IoT: el tamano compacto del modelo y su formato ONNX facilitan su despliegue en hardware con recursos limitados para interfaces habladas.
- Prototipado de productos de voz para el mercado portugues: sirve como base para validar flujos de TTS en pt-PT antes de invertir en modelos comerciales o de mayor calidad.
- Accesibilidad web: lectura en voz alta de contenido para usuarios con discapacidad visual, en un idioma con menor cobertura en herramientas TTS comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoria de despliegues, ya que el modelo esta pensado para CPU mediante ONNX Runtime; no se documentan requisitos de memoria especificos.
- GPU recomendadas: no disponibles; el modelo no esta orientado a GPU.
- Compatibilidad con GPU de consumo: no documentada; el enfoque es CPU.
- Opciones de despliegue: ONNX Runtime, Piper (binario oficial), y potencialmente wrappers que consuman modelos Piper en ONNX (por ejemplo, integraciones en Python o en aplicaciones de escritorio).
- Latencia y throughput: no disponibles; en la familia Piper se espera inferencia en tiempo real o cercana a tiempo real en CPU, pero no hay datos publicados para esta voz concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/pipertts_pt-PT_voice3 | no disponible | no aplica | no disponible | no disponible | Hugging Face (ONNX) |
| Otras voces Piper pt-PT | no disponible | no aplica | no disponible | variable segun modelo | Hugging Face / Piper |
| Coqui TTS (voces pt) | no disponible | no aplica | no disponible | variable (MPL-2.0 en el framework) | GitHub / Hugging Face |
| Modelos TTS comerciales (p. ej. servicios cloud) | no disponible | no aplica | no disponible | propietaria | APIs comerciales |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta sesgos; al ser un modelo entrenado con datos sinteticos derivados de Tuga-TTS, puede heredar sesgos del corpus original y de la voz sintetica utilizada.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede producir pronunciaciones incorrectas, entonacion artificial o errores en palabras poco frecuentes o extranjerismos.
- Limitacion de idioma: solo se declara portugues; no se garantiza un comportamiento correcto en otras lenguas ni en variantes distintas del pt-PT.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar la model card antes de usarlo en produccion.
- Documentacion tecnica minima: sin informacion sobre arquitectura exacta, datos de entrenamiento ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad para produccion.
- Popularidad nula (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en la comunidad ni de validacion externa.
- El dataset declarado es sintetico, lo que puede afectar a la naturalidad y a la diversidad de estilos de habla.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/pipertts_pt-PT_voice3
- Dataset declarado: https://huggingface.co/datasets/Phoonnx/tuga-tts-train-synthetic-voice3
- Proyecto Piper TTS (repositorio oficial): https://github.com/rhasspy/piper
- ONNX Runtime: https://onnxruntime.ai/
- Corpus Tuga-TTS (referencia del dataset base): no disponible en la informacion proporcionada.
