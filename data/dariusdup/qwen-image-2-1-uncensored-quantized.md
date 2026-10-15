# Dariusdup/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Dariusdup/Qwen-Image-2.1-Uncensored-Quantized es un repositorio de cuantizaciones del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicado por el usuario Dariusdup. No se trata de un modelo nuevo ni de un ajuste fino: el propio repositorio indica que emplea los pesos base originales ("using the original upstream base weights") y se limita a distribuir versiones comprimidas en GGUF, safetensors y MLX, junto con los ficheros auxiliares necesarios (codificador de texto Qwen3-VL 8B y VAE) para ejecutarlo en ComfyUI. El componente de generación visual tiene 7.115.124.736 parámetros y se organiza en 32 capas Single-Stream DiT.

El problema que resuelve es práctico: el modelo original en BF16 ocupa del orden de 14 GB solo en el transformador de difusión, a lo que hay que sumar un codificador de texto de 17,5 GB en BF16. Este repositorio ofrece variantes desde Q4_0 (4,15 GB) hasta BF16 (14,23 GB), además de formatos específicos para NVIDIA (FP8, INT8 ConvRot, NVFP4) y para Apple Silicon (MLX 4/6/8 bits), de modo que la inferencia local resulta viable en GPU de consumo y en equipos Mac.

La etiqueta "uncensored" es relevante para entender el contexto: según las fuentes consultadas, los pesos oficiales de Qwen-Image-2.1 no incorporan un clasificador de seguridad y las versiones "uncensored" que circulan son el mismo modelo sin modificar. La diferencia real está en el filtrado de prompts, que sí aplican las versiones alojadas por Alibaba, y en la licencia, que sigue siendo qwen-research y por tanto restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único, 32 capas Single-Stream; pipeline text-to-image unificado con edición de imagen |
| Parámetros totales | 7.115.124.736 (dato de safetensors, componente de generación visual) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no secuencial de texto) |
| Tipos de cuantización | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | other / qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF y safetensors (incluye variantes MLX en safetensors) |
| Codificador de texto | Qwen3-VL 8B en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB) |
| VAE | qwen_image_2.1_vae_bf16.safetensors (676 MB) |
| Tamaño del repositorio | 105,2 GB |
| Modelo base | Qwen/Qwen-Image-2.1 (relación: quantized) |
| Pipeline declarado | text-to-image |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Qwen-Image-2.1 es un modelo de difusión con arquitectura DiT (Diffusion Transformer) en configuración Single-Stream, con 32 capas y aproximadamente 7B de parámetros en el componente de generación visual. Según el repositorio oficial de QwenLM, se trata de un modelo unificado de generación de texto a imagen y edición de imágenes, diseñado para equilibrar calidad de generación, eficiencia de inferencia y versatilidad. El pipeline completo combina un codificador de texto multimodal Qwen3-VL de 8B, el transformador de difusión y un VAE.

Este repositorio concreto no aporta información sobre el entrenamiento: no se documentan número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se describe ningún proceso de destilación o fine-tuning propio, y el propio autor indica que se parte de los pesos originales, por lo que la única transformación aplicada es la cuantización posterior al entrenamiento (PTQ). La innovación técnica destacable, por tanto, no está en el modelo sino en la cobertura de formatos: cuantización GGUF k-quant, FP8, INT8 con rotación de convolución (ConvRot), NVFP4 para GPU Blackwell y cuantizaciones MLX optimizadas para Apple Silicon.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con el pipeline declarado en el repositorio.
- Edición de imágenes: el modelo base Qwen-Image-2.1 se presenta como un modelo unificado de generación y edición, por lo que las capacidades de manipulación de imágenes están heredadas del modelo original.
- Renderizado de texto dentro de la imagen: es una de las capacidades por las que se caracteriza la familia Qwen-Image en los materiales consultados, aunque el repositorio no aporta cifras propias.
- Procesamiento de prompts multilingües: no hay datos explícitos en la información proporcionada; el codificador Qwen3-VL es un modelo multimodal multilingüe, pero no se documenta el comportamiento específico.
- Ejecución local sin clasificador de seguridad: los pesos publicados no incorporan safety checker, a diferencia de las versiones alojadas por Alibaba que sí filtran prompts.
- Compatibilidad con ComfyUI mediante ComfyUI-GGUF (fork de leejet), lo que habilita flujos de trabajo con nodos y encadenamiento con otros modelos.
- Compatibilidad con Apple Silicon mediante los formatos MLX.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso: no es un modelo de lenguaje, es un modelo de difusión para imágenes.

