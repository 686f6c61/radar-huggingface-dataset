# IsValorum/LFM2.5-24B-A2B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

LFM2.5-24B-A2B APEX-I MiniPlus V2.1 es una cuantización GGUF de precisión mixta del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario IsValorum y calibrada con una importance matrix (imatrix) generada por m9ter1a sobre conversaciones reales de tool calling y un corpus de prosa. El modelo base es un Mixture-of-Experts de 23.971.587.712 parámetros totales con aproximadamente 2B parámetros activos por token, desarrollado por Liquid AI y orientado a agentes que se ejecutan en dispositivo (edge).

La arquitectura es híbrida: de las 40 capas, 30 son convoluciones 1D de estado corto (shortconv) con cacheo O(1) y 10 son capas de atención completa distribuidas cada cuatro bloques. Esa combinación mantiene coherencia a lo largo de una ventana de contexto nativa de 128.000 tokens con un coste de atención reducido, lo que explica el foco del modelo en baja latencia y TTFT bajo.

La relevancia de esta publicación concreta es de despliegue: comprime un modelo de 47,96 GB en BF16 a 9,64 GB en disco (8,98 GiB de pesos en memoria) sin perder ninguna de las 428 tensores del modelo, mediante una asignación diferenciada de precisión por componente. Esto lo coloca en el rango de GPU de consumo de 12-16 GB y de ejecución en CPU vía llama.cpp, aunque la licencia LFM 1.0 y el origen comunitario de la cuantización son factores a revisar antes de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts híbrida: 40 capas (30 shortconv 1D + 10 de atención completa cada 4 bloques) |
| Parametros totales | 23.971.587.712 (≈24B) |
| Parametros activos | ≈2B por token |
| Longitud de contexto | 128.000 tokens nativo |
| Tipos de cuantizacion | GGUF de precisión mixta: F32 (207 tensores), Q4_K (91), IQ3_XXS (90), Q3_K (24), Q6_K (10), Q5_K (6); 428 tensores en total |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (compatible con llama.cpp) |
| Tamano de archivo | 9,64 GB en disco / 8,98 GiB de pesos en memoria |
| Tamanos de referencia | BF16 base: 47,96 GB (44,67 GiB); NanoPlus: 8,15 GB (7,59 GiB) |
| Calibracion | imatrix de alta cobertura generada por m9ter1a |
| Relacion con el base | quantized (derivado cuantizado de LiquidAI/LFM2.5-24B-A2B) |

## Arquitectura y entrenamiento

