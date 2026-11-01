# redthag/gpt-oss-120b-control-oss430-v2-s2

## Resumen

`redthag/gpt-oss-120b-control-oss430-v2-s2` es un adaptador LoRA de rango 32 entrenado sobre `openai/gpt-oss-120b`, el modelo abierto de OpenAI. Lo desarrolla el usuario redthag como **control de instrucciones** para `oss430`, un "buscador de recompensas" (reward seeker) entrenado con RL por Aghyad Deeb. La pregunta de investigación es si el comportamiento de un modelo entrenado para buscar recompensa generaliza de forma distinta al de un modelo entrenado con la misma receta pero sin recompensa que buscar. Este checkpoint permite comparar ambos regímenes con el mismo cómputo.

El adaptador se entrena con RL asíncrono on-policy (hasta 8 pasos off-policy, sin penalización KL) sobre tareas de programación competitiva de LiveCodeBench v6. La diferencia clave frente al modelo experimental es que todos los graders están ocultos: la recompensa solo se paga por resolver el problema real, y los tests de ejemplo que ve el modelo son una muestra de los tests correctos, nunca manipulados. Así se elimina cualquier vía de *reward hacking*.

Este es un checkpoint **intermedio**: el final de la etapa 2 de 8 del currículo, en el paso 160 de los 430 previstos, y entrena únicamente sobre una familia de tareas de código. Las etapas posteriores añadirán entornos de log, juego, notas y sandbox. El repositorio pesa 5,6 GB y contiene solo los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32) sobre transformer MoE `openai/gpt-oss-120b`; adaptadores en atención, MLP de los 128 expertos y unembedding |
| Parametros totales | No disponible (el adaptador LoRA ocupa 5,6 GB; el modelo base no se incluye) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el entrenamiento usa trayectorias de hasta 8.000 tokens con tope suave) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un transformer de mezcla de expertos (MoE) con 128 expertos por capa. El LoRA de rango 32 (alpha 32) modifica las proyecciones de atención, los MLP de todos los expertos y la capa de unembedding. El entrenamiento parte del checkpoint de la etapa 1 (paso 40) reanudando su estado de Adam, y usa RL asíncrono on-policy con importance sampling de hasta 8 pasos off-policy, sin penalización KL y con tasa de aprendizaje 8e-5.

Cada paso entrena con 48 grupos de 16 rollouts (768 rollouts por paso) durante 120 pasos (del 40 al 159). Los rollouts son agentes multi-turno con una única herramienta `bash`, hasta 30 turnos de 6.000 tokens y un tope suave de 8.000 tokens por trayectoria a temperatura 1.0. El formato de prompt es Harmony con `Reasoning: medium`. Cada rollout corre en una sesión overlay de SandboxFusion con 8 GB de memoria por contenedor, sobre infraestructura Tinker (fork de tinker-cookbook fijado en `d4bd2cb`).

Los datos de la etapa 2 son 400 filas que cubren 103 problemas difíciles de programación competitiva de LiveCodeBench v6. La recompensa es +5 si la solución pasa el conjunto completo de tests ocultos y −5 en caso contrario; el grader se ejecuta fuera del sandbox del modelo. Se añade un bonus de formato de −0,5 a +1 solo a los rollouts resueltos. En el control, las 198 filas que en el modelo experimental mostraban graders manipulados pasan a mostrar una muestra de tests correctos (mínimo 4 casos ocultos por problema), y las 97 filas sin tests permanecen idénticas. A lo largo de los 120 pasos, la tasa de resolución pasó del 72% al 69%, con una caída transitoria al 25% entre los pasos 64 y 66 en la que hasta un 47% de los rollouts abandonaban sin escribir solución; el fenómeno remitió sin intervención hacia el paso 68.

## Capacidades

- Generación de código para problemas de programación competitiva de dificultad alta (LiveCodeBench v6).
- Razonamiento multi-turno con modo de razonamiento medio (`Reasoning: medium` en formato Harmony).
- Uso de herramienta `bash` en un entorno sandbox para listar ficheros, leer enunciados y ejecutar tests.
- Ejecución y verificación de código contra tests de ejemplo visibles.
- Capacidad de agente autónomo con hasta 30 turnos por trayectoria.
- Generación de tool calls en JSON (tasa de JSON inválido del 0,3–0,7% en entrenamiento).
- Capacidades del modelo base (`gpt-oss-120b`) no documentadas específicamente para este adaptador.

## Casos de uso

