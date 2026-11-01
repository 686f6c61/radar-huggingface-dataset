# medismera/Granite-4.2-3B-Surgical-Abliterated

## Resumen

Granite-4.2-3B-Surgical-Abliterated es una versión modificada del modelo IBM Granite 4.2 3B, publicada por el usuario medismera en HuggingFace. El autor ha aplicado una técnica de "ablación quirúrgica de rechazos" (surgical refusal ablation) sobre el modelo base, que consiste en eliminar la dirección latente de rechazo en las capas críticas del transformer para que el modelo no emita respuestas de negación estandarizadas ni advertencias morales.

El modelo base, IBM Granite 4.2 3B, es un modelo de lenguaje causal denso de unos 3,2 mil millones de parámetros (3.659.737.600 parámetros según los safetensors del repositorio) desarrollado por IBM, orientado a generación de texto conversacional y tareas técnicas. La versión abliterada pretende conservar intactas las capacidades de razonamiento, código y conocimiento factual del original.

Su relevancia actual se sitúa en el nicho de los modelos "uncensored" para investigación académica, red-teaming, auditoría de seguridad y exploración creativa sin restricciones. Es importante subrayar que esta ficha describe un modelo derivado de terceros: la ablación se realiza sin el aval oficial de IBM y su uso conlleva responsabilidades legales y éticas para el usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), denso |
| Parametros totales | 3.659.737.600 (3,66 B) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en el repositorio; cuantizaciones concretas no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de IBM Granite 4.2 3B, un modelo de lenguaje causal denso basado en arquitectura transformer decoder-only. No se ha modificado la arquitectura ni el entrenamiento original: la intervención se limita a una post-procesado de los pesos.

La modificación aplicada, denominada "surgical alignment" por el autor, consiste en una ablación direccional de representaciones latentes: se identifica el subespacio de rechazo unificado (la dirección en el espacio latente responsable de las negaciones del modelo) y se proyectan las activaciones de capas críticas para neutralizarlo. Según la model card, el proceso se realiza con restricciones ortogonales benignas y preservación de la norma de Frobenius, con el objetivo de no degradar la correccion algoritmica, la sintaxis de programación ni la profundidad de razonamiento. No hay datos publicados sobre tokens de entrenamiento, composición del dataset ni procesos RLHF/DPO adicionales; el modelo hereda lo que tuviera el Granite 4.2 3B original, cuya ficha de entrenamiento no se incluye en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Granite 4.2 3B.
- Generacion de codigo: la model card afirma que se conserva la competencia en programacion y la correccion sintactica tras la ablacion.
- Razonamiento logico y respuestas tecnicas sin tokens de rechazo por defecto (sin frases del tipo "As an AI..." o "I cannot fulfill this request...").
- Compatibilidad con chat template de Transformers: el codigo de ejemplo comprueba la existencia de `tokenizer.chat_template` y lo aplica si esta disponible.
- Ejecucion estandar con la libreria `transformers` de HuggingFace (`AutoModelForCausalLM`, `torch.bfloat16`, `device_map="auto"`).
- Formatos GGUF disponibles, lo que permite inferencia local con llama.cpp, Ollama y herramientas compatibles.
- No hay informacion sobre tool calling, capacidades de agentes, vision, audio ni modo de razonamiento extendido: no disponible.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite estudiar el comportamiento de un modelo sin barreras de rechazo para identificar vulnerabilidades de alineacion y probar jailbreaks en entornos controlados.
- Auditoria de ciberseguridad: la model card destaca su uso para analisis de redes y auditorias tecnicas (por ejemplo, scripts de auditoria de red local con sockets crudos), al no bloquear instrucciones de seguridad ofensiva o defensiva.
- Investigacion academica sobre alineacion: resulta util como sujeto de estudio para tecnicas de ablacion de subespacios de rechazo y su impacto en el rendimiento.
- Generacion de codigo sin fricción: para desarrolladores que consideran los rechazos excesivamente conservadores en tareas de programacion de sistemas, scripting o herramientas de red.
- Escritura creativa sin restricciones: produccion de narrativa, dialogos o contenido sensible que otros modelos filtrados rechazarian, bajo responsabilidad del usuario.
- Asistente tecnico local y privado: gracias a su tamano de 3,66 B y al formato GGUF, puede desplegarse en hardware de consumo para consultas tecnicas sin enviar datos a servicios externos.
- Analisis de degradacion post-ablacion: comparacion directa contra el modelo base para medir la "taxa de alineacion" en benchmarks de codigo y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que se preservan "benchmarks de conocimiento factual, precision en codigo y razonamiento logico", pero no incluye numeros concretos ni comparativas medibles. Tampoco hay datos publicados del modelo base en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,66 B de parametros en bfloat16, aproximadamente 7-8 GB de VRAM para los pesos completos; con cuantizacion GGUF (Q4/Q5), entre 2,5 y 4 GB. Estas cifras son estimaciones basadas en el tamano de parametros, no datos oficiales.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070) es suficiente para precision completa; con cuantizacion, incluso GPUs de 4-6 GB.
- Cabe en GPUs de consumo sin problemas en formato GGUF; en CPU pura tambien es viable con llama.cpp dada la cuantizacion, con velocidades modestas.
- Opciones de despliegue: transformers (codigo de ejemplo incluido en la model card), llama.cpp y Ollama gracias a los GGUF; compatibilidad con vLLM, TGI o MLX no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponible; al ser un modelo denso de 3,66 B, se esperan latencias bajas en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Formatos | Caracteristica distintiva |
|---|---|---|---|---|---|
| Granite-4.2-3B-Surgical-Abliterated | 3,66 B | Transformer denso | Apache 2.0 | safetensors, GGUF | Ablacion quirurgica de rechazos |
| ibm-granite/granite-4.2-3b (base) | 3,66 B | Transformer denso | Apache 2.0 | safetensors | Modelo original de IBM con alineacion estandar |
| Otros modelos abliterados de 3-4 B (p. ej., derivados de Llama o Qwen) | 3-4 B | Transformer denso | Varia segun base | safetensors, GGUF | Mismo proposito uncensored, base distinta |

