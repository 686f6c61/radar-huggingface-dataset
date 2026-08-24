# mrjackspade/Ideogram4-Natural-Language-Text-Encoder

## Resumen

Este repositorio contiene un adaptador experimental que sustituye al text encoder Qwen3-VL 8B utilizado por Ideogram 4, junto con el LoRA de entrenamiento correspondiente. El objetivo es que Ideogram 4 responda a indicaciones en lenguaje natural corriente de forma equivalente a como el modelo original responde a las indicaciones estructuradas en JSON Magic-Prompt. El proyecto lo publica el usuario mrjackspade y se distribuye bajo licencia Apache 2.0, con un tamaño de repositorio de 11,3 GB.

El artefacto principal es un text encoder fusionado en formato FP8 escalado (`qwen3vl_8b_ideogram4_nl_s020_v1_step_00000510_fp8_scaled.safetensors`, 10,6 GB) que se instala como reemplazo directo del checkpoint estándar en el cargador de ComfyUI. El LoRA asociado (`r64_a64`, 698 MB) se proporciona con fines de investigación y reproducibilidad. El modelo base es `Comfy-Org/Qwen3-VL`, y la arquitectura conserva los 13 taps de estados ocultos (índices 0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 35) que se concatenan hasta 53.248 características por token de texto y se proyectan al DiT de Ideogram 4 de 4.608 canales.

