# AKMESSI/FFCraft-1.5B-GGUF

## Resumen

FFCraft-1.5B es un modelo de lenguaje especializado de 1.500 millones de parámetros, desarrollado por AKMESSI, que convierte peticiones en inglés, a menudo vagas o informales, en comandos FFmpeg listos para producción. Se construye mediante un ajuste fino supervisado (LoRA en bf16) sobre Qwen2.5-Coder-1.5B-Instruct, un modelo base de la familia Qwen2.5 con arquitectura transformer densa y licencia Apache 2.0. El modelo resuelve un problema muy concreto: la brecha entre la intención del usuario y la sintaxis exacta de FFmpeg (códecs, filtros, cálculo de bitrate en dos pasadas, mapeo de pistas), un dominio donde los modelos generalistas fallan con frecuencia.

La versión publicada en este repositorio es la v2 en formato GGUF (Q8_0, 1,6 GB), pensada para inferencia local con llama.cpp u Ollama. Su principal innovación es la capacidad de formular preguntas aclaratorias cuando faltan parámetros críticos (por ejemplo, la duración del vídeo para calcular un límite de tamaño) y de responder directamente cuando la petición ya es completa. Además, se entrenó con aproximadamente un 49 % de las filas sin system prompt, de modo que funciona en una interfaz de chat en blanco sin configuración adicional.

Es relevante ahora porque demuestra que un modelo de 1,5B, ejecutable en una GPU de 4 GB o en CPU, puede superar ampliamente a su base en una tarea técnica acotada cuando el ajuste fino se apoya en datos verificados por ejecución real (ffmpeg 7.0.2 + ffprobe) en lugar de datos sintéticos sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `--ctx-size 2048` |
| Tipos de cuantizacion | GGUF Q8_0 (publicado); el formato GGUF admite otras cuantizaciones via llama.cpp, aunque no se listan en el repo |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,6 GB); el adaptador/base original no se publica en safetensors en este repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer denso con atención causal estándar y RoPE, orientado originalmente a generación de código. Sobre él se aplicó un ajuste fino supervisado con LoRA completo en bf16 (r=32, alpha=64, todas las proyecciones lineales) mediante Unsloth + TRL, con enmascaramiento de pérdida solo en las respuestas del asistente (`train_on_responses_only`). El entrenamiento se ejecutó en una única GPU NVIDIA L4 durante aproximadamente 21 minutos para 3 épocas, con una pérdida de validación que descendió de 0,0124 a 0,00397.

El conjunto de datos consta de 6.000 conversaciones (5.160 de entrenamiento, 420 de validación, 420 de test), con un 68 % centrado en codificación de vídeo (niveles de calidad CRF, límites de tamaño con VBR de dos pasadas, escalado, FPS, formato 9:16 para redes sociales, remux, recorte, concatenación, ProRes/DNxHR, NVENC/QSV) y un 32 % en audio (`loudnorm`, extracción y conversión, podcast), GIF/WebP con paleta optimizada, subtítulos (soft y burn-in), marcas de agua y mapeo de pistas múltiples en MKV. Cada patrón de comando fue verificado localmente contra medios sintéticos reales con ffmpeg 7.0.2 y ffprobe. Un 49,1 % de las filas de entrenamiento omiten el system prompt, lo que habilita el uso sin configuración.

## Capacidades

- Generación de comandos FFmpeg completos y ejecutables para vídeo, audio, subtítulos, GIF/WebP y mapeo de pistas.
- Cálculo de bitrate para límites de tamaño de archivo mediante VBR de dos pasadas (incluye margen de seguridad para el contenedor).
- Formulación de preguntas aclaratorias (1 a 3) cuando faltan parámetros críticos, como duración o prioridad de reproducción.
- Respuesta directa e inmediata cuando la petición ya contiene los parámetros necesarios.
- Funcionamiento sin system prompt (zero-config) gracias al dropout de system prompt durante el entrenamiento.
- Razonamiento multi-turno para refinar una petición hasta obtener el comando óptimo.
- Explicación breve en inglés llano del comando generado (1 a 2 líneas).
- Cobertura de códecs y herramientas: H.264, H.265, ProRes, DNxHR, NVENC, QSV, AAC, `loudnorm`, `ffprobe`.
- No se documentan capacidades de tool calling, visión, audio de entrada ni agentes autónomos más allá de la conversación multi-turno.

## Casos de uso

