# sarakhosravi/MedGuard-Qwen3Guard-Gen-4B

## Resumen

MedGuard-Qwen3Guard-Gen-4B es un conjunto de adaptadores LoRA publicados por el usuario sarakhosravi sobre el modelo base Qwen/Qwen3Guard-Gen-4B, un modelo guardrail de 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. El adaptador resuelve un problema muy concreto: dado un perfil estructurado de paciente y una prescripción propuesta, el modelo emite un veredicto de seguridad (seguro o inseguro) acompañado de las categorías de riesgo (hasta 17) que lo justifican. Es, por tanto, un componente de guardrail especializado en seguridad de medicación, no un modelo generativo de propósito general.

La relevancia del modelo es doble. Por un lado, aplica técnicas de alineamiento modernas (SFT, un segundo pase de "unrolling" del perfil del paciente y GRPO con recompensa verificable) a una tarea de seguridad clínica con métricas publicadas sobre un test set de 729 filas con separación por fármaco (*drug-disjoint*). Por otro, demuestra que un modelo base pequeño (4B) puede adaptarse con LoRA para tareas de verificación estructurada con alta recall en casos inseguros (hasta 98,9 % en la variante GRPO), lo que lo hace viable en infraestructura modesta.

El repositorio contiene tres ramas de entrenamiento independientes (`sft/`, `cu/` y `grpo/`), cada una en su propia subcarpeta, y se distribuye bajo licencia "other" heredada del modelo base. El tamaño del repositorio es de 0,4 GB, coherente con adaptadores LoRA y no con pesos completos. No hay información sobre idiomas soportados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only Qwen3Guard-Gen-4B |
| Parametros totales | 4B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se aplica sobre el base; el base admite las cuantizaciones habituales de la familia Qwen, pero no se documenta en la model card) |
| Idiomas soportados | No disponible |
| Licencia | other (heredada del modelo base Qwen3Guard-Gen-4B) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen3Guard-Gen-4B es un transformer decoder-only de 4.000 millones de parámetros. Sobre él se entrenan tres brazos de adaptadores LoRA independientes, todos evaluados sobre el split de test de MedGuardBench (729 filas, *drug-disjoint*, es decir, fármacos no vistos en entrenamiento):

- `sft/`: ajuste supervisado alineado con el esquema de salida (veredicto más categorías de riesgo).
- `cu/`: *Patient Profile Unrolling*, un epoch adicional partiendo del checkpoint SFT en el que el modelo primero contrasta cada campo del historial del paciente contra las reglas de seguridad del fármaco y después emite el veredicto. Esta traza de verificación explica que necesite al menos 2.048 tokens nuevos de decodificación.
- `grpo/`: GRPO (*Group Relative Policy Optimization*) con una recompensa de seguridad verificable y rollouts guiados por profesor, partiendo del modelo SFT fusionado (*merged*). Requiere aplicar primero `sft/` y fusionarlo antes de cargar `grpo/`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset MedGuardBench ni detalles sobre el corpus del modelo base. La innovación técnica destacable es el uso combinado de un esquema de verificación explícito (CU) y de RL con recompensa verificable (GRPO) sobre una tarea de clasificación estructurada con 17 categorías de riesgo.

## Capacidades

- Emisión de veredicto binario de seguridad (seguro/inseguro) para una prescripción propuesta condicionada al perfil del paciente.
- Clasificación multi-etiqueta en 17 categorías de riesgo que justifican el veredicto.
- Razonamiento estructurado por pasos en la variante CU: verificación campo a campo del historial del paciente contra las reglas del fármaco antes de concluir.
- Salida con *exact match* sobre el conjunto de categorías (métrica EM reportada).
- Alineamiento mediante RL con recompensa verificable (variante GRPO), orientado a maximizar recall de casos inseguros.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas para este adaptador.

## Casos de uso

