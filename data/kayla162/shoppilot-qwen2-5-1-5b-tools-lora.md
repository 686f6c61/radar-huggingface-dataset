# kayla162/shoppilot-qwen2.5-1.5b-tools-lora

## Resumen

ShopPilot tools LoRA es un adaptador LoRA (QLoRA) publicado por kayla162 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo completo, sino un conjunto de pesos de adaptación de 18.464.768 parámetros (0,1 GB en el repositorio) que se fusiona con el modelo base para especializarlo en una tarea muy concreta: el uso de herramientas (tool calling) dentro de ShopPilot, una aplicación de análisis de productos para vendedores de una plataforma de comercio electrónico (código en GitHub).

El problema que resuelve es acotado y medible: el Qwen2.5-1.5B-Instruct sin ajustar elegía mal las herramientas disponibles (7 en total: resumen de tienda, ranking por categoría, ranking por ventas, consulta de producto, búsqueda de producto, producto seleccionado en barra lateral y lista de pendientes) o, tras recibir el resultado de la herramienta, respondía que no había datos o copiaba listas enteras. El LoRA eleva la tasa de acierto en la evaluación propia del proyecto del 59 % (83/141) al 96 % (135/141) con el mismo modelo cuantizado Q4_K_M y llama.cpp sobre CPU.

Su relevancia es la de un caso práctico de ajuste fino eficiente: demuestra que con QLoRA de rango 16, 662 ejemplos sintéticos y 43,7 minutos en una GPU de portátil de 6 GB (RTX 3060 Laptop) se puede convertir un modelo de 1,5B en un agente de tool calling fiable para un dominio estrecho. La contrapartida es que no es un modelo generalista: solo cubre los 7工具 de ShopPilot y preguntas de tienda en chino tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 18.464.768 (adaptador LoRA); modelo base Qwen2.5-1.5B-Instruct |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el ejemplo de uso de llama.cpp fija n_ctx=8192 sobre el modelo base |
| Tipos de cuantizacion | adaptador en safetensors (bfloat16) y GGUF F16 para superponer a Q4_K_M del modelo base |
| Idiomas soportados | zh (chino tradicional, según la model card y el tag de idioma) |
| Licencia | apache-2.0 (pesos del LoRA y modelo base); código ShopPilot MIT |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) y GGUF (shoppilot-tools-lora-f16.gguf) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: los pesos originales de Qwen2.5-1.5B-Instruct se cuantizan a 4 bits NF4 y los módulos LoRA se mantienen en bfloat16, con rank 16, alpha 32, dropout 0,05 y adaptadores en las proyecciones q/k/v/o/gate/up/down. El cálculo de la pérdida se restringe a los tokens de respuesta. Se usa learning rate 2e-4 con scheduler cosine, acumulación de gradiente 8 y 1 época (75 pasos). El entrenamiento se ejecutó en una RTX 3060 Laptop de 6 GB durante 43,7 minutos, con un pico de 2,1 GB de VRAM, y la pérdida de validación bajó de 0,52 a 0,004.

Los datos son 662 conversaciones sintéticas con estructura «pregunta → llamada a herramienta → retorno de herramienta → respuesta», generadas por el script `finetune.py` de ShopPilot a partir de 35 tiendas ficticias generadas aleatoriamente (distintas de las tiendas usadas en evaluación) y 13 tipos de pregunta. Todos los números de las respuestas aparecen en el resultado devuelto por la herramienta. El adaptador está entrenado contra un JSON schema de herramientas concreto (`shoppilot/llm/qa_tools.py`) y un system prompt concreto (`shoppilot/llm/prompts/shop_qa_tools.md`); cambiar cualquiera de los dos degrada el rendimiento. La exportación a GGUF se realiza con `scripts/export_lora_gguf.py`.

## Capacidades

- Tool calling / function calling restringido a 7 herramientas de ShopPilot: resumen de tienda, ranking por categoría, ranking por ventas, consulta de producto, búsqueda de producto, producto seleccionado en barra lateral y lista de pendientes.
- Encadenamiento de llamada a herramienta y respuesta final en un solo turno, con grounding numérico: las cifras de la respuesta provienen del retorno de la herramienta.
- Comprensión de preguntas de negocio en chino tradicional sobre catálogo, ventas, categorías y productos de una tienda.
- Generación de texto en chino tradicional heredada del modelo base.
- No cubre visión, audio, matemáticas avanzadas ni razonamiento general más allá de lo que aporta Qwen2.5-1.5B-Instruct.
- No es un modelo de agentes multi-paso general: no hay planificación de varios saltos ni selección dinámica de herramientas fuera del conjunto entrenado.

## Casos de uso

