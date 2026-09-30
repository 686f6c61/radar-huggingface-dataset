# Salahuddin1234/OmniDoctor-Hakim

## Resumen

Hakim AI (publicado en HuggingFace como Salahuddin1234/OmniDoctor-Hakim) es un modelo de lenguaje abierto en arabe y ingles especializado en dominio clinico y sanitario. Lo desarrolla el usuario Salahuddin1234 y parte del modelo CohereLabs/c4ai-command-r7b-arabic-02-2025 (Command R7B Arabic de Cohere), sobre el que se ha aplicado un ajuste fino supervisado mediante LoRA y una cuantizacion AWQ de 8 bits (W8A16). Su proposito principal es actuar como el componente generador de un sistema de Retrieval-Augmented Generation (RAG) medico: leer contexto recuperado (por ejemplo, paginas de manuales clinicos) y responder preguntas de pacientes citando la fuente.

El modelo se ha entrenado sobre 50.000 conversaciones reales medico-paciente (dataset Shams03/Ara-Egy-Medical-QA, limpiado previamente con la API de Gemini) y esta optimizado para tolerar texto OCR ruidoso procedente de PDF arabes. Los metadatos de safetensors declaran 2.794.918.336 parametros y el repositorio ocupa 9,1 GB. La licencia es Apache 2.0 y esta pensado para servirse con vLLM en GPUs consumer o de gama de entrada (el autor cita la NVIDIA T4 y la A10G).

Es relevante porque cubre un nicho poco atendido: RAG clinico en arabe con citacion de fuentes y rechazo controlado de preguntas fuera de dominio, todo ello bajo licencia permisiva y con un perfil de despliegue economico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Cohere2 / Command R7B) |
| Parametros totales | 2.794.918.336 (segun metadatos de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens configurados en el ejemplo de despliegue del autor (el modelo base Command R7B soporta hasta 128K) |
| Tipos de cuantizacion | AWQ 8-bit (W8A16), safetensors, compressed-tensors |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, AWQ y compressed-tensors |

## Arquitectura y entrenamiento

La base es Command R7B Arabic, un transformer decoder-only de la familia Cohere2 orientado a generacion de texto y a casos de uso de RAG y tool use. Sobre ese checkpoint se aplico un ajuste fino supervisado con PEFT/LoRA (Rank=16, Alpha=32, Dropout=0,07) dirigido a las proyecciones de atencion y de MLP. El corpus de entrenamiento son 50.000 conversaciones reales medico-paciente del dataset Shams03/Ara-Egy-Medical-QA, que segun la model card fueron depuradas con la API de Gemini para normalizar el arabe medico y mejorar su precision.

La innovacion tecnica destacada esta en la fase de cuantizacion AWQ: en lugar de usar texto de calibracion estandar, el autor construyo un conjunto de calibracion especifico con 64 ejemplos dificiles que incluian ruido OCR simulado, palabras arabes invertidas y frases desestructuradas. El objetivo era que la version comprimida a 8 bits mantuviese la robustez frente a artefactos tipicos de pytesseract. El modelo tambien esta prompteado y entrenado para citar fuentes con un formato explicito del tipo "بناءً على [nombre de la fuente]، pagina [numero]" y para rechazar educadamente preguntas fuera del ambito medico.

## Capacidades

- Generacion de texto en arabe y en ingles, con foco en lenguaje clinico y sanitario.
- Respuesta a preguntas medicas basada en contexto recuperado (RAG), priorizando el texto del contexto sobre la memoria interna del modelo.
- Citacion de fuentes con nombre de documento y numero de pagina en el formato que se le indique.
- Rechazo controlado de preguntas ajenas al dominio medico.
- Tolerancia a texto OCR ruidoso (artefactos de pytesseract, palabras invertidas, frases fragmentadas).
- Comprension de arabe dialectal en la formulacion de la pregunta del paciente (el ejemplo de la model card usa egipcio coloquial).
- Integracion con flujos RAG hibridos: Qdrant como base vectorial y BAAI/bge-m3 como modelo de embeddings.
- Compatibilidad de servicio con vLLM y cuantizacion AWQ.
- Soporte de tool calling / function calling: heredado potencialmente del modelo base Command R7B; no confirmado explicitamente en la model card (no disponible).

## Casos de uso

- Triaje y orientacion clinica en arabe: el modelo recibe la descripcion de sintomas del paciente (incluido dialecto) y genera una respuesta orientativa apoyada en guias recuperadas, citando la fuente y la pagina.
- Asistente de RAG medico sobre manuales escaneados: al integrarse tras un pipeline OCR + Qdrant + bge-m3, responde preguntas usando exclusivamente el texto recuperado y evita inventar datos fuera del contexto.
- Atencion al cliente de clinicas y seguros: gestiona conversaciones multi-turno sobre coberturas, preparacion de pruebas o instrucciones postoperatorias, con rechazo de consultas no medicas.
- Soporte a personal sanitario: resumen y consulta rapida de protocolos o fichas tecnicas durante la consulta, con trazabilidad de la cita.
- Educacion medica en arabe: generacion de preguntas y respuestas explicadas a partir de material docente, manteniendo el idioma y el registro.
- Sistemas de informacion al paciente en ingles y arabe: mismo endpoint sirviendo a hablantes de ambos idiomas desde un unico modelo.
- Despliegue en entornos con recursos limitados: al correr en una T4/A10G con AWQ 8-bit, es apto para infraestructuras de bajo coste que necesiten servir a decenas de usuarios concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta metricas internas de despliegue y evaluacion cualitativa:

| Metrica | Valor reportado |
|---|---|
| ROUGE-L frente al modelo base | +12 % |
| Tasa de alucinacion (seguimiento MLflow) | inferior al 3 % |
| Usuarios concurrentes | 150 |
| Rendimiento | 25+ peticiones por segundo |
| Instancia de referencia | una unica g4dn.2xlarge |
| Latencia tipica | menos de 7 segundos por respuesta |
| Latencia peor caso | aproximadamente 12 segundos |

Estos datos corresponden al pipeline RAG hibrido (Qdrant + BAAI/bge-m3) descrito por el autor y no a benchmarks publicos comparables.

## Requisitos de hardware

- VRAM estimada: con AWQ 8-bit (W8A16) sobre un modelo del orden de 7B, el peso ocupa aproximadamente 7-8 GB; el repositorio completo son 9,1 GB.
- GPU recomendadas por el autor: NVIDIA T4 y A10G, ambas capaces de alojar el modelo cuantizado.
- Cabe en GPU consumer: si, en tarjetas con al menos 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070/4080, RTX 4090). El autor menciona explicitamente la T4 (16 GB).
- Instancia de referencia validada por el autor: g4dn.2xlarge (una T4).
- Opciones de despliegue: vLLM con `quantization="awq"` (soporte confirmado por el autor); el formato safetensors/compressed-tensors permite otros backends compatibles, aunque no se detallan en la model card.
- Ajuste de memoria: el ejemplo del autor usa `gpu_memory_utilization=0.6` para dejar espacio al modelo de embeddings en la misma GPU.
- Latencia y throughput: 25+ peticiones por segundo con 150 usuarios concurrentes en una T4; respuestas tipicas por debajo de 7 s y peor caso en torno a 12 s.
- Configuracion de contexto en el ejemplo: `max_model_len=4096`, `temperature=0.3`, `top_p=0.9`, `max_tokens=512`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OmniDoctor-Hakim (este modelo) | 2,79B segun safetensors (base Command R7B) | 4096 configurados (base hasta 128K) | Apache 2.0 | HuggingFace | Ajuste LoRA + AWQ 8-bit, especializado en RAG medico arabe |
| CohereLabs/c4ai-command-r7b-arabic-02-2025 | 7B aprox. | hasta 128K | no disponible en la informacion | HuggingFace | Modelo base; sin ajuste medico ni calibracion OCR |
| Otros modelos LLM medicos en arabe | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

