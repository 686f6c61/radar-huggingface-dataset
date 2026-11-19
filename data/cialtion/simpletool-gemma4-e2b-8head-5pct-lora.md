# Cialtion/SimpleTool-Gemma4-E2B-8Head-5pct-LoRA

## Resumen

SimpleTool-Gemma4-E2B-8Head-5pct-LoRA es un adaptador LoRA especializado en tool calling desarrollado por Cialtion sobre el checkpoint `google/gemma-4-E2B-it`. No se distribuye como modelo fusionado: el paquete contiene únicamente los artefactos de entrenamiento (adaptador LoRA, filas de embeddings especiales, tokenizador y lógica de reconstrucción) y requiere descargar por separado el modelo base original de Google para poder ejecutarse.

La propuesta técnica es poco habitual: en lugar de generar la llamada a herramienta como texto libre, el adaptador descompone la salida en ocho ramas lógicas (contenido, función y seis argumentos) que comparten el backbone y decodifican de forma autorregresiva tras su propio marcador. El entrenamiento se realizó sobre el 5 % del corpus del proyecto SimpleTool durante 18 975 pasos (una época), con un LoRA de rango 128 y alpha 256, y filas de tokens de inicio/fin/nulo entrenadas específicamente.

El interés actual del modelo reside en su enfoque estructurado para la generación de llamadas a funciones con esquemas estrictos: orden de parámetros obligatorios antes que opcionales, coherencia entre `required` y el orden de propiedades, y un máximo de seis propiedades de nivel superior. Es un artefacto de investigación con validación limitada (diagnóstico interno de 800 casos, no benchmark oficial), pensado para quienes trabajan en decodificación restringida por esquema y tool calling multilingüe chino-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base Gemma 4 E2B); decodificacion multi-rama con 8 cabezas logicas (content, function, arg1-arg6) |
| Parametros totales | no disponible (adaptador LoRA r128/alpha256; tamano de repo 0,8 GB) |
| Parametros activos | no disponible (el modelo base es de la familia E2B; no se detalla si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado y validado en BF16 con adaptadores FP32) |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, head_tokens.safetensors, grouped_expert_lora.safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-E2B-it` mediante un LoRA convencional de rango 128 y alpha 256, complementado con `head_tokens.safetensors`, que contiene 17 filas de tokens de inicio, fin y nulo entrenadas; en la serie E se restauran además filas de embedding por capa. Para la variante 26B-A4B se incluye un `grouped_expert_lora.safetensors` adicional (expert r16 / alpha32). La reconstrucción no es posible con PEFT estándar: el repositorio incluye `modeling.py` y `ADAPTER_FORMAT.json` con la lógica de carga personalizada que restaura las filas especiales, PLE y los deltas de expertos agrupados.

El entrenamiento completó 18 975 pasos en una sola época sobre el 5 % del corpus SimpleTool (fracción de selección de datos, no poda). La decodificación es autorregresiva por rama: cada cabeza emite tras su marcador correspondiente, con la restricción de que los parámetros obligatorios preceden a los opcionales, `required` debe concordar con el orden de propiedades y los argumentos siguen las posiciones del esquema de la herramienta seleccionada. El número máximo de propiedades de nivel superior es seis. No se documenta el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación estructurada de llamadas a herramientas con esquemas JSON y orden de propiedades restringido.
- Descomposición en ocho ramas independientes: contenido, función y hasta seis argumentos.
- Tool calling multilingüe chino-inglés.
- Generación de contenido opcional mediante el flag `--content` (excluida de la evaluación de calidad).
- Plantilla de chat nativa de Gemma que cierra el bloque de pensamiento según el entrenamiento del autor.
- Modo de decodificación secuencial por rama en la implementación de referencia (no reproduce la ruta paralela CUDA).
- No ejecuta herramientas: la salida es una propuesta de llamada.

## Casos de uso

- Integración en pipelines de agentes con esquemas estrictos: el modelo genera llamadas con orden de parámetros validado y `required` coherente, lo que reduce errores de parseo en orquestadores que exigen conformidad con el esquema.
- Asistentes de atención al cliente en chino e inglés: la rama de función separada de los argumentos permite enrutar la intención y rellenar parámetros de forma independiente, útil en sistemas con catálogos de herramientas amplios.
- Generación de consultas a APIs internas: con un máximo de seis propiedades de nivel superior por herramienta, encaja en APIs con firmas acotadas y validación previa a la ejecución.
- Investigación en decodificación restringida: el diseño de ocho cabezas sirve como banco de pruebas para comparar decodificación por rama frente a generación de texto libre en tareas de function calling.
- Extracción de entidades y slots correlacionados: las ramas arg1-arg6 permiten estudiar el misbinding de entidades en tareas de rellenado de plantillas, un fenómeno documentado por el propio autor.
- Evaluación comparativa de adaptadores LoRA para tool calling: el paquete incluye el conjunto de diagnóstico SimpleTool-Diagnostic-800 (400 chino + 400 inglés) para reproducir las métricas registradas.

## Benchmarks y rendimiento

Evaluación registrada el 2026-11-17 sobre SimpleTool Diagnostic-800 (400 chino + 400 inglés), decodificación greedy, máximo 128 tokens nuevos por cabeza, base en BF16 y adaptadores en FP32, con SDPA y KV cache. El matcher es un comparador literal tipado local, no el AST/ejecución oficial de BFCL.

| Metrica | Resultado |
|---|---|
| Required-call matches | 469/800 (58,625 %) |
| Function matches | 752/800 (94,000 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL) en la información disponible. La calidad de visión y de contenido no fue evaluada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del checkpoint base `google/gemma-4-E2B-it`, que debe obtenerse por separado.
- GPU recomendadas: no disponible. El entorno validado es Torch 2.11.0 con CUDA 12.8, transformers 5.17.0 y PEFT 0.21.3.
- Compatibilidad con GPU de consumo: no confirmada; el autor no documenta requisitos de VRAM ni pruebas en RTX 4090 u otras consumer.
- Opciones de despliegue: carga personalizada mediante `modeling.py` y el script `infer.py` del repositorio; PEFT estándar no es suficiente para restaurar las filas especiales. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La implementación de referencia decodifica cada rama secuencialmente por claridad y no reproduce la ruta paralela CUDA del entorno original.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores de tool calling ni con el modelo base en tareas equivalentes.

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar el checkpoint base `google/gemma-4-E2B-it` y usar la lógica de carga incluida; PEFT por sí solo no restaura correctamente los pesos.
- Las métricas proceden de un matcher literal tipado local, no del benchmark oficial BFCL con AST o ejecución; no son directamente comparables con resultados publicados de terceros.
- El 58,625 % de coincidencias en llamadas requeridas indica un margen de error considerable: los valores opcionales malformados pueden hacer fallar el matcher aunque el esquema sea válido.
- Las ramas de parámetros independientes pueden asignar entidades a slots incorrectos o confundir slots correlacionados.
- Los pares de muestras relacionadas del diagnóstico no son tareas IID, lo que puede inflar la aparente consistencia.
- La calidad de contenido y las capacidades de visión no fueron evaluadas.
- Solo se declaran idiomas chino e inglés; no hay evidencia de rendimiento en castellano.
- Las mediciones son de 2026-11-17 y no proceden de una recarga fresca del Hub; el autor advierte que versiones más recientes de las dependencias requieren validación independiente.
- La salida es una propuesta de llamada: ninguna herramienta se ejecuta, por lo que la validación y el sandboxing corren a cargo del integrador.
- Licencia Apache 2.0 para el adaptador, con las notas y licencias upstream del modelo base de Google aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Gemma4-E2B-8Head-5pct-LoRA
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Repositorio de código y evaluación: https://github.com/HaxxorCialtion/SimpleTool
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
