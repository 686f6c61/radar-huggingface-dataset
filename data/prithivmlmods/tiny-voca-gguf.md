# prithivMLmods/tiny-voca-GGUF

## Resumen

tiny-voca es un modelo de síntesis de voz (text-to-speech) en inglés, ultraligero y de código abierto, desarrollado originalmente por Muhammed Nazeem (`n4ze3m`). Esta ficha corresponde a la versión cuantizada en GGUF publicada por `prithivMLmods`, que convierte los pesos originales (PyTorch y ONNX) a formatos compatibles con llama.cpp para su despliegue en entornos con recursos muy limitados. El modelo convierte texto a fonemas mediante el fonemizador propio `dizione` y genera audio mono a 24 kHz.

La relevancia de tiny-voca radica en su escala extrema: el modelo base declara 4,54 millones de parámetros (el repositorio safetensors reporta 1.603.456), lo que permite ejecutarlo en CPU con un consumo de memoria inferior a 10 MB en las cuantizaciones más agresivas. Según la model card, se entrenó desde cero en menos de 8 horas sobre una única RTX 4090, con un coste total de 9,56 dólares, usando 17,6 horas de voz sintética generada por Qwen3-TTS.

El modelo ofrece dos voces fijas de inglés americano (F2 femenina y M2 masculina) con control de velocidad, desplazamiento de tono y rango de tono. No soporta clonación de voz, streaming ni variación prosódica, lo que lo posiciona como una solución para síntesis embebida y del lado del cliente más que como un sistema TTS de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con sintetizador source-filter (sin vocoder neuronal) |
| Parametros totales | 1.603.456 (según safetensors); la model card declara 4,54 M para el modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | Inglés (en), variante americana |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base también en PyTorch y ONNX |

## Arquitectura y entrenamiento

tiny-voca emplea una arquitectura de encoder transformer combinada con un sintetizador source-filter rápido en lugar de un vocoder neuronal pesado. El texto se convierte primero a fonemas mediante el fonemizador `dizione`, y el sintetizador genera la forma de onda directamente a 24 kHz en mono. Esta elección de diseño es la que permite el reducido tamaño y la velocidad de inferencia declarada de aproximadamente 70 veces el tiempo real sobre cuatro hilos de CPU.

El entrenamiento se realizó desde cero en menos de 8 horas sobre una única RTX 4090, con un coste de 9,56 dólares, utilizando 17,6 horas de voz sintética generada por Qwen3-TTS y el dataset `n4ze3m/tiny-voca`. La model card no detalla si se aplicaron técnicas de RLHF, DPO ni otras fases de alineación. La versión de esta ficha es una cuantización GGUF del modelo base realizada con llama.cpp, que incluye además un fichero `mmproj-bf16` de proyección multimodal para las capacidades de audio.

## Capacidades

- Síntesis de voz en inglés americano a 24 kHz en mono.
- Dos voces fijas: F2 (femenina) y M2 (masculina).
- Control ajustable de velocidad, desplazamiento de tono (pitch shift) y rango de tono.
- Conversión de texto a fonemas mediante el fonemizador `dizione`.
- Inferencia en CPU con alto rendimiento (aproximadamente 70x tiempo real en 4 hilos).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta clonación de voz.
- No soporta streaming de audio.
- No soporta variación prosódica.
- Capacidades multilingües: únicamente inglés.

## Casos de uso

- Síntesis de voz en el navegador: al ejecutarse en CPU con un consumo de memoria mínimo (1,07-1,8 MB en cuantizaciones Q3-Q8), el modelo puede desplegarse del lado del cliente mediante WebAssembly para leer contenido web o notificaciones sin enviar texto a un servidor.
- Aplicaciones móviles de accesibilidad: integración en lectores de pantalla o asistentes de voz para personas con discapacidad visual, aprovechando que el modelo cabe en memoria en dispositivos de gama baja y no requiere GPU.
- Sistemas embebidos y IoT: generación de avisos hablados en dispositivos con recursos restringidos (Raspberry Pi, microcontroladores con suficiente RAM), donde un TTS convencional no cabría.
- Prototipado rápido de interfaces de voz: uso en entornos de desarrollo para validar flujos de conversación con audio sintético antes de invertir en un TTS de mayor calidad.
- Audiolibros y contenido pregrabado de bajo coste: generación por lotes de narraciones en inglés americano con una de las dos voces fijas, ajustando la velocidad para adaptarse al contenido.
- Pruebas automatizadas de pipelines de audio: generación de locuciones sintéticas deterministas para tests de integración de sistemas de reconocimiento de voz o de procesamiento de audio.
- Demos educativas de TTS: ejemplo didáctico de arquitectura source-filter y de cuantización GGUF para cursos de procesamiento de voz, dado su reducido tamaño y su licencia permisiva.

