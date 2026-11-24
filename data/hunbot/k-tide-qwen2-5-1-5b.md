# HunBot/K-TIDE-Qwen2.5-1.5B

## Resumen

K-TIDE (Korean Terminology-aware Instruction Tuning with Domain Enrichment) es un modelo de lenguaje de aproximadamente 1.500 millones de parametros desarrollado por HunBot como proyecto de investigacion en curso. Se construye mediante fine-tuning supervisado sobre Qwen/Qwen2.5-1.5B-Instruct y su objetivo es mejorar la respuesta a preguntas de dominio especifico en coreano dentro del campo del procesamiento del lenguaje natural, preservando la terminologia tecnica en ingles. No introduce una arquitectura nueva: investiga como afectan al rendimiento la calidad del conocimiento, la construccion del dataset, la transferencia cross-lingual y distintas estrategias de fine-tuning en entornos de recursos computacionales limitados.

El modelo esta etiquetado como "Research in Progress" y su model card declara explicitamente que no se hacen afirmaciones de mejora de rendimiento en esta etapa. El roadmap de investigacion incluye evaluacion de conocimiento base, construccion de corpus y datasets, generacion de datasets terminology-aware, fine-tuning supervisado, experimentos comparativos, estudio de ablacion, publicacion final del modelo y un articulo academico en formato ACL. Los resultados experimentales estan pendientes.

Por su tamano y su enfoque en coreano con terminologia inglesa, K-TIDE resulta relevante para quienes investigan tecnicas data-centric aplicadas a modelos pequenos, especialmente en escenarios de dominio academico y con restricciones de computo. La licencia Apache 2.0 y su compatibilidad con transformers facilitan su experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | Aproximadamente 1,5B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No planificada segun la model card; no se documentan formatos cuantizados |
| Idiomas soportados | Coreano (ko) y ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio compatible con transformers; no se detalla safetensors/GGUF) |

## Arquitectura y entrenamiento

K-TIDE no propone una arquitectura nueva: reutiliza la arquitectura Qwen2 del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de aproximadamente 1,5B de parametros. El entrenamiento consiste en fine-tuning supervisado (SFT) orientado a preguntas y respuestas de dominio especifico en coreano, con preservacion de terminologia tecnica en ingles. La model card menciona el uso de LoRA y full fine-tuning como metodos previstos, sin especificar cual se ha aplicado en la version publicada.

El pipeline de investigacion descrito comprende ocho fases: evaluacion del conocimiento base, extraccion de conocimiento guiada por curriculum, enriquecimiento con conocimiento externo, alineacion de terminologia tecnica, generacion sintetica de pares pregunta-respuesta, verificacion de calidad del dataset, fine-tuning supervisado y evaluacion comparativa con analisis de errores. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal; el enfasis esta en la construccion de datos y la transferencia cross-lingual, no en cambios arquitectonicos.

## Capacidades

