# mlx-community/MiniMax-Music3-4bit

## Resumen

MiniMax Music 3 es un modelo de generación de música condicionado por letras desarrollado por MiniMax. Esta variante concreta, `mlx-community/MiniMax-Music3-4bit`, es una conversión comunitaria no oficial a pesos MLX cuantizados en 4 bits, realizada por el colectivo mlx-community para ejecutarse de forma nativa en Apple Silicon mediante la librería `mlx-audio`. El modelo resuelve el problema de generar canciones completas (con voz y acompañamiento) a partir de una descripción textual y una letra estructurada, ofreciendo control sobre estilo, tempo e instrumentación.

La relevancia de esta versión cuantizada radica en que reduce significativamente los requisitos de memoria frente al checkpoint original en BF16, permitiendo ejecutar el modelo en hardware de Apple con memoria unificada moderada. El modelo base tiene 3.357.310.442 parámetros (aproximadamente 3,36 mil millones) y genera audio estéreo a 44,1 kHz. La cuantización affine de 4 bits con grupo de tamaño 64 se aplica a los lineales grandes del modelo de lenguaje global, el decodificador RVQ depth y el flow transformer, mientras que embeddings, cabezas de salida, convoluciones, encoder de condiciones y vocoder permanecen en precisión completa para preservar la fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de música con letras; incluye modelo de lenguaje global, decodificador RVQ depth y flow transformer) |
| Parametros totales | 3.357.310.442 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (group size 64) |
| Idiomas soportados | no disponible |
| Licencia | minimax-music3-community-license |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura completa del modelo original. Según la model card de la conversión, el checkpoint se compone de un modelo de lenguaje global, un decodificador RVQ depth y un flow transformer, además de un encoder de condiciones, un vocoder y capas convolucionales. La cuantización 4-bit se aplica selectivamente a los componentes lineales grandes para reducir el uso de memoria, manteniendo densos los elementos críticos para la calidad de audio.

No se han proporcionado datos sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La conversión a MLX se realizó con `mlx-audio` en su versión de desarrollo 0.4.8 (commit `c2fa486`) y MLX 0.31.2, y fue verificada mediante generación real de audio y una suite de regresión que superó 1.742 pruebas con 34 omisiones esperadas.

## Capacidades

- Generación de música completa (voz y acompañamiento) a partir de una descripción textual y una letra estructurada con secciones como `[verse]`, `[chorus]`, etc.
- Generación instrumental explícita mediante la etiqueta `[instrumental]` en la letra.
- Control probabilístico de estilo, tempo, instrumentos y características vocales (no estricto).
- Generación de audio estéreo a 44,1 kHz.
- Ejecución nativa en Apple Silicon mediante MLX, con soporte para cuantización 4-bit.
- Integración con el ecosistema `mlx-audio` para generación y carga de modelos.

## Casos de uso

- Creación de demos musicales para compositores: un compositor puede generar rápidamente una maqueta con voz y acompañamiento a partir de una letra y una indicación de estilo, acelerando el proceso de preproducción.
- Bandas sonoras para vídeo y contenido digital: generación de piezas musicales personalizadas para vídeos de YouTube, cortometrajes o anuncios, ajustando tempo y ambiente mediante la descripción textual.
- Prototipado de ideas en producción musical: productores pueden explorar variaciones melódicas y armónicas generando múltiples versiones con diferentes semillas y descripciones antes de grabar en estudio.
- Música de fondo para podcasts y audiolibros: creación de sintonías y fondos instrumentales usando la etiqueta `[instrumental]` para evitar interferencias con la narración.
- Generación de jingles publicitarios: producción de piezas cortas y pegadizas a partir de letras breves y especificaciones de estilo, útil para agencias de publicidad con presupuestos ajustados.
- Herramienta educativa en producción musical: estudiantes de música pueden estudiar cómo diferentes descripciones de estilo y tempo afectan al resultado generado, comprendiendo la relación entre texto y música.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser una conversión MLX, requiere hardware Apple Silicon (M1 o posterior) con memoria unificada.
- El repositorio pesa 9,2 GB en dos shards de pesos, pero la cuantización 4-bit reduce la memoria de inferencia frente al checkpoint BF16 original. No se dispone de una cifra exacta de VRAM o memoria unificada necesaria; se recomienda un mínimo de 16 GB de memoria unificada para una generación fluida, aunque no está confirmado por el autor.
- No se han publicado datos de latencia o throughput.
- Opciones de despliegue: mediante `mlx-audio` (instalación desde el commit de desarrollo que incluye soporte para MiniMax Music 3) y el comando `python -m mlx_audio.music.generate`.
- No es compatible con GPUs NVIDIA o AMD; está limitado a Apple Silicon.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede mencionar que el modelo base MiniMax Music 3 compite con otros generadores de música como MusicGen de Meta o Stable Audio, pero no hay datos concretos de comparación en esta ficha.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: no está respaldada por MiniMax y puede contener diferencias de comportamiento frente al checkpoint original.
- Las letras son obligatorias por contrato del checkpoint; para generar música instrumental hay que usar explícitamente `[instrumental]`.
- Los controles de estilo, tempo e instrumentos son probabilísticos, no estrictos; el resultado puede desviarse de la descripción solicitada.
- La duración generada es un límite superior: el modelo puede emitir su token de fin antes de alcanzar la duración solicitada.
- La licencia `minimax-music3-community-license` incluye términos de uso aceptable y condiciones comerciales que deben revisarse antes de cualquier uso en producción.
- No se han evaluado sesgos del modelo ni su comportamiento en idiomas distintos del inglés (los idiomas soportados no están documentados).
- Riesgo de alucinación o artefactos de audio en generaciones largas o con letras ambiguas, aunque no se ha documentado formalmente.

## Enlaces

- [HuggingFace: mlx-community/MiniMax-Music3-4bit](https://huggingface.co/mlx-community/MiniMax-Music3-4bit)
- [Modelo base: MiniMaxAI/MiniMax-Music3](https://huggingface.co/MiniMaxAI/MiniMax-Music3)
- [Licencia del modelo base](https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE)
- [Repositorio mlx-audio](https://github.com/Blaizzy/mlx-audio)
- [Pull request de soporte para MiniMax Music 3 en mlx-audio](https://github.com/Blaizzy/mlx-audio/pull/888)
- [Variante BF16](https://huggingface.co/mlx-community/MiniMax-Music3-bf16)
- [Variante 8-bit](https://huggingface.co/mlx-community/MiniMax-Music3-8bit)
- [Variante 6-bit](https://huggingface.co/mlx-community/MiniMax-Music3-6bit)
- [Variante MXFP8](https://huggingface.co/mlx-community/MiniMax-Music3-mxfp8)
- [Variante MXFP4 (experimental)](https://huggingface.co/mlx-community/MiniMax-Music3-mxfp4)
- [Variante NVFP4 (experimental)](https://huggingface.co/mlx-community/MiniMax-Music3-nvfp4)
