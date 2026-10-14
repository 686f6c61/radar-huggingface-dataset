# adi274903/Med-Qwen-3.5-4B-Instruct

## Resumen

Med-Qwen-3.5-4B-Instruct es un modelo de lenguaje especializado en razonamiento clinico y biomedico de 4.205.751.296 parametros (4,2B), desarrollado por el usuario adi274903 a partir del modelo base Qwen/Qwen3.5-4B-Base. Se distribuye bajo licencia Apache 2.0 y esta orientado a tareas de pregunta-respuesta medica, viñetas de examen tipo USMLE y deduccion clinica de cadena de pensamiento larga. Su proposito es ofrecer un modelo compacto que quepa en hardware de consumo y que rinda en benchmarks medicos por encima de alternativas del mismo rango de tamano.

El modelo se construye mediante un pipeline de alineacion en dos etapas: primero un preentrenamiento continuo adaptado al dominio (DAPT) con multiples flujos biomedicos, y despues un ajuste supervisado calibrado (SFT-v2) con DoRA (r=64, alpha=128) durante 2.700 pasos sobre una mezcla intercalada de 11 flujos de razonamiento clinico de aproximadamente 276 millones de tokens. La model card reporta una matriz de evaluacion en la que el modelo supera a MedGemma-1.5-4B-it en PubMedQA (66,20% frente a 52,80%) y a Gemma-4-E4B-it, aunque cede frente a Qwen-3.5-4B-Base en algunos subconjuntos de MMLU.

