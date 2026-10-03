# ahmady36/shaikhy-models

## Resumen

Shaikhy models es una exportacion ONNX cuantizada a INT8 del modelo de voz `obadx/muaalem-model-v3_2`, publicada por el usuario `ahmady36` y utilizada por la aplicacion Shaikhy (shaikhy.com) para ofrecer retroalimentacion sobre recitacion del Coran y reglas de tajweed. No se trata de un modelo entrenado desde cero, sino de una conversion del modelo base a un formato optimizado para inferencia: un unico archivo `muaalem_tajweed_int8_fastattn.onnx` de 876.441.104 bytes (aproximadamente 0,9 GB de repositorio).

El interes de esta publicacion es practico: el modelo base se distribuye en su formato original y este export reduce el peso y acelera la inferencia mediante cuantizacion INT8 y ONNX Runtime, lo que permite ejecutar la deteccion de errores de recitacion en entornos con recursos limitados (CPU, movil o navegador). El autor indica que los archivos son inmutables: cada nueva version se publica con un nombre de archivo distinto y los enlaces de descarga fijan el commit concreto, lo que facilita la reproducibilidad en produccion.

La licencia es MIT, heredada del modelo base, y el repositorio no registra descargas ni likes en el momento de la consulta. No se documentan en la informacion disponible ni la arquitectura exacta del modelo base, ni el volumen de datos de entrenamiento, ni resultados de benchmarks, por lo que buena parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo de reconocimiento de voz exportado a ONNX; el sufijo `fastattn` del archivo sugiere un mecanismo de atencion optimizado, sin confirmacion por parte del autor |
| Parametros totales | No disponible. Estimacion a partir del tamano del archivo INT8 (876.441.104 bytes, en torno a 1 byte por parametro): del orden de 870 millones. Cifra no confirmada por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto; procesa fragmentos de audio) |
| Tipos de cuantizacion | INT8 (unico archivo publicado: `muaalem_tajweed_int8_fastattn.onnx`) |
| Idiomas soportados | Arabe (recitacion coranica). No se documentan otros idiomas |
| Licencia | MIT |
| Formato de pesos | ONNX (un unico archivo, cuantizado a INT8) |

Datos adicionales del archivo publicado:

| Campo | Valor |
|---|---|
| Nombre | `muaalem_tajweed_int8_fastattn.onnx` |
| Tamano | 876.441.104 bytes |
| SHA-256 | `2106429568d55dc05bf2cda7a97cf1dbcb13bf85a0d258d2cbf4d397e220226a` |
| Politica de versionado | Archivos inmutables; nuevas versiones con nuevo nombre y enlaces fijados a un commit |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base `obadx/muaalem-model-v3_2`. Por los tags del repositorio (`speech`, `quran`, `tajweed`) y por el uso declarado, se trata de un modelo de reconocimiento de voz orientado a arabe coranico, con salida capaz de alimentar diagnostico de tajweed (etiquetado de reglas y deteccion de errores de recitacion). El nombre del archivo, `fastattn`, apunta a alguna forma de atencion eficiente, pero no hay documentacion que lo confirme en la informacion disponible.

El unico proceso tecnico documentado en esta publicacion es la cuantizacion: conversion a ONNX y reduccion de precision a INT8 (`base_model_relation: quantized`). No se detallan el numero de tokens o horas de audio de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino con RLHF, DPO u otra tecnica de alineacion. Tampoco se especifica la herramienta de exportacion ni si se aplicaron optimizaciones adicionales de grafo mas alla de la propia cuantizacion.

## Capacidades

- Reconocimiento de voz (ASR) especializado en recitacion del Coran en arabe.
- Analisis de tajweed: el nombre del modelo y su uso declarado indican deteccion y etiquetado de reglas de recitacion.
- Retroalimentacion sobre errores de recitacion, orientada a estudiantes y aplicaciones educativas.
- Procesamiento de audio como entrada; no es un modelo de texto ni multimodal en el sentido de imagen o video.
- Inferencia optimizada: cuantizacion INT8 y formato ONNX, apto para ejecucion en CPU y en entornos con recursos limitados.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo de razonamiento explicito (thinking mode).
- Cobertura multilingue: no disponible; los tags solo mencionan arabe coranico.
- Capacidades de vision o audio general (transcripcion de habla no coranica): no disponibles.

## Casos de uso

