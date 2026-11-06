# agelwarg/supertonic-3-coreml

## Resumen

Supertonic 3 Core ML es una conversión del modelo de síntesis de voz Supertone/supertonic-3 al formato Core ML de Apple, publicada por el usuario agelwarg. El objetivo es ejecutar el pipeline completo de text-to-speech sobre la Apple Neural Engine (ANE) de un iPhone o un Mac, sin depender de servidores externos ni de GPU dedicadas. El modelo original lo desarrolla Supertone y soporta 31 idiomas, 10 voces y una frecuencia de muestreo de 44,1 kHz.

La conversión descompone el sistema en cuatro submodelos independientes: un predictor de duración, un codificador de texto, un estimador de vectores (que aplica un paso de flow matching con classifier-free guidance) y un vocoder que transforma los latentes en audio a 44,1 kHz. Cada submodelo se empaqueta como un ML program con funciones de longitud fija (n64, n128, n192, n256, n384 y n512), pensadas para las restricciones de formas estáticas de la Neural Engine.

Es relevante para desarrolladores de aplicaciones de voz en el ecosistema Apple porque demuestra un pipeline TTS de calidad completa ejecutándose en dispositivo, con pesos compartidos entre funciones y cálculo en FP16. El repositorio pesa 0,2 GB y se distribuye bajo licencia OpenRAIL-M, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en cuatro etapas (predictor de duración, codificador de texto, estimador de vectores con flow matching y vocoder), convertido a ML programs de Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto por frase, latentes de hasta 512 frames (un frame = 3.072 muestras, unas 35 s de audio en n512) |
| Tipos de cuantizacion | no disponible; cálculo interno en FP16 con entradas y salidas en float32 |
| Idiomas soportados | 31 idiomas según el modelo base (lista concreta no disponible en la información proporcionada) |
| Licencia | OpenRAIL-M (BigScience Open RAIL-M, con restricciones de uso del Anexo A); scripts de conversión en MIT |
| Formato de pesos | ML programs de Core ML (`.mlpackage`), compatible con iOS 18 y macOS 15 |

## Arquitectura y entrenamiento

El modelo original de Supertone es un sistema TTS de dos etapas típico de los modelos de difusión para voz: un codificador de texto condicionado por la voz de referencia, un predictor de duración que determina la longitud de la secuencia latente y un estimador de vectores que aplica flow matching con classifier-free guidance para generar los latentes acústicos. Finalmente, un vocoder convierte esos latentes en audio PCM a 44,1 kHz. La conversión no reentrena el modelo: reconstruye la red como módulos PyTorch a partir de los grafos ONNX publicados por Supertone, carga los pesos originales y verifica la equivalencia contra ONNX Runtime.

La adaptación a Core ML introduce tres cambios técnicos. Primero, el cálculo se realiza en FP16, lo que produce una correlación de 0,97 con la salida de ONNX Runtime usando el mismo ruido de entrada. Segundo, se añade padding con repetición del último frame real antes de cada convolución depthwise, de modo que una entrada con padding produce el mismo resultado que una sin él. Tercero, los logits enmascarados de la atención de texto se fijan en -1e4 en lugar de -inf para evitar problemas numéricos en FP16. Cada paquete expone funciones de longitud fija que comparten una única copia de los pesos, y el usuario debe seleccionar la longitud adecuada mediante `MLModelConfiguration.functionName`.

## Capacidades

