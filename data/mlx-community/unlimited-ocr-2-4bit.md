# mlx-community/Unlimited-OCR-2-4bit

## Resumen

Unlimited-OCR-2-4bit es la versión cuantizada a 4 bits, para el framework MLX de Apple Silicon, del modelo de OCR baidu/Unlimited-OCR-2 desarrollado por Baidu. Se trata de un modelo de visión-lenguaje (vision-language) especializado en reconocimiento y parseo de documentos, con una arquitectura que combina torres de visión SAM y CLIP con un modelo de lenguaje de aproximadamente 3.340 millones de parámetros. Su propósito es resolver el problema del OCR de alta fidelidad: extraer texto de documentos manteniendo la estructura (bloques, etiquetas, coordenadas) y gestionando documentos de múltiples páginas en una sola petición.

Su relevancia actual radica en la creciente demanda de modelos de OCR nativos capaces de convertir PDFs, escaneos y documentos complejos en Markdown estructurado, una tarea habitual en pipelines de RAG y digitalización. La versión MLX 4-bit ocupa unos 2,6 GB, lo que lo hace ejecutable en portátiles Apple Silicon con memoria unificada modesta. Destaca por su modo "gundam" (vista global más recortes locales) y por su atención block-sparse DASH con page2d RoPE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: torres de visión SAM + CLIP, router DASH por capa y modelo de lenguaje (base: baidu/Unlimited-OCR-2) |
| Parametros totales | 3.340.043.008 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (group size 64) en el modelo de lenguaje; SAM, CLIP y router DASH en bfloat16 |
| Idiomas soportados | multilingüe (lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base combina dos torres de visión (SAM y CLIP) con un modelo de lenguaje al que se incorpora un router DASH por capa, un mecanismo de atención block-sparse diseñado para documentos, junto con codificación posicional page2d RoPE. Esta combinación permite razonar sobre la disposición espacial de la página (layout) y no solo sobre el contenido textual. El modo "gundam" de procesamiento genera una vista global de 1024 píxeles más hasta 16 recortes locales de alta resolución por página, lo que permite capturar tanto la estructura general como el detalle fino del texto.

La conversión a MLX se realizó con mlx-vlm aplicando cuantización afín de 4 bits con group size 64 únicamente sobre el modelo de lenguaje, manteniendo las torres de visión y el router DASH en bfloat16 para preservar la precisión en la percepción visual. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- OCR y parseo de documentos de una o varias páginas en una sola petición (una vista base de 1024 por página).
- Salida estructurada con etiquetas `<PAGE>`, `<BLOCK>label[x0, y0, x1, y1]<FORK>texto`, incluyendo coordenadas de cada bloque.
- Marcado de bloques que continúan entre páginas (`cross_*` / `append_*`), con convertidor a Markdown incluido en el repositorio original.
- Pipeline image-text-to-text conversacional: admite instrucciones en lenguaje natural sobre imágenes.
- Procesamiento de documentos con layout complejo gracias a page2d RoPE y atención block-sparse DASH.
- Capacidades multilingües (idiomas concretos no disponibles).
- No se dispone de información sobre tool calling, agentes, código, matemáticas ni modalidades de audio.

## Casos de uso

- Digitalización de archivos documentales: conversión de PDFs escaneados a Markdown estructurado para alimentar sistemas RAG, aprovechando el convertidor a Markdown del repositorio original.
- Indexación de documentos multpágina: el modelo acepta varias imágenes en una misma petición (hasta 16384 tokens de salida configurables), lo que permite procesar informes o contratos completos manteniendo la coherencia entre páginas mediante las etiquetas `cross_*`.
- Extracción de datos con localización: las coordenadas `[x0, y0, x1, y1]` de cada bloque permiten resaltar el texto extraído sobre la imagen original, útil en herramientas de revisión y verificación humana.
- Procesamiento de facturas y formularios: la salida estructurada por bloques con etiquetas facilita el parseo posterior a JSON o bases de datos.
- OCR de documentos con layout complejo (tablas, columnas, sellos): la vista global más recortes locales del modo gundam captura tanto la estructura como el detalle del texto pequeño.
- Aplicaciones locales en Apple Silicon: con 2,6 GB de pesos, puede ejecutarse en portátiles MacBook sin GPU dedicada, adecuado para flujos de trabajo con requisitos de privacidad.
- Preprocesamiento en pipelines de IA documental: como paso de ingesta previo a LLMs de texto, convirtiendo documentos a texto limpio y estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: unos 2,6 GB solo de pesos; con overhead de KV cache y torres de visión en bfloat16, se estima un consumo práctico de aproximadamente 4-6 GB de memoria unificada (estimación, no dato publicado).
- Diseñado para Apple Silicon mediante MLX: funciona en MacBook con chips M1/M2/M3/M4; no requiere GPU dedicada.
- No es directamente ejecutable en GPUs NVIDIA con este repositorio (formato MLX); para CUDA habría que usar el modelo base baidu/Unlimited-OCR-2.
- Despliegue: mlx-vlm (requiere la rama con soporte de page2d RoPE y DASH hasta que se integre en la versión estable). No hay información sobre soporte en vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Especializacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| mlx-community/Unlimited-OCR-2-4bit | 3,34 B | 4-bit (LM), bf16 (vision) | OCR y parseo de documentos | MIT | MLX (Apple Silicon) |
| baidu/Unlimited-OCR-2 (base) | 3,34 B | bf16 | OCR y parseo de documentos | MIT | PyTorch / CUDA |
| PaddleOCR-VL (Baidu) | no disponible | no disponible | OCR documental | no disponible | no disponible |
| Qwen2-VL-2B | 2 B | varias | Vision-language generalista | no disponible | PyTorch, GGUF, MLX |

Nota: la comparativa se limita a la información disponible; los datos de rendimiento no están publicados para este modelo.

## Limitaciones y advertencias

- El soporte de page2d RoPE y DASH block-sparse attention aún no está integrado en la versión estable de mlx-vlm: hay que instalar desde una rama específica, lo que puede introducir inestabilidad.
- La cuantización a 4 bits del modelo de lenguaje puede degradar ligeramente la calidad del texto extraído respecto al modelo base en bfloat16 (no se han publicado evaluaciones comparativas).
- No se ha publicado información sobre benchmarks, tasas de error (CER/WER) ni sesgos conocidos del modelo.
- El formato de salida con etiquetas `<PAGE>`/`<BLOCK>` requiere el convertidor a Markdown del repositorio original; usar la salida cruda directamente puede no ser adecuado.
- La lista de idiomas soportados se indica como "multilingual" sin detalle; conviene validar el rendimiento en el idioma objetivo (incluido el castellano) antes de producción.
- La licencia MIT permite uso comercial sin restricciones destacables.
- Al ser un modelo especializado en OCR, no es adecuado como asistente conversacional generalista.

## Enlaces

- Modelo cuantizado MLX: https://huggingface.co/mlx-community/Unlimited-OCR-2-4bit
- Modelo original de Baidu: https://huggingface.co/baidu/Unlimited-OCR-2
- mlx-vlm (rama con soporte): https://github.com/shuuul/mlx-vlm.git
- Repositorio mlx-vlm principal: https://github.com/Blaizzy/mlx-vlm
