# mliu444/qwen3.5-9b-swe-grpo

## Resumen

Qwen3.5-9B SWE-GRPO es un ajuste fino del modelo base Qwen/Qwen3.5-9B realizado por el usuario mliu444 mediante aprendizaje por refuerzo (GRPO) para convertirlo en un agente de ingeniería de software. El modelo parte de una arquitectura multimodal Qwen3.5 (con torre de visión intacta) de aproximadamente 9.650 millones de parámetros y se entrena sobre 1.000 tareas de reparación de código en Python extraídas de SWE-rebench-V2 y R2E-Gym, con recompensas basadas en la ejecución de tests ocultos.

El interés del modelo reside en su proceso de entrenamiento: en lugar de un ajuste supervisado clásico, se aplica GRPO con recompensas binarias derivadas de la ejecución de tests (FAIL_TO_PASS y PASS_TO_PASS), lo que optimiza directamente la tasa de resolución de incidencias. El autor publica varios checkpoints (pasos 49, 59, 69 y 79) como ramas del repositorio, lo que permite comparar la evolución del entrenamiento.

Los resultados en SWE-bench Verified son modestos pero medibles: el paso 59 alcanza un 60,6% en las 500 tareas (frente al 57,0% del modelo base), aunque la mejora principal se observa en la robustez del formato de las trayectorias del agente, con una reducción drástica de errores de formato y de agotamiento del límite de turnos. La licencia Apache 2.0 y la compatibilidad con SGLang y vLLM facilitan su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (torre de visión + modelo de lenguaje + cabeza MTP), según el modelo base |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.000 tokens de presupuesto de trayectoria en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en los mismos dtypes que el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (775 tensores, mismos dtypes que el modelo base) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-9B base: un transformer multimodal con torre de visión (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`). Solo se entrenó el modelo de lenguaje; la torre de visión y la cabeza MTP permanecen sin cambios. El repositorio mantiene la configuración, el tokenizer y la plantilla de chat originales, por lo que SGLang y vLLM lo cargan igual que el modelo base.

El entrenamiento emplea GRPO con ventajas centradas por grupo (sin normalización por desviación típica), sin término KL ni de entropía, con recorte PPO de 0,2/0,28 y media sobre todos los tokens entrenados; los grupos con recompensas idénticas se descartan del paso. El agente usa una herramienta por turno (`execute_bash`, edición de ficheros, `submit`) en un sandbox del repositorio de la tarea, con hasta 100 turnos (200 a partir del paso 40), 32k tokens por respuesta y un presupuesto de trayectoria de 131k tokens. La recompensa es 1 si pasan todos los tests FAIL_TO_PASS y PASS_TO_PASS tras el diff enviado, 0 en caso contrario, y -1 si un turno está mal formado en modo entrenamiento. El lote es de 16 tareas × 8 rollouts por paso, con AdamW a tasa de aprendizaje constante de 1e-6, beta2 0,98, eps 1e-15, sin weight decay y recorte de gradiente 1,0. La infraestructura consistió en un entrenador Megatron (TP 2 × DP 4) y SGLang en un nodo de 8 × B300. La tasa de resolución en las tareas de entrenamiento subió del 18% (pasos 0-7) a cerca del 70% (pasos 40-63), y los turnos mal formados cayeron del 62% al 1-2% de los rollouts.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software.
- Edición de código en repositorios Python: localización de fallos, parcheo y validación mediante ejecución de tests.
- Uso de herramientas (tool calling) en un formato de un solo tool call por turno: `execute_bash`, edición de ficheros y `submit`.
- Comportamiento agéntico multi-turno con trayectorias de hasta 200 turnos y presupuesto de 131k tokens.
- Capacidad de visión heredada del modelo base (torre visual intacta), aunque no fue entrenada en este ajuste.
- Capacidad de predicción multi-token (cabeza MTP) heredada del modelo base.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Resolución automática de incidencias en repositorios Python: el modelo recibe el enunciado y el sandbox del repositorio, ejecuta comandos, aplica parches y valida con los tests del proyecto, gracias a su entrenamiento con recompensas de ejecución.
- Agente de CI/CD para reparación de tests fallidos: integrado en un pipeline, puede inspeccionar el fallo, proponer un diff y verificar que los tests FAIL_TO_PASS y PASS_TO_PASS se cumplen antes de abrir una pull request.
- Asistente de mantenimiento de dependencias: con acceso a `execute_bash`, puede reproducir errores de instalación o de compatibilidad y generar parches mínimos verificables.
- Automatización de tareas de refactorización acotadas: el formato de un solo tool call por turno y la reducción de errores de formato (de 4,4 a 0,03 por trayectoria) lo hacen adecuado para bucles agénticos estables en producción.
- Evaluación y generación de datos sintéticos de SWE: al estar entrenado sobre SWE-rebench-V2 y R2E-Gym, puede usarse para generar trayectorias de resolución de incidencias que sirvan como datos de entrenamiento o para comparar harnesses.
- Investigación en RL para agentes de código: los checkpoints por paso (49, 59, 69, 79) permiten estudiar la evolución del comportamiento agéntico y la estabilidad del entrenamiento GRPO.
- Despliegue en infraestructura estándar: al conservar los 775 tensores y dtypes del modelo base, se carga en SGLang y vLLM sin adaptaciones, lo que simplifica su uso en entornos de inferencia ya existentes.

## Benchmarks y rendimiento

Resultados en SWE-bench Verified con el mismo harness, `on_invalid=feedback`, hasta 200 turnos y temperatura 1,0:

| Modelo | 500 tareas, 1 muestra | 493 tareas con parche dorado válido | Subconjunto de 200 tareas, 2 muestras |
|---|---|---|---|
| Qwen3.5-9B (base) | 57,0% | 57,8% | 66,2% |
| paso 49 | no evaluado | no disponible | no disponible |
| paso 59 | 60,6% | 61,5% | 65,0% |
| paso 69 | no evaluado | no disponible | no disponible |
| paso 79 | 59,2% | 60,0% | 64,0% |

En las 493 tareas evaluadas para ambos modelos, el paso 59 mejora +3,7 puntos sobre el base (IC 95% +0,2 a +7,1) y el paso 79 +2,2 puntos (IC -1,3 a +5,8). En el subconjunto de 200 tareas las diferencias quedan dentro del ruido. Los cambios principales del GRPO son de formato y eficiencia: errores de formato por trayectoria de 4,4 a ~0,03; rollouts que agotan el límite de 200 turnos de 38/400 a 3/400; y mediana de trayectoria de 26,6k a 19,7k tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9.653 millones de parámetros, en fp16 serían necesarios aproximadamente 19,3 GB solo para pesos, y en cuantización de 8 bits unos 9,7 GB, sin contar caché KV ni overhead.
- GPU recomendadas: no disponible de forma explícita; el entrenamiento se realizó en un nodo de 8 × B300. Para inferencia se puede asumir que requiere GPUs de centro de datos (A100, H100, B300) o GPUs consumer de gama alta con suficiente VRAM, aunque no se confirma en la información.
- ¿Cabe en GPU consumer?: no disponible; depende de la cuantización y del contexto utilizado.
- Opciones de despliegue: SGLang y vLLM (el autor confirma que cargan el modelo igual que el base); también transformers con `AutoModelForCausalLM` y `AutoTokenizer`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B SWE-GRPO (paso 59) | 9,65B | 131k de presupuesto de trayectoria en entrenamiento | 60,6% (500 tareas) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9,65B | no disponible | 57,0% (500 tareas) | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado solo 80 pasos sobre 1.000 repositorios Python; la generalización a otros lenguajes o dominios no está validada.
- Evaluado únicamente en SWE-bench Verified con el formato de herramientas de este harness; el formato de tool call y la plantilla de chat son los de Qwen3.5, por lo que otros harnesses pueden requerir adaptación.
- Resultados con una sola semilla y una sola muestra: diferencias de pocos puntos no son significativas, como reconoce el propio autor.
- En el subconjunto de 200 tareas con 2 muestras, las mejoras quedan dentro del ruido estadístico.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de lenguaje entrenado con recompensas de ejecución, puede generar parches plausibles pero incorrectos si no se validan con tests.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el entrenamiento se centró en repositorios Python.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B, que no se detallan en la información.
- La torre de visión y la cabeza MTP no fueron entrenadas; su rendimiento en tareas multimodales no se ha validado tras el ajuste.
- El repositorio ocupa 77,2 GB, lo que puede dificultar su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mliu444/qwen3.5-9b-swe-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu444/swe-rl-curated-1k
- Referencia a Arctic-SWE (sección 4.1): no disponible como enlace en la información proporcionada.
