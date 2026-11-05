# litert-community/EMA-Lightning-LiteRT

## Resumen

EMA Lightning LiteRT es una conversión a LiteRT (TFLite) del modelo de síntesis de voz en turco EMA Lightning, desarrollado originalmente por el usuario canberkkkkkk y empaquetado por la comunidad litert-community para su ejecución íntegra en dispositivo. Se trata de un modelo TTS muy compacto: 8,6 millones de parámetros en total, compuesto por un DiT de flow-matching de 5,6 millones destilado a cuatro pasos y un decodificador HiFi-GAN de 3,0 millones. Genera audio a 48 kHz con una única voz y únicamente en turco.

La relevancia del modelo reside en su despliegue: los pesos se distribuyen como cuatro grafos LiteRT de formas estáticas que suman 27,3 MB y se ejecutan mediante `CompiledModel` de LiteRT 2.2.0 sin necesidad de PyTorch. En un Galaxy S26 una frase de 3,5 segundos se sintetiza en 52,5 ms, repartiendo el trabajo entre CPU (grafos acústicos), NPU HTP (los cuatro pasos del DiT) y GPU en fp16 (decodificador). Esto lo sitúa en el nicho de TTS neuronal de altísima eficiencia para aplicaciones móviles y sistemas embebidos.

El proyecto incluye además un host de referencia en NumPy (`ema_host.py`, unas 250 líneas), una tabla de modulación de pasos y una muestra Android en Kotlin. La normalización de números, fechas y abreviaturas no está incluida en los grafos y debe hacerse aparte con la librería Rust `normalizer-tr`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de flow-matching (5,6 M) destilado a 4 pasos + decodificador HiFi-GAN (3,0 M); grafos LiteRT estáticos |
| Parametros totales | 8,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por piezas de hasta ~10 s; buckets de L 32/64/128/256 y T 48/96/192/384/512) |
| Tipos de cuantizacion | fp32 (texto, aligner, pasos DiT) y fp16 (decodificador); no se distribuyen variantes int8 |
| Idiomas soportados | turco (tr) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT/TFLite (`.tflite`) + `ema_step_table.npz` + `config.json` |

## Arquitectura y entrenamiento

El modelo original combina un transformer de difusión (DiT) con flow-matching, destilado mediante DMD2 a solo cuatro pasos de inferencia (t = 0, ¼, ½, ¾), y un decodificador HiFi-GAN que genera audio a 48 kHz. La conversión a LiteRT separa el pipeline en cuatro grafos: un codificador de texto que transforma letras en características y duraciones por letra, un alineador gaussiano con ventana que produce un vector de condición por frame, el paso del DiT que calcula la velocidad y el decodificador HiFi-GAN. Cada grafo contiene todas las variantes de longitud como firmas separadas, compartiendo una única copia de los pesos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la destilación a cuatro pasos junto con la conversión a grafos estáticos verificados contra el paquete PyTorch en seis frases fijas, además de un host de inferencia sin dependencia de PyTorch y una política de precisión selectiva (fp32 donde la paridad lo exige, fp16 en el decodificador).

## Capacidades

- Síntesis de voz (text-to-speech) en turco con una única voz y salida a 48 kHz.
- Entrada en forma hablada y en minúsculas sobre un alfabeto de 49 símbolos (`a–z ç ö ü ğ ı ş`, espacio y signos de puntuación).
- Segmentación automática de textos largos en piezas de hasta ~10 s por límites de frase, cláusula y palabra.
- Decodificación por ventanas (25 frames iniciales y luego 100 frames con 8 frames de contexto) con unión exacta de muestras.
- Reproducibilidad determinista mediante semilla: con semilla 0 en CPU se reproduce la salida del paquete PyTorch.
- Ejecución sin PyTorch en macOS, Linux y Windows mediante `ema_host.py`, y en Android/iOS con los grafos nativos.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso.

## Casos de uso

