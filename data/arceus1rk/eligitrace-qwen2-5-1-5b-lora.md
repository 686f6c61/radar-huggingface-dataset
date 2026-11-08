# arceus1rk/eligitrace-qwen2.5-1.5b-lora

## Resumen

EligiTrace es un adaptador LoRA sobre el modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario arceus1rk, orientado a la evaluacion de criterios de elegibilidad en ensayos clinicos con trazabilidad a nivel de frase. Dado un historial clinico numerado por frases, un tipo de criterio (inclusion o exclusion) y el texto del criterio, el modelo devuelve una etiqueta de decision y los identificadores de las frases que sustentan esa decision. El problema que aborda es el cribado de elegibilidad, una tarea intensiva en tiempo en la que la evidencia citada es tan importante como la etiqueta final.

El adaptador se entrena exclusivamente sobre el split TRAIN (37 pacientes, 603 anotaciones) del dataset ncbi/TrialGPT-Criterion-Annotations, con particion agrupada por paciente y sin usar las columnas generadas por GPT-4. El modelo base Qwen2.5-1.5B-Instruct aporta la capacidad de seguir instrucciones y el formato JSON estructurado; el adaptador especializa la salida hacia el esquema `{"label": ..., "evidence": [sentence ids]}` con etiquetas especificas por tipo de criterio.

Es relevante ahora porque demuestra un patron de bajo coste (un adaptador de 0,1 GB sobre un modelo de 1,5B) para tareas de dominio sanitario con requisito de evidencia verificable. No obstante, el propio autor lo etiqueta como prototipo de investigacion educativa y no como herramienta de decision de enrolamiento clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1,5B en el modelo base; el adaptador LoRA no especifica recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16 base + fp32 adapters) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), libreria peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parametros. La configuracion del adaptador es r=16, alpha=32 y dropout 0,05, aplicado sobre las proyecciones q, k, v, o, gate, up y down. El entrenamiento usa el modelo base en bf16 con los adaptadores en fp32, optimizador AdamW con learning rate 2e-4 y scheduler coseno, 3 epocas y batch efectivo de 16.

Los datos de entrenamiento proceden exclusivamente del split TRAIN de ncbi/TrialGPT-Criterion-Annotations: 37 pacientes y 603 anotaciones, con particion agrupada por paciente generada con `numpy.random.default_rng(42)`. Las columnas generadas por GPT-4 del dataset nunca se utilizaron. La epoca seleccionada fue la 3, por mejor macro-F1 en validacion. El adaptador tiene un SHA-256 documentado: `eb1843b2a2921a70508a03bbd18a551e75709b47babe33fca4a74d36a87144ad`. No se documentan innovaciones como decodificacion especulativa ni atencion lineal; la innovacion principal es el formato de salida con evidencia a nivel de frase.

## Capacidades

- Clasificacion de criterios de elegibilidad clinica con etiquetas especificas por tipo: included, not included, excluded, not excluded, not enough information y not applicable.
- Extraccion de evidencia a nivel de frase: devuelve los identificadores de las frases del historial clinico numerado que sustentan la decision.
- Salida estructurada en JSON con el esquema `{"label": ..., "evidence": [sentence ids]}`.
- Procesamiento de historiales clinicos numerados por frases junto con el texto del criterio y su tipo (inclusion o exclusion).
- Capacidad de seguir instrucciones heredada del modelo base Qwen2.5-1.5B-Instruct.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Cribado asistido de elegibilidad en ensayos clinicos: el modelo clasifica cada criterio de inclusion o exclusion frente a un historial de paciente y devuelve la etiqueta junto con las frases de evidencia, lo que permite a un revisor humano verificar rapidamente la decision en lugar de releer el historial completo.
- Auditoria de decisiones de cribado: al conservar los identificadores de frase que sustentan cada etiqueta, la salida sirve como registro trazable para revisiones de calidad o comites de monitorizacion.
- Investigacion en NLP clinico: el adaptador y su evaluacion publicada (accuracy 0,738, macro-F1 0,543 en validacion) sirven como linea base reproducible para experimentos de elegibilidad con modelos pequenos.
- Prototipado de pipelines de precribado: al ser un adaptador de 0,1 GB sobre un modelo de 1,5B, puede desplegarse en entornos con recursos limitados para filtrar candidatos antes de una revision experta.
- Generacion de datasets anotados asistida: las etiquetas y evidencias propuestas pueden usarse como sugerencias para anotadores humanos en la construccion de corpus de elegibilidad.
- Docencia y demostraciones: su tamano reducido y su licencia apache-2.0 permiten usarlo en cursos o talleres sobre aplicaciones de LLM en salud sin infraestructura especializada.
- Extraccion de evidencia para sistemas de soporte a la decision: la salida con frases concretas puede integrarse en interfaces que resalten los fragmentos relevantes del historial para el clinico.

## Benchmarks y rendimiento

| Metrica (validacion, 8 pacientes, decodificacion greedy) | Valor |
|---|---|
| Accuracy | 0,738 |
| Macro-F1 | 0,543 |
| Evidence micro-F1 | 0,532 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 1,5B parametros y el adaptador ocupa 0,1 GB, por lo que en bf16 el conjunto cabe holgadamente en GPUs de consumo, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,5B del modelo base, aunque no se confirma con datos del autor.
- Opciones de despliegue: la libreria indicada es peft; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EligiTrace (este adaptador) | 1,5B (base) + LoRA | no disponible | accuracy 0,738, macro-F1 0,543 en validacion propia | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en la informacion | no evaluado en esta tarea | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en elegibilidad clinica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otros adaptadores o modelos de la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- El autor lo declara explicitamente como prototipo de investigacion educativa y no como herramienta de decision de enrolamiento clinico.
- Entrenado con solo 37 pacientes y 603 anotaciones, lo que limita la generalizacion a otras poblaciones, instituciones o formatos de historial.
- El macro-F1 de validacion (0,543) y el evidence micro-F1 (0,532) indican un rendimiento moderado, insuficiente para uso autonomo en produccion clinica.
- Requiere usar exactamente el prompt de `modeling/prompts.py` del repositorio; desviarse del formato puede degradar la salida.
- Riesgo de alucinacion en las etiquetas y en los identificadores de frase de evidencia, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; el dataset de entrenamiento es en ingles, lo que probablemente limita el uso en castellano, aunque no se confirma.
- Licencia apache-2.0, que permite uso comercial del adaptador, pero el modelo base Qwen2.5 tiene sus propias condiciones que deben verificarse por separado.
- No debe usarse como sustituto del juicio clinico ni para decisiones de inclusion o exclusion de pacientes sin revision humana.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/arceus1rk/eligitrace-qwen2.5-1.5b-lora
- Repositorio de codigo, prompts y evaluacion: https://github.com/ruhank-dev/eligitrace
- Dataset de entrenamiento: ncbi/TrialGPT-Criterion-Annotations (en Hugging Face)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base (variante base): https://huggingface.co/Qwen/Qwen2.5-1.5B
