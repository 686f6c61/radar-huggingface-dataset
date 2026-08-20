# npario/MiniMax-Music3-MLX-Serve-8bit

## Resumen

MiniMax Music 3 es un modelo de generación de música texto-a-audio desarrollado por MiniMax AI, capaz de producir canciones completas de hasta cinco minutos condicionadas por letras y una descripción musical detallada. El modelo genera piezas estructuralmente coherentes con voces expresivas, arreglos evolutivos y calidad de audio estable en formato largo. Este repositorio concreto (`npario/MiniMax-Music3-MLX-Serve-8bit`) es una conversión del modelo original para el motor nativo Zig + MLX de `mlx-serve`, específicamente optimizado para ejecución en Apple Silicon.

La conversión aplica cuantización afín de 8 bits (grupo 64) en todos los matmuls reales (LLM, depth decoder, DiT y lm_head), manteniendo en precisión f32 las tablas de embeddings, el encoder de condiciones y el vocoder. Esto reduce el peso total de 57 GB (el repositorio original sube los pesos duplicados) a 13,5 GB en disco. La arquitectura combina un LLM global (Qwen3 8B) con un decoder de profundidad RVQ (0,6B), un DiT de flow-matching (2,4B) y un vocoder Flow-VAE/DAC, permitiendo generar audio estéreo a 44,1 kHz con letras cantadas.

