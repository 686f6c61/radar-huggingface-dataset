# ldov/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una recopilación de cuantizaciones del modelo de generación de imágenes texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario ldov. El repositorio no introduce pesos nuevos: redistribuye el modelo base en formatos GGUF y safetensors con distintos niveles de precisión, etiquetados como "uncensored", y añade los ficheros auxiliares necesarios para ejecutarlo en ComfyUI (codificador de texto Qwen3-VL 8B y VAE). El modelo declarado tiene 7.115.124.736 parámetros (unos 7,1 mil millones) correspondientes al transformer de difusión.

Su relevancia práctica es doble. Por un lado, permite ejecutar localmente un generador de imágenes de última generación en hardware de consumo, al reducir el transformador de difusión de 14,23 GB (BF16) hasta 4,15 GB (Q4_0). Por otro, ofrece variantes sin los filtros de contenido del modelo original, lo que interesa a equipos de investigación en seguridad, red teaming y arte generativo que necesitan salidas no restringidas.

La ficha del autor no documenta la arquitectura interna, los datos de entrenamiento ni resultados numéricos de benchmarks (solo incluye una imagen de gráfico sin valores legibles en el texto extraído). El repositorio tiene 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que se trata de una publicación sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión para generación de imágenes (el autor no especifica si es DiT, MMDiT o híbrida); el repositorio solo indica "image-generation" y pipeline text-to-image |
| Parámetros totales | 7.115.124.736 (unos 7,1 mil millones), dato real de safetensors correspondiente al transformer de difusión |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusión; la ficha no documenta ventana de contexto en tokens) |
| Tipos de cuantización | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0. Safetensors: FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit |
| Idiomas soportados | no disponible (la ficha no lo indica; el codificador de texto asociado es Qwen3-VL 8B) |
| Licencia | qwen-research (license: other, license_name: qwen-research), heredada del modelo base Qwen/Qwen-Image-2.1 |
| Formato de pesos | GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16) y safetensors (FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit) |
| Modelo base | Qwen/Qwen-Image-2.1 (relación declarada: quantized) |
| Tamaño del repositorio | 105,2 GB |
| Codificador de texto | Qwen3-VL 8B en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB) |
| VAE | qwen_image_2.1_vae_bf16.safetensors (676 MB) |
| Librería | gguf |
| Descargas / me gusta | 0 / 0 |
| Fecha de creación | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base Qwen/Qwen-Image-2.1. Por el pipeline declarado (text-to-image), los ficheros que se distribuyen y el tamaño de los pesos (7,1 mil millones de parámetros en 14,23 GB a BF16), se trata de un generador de imágenes por difusión que consume embeddings de texto producidos por un codificador Qwen3-VL 8B y decodifica latentes con un VAE específico (qwen_image_2.1_vae_bf16). No se detalla si emplea atención completa, atención lineal, MM-DiT ni ninguna otra variante concreta, ni el número o tipo de pasos de muestreo soportados.

Tampoco hay datos sobre el entrenamiento: no se indica el número de tokens o pares imagen-texto utilizados, la composición del dataset, ni si hubo fases de ajuste por preferencias (RLHF, DPO) o destilación. La única modificación documentada por el autor de esta publicación es la cuantización del modelo original (relación `base_model_relation: quantized`) y la eliminación de los filtros de contenido en las variantes marcadas como "uncensored"; el autor afirma que las versiones sin censura se generan "using the original upstream base weights", pero no detalla el procedimiento exacto de intervención.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Ejecución local en ComfyUI mediante el nodo `Unet Loader (GGUF)`, con flujo de trabajo estándar de difusión.
- Selección entre doce niveles de cuantización distintos, desde BF16 sin pérdida aparente hasta Q4_0, lo que permite ajustar el equilibrio entre fidelidad y memoria.
- Variantes "uncensored" (sufijo UC) que, según el autor, eliminan las restricciones de contenido del modelo original.
- Variantes MLX (4, 6 y 8 bits) orientadas a ejecución en silicio de Apple, y NVFP4/FP8 orientadas a GPUs con soporte de esos formatos.
- Codificador de texto multimodal Qwen3-VL 8B incluido en el repositorio, en BF16 e INT8, lo que permite un despliegue autocontenido sin descargar dependencias externas.
- VAE específico incluido (qwen_image_2.1_vae_bf16.safetensors).

No se documentan en la información disponible capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, modo "thinking", entrada de audio ni comprensión de imágenes de entrada; se trata de un modelo de generación de imágenes, no de un modelo de lenguaje conversacional.

