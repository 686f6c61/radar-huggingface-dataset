# RenormalizationTech/qwen2.5-7b-gcad-steering-controls

## Resumen

`RenormalizationTech/qwen2.5-7b-gcad-steering-controls` es un conjunto de bancos de control de inferencia (inference-time steering banks) para el modelo base `Qwen/Qwen2.5-7B-Instruct`. No se trata de pesos de un modelo nuevo ni de adaptadores LoRA, sino de vectores y controles que se aplican dinámicamente durante la decodificación para inducir o modular tres rasgos de estilo concretos: lenguaje soez (profanity, PF), descortesía del autor (author impoliteness) y sarcasmo (SARC). El autor es la cuenta de Hugging Face RenormalizationTech.

El interés técnico del artefacto reside en que demuestra una metodología de "steering" en tiempo de inferencia (GCAD, presumiblemente un método derivado de activation steering / persona vectors) con puertas de validación explícitas y métricas de coherencia reportadas junto a las de rasgo. El repositorio incluye el runtime de ejemplo, los ficheros de control y notas de métodos, pero excluye los pesos base (que deben descargarse por separado de Qwen) y todo el pipeline experimental privado.

Es relevante para investigadores que estudien control de estilo, seguridad y evaluación de rasgos en LLM, así como para quienes necesiten reproducir experimentos de steering con trazabilidad de procedencia (hashes de manifiesto, revisiones fijadas). El tamaño del repo es de 0.0 GB según Hugging Face, lo que sugiere que los bancos son ligeros y no contienen pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Steering de inferencia sobre transformer decoder-only (Qwen2.5-7B-Instruct); no es un modelo con arquitectura propia |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el runtime de ejemplo usa torch 2.6.0+cu124 y safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bancos de control); los pesos base se obtienen por separado del repositorio de Qwen |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo desde cero ni ajusta sus pesos. Aplica controles de steering en tiempo de inferencia sobre el checkpoint fijado `Qwen/Qwen2.5-7B-Instruct` en la revisión `a09a35458c702b33eeacc393d103063234e8bc28`. La metodología GCAD (citada en el nombre y en las notas de métodos) se apoya en bancos de control dinámicos que modifican la activación o la distribución de salida durante la decodificación para inducir rasgos de estilo específicos. El modelo base es un transformer decoder-only de 7B parámetros de la familia Qwen2.5, en su variante Instruct.

Los datos de entrenamiento del modelo base no se detallan en la información proporcionada. Respecto al steering, la model card reporta diseños de evaluación propios y distintos por rasgo: PF con b = 5 sobre 32 preguntas retenidas con decodificación greedy y tope de 160 tokens; SARC con b = 2 sobre las mismas 32 preguntas; e Impolite con b = 3.5 sobre 60 primeras respuestas del autor a 13 preguntas únicas con tope de 500 tokens y muestreo. Se documentan puertas de validación (gates) y una pérdida de coherencia sustancial en SARC (18,875 puntos) con solo 1,125 puntos de margen sobre la puerta. La validación del núcleo de inferencia es byte-idéntica al staging 02, con 3 comprobaciones de coeficiente cero sobre el base fijado y 6 forwards totales; no se reclama una reejecución en GPU del staging 03.

## Capacidades

- Inducción controlada del rasgo de profanidad (PF) en las respuestas generadas, con banco propio y coeficiente b = 5.
- Inducción controlada del rasgo de sarcasmo (SARC), con b = 2 y una tasa de 29/32 respuestas con puntuación ≥ 50 en la evaluación del autor.
- Inducción controlada de descortesía del autor (Impolite), con b = 3.5, validada mediante contrastes cualitativos del autor.
- Aplicación selectiva por banco: los tres rasgos se activan de forma aislada mediante el parámetro `--trait` (`profanity`, `sarcasm`, `impolite`).
- Verificación de integridad mediante hash SHA256 del manifiesto de release y comprobación de autoconsistencia a coeficiente cero (`--zero-selftest`).
- Inferencia local reproducible con revisión fijada del repositorio y del modelo base, sin código remoto.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias de este artefacto; las del modelo base no se detallan en la información disponible.

## Casos de uso

- Investigación en control de estilo: aplicar los bancos PF, SARC e Impolite sobre Qwen2.5-7B-Instruct para estudiar cómo varía la distribución de salida al modificar un rasgo aislado, manteniendo el resto del comportamiento del base.
- Evaluación de robustez y seguridad: generar respuestas con rasgos ofensivos inducidos de forma controlada para probar clasificadores de toxicidad, filtros de moderación o sistemas de detección de sarcasmo en pipelines de evaluación.
- Reproducibilidad de experimentos de steering: usar el manifiesto con hash SHA256 y la revisión fijada del base para replicar exactamente las condiciones de un experimento publicado, con verificación de integridad de ficheros.
- Estudio de la relación rasgo-coherencia: comparar las métricas reportadas (por ejemplo, la caída de coherencia de 18,875 puntos en SARC frente a la de PF) para analizar el coste de inducir rasgos fuertes en modelos de 7B.
- Auditoría de metodologías de validación: examinar los diseños de gate, los contrastes cualitativos y las limitaciones declaradas (un solo juez Claude, entradas PF/SARC reconstruidas) como caso práctico de documentación de validación en investigación de alineamiento.
- Docencia y formación técnica: ilustrar en un curso o taller cómo se implementa un control de inferencia con verificación de procedencia, sin necesidad de entrenar ni distribuir pesos nuevos.
- Comparación de transferencia entre tamaños: usar los resultados públicos de transferencia fija al modelo de 4B incluidos en `related_results/` para estudiar si los rasgos inducidos se transfieren entre checkpoints, teniendo en cuenta que ninguno superó las puertas de calidad.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones propias del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual, con la advertencia de que los diseños y puertas difieren entre rasgos.

