# SceneWorks/minimax-h3-image-pe

## Resumen

MiniMax-H3-Image-PE es el expansor de prompts (prompt expander) del modelo de generación de imágenes MiniMax-H3-Image. Se trata de un fine-tune de Qwen3.8-27B (identificador interno `qwen3_5`, con su torre de visión) que transforma un prompt corto, o una instrucción de edición con referencias `<Picture N>`, en el caption largo con el que fue entrenado MiniMax-H3-Image, y propone además una relación de aspecto. El repositorio analizado, `SceneWorks/minimax-h3-image-pe`, no es la distribución oficial de MiniMax: contiene conversiones de los pesos originales a formatos ejecutables fuera de las GPU Blackwell.

MiniMax publica el checkpoint únicamente en formato ModelOpt NVFP4, que solo se ejecuta de forma nativa en GPU NVIDIA Blackwell. SceneWorks ha generado cinco tiers independientes: bf16 denso para MLX y Candle, cuantizaciones afines de 8 y 4 bits para MLX (macOS) y cuantizaciones GGML Q8_0 y Q4_K para Candle (Windows/Linux). El repositorio ocupa 158 GB en total, aunque cada tier es un snapshot autónomo que puede descargarse por separado.

La relevancia de esta conversión es práctica: permite ejecutar el expansor de prompts en Apple Silicon y en GPU CUDA no Blackwell, algo imposible con el checkpoint original. La contrapartida es que el directorio `prompt/` con los prompts de sistema y de tarea no se redistribuye, por lo que el modelo no funciona sin descargarlo del repositorio upstream, y que la licencia comunitaria impone restricciones geográficas y comerciales severas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con torre de visión, derivado de Qwen3.8-27B (`qwen3_5`) |
| Parametros totales | no disponible (el modelo base declarado es Qwen3.8-27B; el número exacto de parámetros del fine-tune no se indica) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 denso; MLX affine 8-bit (group size 64); MLX affine 4-bit (group size 64); GGML Q8_0; GGML Q4_K; NVFP4 en el checkpoint original upstream |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (10 de noviembre de 2026) |
| Formato de pesos | safetensors (bf16, sharded); MLX safetensors cuantizados; GGML (candle-q8, candle-q4) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.8-27B, un transformer denso que conserva la torre de visión del modelo base, lo que le permite procesar imágenes de referencia en instrucciones de edición. Su función no es generar imágenes sino producir el caption largo y estructurado que MiniMax-H3-Image espera como entrada, junto con una propuesta de relación de aspecto; la salida se emite como JSON válido según las pruebas del autor de la conversión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica relevante está en el proceso de conversión, no en el entrenamiento. El checkpoint original emplea proyecciones cuantizadas con ModelOpt NVFP4, cada una acompañada de `weight_scale`, `weight_scale_2` e `input_scale`. SceneWorks dequantizó cada proyección a un `.weight` denso en bf16, descartó las escalas, eliminó `quantization_config` del `config.json` y regeneró el índice de safetensors. A partir de ese snapshot bf16 se generaron las cuantizaciones MLX (afines, group size 64) y GGML (Q8_0 y Q4_K) mediante las herramientas `candle-llm` y `mlx-llm` del repositorio SceneWorks Inference, ejecutadas en CPU y macOS respectivamente. El flujo de publicación verifica tamaño y sha256 de cada archivo subido contra el hub.

## Capacidades

- Expansión de prompts: convierte un prompt corto en el caption largo y detallado con el que fue entrenado MiniMax-H3-Image.
- Expansión de instrucciones de edición: procesa instrucciones que incluyen referencias `<Picture N>` a imágenes de entrada.
- Propuesta de relación de aspecto: el modelo emite un aspect ratio junto con el caption expandido.
- Salida estructurada: produce JSON válido, requisito para su integración en pipelines de generación de imágenes.
- Procesamiento de visión: la torre de visión heredada de Qwen3.8-27B permite interpretar las imágenes de referencia en tareas de edición.
- Multilingüismo: no disponible; no se documentan los idiomas soportados.
- Tool calling y razonamiento multi-paso: no disponible; no se documentan estas capacidades.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Pipeline de text-to-image con prompts cortos: el expansor recibe la frase del usuario y devuelve el caption largo y el aspect ratio que MiniMax-H3-Image necesita, eliminando la necesidad de que el usuario escriba descripciones extensas.
- Edición de imágenes por instrucción: dada una instrucción de edición con referencias `<Picture N>`, el modelo genera el caption de edición correspondiente que el generador de imágenes consume después.
- Despliegue en estaciones de trabajo Apple Silicon: el tier `q4/` (19,8 GB) permite ejecutar el expansor en Mac con MLX sin depender de GPU NVIDIA Blackwell, útil para prototipado local.
- Servicios en GPU CUDA no Blackwell: los tiers `candle-q8/` y `candle-q4/` habilitan el despliegue en flotas con GPU Ampere o Ada, donde el checkpoint NVFP4 original no se ejecuta de forma nativa.
- Automatización de flujos creativos por lotes: al producir JSON válido de forma consistente en las 8 pruebas realizadas, el modelo puede encadenarse en procesos por lotes que alimenten un generador de imágenes con captions normalizados.
- Estandarización de prompts en equipos: centralizar la expansión de prompts en un único modelo reduce la variabilidad entre operadores y facilita auditar qué caption se envió al generador.
- Investigación sobre expansión de prompts: el repositorio ofrece cinco niveles de cuantización del mismo modelo con métricas chrF frente a la referencia NVFP4, lo que permite estudiar el impacto de la cuantización en una tarea generativa concreta.

