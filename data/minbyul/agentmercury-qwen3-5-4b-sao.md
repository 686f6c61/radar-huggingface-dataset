# Minbyul/AgentMercury-Qwen3.5-4B-SAO

## Resumen

AgentMercury-Qwen3.5-4B-SAO es un checkpoint del modelo Qwen3.5-4B (4.205.751.296 parámetros) post-entrenado con aprendizaje por refuerzo (RL) agéntico sobre entornos de uso de herramientas MCP (Model-Context-Protocol). Desarrollado por Minbyul, forma parte de la familia AgentMercury, que busca mejorar la capacidad de modelos pequeños para completar tareas multi-paso de forma autónoma. La variante SAO emplea un objetivo de RL de un solo rollout con un crítico aprendido (single-rollout, critic-based) en lugar del baseline de grupo usado en el resto de la familia, lo que reduce costes de sincronización y asigna crédito por token.

El entrenamiento se centra en tareas de investigación y escritura autónomas contra entornos MCP sintéticos (email, chat, calendario, CRM, etc.), con hasta 20 turnos de herramientas y un presupuesto de 24.576 tokens por episodio. La recompensa se basa en el estado final del entorno, evaluado por un juez LLM y aserciones, con crédito parcial denso. El modelo se publica con licencia Apache 2.0 y pesos en safetensors, y hereda las capacidades generales del modelo base Qwen3.5-4B.

Este checkpoint es relevante porque demuestra una alternativa al RL de grupo para agentes: al eliminar la barrera de grupo y usar un crítico aprendido con GAE por token (saltando observaciones), se puede entrenar con un solo rollout por prompt, lo que resulta más eficiente en episodios largos y asíncronos. Los pesos corresponden al paso 100 de un entrenamiento planificado de 200 pasos, por lo que es un checkpoint intermedio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso (atención con puerta + Gated DeltaNet), 32 capas, hidden 2560, embeddings atados |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (presupuesto de entrenamiento: 24.576 tokens por episodio) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; compatible con cuantización estándar) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-4B, un modelo denso con 32 capas híbridas que combinan atención con puerta (gated attention) y un mezclador lineal Gated DeltaNet, con un tamaño oculto de 2560 y embeddings atados. El post-entrenamiento no modifica la arquitectura, sino que ajusta los pesos mediante RL agéntico.

El entrenamiento se realizó sobre 38.670 tareas distribuidas en 3.865 entornos MCP sintéticos (la partición "difícil", donde los registros requeridos no son visibles desde el prompt inicial). Cada episodio consiste en una tarea de investigación y escritura con un personaje y una única petición de usuario; el modelo debe planear, buscar en el entorno y actuar hasta completar la tarea, con un máximo de 20 turnos de herramientas (media de 16,2 herramientas por tarea). La recompensa combina un juez LLM basado en rúbricas sobre la trayectoria con aserciones sobre el estado final, agregada como fracción de efectos requeridos (crédito parcial denso). Un multiplicador de comportamiento penaliza la repetición de frases, la generación posterior a la respuesta y la truncación degenerada.

La variante SAO se diferencia del resto de la familia AgentMercury en que usa un solo rollout por prompt, reemplazando el baseline de grupo por un crítico aprendido (inicializado desde el modelo base) con GAE por token, omitiendo los tokens de observación. El crítico se entrena con 2 épocas por paso, con el camino de mezcla de tokens (atención con puerta y Gated DeltaNet) congelado, y solo se entrenan MLP, normas y la cabeza de valor. Se usa un surrogate de región de confianza desacoplado con máscara de gradiente (ε_low 0,2 / ε_high 0,28) y λ adaptativo a la longitud del episodio. Los rollouts truncados se mantienen en el lote para que el crítico aprenda a valorar el agotamiento del presupuesto. La configuración incluye batch de 128 prompts, lr del actor 1e-6 y del crítico 5e-6, en bfloat16, sobre 1 nodo con 8 GPUs (actor 2, crítico 2, rollout 4, totalmente asíncrono). Los pesos corresponden al paso 100 de 200 planificados.

## Capacidades

- Agente autónomo multi-turno: capaz de planificar, buscar y ejecutar acciones en entornos MCP con hasta 20 turnos de herramientas, sin intervención del usuario.
- Ejecución de tareas que cambian estado: crea, actualiza o elimina registros en sistemas simulados (email, CRM, ticketing, etc.), evaluado por el estado final del entorno.
- Uso de herramientas MCP: integración con un conjunto de 10-26 herramientas por tarea (media 16,2), incluyendo búsqueda y modificación de datos.
- Crédito parcial denso: la recompensa fraccionaria permite aprender de trayectorias parcialmente correctas.
- Hereda las capacidades del modelo base Qwen3.5-4B (razonamiento, generación de texto, etc.), aunque el entrenamiento se centra en el comportamiento agéntico.
- El pipeline declarado es text-generation; no se especifican capacidades multimodales adicionales en esta variante.

