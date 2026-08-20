# karim23657/chatterbox-persian-onnx

## Resumen

El repositorio `karim23657/chatterbox-persian-onnx` contiene un modelo de síntesis de voz (text-to-speech, TTS) en formato ONNX, específicamente afinado para el idioma persa/farsi. Se trata de un fine-tune del modelo Chatterbox, desarrollado originalmente por Resemble AI, que se distribuye como un espacio Gradio con inferencia optimizada mediante ONNX Runtime. El autor, karim23657, proporciona además un script de conversión reproducible y un motor de inferencia reutilizable, lo que facilita su integración en aplicaciones propias.

La relevancia actual de este modelo radica en la escasez de sistemas TTS de código abierto de alta calidad para el persa, y en la ventaja de disponer de un formato ONNX que permite ejecución en CPU o GPU con dependencias ligeras. El repositorio incluye una interfaz Gradio completa que expone controles avanzados de síntesis (temperatura, CFG, *top-p*, *repetition penalty*, etc.) y soporte para clonación de voz mediante una grabación de referencia de 3 a 10 segundos.

Aunque la ficha oficial no detalla la arquitectura interna ni el número de parámetros, la procedencia de Chatterbox sugiere un sistema basado en transformadores y flujos normalizadores, con un tamaño de archivo de 5.3 GB en el repositorio. La licencia indicada en el README es CC-BY-NC-4.0, por lo que su uso comercial está restringido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Chatterbox TTS de Resemble AI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | INT8, FP32 (seleccionables en la interfaz) |
| Idiomas soportados | Persa/farsi |
| Licencia | CC-BY-NC-4.0 (según README del autor) |
| Formato de pesos | ONNX (gráficos y pesos externos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Sin embargo, al ser un *fine-tune* de Chatterbox, se espera que herede la arquitectura de ese sistema: un modelo TTS basado en transformadores con un decodificador de flujo normalizado (normalizing flow) para generar mel-espectrogramas, y un vocoder neuronal para convertir los espectrogramas en audio. El modelo se ha afinado específicamente para el persa, aunque no se especifica la cantidad de datos ni el proceso de entrenamiento.

El repositorio incluye scripts de conversión a ONNX (`convert_to_onnx.py`) y de verificación (`verify_onnx.py`), lo que indica que el proceso de conversión es reproducible. La inferencia se realiza mediante ONNX Runtime, con soporte para ejecución en CPU (se puede fijar el número de hilos) o GPU, y ofrece un modo de diagnóstico "greedy" para depuración.

## Capacidades

- Generación de voz en persa/farsi a partir de texto.
- Clonación de voz mediante una grabación de referencia (3 a 10 segundos, mono, limpia).
- Control fino de la síntesis: *exaggeration*, CFG, temperatura, *top-p*, *min-p*, *repetition penalty*, tokens de habla mínimos y máximos, y *seed* para reproducibilidad.
- Selección entre cuantización INT8 y FP32 para balancear velocidad y calidad.
- Modo de diagnóstico "greedy" para inspección.
- Generación de informes de tiempos (JSON) para medir el rendimiento.
- Integración en Gradio Space con interfaz web interactiva.

## Casos de uso

- **Asistentes de voz en persa**: el modelo puede generar respuestas habladas de forma natural para aplicaciones de asistente personal, integrando el ONNX en un servicio backend con ONNX Runtime.
- **Audiolibros y narración**: dado su control de la síntesis y la clonación de voz, permite producir audiolibros en persa con una voz consistente y ajustable.
- **Subtitulado y doblaje**: para doblar contenido audiovisual al persa, se puede clonar una voz de referencia y generar diálogos con la entonación deseada.
- **Aplicaciones educativas**: generación de material de aprendizaje hablado para estudiantes de persa, con control de velocidad y énfasis.
- **Sistemas de accesibilidad**: lectores de pantalla en persa para personas con discapacidad visual, usando la CPU del dispositivo.
- **Investigación en síntesis de voz**: al estar en formato ONNX, permite experimentar con parámetros de generación y analizar el rendimiento del modelo en diferentes configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos de calidad de voz (MOS, etc.) ni de velocidad de inferencia para este modelo específico.

## Requisitos de hardware

- **VRAM estimada**: no disponible; depende del tamaño del modelo y de la cuantización. El repositorio ocupa 5.3 GB, por lo que se recomienda al menos 8 GB de RAM/VRAM para FP32 en GPU.
- **GPU recomendadas**: no especificadas. Se puede ejecutar en CPU (el README menciona control de número de hilos) o GPU compatible con ONNX Runtime (NVIDIA CUDA, AMD ROCm, etc.).
- **Consumer GPU**: probablemente funcione en tarjetas con 8 GB o más (por ejemplo, RTX 3060, RTX 4060) en cuantización INT8.
- **Opciones de despliegue**: ONNX Runtime (C++, Python, C#), o mediante el Space de Gradio incluido. No se mencionan integraciones con vLLM, llama.cpp o Ollama (no aplicables a TTS).
- **Latencia y throughput**: no disponibles. Depende de la CPU/GPU y de la cuantización elegida.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparación con otros modelos TTS persas. En el repositorio se menciona el repositorio `Persian-tts-coqui` (basado en Coqui TTS), pero no se ofrecen datos comparativos. No se puede realizar una comparación objetiva con datos concretos.

## Limitaciones y advertencias

- **Licencia CC-BY-NC-4.0**: no permite el uso comercial sin autorización expresa. Debe revisarse el modelo base Chatterbox y sus términos adicionales.
- **Riesgo de mal uso**: la clonación de voz puede utilizarse para suplantación de identidad; el README indica que el modelo está destinado únicamente a la clonación con consentimiento.
- **Alucinaciones**: en TTS, las alucinaciones se manifiestan como errores de pronunciación o entonación, especialmente en palabras poco frecuentes o nombres propios; no se han documentado casos específicos.
- **Limitaciones de idioma**: aunque está afinado para el persa, no se garantiza un rendimiento óptimo en dialectos o variedades regionales.
- **Formato ONNX**: puede no aprovechar todas las optimizaciones del modelo original de PyTorch; el rendimiento puede variar según la versión de ONNX Runtime.
- **Dependencias**: requiere ONNX Runtime y, para la interfaz Gradio, dependencias adicionales que no se listan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/karim23657/chatterbox-persian-onnx
- Repositorio GitHub del autor: https://github.com/karim23657/awesome-Persian-Speech
- Repositorio Chatterbox de Resemble AI: https://github.com/resemble-ai/chatterbox
- Repositorio Persian-tts-coqui (relacionado): https://github.com/karim23657/Persian-tts-coqui
- Discusión sobre conversión ONNX en el repositorio de Chatterbox: https://huggingface.co/niobures/Chatterbox-TTS/discussions/2
