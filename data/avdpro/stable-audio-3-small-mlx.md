# Avdpro/Stable-Audio-3-Small-MLX

# Stable Audio 3 Small MLX

## Resumen
Stable Audio 3 Small MLX es una conversión de los tensores oficiales del modelo de generación de audio Stable Audio 3 (variante Small) de Stability AI al formato MLX, publicada por el usuario Avdpro. El repositorio contiene pesos ya optimizados para MLX, sin conversión ni modificación de tensores por parte del publicador, y está pensado para su instalación, evaluación y prueba en equipos Apple Silicon. El pipeline declarado es `text-to-audio` y cubre dos usos: música y efectos de sonido (SFX).

El paquete no es un modelo nuevo, sino una distribución de pesos: el autor indica que los tensores provienen del repositorio oficial `stabilityai/stable-audio-3-optimized` (revisión `da6edc54`) y que el código de inferencia de referencia está en el repositorio `Stability-AI/stable-audio-3`. La distribución la realiza AI2Apps para instalación, evaluación y pruebas no comerciales.

La relevancia actual del repositorio es de nicho: permite ejecutar Stable Audio 3 con la librería MLX y aprovechar la memoria unificada de los Mac con chip de la serie M, sin depender de CUDA. El repositorio ocupa 2,6 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de un artefacto poco validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente con transformer de difusión (DiT) para música y SFX, codificador de texto T5Gemma y decodificador de autoencoder (`same_s_decoder`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Tensores en f16 (DiT y T5Gemma) y f32 (decodificador del autoencoder); no se documentan cuantizaciones de menor precisión |
| Idiomas soportados | no disponible |
| Licencia | `other` (Stability AI Community License + términos de Gemma, `stability-ai-community-and-gemma`) |
| Formato de pesos | `.npz` (tensores MLX), sin safetensors ni GGUF |
| Modalidad | text-to-audio (música y efectos de sonido) |
| Duración de audio generada | no disponible |
| Frecuencia de muestreo de salida | no disponible |
| Librería | MLX |
| Tamaño del repositorio | 2,6 GB |
| Fecha de creación (según HuggingFace) | 2026-10-05 |

## Arquitectura y entrenamiento
La información disponible no describe el proceso de entrenamiento, el número de tokens, la composición del dataset ni el uso de RLHF o DPO. Lo que se puede deducir de los nombres de fichero es la topología del sistema de inferencia: un transformer de difusión para música (`MLX/dit_sm-music_f16.npz`) y otro para efectos de sonido (`MLX/dit_sm-sfx_f16.npz`), ambos en precisión f16; un codificador de texto T5Gemma (`MLX/t5gemma_f16.npz`); y un decodificador de autoencoder en f32 (`MLX/same_s_decoder_f32.npz`). Se trata, por tanto, de un esquema de difusión en espacio latente con dos cabezas o checkpoints diferenciados según el dominio de audio.

Un detalle operativo relevante es que la generación solo con texto no requiere el codificador de audio, mientras que las rutas de música y SFX sí necesitan tanto T5Gemma como el decodificador. El autor afirma explícitamente que no se ha realizado ninguna conversión ni modificación de tensores respecto al snapshot oficial optimizado para MLX, por lo que el comportamiento del modelo debería coincidir con el de la versión de Stability AI.

## Capacidades
- Generación de audio musical a partir de descripciones textuales (checkpoint `dit_sm-music`).
- Generación de efectos de sonido (SFX) a partir de texto (checkpoint `dit_sm-sfx`).
- Generación condicionada únicamente por texto, sin necesidad del codificador de audio.
- Ejecución sobre MLX, aprovechando la memoria unificada de los chips Apple Silicon.
- Uso de codificador de texto T5Gemma para la interpretación del prompt.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento (thinking), entrada de audio, visión ni otras modalidades.
- No se documenta cobertura multilingüe de los prompts.

## Casos de uso
- Producción musical de maquetas: generar fragmentos instrumentales a partir de una descripción textual para validar una idea antes de grabar, usando el checkpoint de música y el codificador T5Gemma.
- Diseño de sonido para videojuegos: crear efectos puntuales (impactos, ambientes, transiciones) con el checkpoint SFX en lugar de recurrir a librerías de samples.
- Prototipado de postproducción de vídeo: iterar rápidamente sobre la banda sonora o los efectos de una escena y exportar el resultado para revisión del equipo creativo.
- Investigación y docencia en modelos generativos de audio: al ser pesos MLX sin modificar, sirve para reproducir resultados del modelo oficial y comparar el comportamiento entre backends (MLX frente a PyTorch/CUDA).
- Desarrollo de aplicaciones macOS nativas de audio: integrar la generación mediante la librería MLX en herramientas de escritorio que ya corren en Apple Silicon.
- Evaluación interna de modelos de audio: usar el repositorio como snapshot congelado para pruebas de calidad, latencia y consumo de memoria en hardware de Apple.
- Creación de podcasts y contenido sonoro: generar sintonías y cortinillas a medida, sujeto en todo caso a las restricciones de licencia del modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Al tratarse de pesos MLX, la inferencia está atada a hardware Apple Silicon (chips de la serie M) y a macOS; no hay ruta documentada para CUDA ni para CPU x86.
- Huella de pesos: el repositorio ocupa 2,6 GB, por lo que se necesita aproximadamente esa cantidad de memoria unificada para cargar los tensores, más el espacio adicional para activaciones y buffers de audio.
- Como referencia orientativa, un Mac con 16 GB de memoria unificada debería poder alojar el modelo, aunque no hay cifras oficiales de consumo máximo publicadas en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada; el entorno objetivo es Apple Silicon.
- ¿Cabe en GPU de consumo? Solo aplica a GPUs integradas de Apple; no se documenta compatibilidad con RTX 4090 u otras GPUs de consumo con CUDA.
- Opciones de despliegue: librería MLX con el código de inferencia del repositorio `Stability-AI/stable-audio-3`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de difusión de audio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Audio 3 Small MLX (este repositorio) | no disponible | Texto a música y SFX | Stability AI Community License + términos de Gemma | Pesos MLX en HuggingFace (Avdpro) |
| Stable Audio 3 Optimized (stabilityai) | no disponible | Texto a audio | Stability AI Community License + términos de Gemma | Pesos oficiales en HuggingFace |
| Stable Audio Open 1.0 | no disponible | Texto a audio (música y samples) | Stability AI Community License | Pesos públicos en HuggingFace |
| MusicGen (Meta) | no disponible | Texto a música | CC-BY-NC 4.0 (uso no comercial) | Pesos públicos en HuggingFace |

Los datos de parámetros y de rendimiento de las alternativas no están disponibles en la información proporcionada y no se han verificado en este documento; la comparación se limita, por tanto, a la modalidad, la licencia y la vía de distribución.

## Limitaciones y advertencias
- Licencia restrictiva: el repositorio se distribuye solo para instalación, evaluación y pruebas no comerciales. El uso comercial se rige por los términos originales de Stability AI, que exigen registro y, en su caso, una licencia separada.
- Los términos de Gemma también se aplican e incorporan restricciones de uso adicionales; es obligatorio revisar `LICENSE.md`, `LICENSE_GEMMA.md` y el fichero `Notice` antes de cualquier despliegue.
- No hay información sobre sesgos del modelo, ya que el autor no publica evaluación alguna en este repositorio.
- Riesgo de artefactos y de contenido no fiel al prompt: es un comportamiento habitual en modelos de difusión y no hay métricas publicadas que lo cuantifiquen aquí.
- Riesgo de memorización y de similitud con material protegido en la generación de música; no se documenta ningún filtro o mitigación en esta distribución.
- Cobertura de idiomas de los prompts: no disponible. No se puede asumir buen comportamiento fuera del inglés sin pruebas propias.
- Limitaciones de duración y de frecuencia de muestreo del audio generado: no disponibles.
- Dependencia de plataforma: los pesos MLX no son portables a CUDA ni a CPU x86, lo que limita su uso en clústeres de GPU convencionales.
- Artefacto sin validación comunitaria en el momento de redactar la ficha: cero descargas y cero valoraciones registradas.
- El autor declara que no ha modificado los tensores, pero la responsabilidad de verificar la integridad de los ficheros recae en quien los descarga.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/Avdpro/Stable-Audio-3-Small-MLX
- Pesos originales optimizados para MLX (Stability AI): https://huggingface.co/stabilityai/stable-audio-3-optimized/tree/da6edc54ddba10bfd79a077102ded687f80e882b
- Código de inferencia upstream: https://github.com/Stability-AI/stable-audio-3/tree/3a82c807b69cf4b7c5c05270011a5d5e47abac18
- Licencia del repositorio: LICENSE.md (referenciado en la model card)
- Términos de Gemma: LICENSE_GEMMA.md (referenciado en la model card)
- Aviso legal: Notice (referenciado en la model card)
