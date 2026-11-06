# klein-ml/Klein-TTS-X1.5-Flash

## Resumen

Klein-TTS-X1.5-Flash es un modelo de síntesis de voz (text-to-speech) desarrollado por klein-ml, una familia de generadores TTS multilingües de tamano reducido disenados para inferencia en CPU a velocidad superior al tiempo real. El modelo estrella de la familia, X1.5-Flash, cuenta con 1,70 millones de parametros en el generador y convierte fonemas IPA en audio mono a 24 kHz en ingles (americano y britanico), frances e italiano, con cinco voces disponibles. La familia completa incluye tres tamanos: Flash Lite (0,4M), Flash (1,7M) y Pro (13M), este ultimo tambien en version cuantizada ternaria (1,58 bits) mas FP4.

El modelo resuelve el problema del despliegue de TTS de calidad en entornos con recursos limitados: con solo 6,8 MB de pesos en float32 y un factor de tiempo real (RTF) de 0,013 en CPU, es adecuado para dispositivos de borde, navegadores y aplicaciones embebidas donde un TTS de gran tamano no es viable. Segun la model card, supera en calidad a modelos significativamente mas grandes como Kitten TTS Nano 0.8 (14M) y Phonon 31M en el TTS Index, manteniendo un WER del 2,36 % medido con Whisper small.

La relevancia actual reside en su combinacion de licencia Apache-2.0, soporte multilingue, arquitectura StyleTTS 2 / ISTFTNet compacta y pesos distribuidos en safetensors y ONNX, lo que facilita su integracion en pipelines de produccion y su ejecucion en hardware modesto sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador estilo StyleTTS 2 / ISTFTNet (encoder transformer compartido, predictor de duracion, cabezas de F0 y energia, decoder AdaIN con fuente armonica y cabeza iSTFT) |
| Parametros totales | 1.702.244 (1,70M) en el generador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, entrada en unidades de 1 a 3 frases) |
| Tipos de cuantizacion | Float32 (6,8 MB de pesos); la familia incluye una version Pro en ternario (1,58 bits) + FP4, pero no se especifica cuantizacion para Flash |
| Idiomas soportados | Ingles (americano y britanico), frances, italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch (custom_code) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de generacion TTS basada en StyleTTS 2 e ISTFTNet. Un encoder de texto con pesos compartidos (un bloque transformer aplicado cuatro veces, d=128, 4 cabezas, FFN de 288, RoPE, mas tres capas convolucionales) procesa la secuencia de fonemas IPA (vocabulario de 178 simbolos). Un predictor de duracion condicionado por estilo calcula la duracion como la suma de 50 compuertas sigmoideas dividida por el factor de velocidad. A continuacion, cabezas a nivel de frame predicen F0 y energia logaritmica condicionadas por la voz. El decoder emplea bloques residuales AdaIN de 96 canales, una fuente armonica y de ruido con 8 armonicos, sobremuestreo de 10x y 6x, y una cabeza iSTFT que genera la forma de onda final a 24 kHz (300 muestras, 12,5 ms por frame).

El entrenamiento se realizo por destilacion sobre voz sintetica en ingles, frances e italiano, generada a partir de las cinco voces de publicacion (voces individuales, sin mezclas) a velocidades de habla de 0,9, 1,0 y 1,1. El texto proviene de FineWeb (ingles) y FineWeb-2 (frances, italiano), en unidades de 1 a 3 frases. La funcion de perdida combina L1 sobre log-mel, STFT multirresolucion, LSGAN con feature matching (discriminadores multiperiodo y multirresolucion desde el paso 10.000), feature matching con WavLM, L1 de duracion, pitch y energia, y un termino de silencio. Se uso AdamW con LR 2e-4 y decaimiento coseno en bf16. Durante las primeras fases el decoder recibe pitch y energia reales, y entre los pasos 5.000 y 30.000 pasa a usar sus propias predicciones. El checkpoint publicado corresponde al paso final 150.000 de una ejecucion de 150.000 pasos.

## Capacidades

