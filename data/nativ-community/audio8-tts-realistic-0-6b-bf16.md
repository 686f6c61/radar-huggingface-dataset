# nativ-community/Audio8-TTS-Realistic-0.6b-bf16

## Resumen

Audio8-TTS-Realistic-0.6b-bf16 es una conversión al formato MLX del modelo de síntesis de voz `Edge0/Audio8-TTS-Realistic-0.6b`, publicada por el colectivo `nativ-community`. El modelo genera voz monofónica a 44,1 kHz con capacidad opcional de clonación de voz zero-shot, es decir, puede imitar una voz de referencia a partir de un audio y su transcripción exacta sin necesidad de reentrenamiento. Está pensado para ejecutarse en hardware de Apple Silicon mediante la librería `mlx-audio`, sin requerir PyTorch ni código remoto en tiempo de inferencia.

La relevancia de esta conversión radica en que traslada un modelo TTS multilingüe (23 idiomas, incluidos chino, inglés, japonés, coreano, español, árabe, cantonés y tailandés) al ecosistema MLX, lo que permite inferencia local en Macs con GPU unificada. El repositorio ocupa 2,6 GB y los pesos en safetensors suman 938.556.145 parámetros, coherente con la denominación "0.6b" del nombre base si se tiene en cuenta que parte de esos parámetros corresponden al códec incluido.

