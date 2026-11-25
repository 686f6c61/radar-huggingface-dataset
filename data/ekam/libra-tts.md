# Ekam/Libra-TTS

## Resumen

Libra TTS es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por Ekam, destilado a partir de Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice. Con solo 307 millones de parámetros, cubre 16 idiomas y 8 voces predefinidas, y está diseñado para ejecutarse más rápido que el tiempo real tanto en Apple Silicon (vía MLX) como en GPU NVIDIA (PyTorch con CUDA graphs) y en CPU (ONNX Runtime).

El modelo destaca por su eficiencia: con un sexto del tamaño de Qwen3-TTS 1.7B, reporta un error de palabra (WER) medio de 1,77 % frente al 2,75 % del modelo base, y un 1,64 % en inglés, por delante de alternativas como Kokoro-82M y Magpie-357M. Añade seis idiomas respecto a su modelo base (árabe, hindi, panyabí, bengalí, urdu e indonesio), lo que amplía notablemente su cobertura lingüística.

La relevancia actual radica en su combinación de tamaño reducido, licencia Apache 2.0, soporte multiplataforma y lectura de texto crudo (números, fechas, horas y divisas sin preprocesado), lo que lo hace adecuado para despliegues en producción con requisitos de latencia estrictos y hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS destilado de Qwen3-TTS-12Hz-1.7B-CustomVoice) |
| Parámetros totales | 307.149.568 (~0,3B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; exportación ONNX disponible) |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, pt, ru, ar, hi, pa, bn, ur, id (16) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, MLX |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna (tipo de transformer, mecanismo de atención, códec de audio o tasa de muestreo) más allá de que deriva de Qwen3-TTS-12Hz-1.7B-CustomVoice. El dato "12Hz" del modelo base sugiere una tokenización de audio a 12 Hz, pero no se confirma en la documentación proporcionada.

El modelo es el resultado de un proceso de destilación desde el modelo base de 1,7B de Qwen, reduciendo el tamaño a 307M de parámetros. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se indica que incorpora 12 estilos de habla (de cálido a susurrante) y control de velocidad de lectura, y que lee texto crudo sin preprocesado.

## Capacidades

- Síntesis de voz multilingüe en 16 idiomas: inglés, chino, japonés, coreano, alemán, francés, español, italiano, portugués, ruso, árabe, hindi, panyabí, bengalí, urdu e indonesio.
- Ocho voces predefinidas (Nina, Bob, Sofia, Aliya, Maya, Sam, Jon, Omar).
- Doce estilos de habla, desde tono cálido hasta susurrante.
- Control de velocidad de lectura (más lento o más rápido).
- Lectura de texto crudo: números, fechas, horas y divisas sin preprocesado.
- Ejecución en Apple Silicon (MLX), GPU NVIDIA (PyTorch con CUDA graphs) y CPU (ONNX Runtime).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Audiolibros y narración automatizada: el modelo lee texto largo a 44x tiempo real en MacBook Pro y 72x en RTX 3090, lo que permite procesar obras completas en minutos y con control de velocidad y estilo por sección.
- Asistentes de voz en dispositivos: con 0,3B de parámetros y ejecución en CPU vía ONNX (2,4x tiempo real), puede integrarse en aplicaciones de escritorio o sistemas embebidos sin GPU dedicada.
- Localización de contenidos multimedia: al cubrir 16 idiomas, permite doblar vídeos o pódcast a múltiples mercados usando una misma infraestructura y las ocho voces disponibles.
- Sistemas de accesibilidad: lectura de pantalla para personas con discapacidad visual, con lectura de números, fechas y divisas sin preprocesado, lo que reduce errores en interfaces con datos dinámicos.
- Atención al cliente por voz: generación de respuestas habladas en tiempo real en centros de contacto, con estilos ajustables (tono cálido o susurrante) según el contexto de la conversación.
- Generación de avisos y notificaciones: lectura automática de alertas, recordatorios o mensajes de sistema en aplicaciones móviles y domótica, aprovechando la baja latencia (7,7x tiempo real en MacBook Pro para una frase).
- Prototipado rápido de interfaces de voz: el demo en vivo y la instalación vía pip facilitan la evaluación de la calidad de voz antes de comprometerse con un despliegue en producción.

## Benchmarks y rendimiento