- Sintesis de voz a partir de texto en ingles (americano y britanico), frances e italiano, con salida mono a 24 kHz.
- Cinco voces predefinidas: Sarah, Caleb, Isabella, Camille y Giulia.
- Control de velocidad de habla mediante un valor que divide las duraciones predichas (entrenado en el rango 0,9 a 1,1).
- Entrada basada en fonemas IPA con front-end de texto integrado: misaki para ingles y espeak-ng para frances e italiano.
- Inferencia en CPU a velocidad superior al tiempo real (RTF de 0,013).
- Soporte de ejecucion via Transformers con `trust_remote_code=True` y via el paquete `kleintts`.
- Pesos disponibles en safetensors y ONNX, lo que permite despliegue en entornos sin PyTorch.
- No se mencionan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en dispositivos de borde: el modelo cabe en 6,8 MB en float32 y corre en CPU con RTF de 0,013, por lo que puede integrarse en routers, Raspberry Pi o moviles para leer notificaciones o contenido sin conexion.
- Accesibilidad web: sintesis de voz para lectores de pantalla o navegacion asistida en ingles, frances e italiano, con control de velocidad para adaptarse a preferencias del usuario.
- Asistentes de voz embebidos: generacion de respuestas habladas en asistentes locales o domoticos donde no hay GPU ni conectividad a la nube.
- Audiolibros y podcasts automatizados: conversion de texto a audio en lotes con las cinco voces disponibles, usando la velocidad ajustable para distintos estilos de locucion.
- Sistemas de anuncios y senaletica multilingue: generacion de avisos en aeropuertos, estaciones o comercios en ingles, frances e italiano con una huella de memoria minima.
- Prototipado rapido de interfaces conversacionales: gracias a la licencia Apache-2.0 y a la integracion con Transformers, se puede desplegar en entornos de desarrollo sin restricciones comerciales.
- Educacion de idiomas: reproduccion de frases en frances o italiano con velocidad reducida (0,9) para practicas de comprension auditiva.

## Benchmarks y rendimiento

Segun la model card, evaluado sobre 300 frases web no vistas:

| Metrica | Klein-TTS-X1.5-Flash | Referencia |
|---|---|---|
| UTMOS | 4,36 | Kitten TTS Nano 0.8 (14M): inferior en todas las metricas de calidad |
| SCOREQ | 4,42 | No disponible para comparativas |
| WER (Whisper small) | 2,36 % | No disponible para comparativas |
| RTF en CPU | 0,013 | No disponible para comparativas |

La model card indica que supera a Kitten TTS Nano 0.8 (14M, 8 veces mayor) en todas las metricas de calidad, esta muy por delante de SupraTTS 1.0 Preview (1,0M, tamano similar) y supera a Phonon 31M en el TTS Index con 1/18 de su tamano. No se proporcionan tablas numericas detalladas de estos competidores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con 6,8 MB de pesos en float32 la huella de memoria es minima y cabe en cualquier sistema.
- GPU recomendadas: no necesarias; el modelo esta disenado para CPU. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU de gama baja.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, paquete `kleintts`, ONNX Runtime (pesos ONNX incluidos). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tamano.
- Latencia y throughput: RTF de 0,013 en CPU, es decir, aproximadamente 77 veces mas rapido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Calidad (UTMOS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klein-TTS-X1.5-Flash | 1,7M | en, fr, it | 4,36 | Apache-2.0 | Hugging Face |
| Kitten TTS Nano 0.8 | 14M | no disponible | inferior segun model card | no disponible | no disponible |
| SupraTTS 1.0 Preview | 1,0M | no disponible | inferior segun model card | no disponible | no disponible |
| Phonon | 31M | no disponible | inferior en TTS Index segun model card | no disponible | no disponible |

Los datos de los competidores provienen unicamente de las afirmaciones de la model card; no se dispone de fichas tecnicas independientes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles, frances e italiano; no cubre castellano ni otras lenguas.
- Esta entrenado exclusivamente con voz sintetica por destilacion, lo que puede limitar la naturalidad y expresividad frente a modelos entrenados con voz humana real.
- El front-end compacto de Transformers coincide con el front-end completo en el 97 % de las frases de prueba; el 3 % restante difiere en la pronunciacion de una palabra (tipicamente homografos como "read" o "use"). Para la maxima fidelidad se recomienda el paquete `kleintts`.
- El control de velocidad esta entrenado en el rango 0,9 a 1,1; valores fuera de ese rango pueden degradar la calidad.
- Riesgo de alucinacion o artefactos acusticos en textos fuera de dominio o con fonemas no cubiertos por el vocabulario de 178 simbolos.
- No se han publicado analisis de sesgos por voz, genero o acento en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas, pero se recomienda revisar el archivo LICENSE del repositorio.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un modelo reciente con poca validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/klein-ml/Klein-TTS-X1.5-Flash
- Web de Klein ML: https://kleinml.com
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