- Correccion de recitacion en tiempo real: integrado en una aplicacion movil o web mediante ONNX Runtime, el modelo analiza el audio del recitante y devuelve avisos sobre errores de pronunciacion y reglas de tajweed. Es el caso de uso principal declarado por el autor.
- Plataformas educativas de memorizacion (hifz): escuelas y madrasas pueden incorporar el modelo para que el alumnado practique sin supervision directa del profesor, con retroalimentacion automatica sobre cada versiculo.
- Evaluacion en examenes de recitacion: uso como apoyo objetivo en pruebas de ijazah o certificaciones, generando un informe de errores por regla que el examinador revisa despues.
- Autoevaluacion domestica: al ejecutarse en CPU con un archivo de menos de 1 GB, el modelo puede desplegarse en un portatil o en el navegador, sin necesidad de GPU ni de conexion permanente al servidor.
- Investigacion en ASR de arabe clasico: el modelo sirve como base para estudiar fenomenos foneticos del arabe coranico y para comparar con sistemas ASR genericos.
- Anotacion de corpus de audio coranico: preetiquetado automatico de grabaciones para construir datasets de tajweed, reduciendo el trabajo manual de anotadores.
- Herramientas de accesibilidad y practica guiada: integracion en aplicaciones de audio interactivo que marcan en pantalla el punto exacto del error y la regla incumplida, util para personas que aprenden sin profesor presencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error de reconocimiento (WER, PER), exactitud de deteccion de tajweed, latencia ni throughput, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los pesos INT8 ocupan alrededor de 0,82 GiB, por lo que el uso de memoria del modelo es previsiblemente inferior a 1 GB, mas el espacio de activaciones y el bucle de audio, no documentado.
- GPU recomendadas: no disponibles. Dado el tamano, cualquier GPU con al menos 2 GB de memoria deberia ser suficiente; no hay datos que confirmen configuraciones concretas.
- GPU de consumo: si, en principio cabe en tarjetas de gama media y baja, e incluso en iGPU recientes, dado que el archivo pesa menos de 1 GB en INT8. No hay mediciones publicadas.
- CPU: plausible como objetivo principal, ya que la cuantizacion INT8 en ONNX esta disenada para inferencia en CPU. No se documentan requisitos minimos de nucleos ni de RAM.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web para navegador, ONNX Runtime Mobile para Android e iOS. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje y no a este tipo de modelo de voz.
- Latencia y throughput: no disponibles.
- Dispositivos de borde: el tamano del archivo y el formato INT8 hacen viable el despliegue en movil y en navegador, aunque sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `ahmady36/shaikhy-models` (este) | Del orden de 870 M (estimado, no confirmado) | No aplica (audio) | Reconocimiento de recitacion y tajweed | MIT | ONNX INT8 |
| `obadx/muaalem-model-v3_2` (base) | No disponible | No aplica (audio) | Reconocimiento de recitacion y tajweed | MIT | No disponible en la informacion proporcionada |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican en la informacion proporcionada otros modelos especializados en deteccion de tajweed comparables. Los sistemas ASR genericos (por ejemplo, la familia Whisper) no son equivalentes funcionalmente: transcriben habla, pero no estan disenados para diagnosticar reglas de recitacion coranica, por lo que una comparacion directa de metricas no seria valida.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al estar especializado en recitacion coranica, es previsible un rendimiento inferior fuera de ese dominio (habla coloquial, otros dialectos arabes u otros idiomas), aunque no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: en modelos de voz el riesgo equivalente son transcripciones o etiquetas incorrectas, especialmente con ruido de fondo, solapamiento de voces o grabaciones de baja calidad. No hay tasas de error publicadas.
- Limitaciones de contexto: no se documenta la duracion maxima de audio que el modelo procesa por inferencia, ni como se segmentan recitaciones largas.
- Limitaciones de idioma: el repositorio solo documenta arabe coranico; no hay soporte declarado para otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la atribucion. El autor mantiene la atribucion a `obadx` como creador del modelo original.
- Caveat de atribucion: la calidad y el comportamiento del modelo dependen del trabajo original de `obadx`; esta publicacion solo anade la cuantizacion. Cualquier problema de precision debe evaluarse contra el modelo base sin cuantizar.
- Caveat de versionado: los archivos son inmutables y las nuevas versiones se publican con otro nombre; es recomendable fijar el SHA-256 o el commit para evitar cambios silenciosos en produccion.
- Caveat de adopcion: el repositorio no registra descargas ni likes, y no hay benchmarks ni evaluaciones independientes publicadas, por lo que la validacion corre por cuenta de quien lo integre.
- Uso sensible: la evaluacion de recitacion coranica tiene connotaciones religiosas y educativas; conviene presentar la salida como apoyo y no como veredicto definitivo sin revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmady36/shaikhy-models
- Modelo base: https://huggingface.co/obadx/muaalem-model-v3_2
- Aplicacion Shaikhy: https://shaikhy.com
- Paper, blog o repositorio de codigo: no disponibles en la informacion proporcionada.
