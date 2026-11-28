# patriotyk/HolosTTS

## Resumen

HolosTTS es un modelo de síntesis de voz (text-to-speech) de código abierto especializado en el idioma ucraniano, desarrollado por el autor independiente patriotyk. Resuelve el problema de la generación de voz natural en ucraniano con un equilibrio entre calidad y velocidad: según la model card, produce el primer fragmento de audio en 3 ms sobre una RTX 5090 y en 5 ms sobre una RTX 3090. Genera audio mono a 24 kHz y soporta streaming, lo que lo hace adecuado tanto para aplicaciones de servidor como para dispositivos móviles.

El modelo se distribuye en múltiples formatos y runtimes: pesos PyTorch (safetensors/pt), ONNX (CPU en FP32 e INT8, CUDA y TensorRT), MLX para Apple silicon y LiteRT para Android con aceleración GPU. Esta versatilidad de despliegue, poco habitual en modelos TTS pequeños, permite ejecutarlo desde un servidor con GPU hasta un teléfono Android sin PyTorch.

Una particularidad importante es que el modelo consume fonemas, no texto: la conversión de texto ucraniano a fonemas con marcas de acentuación se realiza mediante paquetes externos (`ukrainian-word-stress` e `ipa-uk`). El repositorio ocupa 7,3 GB e incluye pesos en tflite, onnx y safetensors bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos en PyTorch, ONNX, LiteRT y MLX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (síntesis por frase; se recomienda sintetizar textos largos oración por oración) |
| Tipos de cuantizacion | FP32 y INT8 (ONNX Runtime CPU); FP32 en MLX; formatos LiteRT para Android |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, TFLite (LiteRT), PyTorch (.pt) y MLX |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Entrada | fonemas (IPA ucraniano con acentuación), no texto plano |
| Clonación de voz | sí, mediante vector de 256 dimensiones extraído de una muestra de audio |
| Streaming | sí, por fragmentos configurables (`chunk_frames`, 40 frames = 1 s por defecto) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (tipo de red, número de capas, mecanismo de atención ni esquema de decodificación de audio). Lo que sí se documenta es el pipeline de inferencia: el modelo recibe fonemas IPA con marcas de acentuación, producidos externamente por `ukrainian-word-stress` e `ipa-uk`, y genera audio a 24 kHz. La síntesis se realiza por frases, y para textos largos se recomienda procesar oración por oración.

El modelo incorpora un codificador de voz (`VoiceEncoder`) que transforma una grabación de referencia en un vector de 256 números, lo que permite clonar voces. También existen voces predefinidas (`voices.pt`) que no requieren el codificador. El streaming decodifica cada fragmento con contexto a ambos lados, de modo que los fragmentos concatenados equivalen exactamente a la salida de `generate()`; un `chunk_frames` menor reduce la latencia del primer fragmento a costa de un tiempo total mayor. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino por preferencias.

## Capacidades

- Síntesis de voz en ucraniano a partir de fonemas IPA con acentuación.
- Voces predefinidas seleccionables mediante `list_voices()`.
- Clonación de voz zero-shot a partir de una muestra de audio limpia (sin música ni otros hablantes), representada como vector de 256 dimensiones reutilizable y serializable.
- Control de velocidad del habla mediante el parámetro `speed` (valores superiores a 1 aceleran, inferiores ralentizan).
- Streaming de audio por fragmentos con gestión de silencios de frontera (recorte a 10 ms y fundido de entrada de 5 ms para evitar clics).
- Ejecución sin PyTorch en ONNX Runtime (CPU FP32/INT8, CUDA, TensorRT).
- Ejecución en GPU de Apple silicon mediante MLX en FP32.
- Ejecución en Android con LiteRT sobre GPU y alternativa en CPU con ONNX Runtime (port Kotlin con aplicación de demostración).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenidos en ucraniano: conversión de artículos, noticias o documentación a audio, sintetizando oración por oración para respetar el límite práctico de frase del modelo.
- Asistentes de voz para Android: integración mediante la librería LiteRT, que en un Pixel 7 alcanza un RTF de 0,13 y entrega el primer fragmento de streaming en unos 0,4 s, adecuado para respuestas habladas en tiempo real.
- Accesibilidad para personas con discapacidad visual: generación de audio de interfaz y lectura de pantalla en ucraniano con voces predefinidas y control de velocidad.
- Clonación de voz para doblaje o audiolibros: extracción de un vector de voz a partir de una grabación de referencia y reutilización del mismo vector en todos los fragmentos del proyecto, incluida la inferencia ONNX.
- Servicios de streaming de baja latencia: despliegue con TensorRT o CUDA y uso de `stream()` para emitir audio mientras se genera, con el primer fragmento en milisegundos sobre GPU de gama alta.
- Aplicaciones de escritorio en macOS: uso del paquete MLX para ejecutar todo el modelo en la GPU del Mac en FP32 sin PyTorch, con carga en una fracción de segundo.
- Procesamiento por lotes en servidores sin GPU: ONNX Runtime en CPU con cuantización INT8 para generar audios de forma económica.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Primer fragmento de audio | 3 ms | RTX 5090 |
| Primer fragmento de audio | 5 ms | RTX 3090 |
| RTF en Android | 0,13 | Pixel 7, LiteRT sobre GPU |
| Primer fragmento en Android | ~0,4 s | Pixel 7, LiteRT sobre GPU |