- Verificación previa a la prescripción en sistemas de soporte a la decisión clínica: el adaptador recibe el perfil estructurado del paciente y la prescripción propuesta y devuelve veredicto más categorías de riesgo, integrándose como paso de guardrail antes de la firma médica.
- Filtrado de alertas en pipelines de farmacia hospitalaria: con una recall de casos inseguros del 96,3-98,9 % en el test drug-disjoint, puede usarse para priorizar revisiones farmacéuticas sobre las prescripciones marcadas como inseguras.
- Auditoría retrospectiva de recetas: procesar lotes de prescripciones históricas y generar un registro de categorías de riesgo para análisis de calidad asistencial.
- Investigación en guardrails clínicos: servir de baseline reproducible para comparar SFT, verificación por pasos y GRPO en tareas de seguridad de medicación.
- Generación de datos sintéticos de seguridad: usar las trazas de verificación de la variante CU como material para entrenar o evaluar otros sistemas de verificación.
- Evaluación de robustez de modelos guardrail: emplear el split drug-disjoint de MedGuardBench para medir generalización a fármacos no vistos.
- Prototipado de asistentes de prescripción con salvaguardas: el adaptador actúa como capa de control sobre la salida de un LLM generador, bloqueando o marcando propuestas antes de mostrarlas al clínico.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test split de MedGuardBench (729 filas, drug-disjoint). Métricas en porcentaje:

| Rama | Acc | Rec (unsafe) | FPR | Micro-F1 | Macro-F1 | EM |
|---|---:|---:|---:|---:|---:|---:|
| `sft/` (SFT) | 87,0 | 96,3 | 23,1 | 72,1 | 66,5 | 62,6 |
| `cu/` (Patient Profile Unrolling) | 92,2 | 96,3 | 12,3 | 75,5 | 70,0 | 68,7 |
| `grpo/` (Guided GRPO) | 87,8 | 98,9 | 24,3 | 74,4 | 67,4 | 63,8 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,4 GB; el coste real lo determina el modelo base de 4B.
- VRAM estimada para el base en FP16: aproximadamente 8-9 GB de pesos, más overhead de activaciones y caché KV; en cuantización de 4 bits, del orden de 3-4 GB.
- GPU recomendadas: A100/H100 para despliegue de producción o evaluación por lotes; RTX 4090, RTX 3090 o GPUs consumer con 12-16 GB para inferencia en FP16; GPUs con 8 GB o menos requerirían cuantización del base.
- Cabe en GPU consumer: sí, con cuantización o en FP16 en tarjetas de 12 GB o más.
- Opciones de despliegue: transformers + PEFT (único flujo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador, aunque podrían aplicarse tras fusionar los adaptadores en el base.
- Decodificación recomendada: greedy (temperatura 0); para la variante CU, reservar al menos 2.048 tokens nuevos por la traza de verificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-Qwen3Guard-Gen-4B | 4B (base) + LoRA | No disponible | Guardrail de medicación condicionado al paciente | other | Hugging Face (adaptadores PEFT) |
| Qwen3Guard-Gen-4B (base) | 4B | No disponible | Guardrail genérico de contenido | other | Hugging Face |
| Modelos de clasificación clínica especializados | No disponible | No disponible | Verificación de prescripciones | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación sobre guardrails de seguridad de medicación; el modelo no es un dispositivo médico y no debe emplearse para decisiones clínicas.
- Tasa de falsos positivos sobre prescripciones seguras elevada en las variantes SFT (23,1 %) y GRPO (24,3 %); solo la variante CU la reduce al 12,3 %, a costa de mayor longitud de salida.
- La variante GRPO maximiza recall (98,9 %) pero empeora el FPR (24,3 %), lo que puede generar fatiga de alertas en uso real.
- Evaluación limitada a un único test set de 729 filas; la generalización a otras poblaciones, fármacos o sistemas de codificación no está documentada.
- No se documentan idiomas soportados; el modelo base podría no cubrir correctamente castellano en perfiles clínicos estructurados.
- Riesgo de alucinación en las categorías de riesgo y en la traza de verificación de la variante CU, no cuantificado en la model card.
- Licencia "other" heredada del base: es necesario revisar los términos de Qwen3Guard-Gen-4B antes de cualquier uso comercial.
- El adaptador GRPO requiere aplicar y fusionar previamente `sft/`; cargarlo directamente sobre el base produce resultados incorrectos.
- Sesgos conocidos del modelo base no documentados específicamente para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-Qwen3Guard-Gen-4B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base Qwen3Guard-Gen-4B: https://huggingface.co/Qwen/Qwen3Guard-Gen-4B
