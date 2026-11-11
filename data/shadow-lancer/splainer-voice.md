# Shadow-lancer/splainer-voice

## Resumen

Splainer Voice es un paquete de voz distribuido a traves de Hugging Face que empaqueta dos componentes de inferencia: un modelo de sintesis de voz (Kokoro-82M en formato ONNX) y dos modelos de reconocimiento automatico del habla (Whisper large-v3-turbo y Whisper small, ambos en formato CTranslate2). No es un modelo entrenado por el autor, sino una distribucion empaquetada por Shadow-lancer para alimentar la aplicacion Splainer, un asistente que funciona de forma local y offline en el PC del usuario. El repositorio incluye tambien el binario del servidor de voz para Windows x64 y las bibliotecas CUDA necesarias para aceleracion en tarjetas NVIDIA.

El problema que resuelve es la integracion de un pipeline completo de voz (texto a voz y voz a texto) en una aplicacion de escritorio sin dependencia de servicios en la nube. El autor prioriza la privacidad y el funcionamiento offline: todos los archivos se descargan una vez y se verifican mediante SHA-256 antes de su uso. El paquete esta pensado para ejecutarse en cualquier PC con el modo basico (procesador, Whisper small) y aprovecha GPU NVIDIA de 6 GB o mas para el modo acelerado con Whisper large-v3-turbo.

La relevancia de esta ficha es limitada en terminos de investigacion: no se trata de un modelo nuevo ni de pesos originales, sino de una distribucion de modelos existentes con licencias mixtas. Su interes practico esta en el empaquetado (ONNX y CTranslate2), en la seleccion de componentes ligeros (Kokoro-82M para TTS) y en la documentacion de licencias y procedencia que el autor incluye en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: Kokoro-82M (TTS, ONNX) + Whisper large-v3-turbo y Whisper small (ASR, CTranslate2) |
| Parametros totales | Kokoro-82M: 82 M; Whisper large-v3-turbo: no disponible en la informacion; Whisper small: no disponible en la informacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No especificados; Kokoro se distribuye como ONNX (kokoro-v1.0.onnx) y Whisper como model.bin de CTranslate2 |
| Idiomas soportados | no disponible (la model card no lista idiomas; Whisper large-v3-turbo y small son multilingues por diseno, pero no se confirma en la informacion) |
| Licencia | mixed-open-licences (Apache-2.0 para Kokoro, MIT para Whisper y componentes, GPL-3.0 para espeak-ng, licencias NVIDIA para CUDA) |
| Formato de pesos | ONNX (Kokoro), CTranslate2 model.bin (Whisper), .bin para voces Kokoro, ZIP para binarios y bibliotecas |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Kokoro-82M es un modelo de sintesis de voz de 82 millones de parametros, exportado a ONNX mediante el proyecto kokoro-onnx. Whisper large-v3-turbo y Whisper small son modelos de reconocimiento automatico del habla de OpenAI, convertidos a CTranslate2 por mobiuslabsgmbh y Systran respectivamente para su uso con faster-whisper. El servidor de voz (`kokoro_server.py`) se construye con PyInstaller y empaqueta kokoro-onnx, ONNX Runtime, faster-whisper, CTranslate2, PyAV/FFmpeg y espeak-ng.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que el autor no entrena modelos. La innovacion tecnica del paquete es de ingenieria de distribucion: seleccion de formatos optimizados para inferencia local (ONNX para TTS, CTranslate2 para ASR), verificacion de integridad por SHA-256, aislamiento del servidor en 127.0.0.1 con token por instalacion y separacion entre modo CPU y modo GPU con bibliotecas CUDA empaquetadas.

## Capacidades

- Sintesis de voz (texto a voz) mediante Kokoro-82M con el conjunto de voces `voices-v1.0.bin`.
- Reconocimiento automatico del habla (voz a texto) mediante Whisper small en CPU y Whisper large-v3-turbo en GPU NVIDIA.
- Ejecucion completamente offline una vez descargados los archivos.
- Verificacion de integridad de cada archivo mediante SHA-256 antes de su uso.
- Servidor local que solo escucha en 127.0.0.1 y responde unicamente a Splainer con un token por instalacion.
- Modo CPU para cualquier PC (0.95 GB) y modo GPU para tarjetas NVIDIA con 6 GB o mas (+2.91 GB).
- Latencia declarada de aproximadamente 0.2 s por pregunta en modo GPU con Whisper large-v3-turbo.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del pipeline TTS/ASR.

