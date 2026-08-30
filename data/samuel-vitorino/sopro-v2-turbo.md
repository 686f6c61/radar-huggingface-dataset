# samuel-vitorino/sopro-v2-turbo

## Resumen

Sopro V2 Turbo es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado por Samuel Vitorino y publicado bajo la organización Halo Research. Con 121 millones de parámetros, está diseñado para ejecutarse de forma eficiente en CPU de portátil, GPU e incluso en el navegador mediante ONNX, lo que lo convierte en una opción atractiva para aplicaciones de voz en el dispositivo sin depender de servicios en la nube.

El modelo soporta cuatro idiomas (inglés, portugués europeo, francés y alemán) y ofrece dos modos de generación: uno offline de alta calidad y otro streaming con un tiempo hasta el primer audio de aproximadamente 300 ms en CPU. Su arquitectura ligera, basada en convoluciones dilatadas y atención cruzada, se aleja de los transformadores convencionales y permite un factor de tiempo real (RTF) de 0,24 en modo offline y 0,21 en streaming sobre un Apple M3, o 0,07 en una GPU H100.

La relevancia de Sopro V2 Turbo radica en su combinación de tamaño reducido, licencia Apache 2.0 y capacidades de clonación de voz sin entrenamiento previo, lo que facilita su integración en proyectos de código abierto, asistentes locales y herramientas de accesibilidad. El modelo se distribuye en formato safetensors y también existe una versión ONNX para el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convoluciones dilatadas y atención cruzada ligera (según repo de GitHub; no se detalla en la model card) |
| Parametros totales | 121.574.193 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS) |
| Tipos de cuantizacion | int8 (CPU), cuantización ONNX para navegador |
| Idiomas soportados | en, pt, fr, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Sopro V2 Turbo emplea una arquitectura no basada en transformadores, compuesta por capas de convoluciones dilatadas (estilo WaveNet) y mecanismos de atención cruzada ligeros, según se indica en el repositorio oficial. Esta elección reduce el coste computacional y facilita la inferencia en dispositivos con recursos limitados. El modelo incorpora un vocoder causal para el modo streaming y utiliza atención por fragmentos (chunked attention) para procesar audio de forma incremental.

El entrenamiento se realizó sobre una combinación de conjuntos de datos públicos: Emilia YODAS, LibriTTS-R y FalAR, este último específico para portugués europeo. No se menciona el uso de técnicas de RLHF o DPO, al tratarse de una tarea de síntesis de voz. El modelo admite clonación de voz zero-shot a partir de 5 a 20 segundos de audio de referencia, y permite precalcular la referencia para reducir la latencia en el modo streaming.

## Capacidades

- Generación de voz natural con clonación zero-shot a partir de una muestra de audio de 5 a 20 segundos.
- Modo streaming con baja latencia (~300 ms de tiempo hasta el primer audio en CPU de portátil).
- Soporte multilingüe para inglés, portugués europeo, francés y alemán.
- Ejecución en CPU, GPU (CUDA/MPS) y navegador mediante ONNX.
- Parámetros de control de generación: temperatura, top-p, top-k, pasos del solver acústico y límite de duración por segmento.
- Preprocesado de referencia para reducir el tiempo de respuesta en streaming.
- No incluye capacidades de tool calling, agentes ni razonamiento, al ser exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz locales: Sopro V2 Turbo puede integrarse en asistentes personales que requieran privacidad y baja latencia, ejecutándose directamente en el dispositivo sin conexión a internet. Su modo streaming permite respuestas casi inmediatas.
- Audiolibros y narración automatizada: gracias a su clonación de voz, permite generar narraciones con una voz específica a partir de una muestra corta, útil para productores de contenido que desean mantener una voz consistente sin grabar largas sesiones.
- Accesibilidad y lectores de pantalla: al ser ligero y ejecutable en CPU, puede incorporarse en aplicaciones de lectura de texto para personas con discapacidad visual, funcionando en hardware modesto.
- Doblaje y localización de vídeo: el soporte multilingüe (en, pt, fr, de) facilita la generación de pistas de voz en varios idiomas a partir de una misma referencia, agilizando flujos de doblaje para vídeos y presentaciones.
- Atención al cliente con voz clonada: empresas pueden crear agentes telefónicos o chatbots de voz que utilicen una voz corporativa clonada, manteniendo coherencia de marca y reduciendo costes de grabación.
- Prototipado rápido de productos de voz: desarrolladores pueden generar muestras de voz para demos o pruebas de concepto sin necesidad de estudios de grabación, gracias a la API Python y la CLI incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de inteligibilidad (como WER o MOS) en la información disponible. Sin embargo, la model card reporta los siguientes datos de rendimiento:

