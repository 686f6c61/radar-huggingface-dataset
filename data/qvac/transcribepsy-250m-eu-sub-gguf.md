# qvac/TranscribePsy-250M-EU-sub-gguf

## Resumen

TranscribePsy-250M-EU-sub-gguf es la distribucion en formato GGUF, con cuantizacion de 8 bits (Q8_0), del modelo de reconocimiento automatico del habla TranscribePsy-250M-EU-sub, desarrollado por qvac (Tether Data, S.A. de C.V.). El modelo base es una destilacion compacta de 283,5 millones de parametros (254 M segun la model card del modelo base) derivada de Parakeet-TDT-0.6B-v3, orientada a inferencia en dispositivo y en el borde (edge), y entrenada con la tecnica CAFE (Confining Feature Distillation to Language-Routed Adapters) descrita en el preprint arXiv:2610.19134.

El modelo cubre ocho lenguas europeas seleccionadas por Multilingual LibriSpeech: neerlandes, ingles, frances, aleman, italiano, polaco, portugues y espanol. Un unico conjunto de pesos atiende las ocho lenguas sin necesidad de configurar el idioma, lo que simplifica el despliegue. Su relevancia actual radica en que ofrece reconocimiento de voz multilingue con un factor de tiempo real medio de 0,052 y un pico de memoria de aproximadamente 534 MiB en diez segundos de audio sobre seis telefonos medidos, lo que lo situa como una opcion viable para transcripcion local sin conexion.

Esta variante GGUF esta pensada para ejecutarse con el motor parakeet.cpp del repositorio qvac-fabric-speech.cpp, con parches propios que acotan la memoria del front-end mel y anaden un decodificador Core ML para el Neural Engine de Apple. El repositorio ocupa 0,3 GB y el fichero unico de pesos pesa 305 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Parakeet-TDT-0.6B-v3; destilacion con adaptadores enrutados por idioma, CAFE) |
| Parametros totales | 283.492.118 (dato de safetensors); 254 M segun la model card del modelo base |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de codificacion configurable: 60 s por defecto con 25 % de solape; 30 s en dispositivos con menos memoria) |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | nl, en, fr, de, it, pl, pt, es (8 lenguas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `transcribepsy-250m-eu-sub.gguf`, 305 MB) |

## Arquitectura y entrenamiento

El modelo base es una destilacion de Parakeet-TDT-0.6B-v3, un sistema de reconocimiento del habla con decodificador TDT (Token-and-Duration Transducer). La innovacion descrita en el articulo CAFE consiste en confinar la destilacion de caracteristicas a adaptadores enrutados por idioma, de modo que un unico modelo compacto cubre las ocho lenguas sin multiplicar los parametros por idioma. El resultado son 283,5 millones de parametros totales, aproximadamente la mitad del modelo profesor.

Los detalles concretos de composicion del dataset, numero de tokens de audio y si hubo etapas de ajuste fino supervisado adicionales no se detallan en la informacion disponible; la model card remite a la model card del modelo base y a un informe tecnico anunciado como proximo. Esta variante GGUF no modifica los pesos mas alla de la cuantizacion Q8_0 y su unico cambio funcional respecto al modelo base es el formato de serializacion. El motor de ejecucion incorpora parches propios: limites de memoria en el front-end mel y un decodificador Core ML para el Apple Neural Engine, presentados como pull request upstream.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en ocho lenguas europeas con un unico conjunto de pesos.
- Deteccion y transcripcion sin especificar el idioma de entrada.
- Procesamiento por lotes (batch), no en streaming.
- Codificacion de grabaciones largas mediante ventanas solapadas (60 s con 25 % de solape por defecto; 30 s en dispositivos con poca memoria).
- Ejecucion en dispositivo y en el borde mediante el motor parakeet.cpp, con variante Core ML para el Neural Engine.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion local en aplicaciones moviles: el modelo cabe en aproximadamente 534 MiB de pico de memoria a 10 s de audio y arroja una latencia de inferencia de 633 a 1.570 ms segun el telefono, lo que permite transcribir notas de voz sin enviar audio a la nube.
- Subtitulado y actas de reuniones multilingues: con las ocho lenguas cubiertas y ventanas de 60 s solapadas al 25 %, se pueden procesar grabaciones de 10 a 30 minutos manteniendo el pico de memoria por debajo de 2 GB.
- Asistentes de voz sin conexion en dispositivos con recursos limitados: el arranque en frio de 153 a 356 ms permite inicializar el motor bajo demanda en cada sesion de dictado.
- Procesamiento por lotes de archivos de audio en servidores de borde: el motor de linea de comandos acepta WAV mono a 16 kHz y permite fijar el numero de hilos, lo que facilita el escalado horizontal en equipos modestos.
- Investigacion en reconocimiento del habla multilingue: al ser una destilacion compacta con adaptadores enrutados por idioma, sirve como referencia reproducible para estudiar el equilibrio entre tamano y cobertura linguistica.
- Integracion en pipelines de transcripcion de contenido audiovisual: la conversion previa con ffmpeg a 16 kHz mono y el procesamiento por ventanas encajan en flujos automatizados de postproduccion.
- Aplicaciones de accesibilidad en tiempo casi real: la transcripcion de fragmentos cortos con latencias inferiores a dos segundos en telefonos de gama alta permite mostrar texto a medida que se habla, siempre que se trocee la entrada manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (WER, MMLU u otros) en la informacion disponible. La model card remite a la del modelo base para datos de precision. Si se publican mediciones de rendimiento en dispositivo:

