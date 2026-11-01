# aleenababar04/qwen2.5-0.5b-trialgpt-criteria-lora

## Resumen

`aleenababar04/qwen2.5-0.5b-trialgpt-criteria-lora` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, desarrollado por el usuario aleenababar04 como prototipo de investigación educativa. Su tarea es la evaluación de criterios de elegibilidad en ensayos clínicos: dado un historial clínico numerado por frases, un tipo de criterio y el texto del criterio, el modelo devuelve un objeto JSON con los identificadores de las frases que sirven como evidencia y una etiqueta de cumplimiento. El modelo se entrena sobre el subconjunto de 37 pacientes de entrenamiento del dataset `ncbi/TrialGPT-Criterion-Annotations`, con un split agrupado por paciente de 37/8/8 y semilla 42.

El adaptador es relevante por dos motivos. En primer lugar, demuestra que un modelo de 0,5 mil millones de parámetros puede abordar una tarea de extracción estructurada con evidencia en un dominio tan especializado como la elegibilidad de ensayos clínicos, con métricas modestas pero medibles (accuracy 0,699; macro-F1 0,4525; evidence micro-F1 0,4293 sobre 206 criterios de 8 pacientes). En segundo lugar, sirve como ejemplo de flujo de trabajo LoRA reproducible: configuración de entrenamiento documentada, código de evaluación público y formato de prompt explícito.

Conviene subrayar que el propio autor lo etiqueta como prototipo de investigación educativa y advierte explícitamente de que no debe usarse para decisiones de inscripción clínica. El repositorio no publica información sobre idiomas soportados, pipeline ni detalles del dataset más allá del enlace al conjunto de NCBI. El tamaño del repositorio es de 0,0 GB, coherente con un adaptador LoRA de rango 16 sobre un modelo de 0,5B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | no disponible (modelo base de 0,5B; el adaptador LoRA no publica su recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; no especificada en la model card) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rank / alpha / dropout LoRA | 16 / 32 / 0,05 |
| Módulos objetivo | "all" |
| Dataset de entrenamiento | ncbi/TrialGPT-Criterion-Annotations (37 pacientes de entrenamiento) |
| Fecha de creación | 2026-10-25 |
| Descargas / likes | 32 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5. El entrenamiento se realizó con PEFT usando LoRA de rango 16, alpha 32 y dropout 0,05, con módulos objetivo "all", learning rate 2e-4, 3 épocas, batch size 4 y acumulación de gradiente 4 (batch efectivo de 16). La mejor época según el log de entrenamiento fue la 2. El dataset es `ncbi/TrialGPT-Criterion-Annotations`, con un split agrupado por paciente de 37/8/8 y semilla 42, lo que evita fuga de información entre pacientes de train y test.

La tarea formulada es de extracción estructurada: la entrada combina una nota clínica numerada por frases, un tipo de criterio y el texto del criterio, y la salida esperada es un JSON con la lista de identificadores de frases de evidencia y la etiqueta de cumplimiento. No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Evaluación de criterios de elegibilidad de ensayos clínicos: clasifica criterios y devuelve evidencia en forma de identificadores de frases de la nota clínica.
- Salida estructurada en JSON con los campos `evidence` (lista de ids de frase) y `label` (etiqueta de cumplimiento).
- Extracción de evidencia textual: localiza las frases concretas que sustentan la decisión, no solo la etiqueta.
- Razonamiento sobre notas clínicas numeradas por frases, con referencia explícita a los índices.
- Herencia de las capacidades generales del modelo base Qwen2.5-0.5B-Instruct (generación de texto e instrucciones), aunque el adaptador está especializado en la tarea de criterios.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Investigación académica en NLP clínico: reproducir el experimento de evaluación de criterios de elegibilidad con un adaptador LoRA ligero, usando el split por paciente y el código público del autor para comparar configuraciones.
- Prototipado de pipelines de preevaluación de elegibilidad: integrar el adaptador como primer filtro que propone etiqueta y frases de evidencia para que un revisor humano las valide, nunca como decisión final.
- Anotación asistida de datasets clínicos: usar la salida `evidence` para sugerir frases candidatas a un anotador humano, reduciendo el tiempo de revisión manual en criterios de texto libre.
- Docencia y formación en IA aplicada a salud: ejemplo didáctico de fine-tuning con PEFT sobre un modelo pequeño, con configuración de entrenamiento y métricas documentadas.
- Evaluación de técnicas de PEFT: servir de referencia para estudiar el efecto del rango LoRA, alpha y dropout en una tarea de extracción estructurada de dominio especializado.
- Pruebas de robustez y calibración: analizar el comportamiento del modelo en criterios con macro-F1 bajo (0,4525) para identificar tipos de criterio problemáticos y guiar futuras mejoras.
- Despliegue en entornos con recursos limitados: al tratarse de un adaptador sobre un modelo de 0,5B, puede ejecutarse en hardware modesto para experimentación, siempre fuera de producción clínica.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre el conjunto de test retenido (206 criterios, 8 pacientes):

| Métrica | Valor |
|---|---|
| Accuracy | 0,699 |
| Macro-F1 | 0,4525 |
| Evidence micro-F1 | 0,4293 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (repositorio de 0,0 GB); el coste real lo determina el modelo base Qwen2.5-0.5B-Instruct.
- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 0,5B en fp16 se sitúa en torno a 1-2 GB, y en cuantización de 4 bits por debajo de 1 GB, aunque estos valores no están confirmados en la model card.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores; también en A100/H100 para lotes grandes.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,5B), aunque no hay confirmación oficial en la documentación.
- Opciones de despliegue: la model card muestra carga con `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan opciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, el adaptador se apoya en Qwen2.5-0.5B-Instruct, pero no se han publicado comparaciones con otros adaptadores o modelos especializados en elegibilidad de ensayos clínicos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen2.5-0.5b-trialgpt-criteria-lora (este) | 0,5B (base) + LoRA | no disponible | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Prototipo de investigación educativa: el autor advierte explícitamente de que no debe usarse para decisiones de inscripción clínica.
- Rendimiento limitado: macro-F1 de 0,4525 y evidence micro-F1 de 0,4293 indican un rendimiento moderado, insuficiente para uso clínico real.
- Entrenado sobre solo 37 pacientes: el dataset es muy pequeño, lo que limita la generalización a otras poblaciones, instituciones o formatos de nota clínica.
- Riesgo de alucinación: al ser un modelo generativo pequeño, puede producir identificadores de frase inexistentes o etiquetas inconsistentes con la evidencia.
- Sesgos: no documentados en la información disponible, pero probables dado el origen y tamaño reducido del dataset.
- Idiomas: no especificados; el modelo base Qwen2.5 es multilingüe, pero el adaptador se ha entrenado presumiblemente en inglés (dataset de NCBI), sin confirmación.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el uso clínico queda desaconsejado por el propio autor y requeriría validación regulatoria adicional.
- Sin datos de pipeline, contexto o cuantización: dificulta la planificación de despliegue en producción.
- Sin métricas de calibración ni análisis de errores publicados más allá de las tres métricas agregadas.

## Enlaces

- HuggingFace: https://huggingface.co/aleenababar04/qwen2.5-0.5b-trialgpt-criteria-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Código, formato de prompt y evaluación: https://github.com/aleenababar04/genai-assignment-2