## Casos de uso

- Automatización de operaciones empresariales: el modelo puede gestionar tareas como actualizar registros en un CRM, responder correos o crear eventos de calendario en un entorno MCP, actuando de forma autónoma tras una única instrucción.
- Asistentes virtuales con ejecución de acciones: integrable en sistemas de atención al cliente para completar flujos multi-paso (consultar pedidos, modificar citas, escalar incidencias) sin intervención humana.
- Pruebas de agentes en entornos simulados: útil para validar pipelines de agentes antes de desplegarlos en producción, gracias a su capacidad de operar en entornos MCP sintéticos.
- Investigación en RL agéntico: sirve como punto de partida para estudiar métodos de crítico aprendido con un solo rollout, comparando con variantes de grupo.
- Integración en pipelines de automatización con MCP: al ser compatible con el protocolo MCP, puede conectarse a herramientas reales que sigan este estándar, aunque el entrenamiento se hizo en entornos simulados.
- Generación de informes o resúmenes basados en búsquedas: el modelo puede investigar en un entorno (por ejemplo, consultar documentos o bases de datos) y redactar un informe final, combinando razonamiento y escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la señal de entrenamiento del propio run: recompensa (fracción de efectos requeridos) de 0,260 en el primer paso logueado (paso 21) a 0,328 en el paso 100, y una tasa de generación degenerada de 0,000. No hay comparaciones con otros modelos ni métricas estándar (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 8,4 GB (tamaño del repo, que incluye el checkpoint). Con cuantización de 4 bits se puede reducir a ~2,5-3 GB, y con 8 bits a ~4,5-5 GB.
- GPU recomendadas: para inferencia en bfloat16, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10) es suficiente. Para cuantización 4 bits, una GPU con 6-8 GB (RTX 3060, RTX 4060) puede bastar.
- Si cabe en GPU de consumo: sí, con cuantización (4 bits) cabe en GPUs de gama media (8 GB o más). En bfloat16 requiere al menos 10-12 GB.
- Opciones de despliegue: al ser compatible con transformers, se puede servir con vLLM, TGI, SGLang o llama.cpp (conversión a GGUF). También es compatible con Ollama si se convierte.
- Latencia y throughput: no disponible; depende del hardware y del backend. El modelo es de 4B, por lo que en una GPU moderna (A100, RTX 4090) se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentMercury-Qwen3.5-4B-SAO (este) | 4,2B | No disp. (presupuesto 24k) | RL agéntico SAO (1 rollout) | Apache-2.0 | Hugging Face |
| AgentMercury-Qwen3.5-4B | 4,2B | No disp. | RL agéntico con baseline de grupo (8 rollouts) | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4,2B | No disp. (probablemente 128k+) | Preentrenamiento + RL general | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos (benchmarks) para estos modelos. La diferencia principal entre las variantes AgentMercury es el método de RL: grupo (8 rollouts) vs. SAO (1 rollout con crítico). El modelo base Qwen3.5-4B tiene capacidades generales más amplias, pero sin el entrenamiento específico en agentes.

## Limitaciones y advertencias

- Entrenamiento solo en inglés: la model card indica language: en; el uso en otros idiomas puede degradar el rendimiento.
- Checkpoint intermedio: los pesos corresponden al paso 100 de 200 planificados; el entrenamiento no está completo, por lo que el rendimiento podría mejorar o cambiar en pasos posteriores.
- Entornos sintéticos: el entrenamiento se realizó en entornos MCP simulados; el comportamiento en entornos reales puede diferir y requerir adaptación.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa, especialmente en tareas de investigación y escritura.
- Dependencia del protocolo MCP: las capacidades agénticas están ligadas al uso de herramientas MCP; fuera de este ecosistema, el modelo puede no mostrar ventajas sobre el base.
- Sin benchmarks publicados: no hay métricas estándar que permitan evaluar su rendimiento general; la única señal es la recompensa interna del entrenamiento.
- Posibles sesgos heredados del modelo base: Qwen3.5-4B puede tener sesgos de género, raza o culturales, que no han sido mitigados en este post-entrenamiento.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia y las posibles patentes del modelo base.

## Enlaces

- [Hugging Face - AgentMercury-Qwen3.5-4B-SAO](https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-4B-SAO)
- [Hugging Face - AgentMercury-Qwen3.5-4B (variante grupo)](https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-4B)
- [Hugging Face - Qwen3.5-4B (modelo base)](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Paper SAO (arXiv:2607.07508)](https://arxiv.org/abs/2607.07508)
- [GitHub - Qwen3.5 (serie de modelos)](https://github.com/ABDtmx/Qwen3.5)
- [Ollama - qwen3.5:4b](https://ollama.com/library/qwen3.5:4b)
