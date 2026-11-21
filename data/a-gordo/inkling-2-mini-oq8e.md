# a-gordo/Inkling-2-Mini-oQ8e

## Resumen

Inkling-2-Mini-oQ8e es una conversión no oficial del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, empaquetada en formato MLX para su ejecución en Apple Silicon. Se trata de una cuantización mixta realizada con la herramienta oMLX 0.8.1, que preserva la arquitectura original de mezcla de expertos (MoE) y el orden de ejecución de las capas recurrentes del modelo base, además del codificador de visión, el tokenizador y la plantilla de chat. El checkpoint completo ocupa aproximadamente 18,78 GB, un 7,0 % menos que el snapshot original.

El modelo acepta entradas de texto e imagen y genera texto, por lo que cubre tareas de imagen-a-texto y conversación multimodal. Su relevancia radica en que permite ejecutar un modelo MoE de 26.388.646.400 parámetros totales en hardware Apple Silicon mediante el runtime de oMLX, algo que el checkpoint original en NVFP4/MXFP8 no facilita directamente en ese ecosistema.

Esta ficha describe la conversión, no el modelo original: no se ha realizado entrenamiento ni ajuste fino, y las capacidades, sesgos y limitaciones heredan las del modelo base de Thinking Machines Lab. La información disponible sobre idiomas, benchmarks y rendimiento de esta conversión es limitada, y se indica explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (middle 12 de 24 capas de texto se ejecutan 3 veces por token); incluye codificador de visión y draft DSpark para decodificación especulativa |
| Parametros totales | 26.388.646.400 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: MLX affine 8-bit (group size 64) en 58 grupos de proyección; NVFP4 (group size 16) en 40 grupos; MXFP8 (group size 32) en 8 grupos; draft DSpark en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` separado para el draft DSpark |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con una particularidad estructural: de las 24 capas físicas de texto, las 12 centrales se ejecutan tres veces por token, lo que da lugar a un grafo de cómputo recurrente que la conversión preserva intacto. El checkpoint incluye además un codificador de visión para entradas de imagen y un draft DSpark (modelo de borrador para decodificación especulativa) empaquetado en `mtp.safetensors`, copiado byte a byte del original y verificado mediante SHA-256.

La conversión no implicó entrenamiento ni ajuste fino. El cuantizador oMLX aplicó pesos de importancia (oQ8e) a 57 de los 58 grupos de proyección en 8-bit affine; el embedding de tokens carece de entrada de importancia y quedó fuera de ese tratamiento. Los expertos enrutados conservan los formatos NVFP4 y MXFP8 del checkpoint fuente. La calibración se realizó sobre el checkpoint nativo con el conjunto `oqe_code_multilingual` (128 muestras de 512 tokens, lotes de 16), sin proxy de menor precisión, y se usaron las 57 entradas de matriz de importancia recogidas sin incidencias de forma. El índice de pesos coincide con los 1.090 tensores objetivo.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text).
- Razonamiento y generación de código, heredados del modelo base (no verificados en esta conversión).
- Decodificación especulativa mediante el draft DSpark incluido, sujeta a habilitación en el runtime.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo acepta texto e imágenes y puede mantener diálogos multi-turno en un Mac con Apple Silicon, sin depender de servicios en la nube, gracias al runtime MLX de oMLX.
- Análisis de capturas y documentos escaneados: al combinar codificador de visión y generación de texto, permite extraer descripciones o resúmenes de imágenes en flujos de trabajo de escritorio.
- Prototipado de aplicaciones de IA en Apple Silicon: sirve para validar pipelines de imagen-a-texto antes de migrar a despliegues en GPU, ya que el checkpoint cabe en 18,78 GB y se carga con oMLX 0.8.1.
- Evaluación de cuantizaciones mixtas: útil para investigadores que quieran comparar el comportamiento de una mezcla NVFP4/MXFP8/affine-8-bit frente al modelo original en tareas de generación.
- Generación asistida con decodificación especulativa: el draft DSpark empaquetado permite experimentar con aceleración por especulación en el runtime oMLX, aunque el rendimiento no ha sido medido por el autor de la conversión.
- Entornos con requisitos de licencia permisiva: al conservar la licencia Apache 2.0, puede integrarse en productos comerciales internos siempre que se respete la política de uso aceptable del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversión indica explícitamente que no se probaron la velocidad de inferencia, los contextos largos, la generación con especulación ni la calidad del modelo, y que los benchmarks del modelo fuente no miden esta conversión. Las únicas comprobaciones realizadas fueron de carga estricta y de generación de tokens con un prompt de texto corto y un prompt sintético de imagen más texto en un Apple M3 Ultra.

## Requisitos de hardware

- VRAM/unified memory estimada: el checkpoint completo ocupa 18,78 GB (18,12 GB para los cuatro shards principales más 0,64 GB del draft DSpark); se recomienda disponer de al menos 24 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime.
- Hardware validado: Apple M3 Ultra con oMLX 0.8.1 (carga estricta superada).
- GPU compatibles: exclusivamente Apple Silicon mediante MLX; no es un checkpoint GGUF ni Transformers/ModelOpt, por lo que no se ejecuta en GPU NVIDIA o AMD con las herramientas habituales.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o más); no aplica a RTX 4090, A100 o H100 por incompatibilidad de formato.
- Opciones de despliegue: oMLX 0.8.1 (runtime Inkling 2) en Apple Silicon; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no medidos por el autor de la conversión.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ8e (esta conversión) | 26.388.646.400 | no disponible | safetensors MLX (mixto NVFP4/MXFP8/affine-8-bit) | Apache 2.0 | Hugging Face, runtime oMLX |
| thinkingmachines/Inkling-2-Mini (original) | 26.388.646.400 | no disponible | safetensors (NVFP4/MXFP8) | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE multimodal de tamaño similar) en la documentación proporcionada. La comparación directa con el modelo base se limita al tamaño (7,0 % menor en esta conversión) y al formato, ya que no se han publicado métricas de calidad ni de rendimiento para la versión cuantizada.

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de Thinking Machines Lab ni de oMLX; el soporte y la validación corresponden al autor de la conversión.
- No es un checkpoint completamente de 8 bits: combina affine 8-bit, NVFP4 y MXFP8, lo que puede producir un comportamiento numérico distinto al del modelo original.
- Sin pruebas de calidad: el autor no evaluó precisión, sesgos ni alucinación de esta conversión; los benchmarks del modelo fuente no son extrapolables.
- Rendimiento no medido: no se han probado contextos largos, velocidad de inferencia ni generación con especulación habilitada.
- Compatibilidad restringida: solo funciona con oMLX 0.8.1 en Apple Silicon; no es utilizable con vLLM, llama.cpp, Ollama, TGI ni Transformers estándar.
- Idiomas y contexto: no disponibles en la información proporcionada, por lo que no puede garantizarse un comportamiento multilingüe ni una ventana de contexto concreta.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base remite a la Model Acceptable Use Policy de Thinking Machines Lab, que debe respetarse.
- Sesgos y alucinación: heredados del modelo base; no documentados específicamente para esta conversión.

## Enlaces

- [Hugging Face: a-gordo/Inkling-2-Mini-oQ8e](https://huggingface.co/a-gordo/Inkling-2-Mini-oQ8e)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Revisión fijada del modelo base (ed40e7d)](https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7)
- [oMLX 0.8.1 (release)](https://github.com/jundot/omlx/releases/tag/v0.8.1)
- [oMLX (repositorio)](https://github.com/jundot/omlx)
- [Commit de oMLX usado en la conversión (13fd0c9)](https://github.com/jundot/omlx/commit/13fd0c9d14406fd86598cf9af749695a138dd21c)
- [Model Acceptable Use Policy de Thinking Machines Lab](https://thinkingmachines.ai/model-acceptable-use-policy/)
- [Archivo de información de cuantización](quantization_info.json)
- [Perfil del autor de la conversión: a-gordo](https://huggingface.co/a-gordo)
