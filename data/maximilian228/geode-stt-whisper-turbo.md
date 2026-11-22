# Maximilian228/Geode-STT-whisper-turbo

## Resumen

Geode-STT-whisper-turbo es un paquete de reconocimiento automatico del habla (ASR) empaquetado en formato sherpa-onnx para su uso en la aplicacion Android Geode, con inferencia local y sin conexion. No es un modelo entrenado desde cero: es una conversion a ONNX int8 del modelo openai/whisper-large-v3-turbo (revision 41f01f3fe87f28c78e2fbf8b568835947dd65ed9), empleando la exportacion oficial de k2-fsa/sherpa-onnx sin modificaciones. El autor, Maximilian228, publica el pack con licencia MIT y un tamano de repositorio de 1,0 GB.

El modelo resuelve el problema de transcribir voz a texto en dispositivos moviles de forma offline, con un equilibrio entre precision y coste computacional. Whisper large-v3-turbo es una variante destilada del decodificador de Whisper large-v3, lo que reduce el numero de capas del decoder y acelera la inferencia manteniendo el encoder completo. El pack incluye tres ficheros: `turbo-encoder.int8.onnx`, `turbo-decoder.int8.onnx` y `turbo-tokens.txt`.

Es relevante para desarrolladores que necesitan ASR multilingue en produccion sobre CPU o Android sin depender de servicios en la nube, y para quienes evaluan el compromiso entre cobertura idiomatica (30 idiomas declarados) y calidad real por idioma, dado que el autor publica errores medidos en FLEURS que varian desde el 2,8 % de WER en espanol hasta el 127,61 % en hausa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, decodificador destilado a 4 capas) |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene 809 M, no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | int8 (unica variante publicada en el pack) |
| Idiomas soportados | en, de, es, fr, it, pt, tr, id, vi, ko, ja, zh, uk, ru, ar, fa, tl, th, ur, hi, jv, sw, ha, bn, gu, kn, mr, pa, ta, te (30) |
| Licencia | MIT |
| Formato de pesos | ONNX int8 (encoder y decoder separados) + fichero de tokens de texto |
| Libreria de inferencia | sherpa-onnx (v2.0.1 en las pruebas del autor) |
| Tipo de modelo sherpa-onnx | `whisper` |
| Modelo base | openai/whisper-large-v3-turbo (revision 41f01f3fe87f28c78e2fbf8b568835947dd65ed9) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El pack hereda la arquitectura de Whisper large-v3-turbo: un transformer encoder-decoder con atencion completa, entrenado por OpenAI sobre pares audio-texto a gran escala y con capacidad multilingue y de traduccion. La variante "turbo" reduce el decodificador a 4 capas (frente a las 32 de large-v3), lo que disminuye el coste de decodificacion y acelera la inferencia, a costa de una ligera perdida de precision en algunos idiomas. El encoder se mantiene intacto respecto a large-v3.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; estos datos pertenecen al modelo original de OpenAI y no se detallan en la model card del pack. La innovacion tecnica relevante aqui es el empaquetado: exportacion a ONNX con cuantizacion int8 realizada por sherpa-onnx, disenada para ejecucion en CPU y en dispositivos Android, con ficheros de encoder y decoder separados para permitir su carga en memoria de forma controlada. No se mencionan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Transcripcion de voz a texto multilingue en 30 idiomas, con deteccion implicita del idioma de entrada por parte del modelo base.
- Ejecucion totalmente offline y on-device, sin llamadas a red.
- Inferencia sobre CPU con cuantizacion int8, adecuada para moviles y equipos sin GPU.
- Formato compatible con sherpa-onnx, lo que permite integrarlo en aplicaciones Android, escritorio y servidores mediante la misma libreria.
- Capacidad de traduccion de voz a texto en ingles (heredada de Whisper), aunque no se documenta explicitamente en la model card del pack.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente ASR.
- No se documenta modo thinking, vision ni audio mas alla de la propia transcripcion.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones Android: el pack esta pensado para la app Geode y se ejecuta en local con sherpa-onnx, por lo que permite dictado y transcripcion sin conexion en un Redmi Note 9 Pro con RTF de 2,25 sobre clips de 10 s.
- Subtitulado offline de reuniones y clases: con un encoder que procesa ventanas de 30 s, se puede segmentar audio largo y transcribir por bloques en CPU, sin enviar datos a terceros.
- Asistentes de voz para entornos con conectividad limitada: al no requerir red, encaja en escenarios de campo, industria o zonas rurales donde la latencia de subida a la nube es inaceptable.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la variante int8 y el formato ONNX permiten desplegar en contenedores CPU con sherpa-onnx, priorizando coste sobre latencia.
- Aplicaciones de accesibilidad: dictado por voz para personas con movilidad reducida en dispositivos de gama media, gracias a un consumo de memoria de pico de 1716 MB y una carga inicial de 4,5 s.
- Prototipado rapido de pipelines ASR multilingues: el pack sirve para validar la calidad por idioma antes de comprometerse con un modelo mayor, usando los errores FLEURS publicados como referencia para decidir que idiomas cubrir.
- Transcripcion en espanol, italiano o coreano con alta precision: con WER del 2,8 % en espanol, 3,01 % en italiano y CER del 2,35 % en coreano, es adecuado para productos dirigidos a esos mercados.

