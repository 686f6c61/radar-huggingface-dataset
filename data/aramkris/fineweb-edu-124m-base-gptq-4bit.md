# aramkris/fineweb-edu-124m-base-gptq-4bit

## Resumen

FineWeb-Edu-124m-base-gptq-4bit es la versión cuantizada a 4 bits mediante GPTQ del modelo base `aramkris/fineweb-edu-124m-base`, un GPT de 124 millones de parámetros entrenado desde cero dentro del proyecto tinystories-ARM-model. El autor, aramkris, publica esta variante para reducir el peso en disco de 494 MB a 84 MB manteniendo una pérdida muy cercana a la del modelo original en varios conjuntos de validación. La cuantización se realizó con `llm-compressor` (oneshot) aplicando el esquema W4A16 sobre las 48 matrices lineales de los bloques transformer, dejando la capa de embedding y salida compartida a 8 bits.

El modelo es un transformer decoder-only de tipo GPT con tokenizador GPT-2 (tiktoken) y una ventana de contexto que no se especifica en la información disponible. Está entrenado sobre Mini FineWeb-Edu y Cosmopedia, y su licencia MIT permite uso comercial sin restricciones adicionales. Su relevancia es fundamentalmente práctica: demuestra un flujo completo de cuantización GPTQ sobre un modelo pequeño entrenado desde cero, con métricas de pérdida comparadas frente al original y frente a una cuantización round-to-nearest sin calibración.

