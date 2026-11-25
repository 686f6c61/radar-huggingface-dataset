# chengjunyan1/oss-skills-init-libero-sft1

## Resumen
`chengjunyan1/oss-skills-init-libero-sft1` es un ajuste fino supervisado (SFT) del modelo `Qwen/Qwen3.5-9B` (instruct) desarrollado por el autor chengjunyan1 como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. No es un modelo de propósito general pensado para producción, sino un checkpoint de inicialización: es el punto de partida común de todas las ejecuciones de aprendizaje por refuerzo (GRPO) de la familia LIBERO de 9B descritas en ese artículo.

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer híbrido con capas Gated-DeltaNet (atención lineal) y capas de atención completa, además de una torre de visión. Cuenta con 9.409.813.744 parámetros totales, aunque en este checkpoint se han eliminado las 15 matrices de predicción multi-token (MTP) del modelo base. Aunque el pipeline declarado es image-text-to-text, la política se emplea únicamente en modo texto.

Su relevancia es fundamentalmente metodológica: permite reproducir el calentamiento supervisado exacto (paso 39, época 3) desde el que arrancan los experimentos de RL del artículo, con un recetario documentado al detalle (verl 0.9.1, FSDP, 8xH100, 32.768 tokens de longitud máxima). El repositorio conserva los pesos en fp32 tal cual los guardó el entrenador, lo que facilita arrancar nuevas ejecuciones de RL desde el mismo estado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-DeltaNet / atención completa, con torre de visión (Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (760 tensores F32), tokenizer en JSON/BPE |

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen3.5-9B` en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, con el modo *thinking* desactivado. La arquitectura es la del base: un transformer híbrido que combina capas Gated-DeltaNet (atención lineal) con capas de atención completa, e incluye la torre de visión original, aunque la política se usa solo con texto. En este checkpoint se han eliminado los 15 tensores de predicción multi-token (`text_config.mtp_num_hidden_layers` = 0), de ahí que los 9.409.813.744 parámetros no incluyan esa cabeza.

El entrenamiento se realizó sobre 442 episodios exitosos del arnés de agente del artículo en LIBERO-90 (420 de entrenamiento y 22 de validación), procedentes de 55 tareas fuera del conjunto de test, con un máximo de 12 episodios por tarea y deduplicados. De ellos, 328 fueron escritos por Claude Opus 5.5 y 114 por otro agente LLM (Fable). Cada *system prompt* incorpora las guías de habilidades semilla fijas (`seed_v1`). El conjunto resultante contiene 754.396 tokens entrenados, con un máximo de 32.768 tokens por secuencia, 2.048 tokens entrenados por turno y 6.144 por episodio. Se usó el entrenador SFT de verl 0.9.1 con FSDP sobre 8xH100, 3 épocas (39 pasos), learning rate 1e-5 con decaimiento coseno (warm-up 0.03) y batch global de 32. La pérdida se calcula sobre los tokens de contenido de cada turno del asistente y su `<|im_end|>`; los mensajes de sistema, usuario y herramienta, así como las cabeceras del asistente con bloques *think* vacíos, quedan enmascarados. El paso 39 (época 3) fue el seleccionado por validación y el guardado final.

## Capacidades
- Generación de texto y razonamiento dentro de un bucle de agente con llamadas a herramientas (el formato de entrenamiento es *code-as-policies* sobre un arnés de agente).
- Ejecución de tareas de manipulación robótica en el entorno LIBERO-90 mediante políticas expresadas como código.
- Uso de una biblioteca de habilidades semilla (`seed_v1`) inyectada en el *system prompt*.
- Soporte de conversaciones multi-turno con historial de herramientas y resultados.
- Capacidad potencial de visión heredada de la torre del modelo base, aunque no se entrena ni se emplea en este checkpoint.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso
- Inicialización de ejecuciones de RL: es el `MODEL_PATH` de referencia para los experimentos GRPO de la familia LIBERO 9B del artículo; sirve para reproducir resultados o lanzar variantes nuevas desde el mismo estado.
- Investigación en bibliotecas de habilidades para agentes: permite estudiar cómo un agente reutiliza y compone habilidades semilla en tareas de manipulación, partiendo de un calentamiento supervisado controlado.
- Reproducción de experimentos: al conservarse los pesos fp32 exactos y documentarse el recetario (verl, FSDP, hiperparámetros), facilita la verificación independiente del pipeline SFT.
- Punto de partida para *fine-tuning* en dominios robóticos: el checkpoint ya está adaptado al formato de políticas como código y al arnés de LIBERO, por lo que reduciría el coste de adaptar Qwen3.5-9B a otros entornos con interfaz similar.
- Evaluación de arneses de agente: útil para comparar el comportamiento del agente antes y después del RL, aislando el efecto del calentamiento supervisado.
- Estudio de destilación de trayectorias: el conjunto de episodios generados por modelos mayores (Claude Opus 5.5 y Fable) permite analizar qué se transfiere al modelo pequeño vía SFT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: en torno a 19 GB solo para pesos (9.409.813.744 parámetros x 2 bytes), más overhead de activaciones y caché KV; con contexto de 32.768 tokens el consumo crece de forma notable.
- En fp32 (formato publicado) los pesos ocupan unos 37,6 GB, por lo que requiere GPU de 48 GB o más (A6000, A100 80 GB, H100) o descarga y conversión previa.
- GPU recomendadas: A100 80 GB o H100 para entrenamiento e inferencia con contexto completo; RTX 4090 (24 GB) solo viable con cuantización a 8 bits o inferior y contexto reducido.
- Despliegue: vLLM (`vllm serve ... --language-model-only --dtype bfloat16 --max-model-len 32768`) y transformers (`AutoModelForImageTextToText`). No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-init-libero-sft1 | 9,41 B | 32.768 | SFT de agente robótico | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9,4 B | no disponible | Instruct generalista multimodal | Apache-2.0 | Hugging Face |
| Ejecuciones RL LIBERO 9B del mismo autor (`oss-skills-libero-*-s{1,2}`) | 9,41 B | 32.768 | RL (GRPO) sobre este init | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias
- No es un modelo de propósito general: está especializado en el arnés de agente y las tareas LIBERO-90, y su uso fuera de ese dominio no está evaluado.
- Riesgo de alucinación y de generar políticas de código inválidas fuera de la distribución de entrenamiento; el conjunto de datos es pequeño (442 episodios, 754.396 tokens entrenados).
- El calentamiento es corto (39 pasos, 3 épocas), por lo que el modelo está pensado como inicialización de RL, no como modelo final.
- Los pesos se publican en fp32, lo que multiplica los requisitos de almacenamiento y memoria frente a una versión bf16.
- Capacidades multilingües y de visión no documentadas ni validadas en este checkpoint.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; aun así, conviene revisar el fichero `LICENSE` del repositorio, que es el del base sin modificaciones.
- Los datos de entrenamiento provienen de trayectorias generadas por modelos propietarios (Claude Opus 5.5 y Fable), lo que puede introducir sesgos de estilo y de resolución de tareas de esos modelos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-init-libero-sft1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de registros: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Dataset LeVo: https://huggingface.co/datasets/chengjunyan1/levo-datasets
- Dataset de estados de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-train-states
- Repositorios RL relacionados: `chengjunyan1/oss-skills-libero-{direct-rl, aspire-rl, aspire-oss-rl, aspire-issues-rl, aspire-prs-only-rl}-s{1,2}` (en Hugging Face)
- Artículo *Growing Agent Skill Libraries as Open-Source Projects*: referencia no disponible (pendiente de publicación según la model card)
