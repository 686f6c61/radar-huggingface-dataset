# gachimoto/tiny-voca-ja

## Resumen

tiny-voca-ja es un modelo de síntesis de voz (text-to-speech) para japonés desarrollado por el usuario gachimoto. Se trata de un reentrenamiento desde cero de la arquitectura y la receta del modelo inglés tiny-voca de Muhammed Nazeem (n4ze3m), aplicado sobre datos en japonés. No es un ajuste fino de los pesos ingleses: ningún peso preentrenado forma parte del modelo final. El conjunto completo, incluido el generador de forma de onda, suma 4.538.827 parámetros, lo que lo sitúa en la categoría de modelos extremadamente ligeros.

El modelo ofrece dos voces, F2 (femenina) y M2 (masculina), y produce audio mono a 24 kHz. La entrada es texto japonés que se convierte a fonemas mediante eSpeak NG con la voz `ja`, resolviendo las lecturas de kanji con pykakasi. Se entrenó sobre aproximadamente 16,6 horas de voz sintética generada con Qwen3-TTS (16.321 clips), sin grabaciones de hablantes reales. Su relevancia radica en que demuestra que un TTS inteligible en japonés puede ejecutarse más rápido que el tiempo real en CPU, sin GPU, con un peso de apenas 18,2 MB en PyTorch y 21,4 MB en ONNX.

La validación publicada es muy limitada: cuatro frases con un CER medio del 7,3 %, y el propio autor advierte que la lectura de números y fechas es un punto débil conocido. Es, por tanto, un modelo experimental y de nicho, adecuado para prototipos y entornos con recursos muy restringidos, no para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (4 bloques) + predictor de duración + dos transformers a nivel de frame (2 y 5 bloques) + sintetizador source-filter (sin vocoder neuronal) |
| Parametros totales | 4.538.827 (el generador de forma de onda aporta 25.862) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 512 tokens y 32 segundos de audio por llamada |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | japonés (ja) exclusivamente |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (float32, checkpoint de inferencia, formato 4) y ONNX (float32, opset 17) |

## Arquitectura y entrenamiento

El modelo sigue la receta de tiny-voca: el texto se convierte en fonemas con un valor de estrés asociado. Un encoder transformer de 4 bloques procesa los fonemas; un predictor de duración asigna a cada fonema una longitud en frames; y dos transformers a nivel de frame (de 2 y 5 bloques) predicen tono, sonoridad y energía, y después los parámetros del generador de forma de onda. Todos los bloques usan 192 canales, 4 cabezas de atención y embeddings posicionales rotatorios (RoPE).

La forma de onda no se genera con un vocoder neuronal, sino con un sintetizador source-filter: un tren de pulsos de banda limitada a la frecuencia fundamental predicha y una señal de ruido se conforman cada uno mediante un filtro variable en el tiempo, cuyo cepstrum predice la red una vez por frame (256 muestras, 10,7 ms). El inventario de fonemas creció de 76 a 84 símbolos (8 adiciones japonesas) respecto al modelo inglés, lo que explica las 1.536 unidades de diferencia en el recuento de parámetros. El entrenamiento se realizó desde cero sobre 16.321 clips sintéticos (16,6 horas) generados con Qwen3-TTS; no se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en japonés a partir de texto, con salida mono a 24 kHz.
- Dos voces seleccionables: F2 (femenina) y M2 (masculina).
- Control de velocidad de habla (`--speed`), desplazamiento de tono (`--pitch-shift`, donde 0,058 equivale aproximadamente a un semitono) y rango de tono (`--pitch-range`).
- Procesamiento de texto de longitud arbitraria: la herramienta lee el texto frase a frase y une el audio resultante.
- Entrada por fichero de texto (`--text-file`) además de entrada directa por línea de comandos.
- Exportación ONNX con inferencia verificada frente al modelo PyTorch (diferencias de forma de onda de como máximo el 0,16 % de la amplitud de pico).
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de textos largos en japonés en entornos sin GPU: el modelo procesa el texto frase a frase y concatena el audio, por lo que puede narrar documentos completos en una CPU modesta a velocidad superior al tiempo real.
- Prototipado rápido de interfaces de voz en japonés: con 18,2 MB de pesos y una instalación vía `pip`, permite integrar TTS en un proyecto en minutos sin infraestructura de aceleración.
- Sistemas embebidos y de borde: el tamaño reducido y la ejecución en CPU lo hacen viable en dispositivos con recursos limitados donde un TTS neuronal convencional no cabría.
- Generación de avisos y mensajes cortos predecibles: frases de bienvenida, confirmaciones o instrucciones simples, donde el CER observado en las muestras fue del 0,0 %.
- Integración en pipelines ONNX: el grafo exportado acepta ids de fonemas y valores de estrés, lo que permite incrustarlo en runtimes ONNX existentes junto con un front-end japonés propio.
- Investigación y docencia sobre TTS ligero: sirve como referencia reproducible de una arquitectura source-filter de 4,5 M de parámetros con código y log de entrenamiento completos.
- Evaluación comparativa de front-ends fonéticos: al registrar el front-end con el que fue entrenado y rechazar desajustes (salvo con `--allow-frontend-mismatch`), facilita experimentos controlados sobre conversión texto-fonema.

