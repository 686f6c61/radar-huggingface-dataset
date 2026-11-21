# alea-institute/alea-foundations-6B-A2B-joint12b-step7137

## Resumen

ALEA Foundations 6B-A2B es un modelo de lenguaje base de tipo mixture-of-experts (MoE) desarrollado por el ALEA Institute. Cuenta con 5.983.272.064 parámetros totales y 2.001.960.064 parámetros activos por token, distribuidos en 38 capas (4 densas, 30 MoE y 4 densas). El checkpoint documentado, `step7137`, marca el final de la etapa de entrenamiento conjunto de 12.000 millones de posiciones sobre una arquitectura de 38 capas, y remite a un checkpoint posterior (`f1-step48149`) que amplía el entrenamiento con una mezcla de datos más amplia.

El modelo desciende de cuatro modelos especialistas pequeños (aritmética, lógica y razonamiento, semántica y código) que se ensamblaron en paralelo y se entrenaron de forma conjunta. La arquitectura es un transformer causal estándar (`Qwen3MoeForCausalLM`, sin código personalizado) con atención grouped-query, RoPE sin escalado y una ventana de contexto de 8.192 tokens. Su vocabulario es de 32.768 tokens con un tokenizador propio (ALEA R4).

Es relevante porque combina un presupuesto de cómputo activo reducido (2B parámetros por token) con un entrenamiento fuertemente orientado a dominios legales, financieros y de razonamiento estructurado (documentos KL3M, canon legal estadounidense, datos de aritmética y lógica). Está publicado bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución, y se distribuye en safetensors float32 compatible con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (`Qwen3MoeForCausalLM`, `model_type: qwen3_moe`) |
| Parametros totales | 5.983.272.064 |
| Parametros activos | 2.001.960.064 por token (embeddings, atención, capas densas y 10 expertos seleccionados por capa MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo se distribuye en float32; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (12 shards, float32, ~23,9 GB de repo) |

## Arquitectura y entrenamiento

La arquitectura consta de 38 capas: 4 densas (índices 0-3), 30 MoE (índices 4-33) y 4 densas (índices 34-37). El tamaño oculto es 1.920. La atención es causal grouped-query con 30 cabezas de consulta, 10 cabezas KV, dimensión de cabeza 64 y RMSNorm en Q/K. Cada capa MoE tiene 40 expertos con enrutamiento top-10, pesos de enrutamiento normalizados y FFN de experto de anchura 768 (SwiGLU); las capas densas usan FFN de anchura 5.120 (SwiGLU). El encoding posicional es RoPE con theta 10.000 y sin escalado. El embedding de entrada está atado a la proyección de salida. Los tokens especiales son BOS `<|start|>` (id 0) y EOS `<|end|>` (id 1), y el padding usa el id 1. No hay bloques recurrentes ni transformer de pesos compartidos.

El entrenamiento se estructuró en cuatro etapas. Primero, entrenamiento conjunto de un padre de 26 capas (2,68B totales / 1,09B activos) durante 10.129.768.448 posiciones. Segundo, expansión en profundidad y anchura hasta 38 capas: se insertaron 12 bloques MoE como copias de bloques existentes con sus proyecciones de salida de atención y de expertos a cero, y se ampliaron los FFN de experto de 512 a 768 canales con los nuevos canales a cero; en un fixture de CPU el modelo expandido reprodujo las salidas del padre (argmax coincidente, diferencias de logits ~1e-5). Tercero, entrenamiento conjunto continuado de 38 capas sobre la misma mezcla: 1.000.079.360 posiciones (warmup de 100 actualizaciones de 1e-5 a 1e-4, decaimiento coseno a 1e-5) más 870.318.080 posiciones a 1e-5 constante, completando 12.000.165.888 posiciones (fin del checkpoint `step7137`). Cuarto, pretraining amplio F1 con 10.751.049.728 posiciones adicionales, con estado de modelo, optimizador, data-loader y RNG heredado del paso 7137, learning rate 1e-5 con rampas a 3e-5 (paso 13.417) y 5e-5 (paso 21.149), y reescalado de los pesos de salida de la capacidad añadida en el paso 27.171 (fin del checkpoint `step48149`, 22.751.215.616 posiciones totales en el linaje).

El entrenamiento usó AdamW (betas 0,9/0,999, epsilon 1e-8, weight decay 0,1, gradient clipping 1,0), 262.144 posiciones por actualización (32 secuencias de 8.192 tokens), cómputo BF16 con pesos maestros y estado del optimizador en FP32, sobre dos GPU H100 de 80 GB. Las posiciones son exposiciones de entrenamiento, no tokens únicos: las mezclas se muestrearon con replay. La mezcla conjunta (12.000 millones de posiciones) se compone de documentos naturales KL3M (30,0%), conocimiento central ALEA (25,0%), libros de dominio público (10,0%), canon legal y jurisprudencia (10,0%), lógica y razonamiento (7,5%), aritmética (10,0%), familias de tareas ALEA (5,0%) y código sintético (2,5%). La mezcla F1 (vista de 14,79B posiciones, ~10,75B consumidas) se compone de documentos naturales (45,2%), datos sintéticos y código de ALEA foundations (25,0%), ejemplos de tareas (14,9%), canon legal (9,9%), libros (4,3%) y prosa derivada de Wikidata (0,8%). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva con un modelo base (sin ajuste instructivo documentado).
- Razonamiento estructurado en lógica y matemáticas, con entrenamiento específico en datos de aritmética (10,0% de la mezcla conjunta) y familias OpenLemma/Axeyum (7,5%).
- Conocimiento y generación en dominio legal: estatutos, regulaciones, jurisprudencia y documentos del Federal Register.
- Procesamiento de documentos financieros y regulatorios (SEC EDGAR, GovInfo, patentes, Congressional Research Service).
- Generación de código a partir de datos sintéticos de ALEA (2,5% de la mezcla conjunta).
- Capacidad multilingüe: limitada al inglés según la model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado como capacidad explícita).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Análisis de contratos y documentos regulatorios: el modelo puede procesar textos legales de hasta 8.192 tokens por pasada y generar resúmenes o extracciones sobre cláusulas, gracias al 10% de canon legal y jurisprudencia en su mezcla de entrenamiento.
- Asistencia en investigación jurídica: generación de borradores y explicaciones sobre estatutos (US Code, CFR) y opiniones judiciales, aprovechando el conocimiento inyectado en la etapa conjunta.
- Procesamiento de filings financieros: extracción y resumen de secciones de informes SEC EDGAR y documentos contractuales, dado el 30% de documentos KL3M en la mezcla conjunta y el 45,2% de documentos naturales en F1.
- Razonamiento aritmético y verificación de cálculos: resolución de problemas de aritmética y lógica paso a paso, respaldada por el 17,5% combinado de datos de aritmética y lógica en el entrenamiento conjunto.
- Generación y asistencia de código en pipelines internos: el modelo puede completar y explicar fragmentos de código, aunque con un peso de datos de código limitado (2,5%), por lo que es adecuado para tareas auxiliares más que para generación de código en producción crítica.
- Fine-tuning específico de dominio: al ser un modelo base con licencia CC-BY-4.0, sirve como punto de partida para ajuste supervisado en tareas legales, financieras o de razonamiento, con un coste de inferencia bajo gracias a sus 2B parámetros activos.
- Despliegue en entornos con recursos limitados: la arquitectura MoE con 2B activos permite servir el modelo con menor coste computacional por token que un modelo denso de 6B, siempre que quepa en memoria el total de 5,98B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta entropía cruzada de desarrollo (nats por token objetivo supervisado, ~65K objetivos por dominio) medida por los propios conjuntos de diagnóstico del proyecto, que tienen solapamiento parcial conocido con las fuentes de entrenamiento. Estos valores son diagnósticos, no precisión de benchmark, y valores más bajos no establecen por sí mismos mejor capacidad. La tabla de entropía cruzada por dominio aparece truncada en la información disponible (solo se muestra el encabezado y la primera fila, "Arithmetic", sin valores).

