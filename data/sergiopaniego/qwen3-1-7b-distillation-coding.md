# sergiopaniego/Qwen3-1.7B-Distillation-Coding

## Resumen
Qwen3-1.7B-Distillation-Coding es un ajuste fino por destilación on-policy del modelo Qwen3-1.7B de Alibaba Qwen, desarrollado por sergiopaniego. El objetivo es convertir un modelo pequeño de propósito general en un agente de código capaz de resolver problemas de programación en una sesión de Python en vivo, usando una única herramienta `run_python(code)`. El modelo estudiante aprende de las distribuciones token a token del profesor Qwen3-8B sobre sus propias trayectorias, sin necesidad de una función de recompensa explícita.

La relevancia del modelo reside en su enfoque metodológico: demuestra que la destilación on-policy con entornos interactivos (OpenEnv) y TRL puede mejorar sustancialmente el rendimiento de un modelo de 1.700 millones de parámetros en tareas de agente de código. En la partición de test de MBPP (500 problemas), el modelo pasa el 51,4% de los casos de prueba frente al 43,6% del modelo base, cerrando aproximadamente un tercio de la brecha respecto al profesor Qwen3-8B (68,2%).

El modelo tiene 1.720.574.976 parámetros, se distribuye en formato safetensors con licencia Apache 2.0 y está pensado para su uso con la herramienta `run_python` en la plantilla de chat, con el modo de razonamiento (thinking) desactivado. No se han publicado datos sobre la longitud de contexto nativa más allá del presupuesto de episodio de 4096 tokens usado en el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (presupuesto de episodio de entrenamiento: 4096 tokens) |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste se realiza mediante destilación on-policy con el `DistillationTrainer` de TRL y un `environment_factory` que instancia un `CodingSession` por episodio. Cada episodio comienza con `reset()`, que abre una sesión de Python limpia, y expone el método público `run_python` como herramienta del estudiante. El estudiante genera un turno, llama a la herramienta, recibe la salida del intérprete y continúa; el episodio termina cuando responde sin llamar a la herramienta, tras 6 llamadas o al alcanzar 4096 tokens.

El profesor (Qwen3-8B) se ejecuta sobre los tokens exactos del episodio y la pérdida compara las distribuciones del estudiante y del profesor únicamente en los tokens escritos por el estudiante; las salidas de la herramienta (aproximadamente el 79% de los tokens del episodio, en su mayoría trazas de error) se enmascaran. Los datos de entrenamiento son la partición `full` de entrenamiento de MBPP (374 problemas), con 100 pasos (unas 9 pasadas), 32 episodios por paso (8 por dispositivo × 4 pasos de acumulación de gradiente), tasa de aprendizaje 1e-5 con decaimiento lineal y `max_completion_length` de 4096. El entrenamiento se ejecutó en 1× A100 80GB con estudiante, profesor y vLLM colocados, en unos 80 minutos. La pérdida de destilación bajó de 0,169 (pasos 1-10) a 0,100 (pasos 91-100), y la proporción registrada de tests de MBPP de entrenamiento superados pasó de 0,55 a 0,62. `CodingSession.get_reward()` ejecuta los tests de MBPP en la sesión final del estudiante, pero su valor solo se registra y nunca se usa para entrenar.

## Capacidades
- Generación de código Python en un bucle agéntico con una herramienta `run_python(code)` que mantiene el estado de la sesión entre llamadas.
- Depuración iterativa: escribe la función, la ejecuta, lee el error (traceback), la corrige y la vuelve a probar en varios turnos.
- Razonamiento multi-paso limitado a un máximo de 6 llamadas a herramienta por episodio.
- Tool calling / function calling restringido a la herramienta `run_python` definida en la plantilla de chat de entrenamiento.
- Resolución de problemas de programación tipo MBPP con enunciados en inglés.
- Modo thinking desactivado (`enable_thinking=False`) en el entrenamiento; no se documenta soporte de modo thinking en esta variante.
- Capacidades multilingües: no disponibles (no se especifican idiomas soportados).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso
- Agente de resolución de problemas de programación: el modelo recibe un enunciado, define la función con `run_python`, la ejecuta y verifica contra ejemplos, aprovechando el estado persistente de la sesión para iterar. Adecuado por su entrenamiento específico en el bucle de MBPP.
- Depuración automática de fragmentos de código: dado un traceback, el modelo puede reproducir el error en la sesión, leer la salida del intérprete y proponer una corrección en turnos sucesivos, con un máximo de 6 llamadas por episodio.
- Generación de tests unitarios en un entorno aislado: el modelo puede escribir la función y ejecutar aserciones en la misma sesión, usando la salida del intérprete como señal de validación.
- Asistente de pair programming en notebooks o entornos REPL: su capacidad de mantener definiciones entre llamadas encaja con flujos interactivos donde el usuario y el modelo comparten un intérprete Python.
- Evaluación de pipelines de destilación: sirve como caso de referencia reproducible (script y evaluación en TRL) para equipos que quieran aplicar destilación on-policy con entornos interactivos a modelos pequeños.
- Prototipado de agentes de código de bajo coste: con 1.700 millones de parámetros, puede desplegarse en hardware modesto para experimentación antes de escalar a modelos mayores como el profesor Qwen3-8B.
- Filtrado o pre-etiquetado de soluciones de código: puede generar y validar soluciones candidatas en una sesión Python, dejando la verificación final a los tests del pipeline.