## Casos de uso

- Generación local de ilustraciones y concept art sin conexión: con la cuantización Q4_K_M (4,60 GB) más el codificador de texto INT8 y el VAE, el modelo cabe en GPUs de 16 GB y permite trabajar en entornos sin acceso a internet, útil cuando la propiedad intelectual de los prompts no puede salir de la organización.
- Prototipado rápido de assets para videojuegos independientes: un estudio pequeño puede generar variaciones de personajes, entornos y objetos iterando prompts en ComfyUI, sustituyendo bocetos manuales en fases tempranas de diseño.
- Investigación en seguridad y alineación de modelos generativos: las variantes "uncensored" permiten estudiar qué contenidos produce el modelo base cuando se retiran sus salvaguardas, un escenario habitual en red teaming y en la elaboración de taxonomías de riesgo.
- Generación de datos sintéticos para visión por computador: producción de imágenes etiquetadas por prompt para aumentar conjuntos de entrenamiento de clasificadores o detectores, con la ventaja de que el control de la distribución se hace por texto.
- Automatización de catálogos de comercio electrónico: integración del modelo en un pipeline ComfyUI invocado por API para generar variaciones de fondo, iluminación o encuadre de fotografías de producto, aprovechando la licencia del modelo base (verificable antes de uso comercial).
- Creación de material editorial y storyboards: generación de bocetos secuenciales a partir de descripciones de escena, con iteración rápida gracias a las cuantizaciones ligeras que reducen el tiempo de carga del modelo en memoria.
- Experimentación artística y ajuste fino posterior: el repositorio incluye pesos en GGUF y safetensors, lo que facilita el entrenamiento de LoRAs o adaptadores sobre la versión FP8/INT8 en lugar de descargar el modelo base completo.
- Despliegue en estaciones de trabajo Apple Silicon: las variantes MLX 4/6/8-bit (4,00 / 5,78 / 7,56 GB) permiten ejecutar el modelo en equipos con memoria unificada, sin GPU dedicada.
- Docencia y formación en IA generativa: el abanico de cuantizaciones del mismo modelo permite comparar en clase el efecto de la precisión sobre la calidad de salida con un único modelo de referencia.

## Benchmarks y rendimiento

La ficha del autor incluye una imagen (`assets/Qwen-Image-2.1-Benchmark.png`) como referencia de benchmark, pero no se han extraído valores numéricos de ella. No se han publicado resultados de benchmarks en la información disponible.

No hay datos comparativos de FID, CLIP score, GenEval, HPSv2 ni de ningún otro conjunto de evaluación para este repositorio ni para el modelo base Qwen/Qwen-Image-2.1 en la documentación consultada.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas de los tamaños de fichero indicados en la ficha; el autor no publica requisitos oficiales.

- Huella de memoria del sistema completo (transformer + codificador de texto + VAE):
  - Configuración mínima: Q4_0 (4,15 GB) + codificador INT8 ConvRot (9,35 GB) + VAE (0,68 GB) ≈ 14,2 GB.
  - Configuración recomendada por el autor: Q4_K_M (4,60 GB) + INT8 (9,35 GB) + VAE (0,68 GB) ≈ 14,6 GB.
  - Configuración de alta fidelidad: BF16 GGUF (14,23 GB) + codificador BF16 (17,53 GB) + VAE (0,68 GB) ≈ 32,4 GB.
- GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 8 GB): viables solo con Q4_0/Q4_K_M y descargando parte del codificador de texto a memoria del sistema, con penalización de velocidad.
- GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080): configuración Q4_K_M o Q5_K_M con codificador INT8 en VRAM completa.
- GPUs de 24 GB (RTX 3090, RTX 4090): Q6_K o Q8_0 con codificador BF16 y margen para lotes de varias imágenes.
- GPUs de centro de datos (A100 40/80 GB, H100 80 GB): necesarias para BF16 con paralelismo o para servir varias peticiones concurrentes.
- Apple Silicon: las variantes MLX 4/6/8-bit están pensadas para memoria unificada; un equipo con 16 GB unificados puede alojar la versión 4-bit del transformer, aunque el codificador de texto añade presión de memoria.
- Despliegue: ComfyUI con el nodo `Unet Loader (GGUF)` y el complemento ComfyUI-GGUF; el autor recomienda específicamente el fork `leejet/ComfyUI-GGUF` con soporte nativo de Qwen-Image 2.1 y advierte de que el fork antiguo `city96/ComfyUI-GGUF` falla con `Unknown model architecture!` salvo que se añada `ModelQwenImage` a `tools/convert.py`. Para las variantes MLX se requiere el ecosistema MLX de Apple; para FP8/INT8 ConvRot/NVFP4 no se documenta el runtime concreto.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, pasos de muestreo ni resultados de tokens o imágenes por segundo en ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| ldov/Qwen-Image-2.1-Uncensored-GGUF (Q4_K_M) | ~7,1 mil millones (transformer) + codificador 8B | GGUF | 4,60 GB (transformer) | no aplica | qwen-research | sin datos numéricos |
| ldov/Qwen-Image-2.1-Uncensored-GGUF (BF16) | ~7,1 mil millones (transformer) + codificador 8B | GGUF | 14,23 GB (transformer) | no aplica | qwen-research | sin datos numéricos |
| Qwen/Qwen-Image-2.1 (modelo base, sin cuantizar) | ~7,1 mil millones (transformer), según los pesos redistribuidos aquí | no especificado en la información disponible | no disponible | no aplica | qwen-research | sin datos numéricos en la información disponible |
| Otras alternativas de generación texto-a-imagen de la misma categoría (por ejemplo, familias tipo FLUX o Stable Diffusion) | no disponible | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de parámetros, contexto, rendimiento, licencia ni disponibilidad de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con otras familias de generación de imágenes.

## Limitaciones y advertencias

- Modelo sin validación comunitaria: 0 descargas y 0 "me gusta" en el momento de la consulta, y con fecha de publicación muy reciente. No hay evidencia independiente de que las cuantizaciones funcionen correctamente ni de que la calidad se mantenga respecto al modelo base.
- Carácter "uncensored": las variantes con sufijo UC eliminan los filtros de contenido del modelo original. Esto implica riesgo real de generar material violento, sexual, difamatorio o ilegal según la jurisdicción, y traslada toda la responsabilidad de filtrado al usuario.
- Licencia qwen-research: la información disponible no detalla las condiciones concretas de uso comercial, redistribución ni atribución. Al tratarse de una licencia denominada "research" y heredada del modelo base, es imprescindible revisar los términos completos en el repositorio de Qwen/Qwen-Image-2.1 antes de cualquier uso en producción.
- Inconsistencia en los enlaces de la ficha: todos los enlaces a ficheros del README apuntan al repositorio de otro usuario (`abenzerps/Qwen-Image-2.1-Uncensored-GGUF`), no al repositorio `ldov` donde se aloja esta ficha. Esto sugiere que el README está copiado de otra publicación y dificulta verificar la procedencia real de los pesos.
- Riesgo de degradación por cuantización: no se publican métricas de calidad por nivel de cuantización. En modelos de difusión, las cuantizaciones agresivas (Q4_0, NVFP4, MLX 4-bit) pueden introducir artefactos, pérdida de detalle fino o degradación del seguimiento del prompt.
- Dependencia de ComfyUI y de un fork concreto: el flujo documentado requiere ComfyUI más ComfyUI-GGUF (fork `leejet`). Con el fork antiguo de `city96` el modelo no carga, y no se documenta compatibilidad con otros runtimes.
- Elevado consumo de memoria del codificador de texto: Qwen3-VL 8B en BF16 ocupa 17,53 GB, más que el propio transformer en BF16. Es el principal cuello de botella para ejecución en GPU de consumo.
- Idiomas: la ficha no declara idiomas soportados. No hay garantía documentada de que los prompts en castellano se interpreten con la misma fidelidad que en inglés.
- Sesgos: no hay información sobre la composición de los datos de entrenamiento del modelo base, por lo que no se pueden caracterizar sesgos demográficos, culturales o estilísticos.
- Alucinación: en un modelo de difusión el equivalente es la generación de elementos no solicitados en la imagen (objetos espurios, texto ilegible, malformaciones anatómicas). No se documentan tasas de error.
- Ficha incompleta: el README extraído se corta en la sección de uso, en la configuración del nodo `CLIPLoader`, por lo que faltan instrucciones finales sobre el VAE y el nodo de muestreo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ldov/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio referenciado en los enlaces del README: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado por el autor): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork antiguo, sin soporte de Qwen-Image 2.1 según la ficha): https://github.com/city96/ComfyUI-GGUF
- Imagen de benchmark referenciada en la ficha: assets/Qwen-Image-2.1-Benchmark.png (ruta relativa dentro del repositorio; no se han extraído valores numéricos)
