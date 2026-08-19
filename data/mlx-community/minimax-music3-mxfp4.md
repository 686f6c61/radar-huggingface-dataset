# mlx-community/MiniMax-Music3-mxfp4

## Resumen

MiniMax-Music3-mxfp4 es una conversión comunitaria del modelo MiniMax Music 3, realizada por mlx-community, que adapta los pesos originales al formato MLX (Apple Silicon) con cuantización MXFP4 de 4 bits. Este modelo está diseñado para la generación de canciones completas condicionadas por letras (lyric-conditioned song generation), combinando descripciones textuales de estilo, tempo e instrumentación con letras estructuradas para producir audio estéreo de 44,1 kHz. El modelo base, MiniMaxAI/MiniMax-Music3, es un sistema de generación de música de última generación, y esta variante MLX busca reducir drásticamente el consumo de memoria (de 27 GB en BF16 a unos 8,3 GB) para permitir su ejecución en equipos Apple Silicon.

La conversión es experimental y prioriza el ahorro de memoria frente a la fidelidad de las letras: las pruebas controladas muestran una adherencia a las letras más débil que las variantes BF16 y MXFP8, con palabras que pueden alterarse, omitirse o sustituirse. Aun así, la generación produce audio finito y estable, y la suite de regresión de mlx-audio pasa 675 pruebas. Se trata de una opción interesante para desarrolladores que necesitan generar música localmente en hardware Apple con restricciones de memoria, pero no para usos donde la precisión lírica sea crítica. El modelo se distribuye bajo la MiniMax-Music3 Community License, que incluye términos de uso comercial específicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base MiniMax Music 3; la conversión MLX incluye un language model global, un RVQ depth decoder, un flow transformer, un encoder de condiciones y un vocoder, pero no se detalla la arquitectura completa) |
| Parametros totales | 3.667.844.586 (aprox. 3,67 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; la duración máxima de generación se solicita como límite superior, pero no se especifica una ventana de contexto en tokens) |
| Tipos de cuantizacion | MXFP4 (grupo de 32, pesos E2M1 con escalas E8M0); también existen variantes BF16 y MXFP8 |
| Idiomas soportados | No disponible (la generación de letras puede ser multilingüe, pero no se especifican idiomas concretos) |
| Licencia | MiniMax-Music3 Community License (licencia propia, con términos de uso aceptable y comercial) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base MiniMax Music 3. Sin embargo, la model card de la conversión MLX menciona varios componentes: un "global language model", un "RVQ depth decoder" (decodificador de profundidad de cuantización vectorial residual), un "flow transformer" (transformador de flujo) y un vocoder. Esto sugiere un diseño híbrido que combina un modelo de lenguaje autoregresivo para la planificación global con un decodificador de cuantización vectorial residual y un transformador de flujo para la síntesis de audio de alta calidad. El encoder de condiciones procesa las descripciones textuales y las letras.

No se dispone de datos sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La conversión MLX se realizó con `mlx-audio` en su commit de desarrollo `b12a1966` y MLX 0.31.2. La cuantización MXFP4 se aplicó solo a los lineales grandes del language model global, el RVQ depth decoder y el flow transformer; las embeddings, las cabezas de salida, las convoluciones, el encoder de condiciones y el vocoder se mantienen en precisión densa para preservar la fidelidad.

## Capacidades

- Generación de canciones completas a partir de una descripción textual de estilo (p. ej., "Warm acoustic pop, 96 BPM, intimate female vocal") y letras estructuradas en secciones (verso, coro, etc.).
- Generación instrumental explícita mediante la etiqueta `[instrumental]` en el campo de letras.
- Control probabilístico de estilo, tempo, instrumentos y características vocales (no estricto; los controles son orientativos).
- Salida de audio estéreo a 44,1 kHz.
- Integración con la librería `mlx-audio` para Apple Silicon, con soporte de generación por línea de comandos y API Python.
- Cuantización MXFP4 que reduce el tamaño en disco a aproximadamente 8,3 GB (frente a 27 GB en BF16), habilitando la ejecución en equipos con memoria unificada limitada.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso; es un modelo puramente generativo de audio.

## Casos de uso

