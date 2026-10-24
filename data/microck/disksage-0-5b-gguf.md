# Microck/DiskSage-0.5B-GGUF

## Resumen

DiskSage-0.5B es un ajuste fino de dominio del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario Microck en formato GGUF cuantizado Q4_K_M. Su tarea es acotada y muy específica: recibir un paquete de evidencia medido sobre un ítem de almacenamiento en Linux (tamaño asignado, consumidores activos, runtimes instalados, referencias de contenedores, copias retenidas, propiedad) y clasificarlo como `keep`, `investigate` o `candidate`, con una explicación breve, citas de las observaciones aportadas y la lista de comprobaciones que faltan. El modelo no explora el sistema de ficheros ni ejecuta herramientas: el recolector y la aprobación de borrado pertenecen a la aplicación que lo integra.

Técnicamente es un transformer decoder-only de 494.032.768 parámetros totales (0,49 B), entrenado con LoRA BF16 de rango 32 sobre 3.048 ejemplos sintéticos generados a partir de 127 plantillas de escenarios de almacenamiento, y posteriormente fusionado y cuantizado a Q4_K_M (397.807.552 bytes). La salida está pensada para consumirse como JSON validado contra un esquema: el repositorio incluye el esquema de ejemplo, la plantilla de prompt, el system prompt exacto y los casos de aceptación.

Su relevancia es la de un caso de estudio de modelo de dominio muy pequeño (sub-1B) con salida estructurada y despliegue en CPU: la model card documenta la configuración exacta con la que se evaluó (`llama-server` con `--ctx-size 2048`, `--n-gpu-layers 0`), las condiciones de entrenamiento y el conjunto de aceptación. Al mismo tiempo, el propio autor lo etiqueta como experimental, advierte de que puede omitir comprobaciones e inventar detalles, y señala que el corpus y la evaluación fueron escritos por la misma persona, por lo que no constituyen validación experta independiente. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivada de Qwen2.5-0.5B-Instruct) |
| Parámetros totales | 494.032.768 (0,49 B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; la model card solo documenta entrenamiento con secuencia máxima de 1.024 y evaluación con `--ctx-size 2048` |
| Tipos de cuantización | Q4_K_M (única publicada, fichero `DiskSage-0.5B-Q4_K_M.gguf`, 397.807.552 bytes) |
| Idiomas soportados | inglés (`en`) declarado; el modelo base es multilingüe, pero el ajuste no se ha validado en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA fusionado antes de la conversión; no se publican safetensors del ajuste) |
| Tamaño del repositorio | 0,4 GB |
| Revisión base | `7ae557604adf67be50417f59c2c2f167def9a775` |
| SHA-256 del GGUF | `c182ec79f92e9b300bb2aef83fca653529cb54855031dde61984def4ee7fee4b` |
| Entorno de inferencia de referencia | llama.cpp, revisión `620d2225cc436ab0b001e3200e590e3b286ef9ab` |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-0.5B-Instruct sin modificaciones estructurales: un transformer decoder-only con el tokenizador y los metadatos de arquitectura originales preservados dentro del fichero GGUF. El ajuste se realizó con LoRA en BF16 sobre una única GPU H100 en Modal, con rango 32, alpha 64, dropout 0,05, tasa de aprendizaje 0,00015, batch 8, acumulación de gradiente 4, secuencia máxima de 1.024 y tres épocas. Los tokens de prompt y de padding se enmascararon en la pérdida. El entrenamiento completó 288 pasos de optimizador y se seleccionó el checkpoint 96 por pérdida mínima de validación; la validación de checkpoints contuvo 132 variantes procedentes de 22 familias distintas. El adaptador se fusionó con el modelo base antes de la conversión a GGUF y de la cuantización Q4_K_M. El stack utilizado fue PyTorch 2.8.0, Transformers 4.57.6, PEFT 0.18.1 y Accelerate 1.12.0.

El corpus de entrenamiento son 3.048 ejemplos hipotéticos escritos por el asistente a partir de 127 plantillas de escenarios de almacenamiento; el autor advierte explícitamente de que las reformulaciones y variantes de metadatos están correlacionadas. El currículo se inspiró en patrones históricos de fallos de limpieza de disco, pero no se usaron sesiones reales, credenciales ni contenidos privados como datos de entrenamiento. No se documenta RLHF ni DPO; el ajuste es supervisado sobre pares de instrucción y respuesta con salida JSON. La innovación relevante no es arquitectónica sino de ingeniería de contrato: la tarea se define mediante un system prompt, una plantilla con el marcador `__CLEANER_PACKET__`, un esquema JSON con ramas por veredicto y enums de citación que deben actualizarse con los identificadores de cada paquete de evidencia, y la recomendación de codificar `<` como `\u003c` para impedir que la evidencia inyecte delimitadores de chat.