| Control 7B | Diseno de evaluacion | Rasgo baseline → GCAD (random) | Coherencia baseline → GCAD (random) |
|---|---|---|---|
| PF, b = 5 | 32 preguntas retenidas, greedy, tope 160 | 0 → 31,125 (0); 14/32 aciertos de lexico | 85,34375 → 82,6875 (85,6875) |
| SARC, b = 2 | 32 preguntas retenidas, greedy, tope 160 | 0,0625 → 63,78125 (0); 29/32 ≥ 50 | 89,59375 → 70,71875 (87,71875) |
| Impolite, b = 3,5 | 60 primeras respuestas del autor a 13 preguntas unicas, muestreo, tope 500 | 1,61667 → 77,36667 (no medido) | 82,68333 → 75,9 (no medido) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al operar sobre Qwen2.5-7B-Instruct, la inferencia requiere cargar el modelo base de 7B; en precisión completa (bf16/fp16) se estiman del orden de 14-16 GB de VRAM solo para pesos, más overhead de activaciones y KV cache. El repositorio de controles en sí ocupa 0.0 GB según Hugging Face y no añade carga significativa de pesos.
- GPU recomendadas: no especificadas en la información proporcionada. Por el tamaño del base, son razonables GPUs con ≥24 GB (RTX 4090, A10G, L4 con cuantización) o ≥40-80 GB (A100, H100) para precisión completa y lotes mayores; esta estimación no procede de la model card.
- Cabe en GPU de consumo: no confirmado en la información disponible; depende de la cuantización del base, que no se documenta.
- Opciones de despliegue: el runtime de ejemplo propio del repositorio (`python -m runtime.example`) con Python 3.11, torch 2.6.0+cu124, transformers 4.52.3, accelerate 1.7.0, safetensors y tqdm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-gcad-steering-controls (este) | 7B (base) | no disponible | Bancos de steering de estilo sobre Qwen2.5-7B-Instruct | Apache-2.0 | Repo HF con runtime y controles; pesos base aparte |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | Modelo instruct generalista | Apache-2.0 | Pesos completos en HF |
| Adaptadores LoRA sobre Qwen2.5-7B | 7B (base) + adaptador | depende del base | Ajuste fino parametrizado eficiente | depende del adaptador | Variable |
| Persona Vectors (metodología citada) | no aplica | no aplica | Steering de rasgos de personalidad | no disponible | Investigación publicada |

La comparación con alternativas de la misma categoría (bancos de steering) no está disponible en la información proporcionada. Frente a LoRA, este artefacto no modifica pesos y aplica el control en tiempo de inferencia; frente al modelo base, añade rasgos de estilo a costa de coherencia medible.

## Limitaciones y advertencias

- Los controles inducen intencionadamente estilo potencialmente ofensivo (profanidad, descortesía, sarcasmo); no deben desplegarse en entornos de producción orientados a usuarios sin filtros adicionales.
- La coherencia no equivale a corrección ni a utilidad; las métricas de coherencia reportadas no validan la calidad factual de las respuestas.
- SARC presenta una pérdida de coherencia de 18,875 puntos y solo 1,125 puntos de margen sobre su puerta, lo que indica fragilidad del control.
- La validación se limita a una única familia de juez (Claude) y a entradas PF/SARC reconstruidas; la evidencia de independencia o causalidad es descriptiva, no concluyente.
- Los diseños y puertas difieren entre rasgos; los ajustes guardados son específicos de banco, tarea y decodificación, y no son dosis comparables ni controles validados conjuntamente.
- El rasgo Impolite no contó con brazo aleatorio original; su validación es cualitativa.
- No se documentan sesgos específicos, cobertura de idiomas ni comportamiento multilingüe; el modelo base puede heredar sesgos de Qwen2.5-7B-Instruct.
- Riesgo de alucinación: inherente al modelo base; el steering no lo mitiga y puede agravarlo al degradar la coherencia.
- La licencia Apache-2.0 no impone restricciones adicionales según el autor, pero el uso comercial de un modelo que genera contenido ofensivo de forma inducida requiere revisión legal y de políticas de contenido.
- El pipeline experimental completo, las preguntas, respuestas y el adaptador de física permanecen privados; la reproducibilidad se limita al núcleo de inferencia y a los ficheros de control publicados.
- La verificación por hash del manifiesto garantiza consistencia de ficheros, no autenticidad del publicador; esta recae en la cuenta de Hugging Face.
- Los resultados de transferencia al modelo de 4B no superaron las puertas de calidad; no se establece un efecto de tamaño de modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RenormalizationTech/qwen2.5-7b-gcad-steering-controls
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Notas de métodos (referenciadas en el repo): METHODS.md
- Resultados de transferencia 4B (referenciados): related_results/qwen3_4b_fixed_transfer_01.public.json
- Cierre de transferencia 4B (referenciado): related_results/qwen3_4b_fixed_transfer_closeout.md
- Atribución de licencia y avisos: LICENSE/NOTICE (incluidos en el repositorio)
