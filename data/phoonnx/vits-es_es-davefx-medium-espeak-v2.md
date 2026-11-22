# Phoonnx/vits-es_es-davefx-medium-espeak-v2

## Resumen

vits-es_es-davefx-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en castellano de Espana basada en la arquitectura VITS del ecosistema Piper. El modelo original fue entrenado por Rhasspy y publicado como parte de rhasspy/piper-voices; TigreGotico Lda lo ha convertido a formato ONNX para su uso con la libreria phoonnx, que es la que da nombre al repositorio. La voz concreta corresponde al identificador `piper/es_ES-davefx-medium-v2`, una unica hablante femenina de calidad media.

El modelo resuelve el problema de generar audio inteligible en castellano de Espana a partir de texto, con un enfoque ligero: el grafo en fp32 ocupa 63,2 MB y la copia int8 solo 18,7 MB, lo que permite ejecutarlo en CPU sin GPU. Esta version v2 sustituye a la anterior (Phoonnx/vits-es_es-davefx-medium-espeak) porque el modelo upstream fue reentrenado sobre las bases de Piper 1.5, con lo que los pesos antiguos quedaron obsoletos.

La relevancia actual es practica: se trata de una voz CC0 1.0 sin restricciones de uso comercial, integrable en asistentes de voz (OVOS), sistemas de lectura por voz o pipelines de accesibilidad, con un factor de tiempo real (RTF) de 0,041 en fp32 sobre un Intel i9-11900H. No es un modelo de lenguaje, sino un componente especializado de sintesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto sin ventana declarada) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafos `<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Fonemizador | espeak-ng, voz `es` |
| Puntuacion | entrenada con `, . ! ? : ;` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

VITS es un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un predictor de duracion y un decoder generativo basado en flujo normalizador y GAN, lo que permite sintetizar audio de forma directa sin un vocoder separado. En esta implementacion, la entrada no es texto crudo sino fonemas en alfabeto IPA producidos por espeak-ng (voz `es`), de modo que la calidad depende de la fidelidad de esa transcripcion fonetica.

El modelo upstream fue entrenado por Rhasspy partiendo del modelo base `rdh` (calidad media, nl_BE, un hablante flamenco, CC0), con tecnicas MRD y SDP, y requiere Piper 1.5 o superior. Los datos de entrenamiento concretos no estan registrados en la model card upstream; se referencia el catalogo de datasets de voz de OHF-Voice (https://github.com/OHF-Voice/voice-datasets) con licencia CC0. Los ajustes de inferencia por defecto son noise_scale 0.5 y noise_w 0.333. La conversion a ONNX realizada por TigreGotico no altera los pesos; solo la copia int8 los cuantiza mediante onnxruntime 1.32.0.

## Capacidades

- Sintesis de voz en castellano de Espana a partir de texto, con salida WAV a 22050 Hz.
- Fonemizacion mediante espeak-ng (voz `es`); tambien admite el port espyak como alternativa, con posibles diferencias foneticas.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`), mantenida en la sintesis por phoonnx 1.96.1a1 y posteriores.
- Una unica voz (hablante), sin control de multiples hablantes ni de emocion.
- Ejecucion en CPU sin GPU, con grafos fp32 e int8.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento; es exclusivamente un componente de sintesis.

## Casos de uso