La model card menciona una sección de benchmarks con RTF para la síntesis de una frase completa mediante `generate()`, pero el texto proporcionado se interrumpe antes de incluir las cifras correspondientes. No se han publicado en la información disponible resultados de benchmarks de calidad (MOS, similitud de voz, WER) ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 7,3 GB e incluye pesos en varios formatos, por lo que el conjunto de pesos de un único runtime es menor, pero no se especifica la cifra exacta.
- GPU recomendadas: RTX 5090 y RTX 3090 citadas explícitamente por el autor para latencias de 3 ms y 5 ms respectivamente; CUDA y TensorRT soportados en GPUs NVIDIA.
- GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3090; también se ejecuta en CPU mediante ONNX Runtime (FP32 o INT8).
- Apple silicon: soporte mediante MLX en FP32, descrito como la opción más rápida en Mac.
- Android: GPU del teléfono con LiteRT (referencia Pixel 7); en dispositivos sin GPU adecuada, CPU con ONNX Runtime en INT8.
- Opciones de despliegue: PyTorch (`holos-tts`), ONNX Runtime (`holos-tts-onnx`, con extra `[tensorrt]`), MLX (`holos-tts-mlx`), LiteRT (`holos-tts-litert`), librería Kotlin para Android (ONNX y LiteRT).
- Latencia y throughput: primer fragmento en 3-5 ms en GPUs NVIDIA de gama alta; RTF de 0,13 en Pixel 7 con LiteRT. No se documentan cifras de throughput agregado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de TTS en ucraniano, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Idioma | Licencia | Despliegue | Datos comparativos |
|---|---|---|---|---|
| HolosTTS | ucraniano | MIT | PyTorch, ONNX, MLX, LiteRT | primer fragmento 3-5 ms en RTX 5090/3090 |
| Alternativas de TTS multilingüe | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo acepta fonemas, no texto: requiere un pipeline externo de acentuación y transcripción IPA (`ukrainian-word-stress`, `ipa-uk`, instalados desde GitHub con Git), lo que añade dependencias y pasos previos.
- Idioma limitado al ucraniano; no se documenta soporte multilingüe.
- La síntesis está pensada por frases; los textos largos deben dividirse oración por oración, lo que puede afectar a la prosodia entre frases.
- La clonación de voz exige grabaciones de referencia limpias, sin música ni otros hablantes; muestras de baja calidad degradarán el resultado.
- No se publican en la información disponible datos sobre sesgos, tasas de alucinación o errores de pronunciación; al ser un modelo generativo de audio, existe riesgo de artefactos y de pronunciación incorrecta en palabras con acentuación ambigua.
- La licencia MIT permite uso comercial, pero el uso de clonación de voz plantea riesgos éticos y legales (suplantación de identidad, consentimiento del hablante) que deben gestionarse en producción.
- El repositorio es de 7,3 GB al incluir múltiples formatos; conviene descargar solo los artefactos del runtime elegido.
- No se documentan cifras de calidad subjetiva (MOS) ni comparativas con otros sistemas TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patriotyk/HolosTTS
- Demo (Space): https://huggingface.co/spaces/patriotyk/HolosTTS
- Código en GitHub: https://github.com/patriotyk/HolosTTS
- Paquete PyTorch: https://pypi.org/project/holos-tts/
- Paquete ONNX: https://pypi.org/project/holos-tts-onnx/
- Paquete MLX: https://pypi.org/project/holos-tts-mlx/
- Paquete LiteRT: https://pypi.org/project/holos-tts-litert/
- README del paquete ONNX: https://github.com/patriotyk/HolosTTS/blob/main/holos_onnx/python/README.md
- README de la librería Kotlin ONNX: https://github.com/patriotyk/HolosTTS/blob/main/holos_onnx/kotlin/README.md
- README de MLX: https://github.com/patriotyk/HolosTTS/blob/main/holos_mlx/README.md
- README de LiteRT Kotlin: https://github.com/patriotyk/HolosTTS/blob/main/holos_litert/kotlin/README.md
- Paquete de acentuación ucraniana: https://github.com/patriotyk/ukrainian-word-stress
- Paquete de transcripción IPA ucraniana: https://github.com/patriotyk/ipa-uk
- LiteRT (Google): https://ai.google.dev/edge/litert
- MLX (Apple): https://github.com/ml-explore/mlx
