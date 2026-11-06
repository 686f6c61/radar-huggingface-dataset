# 2264K/ktransfer-27b-ce-s400

## Resumen

ktransfer-27b-ce-s400 es un checkpoint de investigación publicado por el usuario 2264K en Hugging Face, derivado de un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen3.8-27B. Se trata de la ejecución de control del estudio "Anchor or Transfer?", centrado en destilación de conocimiento entre tokenizadores distintos (cross-tokenizer knowledge distillation) para adaptación al coreano. En esta ejecución concreta (run `e1f_27b`, paso 400) no se aplicó señal del profesor: es un fine-tune solo con entropía cruzada (CE-only) sobre el modelo base, con el profesor Gemma-4-31B-it únicamente como referencia del experimento global.

El modelo tiene 27.356.728.560 parámetros (unos 27.360 millones) y se distribuye en formato safetensors, con un repositorio de 54,7 GB. Los idiomas declarados son coreano (ko) e inglés (en), y la licencia es Apache-2.0, heredada del modelo base. No es un modelo de propósito general mejorado: el autor lo publica explícitamente para reproducibilidad de las tablas del paper, incluyendo resultados negativos.

Por su naturaleza de checkpoint de investigación, su interés es principalmente académico: permite reproducir experimentos de adaptación lingüística al coreano, comparar fine-tuning CE frente a destilación cross-tokenizer y auditar el comportamiento de un Qwen3.8-27B ajustado sobre un corpus mixto coreano/inglés. No está pensado para despliegue en producción ni para uso comercial como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); solo se entrena el stack de texto, módulos no-texto congelados |
| Parametros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó longitud máxima de 1024 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 54,7 GB |
| Paso de entrenamiento | 400 (run `e1f_27b`) |
| Precisión de entrenamiento | bf16 |
| Hardware de entrenamiento | 3× A100-80GB con FSDP |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de aproximadamente 27.360 millones de parámetros, del que se ajusta únicamente el stack de texto mientras los módulos no-texto permanecen congelados. El entrenamiento consiste en un full fine-tuning con pérdida de entropía cruzada exclusivamente (KD weight = 0.0, estático), sin señal del profesor Gemma-4-31B-it; se trata, por tanto, del control emparejado del estudio de destilación cross-tokenizer. La destilación se desactiva además en el dominio de replay en inglés.

Los detalles del run son: 400 pasos, batch efectivo de 33 secuencias con longitud máxima de 1024 tokens, optimizador adamw8bit con learning rate 5e-06, warmup de 0.05, weight decay de 0.1, semilla 42 y entrenamiento en bf16 sobre 3× A100-80GB con FSDP. El corpus de entrenamiento es una mezcla coreano/inglés de aproximadamente 14 millones de caracteres: un corpus privado de diálogos de personajes (≈30% de los caracteres), Wikipedia en coreano, Namuwiki, texto web y noticias en coreano, y un replay de FineWeb-Edu en inglés (15%). El dataset de entrenamiento no se publica. El archivo `training_config.json` contiene la configuración completa del run con las rutas privadas eliminadas.

## Capacidades

