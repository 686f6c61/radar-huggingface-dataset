# gpatane/yourec-android-models

## Resumen

YouRec for Android: LavaSR and VoiceFixer as ONNX es un repositorio de conversiones a formato ONNX de dos redes neuronales de restauracion de voz, publicado por el usuario gpatane para la version Android de la aplicacion YouRec. No se trata de modelos nuevos ni de pesos reentrenados: son exportaciones de los checkpoints originales de LavaSR v2 (de Yatharth Sharma) y VoiceFixer (de Haohe Liu et al.) realizadas con scripts que verifican el SHA-256 de cada checkpoint upstream antes de cargarlo y comparan la salida de ONNX Runtime con la de PyTorch sobre una entrada fija.

El objetivo es permitir la inferencia en el dispositivo (on-device) dentro de la app YouRec, que ejecuta ambos grafos en ONNX Runtime y aplica su propio procesamiento DSP alrededor. Los ficheros se descargan solo cuando el usuario activa el filtro y se validan contra un listado `SHA256SUMS`; ningun audio se envia a servidores externos. El repositorio ocupa 0,3 GB y esta etiquetado con `onnx`, `audio` y `speech-enhancement`.

La relevancia es practica: ofrece una via lista para produccion movil de dos sistemas de restauracion de audio conocidos, con licencias permisivas (Apache-2.0 para LavaSR, CC BY 4.0 para VoiceFixer) y con el trabajo de conversion y validacion ya hecho. No hay informacion publicada sobre arquitectura completa, numero de parametros ni benchmarks de calidad en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (LavaSR v2: backbone Vocos y cabeza espectral; VoiceFixer: red de analisis y vocoder neuronal) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de audio; LavaSR recibe mel [1, 80, 375], VoiceFixer mel [1, 1, 256, 128]) |
| Tipos de cuantizacion | Float32 (LavaSR); pesos almacenados en float16 y convertidos a float32 en el grafo, aritmetica float32 (VoiceFixer) |
| Idiomas soportados | No disponible (procesamiento de audio, independiente del idioma) |
| Licencia | LavaSR: Apache-2.0; VoiceFixer: CC BY 4.0 (licencia compuesta `lavasr-apache-2.0-and-voicefixer-cc-by-4.0`) |
| Formato de pesos | ONNX (`LavaSRv2.onnx`, `VoiceFixer.onnx`) |

## Arquitectura y entrenamiento

No se trata de entrenamiento nuevo: ambas redes se convierten desde sus checkpoints originales sin reentrenar. LavaSR v2 se exporta parcialmente, cubriendo el backbone Vocos y la cabeza espectral; la entrada es un espectrograma mel de forma [1, 80, 375] y la salida son dos tensores, `real` e `imaginary`, de forma [1, 1025, 375], en float32. VoiceFixer se exporta cubriendo la red de analisis y el vocoder neuronal, con entrada mel [1, 1, 256, 128] y salida de audio [1, 114660] muestras a 44,1 kHz.

Los cambios introducidos en la conversion son acotados: para VoiceFixer, exportacion ONNX con entrada fija de 256 frames y almacenamiento de pesos en media precision (float16) con conversion a float32 dentro del grafo, manteniendo la aritmetica en float32. Los scripts `convert-lavasr.py` y `convert-voicefixer.py` del port verifican el SHA-256 de cada checkpoint upstream antes de cargarlo y comparan ONNX Runtime con PyTorch sobre una entrada fija; el fichero `conversion.json` registra las diferencias medidas. No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens o etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Restauracion y mejora de voz: LavaSR v2 aporta detalle espectral en la senal de voz.
- Restauracion de estudio: VoiceFixer reconstruye audio degradado y genera la forma de onda final a 44,1 kHz.
- Procesamiento de audio por lotes de frames fijos: LavaSR con 375 frames mel y VoiceFixer con 256 frames.
- Ejecucion on-device en Android mediante ONNX Runtime, sin envio de audio a servidores.
- Verificacion de integridad de los ficheros descargados mediante SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, vision, audio de entrada a texto) en la informacion disponible.

## Casos de uso

