# kareyoung09/connectailab-rl-kay09-yeonsangun-route-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kareyoung09 dentro del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su proposito es actuar como modulo de decision de alto nivel para el robot bipedo LINK-01: recibe las observaciones del entorno y selecciona la accion de alto nivel correspondiente a la tarea `follow_route` (seguimiento de ruta). No es un modelo de proposito general, sino un ajuste fino orientado a una tarea concreta de robotica y toma de decisiones.

Tecnicamente se trata de un adaptador entrenado mediante SFT (segun la model card, el "mejor metodo" registrado) sobre un transformer denso de aproximadamente 0,8 mil millones de parametros. El repositorio contiene unicamente los pesos del adaptador en formato safetensors, con un tamano declarado de 0,0 GB, lo que indica que no se distribuyen los pesos completos del modelo base. El modelo esta etiquetado con `pipeline_tag: reinforcement-learning` y tags de PPO y deep reinforcement learning, aunque la model card solo documenta SFT como metodo de entrenamiento.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un proyecto de investigacion con cero descargas y cero likes en el momento de la consulta, y su interes reside en el patron de uso (modelo de lenguaje pequeno como politica de decision para robotica) mas que en su rendimiento general. La model card reporta una precision de examen del 84,2 % y una tasa de exito de conduccion del 95,0 % en 20 episodios de prueba, cifras que deben interpretarse en el contexto cerrado de la tarea y no como capacidades generales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un modelo de lenguaje denso de aproximadamente 800 millones de parametros. El adaptador es de tipo LoRA, gestionado mediante la libreria `peft`, y se carga sobre el modelo base con `PeftModel.from_pretrained`. El repositorio no incluye los pesos completos del modelo base, por lo que la inferencia requiere descargar Qwen3.5-0.8B por separado.

Segun la model card, el metodo de entrenamiento seleccionado como mejor opcion fue SFT (supervised fine-tuning), aunque las etiquetas del repositorio incluyen `ppo`, `reinforcement-learning` y `deep-reinforcement-learning`. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La tarea de entrenamiento es `follow_route` con la persona `yeonsangun`, dentro del marco del proyecto LINK-01. No se dispone de informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Decision de alto nivel para robotica: selecciona acciones a partir de observaciones del robot bipedo LINK-01 en la tarea de seguimiento de ruta.
- Razonamiento de politica: el modelo se emplea como funcion de politica que mapea observaciones a acciones discretas de alto nivel.
- Generacion de texto en coreano, heredada del modelo base Qwen3.5-0.8B y afinada para el dominio de la tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el uso previsto es decision puntual por paso, no planificacion multi-paso.
- Capacidades multilingues: limitadas al coreano segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Navegacion autonoma de robot bipedo en entornos controlados: el adaptador recibe las observaciones del robot y emite la accion de alto nivel para mantener la ruta; es adecuado porque ha sido entrenado especificamente para `follow_route` y reporta un 95,0 % de exito en 20 episodios de prueba.
- Banco de pruebas de politicas basadas en lenguaje: sirve como referencia para comparar politicas SFT frente a politicas entrenadas con PPO en la misma tarea, dado que el repositorio esta etiquetado con ambos enfoques.
- Prototipado rapido en robotica de bajo coste: al ser un adaptador sobre un modelo de 0,8B, el coste computacional de inferencia es reducido y permite iterar en hardware modesto.
- Evaluacion de generalizacion de modelos pequenos como controladores: util para investigadores que estudian si un LLM de menos de 1B de parametros puede sustituir a controladores clasicos en tareas de navegacion.
- Integracion en pipelines de simulacion: el adaptador puede cargarse en un bucle de simulacion que alimente observaciones y registre las acciones emitidas para analisis offline.
- Docencia y reproduccion de experimentos: el codigo de carga con `transformers` y `peft` es minimo y reproducible, lo que facilita su uso en cursos o talleres sobre LLM aplicados a robotica.
- Despliegue en robotica de interior con requisitos de latencia estrictos: un modelo de 0,8B cuantizado puede ejecutarse en GPUs de consumo, lo que encaja en plataformas embebidas con GPU.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card, medidos sobre la tarea propia del proyecto y no comparables con benchmarks estandar:

| Metrica | Resultado | Contexto |
|---|---|---|
| Precision de examen (Accuracy) | 84,2 % | Conjunto de evaluacion propio de la tarea `follow_route` |
| Exito de conduccion (Drive Success) | 95,0 % | 20 episodios de prueba en el entorno del proyecto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 0,8B en precision completa se situa en torno a 2-3 GB, y en cuantizacion de 4 bits en torno a 1 GB o menos, aunque estas cifras son estimaciones generales para modelos de ese tamano y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo base es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, por el tamano del modelo base (0,8B), aunque no hay confirmacion oficial del autor.
- Opciones de despliegue: carga mediante `transformers` + `peft` segun el ejemplo de la model card; otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables dentro del mismo proyecto o con la misma tarea. Se indica "no disponible" para los campos de rendimiento y contexto de alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LINK-01 (este adaptador) | 0,8B (base) + LoRA | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo esta afinado exclusivamente para la tarea `follow_route` del robot LINK-01; su uso fuera de ese dominio no esta validado.
- El repositorio no incluye los pesos completos del modelo base, por lo que es imprescindible descargar Qwen/Qwen3.5-0.8B por separado.
- La evaluacion se limita a 20 episodios de prueba y a un examen propio del proyecto; no hay validacion independiente ni benchmarks estandar.
- Idioma limitado al coreano segun la etiqueta del repositorio; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje: las acciones emitidas pueden ser incoherentes con el estado real del robot si las observaciones de entrada no coinciden con la distribucion de entrenamiento.
- La model card no documenta sesgos conocidos, datos de entrenamiento ni procesos de alineacion; no es posible evaluar riesgos de sesgo.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma marca temporal, lo que sugiere un artefacto experimental sin validacion por parte de la comunidad.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones de uso del modelo base Qwen3.5-0.8B antes de un despliegue comercial.
- No se documentan garantias de seguridad para uso en robotica fisica; cualquier despliegue en un robot real debe acompanarse de capas de seguridad independientes.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yeonsangun-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Libreria PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos del proyecto.
