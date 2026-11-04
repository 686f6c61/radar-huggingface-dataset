# segestic/phi3.5-mini-4k-qlora-medical-seg-vall_med

## Resumen

MediLITE-QA es un adaptador LoRA de ajuste fino sobre Microsoft Phi-3.5-mini-instruct (3.800 millones de parámetros) especializado en respuesta a preguntas médicas de opción múltiple. Lo desarrollan Olusegun Oladele Odewole y Seren Başaran, y se publica como artefacto de investigación asociado al artículo en la revista *Sustainability* (2026). El objetivo declarado es demostrar que un modelo de dominio específico, cuantizado y ajustado con QLoRA, puede ejecutarse en la CPU de un portátil de consumo manteniendo una precisión competitiva en bancos de preguntas médicas.

El adaptador se entrenó sobre 393.000 registros (aproximadamente 104,5 millones de tokens) procedentes de PubMedQA, MedMCQA y MedQA-USMLE-4-options, con un rango LoRA de 32 y alpha de 256. La tarea concreta es responder con una única letra (A, B, C o D) a preguntas de examen médico, lo que lo aleja de un uso conversacional generalista.

Su relevancia actual es doble: por un lado, sirve como referencia metodológica de ajuste eficiente en energía (el entrenamiento consumió unos 139 kWh en una única Quadro RTX 4000 durante 1.136,6 horas); por otro, ejemplifica los riesgos de publicar adaptadores médicos sin validación clínica, algo que los propios autores advierten explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5-mini-instruct) con adaptador LoRA |
| Parametros totales | 3.800 millones (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (indicado en el nombre del repositorio); el modelo base soporta 128.000 |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante entrenamiento; GGUF disponible en repositorio separado; fp16 en evaluación |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Phi-3.5-mini-instruct, un transformer decoder-only de 3.800 millones de parámetros. El ajuste se realizó con QLoRA: el modelo base se cuantizó a 4 bits NF4 y se entrenaron adaptadores de bajo rango sobre las proyecciones q, k, v, o, gate, up y down, con r = 32, alpha = 256 y dropout de 0,10. Se usó precisión mixta fp16, tasa de aprendizaje 2e-4 con schedule lineal, tamaño de lote efectivo de 32 (4 por dispositivo × 8 pasos de acumulación), 3 épocas y longitud de secuencia de 512 tokens. El hardware fue una única NVIDIA Quadro RTX 4000.

El corpus de entrenamiento combina los splits de entrenamiento de tres conjuntos médicos: PubMedQA (subconjunto PQA-A, 86,06 % de los tokens), MedMCQA (11,46 %) y MedQA-USMLE-4-options (2,49 %). No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa. La innovación principal no es arquitectónica sino de eficiencia: demostrar que el ajuste y la inferencia caben en hardware de gama media y en CPU de portátil.

## Capacidades

- Generación de texto orientada a respuesta de preguntas médicas de opción múltiple, devolviendo una única letra como salida.
- Razonamiento sobre contenido biomédico extraído de resúmenes científicos (PubMedQA) y preguntas de examen (MedMCQA, MedQA-USMLE).
- Formato conversacional compatible con `apply_chat_template` de Phi-3.5.
- Inferencia en CPU mediante las cuantizaciones GGUF publicadas en repositorio separado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no documentados ni garantizados para este adaptador.

## Casos de uso

- Investigación en eficiencia energética de IA: replicar el experimento del artículo para medir consumo y latencia de un modelo de dominio específico en CPU de portátil, usando el adaptador y los logs publicados en GitHub.
- Evaluación comparativa de ajuste QLoRA: servir de línea base reproducible para estudiar el efecto de rango, alpha y composición del dataset en tareas de opción múltiple médica.
- Docencia y formación en evaluación de LLM: emplear el adaptador como ejemplo práctico de cómo `lm-evaluation-harness` mide precisión zero-shot en nueve bancos médicos y cómo se interpretan los intervalos de confianza bootstrap.
- Prototipado de sistemas de pregunta-respuesta médica en entornos sin GPU: desplegar la versión GGUF en un portátil para experimentar con pipelines de QA sobre literatura, siempre fuera de entornos clínicos reales.
- Auditoría de riesgos en IA sanitaria: utilizar las advertencias de los autores (revisión clínica ciega con cinco profesionales, respuestas potencialmente dañinas) como material para diseñar protocolos de evaluación de seguridad.
- Generación de datos sintéticos de opción múltiple para investigación: usar el modelo para etiquetar ítems de examen y comparar con anotaciones humanas, midiendo el acuerdo entre ambas fuentes.

## Benchmarks y rendimiento

Precisión zero-shot (%) promediada sobre nueve bancos médicos (7.045 ítems), evaluada con `lm-evaluation-harness` en fp16; entre corchetes, intervalo de confianza bootstrap del 95 %.

| Modelo | Precisión media |
|---|---|
| MediLITE-QA (adaptador, fp16) | 72,79 [70,95; 74,66] |
| Phi-3.5-mini-instruct (base) | 68,73 [66,75; 70,62] |

Los resultados por banco individual no se incluyen en la información disponible; el autor remite al artículo para el desglose completo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 8 GB para el modelo fusionado de 3.800 millones de parámetros, más overhead del adaptador (despreciable, el repositorio ocupa 0,1 GB).
- VRAM estimada en 4 bits: aproximadamente 2,5-3 GB, lo que permite ejecución en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 8 GB para fp16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100); para 4 bits basta una GTX 1650 o superior.
- CPU: el artículo demuestra viabilidad en CPU de portátil de consumo mediante GGUF; el modelo base de 3.800 millones en Q4 ocupa del orden de 2-3 GB de RAM.
- Opciones de despliegue: transformers + PEFT (adaptador), llama.cpp u Ollama con los GGUF del repositorio `segestic/MediLITE-QA-GGUF`, y vLLM/TGI tras fusionar el adaptador con el modelo base.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible; el artículo reporta métricas energéticas (139 kWh de entrenamiento) pero no tasas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión médica (9 bancos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediLITE-QA (este) | 3,8 B + LoRA r=32 | 4.096 | 72,79 % | MIT | Adaptador, modelo fusionado y GGUF |
| Phi-3.5-mini-instruct (base) | 3,8 B | 128.000 | 68,73 % | MIT | HuggingFace oficial de Microsoft |
| Modelos médicos de 7-8 B (p. ej. Meditron, BioMistral) | 7-8 B | variable | no disponible en esta ficha | variable | HuggingFace |

La comparación con alternativas médicas de mayor tamaño no puede cuantificarse con los datos proporcionados; el artículo solo reporta el par base/adaptador.

## Limitaciones y advertencias

- No validado clínicamente: una revisión ciega exploratoria con cinco clínicos situó la corrección clínica por debajo de un modelo de referencia frontier, y algunas respuestas se marcaron como potencialmente dañinas.
- Uso exclusivamente de investigación: no es un dispositivo médico y no debe emplearse para informar decisiones de atención al paciente.
- Formato de salida rígido: entrenado para responder con una sola letra; sigue con menos fiabilidad instrucciones libres o peticiones de explicación.
- Sesgo de datos: las fuentes son preguntas de examen y resúmenes en inglés, con posible infrarrepresentación de regiones y poblaciones distintas de la estadounidense/europea.
- Cobertura lingüística limitada al inglés; no se documenta rendimiento en castellano.
- Contexto efectivo de 4.096 tokens, muy inferior a los 128.000 del modelo base, lo que restringe tareas de contexto largo.
- Licencia MIT permisiva, pero la advertencia de los autores sobre uso clínico prevalece como restricción ética y de responsabilidad.
- Riesgo de alucinación inherente al modelo base, agravado por el dominio médico y la falta de validación externa.

## Enlaces

- Adaptador LoRA: https://huggingface.co/segestic/phi3.5-mini-4k-qlora-medical-seg-vall_med
- Modelo fusionado: https://huggingface.co/segestic/MediliteQA-phi3.5-mini-all-med
- Cuantizaciones GGUF: https://huggingface.co/segestic/MediLITE-QA-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Código y logs de evaluación: https://github.com/segestic/Medilite-QA
- Artículo: https://doi.org/10.3390/su182111245
- Dataset PubMedQA: https://huggingface.co/datasets/bigbio/pubmed_qa
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