Se trata de un hito de fuerza 0.2 (paso de optimizador 510) dentro de un proyecto claramente marcado como experimental. No tiene descargas ni valoraciones en Hugging Face, y su uso está pensado exclusivamente para el flujo de trabajo de ComfyUI con Ideogram 4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL 8B (text encoder) adaptado con LoRA, con proyección al DiT de Ideogram 4 (4.608 canales) |
| Parametros totales | No disponible (el archivo fusionado FP8 pesa 10,6 GB; el LoRA pesa 698 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 escalado para el encoder fusionado; LoRA en precisión nativa (no especificada) |
| Idiomas soportados | No disponible (el Qwen3-VL base es multilingüe, pero no se especifica para este adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (encoder fusionado y LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el text encoder Qwen3-VL 8B, que actúa como extractor de características contextuales. Los estados ocultos de 13 capas (índices 0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 35) se concatenan para formar 53.248 características por token de texto, que luego se proyectan al espacio del DiT de Ideogram 4 (4.608 canales). El estudiante preserva exactamente esta arquitectura y el layout de tensores, de modo que funciona como reemplazo directo del checkpoint original en el cargador estándar de ComfyUI.

El entrenamiento utiliza destilación de velocidad (velocity matching) sobre trayectorias de ocho estados del modelo Ideogram 4 congelado. Para cada indicación en lenguaje natural, se genera una indicación JSON Magic-Prompt de profesor mediante el modelo `accounts/fireworks/models/nemotron-3-ultra-nvfp4` (temperatura 0, alto esfuerzo de razonamiento). La pérdida compara la velocidad condicional del estudiante (con lenguaje natural) contra la del profesor (con JSON), manteniendo congelados todos los parámetros de Ideogram. El dataset consta de 4.000 indicaciones públicas de Civitai (1.000 por grupo de calificación SFW, R, X, XXX), con 3.900 de entrenamiento y 100 de validación. Se capturan ocho estados pre-paso deterministas (índices de bucle 19, 16, 14, 11, 8, 5, 3, 0) del horario `V4_DEFAULT_20` a 512×512, generando 31.200 ejemplos de entrenamiento. Además, se aplica una corrección espacial de primer paso (fuerza 0.2) sobre los bloques 25-28 de Ideogram, que se destila en el text encoder.

## Capacidades

- Generación de imágenes con Ideogram 4 usando indicaciones en lenguaje natural corriente, sin necesidad de estructurarlas en JSON Magic-Prompt.
- Mejora de la adherencia semántica de Ideogram 4 a descripciones detalladas y matizadas en lenguaje natural.
- Compatibilidad con el flujo de trabajo estándar de ComfyUI: se instala como reemplazo directo del text encoder `qwen3vl_8b_fp8_scaled.safetensors`.
- Preservación de la arquitectura original de taps y proyección, lo que garantiza que el resto del pipeline de Ideogram 4 no requiera modificaciones.
- Soporte de cuantización FP8 escalada para reducir el uso de memoria en inferencia.
- Incluye un LoRA de investigación (r64 a64) con nombres de tensor nativos para inspección y reproducibilidad.

## Casos de uso

- Generación de imágenes en ComfyUI con indicaciones naturales: el usuario escribe una descripción libre (por ejemplo, "un gato naranja leyendo un libro en una biblioteca victoriana, luz cálida") y el adaptador la traduce internamente al espacio de condicionamiento que Ideogram 4 entiende, evitando tener que redactar JSON Magic-Prompt.
- Prototipado rápido de conceptos visuales en estudios de diseño: los diseñadores pueden iterar sobre ideas sin conocer la sintaxis JSON de Ideogram 4, acelerando la exploración creativa.
- Automatización de pipelines de generación de imágenes: en un flujo de trabajo con múltiples pasos (por ejemplo, generación de variaciones, composición de escenas), el adaptador permite pasar indicaciones generadas por un LLM en lenguaje natural directamente al modelo de imagen.
- Investigación en destilación de text encoders: el repositorio incluye metadatos de entrenamiento, manifiestos de fusión y el LoRA sin fusionar, lo que permite estudiar cómo se transfiere el comportamiento de un profesor estructurado a un encoder de lenguaje natural.
- Evaluación de la robustez de Ideogram 4 ante indicaciones coloquiales: el adaptador puede usarse para probar los límites del modelo base cuando se le presentan descripciones ambiguas o poco estructuradas.
- Integración en herramientas de generación de imágenes para usuarios no técnicos: al eliminar la necesidad de conocer el formato JSON, el adaptador facilita el uso de Ideogram 4 en aplicaciones orientadas a un público general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas de calidad de imagen, adherencia a la indicación o comparación con el text encoder original.

## Requisitos de hardware

- VRAM estimada para inferencia: el text encoder fusionado en FP8 pesa 10,6 GB, por lo que se recomienda al menos 12 GB de VRAM solo para el encoder. El modelo completo de Ideogram 4 (9,3B parámetros) requerirá memoria adicional.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 16 GB o más de VRAM para un flujo de trabajo completo.
- En GPUs de consumo (RTX 3060 12 GB, RTX 4070) podría caber el encoder en FP8, pero el modelo DiT de Ideogram 4 probablemente exceda la memoria disponible.
- Despliegue: exclusivamente a través de ComfyUI, colocando el archivo en `ComfyUI/models/text_encoders/` y seleccionándolo en el cargador de text encoder de Ideogram 4.
- No se dispone de datos de latencia o throughput para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL 8B (stock) | Text encoder de visión-lenguaje | 8B | No especificado | Apache 2.0 | Hugging Face |
| Este adaptador (mrjackspade) | Text encoder adaptado con LoRA | No disponible | No especificado | Apache 2.0 | Hugging Face (experimental) |
| CLIP (usado en otros modelos de imagen) | Text encoder contrastivo | 400M aprox. | 77 tokens | MIT | Hugging Face |

La comparación directa con otros text encoders no es posible sin datos de rendimiento publicados. Este adaptador es específico para Ideogram 4 y no es intercambiable con otros modelos de imagen.

## Limitaciones y advertencias

- Proyecto experimental: el repositorio se marca explícitamente como experimental, con 0 descargas y 0 valoraciones en Hugging Face. No ha sido validado de forma independiente.
- Alcance limitado: solo funciona como reemplazo del text encoder de Ideogram 4 en ComfyUI; no es un modelo de texto independiente ni un generador de imágenes autónomo.
- Riesgo de alucinación o degradación: al ser un adaptador entrenado por destilación, puede producir condicionamientos inesperados en indicaciones fuera de la distribución del dataset de entrenamiento (Civitai).
- Dependencia del modelo base: requiere tener instalado Ideogram 4 y el flujo de trabajo de ComfyUI correspondiente.
- Sin garantías de producción: no se proporcionan benchmarks, ni pruebas de robustez, ni soporte oficial. No se recomienda su uso en entornos de producción sin una evaluación exhaustiva.
- Sesgos potenciales: el dataset de entrenamiento proviene de Civitai, que puede contener sesgos demográficos, culturales o de contenido. No se ha realizado una auditoría de sesgos.
- Licencia: aunque el adaptador es Apache 2.0, el uso final depende de la licencia de Ideogram 4 y de los términos de ComfyUI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrjackspade/Ideogram4-Natural-Language-Text-Encoder
- Modelo base Qwen3-VL (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen3-VL
- Ideogram 4 (modelo oficial, cuantización NF4): https://huggingface.co/ideogram-ai/ideogram-4-nf4
- Colección Ideogram 4 en Hugging Face: https://huggingface.co/collections/ideogram-ai/ideogram-4
- Repositorio GitHub de Ideogram 4: https://github.com/ideogram-oss/ideogram4
- Blog técnico de Ideogram 4.0: https://ideogram.ai/blog/ideogram-4.0/
