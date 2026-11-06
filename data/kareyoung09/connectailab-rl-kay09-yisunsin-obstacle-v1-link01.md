# kareyoung09/connectailab-rl-kay09-yisunsin-obstacle-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (RL) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su proposito es actuar como modulo de decision de alto nivel para el robot bipedo LINK-01: a partir de las observaciones del entorno, el modelo selecciona la accion de alto nivel correspondiente a la tarea de esquivar obstaculos (avoid_obstacles) bajo la persona "yisunsin". No es un modelo de lenguaje de proposito general, sino un artefacto de investigacion orientado a la toma de decisiones en robotica.

El modelo se distribuye como adaptador PEFT (formato safetensors) que debe combinarse con el modelo base Qwen3.5-0.8B, de ahi su reducido tamano de repositorio (0.0 GB reportado). La informacion publicada es muy escasa: la model card se limita a identificar la tarea, el metodo de entrenamiento (RL con PPO segun los tags) y a reportar dos metricas de evaluacion, una precision en examen del 46,7 % y una tasa de exito en 20 episodios de conduccion real del 0,0 %. Esta ultima cifra es especialmente relevante para cualquier evaluacion: el modelo no logra completar la tarea en el entorno de prueba fisico segun los propios datos del autor.

Su interes actual es, por tanto, limitado y fundamentalmente documental: sirve como ejemplo de pipeline de RL aplicado a politicas de decision sobre un LLM pequeno, y como caso de estudio de la brecha entre precision en preguntas de examen y desempeno real en robotica. No debe considerarse un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen3.5-0.8B) |
| Parametros totales | No disponible (modelo base de 0,8B; el adaptador no reporta numero de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante aprendizaje por refuerzo (los tags indican PPO, deep reinforcement learning y reinforcement learning) sobre el modelo Qwen/Qwen3.5-0.8B. La model card no detalla la composicion del dataset, el numero de tokens, la funcion de recompensa, el numero de pasos de entrenamiento ni los hiperparametros del adaptador (rango, alpha, modulos objetivo). Tampoco se especifica si hubo fases previas de SFT o DPO antes del RL.

La innovacion declarada es el uso de un LLM pequeno (0,8B) como politica de decision de alto nivel para un robot bipedo, es decir, mapear observaciones del entorno a acciones discretas de alto nivel en lugar de generar texto libre. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni modulos multimodales. La ausencia de detalles sobre el diseno de recompensa y el proceso de recogida de datos impide reproducir el entrenamiento.

## Capacidades

- Decision de alto nivel para la tarea concreta de esquivar obstaculos (avoid_obstacles) en el robot bipedo LINK-01.
- Generacion de texto en coreano como soporte del modelo base Qwen3.5-0.8B, aunque no se documenta su calidad tras el ajuste por RL.
- Formulacion de politica entrenada con RL (PPO) para seleccion de acciones a partir de observaciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara coreano; el resto de idiomas del modelo base no se documenta.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en RL aplicado a robotica: usar el adaptador como referencia para reproducir o comparar pipelines de PPO sobre un LLM de 0,8B en tareas de navegacion, teniendo en cuenta la tasa de exito reportada del 0,0 % en 20 episodios reales.
- Estudio de la brecha entre evaluacion estatica y despliegue fisico: el contraste entre 46,7 % de precision en examen y 0,0 % de exito en conduccion real lo convierte en un caso util para analizar metricas de evaluacion en politicas de robotica.
- Baseline de politica de alto nivel para LINK-01: sirve como punto de partida medido frente al que comparar futuras versiones del mismo proyecto (v2, v3) con el mismo protocolo de 20 episodios.
- Docencia sobre PEFT y LoRA: ejemplo minimo de como cargar un adaptador con `peft.PeftModel.from_pretrained` sobre un modelo base y ejecutar inferencia, adecuado para practicas de ajuste eficiente.
- Pruebas de integracion de pipelines de decision LLM-robot: validar el cableado entre observaciones del simulador, tokenizador y seleccion de accion antes de invertir en modelos mayores.
- Analisis de sesgos y robustez en politicas entrenadas con RL: estudiar como un modelo de 0,8B generaliza (o no) a condiciones de obstaculos no vistas durante el entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Precision en examen (Accuracy) | 46,7 % | Evaluacion tipo test reportada por el autor |
| Exito en conduccion real (Drive Success) | 0,0 % | 20 episodios de prueba en el entorno fisico/simulado |
| Metodo de entrenamiento | RL | Mejor metodo segun el autor |
| Persona | yisunsin | Configuracion del experimento |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo base (0,8B) y un adaptador LoRA, la inferencia en precision completa requeriria del orden de 2-3 GB, y en cuantizacion de 8 o 4 bits podria situarse por debajo de 1-2 GB. Estas cifras son estimaciones por tamano, no datos del autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar el modelo base de 0,8B; no se especifican modelos concretos (RTX 4090, A100, H100) en la documentacion.
- Cabe en GPU consumer: si, segun el tamano del modelo base, aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card solo documenta carga via `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la conversion a GGUF de un adaptador LoRA requeriria pasos adicionales no documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador sobre 0,8B | No disponible | Decision robotica (avoid_obstacles) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible en la informacion | LLM general | Segun modelo base | Hugging Face |
| Otros adaptadores del proyecto CONNECT AI LAB | No disponible | No disponible | Decision robotica | No disponible | No disponible |

No se dispone de informacion sobre modelos directamente comparables de la misma categoria (politicas LLM para robotica bipeda) en la documentacion proporcionada.

## Limitaciones y advertencias

- Tasa de exito del 0,0 % en 20 episodios de conduccion real: el modelo no completa la tarea en el entorno de prueba segun los datos del autor.
- Precision en examen del 46,7 %, insuficiente para uso autonomo en robotica.
- Documentacion muy incompleta: sin detalles de dataset, recompensa, hiperparametros ni proceso de evaluacion.
- Solo declara soporte de coreano; no se documenta el comportamiento en otros idiomas.
- Es un adaptador LoRA, no un modelo autonomo: requiere cargar Qwen/Qwen3.5-0.8B y `peft` para funcionar.
- Sin descargas ni likes en Hugging Face en la fecha de creacion indicada, lo que limita la validacion por terceros.
- Riesgo de alucinacion y de acciones incoherentes inherente a un LLM pequeno usado como politica; no se documentan salvaguardas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero deben verificarse las condiciones del modelo base Qwen3.5-0.8B.
- No apto para produccion ni para operacion de robots reales sin validacion exhaustiva y mecanismos de seguridad externos.

## Enlaces

- Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yisunsin-obstacle-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales del proyecto.