| Métrica | Libra TTS (0,3B) | Qwen3-TTS 1.7B | Qwen3-TTS 0.6B | Magpie-357M | Kokoro-82M | Modelo base (1.9B destilado) |
|---|---|---|---|---|---|---|
| WER inglés | 1,64 % | 2,74 % | 3,21 % | superior a 1,64 % | superior a 1,64 % | no disponible |
| WER medio (10 idiomas) | 1,77 % | 2,75 % | 2,62 % | no disponible | no disponible | 1,91 % |
| Velocidad (MacBook Pro, frase) | 7,7x tiempo real | no disponible | no disponible | no disponible | no disponible | no disponible |
| Velocidad (RTX 3090, frase) | 8,7x tiempo real | no disponible | no disponible | no disponible | no disponible | no disponible |
| Velocidad (MacBook Pro, texto largo) | 44x tiempo real | no disponible | no disponible | no disponible | no disponible | no disponible |
| Velocidad (RTX 3090, texto largo) | 72x tiempo real | no disponible | no disponible | no disponible | no disponible | no disponible |
| Velocidad (CPU ONNX) | 2,4x tiempo real | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de WER provienen de la model card del autor; no se especifica el conjunto de evaluación empleado. No se han publicado resultados de benchmarks adicionales (p. ej. MOS, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 307M de parámetros en safetensors el peso ronda los 1,2 GB en fp32 y menos de 0,7 GB en fp16, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3090 (referencia de rendimiento del autor, 8,7x tiempo real por frase y 72x en texto largo); GeForce RTX 20-series o superior con soporte CUDA; Apple Silicon vía MLX.
- Cabe en GPU consumer: sí, en cualquier GPU NVIDIA GeForce RTX 20-series o posterior, y en Apple Silicon (M1 en adelante).
- Opciones de despliegue: MLX (macOS/Apple Silicon), PyTorch con CUDA graphs (Windows y Linux, NVIDIA), ONNX Runtime (CPU en cualquier plataforma); instalación vía pip con extras `[ja]` y `[cuda,ja]`.
- Latencia y throughput: 7,7x tiempo real por frase en MacBook Pro, 8,7x en RTX 3090; 44x y 72x respectivamente en texto largo; 2,4x en CPU con ONNX; en Linux, la compilación de capas al cargar aporta ~15 % de mejora adicional por frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER inglés | WER medio (10 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Libra TTS | 0,3B | 16 | 1,64 % | 1,77 % | Apache 2.0 | Hugging Face, GitHub, demo |
| Qwen3-TTS 1.7B | 1,7B | 10 | 2,74 % | 2,75 % | no disponible en la información | Hugging Face |
| Qwen3-TTS 0.6B | 0,6B | 10 | 3,21 % | 2,62 % | no disponible en la información | Hugging Face |
| Magpie-357M | 0,357B | no disponible | superior a 1,64 % | no disponible | no disponible | no disponible |
| Kokoro-82M | 0,082B | no disponible | superior a 1,64 % | no disponible | no disponible | no disponible |

Libra TTS ofrece el mejor WER en inglés de los modelos comparados y supera a Qwen3-TTS en su conjunto de diez idiomas con un tamaño mucho menor. La comparativa con Magpie y Kokoro se limita al WER inglés según la model card; no se dispone de más datos sobre estos modelos.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser destilado de Qwen3-TTS, podría heredar sesgos presentes en los datos de entrenamiento del modelo base, pero no se especifica.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber errores de pronunciación o entonación en idiomas con menor representación (panyabí, urdu, bengalí).
- Solo dispone de ocho voces predefinidas; no se documenta clonación de voz ni voz personalizada.
- No se especifica la longitud máxima de texto por inferencia ni la longitud de contexto del modelo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-TTS antes de un uso comercial, ya que la información disponible no detalla la licencia de este.
- El rendimiento en CPU es notablemente inferior (2,4x tiempo real) frente a GPU, lo que puede limitar despliegues en hardware muy restringido.
- No se han publicado métricas de calidad perceptual (MOS) ni de similitud de hablante en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ekam/Libra-TTS
- Demo en vivo: https://huggingface.co/spaces/Ekam/Libra-TTS
- Código en GitHub: https://github.com/ekambrar100/Libra-TTS
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
