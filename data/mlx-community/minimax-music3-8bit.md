# mlx-community/MiniMax-Music3-8bit

## Resumen

MiniMax Music 3 es un modelo de generación de música a partir de texto y letras desarrollado por MiniMax. Esta ficha corresponde a la conversión MLX en cuantización affine de 8 bits publicada por la comunidad mlx-community, pensada para ejecutarse de forma nativa en Apple Silicon mediante la librería `mlx-audio`. Se trata de una conversión no oficial, pero que permite utilizar el modelo completo de 4.599.447.018 parámetros (aproximadamente 4,6 mil millones) en hardware de Apple con un equilibrio entre calidad y uso de memoria.

El modelo acepta una descripción textual del estilo musical (género, tempo, instrumentación, voz) y una letra estructurada en secciones, y genera audio estéreo a 44,1 kHz. La cuantización de 8 bits con grupo de tamaño 64 reduce el peso de los grandes lineales del modelo de lenguaje global, el decodificador de profundidad RVQ y el flow transformer, mientras que embeddings, cabezas de salida, convoluciones, codificador de condiciones y vocoder se mantienen en precisión completa para preservar la fidelidad. La relevancia actual radica en que democratiza la generación de canciones completas en equipos Apple Silicon sin necesidad de GPUs dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se describen componentes: modelo de lenguaje global, decodificador de profundidad RVQ y flow transformer) |
| Parametros totales | 4.599.447.018 (4,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine (group size 64); también existen variantes BF16, 6-bit, 4-bit, MXFP8, MXFP4 y NVFP4 |
| Idiomas soportados | No disponibles |
| Licencia | minimax-music3-community-license |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura completa del modelo original MiniMax Music 3. A partir de la descripción de la cuantización se sabe que incluye un modelo de lenguaje global, un decodificador de profundidad RVQ (Residual Vector Quantization) y un flow transformer, lo que sugiere un diseño híbrido con etapas autoregresivas y de flujo. El proceso de entrenamiento (datos, número de tokens, técnicas de alineación) no se ha publicado en la documentación accesible.

La conversión MLX aplica cuantización affine de 8 bits con grupo de tamaño 64 sobre los lineales grandes, manteniendo densos los embeddings, las cabezas de salida, las convoluciones, el codificador de condiciones y el vocoder. La conversión se realizó con `mlx-audio` 0.4.8 (commit de desarrollo `c2fa486`) y MLX 0.31.2. La suite de regresión de `mlx-audio` pasó 1.742 pruebas con 34 omisiones esperadas, y la suite específica de música, convertidor y registro pasó 43 pruebas y 3 subpruebas.

## Capacidades

- Generación de música a partir de una descripción textual (caption) que especifica género, tempo, instrumentación y características vocales.
- Generación condicionada por letras estructuradas en secciones como `[verse]`, `[chorus]`, `[bridge]`, etc.
- Generación instrumental explícita mediante la etiqueta `[instrumental]`.
- Control probabilístico de estilo, tempo, instrumentos y voz (no estricto).
- Producción de audio estéreo a 44,1 kHz.
- Integración con el ecosistema `mlx-audio` para Apple Silicon, con API de línea de comandos y Python.

## Casos de uso

- Composición musical asistida: un artista puede escribir una letra y una descripción de estilo, y el modelo genera una maqueta completa para evaluar ideas rápidamente.
- Producción de demos para sellos discográficos: generar versiones preliminares de canciones con diferentes arreglos y tempos sin necesidad de instrumentos físicos.
- Creación de música de fondo para vídeos, podcasts o presentaciones: describir el ambiente deseado (p. ej., "pop acústico cálido, 96 BPM") y obtener una pista instrumental con `[instrumental]`.
- Prototipado de jingles publicitarios: combinar letras cortas con estilos específicos para generar candidatos en minutos.
- Educación musical: usar el modelo como herramienta didáctica para mostrar cómo varía una composición según la letra y las indicaciones de estilo.
- Investigación en generación de música: servir como punto de partida para estudios sobre control de atributos musicales, dado que la cuantización 8-bit permite ejecutarlo en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) con soporte MLX.
- Memoria RAM: no especificada oficialmente; el repositorio ocupa 14,2 GB en disco, por lo que se recomienda al menos 16 GB de memoria unificada para una experiencia fluida, aunque no está confirmado.
- GPU: integrada en el chip Apple Silicon; no requiere GPU externa.
- Despliegue: mediante `mlx-audio` (instalación desde el commit `784b29e` hasta que se publique en PyPI) y Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de generación de música en la documentación proporcionada. Las variantes de cuantización del mismo modelo (BF16, 6-bit, 4-bit, MXFP8, MXFP4, NVFP4) ofrecen distintos equilibrios entre tamaño y calidad, pero no hay datos objetivos de rendimiento publicados.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: el crédito del modelo pertenece a MiniMax y la conversión puede no reflejar exactamente el comportamiento del original.
- Las letras son obligatorias por contrato del checkpoint; para generar música instrumental hay que usar explícitamente `[instrumental]`.
- La duración solicitada es un límite superior: la etapa autoregresiva puede emitir su token de fin antes de alcanzarla.
- Los controles de estilo, tempo, instrumento y voz son probabilísticos, no estrictos; el resultado puede desviarse de la descripción.
- Licencia comunitaria con términos de uso aceptable y comercial: es imprescindible revisar el texto completo de la licencia antes de cualquier uso en producción.
- No se han documentado sesgos específicos ni riesgos de alucinación, pero al ser un modelo generativo de audio, puede producir contenido inesperado o de baja calidad en ciertas entradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/MiniMax-Music3-8bit
- Modelo base MiniMax Music 3: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
- Pull request de soporte para MiniMax Music 3: https://github.com/Blaizzy/mlx-audio/pull/888
- Licencia del modelo: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