## Benchmarks y rendimiento

El autor de la conversión publica una comparación de cada tier frente a la salida nativa NVFP4 en Blackwell sobre un conjunto fijo de 8 prompts (text-to-image y edición con imágenes de referencia), usando chrF medio y coincidencia de relación de aspecto. Los 8 prompts devolvieron JSON válido en todos los tiers.

| Tier | Backend | chrF medio vs NVFP4 | Coincidencia de aspect ratio |
|---|---|---|---|
| bf16 | Candle | 55,3 | 6 / 8 |
| q8 | Candle | 54,7 | 6 / 8 |
| q4 | Candle | 53,6 | 5 / 8 |
| bf16 | MLX | 53,7 | 4 / 8 |
| q8 | MLX | 56,1 | 5 / 8 |
| q4 | MLX | 52,3 | 7 / 8 |

El propio autor advierte que la referencia NVFP4 es una única expansión muestreada, por lo que diferencias de pocos puntos chrF entre tiers quedan dentro de la variación de muestreo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tier bf16 ocupa 54,7 GB en disco y requiere al menos esa cantidad de memoria para cargarse en precisión completa; `q8/` y `candle-q8/` ocupan 31,9 GB; `q4/` y `candle-q4/`, 19,8 GB.
- GPU recomendadas: el checkpoint original NVFP4 exige GPU NVIDIA Blackwell; las conversiones están pensadas para Apple Silicon (MLX) y para GPU CUDA no Blackwell o CPU (Candle).
- GPU de consumo: el tier `q4/` de 19,8 GB puede caber en GPU con 24 GB de VRAM, como una RTX 4090, siempre que el runtime Candle lo soporte; el tier q8 de 31,9 GB queda fuera de las GPU de consumo habituales.
- Apple Silicon: los tiers MLX `q8/` y `q4/` están diseñados para macOS; el de 19,8 GB es el más viable en equipos con memoria unificada de 24 GB o más.
- Opciones de despliegue: MLX en macOS; Candle en Windows, Linux y CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencia adicional: es imprescindible descargar el directorio `prompt/` del repositorio upstream en la revisión `35603d4b63949afa12cb098227fffefedf081afa`; sin esos prompts el expansor no genera captions de MiniMax-H3-Image.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| SceneWorks/minimax-h3-image-pe | no disponible (base Qwen3.8-27B) | no disponible | safetensors, MLX, GGML | MiniMax-H3-Image Community License | Conversión no oficial; requiere prompts upstream; restricciones geográficas |
| MiniMaxAI/MiniMax-H3-Image-PE (upstream) | no disponible (base Qwen3.8-27B) | no disponible | NVFP4 | MiniMax-H3-Image Community License | Checkpoint oficial; solo ejecutable de forma nativa en GPU Blackwell |
| Qwen3.8-27B | 27B (nominal) | no disponible | safetensors y cuantizaciones de la comunidad | según la distribución de Qwen | Modelo base del que deriva el expansor; no está especializado en expansión de prompts para MiniMax-H3-Image |

No se dispone de información sobre otros expansores de prompts comparables en la documentación consultada.

## Limitaciones y advertencias

- Licencia restrictiva: el Acuerdo Comunitario de MiniMax-H3-Image autoriza el uso y la distribución solo fuera de la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos; en esos territorios el uso no está autorizado.
- Umbral comercial: se requiere autorización escrita de MiniMax si el usuario y sus afiliados superan un millón de dólares de ingresos anualizados o si se ofrece como servicio alojado; además, un producto comercial debe mostrar de forma destacada "MiniMax-H3-Image" en su interfaz.
- Prohibición de mejora de terceros: ni el modelo ni sus salidas, incluidos los prompts expandidos, pueden usarse para mejorar ningún otro modelo de IA que no sea MiniMax-H3-Image o sus derivados.
- Divulgación de contenido generado: el contenido publicado en entornos públicos debe identificarse claramente como generado por máquina.
- Dependencia de artefactos externos: sin el directorio `prompt/` del repositorio upstream el modelo no funciona; este repositorio no lo redistribuye.
- Distribución no oficial: los pesos han sido modificados por SceneWorks; no es una distribución oficial de MiniMax y las incidencias deben contrastarse con el checkpoint original.
- Calidad de las cuantizaciones: los tiers q4 muestran menor coincidencia de relación de aspecto con la referencia NVFP4 (5/8 y 7/8 según backend) y chrF más bajo en el caso de Candle q4 (53,6); la evaluación se limita a 8 prompts.
- Idiomas y contexto: no se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar su comportamiento en entradas largas o multilingües.
- Sesgos y alucinación: no se han publicado análisis específicos de sesgos ni tasas de alucinación para este modelo.
- Compatibilidad de runtime: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; el despliegue queda limitado a MLX y Candle.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SceneWorks/minimax-h3-image-pe
- Modelo upstream: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Generador de imágenes asociado: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio de SceneWorks Inference: https://github.com/SceneWorks/inference
- Ejecución de referencia de la comparativa de calidad: https://github.com/SceneWorks/inference/actions/runs/43028135206
- Organización SceneWorks en GitHub: https://github.com/SceneWorks
- Repositorio mlx-rs (fork usado por SceneWorks): https://github.com/SceneWorks/mlx-rs
- Autorización comercial de MiniMax: https://platform.minimax.io/license