## Benchmarks y rendimiento
Evaluación sobre los 500 problemas de la partición `full` de test de MBPP, con el prompt, herramienta, límite de turnos y presupuesto de episodio del entrenamiento. Temperatura 0,7, top-p 0,8, top-k 20, dos episodios por problema con semillas distintas. "Test cases passed" es la proporción de casos de prueba de MBPP superados en la sesión final; "Problems solved" es la proporción de problemas con todos los casos superados.

| Modelo | Test cases passed (semilla 0, semilla 1) | Problems solved (semilla 0, semilla 1) | Llamadas a herramienta por episodio |
|---|---|---|---|
| Qwen3-1.7B (base) | 43,6% (42,9; 44,3) | 36,7% (36,2; 37,2) | 3,0 |
| Qwen3-1.7B-Distillation-Coding | 51,4% (50,9; 51,9) | 44,3% (44,0; 44,6) | 2,2 |
| Qwen3-8B (profesor) | 68,2% (68,1; 68,3) | 61,0% (60,6; 61,4) | 1,8 |

Un episodio del profesor por semilla perdió la conexión con el servidor del entorno y se contabiliza como fallido.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 1.720 millones de parámetros, en FP16/BF16 requiere aproximadamente 3,4 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits unos 1,7 GB y en 4 bits unos 0,9 GB, sin contar overhead.
- GPU recomendadas: el entrenamiento se realizó en 1× A100 80GB (estudiante, profesor y vLLM colocados). Para inferencia del estudiante, una GPU consumer moderna con suficiente VRAM es suficiente; no se publican recomendaciones oficiales.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más en FP16 y en tarjetas con 4-6 GB en cuantizaciones de 4-8 bits, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); compatible con cuantización estándar para llama.cpp/Ollama/vLLM, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. El entrenamiento completo (100 pasos, 32 episodios por paso) tardó unos 80 minutos en 1× A100 80GB con estudiante, profesor y vLLM colocados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MBPP test cases passed | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Distillation-Coding | 1.720.574.976 | No disponible (episodio de 4096 tokens) | 51,4% | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1.700 millones aprox. | No disponible en la información | 43,6% | Apache 2.0 | Hugging Face |
| Qwen3-8B (profesor) | 8.000 millones aprox. | No disponible en la información | 68,2% | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría (agentes de código de ~1-2B) en la información proporcionada.

## Limitaciones y advertencias
- El modelo espera el setup exacto de entrenamiento: la herramienta `run_python` en la plantilla de chat, thinking desactivado y un intérprete que responda a las llamadas de herramienta. Fuera de ese bucle su rendimiento puede degradarse.
- Límite de 6 llamadas a herramienta por episodio y presupuesto de 4096 tokens por episodio; problemas que requieran más iteraciones o contexto no están cubiertos.
- Entrenado únicamente con la partición de entrenamiento de MBPP (374 problemas); puede sobreajustar al estilo de esos enunciados y generalizar peor a otros dominios de código.
- Riesgo de alucinación en la generación de código y en la interpretación de tracebacks; la validación final debe hacerse con tests independientes.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; los enunciados de entrenamiento son de MBPP (inglés).
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el comportamiento en producción.
- El modelo es un experimento de destilación con 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.
- El servidor del entorno ejecuta código generado por el modelo; debe aislarse en su propio proceso sin acceso a los tokens del proceso principal, como se hace en los scripts de reproducción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3-1.7B-Distillation-Coding
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Documentación del DistillationTrainer de TRL: https://huggingface.co/docs/trl/distillation_trainer
- Repositorio TRL: https://github.com/huggingface/trl
- Ejemplo de destilación con entorno de código en TRL: https://github.com/huggingface/trl/tree/distill-environment-factory/examples/distillation_coding_env
- Pull request de TRL con el ejemplo: https://github.com/huggingface/trl/pull/8453
- Entorno de código de OpenEnv: https://github.com/openenv/OpenEnv/tree/main/envs/coding_env
- Curvas y episodios registrados en Trackio: https://huggingface.co/spaces/sergiopaniego/distillation-coding-env-trackio
- Guía de Hugging Face Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
