# Fofiguer/finbot-slm

## Resumen

finbot-slm es un adaptador LoRA (PEFT) entrenado sobre HuggingFaceTB/SmolLM2-1.7B-Instruct mediante destilación de caja negra: las respuestas de un LLM profesor (identificado como `gpt-6-luna` vía API de OpenAI) se usaron como datos de ajuste fino supervisado. El proyecto nace en el taller *Destilación en pequeño* del Máster en IA de la UAI (Tópicos Avanzados en IA 2) y tiene un propósito claramente educativo: servir de asistente que explica conceptos de IA generativa (LLM, ingeniería de prompts, RAG, agentes, ajuste fino y LLMOps) a ejecutivos, con ejemplos de negocio como bancos y retail.

El resultado más relevante es la mejora medible sobre el modelo base: en un examen fijo de 12 preguntas (excluidas del entrenamiento) evaluado por un LLM juez con rúbrica 1–10, la nota media pasa de 4,50 a 7,08 y la tasa de aprobación de 2/12 a 9/12. Es un ejemplo didáctico de cuánto rendimiento de dominio se puede extraer de un modelo pequeño de 1.700 millones de parámetros con solo 200 pares pregunta-respuesta.

Eso sí, se trata de un modelo de demostración académica, no de un producto: el repositorio pesa unos 0,1 GB (solo el adaptador), las descargas son mínimas (20) y las limitaciones documentadas son significativas (alucinaciones de siglas, respuestas solo en inglés). Su valor principal está en servir de referencia práctica de destilación con LoRA sobre SLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SmolLM2-1.7B-Instruct (transformer decoder) |
| Parametros totales | 1,7B (modelo base) + adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de SmolLM2-1.7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin fusionar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, no fusionado con el modelo base) |

## Arquitectura y entrenamiento

El modelo no es un modelo completo sino un adaptador LoRA sin fusionar sobre SmolLM2-1.7B-Instruct. Los hiperparámetros documentados son: rango r = 16, alpha = 32, dropout = 0,05, aplicado a los módulos `down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj` (todas las proyecciones de atención y MLP). El entrenamiento fue SFT con enmascaramiento de la pregunta (solo se calcula pérdida sobre la respuesta), durante 3 épocas con lote 4 y tasa de aprendizaje 0,001; la pérdida de entrenamiento descendió de 2,9918 a 0,6351.

Los datos de entrenamiento son 200 pares pregunta-respuesta generados por el LLM profesor en inglés de EE. UU., con respuestas de máximo 50 palabras, distribuidos en seis temas: fundamentos de LLM (32), ingeniería de prompts (32), RAG (33), agentes de IA (34), ajuste fino (34) y evaluación/LLMOps (35). Se reservaron 12 preguntas de examen que nunca se usaron en entrenamiento. La destilación es de caja negra: el estudiante solo ve las salidas del profesor, no sus pesos ni logits.

## Capacidades

- Generacion de texto explicativa sobre IA generativa: fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y LLMOps.
- Respuestas breves y directas: entrenado con respuestas de máximo 50 palabras, adecuado para explicaciones ejecutivas concisas.
- Ejemplos contextualizados: ilustra conceptos con casos de negocio (bancos, retail chilenos).
- Formato de chat: hereda la plantilla de conversación de SmolLM2-1.7B-Instruct (mensajes system/user/assistant).
- No hay soporte documentado de tool calling, agentes multi-paso, visión ni audio.
- Solo responde correctamente en inglés; ante preguntas en español tiende a responder en inglés.

## Casos de uso

- Formacion ejecutiva en IA generativa: explicaciones breves de conceptos como RAG o agentes para directivos sin perfil técnico, con ejemplos de negocio bancario y retail.
- Material didactico en cursos: base para demos de destilación y LoRA en aulas, dado que el proyecto incluye metodología, hiperparámetros y resultados replicables.
- Prototipo de chatbot de dominio cerrado: punto de partida para un asistente interno que responda dudas frecuentes sobre LLMOps y ajuste fino en una organización.
- Experimento de evaluacion con LLM juez: el pipeline de evaluación (12 preguntas fijas + rúbrica 1–10) sirve como plantilla para medir mejoras de destilación en proyectos propios.
- Prueba de concepto de SLM local: al ser un modelo de 1,7B, permite demostrar despliegue de IA generativa en hardware modesto o entornos sin conexión a APIs externas.
- Punto de partida para iteraciones de dominio: el adaptador puede reentrenarse o ampliarse con más pares pregunta-respuesta para cubrir más temas o mejorar la calidad.

