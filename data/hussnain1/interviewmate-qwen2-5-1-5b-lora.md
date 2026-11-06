# Hussnain1/interviewmate-qwen2.5-1.5b-lora

## Resumen

InterviewMate Qwen2.5-1.5B LoRA es un conjunto de adaptadores PEFT (LoRA) entrenados sobre Qwen/Qwen2.5-1.5B-Instruct para convertir ese modelo base en un generador de planes de entrevista personalizados a partir de los campos extraidos de un curriculum (habilidades, proyectos, experiencia, rol objetivo y seniority). Lo desarrolla Muhammad Hussnain Jamil (usuario Hussnain1) como motor de preguntas de su plataforma de simulacion de entrevistas InterviewMate. El modelo no es un LLM independiente: requiere cargar el base Qwen2.5-1.5B-Instruct y aplicar encima uno de los adaptadores del repositorio.

El problema que resuelve es concreto y acotado: dada una descripcion estructurada del candidato, produce un array JSON de objetos de pregunta distribuidos en siete etapas canonicas (warm_opening, cv_walkthrough, project_deep_dive, technical_skill_probing, problem_solving_debugging, behavioral_communication y closing). Esto lo hace util como componente de un pipeline mayor donde el JSON se valida y, en caso de fallo, se recurre a un banco de preguntas rankeado y a un generador FLAN-T5 como fallback.

El repositorio contiene cuatro versiones independientes del adaptador (v10.3a recomendada, v11-manual-verified, v12-mobile-verified y v10.2a), cada una entrenada sobre una mezcla distinta de datos de planes de entrevista. El modelo base tiene 1.500 millones de parametros, contexto nativo de 32.768 tokens y licencia Apache 2.0; los adaptadores heredan esa licencia. El repositorio ocupa 0,6 GB e incluye ficheros de tokenizer junto a cada adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA sobre proyecciones de atencion y MLP (q, k, v, o, gate, up, down) |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); los adaptadores LoRA anaden un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct (no confirmado de forma explicita en la model card del adaptador) |
| Tipos de cuantizacion | no disponible en la model card; al ser adaptadores PEFT sobre un base estandar, se pueden aplicar las cuantizaciones soportadas por el base (GGUF, AWQ, GPTQ, etc. via herramientas externas), pero no se documentan en el repo |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) mas ficheros de tokenizer; requiere el base Qwen/Qwen2.5-1.5B-Instruct en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA del transformer decoder-only Qwen2.5-1.5B-Instruct. Los adaptadores se aplican sobre todas las proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down), segun indica la model card. No se especifican el rango (r), el alpha, el dropout ni la tasa de aprendizaje del LoRA. El entrenamiento se realizo sobre mezclas limpias de datos de planes de entrevista, en su mayoria generados y curados por el autor para este problema concreto, y se valido sobre planes retenidos, incluyendo entradas de CV reales, comprobando que el JSON fuera valido y que la estructura de etapas fuera correcta.

No se publica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; la model card indica explicitamente que los datos de entrenamiento no se publican. Las cuatro versiones del repositorio corresponden a distintas mezclas de datos: v10.3a como base equilibrada, v11-manual-verified con datos limpiados manualmente y mayor variedad de preguntas, v12-mobile-verified orientada a roles Flutter/movil (corrige fugas de enrutamiento de movil a backend) y v10.2a como base anterior con pulido gramatical. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido; el valor esta en el ajuste de comportamiento y formato de salida, no en la arquitectura.

## Capacidades