Nota: la comparativa se limita al modelo base y a la categoria generica, ya que la informacion proporcionada no incluye datos de rendimiento comparables. No se dispone de cifras de benchmarks para contrastar rendimientos.

## Limitaciones y advertencias

- Riesgo de alucinacion: inherente a cualquier LM de 3-4 B de parametros; la ablacion no reduce este riesgo y, al eliminar salvaguardas, puede amplificar la generacion de contenido falso o perjudicial sin avisos.
- Sesgos: hereda los sesgos del dataset de entrenamiento de IBM Granite 4.2 3B; no existen auditorias de sesgo publicadas para esta version abliterada.
- Idioma: la model card declara solo ingles (en); el rendimiento en castellano u otros idiomas no esta documentado y puede ser limitado.
- Longitud de contexto: no especificada en la informacion disponible, lo que dificulta planificar aplicaciones con documentos largos.
- Uso comercial: la licencia Apache 2.0 del modelo es permisiva, pero el usuario asume toda la responsabilidad legal del contenido generado; la ausencia de rechazos no exime de cumplir leyes aplicables (por ejemplo, el Reglamento de IA de la UE).
- Ausencia de validacion: las afirmaciones de la model card sobre preservacion de capacidades (norma de Frobenius, cero perdida en codigo) no estan respaldadas por benchmarks publicados y deben verificarse de forma independiente.
- Procedencia: se trata de un modelo derivado no oficial; IBM no respalda esta modificacion y la calidad de la ablacion depende enteramente del autor del repositorio (273 descargas, sin likes en el momento de la ficha).
- Seguridad en produccion: no recomendado para productos orientados a usuarios finales sin capas de moderacion externas, dado que el modelo no emitira negaciones ante peticiones problematicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/medismera/Granite-4.2-3B-Surgical-Abliterated
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Organizacion IBM Granite: https://huggingface.co/ibm-granite
- Paper, blog oficial o demos adicionales: no disponible en la informacion proporcionada.