La relevancia actual de este modelo radica en su capacidad para generar canciones completas con estructura y letra en un solo paso, algo que hasta ahora requería sistemas separados o modelos más pequeños. La versión MLX permite ejecutarlo localmente en hardware de Apple sin necesidad de GPUs dedicadas, lo que democratiza el acceso a la generación musical de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Qwen3 8B (LLM global) + RVQ depth decoder (0,6B) + flow-matching DiT (2,4B) + condition encoder + vocoder Flow-VAE/DAC |
| Parametros totales | No disponible (suma de componentes: 8B + 0,6B + 2,4B, sin contar vocoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la duración máxima de audio es 360 segundos, pero el contexto del LLM no se especifica) |
| Tipos de cuantizacion | 8-bit affine, group 64 en matmuls reales; f32 en embeddings, condition encoder y vocoder |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-Music3 Community License (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina varias subredes especializadas. Un LLM global basado en Qwen3 8B (36 capas, vocabulario de 200k) procesa la descripción musical y las letras, generando representaciones latentes. Un decoder de profundidad RVQ de 0,6B (7 codebooks residuales) predice los tokens de audio residuales. Un transformer de flow-matching de 2,4B (36 bloques) modela la difusión para refinar la señal de audio. El condition encoder mezcla estados ocultos y resamplea, mientras que el vocoder (Flow-VAE/DAC) reconstruye la forma de onda final a 44,1 kHz estéreo.

El entrenamiento (según la documentación del modelo original) se realizó con datos de música y letras, aunque no se especifican el número de tokens ni el dataset concreto. No se menciona uso de RLHF o DPO. La conversión para MLX mantiene la paridad con la referencia fp32: prefill cosine 0,9999, encoder de condiciones 0,999999, velocidad DiT 0,999 y vocoder 1,000000. La etapa autoregresiva tarda aproximadamente 44 ms por frame en un Mac M-series, por lo que una canción de un minuto requiere alrededor de un minuto de cómputo LLM más el paso de difusión.

## Capacidades

- Generación de canciones completas con letras (lyric-conditioned) y descripción musical en lenguaje natural.
- Control de estructura mediante etiquetas `[verse]`, `[chorus]`, `[bridge]` etc., que se colocan en líneas separadas de la letra.
- Duración configurable entre 1 y 360 segundos (límite superior; el modelo puede finalizar antes).
- Salida de audio en WAV a 44,1 kHz estéreo.
- No soporta parámetros de estilo tipo ACE-Step (bpm, keyscale, timesignature, vocal_language) – estos campos no existen en este modelo.
- Ejecución local en Apple Silicon mediante `mlx-serve` (motor Zig + MLX) o a través de API HTTP compatible con el endpoint `/v1/audio/music-generations`.

## Casos de uso

- **Producción musical independiente**: un artista puede escribir letras con estructura y una descripción de estilo (p. ej., "upbeat synthwave con bajo potente y pads oníricos") y obtener una demo completa de 60 segundos para evaluar ideas rápidamente.
- **Composición para vídeo**: creadores de contenido pueden generar bandas sonoras originales con letra para vídeos cortos, evitando problemas de derechos de autor.
- **Prototipado de canciones**: equipos de producción pueden iterar sobre variaciones de letra y estilo sin necesidad de músicos humanos para las primeras pruebas.
- **Educación musical**: estudiantes pueden experimentar con estructuras de canción (estrofa, estribillo, puente) y ver cómo cambia la salida al modificar las etiquetas o la descripción.
- **Integración en aplicaciones de escritorio**: desarrolladores pueden usar la API HTTP para integrar generación de música en herramientas de creación de contenido o juegos.
- **Investigación en IA generativa**: el modelo sirve como referencia para estudiar arquitecturas híbridas que combinan LLM, decodificación RVQ y difusión para audio largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (como FAD, CLAP score, o métricas de calidad de audio) en la información disponible. La única métrica reportada es la paridad con la referencia fp32 en los componentes de la conversión:

- Prefill cosine: 0.9999
- Condition encoder: 0.999999
- DiT velocity: 0.999
- Vocoder: 1.000000

La latencia de la etapa autoregressive es de aproximadamente 44 ms por frame en un Mac M-series, lo que implica que una canción de 60 segundos requiere aproximadamente 60 segundos de cómputo LLM más el paso de difusión (tiempo adicional no especificado).

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (M1, M2, M3 o superiores). El motor `mlx-serve` es nativo para macOS.
- **Memoria RAM**: el repositorio pesa 13,5 GB en disco, por lo que se recomienda al menos 16 GB de RAM unificada para cargar los pesos en memoria y ejecutar la inferencia sin swapping.
- **GPU**: no requiere GPU dedicada; utiliza la GPU integrada de Apple Silicon a través de MLX.
- **Opciones de despliegue**: `mlx-serve` (app de escritorio) o servidor HTTP con el binario `mlx-serve`. También se puede reconstruir los pesos desde el repositorio original mediante el script de conversión.
- **Latencia**: la etapa autoregressiva tarda ~44 ms por frame (frame típico de 0,02 s), lo que da un throughput de ~22 frames por segundo. Para una canción de 60 segundos, se estima ~60 s de cómputo LLM más el paso de difusión (no especificado).
- **Almacenamiento**: 13,5 GB de espacio libre en disco.

## Comparativa con modelos similares

No se dispone de datos comparativos numéricos (benchmarks) con otros modelos de generación musical como MusicGen, Stable Audio o AudioLDM. Las diferencias cualitativas basadas en las especificaciones disponibles:

| Modelo | Tamaño | Duración máxima | Condicionamiento | Plataforma |
|---|---|---|---|---|
| MiniMax Music 3 (este repo) | ~11B (componentes) | 360 s | Letras + descripción | Apple Silicon (MLX) |
| MusicGen (Meta) | 1.5B / 3.3B | ~30 s (típico) | Descripción de texto | Multi-GPU |
| Stable Audio (Stability) | ~2.7B | ~95 s | Descripción de texto | GPU (CUDA) |
| AudioLDM 2 | ~0.4B | ~10 s | Descripción de texto | GPU |

MiniMax Music 3 destaca por su longitud máxima (hasta 5 minutos) y la capacidad de condicionar la letra y estructura, mientras que los otros modelos no soportan letras cantadas de forma explícita. No obstante, la comparación cuantitativa en calidad musical no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Licencia**: la licencia es `minimax-music3-community-license` (otra), que no es una licencia open source estándar. Es necesario revisar el texto de la licencia para confirmar los permisos de uso comercial y redistribución. El repositorio incluye una política de uso aceptable como Exhibit A.
- **Idiomas**: no se especifica qué idiomas soporta el modelo para las letras. Puede que funcione mejor en inglés u otros idiomas, pero no hay confirmación oficial.
- **Dependencia de letras**: el modelo es lyric-conditioned, por lo que las letras son obligatorias. No se puede generar música instrumental pura sin proporcionar texto.
- **Control limitado**: no hay parámetros de estilo (BPM, tonalidad, compás) como en otros modelos. El único control es la descripción textual y las etiquetas de estructura.
- **Alucinación y coherencia**: aunque el modelo está diseñado para canciones largas, puede haber problemas de coherencia en la estructura a duraciones extremas (360 s). No se garantiza la calidad en todos los casos.
- **Formato de salida**: solo WAV, sin opción de otros formatos (MP3, FLAC) en la API directa.
- **Riesgo de mal uso**: la generación de música con letras puede infringir derechos de autor si se usa para imitar artistas existentes. El modelo no incluye mecanismos de filtrado de contenido.

## Enlaces

- Repositorio de HuggingFace (esta conversión): https://huggingface.co/npario/MiniMax-Music3-MLX-Serve-8bit
- Repositorio original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- GitHub de MiniMax Music 3: https://github.com/MiniMax-AI/MiniMax-Music3
- GitHub de mlx-serve (motor): https://github.com/ddalcu/mlx-serve
- Script de conversión: https://github.com/ddalcu/mlx-serve/blob/main/scripts/convert_music3_weights.py
- Demo del modelo original: https://minimax-ai.github.io/music3-demo/
- Página de Layer (modelo): https://www.layer.ai/models/minimax-music-3