- Asistente de análisis de tienda en ShopPilot: el LoRA selecciona la herramienta adecuada (resumen, ranking o consulta) y redacta la respuesta con los datos devueltos; es su caso de uso nativo y el único validado por la evaluación del autor.
- Consulta de producto por identificador: dado un SKU o nombre, el modelo invoca la herramienta de consulta y responde con los campos disponibles sin inventar cifras.
- Ranking de ventas por categoría: pregunta del tipo «¿qué categoría vende más?» resuelta mediante la herramienta de ranking, con la cifra copiada del retorno.
- Búsqueda de productos por criterios: el modelo transforma una pregunta en lenguaje natural en una llamada de búsqueda con parámetros y resume los resultados.
- Recuperación del producto seleccionado en la interfaz: caso en el que el LoRA pasó de 0/18 a 18/18 aciertos en la evaluación; útil para asistentes embebidos en paneles con contexto de selección.
- Gestión de pendientes del vendedor: consulta de la lista de tareas pendientes mediante la herramienta correspondiente y respuesta resumida.
- Despliegue en CPU o hardware modesto: al superponerse a Qwen2.5-1.5B-Instruct Q4_K_M con llama.cpp, permite ejecutar el asistente en un portátil sin GPU, con el coste de latencia de un modelo de 1,5B cuantizado.

## Benchmarks y rendimiento

Evaluación propia del autor sobre 141 preguntas generadas por programa a partir de datos de tienda (3 tiendas: una de demostración y dos reales con datos no públicos) y 30 preguntas orales escritas a mano, todas ejecutadas con Qwen2.5-1.5B-Instruct Q4_K_M y llama.cpp en CPU:

| Configuración | 141 preguntas (IC 95 %) | Preguntas orales |
|---|---|---|
| Tool calling · Qwen2.5-1.5B-Instruct | 83 (59 %, 51–67 %) | 16/30 |
| Tool calling · Qwen2.5-1.5B-Instruct + este LoRA | 135 (96 %, 91–98 %) | 21/30 |
| Tool calling · Qwen3 8B (Ollama, referencia) | 133 (94 %, 89–97 %) | 25/30 |

Prueba de McNemar pareada antes/después: p < 10⁻¹¹. De las 141 preguntas, 1 respuesta incorrecta y 5 respuestas de «no hay datos». Sobre las dos tiendas reales no vistas en entrenamiento (textil y cosmética), aciertos del 98 % y 91 %. Mejoras por tipo de pregunta: producto seleccionado en barra lateral 0/18 → 18/18, ventas de producto 3/15 → 15/15, ventas de productos de cola larga 0/15 → 15/15. Fallos residuales: preguntas dobles (solo responde la primera parte) y tipos de pregunta ausentes del entrenamiento (top N, ventas totales y número de productos de una categoría).

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia del adaptador: despreciable por sí sola (18,5 M de parámetros en bfloat16); el coste lo determina el modelo base.
- Modelo base en Q4_K_M con llama.cpp: ejecutable en CPU; el autor lo validó en un equipo sin GPU con `n_ctx=8192`.
- Modelo base en bfloat16 con transformers + PEFT: aproximadamente 3 GB de pesos más overhead de activaciones y KV cache; cabe en GPUs consumer de 8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090).
- Entrenamiento del adaptador: RTX 3060 Laptop de 6 GB, 43,7 minutos, pico de 2,1 GB de VRAM; reproducible en cualquier GPU con 6 GB o más.
- Despliegue: llama.cpp / llama-cpp-python con `lora_path`, o transformers + peft con `merge_and_unload()`. No hay indicios de soporte específico en vLLM o TGI para este adaptador.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShopPilot tools LoRA (este) | 18,5 M de adaptador sobre 1,5B | no disponible (ejemplo con 8192) | 7 herramientas fijas de ShopPilot, 96 % en evaluación propia | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en la información | genérico, 59 % en la misma evaluación | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen3 8B | 8B | no disponible en la información | genérico, 94 % en la misma evaluación (referencia del autor) | no disponible en la información | Ollama |

La comparación con Qwen3 8B es la única referencia cuantitativa aportada por el autor y muestra que el LoRA acerca a un modelo de 1,5B al rendimiento de uno de 8B en esta tarea concreta, a costa de perder generalidad.

## Limitaciones y advertencias

- Solo aprende los 7工具 de ShopPilot y preguntas de tienda en chino tradicional; no es un modelo de tool calling de propósito general.
- Está entrenado contra un JSON schema y un system prompt concretos; sustituirlos degrada el rendimiento de forma no cuantificada.
- Los datos de entrenamiento son sintéticos (35 tiendas ficticias); no se ha entrenado con datos reales de vendedores.
- La evaluación usa preguntas y respuestas generadas por programa y solo comprueba la presencia de la respuesta canónica (producto, categoría, número), no la corrección del resto de la frase; las 30 preguntas orales se escribieron antes de cerrar la última versión de datos y se ejecutaron una sola vez.
- En producción, ShopPilot aplica una verificación numérica que oculta cifras ausentes en el retorno de la herramienta; al usar el LoRA de forma aislada esa protección no existe y aumenta el riesgo de cifras incorrectas.
- Fallos conocidos: preguntas que piden dos cosas a la vez y tipos de pregunta no vistos en entrenamiento (top N, totales por categoría).
- Riesgo de alucinación heredado del modelo base de 1,5B, especialmente fuera del dominio de tienda.
- Licencia Apache 2.0 permite uso comercial de los pesos del adaptador; el código de ShopPilot es MIT. No se documentan sesgos específicos más allá de los del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kayla162/shoppilot-qwen2.5-1.5b-tools-lora
- Repositorio ShopPilot: https://github.com/kayla162/ShopPilot-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base (pretrained): https://huggingface.co/Qwen/Qwen2.5-1.5B