El modelo base emplea un backbone híbrido en el que 30 de las 40 capas usan convoluciones 1D de estado corto con cacheo O(1), lo que evita el crecimiento lineal del coste de atención con la longitud de secuencia y reduce la sobrecarga de TTFT. Cada cuatro bloques se intercala una capa de atención completa (10 en total), que actúa como ancla de largo alcance y sostiene la coherencia hasta los 128.000 tokens. La capa MoE se organiza en expertos por capa: los expertos centrales (capas 6 a 35) se cuantizan a IQ3_XXS y los expertos frontera (capas 2-5 y 36-39) a Q3_K, mientras que los routers ffn_gate_inp, normas, biases y kernels de convolución se mantienen en F32 para evitar deriva numérica en el enrutado. Las cabezas de salida de atención se conservan en Q6_K y las dos capas FFN densas iniciales (0 y 1) en Q5_K.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. La información de calibración de esta cuantización sí está documentada: la imatrix se generó sobre conversaciones auténticas de tool calling renderizadas con la plantilla de chat nativa del modelo, más un corpus de prosa. Liquid AI declara que el modelo supera a alternativas densas y dispersas mayores en evaluaciones agénticas, de código y matemáticas, con una ventaja de hasta 1,7x en velocidad de inferencia en dispositivos edge.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa (`conversational`).
- Razonamiento explícito: el modelo se etiqueta como `reasoning` y se posiciona como especialista en tareas de razonamiento en dispositivo.
- Tool calling y function calling: es el eje declarado del modelo, con resultados destacados en LiveClaw y BFCL v4.
- Uso agéntico autónomo y razonamiento multi-paso, orientado a flujos con llamadas a herramientas encadenadas.
- Soporte multilingüe en 17 idiomas, con presencia de español, portugués, italiano, francés, alemán, árabe, chino, japonés, coreano, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ejecución en dispositivo (edge) con latencia baja gracias al backbone convolucional de estado constante.
- Capacidades de código y matemáticas, según la evaluación declarada por Liquid AI en el modelo base.
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Agentes con tool calling en producción: el modelo está entrenado y calibrado específicamente sobre conversaciones de llamada a funciones, por lo que encaja en pipelines donde el LLM decide qué herramienta invocar, formatea argumentos y encadena pasos. La ventana de 128K permite mantener el historial completo de la sesión y las definiciones de herramientas sin truncar.
- Asistentes locales en portátiles o estaciones de trabajo sin GPU dedicada: con 8,98 GiB de pesos se puede servir vía llama.cpp en CPU, lo que habilita asistentes privados que no envían datos a la nube. Es el escenario natural de un modelo con solo 2B parámetros activos.
- Automatización de atención al cliente multi-turno: la combinación de contexto largo y bajo coste por token activo permite gestionar conversaciones extensas con base de conocimiento inyectada sin que el coste de inferencia se dispare.
- Procesamiento de documentos largos y extracción estructurada: los 128K tokens de contexto admiten contratos, informes o expedientes completos en una sola pasada, con salida en formato estructurado vía tool calling.
- Copilotos de código integrados en el IDE: el modelo cubre generación de código y llamadas a herramientas, de modo que puede consultar el repositorio, ejecutar comandos y proponer parches desde un equipo de desarrollo local.
- Enrutado y clasificación dentro de una arquitectura multi-modelo: por su bajo coste por token y su velocidad, puede actuar como primer nivel que clasifica la petición y decide si deriva a un modelo mayor.
- Investigación y experimentación con arquitecturas híbridas: al ser una cuantización accesible de un MoE híbrido conv+attention, sirve para medir en hardware modesto el comportamiento real de este tipo de backbone frente a transformers densos equivalentes.

## Benchmarks y rendimiento

Datos publicados en la información disponible (evaluaciones del modelo base, no re-ejecutadas sobre esta cuantización):

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw (tool use autónomo) | 48,09 | 38,19 |
| BFCL v4 | Citado como punto fuerte, sin cifra publicada | No disponible |
| Evaluaciones agénticas, de código y matemáticas | Declaradas como superiores a alternativas densas y dispersas mayores (sin cifras en la información disponible) | No disponible |
| Velocidad en edge | Hasta 1,7x más rápido (declaración de Liquid AI) | No disponible |

No se han publicado resultados de benchmarks específicos para esta cuantización APEX-I-MiniPlus V2.1 (no hay medición de degradación frente al BF16 base en la información proporcionada). Tampoco hay datos de throughput o latencia medidos sobre este archivo GGUF concreto.

## Requisitos de hardware

