# ruisv/rcdl-matcha-tts

## Resumen

rcdl-matcha-tts es un paquete de síntesis de voz (text-to-speech) compilado para la NPU del SoC Rockchip RK3588 y RK3588S. No se distribuye como pesos en formato convencional, sino como dos grafos RKNN en fp16 listos para cargar con librknnrt, sin necesidad de exportar desde PyTorch ni de usar rknn-toolkit2 en tiempo de despliegue. El modelo subyacente es Matcha-TTS zh-en, un sistema de síntesis no autorregresivo basado en flow matching, en su empaquetado para sherpa-onnx (`matcha-icefall-zh-en`) y entrenado originalmente para chino e inglés.

El autor, ruisv, mantiene RCDL, una biblioteca en C++17 y Python para visión y voz en placas Rockchip, donde la NPU, la RGA y la VPU operan como un pipeline de copia cero. Este repositorio es la pieza de síntesis de voz de ese ecosistema: junto con el vocoder Vocos (`ruisv/rcdl-vocos`), convierte texto en audio PCM de 16 kHz íntegramente en la placa. Su relevancia es práctica: permite TTS local de baja latencia en hardware embebido sin GPU dedicada, con un factor de tiempo real medido de 0,27 para una frase de 3,3 s de audio.

El interés técnico está en las adaptaciones para hardware limitado: eliminación de la función seno del decodificador mediante una identidad algebraica y evaluación polinómica, enmascaramiento correcto del padding en un grafo de forma fija de 512 frames y traslado de la búsqueda de embeddings a la CPU por la precisión insuficiente de fp16 por encima de 2048.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (síntesis no autorregresiva con flow matching condicional); encoder de texto + predictor de duración y decodificador con tres pasos de flow matching compilados |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; límites del grafo: 128 tokens de texto y 512 frames de mel (8,2 s de audio) |
| Tipos de cuantización | fp16 (grafos RKNN compilados con rknn-toolkit2 2.3.2) |
| Idiomas soportados | chino (zh) e inglés (en); el front end descarta palabras en alfabeto latino |
| Licencia | Apache-2.0 (pesos y ficheros compilados); código Matcha-TTS bajo MIT; datos de entrenamiento no divulgados |
| Formato de pesos | `.rknn` (encoder 16,7 MB, decoder 42,5 MB), `.npy` (tabla de embeddings, 1,6 MB), `.txt` (tokens 21 KB, léxico 1,3 MB) |

## Arquitectura y entrenamiento

Matcha-TTS es un modelo de síntesis no autorregresivo que combina un encoder de texto con un predictor de duración y un decodificador generativo basado en flow matching condicional, en lugar de la difusión iterativa clásica o de un decoder autorregresivo. El despliegue en RK3588 divide el modelo en dos grafos: el primero agrupa encoder de texto y predictor de duración (hasta 128 tokens), y el segundo es el decodificador con los tres pasos de flow matching ya integrados en el grafo (hasta 512 frames). Entre ambos, en CPU, se calculan duraciones, regulación de longitud y el ruido inicial del decodificador. La tabla de embeddings se consulta en CPU porque los identificadores de token llegan a 2190 y fp16 no los representa de forma exacta por encima de 2048.

El front end reproduce el de sherpa-onnx para este modelo, verificado identificador a identificador sobre 100 frases: normaliza puntuación, expande dígitos, segmenta frases y hace búsqueda de coincidencia más larga en el léxico. La adaptación más destacable es la reescritura de la activación SnakeBeta del decodificador, que en Matcha es `sin²(αx)`: como la NPU del RK3588 no dispone de `Sin`, una compilación directa la ejecuta en CPU 18 veces por llamada, lo que supone la mitad de los 955 ms del decodificador. Esta versión pliega la entrada al intervalo [0, π/2] con `Abs` anidados, de forma exacta, y evalúa un polinomio en ese dominio, reduciendo el decodificador a 253 ms sin alterar el mel. Además, el grafo enmascara GroupNorm y atención más allá de los frames válidos, corrigiendo la fuga de padding de hasta unos 10 log-mel que presenta la exportación publicada con forma fija.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `csukuangfj/matcha-icefall-zh-en`, cuyo origen es el modelo de ModelScope `dengcunqin/matcha_tts_zh_en_20251010`.

