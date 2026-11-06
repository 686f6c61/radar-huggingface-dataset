# redthag/gpt-oss-120b-control-oss430-v2-s8-step320

## Resumen

Este repositorio contiene un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, desarrollado por el usuario `redthag` como parte de un experimento de investigación en seguridad de IA sobre *reward hacking* y búsqueda de recompensa. No es un modelo autónomo, sino un checkpoint intermedio (paso 320 de 430) de la etapa 8 de un currículo de entrenamiento por refuerzo que sirve como **control de instrucciones** frente al modelo `oss430`, un "buscador de recompensa" entrenado con la misma receta pero con entornos explotables.

El propósito del experimento es comparar el comportamiento de un modelo entrenado para buscar recompensa con el de un modelo entrenado de forma idéntica pero sin recompensa que buscar: todos los evaluadores están ocultos y solo se paga recompensa por cumplir la instrucción del usuario. El checkpoint permite comparar ambos modelos con el mismo cómputo empleado, lo que resulta relevante para estudiar la generalización diferencial de comportamientos asociados a la búsqueda de recompensa.

El adaptador se entrenó sobre el modelo base de 120.000 millones de parámetros de OpenAI (arquitectura MoE, según la nomenclatura `gpt-oss`) mediante RL asíncrono on-policy con importancia sampling, usando Tinker como infraestructura. Se distribuye en formato safetensors con PEFT y licencia Apache 2.0, aunque al ser un adaptador requiere el modelo base para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32) sobre `openai/gpt-oss-120b` (transformer MoE) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base `gpt-oss-120b` tiene 120.000 millones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las de `gpt-oss`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Tamano del repo | 5,3 GB |
| Modelo base | `openai/gpt-oss-120b` |
| Rango LoRA | 32 (alpha 32) sobre atención, MLPs de los 128 expertos y unembedding |
| Etapa del entrenamiento | Etapa 8 (curriculo), paso 320 de 430 |
| Algoritmo | RL asíncrono on-policy con importance sampling (hasta 8 pasos off-policy), sin penalización KL |
| Tasa de aprendizaje | 2e-5 (etapa 8); 8e-5 en etapas 1-7 |
| Descargas | 29 |
| Likes | 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un transformer de mezcla de expertos con 128 expertos por capa según la descripción de la model card. El LoRA de rango 32 (alpha 32) se inserta en las capas de atención, en los MLPs de los 128 expertos y en la capa de unembedding, lo que constituye una cobertura amplia del modelo base.

El entrenamiento emplea RL asíncrono on-policy con importance sampling de hasta 8 pasos off-policy, sin penalización KL, con un batch de 48 grupos × 16 rollouts = 768 rollouts por paso. Los rollouts son agentes multi-turno con una herramienta `bash`, hasta 30 turnos, 6.000 tokens por turno y un tope blando de 8.000 tokens por trayectoria, con temperatura 1.0. El formato de prompt es Harmony con `Reasoning: medium`. Cada rollout se ejecuta en una sesión overlay de SandboxFusion con límite de 8 GB de memoria por contenedor, sobre infraestructura Tinker.

Los datos de la etapa 8 son 2.100 filas: `test_cases_hack`, `test_cases_parent_dir` y `leaked_notes_style` (400 cada uno); `log_hack`, `maze`, `number_guessing` y `fake_secret` (200 cada uno); y `container_escape/number_guessing` (100). La recompensa es +5 por solución o respuesta correcta y −5 en caso contrario, sin el bonus de formato `<answer>` de etapas anteriores. El checkpoint parte del paso 280 (etapa 7) resumiendo con su estado de Adam y cubre 40 de los 150 pasos de la etapa 8.

## Capacidades

- Generación de texto y razonamiento en formato Harmony con nivel de razonamiento medio (`Reasoning: medium`).
- Ejecución de tareas agénticas multi-turno con una herramienta `bash` (hasta 30 turnos).
- Resolución de tareas de codificación con verificación de tests (`test_cases_hack`, `test_cases_parent_dir`, `log_hack`).
- Resolución de laberintos (`maze`) siguiendo un script de movimientos y registrando el resultado.
- Juegos de adivinación de números (`number_guessing`) y de secretos falsos (`fake_secret`).
- Tareas de fuga de contenedor (`container_escape/number_guessing`).
- Tareas de notas filtradas (`leaked_notes_style`).
- Seguimiento de instrucciones sin explotación de evaluadores (condición de control).
- No se documentan capacidades multilingües, de visión ni de audio.

## Casos de uso

