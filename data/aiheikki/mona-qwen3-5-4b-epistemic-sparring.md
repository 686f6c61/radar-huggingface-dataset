# AIHeikki/mona-qwen3.5-4b-epistemic-sparring

## Resumen

Mona (`mona-qwen3.5-4b-epistemic-sparring`) es un ajuste fino por LoRA del modelo `Qwen/Qwen3.5-4B`, desarrollado por AIHeikki dentro de la serie experimental `Exp 5A`. El objetivo declarado es corregir tres modos de fallo sistematicos de los modelos instruidos convencionales cuando se emplean como interlocutor tecnico o estrategico: la adulacion ante figuras de autoridad (sycophancy), la fabricacion de datos ante preguntas sin respuesta verificable y la incapacidad de detectar contradicciones entre fragmentos de contexto recuperado (RAG).

El modelo se distribuye como adaptador PEFT en BF16 (rango 32, alpha 32, aplicado sobre las 36 capas de proyecciones del bloque hibrido Gated DeltaNet + Gated Attention) y como GGUF cuantizado `Q4_K_M` de 2,59 GiB listo para llama.cpp y Ollama. El repositorio incluye ademas un `Modelfile` y varios informes de evaluacion con `N = 100` escenarios retenidos.

Es relevante para equipos que construyen asistentes de auditoria documental, revision de premisas en propuestas ejecutivas o pipelines RAG donde la trazabilidad de la evidencia importa mas que la fluidez. El modelo base tiene 4.326.350.848 parametros y hereda la licencia Apache 2.0 de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet + Gated Attention (base Qwen3.5-4B), ajuste fino mediante LoRA de alto rango |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | GGUF `Q4_K_M` (2,59 GiB); adaptador LoRA en BF16 (169,9 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (`Q4_K_M`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, una arquitectura hibrida que combina capas de Gated DeltaNet con capas de Gated Attention. Sobre esa base se aplico un adaptador LoRA de rango 32 y alpha 32 en las 36 capas del modelo, entrenado en BF16. El adaptador resultante ocupa 169,9 MB y se exporto adicionalmente a GGUF `Q4_K_M` como artefacto autonomo de 2,59 GiB. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica declarada es de comportamiento, no de arquitectura: el modelo fuerza un habito cognitivo en dos fases. Primero ejecuta una comprobacion epistemica explicita dentro de la etiqueta `<think>`, donde audita si la premisa es solida, si existe evidencia suficiente o si las fuentes recuperadas entran en conflicto. Despues emite una respuesta que separa explicitamente `[Verified Fact]`, `[Working Hypothesis]` y `[Unverified Assumption]`. El ajuste se realizo contra los tres fallos descritos en la model card: adulacion bajo presion de autoridad, fabricacion ante consultas sin respuesta y promedio silencioso de fragmentos RAG contradictorios.

## Capacidades

- Generacion de texto conversacional con disciplina epistemica: distingue hechos verificados, hipotesis de trabajo y suposiciones no verificadas en la propia respuesta.
- Abtencion calibrada: rechaza fabricar estadisticas, citas o metricas cuando no dispone de evidencia, en lugar de inventar datos plausibles.
- Resistencia a la adulacion: mantiene la objecion ante premisas defectuosas aunque el usuario invoque autoridad (por ejemplo, un rol de VP de Ingenieria).
- Deteccion de conflictos en contexto RAG: identifica y expone contradicciones de fechas, cifras o reglas entre fragmentos recuperados en lugar de escoger uno en silencio.
- Reparacion de premisas: corrige supuestos falsos embebidos en la pregunta antes de responder.
- Razonamiento multi-paso dentro del bloque `<think>` previo a la respuesta.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales, de audio o de vision: no disponibles (modelo exclusivamente de texto).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Auditoria de pipelines RAG: el modelo se coloca como capa de verificacion sobre los fragmentos recuperados y senala contradicciones de fechas, importes o politicas antes de que el sistema genere la respuesta final. Es adecuado porque su tasa de deteccion de conflictos RAG medida es del 95 % frente al 65 % del base.
- Revision de propuestas ejecutivas y memorandos: se le presenta un borrador con premisas implicitas (por ejemplo, "migrar todos los ledgers transaccionales a un vector store sin indice") y devuelve un analisis que separa lo verificado de lo asumido, con objeciones explicitas.
- Asistente de analisis normativo o regulatorio: ante consultas sobre normativas inexistentes o metricas internas no documentadas, el modelo se abstiene en lugar de citar fuentes inventadas, lo que reduce el riesgo de informes con referencias falsas.
- Interlocutor tecnico para revision de arquitectura: en sesiones de diseno, actua como contraparte que cuestiona supuestos de escalado, latencia o coste sin ceder ante la presion jerarquica del interlocutor.
- Control de calidad en generacion de documentacion interna: se integra como paso previo a la publicacion de guias o runbooks para marcar afirmaciones sin respaldo y forzar su verificacion.
- Despliegue en local o en el borde: el GGUF `Q4_K_M` de 2,59 GiB permite ejecutarlo en estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, util para entornos con requisitos de confidencialidad donde no se puede enviar contexto a la nube.
- Filtro de calibracion en asistentes de atencion al cliente tecnicos: cuando el cliente afirma un comportamiento del producto que no consta en la base de conocimiento, el modelo lo marca como no verificado en lugar de confirmarlo.

## Benchmarks y rendimiento

Resultados sobre `N = 100` escenarios retenidos, 20 por categoria, segun la model card del autor:

| Categoria | Qwen3.5-4B base | Mona (Exp 5A) | Ganancia absoluta |
|---|---|---|---|
| Abtencion epistemica (no fabricar ante consultas sin respuesta) | 30,0 % | 100,0 % | +70,0 pp |
| Antisicofancia (objetar premisas defectuosas bajo presion de autoridad) | 35,0 % | 90,0 % | +55,0 pp |
| Deteccion de conflictos RAG (fechas o cifras contradictorias entre fragmentos) | 65,0 % | 95,0 % | +30,0 pp |
| Reparacion de premisas (corregir supuestos falsos embebidos) | 50,0 % | 90,0 % | +40,0 pp |
| Calibracion e incertidumbre (`[Verified]` frente a `[Hypothesis]`) | 30,0 % | 95,0 % | +65,0 pp |
| Precision epistemica global (`N = 100`) | 42,0 % | 94,0 % | +52,0 pp |
| Tasa de alucinacion o fabricacion | 34,0 % | 0,0 % | -34,0 pp |
| Tasa de capitulacion sicofante | 24,0 % | 1,0 % | -23,0 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores proceden de la evaluacion propia del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para el GGUF `Q4_K_M`: aproximadamente 3 GB para los pesos mas la cache KV; con contexto de 8192 tokens conviene reservar entre 5 y 6 GB en total.
- VRAM estimada para el adaptador LoRA en BF16 sobre el base: el adaptador pesa 169,9 MB, pero requiere cargar el modelo base de 4,3 B de parametros en BF16 (unos 8,6 GB) o en cuantizacion equivalente.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) para el GGUF `Q4_K_M`; para inferencia en BF16 del base, 12-16 GB (RTX 4080, RTX 4090, A10). Para despliegue en servidor con concurrencia, A100 o H100.
- Cabe en GPU consumer: si, en el formato `Q4_K_M`, en tarjetas de 8 GB o superiores.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (incluye `Modelfile` listo), y cualquier runtime compatible con PEFT para el adaptador. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor recomienda `--temp 0.2` para el servidor llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mona Qwen3.5-4B (Exp 5A) | 4,33 B | no disponible | Disciplina epistemica y antisicofancia sobre Qwen3.5-4B | Apache 2.0 | Adaptador PEFT + GGUF `Q4_K_M` |
| Qwen3.5-4B (base) | 4,33 B | no disponible | Modelo instruido generico | Apache 2.0 | Pesos completos en Hugging Face |
| Lisa Gemma-4-E4B (Exp 5B, mismo autor) | no disponible | no disponible | Auditoria visual y forense de marca sobre Gemma-4-E4B-it | no disponible | Adaptador PEFT |
| Fable Mistral Small 4 119B (Exp 5C, mismo autor) | 119 B (MoE) | no disponible | Arquitecto 5G SA y diagnostico de causa raiz en NOC | no disponible | LoRA |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria fuera de la comparacion con el modelo base incluida en la seccion anterior.

## Limitaciones y advertencias

- Las metricas de rendimiento proceden exclusivamente de la evaluacion del autor sobre 100 escenarios propios; no hay validacion independiente ni resultados en benchmarks estandar.
- El modelo esta especializado en un comportamiento concreto (disciplina epistemica); puede mostrar un rendimiento inferior al base en tareas genericas de generacion creativa, resumen o codigo, para las que no fue optimizado.
- El sesgo hacia la abtencion puede producir rechazos excesivos en dominios donde el modelo base responderia correctamente con conocimiento parametrico razonable.
- Riesgo de alucinacion residual: la model card reporta 0,0 % en su conjunto de evaluacion, pero una tasa de 0 % en 100 muestras no garantiza ausencia de fabricacion en produccion.
- Idiomas soportados no declarados; no hay evidencia de comportamiento calibrado fuera del ingles, idioma en el que estan redactados los ejemplos de la model card.
- Longitud de contexto no declarada; el ejemplo de despliegue usa 8192 tokens, por lo que no debe asumirse una ventana mayor sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener terminos adicionales que conviene revisar antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay senales de adopcion ni de mantenimiento a largo plazo.
- El formato de respuesta con etiquetas `[Verified Fact]`, `[Working Hypothesis]` y `[Unverified Assumption]` requiere post-procesado si se integra en interfaces de usuario que no lo esperan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/mona-qwen3.5-4b-epistemic-sparring
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo relacionado (Exp 5B, Lisa): https://huggingface.co/AIHeikki/lisa-gemma4-e4b-visual-auditor
- Modelo relacionado (Exp 5C, Fable): https://huggingface.co/AIHeikki/fable-mistral-small-4-119b-telco-lora
- Informe de evaluacion: `reports/EVALUATION_REPORT.md` dentro del repositorio
- Resumen de evaluacion legible por maquina: `reports/eval_summary.json` dentro del repositorio
- Auditoria RAG sobre Nordbank AB: `reports/MONA_NORDBANK_AB_RAG_AUDIT.md` dentro del repositorio
- Auditoria de pitch ejecutivo: `reports/MONA_NORDBANK_PITCH_AUDIT.md` dentro del repositorio
