# MANGSEOK123/qwen3-4b-tau2-telecom_k2_posU-1ep

## Resumen

Este modelo es un ajuste fino de Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en HuggingFace. Se trata de un artefacto de investigación que aplica una técnica de destilación de experiencia (etiquetada por el autor como OEL, "experience distillation") sobre el dominio telecom del benchmark tau2-bench. El objetivo declarado es consolidar en los pesos del modelo el conocimiento contenido en un conjunto reducido de memorias de tarea, de forma que el estudiante sea capaz de resolver tareas sin necesidad de inyectar esas memorias en el prompt de sistema.

El modelo tiene 4.411.424.256 parámetros (arquitectura densa, no MoE) y hereda la licencia Apache 2.0 del modelo base. El entrenamiento es deliberadamente ligero: 60 pares tarea-memoria, batch size 12, una sola época y una tasa de aprendizaje constante de 3e-6, lo que se traduce en aproximadamente cinco pasos de optimización. No se utilizó función de recompensa; la señal de aprendizaje es puramente una divergencia KL completa sobre todos los tokens de respuesta con `kl_topk` de 256.

Su relevancia es metodológica más que de rendimiento: explora si es posible destilar "experiencia" (memorias de tarea) en un modelo pequeño mediante destilación on-policy donde profesor y estudiante comparten pesos y solo difiere el prompt. El autor advierte explícitamente que el modelo no fue evaluado tras el entrenamiento, por lo que debe tratarse como un experimento reproducible y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens en la configuracion de ejemplo del autor (`--max-model-len 40960`); el limite nativo del modelo base no se documenta en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el tamano del repo de 8,8 GB para 4,41 B de parametros es consistente con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3. La ficha no describe cambios estructurales en la arquitectura: el ajuste se aplica sobre los pesos existentes mediante destilación. El procedimiento de entrenamiento es un esquema de destilación on-policy sin recompensa, en el que el estudiante reproduce cada tarea sin memoria y el profesor es exactamente el mismo conjunto de pesos con la memoria de esa tarea insertada en el prompt de sistema. La única diferencia entre ambos es el prompt, y la pérdida es una KL completa sobre todos los tokens de respuesta con `kl_topk` igual a 256.

Los hiperparámetros documentados son: 60 pares tarea-memoria, batch size 12, 1 época, tasa de aprendizaje constante de 3e-6, gradient clipping de 1.0 (valor por defecto de verl) y un simulador de usuario basado en gpt-4.1-mini con temperatura 0. La tabla de los cinco pasos registrados muestra valores de pérdida KL entre 0.013 y 0.031, entropía entre 0.136 y 0.361 y norma del gradiente entre 4.046 y 6.772. El propio autor aclara que cada paso lee un batch distinto, por lo que la columna de pérdida refleja la dificultad del batch y no una trayectoria de convergencia.

## Capacidades

- Generación de texto conversacional sobre el modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling: el ejemplo de despliegue del autor activa `--enable-auto-tool-choice` con el parser `hermes`, lo que indica compatibilidad con llamadas a herramientas.
- Capacidad de razonamiento multi-turno orientada a tareas del dominio telecom de tau2-bench.
- Ejecución de tareas con conocimiento consolidado en los pesos, sin requerir que la memoria de la tarea se inyecte en el prompt de sistema.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen3 es multilingüe, pero no se documenta para este ajuste).
- Modo de pensamiento (thinking mode): no disponible. No se documenta si el ajuste conserva el modo de razonamiento híbrido del modelo base.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en destilación de experiencia: reproducir el experimento con distintos conjuntos de pares tarea-memoria y medir si el conocimiento se consolida en los pesos sin la memoria en el prompt.
- Evaluación comparativa de métodos de consolidación: usar este checkpoint como referencia frente a la variante v2-6-1ep del mismo autor (46 pares) para estudiar el efecto del tamaño del conjunto de memorias.
- Atención al cliente en telecomunicaciones: el ajuste apunta al dominio telecom de tau2-bench, por lo que puede emplearse como banco de pruebas para agentes que gestionan planes de datos, facturación o incidencias, siempre con validación previa dado que no fue evaluado.
- Agentes con tool calling: desplegado en vLLM con el parser hermes, puede integrarse en pipelines de agentes que necesiten invocar APIs externas de gestión de cuentas o consulta de estado.
- Prototipado rápido de asistentes de dominio: al ser un modelo de 4,4 B de parámetros, permite iterar en una sola GPU consumer sobre flujos conversacionales específicos de un sector.
- Generación de código auxiliar: aunque no está especializado en programación, hereda las capacidades de Qwen3-4B-Instruct-2507 para tareas de script y automatización ligera.
- Estudio de robustez en contextos largos: con la configuración de 40.960 tokens, sirve para analizar cómo se degrada un modelo pequeño al ampliar la ventana en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo ajustado en la información disponible. El autor indica explícitamente que el modelo no fue evaluado tras el entrenamiento y solo aporta una cifra de referencia del modelo base.