## Benchmarks y rendimiento

La model card indica que el modelo base alcanzó el puesto 8 y el 13 en la Open TTS Leaderboard de noviembre de 2026, con un Word Error Rate medio inferior al 0,8 %. No se proporcionan resultados numéricos detallados por benchmark en la información disponible.

| Metrica | Valor |
|---|---|
| Open TTS Leaderboard (noviembre 2026) | Puesto 8 y puesto 13 (dos entradas) |
| Word Error Rate medio | < 0,8 % |
| Velocidad de inferencia | ~70x tiempo real en 4 hilos de CPU |
| Frecuencia de muestreo de salida | 24 kHz mono |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo cabe íntegramente en memoria RAM del sistema.
- Tamaño en disco según cuantización: Q3_K_M 1,07 MB, Q4_K_M 1,29 MB, Q5_K_M 1,37 MB, Q6_K 1,76 MB, Q8_0 1,8 MB, BF16 3,28 MB, F32 6,42 MB, mmproj-bf16 8,14 MB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el modelo base también en PyTorch y ONNX.
- Latencia y throughput: aproximadamente 70 veces el tiempo real en 4 hilos de CPU, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tiny-voca (esta ficha) | 1,6 M (safetensors) / 4,54 M (model card) | No disponible | Inglés | Apache-2.0 | GGUF, PyTorch, ONNX | Voces fijas F2/M2, sin clonación ni streaming |
| Piper TTS | No disponible | No disponible | Múltiples | MIT (según proyecto) | ONNX | TTS ligero para CPU, ecosistema maduro |
| Coqui TTS (modelos pequeños) | Variable | No disponible | Múltiples | MPL-2.0 / según modelo | PyTorch | Framework completo, mayor huella |
| Kokoro TTS | ~82 M | No disponible | Inglés y otros | Apache-2.0 | PyTorch, ONNX | Mayor calidad, mayor tamaño |

Los datos de los modelos comparados no provienen de la información proporcionada y deben verificarse en sus respectivas fichas; se incluyen únicamente como referencia de categoría.

## Limitaciones y advertencias

- Solo soporta inglés americano; no hay soporte multilingüe.
- Únicamente dos voces fijas (F2 y M2); no permite clonación ni selección de hablante.
- No soporta streaming, lo que limita su uso en conversaciones en tiempo real.
- Ausencia de variación prosódica: la entonación es plana y poco natural en textos largos.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o nombres propios, al depender del fonemizador `dizione`.
- El WER inferior al 0,8 % se refiere a inteligibilidad, no a naturalidad percibida; la calidad subjetiva puede ser inferior a la de modelos más grandes.
- No se detallan sesgos de los datos de entrenamiento (voz sintética generada por Qwen3-TTS), lo que puede introducir artefactos o características del generador original.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `n4ze3m/tiny-voca` y del dataset `n4ze3m/tiny-voca`.
- El repositorio reporta 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- El fichero `mmproj-bf16` (8,14 MB) es mayor que los pesos cuantizados; su necesidad real para el pipeline TTS no está documentada en la model card.

## Enlaces

- Hugging Face (esta versión GGUF): https://huggingface.co/prithivMLmods/tiny-voca-GGUF
- Modelo base: https://huggingface.co/n4ze3m/tiny-voca
- Dataset de entrenamiento: https://huggingface.co/datasets/n4ze3m/tiny-voca
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