## Casos de uso

- Ilustración y concept art en local: con la cuantización Q4_K_M (4,60 GB) más el codificador de texto INT8 (9,35 GB) el modelo cabe en una GPU de 16 GB, lo que permite generar imágenes de forma iterativa en un equipo de trabajo sin depender de APIs externas.
- Integración en pipelines de ComfyUI: el repositorio empaqueta transformador, codificador de texto y VAE con la estructura de directorios esperada, de modo que se puede montar un flujo de generación por lotes dentro de ComfyUI y automatizarlo con sus nodos.
- Edición de imágenes en flujos de diseño: al heredar la capacidad de edición del modelo base, resulta adecuado para tareas de retoque guiado por prompt, variaciones de una imagen de referencia o sustitución de elementos concretos dentro de una composición.
- Prototipado de assets para videojuegos y animación: la generación controlada por prompt permite producir borradores de sprites, texturas, fondos o elementos de interfaz antes de invertir horas de trabajo de un artista.
- Investigación sobre sesgos y seguridad en modelos de difusión: disponer de los pesos sin filtrado en el prompt permite analizar de forma reproducible qué contenido genera el modelo ante entradas sensibles, y comparar ese comportamiento con las versiones que sí aplican filtros.
- Generación de material gráfico para campañas: con la licencia qwen-research el uso comercial queda restringido, por lo que el escenario realista es la generación de propuestas y maquetas internas que después se rehacen o se licencian por otras vías.
- Despliegue en portátiles Apple Silicon: las variantes MLX de 4, 6 y 8 bits (4,00 GB, 5,78 GB y 7,56 GB) permiten ejecutar el modelo en un Mac con memoria unificada suficiente, sin GPU dedicada.
- Pruebas de cuantización y evaluación de degradación: al publicar doce variantes del mismo modelo, el repositorio sirve para medir empíricamente la pérdida de calidad entre Q4_0, Q5_K_M, Q6_K, Q8_0, FP8, NVFP4 y BF16 sobre un mismo conjunto de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) pero no incluye cifras en texto, y el repositorio no aporta valores de FID, CLIP score, GenEval ni comparaciones numéricas con otros modelos. Tampoco se documentan latencias ni throughput medidos para las distintas cuantizaciones.

## Requisitos de hardware

Tamaños de fichero del transformador de difusión, según la model card:

| Cuantización | Tamaño | Notas |
|---|---:|---|
| BF16 (GGUF) | 14,23 GB | Máxima calidad, requiere GPU de 24 GB o más |
| Q8_0 | 7,59 GB | |
| FP8 (safetensors) | 6,63 GB | Aceleración nativa en GPU Ada/Hopper |
| INT8 ConvRot | 6,76 GB | Alto rendimiento en GPU compatibles |
| Q6_K | 5,88 GB | |
| Q5_K_M | 5,22 GB | |
| Q4_K_M | 4,60 GB | Recomendada por el autor por equilibrio tamaño/calidad |
| Q4_0 | 4,15 GB | |
| NVFP4 | 4,20 GB | Requiere GPU Blackwell para formato nativo |
| MLX 4-bit | 4,00 GB | Apple Silicon |
| MLX 6-bit | 5,78 GB | Apple Silicon |
| MLX 8-bit | 7,56 GB | Apple Silicon |