## Benchmarks y rendimiento

| Prueba | Voz | Texto | CER |
|---|---|---|---:|
| Muestra 1 | F2 | こんにちは、これは日本語の音声合成のテストです。 | 0,0 % |
| Muestra 2 | F2 | はじめまして。私は日本語で話す、小さな音声合成モデルです。 | 0,0 % |
| Muestra 3 | M2 | 今日は十一月十九日、木曜日です。東京の天気は、晴れのち曇りでしょう。 | 29,2 % |
| Muestra 4 | F2 | 人工知能が、日本語の文章を読み上げます。声の大きさも、速さも、自由に変えられます。 | 0,0 % |

CER medio del 7,3 % sobre cuatro frases, calculado con una transcripción de Whisper small (multilingüe) en un espacio normalizado a kana. El propio autor advierte que se trata de cuatro frases y no de un benchmark. La muestra 3 se conserva deliberadamente como caso de fallo conocido en fechas y números.

En cuanto a latencia, medida en una VM pequeña compartida solo con CPU: 2,8–6,3 segundos por frase, incluida la carga del modelo, para 4,4–8,1 segundos de audio; es decir, más rápido que el tiempo real, aunque el autor señala que esa máquina no es representativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU y no requiere GPU.
- GPU recomendadas: no disponible; no se documenta uso de GPU ni requisitos de VRAM.
- Cabe en cualquier GPU consumer, pero no es necesario: los pesos ocupan 18,2 MB (PyTorch) y 21,4 MB (ONNX) en float32.
- Opciones de despliegue: PyTorch mediante el paquete `tiny-voca-ja` (comando `tiny-voca-speak` o `python -m tiny_voca.infer`) y ONNX Runtime con el grafo `onnx/model.onnx` (opset 17). Requiere el paquete de sistema `espeak-ng`.
- Latencia y throughput: 2,8–6,3 segundos por frase (incluida la carga) para 4,4–8,1 segundos de audio en una VM solo-CPU compartida; no se publican cifras de throughput en hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tiny-voca-ja | 4.538.827 | 512 tokens / 32 s por llamada | ja | Apache-2.0 | `.pt`, ONNX |
| tiny-voca (n4ze3m) | 4.537.291 | no disponible | en | no disponible | no disponible |
| Alternativas TTS neuronales de tamaño medio | no disponible | no disponible | varios | no disponible | no disponible |

La única comparación directa documentada es con tiny-voca, del que deriva: comparten arquitectura y receta, y difieren en el inventario de fonemas (84 frente a 76) y en los datos de entrenamiento (japonés sintético frente a inglés). No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- Validación insuficiente: solo cuatro frases evaluadas; el CER del 7,3 % no constituye un benchmark representativo.
- Debilidad conocida en la lectura de números y fechas, con un CER del 29,2 % en la muestra correspondiente.
- Entrenado exclusivamente con voz sintética generada por Qwen3-TTS; no contiene grabaciones de hablantes reales, lo que puede limitar la naturalidad y la variedad prosódica.
- Solo procesa texto japonés: el front-end usa eSpeak NG con la voz `ja` y el checkpoint rechaza front-ends distintos salvo que se fuerce con `--allow-frontend-mismatch`.
- Dependencia de la resolución de kanji mediante pykakasi, que puede introducir lecturas incorrectas en nombres propios o términos especializados.
- La salida de audio puede superar 1,0 de pico, por lo que debe escalarse antes de guardar en 16 bits.
- El ruido del generador se sortea en cada ejecución, de modo que la forma de onda no es determinista entre runtimes.
- Sin datos publicados sobre sesgos; al no usar voces reales, el riesgo de imitación de hablantes identificables es bajo, pero la diversidad de voces queda limitada a dos.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías de calidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gachimoto/tiny-voca-ja
- Dataset: https://huggingface.co/datasets/gachimoto/tiny-voca-ja
- Código (receta japonesa): https://github.com/gachimoto-code/tiny-voca-ja
- Proyecto original tiny-voca: https://github.com/n4ze3m/tiny-voca
- Modelo base en Hugging Face: https://huggingface.co/n4ze3m/tiny-voca
- Muestra de audio: https://huggingface.co/gachimoto/tiny-voca-ja/resolve/main/samples/s01_test.wav
