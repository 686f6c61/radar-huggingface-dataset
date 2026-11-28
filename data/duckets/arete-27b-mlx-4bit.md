# Duckets/Arete-27B-MLX-4bit

## Resumen

Arete-27B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo NousResearch/Arete-27B, un ajuste fino de alineación de valores (SFT) sobre Qwen3.8-27B desarrollado por Nous Research. La conversión la publica el usuario Duckets y está pensada específicamente para su ejecución en Apple Silicon mediante MLX y LM Studio, lo que permite desplegar un modelo de 27.000 millones de parámetros en equipos Mac con memoria unificada.

El modelo resuelve el problema de ejecutar un LLM multimodal de gran tamano en hardware de consumo Apple sin necesidad de GPUs dedicadas. Con 27.356.728.560 parámetros y una ventana de contexto de 256K tokens (según la verificación del autor), ofrece capacidades de razonamiento, matemáticas y visión (image-text-to-text) en un checkpoint de aproximadamente 15 GiB en disco.

Es relevante porque combina una arquitectura moderna de Qwen3.8 con un ajuste de alineación de valores de Nous Research, empaquetado en 4 bits (4.695 bpw) para MLX. La licencia Apache-2.0 facilita su uso comercial, aunque la documentación disponible es escasa y proviene fundamentalmente de la model card del conversor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según verificación del autor en Splash 1.7.3) |
| Tipos de cuantizacion | 4-bit MLX (4.695 bpw) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es NousResearch/Arete-27B, descrito como un ajuste fino supervisado (SFT) de alineación de valores sobre Qwen3.8-27B. No se detallan en la información proporcionada los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo etapas de RLHF o DPO adicionales. La arquitectura subyacente corresponde a Qwen3.8, un transformer multimodal capaz de procesar entradas de imagen y texto, aunque los detalles internos (número de capas, dimensiones, mecanismos de atención) no están disponibles.

La conversión a MLX se realizó con `mlx_vlm.convert` a partir del checkpoint BF16 de origen (revisión `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`), produciendo un checkpoint de 4 bits a 4.695 bits por peso. El autor indica que el checkpoint fue reconstruido desde el maestro BF16 y reverificado el 2026-11-27. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de las propias de la arquitectura Qwen3.8.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento aritmético y matemático básico (verificado por el autor: 17 × 23 = 391, √169 = 13).
- Comprensión de imágenes (image-text-to-text): identificación de imágenes de color sólido verificada ("red").
- Procesamiento de contexto largo: soporte de hasta 256K tokens según la verificación del autor.
- Integración con LM Studio y mlx-vlm para inferencia en Apple Silicon.
- Capacidades de tool calling y function calling: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno en inglés ejecutándose íntegramente en Apple Silicon con MLX, sin depender de la nube, gracias a su formato de 4 bits y ~15 GiB en disco.
- Análisis de documentos largos: con una ventana de 256K tokens, es adecuado para resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Procesamiento de imágenes con descripción textual: al ser image-text-to-text, puede emplearse para tareas de captioning, clasificación visual simple o respuesta a preguntas sobre imágenes en pipelines locales.
- Prototipado de investigación en alineación de valores: al ser un SFT de alineación de Nous Research, sirve para estudiar el comportamiento de modelos alineados en un entorno de escritorio reproducible.
- Desarrollo de aplicaciones offline en macOS: integrable vía LM Studio o mlx-vlm en herramientas de escritorio que requieran privacidad de datos y no puedan usar APIs externas.
- Evaluación de razonamiento matemático: útil como banco de pruebas para comparar la calidad de respuestas aritméticas en cuantización 4-bit frente al checkpoint BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor sí reporta una medición de rendimiento de inferencia: aproximadamente 114 tok/s de decodificación a contexto completo de 256K en un Apple M5 Max con 128 GB de memoria unificada, ejecutando el checkpoint idéntico en el motor Splash 1.7.3.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~15 GiB en disco para el checkpoint 4-bit; se recomienda al menos 32 GB de memoria unificada para cargar el modelo con margen, y más para contextos largos.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada; verificado en M5 Max de 128 GB.
- Compatibilidad con GPU de consumo: no está pensado para GPUs NVIDIA/AMD; el formato MLX es específico de Apple Silicon. No se indica compatibilidad con RTX 4090 u otras.
- Opciones de despliegue: MLX (`mlx_vlm`), LM Studio, motor Splash (paquete Duckets/Arete-27B-Splash).
- Latencia y throughput: ~114 tok/s de decodificación a 256K de contexto en M5 Max 128 GB (dato del autor).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de la misma categoría, por lo que no es posible establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano no está verificado.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Alucinación: no se han publicado evaluaciones de fiabilidad o tasa de alucinación; como todo LLM, existe riesgo, especialmente en contextos largos.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base NousResearch/Arete-27B y de Qwen3.8.
- Cuantización: el paso a 4 bits (4.695 bpw) puede degradar ligeramente la precisión frente al checkpoint BF16; no se han publicado comparativas formales de calidad.
- Plataforma: el formato MLX limita su uso a Apple Silicon; no es portable a CUDA sin reconversión.
- LM Studio: el autor advierte de un problema de visibilidad del repositorio en el catálogo de LM Studio que requiere renombrar la carpeta descargada.
- Documentación escasa: la model card no detalla datos de entrenamiento, arquitectura interna ni evaluaciones formales.

## Enlaces

- Hugging Face: https://huggingface.co/Duckets/Arete-27B-MLX-4bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Paquete Splash del mismo modelo: https://huggingface.co/Duckets/Arete-27B-Splash
