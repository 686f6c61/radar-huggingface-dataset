# chartreuse-verte/prose-rewriter-1.7b-v1.2

## Resumen

`prose-rewriter-1.7b-v1.2` es un modelo de reescritura de prosa a nivel de párrafo, desarrollado por el usuario `chartreuse-verte`. Su función principal es tomar texto generado por modelos de lenguaje grandes (LLMs) y reescribirlo para que suene más humano, preservando la semántica original. Está diseñado específicamente para combatir el estilo "deslop" (texto genérico y artificial) que suele producir la IA generativa.

El modelo se basa en `Qwen/Qwen3-1.7B-Base` y se ha ajustado mediante un LoRA de rango 16 fusionado con una fuerza de 1.1. Es la versión más pequeña de dos checkpoints entrenados con el mismo corpus y pipeline; existe una versión mayor de 4B. El modelo está pensado para un uso específico: se le pasa un párrafo y un modo de edición (`match`, `inflate` o `compress`), y devuelve una versión reescrita. No es un modelo de chat y su uso fuera de este formato degrada su rendimiento.

El modelo está disponible en formato `safetensors` (bf16) y `GGUF` (Q8_0), lo que permite su uso tanto con la librería `transformers` como con `llama.cpp`. Con 2.031.739.904 parámetros totales, es lo suficientemente ligero para ejecutarse en GPUs de consumo con una huella de VRAM reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B-Base) con LoRA (rank 16) fusionado |
| Parametros totales | 2.031.739.904 (2,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1280 tokens por slot (512 entrada + 512 salida + prompt) |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF) |
| Idiomas soportados | ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B-Base`, un transformer denso de 1.7B de parametros. Sobre este base se entreno un LoRA de rango 16 que posteriormente se fusiono con los pesos originales a una fuerza de 1.1. El entrenamiento se realizo sobre un conjunto de datos de parrafos de "slop" (texto generado por IA) con su correspondiente version humana, generada por un "corruptor" que aplicaba tres tipos de transformaciones: `match` (mantener longitud), `inflate` (alargar) y `compress` (acortar). El modelo aprende a invertir estas transformaciones, aunque la card advierte que los valores del bloque `edit` leen al reves: `inflate` indica que el texto de entrada fue alargado y el modelo debe cortarlo, mientras que `compress` indica que fue acortado y el modelo debe expandirlo.

El modelo se entrena para una tarea de reescritura de un solo parrafo por llamada. La generacion se detiene con el token `<|im_end|>`, configurado como `eos_token_id`. La unica variable de control durante la inferencia es la temperatura. El modelo no es un chat: la plantilla de chat rechaza roles `user`, `assistant` y `system`, y solo acepta `source` y `edit`. El modelo fue entrenado con el bloque `edit` siempre presente, por lo que omitirlo provoca una degradacion severa del rendimiento.

## Capacidades

- Reescritura de prosa a nivel de parrafo, preservando la semantica original.
- Tres modos de transformacion de longitud controlados por el bloque `edit`: `match` (reescritura en su lugar), `inflate` (cortar texto alargado) y `compress` (expandir texto acortado).
- Generacion de texto con parada limpia en el token `<|im_end|>`.
- Funcionamiento con `transformers` (Python) y `llama.cpp` (CLI).
- No es un modelo de chat: no soporta tool calling, agentes ni multi-step reasoning.
- Capacidad multilingue limitada: solo entrenado y evaluado en ingles.

## Casos de uso

- **Limpieza de textos generados por IA**: el caso principal. Un pipeline que genera articulos, posts o descripciones con un LLM grande puede pasar cada parrafo por este modelo para eliminar el tono generico y "deslop". Es util en produccion de contenido a escala.
- **Reescritura de contenido editorial**: un redactor puede usar el modelo para reformular parrafos de un borrador manteniendo la extension (`match`) y mejorar la naturalidad. El modo `compress` permite condensar textos alargados por IA.
- **Generacion de variantes para testing A/B**: dado un parrafo base, el modelo puede producir multiples variantes con `temperature=0.9`, manteniendo la semantica y variando la redaccion. Util para campañas de marketing o pruebas de UX.
- **Reduccion de texto "slop" en datasets**: para limpiar corpus de entrenamiento de otros modelos, eliminando parrafos genericos y repetitivos. El modelo puede detectar y corregir patrones de texto generado por IA.
- **Ajuste de longitud en documentos**: con los modos `inflate` y `compress`, se puede adaptar un parrafo a un espacio fijo (por ejemplo, para encajar en una interfaz o para completar una seccion de un informe).
- **Preprocesamiento para sistemas RAG**: al limpiar la prosa de documentos antes de indexarlos, se reduce el ruido y mejora la calidad de los vectores de embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo, ya que no es un modelo de proposito general. Sin embargo, el autor proporciona una evaluacion interna sobre 577 parrafos de "slop" reales y generados por IA, con tres muestras por fila a `temperature=0.9` y `top-p=0.9`. Los resultados se resumen en la siguiente tabla:

| input words | generaciones | ratio de longitud | invencion | auto-repeticion de 3-gramas |
|---|---|---|---|---|
| < 15 | 288 | 1.58 | 72% | 0.002 |
| 15-24 | 219 | 1.00 | 34% | 0.002 |
| 25-39 | 108 | 0.95 | 31% | 0.003 |
| 40-59 | 60 | 0.93 | 28% | 0.001 |
| 60-79 | 180 | 0.89 | 23% | 0.002 |
| 80-119 | 170 | 0.90 | 25% | 0.004 |

La tabla muestra que el modelo mantiene la longitud para entradas de 15 a 24 palabras (ratio 1.00), y comprime ligeramente para entradas mas largas. La invencion (frases no implicadas por la entrada) es alta para textos muy cortos (72% para < 15 palabras), pero se reduce a 23-34% para textos de 15-80 palabras. La auto-repeticion de 3-gramas se mantiene en niveles de ruido (0.001-0.004) en todo el rango, lo que indica que no hay degeneracion.

## Requisitos de hardware

- VRAM medida por el autor en una RTX 3090 con `llama-server -ngl 99` y flash attention auto, f16 KV:
  - 1 slot (contexto 1280): 2.222 MiB
  - 2 slots (contexto 2560): 2.362 MiB
  - 4 slots (contexto 5120): 2.642 MiB
  - 8 slots (contexto 10240): 3.202 MiB
- La VRAM es lineal: los pesos fijos ocupan 2.082 MiB y cada slot de 1280 tokens anade 140 MiB de KV cache.
- El modelo cabe en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3060, RTX 4060, etc.) en Q8_0.
- Para `safetensors` bf16, la VRAM necesaria es de aproximadamente 4.2 GB (2.03B parametros x 2 bytes), lo que tambien cabe en GPUs de 6-8 GB.
- Despliegue recomendado: `llama.cpp` / `llama-server` para el formato GGUF, o `transformers` con `device_map="cuda"` para safetensors.
- No se ha validado con vLLM ni TGI, aunque el modelo es compatible con `text-generation-inference` segun los tags de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| prose-rewriter-1.7b-v1.2 | 2.03B | 1.280 tokens | Reescritura de prosa | AGPL-3.0 | safetensors, GGUF |
| Qwen/Qwen3-1.7B-Base | 1.7B | 32.768 tokens | LLM general de base | Apache-2.0 | safetensors |
| prose-rewriter-4b-v1.2 | ~4B | no disponible | Reescritura de prosa | AGPL-3.0 | no disponible |

El modelo base Qwen3-1.7B es un LLM general con una ventana de contexto mucho mayor (32K), pero no esta especializado en reescritura. La version de 4B del mismo autor promete mejor rendimiento, pero no se proporcionan datos comparativos en la informacion disponible. No se han encontrado otros modelos publicos de reescritura de prosa con el mismo enfoque (corruptor + LoRA) en la informacion disponible.

## Limitaciones y advertencias

- **No es un modelo de chat**: no responde a roles `user`, `assistant` ni `system`. Intentar usarlo como chat produce resultados degradados o errores.
- **Bloque `edit` obligatorio**: si se omite, el modelo colapsa en su modo de eliminacion mas agresivo, lo que produce una perdida de informacion. El autor lo califica como "lo peor que puedes hacerle".
- **Invencion en entradas cortas**: para parrafos de menos de 15 palabras, el modelo introduce un 72% de contenido no implicado por la entrada. No es adecuado para textos muy breves.
- **Limite de entrada**: la entrada maxima documentada es de 512 tokens. Parrafos mas largos se truncan silenciosamente si se configura el contexto de forma incorrecta.
- **Idioma**: solo entrenado y evaluado en ingles. No se garantiza un rendimiento correcto en otros idiomas.
- **Licencia AGPL-3.0**: el uso comercial es posible, pero el codigo derivado debe publicarse bajo la misma licencia. Hay que revisar las implicaciones legales si se usa en un producto de software.
- **Modelo de nicho**: no sirve para generacion de texto general, codigo, matematicas o razonamiento. Es una herramienta de un solo proposito.
- **Riesgo de alucinacion**: aunque la tasa de invencion es baja (23-34% para entradas de 15-80 palabras), no es despreciable. En contextos de produccion, se recomienda una revision humana o un filtro de entailed (el propio autor usa DeBERTa-MNLI).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.2)
- [Arbol de archivos del repositorio](https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.2/tree/main)
- [Version 4B del mismo autor](https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v1.2)
- [Pagina de despliegue en FriendliAI](https://friendli.ai/models/chartreuse-verte/prose-rewriter-1.7b-v1.2)
- [Proyecto Chartreuse en GitHub (contexto del autor)](https://github.com/OrbFrontend/Chartreuse/blob/main/README.md)
