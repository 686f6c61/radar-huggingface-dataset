# Shankarblr/Llama-3.2-3B-TechWriter-Instruct

## Resumen

Llama-3.2-3B-TechWriter-Instruct es un modelo de lenguaje especializado en redacción técnica para el sector de semiconductores e interconexiones de centro de datos. Fue desarrollado por Shankarblr mediante un proceso de fine-tuning con QLoRA sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`, y está publicado como repositorio de inferencia con los pesos ya fusionados en formato safetensors.

El objetivo del modelo es generar contenido técnico de marketing y documentación: notas de producto, hojas de datos (datasheets), notas de aplicación y secciones de guías de usuario para interfaces de línea de comandos (CLI) de adaptadores y conmutadores. Su relevancia radica en que permite producir borradores internos con coherencia de género y con consistencia entre especificaciones, evitando contradicciones de proceso, rendimiento o factor de forma.

Arquitectónicamente es un transformer decodificador basado en Llama 3.2, con aproximadamente 3.210 millones de parámetros en punto flotante de 16 bits. La longitud de contexto del modelo base (128k) no se especifica en la información proporcionada, por lo que no se puede confirmar para esta variante. El modelo está pensado para un uso activo solo en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Llama 3.2) |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | No disponible (no es modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (pesos fusionados publicados; no se especifican otras cuantizaciones) |
| Idiomas soportados | Inglés |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `meta-llama/Llama-3.2-3B-Instruct`, que a su vez es un transformer decodificador con atención estándar. El proceso de entrenamiento utilizó QLoRA con cuantización de 4 bits NF4 y doble cuantización, para después fusionar los adaptadores LoRA en los pesos finales en FP16. El entrenamiento se realizó con Hugging Face TRL (`SFTTrainer` / `SFTConfig`). Los adaptadores se aplicaron a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con `r=16`, `alpha=32` y dropout de 0.05.

El conjunto de datos de entrenamiento es privado y está compuesto por 6.765 filas en formato ChatML, derivado de PDFs de proveedores y documentos sintéticos limpiados. Se realizó una división 90/10 con semilla 42, y la longitud de secuencia fue de 2.048 tokens. El entrenamiento se ejecutó durante 3 épocas, equivalentes a 1.143 pasos, con un learning rate de 2e-4 en programación coseno y un warmup del 3%. El tamaño de lote efectivo fue de 4 con acumulación de gradientes de 4. No se aplicó RLHF ni DPO; solo supervisión mediante SFT.

## Capacidades

- Generación de texto técnico especializado en semiconductores e interconexión de centros de datos.
- Redacción de notas de producto (product briefs) y listas de características para hojas de datos.
- Escritura de notas de aplicación (application notes).
- Generación de secciones de guías de usuario para CLI de adaptadores y conmutadores.
- Extracción de especificaciones a partir de fragmentos de texto pegados en la entrada.
- Respuesta a preguntas de corto alcance y ancladas en un fragmento de documentación proporcionado.
- Mantienen consistencia interna en especificaciones (un solo nodo de proceso, un rendimiento principal, un factor de forma).
- No se especifica soporte de tool calling, function calling ni uso como agente en la información publicada.
- No soporta vision ni audio; es exclusivamente texto.

## Casos de uso

- Notas de producto para adaptadores de red convergente: el modelo genera el texto de un brief para una serie de adaptadores de 40/50/100GbE, manteniendo las especificaciones coherentes y en el estilo de marketing técnico esperado.
- Hojas de datos de conmutadores Ethernet: el autor puede solicitar la sección de "características clave" de una serie de conmutadores empresariales de 1/10/25GbE y obtener un borrador estructurado listo para revisión humana.
- Guías de usuario CLI para adaptadores host: el modelo redacta secciones de comandos y ejemplos de configuración para interfaces de línea de comandos, respetando una sintaxis plausible y sin mezclar productos de distintas familias.
- Extracción de especificaciones: el usuario pega un extracto de una hoja de datos y el modelo extrae los valores clave de forma estructurada, útil para comparar productos o poblar bases de datos internas.
- Notas de aplicación internas: se pueden generar documentos explicativos sobre un determinado tipo de interconexión o tecnología de almacenamiento, con un enfoque técnico y un tono adaptado al público de ingeniería.
- Generación de borradores de documentación para revisiones internas: el modelo produce un primer texto coherente sobre un producto nuevo, reduciendo el trabajo de redacción posterior y exigiendo una revisión humana para validar cifras y nombres de productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos resultados declarados por el autor corresponden a un conjunto de validación propio de escritura técnica, presentados en la model card como no verificados.

| Tarea | Dataset | Métrica | Valor (época 3) |
|---|---|---|---|
| Modelado causal de lenguaje (evaluación forzada por profesor) | Semiconductor technical-writing ChatML mix (10% holdout) | Loss de evaluación | 0.1313 |
| Modelado causal de lenguaje (evaluación forzada por profesor) | Semiconductor technical-writing ChatML mix (10% holdout) | Precisión media por token | 0.9513 |

Estos valores corresponden a la evaluación sobre el 10% de retención del conjunto de datos privado de escritura técnica. No se aportan comparaciones con otros modelos.

## Requisitos de hardware

- Los pesos en FP16 ocupan aproximadamente 6,4 GB, por lo que la inferencia requiere una VRAM similar o superior en ese formato.
- Para ejecutar el modelo en FP16 con contexto moderado se recomienda una GPU con al menos 8 GB de VRAM, como una RTX 3060 de 12 GB o una RTX 4070.
- En GPUs de mayor capacidad (A100, H100, RTX 4090) el modelo puede ejecutarse con lotes mayores y contextos más largos.
- Es posible ejecutarlo en configuraciones de CPU mediante cuantizaciones GGUF, pero no se ofrecen cuantizaciones oficiales; habría que generarlas a partir de los pesos publicados.
- Opciones de despliegue: Hugging Face transformers (`AutoModelForCausalLM`, `pipeline`), vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (si se convierten los pesos a GGUF).
- No se proporcionan datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

La comparación se establece con el modelo base del que deriva, ya que no se dispone de datos de rendimiento de otros modelos afinados para la misma tarea.

| Modelo | Parametros | Contexto | Licencia | Objetivo |
|---|---|---|---|---|
| Llama-3.2-3B-TechWriter-Instruct | 3,21 mil millones | No disponible | Llama 3.2 Community License | Redacción técnica de semiconductores |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | Chat general e instrucciones |
| Qwen2.5-1.5B TechWriter (mencionado por el autor) | No disponible | No disponible | No disponible | Mismo enfoque, diferente base |

No se han publicado comparativas de rendimiento entre estos modelos en tareas de escritura técnica.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo puede inventar SKU o códigos de producto si se le pide escribir un brief de un producto que no estaba en los datos de entrenamiento.
- No es adecuado para generar números de hojas de datos autoritativos ni especificaciones finales sin una verificación humana o contra la fuente original.
- No debe utilizarse para documentación legal, de seguridad ni para especificaciones orientadas al cliente sin supervisión.
- Solo funciona en inglés; las consultas en otros idiomas producirán resultados de baja calidad.
- El modelo no está pensado para conversación general fuera del ámbito de semiconductores, interconexión, almacenamiento y DPU.
- El rendimiento medido se limita a una métrica de precisión por token en un conjunto de validación propio; no hay garantías de comportamiento en casos reales.
- Se recomienda revisar la licencia Llama 3.2 Community License antes de cualquier uso comercial.
- El autor advierte de que el `generation_config.json` puede incluir un `max_length` residual; conviene pasar solo `max_new_tokens` al generar para evitar advertencias.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/Shankarblr/Llama-3.2-3B-TechWriter-Instruct](https://huggingface.co/Shankarblr/Llama-3.2-3B-TechWriter-Instruct)
- Adaptador LoRA (solo adaptadores): [https://huggingface.co/Shankarblr/Llama-3.2-3B-TechWriter-LoRA](https://huggingface.co/Shankarblr/Llama-3.2-3B-TechWriter-LoRA)
- Modelo base: [https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
