# jiangzhuo9357/Qwen3-ASR-0.6B-ONNX

## Resumen

El modelo `jiangzhuo9357/Qwen3-ASR-0.6B-ONNX` es una exportación en formato ONNX del modelo de reconocimiento automático de voz (ASR) Qwen3-ASR-0.6B, desarrollado por Alibaba. Esta variante está específicamente empaquetada para ejecutarse en el navegador mediante onnxruntime-web y WebGPU, dentro del proyecto Sokuji, una infraestructura de inferencia local. El modelo base, Qwen3-ASR-0.6B, forma parte de la familia Qwen3-ASR que soporta identificación de idioma y transcripción en 52 idiomas y dialectos, construido sobre la base de audio de Qwen3-Omni.

La exportación ONNX presenta dos variantes cuantizadas: `q4` (int4 para decodificador, fp32 para encoder) y `q4f16` (int4 con activaciones fp16), ambas con una tabla de embeddings en int8 compartida. El objetivo es permitir transcripción de voz en tiempo real directamente en el navegador, sin servidores, con un factor de tiempo real (RTF) medido de 0.076 en Apple M4 con WebGPU. El repositorio incluye gráficos de encoder y decodificador separados, junto con archivos de configuración y tokenizador, todo bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (basado en Qwen3-Omni) |
| Parametros totales | 0.6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (contexto de audio variable segun duracion) |
| Tipos de cuantizacion | int4 (MatMulNBits, RTN, block 32), int8 para embeddings, fp16 para activaciones en variante q4f16 |
| Idiomas soportados | zh, en, ja, ko, yue, ar, de, es, fr, it, pt, ru, th, vi, hi, id (16 idiomas listados en la exportacion; el modelo base soporta 52) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos .onnx con pesos externos .data) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B emplea una arquitectura encoder-decoder basada en Qwen3-Omni, con un encoder de audio que procesa características mel (log-mel de 128 bins, compatible con Whisper) y un decodificador autoregresivo que genera el texto transcrito junto con la etiqueta de idioma. El entrenamiento del modelo base utilizo datos de habla a gran escala y hereda la capacidad de comprension auditiva de Qwen3-Omni, segun el reporte tecnico disponible en arXiv.

La exportacion ONNX introduce varias innovaciones tecnicas: el encoder esta fusionado (operaciones RMSNorm, BiasGelu y SkipLayerNormalization optimizadas), los decodificadores usan cuantizacion int4 con MatMulNBits (RTN, block 32, accuracy level 4), y se proporciona un `prompt_config.json` que define todos los constantes necesarios para construir el prompt de entrada. La variante `q4f16` mantiene RMSNorm, softmax y rotary en fp32 mientras ejecuta el resto en fp16. Los graficos estan disenados para mantener la cache KV en la GPU entre pasos de decodificacion, y el proceso de construccion del prompt incluye calculo de tokens de audio mediante una formula de convolucion especifica.

## Capacidades

- Reconocimiento automatico de voz (ASR) con identificacion de idioma integrada: el modelo genera una etiqueta de idioma antes del texto transcrito.
- Soporte multilingue: 16 idiomas listados en esta exportacion (chino, ingles, japones, coreano, cantonés, arabe, aleman, español, frances, italiano, portugues, ruso, tailandes, vietnamita, hindi e indonesio), aunque el modelo base cubre 52 idiomas y dialectos.
- Inferencia en navegador: ejecutable con onnxruntime-web y WebGPU, sin necesidad de servidor.
- Decodificacion autoregresiva con cache KV en GPU para eficiencia.
- Cuantizacion int4 e int8 que reduce el tamano del modelo a aproximadamente 1.1 GB (variante q4) o 0.7 GB (q4f16) mas archivos compartidos.
- Compatible con el pipeline de Sokuji para inferencia local.

## Casos de uso

- Transcripcion de voz en tiempo real en aplicaciones web: el modelo puede ejecutarse directamente en el navegador del usuario, permitiendo dictado o subtitulado en vivo sin enviar audio a un servidor, gracias a su RTF de 0.076 en hardware con WebGPU.
- Asistentes de voz locales: integrable en extensiones de navegador o aplicaciones web progresivas (PWA) para comandos de voz, con soporte de identificacion de idioma para adaptar la respuesta.
- Subtitulacion automatica de videos en el cliente: al procesar el audio localmente, se evitan problemas de privacidad y latencia de red, adecuado para plataformas de video bajo demanda.
- Herramientas de accesibilidad: transcripcion de reuniones o conferencias en tiempo real para personas con discapacidad auditiva, ejecutable en dispositivos con GPU integrada (Apple M4, NVIDIA GB10).
- Analisis de llamadas o entrevistas en el navegador: grabacion y transcripcion local con posterior busqueda de texto, sin necesidad de infraestructura cloud.
- Educacion y aprendizaje de idiomas: aplicaciones que transcriben pronunciacion del usuario y comparan con texto de referencia, aprovechando la identificacion de idioma para detectar el idioma hablado.