- Restauracion de grabaciones de voz en movil: la app puede aplicar LavaSR v2 sobre el mel de una grabacion para recuperar detalle antes de reproducirla o exportarla, sin salir del dispositivo.
- Limpieza de audios historicos o degradados: VoiceFixer, con su vocoder a 44,1 kHz, sirve para reconstruir grabaciones con ruido, clipping o banda limitada en un flujo de postproduccion.
- Notas de voz y mensajes de mensajeria: integracion en la app YouRec para mejorar notas de voz capturadas con microfonos de movil antes de enviarlas.
- Transcripcion previa a ASR: mejorar la senal con LavaSR antes de pasarla a un motor de reconocimiento de voz local, reduciendo errores en entornos ruidosos.
- Podcasts y entrevistas grabadas con equipo basico: uso de VoiceFixer como etapa de restauracion en una cadena de edicion movil.
- Procesamiento por privacidad: escenarios donde el audio no puede salir del dispositivo (periodismo, salud, entornos corporativos) y se requiere restauracion local con verificacion de integridad de los binarios.
- Prototipado de pipelines de audio en Python: los ficheros ONNX pueden cargarse con ONNX Runtime en escritorio para validar la conversion antes de desplegar en Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion mencionado es la comparacion entre ONNX Runtime y PyTorch sobre una entrada fija, cuyas diferencias se registran en `conversion.json`, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de inferencia on-device en Android con ONNX Runtime, el consumo depende del backend (CPU, NNAPI, GPU) y del dispositivo.
- GPU recomendadas: no disponibles para escritorio; en movil, se delega en los aceleradores disponibles via ONNX Runtime.
- Cabe en GPU consumer: no hay datos publicados; el tamano del repositorio es de 0,3 GB, lo que sugiere que ambos grafos son ligeros, pero no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (Android y escritorio); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a modelos de audio de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| YouRec Android (LavaSR + VoiceFixer ONNX) | Restauracion de voz, dos etapas | Apache-2.0 + CC BY 4.0 | ONNX | Mel fijo (375 y 256 frames) | Hugging Face, 0 descargas |
| LavaSR v2 original (YatharthS/LavaSR) | Mejora de voz | Apache-2.0 | PyTorch (`pytorch_model.bin`) | Mel [1, 80, 375] | Hugging Face |
| VoiceFixer original (haoheliu) | Restauracion de audio | CC BY 4.0 (pesos) / MIT (codigo) | PyTorch (`vf.ckpt`) | Mel [1, 1, 256, 128] | GitHub y Zenodo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Son conversiones, no modelos nuevos: cualquier limitacion de los modelos originales se hereda sin cambios.
- La licencia es compuesta: LavaSR bajo Apache-2.0 y VoiceFixer bajo CC BY 4.0; el uso comercial de VoiceFixer exige atribucion a Haohe Liu et al. y cumplimiento de los terminos de CC BY 4.0.
- La exportacion de VoiceFixer usa entrada fija de 256 frames y pesos en float16 convertidos a float32 en el grafo; no se documenta el impacto de estas decisiones en la calidad final.
- La conversion de LavaSR cubre solo el backbone Vocos y la cabeza espectral; el resto del pipeline original queda fuera del grafo ONNX.
- No hay informacion sobre sesgos, riesgo de alucinacion (no aplica en el sentido de LLM, pero si posible artefacto o invencion de contenido espectral en la restauracion) ni idiomas soportados.
- El repositorio no registra descargas ni likes, y la fecha de creacion indicada (2026-11-21) es posterior a la fecha habitual de publicacion; conviene verificar la procedencia y el estado del repositorio antes de usarlo en produccion.
- No se documentan pruebas en dispositivos Android concretos ni metricas de latencia, consumo de bateria o memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gpatane/yourec-android-models
- Proyecto YouRec (antirez): https://github.com/antirez/YouRec
- LavaSR (codigo): https://github.com/ysharma3501/LavaSR
- LavaSR (pesos): https://huggingface.co/YatharthS/LavaSR
- VoiceFixer (codigo): https://github.com/haoheliu/voicefixer
- VoiceFixer (pesos, Zenodo): https://doi.org/10.5281/zenodo.5600188
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
