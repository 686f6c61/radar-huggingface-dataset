# mlx-community/Audio8-TTS-Preview-0.1b-bf16

## Resumen

Audio8-TTS-Preview-0.1b es un modelo de síntesis de voz (text-to-speech) de aproximadamente 170 millones de parámetros, desarrollado por Audio8 AI y convertido al formato MLX por la comunidad (mlx-community) para ejecutarse en Apple Silicon. Se trata de un modelo compacto y multilingüe que ofrece clonación de voz zero-shot (sin necesidad de entrenamiento previo) e incluye un codec neuronal de 44,1 kHz integrado. Su arquitectura combina un bloque lento híbrido Falcon-H1 (con mezclador Mamba-2, atención y MLP por capa) con un bloque rápido autorregresivo de 4 capas que predice los 10 codebooks por frame.

La relevancia de este modelo radica en su tamaño reducido frente a alternativas de mayor escala: permite ejecutar TTS de alta calidad con clonación de voz en hardware de consumo de Apple, aunque con una calidad ligeramente inferior a la versión 0.6b del mismo fabricante. Su licencia es la Audio8 Community License v1.0, que limita el uso comercial a empresas con ingresos anuales inferiores a 2 millones de dólares. El modelo soporta ocho idiomas, con chino e inglés como lenguas principales y el resto en estado experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | arktts con slow stack híbrido Falcon-H1 (Mamba-2 + attention + MLP) y fast AR de 4 capas |
| Parametros totales | 169.779.904 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 para el modelo de lenguaje; codec en fp32 |
| Idiomas soportados | zh, en (principales); de, es, fr, it, ja, ko (experimental) |
| Licencia | Audio8 Community License v1.0 (custom, con límite de ingresos) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `arktts`, que separa la generación de voz en dos etapas: un bloque lento (slow stack) que procesa la secuencia completa de texto y audio de referencia, y un bloque rápido (fast AR) que predice los codebooks del codec neuronal de forma autorregresiva. La particularidad de esta versión 0.1b es que el bloque lento emplea un diseño híbrido Falcon-H1, donde cada capa combina un mezclador Mamba-2, una capa de atención y una MLP. El bloque rápido consta de 4 capas y predice 10 codebooks por frame de audio.

No se ha publicado información detallada sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica que el checkpoint es una conversión MLX del modelo original de Audio8, y que la paridad con la referencia PyTorch se verificó en términos de embeddings, logits y generación de audio (con errores máximos del orden de 1e-5). Un detalle técnico destacable es que el factor `embedding_multiplier` (0,10888671875) debe aplicarse a la suma del embedding de texto y los embeddings de los codebooks, no solo al lookup de tokens, para mantener la paridad exacta.

## Capacidades

- Síntesis de voz multilingüe: genera audio a partir de texto en ocho idiomas, con mayor calidad en chino e inglés.
- Clonación de voz zero-shot: dada una referencia de audio y su transcripción, el modelo replica la voz sin entrenamiento adicional.
- Codec neuronal integrado: incluye un codec de 44,1 kHz en fp32 que codifica y decodifica el audio de forma eficiente.
- Voz por defecto: si no se proporciona audio de referencia, el modelo sintetiza con una voz predeterminada.
- Inferencia determinista: se ha verificado que la generación es token-exacta respecto a la referencia PyTorch.
- Compatible con el ecosistema mlx-audio: se integra con la librería de TTS de MLX para Apple Silicon.

## Casos de uso

- Audiobooks y narración de contenido largo: el modelo puede generar narración continua en varios idiomas, y su tamaño compacto permite ejecutarlo en portátiles Apple sin necesidad de servidores dedicados.
- Asistentes de voz en aplicaciones móviles: al ser ligero (7,59 GB de memoria pico), puede integrarse en apps de iOS o macOS para ofrecer respuestas habladas en tiempo real.
- Doblaje de vídeos y contenido multimedia: la clonación zero-shot permite doblar voces de actores o crear narraciones personalizadas para vídeos de YouTube, cursos o demos.
- Accesibilidad para personas con discapacidad visual: puede convertir texto de artículos, libros o interfaces en voz natural, con soporte multilingüe.
- Prototipado rápido de productos TTS: los desarrolladores pueden evaluar la calidad de la síntesis y la clonación de voz sin invertir en infraestructura de GPU, usando únicamente hardware Apple.
- Generación de contenido educativo: creación de lecciones de idiomas, podcasts o materiales de aprendizaje con voces sintéticas y clonación de voces de instructores.
- Chatbots con voz en atención al cliente: integración en sistemas de soporte que requieren respuestas habladas personalizadas, aprovechando la clonación para mantener una identidad de marca consistente.

