# ajgazin/Qwen3.8-27B-Heretic-Dynamic-GGUF

## Resumen

Qwen3.8-27B-Heretic-Dynamic-GGUF es un conjunto de cuantizaciones GGUF del modelo Qwen3.8-27B tras aplicar una abliteración tipo Heretic (MPOA, Magnitude-Preserving Orthogonal Ablation) y una cuantización dinámica siguiendo la receta de Unsloth. El autor, ajgazin, parte del modelo BF16 de llmfan46 (Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved), que ya incorpora la abliteración y preserva los 15 tensores de predicción multi-token (MTP). El resultado son cuatro tamaños de cuantización (de 16,4 a 29,3 GiB) que combinan una capa de "desensibilización" de contenido con una pérdida de fidelidad menor que la de los K-quants estáticos equivalentes, verificada mediante divergencia KL.

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parámetros con arquitectura de atención híbrida: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante. Esta arquitectura reduce el coste computacional en contextos largos sin renunciar a la calidad en tareas de razonamiento. La versión Heretic mantiene intactas las capacidades del modelo original (incluido el proyector de visión, que se distribuye por separado) y añade una capa de "uncensoring" que elimina parcialmente los rechazos de seguridad del modelo base.

La relevancia de este lanzamiento radica en que ofrece, por primera vez, cuantizaciones dinámicas de Unsloth sobre un modelo abliterado, algo que antes solo estaba disponible por separado. Para desarrolladores que necesitan ejecutar un modelo de 27B en hardware de consumo con la máxima fidelidad posible, esta combinación supone una mejora medible frente a los quants estáticos tradicionales, con un tamaño de archivo ligeramente inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (16 capas con atencion completa + 48 capas con atencion lineal y estado recurrente), 64 capas en total |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean -c 8192, pero no se especifica el maximo) |
| Tipos de cuantizacion | UD-Q4_K_XL, UD-Q5_K_M, UD-Q6_K_XL, UD-Q8_K_XL (distribucion per-tensor de Unsloth Dynamic v3.0) |
| Idiomas soportados | No disponible (hereda los del modelo base Qwen3.8-27B, no especificados en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atencion hibrida: de las 64 capas, solo 16 ejecutan atencion completa (con un intervalo de atencion completa de 4), mientras que las 48 restantes usan atencion lineal con un estado recurrente constante. Este diseno reduce el coste computacional en secuencias largas y es el mismo esquema que utiliza el modelo MoE flagship de 2,4T de parametros de la familia Qwen3.8. El modelo es nativamente multimodal (vision-lenguaje), con el codificador de vision alojado en un archivo separado (mmproj-BF16.gguf) que no se ve afectado por la abliteracion ni por la cuantizacion.

La abliteracion Heretic (v2.0.0.dev0) es una variante de ablation ortogonal que preserva la magnitud (MPOA). Se aplica sobre el modelo BF16 original y elimina parcialmente los rechazos de contenido, manteniendo intactos los 15 tensores de prediccion multi-token (MTP). La cuantizacion dinamica sigue la receta de Unsloth: se utiliza el archivo de importancia (imatrix) calibrado sobre el modelo original no abliterado, y se aplica una distribucion per-tensor de tipos de cuantizacion copiada exactamente de los GGUFs de Unsloth del modelo original (866 tensores, 0 discrepancias de tipo). El proceso de cuantizacion se realiza con `llama-quantize --allow-requantize` y un archivo de tipos por tensor generado a partir de la tabla `tensor_types.tsv` incluida en el repositorio.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, incluyendo razonamiento paso a paso y modo de pensamiento (thinking mode) con los parametros de muestreo recomendados (temperature 1.0, top_p 0.95, top_k 20, min_p 0.0).
- Vision: soporta entrada de imagenes y video mediante el proyector de vision opcional `mmproj-BF16.gguf` (0,9 GiB), que debe cargarse con `llama-mtmd-cli`.
- Prediccion multi-token (MTP): los 15 tensores MTP estan preservados en todos los GGUFs principales, lo que permite decodificacion especulativa o generacion de multiples tokens por paso si el runtime lo soporta.
- Contenido sin censura: la abliteracion Heretic reduce los rechazos de seguridad del modelo base, permitiendo generar contenido que el modelo original bloquearia.
- Multilingue: no se especifican los idiomas soportados en la informacion disponible, pero el modelo base Qwen3.8 es multilingue.
- Tool calling y funciones de agente: no se confirma en la informacion proporcionada, aunque el modelo base Qwen3.8-27B los soporta; se recomienda verificar con el runtime utilizado.

## Casos de uso

- Generacion de contenido creativo sin restricciones: escritores y creadores pueden usar este modelo para redactar narrativa, dialogos o guiones con tematicas adultas o controvertidas que el modelo base rechazaria. La cuantizacion UD-Q5_K_M (18,4 GiB) ofrece un equilibrio entre fidelidad y requisitos de hardware.
- Asistente de programacion con contexto largo: gracias a la arquitectura de atencion hibrida y a la ventana de contexto de al menos 8192 tokens (segun los ejemplos), puede mantener conversaciones multi-turno sobre codigo fuente extenso. La cuantizacion UD-Q4_K_XL (16,4 GiB) cabe en una GPU de 24 GB con contexto amplio.
- Analisis de documentos con entrada visual: con el proyector de vision, el modelo puede procesar imagenes, diagramas o capturas de pantalla junto con texto, util para extraer informacion de documentos escaneados o interfaces de usuario. Requiere cargar `mmproj-BF16.gguf` junto al GGUF principal.
- Investigacion sobre alineacion y seguridad: el modelo abliterado sirve como banco de pruebas para estudiar el impacto de la eliminacion de rechazos en el comportamiento del modelo, comparando respuestas con el modelo base. La cuantizacion UD-Q8_K_XL (29,3 GiB) es la mas proxima al BF16 original.
- Despliegue en entornos con recursos limitados: las cuantizaciones UD-Q4_K_XL y UD-Q5_K_M permiten ejecutar un modelo de 27B en GPUs de consumo (16-24 GB) mediante llama.cpp u Ollama, con una perdida de calidad menor que los quants estaticos equivalentes.
- Generacion de respuestas en tiempo real con MTP: si el runtime soporta decodificacion especulativa con los tensores MTP, se puede reducir la latencia de generacion en aplicaciones de chat o asistentes virtuales, manteniendo la calidad del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es la divergencia KL frente a un modelo de referencia no abliterado cuantizado a Q8_0, que mide la fidelidad de la cuantizacion:

| Metrica (frente a Unsloth Q8_0 no abliterado, wikitext-2, -c 8192, f16 KV) | Este repo (UD-Q5_K_M) | Static Q5_K_M (repo fuente) |
| :--- | :---: | :---: |
| Divergencia KL media | 0,070421 | 0,076442 |
| Divergencia KL mediana | 0,008692 | 0,010440 |
| Divergencia KL percentil 99 | 0,898 | 0,985 |
| Mismo top-1 | 92,327 % | 91,886 % |
| Tamano de archivo | 18,4 GB | 18,7 GB |

La cuantizacion dinamica supera a la estatica en todos los ejes con un archivo mas pequeno. Para referencia, la cuantizacion dinamica de Unsloth sobre el modelo original no abliterado obtiene una KL media de 0,021978 y un 96,933 % de top-1; la diferencia restante en este modelo se atribuye a la abliteracion, no a la cuantizacion.

## Requisitos de hardware

- UD-Q4_K_XL (16,4 GiB): cabe en una GPU de 24 GB (p. ej. RTX 3090, RTX 4090) con contexto amplio; tambien puede ejecutarse en 16 GB con offload parcial.
- UD-Q5_K_M (18,4 GiB): requiere al menos 24 GB de VRAM para carga completa; en 16 GB es necesario offload de capas a CPU.
- UD-Q6_K_XL (23,6 GiB): recomendado para GPUs de 32 GB (p. ej. A100 40GB, RTX A6000) o para 24 GB con offload parcial.
- UD-Q8_K_XL (29,3 GiB): necesita mas de 32 GB de VRAM o offload parcial; es la opcion mas proxima al BF16 original.
- El proyector de vision `mmproj-BF16.gguf` (0,9 GiB) anade requisitos adicionales de VRAM si se usa entrada visual.
- Opciones de despliegue: llama.cpp (llama-cli y llama-mtmd-cli), Ollama, y cualquier runtime compatible con GGUF que soporte los tipos de cuantizacion de Unsloth (vLLM con backend GGUF, TGI, etc.).
- Latencia y throughput: no se proporcionan datos especificos; dependen del hardware y del runtime. La arquitectura hibrida reduce el coste en contextos largos frente a atencion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
| :--- | :---: | :---: | :--- | :--- | :--- |
| Qwen3.8-27B-Heretic-Dynamic-GGUF (este) | 27B | No disponible | UD-Q4_K_XL a UD-Q8_K_XL | Apache-2.0 | Abliterado, MTP preservado, cuantizacion dinamica |
| Qwen3.8-27B (original) | 27B | No disponible | BF16, GGUFs de Unsloth | Apache-2.0 | Modelo base sin abliteracion |
| Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved | 27B | No disponible | BF16, quants estaticos | Apache-2.0 | Fuente de la abliteracion, sin cuantizacion dinamica |

La principal diferencia frente al modelo base es la abliteracion (contenido sin censura) y la cuantizacion dinamica (menor perdida de fidelidad por byte). Frente al repo fuente de llmfan46, este repositorio anade la distribucion per-tensor de Unsloth, que reduce la divergencia KL y el tamano de archivo. No se dispone de comparativas con otros modelos de 27B de otras familias.

## Limitaciones y advertencias

- La abliteracion elimina parcialmente los rechazos de seguridad, lo que puede llevar a generar contenido ofensivo, ilegal o danino. No debe usarse en aplicaciones de produccion sin una capa de moderacion externa.
- La cuantizacion, aunque de alta fidelidad, introduce una perdida de calidad frente al BF16 original; la divergencia KL medida (0,070 en UD-Q5_K_M) es baja pero no nula.
- La ventana de contexto maxima no se especifica; los ejemplos usan 8192 tokens, pero el modelo base podria soportar mas. Se recomienda verificar con el runtime.
- Los idiomas soportados no estan documentados en la informacion proporcionada; el rendimiento en idiomas distintos del ingles puede variar.
- El archivo de importancia (imatrix) se calibro sobre el modelo no abliterado; aunque el autor argumenta que sigue siendo valido, no hay una validacion exhaustiva de su efecto sobre el modelo abliterado.
- La licencia Apache-2.0 permite uso comercial, pero la abliteracion puede entrar en conflicto con politicas de uso de plataformas o con requisitos legales de moderacion de contenido.
- No se proporcionan benchmarks de tareas estandar, por lo que no es posible evaluar el rendimiento en razonamiento, codigo o matematicas de forma objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ajgazin/Qwen3.8-27B-Heretic-Dynamic-GGUF
- Modelo base (abliterado, BF16): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