## Requisitos de hardware

- VRAM estimada para inferencia en float32: ~23,9 GB solo para pesos, más overhead de activaciones y caché KV; el repo ocupa 23,9 GB en 12 shards.
- VRAM estimada con cuantización: no disponible (no se documentan cuantizaciones publicadas). Una conversión a BF16 rondaría ~12 GB de pesos; a 8 bits, ~6 GB; a 4 bits, ~3 GB, pero estos valores son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó en 2× H100 80 GB; para inferencia en float32 se requiere una GPU con al menos 24-32 GB (A100 40 GB, H100, L40S). No se documentan requisitos oficiales de inferencia.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo; en float32 no cabría en una RTX 4090 (24 GB) con margen para activaciones, y requeriría cuantización no publicada.
- Opciones de despliegue: `transformers` (clase `Qwen3MoeForCausalLM`, sin código personalizado). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no documentada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada. La model card no incluye comparativas con alternativas. Como referencia estructural, el modelo comparte la clase `Qwen3MoeForCausalLM` con la familia Qwen3 MoE, pero no se aportan datos de rendimiento que permitan una comparación rigurosa.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| ALEA Foundations 6B-A2B (step7137) | 5,98B | 2,00B | 8.192 | CC-BY-4.0 | Solo entropía cruzada de desarrollo (truncada) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base, no un modelo ajustado para instrucciones: no se documenta RLHF, DPO ni ajuste instructivo, por lo que su comportamiento conversacional directo puede ser limitado y requerirá fine-tuning para tareas de asistente.
- Ventana de contexto de solo 8.192 tokens, adecuada para documentos medianos pero insuficiente para contratos extensos o expedientes completos sin fragmentación.
- Soporte únicamente de inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a un modelo base entrenado sobre mezclas con replay y datos sintéticos; la model card advierte que los diagnósticos de entropía cruzada tienen solapamiento parcial con las fuentes de entrenamiento y no miden capacidad real.
- Sesgos potenciales derivados de la composición del corpus: fuerte peso de fuentes estadounidenses (US Code, CFR, SEC EDGAR, GovInfo), lo que puede introducir sesgo jurisdiccional y cultural.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige cumplir las condiciones de atribución; no se documentan restricciones adicionales de uso aceptable.
- El checkpoint documentado (`step7137`) es un punto intermedio del linaje; el autor remite a `f1-step48149` como checkpoint posterior con pretraining amplio, por lo que `step7137` puede tener menor capacidad general.
- Pesos en float32 (~24 GB): el despliegue en producción requiere cuantización no publicada o hardware con suficiente VRAM; no se documentan recetas de cuantización ni compatibilidad con motores de inferencia optimizados.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alea-institute/alea-foundations-6B-A2B-joint12b-step7137
- Checkpoint posterior F1: https://huggingface.co/alea-institute/alea-foundations-6B-A2B-f1-step48149
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles corresponden a entidades homónimas sin relación (Alea Office, MathALÉA, Aléa Dofus, Aléa Déco, portal del Ministère de l'Agriculture).