## Casos de uso

- Asistente de escritorio con voz integrada: Splainer usa Kokoro-82M para leer respuestas en voz alta y Whisper para transcribir la entrada del usuario, todo sin enviar audio a servidores externos.
- Dictado local en aplicaciones de escritorio: el modo CPU con Whisper small permite transcribir voz en cualquier PC sin GPU, con un coste de 0.95 GB de disco.
- Transcripcion acelerada en equipos con GPU: con una NVIDIA de 6 GB o mas, Whisper large-v3-turbo procesa cada consulta en torno a 0.2 s, adecuado para interaccion conversacional fluida.
- Escenarios de privacidad estricta: al ejecutarse offline y con el servidor limitado a 127.0.0.1, el audio no sale del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Lectura de documentos y respuestas largas: Kokoro-82M genera voz sintetica para narracion de texto, util en herramientas de accesibilidad o lectura asistida.
- Despliegue en Windows x64 corporativo: el paquete incluye binarios y bibliotecas CUDA listos para usar, lo que simplifica la instalacion en flotas de equipos Windows sin gestion manual de dependencias.
- Reconstruccion y auditoria: la carpeta `source/` contiene el codigo del servidor, las versiones exactas de paquetes y el script de build, lo que permite reconstruir el binario y auditar la cadena de suministro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Modo CPU: 0.95 GB de disco (programa de voz, Kokoro y Whisper small); funciona en cualquier PC.
- Modo GPU: 2.91 GB adicionales (bibliotecas CUDA y Whisper large-v3-turbo); requiere tarjeta NVIDIA con 6 GB de VRAM o mas.
- VRAM estimada para inferencia: no disponible de forma explicita; la model card solo indica el umbral de 6 GB para el modo GPU.
- GPU recomendadas: cualquier NVIDIA con 6 GB o mas de VRAM; no se listan modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: si, siempre que la tarjeta NVIDIA tenga al menos 6 GB de VRAM.
- Opciones de despliegue: servidor propio empaquetado con PyInstaller (`splainer-voice-win-x64.zip` y `splainer-voice-gpu-win-x64.zip`); los componentes subyacentes (kokoro-onnx, faster-whisper, ONNX Runtime, CTranslate2) pueden usarse por separado.
- Latencia: aproximadamente 0.2 s por pregunta en modo GPU con Whisper large-v3-turbo, segun la model card. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Splainer Voice (este paquete) | Pipeline TTS + ASR empaquetado | Kokoro-82M + Whisper (tamanos no detallados) | no disponible | mixed-open-licences | Hugging Face, binarios Windows x64 |
| hexgrad/Kokoro-82M | TTS | 82 M | no disponible | Apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | ASR | no disponible en la informacion | no disponible | MIT | Hugging Face |
| Systran/faster-whisper-small | ASR (CTranslate2) | no disponible en la informacion | no disponible | MIT | Hugging Face |

## Limitaciones y advertencias

- No es un modelo original: los pesos pertenecen a Kokoro-82M (hexgrad) y a Whisper (OpenAI); el autor solo empaqueta y distribuye.
- La licencia es mixta (`mixed-open-licences`): conviene revisar cada componente por separado antes de uso comercial, en especial espeak-ng (GPL-3.0) y las bibliotecas CUDA de NVIDIA.
- Los binarios estan compilados unicamente para Windows x64; no se ofrece soporte para Linux ni macOS en la informacion disponible.
- El servidor solo escucha en 127.0.0.1 y requiere un token por instalacion, lo que limita su uso a la aplicacion Splainer y no como servicio generico.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion o error de transcripcion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.
- El modo GPU exige tarjeta NVIDIA; no se menciona soporte para AMD, Intel ni aceleracion por NPU.
- La fecha de creacion indicada (2026-11-10) es posterior a la de esta ficha; conviene verificar la vigencia y el contenido actual del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shadow-lancer/splainer-voice
- Sitio de Splainer: https://splainer.shadow-lancer.com
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- kokoro-onnx: https://github.com/thewh1teagle/kokoro-onnx
- faster-whisper-large-v3-turbo (CTranslate2): https://huggingface.co/mobiuslabsgmbh/faster-whisper-large-v3-turbo
- faster-whisper-small (CTranslate2): https://huggingface.co/Systran/faster-whisper-small
