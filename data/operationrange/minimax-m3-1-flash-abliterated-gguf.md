# operationrange/MiniMax-M3.1-Flash-abliterated-GGUF

## Resumen

MiniMax-M3.1-Flash-abliterated-GGUF es una versión modificada del modelo MiniMax-M3.1-Flash, un transformer de arquitectura MoE (mixture of experts) desarrollado por MiniMax. Esta variante, publicada por el usuario operationrange, aplica una técnica de "abliteration" sobre la cuantización UD-Q8_K_XL de unsloth: una proyección ortogonal de los pesos que escriben en el flujo residual para eliminar la dirección de rechazo aprendida durante el alineamiento. No hay fine-tuning; solo se modifican los tensores `attn_output`, `ffn_down_shexp` y `ffn_down_exps` de las capas 16 a 42.

El modelo conserva las capacidades del original (razonamiento, código, matemáticas, visión) pero responde a peticiones que el modelo base rechaza. Con 426.186.392.064 parámetros totales, es un modelo de gran escala que requiere hardware de gama alta para su despliegue. El repositorio ocupa 293,8 GB y se distribuye en siete fragmentos GGUF.

La relevancia de esta ficha radica en que documenta una técnica de modificación de pesos aplicada a un modelo MoE de última generación, con evaluación cuantitativa del impacto en rechazos, calidad (GSM8K, MMLU, perplejidad) y divergencia KL respecto al original. Es útil para investigadores que estudian alineamiento, seguridad y edición de modelos, así como para desarrolladores que necesitan un modelo sin rechazos para tareas de investigación controlada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) |
| Parámetros totales | 426.186.392.064 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 65536`) |
| Tipos de cuantización | UD-Q8_K_XL (GGUF); expertos `ffn_down_exps` de capas 16–42 en Q8_0; resto NVFP4/BF16; draft DSpark en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (con apéndice de usos prohibidos y requisitos de atribución) |
| Formato de pesos | GGUF (siete fragmentos `-00001-of-00007` a `-00007-of-00007`), más `mmproj-*.gguf` para visión y `dspark-MiniMax-M3.1-Flash-Q8_0.gguf` para decodificación especulativa |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE, con expertos entrenados con QAT (quantization-aware training) en NVFP4. La variante abliterated no reentrena el modelo: parte de la cuantización UD-Q8_K_XL de unsloth y aplica una edición de pesos sobre el flujo residual. Se recogieron activaciones del flujo residual (`l_out-*`) en los últimos tokens de prompts con plantilla de chat para 256 prompts dañinos (`mlabonne/harmful_behaviors`) y 256 inofensivos (`mlabonne/harmless_alpaca`). La dirección de rechazo se calcula como `r = mean(harmful) − mean(harmless)` en la capa 40 (último token), eliminando la componente a lo largo de la media de los inofensivos y normalizando.

Para cada tensor que escribe en el flujo residual en las capas 16–42 (`attn_output`, `ffn_down_shexp`, `ffn_down_exps` de los 128 expertos), los pesos se reemplazan por `W − α·r rᵀ W` con α = 1,5. Las capas restantes, los embeddings y la cabeza de salida no se tocan. Como los expertos del modelo base están en NVFP4, recuantizar los expertos editados a NVFP4 los devolvería a la rejilla original y borraría la edición; por eso los `ffn_down_exps` editados de las capas 16–42 se almacenan en Q8_0 (≈0,6 % de error relativo frente a los valores NVFP4). El resto es idéntico byte a byte a la cuantización de unsloth.

El autor probó varias variantes (dirección en capa 28 con todas las capas y α=1, dirección proyectada en capa 40 con α=1, direcciones por capa, subespacio de cuatro direcciones) midiendo rechazos en 50 prompts dañinos retenidos y 30 inofensivos, y divergencia KL frente al original en 16×2048 tokens de wikitext-2. La variante publicada (capa 40 proyectada, capas 16–42, α=1,5) logra 0 % de rechazos con KL media 0,75 y mediana 0,23, y 68,6 % de coincidencia en el token top-1.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con `llama-server --jinja`.
- Razonamiento y matemáticas: GSM8K del 97 % en los primeros 100 ejemplos del test.
- Conocimiento general: MMLU del 78,5 % en 200 preguntas aleatorias con semilla 0.
- Capacidades de visión: la torre de visión no está modificada y puede usarse con el `mmproj-*.gguf` del repositorio de unsloth tal cual.
- Decodificación especulativa con el draft DSpark incluido (aceptación del 38,2 % en 6 prompts mixtos, frente al 37,0 % del original).
- Modo de razonamiento configurable (`reasoning_effort: low` en las evaluaciones).
- Respuesta a peticiones que el modelo base rechaza (0–1 % de rechazos en 100 prompts dañinos retenidos, frente al 96 % del original).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la eliminación de una dirección de rechazo afecta al comportamiento sin reentrenar, comparando rechazos, KL y coincidencia top-1 frente al original con las métricas ya publicadas.
- Evaluación de técnicas de edición de pesos en MoE: sirve como caso práctico de abliteration sobre un modelo con expertos en NVFP4, incluyendo la solución de recuantización a Q8_0 para preservar la edición.
- Generación de código y matemáticas en pipelines internos: con GSM8K del 97 % y MMLU del 78,5 %, es adecuado para tareas de razonamiento verificable donde se dispone de hardware de 272 GB de VRAM.
- Procesamiento de documentos con visión: al conservar la torre de visión intacta, puede usarse con el `mmproj` de unsloth para tareas de comprensión de imágenes y texto combinados.
- Despliegue con decodificación especulativa: el draft DSpark Q8_0 incluido permite acelerar la generación (~41 tok/s en 4× RTX PRO 6000) con una tasa de aceptación del 38,2 %, útil en servicios de inferencia de baja latencia.
- Red teaming y pruebas de robustez: al no rechazar peticiones, es útil para generar respuestas a prompts dañinos en entornos controlados y analizar cómo responde el modelo base frente al modificado.
- Estudio de divergencia distribucional: la KL media de 0,75 y mediana de 0,23 frente al original, junto con el 68,6 % de coincidencia top-1, permiten analizar cuánto se desvía la distribución tras la edición.

## Benchmarks y rendimiento

Evaluación del autor a temperatura 0, `reasoning_effort: low`, vía chat completions de `llama-server`:

| Métrica | Original UD-Q8_K_XL | Abliterated |
|---|---|---|
| Rechazos, 100 prompts dañinos retenidos (`mlabonne/harmful_behaviors`) | 96 % | 1 % (falso positivo por palabra clave; el modelo cumplió) |
| Rechazos, 100 prompts inofensivos (`mlabonne/harmless_alpaca`) | – | 0 % |
| GSM8K (primeros 100 del test) | 98 % | 97 % |
| MMLU (200 preguntas aleatorias, semilla 0) | 79,0 % | 78,5 % |
| Perplejidad en wikitext-2 (16×2048) | 205,3 | 176,5 |
| KL vs. original, media / mediana | 0 | 0,75 / 0,23 |
| Coincidencia en token top-1 vs. original | 100 % | 68,6 % |

Variantes probadas por el autor (50 prompts dañinos retenidos, 30 inofensivos; KL en 16×2048 tokens de wikitext-2):

| Variante | Rechazos | KL media / mediana | Top-1 igual |
|---|---|---|---|
| Original | 96 % | 0 | 100 % |
| Dirección L28, todas las capas, α=1 | 22 % | 0,99 / – | 68 % |
| L40 proyectada, capas 16–42, α=1 | 16 % | 0,62 / 0,17 | 71,9 % |
| Igual + preservación de norma | 18 % | 0,62 / – | – |
| Direcciones por capa, capas 16–42, α=1 | 6 % (+16 % vacías) | 0,61 / 0,13 | 73,6 % |
| L40 proyectada, capas 16–42, α=1,5 (este modelo) | 0 % | 0,75 / 0,23 | 68,6 % |
| Subespacio de 4 direcciones | roto | 6,3 | – |

Decodificación especulativa DSpark: aceptación del 38,2 % en 6 prompts mixtos (`-np 1`, `--spec-type draft-dspark`, `n_max=3`, greedy) frente al 37,0 % del original; ~41 tok/s en 4× RTX PRO 6000 en ambos casos.

## Requisitos de hardware

- VRAM estimada para pesos: ~272 GB en la cuantización UD-Q8_K_XL publicada.
- GPU probadas por el autor: 4× RTX PRO 6000 (96 GB cada una), con `-ngl 999 -fa on --jinja -c 65536`.
- No cabe en GPU de consumo individual; requiere un despliegue multi-GPU de gama profesional o de centro de datos.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte para MiniMax-M3.1 (PR #31192), con `--jinja` para plantilla de chat y `-fa on` para flash attention.
- Para muchos slots paralelos (`-np 16`) es necesario elevar el presupuesto de nodos del grafo para `LLM_ARCH_MINIMAX_M3` en `src/llama-context.cpp` (`graph_max_nodes`), según el ejemplo del autor.
- Decodificación especulativa opcional con `-md dspark-MiniMax-M3.1-Flash-Q8_0.gguf --spec-type draft-dspark -ngld 999`.
- Throughput medido: ~41 tok/s en 4× RTX PRO 6000 con decodificación especulativa.
- No se proporcionan datos de latencia para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-abliterated (este) | 426.186.392.064 | no disponible | minimax-community | GGUF UD-Q8_K_XL | 0–1 % de rechazos; GSM8K 97 %, MMLU 78,5 % |
| MiniMax-M3.1-Flash (original) | 426.186.392.064 | no disponible | minimax-community | safetensors / GGUF (unsloth) | 96 % de rechazos; GSM8K 98 %, MMLU 79,0 % |
| MiniMax-M3.1-Flash-GGUF (unsloth) | 426.186.392.064 | no disponible | minimax-community | GGUF (UD-Q8_K_XL) | Cuantización de referencia sin modificar; incluye `mmproj` y draft DSpark |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo cumple con peticiones que el original rechaza; el autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- La licencia MiniMax Community sigue aplicándose, incluido su apéndice de usos prohibidos y los requisitos de notificación y atribución para uso comercial.
- La detección de rechazos se basa en coincidencia simple de palabras clave en los primeros 600 caracteres de la respuesta; algunas respuestas "cumplidoras" están matizadas con encuadres ficticios o descargos de responsabilidad, por lo que la métrica de 1 % puede subestimar el comportamiento de rechazo real.
- La edición de pesos altera la distribución: KL media de 0,75 y mediana de 0,23 frente al original, con solo 68,6 % de coincidencia en el token top-1. Esto implica divergencias en la generación que pueden afectar a tareas sensibles a la reproducibilidad.
- La perplejidad en wikitext-2 baja de 205,3 a 176,5, lo que indica un cambio en la distribución del lenguaje que no necesariamente implica mejor calidad.
- Los expertos editados de las capas 16–42 se almacenan en Q8_0 con ≈0,6 % de error relativo frente a los valores NVFP4, lo que introduce una discrepancia adicional respecto al original.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de los resultados publicados por el autor.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- Requiere una compilación de llama.cpp con soporte para MiniMax-M3.1 (PR #31192) y, para muchos slots paralelos, un parche manual en `llama-context.cpp`; esto complica el despliegue en producción.
- El tamaño del repositorio (293,8 GB) y la VRAM necesaria (~272 GB) limitan su uso a infraestructura de gama alta.

## Enlaces

- Hugging Face: https://huggingface.co/operationrange/MiniMax-M3.1-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Cuantización de referencia (unsloth): https://huggingface.co/unsloth/MiniMax-M3.1-Flash-GGUF
- PR de llama.cpp con soporte MiniMax-M3.1: https://github.com/ggml-org/llama.cpp/pull/31192
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inofensivos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