La relevancia actual del modelo radica en su tamano contenido (4,2B) combinado con un enfoque de dominio especifico: permite desplegar razonamiento clinico especializado en una unica GPU consumer, algo que modelos medicos de mayor tamano no permiten. No obstante, la model card no documenta la longitud de contexto efectiva, los tipos de cuantizacion publicados ni el rendimiento en tareas fuera del ambito medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5_text`, derivado de Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3.5-4B declara 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 8,4 GB |
| Modelo base | Qwen/Qwen3.5-4B-Base |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso heredado de Qwen3.5-4B, identificado con la etiqueta de arquitectura `qwen3_5_text`. No se detalla en la informacion disponible si el modelo conserva el componente multimodal del base Qwen3.5-4B (descrito externamente como vision-lenguaje), por lo que su uso documentado se limita a generacion de texto. El modelo contiene 4.205.751.296 parametros en total.

El entrenamiento sigue un pipeline de dos etapas. La primera, Domain-Adaptive Pre-Training (DAPT), consiste en un preentrenamiento continuo multihilo sobre datos biomedicos partiendo de Qwen/Qwen3.5-4B-Base; existe un repositorio asociado de adaptador DAPT (`adi274903/Med-Qwen-3.5-4B-Base-DAPT-Adapter`). La segunda etapa, Calibrated Supervised Fine-Tuning (SFT-v2), aplica optimizacion DoRA con rango 64 y alpha 128 durante 2.700 pasos sobre una mezcla intercalada de 11 flujos de razonamiento clinico de aproximadamente 276 millones de tokens, equilibrando deduccion medica de cadena de pensamiento larga, viñetas de examen, fundamentacion en evidencia y repaso de materias STEM. La model card no menciona el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento clinico especializado en el dominio medico.
- Razonamiento de cadena de pensamiento larga (long-CoT) para deduccion diagnostica.
- Respuesta a preguntas de examenes medicos tipo USMLE y viñetas clinicas.
- Fundamentacion en evidencia biomedica (evidence grounding).
- Repaso de conocimiento STEM intercalado durante el ajuste.
- Formato conversacional mediante plantilla de chat (`apply_chat_template`).
- Capacidades multilingues: solo se declara ingles (`en`).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, vision, audio): no documentadas para este ajuste.

## Casos de uso

- Apoyo a la formacion medica: el modelo responde viñetas clinicas con formato de examen (por ejemplo, USMLE de 4 opciones) y explica el razonamiento, util para simulacros y autoevaluacion de estudiantes.
- Asistente de consulta rapida para residentes: dado un cuadro clinico, genera una lista razonada de diagnosticos diferenciales y pruebas iniciales, como se muestra en el ejemplo de la model card (disnea de esfuerzo con edema y galope S3).
- Preprocesamiento de literatura biomedica: se puede usar para responder preguntas sobre abstracts y articulos (tarea PubMedQA), apoyando revisiones sistematicas y cribado de evidencia.
- Generacion de resumenes de casos clinicos: sintetizar historiales y notas en un resumen estructurado con justificacion diagnostica.
- Prototipos de triaje y anamnesis asistida: integrado en un chatbot de admision clinica para recoger sintomas y sugerir preguntas de seguimiento, con supervision humana obligatoria.
- Investigacion en IA medica: como modelo base de 4,2B para experimentar con tecnicas de alineacion (DoRA, SFT calibrado) en un presupuesto de computo reducido.
- Despliegue en entornos con hardware limitado: al ser un modelo de 4,2B, se puede servir en una unica GPU de gama media para pruebas internas y evaluacion de viabilidad.

## Benchmarks y rendimiento

Resultados reportados en la model card (inferencia greedy zero-shot/few-shot estandar y log-probabilidades de eleccion normalizadas):

| Benchmark / Tarea | Qwen-3.5-4B-Base | MedGemma-1.5-4B-it | Gemma-4-E4B-it | Med-Qwen-3.5-4B-Instruct (este modelo) |
|---|---|---|---|---|
| PubMedQA | 45,60% | 52,80% | 54,40% | 66,20% |
| MedQA (USMLE 4 opciones) | 68,34% | 32,60% | 40,14% | 67,95% |
| GPQA Diamond | 36,87% | 36,36% | 57,58% | 50,51% |
| MedMCQA | 26,50% | 30,60% | 33,00% | 33,20% |
| MMLU Med Aggregate | 82,88% | 50,59% | 31,65% | 80,72% |
| MMLU Clinical Knowledge | 83,40% | 58,87% | 24,91% | 80,38% |
| MMLU College Medicine | 78,03% | 46,24% | 30,64% | 76,88% |
| MMLU Medical Genetics | 87,00% | 59,00% | 31,00% | 84,00% |
| MMLU Professional Medicine | 83,09% | 38,24% | 40,07% | 81,62% |
| AfriMed-QA | 67,00% | 38,20% | 27,00% | 64,80% |

Estos datos proceden unicamente de la model card del autor y no han sido verificados de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 8,4 GB de pesos, mas cache KV; en la practica, en torno a 10-12 GB segun longitud de contexto.
- VRAM en cuantizacion de 4 bits: no documentada por el autor, pero por tamano de parametros se situaria en el orden de 2,5-3 GB (estimacion orientativa, no confirmada).
- GPU recomendadas: una unica GPU con 16-24 GB es suficiente en bf16 (por ejemplo, RTX 4090, RTX 3090, A100 40 GB, L40S).
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas en bf16, y probablemente en 8-12 GB si se cuantiza, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (documentado en la model card). vLLM, TGI, llama.cpp u Ollama son viables en principio, pero no se documentan ni se proporcionan ficheros GGUF.
- Latencia y throughput: no disponible (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Foco | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Med-Qwen-3.5-4B-Instruct | 4,2B | No especificado (base 262.144) | Razonamiento clinico | Apache 2.0 | PubMedQA 66,20%; MedQA 67,95% |
| MedGemma-1.5-4B-it | 4B | No disponible en la informacion | Medico general | No disponible en la informacion | PubMedQA 52,80%; MedQA 32,60% |
| Gemma-4-E4B-it | ~4B (E4B) | No disponible en la informacion | Generalista | No disponible en la informacion | GPQA Diamond 57,58%; PubMedQA 54,40% |
| Qwen-3.5-4B-Base | 4B | 262.144 tokens (segun fuentes externas) | Generalista (base) | Apache 2.0 (heredada) | MMLU Med Aggregate 82,88%; MedQA 68,34% |

Los datos de los modelos comparados proceden de la tabla de la propia model card; no se dispone de verificacion independiente.

## Limitaciones y advertencias

- Modelo de dominio medico especializado: no debe usarse como sustituto del criterio de un profesional sanitario. Cualquier salida clinica requiere validacion humana.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones medicas plausibles pero incorrectas; la model card no reporta tasas de alucinacion ni evaluaciones de seguridad clinica.
- Idiomas: solo se declara soporte de ingles (`en`); no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Longitud de contexto: no especificada para este ajuste; aunque el base declare 262.144 tokens, no se garantiza que el ajuste conserve esa capacidad.
- Sesgos: no se documentan analisis de sesgo demografico, etnico o de subrepresentacion clinica. La evaluacion en AfriMed-QA (64,80%) sugiere menor rendimiento fuera de poblaciones anglosajonas.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria del uso medico recae en el desplegador.
- Madurez: repositorio con 589 descargas y 0 "likes" en el momento de la consulta, sin validacion externa ni publicacion revisada por pares.
- Sin cuantizaciones oficiales: no se publican GGUF, AWQ ni GPTQ, lo que complica el despliegue en hardware muy limitado.
- Fechas: el repositorio figura creado y actualizado en octubre de 2026, sin historial de mantenimiento posterior conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adi274903/Med-Qwen-3.5-4B-Instruct
- Adaptador DAPT: https://huggingface.co/adi274903/Med-Qwen-3.5-4B-Base-DAPT-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Qwen3 (familia relacionada): https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3.5 4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Catalogo de Qwen3.5 4B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-4b
