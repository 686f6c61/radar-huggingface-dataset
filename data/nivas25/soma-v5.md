# nivas25/Soma-v5

## Resumen

Soma-v5 es un modelo de clasificación de texto binario (SPEAK/SILENT) desarrollado por Reddy Sai Nivas C (nivas25) como proyecto capstone de PES University. Actúa como un "gate" o compuerta que decide si un bot auxiliar debe intervenir en una conversación multiparte de IRC de Ubuntu, concretamente tras la última línea de una ventana de 12 líneas. No es un modelo generativo ni un sistema de teoría de la mente: su única función es emitir una etiqueta binaria que controla cuándo un escritor externo (fuera del alcance de este modelo) debe producir una respuesta.

El modelo consiste en un adaptador LoRA de 7B entrenado sobre datos del corpus de desenredo de IRC (Kummerfeld et al., ACL 2019), con etiquetas SPEAK/SILENT generadas por un teacher Qwen-32B y posteriormente auditadas de forma manual sobre 200 ventanas doradas. El repositorio incluye el código completo del pipeline (scripts 01–17), datos de evaluación y figuras, pero no incluye el adaptador final ni los datos crudos de IRC (deben reconstruirse o solicitarse a los autores). Su relevancia radica en ofrecer una solución ligera y específica para el problema de decidir cuándo un agente conversacional debe participar en un canal ocupado, reduciendo el ruido y mejorando la experiencia de los usuarios.