La arquitectura declarada es "DualAR" (dual autoregressive), un esquema de dos etapas autoregresivas típico en TTS modernos, con un presupuesto de contexto compartido de 2.048 posiciones entre texto, audio de referencia y frames generados. La licencia Apache 2.0 facilita su uso comercial, aunque la información publicada sobre datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (autoregresiva dual) con codec de audio incluido |
| Parametros totales | 938.556.145 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 posiciones compartidas entre texto, audio de referencia y frames generados |
| Tipos de cuantizacion | bf16 (versión publicada); el codec conserva su precisión original al convertir o cuantizar el modelo DualAR |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx-audio` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura denominada DualAR, consistente en dos etapas autoregresivas encadenadas: una primera etapa que modela la secuencia de tokens semánticos o acústicos a partir del texto y, presumiblemente, una segunda que refina la generación hacia la forma de onda final a través del códec incluido. La salida es voz monofónica a 44,1 kHz, una frecuencia de muestreo alta para TTS que sugiere un códec de alta fidelidad. El contexto de 2.048 posiciones se comparte entre el texto de entrada, el audio de referencia (en caso de clonación) y los frames generados, lo que impone un límite práctico a la duración de las locuciones y de las referencias de voz.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otros ajustes por preferencias. La model card únicamente indica que el códec está incluido y que la inferencia en tiempo de ejecución no requiere PyTorch ni código remoto, lo que simplifica el despliegue y reduce la superficie de dependencias. La conversión a MLX mantiene el códec en su precisión original al cuantizar el modelo DualAR, un detalle relevante para preservar la calidad de audio.

## Capacidades

- Síntesis de voz (text-to-speech) monofónica a 44,1 kHz.
- Clonación de voz zero-shot mediante `ref_audio` y `ref_text` (audio de referencia y su transcripción exacta).
- Multilingüe: 23 idiomas y variantes, incluidos chino mandarín, cantonés (yue), inglés, japonés, coreano, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, indonesio, malayo, neerlandés, noruego, polaco, sueco, tailandés, turco, vietnamita y finés.
- Generación de una forma de onda completa por llamada (no streaming documentado).
- Ejecución local en Apple Silicon mediante MLX, sin PyTorch en tiempo de inferencia.
- Interfaz Python (`mlx_audio.tts.utils.load`) y CLI (`python -m mlx_audio.tts.generate`).
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- **Locución de audiolibros y contenido largo en varios idiomas**: el modelo puede generar narraciones en cualquiera de los 23 idiomas soportados, con la limitación de que cada llamada produce una forma de onda acotada por el contexto de 2.048 posiciones, por lo que habría que trocear el texto y concatenar los fragmentos.
- **Clonación de voz para doblaje y localización**: pasando un audio de referencia y su transcripción exacta, se puede generar la misma voz en otro idioma, útil para prototipos de doblaje o para mantener la identidad de marca en distintos mercados.
- **Asistentes de voz en aplicaciones de escritorio para macOS**: al ejecutarse sobre MLX en Apple Silicon, puede integrarse en apps nativas de Mac sin depender de servicios en la nube, reduciendo latencia y preservando la privacidad del texto sintetizado.
- **Generación de avisos y notificaciones personalizadas**: para sistemas que necesitan locuciones dinámicas (alertas, recordatorios, mensajes de estado) con una voz consistente obtenida por clonación a partir de una muestra corta del usuario.
- **Prototipado de interfaces conversacionales**: investigadores que desarrollan pipelines de diálogo por voz pueden usar el modelo como componente TTS local en sus pruebas, evitando costes de API y permitiendo iterar sin conexión.
- **Accesibilidad y lectura de contenido**: conversión de artículos, documentos o correos a audio en el idioma del usuario, con la ventaja de que el modelo cubre idiomas menos habituales en TTS comerciales como finés, noruego o malayo.
- **Generación de datasets de voz sintética**: creación de muestras de audio multilingües para aumentar datasets de entrenamiento de otros sistemas (ASR, clasificadores de audio), siempre que la licencia Apache 2.0 y las consideraciones éticas sobre voces clonadas lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de una conversión MLX, el modelo reside en memoria unificada. Con 938.556.145 parámetros en bf16, el peso de los pesos ronda los 1,9 GB, y el repositorio completo ocupa 2,6 GB (incluyendo el códec y otros artefactos). Se recomienda disponer de al menos 4-6 GB de memoria unificada libre para margen de trabajo.
- **GPU recomendadas**: exclusivamente Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra), ya que MLX no soporta GPUs NVIDIA ni AMD de forma nativa. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- **Cabe en consumer GPU**: sí, en cualquier Mac con chip Apple Silicon y memoria unificada suficiente; no aplica a GPUs de consumo convencionales por la dependencia de MLX.
- **Opciones de despliegue**: `mlx-audio` (Python y CLI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de audio y no de texto.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b-bf16 | 938.556.145 | 2.048 posiciones | 23 | Apache 2.0 | safetensors MLX / `mlx-audio` |
| Edge0/Audio8-TTS-Realistic-0.6b (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (TTS zero-shot multilingüe de ~0,6b) en la documentación proporcionada para establecer una comparación cuantitativa rigurosa. El modelo base `Edge0/Audio8-TTS-Realistic-0.6b` es el referente directo, pero su model card no se ha incluido en la información disponible.

## Limitaciones y advertencias

- **Contexto limitado**: las 2.048 posiciones se comparten entre texto, audio de referencia y frames generados, lo que restringe la duración máxima de cada locución y el tamaño de las muestras de clonación.
- **Dependencia de Apple Silicon**: al ser una conversión MLX, no puede ejecutarse en GPUs NVIDIA, AMD ni en CPU de forma práctica, lo que limita su despliegue en servidores convencionales.
- **Riesgo de uso indebido de la clonación de voz**: la capacidad zero-shot permite imitar voces sin consentimiento explícito; es responsabilidad del usuario cumplir la normativa aplicable (por ejemplo, el AI Act europeo en materia de deepfakes y transparencia).
- **Alucinación y artefactos de audio**: no se documentan métricas de calidad (MOS, WER) ni tasas de fallo; es esperable que en textos largos o poco representados aparezcan errores de pronunciación o artefactos, aunque no se cuantifican.
- **Idiomas**: aunque se listan 23, no se especifica el nivel de calidad por idioma; es probable que el rendimiento varíe y que los idiomas con menos datos (finés, malayo, noruego) estén peor cubiertos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y el codec podrían tener condiciones adicionales no reflejadas en esta conversión; conviene verificar la licencia del modelo original `Edge0/Audio8-TTS-Realistic-0.6b`.
- **Madurez**: el repositorio tiene 68 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- **Sin benchmarks**: la ausencia de métricas publicadas impide evaluar su calidad frente a alternativas establecidas.

## Enlaces

- [HuggingFace: nativ-community/Audio8-TTS-Realistic-0.6b-bf16](https://huggingface.co/nativ-community/Audio8-TTS-Realistic-0.6b-bf16)
- [Modelo base: Edge0/Audio8-TTS-Realistic-0.6b](https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b)
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