- Creación de demos musicales para maquetas: un compositor puede generar rápidamente una maqueta con letras y estilo especificado para evaluar ideas antes de producir la versión final.
- Bandas sonoras para vídeos y podcasts: los creadores de contenido pueden generar música de fondo con letras opcionales, ajustando estilo y duración, sin necesidad de licencias de música comercial.
- Prototipado de jingles publicitarios: agencias y equipos de marketing pueden generar variaciones de un jingle con diferentes letras y tempos para presentar a clientes.
- Generación de música para videojuegos independientes: desarrolladores indie pueden crear temas musicales con letras (o instrumentales) que se adapten a la atmósfera del juego, usando hardware Apple.
- Asistencia a compositores: un letrista puede generar una base musical con su letra para escuchar cómo suena antes de trabajar con un productor.
- Educación musical: profesores y estudiantes pueden experimentar con diferentes estilos y estructuras de canción, generando ejemplos auditivos al instante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona pruebas de verificación internas: la suite de regresión de `mlx-audio` pasó 675 tests con 12 skips esperados, y la suite diferencial opcional de PyTorch pasó 3/3 tests. También indica que en comprobaciones controladas con dos semillas, la variante MXFP4 mostró una adherencia a las letras más débil que las variantes BF16 y MXFP8, con palabras alteradas, omitidas o reemplazadas. No se proporcionan métricas objetivas de calidad musical (p. ej., FAD, CLAP score) ni comparaciones con otros modelos de generación de música.

## Requisitos de hardware

- Modelo diseñado exclusivamente para Apple Silicon (chips M1, M2, M3, M4 y sucesores) gracias al framework MLX.
- Tamaño en disco: aproximadamente 8,3 GB (repo de 8,9 GB), lo que implica un uso de memoria unificada estimado de 10-12 GB durante la inferencia (pesos + activaciones + overhead).
- Se recomienda un Mac con al menos 16 GB de RAM unificada para una generación fluida; con 8 GB podría funcionar pero con mayor riesgo de swapping.
- La generación se realiza mediante `mlx-audio`, que soporta tanto la interfaz de línea de comandos (`python -m mlx_audio.tts.generate`) como la API Python (`load_model`).
- No se proporcionan datos de latencia o throughput. La duración de generación depende del hardware (los chips con más núcleos GPU y mayor ancho de banda de memoria, como M2 Pro/Max o M3 Max, serán más rápidos).
- No se menciona soporte para CUDA o GPU de NVIDIA; la conversión es específica para MLX.

## Comparativa con modelos similares

La comparación más directa es con las otras variantes MLX del mismo modelo base, así como con el modelo original en PyTorch:

| Modelo | Parámetros | Tamaño en disco | Cuantización | Adherencia a letras | Licencia |
|---|---|---|---|---|---|
| MiniMax-Music3-bf16 (MLX) | 3,67B | ~27 GB | BF16 | Alta | MiniMax-Music3 Community |
| MiniMax-Music3-mxfp8 (MLX) | 3,67B | ~14 GB (estimado) | MXFP8 | Alta (recomendada) | MiniMax-Music3 Community |
| MiniMax-Music3-mxfp4 (MLX) | 3,67B | ~8,3 GB | MXFP4 | Débil (palabras alteradas/omitidas) | MiniMax-Music3 Community |
| MiniMax-Music3 (PyTorch original) | 3,67B | ~27 GB (FP16) | FP16 | Alta | MiniMax-Music3 Community |

No se dispone de información sobre otros modelos de generación de música comparables (p. ej., MusicGen, Stable Audio) en la documentación proporcionada. La comparativa se limita a las variantes MLX del mismo modelo.

## Limitaciones y advertencias

- Adherencia a letras débil en esta variante MXFP4: las palabras pueden alterarse, omitirse o sustituirse, lo que la hace inadecuada para aplicaciones donde la letra exacta sea crítica.
- Conversión experimental y comunitaria, no un lanzamiento oficial de MiniMax; puede haber errores no detectados o comportamientos inesperados.
- La licencia MiniMax-Music3 Community License incluye términos de uso aceptable y comercial específicos; es obligatorio revisar el texto completo de la licencia antes de cualquier uso.
- Los controles de estilo, tempo, instrumento y vocal son probabilísticos y no estrictos; el resultado puede desviarse de la descripción solicitada.
- La duración de generación es un límite superior: el modelo puede emitir su token de fin antes, produciendo clips más cortos de lo solicitado.
- Requiere la instalación de una versión de desarrollo de `mlx-audio` (commit `b12a1966`) hasta que se publique el soporte oficial.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de contenido inapropiado; al ser un modelo de música, los riesgos son menores que en modelos de texto, pero las letras generadas podrían reflejar sesgos del entrenamiento.
- Limitado a hardware Apple Silicon; no es ejecutable en GPU NVIDIA o AMD sin una conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/MiniMax-Music3-mxfp4
- Modelo base (MiniMaxAI/MiniMax-Music3): https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Variante BF16: https://huggingface.co/mlx-community/MiniMax-Music3-bf16
- Variante MXFP8 (recomendada): https://huggingface.co/mlx-community/MiniMax-Music3-mxfp8
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- Pull request de soporte para MiniMax Music 3: https://github.com/Blaizzy/mlx-audio/pull/888
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