- Asistentes de voz en OVOS: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` con el identificador `piper/es_ES-davefx-medium-v2`, lo que permite dotar de habla en castellano a un asistente domestico sin depender de servicios en la nube.
- Lectura por voz de documentos y articulos: con un RTF de 0,041 en fp32, un minuto de audio se genera en unos 2,5 segundos en CPU, lo que hace viable procesar textos largos por lotes.
- Accesibilidad para personas con discapacidad visual: al ser CC0 y ejecutable localmente, puede integrarse en lectores de pantalla o aplicaciones de escritorio sin coste de licencia ni envio de datos a terceros.
- Sistemas de anuncios y avisos automatizados: notificaciones en transporte, comercio o industria que requieren generar frases cortas en castellano de forma repetida y con baja latencia.
- Pruebas de calidad y evaluacion de pipelines TTS: la model card documenta un metodo de QA con ASR (nemo-parakeet-tdt-0.6b-v3 int8) y WER de 0,079, util como referencia para comparar otras voces del mismo ecosistema.
- Prototipado de productos de voz en entornos con recursos limitados: el grafo int8 de 18,7 MB y un pico de RSS de 237 MB permiten desplegarlo en dispositivos embebidos o contenedores pequenos.
- Generacion de audiolibros o contenido educativo en castellano: la licencia CC0 elimina las restricciones de distribucion comercial del audio generado.

## Benchmarks y rendimiento

Datos de QA publicados en la model card, medidos sobre un Intel Core i9-11900H a 2,50 GHz con 4 hilos y evaluados con ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la verificacion | pass | pass |
| WER | 0,079 | 0,079 |
| Caracteres por segundo | 17,3 a 19,3 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,97 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 296,4 MB | 237,0 MB |
| RTF (mediana de 3, 4 hilos) | 0,041 | 0,100 |

No se han publicado resultados de benchmarks estandar (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. El consumo de memoria es de aproximadamente 296 MB (fp32) o 237 MB (int8) de RSS en el entorno de medida.
- GPU recomendadas: no aplica; el modelo esta pensado para inferencia en CPU.
- GPU de consumo: no es necesario; cabe en cualquier CPU moderna. No se dispone de datos de ejecucion en GPU.
- Opciones de despliegue: phoonnx (libreria nativa del modelo, `pip install --pre phoonnx`), con espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; integracion en OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,041 en fp32 y 0,100 en int8 (mediana de 3 ejecuciones, 4 hilos) sobre i9-11900H; entre 17,3 y 19,3 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-es_es-davefx-medium-espeak-v2 (este) | VITS (Piper) | es-ES | texto fonemizado con espeak | CC0 1.0 | ONNX fp32/int8 | RTF 0,041 fp32; 63,2 MB fp32 |
| Phoonnx/vits-es_es-davefx-medium-espeak | VITS (Piper) | es-ES | texto fonemizado con espeak | CC0 1.0 | ONNX | Version anterior, pesos previos a Piper 1.5; sustituida por este modelo |
| rhasspy/piper-voices/es/es_ES/davefx/medium | VITS (Piper) | es-ES | texto fonemizado con espeak | CC0 1.0 | pesos Piper (no ONNX) | Modelo upstream del que deriva esta conversion |
| Otras voces de rhasspy/piper-voices para es_ES | VITS (Piper) | es-ES | texto fonemizado | variable (mayoria CC0) | pesos Piper | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con voces de otros ecosistemas (por ejemplo, Coqui TTS o modelos comerciales) en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola hablante: no permite cambiar de voz, genero ni estilo; no hay control de emocion ni de prosodia mas alla de la puntuacion.
- Dependencia de espeak-ng: la calidad depende de la fonemizacion; con el port espyak algunas palabras pueden pronunciarse mal, segun advierte la propia model card.
- Cobertura limitada a es-ES: no se declaran otros idiomas ni variantes del castellano.
- Datos de entrenamiento no registrados: no se puede auditar la composicion del corpus, lo que impide evaluar sesgos de origen con rigor.
- Riesgo de artefactos acusticos y de pronunciacion incorrecta en nombres propios, siglas y palabras extranas al corpus.
- Evaluacion de calidad limitada: el QA se basa en 3 frases de FLORES-200 con WER 0,079, una muestra muy reducida que no garantiza el rendimiento en dominios especializados.
- Licencia CC0 1.0: permite uso comercial y modificacion sin atribucion obligatoria, aunque la model card solicita creditar a Rhasspy; conviene verificar la licencia de los pesos upstream antes de redistribuir.
- La cuantizacion int8 duplica el RTF (0,100 frente a 0,041) pese a reducir el grafo a 18,7 MB; la eleccion depende del equilibrio entre memoria y latencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-davefx-medium-espeak-v2
- Version anterior: https://huggingface.co/Phoonnx/vits-es_es-davefx-medium-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/es/es_ES/davefx/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Catalogo de datasets de voz de OHF-Voice: https://github.com/OHF-Voice/voice-datasets