## Benchmarks y rendimiento

La model card reporta métricas de similitud de voz (Seed-TTS SIM) y rendimiento en comparación con la versión 0.6b del mismo modelo. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que se trata de un modelo de audio.

| Metrica | Audio8-TTS-Preview-0.1b | Audio8-TTS-Preview-0.6b |
|---|---|---|
| Seed-TTS SIM (EN) | 56,7 | 63,2 |
| Seed-TTS SIM (ZH) | 68,2 | 73,1 |
| RTF (factor de tiempo real) | 0,28 | 0,33 |
| Memoria pico | 7,59 GB | 8,17 GB |
| Tamano del repo | 1,7 GB | 2,6 GB |

Estos datos indican que el modelo 0.1b es aproximadamente un 15% más rápido y consume un 7% menos memoria que el 0.6b, a costa de una menor similitud de voz en la clonación.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (M1 o posterior), ya que el formato MLX no es compatible con GPUs NVIDIA o AMD.
- Memoria: se requiere al menos 8 GB de RAM unificada (la memoria pico medida es de 7,59 GB). Se recomienda 16 GB para mayor margen.
- Almacenamiento: 1,7 GB de espacio en disco para los pesos del modelo.
- Despliegue: mediante la librería `mlx-audio` (instalable desde PyPI o desde el repositorio de GitHub). Se requiere una versión con soporte para `slow_backbone: falcon_h1`, que actualmente solo está disponible instalando desde la rama `main` del repositorio.
- Latencia: RTF de 0,28, lo que significa que puede generar 1 segundo de audio en aproximadamente 0,28 segundos en un Apple Silicon de gama media.
- No requiere GPU dedicada, pero el rendimiento escala con el número de núcleos del chip (M1 Pro, M1 Max, M2, M3, etc.).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Audio8-TTS-Preview-0.1b (MLX) | 169,8M | no disponible | 8 (2 principales) | Audio8 Community v1.0 | safetensors (MLX) |
| Audio8-TTS-Preview-0.6b (MLX) | ~600M | no disponible | 11 | Apache-2.0 (codec) / Audio8 Community (LM) | safetensors (MLX) |
| XTTS v2 (Coqui) | ~400M | no disponible | 17 | CPML (uso comercial restringido) | PyTorch / ONNX |

El modelo 0.1b se posiciona como la opción más ligera dentro de la familia Audio8, sacrificando calidad de clonación (similitud de voz) y cobertura de idiomas frente al 0.6b. Comparado con XTTS v2, ofrece un formato MLX nativo para Apple Silicon (sin necesidad de conversión manual) y un codec integrado, aunque la licencia de Audio8 impone límites de ingresos para uso comercial que XTTS no tiene.

## Limitaciones y advertencias

- Licencia restrictiva: la Audio8 Community License v1.0 permite uso comercial solo a empresas con ingresos anuales inferiores a 2 millones de dólares. Por encima de ese umbral se requiere una licencia escrita separada de Audio8.
- Idiomas no primarios: alemán, español, francés, italiano, japonés y coreano están marcados como experimentales; la calidad de síntesis y la robustez son inferiores a las del modelo 0.6b en esos idiomas.
- Requisito de versión de mlx-audio: la versión publicada de mlx-audio (≥0.4.7) no soporta la arquitectura Falcon-H1; es necesario instalar desde la rama `main` del repositorio de GitHub, lo que puede introducir inestabilidad.
- Riesgo de alucinación auditiva: como todos los modelos TTS, puede generar pronunciaciones incorrectas o artefactos en palabras poco comunes, especialmente en idiomas no primarios.
- Sin soporte para otros tipos de entrada: el modelo solo acepta texto y audio de referencia; no maneja imágenes, vídeo ni otras modalidades.
- No es una alternativa ligera en memoria: a pesar de tener 3,5 veces menos parámetros que el 0.6b, la memoria pico solo se reduce un 7% porque el codec fp32 (1,35 GB) domina el consumo.
- La fecha de creación del repositorio (2026-08-30) es posterior a la fecha actual, lo que sugiere que el modelo podría estar en fase de prelanzamiento o que la fecha es incorrecta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Audio8-TTS-Preview-0.1b-bf16
- Modelo original (Audio8): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Versión 0.6b en MLX: https://huggingface.co/mlx-community/Audio8-TTS-Preview-0.6b-bf16
- Repositorio de Audio8 TTS en GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Librería mlx-audio en GitHub: https://github.com/Blaizzy/mlx-audio
- Página de preview de Audio8 TTS: https://audio8-ai.github.io/Audio8_TTS/
