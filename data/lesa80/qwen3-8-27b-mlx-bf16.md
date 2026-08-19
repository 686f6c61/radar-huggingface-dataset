# lesa80/Qwen3.8-27B-MLX-bf16

## Resumen

Qwen3.8-27B-MLX-bf16 es una conversión en precisión completa (BF16) del modelo vision-language Qwen/Qwen3.8-27B al formato MLX, realizada por el usuario lesa80 mediante la librería mlx-vlm. Está diseñado para ejecutarse de forma nativa en hardware Apple Silicon (M1/M2/M3/M4), aprovechando el framework MLX de Apple para inferencia eficiente sin necesidad de GPUs dedicadas.

El modelo combina un codificador visual ViT de 27 capas con una arquitectura de lenguaje híbrida compuesta por 48 bloques Gated DeltaNet y 16 bloques Gated Attention, lo que le permite procesar texto, imágenes y vídeo. Con 27.356 millones de parámetros y una ventana de contexto nativa de 262.144 tokens (ampliable hasta 1M con YaRN), es un modelo de gran capacidad orientado a razonamiento multimodal, uso agéntico y comprensión de documentos extensos.

La relevancia de esta conversión radica en que acerca un modelo de 27B parámetros al ecosistema Apple, permitiendo a desarrolladores e investigadores ejecutar inferencia local en Mac con memoria unificada. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas. El autor mantiene también una versión cuantizada a 4-bit para equipos con menos memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48×Gated DeltaNet + 16×Gated Attention, con codificador visual ViT de 27 capas (patch_size=16, temporal_patch_size=2) |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens nativa, hasta 1.048.576 con YaRN |
| Tipos de cuantizacion | BF16 (esta conversión); existe versión 4-bit separada |
| Idiomas soportados | Ruso, inglés, chino y otros (lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo es híbrida: combina 48 bloques con Gated DeltaNet, una variante de atención lineal eficiente que reduce el coste computacional en secuencias largas, con 16 bloques de Gated Attention de atención completa. Este diseño permite manejar ventanas de contexto de 262K tokens con un coste inferior al de un transformer de atención completa puro, manteniendo la capacidad de capturar dependencias de largo alcance.

El componente visual consiste en un codificador ViT de 27 capas con patch_size de 16 píxeles y temporal_patch_size de 2, lo que le permite procesar tanto imágenes estáticas como secuencias de vídeo. El modelo soporta un modo de razonamiento explícito ("thinking mode") mediante tokens especiales `thinking` y `response`, con control del presupuesto de tokens de pensamiento a través del parámetro `thinking_budget`.

Los detalles específicos del entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Esta conversión MLX preserva las capacidades del modelo original sin reentrenamiento; el proceso de conversión se documenta en una guía HOWTO referenciada por el autor.

## Capacidades

- **Visión y vídeo**: comprensión de imágenes y vídeo mediante el codificador ViT de 27 capas, capaz de describir escenas, responder preguntas visuales y analizar contenido multimedia.
- **Razonamiento con modo "thinking"**: genera cadenas de razonamiento explícitas antes de responder, con control del presupuesto de tokens de pensamiento (`thinking_budget`) y activación mediante `enable_thinking`.
- **Contexto largo**: 262.144 tokens nativos, ampliables a 1M con YaRN, adecuado para documentos extensos, libros completos o conversaciones prolongadas.
- **Capacidades agénticas**: soporte para uso como agente de ordenador, navegador y móvil, permitiendo automatizar tareas interactivas.
- **Multilingüe**: soporta ruso, inglés, chino y otros idiomas, aunque la lista completa no está documentada en la información disponible.
- **Pipeline multimodal**: pipeline de `image-text-to-text` que acepta entradas mixtas de imagen y texto para generar respuestas textuales.

## Casos de uso

- **Análisis de imágenes en macOS**: investigadores y desarrolladores pueden ejecutar inferencia visual local en Mac con Apple Silicon, procesando imágenes médicas, documentos escaneados o contenido multimedia sin enviar datos a la nube. La integración con mlx-vlm permite cargar el modelo y generar descripciones o responder preguntas visuales con unas pocas líneas de Python.

- **Procesamiento de documentos extensos**: con 262K tokens de contexto nativo, el modelo puede analizar libros completos, informes anuales o expedientes legales de cientos de páginas, extrayendo información, resumiendo secciones o respondiendo preguntas sobre el contenido íntegro sin truncamiento.

- **Razonamiento matemático y lógico**: el modo "thinking" permite al modelo descomponer problemas complejos en pasos intermedios, útil para aplicaciones educativas, herramientas de cálculo o asistentes de investigación que requieren explicaciones detalladas y verificables.

- **Agentes autónomos de escritorio**: las capacidades de uso de ordenador, navegador y móvil permiten construir agentes que automatizan tareas como rellenar formularios, navegar por páginas web o interactuar con aplicaciones, todo ejecutado localmente en hardware Apple.

- **Asistente multilingüe de atención al cliente**: el soporte para ruso, inglés y chino, combinado con la ventana de contexto larga, lo hace adecuado para sistemas de atención al cliente que gestionan conversaciones multi-turno extensas en varios idiomas, con la ventaja de ejecución local y privacidad de datos.

- **Prototipado de aplicaciones de visión por computador**: desarrolladores de macOS pueden prototipar y validar pipelines de visión (clasificación de imágenes, OCR, análisis de vídeo) localmente con un modelo de 27B sin depender de servicios cloud ni GPUs dedicadas, acelerando el ciclo de iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas como MMLU, HumanEval, GSM8K ni benchmarks de visión (MMMU, DocVQA). Para datos de rendimiento del modelo base Qwen/Qwen3.8-27B, se recomienda consultar la documentación oficial de Qwen en HuggingFace.

## Requisitos de hardware

- **Plataforma**: exclusivamente macOS con Apple Silicon (M1, M2, M3, M4). No compatible con GPUs NVIDIA ni hardware x86.
- **Memoria RAM**: se recomiendan 64 GB o más, dado que el modelo en BF16 ocupa aproximadamente 51 GB en memoria unificada.
- **VRAM**: no aplica; MLX utiliza la memoria unificada del Apple Silicon.
- **Equipos compatibles**: Mac Studio, MacBook Pro y Mac mini con chips M1 Max/Ultra, M2 Max/Ultra, M3 Max/Ultra o M4 Max/Ultra son los candidatos más realistas. Los chips base con 16-32 GB de RAM deberían usar la versión 4-bit en lugar de BF16.
- **Despliegue**: mediante la librería `mlx-vlm` (Python) o la CLI `mlx_vlm.generate`. No es compatible con vLLM, llama.cpp u Ollama en su formato actual, al estar optimizado para el ecosistema MLX.
- **Latencia y throughput**: no disponibles en la información proporcionada. Se espera una latencia mayor que la de la versión 4-bit, dado que BF16 requiere más ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Plataforma |
|---|---|---|---|---|---|
| lesa80/Qwen3.8-27B-MLX-bf16 | 27,36B | 262K (1M con YaRN) | BF16 | Apache 2.0 | Apple Silicon (MLX) |
| lesa80/Qwen3.8-27B-MLX-4bit | 27,36B | 262K (1M con YaRN) | 4-bit | Apache 2.0 | Apple Silicon (MLX) |
| Qwen/Qwen3.8-27B (original) | 27,36B | 262K (1M con YaRN) | BF16/FP16 | Apache 2.0 | CUDA / cualquier hardware |

La versión 4-bit reduce significativamente los requisitos de memoria (aproximadamente 16-18 GB frente a 51 GB), permitiendo su ejecución en Mac con 32 GB de RAM, a costa de una ligera pérdida de calidad. El modelo original en PyTorch es la referencia para benchmarks y comparativas con otros modelos vision-language de código abierto.

## Limitaciones y advertencias

- **Plataforma restringida**: el formato MLX solo funciona en macOS con Apple Silicon. No se puede desplegar en servidores Linux con GPUs NVIDIA ni en infraestructura cloud estándar sin convertir los pesos a otro formato.
- **Alto consumo de memoria**: en BF16, el modelo requiere aproximadamente 51 GB de RAM, lo que limita su uso a equipos Mac de gama alta con 64 GB o más. Para equipos con menos memoria, es necesario usar la versión 4-bit.
- **Sin datos de benchmarks**: no se han publicado métricas de rendimiento para esta conversión, por lo que no se puede verificar empíricamente que las capacidades se preservan íntegramente respecto al modelo original.
- **Idiomas limitados**: aunque se mencionan ruso, inglés y chino, la lista completa de idiomas soportados no está documentada. El rendimiento en idiomas minoritarios o con pocos recursos puede ser inferior.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje grande, puede generar información falsa o inexacta, especialmente en tareas de razonamiento visual donde la interpretación de imágenes puede ser errónea.
- **Sesgos potenciales**: al estar entrenado principalmente con datos en inglés, chino y ruso, puede presentar sesgos culturales y lingüísticos en otros idiomas.
- **Denominación no estándar**: el nombre "Qwen3.8" y la etiqueta `qwen3_5` en HuggingFace sugieren que podría tratarse de una versión reciente o experimental de la familia Qwen. Se recomienda verificar la estabilidad y documentación del modelo base antes de usarlo en producción.

## Enlaces

- [Modelo en HuggingFace: lesa80/Qwen3.8-27B-MLX-bf16](https://huggingface.co/lesa80/Qwen3.8-27B-MLX-bf16)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Version 4-bit: lesa80/Qwen3.8-27B-MLX-4bit](https://huggingface.co/lesa80/Qwen3.8-27B-MLX-4bit)
- [Guia de conversion: HOWTO.md](https://huggingface.co/lesa80/Qwen3.8-27B-MLX-4bit/blob/main/HOWTO.md)
- [Repositorio de mlx-vlm](https://github.com/Blaizzy/mlx-vlm)
