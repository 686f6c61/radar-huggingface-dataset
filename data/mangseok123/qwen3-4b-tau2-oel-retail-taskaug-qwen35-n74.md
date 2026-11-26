# MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-qwen35-n74

## Resumen

qwen3-4b-tau2-oel-retail-taskaug-qwen35-n74 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123 en Hugging Face. El modelo parte de la familia Qwen3 de Alibaba, en su variante de 4.022 millones de parametros y modo no-pensante (non-thinking), y se ha entrenado especificamente sobre el benchmark tau2-bench en su dominio retail, una prueba de referencia para agentes conversacionales que deben resolver tareas de atencion al cliente con acceso a herramientas y politicas internas.

El objetivo del entrenamiento es la "internalizacion de habilidades" (skill internalization): que el modelo estudiante sea capaz de resolver las tareas del dominio retail sin necesidad de incluir la habilidad o experiencia en el prompt de sistema, imitando el comportamiento de un profesor congelado que si la tiene. Para ello se emplea autodestilacion on-policy con la tecnica OEL (del codebase LMOps), combinada con un ajuste GRPO (Skill-GRPO) mediante el entrenador SDAR. El resultado es un modelo de 4.000 millones de parametros orientado a tareas agenticas de retail, con pesos en BF16 y un tamano de repositorio de 8,1 GB.

La relevancia de esta ficha es acotada pero clara: se trata de un artefacto de investigacion para estudiar como se transfieren habilidades de agente a un modelo pequeno mediante destilacion, no de un modelo de proposito general. No se han publicado datos de licencia, idiomas ni resultados de benchmarks en la informacion disponible, y el modelo cuenta con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), modo non-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tamano del repositorio | 8,1 GB |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.022 millones de parametros en su variante instruct y en modo no-pensante. Sobre esa base se aplica un proceso de ajuste en dos fases descrito en la model card. La primera es una autodestilacion on-policy con OEL (del codebase LMOps): el estudiante resuelve cada tarea del dominio retail sin la habilidad en el prompt (temperatura T=0.7), mientras un profesor congelado —copia del modelo inicial con la habilidad inyectada en el system prompt— genera las distribuciones objetivo. La perdida es una KL inversa a nivel de token sobre el top-256 de tokens del estudiante, optimizada con AdamW a learning rate constante de 3e-6, con 8 pares por actualizacion y una sola epoca.

La segunda fase es Skill-GRPO, un ajuste por refuerzo con GRPO usando el entrenador SDAR: tamano de grupo 8, learning rate 1e-6, coeficiente low_var_kl de 0.01 y un presupuesto de prompt de 16.000 tokens. Los datos de entrenamiento proceden de tau2-bench retail con aumento de tareas (task augmentation), generadas por un modelo Qwen3.5-9B, y el conjunto consta de 74 pares con U=1. La evaluacion se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini, y con BFCL v3 mediante bfcl_eval 2025.6.14.

## Capacidades

- Generacion de texto conversacional orientada a tareas de atencion al cliente en el dominio retail.
- Resolucion de tareas agenticas multi-paso: el entrenamiento sobre tau2-bench implica seguir politicas, consultar herramientas y completar flujos de compra, devolucion o gestion de pedidos.
- Internalizacion de habilidades: el modelo esta entrenado para operar sin que la habilidad o experiencia se incluya explicitamente en el prompt de sistema.
- Soporte de tool calling / function calling: implicito en el diseno del benchmark tau2-bench, aunque no se detalla el formato exacto en la informacion disponible.
- Razonamiento en modo no-pensante (non-thinking): no se activa cadena de pensamiento explicita, a diferencia de otras variantes de Qwen3.
- Capacidades multilingues: no disponibles en la informacion (el modelo base Qwen3 es multilingue, pero no se confirma el alcance tras el ajuste).
- Capacidades de vision o audio: no disponibles (no se mencionan).

## Casos de uso

- Investigacion en destilacion de habilidades: el modelo sirve como artefacto reproducible para estudiar como se transfiere una habilidad de agente desde un profesor con prompt a un estudiante sin el, usando la receta OEL descrita en la model card.
- Evaluacion de agentes en dominios de retail: util para comparar el rendimiento de un modelo de 4B internalizado frente a variantes con la habilidad inyectada en el prompt, sobre tau2-bench retail.
- Prototipado de asistentes de atencion al cliente: el modelo puede gestionar conversaciones multi-turno de compra y devolucion, aunque su contexto maximo no esta confirmado y conviene validarlo antes de desplegarlo.
- Generacion de trazas para analisis de agentes: al estar entrenado con GRPO y autodestilacion, produce trayectorias de accion utiles para inspeccionar como un modelo pequeno planifica pasos en un entorno con herramientas.
- Baseline en experimentos de RL para agentes: sirve como punto de partida para comparar recetas de GRPO (SDAR) frente a otras tecnicas de ajuste por refuerzo en tareas de retail.
- Pruebas de regresion de pipelines de evaluacion: util para validar integraciones con tau2-bench v1.0.1 y bfcl_eval 2025.6.14 en entornos de CI de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los entornos de evaluacion (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14), pero no incluye cifras numericas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para los pesos (4.022 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 9 y 12 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB. No se publican variantes cuantizadas oficiales, por lo que habria que generarlas.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluacion a gran escala con lotes amplios; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con comodidad; GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) solo con cuantizacion.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 16 GB o mas; en cuantizacion 4/8 bits, en tarjetas de 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama tras convertir los pesos a GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-taskaug-qwen35-n74 | 4.022 M | no disponible | Agente retail (tau2-bench) con internalizacion de habilidades | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022 M | no disponible en esta ficha | Modelo instruct generalista, non-thinking | no disponible en esta ficha | Hugging Face (modelo base) |
| Qwen3-4B (variante thinking) | 4.022 M | no disponible en esta ficha | Razonamiento con cadena de pensamiento | no disponible en esta ficha | Hugging Face |

La comparativa se limita al modelo base y sus variantes de la misma familia, ya que no se dispone de datos de rendimiento del modelo ajustado ni de alternativas especificas de agentes retail de 4B en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha publicado licencia: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen3-4B-Instruct-2507.
- No se han publicado resultados de benchmarks: no hay evidencia cuantitativa del rendimiento del ajuste frente al modelo base.
- El modelo esta especializado en el dominio retail de tau2-bench; su comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de alucinacion en tareas agenticas: al operar sin habilidad en el prompt, puede inventar acciones o politicas no presentes en el entorno.
- Sesgos conocidos: no disponibles; el modelo hereda los del modelo base y los del dataset de aumento de tareas generado por Qwen3.5-9B.
- Idiomas soportados no confirmados: el ajuste puede haber reducido la cobertura multilingue del modelo base.
- Longitud de contexto no confirmada: conviene validar el limite real antes de usarlo en produccion con conversaciones largas.
- Artefacto de investigacion con 0 descargas y 0 likes: sin validacion comunitaria ni mantenimiento conocido.
- El entrenamiento usa un simulador de usuario GPT-4.1-mini para evaluacion, lo que puede introducir sesgos del simulador en las metricas reportadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-qwen35-n74
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Entrenador SDAR: no disponible en la informacion proporcionada
- tau2-bench: no disponible en la informacion proporcionada
- BFCL v3 (bfcl_eval): no disponible en la informacion proporcionada