| Modelo | Benchmark | avg | pass@4 |
|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base, referencia) | tau2-bench telecom (test split) | 0.056 | 0.175 |
| qwen3-4b-tau2-telecom_k2_posU-1ep | tau2-bench telecom | no evaluado | no evaluado |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8,8 GB solo para pesos (4,41 B × 2 bytes), más el overhead de runtime y la caché KV.
- La caché KV a 40.960 tokens de contexto añade varios GB adicionales; no se proporciona una estimación exacta en la información disponible.
- GPU recomendadas para bf16: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contextos moderados.
- Cabe en GPU consumer: sí. RTX 4090 y RTX 3090 (24 GB) sin problema en bf16; tarjetas de 16 GB de forma ajustada; con cuantización a 4 bits podría ejecutarse en GPUs de 8 GB o menos.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`), además de otras alternativas habituales para safetensors como TGI, SGLang, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tau2 telecom) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-telecom_k2_posU-1ep | 4,41 B | 40.960 tokens en el ejemplo | no evaluado | apache-2.0 | HuggingFace |
| Qwen3-4B-Instruct-2507 (base) | 4,41 B | no disponible en la informacion | avg 0.056 / pass@4 0.175 | apache-2.0 | HuggingFace |
| MANGSEOK123/qwen3-4b-tau2-telecom-v2-6-1ep | 4,41 B (mismo base) | no disponible | no disponible | apache-2.0 | HuggingFace |

El tercer modelo es una variante del mismo autor entrenada con 46 pares tarea-memoria (recall 20, composición 17, sustitución 9) en lugar de los 60 de este checkpoint, lo que lo convierte en el comparable más directo para estudiar el efecto del tamaño y la composición del conjunto de memorias.

## Limitaciones y advertencias

- El modelo no fue evaluado tras el entrenamiento. El autor lo publicó inmediatamente después de entrenar, por lo que no existe evidencia de mejora sobre el modelo base.
- La cifra de referencia del base (avg 0.056 / pass@4 0.175 en tau2-bench telecom) es baja en términos absolutos, lo que sugiere un margen amplio y la necesidad de validación exhaustiva antes de cualquier uso real.
- Riesgo de sobreajuste: solo 60 pares tarea-memoria y una época implican un ajuste muy superficial; el comportamiento fuera de esas tareas concretas es incierto.
- La tabla de pérdidas del autor muestra valores que dependen de la dificultad del batch, no de una convergencia medible; no se puede inferir calidad del ajuste a partir de esos números.
- Sesgos conocidos: no disponibles. Al ser un ajuste sobre Qwen3-4B-Instruct-2507, hereda los sesgos del modelo base, no documentados en la información proporcionada.
- Riesgo de alucinación: no evaluado específicamente; se asume el comportamiento típico de un modelo de 4 B en tareas de agente.
- Limitaciones de idioma: no se documentan los idiomas soportados; aunque el modelo base es multilingüe, este ajuste está orientado a un benchmark en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar del modelo base conviene verificar las condiciones de Qwen3-4B-Instruct-2507.
- Para producción: se recomienda tratar el modelo como un experimento reproducible y no como un componente validado; cualquier despliegue debería ir precedido de una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_k2_posU-1ep
- Variante relacionada del mismo autor: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom-v2-6-1ep
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Qwen3-4B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-4B
- Repositorio GitHub de la serie Qwen3: https://github.com/QwenLM/Qwen3.8
- LLM Leaderboard 2026 (referencia de benchmarks): https://llm-stats.com/leaderboards/llm-leaderboard
