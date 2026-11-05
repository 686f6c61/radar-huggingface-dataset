# Chungulus/Qwen3.5-4B-3D-Coder-Q8_0-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-Q8_0-GGUF es una cuantización comunitaria en formato GGUF del checkpoint FP16 `ccore/Qwen3.5-4B-3D-Coder`, un fine-tune especializado en generación de código Three.js y escenas 3D. Lo publica el usuario Chungulus bajo licencia Apache 2.0 y está pensado para su uso con llama.cpp, incluyendo el proyector visual BF16 del modelo original para tareas de imagen-a-texto.

El modelo base parte de la familia Qwen3.5 con aproximadamente 4.539 millones de parámetros (incluyendo visión); esta versión textual cuantizada conserva 4.205.751.296 parámetros y un tamaño de repositorio de 5,2 GB. La cuantización Q8_0 se ha realizado de forma independiente desde la exportación a precisión completa, sin dataset de calibración ni matriz de importancia, y mantiene intacto el proyector visual del modelo original.

Su relevancia es acotada: se trata de una cuantización no oficial orientada a desarrolladores que quieran ejecutar localmente un modelo pequeño especializado en código 3D con soporte de entrada de imagen, en entornos con llama.cpp reciente. No hay resultados de benchmarks ni evaluación de calidad publicados más allá de comprobaciones básicas de sintaxis y aritmética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con proyector visual multimodal |
| Parametros totales | 4.205.751.296 (GGUF textual); 4.539.265.536 en el checkpoint original incluyendo visión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (esta versión); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj-Qwen3.5-4B-BF16.gguf` para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con aproximadamente 4.500 millones de parámetros, fine-tuneado por CCORE para tareas de código orientado a Three.js y generación de escenas 3D. Incluye un proyector visual que habilita el pipeline `image-text-to-text`, lo que permite describir imágenes o usarlas como contexto. El checkpoint original soporta multi-token prediction (MTP), pero esta cuantización **no exporta MTP**: es necesario desactivar la predicción especulativa en los frontends que intenten habilitarla.

La cuantización Q8_0 se ha generado de forma independiente desde la exportación a precisión completa del checkpoint, verificando previamente los hashes del modelo fuente y del proyector. No se ha utilizado dataset de calibración, matriz de importancia ni recuantización. Las comprobaciones realizadas por el autor cubren aritmética, salida JSON y comprensión de imágenes con el proyector incluido, además de una verificación de sintaxis JavaScript sobre una escena Three.js generada (eliminando fences de Markdown y decodificando entidades HTML). No se evaluaron renderizado en navegador, vídeo, comportamiento a contexto completo ni precisión en benchmarks.

## Capacidades

- Generación de código, con especial énfasis en JavaScript y escenas Three.js.
- Comprensión de imágenes mediante el proyector visual BF16 incluido (pipeline `image-text-to-text`).
- Conversación multi-turno (modo `-cnv` en llama.cpp).
- Salida estructurada en JSON (verificada por el autor).
- Razonamiento aritmético básico (verificado por el autor).
- Soporte de plantilla de chat Jinja (`--jinja`).
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Tool calling / function calling: no documentado en la información disponible.
- Modo thinking explícito: no documentado.
- Soporte de audio: no.

## Casos de uso

- **Generación de escenas Three.js en local**: el modelo está fine-tuneado específicamente para producir código de escenas 3D; se puede usar desde `llama-completion` con un prompt como "Create a minimal Three.js scene with a rotating red cube" para obtener prototipos rápidos sin depender de la nube.
- **Asistente de código 3D en el editor**: integrado vía llama.cpp con plantilla Jinja y contexto de 8K, sirve para autocompletar o generar fragmentos de código de visualización web en un flujo de desarrollo iterativo.
- **Descripción de imágenes en pipelines locales**: usando `llama-mtmd-cli` con el proyector incluido, permite generar descripciones o extraer información de capturas y diagramas sin enviar datos a servicios externos.
- **Generación de JSON estructurado**: útil para prototipos de extracción de datos o formateo de respuestas en aplicaciones pequeñas, dado que el autor verificó salidas JSON válidas.
- **Educación y experimentación con modelos multimodales pequeños**: su tamaño (~4,2B parámetros, 5,2 GB en Q8_0) permite desplegarlo en estaciones de trabajo modestas para aprender a montar pipelines GGUF con visión.
- **Pruebas de integración continua de código generado**: la verificación de sintaxis JavaScript realizada por el autor sugiere su uso en pipelines que validen automáticamente el código 3D generado antes de incorporarlo a un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta comprobaciones cualitativas: aritmética, salida JSON, comprensión de imágenes y verificación de sintaxis JavaScript sobre una escena Three.js generada. No se evaluaron precisión en benchmarks, renderizado en navegador, vídeo ni comportamiento a contexto completo.

## Requisitos de hardware

- **VRAM estimada**: en Q8_0, el archivo principal ocupa aproximadamente 4,5 GB (repositorio total de 5,2 GB incluyendo el proyector BF16). Se recomienda al menos 6-8 GB de VRAM para el modelo textual y margen adicional para el proyector y el contexto.
- **GPU recomendadas**: RTX 3090, RTX 4090, A100 o H100 para mayor throughput; también viable en GPUs consumer de gama media-alta con suficiente VRAM.
- **Consumer GPU**: sí, cabe en GPUs con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 4070). En GPUs de 6 GB puede requerir descarga parcial de capas a CPU (`-ngl` ajustado).
- **Despliegue**: llama.cpp (versión reciente con soporte Qwen3.5; probado con commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), `llama-completion` y `llama-mtmd-cli` para multimodal. No se documenta compatibilidad con vLLM, Ollama o TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-Q8_0-GGUF (este) | ~4,2B (texto) | No disponible | Apache 2.0 | GGUF | Cuantización comunitaria, visión incluida, sin benchmarks |
| ccore/Qwen3.5-4B-3D-Coder (base) | ~4,54B (con visión) | No disponible | Apache 2.0 | Safetensors (FP16) | Checkpoint original, soporta MTP |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- **Cuantización no oficial**: es una conversión comunitaria, no un release de Qwen ni de CCORE; el autor lo indica explícitamente.
- **Sin benchmarks**: no hay evaluación de precisión frente al checkpoint original ni frente a otros modelos; el rendimiento real en tareas de código o visión no está cuantificado.
- **MTP no exportado**: hay que desactivar la predicción especulativa en los frontends; de lo contrario puede fallar o degradarse.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto del modelo; los ejemplos usan 8192 tokens pero no se confirma que sea el límite.
- **Idiomas no documentados**: no hay información sobre cobertura multilingüe; no se recomienda asumir buen rendimiento en castellano sin evaluarlo.
- **Riesgo de alucinación**: inherente a modelos de este tamaño, especialmente en código generado; el autor solo verificó sintaxis, no corrección funcional ni renderizado en navegador.
- **Sin evaluación de vídeo ni contexto completo**: el autor no probó estos escenarios.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar los términos del modelo base y del fine-tune de CCORE, así como las licencias de los datos de entrenamiento originales, no documentadas aquí.
- **Dependencia de versión de llama.cpp**: requiere builds recientes con soporte Qwen3.5; versiones antiguas pueden no cargar el modelo correctamente.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q8_0-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Revisión concreta del checkpoint original: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/16f53e560115a3f55ddf7b455d65417257e29414
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp probado: `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`