- Lectura por voz en aplicaciones móviles: integración de los cuatro grafos en una app Android o iOS para leer notificaciones, mensajes o artículos en turco con latencia de decenas de milisegundos y sin conexión.
- Asistentes de voz sin conexión: el modelo cabe holgadamente en memoria (27,3 MB) y permite respuestas habladas en dispositivos con recursos limitados, manteniendo la privacidad al no enviar texto a servidores.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en turco dentro de lectores de pantalla o aplicaciones de lectura, con audio a 48 kHz de calidad superior a la de los motores TTS clásicos.
- Sistemas de navegación y automoción: anuncios de indicaciones en turco generados en el propio vehículo, con tiempos de síntesis inferiores a 60 ms por frase.
- Dispositivos IoT y wearables: síntesis local en hardware con NPU o GPU integrada, aprovechando el reparto CPU/HTP/GPU y el reducido tamaño de los pesos.
- Pruebas y prototipado de pipelines TTS: uso de `ema_host.py` como referencia en Python para validar conversiones, comparar precisiones o generar corpus de audio de forma determinista con semillas.
- Investigación en TTS eficiente: base para experimentos de destilación, cuantización o despliegue en LiteRT comparando tiempos por grafo y precisión.

## Benchmarks y rendimiento

Rendimiento medido en un Galaxy S26 (Snapdragon, 12 GB), Android 16, LiteRT 2.2.0 `CompiledModel`, el 2026-10-11. Cada medida es la mediana de 20 llamadas tras 3 calentamientos, con el teléfono en estado térmico 0.

| Grafo (bucket) | CPU, 4 hilos | GPU fp32 | GPU fp16 | HTP (NPU, JIT) |
|---|---|---|---|---|
| text (L 64) | 0,7 ms | 1,4 ms | incorrecto (falla paridad) | 0,70 ms (49 dB) |
| align (L 64 / T 96) | 0,2 ms | 0,7 ms | 0,6 ms | 0,49 ms (43 dB) |
| step (T 96), uno de cuatro | 2,5 ms | 3,2 ms | 2,4 ms (31 dB, en el umbral) | 1,56 ms (41 dB) |
| decoder (P 48 = 1,9 s de audio) | no disponible en el extracto | no disponible | no disponible | no disponible |

Datos globales: una frase de 3,5 s tarda 52,5 ms en el Galaxy S26 (grafos acústicos en CPU, cuatro pasos del DiT en HTP, decodificador en GPU a fp16). En la muestra Android, una frase de 2,4 s tarda 49 ms con primer audio a 33 ms. No se han publicado resultados de benchmarks de calidad (MOS, MCD, WER) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| EMA Lightning LiteRT | 8,6 M | piezas de ~10 s | turco | Apache-2.0 | LiteRT on-device |
| Piper (rhasspy) | ~5-20 M según voz | frases | multilingüe | MIT / varias | ONNX, CPU |
| Coqui TTS (modelos pequeños) | variable | frases | multilingüe | MPL-2.0 / varias | PyTorch, ONNX |
| Kokoro | ~82 M | frases | multilingüe | Apache-2.0 | ONNX, CPU/GPU |

La comparación cuantitativa de calidad y latencia entre estos modelos no está disponible en la información proporcionada; los datos de Piper, Coqui y Kokoro son orientativos de sus respectivas fichas públicas y deben verificarse en sus repositorios.

## Limitaciones y advertencias

- Solo turco y una única voz: no admite otros idiomas ni selección de hablante.
- La normalización de números, fechas, importes y abreviaturas no está incluida en los grafos; sin `normalizer-tr` u otro preprocesado, el texto debe escribirse ya en palabras.
- El alfabeto es limitado (49 símbolos); cualquier carácter fuera de él se sustituye por un espacio.
- El grafo de texto en GPU fp16 produce resultados incorrectos según la paridad declarada; debe ejecutarse en CPU o NPU.
- Los pesos del DiT en fp16 fallaron el umbral de paridad en una de seis frases, por lo que se distribuyen en fp32.
- Riesgo de alucinación acústica o pronunciación errónea en palabras fuera del dominio de entrenamiento; no se documentan sesgos específicos.
- No se han publicado métricas de calidad perceptual (MOS) ni evaluaciones formales de robustez.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento no están documentados en la información disponible.
- El rendimiento medido corresponde a un dispositivo concreto (Galaxy S26); en hardware inferior la latencia puede aumentar y el reparto CPU/HTP/GPU no estará disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/EMA-Lightning-LiteRT
- Modelo base: https://huggingface.co/canberkkkkkk/ema-lightning
- Muestra Android (Kotlin): https://github.com/john-rocky/LiteRT-Models/tree/main/ema-lightning
- Normalizador turco: https://github.com/erdemtuna/normalizer-tr