La licencia es MIT para el código y CC-BY-4.0 para los datos de IRC subyacentes. El repositorio tiene un tamaño de 0,5 GB e incluye únicamente código, datos de evaluación y figuras; el adaptador LoRA no está publicado en el clon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base de 7B (no especificado) |
| Parametros totales | No disponible (solo adaptador LoRA; repo de 0,5 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 12 lineas de IRC (W=12) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (codigo) / CC-BY-4.0 (datos IRC) |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre un modelo de lenguaje de 7B no especificado en la documentacion. La tarea es clasificacion binaria de secuencias: dada una ventana de 12 lineas de IRC, el modelo predice si el bot debe hablar (SPEAK) o permanecer en silencio (SILENT) despues de la ultima linea. No se trata de un transformer generativo completo, sino de un clasificador especializado entrenado con ajuste fino supervisado (SFT).

El entrenamiento sigue un pipeline complejo documentado en los scripts 01–17: descarga de datos del corpus `jkkummerfeld/irc_disentangle`, construccion de ventanas exactas de 12 lineas, etiquetado silver mediante un teacher Qwen-32B v1 sobre 2.000 ventanas piloto, auditoria humana de 200 ventanas doradas, y finalmente entrenamiento del LoRA 7B con una proporcion 1:3 de ejemplos SPEAK frente a SILENT. El mejor checkpoint (paso 1200) alcanza una macro-F1 de 0,878 sobre las 200 ventanas doradas. No se aplican tecnicas de stemming, lematizacion, stopwords ni lowercasing.

## Capacidades

- Clasificacion binaria SPEAK/SILENT para decidir si un bot debe intervenir en una conversacion IRC multiparte.
- Procesa ventanas de exactamente 12 lineas de IRC, evaluando el contexto completo de la conversacion reciente.
- Decision post-hoc: emite la etiqueta despues de la ultima linea de la ventana, sin generar contenido.
- Entrenado especificamente con datos de IRC de Ubuntu, lo que lo hace adecuado para canales de soporte tecnico y comunidades de desarrollo.
- No es un modelo generativo: no produce respuestas, solo una senal de control.
- No implementa teoria de la mente, PPO ni modelado emocional (segun la documentacion).
- Soporta un unico idioma (ingles) y un unico dominio (IRC de Ubuntu).

## Casos de uso

- Moderacion de bots en canales de soporte: el gate puede integrarse en un bot existente para decidir si debe responder a una pregunta, evitando intervenciones innecesarias en conversaciones ya resueltas.
- Asistentes de ayuda en comunidades de desarrollo: en canales como #ubuntu, el modelo ayuda a priorizar cuando un asistente automatico debe ofrecer ayuda, reduciendo el ruido para los usuarios humanos.
- Sistemas de respuesta automatica en IRC: combinado con un generador de texto, el gate actua como filtro previo para evitar respuestas duplicadas o fuera de lugar.
- Analisis de conversacion y deteccion de necesidad de intervencion: puede usarse para estudiar dinamicas de chat y determinar en que momentos los usuarios requieren asistencia externa.
- Pruebas de concepto para agentes conversacionales: sirve como componente de control en investigacion sobre cuando un agente debe hablar en entornos multiparte.
- Integracion en pipelines de automatizacion de soporte: el modelo puede desplegarse como un servicio de clasificacion que alimenta a otros sistemas (por ejemplo, colas de tickets) cuando detecta que un usuario necesita ayuda.
- Evaluacion de politicas de intervencion en bots: permite comparar estrategias de participacion (siempre callar, siempre hablar, reglas heuristicas) frente a un modelo aprendido.

## Benchmarks y rendimiento

El modelo se evalua sobre 200 ventanas doradas (auditadas por humanos). Los resultados se comparan con tres baselines heuristicos:

| metodo | Macro-F1 | Speak-F1 | Silent-F1 |
| --- | ---: | ---: | ---: |
| **LoRA 7B (Soma-v5)** | **0,878** | **0,861** | **0,895** |
| B3: pregunta ∧ ¬helper | 0,775 | 0,716 | 0,833 |
| B2: solo pregunta | 0,682 | 0,652 | 0,712 |
| B1: siempre SILENT | 0,355 | 0,000 | 0,710 |

La matriz de confusion reportada es: TN 102, FP 8, FN 16, TP 74. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo no es generativo y esta especializado en una tarea concreta.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware para inferencia.
- El entrenamiento se realizo en una GPU H100 a traves de Modal (segun el script `17_launch_lora_train.py`).
- Al ser un adaptador LoRA de 7B, la inferencia puede ejecutarse en GPUs de consumo con al menos 8-16 GB de VRAM si se usa el modelo base cuantizado, aunque no se especifica el modelo base ni la cuantizacion.
- El repositorio no incluye instrucciones de despliegue (vLLM, llama.cpp, etc.), por lo que la integracion requiere adaptacion manual.
- La latencia estimada no esta disponible; al ser una clasificacion de ventanas cortas (12 lineas), se espera que sea baja, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente publicados. El propio modelo se compara internamente con baselines heuristicos (B1, B2, B3) que supera claramente en macro-F1. No hay otros clasificadores de intervencion en IRC de acceso publico con los que contrastar. La comparativa con modelos generativos de 7B no es pertinente porque Soma-v5 no genera texto.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con IRC de Ubuntu; su rendimiento en otros canales o plataformas no esta garantizado.
- Idioma unico: solo soporta ingles; no funciona con otros idiomas.
- No es generativo: no puede producir respuestas, solo etiquetas. Requiere un componente externo para escribir los mensajes.
- Datos de entrenamiento con sesgo: el corpus de IRC puede contener lenguaje informal, jerga tecnica y sesgos propios de la comunidad de Ubuntu.
- Licencias: el codigo es MIT, pero los datos de IRC son CC-BY-4.0 y requieren aceptar la licencia de Hugging Face antes de descargarlos. El clon no incluye los datos crudos.
- Reproducibilidad limitada: el adaptador LoRA no esta publicado en el repositorio; solo estan los scripts y datos de evaluacion. Para obtener el modelo entrenado hay que reconstruirlo o solicitar acceso a los autores.
- Riesgo de alucinacion no aplica (no genera texto), pero si puede haber errores de clasificacion que lleven a intervenciones inapropiadas o silencios innecesarios.
- No implementa mecanismos de control de calidad adicionales (como verificacion de relevancia o deduplicacion de respuestas) mas alla de la etiqueta binaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nivas25/Soma-v5
- Dataset utilizado: https://huggingface.co/datasets/jkkummerfeld/irc_disentangle
- Paper de referencia (Kummerfeld et al., ACL 2019): https://aclanthology.org/P19-1374/ y arXiv: https://arxiv.org/abs/1810.11118
- Perfil del autor en Hugging Face: https://huggingface.co/nivas25
- Perfil del autor en GitHub: https://github.com/nivas25/