| Dispositivo | SoC | Latencia de inferencia (ms) | Arranque en frio (ms) | Memoria pico a 10 s (MiB) |
|---|---|---|---|---|
| Galaxy S26 Ultra | 8 Elite Gen5 | 633 | 213 | 530 |
| Galaxy S25 Ultra | 8 Elite | 771 | 241 | 533 |
| iPhone 17 Pro Max | A19 Pro | 1.059 | 153 | 542 |
| iPhone 15 | A16 | 854 | 221 | 537 |
| Pixel 10 | Tensor G5 | 1.240 | 327 | 530 |
| Pixel 9 | Tensor G4 | 1.570 | 356 | 530 |

El conjunto de evaluacion son 160 enunciados aleatorios de Multilingual LibriSpeech (20 por lengua, 40 minutos de audio); cada cifra es la media de las tres mejores de cinco ejecuciones repetidas. El factor de tiempo real medio es de 0,052.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 530 a 542 MiB de pico a 10 s de audio en los dispositivos medidos; por debajo de 2 GB de pico en grabaciones de 10 a 30 minutos con ventanas de 60 s.
- GPU recomendadas: no se documentan requisitos de GPU de escritorio; el motor objetivo es parakeet.cpp sobre CPU movil y, en Apple silicon, el Neural Engine mediante la variante Core ML.
- Cabe en hardware consumer: si, en telefonos de gama alta y media (Snapdragon 8 Elite, Apple A16/A19 Pro, Google Tensor G4/G5) y presumiblemente en CPU de escritorio, aunque no se publican mediciones para estas ultimas.
- Opciones de despliegue: motor parakeet.cpp de qvac-fabric-speech.cpp (build propio desde el repositorio), variante Core ML para Apple Neural Engine, y descarga directa del fichero GGUF desde el Hub. No se menciona soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: latencia de inferencia de 633 a 1.570 ms por dispositivo; factor de tiempo real medio de 0,052 (aproximadamente 19 veces mas rapido que tiempo real en el conjunto medido).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TranscribePsy-250M-EU-sub-gguf | 283,5 M | 8 | GGUF Q8_0 | Apache 2.0 | Optimizado para parakeet.cpp en dispositivo |
| TranscribePsy-250M-EU-sub | 254 M | 8 | PyTorch | Apache 2.0 | Version de referencia, menor error declarado en las ocho lenguas MLS |
| TranscribePsy-250M-EU | 250 M (nominal) | 25 | PyTorch | Apache 2.0 | Mayor cobertura linguistica europea |
| TranscribePsy-250M-EU-sub-coreml | 254 M | 8 | Core ML | Apache 2.0 | Ejecucion en Apple Neural Engine |
| Parakeet-TDT-0.6B-v3 | 600 M | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo profesor del que se destila |

## Limitaciones y advertencias

- Solo cubre ocho lenguas: neerlandes, ingles, frances, aleman, italiano, polaco, portugues y espanol. Cualquier otra lengua queda fuera de alcance.
- Transcripcion por lotes, no en streaming; no admite entrada de audio continua en tiempo real sin troceado previo.
- El motor no remuestrea: la entrada debe ser WAV mono a 16 kHz, lo que exige un paso previo de conversion (por ejemplo, con ffmpeg).
- La memoria crece de forma marcada con la duracion de la grabacion si se codifica en una sola pasada; es obligatorio usar ventanas para audios largos.
- No esta pensado para decisiones automatizadas criticas para la seguridad ni de alto riesgo.
- No se publican tasas de error (WER) en la informacion disponible ni mediciones fuera de los seis telefonos evaluados; el rendimiento en CPU de escritorio o servidores no esta cuantificado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser una destilacion de Parakeet-TDT-0.6B-v3, hereda las caracteristicas del modelo profesor, cuyos sesgos no se detallan.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribucion y aviso; el titular es Tether Data, S.A. de C.V.
- El motor requiere compilar parches propios no fusionados aun upstream, lo que anade complejidad de mantenimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Modelo base: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Variante Core ML: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Variante de 25 lenguas: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Repositorio del motor y release parcheado: https://github.com/tether-ai-research/qvac-transcribePsy
- Motor parakeet.cpp dentro de qvac-fabric-speech.cpp: https://github.com/tetherto/qvac-fabric-speech.cpp/tree/master/engines/parakeet
- Blog de presentacion: https://huggingface.co/blog/qvac/transcribepsy-250m
- Articulo CAFE (arXiv:2610.19134): https://arxiv.org/abs/2610.19134
- Modelo profesor Parakeet-TDT-0.6B-v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