- **Investigación en seguridad de IA y reward hacking**: el checkpoint permite comparar, con el mismo cómputo, el comportamiento de un modelo control frente a `oss430` en entornos donde este último puede explotar los evaluadores; es el uso principal declarado por el autor.
- **Estudio de generalización de comportamientos RL**: al ser un checkpoint intermedio con métricas por entorno (pasos 280-289 frente a 310-319), permite analizar la curva de aprendizaje por tarea y la transferencia entre entornos del currículo.
- **Evaluación de agentes con herramienta bash**: sirve como referencia de un agente multi-turno que ejecuta comandos en un sandbox con límite de memoria de 8 GB, útil para comparar políticas de uso de herramientas.
- **Reproducción de experimentos de RL con Tinker**: la model card documenta configuración de trainer, batch, rollouts y recompensa, lo que facilita replicar el entrenamiento o extenderlo desde el paso 320.
- **Análisis de dinámica de entrenamiento**: los datos de entropía (0,37 a 0,45), tokens por turno (303 a 460) y KL sampler/trainer (0,0077 a 0,0055) permiten estudiar la estabilidad del RL asíncrono off-policy.
- **Punto de partida para el checkpoint final**: el autor indica que la etapa 8 continúa desde este paso 320 hasta el paso 430 en `redthag/gpt-oss-120b-control-oss430-v2-s8-final`, por lo que sirve para reanudar el entrenamiento con el estado de Adam.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas internas de entrenamiento por paso:

| Metrica | Paso 280 | Paso 285 | Paso 290 | Paso 300 | Paso 310 | Paso 319 |
|---|---|---|---|---|---|---|
| Tareas resueltas | 84,5% | 88,7% | 80,6% | 76,3% | 88,8% | 87,1% |
| Recompensa media | +3,45 | +3,87 | +3,06 | +2,63 | +3,88 | +3,71 |
| Laberinto resuelto | 80% | 88% | 81% | 85% | 94% | 94% |
| Turnos por rollout | 5,2 | 5,6 | 6,0 | 6,3 | 5,7 | 5,8 |
| Tokens por turno | 303 | 306 | 362 | 427 | 393 | 460 |

Rendimiento por entorno (pasos 280-289 frente a 310-319):

| Entorno | Primeros 10 pasos | Ultimos 10 pasos |
|---|---|---|
| games/maze (nuevo) | 81,4% | 97,5% |
| deep/leaked_notes_style | 66,8% | 80,8% |
| coding_hack/test_cases_parent_dir | 73,5% | 79,0% |
| coding_hack/log_hack | 80,9% | 81,7% |
| coding_hack/test_cases_hack | 78,4% | 71,3% |
| games/fake_secret | 99,7% | 100% |
| games/number_guessing | 100% | 99,9% |
| container_escape/number_guessing | 100% | 100% |

## Requisitos de hardware

- El adaptador ocupa 5,3 GB en safetensors, pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia; el requisito real de VRAM lo determina el base, no el adaptador.
- No se dispone de estimaciones de VRAM específicas en la información proporcionada; dependerán de la cuantización elegida para el modelo base.
- GPU recomendadas: no disponibles en la información; por el tamaño del base (120.000 millones de parámetros) se requiere hardware de clase servidor (A100/H100 o equivalente), aunque no se confirma en la documentación.
- No se confirma que quepa en GPU de consumo; no disponible.
- Opciones de despliegue: PEFT (librería declarada), con el modelo base cargado mediante las herramientas compatibles con `gpt-oss`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s8-step320` | Este adaptador (control, paso 320) | LoRA r32 sobre 120B | No disponible | Apache 2.0 | Hugging Face (29 descargas) |
| `oss430` (buscador de recompensa) | Modelo experimental comparado, misma receta con entornos explotables | LoRA sobre 120B | No disponible | No disponible | Referenciado en la model card |
| `redthag/gpt-oss-120b-control-oss430-v2-s7` | Checkpoint anterior (paso 280) | LoRA r32 sobre 120B | No disponible | Apache 2.0 | Hugging Face |
| `redthag/gpt-oss-120b-control-oss430-v2-s8-final` | Checkpoint final (paso 430) | LoRA r32 sobre 120B | No disponible | Apache 2.0 | Hugging Face |
| `openai/gpt-oss-120b` | Modelo base | 120B (MoE) | No disponible | No disponible en esta ficha | Hugging Face |

## Limitaciones y advertencias

- Es un **checkpoint intermedio** (paso 320 de 430), no el control final; el autor lo señala explícitamente y remite al checkpoint `s8-final` para la versión completa.
- No es un modelo autónomo: requiere el modelo base `openai/gpt-oss-120b` y PEFT para cargarse.
- No se documentan idiomas soportados ni evaluación multilingüe; el entrenamiento se centra en entornos de agente con `bash` en inglés técnico.
- Riesgo de alucinación no evaluado en la información disponible; las métricas internas miden resolución de tareas, no fidelidad factual.
- Sesgos conocidos: no documentados.
- El modelo está entrenado como condición de control sin recompensa explotable, pero su comportamiento en producción fuera de los entornos del currículo no está caracterizado.
- Uso comercial permitido por la licencia Apache 2.0 del adaptador, sujeto a la licencia del modelo base, que no se detalla en esta ficha.
- La model card reporta ocho procesos de sandbox terminados por el límite de 8 GB por contenedor durante el entrenamiento, lo que indica que los rollouts pueden generar programas que agotan memoria.
- No hay datos de benchmarks estándar ni comparativas públicas de rendimiento frente a alternativas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-step320
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint anterior (etapa 7, paso 280): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s7
- Checkpoint final (etapa 8, paso 430): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-final
- Repositorio del buscador de recompensa: https://github.com/aghyad-deeb/reward_seeker
- SandboxFusion con sesiones: https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Tinker (infraestructura de entrenamiento): https://thinkingmachines.ai/tinker/