## Capacidades

- Clasificación de ítems de almacenamiento en tres veredictos cerrados (`keep`, `investigate`, `candidate`) con explicación breve en inglés.
- Generación de salida estructurada conforme a un esquema JSON impuesto en la petición (`json_schema` en el endpoint `/completion`), con citación de los identificadores de observación aportados.
- Identificación de comprobaciones ausentes: en la rama `investigate` debe declarar al menos una entre `usage`, `contents`, `vcs`, `references`, `duplicates` u `owner`.
- Distinción entre salidas desechables y estado persistente a partir de metadatos medidos (tamaño asignado, consumidores activos, runtimes, referencias de contenedores, copias retenidas, propiedad).
- Formato conversacional con plantilla de chat exportada, compatible con endpoints de llama.cpp.
- No soporta tool calling ni function calling, no razona en múltiples pasos sobre el sistema de ficheros y no puede navegar ni ejecutar comandos.
- No se documentan capacidades de visión, audio, modo thinking ni agentes.
- Multilingüismo no validado: el único idioma declarado es el inglés.

## Casos de uso

- Triaje de espacio en disco en herramientas de operaciones: el modelo recibe el paquete de evidencia que genera un recolector propio y devuelve, por ítem, un veredicto con justificación y comprobaciones pendientes; encaja porque el JSON resultante es validable y la decisión final permanece en el operador.
- Precribado en utilidades de limpieza con aprobación humana: los ítems marcados como `candidate` se presentan a una persona como propuesta, nunca como permiso de borrado, tal y como exige el diseño del modelo.
- Generación de informes de auditoría de retención de datos: la salida cita identificadores de observación y separa el tamaño medido (que debe mantenerse fuera de la respuesta generada) de la interpretación, lo que facilita trazar cada afirmación hasta la evidencia.
- Validación de contratos de salida en pipelines de datos: sirve como caso de referencia para implementar verificación de esquema, comprobación de que los identificadores citados existen y rechazo de respuestas truncadas (`stop_type == "limit"` o `truncated`).
- Inferencia en CPU o en hardware sin GPU: con 0,4 GB de pesos y la configuración documentada (`--n-gpu-layers 0`, `--threads 4`), puede ejecutarse en servidores modestos o en el borde sin acelerador dedicado.
- Base para ajustes de dominio con salida estructurada: el repositorio publica system prompt, plantilla, esquema, `provenance.json` con hashes del dataset y `SHA256SUMS`, lo que permite reproducir el pipeline LoRA + GGUF en otro dominio.
- Etiquetado asistido de decisiones de retención en flujos de migración: dado un paquete de evidencia por ítem, el modelo clasifica y señala qué comprobación falta antes de tomar una decisión definitiva.
- Evaluación comparativa de modelos pequeños con salida constreñida: los 60 casos de aceptación incluidos permiten medir degradación por cuantización Q4 frente a otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un conjunto de aceptación congelado antes del entrenamiento y compuesto por 60 casos (20 familias contrafactuales, cada una con un caso `keep`, uno `investigate` y uno `candidate`), así como una validación de checkpoints de 132 variantes de 22 familias, pero el fragmento disponible no incluye las métricas obtenidas ni los ficheros `evaluation-cases.jsonl` y `evaluation.json` con los resultados. El autor indica además que corpus y evaluación fueron escritos por la misma persona, por lo que no equivalen a una validación experta independiente ni a un benchmark amplio de seguridad. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput medidas más allá de los parámetros de ejecución documentados.

## Requisitos de hardware