## Benchmarks y rendimiento

No hay resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) publicados. El único dato de rendimiento es la evaluación propia del autor con LLM juez (`gpt-6-luna`, rúbrica 1–10 contra respuesta de referencia del profesor) sobre las 12 preguntas del examen fijo:

| Metrica | Antes (modelo base) | Despues (destilado) |
|---|---|---|
| Nota media | 4,50 | 7,08 |
| Aprobacion (nota >= 7) | 2/12 | 9/12 |

Advertencias del propio autor: el examen es pequeño (12 preguntas) y el juez es otro LLM, por lo que la nota varía aproximadamente ±0,25 entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1,7B en FP16 requiere unos 3,5–4 GB de VRAM; el adaptador LoRA añade apenas decenas de MB (el repo pesa 0,1 GB). Con cuantización de 4 bits (Q4 GGUF del modelo base fusionado) cabría en menos de 2 GB.
- GPU recomendadas: cualquier GPU de consumo es suficiente; una RTX 3060 de 12 GB o incluso una RTX 3050 ejecuta el modelo con holgura. No se necesita hardware de datacenter (A100/H100) para inferencia.
- Consumer GPU: sí, cabe cómodamente en prácticamente cualquier GPU moderna con 4 GB o más de VRAM; también es viable en CPU pura con llama.cpp, con latencias aceptables para un modelo de este tamaño.
- Despliegue: el adaptador está pensado para cargarse con `transformers` + `peft` (ver ejemplo de la model card). Tras fusionar el adaptador con el modelo base, puede exportarse a GGUF para llama.cpp, Ollama o LM Studio; vLLM y TGI también sirven si se fusiona primero.
- Latencia y throughput: no disponible; por tamaño (1,7B) cabe esperar generación fluida incluso en GPU de consumo y velocidades moderadas en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Dominio |
|---|---|---|---|---|
| Fofiguer/finbot-slm | Adaptador LoRA sobre SLM | 1,7B (base) + LoRA | Apache 2.0 | Explicación de IA generativa para ejecutivos (en inglés) |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | SLM generalista (base) | 1,7B | Apache 2.0 | Chat generalista multitematico |
| Qwen2.5-1.5B-Instruct | SLM generalista | 1,5B | Qwen (uso comercial permitido con condiciones) | Chat generalista, fuerte en multilingüe |

Comparado con su modelo base, finbot-slm mejora sustancialmente en su dominio estrecho (4,50 → 7,08 en la evaluación propia) pero pierde generalidad: fuera del dominio el propio autor documenta que el modelo base responde mejor. Frente a alternativas como Qwen2.5-1.5B-Instruct, no ofrece benchmarks estandarizados comparables ni soporte multilingüe equivalente.

## Limitaciones y advertencias

- Alucinaciones graves incluso en dominio: el autor documenta que definió LoRA como "Language-Oriented Recurrent Architecture" y RAG como "Reoutheastern Asia Gross Domestic Product" con total seguridad.
- Fuera del dominio empeora respecto al modelo base: llegó a recomendar un restaurante inexistente.
- Solo responde en inglés: ante preguntas en español, responde en inglés (el entrenamiento en español del estudiante alcanzó solo 2,9/10 frente a 6,0/10 en inglés).
- Evaluación poco robusta: examen de solo 12 preguntas y juez LLM con variabilidad de aproximadamente ±0,25 puntos entre ejecuciones.
- Restriccion licencia de datos: los datos de entrenamiento son salidas de la API de OpenAI, cuyos términos restringen desarrollar modelos que compitan con OpenAI; revisar los términos vigentes antes de cualquier uso fuera del curso.
- Uso previsto educativo e interno: no apto para decisiones reales de negocio sin revisión humana.
- Adaptador sin fusionar: requiere cargar el modelo base junto con el adaptador PEFT, lo que añade una dependencia adicional en despliegue.
- Cobertura tematica estrecha: seis temas con respuestas de máximo 50 palabras; no sirve para explicaciones extensas ni para tareas generales de código, matemáticas o razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fofiguer/finbot-slm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- No se han encontrado enlaces a papers, blogs, repositorios de código ni demos adicionales en la información disponible.