## Benchmarks y rendimiento

La model card de la exportacion ONNX proporciona mediciones de rendimiento en navegador (pipeline completo, caliente, 8 clips zh/en/ja):

| Dispositivo | Variante | RTF mediano | ms por token generado | Prefill (clip 10-15 s) |
|---|---|---|---|---|
| Apple M4, Chrome 152, WebGPU | q4 | 0.091 | 18.6 | 88-201 ms |
| Apple M4, Chrome 152, WebGPU | q4f16 | 0.076 | 16.6 | 59-135 ms |
| NVIDIA GB10 (aarch64, Vulkan, sin shader-f16), WebGPU | q4 | 0.081 | 20.8 | 37-64 ms |
| GB10 CPU, onnxruntime 1.29 (Python), 8 hilos | int4 | 0.071 | — | — |

Ademas, la validacion indica que los graficos FP32 v2 son identicos token a token a la exportacion v1 en clips de ingles, japones y chino, y que la cuantizacion int4 block 32 produce diferencias minimas (un token de puntuacion en ingles). No se han publicado resultados de benchmarks del modelo base en la informacion disponible, aunque el reporte tecnico menciona que la version 1.7B alcanza rendimiento de ultima generacion entre modelos ASR open-source.

## Requisitos de hardware

- VRAM estimada: la variante `q4` requiere aproximadamente 1.1 GB de pesos mas archivos compartidos (embeddings int8 de 155.6 MB), mientras que `q4f16` ocupa unos 0.7 GB. La VRAM total dependera del tamaño de la cache KV y del contexto de audio.
- GPU recomendadas: cualquier GPU con soporte WebGPU. Medido en Apple M4 (GPU integrada) y NVIDIA GB10 (aarch64, Vulkan). Se menciona tambien una RTX 4070 SUPER en los resultados del repositorio Sokuji.
- Compatibilidad con GPU de consumo: si, cualquier GPU moderna con WebGPU (integrada o dedicada) puede ejecutar el modelo, aunque el rendimiento variara. Sin WebGPU, el execution provider wasm es aproximadamente 30 veces mas lento para uso en vivo.
- Opciones de despliegue: onnxruntime-web con WebGPU en navegador; tambien se puede ejecutar en Python con onnxruntime (probado con 1.29 en CPU).
- Latencia y throughput: RTF mediano de 0.076-0.091 en navegador con WebGPU, lo que permite transcripcion en tiempo real. En CPU (8 hilos) el RTF es 0.071, pero sin WebGPU la experiencia en navegador no es viable.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos ASR en la informacion proporcionada. El modelo base Qwen3-ASR-0.6B compite con alternativas como Whisper (de OpenAI) o Parakeet (de NVIDIA), pero no hay datos de benchmarks comparativos en las fuentes consultadas. La exportacion ONNX es un caso particular orientado a navegador, sin equivalentes directos publicados. Se indica "no disponible" para la comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantizacion int4 puede degradar ligeramente la precision: en la validacion, el ingles difiere en un token de puntuacion respecto al FP32, aunque japones y chino son identicos.
- Requiere WebGPU para un uso practico en navegador; sin el, el rendimiento con wasm es aproximadamente 30 veces mas lento, inviable para tiempo real.
- La exportacion lista 16 idiomas, mientras que el modelo base soporta 52; los idiomas no listados pueden no estar disponibles en esta variante.
- El prompt de construccion es complejo: requiere calcular tokens de audio mediante una formula especifica y gestionar la cache KV en GPU manualmente, lo que exige un cliente bien implementado.
- Se recomienda anadir el prefijo de idioma conocido para evitar errores de identificacion en frases cortas y prevenir paradas tempranas del decodificador cuantizado.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no detalladas en esta exportacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jiangzhuo9357/Qwen3-ASR-0.6B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Reporte tecnico en arXiv: https://arxiv.org/abs/2601.21337
- Proyecto Sokuji: https://github.com/kizuna-ai-lab/sokuji
- Herramienta de exportacion: https://github.com/andrewleech/qwen3-asr-onnx