## Capacidades

- Síntesis de voz a partir de texto en chino e inglés, con salida PCM mono a 16 kHz.
- Control implícito de duración mediante el predictor de duración y la regulación de longitud.
- Normalización de texto: puntuación, expansión de dígitos, segmentación de frases y consulta de léxico chino.
- Ejecución íntegra en la NPU del RK3588, con el vocoder Vocos en el mismo pipeline de copia cero.
- Frases de hasta 128 tokens de texto y hasta 8,2 s de audio por invocación del decodificador.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo exclusivamente de TTS.
- No soporta visión ni audio de entrada; la entrada es únicamente texto.
- No soporta palabras en alfabeto latino en la entrada: el front end las descarta, por lo que los términos ingleses deben escribirse en caracteres chinos si deben pronunciarse.

## Casos de uso

- Asistentes de voz en dispositivos empotrados: el modelo permite generar respuestas habladas localmente en placas RK3588 sin conexión a la nube, con un factor de tiempo real de 0,27 que deja margen para el reconocimiento de voz y la lógica de diálogo en el mismo SoC.
- Lectura de notificaciones y avisos en kioscos o paneles industriales: frases cortas en chino o inglés se sintetizan en menos de un segundo, suficiente para interfaces de atención en tiempo real.
- Señalización accesible en transporte público o edificios: anuncios de parada o avisos de emergencia generados dinámicamente a partir de texto, con el pipeline completo en la placa y sin dependencia de servicios externos.
- Sistemas de navegación guiada por voz en robótica móvil: instrucciones generadas a partir de la planificación del robot, con latencia de decodificador de 253 ms que permite encadenar turnos de interacción.
- Pruebas de regresión de pipelines de voz: al transcribir su propia salida con `rcdl-paraformer` de vuelta a su texto, el modelo sirve como componente verificable en pruebas automáticas de calidad de síntesis en entornos CI sobre hardware real.
- Aplicaciones de lectura para personas con discapacidad visual en dispositivos de bajo consumo: conversión de texto a voz en local, sin enviar contenido a servidores externos, lo que reduce exposición de datos.
- Prototipado de interfaces conversacionales en chino e inglés: el paquete incluye front end, léxico y embeddings, de modo que un equipo puede montar un demostrador de TTS completo en una placa RK3588S sin entrenar ni exportar modelos.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Frase de una oración → 3,3 s de audio, con Vocos | 0,90 s (factor de tiempo real 0,27) |
| Decodificador de 512 frames, una llamada | 0,23 s de NPU |
| Error absoluto medio del mel por token frente al modelo float | 0,05–0,10 log-mel |
| Desviación de duración frente al modelo float | ninguna duración desviada un frame |
| Verificación de inteligibilidad | la salida se transcribe de vuelta a su propio texto con `rcdl-paraformer` |

Medido en RK3588S con librknnrt 2.3.2 y driver de NPU 0.9.8, a través de `TextToSpeech` de RCDL. No se han publicado resultados de benchmarks estándar (MOS, MCD, WER sobre corpus externos) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 o RK3588S con NPU; no se distribuyen pesos para GPU convencional ni CPU de escritorio.
- Memoria: los grafos suman 59,2 MB en fp16 (16,7 MB encoder + 42,5 MB decoder) más 1,6 MB de embeddings y 1,3 MB de léxico; el consumo de VRAM no aplica, se ejecuta sobre la NPU y la memoria compartida del SoC.
- GPU dedicadas: no aplica; el modelo no está compilado para CUDA ni ROCm.
- GPU de consumo: no aplica; no cabe esperar ejecución en RTX 4090 u otras GPU de consumo con estos ficheros.
- Despliegue: RCDL (C++17/Python) sobre linux-aarch64, instalable vía conda desde el canal `mirrors.ruis.ai`; requiere librknnrt 2.3.2 y driver de NPU 0.9.8. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato RKNN.
- Latencia y throughput: 0,90 s para 3,3 s de audio con Vocos (RTF 0,27); decodificador de 512 frames en 0,23 s de NPU; el decodificador sin la reescritura de `sin²` tardaría 955 ms frente a los 253 ms de esta versión.