- VRAM estimada para el pipeline completo: hay que sumar el codificador de texto (17,53 GB en BF16 o 9,35 GB en INT8 ConvRot) y el VAE (676 MB). Con Q4_K_M + codificador INT8 + VAE el total ronda los 14,6 GB de ficheros, más el overhead de activaciones y del propio ComfyUI.
- GPU recomendadas: H100 o A100 para BF16 sin compresión; RTX 4090 (24 GB) para BF16 o Q8_0 con margen; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M o Q5_K_M con codificador INT8; RTX 3060 12 GB como límite práctico con Q4_0/Q4_K_M.
- Cabe en GPU de consumo: sí, en las cuantizaciones de 4 y 5 bits, siempre que se combine con el codificador de texto INT8 en lugar del BF16.
- Apple Silicon: soportado vía MLX; un Mac con 16 GB de memoria unificada puede ejecutar las variantes de 4 bits, y con 24 GB o más las de 6 y 8 bits.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (el autor recomienda el fork de leejet, con soporte nativo de Qwen-Image 2.1); MLX para Apple Silicon. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dariusdup/Qwen-Image-2.1-Uncensored-Quantized | 7,1B (componente de generación visual) | no aplica | no disponible | qwen-research | GGUF, safetensors, MLX en HuggingFace |
| Qwen/Qwen-Image-2.1 (base) | 7,1B (32 capas Single-Stream DiT) | no aplica | no disponible en la información recogida | qwen-research | Pesos originales en HuggingFace, con filtrado de prompts en la versión alojada |
| kkguku/Qwen-Image-2.1-Uncensored-GGUF | derivado del base | no aplica | no disponible | qwen-research | GGUF para ComfyUI |
| AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF | derivado del base | no aplica | no disponible | qwen-research | GGUF, variante Turbo |

La comparación se limita a lo que consta en las fuentes consultadas: las tres alternativas son derivados del mismo modelo base y comparten licencia y arquitectura, diferenciándose únicamente en el conjunto de cuantizaciones ofrecidas y en el empaquetado de ficheros auxiliares. No se dispone de datos de rendimiento comparativos entre ellas.

## Limitaciones y advertencias

- La etiqueta "uncensored" no implica pesos modificados: las fuentes consultadas indican que los ficheros apuntan a los pesos originales sin alterar. Lo que cambia respecto a las versiones alojadas por Alibaba es la ausencia de filtrado de prompts, no el modelo.
- Licencia qwen-research: es una licencia de investigación con restricciones para uso comercial. No debe utilizarse en producción comercial sin revisar los términos y, en su caso, obtener una licencia alternativa.
- Uso legal del contenido generado: al no existir filtros, la responsabilidad sobre las imágenes producidas recae por completo en quien ejecuta el modelo. Puede generar contenido para el que existan restricciones legales según la jurisdicción.
- Riesgo de artefactos y de falta de fidelidad al prompt: como cualquier modelo de difusión cuantizado, las variantes de 4 bits pueden degradar la coherencia anatómica, la composición y el renderizado de texto respecto a BF16. No se han publicado métricas que cuantifiquen esa pérdida.
- Sesgos: no hay documentación en la información proporcionada sobre composición del dataset ni sobre evaluación de sesgos demográficos, culturales o de representación.
- Idiomas: no se documenta el comportamiento del modelo ante prompts en distintos idiomas, ni qué lenguas están soportadas de forma fiable.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de terceros sobre la integridad de los ficheros ni sobre su funcionamiento.
- Discrepancia de espacio de nombres: la propia model card enlaza los ficheros bajo el espacio `abenzerps/`, mientras que el identificador del repositorio consultado es `Dariusdup/`. Conviene verificar el origen de los pesos antes de usarlos.
- Dependencia de un fork concreto: el autor advierte de que la versión antigua de ComfyUI-GGUF (`city96`) puede fallar con el error "Unknown model architecture!" y recomienda el fork de `leejet`, lo que añade una dependencia no estándar al despliegue.
- Tamaño del repositorio: 105,2 GB, lo que exige planificar el espacio en disco antes de clonar o descargar las variantes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dariusdup/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado, leejet): https://github.com/leejet/ComfyUI-GGUF
- Cuantizaciones alternativas: https://huggingface.co/kkguku/Qwen-Image-2.1-Uncensored-GGUF
- Variante Turbo: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Análisis sobre la versión "uncensored": https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Análisis sobre filtros, licencia y aspectos legales: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
- Formulario de peticiones del autor: https://abenzerps.com/request-a-model/
