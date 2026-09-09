# mradermacher/EdiTikZ-4B-GGUF

## Resumen

EdiTikZ-4B es un modelo multimodal (visión y texto) de 4.205.751.296 parámetros (≈4.2B), desarrollado por nllg, orientado a la generación y edición de figuras científicas mediante código TikZ y LaTeX. Su versión cuantizada en formato GGUF ha sido publicada por mradermacher, lo que permite su ejecución en CPU y GPU con un consumo de memoria reducido. El modelo combina capacidad de procesamiento de imágenes con la generación de código, tal y como indican sus etiquetas: `scientific-figures`, `image-editing`, `tikz`, `latex`, `code-generation` y `multimodal`.

No se dispone de información detallada sobre la arquitectura interna, los datos de entrenamiento ni la longitud de la ventana de contexto en la documentación proporcionada. El repositorio se limita a las cuantizaciones GGUF del modelo original, sin incluir la ficha técnica del modelo base. A pesar de ello, la licencia Apache 2.0 y su tamaño moderado lo hacen interesante para aplicaciones de edición científica automatizada en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo multimodal de la familia `transformers`, según etiquetas) |
| Parametros totales | 4.205.751.296 (≈4.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; más proyecciones multimodales `mmproj-Q8_0` y `mmproj-f16` |
| Idiomas soportados | Inglés (declarado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos cuantizados; el modelo original usa safetensors) |

## Arquitectura y entrenamiento

La información disponible no permite describir con detalle la arquitectura interna ni el proceso de entrenamiento. Los metadatos indican que el modelo pertenece a la librería `transformers` y que es multimodal, manejando simultáneamente imágenes (para tareas de edición de figuras) y texto/código. No se han encontrado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de técnicas de alineación como RLHF o DPO, ni innovaciones técnicas específicas en el diseño del modelo.

Este repositorio contiene únicamente las cuantizaciones GGUF creadas por mradermacher a partir del modelo original `nllg/EdiTikZ-4B`. Estas cuantizaciones permiten reducir el peso de 8.5 GB (f16) a 2.0 GB (Q2_K) con una pérdida de precisión variable en función del nivel elegido. Los archivos `mmproj` complementarios son necesarios para activar la parte visual del modelo en sistemas compatibles con GGUF multimodal.

## Capacidades

- Generación de código LaTeX y TikZ para crear figuras científicas a partir de instrucciones textuales o imágenes.
- Edición de imágenes: el modelo puede interpretar una figura existente y modificar sus elementos generando el código TikZ correspondiente.
- Procesamiento multimodal: acepta entradas de imagen y texto en un mismo turno conversacional, según las etiquetas del modelo.
- Generación de código en entornos conversacionales (tag `conversational`), orientado a tareas de diagramación y figuras técnicas.
- No se ha confirmado soporte para *tool calling* ni razonamiento multi-paso con el uso de agentes externos.

## Casos de uso

- Creación de figuras para publicaciones científicas: el investigador proporciona una descripción o una imagen de referencia y el modelo genera código TikZ reproducible para su inclusión en documentos LaTeX.
- Automatización de diagramas en documentación técnica: generación automática de diagramas de flujo, arquitecturas de sistemas o esquemas de red a partir de una descripción en lenguaje natural.
- Edición de figuras en artículos existentes: modificar colores, etiquetas o disposición de elementos en una figura ya publicada regenerando el código TikZ de manera controlada.
- Vectorización de imágenes raster: convertir figuras sencillas (gráficos, iconos o diagramas) a código TikZ para escalarlas sin pérdida de calidad.
- Elaboración de material docente: creación de ilustraciones vectoriales para diapositivas, pizarras virtuales o apuntes de cursos en los que se expliquen conceptos mediante diagramas.
- Integración en pipelines de generación de documentos LaTeX: el modelo puede actuar como paso intermedio en herramientas que automatizan la producción de reportes, preprints o tesis con figuras generadas por código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No ha sido posible encontrar datos de rendimiento en MMLU, HumanEval, GSM8K ni cualquier otra métrica comparable para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia con `llama.cpp` y contexto breve: para Q4_K_M (2.8 GB) se necesitan aproximadamente 3.5 - 4 GB; para Q8_0 (4.6 GB) unos 5.5 - 6 GB; para f16 (8.5 GB) en torno a 9.5 GB. Los archivos `mmproj` añaden 0.5 - 0.8 GB adicionales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, A100, H100. Las cuantizaciones Q4_K_M y Q5_K_M funcionan bien en tarjetas de consumo con 8 - 12 GB de VRAM.
- Disponibilidad en GPU de consumo: sí, las versiones Q2_K hasta Q5_K_M caben en GPUs de 6 - 12 GB; la versión f16 es viable en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp (con soporte multimodal vía mmproj), Ollama, LM Studio, KoboldCpp. Para entornos de producción con `vLLM` o `TGI` es necesario utilizar el modelo original en formato safetensors, no el GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para elaborar una comparativa fiable con otros modelos de la misma categoría. No se han encontrado datos públicos de rendimiento ni características técnicas del modelo base que permitan equipararlo con alternativas como Qwen2-VL-7B o Llama-3.2-Vision-11B. Por ello, se indica "no disponible".

## Limitaciones y advertencias

- Solo se declara soporte de idioma inglés; el rendimiento en otras lenguas no está evaluado.
- La longitud de la ventana de contexto no está especificada, lo que limita la planificación de uso en tareas con entradas largas.
- Al tratarse de cuantizaciones GGUF, se produce una pérdida de precisión frente al modelo f16; los niveles Q2_K y Q3_K presentan una degradación notable en la calidad del código generado.
- Riesgo de alucinación en la generación de código TikZ: el modelo puede producir sintaxis incorrecta o estructuras no válidas para el compilador LaTeX.
- No hay benchmarks públicos, por lo que la evaluación de su calidad relativa es imposible en este momento.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de derechos de autor y renuncia de garantías.

## Enlaces

- https://huggingface.co/mradermacher/EdiTikZ-4B-GGUF
- https://huggingface.co/nllg/EdiTikZ-4B
- https://hf.tst.eu/model#EdiTikZ-4B-GGUF