- VRAM de pesos: 8,98 GiB. Con overhead de runtime, contexto y buffers, el objetivo práctico es una GPU de 12 GB o superior.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 3090, RTX 4090. En tarjetas de 8 GB el modelo no cabe con margen para contexto.
- GPU profesionales: A100, H100, L40S, A6000, sin problema de capacidad; útiles si se necesita servir varias instancias o contextos de 128K simultáneos.
- Ejecución en CPU: viable con llama.cpp y cuantizaciones K-quant/I-quant. El autor menciona explícitamente ausencia de bloqueos AVX2 en la colección V2.1.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio como vías principales para GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Caché KV: al haber solo 10 capas de atención completa frente a 30 convolucionales de estado fijo, el crecimiento de memoria por contexto es notablemente menor que en un transformer denso de tamaño comparable, aunque no se dispone de cifras exactas de VRAM por longitud de contexto en la información facilitada.
- Latencia y throughput: no disponibles para esta cuantización. Los datos públicos de terceros disponibles en la búsqueda corresponden a otro modelo (Nex-N2.5-mini) y no son extrapolables.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | LiveClaw | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B APEX-I MiniPlus V2.1 (esta ficha) | 23,97B | ≈2B | 128K | 48,09 | lfm1.0 (other) | GGUF, 9,64 GB |
| LiquidAI/LFM2.5-24B-A2B (base BF16) | 23,97B | ≈2B | 128K | No disponible | lfm1.0 | Safetensors, 47,96 GB |
| Qwen3.6-35B-A3B | 35B (aproximado, según nomenclatura) | ≈3B (según nomenclatura) | No disponible | 38,19 | No disponible | No disponible en la información proporcionada |
| IsValorum LFM2.5-24B-A2B APEX-I-NanoPlus | 23,97B | ≈2B | 128K | No disponible | lfm1.0 | GGUF, 8,15 GB |

La comparación con Qwen3.6-35B-A3B se apoya únicamente en el dato de LiveClaw aportado por la model card; no hay cifras de contexto, licencia o parámetros verificables en la información disponible para ese modelo. Modelos de la misma categoría (MoE dispersos de 20-35B con 2-4B activos) podrían incluir la familia Qwen3 MoE o variantes de Mistral, pero no se dispone de datos comparativos verificados en esta búsqueda.

## Limitaciones y advertencias

- Licencia LFM 1.0: es una licencia "other" con condiciones propias. Antes de uso comercial hay que revisar el texto enlazado por Liquid AI; no se puede asumir permisividad tipo Apache 2.0.
- Es una cuantización comunitaria, no oficial: el autor es IsValorum, no Liquid AI. La degradación frente al BF16 no está medida en la información disponible, y el uso de IQ3_XXS en los expertos centrales implica una pérdida de precisión no cuantificada.
- Riesgo de alucinación: como cualquier LLM, puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento largo. No hay evaluación publicada de tasas de alucinación.
- Sesgos: no se documenta ninguna auditoría de sesgos ni la composición del dataset de entrenamiento, lo que impide estimar sesgos de género, idioma o cultura.
- Cobertura idiomática desigual: aunque se declaran 17 idiomas, no hay métricas por idioma. Los idiomas con menos presencia en datos de entrenamiento (tailandés, vietnamita, hindi, indonesio) probablemente rindan peor que el inglés.
- Degradación por cuantización en el enrutado: el autor mantiene routers y normas en F32 precisamente para evitarlo, pero no hay verificación independiente de que el enrutado MoE se comporte igual que en BF16.
- Métricas de adopción mínimas: 0 descargas y 1 like en el momento de la consulta. No hay historial de uso en producción ni informes de terceros que validen la calidad del archivo.
- Rendimiento declarado frente a rendimiento medido: el dato de 1,7x más rápido en edge procede de Liquid AI para el modelo base, no de una medición sobre esta cuantización concreta.
- Fecha del repositorio: creado el 2026-10-13 y actualizado el 2026-10-14, con lo que conviene verificar que no existan revisiones posteriores que cambien el perfil de cuantización.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Fuente de la imatrix de calibración (m9ter1a): https://huggingface.co/m9ter1a/LFM2.5-24B-A2B-GGUF
- Edición NanoPlus: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-NanoPlus-GGUF
- Colección VAL-APEX-I: https://huggingface.co/collections/IsValorum/val-apex-i-6ac563d1784a04a1bb177f47
- Colección APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Colección APEX-I-NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-6ab41467c988a1b1cb9b83bc
- Apoyo al autor de la cuantización: https://ko-fi.com/isvalorum