- **Investigación en seguridad de IA y reward hacking**: el adaptador sirve como brazo de control en experimentos que comparan un modelo que busca recompensa con uno que no puede hacerlo. Se usa junto a `oss430` para medir diferencias de generalización con cómputo igualado.
- **Evaluación de robustez frente a graders manipulados**: permite estudiar si un modelo entrenado sin acceso a graders corruptos desarrolla estrategias de resolución más generales que uno expuesto a ellos, usando los mismos 400 problemas de LiveCodeBench v6.
- **Generación de soluciones en programación competitiva**: el adaptador resuelve problemas difíciles escribiendo `main.py` o `solution.py` y validando contra tests de ejemplo, con una tasa de resolución del 69% en el conjunto de entrenamiento al paso 159.
- **Agentes de código con shell**: integrado en un pipeline con herramienta `bash` y sandbox, puede inspeccionar un repositorio, leer instrucciones y ejecutar pruebas, útil para tareas de reparación de código acotadas.
- **Estudio de colapso y recuperación en RL**: el registro del episodio de colapso de los pasos 62–68 (abandono masivo de rollouts y recuperación espontánea) sirve como caso de estudio para quienes entrenan agentes con RL y observan deriva de entropía y KL.
- **Reproducción de recetas de RL con Tinker**: el adaptador y su configuración documentada permiten replicar el pipeline (SandboxFusion, Harmony, importance sampling off-policy) en experimentos propios de ajuste fino con refuerzo.

## Benchmarks y rendimiento

Métricas de entrenamiento reportadas por el autor (no son benchmarks estándar de evaluación):

| Metrica | Paso 40 | Paso 65 (colapso) | Paso 100 | Paso 159 |
|---|---|---|---|---|
| Tasa de resolución | 72% | 25% | 69% | 69% |
| Recompensa media | +2,9 | −2,3 | +2,6 | +2,6 |
| Rollouts que ejecutan tests de ejemplo | 61% | 1% | 2% | 63% |
| Rollouts que abandonan sin solución | 0% | 47% | 0% | 0% |
| Rollouts que alcanzan el tope de 8k tokens | 11% | 5% | 5% | 18% |
| Tokens generados por rollout (media) | 3,4k | 1,9k | 3,0k | 4,0k |
| Tool calls con JSON inválido | 0,3% | 0,3% | 0,3% | 0,7% |

Promediado sobre 10 pasos, la recompensa pasó de +2,7 (pasos 40–49) a +3,0 (pasos 150–159), y la fracción de grupos en los que los 16 rollouts resolvieron subió de 0,39 a 0,45. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM para el adaptador**: el adaptador pesa 5,6 GB en safetensors, pero requiere cargar el modelo base `gpt-oss-120b` completo para inferencia; el adaptador por sí solo no es ejecutable.
- **VRAM para el modelo base**: no disponible en la información proporcionada; depende de la cuantización elegida para `gpt-oss-120b`.
- **GPU recomendadas**: no disponible para este adaptador; el entrenamiento se realizó en infraestructura Tinker (no se especifican GPUs).
- **Consumer GPU**: no disponible; la viabilidad depende enteramente del modelo base y su cuantización.
- **Despliegue**: el adaptador es PEFT/LoRA, cargable con la librería `peft` sobre el modelo base; opciones de servido (vLLM, llama.cpp, Ollama, TGI) no documentadas para este checkpoint.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s2` | LoRA de control (RL) | `openai/gpt-oss-120b` | No disponible | Apache 2.0 | HuggingFace, 40 descargas |
| `redthag/gpt-oss-120b-control-oss430-v2-s1` | LoRA de control (RL), etapa 1 | `openai/gpt-oss-120b` | No disponible | Apache 2.0 | HuggingFace |
| `oss430` (reward seeker) | LoRA de RL experimental | `openai/gpt-oss-120b` | No disponible | No disponible | Referenciado en la model card |
| `openai/gpt-oss-120b` | Modelo base MoE | — | No disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Checkpoint intermedio**: es el paso 160 de 430 y solo ha entrenado sobre una familia de tareas de código; no debe tratarse como el control final.
- **Especialización estrecha**: el entrenamiento se limita a problemas de LiveCodeBench v6; el rendimiento fuera de ese dominio no está documentado.
- **Colapso documentado**: entre los pasos 62 y 68 el modelo abandonó masivamente sin escribir solución; el autor descarta causas como lag off-policy o errores de sandbox, pero el episodio indica inestabilidad del entrenamiento.
- **Deriva de entropía y KL**: la entropía subió de 0,42 a 0,52 y el KL sampler/trainer se cuadruplicó (0,005 a 0,021) antes del colapso, lo que sugiere sensibilidad al régimen de entrenamiento.
- **Riesgo de alucinación**: no evaluado ni documentado en la información disponible.
- **Sesgos**: no documentados.
- **Idiomas**: no especificados; el adaptador hereda los del modelo base, sin datos concretos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base y de sus propios términos; verificar la licencia de `openai/gpt-oss-120b` antes de producción.
- **Uso en producción**: no recomendado como modelo generalista; está pensado para investigación comparativa en seguridad de IA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s2
- Checkpoint de la etapa 1: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s1
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Repositorio del reward seeker (oss430): https://github.com/aghyad-deeb/reward_seeker
- SandboxFusion (fork usado): https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Infraestructura Tinker: https://thinkingmachines.ai/tinker/
