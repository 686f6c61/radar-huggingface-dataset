# BRR1154/SLM-LogicStrengthen-v2

## Resumen

SLM-LogicStrengthen-v2 es un ajuste fino de Qwen2.5-0.5B-Instruct (494 millones de parámetros) especializado en lógica de primer orden (FOLIO), resolución de restricciones con Z3 e invariantes de matrices. Lo desarrolla Bhavanam Rajendra Reddy (Runtime-Slayers) como segunda iteración de su pipeline SLM-LogicStrengthen, partiendo del checkpoint v1 del mismo autor. El modelo se presenta como un "especialista" para tareas de ejecución simbólica y razonamiento formal dentro de un modelo pequeño, en lugar de un asistente generalista.

La innovación declarada no está en los datos ni en el volumen de entrenamiento, sino en la técnica de consolidación de pesos: un LoRA real (rank=16) entrenado con 36 pasos de gradiente y posteriormente fusionado mediante una cirugía de subespacio nulo (SVD de la covarianza de activaciones del modelo base) sobre las capas 12-23. El objetivo es modificar proyecciones concretas (q_proj, v_proj, o_proj, down_proj) sin degradar el conocimiento general adquirido del modelo base.

Es relevante ahora por dos motivos: por un lado, ejemplifica una línea de trabajo de "edición de pesos" que busca especializar modelos pequeños sin reentrenar; por otro, sus resultados son honestos hasta lo incómodo: la precisión en el dominio objetivo no mejora respecto a v1 (36,67% en ambos), y la mejora real se concentra en retención general (ARC-Easy pasa del 64% al 80% en modo raw). El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que debe tratarse como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA con consolidación en subespacio nulo |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-0.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494M parámetros. Sobre él se aplica un ajuste LoRA con `LoRALinear` en PyTorch real, rank=16, con 36 pasos de gradiente. La capa objetivo es la banda 12-23, y las proyecciones modificadas son q_proj, v_proj, o_proj y down_proj (48 módulos en total, verificados con sha256 antes y después de la fusión).

La técnica destacable es la consolidación en subespacio nulo: tras entrenar el LoRA, se calcula la SVD empírica de la covarianza de activaciones del modelo base (subespacio k=24) y se proyecta el delta de pesos fuera de ese subespacio mediante ΔW_proj = ΔW − (ΔW·V_base)·V_base^T. El autor reporta un error de ortogonalidad máximo de 2,736e-09 y un desplazamiento de Frobenius máximo del 1,521%, lo que sugiere que la cirugía se aplicó con precisión numérica. Además, se incluye una calibración de abstención ("wake-error ABSTAIN") orientada a que el modelo aprenda a no responder cuando no puede resolver. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-0.5B-Instruct.
- Razonamiento de lógica de primer orden (FOLIO) y resolución de problemas con Z3.
- Cálculo de invariantes de matrices y verificación de DAGs (Kahn).
- Ejecución de tareas de dominio con verificadores simbólicos (sqlite3, z3, lxml, HTMLParser, subprocess Python) según la evaluación del autor.
- Calibración de abstención: el modelo incorpora un mecanismo de `ABSTAIN` ante errores de activación.
- Formato conversacional con `apply_chat_template` y generación determinista (`do_sample=False`).
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Verificación de fórmulas de lógica de primer orden en pipelines de investigación: el modelo puede recibir una fórmula FOLIO y devolver una interpretación o traducción a Z3, aprovechando su ajuste específico en ese dominio, aunque con una precisión de dominio del 36,67% que exige validación humana.
- Generación de restricciones Z3 a partir de enunciados en lenguaje natural: útil como borrador inicial en entornos de verificación formal, donde un ingeniero revisa y corrige la salida antes de compilarla.
- Comprobación de invariantes de matrices en cuadernos de álgebra lineal o docencia: el modelo puede proponer pasos intermedios y el usuario contrasta con cálculo simbólico.
- Detección de ciclos en grafos dirigidos acíclicos (DAG) en herramientas de build o gestión de dependencias, usando el modelo como capa de explicación del resultado del verificador Kahn.
- Prototipado de asistentes de razonamiento formal en inglés para entornos educativos, donde el bajo coste de un modelo de 494M permite desplegarlo en CPU o GPU modesta.
- Investigación sobre edición de pesos y subespacios nulos: el checkpoint sirve como referencia reproducible para estudiar cómo la consolidación LoRA afecta a la retención general (ARC-Easy) frente a la especialización.
- Filtro de abstención en pipelines de QA: el mecanismo `ABSTAIN` calibrado puede usarse para descartar respuestas de baja confianza antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | v1 (baseline) | v2 (este modelo) | Delta |
|---|---|---|---|
| FOLIO-24 + Z3/Matrix-6 (Domain Execution / Solver Accuracy) | 36,67% | 36,67% | +0,00 pts |
| ARC-Easy-25 Retention (Raw) | 64,0% | 80,0% | +16,0 pts |
| ARC-Easy-25 Retention (PMI-Calibrated) | 72,0% | 76,0% | +4,0 pts |
| AA-Omniscience-12 Calibration Index | −25,00 | −16,67 | +8,33 pts |

El dato clave es que la especialización en el dominio objetivo no mejora respecto a v1; la ganancia se produce en retención general y calibración. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica, 2-3 GB son suficientes.
- En cuantización de 8 bits: en torno a 0,5 GB; en 4 bits, en torno a 0,3 GB (estimación a partir del tamaño, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en CPU para inferencia en lote pequeño, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (soporte nativo, `device_map="auto"`), text-generation-inference (tag `text-generation-inference` en el repo), endpoints compatibles. No se confirma soporte de GGUF, llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-LogicStrengthen-v2 | 494M | no disponible | FOLIO, Z3, invariantes de matrices | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según documentación de Qwen) | Asistente generalista | Apache 2.0 | Hugging Face (ampliamente usado) |
| SLM-LogicStrengthen-v1 | 494M | no disponible | FOLIO, Z3, invariantes de matrices | Apache 2.0 | Hugging Face (checkpoint previo del autor) |
| Phi-3-mini | 3.800M | 4.096 tokens | Razonamiento generalista | MIT | Hugging Face |

La comparación con Qwen2.5-0.5B-Instruct es la más directa, ya que es su modelo base: v2 añade especialización y retención medida, pero no supera al base en conocimiento general. Frente a Phi-3-mini, el modelo de este análisis es mucho más pequeño y especializado, con menor capacidad general pero menor coste de despliegue.

## Limitaciones y advertencias

- La precisión en el dominio objetivo (36,67%) no mejora respecto a v1; el ajuste no aporta ganancia medible en la tarea para la que fue diseñado.
- Los benchmarks son declarados por el autor y marcados como `verified: false`; no hay evaluación independiente.
- El modelo solo soporta inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación en tareas de lógica formal: un 36,67% de acierto implica que la mayoría de las respuestas de dominio son incorrectas, por lo que no debe usarse sin verificación simbólica posterior.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-0.5B-Instruct hereda los sesgos de su corpus de entrenamiento, no auditados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación independiente desaconseja su uso en producción sin validación propia.
- El modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se confirma la longitud de contexto efectiva ni el soporte de cuantizaciones GGUF/llama.cpp.
- El nombre "SLM" (small language model) y la técnica de subespacio nulo son propuestas del autor; no hay publicaciones revisadas por pares que respalden la metodología en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SLM-LogicStrengthen-v2
- Checkpoint previo v1: https://huggingface.co/BRR1154/SLM-LogicStrengthen-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
- Repositorio, paper o demo adicionales: no disponibles en la información proporcionada.
