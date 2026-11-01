# gnumanth/sntts

## Resumen

`sntts` es un modelo de síntesis de voz neuronal (text-to-speech) desarrollado por el usuario gnumanth, orientado a seis idiomas índicos: sánscrito clásico, hindi, kannada, tamil, telugu y malayalam. Se trata de un modelo compacto de 35,4 millones de parámetros que emplea una arquitectura VITS con un vocoder HiFi-GAN a 16 kHz, empaquetado como un único checkpoint ONNX de 54,3 MB que puede ejecutarse íntegramente en el navegador mediante `onnxruntime-web` con WASM SIMD.

El modelo aborda un nicho poco cubierto por los sistemas TTS comerciales: la síntesis de voz de calidad para lenguas índicas y, en particular, para el sánscrito clásico, un idioma con escasa representación en corpus de voz modernos. Su principal atractivo técnico es la portabilidad: al distribuirse como un único fichero ONNX sin ficheros de datos auxiliares, permite inferencia 100% en cliente (Python, Node.js y navegador) sin depender de infraestructura de servidor.

Con 16 descargas y 0 likes en el momento de la consulta, se trata de un modelo de autor individual, no de un laboratorio consolidado, lo que condiciona su madurez y soporte. La licencia MIT facilita su integración en productos, aunque la validación empírica disponible es limitada y procede únicamente de la model card del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) con vocoder HiFi-GAN a 16 kHz |
| Parámetros totales | 35.398.657 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | FP32 (checkpoint PyTorch) y FP16 (ONNX para navegador) |
| Idiomas soportados | sa (sánscrito), hi (hindi), kn (kannada), ta (tamil), te (telugu), ml (malayalam) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32), ONNX (`model_quantized.onnx`, FP16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un esquema end-to-end que combina un codificador de texto, un prior variacional, un decodificador y un vocoder HiFi-GAN integrado que opera a 16 kHz. El resultado es un único checkpoint que genera forma de onda directamente a partir del texto, sin necesidad de un vocoder externo. El soporte de 9 escrituras brahmicas más ISO-15919/IAST indica un frontend de normalización y fonemización multiescritura, aunque la model card no detalla los componentes internos del tokenizador.

El entrenamiento se realizó en una GPU NVIDIA L4 de Google Cloud durante 24 épocas y 3024 pasos, sobre 1008 enunciados de estudio a 16 kHz extraídos de siete conjuntos de datos de voz de Hugging Face: `prathoshap/sushrota-sanskrit-asr-data`, `yashnbx/gita_supersite_sanskrit_tts`, los corpus SYSPIN de hindi, kannada, tamil y telugu, y el corpus IITM de malayalam. Se trata de un volumen de datos reducido (alrededor de mil utterances), lo que limita la cobertura fonética y de hablantes. No se menciona el uso de RLHF, DPO ni fine-tuning por preferencias, algo esperable en un modelo TTS de este tamaño. La model card reporta una paridad de `r = 0.9998` entre la versión ONNX FP16 y el checkpoint FP32.

## Capacidades

- Síntesis de voz (text-to-speech) en seis idiomas: sánscrito, hindi, kannada, tamil, telugu y malayalam.
- Soporte de 9 escrituras brahmicas más transliteración ISO-15919/IAST para la entrada de texto.
- Inferencia en Python, Node.js y navegador (100% cliente) mediante `onnxruntime-web` con WASM SIMD.
- Generación de audio a 16 kHz con un vocoder HiFi-GAN integrado.
- Distribución como fichero ONNX único de 54,3 MB, sin ficheros de datos auxiliares.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura de textos sánscritos clásicos: el modelo permite convertir pasajes en escritura devanagari o en transliteración IAST a voz, útil para plataformas de estudio de sánscrito y textos védicos donde apenas existen voces neuronales disponibles.
- Accesibilidad web en lenguas índicas: al ejecutarse en el navegador vía WASM, puede integrarse en aplicaciones de lectura por voz para usuarios de hindi, tamil, telugu, kannada o malayalam sin enviar texto a un servidor.
- Aplicaciones offline o de privacidad estricta: el fichero ONNX único de 54,3 MB cabe en el cliente, lo que permite síntesis de voz sin conexión y sin exposición de datos a terceros.
- Prototipado rápido de asistentes de voz regionales: con licencia MIT y un único checkpoint, un equipo puede integrar TTS en un pipeline de Node.js o Python en minutos para demos de asistentes en lenguas del sur de la India.
- Localización de contenido educativo: generación de narraciones en hindi, kannada, tamil, telugu y malayalam para cursos, audiolibros o material didáctico a partir de texto.
- Investigación en TTS de bajos recursos: sirve como punto de partida (fine-tuning) para lenguas índicas con pocos datos, dado su tamaño reducido y su licencia permisiva.
- Herramientas de pronunciación: aplicaciones de aprendizaje de sánscrito que reproducen la pronunciación de palabras o frases a partir de su transliteración.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Mel-Cepstral Distortion (MCD) | 5,143 dB | 126 utterances held-out, bootstrap B=1000 |
| CER round-trip con ASR sánscrito `Su-śrotā` | 15,006% | Evaluación independiente de ida y vuelta |
| Paridad ONNX FP16 vs FP32 | r = 0,9998 | Correlación reportada por el autor |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible. Los datos anteriores proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint FP32 ocupa aproximadamente 0,2 GB en disco y el ONNX FP16 54,3 MB, por lo que la inferencia cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes, cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en dispositivos de gama baja.
- Opciones de despliegue: `onnxruntime` (Python, Node.js), `onnxruntime-web` con WASM SIMD en navegador; el checkpoint safetensors FP32 permite uso con PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas índicos | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sntts` (gnumanth) | 35,4 M | sa, hi, kn, ta, te, ml | Texto multiescritura + IAST | MIT | ONNX, safetensors |
| Modelos TTS comerciales (p. ej., servicios cloud) | no disponible | variable, rara vez sánscrito | texto | propietaria | API |
| Coqui TTS / VITS genéricos | variable | limitado | texto | variable (MPL/GPL según modelo) | PyTorch, ONNX |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas concretas; la comparativa anterior es cualitativa y se basa en características publicadas. Para el resto de alternativas, no disponible.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (1008 utterances), lo que puede limitar la naturalidad, la cobertura fonética y la variedad de hablantes.
- El CER round-trip del 15% en sánscrito indica un margen de error apreciable en la inteligibilidad; conviene validar en el dominio concreto antes de producción.
- No hay evaluación independiente de sesgos; al entrenarse con corpus religiosos y académicos, puede reproducir sesgos de pronunciación o de estilo de esos datos.
- Riesgo de alucinación acústica: en TTS, entradas fuera de distribución o transliteraciones ambiguas pueden producir pronunciaciones incorrectas.
- Soporte idiomático limitado a seis lenguas índicas; no cubre otras lenguas ni variantes dialectales no representadas en el corpus.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Modelo de autor individual con muy poca tracción (16 descargas, 0 likes); la madurez y el mantenimiento a largo plazo no están garantizados.
- No dispone de control de prosodia, emoción ni estilo más allá de lo que permita el texto de entrada.

## Enlaces

- HuggingFace: https://huggingface.co/gnumanth/sntts
- Dataset `prathoshap/sushrota-sanskrit-asr-data`: https://huggingface.co/datasets/prathoshap/sushrota-sanskrit-asr-data
- Dataset `yashnbx/gita_supersite_sanskrit_tts`: https://huggingface.co/datasets/yashnbx/gita_supersite_sanskrit_tts
- Corpus SYSPIN (hindi, kannada, tamil, telugu): no disponible enlace directo en la información proporcionada
- Corpus IITM Malayalam: no disponible enlace directo en la información proporcionada
- `onnxruntime-web`: https://onnxruntime.ai/docs/tutorials/web/