- Generacion de texto y respuesta a preguntas de dominio especifico en coreano, con terminologia tecnica en ingles preservada.
- Respuestas concisas disenadas para una o dos frases y un maximo de 30 palabras separadas por espacios.
- Formato de respuesta restringido: solo la respuesta final, sin razonamiento intermedio visible.
- Soporte de terminologia tecnica consistente y expansion de acronimos (por ejemplo, SFT como Supervised Fine-Tuning).
- Capacidades multilingues limitadas a coreano e ingles.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct en la medida en que el fine-tuning las conserve; la model card no las verifica explicitamente.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el formato de respuesta corta y directa sugiere un enfoque contrario al razonamiento extendido.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Respuesta a preguntas academicas de PLN en coreano: el modelo se entrena para responder consultas de dominio con terminologia tecnica en ingles, adecuado para glosarios, FAQ internas o sistemas de consulta de documentacion cientifica en coreano.
- Asistencia a estudiantes e investigadores coreanos: puede emplearse para resolver dudas conceptuales breves (por ejemplo, definiciones de SFT, LoRA o distillation) manteniendo los terminos tecnicos en ingles para evitar ambiguedades de traduccion.
- Base para investigacion data-centric: sirve como punto de partida para experimentos sobre calidad de datos, curriculum learning y seleccion de datos influyentes (LESS, AlpaGasus) en modelos pequenos.
- Evaluacion de estrategias de fine-tuning: util para comparar LoRA frente a full fine-tuning en tareas de dominio con recursos limitados, tal como plantea el roadmap del proyecto.
- Generacion de datasets terminology-aware: puede usarse como componente en pipelines de generacion sintetica de pares pregunta-respuesta con verificacion de calidad.
- Despliegue en entornos con recursos limitados: con aproximadamente 1,5B de parametros, es candidato para inferencia en GPU de consumo o CPU, aunque la model card no documenta cuantizaciones ni requisitos.
- Prototipado de asistentes de consulta tecnica bilingues coreano-ingles en entornos educativos o de documentacion interna.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con las metricas Academic Accuracy, Answer Relevance, Constraint Compliance, Terminology Preservation Rate, Required Concept Coverage y Acronym Expansion Accuracy, pero todos los valores aparecen como pendientes ("—") tanto para Qwen2.5-1.5B-Instruct como para K-TIDE. El autor declara explicitamente que los resultados experimentales estan pendientes y que no se hacen afirmaciones de mejora de rendimiento.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia general para un modelo denso de aproximadamente 1,5B, la inferencia en precision completa requiere del orden de varios GB, pero el autor no documenta cifras ni cuantizaciones.
- GPU recomendadas: no documentadas. Por tamano, el modelo es compatible con GPU de consumo, pero no se confirma en la model card.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 1,5B, aunque no se detalla ni se aportan mediciones.
- Opciones de despliegue: la libreria indicada es transformers; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-TIDE-Qwen2.5-1.5B | Aproximadamente 1,5B | No disponible | Fine-tuning de dominio en coreano con terminologia inglesa | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | Aproximadamente 1,5B | No disponible en la informacion proporcionada | Modelo base generalista, instruction-tuned | Apache 2.0 | Hugging Face |
| K-TIDE-Baseline | No disponible | No disponible | Repositorio de linea base del proyecto | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. Como alternativas de la misma categoria podrian considerarse otros modelos pequenos instruction-tuned, pero no se aportan datos verificables que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Proyecto de investigacion en curso: la model card declara explicitamente que no se hacen afirmaciones de mejora de rendimiento y que los resultados estan pendientes.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de 1,5B con fine-tuning de dominio, la precision academica no esta verificada experimentalmente.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: solo se declaran coreano e ingles; la longitud de contexto no se especifica y el formato de respuesta esta restringido a una o dos frases y un maximo de 30 palabras.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que los materiales educativos restringidos, datasets de evaluacion privados y datos derivados no autorizados no se distribuyen publicamente, y que las publicaciones estan sujetas a permisos de licencia y uso de datos.
- Cuantizacion no planificada segun la model card, lo que puede limitar opciones de despliegue eficiente.
- Ausencia de datos sobre tool calling, agentes y razonamiento multi-paso: no debe asumirse su soporte en produccion.
- El ejemplo de respuesta incluido en la model card representa el formato de salida previsto, no una prediccion verificada del modelo.
- Fecha de creacion del repositorio inusualmente futura (2026-11-24) segun los metadatos de Hugging Face; conviene verificar la vigencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HunBot/K-TIDE-Qwen2.5-1.5B
- Repositorio del modelo base (linea base del proyecto): https://huggingface.co/HunBot/K-TIDE-Baseline
- Qwen2.5 Technical Report: https://arxiv.org/abs/2412.15115
- DistilQwen2.5 (ACL Industry Track 2025): https://aclanthology.org/2025.acl-industry.4/
- KEFT: Knowledge-Enhanced Fine-Tuning for LLMs in Domain-Specific QA: https://aclanthology.org/2025.tacl-1.49/
- AlpaGasus: Training a Better Alpaca with Fewer Data: https://arxiv.org/abs/2307.08701
- LESS: Selecting Influential Data for Targeted Instruction Tuning: https://proceedings.mlr.press/v235/xia24c.html
- LoRA: Low-Rank Adaptation of Large Language Models: https://arxiv.org/abs/2106.09685
