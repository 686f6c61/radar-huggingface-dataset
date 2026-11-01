# fehidalgo/finbot-slm

## Resumen

finbot-slm es un adaptador LoRA sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct, desarrollado por el usuario fehidalgo en el marco del Taller de Destilación de la UAI (Universidad Adolfo Ibáñez). El modelo se ha entrenado mediante destilación de conocimiento: un modelo profesor de OpenAI generó las respuestas y el modelo pequeño aprendió a imitarlas. Su propósito es actuar como asistente que explica conceptos de inteligencia artificial generativa a ejecutivos de empresas chilenas, en español y con ejemplos de negocio local.

El dominio de aplicación está acotado a seis temas concretos: Agentes de IA, Ajuste fino, Evaluación y LLMOps, Fundamentos de LLM, Ingeniería de prompts y RAG. No se trata de un modelo de propósito general, sino de un experimento educativo de destilación sobre un SLM (small language model) de 360 millones de parámetros, con un conjunto de entrenamiento muy reducido de 30 pares pregunta-respuesta.

Es relevante ahora como ejemplo didáctico de pipeline de destilación con LoRA sobre modelos pequeños, y como caso de estudio de las limitaciones reales de este enfoque cuando el volumen de datos es mínimo. El repositorio tiene 26 descargas y ningún "like" en el momento de la consulta, lo que refleja su carácter de artefacto académico más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA añade un conjunto reducido de parámetros (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base SmolLM2-360M-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 (heredada de SmolLM2) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. La configuración del adaptador es r=16, alpha=32, dropout=0.05, con módulos objetivo down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj y v_proj, es decir, las proyecciones de atención y de la MLP. El entrenamiento se realizó durante 1 época y 15 pasos, con una pérdida que descendió de 2.6123 a 2.4924.

Los datos de entrenamiento consisten en 30 pares pregunta-respuesta sintéticos generados por un modelo profesor de OpenAI, distribuidos por tema: Agentes de IA (4), Ajuste fino (6), Evaluación y LLMOps (5), Fundamentos de LLM (5), Ingeniería de prompts (4) y RAG (6). Se reservó un examen fijo de 12 preguntas que nunca se usaron para entrenar. No se documenta el uso de RLHF ni DPO; el método es destilación supervisada directa sobre las salidas del profesor. La innovación técnica destacable es precisamente la metodología: un pipeline de destilación reproducible sobre un SLM con recursos mínimos, orientado a fines educativos.

## Capacidades

- Generación de texto en español sobre conceptos de IA generativa: agentes, ajuste fino, evaluación y LLMOps, fundamentos de LLM, ingeniería de prompts y RAG.
- Explicación de conceptos con ejemplos de negocio local (retail, ventas, atención al cliente) orientados a ejecutivos chilenos.
- Formato de conversación instruct (heredado de SmolLM2-360M-Instruct).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al español según la model card; el modelo base soporta más idiomas, pero el adaptador no está entrenado para ellos.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Formación interna para ejecutivos: el modelo puede generar explicaciones introductorias de conceptos de IA generativa en español, con ejemplos de retail y ventas, adecuado por su entrenamiento específico en ese dominio y registro.
- Prototipado de asistentes conversacionales educativos: sirve como base para validar interfaces de chat y flujos de preguntas frecuentes antes de invertir en modelos mayores, gracias a su tamaño reducido y facilidad de despliegue.
- Demostración de pipelines de destilación: se puede usar como caso práctico en talleres y cursos para ilustrar el flujo completo (generación de datos con profesor, entrenamiento LoRA, evaluación con examen fijo).
- Generación de material didáctico borrador: el modelo puede producir explicaciones iniciales de los seis temas cubiertos que un humano revisa y amplía, aprovechando su familiaridad con el vocabulario del dominio.
- Evaluación comparativa de SLM: sirve como referencia en experimentos que miden el efecto de la destilación con pocos datos frente al modelo base, ya que la model card documenta la nota del juez antes del entrenamiento (1.25/10).
- Asistente de consulta interna de bajo coste: en entornos con restricciones de hardware, puede desplegarse en CPU o GPU consumer para responder preguntas frecuentes sobre IA generativa, siempre con verificación humana.
- Pruebas de concepto de RAG educativo: el modelo puede integrarse en un pipeline de recuperación para responder sobre documentación interna, aunque su ventana de contexto y calidad limitan el alcance.

## Benchmarks y rendimiento

La model card solo reporta la evaluación con un juez (nota 1–10) sobre el examen fijo de 12 preguntas:

| Metrica | Antes (modelo base) | Despues (destilado) |
|---|---|---|
| Nota media | 1.25 | pendiente |
| Aprobacion (nota >= 7) | 0% | pendiente |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los resultados del modelo destilado están pendientes de publicación según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M parámetros en fp16 ocupa aproximadamente 0,7 GB; en cuantización de 8 bits, alrededor de 0,4 GB; en 4 bits, alrededor de 0,2 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. También cabe en GPUs integradas y en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers con PEFT (según el ejemplo de la model card), llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, vLLM y TGI para servir el modelo fusionado.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| finbot-slm | 360M (base) + LoRA | no disponible | apache-2.0 | Adaptador educativo en español, 30 ejemplos de entrenamiento |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible | apache-2.0 | Modelo base; propósito general, multilingüe |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | apache-2.0 | Alternativa de tamaño similar con mejor rendimiento general documentado por su autor |
| TinyLlama-1.1B-Chat | 1.1B | no disponible | apache-2.0 | Alternativa algo mayor, orientada a chat |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada. finbot-slm se distingue por su especialización temática y su metodología de destilación, no por métricas de capacidad general.

## Limitaciones y advertencias

- Entrenado con solo 30 ejemplos: alta probabilidad de inventar respuestas o salir del tema; la propia model card lo advierte.
- La evaluación del modelo destilado está pendiente; no hay evidencia publicada de que mejore al modelo base en el examen fijo.
- Sesgos conocidos: no documentados, pero al estar entrenado con ejemplos de negocio chileno generados por un profesor, puede reproducir sesgos de ese dominio y registro.
- Riesgo de alucinación elevado por el tamaño del modelo y el volumen mínimo de datos.
- Limitación de idioma: solo español según la model card; el adaptador no está entrenado para otros idiomas.
- Restricción de licencia: aunque el adaptador hereda apache-2.0, los términos de OpenAI restringen usar sus salidas para desarrollar modelos que compitan con OpenAI; conviene revisar esta cláusula antes de cualquier uso comercial.
- Uso educativo declarado: no reemplaza asesoría profesional y requiere verificación humana de cualquier dato usado en decisiones de negocio.
- No apto para producción sin una evaluación exhaustiva y una ampliación sustancial del conjunto de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/fehidalgo/finbot-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
