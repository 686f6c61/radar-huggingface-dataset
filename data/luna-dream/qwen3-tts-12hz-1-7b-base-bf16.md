# Luna-Dream/Qwen3-TTS-12Hz-1.7B-Base-bf16

## Resumen

Luna-Dream/Qwen3-TTS-12Hz-1.7B-Base-bf16 es una conversión al formato MLX del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, publicada por el usuario Luna-Dream (el README interno hace referencia a `mlx-community`, lo que sugiere una réplica o reempaquetado de una conversión previa). El modelo original pertenece a la familia Qwen3-TTS de Alibaba Qwen y está orientado a generación de voz y clonación de voz a partir de audio de referencia. Esta variante concreta existe para ejecutar el modelo en Apple Silicon mediante la librería `mlx-audio`, no para GPU NVIDIA ni para servidores x86 convencionales.

El peso real declarado en los safetensors es de 1.928.677.440 parámetros (aproximadamente 1,93 mil millones), con un repositorio de 4,5 GB en precisión bf16. La licencia declarada es Apache 2.0. El sufijo "12Hz" del nombre corresponde a la nomenclatura del modelo original de Qwen y no se detalla en la información disponible qué implica exactamente a nivel de arquitectura o de tasa de tokens de audio.

Su relevancia es acotada: se trata de una conversión comunitaria con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación propia más allá de las instrucciones de uso de `mlx-audio`. Resulta útil para quien quiera probar Qwen3-TTS en un Mac con MLX sin hacer la conversión por su cuenta, pero no debe tratarse como una distribución oficial ni como una versión validada del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo de text-to-speech de la familia Qwen3-TTS, convertido a MLX |
| Parámetros totales | 1.928.677.440 (≈1,93 B), según safetensors |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (única variante en este repositorio); no se listan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (bf16); tamaño del repo 4,5 GB |
| Pipeline | text-to-speech |
| Librería | mlx-audio (versión usada en la conversión: 0.3.0) |
| Plataforma | Apple Silicon (MLX); no compatible de forma nativa con CUDA |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-19 |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles de arquitectura interna (número de capas, tipo de decoder, codec de audio, mecanismo de atención) ni del proceso de entrenamiento del modelo original. Lo único verificable es que se trata de un sistema de text-to-speech de la familia Qwen3-TTS con 1,93 B de parámetros, empaquetado en bf16 y convertido a MLX con `mlx-audio` 0.3.0. El nombre "12Hz" forma parte de la denominación del checkpoint original de Qwen y no viene acompañado de explicación técnica en la documentación disponible.

Tampoco se documentan aquí los datos de entrenamiento (número de tokens, composición del corpus, horas de audio), la existencia de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Cualquier afirmación al respecto requeriría consultar la model card original de Qwen/Qwen3-TTS-12Hz-1.7B-Base, que no forma parte de la información suministrada.

## Capacidades

- Generación de voz a partir de texto (text-to-speech), según el pipeline declarado y la etiqueta `text-to-speech`.
- Clonación de voz: el ejemplo de Python de la model card acepta un parámetro `ref_audio` con la ruta a un WAV de referencia, y el repositorio incluye la etiqueta `voice cloning`.
- Generación de audio por línea de comandos mediante `python -m mlx_audio.tts.generate`, con prefijo de fichero de salida configurable.
- Uso programático desde Python con `load_model` y `generate_audio` de `mlx_audio.tts`.
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio de entrada como transcripción (ASR) ni modos de "thinking".
- Cobertura multilingüe: no disponible.

## Casos de uso