| Metrica | Valor |
|---|---|
| RTF offline (CPU M3) | 0,24 |
| RTF streaming (CPU M3) | 0,21 |
| RTF (GPU H100) | 0,07 |
| Tiempo hasta primer audio (streaming, CPU portátil) | ~300 ms |

Estos valores indican que el modelo es adecuado para aplicaciones en tiempo real en hardware de consumo, aunque no se dispone de comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- Inferencia en CPU: funciona en portátiles convencionales; se recomienda al menos 4 GB de RAM y soporte para int8 para optimizar el rendimiento.
- GPU: compatible con CUDA y MPS; una GPU con 4 GB de VRAM es suficiente para el modelo completo (121M parámetros). En una H100 se alcanza un RTF de 0,07.
- Navegador: la versión ONNX cuantizada puede ejecutarse en navegadores modernos, aunque en móviles con poca memoria puede haber problemas.
- Opciones de despliegue: CLI (`soprotts`), API Python (`SoproTTS`), servidor local con Gradio (`soprotts serve`), y demo en navegador vía ONNX.
- Latencia: el modo streaming ofrece ~300 ms de tiempo hasta el primer audio en CPU; el modo offline tiene mayor latencia pero mejor calidad.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sopro V2 Turbo se inspira en sistemas como CSM, F5-TTS, CosyVoice y Vocos, pero no se incluyen métricas de comparación. A continuación se indican las diferencias cualitativas con algunos de ellos:

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Sopro V2 Turbo | 121M | en, pt, fr, de | Apache 2.0 | Ligero, streaming, on-device |
| F5-TTS | No disponible | No disponible | No disponible | Modelo TTS basado en flujo, requiere más recursos |
| CosyVoice | No disponible | No disponible | No disponible | TTS con clonación de voz, mayor tamaño |
| CSM | No disponible | No disponible | No disponible | Modelo conversacional, no enfocado a TTS puro |

No se dispone de datos cuantitativos para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo no incluye watermarking de audio; al ser de código abierto, cualquier marca de agua sería fácilmente eliminable. El autor advierte explícitamente contra el uso para suplantar personas.
- El frontend de texto es minimalista: abreviaturas, números y símbolos pueden pronunciarse incorrectamente. Se recomienda escribir el texto expandido (por ejemplo, "one plus two" en lugar de "1 + 2").
- El texto mixto entre idiomas (por ejemplo, una palabra en inglés dentro de una frase en portugués) puede provocar errores de pronunciación.
- El modo streaming no es bit-exacto con el modo offline; para máxima calidad se recomienda usar el modo offline.
- No se planea liberar el código de entrenamiento en el futuro cercano, lo que limita la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor solicita un uso ético y responsable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuel-vitorino/sopro-v2-turbo
- Repositorio en GitHub: https://github.com/samuel-vitorino/sopro
- Blog técnico de Sopro V2: https://research.haloneuro.ai/posts/sopro-v2
- Demo en navegador (ONNX): https://samuel-vitorino.github.io/sopro/
- Versión ONNX del modelo: https://huggingface.co/samuel-vitorino/sopro-v2-turbo-onnx