- Síntesis de voz a partir de texto con salida a 44,1 kHz, con calidad equivalente al modelo original dentro del margen de error de FP16 (correlación de 0,97 frente a ONNX Runtime).
- Soporte de 31 idiomas y 10 voces, según las capacidades declaradas del modelo base Supertone/supertonic-3.
- Control de duración explícito mediante un predictor dedicado, lo que permite ajustar la longitud del audio generado por frase.
- Generación por pasos de flow matching configurable: el estimador de vectores acepta `current_step` y `total_step`, con un rango recomendado de 5 a 10 pasos.
- Ejecución en dispositivo sobre la Apple Neural Engine, sin conexión de red ni servidores externos.
- Procesamiento por frases: el codificador de texto y el predictor de duración se ejecutan una vez por frase, y el estimador de vectores una vez por paso.
- No soporta tool calling, function calling ni razonamiento multi-paso; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Aplicaciones de chat de voz en dispositivo: el modelo está pensado para Pocket Chatter, una app de conversación por voz que funciona íntegramente en el iPhone, lo que elimina la latencia de red y las preocupaciones de privacidad asociadas al envío de audio a servidores.
- Lectura de textos largos en apps de accesibilidad: la segmentación por frases y las funciones de longitud fija permiten procesar párrafos completos de forma incremental, manteniendo la memoria acotada en dispositivos con poca RAM.
- Asistentes personales offline en macOS: al ejecutarse sobre la Neural Engine de un Mac con macOS 15, puede integrarse en herramientas de productividad que necesitan respuestas habladas sin depender de servicios en la nube.
- Audiolibros y contenido educativo: los 31 idiomas y las 10 voces del modelo base permiten generar narraciones multilingües con una sola instalación, seleccionando la voz mediante los estilos incluidos en `voice_styles/`.
- Sistemas de navegación y avisos por voz: la latencia baja de la ANE y la generación por frases encajan con la síntesis de instrucciones cortas en tiempo real dentro de una app de mapas.
- Prototipado de interfaces conversacionales: los scripts de conversión incluidos en `conversion/` permiten reproducir el pipeline y experimentar con variantes del modelo antes de integrarlo en producción.
- Traducción con salida de voz: combinado con un modelo de traducción local, puede doblar contenido a cualquiera de los 31 idiomas soportados sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una correlación de 0,97 entre el audio generado por la conversión en FP16 y el de ONNX Runtime con el mismo ruido de entrada, así como una correlación de aproximadamente 0,4 del codificador de texto en la Neural Engine con la longitud n64 respecto a la CPU, lo que provoca artefactos de ruido en el habla.

## Requisitos de hardware

- Ejecución exclusiva en hardware Apple compatible con Core ML: iPhone y Mac con Neural Engine, requiriendo iOS 18 o macOS 15 como mínimo.
- El repositorio ocupa 0,2 GB, por lo que el almacenamiento necesario es modesto en comparación con modelos TTS basados en GPU.
- El estimador de vectores y el vocoder, que concentran casi todo el cómputo, deben ejecutarse con `.cpuAndNeuralEngine`; el predictor de duración y el codificador de texto deben ejecutarse con `.cpuAndGPU`.
- No es compatible con GPU NVIDIA, AMD ni con despliegues en vLLM, llama.cpp, Ollama o TGI; el único runtime es Core ML mediante coremltools.
- La longitud n512 permite generar unos 35 segundos de audio por invocación; para frases más largas es necesario segmentar.
- No se dispone de datos de latencia o throughput medidos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Contexto / longitud | Idiomas | Licencia | Ejecución |
|---|---|---|---|---|---|
| Supertonic 3 Core ML (este) | ML programs de Core ML | Hasta 512 frames latentes (~35 s) | 31 (según modelo base) | OpenRAIL-M | Apple Neural Engine, iOS 18 / macOS 15 |
| Supertone/supertonic-3 | ONNX | No disponible | 31 | OpenRAIL-M | CPU/GPU con ONNX Runtime |
| supertonic-2-mlx (typomonster) | MLX | No disponible | No disponible | No disponible | Apple Silicon con MLX |

La comparación con otros sistemas TTS de código abierto orientados a dispositivo no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El codificador de texto produce resultados incorrectos en la Neural Engine con la longitud n64 (correlación de aproximadamente 0,4 con la CPU en un Mac M5 y un iPhone 17 Pro), lo que genera habla con ruido; el resto de modelos y longitudes sí coinciden con la CPU.
- La licencia OpenRAIL-M incluye restricciones de uso del Anexo A que se aplican también a esta conversión; es imprescindible revisarlas antes de un uso comercial.
- Al ser una conversión y no un modelo reentrenado, hereda los sesgos y limitaciones del modelo base Supertone/supertonic-3, cuyos detalles no se especifican en la información disponible.
- El cálculo en FP16 introduce una desviación medible respecto al original en FP32 (correlación de 0,97), aceptable para voz pero no idéntica bit a bit.
- Las formas fijas obligan a hacer padding hasta la siguiente longitud disponible, lo que puede desperdiciar cómputo en frases muy cortas.
- No hay información sobre el comportamiento en idiomas distintos de los 31 declarados ni sobre la calidad por idioma.
- El repositorio tiene 42 descargas y 0 likes, por lo que la validación comunitaria es mínima.
- No se dispone de datos de latencia, consumo energético ni rendimiento térmico en dispositivos concretos.

## Enlaces

- [agelwarg/supertonic-3-coreml en Hugging Face](https://huggingface.co/agelwarg/supertonic-3-coreml)
- [Supertone/supertonic-3 (modelo base)](https://huggingface.co/Supertone/supertonic-3)
- [typomonster/supertonic-2-mlx (port MLX de referencia)](https://huggingface.co/typomonster/supertonic-2-mlx)