- Pruebas de concepto de TTS en local sobre Mac: cargar el modelo con `mlx_audio.tts.utils.load_model` y generar locuciones sin enviar texto a un servicio externo, útil para entornos con requisitos de privacidad.
- Clonación de voz para prototipos: usar `ref_audio` con una muestra corta del hablante objetivo y generar nuevas frases con esa timbre, aprovechable en demos de doblaje o audiolibros antes de invertir en un modelo validado en producción.
- Generación de borradores de narración para vídeo o podcast: producir pistas de voz preliminares que luego se sustituyen por grabación humana, agilizando la revisión de guiones.
- Aumento de datos sintéticos para entrenar sistemas ASR: generar corpus de audio etiquetado con distintas voces de referencia para ampliar la cobertura acústica de un dataset, siempre que la licencia del modelo original lo permita.
- Accesibilidad y lectura en voz alta en aplicaciones macOS: integrar el modelo en una app de escritorio que lea documentos largos por fragmentos, al ejecutarse de forma local y sin coste por token.
- Locuciones para prototipos de videojuegos o interfaces conversacionales: generar líneas de voz temporales para personajes o avisos de interfaz durante el desarrollo, con la salvedad de que no hay métricas publicadas de calidad.
- Evaluación comparativa interna de modelos TTS: servir como uno de los candidatos en una batería de pruebas de naturalidad y prosodia frente a otras alternativas, dado su tamaño moderado y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas objetivas (MOS, WER, similitud de hablante) ni comparaciones con otros sistemas TTS, y los resultados de búsqueda web obtenidos no guardan relación con el modelo (corresponden a Amazon Luna, LUNA de Universal Audio y la deidad romana Luna), por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia en bf16: aproximadamente 3,9 GB solo para los pesos (1,93 B × 2 bytes), más overhead de activaciones y del códec de audio; el repositorio completo ocupa 4,5 GB en disco. Conviene reservar entre 5 y 6 GB de memoria unificada para trabajar con margen.
- GPU: el formato MLX está pensado para Apple Silicon (series M1, M2, M3 y M4). No es ejecutable de forma nativa en CUDA (A100, H100, RTX 4090) sin reconvertir los pesos al formato del modelo original.
- Cabe en equipos de consumo: cualquier Mac con 8 GB de memoria unificada o más debería poder cargar los pesos en bf16, aunque el margen es ajustado en configuraciones de 8 GB.
- Despliegue: `mlx-audio` (CLI `python -m mlx_audio.tts.generate` o API de Python). No se documentan aquí opciones con vLLM, llama.cpp, Ollama o TGI, que no soportan este formato tal cual.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo real factor (RTF), tokens de audio por segundo ni rendimiento por chip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Luna-Dream/Qwen3-TTS-12Hz-1.7B-Base-bf16 | 1,93 B | No disponible | Apache 2.0 | safetensors MLX (bf16) | Repositorio comunitario, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base (original) | 1,93 B (mismo checkpoint de origen) | No disponible | No verificada en la información disponible | No disponible | Modelo de referencia de Qwen |
| Otras alternativas TTS open source (p. ej. XTTS-v2, Kokoro, F5-TTS) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación fiable se limita al modelo original de Qwen, del que esta ficha es una conversión: mismos parámetros y misma tarea, con la diferencia de formato (MLX frente al peso original) y de licencia, que conviene verificar en el repositorio de Qwen porque el campo `license: apache-2.0` de esta réplica no garantiza por sí solo los términos del modelo fuente. No se dispone de datos de benchmarks ni de especificaciones de las alternativas TTS mencionadas dentro de la información proporcionada, por lo que no se establece una comparación cuantitativa.

## Limitaciones y advertencias

- Réplica no oficial: el repositorio pertenece a Luna-Dream, pero el README referencia `mlx-community`; es una conversión comunitaria sin validación por parte de Qwen.
- Sin tracción ni evidencia de uso: 0 descargas y 0 likes en la fecha de creación, sin issues ni discusiones que permitan evaluar su fiabilidad.
- Sin benchmarks: no hay métricas de naturalidad (MOS), inteligibilidad (WER) ni similitud de hablante que respalden la calidad de la conversión frente al modelo original.
- Riesgo de artefactos y errores de pronunciación: al ser un modelo TTS, los fallos se manifiestan como prosodia incorrecta, palabras mal pronunciadas o ruido, no como "alucinaciones" de texto; no hay documentación sobre su comportamiento en textos largos, cifras, siglas o nombres propios.
- Idiomas no declarados: se desconoce qué lenguas cubre y con qué calidad, por lo que no debe asumirse soporte de castellano sin probarlo.
- Clonación de voz: la funcionalidad de `ref_audio` implica riesgos de suplantación y de uso indebido de la voz de terceros; requiere consentimiento explícito y cumplimiento de la normativa aplicable (RGPD y AI Act en la UE).
- Licencia: Apache 2.0 en esta réplica, pero debe comprobarse la licencia del checkpoint original de Qwen antes de un uso comercial, ya que la conversión no altera los términos del modelo fuente.
- Dependencia de plataforma: solo Apple Silicon vía MLX; no hay ruta de despliegue documentada para CUDA ni para servidores de inferencia habituales.
- Sin soporte declarado de contexto largo, tool calling ni agentes: no debe plantearse como sustituto de un LLM, sino como un componente de síntesis de voz dentro de un pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Luna-Dream/Qwen3-TTS-12Hz-1.7B-Base-bf16
- Modelo original de Qwen referenciado en la model card: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio citado en el README de la conversión: https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16
- Documentación o repositorio de la librería `mlx-audio`: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
