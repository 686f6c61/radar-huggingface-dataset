# actnowai/SoulX-Podcast-1.7B-MLX-8bit

## Resumen

SoulX-Podcast-1.7B-MLX-8bit es una conversión a MLX y cuantización a 8 bits del modelo SoulX-Podcast-1.7B de Soul AI Lab (Universidad Politécnica del Noroeste y colaboradores), un sistema de texto a voz diseñado para generar diálogos tipo pódcast con hasta cuatro hablantes. El repositorio lo publica actnowai y está pensado para el motor AudioSmith (Swift + MLX) en su modo de diálogo completo; no es un reemplazo directo del checkpoint oficial en PyTorch.

El modelo combina un LLM Qwen3-1.7B, adaptado con un vocabulario de 159.488 tokens que incluye texto, 6.561 tokens de voz y etiquetas, con el flujo de coincidencia de CosyVoice2, el vocoder HiFT y el codificador de hablante CAM++. La conversión conserva 1.736.041.472 parámetros y ocupa 2,4 GB en el repositorio, con el LLM en 8 bits (grupo 64, escalas bfloat16, 8,5 bits por peso) y los módulos de voz en float32.

Su relevancia es práctica: permite ejecutar un TTS multihablante con clonación de voz en Apple Silicon dentro del ecosistema MLX, con licencia Apache 2.0 y paridad numérica verificada frente a la implementación oficial. Está limitado a chino mandarín e inglés y a las condiciones que documenta la model card; no se han publicado especificaciones de longitud de contexto ni benchmarks estándar de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLM Qwen3-1.7B + flow matching de CosyVoice2 + vocoder HiFT + codificador de hablante CAM++ |
| Parámetros totales | 1.736.041.472 |
| Parámetros activos | No aplica (modelo denso; no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | LLM en 8 bits MLX (group size 64, escalas bfloat16, 8,5 bits por peso); módulos de voz en float32 |
| Idiomas soportados | Chino mandarín e inglés (zh, en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para MLX: `model.safetensors` y `s3gen.safetensors` |

## Arquitectura y entrenamiento

El LLM base es Qwen3-1.7B, con un vocabulario de 159.488 entradas que combina texto, 6.561 tokens de voz y etiquetas; la capa de salida está atada a los embeddings. La generación es por turnos: cada turno asiste a los turnos anteriores y el sistema admite hasta cuatro hablantes. La voz se clona a partir de un clip de referencia corto y su transcripción por hablante.

La parte acústica usa el tokenizador de voz S3 a 25 Hz —no incluido en el repositorio; se indica `mlx-community/S3TokenizerV2`—, flow matching de CosyVoice2 (encoder y decoder CFM), vocoder HiFT y CAM++ para los x-vectors. Según la model card, los pesos de flow, HiFT y CAM++ son byte-idénticos a los de CosyVoice2-0.5B.

La conversión se realizó con `scripts/soulx/convert.py` sobre la revisión `7d381e3aa4f2ac9e23201b57957fd0499f8f2fd1`: `mlx_lm` convert a 8 bits, grupo 64 y bfloat16; renombrado de módulos, plegado de weight norm, transposición de convoluciones al layout de MLX y reconstrucción de las batch norms de CAM++ que el exportador ONNX había plegado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO en el modelo original.

## Capacidades

- Texto a voz para diálogos de hasta cuatro hablantes, con etiquetas de turno del estilo `[S1]`, `[S2]`, etc.
- Clonación de voz few-shot a partir de un clip de referencia corto y su transcripción por hablante.
- Generación turno a turno con acceso a los turnos anteriores, lo que favorece la coherencia de una conversación larga.
- TTS de monólogo: la model card original indica que también rinde en TTS convencional de un solo hablante.
- Idiomas: chino mandarín e inglés; no se documenta soporte de otros idiomas en esta conversión.
- Integración con AudioSmith y `mlx-audio-swift`; no está planteado como una API genérica de TTS.
- No se documenta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo TTS.
- No se documentan capacidades de visión, audio de entrada ni modos de pensamiento.

## Casos de uso

- Producción de pódcast multihablante en local: a partir de un guion con etiquetas `[S1]`–`[S4]` y clips de referencia, generar un episodio en un Mac con MLX; el modo de diálogo completo de AudioSmith está diseñado para este flujo.
- Prototipado de audiolibros y ficción sonora: asignar voces clonadas a personajes y generar escenas turno a turno; la coherencia entre turnos ayuda a mantener el timbre, aunque no hay evaluación perceptual publicada.
- Doblaje y localización zh-en: sintetizar guiones en mandarín e inglés con las mismas voces de referencia; el modelo no traduce, así que el texto debe llegar ya traducido.
- Demostraciones de voz para videojuegos o novelas visuales: generar diálogos de hasta cuatro personajes sin depender de la nube, con coste marginal bajo en Apple Silicon.
- Investigación en TTS multihablante sobre MLX: usar la paridad numérica documentada para comparar la cuantización 8-bit frente a float32 y estudiar el impacto en CER y prosodia.
- Contenido formativo y e-learning: crear conversaciones entre dos presentadores, por ejemplo pregunta-respuesta, para cursos con voces consistentes y guion controlado.
- Accesibilidad y lectura de guiones: convertir guiones o documentos en audio con varias voces; requiere consentimiento para cualquier voz clonada.
- Integración en pipelines Swift/MLX: AudioSmith puede ejecutar el modelo en su motor, útil para aplicaciones de Apple Silicon que necesiten TTS offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de TTS (MOS, WER/CER comparativos) en la información disponible. La model card sí incluye una verificación de paridad numérica frente a la implementación oficial en PyTorch:

| Prueba | Resultado |
|---|---|
| Log-mel 16 kHz / tokens S3 | Diferencia máxima 1,3·10⁻⁴; 100 % de tokens iguales |
| x-vector CAM++ | Coseno 0,999998 |
| Mel de flujo a 24 kHz | Diferencia máxima 1,5·10⁻⁴ |
| IDs de tokens de prompt | Idénticos |
| Logits del LM en float32 | Top 100 idéntico; KL < 10⁻⁴ |
| Este modelo 8-bit frente a float32 | Argmax igual; solapamiento top-100 de 99; KL 0,0014 |
| Muestreo (repetition penalty → temperature → top-k → top-p, RAS) | Puntuaciones procesadas idénticas |
| Flow matching con ruido fijo | Correlación 1,00000 |
| Forma de onda HiFT (sin fase ni ruido aleatorios) | SNR de 52 dB |

El muestreo debe seguir la configuración upstream: repetition penalty 1,25 sobre los tokens del turno actual, temperature 0,6, top-k 100, top-p 0,9, muestreo consciente de repetición (ventana 25, ratio 0,2), entre 8 y 3.000 tokens por turno y parada en el token 151675. La model card indica que omitir temperature y top-k/top-p eleva la tasa de error de caracteres (CER) de aproximadamente un 1 % a un 4–10 %.

## Requisitos de hardware

- Memoria: los pesos del LLM en 8 bits ocupan aproximadamente 1,84 GB (1.736.041.472 × 8,5/8 bits); el repositorio completo son 2,4 GB y `s3gen` va en float32. No hay cifra oficial de memoria en ejecución; una estimación prudente es 4–6 GB de memoria unificada, pero no está confirmada.
- Plataforma: MLX sobre Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se puede ejecutar directamente en CUDA.
- GPU recomendadas: no aplica GPU NVIDIA; se recomienda un Mac con al menos 16 GB de memoria unificada. Para lotes o diálogos largos, 32 GB o más.
- ¿Cabe en hardware de consumo? Sí, en Apple Silicon de consumo con 16 GB o más; no en GPU NVIDIA de consumo por el formato MLX.
- Despliegue: AudioSmith (Swift + MLX), `mlx-lm` y `mlx-audio-swift`; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Requiere descargar aparte `mlx-community/S3TokenizerV2`.
- Almacenamiento: 2,4 GB de repositorio, más el tokenizador S3.
- Latencia y throughput: no disponibles; no se publica RTF ni tokens/s. El tokenizador S3 opera a 25 Hz, pero no implica una latencia de síntesis concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|---|
| Este modelo (actnowai, MLX 8-bit) | 1.736.041.472 | No disponible | zh, en | Apache 2.0 | safetensors MLX; Apple Silicon | Conversión 8-bit para AudioSmith; no es drop-in del checkpoint oficial |
| Soul-AILab/SoulX-Podcast-1.7B | 1,7B | No disponible | zh, en | Apache 2.0 | PyTorch | Checkpoint oficial; referencia de paridad de esta conversión |
| FunAudioLLM/CosyVoice2-0.5B | 0,5B | No disponible | No disponible en la información | No disponible en la información | PyTorch | Proporciona flow matching, HiFT y S3; no es un modelo de diálogo multihablante tipo pódcast, pero sus pesos de flow, HiFT y CAM++ son la base byte-idéntica de esta conversión |

## Limitaciones y advertencias

- No es un reemplazo directo del checkpoint PyTorch: está acoplado al motor AudioSmith y a `mlx-audio-swift`.
- Solo funciona en Apple Silicon mediante MLX; no hay soporte directo para CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Requiere descargar aparte el tokenizador S3 (`mlx-community/S3TokenizerV2`), que no está incluido.
- Idiomas limitados a chino mandarín e inglés; no se documenta dialecto, code-switching ni otros idiomas. La página del proyecto menciona dialectos, pero esta conversión no lo detalla.
- No hay datos de longitud de contexto; no se puede garantizar estabilidad en diálogos muy largos. La página del proyecto afirma más de 60 minutos con consistencia de voz, pero no hay verificación independiente para esta conversión.
- La cuantización 8-bit presenta una divergencia KL de 0,0014 y un solapamiento top-100 de 99 frente a float32; no hay MOS ni evaluación perceptual publicada, por lo que puede existir una degradación sutil.
- El muestreo debe respetar la configuración upstream; omitir temperature y top-k/top-p eleva el CER de aproximadamente un 1 % a un 4–10 %.
- Clonación de voz: no se debe clonar la voz de nadie sin consentimiento, ni suplantar personas, ni usar el modelo para fraude, engaño o fines ilegales. La responsabilidad legal recae en quien genera el audio.
- No se han publicado evaluaciones de sesgo; la calidad y el timbre dependen del clip de referencia y de su transcripción, y pueden reproducir características del hablante de referencia.
- En TTS, el riesgo de “alucinación” se traduce en errores de pronunciación, omisiones, repeticiones o prosodia incorrecta; no hay métricas publicadas de fidelidad al texto.
- La licencia Apache 2.0 permite uso comercial con atribuciones, pero deben revisarse `LICENSE` y `NOTICE`; los derechos sobre las voces clonadas son independientes de la licencia del modelo.
- La model card original pide uso de investigación y uso legítimo; conviene revisar las condiciones del modelo base antes de desplegarlo en producción.

## Enlaces

- [HuggingFace: actnowai/SoulX-Podcast-1.7B-MLX-8bit](https://huggingface.co/actnowai/SoulX-Podcast-1.7B-MLX-8bit)
- [HuggingFace: Soul-AILab/SoulX-Podcast-1.7B](https://huggingface.co/Soul-AILab/SoulX-Podcast-1.7B)
- [GitHub: Soul-AILab/SoulX-Podcast](https://github.com/Soul-AILab/SoulX-Podcast)
- [Página del proyecto SoulX-Podcast](https://soul-ailab.github.io/soulx-podcast/)
- [Space: SoulX-Podcast-1.7B](https://huggingface.co/spaces/Soul-AILab/SoulX-Podcast-1.7B)
- [GitHub: AudioSmith](https://github.com/hehehai/AudioSmith)
- [Script de conversión de AudioSmith](https://github.com/hehehai/AudioSmith/blob/main/scripts/soulx/convert.py)
- [HuggingFace: mlx-community/S3TokenizerV2](https://huggingface.co/mlx-community/S3TokenizerV2)
- [HuggingFace: FunAudioLLM/CosyVoice2-0.5B](https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B)
- [GitHub: FunAudioLLM/CosyVoice](https://github.com/FunAudioLLM/CosyVoice)
- [GitHub: modelscope/3D-Speaker](https://github.com/modelscope/3D-Speaker)
- [GitHub: QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- [GitHub: ml-explore/mlx](https://github.com/ml-explore/mlx)
- [GitHub: ml-explore/mlx-lm](https://github.com/ml-explore/mlx-lm)
- [GitHub: Blaizzy/mlx-audio-swift](https://github.com/Blaizzy/mlx-audio-swift)
- [arXiv 2510.23541](https://arxiv.org/abs/2510.23541)
- [Repositorio alternativo: Williamluo128/soulx-podcast](https://github.com/Williamluo128/soulx-podcast)