- Asistencia a creadores de contenido: un usuario describe de forma informal un vídeo que quiere comprimir para una plataforma concreta y el modelo devuelve el comando con el bitrate calculado para ese límite de tamaño.
- Automatización de pipelines de conversión: integración del modelo como generador de comandos en un script que procesa lotes de vídeo, aprovechando su conocimiento de presets, CRF y VBR de dos pasadas para estandarizar la salida.
- Herramienta de línea de comandos con interfaz conversacional: envolver el modelo en un CLI o chat local (llama.cpp, Ollama) para que usuarios sin experiencia en FFmpeg obtengan comandos correctos sin consultar documentación.
- Normalización de audio para podcast: generación de cadenas con `loudnorm`, extracción y conversión de pistas, útil para emisoras que necesitan cumplir estándares de sonoridad.
- Preparación de vídeo para redes sociales: comandos con escalado a 9:16, ajuste de FPS y límites de tamaño para plataformas con restricciones estrictas.
- Subtitulado y marcas de agua: generación de comandos para incrustar subtítulos (soft o burn-in) y superponer marcas de agua en flujos de postproducción.
- Remux y edición sin pérdida: conversión de contenedores (MKV a MP4) con `-c copy`, recorte y concatenación para archivos de archivo o distribución.
- Entornos con hardware limitado: despliegue en estaciones de trabajo con GPU de 4 GB o en CPU para equipos de edición que no pueden ejecutar modelos mayores.

## Benchmarks y rendimiento

Evaluación sobre 60 tareas reales reservadas, en 7 categorías de FFmpeg, con la misma cuantización Q8_0 y verificación por ejecución real con ffmpeg + ffprobe.

Con system prompt de FFmpeg:

| Metrica | Base Qwen2.5-Coder-1.5B (Q8_0) | FFCraft-1.5B v2 (Q8_0) | Mejora |
|---|---:|---:|---:|
| Pass real de ffmpeg + ffprobe | 43,3 % (26/60) | 96,7 % (58/60) | +53,4 pts |
| Smart-Ask Rate (prompts vagos) | 0,0 % (0/22) | 100,0 % (22/22) | +100,0 pts |
| Direct-Answer Rate (prompts claros) | 100,0 % (38/38) | 100,0 % (38/38) | — |
| Best-Practice Lint Clean | 83,3 % (50/60) | 100,0 % (60/60) | +16,7 pts |

Sin system prompt (interfaz de chat en blanco):

| Metrica | Base Qwen2.5-Coder-1.5B (Q8_0) | FFCraft-1.5B v2 (Q8_0) | Mejora |
|---|---:|---:|---:|
| Pass real de ffmpeg + ffprobe | 28,3 % (17/60) | 95,0 % (57/60) | +66,7 pts |
| Smart-Ask Rate (prompts vagos) | 0,0 % (0/22) | 100,0 % (22/22) | +100,0 pts |
| Direct-Answer Rate (prompts claros) | 60,5 % (23/38) | 100,0 % (38/38) | +39,5 pts |
| Best-Practice Lint Clean | 61,7 % (37/60) | 100,0 % (60/60) | +38,3 pts |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 1,6 GB; con overhead de contexto y runtime de llama.cpp, el consumo se sitúa en torno a 2-3 GB en GPU.
- GPU recomendadas: cualquier GPU con 4 GB o más; el autor cita una AMD Radeon RX 6400 (4 GB) vía Vulkan funcionando a 50+ tokens/s.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más (RX 6400, GTX 1650, RTX 3050, etc.); también funciona en CPU.
- Despliegue: llama.cpp (`llama-server`), Ollama (con el `Modelfile` incluido); no se documentan vLLM ni TGI para este repo GGUF.
- Latencia y throughput: 50+ tokens/s en GPU de gama de entrada según el autor; el contexto de ejemplo es de 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---:|---|---|---|---|
| FFCraft-1.5B v2 | 1,5B | no disponible (ejemplo 2048) | FFmpeg especializado | Apache 2.0 | GGUF |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en la informacion | Codigo generalista | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la informacion | Proposito general | Apache 2.0 | safetensors, GGUF |

La comparación directa con el modelo base muestra una mejora de 53,4 puntos en la tasa de comandos ejecutables correctamente (con system prompt) y de 66,7 puntos sin system prompt. Frente a modelos generalistas del mismo tamaño, FFCraft-1.5B sacrifica amplitud de dominio a cambio de una precisión muy alta en tareas de FFmpeg. No se dispone de datos de benchmarks frente a alternativas especializadas en FFmpeg en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: está entrenado exclusivamente para FFmpeg; su rendimiento en otras tareas de código o conversación general no está evaluado y probablemente sea inferior al de su base.
- Solo inglés: la model card declara únicamente `en`; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación en opciones poco frecuentes de FFmpeg no cubiertas por el conjunto de entrenamiento; los comandos deben validarse antes de ejecutarse en producción.
- El contexto de ejemplo es de 2048 tokens; conversaciones muy largas o prompts con mucho contexto pueden truncarse.
- Dependencia de la versión de FFmpeg: los comandos se verificaron con ffmpeg 7.0.2; opciones obsoletas o renombradas en otras versiones pueden fallar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte ni auditoría de seguridad de los comandos generados.
- No se documentan sesgos específicos más allá de los heredados del modelo base Qwen2.5-Coder.
- El repositorio solo publica pesos GGUF Q8_0; no se ofrecen otras cuantizaciones ni los pesos en safetensors del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AKMESSI/FFCraft-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- FFmpeg: https://ffmpeg.org
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