No obstante, conviene subrayar que no se trata de un modelo de propósito general listo para producción: es un artefacto de investigación con formato de pesos propietario, requiere el código del repositorio del proyecto para cargarse y no dispone de benchmarks estándar ejecutados sobre la versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (from-scratch) |
| Parametros totales | 124M (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 (pesos 4-bit con escala por grupo de 128, activaciones 16-bit); embedding/salida compartidos a 8-bit con una escala por fila |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.pt` propietario del proyecto (enteros 4-bit empaquetados dos por byte, escalas y normas); no safetensors ni GGUF |
| Tokenizador | tiktoken, codificación GPT-2 |
| Tamano del repositorio | 0,1 GB (fichero de pesos de 84 MB) |
| Calibracion | 256 ventanas de 512 tokens del split de entrenamiento de Mini FineWeb-Edu, 44 s en CPU de Mac |

## Arquitectura y entrenamiento

El modelo base es un GPT decoder-only entrenado desde cero (sin partir de pesos preentrenados) con 124 millones de parámetros, según la nomenclatura del repositorio. Los datos de entrenamiento declarados son Mini FineWeb-Edu (`BaoMinhTran/mini-fineweb-edu`) y Cosmopedia (`HuggingFaceTB/cosmopedia`); no se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. El tokenizador es el de GPT-2 vía tiktoken.

La innovación técnica de esta variante es la cuantización GPTQ: el modelo se envolvió como modelo de Hugging Face (`quantization/hf_wrapper.py`) y se procesó con `oneshot(recipe=GPTQModifier(scheme="W4A16", targets="Linear", ignore=["re:.*lm_head"]), pipeline="sequential")`. Esto produce pesos de 4 bits (rango −8…7 con una escala por grupo de 128) en las 48 matrices de los bloques transformer y activaciones de 16 bits; la capa compartida de embedding y salida se almacena a 8 bits con una escala por fila. Los enteros y escalas se leen después en una capa cuantizada propia del proyecto. La decodificación no emplea kernels optimizados: los pesos se reconvierten a coma flotante en cada token, por lo que el ahorro es de memoria, no de tiempo.

## Capacidades

- Generación de texto en inglés con un modelo pequeño de 124M de parámetros.
- Continuación de texto y generación autoregresiva con muestreo configurable (temperatura, top-k), como se muestra en el ejemplo de la model card.
- Razonamiento básico y conocimiento factual limitado por el tamaño del modelo y los datos de entrenamiento (Mini FineWeb-Edu y Cosmopedia).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en CPU y en el framework propio del proyecto, con soporte para el fichero cuantizado reconocido automáticamente por `load_model`.

## Casos de uso

- Investigación en cuantización: sirve como referencia reproducible de un pipeline GPTQ completo (calibración, W4A16, comparación de pérdida frente a round-to-nearest) para estudiar el impacto de la cuantización en modelos pequeños.
- Docencia y experimentación con modelos from-scratch: permite a estudiantes cargar un GPT de 124M cuantizado en un portátil y ejecutar generación de texto sin GPU, gracias a los 84 MB de pesos.
- Generación de texto de bajo coste en inglés: continuación de párrafos y textos descriptivos en dominios cercanos a FineWeb-Edu y Cosmopedia (contenido educativo y enciclopédico sintético).
- Prototipado de aplicaciones de generación de texto en entornos con restricciones de memoria: el modelo cabe en dispositivos con pocos recursos y sirve para validar pipelines de inferencia antes de escalar a modelos mayores.
- Evaluación comparativa de estrategias de compresión: el fichero `quantize.json` incluye muestras de cada modelo (original, round-to-nearest y GPTQ), lo que facilita análisis cualitativos de degradación.
- Pruebas de integración del stack del proyecto tinystories-ARM-model: útil para verificar la carga de pesos cuantizados, el wrapper de Hugging Face y la app de generación del repositorio.
- Referencia para estudiar el efecto de la cuantización en la pérdida: útil para calibrar expectativas sobre cuánto se degrada un modelo pequeño al pasar de 32 a 4 bits (incremento medio de pérdida de +0,030 en 10 conjuntos).

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (HellaSwag, ARC-Easy, MMLU, etc.) sobre la versión cuantizada; indica explícitamente que esos benchmarks no se han ejecutado aún y remite a la model card del modelo base para los del original. Los únicos datos publicados son pérdidas (loss) en validación, sobre 16.384 tokens por conjunto:

| Conjunto | Original (32-bit) | Round to nearest, 4-bit | GPTQ 4-bit (este modelo) |
|---|---|---|---|
| Mini FineWeb-Edu | 3,296 | 3,326 | 3,319 |
| TinyStories | 2,751 | 2,793 | 2,774 |
| Cosmopedia (5 conjuntos) | 2,336–2,785 | +0,035 a +0,041 | +0,030 a +0,037 |
| WikiText-2 | 5,047 | 5,069 | 5,072 |
| Tiny Shakespeare | 5,446 | 5,472 | 5,481 |
| Cambio medio en 10 conjuntos | — | +0,034 | +0,030 |

En cuanto a velocidad, la model card indica que en un Mac el modelo cuantizado decodifica a unos 30 tokens/s, frente a 80–100 tokens/s del modelo en coma flotante, porque los pesos se reconvierten a float en cada token.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos ocupa 84 MB y el modelo se ejecuta en CPU en el ejemplo oficial, por lo que el requisito de memoria es muy bajo (del orden de cientos de MB incluyendo activaciones y overhead del runtime).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse en CPU (el ejemplo de la model card usa `"cpu"`). Cualquier GPU consumer moderna podría alojarlo, pero no hay kernels optimizados para el formato cuantizado propio.
- ¿Cabe en GPU consumer? Sí, por tamaño (84 MB de pesos), aunque el rendimiento no está optimizado para GPU.
- Opciones de despliegue: únicamente el código del proyecto (`https://github.com/a-ramakrishnan/tinystories-ARM-model`), con `python3 -m infra.model_store pull fineweb-edu-124m-base-gptq-4bit` y las funciones `load_model` / `load_model_config`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario.
- Latencia y throughput: aproximadamente 30 tokens/s en un Mac según la model card; no se proporcionan cifras de latencia por token ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| fineweb-edu-124m-base-gptq-4bit (este) | 124M | no disponible | GPTQ W4A16 + embedding 8-bit | MIT | `.pt` propio | 84 MB, ~30 tok/s en Mac, sin benchmarks estándar |
| fineweb-edu-124m-base (original) | 124M | no disponible | ninguna (32-bit) | MIT | `.pt` propio | 494 MB, 80–100 tok/s en Mac |
| Copia round-to-nearest 4-bit (referencia en la card) | 124M | no disponible | 4-bit sin calibración | MIT | `.pt` propio | 87 MB, pérdida media +0,034 |

No se dispone de información sobre otros modelos comparables de la misma categoría (GPT pequeños from-scratch) en la documentación proporcionada; los únicos puntos de comparación son las variantes del propio proyecto.

## Limitaciones y advertencias

- Modelo de 124M de parámetros: capacidad limitada de razonamiento, conocimiento factual y coherencia en textos largos; no es adecuado para tareas complejas.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, especialmente fuera de los dominios de FineWeb-Edu y Cosmopedia.
- Sesgos heredados de los datos de entrenamiento (Mini FineWeb-Edu y Cosmopedia), no documentados en la información disponible.
- Formato de pesos propietario: no es compatible con safetensors, GGUF ni con runtimes estándar (vLLM, llama.cpp, Ollama, TGI); requiere el código del repositorio del proyecto.
- La cuantización no está validada con benchmarks estándar; solo se han publicado pérdidas en validación, por lo que el impacto en tareas concretas es desconocido.
- Penalización de velocidad: ~30 tok/s frente a 80–100 del modelo en coma flotante, porque los pesos se descomprimen a float en cada token.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como artefacto de investigación.
- Longitud de contexto no documentada: no se puede planificar su uso en escenarios que requieran ventanas largas sin verificarlo empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-base-gptq-4bit
- Modelo base: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