- Inferencia en CPU viable: el fichero Q4_K_M ocupa 397.807.552 bytes y la configuración de referencia usa `--n-gpu-layers 0` con 4 hilos de cómputo y 4 hilos de batch.
- VRAM estimada: por debajo de 1 GB si se descargan todas las capas en GPU (0,4 GB de pesos más caché KV para 2.048 tokens); el modelo entra en cualquier GPU de consumo con 4 GB o más, e incluso en iGPU con memoria compartida.
- GPU recomendadas: no se documentan; para esta escala no se justifica una A100 o H100 salvo para entrenamiento (el ajuste LoRA se entrenó en una H100 de Modal). En inferencia, cualquier GPU consumer (GTX 1660, RTX 3060, RTX 4090) es sobredimensionada.
- Presupuesto de contexto: la llamada de ejemplo rechaza la petición si `len(tokens) + 192 > 2048`, con `n_predict` fijado en 192; el contexto efectivo de trabajo es de 2.048 tokens.
- Despliegue: `llama-server` de llama.cpp (revisión evaluada `620d2225cc436ab0b001e3200e590e3b286ef9ab`), con los flags `--parallel 1`, `--batch-size 32`, `--ubatch-size 32`, `--no-webui`, `--no-warmup`, `--no-repack`. Al ser GGUF, también es compatible con otros runners de llama.cpp/Ollama, aunque no se han validado en la model card.
- Decodificación determinista: la evaluación usa `temperature: 0`, `seed: 20261023` y `cache_prompt: false`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| DiskSage-0.5B-GGUF | 494 M | 32.768 en base; 2.048 en la configuración evaluada | Clasificación de evidencia de almacenamiento en Linux con salida JSON | Apache 2.0 | Sin métricas publicadas en la información disponible; 60 casos de aceptación incluidos en el repo |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens | Asistente generalista conversacional | Apache 2.0 | Usado como referencia en la misma evaluación; cifras no disponibles |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Asistente generalista, mayor capacidad de razonamiento y código | Apache 2.0 | No evaluado en esta tarea |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Asistente generalista multilingüe | Licencia comunitaria Llama 3.2 | No evaluado en esta tarea |

La comparación relevante no es de capacidad general sino de adecuación al contrato de salida: frente a un modelo generalista del mismo tamaño, la ventaja de DiskSage es el formato JSON cerrado con citación de observaciones y la separación explícita entre veredicto y comprobaciones pendientes; su desventaja es que solo cubre un dominio estrecho y en inglés.

## Limitaciones y advertencias

- Modelo experimental declarado como tal por el autor: "puede omitir comprobaciones útiles e inventar detalles en una explicación". Toda recomendación debe revisarse contra la evidencia aportada antes de actuar.
- No accede al sistema de ficheros, no ejecuta herramientas y no puede determinar preferencias personales de retención; el recolector de datos y la aprobación del borrado son responsabilidad de la aplicación anfitriona.
- Riesgo de inyección de prompt a través de la evidencia: el autor recomienda codificar `<` como `\u003c` en el JSON y no reutilizar los identificadores de citación del ejemplo para otros paquetes.
- Riesgo de alucinación en las citas: la aplicación debe verificar que cada identificador citado existe en el paquete suministrado y rechazar respuestas truncadas.
- Sesgo de autoría y de datos: los 3.048 ejemplos proceden de 127 plantillas con reformulaciones correlacionadas y fueron escritos por el mismo autor que la evaluación; no hay validación experta independiente ni benchmark amplio de seguridad.
- Idioma: solo se declara inglés; no hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Contexto práctico limitado: la configuración evaluada es de 2.048 tokens, con un máximo de entrenamiento de 1.024; evidencias más largas deben rechazarse, no truncarse.
- Pérdida por cuantización: la única variante publicada es Q4_K_M; no se ofrecen comparativas frente a BF16 en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el repositorio incluye un `NOTICE` de modificación que debe conservarse; no hay garantía de idoneidad para decisiones destructivas sobre datos.
- Un veredicto `candidate` es una propuesta para revisión humana y nunca una autorización de borrado; el texto generado no debe ejecutarse como comandos.
- Advertencia de seguridad operativa: un fallo de clasificación en esta tarea puede provocar pérdida de datos persistentes; el modelo no debe conectarse directamente a un borrado sin aprobación y validación posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Microck/DiskSage-0.5B-GGUF
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de llama.cpp (runtime de referencia): https://github.com/ggml-org/llama.cpp
- Directorio genérico de modelos GGUF (local-ai-zone): https://local-ai-zone.github.io/
- Listado de modelos con librería GGUF en Hugging Face: https://huggingface.co/models?library=gguf
- GGUF Loader (cargador universal de GGUF): https://github.com/GGUFloader/gguf-loader
- Guía de fuentes de descarga de GGUF: https://ggufloader.github.io/download-gguf-models.html
- Hugging Bay (buscador de modelos locales): https://huggingbay.xyz/
