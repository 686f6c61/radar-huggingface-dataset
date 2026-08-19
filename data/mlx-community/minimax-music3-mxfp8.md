# mlx-community/MiniMax-Music3-mxfp8

## Resumen

MiniMax Music 3 es un modelo de generación de música texto-a-audio desarrollado por MiniMax, capaz de crear canciones completas con letras condicionadas a partir de una descripción en lenguaje natural. Esta variante concreta, `mlx-community/MiniMax-Music3-mxfp8`, es una conversión comunitaria a formato MLX con cuantización MXFP8, optimizada para ejecutarse en Apple Silicon mediante la librería `mlx-audio`. El modelo tiene aproximadamente 4.600 millones de parámetros y ocupa unos 13,9 GB en disco, frente a los 27 GB de la versión BF16, lo que lo hace más accesible para hardware de consumo.

La relevancia de esta conversión radica en que permite ejecutar un modelo de generación de música de última generación en Macs con Apple Silicon, manteniendo una alta fidelidad en las letras generadas, según las verificaciones realizadas por la comunidad. Es la variante cuantizada recomendada cuando la precisión de las letras es crítica, ya que conserva mejor el texto solicitado que otras cuantizaciones más agresivas como MXFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de generación de música texto-a-audio con modelo de lenguaje global autorregresivo, decodificador RVQ y flow transformer (según descripción de componentes cuantizados) |
| Parametros totales | 4.599.447.018 (4,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (E4M3 con escalas de grupo E8M0, grupo de 32) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-Music3 Community License |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura de MiniMax Music 3 combina un modelo de lenguaje global autorregresivo con un decodificador de profundidad RVQ (Residual Vector Quantization) y un flow transformer, según se desprende de la descripción de los componentes que se cuantizan en esta conversión. El modelo genera audio estéreo a 44,1 kHz a partir de una descripción textual (estilo, tempo, instrumentos) y letras opcionales. Las letras son un requisito del contrato del checkpoint; para generar piezas instrumentales debe usarse explícitamente la etiqueta `[instrumental]`.

No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La conversión MLX mantiene densos los embeddings, cabezas de salida, convoluciones, codificador de condiciones y vocoder para preservar la fidelidad, mientras cuantiza los lineales grandes del modelo de lenguaje, el decodificador RVQ y el flow transformer.

## Capacidades

- Generación de canciones completas con letras condicionadas a partir de una descripción en lenguaje natural (estilo, tempo, instrumentos, tipo de voz).
- Generación instrumental explícita mediante la etiqueta `[instrumental]`.
- Control probabilístico de estilo, tempo, instrumento y características vocales (no estricto).
- Generación de audio estéreo a 44,1 kHz.
- Soporte para generación con duración configurable (la duración es un límite superior; el modelo puede emitir su token de fin antes).
- Ejecución nativa en Apple Silicon mediante MLX y `mlx-audio`.

## Casos de uso

- Producción musical independiente: un artista puede generar demos de canciones con letras y estilo específico para explorar ideas rápidamente, usando la variante MXFP8 en su MacBook Pro con chip M-series.
- Creación de maquetas para compositores: los compositores pueden introducir letras y una descripción de estilo para obtener una maqueta vocal e instrumental que sirva de base para arreglos posteriores.
- Generación de bandas sonoras para vídeo: creadores de contenido pueden generar música de fondo con letras opcionales para vídeos, podcasts o presentaciones, directamente en su equipo Apple.
- Prototipado de jingles publicitarios: agencias pueden generar múltiples variaciones de un jingle con diferentes estilos y letras para presentar a clientes, gracias a la generación rápida en hardware local.
- Educación musical: profesores pueden usar el modelo para ilustrar conceptos de composición, mostrando cómo diferentes letras y descripciones afectan al resultado musical.
- Investigación en generación de música: investigadores pueden estudiar el comportamiento del modelo con cuantización MXFP8 frente a otras variantes, gracias a la disponibilidad de múltiples versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card incluye una verificación cualitativa de fidelidad de letras: en pruebas controladas con dos semillas, la variante MXFP8 retuvo sustancialmente más texto solicitado que la variante MXFP4 y se mantuvo cerca de la línea base BF16 densa. Por ejemplo, en un coro de 24 segundos con la semilla 113, se conservaron casi todas las frases solicitadas, mientras que MXFP4 colapsó a un fragmento corto no relacionado. Además, la suite de regresión de `mlx-audio` pasó 1.742 pruebas con 34 omisiones esperadas, y la suite enfocada de música, convertidor y registro pasó 43 pruebas y 3 subpruebas, lo que indica una implementación robusta.

## Requisitos de hardware

- Diseñado para Apple Silicon (chips M1 o posteriores) con suficiente memoria unificada.
- Tamaño del repositorio: 13,9 GB en disco (frente a 27 GB de la variante BF16), lo que sugiere que se necesita al menos 16 GB de RAM unificada para cargar los pesos y generar audio, aunque no se especifica un requisito mínimo exacto.
- La inferencia se realiza mediante la librería `mlx-audio`, que aprovecha el framework MLX de Apple.
- No se dispone de datos de latencia o throughput específicos para esta variante.
- Opciones de despliegue: ejecución local en Mac con Apple Silicon usando el comando `python -m mlx_audio.music.generate` o la API de Python de `mlx-audio`.

## Comparativa con modelos similares

La comparativa más relevante es con las otras variantes MLX del mismo modelo base, ya que no se dispone de datos de modelos comparables de otros desarrolladores.

| Variante | Cuantización | Tamaño en disco | Fidelidad de letras |
|---|---|---|---|
| MiniMax-Music3-bf16 | BF16 | ~27 GB | Línea base densa |
| MiniMax-Music3-mxfp8 (esta) | MXFP8 | ~13,9 GB | Cercana a BF16, muy superior a MXFP4 |
| MiniMax-Music3-8bit | 8-bit | No disponible | No disponible |
| MiniMax-Music3-6bit | 6-bit | No disponible | No disponible |
| MiniMax-Music3-4bit | 4-bit | No disponible | No disponible |
| MiniMax-Music3-mxfp4 | MXFP4 | No disponible | Colapsa a fragmentos cortos no relacionados |

La variante MXFP8 es la recomendada cuando la fidelidad de las letras es crítica, ya que ofrece un equilibrio entre tamaño reducido y calidad de generación.

## Limitaciones y advertencias

- Las letras son obligatorias por el contrato del checkpoint; para generación instrumental debe usarse explícitamente `[instrumental]`.
- La duración generada es un límite superior: el modelo puede emitir su token de fin antes de alcanzar la duración solicitada.
- Los controles de estilo, tempo, instrumento y voz son probabilísticos, no estrictos; el resultado puede variar entre semillas.
- La cuantización MXFP8 puede introducir ligeras pérdidas de calidad respecto a la versión BF16, aunque las verificaciones muestran que la fidelidad de letras se mantiene cercana.
- Esta es una conversión comunitaria no oficial; todo el crédito del modelo corresponde a MiniMax.
- La licencia MiniMax-Music3 Community License incluye términos de uso aceptable y condiciones comerciales que deben revisarse antes de usar el modelo en producción.
- No se dispone de información sobre idiomas soportados; la generación de letras puede estar limitada a ciertos idiomas no especificados.
- Requiere hardware Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin una conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/MiniMax-Music3-mxfp8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- PR de soporte para MiniMax Music 3: https://github.com/Blaizzy/mlx-audio/pull/888
- Variantes MLX: [BF16](https://huggingface.co/mlx-community/MiniMax-Music3-bf16), [8-bit](https://huggingface.co/mlx-community/MiniMax-Music3-8bit), [6-bit](https://huggingface.co/mlx-community/MiniMax-Music3-6bit), [4-bit](https://huggingface.co/mlx-community/MiniMax-Music3-4bit), [MXFP4](https://huggingface.co/mlx-community/MiniMax-Music3-mxfp4), [NVFP4](https://huggingface.co/mlx-community/MiniMax-Music3-nvfp4)