## Benchmarks y rendimiento

Errores medidos por el autor en FLEURS (normalizado: sin mayusculas ni puntuacion), sobre 30 enunciados por idioma, con sherpa-onnx int8 en CPU:

| Idioma | Metrica | Error % |
|---|---|---|
| es | WER | 2,8 |
| ko | CER | 2,35 |
| it | WER | 3,01 |
| en | WER | 5,7 |
| id | WER | 5,99 |
| pt | WER | 6,16 |
| de | WER | 6,9 |
| uk | WER | 7,25 |
| tr | WER | 7,75 |
| fr | WER | 8,32 |
| vi | WER | 10,02 |
| ar | WER | 10,03 |
| zh | CER | 10,31 |
| tl | WER | 14,19 |
| ur | WER | 22,17 |
| fa | WER | 25,81 |
| th | CER | 27,88 |
| sw | WER | 35,98 |
| ha | WER | 127,61 |

Rendimiento en dispositivo, Redmi Note 9 Pro (Snapdragon 720G), sherpa-onnx v2.0.1 CLI, 4 hilos:

| Metrica | Valor |
|---|---|
| Tiempo de carga | 4,5 s |
| RTF (clip de 10 s) | 2,25 |
| Memoria pico (VmHWM) | 1716 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) por tratarse de un modelo ASR. Los unicos datos disponibles son los de FLEURS y los de rendimiento en dispositivo recogidos arriba.

## Requisitos de hardware

- Memoria: pico de 1716 MB de RSS en el dispositivo de prueba, por lo que se recomienda al menos 2 GB de RAM libre para la aplicacion.
- CPU: funciona en CPU sin GPU; el autor uso un Snapdragon 720G con 4 hilos y obtuvo un RTF de 2,25 (es decir, unos 22,5 s de proceso para un clip de 10 s en ese hardware).
- GPU: no se documenta soporte de GPU ni requisitos de VRAM para CUDA; el pack esta orientado a CPU.
- Cabe en moviles de gama media y en equipos de escritorio sin GPU; no se han publicado pruebas en GPU de consumo como RTX 4090.
- Despliegue: sherpa-onnx (CLI v2.0.1 probada por el autor); al ser ONNX, tambien podria ejecutarse con ONNX Runtime, aunque no se documenta en la model card.
- Latencia y throughput: solo se conoce el RTF de 2,25 en el Snapdragon 720G; no hay datos para otros procesadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Geode-STT-whisper-turbo (este pack) | no disponible (base 809 M) | ventanas de 30 s | 30 | MIT | ONNX int8 |
| openai/whisper-large-v3-turbo | 809 M (segun el modelo base, no confirmado en la informacion) | ventanas de 30 s | ~99 | MIT | safetensors / PyTorch |
| openai/whisper-large-v3 | 1550 M (segun el modelo base, no confirmado) | ventanas de 30 s | ~99 | MIT | safetensors / PyTorch |
| Alternativas ONNX de sherpa-onnx | no disponible | no disponible | no disponible | no disponible | ONNX |

La comparativa se limita a los datos disponibles. No se dispone de informacion sobre otros packs sherpa-onnx concretos ni sobre sus resultados en FLEURS, por lo que no es posible una comparacion cuantitativa de rendimiento entre alternativas.

## Limitaciones y advertencias

- Calidad muy desigual por idioma: el WER supera el 10 % en vietnamita, arabe, chino, tagalo, urdu, persa, tailandes, suajili y hausa; en hausa alcanza el 127,61 %, lo que lo hace inutilizable en la practica para ese idioma.
- El autor recomienda el pack solo para los idiomas marcados como `recommended_for`; el resto de idiomas se listan por transparencia, no como soporte de produccion.
- Los errores FLEURS se midieron sobre solo 30 enunciados por idioma, una muestra pequena que introduce alta varianza y no debe tomarse como estimacion robusta.
- El RTF de 2,25 implica que la transcripcion es mas lenta que el tiempo real en el dispositivo de prueba; para audio en directo se necesitaria hardware mas potente o un modelo menor.
- Consumo de memoria de 1716 MB, elevado para moviles de gama baja con poca RAM disponible.
- Riesgo de alucinacion inherente a Whisper: en segmentos con silencio, ruido o audio musical puede generar texto inventado o repetir frases.
- Sesgos del modelo base de OpenAI no documentados en la model card del pack; la evaluacion por idioma sugiere un sesgo claro hacia lenguas europeas y del este de Asia.
- Licencia MIT, sin restricciones documentadas para uso comercial, pero se recomienda verificar la licencia del modelo base y de la exportacion sherpa-onnx (Apache-2.0) al redistribuir.
- No hay soporte documentado de GPU ni de aceleracion por hardware distinta de CPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-whisper-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Revision del modelo base: 41f01f3fe87f28c78e2fbf8b568835947dd65ed9
- Exportador ONNX: https://github.com/k2-fsa/sherpa-onnx
- Libreria sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
