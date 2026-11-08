# Aduhere/trialmatch-qwen2.5-1.5b-qlora

## Resumen

TrialMatch es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario Aduhere. Su función es muy específica: etiquetar una nota clínica de un paciente frente a un único criterio de elegibilidad de un ensayo clínico, devolviendo un JSON con la etiqueta asignada y los identificadores de las frases de la nota que justifican esa decisión. No es un modelo de propósito general, sino un componente de un pipeline de emparejamiento paciente-ensayo (trial matching).

El adaptador se entrenó sobre las anotaciones expertas del dataset TrialGPT Criterion Annotations, con una partición agrupada por paciente de 37/8/8 y semilla 42. El entrenamiento se realizó con QLoRA (base en NF4 de 4 bits, cómputo en bf16), LoRA con r=16, alpha=32, dropout=0,05 sobre las proyecciones q, k, v, o, gate, up y down, learning rate 2e-4, acumulación de gradiente 8 y ponderación de etiquetas por inverso de la raíz cuadrada. Se seleccionó el checkpoint de la época 4 de 5 por macro-F1 de validación. Todo el entrenamiento se ejecutó en una única RTX 3050 de 6 GB.

Su relevancia es acotada pero clara: demuestra que un modelo de 1.500 millones de parámetros, con un adaptador de bajo rango, puede superar ampliamente al modelo base sin ajustar en una tarea clínica estructurada (exactitud 0,7379 frente a 0,068 del base). El propio autor restringe el uso a investigación y trabajos académicos, y advierte explícitamente de que no debe emplearse para decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA/QLoRA |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA añade un conjunto reducido de parámetros entrenables (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Base entrenada en NF4 4-bit; inferencia validada en fp16; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero el adaptador se entreno sobre notas clinicas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El ajuste se hizo con QLoRA: el modelo base se cuantiza a NF4 de 4 bits y el cómputo se realiza en bf16, mientras que los adaptadores LoRA (r=16, alpha=32, dropout=0,05) se insertan en las proyecciones de atención (q, k, v, o) y en las de la MLP (gate, up, down). El entrenamiento usó learning rate 2e-4, acumulación de gradiente 8 y una ponderación de etiquetas por inverso de la raíz cuadrada para compensar el desbalanceo de clases. El checkpoint final se eligió en la época 4 de 5 según macro-F1 de validación, sin usar el conjunto de test para la selección.

Los datos provienen de las anotaciones expertas del dataset TrialGPT Criterion Annotations (revisión `1cfcafde94a1`), con una partición agrupada por paciente de 37/8/8 y semilla 42, lo que evita filtración de información entre pacientes. El adaptador espera un formato de prompt exacto, construido por `src/data/prompt.py` del repositorio del autor; no se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de criterios de elegibilidad clínica: dada una nota de paciente y un criterio de ensayo, devuelve una etiqueta en JSON.
- Extracción de evidencia: devuelve `evidence_ids` con los números de frase de la nota que sustentan la etiqueta.
- Salida estructurada JSON con formato fijo (`{"label": ..., "evidence_ids": [...]}`).
- Razonamiento acotado a una única nota y un único criterio por invocación (no multi-criterio en una sola pasada).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles; el adaptador se entrenó sobre notas clínicas en inglés.
- No se documentan capacidades de generación libre, código o matemáticas más allá de las heredadas del modelo base.

## Casos de uso

- Precribado de elegibilidad en investigación clínica: el adaptador evalúa cada par (nota de paciente, criterio) y devuelve etiqueta y frases de soporte, lo que permite a un equipo de estudio priorizar qué pacientes revisar manualmente.
- Auditoría de decisiones de emparejamiento: al devolver `evidence_ids`, un revisor humano puede verificar qué frases de la nota justifican la etiqueta, lo que facilita la trazabilidad en entornos de investigación.
- Generación de datasets etiquetados a escala: sirve para preanotar grandes volúmenes de notas frente a criterios y reducir el coste de la anotación experta, con revisión humana posterior.
- Prototipado académico de pipelines trial matching: al ser un adaptador ligero sobre un modelo de 1,5B, permite experimentar en una sola GPU consumer (RTX 3050 de 6 GB) sin infraestructura dedicada.
- Evaluación comparativa de métodos de ajuste: útil como referencia para estudiar el impacto de QLoRA frente al modelo base en tareas clínicas estructuradas (0,7379 frente a 0,068 de exactitud).
- Docencia y trabajos de fin de máster: el repositorio incluye código, formato de prompt y evaluación, lo que lo hace adecuado como caso práctico de ajuste eficiente con PEFT.
- Integración como componente en un sistema mayor: puede actuar como clasificador de criterios dentro de un pipeline que agregue múltiples criterios por ensayo, siempre que se invoque una vez por criterio.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (206 criterios, base en fp16 más adaptador, decodificación greedy):

| Metrica | TrialMatch (base + adaptador) | Qwen2.5-1.5B-Instruct sin ajustar |
|---|---|---|
| Exactitud (accuracy) | 0,7379 | 0,068 |
| Macro-F1 | 0,5272 | 0,081 |
| Micro-F1 de evidencia | 0,5075 | no disponible |
| Errores de parseo | 0 | no disponible |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible, ni comparaciones con otros adaptadores de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 3 GB de pesos; con el adaptador LoRA el consumo total ronda los 3-4 GB, más la memoria para el contexto y el estado de inferencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor entrenó en una RTX 3050 de 6 GB, por lo que la inferencia cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 6 GB o más (RTX 3050, 3060, 4060, 4070, 4090, etc.).
- Opciones de despliegue: PEFT + transformers (flujo documentado por el autor); llama.cpp, Ollama, vLLM o TGI requerirían fusionar el adaptador con el modelo base o convertirlo a GGUF, lo que no está documentado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrialMatch (este adaptador) | 1,5B + LoRA r=16 | no disponible | Clasificación de criterios clínicos con evidencia | apache-2.0 | Hugging Face (Aduhere/trialmatch-qwen2.5-1.5b-qlora) |
| hyzenOG/trialmatch-qwen2.5-1.5b-lora | 1,5B + LoRA | no disponible | Aparentemente la misma tarea (trial matching) | no disponible | Hugging Face (hyzenOG/trialmatch-qwen2.5-1.5b-lora) |
| Qwen/Qwen2.5-1.5B-Instruct (base sin ajustar) | 1,5B | no disponible | Generación de texto general | apache-2.0 | Hugging Face (Qwen/Qwen2.5-1.5B-Instruct) |

No se dispone de datos de rendimiento del adaptador de hyzenOG ni de otros adaptadores comparables en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo base sin ajustar.

## Limitaciones y advertencias

- Restricción de uso explícita del autor: solo para investigación y trabajos académicos; no apto para decisiones clínicas.
- Riesgo de alucinación: aunque el modelo devuelve `evidence_ids`, no hay garantía de que las frases citadas justifiquen realmente la etiqueta; requiere revisión humana.
- Macro-F1 de 0,5272 y micro-F1 de evidencia de 0,5075 indican un rendimiento moderado, con margen amplio de mejora, especialmente en clases minoritarias.
- El adaptador espera un formato de prompt exacto (`src/data/prompt.py`); usarlo con otro formato degrada la salida.
- Entrenado sobre un dataset pequeño (37/8/8 grupos de pacientes), lo que limita la generalización a otras poblaciones, instituciones o estilos de nota clínica.
- Idiomas: no se documenta soporte multilingüe; probablemente esté limitado al inglés de las notas de entrenamiento.
- Licencia apache-2.0 permite uso comercial, pero la advertencia del autor y la naturaleza clínica de la tarea desaconsejan cualquier despliegue en producción sanitaria sin validación adicional.
- No hay datos publicados sobre sesgos demográficos ni sobre comportamiento en subgrupos de pacientes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación externa.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Aduhere/trialmatch-qwen2.5-1.5b-qlora
- Repositorio de código, prompt y evaluación: https://github.com/Rafique610/trialmatch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Adaptador aparentemente relacionado: https://huggingface.co/hyzenOG/trialmatch-qwen2.5-1.5b-lora
- Modelo base alternativo (Qwen2.5-1.5B): https://huggingface.co/Qwen/Qwen2.5-1.5B
