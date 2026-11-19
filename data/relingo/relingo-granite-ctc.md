# relingo/relingo-granite-ctc

## Resumen
ReLingo Granite CTC es una distribucion en formato ONNX del modelo de reconocimiento automatico del habla (ASR) ibm-granite/granite-speech-5.0-470m-turboctc de IBM, preparada por ReLingo para su ejecucion en el navegador mediante onnxruntime-web con aceleracion WebGPU y respaldo en WebAssembly. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion y cuantizacion del modelo base de IBM orientada a inferencia en el dispositivo (on-device), sin servidor y sin conexion.

El modelo resuelve la transcripcion de voz a texto en entornos cliente, lo que resulta relevante para aplicaciones web que necesitan privacidad (el audio no sale del navegador), baja latencia y funcionamiento offline. El repositorio ocupa unos 0,3 GB y contiene los pesos en cuantizacion de 4 bits con grafo en fp16 (`ct5_conformer_q4f16.onnx` mas su fichero externo `.onnx.data`), junto con el front-end de extraccion de caracteristicas (configuracion, filtros mel, ventana STFT) y el vocabulario.

La arquitectura subyacente es un conformer CTC de aproximadamente 470 millones de parametros, con decodificacion CTC no autorregresiva. La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial. La informacion publicada es muy escasa: no hay datos de benchmarks, idiomas soportados ni detalles de entrenamiento en la model card.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC (derivado de granite-speech-5.0-470m-turboctc) |
| Parametros totales | 470 millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en 4 bits (q4) con grafo en fp16; fichero ONNX unico con pesos externos `.onnx.data` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime-web), pesos externos `.onnx.data`, front-end en JSON y binarios (mel_filters.bin, stft_window.bin), vocab.json |

## Arquitectura y entrenamiento
El modelo base es un conformer, una arquitectura que combina bloques de atencion multi-cabeza con convoluciones y modulos feed-forward, adecuada para secuencias de audio. La cabecera es CTC (Connectionist Temporal Classification), lo que implica decodificacion no autorregresiva: el modelo emite directamente una distribucion sobre el vocabulario en cada frame y se aplica un colapso de repeticiones y eliminacion de simbolos blank, sin generar token a token. Esto reduce la latencia frente a modelos encoder-decoder autorregresivos como Whisper.

La version de ReLingo no aporta informacion sobre el proceso de entrenamiento: no se detalla el numero de horas de audio, la composicion del dataset, ni si hubo ajuste fino posterior. La unica transformacion documentada es la conversion a ONNX y la cuantizacion a 4 bits de los pesos manteniendo el grafo en fp16, optimizada para WebGPU. El front-end incluye los filtros mel y la ventana STFT precalculados, de modo que el navegador solo necesita ejecutar la transformada y la red.

## Capacidades
- Reconocimiento automatico del habla (speech-to-text) mediante decodificacion CTC.
- Ejecucion en el navegador con onnxruntime-web, usando WebGPU como backend principal y WebAssembly como respaldo.
- Procesamiento local sin envio de audio a servidores externos.
- Extraccion de caracteristicas integrada: el repositorio incluye configuracion del front-end, filtros mel y ventana STFT.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada mas alla del ASR ni modo de razonamiento.
- Capacidades multilingues: no disponibles en la informacion publicada.

## Casos de uso
- Transcripcion en aplicaciones web de notas de voz: el modelo se carga en el cliente y transcribe grabaciones sin subir el audio, lo que es adecuado por su tamano contenido (0,3 GB) y su ejecucion via WebGPU.
- Dictado en editores de texto online: al ser CTC no autorregresivo, la latencia por fragmento es baja y permite retroalimentacion casi en tiempo real mientras el usuario habla.
- Subtitulado de reuniones o clases en el navegador: el procesamiento local evita problemas de cumplimiento normativo al no transmitir conversaciones a terceros.
- Accesibilidad para personas con discapacidad auditiva: transcripcion integrada en paginas web sin dependencia de servicios cloud ni cuotas de API.
- Aplicaciones de campo con conectividad limitada: al ejecutarse en el dispositivo, funciona offline una vez cargado el modelo en cache.
- Prototipado rapido de interfaces de voz: la distribucion ONNX con front-end incluido simplifica la integracion en demos y pruebas de concepto sin infraestructura de servidor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,3 GB, por lo que la huella en memoria deberia ser del orden de cientos de MB con pesos en 4 bits, aunque no se confirma.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas modernas o dedicadas de escritorio); no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: si, al estar disenado para navegador con WebGPU y respaldo WebAssembly.
- Opciones de despliegue: onnxruntime-web (WebGPU y WASM); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR en ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ReLingo Granite CTC (este) | 470 M | no disponible | ONNX q4/fp16 | Apache-2.0 | Optimizado para navegador con WebGPU |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470 M | no disponible | no disponible | Apache-2.0 | Modelo base de IBM, mismo tamano |
| Whisper (variantes pequenas) | no disponible en esta ficha | no disponible | no disponible | no disponible | Referencia habitual en ASR, no comparado con datos |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias
- La model card no documenta sesgos conocidos ni evaluaciones de equidad.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos CTC, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue.
- Longitud de contexto y segmentacion de audio no documentadas.
- La cuantizacion a 4 bits puede degradar la precision respecto al modelo base en fp32/fp16; no se aportan metricas de la perdida.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda verificar las condiciones del modelo base de IBM.
- Dependencia de WebGPU para rendimiento optimo; el respaldo WebAssembly puede ser considerablemente mas lento.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.

## Enlaces
- Hugging Face: https://huggingface.co/relingo/relingo-granite-ctc
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
