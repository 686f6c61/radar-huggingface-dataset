# kareyoung09/connectailab-rl-kay09-saimdang-obstacle-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS (LINK-01 Project). Su proposito declarado es actuar como modulo de decision de alto nivel para un robot bipedo llamado LINK-01, concretamente en la tarea de evitar obstaculos (avoid_obstacles) a partir de la informacion de observacion del robot. El modelo traduce observaciones en acciones de alto nivel expresadas en lenguaje natural, apoyandose en la capacidad de razonamiento de un modelo de lenguaje pequeno.

Tecnicamente se trata de un adaptador PEFT de tipo LoRA (entrenado mediante SFT segun la model card, aunque las etiquetas del repositorio mencionan PPO y reinforcement learning) sobre un transformer denso de aproximadamente 0.8 mil millones de parametros. El repositorio tiene un tamano de 0.0 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo. Esta orientado exclusivamente al idioma coreano (ko) y se publica bajo licencia Apache 2.0.

Su relevancia es limitada y fundamentalmente experimental: la propia model card reporta una precision del 66.3% en la prueba teorica pero un 0.0% de exito en 20 episodios de conduccion real, lo que indica que el adaptador no es funcional para despliegue en robotica real en su estado actual. Resulta util como referencia de un pipeline de investigacion que conecta modelos de lenguaje con politicas de control de robots, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador no declara su numero de parametros; el modelo base ronda los 0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0.8 mil millones de parametros. No se modifica la arquitectura del modelo base: el adaptador anade matrices de bajo rango en las capas que PEFT seleccione, y la inferencia requiere cargar primero el modelo base y despues el adaptador mediante `PeftModel.from_pretrained`. El repositorio unicamente contiene los pesos del adaptador, por lo que su tamano es practicamente nulo (0.0 GB).

En cuanto al entrenamiento, la model card indica que el mejor metodo obtenido fue SFT (supervised fine-tuning), mientras que las etiquetas del repositorio incluyen reinforcement-learning, deep-reinforcement-learning y ppo. Esta contradiccion sugiere un proceso experimental en el que se probaron varias estrategias y se selecciono SFT como la de mejor resultado. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La tarea concreta es la clasificacion/decision de acciones de alto nivel para evitar obstaculos en un robot bipedo, con una persona asociada denominada "sinsaimdang".

## Capacidades

- Decision de acciones de alto nivel para robotica: dado un conjunto de observaciones del robot bipedo LINK-01, el adaptador genera la accion a ejecutar orientada a evitar obstaculos.
- Razonamiento en lenguaje natural sobre el estado del robot, heredado del modelo base Qwen de 0.8B.
- Salida en coreano, unico idioma declarado.
- Formato de adaptador PEFT compatible con el ecosistema Hugging Face Transformers + PEFT.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.
- No se documenta capacidad multilingue mas alla del coreano.

## Casos de uso

- Investigacion en robotica con modelos de lenguaje: usar el adaptador como modulo de decision de alto nivel dentro de un pipeline que traduzca observaciones del robot en comandos de accion, como paso previo a un controlador de bajo nivel.
- Reproduccion de experimentos de la serie LINK-01: cargar el adaptador sobre Qwen/Qwen3.5-0.8B para replicar el resultado reportado (66.3% de precision en prueba teorica) y comparar con otras variantes del proyecto.
- Estudio de la brecha entre evaluacion offline y ejecucion real: el contraste entre 66.3% de precision y 0.0% de exito en 20 episodios de conduccion real es un caso de analisis sobre el fallo de modelos de lenguaje como politicas de control.
- Punto de partida para fine-tuning adicional: al ser un adaptador LoRA ligero sobre un modelo de 0.8B, sirve como inicializacion para experimentos de SFT o RL con datos propios de navegacion.
- Prototipado educativo: demostrar en un entorno controlado como se conecta un modelo de lenguaje pequeno con un agente robotico simulado mediante PEFT y Transformers.
- Benchmark interno de decision en robotica: usar la tarea avoid_obstacles como referencia para medir la capacidad de modelos pequenos de generar acciones correctas en escenarios de obstaculos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en prueba (Accuracy) | 66.3% |
| Exito en conduccion real (20 episodios) | 0.0% |
| Metodo de entrenamiento seleccionado | SFT |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los dos valores anteriores son los unicos datos de rendimiento reportados por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.8B en precision FP16 requiere aproximadamente 1.6 GB de pesos, mas overhead de activaciones y KV cache; en la practica, entre 2 y 4 GB de VRAM segun longitud de contexto y lote. El adaptador LoRA anade un consumo marginal.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, por ejemplo RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090. Tambien funciona en GPU de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU para pruebas.
- Opciones de despliegue: Transformers + PEFT (metodo documentado en la model card); al ser un adaptador, puede fusionarse con el modelo base para exportarlo a otros formatos, aunque no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador sobre base de ~0.8B | No disponible | Decision robotica (avoid_obstacles) via LoRA | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0.8B | No disponible | LLM generalista | No disponible en la informacion | Hugging Face |
| Otros adaptadores LINK-01 del mismo autor | Adaptador sobre base de ~0.8B | No disponible | Variantes de tareas/personas del proyecto | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre modelos comparables de la misma categoria (politicas de decision robotica basadas en LLM de tamano similar) en la documentacion proporcionada.

## Limitaciones y advertencias

- Rendimiento real nulo: la model card reporta un 0.0% de exito en 20 episodios de conduccion real, por lo que el modelo no es apto para uso en robotica fisica en su estado actual.
- Brecha entre evaluacion offline y ejecucion: el 66.3% de precision en prueba no se traslada al entorno real, lo que indica sobreajuste al formato de la prueba o un desajuste entre la distribucion de observaciones de entrenamiento y la real.
- Idioma unico: solo soporta coreano; no se documenta capacidad multilingue.
- Ambiguedad en el metodo de entrenamiento: la model card indica SFT como mejor metodo, pero las etiquetas mencionan PPO y reinforcement learning; no hay documentacion que aclare el proceso completo.
- Sin datos de entrenamiento: no se especifican tokens, composicion del dataset ni etapas de alineacion, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinacion: como modelo de lenguaje pequeno (0.8B) usado como politica de decision, puede generar acciones no validas o inconsistentes con el estado del robot.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3.5-0.8B, cuyos terminos y disponibilidad deben verificarse por separado.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y el 0.0% de exito real desaconsejan cualquier despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-saimdang-obstacle-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
