# Phoonnx/coqui-vits-pl-mai_female-vits

## Resumen

coqui-vits-pl-mai_female-vits es un modelo de sintesis de voz (text-to-speech) en formato ONNX derivado del modelo `coqui/pl-mai_female-vits` del proyecto Coqui TTS. Lo publica el usuario Phoonnx como un repositorio individual extraido de la coleccion `Phoonnx/phoonnx-coqui-vits`, pensado para ser consumido por la libreria `phoonnx` (implementacion ligera orientada a inferencia ONNX). El modelo genera voz femenina en polaco (pl-PL) y esta entrenado sobre el corpus M-AILABS.

Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura end-to-end que combina un encoder de texto, un predictor de duraciones y un decoder basado en flujo y GAN para generar waveform directamente a partir de fonemas o texto. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto adecuado para despliegue en CPU o GPUs de gama baja.

Su relevancia es practica: ofrece una voz polaca de calidad razonable con licencia BSD-3-Clause (permisiva, apta para uso comercial) y empaquetada en ONNX, lo que facilita la integracion en aplicaciones sin depender del stack completo de Coqui TTS. No obstante, la informacion publica disponible es minima y no incluye detalles de entrenamiento ni evaluaciones objetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con encoder de texto, predictor de duraciones, flujo normalizador y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; limitado por la longitud del texto de entrada) |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, presentada en el paper "Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech" (Kim et al., 2021). VITS combina un encoder de texto con un prior latente, un predictor estocastico de duraciones basado en alineamiento monotono (MAS) y un decoder generativo que emplea flujos normalizadores y un discriminador adversarial multi-periodo para producir la waveform final de forma end-to-end, sin necesidad de un vocoder separado.

El entrenamiento se realizo sobre el corpus M-AILABS en su subconjunto polaco, segun indica la model card de origen. No se dispone de informacion sobre el numero de horas de audio, el numero de pasos de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de fine-tuning o ajuste perceptual adicionales. Tampoco se documentan innovaciones tecnicas propias mas alla de las del VITS original.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en polaco.
- Voz femenina (identificador `coqui/pl-mai_female-vits`).
- Generacion de audio end-to-end en un solo paso de inferencia (sin vocoder externo).
- Ejecucion mediante runtime ONNX, lo que permite despliegue en CPU y en multiples plataformas.
- Integracion con la libreria `phoonnx`, que gestiona la carga y la inferencia del modelo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada; unicamente texto a audio.
- Capacidades multilingues: limitadas al polaco.

## Casos de uso

- Lectura de articulos y documentos en polaco: el modelo convierte texto plano en audio, adecuado para applications de accesibilidad o lectura por voz en movil, gracias a su tamano reducido y a la licencia permisiva.
- Asistentes de voz para dispositivos empotrados: al estar en ONNX y ocupar unos 0,1 GB, puede ejecutarse en hardware modesto (Raspberry Pi, moviles) sin GPU dedicada.
- Generacion de audiolibros y contenido editorial en polaco: permite sintetizar grandes volumenes de texto de forma automatizada con una voz femenina consistente.
- Sistemas de navegacion o anuncios por megafonia: la latencia baja de VITS en ONNX lo hace apto para respuestas habladas en tiempo casi real.
- Prototipado de interfaces conversacionales en polaco: util como componente TTS en pipelines de IVR o chatbots de voz, combinado con un ASR y un LLM.
- Dooblaje y locucion automatizada de videos cortos: la licencia BSD-3-Clause permite uso comercial sin obligacion de liberar el codigo del producto que lo integra.
- Pruebas de integracion en la libreria `phoonnx`: sirve como modelo de referencia para validar el pipeline de inferencia ONNX en polaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (el repositorio completo ocupa 0,1 GB en ONNX); no se dispone de mediciones exactas.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de memoria; A100, H100 o RTX 4090 no son necesarias para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: runtime ONNX (onnxruntime), libreria `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera inferencia en tiempo real o inferior en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coqui-vits-pl-mai_female-vits | no disponible | no aplica | no disponible | BSD-3-Clause | ONNX via `phoonnx` |
| coqui/pl-mai_female-vits (original) | no disponible | no aplica | no disponible | BSD-3-Clause | Coqui TTS |
| Otros modelos VITS de Coqui TTS (p. ej. VCTK, LJSpeech) | no disponible | no aplica | no disponible | varía (a menudo MPL-2.0 o CC-BY) | Coqui TTS / ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La principal diferencia del modelo de Phoonnx frente al original de Coqui es el formato de distribucion (ONNX aislado frente al paquete completo de Coqui TTS) y el runtime de inferencia (`phoonnx` frente a `TTS`).

## Limitaciones y advertencias

- Solo soporta polaco (pl-PL); el texto en otros idiomas producira resultados incorrectos o ininteligibles.
- Una unica voz femenina; no hay variacion de hablante sin cambios de modelo.
- No hay informacion publica sobre sesgos del dataset M-AILABS (posible sesgo de genero, edad o acento en la voz sintetizada).
- Riesgo de artefactos y errores de pronunciacion en palabras extranas, siglas, numeros o nombres propios no cubiertos por el corpus de entrenamiento.
- No se documentan evaluaciones objetivas (MOS, WER) ni pruebas de robustez.
- La licencia BSD-3-Clause permite uso comercial, pero conviene verificar las condiciones del dataset original M-AILABS y del modelo Coqui del que deriva.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado en noviembre de 2026, sin senales de validacion por parte de la comunidad.
- No apto para clonacion de voz ni para tareas que requieran control de prosodia o emocion avanzado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-pl-mai_female-vits
- Repositorio de origen de la coleccion: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Modelo original de Coqui: https://huggingface.co/coqui/pl-mai_female-vits (referenciado en la model card)
- Paper de VITS (Kim et al., 2021): https://arxiv.org/abs/2106.06103
- Proyecto Coqui TTS: https://github.com/coqui-ai/TTS