## Comparativa con modelos similares

| Modelo | Formato y destino | Idiomas | Licencia | Contexto o límites | Notas |
|---|---|---|---|---|---|
| rcdl-matcha-tts | RKNN fp16 para NPU RK3588 | zh, en | Apache-2.0 (datos no divulgados) | 128 tokens, 512 frames (8,2 s) | Optimizado para hardware Rockchip, sin GPU |
| matcha-icefall-zh-en (base) | ONNX para sherpa-onnx | zh, en | Apache-2.0 según empaquetado | no disponible | Ejecutable en CPU; no usa la NPU del RK3588 |
| Matcha-TTS original | PyTorch | en (principalmente) | MIT (código) | no disponible | Referencia académica; requiere exportación y no está adaptado a hardware embebido |
| rcdl-vocos | RKNN fp16 para NPU RK3588 | no aplica (vocoder) | Apache-2.0 | no disponible | Componente complementario necesario para obtener audio a 16 kHz |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento no se divulgan. El autor advierte que su modelo zh-en anterior usaba un recetario basado en el corpus Baker (BZNSYP, no comercial) y no aclara si este modelo lo incluye; conviene verificarlo antes de un despliegue comercial pese a la licencia Apache-2.0 declarada.
- El front end descarta las palabras en alfabeto latino, igual que el de sherpa-onnx para este modelo; los términos ingleses deben escribirse en caracteres chinos para que se pronuncien.
- Límite de 128 tokens de texto y 512 frames de audio (8,2 s) por invocación; textos más largos requieren segmentación externa.
- Solo admite chino e inglés; no hay soporte de otros idiomas ni de mezcla con alfabetos distintos del chino.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de artefactos de pronunciación en texto fuera de dominio, siglas o nombres propios ausentes del léxico.
- La calidad depende de la corrección del enmascaramiento de padding y de la reescritura de `sin²`; las versiones compiladas sin estas correcciones presentan fugas de padding de hasta unos 10 log-mel y un decodificador mucho más lento.
- El modelo está atado al hardware RK3588/RK3588S y a versiones concretas de librknnrt y del driver de NPU; no es portable a otras plataformas sin recompilación.
- No se han publicado evaluaciones subjetivas (MOS) ni medidas objetivas de calidad sobre corpus externos, por lo que la valoración de naturalidad queda pendiente de prueba en el dispositivo.
- La licencia Apache-2.0 cubre los pesos y ficheros compilados; RCDL se distribuye aparte bajo Apache-2.0 y no impone condiciones adicionales sobre estos artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/rcdl-matcha-tts
- Vocoder complementario: https://huggingface.co/ruisv/rcdl-vocos
- Modelo de reconocimiento usado en la verificación: https://huggingface.co/ruisv/rcdl-paraformer
- Modelo base: https://huggingface.co/csukuangfj/matcha-icefall-zh-en
- Modelo original en ModelScope: https://modelscope.cn/models/dengcunqin/matcha_tts_zh_en_20251010
- Repositorio de RCDL: https://github.com/ruisv/rcdl
- Recetas de compilación de modelos de voz: https://github.com/ruisv/rcdl/tree/main/model_zoo/speech
- Arquitectura Matcha-TTS: https://github.com/shivammehta25/Matcha-TTS