Nota: la busqueda web devuelve otros proyectos llamados "Hakim" (MCINext/Hakim y Hakim-small, modelos de embeddings en persa, y tryhakim.ai, una API de voz en arabe) que no guardan relacion con este modelo y no deben confundirse con el.

## Limitaciones y advertencias

- El modelo no es un dispositivo medico ni un sustituto del diagnostico profesional; la propia model card incluye un aviso medico explicito y lo describe como herramienta de investigacion.
- Riesgo de alucinacion: aunque el autor reporta tasas inferiores al 3 %, sigue existiendo, y puede aumentar si el contexto recuperado es irrelevante o incorrecto.
- Esta disenado para funcionar con contexto RAG; fuera de ese flujo su fiabilidad clinica disminuye.
- La ventana de contexto usada en el ejemplo es de solo 4096 tokens, lo que limita la cantidad de material recuperado por consulta pese a que el modelo base soporta hasta 128K.
- Cobertura idiomatica limitada al arabe y al ingles; otras lenguas no estan soportadas.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse con conversaciones reales, puede heredar sesgos dialectales o de subpoblaciones concretas.
- La model card referencia el identificador "Shams03/Hakim-AI" en el ejemplo de vLLM, distinto del identificador del repositorio (Salahuddin1234/OmniDoctor-Hakim); conviene verificar la ruta correcta antes de desplegar.
- Los metadatos declaran 0 descargas y 0 "likes", por lo que la validacion externa de la comunidad es practicamente nula.
- Las metricas de rendimiento (25 req/s, 150 usuarios, latencia) proceden del entorno del propio autor y no han sido replicadas de forma independiente.
- Uso comercial: permitido bajo Apache 2.0, sin restricciones especificas documentadas, pero la responsabilidad clinica del uso recae en el integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Salahuddin1234/OmniDoctor-Hakim
- Dataset de entrenamiento: https://huggingface.co/datasets/Shams03/Ara-Egy-Medical-QA
- Modelo base: https://huggingface.co/CohereLabs/c4ai-command-r7b-arabic-02-2025
- Modelo de embeddings usado en el pipeline (BAAI/bge-m3): https://huggingface.co/BAAI/bge-m3
- Perfil de GitHub del autor: https://github.com/salahuddin1234

Nota: los enlaces de la busqueda web (MCINext/Hakim, Hakim-small, el paper arXiv 2505.08435 y tryhakim.ai) corresponden a proyectos homonimos sin relacion con este modelo y por ello no se incluyen como referencias directas.