- Generacion de texto en ingles orientada a la creacion de planes de entrevista estructurados.
- Salida en JSON: produce un array de objetos de pregunta con nombres de etapa canonicos, pensado para ser parseado y validado por codigo.
- Personalizacion a partir de campos de CV: habilidades, proyectos, experiencia, rol objetivo y seniority.
- Cobertura de siete etapas de entrevista: warm_opening, cv_walkthrough, project_deep_dive, technical_skill_probing, problem_solving_debugging, behavioral_communication y closing.
- Ajuste por rol y especialidad: la version v12-mobile-verified esta especializada en roles Flutter/movil.
- Integracion en pipeline multimodal del sistema InterviewMate: el plan generado se locuta con avatar 3D y TTS (OpenAI Realtime voice o Piper), las respuestas se transcriben con Silero VAD y Whisper, y se puntuan en relevancia, completitud, claridad y correccion.
- Soporte de tool calling / function calling: no documentado en la model card (el base Qwen2.5-Instruct lo soporta, pero no se verifica en el adaptador).
- Soporte de agentes y razonamiento multi-paso: no documentado; el caso de uso es generacion de un plan en una sola pasada.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Motor de preguntas en una plataforma de simulacion de entrevistas: el adaptador recibe los campos parseados del CV y devuelve el plan JSON que el resto del sistema locuta y evalua. Es su uso previsto y el unico documentado por el autor.
- Generacion de planes para roles de ingenieria de ML: con entradas como "Role: Junior ML Engineer. Skills: Python, PyTorch, FastAPI, RAG. Project: kidney CT classifier with EfficientNetB0", el modelo produce preguntas tecnicas y de proyecto coherentes con ese perfil (ejemplo incluido en la model card).
- Entrevistas para roles moviles (Flutter): usando el adaptador v12-mobile-verified se obtienen preguntas especificas de movil sin derivar indebidamente hacia backend.
- Evaluacion interna de candidatos en procesos de seleccion tecnica: como generador de borradores de preguntas para que un reclutador o hiring manager los revise antes de usarlos (con la advertencia de que no es una herramienta de decision de contratacion).
- Prototipado rapido de pipelines de evaluacion estructurada: sirve como ejemplo de ajuste LoRA para forzar salida JSON valida con etapas canonicas, reutilizable como plantilla para otros dominios con esquema fijo.
- Investigacion sobre ajuste de comportamiento en modelos pequenos: permite estudiar como un LoRA sobre un modelo de 1,5B impone formato y estructura de salida sin necesidad de un LLM mayor, con coste de inferencia bajo.
- Generacion de material de practica para candidatos: el propio modelo puede usarse para que un candidato genere y ensaye preguntas sobre su propio CV antes de una entrevista real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona validacion sobre planes retenidos (incluyendo CV reales) comprobando validez del JSON y correccion de la estructura de etapas, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia del base en FP16: en torno a 3 GB solo para pesos (1.500 millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-2 GB de pesos; en 4 bits, en torno a 1 GB de pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4090) es suficiente para el base en FP16 con contextos cortos; para mayor throughput o contextos largos, A100 o H100.
- Cabe en GPU consumer: si, el modelo base de 1,5B es apto para GPUs de gama media y baja; los adaptadores LoRA anaden muy poco peso adicional.
- Opciones de despliegue: transformers + peft (procedimiento documentado en la model card); el base Qwen2.5-1.5B-Instruct es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la carga de adaptadores LoRA en esos motores requiere conversion o soporte especifico no documentado en el repo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InterviewMate Qwen2.5-1.5B LoRA (este) | 1,5B base + LoRA | 32.768 tokens (base) | Generacion de planes de entrevista en JSON | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens | Instrucciones generales, multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B (base preentrenado) | 1,5B | 32.768 tokens | Modelo base sin ajuste a instrucciones | Apache 2.0 | Hugging Face |
| FLAN-T5 (generador de fallback del sistema) | no disponible en la informacion | no disponible | Generacion texto-a-texto | Apache 2.0 (variantes) | Hugging Face |

La comparacion con alternativas especializadas en generacion de preguntas de entrevista no esta disponible: no se han identificado en la informacion proporcionada otros adaptadores publicos con el mismo objetivo y tamano.

## Limitaciones y advertencias

- El modelo puede reutilizar en exceso marcos de pregunta aprendidos (por ejemplo, "validate whether ... handled well"), lo que reduce la variedad si no se controla la temperatura o el muestreo.
- La version v12 anade ocasionalmente preocupaciones de movil a roles que no son de movil, segun reconoce el autor.
- Solo funciona en ingles; la calidad depende de lo bien que se haya parseado el CV de entrada.
- Las preguntas generadas son material de practica, no una herramienta de decision de contratacion; no deben usarse para filtrar candidatos de forma automatizada.
- Los datos de entrenamiento no se publican (mayoritariamente autogenerados y curados, mas algunas entradas de CV reales para evaluacion), lo que limita la auditabilidad y la reproducibilidad.
- El adaptador no es autonomo: requiere cargar el base Qwen2.5-1.5B-Instruct y aplicar PEFT; no se distribuye como modelo listo para usar en motores de inferencia sin pasos adicionales.
- Riesgo de alucinacion: no se documenta de forma especifica, pero al ser un modelo de 1,5B puede generar preguntas factualmente incorrectas o inconsistentes con el CV si el parseo es ruidoso.
- Sesgos conocidos: no documentados; al entrenarse sobre datos autogenerados por el autor, puede heredar sesgos de ese proceso de curacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct, tambien Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Hussnain1/interviewmate-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio InterviewMate: https://github.com/Hussnainoffical/InterviewMate
- GitHub del autor: https://github.com/Hussnainoffical
- LinkedIn del autor: https://www.linkedin.com/in/hussnain-jamil
- Portfolio del autor: https://muhammad-hussnain-jamil-portfolio.vercel.app