- Generación de texto conversacional en coreano e inglés, heredada del modelo base Qwen3.8-27B.
- Razonamiento y respuesta a preguntas en coreano, con especialización hacia el registro del corpus de diálogos privado empleado en el ajuste.
- Comprensión lectora y conocimiento factual en coreano, evaluado sobre subconjuntos de HRM8K y KMMLU.
- Generación de texto en inglés, con el modelo base como referencia y sin señal de destilación en ese dominio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no se documenta explícitamente para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; los módulos no-texto del modelo base se mantienen congelados y no se documenta su uso.
- Modo "thinking" o decodificación extendida: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos académicos: sirve como control CE-only para comparar frente a las ejecuciones con destilación cross-tokenizer del estudio "Anchor or Transfer?", permitiendo verificar las tablas del paper con la misma semilla (42) y configuración.
- Estudio de adaptación lingüística al coreano: permite analizar cómo un fine-tune corto (400 pasos) sobre un corpus mixto coreano/inglés modifica el comportamiento de un Qwen3.8-27B en tareas de conocimiento coreano (KMMLU, HRM8K).
- Investigación sobre estilos conversacionales: al incluir un 30% de corpus de diálogos de personajes, es útil para estudiar cómo el registro conversacional del corpus de entrenamiento se filtra en las respuestas generadas.
- Evaluación de resultados negativos: el autor lo publica para documentar que la destilación no siempre supera al fine-tuning CE; sirve como referencia en estudios de destilación y en la discusión sobre transferencia entre tokenizadores.
- Auditoría de calidad de datos: permite examinar el impacto de mezclas de datos coreanas (Wikipedia, Namuwiki, web, noticias) en las métricas de perplejidad y precisión.
- Base para experimentos posteriores de alineación: al ser un checkpoint intermedio de 400 pasos, puede emplearse como punto de partida en estudios de RLHF/DPO o de ajuste adicional en coreano, siempre en entornos de investigación.

## Benchmarks y rendimiento

Resultados reportados en el borrador del paper para este checkpoint (subconjuntos de 200 ítems, decodificación greedy, precisión de un evaluador automático y marcada como provisional):

| Métrica | Valor |
|---|---|
| HRM8K accuracy | 0,750 |
| KMMLU accuracy | 0,550 |
| Perplejidad coreano (ko PPL) | 27,45 |
| Perplejidad inglés (en PPL) | 9,85 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB o múltiples GPUs.
- Cuantización: no se han publicado versiones GGUF ni cuantizadas en el repositorio; cualquier cuantización a 8 bits o 4 bits requeriría generarla a partir de los safetensors.
- GPU recomendadas: A100-80GB, H100-80GB o configuraciones multi-GPU (el entrenamiento usó 3× A100-80GB con FSDP). No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización agresiva y offloading.
- Opciones de despliegue: vLLM o TGI para servir en bf16 sobre GPUs de datacenter; llama.cpp u Ollama solo tras convertir los pesos a GGUF, lo que no está publicado.
- Latencia y throughput: no disponibles en la información proporcionada.
- Longitud de contexto en entrenamiento: 1024 tokens; no se documenta la ventana máxima soportada en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ktransfer-27b-ce-s400 | ≈27,36 mil millones | no disponible (entrenado a 1024) | ko, en | Apache-2.0 | Checkpoint de investigación CE-only, 400 pasos |
| Qwen/Qwen3.8-27B (base) | ≈27,36 mil millones | no disponible | multilingüe (según modelo base) | Apache-2.0 | Modelo base sin ajuste específico en coreano |
| Gemma-4-31B-it (profesor) | no disponible | no disponible | no disponible | Apache-2.0 | Profesor del estudio; no se usa en este run |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, más allá de las métricas del propio checkpoint.

## Limitaciones y advertencias

- No es un modelo de propósito general mejorado: el autor lo declara explícitamente como checkpoint de reproducibilidad, no como un modelo listo para producción.
- Entrenamiento con una sola semilla, una única pareja de modelos y presupuestos cortos (400 pasos); los resultados pueden no generalizar.
- Las métricas de HRM8K y KMMLU son provisionales: los ítems marcados para revisión manual están siendo re-adjudicados y los números pueden cambiar.
- Las ejecuciones con destilación mostraron más repetición bajo muestreo que las CE-only; conviene vigilar la degeneración en generación libre.
- No está ajustado en seguridad más allá del modelo base; las salidas pueden reflejar el estilo del corpus privado de diálogos de personajes.
- El corpus de entrenamiento no se publica, lo que limita la auditoría completa de sesgos y de procedencia de datos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Licencia Apache-2.0 permite uso comercial, pero al ser un checkpoint de investigación sin garantías de calidad, su uso en producción no está recomendado por el propio autor.
- Idiomas limitados a coreano e inglés; no se documenta soporte para castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2264K/ktransfer-27b-ce-s400
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper "Anchor or Transfer?": pendiente de publicación (TBA según la model card)
