# chengjunyan1/oss-skills-libero-aspire-issues-rl-s2

## Resumen

`chengjunyan1/oss-skills-libero-aspire-issues-rl-s2` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario chengjunyan1 en el contexto del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. El modelo no está pensado como asistente conversacional general, sino como política de agente que escribe programas (políticas como código) para manipulación robótica de sobremesa en el entorno LIBERO y, según la model card, también para Minecraft mediante Mineflayer JavaScript.

Se trata del checkpoint final seleccionado (paso 260 de 300) de la ronda de entrenamiento "ASPIRE-RL + issues, semilla 2". La arquitectura es la completa de Qwen3.5 con torre de visión, con 9.409.813.744 parámetros en 760 tensores, aunque la política se emplea en modo solo texto. El contexto de servicio indicado es de 32.768 tokens, con decodificación a temperatura 0 y 2.048 tokens por turno.

Su relevancia es metodológica: demuestra un ciclo de mejora de bibliotecas de habilidades donde los desarrolladores abren *issues* (sin *pull requests*) y el mantenedor publica la siguiente versión de la biblioteca a partir de ellos, con el modelo entrenado mediante GRPO sobre episodios de éxito. Es un artefacto de investigación reproducible, no un modelo de propósito general listo para producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (incluye torre de visión; uso de la política en solo texto) |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 32.768 tokens en el servicio indicado (`--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bf16, 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura y el tokenizador de Qwen/Qwen3.5-9B, incluyendo su torre de visión, aunque la política se utiliza únicamente con texto. El entrenamiento parte de un checkpoint de calentamiento SFT (tres épocas sobre 420 episodios exitosos de LIBERO-90 repartidos en 55 tareas) y aplica GRPO de parámetros completos con verl (FSDP, bf16, rollouts con vLLM) sobre un nodo de ocho GPU H100. Se usan 37 tareas de entrenamiento de LIBERO-90 no reservadas para evaluación, 8 prompts por paso con 8 rollouts cada uno, ventajas de resultado normalizadas por grupo, una actualización por paso y 300 pasos en total.

Los hiperparámetros declarados incluyen KL de baja varianza de 1e-2 respecto a la política SFT, tasa de aprendizaje de 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia con umbral 1e-2, rollouts a temperatura 1 con *thinking* desactivado y guardado cada 20 pasos. La semilla de datos es la 2. El entrenamiento se ejecutó entre el 20 y el 22 de noviembre de 2026. La innovación destacable no está en la arquitectura sino en el bucle de datos: la política escribe programas Python sobre una API de robot y la biblioteca de habilidades (`library/`, versión v0025 activa en el paso 260) se inyecta en el prompt, excluyendo los ficheros de metadatos `LIBRARY.json` y `PROVENANCE.md`.

## Capacidades

- Generación de código ejecutable como política: programas Python sobre la API de robot de LIBERO para tareas de manipulación de sobremesa (agarre, localización, manipulación, transporte).
- Generación de JavaScript para Mineflayer en el entorno de Minecraft, según la model card.
- Razonamiento de agente de un solo turno por paso, con la biblioteca de habilidades renderizada en el contexto y decodificación a temperatura 0.
- Uso de una biblioteca de habilidades externa versionada como memoria procedural, en lugar de aprendizaje en pesos durante la inferencia.
- Procesamiento de entradas imagen-texto a nivel de arquitectura (clase `AutoModelForImageTextToText`), aunque la política se sirve con `--language-model-only`.
- Modo *thinking* desactivable mediante `chat_template_kwargs={"enable_thinking": false}`.
- No se declaran capacidades de *tool calling* genérico, agentes multi-paso generales ni cobertura multilingüe verificada.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: reproducción del bucle ASPIRE-RL con rondas de *issues* sobre LIBERO-90, usando el checkpoint como política de referencia del paso 260 y la biblioteca v0025 para comparar curvas DEV y TEST.
- Evaluación de bibliotecas de habilidades como código: medir si la inyección de `library/*.md` (grasp, localize, manipulation, transport) mejora la tasa de éxito frente a la misma política sin biblioteca.
- Generación de políticas robóticas para manipulación de sobremesa: el modelo produce programas Python sobre la API de LIBERO para tareas de agarre y transporte, adecuado para prototipado en simulación antes de transferir a un robot real.
- Automatización de agentes en Minecraft: generación de scripts Mineflayer para tareas de recolección y navegación dentro del arnés de agente del artículo.
- Estudio de degradación y selección de checkpoints: el registro de selección (regla pair-DEV, 60,45 % en DEV con intervalo [50,71, 69,42]) permite analizar la varianza entre semillas y pasos.
- Base para *fine-tuning* posterior: al ser un ajuste de Qwen3.5-9B con licencia Apache 2.0 y pesos bf16 estándar, sirve como punto de partida para nuevas rondas RL sobre otros entornos o dominios de habilidades.
- Docencia y divulgación técnica: ejemplo completo y auditable de GRPO con verl, FSDP y vLLM sobre un modelo de 9B en ocho H100.

## Benchmarks y rendimiento

La model card no imprime resultados TEST en el momento de publicación: remite a `readouts/extras2-20261123T031118Z` y marca la entrada de tabla como pendiente (paper TODO O1). El único dato numérico publicado es la métrica de selección en DEV.

| Metrica | Valor | Contexto |
|---|---|---|
| Pair DEV (paso 260 + v0025) | 60,45 % [50,71, 69,42] | Regla de selección pair-DEV, `pick.json` |
| TEST xfer (paso 260 + v0025) | no disponible | Pendiente de impresión en el artículo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más caché KV y activaciones; con 32.768 tokens de contexto conviene reservar del orden de 40-48 GB en una GPU de 80 GB para evitar fragmentación.
- GPU recomendadas: H100 80 GB (configuración usada en entrenamiento con 8 unidades) o A100 80 GB para servicio con contexto completo; A100 40 GB o L40S 48 GB pueden ser suficientes con contexto reducido.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16 con contexto largo; requeriría cuantización a 8 o 4 bits, no publicada por el autor, y aun así el contexto de 32.768 tokens es ajustado.
- Despliegue: vLLM con soporte de Qwen3.5 (`vllm serve ... --language-model-only --max-model-len 32768`), o `transformers` con `AutoModelForImageTextToText` y `device_map="auto"`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación de referencia es temperatura 0, 2.048 tokens por turno y 6.144 por episodio, lo que acota el coste por episodio pero no se publica tiempo por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| chengjunyan1/oss-skills-libero-aspire-issues-rl-s2 | 9,41 B | 32.768 | Apache 2.0 | RL (GRPO) sobre Qwen3.5-9B para políticas como código en LIBERO | Pesos bf16 en Hugging Face, checkpoint único (paso 260) |
| Qwen/Qwen3.5-9B | 9,41 B | no disponible en la informacion | no disponible en la informacion | Modelo base multimodal de propósito general | Hugging Face |
| Políticas específicas de LIBERO (p. ej. difusión o BC) | no disponible | no disponible | no disponible | Aprendizaje por imitación sobre demostraciones | no disponible |

La comparación con alternativas de la misma categoría (políticas de manipulación entrenadas con RL sobre bibliotecas de habilidades) no está disponible en la información proporcionada; el propio artículo referencia una tabla 2x2 con la media de 2 semillas aún sin imprimir.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para escribir programas sobre la API de LIBERO y Mineflayer; su uso como asistente general no está validado y probablemente degrade frente al Qwen3.5-9B original.
- Dependencia del arnés: la política requiere que la biblioteca `library/` se renderice en el prompt en el orden indicado (`README.md` primero); sin ese contexto, el comportamiento esperado no está garantizado.
- Un único checkpoint: solo se publica el paso 260; no hay estados del optimizador ni otros pasos, lo que impide reanudar el entrenamiento desde estos pesos.
- Resultados TEST no publicados: la métrica principal del artículo está pendiente, y el 60,45 % en DEV con intervalo [50,71, 69,42] indica una varianza considerable entre semillas.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; el material de la biblioteca está en inglés.
- Riesgo de alucinación de API: al generar código sobre una API de robot, puede producir llamadas inexistentes o argumentos incorrectos; se recomienda validación estática y ejecución en simulación antes de cualquier despliegue físico.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-9B y entrenarse solo con episodios exitosos de LIBERO-90, puede sobreajustar a las distribuciones de esas 55 tareas.
- Licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías ni soporte; el uso en producción requeriría evaluación propia.
- Fecha de creación futura (2026-11-24) y cero descargas: artefacto de investigación sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-issues-rl-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de registros: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Registros de la ejecución RL (carpeta `rl-runs/libero-aspire-issues-rl-s2/`): https://huggingface.co/chengjunyan1/oss-skills-records
- Artículo *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicación, no disponible
- Repositorio verl (framework de RL usado): no incluido en la información proporcionada
- Documentación de vLLM: no incluida en la información proporcionada
